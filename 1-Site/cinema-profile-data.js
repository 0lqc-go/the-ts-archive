(() => {
  "use strict";

  const l = (en, ar) => ({ en, ar });
  const axes = {
    oi: { od: .8, observer: 1 },
    oe: { od: .8, observer: -1 },
    di: { od: -.8, decider: 1 },
    de: { od: -.8, decider: -1 },
    o: { od: 1 },
    d: { od: -1 }
  };

  function film(id, title, year, genres, tags, en, ar, poster = "", director = "", still = "") {
    return { id, title, year, genres: genres.split(" "), tags: tags.split(" ").filter(Boolean),
      description: l(en, ar), poster, director, still };
  }

  // Editorial tags are hypotheses about the films' content. They are used for
  // comparing preferences and recommendations, never for assigning a film a type.
  const films = [
    film("inception", "Inception", 2010, "scifi thriller action", "puzzle nonlinear control time suspense stylized ambiguous-ending", "A specialist enters layered dreams to carry out an ambitious plan.", "مختص يدخل طبقات من الأحلام لتنفيذ خطة طموحة.", "inception-poster.webp"),
    film("dark-knight", "The Dark Knight", 2008, "crime action thriller", "ethics duty justice systems intense suspense plot closed", "A city and its protector face a challenge to their moral limits.", "مدينة وحاميها يواجهان تحديًا لحدودهما الأخلاقية."),
    film("prestige", "The Prestige", 2006, "drama mystery thriller", "obsession ambition control puzzle nonlinear truth intense bleak closed", "Two rival magicians devote their lives to outdoing each other.", "ساحران متنافسان يكرسان حياتهما للتفوق أحدهما على الآخر."),
    film("forrest", "Forrest Gump", 1994, "drama romance comedy", "discovery familyBond love memory growth warm bittersweet episodic hopeful-ending", "An unexpected life unfolds through changing times and relationships.", "حياة غير متوقعة تتشكل عبر أزمنة وعلاقات متغيرة."),
    film("truman", "The Truman Show", 1998, "drama comedy scifi", "identity freedom truth discovery systems symbolism hopeful character closed", "A man gradually questions the world he has always known.", "رجل يبدأ تدريجيًا بالتشكيك في العالم الذي اعتاد عليه."),
    film("good-will", "Good Will Hunting", 1997, "drama romance", "identity growth relationship selfWorth character psychological warm hopeful-ending", "A gifted young man confronts the possibilities and limits of his life.", "شاب موهوب يواجه إمكانات حياته وحدودها."),
    film("shawshank", "The Shawshank Redemption", 1994, "drama crime", "control friendship freedom hope memory character hopeful-ending closed", "Two prisoners form a lasting friendship within a restrictive institution.", "سجينان يبنيان صداقة طويلة داخل مؤسسة تقيّد حريتهما."),
    film("catch-me", "Catch Me If You Can", 2002, "crime drama comedy", "discovery identity improvisation familyBond fast playful plot episodic", "A young improviser reinvents himself while a persistent investigator follows.", "شاب يعيد اختراع نفسه باستمرار فيما يسعى محقق إلى اللحاق به."),
    film("inside-out", "Inside Out", 2015, "animation family adventure drama", "identity emotion growth familyBond symbolic warm playful character hopeful-ending", "A child's inner emotional world adapts to an unfamiliar life.", "عالم المشاعر الداخلي لطفلة يتكيف مع حياة جديدة."),
    film("toy-story", "Toy Story", 1995, "animation family comedy adventure", "friendship community identity growth playful warm linear hopeful-ending", "A group of toys adjusts to the arrival of a new companion.", "مجموعة ألعاب تتكيف مع وصول رفيق جديد."),
    film("interstellar", "Interstellar", 2014, "scifi adventure drama", "time discovery duty familyBond control puzzle visual emotional hopeful-ending", "Explorers confront an uncertain future across vast distances.", "مستكشفون يواجهون مستقبلًا مجهولًا عبر مسافات هائلة.", "interstellar-poster.webp"),
    film("pursuit", "The Pursuit of Happyness", 2006, "drama biography", "ambition familyBond selfWorth growth realism warm uplifting hopeful-ending", "A father struggles to build a better life for himself and his child.", "أب يكافح لبناء حياة أفضل له ولطفله."),
    film("fellowship", "The Lord of the Rings: The Fellowship of the Ring", 2001, "fantasy adventure action", "duty friendship community discovery visual epic hope plot open", "An unlikely fellowship shares a difficult journey.", "رفقة غير متوقعة تتشارك رحلة صعبة."),
    film("jurassic", "Jurassic Park", 1993, "scifi adventure thriller", "discovery uncertainty systems wonder fast suspense visual plot", "Visitors encounter a world brought back through science.", "زوار يواجهون عالمًا أعاده العلم إلى الوجود."),
    film("titanic", "Titanic", 1997, "romance drama history", "love relationship loss memory class epic emotional tragic closed", "Two people from different worlds meet on a transatlantic voyage.", "شخصان من عالمين مختلفين يلتقيان في رحلة بحرية."),
    film("la-la-land", "La La Land", 2016, "romance drama music comedy", "ambition love identity relationship stylized visual melancholic bittersweet-ending closed", "Two aspiring artists navigate their dreams and their relationship.", "فنانان طموحان يواجهان تقاطع أحلامهما وعلاقتهما.", "la-la-land-poster.webp"),
    film("matrix", "The Matrix", 1999, "scifi action", "truth freedom discovery uncertainty symbolic stylized fast puzzle", "A computer hacker discovers reasons to question ordinary reality.", "مخترق حاسوب يكتشف أسبابًا تدعوه للتشكيك في الواقع المألوف."),
    film("hunger-games", "The Hunger Games", 2012, "scifi action adventure", "justice systems duty identity community intense suspense plot", "A young person faces a violent system built around public spectacle.", "شابة تواجه نظامًا قاسيًا يقوم على الاستعراض أمام الجمهور."),
    film("nemo", "Finding Nemo", 2003, "animation family adventure", "familyBond discovery control trust growth warm playful hopeful-ending", "A cautious father journeys through the ocean to find his son.", "أب شديد الحذر يسافر عبر المحيط بحثًا عن ابنه."),
    film("arrival", "Arrival", 2016, "scifi drama mystery", "time memory meaning puzzle symbolic contemplative loss bittersweet-ending closed", "A linguist attempts to understand an unfamiliar form of communication.", "لغوية تحاول فهم شكل غير مألوف من التواصل.", "arrival-2016-poster.webp"),
    film("everything", "Everything Everywhere All at Once", 2022, "scifi comedy drama action", "discovery identity familyBond possibilities nonlinear stylized emotional hopeful-ending", "A woman encounters wildly different possibilities for her life.", "امرأة تواجه احتمالات شديدة الاختلاف لحياتها."),
    film("zodiac", "Zodiac", 2007, "crime mystery thriller", "truth uncertainty obsession control realism suspense slow ambiguous-ending", "Investigators pursue a mystery that resists a simple answer.", "محققون يطاردون لغزًا يقاوم الإجابات السهلة."),
    film("social-network", "The Social Network", 2010, "drama biography", "ambition selfWorth friendship ethics systems identity fast character bittersweet-ending", "The creation of a social network transforms friendships and ambitions.", "إنشاء شبكة اجتماعية يغير صداقات الشخصيات وطموحاتها.", "the-social-network-poster.webp"),
    film("whiplash", "Whiplash", 2014, "drama music", "ambition obsession control selfWorth authority psychological intense suspense open", "A young drummer and an exacting instructor push the limits of achievement.", "عازف شاب ومدرب صارم يدفعان حدود الإنجاز.", "whiplash-2014-poster.webp"),
    film("black-swan", "Black Swan", 2010, "drama thriller horror", "identity obsession control psychological intense symbolic bleak tragic", "A dancer struggles with perfection, identity and mounting pressure.", "راقصة تصارع الكمال والهوية والضغط المتزايد.", "black-swan-poster.webp"),
    film("her", "Her", 2013, "romance drama scifi", "identity relationship love change contemplative character melancholy bittersweet-ending", "A lonely writer experiences an unusual intimate connection.", "كاتب وحيد يعيش علاقة حميمة غير مألوفة.", "her-poster.webp"),
    film("marriage-story", "Marriage Story", 2019, "drama romance", "relationship familyBond ethics identity realism dialogue emotional character bittersweet-ending closed", "A couple navigates the difficult transformation of their relationship.", "زوجان يواجهان التحول الصعب في علاقتهما."),
    film("mad-max", "Mad Max: Fury Road", 2015, "action adventure scifi", "freedom discovery survival systems visual fast intense plot hopeful-ending", "Survivors race through a harsh landscape seeking another way to live.", "ناجون يعبرون عالمًا قاسيًا بحثًا عن طريقة أخرى للحياة."),
    film("dune", "Dune", 2021, "scifi adventure drama", "control destiny systems duty visual epic symbolic worldbuilding open", "A young heir enters a world of political and personal uncertainty.", "وريث شاب يدخل عالمًا من عدم اليقين السياسي والشخصي.", "dune-2021-poster.webp"),
    film("past-lives", "Past Lives", 2023, "romance drama", "memory love identity relationship time realism slow character bittersweet-ending", "Two childhood friends reconnect across different lives and places.", "صديقا طفولة يعيدان التواصل عبر حياتين وأماكن مختلفة.", "past-lives-poster.webp"),
    film("before-sunrise", "Before Sunrise", 1995, "romance drama", "discovery dialogue love relationship episodic realism warm open", "Two strangers spend a night walking and talking in Vienna.", "غريبان يقضيان ليلة في المشي والحديث في فيينا.", "before-sunrise-curator-poster-20261126.jpg", "Richard Linklater"),
    film("atonement", "Atonement", 2007, "romance drama war", "love memory loss truth ethics relationship time tragic", "A misunderstanding changes the lives of three people across the years.", "سوء فهم يغيّر مصائر ثلاثة أشخاص عبر السنين.", "atonement-curator-poster-20261126.jpg", "Joe Wright"),
    film("notebook", "The Notebook", 2004, "romance drama", "memory love relationship familyBond emotional melodrama bittersweet-ending closed", "A love story is remembered across different stages of life.", "قصة حب تُستعاد عبر مراحل مختلفة من الحياة."),
    film("eternal-sunshine", "Eternal Sunshine of the Spotless Mind", 2004, "romance drama scifi", "memory identity relationship love nonlinear puzzle symbolic melancholic open", "A couple confronts love through an unusual experience of memory.", "ثنائي يواجه الحب عبر تجربة غير مألوفة مع الذاكرة."),
    film("phantom-thread", "Phantom Thread", 2017, "drama romance", "control relationship identity obsession psychological character stylized slow bittersweet-ending", "A meticulous dressmaker encounters a woman who unsettles his routines.", "مصمم أزياء دقيق يلتقي امرأة تربك روتينه المعتاد.", "phantom-thread-poster.webp"),
    film("parasite", "Parasite", 2019, "drama thriller", "systems class uncertainty ethics identity psychological suspense bleak tragic closed", "Two families encounter the divisions between their lives.", "عائلتان تواجهان الفجوات الفاصلة بين عالميهما."),
    film("oppenheimer", "Oppenheimer", 2023, "drama biography history", "duty ethics systems truth ambition control nonlinear intense dialogue bleak", "A scientist faces the consequences of a world-changing project.", "عالم يواجه تبعات مشروع يغير العالم.", "oppenheimer-2023-poster.webp"),
    film("angry-men", "12 Angry Men", 1957, "drama crime", "justice ethics truth group dialogue realism control perspective closed", "A jury must reach a decision through argument and evidence.", "هيئة محلفين تسعى إلى قرار عبر النقاش والأدلة."),
    film("before-sunset", "Before Sunset", 2004, "romance drama", "love time relationship dialogue realism contemplative character open", "Two people meet years after an earlier encounter.", "شخصان يلتقيان بعد سنوات من لقائهما السابق."),
    film("get-out", "Get Out", 2017, "horror thriller mystery", "systems identity truth uncertainty symbolic suspense intense satire", "A visit to a partner's family grows increasingly unsettling.", "زيارة لعائلة الشريكة تصبح مقلقة على نحو متزايد."),
    film("knives-out", "Knives Out", 2019, "mystery crime comedy", "truth familyBond ethics puzzle suspense playful dialogue closed", "An investigator examines a complicated family mystery.", "محقق يدرس لغزًا عائليًا معقدًا."),
    film("saving-ryan", "Saving Private Ryan", 1998, "war drama history", "duty community ethics loss survival realism intense tragic", "Soldiers undertake a difficult mission during a war.", "جنود ينفذون مهمة صعبة في زمن الحرب."),
    film("grand-budapest", "The Grand Budapest Hotel", 2014, "comedy drama adventure", "memory friendship discovery stylized visual playful episodic bittersweet-ending", "A hotel concierge and his apprentice navigate a rapidly changing world.", "مسؤول فندق وتلميذه يواجهان عالمًا سريع التغير."),
    film("aftersun", "Aftersun", 2022, "drama", "memory familyBond identity loss observational slow realism character melancholic ambiguous-ending", "A daughter looks back on a holiday with her father.", "ابنة تسترجع عطلة قضتها مع والدها.", "aftersun-poster.webp"),
    film("holdovers", "The Holdovers", 2023, "drama comedy", "friendship familyBond community growth realism character warm bittersweet-ending", "An unlikely group spends a holiday together at a school.", "مجموعة غير متوقعة تقضي عطلة معًا في مدرسة."),
    film("perfect-days", "Perfect Days", 2023, "drama", "routine meaning memory observational slow realism character warm open", "A quiet daily routine reveals small variations in ordinary life.", "روتين يومي هادئ يكشف اختلافات صغيرة في الحياة العادية."),
    film("drive-my-car", "Drive My Car", 2021, "drama", "loss memory relationship identity dialogue contemplative slow character bittersweet-ending", "A director processes grief through work, travel and conversation.", "مخرج يتعامل مع الفقد عبر العمل والسفر والحوار.", "drive-my-car-poster.webp"),
    film("worst-person", "The Worst Person in the World", 2021, "romance drama comedy", "identity love growth uncertainty relationship episodic realism bittersweet-ending", "A young woman navigates different versions of adult life.", "شابة تتنقل بين نسخ مختلفة من حياتها الناضجة.", "the-worst-person-in-the-world-poster.webp"),
    film("decision-leave", "Decision to Leave", 2022, "romance mystery thriller", "obsession love truth relationship uncertainty nonlinear visual tragic ambiguous-ending", "An investigation grows entangled with an unexpected emotional attachment.", "تحقيق يتشابك مع انجذاب عاطفي غير متوقع.", "decision-to-leave-poster.webp"),
    film("anatomy-fall", "Anatomy of a Fall", 2023, "drama mystery", "truth relationship ethics language dialogue psychological realism uncertainty ambiguous-ending", "A family and a court reconstruct competing accounts of a death.", "عائلة ومحكمة تعيدان بناء روايات متنافسة عن وفاة.", "anatomy-of-a-fall-poster.webp"),
    film("tar", "Tár", 2022, "drama music", "control ambition ethics systems identity psychological character realism bleak", "A renowned conductor's carefully managed world is unsettled.", "عالَم قائدة أوركسترا شهيرة ومنظم بعناية يتعرض للاضطراب.", "tar-2022-poster.webp"),
    film("banshees", "The Banshees of Inisherin", 2022, "drama comedy", "friendship identity relationship loneliness ethics character melancholy bleak bittersweet-ending", "A friendship changes abruptly on a remote island.", "صداقة تتغير فجأة على جزيرة نائية.", "the-banshees-of-inisherin-poster.webp"),
    film("batman", "The Batman", 2022, "crime mystery action", "truth justice systems identity psychological suspense visual noir", "A detective-like vigilante encounters the institutions of a troubled city.", "شخصية تحقق في تعقيدات مؤسسات مدينة مضطربة.", "the-batman-poster.webp"),
    film("dune-two", "Dune: Part Two", 2024, "scifi adventure action", "destiny systems ambition duty worldbuilding epic visual intense bleak", "A struggle over power changes the course of a distant world.", "صراع على السلطة يغير مسار عالم بعيد.", "dune-part-two-poster.webp"),
    film("portrait", "Portrait of a Lady on Fire", 2019, "romance drama history", "love identity memory freedom visual contemplative slow character tragic", "A painter and her subject form a connection within a constrained world.", "رسامة ومن ترسمها تبنيان علاقة داخل عالم مقيد."),
    film("mood-love", "In the Mood for Love", 2000, "romance drama", "love memory restraint relationship visual slow stylized melancholic bittersweet-ending", "Two neighbors share a carefully restrained emotional connection.", "جاران يتشاركان انجذابًا عاطفيًا شديد التحفظ."),
    film("chungking", "Chungking Express", 1994, "romance drama comedy", "discovery love loneliness change episodic visual playful melancholic open", "Two stories trace unexpected encounters and everyday longing.", "قصتان تتبعان اللقاءات غير المتوقعة والشوق اليومي."),
    film("manchester", "Manchester by the Sea", 2016, "drama", "loss memory familyBond identity realism psychological slow character bleak bittersweet-ending", "A man returns to a place that holds difficult memories.", "رجل يعود إلى مكان يحمل ذكريات صعبة."),
    film("separation", "A Separation", 2011, "drama mystery", "ethics justice familyBond relationship systems realism dialogue uncertainty ambiguous-ending", "A family decision creates competing responsibilities and moral claims.", "قرار عائلي يولد مسؤوليات ومطالب أخلاقية متعارضة."),
    film("moonlight", "Moonlight", 2016, "drama", "identity love selfWorth growth memory visual character contemplative open", "A young man's identity develops across three periods of life.", "هوية شاب تتطور عبر ثلاث مراحل من الحياة."),
    film("lady-bird", "Lady Bird", 2017, "comedy drama", "identity growth familyBond relationship realism playful warm character", "A teenager negotiates independence and attachment to home.", "مراهقة تفاوض رغبتها في الاستقلال وتعلقها ببيتها."),
    film("remains", "The Remains of the Day", 1993, "drama romance history", "duty restraint love memory identity character slow realism bittersweet-ending", "A devoted butler reflects on the meaning of a life of service.", "خادم مخلص يتأمل معنى حياة قضاها في أداء الواجب."),
    film("forty-five-years", "45 Years", 2015, "drama romance", "memory relationship truth uncertainty realism slow character ambiguous-ending", "Old information unsettles the apparent stability of a marriage.", "معلومة قديمة تزعزع الاستقرار الظاهر لزواج."),
    film("certified-copy", "Certified Copy", 2010, "romance drama", "identity relationship truth dialogue ambiguity contemplative character open", "A conversation between two people invites different interpretations.", "حوار بين شخصين يفتح الباب لتأويلات مختلفة."),
    film("souvenir", "The Souvenir", 2019, "drama romance", "identity growth love loss memory observational realism slow character", "A young filmmaker navigates an intimate, formative relationship.", "صانعة أفلام شابة تعيش علاقة حميمة تشكل تجربتها."),
    film("patterson", "Paterson", 2016, "drama comedy", "routine meaning identity love observational slow realism warm contemplative", "A bus driver writes poetry within the rhythm of daily life.", "سائق حافلة يكتب الشعر داخل إيقاع الحياة اليومية."),
    film("columbus", "Columbus", 2017, "drama romance", "architecture relationship meaning identity visual slow contemplative realism open", "A meeting in an architectural town leads to quiet conversations.", "لقاء في مدينة معمارية يقود إلى حوارات هادئة."),
    film("green-ray", "The Green Ray", 1986, "drama romance", "loneliness discovery meaning love observational realism episodic slow open", "A woman searches for a meaningful summer amid chance encounters.", "امرأة تبحث عن صيف ذي معنى وسط لقاءات عابرة."),
    film("veronique", "The Double Life of Véronique", 1991, "drama fantasy romance", "destiny identity memory meaning symbolic visual contemplative ambiguity open", "Two lives are linked by an elusive sense of connection.", "حياتان ترتبطان بإحساس مراوغ بالصلة بينهما."),
    film("tree-life", "The Tree of Life", 2011, "drama fantasy", "meaning memory familyBond time symbolic visual contemplative nonlinear ambiguous-ending", "Personal memories expand into larger questions about existence.", "ذكريات شخصية تتسع إلى أسئلة أكبر حول الوجود."),
    film("blade-runner", "Blade Runner 2049", 2017, "scifi mystery drama", "identity truth memory meaning systems visual slow psychological bleak", "An investigator questions the meaning of his memories and identity.", "محقق يتساءل عن معنى ذكرياته وهويته."),
    film("ex-machina", "Ex Machina", 2014, "scifi thriller drama", "identity control freedom ethics uncertainty systems psychological suspense bleak", "An unusual experiment tests the boundaries of intelligence and agency.", "تجربة غير مألوفة تختبر حدود الذكاء والقدرة على الاختيار."),
    film("gattaca", "Gattaca", 1997, "scifi drama thriller", "identity freedom ambition ethics systems control character hopeful-ending", "A person's ambitions challenge a society built around genetic expectations.", "طموح شخص يتحدى مجتمعًا قائمًا على توقعات وراثية."),
    film("martian", "The Martian", 2015, "scifi adventure drama", "survival cooperation truth discovery systems problemSolving hopeful linear", "A stranded explorer applies practical ingenuity to survive.", "مستكشف عالق يستخدم الحيلة العملية من أجل البقاء."),
    film("life-pi", "Life of Pi", 2012, "adventure drama fantasy", "survival meaning discovery belief symbolic visual truth ambiguity open", "A young survivor relates an extraordinary journey at sea.", "ناجٍ شاب يروي رحلة بحرية غير عادية."),
    film("memento", "Memento", 2000, "mystery thriller crime", "memory truth identity control nonlinear puzzle psychological bleak", "A man works with fragmented memories to understand his circumstances.", "رجل يعمل بذكريات مجزأة لفهم ظروفه."),
    film("shutter-island", "Shutter Island", 2010, "mystery thriller drama", "truth memory identity uncertainty puzzle psychological suspense ambiguous-ending", "An investigator encounters a troubling institutional mystery.", "محقق يواجه لغزًا مقلقًا داخل مؤسسة."),
    film("silence-lambs", "The Silence of the Lambs", 1991, "crime thriller horror", "truth psychology suspense control investigation intense plot bleak", "A trainee investigator seeks insight into a difficult case.", "محققة متدربة تسعى إلى فهم قضية صعبة."),
    film("seven", "Se7en", 1995, "crime thriller mystery", "justice ethics uncertainty obsession suspense bleak intense tragic", "Two detectives confront a disturbing series of crimes.", "محققان يواجهان سلسلة جرائم مقلقة."),
    film("gone-girl", "Gone Girl", 2014, "thriller drama mystery", "relationship identity truth systems control puzzle psychological suspense bleak", "A disappearance exposes conflicting versions of a marriage.", "اختفاء يكشف روايات متعارضة لزواج."),
    film("no-country", "No Country for Old Men", 2007, "crime thriller drama", "uncertainty destiny ethics survival realism suspense bleak ambiguous-ending", "A collision of choices leaves people confronting an unpredictable world.", "تصادم اختيارات يضع أشخاصًا أمام عالم لا يمكن توقعه."),
    film("children-men", "Children of Men", 2006, "scifi action drama", "systems duty hope survival realism intense visual open", "A man is drawn into a fragile possibility for a troubled society.", "رجل ينجذب إلى إمكانية هشة لمجتمع مضطرب."),
    film("joker", "Joker", 2019, "drama crime thriller", "identity selfWorth systems loneliness psychological bleak character intense", "A marginalized man's experience of himself and society becomes increasingly unstable.", "تجربة رجل مهمش مع ذاته ومجتمعه تصبح مضطربة."),
    film("godfather", "The Godfather", 1972, "crime drama", "familyBond duty power identity ethics systems character bleak closed", "A family confronts loyalty, power and responsibility.", "عائلة تواجه أسئلة الولاء والسلطة والمسؤولية."),
    film("gladiator", "Gladiator", 2000, "action drama history", "duty justice identity loss epic visual intense tragic", "A soldier faces displacement and a struggle over justice.", "جندي يواجه الاقتلاع وصراعًا يتعلق بالعدالة."),
    film("pianist", "The Pianist", 2002, "war drama biography", "survival loss identity realism observational melancholic resilience", "A musician endures the disruptions of wartime.", "موسيقي يصمد أمام اضطرابات الحرب."),
    film("schindler", "Schindler's List", 1993, "history war drama", "ethics duty systems loss community realism emotional bleak", "A businessman faces human responsibility during the Holocaust.", "رجل أعمال يواجه المسؤولية الإنسانية في زمن المحرقة."),
    film("dunkirk", "Dunkirk", 2017, "war history thriller", "survival uncertainty duty time nonlinear visual suspense intense", "An evacuation is experienced across different perspectives and times.", "عملية إجلاء تُعاش عبر منظورات وأزمنة مختلفة."),
    film("ratatouille", "Ratatouille", 2007, "animation family comedy", "identity ambition growth discovery visual playful uplifting hopeful-ending", "An unconventional aspiring cook pursues an unexpected calling.", "طاهٍ طموح غير تقليدي يسعى إلى شغف غير متوقع."),
    film("wall-e", "WALL-E", 2008, "animation scifi adventure", "routine discovery love systems visual warm meaning hopeful-ending", "A solitary robot encounters an unexpected visitor and journey.", "روبوت وحيد يلتقي زائرًا غير متوقع ويخوض رحلة."),
    film("coco", "Coco", 2017, "animation family music fantasy", "memory identity familyBond love growth visual emotional hopeful-ending", "A child explores the relationship between music and family memory.", "طفل يستكشف العلاقة بين الموسيقى وذاكرة العائلة."),
    film("soul", "Soul", 2020, "animation comedy drama", "meaning identity ambition discovery contemplative visual warm hopeful-ending", "A musician reconsiders what makes everyday life meaningful.", "موسيقي يعيد التفكير فيما يمنح الحياة اليومية معناها."),
    film("up", "Up", 2009, "animation family adventure", "loss memory discovery friendship growth warm emotional hopeful-ending", "An elderly man sets off on an unexpected adventure.", "رجل مسن ينطلق في مغامرة غير متوقعة."),
    film("spirited-away", "Spirited Away", 2001, "animation fantasy adventure", "discovery identity growth symbolic visual wonder worldbuilding hope", "A child finds her way through an unfamiliar spirit world.", "طفلة تجد طريقها داخل عالم أرواح غير مألوف."),
    film("spider-verse", "Spider-Man: Into the Spider-Verse", 2018, "animation action scifi", "identity growth discovery community visual fast playful hopeful-ending", "An unexpected hero learns from different versions of a familiar story.", "بطل غير متوقع يتعلم من نسخ مختلفة لقصة مألوفة."),
    film("secret-life", "The Secret Life of Walter Mitty", 2013, "adventure comedy drama", "identity freedom discovery visual growth playful hopeful-ending", "An ordinary worker steps into an unfamiliar world of experiences.", "موظف عادي يدخل عالمًا غير مألوف من التجارب."),
    film("cast-away", "Cast Away", 2000, "adventure drama", "survival identity time loss discovery realism contemplative open", "A man confronts solitude and the passage of time after an accident.", "رجل يواجه الوحدة ومرور الزمن بعد حادث."),
    film("devil-wears-prada", "The Devil Wears Prada", 2006, "comedy drama", "ambition identity systems ethics style character playful", "An assistant navigates the expectations of a demanding fashion world.", "مساعدة تتنقل بين توقعات عالم أزياء صارم."),
    film("little-women", "Little Women", 2019, "drama romance history", "familyBond identity love ambition memory nonlinear warm bittersweet-ending", "Four sisters explore different ambitions and relationships.", "أربع شقيقات يستكشفن طموحات وعلاقات مختلفة."),
    film("five-hundred-days", "(500) Days of Summer", 2009, "romance comedy drama", "love memory identity uncertainty nonlinear playful bittersweet-ending", "A young man reconstructs a relationship through moments and memory.", "شاب يعيد بناء علاقة عبر اللحظات والذاكرة."),
    film("free-solo", "Free Solo", 2018, "documentary sport adventure", "ambition control survival visual observational suspense intense", "A documentary follows an ambitious climbing project.", "وثائقي يتابع مشروع تسلق طموح."),
    film("octopus", "My Octopus Teacher", 2020, "documentary", "discovery meaning nature visual observational slow contemplative warm", "A filmmaker observes a remarkable underwater world over time.", "صانع أفلام يراقب عالمًا رائعًا تحت الماء عبر الزمن."),
    film("jiro", "Jiro Dreams of Sushi", 2011, "documentary", "routine mastery ambition control observational contemplative craft", "A portrait of devotion to a craft and its routines.", "بورتريه للتفاني في حرفة وروتينها."),
    film("flee", "Flee", 2021, "documentary animation", "identity memory freedom loss emotional realism character", "An animated documentary recounts a person's experiences of displacement.", "وثائقي تحريكي يروي تجارب شخص مع النزوح."),
    film("quiet-place", "A Quiet Place", 2018, "horror thriller scifi", "survival familyBond control suspense intense sensory plot", "A family adapts to an environment of extreme uncertainty.", "عائلة تتكيف مع بيئة شديدة عدم اليقين."),
    film("conjuring", "The Conjuring", 2013, "horror thriller mystery", "uncertainty survival suspense intense systems plot", "Investigators look into frightening events in a family's home.", "محققون يبحثون في أحداث مخيفة داخل منزل عائلة."),
    film("home-alone", "Home Alone", 1990, "comedy family", "improvisation familyBond discovery playful warm fast closed", "A child unexpectedly manages an unfamiliar situation on his own.", "طفل يتعامل وحده مع وضع غير مألوف على نحو مفاجئ."),
    film("oceans", "Ocean's Eleven", 2001, "crime comedy thriller", "control cooperation improvisation fast playful plot puzzle", "An ensemble carries out an elaborate plan.", "مجموعة شخصيات تنفذ خطة معقدة."),
    film("invisible-guest", "The Invisible Guest", 2016, "mystery thriller crime", "truth control puzzle nonlinear suspense plot closed", "An account of a mysterious night is repeatedly revised.", "رواية عن ليلة غامضة تُعاد صياغتها مرارًا."),
    film("shawshank-adjacent", "The Green Mile", 1999, "drama fantasy crime", "ethics loss duty memory character emotional tragic", "A prison worker remembers an extraordinary chapter of his career.", "عامل في سجن يسترجع فصلًا استثنائيًا من حياته."),
    film("cinema-paradiso", "Cinema Paradiso", 1988, "drama romance", "memory growth love meaning nostalgia warm emotional bittersweet-ending", "A filmmaker remembers the people and cinema of his childhood.", "مخرج يستعيد أشخاص وسينما طفولته."),
    film("lives-others", "The Lives of Others", 2006, "drama thriller history", "ethics identity systems duty love truth realism suspense bittersweet-ending", "An observer's work becomes intertwined with other people's lives.", "عمل مراقب يتشابك مع حياة أشخاص آخرين."),
    film("roma", "Roma", 2018, "drama", "familyBond class loss memory observational realism visual slow emotional", "An ordinary life and domestic world are observed across a changing time.", "حياة يومية وعالم منزلي يُرصدان وسط زمن متغير."),
    film("florida", "The Florida Project", 2017, "drama", "childhood class discovery freedom observational realism playful bittersweet-ending", "Children discover wonders within a precarious everyday world.", "أطفال يكتشفون الدهشة داخل عالم يومي غير مستقر."),
    film("burning", "Burning", 2018, "drama mystery thriller", "uncertainty class identity obsession psychological slow ambiguity open", "An uncertain relationship opens into a difficult mystery.", "علاقة ملتبسة تتسع إلى لغز صعب."),
    film("arrival-adjacent", "Contact", 1997, "scifi drama mystery", "truth belief discovery systems ethics meaning wonder puzzle", "A scientist encounters evidence that could change humanity's understanding.", "عالمة تواجه دليلًا قد يغيّر فهم البشرية."),
    film("dead-poets", "Dead Poets Society", 1989, "drama", "identity freedom duty ambition ethics growth emotional character", "Students encounter new ways of interpreting their lives and expectations.", "طلاب يواجهون طرقًا جديدة لفهم حياتهم والتوقعات المفروضة عليهم."),
    film("beautiful-mind", "A Beautiful Mind", 2001, "drama biography", "identity truth ambition relationship memory psychological emotional character", "A mathematician navigates personal and intellectual challenges.", "عالم رياضيات يواجه تحديات شخصية وفكرية."),
    film("avatar", "Avatar", 2009, "scifi adventure action", "discovery systems community freedom worldbuilding visual epic intense", "An outsider encounters an unfamiliar world and its communities.", "غريب يواجه عالمًا غير مألوف ومجتمعاته."),
    film("pirates", "Pirates of the Caribbean: The Curse of the Black Pearl", 2003, "adventure action fantasy", "improvisation discovery freedom playful fast visual plot", "A group of unlikely allies navigates a spectacular seafaring adventure.", "مجموعة حلفاء غير متوقعين تخوض مغامرة بحرية."),
    film("harry-potter", "Harry Potter and the Philosopher's Stone", 2001, "fantasy adventure family", "discovery friendship identity growth worldbuilding wonder warm", "A child enters a secret world and discovers new relationships.", "طفل يدخل عالمًا سريًا ويكتشف علاقات جديدة."),
    film("lion-king", "The Lion King", 1994, "animation family adventure music", "identity duty familyBond loss growth epic emotional hopeful-ending", "A young lion faces his place within a larger community.", "أسد شاب يواجه موقعه داخل مجتمع أكبر.")
  ];

  // Recent films from the Archive's film files. Use the same local art as the
  // rest of the site, so neither the quiz nor the review needs a poster API.
  films.push(
    film("1917", "1917", 2019, "war drama action", "duty survival discovery sensory visual fast suspense linear", "Two soldiers cross a changing landscape carrying a vital message.", "يعبر جنديان أرضاً متغيرة حاملين رسالة مصيرية.", "1917-poster.webp", "Sam Mendes", "1917-wide.webp"),
    film("moneyball", "Moneyball", 2011, "drama sport biography", "systems cooperation ambition problemSolving mastery realism dialogue", "A baseball executive rethinks how his team evaluates talent.", "يعيد مدير فريق بيسبول التفكير في كيفية تقييم المواهب.", "moneyball-poster.webp", "Bennett Miller", "moneyball-wide.webp"),
    film("nightcrawler", "Nightcrawler", 2014, "crime thriller drama", "ambition ethics systems obsession power fast noir bleak psychological", "An ambitious freelancer enters the world of night-time news footage.", "يدخل مصور طموح عالم الأخبار الليلية بحثاً عن النجاح.", "nightcrawler-poster.webp", "Dan Gilroy", "nightcrawler-wide.webp"),
    film("prisoners", "Prisoners", 2013, "crime thriller mystery", "truth uncertainty loss duty control puzzle suspense bleak", "A disappearance unsettles two families and an investigating detective.", "يُربك اختفاء طفلين عائلتين ومحققاً يحاول كشف الحقيقة.", "prisoners-poster.webp", "Denis Villeneuve", "prisoners-wide.webp"),
    film("sicario", "Sicario", 2015, "crime thriller action", "systems ethics authority uncertainty duty suspense visual bleak", "An agent enters a complex operation on the border.", "تدخل عميلة في عملية معقدة عند الحدود.", "sicario-2015-poster.webp", "Denis Villeneuve", "sicario-2015-wide.webp"),
    film("first-man", "First Man", 2018, "biography drama history", "loss duty restraint mastery discovery familyBond visual melancholic", "The personal life and demanding journey of an astronaut unfold together.", "تتداخل الحياة الشخصية لرائد فضاء مع رحلته المهنية الشاقة.", "first-man-poster.webp", "Damien Chazelle", "first-man-wide.webp"),
    film("drive", "Drive", 2011, "crime thriller drama", "identity restraint duty loneliness love visual stylized noir suspense", "A quiet driver becomes entangled in the lives of his neighbours.", "يتورط سائق قليل الكلام في عالم جيرانه.", "drive-2011-poster.webp", "Nicolas Winding Refn", "drive-2011-wide.webp"),
    film("master", "The Master", 2012, "drama", "identity belief authority power loneliness psychological character contemplative", "A restless veteran encounters a charismatic leader and his community.", "يلتقي محارب سابق مضطرب بزعيم ذي حضور مؤثر وجماعته.", "the-master-2012-poster.webp", "Paul Thomas Anderson", "the-master-2012-wide.webp"),
    film("wolf-wall-street", "The Wolf of Wall Street", 2013, "crime drama comedy biography", "ambition class power systems ethics fast satire stylized", "A stockbroker builds a restless world of wealth and excess.", "يبني سمسار بورصة عالماً صاخباً من الثروة والإفراط.", "the-wolf-of-wall-street-poster.webp", "Martin Scorsese", "the-wolf-of-wall-street-wide.webp"),
    film("endgame", "Avengers: Endgame", 2019, "action adventure scifi fantasy", "cooperation loss duty friendship time epic worldbuilding emotional hopeful-ending", "A scattered group of heroes must find a new way forward together.", "يبحث أبطال متفرقون عن سبيل جديد للمضي معاً.", "avengers-endgame-poster.webp", "Anthony & Joe Russo", "avengers-endgame-wide.webp"),
    film("infinity-war", "Avengers: Infinity War", 2018, "action adventure scifi fantasy", "cooperation power duty destiny epic worldbuilding intense suspense open", "Several heroes confront an adversary pursuing a single vision.", "يواجه أبطال متعددون خصماً يسعى إلى تحقيق رؤية واحدة.", "avengers-infinity-war-poster.webp", "Anthony & Joe Russo", "avengers-infinity-war-wide.webp"),
    film("dark-knight-rises", "The Dark Knight Rises", 2012, "action crime thriller", "justice duty community identity resilience epic plot intense", "A retired protector is drawn back into a city's crisis.", "تستدعي أزمة مدينة حاميها المنعزل للعودة.", "the-dark-knight-rises-poster.webp", "Christopher Nolan", "the-dark-knight-rises-wide.webp"),
    film("tenet", "Tenet", 2020, "action scifi thriller", "time systems truth puzzle nonlinear control discovery sensory", "An operative discovers a world governed by unfamiliar temporal rules.", "يكتشف عميل عالماً تحكمه قواعد زمنية غير مألوفة.", "tenet-poster.webp", "Christopher Nolan", "tenet-wide.webp"),
    film("babylon", "Babylon", 2022, "drama comedy history", "ambition craft change identity class fast visual epic nostalgia", "A group of artists navigates the upheaval of early Hollywood.", "يعبر فنانون مرحلة التحولات العاصفة في هوليوود المبكرة.", "babylon-2022-poster.webp", "Damien Chazelle", "babylon-2022-wide.webp"),
    film("challengers", "Challengers", 2024, "drama romance sport", "ambition relationship obsession friendship power mastery nonlinear sensory intense", "Three tennis players navigate desire and competition across years.", "تتقاطع الرغبة والمنافسة بين ثلاثة لاعبي تنس عبر السنين.", "challengers-poster.webp", "Luca Guadagnino"),
    film("poor-things", "Poor Things", 2023, "drama romance fantasy comedy", "identity freedom discovery growth possibilities symbolic stylized visual satire", "A woman encounters a strange world and makes it her own.", "تكتشف امرأة عالماً غريباً وتكوّن طريقها الخاص فيه.", "poor-things-2023-poster.webp", "Yorgos Lanthimos", "poor-things-2023-film-file.webp"),
    film("mickey-17", "Mickey 17", 2025, "scifi drama comedy adventure", "identity systems survival authority ethics discovery satire worldbuilding", "An expendable worker on a space colony encounters an unexpected version of himself.", "يواجه عامل قابل للاستبدال في مستعمرة فضائية نسخة غير متوقعة من نفسه.", "mickey-17-poster.webp", "Bong Joon Ho", "mickey-17-film-file.webp"),
    film("one-battle", "One Battle After Another", 2025, "action thriller drama comedy", "familyBond authority identity survival change improvisation duty fast satire", "A father and daughter are drawn into the consequences of the past.", "ينجرف أب وابنته إلى تبعات ماضٍ يعود إلى الحاضر.", "one-battle-after-another-poster.webp", "Paul Thomas Anderson", "one-battle-after-another-wide.webp"),
    film("sentimental-value", "Sentimental Value", 2025, "drama", "familyBond memory craft relationship identity loss character dialogue bittersweet", "A filmmaker's return opens old questions in the lives of his daughters.", "تعيد عودة مخرج سينمائي فتح أسئلة قديمة في حياة ابنتيه.", "sentimental-value-2025-poster.webp", "Joachim Trier", "sentimental-value-2025-film-file.webp"),
    film("no-other-choice", "No Other Choice", 2025, "thriller drama comedy", "identity ambition systems class control uncertainty power ethics satire psychological", "An unexpected job loss upsets a man's carefully arranged life.", "يفقد رجل عمله فجأة فتضطرب حياته التي اعتاد نظامها.", "no-other-choice-2025-poster.webp", "Park Chan-wook", "no-other-choice-2025-wide.webp"),
    film("brutalist", "The Brutalist", 2024, "drama history", "ambition identity craft authority power class memory epic contemplative", "An architect pursues the chance to build a life and a lasting work.", "يسعى معمار وراء فرصة لبناء حياة جديدة وعمل يبقى.", "the-brutalist-poster.webp", "Brady Corbet", "the-brutalist-wide.webp"),
    film("killers-flower-moon", "Killers of the Flower Moon", 2023, "crime drama history", "truth ethics power class relationship justice loss character bleak", "A community and a marriage become entangled in wealth, betrayal and power.", "يتشابك مصير مجتمع وزواج مع الثروة والخيانة والسلطة.", "killers-of-the-flower-moon-poster.webp", "Martin Scorsese"),
    film("asteroid-city", "Asteroid City", 2023, "comedy drama scifi", "loss uncertainty possibilities memory belief symbolic stylized visual episodic", "Visitors in a desert town encounter an event that disrupts their routines.", "يواجه زوار بلدة صحراوية حدثاً يقطع رتابة حياتهم.", "asteroid-city-poster.webp", "Wes Anderson"),
    film("french-dispatch", "The French Dispatch", 2021, "comedy drama", "craft community discovery memory possibilities episodic visual stylized", "The stories of a magazine become a collection of encounters and worlds.", "تتحول حكايات مجلة إلى مجموعة من العوالم واللقاءات.", "the-french-dispatch-of-the-liberty-kansas-poster.webp", "Wes Anderson"),
    film("menu", "The Menu", 2022, "thriller comedy horror", "power class systems craft ethics control suspense satire", "A group of guests attends an unusually orchestrated dinner.", "تحضر مجموعة من الضيوف عشاءً مرتباً بطريقة غير مألوفة.", "the-menu-2022-poster.webp", "Mark Mylod"),
    film("may-december", "May December", 2023, "drama", "identity truth ethics relationship selfWorth class character psychological ambiguous-ending", "An actress visits a family to prepare for a difficult role.", "تزور ممثلة عائلة استعداداً لدور معقد.", "may-december-poster.webp", "Todd Haynes"),
    film("materialists", "Materialists", 2025, "romance drama comedy", "love class selfWorth relationship ambition ethics dialogue realism", "A matchmaker must reckon with the competing values of modern romance.", "تعيد وسيطة زواج النظر في القيم المتنافسة للحب المعاصر.", "materialists-poster.webp", "Celine Song"),
    film("handmaiden", "The Handmaiden", 2016, "drama thriller romance", "truth power identity freedom love puzzle nonlinear stylized suspense", "A young woman's arrival at an isolated estate changes several lives.", "يغير وصول شابة إلى منزل معزول حياة عدد من الأشخاص.", "the-handmaiden-poster.webp", "Park Chan-wook", "the-handmaiden-wide.webp"),
    film("nocturnal-animals", "Nocturnal Animals", 2016, "thriller drama", "memory loss identity relationship power symbolic nonlinear psychological bleak", "An art gallery owner receives a manuscript that unsettles her past.", "تتلقى صاحبة معرض فني مخطوطة تعيد اضطراب ماضيها.", "nocturnal-animals-poster.webp", "Tom Ford", "nocturnal-animals-wide.webp"),
    film("marty-supreme", "Marty Supreme", 2025, "drama sport", "ambition mastery obsession identity improvisation class fast intense character", "A driven young table-tennis player pursues a future on his own terms.", "يطارد لاعب تنس طاولة شاب طموحه وفق شروطه الخاصة.", "marty-supreme-poster.webp", "Josh Safdie"),
    film("hamnet", "Hamnet", 2025, "drama history romance", "loss love familyBond craft memory meaning character emotional bittersweet", "A family confronts grief and the bond between life and art.", "تواجه عائلة الفقد والعلاقة بين الحياة والفن.", "hamnet-poster.webp", "Chloé Zhao", "hamnet-wide.webp"),
    film("a-complete-unknown", "A Complete Unknown", 2024, "music biography drama", "identity craft freedom ambition change mastery community", "A young musician navigates the changing folk-music world.", "يجد موسيقي شاب طريقه داخل عالم موسيقي متغير.", "a-complete-unknown-poster.webp", "James Mangold"),
    film("elvis", "Elvis", 2022, "music biography drama", "ambition identity authority power craft selfWorth sensory visual fast", "A performer finds fame within a demanding relationship with his manager.", "يبلغ مؤدٍ الشهرة داخل علاقة معقدة بمدير أعماله.", "elvis-2022-poster.webp", "Baz Luhrmann", "elvis-2022-wide.webp"),
    film("steve-jobs", "Steve Jobs", 2015, "biography drama", "ambition identity craft systems authority familyBond dialogue character", "Key product launches frame the complicated relationships of a technology pioneer.", "تؤطر عروض منتجات محورية علاقات رائد تقني معقدة.", "steve-jobs-poster.webp", "Danny Boyle", "steve-jobs-wide.webp"),
    film("nightmare-alley", "Nightmare Alley", 2021, "drama crime thriller", "ambition truth power class identity destiny noir stylized bleak", "A drifter becomes immersed in a world of performance and deception.", "يدخل رجل رحال عالماً من العروض والخداع.", "nightmare-alley-2021-poster.webp", "Guillermo del Toro", "nightmare-alley-2021-wide.webp"),
    film("power-dog", "The Power of the Dog", 2021, "drama", "identity power familyBond restraint truth class psychological slow ambiguity", "The arrival of a new family unsettles two brothers' life on a ranch.", "يغير وصول عائلة جديدة حياة أخوين في مزرعة.", "the-power-of-the-dog-poster.webp", "Jane Campion"),
    film("uncut-gems", "Uncut Gems", 2019, "crime thriller drama", "ambition obsession uncertainty improvisation control fast suspense intense", "A jeweller chases opportunities through an increasingly chaotic world.", "يطارد صائغ فرصه في عالم يزداد فوضى.", "uncut-gems-poster.webp", "Josh & Benny Safdie", "uncut-gems-wide.webp"),
    film("your-name", "Your Name", 2016, "animation romance fantasy drama", "identity time destiny memory love discovery wonder emotional hopeful-ending", "Two young strangers discover an unusual connection across their lives.", "يكتشف شابان غريبان رابطاً غير مألوف بين حياتيهما.", "your-name-poster.webp", "Makoto Shinkai", "your-name-wide.webp"),
    film("before-midnight", "Before Midnight", 2013, "romance drama", "relationship love time identity familyBond dialogue realism bittersweet", "A couple's conversations reveal the lives they have made together.", "تكشف حوارات زوجين عن الحياة التي صنعاها معاً.", "before-midnight-poster.webp", "Richard Linklater", "before-midnight-wide.webp"),
    film("inside-llewyn-davis", "Inside Llewyn Davis", 2013, "drama music comedy", "craft ambition loneliness routine selfWorth memory observational melancholic", "A folk singer moves through a difficult week in New York.", "يمر مغنٍّ شعبي بأسبوع صعب في نيويورك.", "inside-llewyn-davis-poster.webp", "Joel & Ethan Coen", "inside-llewyn-davis-wide.webp"),
    film("midnight-paris", "Midnight in Paris", 2011, "romance comedy fantasy", "memory nostalgia identity craft possibilities discovery wonder stylized", "A writer discovers unexpected encounters in the city he idealizes.", "يكتشف كاتب لقاءات غير متوقعة في المدينة التي يحلم بها.", "midnight-in-paris-poster.webp", "Woody Allen", "midnight-in-paris-wide.webp"),
    film("beale-street", "If Beale Street Could Talk", 2018, "romance drama", "love justice familyBond loss class duty emotional visual bittersweet", "A young couple's future is challenged by circumstances beyond their control.", "يتعرض مستقبل حبيبين شابين لتحديات تتجاوز قدرتهما على التحكم.", "if-beale-street-could-talk-poster.webp", "Barry Jenkins", "if-beale-street-could-talk-wide.webp"),
    film("oslo", "Oslo, August 31st", 2011, "drama", "identity loneliness memory selfWorth routine loss observational melancholic", "A man revisits old places and relationships over the course of a day.", "يعود رجل إلى أماكن وعلاقات قديمة خلال يوم واحد.", "oslo-august-31st-poster.webp", "Joachim Trier", "oslo-august-31st-wide.webp"),
    film("la-chimera", "La Chimera", 2023, "drama romance adventure", "memory loss discovery class love craft symbolic observational ambiguity", "A man searches for traces of the past in a landscape of buried histories.", "يبحث رجل عن آثار الماضي في أرض تخفي تواريخ مدفونة.", "la-chimera-poster.webp", "Alice Rohrwacher"),
    film("monte-cristo", "The Count of Monte Cristo", 2024, "adventure drama romance", "justice identity control duty power love plot epic visual", "A man reappears with a new identity and a carefully shaped purpose.", "يعود رجل بهوية جديدة وغاية محكمة.", "the-count-of-monte-cristo-2024-poster.webp", "Matthieu Delaporte & Alexandre de La Patellière", "the-count-of-monte-cristo-2024-wide.webp")
  );

  const archiveArtwork = {
    "inception":["Christopher Nolan","inception-poster.webp","inception-wide.webp"],
    "interstellar":["Christopher Nolan","interstellar-poster.webp","interstellar-wide.webp"],
    "inside-out":["Pete Docter","inside-out-2015-poster.webp","inside-out-2015-wide.webp"],
    "arrival":["Denis Villeneuve","arrival-2016-poster.webp","arrival-2016-wide.webp"],
    "social-network":["David Fincher","the-social-network-poster.webp","the-social-network-wide.webp"],
    "whiplash":["Damien Chazelle","whiplash-2014-poster.webp","whiplash-2014-wide.webp"],
    "black-swan":["Darren Aronofsky","black-swan-poster.webp","black-swan-wide.webp"],
    "her":["Spike Jonze","her-poster.webp","her-wide.webp"],
    "dune":["Denis Villeneuve","dune-2021-poster.webp","dune-2021-film-file.webp"],
    "past-lives":["Celine Song","past-lives-poster.webp","past-lives-film-file.webp"],
    "la-la-land":["Damien Chazelle","la-la-land-poster.webp","la-la-land-wide.webp"],
    "phantom-thread":["Paul Thomas Anderson","phantom-thread-poster.webp","phantom-thread-wide.webp"],
    "oppenheimer":["Christopher Nolan","oppenheimer-2023-poster.webp","oppenheimer-2023-film-file.webp"],
    "grand-budapest":["Wes Anderson","the-grand-budapest-hotel-poster.webp","the-grand-budapest-hotel-wide.webp"],
    "aftersun":["Charlotte Wells","aftersun-poster.webp",""],
    "drive-my-car":["Ryusuke Hamaguchi","drive-my-car-poster.webp","drive-my-car-wide.webp"],
    "worst-person":["Joachim Trier","the-worst-person-in-the-world-poster.webp","the-worst-person-in-the-world-wide.webp"],
    "decision-leave":["Park Chan-wook","decision-to-leave-poster.webp","decision-to-leave-wide.webp"],
    "anatomy-fall":["Justine Triet","anatomy-of-a-fall-poster.webp","anatomy-of-a-fall-wide.webp"],
    "tar":["Todd Field","tar-2022-poster.webp","tar-2022-wide.webp"],
    "banshees":["Martin McDonagh","the-banshees-of-inisherin-poster.webp","the-banshees-of-inisherin-wide.webp"],
    "batman":["Matt Reeves","the-batman-poster.webp","the-batman-wide.webp"],
    "dune-two":["Denis Villeneuve","dune-part-two-poster.webp","dune-part-two-wide.webp"],
    "manchester":["Kenneth Lonergan","manchester-by-the-sea-poster.webp","manchester-by-the-sea-wide.webp"],
    "moonlight":["Barry Jenkins","moonlight-2016-poster.webp","moonlight-2016-wide.webp"],
    "certified-copy":["Abbas Kiarostami","certified-copy-poster.webp","certified-copy-wide.webp"],
    "souvenir":["Joanna Hogg","the-souvenir-poster.webp","the-souvenir-wide.webp"],
    "tree-life":["Terrence Malick","the-tree-of-life-2011-poster.webp","the-tree-of-life-2011-wide.webp"],
    "blade-runner":["Denis Villeneuve","blade-runner-2049-poster.webp","blade-runner-2049-wide.webp"],
    "shutter-island":["Martin Scorsese","shutter-island-poster.webp","shutter-island-wide.webp"],
    "gone-girl":["David Fincher","gone-girl-poster.webp","gone-girl-wide.webp"],
    "dunkirk":["Christopher Nolan","dunkirk-2017-poster.webp","dunkirk-2017-wide.webp"],
    "coco":["Lee Unkrich","coco-2017-poster.webp","coco-2017-wide.webp"],
    "little-women":["Greta Gerwig","little-women-2019-poster.webp","little-women-2019-wide.webp"],
    "burning":["Lee Chang-dong","burning-2018-poster.webp","burning-2018-wide.webp"]
  };
  for (const movie of films) {
    if (archiveArtwork[movie.id]) {
      [movie.director, movie.poster, movie.still] = archiveArtwork[movie.id];
    }
  }
  const filmById = Object.fromEntries(films.map(item => [item.id, item]));
  // Share the curator's poster choices with the archive while retaining the
  // existing film ids, stills, question order and scoring tags.
  const curatorPosters = {
    inception:'inception-curator-poster-20261126.webp',
    'black-swan':'black-swan-curator-poster-20261126.jpg',
    'blade-runner':'blade-runner-2049-curator-poster-20261126.webp',
    'inside-llewyn-davis':'inside-llewyn-davis-curator-poster-20261126.webp',
    'before-midnight':'before-midnight-curator-poster-20261126.webp',
    oslo:'oslo-august-31st-curator-poster-20261126.webp',
    souvenir:'the-souvenir-curator-poster-20261126.jpg',
    columbus:'columbus-2017-poster.webp'
  };
  for (const [id,path] of Object.entries(curatorPosters)) filmById[id].poster=path;
  // The archive already contains genuine wide stills for these titles.
  for(const [id,still] of Object.entries({aftersun:"aftersun-film-file.webp",challengers:"challengers-film-file.webp","asteroid-city":"asteroid-city-film-file.webp",materialists:"materialists-film-file.webp","marty-supreme":"marty-supreme-film-file.webp"})) filmById[id].still=still;
  // Prefer the archive's actual, curated frames rather than promotional
  // composite backdrops when illustrating choices. The frame is not a score.
  const curatedFrames={
    "dune-two":"dune-part-two-sardaukar.webp",inception:"inception-best-opening-sequence-hd.webp",whiplash:"whiplash-decade-cover.webp",
    moneyball:"assets/gallery/2010-2019/moneyball/84420302a893.webp",arrival:"assets/gallery/2010-2019/arrival-2016/f175e61dd888.webp",
    "social-network":"assets/gallery/2010-2019/the-social-network/1d0735d6be58.webp",dunkirk:"assets/gallery/2010-2019/dunkirk-2017/22aec826112d.webp",
    "1917":"assets/gallery/2010-2019/1917/eaf64409575d.webp","inside-out":"assets/gallery/2010-2019/inside-out-2015/d097dd2fcbcb.webp",coco:"assets/gallery/2010-2019/coco-2017/4d5ec7cdd437.webp",
    "black-swan":"black-swan-the-price-of-perfection-2010s.webp",oppenheimer:"oppenheimer-2023-film-file.webp","mickey-17":"mickey-17-film-file.webp","la-la-land":"la-la-land-lives-we-might-have-lived-curator.webp",
    "blade-runner":"blade-runner-2049-ceremony-cinematography.webp","gone-girl":"gone-girl-most-overrated-movie-hd.webp",interstellar:"interstellar-director-of-the-decade-2010s.webp",
    "phantom-thread":"phantom-thread-best-actor-curator.webp","decision-leave":"decision-to-leave-seo-rae.webp","poor-things":"poor-things-2023-film-file.webp",
    prisoners:"assets/gallery/2010-2019/prisoners/2a891da62cbf.webp",tar:"tar-2022-lydia-conducting.webp",her:"her-the-cruellest-month-award-hd.webp",
    "little-women":"assets/gallery/2010-2019/little-women-2019/e3042c2e4b72.webp",tenet:"tenet-curator-editing.webp","before-midnight":"before-midnight-best-line-of-dialogue-cinematic-r2.webp",
    "no-other-choice":"assets/gallery/2020-2026/no-other-choice-2025/2f89374bd3be.webp",hamnet:"assets/gallery/2020-2026/hamnet/ee30c7d1866d.webp",
    "wolf-wall-street":"assets/gallery/2010-2019/the-wolf-of-wall-street/703c14a74315.webp",babylon:"assets/gallery/2020-2026/babylon-2022/e1d6d2120cd5.webp",
    "shutter-island":"assets/gallery/2010-2019/shutter-island/2eefc046c654.webp","your-name":"assets/gallery/2010-2019/your-name/25eb911f1ef0.webp"
  };
  for(const [id,still] of Object.entries(curatedFrames))filmById[id].still=still;
  const tagLabels = {
    drama:l("Drama","دراما"), romance:l("Romance","رومانسي"), scifi:l("Science fiction","خيال علمي"),
    thriller:l("Thriller","إثارة"), mystery:l("Mystery","غموض"), crime:l("Crime","جريمة"),
    action:l("Action","أكشن"), adventure:l("Adventure","مغامرة"), fantasy:l("Fantasy","فانتازيا"),
    animation:l("Animation","تحريك"), comedy:l("Comedy","كوميديا"), history:l("Historical","تاريخي"),
    horror:l("Horror","رعب"), documentary:l("Documentary","وثائقي"), war:l("War","حربي"),
    music:l("Music & performance","موسيقى وأداء"), biography:l("Biography","سيرة ذاتية"),
    family:l("Family","عائلي"), sport:l("Sport","رياضي"),
    character:l("Character study","دراسة الشخصية"), psychological:l("Psychological","نفسي"),
    existential:l("Existential","وجودي"), identity:l("Identity","الهوية"), relationship:l("Relationships","العلاقات"),
    ambition:l("Ambition","الطموح"), control:l("Control & order","السيطرة والنظام"),
    uncertainty:l("Uncertainty","عدم اليقين"), justice:l("Justice","العدالة"), community:l("Community","الجماعة"),
    familyBond:l("Family bonds","الروابط العائلية"), memory:l("Memory","الذاكرة"), time:l("Time","الزمن"),
    freedom:l("Freedom","الحرية"), discovery:l("Discovery","الاكتشاف"), duty:l("Duty","الواجب"),
    obsession:l("Obsession","الهوس"), loss:l("Loss & grief","الفقد"), ethics:l("Ethical conflict","الصراع الأخلاقي"),
    systems:l("Social systems","الأنظمة الاجتماعية"), growth:l("Personal growth","النمو الشخصي"),
    love:l("Love","الحب"), truth:l("Truth & evidence","الحقيقة والأدلة"), meaning:l("Meaning","المعنى"),
    selfWorth:l("Self-worth","قيمة الذات"), friendship:l("Friendship","الصداقة"), hope:l("Hope","الأمل"),
    trust:l("Trust","الثقة"), class:l("Class","الطبقة الاجتماعية"), destiny:l("Destiny","المصير"),
    routine:l("Routine & ritual","الروتين والطقوس"), restraint:l("Restraint","ضبط العاطفة"),
    loneliness:l("Loneliness","الوحدة"), change:l("Change","التغيير"), authority:l("Authority","السلطة"),
    survival:l("Survival","البقاء"), belief:l("Belief","الإيمان"), mastery:l("Mastery","الإتقان"),
    improvisation:l("Improvisation","الارتجال"), possibilities:l("Possibilities","الاحتمالات"),
    power:l("Power","القوة والسلطة"), cooperation:l("Cooperation","التعاون"), problemSolving:l("Problem solving","حل المشكلات"),
    language:l("Language","اللغة"), childhood:l("Childhood","الطفولة"), nature:l("Nature","الطبيعة"),
    resilience:l("Resilience","الصمود"), craft:l("Craft","الحرفة"), perspective:l("Different perspectives","وجهات نظر مختلفة"),
    melancholy:l("Melancholic","ميلانكولي"), melancholic:l("Melancholic","حزن تأملي"),
    hopeful:l("Hopeful","مفعم بالأمل"), bittersweet:l("Bittersweet","مرّ وحلو"), intense:l("Intense","مكثف"),
    warm:l("Warm","دافئ"), playful:l("Playful","مرح"), bleak:l("Bleak","قاتم"),
    suspense:l("Suspenseful","مشوق"), uplifting:l("Uplifting","مبهج"), emotional:l("Moving","مؤثر"),
    wonder:l("Wonder","الدهشة"), nostalgia:l("Nostalgic","حنيني"),
    slow:l("Slow & contemplative","بطيء وتأملي"), fast:l("Fast-paced","سريع الإيقاع"),
    visual:l("Visually expressive","تعبير بصري"), sensory:l("Sensory","حسي"), realism:l("Realism","واقعية"),
    stylized:l("Stylized","أسلوبية"), symbolic:l("Symbolic","رمزي"), symbolism:l("Symbolic","رمزي"),
    puzzle:l("Puzzle narrative","سرد لغزي"), linear:l("Linear","خطي"), nonlinear:l("Nonlinear","غير خطي"),
    episodic:l("Episodic","متقطع الحلقات"), ambiguity:l("Interpretive ambiguity","غموض تأويلي"),
    observational:l("Observational","رصدي"), dialogue:l("Dialogue-led","يقوده الحوار"),
    contemplative:l("Contemplative","تأملي"), plot:l("Plot-driven","تقوده الحبكة"),
    epic:l("Epic","ملحمي"), worldbuilding:l("World-building","بناء العوالم"), melodrama:l("Melodramatic","ميلودرامي"),
    noir:l("Neo-noir","نيو نوار"), satire:l("Satire","ساخر"),
    closed:l("Resolved","نهاية محسومة"), open:l("Open-ended","نهاية مفتوحة"),
    "ambiguous-ending":l("Ambiguous ending","نهاية ملتبسة"), tragic:l("Tragic","نهاية مأساوية"),
    "hopeful-ending":l("Hopeful ending","نهاية متفائلة"), "bittersweet-ending":l("Bittersweet ending","نهاية مرّة وحلوة")
  };

  const groups = {
    genres: "drama romance scifi thriller mystery crime action adventure fantasy animation comedy history horror documentary war music biography family sport".split(" "),
    themes: "identity relationship ambition control uncertainty justice community familyBond memory time freedom discovery duty obsession loss ethics systems growth love truth meaning selfWorth friendship hope trust class destiny routine restraint loneliness change authority survival belief mastery improvisation possibilities power cooperation problemSolving language childhood nature resilience craft perspective".split(" "),
    style: "character psychological existential slow fast visual sensory realism stylized symbolic symbolism puzzle linear nonlinear episodic ambiguity observational dialogue contemplative plot epic worldbuilding melodrama noir satire".split(" "),
    tone: "melancholic hopeful bittersweet intense warm playful bleak suspense uplifting emotional wonder nostalgia".split(" "),
    endings: "closed open ambiguous-ending tragic hopeful-ending bittersweet-ending".split(" ")
  };

  function option(en, ar, signal = {}, tags = "") {
    return { id: "", label: l(en, ar), signal, tags: tags.split(" ").filter(Boolean) };
  }
  function choices(...items) {
    return items.map((item, index) => ({ ...item, id: String(index + 1) }));
  }
  function story(en, ar, options, rating = false) {
    return { prompt: l(en, ar), options: choices(...options), rating };
  }
  function filmQuestion(id, stage, entries, alternative, prompt = null, visual = "poster") {
    return {
      id, stage, kind: "films", visual,
      prompt: prompt || l("Which of these films would you most like to revisit?", "أي من هذه الأفلام أقرب إلى رغبتك في إعادة المشاهدة؟"),
      options: entries.map(([filmId, signal], index) => ({
        id: filmId, filmId, signal,
        ...(visual === "still" ? { tags: alternative.options[index].tags } : {})
      })),
      alternative
    };
  }
  function filmReaction(id, stage, filmId, en, ar, opts, alternative, rating = false) {
    return { id, stage, kind: "reaction", filmId, prompt:l(en, ar),
      options:choices(...opts), alternative, rating };
  }
  function ending(id, stage, filmId, endingTags, opts, alternative) {
    return { id, stage, kind:"ending", filmId,
      prompt:l("What mattered most in the ending of this film?", "ما الجانب الذي كان الأهم بالنسبة لك في نهاية هذا الفيلم؟"),
      options:choices(...opts), endingTags:endingTags.split(" "), alternative, rating:true };
  }
  function abstractQuestion(id, stage, en, ar, opts, rating = false) {
    return { id, stage, kind:"choice", prompt:l(en,ar), options:choices(...opts), rating };
  }

  const questions = [
    // Core: familiar work, with independent checks of the three orientation axes.
    filmQuestion("c1", "core", [["inception", axes.oi], ["grand-budapest", axes.oe]],
      story("Which kind of adventure draws you in?", "أي مغامرة تجذبك أكثر؟", [
        option("A design whose scattered clues form a precise whole.", "مغامرة تتجمع خيوطها المتفرقة في بناء محكم.", axes.oi, "puzzle control"),
        option("An unpredictable journey through unusual places and encounters.", "رحلة مفاجئة بين أماكن ولقاءات غير مألوفة.", axes.oe, "discovery possibilities episodic")
      ]), l("Which would you revisit first?", "أيّهما تعيد مشاهدته أولاً؟")),

    filmQuestion("c2", "core", [["whiplash", axes.di], ["moneyball", axes.de]],
      story("Which pursuit of excellence interests you?", "أي سعي إلى التفوق يثير اهتمامك؟", [
        option("Someone driven to discover the limits of their own ability.", "شخص يدفع نفسه ليكتشف حدود قدرته.", axes.di, "ambition mastery selfWorth"),
        option("Someone who finds a better way for a whole team to work.", "شخص يبتكر طريقة أفضل لعمل فريق بأكمله.", axes.de, "systems cooperation problemSolving")
      ]), l("Which pursuit keeps you invested?", "أي رحلة نحو التفوق تشدّك أكثر؟")),

    filmQuestion("c3", "core", [["arrival", axes.o], ["social-network", axes.d]],
      story("Which mystery would stay with you?", "أي لغز سيبقى في ذهنك؟", [
        option("Understanding the rules behind a world you cannot yet explain.", "فهم قواعد عالم لا تستطيع تفسيره بعد.", axes.o, "truth language discovery"),
        option("Understanding why people who built something together turn against each other.", "فهم كيف يتخاصم أشخاص بنوا شيئاً معاً.", axes.d, "relationship ethics identity")
      ]), l("Which story makes you think longer?", "أيّهما يشغلك فكرياً لوقت أطول؟")),

    filmQuestion("c4", "core", [["dunkirk", axes.oi], ["1917", axes.oe]],
      story("Which journey through danger would you follow?", "أي رحلة وسط الخطر تتابع بشغف أكبر؟", [
        option("Several timelines moving towards one decisive moment.", "مسارات زمنية متعددة تتجه إلى لحظة حاسمة واحدة.", axes.oi, "time puzzle control"),
        option("Moving through a changing environment, discovering the next moment as it arrives.", "عبور بيئة متغيرة واكتشاف كل لحظة عند وقوعها.", axes.oe, "discovery sensory suspense")
      ]), l("Which cinematic experience grips you more?", "أي تجربة سينمائية تستغرقك أكثر؟")),

    filmQuestion("c5", "core", [["inside-out", axes.di], ["coco", axes.de]],
      story("Which coming-of-age story would you choose?", "أي قصة عن النضج تختار؟", [
        option("A child's changing understanding of their own feelings.", "طفل يتغير فهمه لمشاعره وهويته.", axes.di, "identity growth emotional"),
        option("A child discovering what family and shared memories mean.", "طفل يكتشف معنى العائلة وذاكرتها المشتركة.", axes.de, "familyBond memory community")
      ]), l("Which animated world feels closer to you?", "أي عالم من هذين الفيلمين أقرب إليك؟")),

    filmQuestion("c6", "core", [["dune-two", axes.oi], ["black-swan", axes.di], ["oppenheimer", axes.de], ["mickey-17", axes.oe]],
      story("Which pressure makes a compelling story?", "أي نوع من الضغوط يصنع قصة تشدّك؟", [
        option("A future defined by a vision and the events leading towards it.", "رؤية للمستقبل وأحداث تتجه نحو تحقيقها.", axes.oi, "destiny systems control"),
        option("The demands a person makes of themselves.", "ما يطالب به الإنسان نفسه من كمال.", axes.di, "identity obsession mastery"),
        option("A discovery with consequences for a whole society.", "اكتشاف تترتب عليه عواقب تطال المجتمع.", axes.de, "ethics duty power"),
        option("Strange possibilities in a world with unfamiliar rules.", "احتمالات غريبة في عالم ذي قواعد غير مألوفة.", axes.oe, "discovery possibilities worldbuilding")
      ]), l("Which film's central conflict interests you most?", "أي صراع محوري يثير اهتمامك أكثر؟")),

    filmQuestion("c7", "core", [["la-la-land", {}], ["past-lives", {}], ["challengers", {}]],
      story("Which story about connection moves you?", "أي قصة عن الارتباط تحركك أكثر؟", [
        option("An expressive romance shaped by dreams and ambition.", "رومانسية تعبيرية تصوغها الأحلام والطموح.", {}, "romance ambition music visual"),
        option("A quiet reunion shaped by time and the lives we could have lived.", "لقاء هادئ تصوغه السنوات والحيوات التي كان يمكن أن نعيشها.", {}, "romance memory time contemplative"),
        option("Intimacy and desire intertwined with rivalry and ambition.", "حميمية ورغبة تتشابكان مع المنافسة والطموح.", {}, "romance ambition sport power")
      ]), l("Which romance stays with you more?", "أي رومانسيّة تبقى معك أكثر؟")),

    filmQuestion("c8", "core", [["blade-runner", axes.o], ["gone-girl", axes.d]],
      story("What makes you keep questioning a film?", "ما الذي يجعلك تستمر في طرح الأسئلة عن الفيلم؟", [
        option("The truth behind an unfamiliar world and its hidden history.", "حقيقة عالم غير مألوف وتاريخه الخفي.", axes.o, "truth worldbuilding meaning"),
        option("The shifting versions people present of themselves and others.", "الصور المتغيرة التي يقدمها الناس عن أنفسهم وعن الآخرين.", axes.d, "identity relationship psychological")
      ]), l("Which mystery pulls you back in?", "أي لغز يجعلك ترغب في العودة إليه؟")),

    filmReaction("c9", "core", "inside-out", "What did you feel most invested in during Riley's story?", "بأي جانب من قصة رايلي ارتبطت أكثر؟", [
      option("Joy's wish to keep Riley's familiar world intact.", "رغبة جوي في الحفاظ على عالم رايلي المألوف.", axes.oi, "control memory"),
      option("Riley finding new experiences and ways to adapt.", "اكتشاف رايلي تجارب جديدة وطرقاً للتكيف.", axes.oe, "discovery growth"),
      option("Sadness making room for feelings Riley cannot ignore.", "إتاحة سادنس مساحة لمشاعر لا تستطيع رايلي تجاهلها.", axes.di, "identity selfWorth emotional"),
      option("Riley's changing connection to the people around her.", "تغير علاقة رايلي بالأشخاص المحيطين بها.", axes.de, "familyBond relationship")
    ], story("A child moves to a new city. What do you hope the story explores?", "ينتقل طفل إلى مدينة جديدة. ماذا تتمنى أن تتابع القصة؟", [
      option("The memories that preserve a sense of continuity.", "الذكريات التي تحفظ الشعور باستمرار حياته.", axes.oi, "memory routine"),
      option("The unexpected possibilities of the new place.", "الاحتمالات المفاجئة للمكان الجديد.", axes.oe, "discovery possibilities"),
      option("How the child comes to understand their own feelings.", "كيف يفهم الطفل مشاعره الخاصة.", axes.di, "identity emotional"),
      option("How family and friends learn to support the child.", "كيف تتعلم العائلة والأصدقاء مساندته.", axes.de, "familyBond friendship")
    ]), true),

    filmReaction("c10", "core", "batman", "What held your attention most in Gotham?", "ما الذي استحوذ على اهتمامك في غوثام؟", [
      option("The detective's attempts to connect the clues.", "محاولة المحقق ربط القرائن المتفرقة.", axes.oi, "truth puzzle"),
      option("Discovering how unpredictable and unfamiliar the city could become.", "اكتشاف جوانب المدينة غير المتوقعة.", axes.oe, "discovery uncertainty"),
      option("Bruce's struggle with who he has chosen to become.", "صراع بروس مع الهوية التي اختارها لنفسه.", axes.di, "identity selfWorth"),
      option("The public consequences of the choices made by its powerful people.", "آثار قرارات أصحاب النفوذ على أهل المدينة.", axes.de, "justice community power")
    ], story("A city conceals a mystery. Which thread would you pursue?", "مدينة تخفي لغزاً. أي خيط تريد متابعته؟", [
      option("How its hidden clues fit together.", "كيف تلتئم القرائن الخفية.", axes.oi, "puzzle truth"),
      option("What lies beyond the places already explored.", "ما يقع وراء الأماكن التي استكشفناها.", axes.oe, "discovery uncertainty"),
      option("The investigator's personal reasons for continuing.", "دوافع المحقق الشخصية للاستمرار.", axes.di, "identity obsession"),
      option("What solving the mystery means to the community.", "ما يعنيه حل اللغز لأفراد المجتمع.", axes.de, "justice community")
    ])),

    ending("c11", "core", "interstellar", "hopeful-ending bittersweet-ending", [
      option("The connections between events finally take on a meaning.", "تكتسب الروابط بين الأحداث معنى متماسكاً.", axes.oi, "time meaning"),
      option("The future beyond the final scene remains imaginable.", "يبقى المستقبل بعد المشهد الأخير مفتوحاً للتخيل.", axes.oe, "possibilities discovery"),
      option("A character honours a commitment that defines them.", "يحقق شخص التزاماً يعبّر عن هويته.", axes.di, "identity duty"),
      option("The relationship at the centre of the story reaches its emotional culmination.", "تصل العلاقة المحورية إلى ذروتها العاطفية.", axes.de, "familyBond love emotional")
    ], story("A long journey ends. Which resolution matters most?", "تنتهي رحلة طويلة. أي خاتمة تعنيك أكثر؟", [
      option("The journey's hidden logic is finally apparent.", "يتضح أخيراً المنطق الخفي للرحلة.", axes.oi, "meaning closed"),
      option("A new horizon becomes possible.", "يصبح أفق جديد ممكناً.", axes.oe, "possibilities open"),
      option("The traveller has remained true to a personal promise.", "ظل المسافر وفياً لوعد شخصي.", axes.di, "identity duty"),
      option("A bond between people is restored or transformed.", "تُستعاد أو تتغير صلة بين أشخاص.", axes.de, "relationship hope")
    ])),

    abstractQuestion("c12", "core", "When a film ends and keeps troubling you, what is usually unresolved?", "عندما ينتهي فيلم ويظل يؤرقك، ما الذي يبقى عالقاً غالباً؟", [
      option("How the scattered events belong to one whole.", "كيف تنتظم أحداثه المتفرقة في صورة واحدة.", axes.oi, "puzzle meaning"),
      option("What other directions the story could have taken.", "الاتجاهات الأخرى التي كان يمكن أن تسلكها القصة.", axes.oe, "possibilities ambiguity"),
      option("Whether a person remained faithful to what they believed.", "مدى بقاء الشخصية وفية لما تؤمن به.", axes.di, "belief identity"),
      option("Whether people judged or understood one another fairly.", "هل حكم الأشخاص على بعضهم أو فهموا بعضهم بإنصاف؟", axes.de, "ethics relationship")
    ]),

    // Depth: parallel choices across directors, genres, and characters.
    filmQuestion("d1", "depth", [["arrival", axes.oi], ["poor-things", axes.oe]],
      story("What makes an extraordinary world compelling?", "ما الذي يجعل عالماً استثنائياً جذاباً؟", [
        option("Gradually uncovering the rule that brings everything together.", "اكتشاف القاعدة التي تجمع كل شيء تدريجياً.", axes.oi, "truth puzzle meaning"),
        option("Discovering what is possible beyond its accepted rules.", "اكتشاف الممكن خارج قواعده المألوفة.", axes.oe, "freedom discovery possibilities")
      ]), l("Which encounter with the unfamiliar attracts you?", "أي لقاء مع المجهول يجذبك؟")),

    filmQuestion("d2", "depth", [["prisoners", axes.o], ["anatomy-fall", axes.d]],
      story("Which kind of uncertainty intrigues you?", "أي نوع من الغموض يثير فضولك؟", [
        option("Missing information and the reconstruction of an event.", "المعلومات الناقصة وإعادة تركيب الحدث.", axes.o, "truth puzzle uncertainty"),
        option("How people interpret one another when their accounts conflict.", "كيف يفسر الناس بعضهم حين تتعارض رواياتهم.", axes.d, "relationship perspective ethics")
      ]), l("Which kind of investigation would you follow?", "أي نوع من التحقيق ترغب في متابعته؟")),

    filmQuestion("d3", "depth", [["black-swan", axes.di], ["tar", axes.de]],
      story("What interests you about an exceptional artist?", "ما الذي يثير اهتمامك بفنان استثنائي؟", [
        option("Their internal struggle with a personal ideal of perfection.", "صراعهم الداخلي مع مثال شخصي للكمال.", axes.di, "identity mastery obsession"),
        option("The relationship between their artistic power and the institution around them.", "علاقة نفوذهم الفني بالمؤسسة المحيطة بهم.", axes.de, "power ethics authority")
      ]), l("Whose artistic world fascinates you more?", "أي عالم فني يثير اهتمامك أكثر؟")),

    filmQuestion("d4", "depth", [["her", axes.di], ["little-women", axes.de]],
      story("Which intimate story would you follow?", "أي قصة حميمة ترغب في متابعتها؟", [
        option("A person reimagining their inner life and their own idea of connection.", "شخص يعيد فهم عالمه الداخلي وتصوره للارتباط.", axes.di, "identity love loneliness"),
        option("Several people negotiating love, work and a shared family life.", "أشخاص يوازنون بين الحب والعمل والحياة العائلية المشتركة.", axes.de, "familyBond duty relationship")
      ]), l("Which intimate world resonates with you?", "أي عالم حميم تتفاعل معه أكثر؟")),

    filmQuestion("d5", "depth", [["tenet", axes.oi], ["mickey-17", axes.oe]],
      story("What appeals to you in a speculative world?", "ما الذي يجذبك في عالم خيالي؟", [
        option("Working out the underlying rules that connect its events.", "اكتشاف القواعد الكامنة التي تربط أحداثه.", axes.oi, "time systems puzzle"),
        option("The unexpected situations a strange world keeps producing.", "المواقف المفاجئة التي لا ينفك عالم غريب ينتجها.", axes.oe, "possibilities discovery improvisation")
      ]), l("Which science-fiction world would you explore further?", "أي عالم من الخيال العلمي ترغب في استكشافه أكثر؟")),

    filmQuestion("d6", "depth", [["past-lives", {}], ["materialists", {}], ["worst-person", {}], ["before-midnight", {}]],
      story("Which version of an intimate story interests you?", "أي شكل من القصص الحميمة يثير اهتمامك؟", [
        option("Love shaped by distance, memory and paths not taken.", "حب تصوغه المسافات والذاكرة والطرق التي لم نسلكها.", {}, "memory romance time"),
        option("Love shaped by the values and choices of everyday life.", "حب تصوغه قيم الحياة اليومية وخياراتها.", {}, "romance class relationship"),
        option("A life still discovering who it wants to become.", "حياة لا تزال تكتشف ما تريد أن تصبحه.", {}, "identity change freedom"),
        option("A long relationship examined through honest conversation.", "علاقة طويلة تُفحص عبر حوار صريح.", {}, "dialogue familyBond realism")
      ]), l("Which kind of relationship feels most compelling?", "أي نوع من العلاقات تجده أكثر إقناعاً؟")),

    filmReaction("d7", "depth", "arrival", "Which aspect of Louise's experience stayed with you?", "أي جانب من تجربة لويز بقي معك؟", [
      option("The way apparently separate details begin to make sense.", "بدء التفاصيل المنفصلة في اكتساب معنى موحد.", axes.oi, "time puzzle meaning"),
      option("The radically unfamiliar way of perceiving the world.", "الطريقة المختلفة جذرياً في إدراك العالم.", axes.oe, "language discovery possibilities"),
      option("The meaning of the choices Louise makes for herself.", "معنى القرارات التي تتخذها لويز لنفسها.", axes.di, "identity belief"),
      option("The effort to build understanding across divided groups.", "محاولة بناء تفاهم بين جماعات متفرقة.", axes.de, "cooperation community language")
    ], story("A traveller meets a culture with a different way of understanding time. What intrigues you?", "يلتقي مسافر ثقافة تفهم الزمن بطريقة مختلفة. ما الذي يثير اهتمامك؟", [
      option("The underlying pattern that explains its customs.", "النمط الذي يفسر عاداتها.", axes.oi, "time meaning"),
      option("The new forms of experience it makes possible.", "أشكال التجربة الجديدة التي تتيحها.", axes.oe, "discovery possibilities"),
      option("How the traveller reconsiders their own choices.", "كيف يعيد المسافر النظر في اختياراته.", axes.di, "identity belief"),
      option("How two communities learn to understand one another.", "كيف يتعلم مجتمعان فهم بعضهما.", axes.de, "cooperation language")
    ])),

    filmReaction("d8", "depth", "dune-two", "As Paul's world changes, where does your attention go?", "حين يتغير عالم بول، إلى أين يتجه اهتمامك؟", [
      option("The visions, patterns and consequences that shape the future.", "الرؤى والأنماط والعواقب التي تصوغ المستقبل.", axes.oi, "destiny control"),
      option("The unfamiliar ways of living and possible paths ahead.", "طرق الحياة غير المألوفة والمسارات المحتملة.", axes.oe, "discovery possibilities"),
      option("What Paul wants to be and the choices that define him.", "ما يريد بول أن يكونه والخيارات التي تحدد هويته.", axes.di, "identity belief"),
      option("How his rise changes the lives of the people around him.", "كيف يغير صعوده حياة المحيطين به.", axes.de, "community power duty")
    ], story("Someone inherits an influential role in a changing society. Which question interests you?", "يرث شخص دوراً مؤثراً في مجتمع متغير. أي سؤال يهمك؟", [
      option("What future has been set in motion?", "أي مستقبل بدأت أسبابه تتشكل؟", axes.oi, "destiny meaning"),
      option("What other paths could emerge?", "أي مسارات أخرى يمكن أن تظهر؟", axes.oe, "possibilities discovery"),
      option("Who will they choose to become?", "مَن سيختار أن يكون؟", axes.di, "identity freedom"),
      option("What will their decisions mean to others?", "ماذا ستعني قراراته للآخرين؟", axes.de, "community ethics")
    ])),

    filmReaction("d9", "depth", "phantom-thread", "Which perspective in the relationship interests you most?", "أي منظور داخل العلاقة يثير اهتمامك أكثر؟", [
      option("Reynolds trying to preserve his ordered creative life.", "محاولة رينولدز الحفاظ على نظام حياته الإبداعية.", axes.oi, "routine control craft"),
      option("Alma introducing experiences that change the household's rhythm.", "إدخال آلما تجارب تغير إيقاع المنزل.", axes.oe, "change discovery"),
      option("Either person's desire to remain true to their own needs.", "رغبة كل منهما في الوفاء لاحتياجاته الخاصة.", axes.di, "identity selfWorth"),
      option("The shifting balance of care, authority and dependence between them.", "تغير توازن الرعاية والسلطة والاعتماد بينهما.", axes.de, "relationship power")
    ], story("Two people share a life built around one person's craft. What would interest you?", "شخصان يتشاركان حياة تقوم على حرفة أحدهما. ما الذي يهمك؟", [
      option("The daily structure that gives the work its shape.", "النظام اليومي الذي يمنح العمل شكله.", axes.oi, "routine craft"),
      option("Unexpected ways their habits might change.", "طرق غير متوقعة قد تتغير بها عاداتهما.", axes.oe, "change possibilities"),
      option("The personal limits each needs to express.", "الحدود الشخصية التي يحتاج كل منهما إلى التعبير عنها.", axes.di, "identity selfWorth"),
      option("How their relationship renegotiates care and control.", "كيف تعيد علاقتهما تشكيل الرعاية والسيطرة.", axes.de, "relationship power")
    ]), true),

    filmReaction("d10", "depth", "no-other-choice", "What is most compelling about Man-su's predicament?", "ما الأكثر إثارة لاهتمامك في مأزق مان سو؟", [
      option("The collapse of the familiar structure of his life.", "انهيار الهيكل المألوف لحياته.", axes.oi, "routine control uncertainty"),
      option("The unforeseen options an unstable situation creates.", "الخيارات غير المتوقعة التي يخلقها وضع غير مستقر.", axes.oe, "possibilities change"),
      option("The way work becomes tied to his personal worth.", "ارتباط العمل بقيمته الذاتية.", axes.di, "selfWorth identity"),
      option("The demands of family, competition and the system around him.", "متطلبات العائلة والمنافسة والنظام المحيط به.", axes.de, "familyBond systems class")
    ], story("A person suddenly loses the job that shaped their life. Which aspect would you explore?", "يفقد شخص فجأة عمله الذي شكّل حياته. أي جانب ترغب في استكشافه؟", [
      option("Losing the predictable structure of each day.", "فقدان البنية المتوقعة لكل يوم.", axes.oi, "routine control"),
      option("The alternative futures suddenly available.", "المستقبلات البديلة التي أصبحت ممكنة.", axes.oe, "change possibilities"),
      option("Rebuilding a sense of personal value.", "إعادة بناء الإحساس بالقيمة الذاتية.", axes.di, "selfWorth identity"),
      option("How work and family expectations constrain a life.", "كيف تقيد توقعات العمل والعائلة حياة الفرد.", axes.de, "familyBond systems")
    ])),

    filmReaction("d11", "depth", "mickey-17", "Which part of Mickey's strange existence draws you in?", "أي جانب من وجود ميكي الغريب يجذبك؟", [
      option("Understanding the rules governing this society.", "فهم القواعد التي تحكم هذا المجتمع.", axes.oi, "systems truth"),
      option("The unprecedented encounters and possibilities of the new world.", "لقاءات العالم الجديد واحتمالاته غير المسبوقة.", axes.oe, "discovery possibilities"),
      option("The question of what makes a person uniquely themselves.", "السؤال عمّا يجعل الإنسان هو نفسه.", axes.di, "identity meaning"),
      option("How a social system determines whose life matters.", "كيف يحدد النظام الاجتماعي قيمة حياة الفرد.", axes.de, "ethics class power")
    ], story("A worker can be replaced by an identical copy. Which question fascinates you?", "يمكن استبدال عامل بنسخة مطابقة له. أي سؤال يثير اهتمامك؟", [
      option("What rules make that world possible?", "أي قواعد تجعل هذا العالم ممكناً؟", axes.oi, "systems truth"),
      option("What unexpected experiences could that produce?", "أي تجارب غير متوقعة يمكن أن ينتجها ذلك؟", axes.oe, "possibilities discovery"),
      option("What is left of a person's unique identity?", "ماذا يتبقى من هوية الفرد الفريدة؟", axes.di, "identity meaning"),
      option("Who gets to decide the value of a person's life?", "من يقرر قيمة حياة الشخص؟", axes.de, "ethics power")
    ])),

    filmReaction("d12", "depth", "oppenheimer", "Which thread of Oppenheimer's story stays with you?", "أي خيط من قصة أوبنهايمر يبقى معك؟", [
      option("How discoveries and decisions accumulate into a turning point in history.", "كيف تتراكم الاكتشافات والقرارات لتصنع منعطفاً تاريخياً.", axes.oi, "systems time meaning"),
      option("The excitement and uncertainty of a frontier of knowledge.", "إثارة وغموض تخوم المعرفة الجديدة.", axes.oe, "discovery uncertainty"),
      option("The private moral reckoning of the scientist.", "مراجعة العالم الأخلاقية لنفسه.", axes.di, "belief identity ethics"),
      option("The responsibility of institutions and individuals to society.", "مسؤولية المؤسسات والأفراد تجاه المجتمع.", axes.de, "ethics duty authority")
    ], story("A discovery changes how society may live. Which question would anchor your story?", "يغير اكتشاف شكل حياة المجتمع الممكنة. أي سؤال سيكون محور قصتك؟", [
      option("How did events arrive at this decisive point?", "كيف وصلت الأحداث إلى هذه النقطة الحاسمة؟", axes.oi, "time systems"),
      option("What new possibilities have opened up?", "أي احتمالات جديدة انفتحت؟", axes.oe, "discovery possibilities"),
      option("What personal responsibility will the discoverer accept?", "أي مسؤولية شخصية سيقبلها المكتشف؟", axes.di, "belief ethics"),
      option("How should the wider community respond?", "كيف ينبغي للمجتمع الاستجابة؟", axes.de, "community duty")
    ])),

    filmReaction("d13", "depth", "sentimental-value", "What draws you into Nora's family story?", "ما الذي يجذبك في قصة عائلة نورا؟", [
      option("The way old memories, spaces and patterns shape the present.", "كيف تصوغ الذكريات والأماكن والأنماط القديمة الحاضر.", axes.oi, "memory familyBond"),
      option("The creative possibilities of transforming life into art.", "الاحتمالات الإبداعية لتحويل الحياة إلى فن.", axes.oe, "craft possibilities"),
      option("Nora's effort to protect her own sense of self.", "محاولة نورا الحفاظ على إحساسها بذاتها.", axes.di, "identity selfWorth"),
      option("How the family can understand what they have done to one another.", "كيف تستطيع العائلة فهم أثر أفرادها بعضهم في بعض.", axes.de, "familyBond relationship")
    ], story("An artist wants to make a work about an estranged family. What interests you?", "يرغب فنان بصنع عمل عن عائلة متباعدة. ما الذي يثير اهتمامك؟", [
      option("The history still present in their home and memories.", "التاريخ الذي لا يزال حاضراً في بيتهم وذكرياتهم.", axes.oi, "memory meaning"),
      option("The new ways art might let them imagine their past.", "الطرق الجديدة التي يتيحها الفن لتخيل ماضيهم.", axes.oe, "craft possibilities"),
      option("Each person's right to define their own experience.", "حق كل فرد في تعريف تجربته الخاصة.", axes.di, "identity selfWorth"),
      option("The possibility of a different relationship between them.", "إمكانية نشوء علاقة مختلفة بينهم.", axes.de, "relationship familyBond")
    ])),

    filmReaction("d14", "depth", "one-battle", "Which connection between past and present interested you?", "أي رابط بين الماضي والحاضر أثار اهتمامك؟", [
      option("The consequences of earlier events returning years later.", "عودة تبعات الأحداث السابقة بعد سنوات.", axes.oi, "memory destiny"),
      option("Characters continually adapting to an unpredictable present.", "تكيف الشخصيات المستمر مع حاضر غير متوقع.", axes.oe, "improvisation change"),
      option("Willa defining her own identity within what she inherited.", "تحديد ويلا لهويتها الخاصة في ظل ما ورثته.", axes.di, "identity freedom"),
      option("The bond and obligations between different generations.", "الرابط والالتزامات بين أجيال مختلفة.", axes.de, "familyBond duty")
    ], story("A parent's past unexpectedly enters their child's present. Which aspect would stay with you?", "يدخل ماضي أحد الوالدين فجأة إلى حاضر ابنه. أي جانب سيبقى معك؟", [
      option("The history that explains how they arrived here.", "التاريخ الذي يفسر كيف وصلا إلى هنا.", axes.oi, "memory meaning"),
      option("The new ways they adapt to changing circumstances.", "الطرق الجديدة لتكيفهما مع الظروف المتغيرة.", axes.oe, "change improvisation"),
      option("The child's effort to shape an independent identity.", "محاولة الابن تشكيل هوية مستقلة.", axes.di, "identity freedom"),
      option("The responsibilities that link the two generations.", "المسؤوليات التي تربط الجيلين.", axes.de, "familyBond duty")
    ])),

    // Endings: satisfaction is recorded independently of the reason and emotion.
    ending("d15", "endings", "la-la-land", "bittersweet-ending closed", [
      option("The final scene makes the shared past newly meaningful.", "يمنح المشهد الأخير الماضي المشترك معنى جديداً.", axes.oi, "memory meaning"),
      option("The alternative life imagined by the film.", "الحياة البديلة التي يتخيلها الفيلم.", axes.oe, "possibilities"),
      option("The importance of remaining true to one's own dream.", "أهمية الوفاء بالحلم الشخصي.", axes.di, "ambition identity"),
      option("The continuing significance of the relationship itself.", "بقاء معنى العلاقة نفسها.", axes.de, "love relationship")
    ], story("Two people pursue their dreams. What kind of ending would you prefer?", "يسعى شخصان وراء أحلامهما. أي خاتمة تفضل؟", [
      option("An ending that makes the story's earlier moments feel complete.", "خاتمة تكمل معنى لحظات القصة السابقة.", axes.oi, "closed meaning"),
      option("A glimpse of other lives that could have been.", "لمحة عن حيوات أخرى كان يمكن أن تحدث.", axes.oe, "open possibilities"),
      option("A personal dream fulfilled, even at a cost.", "تحقق حلم شخصي حتى إن كان بثمن.", axes.di, "ambition bittersweet-ending"),
      option("A bond that endures through changing circumstances.", "علاقة تستمر رغم تغير الظروف.", axes.de, "relationship hopeful-ending")
    ])),

    ending("d16", "endings", "inception", "ambiguous-ending open", [
      option("The last image invites me to connect the film's clues.", "تدفعني الصورة الأخيرة إلى ربط قرائن الفيلم.", axes.oi, "puzzle ambiguity"),
      option("More than one account of what happened remains possible.", "يبقى أكثر من تفسير لما حدث ممكناً.", axes.oe, "open possibilities"),
      option("The emotional journey of Cobb himself.", "رحلة كوب العاطفية الخاصة.", axes.di, "identity emotional"),
      option("What the ending means for his bond with his family.", "معنى الخاتمة لعلاقته بأسرته.", axes.de, "familyBond love")
    ], story("A film's final image could support several explanations. What would make it work for you?", "قد تدعم الصورة الأخيرة لفيلم عدة تفسيرات. ما الذي يجعلها ناجحة بالنسبة إليك؟", [
      option("Evidence for a coherent interpretation.", "وجود قرائن على تفسير متماسك.", axes.oi, "puzzle meaning"),
      option("Enough uncertainty to keep several interpretations alive.", "غموض يكفي لبقاء عدة تفسيرات.", axes.oe, "ambiguous-ending possibilities"),
      option("A convincing change in the central person's inner life.", "تحول مقنع في عالم الشخصية الداخلي.", axes.di, "identity growth"),
      option("A meaningful resolution of a relationship.", "حل ذو معنى لعلاقة بين أشخاص.", axes.de, "relationship closed")
    ])),

    ending("d17", "endings", "coco", "hopeful-ending closed", [
      option("Earlier memories and details gain their full significance.", "تكتسب الذكريات والتفاصيل السابقة كامل دلالتها.", axes.oi, "memory meaning"),
      option("The possibilities the experience opens for Miguel's future.", "الاحتمالات التي تفتحها التجربة أمام مستقبل ميغيل.", axes.oe, "possibilities growth"),
      option("Miguel finding his own place and voice.", "اكتشاف ميغيل مكانه وصوته الخاص.", axes.di, "identity craft"),
      option("The way a family's shared memory is restored.", "استعادة الذاكرة المشتركة للعائلة.", axes.de, "familyBond love")
    ], story("A young artist uncovers a family secret. Which conclusion would feel most satisfying?", "يكتشف فنان صغير سراً عائلياً. أي نهاية ستكون أكثر إرضاءً؟", [
      option("All the missing pieces of family history fall into place.", "ينتظم كل ما كان ناقصاً من تاريخ العائلة.", axes.oi, "memory closed"),
      option("An entirely new future opens for the artist.", "ينفتح مستقبل جديد كلياً للفنان.", axes.oe, "discovery hopeful-ending"),
      option("The artist finally finds a voice of their own.", "يجد الفنان صوته الخاص أخيراً.", axes.di, "identity growth"),
      option("The artist and their family find a way to understand each other.", "يجد الفنان وأسرته طريقة لفهم بعضهم.", axes.de, "familyBond hopeful-ending")
    ])),

    ending("d18", "endings", "hamnet", "bittersweet-ending closed", [
      option("The way earlier experiences return transformed through art.", "عودة التجارب الماضية بعد أن تتحول عبر الفن.", axes.oi, "memory meaning"),
      option("The unexpected dimensions art opens within grief.", "الأبعاد غير المتوقعة التي يفتحها الفن داخل الحزن.", axes.oe, "craft possibilities"),
      option("The personal truth each character must come to terms with.", "الحقيقة الشخصية التي ينبغي لكل شخصية التصالح معها.", axes.di, "identity loss"),
      option("The shared emotional experience that brings people together.", "التجربة العاطفية المشتركة التي تجمع الناس.", axes.de, "familyBond community")
    ], story("A work of art emerges from a family's loss. What would make its final scene meaningful?", "ينشأ عمل فني من فقد عائلة. ما الذي يجعل مشاهده الأخيرة ذات معنى؟", [
      option("Its expression of what the earlier story could not yet articulate.", "تعبيرها عما عجزت القصة السابقة عن قوله.", axes.oi, "memory meaning"),
      option("The new ways it lets us see the world of the story.", "الطرق الجديدة التي تسمح برؤية عالم القصة.", axes.oe, "perspective possibilities"),
      option("An individual acknowledging a difficult inner truth.", "اعتراف فرد بحقيقة داخلية صعبة.", axes.di, "identity loss"),
      option("A moment of understanding shared by the family.", "لحظة فهم مشتركة بين أفراد العائلة.", axes.de, "relationship familyBond")
    ])),

    ending("d19", "endings", "past-lives", "bittersweet-ending closed", [
      option("Time and all the years that led to the final moment.", "الزمن وكل السنوات التي قادت إلى اللحظة الأخيرة.", axes.oi, "time memory"),
      option("The lives the characters might have lived.", "الحيوات التي كان يمكن للشخصيات أن تعيشها.", axes.oe, "possibilities"),
      option("Nora's acceptance of the person she has become.", "تقبل نورا للشخص الذي أصبحت عليه.", axes.di, "identity growth"),
      option("The respect and tenderness between the people involved.", "الاحترام والحنان بين الأشخاص المعنيين.", axes.de, "relationship love")
    ], story("People reconnect after many years. Which ending would feel right?", "يلتقي أشخاص بعد سنوات طويلة. أي نهاية ستبدو صائبة؟", [
      option("They understand the meaning of the years that separated them.", "يفهمون معنى السنوات التي فرقتهم.", axes.oi, "time meaning"),
      option("We glimpse what other paths might have held.", "نلمح ما كان يمكن أن تحمله المسارات الأخرى.", axes.oe, "open possibilities"),
      option("Each can accept the person they have become.", "يتقبل كل منهم الإنسان الذي أصبحه.", axes.di, "identity growth"),
      option("Their present relationships gain greater understanding.", "تكتسب علاقاتهم الحالية فهماً أعمق.", axes.de, "relationship love")
    ])),

    ending("d20", "endings", "challengers", "open ambiguous-ending", [
      option("The way the relationships and competition converge.", "طريقة التقاء خيوط العلاقات والمنافسة.", axes.oi, "puzzle meaning"),
      option("What could happen to them beyond that last moment.", "ما قد يحدث لهم بعد اللحظة الأخيرة.", axes.oe, "possibilities open"),
      option("Whether a character has met their own personal challenge.", "مدى مواجهة الشخصية لتحديها الشخصي.", axes.di, "mastery selfWorth"),
      option("The changing connection and balance between the three people.", "تغير الصلة والتوازن بين الأشخاص الثلاثة.", axes.de, "relationship power")
    ], story("Three rivals share a final decisive moment. Which resolution matters to you?", "يتشارك ثلاثة منافسين لحظة أخيرة حاسمة. أي حل يعنيك أكثر؟", [
      option("The moment reveals the pattern behind their earlier choices.", "تكشف اللحظة النمط وراء خياراتهم السابقة.", axes.oi, "meaning closed"),
      option("It opens several plausible futures for them.", "تفتح أمامهم عدة مستقبلات محتملة.", axes.oe, "open possibilities"),
      option("Someone discovers what success means personally.", "يكتشف أحدهم المعنى الشخصي للنجاح.", axes.di, "selfWorth mastery"),
      option("Their relationship reaches a meaningful turning point.", "تصل علاقتهم إلى منعطف ذي معنى.", axes.de, "relationship change")
    ])),

    abstractQuestion("d21", "endings", "Two stories are equally well made. Which final experience would you seek?", "قصتان متساويتان في جودة الصنع. أي تجربة ختامية تبحث عنها؟", [
      option("Relief and hope after the characters reach a resolution.", "ارتياح وأمل بعد أن تصل الشخصيات إلى حل.", {}, "hopeful-ending hopeful closed"),
      option("A deeply felt loss that gives the journey meaning.", "فقد مؤثر يمنح الرحلة معنى.", {}, "tragic melancholic loss"),
      option("Warmth and sadness existing together.", "دفء وحزن يجتمعان معاً.", {}, "bittersweet-ending bittersweet emotional"),
      option("A continuing question that lives beyond the final image.", "سؤال يستمر بعد الصورة الأخيرة.", {}, "open ambiguous-ending ambiguity")
    ]),

    abstractQuestion("d22", "endings", "What would most disappoint you at the end of an otherwise excellent film?", "ما الذي يخيب أملك أكثر في نهاية فيلم ممتاز؟", [
      option("Promising threads never gain a convincing connection.", "خيوط واعدة لا تصل إلى ترابط مقنع.", axes.oi, "puzzle meaning closed"),
      option("The last scene explains every possibility too completely.", "يفسر المشهد الأخير كل الاحتمالات بإفراط.", axes.oe, "ambiguity open possibilities"),
      option("A character abandons something essential to who they are.", "تتخلى شخصية عن شيء جوهري في هويتها.", axes.di, "identity belief"),
      option("A meaningful relationship is treated as an afterthought.", "تُعامل علاقة مهمة بوصفها تفصيلاً ثانوياً.", axes.de, "relationship love")
    ]),

    // Style and atmosphere: aesthetic taste without extra personality labels.
    filmQuestion("d23", "style", [["dark-knight-rises", {}], ["decision-leave", {}], ["wolf-wall-street", {}], ["tree-life", {}]],
      story("Which cinematic language do you gravitate towards?", "إلى أي لغة سينمائية تميل؟", [
        option("Sweeping, carefully constructed spectacle.", "مشاهد ملحمية واسعة ومحكمة البناء.", {}, "epic action plot"),
        option("A psychologically layered mystery told through visual details.", "لغز نفسي متعدد الطبقات يروى بالتفاصيل البصرية.", {}, "visual mystery psychological"),
        option("Restless energy, humour and social observation.", "طاقة لا تهدأ وفكاهة وملاحظة اجتماعية.", {}, "fast satire class"),
        option("Poetic images, sensation and reflection.", "صور شعرية وإحساس وتأمل.", {}, "symbolic contemplative visual")
      ]), l("Which filmmaker's approach would you seek out?", "أي أسلوب سينمائي ترغب في متابعته؟")),

    filmQuestion("d24", "style", [["aftersun", {}], ["babylon", {}], ["dune-two", {}], ["asteroid-city", {}]],
      story("Which rhythm of storytelling feels most engaging?", "أي إيقاع سردي يشدّك أكثر؟", [
        option("Quiet moments and the weight of ordinary details.", "لحظات هادئة وثقل التفاصيل العادية.", {}, "slow observational memory"),
        option("Movement, sound and a restless collision of events.", "حركة وصوت وتصادم أحداث لا يهدأ.", {}, "fast sensory intense"),
        option("Patiently built spectacle and a sense of a vast world.", "ملحمية تتشكل بتأنٍّ وإحساس بعالم واسع.", {}, "epic worldbuilding wonder"),
        option("Inventive, stylized scenes with playful changes of direction.", "مشاهد مبتكرة ومنمقة وتحولات مرحة.", {}, "stylized episodic playful")
      ]), l("Which rhythm of a film appeals to you?", "أي إيقاع سينمائي يجذبك أكثر؟")),

    filmQuestion("d25", "style", [["1917", {}], ["blade-runner", {}], ["poor-things", {}], ["grand-budapest", {}]],
      story("Which visual language would you choose?", "أي لغة بصرية تختار؟", [
        option("Immersive landscapes and continuous movement.", "مشاهد مكانية غامرة وحركة مستمرة.", {}, "sensory realism visual"),
        option("Atmospheric architecture, light and vast spaces.", "عمارة وضوء وفضاءات واسعة مشحونة بالأجواء.", {}, "visual worldbuilding noir"),
        option("Surreal design and an invented sense of reality.", "تصميم سريالي وإحساس مبتكر بالواقع.", {}, "symbolic stylized visual"),
        option("Symmetry, colour and deliberately composed frames.", "تماثل ولون وكادرات مرتبة بعناية.", {}, "stylized visual playful")
      ]), l("Which visual world would you most like to inhabit?", "أي عالم بصري تتمنى أن تنغمس فيه؟"), "still"),

    abstractQuestion("d26", "style", "Which way of seeing the world would you choose for an evening of cinema?", "أي طريقة لرؤية العالم تختارها لأمسية سينمائية؟", [
      option("Real people observed over time in a documentary.", "أشخاص حقيقيون نتابعهم عبر الزمن في فيلم وثائقي.", {}, "documentary observational realism"),
      option("Fiction grounded in ordinary human behaviour.", "خيال سردي يرتكز إلى السلوك الإنساني اليومي.", {}, "realism character observational"),
      option("A heightened and carefully composed cinematic world.", "عالم سينمائي مكثف ومصمم بعناية.", {}, "stylized visual craft"),
      option("A dreamlike world carrying layers of symbolic meaning.", "عالم حلمي يحمل طبقات من المعنى الرمزي.", {}, "symbolic existential ambiguity")
    ]),

    filmQuestion("d27", "style", [["coco", {}], ["aftersun", {}], ["shutter-island", {}], ["your-name", {}]],
      story("Which emotional atmosphere brings you back to a film?", "أي أجواء عاطفية تجعلك تعود إلى فيلم؟", [
        option("Warmth, memory and family bonds.", "الدفء والذاكرة والصلات العائلية.", {}, "warm familyBond memory"),
        option("A quiet melancholy that grows after the viewing.", "شجن هادئ يتعمق بعد المشاهدة.", {}, "melancholic contemplative loss"),
        option("Unease and the pleasure of questioning what is real.", "قلق ومتعة التساؤل عما هو حقيقي.", {}, "suspense uncertainty psychological"),
        option("Wonder, longing and the sense of a connection beyond time.", "الدهشة والحنين والإحساس بصلة تتجاوز الزمن.", {}, "wonder love time")
      ]), l("Which atmosphere do you find yourself returning to?", "إلى أي أجواء تجد نفسك تعود؟")),

    filmQuestion("d28", "style", [["sentimental-value", {}], ["mickey-17", {}], ["marty-supreme", {}], ["one-battle", {}]],
      story("What would you seek out in contemporary cinema?", "عمّ تبحث في السينما المعاصرة؟", [
        option("Intimate families, memory and the role of art.", "العائلات والذاكرة ودور الفن.", {}, "familyBond memory craft"),
        option("Speculative worlds that question human identity.", "عوالم تخيلية تسائل الهوية الإنسانية.", {}, "scifi identity systems"),
        option("The restless energy of a deeply ambitious person.", "طاقة لا تهدأ لشخص شديد الطموح.", {}, "ambition mastery fast"),
        option("Dynamic stories about generations and a changing society.", "قصص ديناميكية عن الأجيال ومجتمع متغير.", {}, "familyBond change action")
      ]), l("Which recent story would you choose for tonight?", "أي قصة حديثة تختار لمشاهدة الليلة؟"))
  ];


  // Separate S/N and T/F contrasts. The still is a visual cue only; the
  // answer concerns the hypothetical story, not the personality of a film.
  function framedChoice(id, frameFilm, en, ar, opts) {
    return {...abstractQuestion(id,"core",en,ar,opts), frameFilm};
  }
  const functionQuestions = [
    framedChoice("p1","blade-runner","When a scene first draws you in, what do you want to understand?","حين يلفت مشهد انتباهك، ماذا تريد أن تفهم أولاً؟",[
      option("The specific details, sounds and actions that establish what is happening.","التفاصيل والأصوات والأفعال المحددة التي توضّح ما يحدث.",{sn:1},"sensory observational realism"),
      option("The connections and implications that suggest what the scene may mean.","الروابط والإيحاءات التي تكشف ما قد يعنيه المشهد.",{sn:-1},"symbolic meaning perspective")]),
    framedChoice("p2","moneyball","Two characters disagree on a difficult decision. What makes an argument convincing to you?","شخصيتان تختلفان في قرار صعب. ما الذي يجعل الحجة مقنعة لك؟",[
      option("Its reasoning is consistent and accounts for the consequences of both options.","اتساق منطقه وأخذه عواقب الخيارين بالحسبان.",{tf:1},"systems problemSolving"),
      option("It respects the priorities and commitments that give the decision meaning.","احترامه الأولويات والالتزامات التي تمنح القرار معناه.",{tf:-1},"belief relationship")]),
    framedChoice("p3","grand-budapest","A filmmaker introduces an unfamiliar world. What would you instinctively look for?","يقدم المخرج عالماً غير مألوف. ما الذي تبحث عنه تلقائياً؟",[
      option("Its tangible places, customs and how ordinary things operate there.","أماكنه وعاداته المحسوسة وكيف تعمل الأشياء اليومية فيه.",{sn:1},"worldbuilding observational"),
      option("Its underlying patterns, possible worlds and what its rules imply.","أنماطه الكامنة والعوالم الممكنة وما توحي به قواعده.",{sn:-1},"possibilities discovery worldbuilding")]),
    framedChoice("p4","phantom-thread","A character must justify a choice that costs them something. What would complete that justification?","على شخصية أن تبرر خياراً يكلّفها شيئاً. ما الذي يكمل تبريرها؟",[
      option("An explanation of how the choice follows a principle that works across similar cases.","تفسير كيف يتبع الخيار مبدأً يصلح لحالات مشابهة.",{tf:1},"truth systems duty"),
      option("An explanation of why the choice is faithful to what the character deeply cares about.","تفسير لماذا يظل الخيار وفياً لما يهم الشخصية بعمق.",{tf:-1},"belief identity selfWorth")]),
    framedChoice("p5","arrival","After a film leaves something unresolved, how do you begin making sense of it?","بعد أن يترك الفيلم أمراً غير محسوم، كيف تبدأ بفهمه؟",[
      option("Reconstruct the events and check the concrete clues in the scenes.","أعيد ترتيب الأحداث وأراجع القرائن الملموسة في المشاهد.",{sn:1},"truth puzzle observational"),
      option("Connect recurring motifs and explore interpretations that fit the whole.","أربط الرموز المتكررة وأستكشف قراءات تناسب العمل ككل.",{sn:-1},"symbolic meaning ambiguity")]),
    framedChoice("p6","past-lives","What makes you return to a moral dilemma in a story?","ما الذي يجعلك تعود إلى معضلة أخلاقية في قصة؟",[
      option("The difficult trade-offs and whether the stated reasoning holds up.","الموازنات الصعبة وما إذا كان المنطق المطروح يصمد.",{tf:1},"ethics systems problemSolving"),
      option("The conflicting values of the people involved and what each choice would mean to them.","تعارض قيم الأشخاص المعنيين وما يعنيه كل اختيار لهم.",{tf:-1},"ethics relationship belief")]),
    framedChoice("p7","decision-leave","When you explain a memorable scene to a friend, what do you naturally begin with?","عندما تشرح مشهداً لا يُنسى لصديق، بماذا تبدأ عادةً؟",[
      option("What the camera showed, what was said, and the sequence of events.","ما عرضته الكاميرا وما قيل وتسلسل الأحداث.",{sn:1},"visual dialogue realism"),
      option("The central idea, the subtext and how the scene changes the story's meaning.","الفكرة المركزية والمعنى الضمني وكيف يغيّر المشهد معنى القصة.",{sn:-1},"meaning symbolic perspective")]),
    framedChoice("p8","social-network","When a film depicts conflicting loyalties, which question matters most to your evaluation?","عندما يصوّر فيلم ولاءات متعارضة، أي سؤال يهمك أكثر في تقييم الموقف؟",[
      option("Which judgment is most defensible when the same standards are applied to both sides?","أي حكم يمكن الدفاع عنه عند تطبيق المعايير نفسها على الطرفين؟",{tf:1},"justice truth ethics"),
      option("Which judgment best recognizes the commitments and values at stake for both sides?","أي حكم يدرك بصورة أفضل الالتزامات والقيم التي تعني الطرفين؟",{tf:-1},"relationship belief ethics")])
  ];
  questions.splice(12,0,...functionQuestions);
  const coreLimit=20, fullLimit=questions.length;

  // These items look for which unresolved tension catches the viewer's attention.
  // They carry additional weight when checking the binary OPS hypotheses.
  for (const question of questions) {
    if (["c3", "c12", "d2", "d8"].includes(question.id)) question.crossCheck = true;
  }

  const introCover = {filmId:"blade-runner",still:"blade-runner-2049-best-cinematography.webp"};
  const introFilms = ["phantom-thread", "souvenir", "her"];
  const introFrames = {
    "phantom-thread":"phantom-thread-best-actor-curator.webp",
    "souvenir":"the-souvenir-daily-frame.jpg",
    "her":"her-curator-frame-20261126-33.webp"
  };
  const sceneFilms = [
    ...introFilms,
    ...questions.flatMap(question=>question.filmId ? [question.filmId] :
      question.visual==="still" ? question.options.map(option=>option.filmId) : [])
  ];
  const artworkNames = [...new Set([
    ...films.map(movie=>movie.poster),
    ...sceneFilms.map(id=>filmById[id].still),
    introCover.still,...Object.values(introFrames)
  ].filter(Boolean))];
  globalThis.CinemaProfileData = { films, filmById, tagLabels, groups, questions, axes, introCover, introFilms, introFrames, artworkNames, coreLimit, fullLimit };
})();
