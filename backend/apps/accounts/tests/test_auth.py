import json

from django.test import Client


def test_health_check(api_client: Client) -> None:
    response = api_client.get("/api/v1/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "job-board-api"


def test_register_and_login(api_client: Client) -> None:
    register = api_client.post(
        "/api/v1/auth/register/",
        data=json.dumps(
            {
                "email": "newuser@example.com",
                "password": "SecurePass123!",
                "password_confirm": "SecurePass123!",
                "role": "candidate",
                "full_name": "New User",
            }
        ),
        content_type="application/json",
    )
    assert register.status_code == 201
    assert "tokens" in register.json()

    login = api_client.post(
        "/api/v1/auth/login/",
        data=json.dumps({"email": "newuser@example.com", "password": "SecurePass123!"}),
        content_type="application/json",
    )
    assert login.status_code == 200
    assert "access" in login.json()


def test_public_job_list(api_client: Client) -> None:
    response = api_client.get("/api/v1/jobs/")
    assert response.status_code == 200
    assert "results" in response.json()
