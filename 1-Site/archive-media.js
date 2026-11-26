/* Shared screen-sized artwork selection. The master stays available but is
   never fetched merely because the viewer opens at a smaller size. */
(() => {
  'use strict';
  const pools=new Map();
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pixelRatio=()=>Math.min(2,Math.max(1,globalThis.devicePixelRatio||1));
  function variants(media,path) {
    if(!path)return [];
    const raw=media?.variants?.[path]||[];
    const byWidth=new Map();
    for(const entry of raw)if(entry?.src&&entry.width>0)byWidth.set(entry.width,entry);
    const width=media?.sizes?.[path]?.[0];
    if(width>0&&!byWidth.has(width))byWidth.set(width,{src:path,width});
    return [...byWidth.values()].sort((a,b)=>a.width-b.width);
  }
  function select(media,path,cssWidth,dpr=pixelRatio()) {
    const choices=variants(media,path);
    const width=Math.max(1,Math.ceil(cssWidth*Math.min(2,Math.max(1,dpr||1))));
    return choices.find(v=>v.width>=width)||choices.at(-1)||{src:path,width:media?.sizes?.[path]?.[0]||0};
  }
  function attributes(media,path,sizes,fallbackWidth=640) {
    const choices=variants(media,path);
    const src=select(media,path,fallbackWidth,1).src;
    const srcset=choices.length>1?` srcset="${esc(choices.map(v=>`${v.src} ${v.width}w`).join(', '))}" sizes="${esc(sizes)}"`:'';
    return `src="${esc(src)}"${srcset}`;
  }
  function fitWidth(media,path,{poster=false,width=globalThis.innerWidth||1280,height=globalThis.innerHeight||720}={}) {
    const [w,h]=media?.sizes?.[path]||[poster?2:16,poster?3:9];
    const ratio=w/h;
    if(poster)return Math.min(width-(width<=560?28:40),height*.82*ratio);
    return Math.min(width-24,Math.max(100,height-150)*ratio);
  }
  function preload(src,priority='low') {
    if(!src)return Promise.resolve(null);
    if(pools.has(src)){
      const cached=pools.get(src);
      if(priority==='high')cached.image.fetchPriority='high';
      return cached.promise;
    }
    const image=new Image(); image.decoding='async'; image.fetchPriority=priority;
    const record={image,promise:null};
    const promise=new Promise(resolve=>{
      image.onload=()=>{const ready=()=>resolve(image); image.decode?.().then(ready,ready) || ready();};
      image.onerror=()=>{pools.delete(src);resolve(null);};
      image.src=src;
    });
    record.promise=promise;pools.set(src,record);
    // A handful of current/next images is enough; do not retain an entire gallery.
    while(pools.size>8)pools.delete(pools.keys().next().value);
    return promise;
  }
  const api=Object.freeze({variants,select,attributes,fitWidth,preload,pixelRatio});
  globalThis.ArchiveMedia=api;
  if(typeof module!=='undefined')module.exports=api;
})();
