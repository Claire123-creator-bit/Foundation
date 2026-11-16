import jwt
from datetime import datetime
from flask import request, current_app


def get_auth_token() -> str:
    token = request.headers.get("Authorization")
    if not token:
        return ""
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    return token


def decode_token(token: str):
    try:
        decoded = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded
    except Exception:
        return None


def create_admin_token(admin_id: int, role: str):
    return jwt.encode(
        {
            "admin_id": admin_id,
            "role": role,
            "exp": int(datetime.utcnow().timestamp()) + 60 * 60 * 24 * 7,
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )


def create_member_token(member_id: int):
    return jwt.encode(
        {
            "member_id": member_id,
            "role": "member",
            "exp": int(datetime.utcnow().timestamp()) + 60 * 60 * 24 * 7,
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )
