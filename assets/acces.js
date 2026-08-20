/* acces.js — barre d'accessibilite partagee : ecouter / pause / arreter,
   taille du texte, mode lisible.

   100 % cote navigateur : la voix est celle du systeme, rien n'est envoye,
   aucun service exterieur, aucune donnee personnelle. Les preferences sont
   gardees en local et retrouvees d'une page a l'autre.

   Pose sur une page :  <link rel="stylesheet" href="assets/acces.css">
                        <script src="assets/acces.js" defer></script>

   Pour choisir ce que le bouton « Ecouter » lit, definir AVANT le script :
     window.PSE_ACCES_LIRE = function () { return "le texte a lire"; };
   Sans cela, la barre lit le contenu principal visible de la page. */
(function () {
  "use strict";

  var synth = window.speechSynthesis;
  var etat = "arret";           // arret | lecture | pause
  var morceaux = [], indice = 0, vitesse = 0.95;

  // ── Preferences ────────────────────────────────────────────────────────
  function lire(k, def) { try { var v = localStorage.getItem("pse_acces_" + k); return v === null ? def : v; } catch (e) { return def; } }
  function garder(k, v) { try { localStorage.setItem("pse_acces_" + k, v); } catch (e) {} }

  // ── Texte a lire ───────────────────────────────────────────────────────
  // Par defaut : le document affiche, la question, puis les propositions.
  function texteParDefaut() {
    var bouts = [];
    function prendre(sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.offsetParent && el.offsetHeight === 0) return;   // ignore le cache
        var t = (el.innerText || el.textContent || "").trim();
        if (t) bouts.push(t);
      });
    }
    prendre("#doc-container .doc-display");
    prendre(".q-text");
    prendre(".answer-option, .vf-option, .ord-text");
    if (!bouts.length) {
      var p = document.getElementById("fiche") || document.querySelector("main") || document.body;
      bouts.push((p.innerText || "").trim());
    }
    return bouts.join(". ").replace(/\s+/g, " ").trim();
  }
  function texteACaler() {
    try {
      if (typeof window.PSE_ACCES_LIRE === "function") return String(window.PSE_ACCES_LIRE() || "");
    } catch (e) {}
    return texteParDefaut();
  }

  // La synthese vocale cale sur les textes trop longs : on decoupe en phrases courtes.
  function decouper(t) {
    var out = [], buf = "";
    t.split(/\s+/).forEach(function (m) {
      if ((buf + " " + m).trim().length > 170) { out.push(buf.trim()); buf = m; }
      else { buf = buf ? buf + " " + m : m; }
    });
    if (buf.trim()) out.push(buf.trim());
    return out.length ? out : [t];
  }

  // ── Lecture ────────────────────────────────────────────────────────────
  function direDepuis(i) {
    if (i >= morceaux.length) { etat = "arret"; majBoutons(); return; }
    indice = i;
    var u = morceaux[i];
    u.lang = "fr-FR";
    u.rate = vitesse;
    u.onend = function () { if (etat === "lecture") direDepuis(indice + 1); };
    synth.speak(u);
  }
  function ecouter() {
    if (!("speechSynthesis" in window)) { alert("La lecture a voix haute n'est pas disponible sur ce navigateur."); return; }
    if (etat === "pause") { synth.resume(); etat = "lecture"; majBoutons(); return; }
    if (etat === "lecture") return;
    var t = texteACaler();
    if (!t) return;
    synth.cancel();
    morceaux = decouper(t).map(function (x) { return new SpeechSynthesisUtterance(x); });
    etat = "lecture"; majBoutons(); direDepuis(0);
  }
  function pause() { if (etat === "lecture") { synth.pause(); etat = "pause"; majBoutons(); } }
  function arreter() { if (synth) synth.cancel(); etat = "arret"; indice = 0; majBoutons(); }
  window.addEventListener("beforeunload", function () { if (synth) synth.cancel(); });

  // ── Taille du texte et mode lisible ────────────────────────────────────
  function taille(v) {
    v = Math.max(1, Math.min(1.8, Math.round(v * 20) / 20));
    document.documentElement.style.setProperty("--pse-fs", String(v));
    // Agrandir la racine : toutes les tailles en rem de la page suivent.
    document.documentElement.style.fontSize = (16 * v) + "px";
    garder("fs", v);
    var e = document.getElementById("pseEtat");
    if (e) e.textContent = v === 1 ? "" : "texte " + Math.round(v * 100) + " %";
    return v;
  }
  function pasTaille(d) {
    var cur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--pse-fs")) || 1;
    taille(cur + d);
  }
  function modeLisible(force) {
    var on = typeof force === "boolean" ? force : !document.body.classList.contains("pse-dys");
    document.body.classList.toggle("pse-dys", on);
    var b = document.getElementById("pseDys");
    if (b) { b.classList.toggle("pse-on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); }
    garder("dys", on ? "1" : "0");
  }

  function majBoutons() {
    var l = document.getElementById("pseLire"), p = document.getElementById("psePause"), s = document.getElementById("pseStop");
    if (!l) return;
    l.innerHTML = etat === "pause"
      ? '▶️ <span class="pse-mot">Reprendre</span>'
      : '🔊 <span class="pse-mot">Écouter</span>';
    l.disabled = (etat === "lecture");
    p.disabled = (etat !== "lecture");
    s.disabled = (etat === "arret");
  }

  // ── Construction de la barre ───────────────────────────────────────────
  function poser() {
    if (document.querySelector(".pse-acces")) return;
    document.body.classList.add("pse-acces-on");

    var bar = document.createElement("div");
    bar.className = "pse-acces";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Outils de lecture");
    bar.innerHTML =
      '<span class="pse-lab">LECTURE</span>' +
      '<button id="pseLire" type="button" aria-label="Écouter la question">🔊 <span class="pse-mot">Écouter</span></button>' +
      '<button id="psePause" type="button" aria-label="Mettre la lecture en pause">⏸️ <span class="pse-mot">Pause</span></button>' +
      '<button id="pseStop" type="button" aria-label="Arrêter la lecture">⏹️</button>' +
      '<span class="pse-sep"></span>' +
      '<span class="pse-lab">TEXTE</span>' +
      '<button id="pseMoins" type="button" aria-label="Réduire la taille du texte">A−</button>' +
      '<button id="psePlus" type="button" aria-label="Agrandir la taille du texte">A+</button>' +
      '<button id="pseDys" type="button" aria-pressed="false" title="Police plus lisible et texte plus espacé">Dys</button>' +
      '<span class="pse-etat" id="pseEtat"></span>';
    document.body.insertBefore(bar, document.body.firstChild);

    document.getElementById("pseLire").addEventListener("click", ecouter);
    document.getElementById("psePause").addEventListener("click", pause);
    document.getElementById("pseStop").addEventListener("click", arreter);
    document.getElementById("pseMoins").addEventListener("click", function () { pasTaille(-0.1); });
    document.getElementById("psePlus").addEventListener("click", function () { pasTaille(0.1); });
    document.getElementById("pseDys").addEventListener("click", function () { modeLisible(); });

    taille(parseFloat(lire("fs", "1")) || 1);
    modeLisible(lire("dys", "0") === "1");
    majBoutons();
    majHauteur();
  }

  // La barre peut passer sur deux lignes selon la largeur : on mesure sa hauteur
  // reelle et on decale le contenu d'autant, plutot que de figer une valeur.
  function majHauteur() {
    var b = document.querySelector(".pse-acces");
    if (!b) return;
    var h = Math.ceil(b.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty("--pse-bar", h + "px");
  }
  window.addEventListener("resize", majHauteur);
  window.addEventListener("orientationchange", function () { setTimeout(majHauteur, 150); });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", poser);
  else poser();

  window.pseAcces = { ecouter: ecouter, pause: pause, arreter: arreter, taille: taille, modeLisible: modeLisible };
})();
