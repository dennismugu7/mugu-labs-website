#!/usr/bin/env bash
# Renders the preview harness into preview/out and (re)starts a static server.
set -euo pipefail
cd "$(dirname "$0")/.."
npx tsx --tsconfig preview/tsconfig.json preview/render.tsx
npx tsc --ignoreConfig lib/motion.ts --target es2019 --module es2020 --outDir preview/out --lib es2019,dom
cp styles/globals.css styles/fonts.css preview/out/
sed -i 's|@import "./fonts.css";|@import "/fonts.css";|' preview/out/globals.css
ln -sfn "$PWD/public/assets" preview/out/assets
ln -sfn "$PWD/public/fonts" preview/out/fonts
ln -sfn "$PWD/public/favicon.svg" preview/out/favicon.svg
echo "preview ready"
