from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from website_models import db, CallLog, AutoResponse, Member, Meeting, Attendance, MeetingMinutes, Admin, Resource, Payment
from datetime import datetime
import os

app = Flask(__name__)

# Use absolute path for database
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'instance', 'foundation.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
# Allow all origins for development
CORS(app, supports_credentials=True)

def get_user_role():
    user_role = request.headers.get('User-Role', 'guest')
    user_id = request.headers.get('User-ID')
    return user_role, user_id

def is_admin():
    user_role, _ = get_user_role()
    return user_role == 'admin'

def is_member():
    user_role, user_id = get_user_role()
    return user_role == 'member' and user_id is not None

def init_db():
    from website_models import db, CallLog, AutoResponse, Member, Meeting, Attendance, MeetingMinutes, Admin, Resource, Payment
    from admin_models import Assignment, Report, FinancialRecord
    
    # Ensure instance folder exists
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'instance')
    os.makedirs(instance_path, exist_ok=True)
    
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")
        
        # Create default admin if not exists
        if not Admin.query.first():
            default_admin = Admin(
                username='admin',
                password='admin123',  # Change this in production!
                full_name='System Administrator',
                email='admin@mbogofoundation.org',
                phone='+254700000000',
                role='admin',
                is_active=True
            )
            db.session.add(default_admin)
            db.session.commit()
            print("Default admin account created: username='admin', password='admin123'")
        
        if not AutoResponse.query.first():
            responses = [
                AutoResponse(trigger_type='new_member', 
                           message_template='Welcome! Paybill: 123456. WhatsApp: https://chat.whatsapp.com/xyz',
                           paybill_no='123456',
                           whatsapp_group='https://chat.whatsapp.com/xyz'),
                AutoResponse(trigger_type='inquiry',
                           message_template='Thank you for your inquiry. We will get back to you soon.'),
                AutoResponse(trigger_type='complaint',
                           message_template='We have received your complaint and will address it promptly.')
            ]
            for resp in responses:
                db.session.add(resp)
            db.session.commit()
            print("Default auto-responses added")
        
        # Add default test members if they don't exist
        peter = Member.query.filter(Member.full_names.ilike('%peter%')).first()
        if not peter:
            peter = Member(
                full_names='Peter Maina',
                national_id='12345678',
                phone_number='0712345678',
                county='Nairobi',
                constituency='Kasarani',
                ward='Ruaraka',
                physical_location='Kariobangi',
                category='Youth Leader',
                is_verified=True
            )
            db.session.add(peter)
            print("Added Peter Maina")
        
        roselyne = Member.query.filter(Member.full_names.ilike('%roselyne%')).first()
        if not roselyne:
            roselyne = Member(
                full_names='Roselyne Akinyi',
                national_id='87654321',
                phone_number='0723456789',
                county='Kisumu',
                constituency='Kisumu Central',
                ward='Nyalenda',
                physical_location='Nyalenda',
                category='Community Member',
                is_verified=True
            )
            db.session.add(roselyne)
            print("Added Roselyne Akinyi")
        
        db.session.commit()

init_db()

