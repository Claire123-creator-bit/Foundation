import os
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.security import generate_password_hash

import config
from website_models import Admin, db
from utils.responses import json_api_error
from routes.auth import auth_bp
from routes.members import members_bp
from routes.media import media_bp
from routes.misc import misc_bp

app = Flask(__name__)

# Configuration
app.config.update(
    SECRET_KEY=config.SECRET_KEY,
    SQLALCHEMY_DATABASE_URI=config.SQLALCHEMY_DATABASE_URI,
    SQLALCHEMY_TRACK_MODIFICATIONS=config.SQLALCHEMY_TRACK_MODIFICATIONS,
)

# CORS
CORS(
    app,
    resources={r"/*": {"origins": config.CORS_ORIGINS}},
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


# Register Blueprints
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



