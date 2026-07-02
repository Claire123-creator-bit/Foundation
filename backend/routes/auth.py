from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from website_models import Admin, db
from utils.responses import json_api_error
from utils.auth import get_auth_token, decode_token, create_admin_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/admin-login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return json_api_error("Missing credentials", 400)

    admin = Admin.query.filter_by(username=username).first()
    if not admin:
        admin = Admin.query.filter_by(email=username).first()
    if not admin or not check_password_hash(admin.password, password):
        return json_api_error("Invalid username or password", 401)

    if not admin.is_active:
        return json_api_error("Account deactivated", 401)

    token = create_admin_token(admin.id, admin.role)
    return jsonify(
        {"success": True, "name": admin.full_name, "username": admin.username, "token": token}
    ), 200


@auth_bp.route("/admin-register", methods=["POST"])
def admin_register():
    data = request.get_json(silent=True) or {}

    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)

    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)

    role = decoded.get("role")

    if role != "superadmin":
        return json_api_error("Forbidden", 403)

    required = ["username", "password", "full_name", "email", "phone", "role"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return json_api_error("Missing fields", 400)

    username = data["username"]
    if Admin.query.filter_by(username=username).first():
        return json_api_error("Admin already exists", 400)
    if Admin.query.filter_by(email=data["email"]).first():
        return json_api_error("Email already in use", 400)

    admin = Admin(
        username=username,
        password=generate_password_hash(data["password"]),
        full_name=data["full_name"],
        email=data["email"],
        phone=data["phone"],
        role=data.get("role", "admin"),
        is_active=True,
    )
    db.session.add(admin)
    db.session.commit()
    return jsonify({"success": True, "admin": admin.to_dict()}), 200


@auth_bp.route("/admin/list-admins", methods=["GET"])
def list_admins():
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded or decoded.get("role") != "superadmin":
        return json_api_error("Forbidden", 403)
    admins = Admin.query.all()
    return jsonify([a.to_dict() for a in admins]), 200


@auth_bp.route("/admin/delete-admin/<int:admin_id>", methods=["DELETE"])
def delete_admin(admin_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded or decoded.get("role") != "superadmin":
        return json_api_error("Forbidden", 403)
    admin = Admin.query.get(admin_id)
    if not admin:
        return json_api_error("Admin not found", 404)
    if admin.role == "superadmin":
        return json_api_error("Cannot delete superadmin", 403)
    db.session.delete(admin)
    db.session.commit()
    return jsonify({"success": True}), 200
