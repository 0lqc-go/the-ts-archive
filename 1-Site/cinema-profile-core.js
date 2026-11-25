(() => {
  "use strict";

  const data = globalThis.CinemaProfileData;
  const axisNames = ["od", "observer", "decider", "sn", "tf"];
  const functionPairs = {
    ST:{name:{en:"Vérité",ar:"العدسة"},description:{en:"The world on screen becomes tangible through precise details and a coherent sequence of events.",ar:"يصبح عالم الشاشة ملموساً عبر التفاصيل الدقيقة وتسلسل الأحداث المتماسك."}},
    SF:{name:{en:"Ember",ar:"الجمر"},description:{en:"In the details of lived experience, you notice the commitments that lend a moment its warmth.",ar:"تلتقط في تفاصيل التجربة الحية ما يمنح اللحظة دفئها وقيمتها."}},
    NT:{name:{en:"Prism",ar:"الموشور"},description:{en:"You follow the architecture beneath the image, testing how different possibilities illuminate the whole.",ar:"تتتبّع البنية الكامنة خلف الصورة، وتختبر كيف تضيء الاحتمالات المختلفة العمل بأكمله."}},
    NF:{name:{en:"Reverie",ar:"الرؤيا"},description:{en:"You follow what images evoke, how their meanings echo and what makes a character's choices matter.",ar:"تتتبّع ما توحي به الصور، وكيف تتردد معانيها، وما يمنح اختيارات الشخصيات وزنها."}}
  };
  const alias = {
    emotion:"emotional", group:"community", architecture:"visual", psychology:"psychological",
    investigation:"truth", style:"stylized", relationships:"relationship", longing:"love",
    melancholy:"melancholic", symbolism:"symbolic", reasoning:"problemSolving",
    loyalty:"duty", responsibility:"duty", connection:"relationship", closure:"closed"
  };
  const ratingNames = {
    en:["Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"],
    ar:["غير راضي جدًا", "غير راضي", "بالنص", "راضي", "راضي جدًا"]
  };
  const ageLabels = {
    "":{en:"Prefer not to say",ar:"أفضل عدم الإجابة"},
    "under18":{en:"Under 18",ar:"أقل من 18"},
    "18-24":{en:"18–24",ar:"18–24"}, "25-34":{en:"25–34",ar:"25–34"},
    "35-44":{en:"35–44",ar:"35–44"}, "45-54":{en:"45–54",ar:"45–54"},
    "55+":{en:"55 and over",ar:"55 فما فوق"}
  };
  const feelings = [
    {id:"moving",label:{en:"Moved",ar:"متأثر"},tag:"emotional"},
    {id:"sad",label:{en:"Sad",ar:"حزين"},tag:"melancholic"},
    {id:"hopeful",label:{en:"Hopeful",ar:"متفائل"},tag:"hopeful"},
    {id:"uneasy",label:{en:"Uneasy",ar:"قلق"},tag:"suspense"},
    {id:"curious",label:{en:"Curious",ar:"فضولي"},tag:"wonder"},
    {id:"peaceful",label:{en:"At peace",ar:"هادئ"},tag:"warm"},
    {id:"mixed",label:{en:"Mixed feelings",ar:"مشاعر مختلطة"},tag:"bittersweet"}
  ];
  const familyInfo = {
    IxxJ:{name:{en:"Architect",ar:"المعماري"},lead:"Oi",group:"Observer",en:"You look for the design that holds a story together.",ar:"تبحث عن البناء الذي يجمع خيوط الحكاية."},
    ExxP:{name:{en:"Voyager",ar:"الرحّالة"},lead:"Oe",group:"Observer",en:"You are drawn to the paths a story has not yet taken.",ar:"تجذبك المسارات التي لم تسلكها الحكاية بعد."},
    IxxP:{name:{en:"Auteur",ar:"المؤلّف"},lead:"Di",group:"Decider",en:"You follow the private voice behind a character's decisions.",ar:"تتبع الصوت الخاص خلف قرارات الشخصية."},
    ExxJ:{name:{en:"Conductor",ar:"المايسترو"},lead:"De",group:"Decider",en:"You follow the interplay of people, choices and shared consequences.",ar:"تتبع التفاعل بين الأشخاص والاختيارات والعواقب المشتركة."}
  };
  const animalNames = {"Oi/Di":"Sleep","Oe/Di":"Consume","Oi/De":"Blast","Oe/De":"Play"};
  const animalInfo = {
    Sleep:{pair:"Oi + Di",description:{en:"Private reflection and the revisiting of what is already known.",ar:"التأمّل الداخلي وإعادة النظر فيما هو معروف."}},
    Consume:{pair:"Oe + Di",description:{en:"Taking in new material through a personal point of view.",ar:"استقبال أفكار وتجارب جديدة عبر منظور خاص."}},
    Blast:{pair:"Oi + De",description:{en:"Giving form to what is known and communicating it to others.",ar:"صياغة ما هو معروف ومشاركته مع الآخرين."}},
    Play:{pair:"Oe + De",description:{en:"Discovering possibilities through interaction and shared momentum.",ar:"اكتشاف الاحتمالات عبر التفاعل والحركة المشتركة."}}
  };
  const impressionNames={
    Si:["Grain","Oi"],Se:["Grain","Oe"],Ni:["Motif","Oi"],Ne:["Motif","Oe"],
    Ti:["Structure","Di"],Te:["Structure","De"],Fi:["Conviction","Di"],Fe:["Conviction","De"]
  };
  const impressionWords={
    Grain:{en:"Grain",ar:"الملمس"},Motif:{en:"Motif",ar:"الإيحاء"},
    Structure:{en:"Structure",ar:"البنية"},Conviction:{en:"Conviction",ar:"القناعة"}
  };
  function familyName(key,locale){return local(familyInfo[key]?.name,locale);}
  function lensName(key,locale){return local(functionPairs[key]?.name,locale);}
  function impressionName(key,locale){
    const mapped=impressionNames[key];
    return mapped?local(impressionWords[mapped[0]],locale)+" · "+mapped[1]:key||"";
  }
  function coinLabels(locale){
    return [["od","Observer","Decider"],["observer","Oi","Oe"],["decider","Di","De"],
      ["sn",local(impressionWords.Grain,locale),local(impressionWords.Motif,locale)],
      ["tf",local(impressionWords.Structure,locale),local(impressionWords.Conviction,locale)]];
  }

  // Independent story-motive palette inspired by the nine Enneagram themes.
  // These are film affinities, NOT a measure of a person's basic fear, type,
  // wing, instinct or clinical traits. A film may express several motives.
  const motifs=[
    {id:1,name:{en:"Axiom",ar:"المبدأ"},hint:{en:"Integrity & standards",ar:"النزاهة والمعايير"},primary:["ethics","justice","duty","mastery"],secondary:["routine","restraint","craft","truth"]},
    {id:2,name:{en:"Kindred",ar:"الأُلفة"},hint:{en:"Care & belonging",ar:"الرعاية والانتماء"},primary:["relationship","familyBond","community","love"],secondary:["friendship","trust","cooperation","warm"]},
    {id:3,name:{en:"Ascend",ar:"الصعود"},hint:{en:"Achievement & recognition",ar:"الإنجاز والاعتراف"},primary:["ambition","selfWorth","mastery","power"],secondary:["authority","obsession","craft","systems"]},
    {id:4,name:{en:"Signature",ar:"الأثر"},hint:{en:"Identity & expression",ar:"الهوية والتعبير"},primary:["identity","meaning","loneliness","loss"],secondary:["memory","melancholic","symbolic","music"]},
    {id:5,name:{en:"Chamber",ar:"الحُجرة"},hint:{en:"Understanding & inquiry",ar:"الفهم والاستقصاء"},primary:["truth","puzzle","systems","problemSolving"],secondary:["perspective","uncertainty","language","contemplative"]},
    {id:6,name:{en:"Anchor",ar:"المرساة"},hint:{en:"Trust & security",ar:"الثقة والأمان"},primary:["trust","uncertainty","survival","duty"],secondary:["familyBond","control","risk","community"]},
    {id:7,name:{en:"Horizon",ar:"الأفق"},hint:{en:"Freedom & possibility",ar:"الحرية والاحتمال"},primary:["discovery","possibilities","improvisation","freedom"],secondary:["change","wonder","playful","adventure"]},
    {id:8,name:{en:"Will",ar:"الإرادة"},hint:{en:"Autonomy & resolve",ar:"الاستقلال والحزم"},primary:["power","freedom","authority","control"],secondary:["justice","resilience","survival","ambition"]},
    {id:9,name:{en:"Stillwater",ar:"السكون"},hint:{en:"Harmony & reconciliation",ar:"الانسجام والمصالحة"},primary:["cooperation","friendship","hope","warm"],secondary:["relationship","trust","familyBond","growth"]}
  ];
  function motiveSpectrum(state){
    const totals=motifs.map(m=>({motif:m,sum:0,mass:0,count:0,positive:0,negative:0,films:new Set()}));
    const strengths=new Map();
    function weights(id){
      if(strengths.has(id))return strengths.get(id);
      const movie=data.filmById[id];
      const set=new Set(tags(movie?.tags||[]));
      const raw=motifs.map(m=>m.primary.filter(tag=>set.has(tag)).length*2+m.secondary.filter(tag=>set.has(tag)).length);
      const peak=Math.max(3,...raw);
      const result=raw.map(n=>n/peak);
      strengths.set(id,result);return result;
    }
    let answered=0;
    for(const q of data.questions.slice(0,state.limit)){
      const answer=state.answers[q.id];
      if(q.kind!=="visual"||!q.coin||!answer?.done||!answer.confirmed||answer.mode!=="visual")continue;
      const a=q.options.find(o=>o.id===answer.choice),b=q.options.find(o=>o.id!==answer.choice);
      if(!a||!b||!answer.considered?.includes(a.id)||!answer.considered.includes(b.id))continue;
      answered++;
      const picked=weights(a.filmId),alternate=weights(b.filmId);
      totals.forEach((item,i)=>{
        const diff=picked[i]-alternate[i];
        if(Math.abs(diff)<.07)return;
        item.sum+=diff;item.mass+=Math.abs(diff);item.count++;
        item[diff>0?"positive":"negative"]++;item.films.add(a.filmId);
      });
    }
    const rows=totals.map(item=>({...item.motif,count:item.count,positive:item.positive,negative:item.negative,
      score:item.count?Math.round(50+50*item.sum/(item.mass+1.85)):null,films:item.films.size}))
      .sort((a,b)=>(b.score??-1)-(a.score??-1)||a.id-b.id);
    const available=answered>=4;
    const supported=m=>m&&m.score!==null&&m.positive>=3&&m.films>=3;
    const featured=available?rows.filter(m=>supported(m)&&m.score>=58).slice(0,3):[];
    // A wing is adjacent to the leading Enneagram point, including the 9-1
    // boundary, not merely the next-highest score. Keep it open when neither
    // neighboring story motive has a supported, distinct lead.
    const first=rows[0],second=rows[1];
    const lead=available&&supported(first)&&first.score>=58&&first.score-(second.score??0)>=3?first:null;
    const neighbors=lead?rows.filter(m=>m.id===((lead.id+7)%9)+1||m.id===(lead.id%9)+1):[];
    const wing=neighbors.length===2&&supported(neighbors[0])&&neighbors[0].score>=52&&
      neighbors[0].score-(neighbors[1].score??0)>=3?neighbors[0]:null;
    return {rows,featured,answered,available,lead,wing};
  }

  const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
  const normalizeTag = tag => alias[tag] || tag;
  const tags = items => [...new Set((items || []).map(normalizeTag))];
  const filmTags = film => tags([...film.genres, ...film.tags]);
  const storyTags = film => filmTags(film).filter(tag=>!data.groups.endings.includes(tag));
  const anticipatedTags = film => filmTags(film).filter(tag=>data.groups.genres.includes(tag)||data.groups.themes.includes(tag));

  function createState(locale = "en") {
    return {
      version:5, locale, age:"", seed:Math.floor(Math.random() * 2147483647),
      route:"intro", index:0, limit:data.coreLimit, answers:{}, familiarity:{}
    };
  }

  function isUnseen(value) {
    return ["unseen","interested","not-interested","no-opportunity"].includes(value);
  }

  function local(value, locale) {
    return typeof value === "string" ? value : value?.[locale] || value?.en || "";
  }

  function label(tag, locale) {
    return local(data.tagLabels[normalizeTag(tag)] || tag, locale);
  }

  function getModeOptions(question, mode) {
    return mode === "alternative" ? question.alternative?.options || [] : question.options;
  }

  function orderedOptions(question, mode, seed) {
    function hash(value) {
      let result = 2166136261;
      for (const character of value) {
        result ^= character.charCodeAt(0);
        result = Math.imul(result, 16777619);
      }
      return result >>> 0;
    }
    return getModeOptions(question, mode).slice().sort((a,b) =>
      hash(seed + ":" + question.id + ":" + a.id) - hash(seed + ":" + question.id + ":" + b.id));
  }

  function calculate(state) {
    const scores = Object.fromEntries(axisNames.map(axis => [axis, {sum:0, mass:0, count:0, positive:0, negative:0, films:new Set(), pairs:new Set(), contexts:new Set(), evidence:[]}]));
    const taste = {};
    const examples = [];
    const comparisons = [];
    const endRatings = [];
    const chosenFilms = new Set();
    let completed = 0;
    let answered = 0;
    let cognitiveCount = 0;

    function addTaste(tag, difference, weight) {
      const normalized = normalizeTag(tag);
      if (!data.tagLabels[normalized] || !Number.isFinite(difference) || Math.abs(difference) < .00001) return;
      const item = taste[normalized] ||= {sum:0, mass:0, count:0};
      item.sum += difference * weight;
      item.mass += Math.abs(difference) * weight;
      item.count += 1;
    }

    function tagWeight(tag, kind) {
      if (kind === "film") {
        if (data.groups.endings.includes(tag)) return .35;
        if (data.groups.genres.includes(tag)) return .85;
      }
      return 1;
    }

    function contrastTaste(selectedTags, otherTags, weight, kind) {
      const first = tags(selectedTags);
      const rest = otherTags.map(tags);
      if (!rest.length) {
        first.forEach(tag => addTaste(tag, .5, weight * tagWeight(tag, kind)));
        return;
      }
      const all = tags([...first, ...rest.flat()]);
      for (const tag of all) {
        const difference = Number(first.includes(tag)) -
          rest.filter(other => other.includes(tag)).length / rest.length;
        addTaste(tag, difference, weight * tagWeight(tag, kind));
      }
    }

    function absoluteTaste(items, rating, weight) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
      const value = (rating - 3) / 2;
      for (const tag of tags(items)) addTaste(tag, value, weight);
    }

    function contrastSignal(selected, other, weight, question) {
      if (!other.length) return false;
      let contributed = false;
      for (const axis of axisNames) {
        // Only intentional, film-specific coin probes contribute cognitive
        // evidence. Ratings, genre preferences and poster picks never do.
        if (question.coin !== axis || question.kind !== "visual" || !selected.filmId) continue;
        const picked = selected.signal?.[axis] || 0;
        const otherMean = other.reduce((sum,item)=>sum + (item.signal?.[axis] || 0),0) / other.length;
        const difference = clamp((picked - otherMean) / 2, -1, 1);
        if (Math.abs(difference) < .00001) continue;
        const item = scores[axis];
        item.sum += difference * weight;
        item.mass += Math.abs(difference) * weight;
        item.count += 1;
        item[difference > 0 ? "positive" : "negative"]++;
        const contrasted=[selected,...other].map(option=>option.filmId);
        contrasted.forEach(id=>item.films.add(id));
        item.pairs.add([...new Set(contrasted)].sort().join("|"));
        item.contexts.add(question.evidenceKind);
        item.evidence.push({film:data.filmById[selected.filmId].title,filmId:selected.filmId,still:selected.still,
          compared:other.map(o=>({filmId:o.filmId,film:data.filmById[o.filmId].title,still:o.still})),
          kind:question.evidenceKind,prompt:question.prompt,choice:selected.label,side:difference>0?1:-1});
        contributed = true;
      }
      return contributed;
    }

    for (const question of data.questions.slice(0, state.limit)) {
      const answer = state.answers[question.id];
      if (!answer?.done) continue;
      completed++;
      if (answer.mode === "skip") continue;
      if (question.filmId && answer.mode !== "alternative" && isUnseen(state.familiarity[question.filmId])) continue;
      const options = getModeOptions(question, answer.mode);
      const picked = options.find(item => item.id === answer.choice);

      if (question.kind==="visual") {
        if (!picked) continue;
        const others=options.filter(option=>option.id!==picked.id);
        if(!others.length || !answer.considered?.includes(picked.id) || !others.every(option=>answer.considered.includes(option.id))) continue;
        const movie=data.filmById[picked.filmId];
        if(!movie) continue;
        answered++;
        chosenFilms.add(movie.id);
        contrastTaste(filmTags(movie),others.map(o=>filmTags(data.filmById[o.filmId])),question.coin ? .65 : 1,"film");
        const against=others.map(o=>data.filmById[o.filmId].title);
        comparisons.push({film:movie.title,against});
        examples.push({kind:"compare",film:movie.title,against});
        // Unscored visual taste items don't contribute to the OPS axes.
        if(question.coin&&answer.confirmed===true&&contrastSignal(picked,others,.72,question)) cognitiveCount++;
        continue;
      }

      if (question.kind === "films" && answer.mode !== "alternative") {
        if (!picked) continue;
        const movie = data.filmById[picked.filmId];
        if (!movie) continue;
        if (answer.mode === "image" && question.visual === "still") {
          answered++;
          contrastTaste(picked.tags, options.filter(item=>item.id!==picked.id).map(item=>item.tags), .75, "choice");
          examples.push({kind:"image",film:movie.title});
          continue;
        }
        if (answer.mode !== "synopsis" && isUnseen(state.familiarity[movie.id])) continue;
        if (answer.mode === "single") {
          answered++;
          absoluteTaste(storyTags(movie), answer.rating, .9);
          if (answer.rating >= 4) chosenFilms.add(movie.id);
          examples.push({kind:"single",film:movie.title,rating:answer.rating});
          continue;
        }

        const compared = options.filter(option => option.id !== picked.id &&
          (answer.considered || []).includes(option.id) &&
          (answer.mode === "synopsis" || !isUnseen(state.familiarity[option.filmId])));
        const otherFilms = compared.map(option=>data.filmById[option.filmId]).filter(Boolean);
        if (answer.mode === "synopsis") {
          answered++;
          contrastTaste(anticipatedTags(movie), otherFilms.map(anticipatedTags), .32, "film");
          examples.push({kind:"prospective",film:movie.title});
          continue;
        }

        if (!otherFilms.length) continue;
        answered++;
        chosenFilms.add(movie.id);
        const coverage = (otherFilms.length + 1) / options.length;
        contrastTaste(filmTags(movie), otherFilms.map(filmTags), .92 * coverage, "film");
        if (contrastSignal(picked, compared, .72 * coverage, question)) cognitiveCount++;
        comparisons.push({film:movie.title,against:otherFilms.map(film=>film.title)});
        examples.push({kind:"compare",film:movie.title,against:otherFilms.map(film=>film.title)});
        continue;
      }

      if (picked || (question.kind === "ending" && answer.mode !== "alternative" && answer.rating)) answered++;
      if (picked) {
        const others = options.filter(option=>option.id !== picked.id);
        const actualEnding = question.kind === "ending" && answer.mode !== "alternative";
        const baseWeight = answer.mode === "alternative" ? .95 :
          question.kind === "reaction" ? 1.15 : actualEnding ? 1.05 : 1.0;
        const weight = baseWeight * (question.crossCheck ? 1.25 : 1);
        if (contrastSignal(picked, others, weight, question)) cognitiveCount++;
        contrastTaste(picked.tags || [], others.map(item=>item.tags || []), .85, "choice");
        examples.push({kind:"reaction",questionKind:question.kind,mode:answer.mode,
          film:question.filmId && answer.mode !== "alternative" ? data.filmById[question.filmId].title : "",
          label:picked.label, rating:answer.rating || null});
      }

      if (question.kind === "reaction" && answer.mode !== "alternative" && answer.rating) {
        const film = data.filmById[question.filmId];
        absoluteTaste(storyTags(film), answer.rating, .55);
      }

      if (question.kind === "ending" && answer.mode !== "alternative" && answer.rating) {
        const film = data.filmById[question.filmId];
        absoluteTaste(question.endingTags, answer.rating, 1.35);
        absoluteTaste(film.genres, answer.rating, .22);
        const feeling = feelings.find(item=>item.id===answer.feeling);
        if (feeling) absoluteTaste([feeling.tag], answer.rating, .35);
        endRatings.push({film:film.title, rating:answer.rating, feeling:answer.feeling || "",
          tags:question.endingTags, reason:picked?.label || null});
      }
    }

    // An unviewed work only contributes preference evidence if the visitor
    // explicitly says they are interested or uninterested. Exposure alone is missing data.
    for (const [id, status] of Object.entries(state.familiarity)) {
      const movie = data.filmById[id];
      if (!movie) continue;
      if (status === "interested" || status === "not-interested") {
        const value = status === "interested" ? .35 : -.28;
        for (const tag of anticipatedTags(movie)) addTaste(tag, value, tagWeight(tag,"film"));
      }
    }

    const balance = Object.fromEntries(axisNames.map(axis => {
      const item = scores[axis];
      const value = item.sum / (item.mass + 1.75);
      const coverage=item.films.size>=3 && item.pairs.size>=3 && item.contexts.size>=2;
      const clear=coverage && item.count>=3 && Math.abs(value)>=.22 &&
        Math.max(item.positive,item.negative)/item.count>=.70;
      return [axis,{...item,films:item.films.size,pairs:item.pairs.size,contexts:item.contexts.size,clear,value,percent:Math.round((value+1)*50)}];
    }));
    // Each pole needs repeated evidence from multiple films and multiple
    // situations; a single strong reaction cannot settle a coin.
    const sn=balance.sn, tf=balance.tf;
    const snPole=sn.clear ? (sn.value>0?"S":"N") : "";
    const tfPole=tf.clear ? (tf.value>0?"T":"F") : "";
    const functionPair=snPole&&tfPole?snPole+tfPole:"";
    const s=(sn.value+1)/2,t=(tf.value+1)/2;
    const functionRank=[{type:"ST",value:s*t},{type:"SF",value:s*(1-t)},{type:"NT",value:(1-s)*t},{type:"NF",value:(1-s)*(1-t)}]
      .sort((a,b)=>b.value-a.value||a.type.localeCompare(b.type)).map(item=>({...item,score:Math.round(item.value*100)}));
    const functionEvidence={sn:snPole,tf:tfPole,answered:sn.count+tf.count,complete:sn.pairs>=3&&tf.pairs>=3};
    const o = (balance.od.value+1)/2;
    const oi = (balance.observer.value+1)/2;
    const di = (balance.decider.value+1)/2;
    const rank = [
      {type:"IxxJ", value:o*oi}, {type:"ExxP", value:o*(1-oi)},
      {type:"IxxP", value:(1-o)*di}, {type:"ExxJ", value:(1-o)*(1-di)}
    ].sort((a,b)=>b.value-a.value).map(item=>({...item,score:Math.round(item.value*100)}));
    const orientation=balance.od.clear ? (balance.od.value>0?"Observer":"Decider") : "";
    const observer=balance.observer.clear ? (balance.observer.value>0?"Oi":"Oe") : "";
    const decider=balance.decider.clear ? (balance.decider.value>0?"Di":"De") : "";
    const type=orientation==="Observer"&&observer ? (observer==="Oi"?"IxxJ":"ExxP") :
      orientation==="Decider"&&decider ? (decider==="Di"?"IxxP":"ExxJ") : "";
    const enough=Boolean(type);
    const formula=observer&&decider ? (orientation==="Observer"?observer+"/"+decider:orientation==="Decider"?decider+"/"+observer:observer+" + "+decider) : observer||decider||"";
    const consistency=axisNames.every(axis=>balance[axis].clear) ? "consistent" :
      axisNames.some(axis=>balance[axis].clear) ? "tentative" : "limited";
    const observerFunction=observer&&snPole ? snPole+(observer==="Oi"?"i":"e") : "";
    const deciderFunction=decider&&tfPole ? tfPole+(decider==="Di"?"i":"e") : "";
    const opposite={Si:"Ne",Se:"Ni",Ni:"Se",Ne:"Si",Ti:"Fe",Te:"Fi",Fi:"Te",Fe:"Ti",
      Oi:"Oe",Oe:"Oi",Di:"De",De:"Di"};
    // Keep independently established needs visible if the overall family or
    // one of the two facets is still open. Their order is not inferred then.
    const observerLead=observerFunction||observer;
    const deciderLead=deciderFunction||decider;
    const saviors=(orientation==="Decider"?[deciderLead,observerLead]:[observerLead,deciderLead]).filter(Boolean);
    const demons=saviors.map(fn=>opposite[fn]);
    const animal=observer&&decider?animalNames[observer+"/"+decider]:"";
    const animalRank=[
      {name:"Sleep",value:oi*di},{name:"Consume",value:(1-oi)*di},
      {name:"Blast",value:oi*(1-di)},{name:"Play",value:(1-oi)*(1-di)}
    ].sort((a,b)=>b.value-a.value).map(item=>({...item,score:Math.round(item.value*100)}));
    const animalEvidence=balance.observer.pairs>=3&&balance.decider.pairs>=3;
    // Only the first possible animal is derived; the other three bars are
    // relative combinations of the two needs, never a measured animal stack.

    const entries = Object.entries(taste).map(([tag,item]) => ({
      tag, ...item, value:item.sum/(item.mass+1), index:Math.round(50+50*item.sum/(item.mass+1))
    }));
    const groupRank = {};
    for (const [name, group] of Object.entries(data.groups)) {
      groupRank[name] = entries.filter(item=>group.includes(item.tag) && item.sum>.12)
        .sort((a,b)=> (b.sum/Math.sqrt(b.mass+1)) - (a.sum/Math.sqrt(a.mass+1)));
    }

    const familiarity = {seen:[],unseen:[],interested:[],"not-interested":[],"no-opportunity":[]};
    for (const [id,status] of Object.entries(state.familiarity)) {
      if (familiarity[status] && data.filmById[id]) familiarity[status].push(data.filmById[id]);
    }
    const profile = { type, rank, balance, observer, decider, orientation, formula, animal, animalRank, animalEvidence, consistency, enough,functionPair,functionRank,functionEvidence,observerFunction,deciderFunction,saviors,demons,
      cognitiveCount, completed, answered, taste, entries, groupRank, examples, comparisons, endRatings,
      chosenFilms:[...chosenFilms].map(id=>data.filmById[id]), familiarity
    };
    profile.affinities = deriveAffinities(profile);
    profile.recommendations = recommend(profile, state);
    profile.motiveSpectrum = motiveSpectrum(state);
    return profile;
  }

  const affinityRules = [
    {name:{en:"Psychological character studies",ar:"دراسة الشخصية والدراما النفسية"},shortName:{en:"Inner worlds",ar:"عوالم داخلية"},
      description:{en:"Private identity, inner conflict and the pressures shaping a character's choices.",ar:"هوية داخلية وصراعات نفسية وضغوط تشكّل اختيارات الشخصية."},
      pools:[["character","psychological"],["identity","selfWorth","obsession","control"]]},
    {name:{en:"Existential and intimate romance",ar:"رومانسية وجودية وحميمة"},shortName:{en:"Memory & intimacy",ar:"الذاكرة والحميمية"},
      description:{en:"Relationships viewed through time, memory, loss and the lives that might have been.",ar:"علاقات تُستكشف عبر الزمن والذاكرة والفقد والحيوات المحتملة."},
      pools:[["romance"],["identity","memory","meaning","time","loss","melancholic"]]},
    {name:{en:"Philosophical science fiction",ar:"خيال علمي فلسفي"},shortName:{en:"Speculative visions",ar:"رؤى متخيَّلة"},
      description:{en:"Speculative worlds that invite questions about meaning, knowledge and identity.",ar:"عوالم متخيلة تفتح أسئلة عن المعنى والمعرفة والهوية."},
      pools:[["scifi"],["meaning","truth","time","belief","identity"]]},
    {name:{en:"Puzzle and psychological mystery",ar:"غموض نفسي وسرد لغزي"},shortName:{en:"Enigmas",ar:"ألغاز"},
      description:{en:"Uncertain information, carefully structured clues and competing interpretations.",ar:"معلومات ملتبسة وأدلة مبنية بعناية وتأويلات متنافسة."},
      pools:[["mystery","thriller"],["puzzle","truth","uncertainty","nonlinear"]]},
    {name:{en:"Social and ethical drama",ar:"دراما اجتماعية وأخلاقية"},shortName:{en:"Moral crossroads",ar:"مفترق الخيارات"},
      description:{en:"Interconnected lives shaped by institutions, expectations and difficult responsibilities.",ar:"حيوات مترابطة تشكّلها المؤسسات والتوقعات والمسؤوليات الصعبة."},
      pools:[["drama","history","crime"],["systems","ethics","justice","class","community","duty"]]},
    {name:{en:"Contemplative and observational cinema",ar:"سينما تأملية ورصدية"},shortName:{en:"Quiet observation",ar:"تأمّل هادئ"},
      description:{en:"Patient observation, everyday gestures and meaning carried by quiet details.",ar:"رصد صبور وإيماءات يومية ومعانٍ تحملها التفاصيل الهادئة."},
      pools:[["slow","observational","contemplative"],["routine","memory","meaning","realism"]]},
    {name:{en:"Kinetic and immersive adventure",ar:"مغامرة حسية غامرة"},shortName:{en:"In motion",ar:"في حركة"},
      description:{en:"Movement, surprising environments, visual energy and continual discovery.",ar:"حركة وبيئات مفاجئة وطاقة بصرية واكتشاف مستمر."},
      pools:[["action","adventure","fantasy"],["fast","visual","discovery","sensory","wonder"]]},
    {name:{en:"Bittersweet human drama",ar:"دراما إنسانية مرّة وحلوة"},shortName:{en:"Bittersweet lives",ar:"حيوات مرّة وحلوة"},
      description:{en:"Emotionally complex stories whose losses can still lead to a meaningful resolution.",ar:"قصص معقدة عاطفيًا تستطيع أن تمنح الفقد خاتمة ذات معنى."},
      pools:[["drama","romance"],["bittersweet-ending","tragic","loss","emotional","melancholic"]]},
    {name:{en:"Observational documentary",ar:"وثائقي رصدي"},shortName:{en:"Documented lives",ar:"حيوات حقيقية"},
      description:{en:"Real subjects, patient observation and discoveries emerging from everyday experience.",ar:"موضوعات حقيقية ورصد صبور واكتشافات تنبثق من التجربة اليومية."},
      pools:[["documentary"],["observational","realism","routine","discovery"]]},
    {name:{en:"Warm ensemble and coming-of-age stories",ar:"قصص جماعية ودراسات نمو دافئة"},shortName:{en:"Growing together",ar:"النمو معاً"},
      description:{en:"Friendship, belonging and personal growth as people negotiate their place in the world.",ar:"صداقة وانتماء ونمو شخصي بينما يحدد الأشخاص موقعهم في العالم."},
      pools:[["comedy","family","animation","drama"],["growth","friendship","community","warm","hopeful-ending"]]}
  ];

  function deriveAffinities(profile) {
    const ranked=affinityRules.map(rule=>{
      const matches=rule.pools.map(pool=>pool.map(tag=>({tag,score:Math.max(0,profile.taste[tag]?.sum||0)}))
        .sort((a,b)=>b.score-a.score)[0]);
      return {name:rule.name,shortName:rule.shortName,description:rule.description,pools:rule.pools,matches:matches.map(item=>item.tag),
        value:matches.every(item=>item.score>.15)?Math.sqrt(matches.reduce((total,item)=>total*item.score,1)):0};
    }).filter(item=>item.value>0).sort((a,b)=>b.value-a.value).slice(0,3);
    const selected=new Set(profile.chosenFilms.map(f=>f.id)),seen=new Set(profile.familiarity.seen.map(f=>f.id)),used=new Set();
    return ranked.map(item=>{
      const candidates=data.films.filter(movie=>movie.still).map(movie=>{
        const actual=filmTags(movie);
        const inPools=item.pools.map(pool=>pool.filter(tag=>actual.includes(tag)).length);
        return {movie,qualifies:inPools.every(Boolean),
          score:(selected.has(movie.id)?100:seen.has(movie.id)?30:0)+inPools.reduce((a,b)=>a+b,0)*3+item.matches.filter(tag=>actual.includes(tag)).length*5};
      }).filter(x=>x.qualifies).sort((a,b)=>b.score-a.score);
      const representative=candidates.find(x=>!used.has(x.movie.id))||candidates[0];
      if(representative)used.add(representative.movie.id);
      return {...item,representative:representative?.movie||null,representativeSelected:!!representative&&selected.has(representative.movie.id)};
    });
  }

  function recommend(profile, state) {
    if (!profile.entries.length) return [];
    const ranked = [];
    const weights = {themes:1.4,style:1.15,tone:1.05,endings:.82,genres:.85};
    function categoryOf(tag) {
      return Object.keys(data.groups).find(name=>data.groups[name].includes(tag)) || "themes";
    }
    for (const movie of data.films) {
      if (["seen","not-interested"].includes(state.familiarity[movie.id])) continue;
      const matches = filmTags(movie).map(tag=>({tag, evidence:profile.taste[tag]}))
        .filter(item=>item.evidence);
      if (!matches.length) continue;
      let total=0, weight=0;
      const positive = [];
      for (const item of matches) {
        const evidence = item.evidence;
        const magnitude = evidence.sum / (evidence.mass + .7);
        const importance = weights[categoryOf(item.tag)] * Math.min(1.4,.65+evidence.mass/4);
        total += magnitude*importance;
        weight += importance;
        if (magnitude>.10) positive.push({tag:item.tag,value:magnitude*importance});
      }
      const priorInterest = state.familiarity[movie.id] === "interested";
      const value = total/(weight+1.0) + (priorInterest ? .20 : 0) + Math.min(.12,positive.length*.017);
      if (value>.015 || priorInterest) {
        ranked.push({movie,value,priorInterest,
          reasons:positive.sort((a,b)=>b.value-a.value).slice(0,3).map(item=>item.tag)});
      }
    }
    ranked.sort((a,b)=>b.value-a.value || a.movie.title.localeCompare(b.movie.title));
    const selected = [];
    const genreFrequency = new Map();
    const modern = ranked.filter(item=>item.movie.year>=2006);
    // Prefer recent releases and available Archive artwork, while allowing a
    // strongly matched genre such as documentary to outrank an illustrated one.
    const pool=modern.length>=8?modern:ranked;
    const illustrated=pool.filter(item=>item.movie.poster);
    const remaining = [...(illustrated.length>=8?illustrated:pool)];
    // The first group is close to the expressed taste. Later picks open related genres.
    while (selected.length<8 && remaining.length) {
      const discovery = selected.length >= 5;
      let bestIndex=0, bestValue=-Infinity;
      for (let index=0;index<remaining.length;index++) {
        const item=remaining[index];
        const repeated = item.movie.genres.reduce((sum,g)=>sum+(genreFrequency.get(g)||0),0);
        const score = item.value + (item.movie.poster ? .045 : 0)
          + (item.movie.year>=2020 ? .012 : 0) - (discovery ? .026 : .014)*repeated;
        if (score>bestValue) { bestValue=score; bestIndex=index; }
      }
      const item = remaining.splice(bestIndex,1)[0];
      selected.push({...item,kind:discovery?"discovery":"close"});
      item.movie.genres.forEach(genre=>genreFrequency.set(genre,(genreFrequency.get(genre)||0)+1));
    }
    return selected;
  }

  const readingRules = [
    {tags:["control","truth","puzzle","meaning","time"],en:"You return to stories where scattered events acquire a coherent meaning. A mystery is especially engaging when its structure itself becomes part of the experience.",ar:"تعود إلى القصص التي تتخذ فيها الأحداث المتفرقة معنى متماسكًا. ويزداد انجذابك إلى الغموض عندما تصبح بنية اللغز نفسها جزءًا من التجربة."},
    {tags:["discovery","possibilities","improvisation","freedom"],en:"Unexpected turns and untested directions appear to be part of the appeal. You may enjoy a story that keeps inviting you to reconsider what its world can contain.",ar:"تشكّل التحولات المفاجئة والاتجاهات غير المجربة جزءًا من جاذبية العمل بالنسبة لك. وقد تستمتع بقصة تدعوك إلى إعادة النظر فيما يمكن أن يحتويه عالمها."},
    {tags:["identity","selfWorth","character","restraint"],en:"Your choices suggest an interest in the private experience of characters, particularly in the tension between who they are and who they are expected to become.",ar:"تشير اختياراتك إلى اهتمام بالتجربة الخاصة للشخصيات، وخصوصًا التوتر بين ما هي عليه وما يُتوقع منها أن تكون."},
    {tags:["relationship","ethics","duty","community","familyBond"],en:"You often find the meaning of choices in their effect on other people. Stories about competing obligations or changing relationships may stay with you.",ar:"كثيرًا ما تجد معنى الاختيارات في أثرها على الآخرين. وقد تبقى معك قصص الالتزامات المتعارضة والعلاقات التي تتغير تحت الضغط."},
    {tags:["memory","loss","melancholic","bittersweet-ending"],en:"Memory, loss and the lives that might have been recur in the experiences you favor. Emotional complexity can make an ending feel worthwhile.",ar:"تتكرر الذاكرة والفقد والحيوات التي كان يمكن أن نعيشها في التجارب التي تفضلها. وقد يمنح التعقيد العاطفي النهاية قيمة خاصة لديك."},
    {tags:["open","ambiguous-ending","ambiguity","symbolic"],en:"You seem comfortable with stories that leave some interpretive space. An ending can satisfy you while still allowing you to revisit its meaning.",ar:"تبدو مرتاحًا للقصص التي تترك مساحة للتأويل. ويمكن أن ترضيك النهاية مع استمرار رغبتك في العودة إلى معناها."},
    {tags:["observational","routine","realism","slow"],en:"You respond to close observation, everyday gestures and gradual change. Quiet details can carry as much weight for you as dramatic events.",ar:"تتفاعل مع الرصد القريب والإيماءات اليومية والتغير التدريجي. وقد تحمل التفاصيل الهادئة لديك وزنًا يماثل وزن الأحداث الدرامية."},
    {tags:["intense","suspense","fast","survival"],en:"Urgency and suspense contribute to your enjoyment. You often respond to a story when its tension has concrete consequences and builds momentum.",ar:"يسهم الإلحاح والتشويق في متعتك السينمائية. وكثيرًا ما تتفاعل مع القصة حين تكون لتوترها عواقب ملموسة وإيقاع متصاعد."},
    {tags:["visual","stylized","symbolic","worldbuilding"],en:"The language of images and the construction of a world matter to your experience. A distinctive style can make a familiar theme feel new.",ar:"تؤثر لغة الصور وبناء العالم في تجربتك. وقد يجعل الأسلوب المميز موضوعًا مألوفًا يبدو جديدًا."},
    {tags:["warm","hopeful-ending","friendship","uplifting"],en:"You appreciate moments of hope, companionship and earned resolution. A story's emotional generosity may be an important reason to revisit it.",ar:"تقدّر لحظات الأمل والرفقة والحلول التي تأتي نتيجة مسار مستحق. وقد يكون سخاء القصة العاطفي سببًا مهمًا لإعادة مشاهدتها."}
  ];

  function readings(profile, locale) {
    const ranked = readingRules.map(rule => ({
      rule, strength:rule.tags.reduce((sum,tag)=>sum+Math.max(0,profile.taste[tag]?.sum || 0),0)
    })).filter(item=>item.strength>.45).sort((a,b)=>b.strength-a.strength);
    return ranked.slice(0,3).map(item=>local(item.rule,locale));
  }

  function evidenceLines(profile, locale) {
    const result = [];
    function sample(items, limit) {
      if (items.length <= limit) return items;
      return Array.from({length:limit}, (_,index)=>items[Math.round(index*(items.length-1)/(limit-1))]);
    }
    for (const example of sample(profile.comparisons,3)) {
      result.push(locale === "ar" ? "فضّلت " + example.film + " على " + example.against.join("، ") : "Preferred " + example.film + " over " + example.against.join(", "));
    }
    for (const ending of profile.endRatings.slice().sort((a,b)=>Math.abs(b.rating-3)-Math.abs(a.rating-3)).slice(0,3)) {
      result.push((locale==="ar" ? "تقييم نهاية " : "Ending of ") + ending.film + " — " +
        ratingNames[locale][ending.rating-1] + (ending.reason?" · "+local(ending.reason,locale):""));
    }
    const characterResponses=profile.examples.filter(example=>example.kind==="reaction"&&example.questionKind==="reaction"&&example.film);
    for (const item of sample(characterResponses,2)) {
      result.push(item.film+" — "+local(item.label,locale));
    }
    const visualChoice=profile.examples.find(example=>example.kind==="image");
    if (visualChoice) {
      result.push((locale==="ar"?"اختيار بصري من الكادرات: ":"Preferred visual frame: ")+visualChoice.film);
    }
    if (result.length<4) {
      const scenarioResponses=profile.examples.filter(example=>example.kind==="reaction"&&!example.film);
      for (const item of scenarioResponses.slice(0,4-result.length)) result.push(local(item.label,locale));
    }
    return result;
  }

  function profileSummary(profile, state, locale) {
    const ar=locale==="ar";
    const top = familyName(profile.rank[0]?.type,locale);
    const heading = familyName(profile.type,locale) || (ar?"كادر مفتوح":"Open Frame");
    const lines = [
      ar?"ملف الذائقة السينمائية — The T.S. Archive":"Cinema Profile — The T.S. Archive",
      (ar?"البصمة: ":"Archive signature: ")+heading+
        (!profile.type&&profile.cognitiveCount>=6&&top ? " ("+top+" "+(ar?"أقرب مبدئيًا":"tentative lead")+")":""),
      (ar?"العدسة السينمائية: ":"Cinematic lens: ")+(lensName(profile.functionPair,locale) || (ar?"لم تتضح بعد":"Still open")),
      (ar?"تركيبة الـCoins: ":"Coin combination: ")+(profile.formula || (ar?"أدلة غير كافية":"insufficient evidence")),
      (ar?"Savior Animal المحتمل: ":"Possible Savior Animal: ")+(profile.animal || (ar?"غير محسوم":"Still open")),
      (ar?"Saviors المحتملة: ":"Possible Saviors: ")+(profile.saviors.map(fn=>impressionName(fn,locale)).join(" / ") || (ar?"غير محسومة":"Inconclusive")),
      (ar?"Demons المقابلة نظرياً: ":"The corresponding Demons: ")+(profile.demons.map(fn=>impressionName(fn,locale)).join(" / ") || (ar?"غير محسومة":"Inconclusive")),
      (ar?"اتساق الإجابات: ":"Answer consistency: ")+({limited:{en:"Limited",ar:"محدود"},tentative:{en:"Tentative",ar:"أولي"},consistent:{en:"Consistent",ar:"متسق نسبيًا"}}[profile.consistency][locale]),
      ...coinLabels(locale).map(([axis,left,right])=>left+" "+(profile.balance[axis].count?profile.balance[axis].percent+"%":"—")+" / "+right+" "+(profile.balance[axis].count?(100-profile.balance[axis].percent)+"%":"—")+" · "+profile.balance[axis].pairs+" "+(ar?"مفاضلات":"comparisons")),
      (ar?"الإجابات: ":"Answers: ")+profile.answered+"/"+state.limit,
      ar?"هذه الدرجات موازين نسبية استكشافية مبنية على الإجابات، وتحتاج إلى معايرة مستقلة.":"These scores are exploratory relative balances based on the answers and require independent calibration."
    ];
    if(state.age) lines.push((ar?"الفئة العمرية: ":"Age range: ")+local(ageLabels[state.age],locale));
    if(profile.cognitiveCount) {
      lines.push((ar?"البصمات: ":"Signatures: ")+profile.rank.map(item=>familyName(item.type,locale)+" "+item.score+"%").join(ar?"، ":", "));
      lines.push((ar?"العدسات: ":"Lenses: ")+profile.functionRank.map(item=>lensName(item.type,locale)+" "+item.score+"%").join(ar?"، ":", "));
    }
    if(profile.animalEvidence) lines.push((ar?"ترجيح Animals: ":"Animal affinity: ")+profile.animalRank.map(item=>item.name+" "+item.score+"%").join(ar?"، ":", "));
    if(profile.motiveSpectrum.available) {
      lines.push("",ar?"طيف الدوافع · مستلهم من Enneagram":"Motive spectrum · Enneagram-inspired",
        profile.motiveSpectrum.rows.map(item=>local(item.name,locale)+" "+(item.score??"—")).join(" · "),
        ...(profile.motiveSpectrum.lead?[((ar?"الدافع المتقدم: ":"Leading story motive: ")+local(profile.motiveSpectrum.lead.name,locale)),
          ((ar?"صدى الجناح: ":"Wing echo: ")+(profile.motiveSpectrum.wing?local(profile.motiveSpectrum.wing.name,locale):(ar?"مفتوح":"Open")))]:[]),
        ar?"هذه أصداء الدوافع في الأفلام المختارة وليست تشخيصاً لنمط Enneagram.":"These are affinities with story motives, not an Enneagram typing result.");
    }
    if(profile.affinities.length) lines.push((ar?"الأنواع السينمائية المركبة: ":"Specific cinematic affinities: ")+profile.affinities.map(item=>local(item.name,locale)).join(ar?"، ":", "));
    for (const [group,title] of Object.entries(ar?
      {genres:"الأنواع",themes:"الموضوعات",style:"الأسلوب",tone:"النبرة",endings:"النهايات"}:
      {genres:"Genres",themes:"Themes",style:"Form",tone:"Tone",endings:"Endings"})) {
      const list=profile.groupRank[group].slice(0,5).map(item=>label(item.tag,locale)+" ("+item.index+"/100)");
      if(list.length) lines.push(title+": "+list.join(ar?"، ":", "));
    }
    const interpretation=readings(profile,locale);
    if(interpretation.length) lines.push("",ar?"قراءة الذائقة":"Taste interpretation",...interpretation);
    return lines.join("\n");
  }

  function buildPrompt(profile,state,locale) {
    const ar=locale==="ar";
    const join = ar?"، ":", ";
    const list = items => items.map(movie=>movie.title+" ("+movie.year+")").join(join);
    const details = profileSummary(profile,state,locale);
    const evidence = evidenceLines(profile,locale);
    const watched = list(profile.familiarity.seen);
    const interested = list(profile.familiarity.interested);
    const uninterested= list(profile.familiarity["not-interested"]);
    return [
      ar ? "أريد منك أن تعمل كناقد سينمائي ومحرّر ترشيحات شخصي. استند إلى ملف ذائقتي الناتج من اختبار تفاعلي، وإلى الأدلة المتكررة في إجاباتي. اعتبر الترجيح المعرفي وفق OPS فرضية استكشافية، واستند أساسًا إلى تفضيلاتي عند الاختيار."
        : "Act as my personal film curator and critic. Use my interactive cinema-taste profile and the recurring evidence in my answers. Treat the OPS-based cognitive orientation as an exploratory hypothesis, and prioritize my actual cinematic preferences.",
      "", details,
      "", ar?"أمثلة مباشرة من إجاباتي":"Examples from my answers",
      ...(evidence.length?evidence:[ar?"لم تُسجّل أمثلة كافية بعد.":"Limited direct evidence so far."]),
      "", (ar?"أعمال شاهدتها (استبعدها): ":"Watched films (exclude): ")+(watched || (ar?"غير محدد":"not specified")),
      ...(interested?[(ar?"أعمال لم أشاهدها ولكنني مهتم بها: ":"Unwatched films I am interested in: ")+interested]:[]),
      ...(uninterested?[(ar?"أعمال لم تجذبني: ":"Films I am not interested in: ")+uninterested]:[]),
      "", ar?
        "رشح لي 12 فيلمًا لم أشاهدها موزعة إلى 6 مطابقة قريبة لذائقتي، و4 توسّع ذائقتي في اتجاهات متصلة، وفيلمين مفاجئين. اذكر العنوان الأصلي والسنة والمخرج ونوع العمل السردي والفني، وسببًا محددًا يربط كل ترشيح بملفي. صف نوعية الأفلام التي تناسبني فقرةً واحدة دقيقة تقرأ ما بين السطور، مع توضيح الأدلة والابتعاد عن الأحكام النفسية الجازمة. تجنب حرق النهايات، وتحقق من معلومات الأفلام. اسأل عن الأفلام التي شاهدتها قبل ترشيحات لاحقة إذا لزم."
        : "Recommend 12 films I have not seen: 6 close matches, 4 adjacent discoveries, and 2 thoughtful surprises. Include original title, year, director, narrative and formal type, and a specific reason grounded in this profile. Write one nuanced paragraph describing the kind of cinema that fits my taste, drawing inferences from the recorded evidence while avoiding definitive psychological claims. Do not spoil endings. Verify film facts and ask about additional watched films if needed.",
      ar?"أعطِ الأولوية لأفلام آخر عشرين سنة ولأعمال المخرجين البارزين والمعاصرين، مع اختيار ما يلائم ذائقتي تحديداً.":"Favor films from the last twenty years and notable contemporary directors, guided by my specific taste."
    ].join("\n");
  }

  globalThis.CinemaProfileCore = { createState, isUnseen, local, label, ratingNames, ageLabels, feelings,
    familyInfo, functionPairs, familyName, lensName, impressionName, coinLabels, animalInfo,
    orderedOptions, getModeOptions, calculate, readings, evidenceLines, profileSummary, buildPrompt };
})();
