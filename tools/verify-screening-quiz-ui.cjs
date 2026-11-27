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
const fit=async page=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Horizontal overflow');
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.argv[3],headless:true,args:['--disable-background-networking','--disable-component-update']});
  try {
    for (const mobile of [false,true]) {
      const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},reducedMotion:'reduce',timezoneId:'Asia/Baghdad'});
      await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
      const page=await context.newPage(),errors=[];
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
      assert.deepEqual(errors,[]);
      await context.close();
      console.log((mobile?'Mobile':'Desktop')+': all quiz modes, replay, reload, mixed difficulty and history passed.');
    }
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
