from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from website_models import db, CallLog, AutoResponse, Member, Meeting, Attendance, MeetingMinutes
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///foundation_complete.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    
    # Check if phone number already exists
    existing_user = Member.query.filter_by(phone_number=data['phone_number']).first()
    if existing_user:
        return jsonify({'error': 'Phone number already registered'}), 400
    
    # Store signup data temporarily (in production, use proper session management)
    return jsonify({'message': 'Account created successfully', 'phone_number': data['phone_number']})

@app.route('/send-welcome-sms', methods=['POST'])
def send_welcome_sms():
    data = request.json
    phone_number = data['phone_number']
    member_name = data['member_name']
    
    # SMS message content
    sms_message = f"Welcome to Mbogo Welfare Empowerment Foundation, {member_name}. You have been successfully registered as a member. Thank you for joining us."
    
    # Simulate SMS sending (integrate with SMS gateway in production)
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
    
    # Auto-respond
    response = AutoResponse.query.filter_by(trigger_type=data['call_type']).first()
    if response:
        return jsonify({
            'message': response.message_template,
            'paybill': response.paybill_no,
            'whatsapp': response.whatsapp_group
        })
    return jsonify({'message': 'Thank you for contacting us!'})


@app.route('/register-member-pro', methods=['POST'])
def register_member_pro():
    data = request.json
    

    existing_member = Member.query.filter_by(national_id=data['national_id']).first()
    if existing_member:
        return jsonify({'error': 'User with this National ID already registered'}), 400
    
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
    
    return jsonify({
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


@app.route('/register-member', methods=['POST'])
def register_member():
    return register_member_pro()

@app.route('/members', methods=['GET'])
def get_members():
    user_role = request.headers.get('User-Role', 'member')
    user_id = request.headers.get('User-ID')
    
    if user_role == 'admin':
        # Admin can see all members
        category = request.args.get('category')
        if category:
            members = Member.query.filter_by(category=category).all()
        else:
            members = Member.query.all()
        return jsonify([member.to_dict() for member in members])
    else:
        # Regular members can only see their own details
        if user_id:
            member = Member.query.get(user_id)
            if member:
                return jsonify([member.to_dict()])
        return jsonify([])

@app.route('/members/categories', methods=['GET'])
def get_categories():
    categories = db.session.query(Member.category).distinct().all()
    return jsonify([cat[0] for cat in categories])


@app.route('/send-bulk-message', methods=['POST'])
def send_bulk_message():
    data = request.json
    category = data.get('category')
    message = data['message']
    
    if category:
        members = Member.query.filter_by(category=category).all()
    else:
        members = Member.query.all()
    
    phone_numbers = [member.phone for member in members]
    
    return jsonify({
        'message': 'Bulk message prepared',
        'recipients': len(phone_numbers),
        'phones': phone_numbers
    })


@app.route('/assignments', methods=['GET', 'POST'])
def assignments():
    if request.method == 'POST':
        from admin_models import Assignment
        data = request.json
        assignment = Assignment(
            title=data['title'],
            description=data['description'],
            assigned_to=data['assigned_to'],
            priority=data['priority'],
            due_date=datetime.fromisoformat(data['due_date']) if data['due_date'] else None
        )
        db.session.add(assignment)
        db.session.commit()
        return jsonify({'message': 'Assignment created'})
    
    from admin_models import Assignment
    assignments = Assignment.query.all()
    return jsonify([a.to_dict() for a in assignments])

@app.route('/assignments/<int:id>', methods=['PUT'])
def update_assignment(id):
    from admin_models import Assignment
    assignment = Assignment.query.get(id)
    data = request.json
    assignment.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Assignment updated'})

@app.route('/send-bulk-sms', methods=['POST'])
def send_bulk_sms():
    data = request.json
    category = data.get('category')
    message = data['message']
    
    if category:
        members = Member.query.filter_by(category=category).all()
    else:
        members = Member.query.all()
    
    phone_numbers = [member.phone for member in members]
    
    import time
    time.sleep(1)
    for member in members:
        print(f"SMS sent to {member.name} ({member.phone}): {message}")
    
    return jsonify({
        'status': 'Delivered',
        'recipients': len(phone_numbers),
        'phones': phone_numbers,
        'message': f'SMS broadcast sent to {len(phone_numbers)} members'
    })


@app.route('/meetings', methods=['GET', 'POST'])
def meetings():
    if request.method == 'POST':
        data = request.json
        meeting = Meeting(
            title=data['title'],
            date=data['date'],
            time=data['time'],
            venue=data.get('venue', ''),
            agenda=data.get('agenda', ''),
            category=data.get('category', ''),
            meeting_type=data.get('meeting_type', 'physical'),
            meeting_link=data.get('meeting_link', '')
        )
        db.session.add(meeting)
        db.session.commit()
        return jsonify({'message': 'Meeting registered successfully'})
    
    meetings = Meeting.query.all()
    return jsonify([meeting.to_dict() for meeting in meetings])

@app.route('/attendance', methods=['POST'])
def record_attendance():
    data = request.json
    attendance = Attendance(
        meeting_id=data['meeting_id'],
        member_id=data['member_id'],
        status=data['status']
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify({'message': 'Attendance recorded successfully'})

@app.route('/attendance-records', methods=['GET'])
def get_attendance_records():
    member_id = request.args.get('member_id')
    
    if member_id:
        # Get attendance for specific member
        records = db.session.query(
            Attendance.id,
            Attendance.status,
            Attendance.recorded_date,
            Meeting.title.label('meeting_title'),
            Meeting.date.label('meeting_date')
        ).join(Meeting, Attendance.meeting_id == Meeting.id)\
         .filter(Attendance.member_id == member_id).all()
    else:
        # Get all attendance records
        records = db.session.query(
            Attendance.id,
            Attendance.status,
            Attendance.recorded_date,
            Meeting.title.label('meeting_title'),
            Member.name.label('member_name')
        ).join(Meeting, Attendance.meeting_id == Meeting.id)\
         .join(Member, Attendance.member_id == Member.id).all()
    
    if member_id:
        return jsonify([{
            'id': record.id,
            'status': record.status,
            'recorded_date': record.recorded_date.isoformat(),
            'meeting_title': record.meeting_title,
            'meeting_date': record.meeting_date
        } for record in records])
    else:
        return jsonify([{
            'id': record.id,
            'status': record.status,
            'recorded_date': record.recorded_date.isoformat(),
            'meeting_title': record.meeting_title,
            'member_name': record.member_name
        } for record in records])


@app.route('/meeting-minutes', methods=['GET', 'POST'])
def meeting_minutes():
    if request.method == 'POST':
        data = request.json
        minutes = MeetingMinutes(
            meeting_id=data['meeting_id'],
            secretary_name=data['secretary_name'],
            content=data['content'],
            attendees_present=data.get('attendees_present', ''),
            attendees_absent=data.get('attendees_absent', ''),
            action_items=data.get('action_items', ''),
            next_meeting_date=data.get('next_meeting_date', '')
        )
        db.session.add(minutes)
        db.session.commit()
        return jsonify({'message': 'Meeting minutes saved successfully'})
    

    minutes_records = db.session.query(
        MeetingMinutes.id,
        MeetingMinutes.secretary_name,
        MeetingMinutes.content,
        MeetingMinutes.attendees_present,
        MeetingMinutes.attendees_absent,
        MeetingMinutes.action_items,
        MeetingMinutes.next_meeting_date,
        MeetingMinutes.created_date,
        Meeting.title.label('meeting_title'),
        Meeting.date.label('meeting_date')
    ).join(Meeting, MeetingMinutes.meeting_id == Meeting.id).all()
    
    return jsonify([{
        'id': record.id,
        'secretary_name': record.secretary_name,
        'content': record.content,
        'attendees_present': record.attendees_present,
        'attendees_absent': record.attendees_absent,
        'action_items': record.action_items,
        'next_meeting_date': record.next_meeting_date,
        'created_date': record.created_date.isoformat(),
        'meeting_title': record.meeting_title,
        'meeting_date': record.meeting_date
    } for record in minutes_records])


@app.route('/sign-in-meeting', methods=['POST'])
def sign_in_meeting():
    data = request.json
    attendance = Attendance(
        meeting_id=data['meeting_id'],
        member_id=data['user_id'],
        status='Present'
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify({'message': 'Attendance recorded successfully'})

@app.route('/announcements', methods=['GET'])
def get_announcements():

    announcements = [
        {
            'title': 'Community Meeting This Friday',
            'content': 'Join us for our monthly community meeting to discuss upcoming projects and initiatives.',
            'priority': 'high',
            'date': '2025-01-27'
        },
        {
            'title': 'New Registration Process',
            'content': 'We have updated our registration process to include GPS location capture for better service delivery.',
            'priority': 'normal',
            'date': '2025-01-25'
        }
    ]
    return jsonify(announcements)

@app.route('/my-attendance', methods=['GET'])
def get_my_attendance():

    attendance_records = [
        {
            'meeting_title': 'Monthly Community Meeting',
            'meeting_date': '2025-01-20',
            'status': 'Present'
        },
        {
            'meeting_title': 'Youth Leadership Training',
            'meeting_date': '2025-01-15',
            'status': 'Present'
        }
    ]
    return jsonify(attendance_records)

@app.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.json
    if data['username'] == 'admin' and data['password'] == 'admin123':
        return jsonify({'success': True, 'role': 'admin', 'user_id': 'admin'})
    return jsonify({'success': False})

@app.route('/member-login', methods=['POST'])
def member_login():
    data = request.json
    member = Member.query.filter_by(national_id=data['national_id']).first()
    if member:
        return jsonify({
            'success': True, 
            'role': 'member', 
            'user_id': member.id,
            'name': member.full_names
        })
    return jsonify({'success': False})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

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
    
    app.run(host='0.0.0.0', debug=True)