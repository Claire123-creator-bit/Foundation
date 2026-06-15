import os
from datetime import datetime

import jwt
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash

from website_models import Admin, Member, Media, db

# Single Flask app instance (gunicorn/import-safe)
app = Flask(__name__)

# --- CORS ---
# Frontend origin (production): https://www.mbogofoundation.org
# This unblocks browser preflight (OPTIONS) for cross-origin requests.
CORS(
    app,
    resources={r"/*": {"origins": "https://www.mbogofoundation.org"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)

# Render/production should set these env vars; keep local fallback.
app.config.setdefault("SECRET_KEY", os.getenv("SECRET_KEY", "your-secret"))
app.config.setdefault("SQLALCHEMY_DATABASE_URI", os.getenv("DATABASE_URL", "sqlite:///app.db"))
app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)

db.init_app(app)


def _auth_token() -> str:
    token = request.headers.get("Authorization")
    if not token:
        return ""
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    return token


def _json_api_error(message: str, status_code: int):
    # Keep API error shape consistent with frontend/tests.
    return jsonify({"success": False, "message": message}), status_code


def _is_api_path() -> bool:
    # Keep this explicit so we never accidentally return HTML to API calls.
    return request.path in {
        "/me",
        "/admin-login",
        "/member-login",
        "/admin-register",
        "/media",
        "/health",
        "/live",
        "/ready",
    }


@app.errorhandler(HTTPException)
def handle_http_exception(err: HTTPException):
    # Always return JSON for API paths; never leak HTML error pages.
    if _is_api_path() or request.accept_mimetypes.best == "application/json":
        return jsonify({"error": err.description or "Request failed"}), getattr(err, "code", 400)
    return jsonify({"error": err.description or "Request failed"}), getattr(err, "code", 400)


@app.errorhandler(Exception)
def handle_exception(err: Exception):
    # Avoid leaking stack traces to clients.
    if _is_api_path() or request.accept_mimetypes.best == "application/json":
        return _json_api_error("Internal server error", 500)
    return _json_api_error("Internal server error", 500)


# ---------------- Health ----------------
@app.route("/health", methods=["GET"])
def health():
    try:
        # DB connectivity check (best-effort)
        db.session.execute("SELECT 1")
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


@app.route("/live", methods=["GET"])
def live():
    return jsonify({"alive": True, "timestamp": datetime.utcnow().isoformat()}), 200


@app.route("/ready", methods=["GET"])
def ready():
    try:
        db.session.execute("SELECT 1")
        ok = True
    except Exception:
        ok = False

    return jsonify({"ready": ok, "timestamp": datetime.utcnow().isoformat()}), 200


# ---------------- Auth / API ----------------
@app.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return _json_api_error("Missing credentials", 400)

    try:
        admin = Admin.query.filter_by(username=username).first()
        if not admin:
            return _json_api_error("Invalid username or password", 401)

        if not check_password_hash(admin.password, password):
            return _json_api_error("Invalid username or password", 401)

        if not getattr(admin, "is_active", True):
            return _json_api_error("Account deactivated", 401)

        token = jwt.encode(
            {
                "admin_id": admin.id,
                "role": admin.role,
                "exp": datetime.utcnow().timestamp() + 60 * 60 * 24 * 7,
            },
            app.config["SECRET_KEY"],
            algorithm="HS256",
        )

        return jsonify({"success": True, "name": admin.full_name, "username": admin.username, "token": token}), 200
    except Exception:
        return _json_api_error("Internal server error", 500)


@app.route("/member-login", methods=["POST"])
def member_login():
    try:
        data = request.get_json(silent=True) or {}
        national_id = data.get("national_id")
        phone_number = data.get("phone_number")

        if not national_id or not phone_number:
            return _json_api_error("Missing credentials", 400)

        member = Member.query.filter_by(national_id=national_id, phone_number=phone_number).first()
        if not member:
            return jsonify({"success": False, "error": "Member not found"}), 404

        token = jwt.encode(
            {
                "member_id": member.id,
                "role": "member",
                "exp": datetime.utcnow().timestamp() + 60 * 60 * 24 * 7,
            },
            app.config["SECRET_KEY"],
            algorithm="HS256",
        )

        return jsonify({"success": True, "member": member.to_dict(), "token": token}), 200
    except Exception:
        return _json_api_error("Internal server error", 500)


@app.route("/admin-register", methods=["POST"])
def admin_register():
    # Frontend/tests send superadmin auth token in Authorization header.
    data = request.get_json(silent=True) or {}

    token = _auth_token()
    if not token:
        return _json_api_error("Missing token", 401)

    decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    role = decoded.get("role")

    if role != "superadmin":
        return _json_api_error("Forbidden", 403)

    required = ["username", "password", "full_name", "email", "phone", "role"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return _json_api_error("Missing fields", 400)

    username = data["username"]
    if Admin.query.filter_by(username=username).first():
        return _json_api_error("Admin already exists", 400)

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


@app.route("/me", methods=["GET"])
def get_me():
    token = _auth_token()
    if not token:
        return _json_api_error("Missing token", 401)

    try:
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except Exception as e:
        return _json_api_error(str(e), 401)

    return jsonify({"success": True, "user": decoded}), 200


# ---------------- Media ----------------
@app.route("/media", methods=["GET"])
def get_media():
    # Always return JSON: [] or list of media objects.
    # Prevents frontend "Unexpected token '<'" due to HTML error pages.
    try:
        media_items = Media.query.filter_by(is_active=True).all()
        return jsonify([m.to_dict() for m in media_items]), 200
    except Exception:
        return jsonify([]), 200

