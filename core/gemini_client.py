import os
import json
import logging
import subprocess
import requests
from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# Daftar model dengan auto-fallback
GEMINI_MODELS = [
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash"
]

# Konfigurasi Personas / Brand Utama
PERSONAS = {
    "hajidarimuda": {
        "name": "Haji Dari Muda",
        "guide_file": "hajidarimuda_style_guide.md",
        "description": "Edukasi haji & umrah untuk anak muda ('Teman Jalan', zero hard-selling, data riil)",
        "theme_colors": {
            "top_box": "#DC2626",      # Merah Brand
            "bot_box": "#DC2626",      # Merah Brand
            "mid_box": "#FFFFFF",      # Putih Bersih
            "text_top": "#FFFFFF",
            "text_mid": "#1E293B",
            "text_bot": "#FFFFFF"
        }
    },
    "arye": {
        "name": "Arye Burhanudin",
        "guide_file": "arye-burhanudin.md",
        "description": "EdTech, UI/UX, Investigasi & Bedah Kasus (Ala Vox, Paper-Cutout, H-C-B-C)",
        "theme_colors": {
            "top_box": "#001A4D",      # Deep Newsprint Ink
            "bot_box": "#E63946",      # Stamp Red
            "mid_box": "#F4EBD9",      # Cream Kraft Paper
            "text_top": "#FFE600",      # Aksen Stabilo Kuning
            "text_mid": "#1A1A1A",
            "text_bot": "#FFFFFF"
        }
    }
}
# Alias personal -> arye
PERSONAS["personal"] = PERSONAS["arye"]


def load_style_guide(persona_key: str) -> str:
    """Membaca isi file markdown style guide sebagai acuan baku sistem AI."""
    persona = PERSONAS.get(persona_key, PERSONAS["hajidarimuda"])
    file_name = persona.get("guide_file", "hajidarimuda_style_guide.md")
    
    file_path = os.path.join(os.getcwd(), file_name)
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.warning(f"Gagal membaca file {file_name}: {e}")
            
    return ""


def get_available_personas():
    """Mengembalikan daftar persona unik yang didukung."""
    return {
        "hajidarimuda": PERSONAS["hajidarimuda"]["name"],
        "arye": PERSONAS["arye"]["name"]
    }


def call_gemini_api(payload: dict) -> dict:
    """Mengirim request ke Gemini API dengan auto-fallback model dan penanganan multiplatform."""
    json_input = json.dumps(payload)

    for model_name in GEMINI_MODELS:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
        
        # Windows: gunakan curl.exe via stdin untuk bypass SSL filtering Windows
        if os.name == "nt":
            try:
                cmd = ["curl.exe", "-s", "-X", "POST", endpoint, "-H", "Content-Type: application/json", "--data-binary", "@-"]
                res = subprocess.run(cmd, input=json_input, capture_output=True, text=True, encoding="utf-8", timeout=25)
                if res.returncode == 0 and res.stdout.strip():
                    data = json.loads(res.stdout)
                    if "candidates" in data:
                        return data
                    logger.warning(f"Model {model_name} error: {data.get('error', {}).get('message')}. Mencoba model cadangan...")
            except Exception as e:
                logger.warning(f"curl.exe gagal pada {model_name}: {e}")

        # Fallback / Linux & Docker Hugging Face
        try:
            res = requests.post(endpoint, json=payload, timeout=25.0)
            data = res.json()
            if "candidates" in data:
                return data
            logger.warning(f"Model {model_name} HTTP status {res.status_code}. Mencoba model cadangan...")
        except Exception as e:
            logger.warning(f"requests gagal pada {model_name}: {e}")

    raise RuntimeError("Semua model Gemini sedang sibuk atau tidak merespons.")


def generate_content_ideas(topic_prompt: str, persona_key: str = "hajidarimuda") -> str:
    """
    Menghasilkan 4 ide konten kreatif & sudut pandang (angles)
    berdasarkan panduan baku dokumen style guide masing-masing brand.
    """
    guide_content = load_style_guide(persona_key)
    persona = PERSONAS.get(persona_key, PERSONAS["hajidarimuda"])

    prompt = f"""Kamu adalah Content Strategist profesional untuk brand: "{persona['name']}".
Berikut adalah DOKUMEN PANDUAN RESMI (STYLE GUIDE & CREATIVE ENGINE):
\"\"\"
{guide_content}
\"\"\"

User ingin mencari ide konten tentang: "{topic_prompt}".

TUGAS:
Hasilkan 4 ide konten video pendek yang tajam, bernilai tinggi, dan 100% mematuhi aturan style guide di atas.
Untuk setiap ide, cantumkan:
1. 💡 Judul & Angle (Sudut Pandang Unik)
2. 🎯 Hook Pembuka (Mematahkan asumsi / angka konkret / pertanyaan kontradiktif)
3. 📌 Inti Pembahasan (3 poin spesifik berbasis data/fakta riil)
4. 🎬 Rekomendasi Format (Video Caption Simple atau Talking Head)

Gunakan tone of voice resmi brand tersebut dan format teks yang rapi dan nyaman dibaca di Telegram."""

    try:
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        res_data = call_gemini_api(payload)
        return res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        logger.error(f"Error saat brainstorming ide: {e}", exc_info=True)
        return f"Gagal mendapatkan ide dari AI: {str(e)}"


