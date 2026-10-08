import os
import random
import logging

# Kompatibilitas MoviePy 1.x dan MoviePy 2.x
try:
    from moviepy import VideoFileClip, ImageClip, CompositeVideoClip, ColorClip
except ImportError:
    from moviepy.editor import VideoFileClip, ImageClip, CompositeVideoClip, ColorClip

logger = logging.getLogger(__name__)


def set_clip_duration(clip, duration: float):
    if hasattr(clip, "with_duration"):
        return clip.with_duration(duration)
    return clip.set_duration(duration)


def set_clip_position(clip, pos):
    if hasattr(clip, "with_position"):
        return clip.with_position(pos)
    return clip.set_pos(pos)


def resize_clip(clip, size):
    if hasattr(clip, "resized"):
        return clip.resized(size)
    if hasattr(clip, "resize"):
        return clip.resize(size)
    return clip


def render_reels_video(
    overlay_png_path: str,
    output_mp4_path: str,
    footage_dir: str = "assets/footages",
    target_duration: float = 7.0
) -> str:
    """
    Menggabungkan footage video acak dengan overlay grafis menjadi video MP4 1080x1920.
    Kompatibel dengan MoviePy 1.x dan MoviePy 2.x.
    """
    os.makedirs(footage_dir, exist_ok=True)
    available_footages = [
        os.path.join(footage_dir, f)
        for f in os.listdir(footage_dir)
        if f.lower().endswith((".mp4", ".mov", ".mkv", ".avi", ".webm"))
    ]

    base_video = None
    if available_footages:
        selected_footage = random.choice(available_footages)
        logger.info(f"Menggunakan footage: {selected_footage}")
        
        try:
            raw_clip = VideoFileClip(selected_footage)
            actual_duration = min(raw_clip.duration, target_duration)
            if hasattr(raw_clip, "subclipped"):
                base_video = raw_clip.subclipped(0, actual_duration)
            else:
                base_video = raw_clip.subclip(0, actual_duration)

            base_video = resize_clip(base_video, (1080, 1920))
        except Exception as e:
            logger.warning(f"Gagal memuat footage {selected_footage}: {e}. Memakai background fallback.")
            base_video = None

    if base_video is None:
        logger.info("Menggunakan background solid fallback (1080x1920).")
        base_video = ColorClip(size=(1080, 1920), color=(24, 24, 27), duration=target_duration)

    duration = base_video.duration

    # Tumpuk gambar overlay di atas video
    overlay_clip = ImageClip(overlay_png_path)
    overlay_clip = set_clip_duration(overlay_clip, duration)
    overlay_clip = set_clip_position(overlay_clip, ("center", "center"))

    final_clip = CompositeVideoClip([base_video, overlay_clip])

    os.makedirs(os.path.dirname(os.path.abspath(output_mp4_path)), exist_ok=True)

    final_clip.write_videofile(
        output_mp4_path,
        codec="libx264",
        audio_codec="aac",
        fps=30,
        preset="ultrafast",
        threads=2,
        logger=None
    )

    base_video.close()
    final_clip.close()
    return output_mp4_path
