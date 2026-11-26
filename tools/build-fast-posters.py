"""Generate lighter viewer-only renditions while retaining poster masters."""
from pathlib import Path
import json
import hashlib
from PIL import Image

site = Path(__file__).resolve().parents[1] / "1-Site"

def replace_value(text, key, anchor, value):
    offset = text.index('"' + key + '":', text.index(anchor)) + len(key) + 3
    while text[offset].isspace():
        offset += 1
    _, length = json.JSONDecoder().raw_decode(text[offset:])
    return text[:offset] + json.dumps(value, ensure_ascii=False, separators=(',', ':')) + text[offset+length:]

for edition in ("2010-2019", "2020-2026"):
    doc = site / "content" / (edition + ".json")
    original = doc.read_text(encoding="utf-8")
    model = json.loads(original)
    variants = model["media"]["variants"]
    updated = original
    for path in sorted({film["poster"] for film in model["media"]["films"].values() if film.get("poster")}):
        master = site / path
        choices = {v["width"]: v for v in variants.get(path, [])}
        heavy = [w for w, v in choices.items() if 480 <= w <= 1500 and (site/v["src"]).is_file() and (site/v["src"]).stat().st_size > 180000]
        if not master.is_file() or not heavy:
            continue
        with Image.open(master) as poster:
            width, height = poster.size
            planned = set(heavy)
            if width >= 480:
                planned.add(480)
            if width >= 1000 and max(heavy) >= 960:
                planned.update(w for w in [800, 1120, 1440] if w < width and w not in choices)
            for w in sorted(planned):
                old = choices.get(w)
                stem = hashlib.sha1(path.encode()).hexdigest()[:12]
                rel = f"assets/films/responsive/quick-poster-{stem}-{w}w.webp"
                if old and old["src"] == rel:
                    continue
                image = poster.convert("RGB")
                if w != width:
                    image = image.resize((w, round(height*w/width)), Image.Resampling.LANCZOS)
                target = site / rel
                options = {"icc_profile":poster.info["icc_profile"]} if poster.info.get("icc_profile") else {}
                image.save(target, quality=81, method=5, **options)
                before = (site/old["src"]).stat().st_size if old else 0
                choices[w] = {"src":rel, "width":w}
                print(f"{master.name} / {w}w: {before//1024 if before else 'new'} -> {target.stat().st_size//1024} KB")
        updated = replace_value(updated,path,'    "variants": {',list(sorted(choices.values(),key=lambda v:v["width"])))
    if updated != original:
        json.loads(updated)
        doc.write_text(updated,encoding="utf-8",newline="\n")
