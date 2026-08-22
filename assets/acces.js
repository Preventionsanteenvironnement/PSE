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
  // On ne lit ni la barre, ni la navigation, ni les boutons d'action : on lit
  // l'exercice. Les pages du site n'ont pas toutes le meme balisage, donc on
  // ne part pas d'une liste de classes mais du contenu affiche :
  //   1. si la page avance par etapes, on prend l'etape visible ;
  //   2. sinon, le conteneur principal ;
  //   3. dans les deux cas on retire ce qui n'est pas de l'exercice.
  var HORS_LECTURE = ".pse-acces, .pse-effacer, .pse-efface-dit, nav, .nav, .toolbar," +
                     " .barre-act, .btn, .breadcrumb, .fil, a.retour, script, style," +
                     " noscript, [aria-hidden=\"true\"]";
  var MINIMUM_EXCLU = ".pse-acces, .pse-effacer, .pse-efface-dit, script, style, noscript";
  var ETAPES = ".page, .screen, .etape, .slide";
  var BLOCS  = "p,li,td,th,h1,h2,h3,h4,h5,h6,button,label,summary,figcaption,div,section";

  function visible(el) {
    if (el.hidden) return false;
    if (!el.offsetParent && el.offsetHeight === 0) return false;   // ignore le cache
    return true;
  }

  // Une page a etapes ne se lit pas en entier : seule l'etape affichee compte.
  function scenePrincipale() {
    var etapes = document.querySelectorAll(ETAPES);
    if (etapes.length > 1) {
      var vus = [], caches = 0;
      for (var i = 0; i < etapes.length; i++) {
        if (visible(etapes[i])) vus.push(etapes[i]); else caches++;
      }
      if (caches > 0 && vus.length === 1) return vus[0];
    }
    // Sinon : le plus petit conteneur qui porte l'essentiel du texte affiche.
    // On ne se fie pas au nom de la classe — « zone » ou « wrap » designent une
    // chose differente d'une page a l'autre — mais a ce qu'il contient vraiment.
    var total = (document.body.innerText || "").trim().length;
    var choisi = document.body, taille = total;
    ["#fiche", "main", ".zone", ".wrap", ".container"].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!visible(el)) return;
        var t = (el.innerText || "").trim().length;
        if (t >= total * 0.6 && t < taille) { choisi = el; taille = t; }
      });
    });
    return choisi;
  }

  function recolter(racine, exclus) {
    var blocs = [], dernier = null;
    var marche = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p || p.closest(exclus)) return NodeFilter.FILTER_REJECT;
        if (!visible(p)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = marche.nextNode())) {
      var b = n.parentElement.closest(BLOCS) || n.parentElement;
      if (b !== dernier) { blocs.push(""); dernier = b; }
      var t = n.nodeValue.trim();
      blocs[blocs.length - 1] += (blocs[blocs.length - 1] ? " " : "") + t;
    }
    var texte = blocs.filter(function (x) { return x; }).join(". ");
    return texte.replace(/\s+/g, " ").replace(/\.\s*\./g, ".").trim();
  }

  function texteParDefaut() {
    var racine = scenePrincipale();
    if (!racine) return "";
    var t = recolter(racine, HORS_LECTURE);
    // Une page dont tout le contenu affiche tient dans des boutons (ecran
    // d'accueil, « C'est parti ! ») donnerait un texte vide : on relit alors
    // sans ecarter les boutons, plutot que de rester muet.
    if (!t) t = recolter(racine, MINIMUM_EXCLU);
    return t;
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

  // ── Les retours doivent s'entendre, pas seulement se voir ───────────
  // Une correction qui apparait en vert, un score qui s'affiche : a l'ecran
  // c'est evident, pour un lecteur d'ecran cela peut passer inapercu. On
  // declare ces zones « live » une fois pour toutes, quelle que soit la
  // famille de page.
  var ZONES_RETOUR = ".fb, .corrige, .correction, .correction-box, .feedback," +
                     " .score-box, .bilan-score, .score-value," +
                     " #feedback, #fb, .msg, .result, .resultat";
  // Ce qui se comporte comme une proposition a cocher : l'etat « choisi » est
  // aujourd'hui porte par une classe et une couleur, on le recopie dans
  // aria-pressed. Certaines de ces propositions sont des div fabriquees en
  // JavaScript, pas des boutons : elles sont d'abord equipees ci-dessous.
  var PROPOSITIONS = ".opt, .option, .answer-option, .vf-option, .item-label," +
                     " .option-card, .prev-option, .mitem, .dock-item, .quiz-btn," +
                     " .final-opt-btn, .response-card, .choice, .token, .chip," +
                     " .cardItem, .draggable-item, .item, .scale-btn";
  var MARQUES = ["choisi", "selected", "active", "selectionne", "chosen", "checked",
                 "sel", "is-selected", "pris"];
  // Ce que le navigateur rend deja utilisable au clavier : on n'y touche pas.
  var DEJA_INTERACTIF = "button, a[href], input, select, textarea, summary, label," +
                        " [role], [contenteditable]";

  // « Choisi » s'ecrit differemment d'une page a l'autre : une classe ici, un
  // data-selected la. On regarde les deux plutot que d'imposer une convention.
  function estChoisi(el) {
    for (var i = 0; i < MARQUES.length; i++) if (el.classList.contains(MARQUES[i])) return true;
    if (el.dataset && el.dataset.selected === "true") return true;
    if (el.getAttribute("aria-selected") === "true") return true;
    return false;
  }

  // Une div cliquable n'existe pas pour le clavier ni pour un lecteur d'ecran :
  // elle n'est ni annoncee comme un controle, ni atteignable par Tab. Deux
  // indices la trahissent : un gestionnaire de clic pose en attribut ou en
  // propriete, ou — et c'est le cas le plus courant, parce qu'un clic branche
  // par addEventListener est invisible depuis l'exterieur — le fait que la
  // page lui donne un curseur de main. On lui donne alors ce qui lui manque,
  // sans changer ce qu'elle fait.
  // Troisieme indice, pour les cas que les deux premiers ne voient pas : un
  // clic branche par addEventListener sur un element sans curseur de main.
  // Rien, depuis l'exterieur, ne permet de le deviner — d'ou cette liste des
  // pieces manipulables du site. Le banc de test outils/verif-clavier.html
  // signale toute piece interactive qui resterait hors clavier : c'est lui qui
  // empeche cette liste de vieillir en silence.
  // Deux tiroirs, parce que deux noms de classe n'ont pas la meme valeur de
  // preuve. Ceux du premier ne servent qu'a manipuler : les voir suffit.
  var PIECES = ".token, .slot, .item-label, .cardItem, .drop, .drop-slot," +
               " .drop-zone, .dropzone, .pad-slot, .prev-drop-zone, .prev-zone," +
               " .prev-option, .option-card, .mitem, .dock-item, .quiz-btn," +
               " .final-opt-btn, .response-card, .draggable-item";
  // Les autres noms — chip, zone, item, tag, choice — servent aussi a decorer :
  // « chip » est une etiquette qu'on deplace ici, une pastille de titre
  // ailleurs, et « zone » designe parfois le cadre de toute la page. Ceux-la
  // ne sont equipes que si la page les traite vraiment comme des controles :
  // un clic branche, un draggable, ou un curseur de main.

  function semblleInteractif(el) {
    if (el.onclick || el.hasAttribute("onclick")) return true;
    if (el.draggable) return true;
    if (el.matches(PIECES)) return true;
    try { return getComputedStyle(el).cursor === "pointer"; } catch (e) { return false; }
  }

  function equiperCliquables(racine) {
    var tous = (racine || document).querySelectorAll("div, li, span, td, p, section, article");
    [].slice.call(tous).forEach(function (el) {
      if (el.dataset.pseClavier) return;
      if (el.matches(DEJA_INTERACTIF) || el.closest(".pse-acces")) return;
      // Un conteneur cliquable qui renferme d'autres controles n'est pas un
      // bouton : le declarer ainsi ajouterait un arret de tabulation inutile.
      if (el.querySelector("button, a[href], input, select, textarea, [onclick], [role='button']")) return;
      if (!semblleInteractif(el)) return;
      el.setAttribute("role", "button");
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
      el.dataset.pseClavier = "1";
    });
  }

  // Un seul ecouteur, pose sur le document et non sur chaque piece. Deux
  // raisons : la touche ne s'applique qu'a l'element reellement vise, donc une
  // piece posee dans une zone n'active plus la zone en remontant ; et comme il
  // s'execute apres les ecouteurs de la page, il se tait si la page a deja
  // traite la touche — sans quoi les deux activations s'annuleraient.
  function clavierPartage() {
    var aClique = false;
    // Phase de capture : on ouvre l'observation avant que la page ne reagisse.
    document.addEventListener("keydown", function () { aClique = false; }, true);
    document.addEventListener("click", function () { aClique = true; }, true);
    // Phase de remontee : tous les ecouteurs de la page ont deja tourne. Si
    // l'un d'eux a declenche le clic, on se tait — deux activations
    // s'annuleraient. S'il n'a rien fait, on active. On se fie a ce qui s'est
    // reellement passe, pas a un preventDefault qui ne prouve rien.
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      var el = e.target;
      if (!el || !el.dataset || el.dataset.pseClavier !== "1") return;
      e.preventDefault();
      if (aClique) return;
      el.click();
    });
  }

  var suiviEtat = null;
  function suivreLesChoix(racine) {
    var choix = [].slice.call((racine || document).querySelectorAll(PROPOSITIONS))
      .filter(function (b) { return b.tagName === "BUTTON" || b.getAttribute("role") === "button"; });
    choix.forEach(function (b) {
      if (!b.hasAttribute("aria-pressed")) b.setAttribute("aria-pressed", estChoisi(b) ? "true" : "false");
      if (!suiviEtat) return;
      suiviEtat.observe(b, { attributes: true, attributeFilter: ["class", "data-selected", "aria-selected"] });
    });
  }

  function annoncerLesRetours(racine) {
    (racine || document).querySelectorAll(ZONES_RETOUR).forEach(function (z) {
      if (!z.hasAttribute("role")) z.setAttribute("role", "status");
      if (!z.hasAttribute("aria-live")) z.setAttribute("aria-live", "polite");
    });
    equiperCliquables(racine);
    if (window.MutationObserver && !suiviEtat) {
      suiviEtat = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          m.target.setAttribute("aria-pressed", estChoisi(m.target) ? "true" : "false");
        });
      });
    }
    suivreLesChoix(racine);
  }

  // Les exercices « pad » fabriquent leurs propositions au fil des etapes :
  // ce qui apparait plus tard doit etre equipe comme le reste.
  function surveillerLesAjouts() {
    if (!window.MutationObserver) return;
    var enAttente = false;
    new MutationObserver(function () {
      if (enAttente) return;
      enAttente = true;
      setTimeout(function () { enAttente = false; annoncerLesRetours(); }, 120);
    }).observe(document.body, { childList: true, subtree: true });
  }

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

  function demarrer() { poser(); clavierPartage(); annoncerLesRetours(); surveillerLesAjouts(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer);
  else demarrer();

  window.pseAcces = { ecouter: ecouter, pause: pause, arreter: arreter, taille: taille, modeLisible: modeLisible };
})();
