import os
import sys
import uuid
import asyncio
import logging
import datetime
from typing import Dict, List, Optional
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

# Penyimpanan path file audio yang dilampirkan pengguna per chat_id
user_uploaded_audio: Dict[int, str] = {}


async def download_telegram_file(file_id: str, output_path: str) -> bool:
    """Mengunduh file audio/media yang dikirimkan user via Telegram ke storage lokal."""
    if not TELEGRAM_BOT_TOKEN:
        return False
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            res_info = await client.get(f"{TELEGRAM_API_URL}/getFile", params={"file_id": file_id})
            file_data = res_info.json()
            if not file_data.get("ok"):
                logger.error(f"Telegram getFile gagal: {file_data}")
                return False
            file_path = file_data["result"]["file_path"]
            download_url = f"https://api.telegram.org/file/bot{TELEGRAM_BOT_TOKEN}/{file_path}"
            res_dl = await client.get(download_url)
            if res_dl.status_code == 200:
                os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
                with open(output_path, "wb") as f:
                    f.write(res_dl.content)
                logger.info(f"File audio berhasil diunduh ke: {output_path}")
                return True
    except Exception as e:
        logger.error(f"Gagal download file Telegram: {e}")
    return False


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


def chunk_text(text: str, max_size: int = 3800) -> list[str]:
    """Memecah teks panjang menjadi beberapa bagian agar tidak melebihi batas 4096 karakter Telegram."""
    if len(text) <= max_size:
        return [text]

    chunks = []
    lines = text.split("\n")
    current_chunk = ""
    for line in lines:
        if len(current_chunk) + len(line) + 1 > max_size:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
                current_chunk = ""
            while len(line) > max_size:
                chunks.append(line[:max_size])
                line = line[max_size:]
        current_chunk += line + "\n"

    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    return chunks or [text]


async def send_telegram_message(chat_id: int, text: str, reply_markup: dict = None):
    """Mengirim pesan teks ke Telegram dengan pemecahan otomatis (auto-chunk) dan fallback aman."""
    if not TELEGRAM_BOT_TOKEN or not text:
        return

    chunks = chunk_text(text, max_size=3800)

    async with httpx.AsyncClient(timeout=30.0) as client:
        for chunk in chunks:
            payload = {
                "chat_id": chat_id,
                "text": chunk,
                "parse_mode": "Markdown"
            }
            if reply_markup and chunk == chunks[-1]:
                payload["reply_markup"] = reply_markup

            try:
                res = await client.post(f"{TELEGRAM_API_URL}/sendMessage", json=payload)
                # Jika Telegram menolak (400) karena entity Markdown parsing error atau broken tag:
                if res.status_code != 200:
                    logger.warning(f"Telegram parse_mode Markdown gagal ({res.status_code}). Mengirim ulang sebagai plain text...")
                    payload.pop("parse_mode", None)
                    res_fallback = await client.post(f"{TELEGRAM_API_URL}/sendMessage", json=payload)
                    if res_fallback.status_code != 200:
                        logger.error(f"Gagal mengirim fallback Telegram: {res_fallback.text}")
            except Exception as e:
                logger.error(f"Gagal mengirim pesan Telegram: {e}")


def format_progress_bar(percent: int) -> str:
    """Format visual progress bar 10 block."""
    total_blocks = 10
    filled = max(0, min(total_blocks, int(total_blocks * (percent / 100))))
    empty = total_blocks - filled
    return "█" * filled + "░" * empty


def send_telegram_sync(chat_id: int, text: str) -> Optional[int]:
    """Mengirim pesan teks secara sinkron (untuk worker background render) & return message_id."""
    if not TELEGRAM_BOT_TOKEN or not text:
        return None
    try:
        with httpx.Client(timeout=25.0) as client:
            payload = {
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "Markdown"
            }
            res = client.post(f"{TELEGRAM_API_URL}/sendMessage", json=payload)
            if res.status_code != 200:
                payload.pop("parse_mode", None)
                res = client.post(f"{TELEGRAM_API_URL}/sendMessage", json=payload)
            if res.status_code == 200:
                return res.json().get("result", {}).get("message_id")
    except Exception as e:
        logger.error(f"Gagal send_telegram_sync: {e}")
    return None


def edit_telegram_sync(chat_id: int, message_id: int, text: str):
    """Mengedit pesan teks secara sinkron untuk update live progress bar."""
    if not TELEGRAM_BOT_TOKEN or not message_id or not text:
        return
    try:
        with httpx.Client(timeout=25.0) as client:
            payload = {
                "chat_id": chat_id,
                "message_id": message_id,
                "text": text,
                "parse_mode": "Markdown"
            }
            res = client.post(f"{TELEGRAM_API_URL}/editMessageText", json=payload)
            if res.status_code != 200:
                payload.pop("parse_mode", None)
                client.post(f"{TELEGRAM_API_URL}/editMessageText", json=payload)
    except Exception as e:
        logger.warning(f"Gagal edit_telegram_sync: {e}")


