"""Draw numbered callouts on audit screenshots. All boxes come from measured
getBoundingClientRect() values, never eyeballed. Output goes to annotated/."""
from PIL import Image, ImageDraw, ImageFont
import pathlib

BASE = pathlib.Path("/Users/antonioduran/Desktop/aitokenglobal/audits/2026-08-06")
SH, OUT = BASE / "screenshots", BASE / "annotated"
OUT.mkdir(exist_ok=True)

STROKE = (200, 40, 30)
FONTS = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]


def font(sz):
    for f in FONTS:
        if pathlib.Path(f).exists():
            try:
                return ImageFont.truetype(f, sz)
            except Exception:
                pass
    return ImageFont.load_default()


def annotate(src, dst, boxes, crop=None):
    """boxes: list of (x, y, w, h) in FULL-IMAGE coordinates, drawn in order."""
    im = Image.open(SH / src).convert("RGB")
    ox = oy = 0
    if crop:
        t, b = crop
        t, b = max(0, t), min(im.height, b)
        im = im.crop((0, t, im.width, b))
        oy = t
    d = ImageDraw.Draw(im)
    W = im.width
    lw = max(2, round(W / 320))
    pad = lw * 2
    r = 12
    badge = max(15, round(W / 62))
    fnt = font(int(badge * 1.15))

    for i, (x, y, w, h) in enumerate(boxes, 1):
        x0, y0 = x - ox - pad, y - oy - pad
        x1, y1 = x - ox + w + pad, y - oy + h + pad
        d.rounded_rectangle([x0, y0, x1, y1], radius=r, outline=STROKE, width=lw)
        # badge straddles the top-left corner so it never masks content above the box
        bx = min(max(badge, x0), im.width - badge)
        by = min(max(badge, y0), im.height - badge)
        d.ellipse([bx - badge, by - badge, bx + badge, by + badge], fill=STROKE)
        t = str(i)
        tb = d.textbbox((0, 0), t, font=fnt)
        d.text((bx - (tb[2] - tb[0]) / 2, by - (tb[3] - tb[1]) / 2 - tb[1]), t,
               fill="white", font=fnt)

    im.save(OUT / dst)
    print(f"{dst}  {im.width}x{im.height}  callouts={len(boxes)}")


# 1. api-compare: nav promises a comparison, page delivers none, CTA leaves the domain.
annotate("api-compare-desktop-fold-dismissed.png", "fig1-api-compare.png",
         [(776, 15, 140, 33), (360, 767, 1200, 164)])

# 2. compliance: both enterprise CTAs link to the page they sit on.
annotate("compliance-desktop-full.png", "fig2-compliance-selflink.png",
         [(1280, 1030, 232, 38), (424, 1248, 345, 44)], crop=(960, 1360))

# 3. claude-api: Claude 3.x prices presented as the pricing reference.
annotate("claude-api-desktop-full.png", "fig3-stale-pricing.png",
         [(360, 1700, 872, 122)], crop=(1620, 1900))

# 4. home: the only lead-capture form on the site, inert.
annotate("home-desktop-full.png", "fig4-dead-newsletter.png",
         [(740, 6252, 440, 50)], crop=(6100, 6420))

# 5. mobile: consent dialog covering 27.5% of the fold, privacy link href="#".
annotate("home-mobile-fold.png", "fig5-mobile-consent.png",
         [(16, 600, 358, 232), (112, 744, 87, 18)])
