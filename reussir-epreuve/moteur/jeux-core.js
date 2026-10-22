/* jeux-core.js — espace « Jeux » (ludothèque) : le modèle, sans écran.
 * [LUDOTHÈQUE 21/10/2026] Demande de Brahim : une bibliothèque de jeux où chaque jeu est un MODÈLE fixe, pour que toutes les IA
 * (Claude, Codex, ChatGPT) puisent dedans et obtiennent la même grille, le même cadenas, la même fiche, au lieu d'improviser.
 * Mécaniques reprises de l'inventaire de Brahim (155 mécaniques, catalogues H5P, LearningApps, Wordwall, Educaplay, BookWidgets,
 * Genially, Twine, Moodle, Éduscol) : on reprend le fonctionnement, jamais le code ni les graphismes de ces plateformes.
 * Module pur : navigateur (window.PSE_JEUX) et Node (require), comme cartes-mentales-core.js.
 *
 * Clé du store : pse-jeux-v1 → store/jeux.json
 * { version:1, jeux:[ jeu ], dossiers:[ nom ], corbeille:[ { jeu, le } ] }
 * jeu = { id, titre, type, module, niveau, dossier, graine, donnees, sources:[], cree, maj, rev }
 * Un même jeu donne la version papier (fiche élève + corrigé) et la version écran (jeux-ecran.js) : même graine, même grille.
 * Un escape game est un jeu de type « escape » : histoire + étapes { jeu:{type, donnees}, cadenas:{type, code}, indices }.
 */
