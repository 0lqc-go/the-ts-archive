/* Approved archive presentation settings. No public comparison modes. */
(() => {
  'use strict';
  const ids=new Set(['05','07','09','10','11','12','15']);
  for(const id of ids)document.documentElement.classList.add('ts-r2-'+id);
  document.documentElement.classList.add('ts-frame-lens');
  const stages=new WeakMap();
  function stageCut(root,key,selector){
    if(!root||stages.get(root)===key)return false;
    stages.set(root,key);root.querySelector(selector)?.classList.add('ts-question-cut');return true;
  }
  window.ArchiveFeatures=Object.freeze({enabled:id=>ids.has(id),stageCut,
    hoverVariant:'edge',frameVariant:'lens',linkSettings:target=>new URL(target,location.href)});
})();
