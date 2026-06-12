import pytest
from datetime import datetime, timedelta


class TestAdminModel:
    """Tests for Admin model"""
    
    def test_admin_creation(self, app):
        """Test creating an admin"""
        with app.app_context():
            from website_models import Admin, db
            from werkzeug.security import generate_password_hash
            
            admin = Admin(
                username='testuser',
                password=generate_password_hash('testpass'),
                full_name='Test User',
                email='test@test.com',
                phone='1234567890',
                role='admin',
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
            
            retrieved = Admin.query.filter_by(username='testuser').first()
            assert retrieved is not None
            assert retrieved.full_name == 'Test User'
            assert retrieved.is_active is True
    
    def test_admin_username_unique(self, app):
        """Test that admin usernames are unique"""
        with app.app_context():
            from website_models import Admin, db
            from werkzeug.security import generate_password_hash
            
            admin1 = Admin(
                username='unique_user',
                password=generate_password_hash('pass1'),
                full_name='Admin One',
                email='admin1@test.com',
                phone='1111111111',
                role='admin',
                is_active=True
            )
            db.session.add(admin1)
            db.session.commit()
            
            # Attempting to add another admin with same username should fail
            admin2 = Admin(
                username='unique_user',
                password=generate_password_hash('pass2'),
                full_name='Admin Two',
                email='admin2@test.com',
                phone='2222222222',
                role='admin',
                is_active=True
            )
            db.session.add(admin2)
            
            with pytest.raises(Exception):  # IntegrityError
                db.session.commit()


class TestMemberModel:
    """Tests for Member model"""
    
    def test_member_creation(self, app):
        """Test creating a member"""
        with app.app_context():
            from website_models import Member, db
            
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
            
            retrieved = Member.query.filter_by(national_id='12345678').first()
            assert retrieved is not None
            assert retrieved.full_names == 'John Doe'
            assert retrieved.status == 'approved'
    
    def test_member_national_id_unique(self, app):
        """Test that member national IDs are unique"""
        with app.app_context():
            from website_models import Member, db
            
            member1 = Member(
                full_names='Person One',
                national_id='87654321',
                phone_number='254700000001',
                gender='Male',
                category='Active',
                county='Nairobi',
                constituency='Westlands',
                ward='Karura',
                physical_location='Karura',
                status='approved',
                created_by='admin',
                is_verified=True
            )
            db.session.add(member1)
            db.session.commit()
            
            member2 = Member(
                full_names='Person Two',
                national_id='87654321',  # Duplicate
                phone_number='254700000002',
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
            db.session.add(member2)
            
            with pytest.raises(Exception):  # IntegrityError
                db.session.commit()
    
    def test_member_status_workflow(self, app):
        """Test member status transitions"""
        with app.app_context():
            from website_models import Member, db
            
            member = Member(
                full_names='Workflow Test',
                national_id='99999999',
                phone_number='254700000099',
                gender='Male',
                category='Active',
                county='Nairobi',
                constituency='Westlands',
                ward='Karura',
                physical_location='Karura',
                status='pending',
                created_by='self',
                is_verified=False
            )
            db.session.add(member)
            db.session.commit()
            
            # Transition to approved
            member.status = 'approved'
            member.is_verified = True
            db.session.commit()
            
            retrieved = Member.query.get(member.id)
            assert retrieved.status == 'approved'
            assert retrieved.is_verified is True


class TestMeetingModel:
    """Tests for Meeting model"""
    
    def test_meeting_creation(self, app):
        """Test creating a meeting"""
        with app.app_context():
            from website_models import Meeting, db
            
            meeting_date = datetime.utcnow() + timedelta(days=7)
            meeting = Meeting(
                meeting_name='Monthly Meeting',
                date_time=meeting_date,
                venue='Conference Room A',
                attendance_count=0,
                created_by='admin'
            )
            db.session.add(meeting)
            db.session.commit()
            
            retrieved = Meeting.query.filter_by(meeting_name='Monthly Meeting').first()
            assert retrieved is not None
            assert retrieved.venue == 'Conference Room A'
            assert retrieved.created_by == 'admin'
    
    def test_meeting_future_dates(self, app):
        """Test that meetings can be scheduled for future dates"""
        with app.app_context():
            from website_models import Meeting, db
            
            future_date = datetime.utcnow() + timedelta(days=30)
            meeting = Meeting(
                meeting_name='Future Meeting',
                date_time=future_date,
                venue='Test Venue',
                attendance_count=0,
                created_by='admin'
            )
            db.session.add(meeting)
            db.session.commit()
            
            retrieved = Meeting.query.get(meeting.id)
            assert retrieved.date_time > datetime.utcnow()


class TestPaymentModel:
    """Tests for Payment model"""
    
    def test_payment_creation(self, app):
        """Test creating a payment record"""
        with app.app_context():
            from website_models import Payment, db
            
            payment = Payment(
                phone_number='254712345678',
                amount=500,
                transaction_id='TXN123456',
                status='completed',
                payment_type='donation',
                created_by='member'
            )
            db.session.add(payment)
            db.session.commit()
            
            retrieved = Payment.query.filter_by(transaction_id='TXN123456').first()
            assert retrieved is not None
            assert retrieved.amount == 500
            assert retrieved.status == 'completed'
    
    def test_payment_indexing(self, app):
        """Test payment queries with indexes"""
        with app.app_context():
            from website_models import Payment, db
            
            # Create multiple payments
            for i in range(10):
                payment = Payment(
                    phone_number=f'25470000000{i}',
                    amount=100 * (i + 1),
                    transaction_id=f'TXN{i:06d}',
                    status='completed',
                    payment_type='donation',
                    created_by='member'
                )
                db.session.add(payment)
            db.session.commit()
            
            # Query by phone_number (indexed)
            results = Payment.query.filter_by(phone_number='254700000005').all()
            assert len(results) > 0
            
            # Query by transaction_id (indexed)
            result = Payment.query.filter_by(transaction_id='TXN000005').first()
            assert result is not None
            assert result.amount == 600
