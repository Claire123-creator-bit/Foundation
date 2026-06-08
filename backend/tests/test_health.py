"""
Test cases for health check and monitoring endpoints
"""

import pytest
import json


class TestHealthCheck:
    """Tests for health check endpoints"""
    
    def test_health_check_success(self, client):
        """Test health check returns healthy status"""
        response = client.get('/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert data['database'] == 'connected'
        assert 'timestamp' in data
    
    def test_liveness_check(self, client):
        """Test liveness check endpoint"""
        response = client.get('/live')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['alive'] is True
        assert 'timestamp' in data
    
    def test_readiness_check_success(self, client):
        """Test readiness check returns ready status"""
        response = client.get('/ready')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['ready'] is True
        assert 'timestamp' in data
    
    def test_health_check_timestamp_format(self, client):
        """Test health check returns valid ISO timestamp"""
        response = client.get('/health')
        data = json.loads(response.data)
        timestamp = data['timestamp']
        # Check ISO format
        assert 'T' in timestamp or 'Z' in timestamp


class TestErrorHandling:
    """Tests for error handling"""
    
    def test_404_not_found(self, client):
        """Test 404 error handling"""
        response = client.get('/nonexistent-endpoint')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_method_not_allowed(self, client):
        """Test method not allowed (405)"""
        response = client.post('/health')  # Health only accepts GET
        assert response.status_code in [405, 404]
