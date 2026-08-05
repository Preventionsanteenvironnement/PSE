/* trous.js — moteur « Texte à trous » partagé (CAPa). Complète exo.css/trous.css.
   La page définit window.TROU = { titre, kicker, chips:[...], cle, consigne,
     parties:[ "texte…", {options:[...], correct:<index dans options>}, "suite…", … ] }.
   Chaque objet devient un menu déroulant (options mélangées). « Vérifier » corrige en couleur
   et affiche la bonne réponse pour les trous ratés. Score = trous justes. A+/A−, mode dys. */
(function(){
  "use strict";
  function ready(fn){ if(document.readyState!=="loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function el(t,c,h){ var e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; }
  function save(k,v){ try{ localStorage.setItem("capa_exo_"+k,v); }catch(e){} }
  function get(k){ try{ return localStorage.getItem("capa_exo_"+k); }catch(e){ return null; } }
  function setFs(v){ document.documentElement.style.setProperty("--fs",v+"px"); save("fs",v); }
  function stepFs(d){ var c=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--fs"))||17; setFs(Math.max(15,Math.min(26,c+d))); }
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }

  var T = window.TROU || { parties:[] };
  var root, clozeHost, resHost, selects=[], checked=false, nBlanks=0;

  function header(){
    var h=el("header","hero");
    h.appendChild(el("div","kicker", T.kicker||"Exercice · CAPa"));
    h.appendChild(el("h1",null, T.titre||"Texte à trous"));
    if(T.chips){ var c=el("div","chips"); T.chips.forEach(function(x){ c.appendChild(el("span","chip",x)); }); h.appendChild(c); }
    return h;
  }
  function tools(){
    var t=el("div","tools"); var g=el("div","grp"); g.appendChild(el("span","lab","Texte"));
    var bd=el("button","mini ghost","A−"); bd.onclick=function(){stepFs(-1);};
    var bu=el("button","mini ghost","A+"); bu.onclick=function(){stepFs(1);};
    var by=el("button","mini ghost","Dys"); by.onclick=function(){ document.body.classList.toggle("dys"); save("dys",document.body.classList.contains("dys")?"1":"0"); };
    g.appendChild(bd); g.appendChild(bu); g.appendChild(by); t.appendChild(g); return t;
  }

  function buildCloze(){
    selects=[]; nBlanks=0;
    var box=el("div","cloze"); var p=el("p");
    T.parties.forEach(function(part){
      if(typeof part==="string"){
        // gérer les sauts de paragraphe éventuels
        var segs=part.split("\n\n");
        segs.forEach(function(seg,si){
          if(si>0){ box.appendChild(p); p=el("p"); }
          p.appendChild(document.createTextNode(seg));
        });
      } else {
        var bi=nBlanks++;
        var sel=el("select"); sel.dataset.correct=part.correct;
        var ph=el("option",null,"— choisir —"); ph.value=""; ph.disabled=true; ph.selected=true; sel.appendChild(ph);
        var order=shuffle(part.options.map(function(_,i){return i;}));
        order.forEach(function(oi){ var o=el("option",null,part.options[oi]); o.value=oi; sel.appendChild(o); });
        selects.push(sel);
        p.appendChild(sel);
        var sol=el("span","sol"); sol.dataset.for=bi; sol.style.display="none"; p.appendChild(sol);
      }
    });
    box.appendChild(p);
    return box;
  }

  function check(){
    if(checked) return; checked=true;
    var score=0;
    selects.forEach(function(sel){
      var ok=(sel.value!=="" && parseInt(sel.value)===parseInt(sel.dataset.correct));
      if(ok){ score++; sel.classList.add("ok"); }
      else{
        sel.classList.add("ko");
        var sol=sel.nextSibling;
        if(sol && sol.className==="sol"){
          var correctText=sel.querySelector('option[value="'+sel.dataset.correct+'"]').textContent;
          sol.textContent="✓ "+correctText; sol.style.display="inline-block";
        }
      }
      sel.disabled=true;
    });
    var pct=Math.round(score/selects.length*100);
    var best=parseInt(get("best_trou_"+(T.cle||T.titre))||"0"); if(score>best){best=score;save("best_trou_"+(T.cle||T.titre),String(best));}
    resHost.className="result-trou show";
    resHost.innerHTML='<div class="score">'+score+" / "+selects.length+' trous justes</div>'
      +'<div class="msg">'+(pct>=80?"Bravo 💪":pct>=50?"Presque — regarde les corrections vertes":"À revoir avec la fiche")+' · 🏆 meilleur : '+best+" / "+selects.length+'</div>';
    resHost.scrollIntoView({behavior:"smooth",block:"center"});
  }
  function reset(){ checked=false; start(); }

  function start(){
    root.innerHTML="";
    root.appendChild(header()); root.appendChild(tools());
    if(T.consigne) root.appendChild(el("div","consigne", T.consigne));
    root.appendChild(buildCloze());
    var act=el("div","actions"); act.style.display="flex"; act.style.gap="10px"; act.style.marginTop="16px";
    var bc=el("button",null,"✓ Vérifier"); bc.style.flex="1"; bc.onclick=check;
    var br=el("button","ghost","🔄 Recommencer"); br.onclick=reset;
    act.appendChild(bc); act.appendChild(br); root.appendChild(act);
    resHost=el("div","result-trou"); root.appendChild(resHost);
    if(get("fs"))setFs(get("fs")); if(get("dys")==="1")document.body.classList.add("dys");
  }

  ready(function(){ root=document.getElementById("exo"); if(root) start(); });
})();
