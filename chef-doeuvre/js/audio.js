/* audio.js — lecture à voix haute du parcours chef-d'œuvre (CAP PSR 1re année).
 * Voix du système, rien n'est envoyé ; le passage lu s'éclaire (classe .en-lecture).
 * Même découpage et même choix de voix que assets/cours-autonome.js.
 *   CDO_AUDIO.lire(texte, element)      lit un texte, éclaire l'élément
 *   CDO_AUDIO.lireTout(conteneur)       lit dans l'ordre chaque [data-lire] visible, puis les propositions à toucher
 *   CDO_AUDIO.bouton(texte)             renvoie le HTML d'un bouton 🔊 (texte lu = data-dire)
 *   CDO_AUDIO.arreter()
 */
(function () {
  'use strict';
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var voixFr = [], file = [], jeton = 0, eclaire = null, boutonActif = null;
  var attente = [], minuterie = null, vus = new WeakMap();

  function chargerVoix() {
    if (!synth) return;
    voixFr = synth.getVoices().filter(function (v) { return /^fr/i.test(v.lang); });
  }
  if (synth) { chargerVoix(); synth.onvoiceschanged = chargerVoix; }

  function choisirVoix() {
    return voixFr.filter(function (v) { return /Thomas|Amélie|Amelie|Audrey|Marie|Google/i.test(v.name) && /fr-FR/i.test(v.lang); })[0] ||
      voixFr.filter(function (v) { return /fr-FR/i.test(v.lang); })[0] || voixFr[0] || null;
  }
  /* Ce qui s'écrit autrement qu'il ne se dit. */
  function oral(t) {
    return String(t || '')
      .replace(/\[|\]/g, '')
      .replace(/…/g, '.')
      .replace(/\s*→\s*/g, ', donne, ')
      .replace(/(\d+)\s*°C/g, '$1 degrés')
      .replace(/(\d+)\s*kg/g, '$1 kilos')
      .replace(/_{3,}|\.{4,}/g, ', blanc, ')
      .replace(/\bPAD\b/g, 'P. A. D.')
      .replace(/\bEPI\b/g, 'E. P. I.')
      .replace(/\bPSE\b/g, 'P. S. E.')
      .replace(/\bPFMP\b/g, 'P. F. M. P.');
  }
  function decouper(t) {
    var out = [];
    (String(t).match(/[^.!?;:]+[.!?;:]*/g) || []).forEach(function (p) { p = p.trim(); if (p) out.push(p); });
    return out.length ? out : [String(t)];
  }
  function eteindre() {
    if (eclaire) eclaire.classList.remove('en-lecture');
    eclaire = null;
    if (boutonActif) { boutonActif.classList.remove('joue'); boutonActif.setAttribute('aria-pressed', 'false'); }
    boutonActif = null;
  }
  function arreter() { clearTimeout(minuterie); attente = []; jeton += 1; file = []; if (synth) synth.cancel(); eteindre(); }

  function suivant(j) {
    if (j !== jeton) return;
    var m = file.shift();
    if (!m) { eteindre(); return; }
    if (eclaire !== m.el) { if (eclaire) eclaire.classList.remove('en-lecture'); eclaire = m.el; if (eclaire) eclaire.classList.add('en-lecture'); }
    var u = new SpeechSynthesisUtterance(m.t);
    var v = choisirVoix(); if (v) u.voice = v;
    u.lang = 'fr-FR'; u.rate = 0.92;
    u.onend = u.onerror = function () { suivant(j); };
    synth.speak(u);
  }
  function lancer(morceaux, bouton) {
    arreter();
    if (!synth) return;
    morceaux.forEach(function (m) { decouper(oral(m.t)).forEach(function (s) { file.push({ t: s, el: m.el }); }); });
    if (bouton) { boutonActif = bouton; bouton.classList.add('joue'); bouton.setAttribute('aria-pressed', 'true'); }
    suivant(jeton);
  }
  function texteDe(el) {
    if (el.getAttribute('data-dire')) return el.getAttribute('data-dire');
    var c = el.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('.cdo-son, [aria-hidden="true"], .pas-lu, details:not([open])'), function (x) { x.remove(); });
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  function visible(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }

  function lire(t, el, bouton) { lancer([{ t: t, el: el || null }], bouton); }
  function cle() {
    return 'cdo-audio-mode:' + (window.CDO_DONNEES && window.CDO_DONNEES.code() || 'accueil');
  }
  function mode() {
    try { var m = localStorage.getItem(cle()); return /^(questions|reponses|tout)$/.test(m) ? m : 'manuel'; }
    catch (e) { return 'manuel'; }
  }
  function autorise(categorie) { var m = mode(); return m === 'tout' || m === categorie; }
  function categorie(el) {
    return el.closest('.cdo-correction, .cdo-retour, .guide-retour, .chasse-retour, .cdo-note, .cdo-props, .cdo-choix, .cdo-banque, .cdo-carte') ? 'reponses' : 'questions';
  }
  function morceaux(conteneur) {
    var m = [];
    Array.prototype.forEach.call((conteneur || document).querySelectorAll('[data-lire], .cdo-carte:not(.range):not([disabled])'), function (el) {
      if (!visible(el) || el.closest('[data-audio-reglages]')) return;
      // Les cartes déjà balisées sont lues une seule fois, dans l'ordre du document.
      if (el.parentElement.closest('[data-lire], .cdo-carte')) return;
      var t = texteDe(el);
      if (t) m.push({ t: t, el: el, categorie: categorie(el) });
    });
    return m;
  }
  function lireTout(conteneur, bouton) { lancer(morceaux(conteneur), bouton); }
  function programmer(t, el, cat) {
    if (!autorise(cat)) return;
    attente.push({t:t, el:el || null});
    clearTimeout(minuterie);
    minuterie = setTimeout(function () {
      var liste = attente, uniques = new Set(); attente = [];
      liste = liste.filter(function (m) { if (uniques.has(m.t)) return false; uniques.add(m.t); return true; });
      if (liste.length) lancer(liste);
    }, 180);
  }
  function lireAuto(t, el, cat) { programmer(t, el, cat || 'reponses'); }
  function actualiser(force) {
    var vue = document.getElementById('vue');
    if (vue) Array.prototype.forEach.call(vue.querySelectorAll('.cdo-carte, .cdo-pastille'), function (carte) {
      if (!carte.querySelector('.cdo-son')) carte.insertAdjacentHTML('beforeend', interne(texteDe(carte)));
    });
    var select = document.querySelector('[data-audio-mode]'); if (select) select.value = mode();
    morceaux(document.getElementById('vue')).forEach(function (m) {
      if (force || vus.get(m.el) !== m.t) {
        vus.set(m.el, m.t); programmer(m.t, m.el, m.categorie);
      }
    });
  }
  function reglages() {
    return '<details class="cdo-audio-reglages" data-audio-reglages><summary>Audio</summary>' +
      '<label>Lecture automatique<select data-audio-mode>' +
      '<option value="manuel">À la demande</option><option value="questions">Questions et consignes</option>' +
      '<option value="reponses">Réponses et corrections</option><option value="tout">Tout le contenu</option>' +
      '</select></label></details><button type="button" class="cdo-ecouter" data-audio-stop>Arrêter</button>';
  }
  document.addEventListener('change', function (ev) {
    if (!ev.target.matches('[data-audio-mode]')) return;
    arreter(); try { localStorage.setItem(cle(), ev.target.value); } catch (e) {}
    actualiser(true);
  });
  document.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-audio-stop]')) arreter();
  });
  document.addEventListener('toggle', function (ev) { if (!ev.target.matches('details.cdo-explication')) return; if (!ev.target.open) { arreter(); var bloc = ev.target.closest('[data-lire]'); if (bloc) vus.set(bloc, texteDe(bloc)); return; } actualiser(false); }, true);
  function observer() {
    var vue = document.getElementById('vue'); if (!vue) return;
    new MutationObserver(function () { actualiser(false); }).observe(vue, {childList:true, subtree:true, characterData:true});
    actualiser(false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observer); else observer();
  var ICONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path class="onde2" d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function bouton(texte, libelle) {
    return '<button type="button" class="cdo-son" data-dire="' + esc(texte) + '" aria-label="' + esc(libelle || 'Écouter') + '" aria-pressed="false">' + ICONE + '</button>';
  }
  /* Même bouton, à placer DANS un autre bouton (une carte à choisir) : un bouton ne peut pas en contenir un autre. */
  function interne(texte, libelle) {
    return '<span class="cdo-son" role="button" tabindex="0" data-dire="' + esc(texte) + '" aria-label="' + esc(libelle || 'Écouter') + '" aria-pressed="false">' + ICONE + '</span>';
  }
  document.addEventListener('keydown', function (ev) {
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches && ev.target.matches('span.cdo-son')) { ev.preventDefault(); ev.stopPropagation(); ev.target.click(); }
  }, true);

  /* Un seul écouteur pour tous les boutons 🔊 : celui d'un élément lit cet élément. */
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('.cdo-son');
    if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    if (b.classList.contains('joue')) { arreter(); return; }
    b.dispatchEvent(new CustomEvent('cdo-ecoute',{bubbles:true,detail:{texte:b.getAttribute('data-dire')||''}}));
    var cible = b.closest('[data-lire]') || b.parentElement;
    lire(b.getAttribute('data-dire') || texteDe(cible), cible, b);
  }, true);
  window.addEventListener('pagehide', arreter);

  window.CDO_AUDIO = { lire: lire, lireAuto: lireAuto, mode: mode, reglages: reglages, lireTout: lireTout, arreter: arreter, bouton: bouton, interne: interne, ICONE: ICONE, disponible: !!synth };
})();
