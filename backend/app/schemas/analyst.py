from pydantic import BaseModel


class AnalystFeedback(BaseModel):
    change_id: str
    decision: str
    comment: str | None = None
    analyst_id: str