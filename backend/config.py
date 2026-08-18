import os

# Database
_db_url = os.getenv(
    "DATABASE_URL",
    "sqlite:////home/claire/Foundation/backend/instance/foundation_complete.db",
)
# Render/Heroku set postgres:// which SQLAlchemy 1.4+ rejects
if _db_url and _db_url.startswith("postgres://"):
    _db_url = _db_url.replace("postgres://", "postgresql://", 1)
SQLALCHEMY_DATABASE_URI = _db_url

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
