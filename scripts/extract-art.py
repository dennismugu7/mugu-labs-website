"""
Cut the 3D artwork out of the design comps into transparent PNGs.

    python scripts/extract-art.py            # writes public/assets/art-*.png
    python scripts/extract-art.py --check    # also writes docs/site/review/<dir>/art-*.png comparisons

How it decides what is background — and, deliberately, what it does not do:

* The background is found by REGION GROWING from seeds on the crop's border:
  a pixel joins the background only if it is within a small step of a
  background neighbour. Smooth gradients and glass fills are walked across;
  a real edge (subject against backdrop) is a step too large to cross. No
  pixel is removed for merely *resembling* the background — a global "close
  to a fitted background model" pass is what ate the calendar's lower body
  the first time (NEXT-012).
* The comps put the art over glass cards, whose 1px borders would stop the
  growth. Seeds on both sides of a border reach both regions; a small CLOSING
  of the background mask (radius 3px) swallows the thin border line where it
  runs outside the subject. Nothing thicker than 6px can be lost to it.
* The subject is the largest connected non-background component, plus any
  other component above a size floor that lies inside the asset's box (so
  card text under the art is dropped, but a detached shadow or ring is kept).
* Alpha is the mask with a 1px feather; edge pixels keep the blend they had.

Needs Pillow only. Regions and seeds are listed in ART below; if a comp is
re-exported, re-check the boxes.
"""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SCREENS = ROOT / "docs/site/screens"
OUT = ROOT / "public/assets"

# name -> (comp, crop box, per-step tolerance, min component area, extra seeds)
# The crop border must be background (gradient or card glass) on every side.
# Extra seeds are comp-space points known to be background that the border
# cannot reach - backdrop enclosed by the subject, like the inside of the
# sync arrows. They are flood-filled by the same rule, never guessed.
ART = {
    "art-budget": ("07-journal-cards/ui-1.png", (100, 50, 650, 470), 7, 300, ()),
    "art-sync": ("07-journal-cards/ui-1.png", (720, 50, 1280, 490), 7, 300, ((890, 280), (1080, 300), (1200, 180), (1150, 120))),
    "art-calendar": ("07-journal-cards/ui-1.png", (1300, 40, 1860, 505), 7, 300, ()),
    "art-tape": ("08-about/ui-1.png", (1030, 265, 1900, 700), 7, 300, ()),
    "art-envelope": ("10-contact-and-footer/ui-1.png", (430, 320, 630, 490), 7, 200, ()),
}

STEP_DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))


def grow_background(img: Image.Image, tol: int, seeds=()) -> list[bool]:
    """Flood from every border pixel (and any extra seeds), stepping only across small colour changes."""
    w, h = img.size
    px = img.load()
    seen = [False] * (w * h)
    q: deque[tuple[int, int]] = deque()
    for x, y in seeds:
        seen[y * w + x] = True
        q.append((x, y))
    for x in range(w):
        for y in (0, h - 1):
            if not seen[y * w + x]:
                seen[y * w + x] = True
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not seen[y * w + x]:
                seen[y * w + x] = True
                q.append((x, y))
    while q:
        x, y = q.popleft()
        r, g, b = px[x, y]
        for dx, dy in STEP_DIRS:
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                nr, ng, nb = px[nx, ny]
                if abs(nr - r) <= tol and abs(ng - g) <= tol and abs(nb - b) <= tol:
                    seen[ny * w + nx] = True
                    q.append((nx, ny))
    return seen


def components(mask: Image.Image) -> list[tuple[int, tuple[int, int, int, int], set[int]]]:
    """Connected components of the white pixels: (area, bbox, pixel set)."""
    w, h = mask.size
    px = mask.load()
    labelled = [False] * (w * h)
    out = []
    for sy in range(h):
        for sx in range(w):
            if px[sx, sy] and not labelled[sy * w + sx]:
                labelled[sy * w + sx] = True
                q = deque([(sx, sy)])
                pixels = set()
                x0 = x1 = sx
                y0 = y1 = sy
                while q:
                    x, y = q.popleft()
                    pixels.add(y * w + x)
                    x0, x1, y0, y1 = min(x0, x), max(x1, x), min(y0, y), max(y1, y)
                    for dx, dy in STEP_DIRS:
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and px[nx, ny] and not labelled[ny * w + nx]:
                            labelled[ny * w + nx] = True
                            q.append((nx, ny))
                out.append((len(pixels), (x0, y0, x1 + 1, y1 + 1), pixels))
    out.sort(key=lambda c: -c[0])
    return out


