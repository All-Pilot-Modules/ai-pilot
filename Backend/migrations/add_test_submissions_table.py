"""
Migration script to create test_submissions table.
Run this to add submission tracking to your database.

Usage:
    python migrations/add_test_submissions_table.py
"""

import sys
import os

# Add parent directory to path so we can import app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models.test_submission import TestSubmission

def upgrade():
    """Create the test_submissions table"""
    print("Creating test_submissions table...")

    # This will create the table if it doesn't exist
    Base.metadata.create_all(bind=engine, tables=[TestSubmission.__table__])

    print("✅ test_submissions table created successfully!")
    print("\nTable structure:")
    print("  - id: UUID (primary key)")
    print("  - student_id: String (indexed)")
    print("  - module_id: UUID (foreign key to modules)")
    print("  - attempt: Integer")
    print("  - submitted_at: TIMESTAMP")
    print("  - questions_count: Integer")
    print("\nConstraints:")
    print("  - Unique: (student_id, module_id, attempt)")
    print("  - Index: (student_id, module_id) for fast lookups")

def downgrade():
    """Drop the test_submissions table"""
    print("Dropping test_submissions table...")
    TestSubmission.__table__.drop(engine)
    print("✅ test_submissions table dropped successfully!")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "down":
        downgrade()
    else:
        upgrade()
