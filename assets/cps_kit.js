/* ============================================================
   CPS KIT — moteur de parcours CPS (niveau CAP, mapse.fr)
   Piloté par données : CPS.init(config). Référentiel SPF 2025.
   Mécaniques : lesson · cardpick (quiz/sort/truefalse/phone) ·
                match (relier) · order (remettre en ordre) ·
                scenario (tu décides) · wrap (bilan + auto-éval).
   ============================================================ */
(function(){
"use strict";

/* ---------- utilitaires ---------- */
function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function clear(n){ while(n.firstChild) n.removeChild(n.firstChild); }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function speak(txt){
  try{
    if(!('speechSynthesis' in window) || !txt) return;
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(txt);
    u.lang='fr-FR'; u.rate=0.95;
    window.speechSynthesis.speak(u);
  }catch(e){}
}
function stopSpeech(){ try{ if('speechSynthesis' in window) window.speechSynthesis.cancel(); }catch(e){} }
function listenBtn(getText){
  var b=el('button','cps-listen','🔊 Écouter');
  function reset(){ b.innerHTML='🔊 Écouter'; b.classList.remove('on'); }
  b.onclick=function(){
    try{
      // si une lecture est en cours sur ce bouton -> on l'ARRÊTE
      if(b.classList.contains('on')){ stopSpeech(); reset(); return; }
      var txt=getText(); if(!txt) return;
      stopSpeech();
      var u=new SpeechSynthesisUtterance(txt);
      u.lang='fr-FR'; u.rate=0.95;
      u.onend=reset; u.onerror=reset;
      b.innerHTML='⏹️ Arrêter'; b.classList.add('on');
      window.speechSynthesis.speak(u);
    }catch(e){ reset(); }
  };
  return b;
}

/* ---------- préférences d'accessibilité (localStorage) ---------- */
var A11Y_KEY='cps_a11y_v1';
function loadPrefs(){ try{ return JSON.parse(localStorage.getItem(A11Y_KEY))||{}; }catch(e){ return {}; } }
var PREFS=loadPrefs();
function savePrefs(){ try{ localStorage.setItem(A11Y_KEY, JSON.stringify(PREFS)); }catch(e){} }
function applyPrefs(){
  var b=document.body;
  b.classList.remove('fs-s','fs-l','fs-xl','dys','calme');
  if(PREFS.fs) b.classList.add('fs-'+PREFS.fs);
  if(PREFS.dys) b.classList.add('dys');
  if(PREFS.calme) b.classList.add('calme');
}

/* ---------- images : agrandissement (lightbox) ---------- */
function lightbox(src,alt){
  var ov=document.getElementById('cps-lightbox');
  if(!ov){ ov=el('div','cps-lightbox'); ov.id='cps-lightbox';
    ov.appendChild(el('img')); ov.appendChild(el('div','cps-lightbox-x','✕'));
    ov.onclick=function(){ ov.classList.remove('open'); };
    document.body.appendChild(ov);
  }
  var im=ov.querySelector('img'); im.src=src; im.alt=alt||'';
  ov.classList.add('open');
}
function imgEl(src,alt){
  var i=el('img','cps-img cps-zoom'); i.src=src; i.alt=alt||''; i.setAttribute('loading','lazy');
  i.onclick=function(e){ e.stopPropagation(); lightbox(src,alt); };
  return i;
}

var TEMPS=[
  {k:'decouvre', n:'①', l:'Je découvre'},
  {k:'entraine', n:'②', l:"Je m'entraîne"},
  {k:'situation',n:'③', l:'En situation'},
  {k:'point',    n:'④', l:'Je fais le point'}
];
function tempsIndex(k){ for(var i=0;i<TEMPS.length;i++) if(TEMPS[i].k===k) return i; return 0; }

/* ---------- contrôleur ---------- */
function Ctrl(cfg){
  this.cfg=cfg;
  this.parc=cfg.parcours||[];
  for(var di=0; di<this.parc.length; di++){ if(this.parc[di].type==='cardpick'){ this.parc[di]._demo=true; break; } }
  this.idx=0; this.score=0; this.max=0;
  this.build();
  this.render();
}
Ctrl.prototype.buildA11y=function(){
  var bar=el('div','cps-a11y');
  var grp=el('div','cps-a11y-grp');
  grp.appendChild(el('span','cps-a11y-lab','Texte'));
  function markFs(){ var bs=grp.querySelectorAll('button'); for(var i=0;i<bs.length;i++) bs[i].classList.toggle('act', bs[i].getAttribute('data-fs')===(PREFS.fs||'')); }
  [['A−','s'],['A',''],['A+','l'],['A++','xl']].forEach(function(o){
    var b=el('button','cps-a11y-btn',o[0]); b.title='Taille du texte'; b.setAttribute('data-fs',o[1]);
    b.onclick=function(){ PREFS.fs=o[1]||undefined; savePrefs(); applyPrefs(); markFs(); };
    grp.appendChild(b);
  });
  bar.appendChild(grp); markFs();
  var dys=el('button','cps-a11y-btn','Aa Confort'); dys.title='Lecture plus confortable'; if(PREFS.dys) dys.classList.add('act');
  dys.onclick=function(){ PREFS.dys=!PREFS.dys; savePrefs(); applyPrefs(); dys.classList.toggle('act', !!PREFS.dys); };
  bar.appendChild(dys);
  var calme=el('button','cps-a11y-btn','🌙 Calme'); calme.title='Mode calme : animations et couleurs réduites'; if(PREFS.calme) calme.classList.add('act');
  calme.onclick=function(){ PREFS.calme=!PREFS.calme; savePrefs(); applyPrefs(); calme.classList.toggle('act', !!PREFS.calme); };
  bar.appendChild(calme);
  var pr=el('button','cps-a11y-btn','🖨️'); pr.title='Imprimer'; pr.onclick=function(){ try{ window.print(); }catch(e){} };
  bar.appendChild(pr);
  return bar;
};
Ctrl.prototype.build=function(){
  document.body.classList.remove('t-emo','t-soc','t-cog');
  document.body.classList.add('t-'+(this.cfg.theme||'cog'));
  var app=document.getElementById('cps-app')||document.body;
  clear(app);
  app.appendChild(this.buildA11y());
  applyPrefs();
  var wrap=el('div','cps');

  var back=el('a','cps-back','← Retour'); back.href=this.cfg.back||'index.html';
  wrap.appendChild(back);

  var head=el('div','cps-head');
  if(this.cfg.icon) head.appendChild(el('span','ic',this.cfg.icon));
  head.appendChild(el('h1',null,this.cfg.title||''));
  if(this.cfg.subtitle) head.appendChild(el('p',null,this.cfg.subtitle));
  if(this.cfg.code) head.appendChild(el('span','cps-pill','Compétence '+this.cfg.code+' · Santé publique France 2025'));
  wrap.appendChild(head);

  var steps=el('div','cps-steps');
  this.stepEls=[];
  for(var i=0;i<TEMPS.length;i++){
    var s=el('div','s','<span class="n">'+TEMPS[i].n+'</span>'+TEMPS[i].l);
    steps.appendChild(s); this.stepEls.push(s);
  }
  wrap.appendChild(steps);

  this.stage=el('div','cps-stage'); wrap.appendChild(this.stage);
  app.appendChild(wrap);

  var foot=el('div','cps-foot');
  foot.innerHTML='CPS — Compétence <strong>'+(this.cfg.code||'')+(this.cfg.ref?' « '+this.cfg.ref+' »':'')+'</strong><br>Référentiel des compétences psychosociales — Santé publique France, 2025 · Niveau CAP';
  app.appendChild(foot);
};
Ctrl.prototype.setStep=function(k){
  var cur=tempsIndex(k);
  for(var i=0;i<this.stepEls.length;i++){
    this.stepEls[i].classList.remove('on','ok');
    if(i<cur) this.stepEls[i].classList.add('ok');
    else if(i===cur) this.stepEls[i].classList.add('on');
  }
};
Ctrl.prototype.render=function(){
  var sc=this.parc[this.idx];
  if(!sc) return;
  stopSpeech();           // on coupe toute lecture en cours quand on change d'écran
  this.setStep(sc.temps||'entraine');
  clear(this.stage);
  window.scrollTo({top:0,behavior:'smooth'});
  var self=this;
  var ctx={
    addScore:function(p,m){ self.score+=p; self.max+=m; },
    next:function(){ self.idx++; self.render(); },
    isLast:(this.idx>=this.parc.length-1),
    score:function(){ return self.score; },
    total:function(){ return self.max; },
    restart:function(){ self.idx=0; self.score=0; self.max=0; self.render(); }
  };
  var fn=RENDER[sc.type];
  if(fn) fn(this.stage, sc, ctx);
  else this.stage.appendChild(el('div','cps-card',null));
};

/* ---------- rendus de mécaniques ---------- */
var RENDER={};

/* ① LEÇON */
RENDER.lesson=function(stage, d, ctx){
  var card=el('div','cps-card');
  if(d.title) card.appendChild(el('div','cps-title',d.title));
  if(d.audio) card.appendChild(listenBtn(function(){ return d.audio; }));
  (d.blocks||[]).forEach(function(b){
    if(b.img){
      var li=el('div','cps-lesson'); li.style.flexDirection='column';
      if(b.html) li.appendChild(el('div','tx','<div style="text-align:center;width:100%">'+b.html+'</div>'));
      li.appendChild(imgEl(b.img, b.alt||''));
      card.appendChild(li);
    }else if(b.words){
      var l=el('div','cps-lesson'); l.style.flexDirection='column';
      if(b.html) l.appendChild(el('div','tx','<div style="text-align:center;width:100%">'+b.html+'</div>'));
      var w=el('div','cps-words');
      b.words.forEach(function(x){ w.appendChild(el('span','cps-word',x)); });
      l.appendChild(w); card.appendChild(l);
    }else{
      var ln=el('div','cps-lesson');
      ln.appendChild(el('span','ic',b.ic||'•'));
      ln.appendChild(el('div','tx',b.html||''));
      card.appendChild(ln);
    }
  });
  var cta=el('button','cps-btn',d.cta||"▶️ Je m'entraîne");
  cta.onclick=function(){ ctx.next(); };
  card.appendChild(cta);
  stage.appendChild(card);
  /* lecture à la demande seulement (bouton 🔊) */
};

/* ② CARDPICK : quiz / sort / truefalse / phone */
RENDER.cardpick=function(stage, d, ctx){
  var items=d.items||[];
  var i=0, earned=0;
  var card=el('div','cps-card');
  var head=el('div','cps-pgwrap');
  var tag=el('span','cps-tag', d.tag || (TEMPS[tempsIndex(currentTemps(d))].l));
  var count=el('span','cps-count','');
  head.appendChild(tag); head.appendChild(count);
  card.appendChild(head);
  var bar=el('div','cps-bar','<i></i>'); card.appendChild(bar);
  var instr=el('div','cps-instr',''); card.appendChild(instr);
  var promptBox=el('div',null,''); card.appendChild(promptBox);
  var ctrls=el('div','cps-ctrls'); card.appendChild(ctrls);
  var listen=listenBtn(function(){ var it=items[i]; return it ? (it.audio||it.text) : ''; });
  ctrls.appendChild(listen);
  var hint=el('button','cps-hint','💡 Indice'); ctrls.appendChild(hint);
  var optBox=el('div',null,''); card.appendChild(optBox);
  var fb=el('div',null,''); card.appendChild(fb);
  stage.appendChild(card);

  function buildComic(comic){
    var box=el('div','cps-comic');
    var panels = comic.panels || comic;
    for(var pi=0; pi<panels.length; pi++){
      var panel=panels[pi];
      var p=el('div','cps-comic-panel');
      if(panel.label) p.appendChild(el('div','cps-comic-label',panel.label));
      if(panel.img){
        var scene=el('div','cps-comic-photo');
        scene.appendChild(imgEl(panel.img, panel.alt||panel.label||''));
        p.appendChild(scene);
      }else{
        var people=el('div','cps-comic-people');
        var list=panel.people || [{name:'A'},{name:'B'}];
        for(var ai=0; ai<list.length; ai++){
          var person=list[ai];
          var name = typeof person==='string' ? person : person.name;
          var label = name==='A' ? 'Élève' : (name==='B' ? 'Autre' : name);
          var cls='cps-comic-avatar';
          if(person.side) cls+=' '+person.side;
          if(person.tone) cls+=' '+person.tone;
          var avatar=el('span',cls);
          avatar.setAttribute('aria-label',label||'Personnage');
          avatar.title=label||'Personnage';
          avatar.appendChild(el('i','cps-comic-head'));
          avatar.appendChild(el('i','cps-comic-body'));
          avatar.appendChild(el('small',null,label||'?'));
          people.appendChild(avatar);
        }
        p.appendChild(people);
      }
      var bubbles=panel.bubbles || [];
      for(var bi=0; bi<bubbles.length; bi++){
        var b=bubbles[bi];
        var bcls='cps-bubble '+(b.who==='right'?'right':'left');
        if(b.kind) bcls+=' '+b.kind;
        p.appendChild(el('div',bcls,b.text||''));
      }
      if(panel.note) p.appendChild(el('div','cps-comic-note',panel.note));
      box.appendChild(p);
    }
    return box;
  }

  function buildPrompt(it){
    clear(promptBox);
    if(d.variant==='phone'){
      var ph=el('div','cps-phone'); ph.appendChild(el('div','bar',''));
      var body=el('div','body');
      if(it.em) body.appendChild(el('span','em',it.em));
      body.appendChild(el('div','tx',it.text||''));
      body.appendChild(el('div','from', it.from||'reçu à l’instant'));
      ph.appendChild(body); promptBox.appendChild(ph);
    }else{
      var p=el('div','cps-prompt');
      if(it.img) p.appendChild(imgEl(it.img, it.alt||it.text||''));
      if(it.comic) p.appendChild(buildComic(it.comic));
      if(it.em) p.appendChild(el('span','em',it.em));
      if(it.text) p.appendChild(el('div','tx',it.text));
      promptBox.appendChild(p);
    }
  }
  function buildOptions(it, o){
    var sort=(d.variant==='sort');
    var shouldShuffle = !sort && d.shuffleOptions !== false && o.shuffle !== false;
    var shown = it.opts.map(function(opt,oi){ return {opt:opt, idx:oi}; });
    if(shouldShuffle) shown = shuffle(shown);
    buildOptions.current = shown;
    var grid=el('div', sort?'cps-bins':'cps-opts');
    if(it.opts.length===2) grid.classList.add('two');
    shown.forEach(function(entry){
      var opt=entry.opt;
      var b=el('button', sort?'cps-bin':'cps-opt', opt.l);
      if(o.disabled) b.disabled=true;
      if(o.reveal){ if(opt.ok) b.classList.add('ok'); else b.classList.add('dim'); }
      if(o.onPick) b.onclick=function(){ o.onPick(entry,b); };
      grid.appendChild(b);
    });
    clear(optBox); optBox.appendChild(grid);
  }

  function drawDemo(){
    var demo = d.demo || items[0];
    count.textContent='Exemple'; instr.textContent=demo.instr || d.instr || '';
    bar.firstChild.style.width='0%'; clear(fb); hint.style.display='none';
    buildPrompt(demo);
    promptBox.insertBefore(el('div','cps-demo','👀 <strong>Exemple</strong> — on te montre comment faire.'), promptBox.firstChild);
    buildOptions(demo, {disabled:true, reveal:true});
    fb.appendChild(el('div','cps-fb good', '✓ '+(demo.ex||'')));
    var nb=el('button','cps-next','👉 À toi de jouer !');
    nb.onclick=function(){ hint.style.display=''; draw(); };
    fb.appendChild(nb);
  }

  function draw(){
    var it=items[i];
    count.textContent=(i+1)+' / '+items.length;
    bar.firstChild.style.width=Math.round(i/items.length*100)+'%';
    instr.textContent=it.instr || d.instr || '';
    clear(fb); hint.disabled=false; hint.style.display='';
    buildPrompt(it);
    buildOptions(it, {onPick:pick});
  }

  hint.onclick=function(){
    var btns=optBox.querySelectorAll('button');
    var shown=buildOptions.current||[];
    if(shown.length>=3){
      for(var k=0;k<shown.length;k++){ if(!shown[k].opt.ok && btns[k] && !btns[k].disabled){ btns[k].classList.add('dim'); btns[k].disabled=true; break; } }
    }
    clear(fb); fb.appendChild(el('div','cps-fb tip','💡 Relis bien la situation (tu peux l’écouter avec 🔊), puis choisis.'));
    hint.disabled=true;
  };

  function pick(entry,btn){
    var it=items[i];
    var shown=buildOptions.current||[];
    var good=!!entry.opt.ok;
    if(good) earned++;
    var btns=optBox.querySelectorAll('button');
    for(var k=0;k<btns.length;k++){ btns[k].disabled=true; if(shown[k] && shown[k].opt.ok) btns[k].classList.add('ok'); else btns[k].classList.add('dim'); }
    if(!good){ btn.classList.remove('dim'); btn.classList.add('no'); }
    hint.disabled=true;
    clear(fb);
    fb.appendChild(el('div','cps-fb '+(good?'good':'bad'), (good?'✓ ':'💡 ')+(it.ex||'')));
    var last=(i>=items.length-1);
    var nb=el('button','cps-next','Continuer →');
    nb.onclick=function(){ if(last){ ctx.addScore(earned, items.length); bar.firstChild.style.width='100%'; ctx.next(); } else { i++; draw(); } };
    fb.appendChild(nb);
  }

  if(d._demo) drawDemo(); else draw();
};
function currentTemps(d){ return d.temps||'entraine'; }

/* RELIER (match) */
RENDER.match=function(stage, d, ctx){
  var pairs=d.pairs||[];
  var card=el('div','cps-card');
  if(d.title) card.appendChild(el('div','cps-title',d.title));
  card.appendChild(el('div','cps-instr', d.instr || 'Relie chaque élément de gauche à celui de droite.'));
  if(d.audio) card.appendChild(listenBtn(function(){ return d.audio; }));
  var grid=el('div','cps-match');
  var colL=el('div','cps-col'), colR=el('div','cps-col');
  grid.appendChild(colL); grid.appendChild(colR);
  card.appendChild(grid);
  var fb=el('div',null,''); card.appendChild(fb);
  stage.appendChild(card);

  var rights=shuffle(pairs.map(function(p,idx){ return {idx:idx, r:p.r}; }));
  var selL=null, doneCount=0;
  pairs.forEach(function(p,idx){
    var c=el('div','cps-cell'); c.dataset.k=idx;
    if(p.img){ c.classList.add('has-img'); var im=el('img','cps-cell-img'); im.src=p.img; im.alt=p.alt||''; im.setAttribute('loading','lazy'); c.appendChild(im); }
    else c.innerHTML=p.l;
    c.onclick=function(){ if(c.classList.contains('done')) return; selectL(c,idx); };
    colL.appendChild(c);
  });
  rights.forEach(function(o){
    var c=el('div','cps-cell',o.r); c.dataset.k=o.idx;
    c.onclick=function(){ if(c.classList.contains('done')) return; chooseR(c,o.idx); };
    colR.appendChild(c);
  });
  function selectL(c,idx){
    var all=colL.querySelectorAll('.cps-cell');
    for(var i=0;i<all.length;i++) all[i].classList.remove('sel');
    c.classList.add('sel'); selL={el:c,idx:idx};
  }
  function chooseR(c,idx){
    if(!selL){ c.classList.add('miss'); setTimeout(function(){ c.classList.remove('miss'); },350); return; }
    if(selL.idx===idx){
      selL.el.classList.remove('sel'); selL.el.classList.add('done'); c.classList.add('done');
      selL=null; doneCount++;
      if(pairs[idx].ex){ flash('✓ '+pairs[idx].ex,'good'); }
      if(doneCount>=pairs.length){ finish(); }
    }else{
      c.classList.add('miss'); setTimeout(function(){ c.classList.remove('miss'); },350);
      flash('💡 Pas tout à fait, essaie une autre paire.','bad');
    }
  }
  function flash(t,cl){ clear(fb); var b=el('div','cps-fb '+cl,t); fb.appendChild(b); }
  function finish(){
    clear(fb);
    fb.appendChild(el('div','cps-fb good','✓ Bravo, tout est relié !'));
    var nb=el('button','cps-next','Continuer →');
    nb.onclick=function(){ ctx.addScore(pairs.length, pairs.length); ctx.next(); };
    fb.appendChild(nb);
  }
  /* lecture à la demande seulement (bouton 🔊) */
};

/* REMETTRE DANS L'ORDRE (order) */
RENDER.order=function(stage, d, ctx){
  var steps=d.steps||[];
  var stepImages=d.stepImages||d.images||[];
  var stepAlts=d.stepAlts||[];
  var card=el('div','cps-card');
  if(d.title) card.appendChild(el('div','cps-title',d.title));
  card.appendChild(el('div','cps-instr', d.instr || 'Remets les étapes dans le bon ordre.'));
  if(d.audio) card.appendChild(listenBtn(function(){ return d.audio; }));
  var slots=el('div','cps-slots');
  steps.forEach(function(s,idx){
    var sl=el('div','cps-slot','<span class="rk">'+(idx+1)+'</span><span class="lab"></span>');
    slots.appendChild(sl);
  });
  card.appendChild(slots);
  var pool=el('div','cps-pool');
  if(stepImages.length) pool.classList.add('image-pool');
  card.appendChild(pool);
  var fb=el('div',null,''); card.appendChild(fb);
  stage.appendChild(card);

  var expect=0; var pts=0; var slotErr=false;
  shuffle(steps.map(function(s,idx){ return {idx:idx,s:s}; })).forEach(function(o){
    var chip=el('button','cps-chip'+(stepImages[o.idx]?' has-img':''));
    if(stepImages[o.idx]){
      var im=el('img','cps-chip-img');
      im.src=stepImages[o.idx]; im.alt=stepAlts[o.idx]||''; im.setAttribute('loading','lazy');
      chip.appendChild(im);
    }
    chip.appendChild(el('span','cps-chip-label',o.s));
    chip.onclick=function(){ tap(o.idx, chip); };
    pool.appendChild(chip);
  });
  function tap(orderIdx, chip){
    if(chip.classList.contains('used')) return;
    if(orderIdx===expect){
      chip.classList.add('used');
      var sl=slots.children[expect];
      sl.classList.add('full'); sl.querySelector('.lab').textContent=' '+steps[expect];
      if(stepImages[expect] && !sl.querySelector('img')){
        var slotImg=el('img','cps-slot-img');
        slotImg.src=stepImages[expect]; slotImg.alt=stepAlts[expect]||''; slotImg.setAttribute('loading','lazy');
        sl.insertBefore(slotImg, sl.querySelector('.lab'));
      }
      if(!slotErr) pts++;
      slotErr=false; expect++;
      clear(fb);
      if(expect>=steps.length){
        fb.appendChild(el('div','cps-fb good','✓ Parfait, tout est dans l’ordre !'));
        var nb=el('button','cps-next','Continuer →');
        nb.onclick=function(){ ctx.addScore(pts, steps.length); ctx.next(); };
        fb.appendChild(nb);
      }
    }else{
      slotErr=true;
      chip.classList.add('cps-miss'); chip.style.animation='cpsshake .3s';
      setTimeout(function(){ chip.style.animation=''; },350);
      clear(fb); fb.appendChild(el('div','cps-fb bad','💡 Ce n’est pas la prochaine étape. Quelle est la suite logique ?'));
    }
  }
  /* lecture à la demande seulement (bouton 🔊) */
};

/* CHOISIR UNE IMAGE PARMI DES CARTES MÉLANGÉES */
RENDER.imagepick=function(stage, d, ctx){
  var items=d.items||[];
  var i=0, earned=0;
  var card=el('div','cps-card');
  var head=el('div','cps-pgwrap');
  head.appendChild(el('span','cps-tag', d.tag||'Images mélangées'));
  var count=el('span','cps-count',''); head.appendChild(count);
  card.appendChild(head);
  var bar=el('div','cps-bar','<i></i>'); card.appendChild(bar);
  var instr=el('div','cps-instr',d.instr||'Choisis la bonne image.'); card.appendChild(instr);
  var prompt=el('div','cps-prompt'); card.appendChild(prompt);
  var ctrls=el('div','cps-ctrls'); card.appendChild(ctrls);
  var listen=listenBtn(function(){ var it=items[i]; return it ? (it.audio||it.text||d.instr||'') : ''; });
  ctrls.appendChild(listen);
  var grid=el('div','cps-image-options'); card.appendChild(grid);
  var fb=el('div',null,''); card.appendChild(fb);
  stage.appendChild(card);

  function draw(){
    var it=items[i];
    count.textContent=(i+1)+' / '+items.length;
    bar.firstChild.style.width=Math.round(i/items.length*100)+'%';
    prompt.innerHTML='';
    if(it.text) prompt.appendChild(el('div','tx',it.text));
    clear(grid); clear(fb);
    shuffle(it.options||[]).forEach(function(opt){
      var b=el('button','cps-image-opt');
      if(!opt.l) b.classList.add('no-label');
      if(opt.img){
        var im=el('img','cps-image-opt-img');
        im.src=opt.img; im.alt=opt.alt||opt.l||''; im.setAttribute('loading','lazy');
        b.appendChild(im);
      }
      if(opt.l) b.appendChild(el('span','cps-image-opt-label',opt.l));
      b.onclick=function(){ pick(opt,b); };
      grid.appendChild(b);
    });
  }
  function pick(opt,btn){
    var good=!!opt.ok;
    if(good) earned++;
    var btns=grid.querySelectorAll('button');
    for(var k=0;k<btns.length;k++) btns[k].disabled=true;
    for(var j=0;j<(items[i].options||[]).length;j++){
      if(items[i].options[j].ok){
        var imgs=grid.querySelectorAll('img');
        for(var n=0;n<imgs.length;n++){
          if(imgs[n].getAttribute('src')===items[i].options[j].img) imgs[n].parentNode.classList.add('ok');
        }
      }
    }
    btn.classList.add(good?'ok':'no');
    clear(fb);
    var msg = good ? (opt.ex||items[i].ex||'') : (opt.bad||items[i].bad||'Pas celle-ci. Regarde la carte entourée en vert, puis continue.');
    fb.appendChild(el('div','cps-fb '+(good?'good':'bad'), (good?'✓ ':'💡 ')+msg));
    var last=(i>=items.length-1);
    var nb=el('button','cps-next','Continuer →');
    nb.onclick=function(){ if(last){ ctx.addScore(earned, items.length); bar.firstChild.style.width='100%'; ctx.next(); } else { i++; draw(); } };
    fb.appendChild(nb);
  }
  draw();
};

/* CLIQUER UNE ZONE DU CORPS (bodymap) : silhouette + zones cliquables */
RENDER.bodymap=function(stage, d, ctx){
  var items=d.items||[], zones=d.zones||[];
  var i=0, earned=0;
  var card=el('div','cps-card');
  if(d.title) card.appendChild(el('div','cps-title',d.title));
  card.appendChild(el('div','cps-instr', d.instr||'Clique sur la bonne partie du corps.'));
  var ask=el('div','cps-bodymap-ask'); card.appendChild(ask);
  var ctrls=el('div','cps-ctrls'); ctrls.appendChild(listenBtn(function(){ return items[i]?items[i].ask:''; })); card.appendChild(ctrls);
  var wrap=el('div','cps-bodymap');
  var im=el('img','cps-bodymap-img'); im.src=d.image; im.alt=d.alt||'silhouette du corps'; im.setAttribute('loading','lazy'); wrap.appendChild(im);
  var hot=el('div','cps-bodymap-zones'); wrap.appendChild(hot);
  card.appendChild(wrap);
  var fb=el('div',null,''); card.appendChild(fb);
  stage.appendChild(card);
  function draw(){
    var it=items[i];
    ask.textContent=it.ask||'';
    clear(hot); clear(fb);
    zones.forEach(function(z){
      var b=el('button','cps-zone'); b.style.left=z.x+'%'; b.style.top=z.y+'%';
      b.setAttribute('aria-label', z.ans||'zone');
      b.onclick=function(){ pick(z,b,it); };
      hot.appendChild(b);
    });
  }
  function pick(z,b,it){
    var good=(z.ans===it.ok);
    if(good) earned++;
    var bs=hot.querySelectorAll('.cps-zone');
    for(var k=0;k<bs.length;k++){ bs[k].disabled=true; if(zones[k] && zones[k].ans===it.ok) bs[k].classList.add('ok'); }
    if(!good) b.classList.add('no');
    clear(fb);
    fb.appendChild(el('div','cps-fb '+(good?'good':'bad'), (good?'✓ ':'💡 ')+(it.ex||'')));
    var last=(i>=items.length-1);
    var nb=el('button','cps-next','Continuer →');
    nb.onclick=function(){ if(last){ ctx.addScore(earned, items.length); ctx.next(); } else { i++; draw(); } };
    fb.appendChild(nb);
  }
  draw();
};

/* MUR DES VISAGES (grid) : taper tous les visages d'une émotion */
RENDER.grid=function(stage, d, ctx){
  var faces=d.faces||[], need=0, got=0;
  for(var n=0;n<faces.length;n++) if(faces[n].ok) need++;
  var card=el('div','cps-card');
  if(d.title) card.appendChild(el('div','cps-title',d.title));
  card.appendChild(el('div','cps-instr', d.instr||''));
  if(d.audio) card.appendChild(listenBtn(function(){ return d.audio; }));
  var grid=el('div','cps-grid'), fb=el('div',null,'');
  faces.forEach(function(f){
    var tile=el('button','cps-gtile');
    var im=el('img','cps-gimg'); im.src=f.img; im.alt=f.alt||''; im.setAttribute('loading','lazy'); tile.appendChild(im);
    var z=el('span','cps-gzoom','🔍'); z.onclick=function(e){ e.stopPropagation(); lightbox(f.img,f.alt||''); }; tile.appendChild(z);
    tile.onclick=function(){
      if(tile.classList.contains('on')) return;
      if(f.ok){
        tile.classList.add('on'); got++; clear(fb);
        if(got>=need){
          fb.appendChild(el('div','cps-fb good','✓ '+(d.success||'Bravo ! Tu as trouvé tous les visages.')));
          var nb=el('button','cps-next','Continuer →'); nb.onclick=function(){ ctx.addScore(need,need); ctx.next(); }; fb.appendChild(nb);
        }
      } else {
        tile.classList.add('off'); setTimeout(function(){ tile.classList.remove('off'); },500);
        clear(fb); fb.appendChild(el('div','cps-fb bad','💡 '+(d.miss||'Non, ce visage ne montre pas cette émotion.')));
      }
    };
    grid.appendChild(tile);
  });
  card.appendChild(grid); card.appendChild(fb);
  stage.appendChild(card);
};

/* SCÉNARIO (tu décides) */
RENDER.scenario=function(stage, d, ctx){
  var scenes=d.scenes||[];
  var i=0, good=0, shownChoices=[];
  var card=el('div','cps-card');
  var head=el('div','cps-pgwrap');
  head.appendChild(el('span','cps-tag', d.tag||'En situation'));
  var count=el('span','cps-count',''); head.appendChild(count);
  card.appendChild(head);
  var bar=el('div','cps-bar','<i></i>'); card.appendChild(bar);
  var body=el('div',null,''); card.appendChild(body);
  stage.appendChild(card);

  function scene(){
    var s=scenes[i];
    count.textContent=(i+1)+' / '+scenes.length;
    bar.firstChild.style.width=Math.round(i/scenes.length*100)+'%';
    clear(body);
    var sc=el('div','cps-scene');
    if(s.img) sc.appendChild(imgEl(s.img, s.alt||s.text||''));
    if(s.em) sc.appendChild(el('span','em',s.em));
    sc.appendChild(el('div','tx',s.text||''));
    body.appendChild(sc);
    body.appendChild(listenBtn(function(){ return s.audio||s.text; }));
    var opts=el('div','cps-opts');
    shownChoices=s.choices.map(function(c,ci){ return {choice:c, idx:ci}; });
    if(d.shuffleChoices !== false) shownChoices=shuffle(shownChoices);
    shownChoices.forEach(function(entry,ci){
      var c=entry.choice;
      var b=el('button','cps-opt',c.l);
      b.onclick=function(){ choose(ci,b); };
      opts.appendChild(b);
    });
    body.appendChild(opts);
    /* lecture à la demande seulement (bouton 🔊) */
  }
  function choose(ci,btn){
    var c=shownChoices[ci].choice;
    if(c.good) good++;
    var btns=body.querySelectorAll('.cps-opt');
    for(var k=0;k<btns.length;k++){ btns[k].disabled=true; if(!shownChoices[k].choice.good) btns[k].classList.add('dim'); }
    btn.classList.remove('dim'); btn.classList.add(c.good?'ok':'no');
    var conseq=el('div','cps-conseq');
    conseq.appendChild(el('span','face', c.good?'😀':'😕'));
    conseq.appendChild(el('div','cps-fb '+(c.good?'good':'bad'), c.fb||''));
    body.appendChild(conseq);
    var last=(i>=scenes.length-1);
    var nb=el('button','cps-next','Continuer →');
    nb.onclick=function(){ if(last){ ctx.addScore(good, scenes.length); bar.firstChild.style.width='100%'; ctx.next(); } else { i++; scene(); } };
    body.appendChild(nb);
  }
  scene();
};

/* ④ BILAN + AUTO-ÉVAL */
RENDER.wrap=function(stage, d, ctx){
  var total=ctx.total(), score=ctx.score();
  var r= total>0 ? score/total : 1;
  var stars= r>=0.85?'⭐⭐⭐⭐⭐' : r>=0.65?'⭐⭐⭐⭐' : r>=0.4?'⭐⭐⭐':'⭐⭐';
  var msg= r>=0.85?'Excellent ! Tu maîtrises bien.' : r>=0.65?'Bien joué, tu progresses vraiment !' : r>=0.4?'C’est un bon début, continue !':'Recommence : chaque essai te fait progresser.';

  var c1=el('div','cps-card');
  var sw=el('div','cps-score');
  sw.appendChild(el('div','cps-stars',stars));
  sw.appendChild(el('div',null,'<span class="cps-num">'+score+'</span><span class="cps-tot"> / '+total+'</span>'));
  sw.appendChild(el('div','cps-msg',msg));
  c1.appendChild(sw); stage.appendChild(c1);

  var c2=el('div','cps-card');
  c2.appendChild(el('div','cps-title','📌 Ce que je sais maintenant'));
  (d.keep||[]).forEach(function(k){
    var kk=el('div','cps-keep'); kk.appendChild(el('span','ic',k.ic||'•')); kk.appendChild(el('span',null,k.html||'')); c2.appendChild(kk);
  });
  if(d.self && d.self.length){
    var sf=el('div','cps-self');
    sf.appendChild(el('p',null,'👉 Je m’auto-évalue (sans note) :'));
    d.self.forEach(function(q){
      var row=el('div','row','<span>'+q+'</span>');
      var yn=el('div','yn');
      ['👍','🤔'].forEach(function(sym){ var b=el('button',null,sym); b.onclick=function(){ var bs=yn.querySelectorAll('button'); for(var i=0;i<bs.length;i++) bs[i].classList.remove('sel'); b.classList.add('sel'); }; yn.appendChild(b); });
      row.appendChild(yn); sf.appendChild(row);
    });
    c2.appendChild(sf);
  }
  var again=el('button','cps-btn','🔄 Recommencer'); again.style.marginTop='14px';
  again.onclick=function(){ ctx.restart(); };
  c2.appendChild(again);
  stage.appendChild(c2);
};

/* ---------- ESCAPE GAME (habillage narratif des mécaniques, sans chrono) ---------- */
function EscapeCtrl(cfg){
  this.cfg=cfg;
  this.salles=cfg.salles||[];
  this.found=[];
  this.build();
  this.showCover();
}
EscapeCtrl.prototype.build=function(){
  document.body.classList.remove('t-emo','t-soc','t-cog');
  document.body.classList.add('t-'+(this.cfg.theme||'cog'));
  var app=document.getElementById('cps-app')||document.body;
  clear(app);
  app.appendChild(Ctrl.prototype.buildA11y());
  applyPrefs();
  var wrap=el('div','cps');
  var back=el('a','cps-back','← Retour'); back.href=this.cfg.back||'index.html'; wrap.appendChild(back);
  var head=el('div','cps-head');
  if(this.cfg.icon) head.appendChild(el('span','ic',this.cfg.icon));
  head.appendChild(el('h1',null,this.cfg.title||''));
  if(this.cfg.subtitle) head.appendChild(el('p',null,this.cfg.subtitle));
  wrap.appendChild(head);
  this.mapEl=el('div','cps-locks');
  for(var i=0;i<this.salles.length;i++) this.mapEl.appendChild(el('div','cps-lock','🔒'));
  wrap.appendChild(this.mapEl);
  this.stage=el('div','cps-stage'); wrap.appendChild(this.stage);
  app.appendChild(wrap);
  var foot=el('div','cps-foot'); foot.innerHTML='Escape game — Compétences psychosociales · Santé publique France 2025 · Niveau CAP'; app.appendChild(foot);
};
EscapeCtrl.prototype.updateMap=function(){
  var locks=this.mapEl.children;
  for(var i=0;i<this.salles.length;i++){
    if(i<this.found.length){ locks[i].textContent=this.found[i]; locks[i].className='cps-lock open'; }
    else { locks[i].textContent='🔒'; locks[i].className='cps-lock'; }
  }
};
EscapeCtrl.prototype.showCover=function(){
  stopSpeech(); clear(this.stage); this.updateMap();
  var self=this, c=el('div','cps-card');
  c.appendChild(el('div','cps-title','🎯 Ta mission'));
  if(this.cfg.intro){
    c.appendChild(listenBtn((function(t){return function(){return t;};})(this.cfg.audio||this.cfg.intro)));
    c.appendChild(el('div','cps-instr',this.cfg.intro));
  }
  var b=el('button','cps-btn','▶️ Commencer la mission');
  b.onclick=function(){ self.startSalle(0); };
  c.appendChild(b); this.stage.appendChild(c);
};
EscapeCtrl.prototype.startSalle=function(i){
  stopSpeech(); clear(this.stage);
  var self=this, s=this.salles[i], c=el('div','cps-card');
  c.appendChild(el('div','cps-title','🔐 '+(s.titre||('Épreuve '+(i+1)))));
  if(s.intro){ c.appendChild(listenBtn((function(t){return function(){return t;};})(s.audio||s.intro))); c.appendChild(el('div','cps-instr',s.intro)); }
  var b=el('button','cps-btn','▶️ Commencer l’épreuve');
  b.onclick=function(){ self.runSalle(i); };
  c.appendChild(b); this.stage.appendChild(c);
};
EscapeCtrl.prototype.runSalle=function(i){
  stopSpeech(); clear(this.stage);
  var self=this, mod=this.salles[i].module||{};
  mod.tag=mod.tag||('🔐 '+(this.salles[i].titre||('Épreuve '+(i+1))));
  var ctx={ addScore:function(){}, next:function(){ self.reveal(i); }, total:function(){return 0;}, score:function(){return 0;}, restart:function(){} };
  var fn=RENDER[mod.type];
  if(fn) fn(this.stage, mod, ctx); else this.reveal(i);
};
EscapeCtrl.prototype.reveal=function(i){
  stopSpeech(); clear(this.stage);
  var self=this, s=this.salles[i];
  this.found.push(String(s.digit)); this.updateMap();
  var c=el('div','cps-card');
  c.appendChild(el('div','cps-title','🔓 Cadenas ouvert !'));
  c.appendChild(el('div','cps-reveal','Tu as trouvé le chiffre <strong>'+s.digit+'</strong>'));
  var last=(i>=this.salles.length-1);
  var b=el('button','cps-btn', last?'🧰 Aller au coffre →':'Épreuve suivante →');
  b.onclick=function(){ if(last) self.showFinal(); else self.startSalle(i+1); };
  c.appendChild(b); this.stage.appendChild(c);
};
EscapeCtrl.prototype.showFinal=function(){
  stopSpeech(); clear(this.stage); this.updateMap();
  var self=this, code=this.salles.map(function(s){return String(s.digit);}).join(''), entry=[];
  var c=el('div','cps-card');
  c.appendChild(el('div','cps-title','🧰 Le coffre'));
  c.appendChild(el('div','cps-instr','Entre le code que tu as trouvé. Les chiffres sont en haut.'));
  var slots=el('div','cps-codeslots');
  for(var k=0;k<code.length;k++) slots.appendChild(el('div','cps-codeslot',''));
  c.appendChild(slots);
  var fb=el('div',null,'');
  var pad=el('div','cps-pad');
  function refresh(){ for(var k=0;k<code.length;k++) slots.children[k].textContent=entry[k]||''; }
  function check(){ if(entry.join('')===code){ self.showVictory(); } else { fb.innerHTML='<div class="cps-fb tip">💡 Ce n’est pas le bon code. Regarde bien les chiffres en haut, puis réessaie.</div>'; entry.length=0; refresh(); } }
  for(var n=0;n<=9;n++){ (function(n){ var b=el('button','cps-padkey',String(n)); b.onclick=function(){ if(entry.length<code.length){ entry.push(String(n)); refresh(); fb.innerHTML=''; if(entry.length===code.length) check(); } }; pad.appendChild(b); })(n); }
  var del=el('button','cps-padkey cps-paddel','⌫'); del.onclick=function(){ entry.pop(); refresh(); fb.innerHTML=''; }; pad.appendChild(del);
  c.appendChild(pad); c.appendChild(fb); this.stage.appendChild(c);
};
EscapeCtrl.prototype.showVictory=function(){
  stopSpeech(); clear(this.stage);
  var self=this;
  var c1=el('div','cps-card'); c1.appendChild(el('div','cps-win','🎉')); c1.appendChild(el('div','cps-msg','Bravo ! Tu as ouvert le coffre.')); this.stage.appendChild(c1);
  if(this.cfg.keep && this.cfg.keep.length){
    var c2=el('div','cps-card'); c2.appendChild(el('div','cps-title','📌 Ce que tu as appris'));
    this.cfg.keep.forEach(function(k){ var kk=el('div','cps-keep'); kk.appendChild(el('span','ic',k.ic||'•')); kk.appendChild(el('span',null,k.html||'')); c2.appendChild(kk); });
    this.stage.appendChild(c2);
  }
  var c3=el('div','cps-card'); var again=el('button','cps-btn','🔄 Rejouer'); again.onclick=function(){ self.found=[]; self.showCover(); }; c3.appendChild(again); this.stage.appendChild(c3);
};

/* ---------- FLASHCARDS (révision active + auto-test + collection) ---------- */
function FlashCtrl(cfg){
  this.cfg=cfg;
  this.emos=cfg.emotions||[];
  this.byKey={}; for(var i=0;i<this.emos.length;i++) this.byKey[this.emos[i].key]=this.emos[i];
  this.build();
  this.showCover();
}
FlashCtrl.prototype.build=function(){
  document.body.classList.remove('t-emo','t-soc','t-cog');
  document.body.classList.add('t-'+(this.cfg.theme||'emo'));
  var app=document.getElementById('cps-app')||document.body; clear(app);
  app.appendChild(Ctrl.prototype.buildA11y()); applyPrefs();
  var wrap=el('div','cps');
  var back=el('a','cps-back','← Retour'); back.href=this.cfg.back||'index.html'; wrap.appendChild(back);
  var head=el('div','cps-head');
  if(this.cfg.icon) head.appendChild(el('span','ic',this.cfg.icon));
  head.appendChild(el('h1',null,this.cfg.title||''));
  if(this.cfg.subtitle) head.appendChild(el('p',null,this.cfg.subtitle));
  wrap.appendChild(head);
  this.badgeRow=el('div','cps-badges'); this.badges={};
  for(var j=0;j<this.emos.length;j++){ var e=this.emos[j]; var b=el('div','cps-badge', e.emoji+'<span>'+e.label+'</span>'); this.badgeRow.appendChild(b); this.badges[e.key]=b; }
  wrap.appendChild(this.badgeRow);
  this.stage=el('div','cps-stage'); wrap.appendChild(this.stage);
  app.appendChild(wrap);
  var foot=el('div','cps-foot'); foot.innerHTML='Flashcards émotions — Compétences psychosociales · Santé publique France 2025 · Niveau CAP'; app.appendChild(foot);
};
FlashCtrl.prototype.resetBadges=function(){ for(var k in this.badges) this.badges[k].classList.remove('on'); };
FlashCtrl.prototype.showCover=function(){
  stopSpeech(); clear(this.stage); this.resetBadges();
  var self=this, c=el('div','cps-card');
  c.appendChild(el('div','cps-title','🃏 Comment jouer'));
  var howto='Lis la situation. Devine l’émotion dans ta tête. Retourne la carte pour vérifier. Puis dis si tu savais. But : débloquer les '+this.emos.length+' émotions !';
  c.appendChild(listenBtn(function(){ return howto; }));
  c.appendChild(el('div','cps-instr',howto));
  var b=el('button','cps-btn','▶️ Commencer'); b.onclick=function(){ self.start(); }; c.appendChild(b);
  this.stage.appendChild(c);
};
FlashCtrl.prototype.start=function(){ this.remaining=shuffle(this.cfg.cards.slice()); this.total=this.cfg.cards.length; this.known=0; this.showCard(); };
FlashCtrl.prototype.flipTo=function(box,fn){ box.classList.add('cps-flip-anim'); setTimeout(function(){ fn(); },170); setTimeout(function(){ box.classList.remove('cps-flip-anim'); },340); };
FlashCtrl.prototype.showCard=function(){
  stopSpeech();
  if(!this.remaining.length){ this.showEnd(); return; }
  clear(this.stage);
  var self=this, card=this.remaining[0];
  var top=el('div','cps-pgwrap'); top.appendChild(el('span','cps-tag','🃏 Carte')); top.appendChild(el('span','cps-count', this.known+' / '+this.total+' maîtrisées'));
  this.stage.appendChild(top);
  var box=el('div','cps-flash'); this.stage.appendChild(box);
  function front(){
    clear(box);
    if(card.img) box.appendChild(imgEl(card.img, card.alt||card.situation||''));
    else if(card.emoji) box.appendChild(el('div','cps-flash-em',card.emoji));
    box.appendChild(el('div','cps-flash-sit',card.situation||''));
    box.appendChild(el('div','cps-flash-q','Quelle émotion ?'));
  }
  front();
  var ctrls=el('div','cps-ctrls');
  ctrls.appendChild(listenBtn(function(){ return card.audio || card.situation; }));
  this.stage.appendChild(ctrls);
  var flipBtn=el('button','cps-btn','🔄 Retourner la carte');
  flipBtn.onclick=function(){ self.flipTo(box, function(){ self.showBack(box,card); }); flipBtn.style.display='none'; ctrls.style.display='none'; };
  this.stage.appendChild(flipBtn);
};
FlashCtrl.prototype.showBack=function(box,card){
  var self=this, e=this.byKey[card.emotion]||{label:card.emotion,emoji:'',color:'#64748b'};
  clear(box); box.classList.add('back');
  var band=el('div','cps-flash-band', e.emoji+' '+e.label); band.style.background=e.color; box.appendChild(band);
  if(card.message) box.appendChild(el('div','cps-flash-line','💬 <strong>Message :</strong> '+card.message));
  if(card.corps) box.appendChild(el('div','cps-flash-line','👋 <strong>Dans le corps :</strong> '+card.corps));
  var row=el('div','cps-flash-rate');
  var ok=el('button','cps-rate ok','👍 Je savais');
  ok.onclick=function(){ self.badges[card.emotion]&&self.badges[card.emotion].classList.add('on'); self.remaining.shift(); self.known++; self.showCard(); };
  var rev=el('button','cps-rate rev','🔄 À revoir');
  rev.onclick=function(){ self.remaining.push(self.remaining.shift()); self.showCard(); };
  row.appendChild(ok); row.appendChild(rev);
  this.stage.appendChild(row);
};
FlashCtrl.prototype.showEnd=function(){
  stopSpeech(); clear(this.stage);
  var self=this;
  var c1=el('div','cps-card'); c1.appendChild(el('div','cps-win','🎉')); c1.appendChild(el('div','cps-msg','Bravo ! Tu as révisé toutes les émotions.')); this.stage.appendChild(c1);
  for(var k in this.badges) this.badges[k].classList.add('on');
  var c2=el('div','cps-card'); var again=el('button','cps-btn','🔄 Recommencer'); again.onclick=function(){ self.showCover(); }; c2.appendChild(again); this.stage.appendChild(c2);
};

/* ---------- API ---------- */
window.CPS={
  init:function(cfg){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',function(){ new Ctrl(cfg); }); } else { new Ctrl(cfg); } },
  escape:function(cfg){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',function(){ new EscapeCtrl(cfg); }); } else { new EscapeCtrl(cfg); } },
  flash:function(cfg){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',function(){ new FlashCtrl(cfg); }); } else { new FlashCtrl(cfg); } },
  speak:speak
};
})();
