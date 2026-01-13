from fastapi.testclient import TestClient
from app.main import app
from app.db.base import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


# Setup in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


Base.metadata.create_all(bind=engine)

app.dependency_overrides = getattr(app, 'dependency_overrides', {})
from app.db.base import get_db
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_register_login_and_get_ship():
    r = client.post("/api/auth/register", json={"username": "testuser", "password": "password123", "email": "t@example.com"})
    assert r.status_code == 200
    token = r.json().get("access_token")
    assert token

    headers = {"Authorization": f"Bearer {token}"}

    r = client.get("/api/player/me", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data.get("username") == "testuser"

    r = client.get("/api/ship", headers=headers)
    assert r.status_code == 200
    ship = r.json()
    assert "name" in ship
