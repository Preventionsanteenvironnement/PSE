/* capa-cours.js — interactivité locale des COURS CAPa en auto-apprentissage.
   100 % côté navigateur : rien n'est envoyé, aucun code élève, aucune donnée personnelle,
   aucune dépendance réseau ni Firebase. Autonome et réversible.
   Gère : classer / relier / vrai-faux (bouton « Vérifier ») et l'auto-évaluation notée. */
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

  function init() {
    document.querySelectorAll('.capa-activite[data-type="classer"], .capa-activite[data-type="relier"]').forEach(initClasserRelier);
    document.querySelectorAll('.capa-activite[data-type="vf"]').forEach(initVraiFaux);
    document.querySelectorAll('.capa-activite[data-type="autoeval"]').forEach(initAutoEval);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
