/* A visual ballot, not a text questionnaire. Each coin is an editorial
   hypothesis about a contrast between two cinematic moments, never a type
   assigned to a film, genre, actor or character. */
(() => {
  "use strict";
  const D=globalThis.CinemaProfileData;
  const L=(en,ar)=>({en,ar});
  const questions=[];
  const frame=(filmId,en="",ar="",still="")=>({filmId,label:L(en,ar),still:still||D.filmById[filmId].still});
  const visual=(id,stage,coin,evidenceKind,en,ar,a,b)=>{
    questions.push({id,stage,kind:"visual",coin,evidenceKind,prompt:L(en,ar),
      options:[a,b].map((o,i)=>({...o,id:String(i+1),signal:coin?{[coin]:i===0?1:-1}:{},tags:D.filmById[o.filmId].tags}))});
  };
  const c=(id,coin,context,en,ar,a,b)=>visual(id,"core",coin,context,en,ar,a,b);
  const d=(id,coin,context,en,ar,a,b)=>visual(id,"depth",coin,context,en,ar,a,b);
  const ending=(id,stage,filmId,tags,still="")=>questions.push({
    id,stage,kind:"ending",filmId,still:still||D.filmById[filmId].still,
    endingTags:tags.split(" "),options:[],prompt:L("How satisfying was the ending?","ما مدى رضاك عن النهاية؟"),rating:true
  });

  // The five coins are interlaced, with four contrasts apiece in the core.
  // O/D: uncertainty/control versus identity/relationship judgment.
  c("v01","od","pressure","Which tension absorbs you more?","أي توتّر يشدّك أكثر؟",
    frame("inception","Unstable dream","حلم مضطرب","inception-best-picture-2010s.webp"),
    frame("social-network","A friendship fractured","صداقة تتفكك"));
  c("v02","observer","repair","Which approach would you follow?","أي مسار تتبّع؟",
    frame("arrival","Deciphering the language","فكّ اللغة"),
    frame("grand-budapest","An improvised escape","هروب مرتجل"));
  c("v03","decider","resolution","Which resolution feels more earned?","أي حسم يبدو مستحقاً أكثر؟",
    frame("little-women","Jo's manuscript","مخطوطة جو"),
    frame("moonlight","Chiron & Kevin","شيرون وكيفن"));
  c("v04","sn","investigation","Which clue would you revisit?","أي أثر تعود إليه؟",
    frame("burning","The disappearance","الاختفاء","burning-2018-wide.webp"),
    frame("aftersun","Fragments of memory","شظايا الذاكرة"));
  c("v05","tf","judgment","Which confrontation draws you in?","أي مواجهة تجذبك أكثر؟",
    frame("moneyball","The team's strategy","استراتيجية الفريق"),
    frame("before-midnight","An intimate argument","جدال حميم","before-midnight-wide.webp"));
  c("v06",null,"taste","Which would you rewatch tonight?","أي فيلم تعيد مشاهدته الليلة؟",
    frame("her"),frame("phantom-thread"));
  c("v07","od","aftermath","Which uncertainty is harder to leave?","أي قلق يصعب تركه معلّقاً؟",
    frame("dune-two","The future of Arrakis","مستقبل أراكيس"),
    frame("tar","Lydia's public fall","سقوط ليديا"));
  c("v08","observer","pressure","Which response to disruption interests you?","أي مواجهة للاضطراب تهمك؟",
    frame("phantom-thread","The morning ritual","طقوس الصباح","phantom-thread-wide.webp"),
    frame("worst-person","Julie's changing life","حياة جولي المتغيّرة"));
  c("v09","decider","conflict","Which choice would you defend?","أي اختيار تدافع عنه؟",
    frame("whiplash","Andrew's final performance","عزف أندرو الأخير","whiplash-2014-best-scene.webp"),
    frame("past-lives","Nora's goodbye","وداع نورا"));
  c("v10","sn","structure","Which sequence would you study?","أي تسلسل تعيد تأمّله؟",
    frame("dunkirk","The evacuation","عملية الإجلاء","dunkirk-2017-wide.webp"),
    frame("tenet","Time in reverse","الزمن المعكوس","tenet-curator-editing.webp"));
  c("v11","tf","repair","Which resolution moves you more?","أي معالجة للموقف تؤثّر بك أكثر؟",
    frame("anatomy-fall","Conflicting testimony","شهادات متعارضة"),
    frame("drive-my-car","Speaking about loss","الحديث عن الفقد"));
  ending("v12","core","la-la-land","bittersweet-ending closed","la-la-land-silent-ending-curator.webp");
  c("v13","od","investigation","Which unresolved question lingers?","أي سؤال معلّق يبقى معك؟",
    frame("decision-leave","An unsolved case","قضية غير محسومة","decision-to-leave-seo-rae.webp"),
    frame("banshees","A friendship ending","صداقة تنتهي"));
  c("v14","observer","strategy","Which way through a crisis?","أي طريق للخروج من الأزمة؟",
    frame("inception","The planned extraction","الاستخراج المخطّط","inception-director-of-the-decade-2010s.webp"),
    frame("grand-budapest","The unexpected detour","المنعطف المفاجئ"));
  c("v15","decider","pressure","Which struggle feels closer?","أي صراع يبدو أقرب لك؟",
    frame("inside-llewyn-davis","An artist's own standard","معيار الفنان الخاص"),
    frame("drive-my-car","Kafuku & his company","كافوكو وفرقته"));
  c("v16","sn","interpretation","Which detail would you follow?","أي تفصيل تتبّع؟",
    frame("phantom-thread","Texture and ritual","الخامة والطقوس","phantom-thread-best-actor-curator.webp"),
    frame("tree-life","Memory across time","الذاكرة عبر الزمن"));
  c("v17","tf","judgment","Which decision stays with you?","أي قرار يبقى ببالك؟",
    frame("oppenheimer","The project's consequences","عواقب المشروع"),
    frame("manchester","Lee's guardianship","وصاية لي"));
  c("v18",null,"taste","Which frame would you keep?","أي كادر تحتفظ به؟",
    frame("blade-runner","","","blade-runner-2049-best-cinematography.webp"),frame("tree-life"));
  c("v19","od","pressure","Which predicament feels most unsettling?","أي مأزق يقلقك أكثر؟",
    frame("interstellar","Time lost on a mission","زمن ضائع في المهمة"),
    frame("gone-girl","Public judgment","حكم الجمهور"));
  c("v20","observer","aftermath","Which ending invites a second look?","أي نهاية تدعوك لإعادة المشاهدة؟",
    frame("arrival","The circle closes","اكتمال الدائرة"),
    frame("challengers","The last point","النقطة الأخيرة"));
  c("v21","decider","resolution","Which turning point resonates?","أي نقطة تحوّل تلامسك؟",
    frame("little-women","Jo's own story","حكاية جو الخاصة"),
    frame("inside-out","Connection after change","التواصل بعد التغيّر"));
  c("v22","sn","investigation","Which trace would you investigate?","أي أثر تستقصي؟",
    frame("prisoners","A missing-person case","قضية اختفاء"),
    frame("blade-runner","K's inherited memory","ذاكرة K الموروثة"));
  c("v23","tf","conflict","Which argument would you examine?","أي حجة تتأمّلها؟",
    frame("tar","The Juilliard lecture","محاضرة جوليارد","tar-2022-best-scene-cinematic-r2.webp"),
    frame("beale-street","Love under pressure","الحب تحت الضغط"));
  ending("v24","core","aftersun","ambiguous-ending bittersweet-ending");
  c("v25",null,"taste","Which atmosphere feels closer?","أي أجواء أقرب لذوقك؟",
    frame("nightcrawler"),frame("manchester"));
  const coreLimit=questions.length;

  d("v26","od","judgment","Which pressure stays with you?","أي ضغط يبقى معك؟",
    frame("dunkirk","A narrow escape","نجاة على المحك"),
    frame("anatomy-fall","A person on trial","شخص تحت المحاكمة"));
  d("v27","observer","response","Which response fascinates you?","أي استجابة تثير اهتمامك؟",
    frame("dune-two","A prophecy taking shape","نبوءة تتشكّل"),
    frame("poor-things","Bella's discoveries","اكتشافات بيلا"));
  d("v28","decider","repair","Which change feels genuine?","أي تغيّر يبدو حقيقياً؟",
    frame("black-swan","Nina's pursuit","سعي نينا"),
    frame("moonlight","A connection restored","تواصل يُستعاد"));
  d("v29","sn","interpretation","Which image would you study twice?","أي مشهد تتأمّله مرتين؟",
    frame("first-man","The physical journey","الرحلة المادية"),
    frame("arrival","A new perception of time","إدراك مختلف للزمن"));
  d("v30","tf","judgment","Which dilemma interests you more?","أي معضلة تهمّك أكثر؟",
    frame("moneyball","The team's constraints","قيود بناء الفريق"),
    frame("her","The limits of intimacy","حدود الحميمية"));
  ending("v31","endings","challengers","open ambiguous-ending");
  d("v32","od","pressure","Which conflict is harder to resolve?","أي صراع أصعب حسمه؟",
    frame("tenet","An unstable timeline","خط زمني مضطرب"),
    frame("whiplash","Recognition & pressure","الاعتراف والضغط","whiplash-2014-best-antagonist.webp"));
  d("v33","observer","investigation","Which pursuit draws you in?","أي سعي يجذبك؟",
    frame("decision-leave","Reconstructing the case","إعادة بناء القضية"),
    frame("midnight-paris","Journeys through time","رحلات عبر الزمن"));
  d("v34","decider","conflict","Which resolution matters more?","أي حسم يعني لك أكثر؟",
    frame("tar","The artist beyond the title","الفنانة وراء اللقب"),
    frame("before-midnight","A relationship at a crossroads","علاقة على مفترق","before-midnight-wide.webp"));
  d("v35","sn","structure","Which sequence catches your attention?","أي تسلسل يجذب انتباهك؟",
    frame("1917","A journey in real time","رحلة بزمن متصل"),
    frame("your-name","Two intertwined timelines","زمنان متشابكان"));
  d("v36","tf","repair","Which reckoning stays with you?","أي مواجهة للنفس تبقى معك؟",
    frame("social-network","The legal dispute","النزاع القانوني"),
    frame("past-lives","A quiet understanding","تفاهم صامت"));
  d("v37",null,"taste","Which frame belongs on your wall?","أي كادر تختاره لجدارك؟",
    frame("babylon"),frame("asteroid-city"));
  d("v38","od","aftermath","Which tension would you keep following?","أي توتّر تواصل متابعته؟",
    frame("burning","A disappearance without answers","اختفاء بلا أجوبة"),
    frame("worst-person","The lives left behind","حيوات متروكة"));
  d("v39","observer","strategy","Which path through uncertainty?","أي مسار وسط المجهول؟",
    frame("interstellar","A calculated mission","مهمة محسوبة"),
    frame("midnight-paris","Following the unknown","اتباع المجهول"));
  d("v40","decider","resolution","Which journey feels more meaningful?","أي رحلة تحمل معنى أكبر؟",
    frame("inside-llewyn-davis","Llewyn's own music","موسيقى لوين الخاصة"),
    frame("beale-street","Love and solidarity","الحب والتضامن"));
  d("v41","sn","evidence","Which trace would you hold onto?","أي أثر تتمسّك به؟",
    frame("anatomy-fall","The physical evidence","الأدلة المادية"),
    frame("aftersun","Unspoken memories","ذكريات غير منطوقة"));
  d("v42","tf","judgment","Which confrontation would you revisit?","أي مواجهة تعيد مشاهدتها؟",
    frame("oppenheimer","A scientific argument","جدال علمي"),
    frame("banshees","A broken bond","رابطة تنكسر"));
  ending("v43","endings","decision-leave","tragic ambiguous-ending");

  // No fallback prose questions: unrecognized films are simply skippable.
  D.questions=questions;
  D.coreLimit=coreLimit;
  D.fullLimit=questions.length;
  D.artworkNames=[...new Set([...D.artworkNames,...questions.flatMap(q=>q.filmId?[q.still]:q.options.map(o=>o.still))].filter(Boolean))];
})();
