/* Interactive editorial puzzles. No account, external media request, or
   server-side player profile is needed; the current device keeps progress. */
(() => {
  'use strict';
  const storageKey='ts-archive-screening-games-v1';
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  function make({archive,activity,data,esc,poster,imageAttrs,focusHeading}) {
    let saved={};
    try { saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{}; } catch {}
    const state={counts:{editor:{},connections:{}},editor:null,connections:null,pair:null};
    for (const game of ['editor','connections']) {
      for (const puzzle of archive[game]) {
        const count=saved.counts?.[game]?.[puzzle.id];
        if (Number.isSafeInteger(count)&&count>0) state.counts[game][puzzle.id]=count;
      }
    }
    const persist=()=>{try {localStorage.setItem(storageKey,JSON.stringify(state));} catch {}};
    const equal=(a,b)=>a.length===b.length&&a.every((item,index)=>item===b[index]);
    const validOrder=(order,keys)=>Array.isArray(order)&&order.length===keys.length&&new Set(order).size===keys.length&&order.every(key=>keys.includes(key));
    const nextPuzzle=game=>{
      const pool=archive[game], counts=state.counts[game];
      if (!pool.length) return null;
      // Merge exposure from other opened archive tabs before selecting.
      try {
        const latest=JSON.parse(localStorage.getItem(storageKey)||'{}')?.counts;
        for(const name of ['editor','connections'])for(const item of archive[name]){
          const value=latest?.[name]?.[item.id];
          if(Number.isSafeInteger(value)&&value>0)state.counts[name][item.id]=Math.max(state.counts[name][item.id]||0,value);
        }
      } catch {}
      const puzzle=data.nextGamePuzzle(pool,counts);
      counts[puzzle.id]=(counts[puzzle.id]||0)+1;
      return puzzle;
    };
    const shuffled=(keys)=>{
      const order=data.shuffle(keys,Math.random);
      return equal(order,keys)?[...order].reverse():order;
    };
    const count=(value,max)=>Number.isInteger(value)?Math.max(0,Math.min(max,value)):0;
    const editorPuzzle=id=>archive.editor.find(item=>item.id===id);
    const connectionPuzzle=id=>archive.connections.find(item=>item.id===id);
    const initialEditor=editorPuzzle(saved.editor?.id);
    if (initialEditor) {
      const keys=initialEditor.frames.map(item=>item.id), r=saved.editor;
      if (validOrder(r.order,keys)) {
        const done=Boolean(r.done), solved=done&&Boolean(r.solved);
        state.editor={id:r.id,order:done?keys:[...r.order],attempts:count(r.attempts,3),checked:Boolean(r.checked),done,solved};
      }
    }
    const initialConnection=connectionPuzzle(saved.connections?.id);
    if (initialConnection) {
      const r=saved.connections,keys=initialConnection.groups.flatMap(group=>group.films.map(film=>film.key));
      if (validOrder(r.order,keys)) {
        const solved=[...new Set(Array.isArray(r.solved)?r.solved:[])].filter(id=>initialConnection.groups.some(group=>group.id===id));
        state.connections={id:r.id,order:[...r.order],solved,mistakes:count(r.mistakes,4),done:Boolean(r.done)||solved.length===3||r.mistakes>=4};
      }
    }
    let editorSelected=null, groupSelection=new Set(), connectionMessage='';

    function startEditor(){
      const puzzle=nextPuzzle('editor');
      if (!puzzle) return;
      state.editor={id:puzzle.id,order:shuffled(puzzle.frames.map(item=>item.id)),attempts:0,checked:false,done:false,solved:false};
      editorSelected=null;persist();
    }

    function puzzleStill(frame,alt='Film still') {
      return `<img ${imageAttrs(frame.path,'(max-width: 680px) 93vw, (max-width: 1050px) 45vw, 520px',640)} width="${frame.width}" height="${frame.height}" alt="${esc(alt)}" decoding="async" loading="eager">`;
    }

    function renderEditor(){
      if (!state.editor) startEditor();
      const r=state.editor, puzzle=editorPuzzle(r?.id);
      if (!puzzle) {activity.innerHTML='<p class="sr-empty">No editing sequences are available yet.</p>';return;}
      const keys=puzzle.frames.map(item=>item.id);
      const correct=r.order.filter((key,index)=>key===keys[index]).length;
      const note=r.done?(r.solved?'Sequence reconstructed.':'The original sequence.'):r.checked?`${correct} of ${keys.length} in place. Try again.`:'Select two frames to swap them, or use the position controls.';
      activity.innerHTML=`<section class="sr-game sr-editor">
        <header class="sr-game-heading"><div><p class="screening-kicker">The Editor · ${r.done?'Review':'Screen order'}</p><h2 tabindex="-1">${esc(puzzle.film.title)}.</h2><p>Arrange the stills as they appear in the film, from first to last.</p></div><span class="sr-game-meta">${r.done?'Sequence complete':`${3-r.attempts} attempts left`}</span></header>
        <ol class="sr-editor-grid" style="--editor-count:${keys.length}" aria-label="Film sequence">${r.order.map((id,index)=>{
          const item=puzzle.frames.find(frame=>frame.id===id);
          const mark=(r.done||r.checked)&&keys[index]===id;
          return `<li class="sr-editor-card${mark?' is-placed':''}">
            <button type="button" class="sr-editor-frame" data-editor-tile="${esc(id)}" aria-label="Frame at position ${index+1}${r.done?', '+esc(item.caption):''}" aria-pressed="${editorSelected===id}"${r.done?' disabled':''}>${puzzleStill(item.frame,`Frame ${index+1}`)}<span class="sr-editor-number">${String(index+1).padStart(2,'0')}</span>${mark?'<span class="sr-editor-mark" aria-hidden="true">✓</span>':''}</button>
            ${r.done?`<p class="sr-editor-caption">${esc(item.caption)}</p>`:`<div class="sr-editor-moves"><button type="button" class="sr-text-action" aria-label="Move frame ${index+1} earlier" data-editor-move="${esc(id)}" data-step="-1"${index===0?' disabled':''}>← Earlier</button><button type="button" class="sr-text-action" aria-label="Move frame ${index+1} later" data-editor-move="${esc(id)}" data-step="1"${index===keys.length-1?' disabled':''}>Later →</button></div>`}
          </li>`;
        }).join('')}</ol>
        <div class="sr-game-actions"><p role="status">${esc(note)}</p><div>${r.done?`<a class="sr-secondary" href="${esc(puzzle.film.href)}">Open film</a><button type="button" class="sr-primary" data-editor-next>New sequence</button>`:'<button type="button" class="sr-text-action" data-editor-reveal>Reveal order</button><button type="button" class="sr-primary" data-editor-check>Check order</button>'}</div></div>
      </section>`;
      function swap(a,b){
        const x=r.order.indexOf(a),y=r.order.indexOf(b);
        if (x<0||y<0||x===y) return;
        [r.order[x],r.order[y]]=[r.order[y],r.order[x]];
        r.checked=false;editorSelected=null;persist();renderEditor();
        $(`[data-editor-tile="${a}"]`,activity)?.focus({preventScroll:true});
      }
      for (const button of $$('[data-editor-tile]',activity)) button.addEventListener('click',()=>{
        const id=button.dataset.editorTile;
        if (editorSelected&&editorSelected!==id) swap(editorSelected,id);
        else {editorSelected=editorSelected===id?null:id;for(const tile of $$('[data-editor-tile]',activity))tile.setAttribute('aria-pressed',String(tile.dataset.editorTile===editorSelected));}
      });
      for(const button of $$('[data-editor-move]',activity)) button.addEventListener('click',()=>{
        const id=button.dataset.editorMove, next=r.order.indexOf(id)+Number(button.dataset.step);
        if (next>=0&&next<r.order.length) swap(id,r.order[next]);
      });
      $('[data-editor-check]',activity)?.addEventListener('click',()=>{
        r.attempts++;r.checked=true;
        r.solved=equal(r.order,keys);r.done=r.solved||r.attempts>=3;
        if(r.done)r.order=[...keys];
        editorSelected=null;persist();renderEditor();$('[data-editor-check], [data-editor-next]',activity)?.focus({preventScroll:true});
      });
      $('[data-editor-reveal]',activity)?.addEventListener('click',()=>{r.done=true;r.solved=false;r.order=[...keys];editorSelected=null;persist();renderEditor();$('[data-editor-next]',activity)?.focus({preventScroll:true});});
      $('[data-editor-next]',activity)?.addEventListener('click',()=>{startEditor();renderEditor();focusHeading(activity);});
    }

    function startConnections(){
      const puzzle=nextPuzzle('connections');
      if(!puzzle)return;
      state.connections={id:puzzle.id,order:shuffled(puzzle.groups.flatMap(group=>group.films.map(film=>film.key))),solved:[],mistakes:0,done:false};
      groupSelection.clear();connectionMessage='';persist();
    }

    function renderConnections(){
      if(!state.connections)startConnections();
      const r=state.connections,puzzle=connectionPuzzle(r?.id);
      if(!puzzle){activity.innerHTML='<p class="sr-empty">No connection boards are available yet.</p>';return;}
      const revealed=puzzle.groups.filter(group=>r.done||r.solved.includes(group.id));
      const remaining=r.order.filter(key=>!revealed.some(group=>group.films.some(film=>film.key===key)));
      const note=r.done?(r.solved.length===3?'All three connections found.':`${r.solved.length} of 3 groups found. The remaining links are revealed.`):connectionMessage||'Select three films that share an intended credit.';
      activity.innerHTML=`<section class="sr-game sr-connections">
        <header class="sr-game-heading"><div><p class="screening-kicker">Connections · ${esc(puzzle.category)}</p><h2 tabindex="-1">Find the threads.</h2><p>Make three groups of three. Each group shares a ${puzzle.category==='Cast'?'performer':puzzle.category==='Directors'?'director':puzzle.category==='Composers'?'composer':'cinematographer'}.</p></div><span class="sr-game-meta">${r.done?`${r.solved.length} of 3 found`:`${4-r.mistakes} mistakes remaining`}</span></header>
        <div class="sr-connection-revealed" aria-label="Revealed groups">${revealed.map(group=>`<article class="sr-connection-group${r.solved.includes(group.id)?' is-found':''}"><div><strong>${esc(group.label)}</strong><small>${r.solved.includes(group.id)?'Found':'Revealed'}</small></div><div class="sr-connection-links">${group.films.map(film=>`<a href="${esc(film.href)}">${esc(film.title)}</a>`).join('')}</div></article>`).join('')}</div>
        ${remaining.length?`<div class="sr-connection-grid" role="group" aria-label="Choose three films">${remaining.map(key=>{
          const film=archive.films.get(key);
          return `<button type="button" class="sr-connection-tile" data-connection-tile="${esc(key)}" aria-pressed="${groupSelection.has(key)}">${poster(film)}<span><strong>${esc(film.title)}</strong><small>${esc(film.year)}</small></span></button>`;
        }).join('')}</div>`:''}
        <div class="sr-game-actions"><p role="status">${esc(note)}</p><div>${r.done?'<button type="button" class="sr-primary" data-connection-next>New board</button>':`<span class="sr-selection-count">${groupSelection.size} of 3</span><button type="button" class="sr-text-action" data-connection-reveal>Reveal groups</button><button type="button" class="sr-primary" data-connection-check${groupSelection.size===3?'':' disabled'}>Submit group</button>`}</div></div>
      </section>`;
      for(const tile of $$('[data-connection-tile]',activity))tile.addEventListener('click',()=>{
        const key=tile.dataset.connectionTile;
        if(groupSelection.has(key))groupSelection.delete(key);
        else if(groupSelection.size<3)groupSelection.add(key);
        else return;
        tile.setAttribute('aria-pressed',String(groupSelection.has(key)));
        $('.sr-selection-count',activity).textContent=`${groupSelection.size} of 3`;
        $('[data-connection-check]',activity).disabled=groupSelection.size!==3;
      });
      $('[data-connection-check]',activity)?.addEventListener('click',()=>{
        if(groupSelection.size!==3)return;
        const found=puzzle.groups.find(group=>!r.solved.includes(group.id)&&group.films.every(film=>groupSelection.has(film.key)));
        if(found){r.solved.push(found.id);connectionMessage='Connection found.';}
        else {r.mistakes++;connectionMessage='Not one of the intended groups. Look for a set that fits all the films.';}
        r.done=r.solved.length===3||r.mistakes>=4;groupSelection.clear();persist();renderConnections();
        ($('[data-connection-tile]',activity)||$('[data-connection-next]',activity))?.focus({preventScroll:true});
      });
      $('[data-connection-reveal]',activity)?.addEventListener('click',()=>{r.done=true;groupSelection.clear();persist();renderConnections();$('[data-connection-next]',activity)?.focus({preventScroll:true});});
      $('[data-connection-next]',activity)?.addEventListener('click',()=>{startConnections();renderConnections();focusHeading(activity);});
    }

    const allFilms=[...archive.filmList].sort((a,b)=>a.title.localeCompare(b.title));
    const programs=archive.doubleFeatures;
    const firstProgram=programs[0];
    function validPair(value) {
      return value&&Array.isArray(value.keys)&&value.keys.length===2&&value.keys[0]!==value.keys[1]&&value.keys.every(key=>archive.films.has(key));
    }
    if(validPair(saved.pair))state.pair={keys:[...saved.pair.keys],title:typeof saved.pair.title==='string'?saved.pair.title.slice(0,80):'',theme:typeof saved.pair.theme==='string'?saved.pair.theme:''};
    if(!state.pair&&firstProgram)state.pair={keys:firstProgram.films.map(film=>film.key),title:'',theme:firstProgram.theme};

    function renderDouble(){
      const r=state.pair;
      if(!validPair(r)){activity.innerHTML='<p class="sr-empty">No film pairings are available yet.</p>';return;}
      const current=programs.find(pair=>pair.theme===r.theme&&pair.films.every(film=>r.keys.includes(film.key)));
      const films=r.keys.map(key=>archive.films.get(key));
      const select=(index)=>`<label class="sr-double-select" for="sr-double-film-${index}"><span>Film ${index+1}</span><span class="sr-select-wrap"><select class="sr-select" id="sr-double-film-${index}" data-double-film="${index}">${allFilms.map(film=>`<option value="${esc(film.key)}"${film.key===r.keys[index]?' selected':''}${film.key===r.keys[1-index]?' disabled':''}>${esc(film.title)} · ${esc(film.year)}</option>`).join('')}</select></span></label>`;
      activity.innerHTML=`<section class="sr-game sr-double">
        <header class="sr-game-heading"><div><p class="screening-kicker">Double Feature · Programme a night</p><h2 tabindex="-1">Two films. One conversation.</h2><p>Choose a curated pairing or make a connection of your own.</p></div><label class="sr-double-theme"><span>Programme</span><span class="sr-select-wrap"><select id="sr-double-theme" class="sr-select"><option value="">Your own pairing</option>${programs.map(pair=>`<option value="${esc(pair.theme)}"${current===pair?' selected':''}>${esc(pair.theme)}</option>`).join('')}</select></span></label></header>
        <div class="sr-double-grid">${films.map((film,index)=>`<article class="sr-double-card">${select(index)}<a class="sr-double-art" href="${esc(film.href)}" aria-label="Open ${esc(film.title)}">${film.frames[0]?puzzleStill(film.frames[0],film.title):poster(film)}</a><div class="sr-double-copy"><a href="${esc(film.href)}">${esc(film.title)} <span aria-hidden="true">↗</span></a><span>${esc(film.year)}</span></div></article>`).join('')}</div>
        <div class="sr-double-reading"><div><p class="screening-kicker">${current?'The archive’s connection':'Your connection'}</p>${current?`<h3>${esc(current.theme)}</h3><p>${esc(current.note)}</p>`:'<p>Give this pairing a title, or let the two films speak for themselves.</p>'}</div><label class="sr-double-name"><span>Optional programme title</span><input id="sr-double-title" maxlength="80" value="${esc(r.title)}" placeholder="My double feature"></label></div>
        <div class="sr-game-actions"><p role="status" id="sr-pair-status"></p><div><button type="button" class="sr-secondary" data-double-swap>Swap order</button><button type="button" class="sr-primary" data-double-copy>Copy programme</button></div></div>
        <textarea class="sr-share-fallback" aria-label="Programme to copy" readonly hidden></textarea>
      </section>`;
      $('#sr-double-theme',activity).addEventListener('change',event=>{
        const pair=programs.find(item=>item.theme===event.target.value);
        if(pair){r.keys=pair.films.map(film=>film.key);r.theme=pair.theme;r.title='';}
        else r.theme='';
        persist();renderDouble();$('#sr-double-theme',activity)?.focus({preventScroll:true});
      });
      for(const field of $$('[data-double-film]',activity))field.addEventListener('change',()=>{
        const index=Number(field.dataset.doubleFilm);
        if(field.value===r.keys[1-index]||!archive.films.has(field.value))return;
        r.keys[index]=field.value;r.theme='';persist();renderDouble();$(`[data-double-film="${index}"]`,activity)?.focus({preventScroll:true});
      });
      $('#sr-double-title',activity).addEventListener('input',event=>{r.title=event.target.value.slice(0,80);persist();});
      $('[data-double-swap]',activity).addEventListener('click',()=>{r.keys.reverse();persist();renderDouble();$('[data-double-swap]',activity)?.focus({preventScroll:true});});
      $('[data-double-copy]',activity).addEventListener('click',async()=>{
        const output=[r.title.trim()||current?.theme||'My double feature',...films.map((film,index)=>`${index+1}. ${film.title} (${film.year})`),'The T.S. Archive',new URL('screening-room.html?mode=double',location.href).href].join('\n');
        try{await navigator.clipboard.writeText(output);$('#sr-pair-status',activity).textContent='Programme copied.';}
        catch{const fallback=$('.sr-share-fallback',activity);fallback.hidden=false;fallback.value=output;fallback.select();$('#sr-pair-status',activity).textContent='Select and copy your programme.';}
      });
    }
    return {renderEditor,renderConnections,renderDouble};
  }
  window.ArchiveScreeningGames={make};
})();
