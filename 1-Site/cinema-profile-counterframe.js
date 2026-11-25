/* Counterframe: a separate, optional reading of pressure in familiar films.
   Film cues are interpretive hypotheses, not types assigned to characters.
   They do not contribute to the five Coins, Animals, motives or taste ranks. */
(() => {
  "use strict";
  const D=globalThis.CinemaProfileData;
  const L=(en,ar)=>({en,ar});
  const pressures={
    Ni:{name:L("Single horizon","أفق واحد"),hint:L("One interpretation or direction becomes decisive.","يتحوّل تفسير أو اتجاه واحد إلى الخيار الحاسم.")},
    Ne:{name:L("Branching horizons","آفاق متشعّبة"),hint:L("New possibilities keep the direction open.","تُبقي الاحتمالات الجديدة الاتجاه مفتوحاً.")},
    Si:{name:L("Familiar order","النظام المألوف"),hint:L("Established routines, records or precedents set the terms.","تحدّد العادات والسجلات والسوابق شروط الموقف.")},
    Se:{name:L("Immediate demand","ضغط اللحظة"),hint:L("The immediate situation calls for attention and action.","يفرض الموقف الآني انتباهاً واستجابة مباشرة.")},
    Ti:{name:L("Inner coherence","الاتّساق الداخلي"),hint:L("A decision must make sense within its own reasoning.","يجب أن يتّسق القرار مع منطقه الداخلي.")},
    Te:{name:L("External standard","المعيار الخارجي"),hint:L("A decision is judged against a practical result or criterion.","يُحكم على القرار وفق نتيجة عملية أو معيار خارجي.")},
    Fi:{name:L("Private conviction","القناعة الخاصة"),hint:L("An individual holds to what matters personally.","يتمسّك الفرد بما يهمّه شخصياً.")},
    Fe:{name:L("Shared expectation","التوقّع المشترك"),hint:L("The needs and expectations of others shape a decision.","تشكّل حاجات الآخرين وتوقّعاتهم القرار.")}
  };
  const frame=(filmId,code,en,ar,still)=>({filmId,code,label:L(en,ar),still:still||D.filmById[filmId].still});
  const q=(id,axis,context,en,ar,a,b)=>({id,axis,context,prompt:L(en,ar),options:[a,b].map((o,i)=>({...o,id:String(i+1)}))});
  // Interleave domains and vary the situation. The labels identify a
  // concrete dramatic pressure, rather than announcing a cognitive code.
  const questions=[
    q("cf01","N","meaning","Which uncertainty is harder to sit with?","أيّ نوع من عدم اليقين يصعب عليك تحمّله؟",
      frame("shutter-island","Ni","Teddy holds to his picture of the investigation","تيدي يتمسّك بتصوّره عن التحقيق","assets/gallery/2010-2019/shutter-island/1d74bbe44ff5.webp"),
      frame("burning","Ne","Ben's answers leave competing possibilities","تترك إجابات بن احتمالات متنافسة","assets/gallery/2010-2019/burning-2018/1dd0e8729437.webp")),
    q("cf02","S","daily-life","Which kind of pressure is more exhausting?","أيّ نوع من الضغط يستنزفك أكثر؟",
      frame("phantom-thread","Si","Life arranged around an established routine","حياة مرتّبة وفق طقوس ثابتة","phantom-thread-best-actor-curator.webp"),
      frame("uncut-gems","Se","Howard juggles demands as they arrive","هاورد يواجه مطالب متلاحقة في اللحظة","assets/gallery/2010-2019/uncut-gems/a0ed9d432d9e.webp")),
    q("cf03","T","teaching","Which demand would make you more resistant?","أيّ مطلب يثير مقاومة أكبر لديك؟",
      frame("tar","Ti","The Juilliard discussion challenges the logic of a position","نقاش جوليارد يتحدّى منطق موقف الطالب","tar-2022-best-scene-cinematic-r2.webp"),
      frame("whiplash","Te","Rehearsal is judged against a performance standard","البروفة تُقاس بمعيار الأداء","whiplash-2014-best-antagonist.webp")),
    q("cf04","F","family","Which claim on a person's choices feels more constraining?","أيّ مطالبة بخيارات الشخص تبدو أشد تقييداً؟",
      frame("little-women","Fi","Jo's own convictions set the terms of her future","قناعات جو الخاصة تحدّد شروط مستقبلها","assets/gallery/2010-2019/little-women-2019/beae798b6eb0.webp"),
      frame("coco","Fe","Miguel must navigate his family's expectations","ميغيل يواجه توقّعات عائلته","assets/gallery/2010-2019/coco-2017/6030fe350d6f.webp")),
    q("cf05","N","future","Which way of facing the future makes you more uneasy?","أيّ طريقة لمواجهة المستقبل تُقلقك أكثر؟",
      frame("dune-two","Ni","A prophecy gathers lives into a single future","نبوءة تجمع المصائر في مستقبل واحد","assets/gallery/2020-2026/dune-part-two/667d21014e1f.webp"),
      frame("poor-things","Ne","Each discovery opens another possible life","كل اكتشاف يفتح احتمال حياة جديدة","poor-things-2023-film-file.webp")),
    q("cf06","S","crisis","Which demand is harder to respond to?","أيّ مطلب تجد الاستجابة له أصعب؟",
      frame("first-man","Si","The mission depends on established procedures","المهمة تعتمد على إجراءات متّبعة","assets/gallery/2010-2019/first-man/8d3e9c25aca3.webp"),
      frame("dunkirk","Se","Survival depends on responding to the moment","النجاة تعتمد على الاستجابة للحظة","assets/gallery/2010-2019/dunkirk-2017/c142fa338933.webp")),
    q("cf07","T","work","Which way of challenging your work feels more uncomfortable?","أيّ طريقة للاعتراض على عملك تجدها أكثر إزعاجاً؟",
      frame("oppenheimer","Ti","A theoretical question is put to Einstein","يُطرَح سؤال نظري على آينشتاين","assets/gallery/2020-2026/oppenheimer-2023/f767eb35f8da.webp"),
      frame("steve-jobs","Te","The product must be ready for the launch","يجب أن يكون المنتج جاهزاً للإطلاق","assets/gallery/2010-2019/steve-jobs/e7f8f40939ad.webp")),
    q("cf08","F","relationship","Which pressure in a relationship is harder for you to accept?","أيّ ضغط في العلاقة يصعب عليك تقبّله أكثر؟",
      frame("banshees","Fi","Personal priorities collide with a friendship","تتصادم الأولويّات الخاصة مع الصداقة","assets/gallery/2020-2026/the-banshees-of-inisherin/c39e788b6e05.webp"),
      frame("before-midnight","Fe","Jesse and Céline confront their shared obligations","جيسي وسيلين يواجهان التزاماتهما المشتركة","before-midnight-best-line-of-dialogue-cinematic-r2.webp")),
    q("cf09","N","investigation","Which approach to an unresolved story creates more friction?","أيّ مقاربة لحكاية غير محسومة تثير مقاومة أكبر؟",
      frame("decision-leave","Ni","The investigation converges on a personal interpretation","يتّجه التحقيق نحو تفسير شخصي","assets/gallery/2020-2026/decision-to-leave/b2ebf8b4959b.webp"),
      frame("inception","Ne","The final image permits more than one reading","يسمح الكادر الأخير بأكثر من قراءة","inception-best-original-screenplay.webp")),
    q("cf10","S","creative-process","Which environment would be harder to work within?","أيّ بيئة تجد العمل فيها أصعب؟",
      frame("black-swan","Si","A role must be reproduced with exact precision","يجب تكرار الدور بدقّة شديدة","assets/gallery/2010-2019/black-swan/7c4faeeb597c.webp"),
      frame("babylon","Se","A film set demands constant real-time adjustments","موقع تصوير يتطلّب تعديلات متواصلة في اللحظة","assets/gallery/2020-2026/babylon-2022/8e9a7c058328.webp")),
    q("cf11","T","evaluation","Which criterion would be harder to have your judgment tested by?","أيّ معيار تجد اختبار حكمك به أصعب؟",
      frame("anatomy-fall","Ti","Testimony is tested for contradictions","تُختبَر الشهادة بحثاً عن التناقضات","assets/gallery/2020-2026/anatomy-of-a-fall/8afccac0786c.webp"),
      frame("moneyball","Te","Recruitment choices face measurable results","تُقاس اختيارات الفريق بالنتائج الملموسة","assets/gallery/2010-2019/moneyball/bfedc35b3850.webp")),
    q("cf12","F","artistry","Which expectation around an artistic choice feels more difficult?","أيّ توقّع حول اختيار فنّي يبدو أصعب عليك؟",
      frame("inside-llewyn-davis","Fi","Llewyn stands by his own artistic voice","لوين يتمسّك بصوته الفني الخاص","inside-llewyn-davis-wide.webp"),
      frame("drive-my-car","Fe","A performance must find its place within an ensemble","يجب أن يجد الأداء مكانه ضمن الفرقة","assets/gallery/2020-2026/drive-my-car/083ae3e36484.webp"))
  ];
  const mirror={Ni:"Ne",Ne:"Ni",Si:"Se",Se:"Si",Ti:"Te",Te:"Ti",Fi:"Fe",Fe:"Fi"};
  const domains=["N","S","T","F"];
  const create=()=>({version:1,index:0,complete:false,answers:{}});
  function validAnswer(question,answer){
    return !!answer?.done&&(answer.kind==="skip"||answer.kind==="neutral"||
      (answer.kind==="choice"&&question.options.some(o=>o.id===answer.choice)&&
        Number.isInteger(answer.strength)&&answer.strength>=1&&answer.strength<=5));
  }
  function normalize(saved){
    if(saved?.version!==1||!saved.answers||typeof saved.answers!=="object")return create();
    const cf=create();
    cf.index=Math.max(0,Math.min(questions.length-1,Number.isInteger(saved.index)?saved.index:0));
    for(const question of questions){
      const answer=saved.answers[question.id];
      if(validAnswer(question,answer))cf.answers[question.id]={...answer};
      else if(answer?.kind==="choice"&&question.options.some(o=>o.id===answer.choice)){
        cf.answers[question.id]={kind:"choice",choice:answer.choice,strength:Number.isInteger(answer.strength)&&answer.strength>=1&&answer.strength<=5?answer.strength:null,done:false};
      }
    }
    cf.complete=!!saved.complete&&questions.every(question=>validAnswer(question,cf.answers[question.id]));
    return cf;
  }
  function evaluate(saved,profile={}){
    const cf=normalize(saved),valid=questions.filter(question=>validAnswer(question,cf.answers[question.id]));
    const choices=valid.filter(question=>cf.answers[question.id].kind==="choice").map(question=>{
      const answer=cf.answers[question.id],option=question.options.find(o=>o.id===answer.choice);
      return {question,option,strength:answer.strength};
    });
    const axes=domains.map(axis=>{
      const relevant=choices.filter(choice=>choice.question.axis===axis);
      const poles=[axis+"i",axis+"e"].map(code=>{
        const items=relevant.filter(choice=>choice.option.code===code);
        const mass=items.reduce((sum,item)=>sum+item.strength,0);
        return {code,count:items.length,mass,mean:items.length?mass/items.length:0,contexts:new Set(items.map(item=>item.question.context)).size,items};
      }).sort((a,b)=>b.mass-a.mass||b.count-a.count||a.code.localeCompare(b.code));
      const [first,second]=poles,total=first.mass+second.mass;
      // At least two separate contexts at moderate-or-higher intensity, plus
      // a directional lead. Neutral and missing answers never become a pole.
      const lead=first.contexts>=2&&first.items.filter(item=>item.strength>=3).length>=2&&
        first.count>second.count&&first.mass>second.mass&&first.mass/total>=2/3?first:null;
      return {axis,poles,lead,directional:relevant.length,answered:valid.filter(question=>question.axis===axis&&cf.answers[question.id].kind!=="skip").length};
    });
    const ranked=axes.map(axis=>axis.lead).filter(Boolean).sort((a,b)=>b.mass-a.mass||b.count-a.count);
    // Do not force a single strongest cue on a tie.
    const top=ranked[0]&&(ranked.length===1||ranked[0].mass>ranked[1].mass||ranked[0].count>ranked[1].count)?ranked[0]:null;
    const dominant=profile.orientation==="Observer"?profile.observerFunction:profile.orientation==="Decider"?profile.deciderFunction:"";
    const opposite=mirror[dominant]||"";
    const comparison=opposite&&axes.find(axis=>axis.axis===opposite[0])?.lead;
    const relation=!opposite?"unavailable":!comparison?"open":comparison.code===opposite?"aligned":"different";
    const representative=top?.items.slice().sort((a,b)=>b.strength-a.strength)[0]?.option||null;
    return {complete:cf.complete,visited:valid.length,answered:valid.filter(question=>cf.answers[question.id].kind!=="skip").length,
      directional:choices.length,neutral:valid.filter(question=>cf.answers[question.id].kind==="neutral").length,axes,ranked,top,
      dominant,opposite,relation,comparison:comparison||null,representative};
  }
  globalThis.CinemaCounterframe={questions,pressures,mirror,create,normalize,evaluate,validAnswer};
})();
