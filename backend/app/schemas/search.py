from pydantic import BaseModel


class SearchResult(BaseModel):
    location_id: str
    query: str
    relevance_score: float