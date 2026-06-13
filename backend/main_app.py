from flask import Flask, request, jsonify
from flask_cors import CORS
from website_models import db, Member, Meeting, Admin
from datetime import datetime, timedelta
import os
import secrets
import threading
import jwt

from werkzeug.security import generate_password_hash, check_password_hash
from logger import app_logger, auth_logger
from sms_service import send_sms, send_bulk_sms, build_meeting_alert_message

from email_service import send_admin_welcome_email, send_verification_email

from google_auth import (
    google_login_redirect_url,
    exchange_code_for_tokens,
    _verify_id_token,
    find_or_create_member_by_email,
)






app = Flask(__name__)

# JWT configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, '..', 'instance')
DB_PATH = os.path.join(INSTANCE_DIR, 'foundation_complete.db')

ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://foundation-drab-eta.vercel.app',
    'https://www.mbogofoundation.org',
    'https://mbogofoundation.org'
]

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

db.init_app(app)

CORS(
    app,
    supports_credentials=True,
    resources={r"/*": {"origins": ALLOWED_ORIGINS}}
)


# Helper Functions

def get_request_json():
    return request.get_json(silent=True) or {}


def _extract_bearer_token():
    auth = request.headers.get('Authorization', '') or ''
    parts = auth.split(' ')
    if len(parts) == 2 and parts[0].lower() == 'bearer':
        return parts[1].strip()
    return None


def _decode_jwt_from_request():
    token = _extract_bearer_token()
    if not token:
        return None, jsonify({'success': False, 'message': 'Missing Authorization token'}), 401

    try:
        payload = jwt.decode(
            token,
            app.config['SECRET_KEY'],
            algorithms=['HS256'],
            options={'require': ['exp']}
        )
        return payload, None, None
    except jwt.ExpiredSignatureError:
        return None, jsonify({'success': False, 'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return None, jsonify({'success': False, 'message': 'Invalid token'}), 401


def jwt_required(*allowed_roles):
    """Centralized JWT authorization.

    Usage:
      @jwt_required('admin', 'superadmin')
      def endpoint(): ...

    If allowed_roles is empty, only presence/validity of JWT is checked.
    """

    def decorator(fn):
        def wrapped(*args, **kwargs):
            payload, err_resp, err_code = _decode_jwt_from_request()
            if err_resp is not None:
                return err_resp, err_code

            if allowed_roles:
                role = payload.get('role')
                if role not in set(allowed_roles):
                    return jsonify({'success': False, 'message': 'Forbidden'}), 403

            request.jwt_payload = payload
            return fn(*args, **kwargs)

        # preserve Flask view name
        wrapped.__name__ = fn.__name__
        return wrapped

    return decorator


def _require_admin_roles(request_payload):
    role = request_payload.get('role')
    return role in {'admin', 'superadmin', 'coordinator', 'finance', 'communication'}


def init_database():
    os.makedirs(INSTANCE_DIR, exist_ok=True)
    with app.app_context():
        try:
            db.create_all()
            app_logger.info("Database tables initialized")

            superadmin = Admin.query.filter_by(username='superadmin').first()
            if not superadmin:
                default_password = os.environ.get('SUPERADMIN_INITIAL_PASSWORD')
                if not default_password:
                    raise ValueError('SUPERADMIN_INITIAL_PASSWORD environment variable is required')

                superadmin = Admin(
                    username='superadmin',
                    password=generate_password_hash(default_password),
                    full_name='Super Admin',
                    email='admin@mbogofoundation.org',
                    phone='',
                    role='superadmin',
                    is_active=True
                )
                db.session.add(superadmin)
                db.session.commit()
                app_logger.info("Superadmin account created")

        except Exception as e:
            app_logger.error(f"Database initialization failed: {str(e)}", exc_info=True)
            raise


init_database()
app_logger.info(f"Application started - Database: {DB_PATH}")


# ── Health ──

@app.route('/health', methods=['GET'])
def health_check():
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({'status': 'healthy', 'database': 'connected', 'timestamp': datetime.utcnow().isoformat()})
    except Exception as e:
        app_logger.error(f"Health check failed: {str(e)}", exc_info=True)
        return jsonify({'status': 'unhealthy', 'error': 'database connection failed', 'timestamp': datetime.utcnow().isoformat()}), 500


@app.route('/ready', methods=['GET'])
def readiness_check():
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({'ready': True, 'timestamp': datetime.utcnow().isoformat()})
    except Exception:
        return jsonify({'ready': False, 'timestamp': datetime.utcnow().isoformat()}), 503


@app.route('/live', methods=['GET'])
def liveness_check():
    return jsonify({'alive': True, 'timestamp': datetime.utcnow().isoformat()})


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'name': 'Mbogo Foundation API',
        'status': 'running',
        'health': '/health',
        'ready': '/ready',
        'live': '/live'
    })


