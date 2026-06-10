# Deployment Guide

## Project Structure
```
Foundation/
├── backend/          # Flask API
├── frontend/         # React app
├── .gitignore        # Root level gitignore
└── DEPLOYMENT.md     # This file
```

## Backend Deployment (Render)

### Prerequisites
- Git repository pushed to GitHub
- Render account (free tier available)

### Steps

1. **Push clean code to GitHub**
   ```bash
   cd ~/Foundation
   git add .
   git commit -m "clean project structure"
   git push
   ```

2. **Create new Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `Foundation` repo

3. **Configure Render Settings**
   
   **Build & Deploy:**
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn main_app:app`

   **Environment Variables:**
   - `FLASK_DEBUG`: `false`
   - `SUPERADMIN_INITIAL_PASSWORD`: `your-secure-password`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - You'll get a URL like: `https://foundation-backend.onrender.com`

5. **Test the deployment**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

## Frontend Deployment (Vercel)

### Prerequisites
- Vercel account (free tier available)
- Backend deployed on Render

### Steps

1. **Update API URL (if needed)**
   - Check `frontend/src/utils/apiConfig.js`
   - Production URL should be your Render backend URL
   - Set environment variable in Vercel: `REACT_APP_API_URL=https://your-backend.onrender.com`

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
   - Click "Deploy"

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-backend.onrender.com`
   - Redeploy after adding

## Domain Configuration (mbogofoundation.org)

### DNS Settings for Vercel

Go to your domain registrar (where you bought mbogofoundation.org) and set:

| Type | Name | Value |
|------|------|-------|
| A    | @    | 76.76.21.21 |
| CNAME| www  | cname.vercel-dns.com |

### Connect Domain in Vercel
1. Go to Vercel project → Settings → Domains
2. Add `mbogofoundation.org`
3. Add `www.mbogofoundation.org`
4. Follow the DNS verification steps

## Final Architecture

```
User → mbogofoundation.org (Vercel Frontend)
         ↓ API calls
         → https://foundation-backend.onrender.com (Render Backend)
```

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Ensure `gunicorn` is in requirements.txt
- Verify database initialization works

### Frontend Issues
- Check browser console for CORS errors
- Verify API URL is correct in environment variables
- Check Vercel deployment logs

### Git Issues
- If venv/logs still tracked: `git rm -r --cached backend/venv logs`
- Then: `git add . && git commit -m "clean git tracking"`
