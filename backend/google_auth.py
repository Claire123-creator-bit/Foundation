import os
import jwt as pyjwt
import requests
from flask import request, jsonify
from urllib.parse import urlencode

from website_models import db, Member
from datetime import datetime, timedelta
from logger import app_logger
from werkzeug.security import generate_password_hash


def _get_env(name: str) -> str:
    return (os.environ.get(name, '') or '').strip()


def get_google_provider_config_url() -> str:
    # Standard discovery endpoint for OpenID Connect
    # (google accounts doesn't require client secret for token verification)
    return 'https://accounts.google.com/.well-known/openid-configuration'


def _get_google_jwks_uri() -> str:
    import requests
    cfg = requests.get(get_google_provider_config_url(), timeout=10).json()
    return cfg['jwks_uri']


def _build_jwt(user_payload: dict, secret_key: str) -> str:
    exp = datetime.utcnow() + timedelta(days=7)
    return pyjwt.encode(
        {
            **user_payload,
            'exp': exp,
        },
        secret_key,
        algorithm='HS256'
    )


def google_login_redirect_url(state: str) -> str:
    client_id = _get_env('GOOGLE_CLIENT_ID')
    if not client_id:
        raise RuntimeError('GOOGLE_CLIENT_ID not configured')

    redirect_uri = _get_env('GOOGLE_REDIRECT_URI')
    if not redirect_uri:
        raise RuntimeError('GOOGLE_REDIRECT_URI not configured')

    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'openid email profile',
        'state': state,
        'access_type': 'online',
        'prompt': 'select_account',
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"


def exchange_code_for_tokens(code: str) -> dict:
    client_id = _get_env('GOOGLE_CLIENT_ID')
    client_secret = _get_env('GOOGLE_CLIENT_SECRET')
    redirect_uri = _get_env('GOOGLE_REDIRECT_URI')

    if not client_id or not client_secret or not redirect_uri:
        raise RuntimeError('GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REDIRECT_URI not configured')

    data = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }
    r = requests.post('https://oauth2.googleapis.com/token', data=data, timeout=10)
    r.raise_for_status()
    return r.json()


def _verify_id_token(id_token: str) -> dict:
    # Verify signature and claims using Google's JWKS.
    # We avoid adding extra dependencies; we decode without verification by fetching JWKS and using PyJWT.
    # For production, a JWKS client would be ideal, but we keep dependencies minimal.
    from jwt.algorithms import RSAAlgorithm
    import requests
    unverified = pyjwt.get_unverified_header(id_token)

    jwks_uri = _get_google_jwks_uri()
    jwks = requests.get(jwks_uri, timeout=10).json()

    kid = unverified.get('kid')
    if not kid:
        raise RuntimeError('Invalid ID token: missing kid')

    key = None
    for k in jwks.get('keys', []):
        if k.get('kid') == kid:
            key = k
            break
    if not key:
        raise RuntimeError('Invalid ID token: JWKS key not found')

    public_key = pyjwt.algorithms.RSAAlgorithm.from_jwk(key)

    client_id = _get_env('GOOGLE_CLIENT_ID')
    if not client_id:
        raise RuntimeError('GOOGLE_CLIENT_ID not configured')

    decoded = pyjwt.decode(
        id_token,
        public_key,
        algorithms=['RS256'],
        audience=client_id,
        options={'require': ['email', 'iss', 'aud']}
    )

    # Reject unverified emails
    if not decoded.get('email_verified'):
        raise RuntimeError('Email not verified by Google')

    # Validate issuer
    iss = decoded.get('iss')
    if iss not in {'accounts.google.com', 'https://accounts.google.com'}:
        raise RuntimeError('Invalid token issuer')

    return decoded


def find_or_create_member_by_email(email: str, full_name: str) -> Member:
    member = Member.query.filter_by(email=email.lower()).first()
    if member:
        return member

    # Create new member with minimal required fields.
    # Your Member model requires many fields; use sensible defaults.
    # IMPORTANT: this does NOT add admin role.
    username_name = (full_name or '').strip()
    if not username_name:
        username_name = email.split('@')[0]

    member = Member(
        full_names=username_name,
        national_id=str(abs(hash(email)) % 10**10).zfill(10),
        phone_number=str(abs(hash(email + 'phone')) % 10**11).zfill(11),
        email=email.lower(),
        gender='',
        county='',
        constituency='',
        ward='',
        physical_location='',
        category='Google',
        status='approved',
        created_by='google',
        is_verified=True,
    )

    db.session.add(member)
    db.session.commit()
    return member

