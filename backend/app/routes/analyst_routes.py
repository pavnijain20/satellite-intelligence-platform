from fastapi import APIRouter
from app.database.database import get_connection
from app.schemas.analyst import AnalystFeedback

router = APIRouter(
    prefix="/analyst",
    tags=["Analyst Feedback"]
)


@router.post("/feedback")
def add_analyst_feedback(feedback: AnalystFeedback):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO analyst_feedback (
            change_id,
            decision,
            comment,
            analyst_id
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            feedback.change_id,
            feedback.decision,
            feedback.comment,
            feedback.analyst_id
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Analyst feedback added successfully",
        "feedback": feedback
    }


@router.get("/feedback")
def get_analyst_feedback():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM analyst_feedback")
    feedback = cursor.fetchall()

    connection.close()

    return [dict(item) for item in feedback]