"""Create compressed screen renditions without touching original stills."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image
import hashlib, json

root=Path(__file__).resolve().parents[1]
site=root/'1-Site'
def actual(p):
    f=site/p
    return f if f.exists() else root/'2-Artwork/films'/Path(p).name

def replace(text,key,anchor,value):
    offset=text.index('"'+key+'":',text.index(anchor))+len(key)+3
    while text[offset].isspace(): offset+=1
    _,used=json.JSONDecoder().raw_decode(text[offset:])
    prefix=text[text.rfind('\n',0,offset)+1:offset]
    indent=len(prefix)-len(prefix.lstrip(' '))
    data=json.dumps(value,ensure_ascii=False,indent=2).replace('\n','\n'+' '*indent)
    return text[:offset]+data+text[offset+used:]

def write_entries(text,anchor,old,updates):
    additions={}
    for path,value in updates.items():
        if path in old: text=replace(text,path,anchor,value)
        else: additions[path]=value
    if not additions: return text
    at=text.index(anchor)+len(anchor)
    indent=len(anchor)-len(anchor.lstrip(' '))
    body='\n'.join(' '*indent+line for line in json.dumps(additions,ensure_ascii=False,indent=2).splitlines()[1:-1])
    return text[:at]+'\n'+body+','+text[at:]

def make(job):
    path,records,width=job
    src=actual(path)
    with Image.open(src) as original:
        w,h=original.size
        renditions={v['width']:dict(v) for v in records}
        if w>=2800 and not any(2400<=k<=2800 for k in renditions): requested=[2560,w]
        else: requested=[w]
        dims={}; before=src.stat().st_size; added=[]
        for desired in requested:
            if desired in renditions and renditions[desired]['src']!=path: continue
            stem=hashlib.sha1(path.encode()).hexdigest()[:12]
            output=f'assets/films/responsive/screen-{stem}-{desired}w.webp'
            target=site/output
            rgb=original.convert('RGB')
            if desired!=w: rgb=rgb.resize((desired,round(h*desired/w)),Image.Resampling.LANCZOS)
            if not target.exists():
                extra={'icc_profile':original.info['icc_profile']} if original.info.get('icc_profile') else {}
                rgb.save(target,quality=88,method=3,**extra)
            dims[output]=list(rgb.size)
            renditions[desired]={'src':output,'width':desired}
            added.append((desired,target.stat().st_size))
        if added: print(f'{path}: master {round(before/1024)} KB; screen '+', '.join(f'{w}w {round(s/1024)} KB' for w,s in added),flush=True)
        return path,list(sorted(renditions.values(),key=lambda v:v['width'])),dims

def update(filename,paths,indent):
    doc=site/'content'/filename
    original=doc.read_text(encoding='utf-8')
    data=json.loads(original)
    media=data.get('media',data); sizes,variants=media['sizes'],media['variants']
    jobs=[]
    for path in sorted(set(paths)):
        f=actual(path); dim=sizes.get(path)
        if f.is_file() and dim and dim[0]>=1600 and f.stat().st_size>=1024*1024:
            records=variants.get(path,[{'src':path,'width':dim[0]}])
            jobs.append((path,records,dim[0]))
    with ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(make,jobs))
    new_sizes={}; new_variants={}
    for path,records,dims in results:
        if dims:
            new_sizes.update(dims);new_variants[path]=records
    if not new_sizes: return
    updated=write_entries(original,indent+'"sizes": {',sizes,new_sizes)
    updated=write_entries(updated,indent+'"variants": {',variants,new_variants)
    check=json.loads(updated); new=check.get('media',check)
    for path in new_variants: assert any(v['width']==sizes[path][0] for v in new['variants'][path])
    assert all(new['sizes'][p]==v for p,v in new_sizes.items())
    doc.write_text(updated,encoding='utf-8',newline='\n')
    print(f'{filename}: {len(new_variants)} optimized masters, {len(new_sizes)} screen renditions',flush=True)

for name in ('2010-2019.json','2020-2026.json'):
    d=json.loads((site/'content'/name).read_text(encoding='utf-8'))
    paths=[r['path'] for gallery in d['galleries'].values() for r in gallery]
    update(name,paths,'    ')
catalog=json.loads((site/'content/catalog.json').read_text(encoding='utf-8'))
paths=[catalog['homeCover']['cover']]+[x[k] for x in catalog['editions'] for k in ('cover','cardImage') if x.get(k)]
update('artwork-variants.json',paths,'  ')
