(() => {
  "use strict";

  const D = globalThis.CinemaProfileData;
  const C = globalThis.CinemaProfileCore;
  const CF = globalThis.CinemaCounterframe;
  const root = document.getElementById("cp-root");
  const round2 = window.ArchiveFeatures;
  const refinedQuestions = round2?.enabled('12');
  const STORAGE_KEY = "ts-archive-cinema-profile-adaptive-v2";
  const CLASSIC_STORAGE_KEY = "ts-archive-cinema-profile-visual-v5";
  const ACTIVE_EDITION_KEY = "ts-archive-cinema-profile-edition";
  const L = (en,ar) => ({en,ar});
  const strings = {
    title:L("Cinema Profile","بصمتك السينمائية"),
    intro:L("Choose between films and frames. Discover the patterns behind the stories you return to and the characters you understand.","اختر بين الأفلام والكادرات، واكتشف الأنماط وراء القصص التي تعود إليها والشخصيات التي تفهمها."),
    frameworkLabel:L("Inspired by","مستوحى من"),
    frameworks:L("Jungian cognitive functions · MBTI · Objective Personality · Enneagram","وظائف كارل يونغ المعرفية · MBTI · Objective Personality · Enneagram"),
    frameworkNote:L("An exploratory cinema portrait of cognitive preferences, taste and motives — not an official MBTI assessment.","قراءة استكشافية لميولك المعرفية وذائقتك ودوافعك من خلال السينما، وليست اختبارًا رسميًا لـMBTI."),
    adaptiveInstructions:L("Choose the scene or reaction that speaks to you, not a favourite title. Swap unfamiliar works; rate only films you've seen.",
      "اختر المشهد أو الموقف الأقرب إليك، لا الفيلم المفضّل لديك. يمكنك استبدال ما لم تشاهده، وقيّم فقط الأفلام التي شاهدتها."),
    profileHome:L("Profile home","بداية الاختبار"),
    archiveHome:L("The archive","الأرشيف"),
    begin:L("Begin assessment","ابدأ الاختبار"),
    resume:L("Resume assessment","أكمل الاختبار"),
    showResult:L("View saved result","عرض النتيجة المحفوظة"),
    age:L("Age range (optional)","الفئة العمرية (اختياري)"),
    time:L(D.coreLimit+" questions · Core profile",D.coreLimit+" سؤالاً · القراءة الأولية"),
    missing:L((D.fullLimit-D.coreLimit)+" optional questions for a deeper profile.",(D.fullLimit-D.coreLimit)+" سؤالاً إضافياً لقراءة أعمق."),
    method:L("About the method","عن منهج الاختبار"),
    method1:L("Every choice is a film or a cinematic frame. Only comparisons of familiar story moments contribute indirect evidence to the five coins; visual taste picks and ending ratings are kept separate.",
      "تعتمد الاختيارات على الأفلام ولقطاتها. وحدها المفاضلات بين مواقف مألوفة تقدّم أدلة غير مباشرة للمحاور المعرفية الخمسة؛ أما الذائقة البصرية وتقييم النهايات فيُقرآن بصورة مستقلة."),
    method2:L("Inspired by the repeated binary contrasts in Objective Personality, a possible pole requires agreement across several film pairs and contexts. These are hypotheses about your cinematic responses, not observed personality typing or a validated psychological test.",
      "استلهامًا من المفاضلات الثنائية المتكرّرة في Objective Personality، لا يُرجَّح اتجاه إلا إذا تكرّر عبر عدة مواقف وسياقات. هذه استنتاجات عن استجابتك للسينما، وليست تشخيصًا للشخصية أو اختبارًا نفسيًا مُعايرًا."),
    method3:L("Your answers are saved on this browser. You can export your result or copy it when you choose.",
      "تُحفظ إجاباتك في هذا المتصفح. وتستطيع تنزيل النتيجة أو نسخها عندما ترغب."),
    restart:L("Start over","ابدأ من جديد"),
    restartConfirm:L("Clear the saved assessment and start again?","هل تريد مسح تقدّمك المحفوظ والبدء من جديد؟"),
    back:L("Previous","السابق"),
    next:L("Continue","متابعة"),
    skip:L("Skip","تخطّ"),
    finish:L("See result","عرض النتيجة"),
    progress:L("Question","سؤال"),
    of:L("of","من"),
    coreStage:L("Core · familiar films","القراءة الأولية · أفلام مألوفة"),
    depthStage:L("Detailed · stories & characters","القراءة المعمّقة · الحكايات والشخصيات"),
    endingStage:L("Detailed · endings","القراءة المعمّقة · النهايات"),
    styleStage:L("Detailed · cinematic form","القراءة المعمّقة · الأسلوب السينمائي"),
    filmsHint:L("Mark any films you haven't seen, then choose one.","حدّد الأفلام التي لم تشاهدها، ثم اختر فيلماً."),
    visualHint:L("Choose from the frames themselves. You do not need to have seen the films.","اختر اعتمادًا على اللقطات نفسها؛ لا يلزم أن تكون قد شاهدت الأفلام."),
    selectHint:L("Choose the closest answer.","اختر الإجابة الأقرب إليك."),
    unseen:L("Not seen","لم أشاهده"),
    watched:L("Watched","شاهدته"),
    unseenHint:L("Optional: why haven't you watched it?","اختياري: لماذا لم تشاهده؟"),
    interested:L("Interested in watching","مهتم بمشاهدته"),
    notInterested:L("It hasn't appealed to me","لم يجذبني"),
    noOpportunity:L("No opportunity yet","لم تتح لي الفرصة"),
    synopsisLabel:L("About the film","عن الفيلم"),
    synopsis:L("Choose by synopsis","اختر بناءً على نبذة الفيلم"),
    synopsisHint:L("Choose by anticipated interest. This contributes to your taste profile.","اختر ما يثير فضولك بناءً على الوصف؛ ستُستخدم الإجابة في قراءة ذائقتك."),
    alternate:L("Try a parallel story","جرّب قصة موازية"),
    alternativeTitle:L("Equivalent story","قصة بديلة"),
    alternativeHint:L("The same question through a fictional situation.","السؤال نفسه من خلال موقف تخيلي."),
    returnFilms:L("Return to the films","العودة إلى الأفلام"),
    returnFilm:L("Answer about the film","أجب عن الفيلم"),
    onlyOne:L("Only one film is familiar. Rate that film for your taste profile.","إذا كنت قد شاهدت فيلمًا واحدًا فقط، فقيّم تجربتك معه لقراءة ذائقتك."),
    noneSeen:L("If you haven't watched either film, skip this question.","إذا لم تشاهد أيًّا من الفيلمين، يمكنك تخطّي السؤال."),
    seenQuestion:L("Have you watched this film?","هل شاهدت هذا الفيلم؟"),
    seenQuestionHint:L("We will ask about your experience of the film.","سنسألك عن تجربتك مع الفيلم."),
    yes:L("Yes, I watched it","نعم، شاهدته"),
    no:L("I haven't watched it","لم أشاهده"),
    ratingFilm:L("How satisfied were you with your experience of this film?","ما مدى رضاك عن تجربة مشاهدة هذا الفيلم؟"),
    ratingEnding:L("How satisfied were you with the ending?","ما مدى رضاك عن نهاية الفيلم؟"),
    ratingCharacter:L("How satisfying was this part of the story?","ما مدى رضاك عن هذا الجانب من القصة؟"),
    endingHint:L("Rate your satisfaction with the ending.","قيّم مدى رضاك عن النهاية."),
    feeling:L("How did the ending leave you feeling? (Optional)","ما الشعور الذي تركته النهاية لديك؟ (اختياري)"),
    reasonOptional:L("Choose one, if you wish.","اختياري، اختر جانباً واحداً."),
    coreResult:L("Your initial cinema profile","بصمتك السينمائية الأولية"),
    fullResult:L("Your cinema profile","بصمتك السينمائية"),
    resultIntro:L("Built from your choices, the perspectives you followed and the way you responded to cinematic stories.",
      "تستند القراءة إلى اختياراتك ووجهات النظر التي تابعتها وكيفية استجابتك للحكايات السينمائية."),
    deepen:L("Continue to the detailed assessment","تعمّق في القراءة"),
    refineHint:L("The optional "+(D.fullLimit-D.coreLimit)+" questions deepen the reading with new films and repeated coin checks.",
      "توسّع الأسئلة الـ"+(D.fullLimit-D.coreLimit)+" الاختيارية القراءة بأفلام جديدة ومراجعات متكررة للمحاور."),
    reviewAnswers:L("Review answers","راجع إجاباتك"),
    cognitive:L("Exploratory cognitive orientation","ملامح التوجّه المعرفي"),
    relative:L("Relative match scores","درجات الترجيح النسبية"),
    inconclusive:L("Orientation still open","الاتجاه غير محسوم"),
    limited:L("Limited evidence","أدلة محدودة"),
    tentative:L("Tentative pattern","اتجاه أولي"),
    consistent:L("Consistent answer pattern","إجابات متسقة نسبيًا"),
    balance:L("The Coins","المحاور المعرفية (Coins)"),
    balanceNote:L("Relative evidence balance, not typing accuracy. A leading pole needs at least three different film comparisons, two contexts and repeated agreement.","تمثّل النسب توازن الأدلة، لا دقّة التصنيف. يحتاج أيّ اتجاه راجح إلى ثلاث مفاضلات على الأقل في سياقين مختلفين، مع تكرار الاستجابة."),
    pair:L("Possible pair","التركيبة المحتملة"),
    noPair:L("More responses needed for a pair","تحتاج تركيبة الوظائف إلى مزيد من الإجابات"),
    taste:L("Your cinematic palette","لوحتك السينمائية"),
    affinities:L("Recurring worlds","عَوالم تتكرّر"),
    tasteNote:L("These features are inferred from contrasts and satisfaction ratings, using only the evidence you provided.",
      "نستخلص هذه الملامح من مفاضلاتك وتقييمات رضاك، استنادًا إلى ما قدّمته من إجابات."),
    genres:L("Genre palette","الأنواع السينمائية"),
    themes:L("Story motifs","الثيمات السردية"),
    style:L("Cinematic language","اللغة السينمائية"),
    tone:L("Atmosphere","الأجواء"),
    endings:L("Final frames","النهايات السينمائية"),
    noEvidence:L("More answers will clarify this.","مزيد من الإجابات سيجعل هذا الجانب أوضح."),
    evidence:L("Moments that shaped the reading","لحظات شكّلت القراءة"),
    reading:L("The Afterimage","أثر المشهد"),
    exposure:L("Film familiarity","معرفتك بالأفلام"),
    viewed:L("watched","شاهدتها"),
    unviewed:L("unwatched","لم تشاهدها"),
    interestedCount:L("interested","مهتم بها"),
    answered:L("answered","إجابات"),
    recommendations:L("Next screening","ترشيحات المشاهدة التالية"),
    recNote:L("Films from the Archive's catalogue, matched to your taste. Mark any you have seen to refresh the list.","أفلام من الأرشيف تتوافق مع ذائقتك. حدّد ما شاهدته لتحديث القائمة."),
    closeMatch:L("Close matches","الأقرب إلى ذائقتك"),
    discovery:L("Related discoveries","اكتشافات قريبة من ذائقتك"),
    recSeen:L("Already watched","شاهدته سابقًا"),
    recNo:L("Not interested","غير مهتم"),
    matchedInterest:L("On your interested list","من الأفلام التي تودّ مشاهدتها"),
    share:L("Keep exploring","واصل الاستكشاف"),
    prompt:L("Your personalized ChatGPT prompt","برومبت قراءتك الشخصية لـChatGPT"),
    promptHint:L("Includes your preferences, examples and known films. Copy it into a new chat to request fresh recommendations.",
      "يتضمّن تفضيلاتك وأمثلة من إجاباتك والأفلام التي تعرفها. انسخه في محادثة جديدة لاستكشاف بصمتك والحصول على ترشيحات إضافية."),
    copy:L("Copy prompt","انسخ البرومبت"),
    chat:L("Open ChatGPT","افتح ChatGPT"),
    copied:L("Copied to clipboard.","تم النسخ."),
    copyManual:L("Select the text to copy it manually.","حدّد النص وانسخه يدويًا."),
    save:L("Save result","احفظ النتيجة"),
    image:L("Download result image","احفظ بطاقة النتيجة كصورة"),
    imageHint:L("A printable card with your signature, story motifs and selected films.","بطاقة مرئية تضم بصمتك ودوافعك السردية وأفلامًا من اختياراتك."),
    email:L("Email (optional)","البريد الإلكتروني (اختياري)"),
    emailPlaceholder:L("you@example.com","you@example.com"),
    emailAction:L("Open email draft","إعداد رسالة بريد"),
    emailHint:L("Opens your email app with a prepared message. You choose when to send it.","يفتح تطبيق بريدك برسالة جاهزة ويمكنك اختيار إرسالها."),
    downloadDone:L("Result image downloaded.","تم تنزيل صورة النتيجة."),
    methodShort:L("Exploratory, uncalibrated preference assessment.","قراءة استكشافية للتفضيلات لم تُعاير إحصائيًا بعد."),
    notEnough:L("There is not enough evidence to make a reliable distinction yet.","الأدلة الحالية محدودة لتحديد اتجاه واضح. يمكنك متابعة الأسئلة التفصيلية."),
    qualityNote:L("A repeated pattern can support a hypothesis. It cannot establish a true psychological type without independent validation.",
      "قد يدعم تكرار النمط فرضية، لكنه لا يكفي لإثبات تصنيف نفسي من دون تحقّق مستقل.")
  };

  const escape = value => String(value ?? "").replace(/[&<>"']/g, char =>
    ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const e = escape;
  let state = readState();
  let draft = null;
  let current = null;
  let result = null;
  let warmTimer=0,warmSequence=0;

  const adaptiveState=()=>state.version===6&&Boolean(D.adaptive);
  const activeQuestions=()=>C.questionsForState(state);
  const limits=()=>C.limitsForState(state);
  const activeSlot=()=>activeQuestions()[state.index];

  function t(key) { return C.local(strings[key],state.locale); }
  function loc(text) { return C.local(text,state.locale); }
  function tagLabel(tag) { return C.label(tag,state.locale); }
  function artwork(name) { return name?.startsWith("assets/")?name:globalThis.CinemaProfileArtwork?.[name] || "assets/films/"+name; }
  function filmFileLink(film,content,classes="") {
    if(!film)return content;
    const internal=D.archiveFilmById?.[film.id];
    const href=internal||"https://letterboxd.com/search/films/"+encodeURIComponent(film.title+" "+film.year)+"/";
    const label=(state.locale==="ar"?(internal?"فتح بطاقة فيلم ":"فتح الفيلم على Letterboxd: "):(internal?"Open film file: ":"Open on Letterboxd: "))+film.title+" · "+film.year+(state.locale==="ar"?" (تبويب جديد)":" (new tab)");
    return '<a class="cp-archive-film-link '+classes+'" href="'+e(href)+'" target="_blank" rel="noopener noreferrer" aria-label="'+e(label)+'" data-film-file-link="'+e(film.id)+'">'+content+'</a>';
  }
  function profileImage(name,sizes,fallback=640) {
    return globalThis.ArchiveMedia.attributes(globalThis.ArchiveProfileMedia,artwork(name),sizes,fallback);
  }
  function warmNextArtwork(){
    clearTimeout(warmTimer);
    const sequence=++warmSequence;
    const route=state.route,index=route==="counterframe"?counterframeState().index:state.index;
    const connection=navigator.connection;
    if(!adaptiveState()||connection?.saveData||/2g/.test(connection?.effectiveType||""))return;
    if(route!=="quiz"&&route!=="counterframe")return;
    const slot=route==="counterframe"?CF.questions[index+1]:index+1<state.limit?activeQuestions()[index+1]:null;
    if(!slot)return;
    let question=slot;
    if(slot.forms){
      const stored=route==="counterframe"?counterframeState().answers[slot.id]?.form:
        state.pendingForms?.[slot.id]??state.answers[slot.id]?.form;
      const form=Number.isInteger(stored)?stored:route==="counterframe"?CF.selectForm(slot,state):D.adaptive.selectForm(slot,state);
      if(form<0)return;
      question=route==="counterframe"?CF.form(slot,{form}):C.formForAnswer(slot,{form});
    }
    const stills=question.filmId?[question.still]:question.options.map(o=>o.still).filter(Boolean);
    if(!stills.length)return;
    const active=()=>sequence===warmSequence&&state.route===route&&
      (route==="counterframe"?counterframeState().index:state.index)===index;
    const images=[...root.querySelectorAll(".cp-visual-art img,.cp-rating-frame > img")];
    // Never compete with the card the visitor is looking at or preload the
    // whole bank. At most the next two screen-sized images are warmed.
    Promise.allSettled(images.map(img=>img.decode?.())).then(()=>{
      if(!active())return;
      warmTimer=setTimeout(()=>{
        if(!active())return;
        const width=window.innerWidth<681?window.innerWidth*(question.filmId ? .94 : .92):question.filmId?Math.min(740,window.innerWidth*.94):window.innerWidth*.45;
        for(const still of stills.slice(0,2)){
          const src=globalThis.ArchiveMedia.select(globalThis.ArchiveProfileMedia,artwork(still),width).src;
          void globalThis.ArchiveMedia.preload(src,"low");
        }
      },180);
    });
  }

  function savedEdition(key,version) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved && saved.version===version && ["intro","quiz","result","counterframe"].includes(saved.route) &&
          ["en","ar"].includes(saved.locale) && saved.answers && saved.familiarity) {
        const bounds=C.limitsForState(saved);
        if(version===6){
          if(saved.bankRevision!==D.adaptive.revision)return null;
          const allowed=new Set(D.adaptive.refinement.map(q=>q.id));
          saved.refinement=[...new Set((Array.isArray(saved.refinement)?saved.refinement:[]).filter(id=>allowed.has(id)))];
        }
        const length=C.questionsForState(saved).length;
        if(![bounds.core,bounds.full,length].includes(saved.limit)||!Number.isInteger(saved.index)||saved.index<0||saved.index>=saved.limit)return null;
        saved.counterframe=CF.normalize(saved.counterframe);
        return saved;
      }
    } catch {}
    return null;
  }
  function readState() {
    let locale = navigator.language?.startsWith("ar") ? "ar" : "en";
    try{
      const previous=JSON.parse(localStorage.getItem("ts-archive-cinema-profile-adaptive-v1")||"null");
      if(["en","ar"].includes(previous?.locale))locale=previous.locale;
      if(localStorage.getItem(ACTIVE_EDITION_KEY)==="classic")
        return savedEdition(CLASSIC_STORAGE_KEY,5)||savedEdition(STORAGE_KEY,6)||C.createState(locale);
    }catch{}
    return savedEdition(STORAGE_KEY,6)||savedEdition(CLASSIC_STORAGE_KEY,5)||C.createState(locale);
  }
  function persist() {
    try {
      localStorage.setItem(state.version===6?STORAGE_KEY:CLASSIC_STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(ACTIVE_EDITION_KEY,state.version===6?"adaptive":"classic");
    } catch {}
  }
  function goTop() { window.scrollTo({top:0,behavior:"instant"}); }
  function settleStage(key, keepScroll) {
    if (!refinedQuestions) return;
    const heading=root.querySelector('.cp-question-title');
    if (!heading) return;
    heading.tabIndex=-1;
    if (round2.stageCut(root,key,'.cp-visual-heading') && !keepScroll) heading.focus({preventScroll:true});
  }
  function syncFrameChoices(actionName, choice) {
    const buttons=[...root.querySelectorAll('.cp-visual-select')].filter(button=>button.dataset.action===actionName);
    for (const button of buttons) {
      const selected=button.dataset.value===choice;
      button.classList.toggle('cp-visual-selected',selected);
      button.setAttribute('aria-pressed',String(selected));
      const mark=button.querySelector('.cp-visual-check');
      if(mark)mark.textContent=selected?'✓':'';
    }
    return buttons.length>0;
  }
  function syncRatingControls(actionName,value) {
    const buttons=[...root.querySelectorAll('.cp-rating-step')].filter(button=>button.dataset.action===actionName);
    for(const button of buttons)button.setAttribute('aria-pressed',String(Number(button.dataset.value)===value));
    return buttons.length>0;
  }
  function syncQuestionControls(name) {
    if(!refinedQuestions)return false;
    const synced=name==='select'&&current.kind==='visual'?syncFrameChoices('select',draft.choice):name==='rating'&&['ending','satisfaction'].includes(current.kind)?syncRatingControls('rating',draft.rating):false;
    if(synced)root.querySelector('[data-action="next"]').disabled=!canContinue();
    return synced;
  }
  function stageLabel(question) {
    if(question.stage==="refine")return state.locale==="ar"?"تعمّق موجّه":"Focused refinement";
    if(adaptiveState())return question.stage==="core"?(state.locale==="ar"?"الاختبار الأساسي":"Core profile"):(state.locale==="ar"?"قراءة أعمق":"Deep profile");
    if(question.frameFilm)return state.locale==='ar'?"الأساسي · قراءة القصص":"Core · reading stories";
    return t({core:"coreStage",depth:"depthStage",endings:"endingStage",style:"styleStage"}[question.stage]);
  }
  function action(name,label,style="",extra="") {
    return '<button type="button" class="cp-button '+style+'" data-action="'+name+'" '+extra+'>'+e(label)+'</button>';
  }
  const feedbackReasons=[
    {id:"response",label:L("The response felt like mine","الاستجابة تشبه طريقتي")},
    {id:"film",label:L("I know or like that film","معرفتي أو إعجابي بالفيلم")},
    {id:"frame",label:L("The visual frame","الكادر البصري")},
    {id:"wording",label:L("The wording was unclear","الصياغة لم تكن واضحة")},
    {id:"uncertain",label:L("I was unsure","لم أكن متأكداً")}
  ];
  function feedbackSample(){
    if(!adaptiveState()||!result)return [];
    const items=Object.values(result.balance).flatMap(info=>info.evidence);
    const selection=[];
    for(const mode of ["film","text","any"]){
      const pool=items.filter(item=>(mode==="any"||item.mode===mode)&&!selection.includes(item));
      if(pool.length)selection.push(pool[Math.abs(state.seed||0)%pool.length]);
    }
    return selection;
  }
  function feedbackKey(item){
    const answer=state.answers[item.slot];
    return (answer.form??0)+":"+answer.choice;
  }
  function feedbackPanel(){
    const ar=state.locale==="ar",items=feedbackSample();
    if(state.route!=="result"||!items.length)return "";
    return '<details class="cp-question-audit"><summary>'+e(ar?"ملاحظات اختيارية على الأسئلة":"Optional question feedback")+'</summary><p class="cp-small">'+e(ar?"هذه الملاحظات تساعد على تحسين وضوح الأسئلة. لا تغيّر نتيجتك، وتبقى في متصفّحك ما لم تختر نسخها ومشاركتها.":"These notes help improve question clarity. They do not change your result and stay in your browser unless you choose to copy and share them.")+'</p>'+
      items.map(item=>{
        const saved=state.feedback?.[item.slot],selected=saved?.key===feedbackKey(item)?saved.reason:"";
        const reasons=feedbackReasons.filter(reason=>item.mode!=="text"||!["film","frame"].includes(reason.id));
        return '<article><p>'+e(loc(item.prompt))+'</p><small>'+e(loc(item.choice))+'</small><p class="cp-small">'+e(ar?"ما الذي أثّر أكثر في اختيارك؟":"What most influenced this answer?")+'</p><div class="cp-reason-set">'+reasons.map(reason=>
          '<button type="button" class="cp-chip" data-action="qa-reason" data-slot="'+e(item.slot)+'" data-value="'+e(reason.id)+'" aria-pressed="'+String(selected===reason.id)+'">'+e(loc(reason.label))+'</button>').join("")+'</div></article>';
      }).join("")+'<button type="button" class="cp-text-button" data-action="qa-copy">'+e(ar?"نسخ ملاحظات الأسئلة فقط":"Copy question feedback only")+'</button><p class="cp-small" role="status" id="cp-audit-status"></p><textarea id="cp-audit-export" hidden readonly aria-label="'+e(ar?"ملاحظات الأسئلة":"Question feedback")+'"></textarea></details>';
  }
  async function copyFeedback(){
    const items=feedbackSample().flatMap(item=>{
      const saved=state.feedback?.[item.slot],answer=state.answers[item.slot];
      return saved?.key===feedbackKey(item)?[{question:item.slot,form:answer.form??0,choice:answer.choice,reason:saved.reason}]:[];
    });
    const ar=state.locale==="ar",status=document.getElementById("cp-audit-status");
    if(!items.length){if(status)status.textContent=ar?"ماكو ملاحظات محدّدة بعد.":"No feedback has been selected yet.";return;}
    const report=JSON.stringify({edition:D.adaptive.revision,language:state.locale,items},null,2);
    let copied=false;
    try{await navigator.clipboard.writeText(report);copied=true;}catch{}
    if(copied){if(status)status.textContent=t("copied");}
    else{
      const field=document.getElementById("cp-audit-export");
      if(field){field.value=report;field.hidden=false;field.select();}
      if(status)status.textContent=t("copyManual");
    }
  }
  function methodBlock() {
    const ar=state.locale==="ar";
    if(adaptiveState())return '<details class="cp-method"><summary>'+e(t("method"))+'</summary><p>'+e(ar?"بعد كل سبعة اختيارات في المواقف والذائقة والدوافع، يأتي تقييم رضا من خمس درجات. إذا لم تشاهد أحد الأفلام أو لم تتذكّر المشهد، يُعرض بديل سينمائي ثم موقف مكتوب قصير عند الحاجة. يُحتسب كل سؤال مرة واحدة فقط.":"Seven choices alternate with a five-point satisfaction rating. Unfamiliar comparisons can switch to parallel films, then a short written scenario. Each question counts once.")+'</p><p>'+e(ar?"الاختيارات المعرفية والذائقة والدوافع السردية مصادر مستقلة للأدلة. رؤية لقطة لا تعني مشاهدة الفيلم، والإجابة المحايدة أو التخطّي لا يرجّحان أيّ اتجاه. نعرض الأدلة السينمائية والنصية بصورة منفصلة لأن الصيغ لم تُعاير إحصائيًا معًا بعد.":"Cognitive choices, taste and story motives are independent evidence streams. Seeing a frame is not watching a film; neutral or skipped answers support neither pole. Film and text evidence are shown separately because the forms are not statistically equated yet.")+'</p><p>'+e(t("method2"))+'</p><p>'+e(t("method3"))+'</p><p><a href="https://www.testingstandards.net/open-access-files.html" target="_blank" rel="noopener noreferrer">Testing standards</a> · <a href="https://www.cdc.gov/nchs/ccqder/question-evaluation/cognitive-interviewing.html" target="_blank" rel="noopener noreferrer">Question evaluation</a> · <a href="https://www.objectivepersonality.com/faq" target="_blank" rel="noopener noreferrer">Objective Personality</a></p>'+feedbackPanel()+'</details>';
    return '<details class="cp-method"><summary>'+e(t("method"))+'</summary><p>'+e(t("method1"))+'</p><p>'+
      e(t("method2"))+'</p><p>'+e(t("method3"))+'</p><p>'+
      '<a href="https://www.objectivepersonality.com/faq" target="_blank" rel="noopener noreferrer">Objective Personality</a> · '+
      '<a href="https://www.youtube.com/watch?v=LYLIm2UiEjc" target="_blank" rel="noopener noreferrer">Animals</a> · '+
      '<a href="https://www.enneagraminstitute.com/how-the-enneagram-system-works/" target="_blank" rel="noopener noreferrer">Enneagram</a> · '+
      '<a href="https://doi.org/10.31234/osf.io/wsdu8_v2" target="_blank" rel="noopener noreferrer">Movie preferences and personality</a> · '+
      '<a href="https://doi.org/10.1111/j.1468-2958.2009.01368.x" target="_blank" rel="noopener noreferrer">Audience appreciation</a></p></details>';
  }

  function syncIntroChrome() {
    document.body.classList.toggle("cp-intro-header-scrolled",state.route==="intro"&&window.scrollY>36);
  }
  function render() {
    document.documentElement.lang=state.locale;
    document.body.classList.toggle("cp-intro-page",state.route==="intro");
    syncIntroChrome();
    root.dir=state.locale==="ar"?"rtl":"ltr";
    root.classList.toggle("cp-adaptive",adaptiveState());
    document.querySelectorAll("[data-lang]").forEach(button=>
      button.setAttribute("aria-pressed",String(button.dataset.lang===state.locale)));
    const routeNav=document.getElementById('cp-route-nav');
    routeNav.dir=root.dir;
    routeNav.querySelector('.cp-route-actions').hidden=state.route==='intro';
    document.querySelectorAll('[data-profile-label]').forEach(node=>{
      const key={archive:'archiveHome',home:'profileHome',restart:'restart'}[node.dataset.profileLabel];
      if(key)node.textContent=t(key);
    });
    if(state.route==="intro") renderIntro();
    else if(state.route==="quiz") renderQuestion();
    else if(state.route==="counterframe") renderCounterframeQuestion();
    else renderResult();
  }

  function filmCaption(film) {
    return '<span class="cp-film-credit" dir="ltr">'+film.year+(film.director?' · '+e(film.director):"")+'</span>';
  }

  function resumeRoute() {
    if (["quiz","result","counterframe"].includes(state.resumeRoute)) return state.resumeRoute;
    const count=Object.values(state.answers).filter(answer=>answer.done).length;
    if(count>=state.limit)return 'result';
    return count?'quiz':null;
  }
  function pauseToIntro() {
    if(state.route==='intro')return;
    state.resumeRoute=state.route;
    if(state.route==='quiz'&&current?.id===activeSlot()?.id&&draft)state.pausedDraft={id:current.id,answer:{...draft}};
    state.route='intro';persist();render();goTop();
    root.querySelector('h1')?.focus({preventScroll:true});
  }
  function startFromIntro() {
    const resume=resumeRoute();
    const paused=state.pausedDraft;
    state.route=resume||'quiz';
    if(!resume)state.index=0;
    delete state.resumeRoute;delete state.pausedDraft;
    current=null;draft=null;
    if(state.route==='quiz'&&paused?.id===activeSlot()?.id&&paused.answer&&typeof paused.answer==='object'){
      draft={...paused.answer};current=C.formForAnswer(activeSlot(),draft);
    }
    persist();render();goTop();
  }
  function restartAssessment() {
    if(!window.confirm(t('restartConfirm')))return;
    state=C.createState(state.locale,{legacy:!adaptiveState()});current=null;draft=null;result=null;persist();render();goTop();
  }
  function switchEdition(legacy){
    if(legacy===!adaptiveState())return;
    persist();
    const target=savedEdition(legacy?CLASSIC_STORAGE_KEY:STORAGE_KEY,legacy?5:6)||C.createState(state.locale,{legacy});
    target.locale=state.locale;
    if(target.route!=="intro"){target.resumeRoute=target.route;target.route="intro";}
    state=target;current=null;draft=null;result=null;persist();render();goTop();
  }

  function editionPicker(ar,isAdaptive){
    const button=(legacy,name,count)=>'<button type="button" class="cp-edition-option" data-action="'+(legacy?'classic-edition':'adaptive-edition')+'" aria-pressed="'+(legacy===!isAdaptive)+'"><strong>'+e(name)+'</strong><small>'+e(count)+'</small></button>';
    return '<div class="cp-edition-picker" role="group" aria-label="'+e(ar?'اختر إصدار الاختبار':'Choose assessment edition')+'">'+
      button(false,ar?'إصدار المشاهد':'Scene Edition','32 + 24')+button(true,ar?'الإصدار الكلاسيكي':'Classic Edition','25 + 18')+'</div>'+
      '<p class="cp-edition-description cp-small">'+e(isAdaptive?(ar?'استكشف ذاتك من خلال المشاهد والشخصيات وقراراتها.':'Explore scenes, characters and story decisions.'):(ar?'النسخة الأصلية للمفاضلات السينمائية.':'The original cinematic comparisons.'))+'</p>';
  }

  function renderIntro() {
    const ar=state.locale==="ar",bounds=limits(),isAdaptive=adaptiveState();
    const savedCount = Object.values(state.answers).filter(answer=>answer.done).length;
    const resume=resumeRoute();
    const cover=D.filmById[D.introCover.filmId];
    const coverFilms=D.introFilms.map(id=>D.filmById[id]);
    const gallery=coverFilms.map(film=>'<figure>'+filmFileLink(film,'<img '+profileImage(D.introFrames[film.id]||film.still,'(min-width: 2420px) 605px, (min-width: 1515px) 25vw, 29vw',640)+' alt="'+
      e(film.title)+'" decoding="async" loading="lazy"><span class="cp-hero-film-caption"><span lang="en">'+e(film.title)+'</span><span>'+film.year+'</span></span>','cp-hero-film-card cp-link-art')+'</figure>').join("");
    root.innerHTML =
      '<section class="cp-intro-cover" aria-labelledby="cp-intro-title"><div class="cp-intro-cover-art"><img '+profileImage(D.introCover.still,'(max-width: 680px) 100vw, 100vw',1280)+' alt="" fetchpriority="high" decoding="async"></div>'+
      '<div class="cp-wrap-wide cp-intro-cover-copy"><p class="cp-eyebrow">'+e(ar?'THE T.S. ARCHIVE · قراءة سينمائية':'THE T.S. ARCHIVE / A CINEMATIC READING')+'</p>'+
      '<h1 class="cp-intro-title" id="cp-intro-title" tabindex="-1">'+e(t("title"))+'</h1><p class="cp-intro-subtitle">'+e(ar?'تأمّل شخصيتك من خلال السينما.':'Personality through film.')+'</p>'+
      '<p class="cp-intro-framework" lang="en" dir="ltr">MBTI · OPS · ENNEAGRAM</p></div>'+
      '<div class="cp-wrap-wide cp-intro-cover-credit">'+filmFileLink(cover,e(cover.title)+' · '+e(cover.year))+'</div></section>'+
      '<section class="cp-wrap-wide cp-intro-content"><div class="cp-start-card">'+editionPicker(ar,isAdaptive)+'<div class="cp-intro-start-row"><div class="cp-intro-start-copy"><div class="cp-start-facts"><strong>'+e(bounds.core+(ar?" سؤالاً · ":" questions · ")+(isAdaptive?(ar?"القراءة الأولية":"Core profile"):(ar?"الإصدار الكلاسيكي":"Classic profile")))+'</strong><span>'+e(ar?'التعمّق اختياري · '+(bounds.full-bounds.core)+' سؤالاً':'Optional depth · '+(bounds.full-bounds.core)+' questions')+'</span></div>'+
      (isAdaptive?'<p class="cp-small cp-start-guidance">'+e(t("adaptiveInstructions"))+'</p>':'')+'</div>'+
      '<div class="cp-start-actions">'+action("start",resume==='result'?t('showResult'):resume?t("resume"):t("begin"),"cp-button-primary")+
      (resume||savedCount?'<button type="button" class="cp-text-button" data-action="restart">'+e(t("restart"))+'</button>':"")+'</div></div>'+
      '<small class="cp-edition-note">'+e(ar?'تُحفظ الإجابات والنتائج لكل إصدار بصورة مستقلة.':'Progress and results are saved separately for each edition.')+'</small></div>'+
      '<section class="cp-intro-works" aria-labelledby="cp-intro-works-title"><div class="cp-intro-works-heading"><h2 id="cp-intro-works-title">'+e(ar?'أعمال في الاختبار':'Works in the profile.')+'</h2><a href="index.html#decades" target="_blank" rel="noopener noreferrer">'+e(ar?'الأرشيف ↗':'THE ARCHIVE ↗')+'</a></div><div class="cp-hero-art cp-intro-works-grid">'+gallery+'</div></section>'+
      '<section class="cp-intro-method"><p class="cp-small cp-framework-note">'+e(t("frameworkNote"))+'</p>'+methodBlock()+'</section></section>';
  }

  function initDraft() {
    const slot=activeSlot();
    const saved = state.answers[slot.id];
    if(adaptiveState()){
      const pending=state.pendingForms?.[slot.id];
      const chosen=Number.isInteger(pending)?pending:Number.isInteger(saved?.form)?saved.form:D.adaptive.selectForm(slot,state);
      const form=chosen<0?Math.max(0,(slot.forms?.length||1)-1):chosen;
      current=C.formForAnswer(slot,{form});
      draft=saved&&saved.form===form&&!["skip","neutral"].includes(saved.mode)?{...saved,form}:
        {mode:current.kind==="scenario"?"text":current.purpose==="rating"?"actual":"visual",form,choice:"",rating:null,feeling:"",considered:[]};
      return;
    }
    current=slot;
    if (saved && saved.mode!=="skip") draft={...saved};
    else {
      draft = {mode:current.kind==="visual"?"visual":current.kind==="ending"?"actual":"skip",choice:"",rating:null,feeling:"",considered:[]};
    }
  }

  function knownOptions(question) {
    return question.options.filter(option=>!C.isUnseen(state.familiarity[option.filmId]));
  }

  function normalizeDraft() {
    if (current.kind==="films" && !["alternative","synopsis","image"].includes(draft.mode)) {
      const known=knownOptions(current);
      const previous=draft.mode;
      draft.mode=known.length>=2?"compare":known.length===1?"single":"empty";
      if (draft.mode==="single") {
        if (draft.choice!==known[0].id || previous!=="single") draft.rating=null;
        draft.choice=known[0].id;
      } else if (!known.some(option=>option.id===draft.choice)) draft.choice="";
    }
  }

  function canContinue() {
    if(adaptiveState())return current.purpose==="rating"?Boolean(draft.rating):Boolean(draft.choice);
    if (draft.mode==="empty") return false;
    if (draft.mode==="single") return Boolean(draft.rating);
    if (current.kind==="ending" && draft.mode!=="alternative") return Boolean(draft.rating);
    if (current.kind==="reaction" && draft.mode!=="alternative" && current.rating)
      return Boolean(draft.choice && draft.rating);
    return Boolean(draft.choice);
  }

  function reasonSet(filmId) {
    const status=state.familiarity[filmId];
    if(!C.isUnseen(status))return "";
    return '<div class="cp-reason-set" aria-label="'+e(t("unseenHint"))+'">'+
      [["interested","interested"],["not-interested","notInterested"],["no-opportunity","noOpportunity"]].map(([value,key])=>
        '<button type="button" class="cp-chip" data-action="unseen-reason" data-film="'+e(filmId)+'" data-value="'+value+
        '" aria-pressed="'+String(status===value)+'">'+e(t(key))+'</button>').join("")+'</div>';
  }

  function filmContext(film, allowSwitch, compact=false) {
    const switcher=allowSwitch?'<button type="button" class="cp-text-button" data-action="film-unseen" data-film="'+
      e(film.id)+'">'+e(t("unseen"))+'</button>':"";
    const meta='<div class="cp-scene-meta"><div><strong lang="en">'+e(film.title)+'</strong>'+
      filmCaption(film)+'</div>'+switcher+'</div>';
    if (!compact && (current?.still||film.still)) {
      return '<figure class="cp-film-scene"><img '+profileImage(current?.still||film.still,'(max-width: 680px) 94vw, 800px',960)+' alt="'+
        e(film.title)+'" decoding="async">'+meta+'</figure>';
    }
    const art=film.poster?'<img '+profileImage(film.poster,'180px',320)+' alt="" decoding="async">':"";
    return '<div class="cp-film-context'+(compact?' cp-context-compact':'')+'">'+art+meta+'</div>';
  }

  function renderRating(title, showTitle=true) {
    return '<div class="cp-rating-block">'+(showTitle?'<h3>'+e(title)+'</h3>':'')+
      '<div class="cp-rating" role="group" aria-label="'+e(title)+'">'+
      [5,4,3,2,1].map(value=>'<button type="button" data-action="rating" data-value="'+value+'" aria-pressed="'+
        String(draft.rating===value)+'"><span class="cp-rating-tick" aria-hidden="true"></span><span>'+
        e(C.ratingNames[state.locale][value-1])+'</span></button>').join("")+'</div></div>';
  }

  function renderChoiceOptions(question,mode) {
    return '<div class="cp-choices" role="group">'+C.orderedOptions(question,mode,state.seed).map(option=>
      '<button type="button" class="cp-choice" data-action="select" data-value="'+e(option.id)+'" aria-pressed="'+
      String(draft.choice===option.id)+'"><span class="cp-circle" aria-hidden="true">'+(draft.choice===option.id?"✓":"")+
      '</span><span>'+e(loc(option.label))+'</span></button>').join("")+'</div>';
  }

  function renderFilmQuestion() {
    const synopsis = draft.mode==="synopsis";
    const visual = draft.mode==="image";
    const landscape=visual||(!synopsis&&current.options.every(item=>D.filmById[item.filmId].still));
    const known = knownOptions(current);
    const cards=C.orderedOptions(current,"compare",state.seed).map(option=>{
      const film=D.filmById[option.filmId], status=state.familiarity[film.id];
      const unseen=C.isUnseen(status);
      const selected=draft.choice===option.id;
      const disabled=!synopsis&&!visual&&unseen;
      const art=landscape?film.still:film.poster;
      const image=art?'<img '+profileImage(art,landscape?'(max-width: 680px) 92vw, 45vw':'(max-width: 680px) 38vw, 180px)',landscape?640:320)+' alt="" decoding="async">':"";
      return '<div class="cp-film-card '+(selected?"cp-selected ":"")+(unseen?"cp-unseen":"")+'">'+
        '<button type="button" class="cp-film-choice" data-action="select" data-value="'+e(option.id)+'" aria-pressed="'+
        String(selected)+'" '+(disabled?"disabled":"")+'><div class="cp-film-art">'+image+
        '<span class="cp-film-check" aria-hidden="true">'+(selected?"✓":"")+'</span></div>'+
        '<div class="cp-film-meta"><strong class="cp-film-title" lang="en">'+e(film.title)+'</strong>'+
        filmCaption(film)+(synopsis?'<p class="cp-film-description">'+e(loc(film.description))+'</p>':"")+
        '</div></button>'+
        (visual?"":'<div class="cp-film-familiarity"><div class="cp-familiarity-row"><button type="button" data-action="toggle-unseen" data-film="'+
        e(film.id)+'" aria-pressed="'+String(unseen)+'"><span class="cp-square" aria-hidden="true">'+
        (unseen?"✓":"")+'</span>'+e(t("unseen"))+'</button>'+
        (status==="seen"?'<span>'+e(t("watched"))+'</span>':"")+'</div>'+reasonSet(film.id)+'</div>')+'</div>';
    }).join("");
    return '<h2 class="cp-question-title">'+e(loc(current.prompt))+'</h2><p class="cp-small">'+
      e(visual?t("visualHint"):synopsis?t("synopsisHint"):t("filmsHint"))+'</p><div class="cp-film-grid" data-count="'+
      current.options.length+'" data-visual="'+(landscape?"still":"poster")+'">'+cards+'</div>'+
      (draft.mode==="single"?'<p class="cp-notice">'+e(t("onlyOne"))+'</p>'+renderRating(t("ratingFilm")):"")+
      (draft.mode==="empty"?'<p class="cp-notice">'+e(t("noneSeen"))+'</p>':"")+
      '';
  }

  function renderVisualQuestion(){
    const ar=state.locale==="ar";
    const cinema=adaptiveState()&&current.cinematic;
    const same=cinema&&new Set(current.options.map(o=>o.filmId)).size===1;
    const sharedFilm=same?D.filmById[current.options[0].filmId]:null;
    const hint=adaptiveState()?
      current.purpose==="coin"?"":current.purpose==="motive"?(ar?"لا يلزم أن تكون قد شاهدت الفيلم.":"No previous viewing required."):
      current.tasteScope==="viewing"?(ar?"اختر الفيلم الذي تودّ مشاهدته؛ لا يلزم أن تكون قد شاهدته من قبل.":"Choose the film you would like to see; no previous viewing required."):
      (ar?"اختر ما يلفت انتباهك؛ لا يلزم أن تكون قد شاهدت الفيلم.":"Choose what draws you in; no viewing required."):
      current.coin?(ar?"إذا شاهدت العملين، اختر أحدهما.":"Choose one if you have seen both films."):
      (ar?"اختر اللقطة التي تشدّك أكثر.":"Choose the frame that draws you in.");
    const cards=C.orderedOptions(current,"visual",state.seed).map(option=>{
      const movie=D.filmById[option.filmId],selected=draft.choice===option.id;
      const caption=loc(option.label);
      const meta=cinema?'<div class="cp-visual-meta cp-cinema-answer"><div><strong>'+e(caption)+'</strong>'+
        (same?"":'<small class="cp-scene-credit" lang="en" dir="ltr">'+e(movie.title)+' · '+movie.year+'</small>')+'</div></div>':
        '<div class="cp-visual-meta"><div><strong lang="en" dir="ltr">'+e(movie.title)+'</strong>'+
        (caption?'<span class="cp-visual-caption">'+e(caption)+'</span>':'')+'</div><small>'+movie.year+'</small></div>';
      return '<button type="button" class="cp-visual-select '+(cinema?'cp-scene-choice ':'')+(selected?'cp-visual-selected':'')+
        '" data-action="select" data-value="'+e(option.id)+'" aria-pressed="'+String(selected)+'" aria-label="'+e(movie.title+(caption?' · '+caption:''))+'">'+
        '<div class="cp-visual-art"><img '+profileImage(option.still,'(max-width: 680px) 92vw, 45vw',640)+' alt="" decoding="async" fetchpriority="high" draggable="false">'+
        '<span class="cp-visual-check" aria-hidden="true">'+(selected?'✓':'')+'</span></div>'+
        meta+'</button>';
    }).join("");
    return '<div class="cp-visual-heading">'+(sharedFilm?'<p class="cp-eyebrow cp-scene-film" lang="en" dir="ltr">'+e(sharedFilm.title)+' · '+sharedFilm.year+'</p>':"")+'<h2 class="cp-question-title">'+e(loc(current.prompt))+'</h2>'+
      (hint?'<p class="cp-small">'+e(hint)+'</p>':"")+'</div>'+
      '<div class="cp-visual-grid" role="group" aria-label="'+e(loc(current.prompt))+'">'+cards+'</div>';
  }
  function scenarioChoices(question,chosen,actionName="select"){
    const ar=state.locale==="ar";
    return '<div class="cp-visual-heading"><p class="cp-eyebrow">'+e(ar?"موقف موازٍ":"Parallel story")+'</p><h2 class="cp-question-title">'+e(loc(question.prompt))+'</h2>'+
      '<p class="cp-scenario-copy">'+e(loc(question.scene))+'</p></div><div class="cp-choices cp-scenario-choices" role="group" aria-label="'+e(loc(question.prompt))+'">'+
      C.orderedOptions(question,"visual",state.seed).map(option=>'<button type="button" class="cp-choice cp-scenario-choice" data-action="'+actionName+'" data-value="'+e(option.id)+'" aria-pressed="'+
        String(chosen===option.id)+'"><span class="cp-circle" aria-hidden="true">'+(chosen===option.id?"✓":"")+'</span><span>'+e(loc(option.label))+'</span></button>').join("")+'</div>';
  }
  function renderEndingVisual(){
    const ar=state.locale==="ar",movie=D.filmById[current.filmId];
    return '<div class="cp-visual-heading"><h2 class="cp-question-title">'+e(loc(current.prompt))+'</h2></div>'+
      '<figure class="cp-rating-frame"><img '+profileImage(current.still,adaptiveState()?'(max-width: 680px) 94vw, 740px':'(max-width: 680px) 94vw, 940px',adaptiveState()?768:960)+' alt="'+e(movie.title)+'" decoding="async" fetchpriority="high">'+
      '<figcaption><div><strong lang="en" dir="ltr">'+e(movie.title)+'</strong><small>'+movie.year+'</small></div>'+
      '<button type="button" class="cp-text-button" data-action="film-unseen" data-film="'+e(movie.id)+'">'+e(t("unseen"))+'</button></figcaption></figure>'+
      '<div class="cp-rating-visual" role="group" aria-label="'+e(loc(current.prompt))+'"><div class="cp-rating-steps">'+
      [1,2,3,4,5].map(n=>'<button type="button" class="cp-rating-step" data-action="rating" data-value="'+n+
        '" aria-label="'+e(C.ratingNames[state.locale][n-1])+'" aria-pressed="'+String(draft.rating===n)+'"><span class="cp-rating-dot"></span><span>'+n+'</span></button>').join("")+
      '</div><div class="cp-rating-endpoints"><span>'+e(ar?'غير راضٍ':'Dissatisfied')+'</span><span>'+e(ar?'راضٍ جداً':'Very satisfied')+'</span></div></div>';
  }

  function renderAlternative() {
    let hint="";
    if(current.filmId) {
      const film=D.filmById[current.filmId];
      hint=filmContext(film,false,true)+reasonSet(film.id);
    }
    return hint+'<div class="cp-alternative-label"><span class="cp-eyebrow">'+e(t("alternativeTitle"))+
      '</span><p class="cp-small">'+e(t("alternativeHint"))+'</p></div>'+
      '<h2 class="cp-question-title">'+e(loc(current.alternative.prompt))+'</h2>'+
      '<p class="cp-small">'+e(t("selectHint"))+'</p>'+renderChoiceOptions(current,"alternative")+
      '<div class="cp-alternatives">'+action(current.kind==="films"?"watched-mode":"film-watched",
        current.kind==="films"?t("returnFilms"):t("returnFilm"),"cp-button-outline",
        current.filmId?'data-film="'+e(current.filmId)+'"':"")+'</div>';
  }

  function renderActualQuestion() {
    const film=current.filmId?D.filmById[current.filmId]:null;
    const cue=current.frameFilm?D.filmById[current.frameFilm]:null;
    let html=film?filmContext(film,true):cue?'<figure class="cp-question-cue"><img '+profileImage(cue.still,'(max-width: 680px) 92vw, 640px',640)+' alt="" decoding="async"><figcaption><span lang="en">'+e(cue.title)+' · '+cue.year+'</span><span>'+e(state.locale==='ar'?'كادر للتأمل فقط':'Visual cue · no viewing required')+'</span></figcaption></figure>':"";
    if(current.kind==="ending"){
      html+='<h2 class="cp-question-title">'+e(t("ratingEnding"))+'</h2><p class="cp-small">'+e(t("endingHint"))+'</p>'+
        renderRating(t("ratingEnding"),false)+'<div class="cp-feelings"><h3>'+e(t("feeling"))+'</h3><div class="cp-reason-set">'+
        C.feelings.map(item=>'<button type="button" class="cp-chip" data-action="feeling" data-value="'+item.id+
          '" aria-pressed="'+String(draft.feeling===item.id)+'">'+e(loc(item.label))+'</button>').join("")+'</div></div>'+
        (current.options.length?'<h3 class="cp-subheading">'+e(loc(current.prompt))+'</h3><p class="cp-small">'+e(t("reasonOptional"))+'</p>'+
        renderChoiceOptions(current,"actual"):"");
    } else {
      html+='<h2 class="cp-question-title">'+e(loc(current.prompt))+'</h2><p class="cp-small">'+e(state.locale==="ar"?"اختر الأقرب لتجربتك مع هذا المشهد، أو تخطّ إذا لم تشاهد الفيلم.":"Choose the response closest to your experience of this scene, or skip if you haven't seen it.")+'</p>'+
        renderChoiceOptions(current,draft.mode);
      if(current.rating)html+=renderRating(t("ratingCharacter"));
    }
    return html;
  }

  function renderQuestion(keepScroll=false) {
    if (!current || current.id!==activeSlot().id || !draft) initDraft();
    normalizeDraft();
    const y=keepScroll?window.scrollY:0;
    const percent=Math.round((state.index/state.limit)*100);
    const stage=stageLabel(current);
    const content=current.kind==="visual"?renderVisualQuestion():current.kind==="scenario"?scenarioChoices(current,draft.choice):
      ["ending","satisfaction"].includes(current.kind)?renderEndingVisual():"";
    root.innerHTML='<section class="cp-wrap cp-quiz"><div class="cp-progress-row"><span>'+e(stage)+'</span><span>'+
      e(t("progress"))+' '+(state.index+1)+' '+e(t("of"))+' '+state.limit+'</span></div>'+
      '<div class="cp-progress-track" role="progressbar" aria-valuenow="'+percent+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+percent+'%"></span></div>'+
      '<div class="cp-question cp-visual-question">'+content+'</div>'+adaptiveQuestionTools()+'<div class="cp-question-footer"><div>'+
      action("back",t("back"),"cp-button-outline",state.index===0?"disabled":"")+'</div><div>'+
      action("skip",t("skip"),"cp-button-quiet")+
      action("next",nextLabel(),"cp-button-primary",canContinue()?"":"disabled")+
      '</div></div></section>';
    settleStage('profile:'+current.id+(adaptiveState()?':'+draft.form:''), keepScroll);
    if(keepScroll)window.scrollTo({top:y,behavior:"instant"});
    if(!keepScroll)warmNextArtwork();
  }

  function nextLabel(){
    return state.index===state.limit-1?t("finish"):t("next");
  }
  function adaptiveQuestionTools(){
    if(!adaptiveState()||current.purpose==="rating")return "";
    const ar=state.locale==="ar",visualCoin=current.purpose==="coin"&&current.kind==="visual";
    const options=visualCoin?C.orderedOptions(current,"visual",state.seed):[];
    const single=options.length>0&&new Set(options.map(o=>o.filmId)).size===1;
    const only=option=>'<button type="button" class="cp-text-button" data-action="unfamiliar-only" data-film="'+e(option.filmId)+'">'+
      e(ar?"شاهدت "+D.filmById[option.filmId].title+" فقط":"Watched "+D.filmById[option.filmId].title+" only")+'</button>';
    return '<div class="cp-question-tools">'+(visualCoin&&!draft.unfamiliar?'<button class="cp-text-button" type="button" data-action="swap-unfamiliar">'+
      e(single?(ar?"لم تشاهد الفيلم؟ اختر بديلًا":"Haven't seen it? Change film"):(ar?"لم تشاهد أحد الفيلمين؟ اختر بديلًا":"Unfamiliar? Change films"))+'</button>':'')+
      '<button class="cp-text-button" type="button" data-action="neutral">'+e(ar?"لا فرق واضح":"No clear difference")+'</button></div>'+
      (visualCoin&&draft.unfamiliar?'<div class="cp-familiarity-options" role="group" aria-label="'+e(ar?"معرفتك بالفيلمين":"Film familiarity")+'">'+
      '<p class="cp-small">'+e(single?(ar?"هل شاهدت هذا الفيلم؟":"Have you watched this film?"):(ar?"أيّهما شاهدت؟":"Which have you watched?"))+'</p>'+(single?"":options.map(only).join(""))+
      '<button class="cp-text-button" type="button" data-action="unfamiliar-none">'+e(single?(ar?"لم أشاهد الفيلم":"I haven't watched it"):(ar?"لم أشاهد أياً منهما":"Neither"))+'</button>'+
      '<button class="cp-text-button" type="button" data-action="unfamiliar-recall">'+e(ar?"لا أتذكّر المشاهد جيدًا":"I don’t recall the scenes")+'</button>'+
      '<button class="cp-text-button" type="button" data-action="unfamiliar-cancel">'+e(ar?"إلغاء":"Cancel")+'</button></div>':'');
  }
  function switchQuestionForm(){
    const form=D.adaptive.selectForm(activeSlot(),state,(draft.form??0)+1);
    if(form<0){commitAnswer(true);return;}
    (state.pendingForms??={})[current.id]=form;
    current=C.formForAnswer(activeSlot(),{form});
    draft={mode:current.kind==="scenario"?"text":current.purpose==="rating"?"actual":"visual",form,choice:"",rating:null,considered:[]};
    persist();renderQuestion();goTop();
  }

  function resetMode(mode){
    draft.mode=mode; draft.choice=""; draft.rating=null; draft.feeling=""; draft.considered=[];
  }

  function commitAnswer(skip=false,neutral=false) {
    if(adaptiveState()){
      const form=draft.form??0;
      if(skip||neutral)state.answers[current.id]={form,mode:skip?"skip":"neutral",done:true};
      else {
        if(!canContinue())return;
        if(current.purpose==="rating"){
          state.familiarity[current.filmId]="seen";
          state.answers[current.id]={form,mode:"actual",rating:draft.rating,watched:true,done:true};
        }else{
          const answer={form,mode:draft.mode,choice:draft.choice,considered:current.options.map(option=>option.id),done:true};
          if(current.purpose==="coin"&&current.kind==="visual"){
            answer.confirmed=true;
            answer.recalled=[...new Set(current.options.map(option=>option.filmId))];
            answer.recalled.forEach(id=>state.familiarity[id]="seen");
          }
          state.answers[current.id]=answer;
        }
      }
      if(state.pendingForms)delete state.pendingForms[current.id];
    }
    else if(skip) state.answers[current.id]={mode:"skip",done:true};
    else {
      if(!canContinue()) return;
      if(current.filmId) state.familiarity[current.filmId]="seen";
      if(current.kind==="visual"){
        draft.considered=current.options.map(option=>option.id);
        draft.confirmed=Boolean(current.coin);
        if(current.coin) current.options.forEach(option=>state.familiarity[option.filmId]="seen");
      } else if(current.kind==="films" && draft.mode==="compare"){
        draft.considered=knownOptions(current).map(option=>option.id);
        draft.considered.forEach(id=>state.familiarity[id]="seen");
      } else if(current.kind==="films" && draft.mode==="single") {
        state.familiarity[draft.choice]="seen";
        draft.considered=[draft.choice];
      } else if(current.kind==="films" && draft.mode==="image"){
        draft.considered=current.options.map(option=>option.id);
      } else if(current.kind==="films" && draft.mode==="synopsis"){
        draft.considered=current.options.map(option=>option.id);
        if(C.isUnseen(state.familiarity[draft.choice]) && state.familiarity[draft.choice]!=="not-interested")
          state.familiarity[draft.choice]="interested";
      }
      state.answers[current.id]={...draft,done:true};
    }
    if(state.index>=state.limit-1){
      state.route="result"; current=null; draft=null;
    } else {
      state.index++; current=null; draft=null;
    }
    persist();render();goTop();
  }

  function pole(title, left, right, info) {
    const score=info.count?info.percent:50;
    return '<div><div class="cp-pole-label" dir="ltr"><strong class="'+(info.clear&&score>50?'cp-pole-lead':'')+'">'+left+' <span>'+(info.count?score+"%":"—")+
      '</span></strong><strong class="'+(info.clear&&score<50?'cp-pole-lead':'')+'"><span>'+(info.count?(100-score)+"%":"—")+'</span> '+right+'</strong></div>'+
      '<div class="cp-pole-bar" dir="ltr" aria-label="'+e(title)+'"><span style="width:'+score+'%"></span></div></div>';
  }
  const coins=()=>C.coinLabels(state.locale);
  function disclosure(label,body,meta="",className=""){
    return '<details class="cp-result-disclosure '+className+'"><summary><span>'+e(label)+'</span>'+(meta?'<small>'+e(meta)+'</small>':'')+'</summary><div class="cp-disclosure-body">'+body+'</div></details>';
  }
  function coinEvidence(){
    const ar=state.locale==="ar";
    const note=adaptiveState()?(ar?"لا يُرجَّح اتجاه من إجابة واحدة. نبحث عن تكرار عبر مفاضلات وسياقات مختلفة، ونبقي الصيغ النصية والسينمائية ظاهرة على حدة. النسب مؤشرات توازن، وليست احتمالات معايرة.":"No single answer settles a contrast. Direction relies on repeated evidence across choices and contexts. Film and written sources are reported separately. Percentages are balance indices, not calibrated probabilities."):t("balanceNote");
    const status={repeated:ar?"أدلة سينمائية متكررة":"Repeated film evidence",provisional:ar?"اتجاه أولي":"Provisional direction",open:ar?"غير حاسم":"Inconclusive",insufficient:ar?"أدلة غير كافية":"Insufficient evidence"};
    return disclosure(ar?"الأدلة وطريقة القراءة":"Evidence & balance",'<p class="cp-small">'+e(note)+'</p>'+
      coins().map(([axis,left,right])=>{
        const info=result.balance[axis];
        const details=adaptiveState()?[info.sources.film.count+' '+(ar?"سينمائي":"film"),info.sources.text.count+' '+(ar?"نصي":"written"),info.neutral+' '+(ar?"محايد":"neutral"),info.skipped+' '+(ar?"تخطّي":"skipped")].join(' · '):"";
        return '<section><h3>'+left+' / '+right+'</h3><p class="cp-small">'+e(adaptiveState()?status[info.status]:info.clear?(ar?"اتجاه متكرر":"Repeated lead"):info.count?(ar?"غير حاسم":"Inconclusive"):t("noEvidence"))+' · '+info.pairs+' '+e(ar?"مفاضلات":"comparisons")+' · '+info.positive+' / '+info.negative+
          '</p>'+(details?'<p class="cp-small cp-evidence-sources">'+e(details)+(info.sourceConflict?' · '+e(ar?"اختلف الاتجاه بين الصيغتين":"Directions differ by form"):'')+'</p>':'')+
          (info.evidence.length?'<div class="cp-evidence-list">'+info.evidence.map(item=>{
            const film=D.filmById[item.filmId];
            if(item.mode==="text")return '<article class="cp-text-evidence"><div><strong>'+e(ar?"موقف موازٍ":"Parallel story")+'</strong><small>'+e(item.side>0?left:right)+'</small><p>'+e(loc(item.choice))+' · '+e(ar?"مقابل":"versus")+' '+e((item.compared||[]).map(o=>loc(o.label)).join(" / "))+'</p></div></article>';
            if(!film)return '';
            const opposing=(item.compared||[]).map(o=>adaptiveState()?(o.film&&o.film!==item.film?o.film+" — ":"")+loc(o.label):o.film).join(" / ");
            return '<article>'+filmFileLink(film,'<img '+profileImage(film.poster,'80px',176)+' alt="" loading="lazy">','cp-link-art')+'<div><strong lang="en">'+filmFileLink(film,e(item.film))+'</strong><small>'+e(item.side>0?left:right)+'</small><p>'+e(loc(item.choice))+' · '+e(ar?'مقابل':'versus')+' '+e(opposing)+'</p></div></article>';
          }).join("")+'</div>':'<p class="cp-small">'+e(t("noEvidence"))+'</p>')+'</section>';
      }).join(""),"","cp-coin-evidence");
  }
  function animalPanel(){
    const ar=state.locale==="ar";
    return '<section class="cp-panel cp-animal-panel"><div class="cp-panel-head"><h2 class="cp-subheading">'+e(ar?"الإيقاع · Animals":"The Rhythm · Animals")+'</h2><span class="cp-subtle-label">OPS</span></div>'+
      '<div class="cp-animal-rank">'+result.animalRank.map(item=>{
        const info=C.animalInfo[item.name],active=result.animal===item.name;
        return '<div class="cp-animal-item '+(active?"cp-animal-active":"")+'"><div><strong>'+e(item.name)+'</strong><small dir="ltr">'+e(info.pair)+'</small>'+
          (active?'<span class="cp-animal-badge">Savior</span>':'')+'</div><span class="cp-animal-score">'+(result.animalEvidence?item.score+"%":"—")+'</span>'+
          '<div class="cp-rank-track"><span style="width:'+(result.animalEvidence?item.score:0)+'%"></span></div></div>';
      }).join("")+'</div>'+disclosure(ar?"عن الإيقاع":"About the rhythm",'<p class="cp-small">'+e(ar?"ترجيح مشتق من تقاطع المحاور المعرفية (Coins)؛ لا يشخّص ترتيب Animals الكامل.":"The relative combinations are derived from the Coins, not a measured animal stack.")+'</p>')+'</section>';
  }
  function motifPanel(){
    const ar=state.locale==="ar",spectrum=result.motiveSpectrum;
    const featured=new Set(spectrum.featured.map(m=>m.id)), lead=spectrum.lead, wing=spectrum.wing;
    const cards=(items)=>items.map(m=>{
        const value=spectrum.available?m.score:null;
        return '<article class="cp-motif-card '+(featured.has(m.id)?"cp-motif-featured":"")+'"><div class="cp-motif-top"><span class="cp-motif-index">'+m.id+'</span><strong>'+e(loc(m.name))+'</strong><span class="cp-motif-score">'+(value===null?"—":value+"/100")+'</span></div><p>'+e(loc(m.hint))+'</p><div class="cp-rank-track"><span style="width:'+(value??0)+'%"></span></div></article>';
      }).join("");
    return '<section class="cp-result-section cp-motive-section"><div class="cp-motive-heading"><div><p class="cp-eyebrow">ENNEAGRAM</p><h2 class="cp-section-heading">'+e(ar?"طيف الدوافع":"Motive Spectrum")+'</h2></div>'+
      (lead&&wing?'<div class="cp-wing"><small>'+e(ar?"صدى الجناح":"Wing echo")+'</small><strong>'+lead.id+'w'+wing.id+'</strong><span>'+e(loc(lead.name)+' · '+loc(wing.name))+'</span></div>':lead?'<div class="cp-wing"><small>'+e(ar?"الجناح غير محسوم":"Wing open")+'</small><strong>'+e(loc(lead.name))+'</strong></div>':'')+'</div>'+
      '<div class="cp-motif-grid">'+cards(spectrum.rows.slice(0,3))+'</div><p class="cp-small cp-motive-caption">'+e(spectrum.available?(ar?"ميول قصصية نسبية؛ ليست نتيجة نمط إنياجرام مؤكدة.":"Story affinities, not a confirmed Enneagram type."):spectrum.independent?(ar?"تحتاج الدوافع إلى مفاضلات قصصية إضافية.":"More independent story choices are needed."):(ar?"تحتاج القراءة إلى مفاضلات إضافية.":"More familiar-film comparisons are needed."))+'</p>'+
      disclosure(ar?"الطيف الكامل":"Full spectrum",'<div class="cp-motif-grid">'+cards(spectrum.rows.slice(3))+'</div><p class="cp-small cp-panel-note">'+e(ar?"صدى الجناح يُستنتج فقط حين تدعم الاختيارات دافعاً مجاوراً لدافع متقدم.":"A wing echo is shown only when the comparisons support a neighboring motive of a leading motive.")+'</p>',"06")+'</section>';
  }
  function rankRows(items) {
    if(!items.length)return '<p class="cp-small">'+e(t("noEvidence"))+'</p>';
    return '<div class="cp-ranks">'+items.map(item=>'<div class="cp-rank-row"><div><span>'+e(tagLabel(item.tag))+
      '</span><small>'+item.index+'/100</small></div><div class="cp-rank-track"><span style="width:'+item.index+'%"></span></div></div>').join("")+'</div>';
  }
  function tagGroup(key) {
    const items=result.groupRank[key].slice(0,5);
    return '<section class="cp-taste-group"><h3>'+e(t(key))+'</h3>'+
      (items.length?'<ul class="cp-tag-list">'+items.map(item=>'<li><span>'+e(tagLabel(item.tag))+'</span><strong>'+
      item.index+'/100</strong></li>').join("")+'</ul>':'<p class="cp-small">'+e(t("noEvidence"))+'</p>')+'</section>';
  }
  function recommendationCard(item) {
    const film=item.movie;
    const label=film.title+" "+film.year;
    const links=(D.archiveFilmById?.[film.id]?filmFileLink(film,e(state.locale==='ar'?'بطاقة العمل ↗':'Film file ↗')):"")+'<a target="_blank" rel="noopener noreferrer" href="https://letterboxd.com/search/films/'+encodeURIComponent(label)+
      '/">Letterboxd</a><a target="_blank" rel="noopener noreferrer" href="https://www.themoviedb.org/search?query='+
      encodeURIComponent(label)+'">TMDB</a>';
    const poster=film.poster?filmFileLink(film,'<img '+profileImage(film.poster,'110px',176)+
      ' alt="" loading="lazy" decoding="async">','cp-rec-art cp-link-art'):'';
    return '<article class="cp-rec-card">'+poster+'<div class="cp-rec-copy"><h3 class="cp-film-title" lang="en">'+filmFileLink(film,e(film.title))+'</h3>'+
      '<span class="cp-rec-year">'+e(film.year)+'</span><details class="cp-rec-description"><summary>'+e(state.locale==="ar"?"التفاصيل":"Details")+'</summary><p class="cp-tags">'+
      e((item.priorInterest?[t("matchedInterest")]:[]).concat(item.reasons.map(tagLabel)).join(" · "))+
      '</p><p>'+e(loc(film.description))+
      '</p><div class="cp-rec-links">'+links+'</div><div class="cp-rec-actions">'+
      '<button type="button" class="cp-text-button" data-action="rec-seen" data-film="'+
      e(film.id)+'">'+e(t("recSeen"))+'</button><button type="button" class="cp-text-button" data-action="rec-no" data-film="'+
      e(film.id)+'">'+e(t("recNo"))+'</button></div></details></div></article>';
  }

  function selectionPanel(){
    const films=result.chosenFilms,ar=state.locale==="ar";
    if(!films.length)return "";
    return '<details class="cp-result-disclosure cp-selection-compact"><summary><span>'+e(ar?"اختياراتك السينمائية":"Your film selections")+'</span><div class="cp-selection-strip" aria-hidden="true">'+films.slice(0,5).map(film=>'<img '+profileImage(film.poster,'120px',176)+' alt="" loading="lazy">').join("")+'</div><small>'+films.length+'</small></summary><div class="cp-selected-grid cp-disclosure-body">'+films.map(film=>'<figure><img '+profileImage(film.poster,'120px',176)+' alt="" loading="lazy"><figcaption lang="en">'+e(film.title)+'</figcaption></figure>').join("")+'</div></details>';
  }
  function paletteCards(){
    return '<div class="cp-palette-frames">'+result.affinities.map(item=>{
      const film=item.representative;
      const card=(film?'<img '+profileImage(film.still,'(max-width: 680px) 92vw, 320px',320)+' alt="" loading="lazy" decoding="async">':"")+
        '<div class="cp-palette-copy"><h3>'+e(loc(item.shortName||item.name))+'</h3><p>'+e(item.matches.slice(0,2).map(tagLabel).join(" · "))+'</p>'+(film?'<small lang="en">'+e(film.title)+' · '+e(film.year)+'</small>':"")+'</div>';
      return film?filmFileLink(film,card,'cp-palette-card cp-link-art'):'<article class="cp-palette-card">'+card+'</article>';
    }).join("")+'</div>';
  }

  function counterframeState(){
    if(!state.counterframe)state.counterframe=CF.create();
    return state.counterframe;
  }
  function counterframeQuestion(){
    const cf=counterframeState(),slot=CF.questions[cf.index],answer=cf.answers[slot.id];
    return adaptiveState()?CF.form(slot,{form:Number.isInteger(answer?.form)?answer.form:CF.selectForm(slot,state)}):slot;
  }
  function counterframeMeter(chosen,strength,ar){
    return chosen?'<div class="cp-cf-meter"><p>'+e(ar?"إلى أي مدى يزعجك هذا النوع من الضغط؟":"How strongly does that pressure affect you?")+'</p><div class="cp-rating-steps" role="group" aria-label="'+e(ar?"شدّة الانزعاج":"Intensity of discomfort")+'">'+[1,2,3,4,5].map(n=>'<button type="button" class="cp-rating-step" data-action="cf-strength" data-value="'+n+'" aria-label="'+e((ar?"درجة ":"Intensity ")+n+" / 5")+'" aria-pressed="'+(strength===n)+'"><span class="cp-rating-dot"></span><span>'+n+'</span></button>').join("")+'</div><div class="cp-rating-endpoints"><span>'+e(ar?"خفيف":"Slight")+'</span><span>'+e(ar?"قوي":"Strong")+'</span></div></div>':"";
  }
  function syncCounterframeControls(answer) {
    if(!refinedQuestions || !syncFrameChoices('cf-select',answer.choice))return false;
    let meter=root.querySelector('.cp-cf-meter');
    if(!meter && answer.choice){root.querySelector('.cp-visual-grid').insertAdjacentHTML('afterend',counterframeMeter(answer.choice,answer.strength,state.locale==='ar'));meter=root.querySelector('.cp-cf-meter');}
    if(meter)syncRatingControls('cf-strength',answer.strength);
    root.querySelector('[data-action="cf-next"]').disabled=!(answer.choice&&answer.strength);
    return true;
  }
  function renderCounterframeQuestion(keepScroll=false){
    const y=window.scrollY,ar=state.locale==="ar",cf=counterframeState(),question=counterframeQuestion();
    const answer=cf.answers[question.id]||{};
    const chosen=answer.kind==="choice"?answer.choice:"";
    const strength=chosen?answer.strength:null;
    const percent=Math.round(cf.index/CF.questions.length*100);
    const written=question.kind==="scenario";
    const cinema=adaptiveState()&&question.cinematic;
    const cards=written?"":C.orderedOptions(question,"visual",state.seed).map(option=>{
      const movie=D.filmById[option.filmId],selected=chosen===option.id;
      const meta=cinema?'<div class="cp-visual-meta cp-cinema-answer"><div><strong>'+e(loc(option.label))+'</strong><small class="cp-scene-credit" lang="en" dir="ltr">'+e(movie.title)+' · '+movie.year+'</small></div></div>':
        '<div class="cp-visual-meta"><div><strong lang="en" dir="ltr">'+e(movie.title)+'</strong><span class="cp-visual-caption">'+e(loc(option.label))+'</span></div><small>'+movie.year+'</small></div>';
      return '<button type="button" class="cp-visual-select '+(cinema?'cp-scene-choice ':'')+(selected?'cp-visual-selected':'')+'" data-action="cf-select" data-value="'+e(option.id)+'" aria-pressed="'+selected+'"><div class="cp-visual-art"><img '+profileImage(option.still,'(max-width: 680px) 92vw, 45vw',640)+' alt="" decoding="async" fetchpriority="high" draggable="false"><span class="cp-visual-check" aria-hidden="true">'+(selected?'✓':'')+'</span></div>'+meta+'</button>';
    }).join("");
    const meter=counterframeMeter(chosen,strength,ar);
    const questionBody=written?scenarioChoices(question,chosen,"cf-select"):'<div class="cp-visual-heading"><h2 class="cp-question-title">'+e(loc(question.prompt))+'</h2>'+
      (adaptiveState()?"":'<p class="cp-small">'+e(ar?"تخيّل نفسك داخل الموقفين، واختر نوع الضغط لا الفيلم المفضّل.":"Imagine yourself in both situations. Choose the pressure, not your favourite film.")+'</p>')+
      '</div><div class="cp-visual-grid" role="group" aria-label="'+e(loc(question.prompt))+'">'+cards+'</div>';
    const swap=adaptiveState()&&!written?'<div class="cp-question-tools"><button class="cp-text-button" type="button" data-action="cf-swap">'+e(ar?"لا تتذكّر أحد المشهدين؟ اختر بديلًا":"Unfamiliar? Change films")+'</button></div>':"";
    const complete=cf.index===CF.questions.length-1;
    const next=complete?(ar?"عرض القراءة":"View reading"):t("next");
    root.innerHTML='<section class="cp-wrap cp-quiz cp-cf-quiz"><div class="cp-cf-top"><span class="cp-eyebrow">THE COUNTERFRAME</span>'+action("cf-return",ar?"العودة إلى النتيجة":"Back to profile","cp-button-quiet")+'</div><div class="cp-progress-row"><span>'+e(ar?"قراءة الضغط · اختيارية":"Pressure reading · Optional")+'</span><span>'+(cf.index+1)+' / '+CF.questions.length+'</span></div><div class="cp-progress-track" role="progressbar" aria-valuenow="'+percent+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+percent+'%"></span></div><div class="cp-question cp-visual-question">'+questionBody+meter+'</div>'+swap+'<div class="cp-question-footer cp-cf-footer"><div>'+action("cf-prev",t("back"),"cp-button-outline",cf.index===0?'disabled':'')+'</div><div>'+action("cf-skip",adaptiveState()?t("skip"):(ar?"لا أعرف الموقفين":"Unfamiliar"),"cp-button-quiet")+action("cf-neutral",ar?"لا فرق واضح":"No clear difference","cp-button-quiet")+action("cf-next",next,"cp-button-primary",chosen&&strength?'':'disabled')+'</div></div></section>';
    settleStage('counterframe:'+question.id+':'+(question.form??0), keepScroll);
    if(keepScroll)window.scrollTo({top:y,behavior:"instant"});
    if(!keepScroll)warmNextArtwork();
  }

  function counterframePanel(){
    const ar=state.locale==="ar",cf=counterframeState(),reading=CF.evaluate(cf,result);
    const ready=reading.complete,top=reading.top;
    const art=reading.representative||{filmId:"shutter-island",still:"assets/gallery/2010-2019/shutter-island/17c04a148584.webp"};
    const movie=D.filmById[art.filmId];
    const title=ready?(top?loc(CF.pressures[top.code].name):reading.ranked.length>1?(ar?"أنماط مقاومة متعددة":"Several pressure cues"):(ar?"لم تُحسم القراءة بعد":"Reading still open")):(ar?"ما الذي يثير مقاومتك؟":"What creates resistance?");
    const subtitle=ready?(top?loc(CF.pressures[top.code].hint):reading.ranked.length>1?(ar?"تكرّر أكثر من مؤشر في اختياراتك من دون أن يتقدّم أحدها بوضوح.":"More than one pressure recurred without a single strongest cue."):(ar?"لم يتكرّر أيّ اتجاه بما يكفي عبر المواقف المختلفة.":"No strong direction repeated across enough scenes.")):(ar?"اختر نوع الضغط الذي يصعب عليك تقبّله، بعيدًا عن تفضيلك للفيلم نفسه.":"Explore the pressures you resist, rather than the stories you prefer.")+
      (adaptiveState()?(ar?" تابع إذا كنت تتذكّر الموقفين، وإلّا اختر أفلامًا بديلة.":" Continue if you have seen both and remember the scenes; otherwise change films."):"");
    const relationText={aligned:ar?"اتجاه متوافق، لا تأكيد نهائي":"Same direction · not confirmation",different:ar?"إشارة مختلفة":"Different direction",open:ar?"غير محسوم":"Still open",unavailable:ar?"الوظيفة الأساسية غير محسومة":"Primary function still open"}[reading.relation];
    const mirror=reading.opposite?C.impressionName(reading.opposite,state.locale):"—";
    const mirrorCue=reading.comparison?loc(CF.pressures[reading.comparison.code].name):"—";
    const progress=ready?reading.answered+" / "+CF.questions.length:(reading.visited?reading.visited+" / "+CF.questions.length:CF.questions.length+" "+(ar?"مفاضلة":"comparisons"));
    const evidence=reading.axes.map(axis=>{
      const lead=axis.lead;
      const labels=axis.poles.slice().sort((a,b)=>a.code.localeCompare(b.code)).map(p=>loc(CF.pressures[p.code].name)).join(" / ");
      return '<div class="cp-cf-evidence-row"><div><strong>'+e(lead?loc(CF.pressures[lead.code].name):labels)+'</strong><small>'+e(lead?(adaptiveState()&&lead.provisional?(ar?"إشارة أولية":"Provisional cue"):(ar?"إشارة متكررة":"Repeated cue")):(ar?"غير محسوم":"Open"))+
        (adaptiveState()?' · '+axis.film+' '+e(ar?"سينمائي":"film")+' · '+axis.text+' '+e(ar?"نصي":"written"):'')+'</small></div><span>'+e(lead?lead.count+' / 3 · '+lead.mean.toFixed(1)+'/5':axis.answered+' / 3')+'</span></div>';
    }).join("");
    const selected=CF.questions.filter(q=>cf.answers[q.id]?.done&&cf.answers[q.id].kind==="choice").map(q=>{
      const answer=cf.answers[q.id],option=CF.form(q,answer).options.find(o=>o.id===answer.choice),film=D.filmById[option.filmId];
      if(!film)return '<div class="cp-cf-selected-frame cp-cf-written"><div><strong>'+e(ar?"موقف موازٍ":"Parallel story")+'</strong><small>'+e(loc(option.label))+'</small></div><span>'+answer.strength+'/5</span></div>';
      return '<div class="cp-cf-selected-frame">'+filmFileLink(film,'<img '+profileImage(option.still,'160px',320)+' loading="lazy" alt="">','cp-link-art')+'<div><strong lang="en">'+filmFileLink(film,e(film.title))+'</strong><small>'+e(loc(option.label))+'</small></div><span>'+answer.strength+'/5</span></div>';
    }).join("");
    return '<section class="cp-result-section cp-counterframe" id="cp-counterframe"><div class="cp-cf-head"><div><p class="cp-eyebrow">'+e(ar?"قراءة إضافية":"OPTIONAL READING")+'</p><h2 class="cp-section-heading">The Counterframe</h2></div><span class="cp-cf-count">'+e(progress)+'</span></div><article class="cp-cf-feature"><figure class="cp-cf-art"><img '+profileImage(art.still,'(max-width: 680px) 92vw, 580px',640)+' alt="" loading="lazy"><figcaption lang="en">'+filmFileLink(movie,e(movie.title)+' · '+movie.year)+'</figcaption></figure><div class="cp-cf-copy"><p class="cp-eyebrow">'+e(ready?(ar?"إشارات الضغط":"PRESSURE ECHO"):(ar?"مستوحى من John Beebe":"INSPIRED BY JOHN BEEBE"))+'</p><h3>'+e(title)+'</h3><p class="cp-small">'+e(subtitle)+'</p>'+
      (ready?'<div class="cp-cf-result-meta"><div><small>'+e(ar?"Opposing · افتراض نظري":"Theoretical Opposing")+'</small><strong>'+e(mirror)+'</strong></div><div><small>'+e(ar?"الإشارة في المجال نفسه":"Cue in the same domain")+'</small><strong>'+e(mirrorCue)+'</strong><small>'+e(relationText)+'</small></div></div>':'')+
      '<div class="cp-cf-actions">'+action(ready?"cf-review":"cf-start",ready?(ar?"راجع اختياراتك":"Review comparisons"):reading.visited?(ar?"أكمل القراءة":"Resume reading"):(ar?"ابدأ القراءة":"Begin Counterframe"),"cp-button-outline")+'</div></div></article>'+
      (ready?'<p class="cp-small cp-cf-caveat">'+e(ar?"هذه مؤشرات استكشافية من استجابتك للحكايات، وليست تشخيصًا لنمطك أو قياسًا لسلوكك الفعلي تحت الضغط.":"Exploratory story-response cues, not a diagnosis or an observed stress response.")+'</p>'+disclosure(ar?"إشارات المقاومة":"Pressure cues",evidence)+disclosure(ar?"المشاهد المختارة":"Selected moments",selected||'<p class="cp-small">'+e(t("noEvidence"))+'</p>',String(reading.directional)):"")+
      disclosure(ar?"عن هذه القراءة":"About Counterframe",'<p class="cp-small">'+e(ar?"تستكشف المفاضلات الاثنتا عشرة ضغوطاً قصصية في أربعة مجالات. يحتاج ترجيح اتجاه إلى تكراره في سياقين وبشدّة متوسطة فأكثر؛ التخطّي والتعادل لا يدعمان أي اتجاه. المقابلة مع الوظيفة الخامسة عند بيبي مشتقة من البصمة الأساسية عندما تتضح، وليست قياساً مستقلاً للوظيفة. هذه الإضافة لا تغيّر المحاور المعرفية (Coins) أو الذائقة أو الإنياجرام.":"Twelve comparisons explore dramatic pressures in four domains. A cue needs repeated, moderate-or-strong responses across at least two contexts; skipped and neutral answers support neither side. Beebe’s fifth-position counterpart is a theoretical derivation when the primary function is clear, not a direct measurement of that function. This extension does not alter Coins, taste, Animals or Enneagram.")+'</p><p class="cp-small"><a href="https://www.types-psychologiques.com/wp-content/uploads/2016/06/john_beebe_-_evolving_the_8_function_model.pdf" target="_blank" rel="noopener noreferrer">John Beebe · Evolving the eight-function model</a></p>')+'</section>';
  }

  function returnFromCounterframe(){
    const cf=counterframeState();
    cf.complete=CF.questions.every(question=>CF.validAnswer(question,cf.answers[question.id]));
    state.route="result";persist();render();
    const panel=document.getElementById("cp-counterframe");
    const disclosure=panel?.closest('.cp-portrait-analysis-row');
    if(disclosure)disclosure.open=true;
    panel?.scrollIntoView({block:"start",behavior:"instant"});
  }
  function counterframeAction(name,value){
    const cf=counterframeState(),slot=CF.questions[cf.index],question=counterframeQuestion();
    if(name==="cf-start"||name==="cf-review"){
      if(name==="cf-review")cf.index=0;
      state.route="counterframe";persist();render();goTop();return;
    }
    if(name==="cf-return"){returnFromCounterframe();return;}
    if(state.route!=="counterframe")return;
    if(name==="cf-prev"){
      if(cf.index>0)cf.index--;persist();renderCounterframeQuestion();goTop();return;
    }
    if(name==="cf-swap"&&adaptiveState()){
      const next=CF.selectForm(slot,state,(question.form??0)+1);
      if(next<0)return;
      cf.answers[question.id]={kind:"pending",form:next,done:false};
      cf.complete=false;persist();renderCounterframeQuestion();goTop();return;
    }
    if(name==="cf-select"){
      if(!question.options.some(o=>o.id===value))return;
      const previous=cf.answers[question.id];
      cf.answers[question.id]={kind:"choice",choice:value,strength:previous?.choice===value?previous.strength:null,done:false,
        ...(adaptiveState()?{form:question.form??0}:{})};
      cf.complete=false;persist();if(!syncCounterframeControls(cf.answers[question.id]))renderCounterframeQuestion(true);return;
    }
    if(name==="cf-strength"){
      const answer=cf.answers[question.id],strength=Number(value);
      if(answer?.kind!=="choice"||!Number.isInteger(strength)||strength<1||strength>5)return;
      answer.strength=strength;answer.done=false;cf.complete=false;persist();if(!syncCounterframeControls(answer))renderCounterframeQuestion(true);return;
    }
    if(name==="cf-next"){
      const answer=cf.answers[question.id];
      if(answer?.kind!=="choice")return;
      const committed={...answer,done:true};
      if(adaptiveState()&&question.kind!=="scenario"){
        committed.confirmed=true;
        committed.recalled=question.options.map(o=>o.filmId);
      }
      if(!CF.validAnswer(slot,committed))return;
      if(committed.recalled)committed.recalled.forEach(id=>state.familiarity[id]="seen");
      cf.answers[question.id]=committed;
    }else if(name==="cf-skip"||name==="cf-neutral"){
      cf.answers[question.id]={kind:name==="cf-skip"?"skip":"neutral",done:true,...(adaptiveState()?{form:question.form??0}:{})};
    }else return;
    if(cf.index===CF.questions.length-1){
      const missing=CF.questions.findIndex(q=>!CF.validAnswer(q,cf.answers[q.id]));
      if(missing<0){cf.complete=true;returnFromCounterframe();return;}
      cf.index=missing;
    }else cf.index++;
    persist();renderCounterframeQuestion();goTop();
  }

  function portraitSelection() {
    const ar=state.locale==='ar',films=result.chosenFilms.filter(film=>film.poster);
    if(!films.length)return '';
    const heading=ar?'أفلام شكّلت البصمة':'Films that shaped it';
    return `<section class="cp-portrait-selection" aria-labelledby="cp-portrait-selection-title"><div class="cp-portrait-section-title"><h2 id="cp-portrait-selection-title">${e(heading)}</h2><small>${films.length}</small></div><ul class="cp-portrait-filmstrip" aria-label="${e(heading)}" tabindex="0">${films.map(film=>`<li>${filmFileLink(film,`<img ${profileImage(film.poster,'120px',176)} width="120" height="180" alt="${e(film.title+' · '+film.year)}" loading="lazy" decoding="async">`,'cp-link-art')}</li>`).join('')}</ul></section>`;
  }

  function analysisRow(label,meta,body,classes='') {
    return `<details class="cp-portrait-analysis-row ${classes}"><summary><span>${e(label)}</span>${meta?`<small>${e(meta)}</small>`:''}<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.7 6 4.3 4.3L12.3 6"/></svg></summary><div class="cp-portrait-analysis-body">${body}</div></details>`;
  }

  function renderPortrait({isCore,heading,lens,signature,subtitle,desc,pairDesc,cover,functionStack,matchCards,pairCards,genreRows,reading,examples,watched,unknown,recs,prompt}) {
    const ar=state.locale==='ar',open=ar?'غير محسوم':'Open';
    const spectrum=result.motiveSpectrum;
    const refineCount=adaptiveState()?D.adaptive.refinePlan(state,result).length:0;
    const leadingMotif=spectrum.lead?loc(spectrum.lead.name):'';
    const coverArt=cover?`<figure class="cp-portrait-art"><img ${profileImage(cover.still,'(max-width: 680px) 92vw, 700px',960)} alt="" decoding="async"><figcaption lang="en">${filmFileLink(cover,e(cover.title)+' · '+e(cover.year))}</figcaption></figure>`:'';
    const traits=[
      [ar?'العدسة':'Lens',lens||open],
      [ar?'Savior Animal المحتمل':'Possible Savior Animal',result.animal||open],
      [ar?'الدافع السردي':'Story motive',leadingMotif||open]
    ];
    const directional=Object.values(result.balance).filter(item=>item.clear).length;
    const evidenceHint=adaptiveState()?`<p class="cp-portrait-evidence-hint">${e(ar?`${directional} من 5 محاور لها اتجاه واضح نسبياً${isCore&&!spectrum.coverage?' · قراءة الدوافع تستكمل في العمق.':''}`:`${directional} of 5 contrasts show a direction${isCore&&!spectrum.coverage?' · story motives need the deeper reading.':''}`)}</p>`:'';
    const nextLabel=ar?'توسيع القراءة':'Deepen profile';
    const depthCount=limits().full-limits().core;
    const depthNote=isCore?`<p class="cp-portrait-depth-note">${e(ar?'أدلة إضافية للمحاور الخمسة · Lens · Savior Animal · دوافع Enneagram.':'More evidence for the five Coins · Lens · Savior Animal · Enneagram motives.')}</p>`:'';
    const nextAction=isCore?`<button type="button" class="cp-button cp-button-primary cp-portrait-next" data-action="deepen">${e(nextLabel)}<small dir="ltr">+${depthCount}</small></button>`:
      refineCount?action('refine',(ar?'استكمل المحاور غير المحسومة':'Refine open contrasts')+' (+'+refineCount+')','cp-button-primary'):'';
    const downloadAction=`<button type="button" class="cp-button cp-button-outline cp-portrait-download" data-action="image"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/></svg>${e(ar?'نزّل البورتريه':'Download portrait')}</button>`;
    const portraitTop=`<header class="cp-portrait-hero${cover?' has-art':''}">${coverArt}<div class="cp-portrait-copy"><p class="cp-eyebrow">${e(isCore?(ar?'البصمة السينمائية · أولية':'CINEMA PROFILE · INITIAL READING'):(ar?'البصمة السينمائية':'CINEMA PROFILE'))}</p><p class="cp-portrait-label">${e(ar?'بصمة الأرشيف':'The Archive Signature')}</p><h1 class="cp-portrait-name${!heading&&!lens?' is-open':''}">${e(signature)}</h1>${subtitle?`<p class="cp-portrait-formula">${e(subtitle)}</p>`:''}<p class="cp-portrait-description">${e(heading?desc:lens?pairDesc:desc)}</p><p class="cp-portrait-confidence">${e(t(result.consistency))}</p><div class="cp-portrait-traits">${traits.map(([label,value])=>`<div><small>${e(label)}</small><strong>${e(value)}</strong></div>`).join('')}</div>${evidenceHint}<div class="cp-actions cp-portrait-actions">${nextAction}${downloadAction}${action('review',t('reviewAnswers'),'cp-button-quiet')}</div>${depthNote}</div></header>`;
    const exportPanel=`<div class="cp-feedback" id="cp-image-status" role="status"></div><section id="cp-export" class="cp-export" hidden><img alt="${e(ar?'بطاقة البصمة السينمائية':'Cinema Profile portrait card')}"><div><h3 class="cp-subheading">${e(t('save'))}</h3><p class="cp-small">${e(ar?'بطاقة مرئية مختصرة من بصمتك وأفلام اختياراتك.':'A visual card with your signature and films from your choices.')}</p><a class="cp-button cp-button-primary" download="The-TS-Archive-Cinema-Profile.png">Download PNG</a><button type="button" class="cp-text-button" data-action="close-export">${e(ar?'إغلاق المعاينة':'Close preview')}</button></div></section>`;
    const palette=`<section class="cp-result-section cp-portrait-palette"><h2 class="cp-section-heading">${e(t('taste'))}</h2>${result.affinities.length?paletteCards():`<p class="cp-small">${e(t('noEvidence'))}</p>`}${disclosure(t('reading'),`<div class="cp-reading-text">${reading.length?reading.map(text=>`<p>${e(text)}</p>`).join(''):`<p>${e(t('noEvidence'))}</p>`}</div><h3 class="cp-rank-heading">${e(t('evidence'))}</h3><div class="cp-reading-evidence">${examples.length?examples.map(text=>`<p>${e(text)}</p>`).join(''):`<p>${e(t('noEvidence'))}</p>`}</div>`)}</section>`;
    const close=recs.filter(item=>item.kind==='close'),discoveries=recs.filter(item=>item.kind==='discovery');
    const primary=[...close,...discoveries].slice(0,5);
    const remaining=recs.filter(item=>!primary.includes(item));
    const recommendations=`<section class="cp-result-section cp-portrait-recommendations"><h2 class="cp-section-heading">${e(t('recommendations'))}</h2>${primary.length?`<div class="cp-recommendations cp-portrait-recs" aria-label="${e(t('recommendations'))}">${primary.map(recommendationCard).join('')}</div>${remaining.length?disclosure(t('discovery'),`<p class="cp-small">${e(t('recNote'))}</p><div class="cp-recommendations cp-portrait-recs">${remaining.map(recommendationCard).join('')}</div>`,String(remaining.length)):''}`:`<p class="cp-small">${e(t('noEvidence'))}</p>`}</section>`;
    const coinsBody=`<div class="cp-portrait-coins"><section class="cp-panel"><h3 class="cp-subheading">${e(ar?'توازن الأدلة':'Evidence balance')}</h3><div class="cp-poles">${coins().map(([axis,left,right])=>pole(left+' / '+right,left,right,result.balance[axis])).join('')}</div>${coinEvidence()}</section><section class="cp-panel">${matchCards}${pairCards}</section></div>`;
    const rhythmBody=`<div class="cp-portrait-coins"><section class="cp-panel"><h3 class="cp-subheading">${e(ar?'الوظائف المحتملة':'Possible functions')}</h3>${functionStack}</section>${animalPanel()}</div>`;
    const motifs=spectrum.featured.map(item=>loc(item.name)).join(' · ');
    const tasteBody=`<div class="cp-portrait-coins"><section class="cp-panel"><h3 class="cp-subheading">${e(t('genres'))}</h3>${rankRows(genreRows.slice(0,7))}</section><div><p class="cp-small">${e(t('tasteNote'))}</p><div class="cp-affinities">${result.affinities.map(item=>`<article><h4>${e(loc(item.name))}</h4><p>${e(loc(item.description))}</p></article>`).join('')}</div></div></div><div class="cp-taste-grid">${['themes','style','tone','endings'].map(tagGroup).join('')}</div><div class="cp-exposure"><div><strong>${watched}</strong> ${e(t('viewed'))}</div><div><strong>${unknown}</strong> ${e(t('unviewed'))}</div><div><strong>${result.familiarity.interested.length}</strong> ${e(t('interestedCount'))}</div><div><strong>${result.answered}/${state.limit}</strong> ${e(t('answered'))}</div></div>`;
    const cf=CF.evaluate(counterframeState(),result);
    const cfMeta=cf.complete?(ar?'قراءة مكتملة':'Reading complete'):(ar?'اختياري':'Optional');
    const analysis=`<section class="cp-result-section cp-portrait-analysis"><div class="cp-portrait-section-title"><h2 class="cp-section-heading">${e(ar?'خلف البصمة':'Behind the portrait')}</h2><small>${e(ar?'تفاصيل وأدلة القراءة':'Evidence & full reading')}</small></div>${analysisRow(t('balance'),ar?'٥ محاور':'5 contrasts',coinsBody)}${analysisRow(ar?'الإيقاع · Animals':'The Rhythm · Animals',result.animal||open,rhythmBody)}${analysisRow(ar?'طيف الدوافع · Enneagram':'Motive Spectrum · Enneagram',motifs||open,motifPanel())}${analysisRow(ar?'الذائقة والدوافع السينمائية':'Genres & story motifs','',tasteBody)}${analysisRow('The Counterframe',cfMeta,counterframePanel(),'cp-portrait-counterframe-row')}</section>`;
    const share=`<section class="cp-result-section cp-portrait-share"><h2 class="cp-section-heading">${e(t('share'))}</h2><details class="cp-prompt-details"><summary>${e(t('prompt'))}</summary><p class="cp-small">${e(t('promptHint'))}</p><textarea id="cp-prompt" aria-label="${e(t('prompt'))}" readonly>${e(prompt)}</textarea><div class="cp-actions">${action('copy',t('copy'),'cp-button-primary')}${action('chat',t('chat'),'cp-button-outline')}</div><div class="cp-feedback" id="cp-copy-status" role="status"></div></details><div class="cp-summary-actions">${action('image-full',ar?'نزّل القراءة التفصيلية':'Download full reading','cp-button-quiet')}${action('restart',t('restart'),'cp-button-quiet')}</div>${methodBlock()}</section>`;
    root.innerHTML=`<section class="cp-wrap-wide cp-results cp-portrait-results">${portraitTop}${exportPanel}${portraitSelection()}${palette}${recommendations}${analysis}${share}</section>`;
  }

  function renderResult() {
    result=C.calculate(state);
    const isCore=state.limit===limits().core;
    const heading=C.familyName(result.type,state.locale);
    const desc=result.type?loc(C.familyInfo[result.type]):t("notEnough");
    const pair=result.functionPair;
    const lens=C.lensName(pair,state.locale);
    const pairDesc=pair?loc(C.functionPairs[pair].description):state.locale==='ar'?"لا يُحسم نوع العدسة حين تتوازن الاختيارات.":"The lens stays open when the choices are balanced.";
    const pairCards='<h3 class="cp-rank-heading">'+e(state.locale==="ar"?"العدسات":"Lenses")+'</h3><div class="cp-type-rank cp-function-rank">'+result.functionRank.map(item=>'<div class="'+(pair===item.type?'cp-leading':'')+'"><strong>'+e(C.lensName(item.type,state.locale))+'</strong><span>'+(result.functionEvidence.complete?item.score+'%':'—')+'</span></div>').join('')+'</div>';
    const cover=result.chosenFilms.find(film=>film.still);
    const reading=C.readings(result,state.locale);
    const examples=C.evidenceLines(result,state.locale);
    const matchCards='<h3 class="cp-rank-heading">'+e(state.locale==="ar"?"البصمات":"Signatures")+'</h3><div class="cp-type-rank cp-function-rank">'+result.rank.map(item=>'<div class="'+(result.type===item.type?'cp-leading':'')+'"><strong>'+e(C.familyName(item.type,state.locale))+
      '</strong><span>'+(result.balance.od.pairs>=3&&result.balance.observer.pairs>=3&&result.balance.decider.pairs>=3?item.score+"%":"—")+'</span></div>').join("")+'</div>';
    const ar=state.locale==="ar";
    const descriptor=items=>items.map(fn=>'<span>'+e(C.impressionName(fn,state.locale))+'</span>').join("")||"—";
    const functionStack='<div class="cp-function-stack"><div><small>'+e(ar?"Saviors المحتملة":"Possible Saviors")+'</small><strong>'+descriptor(result.saviors)+'</strong></div><div><small>'+e(ar?"Demons المقابلة":"Opposing Demons")+'</small><strong>'+descriptor(result.demons)+'</strong></div></div>'+
      '<div class="cp-animal-hero"><div><small>'+e(ar?"Savior Animal المحتمل":"Possible Savior Animal")+'</small><strong>'+e(result.animal||(ar?"غير محسوم":"Open"))+'</strong></div>'+
      (result.animal?'<span dir="ltr">'+e(C.animalInfo[result.animal].pair)+'</span>':'')+'</div>'+
      disclosure(ar?"عن البصمة":"About this reading",'<p class="cp-small">'+e(pairDesc)+'</p>'+
      (result.animal?'<p class="cp-small">'+e(loc(C.animalInfo[result.animal].description))+'</p>':'')+
      '<p class="cp-small">'+e(ar?"الوظائف المقابلة والـAnimal مشتقة من التركيبة النظريّة. لا يُفترض ترتيب كامل.":"Opposing functions and the Animal are theoretical derivatives. No full stack is assumed.")+'</p>');
    const openLabel=ar?"كادر مفتوح":"Open Frame";
    const signature=heading||lens||openLabel;
    const subtitle=[heading&&lens?lens:"",result.formula].filter(Boolean).join(" · ");
    const watched=result.familiarity.seen.length;
    const unknown=result.familiarity.unseen.length+result.familiarity.interested.length+
      result.familiarity["not-interested"].length+result.familiarity["no-opportunity"].length;
    const prompt=C.buildPrompt(result,state,state.locale);
    const recs=result.recommendations;
    const genreRows=[...result.groupRank.genres].sort((a,b)=>b.index-a.index);
    renderPortrait({isCore,heading,lens,signature,subtitle,desc,pairDesc,cover,functionStack,matchCards,pairCards,genreRows,reading,examples,watched,unknown,recs,prompt});
  }

  async function copyPrompt() {
    const field=document.getElementById("cp-prompt");
    const status=document.getElementById("cp-copy-status");
    if(!field)return;
    let success=false;
    try {
      await navigator.clipboard.writeText(field.value); success=true;
    } catch {
      field.focus();field.select();
      try {success=document.execCommand("copy");} catch {}
    }
    if(status)status.textContent=t(success?"copied":"copyManual");
  }

  async function savePortraitImage() {
    const currentResult=result,locale=state.locale,rtl=locale==='ar';
    const status=document.getElementById('cp-image-status');
    const button=root.querySelector('[data-action="image"]');
    if(button?.disabled)return;
    if(button)button.disabled=true;
    if(status)status.textContent=rtl?'إعداد البورتريه…':'Preparing your portrait…';
    try {
      try {await document.fonts.ready;}catch{}
      const films=currentResult.chosenFilms.filter(film=>film.poster).slice(0,4);
      const images=await Promise.all(films.map(movie=>new Promise(resolve=>{
        const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>resolve(null);
        image.src=artwork(movie.poster);
      })));
      // Rendering is performed locally from the user's actual chosen films.
      // Keep the detailed score card available as a separate export.
      if(result!==currentResult||state.locale!==locale||!document.getElementById('cp-export'))return;
      const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
      const W=1080,H=1350,pad=72,right=W-pad,width=W-2*pad,bg='#1b1917',ink='#f1ebe0',accent='#c4a787',muted='#bbafa1',line='#4a4139';
      const wash=ctx.createLinearGradient(0,0,W,H);wash.addColorStop(0,'#24201a');wash.addColorStop(.48,bg);wash.addColorStop(1,'#151311');
      ctx.fillStyle=wash;ctx.fillRect(0,0,W,H);
      ctx.strokeStyle=line;ctx.lineWidth=2;ctx.strokeRect(28,28,W-56,H-56);
      const font=(size,weight,family)=>`${weight} ${size}px "${family}", ${family==='Instrument Serif'?'Georgia, serif':family==='Cairo'?'"DM Sans", Arial, sans-serif':'Arial, sans-serif'}`;
      const native=rtl?'Cairo':'DM Sans',display=rtl?'Cairo':'Instrument Serif';
      const direction=rtl?'rtl':'ltr',start=rtl?right:pad;
      function draw(value,x,y,size,color=ink,weight=400,family=native,align=rtl?'right':'left',dir=direction){ctx.font=font(size,weight,family);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='top';ctx.direction=dir;ctx.fillText(String(value),x,y);}
      function wrapped(value,max,size,weight,family,maxLines=2){ctx.font=font(size,weight,family);const words=String(value||'').split(/\s+/).filter(Boolean),lines=[];let current='';for(const word of words){const next=current?current+' '+word:word;if(current&&ctx.measureText(next).width>max){lines.push(current);current=word;}else current=next;}if(current)lines.push(current);const out=lines.slice(0,maxLines);return out.map((row,i)=>{if((lines.length>maxLines&&i===maxLines-1)||ctx.measureText(row).width>max){while(row&&ctx.measureText(row+'…').width>max)row=row.slice(0,-1);return row+'…';}return row;});}
      function rule(y){ctx.strokeStyle=line;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(right,y);ctx.stroke();}
      draw('THE T.S. ARCHIVE',pad,63,37,ink,700,'Barlow Condensed','left','ltr');
      draw('CINEMA PROFILE',right,70,24,accent,500,'DM Sans','right','ltr');rule(126);
      draw(rtl?'بصمة الأرشيف':'THE ARCHIVE SIGNATURE',start,165,27,accent,600,native);
      const heading=C.familyName(currentResult.type,locale),lens=C.lensName(currentResult.functionPair,locale),name=heading||lens||(rtl?'كادر مفتوح':'Open Frame');
      const nameSize=rtl?72:110;
      const title=wrapped(name,width,nameSize,rtl?700:400,display,2);
      title.forEach((row,i)=>draw(row,start,210+i*(nameSize+8),nameSize,ink,rtl?700:400,display));
      let y=210+title.length*(nameSize+8)+19;
      const formula=[heading&&lens?lens:'',currentResult.formula].filter(Boolean).join(' · ');
      if(formula){draw(formula,start,y,33,accent,500,native);y+=47;}
      const description=heading?C.local(C.familyInfo[currentResult.type],locale):lens?C.local(C.functionPairs[currentResult.functionPair].description,locale):(rtl?'لا يوجد ترجيح واضح بعد.':'There is not enough evidence for a distinct reading yet.');
      const desc=wrapped(description,width,30,400,native,2);desc.forEach((row,i)=>draw(row,start,y+i*41,30,muted,400,native));
      y+=desc.length*41+34;rule(y);y+=27;
      const motive=currentResult.motiveSpectrum.lead;
      const traits=[[rtl?'العدسة':'Lens',lens||(rtl?'غير محسوم':'Open')],[rtl?'Savior Animal المحتمل':'Possible Savior Animal',currentResult.animal||(rtl?'غير محسوم':'Open')],[rtl?'الدافع السردي':'Story motive',motive?C.local(motive.name,locale):(rtl?'غير محسوم':'Open')]];
      const col=width/3;
      traits.forEach(([label,value],i)=>{
        const x=rtl?right-i*col:pad+i*col;
        wrapped(label,col-15,22,400,native,1).forEach(row=>draw(row,x,y,22,muted,400,native));
        wrapped(value,col-15,36,600,native,1).forEach(row=>draw(row,x,y+36,36,accent,600,native));
      });
      y+=105;rule(y);y+=30;
      draw(rtl?'أفلام من اختياراتك':'FILMS FROM YOUR CHOICES',start,y,25,accent,600,native);y+=48;
      if(!films.length)draw(rtl?'لا توجد اختيارات كافية بعد.':'No films selected yet.',start,y,30,muted,400,native);
      const count=films.length,posterW=Math.min(210,(width-18*Math.max(0,count-1))/Math.max(1,count)),posterH=Math.min(310,Math.max(150,H-y-225)),gap=18;
      const band=(posterW*count+gap*Math.max(0,count-1)),left=(W-band)/2;
      films.forEach((film,i)=>{
        const column=rtl?count-1-i:i,x=left+column*(posterW+gap),image=images[i];
        ctx.fillStyle='#100f0f';ctx.fillRect(x-1,y-1,posterW+2,posterH+2);
        if(image){const scale=Math.min(posterW/image.naturalWidth,posterH/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,x+(posterW-w)/2,y+(posterH-h)/2,w,h);}
        const caption=wrapped(film.title,posterW,23,600,'DM Sans',2);
        caption.forEach((row,j)=>draw(row,x+posterW/2,y+posterH+13+j*30,23,ink,600,'DM Sans','center','ltr'));
        draw(film.year,x+posterW/2,y+posterH+14+caption.length*30,20,muted,400,'DM Sans','center','ltr');
      });
      rule(H-112);
      draw(rtl?'قراءة استكشافية للذائقة السينمائية':'An exploratory reading of cinematic taste',start,H-86,23,muted,400,native);
      const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Image encoding failed')),'image/png'));
      const panel=document.getElementById('cp-export');if(!panel)return;
      if(panel.dataset.url)URL.revokeObjectURL(panel.dataset.url);
      const url=URL.createObjectURL(blob);panel.dataset.url=url;panel.querySelector('img').src=url;panel.querySelector('a').href=url;panel.hidden=false;
      if(status)status.textContent=rtl?'البورتريه جاهز للتنزيل.':'Your portrait is ready to download.';
      panel.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    }catch(error){if(status)status.textContent=rtl?'تعذّر إنشاء البطاقة. جرّب مرة أخرى.':'The portrait could not be created. Try again.';}
    finally{if(button?.isConnected)button.disabled=false;}
  }

  async function saveImage(fullReading=false) {
    if(!fullReading)return savePortraitImage();
    const canvas=document.createElement("canvas");
    canvas.width=1080;canvas.height=2150;
    const ctx=canvas.getContext("2d");
    if(!ctx)return;
    const rtl=state.locale==="ar";
    const bg="#1b1917", ink="#f2e9dc", accent="#c4a787", muted="#b4aaa0", line="#3d3730";
    ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#141210";ctx.fillRect(45,45,990,canvas.height-90);
    const left=86,right=994, width=908;
    let y=104;
    const setText=(size,weight=400,color=ink,align=rtl?"right":"left")=>{
      ctx.font=weight+" "+size+"px "+(rtl?'"Cairo", "DM Sans", Arial, sans-serif':'Arial, sans-serif');ctx.fillStyle=color;
      ctx.textAlign=align;ctx.textBaseline="top";ctx.direction=rtl?"rtl":"ltr";
    };
    const text=(value,size,weight=400,color=ink)=>{
      setText(size,weight,color);
      const words=String(value).split(/\s+/);
      let row="";
      for(const word of words){
        const next=row?row+" "+word:word;
        if(row&&ctx.measureText(next).width>width){ ctx.fillText(row,rtl?right:left,y); y+=size*1.32; row=word; }
        else row=next;
      }
      if(row){ctx.fillText(row,rtl?right:left,y);y+=size*1.32;}
    };
    function separator(){ctx.fillStyle=line;ctx.fillRect(left,y,width,2);y+=30;}
    text("THE T.S. ARCHIVE",24,700,accent);y+=14;
    text(t("fullResult"),44,700);y+=12;
    const exportType=[C.familyName(result.type,state.locale),C.lensName(result.functionPair,state.locale)].filter(Boolean).join(" · ");
    text(exportType||(rtl?"كادر مفتوح":"Open Frame"),exportType?60:50,700);y+=2;
    if(result.formula)text(result.formula,27,500,accent);
    text((rtl?"Saviors المحتملة":"Possible Saviors")+": "+(result.saviors.map(fn=>C.impressionName(fn,state.locale)).join(" / ")||"—"),27,500,accent);
    text((rtl?"Demons المقابلة":"Opposing Demons")+": "+(result.demons.map(fn=>C.impressionName(fn,state.locale)).join(" / ")||"—"),27,400,muted);
    text("Savior Animal · "+(result.animal||(rtl?"غير محسوم":"Open")),30,600,accent);y+=8;
    text(t(result.consistency),25,400,muted);y+=17;separator();
    for(const [axis,a,b] of coins()){
      const percent=result.balance[axis].percent;
      const hasEvidence=result.balance[axis].count>0;
      ctx.direction="ltr";ctx.font=rtl?'600 25px "Cairo", "DM Sans", Arial':'600 25px Arial';ctx.fillStyle=ink;ctx.textAlign="left";ctx.fillText(a+" "+(hasEvidence?percent+"%":"—"),left,y);
      ctx.textAlign="right";ctx.fillText((hasEvidence?(100-percent)+"%":"—")+" "+b,right,y);
      y+=40;ctx.fillStyle="#58626a";ctx.fillRect(left,y,width,10);ctx.fillStyle=accent;ctx.fillRect(left,y,width*percent/100,10);y+=33;
    }
    y+=12;separator();
    text(rtl?"طيف الدوافع · Enneagram":"Motive Spectrum · Enneagram",27,700,accent);
    const featured=result.motiveSpectrum.featured.map(m=>loc(m.name)+" "+m.score+"/100").join(" · ");
    text(featured||(rtl?"لم يبرز دافع واضح":"No distinct story motif yet"),28,400);y+=10;
    if(result.motiveSpectrum.lead&&result.motiveSpectrum.wing){
      const {lead,wing}=result.motiveSpectrum;
      text((rtl?"صدى الجناح":"Wing echo")+" · "+lead.id+"w"+wing.id+" · "+loc(lead.name)+" / "+loc(wing.name),25,500,accent);y+=3;
    }
    const counter=CF.evaluate(state.counterframe,result);
    if(counter.complete&&counter.ranked.length){
      text("Counterframe · "+(counter.top?loc(CF.pressures[counter.top.code].name):(rtl?"إشارات متعدّدة":"Several cues")),25,500,accent);
      y+=4;
    }
    const g=result.groupRank.genres.slice(0,4).map(item=>tagLabel(item.tag)).join(" · ");
    const themes=result.groupRank.themes.slice(0,4).map(item=>tagLabel(item.tag)).join(" · ");
    const styles=result.groupRank.style.slice(0,3).map(item=>tagLabel(item.tag)).join(" · ");
    text(t("genres"),27,700,accent); text(g||t("noEvidence"),29,400); y+=8;
    text(t("themes"),27,700,accent); text(themes||t("noEvidence"),29,400); y+=8;
    text(t("style"),27,700,accent); text(styles||t("noEvidence"),29,400);y+=10;separator();
    text(rtl?"اختياراتك السينمائية":"Selected films",30,700,accent);y+=5;
    const recommendations=result.chosenFilms.filter(movie=>movie.poster).slice(0,3).map(movie=>({movie}));
    const footer=t("methodShort");
    const posterImages=await Promise.all(recommendations.map(({movie})=>{
      if(!movie.poster)return Promise.resolve(null);
      return new Promise(resolve=>{
        const image=new Image();
        image.onload=()=>resolve(image);
        image.onerror=()=>resolve(null);
        image.src=artwork(movie.poster);
      });
    }));
    const columnWidth=(width-40)/3;
    const posterHeight=Math.max(145,Math.min(390,canvas.height-180-y));
    const top=y;
    if(!recommendations.length)text(t("noEvidence"),27,400,muted);
    recommendations.forEach(({movie},index)=>{
      const x=left+index*(columnWidth+20);
      const poster=posterImages[index];
      ctx.fillStyle=bg;
      ctx.fillRect(x,top,columnWidth,posterHeight);
      if(poster){
        const scale=Math.min(columnWidth/poster.naturalWidth,posterHeight/poster.naturalHeight);
        const w=poster.naturalWidth*scale,h=poster.naturalHeight*scale;
        ctx.drawImage(poster,x+(columnWidth-w)/2,top+(posterHeight-h)/2,w,h);
      }
      ctx.font="600 25px Arial";ctx.fillStyle=ink;ctx.textAlign="center";ctx.textBaseline="top";ctx.direction="ltr";
      ctx.fillText(movie.title,x+columnWidth/2,top+posterHeight+12,columnWidth);
      ctx.font="400 21px Arial";ctx.fillStyle=muted;
      ctx.fillText(String(movie.year),x+columnWidth/2,top+posterHeight+43);
    });
    setText(20,400,muted,rtl?"right":"left");
    ctx.fillText(footer,rtl?right:left,canvas.height-105,width);
    try{canvas.toBlob(blob=>{
      const panel=document.getElementById("cp-export"),status=document.getElementById("cp-image-status");
      if(!blob||!panel)return;
      if(panel.dataset.url)URL.revokeObjectURL(panel.dataset.url);
      const url=URL.createObjectURL(blob);panel.dataset.url=url;panel.querySelector('img').src=url;panel.querySelector('a').href=url;panel.hidden=false;
      if(status)status.textContent=state.locale==='ar'?"البطاقة جاهزة للتنزيل.":"Your card is ready to download.";
      panel.scrollIntoView({block:"nearest",behavior:"smooth"});
    },"image/png");}catch(error){const status=document.getElementById("cp-image-status");if(status)status.textContent=state.locale==='ar'?"تعذّر إنشاء الصورة. جرّب المعاينة عبر المتصفح.":"The card could not be created. Try again in the browser.";}
  }

  root.addEventListener("click",event=>{
    const button=event.target.closest("[data-action]");
    if(!button||button.disabled)return;
    const name=button.dataset.action, value=button.dataset.value, film=button.dataset.film;
    if(name.startsWith("cf-")){counterframeAction(name,value);return;}
    if(name==="start"){
      startFromIntro();return;
    }
    if(name==="restart"){
      restartAssessment();return;
    }
    if(name==="adaptive-edition"){switchEdition(false);return;}
    if(name==="classic-edition"){switchEdition(true);return;}
    if(name==="deepen"){
      const bounds=limits();
      state.limit=bounds.full;state.index=bounds.core;state.route="quiz";current=null;draft=null;persist();render();goTop();return;
    }
    if(name==="refine"&&adaptiveState()&&state.route==="result"){
      const plan=D.adaptive.refinePlan(state,result);
      if(!plan.length)return;
      state.index=state.limit;
      state.refinement=[...(state.refinement||[]),...plan];
      state.limit=activeQuestions().length;state.route="quiz";current=null;draft=null;persist();render();goTop();return;
    }
    if(name==="review"){
      state.route="quiz";state.index=0;current=null;draft=null;persist();render();goTop();return;
    }
    if(name==="copy"){void copyPrompt();return;}
    if(name==="qa-copy"){void copyFeedback();return;}
    if(name==="qa-reason"&&adaptiveState()&&state.route==="result"){
      const item=feedbackSample().find(sample=>sample.slot===button.dataset.slot);
      if(!item||!feedbackReasons.some(reason=>reason.id===value))return;
      const feedback=state.feedback??={};
      if(feedback[item.slot]?.key===feedbackKey(item)&&feedback[item.slot].reason===value)delete feedback[item.slot];
      else feedback[item.slot]={key:feedbackKey(item),reason:value};
      persist();
      for(const control of root.querySelectorAll('[data-action="qa-reason"]'))if(control.dataset.slot===item.slot)
        control.setAttribute("aria-pressed",String(feedback[item.slot]?.reason===control.dataset.value));
      return;
    }
    if(name==="chat"){window.open("https://chatgpt.com/","_blank","noopener,noreferrer");void copyPrompt();return;}
    if(name==="image"){void saveImage();return;}
    if(name==="image-full"){void saveImage(true);return;}
    if(name==="close-export"){const panel=document.getElementById("cp-export");if(panel)panel.hidden=true;return;}
    if(name==="rec-seen"||name==="rec-no"){
      const y=window.scrollY;state.familiarity[film]=name==="rec-seen"?"seen":"not-interested";
      persist();renderResult();window.scrollTo({top:y,behavior:"instant"});return;
    }
    if(state.route!=="quiz")return;
    if(name==="next"){commitAnswer();return;}
    if(name==="skip"){commitAnswer(true);return;}
    if(adaptiveState()){
      if(name==="neutral"){commitAnswer(false,true);return;}
      if(name==="swap-unfamiliar"||name==="unfamiliar-cancel"){
        draft.unfamiliar=name==="swap-unfamiliar";renderQuestion(true);
        if(draft.unfamiliar){
          const panel=root.querySelector(".cp-familiarity-options");
          if(window.innerWidth<=680)panel?.scrollIntoView({block:"center",behavior:"instant"});
          panel?.querySelector("button")?.focus({preventScroll:true});
        }else root.querySelector('[data-action="swap-unfamiliar"]')?.focus({preventScroll:true});
        return;
      }
      if(["unfamiliar-only","unfamiliar-none","unfamiliar-recall"].includes(name)){
        if(current.purpose!=="coin"||current.kind!=="visual")return;
        if(name!=="unfamiliar-recall")current.options.forEach(option=>{
          state.familiarity[option.filmId]=name==="unfamiliar-only"&&option.filmId===film?"seen":"unseen";
        });
        switchQuestionForm();return;
      }
      if(name==="film-unseen"&&current.purpose==="rating"){
        state.familiarity[current.filmId]="unseen";
        switchQuestionForm();return;
      }
    }
    if(name==="back"){
      if(state.index>0){state.index--;current=null;draft=null;persist();render();goTop();}
      return;
    }
    if(name==="select"){draft.choice=draft.choice===value&&current.kind==="ending"&&draft.mode!=="alternative"?"":value;}
    if(name==="rating"){draft.rating=Number(value);}
    if(name==="feeling"){draft.feeling=draft.feeling===value?"":value;}
    if(name==="toggle-unseen"){
      const unseen=C.isUnseen(state.familiarity[film]);state.familiarity[film]=unseen?"seen":"unseen";
      if(!unseen&&draft.choice===film&&draft.mode!=="synopsis"){draft.choice="";draft.rating=null;}
      persist();
    }
    if(name==="unseen-reason"){
      state.familiarity[film]=state.familiarity[film]===value?"unseen":value;persist();
    }
    if(name==="alternative")resetMode("alternative");
    if(name==="synopsis-mode")resetMode("synopsis");
    if(name==="watched-mode")resetMode(current.visual==="still"?"image":"compare");
    if(name==="film-watched"){state.familiarity[film]="seen";resetMode("actual");persist();}
    if(name==="film-unseen"){state.familiarity[film]="unseen";commitAnswer(true);return;}
    if(!syncQuestionControls(name))renderQuestion(true);
  });
  root.addEventListener("change",event=>{
    if(event.target.id==="cp-age"){state.age=event.target.value;persist();}
  });
  root.addEventListener("submit",event=>{
    if(event.target.id!=="cp-email")return;
    event.preventDefault();
    const email=event.target.elements.address.value;
    const recs=result.recommendations.map(item=>item.movie.title+" ("+item.movie.year+")").join("\n");
    const body=C.profileSummary(result,state,state.locale)+"\n\n"+t("recommendations")+"\n"+recs;
    window.location.href="mailto:"+encodeURIComponent(email)+"?subject="+encodeURIComponent("The T.S. Archive — "+t("fullResult"))+
      "&body="+encodeURIComponent(body);
  });
  document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>{
    state.locale=button.dataset.lang;persist();render();
  }));
  window.addEventListener("scroll",syncIntroChrome,{passive:true});

  document.querySelectorAll('[data-profile-action]').forEach(control=>control.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    if(control.dataset.profileAction==='home')pauseToIntro();
    else restartAssessment();
  }));

  // Entry points from the archive open the introduction, but refreshing a
  // question without this intent continues the assessment as before.
  if(new URLSearchParams(location.search).get('home')==='1'){
    if(state.route!=='intro') {state.resumeRoute=state.route;state.route='intro';persist();}
    const url=new URL(location.href);url.searchParams.delete('home');
    try{history.replaceState(history.state,'',url);}catch{}
  }

  render();
})();
