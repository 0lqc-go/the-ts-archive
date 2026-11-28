const assert = require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.argv[2]||'playwright');
const repo=path.join(__dirname,'..'),site=path.join(repo,'1-Site');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  try {
    const relative=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\//,'')||'index.html';
    let file=path.resolve(site,relative);
    if (!file.startsWith(path.resolve(site)+path.sep)) return res.writeHead(404).end();
    if (!fs.existsSync(file)&&/^assets\/films\/[^/]+\.(webp|jpg|png)$/.test(relative)) file=path.join(repo,'2-Artwork','films',path.basename(relative));
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(fs.readFileSync(file));
  } catch { if (!res.headersSent) res.writeHead(404);res.end(); }
});
const key='ts-archive-screening-quiz-history-v2';
const state=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null')?.counts||{},key);
const gameKey='ts-archive-screening-games-v1',dailyKey='ts-archive-screening-daily-quiz-v1';
const bank=require('../1-Site/screening-games-bank.js');
const stored=(page,key)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null'),key);
const proof=process.argv[4];
const capture=async(page,name)=>{
  if(!proof)return;
  fs.mkdirSync(proof,{recursive:true});
  await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
  await page.screenshot({path:path.join(proof,name+'.png'),animations:'disabled',fullPage:true});
};
const fit=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Horizontal overflow');
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.argv[3],headless:true,args:['--disable-background-networking','--disable-component-update']});
  try {
    let firstDaily;
    for (const mobile of [false,true]) {
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},reducedMotion:'reduce',timezoneId:'Asia/Baghdad'});
      await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
      const page=await context.newPage(),errors=[];
      const label=mobile?'mobile':'desktop';
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(base+'/screening-room.html?mode=memory');
      await page.locator('[data-memory-category="details"]').waitFor();
      await page.locator('[data-memory-category="details"]').click();
      assert.equal(await page.locator('[data-answer]').count(),4);
      await fit(page);
      for(let i=0;i<5;i++){
        await page.locator('[data-answer]').first().click();
        await page.locator('[data-quiz-next]').click();
      }
      await page.locator('[data-quiz-replay]').waitFor();
      const first=await state(page);
      assert.ok(Object.keys(first).length>=5&&Object.values(first).every(n=>n===1));
      await page.locator('[data-quiz-replay]').click();
      await page.locator('[data-answer]').first().waitFor();
      const second=await state(page);
      assert.equal(Object.keys(second).length,Object.keys(first).length+1);
      const previous=Object.keys(second);
      await page.reload();
      await page.locator('[data-memory-category="details"]').waitFor();
      await page.locator('[data-memory-category="details"]').click();
      const third=await state(page);
      assert.ok(Object.keys(third).length>previous.length&&Object.values(third).every(n=>n===1));
      await page.locator('#sr-difficulty').selectOption('classic');
      assert.equal(await page.locator('[data-answer]').count(),3);
      assert.ok(Object.values(await state(page)).every(n=>n===1));
      await fit(page);
      await page.goto(base+'/screening-room.html?mode=frame');
      await page.locator('[data-answer]').first().waitFor();
      await page.waitForFunction(()=>document.querySelector('.sr-question-grid img')?.naturalWidth>0);
      assert.equal(await page.locator('[data-answer]').count(),4);
      await fit(page);
      await page.goto(base+'/screening-room.html?mode=winner');
      await page.locator('[data-answer]').first().waitFor();
      assert.equal(await page.locator('[data-answer]').count(),4);
      await fit(page);
      await page.locator('.screening-quiz-navigation [data-screening-mode="signature"]').click();
      assert.equal(await page.locator('[data-memory-category="signature"]').count(),0);
      assert.equal(await page.locator('[data-answer]').count(),4);
      await page.waitForFunction(()=>document.querySelector('.sr-question-grid img')?.naturalWidth>0);
      assert.match(await page.locator('#sr-question-title').innerText(),/^Who (directed|photographed) this film\?/);
      await capture(page,label+'-signature');
      await fit(page);
      await page.locator('.screening-quiz-navigation [data-screening-mode="editor"]').click();
      await page.locator('[data-editor-tile]').first().waitFor();
      await page.waitForFunction(()=>[...document.querySelectorAll('.sr-editor-frame img')].every(img=>img.naturalWidth>0));
      const currentEdit=(await stored(page,gameKey)).editor;
      assert.ok(currentEdit.order.length>=3&&!currentEdit.order.every((id,index)=>id===String(index)));
      await fit(page);
      await capture(page,label+'-editor');
      if(!mobile){
        const ids=currentEdit.order;
        await page.locator('[data-editor-tile="'+ids[0]+'"]').dragTo(page.locator('[data-editor-tile="'+ids.at(-1)+'"]'));
        const after=(await stored(page,gameKey)).editor.order;
        assert.deepEqual(after,[...ids.slice(1),ids[0]]);
        if(after.every((id,index)=>id===String(index))){
          await page.locator('[data-editor-tile="0"]').click();
          await page.locator('[data-editor-tile="1"]').click();
        }
      }
      await page.locator('[data-editor-check]').click();
      assert.equal((await stored(page,gameKey)).editor.attempts,1);
      for(let pos=0;pos<currentEdit.order.length;pos++){
        const order=await page.locator('[data-editor-tile]').evaluateAll(items=>items.map(item=>item.dataset.editorTile));
        if(order[pos]===String(pos))continue;
        await page.locator('[data-editor-tile="'+order[pos]+'"]').click();
        await page.locator('[data-editor-tile="'+pos+'"]').click();
      }
      await page.locator('[data-editor-check]').click();
      await page.locator('[data-editor-next]').waitFor();
      assert.ok((await stored(page,gameKey)).editor.solved);
      await page.reload();
      await page.locator('[data-editor-next]').waitFor();
      assert.equal((await stored(page,gameKey)).editor.id,currentEdit.id);
      await page.locator('[data-editor-next]').click();
      assert.notEqual((await stored(page,gameKey)).editor.id,currentEdit.id);
      await page.locator('.screening-quiz-navigation [data-screening-mode="connections"]').click();
      await page.locator('[data-connection-tile]').first().waitFor();
      const board=(await stored(page,gameKey)).connections;
      const definition=bank.connections.find(([id])=>id===board.id)[1];
      const tileKey=slug=>board.order.find(key=>key.endsWith('/'+slug));
      assert.equal(await page.locator('[data-connection-tile]').count(),9);
      await fit(page);
      await capture(page,label+'-connections');
      for(const [,slugs] of definition)await page.locator('[data-connection-tile="'+tileKey(slugs[0])+'"]').click();
      await page.locator('[data-connection-check]').click();
      assert.equal((await stored(page,gameKey)).connections.mistakes,1);
      for(const [index,[name,slugs]] of definition.entries()){
        for(const slug of slugs)await page.locator('[data-connection-tile="'+tileKey(slug)+'"]').click();
        await page.locator('[data-connection-check]').click();
        assert.equal((await stored(page,gameKey)).connections.solved.length,index+1);
        assert.ok(await page.getByText(name,{exact:true}).isVisible());
        if(index===0){await page.reload();await page.getByText(name,{exact:true}).waitFor();}
      }
      await page.locator('[data-connection-next]').waitFor();
      await page.locator('[data-connection-next]').click();
      assert.notEqual((await stored(page,gameKey)).connections.id,board.id);
      await page.goto(base+'/screening-room.html?mode=double');
      await page.locator('[data-memory-category="pair"]').waitFor();
      assert.equal(await page.locator('[data-memory-category="pair"]').getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('.sr-pair-clue-grid figure').count(),2);
      assert.equal(await page.locator('[data-answer]').count(),4);
      await page.waitForFunction(()=>[...document.querySelectorAll('.sr-pair-clue-grid img')].every(img=>img.naturalWidth>0));
      await fit(page);
      await capture(page,label+'-double-quiz');
      await page.locator('[data-answer]').first().click();
      await page.locator('.sr-pair-explanation').waitFor();
      assert.equal(await page.locator('.sr-feedback-links a').count(),2);
      await page.clock.setFixedTime(new Date('2026-11-28T13:00:00+03:00'));
      await page.goto(base+'/screening-room.html?mode=daily');
      await page.locator('[data-answer]').first().waitFor();
      assert.match(await page.locator('.sr-daily-banner').innerText(),/2026-11-28/);
      const q=await page.locator('[data-answer]').evaluateAll(items=>items.map(item=>item.dataset.answer));
      if(firstDaily)assert.deepEqual(q,firstDaily);else firstDaily=q;
      await page.waitForFunction(()=>document.querySelector('.sr-question-grid img')?.naturalWidth>0);
      await fit(page);
      await capture(page,label+'-daily');
      await page.locator('[data-answer]').first().click();
      await page.locator('[data-quiz-next]').click();
      await page.reload();
      await page.locator('[data-answer]').first().waitFor();
      assert.equal((await stored(page,dailyKey)).index,1);
      for(let i=1;i<5;i++){
        await page.locator('[data-answer]').first().click();
        await page.locator('[data-quiz-next]').click();
      }
      await page.locator('[data-quiz-download]').waitFor();
      assert.equal(await page.locator('[data-quiz-replay]').count(),0);
      assert.ok((await stored(page,dailyKey)).complete);
      await page.reload();
      await page.locator('[data-quiz-download]').waitFor();
      const downloadPromise=page.waitForEvent('download');
      await page.locator('[data-quiz-download]').click();
      const download=await downloadPromise;
      assert.match(download.suggestedFilename(),/TS-Archive-Daily-2026-11-28\.png/);
      const png=fs.readFileSync(await download.path());
      assert.equal(png.subarray(1,4).toString(),'PNG');
      assert.equal(png.readUInt32BE(16),1080);
      assert.equal(png.readUInt32BE(20),1080);
      if(proof)fs.copyFileSync(await download.path(),path.join(proof,label+'-daily-result.png'));
      await page.clock.setFixedTime(new Date('2026-11-29T13:00:00+03:00'));
      await page.reload();
      await page.locator('[data-answer]').first().waitFor();
      assert.match(await page.locator('.sr-daily-banner').innerText(),/2026-11-29/);
      assert.equal(await page.locator('[data-quiz-download]').count(),0);
      assert.deepEqual(errors,[]);
      await context.close();
      console.log((mobile?'Mobile':'Desktop')+': all quizzes and new activities, reload, daily date/rotation, sharing and history passed.');
    }
    // These are real local page renders, not static mockups. The entrance
    // should not load the award models merely to show its directory.
    for(const mobile of [false,true]){
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1920,height:1080},reducedMotion:'reduce'});
      await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
      const page=await context.newPage();
      const liveErrors=[],requests=[];
      page.on('pageerror',error=>liveErrors.push(error.message));
      page.on('request',request=>requests.push(request.url()));
      const routes=[['B-programme',''],['B-fixed','?preview=editorial&cover=tenet']];
      for(const [name,query] of routes){
        requests.length=0;
        await page.goto(base+'/screening-room.html'+query);
        await page.locator('#screening-landing:not([hidden])').waitFor();
        assert.equal(await page.locator('#screening-landing').getAttribute('data-layout'),'programme');
        assert.equal(await page.locator('#screening-landing').getAttribute('data-cover'),'babylon');
        assert.equal(await page.locator('#sr-landing-title').innerText(),'Cinema Lab');
        assert.equal(await page.locator('.topnav [aria-current="page"]').innerText(),'CINEMA LAB');
        assert.ok(await page.locator('#screening-play').isHidden());
        assert.equal(await page.locator('.sr-land-card[href*="mode=signature"]').count(),1);
        assert.equal(await page.locator('.sr-land-card[href*="mode=double"]').count(),0);
        assert.match(await page.locator('.sr-land-card[href*="mode=ballot"] img').getAttribute('src'),/tenet-alt-01\.webp$/);
        assert.match(await page.locator('.sr-land-card[href*="mode=memory"] img').getAttribute('src'),/screening-memory-her-640w\.webp$/);
        assert.match(await page.locator('.sr-land-card[href*="mode=connections"] img').getAttribute('src'),/screening-connections-burning-640w\.webp$/);
        assert.match(await page.locator('.sr-land-card[href*="mode=matchup"] img').getAttribute('src'),/screening-matchup-llewyn-davis-640w\.webp$/);
        assert.equal(await page.locator('.sr-land-card-title > span').count(),0);
        const heroHeight=(await page.locator('.sr-land-hero').boundingBox()).height;
        assert.ok(mobile?heroHeight>=360&&heroHeight<=440:heroHeight>=680);
        assert.equal(await page.locator('.sr-land-hero-actions a').count(),1);
        const copy=await page.locator('.sr-land-hero-copy').boundingBox();
        const credit=await page.locator('.sr-land-hero-credit').boundingBox();
        if(!mobile)assert.ok(Math.abs(copy.y+copy.height-credit.y-credit.height)<2,'Cover copy must align with the bottom credit');
        else assert.ok(copy.y+copy.height<=credit.y,'Mobile cover copy must not overlap the credit');
        await page.locator('.sr-land-hero-actions a').click({trial:true});
        await page.evaluate(()=>document.querySelectorAll('#screening-landing img').forEach(img=>{img.loading='eager';}));
        await page.waitForFunction(()=>[...document.querySelectorAll('#screening-landing img')].every(img=>img.complete&&img.naturalWidth>0));
        await page.evaluate(async()=>{await Promise.allSettled([...document.querySelectorAll('#screening-landing img,.avatar img')].map(img=>img.decode()));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
        assert.ok(await page.locator('.avatar img').evaluate(img=>img.naturalWidth>0));
        await fit(page);
        assert.ok(!requests.some(url=>/\/content\/(2010-2019|2020-2026)\.json(?:\?|$)/.test(url)),'The landing loaded full editions');
        await capture(page,(mobile?'mobile-':'')+name);
        if(proof&&!mobile)await page.screenshot({path:path.join(proof,name+'-viewport.png'),animations:'disabled'});
      }
      await page.locator('.sr-land-card[href*="mode=signature"]').click();
      await page.locator('[data-answer]').first().waitFor();
      assert.ok(await page.locator('#screening-landing').isHidden());
      assert.match(await page.locator('#sr-question-title').innerText(),/^Who (directed|photographed) this film\?/);
      await page.clock.setFixedTime(new Date('2026-11-28T13:00:00+03:00'));
      await page.goto(base+'/index.html');
      await page.locator('#edition-cards .archive-card').first().waitFor();
      const lab=page.locator('#cinema-profile .home-lab-card');
      const profile=page.locator('.profile-entry-card'),journeys=page.locator('.journey-entry-card');
      assert.equal(await lab.count(),1);
      assert.equal(await lab.locator('h3').innerText(),'Cinema Lab');
      assert.equal(await lab.locator('.eyebrow').count(),0);
      assert.equal(await page.locator('.daily-frame-entry .screening-entry-copy p').innerText(),'What remains when the lights return.');
      assert.equal(await lab.locator('.home-lab-cover').getAttribute('href'),'screening-room.html');
      assert.equal(await lab.locator('.home-lab-daily').getAttribute('href'),'screening-room.html?mode=daily');
      assert.equal(await page.locator('.topnav a[href="screening-room.html"]').innerText(),'CINEMA LAB');
      const [lb,pb,jb]=await Promise.all([lab.boundingBox(),profile.boundingBox(),journeys.boundingBox()]);
      assert.ok(lb.y>=Math.max(pb.y+pb.height,jb.y+jb.height),'Lab must follow both discovery cards');
      assert.ok(Math.abs(lb.x-pb.x)<2&&Math.abs(lb.x+lb.width-jb.x-jb.width)<2,'Lab must span the discovery grid');
      if(!mobile) assert.ok(Math.abs(lb.x-1920*.072)<3,'The homepage must use the slightly wider desktop gutters');
      assert.ok((await page.locator('#lists').boundingBox()).y>lb.y+lb.height);
      assert.ok(await lab.locator('h3').evaluate((el,mobile)=>{const size=parseFloat(getComputedStyle(el).fontSize);return mobile?size>=24&&size<=30:size>=28&&size<=44;},mobile));
      const artBox=await lab.locator('.home-lab-art').boundingBox();
      assert.ok(Math.abs(lb.width-artBox.width)<3&&Math.abs(lb.height-artBox.height)<3,'The still must fill the framed card');
      await lab.scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelector('.home-lab-art img').naturalWidth>0);
      assert.match(await lab.locator('.home-lab-art img').getAttribute('srcset'),/babylon-cinema-lab-4096w\.webp 4096w/);
      assert.equal(await lab.locator('.home-lab-art img').getAttribute('width'),'4096');
      await lab.locator('.home-lab-daily').click({trial:true});
      await lab.locator('.home-lab-cover').click({trial:true,position:{x:lb.width-12,y:12}});
      if(proof){
        await page.evaluate(()=>document.activeElement?.blur());
        const screenshotStyle=await page.addStyleTag({content:'body[data-page="home"] .masthead,body[data-page="home"] .skip{visibility:hidden!important}'});
        await page.locator('#cinema-profile').screenshot({path:path.join(proof,(mobile?'mobile-':'desktop-')+'home-lab.png'),animations:'disabled'});
        await lab.screenshot({path:path.join(proof,(mobile?'mobile-':'desktop-')+'lab-card.png'),animations:'disabled'});
        await screenshotStyle.evaluate(style=>style.remove());
      }
      await page.locator('#screening-daily').scrollIntoViewIfNeeded();
      await page.locator('.screening-daily-card').waitFor();
      assert.equal(await page.locator('.screening-daily-heading span').innerText(),'Frame of the day');
      assert.ok(await page.locator('.screening-daily-card').evaluate(el=>getComputedStyle(el,'::after').backgroundImage.includes('linear-gradient')));
      for(const [date,title,slug] of [
        ['2026-11-28','Chungking Express','chungking-express'],
        ['2026-11-29','Dark City','dark-city'],
        ['2026-11-30','Magnetic Rose','magnetic-rose']
      ]){
        await page.clock.setFixedTime(new Date(date+'T00:05:00+03:00'));
        await page.evaluate(()=>dispatchEvent(new Event('focus')));
        await page.waitForFunction(title=>document.querySelector('.screening-daily-caption strong')?.textContent===title,title);
        assert.equal(await page.locator('.screening-daily-heading time').getAttribute('datetime'),date);
        assert.equal(await page.locator('.screening-daily-card').getAttribute('target'),'_blank');
        await page.waitForFunction(slug=>{const image=document.querySelector('.screening-daily-card img');return image?.currentSrc.includes('daily-'+slug)&&image.complete&&image.naturalWidth>0;},slug);
        if(proof)await page.locator('#screening-daily').screenshot({path:path.join(proof,(mobile?'mobile-':'desktop-')+'daily-frame-'+date+'.png')});
      }
      await fit(page);
      await lab.locator('.home-lab-daily').click();
      await page.locator('[data-answer]').first().waitFor();
      assert.match(page.url(),/mode=daily/);
      assert.deepEqual(liveErrors,[]);
      await context.close();
    }
    console.log('Approved Babylon programme and Tenet ballot art verified on desktop and mobile; the entrance loads no full edition data.');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
