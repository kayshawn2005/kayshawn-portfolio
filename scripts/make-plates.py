"""
Turns a scene's background image into what the story engine loads:
  public/plates/<name>.webp        color, 2048 wide (desktop)
  public/plates/<name>-sm.webp     color, 1280 wide (phones)
  public/plates/<name>-depth.webp  depth, 1024 wide, lossless grayscale, white = near

Depth comes from Depth Anything V2 Small (Apache-2.0). It is normalised, smoothed, and near regions are grown by a
few pixels so foreground edges drag a little background with them instead of tearing it when the camera moves.

Needs Python with torch, transformers and pillow (the image-gen venv has them):
  python scripts/make-plates.py path/to/booth.png booth [path/to/cafe.png cafe ...]
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from transformers import pipeline

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "plates")


def depth_map(estimator, img: Image.Image) -> Image.Image:
    raw = np.asarray(estimator(img)["predicted_depth"].squeeze(), dtype=np.float32)
    lo, hi = np.percentile(raw, 1.5), np.percentile(raw, 99.5)
    d = np.clip((raw - lo) / max(hi - lo, 1e-6), 0, 1)
    dep = Image.fromarray((d * 255).astype(np.uint8), "L").resize((1024, round(1024 * img.height / img.width)), Image.BICUBIC)
    # grow the foreground a little, then soften so the warp has no hard steps
    return dep.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(2.2))


def main(args: list[str]) -> None:
    if len(args) < 2 or len(args) % 2:
        sys.exit(__doc__)
    os.makedirs(OUT, exist_ok=True)
    estimator = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device="cpu")
    for src, name in zip(args[::2], args[1::2]):
        img = Image.open(src).convert("RGB")
        for width, suffix, q in ((2048, "", 84), (1280, "-sm", 80)):
            im = img if img.width == width else img.resize((width, round(width * img.height / img.width)), Image.LANCZOS)
            im.save(os.path.join(OUT, f"{name}{suffix}.webp"), "WEBP", quality=q, method=6)
        depth_map(estimator, img).save(os.path.join(OUT, f"{name}-depth.webp"), "WEBP", lossless=True, method=6)
        sizes = {f: os.path.getsize(os.path.join(OUT, f)) // 1024 for f in os.listdir(OUT) if f.startswith(name)}
        print(name, sizes)


if __name__ == "__main__":
    main(sys.argv[1:])
