/* calcul.js — moteur « Calcul guidé » partagé (CAPa). Complète exo.css/calcul.css.
   L'élève CALCULE et saisit sa réponse ; qu'elle soit juste ou fausse, on affiche toujours
   la MÉTHODE (étapes) et le POURQUOI (sens pédagogique). Les sigles sont décrits (glossaire).
   window.CALC = {
     titre, kicker, chips:[...], cle, consigne,
     sigles:[ {sigle, sens} ],          // affichés en glossaire + décrits
     questions:[ {
        enonce,                          // énoncé avec les nombres (sigles écrits en toutes lettres au 1er emploi)
        reponse:<number>, unite:"€|%|€/kg|h|…", tolerance:<number>,  // marge d'arrondi acceptée
        aide,                            // petit indice sous la saisie (optionnel)
        methode:[ "étape…", "…", "= résultat" ],
        pourquoi                         // à quoi ça sert / le sens
     } ]
   }. A+/A−, mode dys. */
(function(){
  "use strict";
  function ready(fn){ if(document.readyState!=="loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function el(t,c,h){ var e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; }
  function save(k,v){ try{ localStorage.setItem("capa_exo_"+k,v); }catch(e){} }
  function get(k){ try{ return localStorage.getItem("capa_exo_"+k); }catch(e){ return null; } }
  function setFs(v){ document.documentElement.style.setProperty("--fs",v+"px"); save("fs",v); }
  function stepFs(d){ var c=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--fs"))||17; setFs(Math.max(15,Math.min(26,c+d))); }
  function parseNum(s){ if(s==null) return NaN; s=(""+s).replace(/\s/g,"").replace(/€|%|\/kg|kg|h/gi,"").replace(",","."); return parseFloat(s); }

  var Q = window.CALC || { questions:[] };
  var root, cardHost, metaPos, metaScore, idx=0, score=0, answered=false;

  function header(){
    var h=el("header","hero");
    h.appendChild(el("div","kicker", Q.kicker||"Exercice · CAPa"));
    h.appendChild(el("h1",null, Q.titre||"Calcul guidé"));
    if(Q.chips){ var c=el("div","chips"); Q.chips.forEach(function(x){ c.appendChild(el("span","chip",x)); }); h.appendChild(c); }
    return h;
  }
  function tools(){
    var t=el("div","tools"); var g=el("div","grp"); g.appendChild(el("span","lab","Texte"));
    var bd=el("button","mini ghost","A−"); bd.onclick=function(){stepFs(-1);};
    var bu=el("button","mini ghost","A+"); bu.onclick=function(){stepFs(1);};
    var by=el("button","mini ghost","Dys"); by.onclick=function(){ document.body.classList.toggle("dys"); save("dys",document.body.classList.contains("dys")?"1":"0"); };
    g.appendChild(bd); g.appendChild(bu); g.appendChild(by); t.appendChild(g); return t;
  }
  function glossaire(){
    if(!Q.sigles||!Q.sigles.length) return null;
    var b=el("div","glossaire"); b.appendChild(el("div","gt","Les sigles à connaître"));
    Q.sigles.forEach(function(s){ b.appendChild(el("div","g","<b>"+s.sigle+"</b> — "+s.sens)); });
    return b;
  }

  function render(){
    answered=false;
    var q=Q.questions[idx];
    metaPos.textContent="Calcul "+(idx+1)+" / "+Q.questions.length;
    metaScore.textContent=score+" pt"+(score>1?"s":"");
    cardHost.innerHTML="";
    var card=el("div","card");
    card.appendChild(el("div","q-num","Calcul "+(idx+1)));
    card.appendChild(el("div","enonce", q.enonce));
    var row=el("div","answer-row");
    var inp=el("input"); inp.type="text"; inp.inputMode="decimal"; inp.setAttribute("aria-label","Ta réponse"); inp.placeholder="ta réponse"; inp.id="rep";
    inp.addEventListener("keydown",function(e){ if(e.key==="Enter") verify(); });
    row.appendChild(inp);
    if(q.unite) row.appendChild(el("span","unite", q.unite));
    var bv=el("button",null,"Vérifier"); bv.onclick=verify;
    row.appendChild(bv);
    card.appendChild(row);
    if(q.aide) card.appendChild(el("div","hint","💡 "+q.aide));
    var ex=el("div","explain"); ex.id="explain"; card.appendChild(ex);
    cardHost.appendChild(card);
    inp.focus();
  }

  function verify(){
    if(answered) return;
    var q=Q.questions[idx];
    var inp=document.getElementById("rep");
    var val=parseNum(inp.value);
    if(isNaN(val)){ inp.focus(); inp.classList.add("ko"); setTimeout(function(){inp.classList.remove("ko");},400); return; }
    answered=true; inp.disabled=true;
    var tol=(q.tolerance!=null?q.tolerance:0.01);
    var good=Math.abs(val-q.reponse)<=tol;
    if(good){ score++; inp.classList.add("ok"); } else { inp.classList.add("ko"); }
    metaScore.textContent=score+" pt"+(score>1?"s":"");
    var repTxt = (Math.round(q.reponse*100)/100).toLocaleString('fr-FR')+(q.unite?(" "+q.unite):"");
    var ex=document.getElementById("explain");
    ex.className="explain show "+(good?"good":"bad");
    var steps='<div class="methode"><div class="mt">La méthode, étape par étape</div>'+
      q.methode.map(function(s){return '<div class="step">'+s+'</div>';}).join("")+'</div>';
    ex.innerHTML='<span class="t">'+(good?"✅ Bonne réponse !":"❌ Pas tout à fait — la bonne réponse est "+repTxt)+'</span>'
      +(good?'<div class="pourquoi">Ta réponse est juste : <b>'+repTxt+'</b>. Voici comment on l\'obtient, à réutiliser le jour du CCF.</div>':'')
      +steps
      +(q.pourquoi?'<div class="pourquoi">'+q.pourquoi+'</div>':'')
      +'<div class="nav"></div>';
    var last=(idx===Q.questions.length-1);
    var nb=el("button",null,last?"Voir mon score ➜":"Calcul suivant ➜");
    nb.onclick=function(){ if(last){ results(); } else { idx++; render(); window.scrollTo({top:0,behavior:"smooth"}); } };
    ex.querySelector(".nav").appendChild(nb);
    ex.scrollIntoView({behavior:"smooth",block:"nearest"});
  }

  function results(){
    var n=Q.questions.length, pct=Math.round(score/n*100);
    var best=parseInt(get("best_calc_"+(Q.cle||Q.titre))||"0"); if(score>best){best=score;save("best_calc_"+(Q.cle||Q.titre),String(best));}
    cardHost.innerHTML=""; metaPos.textContent="Terminé";
    var card=el("div","card"); var r=el("div","result");
    r.appendChild(el("div","score", score+" / "+n));
    r.appendChild(el("div","msg", pct>=80?"Tu maîtrises les calculs 💪":pct>=50?"Bon début, refais-les pour ancrer la méthode":"Reprends la fiche puis recommence"));
    r.appendChild(el("div","best","🏆 Meilleur score : "+best+" / "+n));
    var again=el("div","again"); var ba=el("button",null,"🔄 Recommencer");
    ba.onclick=function(){ idx=0; score=0; render(); window.scrollTo({top:0,behavior:"smooth"}); };
    again.appendChild(ba); r.appendChild(again); card.appendChild(r); cardHost.appendChild(card);
  }

  ready(function(){
    root=document.getElementById("exo"); if(!root) return;
    root.appendChild(header()); root.appendChild(tools());
    if(Q.consigne) root.appendChild(el("div","consigne", Q.consigne));
    var gl=glossaire(); if(gl) root.appendChild(gl);
    var bar=el("div","bar"); root.appendChild(bar); // (barre décorative réutilisée du style exo)
    var meta=el("div","meta"); metaPos=el("span"); metaScore=el("span"); meta.appendChild(metaPos); meta.appendChild(metaScore); root.appendChild(meta);
    cardHost=el("div"); root.appendChild(cardHost);
    if(get("fs"))setFs(get("fs")); if(get("dys")==="1")document.body.classList.add("dys");
    render();
  });
})();
