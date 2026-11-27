/* Adaptive cinema assessment: 56 scored slots, authored scene variants,
 * and optional focused written stories. The visitor never sees the poles.
 */
(() => {
  "use strict";
  const D=globalThis.CinemaProfileData,bank=D.cinemaSceneBank;
  if(!bank)throw Error("Missing Cinema Profile scene bank");
  const L=(en,ar)=>({en,ar});
  const legacy=new Map(D.questions.map(q=>[q.id,q]));
  const axes=["od","observer","decider","sn","tf"],slots=new Map();
  const choiceOption=(option,index,axis=null)=>({...option,id:String(index+1),
    filmId:option.filmId||"",still:option.still||"",signal:axis?{[axis]:index===0?1:-1}:{},
    tags:D.filmById[option.filmId]?.tags||[]});
  const signalForm=(spec,axis)=>({...spec,options:spec.options.map((o,i)=>choiceOption(o,i,axis))});

  // Each form is independently worded around the events of its own film(s).
  // The polarity is kept in the option id and signal, never in the caption.
  for(const [id,forms] of Object.entries(bank.coins)){
    const original=legacy.get(id);
    if(!original?.coin||forms.length!==3)throw Error("Invalid cinema slot: "+id);
    const versions=forms.map(spec=>signalForm(spec,original.coin));
    slots.set(id,{...original,...versions[0],purpose:"coin",forms:versions});
  }

  // Five direct taste prompts — visually focused, excluded from the Coins.
  const tasteIds=["v06","v18","v25","v37","a-taste-pace"];
  for(const id of tasteIds){
    const original=legacy.get(id);
    const prompt=id==="v06"?L("Which film would you choose for tonight?","أيّ فيلم تختار لهذه الأمسية؟"):
      id==="a-taste-pace"?L("Which rhythm would you want to spend an evening with?","أيّ إيقاع سينمائي تفضّل لأمسيتك؟"):original.prompt;
    slots.set(id,{...original,id,kind:"visual",coin:null,evidenceKind:"taste",purpose:"taste",
      tasteScope:id==="v06"?"viewing":id==="v25"?"atmosphere":id==="a-taste-pace"?"rhythm":"frame",
      prompt,options:bank.taste[id].map((o,i)=>choiceOption(o,i))});
  }

  // Seven five-point breaks, alternate actual works when not watched.
  function rating(id,kind,primaryTags=[]){
    const prompt=kind==="ending"?L("How satisfying was the ending?","ما مدى رضاك عن النهاية؟"):
      L("How satisfying was your experience of this film?","ما مدى رضاك عن تجربة مشاهدة هذا الفيلم؟");
    const forms=bank.ratings[id].map((cue,i)=>({kind,source:"film",prompt,filmId:cue.filmId,still:cue.still,
      endingTags:kind==="ending"?(i===0?primaryTags:D.filmById[cue.filmId].tags.filter(tag=>D.groups.endings.includes(tag))):[],
      options:[],rating:true}));
    slots.set(id,{id,...forms[0],purpose:"rating",forms});
  }
  for(const id of ["v12","v24","v31","v43"])rating(id,"ending",legacy.get(id).endingTags);
  for(const id of ["a-rating-1","a-rating-2","a-rating-3"])rating(id,"satisfaction");

  // Two presentations of each of the nine independent story motives.
  const prompts=[
    L("Whose story would you want to follow?","أيّ حكاية ترغب في متابعتها؟"),
    L("Which journey makes you more curious?","أيّ رحلة تثير فضولك أكثر؟"),
    L("Which character would keep you watching?","أيّ شخصية تجعلك تواصل المشاهدة؟"),
    L("Whose next chapter would you rather see?","أيّ حكاية تودّ مشاهدة فصلها التالي؟"),
    L("Which story would you follow to its conclusion?","أيّ حكاية تتابعها حتى نهايتها؟"),
    L("Which struggle would you like to see unfold?","أيّ صراع تودّ متابعة تطوّره؟"),
    L("Which direction makes you want the next scene?","أيّ مسار يجعلك تنتظر المشهد التالي؟"),
    L("Which character's journey draws you in?","أيّ رحلة من رحلات الشخصيات تشدّك أكثر؟"),
    L("Which ending would you want to live with for longer?","أيّ نهاية تتمنّى أن يبقى أثرها معك وقتًا أطول؟")
  ];
  const motives=bank.motives.map(([leftId,left,rightId,right],i)=>{
    const q={id:"a-motive-"+(i+1),kind:"visual",purpose:"motive",coin:null,evidenceKind:"motive",cinematic:true,prompt:prompts[i],
      options:[{...choiceOption(left,0),motiveId:leftId},{...choiceOption(right,1),motiveId:rightId}]};
    slots.set(q.id,q);return q.id;
  });

  // Seven blocks: every block covers all five Coins, two independent
  // selections and then a satisfaction rating. Preserve 32 + 24.
  const byAxis=axes.map(axis=>[...slots.values()].filter(q=>q.purpose==="coin"&&q.coin===axis));
  const chronology=[
    [tasteIds[0],motives[0],"v12"],[tasteIds[1],motives[1],"a-rating-1"],
    [tasteIds[2],motives[2],"v24"],[tasteIds[3],motives[3],"a-rating-2"],
    [tasteIds[4],motives[4],"v31"],[motives[5],motives[6],"a-rating-3"],
    [motives[7],motives[8],"v43"]
  ];
  const questions=[];
  for(let block=0;block<7;block++){
    const row=axes.map((_,i)=>byAxis[(i+block)%axes.length][block]);
    const [first,second,bar]=chronology[block];
    row.splice(2,0,slots.get(first));row.splice(5,0,slots.get(second));row.push(slots.get(bar));
    if(row.some(q=>!q))throw Error("Incomplete cinema profile block "+block);
    questions.push(...row.map(q=>({...q,stage:block<4?"core":"depth",block:block+1})));
  }
  if(questions.length!==56||new Set(questions.map(q=>q.id)).size!==56)throw Error("Invalid adaptive question schedule");

  const refinement=bank.refinement.map(([axis,index,spec])=>({
    id:"a-refine-"+axis+"-"+index,stage:"refine",purpose:"coin",coin:axis,
    evidenceKind:"refine-"+axis+"-"+index,...signalForm(spec,axis)
  }));
  const refinementById=new Map(refinement.map(q=>[q.id,q]));
  function questionsFor(state){
    if(state.version!==6)return D.questions;
    return [...questions,...(Array.isArray(state.refinement)?state.refinement:[]).map(id=>refinementById.get(id)).filter(Boolean)];
  }
  function form(slot,answer={}){
    if(!slot?.forms?.length)return slot;
    const index=Number.isInteger(answer.form)&&answer.form>=0&&answer.form<slot.forms.length?answer.form:0;
    return {...slot,...slot.forms[index],form:index};
  }
  function selectForm(slot,state,from=0){
    if(!slot.forms)return 0;
    for(let i=from;i<slot.forms.length;i++){
      const q=form(slot,{form:i});
      if(q.source==="text")return i;
      const ids=q.filmId?[q.filmId]:q.options.map(o=>o.filmId);
      if(ids.every(id=>!["unseen","interested","not-interested","no-opportunity"].includes(state.familiarity[id])))return i;
    }
    return -1;
  }
  function refinePlan(state,profile){
    if(state.version!==6||state.limit<56)return [];
    const used=new Set(state.refinement||[]);
    const unresolved=axes.filter(axis=>!profile.balance[axis].clear)
      .sort((a,b)=>profile.balance[a].count-profile.balance[b].count||Math.abs(profile.balance[a].value)-Math.abs(profile.balance[b].value));
    const plan=[];
    for(let round=1;round<=2;round++)for(const axis of unresolved){
      const id="a-refine-"+axis+"-"+round;
      if(!used.has(id)&&plan.length<6)plan.push(id);
    }
    return plan;
  }
  D.adaptive={revision:"scene-v2",questions,coreLimit:32,fullLimit:56,refinement,questionsFor,form,selectForm,refinePlan};
})();
