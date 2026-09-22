from fastapi import APIRouter
from app.database.database import get_connection
from app.schemas.location import Location


router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)


@router.post("/")
def add_location(location: Location):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO locations (location_id, latitude, longitude)
        VALUES (?, ?, ?)
        """,
        (
            location.location_id,
            location.latitude,
            location.longitude
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Location added successfully",
        "location": location
    }


@router.get("/")
def get_locations():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM locations")
    locations = cursor.fetchall()

    connection.close()

    return [dict(location) for location in locations]