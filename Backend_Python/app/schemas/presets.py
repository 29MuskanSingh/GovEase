from pydantic import BaseModel
from typing import Dict, Any, Optional

class ImageSpec(BaseModel):
    minKB: int
    maxKB: int
    widthPx: int
    heightPx: int
    format: str
    instructions: str
    aspectRatio: Optional[str] = None

class PresetItem(BaseModel):
    id: str
    portalName: str
    examTitle: str
    photo: ImageSpec
    signature: ImageSpec

class PresetListResponse(BaseModel):
    status: str
    count: int
    presets: Dict[str, PresetItem]
