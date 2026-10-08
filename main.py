import os
import sys
import uuid
import asyncio
import logging
import datetime
from typing import Dict, List
from fastapi import FastAPI, Request, BackgroundTasks
import httpx

from config import (
    TELEGRAM_BOT_TOKEN,
    ALLOWED_USER_IDS,
    TEMP_DIR,
    WEBHOOK_SECRET
)
import time
from core.gemini_client import (
    generate_script_data,
    PERSONAS,
    get_available_personas
)
from core.graphic_generator import create_overlay_image
from core.video_renderer import render_reels_video
from core.telemetry_handlers import (
    format_status,
    format_cpu,
    format_ram,
    format_disk,
    format_gpu,
    format_battery,
    format_temp,
    format_process,
    format_startup,
    format_services,
    format_network,
    format_security,
    format_info,
    format_files,
    format_alerts,
    format_hardware,
    format_events,
    format_update,
    format_power_menu,
    get_commands_guide
)

# Konfigurasi Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Multi-Channel Automated Reels Generator & Laptop Monitor")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

# Penyimpanan mode aktif per user (In-memory)
user_active_modes: Dict[int, str] = {}

# Penyimpanan data telemetri laptop terakhir
laptop_telemetry_data: Dict = {}

# Antrean aksi remote yang akan dieksekusi laptop (Screenshot, Kill, Lock, Sleep)
pending_remote_actions: List[Dict] = []
last_screenshot_chat_id: int = None


async def send_telegram_photo(chat_id: int, photo_bytes: bytes, caption: str = ""):
    """Mengirim file foto ke Telegram."""
    if not TELEGRAM_BOT_TOKEN:
        return
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            files = {"photo": ("screenshot.png", photo_bytes, "image/png")}
            data = {"chat_id": chat_id, "caption": caption, "parse_mode": "Markdown"}
            await client.post(f"{TELEGRAM_API_URL}/sendPhoto", files=files, data=data)
        except Exception as e:
            logger.error(f"Gagal mengirim foto Telegram: {e}")


