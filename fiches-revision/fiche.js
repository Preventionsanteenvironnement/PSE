/* fiche.js — barre d'accessibilité + audio partagée des fiches de révision CAPa.
   Injecte la barre d'outils et le panneau de réglages en haut de .wrap (avant #fiche),
   gère : lecture vocale fr-FR (pause/reprise/stop), taille du texte, interligne, mode dys,
   contraste élevé, fond teinté, vitesse de voix. Les préférences sont mémorisées (localStorage).
   Chaque fiche n'a besoin que de : <link fiche.css> + <script src="fiche.js"> + un conteneur #fiche. */
(function(){
  "use strict";
  var synth = window.speechSynthesis, audioState="idle", queue=[], qi=0, voiceRate=0.95;

  function chunk(t){var o=[],b="";t.split(/\s+/).forEach(function(w){if((b+" "+w).trim().length>170){o.push(b.trim());b=w;}else{b=b?b+" "+w:w;}});if(b.trim())o.push(b.trim());return o.length?o:[t];}
  function ficheText(){var f=document.getElementById("fiche");return (f?f.innerText:document.body.innerText).replace(/\s+/g," ").trim();}
  function updAudio(){var l=document.getElementById("bListen"),p=document.getElementById("bPause"),s=document.getElementById("bStop");if(!l)return;
    if(audioState==="playing"){l.textContent="▶️ Lire";l.disabled=true;p.disabled=false;s.disabled=false;}
    else if(audioState==="paused"){l.textContent="▶️ Reprendre";l.disabled=false;p.disabled=true;s.disabled=false;}
    else{l.textContent="▶️ Lire";l.disabled=false;p.disabled=true;s.disabled=true;}}
  function speakFrom(i){if(i>=queue.length){audioState="idle";updAudio();return;}qi=i;var u=queue[i];u.lang="fr-FR";u.rate=voiceRate;u.onend=function(){if(audioState==="playing")speakFrom(qi+1);};synth.speak(u);}
  function listen(){if(!("speechSynthesis"in window)){alert("Lecture vocale indisponible sur ce navigateur.");return;}
    if(audioState==="paused"){synth.resume();audioState="playing";updAudio();return;}
    if(audioState==="playing")return;
    synth.cancel();queue=chunk(ficheText()).map(function(t){return new SpeechSynthesisUtterance(t);});audioState="playing";updAudio();speakFrom(0);}
  function pauseAudio(){if(audioState==="playing"){synth.pause();audioState="paused";updAudio();}}
  function stopAudio(){if(synth)synth.cancel();audioState="idle";qi=0;updAudio();}
  window.addEventListener("beforeunload",function(){if(synth)synth.cancel();});

  function save(k,v){try{localStorage.setItem("capa_fiche_"+k,v);}catch(e){}}
  function get(k){try{return localStorage.getItem("capa_fiche_"+k);}catch(e){return null;}}
  function setFs(v){document.documentElement.style.setProperty("--fs",v+"px");var e=document.getElementById("vFs");if(e)e.textContent=v+"px";var r=document.getElementById("rFs");if(r)r.value=v;save("fs",v);}
  function stepFs(d){var cur=parseInt(getComputedStyle(document.documentElement).getPropertyValue("--fs"))||17;setFs(Math.max(15,Math.min(26,cur+d)));}
  function setLh(v){document.documentElement.style.setProperty("--lh",v);var e=document.getElementById("vLh");if(e)e.textContent=(+v).toFixed(2);var r=document.getElementById("rLh");if(r)r.value=v;save("lh",v);}
  function setRate(v){voiceRate=+v;var e=document.getElementById("vRate");if(e)e.textContent=(+v).toFixed(2)+"×";var r=document.getElementById("rRate");if(r)r.value=v;save("rate",v);}
  function toggleDys(){var on=document.body.classList.toggle("dys");var b=document.getElementById("bDys");if(b)b.classList.toggle("ghost",!on);save("dys",on?"1":"0");}
  function toggleContrast(){var on=document.body.classList.toggle("contrast");var b=document.getElementById("bContrast");if(b)b.textContent=on?"Désactiver":"Activer";save("contrast",on?"1":"0");}
  function setTint(t){document.body.classList.remove("tint-creme","tint-bleu");if(t)document.body.classList.add(t);
    document.querySelectorAll(".swatch").forEach(function(b){b.classList.toggle("on",(b.getAttribute("data-t")||"")===t);});save("tint",t);}
  function togglePanel(){document.getElementById("panel").classList.toggle("open");}

  // expose (au cas où on veut appeler depuis la page)
  window.ficheUI = {listen:listen,pauseAudio:pauseAudio,stopAudio:stopAudio,stepFs:stepFs,setFs:setFs,setLh:setLh,setRate:setRate,toggleDys:toggleDys,toggleContrast:toggleContrast,setTint:setTint,togglePanel:togglePanel};

  var TOOLS =
    '<div class="tools" id="tools">'
    + '<div class="grp"><span class="lab">Écouter</span>'
    +   '<button class="mini" id="bListen">▶️ Lire</button>'
    +   '<button class="mini ghost" id="bPause" disabled>⏸️</button>'
    +   '<button class="mini ghost" id="bStop" disabled>⏹️</button></div>'
    + '<div class="grp"><span class="lab">Texte</span>'
    +   '<button class="mini ghost" id="bFsDown">A−</button>'
    +   '<button class="mini ghost" id="bFsUp">A+</button>'
    +   '<button class="mini ghost" id="bDys">Dys</button></div>'
    + '<button class="mini ghost" id="bMore">⚙️ Plus</button>'
    + '</div>'
    + '<div id="panel" class="panel">'
    +   '<div class="row"><label>Taille du texte</label><input type="range" id="rFs" min="15" max="26" value="17"><span id="vFs">17px</span></div>'
    +   '<div class="row"><label>Interligne</label><input type="range" id="rLh" min="1.4" max="2.1" step="0.05" value="1.6"><span id="vLh">1.60</span></div>'
    +   '<div class="row"><label>Vitesse voix</label><input type="range" id="rRate" min="0.6" max="1.2" step="0.05" value="0.95"><span id="vRate">0.95×</span></div>'
    +   '<div class="row"><label>Contraste élevé</label><button class="ghost mini" id="bContrast">Activer</button></div>'
    +   '<div class="row"><label>Couleur de fond</label>'
    +     '<button class="swatch on" style="background:#eef0ec" data-t=""></button>'
    +     '<button class="swatch" style="background:#efe7d4" data-t="tint-creme"></button>'
    +     '<button class="swatch" style="background:#e3ecf6" data-t="tint-bleu"></button></div>'
    + '</div>';

  function init(){
    var wrap = document.querySelector(".wrap"); if(!wrap) return;
    var holder = document.createElement("div"); holder.innerHTML = TOOLS;
    var tools = holder.querySelector("#tools"), panel = holder.querySelector("#panel");
    // insérer en tête de .wrap, dans l'ordre : barre d'outils puis panneau
    wrap.insertBefore(panel, wrap.firstChild);
    wrap.insertBefore(tools, wrap.firstChild);

    document.getElementById("bListen").addEventListener("click", listen);
    document.getElementById("bPause").addEventListener("click", pauseAudio);
    document.getElementById("bStop").addEventListener("click", stopAudio);
    document.getElementById("bFsDown").addEventListener("click", function(){stepFs(-1);});
    document.getElementById("bFsUp").addEventListener("click", function(){stepFs(1);});
    document.getElementById("bDys").addEventListener("click", toggleDys);
    document.getElementById("bMore").addEventListener("click", togglePanel);
    document.getElementById("bContrast").addEventListener("click", toggleContrast);
    document.getElementById("rFs").addEventListener("input", function(){setFs(this.value);});
    document.getElementById("rLh").addEventListener("input", function(){setLh(this.value);});
    document.getElementById("rRate").addEventListener("input", function(){setRate(this.value);});
    document.querySelectorAll(".swatch").forEach(function(b){b.addEventListener("click", function(){setTint(b.getAttribute("data-t")||"");});});

    // restaurer préférences
    if(get("fs"))setFs(get("fs")); if(get("lh"))setLh(get("lh")); if(get("rate"))setRate(get("rate"));
    if(get("dys")==="1")document.body.classList.add("dys"); if(get("contrast")==="1")toggleContrast(); if(get("tint"))setTint(get("tint"));
  }

  if(document.readyState!=="loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
