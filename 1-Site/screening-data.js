/* The screening room reads the same curated source as the awards and film files.
   It never changes the editorial ballot or makes external requests for artwork. */
(() => {
  'use strict';
  const negativeAwards = new Set(['worst-picture', 'most-overrated-movie']);
  const actingAwards = new Set(['best-actor', 'best-actress', 'best-supporting-actor', 'best-supporting-actress', 'best-breakthrough-performance']);
  const memoryTypes = ['dialogue', 'music', 'scenes'];
  const challengeBank = typeof module !== 'undefined' && module.exports
    ? require('./screening-challenge-bank.js') : globalThis.ArchiveScreeningChallenge;
  // Additional scene-specific stills already in the curated galleries.
  // These are explicit, not guessed from a film's generic background.
  const sceneArtwork = new Map([
    ['2010-2019/best-scene/anna-karenina-2012', 'assets/films/anna-karenina-production-design-curator.webp'],
    ['2010-2019/best-scene/oslo-august-31st', 'assets/gallery/2010-2019/oslo-august-31st/4b1df909d940.webp'],
    ['2010-2019/best-scene/little-women-2019', 'assets/gallery/2010-2019/little-women-2019/a4ccfd3b4261.webp'],
    ['2020-2026/best-opening-sequence/babylon-2022', 'assets/films/babylon-2022-wide.webp']
  ]);
  // These are editorially selected conversations between films, not randomly
  // generated pairings. The second value identifies a real still in the gallery.
  const journeyDefinitions = [
    {id:'obsession', title:'The price of obsession', description:'When devotion to art starts to cost more than the art itself.', entries:[
      ['whiplash-2014','whiplash-2014-best-film-editing-hd.webp'], ['phantom-thread','phantom-thread-best-actor-curator.webp'], ['the-novice','the-novice-film-file.webp'], ['tar-2022','tar-2022-best-picture.webp'], ['the-brutalist','the-brutalist-best-actor-cinematic-r2.webp']
    ]},
    {id:'silence', title:'The art of silence', description:'The moments where what remains unsaid carries the weight.', entries:[
      ['oslo-august-31st','4b1df909d940.webp'], ['aftersun','aftersun-film-file.webp'], ['manchester-by-the-sea','manchester-by-the-sea-wide.webp'], ['the-souvenir','the-souvenir-most-underrated-movie-hd.webp'], ['the-banshees-of-inisherin','the-banshees-of-inisherin-wide.webp']
    ]},
    {id:'music-memory', title:'Music & memory', description:'Songs, performances and the lives that music brings back.', entries:[
      ['inside-llewyn-davis','inside-llewyn-davis-music-as-memory.webp'], ['la-la-land','la-la-land-best-original-score-2010s.webp'], ['tick-tick-boom-2021','tick-tick-boom-2021-film-file.webp'], ['a-complete-unknown','a-complete-unknown-film-file.webp'], ['tar-2022','tar-2022-alt-04.webp']
    ]},
    {id:'unlived-lives', title:'Lives we might have lived', description:'Chance encounters, impossible romances and the roads not taken.', entries:[
      ['before-midnight','before-midnight-best-line-of-dialogue-cinematic-r2.webp'], ['past-lives','past-lives-film-file.webp'], ['the-worst-person-in-the-world','the-worst-person-in-the-world-wide.webp'], ['la-la-land','la-la-land-lives-we-might-have-lived-curator.webp'], ['her','her-the-cruellest-month-award-hd.webp']
    ]},
    {id:'other-worlds', title:'Light between worlds', description:'Cinema at its most immense, intimate and otherworldly.', entries:[
      ['arrival-2016','0e172ca0f41e.webp'], ['interstellar','f26b16f38f8a.webp'], ['blade-runner-2049','blade-runner-2049-best-cinematography.webp'], ['dune-part-two','dune-part-two-sardaukar.webp'], ['the-tree-of-life-2011','the-tree-of-life-2011-wide.webp']
    ]},
    {id:'worlds-by-design', title:'Worlds by design', description:'Architecture, costume and composition as a language of their own.', entries:[
      ['anna-karenina-2012','anna-karenina-production-design-curator.webp'], ['the-grand-budapest-hotel','the-grand-budapest-hotel-wide.webp'], ['asteroid-city','asteroid-city-film-file.webp'], ['poor-things-2023','poor-things-2023-film-file.webp'], ['the-brutalist','the-brutalist-the-tattoo-line-award-cinematic-r2.webp']
    ]}
  ];
  const matchupDefinitions = [
    ['artistic-obsession','The price of obsession','Which captures the cost of artistic obsession?', ['whiplash-2014','whiplash-decade-cover.webp'], ['tar-2022','tar-2022-lydia-conducting.webp']],
    ['roads-not-taken','Unlived lives','Which stays with you more as a story of the life not taken?', ['la-la-land','la-la-land-lives-we-might-have-lived-curator.webp'], ['the-worst-person-in-the-world','the-worst-person-in-the-world-wide.webp']],
    ['time-puzzle','Time & structure','Which makes time itself more compelling?', ['inception','inception-best-opening-sequence-hd.webp'], ['tenet','tenet-curator-editing.webp']],
    ['love-and-time','Love & time','Which finds more emotion in the passage of time?', ['arrival-2016','f175e61dd888.webp'], ['interstellar','interstellar-director-of-the-decade-2010s.webp']],
    ['visual-scale','Visual scale','Which creates the more unforgettable cinematic world?', ['blade-runner-2049','blade-runner-2049-ceremony-cinematography.webp'], ['dune-part-two','dune-part-two-sardaukar.webp']],
    ['artist-and-work','The artist & the work','Which explores the price of a singular creative vision more deeply?', ['phantom-thread','phantom-thread-best-actor-curator.webp'], ['the-brutalist','the-brutalist-best-actor-cinematic-r2.webp']],
    ['grief','Memory & grief','Which captures grief in the quieter, more lasting way?', ['manchester-by-the-sea','manchester-by-the-sea-wide.webp'], ['aftersun','aftersun-film-file.webp']],
    ['intimacy','Love & intimacy','Which feels more honest about the passing of love and time?', ['before-midnight','before-midnight-best-line-of-dialogue-cinematic-r2.webp'], ['past-lives','past-lives-film-file.webp']],
    ['musician','A life in music','Which film captures the changing life of a musician more vividly?', ['inside-llewyn-davis','inside-llewyn-davis-wide.webp'], ['a-complete-unknown','a-complete-unknown-film-file.webp']],
    ['period','Period detail','Which draws you further into its period through design?', ['anna-karenina-2012','anna-karenina-production-design-curator.webp'], ['the-count-of-monte-cristo-2024','the-count-of-monte-cristo-2024-costume.webp']],
    ['wes','Worlds by design','Which of these visual worlds would you rather revisit?', ['the-grand-budapest-hotel','the-grand-budapest-hotel-wide.webp'], ['asteroid-city','asteroid-city-film-file.webp']],
    ['desire','Desire & mystery','Which Park Chan-wook film lingers more in your memory?', ['the-handmaiden','the-handmaiden-wide.webp'], ['decision-to-leave','decision-to-leave-seo-rae.webp']],
    ['gotham','A city in shadow','Which vision of Gotham feels more cinematic to you?', ['the-dark-knight-rises','the-dark-knight-rises-wide.webp'], ['the-batman','the-batman-wide.webp']],
    ['immersive','Cinematic immersion','Which places you more fully inside the experience?', ['dunkirk-2017','22aec826112d.webp'], ['1917','eaf64409575d.webp']],
    ['competition','Driven to win','Which expresses the tension between ambition and competition?', ['the-novice','the-novice-film-file.webp'], ['challengers','challengers-film-file.webp']],
    ['uncertainty','The unknown','Which uses ambiguity more powerfully?', ['burning-2018','burning-2018-best-adapted-screenplay-hd.webp'], ['anatomy-of-a-fall','anatomy-of-a-fall-wide.webp']]
  ];
  // An editorial reading of film preferences, not a personality diagnosis.
  // Every pairing contrasts two different cinematic instincts. The labels
  // below describe how a choice was interpreted, never a right/wrong answer.
  const tasteDimensions = {
    rhythm: {label:'Rhythm & intensity', title:'The pulse seeker', description:'You respond to momentum: the tension of a cut, a performance pushed to its limits and a story that never loses its rhythm.', short:'Momentum, precision and mounting pressure.', tags:{Obsession:2,Unease:1,Music:1}, awards:['best-film-editing','best-opening-sequence','the-price-of-obsession','the-price-of-perfection']},
    intimacy: {label:'Intimacy & emotion', title:'The intimate observer', description:'You are drawn to the quiet truth between people: incomplete conversations, complicated relationships and the emotion carried in small details.', short:'Human contradictions and the things left unsaid.', tags:{Intimacy:3,Longing:2,Melancholy:1}, awards:['best-line-of-dialogue','lives-we-might-have-lived','the-silent-ending-award','best-actor','best-actress']},
    atmosphere: {label:'Atmosphere & mystery', title:'The atmosphere seeker', description:'You gravitate toward films that linger beyond their plot: an uneasy silence, a nocturnal world and the productive space of ambiguity.', short:'Immersive moods, silence and ambiguity.', tags:{Atmosphere:3,Nocturnal:3,Unease:2,Dreamlike:2}, awards:['best-atmosphere','best-cinematography','the-hollow-men-award','the-silent-ending-award']},
    craft: {label:'Visual craft & worlds', title:'The visual architect', description:'Cinema speaks to you through the frame itself: carefully constructed spaces, expressive colour and light, and the detail that makes an imagined world feel real.', short:'Composition, design and unforgettable worlds.', tags:{Visuals:3,Wonder:2,Dreamlike:1}, awards:['best-production-design','best-costume-design','best-visual-effects','best-cinematography']},
    memory: {label:'Memory & longing', title:'The collector of memories', description:'You tend to return to the films that turn time, music and fleeting possibilities into feelings that stay long after the final frame.', short:'Nostalgia, music and lives we might have lived.', tags:{Nostalgia:3,Music:3,Longing:2,Melancholy:1}, awards:['best-original-score','best-score-cue','best-song-in-a-film','music-as-power-memory','music-as-memory','animation-memory-longing','lives-we-might-have-lived']},
    structure: {label:'Structure & complexity', title:'The pattern seeker', description:'You enjoy a film that asks you to look twice: layered perspectives, narrative puzzles and ideas that invite you to piece together their meaning.', short:'Layered stories and the pleasure of interpretation.', tags:{Unease:2,Obsession:1,Dreamlike:1,'Dark comedy':1}, awards:['best-original-screenplay','best-non-original-screenplay','best-adapted-screenplay','best-film-editing','best-opening-sequence']}
  };
  const tasteReadings = {
    'artistic-obsession': [['rhythm','craft','Artistic pressure expressed through tempo, precision and escalating intensity.'],['atmosphere','structure','Power and obsession filtered through restraint, uncertainty and moral complexity.']],
    'roads-not-taken': [['memory','craft','Romance remembered through music, colour and the bittersweet possibility of another life.'],['intimacy','memory','An honest, imperfect portrait of relationships and the lives we imagine.']],
    'time-puzzle': [['structure','craft','A layered dream architecture that rewards following the shape of the story.'],['rhythm','structure','A puzzle experienced through pace, movement and the urgency of action.']],
    'love-and-time': [['intimacy','structure','An emotional story whose unusual structure gives loss and connection new meaning.'],['memory','craft','A sweeping cinematic scale made personal by distance, time and longing.']],
    'visual-scale': [['atmosphere','craft','A world whose light, silence and atmosphere invite you to inhabit it.'],['craft','rhythm','A monumental visual language shaped by scale, movement and texture.']],
    'artist-and-work': [['intimacy','craft','The private, intricate relationship behind the work of an exacting artist.'],['craft','structure','Creative ambition understood through architecture, time and the shape of a life.']],
    'grief': [['intimacy','atmosphere','Grief approached through everyday gestures and the weight of what remains unsaid.'],['memory','intimacy','Memory and fragmented tenderness as ways of understanding a person.']],
    'intimacy': [['intimacy','structure','The complications of love made visible through conversation and shared history.'],['memory','intimacy','An encounter shaped by time, distance and the possibility of other lives.']],
    'musician': [['atmosphere','memory','The melancholy atmosphere of a musician caught between art and ordinary life.'],['memory','rhythm','A life refracted through songs, performance and the momentum of artistic change.']],
    'period': [['craft','structure','A theatrical visual world in which costume, space and form tell the story.'],['rhythm','craft','The forward momentum of a grand adventure, enriched by its period detail.']],
    'wes': [['craft','memory','A meticulously constructed world with a nostalgic sense of place.'],['structure','craft','A playful, layered world where the construction of the story becomes part of its meaning.']],
    'desire': [['structure','craft','The pleasure of shifted perspectives, intricate design and narrative revelation.'],['atmosphere','intimacy','Desire and mystery expressed through atmosphere, restraint and emotional distance.']],
    'gotham': [['rhythm','structure','A sense of scale, urgency and the momentum of an unfolding conflict.'],['atmosphere','craft','A rain-dark visual world shaped by mood, shadow and an unhurried mystery.']],
    'immersive': [['structure','rhythm','Immersion built through intersecting patterns of time, tension and pacing.'],['rhythm','craft','Continuous movement and visual choreography that place you inside the experience.']],
    'competition': [['atmosphere','rhythm','Obsession expressed through vulnerability, unease and the pressure of competition.'],['rhythm','intimacy','Competitive rhythm intertwined with desire and relationships.']],
    'uncertainty': [['atmosphere','structure','A lingering uncertainty sustained by atmosphere and the unanswered question.'],['structure','intimacy','A layered reconstruction of events that leaves room for competing human truths.']]
  };
  const tasteRecommendations = {
    rhythm: {
      'uncut-gems':'A breathless accumulation of pressure and split-second decisions.',
      'the-social-network':'Conversation, music and editing turned into a relentless cinematic rhythm.',
      'black-swan':'The rhythm of performance gives artistic perfection an increasingly unsettling intensity.',
      'oppenheimer-2023':'A sweeping story shaped by an insistent rhythm of images, sound and memory.',
      'steve-jobs':'A rare film that turns the energy of a conversation into the momentum of an entire scene.'
    },
    intimacy: {
      'certified-copy':'A conversation whose emotional meaning shifts as the relationship between its characters changes.',
      'drive-my-car':'Patient conversations and small gestures that open up entire inner lives.',
      'her':'Intimacy, loneliness and connection expressed through unusually tender human detail.',
      'moonlight-2016':'The quiet emotional force of encounters across a life.',
      'if-beale-street-could-talk':'A romance carried by faces, gestures and the depth of a shared history.'
    },
    atmosphere: {
      'drive-2011':'A city at night whose silence, light and sound tell as much as its dialogue.',
      'the-beast-2023':'An atmosphere of unease and longing that stretches across different lives and worlds.',
      'oslo-august-31st':'A quiet day whose ordinary places and silences carry extraordinary emotional weight.',
      'la-chimera':'A dreamlike world in which the boundary between the present and what has been lost keeps shifting.',
      'the-power-of-the-dog':'A landscape and a series of restrained encounters charged with unspoken tension.'
    },
    craft: {
      'poor-things-2023':'An invented world in which architecture, costume and colour are inseparable from the story.',
      'the-tree-of-life-2011':'Visual composition and natural light used to connect the intimate with the immense.',
      'nightmare-alley-2021':'A carefully designed world of shadows, surfaces and period texture.',
      'the-beast-2023':'Distinct visual worlds that make shifts in time and feeling tangible.',
      'dune-2021':'A visual language of scale, texture and spatial composition.'
    },
    memory: {
      'the-souvenir':'A fragile reconstruction of memory, art and the relationship between them.',
      'your-name':'Longing and memory woven into the possibilities of time.',
      'sentimental-value-2025':'An exploration of personal history and the memories we carry into creative work.',
      'first-man':'Where music, vast distance and private loss meet.',
      'midnight-in-paris':'A wistful encounter with nostalgia and the worlds we imagine living in.'
    },
    structure: {
      'gone-girl':'A story that continually reshapes your interpretation through perspective and revelation.',
      'shutter-island':'A puzzle whose details invite a second reading of the entire experience.',
      'certified-copy':'An elegantly constructed ambiguity that makes the nature of its central relationship a question.',
      'the-social-network':'Interlocking perspectives and conversations give a familiar story its layered form.',
      'the-beast-2023':'A layered narrative that invites connections between apparently separate times and identities.'
    }
  };
  const normal = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  const filmKey = (edition, slug) => `${edition}/${slug}`;
  const hash = value => {
    let number = 2166136261;
    for (const char of String(value)) number = Math.imul(number ^ char.codePointAt(0), 16777619);
    return number >>> 0;
  };
  const shuffle = (items, random = Math.random) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const unique = (items, key = value => value) => {
    const seen = new Set();
    return items.filter(item => {
      const id = key(item);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };
  const ranked = (items, salt) => [...items].sort((a, b) => hash(salt + a.key) - hash(salt + b.key) || a.key.localeCompare(b.key));

  function verifiedFrame(item, sizes) {
    const size = sizes?.[item.path];
    if (!item.path || !/^assets\/(?:gallery|films)\//.test(item.path) || !Array.isArray(size)) return null;
    const [width, height] = size;
    // Keep the composition, including narrower films. Do not upscale tiny stills.
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1200 || height < 450 || width / height < 1.18 || width / height > 3.1) return null;
    const description = `${item.label ?? ''} ${item.context ?? ''}`;
    if (/\b(?:poster|title card|title shot|behind the scenes|on set|cast portrait|credits|end credits|spoiler)\b/i.test(description)) return null;
    return {path: item.path, width, height, source: item.source || '', label: item.label || ''};
  }

  function makeArchive(models) {
    const films = new Map(), awards = new Map(), ballotEditions = new Map(), memory = [];
    for (const model of models) {
      const id = model.edition.id;
      const sizes = {...model.data.media?.sizes, ...model.media?.sizes};
      const discoveryTags = [...(model.data.discovery?.moods ?? []), ...(model.data.discovery?.topics ?? [])];
      for (const [slug, details] of Object.entries(model.data.films ?? {})) {
        const key = filmKey(id, slug);
        const art = model.data.media?.films?.[slug] ?? {};
        const gallery = model.data.galleries?.[slug] ?? [];
        const frames = unique(gallery.map(item => verifiedFrame(item, sizes)).filter(Boolean), frame => frame.path);
        films.set(key, {
          key, slug, editionId: id, period: model.edition.period, title: details.title,
          year: details.year, poster: art.poster || '', frames, wins: [], mentions: [], tags: discoveryTags.filter(topic => topic.films.includes(slug)).map(topic => topic.label),
          href: `awards.html?edition=${encodeURIComponent(id)}&film=${encodeURIComponent(slug)}`
        });
      }
      const editionAwards = (model.awards ?? model.data.chapters.flatMap(chapter => chapter.awards.map(award => ({...award, chapter}))));
      const ballotAwards = [];
      for (const award of editionAwards) {
        const awardKey = `${id}/${award.id}`;
        const href = `awards.html?edition=${encodeURIComponent(id)}&award=${encodeURIComponent(award.id)}`;
        const metadata = {key: awardKey, id: award.id, name: award.name, chapter: award.chapter?.name || '', href};
        awards.set(awardKey, metadata);
        const entries = [award.winner, ...(award.nominees ?? [])].filter(Boolean);
        for (const [index, entry] of entries.entries()) {
          for (const slug of entry.films ?? []) {
            const film = films.get(filmKey(id, slug));
            if (!film) continue;
            if (index > 0) film.mentions.push(metadata);
            else if (!negativeAwards.has(award.id)) film.wins.push(metadata);
          }
        }
        // A visitor can select any actual entry; the curator's pick is not
        // identified until the visitor opens the comparison. Single-entry awards
        // have no alternate choice and are therefore omitted.
        if (entries.length > 1) {
          const candidates = unique(entries.map(entry => ballotCandidate(entry, award, id, films)), candidate => candidate.key);
          if (candidates.length > 1) ballotAwards.push({...metadata, candidates: ranked(candidates, awardKey + '|'), archiveKey: candidates[0].key});
        }
        const group = unique(entries.flatMap(entry => (entry.films ?? []).map(slug => filmKey(id, slug))).filter(key => films.has(key)));
        for (const entry of entries) {
          if (entry.films?.length !== 1) continue;
          const slug = entry.films[0];
          const film = films.get(filmKey(id, slug));
          const clue = entry.detail?.trim();
          if (!film || !clue) continue;
          const context = {film, award: metadata, preferred: group, correct: {key:film.key, label:film.title}, answerKind: 'film'};
          const listening = (award.listen ?? []).find(item => item.film === slug && /^https:\/\/music\.apple\.com\//.test(item.url));
          if (/^(best-line-of-dialogue|the-tattoo-line-award)$/.test(award.id)) {
            memory.push({...context, key:`dialogue/${film.key}/${normal(clue)}`, subtype:'dialogue', marker:'Dialogue', prompt:'Which film is this line from?', clue, quote:true});
          } else if (/^(best-original-score|best-original-score-of-the-decade)$/.test(award.id)) {
            memory.push({...context, key:`music/score/${film.key}`, subtype:'music', marker:'Original score', prompt:'Who composed the original score?', clue:film.title, subclue:String(film.year || ''), answerKind:'composer', correct:{key:normal(clue), label:clue}, listening});
          } else if (/^(best-score-cue|best-song-in-a-film)$/.test(award.id)) {
            const track = clue.match(/^[“"](.+?)[”"](?:\s+·\s+(.+))?$/u);
            if (track) memory.push({...context, key:`music/cue/${film.key}/${normal(track[1])}`, subtype:'music', marker:award.id === 'best-score-cue' ? 'Score cue' : 'Film song', prompt:'Which film features this piece?', clue:`“${track[1]}”`, subclue:award.id === 'best-score-cue' ? track[2] || '' : '', quote:true, listening});
          } else if (/^(best-scene|best-opening-sequence)$/.test(award.id)) {
            // Only show an image if the award's still is specifically identified
            // for this film. A general backdrop is not evidence of this scene.
            const curated = sceneArtwork.get(`${id}/${award.id}/${slug}`);
            const exact = (model.data.stills?.[slug] ?? []).find(item => item.award === award.id)
              ?? (model.data.galleries?.[slug] ?? []).find(item => item.path === curated);
            const frame = exact && verifiedFrame(exact, sizes);
            memory.push({...context, key:`scenes/${award.id}/${film.key}`, subtype:'scenes', marker:award.id === 'best-scene' ? 'Scene' : 'Opening sequence', prompt:'Which film features this moment?', clue, frame:frame || null});
          }
        }
      }
      ballotEditions.set(id, {id, period:model.edition.period, title:model.edition.title, awards:ballotAwards});
    }
    const filmList = [...films.values()];
    const archive = {films, filmList, awards, ballotEditions, memory:unique(memory, question => question.key)};
    // Resolve only locally available curated artwork; an absent film never
    // becomes a placeholder or an unrelated image from another title.
    function curatedStill([slug, filename]) {
      const film = filmList.find(item => item.slug === slug);
      const frame = film?.frames.find(item => item.path.split('/').at(-1) === filename);
      return film && frame ? {film, frame} : null;
    }
    archive.journeys = journeyDefinitions.map(definition => ({id:definition.id,title:definition.title,description:definition.description,entries:definition.entries.map(curatedStill).filter(Boolean)})).filter(journey => journey.entries.length >= 3)
      .map(journey=>globalThis.ArchiveJourneyEditorial?.decorate(journey)||journey);
    archive.matchups = matchupDefinitions.map(([id,theme,prompt,left,right]) => ({id,theme,prompt,entries:[left,right].map((selection,index) => {
      const entry=curatedStill(selection), [primary,secondary,note]=tasteReadings[id][index];
      return entry ? {...entry, taste:{primary,secondary,note}} : null;
    }).filter(Boolean)})).filter(pair => pair.entries.length === 2);
    return archive;
  }

  function ballotCandidate(entry, award, editionId, films) {
    const selections = (entry.films ?? []).map(slug => films.get(filmKey(editionId, slug))).filter(Boolean);
    const filmTitles = selections.map(film => film.title).join(' / ');
    const identity = `${entry.title || ''}|${entry.detail || ''}|${selections.map(film => film.key).join(',')}`;
    let title = entry.title || filmTitles || entry.text || 'Selection';
    let detail = entry.detail || '';
    if (entry.creditFirst) {
      detail = filmTitles || detail;
    } else if (award.honorsPortfolio || (award.id === 'director-of-the-decade' || award.id === 'composer-of-the-decade') && selections.length > 1) {
      title = detail || title;
      detail = filmTitles;
    } else if (actingAwards.has(award.id) && detail) {
      title = detail;
      detail = filmTitles;
    } else if (!detail && selections.length === 1) {
      detail = String(selections[0].year || '');
    }
    return {key:`pick-${hash(identity).toString(36)}`, title, detail, films:selections};
  }

  function inScope(editionId, scope) { return !scope || scope === 'all' || scope === editionId; }

  function filmOptions(archive, question, scope, random) {
    const film = question.film;
    const others = archive.filmList.filter(item => item.key !== film.key && inScope(item.editionId, scope) && normal(item.title) !== normal(film.title));
    const sameEra = others.filter(item => item.editionId === film.editionId);
    const near = sameEra.filter(item => Math.abs(Number(item.year) - Number(film.year)) <= 3);
    const preferred = others.filter(item => question.preferred?.includes(item.key));
    return unique([...shuffle(preferred, random), ...shuffle(near, random), ...shuffle(sameEra, random), ...shuffle(others, random)], item => normal(item.title)).slice(0,2).map(item => ({key:item.key, label:item.title}));
  }

  function challengeFilmOptions(archive, film, slugs) {
    const alternatives = (slugs ?? []).map(slug => archive.films.get(filmKey(film.editionId,slug))).filter(item => item && item.key !== film.key && normal(item.title) !== normal(film.title));
    const distinct = unique(alternatives, item => normal(item.title));
    return distinct.length === 3 ? distinct.map(item=>({key:item.key,label:item.title})) : null;
  }

  function challengeFramePool(archive, scope) {
    return Object.entries(challengeBank?.frames ?? {}).filter(([id]) => inScope(id,scope)).flatMap(([editionId,rows]) => rows.flatMap(([slug,ref,alternatives]) => {
      const film = archive.films.get(filmKey(editionId,slug));
      const frame = film?.frames.find(item => item.label === ref || item.path.split('/').at(-1) === ref);
      const challengeDistractors = film && challengeFilmOptions(archive,film,alternatives);
      if (!frame || !challengeDistractors) return [];
      return [{key:`challenge-frame/${film.key}/${frame.path.split('/').at(-1)}`, film, frame, marker:'Film still', prompt:'Name the film.', answerKind:'film', correct:{key:film.key,label:film.title}, challengeDistractors}];
    }));
  }

  function challengeMemoryQuestion(archive, question) {
    if (question.answerKind === 'composer') {
      // Use actual score and composer credits in this archive (also across
      // decades if necessary). These are people, not out-of-scope films.
      const known = new Map(archive.memory.filter(item=>item.answerKind==='composer').map(item=>[item.correct.key,item.correct]));
      for (const edition of archive.ballotEditions.values()) for (const award of edition.awards.filter(item=>item.id==='composer-of-the-decade')) {
        for (const candidate of award.candidates) known.set(normal(candidate.title),{key:normal(candidate.title),label:candidate.title});
      }
      const alternatives = challengeBank?.composerAlternatives?.[question.correct.label] ?? [];
      const challengeDistractors = unique(alternatives.map(name=>known.get(normal(name))).filter(item=>item && item.key!==question.correct.key),item=>item.key);
      return challengeDistractors.length === 3 ? {...question,challengeDistractors} : null;
    }
    const slug=question.film.slug;
    // Exclude ambiguously short quotations and self-answering titles rather
    // than making a harder quiz unfair. The classic bank is unchanged.
    if (question.subtype==='dialogue' && (slug==='little-women-2019'||slug==='the-brutalist')) return null;
    let clue=question.clue;
    if (question.subtype==='scenes') {
      clue=challengeBank?.scenePrompts?.[`${question.award.id}/${slug}`];
      if (!clue) return null;
    }
    const keys=challengeBank?.memoryAlternatives;
    const refs=question.subtype==='music' ? keys?.[`music/${slug}`] : keys?.[slug];
    const challengeDistractors=challengeFilmOptions(archive,question.film,refs);
    if (!challengeDistractors) return null;
    return {...question,clue,subclue:question.subtype==='music'?'':question.subclue,challengeDistractors};
  }

  function questionChoices(archive, question, scope, random, challenge = false) {
    if (challenge) {
      const choices = question.challengeDistractors;
      return choices?.length===3 ? {...question, choices:shuffle([question.correct,...choices],random)} : null;
    }
    let distractors;
    if (question.answerKind === 'composer') {
      const pool = archive.memory.filter(item => item.answerKind === 'composer' && inScope(item.film.editionId, scope));
      const fallback = archive.memory.filter(item => item.answerKind === 'composer');
      distractors = unique([...shuffle(pool, random), ...shuffle(fallback, random)].map(item => item.correct).filter(option => option.key !== question.correct.key), option => option.key).slice(0,2);
    } else distractors = filmOptions(archive, question, scope, random);
    if (distractors.length < 2) return null;
    return {...question, choices:shuffle([question.correct, ...distractors], random)};
  }

  function pickDistinct(pool, length, random, avoid = []) {
    const fresh = shuffle(pool.filter(question => !avoid.includes(question.key)), random);
    const previous = shuffle(pool.filter(question => avoid.includes(question.key)), random);
    return unique([...fresh, ...previous], question => question.film.key).slice(0,length);
  }

  function makeQuiz(archive, mode, {scope='all', category='all', difficulty='classic', length=5, random=Math.random, avoid=[]} = {}) {
    let queue = [];
    const challenge=difficulty==='challenge' && Boolean(challengeBank);
    const choiceCount=challenge?4:3;
    if (mode === 'winner') {
      const pool = [...archive.ballotEditions.values()].filter(edition => inScope(edition.id,scope)).flatMap(edition => edition.awards.filter(award => !negativeAwards.has(award.id) && award.candidates.length >= choiceCount).map(award => {
        const candidate = award.candidates.find(item => item.key === award.archiveKey);
        if (!candidate?.films.length) return null;
        const choices = shuffle([candidate, ...shuffle(award.candidates.filter(item => item.key !== award.archiveKey),random).slice(0,choiceCount-1)],random).map(item => ({key:item.key,label:item.title,candidate:item}));
        return {key:`winner/${award.key}`,award,film:candidate.films[0],candidate,marker:edition.period,prompt:'Guess the winner.',correct:{key:candidate.key,label:candidate.title},answerKind:'winner',choices};
      }).filter(Boolean));
      const pick = (items,number) => [...shuffle(items.filter(q=>!avoid.includes(q.key)),random), ...shuffle(items.filter(q=>avoid.includes(q.key)),random)].slice(0,number);
      const editions = unique(pool.map(question=>question.film.editionId));
      if (scope === 'all' && editions.length > 1) {
        for (const id of shuffle(editions,random)) queue.push(...pick(pool.filter(q=>q.film.editionId===id),Math.floor(length/editions.length)));
        queue.push(...pick(pool.filter(q=>!queue.some(item=>item.key===q.key)),length-queue.length));
        return shuffle(queue,random);
      }
      return pick(pool,length);
    } else if (mode === 'frame') {
      const pool = challenge ? challengeFramePool(archive,scope) : archive.filmList.filter(film => inScope(film.editionId, scope) && film.frames.length).map(film => {
        // Prefer a genuine widescreen still of at least 1200px, never an
        // animated reveal, crop or upscaled poster. Every frame stays fixed.
        const frame = film.frames[Math.floor(random() * film.frames.length)];
        return {key:`frame/${film.key}`, film, frame, marker:'Film still', prompt:'Name the film.', answerKind:'film', correct:{key:film.key,label:film.title}};
      });
      if (scope === 'all') {
        // Give both decades a place in every mixed session when available.
        const editions = unique(pool.map(question => question.film.editionId));
        for (const id of shuffle(editions, random)) queue.push(...pickDistinct(pool.filter(question => question.film.editionId === id), Math.floor(length / editions.length), random, avoid));
        queue.push(...pickDistinct(pool.filter(question => !queue.some(pick => pick.film.key === question.film.key)), length - queue.length, random, avoid));
        queue = shuffle(queue, random);
      } else queue = pickDistinct(pool, length, random, avoid);
    } else if (mode === 'memory') {
      const base = archive.memory.filter(question => inScope(question.film.editionId, scope) && (category === 'all' || question.subtype === category));
      const pool = challenge ? base.map(question=>challengeMemoryQuestion(archive,question)).filter(Boolean) : base;
      if (category === 'all') {
        for (const type of memoryTypes) {
          const match = pickDistinct(pool.filter(question => question.subtype === type && !queue.some(pick => pick.film.key === question.film.key)),1,random,avoid)[0];
          if (match) queue.push(match);
        }
        queue.push(...pickDistinct(pool.filter(question => !queue.some(pick => pick.film.key === question.film.key)), Math.max(0,length - queue.length), random, avoid));
        queue = shuffle(queue, random).slice(0,length);
      } else if (category === 'scenes') {
        const visual = pickDistinct(pool.filter(question => question.frame),1,random,avoid)[0];
        if (visual) queue.push(visual);
        queue.push(...pickDistinct(pool.filter(question => !queue.some(pick => pick.film.key === question.film.key)),length-queue.length,random,avoid));
      } else queue = pickDistinct(pool, length, random, avoid);
    }
    return queue.map(question => questionChoices(archive, question, scope, random, challenge)).filter(Boolean);
  }

  // Occasionally the curator selects a specific daily frame from the archive.
  // A dated choice affects only that local calendar day; the rotation resumes
  // unchanged on every other day.
  const dailyCuratorSelections = {
    '2026-11-26': {journey:'silence', film:'the-souvenir', frame:{
      path:'assets/films/the-souvenir-daily-frame.jpg', width:2000, height:1153,
      label:'Julie and Anthony at the table',
      source:'Sundance Institute · still supplied by the curator',
      credit:'Courtesy of Sundance Institute · Photo by Agatha A. Nitecka'
    }},
    '2026-11-27': {edition:'2020-2026', film:'sentimental-value-2025', frame:{
      path:'assets/films/sentimental-value-2025-curator-frame-20261126-16.webp', width:1916, height:1036,
      label:'Sunlight and shadows across the floor',
      credit:'Film still provided by the curator'
    }}
  };

  function dailyFrame(archive, date = new Date()) {
    const ordinal = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
    const selection = dailyCuratorSelections[new Date(ordinal * 86400000).toISOString().slice(0,10)];
    if (selection) {
      const entry = archive.journeys?.find(journey => journey.id === selection.journey)
        ?.entries.find(item => item.film.slug === selection.film);
      const film = entry?.film ?? (selection.edition
        ? archive.filmList?.find(item => item.key === `${selection.edition}/${selection.film}`)
        : null);
      const frame = selection.frame ?? entry?.frame;
      if (film && frame) return {film, frame, day:ordinal};
    }
    // One film per day before the cycle repeats; each film may supply another
    // still on the next cycle. The result is deterministic across reloads.
    const pool = ranked(archive.filmList.filter(film => film.frames.some(frame => frame.width / frame.height >= 1.5)), 'screening-daily-v1/');
    if (!pool.length) return null;
    const film = pool[((ordinal % pool.length) + pool.length) % pool.length];
    const wide = film.frames.filter(frame => frame.width / frame.height >= 1.5);
    const strongest = wide.filter(frame => frame.width >= 1600);
    const frames = strongest.length ? strongest : wide;
    const frame = frames[hash(`${film.key}/${Math.floor(ordinal / pool.length)}`) % frames.length];
    return {film, frame, day:ordinal};
  }

  function cleanBallot(edition, saved) {
    const votes = {};
    for (const award of edition.awards) {
      const key = saved?.votes?.[award.id];
      if (award.candidates.some(candidate => candidate.key === key)) votes[award.id] = key;
    }
    const cursor = edition.awards.some(award => award.id === saved?.cursor) ? saved.cursor : edition.awards[0]?.id || '';
    return {votes, cursor};
  }

  function ballotSummary(edition, record) {
    const rows = edition.awards.flatMap(award => {
      const picked = award.candidates.find(candidate => candidate.key === record.votes[award.id]);
      const archive = award.candidates.find(candidate => candidate.key === award.archiveKey);
      return picked && archive ? [{award, picked, archive, match:picked.key === archive.key}] : [];
    });
    return {rows, total:rows.length, matches:rows.filter(row => row.match).length, eligible:edition.awards.length};
  }

  // A round is finite, and its saved state can only reference actual matchup
  // IDs and the two films in each matchup. Skip leaves no taste evidence.
  function cleanMatchupRound(archive, saved = null, random = Math.random, firstPair = true) {
    const pairs = new Map(archive.matchups.map(pair=>[pair.id,pair]));
    const validOrder = Array.isArray(saved?.order) && saved.order.length === pairs.size && new Set(saved.order).size === pairs.size && saved.order.every(id=>pairs.has(id));
    if (!validOrder) {
      const ids = [...pairs.keys()];
      const order = firstPair && ids.length ? [ids[0],...shuffle(ids.slice(1),random)] : shuffle(ids,random);
      return {order,index:0,choices:{},complete:false};
    }
    const choices = {};
    for (const id of saved.order) {
      const key = saved.choices?.[id];
      if (pairs.get(id).entries.some(entry=>entry.film.key===key)) choices[id]=key;
    }
    const index = Number.isInteger(saved.index) ? Math.max(0,Math.min(saved.order.length-1,saved.index)) : 0;
    return {order:[...saved.order],index,choices,complete:Boolean(saved.complete)};
  }

  function filmTasteAffinity(film, dimension) {
    const tags = film.tags.filter(tag=>Object.hasOwn(dimension.tags,tag));
    const relevant = unique([...film.wins,...film.mentions].filter(award=>dimension.awards.includes(award.id)),award=>award.id);
    const note=tasteRecommendations[dimension.id]?.[film.slug] || '';
    const score = (note?8:0) + tags.reduce((sum,tag)=>sum+dimension.tags[tag],0) + relevant.reduce((sum,award)=>sum+(film.wins.some(win=>win.id===award.id)?2:1),0);
    const evidence = [...tags.sort((a,b)=>dimension.tags[b]-dimension.tags[a]), ...relevant.map(award=>award.name)].slice(0,2);
    return {score,evidence,note};
  }

  function matchupSummary(archive, round) {
    const pairs = new Map(archive.matchups.map(pair=>[pair.id,pair]));
    const choices = round?.choices || {};
    const order = Array.isArray(round?.order) ? round.order : [...pairs.keys()];
    const picks = unique(order).flatMap(id=>{
      const pair=pairs.get(id), selection=pair?.entries.find(entry=>entry.film.key===choices[id]);
      return selection ? [{...selection,pair}] : [];
    });
    const eligible=pairs.size;
    if (!picks.length) return {picks,total:0,eligible,traits:[],profile:null,representative:null,recommendations:[]};

    // Compare what the viewer chose with the alternatives they actually saw.
    // Normalize availability so a trait offered more often can't win merely
    // by appearing in more curated matchups. A primary trait has three votes,
    // a secondary one has one, and sparse evidence receives less weight.
    const weight=(entry,id)=>entry.taste.primary===id?3:entry.taste.secondary===id?1:0;
    const traits=Object.entries(tasteDimensions).map(([id,dimension])=>{
      const support=picks.reduce((sum,pick)=>sum+weight(pick,id),0);
      const opportunity=picks.reduce((sum,pick)=>sum+Math.max(...pick.pair.entries.map(entry=>weight(entry,id))),0);
      const primary=picks.filter(pick=>pick.taste.primary===id).length;
      const score=opportunity&&support ? (support+.5)/(opportunity+1.5) * support/(support+2) : 0;
      const evidence=picks.find(pick=>pick.taste.primary===id) || picks.find(pick=>pick.taste.secondary===id);
      return {id,...dimension,support,primary,score,evidence};
    }).filter(trait=>trait.support>0).sort((a,b)=>b.score-a.score || b.support-a.support || b.primary-a.primary || a.label.localeCompare(b.label)).slice(0,picks.length<4?2:3);
    const profile=traits[0], representative=profile.evidence || picks[0];
    // Recommendations must be different films, with positive, verifiable
    // affinities from this archive's topics and award mentions. No film is
    // inferred to be unseen. The cards simply connect to other archive films.
    const compared = new Set(archive.matchups.flatMap(pair=>pair.entries.map(entry=>normal(entry.film.title))));
    const pool=archive.filmList.filter(film=>!compared.has(normal(film.title)) && film.poster);
    const recommended=new Set();
    const recommendations=[];
    for (const target of traits) {
      const options=pool.filter(film=>!recommended.has(normal(film.title))).map(film=>{
        const affinity=filmTasteAffinity(film,target);
        const combined=traits.reduce((sum,trait)=>sum+filmTasteAffinity(film,trait).score*trait.score,0);
        return {film,trait:target,evidence:affinity.evidence,note:affinity.note,fit:affinity.score,score:affinity.score*3+combined};
      }).filter(item=>item.fit>0).sort((a,b)=>b.score-a.score || a.film.title.localeCompare(b.film.title));
      if (options[0]) { recommendations.push(options[0]); recommended.add(normal(options[0].film.title)); }
    }
    // A short round can still supply three distinct suggestions, with a
    // different title rather than fabricating another trait.
    if (recommendations.length<3) {
      const extra=pool.filter(film=>!recommended.has(normal(film.title))).map(film=>{
        const affinity=filmTasteAffinity(film,profile);return {film,trait:profile,evidence:affinity.evidence,note:affinity.note,fit:affinity.score};
      }).filter(item=>item.fit>0).sort((a,b)=>b.fit-a.fit || a.film.title.localeCompare(b.film.title));
      recommendations.push(...extra.slice(0,3-recommendations.length));
    }
    return {picks,total:picks.length,eligible,traits,profile,representative,recommendations};
  }

  function connectionFilms(archive, filmKeyValue, limit = 3) {
    const current = archive.films.get(filmKeyValue);
    if (!current) return [];
    const relatedJourneys = archive.journeys.filter(journey=>journey.entries.some(entry=>entry.film.key===current.key));
    const currentPairs = archive.matchups.filter(pair=>pair.entries.some(entry=>entry.film.key===current.key));
    const currentCategories = new Set([...current.wins,...current.mentions].map(award=>award.id).filter(id=>!negativeAwards.has(id)&&id!=='best-picture'));
    const candidates = archive.filmList.filter(film=>film.key!==current.key && normal(film.title)!==normal(current.title)).map(film=>{
      const directPairs = currentPairs.filter(pair=>pair.entries.some(entry=>entry.film.key===film.key));
      const sameJourneys = relatedJourneys.filter(journey=>journey.entries.some(entry=>entry.film.key===film.key));
      const sharedTags = current.tags.filter(tag=>film.tags.includes(tag));
      const sharedCategories = unique([...film.wins,...film.mentions].filter(award=>currentCategories.has(award.id)),award=>award.id);
      const score = directPairs.length*13 + sameJourneys.length*9 + sharedTags.length*2 + sharedCategories.length*1.15;
      const reason = directPairs[0]?.theme || sameJourneys[0]?.title || sharedTags.slice(0,2).join(' · ') || sharedCategories[0]?.name;
      return {film,reason,score:score+(film.editionId!==current.editionId ? .45 : 0),relevant:score>0};
    }).filter(item=>item.relevant && item.reason).sort((a,b)=>b.score-a.score || a.film.title.localeCompare(b.film.title));
    const result = candidates.slice(0,limit);
    const cross = candidates.find(candidate=>candidate.film.editionId!==current.editionId);
    if (result.length && cross && !result.some(item=>item.film.editionId!==current.editionId)) result[result.length-1]=cross;
    return result;
  }

  const API = {makeArchive, makeQuiz, dailyFrame, cleanBallot, ballotSummary, cleanMatchupRound, matchupSummary, connectionFilms, memoryTypes, shuffle};
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else window.ArchiveScreeningData = API;
})();
