(async () => {
  'use strict';
  const site = window.ArchiveSite;
  const catalog = await site.catalog();
  const editionId = site.params.get('edition') ?? catalog.featuredEdition;
  const selected = catalog.editions.find(item => item.id === editionId);
  if (!selected) throw new Error('That edition is not in the archive.');
  const archive = await site.read(selected.content);
  document.body.dataset.edition = selected.id;
  const media = {
    films: archive.media?.films ?? {},
    sizes: {...archive.media?.sizes, ...catalog.media?.sizes},
    variants: {...archive.media?.variants, ...catalog.media?.variants}
  };
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
  function directAwardHref(id) {
    const url = new URL(site.editionHref(editionId), location.href);
    url.searchParams.set('award', id);
    return url.href;
  }

  function spotlightSnub() {
    const preferred = snubList?.spotlight;
    const eligible = (archive.snubs ?? []).filter(item => art(item.entry.films[0]).backdrop);
    return eligible.find(item => item.name === preferred?.category && item.entry.films.includes(preferred.film)) ?? eligible[0];
  }

  const spotlightAnchor = 'snub-spotlight-selection';
  function selectStills(slugs, context) {
    return Object.fromEntries(slugs.map(slug => [
      slug, alternates[slug]?.find(still => still.award === context)?.path
    ]));
  }
  for (const award of awards) {
    award.stills = selectStills(award.winner.films, award.id);
    award.focalPoints = Object.fromEntries(award.winner.films.map(slug => [
      slug, alternates[slug]?.find(still => still.award === award.id)?.focal
    ]));
  }
  function quotePanel(quote, position) {
    return `<figure class="edition-quote ${position}"><blockquote>“${esc(quote.text)}”</blockquote><figcaption>${esc(quote.credit)}</figcaption></figure>`;
  }
  const negative = new Set(['worst-picture', 'most-overrated-movie']);
  const film = slug => archive.films[slug];
  const art = slug => media.films?.[slug] || {};
  const {profile} = catalog;
  site.displayProfile(catalog);
  const onSnubs = document.body.dataset.page === 'snubs';
  // All editions share one presentation; decade-specific data stays in JSON.
  const enhanced = !onSnubs;
  const awardDialog = $('#award-dialog');
  const indexDialog = $('#index-dialog');
  const filmDialog = $('#film-file-dialog');
  const portfolioPresentation = award => award.honorsPortfolio ||
    (['director-of-the-decade', 'composer-of-the-decade'].includes(award.id) && award.winner.films.length > 1);
  if (enhanced) document.body.dataset.awardView = site.params.get('view') === 'compact' ? 'compact' : 'cinematic';
  site.setText('[data-edition-period]', selected.period);
  site.setText('[data-edition-label]', onSnubs ? 'THE ALTERNATE BALLOT / ' + selected.period : 'THE ' + selected.period + ' EDITION');
  const cover = onSnubs ? snubList : selected;
  const coverImage = $(onSnubs ? '.snubs-image' : '.hero-image');
  site.setCover(coverImage, cover?.cover, cover);
  if (cover?.coverFilm) site.setText('#cover-credit', cover.coverFilm + ' / ' + cover.coverYear);
  $$('[data-awards-link]').forEach(link => { link.href = site.editionHref(editionId) + '#awards'; });
  if (snubList && archive.snubs?.length) {
    $$('[data-snubs-link]').forEach(link => { link.href = site.listHref(snubList); link.hidden = false; });
  }
  if (!hasSpotlights) {
    $$('[data-spotlight-link], #spotlights').forEach(section => { section.hidden = true; });
  }

  function imageSources(path) {
    return (media.variants?.[path] ?? []).map(variant => `${variant.src} ${variant.width}w`).join(', ');
  }

  function imageMarkup(path, eager, sizes, fallback = [16, 9]) {
    const [width, height] = media.sizes?.[path] ?? fallback;
    const srcset = imageSources(path);
    const responsive = srcset ? `srcset="${esc(srcset)}" sizes="${esc(sizes)}" ` : '';
    return `<img ${responsive}src="${esc(path)}" alt="" width="${width}" height="${height}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
  }

  function poster(slug, eager = false, sizes = '82px') {
    const info = film(slug);
    return `<span class="poster" aria-hidden="true">${art(slug).poster ? imageMarkup(art(slug).poster, eager, sizes, [380, 570]) : `<span>${esc(info.title)}</span>`}</span>`;
  }

  function artworkPath(slug, selected) {
    return selected[slug] || art(slug).backdrop || art(slug).poster;
  }

  function filmFrames(slugs, selected, focalPoints) {
    return slugs.map(slug => ({
      slug, path: artworkPath(slug, selected), label: film(slug).title,
      shape: selected[slug] || art(slug).backdrop ? 'wide' : 'portrait',
      focal: focalPoints[slug]
    }));
  }

  function awardFrames(award, layout = 'card') {
    const presentation = enhanced && layout === 'dialog' ? edition.presentationStills?.[award.id] : null;
    if (!award.winnerArtwork && presentation && award.winner.films.includes(presentation.film)) {
      return [{slug: presentation.film, path: presentation.path, label: film(presentation.film).title,
        shape: 'wide', focal: presentation.focal}];
    }
    if (award.winnerArtwork) {
      return [{path: award.winnerArtwork.path, label: award.winner.title,
        shape: 'wide', focal: award.winnerArtwork.focal}];
    }
    return filmFrames(award.winner.films, award.stills, award.focalPoints);
  }

  function frameLayout(frames, layout) {
    const ratios = frames.map(frame => {
      const [width, height] = media.sizes?.[frame.path] ?? [16, 9];
      return width / height;
    });
    const frameRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);
    return {
      ratio: frameRatio,
      columns: ratios.map(ratio => `minmax(0,${ratio}fr)`).join(' '),
      sizes: ratios.map(ratio => {
        const share = ratio / frameRatio;
        if (layout === 'dialog') return enhanced
          ? `(min-width: 900px) ${Math.ceil(800 * share)}px, ${Math.ceil(94 * share)}vw`
          : `(min-width: 1150px) ${Math.ceil(1052 * share)}px, ${Math.ceil(94 * share)}vw`;
        if (layout === 'feature') return `(min-width: 1450px) ${Math.ceil(1248 * share)}px, ${Math.ceil(90 * share)}vw`;
        return `(min-width: 1450px) ${Math.ceil(790 * share)}px, (min-width: 850px) ${Math.ceil(60 * share)}vw, ${Math.ceil(90 * share)}vw`;
      })
    };
  }

  function renderFrames(frames, eager, layout = 'card') {
    const {ratio, columns, sizes} = frameLayout(frames, layout);
    const images = frames.map((frame, i) => {
      if (!frame.path) return `<span class="frame-image blank">${esc(frame.label)}</span>`;
      const position = frame.focal ? ` style="--focal-x:${esc(frame.focal)}"` : '';
      const filmData = frame.slug ? ` data-film="${esc(frame.slug)}"` : '';
      return `<span class="frame-image ${frame.shape}"${filmData}${position}>${imageMarkup(frame.path, eager, sizes[i])}</span>`;
    });
    return `<span class="frame-media${frames.length > 1 ? ' split-media' : ''}" style="--image-ratio:${ratio};--frame-columns:${columns}" aria-hidden="true">${images.join('')}</span>`;
  }

  function backdrop(slugs, eager = false, selected = {}, focalPoints = {}) {
    return renderFrames(filmFrames(slugs, selected, focalPoints), eager);
  }

  function title(entry) {
    if (entry.creditFirst) return esc(entry.title);
    if (entry.films.length > 1) return entry.films.map(slug => esc(film(slug).title)).join(' <span class="title-slash">/</span> ');
    return esc(entry.title);
  }

  function artistName(entry) {
    return entry.creditFirst ? entry.title : entry.detail || entry.title;
  }

  function workNames(entry) {
    return entry.films.map(slug => film(slug).title).join(' / ');
  }

  function filmAttributes(slug) {
    return filmDialog ? `data-film-file="${esc(slug)}" aria-haspopup="dialog" aria-label="Open film file for ${esc(film(slug).title)}"` : `aria-label="${esc(film(slug).title)} on Letterboxd"`;
  }

  function filmLinks(slugs) {
    return slugs.map(slug => `<a class="film-link" href="${esc(film(slug).url)}" ${external} ${filmAttributes(slug)}>${esc(film(slug).title)}${filmDialog ? '' : ' <span>↗</span>'}</a>`).join('');
  }

  function winnerBadge(award) {
    return enhanced ? '' : `<span class="star${negative.has(award.id) ? ' critical' : ''}" aria-label="${negative.has(award.id) ? 'Selected film' : 'Winner'}">★</span>`;
  }

  function nomination(entry, eager = false, artist = false) {
    const posterSize = entry.films.length > 1 ? (enhanced ? '40px' : '50px') : enhanced ? '72px' : '82px';
    const posters = entry.films.map(slug => `<a class="nominee-poster" href="${esc(film(slug).url)}" ${external} ${filmAttributes(slug)}>${poster(slug, eager, posterSize)}</a>`).join('');
    const detail = artist ? workNames(entry) : entry.detail;
    return `<li class="nominee"><div class="nominee-art${entry.films.length > 1 ? ' multi-poster' : ''}">${posters}</div><strong>${artist ? esc(artistName(entry)) : title(entry)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</li>`;
  }

  function nominations(entries, eager = false, artist = false) {
    if (!entries.length) return '';
    return `<div class="shortlist${artist ? ' artist-shortlist' : ''}"><p class="micro">HONORABLE MENTIONS <span>${pad(entries.length)}</span></p><ul class="nominee-grid" style="--count:${entries.length}">${entries.map(entry => nomination(entry, eager, artist)).join('')}</ul></div>`;
  }

  function artistWorks(entry) {
    return `<div class="artist-works"><p class="micro">SELECTED FILMS</p><ul style="--work-count:${entry.films.length}">${entry.films.map(slug => `<li><a class="artist-film" href="${esc(film(slug).url)}" ${external} ${filmAttributes(slug)}>${poster(slug, false, '78px')}<span>${esc(film(slug).title)} <small>${esc(film(slug).year)}</small></span></a></li>`).join('')}</ul></div>`;
  }

  function musicActions(award) {
    if (!enhanced || !award.listen?.length) return '';
    return `<div class="music-actions" aria-label="Listen to the winning music">${award.listen.length > 1 ? '<span class="music-label">Listen</span>' : ''}${award.listen.map(item => `<a class="music-link" href="${esc(item.url)}" ${external} aria-label="Listen to ${esc(item.title)} on Apple Music">${esc(item.label)}</a>`).join('')}</div>`;
  }

  function compactArtwork(award, artist) {
    if (artist && award.winnerArtwork) return `<span class="compact-art compact-portrait" aria-hidden="true">${imageMarkup(award.winnerArtwork.path, false, '56px')}</span>`;
    return `<span class="compact-art" aria-hidden="true">${poster(award.winner.films[0], false, '56px')}</span>`;
  }

  function awardCard(award) {
    const feature = award.feature;
    const artist = enhanced && portfolioPresentation(award);
    const featured = enhanced && (feature || artist || award.id === 'best-performances-of-the-decade');
    const quote = award.winner.detail?.startsWith('“') && award.chapter.id !== 'film-music';
    const detail = artist ? workNames(award.winner) : award.winner.detail;
    const winner = `<button class="winner-frame" data-award="${award.number - 1}" aria-haspopup="dialog" aria-label="Open ${esc(award.name)}: ${esc(award.winner.text)}">
        ${renderFrames(awardFrames(award), feature, featured && !artist ? 'feature' : 'card')}${enhanced ? compactArtwork(award, artist) : ''}${winnerBadge(award)}
        <span class="winner-copy"><span class="winner-title">${artist ? esc(artistName(award.winner)) : title(award.winner)}</span>${detail ? `<span class="winner-detail${artist ? ' portfolio-summary' : quote ? ' line-of-dialogue' : ''}">${esc(detail)}</span>` : ''}${enhanced && !artist && award.winner.films.length === 1 ? `<span class="compact-year">${esc(film(award.winner.films[0]).year)}</span>` : ''}</span>${enhanced ? '' : '<span class="frame-open" aria-hidden="true">↗</span>'}
      </button>`;
    const fileAction = enhanced && !artist && award.winner.films.length === 1 ? `<a class="film-file-action" href="${esc(film(award.winner.films[0]).url)}" ${external} ${filmAttributes(award.winner.films[0])}>Film file</a>` : '';
    const actions = fileAction + musicActions(award);
    return `<article class="award-card${feature ? ' feature-card' : ''}${quote ? ' quote-card' : ''}${artist ? ' portfolio-card' : ''}${enhanced ? ' enhanced-card' : ''}${featured ? ' featured-award' : ''}" id="${award.id}" data-accent="${award.accent}" style="--accent:${award.accent}" aria-labelledby="heading-${award.id}">
      <div class="award-heading"><div><h3 id="heading-${award.id}">${esc(award.name)}</h3>${award.description ? `<p class="award-description">${esc(award.description)}</p>` : ''}</div><span class="award-number" aria-label="Award ${award.number}">${pad(award.number)}</span></div>
      ${enhanced ? `<div class="winner-block${artist ? ' artist-winner-block' : ''}">${winner}${artist ? `<div class="artist-context"><button class="artist-name-button" data-award="${award.number - 1}" aria-haspopup="dialog" aria-label="Open ${esc(award.name)}: ${esc(artistName(award.winner))}">${esc(artistName(award.winner))}</button>${artistWorks(award.winner)}${actions ? `<div class="winner-actions">${actions}</div>` : ''}</div>` : actions ? `<div class="winner-actions">${actions}</div>` : ''}</div>` : winner}
      ${nominations(award.nominees, false, artist)}
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
      ${entry ? `<article class="spotlight-card" style="--accent:#b7bac7"><h3>Best Performances of the Decade</h3><p class="spotlight-method">One role per entry.</p><div class="spotlight-visual">${backdrop(entry.films, false, selectStills(entry.films, 'performances-spotlight'))}<div class="winner-copy"><span class="winner-title">${title(entry)}</span><span class="winner-detail">${esc(entry.detail)}</span></div></div><ol class="spotlight-list"><li class="spotlight-winner">${filmLinks(entry.films)}</li>${archive.performances.slice(1).map(row => `<li>${poster(row.films[0], false, '48px')}<span><strong>${filmLinks(row.films)}</strong><small>${esc(row.detail)}</small></span></li>`).join('')}</ol></article>` : ''}
      ${actor ? `<article class="spotlight-card" style="--accent:#c4a385"><h3>Actor of the Decade</h3><p class="spotlight-method">Selected films across the decade.</p><div class="spotlight-visual">${backdrop(actor.films, false, selectStills(actor.films, 'actor-spotlight'), actorFocalPoints)}<div class="winner-copy"><span class="winner-title">${esc(actor.name)}</span></div></div><ol class="spotlight-list"><li class="spotlight-winner">${filmLinks(actor.films)}</li>${archive.actors.slice(1).map(row => `<li>${poster(row.films[0], false, '48px')}<span><strong>${esc(row.name)}</strong><small>${filmLinks(row.films)}</small></span></li>`).join('')}</ol></article>` : ''}
    </div>`;
  }

  function renderFilmWall() {
    const collected = new Map();
    for (const award of awards.filter(a => !negative.has(a.id) && !a.honorsPortfolio)) {
      for (const slug of award.winner.films) {
        const filmAwards = collected.get(slug) || [];
        filmAwards.push(award.name);
        collected.set(slug, filmAwards);
      }
    }
    $('#film-wall').innerHTML = [...collected.entries()].sort((a, b) => b[1].length - a[1].length).map(([slug, filmAwards]) => `<a class="wall-tile" href="${esc(film(slug).url)}" ${external} ${enhanced ? filmAttributes(slug) : `aria-label="${esc(film(slug).title)}. ${esc(filmAwards.join(', '))}. On Letterboxd."`} title="${esc(filmAwards.join(' · '))}">${poster(slug, false, '150px')}<span><strong>${esc(film(slug).title)}</strong><small>${filmAwards.length} ${filmAwards.length === 1 ? 'AWARD' : 'AWARDS'} <b>↗</b></small></span></a>`).join('');
  }

  function renderSnubs() {
    if (!snubList || !archive.snubs?.length) throw new Error('That edition has no Oscar Snubs list.');
    site.setText('#snubs-description', snubList.description);
    site.setText('#snub-count', `${archive.snubs.length} selections`);
    const featuredSnub = spotlightSnub();
    $('#snub-entries').innerHTML = archive.snubs.map(item => {
      const {name,entry,status} = item;
      const slug = entry.films[0];
      const link = `href="${esc(film(slug).url)}" ${external} ${filmAttributes(slug)}`;
      return `<article class="snub-card"${item === featuredSnub ? ` id="${spotlightAnchor}"` : ''}><a class="list-poster-link" ${link}>${poster(slug, false, '(max-width: 560px) 64px, 76px')}</a><div><p class="eyebrow">${esc(name)}</p><h3><a class="list-film-link" ${link}>${title(entry)}</a></h3>${entry.detail ? `<p>${esc(entry.detail)}</p>` : ''}<small>${esc(status)}</small></div></article>`;
    }).join('');
    const entry = archive.watch;
    if (entry) {
      $('#watch-entry').hidden = false;
      $('#watch-entry').innerHTML = `<article class="watch-frame"><p class="eyebrow">${esc(entry.label ?? 'Oscar Watch')}</p>${backdrop(entry.films)}<div class="winner-copy"><h2 class="winner-title">${title(entry)}</h2><p class="winner-detail">${esc(entry.detail)}</p><p class="watch-note">${esc(entry.note)}</p>${filmLinks(entry.films)}</div></article>`;
    }
    site.setupListView();
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
      const remaining = $('dialog[open]');
      if (!remaining) document.body.classList.remove('dialog-open');
      if (trigger instanceof HTMLElement && trigger.getClientRects().length && (!remaining || trigger.closest('dialog[open]'))) trigger.focus({preventScroll:true});
    });
  });

  // Dossiers work from an edition or its alternate ballot, without leaving the archive.
  document.addEventListener('click', event => {
    const frameAward = event.target.closest('a[data-frame-award]');
    if (!onSnubs && frameAward && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      const award = awardsById.get(frameAward.dataset.frameAward);
      if (award) {
        if (filmDialog.open) closeDialog(filmDialog);
        if (indexDialog.open) closeDialog(indexDialog);
        openAward(award.number - 1, document.getElementById(award.id)?.querySelector('.winner-frame'));
      }
      return;
    }
    const movie = event.target.closest('a[data-film-file]');
    if (filmDialog && movie && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      openFilmFile(movie.dataset.filmFile, movie);
      return;
    }
    const jump = event.target.closest('button[data-jump-award]');
    if (jump) jumpToAward(jump.dataset.jumpAward);
  });

  if ($('#snub-entries')) renderSnubs();

  if ($('#credit-links')) {
    $('#credit-links').innerHTML = `<p>${selected.coverSource ? `<a href="${esc(selected.coverSource)}" ${external}>${esc(selected.coverFilm)} cover image ↗</a><br>` : ''}<a href="${esc(profile.url)}" ${external}>${esc(profile.name)} · Letterboxd profile artwork ↗</a></p><details class="image-sources"><summary>Film artwork sources</summary><ul>${Object.entries(archive.films).map(([slug, info]) => `<li><a href="${esc(art(slug).source || info.url)}" ${external}>${esc(info.title)} ↗</a>${art(slug).posterSource ? ` · <a href="${esc(art(slug).posterSource)}" ${external}>Poster source</a>` : ''}${art(slug).backdropSource ? ` · <a href="${esc(art(slug).backdropSource)}" ${external}>Film still</a>` : ''}</li>`).join('')}</ul></details>`;
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
    const portraits = awards.filter(award => award.winnerArtwork?.credit).map(award => {
      const label = award.honorsPortfolio ? artistName(award.winner) : award.winner.title;
      const source = award.winnerArtwork.source;
      return `<li>${esc(label)} · ${esc(award.winnerArtwork.credit)}${source ? ` · <a href="${esc(source)}" ${external}>Source</a>` : ''}</li>`;
    });
    if (portraits.length) {
      $('#credit-links').insertAdjacentHTML('beforeend', `<details class="image-sources"><summary>Portraits</summary><ul>${portraits.join('')}</ul></details>`);
    }
    if (archive.referenceSources?.length) {
      const references = archive.referenceSources.map(({url, title}) => `<li><a href="${esc(url)}" ${external}>${esc(title)} ↗</a></li>`).join('');
      $('#credit-links').insertAdjacentHTML('beforeend', `<details class="image-sources"><summary>Film and music credits</summary><ul>${references}</ul></details>`);
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
  if (enhanced) {
    $('.edition-strip').innerHTML = `<p class="edition-totals"><span><b id="award-count">${awards.length}</b> awards</span><span aria-hidden="true">·</span><span><b id="chapter-count">${archive.chapters.length}</b> chapters</span></p><a href="#final-cut">Meet the films</a>`;
  }
  renderChapters();
  if (hasSpotlights) renderSpotlights();
  renderFilmWall();
  if (snubList && spotlightSnub()) {
    const item = spotlightSnub();
    const slug = item.entry.films[0];
    const path = art(slug).backdrop;
    if (path) {
      const link = site.listHref(snubList) + '#' + spotlightAnchor;
      $('.snubs-banner').insertAdjacentHTML('beforebegin', `<section class="snub-spotlight section-shell" aria-labelledby="snub-spotlight-title">
        <div class="snub-spotlight-feature"><a class="snub-spotlight-image" href="${esc(link)}" aria-label="Read the ${esc(film(slug).title)} selection">${imageMarkup(path, false, '(min-width: 850px) 56vw, 90vw')}</a>
        <div class="snub-spotlight-copy"><p class="eyebrow">OSCAR SNUBS · ${esc(item.name)}</p><h2 id="snub-spotlight-title">${esc(film(slug).title)}</h2><p class="snub-spotlight-person">${esc(item.entry.detail)}</p><p class="snub-spotlight-status">${esc(item.status)}</p><a href="${esc(link)}" class="snub-spotlight-link">Explore the alternate ballot</a></div></div>
      </section>`);
    }
  }

  const dialogContent = $('#dialog-content');
  const dialogScroll = $('.ceremony-scroll', awardDialog);
  const dialogTitle = $('#dialog-category');
  const nextButton = $('.ceremony-next', awardDialog);
  const search = $('#category-search');
  let current = 0;
  let startTouch = null;
  let sceneChange = null;
  let indexYear = null;
  let copyNoticeTimer;
  const shareButton = $('[data-copy-award]', awardDialog);
  if (enhanced) {
    const years = [...new Set(Object.values(archive.films).map(info => info.year))].sort((a,b) => a-b);
    search.insertAdjacentHTML('afterend', `<div class="index-year-filter"><div class="index-year-label">Release year</div><div class="index-years" role="group" aria-label="Filter films and awards by release year"><button type="button" data-index-year="all" aria-pressed="true">All</button>${years.map(year => `<button type="button" data-index-year="${esc(year)}" aria-pressed="false">${esc(year)}</button>`).join('')}</div></div>`);
    $('.index-years').addEventListener('click', event => {
      const button = event.target.closest('button[data-index-year]');
      if (!button) return;
      indexYear = button.dataset.indexYear === 'all' ? null : Number(button.dataset.indexYear);
      $$('.index-years button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      renderIndex(search.value);
      $('#index-results').scrollTop = 0;
    });
  }

  if (enhanced) {
    for (const switcher of $$('.view-switch')) switcher.hidden = false;
    $('[data-view-toggle]').hidden = false;
    syncViewButtons();
  }

  function syncViewButtons() {
    $$('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === document.body.dataset.awardView)));
    const toggle = $('[data-view-toggle]');
    if (toggle && enhanced) {
      const next = document.body.dataset.awardView === 'compact' ? 'cinematic' : 'compact';
      const label = next === 'compact' ? 'Compact' : 'Cinematic';
      toggle.dataset.nextView = next;
      $('.nav-view-label', toggle).textContent = label;
      toggle.setAttribute('aria-label', `Switch to ${label} view`);
      toggle.title = `Switch to ${label} view`;
    }
  }

  function setAwardView(mode, preservePosition = false) {
    if (!enhanced || !['cinematic','compact'].includes(mode) || document.body.dataset.awardView === mode) return;
    const fromIndex = indexDialog.open;
    let anchor = null;
    if (fromIndex || preservePosition) {
      const navBottom = $('#awards').getBoundingClientRect().bottom;
      const line = Math.max(navBottom + 16, window.innerHeight * .45);
      const visible = $$('.award-card').map(card => ({card, rect:card.getBoundingClientRect()})).filter(({rect}) => rect.bottom > navBottom && rect.top < window.innerHeight);
      const hashMatch = visible.find(({card}) => `#${card.id}` === location.hash);
      const nearest = visible.find(({rect}) => rect.top <= line && rect.bottom >= line) ?? visible.sort((a,b) => Math.abs(a.rect.top - line) - Math.abs(b.rect.top - line))[0];
      anchor = (hashMatch ?? nearest)?.card ?? null;
    }
    document.body.dataset.awardView = mode;
    syncViewButtons();
    const url = new URL(location.href);
    if (mode === 'compact') url.searchParams.set('view', mode);
    else url.searchParams.delete('view');
    if (anchor) url.hash = anchor.id;
    site.replaceLocation(url);
    if (fromIndex) closeDialog(indexDialog);
    requestAnimationFrame(() => {
      if (anchor) anchor.scrollIntoView({behavior:'instant',block:'start'});
      onScroll();
    });
  }

  function directorFor(slug) {
    if (film(slug).director) return film(slug).director;
    const direction = awardsById.get('director-of-the-decade');
    const credit = direction && [direction.winner,...direction.nominees].find(entry => entry.films.includes(slug));
    return credit ? artistName(credit) : '';
  }

  function dossierEntries(slug) {
    const wins = [], mentions = [], portfolios = [], selected = [];
    for (const award of awards) {
      const winner = award.winner.films.includes(slug);
      const nominated = award.nominees.filter(entry => entry.films.includes(slug));
      if (award.honorsPortfolio) {
        if (winner) portfolios.push({award,detail: `Winning body of work · ${artistName(award.winner)}`});
        nominated.forEach(entry => portfolios.push({award,detail: `Honorable mention · ${artistName(entry)}`}));
      } else {
        if (winner) (negative.has(award.id) ? selected : wins).push({award,detail: award.winner.detail});
        nominated.forEach(entry => mentions.push({award,detail: entry.detail}));
      }
    }
    return {wins,mentions,portfolios,selected};
  }

  function dossierSection(label, rows) {
    if (!rows.length) return '';
    return `<section class="film-file-section"><h3>${esc(label)} <span>${pad(rows.length)}</span></h3><ul>${rows.map(({award,detail}) => `<li><button class="film-award-row" data-jump-award="${esc(award.id)}"><span><strong>${esc(award.name)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</span><span class="file-award-number">${pad(award.number)}</span></button></li>`).join('')}</ul></section>`;
  }

  function awardStillGallery(slug) {
    const seen = new Set();
    const frames = (alternates[slug] ?? []).filter(still => {
      const award = awardsById.get(still.award);
      if (!still.path || seen.has(still.award) || !award?.winner.films.includes(slug)) return false;
      seen.add(still.award);
      return true;
    }).sort((a, b) => awardsById.get(a.award).number - awardsById.get(b.award).number);
    if (frames.length < 2) return '';
    return `<section class="award-stills" aria-labelledby="award-stills-title"><div class="award-stills-heading"><h3 id="award-stills-title">Through its awards</h3><span>${frames.length} frames</span></div><div class="award-stills-track" tabindex="0" aria-label="Scroll through award film stills">${frames.map(still => `<a class="award-still" href="${esc(directAwardHref(still.award))}" data-frame-award="${esc(still.award)}">${imageMarkup(still.path, false, '(max-width: 560px) 168px, 224px')}<span>${esc(awardsById.get(still.award).name)}</span></a>`).join('')}</div></section>`;
  }

  function openFilmFile(slug, trigger) {
    if (!filmDialog || !film(slug)) return;
    const info = film(slug);
    const {wins,mentions,portfolios,selected} = dossierEntries(slug);
    const director = directorFor(slug);
    const movieArt = art(slug);
    const dossierStill = movieArt.backdrop || alternates[slug]?.find(still => still.path)?.path;
    const listening = awards.flatMap(award => (award.listen ?? []).filter(item => item.film === slug));
    const snubs = (archive.snubs ?? []).filter(item => item.entry.films.includes(slug));
    const winText = `${wins.length} ${wins.length === 1 ? 'award' : 'awards'}`;
    $('#film-file-title').textContent = info.title;
    $('#film-file-content').innerHTML = `
      ${dossierStill ? `<div class="film-file-frame">${imageMarkup(dossierStill, true, '(min-width: 920px) 820px, 90vw')}</div>` : ''}
      <div class="film-file-meta"><div class="file-poster">${poster(slug,true,'96px')}</div><div><p class="file-year">${esc(info.year)}${director ? ` · ${esc(director)}` : ''}</p><p class="file-tally">${esc(winText)} <span>· ${mentions.length} ${mentions.length === 1 ? 'honorable mention' : 'honorable mentions'}</span></p><a class="file-letterboxd" href="${esc(info.url)}" ${external}>View on Letterboxd</a></div></div>
      ${awardStillGallery(slug)}
      <div class="film-file-sections">
      ${dossierSection('Awards',wins)}${dossierSection('Honorable mentions',mentions)}${dossierSection('Body of work',portfolios)}${dossierSection('Editorial selections',selected)}
      ${listening.length ? `<section class="film-file-section file-music"><h3>Film music</h3><ul>${listening.map(item => `<li><a href="${esc(item.url)}" class="music-link file-music-link" ${external}>${esc(item.title)}</a></li>`).join('')}</ul></section>` : ''}
      ${snubs.length ? `<section class="film-file-section file-snubs"><h3>Oscar Snubs</h3><ul>${snubs.map(item => `<li><strong>${esc(item.name)}</strong><small>${esc(item.status)}</small></li>`).join('')}</ul>${snubList ? `<a class="file-letterboxd" href="${esc(site.listHref(snubList))}">See the alternate ballot</a>` : ''}</section>` : ''}
      ${!wins.length && !mentions.length && !portfolios.length && !selected.length && !snubs.length ? '<p class="empty-index">No selections in this edition.</p>' : ''}</div>`;
    $('#film-file-content').scrollTop = 0;
    openDialog(filmDialog, '#film-file-title', trigger);
  }

  function jumpToAward(id) {
    const target = document.getElementById(id);
    if (!target) {
      if (onSnubs && awardsById.has(id)) location.href = site.editionHref(editionId) + '#' + encodeURIComponent(id);
      return;
    }
    for (const dialog of [filmDialog, awardDialog, indexDialog]) if (dialog?.open) closeDialog(dialog);
    const url = new URL(location.href);
    url.hash = id;
    site.replaceLocation(url);
    requestAnimationFrame(() => target.scrollIntoView({block:'start',behavior: reducedMotion.matches ? 'instant' : 'smooth'}));
  }

  function prepareAward(index) {
    const award = awards[index];
    if (!award || navigator.connection?.saveData) return Promise.resolve();
    const frames = awardFrames(award, 'dialog');
    const {sizes} = frameLayout(frames, 'dialog');
    return Promise.all(frames.map(({path}, i) => {
      if (!path) return Promise.resolve();
      const image = new Image();
      const srcset = imageSources(path);
      if (srcset) {
        image.sizes = sizes[i];
        image.srcset = srcset;
      }
      image.src = path;
      return image.decode().catch(() => {});
    }));
  }

  function renderAward(index, direction = 0) {
    current = index;
    const award = awards[index];
    const next = awards[index + 1];
    const percent = (index + 1) / awards.length * 100;
    const artist = enhanced && portfolioPresentation(award);
    const winnerDetail = artist || (award.honorsPortfolio && award.winner.creditFirst) ? '' : award.winner.detail;
    dialogContent.style.setProperty('--accent', award.accent);
    $('#dialog-chapter').textContent = award.chapter.name;
    dialogTitle.textContent = award.name;
    shareButton.dataset.copyAward = award.id;
    clearTimeout(copyNoticeTimer);
    $('.award-share-status', shareButton.parentElement).replaceChildren();
    shareButton.classList.remove('is-copied');
    $('#dialog-number').textContent = pad(index + 1);
    $('.ceremony-progress', awardDialog).style.setProperty('--progress', `${percent}%`);
    $('.ceremony-prev', awardDialog).disabled = index === 0;
    nextButton.innerHTML = next ? `<span>NEXT AWARD →</span><small>${esc(next.name)}</small>` : '<span>FINISH ✓</span>';
    nextButton.setAttribute('aria-label', next ? `Next award: ${next.name}` : 'Finish awards presentation');
    const frames = renderFrames(awardFrames(award, 'dialog'), true, 'dialog');
    const frameClass = `ceremony-frame${artist ? ' portfolio-frame' : ''}${award.winnerArtwork ? ' portrait-frame' : ''}`;
    const winnerTitle = artist ? esc(artistName(award.winner)) : title(award.winner);
    const detailMarkup = winnerDetail ? `<span class="winner-detail">${esc(winnerDetail)}</span>` : '';
    const singleFilm = !artist && award.winner.films.length === 1 ? award.winner.films[0] : null;
    const linkedTitle = singleFilm
      ? `<a class="ceremony-title-link" href="${esc(film(singleFilm).url)}" ${external} ${filmAttributes(singleFilm)} title="Open film file">${winnerTitle}</a>`
      : winnerTitle;
    const compactFrame = `<div class="${frameClass}">${frames}</div>`;
    const compactMeta = `<div class="ceremony-winner-meta"><div><strong class="winner-title">${linkedTitle}</strong>${detailMarkup}</div>${singleFilm ? `<span class="ceremony-year">${esc(film(singleFilm).year)}</span>` : ''}</div>`;
    const winnerMarkup = enhanced
      ? compactFrame + compactMeta + (!artist && !singleFilm ? `<div class="ceremony-links">${filmLinks(award.winner.films)}</div>` : '')
      : `<div class="${frameClass}">${frames}<span class="frame-shade"></span>${winnerBadge(award)}
        <div class="winner-copy"><strong class="winner-title">${winnerTitle}</strong>${detailMarkup}${artist ? '' : `<div class="ceremony-links">${filmLinks(award.winner.films)}</div>`}</div>
      </div>`;
    const detailSections = `
      ${award.description ? `<p class="award-description ceremony-description">${esc(award.description)}</p>` : ''}
      ${artist ? `<div class="ceremony-works">${artistWorks(award.winner)}</div>` : ''}
      ${award.listen?.length && enhanced ? `<div class="ceremony-music">${musicActions(award)}</div>` : ''}`;
    const lead = artist
      ? `<div class="ceremony-artist-lead">${compactFrame}<div class="ceremony-artist-context">${compactMeta}${detailSections}</div></div>`
      : winnerMarkup + detailSections;
    dialogScroll.innerHTML = `<div class="ceremony-body${artist ? ' portfolio-presentation' : ''} ${direction < 0 ? 'slide-back' : 'slide-in'}">
      ${lead}
      ${nominations(award.nominees, true, artist)}
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
    if (!awardDialog.open) openDialog(awardDialog, '#dialog-category', trigger);
  }

  async function copyAwardLink(button) {
    const awardId = button.dataset.copyAward;
    const value = directAwardHref(awardId);
    const status = $('.award-share-status', button.parentElement);
    clearTimeout(copyNoticeTimer);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
    } catch {
      if (button.dataset.copyAward !== awardId) return;
      const field = document.createElement('input');
      field.className = 'award-share-field';
      field.setAttribute('aria-label', 'Direct award link');
      field.readOnly = true;
      field.value = value;
      status.replaceChildren(field);
      field.select();
      try {
        if (!document.execCommand('copy')) throw new Error('Copy unavailable');
      } catch {
        field.focus();
        field.select();
        return;
      }
    }
    if (button.dataset.copyAward !== awardId) return;
    status.textContent = 'Link copied';
    button.classList.add('is-copied');
    copyNoticeTimer = setTimeout(() => {
      status.replaceChildren();
      button.classList.remove('is-copied');
    }, 2000);
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
      {opacity: .55, transform: `translateX(${direction * -5}px)`}
    ], {duration: 120, easing: 'ease-in', fill: 'forwards'});
    sceneChange = outgoing;
    let deadline;
    try {
      await Promise.all([
        outgoing.finished,
        Promise.race([prepareAward(next), new Promise(resolve => { deadline = setTimeout(resolve, 210); })])
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
      const yearMatches = indexYear === null || [a.winner, ...a.nominees].some(entry => entry.films.some(slug => Number(film(slug)?.year) === indexYear));
      return yearMatches && words.every(word => haystack.includes(word));
    });
    const matchingFilms = enhanced && (words.length || indexYear !== null) ? Object.entries(archive.films).filter(([,info]) => {
      const haystack = normal(`${info.title} ${info.year ?? ''}`);
      return (indexYear === null || Number(info.year) === indexYear) && words.every(word => haystack.includes(word));
    }) : [];
    const films = indexYear === null ? matchingFilms.slice(0,8) : matchingFilms;
    const filmMatches = films.length ? `<p class="index-match-heading">FILM FILES${indexYear !== null ? ` · ${esc(indexYear)}` : ''}</p>${films.map(([slug,info]) => `<a class="index-row film-index-row" href="${esc(info.url)}" ${external} ${filmAttributes(slug)}>${poster(slug,false,'32px')}<span><strong>${esc(info.title)}</strong><small>${esc(info.year)}</small></span><span class="file-result-label">Film file</span></a>`).join('')}` : '';
    const awardMatches = results.length ? `${films.length || indexYear !== null ? `<p class="index-match-heading">${indexYear !== null ? `AWARDS INVOLVING ${esc(indexYear)} FILMS` : 'AWARDS'}</p>` : ''}${results.map(a => `<button class="index-row" data-award="${a.number - 1}"><span>${pad(a.number)}</span><span><strong>${esc(a.name)}</strong><small>${esc(enhanced && portfolioPresentation(a) ? artistName(a.winner) : a.winner.title)}</small></span><b aria-hidden="true">↗</b></button>`).join('')}` : '';
    $('#index-results').innerHTML = filmMatches + awardMatches || '<p class="empty-index">No matches. Try a film title, category or name.</p>';
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
    if (button.matches('[data-copy-award]')) { copyAwardLink(button); return; }
    if (button.matches('[data-view-toggle]')) { setAwardView(button.dataset.nextView, true); return; }
    if (button.matches('[data-view]')) { setAwardView(button.dataset.view); return; }
    if (button.matches('[data-jump-award]')) return;
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
  const masthead = $('.masthead');
  const chapterNav = $('#awards');
  const overview = $('.edition-strip');
  let navScrollAnchor = Math.max(0, window.scrollY);
  let condensed = false;
  let frame = 0;
  let currentAccent;
  let currentChapter;

  function refreshNavigation() {
    if (!enhanced) return;
    const y = Math.max(0, window.scrollY);
    // Only collapse once the complete chapter bar has reached the top.
    // A small movement threshold prevents jitter on touchpads and phones.
    const eligible = overview.getBoundingClientRect().bottom < -22;
    const focusedNavigation = document.activeElement?.matches(':focus-visible') && document.activeElement.closest('.masthead, #chapter-links');
    let next = condensed;
    if (!eligible || focusedNavigation) { next = false; navScrollAnchor = y; }
    else if (y > navScrollAnchor + 14) { next = true; navScrollAnchor = y; }
    else if (y < navScrollAnchor - 14) { next = false; navScrollAnchor = y; }
    if (next === condensed) return;
    condensed = next;
    currentChapter = undefined;
    document.body.classList.toggle('nav-condensed', condensed);
    masthead.inert = condensed;
    $('#chapter-links').inert = condensed;
    $('.current-chapter', chapterNav).hidden = !condensed;
  }

  function refreshScroll() {
    refreshNavigation();
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
    // Match the persistent anchor top margin in both navigation modes.
    const active = chapters.findLast(chapter => chapter.getBoundingClientRect().top < 180);
    if (enhanced) {
      const end = $('#final-cut').getBoundingClientRect().top < 180;
      const label = end ? 'The final cut' : archive.chapters.find(chapter => chapter.id === active?.id)?.name ?? archive.chapters[0].name;
      $('#active-chapter-label').textContent = label;
    }
    if (currentChapter !== active?.id) {
      currentChapter = active?.id;
      for (const link of links) {
        if (link.dataset.chapter === currentChapter) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
      const visibleLink = links.find(link => link.dataset.chapter === currentChapter) ?? links[0];
      if (visibleLink && !condensed) {
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
  const directAward = awardsById.get(site.params.get('award'));
  if (directAward) requestAnimationFrame(() => {
    const card = document.getElementById(directAward.id);
    card?.scrollIntoView({behavior:'instant', block:'start'});
    openAward(directAward.number - 1, card?.querySelector('.winner-frame'));
  });
})().catch(error => window.ArchiveSite.showError(error));
