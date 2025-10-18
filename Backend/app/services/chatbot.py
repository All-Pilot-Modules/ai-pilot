"""
AI Tutor Chatbot Service
Provides context-aware responses using RAG (Retrieval-Augmented Generation)
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import openai
import os

from app.models.module import Module
from app.models.chat_message import ChatMessage
from app.services.rag_retriever import get_context_for_feedback


def get_chatbot_response(
    db: Session,
    module_id: str,
    student_question: str,
    conversation_history: List[ChatMessage],
    student_id: str
) -> Dict[str, Any]:
    """
    Generate AI tutor response using RAG and conversation history

    Args:
        db: Database session
        module_id: Module ID for context retrieval
        student_question: Student's question
        conversation_history: Previous messages in conversation
        student_id: Student ID

    Returns:
        {
            'response': str,  # AI response
            'context_used': dict  # RAG context metadata
        }
    """
    # Get module info
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise ValueError(f"Module {module_id} not found")

    module_name = module.name
    chatbot_config = module.assignment_config.get("features", {}).get("chatbot_feedback", {})
    ai_model = chatbot_config.get("ai_model", "gpt-4")
    chatbot_enabled = chatbot_config.get("enabled", True)

    if not chatbot_enabled:
        return {
            'response': "The chatbot feature is currently disabled for this module. Please contact your instructor.",
            'context_used': None
        }

    # Get RAG context
    rag_context = get_context_for_feedback(
        db=db,
        question_text=student_question,
        student_answer="",  # For chatbot, we just use the question
        module_id=module_id,
        max_chunks=5,  # Get more context for chat
        similarity_threshold=0.4,
        include_document_locations=True
    )

    # Build conversation history for context
    history_messages = []
    for msg in conversation_history[-10:]:  # Last 10 messages for context
        history_messages.append({
            "role": "user" if msg.role == "student" else "assistant",
            "content": msg.content
        })

    # Build system prompt
    system_prompt = f"""You are a helpful AI tutor for the course module: "{module_name}".

Your role is to:
- Help students understand course concepts
- Answer questions based on the course materials
- Provide clear explanations and examples
- Be encouraging and supportive
- Guide students to learn, don't just give direct answers

Guidelines:
- Use the course materials provided to answer questions accurately
- If information isn't in the course materials, say so clearly
- Be concise but thorough
- Use markdown formatting for better readability
- Reference specific pages/slides when relevant"""

    if rag_context['has_context']:
        system_prompt += f"\n\n{rag_context['formatted_context']}"

    # Prepare messages for OpenAI
    messages = [
        {"role": "system", "content": system_prompt},
        *history_messages,
        {"role": "user", "content": student_question}
    ]

    # Call OpenAI API
    try:
        openai.api_key = os.getenv("OPENAI_API_KEY")

        response = openai.chat.completions.create(
            model=ai_model,
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        ai_response = response.choices[0].message.content

        # Prepare context metadata
        context_metadata = None
        if rag_context['has_context']:
            context_metadata = {
                'sources': rag_context['sources'],
                'chunk_count': len(rag_context['chunks']),
                'chunks': [
                    {
                        'text_preview': chunk['text'][:100] + "..." if len(chunk['text']) > 100 else chunk['text'],
                        'similarity': chunk['similarity'],
                        'document_title': chunk.get('document_title', 'Unknown')
                    }
                    for chunk in rag_context['chunks']
                ]
            }

        return {
            'response': ai_response,
            'context_used': context_metadata
        }

    except Exception as e:
        print(f"❌ Chatbot error: {str(e)}")
        return {
            'response': "I'm sorry, I encountered an error while processing your question. Please try again or contact your instructor if the problem persists.",
            'context_used': None
        }


def validate_message_content(content: str) -> bool:
    """Validate message content"""
    if not content or not content.strip():
        return False

    if len(content) > 5000:  # Max message length
        return False

    return True
