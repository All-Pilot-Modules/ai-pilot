# app/utils/question_parser.py
import re
from uuid import UUID

def parse_testbank_text_to_questions(raw_text: str, module_id: UUID, document_id: UUID = None) -> list[dict]:
    questions = []
    lines = raw_text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()

        match = re.match(r"^(\d+)\)\s+(.*)", line)
        if match:
            q_text = match.group(2)
            options = {}
            correct_answer_letter = None
            learning_outcome = None
            bloom_taxonomy = None

            i += 1
            while i < len(lines):
                opt_line = lines[i].strip()

                opt_match = re.match(r"^([A-Z])\)\s+(.*)", opt_line)
                if opt_match:
                    options[opt_match.group(1)] = opt_match.group(2)
                    i += 1
                elif opt_line.startswith("Answer:"):
                    correct_answer_letter = opt_line.replace("Answer:", "").strip()
                    i += 1
                elif opt_line.startswith("Learning Outcome:"):
                    learning_outcome = opt_line.replace("Learning Outcome:", "").strip()
                    i += 1
                elif opt_line.startswith("Bloom"):
                    bloom_taxonomy = opt_line.strip()
                    i += 1
                elif re.match(r"^\d+\)", opt_line):
                    break
                else:
                    i += 1

            q_type = "mcq" if options else "short"

            # For MCQ questions, we want to store the letter (A, B, C, D, E)
            # For short answers, we store the text answer
            correct_answer = None
            if q_type == "mcq":
                correct_answer = correct_answer_letter  # Store the letter (A, B, C, D, E)
            elif q_type == "short":
                correct_answer = correct_answer_letter  # For short answers, store the text

            questions.append({
                "module_id": str(module_id),
                "document_id": str(document_id) if document_id else None,
                "type": q_type,
                "text": q_text,
                "slide_number": None,
                "options": options if options else None,
                "correct_answer": correct_answer,
                "learning_outcome": learning_outcome,
                "bloom_taxonomy": bloom_taxonomy,
                "image_url": None,
                "has_text_input": False if q_type == "short" else True
            })
        else:
            i += 1
    print(questions)
    return questions