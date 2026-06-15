# Mbogo Welfare Empowerment Foundation - Deployment Guide

## Overview
This guide covers deploying the Foundation Management System on Render or any production environment.

## Prerequisites
- Python 3.9+
- Node.js 16+
- SQLite3
- Git

## Local Development Setup

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration
Create `backend/.env` with the following:
```
SECRET_KEY=your_secure_random_key_here
SUPERADMIN_INITIAL_PASSWORD=your_initial_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build
```

### 4. Running Locally
```bash
# Terminal 1: Backend
cd backend
python main_app.py

# Terminal 2: Frontend (development)
cd frontend
npm start
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## Production Deployment on Render

### 1. Deploy Backend
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn -w 4 backend.main_app:app`
   - **Environment Variables**:
     ```
     FLASK_ENV=production
     SECRET_KEY=<generate-secure-key>
     SUPERADMIN_INITIAL_PASSWORD=<secure-password>
     GOOGLE_CLIENT_ID=<your-id>
     GOOGLE_CLIENT_SECRET=<your-secret>
     GOOGLE_REDIRECT_URI=https://yourdomain.onrender.com/auth/google/callback
     FRONTEND_URL=https://yourdomain.vercel.app or your-domain.com
     ```

### 2. Deploy Frontend
1. Build the frontend locally or use GitHub Actions
2. Deploy to Vercel or your hosting:
   - Set `REACT_APP_API_URL=https://your-render-backend.onrender.com`

### 3. Database
- SQLite database is created automatically in `instance/foundation_complete.db`
- For multi-dyno Render deployments, migrate to PostgreSQL:
  ```
  SQLALCHEMY_DATABASE_URI=postgresql://user:password@host:5432/dbname
  ```

## API Endpoints

### Authentication
- `POST /admin-login` - Admin login
- `POST /member-login` - Member login
- `GET /me` - Get current user info

### Members
- `GET /members` - List members (admin only)
- `POST /member-register` - Register new member
- `GET /admin/pending-members` - List pending approvals
- `POST /admin/approve-member/<id>` - Approve/reject member

### Activities
- `GET /activities` - List activities
- `GET /activities/<id>` - Get activity details
- `POST /activities` - Create activity (admin only)
- `PUT /activities/<id>` - Update activity (admin only)
- `DELETE /activities/<id>` - Delete activity (admin only)

### Media
- `GET /media` - List media
- `POST /admin/media` - Upload media (admin only)
- `PUT /admin/media/<id>` - Update media (admin only)
- `DELETE /media/<id>` - Delete media (admin only)

### Organization
- `GET /organization` - Get foundation info
- `POST /admin/organization` - Update foundation info (superadmin only)

### Analytics
- `GET /admin/analytics` - Get analytics and reports (admin only)

### Location Dropdowns
- `GET /locations/counties` - Get all counties
- `GET /locations/constituencies/<county>` - Get constituencies for county
- `GET /locations/wards/<constituency>` - Get wards for constituency

## Troubleshooting

### Issue: GET /me returns 404
**Solution**: Ensure JWT token is valid and SECRET_KEY matches between environments

### Issue: Media loading fails with HTML response
**Solution**: Ensure backend is running and `/media` endpoint returns JSON

### Issue: Authentication not persisting after refresh
**Solution**: 
1. Check localStorage is not cleared
2. Verify token expiry (set to 7 days in code)
3. Check CORS settings

### Issue: Activities not showing
**Solution**: 
1. Ensure activities exist in database
2. Check `/activities` endpoint returns JSON
3. Verify frontend API_BASE is correct

## Feature Summary

### Core Features
✅ Admin & Member login with JWT
✅ Member registration with location selection
✅ Activity management system
✅ Activity-based media management
✅ Photo and video uploads
✅ Analytics and reports dashboard
✅ Location-dependent dropdowns (County → Constituency → Ward)
✅ Meeting management
✅ SMS notifications
✅ Google OAuth integration
✅ Foundation contact information

### Database Models
- **Admin**: Super admin, admin, coordinator, finance, communication roles
- **Member**: Individual and group members with location hierarchy
- **Activity**: Foundation activities with media attachments
- **Media**: Photos and videos attached to activities
- **Meeting**: Events with attendance tracking
- **Organization**: Foundation information

### Frontend Components
- Landing page with activities and media sections
- Admin dashboard with analytics
- Member dashboard
- Member registration with location dropdowns
- Activity gallery
- Contact information display

## Security Notes

1. Change default superadmin password immediately
2. Use strong SECRET_KEY (generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
3. Enable HTTPS in production
4. Validate all user inputs
5. Use environment variables for sensitive data
6. Regular security audits

## Database Migrations

To add new columns to existing tables:
```python
# In backend/main_app.py
from alembic import op
import sqlalchemy as sa

# Add migration here
```

Then run:
```bash
python main_app.py
```

The app auto-creates missing tables on startup.

## Support

For issues, contact: mbogoempowermentfoundation@gmail.com
Phone: 0143235490

## Version History

### v1.0.0 (June 2026)
- Initial release
- Activity-based media system
- Location hierarchy support
- Admin analytics
- Foundation contact information
