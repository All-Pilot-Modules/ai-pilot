import openai
import json
import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import OPENAI_API_KEY, LLM_MODEL
from app.models.question import Question
from app.models.student_answer import StudentAnswer
from app.models.module import Module
from app.crud.question import get_question_by_id

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
        Generate instant AI feedback for first attempt submission
        
        Args:
            db: Database session
            student_answer: StudentAnswer object
            question_id: UUID of the question
            module_id: UUID of the module (for getting AI model config)
        
        Returns:
            Dict with feedback data
        """
        try:
            # Get question details
            question = get_question_by_id(db, question_id)
            if not question:
                return self._error_response("Question not found")
            
            # Get module configuration for AI model
            module = db.query(Module).filter(Module.id == module_id).first()
            ai_model = self._get_ai_model_from_module(module)
            
            # Extract student's answer based on format
            student_answer_text = self._extract_answer_text(student_answer.answer)
            
            # Generate feedback based on question type
            if question.type == 'mcq':
                feedback = self._analyze_mcq_answer(
                    student_answer=student_answer_text,
                    question=question,
                    ai_model=ai_model
                )
            else:
                feedback = self._analyze_text_answer(
                    student_answer=student_answer_text,
                    question=question,
                    ai_model=ai_model
                )
            
            # Add metadata
            feedback.update({
                "feedback_id": str(student_answer.id),
                "question_id": question_id,
                "attempt_number": student_answer.attempt,
                "generated_at": student_answer.submitted_at.isoformat(),
                "model_used": ai_model
            })
            
            return feedback
            
        except Exception as e:
            logger.error(f"Error generating feedback: {str(e)}")
            return self._error_response(f"Failed to generate feedback: {str(e)}")
    
    def _get_ai_model_from_module(self, module: Optional[Module]) -> str:
        """Extract AI model from module configuration or use default"""
        if not module or not module.assignment_config:
            return self.default_model
        
        chatbot_config = module.assignment_config.get("features", {}).get("chatbot_feedback", {})
        return chatbot_config.get("ai_model", self.default_model)
    
    def _extract_answer_text(self, answer_data: Dict[str, Any]) -> str:
        """Extract text from answer JSON structure"""
        if isinstance(answer_data, str):
            return answer_data
        
        # Handle JSONB format: {selected_option: "A", text_response: "..."}
        if "selected_option" in answer_data:
            return answer_data["selected_option"]
        elif "text_response" in answer_data:
            return answer_data["text_response"]
        
        return str(answer_data)
    
    def _analyze_mcq_answer(
        self, 
        student_answer: str, 
        question: Question, 
        ai_model: str
    ) -> Dict[str, Any]:
        """Analyze multiple choice question answer"""
        
        # Get correct answer and options
        correct_answer = question.correct_answer
        options = question.options or {}
        
        # Check if answer is correct
        is_correct = student_answer.upper() == correct_answer.upper()
        
        # Create prompt for AI analysis
        prompt = f"""
        Analyze this multiple choice question answer and provide educational feedback:
        
        Question: {question.text}
        
        Options:
        {self._format_options(options)}
        
        Correct Answer: {correct_answer} - {options.get(correct_answer, 'N/A')}
        Student Answer: {student_answer} - {options.get(student_answer, 'N/A')}
        
        The student's answer is {'CORRECT' if is_correct else 'INCORRECT'}.
        
        Please provide feedback in this exact JSON format:
        {{
            "is_correct": {str(is_correct).lower()},
            "correctness_score": {100 if is_correct else 'score_0_to_100'},
            "explanation": "Clear explanation of why the answer is correct/incorrect",
            "improvement_hint": "Specific guidance for understanding the concept better",
            "concept_explanation": "Brief explanation of the key concept being tested",
            "confidence_level": "high/medium/low based on clarity of the question and answer"
        }}
        
        Keep explanations concise but educational. Focus on helping the student understand the concept.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=ai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=500
            )
            
            # Parse JSON response
            feedback_text = response.choices[0].message.content.strip()
            feedback = json.loads(feedback_text)
            
            # Add MCQ-specific metadata
            feedback.update({
                "feedback_type": "mcq",
                "selected_option": student_answer,
                "correct_option": correct_answer,
                "available_options": options
            })
            
            return feedback
            
        except json.JSONDecodeError:
            return self._fallback_mcq_feedback(student_answer, correct_answer, options, is_correct)
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return self._fallback_mcq_feedback(student_answer, correct_answer, options, is_correct)
    
    def _analyze_text_answer(
        self, 
        student_answer: str, 
        question: Question, 
        ai_model: str
    ) -> Dict[str, Any]:
        """Analyze text-based (short/essay) question answer"""
        
        correct_answer = question.correct_answer or "No reference answer provided"
        question_type = "short answer" if question.type == "short" else "essay"
        
        prompt = f"""
        Analyze this {question_type} response and provide educational feedback:
        
        Question: {question.text}
        
        Reference/Expected Answer: {correct_answer}
        
        Student Answer: {student_answer}
        
        Please provide detailed feedback in this exact JSON format:
        {{
            "is_correct": "true/false (true if substantially correct)",
            "correctness_score": "score_from_0_to_100",
            "explanation": "Detailed analysis of the student's response",
            "strengths": ["What the student got right - array of strings"],
            "weaknesses": ["Areas for improvement - array of strings"], 
            "improvement_hint": "Specific guidance for better understanding",
            "concept_explanation": "Brief explanation of key concepts",
            "missing_concepts": ["Important concepts not addressed - array of strings"],
            "confidence_level": "high/medium/low based on answer quality"
        }}
        
        Be constructive and educational. Focus on helping the student learn and improve.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=ai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=800
            )
            
            # Parse JSON response
            feedback_text = response.choices[0].message.content.strip()
            feedback = json.loads(feedback_text)
            
            # Add text-specific metadata
            feedback.update({
                "feedback_type": question.type,
                "answer_length": len(student_answer),
                "reference_answer": correct_answer
            })
            
            return feedback
            
        except json.JSONDecodeError:
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
        return {
            "is_correct": is_correct,
            "correctness_score": 100 if is_correct else 0,
            "feedback_type": "mcq",
            "explanation": f"Your answer is {'correct' if is_correct else 'incorrect'}. The correct answer is {correct_answer}.",
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
