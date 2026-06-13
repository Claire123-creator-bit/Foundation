from flask import request
import secrets


def google_state_value() -> str:
    """Generate state value for OAuth redirect."""
    return secrets.token_urlsafe(32)


def get_frontend_redirect_base() -> str:
    # Default frontend origin for OAuth callback handling
    return (request.host_url.split('/')[0] + ('' if request.host_url.endswith('/') else '')).rstrip('/')

