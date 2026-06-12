import pytest
import json


class TestMemberRegistration:
    def test_member_register_success(self, client):
        response = client.post('/member-register', json={
            'full_names': 'Jane Doe',
            'national_id': '11111111',
            'phone_number': '254787654321',
            'gender': 'Female',
            'category': 'Active',
            'county': 'Nairobi',
            'constituency': 'Langata',
            'ward': 'Kilimani',
            'physical_location': 'Kilimani'
        })

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True

    def test_member_register_missing_fields(self, client):
        response = client.post('/member-register', json={
            'full_names': 'John Doe',
            'national_id': '22222222'
        })

        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False

    def test_member_register_duplicate_id(self, client, sample_member):
        response = client.post('/member-register', json={
            'full_names': 'Another Person',
            'national_id': '12345678',
            'phone_number': '254799999999',
            'gender': 'Male',
            'category': 'Active',
            'county': 'Nairobi',
            'constituency': 'Westlands',
            'ward': 'Karura',
            'physical_location': 'Karura'
        })

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'already registered' in data['error']

    def test_member_register_duplicate_phone(self, client, sample_member):
        response = client.post('/member-register', json={
            'full_names': 'Another Person',
            'national_id': '33333333',
            'phone_number': '254712345678',
            'gender': 'Male',
            'category': 'Active',
            'county': 'Nairobi',
            'constituency': 'Westlands',
            'ward': 'Karura',
            'physical_location': 'Karura'
        })

        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'already registered' in data['error']


class TestMembersList:
    def test_members_list_empty(self, client):
        response = client.get('/members')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert isinstance(data, list)
        assert len(data) == 0

    def test_members_list_with_members(self, client, sample_member):
        response = client.get('/members')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) > 0
        assert any(m['full_names'] == 'John Doe' for m in data)

    def test_members_list_pagination_works(self, client, app):
        with app.app_context():
            from website_models import Member, db
            for i in range(15):
                member = Member(
                    full_names=f'Member {i}',
                    national_id=f'ID{i:08d}',
                    phone_number=f'25470000000{i}',
                    gender='Male' if i % 2 == 0 else 'Female',
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

        response = client.get('/members')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) == 15


class TestPendingMembers:
    def test_pending_members_list(self, client, app, auth_headers):
        with app.app_context():
            from website_models import Member, db
            member = Member(
                full_names='Pending Member',
                national_id='44444444',
                phone_number='254755555555',
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

        response = client.get('/admin/pending-members', headers=auth_headers)

        assert response.status_code == 200
        data = json.loads(response.data)
        assert len(data) > 0
        assert any(m['full_names'] == 'Pending Member' for m in data)

    def test_approve_member(self, client, app, auth_headers):
        with app.app_context():
            from website_models import Member, db
            member = Member(
                full_names='Member To Approve',
                national_id='55555555',
                phone_number='254766666666',
                gender='Female',
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
            member_id = member.id

        response = client.post(f'/admin/approve-member/{member_id}',
            headers=auth_headers,
            json={}
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True

        with app.app_context():
            from website_models import Member
            approved = Member.query.get(member_id)
            assert approved.status == 'approved'
            assert approved.is_verified is True
