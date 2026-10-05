import os

SECRET_KEY = os.getenv("SECRET_KEY", "cybershield-secret-key-soc-platform-2026-academic-lab")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cybershield.db")
