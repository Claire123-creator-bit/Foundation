from main_app import app, db
from website_models import Member

with app.app_context():
    # Add Peter
    peter = Member(
        full_names='Peter Maina',
        national_id='12345678',
        phone_number='0712345678',
        county='Nairobi',
        constituency='Kasarani',
        ward='Ruaraka',
        physical_location='Kariobangi',
        category='Youth Leader',
        is_verified=True
    )
    db.session.add(peter)
    
    # Add Roselyne
    roselyne = Member(
        full_names='Roselyne Akinyi',
        national_id='87654321',
        phone_number='0723456789',
        county='Kisumu',
        constituency='Kisumu Central',
        ward='Nyalenda',
        physical_location='Nyalenda',
        category='Community Member',
        is_verified=True
    )
    db.session.add(roselyne)
    
    db.session.commit()
    
    print('Added Peter Maina and Roselyne Akinyi')
    print('All members:')
    for m in Member.query.all():
        print(f'ID: {m.id}, Name: {m.full_names}, National ID: {m.national_id}')
