import io
import pytest

from unittest.mock import patch


class DummyFileStorage:
    def __init__(self, filename="test.png", content_type="image/png", content=b"abc"):
        self.filename = filename
        self.content_type = content_type
        self._content = content

    def read(self):
        return self._content


@pytest.fixture
def fake_admin(app, client):
    with app.app_context():
        from website_models import db, Admin
        from werkzeug.security import generate_password_hash
        
        admin = Admin(
            username="mediaadmin",
            password=generate_password_hash("pass"),
            full_name="Media Admin",
            email="mediaadmin@test.com",
            phone="123",
            role="admin",
            is_active=True,
        )
        db.session.add(admin)
        db.session.commit()
        return admin


def _auth_headers_for_admin(admin):
    # Use same jwt construction as conftest
    import jwt
    from datetime import datetime, timedelta

    payload = {
        "admin_id": admin.id,
        "role": admin.role,
        "exp": int((datetime.utcnow() + timedelta(days=7)).timestamp()),
    }
    token = jwt.encode(payload, "test-secret-key-for-testing", algorithm="HS256")
    return {"Authorization": f"Bearer {token}"}


def test_upload_media_cloudinary_unconfigured_does_not_create_db_record(client, app, fake_admin):
    headers = _auth_headers_for_admin(fake_admin)

    # Patch upload_file to simulate unconfigured cloudinary.
    with patch("routes.media.upload_file", return_value=(None, "Cloudinary not configured")):
        resp = client.post(
            "/media-upload",
            headers=headers,
            data={
                "title": "t1",
                "description": "d1",
                "media_type": "image",
                "activity_id": "1",
            },
            content_type="multipart/form-data",
            files={
                "file": (io.BytesIO(b"fake"), "test.png"),
            },
        )

    assert resp.status_code == 500

    with app.app_context():
        from website_models import Media
        assert Media.query.count() == 0


def test_upload_media_db_failure_cleans_up_cloudinary(client, app, fake_admin):
    headers = _auth_headers_for_admin(fake_admin)

    secure_url = "https://res.cloudinary.com/demo/image/upload/v1/test.png"

    with patch("routes.media.upload_file", return_value=(secure_url, None)) as up_mock, patch(
        "routes.media.delete_file", return_value=True
    ) as del_mock:
        # Force DB commit to fail after upload.
        with patch("routes.media.db.session.commit", side_effect=Exception("db commit failed")):
            resp = client.post(
                "/media-upload",
                headers=headers,
                data={
                    "title": "t1",
                    "description": "d1",
                    "media_type": "image",
                    "activity_id": "1",
                },
                content_type="multipart/form-data",
                files={
                    "file": (io.BytesIO(b"fake"), "test.png"),
                },
            )

    assert resp.status_code == 500
    assert up_mock.called
    assert del_mock.called

    with app.app_context():
        from website_models import Media
        assert Media.query.count() == 0


def test_delete_media_commits_db_before_remote_delete(client, app, fake_admin):
    headers = _auth_headers_for_admin(fake_admin)

    with app.app_context():
        from website_models import db, Media
        
        m = Media(
            title="t",
            description="",
            file_path="https://res.cloudinary.com/demo/image/upload/v1/test.png",
            file_type="image/png",
            media_type="image",
            file_size=0,
            uploaded_by=fake_admin.id,
            activity_id=None,
            is_active=True,
        )
        db.session.add(m)
        db.session.commit()
        media_id = m.id

    with patch("routes.media.delete_file", return_value=True) as del_mock:
        resp = client.delete(f"/media/{media_id}", headers=headers)

    assert resp.status_code == 200
    assert del_mock.called

    with app.app_context():
        from website_models import Media
        assert Media.query.get(media_id) is None

