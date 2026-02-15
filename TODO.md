# Implementation Plan: Admin & Member Signup with Email

## Phase 1: Backend Updates ✅ COMPLETED

### 1.1 Update Member Model (website_models.py) ✅
- Added email field to Member model

### 1.2 Add Email Support (main_app.py) ✅
- Added Flask-Mail configuration for sending emails
- Added admin registration endpoint `/admin-register`
- Added email sending function for member registration welcome
- Updated `/register-member-pro` to capture email and send welcome
- Added password hashing for security

### 1.3 Add Admin Signup Endpoint ✅
- New `/admin-register` endpoint for creating admin accounts
- Password hashing for security

## Phase 2: Frontend Updates ✅ COMPLETED

### 2.1 Create AdminSignupPage.js ✅
- New component for admin registration
- Form fields: full_name, username, email, phone, password

### 2.2 Update EnhancedRegistrationPro.js ✅
- Added email field to member registration form

### 2.3 Update App.js ✅
- Added admin signup route
- Added navigation for admin signup

## Phase 3: Testing & Deployment
- Restart the backend server to apply changes
- Test admin registration
- Test member registration with email
- Verify login works

## How to Test:

1. **Start Backend**: Navigate to backend folder and run `python main_app.py`
2. **Start Frontend**: Navigate to frontend folder and run `npm start`
3. **Test Admin Signup**: 
   - Go to Login page
   - Click "Admin Login" 
   - Click "Register here" link
   - Fill in admin details and submit
4. **Test Member Signup**:
   - Go to Sign up page
   - Register with email address
   - Check for welcome email (logged in console for now)
5. **Test Login**:
   - Use admin credentials (username: admin, password: admin123)
   - Use member credentials (full_name + national_id)

