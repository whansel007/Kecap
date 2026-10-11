from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "kecap-extension" / "icons"
FONT = ROOT / "kecap-extension" / "fonts" / "NotoSansSundanese-Regular.ttf"


def make_icon(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), "#f5e7ca")
    draw = ImageDraw.Draw(image)
    inset = max(1, round(size * 0.055))
    radius = max(2, round(size * 0.22))
    draw.rounded_rectangle(
        (inset, inset, size - inset - 1, size - inset - 1),
        radius=radius,
        fill="#f5e7ca",
        outline="#a94726",
        width=max(1, round(size * 0.055)),
    )
    font = ImageFont.truetype(str(FONT), max(8, round(size * 0.66)))
    glyph = "ᮞ"
    bounds = draw.textbbox((0, 0), glyph, font=font)
    width, height = bounds[2] - bounds[0], bounds[3] - bounds[1]
    draw.text(
        ((size - width) / 2 - bounds[0], (size - height) / 2 - bounds[1] - size * 0.015),
        glyph,
        font=font,
        fill="#35170f",
    )
    return image


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for dimension in (16, 48, 128):
        make_icon(dimension).save(OUT / f"icon{dimension}.png", optimize=True)
