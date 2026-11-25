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
  const hostId=here.searchParams.get('layer');
  let sameParent=false;try{sameParent=window.parent!==window&&window.parent.location.origin===location.origin;}catch{}
  const embedded=Boolean(hostId&&visitKey.test(hostId)&&sameParent&&/^https?:$/.test(here.protocol));
  const canLayer=!embedded&&window.parent===window&&/^https?:$/.test(here.protocol)&&typeof HTMLDialogElement!=='undefined';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  if (embedded) document.documentElement.classList.add('ts-archive-embedded');
  // Keep one promise per catalogue file for the lifetime of the source page.
  // A child dossier uses that very same promise, including in-flight reads.
  // The first request still revalidates so a fresh page sees new deployments.
  const contentReads=new Map();
  function readContent(value) {
    let url;
    try { url=new URL(value,directory); } catch { return Promise.reject(new Error('Invalid archive data path')); }
    if(url.protocol!==directory.protocol||url.origin!==directory.origin||!url.pathname.startsWith(directory.pathname+'content/')||!url.pathname.endsWith('.json'))return Promise.reject(new Error('Invalid archive data path'));
    url.hash='';
    if(embedded) {
      try { if(window.parent.ArchiveContinuity?.readContent)return window.parent.ArchiveContinuity.readContent(url.href); } catch {}
    }
    const key=url.href;
    if(!contentReads.has(key)) {
      const request=fetch(key,{cache:'no-cache'}).then(response=>{
        if(!response.ok)throw new Error('Could not load archive data');
        return response.json();
      }).catch(error=>{contentReads.delete(key);throw error;});
      contentReads.set(key,request);
    }
    return contentReads.get(key);
  }
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
  const layers=[], remembered=new Map(), hosts=new Set();
  const fadeMillis=120;
  let lastEmbeddedTrigger=null, readySent=false, embeddedVisit=null, renderer=null;
  function tellParent(action,extra={}) {
    if (!embedded) return false;
    window.parent.postMessage({archiveLayer:hostId,archiveVisit:embeddedVisit,action,...extra},location.origin);
    return true;
  }
  function cleanTarget(value) {
    let target;try{target=route(features.linkSettings(value));}catch{return null;}
    if (!target) return null;
    for(const param of ['layer','visit','resume'])target.searchParams.delete(param);
    return target;
  }
  function rootReady(dialog) {
    if (!embedded || readySent || !dialog?.open) return;
    readySent=true;
    // The details are usable as soon as the DOM is ready. The full-quality
    // hero can finish decoding in its own reserved space; it never gates UI.
    tellParent('ready');
  }
  function registerLayerRenderer(value) {
    if(!embedded)return;
    renderer=value;
    // Direct embedded deep links from the previous release still work.
    if(dossierRoute(here)) {
      try { if(!renderer.open(here))tellParent('error'); } catch {tellParent('error');}
    } else tellParent('booted');
  }
  function layerError(){tellParent('error');}
  const editionOf=target=>target.searchParams.get('edition')||'';
  function send(host,action,extra={}) {
    host.frame.contentWindow?.postMessage({archiveLayer:host.id,action,...extra},location.origin);
  }
  function disposeHost(host) {
    if(host.layer)return;
    clearTimeout(host.bootTimeout);
    hosts.delete(host);
    host.dialog.remove();
  }
  function trimHosts() {
    const idle=[...hosts].filter(host=>!host.layer).sort((a,b)=>b.usedAt-a.usedAt);
    // One parked edition on memory-constrained devices; two on desktop.
    const limit=navigator.deviceMemory&&navigator.deviceMemory<=4?1:2;
    idle.slice(limit).forEach(disposeHost);
  }
  function makeHost(edition) {
    const id=nextId();
    const dialog=document.createElement('dialog');
    dialog.className='archive-detail-layer';
    dialog.setAttribute('aria-label','Archive details');
    const frame=document.createElement('iframe');
    frame.className='archive-detail-frame'; frame.title='Archive details';
    frame.referrerPolicy='same-origin';
    // This URL identifies an edition shell, not a specific film. Keeping the
    // iframe in its original DOM position retains parsed code and data.
    const url=new URL('awards.html',directory);
    if(edition)url.searchParams.set('edition',edition);
    url.searchParams.set('layer',id);
    // Set src before insertion so its first load replaces an empty frame,
    // rather than adding an extra navigable entry to the browser history.
    frame.src=url.href;
    const wait=document.createElement('div');wait.className='archive-layer-wait';
    const note=document.createElement('span');note.setAttribute('role','status');
    const cancel=document.createElement('button');cancel.type='button';cancel.textContent='✕';cancel.setAttribute('aria-label','Close archive details');
    wait.append(note,cancel);wait.hidden=true;dialog.append(frame,wait);
    const host={id,edition,dialog,frame,wait,note,cancel,layer:null,booted:false,usedAt:performance.now(),failed:false};
    hosts.add(host);
    cancel.addEventListener('click',()=>{if(host.layer)requestLayerClose(host.layer);});
    dialog.addEventListener('cancel',event=>{event.preventDefault();if(host.layer)requestLayerClose(host.layer);});
    host.bootTimeout=setTimeout(()=>{if(!host.booted){host.failed=true;if(host.layer)showFallback(host.layer);else disposeHost(host);}},12000);
    document.body.append(dialog);
    trimHosts();
    return host;
  }
  function parkedHost(edition) {
    return [...hosts].filter(host=>host.edition===edition&&!host.layer&&!host.failed).sort((a,b)=>Number(b.booted)-Number(a.booted)||b.usedAt-a.usedAt)[0];
  }
  function selectLayer(layer) {
    if(layer.host.layer!==layer||layer.closing||!layer.host.booted||layer.selected)return;
    layer.selected=true;
    send(layer.host,'select',{archiveVisit:layer.id,destination:layer.destination});
  }
  function showFallback(layer) {
    if(layer.closing||layer.dialog.classList.contains('is-ready')||layer.host.layer!==layer)return;
    clearTimeout(layer.waitTimer);
    layer.wait.hidden=false;
    layer.note.textContent='Taking longer than usual.';
    if(layer.wait.querySelector('.archive-layer-fallback'))return;
    const normal=document.createElement('a');normal.href=layer.destination;normal.textContent='Open page instead';normal.className='archive-layer-fallback';
    normal.addEventListener('click',event=>{event.preventDefault();location.assign(prepare(layer.destination,layer.opener));});layer.wait.prepend(normal);
  }
  function createLayer(destination, trigger, record=null) {
    const target=cleanTarget(destination);
    if (!canLayer||!dossierRoute(target)) return false;
    const id=record?.id||nextId(),parentId=layers.at(-1)?.id||null;
    const host=parkedHost(editionOf(target))||makeHost(editionOf(target));
    const {dialog,frame,wait,note}=host;
    const layer={id,parentId,host,destination:target.href,dialog,frame,wait,note,opener:trigger instanceof HTMLElement?trigger:document.activeElement,scroll:window.scrollY,closing:false,pushed:Boolean(record)};
    host.layer=layer;host.usedAt=performance.now();
    dialog.classList.remove('is-ready','is-leaving');
    dialog.setAttribute('aria-busy','true');
    wait.querySelector('.archive-layer-fallback')?.remove();
    wait.hidden=true;note.textContent='';
    if (!record) {
      try { history.pushState({...history.state,tsArchiveLayer:id},'',location.href); layer.pushed=true; } catch {}
    }
    layers.push(layer); remembered.set(id,{id,parentId,destination:target.href,opener:layer.opener});
    if(remembered.size>32) {const first=remembered.keys().next().value;if(!layers.some(item=>item.id===first))remembered.delete(first);}
    // No loading flash for the ordinary cached case. Slow connections still
    // receive a cancellable status and a normal-page fallback.
    layer.waitTimer=setTimeout(()=>{if(!layer.closing&&!dialog.classList.contains('is-ready')){wait.hidden=false;note.textContent='Opening…';}},180);
    layer.timeout=setTimeout(()=>showFallback(layer),6500);
    dialog.showModal();
    document.body.classList.add('dialog-open');
    selectLayer(layer);
    return true;
  }
  function removeLayer(layer,animate=true) {
    if (!layers.includes(layer)) return;
    layers.splice(layers.indexOf(layer),1);
    clearTimeout(layer.timeout);clearTimeout(layer.waitTimer);clearTimeout(layer.backup);
    const remaining=layers.at(-1);
    layer.closing=true; layer.dialog.classList.add('is-leaving');
    const finish=()=>{
      const host=layer.host;
      if(host.layer!==layer)return;
      layer.dialog.close();
      host.layer=null;host.usedAt=performance.now();
      host.wait.hidden=true;host.dialog.removeAttribute('aria-busy');
      host.dialog.classList.remove('is-ready','is-leaving');
      if(host.booted&&!host.failed)send(host,'park',{archiveVisit:layer.id});
      else if(host.failed)disposeHost(host);
      trimHosts();
      if (!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');
      if (remaining&&layers.at(-1)===remaining) {
        remaining.frame.focus({preventScroll:true});
        send(remaining.host,'resume',{archiveVisit:remaining.id});
      } else if (!layers.length) {
        if (layer.opener?.isConnected) layer.opener.focus({preventScroll:true});
        if(Math.abs(window.scrollY-layer.scroll)>1)window.scrollTo({top:layer.scroll,behavior:'instant'});
      }
    };
    if(animate&&!motion.matches)setTimeout(finish,Math.max(0,fadeMillis-(performance.now()-(layer.closeAt??performance.now()))));else finish();
  }
  function requestLayerClose(layer) {
    if (layer!==layers.at(-1)||layer.closing) return;
    layer.closing=true;layer.closeAt=performance.now();
    // Start fading immediately; waiting for browser history must not delay
    // the visual return to the already-mounted journey or index.
    layer.dialog.classList.add('is-leaving');
    if (layer.pushed&&history.state?.tsArchiveLayer===layer.id) {
      history.back();
      // Some embedded browsing contexts can consume a history entry. Keep
      // closing reliable even if the corresponding top-level event is absent.
      layer.backup=setTimeout(()=>{if(layers.includes(layer)){const next={...history.state};if(layer.parentId)next.tsArchiveLayer=layer.parentId;else delete next.tsArchiveLayer;try{history.replaceState(next,'',location.href);}catch{}removeLayer(layer);}},250);
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
    const {archiveLayer,archiveVisit,action,destination}=event.data;
    if(embedded){
      if(event.source!==window.parent||archiveLayer!==hostId||!renderer)return;
      if(action==='select'&&visitKey.test(archiveVisit||'')) {
        const target=cleanTarget(destination);
        if(!dossierRoute(target)||editionOf(target)!==editionOf(here))return;
        embeddedVisit=archiveVisit;readySent=false;lastEmbeddedTrigger=null;
        try {renderer.reset();if(!renderer.open(target))tellParent('error');}catch{tellParent('error');}
      } else if(archiveVisit===embeddedVisit&&action==='park') {
        renderer.reset();embeddedVisit=null;readySent=false;lastEmbeddedTrigger=null;
      } else if(archiveVisit===embeddedVisit&&action==='resume'&&lastEmbeddedTrigger?.isConnected)lastEmbeddedTrigger.focus({preventScroll:true});
      return;
    }
    const host=[...hosts].find(item=>item.id===archiveLayer&&item.frame.contentWindow===event.source);
    if(!host)return;
    const layer=host.layer;
    if(action==='booted'){
      clearTimeout(host.bootTimeout);host.booted=true;host.failed=false;
      if(layer)selectLayer(layer);
      return;
    }
    // A failed bootstrap is reported even before a visit is assigned.
    if(action==='error'&&!host.booted){clearTimeout(host.bootTimeout);host.failed=true;if(layer)showFallback(layer);else disposeHost(host);return;}
    if(!layer||layer.id!==archiveVisit||layer.closing)return;
    if(action==='ready'){
      clearTimeout(layer.timeout);clearTimeout(layer.waitTimer);layer.wait.hidden=true;layer.dialog.removeAttribute('aria-busy');layer.dialog.classList.add('is-ready');
      // Keep the child's original focused heading/control; focusing only the
      // frame transfers keyboard input without resetting that inner focus.
      if(layer===layers.at(-1))layer.frame.focus({preventScroll:true});
    } else if(action==='error')showFallback(layer);
    else if(layer!==layers.at(-1))return;
    else if(action==='close')requestLayerClose(layer);
    else if(action==='open')createLayer(destination,layer.frame);
    else if(action==='navigate'){
      const target=cleanTarget(destination);
      if(target)location.assign(target.href);
    }
  });
  // Prepare at most one edition at a time, without loading its film art.
  // Intent comes from a visible journey/day frame or a real link hover/focus.
  // A fast connection gets a warm shell; slower/data-saving connections keep
  // the foreground page first and simply reuse its cached catalogue on click.
  const allowWarm=()=>canLayer&&!document.hidden&&!navigator.connection?.saveData&&!/^(slow-)?2g$/.test(navigator.connection?.effectiveType||'');
  let warmTimer=0,warmObserver=null;
  function queueWarm(destination,trigger,delay=150) {
    clearTimeout(warmTimer);
    const target=cleanTarget(destination);
    if(!allowWarm()||!dossierRoute(target))return;
    warmTimer=setTimeout(()=>{
      if(!allowWarm()||layers.length||trigger&&!trigger.isConnected||parkedHost(editionOf(target)))return;
      if([...hosts].some(host=>!host.booted&&!host.failed))return;
      makeHost(editionOf(target));
    },delay);
  }
  function prefetch(destination,trigger) {
    if(!allowWarm())return;
    warmObserver?.disconnect();
    if(trigger instanceof Element&&'IntersectionObserver' in window){
      warmObserver=new IntersectionObserver(entries=>{
        if(entries.some(item=>item.isIntersecting)){warmObserver.disconnect();queueWarm(destination,trigger,200);}
      },{rootMargin:'120px'});
      warmObserver.observe(trigger);
    } else queueWarm(destination,trigger,220);
  }
  function detailTarget(element) {
    const row=element.closest?.('#index-dialog .index-row[data-result-edition]');
    if(row){
      const kind=row.dataset.resultFilm?'film':row.dataset.resultAward?'award':row.dataset.resultPerson?'artist':null;
      if(kind){const target=new URL('awards.html',directory);target.searchParams.set('edition',row.dataset.resultEdition);target.searchParams.set(kind,kind==='film'?row.dataset.resultFilm:kind==='award'?row.dataset.resultAward:row.dataset.resultPerson);return {target,trigger:row};}
    }
    const anchor=element.closest?.('a[href]');
    if(anchor&&!anchor.matches('[data-film-file],[data-frame-award]')&&(!anchor.target||anchor.target==='_self'))return {target:anchor.href,trigger:anchor};
    return null;
  }
  if(canLayer){
    document.addEventListener('pointerover',event=>{
      if(event.pointerType==='touch'||!allowWarm())return;
      const item=detailTarget(event.target);
      if(item&&!item.trigger.contains(event.relatedTarget))queueWarm(item.target,item.trigger);
    },{passive:true});
    document.addEventListener('focusin',event=>{
      const item=detailTarget(event.target);if(item)queueWarm(item.target,item.trigger,100);
    });
  }
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
  window.ArchiveContinuity = Object.freeze({register,prepare,navigate,returnToOrigin,ready:rootReady,registerLayerRenderer,layerError,readContent,prefetch,embedded,hasOrigin:Boolean(origin)||embedded,resuming:Boolean(resume?.states?.dossiers)});
})();
