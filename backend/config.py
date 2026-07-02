import os

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
CORS_ORIGINS = [
    "https://www.mbogofoundation.org",
    "https://foundation-drab-eta.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
