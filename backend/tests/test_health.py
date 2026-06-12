import pytest
import json


class TestHealthCheck:
    def test_health_check_success(self, client):
        response = client.get('/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert data['database'] == 'connected'
        assert 'timestamp' in data

    def test_liveness_check(self, client):
        response = client.get('/live')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['alive'] is True
        assert 'timestamp' in data

    def test_readiness_check_success(self, client):
        response = client.get('/ready')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['ready'] is True
        assert 'timestamp' in data

    def test_health_check_timestamp_format(self, client):
        response = client.get('/health')
        data = json.loads(response.data)
        timestamp = data['timestamp']
        assert 'T' in timestamp or 'Z' in timestamp


class TestErrorHandling:
    def test_404_not_found(self, client):
        response = client.get('/nonexistent-endpoint')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data

    def test_method_not_allowed(self, client):
        response = client.post('/health')
        assert response.status_code in [405, 404]