def send_telegram_video_sync(chat_id: int, video_path: str, caption: str):
    """Mengirim video secara sinkron untuk worker background render."""
    if not TELEGRAM_BOT_TOKEN:
        return
    try:
        with httpx.Client(timeout=180.0) as client:
            with open(video_path, "rb") as f:
                files = {"video": (os.path.basename(video_path), f, "video/mp4")}
                data = {
                    "chat_id": chat_id,
                    "caption": caption[:1024],
                    "parse_mode": "Markdown"
                }
                res = client.post(f"{TELEGRAM_API_URL}/sendVideo", files=files, data=data)
                if res.status_code != 200:
                    data.pop("parse_mode", None)
                    res = client.post(f"{TELEGRAM_API_URL}/sendVideo", files=files, data=data)
                if len(caption) > 1024:
                    send_telegram_sync(chat_id, caption)
    except Exception as e:
        logger.error(f"Gagal send_telegram_video_sync: {e}")
        send_telegram_sync(chat_id, f"❌ Gagal mengirim video: {str(e)}")


async def send_telegram_video(chat_id: int, video_path: str, caption: str):
    """Mengirim file video ke Telegram secara async."""
    send_telegram_video_sync(chat_id, video_path, caption)


def process_video_generation(chat_id: int, user_prompt: str, persona_key: str = "auto", engine: str = "remotion"):
    """
    Proses pembuatan video otomatis dengan live percentage progress bar di Telegram.
    Mendukung Remotion React 60 FPS, kustomisasi durasi (contoh: 8 detik),
    rasio (16:9, 1:1, 9:16), dan deteksi topik fleksibel tanpa kaku memaksakan brand.
    """
    import re
    global last_render_error
    task_id = uuid.uuid4().hex[:8]
    temp_overlay = os.path.join(TEMP_DIR, f"overlay_{task_id}.png")
    temp_video = os.path.join(TEMP_DIR, f"video_{task_id}.mp4")
    progress_msg_id = None

    try:
        lower_prompt = user_prompt.lower()

        # Deteksi Durasi yang diminta pengguna (misal: "8 detik", "15 sec")
        duration_match = re.search(r'(\d+)\s*(?:detik|sec|second)', lower_prompt)
        default_dur = 8 if (persona_key in ["remotion", "tech_vector", "vector"] or "remotion" in lower_prompt) else 12
        target_duration = int(duration_match.group(1)) if duration_match else default_dur
        target_duration = max(5, min(60, target_duration))

        # Deteksi permintaan Alpha Channel transparan
        is_alpha_channel = any(k in lower_prompt for k in ["alpha", "transparan", "transparent"])

        # Deteksi Aspect Ratio (Mendukung ejaan Inggris & Indonesia: lanskap, lebar, tidur)
        if any(k in lower_prompt for k in ["lanskap", "landscape", "horizontal", "16:9", "lebar", "tidur", "youtube", "desktop"]):
            aspect_ratio = "landscape"
            ratio_label = "16:9 Landscape"
        elif any(k in lower_prompt for k in ["square", "1:1", "kotak", "feed", "persegi"]):
            aspect_ratio = "square"
            ratio_label = "1:1 Square"
        elif any(k in lower_prompt for k in ["potret", "portrait", "vertical", "tegak", "9:16", "reels", "tiktok", "shorts"]):
            aspect_ratio = "portrait"
            ratio_label = "9:16 Portrait"
        else:
            # Default aspect ratio berdasarkan mode/persona:
            if persona_key in ["remotion", "tech_vector", "vector"]:
                aspect_ratio = "landscape"  # Microstock default ke 16:9 Landscape
                ratio_label = "16:9 Landscape"
            else:
                aspect_ratio = "portrait"   # Sosmed (Arye & Haji) default ke 9:16 Portrait
                ratio_label = "9:16 Portrait"

        # Tentukan persona yang tepat sesuai instruksi mode:
        if persona_key in ["arye", "personal"]:
            resolved_persona = "arye"
        elif persona_key in ["haji", "hajidarimuda"]:
            resolved_persona = "hajidarimuda"
        elif persona_key in ["remotion", "tech_vector", "vector"]:
            resolved_persona = "tech_vector"
        else:
            is_haji = any(k in lower_prompt for k in ["haji", "umrah", "tawaf", "mina", "mekkah", "makkah", "madinah", "ka'bah"])
            is_tech = any(k in lower_prompt for k in [
                "ram", "cpu", "gpu", "3d", "vektor", "vector", "hardware", "laptop", "pc",
                "tech", "teknologi", "coding", "software", "ai", "cloud", "server", "chip"
            ])
            if is_haji:
                resolved_persona = "hajidarimuda"
            elif any(k in lower_prompt for k in ["papercut", "paper cut", "daviqin", "berhala", "sajadah", "ali", "arye"]):
                resolved_persona = "arye"
            elif any(k in lower_prompt for k in ["microstock", "stock", "shutterstock", "adobe stock"]):
                resolved_persona = "tech_vector"
            else:
                resolved_persona = "arye" if is_tech else "tech_vector"

        # Tahap 1: 10% (Kirim pesan progres awal)
        init_text = (
            f"🎬 *Sedang Memproses Video Animasi...*\n"
            f"`[{format_progress_bar(10)}]` *10%*\n\n"
            f"📍 *Status:* Menganalisis request & target durasi...\n"
            f"⚙️ *Engine:* Remotion React ({ratio_label})\n"
            f"⏱️ *Durasi Target:* {target_duration} Detik\n"
            f"🎯 *Topik:* _{user_prompt}_"
        )
        progress_msg_id = send_telegram_sync(chat_id, init_text)

        # Tahap 2: 35% (Panggil Gemini AI / Analisis Konsep)
        if progress_msg_id:
            edit_telegram_sync(
                chat_id, progress_msg_id,
                f"🤖 *Merancang Konsep Visual & Komposisi...*\n"
                f"`[{format_progress_bar(35)}]` *35%*\n\n"
                f"📍 *Status:* Memproses spesifikasi frame & aset animasi visual...\n"
                f"⚙️ *Engine:* Remotion React ({ratio_label})\n"
                f"⏱️ *Durasi Target:* {target_duration} Detik\n"
                f"🎯 *Topik:* _{user_prompt}_"
            )

        script_data = generate_script_data(user_prompt, persona_key=resolved_persona)
        brand_badge = script_data.get("brand_badge", "⚡ 3D TECH • HARDWARE VECTOR")
        persona_used = script_data.get("persona_used", resolved_persona)
        actual_duration = script_data.get("duration_sec", target_duration)
        is_clean_footage = script_data.get("is_clean_footage", False)

        # Tahap 3: 55% (Menyiapkan Komposisi Remotion)
        stage_desc = "Menyiapkan aset 3D hardware & jalur sirkuit..." if is_clean_footage else "Naskah AI siap! Mengompilasi komponen grafis Remotion..."
        if progress_msg_id:
            edit_telegram_sync(
                chat_id, progress_msg_id,
                f"🎨 *Menyiapkan Komposisi Grafis React...*\n"
                f"`[{format_progress_bar(55)}]` *55%*\n\n"
                f"📍 *Status:* {stage_desc}\n"
                f"🏷️ *Tipe:* *{'Footage B-Roll Bersih' if is_clean_footage else brand_badge}*\n"
                f"⚙️ *Format:* Remotion React ({ratio_label})\n"
                f"⏱️ *Durasi:* {actual_duration} Detik"
            )

        # Tahap 4: 75% (Merender Remotion 60 FPS)
        if progress_msg_id:
            edit_telegram_sync(
                chat_id, progress_msg_id,
                f"🎬 *Merender Frame Video Remotion (60 FPS)...*\n"
                f"`[{format_progress_bar(75)}]` *75%*\n\n"
                f"📍 *Status:* Engine Remotion sedang me-render aset visual 3D/vektor...\n"
                f"🏷️ *Tipe:* *{'Footage B-Roll Bersih' if is_clean_footage else brand_badge}*\n"
                f"⚙️ *Format:* Remotion React ({ratio_label})\n"
                f"⏱️ *Durasi:* {actual_duration} Detik"
            )

        from core.remotion_renderer import render_remotion_video, is_remotion_available
        style_variant = script_data.get("style_variant", "regular")
        user_audio = user_uploaded_audio.get(chat_id, "")

        remotion_success = False
        if engine == "remotion" and is_remotion_available():
            try:
                render_remotion_video(
                    hook_text=script_data.get("hook_header", ""),
                    points=script_data.get("points", []),
                    cta_text=script_data.get("cta_footer", ""),
                    output_mp4_path=temp_video,
                    persona_key=persona_used,
                    aspect_ratio=aspect_ratio,
                    brand_badge=brand_badge,
                    duration_sec=actual_duration,
                    is_clean_footage=is_clean_footage,
                    is_alpha_channel=is_alpha_channel,
                    style_variant=style_variant,
                    audio_path=user_audio
                )
                remotion_success = True
            except Exception as rem_err:
                import traceback
                last_render_error = {
                    "time": time.time(),
                    "error": str(rem_err),
                    "traceback": traceback.format_exc()
                }
                logger.warning(f"Remotion render mengalami kendala ({rem_err}). Mengaktifkan fallback graphic engine...", exc_info=True)
                remotion_success = False

        if not remotion_success:
            create_overlay_image(
                hook_text="" if is_clean_footage else script_data.get("hook_header", "IDE KONTEN TERBARU"),
                points=[] if is_clean_footage else script_data.get("points", []),
                cta_text="" if is_clean_footage else script_data.get("cta_footer", "Simpan info penting ini!"),
                output_path=temp_overlay,
                persona_key=persona_used
            )
            render_reels_video(overlay_png_path=temp_overlay, output_mp4_path=temp_video)

        # Tahap 5: 95% (Finalisasi MP4 & Uploading)
        if progress_msg_id:
            edit_telegram_sync(
                chat_id, progress_msg_id,
                f"🚀 *Finalisasi Video & Mengunggah ke Telegram...*\n"
                f"`[{format_progress_bar(95)}]` *95%*\n\n"
                f"📍 *Status:* Encoding video MP4 selesai! Sedang mengunggah media...\n"
                f"🏷️ *Tipe:* *{'Footage B-Roll Bersih' if is_clean_footage else brand_badge}*\n"
                f"⏱️ *Durasi:* {actual_duration} Detik"
            )

        is_microstock = script_data.get("is_microstock", False) or is_clean_footage
        if is_microstock:
            stock_meta = script_data.get("microstock_meta", {})
            tags_display = script_data.get("tags") or ", ".join(stock_meta.get("tags", []))
            title_en = stock_meta.get("title_en", f"3D Vector Graphics - {user_prompt}")
            caption_text = (
                f"🎬 *Footage Animasi Remotion Siap! (Microstock Stock Asset)*\n"
                f"━━━━━━━━━━━━━━━━━━━\n"
                f"🏷️ *Title:* `{title_en}`\n"
                f"📐 Format: *{ratio_label}* (60 FPS)\n"
                f"⏱️ Durasi: *{actual_duration} Detik*\n"
                f"✨ Tipe: *Alpha Channel / Clean B-Roll*\n\n"
                f"📋 *30 Microstock Keywords / Tags (Siap Copy-Paste):*\n"
                f"`{tags_display}`\n\n"
                f"💡 _Visual murni tanpa kartu teks / watermark sosmed. Siap diunggah ke Shutterstock, Adobe Stock, Pond5, atau Envato._"
            )
        else:
            style_name = "Style Paper Cut (Daviqin)" if style_variant == "papercut" else "Style Regular (Cinematic BRoll)"
            caption_text = (
                f"✅ *Video Animasi Siap Diposting!*\n"
                f"━━━━━━━━━━━━━━━━━━━\n"
                f"🏷️ Kategori: *{brand_badge}*\n"
                f"🎨 Style: *{style_name}*\n"
                f"⏱️ Durasi: *{actual_duration} Detik* | Format: *{ratio_label}*\n\n"
                f"📝 *Salin Teks Caption Sosmed Ini:*\n\n"
                f"{script_data.get('caption', '')}"
            )
        send_telegram_video_sync(chat_id, temp_video, caption_text)

        # Tahap 6: 100% (Selesai!)
        if progress_msg_id:
            status_done = "Footage Video MP4 Siap Digunakan (100%)!" if is_clean_footage else "Video Selesai Dibuat (100%)!"
            edit_telegram_sync(
                chat_id, progress_msg_id,
                f"✅ *{status_done}*\n"
                f"`[{format_progress_bar(100)}]` *100%*\n\n"
                f"🏷️ *Tipe:* *{'Footage B-Roll Bersih' if is_clean_footage else brand_badge}*\n"
                f"⚙️ *Engine:* Remotion React ({ratio_label})\n"
                f"⏱️ *Durasi:* {actual_duration} Detik\n"
                f"📁 *File video telah dikirimkan di bawah 👇*"
            )

    except Exception as e:
        import traceback
        err_str = str(e)
        last_render_error = {
            "time": time.time(),
            "error": err_str,
            "traceback": traceback.format_exc()
        }
        logger.error(f"Gagal membuat video: {err_str}", exc_info=True)
        if "timed out" in err_str.lower():
            friendly_err = (
                "⚠️ *Proses Render Melewati Batas Waktu (Timeout)*\n"
                "━━━━━━━━━━━━━━━━━━━\n"
                "Server cloud sedang menangani antrean beban komputasi tinggi.\n\n"
                "💡 *Tips Cepat Berhasil:*\n"
                "• Coba gunakan durasi lebih ringkas (contoh: 6 atau 8 detik)\n"
                "• Atau gunakan rasio potret sosmed: `/render 9:16 potret topik: ...`"
            )
        else:
            friendly_err = (
                "⚠️ *Gagal Memproses Video*\n"
                "━━━━━━━━━━━━━━━━━━━\n"
                f"📍 *Penyebab:* `{err_str[:250]}`\n\n"
                "💡 *Saran:* Silakan coba topik video lain atau periksa konfigurasi render."
            )
        if progress_msg_id:
            edit_telegram_sync(chat_id, progress_msg_id, friendly_err)
        else:
            send_telegram_sync(chat_id, friendly_err)

    finally:
        for path in (temp_overlay, temp_video):
            if os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass


