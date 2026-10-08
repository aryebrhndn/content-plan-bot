# 🕋 Hajidarimuda Automated Reels Generator
> **Petunjuk Lengkap untuk AI Coding Agent (Antigravity AI / Cursor / Cline / Windsurf)**  
> *Dokumen ini dirancang sebagai spesifikasi teknis dan blueprint kode lengkap agar AI Agent dapat mengimplementasikan, menguji, dan mendeploy sistem otomatisasi video Reels Telegram ke Hugging Face Spaces secara mandiri.*

---

## 📌 1. Ikhtisar Proyek (Project Overview)

Sistem ini adalah **bot otomatisasi video pendek (Instagram Reels / TikTok / Shorts)** vertikal berasio 9:16 untuk akun **Haji Dari Muda**.

Sistem berjalan secara mandiri di cloud gratis **Hugging Face Spaces (Docker, 2 vCPU, 16 GB RAM)** sehingga dapat merespons perintah dari HP melalui **Telegram 24/7** tanpa memerlukan komputer lokal menyala.

### Alur Kerja Sistem (End-to-End Workflow)
1. **User (HP):** Mengirimkan perintah teks di Telegram (misal: `Bikinin video topik: 4 Hal yang Membatalkan Tawaf`).
2. **FastAPI Webhook (Hugging Face):** Menerima pesan dari bot Telegram.
3. **Gemini Pro AI:** Menyusun teks naskah terstruktur dalam format JSON:
   - **Kotak Merah Atas (Hook)**
   - **Kotak Putih Tengah (Poin-Poin Ringkas)**
   - **Kotak Merah Bawah (CTA Variatif)**
   - **Caption Lengkap (Mikroblog, Doa Arab-Latin, Hashtag)**
4. **Graphic Overlay Engine (Pillow):** Menggambar overlay grafis transparan beresolusi 1080×1920 berisi kotak merah, kotak putih, dan teks naskah dengan *auto-wrapping*.
5. **Video Renderer (MoviePy / FFmpeg):** Mengambil *footage* latar belakang bertema Mekkah/Madinah secara acak dari direktori aset, menggabungkan overlay di atas video, dan merender file video `.mp4` vertikal.
6. **Telegram Bot Dispatcher:** Mengirimkan file video `.mp4` hasil render beserta teks *caption* lengkap kembali ke chat pengguna.

---

## 🗂️ 2. Struktur Repositori (File Tree)

AI Agent harus membuat struktur file persis seperti berikut:

```text
hajidarimuda-reels-bot/
├── Dockerfile
├── requirements.txt
├── config.py
├── main.py
├── core/
│   ├── __init__.py
│   ├── gemini_client.py
│   ├── graphic_generator.py
│   └── video_renderer.py
├── assets/
│   ├── fonts/
│   │   └── Montserrat-Bold.ttf
│   └── footages/
│       ├── makkah_sample_1.mp4
│       └── makkah_sample_2.mp4
└── README.md
```

---

## ⚙️ 3. Spesifikasi File & Kode Lengkap

### A. `requirements.txt`
```text
fastapi>=0.110.0
uvicorn>=0.28.0
python-telegram-bot>=21.0
google-generativeai>=0.5.0
pillow>=10.2.0
moviepy>=1.0.3
httpx>=0.27.0
python-dotenv>=1.0.1
pydantic>=2.6.0
```

---

### B. `Dockerfile`
*(Sangat penting: Hugging Face Spaces mewajibkan aplikasi berjalan di port `7860` dan membuat non-root user)*

```dockerfile
FROM python:3.10-slim

# Install dependencies sistem & FFmpeg untuk render video
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-freefont-ttf \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Buat non-root user untuk Hugging Face
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Salin requirements dan install library Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode proyek
COPY . .

# Berikan izin ke appuser
RUN chown -R appuser:appuser /app
USER appuser

# Hugging Face Spaces port default adalah 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
```

---

### C. `config.py`
```python
import os
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "supersecrettoken")
ALLOWED_USER_IDS = [
    int(uid.strip())
    for uid in os.getenv("ALLOWED_USER_IDS", "").split(",")
    if uid.strip().isdigit()
]
SPACE_HOST = os.getenv("SPACE_HOST", "") # Otomatis diisi oleh Hugging Face
```

