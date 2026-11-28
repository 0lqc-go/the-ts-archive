// Keep the homepage independent of the full award/quiz/search payloads.
// Generate the two projections from the exact runtime selection routines.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..', '1-Site');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (name, content) => fs.writeFileSync(path.join(root, name), JSON.stringify(content) + '\n');
const baseCatalog = read('content/catalog.json');
const shared = read('content/artwork-variants.json');
const catalog = {...baseCatalog,media:{
  sizes:{...baseCatalog.media?.sizes,...shared.sizes},
  variants:{...baseCatalog.media?.variants,...shared.variants}
}};
const context = vm.createContext({
  document: {querySelector: () => null, body: {dataset: {page: 'awards'}}},
  window: {ArchiveSite: {
    read: async name => read(name),
    editionHref: id => `awards.html?edition=${id}`,
    listHref: list => `snubs.html?list=${list.id}`
  }}
});
vm.runInContext(fs.readFileSync(path.join(root,'archive-explore.js'),'utf8'),context);
require(path.join(root,'cinematic-journeys.js'));
const screening = require(path.join(root,'screening-data.js'));

async function main() {
  const homePaths = [...new Set([
    catalog.homeCover?.cover,
    ...catalog.editions.map(item=>item.cardImage||item.cover),
    ...catalog.lists.map(item=>item.cardImage||item.cover),
    'assets/films/past-lives-film-file.webp',
    'assets/films/anna-karenina-production-design-curator.webp'
  ].filter(Boolean))];
  const homeMedia = {sizes:{},variants:{}};
  for (const file of homePaths) {
    if (catalog.media.sizes[file]) homeMedia.sizes[file] = catalog.media.sizes[file];
    if (catalog.media.variants[file]) homeMedia.variants[file] = catalog.media.variants[file];
  }
  write('content/home-catalog.json',{...baseCatalog,media:homeMedia});
  // Start the home cover at HTML parse time. Its source and dimensions
  // follow the curator's current selection automatically.
  const cover = catalog.homeCover || catalog.editions.find(item=>item.id===catalog.featuredEdition);
  const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const htmlFile = path.join(root,'index.html');
  let html = fs.readFileSync(htmlFile,'utf8');
  const responsive = (file, sizes) => {
    const variants = homeMedia.variants[file] || [];
    return `src="${escape(variants.find(item=>item.width>=640)?.src || file)}"${variants.length>1 ? ` srcset="${escape(variants.map(item=>item.src+' '+item.width+'w').join(', '))}" sizes="${sizes}"` : ''}`;
  };
  const [w,h] = homeMedia.sizes[cover.cover] || [1280,690];
  const coverMarkup = `<div class="hero-image" aria-hidden="true" style="--cover-position:${escape(cover.coverPosition||'54% 58%')};--cover-mobile-position:${escape(cover.coverMobilePosition||'51% center')}"><img data-archive-cover="${escape(cover.cover)}" class="cover-art" ${responsive(cover.cover,'max(100vw, 140svh, 960px)')} alt="" width="${w}" height="${h}" decoding="async" fetchpriority="high"></div>`;
  html = html.replace(/<!-- home-cover:start -->[\s\S]*?<!-- home-cover:end -->/, `<!-- home-cover:start -->${coverMarkup}<!-- home-cover:end -->`);
  for (const [marker,file] of [['profile','assets/films/past-lives-film-file.webp'],['journey','assets/films/anna-karenina-production-design-curator.webp']]) {
    const [width,height] = homeMedia.sizes[file];
    const sizes = '(min-width: 681px) 44vw, 88vw';
    html = html.replace(new RegExp(`<!-- home-${marker}:start -->[\\s\\S]*?<!-- home-${marker}:end -->`), `<!-- home-${marker}:start --><img ${responsive(file,sizes)} alt="" width="${width}" height="${height}" loading="lazy" decoding="async"><!-- home-${marker}:end -->`);
  }
  fs.writeFileSync(htmlFile,html);
  const explore = context.window.ArchiveExplore;
  const models = await explore.createEngine(catalog).load('all');
  const moods = explore.homeMoodCards(models);
  assert.equal(moods.length, 3);
  write('content/home-moods.json', moods);

  const complete = screening.makeArchive(models);
  const filmInfo = ({key,slug,title,year,href}) => ({key,slug,title,year,href});
  const frameInfo = ({path,width,height,credit}) => ({path,width,height,...(credit?{credit}:{})});
  function eligibleFrames(film) {
    const wide = film.frames.filter(frame => frame.width / frame.height >= 1.5);
    const strongest = wide.filter(frame => frame.width >= 1600);
    return (strongest.length ? strongest : wide).map(frameInfo);
  }
  const filmList = complete.filmList.map(film => ({...filmInfo(film),frames:eligibleFrames(film)})).filter(film=>film.frames.length);
  const journeys = complete.journeys.map(journey => ({id:journey.id,entries:journey.entries.map(({film,frame})=>({film:filmInfo(film),frame:frameInfo(frame)}))}));
  const archive = {filmList,journeys};
  const allVariants = Object.assign({},catalog.media?.variants,...models.map(m=>m.media.variants));
  const allSizes = Object.assign({},catalog.media?.sizes,...models.map(m=>m.media.sizes));
  const sizes = {}, variants = {};
  function add(frame) {
    sizes[frame.path] = allSizes[frame.path] || [frame.width,frame.height];
    const options=frame.variants || allVariants[frame.path];
    if (options?.length) {
      // The daily card is bounded to a much smaller screen than the viewer.
      const firstLarge = options.findIndex(option=>option.width>=1360);
      variants[frame.path] = firstLarge<0 ? options : options.slice(0,firstLarge+1);
    }
  }
  filmList.forEach(film=>film.frames.forEach(add));
  journeys.forEach(journey=>journey.entries.forEach(entry=>add(entry.frame)));
  // Independently compare the projected archive to the full archive for
  // every daily rotation across several decades, including dated choices.
  const start = Date.UTC(2020,0,1), days = 365*20;
  for (let i = 0; i < days; i++) {
    const dateUTC = new Date(start + i*86400000);
    const date = new Date(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate(), 12);
    const full = screening.dailyFrame(complete,date);
    const lite = screening.dailyFrame(archive,date);
    assert.equal(lite.film.key,full.film.key,date.toISOString());
    assert.equal(lite.frame.path,full.frame.path,date.toISOString());
    assert.equal(lite.frame.credit,full.frame.credit,date.toISOString());
    assert.equal(lite.day,full.day,date.toISOString());
    add(lite.frame);
  }
  write('content/home-daily.json',{archive,media:{sizes,variants}});
  console.log('Home moods:', moods.map(card=>`${card.label} ${card.count}`).join(', '));
  console.log('Verified daily selection:', days, 'days; eligible films:', filmList.length);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
