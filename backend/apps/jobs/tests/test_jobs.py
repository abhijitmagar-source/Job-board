import json

from django.test import Client


def test_recruiter_job_lifecycle(api_client: Client, recruiter: dict) -> None:
    headers = {"HTTP_AUTHORIZATION": f"Bearer {recruiter['access']}"}

    company = api_client.post(
        "/api/v1/companies/",
        data=json.dumps({"name": "CI Corp", "description": "Test company"}),
        content_type="application/json",
        **headers,
    )
    assert company.status_code == 201
    company_id = company.json()["id"]

    job = api_client.post(
        "/api/v1/jobs/",
        data=json.dumps(
            {
                "title": "Backend Engineer",
                "description": "Build APIs",
                "location": "Remote",
                "job_type": "remote",
                "experience_level": "mid",
                "company_id": company_id,
            }
        ),
        content_type="application/json",
        **headers,
    )
    assert job.status_code == 201
    job_id = job.json()["id"]

    listing = api_client.get("/api/v1/jobs/?search=Backend")
    assert listing.status_code == 200
    assert listing.json()["count"] >= 1

    deleted = api_client.delete(f"/api/v1/jobs/{job_id}/", **headers)
    assert deleted.status_code == 204


def test_apply_for_job(api_client: Client, recruiter: dict, job_seeker: dict) -> None:
    rec_headers = {"HTTP_AUTHORIZATION": f"Bearer {recruiter['access']}"}
    seek_headers = {"HTTP_AUTHORIZATION": f"Bearer {job_seeker['access']}"}

    company = api_client.post(
        "/api/v1/companies/",
        data=json.dumps({"name": "Apply Corp"}),
        content_type="application/json",
        **rec_headers,
    )
    company_id = company.json()["id"]

    job = api_client.post(
        "/api/v1/jobs/",
        data=json.dumps(
            {
                "title": "Python Dev",
                "description": "Django",
                "location": "NYC",
                "job_type": "full_time",
                "experience_level": "entry",
                "company_id": company_id,
            }
        ),
        content_type="application/json",
        **rec_headers,
    )
    job_id = job.json()["id"]

    apply = api_client.post(
        "/api/v1/applications/",
        data=json.dumps({"job_id": job_id, "cover_letter": "Interested!"}),
        content_type="application/json",
        **seek_headers,
    )
    assert apply.status_code == 201
    assert apply.json()["status"] == "pending"

    applicants = api_client.get(f"/api/v1/jobs/{job_id}/applicants/", **rec_headers)
    assert applicants.status_code == 200
    assert applicants.json()["count"] == 1

    application_id = applicants.json()["results"][0]["id"]
    status_update = api_client.patch(
        f"/api/v1/applications/{application_id}/status/",
        data=json.dumps({"status": "shortlisted"}),
        content_type="application/json",
        **rec_headers,
    )
    assert status_update.status_code == 200
    assert status_update.json()["status"] == "shortlisted"
