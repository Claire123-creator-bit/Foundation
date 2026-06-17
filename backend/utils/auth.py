import jwt
from datetime import datetime
from flask import request, current_app
from functools import wraps
from utils.responses import json_api_error


def get_auth_token() -> str:
    """Extract JWT token from Authorization header."""
    token = request.headers.get("Authorization")
    if not token:
        return ""
    if token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    return token


def decode_token(token: str):
    """Decode JWT token safely."""
    try:
        decoded = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return decoded
    except Exception as e:
        return None


def require_auth(f):
    """Decorator to require valid JWT token."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_auth_token()
        if not token:
            return json_api_error("Missing token", 401)
        
        decoded = decode_token(token)
        if not decoded:
            return json_api_error("Invalid token", 401)
        
        return f(*args, **kwargs)
    return decorated_function


def require_superadmin(f):
    """Decorator to require superadmin role."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_auth_token()
        if not token:
            return json_api_error("Missing token", 401)
        
        decoded = decode_token(token)
        if not decoded or decoded.get("role") != "superadmin":
            return json_api_error("Forbidden", 403)
        
        return f(*args, **kwargs)
    return decorated_function


def create_admin_token(admin_id: int, role: str):
    """Create JWT token for admin."""
    return jwt.encode(
        {
            "admin_id": admin_id,
            "role": role,
            "exp": datetime.utcnow().timestamp() + 60 * 60 * 24 * 7,
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )


def create_member_token(member_id: int):
    """Create JWT token for member."""
    return jwt.encode(
        {
            "member_id": member_id,
            "role": "member",
            "exp": datetime.utcnow().timestamp() + 60 * 60 * 24 * 7,
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )
