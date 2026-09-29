from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }
