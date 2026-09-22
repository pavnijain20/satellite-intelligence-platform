from pydantic import BaseModel
from typing import List


class Provenance(BaseModel):
    change_id: str
    source_sensor: str
    before_image: str
    after_image: str
    processing_steps: List[str]
    model_version: str
    created_at: str