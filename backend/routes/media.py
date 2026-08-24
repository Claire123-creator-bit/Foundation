from flask import Blueprint, jsonify, request, send_from_directory
import os

from website_models import Media, LeadershipProfile, db
from utils.responses import json_api_error
from utils.auth import get_auth_token, decode_token
from utils.cloudinary_service import upload_file, delete_file
from logger import app_logger

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
        media_items = Media.query.filter_by(is_active=True).order_by(Media.activity_id.asc(), Media.created_date.asc()).all()
        return jsonify([m.to_dict() for m in media_items]), 200
    except Exception:
        return jsonify([]), 200


@media_bp.route("/media/<int:media_id>", methods=["PUT"])
def update_media(media_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded or not decoded.get("admin_id"):
        return json_api_error("Invalid token", 401)

    media = Media.query.get(media_id)
    if not media:
        return json_api_error("Media not found", 404)

    data = request.get_json() or {}
    if "title" in data:
        media.title = data["title"]
    if "description" in data:
        media.description = data["description"]

    try:
        db.session.commit()
        return jsonify({"success": True, "media": media.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return json_api_error(f"Update failed: {str(e)}", 500)


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
        # First commit DB change, then best-effort delete remote media.
        db.session.delete(media)
        db.session.commit()

        try:
            delete_file(media.file_path or "")
        except Exception:
            # DB row is already gone; just log the remote deletion failure.
            app_logger.exception("Remote media deletion failed after DB delete")

        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback()
        app_logger.exception("Delete media failed")
        return json_api_error(f"Delete failed: {str(e)}", 500)



@media_bp.route("/leadership", methods=["GET"])
def get_leadership_profiles():
    try:
        profiles = LeadershipProfile.query.filter_by(is_active=True).order_by(LeadershipProfile.sort_order.asc(), LeadershipProfile.id.asc()).all()
        return jsonify([profile.to_dict() for profile in profiles]), 200
    except Exception:
        return jsonify([]), 200


@media_bp.route("/leadership", methods=["POST"])
def create_leadership_profile():
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded or not decoded.get("admin_id"):
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    full_name = request.form.get("full_name") or ""
    position = request.form.get("position") or ""
    bio = request.form.get("bio") or ""
    if not full_name.strip() or not position.strip() or not bio.strip():
        return json_api_error("Name, position, and biography are required", 400)

    photo_file = request.files.get("photo")
    photo_url = request.form.get("photo_url") or None
    if photo_file and photo_file.filename:
        photo_url, error = upload_file(photo_file)
        if error or not photo_url:
            return json_api_error(f"Photo upload failed: {error}", 500)
    if not photo_url:
        return json_api_error("A profile photo is required", 400)

    try:
        sort_order = request.form.get("sort_order", "0")
        profile = LeadershipProfile(
            full_name=full_name,
            position=position,
            bio=bio,
            photo_url=photo_url,
            sort_order=int(sort_order) if str(sort_order).strip() else 0,
            is_active=True,
        )
        db.session.add(profile)
        db.session.commit()
        return jsonify({"success": True, "profile": profile.to_dict()}), 200
    except Exception as exc:
        db.session.rollback()
        app_logger.exception("Leadership profile creation failed")
        return json_api_error(f"Create failed: {str(exc)}", 500)


@media_bp.route("/leadership/<int:profile_id>", methods=["PUT"])
def update_leadership_profile(profile_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded or not decoded.get("admin_id"):
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    profile = LeadershipProfile.query.get(profile_id)
    if not profile:
        return json_api_error("Leadership profile not found", 404)

    if "full_name" in request.form:
        profile.full_name = request.form.get("full_name") or ""
    if "position" in request.form:
        profile.position = request.form.get("position") or ""
    if "bio" in request.form:
        profile.bio = request.form.get("bio") or ""
    if "sort_order" in request.form:
        value = request.form.get("sort_order") or "0"
        profile.sort_order = int(value) if str(value).strip() else 0

    photo_file = request.files.get("photo")
    if photo_file and photo_file.filename:
        if profile.photo_url:
            try: delete_file(profile.photo_url)
            except Exception: pass
        new_url, error = upload_file(photo_file)
        if error or not new_url:
            return json_api_error(f"Photo upload failed: {error}", 500)
        profile.photo_url = new_url

    if not profile.full_name or not profile.position or not profile.bio:
        return json_api_error("Name, position, and biography are required", 400)

    try:
        db.session.commit()
        return jsonify({"success": True, "profile": profile.to_dict()}), 200
    except Exception as exc:
        db.session.rollback()
        app_logger.exception("Leadership profile update failed")
        return json_api_error(f"Update failed: {str(exc)}", 500)


@media_bp.route("/leadership/<int:profile_id>", methods=["DELETE"])
def delete_leadership_profile(profile_id):
    token = get_auth_token()
    if not token:
        return json_api_error("Missing token", 401)
    decoded = decode_token(token)
    if not decoded or not decoded.get("admin_id"):
        return json_api_error("Invalid token", 401)
    if decoded.get("role", "").lower() not in ["admin", "superadmin"]:
        return json_api_error("Forbidden", 403)

    profile = LeadershipProfile.query.get(profile_id)
    if not profile:
        return json_api_error("Leadership profile not found", 404)

    try:
        if profile.photo_url:
            try: delete_file(profile.photo_url)
            except Exception: pass
        db.session.delete(profile)
        db.session.commit()
        return jsonify({"success": True}), 200
    except Exception as exc:
        db.session.rollback()
        app_logger.exception("Leadership profile delete failed")
        return json_api_error(f"Delete failed: {str(exc)}", 500)


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

        try:
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
        except Exception as db_err:
            # Upload succeeded but DB write failed; best-effort cleanup to avoid orphan media.
            try:
                delete_file(secure_url)
            except Exception:
                pass
            db.session.rollback()
            app_logger.exception("Media DB commit failed after successful upload")
            return json_api_error(f"Upload failed (db error): {str(db_err)}", 500)
    except Exception as e:
        db.session.rollback()
        app_logger.exception("Media upload failed")
        return json_api_error(f"Upload failed: {str(e)}", 500)

