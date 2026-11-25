/* 10 — The pointer remains native. Motion belongs to the photograph, and
   only once it has been explicitly opened. Keep the preceding frame visible
   while decoding the next one; obsolete requests never replace a newer one. */
(() => {
  'use strict';
  const settings=window.ArchiveFeatures;
  if (!settings?.enabled('10')) return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pending=new WeakMap(), animations=new WeakMap();
  function cancel(image) {
    pending.delete(image);
    animations.get(image)?.cancel();
    animations.delete(image);
  }
  function present(image,src,commit) {
    cancel(image);
    const previous=image.getAttribute('src');
    const job={src}; pending.set(image,job);
    const isCurrent=()=>pending.get(image)===job && Boolean(image.closest('dialog[open]'));
    const finish=(animate)=>{
      if (!isCurrent()) return;
      commit();
      // An opening dialog already dissolves as a whole. The image transition
      // is reserved for a new still in the already-open lightbox.
      if (!animate || reduced.matches || !image.animate) return;
      const lens=settings.frameVariant==='lens';
      const animation=image.animate(lens
        ? [{opacity:.72,transform:'scale(.985)'},{opacity:1,transform:'scale(1)'}]
        : [{opacity:.62},{opacity:1}],
        {duration:lens?240:220,easing:'cubic-bezier(.2,.65,.35,1)'});
      animations.set(image,animation);
      animation.finished.catch(()=>{}).finally(()=>{if(animations.get(image)===animation)animations.delete(image);});
    };
    if (!previous || previous===src || reduced.matches) { finish(false); return; }
    const incoming=new Image(); incoming.src=src;
    if (incoming.complete && incoming.naturalWidth) { finish(true); return; }
    incoming.decode().then(()=>finish(true)).catch(()=>finish(false));
  }
  reduced.addEventListener('change',()=>{
    const image=document.getElementById('full-frame-image');
    if (image && reduced.matches) {animations.get(image)?.cancel();animations.delete(image);}
  });
  window.ArchiveFrameMotion=Object.freeze({present,cancel});
})();
