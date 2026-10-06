# يقص الفراغ الزايد حوالين كل بطل بصور assets/poses ويحفظ نسخة أصلية بمجلد poses_backup
# التشغيل: ضعه جنب index.html ثم:  python crop_poses.py
# (إذا ما اشتغل ثبّت المكتبة أول:  pip install pillow)
from pathlib import Path
from PIL import Image
import shutil

root = Path(__file__).parent / "assets" / "poses"
backup = Path(__file__).parent / "assets" / "poses_backup"
count = 0
for f in sorted(root.rglob("*")):
    if f.suffix.lower() not in (".png", ".webp", ".jpg", ".jpeg"):
        continue
    im = Image.open(f).convert("RGBA")
    alpha = im.getchannel("A")
    if alpha.getextrema()[0] < 250:                       # صورة شفافة
        mask = alpha.point(lambda a: 255 if a > 24 else 0)
    else:                                                  # صورة بخلفية سودة
        mask = im.convert("L").point(lambda v: 255 if v > 40 else 0)
    box = mask.getbbox()
    if not box:
        print("تخطّيت (ما لقيت شخص):", f); continue
    w, h = im.size
    px, py = int(w * .01), int(h * .01)
    box = (max(0, box[0]-px), max(0, box[1]-py), min(w, box[2]+px), min(h, box[3]+py))
    dest = backup / f.relative_to(root)
    if not dest.exists():
        dest.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(f, dest)
    out = im.crop(box)
    if f.suffix.lower() in (".jpg", ".jpeg"):
        out = out.convert("RGB")
    out.save(f)
    print(f"{f.relative_to(root)}: {w}x{h} -> {out.size[0]}x{out.size[1]}")
    count += 1
print(f"خلص: {count} صور انقصّت. النسخ الأصلية بـ assets/poses_backup")
