from flask import Blueprint, jsonify, request
from datetime import datetime
from sqlalchemy import text
import threading

from website_models import Activity, Meeting, MeetingAttendance, Admin, Member, db
from utils.responses import json_api_error
from utils.auth import get_auth_token, decode_token
from sms_service import send_bulk_sms, build_meeting_alert_message
from logger import app_logger

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

        # Send SMS to all approved members and active admins in background.
        member_phones = [m.phone_number for m in Member.query.filter(Member.status.in_(['approved', 'active'])).all() if m.phone_number]
        admin_phones = [a.phone for a in Admin.query.filter_by(is_active=True).all() if a.phone]
        recipients = list(dict.fromkeys(member_phones + admin_phones))
        if recipients:
            msg = build_meeting_alert_message(data["title"], data["date"], data["time"], data.get("venue", ""))

            def _send_and_log(recipients_list, message_text):
                try:
                    # Log recipients count and a small sample to help debugging
                    sample = recipients_list[:10]
                    app_logger.info("Initiating meeting SMS send", extra={"recipient_count": len(recipients_list), "sample": sample})
                    result = send_bulk_sms(recipients_list, message_text)
                    app_logger.info("Meeting SMS send result", extra={"result": result})
                except Exception:
                    app_logger.exception("Meeting SMS send encountered an exception")

            threading.Thread(target=_send_and_log, args=(recipients, msg), daemon=True).start()

        return jsonify({"success": True, "meeting": meeting_dict}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Failed: {str(e)}", 500)


@misc_bp.route("/meetings/<int:meeting_id>", methods=["PUT"])
def update_meeting(meeting_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return json_api_error("Meeting not found", 404)

    data = request.get_json(silent=True) or {}
    if not data:
        return json_api_error("No changes provided", 400)

    if "title" in data and data["title"]:
        meeting.title = data["title"]
    if "date" in data and data["date"]:
        meeting.date = data["date"]
    if "time" in data and data["time"]:
        meeting.time = data["time"]
    if "venue" in data:
        meeting.venue = data.get("venue", "")
    if "agenda" in data:
        meeting.agenda = data.get("agenda", "")
    if "meeting_type" in data:
        meeting.meeting_type = data.get("meeting_type", "physical")

    try:
        db.session.commit()
        return jsonify({"success": True, "meeting": meeting.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Update failed: {str(e)}", 500)


@misc_bp.route("/meetings/<int:meeting_id>", methods=["DELETE"])
def delete_meeting(meeting_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return json_api_error("Meeting not found", 404)

    try:
        for attendance in list(meeting.attendances):
            db.session.delete(attendance)
        db.session.delete(meeting)
        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Delete failed: {str(e)}", 500)


@misc_bp.route("/activities", methods=["GET"])
def list_activities():
    try:
        activities = Activity.query.filter_by(is_active=True).order_by(Activity.created_date.asc()).all()
        return jsonify([a.to_dict() for a in activities]), 200
    except Exception:
        return jsonify([]), 200


@misc_bp.route("/activities", methods=["POST"])
def create_activity():
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded or decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)
    data = request.get_json(silent=True) or {}
    if not data.get("title"):
        return json_api_error("title is required", 400)
    try:
        admin_id = decoded.get("admin_id")
        activity = Activity(
            title=data["title"],
            description=data.get("description", ""),
            location=data.get("location", ""),
            created_by=int(admin_id) if admin_id else None,
            is_active=True,
        )
        db.session.add(activity)
        db.session.commit()
        return jsonify({"success": True, "activity": activity.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        app_logger.exception("Create activity failed")
        return json_api_error(f"Failed: {str(e)}", 500)


@misc_bp.route("/activities/<int:activity_id>", methods=["DELETE"])
def delete_activity(activity_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded or decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)
    activity = Activity.query.get(activity_id)
    if not activity:
        return json_api_error("Section not found", 404)
    try:
        activity.is_active = False
        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Failed: {str(e)}", 500)
