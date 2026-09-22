from pydantic import BaseModel
from typing import Optional


class SatelliteImage(BaseModel):
    image_id: str
    location_id: str
    date: str
    sensor: str
    latitude: float
    longitude: float
    cloud_percentage: Optional[float] = None
    file_path: Optional[str] = None