/* plateau.js — « Mon plateau technique » : jeu du chef-d'œuvre CAP PSR (demande de Brahim, 18/11/2026).
 * Objectif : se situer dans le plateau technique, nommer les espaces, identifier chaque objet et apprendre son nom exact.
 * 1) Les espaces : placer le nom de chaque espace sur le plan du plateau.
 * 2) Une pièce à la fois (Petit Gourmet, distribution, laverie, atelier production) : placer librement les objets,
 *    puis « Vérifier » : ce qui est juste devient vert, ce qui est faux est marqué en rouge avec un indice.
 *    Quatre niveaux : Découverte (emplacements et noms) → Apprenti (emplacements) → Commis (pièce vide) → Chef (les noms seuls, chrono).
 * Données : plateau/donnees-plateau.js (généré depuis le référentiel du plateau et la bibliothèque d'images).
 * Progression : D.etat().plateau, enregistrée sur l'ordinateur avec le reste du parcours (pas d'envoi en ligne de ce jeu).
 */
(function () {
  'use strict';
  var PD = window.CDO_PLATEAU_DONNEES;
  var NIVEAUX = [
    { n: 1, nom: 'Découverte', aide: 'Les emplacements et les noms sont dessinés dans la pièce.', tol: 5 },
    { n: 2, nom: 'Apprenti', aide: 'Les emplacements sont dessinés, sans les noms.', tol: 5 },
    { n: 3, nom: 'Commis', aide: 'La pièce est vide : il faut se souvenir de la place de chaque objet.', tol: 7 },
    { n: 4, nom: 'Chef', aide: 'Les objets arrivent avec leur nom seulement. Le temps est compté.', tol: 7 }
  ];
  var BRAVO = ['Bravo !', 'Très bien !', 'Excellent !', 'Super, c’est juste !', 'Tu connais ta cuisine !', 'Parfait !', 'Bien joué !', 'Quel professionnel !'];
  var COURAGE = ['Presque ! Regarde les indices.', 'Continue, tu progresses !', 'Pas grave, on corrige et on recommence.', 'Observe bien les murs de la pièce.'];
  var CODES_LIBRES = ['ESSAI', 'PROF', 'PROFPSE', 'PROFPSR'];

  function D() { return window.CDO_DONNEES; }
  function A() { return window.CDO_AUDIO; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hasard(t) { return t[Math.floor(Math.random() * t.length)]; }
  function melanger(t) { t = t.slice(); for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; } return t; }
  function dire(t) { var a = A(); if (a && a.disponible) a.lire(t); }

  /* ───── progression ───── */
  function prog() {
    var e = D().etat(); e.plateau = e.plateau || { espaces: null, pieces: {}, mots: [] };
    e.plateau.pieces = e.plateau.pieces || {}; e.plateau.mots = e.plateau.mots || [];
    return e.plateau;
  }
  function libre() { return CODES_LIBRES.indexOf(D().code()) >= 0; }
  function resultat(pid, n) { var p = prog().pieces[pid]; return p && p[n]; }
  function niveauOuvert(pid, n) {
    if (libre()) return true;
    if (!prog().espaces) return false;
    var i = PD.pieces.findIndex(function (p) { return p.id === pid; });
    if (n === 1) return i === 0 || !!resultat(PD.pieces[i - 1].id, 1);
    return !!resultat(pid, n - 1);
  }
  function etoilesTotales() {
    var t = prog().espaces ? prog().espaces.etoiles : 0;
    Object.keys(prog().pieces).forEach(function (k) { Object.keys(prog().pieces[k]).forEach(function (n) { t += prog().pieces[k][n].etoiles || 0; }); });
    return t;
  }
  var minuterieNuage = null, charge = null;
  function etatNuage(t) { var b = document.querySelector('.pl-nuage'); if (b) { b.textContent = t; } }
  function envoyerNuage() {
    clearTimeout(minuterieNuage);
    if (!D().enLigne()) { etatNuage('💾 Enregistré sur cet ordinateur'); return; }
    etatNuage('☁️ Enregistrement…');
    D().plateauEcrire(prog()).then(function (ok) { etatNuage(ok ? '☁️ Enregistré en ligne' : '💾 Enregistré sur cet ordinateur (hors ligne)'); });
  }
  /* Tout est enregistré : sur l'ordinateur tout de suite, en ligne 1 s après le dernier geste. */
  function sauver() {
    prog().maj = new Date().toISOString(); D().enregistrer();
    clearTimeout(minuterieNuage); minuterieNuage = setTimeout(envoyerNuage, 1000);
  }
  window.addEventListener('pagehide', function () { if (minuterieNuage) envoyerNuage(); });
  /* Au premier passage : on reprend la version la plus récente (en ligne ou sur cet ordinateur). */
  function chargerNuage() {
    var c = D().code();
    if (charge && charge.code === c) return charge.p;
    var p = (D().enLigne() ? D().plateauLire() : Promise.resolve(null)).then(function (nuage) {
      var loc = prog();
      if (nuage && (!loc.maj || nuage.maj > loc.maj)) { D().etat().plateau = nuage; D().enregistrer(); }
      else if (loc.maj && (!nuage || loc.maj > nuage.maj)) envoyerNuage();
    }).catch(function () {});
    charge = { code: c, p: p }; return p;
  }
  function encours(cle, val) {
    var P = prog(); P.encours = P.encours || {};
    if (val === undefined) return P.encours[cle];
    if (val === null) delete P.encours[cle]; else P.encours[cle] = val;
  }
  function noterMots(liste) { var m = prog().mots; liste.forEach(function (x) { if (m.indexOf(x) < 0) m.push(x); }); }
  function etoiles(n) { var s = ''; for (var i = 1; i <= 3; i++) s += '<span class="pl-et' + (i <= n ? ' pris' : '') + '">★</span>'; return s; }

  /* ───── sons légers ───── */
  var ctx = null;
  function bip(f, d, type, vol) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(vol || 0.08, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + d);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + d);
    } catch (e) { /* pas de son */ }
  }
  function sonJuste() { bip(660, .12); setTimeout(function () { bip(880, .18); }, 110); }
  function sonFaux() { bip(220, .25, 'triangle', .06); }
  function sonFin() { [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { bip(f, .22); }, i * 130); }); }

  function confettis(hote) {
    var c = document.createElement('div'); c.className = 'pl-confettis'; c.setAttribute('aria-hidden', 'true');
    var coul = ['#0f6b63', '#f2b705', '#b4470f', '#2563eb', '#16a34a', '#db2777'];
    for (var i = 0; i < 70; i++) {
      var s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.background = hasard(coul);
      s.style.animationDelay = (Math.random() * .6) + 's'; s.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      s.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)'; c.appendChild(s);
    }
    hote.appendChild(c); setTimeout(function () { c.remove(); }, 3600);
  }
  function bulle(hote, texte, classe) {
    var b = document.createElement('div'); b.className = 'pl-toast ' + (classe || ''); b.textContent = texte; hote.appendChild(b);
    setTimeout(function () { b.classList.add('part'); }, 1500); setTimeout(function () { b.remove(); }, 2100);
  }

  /* ───── glisser-déposer commun (souris et doigt) ───── */
  function glisser(el, quand) {
    el.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0 || el.classList.contains('bloque')) return;
      ev.preventDefault();
      var depart = { x: ev.clientX, y: ev.clientY }, bouge = false, fantome = null;
      function mv(e) {
        if (!bouge && Math.hypot(e.clientX - depart.x, e.clientY - depart.y) < 6) return;
        if (!bouge) { bouge = true; fantome = quand.debut(e); }
        if (fantome) { fantome.style.left = e.clientX + 'px'; fantome.style.top = e.clientY + 'px'; }
        quand.survol && quand.survol(e);
      }
      function up(e) {
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
        if (fantome) fantome.remove();
        if (bouge) quand.fin(e); else quand.toucher && quand.toucher(e);
      }
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    });
  }
  function fantomeDe(contenu, largeur, hauteur, rond) {
    var f = document.createElement('div'); f.className = 'pl-fantome' + (rond ? ' rond' : '');
    f.style.width = largeur + 'px'; f.style.height = hauteur + 'px'; f.innerHTML = contenu; document.body.appendChild(f); return f;
  }

  /* ═════════ Menu « Mon plateau technique » ═════════ */
  function menu(vue) {
    var P = prog(), esp = P.espaces;
    var lignes = PD.pieces.map(function (p, i) {
      var ouverte = niveauOuvert(p.id, 1);
      var niv = NIVEAUX.map(function (N) {
        var r = resultat(p.id, N.n), ok = niveauOuvert(p.id, N.n);
        return ok ? '<a class="pl-niv' + (r ? ' fait' : '') + '" href="#plateau/' + p.id + '/' + N.n + '"><b>' + N.n + '</b><span>' + N.nom + '</span><span class="pl-mini-et">' + etoiles(r ? r.etoiles : 0) + '</span></a>'
          : '<span class="pl-niv ferme" title="À débloquer"><b>🔒</b><span>' + N.nom + '</span></span>';
      }).join('');
      return '<div class="pl-carte-piece' + (ouverte ? '' : ' fermee') + '"><div class="pl-carte-t"><span class="pl-num">' + (i + 2) + '</span><div><h3>' + esc(p.nom) + '</h3><p>' + p.objets.length + ' objets à placer' + (ouverte ? '' : ' · se débloque après la pièce précédente') + '</p></div></div><div class="pl-nivs">' + niv + '</div></div>';
    }).join('');
    vue.innerHTML = '<div class="pl-menu">' +
      '<div class="pl-banniere"><div><h1>Mon plateau technique</h1><p>Apprendre à se situer dans le plateau, à nommer les espaces et chaque objet. Le plateau se remplit au fur et à mesure.</p></div>' +
      '<div class="pl-score"><span class="pl-gros">' + etoilesTotales() + '</span><span>★ gagnées</span><span class="pl-mots-n">' + P.mots.length + ' mots appris</span></div></div>' +
      '<div class="pl-carte-piece"><div class="pl-carte-t"><span class="pl-num">1</span><div><h3>Les espaces du plateau</h3><p>Placer le nom de chaque espace sur le plan.</p></div></div><div class="pl-nivs">' +
      '<a class="pl-niv' + (esp ? ' fait' : '') + '" href="#plateau/espaces"><b>1</b><span>Les espaces</span><span class="pl-mini-et">' + etoiles(esp ? esp.etoiles : 0) + '</span></a></div></div>' +
      lignes +
      (P.mots.length ? '<details class="pl-mots"><summary>Mes mots du plateau (' + P.mots.length + ')</summary><ul>' + P.mots.map(function (m) { return '<li>' + A().interne(m) + esc(m) + '</li>'; }).join('') + '</ul></details>' : '') +
      '<p class="pl-discret">D’autres pièces arriveront : local d’entretien, salle d’approvisionnement, légumerie et plonge.</p></div>';
  }

  /* ═════════ Jeu 1 : les espaces ═════════ */
  function dansPoly(x, y, poly) {
    var dedans = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) dedans = !dedans;
    }
    return dedans;
  }
  function centrePoly(e) {
    var C = { 'Grand couloir': [407, 470], 'Local d’entretien': [600, 385], 'Atelier production (cuisine)': [190, 540] };
    if (C[e.nom]) return C[e.nom];
    var xs = e.poly.map(function (q) { return q[0]; }), ys = e.poly.map(function (q) { return q[1]; });
    return [(Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2, (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2];
  }
  function jeuEspaces(vue) {
    var c = PD.cadre, W = c[2] - c[0] + 40, H = c[3] - c[1] + 70, ox = c[0] - 20, oy = c[1] - 30;
    var ec = encours('espaces') || {};
    var place = ec.place || {}, erreurs = ec.erreurs || 0, verifs = ec.verifs || 0, valides = ec.valides || [];   // place[nom étiquette] = nom de l'espace où elle est posée
    function garder() { encours('espaces', { place: place, erreurs: erreurs, verifs: verifs, valides: valides }); sauver(); }
    var noms = melanger(PD.espaces.map(function (e) { return e.nom; }));
    vue.innerHTML = '<div class="pl-jeu pl-jeu-espaces"><div class="pl-consigne"><h1>Les espaces du plateau</h1><p><b>Placer</b> le nom de chaque espace sur le plan. Tu entres par le bas : l’entrée du grand couloir.</p></div>' +
      '<div class="pl-scene"><div class="pl-carte-wrap"><svg class="pl-carte" viewBox="' + ox + ' ' + oy + ' ' + W + ' ' + H + '">' +
      PD.espaces.map(function (e, i) { return '<polygon data-esp="' + i + '" class="' + (e.couloir ? 'couloir' : '') + '" points="' + e.poly.map(function (q) { return q.join(','); }).join(' ') + '"/>'; }).join('') +
      PD.portes.map(function (q) { return '<line class="porte" x1="' + q[0] + '" y1="' + q[1] + '" x2="' + q[2] + '" y2="' + q[3] + '"/>'; }).join('') +
      '<text class="entree" x="' + PD.entree[0] + '" y="' + (PD.entree[1] + 26) + '" text-anchor="middle">▲ ENTRÉE</text></svg><div class="pl-etiq-poses"></div></div>' +
      '<div class="pl-bac"><p class="pl-bac-t">Les noms à placer</p><div class="pl-bac-liste"></div></div></div>' +
      '<div class="pl-actions"><button type="button" class="cdo-btn" data-verifier>Vérifier</button><span class="pl-compteur"></span><span class="pl-nuage"></span></div><div class="pl-retours" aria-live="polite"></div></div>';
    var svg = vue.querySelector('svg'), poses = vue.querySelector('.pl-etiq-poses'), bac = vue.querySelector('.pl-bac-liste'), scene = vue.querySelector('.pl-scene');
    function versPlan(cx, cy) {
      var r = svg.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H), dx = (r.width - W * s) / 2, dy = (r.height - H * s) / 2;
      return [(cx - r.left - dx) / s + ox, (cy - r.top - dy) / s + oy];
    }
    function versEcran(x, y) {
      var r = svg.getBoundingClientRect(), w = poses.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H), dx = (r.width - W * s) / 2, dy = (r.height - H * s) / 2;
      return [(x - ox) * s + dx + r.left - w.left, (y - oy) * s + dy + r.top - w.top];
    }
    function etiquette(nom, etat) {
      var b = document.createElement('div'); b.className = 'pl-etiq ' + (etat || ''); b.textContent = nom; b.dataset.nom = nom;
      glisser(b, {
        debut: function () { b.classList.add('prise'); return fantomeDe(esc(nom), b.offsetWidth, b.offsetHeight); },
        fin: function (e) {
          b.classList.remove('prise');
          var q = versPlan(e.clientX, e.clientY), cible = PD.espaces.filter(function (x) { return dansPoly(q[0], q[1], x.poly); })[0];
          if (cible) {
            Object.keys(place).forEach(function (k) { if (place[k] === cible.nom && k !== nom) delete place[k]; });   // une étiquette par espace
            place[nom] = cible.nom; bip(520, .06);
          } else delete place[nom];
          dessiner(); garder();
        },
        toucher: function () { dire(nom); }
      });
      return b;
    }
    function dessiner(corr) {
      poses.innerHTML = ''; bac.innerHTML = '';
      noms.forEach(function (nom) {
        if (place[nom]) {
          var e = PD.espaces.filter(function (x) { return x.nom === place[nom]; })[0], q = versEcran.apply(null, centrePoly(e));
          var et = valides.indexOf(nom) >= 0 ? 'juste bloque' : corr ? 'faux' : '';
          var b = etiquette(nom, et); b.style.left = q[0] + 'px'; b.style.top = q[1] + 'px'; poses.appendChild(b);
        } else bac.appendChild(etiquette(nom));
      });
      vue.querySelector('.pl-compteur').textContent = Object.keys(place).length + ' / ' + noms.length + ' placés';
    }
    window.addEventListener('resize', function r() { if (!document.body.contains(svg)) return window.removeEventListener('resize', r); dessiner(); });
    dessiner();
    vue.querySelector('[data-verifier]').onclick = function () {
      verifs++;
      var justes = noms.filter(function (n) { return place[n] === n; }); justes.forEach(function (n) { if (valides.indexOf(n) < 0) valides.push(n); });
      var faux = Object.keys(place).filter(function (n) { return place[n] !== n; });
      erreurs += faux.length;
      dessiner(true);
      var ret = vue.querySelector('.pl-retours');
      if (justes.length === noms.length) {
        var et = erreurs === 0 ? 3 : erreurs <= 3 ? 2 : 1;
        var P = prog(); if (!P.espaces || et > P.espaces.etoiles) P.espaces = { etoiles: et, erreurs: erreurs, date: new Date().toISOString() };
        noterMots(noms); encours('espaces', null); sauver(); sonFin(); confettis(scene);
        fin(vue, 'Les espaces du plateau', et, erreurs, null, noms, '#plateau/' + PD.pieces[0].id + '/1', 'Entrer dans le ' + PD.pieces[0].nom.replace('Restaurant ', 'restaurant '));
        return;
      }
      if (faux.length) { sonFaux(); faux.forEach(function (n) { delete place[n]; }); setTimeout(function () { dessiner(); }, 1400); }
      else if (justes.length) sonJuste();
      garder();
      ret.innerHTML = '<p class="pl-msg ' + (faux.length ? 'courage' : 'bravo') + '">' + (faux.length ? hasard(COURAGE) + ' ' + faux.length + ' nom' + (faux.length > 1 ? 's sont' : ' est') + ' mal placé' + (faux.length > 1 ? 's' : '') + ' : ' + (faux.length > 1 ? 'ils reviennent' : 'il revient') + ' dans la liste.' : hasard(BRAVO) + ' Place les noms qui restent.') + '</p>';
    };
  }

  /* ═════════ Jeu 2 : une pièce ═════════ */
  function jeuPiece(vue, pid, n) {
    var P = PD.pieces.filter(function (p) { return p.id === pid; })[0], N = NIVEAUX[n - 1];
    if (!P || !N) { location.hash = 'plateau'; return; }
    if (!niveauOuvert(pid, n)) { location.hash = 'plateau'; return; }
    var objets = P.objets.map(function (o, i) { return Object.assign({ k: i }, o); });
    var cleEC = pid + '-' + n, ec = encours(cleEC) || {};
    var pose = ec.pose || {}, juste = ec.juste || {}, essais = ec.essais || {}, erreurs = ec.erreurs || 0, debut = Date.now() - (ec.temps || 0) * 1000, minuteur = null;
    function garder() { encours(cleEC, { pose: pose, juste: juste, essais: essais, erreurs: erreurs, temps: Math.round((Date.now() - debut) / 1000) }); sauver(); }
    var ordre = melanger(objets);
    var chef = n === 4;
    vue.innerHTML = '<div class="pl-jeu"><div class="pl-consigne"><h1>' + esc(P.nom) + '</h1><p class="pl-niv-badge">Niveau ' + n + ' · ' + N.nom + '</p><p><b>Placer</b> chaque objet à sa place dans la pièce, puis <b>vérifier</b>. ' + esc(N.aide) + '</p></div>' +
      '<div class="pl-barre"><div class="pl-barre-r"></div></div>' +
      '<div class="pl-scene"><div class="pl-piece" style="aspect-ratio:' + (1 / P.ratio) + '"><img class="pl-fond" src="' + P.fond + '" alt="Plan vu de dessus : ' + esc(P.nom) + ', vide." draggable="false"><div class="pl-cibles"></div><div class="pl-poses"></div><div class="pl-splash">' + esc(P.nom) + '</div></div>' +
      '<div class="pl-bac"><p class="pl-bac-t">Les objets à placer <span class="pl-reste"></span></p><div class="pl-bac-liste"></div></div></div>' +
      '<div class="pl-actions"><button type="button" class="cdo-btn" data-verifier>Vérifier</button>' + (chef ? '<span class="pl-chrono">0:00</span>' : '') + '<span class="pl-compteur"></span><span class="pl-nuage"></span></div>' +
      '<div class="pl-retours" aria-live="polite"></div></div>';
    var piece = vue.querySelector('.pl-piece'), cibles = vue.querySelector('.pl-cibles'), poses = vue.querySelector('.pl-poses'), bac = vue.querySelector('.pl-bac-liste'), scene = vue.querySelector('.pl-scene');
    setTimeout(function () { var s = vue.querySelector('.pl-splash'); if (s) s.classList.add('part'); }, 1600);
    dire(P.nom);
    if (chef) minuteur = setInterval(function () {
      if (!document.body.contains(vue.querySelector('.pl-chrono'))) return clearInterval(minuteur);
      var t = Math.floor((Date.now() - debut) / 1000); vue.querySelector('.pl-chrono').textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    }, 500);
    // emplacements dessinés (niveaux 1 et 2)
    if (n <= 2) cibles.innerHTML = objets.map(function (o) {
      return '<div class="pl-cible' + (o.mur ? ' rond' : '') + '" data-c="' + o.k + '" style="' + boite(o) + '">' + (n === 1 ? '<span>' + esc(o.nom) + '</span>' : '') + '</div>';
    }).join('');
    function boite(o) {
      if (o.mur) return 'left:' + (o.x + o.l / 2) + '%;top:' + (o.y + o.h / 2) + '%;';
      return 'left:' + o.x + '%;top:' + o.y + '%;width:' + o.l + '%;height:' + o.h + '%;';
    }
    function tailleEcran(o) {
      var r = piece.getBoundingClientRect();
      if (o.mur) { var d = Math.max(30, r.width * 0.055); return [d, d]; }
      return [Math.max(16, r.width * o.l / 100), Math.max(16, r.height * o.h / 100)];
    }
    function visuel(o, nomSeul) {
      return nomSeul ? '<span class="pl-nom-seul">' + esc(o.nom) + '</span>' : '<img src="' + o.img + '" alt="" draggable="false">';
    }
    function info(o, el) {
      var vieille = vue.querySelector('.pl-info'); if (vieille) vieille.remove();
      var b = document.createElement('div'); b.className = 'pl-info';
      b.innerHTML = '<img src="' + o.img + '" alt=""><div><b>' + esc(o.nom) + '</b>' + (o.fonction ? '<span>' + esc(o.fonction) + '</span>' : '') + '</div>' + A().interne(o.nom + '. ' + (o.fonction || ''));
      scene.appendChild(b); dire(o.nom);
      setTimeout(function () { b.classList.add('part'); }, 3200); setTimeout(function () { b.remove(); }, 3700);
    }
    function centreCible(o) { return [o.x + o.l / 2, o.y + o.h / 2]; }
    function estJuste(o, pos) {
      // les objets de même nom (deux tables, deux armoires…) sont interchangeables
      var tol = N.tol, pris = Object.keys(juste).map(function (k) { return juste[k]; });
      return objets.filter(function (c) { return c.nom === o.nom && pris.indexOf(c.k) < 0; }).filter(function (c) {
        if (c.mur) { var cc = centreCible(c); return Math.abs(pos[0] - cc[0]) <= tol + 1 && Math.abs(pos[1] - cc[1]) <= (tol + 1) / P.ratio; }
        return pos[0] >= c.x - tol && pos[0] <= c.x + c.l + tol && pos[1] >= c.y - tol / P.ratio && pos[1] <= c.y + c.h + tol / P.ratio;
      })[0];
    }
    function element(o, dansBac) {
      var b = document.createElement('div'); b.className = 'pl-obj' + (o.mur ? ' rond' : '') + (juste[o.k] != null ? ' juste bloque' : '') + (pose[o.k] && pose[o.k].faux ? ' faux' : '');
      b.dataset.k = o.k;
      if (dansBac) {
        b.className += ' dans-bac';
        b.innerHTML = (chef ? '' : '<span class="pl-vign">' + visuel(o) + '</span>') + '<span class="pl-obj-nom">' + esc(o.nom) + '</span>';
      } else {
        var oo = juste[o.k] != null ? objets[juste[o.k]] : o;   // un objet juste prend la forme de sa place (ex. table posée en long ou en large)
        var t = tailleEcran(oo); b.style.width = t[0] + 'px'; b.style.height = t[1] + 'px';
        var pos = pose[o.k].p; b.style.left = pos[0] + '%'; b.style.top = pos[1] + '%';
        b.innerHTML = visuel(oo);
        b.title = o.nom;
      }
      glisser(b, {
        debut: function () { b.classList.add('prise'); var t = tailleEcran(o); return fantomeDe(visuel(o), t[0], t[1], o.mur); },
        survol: function () {},
        fin: function (e) {
          b.classList.remove('prise');
          var r = piece.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            pose[o.k] = { p: [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100] }; bip(500, .05);
          } else delete pose[o.k];
          dessiner(); garder();
        },
        toucher: function () { info(o, b); }
      });
      return b;
    }
    function dessiner() {
      poses.innerHTML = ''; bac.innerHTML = '';
      ordre.forEach(function (o) { if (pose[o.k]) poses.appendChild(element(o, false)); else bac.appendChild(element(o, true)); });
      var nJ = Object.keys(juste).length;
      vue.querySelector('.pl-compteur').textContent = nJ + ' / ' + objets.length + ' bien placés';
      vue.querySelector('.pl-reste').textContent = '(' + (objets.length - Object.keys(pose).length) + ')';
      vue.querySelector('.pl-barre-r').style.width = (nJ / objets.length * 100) + '%';
      Array.prototype.forEach.call(cibles.children, function (c) { c.classList.toggle('occupee', Object.keys(juste).some(function (k) { return juste[k] === +c.dataset.c; })); });
    }
    window.addEventListener('resize', function r() { if (!document.body.contains(piece)) return window.removeEventListener('resize', r); dessiner(); });
    dessiner();
    vue.querySelector('[data-verifier]').onclick = function () {
      var ret = vue.querySelector('.pl-retours');
      var poses_ = Object.keys(pose).filter(function (k) { return juste[k] == null; });
      if (!poses_.length) { ret.innerHTML = '<p class="pl-msg courage">Fais glisser au moins un objet dans la pièce.</p>'; return; }
      var bons = [], faux = [];
      poses_.forEach(function (k) {
        var o = objets[k], c = estJuste(o, pose[k].p);
        if (c) { juste[k] = c.k; var cc = c.mur ? centreCible(c) : [c.x, c.y]; pose[k] = { p: c.mur ? cc : [c.x + c.l / 2, c.y + c.h / 2] }; bons.push(o); }
        else { pose[k].faux = true; essais[k] = (essais[k] || 0) + 1; faux.push(o); }
      });
      erreurs += faux.length;
      dessiner(); garder();
      // les objets justes sont posés exactement à leur place (centre)
      Array.prototype.forEach.call(poses.children, function (b) {
        var o = objets[b.dataset.k]; if (juste[o.k] == null) return;
        var c = objets[juste[o.k]]; if (!c.mur) { b.style.left = (c.x + c.l / 2) + '%'; b.style.top = (c.y + c.h / 2) + '%'; }
      });
      if (bons.length) { sonJuste(); bulle(scene, hasard(BRAVO) + (bons.length > 1 ? ' +' + bons.length : ''), 'bravo'); }
      if (faux.length) setTimeout(sonFaux, bons.length ? 300 : 0);
      ret.innerHTML = (bons.length ? '<div class="pl-msg bravo"><b>' + hasard(BRAVO) + '</b> ' + bons.map(function (o) { return '<span class="pl-mot">✔ ' + esc(o.nom) + '</span>'; }).join(' ') + '</div>' : '') +
        (faux.length ? '<div class="pl-msg courage"><b>' + hasard(COURAGE) + '</b><ul>' + faux.map(function (o) {
          var e = essais[o.k], ind = o.coteTxt ? (/^[A-D]$/.test(o.cote) ? 'Sa place : contre le mur ' + o.cote + ', côté ' + o.coteTxt + '.' : 'Sa place : côté ' + o.coteTxt + '.') : '';
          if (e >= 2 && o.fonction) ind += ' À quoi il sert : ' + o.fonction.charAt(0).toLowerCase() + o.fonction.slice(1);
          return '<li><b>« ' + esc(o.nom) + ' »</b> : pas à la bonne place. ' + esc(ind) + (e >= 3 ? ' <i>Regarde la pièce : sa place clignote.</i>' : '') + '</li>';
        }).join('') + '</ul></div>' : '');
      faux.forEach(function (o) {
        if (essais[o.k] >= 3) {
          var g = document.createElement('div'); g.className = 'pl-indice' + (o.mur ? ' rond' : ''); g.setAttribute('style', boite(o)); cibles.appendChild(g); setTimeout(function () { g.remove(); }, 4000);
        }
      });
      if (Object.keys(juste).length === objets.length) {
        clearInterval(minuteur);
        var temps = Math.round((Date.now() - debut) / 1000);
        var et = erreurs === 0 ? 3 : erreurs <= Math.ceil(objets.length / 5) ? 2 : 1;
        if (chef && temps > objets.length * 25) et = Math.min(et, 2);
        var pr = prog(); pr.pieces[pid] = pr.pieces[pid] || {};
        var avant = pr.pieces[pid][n];
        if (!avant || et > avant.etoiles || (et === avant.etoiles && temps < avant.temps)) pr.pieces[pid][n] = { etoiles: et, erreurs: erreurs, temps: temps, date: new Date().toISOString() };
        var mots = []; objets.forEach(function (o) { if (mots.indexOf(o.nom) < 0) mots.push(o.nom); }); noterMots([P.nom].concat(mots));
        encours(cleEC, null); sauver(); sonFin(); confettis(scene);
        var suiv = n < 4 ? ['#plateau/' + pid + '/' + (n + 1), 'Niveau ' + (n + 1) + ' · ' + NIVEAUX[n].nom] : null;
        var i = PD.pieces.indexOf(P);
        if (!suiv && PD.pieces[i + 1]) suiv = ['#plateau/' + PD.pieces[i + 1].id + '/1', 'Pièce suivante : ' + PD.pieces[i + 1].nom];
        setTimeout(function () { fin(vue, P.nom + ' · niveau ' + n, et, erreurs, chef ? temps : null, [P.nom].concat(mots), suiv && suiv[0], suiv && suiv[1]); }, 900);
      }
    };
  }

  /* ───── écran de fin ───── */
  function fin(vue, titre, et, erreurs, temps, mots, lienSuivant, libelleSuivant) {
    var phrase = et === 3 ? 'Sans aucune erreur : tu connais cet espace comme un pro !' : et === 2 ? 'Très bon travail ! Encore un essai pour les 3 étoiles ?' : 'C’est réussi ! Recommence pour faire moins d’erreurs.';
    var f = document.createElement('div'); f.className = 'pl-fin'; f.setAttribute('role', 'dialog'); f.setAttribute('aria-label', 'Résultat');
    f.innerHTML = '<div class="pl-fin-boite"><p class="pl-fin-et">' + etoiles(et) + '</p><h2>' + esc(titre) + '</h2><p>' + phrase + '</p>' +
      '<p class="pl-fin-chiffres">' + erreurs + ' erreur' + (erreurs > 1 ? 's' : '') + (temps != null ? ' · ' + Math.floor(temps / 60) + ' min ' + (temps % 60) + ' s' : '') + '</p>' +
      '<h3>Les mots de cette partie</h3><ul class="pl-fin-mots">' + mots.map(function (m) { return '<li>' + A().interne(m) + esc(m) + '</li>'; }).join('') + '</ul>' +
      '<div class="pl-fin-actions"><a class="cdo-btn-second" href="#plateau">Mon plateau</a><button type="button" class="cdo-btn-second" data-rejouer>Rejouer</button>' + (lienSuivant ? '<a class="cdo-btn" href="' + lienSuivant + '">' + esc(libelleSuivant) + ' →</a>' : '') + '</div></div>';
    vue.appendChild(f);
    f.querySelector('[data-rejouer]').onclick = function () { var h = location.hash; f.remove(); window.dispatchEvent(new HashChangeEvent('hashchange')); location.hash = h; };
    var a = f.querySelector('.cdo-btn') || f.querySelector('a'); if (a) a.focus();
  }

  window.CDO_PLATEAU = {
    rendre: function (vue, p) {
      if (!PD) { vue.innerHTML = '<p>Le plateau n’a pas pu être chargé.</p>'; return; }
      if (!charge || charge.code !== D().code()) {
        vue.innerHTML = '<p class="pl-attente">Chargement de mon plateau…</p>';
        var h = location.hash;
        chargerNuage().then(function () { if (location.hash === h) window.CDO_PLATEAU.rendre(vue, p); });
        return;
      }
      if (p[1] === 'espaces') return jeuEspaces(vue);
      if (p[1] && p[2]) return jeuPiece(vue, p[1], Math.max(1, Math.min(4, +p[2] || 1)));
      menu(vue);
    },
    titre: function (p) {
      if (p[1] === 'espaces') return 'Les espaces du plateau';
      var P = PD && PD.pieces.filter(function (x) { return x.id === p[1]; })[0];
      return P ? P.nom : 'Mon plateau technique';
    }
  };
})();
