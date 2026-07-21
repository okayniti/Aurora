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


def test_more_routes_integration_flow():
    """Create a user then exercise several key routes end-to-end."""
    # Create a new user for test isolation
    resp = client.post("/api/users", params={"email": "test+ci@example.com", "name": "CI Tester"})
    assert resp.status_code == 200
    user = resp.json()
    user_id = user["id"]

    # Energy forecast
    r = client.get(f"/api/energy/forecast/{user_id}")
    assert r.status_code == 200
    ef = r.json()
    assert ef.get("user_id") == user_id

    # Burnout risk
    r = client.get(f"/api/burnout/risk/{user_id}")
    assert r.status_code == 200
    br = r.json()
    assert "burnout_probability" in br

    # Record a snapshot
    snap_payload = {"user_id": user_id, "stress_trend": 6.0, "cognitive_load": 6.0}
    r = client.post("/api/burnout/snapshot", json=snap_payload)
    assert r.status_code == 200
    snap_res = r.json()
    assert "burnout_probability" in snap_res

    # Trend (should include at least the snapshot we just recorded)
    r = client.get(f"/api/burnout/trend/{user_id}?days=7")
    assert r.status_code == 200
    trend = r.json()
    assert isinstance(trend.get("data_points"), list)

    # Identity scores (no identity yet should return empty or error field)
    r = client.get(f"/api/identity/scores/{user_id}")
    assert r.status_code == 200
    scores = r.json()
    assert "user_id" in scores

    # Create a task and fetch tasks for user
    task_payload = {"user_id": user_id, "title": "CI Task Example"}
    r = client.post("/api/tasks/", json=task_payload)
    assert r.status_code == 200
    task = r.json()
    assert task.get("title") == "CI Task Example"

    r = client.get(f"/api/tasks/user/{user_id}")
    assert r.status_code == 200
    tasks = r.json()
    assert isinstance(tasks, list)
    assert any(t.get("title") == "CI Task Example" for t in tasks)
