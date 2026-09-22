from fastapi import APIRouter
from app.database.database import get_connection
from app.schemas.provenance import Provenance
import json

router = APIRouter(
    prefix="/provenance",
    tags=["Provenance"]
)


@router.post("/")
def add_provenance(provenance: Provenance):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO provenance (
            change_id,
            source_sensor,
            before_image,
            after_image,
            processing_steps,
            model_version,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            provenance.change_id,
            provenance.source_sensor,
            provenance.before_image,
            provenance.after_image,
            json.dumps(provenance.processing_steps),
            provenance.model_version,
            provenance.created_at
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Provenance added successfully",
        "provenance": provenance
    }


@router.get("/")
def get_provenance():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM provenance")
    records = cursor.fetchall()

    connection.close()

    result = []

    for record in records:
        item = dict(record)
        item["processing_steps"] = json.loads(item["processing_steps"])
        result.append(item)

    return result