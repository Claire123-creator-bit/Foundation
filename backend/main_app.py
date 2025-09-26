from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from website_models import db, CallLog, AutoResponse, Member, Meeting, Attendance, MeetingMinutes
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///foundation_complete.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

# Website Routes
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

# Registration Routes
@app.route('/register-member', methods=['POST'])
def register_member():
    data = request.json
    member = Member(
        name=data['name'],
        id_no=data['id_no'],
        phone=data['phone'],
        polling_centre=data['polling_centre'],
        ward=data['ward'],
        constituency=data['constituency'],
        county=data['county'],
        category=data['category']
    )
    db.session.add(member)
    db.session.commit()
    return jsonify({'message': 'Member registered successfully'})

@app.route('/members', methods=['GET'])
def get_members():
    category = request.args.get('category')
    if category:
        members = Member.query.filter_by(category=category).all()
    else:
        members = Member.query.all()
    return jsonify([member.to_dict() for member in members])

@app.route('/members/categories', methods=['GET'])
def get_categories():
    categories = db.session.query(Member.category).distinct().all()
    return jsonify([cat[0] for cat in categories])

# Bulk messaging endpoint
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

# Admin Routes
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
    
    # Simulate SMS sending (in production, integrate with SMS gateway like Africa's Talking)
    import time
    time.sleep(1)  # Simulate sending delay
    
    # Log the SMS for record keeping
    for member in members:
        print(f"SMS sent to {member.name} ({member.phone}): {message}")
    
    return jsonify({
        'status': 'Delivered',
        'recipients': len(phone_numbers),
        'phones': phone_numbers,
        'message': f'SMS broadcast sent to {len(phone_numbers)} members'
    })

# Meeting Management Routes
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
    records = db.session.query(
        Attendance.id,
        Attendance.status,
        Attendance.recorded_date,
        Meeting.title.label('meeting_title'),
        Member.name.label('member_name')
    ).join(Meeting, Attendance.meeting_id == Meeting.id)\
     .join(Member, Attendance.member_id == Member.id).all()
    
    return jsonify([{
        'id': record.id,
        'status': record.status,
        'recorded_date': record.recorded_date.isoformat(),
        'meeting_title': record.meeting_title,
        'member_name': record.member_name
    } for record in records])

# Meeting Minutes Routes
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
    
    # Get minutes with meeting details
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

@app.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.json
    # Simple authentication (use proper auth in production)
    if data['username'] == 'admin' and data['password'] == 'admin123':
        return jsonify({'success': True})
    return jsonify({'success': False})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Add default auto-responses
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