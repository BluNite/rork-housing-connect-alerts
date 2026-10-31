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
cp -r README.md .gitignore .github rork.json render.yaml backend /tmp/ltsrc/
mkdir -p /tmp/ltsrc/web-lottery-tracker
# Copy the web app minus node_modules, dist, and local env files.
tar -C web-lottery-tracker --exclude=node_modules --exclude=dist \
   --exclude='public/downloads' --exclude='.env' --exclude='.env.*' \
   -cf - . | tar -C /tmp/ltsrc/web-lottery-tracker -xf -
mkdir -p "$(dirname "$OUT")"
# A real zip (not a renamed tar.gz): Python's zipfile, since no `zip` binary
# exists in the sandbox. Walks /tmp/ltsrc so the tar-stage exclusions apply.
cd /tmp/ltsrc && python3 - "$OLDPWD/$OUT" <<'PYEOF' && cd - >/dev/null
import os, sys, zipfile
out = sys.argv[1]
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "dist"}]
        for f in files:
            z.write(os.path.join(root, f))
PYEOF

echo "Created $OUT"
unzip -l "$OUT" | tail -1
