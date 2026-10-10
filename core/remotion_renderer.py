import os
import json
import uuid
import shutil
import logging
import subprocess

logger = logging.getLogger(__name__)


def is_remotion_available() -> bool:
    """Mengecek apakah paket Remotion terpasang di node_modules."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cli_dir = os.path.join(base_dir, "node_modules", "@remotion", "cli")
    return os.path.exists(cli_dir)


def render_remotion_video(
    hook_text: str,
    points: list[str],
    cta_text: str,
    output_mp4_path: str,
    persona_key: str = "hajidarimuda",
    aspect_ratio: str = "portrait",
    brand_badge: str = "",
    duration_sec: int = 8,
    is_clean_footage: bool = False,
    is_alpha_channel: bool = False,
    style_variant: str = "regular",
    audio_path: str = "",
    timeout: int = 300
) -> str:
    """
    Merender video animasi menggunakan Remotion (React & TypeScript).
    Mendukung kustomisasi rasio, durasi, Clean Footage Mode (B-roll murni tanpa kartu teks),
    Alpha Channel transparan, dan variasi style (regular vs papercut Daviqin):
    - portrait (9:16 - 1080x1920) untuk Reels/Shorts/TikTok
    - landscape (16:9 - 1920x1080) untuk YouTube/Desktop/Footage
    - square (1:1 - 1080x1080) untuk Instagram Feed/LinkedIn
    """
    if persona_key in ["tech_vector", "tech", "hardware", "vector", "3d", "remotion"]:
        base_comp = "TechVectorReels"
    elif persona_key in ["arye", "personal"]:
        base_comp = "AryeReels"
    else:
        base_comp = "HajiReels"
    
    aspect_ratio_clean = (aspect_ratio or "portrait").lower().strip()
    if aspect_ratio_clean in ["landscape", "lanskap", "16:9", "horizontal", "lebar", "tidur", "youtube", "desktop"]:
        comp_id = f"{base_comp}Landscape"
    elif aspect_ratio_clean in ["square", "1:1", "kotak", "persegi", "feed"]:
        comp_id = f"{base_comp}Square"
    else:
        comp_id = base_comp

    task_id = uuid.uuid4().hex[:8]
    temp_dir = os.path.dirname(os.path.abspath(output_mp4_path))
    os.makedirs(temp_dir, exist_ok=True)
    props_json_path = os.path.join(temp_dir, f"remotion_props_{task_id}.json")

    props_data = {
        "hook_header": hook_text,
        "points": points if points else ["Edukasi dan riset mendalam", "Data riil dan terverifikasi"],
        "cta_footer": cta_text,
        "brand_badge": brand_badge,
        "duration_sec": duration_sec,
        "is_clean_footage": is_clean_footage,
        "is_alpha_channel": is_alpha_channel,
        "style_variant": style_variant
    }

    with open(props_json_path, "w", encoding="utf-8") as f:
        json.dump(props_data, f, ensure_ascii=False, indent=2)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    entry_point = os.path.join(base_dir, "remotion", "index.ts")
    cli_js = os.path.join(base_dir, "node_modules", "@remotion", "cli", "remotion-cli.js")
    node_bin = shutil.which("node") or "node"
    
    total_frames = max(90, min(1800, int((duration_sec or 8) * 30)))
    gl_renderer = "angle"

    common_args = [
        "render",
        entry_point,
        comp_id,
        output_mp4_path,
        f"--props={props_json_path}",
        f"--frames=0-{total_frames - 1}",
        f"--gl={gl_renderer}",
        "--concurrency=1",
        "--enable-multiprocess-on-linux",
        "--log=verbose"
    ]

    if os.path.exists(cli_js):
        cmd = [node_bin, cli_js] + common_args
    else:
        local_bin = os.path.join(base_dir, "node_modules", ".bin", "remotion")
        if os.path.exists(local_bin):
            cmd = [local_bin] + common_args
        else:
            npx_bin = shutil.which("npx") or "npx"
            cmd = [npx_bin, "remotion"] + common_args

    is_windows = os.name == "nt"
    xvfb_bin = shutil.which("xvfb-run")
    if not is_windows and xvfb_bin:
        cmd = [xvfb_bin, "-a", "-s", "-screen 0 1920x1080x24"] + cmd

    logger.info(f"🚀 Memulai render Remotion [{comp_id}] (Frames: {total_frames}, GL: {gl_renderer}) ke: {output_mp4_path}")
    
    try:
        res = subprocess.run(
            cmd if not is_windows else " ".join(f'"{c}"' if " " in c else c for c in cmd),
            cwd=base_dir,
            shell=is_windows,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        if res.returncode != 0:
            err_output = (res.stderr or res.stdout or "").strip()
            logger.error(f"Gagal render Remotion (code {res.returncode}):\n{err_output}")
            raise RuntimeError(f"Remotion render error (code {res.returncode}): {err_output[:3000]}")

        # Jika ada audio yang dilampirkan, gabungkan ke MP4 menggunakan ffmpeg
        if audio_path and os.path.exists(audio_path) and os.path.exists(output_mp4_path):
            output_with_audio = os.path.join(temp_dir, f"merged_{task_id}.mp4")
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", output_mp4_path,
                "-i", audio_path,
                "-c:v", "copy",
                "-c:a", "aac",
                "-shortest",
                output_with_audio
            ]
            try:
                res_ff = subprocess.run(
                    ffmpeg_cmd if not is_windows else " ".join(f'"{c}"' if " " in c else c for c in ffmpeg_cmd),
                    shell=is_windows,
                    capture_output=True,
                    timeout=30
                )
                if res_ff.returncode == 0 and os.path.exists(output_with_audio):
                    shutil.move(output_with_audio, output_mp4_path)
                    logger.info("🎵 Audio berhasil digabungkan ke video Remotion!")
            except Exception as e:
                logger.warning(f"Gagal menggabungkan audio: {e}")

        logger.info(f"✅ Render Remotion [{comp_id}] berhasil diselesaikan!")
        return output_mp4_path

    finally:
        if os.path.exists(props_json_path):
            try:
                os.remove(props_json_path)
            except Exception:
                pass
