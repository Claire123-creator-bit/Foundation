from flask import Blueprint, jsonify, request
from datetime import datetime

from website_models import Member, db
from utils.responses import json_api_error, json_api_success
from utils.auth import get_auth_token, decode_token, create_member_token
from sms_service import send_bulk_sms

members_bp = Blueprint("members", __name__)


@members_bp.route("/member-login", methods=["POST"])
def member_login():
    try:
        data = request.get_json(silent=True) or {}
        national_id = data.get("national_id")
        phone_number = data.get("phone_number")

        if not national_id or not phone_number:
            return json_api_error("Missing credentials", 400)

        member = Member.query.filter_by(national_id=national_id, phone_number=phone_number).first()
        if not member:
            return jsonify({"success": False, "error": "Member not found"}), 404

        # Only approved members can log in
        if member.status != "approved":
            return jsonify({"success": False, "error": "Your account is not yet approved. Please wait for admin approval."}), 403

        token = create_member_token(member.id)

        return jsonify({"success": True, "member": member.to_dict(), "token": token}), 200
    except Exception:
        return json_api_error("Internal server error", 500)


@members_bp.route("/member-register", methods=["POST"])
def member_register():
    """Member self-registration endpoint."""
    try:
        data = request.get_json(silent=True) or {}
        
        required = [
            "full_names",
            "national_id",
            "phone_number",
            "county",
            "constituency",
            "ward",
            "physical_location",
            "category",
        ]
        missing = [k for k in required if not data.get(k)]
        if missing:
            return json_api_error(f"Missing fields: {', '.join(missing)}", 400)

        if Member.query.filter_by(national_id=data["national_id"]).first():
            return json_api_error("Member already exists", 400)

        member = Member(
            full_names=data["full_names"],
            national_id=data["national_id"],
            phone_number=data["phone_number"],
            email=data.get("email", ""),
            gender=data.get("gender", ""),
            county=data["county"],
            constituency=data["constituency"],
            ward=data["ward"],
            physical_location=data["physical_location"],
            category=data["category"],
            status="pending",
            created_by="self",
            is_verified=False,
        )
        db.session.add(member)
        db.session.commit()

        return jsonify({"success": True, "member": member.to_dict()}), 200
    except Exception as e:
        return json_api_error(f"Registration failed: {str(e)}", 500)


@members_bp.route("/members", methods=["GET"])
def list_members():
    try:
        members = Member.query.all()
        return jsonify([m.to_dict() for m in members]), 200
    except Exception:
        return jsonify([]), 200


@members_bp.route("/admin/pending-members", methods=["GET"])
def list_pending_members():
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)

    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)

    try:
        pending = Member.query.filter_by(status="pending").all()
        return jsonify([m.to_dict() for m in pending]), 200
    except Exception:
        return jsonify([]), 200


@members_bp.route("/admin/register-member", methods=["POST"])
def admin_register_member():
    """Admin registration of new member."""
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)

    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)

    # Allow both 'admin' and 'superadmin' roles
    role = decoded.get("role", "").lower()
    if role not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    data = request.get_json(silent=True) or {}

    required = [
        "full_names",
        "national_id",
        "phone_number",
        "county",
        "constituency",
        "ward",
        "physical_location",
        "category",
    ]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return json_api_error(f"Missing fields: {', '.join(missing)}", 400)

    if Member.query.filter_by(national_id=data["national_id"]).first():
        return json_api_error("Member already exists", 400)

    try:
        member = Member(
            full_names=data["full_names"],
            national_id=data["national_id"],
            phone_number=data["phone_number"],
            email=data.get("email", ""),
            gender=data.get("gender", ""),
            county=data["county"],
            constituency=data["constituency"],
            ward=data["ward"],
            physical_location=data["physical_location"],
            category=data["category"],
            status=data.get("status", "active"),
            created_by="admin",
            is_verified=data.get("is_verified", False),
        )
        db.session.add(member)
        db.session.commit()

        return jsonify({"success": True, "member": member.to_dict()}), 200
    except Exception as e:
        return json_api_error(f"Registration failed: {str(e)}", 500)


@members_bp.route("/admin/approve-member/<int:member_id>", methods=["POST"])
def approve_member(member_id):
    """Admin approves or rejects a pending member."""
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)

    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)

    # Allow both 'admin' and 'superadmin' roles
    role = decoded.get("role", "").lower()
    if role not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    data = request.get_json(silent=True) or {}
    action = data.get("action", "approve")

    try:
        member = Member.query.get(member_id)
        if not member:
            return json_api_error("Member not found", 404)

        if action == "approve":
            member.status = "approved"
            member.is_verified = True
        elif action == "reject":
            member.status = "rejected"
            member.is_verified = False
        else:
            return json_api_error("Invalid action", 400)

        db.session.commit()

        return jsonify({"success": True, "member": member.to_dict()}), 200
    except Exception as e:
        return json_api_error(f"Action failed: {str(e)}", 500)


@members_bp.route("/send-bulk-sms", methods=["POST"])
def send_sms_to_members():
    """Send SMS to members by category."""
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)

    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)

    # Allow both 'admin' and 'superadmin' roles
    role = decoded.get("role", "").lower()
    if role not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip() if data.get("message") else ""
    category = data.get("category", "").strip() if data.get("category") else ""

    if not message or len(message) == 0:
        return json_api_error("Message is required and cannot be empty", 400)

    try:
        # Get members by category or all if no category specified
        if category:
            members = Member.query.filter_by(category=category, status="approved").all()
        else:
            members = Member.query.filter_by(status="approved").all()

        if not members:
            return jsonify({"success": False, "error": "No approved members found in this category", "recipients": 0}), 404

        # Extract phone numbers
        phone_numbers = [m.phone_number for m in members if m.phone_number]

        if not phone_numbers:
            return jsonify({"success": False, "error": "No valid phone numbers found", "recipients": 0}), 404

        # Send SMS
        result = send_bulk_sms(phone_numbers, message)

        if result.get("success"):
            return jsonify({
                "success": True,
                "recipients": result.get("sent", 0),
                "total": result.get("total", 0),
                "message": f"SMS sent to {result.get('sent', 0)} members"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": result.get("reason", "Failed to send SMS"),
                "recipients": 0
            }), 400

    except Exception as e:
        return json_api_error(f"SMS sending failed: {str(e)}", 500)
