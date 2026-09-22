from pydantic import BaseModel
from typing import Optional


class ChangeResult(BaseModel):
    change_id: str
    location_id: str
    change_type: str
    before_date: str
    after_date: str
    confidence: float
    change_mask_path: Optional[str] = None
    warning: Optional[str] = None