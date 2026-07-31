"""
AURORA — Route Integration Tests
Verifies FastAPI endpoint operations, response schemas, and access control.
"""

import uuid

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session", autouse=True)
def _client():
    """Drive the app through its lifespan so app.state has the ML models loaded.
    A bare TestClient(app) skips startup, leaving app.state empty."""
    global client
    with TestClient(app) as started:
        client = started
        yield started


client: TestClient = TestClient(app)


def _register(prefix: str) -> dict:
    """Register a fresh account and return {id, email, headers}."""
    email = f"{prefix}+{uuid.uuid4().hex[:8]}@example.com"
    resp = client.post(
        "/api/auth/register",
        json={"email": email, "password": "correct horse battery", "name": "CI Tester"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    return {
        "id": body["user"]["id"],
        "email": email,
        "headers": {"Authorization": f"Bearer {body['access_token']}"},
    }


@pytest.fixture(scope="module")
def account() -> dict:
    return _register("ci")


def test_api_health():
    """Health check stays public and reports service details."""
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data
    assert data["service"] == "AURORA"


def test_login_returns_session(account):
    """Registered credentials produce a token and the matching user."""
    r = client.post(
        "/api/auth/login",
        json={"email": account["email"], "password": "correct horse battery"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["id"] == account["id"]

    r = client.get("/api/auth/me", headers=account["headers"])
    assert r.status_code == 200
    assert r.json()["email"] == account["email"]


def test_login_rejects_bad_password(account):
    r = client.post(
        "/api/auth/login", json={"email": account["email"], "password": "wrong"}
    )
    assert r.status_code == 401


@pytest.mark.parametrize(
    "method,path",
    [
        ("get", "/api/energy/forecast/{uid}"),
        ("get", "/api/burnout/risk/{uid}"),
        ("get", "/api/tasks/user/{uid}"),
        ("get", "/api/identity/profile/{uid}"),
        ("get", "/api/analytics/dashboard/{uid}"),
    ],
)
def test_routes_reject_anonymous_callers(account, method, path):
    """Every data route requires a bearer token."""
    r = getattr(client, method)(path.format(uid=account["id"]))
    assert r.status_code == 401, f"{path} was reachable without a token"


@pytest.mark.parametrize(
    "path",
    [
        "/api/energy/forecast/{uid}",
        "/api/burnout/risk/{uid}",
        "/api/tasks/user/{uid}",
        "/api/identity/profile/{uid}",
        "/api/analytics/dashboard/{uid}",
    ],
)
def test_routes_reject_other_users_data(account, path):
    """A valid token cannot read a different user's data."""
    victim = _register("victim")
    r = client.get(path.format(uid=victim["id"]), headers=account["headers"])
    assert r.status_code == 403, f"{path} leaked another user's data"


def test_more_routes_integration_flow(account):
    """Exercise several key routes end-to-end as the authenticated user."""
    user_id, headers = account["id"], account["headers"]

    # Energy forecast
    r = client.get(f"/api/energy/forecast/{user_id}", headers=headers)
    assert r.status_code == 200
    assert r.json().get("user_id") == user_id

    # Burnout risk
    r = client.get(f"/api/burnout/risk/{user_id}", headers=headers)
    assert r.status_code == 200
    assert "burnout_probability" in r.json()

    # Record a snapshot — the body no longer carries user_id
    r = client.post(
        "/api/burnout/snapshot",
        json={"stress_trend": 0.6, "cognitive_load": 6.0},
        headers=headers,
    )
    assert r.status_code == 200, r.text
    assert "burnout_probability" in r.json()

    # Trend (should include at least the snapshot we just recorded)
    r = client.get(f"/api/burnout/trend/{user_id}?days=7", headers=headers)
    assert r.status_code == 200
    assert isinstance(r.json().get("data_points"), list)

    # Identity scores (no identity yet should return empty or error field)
    r = client.get(f"/api/identity/scores/{user_id}", headers=headers)
    assert r.status_code == 200
    assert "user_id" in r.json()

    # Create a task and fetch tasks for user
    r = client.post("/api/tasks/", json={"title": "CI Task Example"}, headers=headers)
    assert r.status_code == 200, r.text
    assert r.json().get("title") == "CI Task Example"

    r = client.get(f"/api/tasks/user/{user_id}", headers=headers)
    assert r.status_code == 200
    tasks = r.json()
    assert any(t.get("title") == "CI Task Example" for t in tasks)


def test_task_mutations_reject_other_users(account):
    """A task belonging to someone else cannot be updated."""
    victim = _register("victim")
    r = client.post(
        "/api/tasks/", json={"title": "Victim Task"}, headers=victim["headers"]
    )
    assert r.status_code == 200
    task_id = r.json()["id"]

    r = client.patch(
        f"/api/tasks/{task_id}/status", json={"status": "done"}, headers=account["headers"]
    )
    assert r.status_code == 403
