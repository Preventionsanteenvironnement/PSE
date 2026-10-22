/* mapse.fr — commande de lecture audio commune (11/10/2026, version 2 du 21/10/2026).
   Dès qu'une page lit un texte à voix haute, un bandeau apparaît en bas de l'écran : Pause / Reprendre et Arrêter.
   La lecture ne démarre jamais seule : une voix lancée sans geste de l'élève est ignorée.
   Version 2 :
   - tout texte est lu phrase par phrase : la pause est une vraie pause sur tous les appareils, Android compris
     (Android ne sait pas mettre la voix en pause : on arrête la phrase en cours et on la reprend au même endroit) ;
     les boutons Pause des pages (barre d'accessibilité, CPS) en profitent aussi ;
   - la ligne, la proposition ou le paragraphe en train d'être lu s'éclaire.
   Les pages qui ont déjà leur propre lecteur (cours en autonomie) ne chargent pas ce fichier. */
(function () {
  'use strict';
  if (!('speechSynthesis' in window) || window.__audioPause) return;
  window.__audioPause = true;
  var synth = window.speechSynthesis, barre = null, etat = '';
  var natif = {
    speak: synth.speak.bind(synth), cancel: synth.cancel.bind(synth),
    pause: synth.pause.bind(synth), resume: synth.resume.bind(synth)
  };
  function getNatif(nom) {
    var d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(synth), nom);
    return function () { return d && d.get ? d.get.call(synth) : false; };
  }
  var natifParle = getNatif('speaking'), natifAttente = getNatif('pending');

  /* 1. Jamais de voix qui démarre seule : une lecture n'est acceptée que juste après un geste de l'élève
        (clic, touche, appui), ou comme suite immédiate d'une lecture déjà acceptée (texte lu en plusieurs morceaux). */
  var dernierGeste = 0, finAcceptee = 0, cibleGeste = null, DELAI_GESTE = 1500, DELAI_SUITE = 600;
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'click', 'drop', 'dragend', 'change'].forEach(function (t) {
    window.addEventListener(t, function (ev) {
      if (ev.isTrusted === false) return;
      dernierGeste = Date.now();
      var c = ev.target && ev.target.nodeType === 1 ? ev.target : (ev.target && ev.target.parentElement);
      if (c && !(barre && barre.contains(c))) cibleGeste = c;
    }, true);
  });

  /* 2. File de lecture : chaque texte est découpé en phrases, dites l'une après l'autre. */
  var file = [], lecture = 'arret', jeton = 0, courant = null;   // lecture : arret | lecture | pause
  function decouper(t) {
    var out = [];
    (String(t).match(/[^.!?;:]+[.!?;:]*/g) || [String(t)]).forEach(function (p) {
      p = p.trim();
      while (p.length > 200) {
        var k = p.lastIndexOf(',', 200); if (k < 60) k = p.lastIndexOf(' ', 200); if (k < 1) k = 200;
        out.push(p.slice(0, k + 1)); p = p.slice(k + 1).trim();
      }
      if (!p) return;
      /* une liste de mots (« le bruit, la surdité, le stress ») : un mot à la fois, pour éclairer chacun */
      var l = p.split(/,\s+/);
      if (l.length >= 3 && l.every(function (x) { return x.length <= 45 && seulALEcran(x); })) l.forEach(function (x, i) { out.push(i < l.length - 1 ? x + ',' : x); });
      else out.push(p);
    });
    return out.length ? out : [String(t)];
  }
  function signaler(u, type) {
    try { var e = new Event(type); e.utterance = u; if (type === 'error') e.error = 'interrupted'; u.dispatchEvent(e); } catch (x) {}
  }
  function suivant() {
    var j = ++jeton;
    if (lecture !== 'lecture') return;
    var m = file[0];
    if (!m) { finir(); return; }
    var src = m.src;
    if (!m.debutSignale) { m.debutSignale = true; if (m.premier) signaler(src, 'start'); }
    eclairer(m);
    var u = new SpeechSynthesisUtterance(m.t);
    ['lang', 'voice', 'rate', 'pitch', 'volume'].forEach(function (k) { try { if (src[k] != null && src[k] !== '') u[k] = src[k]; } catch (x) {} });
    u.onend = function () {
      if (j !== jeton || lecture !== 'lecture') return;
      file.shift();
      if (m.dernier) { finAcceptee = Date.now(); signaler(src, 'end'); }
      suivant();
    };
    u.onerror = function (ev) {
      if (j !== jeton || lecture !== 'lecture') return;
      if (ev && (ev.error === 'interrupted' || ev.error === 'canceled')) return;
      file.shift(); if (m.dernier) signaler(src, 'end');
      suivant();
    };
    courant = u;
    natif.speak(u);
  }
  function finir() {
    lecture = 'arret'; courant = null; eteindre(); maj();
  }
  function vider(signalerErreur) {
    var sources = [];
    file.forEach(function (m) { if (sources.indexOf(m.src) < 0) sources.push(m.src); });
    file = []; jeton++; courant = null; lecture = 'arret';
    natif.cancel();
    eteindre();
    if (signalerErreur) setTimeout(function () { sources.forEach(function (s) { signaler(s, 'error'); }); }, 0);
  }
  function mettreEnPause() {
    if (lecture !== 'lecture') return;
    lecture = 'pause'; jeton++; natif.cancel(); maj();
  }
  function reprendre() {
    if (lecture !== 'pause') return;
    lecture = 'lecture'; maj(); setTimeout(suivant, 60);
  }

  try {
    synth.speak = function (u) {
      var t = Date.now();
      if (!(t - dernierGeste < DELAI_GESTE || t - finAcceptee < DELAI_SUITE || lecture !== 'arret' || natifParle() || natifAttente())) return;
      var texte = String((u && u.text) || '');
      if (!texte.trim()) { setTimeout(function () { signaler(u, 'end'); }, 0); return; }
      var neuf = lecture === 'arret';
      if (neuf) preparerEclairage();
      var morceaux = decouper(texte);
      morceaux.forEach(function (x, i) { file.push({ t: x, src: u, premier: i === 0, dernier: i === morceaux.length - 1 }); });
      if (lecture === 'arret') { lecture = 'lecture'; maj(); suivant(); }
    };
    synth.cancel = function () { if (file.length || lecture !== 'arret') vider(true); else natif.cancel(); maj(); };
    synth.pause = function () { if (lecture === 'lecture') mettreEnPause(); else natif.pause(); };
    synth.resume = function () { if (lecture === 'pause') reprendre(); else natif.resume(); };
    Object.defineProperty(synth, 'speaking', { configurable: true, get: function () { return lecture !== 'arret' || natifParle(); } });
    Object.defineProperty(synth, 'pending', { configurable: true, get: function () { return file.length > 1 || natifAttente(); } });
    Object.defineProperty(synth, 'paused', { configurable: true, get: function () { return lecture === 'pause'; } });
  } catch (e) {}

  /* 3. Ce qui est lu s'éclaire : la ligne, la proposition ou le paragraphe qui contient la phrase dite. */
  var style = document.createElement('style');
  style.textContent = '.ap-lu{background:#fff2a8!important;color:#1a1a1a!important;box-shadow:0 0 0 .2rem #fff2a8!important;border-radius:.2rem;transition:background .15s}' +
    '.ap-lu *{color:#1a1a1a!important}@media print{.ap-lu{background:none!important;box-shadow:none!important}}';
  (document.head || document.documentElement).appendChild(style);
  var BLOCS = 'p,li,td,th,dt,dd,h1,h2,h3,h4,h5,h6,label,button,figcaption,blockquote,summary,legend,caption,div,span,section,article';
  var candidats = [], zone = null, allume = null;
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }
  /* un mot de la liste est affiché seul (bouton, case, étiquette) : sinon c'est une phrase, on ne la coupe pas */
  function seulALEcran(x) {
    var n = norm(x);
    return n.length > 1 && candidats.some(function (c) { return c.n.length <= n.length + 4 && c.n.indexOf(n) >= 0 && visible(c.el); });
  }
  /* longueur du texte d'un bloc, sans celui de ses boutons : une barre de boutons n'est pas un texte lu */
  function texteHorsBoutons(el) {
    var n = norm(el.textContent).length;
    [].forEach.call(el.querySelectorAll('button,a,[role=button],select'), function (b) { n -= norm(b.textContent).length + 1; });
    return n;
  }
  function visible(el) { return !!(el.offsetParent || el.getClientRects().length); }
  function preparerEclairage() {
    candidats = [];
    zone = null;
    var c = cibleGeste && document.contains(cibleGeste) ? cibleGeste : null;
    if (c) {
      var b = c.closest('button,a,[role=button],[onclick]') || c;
      var z = b.parentElement;
      while (z && z !== document.body && texteHorsBoutons(z) < 12) z = z.parentElement;
      if (z && z !== document.body && z !== document.documentElement && norm(z.textContent).length < 1500) zone = z;
    }
    var racine = document.body;
    if (!racine) return;
    [].forEach.call(racine.querySelectorAll(BLOCS), function (el) {
      if (barre && barre.contains(el)) return;
      if (el.closest('script,style,noscript,template,[aria-hidden="true"]')) return;
      var n = norm(el.textContent);
      if (n.length < 2 || n.length > 2500) return;
      candidats.push({ el: el, n: n });
    });
  }
  function cible(m) {
    var c = norm(m.t);
    if (c.length < 2) return null;
    var cle = c.slice(0, 48);
    var mieux = null, dansZone = null;
    candidats.forEach(function (x) {
      if (x.n.indexOf(cle) < 0 || !visible(x.el)) return;
      if (!mieux || x.n.length < mieux.n.length) mieux = x;
      if (zone && zone.contains(x.el) && (!dansZone || x.n.length < dansZone.n.length)) dansZone = x;
    });
    var r = dansZone || mieux;
    if (!r) return zone && norm(zone.textContent).length < 600 ? zone : null;
    if (r) {
      var el = r.el;
      /* un mot en gras dans une phrase : on éclaire la phrase entière */
      while (el.parentElement && /^(SPAN|B|STRONG|EM|I|U|MARK|SMALL|SUP|SUB)$/.test(el.tagName) && norm(el.parentElement.textContent).length < 400) el = el.parentElement;
      return el;
    }
    return zone;
  }
  function eclairer(m) {
    var el = cible(m);
    if (el === allume) return;
    eteindre();
    if (!el || el === document.body) return;
    el.classList.add('ap-lu'); allume = el;
    var r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) { try { el.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
  }
  function eteindre() { if (allume) allume.classList.remove('ap-lu'); allume = null; }

  /* 4. Toute lecture peut être mise en pause, reprise ou arrêtée. */
  function creer() {
    barre = document.createElement('div');
    barre.id = 'audio-pause'; barre.setAttribute('role', 'region'); barre.setAttribute('aria-label', 'Lecture audio');
    barre.style.cssText = 'position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:2147483000;display:none;gap:8px;align-items:center;' +
      'background:#1b4f72;color:#fff;border-radius:999px;padding:8px 10px 8px 16px;font:600 15px/1.2 system-ui,Arial,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.35)';
    barre.innerHTML = '<span id="ap-etat" aria-live="polite">Lecture en cours</span>' +
      '<button type="button" id="ap-pause" style="font:inherit;border:0;border-radius:999px;padding:8px 14px;background:#fff;color:#1b4f72;cursor:pointer;min-height:40px">⏸ Pause</button>' +
      '<button type="button" id="ap-stop" style="font:inherit;border:0;border-radius:999px;padding:8px 14px;background:#fff;color:#1b4f72;cursor:pointer;min-height:40px">⏹ Arrêter</button>';
    (document.body || document.documentElement).appendChild(barre);
    document.getElementById('ap-pause').addEventListener('click', function () {
      if (lecture === 'pause') reprendre(); else mettreEnPause();
      maj();
    });
    document.getElementById('ap-stop').addEventListener('click', function () { synth.cancel(); maj(); });
  }
  function maj() {
    var e = lecture === 'arret' ? (natifParle() ? 'lecture' : '') : lecture;
    if (e === etat) return;
    etat = e;
    if (!barre) { if (!e || !document.body) { etat = ''; return; } creer(); }
    barre.style.display = e ? 'flex' : 'none';
    document.getElementById('ap-etat').textContent = e === 'pause' ? 'Lecture en pause' : 'Lecture en cours';
    document.getElementById('ap-pause').textContent = e === 'pause' ? '▶ Reprendre' : '⏸ Pause';
  }
  setInterval(maj, 300);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && etat) { synth.cancel(); maj(); } });
  window.addEventListener('pagehide', function () { vider(false); });
})();