async def send_video_validation_card(chat_id: int, user_id: int, detected_topic: str = ""):
    """Mengirim kartu konfirmasi & validasi spesifikasi video sebelum render."""
    mode_now = user_active_modes.get(user_id, "remotion")
    mode_name = PERSONAS.get(mode_now, {}).get("name", mode_now)
    
    audio_info = f"✅ Ada ({os.path.basename(user_uploaded_audio[chat_id])})" if chat_id in user_uploaded_audio else "❌ Belum ada (Kirim file MP3/Voice Note ke chat ini jika ingin audio khusus)"
    topic_header = f"🎯 *Topik Terdeteksi:* _{detected_topic}_\n\n" if detected_topic else ""

    card = (
        f"🎬 *KONFIRMASI & SPESIFIKASI VIDEO*\n"
        f"━━━━━━━━━━━━━━━━━━━\n"
        f"{topic_header}"
        f"🎯 Mode Aktif: *{mode_name}*\n"
        f"🎵 Audio Terlampir: _{audio_info}_\n\n"
        f"Agar video yang dihasilkan presisi dan tidak salah format, tentukan spesifikasinya:\n\n"
        f"📐 *1. Ukuran & Aspek Rasio:*\n"
        f"• `16:9` ➔ Lanskap (Microstock Stock Footage / YouTube / Desktop)\n"
        f"• `9:16` ➔ Potret (Reels Instagram / TikTok / Shorts Sosmed)\n"
        f"• `1:1` ➔ Kotak (Instagram Feed / LinkedIn)\n\n"
        f"🎨 *2. Pilihan Style Video:*\n"
        f"• *Mode Arye:* `regular` (Cinematic BRoll ala 2-BerhalaKaumNuh, 3-SajadahSyirik, 4-MisiKpdAli) atau `papercut` (Daviqin Vox Style ala 6-DaviqinVid1: kraft paper, cutting grid, tape, stamp, 12fps wiggle)\n"
        f"• *Mode Haji:* Minimalis Brand (Aksen Merah #DC2626 & Elemen Teks Bersih)\n"
        f"• *Mode Remotion:* Microstock Asset 3D + 30 Tags SEO (Tanpa Caption Sosmed) + Alpha Channel\n\n"
        f"📝 *3. Kebutuhan Caption:*\n"
        f"• *Sosmed (Arye & Haji):* Disertai naskah caption lengkap + hashtag relevan\n"
        f"• *Microstock (Remotion):* TANPA Caption! Alih-alih caption, bot menyertakan 25-30 SEO Keywords/Tags siap copy-paste\n\n"
        f"🚀 *Cara Render Cepat:*\n"
        f"`/render <rasio> <style> topik: <topik Anda>`\n\n"
        f"💡 *Contoh:*\n"
        f"1. `/render 16:9 lanskap papercut topik: Arsitektur Cloud VPS`\n"
        f"2. `/render 9:16 potret regular topik: Sejarah Berhala Kaum Nuh`\n"
        f"3. `/render 9:16 potret topik: 5 Tips Istithaah Haji Usia Muda`\n"
        f"4. `/render 16:9 lanskap microstock topik: 3D Vector Dual RAM DDR5`"
    )
    await send_telegram_message(chat_id, card)


