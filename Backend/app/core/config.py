# this handles 
# 1 cors settings
# 2 Environement Variables
# 3 Logging Rate limiting
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# === Environment Variables ===
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-ada-002")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
INDEX_DIR = os.getenv("INDEX_DIR", "index_store")
PARSED_DOC_DIR = os.getenv("PARSED_DOC_DIR", "parsed_docs")
DATABASE_URL = os.getenv("DATABASE_URL")
ENV = os.getenv("ENV", "development")
JWT_SECRET = os.getenv("JWT_SECRET")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

# Optional print to confirm it's loaded (for debug)
print("ENV loaded:", ENV)
print("OpenAI Key loaded:", OPENAI_API_KEY[:5], "...")

# === CORS Setup ===
def add_cors(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Use domain in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
# making env nicer