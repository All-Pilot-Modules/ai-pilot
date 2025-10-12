import os
import tempfile
from typing import List, Optional
from supabase import create_client, Client
from app.core.config import SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_STORAGE_BUCKET


class SupabaseStorageService:
    """Service for handling file operations with Supabase Storage"""

    def __init__(self):
        print(f"Initializing Supabase storage service...")
        print(f"SUPABASE_URL: {SUPABASE_URL[:30]}..." if SUPABASE_URL else "SUPABASE_URL: None")
        print(f"SUPABASE_SERVICE_KEY: {'SET' if SUPABASE_SERVICE_KEY else 'NOT SET'}")
        print(f"SUPABASE_STORAGE_BUCKET: {SUPABASE_STORAGE_BUCKET}")

        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError("Supabase configuration missing. Check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.")

        try:
            self.client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            self.bucket_name = SUPABASE_STORAGE_BUCKET
            print(f"Supabase client created successfully for bucket: {self.bucket_name}")
        except Exception as e:
            print(f"Failed to create Supabase client: {str(e)}")
            raise

    def upload_file(self, file_bytes: bytes, file_path: str) -> str:
        """
        Upload file to Supabase Storage

        Args:
            file_bytes: File content as bytes
            file_path: Path in bucket (e.g., "teacher123/Module1/document.pdf")

        Returns:
            Public URL of uploaded file
        """
        try:
            print(f"Attempting to upload file: {file_path} to bucket: {self.bucket_name}")
            print(f"File size: {len(file_bytes)} bytes")

            # Try to upload file to Supabase storage
            # If file exists, we'll remove it first and then upload
            try:
                response = self.client.storage.from_(self.bucket_name).upload(
                    path=file_path,
                    file=file_bytes,
                    file_options={"content-type": "application/octet-stream"}
                )
            except Exception as upload_error:
                # If upload fails due to duplicate, try to remove and re-upload
                if "already exists" in str(upload_error) or "Duplicate" in str(upload_error):
                    print(f"File exists, removing and re-uploading...")
                    try:
                        # Remove existing file
                        self.client.storage.from_(self.bucket_name).remove([file_path])
                        # Try upload again
                        response = self.client.storage.from_(self.bucket_name).upload(
                            path=file_path,
                            file=file_bytes,
                            file_options={"content-type": "application/octet-stream"}
                        )
                    except Exception as retry_error:
                        raise Exception(f"Failed to replace existing file: {str(retry_error)}")
                else:
                    raise upload_error

            print(f"Upload response: {response}")
            print(f"Response type: {type(response)}")

            # Check if upload was successful
            # Supabase upload() returns different response formats
            if hasattr(response, 'error') and response.error:
                print(f"Upload error: {response.error}")
                raise Exception(f"Upload failed: {response.error}")
            elif isinstance(response, dict) and 'error' in response:
                print(f"Upload error (dict): {response['error']}")
                raise Exception(f"Upload failed: {response['error']}")

            # Get public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(file_path)
            print(f"Public URL generated: {public_url}")
            return public_url

        except Exception as e:
            print(f"Exception during upload: {str(e)}")
            raise Exception(f"Failed to upload file to Supabase: {str(e)}")

    def download_file(self, file_path: str) -> bytes:
        """
        Download file from Supabase Storage

        Args:
            file_path: Path in bucket

        Returns:
            File content as bytes
        """
        try:
            response = self.client.storage.from_(self.bucket_name).download(file_path)

            if isinstance(response, bytes):
                return response
            else:
                raise Exception("Failed to download file - invalid response")

        except Exception as e:
            raise Exception(f"Failed to download file from Supabase: {str(e)}")

    def download_file_temporarily(self, file_path: str) -> str:
        """
        Download file to a temporary location for processing

        Args:
            file_path: Path in bucket

        Returns:
            Path to temporary file (caller must delete it)
        """
        try:
            file_bytes = self.download_file(file_path)

            # Create temporary file
            suffix = os.path.splitext(file_path)[1] or '.tmp'
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)

            with temp_file as f:
                f.write(file_bytes)

            return temp_file.name

        except Exception as e:
            raise Exception(f"Failed to create temporary file: {str(e)}")

    def list_files(self, folder_path: str = "") -> List[dict]:
        """
        List files in a folder

        Args:
            folder_path: Folder path in bucket (e.g., "teacher123/Module1/")

        Returns:
            List of file metadata dictionaries
        """
        try:
            response = self.client.storage.from_(self.bucket_name).list(folder_path)

            if response.error:
                raise Exception(f"List files failed: {response.error}")

            return response.data or []

        except Exception as e:
            raise Exception(f"Failed to list files: {str(e)}")

    def file_exists(self, file_path: str) -> bool:
        """
        Check if file exists in storage

        Args:
            file_path: Path in bucket

        Returns:
            True if file exists, False otherwise
        """
        try:
            # Try to get file info
            folder_path = os.path.dirname(file_path)
            file_name = os.path.basename(file_path)

            files = self.list_files(folder_path)
            return any(f.get('name') == file_name for f in files)

        except Exception:
            return False

    def delete_file(self, file_path: str) -> bool:
        """
        Delete file from storage

        Args:
            file_path: Path in bucket

        Returns:
            True if deleted successfully
        """
        try:
            response = self.client.storage.from_(self.bucket_name).remove([file_path])

            if response.error:
                raise Exception(f"Delete failed: {response.error}")

            return True

        except Exception as e:
            print(f"Failed to delete file: {str(e)}")
            return False

    def check_duplicate_by_hash(self, folder_path: str, file_hash: str) -> bool:
        """
        Check if a file with similar hash already exists in folder

        Args:
            folder_path: Folder to check in
            file_hash: File hash to look for (first 8 characters)

        Returns:
            True if duplicate found
        """
        try:
            files = self.list_files(folder_path)
            hash_prefix = file_hash[:8]

            # Check if any filename contains the hash prefix
            return any(hash_prefix in f.get('name', '') for f in files)

        except Exception:
            return False

    def get_public_url(self, file_path: str) -> str:
        """
        Get public URL for a file

        Args:
            file_path: Path in bucket

        Returns:
            Public URL
        """
        return self.client.storage.from_(self.bucket_name).get_public_url(file_path)


# Global instance
storage_service = SupabaseStorageService()