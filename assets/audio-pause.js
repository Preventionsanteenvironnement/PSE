/* mapse.fr — commande de lecture audio commune (11/10/2026).
   Dès qu'une page lit un texte à voix haute, un bandeau apparaît en bas de l'écran : Pause / Reprendre et Arrêter.
   La lecture ne démarre jamais seule : une voix lancée sans geste de l'élève est ignorée.
   Les pages qui ont déjà leur propre lecteur (cours en autonomie) ne chargent pas ce fichier. */
(function () {
  'use strict';
  if (!('speechSynthesis' in window) || window.__audioPause) return;
  window.__audioPause = true;
  var synth = window.speechSynthesis, barre = null, etat = '', enPause = false;

  /* 1. Jamais de voix qui démarre seule : une lecture n'est acceptée que juste après un geste de l'élève
        (clic, touche, appui), ou comme suite immédiate d'une lecture déjà acceptée (texte lu en plusieurs morceaux). */
  var dernierGeste = 0, finAcceptee = 0, DELAI_GESTE = 1500, DELAI_SUITE = 600;
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'click', 'drop', 'dragend', 'change'].forEach(function (t) {
    window.addEventListener(t, function (ev) { if (ev.isTrusted !== false) dernierGeste = Date.now(); }, true);
  });
  var parler = synth.speak;
  try {
    synth.speak = function (u) {
      var t = Date.now();
      if (!(t - dernierGeste < DELAI_GESTE || t - finAcceptee < DELAI_SUITE || synth.speaking || synth.pending)) return;
      try { u.addEventListener('end', function () { finAcceptee = Date.now(); }); } catch (e) {}
      return parler.call(synth, u);
    };
  } catch (e) {}

  /* 2. Toute lecture peut être mise en pause, reprise ou arrêtée. */
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
      if (enPause) { synth.resume(); enPause = false; maj(); return; }
      synth.pause();
      setTimeout(function () {           /* certains téléphones ne savent pas mettre en pause : on arrête alors la lecture */
        if (synth.paused || !synth.speaking) { enPause = synth.paused; maj(); }
        else { synth.cancel(); enPause = false; maj(); }
      }, 250);
    });
    document.getElementById('ap-stop').addEventListener('click', function () { synth.cancel(); enPause = false; maj(); });
  }
  function maj() {
    var actif = synth.speaking || synth.pending || synth.paused || enPause;
    if (!actif) enPause = false;
    var e = !actif ? '' : (enPause || synth.paused ? 'pause' : 'lecture');
    if (e === etat) return;
    etat = e;
    if (!barre) { if (!e || !document.body) { etat = ''; return; } creer(); }
    barre.style.display = e ? 'flex' : 'none';
    document.getElementById('ap-etat').textContent = e === 'pause' ? 'Lecture en pause' : 'Lecture en cours';
    document.getElementById('ap-pause').textContent = e === 'pause' ? '▶ Reprendre' : '⏸ Pause';
  }
  setInterval(maj, 300);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && etat) { synth.cancel(); enPause = false; maj(); } });
  window.addEventListener('pagehide', function () { synth.cancel(); });
})();
