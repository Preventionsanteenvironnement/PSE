/* exercices.js — exercices d'entraînement du parcours chef-d'œuvre.
 * Mêmes types que les blocs du Tableau de l'Atelier PSE (classer, relier, trous, qcm, intrus, tableau,
 * ordre, chaine, quisuisje, vfserie) + « chasse » (repérer des dangers sur une image) + « mots » (vocabulaire).
 * Correction immédiate, essais illimités, indice après deux erreurs, encouragement, audio partout.
 *   CDO_EX.rendre(conteneur, bloc, { fini: function () {} })
 */
(function () {
  'use strict';
  var A = window.CDO_AUDIO;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function son(t) { return A.bouton(t); }
  function melanger(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function consigneHtml(c) {
    var m = String(c || '').match(/^(\S+)(\s.*)?$/);
    var verbe = m ? m[1] : '', reste = m && m[2] ? m[2] : '';
    return '<p class="cdo-consigne" data-lire>' + son(c) + '<span><b>' + esc(verbe) + '</b>' + esc(reste) + '</span></p>';
  }
  function img(src, alt) { return src ? '<img class="cdo-picto" src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy">' : ''; }
  var BRAVO = ['Très bien.', 'Exact.', 'C’est juste.', 'Bonne réponse.', 'Parfait.'];
  var ENCORE = ['Pas encore : essayez une autre réponse.', 'Ce n’est pas cela. Regardez à nouveau.', 'Presque : recommencez.'];
  function hasard(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* Zone de message sous l'exercice ; parle aussi. */
  function retour(box, txt, ok, dire) {
    var z = box.querySelector('.cdo-retour');
    z.className = 'cdo-retour ' + (ok === true ? 'ok' : ok === false ? 'ko' : '');
    z.innerHTML = txt ? son(txt) + '<span>' + esc(txt) + '</span>' : '';
    z.setAttribute('data-lire', '');
    if (txt && dire !== false && window.CDO_REGLAGES && window.CDO_REGLAGES.parlerRetours) A.lireAuto(txt, z);
  }
  function termine(box, opts, message) {
    box.classList.add('cdo-fini');
    retour(box, message || 'Exercice réussi. Passez au suivant.', true);
    if (opts && opts.fini) opts.fini();
  }
  function cadre(b, corps) {
    return '<div class="cdo-ex' + (b.grandesImages ? ' cdo-grand' : '') + '" data-type="' + esc(b.type) + '">' +
      (b.titre ? '<h3 class="cdo-ex-titre" data-lire>' + son(b.titre) + '<span>' + esc(b.titre) + '</span></h3>' : '') +
      (b.image && b.type !== 'chasse' ? '<figure class="cdo-fig"><img src="' + esc(b.image) + '" alt="' + esc(b.alt || '') + '" loading="lazy">' + (b.legende ? '<figcaption data-lire>' + esc(b.legende) + '</figcaption>' : '') + '</figure>' : '') +
      (b.consigne ? consigneHtml(b.consigne) : '') + corps +
      '<div class="cdo-retour" aria-live="polite"></div></div>';
  }
  function etiquette(t, picto) {
    return '<span class="cdo-etq">' + img(picto, '') + '<span>' + esc(t) + '</span></span>';
  }

  /* ───── Vocabulaire : un mot, son image, sa définition (comprendre mot par mot) ───── */
  function mots(box, b, opts) {
    box.innerHTML = cadre(b, '<div class="cdo-mots">' + b.mots.map(function (m, i) {
      return '<button type="button" class="cdo-mot" data-i="' + i + '" aria-expanded="false">' + img(m.image, m.mot) +
        '<span class="cdo-mot-t">' + esc(m.mot) + '</span><span class="cdo-mot-def" hidden data-lire>' + A.interne(m.mot + '. ' + m.def) + esc(m.def) +
        (m.exemple ? '<em>' + esc(m.exemple) + '</em>' : '') + '</span></button>';
    }).join('') + '</div>');
    var vus = {};
    box.addEventListener('click', function (ev) {
      var c = ev.target.closest('.cdo-mot'); if (!c || ev.target.closest('.cdo-son')) return;
      var d = c.querySelector('.cdo-mot-def'); d.hidden = false; c.setAttribute('aria-expanded', 'true'); c.classList.add('ouvert');
      var m = b.mots[+c.dataset.i]; A.lireAuto(m.mot + '. ' + m.def + (m.exemple ? '. ' + m.exemple : ''), d);
      vus[c.dataset.i] = 1;
      if (Object.keys(vus).length === b.mots.length && !box.classList.contains('cdo-fini')) termine(box, opts, 'Tous les mots sont découverts.');
    });
  }

  /* ───── Texte à trous : banque de mots + un intrus ───── */
  function trous(box, b, opts) {
    var parts = [], attendus = [];
    String(b.source).split(/(\[[^\]]+\])/).forEach(function (p) {
      var m = p.match(/^\[([^\]]+)\]$/);
      if (m) { attendus.push(m[1]); parts.push({ trou: attendus.length - 1 }); } else if (p) parts.push({ t: p });
    });
    var banque = melanger(attendus.concat(b.intrus ? [b.intrus] : []));
    var phrase = parts.map(function (p) { return p.trou != null ? '<button type="button" class="cdo-trou" data-t="' + p.trou + '" aria-label="Case vide ' + (p.trou + 1) + '">……</button>' : esc(p.t); }).join('');
    box.innerHTML = cadre(b, '<p class="cdo-phrase" data-lire data-dire="' + esc(String(b.source).replace(/\[[^\]]+\]/g, ' blanc ')) + '">' + son(String(b.source).replace(/\[[^\]]+\]/g, ' blanc ')) + '<span>' + phrase + '</span></p>' +
      '<div class="cdo-banque">' + banque.map(function (w) { return '<button type="button" class="cdo-carte" data-w="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>');
    var choisi = null, rempli = 0, erreurs = 0;
    box.addEventListener('click', function (ev) {
      var c = ev.target.closest('.cdo-carte');
      if (c && !c.disabled) { box.querySelectorAll('.cdo-carte').forEach(function (x) { x.classList.remove('pris'); }); c.classList.add('pris'); choisi = c; A.lireAuto(c.dataset.w); return; }
      var t = ev.target.closest('.cdo-trou');
      if (t && choisi && !t.classList.contains('juste')) {
        if (choisi.dataset.w === attendus[+t.dataset.t]) {
          t.textContent = choisi.dataset.w; t.classList.add('juste'); choisi.disabled = true; choisi.classList.remove('pris'); choisi = null; rempli++;
          retour(box, hasard(BRAVO), true);
          if (rempli === attendus.length) termine(box, opts, 'Bravo. La phrase est complète : ' + b.source.replace(/\[|\]/g, ''));
        } else {
          erreurs++; t.classList.add('faux'); setTimeout(function () { t.classList.remove('faux'); }, 600);
          retour(box, erreurs >= 2 && b.indice ? b.indice : hasard(ENCORE), false);
        }
      }
    });
  }

  /* ───── Classer : toucher un élément, puis sa colonne ───── */
  function classer(box, b, opts) {
    var items = [];
    b.colonnes.forEach(function (c, ci) { c.elements.forEach(function (e) { items.push({ t: typeof e === 'string' ? e : e.t, picto: e.image || (b.images || {})[typeof e === 'string' ? e : e.t], col: ci }); }); });
    items = melanger(items);
    box.innerHTML = cadre(b, '<div class="cdo-banque">' + items.map(function (it, i) { return '<button type="button" class="cdo-carte" data-i="' + i + '">' + etiquette(it.t, it.picto) + '</button>'; }).join('') + '</div>' +
      '<div class="cdo-colonnes" style="--n:' + b.colonnes.length + '">' + b.colonnes.map(function (c, ci) {
        return '<button type="button" class="cdo-colonne" data-c="' + ci + '"><span class="cdo-col-titre" data-lire>' + A.interne(c.titre) + esc(c.titre) + '</span><span class="cdo-col-corps"></span></button>';
      }).join('') + '</div>');
    var pris = null, places = 0, erreurs = 0;
    box.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var c = ev.target.closest('.cdo-carte');
      if (c && !c.disabled) { box.querySelectorAll('.cdo-carte').forEach(function (x) { x.classList.remove('pris'); }); c.classList.add('pris'); pris = c; A.lireAuto(items[+c.dataset.i].t); return; }
      var col = ev.target.closest('.cdo-colonne');
      if (col && pris) {
        var it = items[+pris.dataset.i];
        if (it.col === +col.dataset.c) {
          col.querySelector('.cdo-col-corps').insertAdjacentHTML('beforeend', '<span class="cdo-place">' + etiquette(it.t, it.picto) + '</span>');
          pris.disabled = true; pris.classList.remove('pris'); pris.classList.add('range'); pris = null; places++;
          retour(box, hasard(BRAVO), true);
          if (places === items.length) termine(box, opts, b.bilan || 'Bravo. Tout est bien rangé.');
        } else {
          erreurs++; col.classList.add('faux'); setTimeout(function () { col.classList.remove('faux'); }, 600);
          retour(box, erreurs >= 2 && b.indice ? b.indice : '« ' + it.t + ' » ne va pas dans cette colonne. Essayez l’autre.', false);
        }
      }
    });
  }

  /* ───── Relier : toucher à gauche, puis à droite ───── */
  function relier(box, b, opts) {
    var paires = b.paires || String(b.source).split('\n').map(function (l) { var p = l.split(';'); return { g: p[0].trim(), d: (p[1] || '').trim() }; });
    var droite = melanger(paires.map(function (p, i) { return { t: p.d, i: i, picto: p.imageD }; }));
    box.innerHTML = cadre(b, '<div class="cdo-relier"><div class="cdo-rel-col">' + paires.map(function (p, i) {
      return '<button type="button" class="cdo-carte cdo-g" data-i="' + i + '">' + etiquette(p.g, p.imageG) + '</button>';
    }).join('') + '</div><div class="cdo-rel-col">' + droite.map(function (p) {
      return '<button type="button" class="cdo-carte cdo-d" data-i="' + p.i + '">' + etiquette(p.t, p.picto) + '</button>';
    }).join('') + '</div></div>');
    var g = null, faits = 0, erreurs = 0;
    box.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var c = ev.target.closest('.cdo-carte'); if (!c || c.disabled) return;
      if (c.classList.contains('cdo-g')) { box.querySelectorAll('.cdo-g').forEach(function (x) { x.classList.remove('pris'); }); c.classList.add('pris'); g = c; A.lireAuto(paires[+c.dataset.i].g); return; }
      if (!g) { retour(box, 'Touchez d’abord un élément de la colonne de gauche.', null); return; }
      if (c.dataset.i === g.dataset.i) {
        var n = ++faits; [g, c].forEach(function (x) { x.disabled = true; x.classList.remove('pris'); x.classList.add('relie'); x.setAttribute('data-n', n); });
        retour(box, paires[+c.dataset.i].g + ' : ' + paires[+c.dataset.i].d + '. ' + hasard(BRAVO), true); g = null;
        if (faits === paires.length) termine(box, opts, b.bilan);
      } else {
        erreurs++; c.classList.add('faux'); setTimeout(function () { c.classList.remove('faux'); }, 600);
        retour(box, erreurs >= 2 && b.indice ? b.indice : hasard(ENCORE), false);
      }
    });
  }

  /* ───── Questions à choix, une à la fois ───── */
  function qcm(box, b, opts) {
    var i = 0;
    function une() {
      var q = b.questions[i];
      box.innerHTML = cadre(b, '<p class="cdo-compteur">Question ' + (i + 1) + ' sur ' + b.questions.length + '</p>' +
        (q.image ? '<figure class="cdo-fig">' + img(q.image, '') + '</figure>' : '') +
        '<p class="cdo-question" data-lire>' + son(q.question) + '<span>' + esc(q.question) + '</span></p>' +
        '<div class="cdo-choix">' + q.choix.map(function (c, k) { return '<button type="button" class="cdo-carte" data-k="' + k + '"><span>' + esc(c) + '</span>' + A.interne(c) + '</button>'; }).join('') + '</div>');
    }
    une();
    box.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var s = ev.target.closest('[data-suite]'); if (s) { i++; une(); return; }
      var c = ev.target.closest('.cdo-choix .cdo-carte'); if (!c || c.disabled) return;
      var q = b.questions[i];
      if (+c.dataset.k === q.bonne) {
        box.querySelectorAll('.cdo-choix .cdo-carte').forEach(function (x) { x.disabled = true; }); c.classList.add('juste');
        retour(box, hasard(BRAVO) + ' ' + (q.explication || ''), true);
        if (i + 1 < b.questions.length) box.querySelector('.cdo-retour').insertAdjacentHTML('beforeend', '<button type="button" class="cdo-btn-suite" data-suite>Question suivante</button>');
        else termine(box, opts, hasard(BRAVO) + ' ' + (q.explication || ''));
      } else { c.classList.add('faux'); c.disabled = true; retour(box, q.indice || hasard(ENCORE), false); }
    });
  }

  /* ───── Intrus ───── */
  function intrus(box, b, opts) {
    var i = 0;
    function une() {
      var s = b.series[i];
      box.innerHTML = cadre(b, '<p class="cdo-compteur">Série ' + (i + 1) + ' sur ' + b.series.length + '</p><div class="cdo-choix">' +
        s.elements.map(function (e, k) { return '<button type="button" class="cdo-carte" data-k="' + k + '">' + etiquette(e, (b.images || {})[e]) + A.interne(e) + '</button>'; }).join('') + '</div>');
    }
    une();
    box.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      if (ev.target.closest('[data-suite]')) { i++; une(); return; }
      var c = ev.target.closest('.cdo-choix .cdo-carte'); if (!c || c.disabled) return;
      var s = b.series[i];
      if (+c.dataset.k === s.intrus) {
        c.classList.add('juste'); box.querySelectorAll('.cdo-choix .cdo-carte').forEach(function (x) { x.disabled = true; });
        if (i + 1 < b.series.length) { retour(box, 'Exact. ' + s.explication, true); box.querySelector('.cdo-retour').insertAdjacentHTML('beforeend', '<button type="button" class="cdo-btn-suite" data-suite>Série suivante</button>'); }
        else termine(box, opts, 'Exact. ' + s.explication);
      } else { c.classList.add('faux'); c.disabled = true; retour(box, 'Celui-ci appartient bien à la même famille que les autres. Cherchez encore.', false); }
    });
  }

  /* ───── Tableau à compléter : chaque case vide se remplit depuis la banque ───── */
  function tableau(box, b, opts) {
    var attendus = [], banque = [];
    var corps = b.lignes.map(function (l) {
      return '<tr>' + l.map(function (cell) {
        var m = String(cell).match(/^\[(.+)\]$/);
        if (m) { attendus.push(m[1]); banque.push(m[1]); return '<td><button type="button" class="cdo-trou" data-t="' + (attendus.length - 1) + '">……</button></td>'; }
        return '<td data-lire>' + esc(cell) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    banque = melanger(banque.concat(b.intrus ? [b.intrus] : []));
    box.innerHTML = cadre(b, '<div class="cdo-table-boite"><table class="cdo-table"><thead><tr>' + b.colonnes.map(function (c) { return '<th data-lire>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' + corps + '</tbody></table></div>' +
      '<div class="cdo-banque">' + banque.map(function (w) { return '<button type="button" class="cdo-carte" data-w="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>');
    var choisi = null, faits = 0, erreurs = 0;
    box.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var c = ev.target.closest('.cdo-banque .cdo-carte');
      if (c && !c.disabled) { box.querySelectorAll('.cdo-banque .cdo-carte').forEach(function (x) { x.classList.remove('pris'); }); c.classList.add('pris'); choisi = c; A.lireAuto(c.dataset.w); return; }
      var t = ev.target.closest('.cdo-trou');
      if (t && choisi && !t.classList.contains('juste')) {
        if (choisi.dataset.w === attendus[+t.dataset.t]) {
          t.textContent = choisi.dataset.w; t.classList.add('juste'); choisi.disabled = true; choisi = null; faits++;
          retour(box, hasard(BRAVO), true);
          if (faits === attendus.length) termine(box, opts, 'Bravo. Le tableau est complet.');
        } else { erreurs++; t.classList.add('faux'); setTimeout(function () { t.classList.remove('faux'); }, 600); retour(box, erreurs >= 2 && b.indice ? b.indice : hasard(ENCORE), false); }
      }
    });
  }

  /* ───── Remettre dans l'ordre : toucher les étapes de la première à la dernière ───── */
  function ordre(box, b, opts) {
    var etapes = b.etapes || String(b.source).split('\n').filter(Boolean);
    var cartes = melanger(etapes.map(function (t, i) { return { t: t, i: i, picto: (b.images || [])[i] }; }));
    box.innerHTML = cadre(b, '<ol class="cdo-suite-ordre">' + etapes.map(function (_, i) { return '<li class="cdo-ordre-case" data-n="' + (i + 1) + '"></li>'; }).join('') + '</ol>' +
      '<div class="cdo-banque">' + cartes.map(function (c) { return '<button type="button" class="cdo-carte" data-i="' + c.i + '">' + etiquette(c.t, c.picto) + '</button>'; }).join('') + '</div>');
    var prochain = 0, erreurs = 0;
    box.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var c = ev.target.closest('.cdo-banque .cdo-carte'); if (!c || c.disabled) return;
      if (+c.dataset.i === prochain) {
        box.querySelectorAll('.cdo-ordre-case')[prochain].innerHTML = c.innerHTML; c.disabled = true; c.classList.add('range'); prochain++;
        retour(box, hasard(BRAVO), true);
        if (prochain === etapes.length) termine(box, opts, b.bilan || 'Bravo. Les étapes sont dans l’ordre.');
      } else {
        erreurs++; c.classList.add('faux'); setTimeout(function () { c.classList.remove('faux'); }, 600);
        retour(box, erreurs >= 2 ? 'Indice : l’étape ' + (prochain + 1) + ' est « ' + etapes[prochain] + ' ».' : 'Ce n’est pas l’étape ' + (prochain + 1) + '. Que se passe-t-il d’abord ?', false);
      }
    });
  }

  /* ───── Chaîne du processus : compléter les maillons cachés ───── */
  function chaine(box, b, opts) {
    var caches = [];
    var html = '<div class="cdo-chaine">' + b.etapes.map(function (e, i) {
      var maillon = e.cache ? (caches.push(i), '<button type="button" class="cdo-trou cdo-maillon" data-e="' + i + '">?</button>') : '<span class="cdo-maillon" data-lire>' + esc(e.texte) + '</span>';
      return (i ? '<span class="cdo-fleche" aria-hidden="true">→</span>' : '') + maillon;
    }).join('') + '</div>';
    var banque = melanger(caches.map(function (i) { return b.etapes[i].texte; }).concat(b.intrus ? [b.intrus] : []));
    box.innerHTML = cadre(b, html + '<div class="cdo-banque">' + banque.map(function (w) { return '<button type="button" class="cdo-carte" data-w="' + esc(w) + '">' + esc(w) + '</button>'; }).join('') + '</div>');
    var choisi = null, faits = 0;
    box.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var c = ev.target.closest('.cdo-banque .cdo-carte');
      if (c && !c.disabled) { box.querySelectorAll('.cdo-banque .cdo-carte').forEach(function (x) { x.classList.remove('pris'); }); c.classList.add('pris'); choisi = c; A.lireAuto(c.dataset.w); return; }
      var t = ev.target.closest('.cdo-maillon.cdo-trou');
      if (t && choisi && !t.classList.contains('juste')) {
        if (choisi.dataset.w === b.etapes[+t.dataset.e].texte) {
          t.textContent = choisi.dataset.w; t.classList.add('juste'); choisi.disabled = true; choisi = null; faits++; retour(box, hasard(BRAVO), true);
          if (faits === caches.length) termine(box, opts, b.bilan || 'Bravo. La chaîne est complète : ' + b.etapes.map(function (e) { return e.texte; }).join(', puis ') + '.');
        } else { t.classList.add('faux'); setTimeout(function () { t.classList.remove('faux'); }, 600); retour(box, 'Ce maillon ne va pas ici. Pensez à l’ordre : d’abord le danger, à la fin le dommage.', false); }
      }
    });
  }

  /* ───── Qui suis-je ? Les indices se dévoilent un à un ───── */
  function quisuisje(box, b, opts) {
    var vus = 1;
    var choix = melanger([b.reponse].concat(b.leurres || []));
    function dessiner() {
      box.innerHTML = cadre(b, '<ol class="cdo-indices">' + b.indices.slice(0, vus).map(function (x) { return '<li data-lire>' + son(x) + esc(x) + '</li>'; }).join('') + '</ol>' +
        (vus < b.indices.length ? '<button type="button" class="cdo-btn-second" data-plus>Un autre indice</button>' : '') +
        '<div class="cdo-choix">' + choix.map(function (c) { return '<button type="button" class="cdo-carte" data-w="' + esc(c) + '">' + etiquette(c, (b.images || {})[c]) + A.interne(c) + '</button>'; }).join('') + '</div>');
    }
    dessiner();
    box.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      if (ev.target.closest('[data-plus]')) { vus++; dessiner(); A.lireAuto(b.indices[vus - 1], null, 'questions'); return; }
      var c = ev.target.closest('.cdo-choix .cdo-carte'); if (!c || c.disabled) return;
      if (c.dataset.w === b.reponse) { c.classList.add('juste'); box.querySelectorAll('.cdo-choix .cdo-carte').forEach(function (x) { x.disabled = true; }); termine(box, opts, 'Exact : ' + b.reponse + '. ' + (b.explication || '')); }
      else { c.classList.add('faux'); c.disabled = true; retour(box, vus < b.indices.length ? 'Pas encore. Demandez un autre indice.' : hasard(ENCORE), false); }
    });
  }

  /* ───── Vrai ou faux, une affirmation à la fois ───── */
  function vfserie(box, b, opts) {
    var i = 0;
    function une() {
      var a = b.affirmations[i];
      box.innerHTML = cadre(b, '<p class="cdo-compteur">Affirmation ' + (i + 1) + ' sur ' + b.affirmations.length + '</p>' +
        '<p class="cdo-question" data-lire>' + son(a.texte) + '<span>' + esc(a.texte) + '</span></p>' +
        '<div class="cdo-choix cdo-vf"><button type="button" class="cdo-carte" data-v="1">Vrai</button><button type="button" class="cdo-carte" data-v="0">Faux</button></div>');
    }
    une();
    box.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      if (ev.target.closest('[data-suite]')) { i++; une(); return; }
      var c = ev.target.closest('.cdo-vf .cdo-carte'); if (!c || c.disabled) return;
      var a = b.affirmations[i];
      if ((c.dataset.v === '1') === a.reponse) {
        c.classList.add('juste'); box.querySelectorAll('.cdo-vf .cdo-carte').forEach(function (x) { x.disabled = true; });
        if (i + 1 < b.affirmations.length) { retour(box, hasard(BRAVO) + ' ' + a.justification, true); box.querySelector('.cdo-retour').insertAdjacentHTML('beforeend', '<button type="button" class="cdo-btn-suite" data-suite>Affirmation suivante</button>'); }
        else termine(box, opts, hasard(BRAVO) + ' ' + a.justification);
      } else { c.classList.add('faux'); c.disabled = true; retour(box, 'Relisez bien l’affirmation. ' + a.justification, false); }
    });
  }

  /* ───── Chasse aux dangers : toucher le danger sur l'image, il s'entoure, puis le nommer ───── */
  function chasse(box, b, opts) {
    var trouves = {};
    box.innerHTML = cadre(b, '<p class="cdo-compteur"><span class="cdo-compte">0</span> danger(s) trouvé(s) sur ' + b.zones.length + '</p>' +
      '<div class="cdo-chasse"><div class="cdo-chasse-img"><img src="' + esc(b.image) + '" alt="' + esc(b.alt || '') + '">' +
      b.zones.map(function (z, i) { return '<button type="button" class="cdo-zone" data-z="' + i + '" style="left:' + (z.x - z.w / 2) + '%;top:' + (z.y - z.h / 2) + '%;width:' + z.w + '%;height:' + z.h + '%" aria-label="Zone ' + (i + 1) + '"></button>'; }).join('') +
      '</div><ol class="cdo-trouves"></ol></div><div class="cdo-nommer" hidden></div>');
    var image = box.querySelector('.cdo-chasse-img'), nommer = box.querySelector('.cdo-nommer'), enCours = null, ratés = 0;
    image.addEventListener('click', function (ev) {
      /* Même règle que l'évaluation : un point appartient toujours à la plus petite zone qui le contient. */
      var r = image.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100, k = -1, aire = Infinity;
      b.zones.forEach(function (zz, j) {
        if (Math.abs(x - zz.x) > zz.w / 2 || Math.abs(y - zz.y) > zz.h / 2) return;
        if (zz.w * zz.h < aire) { k = j; aire = zz.w * zz.h; }
      });
      if (enCours != null && k !== enCours) { var av = box.querySelector('.cdo-zone[data-z="' + enCours + '"]'); if (av) av.classList.remove('vise'); }
      var z = k >= 0 ? box.querySelector('.cdo-zone[data-z="' + k + '"]') : null;
      if (!z) { ratés++; retour(box, ratés >= 3 ? 'Indice : regarder le sol, ce qui coupe, ce qui est chaud, lourd ou électrique.' : 'Aucun danger retenu à cet endroit. Chercher ailleurs.', false); return; }
      var i = +z.dataset.z; if (trouves[i]) return;
      enCours = i; z.classList.add('vise');
      var zz = b.zones[i], autres = function (pris) { return melanger(b.zones.filter(function (_, k) { return k !== i && !!trouves[k] === pris; }).map(function (x) { return x.nom; })); };
      /* Deux leurres toujours : d'abord des zones à trouver, puis des noms déjà trouvés. */
      var props = melanger([zz.nom].concat(zz.leurres || autres(false).concat(autres(true)).slice(0, 2)));
      nommer.hidden = false;
      nommer.innerHTML = consigneHtml('Choisir le nom du danger entouré.') + '<div class="cdo-choix">' +
        props.map(function (p) { return '<button type="button" class="cdo-carte" data-w="' + esc(p) + '"><span>' + esc(p) + '</span>' + A.interne(p) + '</button>'; }).join('') + '</div>';
      A.lireAuto('Choisir le nom du danger entouré.', nommer, 'questions');
    });
    nommer.addEventListener('click', function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var c = ev.target.closest('.cdo-carte'); if (!c || enCours == null) return;
      var zz = b.zones[enCours], z = box.querySelector('.cdo-zone[data-z="' + enCours + '"]');
      if (c.dataset.w === zz.nom) {
        trouves[enCours] = 1; z.classList.remove('vise'); z.classList.add('trouve'); z.setAttribute('data-n', Object.keys(trouves).length);
        box.querySelector('.cdo-trouves').insertAdjacentHTML('beforeend', '<li data-lire>' + son(zz.nom) + esc(zz.nom) + '</li>');
        box.querySelector('.cdo-compte').textContent = Object.keys(trouves).length;
        nommer.hidden = true; enCours = null;
        if (Object.keys(trouves).length === b.zones.length) termine(box, opts, 'Bravo. Vous avez trouvé les ' + b.zones.length + ' dangers.');
        else retour(box, 'Exact : ' + zz.nom + '. Cherchez le danger suivant.', true);
      } else { c.classList.add('faux'); c.disabled = true; retour(box, 'Ce n’est pas ce qui est entouré. Regardez bien la zone.', false); }
    });
  }

  var TYPES = { mots: mots, trous: trous, classer: classer, relier: relier, qcm: qcm, intrus: intrus, tableau: tableau, ordre: ordre, chaine: chaine, quisuisje: quisuisje, vfserie: vfserie, chasse: chasse };
  function rendre(conteneur, b, opts) {
    var box = document.createElement('section'); box.className = 'cdo-ex-boite'; conteneur.appendChild(box);
    (TYPES[b.type] || function () { box.textContent = ''; })(box, b, opts || {});
    return box;
  }
  window.CDO_EX = { rendre: rendre, TYPES: TYPES, esc: esc, melanger: melanger };
})();
