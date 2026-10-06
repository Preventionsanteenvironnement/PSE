/* Jeux de mots mapse.fr — pendu et mots croisés.
   Données : window.MOTS (assets/mots/<module>.js). Page : <body data-jeu="pendu|croises|meles|lettres|quisuisje|intrus|chrono">.
   Audio désactivé par défaut ; le choix est retenu pour tous les jeux de mots. */
(function () {
  'use strict';
  var M = window.MOTS;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var sansAccent = function (s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase(); };
  var melanger = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var lireMem = function (k, def) { try { var v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } };
  var ecrireMem = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } };
  var annoncer = function (t) { var a = $('annonce'); if (a) { a.textContent = ''; setTimeout(function () { a.textContent = t; }, 30); } };
  var joliMot = function (m) { return m.charAt(0) + m.slice(1).toLowerCase(); };

  /* ───────────── audio (activable, coupable, arrêtable) ───────────── */
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var audioOn = !!lireMem('mapse-jeux-audio', false) && !!synth;
  var voix = null;
  function choisirVoix() {
    if (!synth) return;
    var l = synth.getVoices().filter(function (x) { return /^fr/i.test(x.lang); });
    voix = l.find(function (x) { return /fr-FR/i.test(x.lang) && /(google|natural|online|amélie|thomas|denise|henri)/i.test(x.name); }) || l.find(function (x) { return /fr-FR/i.test(x.lang); }) || l[0] || null;
  }
  if (synth) { choisirVoix(); synth.onvoiceschanged = choisirVoix; }
  function oral(t) {
    return String(t).replace(/dB\(A\)/g, 'décibels A').replace(/(\d) Hz/g, '$1 hertz').replace(/\bHz\b/g, 'hertz')
      .replace(/\bOMS\b/g, 'O M S').replace(/(\d+) €/g, '$1 euros').replace(/(\d+) %/g, '$1 pour cent').replace(/(\d+) h (\d+)/g, '$1 heures $2');
  }
  function majAudio() {
    document.body.classList.toggle('audio-on', audioOn);
    var b = $('aSwitch');
    if (b) { b.setAttribute('aria-pressed', audioOn); b.textContent = audioOn ? '🔊 Audio activé' : '🔇 Audio désactivé'; }
  }
  function majStop(parle) { var s = $('aStop'); if (s) s.hidden = !parle; }
  function lire(t, force) {
    if (!synth || (!audioOn && !force)) return;
    synth.cancel();
    var u = new SpeechSynthesisUtterance(oral(t));
    u.lang = 'fr-FR'; if (voix) u.voice = voix; u.rate = 0.95;
    u.onend = u.onerror = function () { majStop(false); };
    majStop(true);
    synth.speak(u);
  }
  function arreter() { if (synth) synth.cancel(); majStop(false); }
  function barreAudio() {
    var z = $('audio');
    if (!z) return;
    if (!synth) { z.innerHTML = '<span class="etiq" style="color:var(--clair)">Audio indisponible sur ce navigateur</span>'; return; }
    z.innerHTML = '<button type="button" id="aSwitch" aria-pressed="false"></button><button type="button" id="aStop" hidden>⏹ Arrêter</button>';
    $('aSwitch').onclick = function () { audioOn = !audioOn; ecrireMem('mapse-jeux-audio', audioOn); if (!audioOn) arreter(); majAudio(); annoncer(audioOn ? 'Audio activé' : 'Audio désactivé'); };
    $('aStop').onclick = arreter;
    majAudio();
  }
  window.addEventListener('pagehide', arreter);

  function filtres(sel, cb) {
    var opts = [[0, 'Tout le module']].concat(Object.keys(M.seances).map(function (k) { return [+k, 'Séance ' + k]; }));
    var z = $('filtres');
    z.innerHTML = opts.map(function (o) { return '<button type="button" class="puce" data-s="' + o[0] + '" aria-pressed="' + (o[0] === sel) + '" title="' + esc(o[0] ? M.seances[o[0]] : 'Toutes les séances') + '">' + o[1] + '</button>'; }).join('');
    z.querySelectorAll('.puce').forEach(function (b) { b.onclick = function () { arreter(); filtres(+b.dataset.s, cb); cb(+b.dataset.s); }; });
  }
  function blocExpl(N) {
    var t = N.e + (N.x ? ' Dans la situation : ' + N.x : '');
    return '<div class="expl"><div class="expl-tete"><span class="etiq">Pour comprendre</span>' +
      '<button type="button" class="voix" data-lire="' + esc(t) + '" aria-label="Écouter l\'explication">🔊</button></div>' +
      '<p>' + esc(N.e) + '</p>' + (N.x ? '<p class="ex">Dans la situation : ' + esc(N.x) + '</p>' : '') + '</div>';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-lire]');
    if (b) lire(b.getAttribute('data-lire'), true);
  });

  /* ═════════════════════════ PENDU ═════════════════════════ */
  function pendu() {
    var J = M.jauge || [1, 2, 3, 4, 5, 6, 7].map(function (n) { return { v: '', l: 'Erreur ' + n }; });
    var MAX = J.length, CLE = 'mapse-pendu-' + M.cle;
    var pref = lireMem(CLE, { record: 0 });
    var seance = 0, paquet, pos, trouves, serie, ratés, N, vues, erreurs, fini, aides;
    var CLAV = 'AZERTYUIOPQSDFGHJKLMWXCVBN'.split('');

    function stats() {
      $('sScore').textContent = trouves; $('sSerie').textContent = serie; $('sRecord').textContent = pref.record;
      $('sPos').textContent = pos < paquet.length ? (pos + 1) + ' / ' + paquet.length : '';
      $('barre').style.width = (pos / paquet.length * 100) + '%';
    }
    function demarrer(liste) {
      arreter();
      paquet = liste || melanger(M.liste.filter(function (x) { return !seance || x.s === seance; })).slice(0, seance ? 99 : 12);
      pos = 0; trouves = 0; serie = 0; ratés = []; manche();
    }
    function lettres() { return sansAccent(N.m).split('').filter(function (c) { return /[A-Z]/.test(c); }); }
    function gagne() { return lettres().every(function (c) { return vues[c]; }); }

    function svgJauge() {
      var w = 220, h = 190, base = 168, bw = 22, gap = 7, x0 = 14, hmax = 148;
      var couleurs = ['#2FBF71', '#9BCB3C', '#E3C43A', '#F2A33A', '#EE7B3A', '#E2513B', '#B3261E'];
      var s = '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Échelle des niveaux sonores : ' + erreurs + ' erreur' + (erreurs > 1 ? 's' : '') + ' sur ' + MAX + '">';
      s += '<line x1="6" y1="' + base + '" x2="' + (w - 6) + '" y2="' + base + '" stroke="#13302A" stroke-width="3" stroke-linecap="round"/>';
      s += '<text x="6" y="' + (base + 17) + '" font-size="11" fill="#5B7A71" font-family="Atkinson Hyperlegible,Arial">0 ' + esc(M.uniteJauge || '') + '</text>';
      for (var i = 0; i < MAX; i++) {
        var bh = 22 + (hmax - 22) * (i / (MAX - 1)), x = x0 + i * (bw + gap), y = base - bh;
        if (i < erreurs) {
          s += '<g class="' + (i === erreurs - 1 ? 'marche' : '') + '"><rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="5" fill="' + couleurs[Math.min(i, couleurs.length - 1)] + '"/></g>';
          s += '<text x="' + (x + bw / 2) + '" y="' + (y - 5) + '" font-size="10.5" font-weight="700" text-anchor="middle" fill="#13302A" font-family="Atkinson Hyperlegible,Arial">' + esc(J[i].v) + '</text>';
        } else {
          s += '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="' + (bw - 2) + '" height="' + (bh - 2) + '" rx="5" fill="none" stroke="#C9D6CF" stroke-width="2" stroke-dasharray="4 4"/>';
        }
      }
      return s + '</svg>';
    }
    function legende() {
      if (!erreurs) return '<b>0 ' + esc(M.uniteJauge || '') + '</b>Seuil d\'audibilité · aucune erreur';
      var j = J[erreurs - 1];
      return '<b>' + esc(j.v) + ' ' + esc(M.uniteJauge || '') + '</b>' + esc(j.l) + (erreurs >= MAX ? ' — perdu.' : '');
    }
    function majJauge() {
      $('jSvg').innerHTML = svgJauge();
      $('jLeg').innerHTML = legende();
      $('jCh').innerHTML = J.map(function (_, i) { return '<i class="' + (i < MAX - erreurs ? '' : 'perdu') + '"></i>'; }).join('');
      $('jCh').setAttribute('aria-label', (MAX - erreurs) + ' chance' + (MAX - erreurs > 1 ? 's' : '') + ' restante' + (MAX - erreurs > 1 ? 's' : ''));
    }
    function majMot(revele) {
      var mots = N.m.split(' ');
      $('mot').innerHTML = mots.map(function (m) {
        return '<span class="grp">' + m.split('').map(function (c) {
          var b = sansAccent(c);
          if (!/[A-Z]/.test(b)) return '<span class="l p">' + esc(c) + '</span>';
          if (vues[b]) return '<span class="l vu">' + esc(c) + '</span>';
          if (revele) return '<span class="l manque">' + esc(c) + '</span>';
          return '<span class="l"></span>';
        }).join('') + '</span>';
      }).join('');
      var nb = lettres().length;
      $('mot').setAttribute('aria-label', 'Mot de ' + nb + ' lettres : ' + mots.map(function (m) {
        return m.split('').map(function (c) { var b = sansAccent(c); return /[A-Z]/.test(b) ? (vues[b] || revele ? c : 'blanc') : c; }).join(' ');
      }).join(', '));
    }
    function manche() {
      if (pos >= paquet.length) { fin(); return; }
      N = paquet[pos]; vues = {}; erreurs = 0; fini = false; aides = 0;
      $('carte').innerHTML =
        '<div class="pendu"><div class="jauge" aria-live="polite"><div id="jSvg"></div><div><p class="leg" id="jLeg"></p><div class="chances" id="jCh" role="img"></div></div></div>' +
        '<div><div class="etiq">Séance ' + N.s + ' · ' + esc(M.seances[N.s] || '') + '</div>' +
        '<div class="indice"><p class="def" id="def">' + esc(N.d) + '</p><button type="button" class="voix" data-lire="' + esc(N.d) + '" aria-label="Écouter la définition">🔊</button></div>' +
        '<div class="mot" id="mot" role="img"></div>' +
        '<div class="outils"><button type="button" class="aide" id="bAide">💡 Une lettre <small>(coûte 1 chance)</small></button><span class="info" id="info"></span></div>' +
        '<div class="clavier" id="clavier">' + CLAV.map(function (c) { return '<button type="button" class="touche" data-c="' + c + '" aria-label="Lettre ' + c + '">' + c + '</button>'; }).join('') + '</div>' +
        '<div id="apres"></div></div></div>';
      $('clavier').querySelectorAll('.touche').forEach(function (b) { b.onclick = function () { jouer(b.dataset.c); }; });
      $('bAide').onclick = aide;
      majJauge(); majMot(false); majInfo(); stats();
      annoncer('Nouveau mot de ' + lettres().length + ' lettres. Définition : ' + N.d);
      lire(N.d);
    }
    function majInfo() {
      var r = MAX - erreurs;
      $('info').textContent = r + ' chance' + (r > 1 ? 's' : '');
      $('bAide').disabled = fini || r <= 1;
    }
    function aide() {
      if (fini || MAX - erreurs <= 1) return;
      var rest = melanger(lettres().filter(function (c) { return !vues[c]; }));
      if (!rest.length) return;
      aides++; erreurs++; vues[rest[0]] = true;
      var t = document.querySelector('.touche[data-c="' + rest[0] + '"]'); if (t) { t.disabled = true; t.classList.add('ok'); }
      majJauge(); majMot(false); majInfo();
      annoncer('Lettre ' + rest[0] + ' révélée.');
      if (gagne()) terminer(true);
    }
    function jouer(c) {
      if (fini || vues[c] === true || vues[c] === false) return;
      var t = document.querySelector('.touche[data-c="' + c + '"]');
      if (t) t.disabled = true;
      if (lettres().indexOf(c) >= 0) {
        vues[c] = true; if (t) t.classList.add('ok');
        majMot(false);
        var n = lettres().filter(function (x) { return x === c; }).length;
        annoncer('Oui, ' + n + ' fois la lettre ' + c + '.');
        if (gagne()) terminer(true);
      } else {
        vues[c] = false; erreurs++; if (t) t.classList.add('ko');
        if (navigator.vibrate) navigator.vibrate(40);
        majJauge(); majInfo();
        annoncer('Pas de ' + c + '. Il reste ' + (MAX - erreurs) + ' chances.');
        if (erreurs >= MAX) terminer(false);
      }
      majInfo();
    }
    function terminer(ok) {
      fini = true;
      document.querySelectorAll('.touche').forEach(function (b) { b.disabled = true; });
      majInfo();
      if (ok) { trouves++; serie++; if (serie > pref.record) { pref.record = serie; ecrireMem(CLE, pref); } }
      else { serie = 0; ratés.push(N); majMot(true); }
      var titre = ok ? (erreurs === 0 ? '✓ Sans erreur !' : '✓ Trouvé !') : '✗ Le mot était : ' + N.m;
      $('apres').innerHTML = '<div class="bilanmot ' + (ok ? 'ok' : 'ko') + '" role="status"><h3>' + esc(titre) + '</h3>' +
        '<div><b>' + esc(joliMot(N.m)) + '</b> : ' + esc(N.d.charAt(0).toLowerCase() + N.d.slice(1)) + '</div></div>' + blocExpl(N) +
        '<button type="button" class="btn large" id="bSuite">' + (pos < paquet.length - 1 ? 'Mot suivant →' : 'Voir mon résultat') + '</button>';
      $('bSuite').onclick = function () { arreter(); pos++; manche(); window.scrollTo({ top: $('carte').offsetTop - 20, behavior: 'smooth' }); };
      $('bSuite').focus({ preventScroll: true });
      $('apres').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      stats();
      lire((ok ? 'Trouvé. ' : 'Le mot était : ' + N.m + '. ') + N.e + (N.x ? ' Dans la situation : ' + N.x : ''));
    }
    function fin() {
      pos = paquet.length; stats();
      var parfait = trouves === paquet.length;
      $('carte').innerHTML = '<div class="fin"><h2>' + (parfait ? 'Tous trouvés !' : 'Série terminée') + '</h2>' +
        '<div class="gros">' + trouves + '<small> / ' + paquet.length + '</small></div>' +
        '<p>🏆 Record de série : <b>' + pref.record + '</b></p>' +
        (ratés.length ? '<p><b>À revoir :</b></p><ul>' + ratés.map(function (x) { return '<li><b>' + esc(joliMot(x.m)) + '</b> — ' + esc(x.d) + '</li>'; }).join('') + '</ul>' +
          '<button type="button" class="btn large" id="bErr">Rejouer mes ' + ratés.length + ' mot' + (ratés.length > 1 ? 's' : '') + ' manqué' + (ratés.length > 1 ? 's' : '') + '</button>' : '') +
        '<button type="button" class="btn large ' + (ratés.length ? 'sec' : '') + '" id="bRej">Nouvelle série</button></div>';
      if ($('bErr')) { var e = ratés.slice(); $('bErr').onclick = function () { demarrer(melanger(e)); }; }
      $('bRej').onclick = function () { demarrer(); };
      lire(parfait ? 'Bravo, tous les mots sont trouvés.' : 'Série terminée : ' + trouves + ' sur ' + paquet.length + '.');
    }
    document.addEventListener('keydown', function (ev) {
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var k = sansAccent(ev.key || '');
      if (/^[A-Z]$/.test(k) && !fini && N && pos < paquet.length) { ev.preventDefault(); jouer(k); }
      else if (ev.key === 'Enter' && fini && $('bSuite') && document.activeElement !== $('bSuite')) { ev.preventDefault(); $('bSuite').click(); }
    });
    filtres(0, function (s) { seance = s; demarrer(); });
    demarrer();
  }

  /* ═════════════════════════ MOTS CROISÉS ═════════════════════════ */
  function croises() {
    var MAXC = 13, CLE = 'mapse-croises-' + M.cle;
    var seance = 0, G, cases, sel = null, dir = 'h', verifie = false;

    function candidats() {
      return M.liste.filter(function (x) { return (!seance || x.s === seance) && /^[A-ZÀ-Ü]+$/i.test(x.m) && x.m.length >= 3 && x.m.length <= MAXC; })
        .map(function (x) { return { N: x, w: sansAccent(x.m) }; });
    }
    /* placement glouton : chaque mot doit croiser un mot déjà posé ; on garde la meilleure de plusieurs tentatives */
    function essai(liste, cible) {
      var grid = {}, pl = [];
      var get = function (r, c) { return grid[r + ',' + c]; };
      function peut(w, r, c, d) {
        var dr = d === 'v' ? 1 : 0, dc = d === 'h' ? 1 : 0, croise = 0;
        if (get(r - dr, c - dc) || get(r + dr * w.length, c + dc * w.length)) return -1;
        for (var i = 0; i < w.length; i++) {
          var rr = r + dr * i, cc = c + dc * i, g = get(rr, cc);
          if (g) { if (g !== w[i]) return -1; croise++; }
          else if (get(rr + dc, cc + dr) || get(rr - dc, cc - dr)) return -1;
        }
        return croise;
      }
      function poser(o, r, c, d) {
        for (var i = 0; i < o.w.length; i++) grid[(r + (d === 'v' ? i : 0)) + ',' + (c + (d === 'h' ? i : 0))] = o.w[i];
        pl.push({ o: o, r: r, c: c, d: d });
      }
      function bornes(extra) {
        var r0 = 1e9, r1 = -1e9, c0 = 1e9, c1 = -1e9;
        pl.concat(extra ? [extra] : []).forEach(function (p) {
          var L = p.o.w.length - 1;
          r0 = Math.min(r0, p.r); c0 = Math.min(c0, p.c);
          r1 = Math.max(r1, p.r + (p.d === 'v' ? L : 0)); c1 = Math.max(c1, p.c + (p.d === 'h' ? L : 0));
        });
        return { r0: r0, r1: r1, c0: c0, c1: c1 };
      }
      poser(liste[0], 0, 0, Math.random() < 0.5 ? 'h' : 'v');
      for (var k = 1; k < liste.length && pl.length < cible; k++) {
        var o = liste[k], best = null;
        pl.forEach(function (p) {
          for (var i = 0; i < p.o.w.length; i++) {
            for (var j = 0; j < o.w.length; j++) {
              if (p.o.w[i] !== o.w[j]) continue;
              var d = p.d === 'h' ? 'v' : 'h';
              var r = p.d === 'h' ? p.r - j : p.r + i, c = p.d === 'h' ? p.c + i : p.c - j;
              var x = peut(o.w, r, c, d);
              if (x < 1) continue;
              var b = bornes({ o: o, r: r, c: c, d: d });
              if (b.r1 - b.r0 + 1 > MAXC || b.c1 - b.c0 + 1 > MAXC) continue;
              var sc = x * 10 - (b.r1 - b.r0 + b.c1 - b.c0) + Math.random();
              if (!best || sc > best.sc) best = { sc: sc, r: r, c: c, d: d };
            }
          }
        });
        if (best) poser(o, best.r, best.c, best.d);
      }
      var b = bornes();
      pl.forEach(function (p) { p.r -= b.r0; p.c -= b.c0; });
      return { pl: pl, h: b.r1 - b.r0 + 1, w: b.c1 - b.c0 + 1 };
    }
    function generer() {
      var base = candidats(), cible = seance ? Math.min(12, base.length) : 12, meil = null;
      for (var t = 0; t < 60; t++) {
        var l = melanger(base);
        var tete = l.slice(0, cible + 6).sort(function (a, b) { return b.w.length - a.w.length; });
        var g = essai(tete, cible);
        var sc = g.pl.length * 100 - Math.max(g.w, g.h) * 3 - Math.abs(g.w - g.h);
        if (!meil || sc > meil.sc) { meil = g; meil.sc = sc; }
      }
      /* numérotation dans l'ordre de lecture */
      var debuts = {};
      meil.pl.forEach(function (p) { debuts[p.r + ',' + p.c] = 1; });
      var ordre = Object.keys(debuts).map(function (k) { var a = k.split(','); return [+a[0], +a[1]]; }).sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
      var num = {}; ordre.forEach(function (rc, i) { num[rc[0] + ',' + rc[1]] = i + 1; });
      meil.pl.forEach(function (p, i) { p.n = num[p.r + ',' + p.c]; p.id = i; p.ok = false; });
      return meil;
    }
    function caseDe(r, c) { return cases[r + ',' + c]; }
    function motsDe(r, c) { return G.pl.filter(function (p) { var L = p.o.w.length; return p.d === 'h' ? (p.r === r && c >= p.c && c < p.c + L) : (p.c === c && r >= p.r && r < p.r + L); }); }
    function cellules(p) { var a = []; for (var i = 0; i < p.o.w.length; i++) a.push(caseDe(p.r + (p.d === 'v' ? i : 0), p.c + (p.d === 'h' ? i : 0))); return a; }

    function nouvelle() {
      arreter(); verifie = false; sel = null;
      G = generer(); cases = {};
      var H = G.pl.filter(function (p) { return p.d === 'h'; }).sort(function (a, b) { return a.n - b.n; });
      var V = G.pl.filter(function (p) { return p.d === 'v'; }).sort(function (a, b) { return a.n - b.n; });
      var html = '<div class="mc"><div><div class="actif" id="actif" aria-live="polite"><span class="n" id="aN"></span><span class="t" id="aT">Touche une case pour commencer.</span><button type="button" class="voix" id="aV" aria-label="Écouter la définition" hidden>🔊</button></div>' +
        '<div class="grille" id="grille" style="grid-template-columns:repeat(' + G.w + ',1fr)">';
      var nums = {}; G.pl.forEach(function (p) { nums[p.r + ',' + p.c] = p.n; });
      var lettresG = {}; G.pl.forEach(function (p) { for (var i = 0; i < p.o.w.length; i++) lettresG[(p.r + (p.d === 'v' ? i : 0)) + ',' + (p.c + (p.d === 'h' ? i : 0))] = p.o.w[i]; });
      for (var r = 0; r < G.h; r++) for (var c = 0; c < G.w; c++) {
        var k = r + ',' + c;
        if (lettresG[k]) html += '<div class="case c" data-k="' + k + '">' + (nums[k] ? '<span class="num">' + nums[k] + '</span>' : '') +
          '<input autocomplete="off" autocapitalize="characters" spellcheck="false" inputmode="text" aria-label="Ligne ' + (r + 1) + ', colonne ' + (c + 1) + '"></div>';
        else html += '<div class="case" aria-hidden="true"></div>';
      }
      html += '</div><div class="mc-outils"><button type="button" class="btn" id="bVerif">✓ Vérifier</button><button type="button" class="btn sec" id="bLettre">💡 Une lettre</button><button type="button" class="btn sec" id="bMot">Révéler le mot</button><button type="button" class="btn sec" id="bNouv">↻ Nouvelle grille</button></div><div class="mc-msg" id="msg" role="status"></div></div>' +
        '<div class="defs"><h3>Horizontalement →</h3><ol>' + H.map(li).join('') + '</ol><h3>Verticalement ↓</h3><ol>' + V.map(li).join('') + '</ol></div></div>';
      $('carte').innerHTML = html;
      document.querySelectorAll('.case.c').forEach(function (el) {
        var k = el.dataset.k, a = k.split(','), inp = el.querySelector('input');
        cases[k] = { el: el, inp: inp, r: +a[0], c: +a[1], sol: lettresG[k], rev: false };
        inp.addEventListener('focus', function () { choisirCase(+a[0], +a[1], false); cases[k].avant = inp.value; try { inp.select(); } catch (e) { /* sélection impossible */ } });
        inp.addEventListener('mousedown', function (e) { if (document.activeElement === inp) { e.preventDefault(); basculer(); } });
        inp.addEventListener('input', function () { saisir(+a[0], +a[1]); });
        inp.addEventListener('keydown', function (e) { touche(e, +a[0], +a[1]); });
      });
      document.querySelectorAll('.defs li').forEach(function (l) { l.addEventListener('click', function (e) { if (e.target.closest('.voix')) return; var p = G.pl[+l.dataset.id]; dir = p.d; caseDe(p.r, p.c).inp.focus(); choisirCase(p.r, p.c, false); }); });
      $('bVerif').onclick = verifier; $('bLettre').onclick = uneLettre; $('bMot').onclick = reveleMot; $('bNouv').onclick = nouvelle;
      $('aV').onclick = function () { if (sel) lire(sel.o.N.d, true); };
      annoncer('Nouvelle grille de ' + G.pl.length + ' mots.');
    }
    function li(p) {
      return '<li data-id="' + p.id + '" id="d' + p.id + '"><div class="lg"><span class="n">' + p.n + '</span><span class="tx">' + esc(p.o.N.d) + ' <small>(' + p.o.w.length + ')</small></span>' +
        '<button type="button" class="voix" data-lire="' + esc(p.o.N.d) + '" aria-label="Écouter la définition ' + p.n + '">🔊</button></div><div class="ex-zone"></div></li>';
    }
    function choisirCase(r, c, garder) {
      var ms = motsDe(r, c);
      var p = ms.find(function (m) { return m.d === dir; }) || ms[0];
      if (!p) return;
      dir = p.d;
      var nouveau = sel !== p;
      sel = p;
      document.querySelectorAll('.case.mot-actif,.case.foc').forEach(function (x) { x.classList.remove('mot-actif', 'foc'); });
      cellules(p).forEach(function (x) { x.el.classList.add('mot-actif'); });
      caseDe(r, c).el.classList.add('foc');
      document.querySelectorAll('.defs li.sel').forEach(function (x) { x.classList.remove('sel'); });
      $('d' + p.id).classList.add('sel');
      $('aN').textContent = p.n + (p.d === 'h' ? ' →' : ' ↓');
      $('aT').textContent = p.o.N.d + ' (' + p.o.w.length + ' lettres)';
      $('aV').hidden = false;
      if (nouveau && !garder) lire(p.o.N.d);
    }
    function basculer() {
      var f = document.activeElement.closest('.case'); if (!f) return;
      var x = cases[f.dataset.k], ms = motsDe(x.r, x.c);
      if (ms.length > 1) { dir = dir === 'h' ? 'v' : 'h'; choisirCase(x.r, x.c); }
    }
    function bouger(r, c, pas) {
      if (!sel) return;
      var dr = sel.d === 'v' ? pas : 0, dc = sel.d === 'h' ? pas : 0, n = caseDe(r + dr, c + dc);
      if (n) { n.inp.focus(); choisirCase(n.r, n.c, true); }
    }
    function saisir(r, c) {
      var x = caseDe(r, c), v = sansAccent(x.inp.value).replace(/[^A-Z]/g, ''), avant = x.avant || '';
      /* une lettre tapée sur une case pleine remplace l'ancienne ; plusieurs lettres (collage, saisie rapide) se répartissent dans le mot */
      if (v.length === 2 && avant && v.indexOf(avant) >= 0) v = v.replace(avant, '') || avant;
      var suite = v.slice(1).split(''), cur = x;
      x.inp.value = v.charAt(0);
      [x].forEach(function (y) { y.el.classList.remove('faux', 'juste', 'revele'); y.rev = false; y.avant = y.inp.value; });
      while (suite.length && sel) {
        var n = caseDe(cur.r + (sel.d === 'v' ? 1 : 0), cur.c + (sel.d === 'h' ? 1 : 0));
        if (!n) break;
        n.inp.value = suite.shift(); n.avant = n.inp.value; n.rev = false; n.el.classList.remove('faux', 'juste', 'revele'); cur = n;
      }
      if (x.inp.value) bouger(cur.r, cur.c, 1);
      controleMots();
    }
    function touche(e, r, c) {
      var x = caseDe(r, c);
      if (e.key === 'Backspace') {
        if (!x.inp.value) { e.preventDefault(); bouger(r, c, -1); var p = document.activeElement.closest('.case'); if (p) { cases[p.dataset.k].inp.value = ''; cases[p.dataset.k].avant = ''; controleMots(); } }
        return;
      }
      var fl = { ArrowRight: ['h', 1], ArrowLeft: ['h', -1], ArrowDown: ['v', 1], ArrowUp: ['v', -1] }[e.key];
      if (fl) {
        e.preventDefault();
        var n = caseDe(r + (fl[0] === 'v' ? fl[1] : 0), c + (fl[0] === 'h' ? fl[1] : 0));
        if (n) { dir = fl[0]; n.inp.focus(); choisirCase(n.r, n.c); }
      } else if (e.key === ' ' ) { e.preventDefault(); basculer(); }
      else if (e.key === 'Enter') { e.preventDefault(); verifier(); }
    }
    function motJuste(p) { return cellules(p).every(function (x) { return x.inp.value === x.sol; }); }
    function controleMots() {
      var nouveaux = [];
      G.pl.forEach(function (p) {
        var j = motJuste(p);
        if (j && !p.ok) nouveaux.push(p);
        if (!j && p.ok) { p.ok = false; var l = $('d' + p.id); l.classList.remove('fait'); l.querySelector('.ex-zone').innerHTML = ''; }
        if (j) p.ok = true;
      });
      nouveaux.forEach(function (p) {
        var l = $('d' + p.id); l.classList.add('fait');
        l.querySelector('.ex-zone').innerHTML = '<div class="expl"><b>' + esc(joliMot(p.o.N.m)) + '</b> — ' + esc(p.o.N.e) + (p.o.N.x ? '<p class="ex">Dans la situation : ' + esc(p.o.N.x) + '</p>' : '') + '</div>';
        cellules(p).forEach(function (x) { x.el.classList.add('juste'); x.el.classList.remove('faux'); });
        annoncer('Mot ' + p.n + ' juste : ' + p.o.N.m);
        lire(p.o.N.m + '. ' + p.o.N.e);
      });
      if (G.pl.every(function (p) { return p.ok; })) gagne();
    }
    function verifier() {
      var faux = 0, vides = 0;
      Object.keys(cases).forEach(function (k) {
        var x = cases[k];
        if (!x.inp.value) { vides++; return; }
        if (x.inp.value !== x.sol) { faux++; x.el.classList.add('faux'); }
      });
      var m = $('msg');
      if (!faux && !vides) return gagne();
      m.className = 'mc-msg ko';
      m.textContent = (faux ? faux + ' lettre' + (faux > 1 ? 's' : '') + ' à corriger (en rouge)' : 'Aucune erreur pour l\'instant') + (vides ? ' · ' + vides + ' case' + (vides > 1 ? 's' : '') + ' vide' + (vides > 1 ? 's' : '') : '') + '.';
      lire(m.textContent);
    }
    function reveler(x) { x.inp.value = x.sol; x.avant = x.sol; x.rev = true; x.el.classList.add('revele'); x.el.classList.remove('faux'); }
    function uneLettre() {
      var cibles = sel ? cellules(sel) : Object.keys(cases).map(function (k) { return cases[k]; });
      var v = cibles.filter(function (x) { return x.inp.value !== x.sol; });
      if (!v.length) v = Object.keys(cases).map(function (k) { return cases[k]; }).filter(function (x) { return x.inp.value !== x.sol; });
      if (!v.length) return;
      reveler(v[Math.floor(Math.random() * v.length)]); controleMots();
    }
    function reveleMot() {
      if (!sel) { $('msg').className = 'mc-msg ko'; $('msg').textContent = 'Choisis d\'abord une définition ou une case.'; return; }
      cellules(sel).forEach(reveler); controleMots();
    }
    function gagne() {
      var aides = Object.keys(cases).filter(function (k) { return cases[k].rev; }).length;
      var m = $('msg'); m.className = 'mc-msg ok';
      m.innerHTML = '<b>🎉 Grille terminée !</b> ' + G.pl.length + ' notions trouvées' + (aides ? ' (' + aides + ' lettre' + (aides > 1 ? 's' : '') + ' révélée' + (aides > 1 ? 's' : '') + ')' : ', sans aide') + '. Les explications sont sous chaque définition.';
      var rec = lireMem(CLE, { grilles: 0 }); rec.grilles++; ecrireMem(CLE, rec);
      lire('Grille terminée. Bravo.');
    }
    filtres(0, function (s) { seance = s; nouvelle(); });
    nouvelle();
  }

  /* ═════════════ outils communs aux jeux courts ═════════════ */
  function tete(id) {
    return '<div class="jtete"><div class="stat"><b id="' + id + 'S">0</b><small id="' + id + 'L">points</small></div>' +
      '<div class="stat feu"><b id="' + id + 'R">0</b><small>🏆 record</small></div><span class="compte" id="' + id + 'P"></span></div>' +
      '<div class="piste piste-c" aria-hidden="true"><span id="' + id + 'B"></span></div>';
  }
  function pool(seance) { return M.liste.filter(function (x) { return !seance || x.s === seance; }); }
  function voisins(N, n, seance) {
    var meme = melanger(M.liste.filter(function (x) { return x !== N && x.s === N.s; }));
    var autres = melanger(M.liste.filter(function (x) { return x !== N && x.s !== N.s; }));
    return meme.concat(autres).slice(0, n);
  }
  function finSerie(titre, score, total, record, ratés, unite, rejouer, rejouerErr) {
    $('carte').innerHTML = '<div class="fin"><h2>' + esc(titre) + '</h2><div class="gros">' + score + (total ? '<small> / ' + total + '</small>' : '<small> ' + esc(unite) + '</small>') + '</div>' +
      '<p>🏆 Record : <b>' + record + '</b></p>' +
      (ratés.length ? '<p><b>À revoir :</b></p><ul>' + ratés.map(function (x) { return '<li><b>' + esc(joliMot(x.m)) + '</b> — ' + esc(x.d) + '</li>'; }).join('') + '</ul>' : '') +
      (ratés.length && rejouerErr ? '<button type="button" class="btn large" id="bErr">Rejouer mes ' + ratés.length + ' erreur' + (ratés.length > 1 ? 's' : '') + '</button>' : '') +
      '<button type="button" class="btn large ' + (ratés.length && rejouerErr ? 'sec' : '') + '" id="bRej">Nouvelle partie</button></div>';
    if ($('bErr')) { var e = ratés.slice(); $('bErr').onclick = function () { rejouerErr(melanger(e)); }; }
    $('bRej').onclick = function () { rejouer(); };
    $('bRej').focus({ preventScroll: true });
    lire(titre + '. ' + score + (total ? ' sur ' + total : ' ' + unite) + '.');
  }
  function suivant(lib, cb) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'btn large'; b.textContent = lib;
    b.onclick = function () { arreter(); cb(); };
    $('apres').appendChild(b); b.focus({ preventScroll: true });
    $('apres').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ═════════════════════════ MOTS MÊLÉS ═════════════════════════ */
  function meles() {
    var CLE = 'mapse-meles-' + M.cle, pref = lireMem(CLE, { record: 0, mode: 'mots' });
    var seance = 0, T, grille, mots, ancre, glisse, trouves, t0;
    var DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1]];
    var COUL = ['#FFE08A', '#BDE7CF', '#BFD9F6', '#F7C9D9', '#D9CCF5', '#FFD0A8', '#C8EBEA', '#E6E2B4', '#F2C4BE', '#CFE3B8'];
    function construire() {
      T = window.innerWidth < 430 ? 10 : 12;
      var base = pool(seance).filter(function (x) { return /^[A-ZÀ-Ü]+$/.test(x.m) && x.m.length <= T; });
      for (var essai = 0; essai < 80; essai++) {
        var g = [], pl = [], cand = melanger(base);
        for (var r = 0; r < T; r++) g.push(new Array(T).fill(''));
        for (var i = 0; i < cand.length && pl.length < (T === 10 ? 7 : 9); i++) {
          var w = sansAccent(cand[i].m), ok = false;
          for (var k = 0; k < 120 && !ok; k++) {
            var d = DIRS[Math.floor(Math.random() * DIRS.length)], r0 = Math.floor(Math.random() * T), c0 = Math.floor(Math.random() * T);
            var r1 = r0 + d[0] * (w.length - 1), c1 = c0 + d[1] * (w.length - 1);
            if (r1 < 0 || r1 >= T || c1 >= T) continue;
            var libre = true;
            for (var j = 0; j < w.length; j++) { var x = g[r0 + d[0] * j][c0 + d[1] * j]; if (x && x !== w[j]) { libre = false; break; } }
            if (!libre) continue;
            for (j = 0; j < w.length; j++) g[r0 + d[0] * j][c0 + d[1] * j] = w[j];
            pl.push({ N: cand[i], w: w, r: r0, c: c0, d: d, ok: false }); ok = true;
          }
        }
        if (pl.length >= Math.min(base.length, T === 10 ? 6 : 8)) {
          var ALPHA = 'EEEEAAASSIIINNTTRRUULOOCDMP';
          for (r = 0; r < T; r++) for (var c = 0; c < T; c++) if (!g[r][c]) g[r][c] = ALPHA[Math.floor(Math.random() * ALPHA.length)];
          grille = g; mots = pl; return;
        }
      }
    }
    function nouvelle() {
      arreter(); construire(); ancre = null; glisse = false; trouves = 0; t0 = Date.now();
      var h = '<div class="mm"><div><div class="mm-modes" role="group" aria-label="Affichage de la liste">' +
        '<button type="button" class="puce-c" data-m="mots" aria-pressed="' + (pref.mode === 'mots') + '">Mots visibles</button>' +
        '<button type="button" class="puce-c" data-m="defs" aria-pressed="' + (pref.mode === 'defs') + '">Définitions seulement</button></div>' +
        '<p class="consigne">Touche la première lettre puis la dernière lettre d\'un mot (ou fais glisser le doigt). Les mots se lisent → ↓ ↘ ↗.</p>' +
        '<div class="mm-grille" id="mmG" style="grid-template-columns:repeat(' + T + ',1fr)" role="grid" aria-label="Grille de lettres">';
      for (var r = 0; r < T; r++) for (var c = 0; c < T; c++) h += '<button type="button" class="mm-l" data-r="' + r + '" data-c="' + c + '" aria-label="' + grille[r][c] + ', ligne ' + (r + 1) + ' colonne ' + (c + 1) + '">' + grille[r][c] + '</button>';
      h += '</div><div class="mc-msg" id="msg" role="status"></div></div><div class="defs"><h3 id="mmTitre"></h3><ol id="mmListe"></ol></div></div>';
      $('carte').innerHTML = h;
      document.querySelectorAll('.puce-c').forEach(function (b) { b.onclick = function () { pref.mode = b.dataset.m; ecrireMem(CLE, pref); document.querySelectorAll('.puce-c').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); liste(); }; });
      var G = $('mmG');
      G.addEventListener('pointerdown', function (e) { var b = e.target.closest('.mm-l'); if (!b) return; e.preventDefault(); if (ancre && ancre !== b) { valider(ancre, b); return; } ancre = b; glisse = true; marquer(b, b); });
      G.addEventListener('pointermove', function (e) { if (!glisse || !ancre) return; var el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest && el.closest('.mm-l'); if (b) marquer(ancre, b); });
      document.addEventListener('pointerup', finGlisse);
      function finGlisse(e) {
        if (!glisse) return; glisse = false;
        var el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest && el.closest('.mm-l');
        if (b && ancre && b !== ancre) valider(ancre, b);
      }
      G.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var b = e.target.closest('.mm-l'); if (!b) return; e.preventDefault(); if (ancre && ancre !== b) valider(ancre, b); else { ancre = b; marquer(b, b); } } });
      liste();
      annoncer('Nouvelle grille : ' + mots.length + ' notions cachées.');
    }
    function chemin(a, b) {
      var r0 = +a.dataset.r, c0 = +a.dataset.c, r1 = +b.dataset.r, c1 = +b.dataset.c, dr = Math.sign(r1 - r0), dc = Math.sign(c1 - c0);
      var n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
      if (!(r0 === r1 || c0 === c1 || Math.abs(r1 - r0) === Math.abs(c1 - c0))) return null;
      var out = []; for (var i = 0; i <= n; i++) out.push([r0 + dr * i, c0 + dc * i]); return out;
    }
    function marquer(a, b) {
      document.querySelectorAll('.mm-l.sel').forEach(function (x) { x.classList.remove('sel'); });
      var ch = chemin(a, b) || [[+a.dataset.r, +a.dataset.c]];
      ch.forEach(function (p) { var el = document.querySelector('.mm-l[data-r="' + p[0] + '"][data-c="' + p[1] + '"]'); if (el) el.classList.add('sel'); });
    }
    function valider(a, b) {
      var ch = chemin(a, b); ancre = null;
      document.querySelectorAll('.mm-l.sel').forEach(function (x) { x.classList.remove('sel'); });
      if (!ch) return;
      var s = ch.map(function (p) { return grille[p[0]][p[1]]; }).join(''), inv = s.split('').reverse().join('');
      var m = mots.find(function (x) { return !x.ok && (x.w === s || x.w === inv) && cheminDe(x, ch); });
      if (!m) { $('msg').className = 'mc-msg ko'; $('msg').textContent = '« ' + s + ' » ne fait pas partie des notions cachées.'; return; }
      m.ok = true; trouves++;
      var coul = COUL[(trouves - 1) % COUL.length];
      ch.forEach(function (p) { var el = document.querySelector('.mm-l[data-r="' + p[0] + '"][data-c="' + p[1] + '"]'); el.classList.add('fait'); el.style.background = coul; });
      $('msg').className = 'mc-msg ok'; $('msg').innerHTML = '<b>✓ ' + esc(joliMot(m.N.m)) + '</b> — ' + esc(m.N.e);
      liste();
      lire(m.N.m + '. ' + m.N.e);
      if (trouves === mots.length) {
        var sec = Math.round((Date.now() - t0) / 1000);
        if (!pref.record || sec < pref.record) { pref.record = sec; ecrireMem(CLE, pref); }
        $('msg').innerHTML = '<b>🎉 Toutes les notions sont trouvées en ' + duree(sec) + '.</b> Meilleur temps : ' + duree(pref.record) + '. <button type="button" class="btn" id="mmN" style="margin-top:.6rem">↻ Nouvelle grille</button>';
        $('mmN').onclick = nouvelle;
        lire('Bravo, toutes les notions sont trouvées.');
      }
    }
    function cheminDe(x, ch) {
      var cases = []; for (var i = 0; i < x.w.length; i++) cases.push((x.r + x.d[0] * i) + ',' + (x.c + x.d[1] * i));
      var k = ch.map(function (p) { return p.join(','); });
      return cases.join('|') === k.join('|') || cases.join('|') === k.slice().reverse().join('|');
    }
    function duree(s) { return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + (s % 60 < 10 ? '0' : '') + (s % 60) + ' s'; }
    function liste() {
      $('mmTitre').textContent = (pref.mode === 'mots' ? 'Notions à trouver' : 'Définitions') + ' · ' + trouves + ' / ' + mots.length;
      $('mmListe').innerHTML = mots.map(function (x) {
        var lib = pref.mode === 'mots' || x.ok ? '<b>' + esc(joliMot(x.N.m)) + '</b>' + (pref.mode === 'defs' ? ' — ' + esc(x.N.d) : '') : esc(x.N.d) + ' <small>(' + x.w.length + ' lettres)</small>';
        return '<li class="' + (x.ok ? 'fait' : '') + '"><div class="lg"><span class="tx">' + lib + '</span><button type="button" class="voix" data-lire="' + esc(pref.mode === 'mots' || x.ok ? x.N.m + '. ' + x.N.d : x.N.d) + '" aria-label="Écouter">🔊</button></div>' +
          (x.ok ? '<div class="expl">' + esc(x.N.e) + '</div>' : '') + '</li>';
      }).join('');
    }
    filtres(0, function (s) { seance = s; nouvelle(); });
    nouvelle();
  }

  /* ═════════════════════════ LETTRES MÉLANGÉES ═════════════════════════ */
  function lettresMelangees() {
    var CLE = 'mapse-lettres-' + M.cle, pref = lireMem(CLE, { record: 0 });
    var seance = 0, paquet, pos, score, ratés, N, tuiles, rep, aide, fini;
    function demarrer(l) { arreter(); paquet = l || melanger(pool(seance).filter(function (x) { return sansAccent(x.m).replace(/[^A-Z]/g, '').length <= 16; })).slice(0, 10); pos = 0; score = 0; ratés = []; manche(); }
    function cible() { return sansAccent(N.m).replace(/[^A-Z]/g, ''); }
    function manche() {
      if (pos >= paquet.length) { finSerie(score === paquet.length * 2 ? 'Parfait !' : 'Série terminée', score, paquet.length * 2, pref.record, ratés, '', function () { demarrer(); }, demarrer); return; }
      N = paquet[pos]; rep = []; aide = 0; fini = false;
      var w = cible(), m;
      do { m = melanger(w.split('')); } while (m.join('') === w && w.length > 1);
      tuiles = m.map(function (c, i) { return { c: c, i: i, pris: false }; });
      $('carte').innerHTML = tete('lm') + '<div class="etiq">Séance ' + N.s + ' · ' + esc(M.seances[N.s] || '') + '</div>' +
        '<div class="indice"><p class="def">' + esc(N.d) + '</p><button type="button" class="voix" data-lire="' + esc(N.d) + '" aria-label="Écouter la définition">🔊</button></div>' +
        '<p class="consigne">Remets les lettres dans l\'ordre' + (/[ '\-]/.test(N.m) ? ' (' + N.m.split(/[ '\-]/).filter(Boolean).length + ' mots, sans espace ni apostrophe)' : '') + '. Touche une lettre placée pour la retirer.</p>' +
        '<div class="lm-rep" id="lmRep"></div><div class="lm-tuiles" id="lmT"></div>' +
        '<div class="outils"><button type="button" class="aide" id="lmAide">💡 Lettre suivante <small>(−1 point)</small></button><button type="button" class="aide" id="lmEff">↺ Tout effacer</button><button type="button" class="aide" id="lmPasse">Je ne trouve pas</button></div><div id="apres"></div>';
      $('lmAide').onclick = function () { if (fini) return; vider(); aide++; for (var k = 0; k < Math.min(aide, w.length); k++) { var t = tuiles.find(function (x) { return !x.pris && x.c === w[k]; }); t.pris = true; rep.push(t); } dessiner(); controle(); };
      $('lmEff').onclick = function () { if (!fini) { vider(); dessiner(); } };
      $('lmPasse').onclick = function () { if (!fini) terminer(false); };
      dessiner(); majTete(); lire(N.d);
      annoncer('Mot de ' + w.length + ' lettres. Lettres : ' + m.join(', '));
    }
    function vider() { rep = []; tuiles.forEach(function (t) { t.pris = false; }); }
    function majTete() { $('lmS').textContent = score; $('lmR').textContent = pref.record; $('lmP').textContent = (pos + 1) + ' / ' + paquet.length; $('lmB').style.width = (pos / paquet.length * 100) + '%'; }
    function dessiner() {
      var w = cible();
      $('lmRep').innerHTML = w.split('').map(function (_, k) { var t = rep[k]; return '<button type="button" class="lm-case' + (t ? ' pleine' : '') + '" data-k="' + k + '"' + (t ? '' : ' disabled') + ' aria-label="' + (t ? 'Retirer ' + t.c : 'Case vide') + '">' + (t ? t.c : '') + '</button>'; }).join('');
      $('lmT').innerHTML = tuiles.map(function (t, k) { return '<button type="button" class="lm-tuile" data-k="' + k + '"' + (t.pris || fini ? ' disabled' : '') + '>' + t.c + '</button>'; }).join('');
      $('lmT').querySelectorAll('.lm-tuile').forEach(function (b) { b.onclick = function () { var t = tuiles[+b.dataset.k]; if (t.pris || fini) return; t.pris = true; rep.push(t); dessiner(); controle(); var n = $('lmT').querySelector('.lm-tuile:not(:disabled)'); if (n) n.focus({ preventScroll: true }); }; });
      $('lmRep').querySelectorAll('.lm-case.pleine').forEach(function (b) { b.onclick = function () { if (fini) return; var k = +b.dataset.k; rep.splice(k).forEach(function (t) { t.pris = false; }); dessiner(); }; });
    }
    function controle() {
      var w = cible();
      if (rep.length < w.length) return;
      if (rep.map(function (t) { return t.c; }).join('') === w) terminer(true);
      else { $('lmRep').classList.remove('secoue'); void $('lmRep').offsetWidth; $('lmRep').classList.add('secoue'); annoncer('Ce n\'est pas le bon ordre.'); if (navigator.vibrate) navigator.vibrate(40); }
    }
    function terminer(ok) {
      fini = true;
      var pts = ok ? Math.max(0, 2 - aide) : 0; score += pts;
      if (!ok || aide) ratés.push(N);
      if (score > pref.record) { pref.record = score; ecrireMem(CLE, pref); }
      dessiner(); majTete();
      $('apres').innerHTML = '<div class="bilanmot ' + (ok ? 'ok' : 'ko') + '" role="status"><h3>' + (ok ? '✓ ' + esc(N.m) + (pts ? ' · +' + pts + ' point' + (pts > 1 ? 's' : '') : '') : 'Le mot était : ' + esc(N.m)) + '</h3></div>' + blocExpl(N);
      suivant(pos < paquet.length - 1 ? 'Mot suivant →' : 'Voir mon résultat', function () { pos++; manche(); });
      lire((ok ? 'Bravo. ' : 'Le mot était ' + N.m + '. ') + N.e);
    }
    document.addEventListener('keydown', function (e) {
      if (fini || !N || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = sansAccent(e.key || '');
      if (/^[A-Z]$/.test(k)) { var t = tuiles.find(function (x) { return !x.pris && x.c === k; }); if (t) { e.preventDefault(); t.pris = true; rep.push(t); dessiner(); controle(); } }
      else if (e.key === 'Backspace' && rep.length) { e.preventDefault(); rep.pop().pris = false; dessiner(); }
    });
    filtres(0, function (s) { seance = s; demarrer(); });
    demarrer();
  }

  /* ═════════════════════════ QUI SUIS-JE ? ═════════════════════════ */
  function masquer(texte, mot) {
    var vides = { DE: 1, DU: 1, DES: 1, LES: 1, LA: 1, LE: 1, D: 1 };
    var radicaux = sansAccent(mot).split(/[^A-Z]+/).filter(function (t) { return t.length >= 3 && !vides[t]; }).map(function (t) { return t.length <= 4 ? { mot: t } : { rad: t.slice(0, Math.max(4, t.length - 2)) }; });
    /* mot court : seulement le mot entier (et son pluriel) ; mot long : son radical (tympan, tympans…) */
    return String(texte).replace(/[A-Za-zÀ-ÿ]+/g, function (m) {
      var b = sansAccent(m);
      return radicaux.some(function (r) { return r.mot ? (b === r.mot || b === r.mot + 'S') : b.indexOf(r.rad) === 0; }) ? '▢▢▢' : m;
    });
  }
  function quiSuisJe() {
    var CLE = 'mapse-quisuisje-' + M.cle, pref = lireMem(CLE, { record: 0 });
    var seance = 0, paquet, pos, score, ratés, N, niv, fini, opts;
    function demarrer(l) { arreter(); paquet = l || melanger(pool(seance)).slice(0, 10); pos = 0; score = 0; ratés = []; manche(); }
    function indices() {
      var lettres = sansAccent(N.m).replace(/[^A-Z]/g, '').length;
      return [
        { t: 'Je suis une notion de la séance ' + N.s + ' : ' + (M.seances[N.s] || '') + '. ' + masquer(N.e, N.m) },
        { t: masquer(N.d, N.m) },
        { t: 'Je commence par la lettre ' + N.m.charAt(0) + ' et j\'ai ' + lettres + ' lettres' + (N.m.indexOf(' ') > 0 ? ', en ' + N.m.split(' ').length + ' mots' : '') + '.' }
      ];
    }
    function manche() {
      if (pos >= paquet.length) { finSerie(score === paquet.length * 3 ? 'Parfait !' : 'Partie terminée', score, paquet.length * 3, pref.record, ratés, '', function () { demarrer(); }, demarrer); return; }
      N = paquet[pos]; niv = 1; fini = false;
      opts = melanger([N].concat(voisins(N, 3)));
      $('carte').innerHTML = tete('qs') + '<div class="qs-tete"><span class="qs-pts" id="qsPts"></span><span class="etiq">Qui suis-je ?</span></div><ol class="qs-ind" id="qsInd"></ol>' +
        '<div class="outils"><button type="button" class="aide" id="qsPlus">🔎 Indice suivant <small>(−1 point)</small></button></div>' +
        '<div class="opts" id="qsO">' + opts.map(function (o, k) { return '<button type="button" class="opt" data-k="' + k + '">' + esc(joliMot(o.m)) + '</button>'; }).join('') + '</div><div id="apres"></div>';
      $('qsPlus').onclick = function () { if (!fini && niv < 3) { niv++; dessiner(true); } };
      $('qsO').querySelectorAll('.opt').forEach(function (b) { b.onclick = function () { repondre(b, opts[+b.dataset.k]); }; });
      dessiner(true); majTete();
    }
    function majTete() { $('qsS').textContent = score; $('qsR').textContent = pref.record; $('qsP').textContent = (pos + 1) + ' / ' + paquet.length; $('qsB').style.width = (pos / paquet.length * 100) + '%'; }
    function dessiner(parler) {
      var I = indices();
      $('qsInd').innerHTML = I.slice(0, niv).map(function (x, k) { return '<li class="' + (k === niv - 1 ? 'neuf' : '') + '"><span class="qs-n">Indice ' + (k + 1) + '</span><span class="tx">' + esc(x.t) + '</span><button type="button" class="voix" data-lire="' + esc(x.t.replace(/▢▢▢/g, 'blanc')) + '" aria-label="Écouter l\'indice ' + (k + 1) + '">🔊</button></li>'; }).join('');
      var p = 4 - niv;
      $('qsPts').textContent = fini ? '' : 'Vaut ' + p + ' point' + (p > 1 ? 's' : '');
      $('qsPlus').disabled = fini || niv >= 3;
      if (parler) { lire(I[niv - 1].t.replace(/▢▢▢/g, 'blanc')); annoncer('Indice ' + niv + ' : ' + I[niv - 1].t.replace(/▢▢▢/g, 'blanc')); }
    }
    function repondre(b, o) {
      if (fini) return;
      if (o === N) {
        fini = true; var p = 4 - niv; score += p; if (niv > 1) ratés.push(N);
        if (score > pref.record) { pref.record = score; ecrireMem(CLE, pref); }
        b.classList.add('bon'); $('qsO').querySelectorAll('.opt').forEach(function (x) { x.disabled = true; });
        $('apres').innerHTML = '<div class="bilanmot ok" role="status"><h3>✓ ' + esc(joliMot(N.m)) + ' · +' + p + ' point' + (p > 1 ? 's' : '') + '</h3><div>' + esc(N.d) + '</div></div>' + blocExpl(N);
        dessiner(false); majTete();
        suivant(pos < paquet.length - 1 ? 'Notion suivante →' : 'Voir mon résultat', function () { pos++; manche(); });
        lire('Bravo, c\'est ' + N.m + '. ' + N.e);
      } else {
        b.classList.add('mauvais'); b.disabled = true; if (navigator.vibrate) navigator.vibrate(40);
        if (niv < 3) { niv++; dessiner(true); }
        else {
          fini = true; ratés.push(N);
          $('qsO').querySelectorAll('.opt').forEach(function (x) { x.disabled = true; if (opts[+x.dataset.k] === N) x.classList.add('bon'); });
          $('apres').innerHTML = '<div class="bilanmot ko" role="status"><h3>C\'était : ' + esc(joliMot(N.m)) + '</h3><div>' + esc(N.d) + '</div></div>' + blocExpl(N);
          dessiner(false);
          suivant(pos < paquet.length - 1 ? 'Notion suivante →' : 'Voir mon résultat', function () { pos++; manche(); });
          lire('C\'était ' + N.m + '. ' + N.e);
        }
      }
    }
    filtres(0, function (s) { seance = s; demarrer(); });
    demarrer();
  }

  /* ═════════════════════════ INTRUS ═════════════════════════ */
  function intrus() {
    var CLE = 'mapse-intrus-' + M.cle, pref = lireMem(CLE, { record: 0 });
    var parMot = {}; M.liste.forEach(function (x) { parMot[x.m] = x; });
    var F = (M.familles || []).map(function (f, i) { return { l: f.l, i: i, m: f.m.map(function (m) { return parMot[m]; }).filter(Boolean) }; });
    var seance = 0, paquet, pos, score, ratés, Q, fini;
    function familleDe(N) { return F.find(function (f) { return f.m.indexOf(N) >= 0; }); }
    function fabriquer() {
      var fs = F.filter(function (f) { return f.m.filter(function (x) { return !seance || x.s === seance; }).length >= 3; });
      var out = [];
      var tour = []; while (fs.length && tour.length < 10) tour = tour.concat(melanger(fs));
      tour.forEach(function (f) {
        if (out.length >= 10) return;
        var trois = melanger(f.m.filter(function (x) { return !seance || x.s === seance; })).slice(0, 3);
        var autres = M.liste.filter(function (x) { var g = familleDe(x); return g && g !== f && (!seance || x.s === seance); });
        if (!autres.length) autres = M.liste.filter(function (x) { var g = familleDe(x); return g && g !== f; });
        var I = melanger(autres)[0];
        out.push({ f: f, trois: trois, I: I, tout: melanger(trois.concat([I])) });
      });
      return melanger(out);
    }
    function demarrer(l) { arreter(); paquet = l || fabriquer(); pos = 0; score = 0; ratés = []; manche(); }
    function manche() {
      if (pos >= paquet.length) { finSerie(score === paquet.length ? 'Sans faute !' : 'Partie terminée', score, paquet.length, pref.record, ratés.map(function (q) { return q.I; }), '', function () { demarrer(); }, function () { demarrer(melanger(ratés.slice())); }); return; }
      Q = paquet[pos]; fini = false;
      $('carte').innerHTML = tete('in') + '<div class="indice"><p class="def">Trois notions vont ensemble. Laquelle est l\'intruse ?</p><button type="button" class="voix" data-lire="' + esc('Trois notions vont ensemble. Laquelle est l\'intruse ? ' + Q.tout.map(function (x) { return x.m; }).join(', ')) + '" aria-label="Écouter">🔊</button></div>' +
        '<div class="opts in-opts" id="inO">' + Q.tout.map(function (o, k) { return '<button type="button" class="opt" data-k="' + k + '">' + esc(joliMot(o.m)) + '</button>'; }).join('') + '</div><div id="apres"></div>';
      $('inO').querySelectorAll('.opt').forEach(function (b) { b.onclick = function () { repondre(b, Q.tout[+b.dataset.k]); }; });
      $('inS').textContent = score; $('inR').textContent = pref.record; $('inP').textContent = (pos + 1) + ' / ' + paquet.length; $('inB').style.width = (pos / paquet.length * 100) + '%';
      lire('Trouve l\'intrus : ' + Q.tout.map(function (x) { return x.m; }).join(', '));
    }
    function repondre(b, o) {
      if (fini) return; fini = true;
      var ok = o === Q.I; if (ok) score++; else ratés.push(Q);
      if (score > pref.record) { pref.record = score; ecrireMem(CLE, pref); }
      $('inO').querySelectorAll('.opt').forEach(function (x) { x.disabled = true; var y = Q.tout[+x.dataset.k]; if (y === Q.I) x.classList.add('bon'); else if (x === b) x.classList.add('mauvais'); });
      var fI = familleDe(Q.I);
      var txt = Q.trois.map(function (x) { return joliMot(x.m); }).join(', ') + ' : ' + Q.f.l.charAt(0).toLowerCase() + Q.f.l.slice(1) + '. ' + joliMot(Q.I.m) + ' appartient à une autre famille : ' + fI.l.charAt(0).toLowerCase() + fI.l.slice(1) + '.';
      $('apres').innerHTML = '<div class="bilanmot ' + (ok ? 'ok' : 'ko') + '" role="status"><h3>' + (ok ? '✓ Bien vu !' : 'L\'intrus était : ' + esc(joliMot(Q.I.m))) + '</h3><p>' + esc(txt) + '</p></div>' +
        '<div class="expl"><div class="expl-tete"><span class="etiq">L\'intrus</span><button type="button" class="voix" data-lire="' + esc(Q.I.m + ' : ' + Q.I.d) + '" aria-label="Écouter">🔊</button></div><p><b>' + esc(joliMot(Q.I.m)) + '</b> : ' + esc(Q.I.d.charAt(0).toLowerCase() + Q.I.d.slice(1)) + '</p></div>';
      $('inS').textContent = score;
      suivant(pos < paquet.length - 1 ? 'Série suivante →' : 'Voir mon résultat', function () { pos++; manche(); });
      lire((ok ? 'Bien vu. ' : 'L\'intrus était ' + Q.I.m + '. ') + txt);
    }
    filtres(0, function (s) { seance = s; demarrer(); });
    demarrer();
  }

  /* ═════════════════════════ CHRONO 60 SECONDES ═════════════════════════ */
  function chrono() {
    var CLE = 'mapse-chrono-' + M.cle, pref = lireMem(CLE, { record: 0 });
    var DUREE = 60, seance = 0, file, score, ratés, fin, timer, N, opts, bloque;
    function accueil() {
      arreter(); clearInterval(timer);
      $('carte').innerHTML = '<div class="ch-accueil"><div class="ch-gros">60<small> s</small></div><p>Une définition s\'affiche : touche la bonne notion le plus vite possible. Chaque bonne réponse rapporte 1 point ; une erreur fait perdre 3 secondes.</p>' +
        '<p>🏆 Record : <b>' + pref.record + '</b></p><button type="button" class="btn large" id="chGo">▶ Lancer le chrono</button></div>';
      $('chGo').onclick = partir; $('chGo').focus({ preventScroll: true });
    }
    function partir() {
      arreter(); score = 0; ratés = []; file = melanger(pool(seance)); fin = Date.now() + DUREE * 1000;
      $('carte').innerHTML = '<div class="ch-haut"><div class="ch-temps" id="chT" aria-live="off">60</div><div class="stat"><b id="chS">0</b><small>points</small></div></div>' +
        '<div class="piste piste-c ch-piste" aria-hidden="true"><span id="chB" style="width:100%"></span></div>' +
        '<div class="indice"><p class="def" id="chD"></p><button type="button" class="voix" id="chV" aria-label="Écouter la définition">🔊</button></div><div class="opts" id="chO"></div><div class="fb" id="chF" role="status"></div>';
      $('chV').onclick = function () { lire(N.d, true); };
      clearInterval(timer); timer = setInterval(tic, 100); question();
    }
    function tic() {
      var r = Math.max(0, fin - Date.now());
      $('chT').textContent = Math.ceil(r / 1000); $('chB').style.width = (r / DUREE / 10) + '%';
      $('chT').classList.toggle('urgent', r < 10000);
      if (r <= 0) terminer();
    }
    function question() {
      if (!file.length) file = melanger(pool(seance));
      N = file.shift(); bloque = false;
      opts = melanger([N].concat(voisins(N, 2)));
      $('chD').textContent = N.d;
      $('chO').innerHTML = opts.map(function (o, k) { return '<button type="button" class="opt" data-k="' + k + '">' + esc(joliMot(o.m)) + '</button>'; }).join('');
      $('chO').querySelectorAll('.opt').forEach(function (b) { b.onclick = function () { repondre(b, opts[+b.dataset.k]); }; });
    }
    function repondre(b, o) {
      if (bloque) return; bloque = true;
      if (o === N) { score++; b.classList.add('bon'); $('chF').className = 'fb ok'; $('chF').textContent = '✓ ' + joliMot(N.m); }
      else {
        b.classList.add('mauvais'); fin -= 3000; ratés.push(N); if (navigator.vibrate) navigator.vibrate(40);
        $('chO').querySelectorAll('.opt').forEach(function (x) { if (opts[+x.dataset.k] === N) x.classList.add('bon'); });
        $('chF').className = 'fb ko'; $('chF').textContent = '✗ C\'était : ' + joliMot(N.m) + ' (−3 s)';
      }
      $('chS').textContent = score;
      setTimeout(function () { if (Date.now() < fin) question(); }, o === N ? 350 : 1100);
    }
    function terminer() {
      clearInterval(timer);
      var nouveau = score > pref.record; if (nouveau) { pref.record = score; ecrireMem(CLE, pref); }
      var vus = []; ratés.forEach(function (x) { if (vus.indexOf(x) < 0) vus.push(x); });
      finSerie(nouveau ? 'Nouveau record !' : 'Temps écoulé', score, 0, pref.record, vus, score > 1 ? 'points' : 'point', accueil, null);
    }
    filtres(0, function (s) { seance = s; accueil(); });
    accueil();
  }

  barreAudio();
  var jeu = document.body.getAttribute('data-jeu');
  ({ pendu: pendu, croises: croises, meles: meles, lettres: lettresMelangees, quisuisje: quiSuisJe, intrus: intrus, chrono: chrono }[jeu] || function () {})();
})();
