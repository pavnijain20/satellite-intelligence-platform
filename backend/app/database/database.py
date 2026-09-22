import sqlite3

DATABASE_NAME = "satellite_analysis.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_NAME)
    connection.row_factory = sqlite3.Row
    return connection


def create_tables():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS locations (
            location_id TEXT PRIMARY KEY,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS satellite_images (
            image_id TEXT PRIMARY KEY,
            location_id TEXT NOT NULL,
            date TEXT NOT NULL,
            sensor TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            cloud_percentage REAL,
            file_path TEXT,
            FOREIGN KEY (location_id) REFERENCES locations(location_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS search_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_id TEXT NOT NULL,
            query TEXT NOT NULL,
            relevance_score REAL NOT NULL,
            FOREIGN KEY (location_id) REFERENCES locations(location_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS changes (
            change_id TEXT PRIMARY KEY,
            location_id TEXT NOT NULL,
            change_type TEXT NOT NULL,
            before_date TEXT NOT NULL,
            after_date TEXT NOT NULL,
            confidence REAL NOT NULL,
            change_mask_path TEXT,
            warning TEXT,
            FOREIGN KEY (location_id) REFERENCES locations(location_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyst_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            change_id TEXT NOT NULL,
            decision TEXT NOT NULL,
            comment TEXT,
            analyst_id TEXT NOT NULL,
            FOREIGN KEY (change_id) REFERENCES changes(change_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS provenance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            change_id TEXT NOT NULL,
            source_sensor TEXT NOT NULL,
            before_image TEXT NOT NULL,
            after_image TEXT NOT NULL,
            processing_steps TEXT NOT NULL,
            model_version TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (change_id) REFERENCES changes(change_id)
        )
    """)

    connection.commit()
    connection.close()