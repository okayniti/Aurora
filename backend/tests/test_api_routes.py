"""
AURORA — Route Integration Tests
Verifies FastAPI endpoint operations and schemas response formats.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_api_health():
    """Verify that the health check endpoint returns success and correct schema details."""
    response = client.get("/api/health")
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert "service" in data
    assert data["service"] == "AURORA"


def test_api_list_users():
    """Verify list users endpoint returns a valid user list."""
    response = client.get("/api/users")
    assert response.status_code == 200
    
    users = response.json()
    assert isinstance(users, list)
    if len(users) > 0:
        assert "id" in users[0]
        assert "email" in users[0]
        assert "name" in users[0]
