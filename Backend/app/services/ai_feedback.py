import openai
import json
import logging
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.core.config import OPENAI_API_KEY, LLM_MODEL
from app.models.question import Question
from app.models.student_answer import StudentAnswer
from app.models.module import Module
from app.crud.question import get_question_by_id
from app.services.embedding import search_similar_chunks
from app.services.rubric import get_module_rubric
from app.services.rag_retriever import get_context_for_feedback
from app.services.prompt_builder import (
    build_mcq_feedback_prompt,
    build_text_feedback_prompt,
    should_include_context
)
from app.crud.ai_feedback import create_feedback, get_feedback_by_answer
from app.schemas.ai_feedback import AIFeedbackCreate

logger = logging.getLogger(__name__)

class AIFeedbackService:
    """Service for generating AI-powered feedback on student answers"""

    def __init__(self):
        self.client = openai.OpenAI(api_key=OPENAI_API_KEY)
        self.default_model = LLM_MODEL

    def generate_instant_feedback(
        self,
        db: Session,
        student_answer: StudentAnswer,
        question_id: str,
        module_id: str
    ) -> Dict[str, Any]:
        """
        Generate instant AI feedback for student submission with rubric and RAG support

        Args:
            db: Database session
            student_answer: StudentAnswer object
            question_id: UUID of the question
            module_id: UUID of the module (for getting AI model config and rubric)

        Returns:
            Dict with feedback data
        """
        try:
            # Check if feedback already exists for this answer
            existing_feedback = get_feedback_by_answer(db, student_answer.id)

            if existing_feedback:
                logger.info(f"Returning existing feedback for answer {student_answer.id}")
                return self._feedback_model_to_dict(existing_feedback)

            # Get question details
            question = get_question_by_id(db, question_id)
            if not question:
                return self._error_response("Question not found")

            # Get module configuration
            module = db.query(Module).filter(Module.id == module_id).first()
            if not module:
                return self._error_response("Module not found")

            # Get rubric configuration (merges with defaults)
            rubric = get_module_rubric(db, module_id)

            # Get AI model from rubric or use default
            ai_model = self._get_ai_model_from_rubric(rubric)

            # Extract student's answer based on format
            student_answer_text = self._extract_answer_text(student_answer.answer)
            logger.info(f"📝 Extracted answer text: '{student_answer_text}' from raw answer: {student_answer.answer}")

            # Get RAG context if enabled in rubric
            rag_context = None
            should_use_rag = should_include_context(rubric, question.type)
            logger.info(f"🔍 RAG CHECK: should_include_context={should_use_rag}, question_type={question.type}")
            logger.info(f"🔍 RAG SETTINGS: {rubric.get('rag_settings', {})}")

            if should_use_rag:
                rag_settings = rubric.get("rag_settings", {})
                logger.info(f"🔍 ATTEMPTING RAG RETRIEVAL for module_id={module_id}")
                logger.info(f"   max_chunks={rag_settings.get('max_context_chunks', 3)}")
                logger.info(f"   similarity_threshold={rag_settings.get('similarity_threshold', 0.7)}")
                try:
                    rag_context = get_context_for_feedback(
                        db=db,
                        question_text=question.text,
                        student_answer=student_answer_text,
                        module_id=module_id,
                        max_chunks=rag_settings.get("max_context_chunks", 3),
                        similarity_threshold=rag_settings.get("similarity_threshold", 0.7),
                        include_document_locations=rag_settings.get("include_document_locations", True)
                    )
                    logger.info(f"✅ RAG context retrieved: has_context={rag_context.get('has_context', False)}")
                    if rag_context and rag_context.get('has_context'):
                        logger.info(f"   📚 Sources: {rag_context.get('sources', [])}")
                        logger.info(f"   📄 Chunks: {len(rag_context.get('chunks', []))}")
                    else:
                        logger.warning(f"⚠️  RAG returned no context")
                except Exception as rag_error:
                    logger.error(f"❌ RAG retrieval failed: {str(rag_error)}")
                    logger.exception("Full RAG error traceback:")
                    rag_context = None
            else:
                logger.info(f"⏭️  Skipping RAG (should_include_context=False)")

            # Generate feedback based on question type
            if question.type == 'mcq':
                feedback = self._analyze_mcq_answer(
                    student_answer=student_answer_text,
                    question=question,
                    ai_model=ai_model,
                    rubric=rubric,
                    rag_context=rag_context
                )
            else:
                feedback = self._analyze_text_answer(
                    student_answer=student_answer_text,
                    question=question,
                    ai_model=ai_model,
                    rubric=rubric,
                    rag_context=rag_context
                )

            # Prepare feedback data for storage
            feedback_data = {
                "explanation": feedback.get("explanation", ""),
                "improvement_hint": feedback.get("improvement_hint"),
                "concept_explanation": feedback.get("concept_explanation"),
                "strengths": feedback.get("strengths"),
                "weaknesses": feedback.get("weaknesses"),
                "selected_option": feedback.get("selected_option"),
                "correct_option": feedback.get("correct_option"),
                "available_options": feedback.get("available_options"),
                "model_used": ai_model,
                "confidence_level": feedback.get("confidence_level", "medium"),
                "feedback_type": feedback.get("feedback_type"),
                "used_rag": rag_context is not None and rag_context.get("has_context", False),
                "rag_sources": rag_context.get("sources", []) if rag_context and rag_context.get("has_context") else None
            }

            # Save feedback to database
            try:
                logger.info(f"💾 Attempting to save feedback for answer_id: {student_answer.id}")
                logger.info(f"💾 Feedback data: is_correct={feedback.get('is_correct')}, score={feedback.get('correctness_score')}")

                feedback_create = AIFeedbackCreate(
                    answer_id=student_answer.id,
                    is_correct=feedback.get("is_correct"),  # Allow None when no correct answer
                    score=feedback.get("correctness_score"),  # Allow None when no correct answer
                    feedback_data=feedback_data
                )

                db_feedback = create_feedback(db, feedback_create)
                logger.info(f"✅ Feedback saved to database with ID: {db_feedback.id}")

            except Exception as db_error:
                logger.error(f"❌ Failed to save feedback to database: {str(db_error)}")
                logger.exception("Full traceback:")
                # Continue even if database save fails - return the feedback anyway

            # Return complete feedback for API response
            return {
                **feedback,
                "feedback_id": str(student_answer.id),
                "question_id": question_id,
                "attempt_number": student_answer.attempt,
                "generated_at": student_answer.submitted_at.isoformat(),
                "model_used": ai_model
            }

        except Exception as e:
            logger.error(f"Error generating feedback: {str(e)}")
            return self._error_response(f"Failed to generate feedback: {str(e)}")
    
    def _get_ai_model_from_module(self, module: Optional[Module]) -> str:
        """Extract AI model from module configuration or use default"""
        if not module or not module.assignment_config:
            return self.default_model

        chatbot_config = module.assignment_config.get("features", {}).get("chatbot_feedback", {})
        return chatbot_config.get("ai_model", self.default_model)

    def _get_ai_model_from_rubric(self, rubric: Dict[str, Any]) -> str:
        """Extract AI model from rubric configuration or use default"""
        # For now, we use the default model
        # In future, could support model selection per rubric
        return self.default_model
    
    def _extract_answer_text(self, answer_data: Dict[str, Any]) -> str:
        """Extract text from answer JSON structure"""
        if isinstance(answer_data, str):
            return answer_data

        # Handle JSONB format: {selected_option_id: "A"} (new) or {selected_option: "A"} (old) or {text_response: "..."}
        # For MCQ, we always use the option ID (the letter) for comparison
        if "selected_option_id" in answer_data:
            return answer_data["selected_option_id"]
        elif "selected_option" in answer_data:
            return answer_data["selected_option"]
        elif "text_response" in answer_data:
            return answer_data["text_response"]

        return str(answer_data)
    
    def _analyze_mcq_answer(
        self,
        student_answer: str,
        question: Question,
        ai_model: str,
        rubric: Dict[str, Any],
        rag_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze multiple choice question answer with rubric and RAG support"""

        # Get correct answer - check both fields (new correct_option_id and legacy correct_answer)
        correct_answer = question.correct_option_id or question.correct_answer
        options = question.options or {}

        # Handle missing correct answer - still provide feedback, just without correctness evaluation
        has_correct_answer = bool(correct_answer)
        if not has_correct_answer:
            logger.warning(f"⚠️  Question {question.id} has no correct answer set - will provide general feedback only")
            is_correct = None  # Unknown correctness
        else:
            # Check if answer is correct
            # Handle both cases: student_answer could be the option letter (e.g., "A")
            # or the option text (e.g., "one") due to legacy data
            is_correct = False
            if student_answer and student_answer.upper() == correct_answer.upper():
                # Direct match with option letter
                is_correct = True
            elif options and student_answer:
                # Check if student_answer matches the text of the correct option
                correct_option_text = options.get(correct_answer, "").strip().lower()
                if student_answer.strip().lower() == correct_option_text:
                    is_correct = True
                # Also check if the correct_answer matches any option key that has this text
                for key, value in options.items():
                    if (student_answer.upper() == key.upper() and
                        correct_answer.upper() == key.upper()):
                        is_correct = True
                        break

        # Build dynamic prompt using rubric and RAG context
        prompt = build_mcq_feedback_prompt(
            question_text=question.text,
            options=options,
            student_answer=student_answer,
            correct_answer=correct_answer,
            is_correct=is_correct,
            rubric=rubric,
            rag_context=rag_context
        )

        # 🎯 LOG: OpenAI API call details
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        logger.info("🎯 OPENAI API CALL - MCQ FEEDBACK")
        logger.info(f"📤 Model: {ai_model}")
        logger.info(f"📤 Temperature: 0.3")
        logger.info(f"📤 Max Tokens: 800")
        logger.info(f"📤 Question ID: {question.id}")
        logger.info(f"📤 Student Answer: {student_answer}")
        logger.info(f"📤 Correct Answer: {correct_answer}")
        logger.info(f"📤 Is Correct: {is_correct}")
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        logger.info("📤 FULL PROMPT SENT TO OPENAI:")
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        logger.info(prompt)
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        try:
            response = self.client.chat.completions.create(
                model=ai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=800  # Increased for RAG-enhanced feedback
            )

            # Parse JSON response
            feedback_text = response.choices[0].message.content.strip()

            # 🎯 LOG: OpenAI response
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            logger.info("✅ OPENAI RESPONSE RECEIVED")
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            logger.info("📥 Raw Response:")
            logger.info(feedback_text)
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            # Handle markdown code blocks if present
            if feedback_text.startswith("```"):
                feedback_text = feedback_text.split("```")[1]
                if feedback_text.startswith("json"):
                    feedback_text = feedback_text[4:]
                feedback_text = feedback_text.strip()

            feedback = json.loads(feedback_text)

            # Add MCQ-specific metadata
            feedback.update({
                "feedback_type": "mcq",
                "selected_option": student_answer,
                "correct_option": correct_answer,
                "available_options": options
            })

            # 🎯 LOG: Parsed feedback
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            logger.info("💾 PARSED FEEDBACK DATA:")
            logger.info(f"   ✓ is_correct: {feedback.get('is_correct')}")
            logger.info(f"   ✓ correctness_score: {feedback.get('correctness_score')}")
            logger.info(f"   ✓ explanation: {feedback.get('explanation', '')[:100]}...")
            logger.info(f"   ✓ improvement_hint: {feedback.get('improvement_hint', '')[:100]}...")
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            return feedback

        except json.JSONDecodeError as je:
            logger.error(f"JSON decode error: {str(je)}, Response: {feedback_text}")
            return self._fallback_mcq_feedback(student_answer, correct_answer, options, is_correct)
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._fallback_mcq_feedback(student_answer, correct_answer, options, is_correct)
    
    def _analyze_text_answer(
        self,
        student_answer: str,
        question: Question,
        ai_model: str,
        rubric: Dict[str, Any],
        rag_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze text-based (short/essay) question answer with rubric and RAG support"""

        correct_answer = question.correct_answer or "No reference answer provided"
        question_type = question.type

        # Check if we have a reference answer to compare against
        has_reference = question.correct_answer and question.correct_answer.strip()
        if not has_reference:
            logger.warning(f"⚠️  Question {question.id} has no reference answer set - will provide general feedback only")

        # Build dynamic prompt using rubric and RAG context
        prompt = build_text_feedback_prompt(
            question_text=question.text,
            question_type=question_type,
            student_answer=student_answer,
            reference_answer=correct_answer,
            rubric=rubric,
            rag_context=rag_context
        )

        # 🎯 LOG: OpenAI API call details
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        logger.info(f"🎯 OPENAI API CALL - {question_type.upper()} FEEDBACK")
        logger.info(f"📤 Model: {ai_model}")
        logger.info(f"📤 Temperature: 0.3")
        logger.info(f"📤 Max Tokens: 1200")
        logger.info(f"📤 Question ID: {question.id}")
        logger.info(f"📤 Student Answer Length: {len(student_answer)} chars")
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        logger.info("📤 FULL PROMPT SENT TO OPENAI:")
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        logger.info(prompt)
        logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        try:
            response = self.client.chat.completions.create(
                model=ai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1200  # Increased for detailed RAG-enhanced feedback
            )

            # Parse JSON response
            feedback_text = response.choices[0].message.content.strip()

            # 🎯 LOG: OpenAI response
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            logger.info("✅ OPENAI RESPONSE RECEIVED")
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            logger.info("📥 Raw Response:")
            logger.info(feedback_text)
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            # Handle markdown code blocks if present
            if feedback_text.startswith("```"):
                feedback_text = feedback_text.split("```")[1]
                if feedback_text.startswith("json"):
                    feedback_text = feedback_text[4:]
                feedback_text = feedback_text.strip()

            feedback = json.loads(feedback_text)

            # Add text-specific metadata
            feedback.update({
                "feedback_type": question.type,
                "answer_length": len(student_answer),
                "reference_answer": correct_answer
            })

            # 🎯 LOG: Parsed feedback
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            logger.info("💾 PARSED FEEDBACK DATA:")
            logger.info(f"   ✓ is_correct: {feedback.get('is_correct')}")
            logger.info(f"   ✓ correctness_score: {feedback.get('correctness_score')}")
            logger.info(f"   ✓ strengths: {len(feedback.get('strengths', []))} items")
            logger.info(f"   ✓ weaknesses: {len(feedback.get('weaknesses', []))} items")
            logger.info(f"   ✓ explanation: {feedback.get('explanation', '')[:100]}...")
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

            return feedback

        except json.JSONDecodeError as je:
            logger.error(f"JSON decode error: {str(je)}, Response: {feedback_text}")
            return self._fallback_text_feedback(student_answer, correct_answer, question.type)
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._fallback_text_feedback(student_answer, correct_answer, question.type)
    
    def _format_options(self, options: Dict[str, str]) -> str:
        """Format MCQ options for prompt"""
        formatted = []
        for key, value in options.items():
            formatted.append(f"{key}. {value}")
        return "\n".join(formatted)
    
    def _fallback_mcq_feedback(
        self,
        student_answer: str,
        correct_answer: str,
        options: Dict[str, str],
        is_correct: bool
    ) -> Dict[str, Any]:
        """Fallback feedback when AI fails"""
        # Get the correct option text for better feedback
        correct_option_text = options.get(correct_answer, correct_answer) if options else correct_answer
        correct_display = f"{correct_answer} ({correct_option_text})" if options else correct_answer

        return {
            "is_correct": is_correct,
            "correctness_score": 100 if is_correct else 0,
            "feedback_type": "mcq",
            "explanation": f"Your answer is {'correct' if is_correct else 'incorrect'}. The correct answer is {correct_display}.",
            "improvement_hint": "Review the question and consider the key concepts being tested." if not is_correct else "Well done!",
            "concept_explanation": "Please review the related course material.",
            "confidence_level": "medium",
            "selected_option": student_answer,
            "correct_option": correct_answer,
            "available_options": options,
            "fallback": True
        }
    
    def _fallback_text_feedback(
        self, 
        student_answer: str, 
        correct_answer: str, 
        question_type: str
    ) -> Dict[str, Any]:
        """Fallback feedback for text answers when AI fails"""
        return {
            "is_correct": len(student_answer.strip()) > 0,
            "correctness_score": 50,  # Neutral score when AI unavailable
            "feedback_type": question_type,
            "explanation": "Your answer has been submitted. Please compare with the reference answer.",
            "strengths": ["Answer provided"],
            "weaknesses": ["Detailed analysis unavailable"],
            "improvement_hint": "Review the reference answer and course materials.",
            "concept_explanation": "Please refer to course materials for concept review.",
            "missing_concepts": [],
            "confidence_level": "low",
            "reference_answer": correct_answer,
            "fallback": True
        }
    
    def _error_response(self, message: str) -> Dict[str, Any]:
        """Generate error response"""
        return {
            "error": True,
            "message": message,
            "is_correct": False,
            "correctness_score": 0,
            "feedback_type": "error",
            "explanation": "Feedback could not be generated due to an error.",
            "improvement_hint": "Please try again or contact support.",
            "confidence_level": "low"
        }

    def _feedback_model_to_dict(self, feedback_model) -> Dict[str, Any]:
        """Convert AIFeedback model to dictionary for API response"""
        data = feedback_model.feedback_data or {}
        return {
            "is_correct": feedback_model.is_correct,
            "correctness_score": feedback_model.score,
            "explanation": data.get("explanation", ""),
            "improvement_hint": data.get("improvement_hint"),
            "concept_explanation": data.get("concept_explanation"),
            "strengths": data.get("strengths"),
            "weaknesses": data.get("weaknesses"),
            "selected_option": data.get("selected_option"),
            "correct_option": data.get("correct_option"),
            "available_options": data.get("available_options"),
            "used_rag": data.get("used_rag", False),
            "rag_sources": data.get("rag_sources"),
            "model_used": data.get("model_used", "gpt-4"),
            "confidence_level": data.get("confidence_level", "medium"),
            "generated_at": feedback_model.generated_at.isoformat() if feedback_model.generated_at else None,
            "feedback_id": str(feedback_model.id),
            "feedback_type": data.get("feedback_type", "unknown")
        }
