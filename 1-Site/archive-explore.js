(() => {
  'use strict';
  const site = window.ArchiveSite;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  // On cover pages, restore the standard reading chrome once the visitor
  // starts moving down the page. Pages without a cover keep their normal bar.
  if ($('main > .hero')) {
    const syncCoverNav = () => document.body.classList.toggle('archive-nav-scrolled', window.scrollY > 18);
    syncCoverNav();
    window.addEventListener('scroll', syncCoverNav, {passive:true});
    window.addEventListener('pageshow', syncCoverNav);
  }
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normal = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const keyFor = value => normal(value).replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
  const personKey = name => normal(name).replace(/[^\p{L}\p{N}]/gu, '');
  const actingCredits = new Set(['best-actor', 'best-actress', 'best-supporting-actor', 'best-supporting-actress', 'best-breakthrough-performance']);
  const roles = new Map([
    ...[...actingCredits, 'best-antagonist', 'best-villain-antagonist', 'actor-of-the-decade', 'best-performances-of-the-decade'].map(id => [id, 'actors']),
    ['best-director', 'directors'], ['director-of-the-decade', 'directors'],
    ['best-original-score', 'composers'], ['best-original-score-of-the-decade', 'composers'], ['composer-of-the-decade', 'composers'], ['best-score-cue', 'composers'],
    ['best-cinematography', 'cinematographers'],
    ['best-original-screenplay', 'writers'], ['best-adapted-screenplay', 'writers'], ['best-non-original-screenplay', 'writers'],
    ['best-film-editing', 'editors'], ['best-production-design', 'designers'], ['best-costume-design', 'designers'], ['best-song-in-a-film', 'music-artists']
  ]);
  const roleNames = {directors:'Directors', composers:'Composers', cinematographers:'Cinematographers', actors:'Actors', writers:'Writers', editors:'Editors', designers:'Designers', 'music-artists':'Music artists'};
  const selections = {all:'All selections', winner:'Winners', mention:'Honorable mentions', snub:'Oscar Snubs'};
  const negative = new Set(['worst-picture', 'most-overrated-movie']);
  const artistName = entry => entry.creditFirst ? entry.title : entry.detail || entry.title;
  const portfolio = award => Boolean(award.honorsPortfolio || (['director-of-the-decade', 'composer-of-the-decade'].includes(award.id) && award.winner.films.length > 1));
  const shortNumber = value => String(value).padStart(2, '0');
  const cache = new Map();
  let pageActions = null;

  function creditFor(entry, category, discovery = {}) {
    const id = keyFor(category);
    if (!roles.has(id)) return null;
    let value = (entry.creditFirst ? entry.title : entry.detail)?.trim() ?? '';
    let prefix = '', suffix = '';
    if (id === 'best-antagonist' || id === 'best-villain-antagonist') {
      const match = value.match(/^(.*)\(([^()]*)\)$/u);
      if (match) { prefix = match[1] + '('; value = match[2]; suffix = ')'; }
    } else if (actingCredits.has(id)) {
      const role = value.match(/\s+as\s+.+$/i);
      if (role) { suffix = role[0]; value = value.slice(0, role.index); }
    } else if (id === 'best-score-cue' || id === 'best-song-in-a-film') {
      const separator = value.lastIndexOf(' · ');
      if (separator < 0) return null;
      prefix = value.slice(0, separator + 3);
      value = value.slice(separator + 3);
    }
    if (!value) return null;
    const names = (discovery.creditNames?.[value] ?? value.split(/\s+&\s+|\s+×\s+|,\s*/u)).map(name => name.trim()).filter(Boolean);
    return names.length ? {names, prefix, suffix, joiner: value.includes(' feat. ') ? ' feat. ' : ''} : null;
  }

  function winnerDisplay(award, data) {
    const entry = award.winner;
    const films = entry.films.map(slug => data.films[slug]?.title).filter(Boolean).join(' / ');
    const credit = creditFor(entry, award.id, data.discovery);
    if (portfolio(award)) return {title: artistName(entry), detail: films};
    if (actingCredits.has(award.id) && credit) return {title: credit.names.join(credit.joiner || ' & '), detail: films + (credit.suffix ? ' · ' + credit.suffix.trim() : '')};
    return {title: entry.creditFirst ? entry.title : films || entry.title, detail: entry.detail || ''};
  }

  function awardHref(edition, award) {
    return site.editionHref(edition.id) + '&award=' + encodeURIComponent(award);
  }
  function dossierHref(edition, kind, value) {
    return site.editionHref(edition.id) + '&' + kind + '=' + encodeURIComponent(value);
  }

  function buildModel(edition, data, catalog) {
    const discovery = data.discovery ?? {};
    const topics = [...(discovery.moods ?? []), ...(discovery.topics ?? [])];
    const tags = new Map();
    for (const topic of topics) for (const slug of topic.films) {
      if (!tags.has(slug)) tags.set(slug, []);
      tags.get(slug).push(topic.label, ...(topic.terms ?? []));
    }
    const filmText = slug => [data.films[slug]?.title, data.films[slug]?.year, ...(tags.get(slug) ?? [])].join(' ');
    const personText = name => [name, ...(discovery.personAliases?.[name] ?? [])].join(' ');
    const awards = data.chapters.flatMap(chapter => chapter.awards.map(award => ({...award, chapter}))).map((award, index) => ({...award, number: index + 1}));
    const list = catalog.lists.find(item => item.kind === 'snubs' && item.edition === edition.id);
    const eligibleSnubs = (data.snubs ?? []).filter(item => data.media?.films?.[item.entry.films[0]]?.backdrop);
    const spotlight = eligibleSnubs.find(item => item.name === list?.spotlight?.category && item.entry.films.includes(list.spotlight.film)) ?? eligibleSnubs[0];
    const snubHref = item => (list ? site.listHref(list) : site.editionHref(edition.id)) + '#' + (item === spotlight ? 'snub-spotlight-selection' : 'snub-' + (item.id || keyFor(item.name) + '-' + item.entry.films[0]));
    const records = [], people = new Map();
    function record(entry, props, categoryId, suppliedNames) {
      const names = suppliedNames ?? creditFor(entry, categoryId, discovery)?.names ?? [];
      const role = roles.get(keyFor(categoryId));
      const appearance = {...props, entry, names, role, films: entry.films.filter(slug => data.films[slug])};
      records.push(appearance);
      for (const name of names) {
        const id = personKey(name);
        const person = people.get(id) ?? {id, name, appearances: []};
        person.appearances.push(appearance);
        people.set(id, person);
      }
    }
    for (const award of awards) {
      [award.winner, ...award.nominees].forEach((entry, i) => record(entry, {
        kind: 'award', award, category: award.name, chapterId: award.chapter.id,
        selection: i ? 'mention' : negative.has(award.id) ? 'editorial' : 'winner'
      }, award.id));
    }
    for (const snub of data.snubs ?? []) record(snub.entry, {kind:'snub', snub, category:snub.name, selection:'snub'}, snub.academy?.category || snub.name);
    (data.performances ?? []).forEach((entry, i) => record(entry, {kind:'spotlight', category:'Best Performances of the Decade', selection:'spotlight'}, 'best-actor'));
    (data.actors ?? []).forEach(entry => record(entry, {kind:'spotlight', category:'Actor of the Decade', selection:'spotlight'}, 'actor-of-the-decade', [entry.name]));
    if (data.watch) record(data.watch, {kind:'watch', category:'Oscar Watch', selection:'watch'}, 'best-supporting-actor');
    // Only actual credited people can be selected under a craft filter.
    const media = {films:data.media?.films ?? {}, sizes:{...data.media?.sizes, ...catalog.media?.sizes}, variants:{...data.media?.variants, ...catalog.media?.variants}};
    return {edition, data, discovery, topics, filmText, personText, awards, records, people, media, snubHref};
  }

  function createEngine(catalog, initial) {
    const models = new Map();
    const entries = scope => catalog.editions.filter(edition => scope === 'all' || edition.id === scope);
    if (initial) {
      cache.set(initial.edition.content, Promise.resolve(initial.archive));
      models.set(initial.edition.id, buildModel(initial.edition, initial.archive, catalog));
    }
    function loadEdition(edition) {
      if (models.has(edition.id)) return Promise.resolve(models.get(edition.id));
      if (!cache.has(edition.content)) {
        const promise = site.read(edition.content).catch(error => { cache.delete(edition.content); throw error; });
        cache.set(edition.content, promise);
      }
      return cache.get(edition.content).then(data => {
        if (!models.has(edition.id)) models.set(edition.id, buildModel(edition, data, catalog));
        return models.get(edition.id);
      });
    }
    return {
      entries,
      cached(scope) {
        const selected = entries(scope);
        return selected.every(edition => models.has(edition.id)) ? selected.map(edition => models.get(edition.id)) : null;
      },
      load: scope => Promise.all(entries(scope).map(loadEdition))
    };
  }

  function searchModel(model, state) {
    const query = normal(state.query).trim();
    const words = query.split(/\s+/).filter(Boolean);
    const matches = value => words.every(word => normal(value).includes(word));
    const chapter = state.chapter && state.chapter !== 'all-awards' ? state.chapter : null;
    const yearMatches = slug => state.year === null || Number(model.data.films[slug]?.year) === state.year;
    const records = model.records.filter(record =>
      (state.selection === 'all' || record.selection === state.selection) &&
      (state.role === 'all' || (record.role === state.role && record.names.length)) &&
      (!state.chapter || (record.kind === 'award' && (!chapter || record.chapterId === chapter))) &&
      record.films.some(yearMatches));
    const filmRecords = new Map();
    for (const record of records) for (const slug of record.films.filter(yearMatches)) {
      if (!filmRecords.has(slug)) filmRecords.set(slug, []);
      filmRecords.get(slug).push(record);
    }
    const restricted = state.selection !== 'all' || state.role !== 'all' || Boolean(state.chapter);
    const chosenTopics = model.topics.filter(topic => [topic.label, ...(topic.terms ?? [])].some(term => (' ' + query + ' ').includes(' ' + normal(term) + ' ')));
    const filmRows = Object.entries(model.data.films).filter(([slug]) => {
      if (!yearMatches(slug) || (restricted && !filmRecords.has(slug))) return false;
      if (matches(model.filmText(slug))) return true;
      return state.role !== 'all' && !chosenTopics.length && (filmRecords.get(slug) ?? []).some(record => record.names.some(name => matches(model.personText(name))));
    });
    const recordMatches = record => matches([record.category, record.award?.chapter.name, record.entry.title, record.entry.detail,
      ...record.names.map(model.personText), ...record.films.filter(yearMatches).map(model.filmText)].join(' '));
    const relevant = records.filter(recordMatches);
    const awardRecords = new Map();
    for (const record of relevant.filter(record => record.kind === 'award')) {
      if (!awardRecords.has(record.award.id)) awardRecords.set(record.award.id, []);
      awardRecords.get(record.award.id).push(record);
    }
    const awardIds = new Set(awardRecords.keys());
    const awards = model.awards.filter(award => awardIds.has(award.id));
    if (chosenTopics.length) {
      const filmOrder = new Map(chosenTopics[0].films.map((slug, i) => [slug, i]));
      filmRows.sort((a,b) => (filmOrder.get(a[0]) ?? Infinity) - (filmOrder.get(b[0]) ?? Infinity));
      const awardOrder = new Map(chosenTopics.flatMap(topic => topic.awards ?? []).map((id,i) => [id,i]));
      if (awardOrder.size) awards.sort((a,b) => (awardOrder.get(a.id) ?? model.awards.length) - (awardOrder.get(b.id) ?? model.awards.length));
    }
    const activeRecords = new Set(records);
    const nameQuery = personKey(query);
    const people = (words.length || state.role !== 'all') ? [...model.people.values()].filter(person =>
      (matches(model.personText(person.name)) || (nameQuery && personKey(model.personText(person.name)).includes(nameQuery))) && person.appearances.some(appearance => activeRecords.has(appearance)))
      .sort((a,b) => a.name.localeCompare(b.name)).map(person => ({...person, count:new Set(person.appearances.filter(appearance => activeRecords.has(appearance)).flatMap(record => record.films.filter(yearMatches))).size})) : [];
    const showSnubs = state.selection === 'snub' || words.length || state.year !== null || state.role !== 'all';
    const snubs = showSnubs ? relevant.filter(record => record.kind === 'snub').map(record => record.snub) : [];
    return {model, filmRows, awards, people, snubs, awardRecords};
  }

  function indexPoster(model, slug) {
    const path = model.media.films[slug]?.poster;
    if (!path) return '<span class="poster index-poster-fallback" aria-hidden="true">' + esc(model.data.films[slug]?.title) + '</span>';
    const variants = model.media.variants[path] ?? [];
    const thumbnail = variants.find(item => item.width >= 64) ?? variants.at(-1);
    return `<span class="poster" aria-hidden="true"><img src="${esc(thumbnail?.src ?? path)}" alt="" width="32" height="48" loading="lazy" decoding="async"></span>`;
  }

  const searchIcon = '<svg viewBox="0 0 20 20" width="19" height="19" fill="none" aria-hidden="true"><circle cx="8.7" cy="8.7" r="5.7" stroke="currentColor" stroke-width="1.55"/><path d="m13 13 4.5 4.5" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/></svg>';
  const shuffleIcon = '<svg viewBox="0 0 20 20" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 5h2c2.2 0 3.6 2.4 5.5 5s3.3 5 5.5 5h2m0 0-2.6-2.6M17.5 15l-2.6 2.6M2.5 15h2c1.4 0 2.5-1.1 3.6-2.6M12 7.6C13 6 14.2 5 15.5 5h2m0 0-2.6 2.6M17.5 5l-2.6-2.6"/></svg>';
  const chevron = '<svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true"><path d="m2 4 4 4 4-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const filterIcon = '<svg viewBox="0 0 18 18" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M2.5 5h13M2.5 13h13"/><circle cx="6" cy="5" r="2" fill="var(--panel)"/><circle cx="11.5" cy="13" r="2" fill="var(--panel)"/></svg>';
  const compareIcon = '<svg viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><rect x="1.5" y="3" width="6" height="12" rx="1"/><rect x="10.5" y="3" width="6" height="12" rx="1"/><path d="M3.5 11.5h2M12.5 11.5h2"/></svg>';
  function searchButton() {
    const masthead = $('.masthead');
    const profile = $('.masthead .profile');
    if (!masthead || !profile) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'masthead-tools';
    profile.before(wrapper);
    wrapper.innerHTML = `<button type="button" class="archive-search-open" aria-label="Search the archive" title="Search the archive (/)" aria-haspopup="dialog">${searchIcon}</button>`;
    wrapper.append(profile);
    return $('.archive-search-open', wrapper);
  }
  function bindSearchShortcut(button, open) {
    button?.addEventListener('click', () => open(button));
    document.addEventListener('keydown', event => {
      if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey || event.repeat || $('dialog[open]') || event.target.closest?.('input,textarea,select,[contenteditable="true"]')) return;
      event.preventDefault();
      open(button);
    });
  }

  function createIndex({dialog, catalog, engine, localEdition, chapterIndex, onRefresh, onDiscover}) {
    const search = $('#category-search', dialog);
    const results = $('#index-results', dialog);
    const state = {scope: localEdition ?? 'all', query:'', year:null, chapter:null, selection:'all', role:'all'};
    const defaultScope = state.scope;
    let resetScope = defaultScope;
    let generation = 0, rendered = false, pool = [], lastDiscovery = '';
    const multi = catalog.editions.length > 1;
    const options = (entries, selected) => entries.map(([value, label]) => `<option value="${esc(value)}"${value === selected ? ' selected' : ''}>${esc(label)}</option>`).join('');
    const selectField = (label, id, choices, selected) => `<label class="index-scope-field" for="${id}"><span>${esc(label)}</span><span class="index-select-wrap"><select id="${id}">${options(choices,selected)}</select>${chevron}</span></label>`;
    search.insertAdjacentHTML('afterend', `<div class="index-suggestions" role="group" aria-label="Suggested searches"></div>
      <div class="index-filter-toolbar"><button type="button" class="index-filters-toggle" aria-expanded="false" aria-controls="index-filters-panel">${filterIcon}<span>Filters</span><span class="index-filter-count" hidden></span>${chevron}</button><span class="index-filter-context"></span><button type="button" class="index-discover" aria-label="Discover a film using current filters" title="Discover a film using current filters" disabled>${shuffleIcon}<span>Discover</span></button></div>
      <div class="index-refine-filters" id="index-filters-panel" hidden><div class="index-filter-fields" data-field-count="${multi ? 4 : 3}" role="group" aria-label="Refine archive search">${multi ? selectField('Edition', 'index-edition-select', [['all','All editions'], ...catalog.editions.map(edition => [edition.id, edition.period])], defaultScope) : ''}<div class="index-year-filter"></div>${selectField('Selection', 'index-selection-select', Object.entries(selections), 'all')}${selectField('Artist role', 'index-role-select', [['all','All roles'], ...Object.entries(roleNames)], 'all')}</div><div class="index-filter-footer"><button type="button" class="index-reset-filters" disabled>Reset filters</button><button type="button" class="index-filters-done">Done</button></div></div>`);
    const suggestionsBox = $('.index-suggestions', dialog);
    const yearBox = $('.index-year-filter', dialog);
    const discover = $('.index-discover', dialog);
    const filterToggle = $('.index-filters-toggle', dialog);
    const filterPanel = $('#index-filters-panel', dialog);
    const filterContext = $('.index-filter-context', dialog);
    const filterCount = $('.index-filter-count', dialog);
    const resetFiltersButton = $('.index-reset-filters', dialog);
    const resultNav = document.createElement('nav');
    resultNav.className = 'index-result-nav';
    resultNav.setAttribute('aria-label','Jump to result type');
    resultNav.hidden = true;
    results.before(resultNav);
    const visual = window.ArchiveVisualIndex?.create(dialog,results);

    // Every preview is resolved from the selected edition's existing assets.
    // Register paths only; no image is fetched until its row is highlighted.
    function previewFor(model,slug,details = {}) {
      const info=model.data.films[slug] || {};
      const art=model.media.films[slug] || {};
      const path=details.path || model.data.galleries?.[slug]?.[0]?.path || art.backdrop || art.poster;
      if(!path)return null;
      const size=model.media.sizes[path] || [960,540];
      const variants=[...(model.media.variants[path]||[])].sort((a,b)=>a.width-b.width);
      const responsive=variants.find(item=>item.width>=560)||variants.at(-1);
      return {path,src:responsive?.src||path,width:size[0],height:size[1],poster:size[0]/size[1]<1.16,
        title:details.title||info.title,kicker:details.kicker||`Film · ${model.edition.period}`,
        meta:details.meta||[info.year,info.director].filter(Boolean).join(' · '),credit:details.credit||'',alt:details.alt||`Artwork from ${info.title||details.title}`};
    }
    function setFiltersOpen(open) {
      filterPanel.hidden = !open;
      filterToggle.setAttribute('aria-expanded', String(open));
    }
    function updateFilterSummary() {
      const active = Number(state.scope !== resetScope) + Number(state.year !== null) + Number(state.selection !== 'all') + Number(state.role !== 'all');
      const context = [];
      if (multi) context.push(catalog.editions.find(edition => edition.id === state.scope)?.period ?? 'All editions');
      if (state.year !== null) context.push(String(state.year));
      if (state.selection !== 'all') context.push(selections[state.selection]);
      if (state.role !== 'all') context.push(roleNames[state.role]);
      filterContext.textContent = context.join(' · ');
      filterContext.title = filterContext.textContent;
      filterContext.hidden = !context.length;
      filterCount.textContent = String(active);
      filterCount.hidden = !active;
      resetFiltersButton.disabled = !active && !state.chapter;
    }
    function controls(models) {
      const suggestions = [...new Set(models.flatMap(model => model.discovery.searchSuggestions ?? model.topics.map(topic => topic.label)))].slice(0,5);
      suggestionsBox.innerHTML = suggestions.map(label => `<button type="button" data-index-suggestion="${esc(label)}" aria-pressed="${normal(label) === normal(search.value).trim()}">${esc(label)}</button>`).join('');
      const years = [...new Set(models.flatMap(model => Object.values(model.data.films).map(info => Number(info.year)).filter(Number.isFinite)))].sort((a,b) => a-b);
      if (state.year !== null && !years.includes(state.year)) state.year = null;
      const yearKey = state.year === null ? 'all' : String(state.year);
      yearBox.innerHTML = selectField('Release year','index-year-select',[['all','All years'],...years.map(year=>[String(year),String(year)])],yearKey);
      suggestionsBox.hidden = !suggestions.length;
      updateFilterSummary();
    }
    function updateActiveControls() {
      $$('[data-index-suggestion]', dialog).forEach(button => button.setAttribute('aria-pressed', String(normal(button.dataset.indexSuggestion) === normal(search.value).trim())));
      const key = state.year === null ? 'all' : String(state.year);
      if ($('#index-year-select', dialog)) $('#index-year-select', dialog).value = key;
      updateFilterSummary();
    }
    function render(models, rebuildControls) {
      visual?.clear();
      if (rebuildControls || !yearBox.children.length) controls(models);
      else updateActiveControls();
      const current = state.scope === localEdition;
      const idle = !state.query.trim() && state.year === null && state.selection === 'all' && state.role === 'all' && !state.chapter;
      const searched = models.map(model => searchModel(model, state));
      pool = searched.flatMap(({model,filmRows}) => filmRows.map(([slug]) => ({model,slug})));
      discover.disabled = !pool.length;
      resultNav.hidden = true;
      resultNav.replaceChildren();
      if (idle && current && chapterIndex) { results.innerHTML = chapterIndex(); return; }
      const globalBrowse = !current && idle;
      const previews = new Map();
      const previewAttr=(key,model,slug,details={})=>{
        if(!visual)return '';
        const preview=previewFor(model,slug,details);
        if(!preview)return '';
        const id=model.edition.id+'/'+key;
        previews.set(id,preview);
        return ` data-visual-preview="${esc(id)}"`;
      };
      const local = model => pageActions?.editionId === model.edition.id;
      const period = model => multi && state.scope === 'all' ? ' · ' + model.edition.period : '';
      const filmRows = searched.flatMap(({model,filmRows}) => (state.query.trim() || state.year !== null || state.selection !== 'all' || state.role !== 'all' || globalBrowse || !chapterIndex ? filmRows : []).map(([slug,info]) => {
        const href = dossierHref(model.edition, 'film', slug);
        const attrs = local(model) ? ` data-film-file="${esc(slug)}" aria-haspopup="dialog"` : '';
        const preview=previewAttr('film/'+slug,model,slug);
        return `<a class="index-row film-index-row" href="${esc(href)}" data-result-edition="${esc(model.edition.id)}" data-result-film="${esc(slug)}"${preview}${attrs}>${indexPoster(model,slug)}<span><strong>${esc(info.title)}</strong><small>${esc(info.year + period(model))}</small></span></a>`;
      }));
      const artistRows = searched.flatMap(({model,people}) => people.map(person => {
        const name = `<span><strong>${esc(person.name)}</strong><small>${esc(person.count + (person.count === 1 ? ' film' : ' films') + period(model))}</small></span>`;
        const slugs=[...new Set(person.appearances.flatMap(item=>item.films))];
        const slug=slugs.find(id=>model.data.galleries?.[id]?.length||model.media.films[id]?.backdrop)||slugs[0];
        const preview=previewAttr('artist/'+person.id,model,slug,{title:person.name,kicker:`Artist · ${model.edition.period}`,meta:person.count+(person.count===1?' film':' films'),credit:model.data.films[slug] ? `From ${model.data.films[slug].title}` : ''});
        const attr = `class="index-row person-index-row" data-result-edition="${esc(model.edition.id)}" data-result-person="${esc(person.id)}"${preview}`;
        return local(model) ? `<button type="button" ${attr} data-person="${esc(person.id)}" aria-haspopup="dialog">${name}</button>` : `<a ${attr} href="${esc(dossierHref(model.edition,'artist',person.id))}">${name}</a>`;
      }));
      const awardRows = globalBrowse ? [] : searched.flatMap(({model,awards,awardRecords}) => awards.map(award => {
        const display = winnerDisplay(award, model.data);
        const matching = awardRecords.get(award.id) ?? [];
        const matchedMentions = matching.filter(record => record.selection === 'mention');
        const mentionOnly = matchedMentions.length && !matching.some(record => record.selection !== 'mention');
        const relevantCaption = mentionOnly
          ? 'Honorable mention · ' + matchedMentions[0].entry.title + (matchedMentions.length > 1 ? ' +' + (matchedMentions.length - 1) : '')
          : display.title;
        const caption = relevantCaption + period(model);
        const body = `<span>${shortNumber(award.number)}</span><span><strong>${esc(award.name)}</strong><small>${esc(caption)}</small></span><b aria-hidden="true">↗</b>`;
        const featured=mentionOnly?matchedMentions[0].entry:award.winner;
        const presentation=!mentionOnly && model.data.editorial?.presentationStills?.[award.id];
        const slug=presentation?.film && featured.films.includes(presentation.film)?presentation.film:featured.films[0];
        const dedicated=(model.data.stills?.[slug]||[]).find(still=>still.award===award.id)?.path;
        const frame=(!mentionOnly && award.winnerArtwork?.path)||presentation?.path||dedicated||model.media.films[slug]?.backdrop;
        const info=model.data.films[slug];
        const preview=previewAttr('award/'+award.id,model,slug,{path:frame,title:award.name,kicker:`${mentionOnly?'Honorable mention':'Award'} · ${model.edition.period}`,meta:mentionOnly?featured.title:display.title,credit:info?[info.title,info.year].join(' · '):''});
        const attr = `class="index-row archive-award-row" data-result-edition="${esc(model.edition.id)}" data-result-award="${esc(award.id)}"${preview}`;
        return local(model) && pageActions.awards ? `<button type="button" ${attr} data-award="${award.number - 1}">${body}</button>` : `<a ${attr} href="${esc(awardHref(model.edition,award.id))}">${body}</a>`;
      }));
      const snubRows = searched.flatMap(({model,snubs}) => snubs.map(snub => {
        const slug = snub.entry.films[0];
        const preview=previewAttr('snub/'+slug+'/'+keyFor(snub.name),model,slug,{title:snub.entry.title,kicker:`Oscar Snubs · ${model.edition.period}`,meta:snub.name,credit:snub.status});
        return `<a class="index-row archive-snub-row" data-result-edition="${esc(model.edition.id)}"${preview} href="${esc(model.snubHref(snub))}">${indexPoster(model,slug)}<span><strong>${esc(snub.entry.title)}</strong><small>${esc(snub.name + period(model))}</small></span><b aria-hidden="true">↗</b></a>`;
      }));
      const groups = [
        {id:'artists', label:'Artists', rows:artistRows},
        {id:'films', label:'Films', rows:filmRows},
        {id:'awards', label:'Awards', rows:awardRows},
        {id:'snubs', label:'Oscar Snubs', rows:snubRows}
      ].filter(group => group.rows.length);
      const content = groups.map(({id,label,rows}) => `<section class="index-result-group" aria-labelledby="index-group-${id}"><h3 class="index-match-heading" id="index-group-${id}" tabindex="-1">${label} · ${rows.length}</h3>${rows.join('')}</section>`).join('');
      // At rest the original index stays compact. When filtering/searching,
      // show only result types that actually contain matching records.
      if ((!idle || state.scope !== resetScope) && groups.length) {
        resultNav.innerHTML = groups.map(({id,label,rows}) => `<button type="button" data-index-group-target="${id}" aria-controls="index-group-${id}" aria-label="${label}, ${rows.length} matching results">${label} <b>${rows.length}</b></button>`).join('');
        resultNav.hidden = false;
      }
      const chapter = models[0]?.data.chapters.find(item => item.id === state.chapter);
      const context = state.chapter ? `<div class="index-chapter-context"><button type="button" data-index-chapter="">All chapters</button><span>${esc(chapter?.name ?? 'All awards')}</span></div>` : '';
      results.innerHTML = context + (content || '<p class="empty-index">No matches. Try another film, person, award or mood, or clear a filter.</p>');
      visual?.render(previews);
    }
    function refresh(rebuildControls = false) {
      visual?.clear();
      state.query = search.value;
      const request = ++generation;
      const models = engine.cached(state.scope);
      rendered = true;
      pool = [];
      discover.disabled = true;
      updateFilterSummary();
      onRefresh?.();
      results.scrollTop = 0;
      resultNav.hidden = true;
      if (models) { render(models,rebuildControls); return Promise.resolve(); }
      results.innerHTML = '<p class="empty-index" role="status">Loading the archive…</p>';
      return engine.load(state.scope).then(loaded => {
        if (request !== generation) return;
        render(loaded,true);
      }).catch(() => {
        if (request !== generation) return;
        results.innerHTML = '<p class="empty-index">The selected edition could not be loaded. <button type="button" class="index-retry">Try again</button></p>';
      });
    }
    function setScope(value) {
      if (state.scope === value) return;
      state.scope = value;
      state.year = null; state.chapter = null;
      if ($('#index-edition-select',dialog)) $('#index-edition-select',dialog).value = value;
      refresh(true);
    }
    function resetFilters() {
      state.scope = resetScope;
      state.year = null; state.chapter = null; state.selection = 'all'; state.role = 'all';
      if ($('#index-edition-select',dialog)) $('#index-edition-select',dialog).value = resetScope;
      $('#index-selection-select',dialog).value = 'all';
      $('#index-role-select',dialog).value = 'all';
      refresh(true);
    }
    function setTopic(topic) {
      resetScope = 'all';
      state.scope = 'all';
      state.year = null; state.chapter = null; state.selection = 'all'; state.role = 'all';
      if ($('#index-edition-select',dialog)) $('#index-edition-select',dialog).value = 'all';
      $('#index-selection-select',dialog).value = 'all';
      $('#index-role-select',dialog).value = 'all';
      search.value = topic;
      setFiltersOpen(false);
      refresh(true);
    }
    function chooseFilm() {
      if (!pool.length) return;
      const candidates = pool.length > 1 ? pool.filter(({model,slug}) => model.edition.id + '/' + slug !== lastDiscovery) : pool;
      const item = candidates[Math.floor(Math.random() * candidates.length)];
      lastDiscovery = item.model.edition.id + '/' + item.slug;
      if (onDiscover) onDiscover(item, discover);
      else if (window.ArchiveContinuity) window.ArchiveContinuity.navigate(dossierHref(item.model.edition,'film',item.slug),discover);
      else if (pageActions?.editionId === item.model.edition.id) pageActions.openFilm(item.slug, discover);
      else {
        const destination=dossierHref(item.model.edition,'film',item.slug);
        location.href=window.ArchiveFeatures?.linkSettings(destination)?.href || destination;
      }
    }
    search.addEventListener('input', () => refresh());
    dialog.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.matches('[data-index-suggestion]')) { search.value = button.dataset.indexSuggestion; refresh(); }
      else if (button === filterToggle) setFiltersOpen(filterPanel.hidden);
      else if (button.matches('.index-filters-done')) { setFiltersOpen(false); filterToggle.focus({preventScroll:true}); }
      else if (button === resetFiltersButton) resetFilters();
      else if (button.matches('[data-index-chapter]')) { state.chapter = button.dataset.indexChapter || null; refresh(); results.querySelector('button')?.focus({preventScroll:true}); }
      else if (button.matches('[data-index-group-target]')) {
        const heading = $('#index-group-' + button.dataset.indexGroupTarget, results);
        if (!heading) return;
        results.scrollTop += heading.getBoundingClientRect().top - results.getBoundingClientRect().top;
        heading.focus({preventScroll:true});
      }
      else if (button === discover) chooseFilm();
      else if (button.matches('.index-retry')) refresh(true);
    });
    dialog.addEventListener('change', event => {
      const {id,value} = event.target;
      if (id === 'index-edition-select') setScope(value);
      else if (id === 'index-year-select') { state.year = value === 'all' ? null : Number(value); refresh(); }
      else if (id === 'index-selection-select') { state.selection = value; if (value === 'snub') state.chapter = null; refresh(); }
      else if (id === 'index-role-select') { state.role = value; refresh(); }
    });
    setFiltersOpen(false);
    function snapshot() {
      return {...state,resetScope,filtersOpen:!filterPanel.hidden,scroll:results.scrollTop};
    }
    function restore(saved) {
      if (!saved) return Promise.resolve();
      const scopes=['all',...catalog.editions.map(edition=>edition.id)];
      state.scope=scopes.includes(saved.scope)?saved.scope:defaultScope;
      resetScope=scopes.includes(saved.resetScope)?saved.resetScope:defaultScope;
      state.year=Number.isFinite(saved.year)?saved.year:null;
      state.chapter=typeof saved.chapter==='string'?saved.chapter:null;
      state.selection=Object.hasOwn(selections,saved.selection)?saved.selection:'all';
      state.role=saved.role==='all'||Object.hasOwn(roleNames,saved.role)?saved.role:'all';
      search.value=typeof saved.query==='string'?saved.query.slice(0,300):'';
      if ($('#index-edition-select',dialog)) $('#index-edition-select',dialog).value=state.scope;
      $('#index-selection-select',dialog).value=state.selection;
      $('#index-role-select',dialog).value=state.role;
      setFiltersOpen(Boolean(saved.filtersOpen));
      return refresh(true).then(()=>{results.scrollTop=Number(saved.scroll)||0;});
    }
    function park() {
      // A parked dossier shell keeps the controller and cached models but
      // releases its old result nodes and invalidates any outstanding render.
      generation++;rendered=false;pool=[];lastDiscovery='';
      resetScope=defaultScope;
      Object.assign(state,{scope:defaultScope,query:'',year:null,chapter:null,selection:'all',role:'all'});
      search.value='';
      if ($('#index-edition-select',dialog)) $('#index-edition-select',dialog).value=defaultScope;
      $('#index-selection-select',dialog).value='all';
      $('#index-role-select',dialog).value='all';
      setFiltersOpen(false);visual?.clear();results.replaceChildren();results.scrollTop=0;
      resultNav.replaceChildren();resultNav.hidden=true;discover.disabled=true;
      suggestionsBox.replaceChildren();yearBox.replaceChildren();updateFilterSummary();
    }
    return {ensure() { if (!rendered) refresh(true); }, global() { if (multi) { resetScope = 'all'; setScope('all'); updateFilterSummary(); } if (!rendered) refresh(true); }, setTopic, state, refresh,snapshot,restore,park};
  }

  function homeMoodCards(models) {
    // The representative still is curated, but the membership and count
    // always come from the existing searchable catalogue, not a second list.
    const collections = ['Obsession','Music','Atmosphere'];
    return collections.map(label => {
      const state = {scope:'all',query:label,year:null,chapter:null,selection:'all',role:'all'};
      const pool = models.flatMap(model => searchModel(model,state).filmRows.map(([slug,info]) => ({model,slug,info})));
      if (!pool.length) return '';
      let picked, still;
      const choices = models.flatMap(model => {
        const art = model.data.editorial?.moodCovers?.[label];
        return art?.path ? [{...art,editionId:model.edition.id}] : [];
      }).sort((a,b)=>(a.priority??100)-(b.priority??100));
      for (const choice of choices) {
        const candidate = pool.find(item => item.model.edition.id === choice.editionId && item.slug === choice.film);
        if (!candidate) continue;
        const path = choice.path;
        if (path) { picked = candidate; still = path; break; }
      }
      if (!picked) {
        picked = pool.find(({model,slug}) => model.data.galleries?.[slug]?.length || model.media.films[slug]?.backdrop);
        still = picked?.model.data.galleries?.[picked.slug]?.[0]?.path || picked?.model.media.films[picked.slug]?.backdrop;
      }
      if (!still) return '';
      const variants = picked.model.media.variants[still] ?? [];
      const [width,height] = picked.model.media.sizes[still] ?? [960,540];
      return {label, count:pool.length, still, variants, width, height};
    }).filter(Boolean);
  }

  function drawMoodCollections(section, cards) {
    const items = cards.map(({label,count,still,variants,width,height}) => {
      const srcset = variants.map(item => item.src+' '+item.width+'w').join(', ');
      const sizes = '(min-width: 681px) 28vw, 30vw';
      const fallback = variants.find(item => item.width >= 480)?.src || still;
      const card=`<button type="button" class="mood-collection" data-mood-topic="${esc(label)}" aria-haspopup="dialog" aria-label="Explore ${esc(label)}: ${count} films"><img src="${esc(fallback)}"${srcset ? ` srcset="${esc(srcset)}" sizes="${sizes}"` : ''} width="${width}" height="${height}" loading="lazy" decoding="async" alt=""><span class="mood-collection-copy"><strong>${esc(label)}</strong><small>${count} ${count === 1 ? 'film' : 'films'}</small></span></button>`;
      const journey=window.ArchiveJourneyEditorial?.forMood(label);
      return journey?`<div class="ts-mood-journey-item">${card}<a class="ts-mood-journey" href="${esc(window.ArchiveJourneyEditorial.href(journey))}" aria-label="Follow a film journey about ${esc(label)}"><svg viewBox="0 0 20 16" width="17" height="14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="1" y="2" width="18" height="12" rx="1"/><path d="M6 2v12M14 2v12M1 6h5m-5 4h5m8-4h5m-5 4h5"/></svg><span>Follow the journey</span></a></div>`:card;
    }).filter(Boolean);
    if (items.length) {
      $('#mood-collection-grid',section).innerHTML = items.join('');
      section.hidden = false;
      if (location.hash === '#moods') requestAnimationFrame(() => section.scrollIntoView({block:'start'}));
    }
  }

  async function renderMoodCollections(section, engine) {
    drawMoodCollections(section, homeMoodCards(await engine.load('all')));
  }

  function compareCategory(id) {
    return id === 'best-non-original-screenplay' ? 'best-adapted-screenplay' : id;
  }
  async function renderComparison(slot, engine, award, localEdition, catalog) {
    if (!slot || catalog.editions.length < 2) return;
    try {
      const models = await engine.load('all');
      if (!slot.isConnected) return;
      const matches = models.flatMap(model => model.awards.filter(item => compareCategory(item.id) === compareCategory(award.id)).map(item => ({model,award:item})))
        .sort((a,b) => a.model.edition.id.localeCompare(b.model.edition.id));
      if (matches.length < 2) return;
      slot.innerHTML = `<details class="across-decades"><summary>${compareIcon}<span>Across the decades</span>${chevron}</summary><div class="across-decades-grid">${matches.map(({model,award:item}) => {
        const display = winnerDisplay(item,model.data);
        const content = `<span class="comparison-period">${esc(model.edition.period)}</span><strong>${esc(display.title)}</strong>${display.detail ? `<small>${esc(display.detail)}</small>` : ''}${item.name !== award.name ? `<small class="compare-category">${esc(item.name)}</small>` : ''}`;
        return model.edition.id === localEdition ? `<div class="comparison-winner is-current" aria-current="true">${content}</div>` : `<a class="comparison-winner" href="${esc(awardHref(model.edition,item.id))}" title="View ${esc(model.edition.period)} ${esc(item.name)}">${content}<span class="comparison-open">View award</span></a>`;
      }).join('')}</div></details>`;
    } catch { /* Comparison is optional; the current award remains usable. */ }
  }

  window.ArchiveExplore = {creditFor, actingCredits, winnerDisplay, createEngine, createIndex, renderComparison, searchButton, bindSearchShortcut, dossierHref, homeMoodCards, setPageActions(actions) { pageActions = actions; }};

  // The very same search and filters are available from the home and list pages.
  // On an award page its existing Index hosts the controller instead.
  if (document.body.dataset.page !== 'awards') {
    const trigger = searchButton();
    let controller, pending, opener, requestedTopic, requestedRestore;
    let contextPromise;
    function archiveContext() {
      if (!contextPromise) contextPromise = site.catalog().then(catalog => ({catalog,engine:createEngine(catalog)})).catch(error => { contextPromise = null; throw error; });
      return contextPromise;
    }
    const dialog = document.createElement('dialog');
    dialog.id = 'index-dialog'; dialog.className = 'archive-standalone-index';
    dialog.setAttribute('aria-labelledby','index-title');
    dialog.innerHTML = `<div class="index-header"><h2 id="index-title" tabindex="-1">The index.</h2><button type="button" class="dialog-close" aria-label="Close index">✕</button></div><label class="search-label" for="category-search">Search films, people, awards or moods</label><input id="category-search" type="search" placeholder="Film, person, award or mood…" autocomplete="off"><div id="index-results" role="region" aria-label="Index results"><p class="empty-index" role="status">Loading the archive…</p></div>`;
    document.body.append(dialog);
    function open(button, topic = '') {
      if (dialog.open) return;
      opener = button;
      requestedTopic = topic;
      dialog.showModal(); document.body.classList.add('dialog-open');
      $('#category-search',dialog).focus({preventScroll:true});
      if (controller) { if (requestedRestore) restoreIndex(); else if (topic) controller.setTopic(topic); else controller.ensure(); return; }
      if (pending) return;
      pending = archiveContext().then(({catalog,engine}) => {
        controller = createIndex({dialog, catalog, engine});
        if (dialog.open) { if (requestedRestore) restoreIndex(); else if (requestedTopic) controller.setTopic(requestedTopic); else controller.ensure(); }
      }).catch(() => { $('#index-results',dialog).innerHTML = '<p class="empty-index">The archive could not be loaded. Close the index and try again.</p>'; }).finally(() => { pending = null; });
    }
    bindSearchShortcut(trigger,open);
    dialog.addEventListener('click',event => { if (event.target === dialog || event.target.closest('.dialog-close')) dialog.close(); });
    dialog.addEventListener('cancel',event => { event.preventDefault(); dialog.close(); });
    dialog.addEventListener('close',() => {
      if (!$('dialog[open]')) document.body.classList.remove('dialog-open');
      opener?.focus({preventScroll:true});
    });
    function restoreIndex() {
      const saved=requestedRestore; requestedRestore=null;
      controller.restore(saved.index).then(()=>{
        if (!dialog.open) return;
        const controls=$$('a[href],button:not([disabled]),input,select',dialog);
        controls[saved.focus]?.focus({preventScroll:true});
        $('#index-results',dialog).scrollTop=saved.index.scroll||0;
      });
    }
    window.ArchiveContinuity?.register('index',source=>{
      if (!dialog.open || !controller) return null;
      return {index:controller.snapshot(),focus:$$('a[href],button:not([disabled]),input,select',dialog).indexOf(source)};
    },saved=>{requestedRestore=saved; open(trigger);});

    const moodSection = $('#moods');
    if (moodSection) {
      moodSection.addEventListener('click', event => {
        const button = event.target.closest('[data-mood-topic]');
        if (button) open(button,button.dataset.moodTopic);
      });
      const loadMoods = () => site.read('content/home-moods.json')
        .then(cards => drawMoodCollections(moodSection,cards))
        .catch(() => archiveContext().then(({engine}) => renderMoodCollections(moodSection,engine)).catch(() => {}));
      if ('requestIdleCallback' in window) requestIdleCallback(loadMoods,{timeout:1400});
      else setTimeout(loadMoods,100);
      const requested=new URLSearchParams(location.search).get('topic');
      if (requested) {
        requestAnimationFrame(()=>open(trigger,requested.slice(0,80)));
      }
    }

    const homeDiscover = $('[data-home-discover]');
    if (homeDiscover) {
      const label = $('span', homeDiscover);
      const status = $('#home-discover-status');
      let lastHomeFilm = '';
      try { lastHomeFilm = sessionStorage.getItem('ts-archive-home-discovery') || ''; } catch {}
      homeDiscover.addEventListener('click', async () => {
        if (homeDiscover.disabled) return;
        homeDiscover.disabled = true;
        homeDiscover.setAttribute('aria-busy','true');
        label.textContent = 'Discovering…';
        status.hidden = true;
        try {
          const {catalog,engine} = await archiveContext();
          const models = await engine.load('all');
          const pools = [];
          for (const model of models) {
            const awardFilms = [...new Set(model.awards.flatMap(award => [award.winner,...award.nominees].flatMap(entry => entry.films)))].filter(slug => model.data.films[slug]);
            if (awardFilms.length) pools.push({model,slugs:awardFilms});
            for (const list of catalog.lists.filter(list => list.kind === 'snubs' && list.edition === model.edition.id)) {
              const snubFilms = [...new Set((model.data.snubs ?? []).flatMap(item => item.entry.films))].filter(slug => model.data.films[slug]);
              if (snubFilms.length) pools.push({model,slugs:snubFilms});
            }
          }
          const fresh = pools.map(pool => ({...pool,slugs:pool.slugs.filter(slug=>pool.model.edition.id+'/'+slug!==lastHomeFilm)})).filter(pool=>pool.slugs.length);
          const choices = fresh.length ? fresh : pools;
          if (!choices.length) throw new Error('No films available');
          const chosen = choices[Math.floor(Math.random()*choices.length)];
          const slug = chosen.slugs[Math.floor(Math.random()*chosen.slugs.length)];
          lastHomeFilm = chosen.model.edition.id+'/'+slug;
          try { sessionStorage.setItem('ts-archive-home-discovery', lastHomeFilm); } catch {}
          const destination = new URL(dossierHref(chosen.model.edition,'film',slug), location.href);
          destination.searchParams.set('from','home-discover');
          if (window.ArchiveContinuity) window.ArchiveContinuity.navigate(destination,homeDiscover);
          else location.href=window.ArchiveFeatures?.linkSettings(destination)?.href || destination.href;
          // An in-place dossier no longer triggers a pageshow event on return.
          homeDiscover.disabled=false;homeDiscover.removeAttribute('aria-busy');label.textContent='Discover a film';
        } catch {
          homeDiscover.disabled = false;
          homeDiscover.removeAttribute('aria-busy');
          label.textContent = 'Discover a film';
          status.textContent = 'Could not discover a film. Try again.';
          status.hidden = false;
        }
      });
      window.addEventListener('pageshow', () => {homeDiscover.disabled=false;homeDiscover.removeAttribute('aria-busy');label.textContent='Discover a film';});
    }
  }
})();
