# Mbogo Welfare Empowerment Foundation

A comprehensive web-based community management platform for member registration, meeting management, messaging, and payments.

## Features

- **Member Management**: Self-registration with admin approval workflow
- **Admin Dashboard**: Comprehensive member and meeting management interface  
- **Meeting Scheduling**: Create and track meetings with attendees
- **Bulk Messaging**: Send SMS notifications to members by category
- **Payment Processing**: M-Pesa integration for donations and contributions
- **Secure Authentication**: Role-based access control for members and admins
- **Responsive Design**: Mobile-friendly interface for all users

## Tech Stack

### Frontend
- **Framework**: React 19.1+
- **Styling**: CSS3 with inline styles
- **Build Tool**: Create React App
- **Target**: Modern browsers (Chrome, Firefox, Safari, Edge)

### Backend
- **Framework**: Flask 3.0
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Werkzeug password hashing
- **API**: RESTful architecture with CORS support
- **Server**: Gunicorn for production

## Prerequisites

- **Node.js** v14+ (for frontend development)
- **Python** 3.12+ (for backend development)
- **npm** or **yarn** (for frontend package management)

## Installation & Setup

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Environment Configuration

Create a `.env` file in the project root. Use `.env.example` as reference:

```bash
cp .env.example .env
```

Configure these environment variables:
- `FLASK_DEBUG`: Set to `false` in production
- `SUPERADMIN_INITIAL_PASSWORD`: Initial superadmin password (change after first login)
- `REACT_APP_API_URL`: API endpoint URL (defaults to localhost:8080 for dev)

## Running the Application

### Development Mode

**Backend** (Terminal 1):
```bash
cd backend
python main_app.py
# Server starts on http://localhost:8080
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm start
# App starts on http://localhost:3000
```

### Production Build

**Frontend Build**:
```bash
cd frontend
npm run build
```

The optimized build will be in `frontend/build/`

**Backend with Gunicorn**:
```bash
gunicorn -w 4 -b 0.0.0.0:8080 main_app:app
```

## Project Structure

```
foundation/
├── backend/
│   ├── main_app.py          # Flask application and API endpoints
│   ├── website_models.py    # Database models (Admin, Member, Meeting, Payment)
│   ├── requirements.txt     # Python dependencies
│   └── instance/            # Runtime database storage
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── utils/           # Utility functions (API config)
│   │   ├── App.js           # Main application component
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── .env.example             # Environment configuration template
├── Pipfile                  # Python dependencies (Pipenv)
└── README.md                # This file
```

## API Endpoints

### Authentication
- `POST /admin-login` - Admin authentication
- `POST /admin-register` - Create new admin account (superadmin only)
- `POST /member-register` - Member self-registration
- `POST /member-login` - Member authentication

### Members
- `GET /members` - List approved members (admin)
- `GET /admin/pending-members` - List pending registrations (admin)
- `POST /admin/register-member` - Admin-registered member (admin)
- `POST /admin/approve-member/<id>` - Approve/reject registration (admin)

### Meetings
- `GET /meetings` - List all meetings
- `POST /meetings` - Create meeting (admin)

### Messaging
- `POST /send-bulk-sms` - Send SMS to members (admin)

### Payments
- `POST /mpesa-stk-push` - Process M-Pesa payment

## Security Considerations

- Passwords are hashed using Werkzeug
- Admin credentials stored in localStorage (consider JWT for production)
- CORS configured for trusted origins only
- Database credentials in environment variables
- Input validation on all endpoints

## Database Models

### Admin
- Stores admin user accounts with roles (superadmin, admin, coordinator, finance, communication)
- Tracks login history and active status

### Member  
- Stores member information (name, ID, phone, location, category)
- Supports status workflow (pending → approved/rejected)
- Tracks registration and activity timestamps

### Meeting
- Stores meeting information (title, date, time, venue, agenda)
- Supports multiple meeting types (physical, virtual)

### Payment
- Tracks payment transactions (donations, contributions, welfare funds)
- Links payments to members
- Stores transaction IDs and status

## Deployment

### Vercel (Frontend)
- Configured via `frontend/vercel.json`
- Auto-deploys on push to main branch
- Environment variables configured in Vercel dashboard

### Render or similar (Backend)
- Deploy from git repository
- Use `gunicorn` for WSGI server
- Configure environment variables in platform dashboard

## Development Workflow

1. Create feature branch: `git checkout -b feature/description`
2. Make changes and test locally
3. Commit with descriptive messages: `git commit -m "Add feature"`
4. Push and create pull request
5. Merge after review

## Troubleshooting

**Issue**: Frontend can't connect to backend
- **Solution**: Ensure backend is running on port 8080, check `REACT_APP_API_URL`

**Issue**: Database file not created
- **Solution**: Ensure `instance/` directory exists and is writable

**Issue**: Import errors in backend
- **Solution**: Ensure all dependencies installed: `pip install -r requirements.txt`

## Future Enhancements

- [ ] JWT-based authentication instead of localStorage
- [ ] Real M-Pesa Daraja API integration
- [ ] Email notifications alongside SMS
- [ ] Advanced reporting and analytics
- [ ] User profile management
- [ ] Meeting attendance tracking
- [ ] Document storage and sharing

## Support

For issues or questions, contact the development team.

## License

Proprietary - Mbogo Welfare Empowerment Foundation

   ```

5. Start the frontend development server:
   ```bash
   npm start
   ```

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── utils/
│   └── public/
├── backend/
│   ├── main_app.py
│   └── models/
└── instance/
    └── foundation_complete.db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