---

### D. `core/gemini_client.py`
Modul ini bertugas menerima ide mentah pengguna dan menghasilkan JSON terstruktur sesuai format baku konten *Haji Dari Muda*.

```python
import json
import google.generativeai as genai
from config import GEMINI_API_KEY
from pydantic import BaseModel, Field

genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """
Kamu adalah Content Strategist dan Scriptwriter profesional untuk akun media sosial "Haji Dari Muda".
Tugasmu adalah membuat naskah video caption reels edukasi haji & umrah untuk anak muda.

ATURAN STRUKTUR OUTPUT:
1. Panggilan audiens harus selalu "Teman Jalan".
2. Tone: Edukatif, lugas, santai, solutif, zero hard-selling (fokus ke fiqih dasar, tips praktis, adab, dan persiapan fisik).
3. Struktur Visual Teks Layar:
   - hook_header: 1-2 baris pendek huruf kapital, memicu penasaran (Kotak Merah Atas)
   - points: List 4 atau 5 poin ringkas padat (Kotak Putih Tengah)
   - cta_footer: Kalimat ajakan aksi yang bervariasi, JANGAN selalu "Baca caption ya" (Kotak Merah Bawah)
4. Caption:
   - Artikel mikro lengkap dengan penjelasan dalil/fiqih, doa Arab-Latin jika relevan, ajakan interaksi di kolom komentar, dan hashtag relevan (#hajidarimuda #edukasihaji #haji #umrah).

Keluarkan respon HANYA dalam format JSON valid tanpa format markdown ```json ... ```.
"""

def generate_script_data(topic_prompt: str) -> dict:
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        system_instruction=SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json"}
    )
    
    prompt = f"Buatkan naskah video caption reels lengkap untuk topik berikut: {topic_prompt}"
    response = model.generate_content(prompt)
    
    try:
        data = json.loads(response.text)
        return data
    except Exception as e:
        # Fallback format jika parsing gagal
        return {
            "hook_header": "PERSIAPAN PENTING KE TANAH SUCI!",
            "points": [
                "• Jaga niat ikhlas lillahi ta'ala",
                "• Latihan fisik jalan kaki rutin",
                "• Pelajari tata cara manasik resmi",
                "• Siapkan dokumen dan paspor aktif"
            ],
            "cta_footer": "Simpan info penting ini buat persiapanmu nanti! 📌",
            "caption": f"Persiapan menuju Baitullah selagi muda.\n\n#hajidarimuda #tipsibadah"
        }
```

---

### E. `core/graphic_generator.py`
Modul ini bertugas menggambar overlay grafis transparan 1080×1920 dengan kotak merah atas, kotak putih tengah, dan kotak merah bawah.

```python
import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

WIDTH = 1080
HEIGHT = 1920

def get_font(size: int):
    # Cari font Montserrat atau gunakan default TrueType
    font_paths = [
        "assets/fonts/Montserrat-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def create_overlay_image(hook_text: str, points: list, cta_text: str, output_path: str):
    # Buat kanvas RGBA transparan
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # 1. KOTAK MERAH ATAS (HOOK)
    top_box_x0, top_box_y0 = 80, 160
    top_box_x1, top_box_y1 = 1000, 420
    draw.rounded_rectangle(
        [top_box_x0, top_box_y0, top_box_x1, top_box_y1],
        radius=24,
        fill="#DC2626"
    )
    
    font_hook = get_font(42)
    wrapped_hook = textwrap.fill(hook_text, width=28)
    draw.text(
        (WIDTH / 2, (top_box_y0 + top_box_y1) / 2),
        wrapped_hook,
        font=font_hook,
        fill="white",
        anchor="mm",
        align="center"
    )
    
    # 2. KOTAK PUTIH TENGAH (POIN-POIN)
    mid_box_x0, mid_box_y0 = 80, 470
    mid_box_x1, mid_box_y1 = 1000, 1400
    draw.rounded_rectangle(
        [mid_box_x0, mid_box_y0, mid_box_x1, mid_box_y1],
        radius=30,
        fill="white"
    )
    
    font_points = get_font(32)
    y_cursor = mid_box_y0 + 70
    line_spacing = (mid_box_y1 - mid_box_y0 - 140) / max(len(points), 1)
    
    for pt in points:
        wrapped_pt = textwrap.fill(pt, width=34)
        draw.text(
            (mid_box_x0 + 50, y_cursor),
            wrapped_pt,
            font=font_points,
            fill="#1E293B"
        )
        y_cursor += max(line_spacing, 110)
        
    # 3. KOTAK MERAH BAWAH (CTA)
    bot_box_x0, bot_box_y0 = 80, 1450
    bot_box_x1, bot_box_y1 = 1000, 1650
    draw.rounded_rectangle(
        [bot_box_x0, bot_box_y0, bot_box_x1, bot_box_y1],
        radius=24,
        fill="#DC2626"
    )
    
    font_cta = get_font(34)
    wrapped_cta = textwrap.fill(cta_text, width=32)
    draw.text(
        (WIDTH / 2, (bot_box_y0 + bot_box_y1) / 2),
        wrapped_cta,
        font=font_cta,
        fill="white",
        anchor="mm",
        align="center"
    )
    
    overlay.save(output_path, "PNG")
    return output_path
```

