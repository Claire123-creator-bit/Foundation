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
    if not CLOUDINARY_AVAILABLE or cloudinary is None:
        return True
    try:
        if "cloudinary" in file_path:
            # Extract public_id including folder, strip version and extension
            # URL format: .../upload/v123456/folder/filename.ext
            parts = file_path.split("/upload/")
            if len(parts) == 2:
                public_id_with_ext = parts[1]
                # Remove version segment (v123456/)
                segments = public_id_with_ext.split("/")
                if segments[0].startswith("v") and segments[0][1:].isdigit():
                    segments = segments[1:]
                public_id = "/".join(segments).rsplit(".", 1)[0]
                if public_id:
                    cloudinary.uploader.destroy(public_id)
    except Exception:
        pass
    return True
