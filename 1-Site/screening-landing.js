/* The Screening Room programme — lightweight directory with a curated cover. */
(() => {
  'use strict';
  const root=document.getElementById('screening-landing');
  const params=new URLSearchParams(location.search);
  const active=Boolean(root&&(!params.get('mode')||params.get('mode')==='landing'));
  window.ArchiveScreeningLanding={active};
  if(!active)return;
  const art={
    "babylon-2022-wide.webp": ["assets/films/babylon-2022-wide.webp",[1920,1080],[["assets/gallery/2020-2026/thumbs/babylon-2022-63df61638bb0-320w.webp",320],["assets/films/babylon-2022-wide.webp",1920]]],
    "tenet-alt-01.webp": ["assets/films/tenet-alt-01.webp",[1250,703],[["assets/gallery/2020-2026/thumbs/tenet-fcc810d27c50-320w.webp",320],["assets/films/tenet-alt-01.webp",1250]]],
    "eaf64409575d.webp": ["assets/gallery/2010-2019/1917/eaf64409575d.webp",[1280,533],[["assets/gallery/2010-2019/thumbs/1917-eaf64409575d-320w.webp",320],["assets/gallery/2010-2019/1917/eaf64409575d-768w.webp",768],["assets/gallery/2010-2019/1917/eaf64409575d.webp",1280]]],
    "the-souvenir-daily-frame.jpg": ["assets/films/the-souvenir-daily-frame.jpg",[2000,1153],[["assets/gallery/2010-2019/thumbs/the-souvenir-daily-frame-320w.webp",320],["assets/films/responsive/the-souvenir-daily-frame-640w.webp",640],["assets/films/responsive/the-souvenir-daily-frame-960w.webp",960],["assets/films/responsive/the-souvenir-daily-frame-1280w.webp",1280],["assets/films/responsive/the-souvenir-daily-frame-1920w.webp",1920],["assets/films/the-souvenir-daily-frame.jpg",2000]]],
    "680fd3349108.webp": ["assets/gallery/2010-2019/blade-runner-2049/680fd3349108.webp",[1280,546],[["assets/gallery/2010-2019/thumbs/blade-runner-2049-680fd3349108-320w.webp",320],["assets/gallery/2010-2019/blade-runner-2049/680fd3349108-768w.webp",768],["assets/gallery/2010-2019/blade-runner-2049/680fd3349108.webp",1280]]],
    "inception-curator-frame-14.webp": ["assets/films/inception-curator-frame-14.webp",[3840,1600],[["assets/gallery/2010-2019/thumbs/inception-curator-frame-14-320w.webp",320],["assets/films/responsive/inception-curator-frame-14-640w.webp",640],["assets/films/responsive/inception-curator-frame-14-960w.webp",960],["assets/films/responsive/inception-curator-frame-14-1280w.webp",1280],["assets/films/responsive/screen-7110d0aa98a7-2560w.webp",2560],["assets/films/responsive/screen-7110d0aa98a7-3840w.webp",3840]]],
    "past-lives-film-file.webp": ["assets/films/past-lives-film-file.webp",[1680,945],[["assets/gallery/2020-2026/thumbs/past-lives-8c69a4356a3a-320w.webp",320],["assets/films/past-lives-film-file.webp",1680]]],
    "9503aa1ca9e8.webp": ["assets/gallery/2020-2026/dune-part-two/9503aa1ca9e8.webp",[1920,801],[["assets/gallery/2020-2026/thumbs/dune-part-two-9503aa1ca9e8-320w.webp",320],["assets/gallery/2020-2026/dune-part-two/9503aa1ca9e8-768w.webp",768],["assets/gallery/2020-2026/dune-part-two/9503aa1ca9e8-1280w.webp",1280],["assets/gallery/2020-2026/dune-part-two/9503aa1ca9e8.webp",1920]]],
    "the-batman-wide.webp": ["assets/films/the-batman-wide.webp",[1920,1080],[["assets/gallery/2020-2026/thumbs/the-batman-489b6b5fa63a-320w.webp",320],["assets/films/the-batman-wide.webp",1920]]],
    "phantom-thread-best-actor-curator.webp": ["assets/films/phantom-thread-best-actor-curator.webp",[1280,720],[["assets/gallery/2010-2019/thumbs/phantom-thread-1e762fbf2af3-320w.webp",320],["assets/films/responsive/phantom-thread-best-actor-curator-640w.webp",640],["assets/films/responsive/phantom-thread-best-actor-curator-960w.webp",960],["assets/films/phantom-thread-best-actor-curator.webp",1280]]],
    "anna-karenina-production-design-curator.webp": ["assets/films/anna-karenina-production-design-curator.webp",[1280,536],[["assets/gallery/2010-2019/thumbs/anna-karenina-2012-bcd130d69534-320w.webp",320],["assets/films/responsive/anna-karenina-production-design-curator-640w.webp",640],["assets/films/responsive/anna-karenina-production-design-curator-960w.webp",960],["assets/films/anna-karenina-production-design-curator.webp",1280]]],
  };
  const cover={ref:'babylon-2022-wide.webp',film:'Babylon',year:2022,slug:'babylon-2022',edition:'2020-2026',position:'58% 45%'};
  const games=[
    ['frame','Guess the Frame','Recognize the film through a single still.','eaf64409575d.webp','Image recognition'],
    ['memory','Cinema Memory','Scenes, dialogue, music and cinematic connections.','the-souvenir-daily-frame.jpg','Film knowledge'],
    ['signature','Visual Signature','Read the eye behind the image.','680fd3349108.webp','Directors & cinematographers'],
    ['winner','Guess the Winner','Recall the archive’s award selections.','9503aa1ca9e8.webp','The archive awards'],
    ['editor','The Editor','Put the frames back in screen order.','inception-curator-frame-14.webp','Sequence puzzles'],
    ['connections','Connections','Discover the credits linking nine films.','past-lives-film-file.webp','Credit connections']
  ];
  const daily=['daily','Daily Challenge','Five shared questions. A new round each day.','the-batman-wide.webp','Daily · 5 questions'];
  const explore=[
    ['matchup','This or That','Choose between two cinematic moments.','phantom-thread-best-actor-curator.webp'],
    ['ballot','My Ballot','Make your own selections across the decades.','tenet-alt-01.webp'],
    ['journeys','Film Journeys','Follow visual and thematic threads.','anna-karenina-production-design-curator.webp']
  ];
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const href=mode=>'screening-room.html?mode='+mode;
  const movieHref='awards.html?edition='+cover.edition+'&film='+cover.slug;
  const img=(ref,{hero=false,sizes='(max-width: 680px) 94vw, (max-width: 1050px) 45vw, 32vw'}={})=>{
    const [path,[width,height],variants]=art[ref];
    const preferred=variants.find(item=>item[1]>=(hero?960:640))?.[0]||path;
    return `<img src="${esc(preferred)}"${variants.length>1?` srcset="${variants.map(([src,w])=>esc(src)+' '+w+'w').join(', ')}" sizes="${hero?'100vw':sizes}"`:''} width="${width}" height="${height}" alt="" ${hero?'fetchpriority="high" loading="eager"':'loading="lazy"'} decoding="async">`;
  };
  const card=([mode,title,desc,ref,meta])=>`<a class="sr-land-card${mode==='daily'?' is-feature':''}" href="${href(mode)}"><span class="sr-land-art">${img(ref)}</span><span class="sr-land-card-copy"><span class="sr-land-card-title"><strong>${title}</strong><span aria-hidden="true">↗</span></span><small>${desc}</small>${meta?`<span class="sr-land-card-meta">${meta}</span>`:''}</span></a>`;
  root.dataset.layout='programme';root.dataset.cover='babylon';
  root.innerHTML=`<section class="sr-land-hero" aria-labelledby="sr-landing-title" style="--sr-cover-position:${cover.position}">
    <div class="sr-land-hero-art">${img(cover.ref,{hero:true})}</div>
    <div class="section-shell sr-land-hero-copy">
      <p class="sr-land-eyebrow">THE T.S. ARCHIVE / INTERACTIVE CINEMA</p>
      <h1 id="sr-landing-title">Screening Room</h1>
      <p class="sr-land-subtitle">Play, compare and explore the archive.</p>
      <p class="sr-land-framework">QUIZZES · CONNECTIONS · FILM JOURNEYS</p>
      <div class="sr-land-hero-actions"><a class="sr-primary" href="screening-room.html?mode=daily">Play daily challenge</a><a class="sr-land-quiet-link" href="#sr-game-directory">Explore the programme ↘</a></div>
    </div>
    <div class="section-shell sr-land-hero-credit"><a href="${movieHref}">${cover.film} · ${cover.year} <span aria-hidden="true">↗</span></a></div>
  </section>
  <section class="section-shell sr-land-content" id="sr-game-directory">
    <div class="sr-land-section-heading"><h2>The programme.</h2><p>A collection of cinematic challenges.</p></div>
    <div class="sr-land-grid">${[daily,...games].map(card).join('')}</div>
    <div class="sr-land-section-heading sr-land-explore-heading"><h2>Beyond the quiz.</h2><p>No right answer. Just your cinema.</p></div>
    <div class="sr-land-explore-grid">${explore.map(card).join('')}</div>
  </section>`;
  document.body.classList.add('sr-landing-page');
  root.hidden=false;
  document.getElementById('screening-play').hidden=true;
  const updateHeader=()=>document.body.classList.toggle('sr-landing-scrolled',scrollY>36);
  updateHeader();addEventListener('scroll',updateHeader,{passive:true});
})();
