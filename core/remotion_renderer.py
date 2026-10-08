import os
import json
import uuid
import shutil
import logging
import subprocess

logger = logging.getLogger(__name__)


def is_remotion_available() -> bool:
    """Mengecek apakah Node.js dan npx/remotion tersedia di lingkungan ini."""
    return shutil.which("npx") is not None or shutil.which("npm") is not None


def render_remotion_video(
    hook_text: str,
    points: list[str],
    cta_text: str,
    output_mp4_path: str,
    persona_key: str = "hajidarimuda",
    timeout: int = 150
) -> str:
    """
    Merender video animasi vertikal 9:16 menggunakan framework Remotion (React & TypeScript).
    Dijalankan secara headless di Hugging Face Spaces maupun lingkungan lokal.
    """
    comp_id = "AryeReels" if persona_key == "arye" else "HajiReels"
    task_id = uuid.uuid4().hex[:8]
    temp_dir = os.path.dirname(os.path.abspath(output_mp4_path))
    os.makedirs(temp_dir, exist_ok=True)
    props_json_path = os.path.join(temp_dir, f"remotion_props_{task_id}.json")

    props_data = {
        "hook_header": hook_text,
        "points": points if points else ["Edukasi dan riset mendalam", "Data riil dan terverifikasi"],
        "cta_footer": cta_text
    }

    with open(props_json_path, "w", encoding="utf-8") as f:
        json.dump(props_data, f, ensure_ascii=False, indent=2)

    entry_point = "remotion/index.ts"
    npx_bin = shutil.which("npx") or "npx"

    cmd = [
        npx_bin,
        "remotion",
        "render",
        entry_point,
        comp_id,
        output_mp4_path,
        f"--props={props_json_path}",
        "--gl=angle",
        "--chromium-options=--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu",
        "--log=info"
    ]

    logger.info(f"🚀 Memulai render Remotion [{comp_id}] ke: {output_mp4_path}")
    
    try:
        # Gunakan shell=True di Windows agar npx.cmd terbaca dengan lancar
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
