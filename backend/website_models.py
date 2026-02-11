from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class CallLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    caller_name = db.Column(db.String(100))
    phone = db.Column(db.String(20), nullable=False)
    call_type = db.Column(db.String(50))
    message = db.Column(db.Text)
    response_sent = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class AutoResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trigger_type = db.Column(db.String(50))
    message_template = db.Column(db.Text)
    paybill_no = db.Column(db.String(20))
    whatsapp_group = db.Column(db.String(200))

class Member(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_names = db.Column(db.String(150), nullable=False)
    national_id = db.Column(db.String(20), nullable=False, unique=True)
    phone_number = db.Column(db.String(20), nullable=False)
    county = db.Column(db.String(50), nullable=False)
    constituency = db.Column(db.String(100), nullable=False)
    ward = db.Column(db.String(100), nullable=False)
    physical_location = db.Column(db.String(200), nullable=False)
    gps_latitude = db.Column(db.String(20))
    gps_longitude = db.Column(db.String(20))
    category = db.Column(db.String(50), nullable=False)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_verified = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)
    
    name = db.Column(db.String(100))
    id_no = db.Column(db.String(20))
    phone = db.Column(db.String(20))
    polling_centre = db.Column(db.String(100))

    def to_dict(self):
        return {
            'id': self.id,
            'full_names': self.full_names or self.name,
            'national_id': self.national_id or self.id_no,
            'phone_number': self.phone_number or self.phone,
            'county': self.county,
            'constituency': self.constituency,
            'ward': self.ward,
            'physical_location': self.physical_location,
            'gps_latitude': self.gps_latitude,
            'gps_longitude': self.gps_longitude,
            'category': self.category,
            'registration_date': self.registration_date.isoformat(),
            'is_verified': self.is_verified,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(10), nullable=False)
    venue = db.Column(db.String(200))
    agenda = db.Column(db.Text)
    category = db.Column(db.String(50))
    meeting_type = db.Column(db.String(20), default='physical')
    meeting_link = db.Column(db.String(500))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'date': self.date,
            'time': self.time,
            'venue': self.venue,
            'agenda': self.agenda,
            'category': self.category,
            'meeting_type': self.meeting_type,
            'meeting_link': self.meeting_link,
            'created_date': self.created_date.isoformat()
        }

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meeting.id'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('member.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    recorded_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'meeting_id': self.meeting_id,
            'member_id': self.member_id,
            'status': self.status,
            'recorded_date': self.recorded_date.isoformat()
        }

class MeetingMinutes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meeting.id'), nullable=False)
    secretary_name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    attendees_present = db.Column(db.Text)
    attendees_absent = db.Column(db.Text)
    action_items = db.Column(db.Text)
    next_meeting_date = db.Column(db.String(20))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'meeting_id': self.meeting_id,
            'secretary_name': self.secretary_name,
            'content': self.content,
            'attendees_present': self.attendees_present,
            'attendees_absent': self.attendees_absent,
            'action_items': self.action_items,
            'next_meeting_date': self.next_meeting_date,
            'created_date': self.created_date.isoformat()
        }

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    role = db.Column(db.String(50), default='admin')
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'created_date': self.created_date.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    resource_type = db.Column(db.String(50), nullable=False)
    file_url = db.Column(db.String(500))
    category = db.Column(db.String(50))
    uploaded_by = db.Column(db.String(100))
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_public = db.Column(db.Boolean, default=True)
    download_count = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'resource_type': self.resource_type,
            'file_url': self.file_url,
            'category': self.category,
            'uploaded_by': self.uploaded_by,
            'upload_date': self.upload_date.isoformat(),
            'is_public': self.is_public,
            'download_count': self.download_count
        }

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.Integer, db.ForeignKey('member.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    transaction_id = db.Column(db.String(100))
    payment_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    confirmed_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'member_id': self.member_id,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'phone_number': self.phone_number,
            'transaction_id': self.transaction_id,
            'payment_type': self.payment_type,
            'status': self.status,
            'payment_date': self.payment_date.isoformat(),
            'confirmed_date': self.confirmed_date.isoformat() if self.confirmed_date else None,
            'notes': self.notes
        }