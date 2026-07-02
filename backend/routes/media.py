from flask import Blueprint, jsonify, request, send_from_directory
import os

from website_models import Media, db
from utils.responses import json_api_error
from utils.auth import get_auth_token, decode_token
from utils.cloudinary_service import upload_file, delete_file

media_bp = Blueprint("media", __name__)

UPLOADS_DIR = os.path.abspath("uploads")


@media_bp.route("/uploads/<path:filename>", methods=["GET"])
def serve_upload(filename):
    try:
        return send_from_directory(UPLOADS_DIR, filename)
    except Exception:
        return json_api_error("File not found", 404)


@media_bp.route("/media", methods=["GET"])
def get_media():
    try:
        media_items = Media.query.filter_by(is_active=True).all()
        return jsonify([m.to_dict() for m in media_items]), 200
    except Exception:
        return jsonify([]), 200


@media_bp.route("/media/<int:media_id>", methods=["DELETE"])
def delete_media(media_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded or not decoded.get("admin_id"):
        return json_api_error("Invalid token", 401)

    media = Media.query.get(media_id)
    if not media:
        return json_api_error("Media not found", 404)

    try:
        delete_file(media.file_path or "")
        db.session.delete(media)
        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Delete failed: {str(e)}", 500)


@media_bp.route("/media-upload", methods=["POST"])
def upload_media():
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded:
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    admin_id = decoded.get("admin_id")
    if not admin_id:
        return json_api_error("Invalid token", 401)

    if "file" not in request.files:
        return json_api_error("No file provided", 400)
    file = request.files["file"]
    if not file.filename:
        return json_api_error("No file selected", 400)

    try:
        secure_url, error = upload_file(file)
        if error or not secure_url:
            return json_api_error(f"Upload failed: {error}", 500)

        media = Media(
            title=request.form.get("title", file.filename),
            description=request.form.get("description", ""),
            file_path=secure_url,
            file_type=file.content_type or "unknown",
            media_type=request.form.get("media_type", "image"),
            file_size=0,
            uploaded_by=admin_id,
            activity_id=request.form.get("activity_id"),
            is_active=True,
        )
        db.session.add(media)
        db.session.commit()
        return jsonify({"success": True, "media": media.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Upload failed: {str(e)}", 500)
