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
      frame("burning","Ne","Ben's answers leave competing possibilities","تترك إجابات بن أكثر من احتمال مفتوح","assets/gallery/2010-2019/burning-2018/1dd0e8729437.webp")),
    q("cf02","S","daily-life","Which kind of pressure is more exhausting?","أيّ نوع من الضغط يستنزفك أكثر؟",
      frame("phantom-thread","Si","Life arranged around an established routine","حياة مرتّبة وفق طقوس ثابتة","phantom-thread-best-actor-curator.webp"),
      frame("uncut-gems","Se","Howard juggles demands as they arrive","هاورد يواجه مطالب متلاحقة وفورية","assets/gallery/2010-2019/uncut-gems/a0ed9d432d9e.webp")),
    q("cf03","T","teaching","Which demand would make you more resistant?","أيّ مطلب تجد نفسك أكثر مقاومةً له؟",
      frame("tar","Ti","The Juilliard discussion challenges the logic of a position","نقاش جوليارد يتحدّى منطق موقف الطالب","tar-2022-best-scene-cinematic-r2.webp"),
      frame("whiplash","Te","Rehearsal is judged against a performance standard","البروفة تُقاس بمعيار الأداء","whiplash-2014-best-antagonist.webp")),
    q("cf04","F","family","Which claim on a person's choices feels more constraining?","أيّ ضغط على خيارات الشخصية يبدو أشدّ تقييدًا؟",
      frame("little-women","Fi","Jo's own convictions set the terms of her future","قناعات جو الخاصة تحدّد شروط مستقبلها","assets/gallery/2010-2019/little-women-2019/beae798b6eb0.webp"),
      frame("coco","Fe","Miguel must navigate his family's expectations","ميغيل يواجه توقّعات عائلته","assets/gallery/2010-2019/coco-2017/6030fe350d6f.webp")),
    q("cf05","N","future","Which way of facing the future makes you more uneasy?","أيّ طريقة لمواجهة المستقبل تُقلقك أكثر؟",
      frame("dune-two","Ni","A prophecy gathers lives into a single future","نبوءة تجمع المصائر في مستقبل واحد","assets/gallery/2020-2026/dune-part-two/667d21014e1f.webp"),
      frame("poor-things","Ne","Each discovery opens another possible life","كل اكتشاف يفتح احتمال حياة جديدة","poor-things-2023-film-file.webp")),
    q("cf06","S","crisis","Which demand is harder to respond to?","أيّ مطلب تجد الاستجابة له أصعب؟",
      frame("first-man","Si","The mission depends on established procedures","المهمة تعتمد على إجراءات متّبعة","assets/gallery/2010-2019/first-man/8d3e9c25aca3.webp"),
      frame("dunkirk","Se","Survival depends on responding to the moment","النجاة تعتمد على الاستجابة الفورية لما يحدث","assets/gallery/2010-2019/dunkirk-2017/c142fa338933.webp")),
    q("cf07","T","work","Which way of challenging your work feels more uncomfortable?","أيّ طريقة للاعتراض على عملك تبدو أكثر إزعاجًا لك؟",
      frame("oppenheimer","Ti","A theoretical question is put to Einstein","يُطرَح سؤال نظري على آينشتاين","assets/gallery/2020-2026/oppenheimer-2023/f767eb35f8da.webp"),
      frame("steve-jobs","Te","The product must be ready for the launch","يجب أن يكون المنتج جاهزاً للإطلاق","assets/gallery/2010-2019/steve-jobs/e7f8f40939ad.webp")),
    q("cf08","F","relationship","Which pressure in a relationship is harder for you to accept?","أيّ ضغط في العلاقة يصعب عليك تقبّله أكثر؟",
      frame("banshees","Fi","Personal priorities collide with a friendship","تتصادم الأولويّات الخاصة مع الصداقة","assets/gallery/2020-2026/the-banshees-of-inisherin/c39e788b6e05.webp"),
      frame("before-midnight","Fe","Jesse and Céline confront their shared obligations","جيسي وسيلين يواجهان التزاماتهما المشتركة","before-midnight-best-line-of-dialogue-cinematic-r2.webp")),
    q("cf09","N","investigation","Which approach to an unresolved story creates more friction?","أيّ طريقة للتعامل مع حكاية غير محسومة يصعب عليك تقبّلها أكثر؟",
      frame("decision-leave","Ni","The investigation converges on a personal interpretation","يتّجه التحقيق نحو تفسير شخصي","assets/gallery/2020-2026/decision-to-leave/b2ebf8b4959b.webp"),
      frame("inception","Ne","The final image permits more than one reading","يسمح الكادر الأخير بأكثر من قراءة","inception-best-original-screenplay.webp")),
    q("cf10","S","creative-process","Which environment would be harder to work within?","أيّ بيئة تجد العمل فيها أصعب؟",
      frame("black-swan","Si","A role must be reproduced with exact precision","يجب تكرار الدور بدقّة شديدة","assets/gallery/2010-2019/black-swan/7c4faeeb597c.webp"),
      frame("babylon","Se","A film set demands constant real-time adjustments","موقع تصوير يتطلّب تعديلات فورية ومتواصلة","assets/gallery/2020-2026/babylon-2022/8e9a7c058328.webp")),
    q("cf11","T","evaluation","Which criterion would be harder to have your judgment tested by?","أيّ معيار يصعب عليك أن يُختبر حكمك وفقه؟",
      frame("anatomy-fall","Ti","Testimony is tested for contradictions","تُختبَر الشهادة بحثاً عن التناقضات","assets/gallery/2020-2026/anatomy-of-a-fall/8afccac0786c.webp"),
      frame("moneyball","Te","Recruitment choices face measurable results","تُقاس اختيارات الفريق بالنتائج الملموسة","assets/gallery/2010-2019/moneyball/bfedc35b3850.webp")),
    q("cf12","F","artistry","Which expectation around an artistic choice feels more difficult?","أيّ توقّع مفروض على خيار فني يبدو أصعب عليك؟",
      frame("inside-llewyn-davis","Fi","Llewyn stands by his own artistic voice","لوين يتمسّك بصوته الفني الخاص","inside-llewyn-davis-wide.webp"),
      frame("drive-my-car","Fe","A performance must find its place within an ensemble","يجب أن يجد الأداء مكانه ضمن الفرقة","assets/gallery/2020-2026/drive-my-car/083ae3e36484.webp"))
  ];
  // Optional Adaptive Edition forms: the original scenes are retained for
  // Classic. A second film pair illustrates the same pressure, and a brief
  // fictional situation makes a real choice possible without film recall.
  const parallel=[
    [["blade-runner","arrival"],L("Two people interpret an unexpected message. A decision cannot be postponed indefinitely.","يفسّر شخصان رسالة غير متوقّعة، ولا يمكن تأجيل القرار إلى أجل غير مسمّى."),
      L("Having to settle on one explanation before everything is clear.","الاضطرار إلى اعتماد تفسير واحد قبل اتّضاح كل شيء."),L("Having to keep several explanations open without a conclusion.","الاضطرار إلى إبقاء عدّة تفسيرات مفتوحة بلا خلاصة.")],
    [["first-man","babylon"],L("A new responsibility changes how an ordinary day unfolds.","تغيّر مسؤولية جديدة سير يوم اعتيادي."),
      L("Having to follow a fixed sequence every day.","الاضطرار إلى اتّباع تسلسل ثابت كل يوم."),L("Having to respond on the spot to the changing pace of events.","الاضطرار إلى الاستجابة في اللحظة لإيقاع الأحداث المتغيّر.")],
    [["social-network","moneyball"],L("A team presents a proposal and its reviewer challenges their decision.","يعرض فريق مقترحاً ويعترض المراجع على قراره."),
      L("Being asked to reconcile every part of your reasoning.","أن يُطلب منك التوفيق بين كل جوانب منطقك."),L("Being asked to meet an established performance target.","أن يُطلب منك بلوغ هدف أداء محدّد سلفاً.")],
    [["worst-person","before-midnight"],L("A person makes a life decision that will change things for their family.","يتّخذ شخص قراراً حياتياً سيغيّر أموراً تخص عائلته."),
      L("The need to stay consistent with a deeply personal value.","ضرورة الاتّساق مع قيمة شخصية عميقة."),L("The need to find a decision others can live with.","ضرورة إيجاد قرار يستطيع الآخرون التعايش معه.")],
    [["inception","midnight-paris"],L("A person is planning their next year with several possible paths ahead.","يخطّط شخص لعامه المقبل وأمامه أكثر من طريق ممكن."),
      L("Committing to a single future around which everything must align.","الالتزام بمستقبل واحد يجب ترتيب كل شيء من أجله."),L("Leaving the future open to new directions as they appear.","ترك المستقبل مفتوحاً لاتّجاهات جديدة حين تظهر.")],
    [["sicario","interstellar"],L("An unexpected problem requires a group to change its plan quickly.","تتطلّب مشكلة مفاجئة من مجموعة تعديل خطّتها بسرعة."),
      L("Following established procedures closely even as conditions change.","اتّباع الإجراءات المألوفة بدقّة حتى حين تتغيّر الظروف."),L("Reacting immediately without enough time to consider procedures.","الاستجابة فوراً دون وقت كافٍ للنظر في الإجراءات.")],
    [["social-network","moneyball"],L("A colleague is reviewing the work you have just completed.","يراجع زميل عملاً انتهيت من إنجازه."),
      L("Their challenge is whether your explanation is internally coherent.","يركّز اعتراضه على مدى الاتّساق الداخلي لتفسيرك."),L("Their challenge is whether your work achieved the required result.","يركّز اعتراضه على ما إذا كان عملك قد حقّق النتيجة المطلوبة.")],
    [["materialists","past-lives"],L("Two people care about one another but do not have the same priorities.","يهتم شخصان ببعضهما لكنّ أولوياتهما ليست واحدة."),
      L("Being asked to define and stay true to your own priorities.","أن يُطلب منك تحديد أولوياتك الخاصة والوفاء بها."),L("Being asked to balance both people's needs and expectations.","أن يُطلب منك الموازنة بين حاجات الشخصين وتوقّعاتهما.")],
    [["prisoners","certified-copy"],L("Two accounts of an event are plausible, and no final explanation has been agreed upon.","هناك روايتان معقولتان لحدث ولم يُتّفق على تفسير نهائي."),
      L("Pressure to make the evidence converge on one interpretation.","الضغط لجمع الأدلة حول تفسير واحد."),L("Pressure to leave competing interpretations unresolved.","الضغط لترك التفسيرات المتنافسة دون حسم.")],
    [["phantom-thread","grand-budapest"],L("A creative group is working toward a public presentation.","تعمل مجموعة إبداعية استعداداً لتقديم عمل أمام الجمهور."),
      L("Repeating the same procedure until every detail is exact.","تكرار الإجراء نفسه إلى أن تصبح كل تفصيلة دقيقة."),L("Adjusting to unexpected changes during the work itself.","التكيّف مع تغيّرات مفاجئة أثناء العمل نفسه.")],
    [["tar","social-network"],L("An independent reviewer is asked to assess a difficult judgment.","يُطلب من مراجع مستقل تقييم حكم صعب."),
      L("Testing the reasoning for logical contradictions.","اختبار الاستدلال بحثاً عن تناقضات منطقية."),L("Testing the judgment against observable results.","اختبار الحكم وفق النتائج القابلة للملاحظة.")],
    [["souvenir","la-la-land"],L("An artist has to decide how to finish a collaborative work.","يتوجّب على فنّان أن يقرّر كيف يُنهي عملاً جماعياً."),
      L("The work must remain faithful to an individual artistic commitment.","يجب أن يبقى العمل وفياً لالتزام فنّي شخصي."),L("The work must find a form that satisfies the shared artistic needs.","يجب أن يجد العمل شكلاً يلبّي الحاجات الفنّية المشتركة.")]
  ];
  questions.forEach((question,i)=>{
    const sceneForms=D.cinemaSceneBank?.pressure[question.id];
    if(sceneForms){
      question.forms=sceneForms.map(spec=>({...spec,options:spec.options.map((option,n)=>({
        ...option,id:String(n+1),code:question.options[n].code
      }))}));
      return;
    }
    const [films,scene,...labels]=parallel[i];
    const primary={kind:"visual",source:"film",options:question.options};
    const options=question.options.map((option,n)=>{
      const still=D.filmById[films[n]]?.still;
      if(!still)throw Error("Missing Counterframe still: "+films[n]);
      return {...option,label:labels[n],filmId:films[n],still};
    });
    const alternate={kind:"visual",source:"film",options};
    const scenario={kind:"scenario",source:"text",scene,options:options.map(o=>({...o,filmId:"",still:""}))};
    question.forms=[primary,alternate,scenario];
  });
  function form(question,answer={}){
    if(!Number.isInteger(answer.form))return question;
    const index=Math.max(0,Math.min(question.forms.length-1,answer.form));
    return {...question,...question.forms[index],form:index};
  }
  function selectForm(question,state,from=0){
    for(let i=from;i<question.forms.length;i++){
      const variant=form(question,{form:i});
      if(variant.source==="text"||variant.options.every(o=>!["unseen","interested","not-interested","no-opportunity"].includes(state.familiarity[o.filmId])))return i;
    }
    return -1;
  }
  const mirror={Ni:"Ne",Ne:"Ni",Si:"Se",Se:"Si",Ti:"Te",Te:"Ti",Fi:"Fe",Fe:"Fi"};
  const domains=["N","S","T","F"];
  const create=()=>({version:1,index:0,complete:false,answers:{}});
  function validAnswer(question,answer){
    if(answer?.form!==undefined&&(!Number.isInteger(answer.form)||answer.form<0||answer.form>=question.forms.length))return false;
    const variant=form(question,answer||{});
    const verified=answer?.form===undefined||variant.source==="text"||
      (answer.confirmed===true&&variant.options.every(o=>answer.recalled?.includes(o.filmId)));
    return !!answer?.done&&(answer.kind==="skip"||answer.kind==="neutral"||
      (answer.kind==="choice"&&verified&&variant.options.some(o=>o.id===answer.choice)&&
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
        cf.answers[question.id]={kind:"choice",choice:answer.choice,strength:Number.isInteger(answer.strength)&&answer.strength>=1&&answer.strength<=5?answer.strength:null,done:false,
          ...(Number.isInteger(answer.form)&&answer.form>=0&&answer.form<question.forms.length?{form:answer.form}:{})};
      } else if(answer?.kind==="pending"&&Number.isInteger(answer.form)&&answer.form>=0&&answer.form<question.forms.length){
        cf.answers[question.id]={kind:"pending",form:answer.form,done:false};
      }
    }
    cf.complete=!!saved.complete&&questions.every(question=>validAnswer(question,cf.answers[question.id]));
    return cf;
  }
  function evaluate(saved,profile={}){
    const cf=normalize(saved),valid=questions.filter(question=>validAnswer(question,cf.answers[question.id]));
    const choices=valid.filter(question=>cf.answers[question.id].kind==="choice").map(question=>{
      const answer=cf.answers[question.id],variant=form(question,answer),option=variant.options.find(o=>o.id===answer.choice);
      return {question:variant,option,strength:answer.strength,source:variant.source||"film"};
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
      if(lead)lead.provisional=lead.items.filter(item=>item.source==="film"&&item.strength>=3).length<2;
      return {axis,poles,lead,directional:relevant.length,film:relevant.filter(item=>item.source==="film").length,
        text:relevant.filter(item=>item.source==="text").length,answered:valid.filter(question=>question.axis===axis&&cf.answers[question.id].kind!=="skip").length};
    });
    const ranked=axes.map(axis=>axis.lead).filter(Boolean).sort((a,b)=>b.mass-a.mass||b.count-a.count);
    // Do not force a single strongest cue on a tie.
    const top=ranked[0]&&(ranked.length===1||ranked[0].mass>ranked[1].mass||ranked[0].count>ranked[1].count)?ranked[0]:null;
    const dominant=profile.orientation==="Observer"?profile.observerFunction:profile.orientation==="Decider"?profile.deciderFunction:"";
    const opposite=mirror[dominant]||"";
    const comparison=opposite&&axes.find(axis=>axis.axis===opposite[0])?.lead;
    const relation=!opposite?"unavailable":!comparison?"open":comparison.code===opposite?"aligned":"different";
    const representative=top?.items.filter(item=>item.option.filmId&&item.option.still).sort((a,b)=>b.strength-a.strength)[0]?.option||null;
    return {complete:cf.complete,visited:valid.length,answered:valid.filter(question=>cf.answers[question.id].kind!=="skip").length,
      directional:choices.length,neutral:valid.filter(question=>cf.answers[question.id].kind==="neutral").length,axes,ranked,top,
      dominant,opposite,relation,comparison:comparison||null,representative};
  }
  globalThis.CinemaCounterframe={questions,pressures,mirror,create,normalize,evaluate,validAnswer,form,selectForm};
})();
