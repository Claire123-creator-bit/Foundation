import os
from datetime import datetime

import jwt
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash

from website_models import Admin, Member, Media, Meeting, db

CLOUDINARY_AVAILABLE = False
cloudinary = None
try:
    import cloudinary  # type: ignore
    import cloudinary.uploader  # type: ignore

    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    )
    CLOUDINARY_AVAILABLE = True
except ModuleNotFoundError:
    CLOUDINARY_AVAILABLE = False
except Exception:
    CLOUDINARY_AVAILABLE = False

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "https://www.mbogofoundation.org"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)


@app.before_request
def _force_json_cors_and_options():
    if request.method == "OPTIONS":
        return ("", 204)


app.config
app.config.setdefault("SQLALCHEMY_DATABASE_URI", os.getenv("DATABASE_URL", "sqlite:///app.db"))
app.config.setdefault("SQLALCHEMY_TRACK_MODIFICATIONS", False)

db.init_app(app)


def init_db():
    try:
        with app.app_context():
            db.create_all()
            existing = Admin.query.filter_by(role="superadmin").first()
            if existing:
                return
            superadmin = Admin(
                username="superadmin",
                password=generate_password_hash("superadmin123"),
                full_name="Super Administrator",
                email="superadmin@mbogofoundation.org",
                phone="",
                role="superadmin",
                is_active=True,
            )
            db.session.add(superadmin)
            db.session.commit()
    except Exception:
        pass


init_db()


def _auth_token() -> str:
    token = request.headers.get("Authorization")
    if not token:
        return ""
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    return token


def _json_api_error(message: str, status_code: int):
    return jsonify({"success": False, "message": message}), status_code


def _is_api_path() -> bool:
    return request.path in {
        "/me",
        "/admin-login",
        "/member-login",
        "/admin-register",
        "/media",
        "/media-upload",
        "/health",
        "/live",
        "/ready",
        "/members",
        "/meetings",
        "/admin/pending-members",
    }



@app.errorhandler(HTTPException)
def handle_http_exception(err: HTTPException):
    if _is_api_path() or request.accept_mimetypes.best == "application/json":
        return jsonify({"error": err.description or "Request failed"}), getattr(err, "code", 400)
    return jsonify({"error": err.description or "Request failed"}), getattr(err, "code", 400)


@app.errorhandler(Exception)
def handle_exception(err: Exception):
    if _is_api_path() or request.accept_mimetypes.best == "application/json":
        return _json_api_error("Internal server error", 500)
    return _json_api_error("Internal server error", 500)


@app.route("/health", methods=["GET"])
def health():
    try:
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


@app.route("/admin-login", methods=["POST"])
def admin_login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return _json_api_error("Missing credentials", 400)

    try:
        admin = Admin.query.filter_by(username=username).first()
        if not admin:
            admin = Admin.query.filter_by(email=username).first()
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

        return jsonify(
            {"success": True, "name": admin.full_name, "username": admin.username, "token": token}
        ), 200
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

    role = decoded.get("role")

    if role == "member":
        member = Member.query.get(decoded.get("member_id"))
        if not member:
            return _json_api_error("Member not found", 404)
        return jsonify({"success": True, "role": "member", "member": member.to_dict()}), 200

    admin = Admin.query.get(decoded.get("admin_id"))
    if not admin:
        return _json_api_error("Admin not found", 404)

    return jsonify({"success": True, "role": admin.role, "admin": admin.to_dict()}), 200


@app.route("/uploads/<path:filename>", methods=["GET"])
def serve_upload(filename):
    try:
        file_path = os.path.join("uploads", filename)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_file(file_path)
        return _json_api_error("File not found", 404)
    except Exception:
        return _json_api_error("Error serving file", 500)


@app.route("/media", methods=["GET"])
def get_media():
    try:
        media_items = Media.query.filter_by(is_active=True).all()
        return jsonify([m.to_dict() for m in media_items]), 200
    except Exception:
        return jsonify([]), 200


@app.route("/media/<int:media_id>", methods=["DELETE"])
def delete_media(media_id):
    token = _auth_token()
    if not token:
        return _json_api_error("Missing token", 401)

    try:
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        admin_id = decoded.get("admin_id")
        if not admin_id:
            return _json_api_error("Invalid token", 401)
    except Exception:
        return _json_api_error("Invalid token", 401)

    try:
        media = Media.query.get(media_id)
        if not media:
            return _json_api_error("Media not found", 404)

        if "cloudinary" in (media.file_path or "") and CLOUDINARY_AVAILABLE and cloudinary is not None:
            public_id = media.file_path.split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(f"mbogo_foundation/{public_id}")

        db.session.delete(media)
        db.session.commit()
        return jsonify({"success": True, "message": "Media deleted"}), 200
    except Exception as e:
        return _json_api_error(f"Delete failed: {str(e)}", 500)


@app.route("/members", methods=["GET"])
def list_members():
    try:
        members = Member.query.all()
        return jsonify([m.to_dict() for m in members]), 200
    except Exception:
        return jsonify([]), 200


@app.route("/meetings", methods=["GET"])
def list_meetings():
    try:
        meetings = Meeting.query.all()
        return jsonify([m.to_dict() for m in meetings]), 200
    except Exception:
        return jsonify([]), 200


@app.route("/admin/pending-members", methods=["GET"])
def list_pending_members():
    try:
        pending = Member.query.filter_by(status="pending").all()
        return jsonify([m.to_dict() for m in pending]), 200
    except Exception:
        return jsonify([]), 200


@app.route("/media-upload", methods=["POST"])
def upload_media():
    token = _auth_token()
    if not token:
        return _json_api_error("Missing token", 401)

    try:
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        admin_id = decoded.get("admin_id")
        if not admin_id:
            return _json_api_error("Invalid token", 401)
    except Exception:
        return _json_api_error("Invalid token", 401)

    if "file" not in request.files:
        return _json_api_error("No file provided", 400)

    file = request.files["file"]
    if file.filename == "":
        return _json_api_error("No file selected", 400)

    try:
        if not CLOUDINARY_AVAILABLE or cloudinary is None:
            return _json_api_error("Cloudinary not configured", 500)

        upload_result = cloudinary.uploader.upload(
            file,
            folder="mbogo_foundation",
            resource_type="auto",
        )

        media = Media(
            title=request.form.get("title", file.filename),
            description=request.form.get("description", ""),
            file_path=upload_result["secure_url"],
            file_type=file.content_type or "unknown",
            media_type=request.form.get("media_type", "image"),
            file_size=upload_result.get("bytes", 0),
            uploaded_by=admin_id,
            activity_id=request.form.get("activity_id"),
            is_active=True,
        )
        db.session.add(media)
        db.session.commit()

        return jsonify({"success": True, "media": media.to_dict()}), 200
    except Exception as e:
        return _json_api_error(f"Upload failed: {str(e)}", 500)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )


