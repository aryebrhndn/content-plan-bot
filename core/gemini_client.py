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


def chat_with_gemini(user_message: str, persona_key: str = "arye") -> str:
    """
    Menjawab pertanyaan, diskusi, atau konsultasi dari pengguna secara cerdas dan kontekstual.
    Menyesuaikan persona aktif (Arye Burhanudin / Haji Dari Muda / Remotion Stock Animator).
    Secara cerdas memahami struktur file, folder template (6-DaviqinVid1), dan workflow video.
    """
    lower_msg = user_message.lower()

    # Deteksi persona secara dinamis dari isi pesan pengguna
    if any(k in lower_msg for k in ["arye", "daviqin", "papercut", "paper cut", "paper-cut", "vox", "berhala", "sajadah", "ali", "edtech", "sosmed"]):
        persona_key = "arye"
    elif any(k in lower_msg for k in ["haji", "umrah", "manasik", "mekkah", "makkah", "madinah", "ka'bah", "teman jalan"]):
        persona_key = "hajidarimuda"
    elif any(k in lower_msg for k in ["microstock", "shutterstock", "adobe stock", "pond5", "envato", "stock footage", "jual footage"]):
        persona_key = "remotion"
    elif persona_key not in ["arye", "hajidarimuda", "remotion"]:
        persona_key = "arye"

    guide_content = load_style_guide(persona_key)

    system_architecture_knowledge = """
SISTEM & KNOWLEDGE BASE PROYEK (SANGAT PENTING - BACA BAIK-BAIK):
1. LOKASI & LINGKUNGAN: Kamu berjalan langsung di backend cloud server Railway (didukung engine Remotion React + FastAPI Python).
2. AKSES FOLDER & TEMPLATE ACUAN SEBAGAI DESIGN SYSTEM (STYLE REFERENCES):
   - Kamu TAHU PASTI dan MEMILIKI akses ke struktur folder di sistem ini:
     • Folder 'remotion/6-DaviqinVid1/' ➔ ACUAN STYLE Paper Cutout Vox Editorial (PaperWrapper.tsx, Typography.tsx, PaperCutout.tsx, CollageElements.tsx: kraft paper, cutting mat grid, scotch tape, marker highlight merah, dossier header, rubber stamp, 12fps wiggle).
     • Folder '2-BerhalaKaumNuh', '3-SajadahSyirik', '4-MisiKpdAli' ➔ ACUAN STYLE Cinematic BRoll Deep Dive (dark slate, cyan/amber glowing cards, modern typography).
     • Engine Produksi Video: 'remotion/AryeReels.tsx' (Master Composition dinamis multi-scene yang mengadopsi 2 variasi style di atas).
3. HUKUM MUTLAK GENERATE VIDEO BARU DARI AUDIO/REQUEST:
   - DILARANG KERAS menimpa file video lama '6-DaviqinVid1' atau memunculkan visual berhala Nabi Nuh yang tidak nyambung dengan topik audio baru!
   - Folder di atas HANYALAH ACUAN STYLE (VISUAL DESIGN SYSTEM).
   - Setiap kali pengguna mengirimkan audio baru (misal MP3) atau request video baru, sistem HARUS merancang dan me-render VIDEO MURNI BARU (FRESH) yang naskah teks layar, headline, poin-poin analisis, dan pergantian scenenya 100% SESUAI DENGAN APA YANG DIUCAPKAN AUDIO TERSEBUT!
   - Durasi video disinkronkan PENUH dengan durasi MP3 pengguna (misal ~104 detik / hampir 2 menit), dengan pembagian 5-7 scene berurutan (multi-scene) sepanjang durasi audio tanpa dipotong!
4. FOKUS KONTEN SOSMED VS MICROSTOCK:
   - Mode Arye Burhanudin dan Mode Haji Dari Muda adalah MURNI KONTEN SOSMED (Instagram Reels, TikTok, YouTube Shorts, narasi edukatif, storytelling, video talking head, dan B-roll).
   - DILARANG KERAS membelokkan percakapan ke Microstock, Shutterstock, Adobe Stock, atau jualan asset jika pengguna sedang di Mode Arye, Mode Haji, membahas Paper Cut, atau konten sosmed!
   - Microstock HANYA relevan jika pengguna secara spesifik meminta 'microstock / stock footage' atau sedang di mode /remotion aset footage.
5. FITUR AUDIO & MP3 VIA TELEGRAM:
   - Sistem bot ini SUDAH MENDUKUNG penerimaan file MP3 / Voice Note via Telegram.
   - Jika pengguna bertanya 'apakah bisa dibikinin video dari lampiran MP3 dengan style daviqinvid1 di mode arye?':
     ➔ JAWAB TEGAS: 'Bisa banget!'
     ➔ Jelaskan alurnya: Bot menerima MP3 -> membaca topik narasinya -> merancang naskah visual multi-scene fresh yang sinkron dengan isi audio -> me-render video Remotion dengan acuan style pilihan (Paper Cutout Daviqin Vox style atau Cinematic Deep Dive) sepanjang durasi utuh audio tersebut!
"""

    if persona_key in ["arye", "personal"]:
        system_persona = (
            "Kamu adalah Arye Burhanudin — tech educator, system architect, dan video creator konten sosmed mendalam. "
            "Fokus utamamu adalah KONTEN SOSMED (Instagram Reels, TikTok, Shorts, YouTube) dengan gaya khas Editorial Paper-Cutout (Vox / Daviqin Style ala 6-DaviqinVid1). "
            "Gaya bicaramu kritis, analitis, sistematis, santai, berbobot, dan to the point. "
            "Bantu user menjawab pertanyaan apa pun seputar pembuatan video sosmed, konsep paper cut, teknologi, arsitektur sistem, atau diskusi ide. "
            "JANGAN PERNAH membahas microstock/shutterstock atau memaksakan komponen hardware RAM/CPU jika user membahas konten sosmed atau konsep paper cut!"
        )
    elif persona_key in ["haji", "hajidarimuda"]:
        system_persona = (
            "Kamu adalah konsultan dan kreator brand 'Haji Dari Muda'. "
            "Fokus utamamu adalah KONTEN SOSMED edukasi Haji/Umrah anak muda ('Teman Jalan', naskah hook-poin-CTA, hadits & caption IG). "
            "Gaya bicaramu hangat, bersahabat, santun, sarat nilai ibadah, dan menyemangati anak muda. "
            "Jawab secara cerdas, jelas, dan ramah tanpa memaksakan generate video."
        )
    else:  # Remotion / Footage
        system_persona = (
            "Kamu adalah Creative Motion Director & Remotion Motion Graphics Specialist. "
            "Keahlianmu adalah grafis animasi vektor 3D, Remotion React, dan motion design (Footage B-roll bersih, 16:9 lanskap, 9:16 potret, 1:1, alpha channel transparan). "
            "Jawab secara profesional, fleksibel, cerdas, dan to the point."
        )

    full_instruction = f"""{system_persona}

{system_architecture_knowledge}

Acuan Dokumen Panduan:
{guide_content[:1500] if guide_content else ''}

PEDOMAN FORMAT JAWABAN (SANGAT PENTING):
1. Format Percakapan Telegram: Berikan jawaban dalam teks bahasa Indonesia yang ramah, mengalir natural, cerdas, dan tertata rapi.
2. DILARANG KERAS MENGELUARKAN KODE SUMBER MENTAH (seperti React TSX, JSX, HTML, CSS, JavaScript, atau dump JSON data) KECUALI jika pengguna secara terang-terangan dan spesifik meminta contoh kode pemrograman!
3. Jangan pernah membungkus seluruh jawaban dalam blok kode markdown (```). Gunakan teks biasa dengan styling Markdown Telegram standar (*tebal*, _miring_, bullet points `•`).
4. Jawab pertanyaan pengguna secara tuntas dan to the point. Berikan kepastian yang lugas dan solutif."""

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


def build_sequential_scenes(
    topic_prompt: str,
    hook_header: str,
    points: list[str],
    cta_footer: str,
    target_duration: int = 15,
    is_papercut: bool = True
) -> list[dict]:
    """
    Membangun daftar scene dinamis berurutan (multi-scene) sepanjang durasi video (misal 104 detik).
    Tiap scene memuat headline spesifik, subtext, highlight_word (garis marker merah),
    poin detail, dan exhibit label.
    """
    if target_duration <= 20:
        num_scenes = 3
    elif target_duration <= 45:
        num_scenes = 4
    elif target_duration <= 75:
        num_scenes = 5
    elif target_duration <= 130:
        num_scenes = 6
    else:
        num_scenes = min(8, max(5, int(round(target_duration / 20))))

    pts = [p.replace("•", "").replace("-", "").strip() for p in points if p.strip()]
    if not pts:
        pts = [
            "Analisis mendalam berbasis data primer & fakta riil",
            "Identifikasi pola dan akar permasalahan mendasar",
            "Evaluasi komparatif & telaah bukti lapangan",
            "Optimalisasi solusi dan implementasi terarah"
        ]

    scenes = []

    # Scene 1: Hook / Investigasi Pembuka
    hook_clean = (hook_header or topic_prompt or "BEDAH ANALISIS").upper()
    hook_words = [w for w in hook_clean.split() if len(w) > 2]
    hl_word = hook_words[0] if hook_words else "ANALISIS"
    scenes.append({
        "tag": "INVESTIGASI // PEMBUKA",
        "headline": hook_clean[:45],
        "subtext": f"Menyelami fenomena penting dan anomali seputar {topic_prompt[:50]}.",
        "highlight_word": hl_word,
        "points": [pts[0] if pts else "Telaah awal berbasis data primer"],
        "exhibit": "EXHIBIT #01",
        "theme": "A_Cream"
    })

    # Middle Scenes: Membagi poin-poin menjadi scene tersendiri
    mid_count = max(1, num_scenes - 2)
    for i in range(mid_count):
        pt_idx = (i + 1) % len(pts)
        curr_pt = pts[pt_idx]
        words = curr_pt.split()
        head = " ".join(words[:5]).upper() if words else f"FAKTA KRUSIAL #{i+2}"
        sub = " ".join(words[5:]) if len(words) > 5 else curr_pt
        sub_hl = words[0] if words else "FAKTA"
        theme = "B_DeepInk" if i % 2 == 0 else "A_Cream"

        scenes.append({
            "tag": f"FAKTA LAPANGAN #{i+2} // BUKTI",
            "headline": head[:45],
            "subtext": sub[:120],
            "highlight_word": sub_hl,
            "points": [curr_pt[:90]],
            "exhibit": f"CASE REF #0{i+2}",
            "theme": theme
        })

    # Final Scene: Kesimpulan & Rekomendasi / CTA
    scenes.append({
        "tag": "KESIMPULAN // REKOMENDASI",
        "headline": "SOLUSI & TINDAKAN KONKRET",
        "subtext": cta_footer or f"Simpan catatan ini untuk referensi seputar {topic_prompt[:40]}! 📌",
        "highlight_word": "SOLUSI",
        "points": ["Simpan info penting ini untuk referensi", "Bagikan agar lebih banyak yang teredukasi"],
        "exhibit": "VERIFIED #COMPLETE",
        "theme": "A_Cream"
    })

    return scenes


