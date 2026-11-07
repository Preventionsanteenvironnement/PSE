/* ============================================================
   CPS MOI — exercices sur soi et carnet de l'élève (mapse.fr)
   Sert aux parcours CAP (via cps_kit.js) et aux pages Bac Pro.
   Rien n'est noté. Rien n'est envoyé : le carnet reste sur
   l'appareil (localStorage), et l'élève peut tout effacer.
   ------------------------------------------------------------
   CPSMoi.sequence(box, spec, opts)  « Et moi ? » : étapes sur soi
   CPSMoi.choixSoi(box, items, opts) bilan : choix sur soi
   CPSMoi.defi(box, spec, opts)      mon essai de la semaine
   CPSMoi.duo(box, spec)             carte « En classe, à deux »
   CPSMoi.retour(box, opts)          « Tu as essayé ? »
   CPSMoi.auto()                     monte les blocs data-cps-moi
   ============================================================ */
(function(){
"use strict";

var EMOJI_RE=/(?![\u00A9\u00AE\u2122])[\p{Extended_Pictographic}\uFE0F\u200D\u20E3]/gu;
function noEmoji(s){ return (s==null)?s:String(s).replace(EMOJI_RE,''); }
function el(tag, cls, html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=noEmoji(html); return e; }
function clear(n){ while(n.firstChild) n.removeChild(n.firstChild); }
function txt(s){ var d=document.createElement('div'); d.innerHTML=s||''; return (d.textContent||'').trim(); }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function today(){ var d=new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function dateFr(iso){ if(!iso) return ''; var p=iso.split('-'); return p[2]+'/'+p[1]+'/'+p[0]; }

/* ---------- lecture à voix haute ---------- */
function stopSpeech(){ try{ window.speechSynthesis.cancel(); }catch(e){} }
function listen(getText){
  var b=el('button','moi-listen','Écouter'); b.type='button';
  b.onclick=function(){
    try{
      if(b.classList.contains('on')){ stopSpeech(); b.classList.remove('on'); b.textContent='Écouter'; return; }
      var t=txt(noEmoji(getText())); if(!t) return;
      stopSpeech();
      var u=new SpeechSynthesisUtterance(t); u.lang='fr-FR'; u.rate=0.92;
      u.onend=u.onerror=function(){ b.classList.remove('on'); b.textContent='Écouter'; };
      b.classList.add('on'); b.textContent='Arrêter';
      window.speechSynthesis.speak(u);
    }catch(e){}
  };
  if(!('speechSynthesis' in window)) b.style.display='none';
  return b;
}

/* ---------- le carnet (sur l'appareil seulement) ---------- */
var KEY='cps_carnet_v1', SHARED='cps_carnet_partage';
var memoire=null;           /* appareil partagé : on garde le temps de la page */
function vide(){ return {v:1, entries:[], defis:{}}; }
function partage(){ try{ return localStorage.getItem(SHARED)==='1'; }catch(e){ return true; } }
function lire(){
  if(partage()) return memoire||(memoire=vide());
  try{ var c=JSON.parse(localStorage.getItem(KEY)); if(c && c.entries) return c; }catch(e){}
  return vide();
}
function ecrire(c){
  if(partage()){ memoire=c; return; }
  try{ localStorage.setItem(KEY, JSON.stringify(c)); }catch(e){ memoire=c; }
}
function cle(o){ o=o||{}; return (o.code||'')+'|'+(o.titre||''); }
var Carnet={
  lire:lire,
  partage:partage,
  setPartage:function(on){
    try{
      if(on){ localStorage.setItem(SHARED,'1'); localStorage.removeItem(KEY); }
      else localStorage.removeItem(SHARED);
    }catch(e){}
    memoire=null;
  },
  noter:function(o,label,valeur){
    if(valeur==null || valeur==='') return;
    var c=lire();
    c.entries.push({code:o.code||'', titre:o.titre||'', fam:o.fam||'', label:txt(label), valeur:String(valeur), date:today()});
    if(c.entries.length>400) c.entries=c.entries.slice(-400);
    ecrire(c);
  },
  /* clé = code + titre : deux pages au même code gardent chacune leur essai */
  defi:function(o){ return lire().defis[cle(o)]||null; },
  setDefi:function(o,d){ var c=lire(); d.code=o.code||''; c.defis[cle(o)]=d; ecrire(c); },
  effacer:function(){ memoire=null; try{ localStorage.removeItem(KEY); }catch(e){} }
};

/* ---------- repères communs ---------- */
var EMOS=[
  {k:'joie',      l:'Joie',      img:'assets/cps/emotions/carte-noa-joie.jpg',      alt:'Un jeune homme sourit franchement.'},
  {k:'tristesse', l:'Tristesse', img:'assets/cps/emotions/carte-lina-tristesse.jpg',alt:'Une jeune femme baisse les yeux, la bouche tombante.'},
  {k:'colere',    l:'Colère',    img:'assets/cps/emotions/carte-noa-colere.jpg',    alt:'Un jeune homme fronce les sourcils, la mâchoire serrée.'},
  {k:'peur',      l:'Peur',      img:'assets/cps/emotions/carte-ines-peur.jpg',     alt:'Une jeune femme ouvre grand les yeux, le corps en retrait.'},
  {k:'surprise',  l:'Surprise',  img:'assets/cps/emotions/carte-lina-surprise.jpg', alt:'Une jeune femme lève les sourcils, la bouche ouverte.'},
  {k:'degout',    l:'Dégoût',    img:'assets/cps/emotions/carte-malik-degout.jpg',  alt:'Un jeune homme plisse le nez et recule la tête.'}
];
var ZONES=['La tête','La gorge','La mâchoire','Les épaules','La poitrine','Le ventre','Les mains','Les jambes'];
var NOTE_PRIVEE='Tes réponses restent sur cet appareil. Personne ne les reçoit. Tu peux les effacer dans ton carnet.';

function chips(list, multi, onChange){
  var box=el('div','moi-chips'); var sel=[];
  list.forEach(function(o){
    var lab=(typeof o==='string')?o:o.l;
    var b=el('button','moi-chip',esc(lab)); b.type='button';
    b.setAttribute('aria-pressed','false');
    b.onclick=function(){
      var i=sel.indexOf(lab);
      if(multi){ if(i>=0){ sel.splice(i,1); b.classList.remove('sel'); b.setAttribute('aria-pressed','false'); } else { sel.push(lab); b.classList.add('sel'); b.setAttribute('aria-pressed','true'); } }
      else { sel=[lab]; var bs=box.querySelectorAll('.moi-chip'); for(var k=0;k<bs.length;k++){ bs[k].classList.remove('sel'); bs[k].setAttribute('aria-pressed','false'); } b.classList.add('sel'); b.setAttribute('aria-pressed','true'); }
      onChange(sel.slice());
    };
    box.appendChild(b);
  });
  return box;
}

/* ---------- une étape sur soi ---------- */
/* Chaque étape rend { node, valeur() } ; valeur() vide = pas encore répondu. */
var STEP={};

STEP.info=function(s){
  var n=el('div','moi-info');
  if(s.img){ var im=el('img','moi-img'); im.src=s.img; im.alt=s.alt||''; n.appendChild(im); }
  n.appendChild(el('div','moi-info-tx',s.html||''));
  return {node:n, valeur:function(){ return '-'; }, muet:true};
};

STEP.emotion=function(s, change){
  var n=el('div','moi-emos'); var sel=[]; var multi=(s.multi!==false);
  var autres=el('div','moi-chips');
  EMOS.forEach(function(e){
    var b=el('button','moi-emo'); b.type='button'; b.setAttribute('aria-pressed','false');
    var im=el('img'); im.src=e.img; im.alt=e.alt; im.setAttribute('loading','lazy'); b.appendChild(im);
    b.appendChild(el('span',null,e.l));
    b.onclick=function(){
      nsp.classList.remove('sel');
      var i=sel.indexOf(e.l);
      if(i>=0){ sel.splice(i,1); b.classList.remove('sel'); b.setAttribute('aria-pressed','false'); }
      else {
        if(!multi){ sel=[]; var bs=n.querySelectorAll('.moi-emo'); for(var k=0;k<bs.length;k++){ bs[k].classList.remove('sel'); bs[k].setAttribute('aria-pressed','false'); } }
        sel.push(e.l); b.classList.add('sel'); b.setAttribute('aria-pressed','true');
      }
      change();
    };
    n.appendChild(b);
  });
  var nsp=el('button','moi-chip','Je ne sais pas encore'); nsp.type='button';
  nsp.onclick=function(){ sel=[]; var bs=n.querySelectorAll('.moi-emo'); for(var k=0;k<bs.length;k++) bs[k].classList.remove('sel'); nsp.classList.add('sel'); change(); };
  autres.appendChild(nsp);
  var w=el('div',null); w.appendChild(n);
  if(multi) w.appendChild(el('p','moi-aide','Tu peux en choisir plusieurs : on ressent souvent deux émotions à la fois.'));
  w.appendChild(autres);
  return {node:w, valeur:function(){ return nsp.classList.contains('sel') ? 'Je ne sais pas encore' : sel.join(', '); }};
};

STEP.corps=function(s, change){
  var sel=[]; var w=el('div',null);
  if(s.img){ var im=el('img','moi-img'); im.src=s.img; im.alt=s.alt||''; w.appendChild(im); }
  var c=chips((s.zones||ZONES).concat(['Rien de précis']), true, function(v){ sel=v; change(); });
  w.appendChild(c);
  return {node:w, valeur:function(){ return sel.join(', '); }};
};

STEP.echelle=function(s, change){
  var min=(s.min!=null)?s.min:0, max=(s.max!=null)?s.max:10, v=null;
  var w=el('div','moi-echelle');
  var row=el('div','moi-ech-row');
  for(var i=min;i<=max;i++)(function(i){
    var b=el('button','moi-ech',String(i)); b.type='button';
    var r=(i-min)/(max-min);
    b.style.setProperty('--h', r<=.34?'#16a34a':(r<=.67?'#d97706':'#dc2626'));
    b.setAttribute('aria-label', i+' sur '+max);
    b.onclick=function(){ v=i; var bs=row.querySelectorAll('.moi-ech'); for(var k=0;k<bs.length;k++) bs[k].classList.toggle('sel', bs[k]===b); change(); };
    row.appendChild(b);
  })(i);
  w.appendChild(row);
  w.appendChild(el('div','moi-ech-lab','<span>'+esc(s.bas||'Très faible')+'</span><span>'+esc(s.haut||'Très fort')+'</span>'));
  return {node:w, valeur:function(){ return v==null?'':(v+' sur '+max); }};
};

STEP.choix=function(s, change){
  var sel=[]; var w=el('div',null);
  if(s.img){ var im=el('img','moi-img'); im.src=s.img; im.alt=s.alt||''; w.appendChild(im); }
  w.appendChild(chips(s.opts||[], !!s.multi, function(v){ sel=v; change(); }));
  var libre=null;
  if(s.autre){
    libre=el('input','moi-input'); libre.type='text'; libre.maxLength=120;
    libre.placeholder=s.autre===true?'Autre (facultatif)':s.autre;
    libre.setAttribute('aria-label','Autre réponse');
    libre.oninput=change; w.appendChild(libre);
  }
  return {node:w, valeur:function(){ var a=sel.slice(); if(libre && libre.value.trim()) a.push(libre.value.trim()); return a.join(', '); }};
};

STEP.texte=function(s, change){
  var w=el('div',null);
  var ta=el('textarea','moi-input moi-ta'); ta.rows=s.lignes||3; ta.maxLength=s.max||300;
  ta.placeholder=s.aide||''; ta.setAttribute('aria-label', txt(s.q||'Ta réponse'));
  ta.oninput=change;
  if(s.etiquettes && s.etiquettes.length){
    w.appendChild(el('p','moi-aide','Tu peux toucher des mots pour les ajouter.'));
    var et=el('div','moi-chips');
    s.etiquettes.forEach(function(m){
      var b=el('button','moi-chip moi-mot',esc(m)); b.type='button';
      b.onclick=function(){ var v=ta.value.replace(/\s+$/,''); ta.value=(v?v+' ':'')+m; ta.focus(); change(); };
      et.appendChild(b);
    });
    w.appendChild(et);
  }
  w.appendChild(ta);
  return {node:w, valeur:function(){ return ta.value.trim(); }};
};

/* Phrase à construire : morceaux fixes + cases à choisir ou à écrire */
STEP.phrase=function(s, change){
  var w=el('div','moi-phrase'); var slots=[];
  var apercu=el('div','moi-apercu');
  function lire(){
    return (s.parts||[]).map(function(p,i){
      if(p.t!=null) return p.t;
      var sl=slots[i]; return (sl && sl.v)? sl.v : '…';
    }).join(' ').replace(/\s+([,.])/g,'$1').replace(/\s*([?!:;])/g,'\u00a0$1').replace(/\s+/g,' ').trim();
  }
  function maj(){ apercu.textContent=lire(); change(); }
  (s.parts||[]).forEach(function(p,i){
    if(p.t!=null){ return; }
    var bloc=el('div','moi-slot');
    bloc.appendChild(el('div','moi-slot-lab',esc(p.label||'Choisis')));
    var sl={v:''}; slots[i]=sl;
    var libre=null;
    var c=chips(p.opts||[], false, function(v){ sl.v=v[0]||''; if(libre) libre.value=''; maj(); });
    bloc.appendChild(c);
    if(p.libre!==false){
      libre=el('input','moi-input'); libre.type='text'; libre.maxLength=100;
      libre.placeholder=p.libre&&p.libre!==true?p.libre:'Ou écris avec tes mots';
      libre.setAttribute('aria-label',txt(p.label||'Ta réponse'));
      libre.oninput=function(){ if(libre.value.trim()){ sl.v=libre.value.trim(); var bs=c.querySelectorAll('.moi-chip'); for(var k=0;k<bs.length;k++) bs[k].classList.remove('sel'); } maj(); };
      bloc.appendChild(libre);
    }
    w.appendChild(bloc);
  });
  w.appendChild(el('div','moi-slot-lab','Ta phrase'));
  w.appendChild(apercu);
  maj();
  return {node:w, valeur:function(){ for(var k in slots){ if(slots[k] && !slots[k].v) return ''; } return lire(); }};
};

/* Une minute pour souffler : inspirer 4 s, expirer 6 s. */
STEP.respire=function(s, change){
  var w=el('div','moi-respire');
  var rond=el('div','moi-rond'); var lab=el('div','moi-rond-lab','Prêt');
  rond.appendChild(lab); w.appendChild(rond);
  var go=el('button','moi-btn2','Commencer la minute'); go.type='button';
  var fini=false, t=null;
  go.onclick=function(){
    go.disabled=true; var reste=s.duree||60, phase=0, cpt=0;
    function tick(){
      if(reste<=0){ clearInterval(t); lab.textContent='Terminé'; rond.className='moi-rond'; fini=true; change(); return; }
      if(cpt===0){ phase=1-phase; lab.textContent=phase?'J’inspire':'Je souffle'; rond.className='moi-rond '+(phase?'in':'out'); cpt=phase?4:6; }
      cpt--; reste--;
    }
    tick(); t=setInterval(tick,1000);
  };
  w.appendChild(go);
  w.appendChild(el('p','moi-aide','Si respirer ainsi te gêne, respire comme d’habitude, ou passe.'));
  return {node:w, valeur:function(){ return fini?'Fait':''; }};
};

/* ---------- « Et moi ? » : une suite d'étapes sur soi ---------- */
function sequence(box, spec, opts){
  opts=opts||{};
  var steps=spec.steps||[], i=0, rep=[];
  var card=el('div','moi-card');
  var head=el('div','moi-head');
  head.appendChild(el('span','moi-tag',esc(spec.tag||'Et moi ?')));
  var count=el('span','moi-count',''); head.appendChild(count);
  card.appendChild(head);
  if(spec.title) card.appendChild(el('div','moi-title',spec.title));
  if(spec.intro) card.appendChild(el('p','moi-intro',spec.intro));
  var zone=el('div',null); card.appendChild(zone);
  box.appendChild(card);

  function draw(){
    var s=steps[i]; clear(zone);
    count.textContent=(i+1)+' / '+steps.length;
    var q=el('div','moi-q',s.q||'');
    var ctr=el('div','moi-ctrls'); ctr.appendChild(listen(function(){ return (s.audio||s.q||'')+' '+(s.html||''); }));
    zone.appendChild(q); zone.appendChild(ctr);
    var ok=el('button','moi-btn','Valider'); ok.type='button';
    var st=null;
    st=STEP[s.kind||'choix'](s, function(){ if(st) ok.disabled=!st.valeur(); });
    zone.appendChild(st.node);
    if(s.criteres && s.criteres.length) zone.appendChild(criteres(s.criteres));
    var bar=el('div','moi-actions');
    ok.disabled=!st.valeur();
    if(st.muet) ok.textContent='Continuer';
    ok.onclick=function(){
      var v=st.valeur();
      if(!st.muet){ rep.push({label:s.carnet||s.q, valeur:v}); Carnet.noter(opts, s.carnet||s.q, v); }
      suite();
    };
    bar.appendChild(ok);
    if(!st.muet && s.passer!==false){
      var p=el('button','moi-passer','Je préfère passer'); p.type='button';
      p.onclick=function(){ suite(); };
      bar.appendChild(p);
    }
    zone.appendChild(bar);
  }
  function suite(){ stopSpeech(); i++; if(i<steps.length) draw(); else fin(); }
  function fin(){
    clear(zone); count.textContent='';
    zone.appendChild(el('div','moi-q', spec.finTitre||'Ce que tu as noté'));
    if(rep.length){
      var ul=el('ul','moi-recap');
      rep.forEach(function(r){ ul.appendChild(el('li',null,'<span>'+esc(txt(r.label))+'</span><strong>'+esc(r.valeur)+'</strong>')); });
      zone.appendChild(ul);
    } else zone.appendChild(el('p','moi-aide','Tu as choisi de ne rien noter. C’est ton droit.'));
    if(spec.fin) zone.appendChild(el('p','moi-intro',spec.fin));
    zone.appendChild(notePrivee());
    var bar=el('div','moi-actions');
    if(opts.next){ var n=el('button','moi-btn',opts.nextLabel||'Continuer →'); n.type='button'; n.onclick=opts.next; bar.appendChild(n); }
    zone.appendChild(bar);
  }
  if(steps.length) draw();
}

function criteres(list){
  var w=el('div','moi-criteres');
  w.appendChild(el('div','moi-slot-lab','Je vérifie ma réponse'));
  list.forEach(function(c){
    var lb=el('label','moi-crit'); var cb=el('input'); cb.type='checkbox';
    lb.appendChild(cb); lb.appendChild(el('span',null,c)); w.appendChild(lb);
  });
  return w;
}
function notePrivee(){
  var p=el('p','moi-prive',NOTE_PRIVEE+' <a href="cps_carnet.html">Ouvrir mon carnet</a>');
  return p;
}

/* ---------- bilan : des choix sur soi (remplace « Je sais… ») ---------- */
function choixSoi(box, items, opts){
  opts=opts||{};
  var w=el('div','moi-self');
  w.appendChild(el('div','moi-title','Pour moi'));
  w.appendChild(el('p','moi-aide','Il n’y a pas de bonne réponse. Choisis ce qui est vrai pour toi, ou passe.'));
  items.forEach(function(it){
    if(typeof it==='string') it={q:it, opts:['Oui','En partie','Pas encore']};
    var row=el('div','moi-self-row');
    row.appendChild(el('div','moi-self-q',it.q));
    row.appendChild(chips(it.opts||[], !!it.multi, function(v){
      clearTimeout(row._t);
      row._t=setTimeout(function(){ Carnet.noter(opts, it.carnet||it.q, v.join(', ')); },600);
    }));
    w.appendChild(row);
  });
  w.appendChild(notePrivee());
  box.appendChild(w);
}

/* ---------- mon essai de la semaine ---------- */
var MOMENTS=['En cours','Pendant une pause','En stage ou au travail','À la maison','Avec des amis','Dans un lieu public'];
function defi(box, spec, opts){
  opts=opts||{};
  var w=el('div','moi-defi');
  w.appendChild(el('div','moi-title',spec.titre||'Mon essai de la semaine'));
  w.appendChild(el('p','moi-intro',spec.q||'Choisis une seule chose à essayer cette semaine.'));
  var strat='', moment='';
  w.appendChild(el('div','moi-slot-lab','Ce que j’essaie'));
  w.appendChild(chips(spec.opts||[], false, function(v){ strat=v[0]||''; maj(); }));
  w.appendChild(el('div','moi-slot-lab','Quand'));
  w.appendChild(chips(spec.moments||MOMENTS, false, function(v){ moment=v[0]||''; maj(); }));
  var bar=el('div','moi-actions');
  var ok=el('button','moi-btn','Je garde cet essai'); ok.type='button'; ok.disabled=true;
  var msg=el('div','moi-ok','');
  function maj(){ ok.disabled=!(strat&&moment); }
  ok.onclick=function(){
    Carnet.setDefi(opts, {titre:opts.titre||'', strat:strat, moment:moment, date:today(), retour:null});
    Carnet.noter(opts,'Mon essai de la semaine', strat+' ('+moment.toLowerCase()+')');
    msg.innerHTML='C’est noté. La prochaine fois que tu ouvriras cette activité, on te demandera comment ça s’est passé.';
    ok.disabled=true;
  };
  bar.appendChild(ok);
  w.appendChild(bar); w.appendChild(msg);
  var d=Carnet.defi(opts);
  if(d && !d.retour) w.appendChild(el('p','moi-aide','Essai en cours depuis le '+dateFr(d.date)+' : « '+esc(d.strat)+' ». Un nouveau choix le remplace.'));
  box.appendChild(w);
}

/* ---------- au retour : « Tu as essayé ? » ---------- */
function retour(box, opts){
  opts=opts||{};
  var d=Carnet.defi(opts);
  if(!d || d.retour || d.date===today()) return false;
  var w=el('div','moi-card moi-retour');
  w.appendChild(el('span','moi-tag','Retour sur ton essai'));
  w.appendChild(el('div','moi-q','Le '+dateFr(d.date)+', tu avais choisi d’essayer : « '+esc(d.strat)+' » ('+esc((d.moment||'').toLowerCase())+'). Tu as essayé ?'));
  w.appendChild(listen(function(){ return w.querySelector('.moi-q').textContent; }));
  var res='', note=null;
  w.appendChild(chips(['Oui, cela m’a aidé','Oui, mais cela n’a pas aidé','Pas encore','Je préfère ne pas répondre'], false, function(v){ res=v[0]||''; ok.disabled=!res; }));
  w.appendChild(el('div','moi-slot-lab','Ce qui a aidé ou gêné (facultatif)'));
  note=el('textarea','moi-input moi-ta'); note.rows=2; note.maxLength=200; note.setAttribute('aria-label','Ce qui a aidé ou gêné');
  w.appendChild(note);
  var bar=el('div','moi-actions');
  var ok=el('button','moi-btn','Valider'); ok.type='button'; ok.disabled=true;
  ok.onclick=function(){
    d.retour={res:res, note:note.value.trim(), date:today()};
    Carnet.setDefi(opts,d);
    Carnet.noter(opts,'Retour sur mon essai', res+(note.value.trim()?' — '+note.value.trim():''));
    clear(w);
    w.appendChild(el('div','moi-q','Merci. C’est noté dans ton carnet.'));
    var p=el('p','moi-intro', res.indexOf('pas aidé')>=0 ? 'Une stratégie ne marche pas pour tout le monde ni à chaque fois. Tu pourras en essayer une autre à la fin de l’activité.' : (res==='Pas encore' ? 'Tu peux garder cet essai, ou en choisir un autre à la fin de l’activité.' : 'Une stratégie qui t’aide est une ressource : tu peux la réutiliser.'));
    w.appendChild(p);
    if(opts.next){ var n=el('button','moi-btn','Commencer l’activité →'); n.type='button'; n.onclick=opts.next; w.appendChild(n); }
  };
  bar.appendChild(ok);
  var plus=el('button','moi-passer','Plus tard'); plus.type='button';
  plus.onclick=function(){ if(opts.next) opts.next(); else w.remove(); };
  bar.appendChild(plus);
  w.appendChild(bar);
  box.appendChild(w);
  return true;
}

/* ---------- carte « En classe, à deux » ---------- */
function duo(box, spec){
  var w=el('div','moi-duo');
  w.appendChild(el('div','moi-duo-head','<span>En classe, à deux</span><small>avec ton professeur · '+esc(spec.duree||'10 minutes')+'</small>'));
  if(spec.img){ var im=el('img','moi-img'); im.src=spec.img; im.alt=spec.alt||''; w.appendChild(im); }
  if(spec.situation) w.appendChild(el('p','moi-duo-sit','<strong>Situation.</strong> '+spec.situation));
  var roles=el('div','moi-duo-roles');
  roles.appendChild(el('div','moi-role','<strong>Élève A</strong>'+(spec.roleA||'')));
  roles.appendChild(el('div','moi-role','<strong>Élève B</strong>'+(spec.roleB||'')));
  w.appendChild(roles);
  if(spec.etapes && spec.etapes.length){
    var ol=el('ol','moi-duo-et'); spec.etapes.forEach(function(e){ ol.appendChild(el('li',null,e)); }); w.appendChild(ol);
  }
  if(spec.observe && spec.observe.length){
    w.appendChild(el('div','moi-slot-lab',spec.observeTitre||'B observe et coche ce qui a été fait'));
    var t=el('table','moi-grille');
    t.innerHTML='<thead><tr><th>Ce que j’observe</th><th>Oui</th><th>En partie</th><th>Non</th></tr></thead>';
    var tb=el('tbody');
    spec.observe.forEach(function(o,k){
      var tr=el('tr'); tr.appendChild(el('td',null,o));
      ['Oui','En partie','Non'].forEach(function(v){ var td=el('td'); var r=el('input'); r.type='radio'; r.name='obs'+k+'_'+Math.random().toString(36).slice(2,6); r.setAttribute('aria-label',txt(o)+' : '+v); td.appendChild(r); tr.appendChild(td); });
      tb.appendChild(tr);
    });
    t.appendChild(tb); w.appendChild(t);
  }
  w.appendChild(el('p','moi-aide', spec.fin||'Puis on échange les rôles. Chacun peut passer son tour. On parle de ce qu’on a vu, jamais de la personne.'));
  var pr=el('button','moi-btn2','Imprimer cette carte'); pr.type='button';
  pr.onclick=function(){ document.body.classList.add('moi-print-duo'); w.classList.add('moi-imprime'); try{ window.print(); }catch(e){} setTimeout(function(){ document.body.classList.remove('moi-print-duo'); w.classList.remove('moi-imprime'); },500); };
  w.appendChild(pr);
  box.appendChild(w);
}

/* ---------- blocs automatiques (pages Bac Pro) ----------
   <div data-cps-moi="sequence|choix|defi|duo|retour" data-code="E1.1" data-titre="…">
     <script type="application/json">{…}</script>
   </div> */
function auto(){
  var nodes=document.querySelectorAll('[data-cps-moi]');
  for(var k=0;k<nodes.length;k++){
    var n=nodes[k]; if(n._moi) continue; n._moi=true;
    var spec={}; var js=n.querySelector('script[type="application/json"]');
    try{ if(js) spec=JSON.parse(js.textContent); }catch(e){ continue; }
    var o={code:n.getAttribute('data-code')||'', titre:n.getAttribute('data-titre')||document.title, fam:n.getAttribute('data-fam')||''};
    var t=n.getAttribute('data-cps-moi');
    if(t==='sequence') sequence(n, spec, o);
    else if(t==='choix') choixSoi(n, spec.items||spec, o);
    else if(t==='defi') defi(n, spec, o);
    else if(t==='duo') duo(n, spec);
    else if(t==='retour') retour(n, o);
  }
}

window.CPSMoi={ sequence:sequence, choixSoi:choixSoi, defi:defi, duo:duo, retour:retour, auto:auto, carnet:Carnet, EMOS:EMOS };
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',auto); else auto();
})();
