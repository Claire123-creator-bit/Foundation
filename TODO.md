# Access Control Implementation Plan

## Task: Implement role-based access control (RBAC)
- General members can ONLY see: their own profile, their own messages, meetings available, their own attendance
- Admin can access EVERYTHING

## Files to Edit:

### 1. Backend: `/home/claire/Foundation/backend/main_app.py`
   - Add helper function to check user role from headers
   - Add role-based protection to all endpoints:
     - `/members` - Refine to return only user's own data for members, all for admin
     - Add `/member-profile` endpoint - Return only requesting member's profile
     - Add `/my-messages` endpoint - Return only member's own messages
     - Protect `/meetings` - Return all for admin, public/available for members
     - Protect `/attendance-records` - Return only member's own for members, all for admin
     - Add admin-only endpoints for database access

### 2. Frontend: `/home/claire/Foundation/frontend/src/App.js`
   - Hide admin-only nav items from regular members (Database, Data Capture, SMS, Admin)
   - Show different navigation based on user role

### 3. Frontend: `/home/claire/Foundation/frontend/src/components/MembersList.js`
   - If user is not admin, show only their own profile instead of all members
   - Add admin check to show full members list only for admin

### 4. Frontend: `/home/claire/Foundation/frontend/src/components/DatabaseViewer.js`
   - Add admin-only access check - redirect or show error for non-admin users

### 5. Frontend: `/home/claire/Foundation/frontend/src/components/ProfilePage.js`
   - Already fetches own profile - verify it only shows own data

## Implementation Steps:

### Step 1: Update Backend main_app.py (COMPLETED ✓)
- [x] Add role verification helper
- [x] Add proper role checks to all data endpoints
- [x] Add admin-only endpoints

### Step 2: Update App.js (COMPLETED ✓)
- [x] Conditional navigation based on userRole
- [x] Hide admin-only pages from regular members
- [x] Pass userRole and userId to protected components

### Step 3: Update MembersList.js (COMPLETED ✓)
- [x] Show only own profile for members

### Step 4: Update DatabaseViewer.js (COMPLETED ✓)
- [x] Add admin access check

### Step 5: Update MeetingMinutes.js (COMPLETED ✓)
- [x] Add admin access check

### Step 6: Update BulkMessaging.js (COMPLETED ✓)
- [x] Add admin access check

## Testing:
- [x] Test as admin - should see all data
- [x] Test as member - should only see own profile, own attendance, available meetings

## Summary of Changes:
- **Backend**: Added role-based access control helpers and endpoints
- **App.js**: Navigation now hides admin-only items from members
- **MembersList.js**: Members only see their own profile
- **DatabaseViewer.js**: Admin-only access
- **MeetingMinutes.js**: Admin-only access
- **BulkMessaging.js**: Admin-only access

