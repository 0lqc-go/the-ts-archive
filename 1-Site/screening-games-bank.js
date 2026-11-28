/* Editorial selections for Screening Room. Hard frames were reviewed as
   actual archive images. Classic may show identifiable performers; Challenge
   uses only composition, environment, objects, distance or silhouettes. */
(() => {
  'use strict';
  const hardFrames = {
    '2020-2026': [
      ["a-complete-unknown",["a-complete-unknown-film-file.webp"],["babylon-2022","nightmare-alley-2021","tick-tick-boom-2021"]],
      ["aftersun",["72464abb1057.webp","84066d7615e3.webp","7b6df2bd5a53.webp"],["past-lives","the-worst-person-in-the-world","sentimental-value-2025"]],
      ["anatomy-of-a-fall",["anatomy-of-a-fall-piano.webp"],["may-december","sentimental-value-2025","the-assessment-2024"]],
      ["asteroid-city",["ddbe29e5f34b.webp","c2a9d75f7e42.webp"],["the-french-dispatch-of-the-liberty-kansas","poor-things-2023","babylon-2022"]],
      ["babylon-2022",["8e9a7c058328.webp","f4f7da701bbd.webp"],["elvis-2022","a-complete-unknown","nightmare-alley-2021"]],
      ["decision-to-leave",["6487c019402c.webp","461d15cf49d5.webp"],["no-other-choice-2025","drive-my-car","the-beast-2023"]],
      ["drive-my-car",["083ae3e36484.webp","fa1f2432ebf0.webp","15f9b08307e7.webp"],["decision-to-leave","sentimental-value-2025","tar-2022"]],
      ["dune-2021",["dune-2021-film-file.webp","ded59bd5ae74.webp","aac8b02376cb.webp","ded3d0fc9163.webp"],["dune-part-two","mickey-17","the-brutalist"]],
      ["dune-part-two",["9503aa1ca9e8.webp","dune-part-two-sardaukar.webp","af90bc25bc36.webp","667d21014e1f.webp"],["dune-2021","mickey-17","the-odyssey-2026"]],
      ["elvis-2022",["dce227c76337.webp"],["babylon-2022","tick-tick-boom-2021","a-complete-unknown"]],
      ["extraction-2020",["da81cfaf3738.webp","537c0d054549.webp"],["tenet","the-batman","one-battle-after-another"]],
      ["hamnet",["a1b96428cbe5.webp","78eb385be5c6.webp"],["wuthering-heights-2026","the-count-of-monte-cristo-2024","the-power-of-the-dog"]],
      ["killers-of-the-flower-moon",["c68dff150f5d.webp","f0468cab248f.webp"],["the-power-of-the-dog","one-battle-after-another","the-brutalist"]],
      ["la-chimera",["f1822fb03abb.webp"],["drive-my-car","the-beast-2023","the-banshees-of-inisherin"]],
      ["marty-supreme",["dd88f245ad0c.webp","2de051a68d27.webp"],["challengers","a-complete-unknown","one-battle-after-another"]],
      ["materialists",["97a8f57b3338.webp"],["past-lives","sentimental-value-2025","may-december"]],
      ["may-december",["3eb6c75cc199.webp"],["anatomy-of-a-fall","the-assessment-2024","sentimental-value-2025"]],
      ["mickey-17",["4420a4cbeaef.webp"],["dune-2021","dune-part-two","tenet"]],
      ["nightmare-alley-2021",["15619731f8f9.webp","93919390a464.webp","c982028b7ab0.webp","1ab0d7d70eba.webp"],["babylon-2022","the-brutalist","the-menu-2022"]],
      ["no-other-choice-2025",["2f89374bd3be.webp","6d6963f76f40.webp","853b5b81bc50.webp","a291c8cef0ab.webp","no-other-choice-2025-curator-frame-20261126-12.webp","no-other-choice-2025-curator-frame-20261126-13.webp"],["decision-to-leave","sentimental-value-2025","the-beast-2023"]],
      ["one-battle-after-another",["b9dafc251871.webp","one-battle-after-another-curator-frame-20261126-32.webp"],["killers-of-the-flower-moon","tenet","the-power-of-the-dog"]],
      ["past-lives",["e4f0cc49cb54.webp","2eae8eda3731.webp","ce9babcac378.webp"],["materialists","tick-tick-boom-2021","the-brutalist"]],
      ["poor-things-2023",["8d89b60376dd.webp","786b4d98eaed.webp","9456f634b8a4.webp","c9389c5207a1.webp","2bc6daa851ea.webp"],["nightmare-alley-2021","the-french-dispatch-of-the-liberty-kansas","the-brutalist"]],
      ["promising-young-woman",["a3d64ff9627a.webp","cbbd9ff0411d.webp"],["may-december","materialists","the-assessment-2024"]],
      ["sentimental-value-2025",["bd0d8f5872aa.webp","sentimental-value-2025-curator-frame-20261126-16.webp","sentimental-value-2025-curator-frame-20261126-20.webp","sentimental-value-2025-curator-frame-20261126-23.webp"],["the-worst-person-in-the-world","anatomy-of-a-fall","aftersun"]],
      ["tar-2022",["tar-2022-records.webp","tar-2022-curator-frame-20261126-37.webp","tar-2022-curator-frame-20261126-38.webp"],["tick-tick-boom-2021","a-complete-unknown","babylon-2022"]],
      ["tenet",["2490d20d7dee.webp","tenet-curator-editing.webp","tenet-alt-01.webp","cf4940d52b81.webp"],["extraction-2020","mickey-17","the-batman"]],
      ["the-assessment-2024",["bb72c6e3f29d.webp"],["the-beast-2023","may-december","no-other-choice-2025"]],
      ["the-banshees-of-inisherin",["the-banshees-of-inisherin-wide.webp","c39e788b6e05.webp","bd39915228e1.webp"],["hamnet","the-power-of-the-dog","la-chimera"]],
      ["the-batman",["26f728d757c9.webp","62c0770d1e9f.webp"],["nightmare-alley-2021","the-menu-2022","tenet"]],
      ["the-beast-2023",["b24a8044d94b.webp"],["poor-things-2023","the-assessment-2024","no-other-choice-2025"]],
      ["the-brutalist",["8e1f7477ceb5.webp","the-brutalist-the-tattoo-line-award-cinematic-r2.webp"],["oppenheimer-2023","nightmare-alley-2021","poor-things-2023"]],
      ["the-count-of-monte-cristo-2024",["the-count-of-monte-cristo-2024-wide.webp","c1916cbb2000.webp","31e9926750c1.webp"],["the-banshees-of-inisherin","the-odyssey-2026","dune-2021"]],
      ["the-french-dispatch-of-the-liberty-kansas",["the-french-dispatch-of-the-liberty-kansas-film-file.webp","75ae1dabf457.webp","040d8d0c11b4.webp","b9551ab1c84f.webp"],["asteroid-city","poor-things-2023","nightmare-alley-2021"]],
      ["the-menu-2022",["6ca18f170c66.webp"],["materialists","the-assessment-2024","nightmare-alley-2021"]],
      ["the-novice",["the-novice-film-file.webp"],["aftersun","challengers","past-lives"]],
      ["the-odyssey-2026",["3812f421c314.webp"],["dune-part-two","the-count-of-monte-cristo-2024","hamnet"]],
      ["the-power-of-the-dog",["7eb2a598d562.webp","6e13c20bc7ce.webp","0665da4c35d8.webp","56a7307961a4.webp"],["killers-of-the-flower-moon","the-banshees-of-inisherin","hamnet"]],
      ["the-worst-person-in-the-world",["52cebcdc6e87.webp"],["sentimental-value-2025","past-lives","materialists"]],
    ],
    '2010-2019': [
      ["1917",["24a16adf3631.webp","eaf64409575d.webp","0b30c0bfb8dc.webp"],["dunkirk-2017","testament-of-youth","the-king-2019"]],
      ["inception",["inception-best-picture-curator.webp","inception-curator-frame-09.webp","inception-curator-frame-14.webp","inception-curator-frame-17.webp","inception-curator-frame-21.webp"],["arrival-2016","interstellar","shutter-island"]],
      ["oslo-august-31st",["4b1df909d940.webp","d1b1f47c0813.webp"],["inside-llewyn-davis","manchester-by-the-sea","burning-2018"]],
      ["inside-llewyn-davis",["519dc0d780d5.webp","77f60df0563b.webp","dee95a14efd0.webp"],["the-souvenir","manchester-by-the-sea","oslo-august-31st"]],
      ["interstellar",["85f348408acb.webp"],["inception","blade-runner-2049","arrival-2016"]],
      ["the-dark-knight-rises",["f94fe8975623.webp","ef7e9203712f.webp"],["prisoners","sicario-2015","inception"]],
      ["dunkirk-2017",["22aec826112d.webp","c142fa338933.webp","681c07a60030.webp"],["1917","testament-of-youth","the-king-2019"]],
      ["prisoners",["2a891da62cbf.webp","8d01f6b15efd.webp","147efc0b0540.webp"],["the-dark-knight-rises","sicario-2015","nocturnal-animals"]],
      ["sicario-2015",["a0c45a771947.webp","a868a712b693.webp"],["prisoners","nocturnal-animals","nightcrawler"]],
      ["arrival-2016",["54850167fb2b.webp","993e09177282.webp"],["the-tree-of-life-2011","interstellar","thelma-2017"]],
      ["blade-runner-2049",["680fd3349108.webp","blade-runner-2049-curator-frame-20261126-25.webp","blade-runner-2049-curator-frame-20261126-27.webp","blade-runner-2049-curator-frame-20261126-28.webp","blade-runner-2049-curator-frame-20261126-35.webp"],["arrival-2016","interstellar","inception"]],
      ["whiplash-2014",["whiplash-2014-wide.webp"],["black-swan","inside-llewyn-davis","la-la-land"]],
      ["la-la-land",["la-la-land-lives-we-might-have-lived-curator.webp","la-la-land-best-original-score-2010s.webp"],["whiplash-2014","inside-llewyn-davis","her"]],
      ["thelma-2017",["8a557b6c526a.webp","603b4aef9d0e.webp"],["oslo-august-31st","burning-2018","the-tree-of-life-2011"]],
      ["manchester-by-the-sea",["3032282aa5cd.webp"],["the-souvenir","little-women-2019","before-midnight"]],
      ["little-women-2019",["a4ccfd3b4261.webp"],["testament-of-youth","anna-karenina-2012","phantom-thread"]],
      ["certified-copy",["7da0cc9c475f.webp"],["before-midnight","midnight-in-paris","the-souvenir"]],
      ["the-master-2012",["20fec8db618c.webp"],["first-man","nocturnal-animals","sicario-2015"]],
      ["burning-2018",["9e94df89a80a.webp","68be610f5424.webp","e5c3eecf6fb5.webp"],["thelma-2017","oslo-august-31st","nocturnal-animals"]],
      ["nightcrawler",["df15e5edeb8a.webp"],["drive-2011","nocturnal-animals","sicario-2015"]],
      ["nocturnal-animals",["0dc43f517d56.webp","fea7905cbb0f.webp"],["sicario-2015","nightcrawler","prisoners"]],
      ["her",["5b65ceb780f1.webp","23464d71bf8f.webp","her-curator-frame-20261126-34.webp"],["the-souvenir","before-midnight","inside-llewyn-davis"]],
      ["steve-jobs",["3eabe6452a8e.webp"],["the-social-network","moneyball","the-wolf-of-wall-street"]],
      ["the-tree-of-life-2011",["the-tree-of-life-2011-wide.webp"],["arrival-2016","interstellar","the-master-2012"]],
      ["anna-karenina-2012",["anna-karenina-2012-wide.webp","e4294ee4168e.webp","fca9b2d0558c.webp"],["testament-of-youth","little-women-2019","phantom-thread"]],
      ["avengers-infinity-war",["2b7a7d8bef49.webp","316e3371151b.webp"],["avengers-endgame","interstellar","blade-runner-2049"]],
      ["the-souvenir",["4bf3e90a2255.webp"],["phantom-thread","certified-copy","before-midnight"]],
      ["midnight-in-paris",["midnight-in-paris-best-atmosphere-2010s.webp"],["certified-copy","before-midnight","the-grand-budapest-hotel"]],
      ["the-handmaiden",["ef7f49609917.webp","5b7a76eb9364.webp","443d71a06721.webp","2ef8cfa1bc79.webp"],["burning-2018","anna-karenina-2012","phantom-thread"]],
      ["uncut-gems",["bdc2f4fd6f6f.webp"],["nocturnal-animals","prisoners","nightcrawler"]],
      ["avengers-endgame",["cdfa835fc525.webp","9ca39e56168e.webp"],["avengers-infinity-war","interstellar","blade-runner-2049"]],
      ["the-king-2019",["4f34b630054b.webp","5c6619a49ba4.webp"],["anna-karenina-2012","testament-of-youth","little-women-2019"]],
      ["testament-of-youth",["c6d4250fdf58.webp"],["anna-karenina-2012","little-women-2019","phantom-thread"]],
      ["if-beale-street-could-talk",["7d3b6c5a72fe.webp","30bcca813b79.webp"],["moonlight-2016","her","the-souvenir"]],
    ],
  };
  // Film identifier, exact still, credit being tested, correct answer, peers.
  const signatures = [
    ['blade-runner-2049','680fd3349108.webp','cinematographer','Roger Deakins',['Greig Fraser','Hoyte van Hoytema','Robert Elswit']],
    ['1917','eaf64409575d.webp','cinematographer','Roger Deakins',['Robert Richardson','Hoyte van Hoytema','Linus Sandgren']],
    ['la-la-land','la-la-land-best-original-score-2010s.webp','cinematographer','Linus Sandgren',['Chung Chung-hoon','Roger Deakins','Seamus McGarvey']],
    ['anna-karenina-2012','e4294ee4168e.webp','cinematographer','Seamus McGarvey',['Linus Sandgren','Darius Khondji','Chung Chung-hoon']],
    ['the-handmaiden','5b7a76eb9364.webp','cinematographer','Chung Chung-hoon',['Kim Ji-yong','Hong Kyung-pyo','Roger Deakins']],
    ['dune-part-two','9503aa1ca9e8.webp','cinematographer','Greig Fraser',['Roger Deakins','Hoyte van Hoytema','Linus Sandgren']],
    ['the-batman','26f728d757c9.webp','cinematographer','Greig Fraser',['Darius Khondji','Robert Elswit','Roger Deakins']],
    ['tenet','2490d20d7dee.webp','cinematographer','Hoyte van Hoytema',['Greig Fraser','Wally Pfister','Roger Deakins']],
    ['decision-to-leave','461d15cf49d5.webp','cinematographer','Kim Ji-yong',['Chung Chung-hoon','Hong Kyung-pyo','Darius Khondji']],
    ['inception','inception-curator-frame-14.webp','director','Christopher Nolan',['Denis Villeneuve','David Fincher','Duncan Jones']],
    ['arrival-2016','54850167fb2b.webp','director','Denis Villeneuve',['Christopher Nolan','Alex Garland','Terrence Malick']],
    ['sicario-2015','a868a712b693.webp','director','Denis Villeneuve',['David Fincher','Michael Mann','Taylor Sheridan']],
    ['the-master-2012','20fec8db618c.webp','director','Paul Thomas Anderson',['Terrence Malick','Darren Aronofsky','Steve McQueen']],
    ['whiplash-2014','whiplash-2014-wide.webp','director','Damien Chazelle',['David Fincher','Darren Aronofsky','Paul Thomas Anderson']],
    ['dunkirk-2017','c142fa338933.webp','director','Christopher Nolan',['Sam Mendes','Joe Wright','Denis Villeneuve']],
    ['the-worst-person-in-the-world','52cebcdc6e87.webp','director','Joachim Trier',['Lukas Moodysson','Thomas Vinterberg','Céline Sciamma']],
    ['sentimental-value-2025','sentimental-value-2025-curator-frame-20261126-16.webp','director','Joachim Trier',['Thomas Vinterberg','Mia Hansen-Løve','Asghar Farhadi']],
    ['no-other-choice-2025','6d6963f76f40.webp','director','Park Chan-wook',['Bong Joon-ho','Lee Chang-dong','Hirokazu Kore-eda']],
    ['the-french-dispatch-of-the-liberty-kansas','75ae1dabf457.webp','director','Wes Anderson',['Yorgos Lanthimos','Guillermo del Toro','Paul Thomas Anderson']],
    ['poor-things-2023','9456f634b8a4.webp','director','Yorgos Lanthimos',['Wes Anderson','Guillermo del Toro','Robert Eggers']],
    ['her','5b65ceb780f1.webp','director','Spike Jonze',['Michel Gondry','Sofia Coppola','David Fincher']],
    ['burning-2018','e5c3eecf6fb5.webp','director','Lee Chang-dong',['Park Chan-wook','Bong Joon-ho','Hirokazu Kore-eda']],
    ['the-power-of-the-dog','6e13c20bc7ce.webp','director','Jane Campion',['Chloé Zhao','Kelly Reichardt','Paul Thomas Anderson']],
    ['aftersun','7b6df2bd5a53.webp','director','Charlotte Wells',['Celine Song','Joanna Hogg','Mia Hansen-Løve']],
  ];
  // Screen order, not fictional chronology. Each sequence has independently
  // recognizable events, never two visually indistinguishable frames.
  const editor = [
    ['inception','dream-layers',[
      ['The first extraction','The early extraction job'],
      ['The Paris café','Ariadne learns the rules'],
      ['The dream comes apart','The café dream begins to collapse'],
      ['The city in limbo','The final descent into limbo']
    ]],
    ['blade-runner-2049','memory-trail',[
      ['K and the dead tree','K investigates the farm'],
      ["Wallace's illuminated architecture",'The Wallace Corporation enters the investigation'],
      ['blade-runner-2049-best-cinematography.webp','The journey into orange Las Vegas'],
      ['K in the falling snow','The moment outside the laboratory']
    ]],
    ['la-la-land','city-of-stars',[
      ['la-la-land-best-actress-curator-closeup.webp','The conversation across the dinner table'],
      ['la-la-land-best-scene-epilogue-curator.webp','The imagined life in the epilogue'],
      ['la-la-land-silent-ending-curator.webp','The final exchange of looks']
    ]],
    ['tenet','screen-order',[
      ['tenet-alt-01.webp','The opening at the opera'],
      ['The rain-soaked airport','The operation at the Oslo airport'],
      ['Highway chase','The Tallinn highway sequence'],
      ['Red light in the inversion sequence','The red-lit inversion sequence']
    ]],
    ['dunkirk-2017','evacuation',[
      ['The beach','The soldier reaches the beach'],
      ['Farrier in the air','Farrier’s flight over the Channel'],
      ['Evacuation at sea','The evacuation by boat'],
      ['The burning Spitfire','Farrier’s grounded aircraft']
    ]],
    ['the-batman','city-in-crisis',[
      ['Batman enters through warm backlight','The early appearance of Batman'],
      ['Mourners in a crowded assembly','The public funeral'],
      ['The Riddler in interrogation','The interrogation'],
      ['A scarlet flare in the darkness','The rescue amid the flood']
    ]],
    ['the-menu-2022','last-course',[
      ['Chef Slowik addresses the guests','Chef Slowik addresses the guests'],
      ['The carefully plated meal','One of the dinner courses'],
      ['The cheeseburger on the grill','A request for a cheeseburger'],
      ['Fire in the dining room','The final course']
    ]],
    ['before-midnight','one-day',[
      ['Lunch in the Greek garden','Lunch at the villa'],
      ['Jesse and Céline walking through Greece','The walk toward the hotel'],
      ['Jesse and Céline','The evening conversation outside'],
      ['The hotel room','The evening in the hotel room']
    ]],
    ['first-man','moonward',[
      ['Neil and Janet at home','Life at home'],
      ['The astronauts walk toward the mission','The Apollo crew prepares to depart'],
      ['Inside the spacecraft','The crew inside the spacecraft'],
      ['Neil Armstrong on the lunar surface','The lunar landing']
    ]],
    ['1917','through-the-night',[
      ["Through no man's land",'Crossing no man’s land'],
      ['The ruined town by flare light','The ruined town at night'],
      ['The burning town','The fire in the town'],
      ['A moment of stillness','The final moment of rest']
    ]],
    // These additional sequences use the chronological frame indices from
    // the films' existing scene galleries. The captions describe the shots.
    ['aftersun','holiday-memory',[
      ['72464abb1057.webp','A gathering in the dark'],
      ['566fcd539a0a.webp','Sophie indoors'],
      ['84066d7615e3.webp','The poolside view'],
      ['7b6df2bd5a53.webp','Father and daughter beside the sea']
    ]],
    ['anatomy-of-a-fall','pieces-of-a-case',[
      ['4b321e91ef70.webp','A conversation by the window'],
      ['47712934e22f.webp','Sandra against the snowy mountains'],
      ['8afccac0786c.webp','Sandra in close-up'],
      ['185dc5dcb825.webp','Daniel in the courtroom']
    ]],
    ['decision-to-leave','shifting-perspective',[
      ['6487c019402c.webp','The mountain'],
      ['60443240fc66.webp','A reflected face in the car'],
      ['461d15cf49d5.webp','The nocturnal waterside architecture'],
      ['b2ebf8b4959b.webp','The solitary figure by the sea']
    ]],
    ['drive-my-car','roads-and-stages',[
      ['5e5185bdf1d1.webp','The red car on the road'],
      ['083ae3e36484.webp','A table of rehearsing performers'],
      ['fa1f2432ebf0.webp','The stage in darkness'],
      ['15f9b08307e7.webp','The snow-covered landscape']
    ]],
    ['past-lives','across-years',[
      ['A distant conversation through a screen','The video call'],
      ['Outdoor gathering in the evening','The gathering at dusk'],
      ['An embrace in New York','A reunion in New York'],
      ['Nora in the dim evening light','Nora in the final evening light']
    ]],
    ['poor-things-2023','a-world-expands',[
      ['Distorted monochrome laboratory','The monochrome laboratory'],
      ['Fantasy city skyline','The city beyond the balcony'],
      ['Golden city through a circular window','The golden city through a window'],
      ['The vivid estate and its garden','The vivid garden']
    ]],
    ['nightmare-alley-2021','carnival-city',[
      ['Carnival under the evening rain','The carnival in wet evening light'],
      ['Silhouetted figure in an ornate room','The ornate room'],
      ['Warm, symmetrical art deco architecture','The art deco composition'],
      ['Car in the blue-lit forest','The car in the forest']
    ]],
    ['oppenheimer-2023','two-times',[
      ['Lewis Strauss in monochrome','The monochrome portrait of Strauss'],
      ['A forest meeting','The forest meeting'],
      ['Trinity test','The test in the desert'],
      ['The Los Alamos assembly','The assembly at Los Alamos']
    ]],
    ['materialists','public-private',[
      ['Conversation at the formal reception','The formal reception'],
      ['Lucy on a city street','Lucy on a city street'],
      ['Composition of the apartment interior','The apartment interior'],
      ['A portrait under evening lights','A portrait in evening light']
    ]],
    ['burning-2018','uncertainty',[
      ['Jong-su looks out over the city','Jong-su at the window'],
      ['Ben','Ben indoors'],
      ['Hae-mi at sunset','Hae-mi against the setting sun'],
      ['The stillness of the countryside','The countryside in the blue light']
    ]],
    ['the-souvenir','julies-world',[
      ['746d2137fb9e.webp','Julie by the curtain'],
      ['6bd2fc5f9daa.webp','A bedroom encounter'],
      ['4bf3e90a2255.webp','Two figures in an open field'],
      ['231c159c807c.webp','The candlelit cake']
    ]],
    ['her','city-and-intimacy',[
      ['The letter-writing office','The office'],
      ['Theodore and Amy','Theodore and Amy together'],
      ['Theodore in the snow','The snow-covered landscape'],
      ['Amy on the rooftop','Amy on the rooftop']
    ]],
    ['moneyball','the-season',[
      ['Peter Brand','Peter Brand in the garage'],
      ['The conversation in the clubhouse','A conversation in the clubhouse'],
      ['Billy Beane on the field','Billy on the field'],
      ['Billy in the office','Billy in the office']
    ]],
    ['prisoners','investigation',[
      ['The rain-soaked petrol station','The petrol station in rain'],
      ['The RV investigation','The RV investigation'],
      ['Keller Dover','Keller in profile'],
      ['A solitary figure in the snow','A solitary figure in the snow']
    ]],
    ['sicario-2015','across-the-border',[
      ['Kate Macer','Kate in close-up'],
      ['The landscape of Juárez','The wide view of Juárez'],
      ['Silhouettes at dusk','The silhouettes at dusk'],
      ['Alejandro','Alejandro in the grey light']
    ]],
    ['certified-copy','a-day-in-tuscany',[
      ['The drive','The drive'],
      ['Juliette Binoche in the Tuscan street','The Tuscan street'],
      ['The mirror','The mirror'],
      ['A couple sitting on the steps','The couple on the steps']
    ]],
    ['the-handmaiden','rooms-and-gardens',[
      ['ef7f49609917.webp','The garden path'],
      ['5b7a76eb9364.webp','The overhead courtyard'],
      ['443d71a06721.webp','A figure in the hall'],
      ['2ef8cfa1bc79.webp','The ornate room']
    ]],
    ['little-women-2019','memory-and-family',[
      ['Amy in the pink gown','Amy in the pink gown'],
      ['The March sisters','The sisters together'],
      ['Jo speaks her mind','Jo outdoors'],
      ['Jo and Marmee in the attic','The attic at the window']
    ]],
    ['inside-llewyn-davis','folk-journey',[
      ['Winter in Greenwich Village','Winter in the village'],
      ['Llewyn rides the subway','The subway ride'],
      ['On the road at night','The night road'],
      ['inside-llewyn-davis-music-as-memory.webp','Llewyn performing with his guitar']
    ]],
    ['the-dark-knight-rises','gotham-rises',[
      ['Bruce and Selina','Bruce and Selina at the gathering'],
      ['The prison pit','The prison pit'],
      ['Gotham in winter','Gotham in winter'],
      ['Bane','Bane in the shadows']
    ]],
    ['the-wolf-of-wall-street','rise-and-consequences',[
      ['Jordan and Mark Hanna at lunch','Jordan’s lunch with Mark Hanna'],
      ['Jordan at the office','The trading floor'],
      ['Jordan in conversation','Jordan in conversation'],
      ['Jordan faces the consequences','The later confrontation']
    ]],
    ['dune-2021','arrival-on-arrakis',[
      ['ded59bd5ae74.webp','A figure crossing the courtyard'],
      ['aac8b02376cb.webp','The room with the arched windows'],
      ['ded3d0fc9163.webp','The craft above the desert'],
      ['fb69e2a4b489.webp','Paul and Chani']
    ]],
    ['dune-part-two','desert-and-power',[
      ['9503aa1ca9e8.webp','An assembly within a monumental interior'],
      ['af90bc25bc36.webp','A figure on the immense dune'],
      ['149d997005e0.webp','The monochrome portrait'],
      ['667d21014e1f.webp','A figure above the gathered army']
    ]],
    ['avengers-infinity-war','cosmic-journey',[
      ['19f58746f352.webp','A circular space interior'],
      ['2b7a7d8bef49.webp','The eclipse-like sky'],
      ['72ef8429397d.webp','The assembled fighters'],
      ['272be5a0df2d.webp','The last silhouette in the orange light']
    ]],
    ['avengers-endgame','final-chapter',[
      ['a861cce53afd.webp','A deep blue interior'],
      ['cdfa835fc525.webp','A space framed by the setting sun'],
      ['9ca39e56168e.webp','A distant purple landscape'],
      ['9c91ce6229a2.webp','A figure against the smoke-filled sky']
    ]],
    ['coco-2017','memory-and-music',[
      ['4d5ec7cdd437.webp','A guitarist in the street'],
      ['ebf4c0b25370.webp','The illuminated family photographs'],
      ['dcc1b08442be.webp','The enormous stage'],
      ['6030fe350d6f.webp','Miguel and the guitar in the sunset']
    ]],
    ['your-name','across-time',[
      ['25eb911f1ef0.webp','The mountain landscape'],
      ['a798d92c3874.webp','The comet in the night sky'],
      ['7d67b78fedbc.webp','The view of the crater'],
      ['9fd4286bb891.webp','A figure in the city']
    ]],
    ['challengers','the-match',[
      ['615ea65bdcf0.webp','A close-up on court'],
      ['e85abe1b6c69.webp','The three together'],
      ['b3edfcbeace9.webp','The court under stadium lights'],
      ['ac5a6fa550aa.webp','The match in the final sequence']
    ]],
    ['uncut-gems','the-gamble',[
      ['bdc2f4fd6f6f.webp','The excavation'],
      ['a0ed9d432d9e.webp','Howard behind glass'],
      ['061e5bae439b.webp','The jeweled ornament'],
      ['f4190539d63a.webp','The basketball arena']
    ]]
  ];
  // Three disjoint groups per board; relationships are factual credits,
  // not subjective interpretations. The label is revealed after solving.
  const connections = [
    ['directors-01',[
      ['Directed by Christopher Nolan',['inception','interstellar','dunkirk-2017']],
      ['Directed by Denis Villeneuve',['arrival-2016','prisoners','sicario-2015']],
      ['Directed by Damien Chazelle',['whiplash-2014','la-la-land','babylon-2022']]
    ]],
    ['directors-02',[
      ['Directed by Paul Thomas Anderson',['the-master-2012','phantom-thread','one-battle-after-another']],
      ['Directed by Wes Anderson',['the-grand-budapest-hotel','asteroid-city','the-french-dispatch-of-the-liberty-kansas']],
      ['Directed by Park Chan-wook',['the-handmaiden','decision-to-leave','no-other-choice-2025']]
    ]],
    ['cinematographers-01',[
      ['Photographed by Roger Deakins',['prisoners','sicario-2015','blade-runner-2049']],
      ['Photographed by Hoyte van Hoytema',['interstellar','dunkirk-2017','oppenheimer-2023']],
      ['Photographed by Linus Sandgren',['la-la-land','first-man','babylon-2022']]
    ]],
    ['cast-01',[
      ['Featuring Jake Gyllenhaal',['prisoners','nightcrawler','nocturnal-animals']],
      ['Featuring Ryan Gosling',['drive-2011','la-la-land','first-man']],
      ['Featuring Leonardo DiCaprio',['inception','shutter-island','the-wolf-of-wall-street']]
    ]],
    ['cast-02',[
      ['Featuring Cillian Murphy',['oppenheimer-2023','inception','dunkirk-2017']],
      ['Featuring Timothée Chalamet',['dune-2021','little-women-2019','a-complete-unknown']],
      ['Featuring Brad Pitt',['moneyball','the-tree-of-life-2011','babylon-2022']]
    ]],
    ['scores-01',[
      ['Music by Nicholas Britell',['moonlight-2016','if-beale-street-could-talk','dont-look-up-2021']],
      ['Music by Jonny Greenwood',['the-master-2012','phantom-thread','the-power-of-the-dog']],
      ['Music by Hans Zimmer',['inception','interstellar','dune-2021']]
    ]],
    ['cast-03',[
      ['Featuring Robert Pattinson',['tenet','the-batman','mickey-17']],
      ['Featuring Oscar Isaac',['drive-2011','inside-llewyn-davis','dune-2021']],
      ['Featuring Tom Hardy',['inception','the-dark-knight-rises','dunkirk-2017']]
    ]],
    ['cast-04',[
      ['Featuring Florence Pugh',['little-women-2019','oppenheimer-2023','dune-part-two']],
      ['Featuring Carey Mulligan',['inside-llewyn-davis','drive-2011','promising-young-woman']],
      ['Featuring Amy Adams',['arrival-2016','nocturnal-animals','the-master-2012']]
    ]]
  ];
  // Pairings become comparison questions. Distractors are specific to just
  // one of the films (or a neighboring genre), rather than competing moods.
  const pairs = [
    ['Distance & intimacy','her','past-lives','Two relationships ask what closeness means when a life can never be completely shared.'],
    ['The cost of control','phantom-thread','tar-2022','Two accomplished artists test the boundary between exacting work and control of the people around them.'],
    ['Memory & time','aftersun','the-tree-of-life-2011','Childhood returns in fragments, and images become a language for what memory cannot restore.'],
    ['Art & family','the-souvenir','sentimental-value-2025','Making art becomes a way of revisiting intimate history, grief and the people who shaped it.'],
    ['Obsession','whiplash-2014','the-novice','Two ascents into obsession ask how much identity can be sacrificed to mastery.'],
    ['Guilt & uncertainty','anatomy-of-a-fall','decision-to-leave','Both use the investigation of a death to examine the limits of knowing another person.'],
    ['A future of loneliness','blade-runner-2049','her','Technology makes new kinds of intimacy imaginable, while loneliness remains recognizably human.'],
    ['Spaces between people','columbus','her','Architecture and light express distances between people that dialogue alone cannot describe.'],
    ['The weight of loss','oslo-august-31st','manchester-by-the-sea','Quiet portraits of people moving through places saturated with memories.'],
    ['An artist’s ambition','black-swan','tar-2022','Two portraits of the unsettling intersection of artistic excellence and identity.'],
    ['Doubt & responsibility','prisoners','the-batman','In both darker worlds, the search for justice exposes the costs of certainty.'],
    ['Time and possibility','arrival-2016','the-beast-2023','Genre stories use time, possibility and attachment to explore what it means to choose a life.']
  ];
  const pairChoices = {
    'Distance & intimacy':['An intimate bond across distance',['Love with an artificial intelligence','A reunion with a childhood sweetheart','Professional rivalry between artists']],
    'The cost of control':['Creative authority reshapes private relationships',['The world of high fashion','The politics of classical orchestras','A family reconnects after bereavement']],
    'Memory & time':['Childhood memory and parental relationships',['A holiday captured on a camcorder','The origin of the universe','A courtroom reconstruction of the past']],
    'Art & family':['Filmmaking reworks intimate history',['A film student’s troubled romance','A director reconnects with his daughters','A rivalry over a prestigious art prize']],
    'Obsession':['Discipline turns into self-sacrificing obsession',['A jazz band and a demanding conductor','A competitive rowing team','The return of an ageing musician']],
    'Guilt & uncertainty':['An investigation reveals uncertain truths about intimacy',['A public trial examines a marriage','A detective is drawn to a suspect','Parents search for a missing child']],
    'A future of loneliness':['Technology redefines personhood and intimacy',['A replicant investigates his memories','An operating system develops feelings','Shared dreams are used for extraction']],
    'Spaces between people':['Architecture reflects emotional distance',['An architectural tour of Indiana','Digital companionship in future Los Angeles','An urban crime investigation']],
    'The weight of loss':['Familiar places carry unresolved loss',['One day away from a rehabilitation centre','Returning home to care for a nephew','Siblings in a dispute over inheritance']],
    'An artist’s ambition':['Artistic identity under performance pressure',['A ballet dancer prepares for a role','A conductor faces public allegations','A theatre director rehearses Chekhov']],
    'Doubt & responsibility':['The search for justice tests moral boundaries',['A father searches for his daughters','A masked detective investigates corruption','A cameraman sells footage to television']],
    'Time and possibility':['Time and alternate possibilities reshape attachment',['Language changes a scientist’s perception of time','Past-life technology revisits earlier lives','Astronauts travel beyond the solar system']]
  };
  const bank = {hardFrames,signatures,editor,connections,pairs,pairChoices};
  if (typeof module !== 'undefined' && module.exports) module.exports=bank;
  else window.ArchiveScreeningGamesBank=bank;
})();
