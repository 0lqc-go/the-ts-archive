const assert = require('node:assert/strict');
const data = require('../1-Site/screening-data.js');
const bank = require('../1-Site/screening-challenge-bank.js');
const games = require('../1-Site/screening-games-bank.js');
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
  for (const mode of ['frame','memory','signature','winner']) {
    counts[difficulty][mode]=run(mode,difficulty);
    for (const edition of catalog.editions) run(mode,difficulty,edition.id);
  }
  for (const category of data.memoryTypes) counts[difficulty][category]=run('memory',difficulty,'all',category);
}
const hardCount=Object.values(games.hardFrames).flat().reduce((total,row)=>total+row[1].length,0);
assert.equal(counts.challenge.frame,hardCount);
assert.equal(counts.challenge.signature,games.signatures.length);
assert.ok(data.quizPool(archive,'memory',{difficulty:'challenge'}).every(q=>q.subtype!=='signature'));
assert.ok(data.quizPool(archive,'signature',{difficulty:'challenge'}).every(q=>q.subtype==='signature'));
assert.equal(counts.challenge.pair,games.pairs.length);
const strict=data.quizPool(archive,'frame',{difficulty:'challenge'}), classic=data.quizPool(archive,'frame',{difficulty:'classic'});
assert.ok(strict.every(question=>question.hard===true));
assert.ok(strict.every(question=>classic.some(item=>item.key===question.key)));
for(const [slug,label] of [['manchester-by-the-sea','On the boat'],['moneyball','The conversation in the clubhouse'],['before-midnight','The hotel room'],['her','Theodore alone above the city']]){
  assert.ok(classic.some(q=>q.film.slug===slug&&q.frame.label===label));
  assert.ok(!strict.some(q=>q.film.slug===slug&&q.frame.label===label),'An easy example leaked into Challenge');
}
assert.equal(archive.editor.length,games.editor.length);
assert.ok(!archive.editor.some(puzzle=>['thelma-2017','moonlight-2016'].includes(puzzle.film.slug)));
for(const slug of ['the-dark-knight-rises','dune-2021','dune-part-two','avengers-infinity-war','avengers-endgame','the-wolf-of-wall-street','coco-2017','your-name'])assert.ok(archive.editor.some(puzzle=>puzzle.film.slug===slug));
assert.equal(archive.connections.length,games.connections.length);
assert.equal(archive.doubleFeatures.length,games.pairs.length);
for(const puzzle of archive.editor){
  assert.ok(puzzle.frames.length>=3&&puzzle.frames.length<=4);
  assert.equal(new Set(puzzle.frames.map(item=>item.frame.path)).size,puzzle.frames.length);
}
for(const puzzle of archive.connections){
  assert.equal(puzzle.groups.length,3);
  assert.ok(puzzle.groups.every(group=>group.films.length===3));
  assert.equal(new Set(puzzle.groups.flatMap(group=>group.films.map(film=>film.key))).size,9);
}
for(const pair of data.quizPool(archive,'memory',{category:'pair',difficulty:'challenge'})){
  assert.equal(pair.answerKind,'pair');
  assert.equal(pair.films.length,2);
  assert.ok(pair.explanation&&pair.choices.length===4);
}
assert.ok(archive.doubleFeatures.every(pair=>pair.films[0].key!==pair.films[1].key));
for(const name of ['editor','connections']){
  const history={},pool=archive[name];
  for(let i=0;i<pool.length;i++){
    const puzzle=data.nextGamePuzzle(pool,history);
    assert.equal(history[puzzle.id],undefined);
    history[puzzle.id]=1;
  }
  assert.equal(history[data.nextGamePuzzle(pool,history).id],1);
}
const date='2026-11-28', dailyQuiz=data.dailyQuiz(archive,date);
assert.equal(dailyQuiz.length,5);
assert.deepEqual(dailyQuiz.map(q=>[q.key,q.choices.map(c=>c.key)]),data.dailyQuiz(archive,date).map(q=>[q.key,q.choices.map(c=>c.key)]));
assert.ok(dailyQuiz[0].hard&&dailyQuiz[1].subtype==='dialogue'&&dailyQuiz[2].subtype==='signature'&&dailyQuiz[3].subtype==='details'&&dailyQuiz[4].answerKind==='winner');
const rotations=[counts.challenge.frame,counts.challenge.dialogue,counts.challenge.signature,counts.challenge.details,counts.challenge.winner];
const seen=rotations.map(()=>new Set());
for(let day=0;day<Math.max(...rotations);day++){
  const key=new Date(Date.parse(date+'T00:00:00Z')+day*86400000).toISOString().slice(0,10);
  data.dailyQuiz(archive,key).forEach((q,index)=>{
    if(day<rotations[index]){assert.ok(!seen[index].has(q.key),'Daily slot repeated before its rotation ended');seen[index].add(q.key);}
  });
}
assert.equal(data.dailyDateKey(new Date('2026-11-28T20:59:59Z')),'2026-11-28');
assert.equal(data.dailyDateKey(new Date('2026-11-28T21:00:00Z')),'2026-11-29');
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
const schedule=[
  ['2026-11-28T12:00:00+03:00','chungking-express',1994],
  ['2026-11-29T00:00:00+03:00','dark-city',1998],
  ['2026-11-30T00:00:00+03:00','magnetic-rose',1995]
];
for(const [date,slug,year] of schedule){
  const daily=data.dailyFrame(archive,new Date(date));
  assert.equal(daily.film.slug,slug);assert.equal(daily.film.year,year);assert.equal(daily.film.external,true);
  assert.ok(daily.frame.path.includes('daily-'+slug));
  assert.ok(daily.frame.variants.some(v=>v.width===640));
}
assert.equal(data.dailyFrame(archive,new Date('2026-11-28T20:59:59Z')).film.slug,'chungking-express');
assert.equal(data.dailyFrame(archive,new Date('2026-11-28T21:00:00Z')).film.slug,'dark-city');
assert.ok(!data.dailyFrame(archive,new Date('2026-12-01T00:00:00+03:00')).film.external);
console.log('Verified complete quiz cycles, strict frames, all scopes, game banks, daily rotation, shared history and daily frame.');
console.log('Editor: '+archive.editor.length+' sequences · Connections: '+archive.connections.length+' boards · Double Feature: '+archive.doubleFeatures.length+' programmes');
console.log(JSON.stringify(counts,null,2));
