import os
from datetime import datetime

# Database
SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///app.db")
SQLALCHEMY_TRACK_MODIFICATIONS = False

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production")

# Cloudinary
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# CORS - allow both production and development
if os.getenv("FLASK_ENV") == "production":
    CORS_ORIGINS = "https://www.mbogofoundation.org"
else:
    # Development: allow localhost
    CORS_ORIGINS = ["https://www.mbogofoundation.org", "http://localhost:3000", "http://127.0.0.1:3000"]
