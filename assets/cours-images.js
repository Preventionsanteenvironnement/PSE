/* cours-images.js — « Cours en images » de mapse.fr (15/10/2026).
   Lit window.COURS_IMAGES (fabriqué depuis un cours visuel de l'Atelier PSE par OUTILS/cours-en-ligne/cours-images/construire.py)
   et l'affiche une page à la fois. Règles voulues par M. Mecheri :
   - chaque élément (titre, consigne, case, image, carte, réponse, mot, retour) a SON bouton 🔊 : jamais un audio qui lit toute la page ;
   - ⏸ Pause / ▶ Reprendre / ⏹ Arrêter toujours possibles (la pause native n'existe pas partout : le texte est découpé en morceaux
     et la reprise repart du morceau en cours) ;
   - rien ne parle sans un geste de l'élève ; tout exercice se fait en touchant, sans lire ni écrire ;
   - 💾 Enregistrer / 📂 Reprendre en fichier (obligatoire sur mapse.fr), plus une sauvegarde dans le navigateur.
   Touches ← → : page précédente / suivante. */
(function () {
  'use strict';
  var C = window.COURS_IMAGES;
  if (!C || !C.pages) return;
  var racine = document.getElementById('cours-images');
  var CLE = 'mapse-cours-images:' + C.id;
  var etat = { page: 0, rep: {}, taille: 20, theme: '' };

  /* ---------- outils ---------- */
  function el(tag, attrs, enfants) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'texte') e.textContent = v;
      else if (k === 'classe') e.className = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (enfants || []).forEach(function (x) { if (x != null) e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
    return e;
  }
  function melanger(liste, decalage) { return liste.map(function (_, i) { return liste[(i + decalage) % liste.length]; }); }
  function rep(n) { return etat.rep[n] || (etat.rep[n] = {}); }
  function sauver() {
    try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* navigation privée : rien */ }
  }

  /* ---------- lecture à voix haute ---------- */
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var voix = null;
  function choisirVoix() {
    if (!synth) return;
    var v = synth.getVoices().filter(function (x) { return /^fr/i.test(x.lang); });
    voix = v.filter(function (x) { return /fr[-_]FR/i.test(x.lang); })[0] || v[0] || null;
  }
  if (synth) { choisirVoix(); if (synth.addEventListener) synth.addEventListener('voiceschanged', choisirVoix); }

  /* Le texte tel qu'il doit être dit (unités, sigles, trous). */
  function oral(t) {
    return String(t || '')
      .replace(/_{3,}/g, ' … le mot qui manque … ')
      .replace(/dB\s*\(A\)/g, ' décibels A')
      .replace(/\bdB\b/g, ' décibels')
      .replace(/\bHz\b/g, ' hertz')
      .replace(/(\d)\s*€/g, '$1 euros').replace(/€/g, ' euros')
      .replace(/(\d)\s*%/g, '$1 pour cent')
      .replace(/\b1er\b/g, 'premier').replace(/\b1re\b/g, 'première')
      .replace(/(\d+)\s*-\s*(\d+)\s*ans/g, '$1 à $2 ans')
      .replace(/\b([A-Z]{2,4})\b/g, function (m) { return m.split('').join(' '); })
      .replace(/\s+/g, ' ').trim();
  }
  /* Coupe après chaque signe (sans « lookbehind », que les iPhone d'avant iOS 16.4 ne lisent pas). */
  function phrases(t, signe) {
    var out = [], bout = '';
    String(t || '').split(/(\s+)/).forEach(function (m) {
      bout += m;
      if (!/^\s+$/.test(m) && signe.test(m.slice(-1))) { if (bout.trim()) out.push(bout.trim()); bout = ''; }
    });
    if (bout.trim()) out.push(bout.trim());
    return out;
  }
  function decouper(t) {
    var out = [];
    phrases(t, /[.!?;:…]/).forEach(function (phrase) {
      if (phrase.length <= 140) { if (phrase) out.push(phrase); return; }
      var bout = '';
      phrases(phrase, /,/).forEach(function (m) {
        if ((bout + ' ' + m).length > 140 && bout) { out.push(bout); bout = m; } else bout = bout ? bout + ' ' + m : m;
      });
      if (bout) out.push(bout);
    });
    return out;
  }
  var L = { morceaux: [], i: 0, jeton: 0, enPause: false, cible: null, bouton: null, texte: '' };
  var lecteur, lecteurDit, btnPause;
  function marquer(on) {
    if (L.cible) L.cible.classList.toggle('ci-lu', on);
    if (L.bouton) { L.bouton.classList.toggle('ci-joue', on); L.bouton.setAttribute('aria-pressed', on ? 'true' : 'false'); }
  }
  function majLecteur() {
    var actif = L.morceaux.length > 0;
    lecteur.classList.toggle('ci-visible', actif);
    btnPause.textContent = L.enPause ? '▶ Reprendre' : '⏸ Pause';
    btnPause.setAttribute('aria-label', L.enPause ? 'Reprendre la lecture' : 'Mettre la lecture en pause');
    lecteurDit.textContent = L.texte;
  }
  function jouer() {
    if (!synth) return;
    if (L.i >= L.morceaux.length) { arreter(); return; }
    var j = ++L.jeton;
    var u = new SpeechSynthesisUtterance(L.morceaux[L.i]);
    u.lang = 'fr-FR'; u.rate = 0.9; if (voix) u.voice = voix;
    u.onend = u.onerror = function () { if (j !== L.jeton || L.enPause) return; L.i += 1; jouer(); };
    synth.speak(u);
  }
  function dire(texte, cible, bouton) {
    if (!synth) return;
    if (bouton && bouton === L.bouton && L.morceaux.length) { basculerPause(); return; }
    arreter();
    L.morceaux = decouper(oral(texte)); L.i = 0; L.enPause = false; L.cible = cible || null; L.bouton = bouton || null; L.texte = String(texte || '');
    if (!L.morceaux.length) return;
    marquer(true); majLecteur(); jouer();
  }
  function basculerPause() {
    if (!L.morceaux.length) return;
    if (L.enPause) { L.enPause = false; majLecteur(); jouer(); }
    else { L.enPause = true; L.jeton += 1; synth.cancel(); majLecteur(); }
  }
  function arreter() {
    L.jeton += 1;
    if (synth) synth.cancel();
    marquer(false);
    L.morceaux = []; L.i = 0; L.enPause = false; L.cible = null; L.bouton = null; L.texte = '';
    if (lecteur) majLecteur();
  }
  /* Le bouton 🔊 d'un élément : toujours le même, toujours avec son propre texte. */
  function son(texte, cible, nom) {
    var b = el('button', { type: 'button', classe: 'ci-son', 'aria-label': 'Écouter : ' + (nom || texte), 'aria-pressed': 'false', title: 'Écouter' }, ['🔊']);
    b.addEventListener('click', function (ev) { ev.stopPropagation(); dire(texte, cible || b.parentNode, b); });
    if (!synth) b.hidden = true;
    return b;
  }

  /* ---------- images ---------- */
  function image(im, alt, opts) {
    if (!im || !im.src) return null;
    opts = opts || {};
    var cadre = el(opts.bouton ? 'button' : 'div', { classe: 'ci-image' + (opts.large ? ' ci-large' : ''), type: opts.bouton ? 'button' : null, 'aria-label': opts.bouton ? 'Écouter : ' + alt : null });
    var img = el('img', { src: im.src, alt: opts.bouton ? '' : (im.alt || alt || ''), loading: 'lazy', decoding: 'async' });
    /* Un schéma en largeur (oreille, trajet du son…) prend toute la largeur de sa carte au lieu d'un cadre carré. */
    function forme() { if (img.naturalWidth > img.naturalHeight * 1.3) cadre.classList.add('ci-paysage'); }
    if (img.complete) forme(); else img.addEventListener('load', forme);
    cadre.appendChild(img);
    return cadre;
  }
  /* Case avec image : toucher l'image ou 🔊 fait entendre la case. */
  function texteCase(k) { return [k.titre, k.texte].filter(Boolean).join('. '); }

  /* ---------- en-tête de page ---------- */
  function entete(p, n) {
    var bloc = el('div', { classe: 'ci-titre' });
    var h = el('h1', { id: 'ci-h1', tabindex: '-1', texte: p.titre || '' });
    var g = el('div', { style: 'flex:1' }, [el('p', { classe: 'ci-numero', texte: 'Page ' + (n + 1) + ' sur ' + C.pages.length }), h]);
    bloc.appendChild(son(p.titre || '', bloc, 'le titre'));
    bloc.appendChild(g);
    return bloc;
  }
  function consigne(texte, classe) {
    var b = el('div', { classe: 'ci-consigne' + (classe ? ' ' + classe : '') });
    b.appendChild(son(texte, b, 'la consigne'));
    b.appendChild(el('span', { texte: texte }));
    return b;
  }

  /* ---------- pages de notions ---------- */
  function rendreCouverture(p, zone) {
    var b = el('div', { classe: 'ci-couverture' });
    var img = image(p.image, p.titre, { large: true });
    if (img) b.appendChild(img);
    var t = el('div', { classe: 'ci-titre', style: 'justify-content:center' });
    t.appendChild(son([p.titre, p.texte].filter(Boolean).join('. '), b, 'le titre du cours'));
    t.appendChild(el('h1', { id: 'ci-h1', tabindex: '-1', texte: p.titre }));
    b.appendChild(t);
    if (p.texte) b.appendChild(el('div', { classe: 'ci-sous', texte: p.texte }));
    var aide = consigne('Touche 🔊 pour écouter. Touche « Suivant » pour avancer.');
    b.appendChild(aide);
    b.appendChild(el('button', { type: 'button', classe: 'ci-bouton ci-fort', style: 'min-height:64px;font-size:1.2rem;padding:8px 28px', onclick: function () { aller(1); } }, ['Commencer ▶']));
    zone.appendChild(b);
  }
  function rendreCases(p, zone) {
    if (p.texte) zone.appendChild(consigne(p.texte));
    var g = el('div', { classe: 'ci-grille', role: 'list' });
    p.cases.forEach(function (k) {
      var carte = el('div', { classe: 'ci-carte', role: 'listitem' });
      var dit = texteCase(k);
      carte.appendChild(son(dit, carte, k.titre || k.texte));
      var img = image(k.image, k.titre || k.texte, { bouton: true });
      if (img) { img.addEventListener('click', function () { dire(dit, carte, carte.querySelector('.ci-son')); }); carte.appendChild(img); }
      if (k.titre) carte.appendChild(el('div', { classe: 'ci-mot', texte: k.titre }));
      if (k.texte) carte.appendChild(el('div', { classe: 'ci-phrase', texte: k.texte }));
      g.appendChild(carte);
    });
    zone.appendChild(g);
  }
  function rendreEtapes(p, zone) {
    if (p.texte) zone.appendChild(consigne(p.texte));
    var l = el('ol', { classe: 'ci-etapes', style: 'list-style:none;padding:0;margin:0' });
    p.cases.forEach(function (k, i) {
      var li = el('li', { classe: 'ci-etape' });
      var dit = 'Étape ' + (i + 1) + '. ' + texteCase(k);
      li.appendChild(el('span', { classe: 'ci-num', 'aria-hidden': 'true', texte: String(i + 1) }));
      var img = image(k.image, k.texte, { bouton: true });
      if (img) { img.addEventListener('click', function () { dire(dit, li, li.querySelector('.ci-son')); }); li.appendChild(img); }
      li.appendChild(el('div', { classe: 'ci-phrase' }, [el('span', { classe: 'ci-cache', texte: 'Étape ' + (i + 1) + ' : ' }), k.titre ? el('strong', { texte: k.titre + ' — ' }) : null, k.texte || '']));
      li.appendChild(son(dit, li, 'l’étape ' + (i + 1)));
      l.appendChild(li);
    });
    zone.appendChild(l);
  }
  function rendreDocument(p, zone) {
    var d = el('div', { classe: 'ci-document' });
    var img = image(p.image, p.titre, { large: true });
    if (img) d.appendChild(img);
    var ph = el('div', { classe: 'ci-phrases' });
    phrases(p.texte, /[.!?]/).forEach(function (s) {
      var ligne = el('div', { classe: 'ci-ligne' });
      ligne.appendChild(son(s, ligne));
      ligne.appendChild(el('span', { texte: s }));
      ph.appendChild(ligne);
    });
    d.appendChild(ph);
    if (p.source) d.appendChild(el('div', { classe: 'ci-source', texte: 'Source : ' + p.source }));
    zone.appendChild(d);
  }

  /* ---------- exercices : vérifier, corriger, recommencer ---------- */
  function actions(zone, n, verifier, corriger, vider) {
    var r = rep(n);
    var boite = el('div', { classe: 'ci-actions' });
    var retour = el('div', { 'aria-live': 'polite' });
    function afficherRetour(ok, texte) {
      retour.innerHTML = '';
      var b = el('div', { classe: 'ci-retour ' + (ok ? 'ci-bravo' : 'ci-encore') });
      b.appendChild(son(texte, b, 'le résultat'));
      b.appendChild(el('span', { texte: texte }));
      retour.appendChild(b);
    }
    boite.appendChild(el('button', { type: 'button', classe: 'ci-bouton ci-fort', onclick: function () {
      arreter();
      var res = verifier();
      r.verifie = true; r.ok = res.ok; sauver();
      afficherRetour(res.ok, res.ok ? 'Bravo, tout est juste !' : (res.texte || 'Pas encore. Regarde les cases en rouge, puis essaie encore.'));
    } }, ['✔ Vérifier']));
    boite.appendChild(el('button', { type: 'button', classe: 'ci-bouton', onclick: function () {
      arreter(); var t = corriger(); r.corrige = true; sauver();
      afficherRetour(true, t);
    } }, ['👁 Voir la correction']));
    boite.appendChild(el('button', { type: 'button', classe: 'ci-bouton', onclick: function () {
      arreter(); vider(); delete etat.rep[n]; sauver(); afficherPage();
    } }, ['↺ Recommencer']));
    zone.appendChild(boite); zone.appendChild(retour);
    return afficherRetour;
  }

  function rendreChoix(p, zone, n) {
    var r = rep(n); r.sel = r.sel || [];
    var justes = p.cases.map(function (k, i) { return k.juste ? i : -1; }).filter(function (i) { return i >= 0; });
    var plusieurs = justes.length > 1;
    if (p.texte) zone.appendChild(consigne(p.texte));
    zone.appendChild(consigne(plusieurs ? 'Touche les bonnes réponses. Il y en a ' + justes.length + '.' : 'Touche la bonne réponse.', 'ci-geste'));
    var g = el('div', { classe: 'ci-choix' });
    var opts = p.cases.map(function (k, i) {
      var o = el('div', { classe: 'ci-option', role: 'button', tabindex: '0', 'aria-pressed': r.sel.indexOf(i) >= 0 ? 'true' : 'false' });
      var coche = el('span', { classe: 'ci-coche', 'aria-hidden': 'true', texte: r.sel.indexOf(i) >= 0 ? '✓' : '' });
      o.appendChild(coche);
      o.appendChild(son(k.texte, o, 'la réponse ' + (i + 1)));
      var img = image(k.image, k.texte); if (img) o.appendChild(img);
      o.appendChild(el('div', { classe: 'ci-phrase', texte: k.texte }));
      function choisir() {
        var a = r.sel.indexOf(i);
        if (plusieurs) { if (a >= 0) r.sel.splice(a, 1); else r.sel.push(i); }
        else r.sel = a >= 0 ? [] : [i];
        opts.forEach(function (x, j) { var on = r.sel.indexOf(j) >= 0; x.setAttribute('aria-pressed', on ? 'true' : 'false'); x.querySelector('.ci-coche').textContent = on ? '✓' : ''; x.classList.remove('ci-juste', 'ci-faux'); });
        sauver();
      }
      o.addEventListener('click', choisir);
      o.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisir(); } });
      g.appendChild(o);
      return o;
    });
    zone.appendChild(g);
    actions(zone, n, function () {
      var ok = true;
      opts.forEach(function (o, i) {
        var choisi = r.sel.indexOf(i) >= 0, juste = !!p.cases[i].juste;
        o.classList.remove('ci-juste', 'ci-faux');
        if (choisi) o.classList.add(juste ? 'ci-juste' : 'ci-faux');
        if (choisi !== juste) ok = false;
      });
      return { ok: ok, texte: ok ? '' : (plusieurs ? 'Pas encore. Il faut toucher les ' + justes.length + ' bonnes réponses, et seulement elles.' : '') };
    }, function () {
      r.sel = justes.slice();
      opts.forEach(function (o, i) { var on = !!p.cases[i].juste; o.setAttribute('aria-pressed', on ? 'true' : 'false'); o.querySelector('.ci-coche').textContent = on ? '✓' : ''; o.classList.toggle('ci-juste', on); o.classList.remove('ci-faux'); });
      return (plusieurs ? 'Les bonnes réponses : ' : 'La bonne réponse : ') + justes.map(function (i) { return p.cases[i].texte; }).join(' ; ');
    }, function () { r.sel = []; });
  }

  function rendreVraiFaux(p, zone, n) {
    var r = rep(n); r.v = r.v || [];
    if (p.texte) zone.appendChild(consigne(p.texte));
    zone.appendChild(consigne('Pour chaque phrase, touche Vrai ou Faux.', 'ci-geste'));
    var l = el('div', { classe: 'ci-vf' });
    var lignes = p.cases.map(function (k, i) {
      var li = el('div', { classe: 'ci-vf-ligne' });
      li.appendChild(son(k.texte, li, 'la phrase ' + (i + 1)));
      var img = image(k.image, k.texte); if (img) li.appendChild(img);
      li.appendChild(el('div', { classe: 'ci-phrase', texte: k.texte }));
      var bs = el('div', { classe: 'ci-vf-btns', role: 'group', 'aria-label': 'Phrase ' + (i + 1) });
      [[true, '✅ Vrai'], [false, '❌ Faux']].forEach(function (x) {
        var b = el('button', { type: 'button', classe: 'ci-vf-btn', 'aria-pressed': r.v[i] === x[0] ? 'true' : 'false', texte: x[1] });
        b.addEventListener('click', function () {
          r.v[i] = x[0]; sauver();
          bs.querySelectorAll('.ci-vf-btn').forEach(function (y) { y.setAttribute('aria-pressed', y === b ? 'true' : 'false'); });
          li.classList.remove('ci-juste', 'ci-faux');
        });
        bs.appendChild(b);
      });
      li.appendChild(bs);
      l.appendChild(li);
      return li;
    });
    zone.appendChild(l);
    actions(zone, n, function () {
      var ok = true;
      lignes.forEach(function (li, i) {
        li.classList.remove('ci-juste', 'ci-faux');
        var bon = r.v[i] === !!p.cases[i].vrai;
        if (r.v[i] != null) li.classList.add(bon ? 'ci-juste' : 'ci-faux');
        if (!bon) ok = false;
      });
      return { ok: ok };
    }, function () {
      lignes.forEach(function (li, i) {
        r.v[i] = !!p.cases[i].vrai;
        li.querySelectorAll('.ci-vf-btn').forEach(function (y, j) { y.setAttribute('aria-pressed', (j === 0) === r.v[i] ? 'true' : 'false'); });
        li.classList.remove('ci-faux'); li.classList.add('ci-juste');
      });
      return 'La correction : ' + p.cases.map(function (k) { return k.texte + ' ' + (k.vrai ? 'Vrai.' : 'Faux.'); }).join(' ');
    }, function () { r.v = []; });
  }

  /* Je classe : toucher une carte, puis sa colonne. La carte 1 est déjà placée (exemple), comme sur la feuille. */
  function rendreClasser(p, zone, n) {
    var r = rep(n);
    var titres = p.colonnesTitres || [];
    if (!r.place) { r.place = p.cases.map(function () { return 0; }); if (p.cases[0] && p.cases[0].colonne) r.place[0] = p.cases[0].colonne; }
    var choisie = -1;
    zone.appendChild(consigne(p.texte || 'Range chaque carte dans la bonne colonne.'));
    zone.appendChild(consigne('Touche une carte, puis touche sa colonne. La carte 1 est déjà rangée : c’est l’exemple.', 'ci-geste'));
    var paquet = el('div', { classe: 'ci-paquet', 'aria-label': 'Cartes à ranger' });
    var colonnes = el('div', { classe: 'ci-colonnes' });
    var corps = titres.map(function (t, c) {
      var col = el('div', { classe: 'ci-colonne' });
      var tete = el('div', { classe: 'ci-colonne-tete' });
      tete.appendChild(son('Colonne : ' + t, tete, 'la colonne ' + t));
      tete.appendChild(el('span', { texte: t }));
      col.appendChild(tete);
      var cp = el('div', { classe: 'ci-colonne-corps', role: 'button', tabindex: '0', 'aria-label': 'Ranger ici : ' + t });
      cp.addEventListener('click', function () { poser(c + 1); });
      cp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poser(c + 1); } });
      col.appendChild(cp);
      colonnes.appendChild(col);
      return cp;
    });
    paquet.addEventListener('click', function (e) { if (e.target === paquet) poser(0); });
    var jetons = p.cases.map(function (k, i) {
      var j = el('div', { classe: 'ci-jeton', role: 'button', tabindex: '0', 'aria-pressed': 'false' });
      j.appendChild(el('span', { classe: 'ci-num', style: 'position:absolute;top:6px;left:8px;font-weight:900;color:var(--c)', texte: String(i + 1) }));
      j.appendChild(son(k.texte, j, 'la carte ' + (i + 1)));
      var img = image(k.image, k.texte); if (img) j.appendChild(img);
      j.appendChild(el('div', { texte: k.texte }));
      if (i === 0 && k.colonne) j.appendChild(el('div', { classe: 'ci-reponse', texte: 'Exemple' }));
      function prendre(e) {
        if (e) e.stopPropagation();
        if (i === 0 && p.cases[0].colonne) return;
        choisie = choisie === i ? -1 : i;
        jetons.forEach(function (x, y) { x.setAttribute('aria-pressed', y === choisie ? 'true' : 'false'); });
        corps.forEach(function (cp) { cp.parentNode.classList.toggle('ci-cible', choisie >= 0); });
      }
      j.addEventListener('click', prendre);
      j.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); prendre(); } });
      return j;
    });
    function ranger() {
      jetons.forEach(function (j, i) { (r.place[i] ? corps[r.place[i] - 1] : paquet).appendChild(j); j.setAttribute('aria-pressed', i === choisie ? 'true' : 'false'); });
      corps.forEach(function (cp) { cp.parentNode.classList.toggle('ci-cible', choisie >= 0); });
    }
    function poser(c) {
      if (choisie < 0) return;
      r.place[choisie] = c; choisie = -1; sauver();
      jetons.forEach(function (j) { j.classList.remove('ci-juste', 'ci-faux'); });
      ranger();
    }
    ranger();
    zone.appendChild(paquet); zone.appendChild(colonnes);
    actions(zone, n, function () {
      var ok = true;
      jetons.forEach(function (j, i) {
        j.classList.remove('ci-juste', 'ci-faux');
        var bon = r.place[i] === p.cases[i].colonne;
        if (r.place[i]) j.classList.add(bon ? 'ci-juste' : 'ci-faux');
        if (!bon) ok = false;
      });
      return { ok: ok, texte: ok ? '' : 'Pas encore. Range toutes les cartes, puis regarde les cartes en rouge.' };
    }, function () {
      r.place = p.cases.map(function (k) { return k.colonne || 0; }); choisie = -1; ranger();
      jetons.forEach(function (j) { j.classList.remove('ci-faux'); j.classList.add('ci-juste'); });
      return 'La correction : ' + titres.map(function (t, c) {
        return t + ' : ' + p.cases.filter(function (k) { return k.colonne === c + 1; }).map(function (k) { return k.texte; }).join(', ') + '.';
      }).join(' ');
    }, function () { r.place = null; });
  }

  /* Je relie : toucher une image, puis son mot (ou l'inverse). Les mots sont décalés comme sur la feuille. */
  var COULEURS = ['#1d4ed8', '#047857', '#b45309', '#7c3aed', '#be123c'];
  function rendreRelier(p, zone, n) {
    var r = rep(n); r.lien = r.lien || {};
    var dec = Math.max(1, Math.floor(p.cases.length / 2));
    var droite = melanger(p.cases.map(function (_, i) { return i; }), dec);
    var choix = null;
    if (p.texte) zone.appendChild(consigne(p.texte));
    zone.appendChild(consigne('Touche une image, puis touche son mot.', 'ci-geste'));
    var grille = el('div', { classe: 'ci-relier' });
    var colG = el('div', { classe: 'ci-gauche' }), colD = el('div', { classe: 'ci-droite' });
    var G = p.cases.map(function (k, i) {
      var b = el('div', { classe: 'ci-paire', role: 'button', tabindex: '0', 'aria-label': 'Image ' + (i + 1) });
      b.appendChild(el('span', { classe: 'ci-pastille' }));
      var img = image({ src: k.image && k.image.src, alt: '' }, ''); if (img) b.appendChild(img);
      b.addEventListener('click', function () { toucher('g', i); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toucher('g', i); } });
      colG.appendChild(b); return b;
    });
    var D = droite.map(function (ci) {
      var k = p.cases[ci];
      var b = el('div', { classe: 'ci-paire', role: 'button', tabindex: '0' });
      b.appendChild(el('span', { classe: 'ci-pastille' }));
      b.appendChild(son(k.titre, b, k.titre));
      b.appendChild(el('span', { texte: k.titre }));
      b.addEventListener('click', function () { toucher('d', ci); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toucher('d', ci); } });
      colD.appendChild(b); return { b: b, ci: ci };
    });
    function dessiner() {
      G.forEach(function (b, i) {
        var l = r.lien[i];
        b.classList.toggle('ci-relie', l != null);
        b.setAttribute('aria-pressed', choix && choix.c === 'g' && choix.i === i ? 'true' : 'false');
        var pa = b.querySelector('.ci-pastille'); pa.textContent = String(i + 1); pa.style.background = COULEURS[i % COULEURS.length];
      });
      D.forEach(function (x) {
        var g = null; Object.keys(r.lien).forEach(function (k) { if (r.lien[k] === x.ci) g = +k; });
        x.b.classList.toggle('ci-relie', g != null);
        x.b.setAttribute('aria-pressed', choix && choix.c === 'd' && choix.i === x.ci ? 'true' : 'false');
        var pa = x.b.querySelector('.ci-pastille'); if (g != null) { pa.textContent = String(g + 1); pa.style.background = COULEURS[g % COULEURS.length]; }
      });
    }
    function toucher(c, i) {
      G.concat(D.map(function (x) { return x.b; })).forEach(function (b) { b.classList.remove('ci-juste', 'ci-faux'); });
      if (!choix || choix.c === c) { choix = (choix && choix.c === c && choix.i === i) ? null : { c: c, i: i }; dessiner(); return; }
      var g = c === 'g' ? i : choix.i, d = c === 'd' ? i : choix.i;
      Object.keys(r.lien).forEach(function (k) { if (r.lien[k] === d) delete r.lien[k]; });
      r.lien[g] = d; choix = null; sauver(); dessiner();
    }
    dessiner();
    grille.appendChild(colG); grille.appendChild(colD); zone.appendChild(grille);
    actions(zone, n, function () {
      var ok = true;
      G.forEach(function (b, i) {
        b.classList.remove('ci-juste', 'ci-faux');
        if (r.lien[i] != null) b.classList.add(r.lien[i] === i ? 'ci-juste' : 'ci-faux');
        if (r.lien[i] !== i) ok = false;
      });
      return { ok: ok, texte: ok ? '' : 'Pas encore. Relie chaque image, puis regarde les images en rouge.' };
    }, function () {
      p.cases.forEach(function (_, i) { r.lien[i] = i; }); choix = null; dessiner();
      G.forEach(function (b) { b.classList.remove('ci-faux'); b.classList.add('ci-juste'); });
      return 'La correction : ' + p.cases.map(function (k, i) { return 'image ' + (i + 1) + ' : ' + k.titre; }).join(' ; ') + '.';
    }, function () { r.lien = {}; });
  }

  /* Je complète : toucher un mot, puis le trou. */
  function rendreCompleter(p, zone, n) {
    var r = rep(n); r.trou = r.trou || p.cases.map(function () { return null; });
    var choisi = null;
    if (p.texte) zone.appendChild(consigne(p.texte));
    zone.appendChild(consigne('Touche un mot, puis touche le trou où il va.', 'ci-geste'));
    var banque = el('div', { classe: 'ci-banque', 'aria-label': 'Les mots à placer' });
    var ordre = melanger(p.cases.map(function (_, i) { return i; }), 1);
    var etiquettes = {};
    ordre.forEach(function (ci) {
      var k = p.cases[ci];
      var e = el('div', { classe: 'ci-etiquette', role: 'button', tabindex: '0', 'aria-pressed': 'false' });
      e.appendChild(el('span', { texte: k.titre }));
      e.appendChild(son(k.titre, e, k.titre));
      e.addEventListener('click', function () { choisi = choisi === ci ? null : ci; dessiner(); });
      e.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choisi = choisi === ci ? null : ci; dessiner(); } });
      etiquettes[ci] = e;
    });
    var liste = el('div', { classe: 'ci-trous' });
    var trous = p.cases.map(function (k, i) {
      var li = el('div', { classe: 'ci-trou-ligne' });
      li.appendChild(son(k.texte, li, 'la phrase ' + (i + 1)));
      var img = image(k.image, k.texte); if (img) li.appendChild(img);
      var ph = el('div', { classe: 'ci-phrase' });
      var morceaux = String(k.texte).split(/_{3,}/);
      var trou = el('span', { classe: 'ci-trou', role: 'button', tabindex: '0', 'aria-label': 'Trou de la phrase ' + (i + 1) });
      trou.addEventListener('click', function () { placer(i); });
      trou.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); placer(i); } });
      ph.appendChild(document.createTextNode(morceaux[0] || ''));
      ph.appendChild(trou);
      ph.appendChild(document.createTextNode(morceaux.slice(1).join(' ')));
      li.appendChild(ph);
      liste.appendChild(li);
      return { li: li, trou: trou };
    });
    function dessiner() {
      ordre.forEach(function (ci) {
        var e = etiquettes[ci], place = r.trou.indexOf(ci);
        e.setAttribute('aria-pressed', choisi === ci ? 'true' : 'false');
        if (place >= 0) trous[place].trou.appendChild(e); else banque.appendChild(e);
      });
      trous.forEach(function (t, i) { if (r.trou[i] == null) { t.trou.innerHTML = ''; t.trou.textContent = '…'; } else if (t.trou.firstChild && t.trou.firstChild.nodeType === 3) t.trou.removeChild(t.trou.firstChild); });
    }
    function placer(i) {
      trous.forEach(function (t) { t.li.classList.remove('ci-juste', 'ci-faux'); });
      if (choisi == null) { if (r.trou[i] != null) { r.trou[i] = null; sauver(); dessiner(); } return; }
      var avant = r.trou.indexOf(choisi); if (avant >= 0) r.trou[avant] = null;
      if (r.trou[i] != null) r.trou[i] = null;
      r.trou[i] = choisi; choisi = null; sauver(); dessiner();
    }
    zone.appendChild(banque); zone.appendChild(liste);
    dessiner();
    actions(zone, n, function () {
      var ok = true;
      trous.forEach(function (t, i) {
        t.li.classList.remove('ci-juste', 'ci-faux');
        var bon = r.trou[i] != null && p.cases[r.trou[i]].titre === p.cases[i].titre;
        if (r.trou[i] != null) t.li.classList.add(bon ? 'ci-juste' : 'ci-faux');
        if (!bon) ok = false;
      });
      return { ok: ok, texte: ok ? '' : 'Pas encore. Place tous les mots, puis regarde les phrases en rouge.' };
    }, function () {
      r.trou = p.cases.map(function (_, i) { return i; }); choisi = null; dessiner();
      trous.forEach(function (t) { t.li.classList.remove('ci-faux'); t.li.classList.add('ci-juste'); });
      return 'La correction : ' + p.cases.map(function (k) { return String(k.texte).replace(/_{3,}/, k.titre); }).join(' ');
    }, function () { r.trou = null; });
  }

  function rendreEcrire(p, zone, n) {
    var r = rep(n);
    zone.appendChild(consigne(p.texte || 'J’écris ma réponse.'));
    var img = image(p.image, p.titre, { large: true }); if (img) zone.appendChild(img);
    var t = el('textarea', { 'aria-label': 'Ma réponse' });
    t.value = r.texte || '';
    t.addEventListener('input', function () { r.texte = t.value; sauver(); });
    zone.appendChild(el('div', { classe: 'ci-ecrire' }, [t]));
  }

  /* ---------- page ---------- */
  var zonePage, nav, btnPrec, btnSuiv, ou, barre;
  function afficherPage() {
    arreter();
    var n = etat.page, p = C.pages[n];
    zonePage.innerHTML = '';
    if (p.gabarit !== 'couverture') zonePage.appendChild(entete(p, n));
    var corps = el('div');
    zonePage.appendChild(corps);
    var g = p.gabarit;
    if (g === 'couverture') rendreCouverture(p, corps);
    else if (g === 'etapes') rendreEtapes(p, corps);
    else if (g === 'document') rendreDocument(p, corps);
    else if (g === 'choix') rendreChoix(p, corps, n);
    else if (g === 'vraifaux') rendreVraiFaux(p, corps, n);
    else if (g === 'classer') rendreClasser(p, corps, n);
    else if (g === 'relier') rendreRelier(p, corps, n);
    else if (g === 'completer') rendreCompleter(p, corps, n);
    else if (g === 'ecrire') rendreEcrire(p, corps, n);
    else rendreCases(p, corps);
    if (C.credits) zonePage.appendChild(el('p', { classe: 'ci-credits', texte: C.credits }));
    btnPrec.disabled = n === 0; btnSuiv.disabled = n === C.pages.length - 1;
    ou.textContent = 'Page ' + (n + 1) + ' / ' + C.pages.length;
    barre.style.width = ((n + 1) / C.pages.length * 100) + '%';
    document.title = (p.titre || C.titre) + ' — ' + C.titre;
    window.scrollTo(0, 0);
    var h = document.getElementById('ci-h1'); if (h) h.focus({ preventScroll: true });
    sauver();
  }
  function aller(d) {
    var n = Math.max(0, Math.min(C.pages.length - 1, etat.page + d));
    if (n === etat.page) return;
    etat.page = n; afficherPage();
  }

  /* ---------- réglages, fichier ---------- */
  function appliquerReglages() {
    document.documentElement.style.setProperty('--fs', etat.taille + 'px');
    if (etat.theme) document.documentElement.setAttribute('data-theme', etat.theme); else document.documentElement.removeAttribute('data-theme');
  }
  function enregistrer() {
    var donnees = { format: 'mapse-cours-images', version: 1, cours: C.id, titre: C.titre, date: new Date().toISOString(), page: etat.page, reponses: etat.rep };
    var blob = new Blob([JSON.stringify(donnees, null, 1)], { type: 'application/json' });
    var a = el('a', { href: URL.createObjectURL(blob), download: C.id + '_cours-en-images.json' });
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function reprendre(fichier) {
    var lu = new FileReader();
    lu.onload = function () {
      try {
        var d = JSON.parse(lu.result);
        if (d.format !== 'mapse-cours-images' || d.cours !== C.id) { alert('Ce fichier n’est pas un enregistrement de ce cours.'); return; }
        etat.rep = d.reponses || {}; etat.page = Math.max(0, Math.min(C.pages.length - 1, d.page || 0));
        afficherPage();
      } catch (e) { alert('Ce fichier ne peut pas être lu.'); }
    };
    lu.readAsText(fichier);
  }

  /* ---------- montage ---------- */
  function monter() {
    try { var s = JSON.parse(localStorage.getItem(CLE) || 'null'); if (s && s.rep) { etat.rep = s.rep; etat.page = Math.min(C.pages.length - 1, s.page || 0); etat.taille = s.taille || 20; etat.theme = s.theme || ''; } } catch (e) { /* rien */ }
    appliquerReglages();
    var fichier = el('input', { type: 'file', accept: '.json,application/json', classe: 'ci-fichier', 'aria-hidden': 'true', tabindex: '-1' });
    fichier.addEventListener('change', function () { if (fichier.files[0]) reprendre(fichier.files[0]); fichier.value = ''; });
    barre = el('i');
    var haut = el('header', { classe: 'ci-haut' }, [
      el('a', { classe: 'ci-bouton', href: C.retour || 'index.html', 'aria-label': 'Retour au module' }, ['🏠']),
      el('div', { classe: 'ci-module', texte: C.titre }),
      el('div', { classe: 'ci-outils' }, [
        el('button', { type: 'button', classe: 'ci-bouton', 'aria-label': 'Texte plus petit', onclick: function () { etat.taille = Math.max(16, etat.taille - 2); appliquerReglages(); sauver(); } }, ['A−']),
        el('button', { type: 'button', classe: 'ci-bouton', 'aria-label': 'Texte plus grand', onclick: function () { etat.taille = Math.min(30, etat.taille + 2); appliquerReglages(); sauver(); } }, ['A+']),
        el('button', { type: 'button', classe: 'ci-bouton', 'aria-label': 'Fort contraste', onclick: function () { etat.theme = etat.theme ? '' : 'contraste'; appliquerReglages(); sauver(); } }, ['◐']),
        el('button', { type: 'button', classe: 'ci-bouton', onclick: enregistrer, title: 'Enregistrer mon travail dans un fichier', 'aria-label': 'Enregistrer mon travail dans un fichier' }, ['💾', el('span', { classe: 'ci-libelle', texte: ' Enregistrer' })]),
        el('button', { type: 'button', classe: 'ci-bouton', onclick: function () { fichier.click(); }, title: 'Reprendre un travail enregistré', 'aria-label': 'Reprendre un travail enregistré' }, ['📂', el('span', { classe: 'ci-libelle', texte: ' Reprendre' })])
      ]),
      el('div', { classe: 'ci-progres', 'aria-hidden': 'true' }, [barre]),
      fichier
    ]);
    zonePage = el('main', { classe: 'ci-page', id: 'contenu' });
    btnPrec = el('button', { type: 'button', classe: 'ci-bouton', onclick: function () { aller(-1); } }, ['◀ Précédent']);
    btnSuiv = el('button', { type: 'button', classe: 'ci-bouton ci-fort', onclick: function () { aller(1); } }, ['Suivant ▶']);
    ou = el('div', { classe: 'ci-ou', 'aria-live': 'polite' });
    nav = el('nav', { classe: 'ci-nav', 'aria-label': 'Pages du cours' }, [btnPrec, ou, btnSuiv]);
    lecteurDit = el('span', { classe: 'ci-dit' });
    btnPause = el('button', { type: 'button', onclick: basculerPause }, ['⏸ Pause']);
    lecteur = el('div', { classe: 'ci-lecteur', role: 'region', 'aria-label': 'Lecture en cours' }, [el('span', { 'aria-hidden': 'true', texte: '🔊' }), lecteurDit, btnPause, el('button', { type: 'button', onclick: arreter, 'aria-label': 'Arrêter la lecture' }, ['⏹ Arrêter'])]);
    racine.innerHTML = '';
    racine.appendChild(haut); racine.appendChild(zonePage); racine.appendChild(lecteur); racine.appendChild(nav);
    if (!synth) zonePage.insertAdjacentElement('beforebegin', el('p', { classe: 'ci-consigne', style: 'margin:10px', texte: 'La lecture à voix haute n’est pas disponible sur cet appareil.' }));
    document.addEventListener('keydown', function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); aller(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); aller(-1); }
      else if (e.key === 'Escape') arreter();
    });
    window.addEventListener('pagehide', arreter);
    document.addEventListener('visibilitychange', function () { if (document.hidden && L.morceaux.length && !L.enPause) basculerPause(); });
    afficherPage();
  }
  monter();
})();
