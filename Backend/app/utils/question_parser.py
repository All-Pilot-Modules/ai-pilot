# app/utils/question_parser.py
import re
from uuid import UUID

def parse_testbank_text_to_questions(raw_text: str, module_id: UUID, document_id: UUID = None) -> list[dict]:
    questions = []
    lines = raw_text.splitlines()
    i = 0
    question_counter = 1  # Track question order
    while i < len(lines):
        line = lines[i].strip()

        # Match both "1)" and "1." formats
        match = re.match(r"^(\d+)[.)]\s+(.*)", line)
        if match:
            q_text = match.group(2)
            options = {}
            correct_answer_letter = None
            learning_outcome = None
            bloom_taxonomy = None

            i += 1
            while i < len(lines):
                opt_line = lines[i].strip()

                # Match both "A)" and "a." formats (case-insensitive)
                opt_match = re.match(r"^([A-Ea-e])[.)]\s+(.*)", opt_line)
                if opt_match:
                    # Normalize option letter to uppercase
                    option_letter = opt_match.group(1).upper()
                    options[option_letter] = opt_match.group(2)
                    i += 1
                # Match "Answer:" in various formats (case-insensitive, flexible spacing)
                # Matches: "Answer: a", "Answer:a", "answer: A", "Ans: b", "ANS:c", etc.
                elif re.search(r"\b(answer|ans)\s*:\s*([A-Ea-e])\b", opt_line, re.IGNORECASE):
                    answer_match = re.search(r"\b(answer|ans)\s*:\s*([A-Ea-e])\b", opt_line, re.IGNORECASE)
                    correct_answer_letter = answer_match.group(2).upper()
                    i += 1
                elif opt_line.lower().startswith("learning outcome:"):
                    learning_outcome = re.sub(r"^learning outcome:\s*", "", opt_line, flags=re.IGNORECASE).strip()
                    i += 1
                elif opt_line.lower().startswith("bloom"):
                    bloom_taxonomy = opt_line.strip()
                    i += 1
                elif re.match(r"^\d+[.)]", opt_line):
                    # Next question found (matches both "1)" and "1.")
                    break
                else:
                    i += 1

            q_type = "mcq" if options else "short"

            # For MCQ questions: use correct_option_id (stores letter A, B, C, D, E)
            # For short/long answers: use correct_answer (stores text)
            correct_option_id = None
            correct_answer = None

            if q_type == "mcq":
                correct_option_id = correct_answer_letter  # Store the letter (A, B, C, D, E)
                # Debug: Warn if MCQ has no answer
                if not correct_option_id:
                    print(f"⚠️ Question {len(questions) + 1} missing answer: {q_text[:50]}...")
            elif q_type == "short":
                correct_answer = correct_answer_letter  # For short answers, store the text

            questions.append({
                "module_id": str(module_id),
                "document_id": str(document_id) if document_id else None,
                "type": q_type,
                "text": q_text,
                "slide_number": None,
                "question_order": question_counter,
                "options": options if options else None,
                "correct_option_id": correct_option_id,  # MCQ correct answer letter
                "correct_answer": correct_answer,  # Short/long answer text
                "learning_outcome": learning_outcome,
                "bloom_taxonomy": bloom_taxonomy,
                "image_url": None,
                "has_text_input": False if q_type == "short" else True
            })
            question_counter += 1
        else:
            i += 1

    print(f"✅ Parsed {len(questions)} questions from testbank")
    return questions