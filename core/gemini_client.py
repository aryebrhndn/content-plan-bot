import os
import json
import logging
import subprocess
import requests
from config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# Daftar model resmi aktif dengan respons cepat
GEMINI_MODELS = [
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
        "guide_file": "remotion_style_guide.md",
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
PERSONAS["tech_vector"] = PERSONAS["remotion"]
PERSONAS["hardware"] = PERSONAS["remotion"]
PERSONAS["3d"] = PERSONAS["remotion"]



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


def chat_with_gemini(user_message: str, persona_key: str = "remotion") -> str:
    """
    Menjawab pertanyaan, diskusi, atau konsultasi dari pengguna secara cerdas dan kontekstual.
    Menyesuaikan persona aktif (Arye Burhanudin / Haji Dari Muda / Remotion Stock Animator).
    """
    guide_content = load_style_guide(persona_key)
    
    if persona_key in ["arye", "personal"]:
        system_persona = (
            "Kamu adalah Arye Burhanudin — tech educator, system architect, dan creator konten mendalam. "
            "Gaya bicaramu kritis, analitis, sistematis, berbobot, berbasis data & arsitektur nyata ala Vox/Daviqin. "
            "Bantu user menjawab pertanyaan apa pun seputar teknologi, cloud, sistem, coding, atau diskusi konsep. "
            "Jika mereka bertanya santai atau mempertanyakan sesuatu yang belum diketahui, jelaskan dengan gamblang, analogi cerdas, dan to the point. "
            "PENTING: Jangan kaku! Jangan langsung memaksakan generate video jika user hanya bertanya atau berdiskusi."
        )
    elif persona_key in ["haji", "hajidarimuda"]:
        system_persona = (
            "Kamu adalah konsultan dan kreator brand 'Haji Dari Muda'. "
            "Gaya bicaramu hangat, bersahabat, memanggil 'Teman Jalan', santun, sarat nilai ibadah, fiqih/manasik praktis, dan menyemangati anak muda. "
            "Bantu user menjawab pertanyaan fiqih haji/umrah, persiapan porsi, tips istithaah, atau diskusi ide konten. "
            "Jawab secara cerdas, jelas, dan ramah tanpa langsung memaksakan generate video."
        )
    else:  # Remotion / Microstock
        system_persona = (
            "Kamu adalah Creative Motion Director & Microstock Stock Footage Specialist. "
            "Keahlianmu adalah grafis animasi vektor 3D, Remotion React, motion design, dan monetisasi asset di pasar microstock (Shutterstock, Adobe Stock, Pond5, Envato). "
            "Bantu user berdiskusi tentang ide footage, aspek rasio (16:9 lanskap, 9:16 potret, 1:1), alpha channel (transparan), SEO keywords/tags microstock, atau pertanyaan umum. "
            "Jawab secara profesional, fleksibel, cerdas, dan tidak kaku."
        )

    full_instruction = f"""{system_persona}

Acuan Tambahan:
{guide_content[:1500] if guide_content else ''}

PEDOMAN FORMAT JAWABAN (SANGAT PENTING):
1. Format Percakapan Telegram: Berikan jawaban dalam teks bahasa Indonesia yang ramah, mengalir natural, cerdas, dan tertata rapi.
2. DILARANG KERAS MENGELUARKAN KODE SUMBER MENTAH (seperti React TSX, JSX, HTML, CSS, JavaScript, atau dump JSON data) KECUALI jika pengguna secara terang-terangan dan spesifik meminta contoh kode pemrograman!
3. Jangan pernah membungkus seluruh jawaban dalam blok kode markdown (```). Gunakan teks biasa dengan styling Markdown Telegram standar (*tebal*, _miring_, bullet points `•`).
4. Jika menjelaskan beberapa poin, gunakan bullet points (`•`) ringkas dengan spasi paragraf yang bersih sehingga nyaman dibaca di layar smartphone.
5. Jawab pertanyaan pengguna secara tuntas dan to the point. Jika relevan di penutup, kamu boleh memberi saran singkat terkait opsi video atau audio, tapi utamakan menjawab inti pertanyaannya terlebih dahulu."""

    try:
        payload = {
            "system_instruction": {"parts": [{"text": full_instruction}]},
            "contents": [{"parts": [{"text": user_message}]}]
        }
        res_data = call_gemini_api(payload)
        return res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        logger.error(f"Gagal chat_with_gemini: {e}", exc_info=True)
        return f"Maaf, sedang ada kendala koneksi AI: {e}"


def generate_microstock_metadata(topic: str) -> dict:
    """
    Menghasilkan metadata khusus Microstock (Shutterstock, Adobe Stock, Pond5, Envato):
    - Title bahasa Inggris & Indonesia (Search-friendly)
    - Kategori / Genre
    - 25-30 SEO Keywords / Tags (dipisahkan koma, siap copy-paste)
    - Spesifikasi teknis (Resolution, Alpha Channel, FPS)
    """
    system_instruction = """Kamu adalah Microstock Keywording Specialist dan SEO Video Stock Expert (Shutterstock, Adobe Stock, Pond5, Envato).
Tugas: Dari topik visual yang diberikan, buatkan metadata microstock profesional.
SANGAT PENTING: Untuk microstock, TIDAK PERLU caption sosial media! Yang dibutuhkan adalah tags/keywords SEO untuk memudahkan pembeli mencari video ini.
1. title_en: Judul deskriptif komersial dalam bahasa Inggris (maks 80 karakter).
2. title_id: Terjemahan judul deskriptif bahasa Indonesia.
3. category: Kategori footage (misal: Technology, Business, Science, Abstract).
4. tags: Minimal 25 sampai 30 keyword bahasa Inggris yang sangat relevan dan dicari buyer, dipisahkan koma.
5. technical_notes: Catatan spesifikasi teknis (Alpha Channel / Transparent, ProRes/WebM, 60 FPS, Resolution).

Keluarkan HANYA format JSON valid:
{
  "title_en": "...",
  "title_id": "...",
  "category": "...",
  "tags": ["keyword1", "keyword2", "..."],
  "technical_notes": "..."
}"""

    try:
        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": [{"parts": [{"text": f"Generate microstock metadata untuk footage grafis: {topic}"}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }
        res_data = call_gemini_api(payload)
        text_content = res_data["candidates"][0]["content"]["parts"][0]["text"].strip()
        if text_content.startswith("```json"): text_content = text_content[7:]
        if text_content.startswith("```"): text_content = text_content[3:]
        if text_content.endswith("```"): text_content = text_content[:-3]
        return json.loads(text_content.strip())
    except Exception as e:
        logger.error(f"Gagal generate_microstock_metadata: {e}")
        return {
            "title_en": f"3D Vector Motion Graphics - {topic}",
            "title_id": f"Animasi Vektor Grafis 3D - {topic}",
            "category": "Technology & Science",
            "tags": ["3d animation", "motion graphics", "vector", "technology", "hardware", "computer", "digital", "isolated", "alpha channel", "stock footage", "futuristic", "data", "electronics", "circuit", "rendering"],
            "technical_notes": "60 FPS • 16:9 4K/FHD • ProRes 4444 Alpha Channel / Clean Background"
        }


def generate_script_data(topic_prompt: str, persona_key: str = "auto") -> dict:
    """
    Menghasilkan naskah konten JSON terstruktur untuk dirender ke video Remotion/Reels.
    Fleksibel dan adaptif terhadap request pengguna (durasi, topik tech/3D/haji/umum, dan variasi style).
    """
    import re

    lower_prompt = topic_prompt.lower()
    
    # Deteksi durasi dari request pengguna (misal: "8 detik", "15 detik")
    duration_match = re.search(r'(\d+)\s*(?:detik|sec|second)', lower_prompt)
    target_duration = int(duration_match.group(1)) if duration_match else 12
    target_duration = max(5, min(60, target_duration))

    # Deteksi Mode Microstock / Clean Footage (Mode Remotion atau kata kunci stock)
    is_microstock = (
        persona_key in ["remotion", "vector", "tech_vector"] or
        any(k in lower_prompt for k in [
            "microstock", "stock footage", "shutterstock", "adobe stock", "b-roll", "broll",
            "tanpa caption", "tanpa teks", "no text", "clean footage", "alpha channel", "transparan"
        ])
    ) and not any(k in lower_prompt for k in ["haji", "umrah", "naskah sosmed"])

    if is_microstock:
        stock_meta = generate_microstock_metadata(topic_prompt)
        tags_str = ", ".join(stock_meta.get("tags", []))
        return {
            "hook_header": "",
            "points": [],
            "cta_footer": "",
            "brand_badge": "⚡ 3D HARDWARE • MICROSTOCK ASSET",
            "duration_sec": target_duration,
            "is_clean_footage": True,
            "is_microstock": True,
            "persona_used": "tech_vector",
            "style_variant": "clean_vector",
            "microstock_meta": stock_meta,
            "caption": "",  # TANPA CAPTION UNTUK MICROSTOCK
            "tags": tags_str
        }

    # Deteksi Style Khusus untuk Mode Arye Burhanudin:
    # 1. Style Paper Cut / Daviqin (mengacu template 6-DaviqinVid1)
    # 2. Style Biasa (mengacu 2-BerhalaKaumNuh, 3-SajadahSyirik, 4-MisiKpdAli)
    is_papercut_style = any(k in lower_prompt for k in ["paper cut", "papercut", "daviqin", "paper-cut", "vox", "kliping", "kolase", "stop motion"])
    style_variant = "papercut" if is_papercut_style else "regular"

    # Deteksi apakah topik adalah tentang Tech/Hardware/3D vs Haji
    is_haji_related = any(k in lower_prompt for k in [
        "haji", "umrah", "tawaf", "mina", "mekkah", "makkah", "madinah", "ka'bah", "arafah", "sa'i", "manasik", "kemenag"
    ])
    is_tech_or_custom = any(k in lower_prompt for k in [
        "ram", "cpu", "gpu", "3d", "vektor", "vector", "hardware", "laptop", "pc",
        "tech", "teknologi", "coding", "software", "ai", "cloud", "server", "grafis", "animasi", "chip"
    ]) and not is_haji_related

    if is_tech_or_custom or persona_key in ["arye", "personal"]:
        persona_key = "arye"
        guide_content = load_style_guide("arye")
        default_badge = "✂️ DAVIQIN • EDITORIAL PAPER CUTOUT" if style_variant == "papercut" else "🎙️ ARYE BURHANUDIN • DEEP DIVE TECH"
    elif is_haji_related or persona_key in ["haji", "hajidarimuda"]:
        persona_key = "hajidarimuda"
        guide_content = load_style_guide("hajidarimuda")
        default_badge = "🕋 HAJI DARI MUDA • EDUKASI"
    else:
        persona_key = "arye"
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
        data["style_variant"] = style_variant
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
            "persona_used": persona_key,
            "style_variant": style_variant
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
