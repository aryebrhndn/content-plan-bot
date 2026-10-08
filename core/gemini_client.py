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
        "description": "Edukasi haji & umrah ('Teman Jalan', naskah hook-poin-CTA, hadits & caption IG)",
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
        "description": "EdTech & Deep Dive Tech (Ala Vox Paper-Cutout, framework H-C-B-C)",
        "theme_colors": {
            "top_box": "#001A4D",      # Deep Newsprint Ink
            "bot_box": "#E63946",      # Stamp Red
            "mid_box": "#F4EBD9",      # Cream Kraft Paper
            "text_top": "#FFE600",      # Aksen Stabilo Kuning
            "text_mid": "#1A1A1A",
            "text_bot": "#FFFFFF"
        }
    },
    "remotion": {
        "name": "Remotion Motion Graphics",
        "guide_file": "remotion/TechVectorReels.tsx",
        "description": "Motion Graphics & 3D Vector Hardware (Footage B-Roll bersih / Infografis, 16:9 Lanskap, 1:1, 9:16)",
        "theme_colors": {
            "top_box": "#0A0F1D",
            "bot_box": "#00F0FF",
            "mid_box": "#0F172A",
            "text_top": "#00F0FF",
            "text_mid": "#FFFFFF",
            "text_bot": "#000000"
        }
    },
    "veo": {
        "name": "Google Veo 3.1 AI Video",
        "guide_file": "Google Veo 3.1 Fast Preview",
        "description": "Generative Cinematic AI Video (Video MP4 fotorealistis / 3D render dari prompt teks)",
        "theme_colors": {
            "top_box": "#1E1B4B",
            "bot_box": "#7C3AED",
            "mid_box": "#0F172A",
            "text_top": "#C084FC",
            "text_mid": "#FFFFFF",
            "text_bot": "#FFFFFF"
        }
    }
}
# Aliases
PERSONAS["haji"] = PERSONAS["hajidarimuda"]
PERSONAS["personal"] = PERSONAS["arye"]
PERSONAS["vector"] = PERSONAS["remotion"]
PERSONAS["tech"] = PERSONAS["remotion"]


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
    Fleksibel: Topik teknologi/hardware otomatis dialihkan ke persona Arye/Tech.
    """
    lower_prompt = topic_prompt.lower()
    is_tech = any(k in lower_prompt for k in [
        "ram", "cpu", "gpu", "3d", "vektor", "vector", "hardware", "laptop", "pc",
        "tech", "teknologi", "coding", "software", "ai", "cloud", "server", "chip"
    ])
    is_haji = any(k in lower_prompt for k in ["haji", "umrah", "tawaf", "mina", "mekkah", "makkah", "madinah", "ka'bah"])

    if is_tech and not is_haji:
        persona_key = "arye"

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


def generate_script_data(topic_prompt: str, persona_key: str = "auto") -> dict:
    """
    Menghasilkan naskah konten JSON terstruktur untuk dirender ke video Remotion/Reels.
    Fleksibel dan adaptif terhadap request pengguna (durasi, topik tech/3D/haji/umum).
    """
    import re

    lower_prompt = topic_prompt.lower()
    
    # Deteksi durasi dari request pengguna (misal: "8 detik", "15 detik")
    duration_match = re.search(r'(\d+)\s*(?:detik|sec|second)', lower_prompt)
    target_duration = int(duration_match.group(1)) if duration_match else 12
    # Batasi durasi wajar antara 5 s.d. 60 detik
    target_duration = max(5, min(60, target_duration))

    # Deteksi apakah permintaan adalah B-Roll / Clean Footage (tanpa teks / infografis)
    is_clean_footage = any(k in lower_prompt for k in [
        "footage", "b-roll", "broll", "tanpa teks", "no text", "clean",
        "animasi saja", "vektor saja", "gambar saja", "hanya animasi",
        "microstock", "video stock", "background", "loop"
    ]) and not any(k in lower_prompt for k in ["reels", "tips", "edukasi", "penjelasan", "hadits"])

    if is_clean_footage:
        return {
            "hook_header": "",
            "points": [],
            "cta_footer": "",
            "brand_badge": "⚡ 3D HARDWARE • CLEAN FOOTAGE",
            "duration_sec": target_duration,
            "is_clean_footage": True,
            "persona_used": "tech_vector",
            "caption": (
                f"🎬 *Footage Animasi Remotion Siap!*\n"
                f"⏱️ Durasi: *{target_duration} Detik* (30 FPS)\n"
                f"🎨 Tipe: *3D Hardware RAM & CPU Vector Animation*\n"
                f"💡 _Visual murni tanpa kartu teks / watermark, siap digunakan untuk B-roll & Microstock._"
            )
        }

    # Deteksi apakah topik adalah tentang Tech/Hardware/3D/General vs Haji
    is_haji_related = any(k in lower_prompt for k in [
        "haji", "umrah", "tawaf", "mina", "mekkah", "makkah", "madinah", "ka'bah", "arafah", "sa'i", "manasik", "kemenag"
    ])
    is_tech_or_custom = any(k in lower_prompt for k in [
        "ram", "cpu", "gpu", "3d", "vektor", "vector", "hardware", "laptop", "pc",
        "tech", "teknologi", "coding", "software", "ai", "cloud", "server", "grafis", "animasi", "chip"
    ]) and not is_haji_related

    if is_tech_or_custom:
        persona_key = "tech_vector"
        guide_content = load_style_guide("arye")
        default_badge = "⚡ 3D TECH • HARDWARE VECTOR"
    elif is_haji_related:
        persona_key = "hajidarimuda"
        guide_content = load_style_guide("hajidarimuda")
        default_badge = "🕋 HAJI DARI MUDA • EDUKASI"
    elif persona_key == "arye":
        persona_key = "arye"
        guide_content = load_style_guide("arye")
        default_badge = "🎙️ ARYE BURHANUDIN • DEEP DIVE"
    elif persona_key == "hajidarimuda":
        persona_key = "hajidarimuda"
        guide_content = load_style_guide("hajidarimuda")
        default_badge = "🕋 HAJI DARI MUDA • EDUKASI"
    else:
        persona_key = "tech_vector"
        guide_content = load_style_guide("arye")
        default_badge = "💡 INSIGHT & EDUKASI KREATIF"

    persona = PERSONAS.get(persona_key, PERSONAS["hajidarimuda"])

    system_instruction = f"""Kamu adalah Video Creative Director dan Scriptwriter handal.
