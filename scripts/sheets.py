"""
Contact sheets: design comp on the left, built site on the right, same
height, with a label strip. One sheet per comp folder in docs/site/screens/.

    python scripts/sheets.py [shots_dir] [sheets_dir]
    # defaults: docs/site/review/goldens/{shots,sheets}

Comps 2+3 map to one built section (DECISIONS D3), so those sheets share a
build shot. Comps 6+7 are one section too (D4), but since M4 the cards no
longer fit under the heading in a 1080 frame, so comp 7 gets its own frame
anchored on the cards.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SCREENS = ROOT / "docs/site/screens"
SHOTS = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "docs/site/review/goldens/shots"
SHEETS = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else ROOT / "docs/site/review/goldens/sheets"
SHEETS.mkdir(parents=True, exist_ok=True)

# comp folder -> build golden (desktop)
PAIRS = {
    "01-hero": "desktop__01-hero.png",
    "02-products-a": "desktop__02-03-products.png",
    "03-products-b": "desktop__02-03-products.png",
    "04-statement-overload": "desktop__04-statement-overload.png",
    "05-statement-breather": "desktop__05-statement-breather.png",
    "06-journal-cta": "desktop__06-07-journal.png",
    "07-journal-cards": "desktop__07-journal-cards.png",
    "08-about": "desktop__08-about.png",
    "09-how-i-work-and-socials": "desktop__09-how-i-work-and-socials.png",
    "10-contact-and-footer": "desktop__10-contact-and-footer.png",
}

SCALE = 0.5          # each side is rendered at half size to keep sheets small
STRIP = 44           # label strip height
GAP = 12

try:
    FONT = ImageFont.truetype(str(ROOT / "scripts/src-fonts/Poppins-Medium.ttf"), 20)
except OSError:
    FONT = ImageFont.load_default()


def fit(img: Image.Image, height: int) -> Image.Image:
    w = round(img.width * height / img.height)
    return img.convert("RGB").resize((w, height), Image.LANCZOS)


for comp, shot in PAIRS.items():
    comp_path = SCREENS / comp / "ui-1.png"
    shot_path = SHOTS / shot
    left = Image.open(comp_path)
    right = Image.open(shot_path)

    height = round(left.height * SCALE)
    left = fit(left, height)
    right = fit(right, height)

    sheet = Image.new("RGB", (left.width + GAP + right.width, STRIP + height), (18, 18, 24))
    draw = ImageDraw.Draw(sheet)
    draw.text((12, 11), f"COMP  {comp}/ui-1.png  ({Image.open(comp_path).width}x{Image.open(comp_path).height})", font=FONT, fill=(235, 235, 240))
    rw, rh = Image.open(shot_path).size
    draw.text((left.width + GAP + 12, 11), f"BUILD  {shot_path.name}  ({rw}x{rh})", font=FONT, fill=(190, 255, 120))
    sheet.paste(left, (0, STRIP))
    sheet.paste(right, (left.width + GAP, STRIP))

    out = SHEETS / f"{comp}.png"
    sheet.save(out, optimize=True)
    print(f"{out.relative_to(ROOT)}  {sheet.width}x{sheet.height}")
