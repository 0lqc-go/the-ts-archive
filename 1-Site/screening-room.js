(() => {
  'use strict';
  const site = window.ArchiveSite;
  const explore = window.ArchiveExplore;
  const data = window.ArchiveScreeningData;
  const editorialJourneys = window.ArchiveJourneyEditorial;
  const round2 = window.ArchiveFeatures;
  const refinedQuestions = round2?.enabled('12');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  const nameOfMode = {frame:'Guess the Frame',memory:'Cinema Memory',signature:'Visual Signature',winner:'Guess the Winner',editor:'The Editor',connections:'Connections',daily:'Daily Challenge',matchup:'This or That',ballot:'My Alternate Ballot',journeys:'Film Journeys'};
  const quizModes = new Set(['frame','memory','signature','winner','editor','connections','daily']);
  const storageKey = 'ts-archive-screening-ballot-v1';
  const quizHistoryStorageKey = 'ts-archive-screening-quiz-history-v2';
  const dailyStorageKey = 'ts-archive-screening-daily-quiz-v1';
  const matchupStorageKey = 'ts-archive-screening-matchup-v1';
  let contextPromise;
  let imageMedia={sizes:{},variants:{}};
  const asset=window.ArchiveMedia;
  const imageAttrs=(path,sizes,fallback)=>asset.attributes(imageMedia,path,sizes,fallback);
  const getContext = () => contextPromise ??= site.catalog().then(async catalog => {
    const models=await explore.createEngine(catalog).load('all');
    imageMedia={sizes:Object.assign({},catalog.media?.sizes,...models.map(m=>m.media.sizes)),variants:Object.assign({},catalog.media?.variants,...models.map(m=>m.media.variants))};
    return {catalog,archive:data.makeArchive(models)};
  }).catch(error => { contextPromise = null; throw error; });

  function poster(film, className = '') {
    return film?.poster ? `<img${className ? ` class="${className}"` : ''} ${imageAttrs(film.poster,'120px',176)} alt="" width="80" height="120" loading="lazy" decoding="async">` : `<span class="${className} sr-poster-placeholder" aria-hidden="true"></span>`;
  }

  function still(frame) {
    // The filename, film title, caption and credits are not displayed before
    // answering. The complete image itself is visible and entirely static.
    return `<div class="sr-still"><img ${imageAttrs(frame.path,'(max-width: 680px) 94vw, (min-width: 1440px) 1050px, 84vw',960)} width="${frame.width}" height="${frame.height}" alt="Film still for the question" loading="eager" decoding="async" fetchpriority="high"><span class="sr-still-message" hidden>The frame could not be loaded. You can skip this question.</span></div>`;
  }

  function bindStillErrors(root) {
    for (const image of $$('.sr-still img', root)) {
      const showError = () => { $( '.sr-still-message', image.parentElement).hidden = false; };
      image.addEventListener('error', showError, {once:true});
      if (image.complete && !image.naturalWidth) showError();
    }
  }

  function focusHeading(root) {
    const heading = $('h2[tabindex="-1"]',root);
    if (!heading) return;
    if (!refinedQuestions) { heading.focus(); return; }
    heading.focus({preventScroll:true});
    const rect=heading.getBoundingClientRect(), mast=$('.masthead')?.getBoundingClientRect().bottom || 0;
    if(rect.top<mast || rect.bottom>innerHeight) heading.scrollIntoView({block:'start',behavior:'instant'});
  }

  async function initDaily() {
    const section = $('#screening-daily');
    if (!section) return;
    try {
      // The home page needs only the daily rotation, not the award index,
      // games, ballots, or both full editions. Use the build-time projection.
      let archive;
      try {
        const preview = await site.read('content/home-daily.json');
        archive = preview.archive;
        imageMedia = preview.media;
      } catch {
        ({archive} = await getContext());
      }
      let lastDay;
      function draw() {
        const now = new Date(), current = data.dailyFrame(archive, now);
        if (!current || current.day === lastDay) return;
        lastDay = current.day;
        const {film, frame} = current;
        const date = new Intl.DateTimeFormat('en', {day:'numeric', month:'short'}).format(now);
        const dateISO = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        // Attribution remains with the artwork metadata and the edition's
        // existing artwork-source list, without adding chrome to this card.
        const credit = frame.credit ? ` data-photo-credit="${esc(frame.credit)}"` : '';
        section.innerHTML = `<div class="screening-daily-heading"><span>Frame of the day</span><time datetime="${dateISO}">${esc(date)}</time></div>
          <a class="screening-daily-card" href="${esc(film.href)}" aria-label="Explore ${esc(film.title)} (${esc(film.year)})"><img ${imageAttrs(frame.path,'(max-width: 680px) 92vw, (min-width: 1440px) 680px, 48vw',640)} width="${frame.width}" height="${frame.height}" alt=""${credit} loading="lazy" decoding="async"><span class="screening-daily-caption"><strong>${esc(film.title)}</strong><small>${esc(film.year)}</small></span></a>`;
        const image = $('img', section);
        image.addEventListener('error', () => { image.hidden = true; });
      }
      draw();
      window.addEventListener('focus', draw);
      window.addEventListener('pageshow', draw);
      // Also handle midnight in a tab left open without changing visibility.
      setInterval(() => { if (!document.hidden) draw(); }, 60000);
    } catch {
      $('.screening-daily-loading', section).textContent = 'Today’s frame is temporarily unavailable.';
    }
  }

  function initRoom({catalog, archive}) {
    site.displayProfile(catalog);
    const activity = $('#screening-activity');
    const status = $('#content-status');
    const nav = $('.screening-navigation');
    const quizNav = $('.screening-quiz-navigation');
    const initialParams = new URLSearchParams(location.search);
    const modeParam = initialParams.get('mode');
    let mode = modeParam==='double'?'memory':Object.hasOwn(nameOfMode, modeParam) ? modeParam : 'frame';
    let lastQuiz = quizModes.has(mode) ? mode : 'frame';
    const initialCategory=modeParam==='double'?'pair':initialParams.get('category');
    const settings = {frame:{scope:'all', category:'all'},memory:{scope:'all',category:data.memoryTypes.includes(initialCategory)?initialCategory:'all'},signature:{scope:'all',category:'all'},winner:{scope:'all',category:'all'}};
    let difficulty = refinedQuestions && initialParams.get('difficulty') !== 'classic' ? 'challenge' : 'classic';
    const sessions = new Map(), quizHistory = Object.create(null);
    let activeQuizKey = '';
    let dailySession=null;
    const games=window.ArchiveScreeningGames?.make({archive,activity,data,esc,poster,imageAttrs,focusHeading});
    function getDailySession(){
      if(dailySession)return dailySession;
      const date=data.dailyDateKey();
      const questions=data.dailyQuiz(archive,date), keys=questions.map(question=>question.key);
      dailySession={date,questions,index:0,answers:[],complete:false};
      try{
        const saved=JSON.parse(localStorage.getItem(dailyStorageKey)||'null');
        if(saved?.date===date&&Array.isArray(saved.keys)&&saved.keys.length===keys.length&&saved.keys.every((key,index)=>key===keys[index])&&Array.isArray(saved.answers)){
          const answers=[];
          for(const [index,answer] of saved.answers.slice(0,questions.length).entries()){
            if(answer!==null&&!questions[index].choices.some(choice=>choice.key===answer))break;
            answers.push(answer);
          }
          dailySession.answers=answers;
          dailySession.complete=Boolean(saved.complete)&&answers.length===questions.length;
          dailySession.index=Math.max(0,Math.min(Number.isInteger(saved.index)?saved.index:0,answers.length,questions.length-1));
        }
      }catch{}
      return dailySession;
    }
    function persistDaily(session){
      try{
        localStorage.setItem(dailyStorageKey,JSON.stringify({date:session.date,keys:session.questions.map(question=>question.key),index:session.index,answers:session.answers,complete:session.complete}));
      }catch{}
    }
    function dailyBanner(session){
      return `<div class="sr-daily-banner"><strong>Daily Challenge · <time datetime="${esc(session.date)}">${esc(session.date)}</time></strong><p>Five shared questions · New challenge at midnight, Baghdad time.</p></div>`;
    }
    function syncQuizHistory() {
      try {
        const record = JSON.parse(localStorage.getItem(quizHistoryStorageKey) || '{}');
        if (record.version === 2 && record.counts && typeof record.counts === 'object') {
          for (const [key,count] of Object.entries(record.counts)) {
            if (Number.isSafeInteger(count) && count>0) quizHistory[key]=Math.max(quizHistory[key]||0,count);
          }
        }
      } catch { /* Keep the in-memory history if storage is unavailable. */ }
    }
    syncQuizHistory();
    function recordQuestion(session, question) {
      if (session.shown.has(question.key)) return;
      session.shown.add(question.key);
      syncQuizHistory();
      quizHistory[question.key]=(quizHistory[question.key]||0)+1;
      try { localStorage.setItem(quizHistoryStorageKey,JSON.stringify({version:2,counts:quizHistory})); }
      catch { /* The current browser session still avoids repeats. */ }
    }
    const matchupPairs = new Map(archive.matchups.map(pair=>[pair.id,pair]));
    let savedMatchup;
    try { savedMatchup = JSON.parse(localStorage.getItem(matchupStorageKey) || 'null'); } catch { /* in-memory play remains available */ }
    let matchupRound = data.cleanMatchupRound(archive,savedMatchup);
    let tasteCardURL='';
    let journeyId = archive.journeys.some(journey=>journey.id===initialParams.get('journey')) ? initialParams.get('journey') : '';
    const initialJourney=archive.journeys.find(item=>item.id===journeyId);
    let journeyIndex = editorialJourneys?.enabled() ? Math.max(0,initialJourney?.entries.findIndex(entry=>entry.film.slug===initialParams.get('shot')) ?? 0) : 0;
    let ballotEditionId = catalog.editions.some(item => item.id === new URLSearchParams(location.search).get('edition'))
      ? new URLSearchParams(location.search).get('edition') : catalog.featuredEdition || catalog.editions[0]?.id;
    let ballotView = 'vote', confirmClear = false, storageAvailable = true;
    let stored = {};
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (value && value.version === 1 && typeof value.editions === 'object' && value.editions) stored = value.editions;
      if (archive.ballotEditions.has(value?.lastEdition) && !new URLSearchParams(location.search).has('edition')) ballotEditionId = value.lastEdition;
    } catch { storageAvailable = false; }
    const records = Object.fromEntries([...archive.ballotEditions].map(([id, edition]) => [id, data.cleanBallot(edition, stored[id])]));

    function persistBallot() {
      try {
        localStorage.setItem(storageKey, JSON.stringify({version:1, lastEdition:ballotEditionId, editions:records}));
        storageAvailable = true;
      } catch { storageAvailable = false; }
    }

    function persistMatchup() {
      try { localStorage.setItem(matchupStorageKey,JSON.stringify(matchupRound)); } catch { /* storage is optional */ }
    }

    function releaseTasteCard() {
      if(tasteCardURL)URL.revokeObjectURL(tasteCardURL);
      tasteCardURL='';
    }

    function switchMode(next, updateURL = true) {
      if (!Object.hasOwn(nameOfMode, next)) return;
      if(mode==='matchup'&&next!=='matchup') releaseTasteCard();
      if(next==='daily'&&dailySession?.date!==data.dailyDateKey())dailySession=null;
      mode = next;
      if (quizModes.has(mode)) lastQuiz = mode;
      for (const link of $$('[data-screening-mode]', nav)) {
        if (link.dataset.screeningGroup === 'quizzes' ? quizModes.has(mode) : link.dataset.screeningMode === mode) link.setAttribute('aria-current','page');
        else link.removeAttribute('aria-current');
      }
      quizNav.hidden = !quizModes.has(mode);
      for (const link of $$('[data-screening-mode]',quizNav)) {
        if (link.dataset.screeningMode === mode) link.setAttribute('aria-current','page');
        else link.removeAttribute('aria-current');
      }
      activity.setAttribute('aria-label', nameOfMode[mode]);
      if (updateURL) {
        try {
          const url = new URL(location.href);
          url.searchParams.set('mode',mode);
          if(mode==='memory'&&settings.memory.category!=='all')url.searchParams.set('category',settings.memory.category);
          else url.searchParams.delete('category');
          if (mode !== 'ballot') url.searchParams.delete('edition');
          if (mode === 'journeys' && journeyId) url.searchParams.set('journey',journeyId);
          else url.searchParams.delete('journey');
          if (editorialJourneys?.enabled()) {
            const entry=archive.journeys.find(item=>item.id===journeyId)?.entries[journeyIndex];
            if(mode==='journeys'&&entry)url.searchParams.set('shot',entry.film.slug);else url.searchParams.delete('shot');
          }
          history.replaceState(history.state, '', url);
        } catch { /* The in-page switch also works from a restricted file URL. */ }
      }
      renderActivity();
    }

    function handleNav(event) {
      const link = event.target.closest('[data-screening-mode]');
      if (!link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const next = link.dataset.screeningGroup === 'quizzes' ? lastQuiz : link.dataset.screeningMode;
      if (mode !== next) switchMode(next);
    }
    nav.addEventListener('click',handleNav);
    quizNav.addEventListener('click',handleNav);

    function currentSession(fresh = false) {
      if(mode==='daily')return getDailySession();
      const options = settings[mode];
      const key = `${mode}/${options.scope}/${options.category}/${difficulty}`;
      if (activeQuizKey!==key) {
        sessions.clear();
        activeQuizKey=key;
      }
      if (!sessions.has(key) || fresh) {
        syncQuizHistory();
        const questions = data.makeQuiz(archive, mode, {...options,difficulty,history:quizHistory});
        sessions.set(key, {questions,index:0,answers:[],shown:new Set(),complete:false});
      }
      return sessions.get(key);
    }

    const select = (label, id, items, chosen, className = '') => `<label class="sr-field${className ? ` ${esc(className)}` : ''}" for="${id}"><span>${esc(label)}</span><span class="sr-select-wrap"><select class="sr-select" id="${id}" aria-label="${esc(label)}">${items.map(([key, text]) => `<option value="${esc(key)}"${key === chosen ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select></span></label>`;

    function quizFilters(scope) {
      const decade = select('Decade','sr-decade',[['all','All decades'],...catalog.editions.map(edition=>[edition.id,edition.period])],scope);
      if (!refinedQuestions) return decade;
      const level = select('Difficulty','sr-difficulty',[['challenge','Challenge'],['classic','Classic']],difficulty,'sr-difficulty-field');
      return `<div class="sr-quiz-filters">${decade}${level}</div>`;
    }

    function quizToolbar() {
      if(mode==='daily')return dailyBanner(getDailySession());
      const options = settings[mode];
        const categories = [['all','All'], ['dialogue','Dialogue'], ['music','Music'], ['scenes','Scenes'], ['details','Details'], ['pair','Double Feature']];
      return `<div class="sr-toolbar${mode === 'memory' ? ' sr-memory-tools' : ''}">${mode === 'memory' ? `<div class="sr-segment" role="group" aria-label="Cinema memory categories">${categories.map(([key, name]) => `<button type="button" data-memory-category="${key}" aria-pressed="${options.category === key}">${name}</button>`).join('')}</div>` : ''}${quizFilters(options.scope)}</div>`;
    }

    function progress(session) {
      return `<span class="sr-progress" role="img" aria-label="Question ${session.index+1} of ${session.questions.length}">${session.questions.map((_, index) => `<span aria-hidden="true" class="sr-progress-dot${index < session.index ? ' is-done' : index === session.index ? ' is-current' : ''}"></span>`).join('')}</span>`;
    }

    function clueMarkup(question) {
      if (mode === 'frame') return still(question.frame);
      if(question.answerKind==='pair')return `<div class="sr-pair-clue"><p class="screening-kicker">Double Feature · Two films, one thread</p><div class="sr-pair-clue-grid">${question.films.map(film=>`<figure>${film.frames[0]?namedFrame({film,frame:film.frames[0]},'',false,'(max-width: 680px) 46vw, 42vw'):poster(film)}<figcaption><strong>${esc(film.title)}</strong><small>${esc(film.year)}</small></figcaption></figure>`).join('')}</div></div>`;
      if (question.frame) return still(question.frame);
      return `<div class="sr-memory-prompt" data-quote="${Boolean(question.quote)}"><span class="sr-memory-label">${esc(question.marker)}</span><p class="sr-memory-clue">${esc(question.clue)}</p>${question.subclue ? `<p class="sr-memory-subclue">${esc(question.subclue)}</p>` : ''}</div>`;
    }

    function bindQuizToolbar() {
      $('#sr-decade', activity)?.addEventListener('change', event => {
        settings[mode].scope = event.target.value;
        renderQuiz();
        $('#sr-decade', activity)?.focus({preventScroll:true});
      });
      $('#sr-difficulty', activity)?.addEventListener('change', event => {
        const level=event.target.value;
        if (!['classic','challenge'].includes(level) || difficulty===level) return;
        difficulty=level;
        try {
          const url=new URL(location.href); url.searchParams.set('difficulty',difficulty); history.replaceState(history.state,'',url);
        } catch { /* Local file previews still switch levels in-page. */ }
        renderQuiz();
        $('#sr-difficulty', activity)?.focus({preventScroll:true});
      });
      for (const button of $$('[data-memory-category]', activity)) button.addEventListener('click', () => {
        const key = button.dataset.memoryCategory;
        if (settings[mode].category === key) return;
        settings[mode].category = key;
        if(key==='pair')settings[mode].scope='all';
        try{const url=new URL(location.href);url.searchParams.set('mode','memory');if(key==='all')url.searchParams.delete('category');else url.searchParams.set('category',key);history.replaceState(history.state,'',url);}catch{}
        renderQuiz();
        $(`[data-memory-category="${key}"]`, activity)?.focus({preventScroll:true});
      });
    }

    function renderQuiz() {
      const session = currentSession();
      if (!session.questions.length) {
        activity.innerHTML = quizToolbar() + '<p class="sr-empty">There are no questions for this selection yet. Try another decade or category.</p>';
        bindQuizToolbar();
        return;
      }
      if (session.complete) { renderQuizResults(session); return; }
      const question = session.questions[session.index];
      if(mode!=='daily')recordQuestion(session,question);
      if (question.answerKind === 'winner') { renderWinnerQuestion(session,question); return; }
      activity.innerHTML = `${mode === 'memory'||mode==='daily' ? quizToolbar() : ''}
        <div class="sr-quiz-heading"><h2 tabindex="-1" id="sr-question-title">${esc(question.prompt)}</h2><div class="sr-quiz-heading-tools">${['frame','signature'].includes(mode) ? `<div class="sr-frame-tools">${quizFilters(settings[mode].scope)}</div>` : ''}${progress(session)}</div></div>
        <div class="sr-question-grid" aria-labelledby="sr-question-title">
          ${clueMarkup(question)}
          <div>${question.frame && question.clue ? `<p class="sr-scene-clue"><small>${esc(question.marker)}</small><span>${esc(question.clue)}</span></p>` : ''}<div class="sr-answer-list" role="group" aria-label="Choose an answer">${question.choices.map(choice => `<button type="button" class="sr-answer" data-answer="${esc(choice.key)}"><span>${esc(choice.label)}</span><span class="sr-answer-state" aria-hidden="true"></span></button>`).join('')}</div>
            <div class="sr-quiz-actions"><button type="button" class="sr-text-action" data-quiz-skip>Skip</button><button type="button" class="sr-primary" data-quiz-next hidden>${session.index === session.questions.length-1 ? 'See results' : 'Next'}</button></div>
            <div class="sr-feedback" aria-live="polite" aria-atomic="true" hidden></div>
          </div>
        </div>`;
      bindStillErrors(activity);
      round2?.stageCut(activity,`quiz:${mode}:${question.key}:${session.index}`,'.sr-quiz-heading h2');
      bindQuestionControls(session);
    }

    function bindQuestionControls(session) {
      bindQuizToolbar();
      for (const button of $$('[data-answer]', activity)) button.addEventListener('click', () => answerQuestion(button.dataset.answer));
      $('[data-quiz-skip]', activity).addEventListener('click', () => answerQuestion(null));
      $('[data-quiz-next]', activity).addEventListener('click', nextQuestion);
      if (session.index < session.answers.length) showFeedback(session);
    }

    function renderWinnerQuestion(session,question) {
      const scope = mode==='daily'?'':quizFilters(settings.winner.scope);
      activity.innerHTML = `${mode==='daily'?dailyBanner(session):''}<div class="sr-winner-quiz"><div class="sr-winner-heading"><div><p class="screening-kicker">${esc(question.marker)} · ${esc(question.award.chapter)}</p><h2 tabindex="-1" id="sr-question-title">${esc(question.award.name)}</h2><p>Which did the archive choose?</p></div><div class="sr-quiz-heading-tools">${scope?`<div class="sr-frame-tools">${scope}</div>`:''}${progress(session)}</div></div>
        <div class="sr-winner-options${mode==='daily'||difficulty==='challenge'?' is-challenge':''}" role="group" aria-labelledby="sr-question-title">${question.choices.map(choice=>{
          const candidate = choice.candidate;
          return `<button type="button" class="sr-answer sr-winner-option" data-answer="${esc(choice.key)}"><span class="sr-winner-posters${candidate.films.length>1?' is-portfolio':''}">${candidate.films.slice(0,4).map(film=>poster(film)).join('')}</span><span class="sr-winner-option-copy"><strong>${esc(candidate.title)}</strong>${candidate.detail ? `<small>${esc(candidate.detail)}</small>` : ''}</span><span class="sr-answer-state" aria-hidden="true"></span></button>`;
        }).join('')}</div>
        <div class="sr-quiz-actions"><button type="button" class="sr-text-action" data-quiz-skip>Skip</button><button type="button" class="sr-primary" data-quiz-next hidden>${session.index===session.questions.length-1?'See results':'Next'}</button></div><div class="sr-feedback" aria-live="polite" aria-atomic="true" hidden></div></div>`;
      round2?.stageCut(activity,`quiz:${mode}:${question.key}:${session.index}`,'.sr-winner-heading h2');
      bindQuestionControls(session);
    }

    function answerQuestion(key) {
      const session = currentSession();
      if (session.complete || session.index < session.answers.length) return;
      const question = session.questions[session.index];
      if (key !== null && !question.choices.some(choice => choice.key === key)) return;
      session.answers.push(key);
      if(mode==='daily')persistDaily(session);
      showFeedback(session, true);
    }

    function showFeedback(session, moveFocus = false) {
      const question = session.questions[session.index];
      const answer = session.answers[session.index];
      for (const button of $$('[data-answer]', activity)) {
        const correct = button.dataset.answer === question.correct.key;
        const picked = button.dataset.answer === answer;
        button.disabled = true;
        button.classList.toggle('is-correct', correct);
        button.classList.toggle('is-incorrect', picked && !correct);
        const state = correct ? 'Correct' : picked ? 'Your pick' : '';
        $('.sr-answer-state',button).textContent = state;
        if (state) button.setAttribute('aria-label', `${question.choices.find(choice=>choice.key===button.dataset.answer)?.label || ''} — ${state}`);
      }
      const next = $('[data-quiz-next]', activity);
      next.hidden = false;
      $('[data-quiz-skip]', activity).hidden = true;
      const film = question.film;
      const references = question.award ? [question.award] : (film.wins.length ? film.wins : film.mentions).slice(0,2);
      const label = answer === question.correct.key ? 'That’s right.' : answer === null ? 'The answer' : 'Not quite.';
      const feedback = $('.sr-feedback', activity);
      feedback.hidden = false;
      if (question.answerKind === 'winner') {
        const candidate = question.candidate;
        feedback.innerHTML = `<p class="sr-feedback-kicker">${label}</p><div class="sr-winner-feedback"><div><strong>${esc(candidate.title)}</strong>${candidate.detail ? `<p>${esc(candidate.detail)}</p>` : ''}<div class="sr-feedback-links"><a href="${esc(question.award.href)}">Open award</a>${candidate.films.length===1?`<a href="${esc(film.href)}">Open film</a>`:''}</div></div></div>`;
      } else if(question.answerKind==='pair') {
        feedback.innerHTML=`<p class="sr-feedback-kicker">${label} · ${esc(question.correct.label)}</p><p class="sr-pair-explanation">${esc(question.explanation)}</p><div class="sr-feedback-links">${question.films.map(film=>`<a href="${esc(film.href)}">${esc(film.title)}</a>`).join('')}</div>`;
      } else feedback.innerHTML = `<p class="sr-feedback-kicker">${label}${answer !== question.correct.key ? ` · ${esc(question.correct.label)}` : ''}</p><div class="sr-feedback-film">${poster(film)}<div><strong>${esc(film.title)} · ${esc(film.year)}</strong>${references.length ? `<p>${film.wins.length && !question.award ? 'Awards: ' : ''}${references.map(item => esc(item.name)).join(' · ')}</p>` : ''}<div class="sr-feedback-links"><a href="${esc(film.href)}">Open film</a>${question.award ? `<a href="${esc(question.award.href)}">The award</a>` : ''}${question.listening ? `<a href="${esc(question.listening.url)}" target="_blank" rel="noopener noreferrer">${esc(question.listening.label || 'Listen')}</a>` : ''}</div></div></div>`;
      if (moveFocus) next.focus({preventScroll:true});
    }

    function nextQuestion() {
      const session = currentSession();
      if (session.index >= session.answers.length) return;
      if (session.index >= session.questions.length-1) session.complete = true;
      else session.index++;
      if(mode==='daily')persistDaily(session);
      renderQuiz();
      focusHeading(activity);
    }

    function renderQuizResults(session) {
      const count = session.questions.filter((question,index) => question.correct.key === session.answers[index]).length;
      const daily=mode==='daily';
      activity.innerHTML = `${quizToolbar()}<div class="sr-results-header"><div><span class="screening-kicker">${nameOfMode[mode]}${!daily&&refinedQuestions?' · '+(difficulty==='challenge'?'Challenge':'Classic'):''}</span><h2 tabindex="-1">${count} of ${session.questions.length}.</h2><p>${daily?'Today’s screening is complete. Come back tomorrow.':'A little more of the archive to remember.'}</p></div><div class="sr-result-actions"><p id="sr-result-save-status" role="status"></p><button type="button" class="${daily?'sr-primary':'sr-secondary'}" data-quiz-download><svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M10 2v11m-4-4 4 4 4-4M3 14v3h14v-3" stroke-linecap="round" stroke-linejoin="round"/></svg>Download result</button>${daily?'':'<button type="button" class="sr-primary" data-quiz-replay>Play again</button>'}</div></div><ol class="sr-result-list">${session.questions.map((question,index) => {
        const picked = question.choices.find(choice => choice.key === session.answers[index]);
        const match = question.correct.key === session.answers[index];
        if (question.answerKind === 'winner') return `<li>${poster(question.film)}<div><strong><a href="${esc(question.award.href)}">${esc(question.award.name)}</a></strong><p>${esc(question.correct.label)} · ${esc(question.marker)}${!match && picked?` · You chose ${esc(picked.label)}`:''}</p></div><span class="sr-result-status${match?' is-match':''}">${match?'Correct':picked?'Missed':'Skipped'}</span></li>`;
        if(question.answerKind==='pair')return `<li>${poster(question.film)}<div><strong>${question.films.map(film=>`<a href="${esc(film.href)}">${esc(film.title)}</a>`).join(' &amp; ')}</strong><p>${esc(question.correct.label)}${!match&&picked?` · You chose ${esc(picked.label)}`:''}</p></div><span class="sr-result-status${match?' is-match':''}">${match?'Correct':picked?'Missed':'Skipped'}</span></li>`;
        return `<li>${poster(question.film)}<div><strong><a href="${esc(question.film.href)}">${esc(question.film.title)}</a></strong><p>${['composer','detail','credit'].includes(question.answerKind) ? `${esc(question.correct.label)}${!match && picked ? ` · You chose ${esc(picked.label)}` : ''}` : !match && picked ? `You chose ${esc(picked.label)}` : `${esc(question.film.year)}`}</p></div><span class="sr-result-status${match ? ' is-match' : ''}">${match ? 'Correct' : picked ? 'Missed' : 'Skipped'}</span></li>`;
      }).join('')}</ol>`;
      bindQuizToolbar();
      $('[data-quiz-replay]',activity)?.addEventListener('click', () => { currentSession(true); renderQuiz(); focusHeading(activity); });
      $('[data-quiz-download]',activity)?.addEventListener('click',async event=>{
        const button=event.currentTarget,status=$('#sr-result-save-status',activity), quizName=nameOfMode[mode];
        button.disabled=true;status.textContent='Preparing image…';
        try{
          const blob=await createQuizResultCard(session,quizName,daily?'Daily Challenge':difficulty==='challenge'?'Challenge':'Classic');
          const url=URL.createObjectURL(blob);
          const anchor=document.createElement('a');anchor.href=url;anchor.download=daily?`TS-Archive-Daily-${session.date}.png`:`TS-Archive-${quizName.replace(/\s+/g,'-')}-Result.png`;document.body.append(anchor);anchor.click();anchor.remove();
          setTimeout(()=>URL.revokeObjectURL(url),3000);status.textContent='Image ready.';
        }catch{status.textContent='Could not save the image. Please try again.';}
        finally{button.disabled=false;}
      });
    }

    function edition() { return archive.ballotEditions.get(ballotEditionId) || archive.ballotEditions.values().next().value; }
    function record() { return records[edition().id]; }
    function ballotToolbar(current, count, review) {
      return `<div class="sr-ballot-toolbar"><div class="sr-segment" role="group" aria-label="Ballot edition">${[...archive.ballotEditions.values()].map(item => `<button type="button" data-ballot-edition="${esc(item.id)}" aria-pressed="${item.id === current.id}">${esc(item.period)}</button>`).join('')}</div><div><span class="sr-ballot-count" aria-live="polite">${count} of ${current.awards.length} picked</span>${!review ? `<button type="button" class="sr-secondary" data-ballot-review${count ? '' : ' disabled'}>Review picks</button>` : ''}</div></div>`;
    }

    function candidateMarkup(candidate, current) {
      return `<button type="button" class="sr-ballot-choice" data-ballot-pick="${esc(candidate.key)}" aria-pressed="${current === candidate.key}"><span class="sr-ballot-posters${candidate.films.length > 1 ? ' is-portfolio' : ''}">${candidate.films.slice(0,4).map(film => poster(film,'sr-ballot-poster')).join('') || '<span class="sr-ballot-poster sr-poster-placeholder" aria-hidden="true"></span>'}</span><span class="sr-ballot-entry"><strong>${esc(candidate.title)}</strong>${candidate.detail ? `<small>${esc(candidate.detail)}</small>` : ''}</span><span class="sr-pick-radio" aria-hidden="true"></span></button>`;
    }

    function bindEditionButtons() {
      for (const button of $$('[data-ballot-edition]',activity)) button.addEventListener('click', () => {
        const next = button.dataset.ballotEdition;
        if (!archive.ballotEditions.has(next) || ballotEditionId === next) return;
        ballotEditionId = next;
        ballotView = 'vote'; confirmClear = false;
        persistBallot();
        renderBallot();
        $(`[data-ballot-edition="${next}"]`,activity)?.focus({preventScroll:true});
      });
    }

    function renderBallot() {
      const current = edition(), saved = record();
      if (!current || !saved || !current.awards.length) { activity.innerHTML = '<p class="sr-empty">There are no alternate ballot categories in this edition yet.</p>'; return; }
      if (ballotView === 'review') { renderBallotReview(current,saved); return; }
      let index = current.awards.findIndex(award => award.id === saved.cursor);
      if (index < 0) index = 0;
      const award = current.awards[index];
      const voted = saved.votes[award.id];
      const count = Object.keys(saved.votes).length;
      activity.innerHTML = `<div class="sr-ballot" data-decade="${current.id.slice(0,4)}">${ballotToolbar(current,count,false)}
        <div class="sr-ballot-heading"><div><p class="screening-kicker">${esc(award.chapter || 'The awards')}</p><h2 tabindex="-1">${esc(award.name)}</h2></div>${select('Category','sr-ballot-category',current.awards.map(item => [item.id, item.name + (saved.votes[item.id] ? ' · Picked' : '')]),award.id)}</div>
        <div class="sr-ballot-grid" role="group" aria-label="Choose your winner">${award.candidates.map(candidate => candidateMarkup(candidate,voted)).join('')}</div>
        <div class="sr-ballot-actions"><button type="button" class="sr-secondary" data-ballot-prev${index ? '' : ' disabled'}>Previous</button><div><button type="button" class="sr-text-action" data-ballot-remove hidden>Clear choice</button><button type="button" class="sr-primary" data-ballot-next>${index === current.awards.length-1 ? 'Review ballot' : voted ? 'Next' : 'Skip'}</button></div></div>
        <p class="sr-ballot-note">${storageAvailable ? 'Your choices are stored on this device only.' : 'Your choices are kept for this visit.'} The archive’s original picks remain unchanged.</p></div>`;
      bindEditionButtons();
      $('#sr-ballot-category',activity).addEventListener('change',event => {
        saved.cursor = event.target.value; persistBallot(); renderBallot(); $('#sr-ballot-category',activity)?.focus({preventScroll:true});
      });
      function setPick(key) {
        if (key && !award.candidates.some(candidate => candidate.key === key)) return;
        if (key) saved.votes[award.id] = key;
        else delete saved.votes[award.id];
        persistBallot();
        refreshBallotPick();
      }
      function refreshBallotPick() {
        const pick = saved.votes[award.id];
        for (const button of $$('[data-ballot-pick]',activity)) button.setAttribute('aria-pressed',String(button.dataset.ballotPick === pick));
        const number = Object.keys(saved.votes).length;
        $('.sr-ballot-count',activity).textContent = `${number} of ${current.awards.length} picked`;
        $('[data-ballot-review]',activity).disabled = !number;
        $('[data-ballot-remove]',activity).hidden = !pick;
        if (index !== current.awards.length-1) $('[data-ballot-next]',activity).textContent = pick ? 'Next' : 'Skip';
        const selected = $('#sr-ballot-category',activity).selectedOptions[0];
        selected.textContent = award.name + (pick ? ' · Picked' : '');
        $('.sr-ballot-note',activity).textContent = `${storageAvailable ? 'Your choices are stored on this device only.' : 'Your choices are kept for this visit.'} The archive’s original picks remain unchanged.`;
      }
      for (const button of $$('[data-ballot-pick]',activity)) button.addEventListener('click',() => setPick(button.dataset.ballotPick));
      $('[data-ballot-remove]',activity).addEventListener('click',() => setPick(null));
      const review = () => { ballotView = 'review'; confirmClear = false; persistBallot(); renderBallot(); focusHeading(activity); };
      $('[data-ballot-review]',activity).addEventListener('click',review);
      $('[data-ballot-prev]',activity).addEventListener('click',() => { if (index > 0) { saved.cursor = current.awards[index-1].id; persistBallot(); renderBallot(); focusHeading(activity); } });
      $('[data-ballot-next]',activity).addEventListener('click',() => {
        if (index >= current.awards.length-1) review();
        else { saved.cursor = current.awards[index+1].id; persistBallot(); renderBallot(); focusHeading(activity); }
      });
      refreshBallotPick();
    }

    function summaryPick(candidate, label) {
      return `<div><span class="sr-summary-mobile-label">${label}</span><div class="sr-summary-pick">${poster(candidate.films[0])}<div><strong>${esc(candidate.title)}</strong>${candidate.detail ? `<small>${esc(candidate.detail)}</small>` : ''}</div></div></div>`;
    }

    function renderBallotReview(current,saved) {
      const summary = data.ballotSummary(current, saved);
      activity.innerHTML = `<div class="sr-ballot" data-decade="${current.id.slice(0,4)}">${ballotToolbar(current,summary.total,true)}
        <div class="sr-results-header"><div><p class="screening-kicker">${esc(current.period)} · The alternate ballot</p><h2 tabindex="-1">Your ballot.</h2><p>${summary.total ? `${summary.total} ${summary.total === 1 ? 'choice' : 'choices'} · ${summary.matches} shared with the archive` : 'You haven’t made any choices yet.'}</p></div><button type="button" class="sr-secondary" data-ballot-edit>${summary.total ? 'Edit choices' : 'Start choosing'}</button></div>
        ${summary.total ? `<div class="sr-ballot-summary" aria-label="Your choices compared with the archive"><div class="sr-summary-heading"><span>Category</span><span>Your choice</span><span>Archive choice</span></div>${summary.rows.map(({award,picked,archive:original,match}) => `<div class="sr-summary-row"><a class="sr-summary-category" href="${esc(award.href)}">${esc(award.name)}${match ? '<span class="sr-summary-match">Same choice</span>' : ''}</a>${summaryPick(picked,'Your choice')}${summaryPick(original,'Archive choice')}</div>`).join('')}</div>
        <div class="sr-summary-actions"><button type="button" class="sr-primary" data-ballot-download title="Save only your picks with film posters">Save my ballot</button><button type="button" class="sr-text-action" data-ballot-reset>${confirmClear ? 'Keep choices' : 'Clear choices'}</button><p class="sr-download-status" role="status" hidden></p></div>${confirmClear ? `<div class="sr-reset-confirm"><span>Clear your picks for ${esc(current.period)}?</span><button type="button" class="sr-secondary" data-ballot-confirm-clear>Clear this ballot</button></div>` : ''}` : ''}</div>`;
      bindEditionButtons();
      $('[data-ballot-edit]',activity).addEventListener('click',() => { ballotView = 'vote'; confirmClear = false; renderBallot(); focusHeading(activity); });
      $('[data-ballot-reset]',activity)?.addEventListener('click',() => { confirmClear = !confirmClear; renderBallot(); $('[data-ballot-reset]',activity)?.focus({preventScroll:true}); });
      $('[data-ballot-confirm-clear]',activity)?.addEventListener('click',() => {
        records[current.id] = data.cleanBallot(current,null); persistBallot(); ballotView = 'vote'; confirmClear = false; renderBallot(); focusHeading(activity);
      });
      const save = $('[data-ballot-download]',activity);
      save?.addEventListener('click', async () => {
        const message = $('.sr-download-status',activity);
        save.disabled = true;
        message.hidden = false; message.textContent = 'Preparing your image…';
        try {
          const blob = await createBallotCard(current,summary);
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url; link.download = `TS-Archive-My-Ballot-${current.id}.png`;
          document.body.append(link); link.click(); link.remove();
          setTimeout(() => URL.revokeObjectURL(url),15000);
          message.textContent = 'Your ballot image, with your choices only, is ready to share.';
        } catch { message.textContent = 'The image could not be saved. Please try again.'; }
        finally { save.disabled = false; }
      });
    }

    function namedFrame(entry, className = '', lazy = false, sizes = lazy ? '(max-width: 680px) 46vw, 320px' : '(max-width: 680px) 94vw, (min-width: 1440px) 1050px, 84vw') {
      const {film,frame} = entry;
      return `<img class="${className}" ${imageAttrs(frame.path,sizes,lazy?320:960)} width="${frame.width}" height="${frame.height}" alt="${esc(film.title)}" loading="${lazy?'lazy':'eager'}" decoding="async"${lazy?'':' fetchpriority="high"'}>`;
    }

    function renderMatchup() {
      if (matchupRound.complete) { renderMatchupResults(); return; }
      const {index,order,choices}=matchupRound, pair=matchupPairs.get(order[index]);
      if (!pair) { activity.innerHTML='<p class="sr-empty">More cinematic matchups are coming.</p>'; return; }
      const chosen=choices[pair.id];
      const last=index===order.length-1;
      activity.innerHTML = `<div class="sr-matchup"><div class="sr-matchup-heading"><div><p class="screening-kicker">${esc(pair.theme)}</p><h2 tabindex="-1">${esc(pair.prompt)}</h2></div><div class="sr-matchup-meta"><span>${refinedQuestions?'No right answer.':'No right answer. Just your cinema.'}</span><div class="sr-matchup-progress" role="progressbar" aria-label="Matchup progress" aria-valuemin="1" aria-valuemax="${order.length}" aria-valuenow="${index+1}"><span>Pair ${index+1} of ${order.length}</span><span class="sr-matchup-progress-track" aria-hidden="true"><span style="--progress:${100*(index+1)/order.length}%"></span></span></div></div></div>
        <div class="sr-match-grid" role="group" aria-label="Choose between two films">${pair.entries.map(entry=>`<button type="button" class="sr-match-choice" data-match-choice="${esc(entry.film.key)}" aria-pressed="${chosen===entry.film.key}"><span class="sr-match-image">${namedFrame(entry,'',false,'(max-width: 680px) 94vw, 45vw')}</span><span class="sr-match-copy"><span><strong>${esc(entry.film.title)}</strong><small>${esc(entry.film.year)}</small></span><span class="sr-match-mark" aria-hidden="true"></span></span></button>`).join('')}</div>
        <div class="sr-match-footer"><button type="button" class="sr-secondary" data-match-prev${index===0?' disabled':''}>Previous</button><div class="sr-match-response" aria-live="polite" hidden></div><div class="sr-match-buttons"><button type="button" class="sr-text-action" data-match-finish hidden>Finish round</button><button type="button" class="sr-primary" data-match-next>${last?'See my results':'Skip'}</button></div></div>
        <p class="sr-match-note">${refinedQuestions?'Skip any pair if you prefer.':'Your choices shape a cinematic taste profile. Skip any pair if you prefer.'}</p></div>`;
      function updateChoice() {
        const selected = choices[pair.id];
        for (const button of $$('[data-match-choice]',activity)) button.setAttribute('aria-pressed',String(button.dataset.matchChoice===selected));
        const response = $('.sr-match-response',activity);
        const film = pair.entries.find(entry=>entry.film.key===selected)?.film;
        response.hidden = !film;
        if (film) response.innerHTML = refinedQuestions ? `<span>Selected · <strong>${esc(film.title)}</strong></span><div class="sr-feedback-links"><a href="${esc(film.href)}">Open film</a></div>` : `<span>Your choice: <strong>${esc(film.title)}</strong></span><div class="sr-feedback-links">${pair.entries.map(entry=>`<a href="${esc(entry.film.href)}">${esc(entry.film.title)}</a>`).join('')}</div>`;
        $('[data-match-next]',activity).textContent = last ? 'See my results' : film?'Next matchup':'Skip';
        $('[data-match-finish]',activity).hidden = last || Object.keys(choices).length<4;
      }
      for (const button of $$('[data-match-choice]',activity)) button.addEventListener('click',()=>{
        const key=button.dataset.matchChoice;
        if (choices[pair.id]===key) delete choices[pair.id]; else choices[pair.id]=key;
        persistMatchup();updateChoice();
      });
      $('[data-match-prev]',activity).addEventListener('click',()=>{if(index>0){matchupRound.index--;persistMatchup();renderMatchup();focusHeading(activity);}});
      const finish=()=>{matchupRound.complete=true;persistMatchup();renderMatchupResults();focusHeading(activity);};
      $('[data-match-finish]',activity).addEventListener('click',finish);
      $('[data-match-next]',activity).addEventListener('click',()=>{
        if (last) {finish();return;}
        matchupRound.index++;persistMatchup();
        renderMatchup();focusHeading(activity);
      });
      updateChoice();
      round2?.stageCut(activity,`matchup:${pair.id}:${index}`,'.sr-matchup-heading h2');
    }

    function renderMatchupResults() {
      releaseTasteCard();
      const summary=data.matchupSummary(archive,matchupRound);
      const {profile, representative, traits, picks, recommendations, total, eligible}=summary;
      if (!profile) {
        activity.innerHTML=`<div class="sr-results-header"><div><p class="screening-kicker">This or That</p><h2 tabindex="-1">Your cinema awaits.</h2><p>You skipped every pairing. Make a few choices to discover your cinematic taste.</p></div><button type="button" class="sr-primary" data-taste-review>Return to the pairings</button></div>`;
      } else {
        const film=representative.film,frame=representative.frame;
        activity.innerHTML=`<article class="sr-taste-result" aria-label="Your cinematic taste">
          <div class="sr-taste-hero"><div class="sr-taste-hero-art" aria-hidden="true"><img ${imageAttrs(frame.path,'(max-width: 680px) 94vw, 920px',960)} width="${frame.width}" height="${frame.height}" alt=""></div><div class="sr-taste-hero-copy"><p class="screening-kicker">Your cinematic taste · ${total} ${total===1?'choice':'choices'}</p><h2 tabindex="-1">${esc(profile.title)}.</h2><p>${total<4?'A first impression. ':''}${esc(profile.description)}</p><div class="sr-taste-signature">${traits.map(trait=>`<span>${esc(trait.label)}</span>`).join('')}</div></div><a class="sr-taste-cover-credit" href="${esc(film.href)}">${esc(film.title)} · ${esc(film.year)}</a></div>
          <div class="sr-taste-actions"><button type="button" class="sr-primary" data-taste-download aria-controls="sr-taste-export" aria-expanded="false">Save my taste card</button><button type="button" class="sr-secondary" data-taste-review>Review choices</button><button type="button" class="sr-text-action" data-taste-restart>Start another round</button><p class="sr-download-status" role="status" hidden></p></div>
          <section class="sr-taste-export" id="sr-taste-export" aria-label="Your shareable taste card" hidden><img alt="Your shareable cinematic taste card"><div><h3>Take your cinema with you.</h3><p>Your taste profile and every film you picked, with its poster.</p><a class="sr-primary" download="TS-Archive-My-Cinematic-Taste.png">Download PNG</a><button type="button" class="sr-text-action" data-taste-close>Close preview</button></div></section>
          <section class="sr-taste-section"><div class="sr-taste-section-heading"><h3>What stays with you.</h3><p>A reading of the films you picked.</p></div><div class="sr-taste-traits">${traits.map(trait=>`<div class="sr-taste-trait"><a href="${esc(trait.evidence.film.href)}" aria-label="Open ${esc(trait.evidence.film.title)}">${poster(trait.evidence.film)}</a><div><strong>${esc(trait.label)}</strong><p>${esc(trait.evidence.taste.note)}</p><small>In your choices: <a href="${esc(trait.evidence.film.href)}">${esc(trait.evidence.film.title)}</a></small></div></div>`).join('')}</div></section>
          ${recommendations.length?`<section class="sr-taste-section"><div class="sr-taste-section-heading"><h3>For your watchlist.</h3><p>Other films from the archive, inspired by your taste.</p></div><div class="sr-taste-recommendations">${recommendations.map(({film:recommended,trait,note,evidence})=>`<a class="sr-taste-recommendation" href="${esc(recommended.href)}">${poster(recommended)}<div><span class="sr-taste-rec-label">${esc(trait.label)}</span><strong>${esc(recommended.title)}</strong><small>${esc(recommended.year)}</small><p>${esc(note || evidence.join(' · ') || trait.short)}</p></div></a>`).join('')}</div></section>`:''}
          <details class="sr-taste-picks"${total<=4?' open':''}><summary><span>Your selections <small>${total}</small></span>${chevron(1)}</summary><div class="sr-taste-picked-grid">${picks.map(pick=>`<a href="${esc(pick.film.href)}" class="sr-taste-pick">${poster(pick.film)}<div><strong>${esc(pick.film.title)}</strong><small>${esc(pick.film.year)} · ${esc(pick.pair.theme)}</small></div></a>`).join('')}</div></details>
          <p class="sr-match-note">A playful reading of ${total} ${total===1?'selection':'selections'} from ${eligible} pairings — not a personality test. Your choices stay on this device.</p></article>`;
      }
      $('[data-taste-review]',activity)?.addEventListener('click',()=>{releaseTasteCard();matchupRound.complete=false;matchupRound.index=0;persistMatchup();renderMatchup();focusHeading(activity);});
      $('[data-taste-restart]',activity)?.addEventListener('click',()=>{releaseTasteCard();matchupRound=data.cleanMatchupRound(archive,null,Math.random,false);persistMatchup();renderMatchup();focusHeading(activity);});
      const save=$('[data-taste-download]',activity);
      save?.addEventListener('click',async()=>{
        const message=$('.sr-download-status',activity);
        const panel=$('#sr-taste-export',activity);
        if(tasteCardURL){panel.hidden=false;save.setAttribute('aria-expanded','true');return;}
        save.disabled=true;message.hidden=false;message.textContent='Preparing your image…';
        try {
          const blob=await createTasteCard(summary);
          if(!save.isConnected)return;
          tasteCardURL=URL.createObjectURL(blob);
          $('img',panel).src=tasteCardURL;
          $('a[download]',panel).href=tasteCardURL;
          panel.hidden=false;save.setAttribute('aria-expanded','true');
          message.textContent='Your taste card is ready. Download the PNG below.';
        } catch {message.textContent='Your card could not be prepared. Please try again.';}
        finally {save.disabled=false;}
      });
      $('[data-taste-close]',activity)?.addEventListener('click',()=>{$('#sr-taste-export',activity).hidden=true;save.setAttribute('aria-expanded','false');$('.sr-download-status',activity).hidden=true;save.focus({preventScroll:true});});
    }

    const chevron = direction => `<svg viewBox="0 0 20 20" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${direction<0?'M12.5 4.5 7 10l5.5 5.5':'M7.5 4.5 13 10l-5.5 5.5'}"/></svg>`;

    function updateJourneyLocation() {
      try {
        const url=new URL(location.href);
        if(journeyId)url.searchParams.set('journey',journeyId);else url.searchParams.delete('journey');
        if(editorialJourneys?.enabled()) {
          const entry=archive.journeys.find(item=>item.id===journeyId)?.entries[journeyIndex];
          if(entry)url.searchParams.set('shot',entry.film.slug);else url.searchParams.delete('shot');
        }
        history.replaceState(history.state,'',url);
      } catch {}
    }

    function renderJourneys(fade = false, restoreFocus = '') {
      const journey = archive.journeys.find(item=>item.id===journeyId);
      const curated=editorialJourneys?.enabled();
      document.body.classList.toggle('ts-journey-active',Boolean(curated&&journey));
      if (!journey) {
        activity.innerHTML = `<div class="sr-journey-intro"><h2 tabindex="-1">Film journeys.</h2><p>${curated?'Visual essays, told through films from both decades.':'Follow a visual thread through the archive.'}</p></div><div class="sr-journey-grid${curated?' ts-journey-grid':''}">${archive.journeys.map(item=>`<button type="button" class="sr-journey-tile" data-open-journey="${esc(item.id)}"><span class="sr-journey-cover">${namedFrame(item.entries[0],'',true)}${curated?`<span class="ts-journey-lens">${esc(item.lens||'Visual journey')}</span>`:''}</span><span class="sr-journey-tile-copy"><strong>${esc(item.title)}</strong><small>${esc(item.description)}</small><span>${item.entries.length} films</span></span></button>`).join('')}</div>`;
        for (const button of $$('[data-open-journey]',activity)) button.addEventListener('click',()=>{journeyId=button.dataset.openJourney;journeyIndex=0;updateJourneyLocation();renderJourneys();focusHeading(activity);});
        if(restoreFocus)$(restoreFocus,activity)?.focus({preventScroll:true});
        return;
      }
      journeyIndex=Math.max(0,Math.min(journey.entries.length-1,journeyIndex));
      const entry=journey.entries[journeyIndex];
      const back='<button type="button" class="sr-text-action" data-journey-back>All journeys</button>';
      const controls=`<div class="sr-journey-nav"><button type="button" class="sr-journey-control" data-journey-step="-1" aria-label="Previous film" title="Previous film"${journeyIndex===0?' disabled':''}>${chevron(-1)}</button><button type="button" class="sr-journey-control" data-journey-step="1" aria-label="Next film" title="Next film"${journeyIndex===journey.entries.length-1?' disabled':''}>${chevron(1)}</button></div>`;
      if(curated){
        const filmHref=esc(editorialJourneys.filmHref(journey,entry));
        const titleLink=round2?.enabled('15')?`<a class="ts-journey-title-link" href="${filmHref}" title="Open ${esc(entry.film.title)}">${esc(entry.film.title)}</a>`:esc(entry.film.title);
        const filmAction=round2?.enabled('15')?'':`<a href="${filmHref}" class="ts-journey-film-link">Film file <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="2.5" width="13" height="15" rx="1.5"/><path d="M7 7h6M7 10h6M7 13h4"/></svg></a>`;
        activity.innerHTML=`<div class="sr-journey-detail ts-journey-detail"><div class="sr-journey-heading ts-journey-heading"><div>${back}<h2 tabindex="-1">${esc(journey.title)}</h2><p>${esc(journey.description)}</p></div><span class="ts-journey-topic">${esc(journey.lens||'Visual journey')}</span></div>
          <div class="sr-journey-stage${fade?' sr-journey-fade':''}" aria-label="${esc(entry.film.title)} still">${namedFrame(entry)}</div>
          <div class="ts-journey-reading"><div class="ts-journey-reading-copy"><div><h3 lang="en">${titleLink}</h3><span>${esc(entry.film.year)}</span></div><p>${esc(entry.editorialNote||journey.description)}</p></div><div class="ts-journey-actions">${filmAction}${controls}</div></div>
          <div class="sr-journey-reel ts-journey-reel" role="group" aria-label="Films in this journey">${journey.entries.map((item,index)=>`<button type="button" data-journey-frame="${index}" aria-label="${esc(item.film.title)}" title="${esc(item.film.title)}" aria-pressed="${journeyIndex===index}"><span class="ts-journey-thumb">${namedFrame(item,'',true)}</span><span class="ts-journey-thumb-title">${esc(item.film.title)}</span></button>`).join('')}</div>
          <div class="ts-journey-foot"><a href="index.html?topic=${encodeURIComponent(journey.mood||'Atmosphere')}#moods">Explore ${esc(journey.mood||'Atmosphere')} in the archive</a><span>${journey.entries.length} films · ${esc(journey.lens||'Visual journey')}</span></div></div>`;
      }else activity.innerHTML=`<div class="sr-journey-detail"><div class="sr-journey-heading"><div>${back}<h2 tabindex="-1">${esc(journey.title)}</h2><p>${esc(journey.description)}</p></div></div>
        <div class="sr-journey-stage${fade?' sr-journey-fade':''}" aria-label="${esc(entry.film.title)} still">${namedFrame(entry)}</div>
        <div class="sr-journey-caption"><div><strong>${esc(entry.film.title)}</strong><small>${esc(entry.film.year)}</small><a href="${esc(entry.film.href)}">Open film</a></div>${controls}</div>
        <div class="sr-journey-reel" role="group" aria-label="Films in this journey">${journey.entries.map((item,index)=>`<button type="button" data-journey-frame="${index}" aria-label="${esc(item.film.title)}" title="${esc(item.film.title)}" aria-pressed="${journeyIndex===index}">${namedFrame(item,'',true)}</button>`).join('')}</div></div>`;
      $('[data-journey-back]',activity).addEventListener('click',()=>{const previous=journeyId;journeyId='';journeyIndex=0;updateJourneyLocation();renderJourneys(false,curated?`[data-open-journey="${previous}"]`:'');if(!curated)focusHeading(activity);});
      for(const button of $$('[data-journey-step]',activity)) button.addEventListener('click',()=>stepJourney(Number(button.dataset.journeyStep),`[data-journey-step="${button.dataset.journeyStep}"]`));
      for(const button of $$('[data-journey-frame]',activity)) button.addEventListener('click',()=>{
        const next=Number(button.dataset.journeyFrame);if(next!==journeyIndex){journeyIndex=next;if(curated)updateJourneyLocation();renderJourneys(true,`[data-journey-frame="${next}"]`);}
      });
      if(restoreFocus) $(restoreFocus,activity)?.focus({preventScroll:true});
      if(curated){
        const rail=$('.ts-journey-reel',activity),selected=$('[data-journey-frame][aria-pressed="true"]',rail);
        if(selected&&rail.scrollWidth>rail.clientWidth){const a=selected.getBoundingClientRect(),b=rail.getBoundingClientRect();if(a.right>b.right)rail.scrollLeft+=a.right-b.right+4;else if(a.left<b.left)rail.scrollLeft+=a.left-b.left-4;}
      }
      const stage=$('.sr-journey-stage',activity);
      const fileLink=$('.ts-journey-title-link, .ts-journey-film-link, .sr-journey-caption a',activity);
      if(fileLink)window.ArchiveContinuity?.prefetch(fileLink.href,fileLink);
      let touch;
      stage.addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY,id:event.touches[0].identifier}:null;},{passive:true});
      stage.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
      stage.addEventListener('touchend',event=>{const start=touch;touch=null;const end=start&&[...event.changedTouches].find(item=>item.identifier===start.id);if(!end)return;const x=end.clientX-start.x,y=end.clientY-start.y;if(Math.abs(x)>=45&&Math.abs(x)>Math.abs(y)*1.4)stepJourney(x<0?1:-1);},{passive:true});
      const next=journey.entries[journeyIndex+1];
      if(next&&!navigator.connection?.saveData){const displayWidth=Math.min(innerWidth*.84,1050);asset.preload(asset.select(imageMedia,next.frame.path,displayWidth).src,'low');}
    }

    function stepJourney(direction,restoreFocus='') {
      const journey=archive.journeys.find(item=>item.id===journeyId);
      const next=journeyIndex+direction;
      if(!journey||next<0||next>=journey.entries.length)return;
      journeyIndex=next;
      if(editorialJourneys?.enabled())updateJourneyLocation();
      renderJourneys(true,restoreFocus);
    }

    function renderActivity() {
      if(mode!=='journeys')document.body.classList.remove('ts-journey-active');
      if (mode === 'ballot') renderBallot();
      else if (mode === 'matchup') renderMatchup();
      else if (mode === 'journeys') renderJourneys();
      else if (mode === 'editor'||mode === 'connections') {
        if(!games)activity.innerHTML='<p class="sr-empty">This activity could not be loaded. Refresh to try again.</p>';
        else if(mode==='editor')games.renderEditor();
        else games.renderConnections();
      }
      else renderQuiz();
    }

    // Native buttons and selects work with keyboard and touch. For quick play,
    // number keys choose the three answers without affecting the existing Index.
    document.addEventListener('keydown',event => {
      if (mode === 'ballot' || event.repeat || event.ctrlKey || event.metaKey || event.altKey || $('dialog[open]') || event.target.closest?.('input,textarea,select,[contenteditable="true"]')) return;
      if (mode==='journeys'&&journeyId&&['ArrowLeft','ArrowRight'].includes(event.key)) {event.preventDefault();const direction=event.key==='ArrowRight'?1:-1;const onThumb=event.target.closest?.('[data-journey-frame]');stepJourney(direction,onThumb?`[data-journey-frame="${journeyIndex+direction}"]`:'');return;}
      if((['frame','memory','signature','winner','daily','matchup'].includes(mode))&&['1','2','3','4'].includes(event.key)) {
        const button = $$(mode==='matchup'?'[data-match-choice]':'[data-answer]',activity)[Number(event.key)-1];
        if (button && !button.disabled) { event.preventDefault(); button.click(); }
      }
    });

    status.hidden = true;
    activity.hidden = false;
    switchMode(mode,false);
    window.ArchiveContinuity?.register('screening',()=>true,()=>{});
  }

  async function loadPosterArt(paths) {
    const posterPaths=[...new Set(paths.filter(Boolean))];
    const loaded=await Promise.all(posterPaths.map(path=>new Promise(resolve=>{
      const src=path;
      if(!src){resolve([path,null]);return;}
      const img=new Image();
      img.onload=()=>resolve([path,img]);img.onerror=()=>resolve([path,null]);img.src=src;
    })));
    return new Map(loaded);
  }

  async function createQuizResultCard(session,title,level) {
    try{await document.fonts.ready;await document.fonts.load('600 80px "Barlow Condensed"');await document.fonts.load('400 146px "Instrument Serif"');}catch{}
    const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
    const bg='#1d1a17',fg='#f6ede1',accent='#c9af8f',muted='#bab1a5',pad=66;
    const cover='assets/gallery/2020-2026/drive-my-car/fa1f2432ebf0.webp';
    const art=(await loadPosterArt([cover])).get(cover);
    ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1080);
    if(art){
      const height=515,ratio=Math.max(1080/art.naturalWidth,height/art.naturalHeight),w=art.naturalWidth*ratio,h=art.naturalHeight*ratio;
      ctx.save();ctx.beginPath();ctx.rect(0,0,1080,height);ctx.clip();
      ctx.drawImage(art,(1080-w)/2,(height-h)/2,w,h);ctx.restore();
      const fade=ctx.createLinearGradient(0,0,0,height);
      fade.addColorStop(0,'#1d1a1770');fade.addColorStop(.48,'#1d1a1720');fade.addColorStop(.77,'#1d1a17a0');fade.addColorStop(1,bg);
      ctx.fillStyle=fade;ctx.fillRect(0,0,1080,height);
    }
    const text=(value,x,y,size,color=fg,family='DM Sans',weight=500)=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px "${family}", Arial, sans-serif`;ctx.fillText(value,x,y);};
    const rule=y=>{ctx.strokeStyle='#51483d';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(1080-pad,y);ctx.stroke();};
    text('THE T.S. ARCHIVE',pad,80,35,fg,'Barlow Condensed',700);
    text('CINEMA LAB',pad,385,24,accent,'DM Sans',600);
    text(title,pad,460,77,fg,'Barlow Condensed',600);
    const results=session.questions.map((question,index)=>question.correct.key===session.answers[index]?'correct':session.answers[index]===null?'skipped':'missed');
    const score=results.filter(result=>result==='correct').length;
    rule(505);
    text(String(score),pad,690,168,fg,'Instrument Serif',400);
    const scoreWidth=ctx.measureText(String(score)).width;
    text('/ '+session.questions.length,pad+scoreWidth+26,685,76,accent,'Instrument Serif',400);
    text(session.date||level,pad,739,28,muted);
    const gap=17,box=(1080-2*pad-(results.length-1)*gap)/results.length,start=pad;
    results.forEach((result,index)=>{
      const x=start+index*(box+gap),y=787;
      ctx.fillStyle=result==='correct'?'#607765':result==='skipped'?'#3e3934':'#79594d';
      ctx.fillRect(x,y,box,70);
      text(result==='correct'?'HIT':result==='skipped'?'SKIP':'MISS',x+13,y+45,23,fg,'DM Sans',600);
      text(String(index+1).padStart(2,'0'),x,y+99,21,muted);
    });
    rule(972);
    text('A personal cinema archive.',pad,1023,26,fg,'Instrument Serif',400);
    ctx.textAlign='right';text('PLAY THE ARCHIVE',1080-pad,1023,22,accent,'DM Sans',600);
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image encoding failed')),'image/png'));
  }

  async function createTasteCard(summary) {
    // The artwork, profile and grid are all derived from this visitor's
    // choices. This is a local PNG export, requiring no sharing service.
    try { await document.fonts.ready; } catch { /* fallback faces */ }
    const {profile,traits,picks,total,eligible}=summary;
    if(!profile||!picks.length) throw new Error('No picks to export');
    const art=await loadPosterArt(picks.map(pick=>pick.film.poster));
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('Canvas unavailable');
    const width=1080,pad=62,gap=22;
    const bg='#1b1917',fg='#f1eee6',accent='#c7ae89',muted='#b9b0a4',line='#423d37';
    const columns=Math.min(4,picks.length),tileWidth=(width-pad*2-gap*(columns-1))/columns;
    const posterWidth=Math.min(columns<4?180:148,tileWidth-12),posterHeight=Math.round(posterWidth*1.5),rowHeight=posterHeight+102;
    const font=(size,weight=400,family='DM Sans')=>`${weight} ${size}px "${family}", ${family==='Instrument Serif'?'Georgia, serif':'Arial, sans-serif'}`;
    function lines(value,maxWidth,size,weight=400,family='DM Sans',maxLines=3) {
      ctx.font=font(size,weight,family);
      const words=String(value||'').trim().split(/\s+/).filter(Boolean),result=[];
      let current='';
      for(const word of words){const next=current?`${current} ${word}`:word;if(current&&ctx.measureText(next).width>maxWidth){result.push(current);current=word;}else current=next;}
      if(current)result.push(current);
      const shown=result.slice(0,maxLines);
      function shorten(text){while(text&&ctx.measureText(text+'…').width>maxWidth)text=text.slice(0,-1);return `${text}…`;}
      return shown.map((text,index)=>result.length>maxLines&&index===maxLines-1||ctx.measureText(text).width>maxWidth?shorten(text):text);
    }
    const title=lines(`${profile.title}.`,width-pad*2,74,400,'Instrument Serif',2);
    const description=lines((total<4?'A first impression. ':'')+profile.description,width-pad*2,29,400,'DM Sans',3);
    const signature=lines(traits.map(trait=>trait.label).join('  ·  '),width-pad*2,25,500,'DM Sans',2);
    const firstTitle=188,bodyY=firstTitle+(title.length-1)*78+53;
    const signatureY=bodyY+(description.length-1)*38+48;
    const gridY=signatureY+(signature.length-1)*33+100;
    const rows=Math.ceil(picks.length/columns);
    canvas.width=width;canvas.height=gridY+rows*rowHeight+82;
    ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.textBaseline='alphabetic';
    const draw=(value,x,y,size,color=fg,weight=400,family='DM Sans',align='left')=>{ctx.font=font(size,weight,family);ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(String(value),x,y);};
    const rule=y=>{ctx.strokeStyle=line;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(width-pad,y);ctx.stroke();};
    draw('THE T.S. ARCHIVE',pad,66,36,fg,700,'Barlow Condensed');
    draw('THIS OR THAT',width-pad,65,23,accent,500,'DM Sans','right');
    rule(92);
    draw(`Your cinematic taste  ·  ${total} of ${eligible} choices`,pad,129,24,accent,500);
    title.forEach((text,i)=>draw(text,pad,firstTitle+i*78,74,fg,400,'Instrument Serif'));
    description.forEach((text,i)=>draw(text,pad,bodyY+i*38,29,fg));
    signature.forEach((text,i)=>draw(text,pad,signatureY+i*33,25,accent,500));
    rule(gridY-52);draw('MY PICKS',pad,gridY-18,25,accent,500);
    picks.forEach((pick,index)=>{
      const center=pad+(index%columns)*(tileWidth+gap)+tileWidth/2,y=gridY+Math.floor(index/columns)*rowHeight;
      const x=center-posterWidth/2,img=art.get(pick.film.poster);
      ctx.fillStyle=line;ctx.fillRect(x-1,y-1,posterWidth+2,posterHeight+2);
      if(img){const scale=Math.max(posterWidth/img.naturalWidth,posterHeight/img.naturalHeight),w=posterWidth/scale,h=posterHeight/scale;ctx.drawImage(img,(img.naturalWidth-w)/2,(img.naturalHeight-h)/2,w,h,x,y,posterWidth,posterHeight);}
      else{ctx.fillStyle=bg;ctx.fillRect(x,y,posterWidth,posterHeight);}
      const caption=lines(pick.film.title,tileWidth-6,23,500,'DM Sans',2);
      caption.forEach((text,i)=>draw(text,center,y+posterHeight+32+i*27,23,fg,500,'DM Sans','center'));
      draw(pick.film.year,center,y+posterHeight+32+caption.length*27,19,muted,400,'DM Sans','center');
    });
    rule(canvas.height-72);
    draw('A personal cinema archive',pad,canvas.height-27,23,fg,500);
    draw('MY CINEMATIC TASTE',width-pad,canvas.height-27,21,accent,500,'DM Sans','right');
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Image encoding failed')),'image/png'));
  }

  async function createBallotCard(edition, summary) {
    // Only the visitor's picks belong on the shared image. The comparison
    // remains in the private browser view. All artwork is on the archive’s origin.
    try { await document.fonts.ready; } catch { /* fallback faces */ }
    const rows=summary.rows;
    const art=await loadPosterArt(rows.flatMap(row=>row.picked.films.map(film=>film.poster)));
    const canvas = document.createElement('canvas');
    const columns=rows.length===1?1:2;
    const tileHeight=columns===1?254:222;
    const top=278;
    canvas.width = 1080; canvas.height = top+Math.ceil(rows.length/columns)*tileHeight+92;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    const is2010 = edition.id.startsWith('2010');
    const bg = is2010 ? '#202019' : '#171c21', fg = '#f1eee6', muted = is2010 ? '#bcb8a7' : '#aab8c3', accent = is2010 ? '#cbbb91' : '#9abcca', line = is2010 ? '#414035' : '#37434e';
    ctx.fillStyle = bg; ctx.fillRect(0,0,1080,canvas.height);
    ctx.textBaseline = 'alphabetic';
    const pad = 66;
    const draw = (value,x,y,size,color=fg,weight=400,font='DM Sans') => { ctx.font = `${weight} ${size}px "${font}", ${font === 'Instrument Serif' ? 'Georgia, serif' : 'Arial, sans-serif'}`; ctx.fillStyle = color; ctx.fillText(String(value),x,y); };
    const rule = y => { ctx.strokeStyle = line; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(1080-pad,y); ctx.stroke(); };
    function wrap(value,x,y,width,size,maxLines,color=fg,weight=500) {
      ctx.font = `${weight} ${size}px "DM Sans", Arial, sans-serif`;
      ctx.fillStyle = color;
      const words = String(value || '').split(/\s+/).filter(Boolean);
      let current = '', lines = [];
      const fit = text => { if (ctx.measureText(text).width <= width) return text; while (text && ctx.measureText(text + '…').width > width) text = text.slice(0,-1); return text + '…'; };
      for (const word of words) {
        if (!current || ctx.measureText(current + ' ' + word).width <= width) current += (current ? ' ' : '') + word;
        else { lines.push(current); current = word; }
      }
      if (current) lines.push(current);
      const shown = lines.slice(0,maxLines);
      if (lines.length > maxLines) shown[shown.length-1] = fit(shown[shown.length-1] + '…');
      shown.forEach((text,index) => ctx.fillText(fit(text),x,y+index*size*1.18));
      return shown.length;
    }
    draw('THE T.S. ARCHIVE',pad,67,35,fg,700,'Barlow Condensed');
    draw('★',980,67,27,accent,500);
    rule(92);
    draw('My picks.',pad,174,78,fg,400,'Instrument Serif');
    draw(`${edition.period}  ·  ${summary.total} ${summary.total===1?'choice':'choices'}`,pad,223,29,accent,500);
    rule(250);
    function drawPoster(path,x,y,width,height) {
      ctx.fillStyle=line;ctx.fillRect(x-1,y-1,width+2,height+2);
      const img=art.get(path);
      if(!img){ctx.fillStyle=bg;ctx.fillRect(x,y,width,height);return;}
      const ratio=Math.max(width/img.naturalWidth,height/img.naturalHeight);
      const w=width/ratio,h=height/ratio;
      ctx.drawImage(img,(img.naturalWidth-w)/2,(img.naturalHeight-h)/2,w,h,x,y,width,height);
    }
    const gap=28,tileWidth=(1080-pad*2-gap*(columns-1))/columns;
    rows.forEach((row,index)=>{
      const column=index%columns,rowIndex=Math.floor(index/columns),x=pad+column*(tileWidth+gap),y=top+rowIndex*tileHeight;
      const candidate=row.picked,films=candidate.films.slice(0,4),large=columns===1;
      wrap(row.award.name,x,y+18,tileWidth,23,2,accent,500);
      const imageY=y+53;
      const areaWidth=large?150:108;
      if(films.length<=1)drawPoster(films[0]?.poster,x,imageY,large?125:96,large?186:144);
      else {
        const w=large?59:49,h=Math.round(w*1.5),spacing=6;
        films.forEach((film,i)=>drawPoster(film.poster,x+(i%2)*(w+spacing),imageY+Math.floor(i/2)*(h+spacing),w,h));
      }
      const textX=x+areaWidth+13,textWidth=tileWidth-areaWidth-13;
      const titleSize=large?34:28,detailSize=large?24:21;
      const lines=wrap(candidate.title,textX,imageY+titleSize,textWidth,titleSize,2,fg,500);
      if(candidate.detail)wrap(candidate.detail,textX,imageY+titleSize+lines*titleSize*1.17+8,textWidth,detailSize,3,muted,400);
      if(column===columns-1 || index===rows.length-1)rule(y+tileHeight-12);
    });
    draw('A personal cinema archive',pad,canvas.height-43,25,fg,500);
    draw('MY ALTERNATE BALLOT',742,canvas.height-43,22,accent,500);
    return new Promise((resolve,reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image encoding failed')),'image/png'));
  }

  if (document.body.dataset.page === 'home') {
    const load = () => initDaily();
    const daily=$('#screening-daily');
    // Fetch the lightweight daily rotation when the reader approaches.
    if(daily&&location.hash==='#screening-room')load();
    else if(daily&&'IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();load();}},{rootMargin:'500px'});
      observer.observe(daily);
    } else if ('requestIdleCallback' in window) requestIdleCallback(load,{timeout:1500});
    else setTimeout(load,50);
  } else if (document.body.dataset.page === 'screening') {
    if(!window.ArchiveScreeningLanding?.active){
      $('#screening-play').hidden=false;
      getContext().then(initRoom).catch(error => site.showError(error));
    }
  }
})();
