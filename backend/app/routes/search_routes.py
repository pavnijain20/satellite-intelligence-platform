from fastapi import APIRouter
from app.database.database import get_connection
from app.schemas.search import SearchResult


router = APIRouter(
    prefix="/search",
    tags=["Semantic Search"]
)


@router.post("/")
def add_search_result(result: SearchResult):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO search_results (
            location_id,
            query,
            relevance_score
        )
        VALUES (?, ?, ?)
        """,
        (
            result.location_id,
            result.query,
            result.relevance_score
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Search result added successfully",
        "result": result
    }


@router.get("/")
def get_search_results():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM search_results")
    results = cursor.fetchall()

    connection.close()

    return [dict(result) for result in results]