/* Offline checks of the instrument's mechanics, not psychometric validation. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const repo=path.resolve(__dirname,".."),site=path.join(repo,"1-Site");
const load=(adaptive=true)=>{
  const ctx=vm.createContext({});
  for(const file of ["cinema-profile-data.js","cinema-profile-film-links.js","cinema-profile-visual.js",
    ...(adaptive?["cinema-profile-scene-bank.js","cinema-profile-adaptive.js"]:[]),"cinema-profile-core.js","cinema-profile-counterframe.js","cinema-profile-media.js"])
    vm.runInContext(fs.readFileSync(path.join(site,file),"utf8"),ctx);
  return ctx;
};
const ctx=load(),D=ctx.CinemaProfileData,C=ctx.CinemaProfileCore,CF=ctx.CinemaCounterframe,A=D.adaptive;
const axes=["od","observer","decider","sn","tf"];
const plain=value=>JSON.parse(JSON.stringify(value));
const asset=name=>name.startsWith("assets/")?name:"assets/films/"+name;
const exists=name=>fs.existsSync(path.join(site,name))||
  (name.startsWith("assets/films/")&&fs.existsSync(path.join(repo,"2-Artwork","films",path.basename(name))));
const checkArt=name=>{
  assert(name);const source=asset(name);
  assert(exists(source),source);
  assert(ctx.ArchiveProfileMedia.sizes[source],source+" missing responsive index");
  for(const variant of ctx.ArchiveProfileMedia.variants[source]||[])assert(exists(variant.src),variant.src);
};
const localized=value=>assert(value?.en?.trim()&&value?.ar?.trim());

const catalog=Object.fromEntries(["2010-2019","2020-2026"].map(edition=>[edition,JSON.parse(fs.readFileSync(path.join(site,"content",edition+".json"),"utf8")).films]));
const normalizedTitle=value=>value.normalize("NFKD").replace(/\p{M}/gu,"").toLowerCase().replace(/[^a-z0-9]/g,"");
for(const [id,href] of Object.entries(D.archiveFilmById)){
  const url=new URL(href,"https://example.test/");
  const destination=catalog[url.searchParams.get("edition")]?.[url.searchParams.get("film")];
  assert(destination&&D.filmById[id],id);
  assert.equal(destination.year,D.filmById[id].year);
  assert.equal(normalizedTitle(destination.title),normalizedTitle(D.filmById[id].title));
}
const activeFilmIds=new Set([D.introCover.filmId,...D.introFilms,...[...D.questions,...A.questions,...CF.questions].flatMap(slot=>[slot,...(slot.forms||[])].flatMap(form=>[form.filmId,...(form.options||[]).map(option=>option.filmId)].filter(Boolean)))]);
for(const id of activeFilmIds)assert(D.archiveFilmById[id],"Missing film-file route: "+id);
assert.equal(D.introCover.filmId,"blade-runner");
assert.equal(D.introCover.still,"blade-runner-2049-best-cinematography.webp");
assert.deepEqual(Array.from(D.introFilms),["phantom-thread","souvenir","her"]);
checkArt(D.introCover.still);
for(const id of D.introFilms)checkArt(D.introFrames[id]);

assert.equal(D.coreLimit,25);assert.equal(D.fullLimit,43);
assert.equal(A.coreLimit,32);assert.equal(A.fullLimit,56);
assert.equal(new Set(A.questions.map(q=>q.id)).size,56);
const primaryFilms=q=>q.filmId?[q.filmId]:q.options.map(o=>o.filmId);
for(let i=1;i<A.questions.length;i++)assert(primaryFilms(A.questions[i]).every(id=>!primaryFilms(A.questions[i-1]).includes(id)));
for(let block=0;block<7;block++){
  const row=A.questions.slice(block*8,block*8+8);
  assert.equal(row[7].purpose,"rating");
  assert.deepEqual(Array.from(row.filter(q=>q.purpose==="coin").map(q=>q.coin)).sort(),axes.slice().sort());
  assert.equal(row.slice(0,7).filter(q=>q.purpose==="taste"||q.purpose==="motive").length,2);
  assert(row.slice(0,7).every(q=>q.kind==="visual"));
  assert(row.every(q=>q.block===block+1&&q.stage===(block<4?"core":"depth")));
}
const slots=A.questions.filter(q=>q.purpose==="coin");
assert.equal(slots.length,35);
assert.equal(A.revision,"scene-v2");
assert(slots.filter(q=>new Set(q.options.map(o=>o.filmId)).size===1).length>=8,"include within-film comparisons");
assert.equal(A.questions.filter(q=>q.purpose==="taste").length,5);
assert.equal(A.questions.filter(q=>q.purpose==="motive").length,9);
const motives=Array(9).fill(0);
for(const slot of A.questions.filter(q=>q.purpose==="motive"))for(const option of slot.options)motives[option.motiveId-1]++;
assert(motives.every(n=>n===2));
for(const slot of A.questions){
  localized(slot.prompt);
  if(slot.purpose==="coin"){
    assert.equal(slot.forms.length,3);
    assert.equal(slot.forms[2].kind,"scenario");
    localized(slot.forms[2].scene);
    assert(slot.forms[0].options.every(o=>slot.forms[1].options.every(a=>a.filmId!==o.filmId)));
    for(const form of slot.forms){
      assert(form.cinematic);localized(form.prompt);
      for(const [i,o] of form.options.entries()){
        assert.equal(o.signal[slot.coin],i===0?1:-1);
        if(form.kind==="visual")assert(!/poster|[-_]wide\.webp$/i.test(o.still),"use a scene or character still, not a poster");
      }
      if(form.kind==="visual")assert.notEqual(form.options[0].still,form.options[1].still);
    }
    for(let i=0;i<2;i++){
      assert.equal(new Set(slot.forms.map(f=>f.options[i].label.en)).size,3);
      assert.equal(new Set(slot.forms.map(f=>f.options[i].label.ar)).size,3);
    }
  }
  if(slot.purpose==="rating"){
    assert.equal(slot.forms.length,2);
    assert.notEqual(slot.forms[0].filmId,slot.forms[1].filmId);
    for(const form of slot.forms){
      assert(D.filmById[form.filmId]);checkArt(form.still);
      if(form.kind==="ending")assert(form.endingTags.length>0);
    }
  }else{
    for(const form of slot.forms||[slot])for(const option of form.options){
      if(slot.purpose!=="taste"||option.label?.en||option.label?.ar)localized(option.label);
      if(form.kind==="visual"){assert(D.filmById[option.filmId]);checkArt(option.still);}
      else assert.equal(option.filmId,"");
    }
  }
}
for(const axis of axes){
  const matching=slots.filter(q=>q.coin===axis);
  assert.equal(matching.length,7);
  assert.equal(new Set(matching.flatMap(q=>q.forms[0].options.map(o=>o.filmId))).size,
    matching.reduce((n,q)=>n+new Set(q.forms[0].options.map(o=>o.filmId)).size,0));
  assert(new Set(matching.slice(0,4).map(q=>q.evidenceKind)).size>=2);
  for(let seed=0;seed<50;seed++){
    const first=q=>C.orderedOptions(q,"visual",seed)[0].id;
    assert.equal(matching.slice(0,4).filter(q=>first(q)==="1").length,2);
    assert([1,2].includes(matching.slice(4).filter(q=>first(q)==="1").length));
    for(const q of matching)assert.equal(first(q),first(A.form(q,{form:2})));
  }
}
for(const q of CF.questions){
  assert.equal(q.forms.length,3);localized(q.forms[2].scene);
  assert(q.forms[1].options.every(o=>q.forms[0].options.every(a=>a.filmId!==o.filmId)));
  for(const form of q.forms)for(const [i,o] of form.options.entries()){
    assert.equal(o.code,q.options[i].code);localized(o.label);
    if(form.source==="film")checkArt(o.still);
  }
}

const base=(limit=A.fullLimit)=>{
  const state=C.createState("en");state.limit=limit;state.route="result";return state;
};
function answer(state,slot,{form=0,choice="1",rating=4,neutral=false,skip=false}={}){
  const q=C.formForAnswer(slot,{form});
  if(skip||neutral){state.answers[slot.id]={form,mode:skip?"skip":"neutral",done:true};return;}
  if(q.purpose==="rating"){
    state.familiarity[q.filmId]="seen";
    state.answers[q.id]={form,mode:"actual",rating,watched:true,done:true};return;
  }
  const saved={form,mode:q.kind==="scenario"?"text":"visual",choice,considered:q.options.map(o=>o.id),done:true};
  if(q.purpose==="coin"&&q.kind==="visual"){
    saved.confirmed=true;saved.recalled=[...new Set(q.options.map(o=>o.filmId))];
    for(const id of saved.recalled)state.familiarity[id]="seen";
  }
  state.answers[q.id]=saved;
}
function filled(configuration=()=>({}),limit=A.fullLimit){
  const state=base(limit);
  for(const slot of A.questions.slice(0,limit))answer(state,slot,configuration(slot));
  return state;
}
const allFilm=filled(),filmProfile=C.calculate(allFilm);
assert.equal(filmProfile.cognitiveCount,35);
assert.equal(filmProfile.answered,56);assert.equal(filmProfile.completed,56);
assert.equal(filmProfile.consistency,"consistent");
assert.equal(filmProfile.type,"IxxJ");assert.equal(filmProfile.functionPair,"ST");
assert.equal(filmProfile.motiveSpectrum.answered,9);assert(filmProfile.motiveSpectrum.coverage);
assert.equal(filmProfile.endRatings.length,4);
assert.equal(filmProfile.examples.filter(e=>e.kind==="satisfaction").length,3);
for(const axis of axes){const b=filmProfile.balance[axis];assert.equal(b.count,7);assert.equal(b.sources.film.count,7);assert.equal(b.status,"repeated");}
const alternate=filled(q=>q.purpose==="coin"?{form:1}:{});
const altProfile=C.calculate(alternate);
for(const axis of axes)assert.equal(altProfile.balance[axis].value,filmProfile.balance[axis].value);
const allText=filled(q=>q.purpose==="coin"?{form:2}:q.purpose==="rating"?{skip:true}:{});
const textProfile=C.calculate(allText);
assert.equal(textProfile.cognitiveCount,35);assert.equal(textProfile.answered,49);
assert.equal(textProfile.familiarity.seen.length,0);assert.equal(textProfile.consistency,"tentative");
for(const axis of axes){assert.equal(textProfile.balance[axis].status,"provisional");assert.equal(textProfile.balance[axis].sources.text.count,7);}
const mixed=filled(q=>q.purpose==="coin"?{form:q.coin==="sn"&&q.block<=2?0:2,choice:q.coin==="sn"&&q.block<=2?"2":"1"}:{});
assert(C.calculate(mixed).balance.sn.sourceConflict);assert(!C.calculate(mixed).balance.sn.clear);

const open=filled(q=>({neutral:q.purpose!=="rating",skip:q.purpose==="rating"}));
const openProfile=C.calculate(open);
assert.equal(openProfile.cognitiveCount,0);assert.equal(openProfile.type,"");
for(const axis of axes)assert.equal(openProfile.balance[axis].neutral,7);
let plan=A.refinePlan(open,openProfile);assert.equal(plan.length,6);
open.refinement=Array.from(plan);open.limit=62;
for(const q of A.refinement.filter(q=>plan.includes(q.id)))answer(open,q,{neutral:true});
plan=A.refinePlan(open,C.calculate(open));assert.equal(plan.length,4);
assert(plan.every(id=>!open.refinement.includes(id)));
open.refinement.push(...plan);open.limit=66;
assert.equal(new Set(C.questionsForState(open).map(q=>q.id)).size,66);
for(const q of A.refinement.filter(q=>plan.includes(q.id)))answer(open,q,{neutral:true});
assert.equal(A.refinePlan(open,C.calculate(open)).length,0);
assert.equal(A.refinePlan(allFilm,filmProfile).length,0);

const unverified=base(32),probe=slots[0];
unverified.answers[probe.id]={form:0,mode:"visual",choice:"1",considered:["1","2"],done:true};
assert.equal(C.calculate(unverified).cognitiveCount,0);
assert.equal(C.calculate(unverified).balance[probe.coin].unverified,1);
answer(unverified,probe);
assert.equal(C.calculate(unverified).cognitiveCount,1);
unverified.familiarity[probe.forms[0].options[0].filmId]="unseen";
assert.equal(C.calculate(unverified).cognitiveCount,0);
const familiar=base();
const formOptions=probe.forms[0].options;
familiar.familiarity[formOptions[0].filmId]="unseen";
assert.equal(A.selectForm(probe,familiar),1);
familiar.familiarity[probe.forms[1].options[0].filmId]="not-interested";
assert.equal(A.selectForm(probe,familiar),2);

const flippedCoins=C.calculate(filled(q=>({choice:q.purpose==="coin"?"2":"1"})));
assert.deepEqual(plain(flippedCoins.taste),plain(filmProfile.taste));
assert.deepEqual(plain(flippedCoins.motiveSpectrum),plain(filmProfile.motiveSpectrum));
const flippedTaste=C.calculate(filled(q=>({choice:q.purpose==="taste"?"2":"1"})));
for(const axis of axes)assert.equal(flippedTaste.balance[axis].value,filmProfile.balance[axis].value);
assert.deepEqual(plain(flippedTaste.motiveSpectrum),plain(filmProfile.motiveSpectrum));
const flippedMotive=C.calculate(filled(q=>({choice:q.id==="a-motive-1"?"2":"1"})));
assert.deepEqual(plain(flippedMotive.taste),plain(filmProfile.taste));
assert.notDeepEqual(plain(flippedMotive.motiveSpectrum.rows),plain(filmProfile.motiveSpectrum.rows));
const frameOnly=base();answer(frameOnly,A.questions.find(q=>q.tasteScope==="frame"));
assert(Object.keys(C.calculate(frameOnly).taste).every(t=>D.groups.style.includes(t)||D.groups.tone.includes(t)));
const endingOnly=base();answer(endingOnly,A.questions.find(q=>q.kind==="ending"));
assert(Object.keys(C.calculate(endingOnly).taste).every(t=>D.groups.endings.includes(t)));

const cf=CF.create();
for(const q of CF.questions)cf.answers[q.id]={form:2,kind:"choice",choice:"1",strength:4,done:true};
cf.complete=true;
assert.equal(CF.evaluate(cf,filmProfile).directional,12);
assert(CF.evaluate(cf,filmProfile).axes.every(a=>a.lead?.provisional&&a.text===3));
assert(!CF.validAnswer(CF.questions[0],{form:0,kind:"choice",choice:"1",strength:4,done:true}));
allFilm.counterframe=cf;
const stillFilm=C.calculate(allFilm);
assert.deepEqual(plain(stillFilm.balance),plain(filmProfile.balance));
assert.deepEqual(plain(stillFilm.taste),plain(filmProfile.taste));
const prompt=C.buildPrompt(stillFilm,allFilm,"en");
assert(prompt.includes("Evidence by contrast"));assert(prompt.includes("OPS cognitive family: IxxJ"));
assert(prompt.includes("Independent story-motive choices: 9/9"));assert(prompt.includes("Counterframe"));
assert(C.buildPrompt(textProfile,allText,"ar").includes("أدلة نصية"));

// The presence of the new bank must not reinterpret the previous edition.
const classic=load(false),legacy=C.createState("en",{legacy:true});
assert.equal(legacy.version,5);
for(const q of D.questions.slice(0,legacy.limit)){
  if(q.kind==="ending"){legacy.answers[q.id]={mode:"actual",rating:4,done:true};legacy.familiarity[q.filmId]="seen";}
  else {
    legacy.answers[q.id]={mode:"visual",choice:"1",confirmed:Boolean(q.coin),considered:q.options.map(o=>o.id),done:true};
    if(q.coin)for(const o of q.options)legacy.familiarity[o.filmId]="seen";
  }
}
assert.deepEqual(plain(C.calculate(legacy)),plain(classic.CinemaProfileCore.calculate(legacy)));

let seed=99;
const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let trial=0;trial<120;trial++){
  const state=filled(slot=>{
    const r=rng();
    if(r<.10)return {skip:true};if(r<.19&&slot.purpose!=="rating")return {neutral:true};
    return {form:slot.purpose==="coin"?Math.floor(rng()*3):slot.purpose==="rating"?Math.floor(rng()*2):0,
      choice:rng()<.5?"1":"2",rating:1+Math.floor(rng()*5)};
  },trial%2?32:56);
  const p=C.calculate(state);
  assert.equal(p.completed,state.limit);
  assert(p.answered<=p.completed);
  for(const axis of axes){
    const b=p.balance[axis];assert(b.percent>=0&&b.percent<=100);
    assert.equal(b.count,b.sources.film.count+b.sources.text.count);
    assert.equal(b.positive+b.negative,b.count);
  }
}
console.log(JSON.stringify({core:32,depth:24,main:56,blocks:7,cognitiveSlots:35,
  filmAndTextForms:105,motiveChoices:9,tasteChoices:5,ratings:7,refinementBank:10,counterframe:12,
  responsiveAssets:true,isolatedEvidence:true,legacyUnchanged:true,syntheticCases:120}));
