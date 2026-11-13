/* mapse.fr — mode audio commun (13/11/2026).
   Exigence de M. Mecheri : l'audio doit être disponible PARTOUT (consignes, questions, réponses,
   corrections) et c'est l'élève qui choisit de l'activer ou de le couper.

   - Un bouton « 🔊 Audio » toujours visible en bas à droite. Coupé par défaut ; le choix de l'élève
     est gardé sur l'appareil (localStorage), rien n'est envoyé, aucun compte.
   - Audio activé :
       · un texte (titre, consigne, question, explication) : un toucher le lit ;
       · une réponse, un bouton, une étiquette : le premier toucher la LIT, le deuxième la CHOISIT
         (comme VoiceOver), pour qu'un élève qui ne lit pas puisse écouter avant de répondre ;
       · au clavier (Tab), chaque élément est lu quand il reçoit le focus ; Entrée le choisit directement ;
       · les corrections et messages qui apparaissent après une réponse sont lus aussitôt.
   - Raccourci clavier : Alt + A active ou coupe l'audio.
   - La voix est celle de l'appareil (synthèse vocale du navigateur). Pause / Arrêter : bandeau de
     assets/audio-pause.js, chargé avant ce fichier sur les pages de jeux.
   Pose sur une page :  <script src="assets/audio-partout.js?v=1" defer></script>
   Une page peut marquer un élément : data-lire="texte à dire" (texte lu à la place du texte affiché),
   data-audio="non" (jamais lu ni intercepté), data-audio="texte" (lu, jamais intercepté). */
