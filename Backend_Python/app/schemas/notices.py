from pydantic import BaseModel
from typing import List

class NoticeItem(BaseModel):
    id: str
    organization: str
    title: str
    notificationNumber: str
    startDate: str
    endDate: str
    portalUrl: str
    category: str
    summary: str

class NoticeListResponse(BaseModel):
    status: str
    count: int
    notices: List[NoticeItem]
