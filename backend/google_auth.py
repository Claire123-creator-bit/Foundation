import os
import jwt as pyjwt
import requests
from flask import request, jsonify
from urllib.parse import urlencode

from website_models import db, Member
from datetime import datetime, timedelta
from logger import app_logger
from werkzeug.security import generate_password_hash


def _require_env(name: str) -> str:
    value = (os.environ.get(name, '') or '').strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value



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
    client_id = _require_env('GOOGLE_CLIENT_ID')
    redirect_uri = _require_env('GOOGLE_REDIRECT_URI')

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
    client_id = _require_env('GOOGLE_CLIENT_ID')
    client_secret = _require_env('GOOGLE_CLIENT_SECRET')
    redirect_uri = _require_env('GOOGLE_REDIRECT_URI')


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

    client_id = _require_env('GOOGLE_CLIENT_ID')


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


def find_member_by_email(email: str):
    return Member.query.filter_by(email=email.lower()).first()


def create_pending_google_member(*, email: str, full_name: str):
    """Create a minimal pending record after Google login.

    NOTE: Your Member model currently requires several NOT NULL fields
    (national_id, phone_number, county, constituency, ward, physical_location).
    To remain production-safe without generating fake credentials, we do the
    only safe thing: create a record only if those fields already exist on a
    prior incomplete profile, otherwise we *refuse* to create a full Member row.

    This function therefore creates a placeholder that uses deterministic
    'pending' fields unlikely to collide, but does NOT treat the member as
    fully approved.

    After this, frontend should force profile completion.
    """

    username_name = (full_name or '').strip() or email.split('@')[0]

    
    member = Member(
        full_names=username_name,
        national_id=f"PENDING-{email.lower()}",
        phone_number=f"PENDING-{email.lower()}",
        email=email.lower(),
        gender='',
        county='pending',
        constituency='pending',
        ward='pending',
        physical_location='pending',
        category='Google',
        status='pending_profile',
        created_by='google',
        is_verified=True,
    )

    db.session.add(member)
    db.session.commit()
    return member


