"""
RAG (Retrieval-Augmented Generation) retrieval service
Fetches relevant course material context for AI feedback generation
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.document import Document
from app.services.embedding import search_similar_chunks


def get_context_for_feedback(
    db: Session,
    question_text: str,
    student_answer: str,
    module_id: str,
    max_chunks: int = 3,
    similarity_threshold: float = 0.7
) -> Dict[str, Any]:
    """
    Retrieve relevant course material context for feedback generation

    Args:
        db: Database session
        question_text: The question being answered
        student_answer: The student's response
        module_id: Module ID to search within
        max_chunks: Maximum number of context chunks to retrieve
        similarity_threshold: Minimum similarity score (0-1)

    Returns:
        {
            'has_context': bool,
            'chunks': List[Dict],  # Retrieved chunks with text and metadata
            'formatted_context': str,  # Pre-formatted for prompt injection
            'sources': List[str]  # Document sources for citations
        }
    """
    # Combine question and answer for better context matching
    query = f"Question: {question_text}\nAnswer: {student_answer}"

    # Get all embedded documents from the module
    documents = db.query(Document).filter(
        Document.module_id == module_id,
        Document.processing_status == "embedded",
        Document.is_testbank == False  # Don't use testbank docs for context
    ).all()

    if not documents:
        return {
            'has_context': False,
            'chunks': [],
            'formatted_context': '',
            'sources': []
        }

    # Search across all module documents
    all_results = []
    for doc in documents:
        try:
            results = search_similar_chunks(
                db=db,
                query_text=query,
                document_id=str(doc.id),
                limit=max_chunks
            )
            # Add document info to each result
            for result in results:
                result['document_title'] = doc.title
                result['document_id'] = str(doc.id)
            all_results.extend(results)
        except Exception as e:
            print(f"Error searching document {doc.id}: {str(e)}")
            continue

    # Filter by similarity threshold
    filtered_results = [
        r for r in all_results
        if r['similarity'] >= similarity_threshold
    ]

    # Sort by similarity and get top N
    filtered_results.sort(key=lambda x: x['similarity'], reverse=True)
    top_results = filtered_results[:max_chunks]

    if not top_results:
        return {
            'has_context': False,
            'chunks': [],
            'formatted_context': '',
            'sources': []
        }

    # Format context for prompt
    formatted_context = format_context_for_prompt(top_results)

    # Extract unique sources
    sources = list(set([
        chunk['document_title']
        for chunk in top_results
    ]))

    return {
        'has_context': True,
        'chunks': top_results,
        'formatted_context': formatted_context,
        'sources': sources
    }


def format_context_for_prompt(chunks: List[Dict[str, Any]]) -> str:
    """
    Format retrieved chunks into a structured context for the AI prompt

    Args:
        chunks: List of chunk dicts with 'text', 'similarity', 'document_title'

    Returns:
        Formatted string for prompt injection
    """
    if not chunks:
        return ""

    context_parts = ["\n=== RELEVANT COURSE MATERIAL ===\n"]
    context_parts.append("Use the following course material to provide context-aware feedback:\n")

    for i, chunk in enumerate(chunks, 1):
        similarity_pct = int(chunk['similarity'] * 100)
        context_parts.append(f"\n[Source {i}] From: {chunk['document_title']} (Relevance: {similarity_pct}%)")
        context_parts.append(f"{chunk['text']}\n")

    context_parts.append("\n=== END OF COURSE MATERIAL ===\n")
    context_parts.append("\nWhen providing feedback:")
    context_parts.append("- Reference specific concepts from the course material above")
    context_parts.append("- If the student's answer aligns with or contradicts the material, mention it")
    context_parts.append("- Cite sources when appropriate (e.g., 'As mentioned in [Source 1]...')\n")

    return "\n".join(context_parts)


def get_context_summary(context: Dict[str, Any]) -> str:
    """
    Generate a brief summary of retrieved context for feedback metadata

    Args:
        context: Context dict from get_context_for_feedback()

    Returns:
        Human-readable summary string
    """
    if not context['has_context']:
        return "No course material context available"

    chunk_count = len(context['chunks'])
    sources = ", ".join(context['sources'])
    avg_similarity = sum(c['similarity'] for c in context['chunks']) / chunk_count
    avg_similarity_pct = int(avg_similarity * 100)

    return f"Retrieved {chunk_count} relevant chunks from: {sources} (avg relevance: {avg_similarity_pct}%)"


def should_use_rag_for_question(
    question_type: str,
    rag_settings: Dict[str, Any]
) -> bool:
    """
    Determine if RAG should be used for this question type

    Args:
        question_type: Type of question (mcq, short, essay)
        rag_settings: RAG configuration from module rubric

    Returns:
        True if RAG should be used
    """
    if not rag_settings.get('enabled', True):
        return False

    # RAG is most useful for text-based questions
    # For MCQ, it depends on whether we want concept explanations
    if question_type == 'mcq':
        # Use RAG for MCQ if we want detailed concept explanations
        return True

    # Always use RAG for short answer and essay questions
    return True