@app.route('/health', methods=['GET'])
def health_check():
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({'status': 'healthy', 'database': 'connected'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    existing_user = Member.query.filter_by(phone_number=data['phone_number']).first()
    if existing_user:
        return jsonify({'error': 'Phone number already registered'}), 400
    
    return jsonify({'message': 'Account created successfully', 'phone_number': data['phone_number']})

@app.route('/send-welcome-sms', methods=['POST'])
def send_welcome_sms():
    data = request.json
    phone_number = data['phone_number']
    member_name = data['member_name']
    sms_message = f"Welcome to Mbogo Welfare Empowerment Foundation, {member_name}. You have been successfully registered as a member. Thank you for joining us."
    print(f"SMS sent to {phone_number}: {sms_message}")
    
    return jsonify({
        'status': 'sent',
        'message': 'Welcome SMS sent successfully',
        'phone_number': phone_number
    })

@app.route('/')
def home():
    return render_template_string('''
    <!DOCTYPE html>
    <html>
    <head><title>Foundation Website</title></head>
    <body>
        <h1>Welcome to Our Foundation</h1>
        <div id="contact-form">
            <h3>Contact Us</h3>
            <input id="name" placeholder="Your Name">
            <input id="phone" placeholder="Phone Number">
            <select id="type">
                <option value="inquiry">General Inquiry</option>
                <option value="complaint">Complaint</option>
                <option value="registration">Registration</option>
            </select>
            <textarea id="message" placeholder="Your Message"></textarea>
            <button onclick="submitContact()">Submit</button>
        </div>
        <script>
        function submitContact() {
            fetch('/log-call', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    phone: document.getElementById('phone').value,
                    call_type: document.getElementById('type').value,
                    message: document.getElementById('message').value
                })
            }).then(res => res.json()).then(data => alert(data.message));
        }
        </script>
    </body>
    </html>
    ''')

@app.route('/log-call', methods=['POST'])
def log_call():
    data = request.json
    call = CallLog(
        caller_name=data['name'],
        phone=data['phone'],
        call_type=data['call_type'],
        message=data['message']
    )
    db.session.add(call)
    db.session.commit()
    
    response = AutoResponse.query.filter_by(trigger_type=data['call_type']).first()
    if response:
        return jsonify({
            'message': response.message_template,
            'paybill': response.paybill_no,
            'whatsapp': response.whatsapp_group
        })
    return jsonify({'message': 'Thank you for contacting us!'})


@app.route('/register-member-pro', methods=['POST', 'OPTIONS'])
def register_member_pro():
    if request.method == 'OPTIONS':
        response = app.make_response('')
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
    
    try:
        data = request.json
        print("=" * 50)
        print("Registration attempt received")
        print(f"Data keys: {list(data.keys()) if data else 'None'}")
        
        if not data:
            return jsonify({'error': 'No data received'}), 400
        
        required_fields = ['full_names', 'national_id', 'phone_number', 'county', 'constituency', 'ward', 'physical_location', 'category']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            print(f"Missing fields: {missing_fields}")
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Check for existing National ID
        existing_member = Member.query.filter_by(national_id=data['national_id']).first()
        if existing_member:
            print(f"Duplicate registration attempt for national_id: {data['national_id']}")
            return jsonify({'error': 'This National ID is already registered. Please login instead.'}), 400
        
        # Check for existing phone number
        existing_phone = Member.query.filter_by(phone_number=data['phone_number']).first()
        if existing_phone:
            print(f"Duplicate registration attempt for phone_number: {data['phone_number']}")
            return jsonify({'error': 'This phone number is already registered. Please login instead.'}), 400
        
        member = Member(
            full_names=data['full_names'],
            national_id=data['national_id'],
            phone_number=data['phone_number'],
            county=data['county'],
            constituency=data['constituency'],
            ward=data['ward'],
            physical_location=data['physical_location'],
            gps_latitude=data.get('gps_latitude', ''),
            gps_longitude=data.get('gps_longitude', ''),
            category=data['category'],
            is_verified=True
        )
        db.session.add(member)
        db.session.commit()
        print(f"SUCCESS: Member created with ID: {member.id}")
        
        response = jsonify({
            'message': 'Registration successful', 
            'user_id': member.id,
            'member_data': {
                'full_names': member.full_names,
                'national_id': member.national_id,
                'phone_number': member.phone_number,
                'county': member.county,
                'constituency': member.constituency,
                'ward': member.ward,
                'category': member.category
            }
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    except Exception as e:
        db.session.rollback()
        error_msg = str(e)
        print(f"Registration error: {error_msg}")
        import traceback
        traceback.print_exc()
        if 'UNIQUE constraint failed' in error_msg:
            return jsonify({'error': 'This National ID or phone number is already registered.'}), 400
        elif 'FOREIGN KEY constraint' in error_msg:
            return jsonify({'error': 'Invalid data provided. Please check all fields.'}), 400
        else:
            return jsonify({'error': 'Registration failed. Please try again.', 'details': error_msg}), 500


@app.route('/register-member', methods=['POST'])
def register_member():
    return register_member_pro()

@app.route('/members', methods=['GET'])
def get_members():
    user_role = request.headers.get('User-Role', 'member')
    user_id = request.headers.get('User-ID')
    
    if user_role == 'admin':
        category = request.args.get('category')
        if category:
            members = Member.query.filter_by(category=category).all()
        else:
            members = Member.query.all()
        return jsonify([member.to_dict() for member in members])
    else:
        if user_id:
            member = Member.query.get(user_id)
            if member:
                return jsonify([member.to_dict()])
        return jsonify([])

@app.route('/member-profile', methods=['GET'])
def get_member_profile():
    user_role, user_id = get_user_role()
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    if user_role == 'admin':
        member_id = request.args.get('member_id')
        if member_id:
            member = Member.query.get(member_id)
        else:
            return jsonify({'error': 'member_id required for admin'}), 400
    else:
        member = Member.query.get(user_id)
    
    if member:
        return jsonify(member.to_dict())
    return jsonify({'error': 'Member not found'}), 404

@app.route('/my-messages', methods=['GET'])
def get_my_messages():
    user_role, user_id = get_user_role()
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    if user_role == 'admin':
        call_logs = CallLog.query.order_by(CallLog.timestamp.desc()).all()
    else:
        member = Member.query.get(user_id)
        if member:
            call_logs = CallLog.query.filter_by(phone=member.phone_number).order_by(CallLog.timestamp.desc()).all()
        else:
            call_logs = []
    
    return jsonify([{
        'id': log.id,
        'caller_name': log.caller_name,
        'phone': log.phone,
        'call_type': log.call_type,
        'message': log.message,
        'response_sent': log.response_sent,
        'timestamp': log.timestamp.isoformat()
    } for log in call_logs])

@app.route('/meetings', methods=['GET'])
def get_meetings():
    user_role, user_id = get_user_role()
    
    meetings = Meeting.query.order_by(Meeting.date.desc()).all()
    
    return jsonify([meeting.to_dict() for meeting in meetings])

@app.route('/attendance-records', methods=['GET'])
def get_attendance_records():
    user_role, user_id = get_user_role()
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    if user_role == 'admin':
        member_id = request.args.get('member_id')
        if member_id:
            records = Attendance.query.filter_by(member_id=member_id).all()
        else:
            records = Attendance.query.all()
    else:
        records = Attendance.query.filter_by(member_id=user_id).all()
    
    result = []
    for record in records:
        meeting = Meeting.query.get(record.meeting_id)
        member = Member.query.get(record.member_id)
        result.append({
            'id': record.id,
            'meeting_id': record.meeting_id,
            'meeting_title': meeting.title if meeting else 'Unknown',
            'meeting_date': meeting.date if meeting else 'Unknown',
            'member_id': record.member_id,
            'member_name': member.full_names if member else 'Unknown',
            'status': record.status,
            'recorded_date': record.recorded_date.isoformat()
        })
    
    return jsonify(result)

@app.route('/admin/all-members', methods=['GET'])
def admin_get_all_members():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    members = Member.query.all()
    return jsonify([member.to_dict() for member in members])

@app.route('/admin/all-call-logs', methods=['GET'])
def admin_get_all_call_logs():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    call_logs = CallLog.query.order_by(CallLog.timestamp.desc()).all()
    return jsonify([{
        'id': log.id,
        'caller_name': log.caller_name,
        'phone': log.phone,
        'call_type': log.call_type,
        'message': log.message,
        'response_sent': log.response_sent,
        'timestamp': log.timestamp.isoformat()
    } for log in call_logs])

@app.route('/admin/all-attendance', methods=['GET'])
def admin_get_all_attendance():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    records = Attendance.query.all()
    result = []
    for record in records:
        meeting = Meeting.query.get(record.meeting_id)
        member = Member.query.get(record.member_id)
        result.append({
            'id': record.id,
            'meeting_id': record.meeting_id,
            'meeting_title': meeting.title if meeting else 'Unknown',
            'meeting_date': meeting.date if meeting else 'Unknown',
            'member_id': record.member_id,
            'member_name': member.full_names if member else 'Unknown',
            'status': record.status,
            'recorded_date': record.recorded_date.isoformat()
        })
    
    return jsonify(result)

@app.route('/admin/meeting-minutes', methods=['GET'])
def admin_get_meeting_minutes():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403
    
    minutes = MeetingMinutes.query.order_by(MeetingMinutes.created_date.desc()).all()
    return jsonify([m.to_dict() for m in minutes])

@app.route('/members/categories', methods=['GET'])
def get_member_categories():
    user_role, user_id = get_user_role()
    
    if not user_id:
        return jsonify({'error': 'Authentication required'}), 401
    
    categories = db.session.query(Member.category).distinct().all()
    return jsonify([c[0] for c in categories if c[0]])


# ========== LOGIN ENDPOINTS ==========

@app.route('/member-login', methods=['POST'])
def member_login():
    """Authenticate a member using full_name and national_id"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'No data received'}), 400
        
        full_name = data.get('full_name', '').strip()
        national_id = data.get('national_id', '').strip()
        
        if not full_name or not national_id:
            return jsonify({'success': False, 'message': 'Full name and National ID are required'}), 400
        
        # Query member by full_name (case-insensitive) and national_id
        member = Member.query.filter(
            db.func.lower(Member.full_names) == db.func.lower(full_name),
            Member.national_id == national_id
        ).first()
        
        if not member:
            # Try alternative: search by name containing the input (case-insensitive)
            member = Member.query.filter(
                db.func.lower(Member.full_names).contains(db.func.lower(full_name)),
                Member.national_id == national_id
            ).first()
        
        if not member:
            return jsonify({'success': False, 'message': 'Invalid credentials. Please check your name and National ID.'}), 401
        
        # Update last login
        member.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user_id': member.id,
            'role': 'member',
            'name': member.full_names,
            'phone_number': member.phone_number,
            'national_id': member.national_id,
            'category': member.category
        })
        
    except Exception as e:
        print(f"Member login error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Login failed. Please try again.'}), 500


@app.route('/admin-login', methods=['POST'])
def admin_login():
    """Authenticate an admin using username and password"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'message': 'No data received'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Username and password are required'}), 400
        
        # Query admin by username
        admin = Admin.query.filter_by(username=username).first()
        
        if not admin:
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
        
        # Check password (simple comparison - in production use proper hashing)
        if admin.password != password:
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
        
        # Check if admin is active
        if not admin.is_active:
            return jsonify({'success': False, 'message': 'Your account has been deactivated'}), 401
        
        # Update last login
        admin.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user_id': admin.id,
            'role': 'admin',
            'name': admin.full_name,
            'username': admin.username
        })
        
    except Exception as e:
        print(f"Admin login error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': 'Login failed. Please try again.'}), 500



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
