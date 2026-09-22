from fastapi import APIRouter
from app.database.database import get_connection
from app.schemas.change import ChangeResult

router = APIRouter(
    prefix="/changes",
    tags=["Change Detection"]
)


@router.post("/")
def add_change_result(change: ChangeResult):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO changes (
            change_id,
            location_id,
            change_type,
            before_date,
            after_date,
            confidence,
            change_mask_path,
            warning
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            change.change_id,
            change.location_id,
            change.change_type,
            change.before_date,
            change.after_date,
            change.confidence,
            change.change_mask_path,
            change.warning
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Change result added successfully",
        "change": change
    }


@router.get("/")
def get_change_results():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM changes")
    changes = cursor.fetchall()

    connection.close()

    return [dict(change) for change in changes]