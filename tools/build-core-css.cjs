// The shared styles retain their exact cascade; one cached request replaces
// ten structural stylesheets and the separate fonts import on every page.
const fs=require('node:fs');
const path=require('node:path');
const site=path.join(__dirname,'..','1-Site');
const order=['fonts.css','style.css','edition.css','refinement.css','archive.css',
  'award-hierarchy.css','award-experience.css','archive-experience.css',
  'archive-discovery.css','archive-explore.css','archive-editorial.css'];
const bundle='/* GENERATED: tools/build-core-css.cjs; edit the source stylesheets. */\n'+order.map(file=>{
  let contents=fs.readFileSync(path.join(site,file),'utf8').replace(/\r\n/g,'\n');
  if(file==='style.css')contents=contents.replace(/^@import\s+url\('fonts\.css'\);\s*/,'');
  return `\n/* ${file} */\n${contents.trimEnd()}\n`;
}).join('');
const target=path.join(site,'archive-core.css');
if(process.argv.includes('--check')){
  if(!fs.existsSync(target)||fs.readFileSync(target,'utf8').replace(/\r\n/g,'\n')!==bundle)throw Error('Run node tools/build-core-css.cjs to update the shared bundle.');
}else fs.writeFileSync(target,bundle,'utf8');
console.log(`Shared CSS: ${order.length} sources, ${Buffer.byteLength(bundle)} bytes.`);