async def handle_user_command_or_message(chat_id: int, user_id: int, text: str, background_tasks: BackgroundTasks, message_data: dict = None):
    """Memproses pesan atau perintah masuk dari Telegram."""
    global last_screenshot_chat_id, pending_remote_actions, user_uploaded_audio
    # Verifikasi ID User jika filter diaktifkan
    if ALLOWED_USER_IDS and user_id not in ALLOWED_USER_IDS:
        await send_telegram_message(chat_id, "⛔ Akses ditolak. Bot ini bersifat privat untuk pemiliknya.")
        return

    # Deteksi jika ada lampiran Audio (MP3, Voice Note, dsb)
    if message_data:
        audio_obj = message_data.get("audio") or message_data.get("voice")
        if not audio_obj and message_data.get("document"):
            doc = message_data.get("document", {})
            mime = doc.get("mime_type", "")
            fn = doc.get("file_name", "").lower()
            if "audio" in mime or fn.endswith((".mp3", ".wav", ".m4a", ".aac", ".ogg")):
                audio_obj = doc

        if audio_obj:
            file_id = audio_obj.get("file_id")
            file_name = audio_obj.get("file_name", "audio_input.mp3")
            save_path = os.path.join(TEMP_DIR, f"audio_{chat_id}_{file_name}")
            await send_telegram_message(chat_id, "⏳ *Mengunduh file audio Anda...*")
            success = await download_telegram_file(file_id, save_path)
            if success:
                user_uploaded_audio[chat_id] = save_path
                await send_telegram_message(
                    chat_id,
                    f"🎵 *File Audio Berhasil Disimpan!*\n"
                    f"Nama: `{file_name}`\n\n"
                    f"Audio ini akan otomatis digabungkan sebagai latar video saat Anda me-render.\n\n"
                    f"Silakan tentukan video yang ingin dibuat:\n"
                    f"• `/render 16:9 lanskap papercut topik: [Topik]`\n"
                    f"• `/render 9:16 potret regular topik: [Topik]`\n"
                    f"• Atau balas chat ini dengan instruksi video yang Anda inginkan!"
                )
                caption = message_data.get("caption", "").strip()
                if not caption:
                    return
                text = caption

    text_clean = text.strip()
    if not text_clean:
        return
    lower_text = text_clean.lower()

    # Perintah /start atau /help
    if text_clean.startswith(("/start", "/help")):
        mode_now = user_active_modes.get(user_id, "remotion")
        mode_name = PERSONAS.get(mode_now, {}).get("name", mode_now)
        msg = (
            f"👋 *Halo! Selamat datang di Content Engine & Laptop Monitor.*\n\n"
            f"Bot ini mengintegrasikan:\n"
            f"1. 🎥 *Video & Content Engine* (Remotion Microstock, Arye Burhanudin, Haji Dari Muda)\n"
            f"2. 💻 *Windows Remote Monitor & Control* (20 Fitur Lengkap Real-time)\n\n"
            f"🎯 Mode Aktif: *{mode_name}*\n\n"
            f"⚙️ *Navigasi Perintah:*\n"
            f"• `/mode` ➔ Ganti mode bot (`/mode remotion`, `/mode arye`, `/mode haji`)\n"
            f"• `/render` ➔ Menu konfirmasi & spesifikasi pembuatan video (rasio, style, audio)\n"
            f"• `/ide <topik>` ➔ Brainstorming ide sudut pandang konten\n"
            f"• `/skrip <topik>` ➔ Naskah Talking Head lengkap (Shot-list & B-Roll)\n"
            f"• `/panduan` ➔ 📖 Daftar 20 tag monitoring & remote laptop\n"
            f"• `/status` | `/cpu` | `/ram` | `/screen` ➔ Cek kondisi & jepret layar laptop\n\n"
            f"💡 *Tanya Bebas Kapan Saja:* Anda bisa bertanya apa pun, berdiskusi sistem, tanya arsitektur, fiqih, atau ide konten secara bebas. Bot akan menjawab cerdas dan tidak kaku!"
        )
        await send_telegram_message(chat_id, msg)
        return

    # Perintah /render atau /video (Validasi dan eksekusi render video)
    if text_clean.startswith(("/render", "/video", "/bikin_video")):
        user_curr_mode = user_active_modes.get(user_id, "remotion")
        default_persona = "arye" if user_curr_mode in ["arye", "personal"] else ("hajidarimuda" if user_curr_mode in ["haji", "hajidarimuda"] else "tech_vector")
        parts = text_clean.split(maxsplit=1)
        if len(parts) > 1 and len(parts[1].strip()) > 3:
            req_text = parts[1].strip()
            # Cek apakah user sudah memberikan spesifikasi (rasio/style/topik:)
            has_spec = any(k in req_text.lower() for k in [
                "16:9", "9:16", "1:1", "lanskap", "landscape", "potret", "portrait", "kotak", "square",
                "papercut", "paper cut", "daviqin", "regular", "microstock", "stock", "clean", "topik:"
            ])
            if has_spec:
                background_tasks.add_task(process_video_generation, chat_id, req_text, default_persona, "remotion")
                return
            else:
                await send_video_validation_card(chat_id, user_id, detected_topic=req_text)
                return

        # Jika tanpa parameter: tampilkan kartu validasi & panduan
        await send_video_validation_card(chat_id, user_id)
        return

    # Perintah /remotion <topik> (Render video via Remotion Microstock/3D Vector Engine)
    if text_clean.startswith("/remotion"):
        parts = text_clean.split(maxsplit=1)
        if len(parts) > 1:
            topic = parts[1].strip()
            background_tasks.add_task(process_video_generation, chat_id, topic, "tech_vector", "remotion")
        else:
            await send_telegram_message(
                chat_id,
                f"🎬 *Remotion Microstock & 3D Vector Engine*\n"
                f"━━━━━━━━━━━━━━━━━━━\n"
                f"Mode ini menghasilkan visual footage murni untuk Microstock (Shutterstock, Adobe Stock, Pond5) "
                f"tanpa caption sosmed, dilengkapi **30 Keywords/Tags SEO** siap copy-paste, serta dukungan Alpha Channel.\n\n"
                f"Silakan ketik request Anda:\n"
                f"Contoh: `/remotion 16:9 lanskap 10 detik footage ram ddr5 3d vector`"
            )
        return

    # Perintah /veo <topik> (Google Veo 3.1 Video AI Engine)
    if text_clean.startswith(("/veo", "/video_ai")):
        parts = text_clean.split(maxsplit=1)
        if len(parts) > 1:
            topic = parts[1].strip()
            background_tasks.add_task(process_video_generation, chat_id, topic, "tech_vector", "remotion")
        else:
            await send_telegram_message(
                chat_id,
                "🎬 *Google Veo 3.1 AI Video*\n\n"
                "Masukkan prompt video. Contoh:\n"
                "`/veo 8 detik footage ram animasi 3d vektor lanskap`"
            )
        return

    # Perintah /haji <topik> (Edukasi Haji Dari Muda)
    if text_clean.startswith("/haji"):
        parts = text_clean.split(maxsplit=1)
        if len(parts) > 1:
            topic = parts[1].strip()
            background_tasks.add_task(process_video_generation, chat_id, topic, "hajidarimuda", "remotion")
        else:
            await send_telegram_message(
                chat_id,
                f"🕋 *Haji Dari Muda Content & Video Engine*\n"
                f"━━━━━━━━━━━━━━━━━━━\n"
                f"Menghasilkan video dan naskah edukasi haji/umrah muda ('Teman Jalan') "
                f"dengan visual minimalis elegan, aksen merah brand, dan tipografi bersih.\n\n"
                f"Ketik request Anda:\n"
                f"Contoh: `/haji 9:16 potret topik: 5 Tips Nabung Porsi Haji Sejak Kuliah`"
            )
        return

    # Perintah /arye <topik> (Arye Burhanudin Deep Dive Tech)
    if text_clean.startswith("/arye"):
        parts = text_clean.split(maxsplit=1)
        if len(parts) > 1:
            topic = parts[1].strip()
            background_tasks.add_task(process_video_generation, chat_id, topic, "arye", "remotion")
        else:
            await send_telegram_message(
                chat_id,
                f"🎙️ *Arye Burhanudin Content & Video Engine*\n"
                f"━━━━━━━━━━━━━━━━━━━\n"
                f"Pilihan Style Video:\n"
                f"1. *Style Biasa (BRoll Cinematic)* ➔ Mengacu `2-BerhalaKaumNuh`, `3-SajadahSyirik`, `4-MisiKpdAli`\n"
                f"2. *Style Paper Cut (Daviqin Template)* ➔ Mengacu `6-DaviqinVid1` (Paper texture, cutting mat grid, scotch tape, rubber stamp, 12fps wiggle)\n\n"
                f"Ketik request Anda:\n"
                f"Contoh:\n"
                f"• `/arye 16:9 lanskap papercut topik: Bedah Arsitektur Microservices`\n"
                f"• `/arye 9:16 potret regular topik: Kenapa RAM 16GB Terasa Kurang`"
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
            last_screenshot_chat_id = chat_id
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
        last_screenshot_chat_id = chat_id
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
            f"1️⃣ `/mode haji` ➔ *Haji Dari Muda*\n"
            f"   • Konten edukasi Haji/Umrah (Teman Jalan, Hadits/Doa, Naskah + Caption IG)\n\n"
            f"2️⃣ `/mode arye` ➔ *Arye Burhanudin*\n"
            f"   • Deep dive edutech & sistem (Vox Cutout, arsitektur, naskah H-C-B-C)\n\n"
            f"3️⃣ `/mode remotion` ➔ *Remotion Motion Graphics*\n"
            f"   • Animasi grafis/hardware (Footage B-Roll bersih / Infografis, 16:9 Lanskap, 1:1, 9:16)\n\n"
            f"4️⃣ `/mode veo` ➔ *Google Veo 3.1 AI Video*\n"
            f"   • Generative Cinematic AI Video dari prompt teks"
        )
        await send_telegram_message(
            chat_id,
            f"🔄 *Pilih Mode Kerja Bot:*\n\n"
            f"{modes_text}\n\n"
            f"💡 _Contoh: Ketik `/mode remotion` untuk fokus bikin footage animasi grafis._"
        )
        return

    # Ambil mode aktif pengguna (default: remotion agar tidak memaksakan brand haji)
    user_curr_mode = user_active_modes.get(user_id, "remotion")
    if user_curr_mode in ["haji", "hajidarimuda"]:
        default_persona = "hajidarimuda"
    elif user_curr_mode in ["arye", "personal"]:
        default_persona = "arye"
    else:
        default_persona = "tech_vector"

    # Deteksi apakah pesan merupakan PERTANYAAN, DISKUSI, ATAU KENDALA URGENT
    question_indicators = [
        "kenapa", "mengapa", "gimana", "bagaimana", "apa ", "apakah", "apaan",
        "tolong jelaskan", "jelasin", "jelaskan", "solusi", "urgent", "error", "rusak",
        "kenapakah", "maksudnya", "artinya", "bedanya", "perbedaan", "review",
        "menurutmu", "menurut kamu", "bisa bantu", "tanya", "konsultasi", "diskusi"
    ]
    is_question_or_urgent = (
        any(q in lower_text for q in question_indicators) or
        "?" in text_clean or
        lower_text.startswith(("kenapa", "bagaimana", "gimana", "apa", "apakah", "tolong", "siapa", "kapan", "dimana", "mengapa"))
    )

    # 1. Deteksi Permintaan Video Animasi (Hanya jika BUKAN pertanyaan/urgent)
    video_triggers = [
        "bikin video", "bikinin video", "buatkan video", "buat video", "generate video",
        "render video", "bikin animasi", "buatin animasi", "animasi 3d",
        "animasi vektor", "bikin reels", "bikinin reels", "buat reels", "render reels",
        "generate footage", "render footage"
    ]
    is_video_request = (not is_question_or_urgent) and any(k in lower_text for k in video_triggers)

    if is_video_request:
        # Cek apakah permintaan sudah memiliki spesifikasi lengkap (rasio / style / topik spesifik)
        has_spec = any(k in lower_text for k in [
            "16:9", "9:16", "1:1", "lanskap", "landscape", "potret", "portrait", "kotak", "square",
            "papercut", "paper cut", "daviqin", "regular", "microstock", "stock", "clean", "topik:"
        ])
        if has_spec:
            background_tasks.add_task(process_video_generation, chat_id, text_clean, default_persona, "remotion")
            return
        else:
            # Jika user hanya meminta video secara umum tanpa spesifikasi format/style,
            # berikan kartu konfirmasi & validasi feedback terlebih dahulu
            topic_hint = text_clean
            for vt in video_triggers:
                topic_hint = topic_hint.replace(vt, "")
            topic_hint = topic_hint.strip()
            await send_video_validation_card(chat_id, user_id, detected_topic=topic_hint)
            return

    # 2. Deteksi Permintaan Ide / Brainstorming
    idea_triggers = [
        "/ide", "cari ide", "cariin ide", "minta ide", "kasih ide",
        "ide konten", "brainstorm", "topik konten", "judul konten", "rekomendasi ide"
    ]
    is_asking_for_ideas = any(k in lower_text for k in idea_triggers)

    if is_asking_for_ideas:
        if text_clean.startswith("/ide"):
            topic = text_clean[4:].strip()
        else:
            topic = text_clean

        if not topic:
            await send_telegram_message(chat_id, "Silakan masukkan topik yang ingin dicari idenya.\nContoh: `ide konten tentang arsitektur ram modern`")
            return

        await send_telegram_message(chat_id, "💡 *Sedang meracik ide konten kreatif dengan AI...*")
        from core.gemini_client import generate_content_ideas
        ideas_response = generate_content_ideas(topic, persona_key=default_persona)
        
        reply = (
            f"💡 *Brainstorming Ide Konten*\n"
            f"🎯 Topik: _{topic}_\n\n"
            f"{ideas_response}\n\n"
            f"───────────────\n"
            f"🎬 *Mau bikin videonya langsung?*\n"
            f"Ketik: `/render 16:9 lanskap papercut topik: {topic}`\n\n"
            f"📝 *Mau naskah talking head lengkap?*\n"
            f"Ketik: `/skrip {topic}`"
        )
        await send_telegram_message(chat_id, reply)
        return

    # 3. Permintaan Naskah / Skrip Talking Head
    script_triggers = [
        "/skrip", "/naskah", "talking head", "naskah video", "skrip video",
        "buat naskah", "bikin naskah", "tulis naskah", "bikinin naskah",
        "bikinin skrip", "buat skrip", "tulis skrip"
    ]
    is_asking_for_script = any(k in lower_text for k in script_triggers)

    if is_asking_for_script:
        if text_clean.startswith(("/skrip", "/naskah")):
            parts = text_clean.split(maxsplit=1)
            topic = parts[1].strip() if len(parts) > 1 else ""
        else:
            topic = text_clean

        if not topic:
            await send_telegram_message(chat_id, "Silakan masukkan topik naskah.\nContoh: `/skrip Bedah Arsitektur Database Nusuk`")
            return

        await send_telegram_message(chat_id, "📝 *Sedang menyusun naskah Talking Head & Shot-List dengan AI...*")
        from core.gemini_client import generate_talking_head_script
        script_full = generate_talking_head_script(topic, persona_key=default_persona)
        await send_telegram_message(chat_id, script_full)
        return

    # 4. CHAT CERDAS & TANYA JAWAB DENGAN GEMINI AI (Fallback Cerdas, Tidak Kaku!)
    # Jika user mempertanyakan sesuatu yang tidak diketahui, urgent, diskusi ide/konsep, atau ngobrol:
    # Jawab secara cerdas dan kontekstual, JANGAN langsung auto-render video!
    await send_telegram_message(chat_id, "🤔 *Sedang menganalisis & menyusun jawaban...*")
    from core.gemini_client import chat_with_gemini
    ai_answer = chat_with_gemini(text_clean, persona_key=user_curr_mode)
    await send_telegram_message(chat_id, ai_answer)
    return


