/* cours-autonome.js — moteur des cours en ligne pour le travail en autonomie (mapse.fr)
   La page fournit window.COURS (généré depuis la bibliothèque PSE) et un <main id="contenu">.
   Tout reste sur l'appareil de l'élève : réglages et réponses dans localStorage, rien n'est envoyé. */
(function () {
  'use strict';
  var C = window.COURS;
  if (!C) return;

  var NIVEAUX = [['standard', 'Standard'], ['adapte', 'Adapté'], ['essentiel', 'Essentiel']];
  var TAILLES = [14, 16, 18, 20, 22, 24, 28, 32, 36];
  var PREF = 'pse-cours-reglages';
  var CLE = 'pse-cours-' + C.slug;

  /* ───────────── mémoire locale ───────────── */
  function lireMem(k, def) {
    try { var v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; }
  }
  function ecrireMem(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage refusé */ } }

  var DEFAUT = { taille: 18, police: 'defaut', interligne: '1.6', espace: '0', theme: 'clair',
    vitesse: '1', voix: '', surligner: 'oui', suivre: 'oui' };
  var reg = Object.assign({}, DEFAUT, lireMem(PREF, {}));
  var niveau = lireMem(CLE + '-niveau', 'standard');
  if (!NIVEAUX.some(function (n) { return n[0] === niveau; })) niveau = 'standard';
  var affichage = 'tout';
  var rep = { v: {}, e: {} };
  function chargerRep() {
    rep = lireMem(CLE + '-' + niveau, null) || { v: {}, e: {} };
    rep.v = rep.v || {}; rep.e = rep.e || {};
  }
  var minuterie = null;
  function sauverRep() { clearTimeout(minuterie); minuterie = setTimeout(function () { ecrireMem(CLE + '-' + niveau, rep); }, 250); }

  /* ───────────── texte ───────────── */
  function esc(t) {
    return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function enLigne(t) {
    return esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(«])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  }
  function md(t) {
    var h = '', liste = false;
    String(t || '').split('\n').forEach(function (l0) {
      var l = l0.trim();
      if (/^[•\-–]\s+/.test(l)) {
        if (!liste) { h += '<ul>'; liste = true; }
        h += '<li>' + enLigne(l.replace(/^[•\-–]\s+/, '')) + '</li>';
        return;
      }
      if (liste) { h += '</ul>'; liste = false; }
      if (l) h += '<p>' + enLigne(l) + '</p>';
    });
    if (liste) h += '</ul>';
    return h;
  }
  function oral(t) {
    return String(t || '').replace(/\{\{.+?\}\}/g, ' blanc à compléter, ').replace(/…+/g, ' blanc à compléter, ')
      .replace(/\*\*/g, '').replace(/\*/g, '').replace(/☐/g, 'Proposition : ').replace(/•/g, '')
      .replace(/→/g, ' : ').replace(/\s+/g, ' ').trim();
  }
  function listeReponse(t) {
    var p = String(t || '').split(/\s+[•—]\s+/).filter(Boolean);
    if (p.length < 2) return md(t);
    return '<ul>' + p.map(function (x) { return '<li>' + enLigne(x) + '</li>'; }).join('') + '</ul>';
  }
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/(\d),(\d)/g, '$1.$2').replace(/\.(?!\d)/g, ' ').replace(/[’'`]/g, ' ')
      .replace(/[^a-z0-9.% ]/g, ' ')
      .replace(/\b(le|la|les|l|un|une|des|du|de|d|au|aux|en|a)\b/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function nombres(s) {
    return (String(s || '').match(/\d+(?:[.,]\d+)?/g) || []).map(function (x) { return parseFloat(x.replace(',', '.')); });
  }
  function egal(donne, attendu) {
    var a = norm(donne), b = norm(attendu);
    if (!a || !b) return false;
    if (a === b) return true;
    var na = nombres(donne), nb = nombres(attendu);
    if (nb.length && na.length === nb.length && nb.every(function (x, i) { return Math.abs(x - na[i]) < 1e-9; }) &&
        b.replace(/[\d.%\s]/g, '').length <= 4) return true;
    if (!nb.length && b.length >= 3 && (' ' + a + ' ').indexOf(' ' + b + ' ') >= 0) return true;
    return false;
  }
  function court(t) { var n = norm(t); return n && n.split(' ').length <= 4; }

  /* ───────────── niveaux ───────────── */
  function visible(b) {
    var n = b.data && b.data.niveaux;
    return !(Array.isArray(n) && n.length) || n.indexOf(niveau) >= 0;
  }
  function ch(d, nom, def) {
    var v = (d.variantes || {})[niveau] || {};
    if (nom in v) return v[nom];
    return nom in d ? d[nom] : def;
  }
  function eleve(b) { return b && b.el ? (b.el[niveau] || b.el.standard || {}) : {}; }

  /* ───────────── audio ───────────── */
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var voixFr = [];
  var AUD = {};
  var L = { segs: [], i: 0, etat: 'arret', jeton: 0, btn: null, el: null };

  function chargerVoix() {
    if (!synth) return;
    voixFr = synth.getVoices().filter(function (v) { return /^fr/i.test(v.lang); });
    var s = document.getElementById('r-voix');
    if (!s) return;
    s.innerHTML = '<option value="">Voix automatique</option>' + voixFr.map(function (v) {
      return '<option value="' + esc(v.name) + '"' + (v.name === reg.voix ? ' selected' : '') + '>' + esc(v.name) + '</option>';
    }).join('');
  }
  function decouper(t) {
    var out = [];
    (String(t).match(/[^.!?;:]+[.!?;:]*/g) || []).forEach(function (p) {
      p = p.trim();
      while (p.length > 220) {
        var k = p.lastIndexOf(',', 220); if (k < 60) k = p.lastIndexOf(' ', 220); if (k < 1) k = 220;
        out.push(p.slice(0, k + 1)); p = p.slice(k + 1).trim();
      }
      if (p && /[a-z0-9]/i.test(p)) out.push(p);
    });
    return out;
  }
  function choisirVoix() {
    return voixFr.filter(function (v) { return v.name === reg.voix; })[0] ||
      voixFr.filter(function (v) { return /Thomas|Amélie|Amelie|Audrey|Marie|Google/i.test(v.name); })[0] || voixFr[0] || null;
  }
  function lire(parts, btn) {
    if (!synth) { annoncer('Lecture audio non disponible sur ce navigateur.'); alert('Lecture audio non disponible sur ce navigateur.'); return; }
    if (btn && L.btn === btn) {
      if (L.etat === 'lecture') { pause(); return; }
      if (L.etat === 'pause') { reprendre(); return; }
    }
    arreter();
    parts.forEach(function (p) {
      decouper(oral(p.t)).forEach(function (s) { L.segs.push({ t: s, el: p.el }); });
    });
    if (!L.segs.length) return;
    L.i = 0; L.btn = btn || null; L.etat = 'lecture';
    majLecteur();
    setTimeout(parler, 80);
  }
  function parler() {
    var jeton = ++L.jeton;
    if (L.etat !== 'lecture') return;
    if (L.i >= L.segs.length) { arreter(); return; }
    var s = L.segs[L.i];
    surligner(s.el);
    var u = new SpeechSynthesisUtterance(s.t);
    u.lang = 'fr-FR'; u.rate = parseFloat(reg.vitesse) || 1;
    var v = choisirVoix(); if (v) u.voice = v;
    u.onend = function () { if (jeton !== L.jeton || L.etat !== 'lecture') return; L.i++; parler(); };
    u.onerror = u.onend;
    synth.speak(u);
  }
  function pause() {
    if (L.etat !== 'lecture') return;
    L.etat = 'pause'; L.jeton++; synth.cancel(); majLecteur();
  }
  function reprendre() {
    if (L.etat !== 'pause') return;
    L.etat = 'lecture'; majLecteur(); setTimeout(parler, 80);
  }
  function arreter() {
    L.jeton++;
    if (synth) synth.cancel();
    L.etat = 'arret'; L.segs = []; L.i = 0; L.btn = null;
    surligner(null); majLecteur();
  }
  function surligner(id) {
    if (L.el) L.el.classList.remove('lu');
    L.el = null;
    if (!id || reg.surligner !== 'oui') return;
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add('lu'); L.el = el;
    if (reg.suivre === 'oui') {
      var r = el.getBoundingClientRect();
      if (r.top < 80 || r.bottom > window.innerHeight - 90) el.scrollIntoView({ block: 'center' });
    }
  }
  function majLecteur() {
    var lec = document.getElementById('lecteur');
    if (!lec) return;
    lec.hidden = L.etat === 'arret';
    document.getElementById('lec-etat').textContent = L.etat === 'pause' ? 'Lecture en pause' : 'Lecture en cours';
    var bp = document.getElementById('lec-pause');
    bp.textContent = L.etat === 'pause' ? '▶' : '⏸';
    bp.setAttribute('aria-label', L.etat === 'pause' ? 'Reprendre la lecture' : 'Mettre la lecture en pause');
    document.querySelectorAll('button.audio').forEach(function (b) {
      var actif = b === L.btn && L.etat !== 'arret';
      b.dataset.etat = actif ? L.etat : '';
      b.textContent = !actif ? b.dataset.l : (L.etat === 'lecture' ? '⏸ Pause' : '▶ Reprendre');
      b.setAttribute('aria-pressed', actif ? 'true' : 'false');
    });
  }
  function btnAudio(cle, libelle) {
    var l = libelle || '🔊 Écouter';
    return '<button type="button" class="audio" data-a="' + esc(cle) + '" data-l="' + esc(l) + '" aria-pressed="false">' + esc(l) + '</button>';
  }

  /* ───────────── annonces ───────────── */
  function annoncer(t) {
    var z = document.getElementById('annonce');
    if (!z) return;
    z.textContent = '';
    setTimeout(function () { z.textContent = t; }, 60);
  }

  /* ───────────── images ───────────── */
  function figure(d, fid, titre) {
    if (!d.img) return '';
    var desc = d.img_desc || '';
    AUD[fid] = function () { return [{ t: 'Description de l\'image. ' + desc, el: fid + '-d' }]; };
    return '<figure class="illus" id="' + fid + '">' +
      '<button type="button" class="zoom" data-loupe="' + esc(d.img) + '" aria-label="Agrandir l\'image' + (titre ? ' : ' + esc(titre) : '') + '">' +
      '<img src="' + esc(d.img) + '" alt="' + esc(desc) + '"' + (d.img_w ? ' width="' + d.img_w + '" height="' + d.img_h + '"' : '') + ' loading="lazy"></button>' +
      '<figcaption>' + (desc ? '<details><summary>Description de l\'image</summary><p id="' + fid + '-d">' + esc(desc) + '</p></details>' : '') +
      '<div class="actions">' + (desc ? btnAudio(fid, '🔊 Écouter la description') : '') +
      '<button type="button" data-loupe="' + esc(d.img) + '">🔍 Agrandir</button>' +
      (d.imprimer ? '<a class="lien-btn" href="' + esc(d.img) + '" target="_blank" rel="noopener">🖨️ Ouvrir l\'image pour l\'imprimer</a>' : '') +
      '</div></figcaption></figure>';
  }

  /* ───────────── composants de réponse ───────────── */
  var COMP = {};   // qid -> [composants] ; composant = { verifier(): [{ok, vide, marque}], reveler() }
  var ITEMS = {};  // items d'auto-évaluation
  var QCART = {};  // qid -> { auto, blocId }
  function marquer(el, ok) {
    if (!el) return;
    el.classList.remove('juste', 'faux');
    if (ok === true) el.classList.add('juste');
    if (ok === false) el.classList.add('faux');
  }
  function effacerMarques(zone) {
    zone.querySelectorAll('.juste,.faux').forEach(function (e) { e.classList.remove('juste', 'faux'); });
    zone.querySelectorAll('[aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); });
  }

  /* groupes : [{ label, opts: [texte] }] ; les index des bonnes réponses courent sur l'ensemble des cases */
  function compOptions(qid, groupes, corrects, nomGroupe) {
    var j = 0, html = '';
    groupes.forEach(function (g, gi) {
      var debut = j;
      var bons = g.opts.filter(function (o, k) { return corrects.indexOf(debut + k) >= 0; }).length;
      var multi = groupes.length === 1 ? corrects.length !== 1 : bons !== 1;
      html += '<div class="item" role="group"' + (g.label ? ' aria-label="' + esc(g.label.replace(/\*/g, '')) + '"' : ' aria-label="Propositions"') + '>' +
        (g.label ? '<div class="enonce">' + enLigne(g.label) + '</div>' : '') +
        g.opts.map(function (o) {
          var html1 = '<label class="opt' + (o && typeof o === 'object' && o.photo ? ' opt-photo' : '') + '"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + nomGroupe + '-g' + gi + '" data-j="' + j + '" data-k="' + nomGroupe + '-' + j + '"> ' +
            (o && typeof o === 'object' ? (o.img ? '<img class="opt-img" src="' + esc(o.img) + '" alt="">' : '') + '<span>' + enLigne(o.texte) + '</span>' : '<span>' + enLigne(o) + '</span>') + '</label>';
          j++;
          return html1;
        }).join('') + '</div>';
    });
    function cases(zone) { return zone.querySelectorAll('input[name^="' + nomGroupe + '-g"]'); }
    var c = {
      verifier: function (zone) {
        var coches = [];
        cases(zone).forEach(function (inp) {
          var k = parseInt(inp.getAttribute('data-j'), 10);
          if (inp.checked) coches.push(k);
          marquer(inp.closest('.opt'), inp.checked ? corrects.indexOf(k) >= 0 : null);
        });
        var ok = coches.length === corrects.length && coches.every(function (k) { return corrects.indexOf(k) >= 0; });
        return [{ ok: ok, vide: !coches.length }];
      },
      reveler: function (zone) {
        cases(zone).forEach(function (inp) {
          if (corrects.indexOf(parseInt(inp.getAttribute('data-j'), 10)) >= 0) marquer(inp.closest('.opt'), true);
        });
      },
      auto: true
    };
    return { html: html, comp: c };
  }
  function lireCases(texte) {
    var groupes = [], enonce = [], precedentSimple = false;
    String(texte).split('\n').forEach(function (l) {
      if (l.indexOf('☐') < 0) { enonce.push(l); precedentSimple = false; return; }
      var morceaux = l.split('☐');
      var label = morceaux.shift().trim();
      var opts = morceaux.map(function (s) { return s.trim(); }).filter(Boolean);
      var simple = !label && opts.length === 1;
      if (simple && precedentSimple) groupes[groupes.length - 1].opts.push(opts[0]);
      else groupes.push({ label: label, opts: opts });
      precedentSimple = simple;
    });
    return { groupes: groupes, enonce: enonce.join('\n') };
  }

  function compTrous(texteHtmlAvecJetons, reponses, prefixe) {
    var n = 0;
    var html = texteHtmlAvecJetons.replace(/§TROU§/g, function () {
      var k = prefixe + '-' + (n++);
      return '<label class="sr" for="' + k + '">Blanc ' + n + '</label><input type="text" class="trou" id="' + k + '" data-k="' + k + '" autocomplete="off" spellcheck="false">';
    });
    var total = n;
    var c = {
      auto: reponses && reponses.length === total,
      verifier: function (zone) {
        var res = [];
        for (var i = 0; i < total; i++) {
          var inp = zone.querySelector('#' + CSS.escape(prefixe + '-' + i));
          var alts = String((reponses || [])[i] || '').split('|');
          var ok = alts.some(function (a) { return egal(inp.value, a); });
          if (inp.value.trim()) { marquer(inp, ok); inp.setAttribute('aria-invalid', ok ? 'false' : 'true'); }
          res.push({ ok: ok, vide: !inp.value.trim() });
        }
        return res;
      },
      reveler: function (zone) {
        for (var i = 0; i < total; i++) {
          var inp = zone.querySelector('#' + CSS.escape(prefixe + '-' + i));
          if (!inp || !reponses || !reponses[i]) continue;
          var id = prefixe + '-s' + i;
          if (!document.getElementById(id)) inp.insertAdjacentHTML('afterend', ' <span class="sol" id="' + id + '" style="display:inline">(' + esc(reponses[i].split('|')[0]) + ')</span>');
        }
      }
    };
    return { html: html, comp: c };
  }

  function compTableau(qid, d) {
    var cells = ch(d, 'cells') || [];
    var boites = d.table_student_style === 'boxes';
    var auto = true, lignes = '';
    var cases = [];
    cells.forEach(function (row, ri) {
      var tds = '';
      row.forEach(function (c, ci) {
        var entete = (ri === 0 ? (cells[0][ci] || {}).content : '');
        if (c.type !== 'eleve') {
          tds += ri === 0 ? '<th scope="col">' + md(c.content) + '</th>' : (ci === 0 ? '<th scope="row">' + md(c.content) + '</th>' : '<td class="donne">' + md(c.content) + '</td>');
          return;
        }
        var sol = c.reponse || '';
        var k = qid + '-t' + ri + '-' + ci;
        var nomCase = String((row[0] || {}).content || '').replace(/\*/g, '') + ' — ' + String((cells[0][ci] || {}).content || '').replace(/\*/g, '');
        if (boites || sol === '✕') {
          tds += '<td class="coche"><input type="checkbox" id="' + k + '" data-k="' + k + '" aria-label="' + esc(nomCase) + '"></td>';
          cases.push({ k: k, type: 'case', sol: sol === '✕' });
        } else {
          var estCourt = court(sol);
          if (!estCourt) auto = false;
          tds += '<td class="saisie">' + (estCourt
            ? '<input type="text" id="' + k + '" data-k="' + k + '" aria-label="' + esc(nomCase) + '" autocomplete="off">'
            : '<textarea id="' + k + '" data-k="' + k + '" rows="2" aria-label="' + esc(nomCase) + '"></textarea>') + '</td>';
          cases.push({ k: k, type: estCourt ? 'court' : 'long', sol: sol });
        }
        void entete;
      });
      lignes += '<tr>' + tds + '</tr>';
    });
    var html = '<div class="tabw" tabindex="0" role="region" aria-label="Tableau à compléter"><table class="t">' + lignes + '</table></div>';
    var comp = {
      auto: auto && cases.length > 0,
      interactif: cases.length > 0,
      verifier: function (zone) {
        return cases.filter(function (c) { return c.type !== 'long'; }).map(function (c) {
          var el = zone.querySelector('#' + CSS.escape(c.k));
          if (c.type === 'case') {
            var okc = el.checked === c.sol;
            marquer(el.closest('td'), el.checked || !okc ? okc : null);
            return { ok: okc, vide: false };
          }
          var ok = egal(el.value, c.sol);
          if (el.value.trim()) marquer(el, ok);
          return { ok: ok, vide: !el.value.trim() };
        });
      },
      reveler: function (zone) {
        cases.forEach(function (c) {
          var el = zone.querySelector('#' + CSS.escape(c.k));
          var id = c.k + '-s';
          if (document.getElementById(id)) return;
          var txt = c.type === 'case' ? (c.sol ? '✔ à cocher' : 'à laisser vide') : c.sol;
          el.insertAdjacentHTML('afterend', '<span class="sol" id="' + id + '">Corrigé : ' + esc(txt) + '</span>');
        });
      }
    };
    return { html: html, comp: comp, nbCases: cases.length };
  }

  function compClasser(qid, d) {
    var cats = ch(d, 'categories') || [], items = ch(d, 'items') || [], cl = ch(d, 'classement') || [];
    var html = items.map(function (it, i) {
      var k = qid + '-c' + i;
      return '<div class="item" id="' + k + '-w">' +
        (it && typeof it === 'object' && it.img ? '<img class="item-img" src="' + esc(it.img) + '" alt="' + esc(it.description || it.texte || '') + '" loading="lazy">' : '') +
        '<label class="enonce" for="' + k + '">' + enLigne(libItem(it)) + '</label>' +
        '<select class="choix" id="' + k + '" data-k="' + k + '"><option value="">— Choisir une colonne —</option>' +
        cats.map(function (c, j) { return '<option value="' + j + '">' + esc(c) + '</option>'; }).join('') + '</select></div>';
    }).join('');
    return {
      html: html,
      corrige: '<ul>' + items.map(function (it, i) { return '<li>' + enLigne(libItem(it)) + ' → <strong>' + esc(cats[cl[i]]) + '</strong></li>'; }).join('') + '</ul>',
      corrigeOral: items.map(function (it, i) { return libItem(it) + ' : ' + cats[cl[i]]; }).join('. '),
      comp: {
        auto: true,
        verifier: function (zone) {
          return items.map(function (it, i) {
            var s = zone.querySelector('#' + CSS.escape(qid + '-c' + i));
            var ok = s.value !== '' && parseInt(s.value, 10) === cl[i];
            marquer(s.closest('.item'), s.value === '' ? null : ok);
            return { ok: ok, vide: s.value === '' };
          });
        },
        reveler: function (zone) {
          items.forEach(function (it, i) { marquer(zone.querySelector('#' + CSS.escape(qid + '-c' + i + '-w')), null); });
        }
      }
    };
  }

  function compVraiFaux(qid, d) {
    var items = ch(d, 'items') || [];
    var l1 = d.label1 || 'Vrai', l2 = d.label2 || 'Faux';
    var html = items.map(function (it, i) {
      var nom = qid + '-vf' + i;
      return '<div class="item" id="' + nom + '-w" role="radiogroup" aria-labelledby="' + nom + '-e"><div class="enonce" id="' + nom + '-e">' + enLigne(it.texte) + '</div><div class="vf">' +
        '<label class="opt"><input type="radio" name="' + nom + '" value="vrai" data-k="' + nom + '-0"> <span>' + esc(l1) + '</span></label>' +
        '<label class="opt"><input type="radio" name="' + nom + '" value="faux" data-k="' + nom + '-1"> <span>' + esc(l2) + '</span></label></div></div>';
    }).join('');
    return {
      html: html,
      corrige: '<ul>' + items.map(function (it) { return '<li>' + enLigne(it.texte) + ' → <strong>' + (String(it.answer).toLowerCase() === 'vrai' ? esc(l1) : esc(l2)) + '</strong></li>'; }).join('') + '</ul>',
      corrigeOral: items.map(function (it) { return it.texte + ' : ' + it.answer; }).join('. '),
      comp: {
        auto: true,
        verifier: function (zone) {
          return items.map(function (it, i) {
            var c = zone.querySelector('input[name="' + CSS.escape(qid + '-vf' + i) + '"]:checked');
            var ok = !!c && c.value === String(it.answer).toLowerCase();
            zone.querySelectorAll('input[name="' + CSS.escape(qid + '-vf' + i) + '"]').forEach(function (inp) { marquer(inp.closest('.opt'), inp.checked ? ok : null); });
            return { ok: ok, vide: !c };
          });
        },
        reveler: function (zone) {
          items.forEach(function (it, i) {
            zone.querySelectorAll('input[name="' + CSS.escape(qid + '-vf' + i) + '"]').forEach(function (inp) {
              if (inp.value === String(it.answer).toLowerCase()) marquer(inp.closest('.opt'), true);
            });
          });
        }
      }
    };
  }

  /* relier : gauche[i] va avec droite[i] ; les propositions sont présentées dans l'ordre alphabétique */
  function compRelier(qid, d) {
    var g = ch(d, 'gauche', []) || [], dr = ch(d, 'droite', []) || [];
    var tri = dr.map(function (x, i) { return { t: x, i: i }; }).sort(function (a, b) { return a.t.localeCompare(b.t, 'fr'); });
    var html = g.map(function (it, i) {
      var k = qid + '-r' + i;
      return '<div class="item" id="' + k + '-w"><label class="enonce" for="' + k + '">' + enLigne(it) + '</label>' +
        '<select class="choix" id="' + k + '" data-k="' + k + '"><option value="">— Choisir —</option>' +
        tri.map(function (o) { return '<option value="' + o.i + '">' + esc(o.t) + '</option>'; }).join('') + '</select></div>';
    }).join('');
    return {
      html: html,
      corrige: '<ul>' + g.map(function (it, i) { return '<li>' + enLigne(it) + ' → <strong>' + esc(dr[i]) + '</strong></li>'; }).join('') + '</ul>',
      corrigeOral: g.map(function (it, i) { return it + ' : ' + dr[i]; }).join('. '),
      comp: {
        auto: true,
        verifier: function (zone) {
          return g.map(function (it, i) {
            var s = zone.querySelector('#' + CSS.escape(qid + '-r' + i));
            var ok = s.value !== '' && parseInt(s.value, 10) === i;
            marquer(s.closest('.item'), s.value === '' ? null : ok);
            return { ok: ok, vide: s.value === '' };
          });
        },
        reveler: function () {}
      }
    };
  }

  function compQcmItems(qid, d) {
    var items = ch(d, 'items') || [];
    var html = items.map(function (it, i) {
      var nom = qid + '-m' + i;
      return '<div class="item" role="radiogroup" aria-labelledby="' + nom + '-e">' +
        (it.img ? '<button type="button" class="zoom item-zoom" data-loupe="' + esc(it.img) + '" aria-label="Agrandir la photo"><img class="item-img" src="' + esc(it.img) + '" alt="' + esc(it.description || '') + '" loading="lazy"></button>' : '') +
        '<div class="enonce" id="' + nom + '-e">' + enLigne(it.question) + '</div>' +
        it.options.map(function (o, j) {
          return '<label class="opt"><input type="radio" name="' + nom + '" value="' + j + '" data-k="' + nom + '-' + j + '"> <span>' + enLigne(o) + '</span></label>';
        }).join('') + '</div>';
    }).join('');
    return {
      html: html,
      corrige: '<ul>' + items.map(function (it) { return '<li>' + enLigne(it.question) + ' → <strong>' + enLigne(it.options[it.reponse]) + '</strong></li>'; }).join('') + '</ul>',
      corrigeOral: items.map(function (it) { return it.question + ' ' + it.options[it.reponse]; }).join('. '),
      comp: {
        auto: true,
        verifier: function (zone) {
          return items.map(function (it, i) {
            var c = zone.querySelector('input[name="' + CSS.escape(qid + '-m' + i) + '"]:checked');
            var ok = !!c && parseInt(c.value, 10) === it.reponse;
            zone.querySelectorAll('input[name="' + CSS.escape(qid + '-m' + i) + '"]').forEach(function (inp) { marquer(inp.closest('.opt'), inp.checked ? ok : null); });
            return { ok: ok, vide: !c };
          });
        },
        reveler: function (zone) {
          items.forEach(function (it, i) {
            var inp = zone.querySelectorAll('input[name="' + CSS.escape(qid + '-m' + i) + '"]')[it.reponse];
            if (inp) marquer(inp.closest('.opt'), true);
          });
        }
      }
    };
  }

  /* ───────────── carte question ───────────── */
  function carteQuestion(o) {
    var qid = o.qid;
    COMP[qid] = o.comps;
    var auto = o.comps.length > 0 && o.comps.every(function (c) { return c.auto; });
    QCART[qid] = { auto: auto };
    var el = o.el || {};
    var indice = el.indice || o.indiceSecours || '';
    var expl = el.explication || '';
    AUD[qid] = function () { return [{ t: (o.num ? 'Question ' + o.num + '. ' : '') + o.oral, el: qid + '-txt' }]; };
    AUD[qid + '-i'] = function () { return [{ t: 'Indice. ' + indice, el: qid + '-i' }]; };
    AUD[qid + '-c'] = function () {
      return [{ t: 'Corrigé. ' + (o.corrigeOral || ''), el: qid + '-cr' }].concat(expl ? [{ t: 'Explication. ' + expl, el: qid + '-ex' }] : []);
    };
    return '<div class="q" id="' + qid + '" data-q="' + qid + '">' +
      '<div class="q-tete">' + (o.num ? '<h3 class="q-num">Question ' + esc(o.num) + '</h3>' : '<h3 class="q-num">Question</h3>') +
      (o.comp ? '<span class="q-comp" title="Compétence">' + esc(o.comp) + '</span>' : '') +
      '<span class="q-etat" id="' + qid + '-etat" aria-live="polite"></span></div>' +
      '<div class="q-txt" id="' + qid + '-txt">' + o.texteHtml + '</div>' +
      '<div class="saisie">' + o.saisie + '</div>' +
      '<div class="actions">' + btnAudio(qid, '🔊 Écouter la question') +
      (indice ? '<button type="button" class="indice" data-montrer="' + qid + '-ib" aria-expanded="false" aria-controls="' + qid + '-ib">💡 Indice</button>' : '') +
      (auto ? '<button type="button" class="verif" data-verifier="' + qid + '">✓ Vérifier</button>' : '') +
      '<button type="button" class="corr" data-corrige="' + qid + '" aria-expanded="false" aria-controls="' + qid + '-cb">📘 Corrigé et explication</button></div>' +
      (indice ? '<div class="boite aide" id="' + qid + '-ib" hidden><h4>Indice</h4><p id="' + qid + '-i">' + enLigne(indice) + '</p><div class="actions">' + btnAudio(qid + '-i', '🔊 Écouter l\'indice') + '</div></div>' : '') +
      '<div class="verdict" id="' + qid + '-v" hidden role="status"></div>' +
      '<div id="' + qid + '-cb" hidden>' +
      '<div class="boite corrige"><h4>Corrigé</h4><div id="' + qid + '-cr">' + (o.corrigeHtml || '') + '</div></div>' +
      (expl ? '<div class="boite expl"><h4>Explication</h4><p id="' + qid + '-ex">' + enLigne(expl) + '</p></div>' : '') +
      '<div class="actions">' + btnAudio(qid + '-c', '🔊 Écouter le corrigé') + '</div>' +
      (!auto ? '<div class="auto-pos" role="group" aria-label="Comparaison avec le corrigé"><strong>Comparaison avec le corrigé :</strong><div class="actions">' +
        '<button type="button" class="ok" data-pos="juste" data-q2="' + qid + '" aria-pressed="false">✔ Réponse juste</button>' +
        '<button type="button" class="ko" data-pos="revoir" data-q2="' + qid + '" aria-pressed="false">↺ Réponse à revoir</button></div></div>' : '') +
      '</div></div>';
  }

  function blocAbsorbable(b) {
    if (!b) return false;
    if (b.type === 'tableau') return (ch(b.data, 'cells') || []).some(function (r) { return r.some(function (c) { return c.type === 'eleve'; }); });
    return ['vrai_faux', 'classer', 'qcm', 'texte_trous'].indexOf(b.type) >= 0;
  }

  function rendreQuestion(b, suivant) {
    var d = b.data, qid = 'q-' + b.id;
    var el = eleve(b);
    var texte = ch(d, 'texte', '') || '';
    var lignes = parseInt(ch(d, 'lignes', 0), 10) || 0;
    var comps = [], saisie = '', texteHtml, absorbe = null;
    var corrigeHtml = listeReponse(ch(d, 'reponse_attendue', ''));
    var corrigeOral = ch(d, 'reponse_attendue', '');

    var lc = lireCases(texte);
    var opts = [].concat.apply([], lc.groupes.map(function (g) { return g.opts; }));
    var enonce = lc.enonce;

    if (opts.length) {
      var corrects = Array.isArray(el.choix_corrects) ? el.choix_corrects : opts.map(function (o, j) {
        return norm(corrigeOral).indexOf(norm(o)) >= 0 ? j : -1;
      }).filter(function (j) { return j >= 0; });
      if (!corrects.length) corrects = [0];
      var co = compOptions(qid, lc.groupes, corrects, qid + '-o');
      texteHtml = md(enonce);
      saisie += co.html; comps.push(co.comp);
    } else if (/…/.test(texte)) {
      var jet = md(texte.replace(/…+/g, '§TROU§'));
      var ct = compTrous(jet, el.trous, qid + '-b');
      texteHtml = ct.html;
      if (ct.comp.auto) comps.push(ct.comp); else comps.push({ auto: false, verifier: function () { return []; }, reveler: function () {} });
    } else {
      texteHtml = md(texte);
    }

    if (!opts.length && !/…/.test(texte)) {
      if (d.support_type === 'calcul') {
        saisie += '<label class="calc" for="' + qid + '-calc">Calcul</label><textarea id="' + qid + '-calc" data-k="' + qid + '-calc" rows="3"></textarea>' +
          '<label class="calc" for="' + qid + '-res">Résultat</label><input type="text" id="' + qid + '-res" data-k="' + qid + '-res" autocomplete="off">';
        comps.push({ auto: false, verifier: function () { return []; }, reveler: function () {} });
      } else if (lignes > 0) {
        var n = (ch(d, 'style_lignes', '') === 'tirets_comptage') ? lignes : 1;
        var h = (ch(d, 'style_lignes', '') === 'tirets_comptage') ? (d.lignes_par_reponse || 2) : Math.max(2, lignes);
        for (var i = 0; i < n; i++) {
          saisie += '<label class="sr" for="' + qid + '-r' + i + '">Réponse' + (n > 1 ? ' ' + (i + 1) : '') + '</label>' +
            '<textarea id="' + qid + '-r' + i + '" data-k="' + qid + '-r' + i + '" rows="' + h + '" style="margin:.25rem 0"></textarea>';
        }
        comps.push({ auto: false, verifier: function () { return []; }, reveler: function () {} });
      }
    }

    if (lignes === 0 && d.absorber !== false && blocAbsorbable(suivant)) {
      absorbe = suivant;
      var r = rendreInteraction(qid, suivant);
      saisie += r.html; comps.push(r.comp);
      if (r.corrige && !ch(d, 'reponse_attendue', '')) { corrigeHtml = r.corrige; corrigeOral = r.corrigeOral; }
      if (!el.indice && !el.explication) el = eleve(suivant);
    }
    if (!comps.length) {
      saisie += '<label class="sr" for="' + qid + '-r0">Réponse</label><textarea id="' + qid + '-r0" data-k="' + qid + '-r0" rows="3"></textarea>';
      comps.push({ auto: false, verifier: function () { return []; }, reveler: function () {} });
    }
    return {
      html: carteQuestion({ qid: qid, num: ch(d, 'numero', ''), comp: d.competence, texteHtml: texteHtml, oral: texte + (opts.length ? '' : ''),
        saisie: saisie, comps: comps, el: el, indiceSecours: ch(d, 'indice', ''), corrigeHtml: corrigeHtml, corrigeOral: corrigeOral }),
      absorbe: absorbe
    };
  }

  function rendreInteraction(qid, b) {
    var d = b.data, r;
    if (b.type === 'tableau') { r = compTableau(qid, d); return { html: r.html, comp: r.comp }; }
    if (b.type === 'vrai_faux') { r = compVraiFaux(qid, d); return { html: r.html, comp: r.comp, corrige: r.corrige, corrigeOral: r.corrigeOral }; }
    if (b.type === 'classer') { r = compClasser(qid, d); return { html: r.html, comp: r.comp, corrige: r.corrige, corrigeOral: r.corrigeOral }; }
    if (b.type === 'qcm') { r = compQcmItems(qid, d); return { html: r.html, comp: r.comp, corrige: r.corrige, corrigeOral: r.corrigeOral }; }
    if (b.type === 'relier') { r = compRelier(qid, d); return { html: r.html, comp: r.comp, corrige: r.corrige, corrigeOral: r.corrigeOral }; }
    if (b.type === 'texte_trous') {
      var mots = [];
      var t = String(ch(d, 'texte', '')).replace(/\{\{(.+?)\}\}/g, function (m, w) { mots.push(w); return '§TROU§'; });
      var ct = compTrous(md(t), mots, qid + '-tt');
      return { html: '<div class="item">' + ct.html + '</div>', comp: ct.comp,
        corrige: md(String(ch(d, 'texte', '')).replace(/\{\{(.+?)\}\}/g, '**$1**')),
        corrigeOral: String(ch(d, 'texte', '')).replace(/\{\{(.+?)\}\}/g, '$1') };
    }
    return { html: '', comp: { auto: false, verifier: function () { return []; }, reveler: function () {} } };
  }

  function rendreActiviteCap(b) {
    var d = b.data, qid = 'q-' + b.id, r;
    var consigne = ch(d, 'consigne', '');
    if (b.type === 'situation_qcm' || b.type === 'cocher_exactes') {
      var options = ch(d, b.type === 'cocher_exactes' ? 'items' : 'options', []) || [];
      var corrects = [];
      options.forEach(function (o, j) { if (o.correct) corrects.push(j); });
      var co = compOptions(qid, [{ label: '', opts: options.map(function (o) { return o.img ? { texte: o.texte, img: o.img, photo: o.photo } : o.texte; }) }], corrects, qid + '-o');
      var num = (consigne.match(/^\s*(\d+)\.\s*/) || [])[1] || '';
      var txt = consigne.replace(/^\s*\d+\.\s*/, '');
      return carteQuestion({ qid: qid, num: num, comp: d.competence, texteHtml: md(txt), oral: txt + '. Propositions : ' + options.map(function (o) { return o.texte; }).join(' ; '),
        saisie: co.html, comps: [co.comp], el: eleve(b),
        corrigeHtml: '<ul>' + corrects.map(function (j) { return '<li>' + enLigne(options[j].texte) + '</li>'; }).join('') + '</ul>',
        corrigeOral: corrects.map(function (j) { return options[j].texte; }).join('. ') });
    }
    r = rendreInteraction(qid, b);
    var oralTxt = consigne;
    if (b.type === 'qcm') oralTxt += '. ' + (ch(d, 'items', []) || []).map(function (it) { return it.question + ' Propositions : ' + it.options.join(' ; '); }).join('. ');
    if (b.type === 'classer') oralTxt += '. Colonnes : ' + (ch(d, 'categories', []) || []).join(' ; ') + '. Éléments : ' + (ch(d, 'items', []) || []).map(libItem).join(' ; ');
    if (b.type === 'texte_trous') oralTxt += '. ' + ch(d, 'texte', '');
    if (b.type === 'vrai_faux') oralTxt = 'Vrai ou faux. ' + (ch(d, 'items', []) || []).map(function (it) { return it.texte; }).join(' ');
    return carteQuestion({ qid: qid, num: ch(d, 'numero', ''), comp: d.competence, texteHtml: md(consigne), oral: oralTxt,
      saisie: r.html, comps: [r.comp], el: eleve(b), corrigeHtml: r.corrige, corrigeOral: r.corrigeOral });
  }

  /* ───────────── auto-évaluation (séance et bilan) ───────────── */
  function correctsDe(q) {
    var opts = q.options || [];
    var c = String(q.correct || '');
    var segs = c.indexOf('|') >= 0 ? c.split('|') : (q.type === 'qcm_m' ? c.split(',') : [c]);
    var set = [];
    opts.forEach(function (o, j) { if (segs.some(function (s) { return norm(s) === norm(o); })) set.push(j); });
    var trouves = segs.filter(function (s) { return opts.some(function (o) { return norm(s) === norm(o); }); }).length;
    if (!set.length || trouves < segs.length) {
      set = [];
      opts.forEach(function (o, j) { if (norm(c).indexOf(norm(o)) >= 0) set.push(j); });
    }
    return set;
  }
  function itemEval(q, nom, idx, meta) {
    ITEMS[nom] = { q: q, meta: meta || {} };
    var champ = '';
    if (q.type === 'redige') {
      champ = '<label class="sr" for="' + nom + '">Réponse</label><input type="text" id="' + nom + '" data-k="' + nom + '" autocomplete="off">';
    } else {
      var multi = q.type === 'qcm_m';
      champ = (q.options || []).map(function (o, j) {
        return '<label class="opt"><input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + nom + '" data-k="' + nom + '-' + j + '"> <span>' + enLigne(o) + '</span></label>';
      }).join('');
      if (q.type === 'vf') champ = '<div class="vf">' + champ + '</div>';
      champ = '<div role="group" aria-labelledby="' + nom + '-e">' + champ + '</div>';
    }
    AUD[nom] = function () {
      return [{ t: (idx + 1) + '. ' + q.consigne + ((q.options && q.type !== 'vf') ? '. Propositions : ' + q.options.join(' ; ') : (q.type === 'vf' ? '. Vrai ou faux.' : '')), el: nom + '-e' }];
    };
    AUD[nom + '-x'] = function () {
      var m = ITEMS[nom].meta;
      return [{ t: 'Réponse attendue : ' + q.correct + '. ' + (m.explication || ''), el: nom + '-x' }];
    };
    return '<div class="item" id="' + nom + '-w" data-item="' + nom + '">' +
      '<div class="enonce" id="' + nom + '-e">' + (idx + 1) + '. ' + enLigne(q.consigne) + (q.type === 'qcm_m' ? ' <em>(plusieurs réponses)</em>' : '') + '</div>' + champ +
      '<div class="actions">' + btnAudio(nom, '🔊 Écouter') + '<button type="button" class="verif" data-verif-item="' + nom + '">✓ Vérifier</button></div>' +
      '<div class="verdict" id="' + nom + '-v" hidden role="status"></div>' +
      '<div class="boite expl" id="' + nom + '-xb" hidden><p id="' + nom + '-x"></p><div class="actions">' + btnAudio(nom + '-x', '🔊 Écouter l\'explication') + '</div></div></div>';
  }
  function lienRenvoi(meta) {
    if (!meta || !meta.renvoi) return '';
    if (meta.renvoi_url) return '<a href="' + esc(meta.renvoi_url) + '">' + esc(meta.renvoi) + '</a>';
    return '<a href="#b-' + esc(meta.renvoi_bloc || '') + '" data-renvoi="' + esc(meta.renvoi_bloc || '') + '">' + esc(meta.renvoi) + '</a>';
  }
  function verifierItem(nom, silencieux) {
    var it = ITEMS[nom], q = it.q, m = it.meta;
    var w = document.getElementById(nom + '-w');
    var juste = false, vide = false;
    if (q.type === 'redige') {
      var v = w.querySelector('input[type=text]').value;
      vide = !v.trim();
      var acc = (m.accepte && m.accepte.length) ? m.accepte : [q.correct];
      juste = !vide && acc.some(function (a) { return egal(v, a) || (norm(a).length > 2 && norm(v).indexOf(norm(a)) >= 0); });
      marquer(w.querySelector('input[type=text]'), vide ? null : juste);
    } else {
      var corr = correctsDe(q);
      var inps = w.querySelectorAll('input[name="' + CSS.escape(nom) + '"]');
      var coches = [];
      inps.forEach(function (inp, j) { if (inp.checked) coches.push(j); });
      vide = !coches.length;
      juste = coches.length === corr.length && coches.every(function (j) { return corr.indexOf(j) >= 0; });
      inps.forEach(function (inp, j) {
        marquer(inp.closest('.opt'), inp.checked ? corr.indexOf(j) >= 0 : (corr.indexOf(j) >= 0 ? true : null));
      });
    }
    marquer(w, vide ? false : juste);
    var vd = document.getElementById(nom + '-v');
    vd.hidden = false;
    vd.className = 'verdict ' + (juste ? 'ok' : (vide ? 'mi' : 'ko'));
    vd.textContent = juste ? '✔ Réponse juste.' : (vide ? 'Aucune réponse.' : '✘ Réponse à revoir.');
    var xb = document.getElementById(nom + '-xb');
    xb.hidden = false;
    document.getElementById(nom + '-x').innerHTML = '<strong>Réponse attendue :</strong> ' + enLigne(String(q.correct).replace(/\s*\|\s*/g, ' ; ')) +
      (m.explication ? '<br>' + enLigne(m.explication) : '') + (!juste && m.renvoi ? '<br><strong>À revoir :</strong> ' + lienRenvoi(m) : '');
    rep.e[nom] = juste ? 'juste' : 'revoir';
    sauverRep();
    if (!silencieux) annoncer(vd.textContent);
    return juste;
  }

  function rendreAutoEval(b, seance) {
    var d = b.data, bid = 'ae-' + b.id;
    var qs = ch(d, 'questions', []) || [];
    var enr = b.el || {};
    var metas = enr[niveau] || enr.standard || [];
    var items = qs.map(function (q, i) { return itemEval(q, bid + '-' + i, i, metas[i]); }).join('');
    AUD[bid + '-s'] = function () { return [{ t: document.getElementById(bid + '-score').innerText, el: bid + '-score' }]; };
    return '<section class="carte eval" id="b-' + esc(b.id) + '" aria-labelledby="' + bid + '-h">' +
      '<h3 class="etiq" id="' + bid + '-h">Auto-évaluation' + (seance ? ' — séance ' + esc(seance) : '') + '</h3>' +
      '<div class="corps">' + items +
      '<div class="actions"><button type="button" class="verif" data-score="' + b.id + '">📊 Calculer le score</button>' +
      '<button type="button" data-refaire="' + bid + '">↺ Recommencer</button></div>' +
      '<div class="score" id="' + bid + '-score" hidden tabindex="-1"></div></div></section>';
  }
  function scoreAutoEval(blocId) {
    var b = BLOCS[blocId], bid = 'ae-' + blocId, d = b.data;
    var qs = ch(d, 'questions', []) || [];
    var enr = b.el || {};
    var metas = enr[niveau] || enr.standard || [];
    var justes = 0, revoir = [];
    qs.forEach(function (q, i) {
      if (verifierItem(bid + '-' + i, true)) justes++;
      else if (metas[i] && metas[i].renvoi) revoir.push(metas[i]);
    });
    var n = qs.length;
    var s = enr.seuils || { rouge_max: Math.floor(n * 0.4), orange_max: Math.floor(n * 0.79) };
    var zone = justes <= s.rouge_max ? 'rouge' : (justes <= s.orange_max ? 'orange' : 'vert');
    var msg = zone === 'rouge' ? d.remed_rouge : (zone === 'orange' ? d.remed_orange : d.remed_vert);
    var vus = {};
    revoir = revoir.filter(function (m) { var k = m.renvoi; if (vus[k]) return false; vus[k] = 1; return true; });
    var sc = document.getElementById(bid + '-score');
    sc.hidden = false;
    sc.className = 'score ' + zone;
    sc.innerHTML = '<div class="chiffre">Score : ' + justes + ' / ' + n + '</div>' + (msg ? '<p>' + enLigne(msg) + '</p>' : '') +
      (revoir.length ? '<p><strong>À revoir :</strong></p><ul>' + revoir.map(function (m) { return '<li>' + lienRenvoi(m) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="actions">' + btnAudio(bid + '-s', '🔊 Écouter le résultat') + '</div>';
    rep.e[bid + '-score'] = justes;
    sauverRep();
    sc.focus();
    annoncer('Score : ' + justes + ' sur ' + n);
    majProgression();
  }

  function rendreBilan() {
    var qs = (C.bilan || {})[niveau] || (C.bilan || {}).standard || [];
    if (!qs.length) return '';
    var items = qs.map(function (q, i) { return itemEval(q, 'bilan-' + i, i, q); }).join('');
    AUD['bilan-s'] = function () { return [{ t: document.getElementById('bilan-score').innerText, el: 'bilan-score' }]; };
    return '<section class="seance" id="s-bilan" data-seance="bilan" aria-labelledby="bilan-h">' +
      '<div class="seance-tete"><div class="num">Auto-évaluation finale</div><h2 id="bilan-h">' + esc(C.bilanTitre || ('Bilan du module ' + C.entete.module_code)) + '</h2>' +
      '<div class="obj">Auto-évaluation de l\'ensemble ' + (C.bilanTitre ? 'du cours' : 'du module') + ' : ' + qs.length + ' questions, toutes séances confondues.</div></div>' +
      '<div class="carte eval"><div class="corps">' + items +
      '<div class="actions"><button type="button" class="verif" data-bilan="1">📊 Calculer le score du module</button>' +
      '<button type="button" data-refaire="bilan">↺ Recommencer</button>' +
      '<button type="button" data-imprimer>🖨️ Enregistrer en PDF</button></div>' +
      '<div class="score" id="bilan-score" hidden tabindex="-1"></div></div></div></section>';
  }
  function scoreBilan() {
    var qs = (C.bilan || {})[niveau] || (C.bilan || {}).standard || [];
    var justes = 0, parSeance = {}, notions = {};
    qs.forEach(function (q, i) {
      var ok = verifierItem('bilan-' + i, true);
      if (ok) justes++;
      var s = q.seance || '?';
      parSeance[s] = parSeance[s] || { j: 0, n: 0 };
      parSeance[s].n++; if (ok) parSeance[s].j++;
      var no = q.notion || q.consigne;
      notions[no] = notions[no] || { ok: true, meta: q, seance: s };
      if (!ok) notions[no].ok = false;
    });
    var n = qs.length, pct = n ? justes / n : 0;
    var zone = pct < 0.5 ? 'rouge' : (pct < 0.8 ? 'orange' : 'vert');
    var acquises = [], arevoir = [];
    Object.keys(notions).forEach(function (k) { (notions[k].ok ? acquises : arevoir).push(k); });
    var titres = {};
    C.blocks.forEach(function (b) { if (b.type === 'seance') titres[b.data.numero] = b.data.titre; });
    var sc = document.getElementById('bilan-score');
    sc.hidden = false;
    sc.className = 'score ' + zone;
    sc.innerHTML = '<div class="chiffre">' + (C.bilanTitre ? 'Score' : 'Score du module') + ' : ' + justes + ' / ' + n + '</div>' +
      '<table class="bilan"><caption class="sr">Résultats par séance</caption><thead><tr><th scope="col">Séance</th><th scope="col">Réponses justes</th></tr></thead><tbody>' +
      Object.keys(parSeance).sort().map(function (s) {
        return '<tr><td><a href="#s-' + esc(s) + '" data-renvoi-seance="' + esc(s) + '">Séance ' + esc(s) + (titres[s] ? ' — ' + esc(titres[s]) : '') + '</a></td><td>' + parSeance[s].j + ' / ' + parSeance[s].n + '</td></tr>';
      }).join('') + '</tbody></table>' +
      (arevoir.length ? '<p><strong>Notions à revoir :</strong></p><ul>' + arevoir.map(function (k) {
        return '<li><strong>' + esc(k) + '</strong> — séance ' + esc(notions[k].seance) + (notions[k].meta.renvoi ? ' : ' + lienRenvoi(notions[k].meta) : '') + '</li>';
      }).join('') + '</ul>' : '<p><strong>Toutes les notions du module sont acquises.</strong></p>') +
      (acquises.length && arevoir.length ? '<p><strong>Notions acquises :</strong> ' + acquises.map(esc).join(' ; ') + '.</p>' : '') +
      '<div class="actions">' + btnAudio('bilan-s', '🔊 Écouter le résultat') + '<button type="button" data-imprimer>🖨️ Enregistrer en PDF</button></div>';
    rep.e['bilan-score'] = justes;
    sauverRep();
    if (!Object.keys(QCART).length) validerActivite(n, justes, n, 'Défi terminé : ');
    sc.focus();
    annoncer('Score du module : ' + justes + ' sur ' + n);
    majProgression();
  }

  /* ───────────── images dans les activités, chasse aux dangers, cartes à ordonner ───────────── */
  function libItem(it) { return it && typeof it === 'object' ? (it.texte || it.description || '') : it; }

  var CHASSE = {};
  function compChasse(qid, d) {
    var zones = d.zones || [];
    var toutes = d.trouver === 'toutes';
    CHASSE[qid] = { zones: zones, trouves: {}, toutes: toutes };
    var pieces = d.pieces || [];
    var html = '<div class="chasse">' +
      '<div class="chasse-img" data-q="' + qid + '" role="img" aria-label="' + esc(d.alt || 'Vue de l\'entreprise') + '">' +
      '<img src="' + esc(d.image) + '" alt="" draggable="false"' + (d.img_w ? ' width="' + d.img_w + '" height="' + d.img_h + '"' : '') + '>' +
      '<div class="chasse-calque" id="' + qid + '-calque"></div></div>' +
      '<p class="chasse-info" id="' + qid + '-info" aria-live="polite">' + (toutes ? 'Dangers trouvés : 0 sur ' + zones.length : '') + '</p>' +
      (pieces.length ? '<div class="item"><label class="enonce" for="' + qid + '-piece">Pièce où se trouve ' + (toutes ? 'un danger' : 'le danger') +
        ' (réponse possible sans l\'image)</label><select class="choix" id="' + qid + '-piece" data-k="' + qid + '-piece">' +
        '<option value="">— Choisir une pièce —</option>' + pieces.map(function (p) { return '<option>' + esc(p) + '</option>'; }).join('') + '</select></div>' : '') +
      '</div>';
    var comp = {
      auto: true,
      verifier: function (zone) {
        var s = CHASSE[qid];
        var n = Object.keys(s.trouves).length;
        var sel = zone.querySelector('#' + CSS.escape(qid + '-piece'));
        var okSel = !!(sel && sel.value && zones.some(function (z) { return z.piece === sel.value; }));
        if (sel && sel.value) marquer(sel, okSel);
        var ok = toutes ? n === zones.length : (n > 0 || okSel);
        return [{ ok: ok, vide: n === 0 && !(sel && sel.value) }];
      },
      reveler: function () { zones.forEach(function (z, i) { dessinerZone(qid, i, true); }); }
    };
    return { html: html, comp: comp };
  }
  function dessinerZone(qid, i, revele) {
    var s = CHASSE[qid], c = document.getElementById(qid + '-calque');
    if (!s || !c || c.querySelector('[data-z="' + i + '"]')) return;
    var z = s.zones[i];
    c.insertAdjacentHTML('beforeend', '<div class="zone-danger' + (revele && !s.trouves[i] ? ' revele' : '') + '" data-z="' + i +
      '" style="left:' + z.x + '%;top:' + z.y + '%;width:' + z.w + '%;height:' + z.h + '%"><span>' + esc(z.danger) + '</span></div>');
  }
  function clicChasse(el, ev) {
    var qid = el.getAttribute('data-q'), s = CHASSE[qid];
    if (!s) return;
    var r = el.getBoundingClientRect();
    var px = (ev.clientX - r.left) / r.width * 100, py = (ev.clientY - r.top) / r.height * 100;
    var idx = -1;
    s.zones.forEach(function (z, i) { if (px >= z.x && px <= z.x + z.w && py >= z.y && py <= z.y + z.h) idx = i; });
    var info = document.getElementById(qid + '-info');
    var compte = function () { return s.toutes ? ' Dangers trouvés : ' + Object.keys(s.trouves).length + ' sur ' + s.zones.length + '.' : ''; };
    if (idx < 0) {
      var m = document.createElement('div');
      m.className = 'rate'; m.style.left = px + '%'; m.style.top = py + '%'; m.textContent = '✕';
      document.getElementById(qid + '-calque').appendChild(m);
      setTimeout(function () { if (m.parentNode) m.parentNode.removeChild(m); }, 1400);
      info.textContent = 'Aucun danger à cet endroit.' + compte();
      annoncer(info.textContent);
      return;
    }
    if (!s.trouves[idx]) { s.trouves[idx] = true; dessinerZone(qid, idx, false); }
    var z = s.zones[idx];
    info.textContent = '✔ Danger trouvé : ' + z.danger + ' (' + z.piece + ').' + compte();
    annoncer(info.textContent);
    rep.v[qid + '-z'] = Object.keys(s.trouves).join(',');
    sauverRep();
    if (!s.toutes || Object.keys(s.trouves).length === s.zones.length) verifierQuestion(qid);
  }

  var ETAPES = ['Danger', 'Situation dangereuse', 'Événement déclencheur', 'Dommage'];
  function compOrdre(qid, d) {
    var cartes = d.cartes || [], n = cartes.length;
    var libelles = d.etiquettes || ETAPES;
    var classement = cartes.some(function (c) { return c.etape != null; });
    var bon = function (c, i) { return classement ? c.etape : i; };
    var ordre = (d.melange && d.melange.length === n) ? d.melange
      : (classement ? cartes.map(function (c, i) { return i; }) : cartes.map(function (c, i) { return (i * 3 + 2) % n; }));
    var html = '<div class="cartes-ordre">' + ordre.map(function (ci) {
      var c = cartes[ci], id = qid + '-o' + ci;
      return '<div class="carte-ordre item" id="' + id + '-w">' +
        (c.img ? '<button type="button" class="zoom" data-loupe="' + esc(c.img) + '" aria-label="Agrandir la photo"><img src="' + esc(c.img) +
          '" alt="' + esc(c.description || c.texte || '') + '" loading="lazy"></button>' : '') +
        (c.texte ? '<p class="carte-texte">' + enLigne(c.texte) + '</p>' : '') +
        '<label class="calc" for="' + id + '">Étape</label><select class="choix" id="' + id + '" data-k="' + id + '"><option value="">— Choisir —</option>' +
        libelles.map(function (l, j) { return '<option value="' + j + '">' + (classement ? '' : (j + 1) + '. ') + esc(l) + '</option>'; }).join('') + '</select></div>';
    }).join('') + '</div>';
    return {
      html: html,
      corrige: classement
        ? '<ul>' + cartes.map(function (c, i) { return '<li>' + enLigne(c.texte || c.description || '') + ' → <strong>' + esc(libelles[bon(c, i)]) + '</strong></li>'; }).join('') + '</ul>'
        : '<ol>' + cartes.map(function (c, i) { return '<li><strong>' + esc(libelles[i]) + ' :</strong> ' + enLigne(c.texte || '') + '</li>'; }).join('') + '</ol>',
      corrigeOral: cartes.map(function (c, i) { return (c.texte || c.description || '') + ' : ' + libelles[bon(c, i)]; }).join('. '),
      comp: {
        auto: true,
        verifier: function (zone) {
          return cartes.map(function (c, i) {
            var s = zone.querySelector('#' + CSS.escape(qid + '-o' + i));
            var ok = s.value !== '' && parseInt(s.value, 10) === bon(c, i);
            marquer(s.closest('.item'), s.value === '' ? null : ok);
            return { ok: ok, vide: s.value === '' };
          });
        },
        reveler: function () {}
      }
    };
  }

  /* ───────────── glisser-déposer et memory ───────────── */
  function melanger(n, graine) {
    var a = [], s = (graine % 233280) || 7;
    for (var i = 0; i < n; i++) a.push(i);
    for (var j = n - 1; j > 0; j--) {
      s = (s * 9301 + 49297) % 233280;
      var k = Math.floor(s / 233280 * (j + 1)), t = a[j]; a[j] = a[k]; a[k] = t;
    }
    if (n > 1 && a.every(function (v, i) { return v === i; })) a.push(a.shift());
    return a;
  }
  function graineDe(txt) { var g = 0; for (var c = 0; c < txt.length; c++) g += txt.charCodeAt(c) * (c + 1); return g; }

  var GL = {};
  function compGlisser(qid, d) {
    var cibles = d.cibles || [], pieces = d.pieces || [];
    GL[qid] = { sel: null };
    var ordre = melanger(pieces.length, graineDe(qid));
    var libCible = {};
    cibles.forEach(function (c) { libCible[c.id] = c.label || c.description || ''; });
    var pieceHtml = function (p) {
      return '<button type="button" class="gl-piece' + (p.img ? ' gl-photo' : '') + '" data-piece="' + esc(p.id) + '" data-q="' + qid +
        '" aria-pressed="false" aria-label="' + esc(p.texte || p.description || 'Carte') + '">' +
        (p.img ? '<img src="' + esc(p.img) + '" alt="" draggable="false">' : '') + (p.texte ? '<span>' + enLigne(p.texte) + '</span>' : '') + '</button>';
    };
    var html = '<div class="glisser" id="' + qid + '-gl">' +
      '<div class="gl-titre">Cartes à placer</div>' +
      '<div class="gl-reserve" data-depot="" data-q="' + qid + '" id="' + qid + '-res" tabindex="0" role="button" aria-label="Réserve des cartes">' +
      ordre.map(function (i) { return pieceHtml(pieces[i]); }).join('') + '</div>' +
      '<div class="gl-cibles">' + cibles.map(function (c) {
        return '<div class="gl-cible">' +
          (c.img ? '<img class="gl-cible-img" src="' + esc(c.img) + '" alt="' + esc(c.description || c.label || '') + '" loading="lazy">' : '') +
          '<div class="gl-depot" data-depot="' + esc(c.id) + '" data-q="' + qid + '" tabindex="0" role="button" aria-label="Emplacement : ' + esc(libCible[c.id]) + '"></div>' +
          (c.label ? '<div class="gl-label">' + enLigne(c.label) + '</div>' : '') + '</div>';
      }).join('') + '</div></div>';
    var aPlacer = pieces.filter(function (p) { return p.cible; });
    return {
      html: html,
      corrige: '<ul>' + aPlacer.map(function (p) { return '<li>' + enLigne(p.texte || p.description || '') + ' → <strong>' + esc(libCible[p.cible]) + '</strong></li>'; }).join('') + '</ul>',
      corrigeOral: aPlacer.map(function (p) { return (p.texte || p.description || '') + ' : ' + libCible[p.cible]; }).join('. '),
      comp: {
        auto: true,
        verifier: function (zone) {
          return pieces.map(function (p) {
            var el = zone.querySelector('.gl-piece[data-piece="' + CSS.escape(p.id) + '"]');
            var dep = (el && el.parentNode.getAttribute('data-depot')) || '';
            var ok = dep === (p.cible || '');
            marquer(el, dep || p.cible ? ok : null);
            return { ok: ok, vide: !dep && !!p.cible };
          });
        },
        reveler: function () {}
      }
    };
  }
  function selectionGl(qid, piece) {
    if (!GL[qid]) return;
    document.querySelectorAll('#' + CSS.escape(qid + '-gl') + ' .gl-piece[aria-pressed="true"]').forEach(function (p) { p.setAttribute('aria-pressed', 'false'); });
    GL[qid].sel = piece;
    if (piece) { piece.setAttribute('aria-pressed', 'true'); annoncer('Carte choisie : ' + piece.getAttribute('aria-label') + '. Choisir un emplacement.'); }
  }
  function enregistrerGl(qid) {
    var pl = {};
    document.querySelectorAll('#' + CSS.escape(qid + '-gl') + ' .gl-depot').forEach(function (dp) {
      dp.querySelectorAll('.gl-piece').forEach(function (p) { pl[p.getAttribute('data-piece')] = dp.getAttribute('data-depot'); });
    });
    rep.v[qid + '-pl'] = JSON.stringify(pl);
    sauverRep();
  }
  function placerPiece(qid, piece, depot) {
    if (!piece || !depot) return;
    var reserve = document.getElementById(qid + '-res');
    if (depot.classList.contains('gl-depot')) {
      var deja = depot.querySelector('.gl-piece');
      if (deja && deja !== piece) { reserve.appendChild(deja); deja.classList.remove('juste', 'faux'); }
    }
    depot.appendChild(piece);
    piece.classList.remove('juste', 'faux');
    selectionGl(qid, null);
    enregistrerGl(qid);
    annoncer(piece.getAttribute('aria-label') + (depot.classList.contains('gl-depot') ? ' placée : ' + depot.getAttribute('aria-label').replace('Emplacement : ', '') : ' remise dans la réserve'));
  }
  function restaurerGl(qid) {
    var pl;
    try { pl = JSON.parse(rep.v[qid + '-pl'] || '{}'); } catch (e) { pl = {}; }
    Object.keys(pl).forEach(function (pid) {
      var p = document.querySelector('#' + CSS.escape(qid + '-gl') + ' .gl-piece[data-piece="' + CSS.escape(pid) + '"]');
      var dp = document.querySelector('#' + CSS.escape(qid + '-gl') + ' .gl-depot[data-depot="' + CSS.escape(pl[pid]) + '"]');
      if (p && dp) dp.appendChild(p);
    });
  }

  var MEM = {};
  function compMemory(qid, d) {
    var paires = d.paires || [], cartes = [];
    paires.forEach(function (p, i) { cartes.push({ pr: i, f: p.a }); cartes.push({ pr: i, f: p.b }); });
    var ordre = melanger(cartes.length, graineDe(qid) + 11);
    MEM[qid] = { cartes: cartes, ouvertes: [], trouvees: {}, coups: 0, bloque: false, total: paires.length };
    var html = '<p class="chasse-info" id="' + qid + '-mi" aria-live="polite">Paires trouvées : 0 sur ' + paires.length + ' — coups : 0</p>' +
      '<div class="memory">' + ordre.map(function (ci, k) {
        return '<button type="button" class="mem-carte" data-mem="' + qid + '" data-ci="' + ci + '" aria-label="Carte ' + (k + 1) + ', face cachée">' +
          '<span class="mem-dos" aria-hidden="true">?</span><span class="mem-face" hidden></span></button>';
      }).join('') + '</div>';
    var lib = function (f) { return f.texte || f.description || ''; };
    return {
      html: html,
      corrige: '<ul>' + paires.map(function (p) { return '<li>' + enLigne(lib(p.a)) + ' ↔ <strong>' + enLigne(lib(p.b)) + '</strong></li>'; }).join('') + '</ul>',
      corrigeOral: paires.map(function (p) { return lib(p.a) + ' avec ' + lib(p.b); }).join('. '),
      comp: {
        auto: true,
        verifier: function () { var s = MEM[qid], n = Object.keys(s.trouvees).length; return [{ ok: n === s.total, vide: n === 0 }]; },
        reveler: function (zone) { zone.querySelectorAll('.mem-carte').forEach(function (b) { montrerMem(qid, b, true); }); }
      }
    };
  }
  function montrerMem(qid, b, ouverte) {
    var f = MEM[qid].cartes[parseInt(b.getAttribute('data-ci'), 10)].f;
    var face = b.querySelector('.mem-face'), dos = b.querySelector('.mem-dos');
    if (ouverte) {
      face.innerHTML = (f.img ? '<img src="' + esc(f.img) + '" alt="">' : '') + (f.texte ? '<span>' + enLigne(f.texte) + '</span>' : '');
      face.hidden = false; dos.hidden = true; b.classList.add('ouverte');
      b.setAttribute('aria-label', f.texte || f.description || 'Image');
    } else {
      face.hidden = true; dos.hidden = false; b.classList.remove('ouverte');
      b.setAttribute('aria-label', 'Carte face cachée');
    }
  }
  function clicMemory(b) {
    var qid = b.getAttribute('data-mem'), s = MEM[qid];
    if (!s || s.bloque || b.classList.contains('trouvee') || b.classList.contains('ouverte')) return;
    montrerMem(qid, b, true);
    var f = s.cartes[parseInt(b.getAttribute('data-ci'), 10)].f;
    s.ouvertes.push(b);
    if (s.ouvertes.length < 2) { annoncer(f.texte || f.description || 'Image'); return; }
    s.coups++;
    var a = s.ouvertes[0], c = s.ouvertes[1];
    var info = document.getElementById(qid + '-mi');
    var etat = function () { return 'Paires trouvées : ' + Object.keys(s.trouvees).length + ' sur ' + s.total + ' — coups : ' + s.coups; };
    if (s.cartes[parseInt(a.getAttribute('data-ci'), 10)].pr === s.cartes[parseInt(c.getAttribute('data-ci'), 10)].pr) {
      s.trouvees[s.cartes[parseInt(a.getAttribute('data-ci'), 10)].pr] = true;
      a.classList.add('trouvee'); c.classList.add('trouvee'); s.ouvertes = [];
      info.textContent = '✔ Paire trouvée. ' + etat();
      annoncer(info.textContent);
      if (Object.keys(s.trouvees).length === s.total) verifierQuestion(qid);
    } else {
      s.bloque = true;
      info.textContent = 'Pas de paire. ' + etat();
      annoncer((f.texte || f.description || '') + '. ' + info.textContent);
      setTimeout(function () { montrerMem(qid, a, false); montrerMem(qid, c, false); s.ouvertes = []; s.bloque = false; }, 1400);
    }
  }

  /* ───────────── flashcards ───────────── */
  var FC = {};
  function rendreFlashcards(b) {
    var d = b.data, fid = 'fc-' + b.id, cartes = d.cartes || [];
    FC[fid] = { cartes: cartes, ordre: cartes.map(function (c, i) { return i; }), pos: 0, face: 'recto' };
    AUD[fid] = function () {
      var s = FC[fid], c = s.cartes[s.ordre[s.pos]];
      if (!c) return [];
      return s.face === 'recto' ? [{ t: 'Question. ' + c.recto, el: fid + '-r' }]
        : [{ t: 'Question. ' + c.recto, el: fid + '-r' }, { t: 'Réponse. ' + c.verso, el: fid + '-v' }];
    };
    return '<section class="carte flash" id="b-' + esc(b.id) + '" tabindex="-1" aria-labelledby="' + fid + '-h">' +
      '<h3 class="etiq" id="' + fid + '-h">' + esc(d.titre || 'Flashcards') + ' — ' + cartes.length + ' cartes</h3>' +
      '<div class="corps"><p class="fc-pos" id="' + fid + '-pos" aria-live="polite"></p>' +
      '<div class="fc-carte" id="' + fid + '-carte" tabindex="0" role="button" aria-label="Carte : Entrée pour la retourner, flèches pour changer de carte">' +
      '<div class="fc-recto" id="' + fid + '-r"></div><div class="fc-verso" id="' + fid + '-v" hidden></div></div>' +
      '<div class="actions">' + btnAudio(fid, '🔊 Écouter la carte') +
      '<button type="button" class="verif" data-fc="retourner" data-fid="' + fid + '">🔄 Retourner la carte</button>' +
      '<button type="button" class="ok" data-fc="sue" data-fid="' + fid + '">✔ Carte sue</button>' +
      '<button type="button" class="ko" data-fc="revoir" data-fid="' + fid + '">↺ Carte à revoir</button></div>' +
      '<div class="actions"><button type="button" data-fc="prec" data-fid="' + fid + '">◀ Précédente</button>' +
      '<button type="button" data-fc="suiv" data-fid="' + fid + '">Suivante ▶</button>' +
      '<button type="button" data-fc="melanger" data-fid="' + fid + '">🔀 Mélanger</button>' +
      '<button type="button" data-fc="arevoir" data-fid="' + fid + '">Cartes à revoir seulement</button>' +
      '<button type="button" data-fc="tout" data-fid="' + fid + '">Toutes les cartes</button></div>' +
      '<p class="fc-bilan" id="' + fid + '-bilan" aria-live="polite"></p>' +
      '<details><summary>Liste des ' + cartes.length + ' cartes</summary><dl class="lexique">' +
      cartes.map(function (c) { return '<dt>' + enLigne(c.recto) + '</dt><dd>' + enLigne(c.verso) + '</dd>'; }).join('') +
      '</dl></details></div></section>';
  }
  function majCarte(fid) {
    var s = FC[fid];
    if (!s) return;
    var c = s.cartes[s.ordre[s.pos]];
    var r = document.getElementById(fid + '-r'), v = document.getElementById(fid + '-v');
    if (!r) return;
    if (!c) { r.textContent = 'Aucune carte.'; v.hidden = true; return; }
    r.innerHTML = '<span class="fc-face">Question</span>' + md(c.recto);
    v.innerHTML = '<span class="fc-face">Réponse</span>' + md(c.verso);
    v.hidden = s.face === 'recto';
    var etat = rep.e['fc:' + fid + ':' + s.ordre[s.pos]];
    document.getElementById(fid + '-pos').textContent = 'Carte ' + (s.pos + 1) + ' sur ' + s.ordre.length +
      (etat === 'sue' ? ' — sue' : (etat === 'revoir' ? ' — à revoir' : ''));
    var sues = 0, arev = 0;
    s.cartes.forEach(function (x, i) { var e = rep.e['fc:' + fid + ':' + i]; if (e === 'sue') sues++; if (e === 'revoir') arev++; });
    document.getElementById(fid + '-bilan').textContent = 'Cartes sues : ' + sues + ' sur ' + s.cartes.length + (arev ? ' — cartes à revoir : ' + arev : '');
  }
  function actionCarte(fid, a) {
    var s = FC[fid];
    if (!s || !s.ordre.length) return;
    arreter();
    if (a === 'retourner') {
      s.face = s.face === 'recto' ? 'verso' : 'recto';
      majCarte(fid);
      annoncer(s.face === 'verso' ? 'Réponse affichée' : 'Question affichée');
      return;
    }
    if (a === 'sue' || a === 'revoir') {
      rep.e['fc:' + fid + ':' + s.ordre[s.pos]] = a;
      sauverRep(); majProgression();
      a = 'suiv';
    }
    if (a === 'suiv') { s.pos = (s.pos + 1) % s.ordre.length; s.face = 'recto'; }
    if (a === 'prec') { s.pos = (s.pos - 1 + s.ordre.length) % s.ordre.length; s.face = 'recto'; }
    if (a === 'melanger') {
      for (var i = s.ordre.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = s.ordre[i]; s.ordre[i] = s.ordre[j]; s.ordre[j] = t; }
      s.pos = 0; s.face = 'recto';
    }
    if (a === 'arevoir') {
      var l = s.cartes.map(function (x, k) { return k; }).filter(function (k) { return rep.e['fc:' + fid + ':' + k] === 'revoir'; });
      if (!l.length) { annoncer('Aucune carte à revoir'); document.getElementById(fid + '-bilan').textContent = 'Aucune carte à revoir.'; return; }
      s.ordre = l; s.pos = 0; s.face = 'recto';
    }
    if (a === 'tout') { s.ordre = s.cartes.map(function (x, k) { return k; }); s.pos = 0; s.face = 'recto'; }
    majCarte(fid);
    annoncer(document.getElementById(fid + '-pos').textContent);
  }

  /* ───────────── rendu du cours ───────────── */
  var BLOCS = {};
  C.blocks.forEach(function (b) { BLOCS[b.id] = b; });
  var SEANCE_DE = {};
  (function () {
    var s = '';
    C.blocks.forEach(function (b) { if (b.type === 'seance') s = String(b.data.numero); SEANCE_DE[b.id] = s; });
  })();

  function rendreDoc(b) {
    var d = b.data, id = 'b-' + b.id;
    var titre = (ch(d, 'label', '') ? ch(d, 'label', '') + ' — ' : '') + ch(d, 'titre', '');
    var corps = ch(d, 'corps', '') || '';
    var fig = figure(d, id + '-fig', titre);
    var parts = [{ t: titre, el: id + '-h' }];
    if (corps) parts.push({ t: corps, el: id + '-c' });
    AUD['b:' + b.id] = function () {
      return parts.concat(d.img && d.img_desc ? [{ t: 'Description de l\'image. ' + d.img_desc, el: id + '-fig-d' }] : []);
    };
    var haut = d.image_pos === 'haut';
    return '<article class="carte doc" id="' + id + '" tabindex="-1" aria-labelledby="' + id + '-h">' +
      '<h3 class="etiq" id="' + id + '-h">' + esc(titre) + '</h3>' +
      (haut ? fig : '') + (corps ? '<div class="corps" id="' + id + '-c">' + md(corps) + '</div>' : '') + (!haut ? fig : '') +
      '<div class="corps"><div class="actions">' + btnAudio('b:' + b.id, '🔊 Écouter le document') + '</div></div>' +
      (d.source ? '<div class="src">Source : ' + enLigne(d.source) + '</div>' : '') + '</article>';
  }

  function rendre() {
    arreter();
    AUD = {}; COMP = {}; ITEMS = {}; QCART = {}; FC = {}; CHASSE = {}; GL = {}; MEM = {};
    var e = C.entete, h = '';
    var seances = C.blocks.filter(function (b) { return b.type === 'seance'; });
    h += '<nav class="fil" aria-label="Fil d\'Ariane"><a href="' + esc(C.retour || 'index.html') + '">← Accueil mapse.fr</a> › ' + esc(C.classe) + ' › Module ' + esc(e.module_code) + '</nav>';
    h += '<header class="cours"><div class="surtitre">' + esc(C.classe) + ' · Module ' + esc(e.module_code) + ' · ' + esc(e.annee || '') + '</div>' +
      '<h1 id="titre-cours">' + esc(e.titre) + '</h1><p class="theme">' + esc(e.thematique || '') + '</p>' +
      (e.objectif_general ? '<div class="objectif"><strong>Objectif :</strong> ' + esc(e.objectif_general) + '</div>' : '') + '</header>';
    h += '<nav class="sommaire" aria-labelledby="som-h"><h2 id="som-h">Sommaire</h2><ol>' +
      seances.map(function (s) { return '<li><a href="#s-' + esc(s.data.numero) + '" data-renvoi-seance="' + esc(s.data.numero) + '">Séance ' + esc(s.data.numero) + ' — ' + esc(s.data.titre) + '</a></li>'; }).join('') +
      ((C.bilan && (C.bilan[niveau] || C.bilan.standard)) ? '<li><a href="#s-bilan" data-renvoi-seance="bilan">' + esc(C.bilanTitre || 'Bilan du module') + '</a></li>' : '') + '</ol>' +
      '<div class="progression" id="progression" aria-live="polite"></div></nav>';

    var ouvert = false, seanceCourante = '';
    for (var i = 0; i < C.blocks.length; i++) {
      var b = C.blocks[i], d = b.data, t = b.type;
      if (t === 'entete' || t === 'saut_page') continue;
      if (!visible(b)) continue;
      if (t === 'seance') {
        if (ouvert) h += '</section>';
        seanceCourante = String(d.numero);
        (function (num) {
          AUD['seance-' + num] = function () {
            var parts = [{ t: 'Séance ' + num + '. ' + (BLOCS_SEANCE_TITRE[num] || ''), el: 's-' + num + '-h' }];
            document.querySelectorAll('#s-' + num + ' [data-lecture]').forEach(function (n) {
              var f = AUD[n.getAttribute('data-lecture')];
              if (f) parts = parts.concat(f());
            });
            return parts;
          };
        })(seanceCourante);
        BLOCS_SEANCE_TITRE[seanceCourante] = d.titre;
        h += '<section class="seance" id="s-' + esc(d.numero) + '" data-seance="' + esc(d.numero) + '" tabindex="-1" aria-labelledby="s-' + esc(d.numero) + '-h">' +
          '<div class="seance-tete"><div class="num">Séance ' + esc(d.numero) + '</div><h2 id="s-' + esc(d.numero) + '-h">' + esc(d.titre) + '</h2>' +
          (d.objectif ? '<div class="obj">Objectif : ' + esc(d.objectif) + '</div>' : '') +
          '<div class="actions">' + btnAudio('seance-' + d.numero, '🔊 Écouter toute la séance') + '</div></div>';
        ouvert = true;
        continue;
      }
      var suivant = null;
      for (var j = i + 1; j < C.blocks.length; j++) { if (visible(C.blocks[j]) && C.blocks[j].type !== 'saut_page') { suivant = C.blocks[j]; break; } }

      if (t === 'situation' || (t === 'texte_libre' && /^\s*\*\*La situation/.test(d.texte || ''))) {
        var sid = 'b-' + b.id, st = ch(d, 'texte', '');
        AUD['b:' + b.id] = (function (sid, st, dd) {
          return function () { return [{ t: 'Situation. ' + st, el: sid + '-c' }].concat(dd.img && dd.img_desc ? [{ t: 'Description de l\'image. ' + dd.img_desc, el: sid + '-fig-d' }] : []); };
        })(sid, st, d);
        h += '<article class="carte situation" id="' + sid + '" tabindex="-1" data-lecture="b:' + esc(b.id) + '"><h3 class="etiq">Situation</h3>' +
          '<div class="corps" id="' + sid + '-c">' + md(st) + '</div>' + figure(d, sid + '-fig', 'Situation') +
          '<div class="corps"><div class="actions">' + btnAudio('b:' + b.id, '🔊 Écouter la situation') + '</div></div></article>';
      }
      else if (t === 'texte_libre') {
        if (/^\s*(⚙️|MONTAGE)/.test(d.texte || '')) continue;
        var tid = 'b-' + b.id, tt = ch(d, 'texte', '');
        AUD['b:' + b.id] = (function (tid, tt) { return function () { return [{ t: tt, el: tid + '-c' }]; }; })(tid, tt);
        h += '<div class="carte" id="' + tid + '" data-lecture="b:' + esc(b.id) + '"><div class="corps" id="' + tid + '-c">' + md(tt) + '<div class="actions">' + btnAudio('b:' + b.id, '🔊 Écouter') + '</div></div></div>';
      }
      else if (t === 'analyse' || t === 'separateur') {
        h += '<h3 class="bandeau">' + esc(d.titre) + '</h3>';
      }
      else if (t === 'question_chapeau') {
        h += '<p class="chapeau">' + esc(d.numero) + '. ' + enLigne(ch(d, 'texte', '')) + '</p>';
      }
      else if (t === 'document' || t === 'document_texte_image' || t === 'document_image') {
        h += rendreDoc(b).replace('<article ', '<article data-lecture="b:' + esc(b.id) + '" ');
      }
      else if (t === 'encadre') {
        var eid = 'b-' + b.id, et = ch(d, 'texte', ''), eti = ch(d, 'titre', '');
        AUD['b:' + b.id] = (function (eid, eti, et) { return function () { return [{ t: eti + '. ' + et, el: eid + '-c' }]; }; })(eid, eti, et);
        h += '<aside class="carte encadre" id="' + eid + '" data-lecture="b:' + esc(b.id) + '"><h3 class="etiq">' + esc(eti || 'À retenir') + '</h3>' +
          '<div class="corps" id="' + eid + '-c">' + md(et) + '<div class="actions">' + btnAudio('b:' + b.id, '🔊 Écouter') + '</div></div></aside>';
      }
      else if (t === 'notions') {
        var nid = 'b-' + b.id, its = ch(d, 'items', []) || [];
        AUD['b:' + b.id] = (function (nid, its) {
          return function () { return its.map(function (x, k) { return { t: x.notion + ' : ' + x.definition, el: nid + '-n' + k }; }); };
        })(nid, its);
        h += '<section class="carte notions" id="' + nid + '" tabindex="-1"><h3 class="etiq">' + esc(ch(d, 'titre', '') || 'Notions à retenir') + '</h3>' +
          '<div class="corps"><dl class="lexique">' + its.map(function (x, k) {
            return '<div id="' + nid + '-n' + k + '"><dt>' + esc(x.notion) + '</dt><dd>' + enLigne(x.definition) + '</dd></div>';
          }).join('') + '</dl><div class="actions">' + btnAudio('b:' + b.id, '🔊 Écouter les notions') + '</div></div></section>';
      }
      else if (t === 'question' || t === 'sous_question') {
        var rq = rendreQuestion(b, suivant);
        h += '<div id="b-' + esc(b.id) + '" tabindex="-1" data-lecture="q-' + esc(b.id) + '">' + rq.html + '</div>';
        if (rq.absorbe) { i = C.blocks.indexOf(rq.absorbe); }
      }
      else if (t === 'situation_qcm' || t === 'qcm' || t === 'classer' || t === 'texte_trous' || t === 'vrai_faux' || t === 'relier' || t === 'cocher_exactes') {
        h += '<div id="b-' + esc(b.id) + '" tabindex="-1" data-lecture="q-' + esc(b.id) + '">' + rendreActiviteCap(b) + '</div>';
      }
      else if (t === 'tableau') {
        var tb = compTableau('q-' + b.id, d);
        if (tb.nbCases) {
          var cellsT = ch(d, 'cells') || [];
          var tete = String(((cellsT[0] || [])[0] || {}).content || '').trim();
          var titreT = ch(d, 'titre', '') || (/^DOC\.?\s*\d+/i.test(tete) ? tete.replace(/\s+-\s+/, ' — ') : '');
          var enonceT = titreT ? titreT + ' : **compléter** les cases vides.' : '**Compléter** les cases vides du tableau.';
          var solsT = [];
          cellsT.forEach(function (row, ri) {
            row.forEach(function (c, ci) {
              if (c.type !== 'eleve' || ri === 0) return;
              var lib = String((row[0] || {}).content || '').replace(/\*/g, '') + ((cellsT[0] || []).length > 2 ? ' — ' + String((cellsT[0][ci] || {}).content || '').replace(/\*/g, '') : '');
              solsT.push({ l: lib, s: c.reponse === '✕' ? 'case cochée' : (c.reponse || '') });
            });
          });
          h += '<div id="b-' + esc(b.id) + '" tabindex="-1" data-lecture="q-' + esc(b.id) + '">' + carteQuestion({ qid: 'q-' + b.id, num: '', texteHtml: md(enonceT), oral: enonceT,
            saisie: tb.html, comps: [tb.comp], el: eleve(b),
            corrigeHtml: '<ul>' + solsT.map(function (x) { return '<li>' + enLigne(x.l) + ' : <strong>' + esc(x.s) + '</strong></li>'; }).join('') + '</ul>',
            corrigeOral: solsT.map(function (x) { return x.l + ' : ' + x.s; }).join('. ') }) + '</div>';
        } else {
          h += '<div class="carte" id="b-' + esc(b.id) + '">' + (d.titre ? '<h3 class="etiq">' + esc(d.titre) + '</h3>' : '') + '<div class="corps">' + tb.html + '</div></div>';
        }
      }
      else if (t === 'chasse' || t === 'ordre' || t === 'glisser' || t === 'memory') {
        var qx = 'q-' + b.id;
        var rx = t === 'chasse' ? compChasse(qx, d) : (t === 'ordre' ? compOrdre(qx, d) : (t === 'glisser' ? compGlisser(qx, d) : compMemory(qx, d)));
        var oralX = (d.consigne || '') + (t === 'ordre' ? '. Cartes : ' + (d.cartes || []).map(function (c) { return c.texte || c.description || ''; }).join(' ; ') : (d.alt ? '. ' + d.alt : ''));
        h += '<div id="b-' + esc(b.id) + '" tabindex="-1" data-lecture="' + qx + '">' + carteQuestion({ qid: qx, num: d.numero || '', texteHtml: md(d.consigne || ''),
          oral: oralX, saisie: rx.html, comps: [rx.comp], el: eleve(b),
          corrigeHtml: rx.corrige || listeReponse(d.reponse || ''), corrigeOral: rx.corrigeOral || d.reponse || '' }) + '</div>';
      }
      else if (t === 'flashcards') {
        h += rendreFlashcards(b);
      }
      else if (t === 'auto_eval') {
        h += rendreAutoEval(b, seanceCourante);
      }
    }
    if (ouvert) h += '</section>';
    h += rendreBilan();
    if (C.retourLibelle) {
      h += '<div class="score vert" id="fin-activite" hidden tabindex="-1"><div class="chiffre"></div><div class="actions">' +
        '<a class="lien-btn" href="' + esc(C.retour) + '">← ' + esc(C.retourLibelle) + '</a></div></div>' +
        '<div class="actions retour-bas"><a class="lien-btn" href="' + esc(C.retour) + '">← ' + esc(C.retourLibelle) + '</a></div>';
    }
    if (C.pied) h += '<footer class="pied">' + enLigne(C.pied) + '</footer>';

    var z = document.getElementById('contenu');
    z.innerHTML = h;
    z.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('error', function () {
        var fig = img.closest('.zoom');
        if (fig) fig.outerHTML = '<div class="img-absente">Image non chargée. Description : ' + esc(img.alt) + '</div>';
      });
    });
    restaurer();
    Object.keys(FC).forEach(majCarte);
    validerActivite.chargement = true;
    setTimeout(function () { validerActivite.chargement = false; }, 0);
    Object.keys(GL).forEach(restaurerGl);
    Object.keys(CHASSE).forEach(function (qid) {
      String(rep.v[qid + '-z'] || '').split(',').filter(Boolean).forEach(function (i) {
        CHASSE[qid].trouves[i] = true; dessinerZone(qid, parseInt(i, 10), false);
      });
    });
    appliquerAffichage();
    majProgression();
    remplirAffichage();
  }
  var BLOCS_SEANCE_TITRE = {};

  function restaurer() {
    document.querySelectorAll('#contenu [data-k]').forEach(function (el) {
      var v = rep.v[el.getAttribute('data-k')];
      if (v === undefined) return;
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = !!v; else el.value = v;
    });
    Object.keys(rep.e).forEach(function (k) {
      if (QCART[k]) etatQuestion(k, rep.e[k], true);
    });
  }

  /* ───────────── état et progression ───────────── */
  function etatQuestion(qid, etat, silencieux) {
    var q = document.getElementById(qid);
    if (!q) return;
    q.classList.remove('fait-juste', 'fait-revoir');
    q.classList.add(etat === 'juste' ? 'fait-juste' : 'fait-revoir');
    var e = document.getElementById(qid + '-etat');
    if (e) e.textContent = etat === 'juste' ? '✔ Juste' : '↺ À revoir';
    q.querySelectorAll('[data-pos]').forEach(function (bt) { bt.setAttribute('aria-pressed', bt.getAttribute('data-pos') === etat ? 'true' : 'false'); });
    rep.e[qid] = etat;
    if (!silencieux) { sauverRep(); majProgression(); }
  }
  function majProgression() {
    var p = document.getElementById('progression');
    if (!p) return;
    var ids = Object.keys(QCART);
    if (!ids.length && Object.keys(FC).length) {
      var total = 0, sues = 0;
      Object.keys(FC).forEach(function (fid) {
        FC[fid].cartes.forEach(function (c, i) { total++; if (rep.e['fc:' + fid + ':' + i] === 'sue') sues++; });
      });
      var pc = total ? Math.round(100 * sues / total) : 0;
      p.innerHTML = '<strong>Progression :</strong> ' + sues + ' carte' + (sues > 1 ? 's' : '') + ' sue' + (sues > 1 ? 's' : '') + ' sur ' + total +
        '<div class="jauge" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pc + '" aria-label="Cartes sues"><span style="width:' + pc + '%"></span></div>';
      validerActivite(sues, sues, total, 'Cartes sues : ');
      return;
    }
    var faites = ids.filter(function (k) { return rep.e[k]; }).length;
    var justes = ids.filter(function (k) { return rep.e[k] === 'juste'; }).length;
    var pct = ids.length ? Math.round(100 * faites / ids.length) : 0;
    validerActivite(faites, justes, ids.length);
    p.innerHTML = '<strong>Progression :</strong> ' + faites + ' question' + (faites > 1 ? 's' : '') + ' traitée' + (faites > 1 ? 's' : '') + ' sur ' + ids.length +
      ' — réponses justes : ' + justes +
      '<div class="jauge" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Progression dans le cours"><span style="width:' + pct + '%"></span></div>';
  }

  /* suivi d'une activité d'un espace (page d'accueil de l'espace : localStorage pse-valid-<cle>) */
  function validerActivite(faites, justes, total, libelle) {
    if (!C.validation || !total) return;
    ecrireMem('pse-valid-' + C.validation, { faites: faites, justes: justes, total: total, t: Date.now() });
    var fin = document.getElementById('fin-activite');
    if (!fin) return;
    var termine = faites >= total;
    var etaitCache = fin.hidden;
    fin.hidden = !termine;
    if (termine) {
      fin.querySelector('.chiffre').textContent = libelle ? libelle + justes + ' sur ' + total
        : 'Activité terminée : ' + justes + ' réponse' + (justes > 1 ? 's' : '') + ' juste' + (justes > 1 ? 's' : '') + ' sur ' + total;
      if (etaitCache && !validerActivite.chargement) annoncer(fin.querySelector('.chiffre').textContent);
    }
  }

  function verifierQuestion(qid) {
    var q = document.getElementById(qid);
    effacerMarques(q);
    var res = [];
    (COMP[qid] || []).forEach(function (c) { res = res.concat(c.verifier(q)); });
    var n = res.length, ok = res.filter(function (r) { return r.ok; }).length, vides = res.filter(function (r) { return r.vide; }).length;
    var v = document.getElementById(qid + '-v');
    v.hidden = false;
    if (vides === n) {
      v.className = 'verdict mi'; v.textContent = 'Aucune réponse saisie.';
    } else if (ok === n) {
      v.className = 'verdict ok'; v.textContent = '✔ Réponse juste.';
      etatQuestion(qid, 'juste');
      ouvrirCorrige(qid, true);
    } else {
      v.className = 'verdict ko';
      v.textContent = '✘ Réponse à revoir' + (n > 1 ? ' : ' + ok + ' élément' + (ok > 1 ? 's' : '') + ' juste' + (ok > 1 ? 's' : '') + ' sur ' + n + '.' : '.');
      etatQuestion(qid, 'revoir');
    }
    annoncer(v.textContent);
  }
  function ouvrirCorrige(qid, forcer) {
    var box = document.getElementById(qid + '-cb');
    var bt = document.querySelector('[data-corrige="' + qid + '"]');
    var ouvrir = forcer ? true : box.hidden;
    box.hidden = !ouvrir;
    if (bt) bt.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
    if (ouvrir) {
      var q = document.getElementById(qid);
      (COMP[qid] || []).forEach(function (c) { c.reveler(q); });
      if (!forcer) annoncer('Corrigé affiché');
    }
  }

  /* ───────────── réglages ───────────── */
  function appliquerReglages() {
    var r = document.documentElement;
    r.style.setProperty('--fs', reg.taille + 'px');
    r.style.setProperty('--lh', reg.interligne);
    var esp = { '0': ['0em', '0em'], '1': ['.05em', '.15em'], '2': ['.1em', '.3em'] }[reg.espace] || ['0em', '0em'];
    r.style.setProperty('--ls', esp[0]); r.style.setProperty('--ws', esp[1]);
    r.setAttribute('data-police', reg.police);
    r.setAttribute('data-theme', reg.theme);
    var o = document.getElementById('r-taille-val');
    if (o) o.textContent = reg.taille + ' px';
    ecrireMem(PREF, reg);
  }
  function selectHtml(id, label, cle, options) {
    return '<div><label for="' + id + '">' + label + '</label><select id="' + id + '" data-reg="' + cle + '">' +
      options.map(function (o) { return '<option value="' + o[0] + '"' + (String(reg[cle]) === String(o[0]) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></div>';
  }
  function construireBarre() {
    var barre = document.createElement('div');
    barre.innerHTML =
      '<a class="saut" href="#contenu">Aller au contenu du cours</a>' +
      '<div class="barre" role="region" aria-label="Réglages de lecture et d\'affichage">' +
      '<div class="rangee">' +
      (C.sansNiveaux ? '' : '<div class="groupe" role="group" aria-label="Niveau du cours"><span class="lbl">Niveau</span>' +
      NIVEAUX.map(function (n) { return '<button type="button" data-niveau="' + n[0] + '" aria-pressed="' + (n[0] === niveau) + '">' + n[1] + '</button>'; }).join('') + '</div>') +
      '<div class="groupe" role="group" aria-label="Taille du texte"><span class="lbl">Texte</span><button type="button" data-taille="-1" aria-label="Réduire la taille du texte">A−</button>' +
      '<button type="button" data-taille="1" aria-label="Agrandir la taille du texte">A+</button></div>' +
      '<span class="espace"></span>' +
      '<button type="button" id="btn-reglages" aria-expanded="false" aria-controls="panneau">⚙️ Réglages</button>' +
      '<button type="button" data-imprimer aria-label="Imprimer ou enregistrer en PDF">🖨️ PDF</button>' +
      '</div>' +
      '<div class="panneau" id="panneau" hidden><div class="grille">' +
      '<div><label id="r-taille-l">Taille du texte</label><div class="taille" role="group" aria-labelledby="r-taille-l"><button type="button" data-taille="-1" aria-label="Réduire">A−</button><output id="r-taille-val" aria-live="polite">' + reg.taille + ' px</output><button type="button" data-taille="1" aria-label="Agrandir">A+</button></div></div>' +
      selectHtml('r-police', 'Police', 'police', [['defaut', 'Verdana (par défaut)'], ['atkinson', 'Atkinson Hyperlegible (très lisible)'], ['comic', 'Comic Neue (arrondie)'], ['arial', 'Arial'], ['serif', 'Georgia (à empattements)']]) +
      selectHtml('r-interligne', 'Interligne', 'interligne', [['1.4', 'Serré'], ['1.6', 'Normal'], ['1.9', 'Large'], ['2.3', 'Très large']]) +
      selectHtml('r-espace', 'Espacement des lettres et des mots', 'espace', [['0', 'Normal'], ['1', 'Large'], ['2', 'Très large']]) +
      selectHtml('r-theme', 'Couleurs', 'theme', [['clair', 'Clair'], ['creme', 'Fond crème'], ['sombre', 'Sombre'], ['contraste', 'Contraste élevé (noir et jaune)']]) +
      selectHtml('r-vitesse', 'Vitesse de la voix', 'vitesse', [['0.7', 'Lente'], ['0.85', 'Posée'], ['1', 'Normale'], ['1.2', 'Rapide']]) +
      '<div><label for="r-voix">Voix</label><select id="r-voix" data-reg="voix"><option value="">Voix automatique</option></select></div>' +
      selectHtml('r-surligner', 'Surlignage du passage lu', 'surligner', [['oui', 'Oui'], ['non', 'Non']]) +
      selectHtml('r-suivre', 'Défilement avec la lecture', 'suivre', [['oui', 'Oui'], ['non', 'Non']]) +
      '<div><label for="r-affichage">Affichage</label><select id="r-affichage"></select></div>' +
      '<div><label for="r-effacer">Réponses enregistrées</label><button type="button" id="r-effacer">Effacer les réponses</button></div>' +
      '<div><label for="r-defaut">Réglages</label><button type="button" id="r-defaut">Rétablir les réglages par défaut</button></div>' +
      '</div></div></div>' +
      '<div id="lecteur" hidden role="region" aria-label="Lecture audio"><span id="lec-etat">Lecture en cours</span>' +
      '<button type="button" id="lec-pause" aria-label="Mettre la lecture en pause">⏸</button>' +
      '<button type="button" id="lec-stop" aria-label="Arrêter la lecture">⏹</button></div>' +
      '<div id="annonce" class="sr" aria-live="polite"></div>' +
      '<dialog class="loupe" id="loupe" aria-label="Image agrandie"><button type="button" class="fermer" id="loupe-fermer">✕ Fermer</button><div class="cadre"><img id="loupe-img" alt=""></div></dialog>';
    var repere = document.body.firstChild;
    while (barre.firstChild) document.body.insertBefore(barre.firstChild, repere);
  }
  function remplirAffichage() {
    var s = document.getElementById('r-affichage');
    if (!s) return;
    var opts = [['tout', 'Tout le cours']];
    document.querySelectorAll('#contenu section.seance').forEach(function (sec) {
      var k = sec.getAttribute('data-seance');
      var t = sec.querySelector('h2');
      opts.push([k, k === 'bilan' ? 'Bilan du module seulement' : 'Séance ' + k + ' seulement' + (t ? ' — ' + t.textContent : '')]);
    });
    s.innerHTML = opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === affichage ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('');
  }
  function appliquerAffichage() {
    document.querySelectorAll('#contenu section.seance').forEach(function (sec) {
      sec.classList.toggle('masque', affichage !== 'tout' && sec.getAttribute('data-seance') !== affichage);
    });
  }
  function aller(cible) {
    if (!cible) return;
    if (affichage !== 'tout' && cible.closest('section.seance') && cible.closest('section.seance').classList.contains('masque')) {
      affichage = 'tout'; appliquerAffichage(); remplirAffichage();
    }
    cible.scrollIntoView({ block: 'start' });
    if (!cible.hasAttribute('tabindex')) cible.setAttribute('tabindex', '-1');
    cible.focus({ preventScroll: true });
  }

  /* ───────────── impression ───────────── */
  function preparerImpression() {
    document.querySelectorAll('#contenu textarea').forEach(function (t) {
      var c = t.nextElementSibling;
      if (!c || !c.classList.contains('copie-impr')) { c = document.createElement('div'); c.className = 'copie-impr'; t.parentNode.insertBefore(c, t.nextSibling); }
      c.textContent = t.value;
    });
  }

  /* ───────────── événements ───────────── */
  document.addEventListener('click', function (ev) {
    var mem = ev.target.closest && ev.target.closest('.mem-carte');
    if (mem) { clicMemory(mem); return; }
    var gp = ev.target.closest && ev.target.closest('.gl-piece, .gl-depot, .gl-reserve');
    if (gp) {
      if (glisseRecent) return;
      var qg = gp.getAttribute('data-q'), sg = GL[qg];
      if (!sg) return;
      if (gp.classList.contains('gl-piece')) {
        if (sg.sel && sg.sel !== gp && gp.parentNode.classList.contains('gl-depot')) { placerPiece(qg, sg.sel, gp.parentNode); return; }
        selectionGl(qg, sg.sel === gp ? null : gp);
        return;
      }
      if (sg.sel) placerPiece(qg, sg.sel, gp);
      return;
    }
    var chasse = ev.target.closest && ev.target.closest('.chasse-img');
    if (chasse) { clicChasse(chasse, ev); return; }
    var carte = ev.target.closest && ev.target.closest('.fc-carte');
    if (carte) { actionCarte(carte.id.replace(/-carte$/, ''), 'retourner'); return; }
    var t = ev.target.closest('button, a');
    if (!t) return;
    var a;
    if ((a = t.getAttribute('data-fc')) !== null) { actionCarte(t.getAttribute('data-fid'), a); return; }
    if ((a = t.getAttribute('data-a')) !== null) { var f = AUD[a]; if (f) lire(f(), t); return; }
    if ((a = t.getAttribute('data-niveau')) !== null) {
      if (a === niveau) return;
      niveau = a; ecrireMem(CLE + '-niveau', niveau);
      document.querySelectorAll('[data-niveau]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-niveau') === niveau ? 'true' : 'false'); });
      chargerRep(); rendre(); annoncer('Niveau ' + t.textContent + ' affiché');
      return;
    }
    if ((a = t.getAttribute('data-taille')) !== null) {
      var idx = TAILLES.indexOf(reg.taille); if (idx < 0) idx = 2;
      idx = Math.max(0, Math.min(TAILLES.length - 1, idx + parseInt(a, 10)));
      reg.taille = TAILLES[idx]; appliquerReglages(); annoncer('Taille du texte : ' + reg.taille + ' pixels');
      return;
    }
    if (t.id === 'btn-reglages') {
      var p = document.getElementById('panneau');
      p.hidden = !p.hidden; t.setAttribute('aria-expanded', p.hidden ? 'false' : 'true');
      if (!p.hidden) { chargerVoix(); remplirAffichage(); }
      return;
    }
    if (t.hasAttribute('data-imprimer')) { preparerImpression(); window.print(); return; }
    if ((a = t.getAttribute('data-montrer')) !== null) {
      var box = document.getElementById(a);
      box.hidden = !box.hidden; t.setAttribute('aria-expanded', box.hidden ? 'false' : 'true');
      if (!box.hidden) annoncer('Indice affiché');
      return;
    }
    if ((a = t.getAttribute('data-verifier')) !== null) { verifierQuestion(a); return; }
    if ((a = t.getAttribute('data-corrige')) !== null) { ouvrirCorrige(a, false); return; }
    if ((a = t.getAttribute('data-pos')) !== null) { etatQuestion(t.getAttribute('data-q2'), a); annoncer(a === 'juste' ? 'Réponse notée juste' : 'Réponse notée à revoir'); return; }
    if ((a = t.getAttribute('data-verif-item')) !== null) { verifierItem(a); majProgression(); return; }
    if ((a = t.getAttribute('data-score')) !== null) { scoreAutoEval(a); return; }
    if (t.hasAttribute('data-bilan')) { scoreBilan(); return; }
    if ((a = t.getAttribute('data-refaire')) !== null) {
      var zone = a === 'bilan' ? document.getElementById('s-bilan') : document.getElementById('b-' + a.replace(/^ae-/, ''));
      zone.querySelectorAll('[data-k]').forEach(function (el) {
        delete rep.v[el.getAttribute('data-k')];
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = false; else el.value = '';
      });
      zone.querySelectorAll('.verdict,.boite.expl,.score').forEach(function (el) { el.hidden = true; });
      effacerMarques(zone);
      zone.querySelectorAll('.item').forEach(function (it) { marquer(it, null); delete rep.e[it.getAttribute('data-item')]; });
      sauverRep(); annoncer('Réponses effacées pour cette auto-évaluation');
      return;
    }
    if ((a = t.getAttribute('data-loupe')) !== null) {
      var dlg = document.getElementById('loupe');
      var im = document.getElementById('loupe-img');
      im.src = a; im.alt = (t.querySelector('img') || {}).alt || '';
      if (dlg.showModal) { dlg.showModal(); document.getElementById('loupe-fermer').focus(); } else window.open(a, '_blank');
      return;
    }
    if (t.id === 'loupe-fermer') { document.getElementById('loupe').close(); return; }
    if (t.id === 'lec-pause') { if (L.etat === 'lecture') pause(); else reprendre(); return; }
    if (t.id === 'lec-stop') { arreter(); return; }
    if (t.id === 'r-effacer') {
      if (!confirm('Effacer toutes les réponses enregistrées pour ce cours (niveau affiché) sur cet appareil ?')) return;
      rep = { v: {}, e: {} }; ecrireMem(CLE + '-' + niveau, rep); rendre(); annoncer('Réponses effacées');
      return;
    }
    if (t.id === 'r-defaut') {
      reg = Object.assign({}, DEFAUT); appliquerReglages();
      document.querySelectorAll('[data-reg]').forEach(function (s) { s.value = reg[s.getAttribute('data-reg')]; });
      annoncer('Réglages par défaut rétablis');
      return;
    }
    if ((a = t.getAttribute('data-renvoi')) !== null) {
      ev.preventDefault();
      var cible = document.getElementById('b-' + a);
      if (!cible) { var s = SEANCE_DE[a]; cible = s ? document.getElementById('s-' + s) : null; }
      aller(cible);
      return;
    }
    if ((a = t.getAttribute('data-renvoi-seance')) !== null) {
      ev.preventDefault();
      aller(document.getElementById('s-' + a));
    }
  });
  document.addEventListener('change', function (ev) {
    var el = ev.target, k = el.getAttribute && el.getAttribute('data-reg');
    if (k) {
      reg[k] = el.value; appliquerReglages();
      return;
    }
    if (el.id === 'r-affichage') { affichage = el.value; appliquerAffichage(); window.scrollTo(0, 0); annoncer('Affichage modifié'); return; }
    enregistrerChamp(el);
  });
  document.addEventListener('input', function (ev) { enregistrerChamp(ev.target); });
  function enregistrerChamp(el) {
    if (!el.getAttribute || !el.getAttribute('data-k')) return;
    if (el.type === 'radio') {
      document.querySelectorAll('input[name="' + CSS.escape(el.name) + '"]').forEach(function (r) { rep.v[r.getAttribute('data-k')] = r.checked; });
    } else if (el.type === 'checkbox') rep.v[el.getAttribute('data-k')] = el.checked;
    else rep.v[el.getAttribute('data-k')] = el.value;
    sauverRep();
  }
  /* glisser à la souris ou au doigt ; le toucher-placer et le clavier passent par les clics */
  var drag = null, glisseRecent = false;
  document.addEventListener('pointerdown', function (ev) {
    var p = ev.target.closest && ev.target.closest('.gl-piece');
    if (!p || (ev.button && ev.button > 0)) return;
    drag = { p: p, x: ev.clientX, y: ev.clientY, actif: false, id: ev.pointerId };
  });
  document.addEventListener('pointermove', function (ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
    if (!drag.actif && Math.abs(dx) + Math.abs(dy) > 8) {
      drag.actif = true; drag.p.classList.add('en-glisse');
      try { drag.p.setPointerCapture(ev.pointerId); } catch (e) { /* navigateur ancien */ }
    }
    if (drag.actif) { ev.preventDefault(); drag.p.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }
  });
  document.addEventListener('pointerup', function (ev) {
    if (!drag || ev.pointerId !== drag.id) return;
    var p = drag.p, actif = drag.actif;
    drag = null;
    if (!actif) return;
    p.style.transform = ''; p.classList.remove('en-glisse');
    p.style.visibility = 'hidden';
    var sous = document.elementFromPoint(ev.clientX, ev.clientY);
    p.style.visibility = '';
    var dep = sous && sous.closest('.gl-depot, .gl-reserve');
    if (!dep && sous) { var autre = sous.closest('.gl-piece'); if (autre && autre !== p) dep = autre.parentNode; }
    var qid = p.getAttribute('data-q');
    if (dep && dep.getAttribute('data-q') === qid) placerPiece(qid, p, dep);
    glisseRecent = true;
    setTimeout(function () { glisseRecent = false; }, 80);
  });
  document.addEventListener('pointercancel', function () {
    if (drag) { drag.p.style.transform = ''; drag.p.classList.remove('en-glisse'); drag = null; }
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.target && ev.target.classList && (ev.target.classList.contains('gl-depot') || ev.target.classList.contains('gl-reserve')) &&
        (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); ev.target.click(); return; }
    var carte =ev.target && ev.target.classList && ev.target.classList.contains('fc-carte') ? ev.target : null;
    if (carte) {
      var fid = carte.id.replace(/-carte$/, '');
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); actionCarte(fid, 'retourner'); return; }
      if (ev.key === 'ArrowRight') { ev.preventDefault(); actionCarte(fid, 'suiv'); return; }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); actionCarte(fid, 'prec'); return; }
    }
    if (ev.key === 'Escape' && L.etat !== 'arret' && !(document.getElementById('loupe') || {}).open) arreter();
  });
  window.addEventListener('beforeprint', preparerImpression);
  window.addEventListener('pagehide', arreter);

  /* ───────────── démarrage ───────────── */
  if (!window.CSS || !CSS.escape) { window.CSS = window.CSS || {}; CSS.escape = function (s) { return String(s).replace(/[^a-zA-Z0-9_\-]/g, '\\$&'); }; }
  construireBarre();
  appliquerReglages();
  if (synth) { chargerVoix(); if ('onvoiceschanged' in synth) synth.onvoiceschanged = chargerVoix; }
  chargerRep();
  rendre();
})();
