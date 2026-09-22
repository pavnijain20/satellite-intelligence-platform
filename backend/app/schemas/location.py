from pydantic import BaseModel


class Location(BaseModel):
    location_id: str
    latitude: float
    longitude: float