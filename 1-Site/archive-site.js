(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
  })[char]);
  const params = new URLSearchParams(location.search);
  const editionHref = id => 'awards.html?edition=' + encodeURIComponent(id);
  const listHref = list => list.kind === 'snubs'
    ? 'snubs.html?edition=' + encodeURIComponent(list.edition)
    : 'list.html?list=' + encodeURIComponent(list.id);
  let catalogPromise;
  const catalog = () => catalogPromise ??= Promise.all([
      read('content/catalog.json'),
      read('content/artwork-variants.json').catch(() => ({}))
    ]).then(([index, shared]) => ({...index, media: {
      sizes: {...index.media?.sizes, ...shared.sizes},
      variants: {...index.media?.variants, ...shared.variants}
    }})).catch(error => { catalogPromise = null; throw error; });
  const setText = (selector, value) => {
    for (const node of document.querySelectorAll(selector)) node.textContent = value;
  };

  const localReads = new Map();
  function read(file) {
    if (window.ArchiveContinuity?.readContent) return window.ArchiveContinuity.readContent(file);
    const url = new URL(file, location.href).href;
    if (!localReads.has(url)) {
      const request = fetch(url, {cache: 'no-cache'}).then(response => {
        if (!response.ok) throw new Error('Could not load ' + file);
        return response.json();
      }).catch(error => { localReads.delete(url); throw error; });
      localReads.set(url, request);
    }
    return localReads.get(url);
  }

  function showError(error) {
    if (window.ArchiveContinuity?.embedded) window.ArchiveContinuity.layerError?.();
    const status = $('#content-status');
    if (!status) return;
    status.hidden = false;
    status.textContent = error.message.startsWith('That ')
      ? error.message : 'This page could not be loaded. Try refreshing, or return to the archive.';
  }

  function trackVisit() {
    if(window.ArchiveContinuity?.embedded)return;
    const archiveRoot = '/the-ts-archive';
    if (location.origin !== 'https://0lqc-go.github.io' || !location.pathname.startsWith(archiveRoot + '/')) return;

    const page = document.body.dataset.page;
    const path = page === 'home' ? '/' : location.pathname.slice(archiveRoot.length);
    const key = page === 'list' ? 'list' : 'edition';
    const id = params.get(key);
    const reportPath = page !== 'home' && /^[a-z0-9-]+$/.test(id ?? '') ? `${path}?${key}=${id}` : path;

    const script = document.createElement('script');
    script.src = 'https://gc.zgo.at/count.js';
    script.async = true;
    script.dataset.goatcounter = 'https://tsarchive.goatcounter.com/count';
    script.dataset.goatcounterSettings = JSON.stringify({path: reportPath, no_events: true});
    document.head.append(script);
  }

  function displayProfile({profile}) {
    setText('.profile-name', profile.name);
    for (const link of document.querySelectorAll('.profile, .curator-link')) link.href = profile.url;
    for (const avatar of document.querySelectorAll('.avatar')) {
      // The home masthead already contains the real local image; do not
      // replace it with a new request after the catalogue finishes loading.
      if (avatar.querySelector('img')?.getAttribute('src') === profile.avatar) continue;
      const image = document.createElement('img');
      image.src = profile.avatar;
      image.alt = '';
      image.width = 46;
      image.height = 46;
      avatar.replaceChildren(image);
    }
  }

  function artworkMarkup(file, media, sizes, fallback = [960,540]) {
    const [width,height] = media?.sizes?.[file] ?? fallback;
    return `<img ${window.ArchiveMedia.attributes(media,file,sizes,width/height<.9?176:640)} alt="" width="${width}" height="${height}" loading="lazy" decoding="async">`;
  }

  function archiveCard(item, url, label, media) {
    const cover = item.cardImage || item.cover;
    return `<a class="archive-card" href="${escape(url)}">
      ${cover ? artworkMarkup(cover, media, '(min-width: 681px) 44vw, 88vw') : ''}
      <div class="archive-card-copy">
        <p class="eyebrow">${escape(label)}</p>
        <h3>${escape(item.title)}</h3>
        <p>${escape(item.description)}</p>
      </div>
    </a>`;
  }

  async function renderHome() {
    const index = await read('content/home-catalog.json').catch(() => catalog());
    const hash = location.hash;
    if (hash && !['#top', '#decades', '#moods', '#lists', '#screening-room', '#cinema-profile', '#toggle-goatcounter'].includes(hash)) {
      location.replace(editionHref(index.featuredEdition) + hash);
      return;
    }
    displayProfile(index);
    const featured = index.editions.find(item => item.id === index.featuredEdition);
    const homeCover = index.homeCover ?? featured;
    if (homeCover?.cover) {
      setCover($('.hero-image'), homeCover.cover, homeCover, index.media);
      setText('#cover-credit', homeCover.coverFilm + ' / ' + homeCover.coverYear);
    }
    $('#edition-cards').innerHTML = index.editions.map(item => archiveCard(item, editionHref(item.id), item.period, index.media)).join('');
    $('#list-cards').innerHTML = index.lists.map(item => archiveCard(item, listHref(item), item.subtitle || 'Film list', index.media)).join('');
    $('#lists').hidden = index.lists.length === 0;
    $('#content-status').hidden = true;
    // The two decade cards above this entry arrive asynchronously. Resolve
    // a return from the profile after their layout exists, including mobile.
    if(hash==='#cinema-profile')requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(location.hash===hash)$('#cinema-profile')?.scrollIntoView({block:'start',behavior:'instant'});
    }));
    window.ArchiveContinuity?.register('page',()=>true,()=>{});
    trackVisit();
  }

  async function renderList() {
    const index = await catalog();
    const list = index.lists.find(item => item.id === params.get('list') && item.kind !== 'snubs');
    if (!list) throw new Error('That list is not in the archive.');
    window.ArchiveTheme?.apply('list', list.id);
    displayProfile(index);
    const {items, media} = await read(list.content);
    const listMedia = {sizes:{...index.media.sizes,...media?.sizes},variants:{...index.media.variants,...media?.variants}};
    document.title = list.title + ' — The T.S. Archive';
    setText('#list-title', list.title);
    setText('#list-subtitle', list.subtitle || 'Film list');
    setText('#list-description', list.description);
    const hero = $('.collection-hero');
    hero.dataset.hasCover = String(Boolean(list.cover));
    if (list.cover) setCover($('.collection-image'), list.cover, list, listMedia);
    const credit = $('#list-cover-credit');
    if (list.cover && list.coverFilm) {
      credit.hidden = false;
      setText('#list-cover-film', list.coverFilm + (list.coverYear ? ' / ' + list.coverYear : ''));
    }
    setText('#list-count', `${items.length} ${items.length === 1 ? 'film' : 'films'}`);
    $('#list-items').innerHTML = items.map(item => `<li class="collection-entry${item.poster ? '' : ' without-poster'}">
      ${item.poster ? `<span class="list-poster">${artworkMarkup(item.poster, listMedia, '(max-width: 560px) 64px, 76px', [80,120])}</span>` : ''}
      <div><h2>${item.url ? `<a class="list-film-link" href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.title)}</a>` : escape(item.title)} ${item.year ? `<small>${escape(item.year)}</small>` : ''}</h2>
      ${item.note ? `<p>${escape(item.note)}</p>` : ''}</div>
    </li>`).join('');
    setupListView();
    $('#content-status').hidden = true;
    $('#collection').hidden = false;
    window.ArchiveContinuity?.register('page',()=>true,()=>{});
  }

  function setupListView() {
    const toggle = $('[data-list-view-toggle]');
    if (!toggle) return;
    const sync = mode => {
      document.body.dataset.listView = mode;
      const next = mode === 'compact' ? 'cinematic' : 'compact';
      const label = next === 'compact' ? 'Compact' : 'Cinematic';
      toggle.dataset.nextView = next;
      toggle.querySelector('.nav-view-label').textContent = label;
      toggle.setAttribute('aria-label', `Switch to ${label} view`);
      toggle.title = `Switch to ${label} view`;
    };
    sync(params.get('view') === 'compact' ? 'compact' : 'cinematic');
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const mode = toggle.dataset.nextView;
      sync(mode);
      const url = new URL(location.href);
      if (mode === 'compact') url.searchParams.set('view', mode);
      else url.searchParams.delete('view');
      replaceLocation(url);
    });
  }

  function replaceLocation(url) {
    try { history.replaceState(history.state, '', url); }
    catch (error) {
      if (location.protocol !== 'file:' || error.name !== 'SecurityError') throw error;
      // A file URL cannot use every history operation on every browser.
      location.replace(url.href);
    }
  }

  function setCover(node, path, options = {}, media = {}) {
    if (!node || !path) return;
    if (options.coverPosition) node.style.setProperty('--cover-position', options.coverPosition);
    if (options.coverMobilePosition) node.style.setProperty('--cover-mobile-position', options.coverMobilePosition);
    if (node.querySelector('img[data-archive-cover]')?.dataset.archiveCover === path) return;
    const image = document.createElement('img');
    image.className = 'cover-art';
    image.alt = '';
    image.loading = 'eager';
    image.decoding = 'async';
    image.fetchPriority = 'high';
    const [width, height] = media.sizes?.[path] ?? [];
    const variants = window.ArchiveMedia.variants(media,path);
    if (width && height) {
      image.width = width;
      image.height = height;
      if (variants.length && !variants.some(variant => variant.width === width)) {
        variants.push({src: path, width});
      }
    }
    // A tall cover crops a wide image on mobile. Its effective source width
    // is determined by the full scaled image, rather than just the viewport.
    const updateSizes = () => {
      if (!width || !height || !node.clientWidth || !node.clientHeight) return;
      image.sizes = Math.ceil(Math.max(node.clientWidth, node.clientHeight * width / height)) + 'px';
    };
    requestAnimationFrame(() => {
      if (variants.length) {
        image.sizes = '100vw';
        updateSizes();
        image.srcset = variants.map(variant => `${variant.src} ${variant.width}w`).join(', ');
      }
      image.src = variants.length ? window.ArchiveMedia.select(media,path,parseInt(image.sizes,10)||innerWidth).src : path;
      node.replaceChildren(image);
      if (variants.length && width && height && 'ResizeObserver' in window) {
        const observer = new ResizeObserver(updateSizes);
        observer.observe(node);
      }
    });
  }

  window.ArchiveSite = {catalog, read, params, editionHref, listHref, showError, displayProfile, setText, setCover, setupListView, replaceLocation};
  if (document.body.dataset.page === 'home') renderHome().catch(showError);
  else {
    trackVisit();
    if (document.body.dataset.page === 'list') renderList().catch(showError);
  }
})();
