import pytest
import os
import tempfile
from werkzeug.security import generate_password_hash
import sys
import jwt
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import main_app as main_app_module

flask_app = main_app_module.app

from website_models import db, Admin, Member, Meeting, Media, MeetingAttendance


@pytest.fixture(scope='session')
def app():
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    flask_app.config['SECRET_KEY'] = 'test-secret-key-for-testing'
    return flask_app


@pytest.fixture(scope='function')
def client(app):
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


def _generate_jwt_token(admin_id, role):
    payload = {
        'admin_id': admin_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, 'test-secret-key-for-testing', algorithm='HS256')


def _generate_member_jwt_token(member_id):
    payload = {
        'member_id': member_id,
        'role': 'member',
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, 'test-secret-key-for-testing', algorithm='HS256')


@pytest.fixture
def auth_headers(client, app):
    with app.app_context():
        admin = Admin(
            username='testadmin',
            password=generate_password_hash('testpass123'),
            full_name='Test Admin',
            email='testadmin@test.com',
            phone='1234567890',
            role='admin',
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        token = _generate_jwt_token(admin.id, 'admin')

    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def superadmin_headers(client, app):
    with app.app_context():
        superadmin = Admin(
            username='superadmin_test',
            password=generate_password_hash('superpass123'),
            full_name='Super Admin Test',
            email='superadmin@test.com',
            phone='0987654321',
            role='superadmin',
            is_active=True
        )
        db.session.add(superadmin)
        db.session.commit()
        token = _generate_jwt_token(superadmin.id, 'superadmin')

    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def sample_member(app):
    with app.app_context():
        member = Member(
            full_names='John Doe',
            national_id='12345678',
            phone_number='254712345678',
            gender='Male',
            category='Active',
            county='Nairobi',
            constituency='Westlands',
            ward='Karura',
            physical_location='Karura Ward',
            status='approved',
            created_by='admin',
            is_verified=True
        )
        db.session.add(member)
        db.session.commit()
        return member


@pytest.fixture
def sample_meeting(app, sample_member):
    with app.app_context():
        from datetime import datetime, timedelta
        meeting = Meeting(
            meeting_name='Test Meeting',
            date_time=datetime.utcnow() + timedelta(days=1),
            venue='Test Venue',
            attendance_count=10,
            created_by='testadmin'
        )
        db.session.add(meeting)
        db.session.commit()
        return meeting
