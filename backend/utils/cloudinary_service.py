import os
from config import CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

CLOUDINARY_AVAILABLE = False
cloudinary = None

try:
    import cloudinary  # type: ignore
    import cloudinary.uploader  # type: ignore

    if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
        )
        CLOUDINARY_AVAILABLE = True
    else:
        CLOUDINARY_AVAILABLE = False
        cloudinary = None
except ModuleNotFoundError:
    CLOUDINARY_AVAILABLE = False
    cloudinary = None
except Exception:
    CLOUDINARY_AVAILABLE = False
    cloudinary = None


def upload_file(file, folder="mbogo_foundation"):
    """Upload file to Cloudinary."""
    if not CLOUDINARY_AVAILABLE or cloudinary is None:
        return None, "Cloudinary not configured"
    
    try:
        result = cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="auto",
        )
        return result.get("secure_url"), None
    except Exception as e:
        return None, str(e)


def delete_file(file_path):
    """Delete file from Cloudinary."""
    if not CLOUDINARY_AVAILABLE or cloudinary is None:
        return True
    
    try:
        if "cloudinary" in file_path:
            public_id = file_path.split("/")[-1].split(".")[0]
            if public_id:
                cloudinary.uploader.destroy(f"mbogo_foundation/{public_id}")
    except Exception:
        pass
    
    return True
