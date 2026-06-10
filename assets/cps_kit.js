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
function listenBtn(getText){
  var b=el('button','cps-listen','🔊 Écouter');
  b.onclick=function(){ speak(getText()); };
  return b;
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
  this.idx=0; this.score=0; this.max=0;
  this.build();
  this.render();
}
Ctrl.prototype.build=function(){
  document.body.className='t-'+(this.cfg.theme||'cog');
  var app=document.getElementById('cps-app')||document.body;
  clear(app);
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
    if(b.words){
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
  var listen=listenBtn(function(){ var it=items[i]; return it ? (it.audio||it.text) : ''; });
  card.appendChild(listen);
  var optBox=el('div',null,''); card.appendChild(optBox);
  var fb=el('div',null,''); card.appendChild(fb);
  stage.appendChild(card);

  function currentTempsLocal(){ return d.temps||'entraine'; }

  function draw(){
    var it=items[i];
    count.textContent=(i+1)+' / '+items.length;
    bar.firstChild.style.width=Math.round(i/items.length*100)+'%';
    instr.textContent=it.instr || d.instr || '';
    clear(promptBox); clear(optBox); clear(fb);

    if(d.variant==='phone'){
      var ph=el('div','cps-phone');
      ph.appendChild(el('div','bar',''));
      var body=el('div','body');
      if(it.em) body.appendChild(el('span','em',it.em));
      body.appendChild(el('div','tx',it.text||''));
      body.appendChild(el('div','from', it.from||'reçu à l’instant'));
      ph.appendChild(body); promptBox.appendChild(ph);
    }else{
      var p=el('div','cps-prompt');
      if(it.em) p.appendChild(el('span','em',it.em));
      p.appendChild(el('div','tx',it.text||''));
      promptBox.appendChild(p);
    }

    var sort=(d.variant==='sort');
    var grid=el('div', sort?'cps-bins':'cps-opts');
    if((sort?2:it.opts.length)===2 || it.opts.length===2) grid.classList.add('two');
    if(sort && it.opts.length>2) grid.classList.remove('two');
    it.opts.forEach(function(o,oi){
      var b=el('button', sort?'cps-bin':'cps-opt', o.l);
      b.onclick=function(){ pick(oi,b); };
      grid.appendChild(b);
    });
    optBox.appendChild(grid);
    /* lecture à la demande seulement (bouton 🔊) */
  }

  function pick(oi,btn){
    var it=items[i];
    var good=!!it.opts[oi].ok;
    if(good) earned++;
    var btns=optBox.querySelectorAll('button');
    for(var k=0;k<btns.length;k++){
      btns[k].disabled=true;
      if(it.opts[k].ok) btns[k].classList.add('ok');
      else btns[k].classList.add('dim');
    }
    if(!good) btn.classList.remove('dim'),btn.classList.add('no');
    var box=el('div','cps-fb '+(good?'good':'bad'), (good?'✓ ':'💡 ')+(it.ex||''));
    fb.appendChild(box);
    var last=(i>=items.length-1);
    var nb=el('button','cps-next', last?'Continuer →':'Suivant →');
    nb.onclick=function(){ if(last){ ctx.addScore(earned, items.length); bar.firstChild.style.width='100%'; ctx.next(); } else { i++; draw(); } };
    fb.appendChild(nb);
  }
  draw();
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
    var c=el('div','cps-cell',p.l); c.dataset.k=idx;
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
  card.appendChild(pool);
  var fb=el('div',null,''); card.appendChild(fb);
  stage.appendChild(card);

  var expect=0; var pts=0; var slotErr=false;
  shuffle(steps.map(function(s,idx){ return {idx:idx,s:s}; })).forEach(function(o){
    var chip=el('button','cps-chip',o.s);
    chip.onclick=function(){ tap(o.idx, chip); };
    pool.appendChild(chip);
  });
  function tap(orderIdx, chip){
    if(chip.classList.contains('used')) return;
    if(orderIdx===expect){
      chip.classList.add('used');
      var sl=slots.children[expect];
      sl.classList.add('full'); sl.querySelector('.lab').textContent=' '+steps[expect];
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

/* SCÉNARIO (tu décides) */
RENDER.scenario=function(stage, d, ctx){
  var scenes=d.scenes||[];
  var i=0, good=0;
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
    if(s.em) sc.appendChild(el('span','em',s.em));
    sc.appendChild(el('div','tx',s.text||''));
    body.appendChild(sc);
    body.appendChild(listenBtn(function(){ return s.audio||s.text; }));
    var opts=el('div','cps-opts');
    s.choices.forEach(function(c,ci){
      var b=el('button','cps-opt',c.l);
      b.onclick=function(){ choose(ci,b); };
      opts.appendChild(b);
    });
    body.appendChild(opts);
    /* lecture à la demande seulement (bouton 🔊) */
  }
  function choose(ci,btn){
    var s=scenes[i]; var c=s.choices[ci];
    if(c.good) good++;
    var btns=body.querySelectorAll('.cps-opt');
    for(var k=0;k<btns.length;k++){ btns[k].disabled=true; if(!s.choices[k].good) btns[k].classList.add('dim'); }
    btn.classList.remove('dim'); btn.classList.add(c.good?'ok':'no');
    var conseq=el('div','cps-conseq');
    conseq.appendChild(el('span','face', c.good?'😀':'😕'));
    conseq.appendChild(el('div','cps-fb '+(c.good?'good':'bad'), c.fb||''));
    body.appendChild(conseq);
    var last=(i>=scenes.length-1);
    var nb=el('button','cps-next', last?'Continuer →':'La suite →');
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

/* ---------- API ---------- */
window.CPS={
  init:function(cfg){ if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',function(){ new Ctrl(cfg); }); } else { new Ctrl(cfg); } },
  speak:speak
};
})();