def format_laptop_status() -> str:
    """Format status laptop untuk tampilan kartu Telegram."""
    if not laptop_telemetry_data:
        return (
            "⚪ *Status Laptop: Belum Ada Data*\n\n"
            "Script pelacak `laptop_agent.py` belum mengirimkan data telemetri ke bot.\n"
            "Jalankan `python laptop_agent.py` di laptop Anda untuk mulai memantau."
        )

    last_ts = laptop_telemetry_data.get("server_received_at", 0)
    diff_sec = time.time() - last_ts
    diff_min = int(diff_sec // 60)
    hostname = laptop_telemetry_data.get("hostname", "Laptop")
    os_name = laptop_telemetry_data.get("os", "Windows")
    cpu = laptop_telemetry_data.get("cpu", 0)
    ram = laptop_telemetry_data.get("ram", 0)
    ram_used = laptop_telemetry_data.get("ram_used_gb", 0)
    ram_total = laptop_telemetry_data.get("ram_total_gb", 0)
    disk_free = laptop_telemetry_data.get("disk_free_gb", 0)
    batt = laptop_telemetry_data.get("battery", 0)
    plugged = laptop_telemetry_data.get("plugged", False)
    batt_str = f"{batt}%" + (" 🔌 (Sedang Mengisi Daya)" if plugged else " 🔋 (Baterai)")

    if diff_sec <= 360:  # Terakhir dikirim dalam 6 menit terakhir (Online)
        return (
            f"🟢 *LAPTOP STATUS: ONLINE & AKTIF*\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"💻 *Perangkat:* {hostname} ({os_name})\n"
            f"⚡ *CPU Usage:* {cpu}%\n"
            f"🧠 *RAM Usage:* {ram}% ({ram_used} GB / {ram_total} GB)\n"
            f"💾 *Sisa Disk C:* {disk_free} GB\n"
            f"🔋 *Baterai:* {batt_str}\n"
            f"⏱️ *Update Terakhir:* {int(diff_sec)} detik yang lalu"
        )
    else:  # Lebih dari 6 menit yang lalu (Mati / Standby)
        time_ago = f"{diff_min} menit yang lalu" if diff_min < 60 else f"{diff_min // 60} jam {diff_min % 60} menit yang lalu"
        return (
            f"🔴 *LAPTOP STATUS: OFFLINE (Mati / Standby)*\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"💻 *Perangkat:* {hostname} ({os_name})\n"
            f"⏳ *Terakhir Aktif:* {time_ago}\n\n"
            f"📊 *Kondisi Terakhir Sebelum Mati:*\n"
            f"• Sisa Baterai: {batt_str}\n"
            f"• Sisa Penyimpanan C: {disk_free} GB\n"
            f"• Penggunaan RAM Terakhir: {ram}%\n\n"
            f"⚠️ _Catatan: Laptop tidak mengirimkan sinyal lebih dari 5 menit (kemungkinan dimatikan, sleep, atau terputus internet)._"
        )


async def send_telegram_message(chat_id: int, text: str, reply_markup: dict = None):
    """Mengirim pesan teks ke Telegram."""
    if not TELEGRAM_BOT_TOKEN:
        logger.warning("TELEGRAM_BOT_TOKEN belum diset.")
        return

    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown"
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            await client.post(f"{TELEGRAM_API_URL}/sendMessage", json=payload)
        except Exception as e:
            logger.error(f"Gagal mengirim pesan Telegram: {e}")


async def send_telegram_video(chat_id: int, video_path: str, caption: str):
    """Mengirim file video ke Telegram."""
    if not TELEGRAM_BOT_TOKEN:
        return

    async with httpx.AsyncClient(timeout=180.0) as client:
        try:
            with open(video_path, "rb") as f:
                files = {"video": (os.path.basename(video_path), f, "video/mp4")}
                data = {
                    "chat_id": chat_id,
                    "caption": caption[:1024],  # Limit caption video Telegram
                    "parse_mode": "Markdown"
                }
                res = await client.post(f"{TELEGRAM_API_URL}/sendVideo", files=files, data=data)
                
                # Jika caption terlalu panjang, kirim sisa teksnya sebagai pesan terpisah
                if len(caption) > 1024:
                    await send_telegram_message(chat_id, caption)
        except Exception as e:
            logger.error(f"Gagal mengirim video Telegram: {e}")
            await send_telegram_message(chat_id, f"❌ Gagal mengirim video: {str(e)}")


def process_video_generation(chat_id: int, user_prompt: str, persona_key: str, engine: str = "moviepy"):
    """Proses pembuatan naskah AI, grafis, dan render video di latar belakang (MoviePy atau Remotion)."""
    task_id = uuid.uuid4().hex[:8]
    temp_overlay = os.path.join(TEMP_DIR, f"overlay_{task_id}.png")
    temp_video = os.path.join(TEMP_DIR, f"reels_{task_id}.mp4")

    try:
        persona_name = PERSONAS.get(persona_key, {}).get("name", persona_key)
        engine_label = "Remotion (React & TS)" if engine == "remotion" else "Default Engine"
        asyncio.run(send_telegram_message(
            chat_id,
            f"⏳ *Sedang meracik naskah & merender video reels...*\n"
            f"📌 Mode: *{persona_name}*\n"
            f"⚙️ Engine: *{engine_label}*\n"
            f"🎯 Topik: *{user_prompt}*\n\n"
            f"Mohon tunggu ~30-45 detik."
        ))

        # 1. Panggil Gemini AI
        script_data = generate_script_data(user_prompt, persona_key=persona_key)

        # 2. Render Video (Remotion atau MoviePy)
        if engine == "remotion":
            from core.remotion_renderer import render_remotion_video, is_remotion_available
            if is_remotion_available():
                render_remotion_video(
                    hook_text=script_data.get("hook_header", "IDE KONTEN TERBARU"),
                    points=script_data.get("points", []),
                    cta_text=script_data.get("cta_footer", "Simpan info penting ini!"),
                    output_mp4_path=temp_video,
                    persona_key=persona_key
                )
            else:
                # Fallback ke MoviePy jika Remotion belum terpasang di lingkungan lokal
                create_overlay_image(
                    hook_text=script_data.get("hook_header", "IDE KONTEN TERBARU"),
                    points=script_data.get("points", []),
                    cta_text=script_data.get("cta_footer", "Simpan info penting ini!"),
                    output_path=temp_overlay,
                    persona_key=persona_key
                )
                render_reels_video(overlay_png_path=temp_overlay, output_mp4_path=temp_video)
        else:
            create_overlay_image(
                hook_text=script_data.get("hook_header", "IDE KONTEN TERBARU"),
                points=script_data.get("points", []),
                cta_text=script_data.get("cta_footer", "Simpan info penting ini!"),
                output_path=temp_overlay,
                persona_key=persona_key
            )
            render_reels_video(overlay_png_path=temp_overlay, output_mp4_path=temp_video)

        # 3. Kirim hasil video & naskah caption lengkap ke pengguna
        caption_text = (
            f"✅ *Video Reels Siap Posting!* ({engine_label})\n"
            f"🏷️ Mode: *{persona_name}*\n\n"
            f"📝 *Salin Teks Caption Ini:*\n\n"
            f"{script_data.get('caption', '')}"
        )
        asyncio.run(send_telegram_video(chat_id, temp_video, caption_text))

    except Exception as e:
        logger.error(f"Gagal membuat video: {e}", exc_info=True)
        asyncio.run(send_telegram_message(chat_id, f"❌ Terjadi kendala saat proses render: {str(e)}"))

    finally:
        # Bersihkan file temp
        for path in (temp_overlay, temp_video):
            if os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass


async def handle_user_command_or_message(chat_id: int, user_id: int, text: str, background_tasks: BackgroundTasks):
    """Memproses pesan atau perintah masuk dari Telegram."""
    global last_screenshot_chat_id, pending_remote_actions
    # Verifikasi ID User jika filter diaktifkan
    if ALLOWED_USER_IDS and user_id not in ALLOWED_USER_IDS:
        await send_telegram_message(chat_id, "⛔ Akses ditolak. Bot ini bersifat privat untuk pemiliknya.")
        return

    text_clean = text.strip()
    lower_text = text_clean.lower()

    # Perintah /start atau /help
    if text_clean.startswith(("/start", "/help")):
        mode_now = user_active_modes.get(user_id, "hajidarimuda")
        mode_name = PERSONAS.get(mode_now, {}).get("name", mode_now)
        msg = (
            f"👋 *Halo! Selamat datang di Content Engine & Laptop Monitor.*\n\n"
            f"Bot ini mengintegrasikan:\n"
            f"1. 🎥 *Otomatisasi Naskah & Video Reels* (`Haji Dari Muda` & `Arye Burhanudin`)\n"
            f"2. 💻 *Windows Task Manager & Remote Control via Telegram* (20 Fitur Lengkap)\n\n"
            f"Brand Mode Aktif: *{mode_name}*\n\n"
            f"⚙️ *Navigasi Cepat:*\n"
            f"• `/panduan` ➔ 📖 *Daftar 20 Tag Lengkap & Fungsinya*\n"
            f"• `/status` ➔ Overview kondisi laptop (Online/Offline, CPU, RAM, Baterai)\n"
            f"• `/screen` ➔ Screenshot layar laptop live detik ini\n"
            f"• `/power` ➔ Kontrol daya laptop (/lock, /sleep, /restart, /shutdown)\n"
            f"• `/mode` ➔ Ganti brand acuan konten\n"
            f"• `/ide <topik>` ➔ Brainstorming ide sudut pandang konten\n"
            f"• `/skrip <topik>` ➔ Naskah Talking Head lengkap (Shot-list visual & B-Roll)\n"
            f"• `/remotion <topik>` ➔ Render video animasi React & TypeScript (Remotion Engine)\n"
            f"• Kirim topik langsung ➔ Merender video reels MP4 vertikal 9:16 + caption!\n\n"
            f"💡 _Ketik `/panduan` untuk melihat seluruh panduan pengecekan hardware & sistem._"
        )
        await send_telegram_message(chat_id, msg)
        return

    # Perintah /remotion <topik> (Render video via Remotion React/TS Engine)
    if text_clean.startswith("/remotion"):
        parts = text_clean.split(maxsplit=1)
        if len(parts) > 1:
            topic = parts[1].strip()
            current_mode = user_active_modes.get(user_id, "hajidarimuda")
            background_tasks.add_task(process_video_generation, chat_id, topic, current_mode, "remotion")
        else:
            await send_telegram_message(
                chat_id,
                "🎬 *Remotion Video Generator (React & TypeScript)*\n\n"
                "Silakan masukkan topik video setelah command.\n"
                "Contoh: `/remotion 3 Arsitektur AI Agent Modern`"
            )
        return

    # 0. Panduan Lengkap Semua Tag Pengecekan
    if text_clean.startswith(("/panduan", "/help_monitoring", "/help_laptop", "/tags")):
        await send_telegram_message(chat_id, get_commands_guide())
        return

    # 1. /status & /laptop (System Overview)
    if text_clean.startswith(("/status", "/laptop")) or any(k in lower_text for k in ["status laptop", "kondisi laptop", "cek laptop"]):
        status_msg = format_status(laptop_telemetry_data)
        await send_telegram_message(chat_id, status_msg)
        return

    # 2. /cpu (CPU Monitoring)
    if text_clean.startswith("/cpu"):
        await send_telegram_message(chat_id, format_cpu(laptop_telemetry_data))
        return

    # 3. /ram (RAM Monitoring)
    if text_clean.startswith("/ram"):
        await send_telegram_message(chat_id, format_ram(laptop_telemetry_data))
        return

    # 4. /disk (Storage Monitoring)
    if text_clean.startswith("/disk"):
        await send_telegram_message(chat_id, format_disk(laptop_telemetry_data))
        return

    # 5. /gpu (GPU Monitoring)
    if text_clean.startswith("/gpu"):
        await send_telegram_message(chat_id, format_gpu(laptop_telemetry_data))
        return

    # 6. /battery (Battery Monitoring)
    if text_clean.startswith("/battery"):
        await send_telegram_message(chat_id, format_battery(laptop_telemetry_data))
        return

    # 7. /temp (Temperature & Fan Monitoring)
    if text_clean.startswith("/temp"):
        await send_telegram_message(chat_id, format_temp(laptop_telemetry_data))
        return

    # 8. /process & /kill (Process Manager)
    if text_clean.startswith("/process"):
        await send_telegram_message(chat_id, format_process(laptop_telemetry_data))
        return

    if text_clean.startswith("/kill"):
        parts = text_clean.split(maxsplit=1)
        if len(parts) > 1:
            target_proc = parts[1].strip()
            pending_remote_actions.append({"action": "kill", "param": target_proc})
            await send_telegram_message(chat_id, f"⏳ Perintah mematikan proses `{target_proc}` telah dikirim ke laptop...")
        else:
            await send_telegram_message(chat_id, "⚠️ Format salah. Contoh: `/kill chrome` atau `/kill notepad.exe`")
        return

    # 9. /startup (Startup Application Monitoring)
    if text_clean.startswith("/startup"):
        await send_telegram_message(chat_id, format_startup(laptop_telemetry_data))
        return

    # 10. /services (Windows Services Monitoring)
    if text_clean.startswith("/services"):
        await send_telegram_message(chat_id, format_services(laptop_telemetry_data))
        return

    # 11. /network (Network Monitoring)
    if text_clean.startswith("/network"):
        await send_telegram_message(chat_id, format_network(laptop_telemetry_data))
        return

    # 12. /security (Security Monitoring)
    if text_clean.startswith("/security"):
        await send_telegram_message(chat_id, format_security(laptop_telemetry_data))
        return

    # 13. /info (System Information)
    if text_clean.startswith("/info"):
        await send_telegram_message(chat_id, format_info(laptop_telemetry_data))
        return

    # 14. /files & /recentfiles (File Storage Monitoring)
    if text_clean.startswith(("/files", "/recentfiles")):
        await send_telegram_message(chat_id, format_files(laptop_telemetry_data))
        return

    # 15. /screen (Screenshot Remote)
    if text_clean.startswith("/screen"):
        last_screenshot_chat_id = chat_id
        pending_remote_actions.append({"action": "screen", "param": ""})
        await send_telegram_message(chat_id, "📸 *Mengambil screenshot layar laptop...*\nGambar akan dikirimkan otomatis ke sini setelah laptop selesai memotret.")
        return

    # 16. /power & Power Controls (/shutdown, /restart, /sleep, /lock)
    if text_clean.startswith("/power"):
        await send_telegram_message(chat_id, format_power_menu())
        return

    if text_clean.startswith(("/lock", "/sleep", "/restart", "/shutdown")):
        cmd = text_clean.split()[0].replace("/", "")
        pending_remote_actions.append({"action": cmd, "param": ""})
        await send_telegram_message(chat_id, f"⚡ Perintah remote daya `/{cmd}` telah dikirimkan ke laptop!")
        return

    # 17. /alerts (Alert System)
    if text_clean.startswith("/alerts"):
        await send_telegram_message(chat_id, format_alerts(laptop_telemetry_data))
        return

    # 18. /hardware (Hardware Detection)
    if text_clean.startswith("/hardware"):
        await send_telegram_message(chat_id, format_hardware(laptop_telemetry_data))
        return

    # 19. /events (Windows Event Log Monitoring)
    if text_clean.startswith("/events"):
        await send_telegram_message(chat_id, format_events(laptop_telemetry_data))
        return

    # 20. /update (Update Monitoring)
    if text_clean.startswith("/update"):
        await send_telegram_message(chat_id, format_update(laptop_telemetry_data))
        return

    # Perintah ganti /mode
    if text_clean.startswith("/mode"):
        parts = text_clean.split(maxsplit=1)
        if len(parts) > 1:
            target_mode = parts[1].strip().lower()
            if target_mode in PERSONAS:
                user_active_modes[user_id] = target_mode
                await send_telegram_message(
                    chat_id,
                    f"✅ Mode berhasil diubah ke: *{PERSONAS[target_mode]['name']}*\n"
                    f"Acuan Dokumen: `{PERSONAS[target_mode].get('guide_file', '')}`\n"
                    f"Deskripsi: _{PERSONAS[target_mode]['description']}_"
                )
                return

        # Tampilkan opsi persona
        modes_text = (
            f"• `/mode hajidarimuda` ➔ Haji Dari Muda (Edukasi Haji/Umrah, Teman Jalan)\n"
            f"• `/mode arye` ➔ Arye Burhanudin (EdTech, Vox Paper-Cutout, Deep Dive)"
        )
        await send_telegram_message(
            chat_id,
            f"🔄 *Pilih Brand Acuan:*\n\n"
            f"{modes_text}\n\n"
            f"Contoh: Ketik `/mode arye` untuk akun pribadi kamu."
        )
        return

    # Perintah /skrip (Naskah Talking Head lengkap dengan shot-list)
    is_asking_for_script = (
        lower_text.startswith("/skrip") or
        lower_text.startswith("/naskah") or
        "talking head" in lower_text or
        "naskah video" in lower_text
    )

    if is_asking_for_script:
        if text_clean.startswith(("/skrip", "/naskah")):
            topic = text_clean.split(maxsplit=1)[1] if len(text_clean.split(maxsplit=1)) > 1 else ""
        else:
            topic = text_clean

        if not topic:
            await send_telegram_message(chat_id, "Silakan masukkan topik naskah.\nContoh: `/skrip Bedah Arsitektur Database Nusuk`")
            return

        persona_key = user_active_modes.get(user_id, "hajidarimuda")
        persona_name = PERSONAS.get(persona_key, {}).get("name", persona_key)

        await send_telegram_message(chat_id, f"📝 *Sedang menyusun naskah Talking Head & Shot-List ({persona_name})...*")
        
        from core.gemini_client import generate_talking_head_script
        script_full = generate_talking_head_script(topic, persona_key=persona_key)
        await send_telegram_message(chat_id, script_full)
        return

    # Perintah /ide atau permintaan ide konten secara natural
    is_asking_for_ideas = (
        lower_text.startswith("/ide") or
        "ide konten" in lower_text or
        lower_text.startswith("minta ide") or
        lower_text.startswith("bagi ide") or
        lower_text.startswith("rekomendasi ide")
    )

    if is_asking_for_ideas:
        if text_clean.startswith("/ide"):
            topic = text_clean[4:].strip()
        else:
            topic = text_clean

        if not topic:
            await send_telegram_message(chat_id, "Silakan masukkan topik yang ingin dicari idenya.\nContoh: `/ide UI UX aplikasi travel`")
            return

        persona_key = user_active_modes.get(user_id, "hajidarimuda")
        persona_name = PERSONAS.get(persona_key, {}).get("name", persona_key)
        
        await send_telegram_message(chat_id, f"💡 *Sedang meracik ide konten sesuai style guide ({persona_name})...*")
        
        from core.gemini_client import generate_content_ideas
        ideas_response = generate_content_ideas(topic, persona_key=persona_key)
        
        reply = (
            f"💡 *Brainstorming Ide Konten ({persona_name})*\n"
            f"🎯 Topik: _{topic}_\n\n"
            f"{ideas_response}\n\n"
            f"───────────────\n"
            f"🎬 *Mau bikin video reelsnya?*\n"
            f"Ketik: `Bikinin video topik: <masukkan judul yang kamu pilih>`\n\n"
            f"📝 *Mau naskah talking head lengkap?*\n"
            f"Ketik: `/skrip <masukkan judul yang kamu pilih>`"
        )
        await send_telegram_message(chat_id, reply)
        return

    # Default / Pembuatan Video Reels Lengkap
    current_mode = user_active_modes.get(user_id, "hajidarimuda")
    background_tasks.add_task(process_video_generation, chat_id, text_clean, current_mode)


@app.get("/")
def health_check():
    """Digunakan oleh UptimeRobot agar Hugging Face Spaces tidak tidur (Keep-alive)."""
    return {
        "status": "ok",
        "app": "Multi-Channel Automated Reels Generator",
        "supported_personas": list(PERSONAS.keys())
    }


@app.post("/api/telemetry")
async def receive_telemetry(request: Request):
    """Menerima ping telemetri berkala (tiap 5 menit) dari laptop_agent.py."""
    token = request.headers.get("X-Telemetry-Token") or request.query_params.get("token")
    if WEBHOOK_SECRET and token != WEBHOOK_SECRET:
        return {"status": "unauthorized"}
    try:
        data = await request.json()
    except Exception:
        return {"status": "invalid json"}

    data["server_received_at"] = time.time()
    global laptop_telemetry_data, pending_remote_actions
    laptop_telemetry_data = data
    logger.info(f"Telemetri laptop diterima: CPU {data.get('cpu')}% | RAM {data.get('ram')}% | Baterai {data.get('battery')}%")
    
    actions_to_send = list(pending_remote_actions)
    pending_remote_actions.clear()
    return {"status": "ok", "message": "Telemetry updated", "pending_actions": actions_to_send}


@app.get("/api/pending_actions")
def get_pending_actions(request: Request):
    """Mengecek antrean perintah remote segera dari bot Telegram."""
    token = request.headers.get("X-Telemetry-Token") or request.query_params.get("token")
    if WEBHOOK_SECRET and token != WEBHOOK_SECRET:
        return {"status": "unauthorized"}
    global pending_remote_actions
    actions_to_send = list(pending_remote_actions)
    pending_remote_actions.clear()
    return {"actions": actions_to_send}


@app.post("/api/upload_screen")
async def upload_screen(request: Request):
    """Menerima screenshot dari laptop dan meneruskannya ke user di Telegram."""
    token = request.headers.get("X-Telemetry-Token") or request.query_params.get("token")
    if WEBHOOK_SECRET and token != WEBHOOK_SECRET:
        return {"status": "unauthorized"}
    global last_screenshot_chat_id
    content = await request.body()
    if last_screenshot_chat_id and content:
        await send_telegram_photo(last_screenshot_chat_id, content, caption="📸 *Tampilan Layar Laptop Terkini*")
        return {"status": "sent"}
    return {"status": "no recipient or empty file"}


@app.get("/api/telemetry")
def get_telemetry():
    """Melihat data telemetri laptop terakhir."""
    return laptop_telemetry_data


@app.post("/webhook")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    """Menerima pesan Telegram via Webhook saat dideploy di Hugging Face."""
    try:
        data = await request.json()
    except Exception:
        return {"status": "invalid json"}

    if "message" in data and "text" in data["message"]:
        chat_id = data["message"]["chat"]["id"]
        user_id = data["message"]["from"]["id"]
        text = data["message"]["text"]
        await handle_user_command_or_message(chat_id, user_id, text, background_tasks)

    return {"status": "success"}


# Runner mode Polling lokal
async def run_local_polling():
    """Menjalankan bot dalam mode Long-Polling di komputer lokal tanpa butuh domain/webhook."""
    logger.info("Memulai bot dalam mode Local Polling...")
    logger.info("Bot siap menerima pesan dari Telegram!")
    
    # Hapus webhook lama agar polling bisa berjalan lancar
    async with httpx.AsyncClient() as client:
        try:
            await client.post(f"{TELEGRAM_API_URL}/deleteWebhook")
        except Exception:
            pass

    offset = 0

    async with httpx.AsyncClient(timeout=45.0) as client:
        while True:
            try:
                res = await client.get(f"{TELEGRAM_API_URL}/getUpdates", params={"offset": offset, "timeout": 30})
                updates = res.json().get("result", [])
                for u in updates:
                    offset = u["update_id"] + 1
                    if "message" in u and "text" in u["message"]:
                        chat_id = u["message"]["chat"]["id"]
                        user_id = u["message"]["from"]["id"]
                        text = u["message"]["text"]
                        
                        current_bg = BackgroundTasks()
                        await handle_user_command_or_message(chat_id, user_id, text, current_bg)
                        for task in current_bg.tasks:
                            asyncio.get_event_loop().run_in_executor(None, task.func, *task.args)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error pada polling loop: {e}")
                await asyncio.sleep(2)


@app.on_event("startup")
async def startup_event():
    """Jalankan polling Telegram secara otomatis jika berjalan di lingkungan lokal."""
    from config import SPACE_HOST
    # Jika tidak di Hugging Face (tidak ada SPACE_HOST), jalankan polling lokal bersama Uvicorn
    if not SPACE_HOST:
        logger.info("Lingkungan Lokal terdeteksi. Menyalakan Background Polling Telegram...")
        asyncio.create_task(run_local_polling())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=False)
