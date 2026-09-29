from fastapi import APIRouter
from app.schemas.notices import NoticeListResponse
from app.services.scraper_service import fetch_active_notices

router = APIRouter()

@router.get("/notices", response_model=NoticeListResponse, tags=["Scraper & Notices"])
def get_active_notices():
    """
    Returns active exam recruitment notices scraped from official portals.
    """
    notices = fetch_active_notices()
    return NoticeListResponse(
        status="success",
        count=len(notices),
        notices=notices
    )