(function (racine) {
  'use strict';
  var CLE = 'pse-jeux-v1';
  var GEN = racine.PSE_GEN || (typeof require === 'function' ? (function () { try { return require('./mon-tableau-v2/generateurs.js'); } catch (e) { return null; } })() : null);

  /* ---------- Outils ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sansAccent(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function norm(s) { return sansAccent(s).toUpperCase().replace(/[^A-Z]/g, ''); }
  function txt(s) { return String(s == null ? '' : s).trim(); }
  function liste(a) { return Array.isArray(a) ? a : []; }
  function hacher(s) { var x = 0x811c9dc5; s = String(s); for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; } return x; }
  function alea(graine) { var a = (hacher(graine) || 1) >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function melanger(a, r) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  /* Mélange qui ne laisse jamais l'ordre de départ (sinon la réponse se lit telle quelle). */
  function melangerVraiment(a, r) { if (a.length < 2) return a.slice(); for (var k = 0; k < 20; k++) { var m = melanger(a, r); if (m.some(function (x, i) { return x !== a[i]; })) return m; } return a.slice().reverse(); }
  function lettreDe(i) { return String.fromCharCode(65 + i); }
  /* Une image : data URL, ou RÉFÉRENCE de visuel de l'Atelier (pictogramme « sv:oreille.png », « 10133 », illustration « cours:documents/… »),
     lue depuis l'espace Jeux (chemin relatif à EDITEUR) ; l'export et les outils des IA remplacent la référence par l'image. */
  function estRef(v) { v = String(v || ''); return /^\d{2,6}$/.test(v) || /^[a-z]{2}:[\w.-]+\.(png|svg|jpe?g|webp)$/i.test(v) || /^cours:[\w./-]+$/.test(v) && v.indexOf('..') < 0; }
  function srcDe(v) { v = String(v || ''); if (/^data:image\/|^https?:|^file:/i.test(v)) return v; if (/^\d{2,6}$/.test(v)) return 'cours-visuels/pictos/' + (+v) + '.png'; var m = /^([a-z]{2}):([\w.-]+\.(png|svg|jpe?g|webp))$/i.exec(v); if (m) return 'cours-visuels/banques/' + m[1] + '/' + m[2]; if (/^cours:/.test(v) && v.indexOf('..') < 0) return '../Images/' + v.slice(6); return ''; }
  function img(v, cls) { var s = srcDe(v); return s ? '<img class="' + (cls || 'jx-img') + '" src="' + esc(s) + '" alt="">' : ''; }
  function imageValide(v) { return !!srcDe(v); }
  function uid(p) { return (p || 'j') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function maintenant() { return new Date().toISOString(); }
  function cases(n, cls) { var h = ''; for (var i = 0; i < n; i++) h += '<span class="' + (cls || 'jx-case') + '"></span>'; return h; }
  function lignes(n) { var h = ''; for (var i = 0; i < (n || 2); i++) h += '<div class="jx-ligne"></div>'; return h; }
  function exige(cond, msg, err) { if (!cond) err.push(msg); }

  /* ---------- Cadenas ---------- */
  var FLECHES = { H: '↑', B: '↓', G: '←', D: '→' };
  var COULEURS = { R: ['Rouge', '#DC2626'], O: ['Orange', '#EA580C'], J: ['Jaune', '#EAB308'], V: ['Vert', '#16A34A'], B: ['Bleu', '#2563EB'], N: ['Noir', '#111827'], M: ['Marron', '#92400E'], P: ['Violet', '#7C3AED'] };
  var CADENAS = {
    chiffres: { nom: 'Cadenas à chiffres', alphabet: '0123456789' },
    lettres: { nom: 'Cadenas à lettres', alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
    fleches: { nom: 'Cadenas à flèches', alphabet: 'HBGD' },
    couleurs: { nom: 'Cadenas à couleurs', alphabet: 'ROJVBNMP' }
  };
  function codeLisible(type, code) { code = String(code || ''); if (type === 'fleches') return code.split('').map(function (c) { return FLECHES[c] || c; }).join(''); if (type === 'couleurs') return code.split('').map(function (c) { return (COULEURS[c] || [c])[0]; }).join(' · '); return code; }
  /* Sans type précisé : chiffres si le code n'a que des chiffres, sinon lettres (flèches et couleurs se demandent explicitement). */
  function cadenasDevine(code) { return /^\d+$/.test(String(code || '')) ? 'chiffres' : 'lettres'; }

  /* ---------- Mots mêlés à message (lettres restantes = message, comme la maquette 2 de l'escape game A1) ---------- */
  function meles(mots, opts, graine) {
    var M = mots.map(norm).filter(function (m) { return m.length > 1; }), msg = norm(opts.message || '');
    var dirs = [[1, 0], [0, 1]]; if (opts.diagonales) dirs.push([1, 1], [1, -1]); if (opts.inverses) dirs = dirs.concat(dirs.map(function (d) { return [-d[0], -d[1]]; }));
    var total = M.reduce(function (s, m) { return s + m.length; }, 0), long = Math.max.apply(null, M.map(function (m) { return m.length; }).concat([6]));
    var tailles = []; for (var w = long; w <= long + 8; w++) for (var h = Math.max(5, Math.ceil(long / 2)); h <= w + 2; h++) { var c = w * h; if (!msg || (c - msg.length <= total && c - msg.length >= total * 0.72)) tailles.push([w, h]); }
    tailles.sort(function (a, b) { return a[0] * a[1] - b[0] * b[1]; });
    if (!msg) tailles = [[Math.max(long + 1, 10), Math.max(long + 1, 10)]];
    var r = alea(graine + '|meles'), essaisMax = msg ? 1500 : 200;
    for (var t = 0; t < tailles.length; t++) {
      var W = tailles[t][0], H = tailles[t][1];
      for (var e = 0; e < essaisMax; e++) {
        var G = []; for (var y = 0; y < H; y++) { G.push([]); for (var x = 0; x < W; x++) G[y].push(null); }
        var poses = [], ok = true, tri = M.slice().sort(function (a, b) { return b.length - a.length; });
        for (var i = 0; i < tri.length && ok; i++) {
          var mot = tri[i], pos = [];
          dirs.forEach(function (d) { for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) { var fx = x + d[0] * (mot.length - 1), fy = y + d[1] * (mot.length - 1); if (fx < 0 || fy < 0 || fx >= W || fy >= H) continue; var bon = true, croise = 0; for (var k = 0; k < mot.length; k++) { var l = G[y + d[1] * k][x + d[0] * k]; if (l && l !== mot[k]) { bon = false; break; } if (l) croise++; } if (bon) pos.push([x, y, d, croise]); } });
          if (!pos.length) { ok = false; break; }
          if (msg && r() < 0.6) { var mx = Math.max.apply(null, pos.map(function (p) { return p[3]; })); if (mx > 0) pos = pos.filter(function (p) { return p[3] === mx; }); }
          var p = pos[Math.floor(r() * pos.length)];
          for (var k = 0; k < mot.length; k++) G[p[1] + p[2][1] * k][p[0] + p[2][0] * k] = mot[k];
          poses.push({ mot: mot, x: p[0], y: p[1], dx: p[2][0], dy: p[2][1] });
        }
        if (!ok) continue;
        var libres = []; for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2++) if (!G[y2][x2]) libres.push([x2, y2]);
        if (msg) {
          if (libres.length !== msg.length) continue;
          var collees = libres.some(function (c) { return libres.some(function (d) { return d[1] === c[1] && d[0] === c[0] + 1; }) && libres.some(function (d) { return d[1] === c[1] && d[0] === c[0] + 2; }); });
          if (collees && e < essaisMax * 0.8) continue;
          libres.forEach(function (c, i) { G[c[1]][c[0]] = msg[i]; });
        } else { var A = 'AEIOURSTLNMPCDBFGHJV'; libres.forEach(function (c) { G[c[1]][c[0]] = A[Math.floor(r() * A.length)]; }); }
        return { w: W, h: H, grille: G, mots: poses };
      }
    }
    return null;
  }
  var memo = {};
  function memoise(cle, f) { if (!(cle in memo)) { memo[cle] = f(); var k = Object.keys(memo); if (k.length > 60) delete memo[k[0]]; } return memo[cle]; }

  /* Texte à marqueurs : « Les [cotisations] financent… » → morceaux texte / trou. */
  function morceaux(t, ouvre, ferme) {
    var out = [], re = new RegExp('\\' + ouvre + '([^\\' + ferme + ']+)\\' + ferme, 'g'), i = 0, m;
    t = String(t || '');
    while ((m = re.exec(t))) { if (m.index > i) out.push({ t: t.slice(i, m.index) }); out.push({ trou: m[1] }); i = m.index + m[0].length; }
    if (i < t.length) out.push({ t: t.slice(i) });
    return out;
  }

  /* ---------- Les types ----------
   * Chaque type : nom, famille, inventaire (JEU-xxx de l'inventaire de Brahim), resume, champs (pour les IA et le formulaire),
   * exemple (notions PSE), valider(d) → erreurs, papier(d, P) / corrige(d, P) → HTML, code(d, P) → code de cadenas tiré du jeu (ou null).
   * P = { graine, r } : la graine fixe la grille, le mélange, les numéros. */
  var T = {};

  T['mots-croises'] = {
    nom: 'Mots croisés', famille: 'Mots et lettres', inventaire: ['JEU-001'], ecran: true,
    resume: 'Grille de mots qui se croisent, à remplir avec des définitions. Placement automatique, numéros horizontaux et verticaux.',
    champs: { mots: '[{ mot, def }] : 4 à 14 mots du cours, définitions courtes sans le mot', code: 'facultatif : code du cadenas si le jeu sert dans un escape game' },
    exemple: { mots: [{ mot: 'PREVENTION', def: 'Agir avant la maladie pour éviter qu’elle arrive.' }, { mot: 'VITALE', def: 'Carte gratuite qui permet d’être remboursé plus vite.' }, { mot: 'COTISATION', def: 'Somme versée chaque mois pour financer la Sécurité sociale.' }, { mot: 'GENES', def: 'Facteur interne reçu de ses parents.' }, { mot: 'BRUIT', def: 'Facteur externe qui peut provoquer des troubles du sommeil.' }, { mot: 'TRAITANT', def: 'Le médecin … : choisi et déclaré dès 16 ans.' }] },
    valider: function (d, err) { exige(liste(d.mots).length >= 3, 'mots : au moins 3 mots', err); liste(d.mots).forEach(function (m, i) { exige(norm(m.mot).length >= 2, 'mots[' + i + '].mot vide', err); exige(txt(m.def), 'mots[' + i + '].def vide', err); }); if (!err.length && !this.grille(d)) err.push('aucune grille possible avec ces mots'); },
    grille: function (d) { return memoise('mc|' + JSON.stringify(d.mots), function () { return GEN ? GEN.motsCroises(liste(d.mots).map(function (m) { return { mot: m.mot, def: m.def }; }), { essais: 80 }) : null; }); },
    papier: function (d, P, corrige) {
      var g = this.grille(d); if (!g) return '<p>Grille impossible.</p>';
      var h = '<table class="jx-mc">';
      g.grille.forEach(function (ligne) { h += '<tr>' + ligne.map(function (c) { return c ? '<td class="l">' + (c.num ? '<sup>' + c.num + '</sup>' : '') + (corrige ? c.l : '') + '</td>' : '<td class="n"></td>'; }).join('') + '</tr>'; });
      h += '</table>';
      var hor = g.places.filter(function (p) { return p.dir === 'h'; }), ver = g.places.filter(function (p) { return p.dir === 'v'; });
      var defs = function (l) { return '<ol class="jx-defs">' + l.map(function (p) { return '<li value="' + p.num + '">' + esc(p.def) + (corrige ? ' <b>' + p.mot + '</b>' : ' <i>(' + p.mot.length + ' lettres)</i>') + '</li>'; }).join('') + '</ol>'; };
      var manque = liste(d.mots).length - g.places.length;
      return '<div class="jx-mcw"><div>' + h + '</div><div class="jx-2col"><div><h4>Horizontalement</h4>' + defs(hor) + '</div><div><h4>Verticalement</h4>' + defs(ver) + '</div></div></div>' + (manque && corrige ? '<p class="jx-alerte">' + manque + ' mot(s) n’ont pas pu être placés.</p>' : '');
    },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['mots-meles'] = {
    nom: 'Mots mêlés', famille: 'Mots et lettres', inventaire: ['JEU-003'], ecran: true,
    resume: 'Grille de lettres où retrouver les mots du cours. Avec « message », les lettres restantes, lues ligne par ligne, forment un message (le code d’un cadenas).',
    champs: { mots: '[mot] : 6 à 14 mots du cours', message: 'facultatif : message formé par les lettres restantes (ex. « CINQ QUATRE DEUX »)', code: 'facultatif : code du cadenas (sinon le message sans espaces)', diagonales: 'booléen (défaut false)', inverses: 'booléen : mots écrits à l’envers (défaut false)' },
    exemple: { mots: ['ALIMENTATION', 'POLLUTION', 'LOGEMENT', 'SOMMEIL', 'TRAVAIL', 'BRUIT', 'SPORT', 'TABAC', 'GENES', 'AGE'], message: 'CINQ QUATRE DEUX', code: '542' },
    valider: function (d, err, P) { exige(liste(d.mots).length >= 3, 'mots : au moins 3 mots', err); if (!err.length && !this.grille(d, P)) err.push('aucune grille trouvée : changer le message ou ajouter un mot'); },
    grille: function (d, P) { return memoise('mm|' + P.graine + JSON.stringify([d.mots, d.message, d.diagonales, d.inverses]), function () { return meles(liste(d.mots), d, P.graine); }); },
    papier: function (d, P, corrige) {
      var g = this.grille(d, P); if (!g) return '<p>Grille impossible.</p>';
      var pris = {}; if (corrige) g.mots.forEach(function (m) { for (var k = 0; k < m.mot.length; k++) pris[(m.x + m.dx * k) + ',' + (m.y + m.dy * k)] = 1; });
      return '<table class="jx-mm">' + g.grille.map(function (l, y) { return '<tr>' + l.map(function (c, x) { return '<td' + (corrige && pris[x + ',' + y] ? ' class="pris"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>' +
        '<p class="jx-liste">' + liste(d.mots).map(function (m) { return esc(norm(m)); }).join(' · ') + '</p>' + (corrige && d.message ? '<p><b>Lettres restantes :</b> ' + esc(d.message) + '</p>' : '');
    },
    code: function (d) { return d.code ? String(d.code) : d.message ? norm(d.message) : null; }
  };

  T['pendu'] = {
    nom: 'Le mot mystère', famille: 'Mots et lettres', inventaire: ['JEU-004'], ecran: true,
    resume: 'Deviner un mot lettre par lettre, avec un nombre d’essais limité (barres qui montent). Sur papier : mots à compléter avec l’indice.',
    champs: { mots: '[{ mot, indice }]', essais: 'nombre d’erreurs permises (défaut 7)' },
    exemple: { mots: [{ mot: 'PREVENTION', indice: 'Agir avant la maladie.' }, { mot: 'SOLIDARITE', indice: 'Chacun donne selon ses moyens, chacun reçoit selon ses besoins.' }] },
    valider: function (d, err) { exige(liste(d.mots).length >= 1, 'mots : au moins 1 mot', err); },
    papier: function (d, P, corrige) { return '<ol class="jx-pendu">' + liste(d.mots).map(function (m) { var w = norm(m.mot); return '<li><p>' + esc(m.indice) + '</p><div class="jx-cases">' + w.split('').map(function (c, i) { return '<span class="jx-case">' + (corrige || i === 0 ? c : '') + '</span>'; }).join('') + '</div></li>'; }).join('') + '</ol>'; },
    code: function (d) { return d.code ? String(d.code) : liste(d.mots).length === 1 ? norm(d.mots[0].mot) : null; }
  };

  T['anagrammes'] = {
    nom: 'Anagrammes', famille: 'Mots et lettres', inventaire: ['JEU-005'], ecran: true,
    resume: 'Remettre dans l’ordre les lettres mélangées d’un mot du cours, avec un indice.',
    champs: { mots: '[{ mot, indice }]', code: 'facultatif' },
    exemple: { mots: [{ mot: 'VITALE', indice: 'Carte de l’Assurance maladie.' }, { mot: 'PREVENTION', indice: 'Agir avant la maladie.' }, { mot: 'SOMMEIL', indice: 'Comportement qui protège le capital santé.' }] },
    valider: function (d, err) { exige(liste(d.mots).length >= 1, 'mots : au moins 1 mot', err); },
    melange: function (m, P, i) { return melangerVraiment(norm(m).split(''), alea(P.graine + '|ana' + i)).join(''); },
    papier: function (d, P, corrige) { var self = this; return '<ol class="jx-pendu">' + liste(d.mots).map(function (m, i) { var w = norm(m.mot); return '<li><p><b class="jx-ana">' + self.melange(w, P, i).split('').join(' ') + '</b> — ' + esc(m.indice) + '</p><div class="jx-cases">' + w.split('').map(function (c) { return '<span class="jx-case">' + (corrige ? c : '') + '</span>'; }).join('') + '</div></li>'; }).join('') + '</ol>'; },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['acrostiche'] = {
    nom: 'Grille à mot mystère', famille: 'Mots et lettres', inventaire: ['JEU-009'], ecran: true,
    resume: 'Des définitions, un mot par ligne ; les cases colorées, alignées en colonne, forment un mot mystère (code d’un cadenas à lettres).',
    champs: { mots: '[{ mot, def, rang }] : rang = position (1, 2…) de la lettre qui entre dans le mot mystère' },
    exemple: { mots: [{ mot: 'COTISATION', def: 'Somme versée chaque mois pour financer la Sécurité sociale.', rang: 5 }, { mot: 'VITALE', def: 'La carte … permet d’être remboursé plus vite.', rang: 4 }, { mot: 'PREVENTION', def: 'Agir avant la maladie pour éviter qu’elle arrive.', rang: 6 }, { mot: 'TRAITANT', def: 'Le médecin … : déclaré dès 16 ans.', rang: 1 }, { mot: 'GENES', def: 'Facteur interne reçu de ses parents.', rang: 2 }] },
    valider: function (d, err) { exige(liste(d.mots).length >= 3, 'mots : au moins 3', err); liste(d.mots).forEach(function (m, i) { var w = norm(m.mot); exige(w && m.rang >= 1 && m.rang <= w.length, 'mots[' + i + '].rang hors du mot', err); exige(txt(m.def), 'mots[' + i + '].def vide', err); }); },
    papier: function (d, P, corrige) {
      var mx = Math.max.apply(null, liste(d.mots).map(function (m) { return m.rang; }));
      return '<table class="jx-acro">' + liste(d.mots).map(function (m, i) { var w = norm(m.mot), h = '<tr><td class="nd">' + (i + 1) + '</td>'; for (var k = 0; k < mx - m.rang; k++) h += '<td class="vide"></td>'; return h + w.split('').map(function (c, k) { return '<td class="' + (k + 1 === m.rang ? 'mys' : 'l') + '">' + (corrige ? c : '') + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>' +
        '<ol class="jx-defs">' + liste(d.mots).map(function (m) { return '<li>' + esc(m.def) + ' <i>(' + norm(m.mot).length + ' lettres)</i></li>'; }).join('') + '</ol>';
    },
    code: function (d) { return liste(d.mots).map(function (m) { return norm(m.mot)[m.rang - 1] || ''; }).join(''); }
  };

  T['cryptogramme'] = {
    nom: 'Message codé', famille: 'Codes secrets', inventaire: ['JEU-011', 'JEU-129', 'JEU-130'], ecran: true,
    resume: 'Un message chiffré à décoder : lettres remplacées par leur rang (A = 1), par un décalage (César) ou par des symboles. Le message pose une question dont la réponse est le code.',
    champs: { message: 'le message en clair (lettres, espaces)', methode: '« nombres » (défaut), « cesar » ou « symboles »', decalage: 'pour César (défaut 3)', reponse: 'la réponse attendue = code du cadenas' },
    exemple: { message: 'AGE DU MEDECIN TRAITANT PUIS PRIX DU GENERALISTE', methode: 'nombres', reponse: '1630' },
    SYMB: '◆●▲■★✚♥♣♠✿☀☂☎✈⚑♪✱◐◑▼◀▶⬟⬢⬣✦',
    valider: function (d, err) { exige(norm(d.message).length >= 3, 'message trop court', err); exige(txt(d.reponse), 'reponse : le code attendu', err); },
    chiffrer: function (d) { var self = this, m = d.methode || 'nombres', k = +d.decalage || 3; return sansAccent(d.message).toUpperCase().split(/\s+/).filter(Boolean).map(function (mot) { return norm(mot).split('').map(function (c) { var n = c.charCodeAt(0) - 65; return m === 'cesar' ? String.fromCharCode(65 + (n + k) % 26) : m === 'symboles' ? self.SYMB[n] : String(n + 1); }).join(m === 'nombres' ? ' ' : ''); }); },
    papier: function (d, P, corrige) {
      var m = d.methode || 'nombres', self = this, cle = '';
      if (m === 'nombres') cle = '<table class="jx-cle">' + [0, 13].map(function (o) { var a = '', b = ''; for (var i = o; i < o + 13; i++) { a += '<td>' + lettreDe(i) + '</td>'; b += '<td>' + (i + 1) + '</td>'; } return '<tr class="t">' + a + '</tr><tr>' + b + '</tr>'; }).join('') + '</table>';
      else if (m === 'symboles') cle = '<table class="jx-cle">' + [0, 13].map(function (o) { var a = '', b = ''; for (var i = o; i < o + 13; i++) { a += '<td>' + lettreDe(i) + '</td>'; b += '<td>' + self.SYMB[i] + '</td>'; } return '<tr class="t">' + a + '</tr><tr>' + b + '</tr>'; }).join('') + '</table>';
      else cle = '<p class="jx-aide">Chaque lettre a été avancée de ' + (+d.decalage || 3) + ' rangs dans l’alphabet (A devient ' + lettreDe((+d.decalage || 3) % 26) + ').</p>';
      return cle + '<p class="jx-chiffre">' + this.chiffrer(d).map(esc).join(' &nbsp;/&nbsp; ') + '</p>' + (corrige ? '<p><b>Message :</b> ' + esc(d.message) + '<br><b>Réponse :</b> ' + esc(d.reponse) + '</p>' : '<p>Message : ' + lignes(2) + '</p>');
    },
    code: function (d) { return String(d.reponse || ''); }
  };

  T['qui-suis-je'] = {
    nom: 'Qui suis-je ? (mot mystère à indices)', famille: 'Mots et lettres', inventaire: ['JEU-007'], ecran: true,
    resume: 'Trouver une notion à partir d’indices de plus en plus précis. À l’écran, les indices apparaissent un par un.',
    champs: { enigmes: '[{ indices:[3 à 5 phrases, du plus vague au plus précis], reponse }]' },
    exemple: { enigmes: [{ indices: ['Je viens de l’environnement.', 'On me mesure en décibels.', 'Je peux provoquer des troubles du sommeil.'], reponse: 'Le bruit' }, { indices: ['Je suis gratuite et personnelle.', 'Je prouve que la personne est assurée.', 'Je suis verte et j’ai une puce.'], reponse: 'La carte Vitale' }] },
    valider: function (d, err) { exige(liste(d.enigmes).length >= 1, 'enigmes : au moins 1', err); liste(d.enigmes).forEach(function (e, i) { exige(liste(e.indices).length >= 2, 'enigmes[' + i + '] : au moins 2 indices', err); exige(txt(e.reponse), 'enigmes[' + i + '].reponse vide', err); }); },
    papier: function (d, P, corrige) { return '<ol class="jx-qsj">' + liste(d.enigmes).map(function (e) { return '<li><ol type="a">' + liste(e.indices).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol><p>Je suis : ' + (corrige ? '<b>' + esc(e.reponse) + '</b>' : '<span class="jx-tiret"></span>') + '</p></li>'; }).join('') + '</ol>'; },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['texte-trous'] = {
    nom: 'Texte à trous', famille: 'Textes', inventaire: ['JEU-016', 'JEU-017'], ecran: true,
    resume: 'Compléter un texte. Les mots à trouver sont entre crochets. Avec une banque de mots (et des intrus), chaque mot porte un numéro : le code = les numéros dans l’ordre du texte.',
    champs: { texte: 'texte avec les mots à trouver entre crochets : « Les travailleurs versent des [cotisations]… »', banque: 'booléen : afficher la liste des mots (défaut true)', intrus: '[mot] : mots en trop dans la banque', numeros: 'booléen : numéroter la banque pour obtenir un code (défaut false)' },
    exemple: { texte: 'Les travailleurs et les employeurs versent des [cotisations] à la Sécurité sociale. La Sécurité sociale protège toute la population : c’est la [solidarité] nationale. L’[Assurance maladie] rembourse les soins.', banque: true, intrus: ['impôts', 'salaire'], numeros: true },
    valider: function (d, err) { exige(morceaux(d.texte, '[', ']').some(function (m) { return m.trou; }), 'texte : aucun mot entre crochets', err); },
    banque: function (d, P) { var trous = morceaux(d.texte, '[', ']').filter(function (m) { return m.trou; }).map(function (m) { return m.trou; }); var mots = trous.concat(liste(d.intrus)).filter(function (m, i, a) { return a.indexOf(m) === i; }); var r = alea(P.graine + '|banque'); var nums = melanger([1, 2, 3, 4, 5, 6, 7, 8, 9].slice(0, Math.max(mots.length, 1)), r); if (mots.length > 9) nums = mots.map(function (_, i) { return i + 1; }); return melanger(mots, r).map(function (m, i) { return { mot: m, n: nums[i] }; }).sort(function (a, b) { return a.n - b.n; }); },
    papier: function (d, P, corrige) {
      var k = 0, b = this.banque(d, P);
      var t = morceaux(d.texte, '[', ']').map(function (m) { if (m.t) return esc(m.t); k++; return corrige ? '<b class="jx-rep">' + esc(m.trou) + '</b>' : '<span class="jx-trou">(' + k + ') ……………………</span>'; }).join('');
      return '<p class="jx-texte">' + t + '</p>' + (d.banque !== false ? '<div class="jx-banque">' + b.map(function (x) { return '<span class="jx-carte">' + esc(x.mot) + (d.numeros ? ' <b>' + x.n + '</b>' : '') + '</span>'; }).join('') + '</div>' : '');
    },
    code: function (d, P) { if (d.code) return String(d.code); if (!d.numeros) return null; var b = this.banque(d, P); return morceaux(d.texte, '[', ']').filter(function (m) { return m.trou; }).map(function (m) { return b.filter(function (x) { return x.mot === m.trou; })[0].n; }).join(''); }
  };

  T['phrase-ordre'] = {
    nom: 'Phrase à remettre en ordre', famille: 'Textes', inventaire: ['JEU-020'], ecran: true,
    resume: 'Les mots d’une phrase du cours sont mélangés : reconstituer la phrase (définition, consigne de sécurité…).',
    champs: { phrases: '[phrase]' },
    exemple: { phrases: ['La prévention consiste à agir avant la maladie.', 'Le médecin traitant oriente le patient vers un spécialiste.'] },
    valider: function (d, err) { exige(liste(d.phrases).length >= 1, 'phrases : au moins 1', err); },
    mots: function (p) { return String(p).replace(/[.!?]$/, '').split(/\s+/).filter(Boolean); },
    papier: function (d, P, corrige) { var self = this; return '<ol class="jx-po">' + liste(d.phrases).map(function (p, i) { return '<li>' + (corrige ? esc(p) : '<div class="jx-banque">' + melangerVraiment(self.mots(p), alea(P.graine + '|po' + i)).map(function (m) { return '<span class="jx-carte">' + esc(m) + '</span>'; }).join('') + '</div>' + lignes(1)) + '</li>'; }).join('') + '</ol>'; },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['ordre'] = {
    nom: 'Remettre dans l’ordre', famille: 'Classer et ordonner', inventaire: ['JEU-021', 'JEU-055', 'JEU-069', 'JEU-074', 'JEU-085', 'JEU-128'], ecran: true,
    resume: 'Étapes d’une procédure, paragraphes, images séquentielles ou classement par priorité. Les éléments sont donnés dans le BON ordre ; ils sont mélangés et lettrés A, B, C… Le code = les lettres dans le bon ordre, ou les « marques » (flèches H/B/G/D, chiffres…) dans le bon ordre.',
    champs: { elements: '[{ texte, image, marque }] dans le bon ordre ; marque facultative (H ↑, B ↓, G ←, D → pour un cadenas à flèches, ou un chiffre)', critere: 'facultatif : « de la première à la dernière étape », « du plus au moins efficace »…' },
    exemple: { critere: 'de la première à la dernière étape', elements: [{ texte: 'Déclarer un médecin traitant à l’Assurance maladie.', marque: 'H' }, { texte: 'Consulter d’abord son médecin traitant.', marque: 'D' }, { texte: 'Le médecin traitant oriente vers un spécialiste.', marque: 'D' }, { texte: 'Consulter le spécialiste.', marque: 'B' }, { texte: 'Être mieux remboursé par l’Assurance maladie.', marque: 'G' }] },
    valider: function (d, err) { exige(liste(d.elements).length >= 3, 'elements : au moins 3', err); },
    melange: function (d, P) { return melangerVraiment(liste(d.elements).map(function (e, i) { return i; }), alea(P.graine + '|ordre')); },
    papier: function (d, P, corrige) {
      var m = this.melange(d, P), marques = liste(d.elements).every(function (e) { return e.marque; });
      var h = '<table class="jx-ordre">' + m.map(function (i, k) { var e = d.elements[i]; return '<tr><td class="lt">' + lettreDe(k) + '</td><td>' + img(e.image, 'jx-vign') + esc(e.texte) + '</td>' + (marques ? '<td class="lt">' + esc(FLECHES[e.marque] || e.marque) + '</td>' : '') + '</tr>'; }).join('') + '</table>';
      var bon = liste(d.elements).map(function (_, i) { return lettreDe(m.indexOf(i)); });
      return h + '<p>Ordre' + (d.critere ? ' (' + esc(d.critere) + ')' : '') + ' : ' + (corrige ? '<b>' + bon.join(' → ') + '</b>' : '<span class="jx-cases">' + cases(m.length) + '</span>') + '</p>';
    },
    code: function (d, P) { if (d.code) return String(d.code); if (liste(d.elements).every(function (e) { return e.marque; })) return d.elements.map(function (e) { return e.marque; }).join(''); var m = this.melange(d, P); return liste(d.elements).map(function (_, i) { return lettreDe(m.indexOf(i)); }).join(''); }
  };

  T['texte-corriger'] = {
    nom: 'Texte à corriger', famille: 'Textes', inventaire: ['JEU-022'], ecran: true,
    resume: 'Un texte contient des erreurs volontaires sur les notions du cours : les repérer et les corriger. Marquer chaque erreur {faux|juste}.',
    champs: { texte: 'texte avec les erreurs notées {mot faux|correction} : « La carte Vitale est {payante|gratuite}. »' },
    exemple: { texte: 'La santé, c’est seulement {ne pas être malade|un état de complet bien-être physique, mental et social}. Le médecin traitant se déclare à partir de {18|16} ans. La carte Vitale est {payante|gratuite} et personnelle. Les {impôts|cotisations} des travailleurs et des employeurs financent la Sécurité sociale.' },
    valider: function (d, err) { exige(/\{[^}|]+\|[^}]+\}/.test(d.texte || ''), 'texte : aucune erreur {faux|juste}', err); },
    erreurs: function (d) { return morceaux(d.texte, '{', '}').map(function (m) { if (m.trou) { var p = m.trou.split('|'); return { faux: p[0], juste: p[1] }; } return m; }); },
    papier: function (d, P, corrige) { var n = 0, e = this.erreurs(d); return '<p class="jx-texte">' + e.map(function (m) { if (m.t) return esc(m.t); n++; return corrige ? '<s>' + esc(m.faux) + '</s> <b class="jx-rep">' + esc(m.juste) + '</b>' : esc(m.faux); }).join('') + '</p>' + (corrige ? '' : '<p>Nombre d’erreurs trouvées : …… ' + lignes(Math.min(4, n)) + '</p>'); },
    code: function (d) { return d.code ? String(d.code) : String(this.erreurs(d).filter(function (m) { return m.faux; }).length); }
  };

  T['surlignage'] = {
    nom: 'Mots à surligner', famille: 'Textes', inventaire: ['JEU-023'], ecran: true,
    resume: 'Surligner dans un texte les mots ou groupes de mots qui répondent à une consigne (les dangers d’une situation, les facteurs externes…). Les bonnes réponses sont entre astérisques.',
    champs: { texte: 'texte avec les éléments à surligner entre *astérisques*', cible: 'ce qu’il faut surligner (« les facteurs externes »)' },
    exemple: { cible: 'les facteurs externes qui agissent sur la santé de Romain', texte: 'Romain, 29 ans, travaille de nuit dans un entrepôt. Il habite près d’une *route très passante* et entend le *bruit des camions*. Il dort peu, mange vite et fume dix cigarettes par jour. Son *logement est humide*.' },
    valider: function (d, err) { exige(/\*[^*]+\*/.test(d.texte || ''), 'texte : rien entre *astérisques*', err); },
    papier: function (d, P, corrige) { return (d.cible ? '<p class="jx-aide">À surligner : ' + esc(d.cible) + '</p>' : '') + '<p class="jx-texte">' + morceaux(d.texte, '*', '*').map(function (m) { return m.t ? esc(m.t) : corrige ? '<mark>' + esc(m.trou) + '</mark>' : esc(m.trou); }).join('') + '</p>'; },
    code: function (d) { return d.code ? String(d.code) : String(morceaux(d.texte, '*', '*').filter(function (m) { return m.trou; }).length); }
  };

  T['questions'] = {
    nom: 'Questions à réponse courte', famille: 'Textes', inventaire: ['JEU-026', 'JEU-083'], ecran: true,
    resume: 'Questions ouvertes sur un document (texte, tableau de données, image) ; réponse modèle visible au corrigé ou à l’écran après réponse.',
    champs: { document: 'facultatif : texte du document', image: 'facultatif : image du document', questions: '[{ q, reponse, lignes }]' },
    exemple: { document: 'Une consultation chez le généraliste coûte 30 €. Avec un médecin traitant déclaré, l’Assurance maladie rembourse 19 €. Sans médecin traitant, elle rembourse 8,40 €.', questions: [{ q: 'Calculer ce qui reste à payer avec un médecin traitant.', reponse: '30 − 19 = 11 €.' }, { q: 'Indiquer l’intérêt de déclarer un médecin traitant.', reponse: 'Être mieux remboursé : il reste 11 € à payer au lieu de 21,60 €.' }] },
    valider: function (d, err) { exige(liste(d.questions).length >= 1, 'questions : au moins 1', err); },
    papier: function (d, P, corrige) { return (d.document || d.image ? '<div class="jx-doc">' + img(d.image) + (d.document ? '<p>' + esc(d.document) + '</p>' : '') + '</div>' : '') + '<ol class="jx-qs">' + liste(d.questions).map(function (q) { return '<li><p>' + esc(q.q) + '</p>' + (corrige ? '<p class="jx-rep">' + esc(q.reponse) + '</p>' : lignes(q.lignes || 2)) + '</li>'; }).join('') + '</ol>'; },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['qcm'] = {
    nom: 'QCM', famille: 'Quiz', inventaire: ['JEU-031', 'JEU-032', 'JEU-035', 'JEU-099'], ecran: true,
    resume: 'Questions à choix (une ou plusieurs bonnes réponses, avec ou sans images). Le code = la lettre de la bonne réponse de chaque question, dans l’ordre.',
    champs: { questions: '[{ q, image, choix:[texte ou { texte, image }], bonnes:[index à partir de 0], explication }]' },
    exemple: { questions: [{ q: 'Selon l’OMS, la santé c’est :', choix: ['seulement ne pas être malade', 'un état de complet bien-être physique, mental et social', 'seulement faire du sport'], bonnes: [1], explication: 'Définition de l’OMS.' }, { q: 'Un plan santé sert surtout à :', choix: ['rembourser les consultations', 'fabriquer les cartes Vitale', 'protéger la santé de la population'], bonnes: [2] }, { q: 'L’argent de la Sécurité sociale vient surtout :', choix: ['des cotisations', 'des magasins', 'des écoles'], bonnes: [0] }] },
    valider: function (d, err) { exige(liste(d.questions).length >= 1, 'questions : au moins 1', err); liste(d.questions).forEach(function (q, i) { exige(liste(q.choix).length >= 2, 'questions[' + i + '] : au moins 2 choix', err); exige(liste(q.bonnes).length >= 1 && liste(q.bonnes).every(function (b) { return b >= 0 && b < liste(q.choix).length; }), 'questions[' + i + '].bonnes invalide', err); }); },
    papier: function (d, P, corrige) { return '<ol class="jx-qcm">' + liste(d.questions).map(function (q) { var multi = liste(q.bonnes).length > 1; return '<li><p>' + esc(q.q) + (multi ? ' <i>(plusieurs réponses)</i>' : '') + '</p>' + img(q.image) + '<ul>' + liste(q.choix).map(function (c, j) { var t = typeof c === 'object' ? c : { texte: c }; var ok = corrige && q.bonnes.indexOf(j) >= 0; return '<li' + (ok ? ' class="ok"' : '') + '><span class="jx-coche">' + (ok ? '✓' : '') + '</span><b>' + lettreDe(j) + '.</b> ' + img(t.image, 'jx-vign') + esc(t.texte) + '</li>'; }).join('') + '</ul>' + (corrige && q.explication ? '<p class="jx-aide">' + esc(q.explication) + '</p>' : '') + '</li>'; }).join('') + '</ol>'; },
    code: function (d) { return d.code ? String(d.code) : liste(d.questions).map(function (q) { return q.bonnes.map(lettreDe).join(''); }).join(''); }
  };

  T['vrai-faux'] = {
    nom: 'Vrai ou faux', famille: 'Quiz', inventaire: ['JEU-033', 'JEU-034'], ecran: true,
    resume: 'Juger des affirmations. Chaque affirmation peut porter une lettre : les lettres des affirmations VRAIES, dans l’ordre, forment le code (mot) d’un cadenas. À l’écran : liste ou cartes à faire défiler.',
    champs: { affirmations: '[{ texte, vrai:booléen, lettre, explication }]', mode: '« liste » (défaut) ou « cartes »' },
    exemple: { affirmations: [{ texte: 'La carte Vitale est gratuite.', vrai: true, lettre: 'V' }, { texte: 'La carte Vitale sert à payer le médecin.', vrai: false, lettre: 'R', explication: 'Elle prouve qu’on est assuré.' }, { texte: 'La carte Vitale est personnelle.', vrai: true, lettre: 'I' }, { texte: 'La carte Vitale prouve que la personne est assurée.', vrai: true, lettre: 'T' }, { texte: 'Tout le monde peut regarder Mon espace santé d’une personne.', vrai: false, lettre: 'O' }, { texte: 'La carte Vitale permet d’être remboursé plus vite.', vrai: true, lettre: 'A' }, { texte: 'Mon espace santé contient les résultats d’examens.', vrai: true, lettre: 'L' }, { texte: 'Mon espace santé est un carnet de santé sur Internet.', vrai: true, lettre: 'E' }] },
    valider: function (d, err) { exige(liste(d.affirmations).length >= 2, 'affirmations : au moins 2', err); liste(d.affirmations).forEach(function (a, i) { exige(typeof a.vrai === 'boolean', 'affirmations[' + i + '].vrai doit être true ou false', err); }); },
    papier: function (d, P, corrige) { var lt = liste(d.affirmations).some(function (a) { return a.lettre; }); return '<table class="jx-vf">' + liste(d.affirmations).map(function (a, i) { return '<tr><td>' + (i + 1) + '. ' + esc(a.texte) + (corrige && a.explication ? '<br><i class="jx-aide">' + esc(a.explication) + '</i>' : '') + '</td>' + (lt ? '<td class="lt">' + esc(a.lettre || '') + '</td>' : '') + '<td class="ch">Vrai <span class="jx-coche">' + (corrige && a.vrai ? '✓' : '') + '</span> Faux <span class="jx-coche">' + (corrige && !a.vrai ? '✓' : '') + '</span></td></tr>'; }).join('') + '</table>'; },
    code: function (d) { if (d.code) return String(d.code); var l = liste(d.affirmations).filter(function (a) { return a.vrai && a.lettre; }).map(function (a) { return a.lettre; }); return l.length ? norm(l.join('')) : null; }
  };

  T['numerique'] = {
    nom: 'Question à réponse chiffrée', famille: 'Quiz', inventaire: ['JEU-037', 'JEU-081'], ecran: true,
    resume: 'Calcul simple à partir de données (remboursement, durée de sommeil, consommation, décibels…). Le code = les réponses écrites sans virgule, l’une après l’autre.',
    champs: { questions: '[{ q, reponse:nombre, unite, tolerance, explication }]' },
    exemple: { questions: [{ q: 'Une consultation coûte 30 € ; l’Assurance maladie rembourse 19 €. Combien reste-t-il à payer ?', reponse: 11, unite: '€', explication: '30 − 19 = 11.' }, { q: 'Sans médecin traitant, elle rembourse 8,40 €. Combien Nolan économise-t-il avec un médecin traitant ?', reponse: 10.6, unite: '€', explication: '21,60 − 11 = 10,60.' }] },
    valider: function (d, err) { exige(liste(d.questions).length >= 1, 'questions : au moins 1', err); liste(d.questions).forEach(function (q, i) { exige(isFinite(+q.reponse), 'questions[' + i + '].reponse doit être un nombre', err); }); },
    papier: function (d, P, corrige) { return '<ol class="jx-qs">' + liste(d.questions).map(function (q) { return '<li><p>' + esc(q.q) + '</p><p>Réponse : ' + (corrige ? '<b class="jx-rep">' + String(q.reponse).replace('.', ',') + ' ' + esc(q.unite || '') + '</b>' + (q.explication ? ' <i class="jx-aide">' + esc(q.explication) + '</i>' : '') : '…………… ' + esc(q.unite || '')) + '</p></li>'; }).join('') + '</ol>'; },
    code: function (d) { if (d.code) return String(d.code); return liste(d.questions).map(function (q) { var s = (+q.reponse).toFixed(2).replace(/\.?0+$/, ''); return s.indexOf('.') >= 0 ? (+q.reponse).toFixed(2).replace('.', '') : s; }).join(''); }
  };

  T['intrus'] = {
    nom: 'Trouver l’intrus', famille: 'Quiz', inventaire: ['JEU-043'], ecran: true,
    resume: 'Dans chaque série, un élément n’appartient pas à la famille : le trouver et dire pourquoi. Le code = les lettres des intrus.',
    champs: { series: '[{ elements:[4 à 5 textes], intrus:index, raison }]' },
    exemple: { series: [{ elements: ['les gènes', 'l’âge', 'le bruit', 'le sommeil'], intrus: 2, raison: 'Le bruit est un facteur externe ; les autres sont internes.' }, { elements: ['faire du sport', 'bien manger', 'dormir assez', 'avoir des amis'], intrus: 3, raison: 'Avoir des amis relève du bien-être social.' }] },
    valider: function (d, err) { exige(liste(d.series).length >= 1, 'series : au moins 1', err); liste(d.series).forEach(function (s, i) { exige(liste(s.elements).length >= 3 && s.intrus >= 0 && s.intrus < liste(s.elements).length, 'series[' + i + '] invalide', err); }); },
    papier: function (d, P, corrige) { return '<ol class="jx-qs">' + liste(d.series).map(function (s) { return '<li><div class="jx-banque">' + liste(s.elements).map(function (e, j) { return '<span class="jx-carte' + (corrige && j === s.intrus ? ' ok' : '') + '"><b>' + lettreDe(j) + '</b> ' + esc(e) + '</span>'; }).join('') + '</div>' + (corrige ? '<p class="jx-aide">' + esc(s.raison || '') + '</p>' : '<p>Intrus : …… parce que ' + lignes(1) + '</p>') + '</li>'; }).join('') + '</ol>'; },
    code: function (d) { return d.code ? String(d.code) : liste(d.series).map(function (s) { return lettreDe(s.intrus); }).join(''); }
  };

  T['relier'] = {
    nom: 'Relier deux colonnes', famille: 'Associer', inventaire: ['JEU-045', 'JEU-046', 'JEU-075'], ecran: true,
    resume: 'Associer chaque élément de gauche à un élément de droite (notion ↔ définition, cause → conséquence, pictogramme ↔ sens). La colonne de droite est mélangée et numérotée : le code = les numéros dans l’ordre de gauche.',
    champs: { paires: '[{ gauche, imageG, droite, imageD }]', titres: 'facultatif : [titre gauche, titre droite]' },
    exemple: { titres: ['Notion', 'Définition'], paires: [{ gauche: 'Cotisation', droite: 'Somme versée chaque mois pour financer la Sécurité sociale.' }, { gauche: 'Prévention', droite: 'Agir avant la maladie pour éviter qu’elle arrive.' }, { gauche: 'Capital santé', droite: 'Ressources de santé d’une personne.' }, { gauche: 'Médecin traitant', droite: 'Médecin choisi et déclaré dès 16 ans.' }] },
    valider: function (d, err) { exige(liste(d.paires).length >= 2, 'paires : au moins 2', err); },
    melange: function (d, P) { return melangerVraiment(liste(d.paires).map(function (_, i) { return i; }), alea(P.graine + '|relier')); },
    papier: function (d, P, corrige) { var m = this.melange(d, P), t = liste(d.titres); return '<table class="jx-relier">' + (t.length ? '<tr><th>' + esc(t[0]) + '</th><th></th><th></th><th>' + esc(t[1]) + '</th></tr>' : '') + liste(d.paires).map(function (p, i) { var q = d.paires[m[i]]; return '<tr><td>' + img(p.imageG, 'jx-vign') + esc(p.gauche) + '</td><td class="pt">' + (corrige ? '<b>' + (m.indexOf(i) + 1) + '</b>' : '•') + '</td><td class="pt">•</td><td><b>' + (i + 1) + '.</b> ' + img(q.imageD, 'jx-vign') + esc(q.droite) + '</td></tr>'; }).join('') + '</table>'; },
    code: function (d, P) { if (d.code) return String(d.code); var m = this.melange(d, P); return liste(d.paires).map(function (_, i) { return m.indexOf(i) + 1; }).join(''); }
  };

  T['memory'] = {
    nom: 'Memory', famille: 'Associer', inventaire: ['JEU-049', 'JEU-050'], ecran: true,
    resume: 'Retourner des cartes pour retrouver les paires : identiques (deux fois la même image) ou associées (notion ↔ définition, image ↔ mot). Sur papier : cartes à découper.',
    champs: { paires: '[{ a, imageA, b, imageB }] ; sans b ni imageB, la carte est doublée (paires identiques)' },
    exemple: { paires: [{ a: 'Bien-être physique', b: 'Le corps va bien' }, { a: 'Bien-être mental', b: 'Les pensées et les émotions vont bien' }, { a: 'Bien-être social', b: 'Les relations avec les autres vont bien' }, { a: 'Facteur interne', b: 'Vient de la personne' }, { a: 'Facteur externe', b: 'Vient de l’environnement' }, { a: 'Prévention', b: 'Agir avant la maladie' }] },
    valider: function (d, err) { exige(liste(d.paires).length >= 2, 'paires : au moins 2', err); },
    cartes: function (d, P) { var c = []; liste(d.paires).forEach(function (p, i) { c.push({ p: i, t: p.a, im: p.imageA }); c.push({ p: i, t: p.b || p.a, im: p.b || p.imageB ? p.imageB : p.imageA }); }); return melanger(c, alea(P.graine + '|memory')); },
    papier: function (d, P, corrige) { return '<div class="jx-memo">' + this.cartes(d, P).map(function (c) { return '<div class="jx-mcarte">' + img(c.im, 'jx-vign') + '<span>' + esc(c.t) + '</span>' + (corrige ? '<b class="jx-paire">paire ' + (c.p + 1) + '</b>' : '') + '</div>'; }).join('') + '</div>' + (corrige ? '' : '<p class="jx-aide">Découper les cartes, les retourner, puis retrouver les paires.</p>'); },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['tri'] = {
    nom: 'Classer dans des catégories', famille: 'Classer et ordonner', inventaire: ['JEU-051', 'JEU-053'], ecran: true,
    resume: 'Déposer chaque élément (texte, image, phrase d’un personnage) dans sa catégorie. Code : si les éléments portent un nombre, la somme de chaque colonne ; sinon la lettre de la catégorie de chaque élément, dans l’ordre (ex. P, M, S pour les trois bien-être).',
    champs: { categories: '[{ nom, lettre }]', elements: '[{ texte, image, personne, categorie:index, nombre }]', code: '« sommes » ou « lettres » (défaut : sommes si tous les éléments ont un nombre)' },
    exemple: { categories: [{ nom: 'Bien-être physique', lettre: 'P' }, { nom: 'Bien-être mental', lettre: 'M' }, { nom: 'Bien-être social', lettre: 'S' }], elements: [{ personne: 'Élodie', texte: 'Je marche trente minutes chaque jour.', categorie: 0 }, { personne: 'Thierry', texte: 'Je me sens calme et confiant au travail.', categorie: 1 }, { personne: 'Sandrine', texte: 'Je déjeune avec mes collègues le midi.', categorie: 2 }, { personne: 'Nicolas', texte: 'Je dors huit heures par nuit.', categorie: 0 }, { personne: 'Claire', texte: 'J’appelle souvent ma sœur.', categorie: 2 }, { personne: 'Patrick', texte: 'Je sais gérer mon stress.', categorie: 1 }] },
    valider: function (d, err) { var n = liste(d.categories).length; exige(n >= 2, 'categories : au moins 2', err); exige(liste(d.elements).length >= 2, 'elements : au moins 2', err); liste(d.elements).forEach(function (e, i) { exige(e.categorie >= 0 && e.categorie < n, 'elements[' + i + '].categorie hors des catégories', err); }); },
    lettre: function (c, i) { return norm(c.lettre || '')[0] || lettreDe(i); },
    sommes: function (d) { return d.code !== 'lettres' && liste(d.elements).length && liste(d.elements).every(function (e) { return isFinite(e.nombre) && e.nombre !== '' && e.nombre != null; }); },
    papier: function (d, P, corrige) {
      var self = this, som = this.sommes(d), cats = liste(d.categories);
      var el = '<div class="jx-bulles">' + liste(d.elements).map(function (e, i) { return '<div class="jx-bulle">' + img(e.image, 'jx-pers') + '<div>' + (e.personne ? '<b>' + esc(e.personne) + '</b>' : '') + '<p>' + (e.personne ? '« ' + esc(e.texte) + ' »' : esc(e.texte)) + '</p>' + (som ? '<b class="jx-num">' + e.nombre + '</b>' : '<span class="jx-lettre">' + (corrige ? self.lettre(cats[e.categorie], e.categorie) : '') + '</span>') + '</div></div>'; }).join('') + '</div>';
      var leg = '<p class="jx-aide">' + cats.map(function (c, i) { return '<b>' + self.lettre(c, i) + '</b> = ' + esc(c.nom); }).join(' · ') + '</p>';
      var tab = '<table class="jx-cols"><tr>' + cats.map(function (c) { return '<th>' + esc(c.nom) + '</th>'; }).join('') + '</tr><tr>' + cats.map(function (c, i) { return '<td>' + (corrige ? liste(d.elements).filter(function (e) { return e.categorie === i; }).map(function (e) { return esc(e.personne || e.texte) + (som ? ' (' + e.nombre + ')' : ''); }).join('<br>') : '') + '</td>'; }).join('') + '</tr>' + (som ? '<tr>' + cats.map(function (c, i) { return '<td class="som">Total : ' + (corrige ? '<b>' + liste(d.elements).filter(function (e) { return e.categorie === i; }).reduce(function (s, e) { return s + (+e.nombre); }, 0) + '</b>' : '……') + '</td>'; }).join('') + '</tr>' : '') + '</table>';
      return el + (som ? tab : leg);
    },
    code: function (d) { var self = this; if (d.code && d.code !== 'lettres' && d.code !== 'sommes') return String(d.code); if (this.sommes(d)) return liste(d.categories).map(function (c, i) { return liste(d.elements).filter(function (e) { return e.categorie === i; }).reduce(function (s, e) { return s + (+e.nombre); }, 0); }).join(''); return liste(d.elements).map(function (e) { return self.lettre(d.categories[e.categorie], e.categorie); }).join(''); }
  };

  T['legender'] = {
    nom: 'Schéma ou image à légender', famille: 'Images et observation', inventaire: ['JEU-059'], ecran: true,
    resume: 'Une image avec des points numérotés ; écrire la bonne étiquette à chaque point (banque de mots possible). x et y en pourcentage de l’image.',
    champs: { image: 'image (data URL ou référence de visuel résolue)', etiquettes: '[{ texte, x, y }] : x, y de 0 à 100', banque: 'booléen (défaut true)' },
    exemple: { image: 'sv:oreille.png', etiquettes: [{ texte: 'Pavillon', x: 10, y: 47 }, { texte: 'Conduit auditif', x: 38, y: 53 }, { texte: 'Tympan', x: 59, y: 54 }, { texte: 'Osselets', x: 62, y: 43 }, { texte: 'Cochlée', x: 79, y: 49 }, { texte: 'Nerf auditif', x: 93, y: 37 }] },
    valider: function (d, err) { exige(liste(d.etiquettes).length >= 2, 'etiquettes : au moins 2', err); exige(imageValide(d.image), 'image manquante (data URL ou référence de visuel)', err); },
    papier: function (d, P, corrige) { var b = melanger(liste(d.etiquettes).map(function (e) { return e.texte; }), alea(P.graine + '|leg')); return '<div class="jx-leg">' + img(d.image, 'jx-grande') + liste(d.etiquettes).map(function (e, i) { return '<span class="jx-point" style="left:' + e.x + '%;top:' + e.y + '%">' + (i + 1) + '</span>'; }).join('') + '</div><ol class="jx-lgd">' + liste(d.etiquettes).map(function (e) { return '<li>' + (corrige ? '<b>' + esc(e.texte) + '</b>' : '<span class="jx-tiret"></span>') + '</li>'; }).join('') + '</ol>' + (d.banque !== false && !corrige ? '<div class="jx-banque">' + b.map(function (x) { return '<span class="jx-carte">' + esc(x) + '</span>'; }).join('') + '</div>' : ''); },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['zones'] = {
    nom: 'Chasse aux dangers (zones à trouver)', famille: 'Images et observation', inventaire: ['JEU-060', 'JEU-061', 'JEU-062', 'JEU-064'], ecran: true,
    resume: 'Repérer sur une image toutes les zones demandées (dangers d’un poste de travail, EPI manquants…). À l’écran on clique ; sur papier on entoure et on justifie. Le code = le nombre de zones.',
    champs: { image: 'image', zones: '[{ x, y, l, h, texte }] en % de l’image (rectangle), texte = ce qu’on doit nommer', cible: 'ce qu’il faut trouver (« les dangers »)' },
    exemple: { image: 'sv:oreille.png', cible: 'le pavillon, le tympan et la cochlée', zones: [{ x: 2, y: 18, l: 22, h: 64, texte: 'Le pavillon : il capte le son.' }, { x: 54, y: 40, l: 9, h: 28, texte: 'Le tympan : il vibre sous l’effet du son.' }, { x: 72, y: 36, l: 15, h: 24, texte: 'La cochlée : elle transforme les vibrations en message nerveux.' }] },
    valider: function (d, err) { exige(liste(d.zones).length >= 1, 'zones : au moins 1', err); exige(imageValide(d.image), 'image manquante (data URL ou référence de visuel)', err); },
    papier: function (d, P, corrige) { return (d.cible ? '<p class="jx-aide">À trouver : ' + esc(d.cible) + '</p>' : '') + '<div class="jx-leg">' + img(d.image, 'jx-grande') + (corrige ? liste(d.zones).map(function (z, i) { return '<span class="jx-zone" style="left:' + z.x + '%;top:' + z.y + '%;width:' + z.l + '%;height:' + z.h + '%">' + (i + 1) + '</span>'; }).join('') : '') + '</div><table class="jx-vf"><tr><th>N°</th><th>Ce que j’ai repéré et pourquoi</th></tr>' + liste(d.zones).map(function (z, i) { return '<tr><td>' + (i + 1) + '</td><td>' + (corrige ? esc(z.texte) : '&nbsp;') + '</td></tr>'; }).join('') + '</table>'; },
    code: function (d) { return d.code ? String(d.code) : String(liste(d.zones).length); }
  };

  T['labyrinthe'] = {
    nom: 'Labyrinthe vrai ou faux', famille: 'Logique', inventaire: ['JEU-104', 'JEU-139'], ecran: true,
    resume: 'Partir de la case 1 : si la phrase est vraie, suivre « Vrai », sinon « Faux ». Une seule sortie donne le bon code (numéros de sortie tirés par la graine).',
    champs: { cases: '[{ texte, vrai:booléen }] : le chemin juste les parcourt dans l’ordre', code: 'facultatif : numéro de la bonne sortie (3 chiffres)' },
    exemple: { cases: [{ texte: 'Les travailleurs et les employeurs versent des cotisations à la Sécurité sociale.', vrai: true }, { texte: 'La Sécurité sociale aide seulement les personnes qui travaillent.', vrai: false }, { texte: 'Solidarité nationale : chacun donne selon ses moyens, chacun reçoit selon ses besoins.', vrai: true }, { texte: 'Un plan santé sert à rembourser les consultations.', vrai: false }, { texte: 'Mon espace santé regroupe les traitements, les résultats d’examens et les vaccins.', vrai: true }] },
    valider: function (d, err) { exige(liste(d.cases).length >= 2, 'cases : au moins 2', err); liste(d.cases).forEach(function (c, i) { exige(typeof c.vrai === 'boolean', 'cases[' + i + '].vrai doit être true ou false', err); }); },
    sorties: function (d, P) { var r = alea(P.graine + '|lab'), vus = {}, n = liste(d.cases).length + 1, s = []; while (s.length < n) { var x = String(100 + Math.floor(r() * 900)); if (!vus[x]) { vus[x] = 1; s.push(x); } } if (d.code) s[0] = String(d.code); return s; },
    plan: function (d, P) { var s = this.sorties(d, P), n = liste(d.cases).length, k = 1; return liste(d.cases).map(function (c, i) { var suite = i + 1 < n ? 'case ' + (i + 2) : 'sortie ' + s[0]; var piege = 'sortie ' + s[k++]; return { v: c.vrai ? suite : piege, f: c.vrai ? piege : suite }; }); },
    papier: function (d, P, corrige) { var pl = this.plan(d, P); return '<div class="jx-lab">' + liste(d.cases).map(function (c, i) { return '<div class="jx-labc' + (corrige ? ' ok' : '') + '"><b>Case ' + (i + 1) + '</b><p>' + esc(c.texte) + (corrige ? ' <b class="jx-rep">' + (c.vrai ? 'Vrai' : 'Faux') + '</b>' : '') + '</p><div class="jx-vfl"><span>Vrai → ' + pl[i].v + '</span><span>Faux → ' + pl[i].f + '</span></div></div>'; }).join('') + '</div>'; },
    code: function (d, P) { return this.sorties(d, P)[0]; }
  };

  T['tableau'] = {
    nom: 'Tableau à compléter', famille: 'Textes', inventaire: ['JEU-029'], ecran: true,
    resume: 'Un tableau dont certaines cases sont vides (marquées entre crochets) : les compléter.',
    champs: { colonnes: '[titres]', lignes: '[[cellules]] : une cellule [entre crochets] est à compléter' },
    exemple: { colonnes: ['Facteur', 'Interne ou externe', 'Exemple d’effet'], lignes: [['Le bruit', '[externe]', 'Troubles du sommeil'], ['Le manque d’activité physique', '[interne]', '[Prise de poids]'], ['La pollution de l’air', '[externe]', 'Maladies du cœur et des poumons']] },
    valider: function (d, err) { exige(liste(d.colonnes).length >= 2, 'colonnes : au moins 2', err); exige(liste(d.lignes).length >= 1, 'lignes : au moins 1', err); },
    papier: function (d, P, corrige) { return '<table class="jx-cols"><tr>' + liste(d.colonnes).map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>' + liste(d.lignes).map(function (l) { return '<tr>' + liste(l).map(function (c) { var m = /^\[(.*)\]$/.exec(String(c)); return '<td>' + (m ? (corrige ? '<b class="jx-rep">' + esc(m[1]) + '</b>' : '') : esc(c)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>'; },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['flashcards'] = {
    nom: 'Cartes recto-verso (flashcards)', famille: 'Mémoriser', inventaire: ['JEU-146'], ecran: true,
    resume: 'Une question ou une image au recto, la réponse au verso. À l’écran on retourne la carte ; sur papier, cartes à découper et plier.',
    champs: { cartes: '[{ recto, image, verso }]' },
    exemple: { cartes: [{ recto: 'Qu’est-ce que le capital santé ?', verso: 'L’ensemble des ressources de santé d’une personne.' }, { recto: 'À quel âge déclare-t-on un médecin traitant ?', verso: 'À partir de 16 ans.' }, { recto: 'Que rembourse l’Assurance maladie ?', verso: 'Les soins.' }] },
    valider: function (d, err) { exige(liste(d.cartes).length >= 1, 'cartes : au moins 1', err); },
    papier: function (d) { return '<table class="jx-flash">' + liste(d.cartes).map(function (c) { return '<tr><td>' + img(c.image, 'jx-vign') + esc(c.recto) + '</td><td class="pli"></td><td>' + esc(c.verso) + '</td></tr>'; }).join('') + '</table><p class="jx-aide">Découper chaque bande, plier sur le pointillé : question d’un côté, réponse de l’autre.</p>'; },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['roue'] = {
    nom: 'Roue des questions (tirage au sort)', famille: 'Jeux de classe', inventaire: ['JEU-097', 'JEU-108'], ecran: true,
    resume: 'Tirer au hasard une question, un thème ou un défi (à l’écran, roue qui tourne) ; sur papier, cartes à piocher.',
    champs: { elements: '[{ texte, reponse }]' },
    exemple: { elements: [{ texte: 'Citer les trois bien-être.', reponse: 'Physique, mental, social.' }, { texte: 'Donner un facteur externe.', reponse: 'Le bruit, la pollution, le logement, le travail.' }, { texte: 'Que veut dire « solidarité nationale » ?', reponse: 'Chacun donne selon ses moyens, chacun reçoit selon ses besoins.' }, { texte: 'À quoi sert la carte Vitale ?', reponse: 'Prouver que l’on est assuré et être remboursé plus vite.' }] },
    valider: function (d, err) { exige(liste(d.elements).length >= 2, 'elements : au moins 2', err); },
    papier: function (d, P, corrige) { return '<div class="jx-memo">' + liste(d.elements).map(function (e, i) { return '<div class="jx-mcarte"><b>' + (i + 1) + '</b><span>' + esc(e.texte) + '</span>' + (corrige && e.reponse ? '<i class="jx-aide">' + esc(e.reponse) + '</i>' : '') + '</div>'; }).join('') + '</div>'; },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['bingo'] = {
    nom: 'Bingo des notions', famille: 'Jeux de classe', inventaire: ['JEU-098'], ecran: true,
    resume: 'Chaque élève a une grille de mots différente ; le professeur lit des définitions (ou les tire à l’écran) ; l’élève coche le mot correspondant. Le premier qui a une ligne gagne.',
    champs: { mots: '[{ mot, def }] : au moins 12', taille: '3 ou 4 (grille 3×3 ou 4×4, défaut 3)', grilles: 'nombre de grilles différentes à imprimer (défaut 6)' },
    exemple: { taille: 3, grilles: 6, mots: [{ mot: 'Prévention', def: 'Agir avant la maladie.' }, { mot: 'Cotisation', def: 'Somme versée chaque mois pour financer la Sécurité sociale.' }, { mot: 'Carte Vitale', def: 'Elle prouve que la personne est assurée.' }, { mot: 'Médecin traitant', def: 'Médecin choisi et déclaré dès 16 ans.' }, { mot: 'Bruit', def: 'Facteur externe mesuré en décibels.' }, { mot: 'Gènes', def: 'Facteur interne reçu des parents.' }, { mot: 'Capital santé', def: 'Ressources de santé d’une personne.' }, { mot: 'Solidarité', def: 'Chacun donne selon ses moyens, chacun reçoit selon ses besoins.' }, { mot: 'Plan santé', def: 'Programme de l’État pour plusieurs années.' }, { mot: 'Spécialiste', def: 'Médecin vers qui oriente le médecin traitant.' }, { mot: 'Assurance maladie', def: 'Partie de la Sécurité sociale qui rembourse les soins.' }, { mot: 'Mon espace santé', def: 'Carnet de santé sur Internet.' }] },
    valider: function (d, err) { var t = +d.taille || 3; exige(liste(d.mots).length >= t * t + 2, 'mots : au moins ' + (t * t + 2) + ' pour des grilles ' + t + '×' + t, err); },
    papier: function (d, P, corrige) {
      var t = +d.taille || 3, n = +d.grilles || 6, mots = liste(d.mots);
      if (corrige) return '<h4>Liste à lire (ordre de tirage)</h4><ol class="jx-defs">' + melanger(mots, alea(P.graine + '|tirage')).map(function (m) { return '<li>' + esc(m.def) + ' <b>' + esc(m.mot) + '</b></li>'; }).join('') + '</ol>';
      var h = '<div class="jx-bingos">';
      for (var g = 0; g < n; g++) { var m = melanger(mots, alea(P.graine + '|bingo' + g)).slice(0, t * t); h += '<table class="jx-bingo"><caption>Grille ' + (g + 1) + '</caption>'; for (var y = 0; y < t; y++) { h += '<tr>'; for (var x = 0; x < t; x++) h += '<td>' + esc(m[y * t + x].mot) + '</td>'; h += '</tr>'; } h += '</table>'; }
      return h + '</div>';
    },
    code: function (d) { return d.code ? String(d.code) : null; }
  };

  T['auto-evaluation'] = {
    nom: 'Auto-évaluation', famille: 'Bilan', inventaire: ['JEU-153'], ecran: true,
    resume: 'L’élève se situe sur des critères explicites (« Je sais… ») avec une échelle.',
    champs: { criteres: '[« Je sais… »]', echelle: '[niveaux] (défaut : Pas encore · En cours · Acquis)' },
    exemple: { criteres: ['Je sais donner la définition de la santé selon l’OMS.', 'Je sais distinguer un facteur interne d’un facteur externe.', 'Je sais expliquer le parcours de soins coordonnés.'] },
    valider: function (d, err) { exige(liste(d.criteres).length >= 1, 'criteres : au moins 1', err); },
    echelle: function (d) { return liste(d.echelle).length ? d.echelle : ['Pas encore', 'En cours', 'Acquis']; },
    papier: function (d) { var e = this.echelle(d); return '<table class="jx-vf"><tr><th>Je sais…</th>' + e.map(function (x) { return '<th>' + esc(x) + '</th>'; }).join('') + '</tr>' + liste(d.criteres).map(function (c) { return '<tr><td>' + esc(c) + '</td>' + e.map(function () { return '<td class="ch"><span class="jx-coche"></span></td>'; }).join('') + '</tr>'; }).join('') + '</table>'; },
    code: function () { return null; }
  };

  T['ticket-sortie'] = {
    nom: 'Ticket de sortie', famille: 'Bilan', inventaire: ['JEU-154'], ecran: true,
    resume: 'Trois questions de fin de séance : ce que j’ai appris, une règle à retenir, ce qui reste difficile.',
    champs: { questions: '[question] (défaut : les trois questions classiques)' },
    exemple: { questions: ['Une notion que j’ai apprise aujourd’hui :', 'Un conseil de prévention que je retiens :', 'Ce qui est encore difficile pour moi :'] },
    valider: function () {},
    papier: function (d) { var q = liste(d.questions).length ? d.questions : this.exemple.questions; return '<div class="jx-tickets">' + [0, 1].map(function () { return '<div class="jx-ticket">' + q.map(function (x) { return '<p><b>' + esc(x) + '</b></p>' + lignes(1); }).join('') + '</div>'; }).join('') + '</div>'; },
    code: function () { return null; }
  };

  /* ---------- Planche de jeux ---------- */
  /* [PLANCHE 22/10/2026] Demande de Brahim : « une page de jeux sur le module, en économisant les pages ». Plusieurs petits jeux
     de la ludothèque sur une même feuille, serrés ; « demi » = deux jeux côte à côte. Corrigé du professeur sur une page. */
  T['planche'] = {
    nom: 'Planche de jeux', famille: 'Planches et escape games', inventaire: ['JEU-001', 'JEU-033', 'JEU-045', 'JEU-051'], ecran: true,
    resume: 'Plusieurs petits jeux de la ludothèque réunis sur une même feuille recto-verso (révision d’un module), serrés pour économiser le papier : un jeu « demi » se place à côté d’un autre. Corrigé du professeur sur une page.',
    champs: { jeux: '[{ titre, consigne, demi:booléen, jeu:{ type, donnees } }] : 4 à 8 petits jeux variés (pas deux fois le même type)', situation: 'facultatif : une courte situation commune (personnages adultes)' },
    exemple: {
      jeux: [
        { titre: 'Mots croisés de la santé', consigne: 'Compléter la grille avec les mots du module.', jeu: { type: 'mots-croises', donnees: { mots: [{ mot: 'PREVENTION', def: 'Agir avant la maladie pour éviter qu’elle arrive.' }, { mot: 'VITALE', def: 'Carte gratuite qui permet d’être remboursé plus vite.' }, { mot: 'COTISATION', def: 'Somme versée chaque mois pour financer la Sécurité sociale.' }, { mot: 'GENES', def: 'Facteur interne reçu de ses parents.' }, { mot: 'BRUIT', def: 'Facteur externe qui peut gêner le sommeil.' }, { mot: 'TRAITANT', def: 'Le médecin … : déclaré dès 16 ans.' }, { mot: 'SOLIDARITE', def: 'Chacun donne selon ses moyens, chacun reçoit selon ses besoins.' }] } } },
        { titre: 'Qui dit quoi ?', consigne: 'Écrire P (bien-être physique), M (mental) ou S (social) dans chaque case.', jeu: { type: 'tri', donnees: { code: 'lettres', categories: [{ nom: 'Bien-être physique', lettre: 'P' }, { nom: 'Bien-être mental', lettre: 'M' }, { nom: 'Bien-être social', lettre: 'S' }], elements: [{ personne: 'Laetitia, 31 ans', texte: 'Je fais du vélo pour aller au travail.', categorie: 0 }, { personne: 'Franck, 45 ans', texte: 'Je me sens calme et confiant.', categorie: 1 }, { personne: 'Aurélie, 27 ans', texte: 'Je vois mes amis chaque semaine.', categorie: 2 }, { personne: 'Didier, 52 ans', texte: 'Je dors huit heures par nuit.', categorie: 0 }, { personne: 'Sophie, 38 ans', texte: 'Je sais gérer mon stress.', categorie: 1 }, { personne: 'Mathieu, 24 ans', texte: 'Je déjeune avec mes collègues.', categorie: 2 }] } } },
        { titre: 'Trouver l’intrus', demi: true, consigne: 'Entourer l’intrus et dire pourquoi.', jeu: { type: 'intrus', donnees: { series: [{ elements: ['les gènes', 'l’âge', 'la pollution', 'le sommeil'], intrus: 2, raison: 'La pollution est un facteur externe.' }, { elements: ['gratuite', 'personnelle', 'payante', 'verte'], intrus: 2, raison: 'La carte Vitale est gratuite.' }] } } },
        { titre: 'Le bon calcul', demi: true, consigne: 'Une consultation chez le généraliste coûte 30 €.', jeu: { type: 'numerique', donnees: { questions: [{ q: 'Sans médecin traitant, 8,40 € sont remboursés. Reste à payer ?', reponse: 21.6, unite: '€' }, { q: 'Avec un médecin traitant, 19 € sont remboursés. Reste à payer ?', reponse: 11, unite: '€' }] } } },
        { titre: 'Vrai ou faux ?', demi: true, consigne: 'Cocher. Les lettres des phrases vraies forment un mot.', jeu: { type: 'vrai-faux', donnees: { affirmations: [{ texte: 'La santé, c’est un complet bien-être physique, mental et social.', vrai: true, lettre: 'S' }, { texte: 'Le bruit est un facteur interne.', vrai: false, lettre: 'O' }, { texte: 'L’âge est un facteur interne.', vrai: true, lettre: 'A' }, { texte: 'Le médecin traitant se déclare dès 16 ans.', vrai: true, lettre: 'N' }, { texte: 'La carte Vitale sert à payer le médecin.', vrai: false, lettre: 'U' }, { texte: 'Les cotisations financent la Sécurité sociale.', vrai: true, lettre: 'T' }, { texte: 'Un plan santé sert à faire de la prévention.', vrai: true, lettre: 'E' }] } } },
        { titre: 'Relier', demi: true, consigne: 'Écrire le numéro de la bonne définition.', jeu: { type: 'relier', donnees: { paires: [{ gauche: 'Capital santé', droite: 'Ressources de santé d’une personne.' }, { gauche: 'Prévention', droite: 'Agir avant la maladie.' }, { gauche: 'Assurance maladie', droite: 'Rembourse les soins.' }, { gauche: 'Solidarité nationale', droite: 'Chacun donne selon ses moyens.' }] } } },
        { titre: 'Qui suis-je ?', demi: true, consigne: 'Lire les indices et trouver la notion.', jeu: { type: 'qui-suis-je', donnees: { enigmes: [{ indices: ['Je viens de l’environnement.', 'On me mesure en décibels.', 'Je peux gêner le sommeil.'], reponse: 'Le bruit' }, { indices: ['Je suis choisi par le patient.', 'On me déclare dès 16 ans.', 'J’oriente vers le spécialiste.'], reponse: 'Le médecin traitant' }] } } },
        { titre: 'Lettres mélangées', demi: true, consigne: 'Remettre les lettres dans l’ordre.', jeu: { type: 'anagrammes', donnees: { mots: [{ mot: 'SANTE', indice: 'Bien-être physique, mental et social.' }, { mot: 'VITALE', indice: 'La carte de l’Assurance maladie.' }, { mot: 'SOMMEIL', indice: 'Il protège le capital santé.' }] } } },
        { titre: 'Le texte à trous', consigne: 'Compléter avec les mots de la liste (deux mots ne servent pas).', jeu: { type: 'texte-trous', donnees: { texte: 'Les travailleurs et les employeurs versent des [cotisations] à la Sécurité sociale. L’[Assurance maladie] rembourse les soins. Pour être mieux remboursé, il faut consulter d’abord son [médecin traitant] : c’est le parcours de [soins coordonnés].', banque: true, intrus: ['impôts', 'pharmacien'] } } }
      ]
    },
    valider: function (d, err, P) {
      var vus = {};
      exige(liste(d.jeux).length >= 2, 'jeux : au moins 2', err);
      liste(d.jeux).forEach(function (x, i) { var j = x.jeu || {}, t = T[j.type]; if (!t || j.type === 'escape' || j.type === 'planche') return err.push('jeux[' + i + '].jeu.type invalide : ' + j.type); var sous = []; t.valider(j.donnees || {}, sous, sousP(P, i)); sous.forEach(function (m) { err.push('jeux[' + i + '] (' + j.type + ') : ' + m); }); vus[j.type] = (vus[j.type] || 0) + 1; });
    },
    papier: function (d, P, corrige) {
      return (d.situation && !corrige ? '<p class="jx-doc">' + esc(d.situation) + '</p>' : '') + '<div class="jx-planche' + (corrige ? ' corr' : '') + '">' + liste(d.jeux).map(function (x, i) { var t = T[x.jeu.type]; return '<section class="jx-sec' + (x.demi ? ' demi' : '') + '"><h3><span>' + (i + 1) + '</span>' + esc(x.titre || t.nom) + '</h3>' + (x.consigne && !corrige ? '<p class="jx-consigne">' + esc(x.consigne) + '</p>' : '') + t.papier(x.jeu.donnees || {}, sousP(P, i), corrige) + '</section>'; }).join('') + '</div>';
    },
    code: function () { return null; }
  };

  /* ---------- Escape game ---------- */
  T['escape'] = {
    nom: 'Escape game', famille: 'Escape game', inventaire: ['JEU-126', 'JEU-127', 'JEU-128', 'JEU-135', 'JEU-136', 'JEU-143', 'JEU-145'], ecran: true,
    resume: 'Une histoire inventée (personnages adultes) et 4 à 8 étapes ; chaque étape est un jeu de la ludothèque fermé par un cadenas (chiffres, lettres, flèches, couleurs). Le code vient du jeu lui-même quand c’est possible. Indices gradués limités pour toute l’équipe, minuteur, mission finale.',
    champs: {
      histoire: '{ titre, contexte, mission, duree (minutes, défaut 50), fin (message de victoire), finConsigne (dernière mission écrite), finReponse (attendu, pour le professeur) }',
      scene: '[images] : visuels de la page de mission (références de visuels résolues)',
      etapes: '[{ titre, jeu:{ type, donnees }, cadenas:{ type:chiffres|lettres|fleches|couleurs, code }, indices:[2 indices du plus vague au plus précis] }] ; cadenas.code facultatif si le jeu donne son code',
      indicesMax: 'indices pour toute l’équipe (défaut 3)'
    },
    exemple: null,
    valider: function (d, err, P) {
      var h = d.histoire || {};
      exige(txt(h.titre), 'histoire.titre vide', err); exige(txt(h.contexte), 'histoire.contexte vide', err); exige(txt(h.mission), 'histoire.mission vide', err);
      exige(liste(d.etapes).length >= 2, 'etapes : au moins 2', err);
      liste(d.etapes).forEach(function (e, i) {
        var j = e.jeu || {}, t = T[j.type];
        if (!t || j.type === 'escape') return err.push('etapes[' + i + '].jeu.type inconnu : ' + j.type);
        var sous = []; t.valider(j.donnees || {}, sous, sousP(P, i)); sous.forEach(function (m) { err.push('etapes[' + i + '] (' + j.type + ') : ' + m); });
        var c = codeEtape(e, P, i), cad = CADENAS[(e.cadenas || {}).type || cadenasDevine(c)];
        if (!c) err.push('etapes[' + i + '] : aucun code (donner cadenas.code ou un jeu qui fournit son code)');
        else if (!cad) err.push('etapes[' + i + '].cadenas.type inconnu');
        else if (!String(c).split('').every(function (x) { return cad.alphabet.indexOf(x) >= 0; })) err.push('etapes[' + i + '] : le code « ' + c + ' » ne convient pas à un ' + cad.nom.toLowerCase());
        else if (String(c).length > 8) err.push('etapes[' + i + '] : code trop long (8 au plus)');
        exige(liste(e.indices).length >= 1, 'etapes[' + i + '] : au moins 1 indice', err);
      });
    },
    papier: function (d, P, corrige) { return papierEscape(d, P, corrige); },
    code: function () { return null; }
  };
  T['escape'].exemple = {
    histoire: { titre: 'Le coffre du forum santé', duree: 50, contexte: 'Margaux, 34 ans, est infirmière au service de santé au travail de l’entreprise de transport Transval. Ce matin, elle organise un forum santé pour les salariés. Tout le matériel du stand est dans un coffre, mais Margaux a été appelée en urgence sur un autre site : avant de partir, elle a laissé des énigmes à ses collègues pour retrouver les codes.', mission: 'Votre équipe remplace Margaux. Le forum ouvre dans 50 minutes : ouvrez tous les cadenas avant l’arrivée des salariés.', fin: 'Le coffre est ouvert : le forum peut commencer.', finConsigne: 'Sur l’affiche du stand, écrire deux conseils de prévention pour les salariés.', finReponse: 'Toute action de prévention vue dans le cours (médecin traitant, activité physique, sommeil, alimentation, tabac, bruit…).' },
    indicesMax: 3,
    etapes: [
      { titre: 'La grille de Margaux', jeu: { type: 'acrostiche', donnees: T['acrostiche'].exemple }, cadenas: { type: 'lettres' }, indices: ['Tous les mots sont des notions du module A1.', 'Le mot mystère a cinq lettres : c’est le thème du forum.'] },
      { titre: 'Le message chiffré', jeu: { type: 'cryptogramme', donnees: T['cryptogramme'].exemple }, cadenas: { type: 'chiffres' }, indices: ['Le message pose deux questions : un âge, puis un prix.', 'Médecin traitant dès 16 ans ; consultation chez le généraliste : 30 €.'] },
      { titre: 'Les mots mêlés', jeu: { type: 'mots-meles', donnees: T['mots-meles'].exemple }, cadenas: { type: 'chiffres' }, indices: ['Commencer par le mot le plus long.', 'Il reste quatorze lettres : trois nombres écrits en lettres.'] },
      { titre: 'Le parcours de Julien', consigne: 'Julien, 41 ans, chauffeur chez Transval, a mal au dos. Remettre les étapes de son parcours de soins dans l’ordre ; le code = les flèches dans cet ordre.', jeu: { type: 'ordre', donnees: T['ordre'].exemple }, cadenas: { type: 'fleches' }, indices: ['Tout commence par la déclaration du médecin traitant.', 'Déclarer → consulter le médecin traitant → être orienté → spécialiste → mieux remboursé.'] },
      { titre: 'Le labyrinthe de la Sécurité sociale', jeu: { type: 'labyrinthe', donnees: T['labyrinthe'].exemple }, cadenas: { type: 'chiffres' }, indices: ['La Sécurité sociale aide toute la population.', 'Un plan santé sert à la prévention, pas à rembourser.'] },
      { titre: 'Qui dit quoi ?', consigne: 'Pour chaque salarié, écrire P (bien-être physique), M (mental) ou S (social). Le code = les six lettres dans l’ordre.', jeu: { type: 'tri', donnees: T['tri'].exemple }, cadenas: { type: 'lettres' }, indices: ['Physique : le corps. Mental : les pensées et émotions. Social : les relations.', 'Il y a deux P, deux M et deux S.'] }
    ]
  };
  function sousP(P, i) { return { graine: P.graine + '|etape' + i }; }
  function codeEtape(e, P, i) { var j = e.jeu || {}, t = T[j.type]; var c = (e.cadenas || {}).code; if (c == null || c === '') c = t ? t.code(j.donnees || {}, sousP(P, i)) : ''; c = String(c == null ? '' : c).toUpperCase().replace(/\s+/g, ''); if (((e.cadenas || {}).type || cadenasDevine(c)) === 'lettres') c = sansAccent(c).toUpperCase().replace(/[^A-Z0-9]/g, ''); return c; }
  function typeCadenas(e, P, i) { return (e.cadenas || {}).type || cadenasDevine(codeEtape(e, P, i)); }

  function papierEscape(d, P, prof) {
    var h = d.histoire || {}, et = liste(d.etapes), out = '';
    if (prof) {
      out += '<p><b>Durée :</b> ' + (+h.duree || 50) + ' minutes. <b>Équipes :</b> 3 ou 4 élèves. <b>Indices :</b> ' + (+d.indicesMax || 3) + ' pour toute l’équipe.</p>';
      out += '<table class="jx-vf"><tr><th>Étape</th><th>Cadenas</th><th>Code</th><th>Indices</th></tr>' + et.map(function (e, i) { var ty = typeCadenas(e, P, i); return '<tr><td>' + (i + 1) + '. ' + esc(e.titre || T[e.jeu.type].nom) + '<br><small>' + esc(T[e.jeu.type].nom) + '</small></td><td>' + CADENAS[ty].nom + '</td><td><b>' + esc(codeLisible(ty, codeEtape(e, P, i))) + '</b></td><td>' + liste(e.indices).map(function (x, k) { return (k + 1) + '. ' + esc(x); }).join('<br>') + '</td></tr>'; }).join('') + '</table>';
      if (h.finReponse) out += '<p><b>Fin de mission :</b> ' + esc(h.finReponse) + '</p>';
      et.forEach(function (e, i) { out += '<div class="jx-corr"><h4>Étape ' + (i + 1) + ' — corrigé</h4>' + T[e.jeu.type].papier(e.jeu.donnees || {}, sousP(P, i), true) + '</div>'; });
      return out;
    }
    out += '<div class="jx-mission">' + (liste(d.scene).length ? '<div class="jx-scene">' + liste(d.scene).map(function (s) { return img(s, 'jx-sc'); }).join('') + '</div>' : '') + '<div><p><b>L’histoire.</b> ' + esc(h.contexte) + '</p><p><b>Votre mission.</b> ' + esc(h.mission) + '</p><ul><li>' + et.length + ' énigmes, ' + et.length + ' cadenas : chaque code ouvre l’énigme suivante.</li><li>' + (+d.indicesMax || 3) + ' indices au plus pour toute l’équipe.</li><li>Chaque code trouvé s’écrit sur la feuille de route.</li></ul></div></div>';
    out += '<h4>Feuille de route</h4><table class="jx-vf"><tr><th>Cadenas</th><th>Énigme</th><th>Code trouvé</th><th>Indice</th></tr>' + et.map(function (e, i) { return '<tr><td>' + (i + 1) + ' · ' + CADENAS[typeCadenas(e, P, i)].nom + '</td><td>' + esc(e.titre || '') + '</td><td></td><td>☐</td></tr>'; }).join('') + '</table>';
    if (h.finConsigne) out += '<p><b>Fin de la mission.</b> ' + esc(h.finConsigne) + '</p>' + lignes(2);
    et.forEach(function (e, i) { var ty = typeCadenas(e, P, i), t = T[e.jeu.type]; out += '<section class="jx-etape"><h3>Énigme ' + (i + 1) + ' — ' + esc(e.titre || t.nom) + '<span class="jx-badge">' + esc(t.nom) + ' · ' + CADENAS[ty].nom + '</span></h3>' + (e.consigne ? '<p class="jx-consigne">' + esc(e.consigne) + '</p>' : '') + t.papier(e.jeu.donnees || {}, sousP(P, i), false) + '<p class="jx-code">Code :' + cases(codeEtape(e, P, i).length) + '</p></section>'; });
    return out;
  }

  /* ---------- Jeu complet ---------- */
  function P(jeu) { return { graine: String(jeu.graine || jeu.id || 'pse') }; }
  function valider(jeu) {
    var err = [], t = T[jeu && jeu.type];
    if (!t) return ['type inconnu : ' + (jeu && jeu.type) + ' (types : ' + Object.keys(T).join(', ') + ')'];
    if (!txt(jeu.titre)) err.push('titre vide');
    t.valider(jeu.donnees || {}, err, P(jeu));
    rangement(jeu, err);
    return err;
  }
  function consigneDe(jeu) { return txt(jeu.consigne) || ''; }
  function entete(jeu, sousTitre) { return '<div class="jx-tete">' + (jeu.module ? '<div class="jx-mod">' + esc(jeu.module) + '</div>' : '') + '<div><h1>' + esc(jeu.titre) + '</h1><small>' + esc([jeu.niveau ? 'PSE · ' + jeu.niveau : 'PSE', sousTitre].filter(Boolean).join(' · ')) + '</small></div><div class="jx-nom">Nom : ………………………</div></div>'; }
  /* Fiche élève (et corrigé) complète, prête à imprimer. */
  function fiche(jeu, corrige) {
    var t = T[jeu.type], p = P(jeu), c = consigneDe(jeu);
    if (jeu.type === 'escape') return entete(jeu, corrige ? 'Fiche du professeur — à ne pas distribuer' : 'Escape game') + papierEscape(jeu.donnees || {}, p, corrige);
    if (jeu.type === 'planche') return entete(jeu, corrige ? 'Corrigé du professeur' : 'Planche de jeux') + (c && !corrige ? '<p class="jx-consigne">' + esc(c) + '</p>' : '') + t.papier(jeu.donnees || {}, p, corrige);
    return entete(jeu, corrige ? 'Corrigé' : t.nom) + (c ? '<p class="jx-consigne">' + esc(c) + '</p>' : '') + t.papier(jeu.donnees || {}, p, corrige);
  }
  function codeDe(jeu) { var t = T[jeu.type]; return t && t.code ? t.code(jeu.donnees || {}, P(jeu)) : null; }
  function codesEscape(jeu) { var p = P(jeu); return liste((jeu.donnees || {}).etapes).map(function (e, i) { var ty = typeCadenas(e, p, i); return { type: ty, code: codeEtape(e, p, i), lisible: codeLisible(ty, codeEtape(e, p, i)) }; }); }

  var CSS = [
    '.jx-page{font:12pt/1.4 Arial,Helvetica,sans-serif;color:#1f2937}',
    '.jx-tete{display:flex;align-items:center;gap:12px;border-bottom:2.5px solid #0F766E;padding-bottom:6px;margin-bottom:10px}.jx-mod{background:#0F766E;color:#fff;font-weight:700;border-radius:10px;padding:6px 12px;font-size:14pt}.jx-tete h1{font-size:15pt;margin:0}.jx-tete small{display:block;color:#475569;font-size:10pt}.jx-nom{margin-left:auto;font-size:10pt;color:#475569;white-space:nowrap}',
    '.jx-consigne{font-weight:700;margin:6px 0 8px}.jx-aide{color:#475569;font-size:10.5pt}.jx-alerte{color:#B91C1C;font-weight:700}.jx-rep{color:#0F766E}',
    '.jx-page table{border-collapse:collapse;margin:6px 0}.jx-page th,.jx-page td{border:1px solid #94A3B8;padding:4px 7px;text-align:left;vertical-align:top}.jx-page th{background:#F0FDFA}',
    '.jx-mc td{width:30px;height:30px;padding:0;position:relative;text-align:center;font-weight:700;font-size:15px}.jx-mc td.n{border:0;background:none}.jx-mc sup{position:absolute;left:2px;top:0;font-size:9px;font-weight:400}',
    '.jx-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px}.jx-2col h4{margin:6px 0 2px;color:#0F766E}.jx-defs{margin:4px 0;padding-left:24px}.jx-defs li{margin:2px 0}.jx-defs i{color:#64748b}',
    '.jx-mm td{width:32px;height:32px;padding:0;text-align:center;font-weight:700;font-size:17px;border-color:#CBD5E1}.jx-mm td.pris{background:#CCFBF1}.jx-liste{font-weight:700;color:#334155}',
    '.jx-cases{display:inline-flex;gap:3px;flex-wrap:wrap;vertical-align:middle}.jx-case{display:inline-flex;align-items:center;justify-content:center;width:26px;height:28px;border:1.5px solid #334155;border-radius:4px;font-weight:700}',
    '.jx-pendu>li,.jx-qs>li,.jx-po>li,.jx-qcm>li,.jx-qsj>li{margin:0 0 10px}.jx-ana{letter-spacing:2px;color:#0F766E}',
    '.jx-acro{border-collapse:separate!important;border-spacing:3px}.jx-acro td{width:30px;height:32px;padding:0!important;border:1.5px solid #334155!important;border-radius:4px;text-align:center;font-weight:700}.jx-acro td.vide,.jx-acro td.nd{border:0!important}.jx-acro td.nd{color:#0F766E;text-align:right;padding-right:6px!important}.jx-acro td.mys{background:#99F6E4}',
    '.jx-cle td{text-align:center;padding:2px 6px!important;min-width:24px}.jx-cle tr.t td{background:#F0FDFA;font-weight:700}.jx-chiffre{font-family:"Courier New",monospace;font-size:14pt;line-height:1.9;border:1.5px dashed #64748b;border-radius:10px;padding:8px 12px}',
    '.jx-tiret{display:inline-block;min-width:220px;border-bottom:1.5px dotted #64748b;height:1.2em}.jx-ligne{border-bottom:1.3px dotted #94A3B8;height:26px}',
    '.jx-texte{line-height:2}.jx-trou{color:#334155;white-space:nowrap}.jx-banque{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.jx-carte{border:1.3px dashed #64748b;border-radius:8px;padding:4px 9px}.jx-carte b{background:#0F766E;color:#fff;border-radius:50%;padding:1px 7px;margin-left:4px}.jx-carte.ok{background:#CCFBF1}',
    '.jx-ordre td.lt,.jx-vf td.lt{width:1%;font-weight:700;text-align:center;white-space:nowrap}.jx-vign{max-width:70px;max-height:56px;vertical-align:middle;margin-right:6px}.jx-vf td.ch{white-space:nowrap;width:1%}.jx-coche{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border:1.3px solid #334155;border-radius:3px;margin:0 4px;vertical-align:-3px;font-size:12px;color:#0F766E;font-weight:700}',
    '.jx-qcm ul{list-style:none;padding-left:8px;margin:4px 0}.jx-qcm ul li{margin:3px 0}.jx-qcm ul li.ok{color:#0F766E;font-weight:700}',
    '.jx-relier td.pt{width:20px;text-align:center;border:0}.jx-relier td{border:0;border-bottom:1px solid #E2E8F0}',
    '.jx-memo{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.jx-mcarte{border:1.5px dashed #334155;border-radius:10px;min-height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6px;gap:4px}.jx-paire{color:#0F766E;font-size:10pt}',
    '.jx-bulles{display:grid;grid-template-columns:1fr 1fr;gap:8px}.jx-bulle{display:flex;gap:8px;align-items:center;border:1.5px solid #CBD5E1;border-radius:12px;padding:6px}.jx-bulle p{margin:2px 0;font-style:italic}.jx-pers{width:58px;height:68px;object-fit:contain}.jx-lettre{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:1.5px solid #334155;border-radius:4px;font-weight:700}.jx-num{background:#0F766E;color:#fff;border-radius:50%;padding:2px 8px}',
    '.jx-cols{width:100%}.jx-cols td{height:44px}.jx-cols td.som{height:auto;color:#475569}',
    '.jx-leg{position:relative;display:inline-block;max-width:100%}.jx-grande{max-width:100%;max-height:110mm;display:block}.jx-point{position:absolute;transform:translate(-50%,-50%);background:#0F766E;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px}.jx-zone{position:absolute;border:2.5px solid #DC2626;border-radius:8px;color:#DC2626;font-weight:700;padding:0 4px}',
    '.jx-lab{display:grid;gap:7px}.jx-labc{border:1.5px solid #CBD5E1;border-radius:10px;padding:6px 10px}.jx-labc p{margin:3px 0}.jx-vfl{display:flex;gap:18px;font-weight:700;color:#0F766E}',
    '.jx-flash td{width:47%;height:60px}.jx-flash td.pli{width:6%;border:0;border-left:1.5px dashed #64748b}',
    '.jx-bingos{display:grid;grid-template-columns:1fr 1fr;gap:12px}.jx-bingo{width:100%}.jx-bingo caption{font-weight:700;color:#0F766E;text-align:left}.jx-bingo td{height:52px;text-align:center;vertical-align:middle;font-weight:700}',
    '.jx-tickets{display:grid;gap:14px}.jx-ticket{border:1.5px dashed #334155;border-radius:12px;padding:8px 12px}',
    '.jx-doc{border:1px solid #CBD5E1;border-radius:10px;padding:8px 10px;margin:6px 0;background:#F8FAFC}',
    '.jx-mission{display:flex;gap:14px;align-items:flex-start}.jx-scene{display:flex;flex-direction:column;gap:8px;align-items:center;width:30%}.jx-sc{width:100px;height:100px;object-fit:contain}',
    '.jx-etape{break-before:page;border:1.5px solid #CBD5E1;border-radius:12px;padding:10px 14px}.jx-etape h3{display:flex;gap:8px;align-items:center;margin:0 0 6px;color:#0F766E;font-size:14pt}.jx-badge{margin-left:auto;font-size:9.5pt;color:#475569;font-weight:400;border:1px solid #CBD5E1;border-radius:20px;padding:2px 9px}.jx-code{font-weight:700;margin-top:10px}',
    '.jx-planche{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}.jx-sec{grid-column:span 2;break-inside:avoid;border-top:1.5px solid #CBD5E1;padding-top:3px}.jx-sec.demi{grid-column:span 1}.jx-sec h3{display:flex;align-items:center;gap:6px;margin:0 0 2px;font-size:12.5pt;color:#0F766E}.jx-sec h3 span{background:#0F766E;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:10pt}.jx-sec .jx-consigne{margin:0 0 3px;font-size:11pt}',
    '.jx-planche .jx-mcw{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start}.jx-planche .jx-mcw .jx-2col{grid-template-columns:1fr;gap:2px}.jx-planche .jx-mcw h4{margin:2px 0}',
    '.jx-planche table{margin:2px 0}.jx-planche .jx-mc td{width:23px;height:23px;font-size:12px}.jx-planche .jx-2col{gap:8px}.jx-planche .jx-defs{font-size:11pt;padding-left:20px}.jx-planche .jx-defs li{margin:0}.jx-planche .jx-bulles{grid-template-columns:1fr 1fr 1fr;gap:5px}.jx-planche .jx-bulle{padding:3px 6px;font-size:11pt}.jx-planche .jx-bulle>div{display:grid;grid-template-columns:1fr auto;column-gap:6px;align-items:center;width:100%}.jx-planche .jx-bulle>div>b{grid-column:1/3}.jx-planche .jx-bulle p{margin:0}.jx-planche .jx-lettre{width:24px;height:24px}.jx-planche .jx-vf td,.jx-planche .jx-relier td{padding:2px 5px;font-size:11pt}.jx-planche .jx-qs>li{margin:0 0 4px}.jx-planche .jx-qs p{margin:1px 0}.jx-planche .jx-texte{line-height:1.8;margin:2px 0}.jx-planche .jx-banque{margin:4px 0;gap:4px}.jx-planche .jx-carte{padding:2px 7px}.jx-planche .jx-ligne{height:20px}.jx-planche .jx-aide{margin:1px 0}',
    '.jx-planche.corr{gap:2px 14px;font-size:10pt}.jx-planche.corr .jx-sec{padding-top:1px}.jx-planche.corr .jx-sec h3{font-size:11pt}.jx-planche.corr .jx-mc td{width:17px;height:17px;font-size:10px}.jx-planche.corr .jx-mc sup{font-size:7px}.jx-planche.corr .jx-vf td,.jx-planche.corr .jx-relier td,.jx-planche.corr .jx-bulle,.jx-planche.corr .jx-defs{font-size:9.5pt}.jx-planche.corr .jx-bulle{padding:1px 4px}.jx-planche.corr .jx-lettre,.jx-planche.corr .jx-case{width:18px;height:18px}.jx-planche.corr .jx-texte{line-height:1.5}.jx-planche.corr .jx-banque{display:none}.jx-planche.corr .jx-coche{width:13px;height:13px;font-size:10px}.jx-planche.corr .jx-mc td{width:15px;height:15px;font-size:9px}.jx-planche.corr .jx-qsj ol,.jx-planche.corr .jx-pendu p{display:none}.jx-planche.corr .jx-qsj>li,.jx-planche.corr .jx-pendu>li{display:inline-block;margin:0 12px 2px 0}.jx-planche.corr .jx-qsj>li p{margin:0}.jx-planche.corr .jx-qs>li{margin:0 0 1px}.jx-planche.corr .jx-cases{gap:1px}.jx-planche.corr .jx-bulles{gap:2px}.jx-planche.corr .jx-defs li{margin:0}.jx-planche.corr .jx-mcw h4{font-size:10pt}.jx-planche.corr .jx-qs>li>p:first-child{display:none}.jx-planche.corr .jx-qs>li{display:inline-block;margin-right:14px}.jx-planche.corr .jx-vf td,.jx-planche.corr .jx-relier td{padding:0 4px;line-height:1.25}.jx-planche.corr .jx-sec h3{margin:0}.jx-planche.corr .jx-bulle b{font-size:9pt}',
    '.jx-corr{break-inside:avoid;margin-top:10px;border-top:1px solid #CBD5E1;padding-top:6px}.jx-corr h4{color:#0F766E;margin:4px 0}'
  ].join('\n');

  /* ---------- Rangement ---------- */
  /* [RANGEMENT 22/10/2026] Demande de Brahim : une bibliothèque par module et par thèmes. Thèmes = les 18 thèmes PSE des Cours visuels
     (cours-visuels-core.js, mêmes valeurs) ; moment = quand le jeu sert dans le module. */
  var THEMES = [['sante', 'Santé et soins'], ['corps', 'Corps humain'], ['alimentation', 'Alimentation'], ['sommeil', 'Sommeil et rythmes'], ['sport', 'Activité physique'], ['addictions', 'Addictions'], ['sexualite', 'Vie affective et sexuelle'], ['emotions', 'Émotions'], ['travail', 'Travail et métiers'], ['securite', 'Sécurité et risques'], ['environnement', 'Environnement'], ['argent', 'Argent et consommation'], ['logement', 'Logement'], ['hygiene', 'Hygiène'], ['transport', 'Déplacements'], ['personnes', 'Personnes et famille'], ['ecole', 'École et apprentissage'], ['temps', 'Temps et organisation']].map(function (x) { return { v: x[0], label: x[1] }; });
  var MOMENTS = [['decouverte', 'Découverte du module'], ['revision', 'Révision'], ['bilan', 'Bilan'], ['classe', 'Jeu de classe'], ['escape', 'Escape game']].map(function (x) { return { v: x[0], label: x[1] }; });
  var NIVEAUX = ['CAP', 'Bac Pro', 'CAPa'];
  function rangement(jeu, err) {
    liste(jeu.themes).forEach(function (t) { if (!THEMES.some(function (x) { return x.v === t; })) err.push('thème inconnu : ' + t + ' (thèmes : ' + THEMES.map(function (x) { return x.v; }).join(', ') + ')'); });
    if (jeu.moment && !MOMENTS.some(function (x) { return x.v === jeu.moment; })) err.push('moment inconnu : ' + jeu.moment + ' (' + MOMENTS.map(function (x) { return x.v; }).join(', ') + ')');
    if (jeu.niveau && NIVEAUX.indexOf(jeu.niveau) < 0) err.push('niveau : CAP, Bac Pro ou CAPa');
  }

  /* ---------- Store ---------- */
  function vide() { return { version: 1, jeux: [], dossiers: ['Mes jeux', 'Escape games', 'Propositions'], corbeille: [] }; }
  function lire(brut) { var d; try { d = typeof brut === 'string' ? JSON.parse(brut) : brut; } catch (e) { d = null; } if (!d || !Array.isArray(d.jeux)) d = vide(); if (!Array.isArray(d.dossiers)) d.dossiers = vide().dossiers; if (!Array.isArray(d.corbeille)) d.corbeille = []; return d; }
  function creer(o) {
    o = o || {}; var t = T[o.type];
    var jeu = { id: uid('jeu'), titre: txt(o.titre) || (t ? t.nom : 'Jeu'), type: o.type, module: txt(o.module), niveau: txt(o.niveau), dossier: txt(o.dossier) || (o.type === 'escape' ? 'Escape games' : 'Mes jeux'), consigne: txt(o.consigne), themes: liste(o.themes).map(String), moment: txt(o.moment) || (o.type === 'escape' ? 'escape' : o.type === 'planche' ? 'revision' : ''), graine: txt(o.graine), donnees: o.donnees || (t && t.exemple ? JSON.parse(JSON.stringify(t.exemple)) : {}), sources: liste(o.sources), cree: maintenant(), maj: maintenant(), rev: 1 };
    if (!jeu.graine) jeu.graine = jeu.id;
    return jeu;
  }
  function catalogue() { return Object.keys(T).map(function (k) { var t = T[k]; return { type: k, nom: t.nom, famille: t.famille, inventaire: t.inventaire, resume: t.resume, champs: t.champs, ecran: !!t.ecran, exemple: t.exemple }; }); }

  /* Page HTML autonome (un seul fichier, sans Internet) : scripts = textes de generateurs.js + jeux-core.js + jeux-ecran.js. */
  function pageAutonome(jeu, scripts, cssEcran) {
    var j = JSON.stringify(jeu).replace(/</g, '\\u003c');
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data: blob:; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'"><title>' + esc(jeu.titre) + '</title><style>body{margin:0;background:#F8FAFC}#jeu{max-width:1200px;margin:0 auto;padding:16px}' + CSS + (cssEcran || '') + '</style></head><body><div id="jeu"></div><script>' + String(scripts).replace(/<\/script/gi, '<\\/script') + '</script><script>PSE_JEUX_ECRAN.monter(document.getElementById("jeu"),' + j + ');</script></body></html>';
  }

  var API = { CLE: CLE, THEMES: THEMES, MOMENTS: MOMENTS, NIVEAUX: NIVEAUX, pageAutonome: pageAutonome, TYPES: T, CADENAS: CADENAS, COULEURS: COULEURS, FLECHES: FLECHES, CSS: CSS, valider: valider, fiche: fiche, codeDe: codeDe, codesEscape: codesEscape, codeLisible: codeLisible, codeEtape: codeEtape, typeCadenas: typeCadenas, sousP: sousP, P: P,
    vide: vide, lire: lire, creer: creer, catalogue: catalogue, outils: { esc: esc, srcDe: srcDe, estRef: estRef, norm: norm, alea: alea, melanger: melanger, melangerVraiment: melangerVraiment, lettreDe: lettreDe, img: img, morceaux: morceaux, hacher: hacher, uid: uid, maintenant: maintenant } };
  racine.PSE_JEUX = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
