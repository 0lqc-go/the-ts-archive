/* Local browser smoke/flow test. Run with Playwright module and Chrome paths. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),http=require("node:http");
const {chromium}=require(process.argv[2]||"playwright");
const repo=path.resolve(__dirname,".."),site=path.join(repo,"1-Site");
const proof=process.argv[4];
if(proof)fs.mkdirSync(proof,{recursive:true});
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
  ".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer((req,res)=>{
  try{
    const relative=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname).replace(/^\//,"")||"index.html";
    let file=path.resolve(site,relative);
    if(!file.startsWith(site+path.sep))return res.writeHead(404).end();
    if(!fs.existsSync(file)&&/^assets\/films\/[^/]+\.(webp|jpg|png)$/.test(relative))
      file=path.join(repo,"2-Artwork","films",path.basename(relative));
    res.writeHead(200,{"Content-Type":MIME[path.extname(file)]||"application/octet-stream","Cache-Control":"public,max-age=120"}).end(fs.readFileSync(file));
  }catch{if(!res.headersSent)res.writeHead(404);res.end();}
});
const KEY="ts-archive-cinema-profile-adaptive-v2",CLASSIC="ts-archive-cinema-profile-visual-v5";
const action=(page,name)=>page.locator('[data-action="'+name+'"]');
const stored=(page,key=KEY)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||"null"),key);
const shot=async(page,name)=>{
  if(!proof)return;
  await page.evaluate(async()=>{
    await Promise.allSettled([...document.querySelectorAll("#cp-root .cp-visual-art img,#cp-root .cp-rating-frame > img")].map(img=>img.decode?.()));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  await page.screenshot({path:path.join(proof,name+".png")});
};
const assertFit=async page=>{
  const fit=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2);
  assert(fit,"horizontal overflow");
};
const loadedArt=async page=>page.waitForFunction(()=>[...document.querySelectorAll("#cp-root .cp-visual-art img,#cp-root .cp-rating-frame > img")].every(img=>img.complete&&img.naturalWidth>0),{},{timeout:10000});
const currentSlot=async page=>page.evaluate(key=>{
  const state=JSON.parse(localStorage.getItem(key));
  return CinemaProfileCore.questionsForState(state)[state.index];
},KEY);
async function chooseNext(page,slot,index){
  await loadedArt(page);await assertFit(page);
  const before=await stored(page),ar=before.locale==="ar";
  const visualCoin=slot.purpose==="coin"&&await page.locator(".cp-visual-select").count()===2;
  assert.equal((await action(page,"next").innerText()).trim(),before.index===before.limit-1?(ar?"عرض النتيجة":"See result"):(ar?"متابعة":"Continue"));
  if(visualCoin)assert.equal(await page.locator(".cp-visual-heading .cp-small").count(),0);
  if(slot.purpose==="rating"){
    assert.equal(await action(page,"rating").count(),5);
    await action(page,"rating").filter({hasText:"4"}).click();
  }else{
    assert.equal(await action(page,"select").count(),2);
    const value=slot.purpose==="coin"?(slot.block%2?"1":"2"):index%2?"1":"2";
    await page.locator('[data-action="select"][data-value="'+value+'"]').click();
  }
  assert(await action(page,"next").isEnabled());
  await action(page,"next").click();
  if(visualCoin){
    const after=await stored(page),answer=after.answers[slot.id];
    const form=slot.forms[answer.form];
    assert(answer.confirmed&&answer.recalled.length===new Set(form.options.map(o=>o.filmId)).size);
    assert(answer.recalled.every(id=>after.familiarity[id]==="seen"));
  }
}
(async()=>{
  await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);});
  const base="http://127.0.0.1:"+server.address().port;
  const browser=await chromium.launch({executablePath:process.argv[3],headless:true,
    args:["--disable-background-networking","--disable-component-update"]});
  async function session(mobile=false){
    const context=await browser.newContext({viewport:{width:mobile?390:1440,height:mobile?844:900},deviceScaleFactor:1,
      reducedMotion:"reduce",locale:mobile?"ar-IQ":"en-US",...(mobile?{isMobile:true,hasTouch:true}:{})});
    const page=await context.newPage(),errors=[],missing=[];
    page.on("pageerror",error=>errors.push(error.message));
    page.on("response",response=>{if(response.url().startsWith(base)&&response.status()>=400)missing.push(response.url());});
    await context.route("**/*",route=>route.request().url().startsWith(base)?route.continue():route.abort());
    await page.goto(base+"/cinema-profile.html",{waitUntil:"domcontentloaded"});
    await page.locator(".cp-start-card").waitFor();
    return {context,page,errors,missing};
  }
  try{
    const desktop=await session(),p=desktop.page;
    assert.match(await p.locator(".cp-start-facts").innerText(),/32 questions/);
    assert.equal(await action(p,"adaptive-edition").getAttribute("aria-pressed"),"true");
    assert.equal(await action(p,"classic-edition").getAttribute("aria-pressed"),"false");
    const introLayout=await p.evaluate(()=>{
      const hero=document.querySelector('.cp-intro-cover');const header=document.querySelector('.cp-masthead');const title=document.querySelector('.cp-intro-title');
      return {overlay:Math.abs(hero.getBoundingClientRect().top-header.getBoundingClientRect().top)<2,background:getComputedStyle(header).backgroundColor,weight:getComputedStyle(title).fontWeight,titleSize:parseFloat(getComputedStyle(title).fontSize),src:hero.querySelector('img').currentSrc||hero.querySelector('img').src};
    });
    assert(introLayout.overlay&&introLayout.background==='rgba(0, 0, 0, 0)');
    assert(!await p.locator("#cp-route-nav").isVisible());
    assert.equal(introLayout.weight,'600');assert(introLayout.titleSize<=76);
    assert.match(introLayout.src,/blade-runner-2049-best-cinematography/);
    // The cover and editorial content follow the archive's masthead gutter,
    // including ultra-wide desktops where the old 1250px cap was conspicuous.
    await p.setViewportSize({width:2520,height:1080});
    const wideGutters=await p.evaluate(()=>{
      const masthead=document.querySelector('.cp-masthead');
      const header=masthead.getBoundingClientRect(),style=getComputedStyle(masthead);
      const left=header.left+parseFloat(style.paddingLeft),right=header.right-parseFloat(style.paddingRight);
      return [...document.querySelectorAll('.cp-intro-cover-copy,.cp-intro-cover-credit,.cp-intro-content')].every(el=>{
        const rect=el.getBoundingClientRect();return Math.abs(rect.left-left)<2&&Math.abs(rect.right-right)<2;
      });
    });
    assert(wideGutters,'Panoramic intro must align with the archive gutters');
    await assertFit(p);
    if(proof)await p.screenshot({path:path.join(proof,"desktop-amber-wide-gutters.png"),fullPage:true});
    await p.setViewportSize({width:1440,height:900});
    const featured=p.locator(".cp-hero-art a[data-film-file-link]");
    assert.equal(await featured.count(),3);
    assert.deepEqual(await featured.evaluateAll(cards=>cards.map(card=>card.dataset.filmFileLink)),["phantom-thread","souvenir","her"]);
    assert.match(await featured.first().getAttribute("href"),/awards\.html\?edition=2010-2019&film=phantom-thread/);
    const [filmPage]=await Promise.all([p.waitForEvent("popup"),featured.first().click()]);
    await filmPage.locator("#film-file-dialog[open]").waitFor({timeout:30000});
    assert.match(await filmPage.locator("#film-file-title").innerText(),/Phantom Thread/i);
    // Match the actual decade page, not just Cinema Profile's own header.
    for(const width of [1280,1440,1920,2520]){
      await Promise.all([p.setViewportSize({width,height:900}),filmPage.setViewportSize({width,height:900})]);
      const decadeGutter=await filmPage.locator('.hero-title').evaluate(el=>parseFloat(getComputedStyle(el).paddingLeft));
      const profileGutter=await p.locator('.cp-intro-content').evaluate(el=>el.getBoundingClientRect().left);
      assert(Math.abs(decadeGutter-profileGutter)<2,`Decade and intro gutters differ at ${width}px: ${decadeGutter} vs ${profileGutter}`);
    }
    await p.setViewportSize({width:1440,height:900});
    await filmPage.close();
    await p.evaluate(()=>window.scrollTo(0,0));
    await p.waitForFunction(()=>!document.body.classList.contains('cp-intro-header-scrolled'));
    await assertFit(p);await shot(p,"desktop-edition-picker");
    if(proof)await p.screenshot({path:path.join(proof,"desktop-amber-cover-full.png"),fullPage:true});
    await action(p,"classic-edition").click();
    assert.match(await p.locator(".cp-start-facts").innerText(),/25 questions/);
    assert.equal(await action(p,"classic-edition").getAttribute("aria-pressed"),"true");
    await action(p,"adaptive-edition").click();
    assert.match(await p.locator(".cp-start-facts").innerText(),/32 questions/);
    assert.equal(await p.locator(".cp-start-guidance").count(),1);
    assert.match(await p.locator(".cp-start-guidance").innerText(),/not a favourite title/);
    await action(p,"start").click();
    assert(!await p.locator("body").evaluate(el=>el.classList.contains("cp-intro-page")));
    assert(await p.locator("#cp-route-nav").isVisible());
    await loadedArt(p);await assertFit(p);
    assert.equal(await p.locator(".cp-visual-select").count(),2);
    assert.equal(await p.locator(".cp-visual-heading .cp-small").count(),0);
    assert.equal((await action(p,"next").innerText()).trim(),"Continue");
    await shot(p,"desktop-two-cards");
    const original=await currentSlot(p),[unseen]=original.forms[0].options.map(o=>o.filmId);
    assert.equal(await p.locator(".cp-scene-film").textContent(),"The Social Network · 2010");
    assert(await p.locator(".cp-cinema-answer strong").count()===2);
    await action(p,"swap-unfamiliar").click();
    assert.equal(await action(p,"unfamiliar-only").count(),0);
    await action(p,"unfamiliar-none").click();
    await loadedArt(p);
    assert.equal((await stored(p)).index,0);
    assert.equal((await stored(p)).familiarity[unseen],"unseen");
    assert.equal((await stored(p)).pendingForms[original.id],1);
    await action(p,"swap-unfamiliar").click();
    await action(p,"unfamiliar-recall").click();
    assert.equal(await p.locator(".cp-scenario-choice").count(),2);
    assert.equal((await stored(p)).pendingForms[original.id],2);
    await p.reload({waitUntil:"domcontentloaded"});
    await p.locator(".cp-scenario-choice").first().waitFor();
    assert.equal(await p.locator(".cp-scenario-choice").count(),2);
    await shot(p,"desktop-parallel-story");
    await p.locator('[data-action="select"][data-value="1"]').click();
    await action(p,"next").click();
    let s=await stored(p);
    assert.equal(s.answers[original.id].mode,"text");
    assert.equal(s.answers[original.id].form,2);
    assert.equal(Object.keys(s.familiarity).length,1);
    // Complete the four core blocks, including both rating alternate paths.
    for(let i=1;i<32;i++){
      s=await stored(p);assert.equal(s.index,i);
      const slot=await currentSlot(p);
      assert.equal(slot.purpose==="rating",i%8===7);
      if(i===1){
        const [seenId,unseenId]=slot.forms[0].options.map(o=>o.filmId);
        await action(p,"swap-unfamiliar").click();
        assert.equal(await action(p,"unfamiliar-only").count(),2);
        await p.locator('[data-action="unfamiliar-only"][data-film="'+seenId+'"]').click();
        assert.equal((await stored(p)).familiarity[seenId],"seen");
        assert.equal((await stored(p)).familiarity[unseenId],"unseen");
        await chooseNext(p,slot,i);
      }else if(i===2){
        const before=Object.keys(s.familiarity).length;
        await chooseNext(p,slot,i);
        assert.equal(Object.keys((await stored(p)).familiarity).length,before);
      }else if(i===3||i===4){
        await loadedArt(p);await shot(p,i===3?"desktop-character-decision":"desktop-scene-detail");
        await chooseNext(p,slot,i);
      }else if(i===7){
        await action(p,"film-unseen").click();
        assert.equal((await stored(p)).index,i);
        await loadedArt(p);await shot(p,"desktop-rating");
        await chooseNext(p,slot,i);
        const answer=(await stored(p)).answers[slot.id];
        assert.equal(answer.form,1);assert.equal(answer.watched,true);
      }else if(i===15){
        await action(p,"film-unseen").click();
        if((await stored(p)).index===i)await action(p,"film-unseen").click();
        assert.equal((await stored(p)).answers[slot.id].mode,"skip");
      }else if(i===13){
        await action(p,"neutral").click();
        assert.equal((await stored(p)).answers[slot.id].mode,"neutral");
      }else await chooseNext(p,slot,i);
    }
    await p.locator(".cp-portrait-name").waitFor();
    assert.equal((await stored(p)).route,"result");
    assert.equal((await stored(p)).limit,32);
    assert.equal(await action(p,"deepen").count(),1);
    assert(await action(p,"deepen").evaluate(el=>el.classList.contains("cp-button-primary")));
    assert.equal(await action(p,"deepen").locator("small").innerText(),"+24");
    assert(await action(p,"image").evaluate(el=>!el.classList.contains("cp-button-primary")));
    assert(await action(p,"image").locator("svg").isVisible());
    assert.match(await p.locator(".cp-portrait-evidence-hint").innerText(),/of 5 contrasts.*story motives need the deeper reading/);
    assert.match(await p.locator(".cp-portrait-depth-note").innerText(),/five Coins.*Lens.*Savior Animal.*Enneagram/);
    const pickedFilms=p.locator(".cp-portrait-filmstrip a[data-film-file-link]");
    assert(await pickedFilms.count()>0);
    assert.match(await pickedFilms.first().getAttribute("href"),/^awards\.html\?edition=/);
    const beforeFilmVisit=await stored(p);
    const [pickedPage]=await Promise.all([p.waitForEvent("popup"),pickedFilms.first().click()]);
    await pickedPage.locator("#film-file-dialog[open]").waitFor({timeout:30000});
    await pickedPage.close();
    assert.deepEqual(await stored(p),beforeFilmVisit);
    const coreFixture=await stored(p);
    const corePrompt=await p.locator("#cp-prompt").inputValue();
    assert(corePrompt.includes("Evidence by contrast")&&corePrompt.includes("S (Sensing)"));
    await shot(p,"desktop-core-portrait");
    await action(p,"image").click();
    await p.locator("#cp-export:not([hidden]) img").waitFor({timeout:15000});
    assert(await p.locator('#cp-export a[download]').getAttribute('href'));
    await action(p,"close-export").click();
    const coins=p.locator(".cp-portrait-analysis-row").first();
    await coins.locator("summary").first().click();
    await p.locator(".cp-coin-evidence summary").click();
    assert.match(await p.locator(".cp-coin-evidence").innerText(),/written/);
    assert(await p.locator(".cp-text-evidence").count()>0);
    const method=p.locator(".cp-portrait-share .cp-method");
    await method.locator("summary").first().click();
    await method.locator(".cp-question-audit summary").click();
    await p.locator('[data-action="qa-reason"][data-value="response"]').first().click();
    assert(Object.keys((await stored(p)).feedback).length===1);
    await action(p,"deepen").click();
    assert.equal((await stored(p)).index,32);
    assert.equal((await stored(p)).limit,56);
    for(let i=32;i<56;i++){
      const slot=await currentSlot(p);
      assert.equal(slot.purpose==="rating",i%8===7);
      await chooseNext(p,slot,i);
    }
    await p.locator(".cp-portrait-name").waitFor();
    assert.equal((await stored(p)).limit,56);
    assert.equal(await action(p,"deepen").count(),0);
    assert.equal(await action(p,"refine").count(),1);
    await action(p,"refine").click();
    s=await stored(p);const targeted=s.refinement.length;
    assert(targeted>=1&&targeted<=6);
    assert.equal(s.index,56);assert.equal(s.limit,56+targeted);
    for(let i=0;i<targeted;i++){
      await p.locator(".cp-scenario-choice").first().waitFor();
      await action(p,"neutral").click();
    }
    await p.locator(".cp-portrait-name").waitFor();
    const cfrow=p.locator(".cp-portrait-counterframe-row");
    await cfrow.locator("summary").first().click();
    await action(p,"cf-start").click();
    assert.equal((await action(p,"cf-next").innerText()).trim(),"Continue");
    assert.equal(await p.locator(".cp-visual-heading .cp-small").count(),0);
    for(let j=0;j<2&&await action(p,"cf-swap").count();j++)await action(p,"cf-swap").click();
    assert.equal(await p.locator(".cp-scenario-choice").count(),2);
    await p.locator('[data-action="cf-select"][data-value="1"]').click();
    await p.locator('[data-action="cf-strength"][data-value="4"]').click();
    await action(p,"cf-next").click();
    s=await stored(p);
    assert.equal(s.counterframe.answers.cf01.form,2);
    assert.equal(s.counterframe.answers.cf01.strength,4);
    await p.reload({waitUntil:"domcontentloaded"});
    await action(p,"cf-next").waitFor();
    for(let i=1;i<12;i++){
      await loadedArt(p);
      if(i===4||i===8)await action(p,"cf-neutral").click();
      else{
        await p.locator('[data-action="cf-select"][data-value="1"]').click();
        await p.locator('[data-action="cf-strength"][data-value="4"]').click();
        await action(p,"cf-next").click();
      }
    }
    await p.locator(".cp-portrait-name").waitFor();
    assert((await stored(p)).counterframe.complete);
    assert.match(await p.locator("#cp-prompt").inputValue(),/Counterframe — optional pressure reading/);
    await action(p,"review").click();
    assert.equal(await p.locator(".cp-scenario-choice").count(),2);
    assert.equal(await p.locator('[data-action="select"][data-value="1"]').getAttribute("aria-pressed"),"true");
    assert.equal(desktop.errors.length,0,desktop.errors.join("\n"));
    assert.equal(desktop.missing.length,0,desktop.missing.join("\n"));
    await desktop.context.close();
    console.log("Desktop: 32 + 24 + "+targeted+" main answers, 12 Counterframe answers, fallback, refresh, audit and review passed.");

    const mobile=await session(true),m=mobile.page;
    assert.match(await m.locator(".cp-start-facts").innerText(),/32/);
    assert.equal(await action(m,"adaptive-edition").getAttribute("aria-pressed"),"true");
    assert.equal(await action(m,"classic-edition").getAttribute("aria-pressed"),"false");
    const mobileIntro=await m.evaluate(()=>({theme:document.body.classList.contains("cp-intro-page"),overlay:Math.abs(document.querySelector(".cp-masthead").getBoundingClientRect().top-document.querySelector(".cp-intro-cover").getBoundingClientRect().top)<2}));
    assert(mobileIntro.theme&&mobileIntro.overlay);
    await assertFit(m);await shot(m,"mobile-edition-picker");
    assert.match(await m.locator(".cp-start-guidance").innerText(),/لا اسم فيلمك المفضّل/);
    await action(m,"start").click();
    await loadedArt(m);await assertFit(m);
    assert.equal(await m.locator(".cp-visual-select").count(),2);
    assert.equal(await m.locator(".cp-visual-heading .cp-small").count(),0);
    assert.equal((await action(m,"next").innerText()).trim(),"متابعة");
    const box1=await m.locator(".cp-visual-select").nth(0).boundingBox(),box2=await m.locator(".cp-visual-select").nth(1).boundingBox();
    assert(box2.y>=box1.y+box1.height-2,"mobile cards are not stacked");
    await shot(m,"mobile-two-cards");
    await action(m,"swap-unfamiliar").click();
    await assertFit(m);
    await shot(m,"mobile-familiarity");
    await action(m,"unfamiliar-recall").click();
    await action(m,"swap-unfamiliar").click();
    await action(m,"unfamiliar-recall").click();
    await assertFit(m);await shot(m,"mobile-parallel-story");
    await chooseNext(m,await currentSlot(m),0);
    for(let i=1;i<=7;i++){
      const slot=await currentSlot(m);
      if(i===3||i===7)await shot(m,i===3?"mobile-character-decision":"mobile-rating");
      await chooseNext(m,slot,i);
    }
    await m.evaluate(({key,fixture})=>localStorage.setItem(key,JSON.stringify({...fixture,locale:"ar"})),{key:KEY,fixture:coreFixture});
    await m.reload({waitUntil:"domcontentloaded"});
    await m.locator(".cp-portrait-name").waitFor();
    assert(await action(m,"deepen").evaluate(el=>el.classList.contains("cp-button-primary")));
    assert(await action(m,"image").locator("svg").isVisible());
    await assertFit(m);await shot(m,"mobile-core-portrait");
    assert.equal(mobile.errors.length,0,mobile.errors.join("\n"));
    assert.equal(mobile.missing.length,0,mobile.missing.join("\n"));
    await mobile.context.close();
    console.log("Mobile: Arabic, stacked cards, alternate and written forms, 5-point bar, no overflow passed.");

    const previous=await session(),l=previous.page;
    const legacy=await l.evaluate(key=>{
      const s=CinemaProfileCore.createState("en",{legacy:true});
      s.seed=712;s.answers.v01={mode:"skip",done:true};s.route="intro";s.index=1;
      localStorage.setItem(key,JSON.stringify(s));return s;
    },CLASSIC);
    await l.reload({waitUntil:"domcontentloaded"});
    await l.locator(".cp-start-card").waitFor();
    assert.match(await l.locator(".cp-start-facts").innerText(),/25 questions/);
    await action(l,"adaptive-edition").click();
    assert.match(await l.locator(".cp-start-facts").innerText(),/32 questions/);
    await action(l,"start").click();
    await action(l,"neutral").click();
    await l.locator('button[data-profile-action="home"]').click();
    await action(l,"classic-edition").click();
    assert.match(await l.locator(".cp-start-facts").innerText(),/25 questions/);
    await l.reload({waitUntil:"domcontentloaded"});
    await l.locator(".cp-start-card").waitFor();
    assert.match(await l.locator(".cp-start-facts").innerText(),/25 questions/);
    assert.deepEqual((await stored(l,CLASSIC)).answers,legacy.answers);
    await action(l,"adaptive-edition").click();
    assert.equal((await stored(l)).answers.v01.mode,"neutral");
    assert.equal(previous.errors.length,0,previous.errors.join("\n"));
    await previous.context.close();
    console.log("Classic edition: preserved save, restored selection after reload and independent new save passed.");
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error.stack);server.close();process.exitCode=1;});
