#!/usr/bin/env bash
# Packages the project source (backend + web app + GitHub workflow) into a zip
# under the web app's public/downloads folder, so the user can download it from
# the live site and publish it to GitHub themselves (the sandbox's git is
# read-only). Run from the project root: bash scripts/make-source-zip.sh
set -euo pipefail

STAMP=$(date +%Y%m%d-%H%M)
OUT="web-lottery-tracker/public/downloads/lottery-tracker-source-${STAMP}.zip"
mkdir -p "$(dirname "$OUT")"

# Everything that matters, nothing that shouldn't ship: no git history,
# no installed packages, no build output, no local env files, no Rork state.
mkdir -p /tmp/ltsrc
rm -rf /tmp/ltsrc/*
cp -r README.md .gitignore .github rork.json backend /tmp/ltsrc/
mkdir -p /tmp/ltsrc/web-lottery-tracker
# Copy the web app minus node_modules, dist, and local env files.
tar -C web-lottery-tracker --exclude=node_modules --exclude=dist \
   --exclude='public/downloads' --exclude='.env' --exclude='.env.*' \
   -cf - . | tar -C /tmp/ltsrc/web-lottery-tracker -xf -
mkdir -p "$(dirname "$OUT")"
cd /tmp/ltsrc && tar -czf "$OLDPWD/$OUT" . && cd - >/dev/null

echo "Created $OUT"
tar -tzf "$OUT" | wc -l
