/* jeux-ecran.js — espace « Jeux » : la version ÉCRAN (interactive) de chaque type de jeu-core.js, et le lecteur d'escape game.
 * [LUDOTHÈQUE 21/10/2026] Même jeu, même graine que la fiche papier : la grille projetée est celle de la feuille.
 * PSE_JEUX_ECRAN.monter(el, jeu) : joue le jeu dans el. Utilisé par jeux.html (Jouer, aperçu), par l'export HTML autonome
 * (un seul fichier, sans Internet : clé USB, mapse, Tableau). Aucun accès au store ici.
 */
(function (racine) {
  'use strict';
  var J = racine.PSE_JEUX, O = J.outils, esc = O.esc, norm = O.norm, lettreDe = O.lettreDe, img = O.img;
  /* Réponse saisie juste : sans tenir compte des accents, des majuscules, des espaces ni de la ponctuation. */
  function egal(a, b) { var f = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); }; return f(a) === f(b); }
  function liste(a) { return Array.isArray(a) ? a : []; }
  function $(el, s) { return el.querySelector(s); }
  function $$(el, s) { return Array.prototype.slice.call(el.querySelectorAll(s)); }
  function bilan(el, ok, total, texte) { var b = $(el, '.jxe-bilan'); if (!b) return; b.className = 'jxe-bilan ' + (ok === total ? 'oui' : 'non'); b.textContent = texte || (ok === total ? 'Tout est juste (' + ok + '/' + total + ').' : ok + ' bonne(s) réponse(s) sur ' + total + '.'); }
  function pied(boutons) { return '<div class="jxe-pied">' + (boutons || '<button class="jxe-b" data-a="verifier">Vérifier</button><button class="jxe-b second" data-a="solution">Voir la solution</button><button class="jxe-b second" data-a="recommencer">Recommencer</button>') + '<div class="jxe-bilan" aria-live="polite"></div></div>'; }

  var R = {};

  R['mots-croises'] = function (el, d, P, ctx) {
    var t = J.TYPES['mots-croises'], g = t.grille(d); if (!g) { el.innerHTML = '<p>Grille impossible.</p>'; return; }
    var h = '<div class="jxe-scroll"><table class="jxe-mc">' + g.grille.map(function (l, y) { return '<tr>' + l.map(function (c, x) { return c ? '<td>' + (c.num ? '<sup>' + c.num + '</sup>' : '') + '<input maxlength="1" data-x="' + x + '" data-y="' + y + '" data-l="' + c.l + '" aria-label="case"></td>' : '<td class="n"></td>'; }).join('') + '</tr>'; }).join('') + '</table></div>';
    var defs = function (dir) { return '<ol>' + g.places.filter(function (p) { return p.dir === dir; }).map(function (p) { return '<li value="' + p.num + '">' + esc(p.def) + ' <i>(' + p.mot.length + ')</i></li>'; }).join('') + '</ol>'; };
    el.innerHTML = '<div class="jxe-2col"><div>' + h + '</div><div><h4>Horizontalement</h4>' + defs('h') + '<h4>Verticalement</h4>' + defs('v') + '</div></div>' + pied();
    $$(el, 'input').forEach(function (i) { i.addEventListener('input', function () { i.value = norm(i.value).slice(0, 1); var n = i.closest('td').nextElementSibling; var nx = n && n.querySelector('input'); if (i.value && nx) nx.focus(); }); });
    ctx.verifier = function () { var ok = 0, tout = $$(el, 'input'); tout.forEach(function (i) { var b = i.value === i.dataset.l; i.classList.toggle('juste', b && !!i.value); i.classList.toggle('faux', !b && !!i.value); if (b) ok++; }); bilan(el, ok, tout.length, ok === tout.length ? 'Grille complète et juste.' : ok + ' lettres justes sur ' + tout.length + '.'); };
    ctx.solution = function () { $$(el, 'input').forEach(function (i) { i.value = i.dataset.l; }); ctx.verifier(); };
  };

  R['mots-meles'] = function (el, d, P, ctx) {
    var t = J.TYPES['mots-meles'], g = t.grille(d, P); if (!g) { el.innerHTML = '<p>Grille impossible.</p>'; return; }
    var trouves = {}, debut = null;
    el.innerHTML = '<p class="jxe-aide">Cliquer sur la première lettre d’un mot, puis sur sa dernière lettre.</p><div class="jxe-2col"><div class="jxe-scroll"><table class="jxe-mm">' + g.grille.map(function (l, y) { return '<tr>' + l.map(function (c, x) { return '<td data-x="' + x + '" data-y="' + y + '">' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div><div><ul class="jxe-mots">' + g.mots.map(function (m) { return '<li data-m="' + m.mot + '">' + m.mot + '</li>'; }).join('') + '</ul>' + (d.message ? '<p class="jxe-aide">Quand tous les mots sont trouvés, les lettres restantes forment un message.</p><p class="jxe-reste"></p>' : '') + '</div></div>' + pied('<button class="jxe-b second" data-a="solution">Voir la solution</button><button class="jxe-b second" data-a="recommencer">Recommencer</button>');
    function cell(x, y) { return $(el, 'td[data-x="' + x + '"][data-y="' + y + '"]'); }
    function majReste() { var p = $(el, '.jxe-reste'); if (!p) return; if (Object.keys(trouves).length === g.mots.length) { var pris = {}; g.mots.forEach(function (m) { for (var k = 0; k < m.mot.length; k++) pris[(m.x + m.dx * k) + ',' + (m.y + m.dy * k)] = 1; }); var s = ''; g.grille.forEach(function (l, y) { l.forEach(function (c, x) { if (!pris[x + ',' + y]) { s += c; cell(x, y).classList.add('reste'); } }); }); p.textContent = 'Lettres restantes : ' + s; } }
    function marquer(m) { trouves[m.mot] = 1; for (var k = 0; k < m.mot.length; k++) cell(m.x + m.dx * k, m.y + m.dy * k).classList.add('pris'); $(el, 'li[data-m="' + m.mot + '"]').classList.add('fait'); bilan(el, Object.keys(trouves).length, g.mots.length, Object.keys(trouves).length + ' mot(s) trouvé(s) sur ' + g.mots.length + '.'); majReste(); }
    $(el, 'table').addEventListener('click', function (ev) {
      var td = ev.target.closest('td'); if (!td) return; var x = +td.dataset.x, y = +td.dataset.y;
      if (!debut) { debut = [x, y]; td.classList.add('sel'); return; }
      $$(el, 'td.sel').forEach(function (c) { c.classList.remove('sel'); });
      var a = debut; debut = null;
      g.mots.forEach(function (m) { var fx = m.x + m.dx * (m.mot.length - 1), fy = m.y + m.dy * (m.mot.length - 1); if ((m.x === a[0] && m.y === a[1] && fx === x && fy === y) || (fx === a[0] && fy === a[1] && m.x === x && m.y === y)) marquer(m); });
    });
    ctx.solution = function () { g.mots.forEach(marquer); };
  };

  R['pendu'] = function (el, d, P, ctx) {
    var mots = liste(d.mots), i = 0, max = +d.essais || 7;
    function manche() {
      if (i >= mots.length) { el.innerHTML = '<p class="jxe-gros">Partie terminée.</p>' + pied('<button class="jxe-b" data-a="recommencer">Rejouer</button>'); return; }
      var m = mots[i], w = norm(m.mot), vues = {}, err = 0;
      el.innerHTML = '<p class="jxe-aide">' + esc(m.indice || '') + '</p><div class="jxe-jauge"></div><div class="jxe-mot"></div><div class="jxe-clavier">' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(function (c) { return '<button data-c="' + c + '">' + c + '</button>'; }).join('') + '</div><div class="jxe-bilan"></div>';
      function maj() { $(el, '.jxe-mot').innerHTML = w.split('').map(function (c) { return '<span>' + (vues[c] ? c : '') + '</span>'; }).join(''); var j = ''; for (var k = 0; k < max; k++) j += '<i class="' + (k < err ? 'perdu' : '') + '"></i>'; $(el, '.jxe-jauge').innerHTML = j + '<small>' + (max - err) + ' essai(s)</small>'; }
      maj();
      $(el, '.jxe-clavier').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b || b.disabled) return; b.disabled = true; var c = b.dataset.c; if (w.indexOf(c) >= 0) vues[c] = 1; else err++; maj();
        var gagne = w.split('').every(function (x) { return vues[x]; });
        if (gagne || err >= max) { $$(el, '.jxe-clavier button').forEach(function (x) { x.disabled = true; }); w.split('').forEach(function (x) { vues[x] = 1; }); maj(); var bi = $(el, '.jxe-bilan'); bi.className = 'jxe-bilan ' + (gagne ? 'oui' : 'non'); bi.innerHTML = (gagne ? 'Trouvé : ' : 'Le mot était : ') + '<b>' + esc(m.mot) + '</b> <button class="jxe-b" data-a="suivant">Suivant</button>'; } });
      ctx.suivant = function () { i++; manche(); };
    }
    ctx.recommencer = function () { i = 0; manche(); };
    manche();
  };

  R['anagrammes'] = function (el, d, P, ctx) {
    var t = J.TYPES['anagrammes'];
    el.innerHTML = '<ol class="jxe-liste">' + liste(d.mots).map(function (m, i) { var w = norm(m.mot); return '<li data-w="' + w + '"><p>' + esc(m.indice || '') + '</p><div class="jxe-tuiles">' + t.melange(w, P, i).split('').map(function (c) { return '<button>' + c + '</button>'; }).join('') + '</div><div class="jxe-rep"></div><button class="jxe-b mini second" data-efface>Effacer</button></li>'; }).join('') + '</ol>' + pied();
    $$(el, '.jxe-liste>li').forEach(function (li) { li.addEventListener('click', function (ev) { var b = ev.target.closest('.jxe-tuiles button'); if (b && !b.disabled) { b.disabled = true; $(li, '.jxe-rep').textContent += b.textContent; } if (ev.target.hasAttribute('data-efface')) { $(li, '.jxe-rep').textContent = ''; $$(li, '.jxe-tuiles button').forEach(function (x) { x.disabled = false; }); } }); });
    ctx.verifier = function () { var ok = 0, l = $$(el, '.jxe-liste>li'); l.forEach(function (li) { var b = $(li, '.jxe-rep').textContent === li.dataset.w; li.classList.toggle('juste', b); li.classList.toggle('faux', !b); if (b) ok++; }); bilan(el, ok, l.length); };
    ctx.solution = function () { $$(el, '.jxe-liste>li').forEach(function (li) { $(li, '.jxe-rep').textContent = li.dataset.w; }); ctx.verifier(); };
  };

  R['acrostiche'] = function (el, d, P, ctx) {
    var mx = Math.max.apply(null, liste(d.mots).map(function (m) { return m.rang; }));
    el.innerHTML = '<div class="jxe-scroll"><table class="jxe-acro">' + liste(d.mots).map(function (m, i) { var w = norm(m.mot), h = '<tr><td class="nd">' + (i + 1) + '</td>'; for (var k = 0; k < mx - m.rang; k++) h += '<td class="vide"></td>'; return h + w.split('').map(function (c, k) { return '<td class="' + (k + 1 === m.rang ? 'mys' : '') + '"><input maxlength="1" data-l="' + c + '"></td>'; }).join('') + '</tr>'; }).join('') + '</table></div><ol class="jxe-defs">' + liste(d.mots).map(function (m) { return '<li>' + esc(m.def) + ' <i>(' + norm(m.mot).length + ' lettres)</i></li>'; }).join('') + '</ol>' + pied();
    $$(el, 'input').forEach(function (i) { i.addEventListener('input', function () { i.value = norm(i.value).slice(0, 1); var n = i.closest('td').nextElementSibling; var nx = n && n.querySelector('input'); if (i.value && nx) nx.focus(); }); });
    ctx.verifier = function () { var ok = 0, l = $$(el, 'input'); l.forEach(function (i) { var b = i.value === i.dataset.l; i.classList.toggle('juste', b); i.classList.toggle('faux', !b && !!i.value); if (b) ok++; }); bilan(el, ok, l.length, ok === l.length ? 'Juste ! Mot mystère : ' + J.TYPES.acrostiche.code(d) : ok + ' lettres justes sur ' + l.length + '.'); };
    ctx.solution = function () { $$(el, 'input').forEach(function (i) { i.value = i.dataset.l; }); ctx.verifier(); };
  };

  R['cryptogramme'] = function (el, d, P, ctx) {
    el.innerHTML = '<div class="jx-page">' + J.TYPES.cryptogramme.papier(d, P, false).replace(/<p>Message :[\s\S]*$/, '') + '</div><p><label>Message déchiffré : <input class="jxe-long" data-msg></label></p><p><label>Réponse : <input data-rep></label></p>' + pied();
    ctx.verifier = function () { var a = egal($(el, '[data-msg]').value, d.message), b = egal($(el, '[data-rep]').value, d.reponse); bilan(el, (a ? 1 : 0) + (b ? 1 : 0), 2); };
    ctx.solution = function () { $(el, '[data-msg]').value = d.message; $(el, '[data-rep]').value = d.reponse; ctx.verifier(); };
  };

  R['qui-suis-je'] = function (el, d, P, ctx) {
    el.innerHTML = '<ol class="jxe-liste">' + liste(d.enigmes).map(function (e, i) { return '<li data-i="' + i + '"><ol type="a" class="jxe-indices"><li>' + esc(e.indices[0]) + '</li></ol><button class="jxe-b mini second" data-plus>Indice suivant</button> <label>Je suis : <input></label></li>'; }).join('') + '</ol>' + pied();
    el.addEventListener('click', function (ev) { if (!ev.target.hasAttribute('data-plus')) return; var li = ev.target.closest('li[data-i]'), e = d.enigmes[+li.dataset.i], ol = $(li, '.jxe-indices'), n = ol.children.length; if (n < e.indices.length) ol.insertAdjacentHTML('beforeend', '<li>' + esc(e.indices[n]) + '</li>'); if (n + 1 >= e.indices.length) ev.target.disabled = true; });
    ctx.verifier = function () { var ok = 0, l = $$(el, 'li[data-i]'); l.forEach(function (li) { var e = d.enigmes[+li.dataset.i], v = $(li, 'input').value, b = egal(v, e.reponse) || egal(v, String(e.reponse).replace(/^(le|la|les|l’|l')\s*/i, '')); li.classList.toggle('juste', b); li.classList.toggle('faux', !b); if (b) ok++; }); bilan(el, ok, l.length); };
    ctx.solution = function () { $$(el, 'li[data-i]').forEach(function (li) { $(li, 'input').value = d.enigmes[+li.dataset.i].reponse; }); ctx.verifier(); };
  };

  R['texte-trous'] = function (el, d, P, ctx) {
    var t = J.TYPES['texte-trous'], b = t.banque(d, P), k = 0;
    var h = O.morceaux(d.texte, '[', ']').map(function (m) { if (m.t) return esc(m.t); k++; return d.banque !== false ? '<select data-r="' + esc(m.trou) + '"><option value=""></option>' + b.map(function (x) { return '<option>' + esc(x.mot) + '</option>'; }).join('') + '</select>' : '<input data-r="' + esc(m.trou) + '" size="' + Math.max(6, m.trou.length) + '">'; }).join('');
    el.innerHTML = '<p class="jxe-texte">' + h + '</p>' + pied();
    ctx.verifier = function () { var ok = 0, l = $$(el, '[data-r]'); l.forEach(function (i) { var bo = egal(i.value, i.dataset.r); i.classList.toggle('juste', bo); i.classList.toggle('faux', !bo); if (bo) ok++; }); bilan(el, ok, l.length); };
    ctx.solution = function () { $$(el, '[data-r]').forEach(function (i) { i.value = i.dataset.r; }); ctx.verifier(); };
  };

  function ordonner(el, items, bon, ctx, rendu) {
    // items : [{ id, html }] dans l'ordre affiché ; bon : ids dans le bon ordre. Monter / descendre.
    var ordre = items.slice();
    function dessiner() { $(el, '.jxe-ordre').innerHTML = ordre.map(function (it, i) { return '<li data-id="' + it.id + '"><span class="jxe-lt">' + (i + 1) + '</span><div>' + it.html + '</div><button class="jxe-b mini second" data-m="-1" ' + (i ? '' : 'disabled') + ' aria-label="monter">↑</button><button class="jxe-b mini second" data-m="1" ' + (i < ordre.length - 1 ? '' : 'disabled') + ' aria-label="descendre">↓</button></li>'; }).join(''); }
    el.innerHTML = (rendu || '') + '<ol class="jxe-ordre"></ol>' + pied();
    dessiner();
    $(el, '.jxe-ordre').addEventListener('click', function (ev) { var b = ev.target.closest('[data-m]'); if (!b) return; var li = b.closest('li'), i = ordre.findIndex(function (x) { return String(x.id) === li.dataset.id; }), j = i + (+b.dataset.m); var t = ordre[i]; ordre[i] = ordre[j]; ordre[j] = t; dessiner(); });
    ctx.verifier = function () { var ok = 0; ordre.forEach(function (it, i) { var b = String(it.id) === String(bon[i]); if (b) ok++; var li = $(el, '.jxe-ordre li[data-id="' + it.id + '"]'); li.classList.toggle('juste', b); li.classList.toggle('faux', !b); }); bilan(el, ok, ordre.length); };
    ctx.solution = function () { ordre = bon.map(function (id) { return items.filter(function (x) { return String(x.id) === String(id); })[0]; }); dessiner(); ctx.verifier(); };
  }

  R['ordre'] = function (el, d, P, ctx) { var m = J.TYPES.ordre.melange(d, P); ordonner(el, m.map(function (i, k) { var e = d.elements[i]; return { id: i, html: img(e.image, 'jxe-vign') + '<b>' + lettreDe(k) + '.</b> ' + esc(e.texte) }; }), d.elements.map(function (_, i) { return i; }), ctx, d.critere ? '<p class="jxe-aide">Ordre : ' + esc(d.critere) + '</p>' : ''); };

  R['phrase-ordre'] = function (el, d, P, ctx) {
    var t = J.TYPES['phrase-ordre'];
    el.innerHTML = '<ol class="jxe-liste">' + liste(d.phrases).map(function (p, i) { var mots = t.mots(p); return '<li data-p="' + esc(mots.join(' ')) + '"><div class="jxe-tuiles">' + O.melangerVraiment(mots, O.alea(P.graine + '|po' + i)).map(function (m) { return '<button>' + esc(m) + '</button>'; }).join('') + '</div><div class="jxe-rep phrase"></div><button class="jxe-b mini second" data-efface>Effacer</button></li>'; }).join('') + '</ol>' + pied();
    $$(el, '.jxe-liste>li').forEach(function (li) { li.addEventListener('click', function (ev) { var b = ev.target.closest('.jxe-tuiles button'); if (b && !b.disabled) { b.disabled = true; var r = $(li, '.jxe-rep'); r.textContent = (r.textContent + ' ' + b.textContent).trim(); } if (ev.target.hasAttribute('data-efface')) { $(li, '.jxe-rep').textContent = ''; $$(li, '.jxe-tuiles button').forEach(function (x) { x.disabled = false; }); } }); });
    ctx.verifier = function () { var ok = 0, l = $$(el, '.jxe-liste>li'); l.forEach(function (li) { var b = $(li, '.jxe-rep').textContent === li.dataset.p; li.classList.toggle('juste', b); li.classList.toggle('faux', !b); if (b) ok++; }); bilan(el, ok, l.length); };
    ctx.solution = function () { $$(el, '.jxe-liste>li').forEach(function (li) { $(li, '.jxe-rep').textContent = li.dataset.p; }); ctx.verifier(); };
  };

  R['texte-corriger'] = function (el, d, P, ctx) {
    var e = J.TYPES['texte-corriger'].erreurs(d), n = 0;
    el.innerHTML = '<p class="jxe-aide">Cliquer sur chaque passage faux pour le corriger.</p><p class="jxe-texte">' + e.map(function (m) { if (m.t) return m.t.split(/(\s+)/).map(function (w) { return /\S/.test(w) ? '<span class="jxe-mot-t">' + esc(w) + '</span>' : w; }).join(''); n++; return '<span class="jxe-mot-t err" data-j="' + esc(m.juste) + '">' + esc(m.faux) + '</span>'; }).join('') + '</p>' + pied();
    var trouves = 0, clics = 0;
    $(el, '.jxe-texte').addEventListener('click', function (ev) { var s = ev.target.closest('.jxe-mot-t'); if (!s || s.classList.contains('vu')) return; clics++; s.classList.add('vu'); if (s.classList.contains('err')) { trouves++; s.innerHTML = '<s>' + s.innerHTML + '</s> <b>' + esc(s.dataset.j) + '</b>'; } else s.classList.add('raté'); bilan(el, trouves, n, trouves + ' erreur(s) trouvée(s) sur ' + n + (clics > trouves ? ' · ' + (clics - trouves) + ' clic(s) sur un passage juste' : '') + '.'); });
    ctx.solution = function () { $$(el, '.err:not(.vu)').forEach(function (s) { s.click(); }); };
  };

  R['surlignage'] = function (el, d, P, ctx) {
    var n = 0;
    el.innerHTML = (d.cible ? '<p class="jxe-aide">À surligner : ' + esc(d.cible) + '</p>' : '') + '<p class="jxe-texte">' + O.morceaux(d.texte, '*', '*').map(function (m) { if (m.trou) { n++; return '<span class="jxe-mot-t cible">' + esc(m.trou) + '</span>'; } return m.t.split(/(\s+)/).map(function (w) { return /\S/.test(w) ? '<span class="jxe-mot-t">' + esc(w) + '</span>' : w; }).join(''); }).join('') + '</p>' + pied();
    $(el, '.jxe-texte').addEventListener('click', function (ev) { var s = ev.target.closest('.jxe-mot-t'); if (s) s.classList.toggle('surl'); });
    ctx.verifier = function () { var ok = $$(el, '.cible.surl').length, faux = $$(el, '.surl:not(.cible)').length; $$(el, '.surl').forEach(function (s) { s.classList.toggle('juste', s.classList.contains('cible')); s.classList.toggle('faux', !s.classList.contains('cible')); }); bilan(el, faux ? -1 : ok, n, ok + ' bon(s) passage(s) sur ' + n + (faux ? ' · ' + faux + ' mot(s) surligné(s) en trop' : '') + '.'); };
    ctx.solution = function () { $$(el, '.cible').forEach(function (s) { s.classList.add('surl'); }); ctx.verifier(); };
  };

  R['questions'] = function (el, d) {
    el.innerHTML = (d.document || d.image ? '<div class="jxe-doc">' + img(d.image, 'jxe-grande') + (d.document ? '<p>' + esc(d.document) + '</p>' : '') + '</div>' : '') + '<ol class="jxe-liste">' + liste(d.questions).map(function (q) { return '<li><p>' + esc(q.q) + '</p><textarea rows="2"></textarea><details><summary>Voir la réponse</summary><p class="jxe-modele">' + esc(q.reponse) + '</p></details></li>'; }).join('') + '</ol>';
  };

  R['qcm'] = function (el, d, P, ctx) {
    el.innerHTML = '<ol class="jxe-liste">' + liste(d.questions).map(function (q, i) { var multi = q.bonnes.length > 1; return '<li data-i="' + i + '"><p>' + esc(q.q) + (multi ? ' <i>(plusieurs réponses)</i>' : '') + '</p>' + img(q.image, 'jxe-grande') + '<div class="jxe-choix">' + liste(q.choix).map(function (c, j) { var t = typeof c === 'object' ? c : { texte: c }; return '<label><input type="' + (multi ? 'checkbox' : 'radio') + '" name="q' + i + '" value="' + j + '"> <b>' + lettreDe(j) + '.</b> ' + img(t.image, 'jxe-vign') + esc(t.texte) + '</label>'; }).join('') + '</div><p class="jxe-expl" hidden>' + esc(q.explication || '') + '</p></li>'; }).join('') + '</ol>' + pied();
    ctx.verifier = function () { var ok = 0; $$(el, 'li[data-i]').forEach(function (li) { var q = d.questions[+li.dataset.i], pris = $$(li, 'input:checked').map(function (x) { return +x.value; }).sort().join(','), b = pris === q.bonnes.slice().sort().join(','); li.classList.toggle('juste', b); li.classList.toggle('faux', !b); var ex = $(li, '.jxe-expl'); ex.hidden = !q.explication; if (b) ok++; }); bilan(el, ok, d.questions.length); };
    ctx.solution = function () { $$(el, 'li[data-i]').forEach(function (li) { var q = d.questions[+li.dataset.i]; $$(li, 'input').forEach(function (x) { x.checked = q.bonnes.indexOf(+x.value) >= 0; }); }); ctx.verifier(); };
  };

  R['vrai-faux'] = function (el, d, P, ctx) {
    var a = liste(d.affirmations);
    if (d.mode === 'cartes') {
      var i = 0, ok = 0;
      var carte = function () { if (i >= a.length) { el.innerHTML = '<p class="jxe-gros">' + ok + ' bonne(s) réponse(s) sur ' + a.length + '.</p>' + pied('<button class="jxe-b" data-a="recommencer">Rejouer</button>'); return; } el.innerHTML = '<div class="jxe-carte-vf"><small>' + (i + 1) + ' / ' + a.length + '</small><p>' + esc(a[i].texte) + '</p><div><button class="jxe-b" data-v="1">Vrai</button><button class="jxe-b" data-v="0">Faux</button></div><p class="jxe-expl"></p></div>'; $$(el, '[data-v]').forEach(function (b) { b.onclick = function () { var bon = (b.dataset.v === '1') === a[i].vrai; if (bon) ok++; var e = $(el, '.jxe-expl'); e.className = 'jxe-expl ' + (bon ? 'oui' : 'non'); e.textContent = (bon ? 'Juste. ' : 'Non : c’est ' + (a[i].vrai ? 'vrai' : 'faux') + '. ') + (a[i].explication || ''); $$(el, '[data-v]').forEach(function (x) { x.disabled = true; }); setTimeout(function () { i++; carte(); }, 1600); }; }); };
      ctx.recommencer = function () { i = 0; ok = 0; carte(); }; carte(); return;
    }
    el.innerHTML = '<ol class="jxe-liste">' + a.map(function (x, i) { return '<li data-i="' + i + '"><span>' + esc(x.texte) + '</span> <span class="jxe-vf"><label><input type="radio" name="v' + i + '" value="1"> Vrai</label><label><input type="radio" name="v' + i + '" value="0"> Faux</label></span><p class="jxe-expl" hidden>' + esc(x.explication || '') + '</p></li>'; }).join('') + '</ol>' + pied();
    ctx.verifier = function () { var ok = 0; $$(el, 'li[data-i]').forEach(function (li) { var x = a[+li.dataset.i], c = $(li, 'input:checked'), b = c && (c.value === '1') === x.vrai; li.classList.toggle('juste', !!b); li.classList.toggle('faux', !b); $(li, '.jxe-expl').hidden = !x.explication || !c; if (b) ok++; }); bilan(el, ok, a.length); };
    ctx.solution = function () { $$(el, 'li[data-i]').forEach(function (li) { var x = a[+li.dataset.i]; $(li, 'input[value="' + (x.vrai ? 1 : 0) + '"]').checked = true; }); ctx.verifier(); };
  };

  R['numerique'] = function (el, d, P, ctx) {
    el.innerHTML = '<ol class="jxe-liste">' + liste(d.questions).map(function (q, i) { return '<li data-i="' + i + '"><p>' + esc(q.q) + '</p><input inputmode="decimal" size="8"> ' + esc(q.unite || '') + '<p class="jxe-expl" hidden>' + esc(q.explication || '') + '</p></li>'; }).join('') + '</ol>' + pied();
    ctx.verifier = function () { var ok = 0; $$(el, 'li[data-i]').forEach(function (li) { var q = d.questions[+li.dataset.i], v = parseFloat(String($(li, 'input').value).replace(',', '.')), b = isFinite(v) && Math.abs(v - (+q.reponse)) <= (+q.tolerance || 0.001); li.classList.toggle('juste', b); li.classList.toggle('faux', !b); $(li, '.jxe-expl').hidden = !q.explication; if (b) ok++; }); bilan(el, ok, d.questions.length); };
    ctx.solution = function () { $$(el, 'li[data-i]').forEach(function (li) { $(li, 'input').value = String(d.questions[+li.dataset.i].reponse).replace('.', ','); }); ctx.verifier(); };
  };

  R['intrus'] = function (el, d, P, ctx) {
    el.innerHTML = '<ol class="jxe-liste">' + liste(d.series).map(function (s, i) { return '<li data-i="' + i + '"><div class="jxe-tuiles">' + liste(s.elements).map(function (x, j) { return '<button data-j="' + j + '">' + esc(x) + '</button>'; }).join('') + '</div><p class="jxe-expl" hidden>' + esc(s.raison || '') + '</p></li>'; }).join('') + '</ol>' + pied();
    el.addEventListener('click', function (ev) { var b = ev.target.closest('[data-j]'); if (!b) return; $$(b.parentNode, 'button').forEach(function (x) { x.classList.toggle('choisi', x === b); }); });
    ctx.verifier = function () { var ok = 0; $$(el, 'li[data-i]').forEach(function (li) { var s = d.series[+li.dataset.i], c = $(li, '.choisi'), b = c && +c.dataset.j === s.intrus; li.classList.toggle('juste', !!b); li.classList.toggle('faux', !b); $(li, '.jxe-expl').hidden = !c; if (b) ok++; }); bilan(el, ok, d.series.length); };
    ctx.solution = function () { $$(el, 'li[data-i]').forEach(function (li) { var s = d.series[+li.dataset.i]; $$(li, 'button').forEach(function (x) { x.classList.toggle('choisi', +x.dataset.j === s.intrus); }); }); ctx.verifier(); };
  };

  R['relier'] = function (el, d, P, ctx) {
    var m = J.TYPES.relier.melange(d, P), t = liste(d.titres);
    el.innerHTML = '<table class="jxe-relier">' + (t.length ? '<tr><th>' + esc(t[0]) + '</th><th></th><th>' + esc(t[1]) + '</th></tr>' : '') + d.paires.map(function (p, i) { var q = d.paires[m[i]]; return '<tr data-i="' + i + '"><td>' + img(p.imageG, 'jxe-vign') + esc(p.gauche) + '</td><td><select><option value=""></option>' + d.paires.map(function (_, k) { return '<option>' + (k + 1) + '</option>'; }).join('') + '</select></td><td><b>' + (i + 1) + '.</b> ' + img(q.imageD, 'jxe-vign') + esc(q.droite) + '</td></tr>'; }).join('') + '</table>' + pied();
    ctx.verifier = function () { var ok = 0; $$(el, 'tr[data-i]').forEach(function (tr) { var i = +tr.dataset.i, v = +$(tr, 'select').value, b = v === m.indexOf(i) + 1; tr.classList.toggle('juste', b); tr.classList.toggle('faux', !b); if (b) ok++; }); bilan(el, ok, d.paires.length); };
    ctx.solution = function () { $$(el, 'tr[data-i]').forEach(function (tr) { $(tr, 'select').value = String(m.indexOf(+tr.dataset.i) + 1); }); ctx.verifier(); };
  };

  R['memory'] = function (el, d, P, ctx) {
    var c = J.TYPES.memory.cartes(d, P), ouv = [], trouvees = 0, coups = 0;
    el.innerHTML = '<div class="jxe-memo">' + c.map(function (x, i) { return '<button class="jxe-mcarte" data-i="' + i + '"><span class="dos">?</span><span class="face">' + img(x.im, 'jxe-vign') + '<span>' + esc(x.t) + '</span></span></button>'; }).join('') + '</div>' + pied('<button class="jxe-b second" data-a="recommencer">Recommencer</button>');
    $(el, '.jxe-memo').addEventListener('click', function (ev) { var b = ev.target.closest('.jxe-mcarte'); if (!b || b.classList.contains('vue') || ouv.length === 2) return; b.classList.add('vue'); ouv.push(b); if (ouv.length === 2) { coups++; var a = c[+ouv[0].dataset.i], z = c[+ouv[1].dataset.i]; if (a.p === z.p) { ouv.forEach(function (x) { x.classList.add('trouvee'); }); ouv = []; trouvees++; bilan(el, trouvees, d.paires.length, trouvees + ' paire(s) sur ' + d.paires.length + ' · ' + coups + ' coup(s).'); } else setTimeout(function () { ouv.forEach(function (x) { x.classList.remove('vue'); }); ouv = []; }, 1100); } });
  };

  R['tri'] = function (el, d, P, ctx) {
    var t = J.TYPES.tri, cats = d.categories;
    el.innerHTML = '<div class="jxe-bulles">' + d.elements.map(function (e, i) { return '<div class="jxe-bulle" data-i="' + i + '">' + img(e.image, 'jxe-pers') + '<div>' + (e.personne ? '<b>' + esc(e.personne) + '</b>' : '') + '<p>' + (e.personne ? '« ' + esc(e.texte) + ' »' : esc(e.texte)) + '</p><div class="jxe-cats">' + cats.map(function (c, k) { return '<button data-k="' + k + '" title="' + esc(c.nom) + '">' + esc(t.lettre(c, k)) + '</button>'; }).join('') + '</div></div></div>'; }).join('') + '</div><p class="jxe-aide">' + cats.map(function (c, k) { return '<b>' + esc(t.lettre(c, k)) + '</b> = ' + esc(c.nom); }).join(' · ') + '</p>' + pied();
    el.addEventListener('click', function (ev) { var b = ev.target.closest('[data-k]'); if (!b) return; $$(b.parentNode, 'button').forEach(function (x) { x.classList.toggle('choisi', x === b); }); });
    ctx.verifier = function () { var ok = 0; $$(el, '.jxe-bulle').forEach(function (bu) { var e = d.elements[+bu.dataset.i], c = $(bu, '.choisi'), b = c && +c.dataset.k === e.categorie; bu.classList.toggle('juste', !!b); bu.classList.toggle('faux', !b); if (b) ok++; }); bilan(el, ok, d.elements.length); };
    ctx.solution = function () { $$(el, '.jxe-bulle').forEach(function (bu) { var e = d.elements[+bu.dataset.i]; $$(bu, '[data-k]').forEach(function (x) { x.classList.toggle('choisi', +x.dataset.k === e.categorie); }); }); ctx.verifier(); };
  };

  R['legender'] = function (el, d, P, ctx) {
    var b = O.melanger(d.etiquettes.map(function (e) { return e.texte; }), O.alea(P.graine + '|leg'));
    el.innerHTML = '<div class="jxe-2col"><div class="jxe-leg">' + img(d.image, 'jxe-grande') + d.etiquettes.map(function (e, i) { return '<span class="jxe-point" style="left:' + e.x + '%;top:' + e.y + '%">' + (i + 1) + '</span>'; }).join('') + '</div><ol class="jxe-liste">' + d.etiquettes.map(function (e, i) { return '<li data-i="' + i + '"><select><option value=""></option>' + b.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('') + '</select></li>'; }).join('') + '</ol></div>' + pied();
    ctx.verifier = function () { var ok = 0; $$(el, 'li[data-i]').forEach(function (li) { var bo = $(li, 'select').value === d.etiquettes[+li.dataset.i].texte; li.classList.toggle('juste', bo); li.classList.toggle('faux', !bo); if (bo) ok++; }); bilan(el, ok, d.etiquettes.length); };
    ctx.solution = function () { $$(el, 'li[data-i]').forEach(function (li) { $(li, 'select').value = d.etiquettes[+li.dataset.i].texte; }); ctx.verifier(); };
  };

  R['zones'] = function (el, d, P, ctx) {
    var vus = {};
    el.innerHTML = (d.cible ? '<p class="jxe-aide">À trouver : ' + esc(d.cible) + ' — cliquer sur l’image.</p>' : '') + '<div class="jxe-2col"><div class="jxe-leg jxe-clic">' + img(d.image, 'jxe-grande') + '</div><ol class="jxe-liste jxe-trouves"></ol></div>' + pied('<button class="jxe-b second" data-a="solution">Voir la solution</button><button class="jxe-b second" data-a="recommencer">Recommencer</button>');
    var zone = $(el, '.jxe-clic');
    function montrer(i) { if (vus[i]) return; vus[i] = 1; var z = d.zones[i]; zone.insertAdjacentHTML('beforeend', '<span class="jxe-zone" style="left:' + z.x + '%;top:' + z.y + '%;width:' + z.l + '%;height:' + z.h + '%">' + (Object.keys(vus).length) + '</span>'); $(el, '.jxe-trouves').insertAdjacentHTML('beforeend', '<li>' + esc(z.texte) + '</li>'); bilan(el, Object.keys(vus).length, d.zones.length, Object.keys(vus).length + ' trouvé(s) sur ' + d.zones.length + '.'); }
    zone.addEventListener('click', function (ev) { var r = zone.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100, hit = false; d.zones.forEach(function (z, i) { if (x >= z.x && x <= z.x + z.l && y >= z.y && y <= z.y + z.h) { montrer(i); hit = true; } }); if (!hit) { zone.insertAdjacentHTML('beforeend', '<span class="jxe-rate" style="left:' + x + '%;top:' + y + '%">✕</span>'); var s = zone.lastElementChild; setTimeout(function () { s.remove(); }, 900); } });
    ctx.solution = function () { d.zones.forEach(function (_, i) { montrer(i); }); };
  };

  R['labyrinthe'] = function (el, d, P, ctx) {
    var t = J.TYPES.labyrinthe, pl = t.plan(d, P), i = 0, chemin = [];
    function cas() { var c = d.cases[i]; el.innerHTML = '<div class="jxe-carte-vf"><small>Case ' + (i + 1) + '</small><p>' + esc(c.texte) + '</p><div><button class="jxe-b" data-v="v">Vrai</button><button class="jxe-b" data-v="f">Faux</button></div></div><p class="jxe-aide">Chemin : ' + (chemin.join(' → ') || 'départ') + '</p>';
      $$(el, '[data-v]').forEach(function (b) { b.onclick = function () { var dest = pl[i][b.dataset.v]; chemin.push('case ' + (i + 1) + ' ' + (b.dataset.v === 'v' ? 'vrai' : 'faux')); var m = /^case (\d+)/.exec(dest); if (m) { i = +m[1] - 1; cas(); } else { el.innerHTML = '<p class="jxe-gros">Vous sortez par la ' + esc(dest) + '.</p><p class="jxe-aide">' + esc(chemin.join(' → ')) + '</p>' + pied('<button class="jxe-b" data-a="recommencer">Recommencer</button>'); } }; }); }
    ctx.recommencer = function () { i = 0; chemin = []; cas(); }; cas();
  };

  R['tableau'] = function (el, d, P, ctx) {
    el.innerHTML = '<table class="jxe-tab"><tr>' + d.colonnes.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>' + d.lignes.map(function (l) { return '<tr>' + l.map(function (c) { var m = /^\[(.*)\]$/.exec(String(c)); return '<td>' + (m ? '<input data-r="' + esc(m[1]) + '">' : esc(c)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>' + pied();
    ctx.verifier = function () { var ok = 0, l = $$(el, '[data-r]'); l.forEach(function (i) { var b = egal(i.value, i.dataset.r); i.classList.toggle('juste', b); i.classList.toggle('faux', !b); if (b) ok++; }); bilan(el, ok, l.length); };
    ctx.solution = function () { $$(el, '[data-r]').forEach(function (i) { i.value = i.dataset.r; }); ctx.verifier(); };
  };

  R['flashcards'] = function (el, d, P, ctx) {
    var i = 0, c = d.cartes;
    function carte() { var x = c[i]; el.innerHTML = '<button class="jxe-flash"><span class="r">' + img(x.image, 'jxe-grande') + esc(x.recto) + '</span><span class="v">' + esc(x.verso) + '</span></button><p class="jxe-aide">Carte ' + (i + 1) + ' / ' + c.length + ' — cliquer pour retourner.</p>' + pied('<button class="jxe-b second" data-a="prec">◀ Précédente</button><button class="jxe-b" data-a="suiv">Suivante ▶</button>'); $(el, '.jxe-flash').onclick = function () { this.classList.toggle('tourne'); }; }
    ctx.prec = function () { i = (i - 1 + c.length) % c.length; carte(); }; ctx.suiv = function () { i = (i + 1) % c.length; carte(); }; carte();
  };

  R['roue'] = function (el, d, P, ctx) {
    var e = d.elements, faits = [];
    el.innerHTML = '<div class="jxe-roue"><div class="jxe-tire">?</div><button class="jxe-b" data-a="tirer">Tirer au sort</button><details hidden><summary>Réponse</summary><p class="jxe-modele"></p></details><p class="jxe-aide"></p></div>';
    ctx.tirer = function () { var reste = e.map(function (_, i) { return i; }).filter(function (i) { return faits.indexOf(i) < 0; }); if (!reste.length) { faits = []; reste = e.map(function (_, i) { return i; }); } var k = 0, n = 12 + Math.floor(Math.random() * 8), box = $(el, '.jxe-tire'); var tic = setInterval(function () { box.textContent = e[reste[k++ % reste.length]].texte; if (k >= n) { clearInterval(tic); var x = reste[(k - 1) % reste.length]; faits.push(x); var det = $(el, 'details'); det.hidden = !e[x].reponse; det.open = false; $(el, '.jxe-modele').textContent = e[x].reponse || ''; $(el, '.jxe-roue .jxe-aide').textContent = faits.length + ' / ' + e.length + ' tirés'; } }, 90); };
  };

  R['bingo'] = function (el, d, P, ctx) {
    var ordre = O.melanger(d.mots, O.alea(P.graine + '|tirage')), i = 0;
    el.innerHTML = '<div class="jxe-roue"><p class="jxe-aide">Lire la définition ; les élèves cochent le mot sur leur grille papier.</p><div class="jxe-tire">Prêt ?</div><button class="jxe-b" data-a="suivant">Définition suivante</button><details><summary>Mots déjà tirés</summary><ol class="jxe-tires"></ol></details></div>';
    ctx.suivant = function () { if (i >= ordre.length) { $(el, '.jxe-tire').textContent = 'Toutes les définitions ont été lues.'; return; } var m = ordre[i++]; $(el, '.jxe-tire').textContent = m.def; $(el, '.jxe-tires').insertAdjacentHTML('beforeend', '<li>' + esc(m.mot) + '</li>'); };
  };

  R['auto-evaluation'] = function (el, d) { var e = J.TYPES['auto-evaluation'].echelle(d); el.innerHTML = '<table class="jxe-tab"><tr><th>Je sais…</th>' + e.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr>' + d.criteres.map(function (c, i) { return '<tr><td>' + esc(c) + '</td>' + e.map(function (_, k) { return '<td><input type="radio" name="ae' + i + '" aria-label="' + esc(e[k]) + '"></td>'; }).join('') + '</tr>'; }).join('') + '</table>'; };
  R['ticket-sortie'] = function (el, d) { var q = liste(d.questions).length ? d.questions : J.TYPES['ticket-sortie'].exemple.questions; el.innerHTML = '<ol class="jxe-liste">' + q.map(function (x) { return '<li><p><b>' + esc(x) + '</b></p><textarea rows="2"></textarea></li>'; }).join('') + '</ol>'; };

  /* [PLANCHE 22/10/2026] Planche de jeux : chaque petit jeu à la suite, avec ses propres boutons. */
  R['planche'] = function (el, d, P) {
    el.innerHTML = liste(d.jeux).map(function (x, i) { return '<section class="jxe-sec"><h3><span>' + (i + 1) + '</span>' + esc(x.titre || J.TYPES[x.jeu.type].nom) + '</h3>' + (x.consigne ? '<p class="jxe-consigne">' + esc(x.consigne) + '</p>' : '') + '<div class="jxe-sous"></div></section>'; }).join('');
    $$(el, '.jxe-sous').forEach(function (z, i) {
      var x = d.jeux[i], r = R[x.jeu.type], ctx = {}, sp = J.sousP(P, i);
      var lancer = function () { ctx = {}; r ? r(z, x.jeu.donnees || {}, sp, ctx) : (z.innerHTML = '<div class="jx-page">' + J.TYPES[x.jeu.type].papier(x.jeu.donnees || {}, sp, false) + '</div>'); };
      z.addEventListener('click', function (ev) { var b = ev.target.closest('[data-a]'); if (!b) return; ev.stopPropagation(); var a = b.dataset.a; if (a === 'recommencer' && !ctx.recommencer) return lancer(); if (ctx[a]) ctx[a](); });
      lancer();
    });
  };

  /* ---------- Escape game : lecteur ---------- */
  function escapeJeu(el, jeu) {
    var d = jeu.donnees || {}, h = d.histoire || {}, P = J.P(jeu), et = liste(d.etapes), sel = 'pse-esc|' + (jeu.graine || jeu.id) + '|';
    var codes = et.map(function (e, i) { return { type: J.typeCadenas(e, P, i), h: O.hacher(sel + J.codeEtape(e, P, i)), n: J.codeEtape(e, P, i).length }; });
    var etat = { i: -1, debut: 0, indices: 0, vus: {} }, tic = null, max = +d.indicesMax || 3, duree = (+h.duree || 50) * 60;
    el.innerHTML = '<div class="jxe-esc"><header><b>' + esc(h.titre || jeu.titre) + '</b><span class="jxe-cad"></span><span class="jxe-chrono">' + String(Math.floor(duree / 60)).padStart(2, '0') + ':00</span></header><div class="jxe-scene"></div></div>';
    var sc = $(el, '.jxe-scene');
    function cad() { $(el, '.jxe-cad').innerHTML = et.map(function (_, i) { return '<i class="' + (i < etat.i || etat.i >= et.length ? 'ouvert' : i === etat.i ? 'courant' : '') + '" title="Cadenas ' + (i + 1) + '"></i>'; }).join(''); }
    function chrono() { var r = Math.max(0, duree - Math.floor((Date.now() - etat.debut) / 1000)), c = $(el, '.jxe-chrono'); c.textContent = String(Math.floor(r / 60)).padStart(2, '0') + ':' + String(r % 60).padStart(2, '0'); c.classList.toggle('fin', r < 300); }
    function accueil() { sc.innerHTML = '<div class="jxe-accueil">' + (liste(d.scene).length ? '<div class="jxe-imgs">' + d.scene.map(function (s) { return img(s, 'jxe-sc'); }).join('') + '</div>' : '') + '<div><h2>Votre mission</h2><p>' + esc(h.contexte) + '</p><p><b>' + esc(h.mission) + '</b></p><p>' + et.length + ' énigmes, ' + et.length + ' cadenas. ' + max + ' indices au plus pour toute l’équipe.</p><button class="jxe-b" data-go>Commencer la mission</button></div></div>'; $(sc, '[data-go]').onclick = function () { etat.i = 0; etat.debut = Date.now(); tic = setInterval(chrono, 1000); chrono(); etape(); }; cad(); }
    function serrure(c) {
      if (c.type === 'fleches') return { html: '<div class="jxe-fl"><span></span><button data-f="H">↑</button><span></span><button data-f="G">←</button><button data-f="B">↓</button><button data-f="D">→</button></div><div class="jxe-suite"></div><button class="jxe-b second" data-eff>Effacer</button>', init: function (s) { var v = ''; s.lire = function () { return v; }; var aff = function () { $(s, '.jxe-suite').textContent = v.split('').map(function (x) { return J.FLECHES[x]; }).join(' '); }; $$(s, '[data-f]').forEach(function (b) { b.onclick = function () { if (v.length < 8) v += b.dataset.f; aff(); }; }); $(s, '[data-eff]').onclick = function () { v = ''; aff(); }; } };
      var alpha = J.CADENAS[c.type].alphabet;
      return { html: '<div class="jxe-roues">' + Array.apply(null, { length: c.n }).map(function () { return '<div class="jxe-roue1"><button data-d="1">▲</button><span' + (c.type === 'couleurs' ? ' class="coul"' : '') + '>' + alpha[0] + '</span><button data-d="-1">▼</button></div>'; }).join('') + '</div>', init: function (s) {
        var peindre = function (sp) { if (c.type === 'couleurs') { var k = J.COULEURS[sp.textContent]; sp.style.background = k[1]; sp.title = k[0]; } };
        $$(s, '.jxe-roue1').forEach(function (r) { peindre($(r, 'span')); r.addEventListener('click', function (ev) { var dd = +ev.target.dataset.d; if (!dd) return; var sp = $(r, 'span'); sp.textContent = alpha[(alpha.indexOf(sp.textContent) + dd + alpha.length) % alpha.length]; peindre(sp); }); });
        s.lire = function () { return $$(s, '.jxe-roue1 span').map(function (x) { return x.textContent; }).join(''); }; } };
    }
    function etape() {
      var e = et[etat.i], t = J.TYPES[e.jeu.type], c = codes[etat.i], S = serrure(c);
      sc.innerHTML = '<div class="jxe-etape"><h2>Énigme ' + (etat.i + 1) + ' — ' + esc(e.titre || t.nom) + '</h2><p class="jxe-aide">' + esc(t.nom) + ' · ' + J.CADENAS[c.type].nom + '</p>' + (e.consigne ? '<p class="jxe-consigne">' + esc(e.consigne) + '</p>' : '') + '<div class="jx-page jxe-fiche">' + t.papier(e.jeu.donnees || {}, J.sousP(P, etat.i), false).replace(/<p class="jx-code">[\s\S]*?<\/p>/, '') + '</div>' +
        '<div class="jxe-serrure"><i class="jxe-cadenas"></i>' + S.html + '<button class="jxe-b" data-ouvrir>Ouvrir</button><div class="jxe-msg" aria-live="polite"></div></div><div class="jxe-ind"><button class="jxe-b second" data-ind>Demander un indice</button><span class="jxe-irest"></span><div class="jxe-lesind"></div></div></div>';
      var s = $(sc, '.jxe-serrure'); S.init(s);
      etat.vus[etat.i] = etat.vus[etat.i] || 0;
      var montrer = function () { var k = etat.vus[etat.i]; $(sc, '.jxe-lesind').innerHTML = liste(e.indices).slice(0, k).map(function (x, n) { return '<p class="jxe-indice"><b>Indice ' + (n + 1) + '.</b> ' + esc(x) + '</p>'; }).join(''); $(sc, '.jxe-irest').textContent = 'Indices restants pour l’équipe : ' + (max - etat.indices); $(sc, '[data-ind]').disabled = etat.indices >= max || k >= liste(e.indices).length; };
      montrer(); $(sc, '[data-ind]').onclick = function () { etat.indices++; etat.vus[etat.i]++; montrer(); };
      $(sc, '[data-ouvrir]').onclick = function () { var v = s.lire(), m = $(sc, '.jxe-msg'); if (O.hacher(sel + v) === c.h && v.length === c.n) { $(s, '.jxe-cadenas').classList.add('ouvert'); m.className = 'jxe-msg oui'; m.textContent = 'Cadenas ouvert : le code est ' + J.codeLisible(c.type, v) + '.'; this.disabled = true; setTimeout(function () { etat.i++; cad(); etat.i < et.length ? etape() : fin(); }, 1400); } else { m.className = 'jxe-msg non'; m.textContent = 'Ce n’est pas le bon code.'; s.classList.remove('secoue'); void s.offsetWidth; s.classList.add('secoue'); } };
      cad(); sc.scrollTop = 0;
    }
    function fin() { clearInterval(tic); var t = Math.floor((Date.now() - etat.debut) / 1000); sc.innerHTML = '<div class="jxe-fin"><i class="jxe-cadenas ouvert grand"></i><h2>' + esc(h.fin || 'Mission accomplie') + '</h2><p>Temps : ' + Math.floor(t / 60) + ' min ' + String(t % 60).padStart(2, '0') + ' s · Indices utilisés : ' + etat.indices + ' sur ' + max + '</p>' + (h.finConsigne ? '<p><b>' + esc(h.finConsigne) + '</b></p>' : '') + '</div>'; }
    accueil();
    return { etat: etat, codes: codes };
  }

  function monter(el, jeu) {
    var t = J.TYPES[jeu.type]; if (!t) { el.textContent = 'Type inconnu.'; return; }
    el.classList.add('jxe');
    if (jeu.type === 'escape') return escapeJeu(el, jeu);
    var ctx = {}, P = J.P(jeu), r = R[jeu.type];
    el.innerHTML = '';
    var tete = document.createElement('div'); tete.className = 'jxe-tete'; tete.innerHTML = '<h2>' + esc(jeu.titre) + '</h2>' + (jeu.consigne ? '<p class="jxe-consigne">' + esc(jeu.consigne) + '</p>' : '');
    var corps = document.createElement('div'); corps.className = 'jxe-corps';
    el.appendChild(tete); el.appendChild(corps);
    var lancer = function () { ctx = {}; (r || function (z) { z.innerHTML = '<div class="jx-page">' + t.papier(jeu.donnees || {}, P, false) + '</div>'; })(corps, jeu.donnees || {}, P, ctx); };
    corps.addEventListener('click', function (ev) { var b = ev.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a; if (a === 'recommencer' && !ctx.recommencer) return lancer(); if (ctx[a]) ctx[a](); });
    lancer();
    return ctx;
  }

  var CSS = [
    '.jxe{font:17px/1.45 Arial,Helvetica,sans-serif;color:#1f2937}.jxe h2{color:#0F766E;margin:0 0 6px}.jxe-consigne{font-weight:700}.jxe-aide{color:#475569}.jxe-gros{font-size:22px;font-weight:700;color:#0F766E}',
    '.jxe-b{font:inherit;cursor:pointer;border-radius:10px;border:1.5px solid #0F766E;background:#0F766E;color:#fff;padding:8px 16px;font-weight:700;margin:2px}.jxe-b.second{background:#fff;color:#0F766E}.jxe-b.mini{padding:3px 9px;font-size:14px}.jxe-b:disabled{opacity:.4;cursor:default}',
    '.jxe-pied{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:14px}.jxe-bilan{flex-basis:100%;font-weight:700;min-height:22px}.jxe-bilan.oui,.jxe-msg.oui,.jxe-expl.oui{color:#0F766E}.jxe-bilan.non,.jxe-msg.non,.jxe-expl.non{color:#B91C1C}',
    '.jxe .juste{background:#DCFCE7!important;border-color:#16A34A!important}.jxe .faux{background:#FEE2E2!important;border-color:#DC2626!important}',
    '.jxe-2col{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:20px;align-items:start}@media(max-width:820px){.jxe-2col{grid-template-columns:1fr}}.jxe-scroll{overflow:auto;max-width:100%}',
    '.jxe-mc{border-collapse:collapse}.jxe-mc td{width:34px;height:34px;border:1px solid #64748b;position:relative;padding:0}.jxe-mc td.n{border:0}.jxe-mc sup{position:absolute;left:2px;top:0;font-size:10px}.jxe-mc input,.jxe-acro input{width:100%;height:100%;border:0;text-align:center;font:700 18px Arial;text-transform:uppercase;background:transparent}',
    '.jxe-mm{border-collapse:collapse;user-select:none}.jxe-mm td{width:34px;height:34px;text-align:center;font-weight:700;font-size:19px;border:1px solid #CBD5E1;cursor:pointer}.jxe-mm td.sel{background:#FDE68A}.jxe-mm td.pris{background:#99F6E4}.jxe-mm td.reste{background:#FBCFE8}.jxe-mots li.fait{text-decoration:line-through;color:#94A3B8}.jxe-reste{font-weight:700;color:#BE185D}',
    '.jxe-jauge{display:flex;gap:4px;align-items:flex-end;height:46px;margin:8px 0}.jxe-jauge i{width:16px;height:40px;background:#99F6E4;border-radius:4px}.jxe-jauge i.perdu{background:#FCA5A5}.jxe-jauge small{margin-left:8px}.jxe-mot{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.jxe-mot span{width:32px;height:40px;border-bottom:3px solid #334155;text-align:center;font:700 26px Arial}.jxe-clavier{display:flex;flex-wrap:wrap;gap:4px;max-width:620px}.jxe-clavier button{width:40px;height:40px;font:700 17px Arial;border-radius:8px;border:1.5px solid #94A3B8;background:#fff;cursor:pointer}.jxe-clavier button:disabled{opacity:.3}',
    '.jxe-liste>li{margin:0 0 12px;padding:6px 8px;border-radius:10px;border:1.5px solid transparent}.jxe-tuiles{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.jxe-tuiles button,.jxe-cats button{font:inherit;border:1.5px solid #64748b;border-radius:8px;background:#fff;padding:5px 10px;cursor:pointer}.jxe-tuiles button:disabled{opacity:.3}.jxe-tuiles button.choisi,.jxe-cats button.choisi{background:#0F766E;color:#fff;border-color:#0F766E}.jxe-rep{min-height:32px;border-bottom:2px solid #334155;font:700 20px Arial;letter-spacing:3px;margin:4px 0}.jxe-rep.phrase{letter-spacing:0;font-weight:400}',
    '.jxe-acro{border-collapse:separate;border-spacing:3px}.jxe-acro td{width:34px;height:36px;border:1.5px solid #334155;border-radius:4px;padding:0}.jxe-acro td.vide,.jxe-acro td.nd{border:0}.jxe-acro td.nd{color:#0F766E;font-weight:700;text-align:right;padding-right:6px}.jxe-acro td.mys{background:#99F6E4}',
    '.jxe input,.jxe select,.jxe textarea{font:inherit;border:1.5px solid #94A3B8;border-radius:6px;padding:3px 6px}.jxe textarea{width:100%}.jxe-long{width:min(560px,90%)}.jxe-texte{line-height:2.2}',
    '.jxe-ordre{list-style:none;padding:0}.jxe-ordre li{display:flex;gap:8px;align-items:center;border:1.5px solid #CBD5E1;border-radius:10px;padding:6px 8px;margin:6px 0;background:#fff}.jxe-ordre li>div{flex:1}.jxe-lt{background:#0F766E;color:#fff;border-radius:50%;min-width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-weight:700}',
    '.jxe-mot-t{cursor:pointer;border-radius:4px;padding:0 1px}.jxe-mot-t.surl{background:#FDE68A}.jxe-mot-t.vu.raté{background:#FEE2E2}.jxe-mot-t.err.vu{background:#DCFCE7}',
    '.jxe-choix{display:grid;gap:4px}.jxe-choix label{cursor:pointer}.jxe-vf{white-space:nowrap;margin-left:8px}.jxe-vf label{margin-right:12px}.jxe-expl{color:#475569;font-style:italic}',
    '.jxe-carte-vf{max-width:640px;margin:20px auto;text-align:center;border:2px solid #0F766E;border-radius:18px;padding:22px}.jxe-carte-vf p{font-size:22px}',
    '.jxe-relier td{padding:6px 8px;border-bottom:1px solid #E2E8F0}.jxe-relier tr.juste td,.jxe-relier tr.faux td{background:inherit}.jxe-vign{max-width:80px;max-height:60px;vertical-align:middle;margin-right:6px}.jxe-grande{max-width:100%;max-height:60vh;display:block}',
    '.jxe-memo{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.jxe-mcarte{min-height:110px;border-radius:12px;border:2px solid #0F766E;background:#F0FDFA;cursor:pointer;font:inherit;padding:8px}.jxe-mcarte .face{display:none}.jxe-mcarte .dos{font-size:30px;color:#0F766E;font-weight:700}.jxe-mcarte.vue .face{display:flex;flex-direction:column;align-items:center;gap:4px}.jxe-mcarte.vue .dos{display:none}.jxe-mcarte.vue{background:#fff}.jxe-mcarte.trouvee{background:#DCFCE7;border-color:#16A34A}',
    '.jxe-bulles{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px}.jxe-bulle{display:flex;gap:8px;align-items:center;border:1.5px solid #CBD5E1;border-radius:12px;padding:8px;background:#fff}.jxe-bulle p{margin:2px 0;font-style:italic}.jxe-pers{width:64px;height:76px;object-fit:contain}.jxe-cats{display:flex;gap:4px}',
    '.jxe-leg{position:relative;display:inline-block;max-width:100%}.jxe-point{position:absolute;transform:translate(-50%,-50%);background:#0F766E;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700}.jxe-clic{cursor:crosshair}.jxe-zone{position:absolute;border:3px solid #16A34A;border-radius:8px;color:#16A34A;font-weight:700;padding:0 4px;background:rgba(220,252,231,.35)}.jxe-rate{position:absolute;transform:translate(-50%,-50%);color:#DC2626;font-weight:700;font-size:22px}',
    '.jxe-tab{border-collapse:collapse}.jxe-tab th,.jxe-tab td{border:1px solid #94A3B8;padding:6px 8px}.jxe-tab th{background:#F0FDFA}',
    '.jxe-flash{display:block;width:min(640px,100%);min-height:220px;margin:10px auto;border-radius:18px;border:2px solid #0F766E;background:#F0FDFA;font:22px/1.4 Arial;padding:20px;cursor:pointer}.jxe-flash .v{display:none}.jxe-flash.tourne{background:#fff}.jxe-flash.tourne .v{display:block;color:#0F766E;font-weight:700}.jxe-flash.tourne .r{display:none}',
    '.jxe-roue{text-align:center}.jxe-tire{min-height:120px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;border:2px solid #0F766E;border-radius:18px;margin:12px auto;max-width:760px;padding:16px}.jxe-modele{color:#0F766E;font-weight:700}',
    '.jxe-sec{border-top:2px solid #CBD5E1;padding:10px 0 16px}.jxe-sec h3{display:flex;align-items:center;gap:8px;color:#0F766E;margin:0 0 4px}.jxe-sec h3 span{background:#0F766E;color:#fff;border-radius:50%;width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;font-size:15px}',
    '.jxe-doc{border:1px solid #CBD5E1;border-radius:10px;padding:8px 12px;background:#F8FAFC;margin-bottom:10px}',
    '.jxe-esc{display:flex;flex-direction:column;min-height:100%}.jxe-esc header{display:flex;align-items:center;gap:14px;padding:8px 14px;border-bottom:2.5px solid #0F766E;background:#fff;position:sticky;top:0;z-index:2}.jxe-cad{display:flex;gap:6px;margin-left:auto}.jxe-cad i,.jxe-cadenas{display:inline-block;width:22px;height:26px;position:relative;opacity:.35}.jxe-cad i.ouvert,.jxe-cad i.courant{opacity:1}',
    '.jxe-cad i::before,.jxe-cadenas::before{content:"";position:absolute;left:3px;right:3px;top:0;height:14px;border:3px solid #334155;border-bottom:0;border-radius:9px 9px 0 0}.jxe-cad i::after,.jxe-cadenas::after{content:"";position:absolute;left:0;right:0;bottom:0;height:15px;background:#EAB308;border:2px solid #334155;border-radius:3px}.jxe-cad i.ouvert::before,.jxe-cadenas.ouvert::before{top:-6px;left:9px;right:-4px}.jxe-cadenas{opacity:1;width:34px;height:40px}.jxe-cadenas::before{height:22px;left:5px;right:5px}.jxe-cadenas::after{height:22px}.jxe-cadenas.grand{transform:scale(2);margin:30px}',
    '.jxe-chrono{font-weight:700;font-size:22px;font-variant-numeric:tabular-nums}.jxe-chrono.fin{color:#B91C1C}.jxe-scene{padding:16px;max-width:1200px;margin:0 auto;width:100%}',
    '.jxe-accueil{display:grid;grid-template-columns:1fr 1.3fr;gap:24px;align-items:center}.jxe-imgs{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}.jxe-sc{width:140px;height:140px;object-fit:contain}@media(max-width:820px){.jxe-accueil{grid-template-columns:1fr}}',
    '.jxe-fiche{background:#fff;border:1px solid #CBD5E1;border-radius:14px;padding:12px 16px;font-size:16px}',
    '.jxe-serrure{margin-top:14px;padding:14px;border-radius:14px;background:#F0FDFA;border:1.5px solid #99F6E4;display:flex;flex-wrap:wrap;align-items:center;gap:14px}.jxe-msg{flex-basis:100%;font-weight:700;min-height:22px}.secoue{animation:jxe-sec .35s}@keyframes jxe-sec{25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}',
    '.jxe-roues{display:flex;gap:6px}.jxe-roue1{display:flex;flex-direction:column;align-items:center;background:#fff;border:1.5px solid #334155;border-radius:10px;width:46px}.jxe-roue1 button{background:none;border:0;padding:2px 0;width:100%;cursor:pointer}.jxe-roue1 span{font:700 26px Arial;line-height:1.3}.jxe-roue1 span.coul{width:30px;height:30px;border-radius:50%;margin:3px;color:transparent}',
    '.jxe-fl{display:grid;grid-template-columns:repeat(3,44px);grid-template-rows:repeat(2,40px);gap:4px}.jxe-fl button{font-size:22px;border-radius:10px;border:1.5px solid #0F766E;background:#0F766E;color:#fff;cursor:pointer}.jxe-suite{min-width:160px;min-height:44px;background:#fff;border:1.5px solid #334155;border-radius:10px;font-size:24px;padding:4px 10px;display:flex;align-items:center}',
    '.jxe-ind{margin-top:12px;display:flex;flex-wrap:wrap;gap:10px;align-items:center}.jxe-lesind{flex-basis:100%}.jxe-indice{background:#FFFBEB;border:1px solid #FCD34D;border-radius:10px;padding:8px 10px;margin:6px 0}.jxe-fin{text-align:center;max-width:720px;margin:30px auto}'
  ].join('\n');

  var API = { monter: monter, RENDUS: R, CSS: CSS };
  racine.PSE_JEUX_ECRAN = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
