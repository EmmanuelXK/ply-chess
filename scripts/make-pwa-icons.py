#!/usr/bin/env python3
"""Build full-bleed EDGES home-screen icons from scripts/icons/fedora-master.png.

The master is the fedora mark with extra black letterboxing. iOS paints any
transparent or white margin white and will not scale a small glyph up, so every
non-maskable icon is an opaque RGB square: solid black to the pixel edge, no
alpha, no pre-rounded corners. Maskable icons keep the same black field with
the art inside the Android safe zone.
"""

from __future__ import annotations

import base64
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "scripts" / "icons" / "fedora-master.png"
PUBLIC = ROOT / "public"

# Longest side of the silhouette as a fraction of the canvas.
# High enough that the fedora fills the tile; a hair of black remains so
# antialiased tips are not clipped before iOS applies its own mask.
FILL_BLEED = 0.96
# Android maskable safe zone is the center 80%.
FILL_MASKABLE = 0.78
BLACK = (0, 0, 0)
# Compression specks around (13,13,13) sit outside the silhouette.
# Keep the real orange and cream; ignore that gray dust when cropping.
BLACK_MAX = 32


def content_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    rgb = image.convert("RGB")
    pixels = rgb.load()
    width, height = rgb.size
    min_x, min_y, max_x, max_y = width, height, -1, -1
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            if r > BLACK_MAX or g > BLACK_MAX or b > BLACK_MAX:
                if x < min_x:
                    min_x = x
                if y < min_y:
                    min_y = y
                if x > max_x:
                    max_x = x
                if y > max_y:
                    max_y = y
    if max_x < 0:
        raise SystemExit("master icon has no non-black pixels")
    # Keep the antialiased fringe that fell under the threshold.
    return (
        max(0, min_x - 1),
        max(0, min_y - 1),
        min(width - 1, max_x + 1),
        min(height - 1, max_y + 1),
    )


def render(crop: Image.Image, size: int, fill: float) -> Image.Image:
    crop_w, crop_h = crop.size
    target = max(1, int(round(size * fill)))
    scale = target / max(crop_w, crop_h)
    resized = crop.resize(
        (max(1, int(round(crop_w * scale))), max(1, int(round(crop_h * scale)))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGB", (size, size), BLACK)
    offset = ((size - resized.width) // 2, (size - resized.height) // 2)
    canvas.paste(resized, offset)
    return canvas


def save_png(image: Image.Image, path: Path) -> None:
    image.convert("RGB").save(path, format="PNG", optimize=True)
    color_type = png_color_type(path)
    if color_type != 2:
        raise SystemExit(f"{path} must be RGB (color type 2), got {color_type}")


def png_color_type(path: Path) -> int:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"{path} is not a PNG")
    return data[25]


def save_ico(image: Image.Image, path: Path) -> None:
    # 16 and 32 only. The old app/favicon.ico was 256px with transparent
    # corners, and Safari used that instead of the 180px touch icon.
    image.save(path, format="ICO", sizes=[(16, 16), (32, 32)])


def write_svg(png_192: Path, path: Path) -> None:
    encoded = base64.b64encode(png_192.read_bytes()).decode("ascii")
    path.write_text(
        "\n".join(
            [
                '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192" role="img" aria-label="EDGES">',
                '  <rect width="192" height="192" fill="#000000"/>',
                f'  <image width="192" height="192" href="data:image/png;base64,{encoded}"/>',
                "</svg>",
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> None:
    master = Image.open(MASTER).convert("RGB")
    crop = master.crop(content_bbox(master))
    bleed = {
        180: render(crop, 180, FILL_BLEED),
        192: render(crop, 192, FILL_BLEED),
        512: render(crop, 512, FILL_BLEED),
        32: render(crop, 32, FILL_BLEED),
    }
    maskable = {
        192: render(crop, 192, FILL_MASKABLE),
        512: render(crop, 512, FILL_MASKABLE),
    }

    pairs = {
        PUBLIC / "apple-touch-icon.png": bleed[180],
        PUBLIC / "apple-touch-icon-v2.png": bleed[180],
        PUBLIC / "icon-192.png": bleed[192],
        PUBLIC / "icon-192-v2.png": bleed[192],
        PUBLIC / "icon-512.png": bleed[512],
        PUBLIC / "icon-512-v2.png": bleed[512],
        PUBLIC / "favicon-32-v2.png": bleed[32],
        PUBLIC / "icon-maskable-192.png": maskable[192],
        PUBLIC / "icon-maskable-192-v2.png": maskable[192],
        PUBLIC / "icon-maskable-512.png": maskable[512],
        PUBLIC / "icon-maskable-512-v2.png": maskable[512],
    }
    for path, image in pairs.items():
        save_png(image, path)
        print(f"wrote {path.relative_to(ROOT)} {image.size}")

    save_ico(bleed[32], PUBLIC / "favicon.ico")
    print("wrote public/favicon.ico")
    write_svg(PUBLIC / "icon-192-v2.png", PUBLIC / "icon.svg")
    print("wrote public/icon.svg")


if __name__ == "__main__":
    main()
