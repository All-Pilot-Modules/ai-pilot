from fastapi import APIRouter
from app.core.config import OPENAI_API_KEY, UPLOAD_DIR

router = APIRouter()

@router.get("/test-env")
def test_env():
    return {
        "OPENAI_API_KEY": OPENAI_API_KEY[:5] + "*****",  # Don't return full key
        "UPLOAD_DIR": UPLOAD_DIR,
       
    }