Kamu bertugas merancang naskah dan aset visual video berdurasi {target_duration} detik sesuai permintaan pengguna:
Topik: "{topic_prompt}"

PANDUAN FLEKSIBEL:
1. Jika topik berkaitan dengan Hardware / Tech / 3D Vector / Komputer / Umum:
   - Jangan paksakan konten islami/haji jika tidak diminta!
   - Buat judul dan poin-poin yang tajam seputar teknologi, visual 3D, atau edukasi hardware.
   - brand_badge: Berikan label kategori yang keren dan relevan (contoh: "⚡ 3D TECH • HARDWARE VECTOR" atau "💻 SYSTEM ARCHITECTURE").
2. Jika topik berkaitan dengan Haji Dari Muda:
   - Panggilan: "Teman Jalan", data riil, edukasi fiqih/manasik praktis.
   - brand_badge: "🕋 HAJI DARI MUDA • EDUKASI".
3. Struktur Visual Teks Layar:
   - hook_header: 1-2 baris huruf kapital tebal memicu penasaran (Kotak Judul)
   - points: 3-5 poin ringkas penting yang padat (Kotak Poin)
   - cta_footer: Ajakan aksi singkat yang relevan (Kotak Bawah)
   - brand_badge: Label kategori atas
   - duration_sec: {target_duration}
   - caption: Naskah caption lengkap siap salin ke Instagram/TikTok/YouTube.

Keluarkan respon HANYA dalam format JSON valid tanpa format markdown ```json ... ```.
Format:
{{
  "brand_badge": "...",
  "hook_header": "...",
  "points": ["...", "..."],
  "cta_footer": "...",
  "duration_sec": {target_duration},
  "caption": "..."
}}"""

    try:
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {"parts": [{"text": f"Rancang naskah video berdurasi {target_duration} detik untuk topik ini: {topic_prompt}"}]}
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
        data["duration_sec"] = data.get("duration_sec", target_duration)
        if not data.get("brand_badge"):
            data["brand_badge"] = default_badge
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
    lower_prompt = topic_prompt.lower()
    is_tech = any(k in lower_prompt for k in [
        "ram", "cpu", "gpu", "3d", "vektor", "vector", "hardware", "laptop", "pc",
        "tech", "teknologi", "coding", "software", "ai", "cloud", "server", "chip"
    ])
    is_haji = any(k in lower_prompt for k in ["haji", "umrah", "tawaf", "mina", "mekkah", "makkah", "madinah", "ka'bah"])

    if is_tech and not is_haji:
        persona_key = "arye"

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
