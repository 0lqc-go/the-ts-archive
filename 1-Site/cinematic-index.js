/* 03 — a contextual still, not a second search or a carousel. */
(() => {
  'use strict';
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const glyph = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4" width="15" height="12" rx="1.6"/><circle cx="7" cy="8" r="1.3"/><path d="m4.5 14 4-3.7 2.7 2.4 2.5-2.3 2.2 2.3"/></svg>';
  const desktop = matchMedia('(min-width: 760px)');

  function create(dialog, results) {
    const shell = document.createElement('div');
    shell.className = 'ts-index-shell';
    const panel = document.createElement('aside');
    panel.className = 'ts-index-preview';
    panel.setAttribute('aria-label','Selected result preview');
    panel.hidden = true;
    results.before(shell); shell.append(results,panel);
    dialog.classList.add('ts-visual-index');
    let data = new Map(), current = null, inline = null, timer;

    function imageMarkup(item, inlineView = false) {
      if (!item.path) return '';
      return `<div class="ts-index-preview-art${item.poster ? ' is-poster' : ''}"><img src="${esc(item.src || item.path)}" width="${item.width || 960}" height="${item.height || 540}" alt="${esc(item.alt || 'Film still')}" decoding="async"${inlineView ? ' loading="lazy"' : ''}></div>`;
    }
    function previewMarkup(item, inlineView = false) {
      // The row already names the film or award on touch screens; avoid
      // duplicating its heading and use the small image to add context.
      if(inlineView)return `${imageMarkup(item,true)}<div class="ts-index-preview-copy"><p class="ts-index-preview-kicker">${esc(item.kicker)}</p><strong>${esc(item.credit||item.meta||item.title)}</strong></div>`;
      return `${imageMarkup(item,inlineView)}<div class="ts-index-preview-copy"><p class="ts-index-preview-kicker">${esc(item.kicker)}</p><strong>${esc(item.title)}</strong>${item.meta ? `<p>${esc(item.meta)}</p>` : ''}${item.credit ? `<small>${esc(item.credit)}</small>` : ''}</div>`;
    }
    function show(row) {
      if (!desktop.matches || !row || !data.has(row.dataset.visualPreview)) return;
      const id = row.dataset.visualPreview;
      if (current === row && panel.dataset.previewKey === id) return;
      if (current) current.classList.remove('ts-index-selected');
      current = row; current.classList.add('ts-index-selected');
      panel.dataset.previewKey = id;
      panel.innerHTML = previewMarkup(data.get(id));
      panel.hidden = false;
    }
    function closeInline() {
      if (!inline) return;
      inline.button.setAttribute('aria-expanded','false');
      inline.button.removeAttribute('aria-controls');
      inline.box.remove(); inline = null;
    }
    function toggleInline(button) {
      const wrapper = button.closest('.ts-index-row-wrap');
      const row = $('.index-row',wrapper);
      const item = data.get(row?.dataset.visualPreview);
      if (!item) return;
      const same = inline?.button === button;
      closeInline();
      if (same) return;
      const box = document.createElement('div');
      box.className = 'ts-index-inline';
      box.id = button.dataset.previewPanel;
      box.innerHTML = previewMarkup(item,true);
      button.setAttribute('aria-expanded','true');
      button.setAttribute('aria-controls',box.id);
      wrapper.append(box); inline = {button,box};
      const bottom = box.getBoundingClientRect().bottom;
      const region = results.getBoundingClientRect();
      if (bottom > region.bottom + 12) results.scrollBy({top:Math.min(bottom-region.bottom + 8, box.offsetHeight),behavior:'instant'});
    }
    function clear() {
      clearTimeout(timer); closeInline();
      current?.classList.remove('ts-index-selected'); current = null;
      panel.hidden = true; panel.replaceChildren(); delete panel.dataset.previewKey;
      shell.classList.remove('has-previews'); data = new Map();
    }
    function render(records) {
      clear(); data = records;
      const rows = $$('[data-visual-preview]',results).filter(row=>data.has(row.dataset.visualPreview));
      if (!rows.length) return;
      shell.classList.add('has-previews');
      rows.forEach((row,index) => {
        const item = data.get(row.dataset.visualPreview);
        const wrap = document.createElement('div'); wrap.className='ts-index-row-wrap';
        row.before(wrap); wrap.append(row);
        const peek = document.createElement('button');
        peek.type = 'button'; peek.className='ts-index-peek'; peek.innerHTML=glyph;
        peek.setAttribute('aria-label',`Preview ${item.title}`); peek.setAttribute('title',`Preview ${item.title}`);
        peek.setAttribute('aria-expanded','false'); peek.dataset.previewPanel=`ts-index-inline-${index}`;
        wrap.append(peek);
      });
      if (desktop.matches) show(rows[0]);
    }

    results.addEventListener('pointerover',event => {
      const row = event.target.closest?.('[data-visual-preview]');
      if (event.pointerType === 'touch' || !row || !desktop.matches || row === current) return;
      clearTimeout(timer); timer=setTimeout(()=>{if(row.isConnected)show(row);},65);
    });
    results.addEventListener('focusin',event => {
      const row = event.target.closest?.('[data-visual-preview]');
      if (row) { clearTimeout(timer); show(row); }
    });
    results.addEventListener('click',event => {
      const peek = event.target.closest('.ts-index-peek');
      if (peek) { event.preventDefault(); toggleInline(peek); }
    });
    results.addEventListener('keydown', event => {
      const row=event.target.closest?.('[data-visual-preview]');
      if (!row || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || !['ArrowDown','ArrowUp'].includes(event.key)) return;
      const rows=$$('[data-visual-preview]',results);
      const next=rows[rows.indexOf(row)+(event.key==='ArrowDown'?1:-1)];
      if (next) { event.preventDefault(); next.focus({preventScroll:true}); next.scrollIntoView({block:'nearest'}); }
    });
    desktop.addEventListener?.('change',()=>{
      closeInline();
      if (desktop.matches) { const row = current || $('[data-visual-preview]',results); current=null; show(row); }
      else { panel.hidden=true; panel.replaceChildren(); delete panel.dataset.previewKey; current?.classList.remove('ts-index-selected'); current=null; }
    });
    dialog.addEventListener('close',()=>{ clearTimeout(timer); closeInline(); });
    return {render,clear};
  }

  window.ArchiveVisualIndex = {create};
})();