# ── Session / Who am I ──

@app.route('/me', methods=['GET'])
@jwt_required()  # validate token only; response includes role
def me():
    payload = request.jwt_payload
    role = payload.get('role')

    if role in {'admin', 'superadmin', 'coordinator', 'finance', 'communication'}:
        admin_id = payload.get('admin_id')
        admin = Admin.query.get(admin_id) if admin_id else None
        if not admin or not admin.is_active:
            return jsonify({'success': False, 'message': 'Admin not found'}), 404
        return jsonify({'success': True, 'role': role, 'admin': admin.to_dict()})

    if role == 'member':
        member_id = payload.get('member_id')
        member = Member.query.get(member_id) if member_id else None
        if not member:
            return jsonify({'success': False, 'message': 'Member not found'}), 404
        return jsonify({'success': True, 'role': 'member', 'member': member.to_dict()})

    return jsonify({'success': False, 'message': 'Forbidden'}), 403


# ── Admin Auth (no JWT required) ──

@app.route('/admin-login', methods=['POST'])
def admin_login():
    try:
        data = request.json
        username = (data.get('username', '') or '').strip()
        password = (data.get('password', '') or '').strip()

        if not username or not password:
            auth_logger.warning(f"Login attempt with missing credentials from {request.remote_addr}")
            return jsonify({'success': False, 'message': 'Username and password are required'}), 400

        admin = Admin.query.filter_by(username=username).first()
        if not admin or not check_password_hash(admin.password, password):
            auth_logger.warning(f"Failed login attempt for user '{username}' from {request.remote_addr}")
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

        if not admin.is_active:
            auth_logger.warning(f"Login attempt on inactive account '{username}' from {request.remote_addr}")
            return jsonify({'success': False, 'message': 'Account deactivated'}), 401

        admin.last_login = datetime.utcnow()
        db.session.commit()

        auth_logger.info(f"Successful admin login: {username} from {request.remote_addr}")

        token = jwt.encode(
            {
                'admin_id': admin.id,
                'role': admin.role if admin.role else 'admin',
                'exp': datetime.utcnow() + timedelta(days=7)
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        return jsonify({
            'success': True,
            'token': token,
            'name': admin.full_name,
            'username': admin.username,
            'email': admin.email,
            'role': admin.role
        })

    except Exception as e:
        app_logger.error(f"Admin login error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'message': 'Login failed'}), 500


# ── Member Auth (no JWT required) ──

@app.route('/member-login', methods=['POST'])
def member_login():
    try:
        data = request.json
        phone = (data.get('phone_number', '') or '').strip()

        if not phone:
            return jsonify({'success': False, 'message': 'Please enter your phone number'}), 400

        member = Member.query.filter_by(phone_number=phone).first()
        if not member:
            return jsonify({'success': False, 'message': 'Phone number not found. Please register first.'}), 404

        if member.status == 'pending':
            return jsonify({'success': False, 'message': 'Your registration is being reviewed. Please wait for admin approval.'}), 403

        if member.status == 'rejected':
            return jsonify({'success': False, 'message': 'Your registration was not approved. Please contact the admin.'}), 403

        member.last_login = datetime.utcnow()
        member.last_active = datetime.utcnow()
        db.session.commit()

        token = jwt.encode(
            {
                'member_id': member.id,
                'role': 'member',
                'exp': datetime.utcnow() + timedelta(days=7)
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        return jsonify({'success': True, 'token': token, 'member': member.to_dict()})

    except Exception:
        return jsonify({'success': False, 'message': 'Something went wrong. Please try again.'}), 500


# ── Admin-only: Registration requires superadmin role ──

@app.route('/admin-register', methods=['POST'])
@jwt_required('superadmin')
def admin_register():
    try:
        data = request.json
        for f in ['username', 'password', 'full_name', 'email']:
            if not data.get(f):
                return jsonify({'success': False, 'message': f'{f} is required'}), 400

        if Admin.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'message': 'Username already exists'}), 400

        if Admin.query.filter_by(email=data['email'].lower()).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 400

        admin = Admin(
            username=data['username'],
            password=generate_password_hash(data['password']),
            full_name=data['full_name'],
            email=data['email'].lower(),
            phone=data.get('phone', ''),
            role=data.get('role', 'admin'),
            is_active=True
        )

        db.session.add(admin)
        db.session.commit()

        token = secrets.token_urlsafe(32)
        admin.verification_token = token
        admin.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
        db.session.commit()

        app_logger.info(f"New admin account created: {data['username']}")

        plain_password = data['password']
        admin_email = data['email'].lower()
        admin_full_name = data['full_name']
        admin_username = data['username']

        def _send_emails():
            send_admin_welcome_email(admin_full_name, admin_email, admin_username, plain_password)
            send_verification_email(admin_full_name, admin_email, token)

        threading.Thread(target=_send_emails, daemon=True).start()

        return jsonify({'success': True, 'message': 'Admin account created successfully'})

    except Exception as e:
        db.session.rollback()
        app_logger.error(f"Admin registration error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'message': 'Registration failed'}), 500


# ── Member register (public) ──

@app.route('/member-register', methods=['POST', 'OPTIONS'])
def member_register():
    if request.method == 'OPTIONS':
        resp = jsonify({'success': True})
        resp.status_code = 200
        return resp

    try:
        data = request.json
        required = ['full_names', 'national_id', 'phone_number', 'category', 'gender', 'county', 'constituency', 'ward']
        missing = [f for f in required if not data.get(f)]

        if missing:
            return jsonify({'success': False, 'error': f'Please fill all fields'}), 400

        if Member.query.filter_by(national_id=data['national_id']).first():
            return jsonify({'success': False, 'error': 'This ID is already registered.'}), 400

        if Member.query.filter_by(phone_number=data['phone_number']).first():
            return jsonify({'success': False, 'error': 'This phone number is already registered.'}), 400

        member = Member(
            full_names=data['full_names'],
            national_id=data['national_id'],
            phone_number=data['phone_number'],
            category=data['category'],
            gender=data.get('gender', ''),
            county=data.get('county', ''),
            constituency=data.get('constituency', ''),
            ward=data.get('ward', ''),
            physical_location=data.get('physical_location', data.get('ward', '')),
            status='pending',
            created_by='self',
            is_verified=False
        )

        db.session.add(member)
        db.session.commit()

        app_logger.info(f"New member registration: {data['full_names']} (ID: {data['national_id']})")

        return jsonify({'success': True})

    except Exception as e:
        db.session.rollback()
        app_logger.error(f"Member registration error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Registration failed. Try again.'}), 500


# ── Admin-only routes (JWT required, role-based) ──

ADMIN_ROLES = {'admin', 'superadmin', 'coordinator', 'finance', 'communication'}


@app.route('/admin/list-admins', methods=['GET'])
@jwt_required('superadmin')
def list_admins():
    admins = Admin.query.all()
    return jsonify([
        {
            'id': a.id,
            'username': a.username,
            'full_name': a.full_name,
            'email': a.email,
            'phone': a.phone,
            'role': a.role,
            'is_active': a.is_active,
            'last_login': a.last_login.isoformat() if a.last_login else None
        } for a in admins
    ])


@app.route('/admin/delete-admin/<int:admin_id>', methods=['DELETE'])
@jwt_required('superadmin')
def delete_admin(admin_id):
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({'success': False, 'error': 'Admin not found'}), 404

    if admin.role == 'superadmin':
        return jsonify({'success': False, 'error': 'Cannot delete super admin'}), 400

    db.session.delete(admin)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Admin removed'})


@app.route('/members', methods=['GET'])
@jwt_required(*ADMIN_ROLES)
def get_members():
    category = request.args.get('category')
    members = (
        Member.query.filter_by(category=category).all()
        if category
        else Member.query.filter(Member.status != 'pending').all()
    )
    return jsonify([m.to_dict() for m in members])


@app.route('/admin/pending-members', methods=['GET'])
@jwt_required(*ADMIN_ROLES)
def get_pending_members():
    members = Member.query.filter_by(status='pending').order_by(Member.registration_date.desc()).all()
    return jsonify([m.to_dict() for m in members])


@app.route('/admin/approve-member/<int:member_id>', methods=['POST'])
@jwt_required(*ADMIN_ROLES)
def approve_member(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'success': False, 'error': 'Member not found'}), 404

    action = get_request_json().get('action', 'approve')
    member.status = 'approved' if action == 'approve' else 'rejected'
    member.is_verified = action == 'approve'
    db.session.commit()
    return jsonify({'success': True, 'message': f'Member {action}d'})


@app.route('/admin/register-member', methods=['POST'])
@jwt_required(*ADMIN_ROLES)
def admin_register_member():
    try:
        data = request.json
        required = ['full_names', 'national_id', 'phone_number', 'county', 'constituency', 'ward', 'physical_location', 'category']
        missing = [f for f in required if not data.get(f)]

        if missing:
            return jsonify({'error': f'Missing: {", ".join(missing)}'}), 400

        if Member.query.filter_by(national_id=data['national_id']).first():
            return jsonify({'error': 'National ID already registered'}), 400

        if Member.query.filter_by(phone_number=data['phone_number']).first():
            return jsonify({'error': 'Phone number already registered'}), 400

        member = Member(
            full_names=data['full_names'],
            national_id=data['national_id'],
            phone_number=data['phone_number'],
            email=data.get('email', ''),
            county=data['county'],
            constituency=data['constituency'],
            ward=data['ward'],
            physical_location=data['physical_location'],
            category=data['category'],
            status='approved',
            created_by='admin',
            is_verified=True
        )

        db.session.add(member)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Member registered successfully', 'member_data': member.to_dict()})

    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500


# ── Meetings ──

@app.route('/meetings', methods=['GET'])
def get_meetings():
    return jsonify([m.to_dict() for m in Meeting.query.order_by(Meeting.date.desc()).all()])


@app.route('/meetings', methods=['POST'])
@jwt_required(*ADMIN_ROLES)
def create_meeting():
    try:
        data = request.json
        for f in ['title', 'date', 'time']:
            if not data.get(f):
                return jsonify({'error': f'{f} is required'}), 400

        meeting = Meeting(
            title=data['title'],
            date=data['date'],
            time=data['time'],
            venue=data.get('venue', ''),
            agenda=data.get('description', ''),
            meeting_type=data.get('meeting_type', 'physical')
        )
        db.session.add(meeting)
        db.session.commit()

        meeting_snapshot = meeting.to_dict()

        # Fetch ALL active members with valid phone numbers
        phone_numbers = [
            m.phone_number
            for m in Member.query.filter_by(status='approved').all()
            if getattr(m, 'phone_number', None) and str(m.phone_number).strip()
        ]

        # Non-blocking SMS trigger
        def _send_sms_background():
            try:
                message = build_meeting_alert_message(
                    title=meeting_snapshot.get('title', ''),
                    date=meeting_snapshot.get('date', ''),
                    time=meeting_snapshot.get('time', ''),
                    venue=meeting_snapshot.get('venue', '')
                )

                app_logger.info(
                    "Queueing meeting alert SMS",
                    extra={'recipients': len(phone_numbers), 'meeting_id': meeting_snapshot.get('id')},
                )

                result = send_bulk_sms(phone_numbers, message)

                if result.get('success'):
                    app_logger.info(
                        "Meeting alert SMS sent successfully",
                        extra={'sent': result.get('sent'), 'total': result.get('total')},
                    )
                else:
                    app_logger.warning(
                        "Meeting alert SMS failed",
                        extra={
                            'sent': result.get('sent'),
                            'total': result.get('total'),
                            'reason': result.get('reason'),
                        },
                    )
            except Exception as e:
                # absolute safety: never crash API response
                app_logger.error(f"Meeting SMS background error: {str(e)}", exc_info=True)

        threading.Thread(target=_send_sms_background, daemon=True).start()

        return jsonify({'success': True, 'meeting': meeting_snapshot, 'sms_recipients': len(phone_numbers)})


    except Exception as e:
        db.session.rollback()
        app_logger.error(f"Create meeting error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to create meeting'}), 500


# ── SMS (custom admin sender) ──

@app.route('/send-bulk-sms', methods=['POST'])
@jwt_required(*ADMIN_ROLES)
def send_bulk_sms():

    try:
        data = get_request_json()
        message = (data.get('message', '') or '').strip()
        if not message:
            return jsonify({'error': 'Message is required'}), 400

        category = (data.get('category', '') or '').strip()
        members = (
            Member.query.filter_by(category=category, status='approved').all()
            if category
            else Member.query.filter_by(status='approved').all()
        )
        phone_numbers = [m.phone_number for m in members if m.phone_number]
        if not phone_numbers:
            return jsonify({'success': False, 'error': 'No approved members with phone numbers found'}), 400

        def _send():
            result = send_sms(phone_numbers, message)
            app_logger.info(f"Bulk SMS result: sent={result.get('sent')}/{result.get('total')}")

        threading.Thread(target=_send, daemon=True).start()
        app_logger.info(f"Bulk SMS queued: {len(phone_numbers)} recipients, category='{category or 'all'}'")
        return jsonify({'success': True, 'recipients': len(phone_numbers)})

    except Exception as e:
        app_logger.error(f"SMS sending error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to send SMS'}), 500


# ── M-Pesa (public) ──

@app.route('/mpesa-stk-push', methods=['POST'])
def mpesa_stk_push():
    try:
        data = get_request_json()
        phone = (data.get('phone', '') or '').strip()
        amount = data.get('amount', '')
        name = (data.get('name', '') or '').strip()

        if not phone or not amount or not name:
            return jsonify({'success': False, 'error': 'All fields are required'}), 400

        if phone.startswith('0'):
            phone = '254' + phone[1:]
        elif phone.startswith('+'):
            phone = phone[1:]

        app_logger.info(f"M-Pesa STK push initiated for {name} (KES {amount})")
        return jsonify({'success': True, 'phone': phone, 'amount': amount})

    except Exception as e:
        app_logger.error(f"M-Pesa STK push error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Payment request failed'}), 500


# ── Global Error Handlers ──

@app.errorhandler(404)
def not_found(error):
    app_logger.warning(f"404 Not Found: {request.path}")
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    app_logger.error(f"500 Internal Error: {str(error)}", exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500


@app.before_request
def log_request():
    if not request.path.startswith('/health') and not request.path.startswith('/live') and not request.path.startswith('/ready'):
        app_logger.debug(f"{request.method} {request.path} from {request.remote_addr}")


@app.teardown_appcontext
def shutdown_session(exception=None):
    if exception:
        app_logger.error(f"Request ended with exception: {str(exception)}", exc_info=True)
    db.session.remove()


# ── Email verification (public) ──

@app.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    admin = Admin.query.filter_by(verification_token=token).first()
    if not admin:
        return jsonify({'success': False, 'message': 'Invalid verification link'}), 400
    if admin.verification_token_expires and datetime.utcnow() > admin.verification_token_expires:
        return jsonify({'success': False, 'message': 'Verification link has expired. Ask super admin to resend.'}), 400

    admin.email_verified = True
    admin.verification_token = None
    admin.verification_token_expires = None
    db.session.commit()
    auth_logger.info(f"Email verified for admin: {admin.username}")
    return jsonify({'success': True, 'message': 'Email verified successfully. You can now log in.'})


@app.route('/admin/resend-verification', methods=['POST'])
@jwt_required('superadmin')
def resend_verification():
    data = get_request_json()
    admin = Admin.query.filter_by(username=data.get('username', '')).first()
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    token = secrets.token_urlsafe(32)
    admin.verification_token = token
    admin.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
    db.session.commit()

    threading.Thread(
        target=send_verification_email,
        args=(admin.full_name, admin.email, token),
        daemon=True
    ).start()

    return jsonify({'success': True, 'message': 'Verification email resent'})


# ── Google OAuth (JWT only; creates member accounts) ──

@app.route('/auth/google/login', methods=['GET'])
def auth_google_login():
    try:
        state = secrets.token_urlsafe(32)
        redirect_url = google_login_redirect_url(state)
        # We keep state in query for minimal changes (no server-side storage required).
        return jsonify({'success': True, 'redirect_url': redirect_url + f"&state={state}"})
    except Exception as e:
        app_logger.error(f"Google OAuth login error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'message': 'Google login failed'}), 500


@app.route('/auth/google/callback', methods=['GET'])
def auth_google_callback():
    try:
        code = request.args.get('code')
        if not code:
            return jsonify({'success': False, 'message': 'Missing code'}), 400

        # Exchange code for Google tokens
        token_response = exchange_code_for_tokens(code)
        id_token = token_response.get('id_token')
        if not id_token:
            return jsonify({'success': False, 'message': 'Missing id_token'}), 400

        # Verify ID token and claims
        decoded = _verify_id_token(id_token)
        email = decoded.get('email')
        email_verified = decoded.get('email_verified')
        if not email or not email_verified:
            return jsonify({'success': False, 'message': 'Unverified email'}), 403

        # Find or create member by email
        name = decoded.get('name') or email.split('@')[0]
        member = find_or_create_member_by_email(email=email, full_name=name)

        # Generate existing JWT token
        jwt_token = jwt.encode(
            {
                'member_id': member.id,
                'role': 'member',
                'exp': datetime.utcnow() + timedelta(days=7)
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

        # Redirect to frontend with token ONLY in query
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000').rstrip('/')
        user_payload = {
            'id': member.id,
            'name': member.full_names,
            'email': member.email,
            'role': 'member'
        }

        from urllib.parse import quote
        token_q = quote(jwt_token if isinstance(jwt_token, str) else str(jwt_token), safe='')
        user_q = quote(str(user_payload), safe='')
        # Keep minimal: frontend will ignore user and call /me using token.
        return f"<html><body><script>window.location.href='{frontend_url}/?google_token={token_q}';</script></body></html>"

    except Exception as e:
        app_logger.error(f"Google OAuth callback error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'message': 'Google callback failed'}), 500


if __name__ == '__main__':
    debug_enabled = os.environ.get('FLASK_DEBUG', '').lower() in {'1', 'true', 'yes', 'on'}
    app_logger.info(f"Starting Foundation application - Debug: {debug_enabled}")
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=debug_enabled, host='0.0.0.0', port=port)


