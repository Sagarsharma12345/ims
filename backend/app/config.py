import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def get_db_url():
    url = os.getenv("DATABASE_URL")
    if url:
        if url.startswith("postgresql://") and "+psycopg" not in url:
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    host = os.getenv("POSTGRES_HOST")
    if not host:
        return "postgresql+psycopg://localhost:5432/inventory_db"

    user = quote_plus(os.getenv("POSTGRES_USER", ""))
    password = quote_plus(os.getenv("POSTGRES_PASSWORD", ""))
    name = os.getenv("POSTGRES_DB", "inventory_db")
    port = os.getenv("POSTGRES_PORT", "5432")
    return f"postgresql+psycopg://{user}:{password}@{host}:{port}/{name}"


class Config:
    SQLALCHEMY_DATABASE_URI = get_db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")

    @staticmethod
    def cors_origin_list():
        return [x.strip() for x in Config.CORS_ORIGINS.split(",") if x.strip()]
