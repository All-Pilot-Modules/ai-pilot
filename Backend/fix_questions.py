"""
Quick script to fix questions with missing correct_answer
"""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.question import Question

db = SessionLocal()

# Get all questions without correct_answer
questions = db.query(Question).filter(Question.correct_answer == None).all()

print(f"Found {len(questions)} questions without correct_answer")

for q in questions:
    print(f"\nQuestion ID: {q.id}")
    print(f"Text: {q.text}")
    print(f"Type: {q.type}")
    print(f"Options: {q.options}")

    if q.type == 'mcq' and q.options:
        # For MCQ, set correct_answer to first option (you can change this)
        first_option = list(q.options.keys())[0]
        q.correct_answer = first_option
        print(f"✅ Set correct_answer to: {first_option}")
    else:
        # For text questions, set a sample answer
        q.correct_answer = "Sample answer - please update"
        print(f"✅ Set correct_answer to: 'Sample answer - please update'")

db.commit()
print(f"\n✅ Updated {len(questions)} questions")
db.close()
