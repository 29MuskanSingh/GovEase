from fastapi import APIRouter, HTTPException
from app.core.presets_db import PORTAL_PRESETS
from app.schemas.presets import PresetListResponse, PresetItem

router = APIRouter()

@router.get("/presets", response_model=PresetListResponse, tags=["Presets"])
def get_all_presets():
    """
    Returns all portal document formatting presets (UPSC, SSC, IBPS, RRB, NTA).
    Used by React Frontend (Sarkari Studio) and Chrome Extension to resize photos/signatures.
    """
    return PresetListResponse(
        status="success",
        count=len(PORTAL_PRESETS),
        presets=PORTAL_PRESETS
    )

@router.get("/presets/{preset_id}", response_model=PresetItem, tags=["Presets"])
def get_preset_by_id(preset_id: str):
    """
    Fetch image dimension and KB constraints for a single portal by ID (e.g. 'ssc_cgl').
    """
    preset = PORTAL_PRESETS.get(preset_id.lower())
    if not preset:
        raise HTTPException(status_code=404, detail=f"Portal preset '{preset_id}' not found.")
    return preset
