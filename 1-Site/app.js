(async () => {
  'use strict';
  const site = window.ArchiveSite;
  const catalog = await site.catalog();
  const editionId = site.params.get('edition') ?? catalog.featuredEdition;
  const selected = catalog.editions.find(item => item.id === editionId);
  if (!selected) throw new Error('That edition is not in the archive.');
  const archive = await site.read(selected.content);
  const media = archive.media ?? {films: {}};
  const $ = (selector, element = document) => element.querySelector(selector);
  const $$ = (selector, element = document) => [...element.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const pad = value => String(value).padStart(2, '0');
  const normal = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const external = 'target="_blank" rel="noopener noreferrer"';
  const edition = archive.editorial ?? {};
  const alternates = archive.stills ?? {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const actorFocalPoints = edition.actorFocalPoints ?? {};
  const hasSpotlights = archive.performances?.length || archive.actors?.length;
  const snubList = catalog.lists.find(item => item.kind === 'snubs' && item.edition === editionId);
  const defaultAccent = '#c0b3a1';
  const awards = archive.chapters.flatMap(chapter => chapter.awards.map(award => ({...award, chapter})))
    .map((award, i) => ({
      ...award, number: i + 1,
      accent: award.accent ?? edition.accents?.[i % edition.accents.length] ?? defaultAccent
    }));
  const awardsById = new Map(awards.map(award => [award.id, award]));
  function selectStills(slugs, context) {
    return Object.fromEntries(slugs.map(slug => [
      slug, alternates[slug]?.find(still => still.award === context)?.path
    ]));
  }
  for (const award of awards) award.stills = selectStills(award.winner.films, award.id);
  function quotePanel(quote, position) {
    return `<figure class="edition-quote ${position}"><blockquote>“${esc(quote.text)}”</blockquote><figcaption>${esc(quote.credit)}</figcaption></figure>`;
  }
  const negative = new Set(['worst-picture', 'most-overrated-movie']);
  const film = slug => archive.films[slug];
  const art = slug => media.films?.[slug] || {};
  const {profile} = catalog;
  site.displayProfile(catalog);
  const onSnubs = document.body.dataset.page === 'snubs';
  site.setText('[data-edition-period]', selected.period);
  site.setText('[data-edition-label]', onSnubs ? 'THE ALTERNATE BALLOT / ' + selected.period : 'THE ' + selected.period + ' EDITION');
  const cover = onSnubs ? snubList : selected;
  site.setCover($(onSnubs ? '.snubs-image' : '.hero-image'), cover?.cover);
  if (cover?.coverFilm) site.setText('#cover-credit', cover.coverFilm + ' / ' + cover.coverYear);
  $$('[data-awards-link]').forEach(link => { link.href = site.editionHref(editionId) + '#awards'; });
  if (snubList && archive.snubs?.length) {
    $$('[data-snubs-link]').forEach(link => { link.href = site.listHref(snubList); link.hidden = false; });
  }
  if (!hasSpotlights) {
    $$('[data-spotlight-link], #spotlights').forEach(section => { section.hidden = true; });
  }

  function poster(slug, eager = false) {
    const info = film(slug);
    return `<span class="poster" aria-hidden="true">${art(slug).poster ? `<img src="${esc(art(slug).poster)}" alt="" width="380" height="570" loading="${eager ? 'eager' : 'lazy'}" decoding="async">` : `<span>${esc(info.title)}</span>`}</span>`;
  }

  function artworkPath(slug, selected) {
    return selected[slug] || art(slug).backdrop || art(slug).poster;
  }

  function backdrop(slugs, eager = false, selected = {}, focalPoints = {}) {
    const ratios = [];
    const frames = slugs.map(slug => {
      const picture = artworkPath(slug, selected);
      const [width, height] = media.sizes?.[picture] ?? [16, 9];
      ratios.push(width / height);
      if (!picture) return `<span class="frame-image blank">${esc(film(slug).title)}</span>`;
      const shape = selected[slug] || art(slug).backdrop ? 'wide' : 'portrait';
      const position = focalPoints[slug] ? ` style="--focal-x:${focalPoints[slug]}"` : '';
      return `<span class="frame-image ${shape}" data-film="${esc(slug)}"${position}><img src="${esc(picture)}" alt="" width="${width}" height="${height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></span>`;
    });
    const frameRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);
    const columns = ratios.map(ratio => `minmax(0,${ratio}fr)`).join(' ');
    return `<span class="frame-media${slugs.length > 1 ? ' split-media' : ''}" style="--image-ratio:${frameRatio};--frame-columns:${columns}" aria-hidden="true">${frames.join('')}</span>`;
  }

  function title(entry) {
    if (entry.creditFirst) return esc(entry.title);
    if (entry.films.length > 1) return entry.films.map(slug => esc(film(slug).title)).join(' <span class="title-slash">/</span> ');
    return esc(entry.title);
  }

  function filmLinks(slugs) {
    return slugs.map(slug => `<a class="film-link" href="${esc(film(slug).url)}" ${external}>${esc(film(slug).title)} <span>↗</span></a>`).join('');
  }

  function nomination(entry, eager = false) {
    const posters = entry.films.map(slug => `<a class="nominee-poster" href="${esc(film(slug).url)}" ${external} aria-label="${esc(film(slug).title)} on Letterboxd">${poster(slug, eager)}</a>`).join('');
    return `<li class="nominee"><div class="nominee-art${entry.films.length > 1 ? ' multi-poster' : ''}">${posters}</div><strong>${title(entry)}</strong>${entry.detail ? `<small>${esc(entry.detail)}</small>` : ''}</li>`;
  }

  function nominations(entries, eager = false) {
    if (!entries.length) return '';
    return `<div class="shortlist"><p class="micro">HONORABLE MENTIONS <span>${pad(entries.length)}</span></p><ul class="nominee-grid" style="--count:${entries.length}">${entries.map(entry => nomination(entry, eager)).join('')}</ul></div>`;
  }

  function awardCard(award) {
    const feature = award.feature;
    const quote = award.winner.detail?.startsWith('“');
    return `<article class="award-card${feature ? ' feature-card' : ''}${quote ? ' quote-card' : ''}" id="${award.id}" data-accent="${award.accent}" style="--accent:${award.accent}" aria-labelledby="heading-${award.id}">
      <div class="award-heading"><h3 id="heading-${award.id}">${esc(award.name)}</h3><span class="award-number" aria-label="Award ${award.number}">${pad(award.number)}</span></div>
      <button class="winner-frame" data-award="${award.number - 1}" aria-haspopup="dialog" aria-label="Open ${esc(award.name)}: ${esc(award.winner.text)}">
        ${backdrop(award.winner.films, false, award.stills)}<span class="star${negative.has(award.id) ? ' critical' : ''}" aria-label="${negative.has(award.id) ? 'Selected film' : 'Winner'}">★</span>
        <span class="winner-copy"><span class="winner-title">${title(award.winner)}</span>${award.winner.detail ? `<span class="winner-detail${quote ? ' line-of-dialogue' : ''}">${esc(award.winner.detail)}</span>` : ''}</span><span class="frame-open" aria-hidden="true">↗</span>
      </button>
      ${nominations(award.nominees)}
    </article>`;
  }

  function renderChapters() {
    $('#chapter-links').innerHTML = archive.chapters.map(chapter => `<a href="#${esc(chapter.id)}" class="chapter-link" data-chapter="${esc(chapter.id)}">${esc(chapter.shortName ?? chapter.name)}</a>`).join('');
    $('#chapter-content').innerHTML = archive.chapters.map((chapter, i) => {
      const next = archive.chapters[i + 1] ?? (hasSpotlights ? { id: 'spotlights', name: 'Performance spotlights' } : {id:'final-cut', name:'The final cut'});
      const id = esc(chapter.id);
      return `<section class="chapter section-shell" style="--accent:${awardsById.get(chapter.awards[0].id).accent}" id="${id}" aria-labelledby="chapter-title-${id}">
      <header class="chapter-heading"><span class="chapter-number" aria-label="Chapter ${i + 1}">${pad(i + 1)}<span>.</span></span><div><p class="eyebrow">${chapter.awards.length} ${chapter.awards.length === 1 ? 'AWARD' : 'AWARDS'}</p><h2 id="chapter-title-${id}">${esc(chapter.name)}</h2></div></header>
      <div class="award-grid">${chapter.awards.map(a => {
        const quote = edition.interludes?.[a.id];
        return awardCard(awardsById.get(a.id)) + (quote ? quotePanel(quote, 'interlude') : '');
      }).join('')}</div>
      <div class="chapter-continuation"><a href="#${esc(next.id)}"><span class="continuation-label">${i + 1 < archive.chapters.length ? 'NEXT CHAPTER' : 'CONTINUE'}</span> ${esc(next.name)} <span aria-hidden="true">↓</span></a></div>
    </section>`;
    }).join('');
  }

  function renderSpotlights() {
    const entry = archive.performances?.[0];
    const actor = archive.actors?.[0];
    $('#spotlight-content').innerHTML = `<div class="spotlight-grid">
      ${entry ? `<article class="spotlight-card" style="--accent:#b7bac7"><h3>Best Performances of the Decade</h3><p class="spotlight-method">One role per entry.</p><div class="spotlight-visual">${backdrop(entry.films, false, selectStills(entry.films, 'performances-spotlight'))}<span class="star" aria-label="Winner">★</span><div class="winner-copy"><span class="winner-title">${title(entry)}</span><span class="winner-detail">${esc(entry.detail)}</span></div></div><ol class="spotlight-list"><li class="spotlight-winner">${filmLinks(entry.films)}</li>${archive.performances.slice(1).map(row => `<li>${poster(row.films[0])}<span><strong>${filmLinks(row.films)}</strong><small>${esc(row.detail)}</small></span></li>`).join('')}</ol></article>` : ''}
      ${actor ? `<article class="spotlight-card" style="--accent:#c4a385"><h3>Actor of the Decade</h3><p class="spotlight-method">Selected films across the decade.</p><div class="spotlight-visual">${backdrop(actor.films, false, selectStills(actor.films, 'actor-spotlight'), actorFocalPoints)}<span class="star" aria-label="Winner">★</span><div class="winner-copy"><span class="winner-title">${esc(actor.name)}</span></div></div><ol class="spotlight-list"><li class="spotlight-winner">${filmLinks(actor.films)}</li>${archive.actors.slice(1).map(row => `<li>${poster(row.films[0])}<span><strong>${esc(row.name)}</strong><small>${filmLinks(row.films)}</small></span></li>`).join('')}</ol></article>` : ''}
    </div>`;
  }

  function renderFilmWall() {
    const collected = new Map();
    for (const award of awards.filter(a => !negative.has(a.id))) {
      for (const slug of award.winner.films) {
        const filmAwards = collected.get(slug) || [];
        filmAwards.push(award.name);
        collected.set(slug, filmAwards);
      }
    }
    $('#film-wall').innerHTML = [...collected.entries()].sort((a, b) => b[1].length - a[1].length).map(([slug, filmAwards]) => `<a class="wall-tile" href="${esc(film(slug).url)}" ${external} aria-label="${esc(film(slug).title)}. ${esc(filmAwards.join(', '))}. On Letterboxd." title="${esc(filmAwards.join(' · '))}">${poster(slug)}<span><strong>${esc(film(slug).title)}</strong><small>${filmAwards.length} ${filmAwards.length === 1 ? 'AWARD' : 'AWARDS'} <b>↗</b></small></span></a>`).join('');
  }

  function renderSnubs() {
    if (!snubList || !archive.snubs?.length) throw new Error('That edition has no Oscar Snubs list.');
    site.setText('#snubs-description', snubList.description);
    $('#snub-entries').innerHTML = archive.snubs.map(({name,entry,status}) => `<article class="snub-card"><a href="${esc(film(entry.films[0]).url)}" ${external} aria-label="${esc(entry.title)} on Letterboxd">${poster(entry.films[0])}</a><div><p class="eyebrow">${esc(name)}</p><h3>${title(entry)}</h3>${entry.detail ? `<p>${esc(entry.detail)}</p>` : ''}<small>${esc(status)}</small></div></article>`).join('');
    const entry = archive.watch;
    if (entry) {
      $('#watch-entry').hidden = false;
      $('#watch-entry').innerHTML = `<article class="watch-frame">${backdrop(entry.films)}<span class="frame-shade"></span><div class="winner-copy"><p class="eyebrow">${esc(entry.label ?? 'Oscar Watch')}</p><h2 class="winner-title">${title(entry)}</h2><p class="winner-detail">${esc(entry.detail)}</p><p class="watch-note">${esc(entry.note)}</p>${filmLinks(entry.films)}</div></article>`;
    }
  }

  const dialogTriggers = new WeakMap();
  function openDialog(dialog, focusTo, trigger = document.activeElement) {
    dialogTriggers.set(dialog, trigger);
    dialog.showModal();
    document.body.classList.add('dialog-open');
    if (focusTo) $(focusTo, dialog)?.focus({preventScroll: true});
  }

  function closeDialog(dialog) {
    dialog.close();
  }

  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target === dialog || event.target.closest('.dialog-close')) closeDialog(dialog);
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      if (dialog.open) return;
      const trigger = dialogTriggers.get(dialog);
      dialogTriggers.delete(dialog);
      if (!$('dialog[open]')) {
        document.body.classList.remove('dialog-open');
        if (trigger instanceof HTMLElement && trigger.getClientRects().length) trigger.focus({preventScroll:true});
      }
    });
  });

  if ($('#snub-entries')) renderSnubs();

  if ($('#credit-links')) {
    $('#credit-links').innerHTML = `<p>${selected.coverSource ? `<a href="${esc(selected.coverSource)}" ${external}>${esc(selected.coverFilm)} cover image ↗</a><br>` : ''}<a href="${esc(profile.url)}" ${external}>${esc(profile.name)} · Letterboxd profile artwork ↗</a></p><details class="image-sources"><summary>Film artwork sources</summary><ul>${Object.entries(archive.films).map(([slug, info]) => `<li><a href="${esc(art(slug).source || info.url)}" ${external}>${esc(info.title)} ↗</a></li>`).join('')}</ul></details>`;
    const sources = Object.entries(alternates).flatMap(([slug, stills]) => {
      const name = esc(film(slug).title);
      const urls = new Set(stills.map(still => still.source).filter(Boolean));
      const credits = new Set(stills.map(still => still.credit).filter(Boolean));
      return [
        ...Array.from(urls, (url, i) => `<li><a href="${esc(url)}" ${external}>${name}${i ? ' · '+(i+1) : ''} ↗</a></li>`),
        ...Array.from(credits, credit => `<li>${name} · ${esc(credit)}</li>`)
      ];
    });
    if (sources.length) {
      $('#credit-links').insertAdjacentHTML('beforeend', `<details class="image-sources"><summary>Additional film stills</summary><ul>${sources.join('')}</ul></details>`);
    }
    const credits = $('.credits-open');
    credits.hidden = false;
    credits.addEventListener('click', () => openDialog($('#credits-dialog'), '.dialog-close'));
  }

  document.title = (onSnubs ? 'Oscar Snubs · ' + selected.period : selected.title) + ' — The T.S. Archive';
  $('#content-status').hidden = true;
  $('main').hidden = false;
  if (onSnubs && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  if (!$('#chapter-content')) return;
  if (edition.opening) $('#opening-line').innerHTML = quotePanel(edition.opening, 'opening');
  if (edition.closing) $('#closing-line').innerHTML = quotePanel(edition.closing, 'closing');
  site.setText('#award-count, #dialog-total', pad(awards.length));
  site.setText('#chapter-count', pad(archive.chapters.length));
  renderChapters();
  if (hasSpotlights) renderSpotlights();
  renderFilmWall();

  const awardDialog = $('#award-dialog');
  const indexDialog = $('#index-dialog');
  const dialogContent = $('#dialog-content');
  const dialogScroll = $('.ceremony-scroll', awardDialog);
  const dialogTitle = $('#dialog-category');
  const nextButton = $('.ceremony-next', awardDialog);
  const search = $('#category-search');
  let current = 0;
  let startTouch = null;
  let sceneChange = null;

  function prepareAward(index) {
    const award = awards[index];
    if (!award || navigator.connection?.saveData) return Promise.resolve();
    return Promise.all(award.winner.films.map(slug => {
      const path = artworkPath(slug, award.stills);
      if (!path) return Promise.resolve();
      const image = new Image();
      image.src = path;
      return image.decode().catch(() => {});
    }));
  }

  function renderAward(index, direction = 0) {
    current = index;
    const award = awards[index];
    const next = awards[index + 1];
    const percent = (index + 1) / awards.length * 100;
    dialogContent.style.setProperty('--accent', award.accent);
    $('#dialog-chapter').textContent = award.chapter.name;
    dialogTitle.textContent = award.name;
    $('#dialog-number').textContent = pad(index + 1);
    $('.ceremony-progress', awardDialog).style.setProperty('--progress', `${percent}%`);
    $('.ceremony-prev', awardDialog).disabled = index === 0;
    nextButton.innerHTML = next ? `<span>NEXT AWARD →</span><small>${esc(next.name)}</small>` : '<span>FINISH ✓</span>';
    nextButton.setAttribute('aria-label', next ? `Next award: ${next.name}` : 'Finish awards presentation');
    dialogScroll.innerHTML = `<div class="ceremony-body ${direction < 0 ? 'slide-back' : 'slide-in'}">
      <div class="ceremony-frame">${backdrop(award.winner.films, true, award.stills)}<span class="frame-shade"></span><span class="star${negative.has(award.id) ? ' critical' : ''}" aria-label="${negative.has(award.id) ? 'Selected film' : 'Winner'}">★</span>
        <div class="winner-copy"><strong class="winner-title">${title(award.winner)}</strong>${award.winner.detail ? `<span class="winner-detail">${esc(award.winner.detail)}</span>` : ''}<div class="ceremony-links">${filmLinks(award.winner.films)}</div></div>
      </div>
      ${nominations(award.nominees, true)}
    </div>`;
    dialogScroll.scrollTop = 0;
    if (awardDialog.open) dialogTitle.focus({preventScroll: true});
    prepareAward(index + 1);
    prepareAward(index - 1);
  }

  function cancelSceneChange() {
    sceneChange?.cancel();
    sceneChange = null;
  }

  function openAward(index, trigger) {
    cancelSceneChange();
    renderAward(index);
    openDialog(awardDialog, '#dialog-category', trigger);
  }

  async function advance(direction) {
    if (!awardDialog.open || sceneChange) return;
    const next = current + direction;
    if (next === awards.length) {
      closeDialog(awardDialog);
      return;
    }
    if (next < 0) return;
    const scene = $('.ceremony-body', awardDialog);
    if (reducedMotion.matches || !scene.animate) {
      renderAward(next, direction);
      return;
    }
    const outgoing = scene.animate([
      {opacity: 1, transform: 'none'},
      {opacity: .35, transform: `translateX(${direction * -8}px)`}
    ], {duration: 150, easing: 'ease-in', fill: 'forwards'});
    sceneChange = outgoing;
    let deadline;
    try {
      await Promise.all([
        outgoing.finished,
        Promise.race([prepareAward(next), new Promise(resolve => { deadline = setTimeout(resolve, 280); })])
      ]);
      if (awardDialog.open && sceneChange === outgoing) renderAward(next, direction);
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      clearTimeout(deadline);
      outgoing.cancel();
      if (sceneChange === outgoing) sceneChange = null;
    }
  }

  awardDialog.addEventListener('close', () => {
    if (!awardDialog.open) cancelSceneChange();
    startTouch = null;
  });

  function renderIndex(query = '') {
    const words = normal(query).trim().split(/\s+/).filter(Boolean);
    const results = awards.filter(a => {
      const haystack = normal([a.name,a.chapter.name,a.winner.text,...a.nominees.map(n => n.text)].join(' '));
      return words.every(word => haystack.includes(word));
    });
    $('#index-results').innerHTML = results.length ? results.map(a => `<button class="index-row" data-award="${a.number - 1}"><span>${pad(a.number)}</span><span><strong>${esc(a.name)}</strong><small>${esc(a.winner.title)}</small></span><b aria-hidden="true">↗</b></button>`).join('') : '<p class="empty-index">No matches. Try a film title, category or name.</p>';
  }

  function openIndex(trigger) {
    search.value = '';
    renderIndex();
    openDialog(indexDialog, '#category-search', trigger);
  }

  search.addEventListener('input', () => renderIndex(search.value));
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.matches('.start-ceremony')) openAward(0, button);
    if (button.matches('.index-open')) openIndex(button);
    if (button.matches('[data-award]')) {
      const trigger = indexDialog.open ? dialogTriggers.get(indexDialog) : button;
      if (indexDialog.open) closeDialog(indexDialog);
      openAward(Number(button.dataset.award), trigger);
    }
    if (button.matches('.ceremony-prev')) advance(-1);
    if (button.matches('.ceremony-next')) advance(1);
    if (button.matches('.ceremony-index')) {
      const trigger = dialogTriggers.get(awardDialog);
      closeDialog(awardDialog);
      openIndex(trigger);
    }
  });

  awardDialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      advance(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  awardDialog.addEventListener('touchstart', event => {
    if (!event.target.closest('.ceremony-frame')) return;
    startTouch = [event.changedTouches[0].clientX,event.changedTouches[0].clientY];
  },{passive:true});
  awardDialog.addEventListener('touchend', event => {
    if (!startTouch) return;
    const dx = event.changedTouches[0].clientX - startTouch[0];
    const dy = event.changedTouches[0].clientY - startTouch[1];
    startTouch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) advance(dx < 0 ? 1 : -1);
  },{passive:true});
  awardDialog.addEventListener('touchcancel', () => { startTouch = null; }, {passive:true});

  const chapters = $$('.chapter');
  const cards = $$('.award-card');
  if (window.IntersectionObserver && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        entry.target.classList.add(entry.target.matches('.award-card') ? 'in-frame' : 'is-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold:.18});
    const reveals = $$('.chapter-heading, .edition-quote.interlude, .section-heading');
    reveals.forEach(section => section.classList.add('motion-reveal'));
    [...cards, ...reveals].forEach(section => observer.observe(section));
  }
  const links = $$('.chapter-link');
  let frame = 0;
  let currentAccent;
  let currentChapter;
  function refreshScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    $('.reading-progress').style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
    const line = window.innerHeight * .45;
    const currentCard = cards.findLast(card => card.getBoundingClientRect().top <= line);
    const withinAwards = cards.at(-1)?.getBoundingClientRect().bottom >= line;
    const nextAccent = withinAwards && currentCard ? currentCard.dataset.accent : '#c0b3a1';
    if (currentAccent !== nextAccent) {
      document.body.style.setProperty('--current-accent', nextAccent);
      currentAccent = nextAccent;
    }
    const active = chapters.findLast(chapter => chapter.getBoundingClientRect().top < 180);
    if (currentChapter !== active?.id) {
      currentChapter = active?.id;
      for (const link of links) {
        if (link.dataset.chapter === currentChapter) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      const visibleLink = links.find(link => link.dataset.chapter === currentChapter) ?? links[0];
      if (visibleLink) {
        const nav = visibleLink.parentElement;
        const viewport = nav.getBoundingClientRect();
        const label = visibleLink.getBoundingClientRect();
        const offset = label.right > viewport.right - 8 ? label.right - viewport.right + 8
          : label.left < viewport.left ? label.left - viewport.left : 0;
        if (offset) nav.scrollBy({left: offset, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
      }
    }
    frame = 0;
  }
  function onScroll() {if (!frame) frame = requestAnimationFrame(refreshScroll);}
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  refreshScroll();
  // Restore a category anchor after the ballot has been rendered.
  if (location.hash.length > 1) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({behavior:'instant'}));
  }
})().catch(error => window.ArchiveSite.showError(error));
