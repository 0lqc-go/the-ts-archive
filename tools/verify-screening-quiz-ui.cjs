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
      await page.locator('.screening-quiz-navigation [data-screening-mode="memory"]').click();
      await page.locator('[data-memory-category="signature"]').click();
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
      await page.locator('.screening-navigation [data-screening-mode="double"]').click();
      await page.locator('#sr-double-theme').waitFor();
      await page.locator('#sr-double-theme').selectOption('The cost of control');
      assert.equal(await page.locator('.sr-double-card').count(),2);
      await page.locator('#sr-double-title').fill('A private obsession');
      const pair=(await stored(page,gameKey)).pair;
      assert.equal(pair.theme,'The cost of control');
      await page.waitForFunction(()=>[...document.querySelectorAll('.sr-double-art img')].every(img=>img.naturalWidth>0));
      await fit(page);
      await capture(page,label+'-double');
      await page.locator('[data-double-swap]').click();
      assert.deepEqual((await stored(page,gameKey)).pair.keys,[...pair.keys].reverse());
      assert.equal(await page.locator('#sr-double-theme').inputValue(),'The cost of control');
      await page.reload();
      await page.locator('#sr-double-title').waitFor();
      assert.equal(await page.locator('#sr-double-title').inputValue(),'A private obsession');
      await page.locator('[data-double-film="0"]').selectOption('2010-2019/inception');
      assert.equal(await page.locator('#sr-double-theme').inputValue(),'');
      await page.locator('[data-double-copy]').click();
      await page.waitForFunction(()=>!!document.querySelector('#sr-pair-status')?.textContent);
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
      await page.locator('[data-daily-share]').waitFor();
      assert.equal(await page.locator('[data-quiz-replay]').count(),0);
      assert.ok((await stored(page,dailyKey)).complete);
      await page.reload();
      await page.locator('[data-daily-share]').waitFor();
      await page.locator('[data-daily-share]').click();
      await page.waitForFunction(()=>!!document.querySelector('#sr-daily-share-status')?.textContent);
      await page.clock.setFixedTime(new Date('2026-11-29T13:00:00+03:00'));
      await page.reload();
      await page.locator('[data-answer]').first().waitFor();
      assert.match(await page.locator('.sr-daily-banner').innerText(),/2026-11-29/);
      assert.equal(await page.locator('[data-daily-share]').count(),0);
      assert.deepEqual(errors,[]);
      await context.close();
      console.log((mobile?'Mobile':'Desktop')+': all quizzes and new activities, reload, daily date/rotation, sharing and history passed.');
    }
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