(function () {
  'use strict';
  if (window.__audioPartout) return;
  window.__audioPartout = true;
  var synth = window.speechSynthesis;
  if (!synth) return;

  var CLE = 'pse_audio_partout', actif = false, arme = null, armeA = 0, voix = null, dernierLu = '', dernierLuA = 0;
  try { actif = localStorage.getItem(CLE) === '1'; } catch (e) {}

  function choisirVoix() {
    var v = synth.getVoices().filter(function (x) { return /^fr/i.test(x.lang); });
    voix = v.filter(function (x) { return /fr[-_]FR/i.test(x.lang); })[0] || v[0] || null;
  }
  choisirVoix();
  if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', choisirVoix);

  /* ── Texte d'un élément ─────────────────────────────────────────────── */
  var EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;
  function nettoyer(t) {
    return String(t || '').replace(EMOJI, ' ').replace(/\s*[←→↑↓▶◀►◄•·]\s*/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function texteDe(el) {
    if (!el) return '';
    if (el.getAttribute('data-lire')) return nettoyer(el.getAttribute('data-lire'));
    var t = '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) {
      var lab = el.id && document.querySelector('label[for="' + el.id + '"]');
      t = (el.getAttribute('aria-label') || (lab && lab.innerText) || el.getAttribute('placeholder') || '');
      if (el.value && el.type !== 'password') t += ' — ' + el.value;
    } else if (el.getAttribute('aria-label') && nettoyer(el.getAttribute('aria-label')).length > 2) {
      /* le nom accessible prévu par la page passe avant le texte : il ne révèle pas une face cachée */
      t = el.getAttribute('aria-label');
    } else {
      t = el.innerText || el.textContent || '';
      if (!nettoyer(t)) t = el.getAttribute('aria-label') || el.getAttribute('title') || (el.querySelector('img[alt]') && el.querySelector('img[alt]').alt) || '';
    }
    t = nettoyer(t);
    if (el.getAttribute('aria-pressed') === 'true' || el.classList.contains('selected') || el.classList.contains('choisi')) t += ' (choisi)';
    return t;
  }

  /* ── Parole ─────────────────────────────────────────────────────────── */
  function dire(t, sansCouper) {
    t = nettoyer(t);
    if (!t) return;
    var now = Date.now();
    if (t === dernierLu && now - dernierLuA < 700) return;
    dernierLu = t; dernierLuA = now;
    if (!sansCouper) try { synth.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(t.length > 1800 ? t.slice(0, 1800) : t);
    u.lang = 'fr-FR'; u.rate = 0.95; if (voix) u.voice = voix;
    setTimeout(function () { try { synth.speak(u); } catch (e) {} }, sansCouper ? 0 : 40);
  }

  /* ── Ce qu'on touche ────────────────────────────────────────────────── */
  var INTERACTIF = 'button, a[href], [role="button"], [role="option"], [role="radio"], [role="checkbox"], [role="tab"], [role="link"], [role="switch"], label, summary, select, [draggable="true"], [tabindex]:not([tabindex="-1"]), [onclick]';
  var TEXTE = 'h1, h2, h3, h4, h5, p, li, td, th, dt, dd, figcaption, legend, blockquote, .consigne, .question, .enonce, .definition, .indice, .explication, .carte, .face, .situation, .doc, .note, .tuile';
  function estMoi(el) { return el && el.closest && el.closest('#audio-partout, [data-audio="non"]'); }
  function dansBandeauPause(el) {
    /* le bandeau Pause / Arrêter d'audio-pause.js (et la barre d'acces.js) : ses boutons marchent du premier coup, il n'est jamais lu */
    return !!(el && el.closest && el.closest('#audio-pause, .pse-acces, #pse-acces, [data-barre-audio]'));
  }
  function interactif(el) {
    var c = el.closest(INTERACTIF);
    if (c && c !== document.body) return c;
    /* éléments rendus cliquables par du script (cursor: pointer) */
    var x = el, n = 0;
    while (x && x !== document.body && n++ < 5) {
      try { if (getComputedStyle(x).cursor === 'pointer' && nettoyer(x.innerText)) return x; } catch (e) {}
      x = x.parentElement;
    }
    return null;
  }
  function blocTexte(el) {
    /* d'abord le plus petit bloc touché qui porte une phrase (pas toute la carte) */
    var x0 = el, k = 0;
    while (x0 && x0 !== document.body && k++ < 4) {
      var t0 = nettoyer(x0.innerText);
      if (t0.length >= 3) {
        var d = ''; try { d = getComputedStyle(x0).display; } catch (e) {}
        if (d !== 'inline' || t0.length > 40) return x0;
      }
      x0 = x0.parentElement;
    }
    var c = el.closest(TEXTE);
    if (c) return c;
    var x = el; while (x && x !== document.body && !nettoyer(x.innerText)) x = x.parentElement;
    return x && x !== document.body ? x : null;
  }
  function estBoutonEcoute(el) {
    /* les boutons 🔊 / Écouter / Pause déjà présents dans les pages : ils marchent du premier coup */
    var t = (el.innerText || '').trim();
    if (t.length > 30) return false;
    t += ' ' + (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || '');
    return /🔊|🔈|[ÉE]couter|^Lire\b|Pause|Arr[eê]ter|Reprendre/i.test(t);
  }

  function eclairer(el) {
    document.querySelectorAll('.ap-arme').forEach(function (x) { x.classList.remove('ap-arme'); });
    if (el) el.classList.add('ap-arme');
  }

  /* Toucher / clic */
  document.addEventListener('click', function (e) {
    if (!actif || !e.isTrusted) return;
    var cible = e.target && e.target.nodeType === 1 ? e.target : (e.target && e.target.parentElement);
    if (!cible || estMoi(cible) || dansBandeauPause(cible)) return;
    var i = interactif(cible);
    if (i) {
      if (estBoutonEcoute(i) || i.getAttribute('data-audio') === 'texte') return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(i.tagName) || i.closest('label') && i.closest('label').querySelector('input[type="text"],textarea')) { dire(texteDe(i)); return; }
      if (e.detail === 0) return;              /* Entrée ou Espace au clavier : déjà lu au focus, on choisit */
      var court = texteDe(i);
      if (court.length <= 2) { dire(court); return; }  /* une lettre (mots mêlés, mot mystère) : on la dit et on la joue tout de suite */
      if (arme === i && Date.now() - armeA < 12000) { arme = null; eclairer(null); return; } /* 2e toucher : on laisse choisir */
      e.preventDefault(); e.stopImmediatePropagation();
      arme = i; armeA = Date.now(); eclairer(i);
      dire(texteDe(i));
      return;
    }
    var b = blocTexte(cible);
    if (b) { arme = null; eclairer(b); dire(texteDe(b)); }
  }, true);
  /* Éléments qu'on fait glisser, cartes à balayer : la page gère elle-même le toucher et le « click »
     n'arrive pas toujours. On lit donc au toucher bref (sans déplacement) si aucun click ne suit. */
  var appui = null, clicVu = 0;
  document.addEventListener('click', function () { clicVu = Date.now(); }, true);
  document.addEventListener('pointerdown', function (e) {
    if (!actif || !e.isTrusted) return;
    appui = { el: e.target, x: e.clientX, y: e.clientY, t: Date.now() };
    var c = e.target && e.target.closest && e.target.closest('[draggable="true"]');
    if (c && !estMoi(c)) dire(texteDe(c));
  }, true);
  document.addEventListener('pointerup', function (e) {
    if (!actif || !e.isTrusted || !appui) return;
    var a = appui; appui = null;
    if (Date.now() - a.t > 600 || Math.abs(e.clientX - a.x) + Math.abs(e.clientY - a.y) > 12) return;
    var el = a.el && a.el.nodeType === 1 ? a.el : (a.el && a.el.parentElement);
    if (!el || estMoi(el) || dansBandeauPause(el)) return;
    setTimeout(function () {
      if (Date.now() - clicVu < 350) return;          /* le click est arrivé : déjà traité */
      var b = blocTexte(el); if (b) { eclairer(b); dire(texteDe(b)); }
    }, 320);
  }, true);

  /* Clavier : lire ce qui reçoit le focus (seulement quand l'élève se déplace au clavier :
     un focus donné par le jeu lui-même ne doit pas couper la lecture d'une correction) */
  var derniereTouche = 0;
  document.addEventListener('keydown', function (e) { if (e.key === 'Tab' || /^Arrow/.test(e.key)) derniereTouche = Date.now(); }, true);
  document.addEventListener('focusin', function (e) {
    if (!actif || Date.now() - derniereTouche > 800) return;
    var el = e.target;
    if (!el || estMoi(el) || dansBandeauPause(el) || el === document.body) return;
    dire(texteDe(el));
  });

  /* Corrections et messages qui apparaissent après une réponse */
  var RETOUR = /retour|feedback|resultat|résultat|correction|explication|verdict|bravo|message|score|bilan|reponse-juste|solution/i;
  function aLire(n) {
    if (!n || n.nodeType !== 1 || estMoi(n) || dansBandeauPause(n)) return null;
    var r = n.closest('[aria-live], [role="status"], [role="alert"]');
    if (r) return r;
    var x = n, k = 0;
    while (x && x !== document.body && k++ < 3) { if (RETOUR.test((x.id || '') + ' ' + (typeof x.className === 'string' ? x.className : ''))) return x; x = x.parentElement; }
    return null;
  }
  var enAttente = null, minuteur = 0;
  new MutationObserver(function (muts) {
    /* le moteur des jeux de mots lit déjà lui-même ses corrections : pas de double lecture */
    if (!actif || document.getElementById('aSwitch')) return;
    for (var k = 0; k < muts.length; k++) {
      var m = muts[k], n = m.type === 'characterData' ? m.target.parentElement : (m.addedNodes[0] && m.addedNodes[0].nodeType === 1 ? m.addedNodes[0] : m.target);
      var z = aLire(n);
      if (z && nettoyer(z.innerText) && z.offsetParent !== null) enAttente = z;
    }
    if (enAttente) { clearTimeout(minuteur); minuteur = setTimeout(function () { var z = enAttente; enAttente = null; if (z) dire(texteDe(z), true); }, 250); }
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  /* ── Le bouton ──────────────────────────────────────────────────────── */
  var st = document.createElement('style');
  st.textContent =
    '#audio-partout{position:fixed;bottom:16px;right:16px;z-index:2147483000;display:flex;align-items:center;gap:8px;' +
    'min-height:48px;padding:8px 16px;border-radius:999px;border:3px solid #0f172a;background:#fff;color:#0f172a;' +
    'font:700 17px/1.2 "Atkinson Hyperlegible",Verdana,system-ui,sans-serif;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.25)}' +
    '#audio-partout[aria-pressed="true"]{background:#0f172a;color:#fff;border-color:#facc15}' +
    '#audio-partout:focus-visible{outline:4px solid #facc15;outline-offset:3px}' +
    '#audio-partout .ap-ico{font-size:22px}' +
    '.ap-arme{outline:4px solid #f59e0b!important;outline-offset:2px!important;border-radius:6px}' +
    '@media (max-width:520px){#audio-partout{bottom:72px;right:10px;font-size:15px;padding:6px 12px}}' +
    '@media print{#audio-partout{display:none}}';
  document.head.appendChild(st);

  var bouton = document.createElement('button');
  bouton.type = 'button'; bouton.id = 'audio-partout';
  function maj() {
    bouton.setAttribute('aria-pressed', actif ? 'true' : 'false');
    bouton.innerHTML = '<span class="ap-ico" aria-hidden="true">' + (actif ? '🔊' : '🔈') + '</span><span>' + (actif ? 'Audio activé' : 'Activer l’audio') + '</span>';
    bouton.setAttribute('aria-label', actif ? 'Audio activé. Appuyer pour couper l’audio.' : 'Audio coupé. Appuyer pour activer l’audio.');
    bouton.title = 'Alt + A';
    document.documentElement.classList.toggle('audio-actif', actif);
  }
  /* Un seul bouton audio par page : les interrupteurs propres à certains jeux (moteur des jeux de mots,
     #aSwitch) sont cachés et suivent le bouton commun. */
  function synchroniser() {
    try { localStorage.setItem('mapse-jeux-audio', JSON.stringify(actif)); } catch (e) {}
    var s = document.getElementById('aSwitch');
    if (s) {
      s.style.display = 'none';
      if ((s.getAttribute('aria-pressed') === 'true') !== actif) s.click();
    }
  }
  function basculer() {
    actif = !actif;
    try { localStorage.setItem(CLE, actif ? '1' : '0'); } catch (e) {}
    arme = null; eclairer(null); maj(); synchroniser();
    try { synth.cancel(); } catch (e) {}
    if (actif) dire('Audio activé. Touche une fois un texte ou une réponse pour l’écouter. Touche une deuxième fois une réponse pour la choisir.');
    else { var u = new SpeechSynthesisUtterance('Audio coupé.'); u.lang = 'fr-FR'; if (voix) u.voice = voix; try { synth.speak(u); } catch (e) {} }
  }
  bouton.addEventListener('click', basculer);
  document.addEventListener('keydown', function (e) {
    if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'a' || e.key === 'A' || e.code === 'KeyA')) { e.preventDefault(); basculer(); }
    if (e.key === 'Escape' && actif) { try { synth.cancel(); } catch (x) {} arme = null; eclairer(null); }
  });
  function poser() { maj(); document.body.appendChild(bouton); synchroniser(); setTimeout(synchroniser, 600); }
  if (document.body) poser(); else document.addEventListener('DOMContentLoaded', poser);
})();
