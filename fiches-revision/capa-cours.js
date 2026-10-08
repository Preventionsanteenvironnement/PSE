/* capa-cours.js — interactivité locale des COURS CAPa en auto-apprentissage.
   100 % côté navigateur : rien n'est envoyé, aucun code élève, aucune donnée personnelle,
   aucune dépendance réseau ni Firebase. Autonome et réversible.
   Gère : classer / relier / vrai-faux (bouton « Vérifier »), l'auto-évaluation notée,
   et le travail de l'élève : sauvegarde automatique sur l'appareil + Enregistrer / Reprendre en fichier JSON. */
(function () {
  "use strict";

  function feedback(el, ok, total) {
    var f = el.querySelector(".capa-feedback");
    if (!f) return;
    var msg = ok + " / " + total + " correct" + (ok > 1 ? "s" : "");
    if (ok === total) msg = "✅ Bravo, tout est juste ! (" + ok + "/" + total + ")";
    else msg = "🔁 " + msg + " — corrige les cases en rouge et réessaie.";
    f.textContent = msg;
  }

  // Mélange les options d'un <select> (sauf la 1re « — choisir — ») pour éviter l'ordre trivial.
  function shuffleSelect(sel) {
    var opts = Array.prototype.slice.call(sel.options, 1);
    for (var i = opts.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      if (i !== j) sel.insertBefore(opts[j], opts[i].nextSibling);
    }
  }

  function initClasserRelier(el) {
    el.querySelectorAll("select").forEach(shuffleSelect);
    var btn = el.querySelector(".capa-verifier");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var items = el.querySelectorAll("li"), ok = 0;
      items.forEach(function (li) {
        var sel = li.querySelector("select");
        var val = sel ? sel.value : "";
        var good = val !== "" && String(val) === String(li.getAttribute("data-sol"));
        li.classList.toggle("ok", good);
        li.classList.toggle("ko", !good);
        if (good) ok++;
      });
      feedback(el, ok, items.length);
    });
  }

  function initVraiFaux(el) {
    var btn = el.querySelector(".capa-verifier");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var items = el.querySelectorAll("li"), ok = 0;
      items.forEach(function (li) {
        var checked = li.querySelector("input:checked");
        var val = checked ? checked.value : "";
        var good = val !== "" && val === li.getAttribute("data-sol");
        li.classList.toggle("ok", good);
        li.classList.toggle("ko", !good);
        if (good) ok++;
      });
      feedback(el, ok, items.length);
    });
  }

  function initAutoEval(el) {
    var btn = el.querySelector(".capa-ae-valider");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var qs = el.querySelectorAll(".capa-ae-q");
      var scorables = 0, ok = 0;
      qs.forEach(function (q) {
        if (q.getAttribute("data-type") === "redige") return; // auto-correction impossible
        scorables++;
        var multi = q.getAttribute("data-multi") === "1";
        var good = true;
        q.querySelectorAll(".capa-ae-opt").forEach(function (opt) {
          var input = opt.querySelector("input");
          var isSol = opt.getAttribute("data-sol") === "1";
          var checked = input && input.checked;
          opt.classList.toggle("ok", isSol);
          opt.classList.toggle("ko", checked && !isSol);
          if (multi) { if (isSol !== !!checked) good = false; }
          else { if (isSol && !checked) good = false; if (!isSol && checked) good = false; }
        });
        if (good) ok++;
      });
      var scoreEl = el.querySelector(".capa-ae-score");
      var pct = scorables ? Math.round((ok / scorables) * 100) : 0;
      if (scoreEl) scoreEl.textContent = "Ton score : " + ok + " / " + scorables + "  (" + pct + " %)";
      // bande de remédiation adaptée
      var zone = el.querySelector(".capa-remed-zone");
      if (zone) {
        zone.hidden = false;
        var pick = pct < 45 ? "rouge" : (pct < 80 ? "orange" : "vert");
        zone.querySelectorAll(".capa-remed").forEach(function (r) {
          r.hidden = r.className.indexOf("capa-remed-" + pick) === -1;
        });
      }
    });
  }

  /* ---------- Travail de l'élève : sauvegarde automatique sur l'appareil + fichier JSON ---------- */
  var PAGE = (location.pathname.split("/").pop() || "cours").replace(/\.html?$/i, "");
  var CLE = "capa_cours_" + PAGE;
  var minuterie = null;

  // Champs de réponse du cours, dans l'ordre de la page (hors barre d'outils et réglages).
  function champs() {
    var racine = document.getElementById("fiche") || document.body;
    return Array.prototype.filter.call(racine.querySelectorAll("input, textarea, select"), function (el) {
      return el.type !== "file" && el.type !== "range" && !el.closest("#tools, #panel, .capa-travail");
    });
  }
  function recolter() {
    var d = {};
    champs().forEach(function (el, i) {
      var k = "c" + i;
      if (el.type === "checkbox" || el.type === "radio") { if (el.checked) d[k] = 1; }
      else if (el.value !== "") d[k] = el.value;
    });
    return d;
  }
  function appliquer(d) {
    champs().forEach(function (el, i) {
      var k = "c" + i;
      if (el.type === "checkbox" || el.type === "radio") el.checked = d[k] === 1;
      else el.value = d.hasOwnProperty(k) ? d[k] : "";
    });
  }
  function memoriser() {
    clearTimeout(minuterie);
    minuterie = setTimeout(function () {
      try { localStorage.setItem(CLE, JSON.stringify(recolter())); } catch (e) { /* stockage refusé */ }
    }, 300);
  }
  function sauverFichier() {
    var d = { type: "capa-cours", page: PAGE, titre: document.title, date: new Date().toISOString(), reponses: recolter() };
    var b = new Blob([JSON.stringify(d, null, 2)], { type: "application/json;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = "mon-travail-" + PAGE + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 400);
  }
  function reprendreFichier(champ) {
    var f = champ.files && champ.files[0];
    if (!f) return;
    var lec = new FileReader();
    lec.onload = function () {
      champ.value = "";
      var d;
      try { d = JSON.parse(lec.result); } catch (e) { alert("Ce fichier ne peut pas être lu."); return; }
      if (!d || d.type !== "capa-cours" || !d.reponses) { alert("Ce fichier ne contient pas de travail de cours."); return; }
      if (d.page !== PAGE) { alert("Ce fichier correspond à un autre cours" + (d.titre ? " : « " + d.titre + " »" : "") + "."); return; }
      appliquer(d.reponses); memoriser();
    };
    lec.onerror = function () { champ.value = ""; alert("Ce fichier ne peut pas être lu."); };
    lec.readAsText(f);
  }
  function initTravail() {
    var grp = document.createElement("div");
    grp.className = "grp capa-travail";
    grp.innerHTML = '<span class="lab">Travail</span>'
      + '<button type="button" class="mini ghost" id="bSauver" aria-label="Enregistrer le travail dans un fichier">💾 Enregistrer</button>'
      + '<button type="button" class="mini ghost" id="bReprendre" aria-label="Reprendre un travail enregistré">📂 Reprendre</button>'
      + '<input type="file" id="fReprendre" accept=".json,application/json" hidden>';
    var tools = document.getElementById("tools");
    if (tools) tools.appendChild(grp);
    else {
      grp.style.cssText = "display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:8px 0";
      var r = document.getElementById("fiche") || document.body;
      r.parentNode.insertBefore(grp, r);
    }
    document.getElementById("bSauver").addEventListener("click", sauverFichier);
    document.getElementById("bReprendre").addEventListener("click", function () { document.getElementById("fReprendre").click(); });
    document.getElementById("fReprendre").addEventListener("change", function () { reprendreFichier(this); });
    var racine = document.getElementById("fiche") || document.body;
    racine.addEventListener("input", memoriser);
    racine.addEventListener("change", memoriser);
    var mem = null;
    try { mem = JSON.parse(localStorage.getItem(CLE) || "null"); } catch (e) { mem = null; }
    if (mem) appliquer(mem);
  }

  function init() {
    document.querySelectorAll('.capa-activite[data-type="classer"], .capa-activite[data-type="relier"]').forEach(initClasserRelier);
    document.querySelectorAll('.capa-activite[data-type="vf"]').forEach(initVraiFaux);
    document.querySelectorAll('.capa-activite[data-type="autoeval"]').forEach(initAutoEval);
    initTravail();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
