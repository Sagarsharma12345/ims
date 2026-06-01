import os
from pathlib import Path

from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)


def _normalize_db_url(url: str) -> str:
    """Neon postgresql:// URL → SQLAlchemy + psycopg driver."""
    if url.startswith("postgresql://") and "+psycopg" not in url:
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


class Config:
    SQLALCHEMY_DATABASE_URI = _normalize_db_url(
        os.getenv("DATABASE_URL", "postgresql://localhost:5432/inventory_db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost"
    )

    @staticmethod
    def cors_origin_list():
        return [o.strip() for o in Config.CORS_ORIGINS.split(",") if o.strip()]
