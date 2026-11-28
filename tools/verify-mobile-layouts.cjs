/* Responsive browser audit for the archive's public routes and active dialogs. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.argv[2]||'playwright');
const repo=path.join(__dirname,'..'),site=path.join(repo,'1-Site'),proof=process.argv[4];
const audit=process.argv.includes('--audit');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  try{
    const name=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname).replace(/^\//,'')||'index.html';
    let file=path.resolve(site,name);
    if(!file.startsWith(path.resolve(site)+path.sep))return res.writeHead(404).end();
    if(!fs.existsSync(file)&&/^assets\/films\/[^/]+\.(webp|jpg|png)$/.test(name))file=path.join(repo,'2-Artwork','films',path.basename(name));
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(fs.readFileSync(file));
  }catch{if(!res.headersSent)res.writeHead(404);res.end();}
});
const screens=[
  ['home','index.html','#edition-cards .archive-card'],
  ['awards-2010','awards.html?edition=2010-2019','#chapter-content .award-card'],
  ['awards-2020','awards.html?edition=2020-2026','#chapter-content .award-card'],
  ['film-file','awards.html?edition=2010-2019&film=inception','#film-file-dialog[open]'],
  ['snubs-2010','snubs.html?edition=2010-2019','#snub-entries .snub-card'],
  ['snubs-2020','snubs.html?edition=2020-2026','#snub-entries .snub-card'],
  ['lab','screening-room.html','#screening-landing:not([hidden])'],
  ['frame','screening-room.html?mode=frame','#screening-activity:not([hidden]) .sr-answer'],
  ['signature','screening-room.html?mode=signature','#screening-activity:not([hidden]) .sr-answer'],
  ['daily','screening-room.html?mode=daily','#screening-activity:not([hidden]) .sr-answer'],
  ['winner','screening-room.html?mode=winner','#screening-activity:not([hidden]) .sr-winner-option'],
  ['memory','screening-room.html?mode=memory','#screening-activity:not([hidden])'],
  ['editor','screening-room.html?mode=editor','.sr-editor-grid'],
  ['connections','screening-room.html?mode=connections','.sr-connection-grid'],
  ['ballot','screening-room.html?mode=ballot','#screening-activity:not([hidden])'],
  ['matchup','screening-room.html?mode=matchup','#screening-activity:not([hidden])'],
  ['journeys','screening-room.html?mode=journeys','#screening-activity:not([hidden])'],
  ['profile','cinema-profile.html?home=1','.cp-start-card']
];
const settle=page=>page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
async function measure(page,label,width,record){
  const info=await page.evaluate(()=>{
    const visible=el=>el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden';
    const root=document.documentElement,active=document.querySelector('dialog[open]')||document.querySelector('main')||document.body;
    const headline=[...active.querySelectorAll('h1,h2,h3,.winner-title,.file-title,.cp-signature-name,.sr-memory-clue')].filter(visible).slice(0,9).map(el=>({text:el.textContent.trim().replace(/\s+/g,' ').slice(0,48),size:Math.round(parseFloat(getComputedStyle(el).fontSize))}));
    const horizontal= root.scrollWidth>innerWidth+2;
    const outside=[...active.querySelectorAll('h1,h2,h3,p,button,a,input,select')].filter(visible).filter(el=>{
      const r=el.getBoundingClientRect();
      if(r.width<.5||r.right<=innerWidth+2&&r.left>=-2)return false;
      // Horizontal film strips, nav bars and poster reels may scroll locally.
      let parent=el.parentElement;
      while(parent&&parent!==root){if(/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowX))return false;parent=parent.parentElement;}
      return true;
    }).slice(0,5).map(el=>({text:el.textContent.trim().slice(0,42),class:el.className?.baseVal||el.className||el.tagName,w:Math.round(el.getBoundingClientRect().width)}));
    const header=document.querySelector('.masthead');
    const mast=header?Math.round(header.getBoundingClientRect().height):0;
    const headerFit=header?[...header.children].filter(visible).map(el=>el.getBoundingClientRect()).every((r,i,all)=>r.left>=-1&&r.right<=innerWidth+1&&(!i||r.left>=all[i-1].right-1)):true;
    const activeTabs=[...document.querySelectorAll('.screening-navigation,.screening-quiz-navigation:not([hidden])')].filter(visible).every(strip=>{const a=strip.querySelector('[aria-current="page"]');if(!a)return true;const ar=a.getBoundingClientRect(),sr=strip.getBoundingClientRect();return ar.left>=sr.left-2&&ar.right<=sr.right+2;});
    const mobileTokens=getComputedStyle(root).getPropertyValue('--m-section').trim();
    const compact=matchMedia('(max-width: 680px), (max-width: 932px) and (pointer: coarse) and (max-height: 500px)').matches;
    const mobileMedia=matchMedia('(max-width: 760px), (max-width: 932px) and (pointer: coarse) and (max-height: 500px)').matches;
    return {viewport:innerWidth,height:innerHeight,scrollWidth:root.scrollWidth,horizontal,outside,mast,headerFit,activeTabs,mobileTokens,compact,mobileMedia,headline};
  });
  record.push({label,width,...info});
  if(!audit){assert.ok(!info.horizontal,`${label} overflows at ${width}px: ${JSON.stringify(info)}`);assert.equal(info.outside.length,0,`${label} has elements outside ${width}px: ${JSON.stringify(info.outside)}`);assert.ok(info.headerFit,`${label} masthead overlaps at ${width}px`);if(info.compact)assert.ok(info.activeTabs,`${label} active tab is out of view at ${width}px`);if(!info.mobileMedia)assert.equal(info.mobileTokens,'','Mobile scale must not affect the desktop');}
}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({executablePath:process.argv[3],headless:true,args:['--disable-background-networking','--disable-component-update']});
  const record=[];
  if(proof)fs.mkdirSync(proof,{recursive:true});
  try{
    const viewports=audit?[[390,844],[320,844]]:[[320,844],[360,800],[390,844],[430,932],[540,900],[768,844],[844,390]];
    for(const [width,height] of viewports){
      const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
      await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
      const page=await context.newPage(),errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      for(const [label,url,ready] of screens){
        try{
          await page.goto(base+'/'+url,{waitUntil:'domcontentloaded'});
          await page.locator(ready).first().waitFor({timeout:12000});
          await settle(page);
          await measure(page,label,width,record);
          if(proof&&width===390)await page.screenshot({path:path.join(proof,label+'.png'),animations:'disabled'});
          if(label==='home'&&proof&&width===390){
            await page.locator('#cinema-profile').scrollIntoViewIfNeeded();
            const hide=await page.addStyleTag({content:'.masthead,.skip{visibility:hidden!important}'});
            await page.locator('#cinema-profile').screenshot({path:path.join(proof,'home-discovery.png')});
            await hide.evaluate(el=>el.remove());
            await page.evaluate(()=>scrollTo(0,0));
          }
          if(label==='awards-2010'){
            await page.locator('[data-view-toggle]').click();
            await page.waitForFunction(()=>document.body.dataset.awardView==='compact');
            await settle(page);await measure(page,'awards-compact',width,record);
            await page.locator('[data-view-toggle]').click();
            await page.waitForFunction(()=>document.body.dataset.awardView==='cinematic');
            await page.locator('.start-ceremony').click();
            await page.locator('#award-dialog[open]').waitFor();
            await settle(page);await measure(page,'award-dialog',width,record);
            if(proof&&width===390)await page.screenshot({path:path.join(proof,'award-dialog.png')});
            const reveal=page.locator('.ts-ceremony-reveal');
            if(await reveal.isVisible()){await reveal.click();await page.locator('#award-dialog .ceremony-body').waitFor();await settle(page);await measure(page,'award-revealed',width,record);}
          }
          if(label==='film-file'){
            await page.locator('[data-file-group="frames"] .file-group-summary').click();
            await page.locator('[data-file-group="frames"][open] .file-frames-grid').waitFor();
            await settle(page);await measure(page,'film-frames',width,record);
            if(proof&&width===390)await page.screenshot({path:path.join(proof,'film-frames.png')});
          }
          if(label==='profile'){
            await page.locator('[data-action="start"]').click();
            await page.locator('.cp-question-title').waitFor();
            await settle(page);await measure(page,'profile-question-en',width,record);
            if(proof&&width===390)await page.screenshot({path:path.join(proof,'profile-question-en.png')});
            await page.locator('[data-lang="ar"]').click();
            await page.locator('#cp-root[dir="rtl"] .cp-question-title').waitFor();
            await settle(page);await measure(page,'profile-question-ar',width,record);
            if(proof&&width===390)await page.screenshot({path:path.join(proof,'profile-question-ar.png')});
            await page.evaluate(()=>localStorage.clear());
          }
        }catch(error){if(!audit)throw error;record.push({label,width,error:String(error).slice(0,200)});}
      }
      if(!audit)assert.deepEqual(errors,[],`Page errors at ${width}px`);
      await context.close();
    }
    if(proof)fs.writeFileSync(path.join(proof,'layout-audit.json'),JSON.stringify(record,null,2));
    if(audit)for(const item of record)console.log(JSON.stringify(item));
    console.log(`${record.length} mobile route/state checks.`);
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
