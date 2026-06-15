from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True, index=True)
    password = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, index=True)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(50), default='admin')
    is_active = db.Column(db.Boolean, default=True, index=True)
    email_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), nullable=True)
    verification_token_expires = db.Column(db.DateTime, nullable=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone or '',
            'role': self.role,
            'is_active': self.is_active,
            'created_date': self.created_date.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }


class Member(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_names = db.Column(db.String(150), nullable=False)
    national_id = db.Column(db.String(20), nullable=False, unique=True, index=True)
    phone_number = db.Column(db.String(20), nullable=False, unique=True, index=True)
    email = db.Column(db.String(100))
    gender = db.Column(db.String(10))
    county = db.Column(db.String(50), nullable=False, index=True)
    constituency = db.Column(db.String(100), nullable=False)
    ward = db.Column(db.String(100), nullable=False)
    physical_location = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), nullable=False, index=True)
    status = db.Column(db.String(20), default='pending', index=True)
    created_by = db.Column(db.String(20), default='self')
    is_verified = db.Column(db.Boolean, default=False)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    last_active = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'full_names': self.full_names,
            'national_id': self.national_id,
            'phone_number': self.phone_number,
            'email': self.email or '',
            'gender': self.gender or '',
            'county': self.county,
            'constituency': self.constituency,
            'ward': self.ward,
            'physical_location': self.physical_location,
            'category': self.category,
            'status': self.status,
            'created_by': self.created_by,
            'is_verified': self.is_verified,
            'registration_date': self.registration_date.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'last_active': self.last_active.isoformat() if self.last_active else None,
        }


class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(20), nullable=False, index=True)
    time = db.Column(db.String(10), nullable=False)
    venue = db.Column(db.String(200))
    agenda = db.Column(db.Text)
    meeting_type = db.Column(db.String(20), default='physical')

    meeting_name = db.Column(db.String(200))
    date_time = db.Column(db.DateTime)
    attendance_count = db.Column(db.Integer, default=0)
    created_by = db.Column(db.String(50))

    created_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'date': self.date,
            'time': self.time,
            'venue': self.venue or '',
            'agenda': self.agenda or '',
            'meeting_type': self.meeting_type,
            'created_date': self.created_date.isoformat(),
            'meeting_name': self.meeting_name or self.title,
            'date_time': self.date_time.isoformat() if self.date_time else None,
            'attendance_count': self.attendance_count,
            'created_by': self.created_by or '',
        }


class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text)
    date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    location = db.Column(db.String(200))
    county = db.Column(db.String(50), index=True)
    constituency = db.Column(db.String(100))
    ward = db.Column(db.String(100), index=True)
    organizer = db.Column(db.String(150))
    created_by = db.Column(db.Integer, db.ForeignKey('admin.id'))
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    admin = db.relationship('Admin', backref='activities_created')

    def to_dict(self):
        media_list = [m.to_dict() for m in self.media] if hasattr(self, 'media') else []
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description or '',
            'date': self.date.isoformat(),
            'location': self.location or '',
            'county': self.county or '',
            'constituency': self.constituency or '',
            'ward': self.ward or '',
            'organizer': self.organizer or '',
            'created_by': self.created_by,
            'is_active': self.is_active,
            'created_date': self.created_date.isoformat(),
            'updated_date': self.updated_date.isoformat(),
            'media_count': len(media_list),
        }


class Media(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    media_type = db.Column(db.String(20), nullable=False)
    file_size = db.Column(db.Integer)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('admin.id'))
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_cover = db.Column(db.Boolean, default=False)
    created_date = db.Column(db.DateTime, default=datetime.utcnow)

    admin = db.relationship('Admin', backref='media_uploads')
    activity = db.relationship('Activity', backref='media')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description or '',
            'file_path': self.file_path,
            'file_type': self.file_type,
            'media_type': self.media_type,
            'file_size': self.file_size,
            'uploaded_by': self.uploaded_by,
            'activity_id': self.activity_id,
            'is_active': self.is_active,
            'is_cover': self.is_cover,
            'created_date': self.created_date.isoformat(),
        }


class MeetingAttendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey('meeting.id'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('member.id'), nullable=False)
    attended_at = db.Column(db.DateTime, default=datetime.utcnow)
    registered_by = db.Column(db.Integer, db.ForeignKey('admin.id'))

    meeting = db.relationship('Meeting', backref='attendances')
    member = db.relationship('Member', backref='meeting_attendances')
    admin = db.relationship('Admin', backref='registered_attendances')

    def to_dict(self):
        return {
            'id': self.id,
            'meeting_id': self.meeting_id,
            'member_id': self.member_id,
            'attended_at': self.attended_at.isoformat(),
            'registered_by': self.registered_by,
        }


class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    address = db.Column(db.Text)
    description = db.Column(db.Text)
    logo_path = db.Column(db.String(500))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email or '',
            'phone': self.phone or '',
            'website': self.website or '',
            'address': self.address or '',
            'description': self.description or '',
            'logo_path': self.logo_path or '',
            'created_date': self.created_date.isoformat(),
            'updated_date': self.updated_date.isoformat(),
        }



# Payments removed completely (Mpesa/Daraja).


