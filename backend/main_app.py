import os

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.security import generate_password_hash

import config
from website_models import Admin, db
from logger import app_logger

from utils.responses import json_api_error
from routes.auth import auth_bp
from routes.members import members_bp
from routes.media import media_bp
from routes.misc import misc_bp

app = Flask(__name__)

app.config.update(
    SECRET_KEY=config.SECRET_KEY,
    SQLALCHEMY_DATABASE_URI=config.SQLALCHEMY_DATABASE_URI,
    SQLALCHEMY_TRACK_MODIFICATIONS=config.SQLALCHEMY_TRACK_MODIFICATIONS,
)

CORS(
    app,
    origins=["https://foundation-drab-eta.vercel.app", "https://www.mbogofoundation.org", "http://localhost:3000", "http://127.0.0.1:3000"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)


@app.before_request
def _force_json_cors_and_options():
    if request.method == "OPTIONS":
        return ("", 204)


db.init_app(app)


def init_db():
    app_logger.info(f"Using DATABASE_URL={app.config.get('SQLALCHEMY_DATABASE_URI')}")

    try:
        with app.app_context():
            db.create_all()
            superadmin = Admin.query.filter_by(email="mbogoempowermentfoundation@gmail.com").first()
            if superadmin:
                # Ensure details are always correct
                superadmin.username = "mbogofoundation"
                superadmin.full_name = "Mbogo Foundation"
                superadmin.password = generate_password_hash("Mb0g0@21")
                superadmin.role = "superadmin"
                superadmin.is_active = True
            else:
                # Delete any stale superadmins and create the real one
                Admin.query.filter_by(role="superadmin").delete()
                db.session.add(Admin(
                    username="mbogofoundation",
                    password=generate_password_hash("Mb0g0@21"),
                    full_name="Mbogo Foundation",
                    email="mbogoempowermentfoundation@gmail.com",
                    phone="",
                    role="superadmin",
                    is_active=True,
                ))
            db.session.commit()
    except Exception:
        pass


init_db()

app.register_blueprint(auth_bp)
app.register_blueprint(members_bp)
app.register_blueprint(media_bp)
app.register_blueprint(misc_bp)


@app.errorhandler(404)
def handle_404(err):
    return json_api_error("Resource not found", 404)


@app.errorhandler(405)
def handle_405(err):
    return json_api_error("Method not allowed", 405)


@app.errorhandler(500)
def handle_500(err):
    return json_api_error("Internal server error", 500)


@app.errorhandler(HTTPException)
def handle_http_exception(err: HTTPException):
    return json_api_error(err.description or "Request failed", getattr(err, "code", 400))


@app.errorhandler(Exception)
def handle_exception(err: Exception):
    return json_api_error("Internal server error", 500)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
