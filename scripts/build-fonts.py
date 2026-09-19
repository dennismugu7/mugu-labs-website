#!/usr/bin/env python3
"""
Subset the Poppins font files the site uses.

The repo ships subsetted .ttf files (they work everywhere, no extra tooling).
If you want .woff2 instead — roughly half the bytes over the wire — install
the extras and re-run with --woff2:

    pip install fonttools brotli
    python scripts/build-fonts.py --woff2

Then change `format('truetype')` to `format('woff2')` and the .ttf extensions
to .woff2 in styles/fonts.css.

Source .ttf files are expected in scripts/src-fonts/ (or pass --src DIR).
Download them from https://fonts.google.com/specimen/Poppins
"""
import argparse
import os
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

WEIGHTS = {
    "Poppins-Light.ttf": ("poppins-300", 300),
    "Poppins-Regular.ttf": ("poppins-400", 400),
    "Poppins-Medium.ttf": ("poppins-500", 500),
    "Poppins-Bold.ttf": ("poppins-700", 700),
}

# Basic Latin + Latin-1 punctuation + the typographic marks the copy uses.
UNICODES = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2192,U+2212,U+2215,U+FEFF,U+FFFD"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=os.path.join(os.path.dirname(__file__), "src-fonts"))
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "..", "public", "fonts"))
    ap.add_argument("--woff2", action="store_true", help="emit .woff2 (needs `pip install brotli`)")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    flavor = "woff2" if args.woff2 else None
    ext = "woff2" if args.woff2 else "ttf"

    for filename, (stem, weight) in WEIGHTS.items():
        src = os.path.join(args.src, filename)
        if not os.path.exists(src):
            print(f"skip {filename}: not found in {args.src}", file=sys.stderr)
            continue
        font = TTFont(src)
        options = subset.Options()
        options.flavor = flavor
        options.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk"]
        options.drop_tables += ["FFTM"]
        options.name_IDs = ["*"]
        options.name_legacy = True
        options.notdef_outline = True
        options.recalc_bounds = True
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
        subsetter.subset(font)
        dest = os.path.join(args.out, f"{stem}.{ext}")
        font.flavor = flavor
        font.save(dest)
        print(f"{dest}  {os.path.getsize(dest) / 1024:.1f} KB  (weight {weight})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
