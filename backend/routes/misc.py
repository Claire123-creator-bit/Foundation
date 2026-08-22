from flask import Blueprint, jsonify, request
from datetime import datetime
from sqlalchemy import text
import threading

from website_models import Activity, Meeting, Admin, Member, db
from utils.responses import json_api_error
from utils.auth import get_auth_token, decode_token
from sms_service import send_bulk_sms, build_meeting_alert_message

misc_bp = Blueprint("misc", __name__)


@misc_bp.route("/health", methods=["GET"])
def health():
    try:
        db.session.execute(text("SELECT 1"))
        database = "connected"
    except Exception:
        database = "disconnected"

    return (
        jsonify(
            {
                "status": "healthy" if database == "connected" else "unhealthy",
                "database": database,
                "timestamp": datetime.utcnow().isoformat(),
            }
        ),
        200,
    )


@misc_bp.route("/live", methods=["GET"])
def live():
    return jsonify({"alive": True, "timestamp": datetime.utcnow().isoformat()}), 200


@misc_bp.route("/ready", methods=["GET"])
def ready():
    try:
        db.session.execute(text("SELECT 1"))
        ok = True
    except Exception:
        ok = False

    return jsonify({"ready": ok, "timestamp": datetime.utcnow().isoformat()}), 200


@misc_bp.route("/me", methods=["GET"])
def get_me():
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)

    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)

    role = decoded.get("role")

    if role == "member":
        member = Member.query.get(decoded.get("member_id"))
        if not member:
            return json_api_error("Member not found", 404)
        return jsonify({
            "success": True,
            "role": "member",
            "status": member.status,
            "member": member.to_dict()
        }), 200

    admin = Admin.query.get(decoded.get("admin_id"))
    if not admin:
        return json_api_error("Admin not found", 404)

    return jsonify({"success": True, "role": admin.role, "admin": admin.to_dict()}), 200


@misc_bp.route("/meetings", methods=["GET"])
def list_meetings():
    try:
        meetings = Meeting.query.all()
        return jsonify([m.to_dict() for m in meetings]), 200
    except Exception:
        return jsonify([]), 200


@misc_bp.route("/meetings", methods=["POST"])
def create_meeting():
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)
    role = decoded.get("role", "").lower()
    if role not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)
    data = request.get_json(silent=True) or {}
    if not data.get("title") or not data.get("date") or not data.get("time"):
        return json_api_error("title, date and time are required", 400)
    try:
        meeting = Meeting(
            title=data["title"],
            date=data["date"],
            time=data["time"],
            venue=data.get("venue", ""),
            agenda=data.get("agenda", ""),
            created_by=decoded.get("admin_id"),
        )
        db.session.add(meeting)
        db.session.commit()
        meeting_dict = meeting.to_dict()

        # Send SMS to all approved members in background
        phones = [m.phone_number for m in Member.query.filter_by(status='approved').all() if m.phone_number]
        if phones:
            msg = build_meeting_alert_message(data["title"], data["date"], data["time"], data.get("venue", ""))
            threading.Thread(target=send_bulk_sms, args=(phones, msg), daemon=True).start()

        return jsonify({"success": True, "meeting": meeting_dict}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Failed: {str(e)}", 500)


@misc_bp.route("/activities", methods=["GET"])
def list_activities():
    try:
        activities = Activity.query.filter_by(is_active=True).all()
        return jsonify([a.to_dict() for a in activities]), 200
    except Exception:
        return jsonify([]), 200