---

### F. `core/video_renderer.py`
Modul ini menggabungkan video footage dan gambar overlay menggunakan MoviePy.

```python
import os
import random
from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip

def render_reels_video(overlay_png_path: str, output_mp4_path: str) -> str:
    footages_dir = "assets/footages"
    available_footages = [
        os.path.join(footages_dir, f)
        for f in os.listdir(footages_dir)
        if f.endswith((".mp4", ".mov"))
    ]
    
    if not available_footages:
        raise FileNotFoundError("Tidak ada footage video di folder assets/footages!")
        
    # Pilih 1 footage secara acak
    selected_footage = random.choice(available_footages)
    
    # Target durasi video 7 detik
    target_duration = 7.0
    
    base_video = VideoFileClip(selected_footage)
    
    # Loop atau potong sesuai target durasi
    if base_video.duration > target_duration:
        base_video = base_video.subclip(0, target_duration)
    else:
        target_duration = base_video.duration
        
    # Resize video agar proporsional di 1080x1920
    base_video = base_video.resize((1080, 1920))
    
    # Tumpuk gambar overlay di atas video
    overlay_clip = (
        ImageClip(overlay_png_path)
        .set_duration(target_duration)
        .set_pos(("center", "center"))
    )
    
    final_clip = CompositeVideoClip([base_video, overlay_clip])
    
    final_clip.write_videofile(
        output_mp4_path,
        codec="libx264",
        audio_codec="aac",
        fps=30,
        preset="ultrafast",
        threads=2
    )
    
    base_video.close()
    final_clip.close()
    return output_mp4_path
```

---

### G. `main.py`
Server FastAPI yang menangani Webhook Telegram dan memproses antrian tugas.

