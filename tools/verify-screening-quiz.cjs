const assert = require('node:assert/strict');
const data = require('../1-Site/screening-data.js');
const bank = require('../1-Site/screening-challenge-bank.js');
const catalog = require('../1-Site/content/catalog.json');
const media = require('../1-Site/content/artwork-variants.json');
const archive = data.makeArchive(catalog.editions.map(edition=>({
  edition, data:require('../1-Site/content/'+edition.id+'.json'), media
})));
const counts = {};
const run = (mode, difficulty, scope='all', category='all') => {
  const options = {scope,category,difficulty};
  const pool = data.quizPool(archive,mode,options);
  const keys = new Set(pool.map(q=>q.key)), history = {};
  assert.equal(keys.size,pool.length);
  assert.ok(pool.length>0, JSON.stringify({mode,...options}));
  const choiceCount = difficulty==='classic'?3:4;
  for (const q of pool) {
    assert.equal(q.choices.length,choiceCount);
    assert.equal(new Set(q.choices.map(c=>c.key)).size,choiceCount);
    assert.equal(q.choices.filter(c=>c.key===q.correct.key).length,1);
    if (scope!=='all') assert.equal(q.film.editionId,scope);
    if (category!=='all') assert.equal(q.subtype,category);
  }
  let remaining = pool.length;
  while (remaining) {
    const round = data.makeQuiz(archive,mode,{...options,history});
    assert.equal(round.length,Math.min(remaining,5));
    for (const q of round) {
      assert.ok(keys.has(q.key));
      assert.equal(history[q.key],undefined,'Question repeated before cycle ended');
      history[q.key]=1;
    }
    remaining-=round.length;
  }
  const restart = data.makeQuiz(archive,mode,{...options,history});
  assert.equal(restart.length,Math.min(pool.length,5));
  assert.ok(restart.every(q=>history[q.key]===1));
  return pool.length;
};
for (const difficulty of ['classic','challenge']) {
  counts[difficulty]={};
  for (const mode of ['frame','memory','winner']) {
    counts[difficulty][mode]=run(mode,difficulty);
    for (const edition of catalog.editions) run(mode,difficulty,edition.id);
  }
  for (const category of data.memoryTypes) counts[difficulty][category]=run('memory',difficulty,'all',category);
}
assert.equal(counts.challenge.frame,Object.values(bank.frames).flat().length);
assert.equal(counts.challenge.details,Object.values(bank.details).flat().length);
for (const [id,rows] of Object.entries(bank.quotes)) for (const [slug,quote] of rows) {
  assert.ok(archive.memory.some(q=>q.film.key===id+'/'+slug&&q.clue.includes(quote)));
}
const history = {};
const first = data.makeQuiz(archive,'memory',{scope:catalog.editions[0].id,category:'dialogue',difficulty:'classic'});
for (const q of first) history[q.key]=1;
const second = data.makeQuiz(archive,'memory',{difficulty:'challenge',history});
assert.ok(second.every(q=>!history[q.key]),'Changing difficulty and category must not reset seen questions');
const narrow = data.makeQuiz(archive,'frame',{scope:catalog.editions[0].id,difficulty:'classic'});
const shared = Object.fromEntries(narrow.map(q=>[q.key,1]));
assert.ok(data.makeQuiz(archive,'frame',{difficulty:'challenge',history:shared}).every(q=>!shared[q.key]));
const daily = data.dailyFrame(archive,new Date(2026,10,28,12));
assert.equal(daily.film.slug,'the-beast-2023');
assert.match(daily.frame.path,/the-beast-2023-curator-frame-20261126-07/);
console.log('Verified complete quiz cycles, all scopes, shared history and daily frame.');
console.log(JSON.stringify(counts,null,2));
