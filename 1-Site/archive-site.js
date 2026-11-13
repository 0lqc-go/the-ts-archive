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
  const catalog = () => read('content/catalog.json');
  const setText = (selector, value) => {
    for (const node of document.querySelectorAll(selector)) node.textContent = value;
  };

  async function read(file) {
    const response = await fetch(file);
    if (!response.ok) throw new Error('Could not load ' + file);
    return response.json();
  }

  function showError(error) {
    const status = $('#content-status');
    if (!status) return;
    status.hidden = false;
    status.textContent = error.message.startsWith('That ')
      ? error.message : 'This page could not be loaded. Try refreshing, or return to the archive.';
  }

  function displayProfile({profile}) {
    setText('.profile-name', profile.name);
    for (const link of document.querySelectorAll('.profile, .curator-link')) link.href = profile.url;
    for (const avatar of document.querySelectorAll('.avatar')) {
      const image = document.createElement('img');
      image.src = profile.avatar;
      image.alt = '';
      image.width = 46;
      image.height = 46;
      avatar.replaceChildren(image);
    }
  }

  function archiveCard(item, url, label) {
    return `<a class="archive-card" href="${escape(url)}">
      ${item.cardImage || item.cover ? `<img src="${escape(item.cardImage || item.cover)}" alt="" width="960" height="540" loading="lazy" decoding="async">` : ''}
      <div class="archive-card-copy">
        <p class="eyebrow">${escape(label)}</p>
        <h3>${escape(item.title)}</h3>
        <p>${escape(item.description)}</p>
        <span aria-hidden="true">↗</span>
      </div>
    </a>`;
  }

  async function renderHome() {
    const index = await catalog();
    const hash = location.hash;
    if (hash && !['#top', '#decades', '#lists'].includes(hash)) {
      location.replace(editionHref(index.featuredEdition) + hash);
      return;
    }
    displayProfile(index);
    const featured = index.editions.find(item => item.id === index.featuredEdition);
    const featureLink = $('#featured-edition');
    if (featured) {
      featureLink.href = editionHref(featured.id);
      featureLink.hidden = false;
      setText('#featured-period', featured.period + ' AWARDS');
      setCover($('.hero-image'), featured.cover);
      setText('#cover-credit', featured.coverFilm + ' / ' + featured.coverYear);
    }
    $('#edition-cards').innerHTML = index.editions.map(item => archiveCard(item, editionHref(item.id), item.period)).join('');
    $('#list-cards').innerHTML = index.lists.map(item => archiveCard(item, listHref(item), item.subtitle || 'Film list')).join('');
    $('#lists').hidden = index.lists.length === 0;
    $('#content-status').hidden = true;
  }

  async function renderList() {
    const index = await catalog();
    const list = index.lists.find(item => item.id === params.get('list') && item.kind !== 'snubs');
    if (!list) throw new Error('That list is not in the archive.');
    displayProfile(index);
    const {items} = await read(list.content);
    document.title = list.title + ' — The T.S. Archive';
    setText('#list-title', list.title);
    setText('#list-subtitle', list.subtitle || 'Film list');
    setText('#list-description', list.description);
    if (list.cover) {
      const cover = $('#list-cover');
      cover.src = list.cover;
      cover.hidden = false;
    }
    $('#list-items').innerHTML = items.map(item => `<li class="collection-entry">
      ${item.poster ? `<img src="${escape(item.poster)}" alt="" width="80" height="120" loading="lazy" decoding="async">` : ''}
      <div><h2>${item.url ? `<a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.title)} <span aria-hidden="true">↗</span></a>` : escape(item.title)} ${item.year ? `<small>${escape(item.year)}</small>` : ''}</h2>
      ${item.note ? `<p>${escape(item.note)}</p>` : ''}</div>
    </li>`).join('');
    $('#content-status').hidden = true;
    $('#collection').hidden = false;
  }

  function setCover(node, path) {
    if (node && path) node.style.backgroundImage = 'url(' + JSON.stringify(path) + ')';
  }

  window.ArchiveSite = {catalog, read, params, editionHref, listHref, showError, displayProfile, setText, setCover};
  if (document.body.dataset.page === 'home') renderHome().catch(showError);
  if (document.body.dataset.page === 'list') renderList().catch(showError);
})();
