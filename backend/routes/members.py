import os
from flask import Blueprint, jsonify, request

from website_models import Member, db
from utils.responses import json_api_error
from utils.auth import get_auth_token, decode_token, create_member_token
from sms_service import send_bulk_sms, send_sms, send_member_approval_sms
from logger import app_logger

members_bp = Blueprint("members", __name__)

ADMIN_PHONE = os.environ.get("ADMIN_PHONE", "")


@members_bp.route("/member-login", methods=["POST"])
def member_login():
    data = request.get_json(silent=True) or {}
    national_id = data.get("national_id")
    phone_number = data.get("phone_number")

    if not national_id or not phone_number:
        return json_api_error("Missing credentials", 400)

    member = Member.query.filter_by(national_id=national_id, phone_number=phone_number).first()
    if not member:
        return json_api_error("Member not found", 404)

    if member.status not in ["approved", "active"]:
        if ADMIN_PHONE:
            name = member.full_names.strip().title()
            send_sms(
                ADMIN_PHONE,
                f"Mbogo Foundation Alert: {name} ({member.phone_number}) "
                f"logged in and is awaiting your approval."
            )
        return json_api_error("Your account is not yet approved. Please wait for admin approval.", 403)

    token = create_member_token(member.id)
    return jsonify({"success": True, "member": member.to_dict(), "token": token}), 200


@members_bp.route("/member-register", methods=["POST"])
def member_register():
    data = request.get_json(silent=True) or {}

    required = ["full_names", "national_id", "phone_number", "county",
                "constituency", "ward", "physical_location", "category"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return json_api_error(f"Missing fields: {', '.join(missing)}", 400)

    if Member.query.filter_by(national_id=data["national_id"]).first():
        return json_api_error("National ID already registered", 400)
    if Member.query.filter_by(phone_number=data["phone_number"]).first():
        return json_api_error("Phone number already registered", 400)

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
            status="pending",
            created_by="self",
            is_verified=False,
        )
        db.session.add(member)
        db.session.commit()

        # Send confirmation SMS to the member
        name = member.full_names.strip().title()
        send_sms(
            member.phone_number,
            f"Welcome to Mbogo Welfare Empowerment Foundation! Dear {name}, "
            f"your registration has been received and is pending admin approval. "
            f"You will receive a welcome message once approved. Thank you!"
        )
        
        # Also notify admin
        if ADMIN_PHONE:
            send_sms(
                ADMIN_PHONE,
                f"Mbogo Foundation Alert: {name} ({member.phone_number}) "
                f"has registered and is awaiting your approval."
            )

        return jsonify({"success": True, "member": member.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
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
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    data = request.get_json(silent=True) or {}
    required = ["full_names", "national_id", "phone_number", "county",
                "constituency", "ward", "physical_location", "category"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return json_api_error(f"Missing fields: {', '.join(missing)}", 400)

    if Member.query.filter_by(national_id=data["national_id"]).first():
        return json_api_error("National ID already registered", 400)
    if Member.query.filter_by(phone_number=data["phone_number"]).first():
        return json_api_error("Phone number already registered", 400)

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
            status=data.get("status", "approved"),
            created_by="admin",
            is_verified=data.get("is_verified", False),
        )
        db.session.add(member)
        db.session.commit()
        
        # Send welcome SMS to member if created with approved status
        if member.status == "approved" and member.phone_number:
            name = member.full_names.strip().title()
            send_member_approval_sms(name, member.phone_number)
        
        return jsonify({"success": True, "member": member.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Registration failed: {str(e)}", 500)


@members_bp.route("/admin/approve-member/<int:member_id>", methods=["POST"])
def approve_member(member_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    data = request.get_json(silent=True) or {}
    action = data.get("action", "approve")

    member = Member.query.get(member_id)
    if not member:
        return json_api_error("Member not found", 404)

    previous_status = member.status

    if action == "approve":
        member.status = "approved"
        member.is_verified = True
    elif action == "reject":
        member.status = "rejected"
        member.is_verified = False
    else:
        return json_api_error("Invalid action", 400)

    try:
        db.session.commit()
        if action == "approve" and previous_status != "approved" and member.phone_number:
            name = member.full_names.strip().title()
            send_member_approval_sms(name, member.phone_number)
        return jsonify({"success": True, "member": member.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Action failed: {str(e)}", 500)


@members_bp.route("/admin/delete-member/<int:member_id>", methods=["DELETE"])
def delete_member(member_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    member = Member.query.get(member_id)
    if not member:
        return json_api_error("Member not found", 404)

    try:
        db.session.delete(member)
        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Delete failed: {str(e)}", 500)


@members_bp.route("/send-bulk-sms", methods=["POST"])
def send_sms_to_members():
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    category = (data.get("category") or "").strip()

    if not message:
        return json_api_error("Message is required", 400)

    try:
        # Query for eligible members
        query = Member.query.filter(Member.status.in_(["approved", "active"]))
        if category:
            query = query.filter_by(category=category)
        members = query.all()
        member_count = len(members)

        if not members:
            return jsonify({
                "success": False,
                "error": "No approved members found",
                "recipients": 0,
                "total": 0
            }), 200

        # Extract phone numbers from members
        phone_numbers = [m.phone_number for m in members if m.phone_number]
        valid_phone_count = len(phone_numbers)
        
        app_logger.info(
            "Bulk SMS request initiated",
            extra={
                "total_eligible_members": member_count,
                "members_with_phone": valid_phone_count,
                "category_filter": category or "all"
            }
        )

        if not phone_numbers:
            return jsonify({
                "success": False,
                "error": f"No valid phone numbers found ({member_count} members have no phone number)",
                "recipients": 0,
                "total": 0
            }), 200

        # Send SMS
        result = send_bulk_sms(phone_numbers, message)
        
        app_logger.info(
            "Bulk SMS result",
            extra={
                "success": result.get("success"),
                "sent": result.get("sent", 0),
                "total": result.get("total", 0),
                "reason": result.get("reason")
            }
        )

        if result.get("success"):
            sent_count = result.get("sent", 0)
            total_count = result.get("total", 0)
            return jsonify({
                "success": True,
                "recipients": sent_count,
                "total": total_count,
                "message": f"Queued to {sent_count} member{'' if sent_count == 1 else 's'}" if sent_count > 0 else "No messages sent"
            }), 200

        # SMS send failed
        return jsonify({
            "success": False,
            "error": result.get("reason", "Failed to send SMS"),
            "recipients": 0,
            "total": 0
        }), 200

    except Exception as e:
        app_logger.error(f"Bulk SMS send exception: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": f"SMS sending failed: {str(e)}",
            "recipients": 0,
            "total": 0
        }), 200
