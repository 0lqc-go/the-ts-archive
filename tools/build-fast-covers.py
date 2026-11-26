"""Compress large front-page and decade screen renditions, not masters."""
from pathlib import Path
import hashlib
import json
from PIL import Image

site = Path(__file__).resolve().parents[1] / '1-Site'
catalog = json.loads((site/'content/catalog.json').read_text(encoding='utf-8'))
doc = site/'content/artwork-variants.json'
shared = json.loads(doc.read_text(encoding='utf-8'))
paths = {catalog['homeCover']['cover'], *(e[key] for e in catalog['editions'] for key in ('cover','cardImage') if e.get(key))}

for p in sorted(paths):
    source = site/p
    if not source.is_file():
        continue
    choices = {v['width']:v for v in shared['variants'].get(p, [])}
    with Image.open(source) as original:
        w,h = original.size
        choices.setdefault(w,{'src':p,'width':w})
        if len(choices)==1:
            widths = [i for i in (640,960,1280) if i<w]
        else:
            widths = [i for i,v in choices.items() if i>=1280 and (site/v['src']).is_file() and (site/v['src']).stat().st_size>180000 and i<=3840]
        if w>=3840 and 2560 in choices and 3840 in choices:
            widths += [3200] if 3200 not in choices else []
        for desired in sorted(set(widths)):
            old = choices.get(desired)
            rel = f'assets/films/responsive/quick-cover-{hashlib.sha1(p.encode()).hexdigest()[:12]}-{desired}w.webp'
            if old and old['src']==rel:
                continue
            im = original.convert('RGB')
            if desired != w:
                im = im.resize((desired,round(h*desired/w)),Image.Resampling.LANCZOS)
            target = site/rel
            info = {'icc_profile':original.info['icc_profile']} if original.info.get('icc_profile') else {}
            im.save(target,quality=83,method=5,**info)
            previous = (site/old['src']).stat().st_size if old else 0
            if old and previous <= target.stat().st_size:
                # Do not replace an already lighter rendition.
                target.unlink()
                continue
            choices[desired] = {'src':rel,'width':desired}
            shared['sizes'][rel] = list(im.size)
            print(f'{source.name} / {desired}w: {previous//1024 if previous else "new"} -> {target.stat().st_size//1024} KB')
        shared['variants'][p] = sorted(choices.values(),key=lambda v:v['width'])

doc.write_text(json.dumps(shared,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
