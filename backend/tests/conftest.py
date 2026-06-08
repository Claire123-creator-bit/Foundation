"""
Pytest configuration and fixtures for Foundation application tests
"""

import pytest
import os
import tempfile
from werkzeug.security import generate_password_hash
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main_app import app as flask_app
from website_models import db, Admin, Member, Meeting


@pytest.fixture(scope='session')
def app():
    """Create Flask app configured for testing"""
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    return flask_app


@pytest.fixture(scope='function')
def client(app):
    """Create test client for each test"""
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()


@pytest.fixture
def auth_headers(client, app):
    """Create authentication headers for testing"""
    with app.app_context():
        # Create test admin
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
    
    return {
        'User-Role': 'admin',
        'Admin-Username': 'testadmin'
    }


@pytest.fixture
def superadmin_headers(client, app):
    """Create superadmin authentication headers"""
    with app.app_context():
        # Create test superadmin
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
    
    return {
        'User-Role': 'admin',
        'Admin-Username': 'superadmin_test'
    }


@pytest.fixture
def sample_member(app):
    """Create sample member for testing"""
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
    """Create sample meeting for testing"""
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
