#!/usr/bin/env python3
"""Self-hosts the site's Google Fonts.

Fetches the css2 stylesheet (with a modern browser UA so it returns woff2),
downloads every latin/latin-ext woff2 into public/fonts/, and writes a local
@font-face stylesheet to src/fonts.css (imported by main.tsx so it lands in the
main bundle). Keeps font-display: swap. One-time; re-run only if fonts change.
"""
import re
import urllib.request

CSS_URL = (
    "https://fonts.googleapis.com/css2"
    "?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700"
    "&family=Public+Sans:wght@400;500;600;700;800&display=swap"
)
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")
OUT_DIR = "web-lottery-tracker/public/fonts"
OUT_CSS = "web-lottery-tracker/src/fonts.css"

req = urllib.request.Request(CSS_URL, headers={"User-Agent": UA})
css = urllib.request.urlopen(req, timeout=30).read().decode()

# Split into (comment-subset, block) pairs.
blocks = re.findall(r"/\*\s*([a-z-]+)\s*\*/\s*(@font-face\s*\{[^}]+\})", css)
keep = [b for subset, b in blocks if subset in ("latin", "latin-ext")]
print(f"{len(blocks)} faces total, keeping {len(keep)} (latin + latin-ext)")

import os
os.makedirs(OUT_DIR, exist_ok=True)

seen = {}
out_css = []
for block in keep:
    url = re.search(r"url\((https://[^)]+\.woff2)\)", block).group(1)
    if url not in seen:
        fname = f"font-{len(seen):02d}.woff2"
        data = urllib.request.urlopen(
            urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30
        ).read()
        with open(f"{OUT_DIR}/{fname}", "wb") as f:
            f.write(data)
        seen[url] = fname
        print(f"{fname}: {len(data)//1024} KiB")
    block = re.sub(r"src:\s*url\([^)]+\)\s*format\('woff2'\);",
                   f"src: url('/fonts/{seen[url]}') format('woff2');", block)
    block = re.sub(r"\s*unicode-range:[^;]+;", "", block)  # latin-only site; drop ranges
    out_css.append(block.strip())

with open(OUT_CSS, "w") as f:
    f.write("/* Self-hosted fonts (was fonts.googleapis.com) — removes a render-blocking\n"
            "   third-party request. Regenerate with scripts/selfhost-fonts.py. */\n\n"
            + "\n\n".join(out_css) + "\n")
print(f"wrote {OUT_CSS} with {len(seen)} files, {sum(os.path.getsize(f'{OUT_DIR}/{f}') for f in set(seen.values()))//1024} KiB total")
