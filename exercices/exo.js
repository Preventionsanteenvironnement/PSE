/* exo.js — moteur d'exercices QCM auto-corrigé partagé (CAPa).
   La page définit window.EXO = { titre, kicker, chips:[...], cle, questions:[
     { q, options:[...], correct:<index>, explication } ] }.
   Rend un QCM interactif : une question à la fois, correction immédiate + explication,
   score, meilleur score mémorisé (localStorage). Accessibilité : A+/A−, mode dys.
   Chaque page charge exo.css + fonts + <div id="exo"> + <script src="exo.js">. */
(function(){
  "use strict";
  function ready(fn){ if(document.readyState!=="loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function el(tag, cls, html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
  function save(k,v){ try{ localStorage.setItem("capa_exo_"+k, v); }catch(e){} }
  function get(k){ try{ return localStorage.getItem("capa_exo_"+k); }catch(e){ return null; } }

  var E = window.EXO || { titre:"Exercice", questions:[] };
  var idx=0, score=0, answered=false;
  var root, barI, metaPos, metaScore, cardHost;

  function setFs(v){ document.documentElement.style.setProperty("--fs", v+"px"); save("fs", v); }
  function stepFs(d){ var c=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--fs"))||17; setFs(Math.max(15,Math.min(26,c+d))); }
  function toggleDys(){ document.body.classList.toggle("dys"); save("dys", document.body.classList.contains("dys")?"1":"0"); }

  function header(){
    var h=el("header","hero");
    h.appendChild(el("div","kicker", E.kicker||"Exercice · CAPa"));
    h.appendChild(el("h1",null, E.titre||"QCM"));
    if(E.chips&&E.chips.length){ var c=el("div","chips"); E.chips.forEach(function(x){ c.appendChild(el("span","chip",x)); }); h.appendChild(c); }
    return h;
  }
  function tools(){
    var t=el("div","tools");
    var g=el("div","grp"); g.appendChild(el("span","lab","Texte"));
    var bd=el("button","mini ghost","A−"); bd.onclick=function(){stepFs(-1);};
    var bu=el("button","mini ghost","A+"); bu.onclick=function(){stepFs(1);};
    var by=el("button","mini ghost","Dys"); by.onclick=toggleDys;
    g.appendChild(bd); g.appendChild(bu); g.appendChild(by); t.appendChild(g);
    return t;
  }

  function render(){
    answered=false;
    var q=E.questions[idx];
    barI.style.width = (idx/E.questions.length*100)+"%";
    metaPos.textContent = "Question "+(idx+1)+" / "+E.questions.length;
    metaScore.textContent = score+" pt"+(score>1?"s":"");
    cardHost.innerHTML="";
    var card=el("div","card");
    card.appendChild(el("div","q-num","Question "+(idx+1)));
    card.appendChild(el("div","q-text", q.q));
    var opts=el("div","opts");
    // ordre mélangé pour éviter « toujours la même lettre » et rendre le QCM rejouable
    var order=q.options.map(function(_,i){return i;});
    for(var k=order.length-1;k>0;k--){ var j=Math.floor(Math.random()*(k+1)); var tmp=order[k]; order[k]=order[j]; order[j]=tmp; }
    order.forEach(function(orig, pos){
      var b=el("button","opt");
      b.setAttribute("data-orig", orig);
      b.appendChild(el("span","ic", String.fromCharCode(65+pos)));
      b.appendChild(el("span",null, q.options[orig]));
      b.onclick=function(){ choose(orig, b, opts, card, q); };
      opts.appendChild(b);
    });
    card.appendChild(opts);
    var fb=el("div","feedback"); fb.id="fb"; card.appendChild(fb);
    var nav=el("div","nav"); nav.id="nav"; card.appendChild(nav);
    cardHost.appendChild(card);
  }

  function choose(i, btn, opts, card, q){
    if(answered) return; answered=true;
    var buttons=opts.querySelectorAll(".opt");
    buttons.forEach(function(b){ b.disabled=true; });
    var good = (i===q.correct);
    if(good){ score++; btn.classList.add("ok"); }
    else{ btn.classList.add("ko"); buttons[q.correct].classList.add("ok"); }
    metaScore.textContent = score+" pt"+(score>1?"s":"");
    var fb=card.querySelector("#fb");
    fb.className="feedback show "+(good?"good":"bad");
    fb.innerHTML = '<span class="t">'+(good?"✅ Bonne réponse":"❌ Réponse fausse")+'</span>'+(q.explication||"");
    var nav=card.querySelector("#nav");
    var last = (idx===E.questions.length-1);
    var nb=el("button", null, last?"Voir mon score ➜":"Question suivante ➜");
    nb.onclick=function(){ if(last){ results(); } else { idx++; render(); window.scrollTo({top:0,behavior:"smooth"}); } };
    nav.appendChild(nb);
  }

  function results(){
    barI.style.width="100%";
    var n=E.questions.length;
    var best = parseInt(get("best_"+(E.cle||E.titre))||"0");
    if(score>best){ best=score; save("best_"+(E.cle||E.titre), String(best)); }
    var pct = Math.round(score/n*100);
    var msg = pct>=80?"Bravo, c'est solide 💪":pct>=50?"Pas mal, à consolider":"À revoir tranquillement";
    cardHost.innerHTML="";
    metaPos.textContent="Terminé";
    var card=el("div","card");
    var r=el("div","result");
    r.appendChild(el("div","score", score+" / "+n));
    r.appendChild(el("div","msg", msg));
    r.appendChild(el("div","sub", pct+" % de bonnes réponses"));
    r.appendChild(el("div","best","🏆 Meilleur score : "+best+" / "+n));
    var again=el("div","again");
    var ba=el("button", null, "🔄 Recommencer");
    ba.onclick=function(){ idx=0; score=0; render(); window.scrollTo({top:0,behavior:"smooth"}); };
    again.appendChild(ba); r.appendChild(again);
    card.appendChild(r); cardHost.appendChild(card);
  }

  ready(function(){
    root=document.getElementById("exo"); if(!root) return;
    root.appendChild(header());
    root.appendChild(tools());
    var bar=el("div","bar"); barI=el("i"); bar.appendChild(barI); root.appendChild(bar);
    var meta=el("div","meta"); metaPos=el("span"); metaScore=el("span"); meta.appendChild(metaPos); meta.appendChild(metaScore); root.appendChild(meta);
    cardHost=el("div"); root.appendChild(cardHost);
    // préférences
    if(get("fs"))setFs(get("fs")); if(get("dys")==="1")document.body.classList.add("dys");
    render();
  });
})();
