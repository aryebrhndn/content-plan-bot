import os
import tempfile
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "supersecrettoken")

allowed_ids_raw = os.getenv("ALLOWED_USER_IDS", "")
ALLOWED_USER_IDS = [
    int(uid.strip())
    for uid in allowed_ids_raw.split(",")
    if uid.strip().isdigit()
]

# Hugging Face Spaces otomatis menyediakan environment variable SPACE_HOST
SPACE_HOST = os.getenv("SPACE_HOST", "")

# Direktori penyimpanan file sementara yang aman di Windows maupun Linux/Docker
TEMP_DIR = os.getenv("TEMP_DIR", tempfile.gettempdir())
os.makedirs(TEMP_DIR, exist_ok=True)
