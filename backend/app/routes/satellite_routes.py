from fastapi import APIRouter
from app.database.database import get_connection
from app.schemas.satellite import SatelliteImage


router = APIRouter(
    prefix="/satellite-images",
    tags=["Satellite Images"]
)


@router.post("/")
def add_satellite_image(image: SatelliteImage):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO satellite_images (
            image_id,
            location_id,
            date,
            sensor,
            latitude,
            longitude,
            cloud_percentage,
            file_path
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            image.image_id,
            image.location_id,
            image.date,
            image.sensor,
            image.latitude,
            image.longitude,
            image.cloud_percentage,
            image.file_path
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Satellite image added successfully",
        "image": image
    }


@router.get("/")
def get_satellite_images():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM satellite_images")
    images = cursor.fetchall()

    connection.close()

    return [dict(image) for image in images]