/* classer.js — moteur « Classer / Trier » partagé (CAPa). Complète exo.css/classer.css.
   La page définit window.CLA = {
     titre, kicker, chips:[...], cle, consigne,
     categories:[ {id, label} ],
     items:[ {texte, cat:<id de la bonne catégorie>} ]
   }.
   Interaction mobile : on touche une carte (elle se sélectionne), puis une catégorie (elle s'y place).
   Bouton « Vérifier » → correction couleur + score ; « Recommencer » remélange. A+/A−, mode dys. */
(function(){
  "use strict";
  function ready(fn){ if(document.readyState!=="loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function el(t,c,h){ var e=document.createElement(t); if(c)e.className=c; if(h!=null)e.innerHTML=h; return e; }
  function save(k,v){ try{ localStorage.setItem("capa_exo_"+k,v); }catch(e){} }
  function get(k){ try{ return localStorage.getItem("capa_exo_"+k); }catch(e){ return null; } }
  function setFs(v){ document.documentElement.style.setProperty("--fs",v+"px"); save("fs",v); }
  function stepFs(d){ var c=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--fs"))||17; setFs(Math.max(15,Math.min(26,c+d))); }

  var C = window.CLA || { categories:[], items:[] };
  var root, pool, catHost, resHost, selected=null, checked=false;
  // placement[itemIndex] = catId ou null
  var placement=[];

  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }

  function header(){
    var h=el("header","hero");
    h.appendChild(el("div","kicker", C.kicker||"Exercice · CAPa"));
    h.appendChild(el("h1",null, C.titre||"Classer"));
    if(C.chips){ var c=el("div","chips"); C.chips.forEach(function(x){ c.appendChild(el("span","chip",x)); }); h.appendChild(c); }
    return h;
  }
  function tools(){
    var t=el("div","tools"); var g=el("div","grp"); g.appendChild(el("span","lab","Texte"));
    var bd=el("button","mini ghost","A−"); bd.onclick=function(){stepFs(-1);};
    var bu=el("button","mini ghost","A+"); bu.onclick=function(){stepFs(1);};
    var by=el("button","mini ghost","Dys"); by.onclick=function(){ document.body.classList.toggle("dys"); save("dys",document.body.classList.contains("dys")?"1":"0"); };
    g.appendChild(bd); g.appendChild(bu); g.appendChild(by); t.appendChild(g); return t;
  }

  function itemChip(i){
    var it=C.items[i];
    var b=el("button","chip-item"); b.dataset.i=i; b.textContent=it.texte;
    b.onclick=function(){ onItem(i,b); };
    return b;
  }

  function render(){
    checked=false; selected=null;
    // pool
    pool.innerHTML="";
    C._order.forEach(function(i){ if(placement[i]==null) pool.appendChild(itemChip(i)); });
    // catégories
    catHost.innerHTML="";
    C.categories.forEach(function(cat){
      var box=el("div","cat"); box.dataset.cat=cat.id;
      var head=el("h3",null,cat.label); head.onclick=function(){ onCat(cat.id,box); };
      box.appendChild(head);
      var drop=el("div","drop"); drop.onclick=function(){ onCat(cat.id,box); };
      C._order.forEach(function(i){ if(placement[i]===cat.id) drop.appendChild(itemChip(i)); });
      box.appendChild(drop); catHost.appendChild(box);
    });
    resHost.className="result-cla"; resHost.innerHTML="";
  }

  function onItem(i, btn){
    if(checked) return;
    if(placement[i]!=null){ // renvoyer au pool
      placement[i]=null; selected=null; render(); return;
    }
    if(selected===i){ selected=null; } else { selected=i; }
    document.querySelectorAll(".chip-item").forEach(function(b){ b.classList.toggle("sel", b.dataset.i==selected); });
    document.querySelectorAll(".cat").forEach(function(b){ b.classList.toggle("target", selected!=null); });
  }
  function onCat(catId){
    if(checked||selected==null) return;
    placement[selected]=catId; selected=null; render();
  }

  function check(){
    if(checked) return; checked=true;
    var score=0;
    C.items.forEach(function(it,i){
      if(placement[i]===it.cat){ score++; }
    });
    // colorer
    document.querySelectorAll(".chip-item").forEach(function(b){
      var i=+b.dataset.i, it=C.items[i];
      if(placement[i]==null){ return; }
      if(placement[i]===it.cat){ b.classList.add("ok"); }
      else{ b.classList.add("ko");
        var lab=(C.categories.filter(function(c){return c.id===it.cat;})[0]||{}).label||"";
        b.appendChild(el("span","corr","→ "+lab));
      }
    });
    document.querySelectorAll(".cat").forEach(function(b){ b.classList.remove("target"); });
    var n=C.items.length, pct=Math.round(score/n*100);
    var best=parseInt(get("best_"+(C.cle||C.titre))||"0"); if(score>best){best=score;save("best_"+(C.cle||C.titre),String(best));}
    resHost.className="result-cla show";
    resHost.innerHTML='<div class="score">'+score+" / "+n+' bien classés</div>'
      +'<div class="msg">'+(pct>=80?"Bravo 💪":pct>=50?"Presque, regarde les flèches rouges":"À revoir avec la fiche")+' · 🏆 meilleur : '+best+" / "+n+'</div>';
    resHost.scrollIntoView({behavior:"smooth",block:"center"});
  }

  function reset(){
    placement=C.items.map(function(){return null;});
    C._order=shuffle(C.items.map(function(_,i){return i;}));
    render();
  }

  ready(function(){
    root=document.getElementById("exo"); if(!root) return;
    root.appendChild(header()); root.appendChild(tools());
    if(C.consigne){ root.appendChild(el("div","consigne", C.consigne)); }
    root.appendChild(el("div","pool-title","À classer — touche une carte, puis une catégorie"));
    pool=el("div","pool"); root.appendChild(pool);
    catHost=el("div","cats"); root.appendChild(catHost);
    var act=el("div","actions");
    var bc=el("button","grow","✓ Vérifier"); bc.onclick=check;
    var br=el("button","ghost","🔄 Recommencer"); br.onclick=reset;
    act.appendChild(bc); act.appendChild(br); root.appendChild(act);
    resHost=el("div","result-cla"); root.appendChild(resHost);
    if(get("fs"))setFs(get("fs")); if(get("dys")==="1")document.body.classList.add("dys");
    reset();
  });
})();
