"""
Text chunking utilities for splitting documents into manageable pieces
"""
from typing import List, Dict, Any


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200
) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks

    Args:
        text: Full text to chunk
        chunk_size: Target size in characters (~250 tokens for OpenAI)
        overlap: Overlap between chunks to maintain context

    Returns:
        List of dicts with:
        {
            'text': str,           # Chunk text
            'index': int,          # Chunk order (0-based)
            'start': int,          # Start position in original text
            'end': int,            # End position in original text
            'chunk_metadata': dict # Additional context
        }
    """
    if not text or not text.strip():
        return []

    chunks = []
    start = 0
    index = 0

    while start < len(text):
        # Calculate end position
        end = start + chunk_size

        # Don't go beyond text length
        if end > len(text):
            end = len(text)

        # Extract chunk
        chunk_text = text[start:end].strip()

        # Skip empty chunks
        if chunk_text:
            chunks.append({
                'text': chunk_text,
                'index': index,
                'start': start,
                'end': end,
                'chunk_metadata': {
                    'char_count': len(chunk_text),
                    'overlap_with_prev': overlap if index > 0 else 0
                }
            })
            index += 1

        # Move forward with overlap
        start += (chunk_size - overlap)

    return chunks


def chunk_text_by_sentences(
    text: str,
    max_chunk_size: int = 1000,
    overlap_sentences: int = 2
) -> List[Dict[str, Any]]:
    """
    Split text by sentences to maintain semantic boundaries
    (More advanced chunking - better for RAG)

    Args:
        text: Full text to chunk
        max_chunk_size: Maximum chunk size in characters
        overlap_sentences: Number of sentences to overlap

    Returns:
        List of chunk dicts
    """
    # Simple sentence splitting (can be improved with NLP libraries)
    sentences = text.replace('!', '.').replace('?', '.').split('.')
    sentences = [s.strip() + '.' for s in sentences if s.strip()]

    chunks = []
    current_chunk = []
    current_size = 0
    index = 0

    for i, sentence in enumerate(sentences):
        sentence_len = len(sentence)

        # If adding this sentence exceeds max size and we have content
        if current_size + sentence_len > max_chunk_size and current_chunk:
            # Save current chunk
            chunk_text = ' '.join(current_chunk)
            chunks.append({
                'text': chunk_text,
                'index': index,
                'start': -1,  # Would need to calculate
                'end': -1,
                'chunk_metadata': {
                    'char_count': len(chunk_text),
                    'sentence_count': len(current_chunk),
                    'chunking_method': 'sentence-based'
                }
            })
            index += 1

            # Keep last N sentences for overlap
            current_chunk = current_chunk[-overlap_sentences:] if overlap_sentences > 0 else []
            current_size = sum(len(s) for s in current_chunk)

        # Add sentence to current chunk
        current_chunk.append(sentence)
        current_size += sentence_len

    # Don't forget the last chunk
    if current_chunk:
        chunk_text = ' '.join(current_chunk)
        chunks.append({
            'text': chunk_text,
            'index': index,
            'start': -1,
            'end': -1,
            'chunk_metadata': {
                'char_count': len(chunk_text),
                'sentence_count': len(current_chunk),
                'chunking_method': 'sentence-based'
            }
        })

    return chunks
