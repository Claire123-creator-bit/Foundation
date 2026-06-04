from flask import Flask, request, jsonify
from flask_cors import CORS
from website_models import db, Member, Meeting, Admin
from datetime import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

db_url = os.environ.get('DATABASE_URL', 'postgresql://postgres:Cla1mbo2-=p@db.rvgnlfspwoybsgwrjpdb.supabase.co:5432/postgres')
# Fix for SQLAlchemy compatibility
if db_url.startswith('postgres://'):
    db_url = db_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app, supports_credentials=True, origins=[
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://foundation-drab-eta.vercel.app',
    'https://*.vercel.app'
])

def is_admin():
    return request.headers.get('User-Role') == 'admin'

def init_db():
    from admin_models import Assignment, Report, FinancialRecord
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")
        if not Admin.query.filter_by(username='superadmin').first():
            admin = Admin(
                username='superadmin',
                password=generate_password_hash('Mbogo@2025'),
                full_name='Super Admin',
                email='admin@mbogofoundation.org',
                phone='',
                role='superadmin',
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
            print("Superadmin created")
        else:
            # Reset password on every startup to ensure it's correct
            admin = Admin.query.filter_by(username='superadmin').first()
            admin.password = generate_password_hash('Mbogo@2025')
            admin.role = 'superadmin'
            admin.is_active = True
            db.session.commit()
            print("Superadmin password reset")

init_db()

# ── Health ──
@app.route('/health', methods=['GET'])
def health_check():
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({'status': 'healthy', 'database': 'connected'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

# ── Admin Auth ──
@app.route('/admin-login', methods=['POST'])
def admin_login():
    try:
        data = request.json
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password are required'}), 400
        admin = Admin.query.filter_by(username=username).first()
        if not admin or not check_password_hash(admin.password, password):
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
        if not admin.is_active:
            return jsonify({'success': False, 'message': 'Account deactivated'}), 401
        admin.last_login = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True, 'name': admin.full_name, 'username': admin.username, 'email': admin.email, 'role': admin.role})
    except Exception:
        return jsonify({'success': False, 'message': 'Login failed'}), 500

@app.route('/admin-register', methods=['POST'])
def admin_register():
    # Only super admins can create new admins
    requesting_username = request.headers.get('Admin-Username', '')
    requester = Admin.query.filter_by(username=requesting_username).first()
    if not requester or requester.role != 'superadmin':
        return jsonify({'success': False, 'message': 'Only super admins can create admin accounts'}), 403
    try:
        data = request.json
        for f in ['username', 'password', 'full_name', 'email']:
            if not data.get(f):
                return jsonify({'success': False, 'message': f'{f} is required'}), 400
        if Admin.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'message': 'Username already exists'}), 400
        if Admin.query.filter_by(email=data['email'].lower()).first():
            return jsonify({'success': False, 'message': 'Email already registered'}), 400
        admin = Admin(username=data['username'], password=generate_password_hash(data['password']),
                      full_name=data['full_name'], email=data['email'].lower(),
                      phone=data.get('phone', ''), role=data.get('role', 'admin'), is_active=True)
        db.session.add(admin)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Admin account created successfully'})
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Registration failed'}), 500

# ── Member Auth ──
@app.route('/member-register', methods=['POST'])
def member_register():
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
            full_names=data['full_names'], national_id=data['national_id'],
            phone_number=data['phone_number'], category=data['category'],
            gender=data.get('gender', ''), county=data.get('county', ''),
            constituency=data.get('constituency', ''), ward=data.get('ward', ''),
            physical_location=data.get('physical_location', data.get('ward', '')),
            status='pending', created_by='self', is_verified=False
        )
        db.session.add(member)
        db.session.commit()
        return jsonify({'success': True})
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'error': 'Registration failed. Try again.'}), 500

@app.route('/member-login', methods=['POST'])
def member_login():
    try:
        data = request.json
        phone = data.get('phone_number', '').strip()
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
        return jsonify({'success': True, 'member': member.to_dict()})
    except Exception:
        return jsonify({'success': False, 'message': 'Something went wrong. Please try again.'}), 500

