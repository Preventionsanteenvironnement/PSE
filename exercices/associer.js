/* associer.js — moteur « Associer » (relier par paires) partagé (CAPa). Complète exo.css/associer.css.
   La page définit window.ASSO = { titre, kicker, chips:[...], cle, consigne,
     colonnes:{gauche, droite},  // libellés des 2 colonnes (optionnel)
     pairs:[ {a, b} ] }.
   Touche un élément de gauche, puis son correspondant à droite. Bon = verrouillé vert ;
   faux = flash rouge. Score = nombre d'essais. A+/A−, mode dys. */
(function(){
  "use strict";
  function ready(fn){ if(document.readyState!=="loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function el(t,c,h){ var e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; }
  function save(k,v){ try{ localStorage.setItem("capa_exo_"+k,v); }catch(e){} }
  function get(k){ try{ return localStorage.getItem("capa_exo_"+k); }catch(e){ return null; } }
  function setFs(v){ document.documentElement.style.setProperty("--fs",v+"px"); save("fs",v); }
  function stepFs(d){ var c=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--fs"))||17; setFs(Math.max(15,Math.min(26,c+d))); }
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }

  var A = window.ASSO || { pairs:[] };
  var root, leftHost, rightHost, metaHost, resHost;
  var selLeft=null, done=0, tries=0;

  function header(){
    var h=el("header","hero");
    h.appendChild(el("div","kicker", A.kicker||"Exercice · CAPa"));
    h.appendChild(el("h1",null, A.titre||"Associer"));
    if(A.chips){ var c=el("div","chips"); A.chips.forEach(function(x){ c.appendChild(el("span","chip",x)); }); h.appendChild(c); }
    return h;
  }
  function tools(){
    var t=el("div","tools"); var g=el("div","grp"); g.appendChild(el("span","lab","Texte"));
    var bd=el("button","mini ghost","A−"); bd.onclick=function(){stepFs(-1);};
    var bu=el("button","mini ghost","A+"); bu.onclick=function(){stepFs(1);};
    var by=el("button","mini ghost","Dys"); by.onclick=function(){ document.body.classList.toggle("dys"); save("dys",document.body.classList.contains("dys")?"1":"0"); };
    g.appendChild(bd); g.appendChild(bu); g.appendChild(by); t.appendChild(g); return t;
  }

  function build(){
    selLeft=null; done=0; tries=0;
    var n=A.pairs.length;
    var leftOrder=shuffle(A.pairs.map(function(_,i){return i;}));
    var rightOrder=shuffle(A.pairs.map(function(_,i){return i;}));
    var wrap=el("div","asso");
    var lc=el("div","col left"); lc.appendChild(el("div","colh",(A.colonnes&&A.colonnes.gauche)||"À relier"));
    leftHost=el("div"); leftHost.style.display="flex"; leftHost.style.flexDirection="column"; leftHost.style.gap="9px";
    leftOrder.forEach(function(pi){
      var b=el("button","match"); b.dataset.pi=pi; b.dataset.side="L"; b.textContent=A.pairs[pi].a;
      b.onclick=function(){ onLeft(pi,b); };
      leftHost.appendChild(b);
    });
    lc.appendChild(leftHost);
    var rc=el("div","col right"); rc.appendChild(el("div","colh",(A.colonnes&&A.colonnes.droite)||"Correspondances"));
    rightHost=el("div"); rightHost.style.display="flex"; rightHost.style.flexDirection="column"; rightHost.style.gap="9px";
    rightOrder.forEach(function(pi){
      var b=el("button","match"); b.dataset.pi=pi; b.dataset.side="R"; b.textContent=A.pairs[pi].b;
      b.onclick=function(){ onRight(pi,b); };
      rightHost.appendChild(b);
    });
    rc.appendChild(rightHost);
    wrap.appendChild(lc); wrap.appendChild(rc);
    return wrap;
  }

  function clearSel(){ document.querySelectorAll(".match.sel").forEach(function(b){ b.classList.remove("sel"); }); }
  function onLeft(pi, b){
    if(b.classList.contains("done")) return;
    if(selLeft===pi){ selLeft=null; clearSel(); return; }
    clearSel(); selLeft=pi; b.classList.add("sel");
  }
  function onRight(pi, b){
    if(b.classList.contains("done")||selLeft==null) return;
    tries++;
    if(pi===selLeft){
      // bon appariement
      var lb=leftHost.querySelector('.match[data-pi="'+pi+'"]');
      lb.classList.remove("sel"); lb.classList.add("done"); lb.disabled=true;
      b.classList.add("done"); b.disabled=true;
      selLeft=null; done++;
      updateMeta();
      if(done===A.pairs.length) finish();
    } else {
      // faux : flash
      var lb2=leftHost.querySelector('.match[data-pi="'+selLeft+'"]');
      [b,lb2].forEach(function(x){ if(!x)return; x.classList.add("flash"); setTimeout(function(){ x.classList.remove("flash"); }, 320); });
      selLeft=null; clearSel(); updateMeta();
    }
  }
  function updateMeta(){ metaHost.innerHTML='<span>Reliés : '+done+" / "+A.pairs.length+'</span><span>Essais : '+tries+'</span>'; }

  function finish(){
    var n=A.pairs.length;
    var best=get("best_asso_"+(A.cle||A.titre));
    var perfect=(tries===n);
    if(best==null || tries<parseInt(best)) save("best_asso_"+(A.cle||A.titre), String(tries));
    best=get("best_asso_"+(A.cle||A.titre));
    resHost.className="result-asso show";
    resHost.innerHTML='<div class="score">Tout relié ! 🎉</div>'
      +'<div class="msg">'+n+' paires en <b>'+tries+'</b> essais'
      +(perfect?" — sans faute, parfait 💪":"")+'.<br>🏆 Meilleur (moins d\'essais) : '+best+'</div>'
      +'<button onclick="ASSO_restart()">🔄 Recommencer</button>';
    resHost.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function start(){
    root.innerHTML="";
    root.appendChild(header()); root.appendChild(tools());
    if(A.consigne) root.appendChild(el("div","consigne", A.consigne));
    root.appendChild(build());
    metaHost=el("div","asso-meta"); root.appendChild(metaHost); updateMeta();
    resHost=el("div","result-asso"); root.appendChild(resHost);
    if(get("fs"))setFs(get("fs")); if(get("dys")==="1")document.body.classList.add("dys");
  }
  window.ASSO_restart=function(){ start(); };

  ready(function(){ root=document.getElementById("exo"); if(root) start(); });
})();
