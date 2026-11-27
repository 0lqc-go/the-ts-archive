/* Editorial, film-first prompts.
 * Each option refers to an actual story moment, character decision or detail.
 * Film A/B can differ between forms; the underlying contrast stays the same.
 * No pole, function or type is assigned to a film or character.
 */
(() => {
  "use strict";
  const D=globalThis.CinemaProfileData;
  const L=(en,ar)=>({en,ar});
  const old="2010-2019",recent="2020-2026";
  const directories={
    "social-network":[old,"the-social-network"],"little-women":[old,"little-women-2019"],
    moonlight:[old,"moonlight-2016"],arrival:[old,"arrival-2016"],"grand-budapest":[old,"the-grand-budapest-hotel"],
    burning:[old,"burning-2018"],"blade-runner":[old,"blade-runner-2049"],prisoners:[old,"prisoners"],
    "shutter-island":[old,"shutter-island"],"gone-girl":[old,"gone-girl"],batman:[recent,"the-batman"],
    "anatomy-fall":[recent,"anatomy-of-a-fall"],"decision-leave":[recent,"decision-to-leave"],
    handmaiden:[old,"the-handmaiden"],"nocturnal-animals":[old,"nocturnal-animals"],
    "before-midnight":[old,"before-midnight"],"past-lives":[recent,"past-lives"],manchester:[old,"manchester-by-the-sea"],
    "beale-street":[old,"if-beale-street-could-talk"],her:[old,"her"],aftersun:[recent,"aftersun"],
    "drive-my-car":[recent,"drive-my-car"],banshees:[recent,"the-banshees-of-inisherin"],
    "worst-person":[recent,"the-worst-person-in-the-world"],souvenir:[old,"the-souvenir"],
    interstellar:[old,"interstellar"],"first-man":[old,"first-man"],dunkirk:[old,"dunkirk-2017"],
    "1917":[old,"1917"],tenet:[recent,"tenet"],moneyball:[old,"moneyball"],"steve-jobs":[old,"steve-jobs"],
    oppenheimer:[recent,"oppenheimer-2023"],"dune-two":[recent,"dune-part-two"],"uncut-gems":[old,"uncut-gems"],
    "black-swan":[old,"black-swan"],"inside-llewyn-davis":[old,"inside-llewyn-davis"],"tree-life":[old,"the-tree-of-life-2011"],
    "sentimental-value":[recent,"sentimental-value-2025"],"french-dispatch":[recent,"the-french-dispatch-of-the-liberty-kansas"],
    "midnight-paris":[old,"midnight-in-paris"],"certified-copy":[old,"certified-copy"],"your-name":[old,"your-name"],
    "poor-things":[recent,"poor-things-2023"],coco:[old,"coco-2017"],"inside-out":[old,"inside-out-2015"],
    master:[old,"the-master-2012"],babylon:[recent,"babylon-2022"],elvis:[recent,"elvis-2022"],
    "a-complete-unknown":[recent,"a-complete-unknown"],"marty-supreme":[recent,"marty-supreme"],
    materialists:[recent,"materialists"],nightcrawler:[old,"nightcrawler"],"nightmare-alley":[recent,"nightmare-alley-2021"],
    "monte-cristo":[recent,"the-count-of-monte-cristo-2024"],brutalist:[recent,"the-brutalist"],
    challengers:[recent,"challengers"],"may-december":[recent,"may-december"],hamnet:[recent,"hamnet"],
    "no-other-choice":[recent,"no-other-choice-2025"],"asteroid-city":[recent,"asteroid-city"],
    oslo:[old,"oslo-august-31st"],sicario:[old,"sicario-2015"],drive:[old,"drive-2011"],dune:[recent,"dune-2021"]
  };
  const N=(filmId,still,en,ar)=>{
    if(!D.filmById[filmId]||!still)throw Error("Missing scene artwork: "+filmId);
    return {filmId,still,label:L(en,ar)};
  };
  const G=(filmId,hash,en,ar)=>{
    const [decade,folder]=directories[filmId]||[];
    if(!folder)throw Error("Missing gallery directory: "+filmId);
    return N(filmId,"assets/gallery/"+decade+"/"+folder+"/"+hash+".webp",en,ar);
  };
  const F=(en,ar,a,b)=>({kind:"visual",source:"film",cinematic:true,prompt:L(en,ar),options:[a,b]});
  const T=(en,ar,sceneEn,sceneAr,aEn,aAr,bEn,bAr)=>({kind:"scenario",source:"text",cinematic:true,prompt:L(en,ar),
    scene:L(sceneEn,sceneAr),options:[{filmId:"",still:"",label:L(aEn,aAr)},{filmId:"",still:"",label:L(bEn,bAr)}]});
  const coins={
    // What captures attention: unfolding circumstances / stakes between people.
    v01:[
      F("During the Facebook hearings, what stayed on your mind?","في شهادات قضية فيسبوك، أيّ شيء ظل يشغلك أكثر؟",
        G("social-network","fcc747353fa4","How the company grew until Eduardo's share was diluted.","كيف تغيّرت حصص الشركة حتى تقلّصت حصة إدواردو."),
        G("social-network","1d0735d6be58","How Mark and Eduardo's friendship ended up in a courtroom.","كيف انتهت صداقة مارك وإدواردو بهما على طرفي القضية.")),
      F("After Amy disappears, what keeps you following the story?","بعد اختفاء آيمي، ما الذي جعلك تواصل متابعة القصة؟",
        G("gone-girl","7e430863e325","The clues that don't add up about Amy's whereabouts.","الأدلة المتناقضة حول مكان آيمي وما حدث لها."),
        G("gone-girl","484cad86da53","What we gradually discover about Nick and Amy's marriage.","ما نكتشفه تدريجيًا عن زواج نِك وآيمي ونظرة أحدهما للآخر.")),
      T("If there were one more scene, what would you want to see?","لو بقي مشهد أخير، أيّ مشهد تريد أن تراه؟",
        "Two friends are about to open a café together. On the opening morning the doors are still locked, the landlord is missing, and one friend accuses the other of breaking their agreement.",
        "صديقان يوشكان على افتتاح مقهى. صباح الافتتاح يجدان الأبواب مغلقة وصاحب العقار غائبًا، ويتّهم أحدهما الآخر بأنه أخلّ باتفاقهما.",
        "They discover why the café never opened and what can happen next.","يكتشفان لماذا لم يُفتح المقهى وما الذي سيحدث بعد ذلك.",
        "They finally talk about why neither trusts the other anymore.","يتحدثان أخيرًا عن سبب فقدان كلّ منهما الثقة بالآخر.")
    ],
    v07:[
      F("After their worlds change, which question lingers?","بعد التحوّل الكبير في الحكايتين، أيّ سؤال بقي معك؟",
        G("dune-two","667d21014e1f","What will become of Arrakis as Paul rises among the Fremen?","ما الذي سيحدث لأراكيس بعد صعود بول بين الفريمن؟"),
        N("tar","tar-2022-alt-04.webp","How will Lydia face the orchestra when her reputation changes?","كيف ستواجه ليديا أعضاء الأوركسترا بعد تغيّر نظرتهم إليها؟")),
      F("Which aftermath did you most want the film to explore?","أيّ نتيجة تمنّيت أن تتوسّع الحكاية في متابعتها؟",
        G("1917","24a16adf3631","Whether the message will reach the battalion in time.","هل ستصل الرسالة إلى الكتيبة في الوقت المناسب؟"),
        G("may-december","3eb6c75cc199","How Joe begins to see his life with Gracie differently after Elizabeth arrives.","كيف بدأ جو يعيد النظر في حياته مع غريسي بعد وصول إليزابيث.")),
      T("What is the question you would leave the story with?","أيّ سؤال سيبقى لديك عندما تظهر أسماء النهاية؟",
        "A storm closes the theatre on the evening of a festival. The company has lost its venue, and the performers blame their director for not listening to them.",
        "تغلق عاصفة المسرح ليلة المهرجان. تخسر الفرقة قاعتها، ويلوم الممثلون المخرج لأنه لم يستمع إليهم.",
        "Can they find another venue before the audience goes home?","هل سيجدون قاعة أخرى قبل أن يعود الجمهور إلى بيوته؟",
        "Will the actors be able to trust their director again?","هل سيتمكّن الممثلون من الوثوق بمخرجهم مرة أخرى؟")
    ],
    v13:[
      F("During the trial, which thread did you want to hear more about?","أثناء المحاكمة، أيّ جانب تمنّيت أن تُمنح له مساحة أكبر؟",
        G("anatomy-fall","185dc5dcb825","How Samuel could have fallen from the house.","كيف يمكن أن يكون صموئيل قد سقط من أعلى المنزل."),
        G("anatomy-fall","4b321e91ef70","What the recorded argument tells us about Sandra and Samuel together.","ما الذي كشفه تسجيل الشجار عن علاقة ساندرا وصموئيل؟")),
      F("Which part of Hae-jun's investigation stayed with you?","أيّ خيط من حكاية هاي جون ظلّ معك؟",
        G("decision-leave","6487c019402c","How the man's fall from the mountain can be explained.","كيف حدث سقوط الرجل من الجبل، وما الذي يوضّحه؟"),
        G("decision-leave","60443240fc66","What happens between Hae-jun and Seo-rae as the case draws them closer.","ما الذي يحدث بين هاي جون وسيو راي كلما قرّبتهما القضية؟")),
      T("Which unanswered part would you follow?","أيّ جزء من الحكاية ستظل تتابعه؟",
        "At a family dinner a grandfather's watch vanishes. Two siblings who have not spoken in years disagree about who last saw it.",
        "على مائدة عائلية تختفي ساعة الجد. يختلف أخوان لم يتحدثا منذ سنوات حول مَن رآها آخر مرة.",
        "Where the watch went and which account fits its disappearance.","أين ذهبت الساعة، وأيّ رواية تتوافق مع اختفائها؟",
        "What happened between the siblings that made them suspect each other.","ما الذي حصل بين الأخوين حتى صارا يشكّان بأحدهما الآخر؟")
    ],
    v19:[
      F("Which part of Cooper's journey worried you more?","أيّ جانب من رحلة كوبِر كان يشغلك أكثر؟",
        G("interstellar","f26b16f38f8a","How time near the black hole could change the chances of completing the mission.","كيف يمكن للزمن قرب الثقب الأسود أن يغيّر فرص إكمال المهمة."),
        G("interstellar","b9fb250ec832","What years of separation would do to Cooper and Murph's relationship.","ماذا سيفعل طول الغياب بعلاقة كوبِر مع مورف؟")),
      F("Which open question made the situation more tense for you?","أيّ سؤال معلّق جعل الموقف أكثر توتّرًا عندك؟",
        G("dunkirk","c142fa338933","Whether the boats can get the waiting soldiers home.","هل ستتمكّن القوارب من إعادة الجنود المنتظرين؟"),
        G("before-midnight","d938e569cad5","Whether Jesse and Céline can still see a life together after their argument.","هل سيظل جيسي وسيلين قادرين على رؤية حياة مشتركة بعد شجارهما؟")),
      T("Which part of their story would make you wait for the next scene?","أيّ جانب من حكايتهم يجعلك تنتظر المشهد التالي؟",
        "A woman takes the last train to catch a flight that could change her career. She has left a difficult conversation unfinished with her sister.",
        "تستقل امرأة القطار الأخير لتلحق برحلة قد تغيّر عملها، وقد تركت حديثًا صعبًا معلّقًا مع أختها.",
        "Whether the train and the flight will connect in time.","هل ستصل بالقطار لتلحق بالطائرة في الوقت المناسب؟",
        "Whether her sister will understand why she left before they finished talking.","هل ستفهم أختها سبب رحيلها قبل أن ينهيا حديثهما؟")
    ],
    v26:[
      F("After the girls vanish, which mystery kept you watching?","بعد اختفاء الطفلتين، أيّ جانب دفعك لمواصلة المشاهدة؟",
        G("prisoners","8d01f6b15efd","How the parked camper and the evidence might link to their disappearance.","كيف ترتبط العربة المتوقفة والقرائن باختفاء الطفلتين؟"),
        G("prisoners","86fa90261a81","How fear for Anna changes Keller as a father and a friend.","كيف غيّر الخوف على آنا كيلر كأب وصديق؟")),
      F("When Samantha's life changes, what did you want to understand?","حين بدأت حياة سامنثا تتغيّر، أيّ شيء أردت فهمه أكثر؟",
        N("her","her-curator-frame-20261126-34.webp","What was happening to the operating systems as they developed beyond their users.","ما الذي كان يحدث لأنظمة التشغيل عندما بدأت تتطوّر أبعد من مستخدميها؟"),
        N("her","her-curator-dossier-cover-20261126.webp","What Theodore feels when he discovers he is not Samantha's only intimate connection.","ما الذي شعر به ثيودور حين عرف أنه ليس العلاقة الوحيدة المقرّبة لسامنثا؟")),
      T("Which part deserves the next chapter?","أيّ جانب يستحق أن تبدأ به الحكاية فصلها التالي؟",
        "A pupil suddenly stops attending music practice. The teacher finds the instrument still in the rehearsal room, while the other pupils are unusually silent.",
        "يتوقف طالب فجأة عن حضور تدريب الموسيقى. تجد المعلمة آلته في غرفة التدريب، بينما يلتزم زملاؤه صمتًا غير معتاد.",
        "Where the pupil went and what happened to the rehearsals.","أين ذهب الطالب وماذا حدث في أيام التدريب؟",
        "Why the pupil's friends stopped speaking to him before he left.","لماذا توقف أصدقاء الطالب عن الحديث معه قبل رحيله؟")
    ],
    v32:[
      F("As everything comes to a head, which question took over?","حين بلغت الحكايتان ذروتهما، أيّ سؤال استحوذ على انتباهك؟",
        G("tenet","cf4940d52b81","How the two directions of time meet during the highway pursuit.","كيف التقى اتجاها الزمن في مطاردة الطريق؟"),
        N("whiplash","whiplash-2014-best-scene.webp","What Fletcher will see in Andrew when he returns to play the final set.","كيف سينظر فليتشر إلى أندرو حين يعود للعزف في العرض الأخير؟")),
      F("During the final stretch, what kept you on edge?","في اللحظات الأخيرة، أيّ جانب ظلّ يوتّرك أكثر؟",
        G("uncut-gems","f4190539d63a","Whether the basketball game will turn out the way Howard needs.","هل ستنتهي مباراة كرة السلة بالنتيجة التي ينتظرها هاورد؟"),
        G("black-swan","8009df774629","What Nina believes Lily and the people around her think of her.","كيف كانت نينا تقرأ نظرة ليلي ومن حولها إليها؟")),
      T("Where would your attention go as the curtain comes up?","مع ارتفاع ستار المسرح، أيّ جانب سيأخذ انتباهك؟",
        "A first-time director discovers that an important prop is missing minutes before the premiere. The lead actor thinks the director has let everyone down.",
        "يكتشف مخرج في عرضه الأول أن قطعة مهمة من الديكور مفقودة قبل الافتتاح بدقائق. يظن الممثل الرئيسي أن المخرج خذل الجميع.",
        "How the show can still get through its opening scene.","كيف سيتمكّن العرض من تجاوز مشهده الأول؟",
        "Whether the lead actor and director can still work together after this.","هل سيبقى الممثل والمخرج قادرين على العمل معًا بعد ما حدث؟")
    ],
    v38:[
      F("After Hae-mi disappears, which question matters more to you?","بعد اختفاء هيمي، أيّ سؤال ظلّ أهم بالنسبة لك؟",
        G("burning","e5c3eecf6fb5","Whether Ben's story about the greenhouses is connected to her disappearance.","هل ترتبط حكاية بن عن البيوت الزراعية باختفائها؟"),
        G("burning","9e94df89a80a","Whether Jong-su ever understood how lonely Hae-mi felt.","هل فهم جونغ سو يومًا مدى الوحدة التي كانت تشعر بها هيمي؟")),
      F("Which unanswered thread would you return to?","أيّ خيط غير محسوم ستعود إليه بعد المشاهدة؟",
        G("shutter-island","125fd22c056a","What really happened to the patient whose disappearance brings Teddy to the island.","ما الذي حدث للمريضة التي جاء تيدي إلى الجزيرة بسبب اختفائها؟"),
        G("oslo","4b1df909d940","How Anders finds his place among friends who have moved on with their lives.","كيف سيجد أندرس مكانه بين أصدقاء مضوا في حياتهم؟")),
      T("Which story would you want to stay with?","أيّ حكاية ترغب في أن تستمرّ بمتابعتها؟",
        "A traveller leaves a postcard in a friend's mailbox, then never arrives at their agreed meeting. The friend finds that the people who knew the traveller remember very different versions of their life.",
        "يترك مسافر بطاقة بريدية في صندوق صديقه، ثم لا يأتي إلى موعدهما. يكتشف الصديق أن مَن عرف المسافر يتذكّرون جوانب مختلفة جدًا من حياته.",
        "What happened on the journey between the postcard and the meeting.","ما الذي حدث في الرحلة بين إرسال البطاقة والموعد؟",
        "What those different memories tell us about who he was to his friends.","ما الذي تكشفه تلك الذكريات عن مكانته لدى أصدقائه؟")
    ],

    // Follow a settled direction / allow another possibility to open.
    v02:[
      F("Which way of following a story drew you in?","أيّ طريقة في تتبّع الحكاية شدّتك أكثر؟",
        G("arrival","f175e61dd888","Louise returns to the visitors' circular writing to connect their messages.","لويز تعود إلى رموز الزوّار الدائرية لتربط رسائلهم ببعضها."),
        G("grand-budapest","41d61b7422fe","Gustave and Zero follow the surprising twists that begin with Madame D's painting.","غوستاف وزيرو يتتبّعان المنعطفات المفاجئة التي تبدأ بلوحة مدام دي.")),
      F("Which pursuit would you have liked to follow for longer?","أيّ سعي كنت تحب أن تتابعه مدة أطول؟",
        G("batman","ff0617eb9855","Batman puts the Riddler's clues together to find the connection between the crimes.","باتمان يجمع ألغاز ريدلر حتى يصل إلى الرابط بين الجرائم."),
        G("handmaiden","ef7f49609917","Sook-hee discovers new sides of Hideko and her plans begin to change.","سوك هي تكتشف جوانب جديدة من هيديكي فتتغيّر خططها.")),
      T("Which scene would you be more curious to watch next?","أيّ مشهد سيثير فضولك أكثر؟",
        "A documentary researcher enters a town whose old photographs contradict the story she has been told.",
        "تزور باحثة تعدّ فيلمًا وثائقيًا بلدةً، فتجد أن صورها القديمة لا توافق الحكاية التي سمعتها.",
        "She lays out the photographs again and builds a new account from them.","تعيد ترتيب الصور وتبني منها رواية جديدة.",
        "She visits different residents to see what other stories they might open up.","تزور سكانًا مختلفين لترى أيّ حكايات أخرى ستفتحها لقاءاتهم.")
    ],
    v08:[
      F("Which everyday response made more sense to you?","أيّ طريقة في عيش اليوم فهمتها أكثر؟",
        N("phantom-thread","phantom-thread-ceremony-best-actor.webp","Reynolds protects his breakfast ritual and the rhythm of work at his fashion house.","رينولدز يحافظ على طقوس إفطاره وإيقاع العمل في دار الأزياء."),
        G("worst-person","3eff7d793d86","Julie moves from one field of study and work to another, discovering what she wants.","جولي تنتقل بين الدراسة والعمل والتجارب حتى تكتشف ما تريده.")),
      F("Which approach to a new chapter interested you more?","أيّ بداية لمرحلة جديدة أثارت اهتمامك أكثر؟",
        G("first-man","8d3e9c25aca3","Neil and his crew prepare for the journey through repeated rehearsals.","نيل وزملاؤه يستعدون للرحلة عبر التدريبات والبروفات المتكررة."),
        G("midnight-paris","57ea4688e516","Gil follows the strange invitation that appears on a Paris street at midnight.","جيل يتبع الدعوة الغريبة التي تظهر في شارع باريس عند منتصف الليل.")),
      T("Which direction would you follow in the next scene?","أيّ اتجاه تودّ متابعته في المشهد التالي؟",
        "A photographer arrives in a city during a train strike. The route she planned for the day is no longer possible.",
        "تصل مصوّرة إلى مدينة أثناء إضراب القطارات. يتعذّر عليها السير في الطريق الذي خططت له لذلك اليوم.",
        "She works out a replacement route around the places she meant to photograph.","ترسم مسارًا بديلًا حول الأماكن التي كانت تريد تصويرها.",
        "She follows a street musician into a neighbourhood she had not planned to visit.","تتبع عازفًا في الشارع إلى حيّ لم تكن تخطط لزيارته.")
    ],
    v14:[
      F("Which part of the dream job did you enjoy following more?","أيّ جزء من مهمة الحلم استمتعت بمتابعته أكثر؟",
        N("inception","inception-curator-frame-08.webp","Cobb explains the rules to Ariadne before the layers of the dream are built.","كوب يشرح لأريادني القواعد قبل أن تُبنى طبقات الحلم."),
        N("inception","inception-director-of-the-decade-2010s.webp","Arthur finds a new way to deal with the hotel when gravity changes unexpectedly.","آرثر يجد حلًا جديدًا حين تتغيّر الجاذبية داخل الفندق.")),
      F("Which response to the evacuation did you find more compelling?","أيّ استجابة لمأزق الإجلاء تابعتها باهتمام أكبر؟",
        G("dunkirk","22aec826112d","The soldiers keep working toward the evacuation from the long pier.","الجنود يواصلون السعي إلى الإجلاء عبر الرصيف الطويل."),
        G("dunkirk","c142fa338933","The civilian boat crew responds to people they encounter along the way.","طاقم القارب المدني يغيّر ما يفعله كلما صادف أشخاصًا يحتاجون إلى المساعدة.")),
      T("Which approach would you want the scene to show?","أيّ مقاربة تود أن تراها في المشهد؟",
        "During a performance, the lighting system stops working. The stage manager and the actors have only moments before the next act begins.",
        "أثناء عرض مسرحي تتعطل الإضاءة. لا يملك مدير المسرح والممثلون سوى لحظات قبل بداية الفصل التالي.",
        "They rearrange the scene around their original blocking and cues.","يعيدون ترتيب المشهد بما يحافظ على خطواته وإشاراته الأصلية.",
        "They try a different staging idea suggested by an actor on the spot.","يجرّبون فكرة عرض مختلفة اقترحها ممثل في اللحظة نفسها.")
    ],
    v20:[
      F("After the credits, which kind of rewatch appealed more?","بعد ظهور أسماء النهاية، أيّ نوع من إعادة المشاهدة شدّك أكثر؟",
        G("shutter-island","1d74bbe44ff5","Revisiting Teddy's earlier clues through the picture that emerges at the end.","العودة إلى قرائن تيدي السابقة بعد أن تتّضح صورة جديدة في النهاية."),
        G("certified-copy","d7642a874abb","Watching the couple again while keeping several readings of their relationship alive.","مشاهدة الثنائي مرة أخرى مع إبقاء أكثر من قراءة لعلاقتهما ممكنة.")),
      F("Which ending made you want to go back differently?","أيّ نهاية جعلتك تفكّر بالعودة إلى الفيلم بطريقة مختلفة؟",
        G("gone-girl","7e430863e325","Reconstructing the diary and the events in light of what is revealed.","إعادة ترتيب أحداث اليوميات على ضوء ما نعرفه لاحقًا."),
        G("challengers","ac5a6fa550aa","Reconsidering what the last tennis point could mean for each of the three characters.","إعادة تأمّل ما تعنيه نقطة التنس الأخيرة لكل واحد من الشخصيات الثلاث.")),
      T("How would you prefer to see the short film again?","كيف تفضّل أن تعيد مشاهدة هذا الفيلم القصير؟",
        "A film ends with a letter that might explain an absent character's actions. Earlier scenes contain small hints, but another interpretation remains possible.",
        "ينتهي فيلم برسالة قد تفسّر تصرفات شخصية غائبة. في مشاهده السابقة تلميحات صغيرة، لكن تفسيرًا آخر يبقى ممكنًا.",
        "Notice how each earlier scene fits the explanation in the letter.","ألاحظ كيف ينسجم كل مشهد سابق مع التفسير الموجود في الرسالة.",
        "Watch for other readings the letter leaves open.","أتابع القراءات الأخرى التي ما زالت الرسالة تتركها مفتوحة.")
    ],
    v27:[
      F("Which path into the unknown made you want to follow the character?","أيّ طريق نحو المجهول جعلك ترغب في متابعة الشخصية؟",
        G("dune-two","9503aa1ca9e8","Paul tries to make the events on Arrakis fit the future he sees before him.","بول يحاول أن يربط ما يحدث في أراكيس بالمستقبل الذي يراه أمامه."),
        G("poor-things","786b4d98eaed","Bella discovers another way to live each time she reaches a new city.","بيلا تكتشف طريقة أخرى للعيش كلما وصلت إلى مدينة جديدة.")),
      F("Which journey into something new did you enjoy following?","أيّ رحلة نحو شيء جديد استمتعت بمتابعتها أكثر؟",
        N("interstellar","interstellar-director-of-the-decade-2010s.webp","Cooper follows the mission's route toward the planets the probes identified.","كوبِر يتّبع مسار المهمة نحو الكواكب التي حدّدتها البعثات السابقة."),
        N("her","her-profile-train.jpg","Theodore lets his conversations with Samantha take him into experiences he did not expect.","ثيودور يترك أحاديثه مع سامنثا تأخذه إلى تجارب لم يتوقّعها.")),
      T("Which next step would keep you following the character?","أيّ خطوة تالية ستجعلك تواصل متابعة الشخصية؟",
        "A young musician is invited to another city. She has a song she wants to finish, but the invitation introduces her to a completely unfamiliar group.",
        "تُدعى موسيقية شابة إلى مدينة أخرى. لديها أغنية تريد إنهاءها، لكن الدعوة تعرّفها بفرقة لا تعرفها.",
        "She uses the trip to shape the song she already has in mind.","تستفيد من الرحلة لتصقل الأغنية التي تحملها في ذهنها.",
        "She plays with the new group to discover what other music might come out.","تعزف مع الفرقة الجديدة لتكتشف أيّ موسيقى أخرى قد تخرج منهما.")
    ],
    v33:[
      F("Which pursuit kept you wanting the next scene?","أيّ سعي جعلك ترغب في رؤية المشهد التالي؟",
        G("decision-leave","6487c019402c","Hae-jun returns to the mountain to piece together how the man fell.","هاي جون يعود إلى الجبل ليعيد تركيب ما حدث عند سقوط الرجل."),
        G("midnight-paris","95763893c637","Gil follows another encounter at midnight and discovers where it takes him.","جيل يتبع لقاءً جديدًا عند منتصف الليل ويكتشف إلى أين سيأخذه.")),
      F("Which way of looking for answers pulled you in?","أيّ طريقة في البحث عن الإجابة جذبتك أكثر؟",
        G("burning","e5c3eecf6fb5","Jong-su keeps returning to the greenhouses near his home to test Ben's story.","جونغ سو يعود مرارًا إلى البيوت الزراعية قرب منزله ليتحقق من حكاية بن."),
        G("your-name","9fd4286bb891","Taki and Mitsuha explore one another's lives through the mornings they wake up in different places.","تاكي وميتسوها يكتشفان حياة بعضهما كلما استيقظا في مكان مختلف.")),
      T("Which scene would you want the filmmaker to follow?","أيّ مشهد تتمنى أن تتبعه الكاميرا؟",
        "A teenager finds a recording made by her grandmother, with the name of an unfamiliar neighbourhood written on the cassette.",
        "تجد مراهقة تسجيلًا قديمًا لجدّتها، وقد كُتب على الشريط اسم حيّ لا تعرفه.",
        "She listens again, comparing the recording with old maps to work out where it was made.","تعيد الاستماع وتقارن التسجيل بالخرائط القديمة حتى تعرف مكانه.",
        "She walks through the neighbourhood and asks around to see where the stories lead.","تتجوّل في الحيّ وتسأل مَن تصادفهم لترى إلى أين تقودها الحكايات.")
    ],
    v39:[
      F("Which creative opportunity did you want to see unfold?","أيّ فرصة إبداعية تمنّيت أن ترى كيف تتطوّر؟",
        G("brutalist","eed8eaa69126","László tries to hold on to the building he has envisioned while negotiating with his patron.","لاسلو يحاول الحفاظ على المبنى الذي تصوّره أثناء تفاوضه مع مموله."),
        G("babylon","8e9a7c058328","Nellie finds her way onto a film set and makes an unexpected role her own.","نيللي تصل إلى موقع تصوير وتجعل من دور لم تتوقّعه فرصتها الخاصة.")),
      F("Which career path felt more interesting to follow?","أيّ مسار مهني كان أكثر إثارة لفضولك؟",
        G("steve-jobs","e7f8f40939ad","Jobs returns to the product vision he is trying to put on stage, despite obstacles.","جوبز يعود إلى تصوّره للجهاز الذي يريد عرضه على المسرح رغم العقبات."),
        G("worst-person","e63f6fe2708e","Julie tries a different direction whenever the life she imagined no longer fits.","جولي تجرّب اتجاهًا مختلفًا كلما لم تعد الحياة التي تخيّلتها تناسبها.")),
      T("Which opportunity would you keep watching?","أيّ فرصة تتمنى أن تتابعها الحكاية؟",
        "A designer is invited to share a studio with two artists. She can finish her planned exhibition there, or begin a collaboration she had not anticipated.",
        "تُدعى مصمّمة لمشاركة استديو مع فنانين. يمكنها أن تكمل معرضها المخطّط، أو تبدأ تعاونًا لم تكن تتوقّعه.",
        "She works with them to realize the exhibition she came there to make.","تتعاون معهم لإنجاز المعرض الذي جاءت من أجله.",
        "She lets their conversations open a different project none of them had planned.","تترك أحاديثهم تفتح مشروعًا مختلفًا لم يخطّط له أيّ منهم.")
    ],

    // A personal point of reference / the expectations and needs of others.
    v03:[
      F("Which character's reaction did you understand more immediately?","أيّ موقف من الشخصيتين فهمته أسرع؟",
        G("little-women","beae798b6eb0","Jo turns down Laurie rather than promise him a love she doesn't feel.","جو ترفض عرض لوري بدل أن تعِده بحبّ لا تشعر به."),
        G("moonlight","029a89b112da","Kevin cooks for Chiron and opens a conversation after years apart.","كيفن يطبخ لشيرون ويفتح بينهما حديثًا بعد سنوات من الانقطاع.")),
      F("Whose position in a difficult conversation felt more understandable?","أيّ موقف في الحديث الصعب تفهّمت دوافعه أكثر؟",
        G("worst-person","5abad2cf23d5","Julie tells Aksel she cannot keep living a life that no longer feels like hers.","جولي تخبر أكسل أنها لا تستطيع البقاء في حياة لم تعد تشعر أنها حياتها."),
        G("before-midnight","d938e569cad5","Céline wants Jesse's plans to take their shared life and her own responsibilities into account.","سيلين تريد من جيسي أن يحسب حساب حياتهما المشتركة ومسؤولياتها في خططه.")),
      T("Which character's choice made more sense to you?","أيّ تصرّف من الشخصيتين كان مفهومًا لك أكثر؟",
        "Two friends are invited to move away together. One has always dreamed of a different city; the other is thinking about how the move would affect the people they live with.",
        "يتلقى صديقان دعوة للانتقال معًا. كان أحدهما يحلم دائمًا بمدينة مختلفة، فيما يفكّر الآخر بمن يعيشون معهما وكيف سيؤثر الرحيل عليهم.",
        "The first friend is honest about wanting a different future, even if they go separately.","يصارح الأول صديقه بالمستقبل الذي يريده، حتى لو سيسافران كلٌّ بطريقه.",
        "The second sits with everyone involved to find a move they could all agree on.","يجلس الثاني مع المعنيّين ليجدوا قرار انتقال يمكنهم الاتفاق عليه.")
    ],
    v09:[
      F("Which decision made you understand why the character kept going?","أيّ قرار فهمت من خلاله لماذا واصلت الشخصية طريقها؟",
        N("whiplash","whiplash-2014-best-scene.webp","Andrew returns to the stage to play the performance he believes he can give.","أندرو يعود إلى المسرح ليعزف الأداء الذي يؤمن أنه قادر عليه."),
        G("1917","7878be975e9c","Schofield continues with the message because an entire battalion depends on it.","شوفيلد يواصل حمل الرسالة لأن كتيبة كاملة تعتمد على وصولها.")),
      F("Whose commitment made the story more compelling for you?","أيّ التزام من الشخصيتين جعل الحكاية أشدّ جذبًا لك؟",
        G("elvis","61b0749fc48c","Elvis insists on performing the music he believes in rather than letting his manager dictate it.","إلفيس يتمسّك بأداء الموسيقى التي يؤمن بها بدل أن يفرض مديره عليه ما يعزف."),
        G("drive-my-car","083ae3e36484","Kafuku persists with rehearsals so actors speaking different languages can perform together.","كافوكو يواصل البروفات حتى يتمكّن ممثلون بلغات مختلفة من الأداء معًا.")),
      T("Which ending to the rehearsal would you want to watch?","أيّ نهاية للبروفة تودّ مشاهدتها؟",
        "A band is preparing for its first show. The guitarist knows a difficult version of a solo; the other musicians have rehearsed a different arrangement together.",
        "تستعد فرقة لعرضها الأول. يجيد عازف الغيتار نسخة صعبة من مقطع منفرد، بينما تدرّب بقية العازفين معًا على توزيع مختلف.",
        "The guitarist plays the version that he has worked hard to make his own.","يعزف الغيتاريست النسخة التي عمل طويلًا حتى تصبح خاصة به.",
        "The guitarist joins the arrangement everyone rehearsed so the whole band stays together.","ينضم الغيتاريست إلى التوزيع الذي تدرّب عليه الجميع حتى تبقى الفرقة متناسقة.")
    ],
    v15:[
      F("Which artist's approach made you want to hear more of their story?","أيّ موقف لفنان جعلك ترغب في سماع حكايته أكثر؟",
        G("inside-llewyn-davis","519dc0d780d5","Llewyn keeps singing his own kind of folk music even when it brings him little success.","لوين يواصل غناء الموسيقى التي يؤمن بها رغم أنها لا تمنحه نجاحًا يُذكر."),
        G("drive-my-car","fa1f2432ebf0","Kafuku gives the cast time to find a shared performance through their different languages.","كافوكو يمنح الممثلين وقتًا ليجدوا أداءً مشتركًا رغم اختلاف لغاتهم.")),
      F("When Gustav proposes the film, whose response did you understand more?","حين طرح غوستاف مشروع فيلمه، أيّ موقف تفهّمته أكثر؟",
        G("sentimental-value","e98e1809600f","Nora declines the role her father wrote for her because she cannot make that choice for him.","نورا ترفض الدور الذي كتبه لها أبوها، فلا تستطيع أن تقبله من أجل رغبته وحدها."),
        G("sentimental-value","138cdc242f1f","Agnes keeps talking with her sister and father as the project brings old family tensions back.","أغنيس تبقى على تواصل مع أختها وأبيها حين يعيد المشروع خلافات العائلة القديمة.")),
      T("Whose decision would you have liked the story to explore?","أيّ قرار كنت تحب أن تتوسّع الحكاية في متابعته؟",
        "A filmmaker has cut a quiet ending for her first feature. Her collaborators think a different ending would better reflect the story they made together.",
        "تختار مخرجة نهاية هادئة لفيلمها الأول. يعتقد زملاؤها أن نهاية أخرى تعبّر بصورة أفضل عن الحكاية التي صنعوها معًا.",
        "She keeps the ending she believes expresses what she wanted to say.","تُبقي النهاية التي ترى أنها تعبّر عمّا كانت تريد قوله.",
        "She revisits the cut with the others to find an ending they can all recognize as theirs.","تعود إلى المونتاج مع الآخرين ليجدوا نهاية يشعرون جميعًا بأنها تخصّهم.")
    ],
    v21:[
      F("Which moment of change felt more understandable?","أيّ لحظة تغيير فهمتها أكثر؟",
        G("worst-person","5abad2cf23d5","Julie tells Aksel that she cannot continue their relationship simply because it seems like the right life.","جولي تصارح أكسل بأنها لا تستطيع مواصلة العلاقة لمجرد أنها تبدو حياة مناسبة."),
        G("inside-out","9752c2d58ea6","Riley returns home and finally shares with her parents how much she misses her old life.","رايلي تعود إلى البيت وتشارك والديها أخيرًا كم تفتقد حياتها القديمة.")),
      F("Which turning point made you feel the character was finally being heard?","أيّ نقطة تحوّل شعرت عندها بأن الشخصية عبّرت عمّا يهمّها؟",
        N("her","her-the-cruellest-month-award-hd.webp","Samantha explains to Theodore that the life she is discovering no longer fits the one he imagined for them.","سامنثا تشرح لثيودور أن الحياة التي تكتشفها لم تعد تناسب الحياة التي تخيّلها لهما."),
        G("coco","ebf4c0b25370","Miguel shares the song that reconnects his family with Mamá Coco's memories.","ميغيل يشارك عائلته الأغنية التي تعيد إليها ذكريات ماما كوكو.")),
      T("Which scene would feel like a turning point to you?","أيّ مشهد سيبدو لك نقطة تحوّل؟",
        "A woman has come home after years abroad. Her relatives expect her to stay; she has been thinking about a very different next chapter.",
        "تعود امرأة إلى بيتها بعد سنوات في الخارج. يتوقّع أقاربها أن تبقى، لكنها تفكّر بفصل مختلف جدًا من حياتها.",
        "She tells them the life she genuinely wants, even though they expected something different.","تصارحهم بالحياة التي تريدها فعلاً رغم اختلافها عما توقعوه.",
        "She asks them to speak about what each person needs before they decide how to live near one another.","تطلب أن يتحدثوا عما يحتاجه كل واحد قبل أن يقرروا كيف سيعيشون قرب بعضهم.")
    ],
    v28:[
      F("Which character's next choice felt more important to their story?","أيّ اختيار لاحق بدا أهمّ لحكاية الشخصية عندك؟",
        G("black-swan","fbf37b01b7d2","Nina returns to her role determined to reach the performance she has always imagined.","نينا تعود إلى دورها مصمّمة على بلوغ الأداء الذي تخيّلته."),
        G("manchester","3032282aa5cd","Lee works out a way for Patrick to stay among the people and places he knows.","لي يحاول إيجاد ترتيب يسمح لباتريك بالبقاء بين أهله وأماكنه المألوفة.")),
      F("At the reunion, whose way of dealing with the past did you understand more?","عند اللقاء بعد الغياب، أيّ طريقة للتعامل مع الماضي تفهّمتها أكثر؟",
        G("past-lives","3d1ea1b03cbd","Nora tries to understand what her old connection means for the life she has chosen.","نورا تحاول أن تفهم معنى صلتها القديمة بالنسبة للحياة التي اختارتها."),
        G("past-lives","e4f0cc49cb54","Arthur makes room for Nora and Hae Sung to meet, while talking honestly with her about their life together.","آرثر يترك مجالًا للقاء نورا وهاي سونغ ويتحدث معها بصراحة عن حياتهما المشتركة.")),
      T("Which decision would you rather see play out?","أيّ قرار تودّ أن ترى كيف يتطوّر؟",
        "A painter and a friend are asked to make a mural for a neighbourhood. The painter has a design she has carried for years, while residents have shared stories they want on the wall.",
        "يُطلب من رسّامة وصديقتها رسم جدارية لحيّ. تحمل الرسّامة تصميمًا فكّرت فيه لسنوات، وشارك سكان الحيّ حكايات يريدون أن تظهر على الجدار.",
        "She paints the image she has been trying to express for years.","ترسم الصورة التي تحاول التعبير عنها منذ سنوات.",
        "She listens to the residents and develops the design with the people who will live beside it.","تستمع إلى السكان وتطوّر التصميم مع الأشخاص الذين سيعيشون إلى جواره.")
    ],
    v34:[
      F("When the disagreement gets difficult, whose position did you want to understand better?","حين يصعب الخلاف، أيّ موقف أردت أن تفهمه أكثر؟",
        N("tar","tar-2022-best-scene-cinematic-r2.webp","Lydia holds to her own way of reading a piece of music during her exchange with the student.","ليديا تتمسّك بطريقتها في قراءة المقطوعة أثناء نقاشها مع الطالب."),
        G("before-midnight","d938e569cad5","Céline presses Jesse to consider the sacrifices and responsibilities both have in their family.","سيلين تطالب جيسي بأن يأخذ تضحياتهما ومسؤولياتهما داخل الأسرة بالحسبان.")),
      F("Whose way of finding a place in the story stayed with you?","أيّ طريق لإيجاد مكان في الحكاية بقي معك؟",
        G("master","20fec8db618c","Freddie eventually refuses to build his life entirely around Dodd's movement.","فريدي يرفض في النهاية أن يبني حياته كلها حول جماعة دود."),
        G("beale-street","770b8ed3ef51","Tish's family chooses to face her situation with her rather than leave her to handle it alone.","عائلة تيش تختار أن تواجه ظرفها معها بدل تركها تتعامل معه وحدها.")),
      T("Which response to the family meeting would you understand faster?","أيّ استجابة في الاجتماع العائلي تفهّمتها أسرع؟",
        "Three siblings are deciding what to do with the house where they grew up. Each has a different memory of it and a different life now.",
        "يقرر ثلاثة إخوة ماذا يفعلون بالبيت الذي نشؤوا فيه. لكل واحد ذكريات مختلفة عنه وحياة مختلفة الآن.",
        "One explains the choice she cannot bring herself to make, even if the others prefer it.","تشرح إحداهم القرار الذي لا تستطيع قبوله لنفسها حتى لو فضّله الآخرون.",
        "Another invites each sibling to say what they need so they can reach an agreement together.","يدعو آخر كلّ أخ إلى قول ما يحتاجه حتى يصلوا إلى اتفاق معًا.")
    ],
    v40:[
      F("Which journey made you more curious about the character's next step?","أيّ رحلة جعلتك أكثر فضولًا تجاه خطوة الشخصية التالية؟",
        G("a-complete-unknown","c9909295710b","Dylan takes his electric guitar onto the Newport stage despite what his folk audience expected.","ديلان يصعد إلى مسرح نيوبورت بغيتاره الكهربائي رغم ما كان يتوقعه جمهور الفولك."),
        G("beale-street","30bcca813b79","Tish and her family keep working together to support Fonny and the life ahead of them.","تيش وعائلتها يواصلون العمل معًا لدعم فوني والحياة التي تنتظرهم.")),
      F("Which choice gave the character's journey more meaning for you?","أيّ اختيار منح رحلة الشخصية وزنًا أكبر عندك؟",
        N("la-la-land","la-la-land-best-original-score-2010s.webp","Sebastian keeps pursuing the jazz club he has imagined for himself.","سيباستيان يظلّ يسعى إلى نادي الجاز الذي تخيّله لنفسه."),
        G("coco","4d5ec7cdd437","Miguel finds a way for his music to have a place in the life of his family.","ميغيل يجد طريقة لتكون لموسيقاه مساحة داخل حياة عائلته.")),
      T("Which chapter would you choose to keep watching?","أيّ فصل من الحكاية ترغب في مواصلة مشاهدته؟",
        "A young writer is offered a place in a magazine run by old friends. She has a personal manuscript, and the friends hope to build an issue around a shared subject.",
        "تُدعى كاتبة شابة إلى مجلة يديرها أصدقاء قدامى. لديها مخطوطة شخصية، ويأمل أصدقاؤها بناء عدد حول موضوع مشترك.",
        "She devotes her time to the manuscript she has wanted to write for years.","تكرّس وقتها للمخطوطة التي رغبت بكتابتها منذ سنوات.",
        "She works with the editors on the issue they can all stand behind.","تعمل مع المحرّرين على العدد الذي يمكن للجميع أن يقفوا وراءه.")
    ],

    // Notice concrete traces / see a connection between moments and meanings.
    v04:[
      F("Which of K's discoveries stayed with you after the film?","أيّ أثر في رحلة كي بقي معك بعد الفيلم؟",
        G("blade-runner","566ae3cc3ab2","The date carved into the root of the dead tree at the farm.","التاريخ المحفور على جذر الشجرة اليابسة في المزرعة."),
        N("blade-runner","blade-runner-2049-ceremony-cinematography.webp","K's encounter with the giant Joi advertisement, and what it suggests about being unique.","لقاء كي بإعلان جوي العملاق، وما يوحي به عن معنى أن يكون إنسانًا متفرّدًا.")),
      F("Which clue made you reconsider Hae-mi's disappearance?","أيّ أثر جعلك تعيد التفكير في اختفاء هيمي؟",
        G("burning","1dd0e8729437","The pink watch in Ben's drawer that resembles the one Jong-su gave Hae-mi.","الساعة الوردية في درج بن، الشبيهة بالساعة التي أعطاها جونغ سو لهيمي."),
        G("burning","e5c3eecf6fb5","Ben's account of burning greenhouses, and the meaning it takes on after Hae-mi vanishes.","حكاية بن عن إحراق البيوت الزراعية، والمعنى الذي تأخذه بعد اختفاء هيمي.")),
      T("Which clue would make you return to the story?","أيّ أثر يجعلك تعود إلى الحكاية؟",
        "In a short film, a traveller keeps finding an unfamiliar photograph in different rooms of an old hotel. In one room the clock has stopped.",
        "في فيلم قصير يجد مسافر صورة غريبة تتكرر في غرف فندق قديم، وفي إحدى الغرف ساعة متوقفة.",
        "The exact time on the stopped clock and where the photograph was found.","الوقت المحدّد على الساعة ومكان العثور على الصورة.",
        "The repeated photograph and the possibility that the rooms belong to different memories of the same place.","تكرار الصورة واحتمال أن تكون الغرف ذكريات مختلفة للمكان نفسه.")
    ],
    v10:[
      F("Which sequence did you find yourself replaying in your mind?","أيّ تسلسل وجدت نفسك تعيده في ذهنك؟",
        G("dunkirk","c142fa338933","The crowded boat, the water around it and the soldiers' attempts to stay aboard.","القارب المكتظ والماء من حوله ومحاولات الجنود البقاء على متنه."),
        G("tenet","cf4940d52b81","The highway sequence as two versions of the action unfold in opposite directions of time.","مطاردة الطريق حين يبدو أن نسختين من الحدث تسيران في اتجاهين للزمن.")),
      F("Which image would you want to look at again?","أيّ مشهد ترغب في النظر إليه مرة أخرى؟",
        G("drive","b0c4c2687a87","The driver in the city at night, the movement of the car and the changing street lights.","السائق في المدينة ليلًا، حركة السيارة وتغيّر أضواء الشوارع."),
        N("inception","inception-best-picture-2010s.webp","Paris folding back on itself as Ariadne discovers a world inside a dream.","باريس تنطوي على نفسها حين تكتشف أريادني عالمًا داخل الحلم.")),
      T("Which part of the sequence would you rewind?","أيّ جزء من التسلسل ستعيده؟",
        "A short film shows a crowded station twice. We first follow a woman through the platform, and later see a man passing through it at a different time.",
        "يعرض فيلم قصير محطة مزدحمة مرتين. نتابع أولًا امرأة تعبر الرصيف، ثم رجلًا يمرّ به في وقت مختلف.",
        "The route she takes through the crowd and the objects left beside the platform.","الطريق الذي تسلكه وسط الزحام والأشياء المتروكة بجوار الرصيف.",
        "The moment the two journeys seem to fit together, even though we saw them separately.","اللحظة التي تبدو فيها الرحلتان متصلتين رغم أننا شاهدناهما منفصلتين.")
    ],
    v16:[
      F("Which image did you keep thinking about after watching?","أيّ صورة ظللت تفكّر بها بعد المشاهدة؟",
        N("phantom-thread","phantom-thread-best-actor-curator.webp","The fabric, measurements and gestures of Reynolds fitting a dress to Alma.","القماش والقياسات وحركات رينولدز وهو يضبط فستانًا لألما."),
        G("tree-life","0a21e827f768","The way the images of nature and the universe sit beside Jack's childhood memories.","الطريقة التي تجاور بها صور الطبيعة والكون ذكريات طفولة جاك.")),
      F("Which element of the film's visual world held your attention?","أيّ جزء من عالم الفيلم البصري استوقفك أكثر؟",
        G("brutalist","7ed204da4bda","The shape of László's building, its concrete surfaces and the light entering it.","شكل مبنى لاسلو وسطوحه الخرسانية والضوء الداخل إليه."),
        G("certified-copy","f72caa429049","The way the couple's changing identities echo the film's question about originals and copies.","كيف يتبدّل تصوّرنا لهوية الثنائي بما يعيدنا إلى سؤال الفيلم عن الأصل والنسخة.")),
      T("What would you remember most clearly from the scene?","أيّ شيء من المشهد سيبقى أوضح في ذاكرتك؟",
        "An older tailor teaches a girl to alter a coat that once belonged to her mother. The film later shows the same coat hanging in an empty doorway.",
        "يعلّم خيّاط مسنّ فتاة كيف تعدّل معطفًا كان لأمها. يعرض الفيلم لاحقًا المعطف نفسه معلقًا عند باب فارغ.",
        "His hands working through the cloth, its texture and the small changes to the seams.","يداه وهما تعملان بالقماش، ملمسه والتغييرات الصغيرة في الخياطة.",
        "How the coat comes to stand for their different memories of the girl's mother.","كيف صار المعطف يحمل ذكريات مختلفة لديهما عن أمّ الفتاة.")
    ],
    v22:[
      F("Which trace made the investigation more interesting to you?","أيّ أثر جعل التحقيق أكثر إثارة لفضولك؟",
        G("prisoners","8d01f6b15efd","The camper the girls had approached and the objects the police find around it.","العربة التي اقتربت منها الطفلتان والأشياء التي تجدها الشرطة حولها."),
        G("shutter-island","1d74bbe44ff5","The repeated images of Teddy's past that begin to change how the island's mystery is understood.","صور ماضي تيدي المتكررة التي تبدأ بتغيير فهمنا للغز الجزيرة.")),
      F("Which connection would you go back to look at?","أيّ أثر تودّ العودة إليه؟",
        G("batman","64e9559efd7e","The actual clues and written messages the Riddler leaves behind.","الآثار والرسائل المكتوبة التي يتركها ريدلر وراءه."),
        G("nocturnal-animals","38f6d83ab89a","The resemblance between Edward's invented story and the things Susan remembers about him.","التشابه بين الحكاية التي ألّفها إدوارد وما تتذكّره سوزان عنه.")),
      T("Which clue would you want the next scene to revisit?","أيّ أثر تتمنى أن تعود له الحكاية في المشهد التالي؟",
        "A man discovers a sealed box in his late aunt's room. It contains a key and a drawing of a bridge that has already appeared in his aunt's letters.",
        "يعثر رجل على صندوق مغلق في غرفة عمّته الراحلة. بداخله مفتاح ورسم لجسر ظهر من قبل في رسائلها.",
        "The key, the exact room where it was hidden and what can be found there.","المفتاح والغرفة التي خُبّئ فيها وما يمكن العثور عليه هناك.",
        "Why the same bridge keeps appearing whenever she writes about leaving home.","لماذا يتكرر رسم الجسر كلما كتبت عمّته عن مغادرة البيت؟")
    ],
    v29:[
      F("Which moment of discovery made you want to experience it again?","أيّ لحظة اكتشاف جعلتك ترغب في عيشها من جديد؟",
        G("first-man","5e32f7d2040e","The sounds, shaking and close views from inside the capsule during Neil's flight.","أصوات واهتزازات المركبة واللقطات القريبة داخلها أثناء رحلة نيل."),
        G("arrival","54850167fb2b","The images of Louise's daughter that change the way earlier moments in her story fit together.","صور ابنة لويز التي تغيّر الطريقة التي نربط بها لحظات حكايتها السابقة.")),
      F("Which part of the sequence did you return to in your mind?","أيّ جزء من المشهد عدت إليه في ذهنك؟",
        N("whiplash","whiplash-2014-best-film-editing-hd.webp","Andrew's hands, the drum hits and the way the tempo changes during the final performance.","حركة يدي أندرو وضربات الطبل وتغيّر الإيقاع أثناء العزف الأخير."),
        N("interstellar","interstellar-composer-of-the-decade-2010s.webp","The watch that begins to connect Cooper's journey with a moment in Murph's life.","الساعة التي تبدأ بربط رحلة كوبِر بلحظة من حياة مورف.")),
      T("Which part of the discovery would you remember?","أيّ جزء من لحظة الاكتشاف سيبقى معك؟",
        "A girl looks through a telescope for the first time while her grandfather tells her stories about the stars he saw as a child.",
        "تنظر فتاة عبر تلسكوب للمرة الأولى بينما يحكي جدّها عن النجوم التي رآها عندما كان طفلًا.",
        "The shift in the bright point when she turns the lens and the view comes into focus.","تغيّر النقطة المضيئة حين تدير العدسة وتتّضح الرؤية.",
        "The thought that she is looking at the same light her grandfather saw decades before.","فكرة أنها تنظر إلى الضوء نفسه الذي رآه جدّها قبل عقود.")
    ],
    v35:[
      F("Which sequence stays more vivid when you remember the film?","أيّ تسلسل يبقى أكثر حضورًا حين تتذكّر الفيلم؟",
        G("1917","eaf64409575d","Schofield moving through the ruined town at night as light and shadows change around him.","شوفيلد يعبر المدينة المهدّمة ليلًا والضوء والظلال يتغيّران حوله."),
        G("your-name","a798d92c3874","The comet scenes that make the two characters' different days fit into a new timeline.","مشاهد المذنّب التي تجعل أيام الشخصيتين المختلفة تلتقي في خط زمني جديد.")),
      F("Which part of the storytelling would you want to revisit?","أيّ جزء من سرد الحكاية ترجع إليه؟",
        G("steve-jobs","e7f8f40939ad","The stage, backstage rooms and exact countdown before the product goes on display.","المسرح والكواليس والوقت المتبقي قبل عرض الجهاز."),
        G("drive-my-car","5e5185bdf1d1","The repeated recording of Oto's voice that takes on a different meaning during each drive.","تسجيل صوت أوتو المتكرر الذي يكتسب معنى مختلفًا مع كل جولة بالسيارة.")),
      T("Which part of this film would you notice during a second viewing?","أيّ جزء من هذا الفيلم ستلاحظه في المشاهدة الثانية؟",
        "We see a father cross a bridge in the morning. Years later the film follows his daughter along the same bridge, holding a letter he left for her.",
        "نرى أبًا يعبر جسرًا في الصباح. بعد سنوات يتبع الفيلم ابنته على الجسر نفسه، وهي تحمل رسالة تركها لها.",
        "The layout of the bridge, the time of day and what has physically changed.","شكل الجسر ووقت النهار والأشياء التي تبدّلت فيه.",
        "The way the two crossings might be answering one another across the years.","الطريقة التي يبدو بها العبوران كأن أحدهما يجيب الآخر عبر السنين.")
    ],
    v41:[
      F("What stayed with you when you thought back on Sophie and Calum's holiday?","حين عدت بالتفكير إلى عطلة صوفي وكالوم، أيّ شيء بقي معك؟",
        G("aftersun","84066d7615e3","The ordinary holiday details: the hotel, the pool, and the moments Sophie's camera captures.","تفاصيل العطلة اليومية: الفندق والمسبح واللحظات التي تلتقطها كاميرا صوفي."),
        G("aftersun","72464abb1057","The interrupted dance images that connect adult Sophie to fragments of her father's memory.","صور الرقص المتقطّعة التي تربط صوفي البالغة بشظايا ذكرياتها عن أبيها.")),
      F("When you remember the family home, which part of the film comes back first?","حين تتذكّر بيت العائلة، أيّ جزء من الفيلم يعود إليك أولًا؟",
        G("sentimental-value","138cdc242f1f","The familiar rooms and objects surrounding the sisters when they meet again.","الغرف والأشياء المألوفة التي تحيط بالأختين حين تجتمعان من جديد."),
        G("sentimental-value","bd0d8f5872aa","The sense that the house itself holds the memories and silences of several generations.","الإحساس بأن البيت نفسه يحمل ذكريات وصمت أكثر من جيل.")),
      T("Which image would still stay with you after the credits?","أيّ صورة ستظل معك بعد ظهور أسماء النهاية؟",
        "A woman watches home videos from a holiday with her father, then sits in the present-day room where she has been replaying them.",
        "تشاهد امرأة تسجيلات منزلية لعطلة قضتها مع أبيها، ثم تجلس في غرفتها الحالية وقد أعادت مشاهدة التسجيلات.",
        "The places, gestures and small objects captured in the old footage.","الأماكن والحركات والأغراض الصغيرة التي التقطها التسجيل القديم.",
        "The relationship between the repeated images on the tape and her life in the present.","الرابط بين الصور المتكررة في الشريط وحياتها في الحاضر.")
    ],

    // Which argument or consequence gives a difficult decision its weight?
    v05:[
      F("Which argument did you find yourself listening to more closely?","أيّ حديث وجدت نفسك تصغي له باهتمام أكبر؟",
        G("moneyball","bfedc35b3850","Billy and Peter argue for a player whose numbers tell a different story from the scouts' opinions.","بيلي وبيتر يدافعان عن لاعب تظهر أرقامه صورة مختلفة عمّا يراه الكشّافون."),
        G("before-midnight","d938e569cad5","Céline explains to Jesse what a move to the United States would mean for their life together.","سيلين تشرح لجيسي ماذا سيعني الانتقال إلى أمريكا لحياتهما المشتركة.")),
      F("During the dispute over Facebook, which claim stuck with you?","في خلاف فيسبوك، أيّ حجة ظلّت معك؟",
        G("social-network","fcc747353fa4","The argument over what each founder contributed and how ownership should be calculated.","الجدل حول مساهمة كل مؤسس وكيف ينبغي حساب حصته في الشركة."),
        G("social-network","1d0735d6be58","Eduardo's account of what being excluded meant for his friendship with Mark.","حديث إدواردو عمّا يعنيه استبعاده بالنسبة لصداقته مع مارك.")),
      T("Which explanation would you want the short film to give more time to?","أيّ تفسير تتمنى أن يمنحه الفيلم القصير وقتًا أطول؟",
        "A local cinema has money for only one of two programmes: a popular season that will cover its costs, or a season made with people whose stories have rarely been shown.",
        "لا يملك سينما الحيّ تمويلًا إلا لبرنامج واحد: موسم شعبي يغطي تكاليفها، أو موسم عن أناس نادرًا ما تُعرض حكاياتهم.",
        "The manager shows how the first programme could keep the cinema running next year.","يشرح المدير كيف يمكن للبرنامج الأول أن يُبقي السينما مفتوحة العام المقبل.",
        "A filmmaker explains why the second programme matters to the people whose stories were left out.","يشرح مخرج لماذا يهمّ البرنامج الثاني أصحاب الحكايات التي لم تجد مساحة للظهور.")
    ],
    v11:[
      F("Which conversation did you wish would continue a little longer?","أيّ حوار تمنّيت أن يستمرّ قليلًا بعد المشهد؟",
        G("anatomy-fall","8afccac0786c","The questions that test whether Sandra's testimony fits the other accounts of the fall.","الأسئلة التي تختبر مدى توافق شهادة ساندرا مع بقية الروايات عن السقوط."),
        G("drive-my-car","15f9b08307e7","Kafuku and Misaki speak about the people they lost and what they have carried since.","كافوكو وميساكي يتحدثان عمّن فقداه وما حملاه معهما منذ ذلك الحين.")),
      F("Which person's explanation did you want to hear more fully?","أيّ تفسير من الشخصيتين أردت سماعه بصورة أكمل؟",
        G("steve-jobs","d21fec966bf2","The debate backstage about what must work before the computer can be presented.","نقاش الكواليس حول ما يجب أن يعمل في الحاسوب قبل تقديمه للجمهور."),
        G("sentimental-value","e98e1809600f","Nora's resistance to a role written by a father whose absence still matters to her.","رفض نورا لدور كتبه أب ما زال غيابه يعني لها الكثير.")),
      T("Which part of the conversation would you stay for?","أيّ جزء من الحوار ستظل تصغي إليه؟",
        "A director wants to include an old recording in a documentary. The producer says its date and attribution may be wrong; a family member says the recording is precious to them.",
        "يريد مخرج إدراج تسجيل قديم في وثائقي. يقول المنتج إن تاريخه ونسبه قد يكونان خاطئين، ويقول أحد أفراد العائلة إن التسجيل عزيز عليهم.",
        "Working out whether the recording really belongs to the event the film describes.","التحقّق مما إذا كان التسجيل يعود حقًا إلى الحدث الذي يرويه الفيلم.",
        "Hearing why the family has kept the recording for so many years.","الاستماع إلى سبب احتفاظ العائلة بالتسجيل طوال هذه السنين.")
    ],
    v17:[
      F("When Lucy considers her two paths, which part of the choice felt more important?","حين تفكّر لوسي بطريقيها، أيّ جزء من الاختيار كان أهمّ عندك؟",
        G("materialists","75e23a462e98","The stable life with Harry that fits the practical criteria Lucy works with every day.","الحياة المستقرّة مع هاري التي تناسب الشروط العملية التي تعتمدها لوسي في عملها."),
        G("materialists","df4e0ec7db82","The history Lucy shares with John that a list of dating criteria cannot express.","التاريخ الذي يجمع لوسي بجون ولا تستطيع قوائم شروط المواعدة التعبير عنه.")),
      F("Which argument about the next planet did you understand more readily?","في جدال الطاقم حول الكوكب التالي، أيّ حجة تفهّمتها أسرع؟",
        N("interstellar","interstellar-director-of-the-decade-2010s.webp","Cooper argues for Mann's planet because the available readings look more promising.","كوبِر يدافع عن كوكب مان لأن القراءات المتاحة تبدو أكثر وعدًا."),
        G("interstellar","f26b16f38f8a","Brand believes her connection to Edmunds may point to something their measurements cannot settle.","براند ترى أن صلتها بإدموندز قد تدلّها على شيء لا تحسمه قياساتهم.")),
      T("Which argument would hold your attention during the decision?","أيّ حجة ستستوقفك أثناء اتخاذ القرار؟",
        "Two friends are choosing a home for a parent who needs company. One apartment is close to essential services; in the other the parent has neighbours they have known for decades.",
        "يختار صديقان مسكنًا لأب يحتاج إلى الصحبة. إحدى الشقق قريبة من الخدمات الأساسية، وفي الأخرى جيران عرفهم الأب منذ عقود.",
        "The friend compares the distances, facilities and daily costs of both homes.","يقارن أحد الصديقين المسافات والتسهيلات والتكاليف اليومية للمسكنين.",
        "The other recalls the neighbours who were there for the parent during difficult years.","يذكّر الآخر بالجيران الذين وقفوا مع الأب خلال سنواته الصعبة.")
    ],
    v23:[
      F("During the Juilliard class, which part of the Bach discussion made you pause?","في نقاش جوليارد عن باخ، أيّ جزء من الحديث استوقفك؟",
        N("tar","tar-2022-decade-card-hd.webp","Lydia's argument for listening to the music on its own terms, apart from the composer's life.","حجة ليديا في الاستماع إلى المقطوعة بذاتها، بعيدًا عن سيرة مؤلّفها."),
        N("tar","tar-2022-best-scene-cinematic-r2.webp","Max's objection that a composer's history affects what listening to the work means to him.","اعتراض ماكس بأن تاريخ المؤلّف يؤثر في معنى استماعه إلى العمل.")),
      F("What gave the conversation about originals and copies its weight for you?","في حديث الأصل والنسخة، أيّ جانب منح الحوار وزنه عندك؟",
        G("certified-copy","d7642a874abb","James's argument that a copy can be appreciated as a work in its own right.","حجة جيمس بأن النسخة يمكن أن تستحق التقدير بذاتها."),
        G("certified-copy","8ae6fa8585f4","The way Elle's feelings and personal memories change the value of what the two encounter.","كيف تغيّر مشاعر إل وذكرياتها الشخصية قيمة الأشياء التي يصادفانها.")),
      T("Which part of their conversation would you pay more attention to?","أيّ جزء من حديثهما ستمنحه انتباهًا أكبر؟",
        "Two museum visitors stop before a portrait. One wants to discuss the painter's technique and the rules the picture breaks; the other recognizes the pose of someone dear to them.",
        "يتوقف زائران لمتحف أمام لوحة. يريد أحدهما مناقشة طريقة الرسام والقواعد التي خالفها، أما الآخر فيتعرّف في وضعية الشخصية على شخص عزيز عليه.",
        "How the work is put together and why its unusual choices succeed.","كيف بُنيت اللوحة ولماذا نجحت اختيارات الرسّام غير المألوفة.",
        "How the portrait changes meaning when someone recognizes their own experience in it.","كيف يتغيّر معنى اللوحة حين يجد شخص تجربته الخاصة فيها.")
    ],
    v30:[
      F("Which part of the dilemma did you want the film to explore more?","أيّ جانب من المعضلة تمنّيت أن يتوسّع الفيلم في استكشافه؟",
        G("brutalist","776fd30deb70","László struggling to realize his building within the money and demands of the project.","لاسلو يحاول تنفيذ مبناه ضمن ميزانية المشروع ومطالبه."),
        N("her","her-curator-dossier-cover-20261126.webp","Theodore struggling with what love means when Samantha's experience of it differs from his.","ثيودور يحاول فهم معنى الحب حين تختلف تجربة سامنثا له عن تجربته.")),
      F("As Paul's position changes on Arrakis, which argument remained with you?","حين تغيّر موقع بول في أراكيس، أيّ حجة ظلّت معك؟",
        G("dune-two","9503aa1ca9e8","Paul's view of the political alliances needed to change what happens to Arrakis.","نظرة بول إلى التحالفات السياسية اللازمة لتغيير مصير أراكيس."),
        G("dune-two","2d93d8411283","Chani's concern for what those choices will mean to the people she loves and belongs to.","قلق تشاني مما ستعنيه هذه الاختيارات لمن تحبّهم وتنتمي إليهم.")),
      T("Which consideration would make the scene worth watching?","أيّ جانب سيجعل هذا المشهد مهمًا بالنسبة لك؟",
        "An architect must redesign a small library so construction can stay within the available budget. The librarian has worked there for years and wants to keep the room where children learn to read.",
        "على مهندس إعادة تصميم مكتبة صغيرة حتى يبقى البناء ضمن الميزانية. أمينة المكتبة تعمل فيها منذ سنوات وتريد الحفاظ على القاعة التي يتعلّم فيها الأطفال القراءة.",
        "How the architect solves the problem of space, cost and materials.","كيف يحلّ المهندس مشكلة المساحة والكلفة والمواد.",
        "Why the room matters to the librarian and the children who use it.","لماذا تعني القاعة الكثير لأمينة المكتبة والأطفال الذين يستخدمونها.")
    ],
    v36:[
      F("Which conversation's reasoning stayed with you?","أيّ حديث ظلّ منطقه أو معناه معك؟",
        G("social-network","e6cc78d91090","Mark explaining which contribution he believes gives someone a stake in the company.","مارك يشرح أيّ مساهمة يرى أنها تمنح صاحبها حصة في الشركة."),
        G("past-lives","3d1ea1b03cbd","Nora trying to explain inyeon and what her old connection with Hae Sung means in the life she has now.","نورا تحاول شرح معنى إنيون وصلتها القديمة بهاي سونغ في حياتها الحالية.")),
      F("Which part of Hae-jun's dilemma did you want the film to dwell on?","أيّ جانب من معضلة هاي جون تمنّيت أن يتوقّف الفيلم عنده أكثر؟",
        G("decision-leave","6487c019402c","Whether the evidence he uncovers supports the way he intends to resolve the investigation.","هل تؤيّد الأدلة التي يكتشفها الطريقة التي ينوي أن يحسم بها التحقيق؟"),
        G("decision-leave","60443240fc66","What that resolution means for Seo-rae and the relationship he has formed with her.","ما الذي يعنيه حسم القضية لسيو راي وللعلاقة التي نشأت بينهما؟")),
      T("Which part would you be more interested in hearing?","أيّ جانب ستكون مهتمًا بسماعه أكثر؟",
        "A teacher must decide whether a pupil who broke a rule can return to a school performance. The school has handled similar cases before, but this pupil has a difficult story behind the incident.",
        "على معلمة أن تقرّر ما إذا كان طالب خالف قاعدةً يستطيع العودة إلى عرض المدرسة. واجهت المدرسة حالات مشابهة من قبل، لكن وراء ما فعله الطالب حكاية صعبة.",
        "How the school could make a decision consistent with the earlier cases.","كيف يمكن للمدرسة أن تتخذ قرارًا يتوافق مع الحالات السابقة.",
        "What the experience meant for the pupil and the other people involved.","ما الذي عنته التجربة للطالب وللأشخاص الآخرين المعنيين.")
    ],
    v42:[
      F("Which justification did you most want to understand?","أيّ تعليل تمنّيت أن تفهمه أكثر؟",
        G("first-man","5e32f7d2040e","Neil assesses what the instruments and the changing conditions mean for the flight.","نيل يحاول فهم ما تعنيه قراءات الأجهزة والظروف المتغيّرة للرحلة."),
        G("banshees","c39e788b6e05","Pádraic asks why kindness and friendship should matter less than leaving a musical legacy.","بارديك يتساءل لماذا ينبغي أن يكون اللطف والصداقة أقلّ قيمة من ترك إرث موسيقي.")),
      F("Which part of Oppenheimer's story made you want to hear more?","أيّ جانب من حكاية أوبنهايمر جعلَك ترغب في سماع المزيد؟",
        G("oppenheimer","dda30e4fb329","The scientists' discussion of what their calculations can and cannot establish before the test.","حديث العلماء عمّا يمكن لحساباتهم إثباته وما لا تستطيع إثباته قبل التجربة."),
        G("oppenheimer","36136be2799c","What the achievement comes to mean to Oppenheimer when he faces its human consequences.","ما الذي صار يعنيه الإنجاز لأوبنهايمر حين واجه عواقبه على الناس.")),
      T("Which explanation would you ask the story to give more room?","أيّ تفسير تتمنى أن تعطيه الحكاية مساحة أكبر؟",
        "An editor is deciding whether to remove a scene from a documentary. The scene makes the timeline harder to follow, but the person in it says it captures the one thing they wanted the audience to know.",
        "يقرر مونتير ما إذا كان سيحذف مشهدًا من وثائقي. يجعل المشهد متابعة التسلسل أصعب، لكن صاحبه يقول إنه ينقل أهمّ ما كان يريد أن يعرفه الجمهور.",
        "The editor's explanation of how removing it would make the story clearer and more consistent.","شرح المونتير كيف يجعل حذفه الحكاية أوضح وأكثر تماسكًا.",
        "The person's explanation of why being heard in that moment matters to them.","شرح صاحب المشهد لماذا يعينه أن يسمعه الناس في تلك اللحظة.")
    ],
  };
  // Independent narrative interests: a viewer can read the two short film
  // premises without asserting that they have watched either work.
  const motives=[
    [1,G("beale-street","30bcca813b79","Tish and her family stand by Fonny and try to clear his name.","تيش وعائلتها يقفون إلى جانب فوني ويحاولون إثبات براءته."),
     5,G("arrival","f175e61dd888","Louise tries to decipher the visitors' language before anyone gives up on communicating.","لويز تحاول فهم لغة الزوّار قبل أن يتخلّى أحد عن محاولة التواصل.")],
    [2,G("manchester","3032282aa5cd","Lee looks for a way to care for Patrick after his brother dies.","لي يحاول إيجاد طريقة لرعاية باتريك بعد وفاة أخيه."),
     6,G("first-man","8d3e9c25aca3","Neil's crew learns to rely on one another before a journey none of them has made.","طاقم نيل يتعلّم الاعتماد على بعضه قبل رحلة لم يخضها أيّ منهم.")],
    [3,N("whiplash","whiplash-2014-best-scene.webp","Andrew trains toward the performance he dreams of giving.","أندرو يتدرّب للوصول إلى الأداء الذي يحلم بتقديمه."),
     7,G("worst-person","3eff7d793d86","Julie keeps trying different lives until she can discover what she wants.","جولي تجرّب حيوات مختلفة حتى تكتشف ما تريده.")],
    [4,G("souvenir","746d2137fb9e","Julie tries to make her own film and find an artistic voice within a difficult relationship.","جولي تحاول صنع فيلمها والعثور على صوتها الفني وسط علاقة صعبة."),
     8,G("monte-cristo","c1916cbb2000","Edmond wants to reclaim the direction of his life after years of captivity.","إدمون يريد استعادة زمام حياته بعد سنوات من الأسر.")],
    [5,G("shutter-island","125fd22c056a","Teddy follows an unexplained disappearance inside the island hospital.","تيدي يتتبّع اختفاءً غامضًا داخل مستشفى الجزيرة."),
     9,G("drive-my-car","15f9b08307e7","Kafuku and Misaki share their pasts and search for a way to live with their loss.","كافوكو وميساكي يتشاركان ماضيهما ويبحثان عن طريقة للعيش مع الفقد.")],
    [6,G("interstellar","b9fb250ec832","Cooper tries to keep his promise to Murph across a journey into the unknown.","كوبِر يحاول الوفاء بوعده لمورف خلال رحلة إلى المجهول."),
     1,G("sicario","a0c45a771947","Kate tries to hold to the rules she believes in as the operation challenges them.","كيت تحاول التمسّك بالقواعد التي تؤمن بها حين تضعها المهمة موضع اختبار.")],
    [7,G("midnight-paris","57ea4688e516","Gil discovers a different life every time Paris takes him into its past.","جيل يكتشف حياة مختلفة كلما أخذته باريس إلى ماضيها."),
     2,G("coco","ebf4c0b25370","Miguel wants music to reconnect his family with memories they have nearly lost.","ميغيل يريد أن تعيد الموسيقى عائلته إلى ذكريات كادت تضيع.")],
    [8,G("blade-runner","f056e964c4f9","K begins to choose what his life will mean beyond the role assigned to him.","كي يبدأ بتقرير معنى حياته أبعد من الدور المفروض عليه."),
     3,G("moneyball","8ddebb02bf15","Billy tries to prove his team can succeed by building it in an unfamiliar way.","بيلي يحاول إثبات أن فريقه يستطيع النجاح بطريقة بناء غير مألوفة.")],
    [9,G("past-lives","2eae8eda3731","Nora returns to the life she has made while making peace with a life she might have lived.","نورا تتصالح مع الحياة التي كان يمكن أن تعيشها ومع حياتها التي اختارتها."),
     4,G("little-women","a4ccfd3b4261","Jo turns her family's story into a book that carries her own voice.","جو تحوّل حكاية عائلتها إلى كتاب يحمل صوتها الخاص.")]
  ];
  // Art-only choices deliberately carry no cognitive interpretation.
  const taste={
    v06:[N("her","her-curator-dossier-cover-20261126.webp","",""),N("phantom-thread","phantom-thread-best-actor-curator.webp","","")],
    v18:[N("blade-runner","blade-runner-2049-best-cinematography.webp","",""),G("tree-life","0a21e827f768","","")],
    v25:[G("nightcrawler","dec6cfc96be5","",""),G("manchester","902461f3df56","","")],
    v37:[G("babylon","e1d6d2120cd5","",""),N("asteroid-city","asteroid-city-film-file.webp","","")],
    "a-taste-pace":[G("tree-life","fea1724cc691","The quiet rhythm of this film.","إيقاع هذا الفيلم الهادئ."),N("whiplash","whiplash-2014-best-scene.webp","The urgent rhythm of this film.","إيقاع هذا الفيلم المتسارع.")]
  };
  const ratings={
    v12:[N("la-la-land","la-la-land-silent-ending-curator.webp","",""),G("little-women","a4ccfd3b4261","","")],
    v24:[G("aftersun","72464abb1057","",""),G("manchester","902461f3df56","","")],
    v31:[G("challengers","ac5a6fa550aa","",""),G("past-lives","2eae8eda3731","","")],
    v43:[G("decision-leave","b2ebf8b4959b","",""),G("anatomy-fall","8afccac0786c","","")],
    "a-rating-1":[G("souvenir","6bd2fc5f9daa","",""),G("tree-life","fea1724cc691","","")],
    "a-rating-2":[G("tenet","cf4940d52b81","",""),N("inception","inception-best-opening-sequence-hd.webp","","")],
    "a-rating-3":[G("moonlight","029a89b112da","",""),G("before-midnight","e88cc2872562","","")]
  };
  // Text-only refinement uses story beats, never a request to describe oneself.
  const refinement=[
    ["od",1,T("Which final scene would you choose?","أيّ مشهد أخير ستختار؟",
      "A father and daughter discover their small shop has closed unexpectedly. Each thinks the other knew it would happen.",
      "يكتشف أب وابنته أن متجرهما الصغير أُغلق فجأة. يظن كلّ منهما أن الآخر كان يعرف بما سيحدث.",
      "They find out what will happen to the shop and its remaining stock.","يعرفان ماذا سيحدث للمتجر وما تبقّى فيه.",
      "They sit together and say why they felt the other had kept a secret from them.","يجلسان معًا ويقولان لماذا شعر كلّ منهما أن الآخر أخفى عنه الأمر.")],
    ["od",2,T("Where should the next scene take us?","إلى أين تتمنى أن يأخذنا المشهد التالي؟",
      "Two musicians reach a concert hall to find the performance cancelled and their name missing from a programme. They disagree about what happened.",
      "يصل موسيقيان إلى قاعة حفل فيجدان العرض ملغى واسمهما غائبًا عن البرنامج. يختلفان في فهم ما حدث.",
      "Backstage, to learn why the show was cancelled and what has replaced it.","إلى الكواليس لنعرف لماذا أُلغي العرض وما الذي حلّ محله.",
      "Into their conversation about the years they have supported and disappointed each other.","إلى حديثهما عن السنوات التي ساندا وخذلا فيها أحدهما الآخر.")],
    ["observer",1,T("Which path would you want the story to take?","أيّ طريق تتمنّى أن تسلكه الحكاية؟",
      "A librarian finds a map inside an old novel. She has a theory about the person who drew it, but new books in the collection suggest other routes.",
      "تجد أمينة مكتبة خريطة داخل رواية قديمة. لديها تصوّر عمّن رسمها، لكن كتبًا أخرى في المكتبة تشير إلى مسارات مختلفة.",
      "She follows the route that best fits the inscriptions and dates already on the map.","تتبع الطريق الذي يتفق أكثر مع الكتابات والتواريخ الموجودة على الخريطة.",
      "She opens the other books and follows the different stories they suggest.","تفتح الكتب الأخرى وتتبع الحكايات المختلفة التي تشير إليها.")],
    ["observer",2,T("Which continuation is more interesting?","أيّ استكمال للحكاية يشدّك أكثر؟",
      "A cook prepares a dish from a family recipe. The market no longer has one of the main ingredients, but there are several things she has never used before.",
      "تُعد طباخة طبقًا من وصفة عائلية. لم تعد تجد أحد مكوّناته في السوق، لكن هناك عدة أشياء لم تستخدمها من قبل.",
      "She changes the recipe just enough to preserve the dish she remembers.","تعدّل الوصفة بالقدر الذي يحافظ على الطبق الذي تتذكّره.",
      "She experiments with the unfamiliar ingredients and discovers a new dish.","تجرّب المكوّنات غير المألوفة وتكتشف طبقًا جديدًا.")],
    ["decider",1,T("Which part of the story would make the character feel understood?","أيّ جزء من الحكاية سيجعلك تتفهّم الشخصية أكثر؟",
      "A singer is asked to enter a competition with a group. The group has already agreed on the song, but she has her own song ready.",
      "تُدعى مغنّية لدخول مسابقة مع فرقة. اتفقت الفرقة على الأغنية، لكن لديها أغنية من تأليفها جاهزة.",
      "She tells them why she needs to sing the piece that represents her.","تشرح لهم لماذا تحتاج أن تغنّي القطعة التي تعبّر عنها.",
      "She listens to why the group chose its song and finds her part within it.","تستمع لسبب اختيار الفرقة أغنيتها وتجد دورها ضمنها.")],
    ["decider",2,T("Whose decision would you want to understand more?","أيّ قرار تتمنى أن تفهمه أكثر؟",
      "A family prepares a book of their late mother's photographs. One sibling has a particular image that means something only to them; another wants each person to be represented.",
      "تعد عائلة كتابًا عن صور أمهم الراحلة. لأحد الإخوة صورة ذات معنى خاص بالنسبة إليه، بينما يريد الآخر أن يظهر فيه كل فرد.",
      "One insists the image that captures their own memory should remain.","يتمسّك أحدهم ببقاء الصورة التي تعبّر عن ذاكرته الخاصة.",
      "The other works through everyone's memories to decide on the pictures together.","يستمع الآخر إلى ذكريات الجميع ليختاروا الصور معًا.")],
    ["sn",1,T("Which image would you rewind?","أيّ صورة ستعيد النظر إليها؟",
      "A short film shows a railway worker collecting the same yellow flowers every week, then years later shows a child holding them at an abandoned station.",
      "يعرض فيلم قصير عامل قطار يجمع الزهور الصفراء نفسها أسبوعيًا، ثم يظهر بعد سنوات طفل يحملها عند محطة مهجورة.",
      "The platform, the shape and colour of the flowers, and where the worker picked them.","الرصيف وشكل الزهور ولونها والمكان الذي جمعها منه العامل.",
      "The way the flowers connect the worker's everyday life to the child's story years later.","الطريقة التي تربط بها الزهور حياة العامل اليومية بحكاية الطفل بعد سنوات.")],
    ["sn",2,T("Which part of the memory would you keep thinking about?","أيّ جزء من الذكرى سيبقى في ذهنك؟",
      "Two old photographs show the same street: one from a childhood celebration and one from a later rainy evening.",
      "تُظهر صورتان قديمتان الشارع نفسه: إحداهما من احتفال في الطفولة والأخرى من مساء ماطر بعد سنوات.",
      "The shop signs, the people in the street and the changes to the buildings.","لافتات المحلات والناس في الشارع والتغيّرات في المباني.",
      "How seeing the street twice suggests what the character has gained and lost over the years.","كيف توحي رؤية الشارع مرتين بما كسبته الشخصية وفقدته عبر السنين.")],
    ["tf",1,T("Which conversation deserves more time in the film?","أيّ حوار يستحقّ وقتًا أطول في الفيلم؟",
      "Two colleagues are asked to choose one person for a scholarship. One applicant has the strongest record; the other has faced obstacles that the record does not show.",
      "يُطلب من زميلين اختيار شخص لمنحة. أحد المتقدمين يملك سجلًا دراسيًا أقوى، والآخر واجه عقبات لا يُظهرها سجله.",
      "The colleagues examine why the selection criteria were set and how each applicant meets them.","يفحص الزميلان لماذا وُضعت شروط الاختيار وكيف يستوفيها كلّ متقدم.",
      "They hear what the scholarship would mean in each applicant's actual life.","يستمعان إلى ما ستعنيه المنحة في حياة كلّ متقدم الفعلية.")],
    ["tf",2,T("Which explanation would you keep listening to?","أيّ تفسير ستستمرّ بالاستماع إليه؟",
      "A composer is choosing between two recordings. One is technically polished; the other contains the last performance of a musician who has since left the group.",
      "يختار مؤلف موسيقي بين تسجيلين. أحدهما متقن تقنيًا، والآخر يتضمن الأداء الأخير لعازف غادر الفرقة منذ ذلك الحين.",
      "Why the cleaner recording allows the whole arrangement to be heard clearly.","لماذا يجعل التسجيل الأنظف توزيع المقطوعة مسموعًا بوضوح.",
      "What the musician's last performance means to the people who played with them.","ما الذي يعنيه أداء العازف الأخير لمن شاركوه العزف.")],
  ];
  // Counterframe remains a separate reading. Its alternatives now also
  // refer to specific scenes rather than transplanting generic labels.
  const pressure={
    cf01:[
      F("Which of these unresolved moments felt more unsettling?","أيّ لحظة من هاتين اللحظتين كانت أشدّ قلقًا عندك؟",
        G("shutter-island","1d74bbe44ff5","Teddy finds himself drawn into an account of the island that seems to explain everything.","تيدي يجد نفسه أمام رواية عن الجزيرة تبدو كأنها تفسّر كل شيء."),
        G("burning","1dd0e8729437","Ben speaks about Hae-mi without giving Jong-su a way to settle what happened.","بن يتحدّث عن هيمي دون أن يمنح جونغ سو جوابًا يحسم ما حدث.")),
      F("Which uncertainty would have been harder to sit with?","أيّ غموض كان أصعب عليك في المشاهدة؟",
        G("arrival","f175e61dd888","Louise's interpretation of the visitors' messages begins to change the whole mission.","تفسير لويز لرسائل الزوّار يبدأ بتغيير المهمة بأكملها."),
        G("certified-copy","d7642a874abb","James and Elle keep shifting the story we believe about who they are to each other.","جيمس وإل يغيّران باستمرار الحكاية التي نصدّقها عن علاقتهما.")),
      T("Which moment in the story feels more uncomfortable?","أيّ لحظة في الحكاية تبدو أشدّ إرباكًا؟","A woman receives two conflicting descriptions of the last day of a journey with an old friend.","تتلقى امرأة روايتين متعارضتين عن اليوم الأخير من رحلة مع صديق قديم.","One account seems to explain everything, and she can no longer escape it.","إحدى الروايتين تبدو كأنها تفسّر كل شيء ولا تستطيع تجاوزها.","Both accounts remain possible, with no way to tell which one explains it.","تبقى الروايتان ممكنتين دون وسيلة لمعرفة أيهما تفسّر ما حدث.")
    ],
    cf02:[
      F("Which everyday scene wore you out more to watch?","أيّ مشهد يومي شعرت أنه أكثر استنزافًا أثناء مشاهدته؟",
        N("phantom-thread","phantom-thread-ceremony-best-actor.webp","Every small disturbance at Reynolds's breakfast table upsets his routine.","كل إزعاج صغير عند مائدة رينولدز يربك روتينه."),
        G("uncut-gems","a0ed9d432d9e","Howard has to keep responding to calls, customers and interruptions as they pile up.","هاورد يواجه المكالمات والزبائن والمقاطعات كلما تراكمت عليه.")),
      F("Which kind of day would have been harder to endure in the story?","أيّ يوم في الحكايتين بدا أصعب احتمالًا؟",
        G("first-man","8d3e9c25aca3","The days of rehearsing the same flight procedures before the mission.","أيام التدريب على الإجراءات نفسها قبل الرحلة."),
        G("babylon","8e9a7c058328","The frantic film set where a new problem appears before the previous one is solved.","موقع التصوير المضطرب حيث تظهر مشكلة قبل حلّ السابقة.")),
      T("Which day would feel longer to watch?","أيّ يوم سيبدو أطول وأثقل في المشاهدة؟","Two new employees join a small restaurant on its busiest week.","ينضم موظفان جديدان إلى مطعم صغير خلال أسبوعه الأكثر ازدحامًا.","One must repeat the same detailed preparation every morning.","على أحدهما تكرار التحضير الدقيق نفسه كل صباح.","The other must respond to each new request as it comes through the door.","وعلى الآخر التعامل مع كل طلب جديد حال وصوله.")
    ],
    cf03:[
      F("Which demand in the classroom or rehearsal felt more uncomfortable?","أيّ مطالبة في الصف أو البروفة كانت أشد إرباكًا لك؟",
        N("tar","tar-2022-best-scene-cinematic-r2.webp","Lydia asks the student to defend why their argument about Bach holds together.","ليديا تطالب الطالب بتبرير حجّته عن باخ."),
        N("whiplash","whiplash-2014-best-antagonist.webp","Fletcher demands that Andrew's playing meet the tempo he has set.","فليتشر يطالب أندرو بأن يطابق عزفه الإيقاع الذي حدّده.")),
      F("Which way of being challenged would feel harder in these scenes?","أيّ طريقة للاعتراض على الشخصية تبدو أصعب في هذين المشهدين؟",
        G("social-network","1d0735d6be58","Eduardo must account for each part of his version of the Facebook dispute.","على إدواردو تفسير تفاصيل روايته لخلاف فيسبوك."),
        G("moneyball","84420302a893","Peter's methods have to justify themselves through the team's actual results.","على طريقة بيتر أن تثبت جدواها بنتائج الفريق الفعلية.")),
      T("Which moment would make the character more uneasy to watch?","أيّ لحظة تجعل مشاهدة الشخصية أكثر توتّرًا؟","Two architects present work to a panel before an exhibition.","يعرض مهندسان عملهما على لجنة قبل معرض.","The first panel asks the architect to explain every contradiction in the design.","تطلب اللجنة من الأول تفسير التناقضات في تصميمه.","The second panel tests whether the building meets the required cost and capacity.","تختبر اللجنة الثانية ما إذا كان المبنى يفي بالكلفة والسعة المطلوبة.")
    ],
    cf04:[
      F("Which expectation on the character was harder for you to watch?","أيّ توقّع فُرض على الشخصية كان أصعب عليك في المشاهدة؟",
        G("little-women","beae798b6eb0","Jo has to say what she truly feels when Laurie expects an answer.","على جو أن تصرّح بما تشعر به حقًا حين ينتظر لوري جوابها."),
        G("coco","6030fe350d6f","Miguel has to face his family's insistence on giving up music.","على ميغيل مواجهة إصرار عائلته على ترك الموسيقى.")),
      F("Which moment of personal pressure stayed with you?","أيّ لحظة من الضغط الشخصي بقيت معك؟",
        G("worst-person","5abad2cf23d5","Julie has to explain why the life she is living no longer feels right to her.","على جولي شرح لماذا لم تعد الحياة التي تعيشها تبدو مناسبة لها."),
        G("before-midnight","d938e569cad5","Céline and Jesse must answer for what their choices mean to the rest of their family.","على سيلين وجيسي أن يواجها ما تعنيه اختياراتهما لبقية الأسرة.")),
      T("Which part of the scene feels more constraining?","أيّ جزء من المشهد يبدو أشدّ تقييدًا؟","A young painter is asked to leave home for a residency abroad.","تُدعى رسّامة شابة إلى مغادرة البيت للإقامة في مكان فني خارج البلاد.","She has to decide whether the opportunity really means what she wants for herself.","عليها تحديد ما إذا كانت الفرصة تعني حقًا ما تريده لنفسها.","She has to hear what her decision would mean to the people depending on her.","عليها سماع ما سيعنيه قرارها للأشخاص الذين يعتمدون عليها.")
    ],
    cf05:[
      F("Which path would feel more unsettling as the character's future opens?","أيّ طريق يبدو أكثر إرباكًا حين ينفتح مستقبل الشخصية؟",
        G("dune-two","667d21014e1f","The future everyone expects Paul to fulfil begins to dictate his direction.","المستقبل الذي ينتظر الجميع من بول تحقيقه يبدأ بفرض اتجاهه عليه."),
        G("poor-things","786b4d98eaed","Every new city offers Bella another direction in which to take her life.","كل مدينة جديدة تفتح أمام بيلا اتجاهًا آخر لحياتها.")),
      F("Which direction in the story felt harder to live with?","أيّ اتجاه في الحكاية يبدو أصعب التعايش معه؟",
        N("inception","inception-curator-frame-14.webp","Cobb's attempt to finish the job is constrained by the idea he cannot let go of.","محاولة كوب لإنهاء المهمة يقيّدها ما لا يستطيع التخلّي عنه."),
        G("midnight-paris","95763893c637","Each night in Paris gives Gil another life he could imagine choosing.","كل ليلة في باريس تمنح جيل حياة أخرى يمكن أن يتخيّل اختيارها.")),
      T("Which ending to the opening act makes you more uneasy?","أيّ نهاية للفصل الأول تبدو أشدّ قلقًا؟","A traveller is asked to choose a route before a long journey.","يُطلب من مسافر اختيار الطريق قبل رحلة طويلة.","Everyone expects one particular route to become the only possible path.","يتوقع الجميع أن يصير طريق محدّد هو الطريق الوحيد الممكن.","Every encounter opens another route and the destination keeps moving.","يفتح كل لقاء طريقًا آخر وتظل الوجهة تتغيّر.")
    ],
    cf06:[
      F("Which challenge in the journey was harder to watch?","أيّ تحدّ في الرحلتين كان أصعب عليك في المشاهدة؟",
        G("first-man","5e32f7d2040e","Neil has to rely on the procedures and preparations he has practised.","على نيل الاعتماد على الإجراءات والاستعدادات التي تدرّب عليها."),
        G("dunkirk","22aec826112d","The waiting soldiers must respond to what happens around them as it unfolds.","على الجنود المنتظرين الاستجابة لما يجري حولهم في اللحظة نفسها.")),
      F("Which demand on the character felt heavier?","أيّ مطلب من الشخصية بدا أشدّ وطأة؟",
        N("phantom-thread","phantom-thread-best-actor-curator.webp","The fitting must respect the exact measurements Reynolds expects.","على جلسة القياس أن تطابق الأبعاد الدقيقة التي ينتظرها رينولدز."),
        G("1917","eaf64409575d","Schofield must respond to the unexpected circumstances around him on the journey.","على شوفيلد الاستجابة للظروف المفاجئة من حوله أثناء الرحلة.")),
      T("Which situation would feel harder to sit through?","أيّ موقف سيكون أصعب في المشاهدة؟","A theatre technician works on two different shows.","يعمل تقني مسرح في عرضين مختلفين.","The first requires following a long sequence of rehearsed cues without variation.","يتطلب الأول اتّباع تسلسل طويل من الإشارات المتدرّب عليها دون تغيير.","The second requires dealing with new interruptions as the performance unfolds.","يتطلب الثاني التعامل مع مقاطعات جديدة أثناء العرض.")
    ],
    cf07:[
      F("Which demand in these work scenes felt more uncomfortable?","أيّ مطلب في مشهدي العمل بدا أكثر إرباكًا؟",
        G("oppenheimer","f767eb35f8da","Oppenheimer has to confront a question about what his reasoning can truly establish.","على أوبنهايمر مواجهة سؤال حول ما يستطيع استدلاله إثباته حقًا."),
        G("steve-jobs","e7f8f40939ad","The computer has to work for the audience when the launch begins.","على الحاسوب أن يعمل أمام الجمهور حين يبدأ الإطلاق.")),
      F("Which kind of challenge felt more difficult in the story?","أيّ نوع من التحدي بدا أصعب في الحكاية؟",
        G("anatomy-fall","8afccac0786c","Sandra has to explain where two descriptions of the same event contradict each other.","على ساندرا توضيح مواضع التعارض بين روايتين للحدث نفسه."),
        G("brutalist","eed8eaa69126","László has to keep the building within the costs his patron will accept.","على لاسلو أن يُبقي المبنى ضمن التكاليف التي يقبلها مموله.")),
      T("Which demand makes the scene more tense for you?","أيّ مطلب يجعل المشهد أشدّ توتّرًا عندك؟","A director shows a prototype film to two producers.","يعرض مخرج نموذج فيلمه على منتجين.","One questions whether his explanation of the plot makes sense from start to finish.","يسأله أحدهما ما إذا كان تفسيره للحبكة متماسكًا من البداية للنهاية.","The other expects the current version to fit the deadline and budget.","ويتوقع الآخر أن تفي النسخة الحالية بالموعد والميزانية.")
    ],
    cf08:[
      F("Which moment in a close relationship felt harder to watch?","أيّ لحظة في علاقة مقرّبة كانت أصعب عليك؟",
        G("banshees","c39e788b6e05","Colm holds to his own priorities even when it costs him his longest friendship.","كولم يتمسّك بأولوياته حتى حين يكلّفه ذلك صداقته الطويلة."),
        G("before-midnight","d938e569cad5","Jesse and Céline are forced to face what their relationship requires from both of them.","يُضطر جيسي وسيلين لمواجهة ما تتطلّبه علاقتهما من كلّ منهما.")),
      F("Which emotional choice felt more constraining?","أيّ اختيار عاطفي بدا أشدّ تقييدًا؟",
        G("materialists","152585c3f057","Lucy has to face what she actually wants from her own life.","على لوسي مواجهة ما تريده حقًا من حياتها."),
        G("past-lives","e4f0cc49cb54","Nora and Arthur must talk about where Hae Sung fits into their relationship.","على نورا وآرثر الحديث عن مكان هاي سونغ داخل علاقتهما.")),
      T("Which moment feels harder in the story?","أيّ لحظة تبدو أصعب في الحكاية؟","Two friends have planned to move together, but they have grown in different directions.","خطّط صديقان للانتقال معًا، لكن حياتيهما أخذتا تتجهان في طريقين مختلفين.","One must name the wish she cannot compromise on.","على إحداهما تسمية الرغبة التي لا يمكنها التنازل عنها.","The other must try to reconcile what both people need now.","على الأخرى محاولة التوفيق بين ما تحتاجانه الآن.")
    ],
    cf09:[
      F("Which way of watching the unresolved ending creates more tension for you?","أيّ طريقة لمتابعة النهاية المعلّقة تثير توتّرًا أكبر عندك؟",
        G("decision-leave","b2ebf8b4959b","Hae-jun's reading of the case begins to narrow around his relationship with Seo-rae.","قراءة هاي جون للقضية تبدأ بالاتّجاه نحو علاقته بسيو راي."),
        N("inception","inception-best-original-screenplay.webp","The final spinning top leaves the viewer with more than one possible reading.","تترك لقطة البلبل الأخيرة أمام المشاهد أكثر من قراءة ممكنة.")),
      F("Which mystery would feel harder to leave unresolved?","أيّ لغز تجد تركه معلّقًا أصعب؟",
        G("prisoners","8d01f6b15efd","The search begins to revolve around a particular piece of evidence.","البحث يبدأ بالدوران حول قرينة معيّنة."),
        G("certified-copy","8ae6fa8585f4","The couple's conversations keep more than one account of their past alive.","حوارات الثنائي تُبقي أكثر من رواية عن ماضيهما ممكنة.")),
      T("Which final shot would feel more unsettling?","أيّ لقطة أخيرة ستكون أشدّ إرباكًا؟","A visitor completes a search for a missing letter. An old photograph changes how he understands the search.","ينهي زائر بحثه عن رسالة مفقودة. تغيّر صورة قديمة فهمه لرحلة البحث.","The photograph makes every previous scene seem to point to one answer.","تجعل الصورة كل المشاهد السابقة تبدو كأنها تشير إلى إجابة واحدة.","The photograph opens two different explanations that the film never settles.","تفتح الصورة تفسيرين مختلفين لا يحسمهما الفيلم.")
    ],
    cf10:[
      F("Which working environment felt more exhausting to watch?","أيّ بيئة عمل بدت أكثر استنزافًا في المشاهدة؟",
        G("black-swan","7c4faeeb597c","Nina has to repeat the choreography until every detail is right.","على نينا تكرار حركات الرقص حتى تصيب كلّ تفصيلة."),
        G("babylon","8e9a7c058328","The crew has to keep adjusting as the set changes around them.","على الطاقم مواصلة التكيّف كلما تغيّر موقع التصوير حولهم.")),
      F("Which day of work would have felt harder?","أيّ يوم عمل بدا أصعب احتمالًا؟",
        N("phantom-thread","phantom-thread-best-actor-curator.webp","Reynolds expects each fitting to follow the same exact standard.","رينولدز يتوقّع أن تتّبع كل جلسة قياس معياره الدقيق نفسه."),
        G("uncut-gems","97ebc4313fb1","Howard must switch between demands that appear without warning.","على هاورد الانتقال بين مطالب تظهر من دون إنذار.")),
      T("Which kind of rehearsal seems more demanding?","أيّ بروفة تبدو أشدّ تطلّبًا؟","Two actors prepare for a live radio play.","يستعد ممثلان لعرض إذاعي مباشر.","One repeats the same lines until each pause matches the director's cue.","يكرر أحدهما الأسطر نفسها حتى تطابق كل وقفة إشارة المخرج.","The other has to react whenever a performer changes the timing unexpectedly.","وعلى الآخر التكيّف كلما غيّر ممثل توقيت كلامه بصورة مفاجئة.")
    ],
    cf11:[
      F("Which way of being evaluated felt more difficult in these scenes?","أيّ طريقة للتقييم بدت أصعب في هذين المشهدين؟",
        G("anatomy-fall","8afccac0786c","Sandra's account is examined for contradictions in what she is saying.","تُفحص رواية ساندرا بحثًا عن تناقضات في كلامها."),
        G("moneyball","8ddebb02bf15","Billy's choices are evaluated by the team's results on the field.","تُقيّم اختيارات بيلي بنتائج الفريق على أرض الملعب.")),
      F("Which kind of judgement made you more uneasy?","أيّ نوع من الحكم بدا أشد إرباكًا لك؟",
        N("tar","tar-2022-alt-02.webp","The musical argument must withstand another person's questions about its reasoning.","على الحجة الموسيقية أن تصمد أمام أسئلة شخص آخر حول منطقها."),
        G("social-network","0cb81c0c8ad8","Facebook's growth becomes a visible measure of whether the enterprise is succeeding.","يصير نمو فيسبوك مقياسًا ظاهرًا لمدى نجاح المشروع.")),
      T("Which review would feel more difficult for the character?","أيّ مراجعة ستكون أصعب بالنسبة للشخصية؟","Two engineers are asked to defend their work at a meeting.","يُطلب من مهندسين الدفاع عن عملهما في اجتماع.","One is pressed to explain how each part of the proposed design makes sense with the others.","يُضغط على أحدهما ليشرح كيف ينسجم كلّ جزء من التصميم مع الأجزاء الأخرى.","The other is judged on whether the finished design meets the promised results.","ويُحكم على الآخر وفق ما إذا كان تصميمه النهائي يحقق النتائج الموعودة.")
    ],
    cf12:[
      F("Which artistic expectation felt more constraining?","أيّ توقع فنّي بدا أشدّ تقييدًا؟",
        G("inside-llewyn-davis","519dc0d780d5","Llewyn has to face whether his music still means what he wants it to mean.","على لوين مواجهة ما إذا كانت موسيقاه ما زالت تعبّر عمّا يريد."),
        G("drive-my-car","083ae3e36484","Kafuku's performers need to find a common rhythm across the group's different voices.","على ممثلي كافوكو إيجاد إيقاع مشترك وسط أصوات الفرقة المختلفة.")),
      F("Which artistic pressure would feel harder in the film?","أيّ ضغط فنّي يبدو أصعب في الفيلم؟",
        G("a-complete-unknown","c9909295710b","Dylan has to decide whether he can keep playing in the way the audience associates with him.","على ديلان تحديد ما إذا كان يستطيع مواصلة العزف بالطريقة التي اعتادها جمهوره."),
        N("la-la-land","la-la-land-best-actress-curator.webp","Mia and Sebastian have to reckon with what their two artistic journeys require of their life together.","على ميا وسيباستيان مواجهة ما تتطلّبه رحلتاهما الفنيّتان من حياتهما المشتركة.")),
      T("Which pressure feels stronger in the rehearsal?","أيّ ضغط يبدو أقوى في البروفة؟","A director and performers are preparing a final scene for a small festival.","يستعد مخرج وممثلون لمشهد أخير في مهرجان صغير.","The director is asked whether the ending really says what he believes his film should say.","يُطلب من المخرج أن يحدّد ما إذا كانت النهاية تعبّر عما يريد قوله في فيلمه حقًا.","The cast has to find a version that the entire group feels able to perform together.","على فريق التمثيل إيجاد نسخة يشعر الجميع بأنهم قادرون على تقديمها معًا.")
    ],
  };
  D.cinemaSceneBank={coins,refinement,motives,taste,ratings,pressure,G,N,F,T};
})();
