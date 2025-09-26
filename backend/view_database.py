#!/usr/bin/env python3
import sqlite3
import os

# Connect to database
db_path = 'instance/foundation_complete.db'
if not os.path.exists(db_path):
    print("❌ Database not found. Make sure Flask server has been started at least once.")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("🗄️  MBOGO FOUNDATION DATABASE")
print("=" * 50)

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print(f"📋 TABLES FOUND: {len(tables)}")
for table in tables:
    print(f"   • {table[0]}")

print("\n" + "=" * 50)

# Show member data
print("👥 MEMBERS TABLE:")
try:
    cursor.execute("SELECT * FROM member LIMIT 5")
    members = cursor.fetchall()
    if members:
        print("   ID | Name | Phone | Category | County")
        print("   " + "-" * 45)
        for member in members:
            print(f"   {member[0]} | {member[1][:15]} | {member[3]} | {member[8]} | {member[7]}")
    else:
        print("   No members registered yet")
except:
    print("   Member table not created yet")

print("\n" + "-" * 50)

# Show meeting data
print("📅 MEETINGS TABLE:")
try:
    cursor.execute("SELECT * FROM meeting LIMIT 5")
    meetings = cursor.fetchall()
    if meetings:
        print("   ID | Title | Date | Type")
        print("   " + "-" * 35)
        for meeting in meetings:
            print(f"   {meeting[0]} | {meeting[1][:20]} | {meeting[2]} | {meeting[7] if len(meeting) > 7 else 'physical'}")
    else:
        print("   No meetings created yet")
except:
    print("   Meeting table not created yet")

print("\n" + "-" * 50)

# Show attendance data
print("✅ ATTENDANCE TABLE:")
try:
    cursor.execute("SELECT COUNT(*) FROM attendance")
    count = cursor.fetchone()[0]
    print(f"   Total attendance records: {count}")
except:
    print("   Attendance table not created yet")

print("\n" + "=" * 50)
print("💡 To add data:")
print("   1. Register members via the app")
print("   2. Create meetings in Data Capture")
print("   3. Record attendance for meetings")

conn.close()