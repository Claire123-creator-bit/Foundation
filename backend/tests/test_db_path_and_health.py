import json


def test_health_uses_app_db_connection(client):
    # Basic smoke test
    resp = client.get("/health")
    assert resp.status_code == 200
    data = json.loads(resp.data)
    assert "database" in data
    assert "timestamp" in data

