from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class CallLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    caller_name = db.Column(db.String(100))
    phone = db.Column(db.String(20), nullable=False)
    call_type = db.Column(db.String(50))  # inquiry, complaint, registration
    message = db.Column(db.Text)
    response_sent = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class AutoResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    trigger_type = db.Column(db.String(50))  # new_member, thanks, inquiry
    message_template = db.Column(db.Text)
    paybill_no = db.Column(db.String(20))
    whatsapp_group = db.Column(db.String(200))

class Member(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    id_no = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    polling_centre = db.Column(db.String(100), nullable=False)
    ward = db.Column(db.String(100), nullable=False)
    constituency = db.Column(db.String(100), nullable=False)
    county = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'id_no': self.id_no,
            'phone': self.phone,
            'polling_centre': self.polling_centre,
            'ward': self.ward,
            'constituency': self.constituency,
            'county': self.county,
            'category': self.category,
            'registration_date': self.registration_date.isoformat()
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