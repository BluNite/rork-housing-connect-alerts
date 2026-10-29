# Builds Android launcher icons from the web brand icon (web-lottery-tracker/public/icon.png).
from PIL import Image, ImageDraw
import os
SRC = "web-lottery-tracker/public/icon.png"
RES = "android-nyc-lottery-tracker-an/app/src/main/res"
src = Image.open(SRC).convert("RGBA")
bg = src.getpixel((4, 4))
print("corner color", bg)
dens = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
for d, s in dens.items():
    os.makedirs(f"{RES}/mipmap-{d}", exist_ok=True)
    # adaptive foreground: 108dp canvas, art scaled to 72% so the mask never clips it
    fg = int(108 * s); art = int(fg * 0.72)
    canvas = Image.new("RGBA", (fg, fg), bg)
    canvas.paste(src.resize((art, art), Image.LANCZOS), ((fg - art) // 2,) * 2)
    canvas.save(f"{RES}/mipmap-{d}/ic_launcher_foreground.png")
    # legacy icons (API 24-25): 48dp
    n = int(48 * s)
    sq = src.resize((n, n), Image.LANCZOS)
    m = Image.new("L", (n, n), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, n - 1, n - 1), radius=n // 5, fill=255)
    out = Image.new("RGBA", (n, n), (0, 0, 0, 0)); out.paste(sq, (0, 0), m); out.save(f"{RES}/mipmap-{d}/ic_launcher.png")
    c = Image.new("L", (n, n), 0); ImageDraw.Draw(c).ellipse((0, 0, n - 1, n - 1), fill=255)
    out = Image.new("RGBA", (n, n), (0, 0, 0, 0)); out.paste(sq, (0, 0), c); out.save(f"{RES}/mipmap-{d}/ic_launcher_round.png")
# splash/loading mark
src.resize((288, 288), Image.LANCZOS).save(f"{RES}/drawable-nodpi/brand_mark.png") if os.makedirs(f"{RES}/drawable-nodpi", exist_ok=True) is None else None
print("#%02X%02X%02X" % bg[:3])