def generate_script_data(topic_prompt: str, persona_key: str = "hajidarimuda") -> dict:
    """
    Menghasilkan naskah konten JSON terstruktur untuk dirender ke video reels vertikal 9:16
    sesuai dokumen acuan baku masing-masing brand.
    """
    guide_content = load_style_guide(persona_key)
    persona = PERSONAS.get(persona_key, PERSONAS["hajidarimuda"])

    system_instruction = f"""Kamu adalah Content Strategist dan Scriptwriter profesional untuk brand: "{persona['name']}".
Gunakan dokumen panduan resmi berikut sebagai acuan mutlak:
\"\"\"
{guide_content}
\"\"\"

ATURAN STRUKTUR OUTPUT UNTUK VIDEO REELS (VIDEO CAPTION FORMAT):
1. Jika brand adalah "Haji Dari Muda":
   - Panggilan wajib: "Teman Jalan"
   - Tone: Sahabat literasi ibadah, edukatif, data riil (antrean/jarak fisik/biaya), zero hard-selling.
   - Doa/hadits di caption WAJIB mencantumkan lafaz Arab, teks Latin, arti terjemahan, dan perawi hadits.
   - Hashtag resmi: #hajidarimuda #edukasihaji #haji #umrah
2. Jika brand adalah "Arye Burhanudin":
   - Tone: Santai, logis, analitis, edukatif, bedah fenomena ala Vox / dokumenter digital ("Yuk kita teliti bareng").
   - Pilar: EdTech / Digital Breakdown / Investigasi & Tabayun / UI/UX Creative Process.
   - Framework H-C-B-C.
   - Caption mengulas konteks, rujukan primer, dan solusi logis.
3. Struktur Visual Teks Layar:
   - hook_header: 1-2 baris huruf kapital tebal yang memicu penasaran (Kotak Atas)
   - points: List 4 atau 5 poin ringkas penting (Kotak Tengah)
   - cta_footer: Ajakan aksi yang variatif dan relevan (Kotak Bawah)
4. Caption: Artikel mikro lengkap siap posting di Instagram/TikTok.

Keluarkan respon HANYA dalam format JSON valid tanpa format markdown ```json ... ```.
Format:
{{
  "hook_header": "...",
  "points": ["...", "..."],
  "cta_footer": "...",
  "caption": "..."
}}"""

    try:
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {"parts": [{"text": f"Buatkan naskah video caption reels lengkap untuk topik berikut: {topic_prompt}"}]}
            ],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        res_data = call_gemini_api(payload)
        text_content = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()

        if text_content.startswith("```json"):
            text_content = text_content[7:]
        if text_content.startswith("```"):
            text_content = text_content[3:]
        if text_content.endswith("```"):
            text_content = text_content[:-3]
        text_content = text_content.strip()

        data = json.loads(text_content)
        data["persona_used"] = persona_key
        return data

    except Exception as e:
        logger.error(f"Gagal memanggil Gemini API: {e}", exc_info=True)
        return {
            "hook_header": "POIN PENTING HARI INI!",
            "points": [
                "• Catat dan terapkan poin utama",
                "• Teliti berbasis data & fakta riil",
                "• Evaluasi progres berkala",
                "• Simpan dan bagikan ke temanmu"
            ],
            "cta_footer": "Simpan info penting ini! 📌",
            "caption": f"Topik: {topic_prompt}\n\nSemoga bermanfaat!\n\n#konten #edukasi #insight",
            "persona_used": persona_key
        }


def generate_talking_head_script(topic_prompt: str, persona_key: str = "hajidarimuda") -> str:
    """
    Menghasilkan naskah video Talking Head lengkap (durasi 60-90 detik)
    lengkap dengan shot-list, arahan visual, B-roll motion, dan SFX sesuai panduan dokumen.
    """
    guide_content = load_style_guide(persona_key)
    persona = PERSONAS.get(persona_key, PERSONAS["hajidarimuda"])

    prompt = f"""Kamu adalah Scriptwriter & Creative Director untuk brand: "{persona['name']}".
Gunakan dokumen panduan resmi berikut sebagai acuan mutlak:
\"\"\"
{guide_content}
\"\"\"

User ingin dibuatkan naskah video TALKING HEAD (durasi 60-90 detik) dengan topik: "{topic_prompt}".

PETUNJUK PENYUSUNAN:
1. Jika brand Arye Burhanudin:
   - Terapkan framework H-C-B-C (Hook, Context & Pattern, Breakdown, Clear Resolution & CTA).
   - Terapkan teknik Visual Ping-Pong (A-Roll ➔ Motion B-Roll ➔ A-Roll punch-in).
   - Cantumkan tabel Shot-List rapi: No | Timestamp | Potongan Audio | Deskripsi Visual & Aset Cutout | Audio SFX.
2. Jika brand Haji Dari Muda:
   - Sapaan wajib: "Teman Jalan".
   - Terapkan alur: Hook (0-3s), Problem (3-15s), Core Value (15-45s), Outro & CTA (45-55s).
   - Sertakan teks caption lengkap dengan doa/hadits (Arab-Latin-Terjemahan-Perawi).

Buat naskahnya secara lengkap, mendalam, dan siap produksi!"""

    try:
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }
        res_data = call_gemini_api(payload)
        return res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        logger.error(f"Gagal generate talking head script: {e}", exc_info=True)
        return f"Gagal membuat naskah talking head: {str(e)}"
