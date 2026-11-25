/* 05 — Keep a journey or index alive behind its detail layer. The old
   tab-local return record remains a fallback for ordinary document navigation. */
(() => {
  'use strict';
  const features = window.ArchiveFeatures;
  if (!features?.enabled('05')) return;
  const prefix = 'ts-archive-visit-v1:';
  const here = new URL(location.href);
  const directory = new URL('./',here);
  const providers = new Map();
  const visitKey = /^[a-z0-9-]{6,80}$/;
  const layerId=here.searchParams.get('layer');
  let sameParent=false;try{sameParent=window.parent!==window&&window.parent.location.origin===location.origin;}catch{}
  const embedded=Boolean(layerId&&visitKey.test(layerId)&&sameParent&&/^https?:$/.test(here.protocol));
  const canLayer=!embedded&&window.parent===window&&/^https?:$/.test(here.protocol)&&typeof HTMLDialogElement!=='undefined';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  if (embedded) document.documentElement.classList.add('ts-archive-embedded');
  function route(value) {
    try {
      const url = new URL(value,here);
      if (url.protocol !== directory.protocol || url.origin !== directory.origin || !url.pathname.startsWith(directory.pathname)) return null;
      return /^(?:|index\.html|awards\.html|snubs\.html|list\.html|screening-room\.html|cinema-profile\.html)$/.test(url.pathname.slice(directory.pathname.length)) ? url : null;
    } catch { return null; }
  }
  function entry(id) {
    if (!visitKey.test(id || '')) return null;
    try {
      const item = JSON.parse(sessionStorage.getItem(prefix + id));
      return item && Date.now() - item.time < 86400000 && route(item.source) ? item : null;
    } catch { return null; }
  }
  function samePage(a,b) {
    return a && b && a.origin === b.origin && a.pathname === b.pathname && a.search === b.search;
  }
  const dossierRoute=target=>Boolean(target&&/\bawards\.html$/.test(target.pathname)&&['film','artist','award'].some(key=>target.searchParams.has(key)));
  const nextId=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`;
  const layers=[], remembered=new Map();
  let lastEmbeddedTrigger=null, readySent=false;
  function tellParent(action,extra={}) {
    if (!embedded) return false;
    window.parent.postMessage({archiveLayer:layerId,action,...extra},location.origin);
    return true;
  }
  function cleanTarget(value) {
    const target=route(features.linkSettings(value));
    if (!target) return null;
    for(const param of ['layer','visit','resume'])target.searchParams.delete(param);
    return target;
  }
  function rootReady(dialog) {
    if (!embedded || readySent || !dialog?.open) return;
    readySent=true;
    // Wait a short, bounded moment for the actual hero artwork, not the
    // underlying edition's assets. The parent keeps the original view intact.
    const art=dialog.querySelector('.film-file-frame img,.ceremony-frame img');
    const decoded=art?.decode ? art.decode().catch(()=>{}) : Promise.resolve();
    Promise.race([decoded,new Promise(resolve=>setTimeout(resolve,360))]).then(()=>{
      if (dialog.open) tellParent('ready');
      else readySent=false;
    });
  }
  function createLayer(destination, trigger, record=null) {
    const target=cleanTarget(destination);
    if (!canLayer||!dossierRoute(target)) return false;
    const id=record?.id||nextId(), parentId=layers.at(-1)?.id||null;
    const dialog=document.createElement('dialog');
    dialog.className='archive-detail-layer';
    dialog.setAttribute('aria-label','Archive details');
    const frame=document.createElement('iframe');
    frame.className='archive-detail-frame'; frame.title='Archive details';
    frame.referrerPolicy='same-origin';
    const url=new URL(target.href);
    for (const param of ['from','journey','shot'])url.searchParams.delete(param);
    url.searchParams.set('layer',id);
    // Set src before insertion so its first load replaces an empty frame,
    // rather than adding an extra navigable entry to the browser history.
    frame.src=url.href;
    const wait=document.createElement('div');wait.className='archive-layer-wait';
    const note=document.createElement('span');note.setAttribute('role','status');note.textContent='Opening…';
    const cancel=document.createElement('button');cancel.type='button';cancel.textContent='✕';cancel.setAttribute('aria-label','Close archive details');
    wait.append(note,cancel); dialog.append(frame,wait);
    const layer={id,parentId,destination:target.href,dialog,frame,wait,note,opener:trigger instanceof HTMLElement?trigger:document.activeElement,scroll:window.scrollY,closing:false,pushed:Boolean(record)};
    if (!record) {
      try { history.pushState({...history.state,tsArchiveLayer:id},'',location.href); layer.pushed=true; } catch {}
    }
    layers.push(layer); remembered.set(id,{id,parentId,destination:target.href,opener:layer.opener});
    if(remembered.size>32) {const first=remembered.keys().next().value;if(!layers.some(item=>item.id===first))remembered.delete(first);}
    cancel.addEventListener('click',()=>requestLayerClose(layer));
    dialog.addEventListener('cancel',event=>{event.preventDefault();requestLayerClose(layer);});
    layer.timeout=setTimeout(()=>{
      if(layer.dialog.classList.contains('is-ready')||layer.closing)return;
      note.textContent='Could not open details.';
      const normal=document.createElement('a');normal.href=target.href;normal.textContent='Open page instead';normal.className='archive-layer-fallback';
      normal.addEventListener('click',event=>{event.preventDefault();location.assign(prepare(target,layer.opener));});wait.prepend(normal);
    },6000);
    document.body.append(dialog);
    dialog.showModal();
    document.body.classList.add('dialog-open');
    return true;
  }
  function removeLayer(layer,animate=true) {
    if (!layers.includes(layer)) return;
    layers.splice(layers.indexOf(layer),1);
    clearTimeout(layer.timeout);clearTimeout(layer.backup);
    const remaining=layers.at(-1);
    layer.closing=true; layer.dialog.classList.add('is-leaving');
    const finish=()=>{
      layer.dialog.close(); layer.dialog.remove();
      if (!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');
      if (remaining&&layers.at(-1)===remaining) {
        remaining.frame.focus({preventScroll:true});
        remaining.frame.contentWindow?.postMessage({archiveLayer:remaining.id,action:'resume'},location.origin);
      } else if (!layers.length) {
        if (layer.opener?.isConnected) layer.opener.focus({preventScroll:true});
        if(Math.abs(window.scrollY-layer.scroll)>1)window.scrollTo({top:layer.scroll,behavior:'instant'});
      }
    };
    if(animate&&!motion.matches)setTimeout(finish,150);else finish();
  }
  function requestLayerClose(layer) {
    if (layer!==layers.at(-1)||layer.closing) return;
    layer.closing=true;
    if (layer.pushed&&history.state?.tsArchiveLayer===layer.id) {
      history.back();
      // Some embedded browsing contexts can consume a history entry. Keep
      // closing reliable even if the corresponding top-level event is absent.
      layer.backup=setTimeout(()=>{if(layers.includes(layer)){const next={...history.state};delete next.tsArchiveLayer;try{history.replaceState(next,'',location.href);}catch{}removeLayer(layer);}},400);
    } else removeLayer(layer);
  }
  if(canLayer){
    // Reloads start clean; same-document Back/Forward can restore remembered
    // layers without ever re-rendering the source page.
    if(history.state?.tsArchiveLayer){const clean={...history.state};delete clean.tsArchiveLayer;try{history.replaceState(clean,'',location.href);}catch{}}
    window.addEventListener('popstate',event=>{
      const target=event.state?.tsArchiveLayer||null;
      const known=target?remembered.get(target):null;
      let desired=[];
      for(let record=known;record;record=record.parentId?remembered.get(record.parentId):null)desired.unshift(record);
      let same=0;while(same<desired.length&&layers[same]?.id===desired[same].id)same++;
      const removed=layers.slice(same).reverse();
      removed.forEach((layer,i)=>removeLayer(layer,removed.length===1&&i===0&&same===desired.length));
      for(const record of desired.slice(same))createLayer(record.destination,record.opener,record);
    });
  }
  window.addEventListener('message',event=>{
    if(event.origin!==location.origin||!event.data||typeof event.data!=='object')return;
    const {archiveLayer,action,destination}=event.data;
    if(embedded){
      if(event.source===window.parent&&archiveLayer===layerId&&action==='resume'&&lastEmbeddedTrigger?.isConnected)lastEmbeddedTrigger.focus({preventScroll:true});
      return;
    }
    const layer=layers.find(item=>item.id===archiveLayer&&item.frame.contentWindow===event.source);
    if(!layer||layer.closing)return;
    if(action==='ready'){
      clearTimeout(layer.timeout);layer.wait.hidden=true;layer.dialog.classList.add('is-ready');
      // Keep the child's original focused heading/control; focusing only the
      // frame transfers keyboard input without resetting that inner focus.
      if(layer===layers.at(-1))layer.frame.focus({preventScroll:true});
    } else if(layer!==layers.at(-1))return;
    else if(action==='close')requestLayerClose(layer);
    else if(action==='open')createLayer(destination,layer.frame);
    else if(action==='navigate'){
      const target=cleanTarget(destination);
      if(target)location.assign(target.href);
    }
  });
  const navId = here.searchParams.get('visit');
  const origin = navId ? entry(navId) : null;
  const resumeId = here.searchParams.get('resume') || history.state?.tsArchiveResume;
  const resume = resumeId ? entry(resumeId) : null;
  let restored = false;
  function clearResume() {
    const state = {...history.state};
    delete state.tsArchiveResume;
    const url = new URL(location.href); url.searchParams.delete('resume');
    try { history.replaceState(state,'',url); } catch {}
  }
  function restoreScroll() {
    if (!resume || restored) return;
    restored = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo({top:Math.max(0,Number(resume.scroll)||0),behavior:'instant'});
      if (!$('dialog[open]') && resume.focus) document.getElementById(resume.focus)?.focus({preventScroll:true});
      clearResume();
    }));
  }
  const $ = selector => document.querySelector(selector);
  function register(name, capture, restore) {
    providers.set(name,{capture,restore});
    if (resume?.states && Object.hasOwn(resume.states,name)) {
      try { restore(resume.states[name]); } catch (error) { console.warn('Archive return could not restore',name,error); }
    }
    if (resume && (name === 'dossiers' || name === 'page' || name === 'screening')) restoreScroll();
  }
  function prepare(destination,trigger) {
    const target = route(features.linkSettings(destination));
    if (!target) return destination;
    if (!/\bawards\.html$/.test(target.pathname) || !['film','artist','award'].some(key=>target.searchParams.has(key))) return target.href;
    const id = nextId();
    const source = new URL(location.href);
    source.searchParams.delete('resume');
    const states = {};
    for (const [name,provider] of providers) {
      try { const value=provider.capture(trigger); if (value != null) states[name]=value; } catch {}
    }
    const record = {source:source.href,scroll:window.scrollY,focus:trigger?.id || document.activeElement?.id || '',states,time:Date.now()};
    try {
      // Keep the last few visits for native Back/Forward without accumulating
      // stale entries indefinitely. Each visit is valid only in this tab.
      const keys = Object.keys(sessionStorage).filter(key=>key.startsWith(prefix)).sort();
      while (keys.length >= 24) sessionStorage.removeItem(keys.shift());
      sessionStorage.setItem(prefix+id,JSON.stringify(record));
      history.replaceState({...history.state,tsArchiveResume:id},'',source);
      target.searchParams.set('visit',id);
    } catch { /* Navigation itself continues when storage is disabled. */ }
    return target.href;
  }
  function returnToOrigin() {
    if (embedded) return tellParent('close');
    if (!origin) return false;
    const source = route(origin.source);
    if (!source) return false;
    const previous = document.referrer ? route(document.referrer) : null;
    if (history.length > 1 && samePage(previous,source)) history.back();
    else {
      source.searchParams.set('resume',navId);
      location.replace(source.href);
    }
    return true;
  }
  function navigate(destination,trigger) {
    const target=cleanTarget(destination);
    if(target&&embedded){
      lastEmbeddedTrigger=trigger instanceof HTMLElement?trigger:document.activeElement;
      return tellParent(dossierRoute(target)?'open':'navigate',{destination:target.href});
    }
    if(target&&createLayer(target,trigger))return true;
    location.href=prepare(destination,trigger);return false;
  }
  window.addEventListener('pageshow',event => {
    if (event.persisted) { clearResume(); return; }
    if (resume && !['home','awards','snubs','list','screening'].includes(document.body.dataset.page)) restoreScroll();
  });
  document.addEventListener('click',event => {
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    // The visual index remains open, including its selected scope, filters,
    // result scroll and preview. This also covers its same-edition buttons.
    if(canLayer||embedded){
      const row=event.target.closest?.('#index-dialog .index-row[data-result-edition]');
      if(row){
        const kind=row.dataset.resultFilm?'film':row.dataset.resultAward?'award':row.dataset.resultPerson?'artist':null;
        if(kind){
          const result=kind==='film'?row.dataset.resultFilm:kind==='award'?row.dataset.resultAward:row.dataset.resultPerson;
          const target=new URL('awards.html',here);target.searchParams.set('edition',row.dataset.resultEdition);target.searchParams.set(kind,result);
          event.preventDefault();event.stopImmediatePropagation();navigate(target,row);return;
        }
      }
    }
    const a = event.target.closest?.('a[href]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    // Dossier links with a local action are handled in the current dialog.
    if (a.matches('[data-film-file],[data-frame-award]')||(!embedded&&a.matches('[data-archive-anchor]'))) return;
    const target = route(a.href);
    if (!target || (!embedded&&!dossierRoute(target)) || a.getAttribute('href').startsWith('#')) return;
    event.preventDefault();
    if(embedded)event.stopImmediatePropagation();
    navigate(target,a);
  },true);
  window.ArchiveContinuity = Object.freeze({register,prepare,navigate,returnToOrigin,ready:rootReady,embedded,hasOrigin:Boolean(origin)||embedded,resuming:Boolean(resume?.states?.dossiers)});
})();
