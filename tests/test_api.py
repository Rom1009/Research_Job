import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch 

from backend.main  import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_save_profile_success(client):
    fake_pdf = b"%PDF-1.4 fake pdf content for testing"

    payload_file = {
        "file": ("my_cv.pdf", fake_pdf, "appilcation/pdf")
    }

    payload_data = {
        "github_url": "https://raw.githubusercontent.com/Rom1009/AI_Agent/refs/heads/main/README.md", 
        "cv_url": "cv_url"
    }

    response = client.post("/api/user/", data = payload_data)

    assert response.status_code in [200, 201]
    res_json = response.json()

    assert "profile_id" in res_json or "user_id" in res_json
    assert "job_id" in res_json

def test_save_profile_missing_input(client):
    fake_pdf = b"Take content"
    response = client.post("/api/user", files = {
        "file": ("cv.pdf", fake_pdf)
    }, data = {})

    assert response.status_code == 442

