"""
Script to retry embedding generation for documents that have chunks but no embeddings
Run this after adding OpenAI credits or with a new API key
"""
from app.database import SessionLocal
from app.models.document import Document, ProcessingStatus
from app.models.document_chunk import DocumentChunk
from app.models.document_embedding import DocumentEmbedding
from app.services.embedding import generate_embeddings_for_document
from app.services.document_status import update_document_status


def retry_embeddings_for_all_documents():
    """Find documents with chunks but no embeddings and retry"""
    db = SessionLocal()

    try:
        # Find documents that have chunks but no embeddings
        documents = db.query(Document).filter(
            Document.processing_status.in_([ProcessingStatus.CHUNKED, ProcessingStatus.EMBEDDED])
        ).all()

        print(f"📋 Found {len(documents)} documents to check\n")

        for doc in documents:
            chunk_count = db.query(DocumentChunk).filter(
                DocumentChunk.document_id == doc.id
            ).count()

            embedding_count = db.query(DocumentEmbedding).filter(
                DocumentEmbedding.document_id == doc.id
            ).count()

            print(f"📄 {doc.title}")
            print(f"   ID: {doc.id}")
            print(f"   Chunks: {chunk_count}, Embeddings: {embedding_count}")

            if chunk_count > 0 and embedding_count == 0:
                print(f"   🤖 Generating embeddings...")

                try:
                    # Update status to embedding
                    update_document_status(db, str(doc.id), ProcessingStatus.EMBEDDING)

                    # Generate embeddings
                    new_embeddings = generate_embeddings_for_document(
                        db=db,
                        document_id=str(doc.id),
                        batch_size=100
                    )

                    if new_embeddings > 0:
                        # Update status to embedded
                        update_document_status(
                            db,
                            str(doc.id),
                            ProcessingStatus.EMBEDDED,
                            {
                                'embedding_count': new_embeddings,
                                'embedding_model': 'text-embedding-ada-002'
                            }
                        )
                        print(f"   ✅ Created {new_embeddings} embeddings\n")
                    else:
                        print(f"   ⚠️ No embeddings created (check API quota)\n")

                except Exception as e:
                    print(f"   ❌ Error: {str(e)}\n")
                    # Update status back to chunked with error
                    update_document_status(
                        db,
                        str(doc.id),
                        ProcessingStatus.CHUNKED,
                        {'embedding_error': str(e)}
                    )
            else:
                print(f"   ✅ Already has embeddings or no chunks\n")

        print("🎉 Done!")

    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Starting embedding retry script...\n")
    retry_embeddings_for_all_documents()
