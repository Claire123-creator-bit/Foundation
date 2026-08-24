import os
os.environ.setdefault('DATABASE_URL', 'sqlite:///instance/foundation_complete.db')

from main_app import app, db
from website_models import Member, Admin

with app.app_context():
    print("=" * 60)
    print("DATABASE STATUS CHECK")
    print("=" * 60)
    
    members = Member.query.all()
    print(f"\nTotal Members: {len(members)}")
    print("-" * 60)
    
    for m in members:
        print(f"ID: {m.id}")
        print(f"  Name: {m.full_names}")
        print(f"  Phone: '{m.phone_number}'")
        print(f"  Status: '{m.status}'")
        print(f"  Category: '{m.category}'")
        print()
    
    approved = Member.query.filter(Member.status.in_(["approved", "active"])).all()
    print(f"\nApproved/Active Members: {len(approved)}")
    print("-" * 60)
    for m in approved:
        print(f"  {m.full_names} - Phone: {m.phone_number}")
    
    print("\n" + "=" * 60)
    admins = Admin.query.filter_by(is_active=True).all()
    print(f"\nActive Admins: {len(admins)}")
    print("-" * 60)
    for a in admins:
        print(f"  {a.full_name} - Phone: {a.phone}")