# ── Admin Management (Super Admin only) ──
@app.route('/admin/list-admins', methods=['GET'])
def list_admins():
    requesting_username = request.headers.get('Admin-Username', '')
    requester = Admin.query.filter_by(username=requesting_username).first()
    if not requester or requester.role != 'superadmin':
        return jsonify({'error': 'Super admin access required'}), 403
    admins = Admin.query.all()
    return jsonify([{'id': a.id, 'username': a.username, 'full_name': a.full_name, 'email': a.email, 'phone': a.phone, 'role': a.role, 'is_active': a.is_active, 'last_login': a.last_login.isoformat() if a.last_login else None} for a in admins])

@app.route('/admin/delete-admin/<int:admin_id>', methods=['DELETE'])
def delete_admin(admin_id):
    requesting_username = request.headers.get('Admin-Username', '')
    requester = Admin.query.filter_by(username=requesting_username).first()
    if not requester or requester.role != 'superadmin':
        return jsonify({'error': 'Super admin access required'}), 403
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404
    if admin.role == 'superadmin':
        return jsonify({'error': 'Cannot delete super admin'}), 400
    db.session.delete(admin)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Admin removed'})


@app.route('/members', methods=['GET'])
def get_members():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    category = request.args.get('category')
    members = Member.query.filter_by(category=category).all() if category else Member.query.filter(Member.status != 'pending').all()
    return jsonify([m.to_dict() for m in members])

@app.route('/admin/pending-members', methods=['GET'])
def get_pending_members():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    members = Member.query.filter_by(status='pending').order_by(Member.registration_date.desc()).all()
    return jsonify([m.to_dict() for m in members])

@app.route('/admin/approve-member/<int:member_id>', methods=['POST'])
def approve_member(member_id):
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'error': 'Member not found'}), 404
    action = (request.json or {}).get('action', 'approve')
    member.status = 'approved' if action == 'approve' else 'rejected'
    member.is_verified = action == 'approve'
    db.session.commit()
    return jsonify({'success': True, 'message': f'Member {action}d'})

# ── Admin Register Member ──
@app.route('/admin/register-member', methods=['POST'])
def admin_register_member():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
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
            full_names=data['full_names'], national_id=data['national_id'],
            phone_number=data['phone_number'], email=data.get('email', ''),
            county=data['county'], constituency=data['constituency'],
            ward=data['ward'], physical_location=data['physical_location'],
            category=data['category'], status='approved',
            created_by='admin', is_verified=True
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
def create_meeting():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    try:
        data = request.json
        for f in ['title', 'date', 'time']:
            if not data.get(f):
                return jsonify({'error': f'{f} is required'}), 400
        meeting = Meeting(title=data['title'], date=data['date'], time=data['time'],
                          venue=data.get('venue', ''), agenda=data.get('description', ''),
                          meeting_type=data.get('meeting_type', 'physical'))
        db.session.add(meeting)
        db.session.commit()
        return jsonify({'success': True, 'meeting': meeting.to_dict()})
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Failed to create meeting'}), 500

# ── SMS ──
@app.route('/send-bulk-sms', methods=['POST'])
def send_bulk_sms():
    try:
        data = request.json
        message = data.get('message', '').strip()
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        category = data.get('category', '')
        members = Member.query.filter_by(category=category, status='approved').all() if category else Member.query.filter_by(status='approved').all()
        for m in members:
            print(f"SMS to {m.phone_number}: {message}")
        return jsonify({'success': True, 'recipients': len(members)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ── M-Pesa ──
@app.route('/mpesa-stk-push', methods=['POST'])
def mpesa_stk_push():
    try:
        data = request.json
        phone = data.get('phone', '').strip()
        amount = data.get('amount', '')
        name = data.get('name', '')
        if not phone or not amount or not name:
            return jsonify({'success': False, 'error': 'All fields are required'}), 400
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        elif phone.startswith('+'):
            phone = phone[1:]
        # TODO: Wire Daraja API credentials here
        print(f"STK Push: {name} | {phone} | KES {amount} | {data.get('type', 'Donation')}")
        return jsonify({'success': True, 'phone': phone, 'amount': amount})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
