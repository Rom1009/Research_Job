import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch 
import json

from backend.main  import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_save_profile_success(client):

    payload_data = {
        "github_url": "https://raw.githubusercontent.com/Rom1009/AI_Agent/refs/heads/main/README.md", 
        "cv_url": "cv_url"
    }

    response = client.post("/api/user/", json = payload_data)


    assert response.status_code in [200, 201]
    res_json = response.json()

    assert "profile_id" in res_json or "user_id" in res_json

def test_save_profile_missing_input(client):
    # Gửi payload trống/None để test xem logic có bắt lỗi chính xác không
    payload_data = {
        "github_url": None,
        "cv_url": None
    }
    
    response = client.post("/api/user/", json=payload_data)
    
    # 1. Sửa lại status_code mong muốn. 
    # Tùy thuộc vào việc ở backend bạn raise HTTPException(status_code=400, ...) hay 422
    assert response.status_code == 400