def extract(name: str, comp: str, box, tol: int, min_area: int, seeds=()) -> tuple[Image.Image, Image.Image, dict]:
    src = Image.open(SCREENS / comp).convert("RGB").crop(box)
    w, h = src.size
    # Border flood first; an extra seed is only accepted if its colour is in the
    # family of what the border reached, so a seed that lands on the subject
    # (one did, on the orange arrow) is refused rather than flooding it.
    bg = grow_background(src, tol)
    px = src.load()
    n = sum(bg)
    mean = [sum(px[i % w, i // w][c] for i in range(w * h) if bg[i]) // max(n, 1) for c in range(3)]
    accepted = []
    for x, y in ((x - box[0], y - box[1]) for x, y in seeds):
        colour = px[x, y]
        if all(abs(colour[c] - mean[c]) <= 40 for c in range(3)):
            accepted.append((x, y))
        else:
            print(f"  {name}: seed at comp {(x + box[0], y + box[1])} is {colour}, not backdrop (mean {tuple(mean)}) - refused")
    if accepted:
        bg = grow_background(src, tol, accepted)

    bg_mask = Image.new("L", (w, h), 0)
    bg_mask.putdata([255 if b else 0 for b in bg])
    # closing: swallow the card's border lines (thin) without touching the subject
    bg_mask = bg_mask.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))

    subject = bg_mask.point(lambda v: 255 - v)
    comps = components(subject)
    main = comps[0]
    keep = [main]
    mx0, my0, mx1, my1 = main[1]
    for c in comps[1:]:
        area, (x0, y0, x1, y1), _ = c
        inside = x0 >= mx0 - 8 and y0 >= my0 - 8 and x1 <= mx1 + 8 and y1 <= my1 + 8
        if area >= min_area and inside:
            keep.append(c)
    kept = Image.new("L", (w, h), 0)
    data = [0] * (w * h)
    for _, _, pixels in keep:
        for i in pixels:
            data[i] = 255
    kept.putdata(data)

    # 1px feather so the edge is not a staircase
    alpha = kept.filter(ImageFilter.GaussianBlur(0.7))
    rgba = src.copy().convert("RGBA")
    rgba.putalpha(alpha)
    bbox = alpha.getbbox()
    pad = 2
    bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad))
    info = {
        "crop": box,
        "bbox_in_comp": (box[0] + bbox[0], box[1] + bbox[1], box[0] + bbox[2], box[1] + bbox[3]),
        "size": (bbox[2] - bbox[0], bbox[3] - bbox[1]),
        "components_kept": len(keep),
        "components_dropped": len(comps) - len(keep),
        "main_area": main[0],
    }
    return rgba.crop(bbox), src.crop(bbox), info


def comparison(name: str, comp_crop: Image.Image, asset: Image.Image, out_dir: Path) -> None:
    """Comp region | asset on the comp's own mean background | asset on the old checkerboard."""
    w, h = asset.size
    # the comp's backdrop colour, averaged over the pixels the cut-out left behind
    a = asset.getchannel("A").load()
    src = comp_crop.load()
    acc = [0, 0, 0]
    n = 0
    for y in range(h):
        for x in range(w):
            if a[x, y] == 0:
                r, g, b = src[x, y]
                acc[0] += r
                acc[1] += g
                acc[2] += b
                n += 1
    mean = tuple(v // max(n, 1) for v in acc)
    flat = Image.new("RGBA", (w, h), mean + (255,))
    flat.alpha_composite(asset)
    checker = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    d = checker.load()
    for y in range(h):
        for x in range(w):
            if (x // 12 + y // 12) % 2:
                d[x, y] = (200, 200, 200, 255)
    checker.alpha_composite(asset)
    gap = 12
    sheet = Image.new("RGB", (w * 3 + gap * 2, h), (17, 17, 17))
    sheet.paste(comp_crop, (0, 0))
    sheet.paste(flat.convert("RGB"), (w + gap, 0))
    sheet.paste(checker.convert("RGB"), (2 * (w + gap), 0))
    sheet.save(out_dir / f"{name}.png")


def main() -> None:
    check = "--check" in sys.argv
    review = None
    if check:
        review = ROOT / "docs/site/review" / (sys.argv[sys.argv.index("--check") + 1] if len(sys.argv) > sys.argv.index("--check") + 1 else "art")
        review.mkdir(parents=True, exist_ok=True)
    for name, (comp, box, tol, min_area, seeds) in ART.items():
        asset, comp_crop, info = extract(name, comp, box, tol, min_area, seeds)
        asset.save(OUT / f"{name}.png", optimize=True)
        b = info["bbox_in_comp"]
        print(f"{name}.png  {info['size'][0]}x{info['size'][1]}  comp {b[0]},{b[1]}-{b[2]},{b[3]}  kept {info['components_kept']} component(s), dropped {info['components_dropped']}, main {info['main_area']}px")
        if review:
            comparison(name, comp_crop, asset, review)


if __name__ == "__main__":
    main()
