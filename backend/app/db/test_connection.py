# pyrefly: ignore [missing-import]
from sqlalchemy import text

from app.db.session import engine


try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))

    print("Database Connected Successfully")

except Exception as e:
    print(f"Database Error: {e}")