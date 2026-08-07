import pytest
from fastapi.testclient import TestClient
from .main import app

client = TestClient(app)

def test_create_simulation():
    response = client.post(
        "/simulations",
        json={
            "name": "test",
            "config": {
                "bodies": [
                    {
                        "mass": 1.0,
                        "x": 0,
                        "y": 0,
                        "vx": 0,
                        "vy": 0,
                    }
                ]
            },
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "test"
    assert "id" in data


def test_list_simulations():
    client.post(
        "/simulations",
        json={
            "name": "list_test",
            "config": {
                "bodies": [
                    {
                        "mass": 1.0,
                        "x": 0,
                        "y": 0,
                        "vx": 0,
                        "vy": 0,
                    }
                ]
            },
        },
    )

    response = client.get("/simulations")

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1


def test_get_simulation():
    create = client.post(
        "/simulations",
        json={
            "name": "get_test",
            "config": {
                "bodies": [
                    {
                        "mass": 1.0,
                        "x": 0,
                        "y": 0,
                        "vx": 0,
                        "vy": 0,
                    }
                ]
            },
        },
    )

    sim_id = create.json()["id"]

    response = client.get(f"/simulations/{sim_id}")

    assert response.status_code == 200
    assert response.json()["id"] == sim_id


def test_fork_simulation():
    create = client.post(
        "/simulations",
        json={
            "name": "original",
            "config": {
                "bodies": [
                    {
                        "mass": 1.0,
                        "x": 0,
                        "y": 0,
                        "vx": 0,
                        "vy": 0,
                    }
                ]
            },
        },
    )

    sim_id = create.json()["id"]

    response = client.post(f"/simulations/{sim_id}/fork")

    assert response.status_code == 200

    fork = response.json()

    assert fork["id"] != sim_id
    assert fork["forked_from_id"] == sim_id
    assert fork["name"] == "original (fork)"

def test_step_simulation():
    create = client.post(
        "/simulations",
        json={
            "name": "physics",
            "config": {
                "bodies": [
                    {
                        "mass": 1e20,
                        "x": 0,
                        "y": 0,
                        "vx": 0,
                        "vy": 0,
                    },
                    {
                        "mass": 1e20,
                        "x": 1000,
                        "y": 0,
                        "vx": 0,
                        "vy": 0,
                    },
                ]
            },
        },
    )

    sim_id = create.json()["id"]

    response = client.post(
        f"/simulations/{sim_id}/step?num_steps=1&dt=1"
    )

    assert response.status_code == 200

    bodies = response.json()["config"]["bodies"]

    left = bodies[0]
    right = bodies[1]

    # Left body should move right
    assert left["x"] > 0

    # Right body should move left
    assert right["x"] < 1000

    assert left["vx"] > 0
    assert right["vx"] < 0