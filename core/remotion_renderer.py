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
    duration_sec: int = 12,
    timeout: int = 150
) -> str:
    """
    Merender video animasi menggunakan Remotion (React & TypeScript).
    Mendukung kustomisasi rasio dan durasi:
    - portrait (9:16 - 1080x1920) untuk Reels/Shorts/TikTok
    - landscape (16:9 - 1920x1080) untuk YouTube/Desktop/Presentasi
    - square (1:1 - 1080x1080) untuk Instagram Feed/LinkedIn
    """
    if persona_key in ["tech_vector", "tech", "hardware", "vector", "3d"]:
        base_comp = "TechVectorReels"
    elif persona_key == "arye":
        base_comp = "AryeReels"
    else:
        base_comp = "HajiReels"
    
    aspect_ratio_clean = (aspect_ratio or "portrait").lower().strip()
    if aspect_ratio_clean in ["landscape", "16:9", "horizontal", "youtube"]:
        comp_id = f"{base_comp}Landscape"
    elif aspect_ratio_clean in ["square", "1:1", "kotak", "feed"]:
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
        "duration_sec": duration_sec
    }

    with open(props_json_path, "w", encoding="utf-8") as f:
        json.dump(props_data, f, ensure_ascii=False, indent=2)

    entry_point = "remotion/index.ts"
    npx_bin = shutil.which("npx") or "npx"

    total_frames = max(90, min(1800, int((duration_sec or 12) * 30)))
    cmd = [
        npx_bin,
        "--no-install",
        "remotion",
        "render",
        entry_point,
        comp_id,
        output_mp4_path,
        f"--props={props_json_path}",
        f"--frames=0-{total_frames - 1}",
        "--gl=angle",
        "--log=info"
    ]

    logger.info(f"🚀 Memulai render Remotion [{comp_id}] ke: {output_mp4_path}")
    
    try:
        is_windows = os.name == "nt"
        res = subprocess.run(
            cmd if not is_windows else " ".join(f'"{c}"' if " " in c else c for c in cmd),
            shell=is_windows,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        if res.returncode != 0:
            logger.error(f"Gagal render Remotion (code {res.returncode}):\n{res.stderr}\n{res.stdout}")
            raise RuntimeError(f"Remotion render error: {res.stderr[:300] or res.stdout[:300]}")

        logger.info(f"✅ Render Remotion [{comp_id}] berhasil diselesaikan!")
        return output_mp4_path

    finally:
        if os.path.exists(props_json_path):
            try:
                os.remove(props_json_path)
            except Exception:
                pass