```python
import os
import asyncio
from fastapi import FastAPI, Request, BackgroundTasks
import httpx
from config import TELEGRAM_BOT_TOKEN, ALLOWED_USER_IDS
from core.gemini_client import generate_script_data
from core.graphic_generator import create_overlay_image
from core.video_renderer import render_reels_video

app = FastAPI(title="Hajidarimuda Automated Reels Generator")

TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

async def send_telegram_message(chat_id: int, text: str):
    async with httpx.AsyncClient() as client:
        await client.post(f"{TELEGRAM_API_URL}/sendMessage", json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown"
        })

async def send_telegram_video(chat_id: int, video_path: str, caption: str):
    async with httpx.AsyncClient(timeout=120.0) as client:
        with open(video_path, "rb") as f:
            files = {"video": f}
            data = {"chat_id": chat_id, "caption": caption}
            await client.post(f"{TELEGRAM_API_URL}/sendVideo", files=files, data=data)

def process_video_generation(chat_id: int, user_prompt: str):
    try:
        # Kirim notifikasi awal
        asyncio.run(send_telegram_message(chat_id, "⏳ *Sedang meracik naskah & merender video reels Anda... Mohon tunggu ~20 detik.*"))
        
        # 1. Panggil Gemini
        script_data = generate_script_data(user_prompt)
        
        # 2. Gambar Overlay
        temp_overlay = f"/tmp/overlay_{chat_id}.png"
        create_overlay_image(
            hook_text=script_data.get("hook_header", ""),
            points=script_data.get("points", []),
            cta_text=script_data.get("cta_footer", ""),
            output_path=temp_overlay
        )
        
        # 3. Render Video MP4
        temp_video = f"/tmp/reels_{chat_id}.mp4"
        render_reels_video(temp_overlay, temp_video)
        
        # 4. Kirim ke Telegram
        caption_text = (
            f"✅ *Video Reels Siap Posting!*\n\n"
            f"📝 *Salin Teks Caption Ini:*\n\n"
            f"{script_data.get('caption', '')}"
        )
        asyncio.run(send_telegram_video(chat_id, temp_video, caption_text))
        
        # Bersihkan file temp
        if os.path.exists(temp_overlay): os.remove(temp_overlay)
        if os.path.exists(temp_video): os.remove(temp_video)

    except Exception as e:
        asyncio.run(send_telegram_message(chat_id, f"❌ Terjadi kendala saat proses render: {str(e)}"))

@app.get("/")
def health_check():
    # Digunakan untuk UptimeRobot ping agar Hugging Face Space tidak pernah tidur
    return {"status": "ok", "app": "Hajidarimuda Reels Generator"}

@app.post("/webhook")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    if "message" in data and "text" in data["message"]:
        chat_id = data["message"]["chat"]["id"]
        user_id = data["message"]["from"]["id"]
        text = data["message"]["text"]
        
        # Validasi allowlist user agar aman
        if ALLOWED_USER_IDS and user_id not in ALLOWED_USER_IDS:
            await send_telegram_message(chat_id, "⛔ Akses ditolak. Bot ini bersifat privat.")
            return {"status": "forbidden"}
            
        # Eksekusi pembuatan video di latar belakang
        background_tasks.add_task(process_video_generation, chat_id, text)
        
    return {"status": "success"}
```

---

## 🚀 4. Panduan Deployment ke Hugging Face Spaces (Step-by-Step)

AI Agent atau Pengguna dapat mengikuti langkah ini untuk meluncurkan sistem ke cloud:

1. **Buat Space Baru di Hugging Face:**
   - Kunjungi `https://huggingface.co/new-space`.
   - Beri nama space (misal: `hajidarimuda-bot`).
   - Pilih **Space SDK: Docker** ➔ Template: **Blank**.
   - Pilih Hardware: **CPU Basic (Free - 2 vCPU, 16GB RAM)**.
