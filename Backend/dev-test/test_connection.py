import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from sqlalchemy import text
from app.database import engine
from sqlalchemy.exc import SQLAlchemyError

try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Database connection successful:", result.fetchone())
except SQLAlchemyError as e:
    print("❌ Database connection failed:", str(e))