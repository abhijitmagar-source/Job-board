import json

import pytest
from django.test import Client


@pytest.fixture(autouse=True)
def enable_db(db) -> None:
    """Enable database access for all API tests."""


@pytest.fixture
def api_client() -> Client:
    return Client()


@pytest.fixture
def job_seeker(api_client: Client) -> dict:
    payload = {
        "email": "seeker-ci@example.com",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "role": "candidate",
        "full_name": "CI Seeker",
    }
    response = api_client.post(
        "/api/v1/auth/register/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 201
    login = api_client.post(
        "/api/v1/auth/login/",
        data=json.dumps({"email": payload["email"], "password": payload["password"]}),
        content_type="application/json",
    )
    assert login.status_code == 200
    tokens = login.json()
    return {"email": payload["email"], "access": tokens["access"], "refresh": tokens["refresh"]}


@pytest.fixture
def recruiter(api_client: Client) -> dict:
    payload = {
        "email": "recruiter-ci@example.com",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "role": "recruiter",
        "full_name": "CI Recruiter",
    }
    response = api_client.post(
        "/api/v1/auth/register/",
        data=json.dumps(payload),
        content_type="application/json",
    )
    assert response.status_code == 201
    login = api_client.post(
        "/api/v1/auth/login/",
        data=json.dumps({"email": payload["email"], "password": payload["password"]}),
        content_type="application/json",
    )
    assert login.status_code == 200
    tokens = login.json()
    return {"email": payload["email"], "access": tokens["access"], "refresh": tokens["refresh"]}