last_render_error = {}


@app.get("/")
def health_check():
    """Digunakan oleh UptimeRobot agar Hugging Face Spaces tidak tidur (Keep-alive)."""
    return {
        "status": "ok",
        "app": "Multi-Channel Automated Reels Generator",
        "build_version": "v1.9-verbose-diag",
        "supported_personas": list(PERSONAS.keys())
    }


@app.get("/api/last_error")
def get_last_error():
    """Melihat log error render terakhir untuk diagnosa teknis."""
    return last_render_error


@app.get("/api/test_remotion")
def test_remotion():
    """Menjalankan render uji coba 1-frame Remotion di server untuk diagnosa teknis langsung."""
    from core.remotion_renderer import render_remotion_video
    try:
        test_out = os.path.join(TEMP_DIR, "test_render_api.mp4")
        res = render_remotion_video(
            hook_text="PROSESOR CPU 3D",
            points=["Transistor 3nm", "Arsitektur Efisien"],
            cta_text="",
            output_mp4_path=test_out,
            persona_key="tech_vector",
            aspect_ratio="landscape",
            duration_sec=1,
            is_clean_footage=True,
            is_alpha_channel=True,
            timeout=90
        )
        return {
            "status": "ok",
            "message": "Render Remotion berhasil!",
            "file": res,
            "exists": os.path.exists(res),
            "size": os.path.getsize(res) if os.path.exists(res) else 0
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }


@app.get("/api/diag")
def get_diag():
    """Diagnosa kondisi browser Chromium dan file sistem di server cloud."""
    import shutil, subprocess
    res = {}
    res["has_usr_bin_chromium"] = os.path.exists("/usr/bin/chromium")
    res["which_chromium"] = shutil.which("chromium")
    res["which_node"] = shutil.which("node")
    res["remotion_cache_dir"] = os.listdir("/app/node_modules/.remotion") if os.path.exists("/app/node_modules/.remotion") else None
    
    try:
        r_ver = subprocess.run(["chromium", "--version"], capture_output=True, text=True, timeout=5)
        res["chromium_version"] = r_ver.stdout.strip()
    except Exception as e:
        res["chromium_version_err"] = str(e)

    try:
        r_run = subprocess.run(["chromium", "--headless", "--no-sandbox", "--disable-gpu", "--dump-dom", "about:blank"], capture_output=True, text=True, timeout=5)
        res["chromium_run_code"] = r_run.returncode
        res["chromium_run_stderr"] = r_run.stderr[:300]
    except Exception as e:
        res["chromium_run_err"] = str(e)

    return res


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


@app.post("/api/action_result")
async def receive_action_result(request: Request):
    """Menerima konfirmasi hasil eksekusi remote command dari laptop dan mengabarkannya ke Telegram."""
    token = request.headers.get("X-Telemetry-Token") or request.query_params.get("token")
    if WEBHOOK_SECRET and token != WEBHOOK_SECRET:
        return {"status": "unauthorized"}
    global last_screenshot_chat_id
    try:
        data = await request.json()
    except Exception:
        return {"status": "invalid json"}
    msg = data.get("message", "")
    if last_screenshot_chat_id and msg:
        await send_telegram_message(last_screenshot_chat_id, msg)
        return {"status": "sent"}
    return {"status": "ok"}


@app.get("/api/telemetry")
def get_telemetry():
    """Melihat data telemetri laptop terakhir."""
    return laptop_telemetry_data


@app.post("/webhook")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    """Menerima pesan Telegram via Webhook saat dideploy di Hugging Face / Railway."""
    try:
        data = await request.json()
    except Exception:
        return {"status": "invalid json"}

    if "message" in data:
        msg = data["message"]
        chat_id = msg.get("chat", {}).get("id")
        user_id = msg.get("from", {}).get("id")
        text = msg.get("text", "") or msg.get("caption", "")
        if chat_id and user_id:
            await handle_user_command_or_message(chat_id, user_id, text, background_tasks, message_data=msg)

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
                    if "message" in u:
                        msg = u["message"]
                        chat_id = msg.get("chat", {}).get("id")
                        user_id = msg.get("from", {}).get("id")
                        text = msg.get("text", "") or msg.get("caption", "")
                        if chat_id and user_id:
                            current_bg = BackgroundTasks()
                            await handle_user_command_or_message(chat_id, user_id, text, current_bg, message_data=msg)
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
