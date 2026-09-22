from fastapi import FastAPI
from app.database.database import create_tables
from app.routes.location_routes import router as location_router
from app.routes.satellite_routes import router as satellite_router
from app.routes.search_routes import router as search_router
from app.routes.change_routes import router as change_router
from app.routes.analyst_routes import router as analyst_router
from app.routes.provenance_routes import router as provenance_router
app = FastAPI(
    title="Satellite Change Analysis API",
    version="1.0.0"
)


@app.on_event("startup")
def startup():
    create_tables()


app.include_router(location_router)
app.include_router(satellite_router)
app.include_router(search_router)
app.include_router(change_router)
app.include_router(analyst_router)
app.include_router(provenance_router)


@app.get("/")
def home():
    return {
        "message": "Satellite Change Analysis Backend is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }