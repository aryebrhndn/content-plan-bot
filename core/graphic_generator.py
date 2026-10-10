import os
import textwrap
from PIL import Image, ImageDraw, ImageFont
from core.gemini_client import PERSONAS

WIDTH = 1080
HEIGHT = 1920


def get_font(size: int):
    """Mencari font terbaik yang tersedia di sistem (Windows / Linux / Docker)."""
    font_candidates = [
        "assets/fonts/Montserrat-Bold.ttf",
        # Windows Fonts
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
        # Linux / Docker Fonts
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
    ]

    for p in font_candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue

    # Fallback default Pillow modern
    try:
        return ImageFont.load_default(size=size)
    except Exception:
        return ImageFont.load_default()


def create_overlay_image(
    hook_text: str,
    points: list,
    cta_text: str,
    output_path: str,
    persona_key: str = "hajidarimuda"
) -> str:
    """
    Menggambar grafis transparan 1080x1920 dengan tema warna sesuai persona.
    """
    persona = PERSONAS.get(persona_key, PERSONAS["hajidarimuda"])
    theme = persona.get("theme_colors", {
        "top_box": "#DC2626",
        "bot_box": "#DC2626",
        "mid_box": "#FFFFFF",
        "text_mid": "#1E293B"
    })

    # Buat kanvas RGBA transparan
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # 1. KOTAK ATAS (HOOK / JUDUL)
    if hook_text and hook_text.strip():
        top_box_x0, top_box_y0 = 80, 160
        top_box_x1, top_box_y1 = 1000, 420
        draw.rounded_rectangle(
            [top_box_x0, top_box_y0, top_box_x1, top_box_y1],
            radius=28,
            fill=theme.get("top_box", "#DC2626")
        )

        font_hook = get_font(42)
        wrapped_hook = textwrap.fill(hook_text, width=28)
        draw.text(
            (WIDTH / 2, (top_box_y0 + top_box_y1) / 2),
            wrapped_hook,
            font=font_hook,
            fill=theme.get("text_top", "white"),
            anchor="mm",
            align="center"
        )

    # 2. KOTAK TENGAH (POIN-POIN MATERI)
    if points and len(points) > 0:
        mid_box_x0, mid_box_y0 = 80, 470
        mid_box_x1, mid_box_y1 = 1000, 1400
        draw.rounded_rectangle(
            [mid_box_x0, mid_box_y0, mid_box_x1, mid_box_y1],
            radius=32,
            fill=theme.get("mid_box", "#FFFFFF")
        )

        font_points = get_font(32)
        y_cursor = mid_box_y0 + 70
        total_space = (mid_box_y1 - mid_box_y0) - 140
        line_spacing = max(total_space / len(points), 100)

        for pt in points:
            formatted_pt = pt if pt.strip().startswith(("•", "-", "*")) else f"• {pt}"
            wrapped_pt = textwrap.fill(formatted_pt, width=34)
            draw.text(
                (mid_box_x0 + 50, y_cursor),
                wrapped_pt,
                font=font_points,
                fill=theme.get("text_mid", "#1E293B")
            )
            y_cursor += line_spacing

    # 3. KOTAK BAWAH (CTA / CALL TO ACTION)
    if cta_text and cta_text.strip():
        bot_box_x0, bot_box_y0 = 80, 1450
        bot_box_x1, bot_box_y1 = 1000, 1650
        draw.rounded_rectangle(
            [bot_box_x0, bot_box_y0, bot_box_x1, bot_box_y1],
            radius=28,
            fill=theme.get("bot_box", "#DC2626")
        )

        font_cta = get_font(34)
        wrapped_cta = textwrap.fill(cta_text, width=32)
        draw.text(
            (WIDTH / 2, (bot_box_y0 + bot_box_y1) / 2),
            wrapped_cta,
            font=font_cta,
            fill=theme.get("text_bot", "white"),
            anchor="mm",
            align="center"
        )

    # Pastikan folder tujuan ada
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    overlay.save(output_path, "PNG")
    return output_path
