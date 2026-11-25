(async () => {
  'use strict';
  const site = window.ArchiveSite;
  const catalog = await site.catalog();
  const editionId = site.params.get('edition') ?? catalog.featuredEdition;
  const selected = catalog.editions.find(item => item.id === editionId);
  if (!selected) throw new Error('That edition is not in the archive.');
  const theme = window.ArchiveTheme;
  theme.apply(document.body.dataset.page, selected.id);
  const archive = await site.read(selected.content);
  const explore = window.ArchiveExplore;
  const rhythmLeads = new Set(['film-direction','scenes-moments','editorial-picks']);
  const rhythmAwards = new Set(['best-picture','best-scene','best-cinematography']);
  const exploreEngine = explore.createEngine(catalog, {edition: selected, archive});
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
  const discovery = archive.discovery ?? {};
  const alternates = archive.stills ?? {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const actorFocalPoints = edition.actorFocalPoints ?? {};
  const hasSpotlights = archive.performances?.length || archive.actors?.length;
  const snubList = catalog.lists.find(item => item.kind === 'snubs' && item.edition === editionId);
  const defaultAccent = theme.accent();
  const chapterAccent = chapterId => theme.chapterAccent(chapterId);
  const awards = archive.chapters.flatMap(chapter => chapter.awards.map(award => ({...award, chapter})))
    .map((award, i) => ({
      ...award, number: i + 1,
      accent: chapterAccent(award.chapter.id)
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
  function snubAnchor(item) {
    return item === spotlightSnub()
      ? spotlightAnchor
      : 'snub-' + (item.id || keyFor(item.name) + '-' + item.entry.films[0]);
  }
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
  const indexDialog = onSnubs ? null : $('#index-dialog');
  const filmDialog = $('#film-file-dialog');
  const personDialog = $('#person-dialog');
  const frameDialog = $('#frame-dialog');
  const portfolioPresentation = award => award.honorsPortfolio ||
    (['director-of-the-decade', 'composer-of-the-decade'].includes(award.id) && award.winner.films.length > 1);
  if (enhanced) document.body.dataset.awardView = site.params.get('view') === 'compact' ? 'compact' : 'cinematic';
  site.setText('[data-edition-period]', selected.period);
  site.setText('[data-edition-label]', onSnubs ? 'THE ALTERNATE BALLOT / ' + selected.period : 'THE ' + selected.period + ' EDITION');
  const cover = onSnubs ? snubList : selected;
  const coverImage = $(onSnubs ? '.snubs-image' : '.hero-image');
  site.setCover(coverImage, cover?.cover, cover, media);
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

  function largestFrame(path) {
    const original = {src: path, width: media.sizes?.[path]?.[0] ?? Infinity};
    return (media.variants?.[path] ?? []).reduce((largest, variant) =>
      variant.width > largest.width ? variant : largest, original).src;
  }

  function frameButton(path, label, classes, markup, attributes = '') {
    return `<button type="button" class="${classes} frame-enlarge" data-full-frame="${esc(largestFrame(path))}" data-frame-path="${esc(path)}" data-frame-label="${esc(label)}" aria-label="View full frame of ${esc(label)}" aria-haspopup="dialog" title="View full frame"${attributes}>${markup}<svg class="frame-expand-icon" width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8V3h5m4 0h5v5m0 4v5h-5m-4 0H3v-5"/></svg></button>`;
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
    const presentation = enhanced ? edition.presentationStills?.[award.id] : null;
    if (!award.winnerArtwork && presentation && (layout === 'dialog' || presentation.allLayouts) && award.winner.films.includes(presentation.film)) {
      return [{slug: presentation.film, path: presentation.path, label: film(presentation.film).title,
        shape: 'wide', focal: presentation.focal}];
    }
    if (award.winnerArtwork) {
      return [{path: award.winnerArtwork.path, label: portfolioPresentation(award) ? artistName(award.winner) : award.winner.title,
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
          ? `(max-width: 680px) 94vw, (min-width: 2070px) ${Math.ceil(1136 * share)}px, (min-width: 1450px) ${Math.ceil(57 * share)}vw, (min-width: 900px) ${Math.ceil(800 * share)}px, ${Math.ceil(94 * share)}vw`
          : `(min-width: 1150px) ${Math.ceil(1052 * share)}px, ${Math.ceil(94 * share)}vw`;
        if (layout === 'feature') return `${Math.ceil(88 * share)}vw`;
        if (layout === 'artist') return `(min-width: 1450px) ${Math.ceil(620 * share)}px, (min-width: 681px) ${Math.ceil(48 * share)}vw, ${Math.ceil(88 * share)}vw`;
        return `(min-width: 850px) ${Math.ceil(60 * share)}vw, ${Math.ceil(88 * share)}vw`;
      })
    };
  }

  function renderFrames(frames, eager, layout = 'card') {
    const {ratio, columns, sizes} = frameLayout(frames, layout);
    const interactive = layout === 'dialog' && frameDialog;
    const images = frames.map((frame, i) => {
      if (!frame.path) return `<span class="frame-image blank">${esc(frame.label)}</span>`;
      const position = frame.focal ? ` style="--focal-x:${esc(frame.focal)}"` : '';
      const filmData = frame.slug ? ` data-film="${esc(frame.slug)}"` : '';
      const markup = imageMarkup(frame.path, eager, sizes[i]);
      return interactive
        ? frameButton(frame.path, frame.label, 'frame-image ' + frame.shape, markup, filmData + position)
        : `<span class="frame-image ${frame.shape}"${filmData}${position}>${markup}</span>`;
    });
    return `<span class="frame-media${frames.length > 1 ? ' split-media' : ''}" style="--image-ratio:${ratio};--frame-columns:${columns}"${interactive ? '' : ' aria-hidden="true"'}>${images.join('')}</span>`;
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

  function keyFor(value) {
    return normal(String(value ?? '')).replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
  }

  function personKey(name) {
    return normal(name).replace(/[^\p{L}\p{N}]/gu, '');
  }

  // Only categories with actual personal credits enter the artist index.
  // Mood descriptions, dialogue, character names and technical teams do not.
  const actingCredits = explore.actingCredits;
  function creditFor(entry, category) {
    return explore.creditFor(entry, category, discovery);
  }

  function snubCredit(item) {
    return creditFor(item.entry, item.academy?.category || item.name);
  }

  const people = new Map();
  const peopleByFilm = new Map();
  function recordPeople(credit, appearance) {
    for (const name of credit?.names ?? []) {
      const id = personKey(name);
      const person = people.get(id) ?? {id, name, appearances: []};
      person.appearances.push(appearance);
      people.set(id, person);
      for (const slug of appearance.films) {
        if (!peopleByFilm.has(slug)) peopleByFilm.set(slug, new Set());
        peopleByFilm.get(slug).add(id);
      }
    }
  }
  for (const award of awards) {
    [award.winner, ...award.nominees].forEach((entry, i) => {
      const status = i ? 'Honorable mention' : portfolioPresentation(award)
        ? 'Winning body of work' : negative.has(award.id) ? 'Editorial selection' : 'Winner';
      const sourceWork = award.id === 'best-non-original-screenplay' && entry.detail === 'Murakami × Chekhov';
      recordPeople(creditFor(entry, award.id), {
        awardId: award.id, chapterId: award.chapter.id, category: award.name,
        status: sourceWork ? status + ' · Source work' : status, films: entry.films
      });
    });
  }
  for (const item of archive.snubs ?? []) {
    recordPeople(snubCredit(item), {
      snub: item, category: item.name, status: 'Oscar Snubs · ' + item.status, films: item.entry.films
    });
  }
  (archive.performances ?? []).forEach((entry, i) => recordPeople(creditFor(entry, 'best-actor'), {
    section: 'spotlights', category: 'Best Performances of the Decade',
    status: i ? 'Performance spotlight' : 'Winning performance', films: entry.films
  }));
  (archive.actors ?? []).forEach((entry, i) => recordPeople({names: [entry.name]}, {
    section: 'spotlights', category: 'Actor of the Decade',
    status: i ? 'Body of work · mention' : 'Winning body of work', films: entry.films
  }));
  if (archive.watch) recordPeople(creditFor(archive.watch, 'best-supporting-actor'), {
    watch: true, category: 'Oscar Watch', status: 'Pending nominations', films: archive.watch.films
  });

  function personLink(name, label = name, classes = 'person-link') {
    const person = people.get(personKey(name));
    return personDialog && person
      ? `<button type="button" class="${classes}" data-person="${esc(person.id)}" aria-label="Open artist file for ${esc(person.name)}" aria-haspopup="dialog">${esc(label)}</button>`
      : esc(label);
  }

  function creditMarkup(credit, fallback) {
    if (!credit) return esc(fallback);
    const names = credit.names.map(name => personLink(name));
    const joined = credit.joiner ? names.join(esc(credit.joiner)) : names.length > 2
      ? names.slice(0, -1).join(', ') + ' &amp; ' + names.at(-1)
      : names.join(' &amp; ');
    return esc(credit.prefix) + joined + esc(credit.suffix);
  }

  function performanceCredit(entry, category) {
    return actingCredits.has(keyFor(category)) ? creditFor(entry, category) : null;
  }

  function performanceName(credit) {
    return credit.names.join(credit.joiner || ' & ');
  }

  function performanceNameMarkup(credit) {
    return creditMarkup({...credit, prefix: '', suffix: ''});
  }

  function performanceFilmLine(entry, credit, classes = 'performance-film-link') {
    const works = entry.films.map(slug => {
      const info = film(slug);
      return `<span class="performance-work"><a class="${classes}" href="${esc(info.url)}" ${external} ${filmAttributes(slug)}>${esc(info.title)}</a><span class="performance-year"> · ${esc(info.year)}</span></span>`;
    }).join(' <span class="title-slash" aria-hidden="true">/</span> ');
    return works + (credit.suffix ? ` <span class="performance-role">· ${esc(credit.suffix.trim())}</span>` : '');
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

  function nomination(entry, eager = false, artist = false, category = '') {
    const posterSize = entry.films.length > 1 ? (enhanced ? '40px' : '50px') : enhanced ? (eager ? '(max-width: 680px) 68px, 84px' : '72px') : '82px';
    const posters = entry.films.map(slug => `<a class="nominee-poster" href="${esc(film(slug).url)}" ${external} ${filmAttributes(slug)}>${poster(slug, eager, posterSize)}</a>`).join('');
    const detail = artist ? workNames(entry) : entry.detail;
    const credit = creditFor(entry, category);
    const performance = !artist && performanceCredit(entry, category);
    const name = artist ? creditMarkup(credit, artistName(entry)) : performance ? performanceNameMarkup(performance) : title(entry);
    const character = eager && !artist && !performance && credit?.suffix === ')' && credit.prefix.endsWith('(');
    const caption = artist ? esc(detail) : performance ? performanceFilmLine(entry, performance) : character
      ? `<span class="nominee-character">${esc(credit.prefix.slice(0,-1).trim())}</span><span class="nominee-actor">${creditMarkup({...credit,prefix:'',suffix:''},'')}</span>`
      : creditMarkup(credit, detail);
    return `<li class="nominee${performance ? ' performance-nominee' : ''}"><div class="nominee-art${entry.films.length > 1 ? ' multi-poster' : ''}">${posters}</div><strong>${name}</strong>${detail || performance ? `<small>${caption}</small>` : ''}</li>`;
  }

  function nominations(entries, eager = false, artist = false, category = '', listId = '') {
    if (!entries.length) return '';
    return `<div class="shortlist${artist ? ' artist-shortlist' : ''}"${listId ? ` id="${esc(listId)}"` : ''}><p class="micro">Honorable mentions <span>${pad(entries.length)}</span></p><ul class="nominee-grid" aria-label="Honorable mentions" data-count="${entries.length}" style="--count:${entries.length}">${entries.map(entry => nomination(entry, eager, artist, category)).join('')}</ul></div>`;
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
    const widePortfolio = artist && edition.presentationStills?.[award.id]?.allLayouts === true;
    const featured = enhanced && (feature || artist || award.id === 'best-performances-of-the-decade');
    const quote = award.winner.detail?.startsWith('“') && award.chapter.id !== 'film-music';
    const detail = artist ? workNames(award.winner) : award.winner.detail;
    const credit = creditFor(award.winner, award.id);
    const performance = enhanced && !artist && performanceCredit(award.winner, award.id);
    const linkedCredit = !artist && !performance && personDialog && credit;
    const caption = performance
      ? `<div class="winner-copy performance-copy"><strong class="winner-title">${performanceNameMarkup(performance)}</strong><div class="winner-detail">${performanceFilmLine(award.winner, performance)}</div></div>`
      : '';
    const winnerSummary = performance ? performanceName(performance) + ' — ' + workNames(award.winner) : award.winner.text;
    const winner = `<button class="winner-frame" data-award="${award.number - 1}" aria-haspopup="dialog" aria-label="Open ${esc(award.name)}: ${esc(winnerSummary)}">
        ${renderFrames(awardFrames(award), feature, artist && !widePortfolio ? 'artist' : featured ? 'feature' : 'card')}${enhanced ? compactArtwork(award, artist) : ''}${winnerBadge(award)}
        ${performance ? '' : `<span class="winner-copy"><span class="winner-title">${artist ? esc(artistName(award.winner)) : title(award.winner)}</span>${detail && !linkedCredit ? `<span class="winner-detail${artist ? ' portfolio-summary' : quote ? ' line-of-dialogue' : ''}">${esc(detail)}</span>` : ''}${enhanced && !artist && award.winner.films.length === 1 ? `<span class="compact-year">${esc(film(award.winner.films[0]).year)}</span>` : ''}</span>`}${enhanced ? '' : '<span class="frame-open" aria-hidden="true">↗</span>'}
      </button>`;
    const actions = musicActions(award);
    const mentionsId = 'mentions-' + award.id;
    const mentionsToggle = award.nominees.length
      ? `<button type="button" class="compact-mentions-toggle" data-mentions-toggle aria-expanded="false" aria-controls="${esc(mentionsId)}">${award.nominees.length} ${award.nominees.length === 1 ? 'mention' : 'mentions'}<svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2 4 4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` : '';
    const artistHeading = artist && credit && personDialog
      ? personLink(credit.names[0], artistName(award.winner), 'artist-name-button person-link')
      : `<button class="artist-name-button" data-award="${award.number - 1}" aria-haspopup="dialog" aria-label="Open ${esc(award.name)}: ${esc(artistName(award.winner))}">${esc(artistName(award.winner))}</button>`;
    const artistAction = artist && credit && personDialog ? personLink(credit.names[0], 'Artist file', 'person-link artist-file-action') : '';
    const artistContext = artist
      ? `<div class="artist-context">${artistHeading}${artistWorks(award.winner)}${actions ? `<div class="winner-actions">${actions}</div>` : ''}</div>${artistAction || mentionsToggle ? `<div class="winner-actions portfolio-compact-actions">${artistAction}${mentionsToggle}</div>` : ''}`
      : `${caption}${linkedCredit ? `<p class="winner-credit-line">${creditMarkup(credit, detail)}</p>` : ''}${actions || mentionsToggle ? `<div class="winner-actions${actions ? '' : ' compact-only'}">${actions}${mentionsToggle}</div>` : ''}`;
    return `<article class="award-card${feature ? ' feature-card' : ''}${quote ? ' quote-card' : ''}${artist ? ' portfolio-card' : ''}${widePortfolio ? ' portfolio-wide-lead' : ''}${enhanced ? ' enhanced-card' : ''}${featured ? ' featured-award' : ''}" id="${award.id}" data-accent="${award.accent}" style="--accent:${award.accent}" aria-labelledby="heading-${award.id}">
      <div class="award-heading"><div><h3 id="heading-${award.id}">${esc(award.name)}</h3>${award.description ? `<p class="award-description">${esc(award.description)}</p>` : ''}</div><span class="award-number" aria-label="Award ${award.number}">${pad(award.number)}</span></div>
      ${enhanced ? `<div class="winner-block${artist ? ' artist-winner-block' : performance ? ' performance-winner-block' : ''}">${winner}${artistContext}</div>` : winner}
      ${nominations(award.nominees, false, artist, award.id, mentionsId)}
    </article>`;
  }

  function renderChapters() {
    $('#chapter-links').innerHTML = archive.chapters.map(chapter => `<a href="#${esc(chapter.id)}" class="chapter-link" data-chapter="${esc(chapter.id)}">${esc(chapter.shortName ?? chapter.name)}</a>`).join('');
    $('#chapter-content').innerHTML = archive.chapters.map((chapter, i) => {
      const id = esc(chapter.id);
      const accent = chapterAccent(chapter.id);
      const opener = chapterPreview(chapter);
      const rhythm = Boolean(opener?.path && rhythmLeads.has(chapter.id));
      return `<section class="chapter section-shell" data-chapter-accent="${accent}" style="--accent:${accent};--chapter-accent:${accent}" id="${id}" aria-labelledby="chapter-title-${id}">
      <header class="chapter-heading${opener?.path ? ' has-opener' : ''}${rhythm ? ' ts-rhythm-lead' : ''}"><span class="chapter-number" aria-label="Chapter ${i + 1}">${pad(i + 1)}<span>.</span></span><div class="chapter-heading-title"><p class="eyebrow">${chapter.awards.length} ${chapter.awards.length === 1 ? 'award' : 'awards'}</p><h2 id="chapter-title-${id}">${esc(chapter.name)}</h2></div>${opener?.path ? `<span class="chapter-opener" aria-hidden="true"${opener.focal ? ` style="--focal-x:${esc(opener.focal)}"` : ''}>${imageMarkup(opener.path,false,rhythm ? '(max-width: 680px) 59vw, (min-width: 1447px) 810px, 58vw' : '(max-width: 360px) 1px, (max-width: 680px) 36vw, (min-width: 1447px) 560px, 39vw')}</span>` : ''}</header>
      <div class="award-grid">${chapter.awards.map(a => {
        const quote = edition.interludes?.[a.id];
        return awardCard(awardsById.get(a.id)) + (quote ? quotePanel(quote, 'interlude') : '');
      }).join('')}</div>
    </section>`;
    }).join('');
  }

  function chapterPreview(chapter) {
    const chosen = edition.chapterOpeners?.[chapter.id];
    if (chosen?.path) return chosen;
    const preferred = discovery.chapterAwards?.[chapter.id];
    const candidates = [preferred, ...chapter.awards.map(award => award.id)]
      .map(id => awardsById.get(id)).filter(award => award?.chapter.id === chapter.id);
    // A chapter is introduced by film imagery, never an artist portrait.
    return candidates.flatMap(award => award.winnerArtwork
      ? filmFrames(award.winner.films,award.stills,award.focalPoints)
      : awardFrames(award)).find(item => item.path && item.shape === 'wide');
  }

  function renderSpotlights() {
    const entry = archive.performances?.[0];
    const actor = archive.actors?.[0];
    const performance = entry && performanceCredit(entry, 'best-actor');
    $('#spotlight-content').innerHTML = `<div class="spotlight-grid">
      ${entry ? `<article class="spotlight-card" style="--accent:#b7bac7"><h3>Best Performances of the Decade</h3><p class="spotlight-method">One role per entry.</p><div class="spotlight-visual">${backdrop(entry.films, false, selectStills(entry.films, 'performances-spotlight'))}<div class="winner-copy"><span class="winner-title">${performance ? performanceNameMarkup(performance) : title(entry)}</span><span class="winner-detail">${performance ? performanceFilmLine(entry, performance) : creditMarkup(creditFor(entry, 'best-actor'), entry.detail)}</span></div></div><ol class="spotlight-list">${performance ? '' : `<li class="spotlight-winner">${filmLinks(entry.films)}</li>`}${archive.performances.slice(1).map(row => {
        const credit = performanceCredit(row, 'best-actor');
        return `<li>${poster(row.films[0], false, '48px')}<span><strong>${credit ? performanceNameMarkup(credit) : filmLinks(row.films)}</strong><small>${credit ? performanceFilmLine(row, credit) : creditMarkup(creditFor(row, 'best-actor'), row.detail)}</small></span></li>`;
      }).join('')}</ol></article>` : ''}
      ${actor ? `<article class="spotlight-card" style="--accent:#c4a385"><h3>Actor of the Decade</h3><p class="spotlight-method">Selected films across the decade.</p><div class="spotlight-visual">${backdrop(actor.films, false, selectStills(actor.films, 'actor-spotlight'), actorFocalPoints)}<div class="winner-copy"><span class="winner-title">${personLink(actor.name)}</span></div></div><ol class="spotlight-list"><li class="spotlight-winner">${filmLinks(actor.films)}</li>${archive.actors.slice(1).map(row => `<li>${poster(row.films[0], false, '48px')}<span><strong>${personLink(row.name)}</strong><small>${filmLinks(row.films)}</small></span></li>`).join('')}</ol></article>` : ''}
    </div>`;
  }

  function renderFilmWall(order = 'wins') {
    const collected = new Map();
    for (const award of awards.filter(a => !negative.has(a.id) && !a.honorsPortfolio)) {
      for (const slug of award.winner.films) {
        const filmAwards = collected.get(slug) || [];
        filmAwards.push(award.name);
        collected.set(slug, filmAwards);
      }
    }
    const ranked = [...collected.entries()].sort((a, b) => b[1].length - a[1].length);
    const wallPosterSizes = order === 'year' ? '(max-width: 560px) 28vw, 116px' : '(max-width: 680px) 28vw, (max-width: 900px) 16vw, 175px';
    const tile = ([slug, filmAwards]) => `<a class="wall-tile" data-wall-film="${esc(slug)}" href="${esc(film(slug).url)}" ${external} ${filmAttributes(slug)} title="${esc(filmAwards.join(' · '))}">${poster(slug, false, wallPosterSizes)}<span><strong>${esc(film(slug).title)}</strong><small>${filmAwards.length} ${filmAwards.length === 1 ? 'AWARD' : 'AWARDS'} <b>↗</b></small></span></a>`;
    const wall = $('#film-wall');
    wall.dataset.order = order;
    if (order === 'year') {
      const grouped = new Map();
      for (const entry of ranked) {
        const year = film(entry[0]).year;
        if (!grouped.has(year)) grouped.set(year, []);
        grouped.get(year).push(entry);
      }
      wall.innerHTML = [...grouped.entries()].sort((a, b) => a[0] - b[0]).map(([year, entries]) =>
        `<section class="wall-year" aria-labelledby="wall-year-${esc(year)}"><h3 id="wall-year-${esc(year)}">${esc(year)}</h3><div class="film-wall wall-year-films">${entries.map(tile).join('')}</div></section>`
      ).join('');
    } else {
      wall.innerHTML = ranked.map(tile).join('');
    }
    $$('[data-wall-order]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.wallOrder === order)));
  }

  function renderDecadeNumbers() {
    const panel = $('#decade-numbers');
    if (!panel) return;
    const filmWins = new Map();
    const filmAwards = awards.filter(award => !negative.has(award.id) && !portfolioPresentation(award));
    for (const award of filmAwards) {
      for (const slug of new Set(award.winner.films)) filmWins.set(slug, (filmWins.get(slug) ?? 0) + 1);
    }
    const maximum = Math.max(0, ...filmWins.values());
    const leaders = [...filmWins].filter(([,count]) => count === maximum).map(([slug]) => film(slug).title);
    const years = new Map();
    for (const info of Object.values(archive.films)) {
      const year = Number(info.year);
      if (Number.isFinite(year)) years.set(year, (years.get(year) ?? 0) + 1);
    }
    if (!years.size || !leaders.length) return;
    const peak = Math.max(...years.values());
    const peakYears = [...years].filter(([,count]) => count === peak).map(([year]) => year).sort((a,b) => a-b);
    $('#decade-numbers-content').innerHTML = `<div class="decade-metrics">
      <div class="decade-metric" data-metric="most-awarded"><span>Most awarded</span><strong>${esc(leaders.join(' / '))}</strong><small>${maximum} individual ${maximum === 1 ? 'win' : 'wins'}</small></div>
      <div class="decade-metric" data-metric="peak-year"><span>Most represented year</span><strong>${esc(peakYears.join(' / '))}</strong><small>${peak} films in the archive</small></div>
      <div class="decade-metric" data-metric="winning-films"><span>Films with individual wins</span><strong>${filmWins.size}</strong><small>${filmAwards.length} positive film categories</small></div>
      </div><div class="decade-graph"><h3>Films by release year · ${Object.keys(archive.films).length} films</h3><ol>${[...years].sort((a,b)=>a[0]-b[0]).map(([year,count]) => `<li data-year="${year}" data-count="${count}" class="${count === peak ? 'is-peak' : ''}" aria-label="${year}: ${count} films"><span>${year}</span><span class="decade-graph-bar" aria-hidden="true"><i style="--bar-width:${count/peak*100}%"></i></span><span>${count}</span></li>`).join('')}</ol></div>
      <p class="decade-note">Based on this edition’s curated ballot. Individual film wins exclude portfolio honors and negative awards. Release-year totals count distinct films across the edition, including mentions and Oscar Snubs.</p>`;
    panel.hidden = false;
  }

  function renderDoubleFeature() {
    const pair = discovery.doubleFeature;
    const section = $('#double-feature');
    if (!section || pair?.films?.length !== 2 || !pair.films.every(slug => film(slug))) return;
    section.innerHTML = `<div class="double-feature-copy"><p class="eyebrow">DOUBLE FEATURE</p><h2 id="double-feature-title">${esc(pair.title)}</h2></div>
      <div class="double-feature-films">${pair.films.map(slug => `<a href="${esc(film(slug).url)}" class="double-feature-film" ${external} ${filmAttributes(slug)}>${poster(slug, false, '116px')}<strong>${esc(film(slug).title)}</strong><small>${esc(film(slug).year)}</small></a>`).join('')}</div>`;
    section.hidden = false;
  }

  function academyComparison(item, context = '') {
    const result = item.academy;
    if (!result) return '';
    const {year, category, winner, credit, nominated} = result;
    const outcome = nominated ? 'Nominated · did not win' : 'No nomination in this category';
    const alternateCategory = keyFor(item.name) !== keyFor(category);
    const summary = alternateCategory
      ? nominated ? 'Nominated for ' + category : 'No ' + category + ' nomination'
      : nominated ? 'Nominated' : 'No nomination';
    const performance = performanceCredit(item.entry, category);
    const archiveTitle = performance ? performanceNameMarkup(performance) : title(item.entry);
    const archiveCredit = performance ? performanceFilmLine(item.entry, performance) : creditMarkup(snubCredit(item), item.entry.detail);
    const personAward = actingCredits.has(keyFor(category)) && credit;
    const source = 'https://www.oscars.org/oscars/ceremonies/' + encodeURIComponent(year);
    const inFile = context === 'film-file';
    return `<details class="academy-comparison${inFile ? ' file-snub-comparison' : ''}"><summary${inFile ? ' class="file-snub-summary"' : ''}>${inFile ? `<strong class="file-snub-name">${esc(item.name)}</strong>` : ''}<span${inFile ? ' class="file-snub-status"' : ''}><span class="academy-year">${esc(year)} Oscars</span> · ${esc(summary)}</span><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"/></svg></summary>
      <div class="academy-result">
        <p class="academy-category">${esc(year)} OSCARS · ${esc(category)}</p>
        <div class="academy-choices">
          <div><span class="academy-label">Archive pick</span><strong>${archiveTitle}</strong>${archiveCredit ? `<small>${archiveCredit}</small>` : ''}<span class="academy-outcome">${esc(outcome)}</span></div>
          <div class="academy-winner"><span class="academy-label">Oscar winner</span><strong>${esc(personAward ? credit : winner)}</strong>${credit ? `<small>${esc(personAward ? winner : credit)}</small>` : ''}</div>
        </div>
        <a class="academy-source" href="${esc(source)}" ${external}>Official Academy results</a>
      </div></details>`;
  }

  function renderSnubs() {
    if (!snubList || !archive.snubs?.length) throw new Error('That edition has no Oscar Snubs list.');
    site.setText('#snubs-description', snubList.description);
    site.setText('#snub-count', `${archive.snubs.length} selections`);
    $('#snub-entries').innerHTML = archive.snubs.map(item => {
      const {name,entry,status} = item;
      const slug = entry.films[0];
      const link = `href="${esc(film(slug).url)}" ${external} ${filmAttributes(slug)}`;
      const performance = performanceCredit(entry, name);
      const heading = performance ? performanceNameMarkup(performance) : `<a class="list-film-link" ${link}>${title(entry)}</a>`;
      const description = performance ? performanceFilmLine(entry, performance, 'list-film-link performance-film-link') : creditMarkup(snubCredit(item), entry.detail);
      const comparison = academyComparison(item);
      return `<article class="snub-card" id="${esc(snubAnchor(item))}"><a class="list-poster-link" ${link}>${poster(slug, false, '(max-width: 560px) 64px, 76px')}</a><div><p class="eyebrow">${esc(name)}</p><h3>${heading}</h3>${description ? `<p>${description}</p>` : ''}${comparison || `<small>${esc(status)}</small>`}</div></article>`;
    }).join('');
    const entry = archive.watch;
    if (entry) {
      $('#watch-entry').hidden = false;
      $('#watch-entry').innerHTML = `<article class="watch-frame"><p class="eyebrow">${esc(entry.label ?? 'Oscar Watch')}</p>${backdrop(entry.films)}<div class="winner-copy"><h2 class="winner-title">${title(entry)}</h2><p class="winner-detail">${creditMarkup(creditFor(entry, 'best-supporting-actor'), entry.detail)}</p><p class="watch-note">${esc(entry.note)}</p>${filmLinks(entry.films)}</div></article>`;
    }
    site.setupListView();
  }

  const dialogTriggers = new WeakMap();
  function openDialog(dialog, focusTo, trigger = document.activeElement) {
    if (!dialog.open) {
      dialogTriggers.set(dialog, trigger);
      dialog.showModal();
    }
    document.body.classList.add('dialog-open');
    if (focusTo) $(focusTo, dialog)?.focus({preventScroll: true});
  }

  let homeDiscoveryReturn = site.params.get('from') === 'home-discover' && film(site.params.get('film'));
  let journeyReturn = window.ArchiveJourneyEditorial && site.params.get('from') === 'journey' && film(site.params.get('film')) &&
    /^[a-z-]+$/.test(site.params.get('journey') || '') ? {id:site.params.get('journey'),shot:site.params.get('shot') || site.params.get('film')} : null;
  function returnToDiscoveryHome() {
    const home = new URL('index.html#decades', location.href);
    const directory = new URL('./', home);
    // Returning through history restores the homepage's exact scroll and
    // avoids a second homepage entry. Direct links still have a safe fallback.
    if (document.referrer && history.length > 1) {
      const previous = new URL(document.referrer);
      if (previous.origin === home.origin &&
          (previous.pathname === home.pathname || previous.pathname === directory.pathname)) {
        history.back();
        return;
      }
    }
    location.replace(home.href);
  }
  function returnToJourney(visit) {
    const target = new URL(window.ArchiveJourneyEditorial.href(visit.id,visit.shot),location.href);
    if (document.referrer && history.length > 1) {
      const previous = new URL(document.referrer);
      if (previous.origin === target.origin && previous.pathname === target.pathname && previous.searchParams.get('journey') === visit.id && previous.searchParams.get('shot') === visit.shot) {
        history.back(); return;
      }
    }
    location.replace(target.href);
  }
  function closeDialog(dialog, dismissed = false) {
    if (dialog === indexDialog && dialog.open) saveIndexPosition();
    if (dialog === filmDialog && dialog.open && (homeDiscoveryReturn || journeyReturn)) {
      const visit = journeyReturn;
      journeyReturn = null;
      homeDiscoveryReturn = false;
      if (dismissed) {
        dialog.close();
        if (visit) returnToJourney(visit); else returnToDiscoveryHome();
        return;
      }
      // An intentional jump to an award ends this discovery visit.
      const url = new URL(location.href);
      url.searchParams.delete('from');
      url.searchParams.delete('film');
      url.searchParams.delete('journey');
      url.searchParams.delete('shot');
      site.replaceLocation(url);
    }
    dialog.close();
  }

  $$('dialog').filter(dialog => !dialog.classList.contains('archive-standalone-index')).forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target === dialog || event.target.closest('.dialog-close')) closeDialog(dialog, true);
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      closeDialog(dialog, true);
    });
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      closeDialog(dialog, true);
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

  let frameCollection = [], frameIndex = 0, frameTouch = null;
  if (frameDialog) {
    const image = $('#full-frame-image', frameDialog);
    const status = $('#full-frame-status', frameDialog);
    image.addEventListener('load', () => { if (frameDialog.open) status.hidden = true; });
    image.addEventListener('error', () => {
      if (frameDialog.open && image.hasAttribute('src')) {
        status.textContent = 'This frame could not be loaded.';
        status.hidden = false;
      }
    });
    frameDialog.addEventListener('close', () => {
      if (!frameDialog.open) {
        setContactSheet(false, true);
        image.removeAttribute('src');
        image.removeAttribute('width'); image.removeAttribute('height');
        $('.ts-frame-size',frameDialog)?.remove();
        frameCollection = []; frameIndex = 0; frameTouch = null;
        $('.frame-gallery-controls', frameDialog).hidden = true;
      }
    });
    $('.frame-gallery-prev', frameDialog).addEventListener('click', () => stepFrame(-1));
    $('.frame-gallery-next', frameDialog).addEventListener('click', () => stepFrame(1));
    $('#frame-gallery-count', frameDialog).addEventListener('click', () => setContactSheet($('#frame-contact-sheet',frameDialog).hidden));
    $('.frame-contact-grid',frameDialog).addEventListener('click', event => {
      const button = event.target.closest('[data-frame-index]');
      if (!button) return;
      const index = Number(button.dataset.frameIndex);
      if (Number.isInteger(index) && frameCollection[index]) {
        frameIndex = index; displayFrame();
      }
    });
    frameDialog.addEventListener('keydown', event => {
      if (frameCollection.length < 2 || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const fromSheet = event.target.closest('.frame-contact-thumb');
      event.preventDefault(); stepFrame(event.key === 'ArrowRight' ? 1 : -1);
      if (fromSheet) $('.frame-contact-thumb[aria-pressed="true"]',frameDialog)?.focus({preventScroll:true});
    });
    const stage = $('.full-frame-stage', frameDialog);
    stage.addEventListener('touchstart', event => {
      if (event.touches.length !== 1) { frameTouch = null; return; }
      frameTouch = [event.touches[0].clientX, event.touches[0].clientY];
    }, {passive:true});
    stage.addEventListener('touchend', event => {
      if (!frameTouch || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX - frameTouch[0], dy = event.changedTouches[0].clientY - frameTouch[1];
      frameTouch = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) stepFrame(dx < 0 ? 1 : -1);
    }, {passive:true});
    stage.addEventListener('touchcancel', () => { frameTouch = null; }, {passive:true});
  }

  function frameThumbnail(path) {
    const variants = [...(media.variants?.[path] ?? [])].sort((a,b) => a.width-b.width);
    return variants.find(item => item.width >= 280)?.src ?? variants[0]?.src ?? path;
  }
  function frameRecord(slug, record) {
    return {
      src: largestFrame(record.path), path:record.path,
      thumbnail:record.thumbnail || frameThumbnail(record.path), label:film(slug).title,
      context: awardsById.get(record.award)?.name ?? record.label ?? record.context ?? 'Film still',
      source:record.source,
      credit:record.credit
    };
  }
  function filmFrameCollection(slug) {
    const frames = [], seen = new Set();
    const info = film(slug);
    if (!info) return frames;
    const curated = archive.galleries?.[slug];
    if (curated?.length) return curated.slice(0,7).map(record => frameRecord(slug,record));
    const add = (path, context, record = {}) => {
      if (!path) return;
      const src = largestFrame(path);
      if (seen.has(src)) return;
      seen.add(src);
      frames.push({src,path,thumbnail:frameThumbnail(path),label:info.title,context,source:record.source,credit:record.credit});
    };
    add(art(slug).backdrop, 'Film still', {source:art(slug).backdropSource || art(slug).source});
    for (const still of (alternates[slug] ?? [])) {
      add(still.path, awardsById.get(still.award)?.name ?? 'Film still',still);
    }
    for (const [awardId, still] of Object.entries(edition.presentationStills ?? {})) {
      if (still.film === slug) add(still.path, awardsById.get(awardId)?.name ?? 'Presentation still',still);
    }
    for (const cover of [selected, snubList, catalog.homeCover]) {
      if (cover?.coverFilm === info.title && Number(cover.coverYear) === Number(info.year)) add(cover.cover, 'Cover still',{source:cover.coverSource});
    }
    return frames.slice(0,7);
  }

  function updateContactSheet() {
    const sheet = $('#frame-contact-sheet',frameDialog);
    const counter = $('#frame-gallery-count',frameDialog);
    const expanded = !sheet.hidden;
    $('.frame-count-label',counter).textContent = (frameIndex + 1) + ' / ' + frameCollection.length;
    counter.setAttribute('aria-expanded',String(expanded));
    const action = expanded ? 'Hide contact sheet' : 'Show contact sheet';
    counter.setAttribute('aria-label',action + ', frame ' + (frameIndex+1) + ' of ' + frameCollection.length);
    counter.title = action;
    $$('.frame-contact-thumb',sheet).forEach((button,i) => button.setAttribute('aria-pressed',String(i===frameIndex)));
    if (expanded) {
      const selected = $('.frame-contact-thumb[aria-pressed="true"]',sheet);
      const grid = $('.frame-contact-grid',sheet);
      if (selected && grid.scrollWidth > grid.clientWidth) {
        const box=selected.getBoundingClientRect(), region=grid.getBoundingClientRect();
        if (box.left < region.left+4) grid.scrollLeft += box.left-region.left-4;
        else if (box.right > region.right-4) grid.scrollLeft += box.right-region.right+4;
      }
    }
  }
  function setContactSheet(open, clear = false) {
    if (!frameDialog) return;
    const sheet = $('#frame-contact-sheet',frameDialog), grid = $('.frame-contact-grid',sheet);
    if (clear) grid.replaceChildren();
    sheet.hidden = !open || frameCollection.length < 2;
    if (!sheet.hidden && !grid.children.length) {
      // Original frame proportions are retained in the thumbnail strip.
      grid.style.setProperty('--frame-count',frameCollection.length);
      grid.innerHTML = frameCollection.map((frame,i) => {
        const [width,height] = media.sizes?.[frame.path] ?? [320,180];
        return `<button type="button" class="frame-contact-thumb" data-frame-index="${i}" aria-pressed="${i===frameIndex}" aria-label="Frame ${i+1}: ${esc(frame.context || frame.label)}" title="${esc(frame.context || frame.label)}"><img src="${esc(frame.thumbnail || frame.src)}" alt="" width="${width}" height="${height}" decoding="async" loading="lazy"></button>`;
      }).join('');
    }
    updateContactSheet();
  }

  function displayFrame() {
    const image = $('#full-frame-image', frameDialog);
    const status = $('#full-frame-status', frameDialog);
    const frame = frameCollection[frameIndex];
    if (!frame) return;
    $('#full-frame-title', frameDialog).textContent = frame.label;
    const context = $('#full-frame-context', frameDialog);
    context.textContent = frame.context || '';
    context.hidden = frameCollection.length < 2 || !frame.context;
    const source = $('#full-frame-source', frameDialog);
    let sourceUrl;
    try { const url = new URL(frame.source); if (url.protocol === 'https:') sourceUrl = url; } catch {}
    source.hidden = !sourceUrl;
    if (sourceUrl) {source.href = sourceUrl.href; source.title = 'View still credit on ' + sourceUrl.hostname;}
    else source.removeAttribute('href');
    $('.frame-gallery-controls', frameDialog).hidden = frameCollection.length < 2;
    updateContactSheet();
    image.alt = frame.label;
    const size = media.sizes?.[frame.src] || media.sizes?.[frame.path];
    if (size) {
      image.width = size[0]; image.height = size[1];
    }
    let dimensions = $('.ts-frame-size',frameDialog);
    if (!dimensions) {
      dimensions=document.createElement('small'); dimensions.className='ts-frame-size';
      $('.frame-caption-meta',frameDialog).append(dimensions);
    }
    dimensions.textContent = size ? `${size[0]} × ${size[1]}` : '';
    dimensions.hidden = !size;
    status.textContent = 'Loading frame…';
    status.hidden = false;
    image.src = frame.src;
    if (image.complete && image.naturalWidth) status.hidden = true;
  }
  function stepFrame(direction) {
    if (frameCollection.length < 2) return;
    frameIndex = (frameIndex + direction + frameCollection.length) % frameCollection.length;
    displayFrame();
  }
  function openFullFrame(trigger) {
    if (!frameDialog) return;
    const src = trigger.dataset.fullFrame;
    const slug = trigger.dataset.film;
    const path = trigger.dataset.framePath || src;
    frameCollection = filmFrameCollection(slug);
    frameIndex = frameCollection.findIndex(frame => frame.src === src);
    if (frameIndex < 0) {
      // Do not lose the explicitly selected award frame, even when the
      // curated contact sheet already contains seven other photographs.
      const entry = (alternates[slug] ?? []).find(still => still.path === path);
      const presentation = Object.entries(edition.presentationStills ?? {}).find(([,still]) => still.path === path);
      const context = awardsById.get(entry?.award ?? presentation?.[0])?.name || 'Selected artwork';
      frameCollection = [{src,path,thumbnail:frameThumbnail(path),label:trigger.dataset.frameLabel,context,
        source:entry?.source || presentation?.[1]?.source}, ...frameCollection].slice(0,7);
      frameIndex = 0;
    }
    setContactSheet(frameCollection.length > 1,true);
    openDialog(frameDialog, '.dialog-close', trigger);
    displayFrame();
    if (trigger.dataset.openContactSheet === 'true') setContactSheet(true);
  }

  // Dossiers work from an edition or its alternate ballot, without leaving the archive.
  document.addEventListener('click', event => {
    const enlargement = event.target.closest('button[data-full-frame]');
    if (enlargement) {
      openFullFrame(enlargement);
      return;
    }
    const artist = event.target.closest('button[data-person]');
    if (artist) {
      openPersonFile(artist.dataset.person, artist);
      return;
    }
    const normalClick = event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
    const frameAward = event.target.closest('a[data-frame-award]');
    if (!onSnubs && frameAward && normalClick) {
      event.preventDefault();
      const award = awardsById.get(frameAward.dataset.frameAward);
      if (award) {
        if (personDialog?.open) closeDialog(personDialog);
        if (filmDialog.open) closeDialog(filmDialog);
        if (indexDialog.open) closeDialog(indexDialog);
        openAward(award.number - 1, document.getElementById(award.id)?.querySelector('.winner-frame'));
      }
      return;
    }
    const anchorLink = event.target.closest('a[data-archive-anchor]');
    if (anchorLink && normalClick) {
      const target = document.getElementById(anchorLink.dataset.archiveAnchor);
      if (target) {
        event.preventDefault();
        for (const dialog of [personDialog, filmDialog, awardDialog, indexDialog]) if (dialog?.open) closeDialog(dialog);
        const url = new URL(location.href);
        url.searchParams.delete('award');
        url.hash = target.id;
        site.replaceLocation(url);
        requestAnimationFrame(() => target.scrollIntoView({block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth'}));
        return;
      }
    }
    const movie = event.target.closest('a[data-film-file]');
    if (filmDialog && movie && normalClick) {
      event.preventDefault();
      const trigger = personDialog?.open ? dialogTriggers.get(personDialog) ?? movie : movie;
      if (personDialog?.open) closeDialog(personDialog);
      openFilmFile(movie.dataset.filmFile, trigger);
      return;
    }
    const jump = event.target.closest('button[data-jump-award]');
    if (jump) jumpToAward(jump.dataset.jumpAward);
  });

  if ($('#snub-entries')) renderSnubs();
  explore.setPageActions({editionId, awards:!onSnubs, openFilm:openFilmFile});

  if ($('#credit-links')) {
    $('#credit-links').innerHTML = `<p>${selected.coverSource ? `<a href="${esc(selected.coverSource)}" ${external}>${esc(selected.coverFilm)} cover image ↗</a><br>` : ''}<a href="${esc(profile.url)}" ${external}>${esc(profile.name)} · Letterboxd profile artwork ↗</a></p><details class="image-sources"><summary>Film artwork sources</summary><ul>${Object.entries(archive.films).map(([slug, info]) => `<li><a href="${esc(art(slug).source || info.url)}" ${external}>${esc(info.title)} ↗</a>${art(slug).posterSource ? ` · <a href="${esc(art(slug).posterSource)}" ${external}>Poster source</a>` : ''}${art(slug).backdropSource ? ` · <a href="${esc(art(slug).backdropSource)}" ${external}>Film still</a>` : ''}</li>`).join('')}</ul></details>`;
    const sources = Object.entries(archive.films).flatMap(([slug]) => {
      const stills = [...(alternates[slug] ?? []),...(archive.galleries?.[slug] ?? [])];
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
  let connectionArchive;
  // Film dossiers are shared by the awards and Oscar Snubs pages. Install
  // their disclosure and backdrop behavior before the awards-only setup.
  filmDialog?.addEventListener('toggle', event => {
    const details = event.target;
    if (details.matches?.('.file-dossier-group[open]')) {
      for (const other of details.parentElement.querySelectorAll(':scope > .file-dossier-group[open]')) {
        if (other !== details) other.open = false;
      }
      if (details.dataset.fileGroup === 'connections') fillFilmConnections(details);
    }
  }, true);
  if (filmDialog) {
    $('#film-file-content', filmDialog).addEventListener('scroll', syncFilmFileBackdrop, {passive:true});
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(syncFilmFileBackdrop).observe($('.film-file-header',filmDialog));
  }
  if (onSnubs && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  if (!$('#chapter-content')) return;
  if (edition.opening) $('#opening-line').innerHTML = quotePanel(edition.opening, 'opening');
  if (edition.closing) $('#closing-line').innerHTML = quotePanel(edition.closing, 'closing');
  site.setText('.hero-edition-period', selected.id === '2010-2019' ? '2010s' : selected.period);
  $('#hero-title')?.setAttribute('aria-label', selected.title);
  site.setText('#award-count', awards.length);
  site.setText('#chapter-count', archive.chapters.length);
  renderChapters();
  if (hasSpotlights) renderSpotlights();
  renderFilmWall();
  renderDecadeNumbers();
  $('.wall-order')?.addEventListener('click', event => {
    const button = event.target.closest('button[data-wall-order]');
    if (button) renderFilmWall(button.dataset.wallOrder);
  });
  renderDoubleFeature();
  if (snubList && spotlightSnub()) {
    const item = spotlightSnub();
    const slug = item.entry.films[0];
    const path = art(slug).backdrop;
    if (path) {
      const listLink = site.listHref(snubList);
      const link = listLink + '#' + spotlightAnchor;
      $('.snubs-banner').outerHTML = `<section class="snub-spotlight section-shell" aria-labelledby="snub-spotlight-title">
        <div class="snub-spotlight-feature"><a class="snub-spotlight-image" href="${esc(link)}" aria-label="Read the ${esc(film(slug).title)} selection">${imageMarkup(path, false, '(min-width: 850px) 56vw, 90vw')}</a>
        <div class="snub-spotlight-copy"><p class="eyebrow">OSCAR SNUBS · ${esc(item.name)}</p><h2 id="snub-spotlight-title">${esc(film(slug).title)}</h2><p class="snub-spotlight-person">${creditMarkup(snubCredit(item), item.entry.detail)}</p>${academyComparison(item) || `<p class="snub-spotlight-status">${esc(item.status)}</p>`}<a href="${esc(listLink + '#snub-entries')}" class="snub-spotlight-link">View all ${archive.snubs.length} Oscar Snubs</a></div></div>
      </section>`;
    }
  }

  const dialogContent = $('#dialog-content');
  const dialogScroll = $('.ceremony-scroll', awardDialog);
  const dialogTitle = $('#dialog-category');
  const ceremonyHeader = $('.ceremony-header', awardDialog);
  function syncCeremonyBackdrop() {
    const height = Math.ceil(ceremonyHeader.getBoundingClientRect().height);
    if (height > 0 && awardDialog.style.getPropertyValue('--ceremony-header-height') !== height + 'px') {
      awardDialog.style.setProperty('--ceremony-header-height', height + 'px');
    }
    awardDialog.classList.toggle('ceremony-scrolled', dialogScroll.scrollTop > 12);
  }
  dialogScroll.addEventListener('scroll', syncCeremonyBackdrop, {passive:true});
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(syncCeremonyBackdrop).observe(ceremonyHeader);
  const nextButton = $('.ceremony-next', awardDialog);
  const indexResults = $('#index-results');
  let current = 0;
  let startTouch = null;
  let suppressSwipeClickUntil = 0;
  let sceneChange = null;
  let indexScrollTop = 0;
  let indexReturnAward = null;
  let copyNoticeTimer;
  const shareGroup = $('.award-share', awardDialog);
  const shareStatus = $('.award-share-status', shareGroup);
  const copyButton = $('[data-copy-award]', awardDialog);
  const saveCard = $('[data-save-award-card]', awardDialog);
  const indexController = explore.createIndex({
    dialog:indexDialog, catalog, engine:exploreEngine, localEdition:editionId, chapterIndex,
    onRefresh() { indexReturnAward = null; indexScrollTop = 0; },
  });
  const globalSearchButton = explore.searchButton();
  explore.bindSearchShortcut(globalSearchButton, trigger => {
    indexController.global(); openIndex(trigger); $('#category-search', indexDialog).focus({preventScroll:true});
  });

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

  // Prefer the frame chosen for this award and film rather than a random
  // gallery still. Where no dedicated frame exists, use the winner card's
  // existing film artwork, keeping the film and award attribution intact.
  function dossierAwardFrame(slug, award, allowFallback = false) {
    const dedicated = (alternates[slug] ?? []).find(still => still.award === award.id && still.path)
      ?? (archive.galleries?.[slug] ?? []).find(still => still.award === award.id && still.path);
    if (dedicated) return dedicated;
    const presentation = edition.presentationStills?.[award.id];
    if (presentation?.film === slug && presentation.path) return presentation;
    return allowFallback && art(slug).backdrop ? {path: art(slug).backdrop} : null;
  }

  function dossierEntries(slug) {
    const wins = [], mentions = [], portfolios = [], selected = [];
    for (const award of awards) {
      const winner = award.winner.films.includes(slug);
      const nominated = award.nominees.filter(entry => entry.films.includes(slug));
      if (award.honorsPortfolio) {
        if (winner) portfolios.push({award,detail: `Winning body of work · ${artistName(award.winner)}`,frame: dossierAwardFrame(slug,award)});
        nominated.forEach(entry => portfolios.push({award,detail: `Honorable mention · ${artistName(entry)}`}));
      } else {
        if (winner) {
          const editorial = negative.has(award.id);
          (editorial ? selected : wins).push({award,detail: award.winner.detail,frame: dossierAwardFrame(slug,award,!editorial)});
        }
        nominated.forEach(entry => mentions.push({award,detail: entry.detail}));
      }
    }
    return {wins,mentions,portfolios,selected};
  }

  function dossierDisclosure(key, label, count, body, open = false, classes = '') {
    const tally = count == null ? '' : `<span class="file-group-count">${pad(count)}</span>`;
    return `<details class="file-dossier-group ${classes}" name="film-dossier-sections" data-file-group="${esc(key)}"${open ? ' open' : ''}><summary class="file-group-summary"><span class="file-group-heading"><span class="file-group-label">${esc(label)}</span>${tally}</span><svg width="14" height="14" viewBox="0 0 12 12" aria-hidden="true"><path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4"/></svg></summary><div class="file-dossier-content">${body}</div></details>`;
  }

  function dossierFrameMarkup(frame, sizes) {
    if (!frame?.path) return '';
    const focal = frame.focal ? ` style="--file-focal:${esc(frame.focal)}"` : '';
    return `<span class="file-award-image"${focal}>${imageMarkup(frame.path,false,sizes)}</span>`;
  }

  function dossierSection(key, label, rows) {
    if (!rows.length) return '';
    const rowsMarkup = `<ul>${rows.map(({award,detail,frame}) => `<li><button type="button" class="film-award-row${frame ? ' has-file-frame' : ''}" data-jump-award="${esc(award.id)}">${dossierFrameMarkup(frame,'112px')}<span class="file-award-copy"><strong>${esc(award.name)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</span></button></li>`).join('')}</ul>`;
    return dossierDisclosure(key,label,rows.length,rowsMarkup,false,'film-file-section file-award-group');
  }

  function wonAwardsSection(rows) {
    if (!rows.length) return '';
    const grid = rows.length > 1 && rows.every(row => row.frame?.path);
    const sizes = grid ? '(max-width: 680px) 44vw, (min-width: 1971px) 320px, 260px' : '160px';
    const items = `<ul class="file-won-list" data-layout="${grid ? 'grid' : 'rows'}">${rows.map(({award,detail,frame}) => `<li><a class="file-won-award${frame?.path ? ' has-file-frame' : ''}" href="${esc(directAwardHref(award.id))}" data-frame-award="${esc(award.id)}">${dossierFrameMarkup(frame,sizes)}<span class="file-won-copy"><strong>${esc(award.name)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</span></a></li>`).join('')}</ul>`;
    return dossierDisclosure('awards','Awards won',rows.length,items,false,'file-won-awards');
  }

  function dossierFrames(slug, gallery) {
    if (!gallery.length || !frameDialog) return '';
    const sizes = '(max-width: 680px) 44vw, (min-width: 1971px) 336px, 240px';
    const icon='<span class="ts-frame-zoom" aria-hidden="true"><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8V3h5m4 0h5v5m0 4v5h-5m-4 0H3v-5"/></svg></span>';
    const thumbnails = gallery.map((frame, index) => `<li><button type="button" class="file-frame-thumbnail frame-enlarge" data-full-frame="${esc(frame.src)}" data-frame-path="${esc(frame.path)}" data-frame-label="${esc(frame.label)}" data-film="${esc(slug)}" aria-label="View frame ${index+1}: ${esc(frame.context || frame.label)}" title="${esc(frame.context || frame.label)}" aria-haspopup="dialog">${imageMarkup(frame.path,false,sizes)}${icon}</button></li>`).join('');
    return dossierDisclosure('frames','Selected frames',gallery.length,`<ul class="file-frames-grid ts-contact-sheet">${thumbnails}</ul>`,false,'film-file-section file-frames');
  }

  function dossierActions(slug, info, still) {
    const letterboxd = `<a class="file-action file-letterboxd file-letterboxd-icon" href="${esc(info.url)}" ${external} aria-label="View ${esc(info.title)} on Letterboxd" title="View on Letterboxd"><svg viewBox="0 0 26 12" width="25" height="12" aria-hidden="true"><circle cx="5" cy="6" r="4.8" fill="#dc985e"/><circle cx="13" cy="6" r="4.8" fill="#60bd88"/><circle cx="21" cy="6" r="4.8" fill="#6cb5d0"/><path fill="#e5e2d8" d="M9 3.35a4.8 4.8 0 0 1 0 5.3 4.8 4.8 0 0 1 0-5.3Zm8 0a4.8 4.8 0 0 1 0 5.3 4.8 4.8 0 0 1 0-5.3Z"/></svg></a>`;
    const enlarge = still && frameDialog ? frameButton(still,info.title,'file-action file-cover-expand','',` data-film="${esc(slug)}"`) : '';
    return `<div class="file-meta-actions">${letterboxd}${enlarge}</div>`;
  }

  async function fillFilmConnections(details) {
    if (details.dataset.connectionLoaded === 'true' || details.dataset.connectionLoading === 'true') return;
    const library = window.ArchiveScreeningData;
    if (!library) return;
    const slug = filmDialog.dataset.film;
    const content = $('.file-dossier-content',details);
    details.dataset.connectionLoading = 'true';
    content.innerHTML = '<p class="file-connection-status" role="status">Finding related films…</p>';
    try {
      connectionArchive ??= exploreEngine.load('all').then(models=>library.makeArchive(models)).catch(error=>{connectionArchive=null;throw error;});
      const connected = await connectionArchive;
      if (!details.isConnected || filmDialog.dataset.film !== slug) return;
      const results = library.connectionFilms(connected,`${editionId}/${slug}`,3);
      content.innerHTML = results.length ? `<ul class="file-connection-list">${results.map(({film:related,reason}) => {
        const local = related.editionId === editionId;
        return `<li><a class="file-connection-link" href="${esc(related.href)}"${local ? ` data-film-file="${esc(related.slug)}" aria-haspopup="dialog"` : ''}>${related.poster ? `<img src="${esc(related.poster)}" alt="" width="84" height="126" loading="lazy" decoding="async">` : ''}<div><strong>${esc(related.title)}</strong><small>${esc(related.year)}</small><small class="connection-reason">${esc(reason)}</small></div></a></li>`;
      }).join('')}</ul>` : '<p class="file-connection-status">No related selections yet.</p>';
      const journeys=window.ArchiveJourneyEditorial?.related(connected,`${editionId}/${slug}`)||[];
      if(journeys.length) content.insertAdjacentHTML('beforeend',`<div class="ts-file-journeys"><span>Part of a film journey</span>${journeys.map(journey=>`<a href="${esc(window.ArchiveJourneyEditorial.href(journey.id,slug))}">${esc(journey.title)}</a>`).join('')}</div>`);
      details.dataset.connectionLoaded = 'true';
    } catch {
      if (details.isConnected) content.innerHTML = '<p class="file-connection-status">Related films could not be loaded. Close and reopen this section to try again.</p>';
    } finally { delete details.dataset.connectionLoading; }
  }

  // The cover, poster and heading scroll together. Keep just the small
  // navigation row available, adding the film name once it scrolls away.
  function syncFilmFileBackdrop() {
    if (!filmDialog?.open) return;
    const scroller = $('#film-file-content', filmDialog);
    const header = $('.film-file-header', filmDialog);
    const heading = $('#film-file-title', filmDialog);
    const bounds = header.getBoundingClientRect();
    const height = Math.ceil(bounds.height);
    if (height && filmDialog.style.getPropertyValue('--file-header-height') !== height + 'px') {
      filmDialog.style.setProperty('--file-header-height', height + 'px');
    }
    const scrolled = scroller.scrollTop > 12;
    filmDialog.classList.toggle('file-scrolled', scrolled);
    filmDialog.classList.toggle('file-title-scrolled', Boolean(scrolled && heading && heading.getBoundingClientRect().bottom <= bounds.bottom + 6));
  }
  function creditedPeople(slug) {
    const ids = peopleByFilm.get(slug);
    if (!ids?.size || !personDialog) return '';
    return `<section class="film-file-section file-people"><h3>Credits</h3><div class="file-people-list">${[...ids].map(id => personLink(people.get(id).name)).join('')}</div></section>`;
  }

  function personAppearanceLink(appearance) {
    const label = esc(appearance.category);
    if (appearance.awardId) {
      return `<a href="${esc(directAwardHref(appearance.awardId))}" data-frame-award="${esc(appearance.awardId)}">${label}</a>`;
    }
    const anchor = appearance.snub ? snubAnchor(appearance.snub) : appearance.watch ? 'watch-entry' : appearance.section;
    const target = (appearance.snub || appearance.watch) && snubList ? site.listHref(snubList) : site.editionHref(editionId);
    return `<a href="${esc(target + '#' + anchor)}" data-archive-anchor="${esc(anchor)}">${label}</a>`;
  }

  function openPersonFile(id, trigger) {
    const person = people.get(id);
    if (!personDialog || !person) return;
    const grouped = new Map();
    for (const appearance of person.appearances) {
      for (const slug of appearance.films) {
        if (!grouped.has(slug)) grouped.set(slug, []);
        grouped.get(slug).push(appearance);
      }
    }
    $('#person-title').textContent = person.name;
    $('#person-content').innerHTML = `<p class="person-overview">${esc(selected.period)} <span>·</span> ${grouped.size} ${grouped.size === 1 ? 'film' : 'films'}</p>
      <div class="person-films">${[...grouped.entries()].map(([slug, appearances]) => {
        const info = film(slug);
        const link = `href="${esc(info.url)}" ${external} ${filmAttributes(slug)}`;
        return `<article class="person-film"><a class="person-film-poster" ${link}>${poster(slug, false, '66px')}</a><div class="person-film-content"><h3><a class="person-film-title" ${link}>${esc(info.title)}</a> <small>${esc(info.year)}</small></h3>
          <ul class="person-appearances">${appearances.map(appearance => `<li>${personAppearanceLink(appearance)}<small>${esc(appearance.status)}</small></li>`).join('')}</ul></div></article>`;
      }).join('')}</div>`;
    $('#person-content').scrollTop = 0;
    openDialog(personDialog, '#person-title', trigger);
  }

  function openFilmFile(slug, trigger) {
    if (!filmDialog || !film(slug)) return;
    const info = film(slug);
    const {wins,mentions,portfolios,selected} = dossierEntries(slug);
    const director = directorFor(slug);
    const movieArt = art(slug);
    const gallery = filmFrameCollection(slug);
    const dossierStill = gallery[0]?.path || movieArt.backdrop || alternates[slug]?.find(still => still.path)?.path;
    const listening = awards.flatMap(award => (award.listen ?? []).filter(item => item.film === slug));
    const snubs = (archive.snubs ?? []).filter(item => item.entry.films.includes(slug));
    const winText = `${wins.length} ${wins.length === 1 ? 'award won' : 'awards won'}`;
    const artists = creditedPeople(slug);
    const music = listening.length ? `<section class="film-file-section file-music"><h3>Film music</h3><ul>${listening.map(item => `<li><a href="${esc(item.url)}" class="music-link file-music-link" ${external}>${esc(item.title)}</a></li>`).join('')}</ul></section>` : '';
    // Every film starts with the same quiet, collapsed dossier. Won awards
    // retain their dedicated frames, independently of the film's still gallery.
    const mentionsGroup = dossierSection('mentions','Honorable mentions',mentions);
    const groups = [dossierSection('portfolio','Body of work',portfolios), dossierSection('editorial','Editorial selections',selected)].filter(Boolean);
    const snubRows = `<ul>${snubs.map(item => `<li>${academyComparison(item,'film-file') || `<div class="file-snub-summary"><strong class="file-snub-name">${esc(item.name)}</strong><span class="file-snub-status">${esc(item.status)}</span></div>`}</li>`).join('')}</ul>${snubList ? `<a class="file-letterboxd file-ballot-link" href="${esc(site.listHref(snubList))}">Alternate ballot</a>` : ''}`;
    const snubSection = snubs.length ? dossierDisclosure('snubs','Oscar Snubs',snubs.length,snubRows,false,'film-file-section file-snubs') : '';
    const bothCredits = Boolean(artists && music);
    const creditLabel = artists ? 'Cast & crew' : 'Film music';
    const creditCount = artists ? peopleByFilm.get(slug)?.size : listening.length;
    const creditSection = artists || music ? dossierDisclosure('credits',creditLabel,creditCount,`<div class="file-credit-content" data-credit-sections="${bothCredits ? 2 : 1}">${artists}${music}</div>`,false,'file-credits') : '';
    const connectionSection = window.ArchiveScreeningData ? dossierDisclosure('connections','Cinematic connections',null,'<p class="file-connection-status">Related films from the archive.</p>',false,'file-connections') : '';
    filmDialog.dataset.film = slug;
    filmDialog.classList.toggle('file-has-backdrop',Boolean(dossierStill));
    filmDialog.classList.remove('file-scrolled','file-title-scrolled');
    $('.file-header-name',filmDialog).textContent = info.title;
    $('#film-file-content').innerHTML = `
      ${dossierStill ? frameDialog
        ? frameButton(dossierStill, info.title, 'film-file-frame', imageMarkup(dossierStill, true, '(min-width: 1971px) 1080px, (min-width: 1440px) 55vw, (min-width: 920px) 790px, 96vw'), ` data-film="${esc(slug)}" tabindex="-1"`)
        : `<div class="film-file-frame">${imageMarkup(dossierStill, true, '(min-width: 1971px) 1080px, (min-width: 1440px) 55vw, (min-width: 920px) 790px, 96vw')}</div>` : ''}
      <div class="film-file-meta"><div class="file-poster">${poster(slug,true,'(max-width: 680px) 54px, 68px')}</div><div class="file-meta-copy"><h2 id="film-file-title" tabindex="-1">${esc(info.title)}</h2><p class="file-year">${esc(info.year)}${director ? ` · ${personLink(director)}` : ''}</p><div class="file-meta-bottom"><p class="file-tally"><span class="file-tally-wide">${esc(winText)} <span class="file-mention-count">· ${mentions.length} ${mentions.length === 1 ? 'honorable mention' : 'honorable mentions'}</span></span><span class="file-tally-narrow">${wins.length} ${wins.length === 1 ? 'win' : 'wins'} <span class="file-mention-count">· ${mentions.length} ${mentions.length === 1 ? 'mention' : 'mentions'}</span></span></p>${dossierActions(slug,info,dossierStill)}</div></div></div>
      <div class="film-file-sections file-dossier-accordion">
      ${wonAwardsSection(wins)}
      ${mentionsGroup}${dossierFrames(slug,gallery)}${groups.join('')}
      ${snubSection}${creditSection}${connectionSection}
      ${!wins.length && !mentionsGroup && !groups.length && !snubs.length ? '<p class="empty-index">No selections in this edition.</p>' : ''}</div>`;
    $('#film-file-content').scrollTop = 0;
    openDialog(filmDialog, '#film-file-title', trigger);
    syncFilmFileBackdrop();
  }

  function jumpToAward(id) {
    const target = document.getElementById(id);
    if (!target) {
      if (onSnubs && awardsById.has(id)) location.href = site.editionHref(editionId) + '#' + encodeURIComponent(id);
      return;
    }
    for (const dialog of [personDialog, filmDialog, awardDialog, indexDialog]) if (dialog?.open) closeDialog(dialog);
    const url = new URL(location.href);
    url.searchParams.delete('award');
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
    const credit = creditFor(award.winner, award.id);
    const performance = enhanced && !artist && performanceCredit(award.winner, award.id);
    const winnerDetail = artist || (award.honorsPortfolio && award.winner.creditFirst) ? '' : award.winner.detail;
    dialogContent.style.setProperty('--accent', award.accent);
    $('#dialog-chapter').textContent = award.chapter.name;
    dialogTitle.textContent = award.name;
    copyButton.dataset.copyAward = award.id;
    saveCard.href = 'assets/share-cards/' + encodeURIComponent(editionId) + '/' + encodeURIComponent(award.id) + '.jpg';
    saveCard.download = 'TS-Archive-' + editionId + '-' + award.id + '.jpg';
    clearTimeout(copyNoticeTimer);
    shareStatus.replaceChildren();
    copyButton.classList.remove('is-copied');
    $('.ceremony-progress', awardDialog).style.setProperty('--progress', `${percent}%`);
    const previousButton = $('.ceremony-prev', awardDialog);
    previousButton.disabled = index === 0;
    previousButton.title = index > 0 ? `Previous award: ${awards[index-1].name}` : 'Previous award';
    nextButton.innerHTML = next
      ? '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>'
      : '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
    nextButton.setAttribute('aria-label', next ? `Next award: ${next.name}` : 'Finish awards presentation');
    nextButton.title = next ? `Next award: ${next.name}` : 'Finish awards presentation';
    const frames = renderFrames(awardFrames(award, 'dialog'), true, 'dialog');
    const frameClass = `ceremony-frame${artist ? ' portfolio-frame' : ''}${award.winnerArtwork ? ' portrait-frame' : ''}`;
    const winnerTitle = artist ? creditMarkup(credit, artistName(award.winner)) : performance ? performanceNameMarkup(performance) : title(award.winner);
    const detailMarkup = performance
      ? `<span class="winner-detail">${performanceFilmLine(award.winner, performance, 'ceremony-title-link performance-film-link')}</span>`
      : winnerDetail ? `<span class="winner-detail">${creditMarkup(credit, winnerDetail)}</span>` : '';
    const singleFilm = !artist && award.winner.films.length === 1 ? award.winner.films[0] : null;
    const linkedTitle = singleFilm && !performance
      ? `<a class="ceremony-title-link" href="${esc(film(singleFilm).url)}" ${external} ${filmAttributes(singleFilm)} title="Open film file">${winnerTitle}</a>`
      : winnerTitle;
    const compactFrame = `<div class="${frameClass}">${frames}</div>`;
    const compactMeta = `<div class="ceremony-winner-meta"><div><strong class="winner-title">${linkedTitle}</strong>${detailMarkup}</div>${singleFilm && !performance ? `<span class="ceremony-year">${esc(film(singleFilm).year)}</span>` : ''}</div>`;
    const winnerMarkup = enhanced
      ? compactFrame + compactMeta + (!artist && !singleFilm && !performance ? `<div class="ceremony-links">${filmLinks(award.winner.films)}</div>` : '')
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
    dialogScroll.innerHTML = `<div class="ceremony-body${artist ? ' portfolio-presentation' : ''} ${direction < 0 ? 'slide-back' : 'slide-in'}" data-award-id="${esc(award.id)}">
      ${lead}
      ${nominations(award.nominees, true, artist, award.id)}
      ${catalog.editions.length > 1 ? '<div class="award-comparison-slot"></div>' : ''}
    </div>`;
    explore.renderComparison($('.award-comparison-slot', dialogScroll), exploreEngine, award, editionId, catalog);
    dialogScroll.scrollTop = 0;
    syncCeremonyBackdrop();
    if (awardDialog.open) dialogTitle.focus({preventScroll: true});
    prepareAward(index + 1);
    prepareAward(index - 1);
  }

  function cancelSceneChange() {
    sceneChange?.cancel();
    sceneChange = null;
  }

  function openAward(index, trigger, fromIndex = false) {
    indexReturnAward = fromIndex ? index : null;
    cancelSceneChange();
    renderAward(index);
    if (!awardDialog.open) openDialog(awardDialog, '#dialog-category', trigger);
    syncCeremonyBackdrop();
  }

  function prepareOfflineShare(awardId) {
    const key = editionId + '/' + awardId;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'content/local-share-cards/' + encodeURIComponent(editionId) + '/' + encodeURIComponent(awardId) + '.js';
      script.onload = () => {
        const payloads = window.__tsArchiveSharePayloads;
        const data = payloads?.[key];
        if (payloads) delete payloads[key];
        script.remove();
        if (data) resolve(data); else reject(new Error('Local card not found'));
      };
      script.onerror = () => { script.remove(); reject(new Error('Local card not found')); };
      document.head.append(script);
    });
  }
  saveCard.addEventListener('click', async event => {
    if (location.protocol !== 'file:') return;
    event.preventDefault();
    const awardId = copyButton.dataset.copyAward;
    const filename = saveCard.download;
    const fileHref = saveCard.href;
    const status = shareStatus;
    clearTimeout(copyNoticeTimer);
    status.textContent = 'Preparing card…';
    try {
      const data = await prepareOfflineShare(awardId);
      const link = document.createElement('a');
      link.href = data; link.download = filename;
      awardDialog.append(link); link.click(); link.remove();
      if (copyButton.dataset.copyAward === awardId) {
        status.textContent = 'Download started';
        copyNoticeTimer = setTimeout(() => status.replaceChildren(), 2000);
      }
    } catch {
      if (copyButton.dataset.copyAward !== awardId) return;
      const link = document.createElement('a');
      link.href = fileHref; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Open JPG';
      status.replaceChildren(link);
    }
  });

  async function copyAwardLink(button) {
    const awardId = button.dataset.copyAward;
    const value = directAwardHref(awardId);
    const status = shareStatus;
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
      {opacity: 1},
      {opacity: .72}
    ], {duration: 100, easing: 'ease-in', fill: 'forwards'});
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
    suppressSwipeClickUntil = 0;
  });

  function chapterIndex() {
    const tiles = archive.chapters.map(chapter => {
      const frame = chapterPreview(chapter);
      return `<button type="button" class="index-chapter" data-index-chapter="${esc(chapter.id)}" style="--chapter-accent:${chapterAccent(chapter.id)}">
        ${frame ? `<span class="index-chapter-art"${frame.focal ? ` style="--focal-x:${esc(frame.focal)}"` : ''}>${imageMarkup(frame.path, false, '(min-width: 2447px) 328px, (min-width: 1450px) 14vw, (min-width: 681px) 192px, 44vw')}</span>` : ''}
        <span class="index-chapter-label"><strong>${esc(chapter.name)}</strong><small>${chapter.awards.length} ${chapter.awards.length === 1 ? 'award' : 'awards'}</small></span>
      </button>`;
    }).join('');
    return `<div class="index-discovery"><div class="index-chapters-heading"><span>Chapters</span><button type="button" data-index-chapter="all-awards">All awards</button></div><div class="index-chapter-grid">${tiles}</div></div>`;
  }

  function saveIndexPosition() {
    indexScrollTop = indexResults.scrollTop;
  }

  function openIndex(trigger, returnToAward = false) {
    indexController.ensure();
    openDialog(indexDialog, '#index-title', trigger);
    indexResults.scrollTop = indexScrollTop;
    if (returnToAward && indexReturnAward !== null) {
      indexResults.querySelector(`[data-award="${indexReturnAward}"]`)?.focus({preventScroll:true});
      indexResults.scrollTop = indexScrollTop;
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.matches('[data-copy-award]')) { copyAwardLink(button); return; }
    if (button.matches('[data-mentions-toggle]')) {
      const card = button.closest('.award-card');
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(expanded));
      card.dataset.mentionsOpen = String(expanded);
      return;
    }
    if (button.matches('[data-view-toggle]')) { setAwardView(button.dataset.nextView, true); return; }
    if (button.matches('[data-view]')) { setAwardView(button.dataset.view); return; }
    if (button.matches('[data-jump-award]')) return;
    if (button.matches('.start-ceremony')) openAward(0, button);
    if (button.matches('.index-open, .edition-index-open')) openIndex(button);
    if (button.matches('[data-award]')) {
      const fromIndex = indexDialog.open && Boolean(button.closest('#index-results'));
      const trigger = fromIndex ? dialogTriggers.get(indexDialog) : button;
      if (fromIndex) closeDialog(indexDialog);
      openAward(Number(button.dataset.award), trigger, fromIndex);
    }
    if (button.matches('.ceremony-prev')) advance(-1);
    if (button.matches('.ceremony-next')) advance(1);
    if (button.matches('.ceremony-index')) {
      const trigger = dialogTriggers.get(awardDialog);
      closeDialog(awardDialog);
      openIndex(trigger, true);
    }
  });

  awardDialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target.matches('input,textarea,select')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      advance(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  // The whole award body responds to deliberate horizontal swipes, while
  // ordinary vertical scrolling, poster taps and pinch zoom remain native.
  function hasHorizontalScroller(target) {
    for (let node = target; node instanceof HTMLElement && node !== dialogScroll; node = node.parentElement) {
      if (node.scrollWidth > node.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(node).overflowX)) return true;
    }
    return false;
  }
  dialogScroll.addEventListener('touchstart', event => {
    startTouch = null;
    if (event.touches.length !== 1 || event.target.closest('input,textarea,select') || hasHorizontalScroller(event.target)) return;
    const touch = event.touches[0];
    startTouch = {id:touch.identifier,x:touch.clientX,y:touch.clientY, axis:null};
  },{passive:true});
  dialogScroll.addEventListener('touchmove', event => {
    if (!startTouch) return;
    if (event.touches.length !== 1) { startTouch = null; return; }
    const touch = event.touches[0];
    if (touch.identifier !== startTouch.id) {startTouch=null;return;}
    const dx = Math.abs(touch.clientX - startTouch.x), dy = Math.abs(touch.clientY - startTouch.y);
    if (!startTouch.axis && Math.max(dx,dy) > 12) {
      if (dy >= dx) {startTouch = null; return;}
      if (dx > dy * 1.25) startTouch.axis = 'horizontal';
    }
    if (startTouch?.axis === 'horizontal' && event.cancelable) event.preventDefault();
  },{passive:false});
  dialogScroll.addEventListener('touchend', event => {
    const start = startTouch;
    startTouch = null;
    if (!start || event.touches.length) return;
    const touch = [...event.changedTouches].find(item => item.identifier === start.id);
    if (!touch) return;
    const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy)*1.4) return;
    if (event.cancelable) event.preventDefault();
    suppressSwipeClickUntil = performance.now() + 300;
    const direction = dx < 0 ? 1 : -1;
    if (current + direction >= 0 && current + direction < awards.length) advance(direction);
  },{passive:false});
  dialogScroll.addEventListener('touchcancel', () => { startTouch = null; }, {passive:true});
  awardDialog.addEventListener('click', event => {
    if (performance.now() < suppressSwipeClickUntil && event.target.closest('.ceremony-scroll') && (event.sourceCapabilities?.firesTouchEvents || event.detail > 0)) {
      event.preventDefault(); event.stopImmediatePropagation(); suppressSwipeClickUntil = 0;
    }
  }, {capture:true});

  const chapters = $$('.chapter');
  const cards = $$('.award-card');
  if (window.IntersectionObserver && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        entry.target.classList.add(entry.target.matches('.award-card') ? 'in-frame' : 'is-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold:.18});
    const reveals = $$('.chapter-heading.ts-rhythm-lead');
    const enteredCards = cards.filter(card=>rhythmAwards.has(card.id));
    reveals.forEach(section => section.classList.add('motion-reveal'));
    [...enteredCards, ...reveals].forEach(section => observer.observe(section));
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
    const active = chapters.findLast(chapter => chapter.getBoundingClientRect().top < 180);
    const withinAwards = $('#final-cut').getBoundingClientRect().top >= 180;
    const nextAccent = withinAwards && active ? chapterAccent(active.id) : defaultAccent;
    if (currentAccent !== nextAccent) {
      document.body.style.setProperty('--current-accent', nextAccent);
      currentAccent = nextAccent;
    }
    // Match the persistent anchor top margin in both navigation modes.
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
  else {
    const directFilm = site.params.get('film');
    const directPerson = site.params.get('artist');
    if (directFilm && film(directFilm)) requestAnimationFrame(() => openFilmFile(directFilm, globalSearchButton));
    else if (directPerson && people.has(directPerson)) requestAnimationFrame(() => openPersonFile(directPerson, globalSearchButton));
  }
})().catch(error => window.ArchiveSite.showError(error));
