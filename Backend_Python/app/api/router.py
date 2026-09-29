from fastapi import APIRouter
from app.api.endpoints import health, presets, eligibility, notices

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(presets.router)
api_router.include_router(eligibility.router)
api_router.include_router(notices.router)