2. **Unggah Seluruh Kode:**
   - Masukkan seluruh file di atas ke dalam repositori Space (bisa lewat Git atau drag-and-drop web UI).
   - Masukkan minimal 1 file video MP4 ke folder `assets/footages/` (misal video pemandangan Ka'bah vertikal 1080x1920).
3. **Atur Secrets (Environment Variables) di Hugging Face:**
   - Masuk ke tab **Settings** di Space Anda ➔ bagian **Variables and secrets** ➔ tambahkan:
     * `TELEGRAM_BOT_TOKEN`: Token bot dari @BotFather.
     * `GEMINI_API_KEY`: API Key Gemini Pro Anda.
     * `ALLOWED_USER_IDS`: ID angka Telegram Anda (dari @userinfobot).
4. **Sambungkan Webhook Telegram:**
   - Begitu status Space sudah `Running`, dapatkan URL aplikasi Anda (misal: `https://username-hajidarimuda-bot.hf.space`).
   - Daftarkan webhook Telegram dengan membuka URL ini di browser Anda:
     ```text
     https://api.telegram.org/bot<TOKEN_ANDA>/setWebhook?url=https://username-hajidarimuda-bot.hf.space/webhook
     ```
   - Jika berhasil, Telegram akan merespons: `{"ok":true,"result":true,"description":"Webhook was set"}`.
5. **Cegah Hugging Face Tertidur (Keep-Alive):**
   - Buka layanan gratis [UptimeRobot](https://uptimerobot.com) atau [cron-job.org](https://cron-job.org).
   - Buat monitor baru tipe **HTTP(s)** yang memanggil URL Space Anda (`https://username-hajidarimuda-bot.hf.space/`) setiap 10–15 menit. Ini menjaga server tetap aktif 24 jam nonstop.

---

## 📱 5. Cara Penggunaan Harian (Pembuatan Konten)

1. Buka aplikasi Telegram di HP Anda.
2. Buka obrolan dengan bot pribadi Anda (`@hajidarimuda_bot`).
3. Ketikkan topik yang ingin dibuat, contoh:
   > *"Buatkan video tentang 5 barang wajib di dalam tenda Mina"*
4. Dalam 20–30 detik, bot akan mengirimkan:
   - **Video `.mp4` vertikal 9:16 siap posting** (lengkap dengan teks hook, poin, dan CTA).
   - **Teks Caption mikroblog lengkap** dengan dalil/doa dan hashtag siap salin.
5. Perintah konten lainnya:
   - `/mode` ➔ Berpindah antara **Haji Dari Muda** atau **Arye Burhanudin**
   - `/ide <topik>` ➔ Brainstorming ide sudut pandang konten
   - `/skrip <topik>` ➔ Naskah Talking Head lengkap (shot-list & B-Roll)

---

## 💻 6. Telegram Laptop Monitoring & Remote Control (20 Fitur)

Sistem ini dilengkapi dengan **Laptop Agent (`laptop_agent.py`)** yang secara berkala mengirimkan telemetri kesehatan Windows (setiap 5 menit) dan mendengarkan instruksi jarak jauh (setiap 5 detik):

### A. Cara Menjalankan Agent di Laptop
Jalankan di background Windows (PowerShell atau Command Prompt):
```powershell
python laptop_agent.py
```
*(Jika bot dihosting di Hugging Face Spaces, set `TELEMETRY_URL=https://username-space.hf.space/api/telemetry` di file `.env`)*

### B. Daftar 20 Tag Pengecekan di Telegram

| Fitur | Command Tag | Deskripsi Singkat Kegunaan |
|---|---|---|
| **Panduan Lengkap** | `/panduan` | Menampilkan seluruh daftar command tag & deskripsi fungsinya |
| **Status Umum** | `/status` / `/laptop` | Ringkasan kondisi laptop (Online/Offline, CPU, RAM, Disk, Baterai, Wi-Fi) |
| **CPU** | `/cpu` | Beban prosesor total, GHz clock speed, per-core usage, suhu |
| **RAM** | `/ram` | Penggunaan memori fisik & virtual (GB terpakai & sisa), top app boros RAM |
| **Storage** | `/disk` | Kapasitas seluruh drive (C:, D:, dll) dengan visualisasi bar |
| **GPU** | `/gpu` | Kartu grafis, driver yang terpasang, & display terhubung |
| **Baterai** | `/battery` | Persentase daya, status colokan charger/AC, & estimasi sisa |
| **Suhu & Fan** | `/temp` | Beban termal hardware & status pendingin |
| **Proses Aktif** | `/process` | Daftar proses Windows teratas (PID, RAM%, CPU%) |
| **Matikan Proses** | `/kill <nama/PID>` | Menghentikan paksa aplikasi yang hang (misal: `/kill chrome`) |
| **Startup Apps** | `/startup` | Aplikasi yang otomatis berjalan saat Windows booting |
| **Services** | `/services` | Daftar Windows Services yang sedang berjalan |
| **Jaringan & Wi-Fi**| `/network` | SSID Wi-Fi aktif, IP address lokal, total kuota MB terpakai |
| **Keamanan** | `/security` | Status real-time Windows Defender & Windows Firewall |
| **Info Sistem** | `/info` | Detail spesifikasi perangkat, prosesor, arsitektur, & OS build |
| **File Storage** | `/files` | Distribusi penyimpanan file pada drive sistem utama |
| **Screenshot Layar**| `/screen` | Mengambil foto tampilan layar laptop secara live & mengirim ke Telegram |
| **Menu Daya** | `/power` | Menu kontrol daya (`/lock`, `/sleep`, `/restart`, `/shutdown`) |
| **Alerts** | `/alerts` | Sistem deteksi peringatan jika CPU > 85%, RAM > 90%, atau Baterai <= 20% |
| **Hardware** | `/hardware` | Deteksi hardware terpasang, display, & prosesor |
| **Event Log** | `/events` | Catatan stabilitas Windows & riwayat integritas kernel |
| **Update** | `/update` | Status Windows build & pembaruan keamanan |