def generate_script_data(topic_prompt: str, persona_key: str = "auto", target_duration: int = None) -> dict:
    """
    Menghasilkan naskah konten JSON terstruktur untuk dirender ke video Remotion/Reels.
    Fleksibel dan adaptif terhadap durasi audio penuh pengguna (hingga 360s), topik,
    dan variasi style (Papercut Daviqin Vox vs Regular Cinematic).
    """
    import re

    lower_prompt = topic_prompt.lower()
    
    # Deteksi durasi dari request pengguna (misal: "8 detik", "15 detik") jika tidak diberikan
    if target_duration is None or target_duration <= 0:
        duration_match = re.search(r'(\d+)\s*(?:detik|sec|second)', lower_prompt)
        target_duration = int(duration_match.group(1)) if duration_match else 15
    target_duration = max(5, min(360, target_duration))

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
    # 1. Style Paper Cut (mengacu template desain 6-DaviqinVid1)
    # 2. Style Regular (mengacu template desain 2-BerhalaKaumNuh, 3-SajadahSyirik, 4-MisiKpdAli)
    is_daviqin = any(k in lower_prompt for k in ["daviqin", "daviqinvid1", "folder daviqin", "foder daviqin", "template daviqin", "kesyirikan"])
    is_papercut_style = is_daviqin or any(k in lower_prompt for k in ["paper cut", "papercut", "paper-cut", "vox", "kliping", "kolase", "stop motion"])
    style_variant = "papercut" if is_papercut_style else "regular"

    # Deteksi apakah topik adalah tentang Tech/Hardware/3D vs Haji
    is_haji_related = any(k in lower_prompt for k in [
        "haji", "umrah", "tawaf", "mina", "mekkah", "makkah", "madinah", "ka'bah", "arafah", "sa'i", "manasik", "kemenag"
    ])
    is_tech_or_custom = any(k in lower_prompt for k in [
        "ram", "cpu", "gpu", "3d", "vektor", "vector", "hardware", "laptop", "pc",
        "tech", "teknologi", "coding", "software", "ai", "cloud", "server", "grafis", "animasi", "chip"
    ]) and not is_haji_related

    if is_papercut_style or persona_key in ["arye", "personal"]:
        persona_key = "arye"
        guide_content = load_style_guide("arye")
        default_badge = "✂️ DAVIQIN • EDITORIAL PAPER CUTOUT" if is_papercut_style else "🎙️ ARYE BURHANUDIN • DEEP DIVE"
    elif is_haji_related or persona_key in ["haji", "hajidarimuda"]:
        persona_key = "hajidarimuda"
        guide_content = load_style_guide("hajidarimuda")
        default_badge = "🕋 HAJI DARI MUDA • EDUKASI"
    elif is_tech_or_custom or persona_key in ["tech_vector", "vector", "remotion"]:
        persona_key = "tech_vector"
        guide_content = load_style_guide("tech_vector") if "tech_vector" in PERSONAS else ""
        default_badge = "⚡ 3D TECH • HARDWARE VECTOR"
    else:
        persona_key = "arye"
        guide_content = load_style_guide("arye")
        default_badge = "🎙️ ARYE BURHANUDIN • DEEP DIVE"

    # Hitung jumlah scene dinamis
    if target_duration <= 20:
        num_scenes = 3
    elif target_duration <= 45:
        num_scenes = 4
    elif target_duration <= 75:
        num_scenes = 5
    elif target_duration <= 130:
        num_scenes = 6
    else:
        num_scenes = 7

    system_instruction = f"""Kamu adalah Video Creative Director dan Scriptwriter handal.
Kamu bertugas merancang naskah dan aset visual video MURNI BARU (FRESH) berdurasi {target_duration} detik dengan {num_scenes} scene berurutan sesuai permintaan pengguna:
Topik: "{topic_prompt}"

PANDUAN KATEGORI & BRAND BADGE MUTLAK:
1. Jika Style Papercut / Daviqin / Vox (Mode Arye Paper Cutout):
   - brand_badge: "✂️ DAVIQIN • EDITORIAL PAPER CUTOUT"
   - Acuan desain visual: Kraft paper, cutting mat grid, scotch tape, rubber stamp, marker highlight merah.
   - FOKUS KONTEN HARUS 100% SESUAI TOPIK / AUDIO PENGGUNA! DILARANG KERAS memaksakan hardware RAM/CPU atau berhala Nabi Nuh jika topik tidak membahas itu!
2. Jika Mode Arye Burhanudin Reguler:
   - brand_badge: "🎙️ ARYE BURHANUDIN • DEEP DIVE"
   - Fokus: Deep dive arsitektur sistem, komputasi, dan edukasi digital.
3. Jika Mode Haji Dari Muda:
   - brand_badge: "🕋 HAJI DARI MUDA • EDUKASI"
   - Panggilan: "Teman Jalan", edukasi manasik/persiapan haji muda.
4. Jika Khusus 3D Tech / Hardware Vector:
   - brand_badge: "⚡ 3D TECH • HARDWARE VECTOR"

Struktur Visual Teks Layar:
- hook_header: 1-2 baris huruf kapital tebal memicu penasaran (Kotak Judul)
- points: 4-6 poin ringkas penting yang padat (Kotak Poin)
- cta_footer: Ajakan aksi singkat yang relevan (Kotak Bawah)
- brand_badge: Label kategori atas sesuai panduan di atas
- duration_sec: {target_duration}
- scenes: Array berisi {num_scenes} scene berurutan. Setiap scene memiliki:
    tag: Label investigasi (misal 'INVESTIGASI // PEMBUKA' atau 'FAKTA #2 // BUKTI LAPANGAN')
    headline: Judul scene singkat huruf kapital
    subtext: Penjelasan rinci segmen ini
    highlight_word: Kata kunci penting yang digarisbawahi marker merah
    points: Array berisi 1-2 poin spesifik
    exhibit: Nomor berkas (misal 'EXHIBIT #01', 'CASE REF #02')
    theme: 'A_Cream' atau 'B_DeepInk'
- caption: Naskah caption lengkap siap salin ke Instagram/TikTok/YouTube.

Keluarkan respon HANYA dalam format JSON valid tanpa format markdown ```json ... ```."""

    try:
        payload = {
            "system_instruction": {
                "parts": [{"text": system_instruction}]
            },
            "contents": [
                {"parts": [{"text": f"Rancang naskah video segar berdurasi {target_duration} detik dengan {num_scenes} scene untuk topik ini: {topic_prompt}"}]}
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
        data["duration_sec"] = target_duration
        data["style_variant"] = style_variant

        # Sanitasi ketat brand_badge agar tidak pernah bocor ke 3D Tech di Mode Arye / Daviqin
        if is_papercut_style:
            data["brand_badge"] = "✂️ DAVIQIN • EDITORIAL PAPER CUTOUT"
            data["style_variant"] = "papercut"
        elif persona_key in ["arye", "personal"]:
            curr_b = data.get("brand_badge", "")
            if not curr_b or "HARDWARE" in curr_b or "3D TECH" in curr_b:
                data["brand_badge"] = "🎙️ ARYE BURHANUDIN • DEEP DIVE"
        elif persona_key in ["haji", "hajidarimuda"]:
            curr_b = data.get("brand_badge", "")
            if not curr_b or "HARDWARE" in curr_b or "3D TECH" in curr_b:
                data["brand_badge"] = "🕋 HAJI DARI MUDA • EDUKASI"
        elif not data.get("brand_badge"):
            data["brand_badge"] = default_badge

        # Pastikan scenes valid dan memiliki minimal 2 scene
        scenes_raw = data.get("scenes")
        if not scenes_raw or not isinstance(scenes_raw, list) or len(scenes_raw) < 2:
            data["scenes"] = build_sequential_scenes(
                topic_prompt=topic_prompt,
                hook_header=data.get("hook_header", ""),
                points=data.get("points", []),
                cta_footer=data.get("cta_footer", ""),
                target_duration=target_duration,
                is_papercut=is_papercut_style
            )

        return data

    except Exception as e:
        logger.error(f"Gagal memanggil Gemini API: {e}", exc_info=True)
        if persona_key == "arye" or is_papercut_style or style_variant == "papercut":
            fallback_badge = "✂️ DAVIQIN • EDITORIAL PAPER CUTOUT" if (is_papercut_style or style_variant == "papercut") else "🎙️ ARYE BURHANUDIN • DEEP DIVE"
            fallback_hook = f"ANALISIS: {topic_prompt[:35].upper()}" if topic_prompt else "ANALISIS & INVESTIGASI FENOMENA"
            fallback_points = [
                "• Bedah akar masalah & pola sistematis",
                "• Rujukan data primer & fakta terverifikasi",
                "• Anatomi dampak dan normalisasi isu",
                "• Solusi terarah & langkah konkret"
            ]
        elif persona_key in ["haji", "hajidarimuda"]:
            fallback_badge = "🕋 HAJI DARI MUDA • EDUKASI"
            fallback_hook = "5 TIPS PERSIAPAN HAJI DARI MUDA"
            fallback_points = [
                "• Niat ikhlas & kuatkan tekad istithaah",
                "• Buka tabungan porsi haji sedini mungkin",
                "• Pelajari fiqih manasik & doa harian",
                "• Jaga kebugaran fisik dan stamina"
            ]
        else:
            fallback_badge = "⚡ 3D TECH • HARDWARE VECTOR"
            fallback_hook = "ARSITEKTUR TEKNOLOGI MODERN"
            fallback_points = [
                "• Pemrosesan data komputasi presisi",
                "• Optimalisasi alur kerja digital",
                "• Struktur arsitektur modular & terukur"
            ]
        
        fallback_cta = "Simpan info penting ini! 📌"
        fallback_scenes = build_sequential_scenes(
            topic_prompt=topic_prompt,
            hook_header=fallback_hook,
            points=fallback_points,
            cta_footer=fallback_cta,
            target_duration=target_duration,
            is_papercut=is_papercut_style
        )
        return {
            "brand_badge": fallback_badge,
            "hook_header": fallback_hook,
            "points": fallback_points,
            "cta_footer": fallback_cta,
            "scenes": fallback_scenes,
            "caption": f"Topik: {topic_prompt}\n\nSemoga bermanfaat!\n\n#konten #edukasi #insight",
            "duration_sec": target_duration,
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
