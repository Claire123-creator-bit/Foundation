import pytest
import json
from werkzeug.security import generate_password_hash


class TestAdminLogin:
    """Tests for admin login endpoint"""
    
    def test_admin_login_success(self, client, app):
        """Test successful admin login"""
        with app.app_context():
            from website_models import Admin, db
            admin = Admin(
                username='admin1',
                password=generate_password_hash('password123'),
                full_name='Admin One',
                email='admin1@test.com',
                phone='1234567890',
                role='admin',
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
        
        response = client.post('/admin-login', json={
            'username': 'admin1',
            'password': 'password123'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['name'] == 'Admin One'
        assert data['username'] == 'admin1'
    
    def test_admin_login_invalid_username(self, client):
        """Test login with non-existent username"""
        response = client.post('/admin-login', json={
            'username': 'nonexistent',
            'password': 'password123'
        })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'Invalid' in data['message']
    
    def test_admin_login_invalid_password(self, client, app):
        """Test login with wrong password"""
        with app.app_context():
            from website_models import Admin, db
            admin = Admin(
                username='admin2',
                password=generate_password_hash('correctpass'),
                full_name='Admin Two',
                email='admin2@test.com',
                phone='1234567890',
                role='admin',
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
        
        response = client.post('/admin-login', json={
            'username': 'admin2',
            'password': 'wrongpass'
        })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_admin_login_missing_credentials(self, client):
        """Test login with missing username or password"""
        # Missing password
        response = client.post('/admin-login', json={
            'username': 'admin1'
        })
        assert response.status_code == 400
        
        # Missing username
        response = client.post('/admin-login', json={
            'password': 'password123'
        })
        assert response.status_code == 400
        
        # Missing both
        response = client.post('/admin-login', json={})
        assert response.status_code == 400
    
    def test_admin_login_inactive_account(self, client, app):
        """Test login with inactive admin account"""
        with app.app_context():
            from website_models import Admin, db
            admin = Admin(
                username='admin_inactive',
                password=generate_password_hash('password123'),
                full_name='Inactive Admin',
                email='inactive@test.com',
                phone='1234567890',
                role='admin',
                is_active=False
            )
            db.session.add(admin)
            db.session.commit()
        
        response = client.post('/admin-login', json={
            'username': 'admin_inactive',
            'password': 'password123'
        })
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'deactivated' in data['message']


class TestAdminRegister:
    """Tests for admin registration endpoint"""
    
    def test_admin_register_superadmin_only(self, client, superadmin_headers, app):
        """Test that only superadmin can create admin accounts"""
        response = client.post('/admin-register',
            headers=superadmin_headers,
            json={
                'username': 'newadmin',
                'password': 'newpass123',
                'full_name': 'New Admin',
                'email': 'newadmin@test.com',
                'phone': '9876543210',
                'role': 'admin'
            }
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_admin_register_non_superadmin_denied(self, client, auth_headers):
        """Test that non-superadmin cannot create admin accounts"""
        response = client.post('/admin-register',
            headers=auth_headers,
            json={
                'username': 'newadmin',
                'password': 'newpass123',
                'full_name': 'New Admin',
                'email': 'newadmin@test.com'
            }
        )
        
        assert response.status_code == 403
    
    def test_admin_register_missing_fields(self, client, superadmin_headers):
        """Test admin registration with missing required fields"""
        response = client.post('/admin-register',
            headers=superadmin_headers,
            json={
                'username': 'newadmin',
                'password': 'newpass123'
                # Missing full_name and email
            }
        )
        
        assert response.status_code == 400
    
    def test_admin_register_duplicate_username(self, client, superadmin_headers, auth_headers):
        """Test that duplicate usernames are rejected"""
        # Try to register with existing username 'testadmin'
        response = client.post('/admin-register',
            headers=superadmin_headers,
            json={
                'username': 'testadmin',
                'password': 'newpass123',
                'full_name': 'New Admin',
                'email': 'newemail@test.com',
                'phone': '9876543210'
            }
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'already exists' in data['message']


class TestMemberLogin:
    """Tests for member login endpoint"""
    
    def test_member_login_success(self, client, app):
        """Test successful member login"""
        with app.app_context():
            from website_models import Member, db
            member = Member(
                full_names='Test Member',
                national_id='98765432',
                phone_number='254712345678',
                gender='Female',
                category='Active',
                county='Nairobi',
                constituency='Westlands',
                ward='Karura',
                physical_location='Karura',
                status='approved',
                created_by='admin',
                is_verified=True
            )
            db.session.add(member)
            db.session.commit()
        
        response = client.post('/member-login', json={
            'national_id': '98765432',
            'phone_number': '254712345678'
        })
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert data['member']['full_names'] == 'Test Member'
    
    def test_member_login_nonexistent(self, client):
        """Test member login with non-existent member"""
        response = client.post('/member-login', json={
            'national_id': '00000000',
            'phone_number': '254700000000'
        })
        
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['success'] is False
