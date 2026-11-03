/* evaluation.js — petite évaluation notée de fin de séance (note sur 20).
 * Une question par écran ; une réponse, modifiable tant qu'elle n'est pas validée ; pas de correction avant la fin ;
 * à la fin : la note et la correction expliquée de chaque question.
 * Types : choix (texte ou images), vf, trous (banque de mots), associer (chaque élément de gauche → une proposition),
 *         ranger (chaque élément → une colonne).
 *   CDO_EVAL.lancer(conteneur, evaluation, fini(resultat))   resultat = { note, points, total, reponses, date }
 */
(function () {
  'use strict';
  var A = window.CDO_AUDIO, esc = window.CDO_EX.esc, melanger = window.CDO_EX.melanger;
  function son(t) { return A.bouton(t); }
  function consigne(c) {
    var m = String(c || '').match(/^(\S+)(\s.*)?$/);
    return '<p class="cdo-consigne" data-lire>' + son(c) + '<span><b>' + esc(m ? m[1] : '') + '</b>' + esc(m && m[2] ? m[2] : '') + '</span></p>';
  }
  /* Propositions des quiz « associer » et « ranger » : chacune s'écoute sans être choisie. [Contrôle v6, n° 3] */
  function props(titre, liste) {
    return '<div class="cdo-props"><p class="cdo-props-t">' + esc(titre) + ' :</p>' + liste.map(function (t) { return '<p class="cdo-prop" data-lire>' + son(t) + '<span>' + esc(t) + '</span></p>'; }).join('') + '</div>';
  }
  function img(src) { return src ? '<img class="cdo-picto" src="' + esc(src) + '" alt="" loading="lazy">' : ''; }

  /* Chaque question rend son HTML, lit la réponse, et la note (points obtenus sur q.points). */
  var Q = {
    choix: {
      html: function (q, r) {
        return (q.image ? '<figure class="cdo-fig"><img src="' + esc(q.image) + '" alt="' + esc(q.alt || '') + '">' + (q.docTitre || q.legende ? '<figcaption data-lire>' + esc(q.docTitre || q.legende) + '</figcaption>' : '') + '</figure>' : '') +
          consigne(q.consigne) + '<div class="cdo-choix' + (q.choix[0] && q.choix[0].image ? ' cdo-choix-images' : '') + '">' + q.choix.map(function (c, k) {
            var t = typeof c === 'string' ? c : c.t;
            return '<button type="button" class="cdo-carte' + (r === k ? ' pris' : '') + '" data-k="' + k + '">' + (c.image ? img(c.image) : '') + '<span>' + esc(t) + '</span>' + A.interne(t) + '</button>';
          }).join('') + '</div>';
      },
      clic: function (box, ev, r) { var c = ev.target.closest('.cdo-carte'); if (!c) return r; box.querySelectorAll('.cdo-carte').forEach(function (x) { x.classList.remove('pris'); }); c.classList.add('pris'); return +c.dataset.k; },
      pret: function (q, r) { return r != null; },
      noter: function (q, r) { return r === q.bonne ? q.points : 0; },
      corrige: function (q) { var c = q.choix[q.bonne]; return typeof c === 'string' ? c : c.t; },
      dit: function (q, r) { if (r == null) return '—'; var c = q.choix[r]; return typeof c === 'string' ? c : c.t; }
    },
    vf: {
      html: function (q, r) { return consigne(q.consigne || 'Indiquer si l’affirmation est vraie ou fausse.') + '<p class="cdo-question" data-lire>' + son(q.texte) + '<span>' + esc(q.texte) + '</span></p><div class="cdo-choix cdo-vf"><button type="button" class="cdo-carte' + (r === true ? ' pris' : '') + '" data-v="1">Vrai</button><button type="button" class="cdo-carte' + (r === false ? ' pris' : '') + '" data-v="0">Faux</button></div>'; },
      clic: function (box, ev, r) { var c = ev.target.closest('.cdo-carte'); if (!c) return r; box.querySelectorAll('.cdo-carte').forEach(function (x) { x.classList.remove('pris'); }); c.classList.add('pris'); return c.dataset.v === '1'; },
      pret: function (q, r) { return r != null; },
      noter: function (q, r) { return r === q.reponse ? q.points : 0; },
      corrige: function (q) { return q.reponse ? 'Vrai' : 'Faux'; },
      dit: function (q, r) { return r == null ? '—' : r ? 'Vrai' : 'Faux'; }
    },
    trous: {
      prep: function (q) {
        q._att = []; q._parts = [];
        String(q.source).split(/(\[[^\]]+\])/).forEach(function (p) { var m = p.match(/^\[([^\]]+)\]$/); if (m) { q._att.push(m[1]); q._parts.push({ t: q._att.length - 1 }); } else if (p) q._parts.push({ s: p }); });
        q._banque = q._banque || melanger(q._att.concat(q.intrus ? [q.intrus] : []));
      },
      html: function (q, r) {
        r = r || {};
        return consigne(q.consigne) + '<p class="cdo-phrase" data-lire data-dire="' + esc(q.source.replace(/\[[^\]]+\]/g, ' blanc ')) + '">' + son(q.source.replace(/\[[^\]]+\]/g, ' blanc ')) + '<span>' +
          q._parts.map(function (p) { return p.t != null ? '<button type="button" class="cdo-trou' + (r[p.t] ? ' rempli' : '') + '" data-t="' + p.t + '">' + esc(r[p.t] || '……') + '</button>' : esc(p.s); }).join('') +
          '</span></p><div class="cdo-banque">' + q._banque.map(function (w) { return '<button type="button" class="cdo-carte" data-w="' + esc(w) + '"><span>' + esc(w) + '</span>' + A.interne(w) + '</button>'; }).join('') + '</div>';
      },
      clic: function (box, ev, r) {
        r = r || {};
        var c = ev.target.closest('.cdo-banque .cdo-carte');
        if (c) { box.querySelectorAll('.cdo-banque .cdo-carte').forEach(function (x) { x.classList.remove('pris'); }); c.classList.add('pris'); box._mot = c.dataset.w; return r; }
        var t = ev.target.closest('.cdo-trou');
        if (t && box._mot) { r[t.dataset.t] = box._mot; t.textContent = box._mot; t.classList.add('rempli'); box._mot = null; box.querySelectorAll('.cdo-banque .cdo-carte').forEach(function (x) { x.classList.remove('pris'); }); }
        return r;
      },
      pret: function (q, r) { return r && q._att.every(function (_, i) { return r[i]; }); },
      noter: function (q, r) { var ok = q._att.filter(function (a, i) { return r && r[i] === a; }).length; return Math.round(q.points * ok / q._att.length * 2) / 2; },
      corrige: function (q) { return q._att.join(' ; '); },
      dit: function (q, r) { var i = 0; return q.source.replace(/\[[^\]]+\]/g, function () { return (r && r[i++]) || '……'; }); }
    },
    associer: {
      prep: function (q) { q._props = q._props || melanger(q.paires.map(function (p) { return p.d; })); },
      html: function (q, r) {
        r = r || {};
        return consigne(q.consigne) + props('Réponses proposées', q._props) + '<div class="cdo-lignes">' + q.paires.map(function (p, i) {
          return '<div class="cdo-ligne"><span class="cdo-ligne-t" data-lire>' + son(p.g) + img(p.image) + esc(p.g) + '</span><span class="cdo-ligne-choix">' +
            q._props.map(function (d) { return '<button type="button" class="cdo-pastille' + (r[i] === d ? ' pris' : '') + '" data-i="' + i + '" data-w="' + esc(d) + '">' + esc(d) + '</button>'; }).join('') + '</span></div>';
        }).join('') + '</div>';
      },
      clic: function (box, ev, r) { r = r || {}; var c = ev.target.closest('.cdo-pastille'); if (!c) return r; r[c.dataset.i] = c.dataset.w; box.querySelectorAll('.cdo-pastille[data-i="' + c.dataset.i + '"]').forEach(function (x) { x.classList.toggle('pris', x === c); }); return r; },
      pret: function (q, r) { return r && q.paires.every(function (_, i) { return r[i]; }); },
      noter: function (q, r) { var ok = q.paires.filter(function (p, i) { return r && r[i] === p.d; }).length; return Math.round(q.points * ok / q.paires.length * 2) / 2; },
      corrige: function (q) { return q.paires.map(function (p) { return p.g + ' → ' + p.d; }).join(' ; '); },
      dit: function (q, r) { return q.paires.map(function (p, i) { return p.g + ' → ' + ((r && r[i]) || '—'); }).join(' ; '); }
    },
    ranger: {
      prep: function (q) {
        if (!q._items) { q._items = []; q.colonnes.forEach(function (c, ci) { c.elements.forEach(function (e) { q._items.push({ t: typeof e === 'string' ? e : e.t, image: e.image, c: ci }); }); }); q._items = melanger(q._items); }
      },
      html: function (q, r) {
        r = r || {};
        return consigne(q.consigne) + props('Les groupes', q.colonnes.map(function (c) { return c.titre; })) + '<div class="cdo-lignes">' + q._items.map(function (it, i) {
          return '<div class="cdo-ligne"><span class="cdo-ligne-t" data-lire>' + son(it.t) + img(it.image) + esc(it.t) + '</span><span class="cdo-ligne-choix">' +
            q.colonnes.map(function (c, ci) { return '<button type="button" class="cdo-pastille' + (r[i] === ci ? ' pris' : '') + '" data-i="' + i + '" data-c="' + ci + '">' + esc(c.titre) + '</button>'; }).join('') + '</span></div>';
        }).join('') + '</div>';
      },
      clic: function (box, ev, r) { r = r || {}; var c = ev.target.closest('.cdo-pastille'); if (!c) return r; r[c.dataset.i] = +c.dataset.c; box.querySelectorAll('.cdo-pastille[data-i="' + c.dataset.i + '"]').forEach(function (x) { x.classList.toggle('pris', x === c); }); return r; },
      pret: function (q, r) { return r && q._items.every(function (_, i) { return r[i] != null; }); },
      noter: function (q, r) { var ok = q._items.filter(function (it, i) { return r && r[i] === it.c; }).length; return Math.round(q.points * ok / q._items.length * 2) / 2; },
      corrige: function (q) { return q.colonnes.map(function (c) { return c.titre + ' : ' + c.elements.map(function (e) { return typeof e === 'string' ? e : e.t; }).join(', '); }).join(' ; '); },
      dit: function (q, r) { return q._items.map(function (it, i) { return it.t + ' → ' + (r && r[i] != null ? q.colonnes[r[i]].titre : '—'); }).join(' ; '); }
    }
  };

  /* Repérer sur une illustration : l'élève pose « attendus » repères. Chaque repère est neutre (même marque, juste ou non) :
     rien n'indique avant la correction s'il est sur un danger. Une zone touchée plusieurs fois ne compte qu'une fois ;
     un repère hors zone ne rapporte rien et ne retire rien. [Contrôle du 01/11/2026, A6] */
  /* Zones qui se recouvrent : un point appartient toujours à la plus petite zone qui le contient. */
  function zoneSous(q, x, y) {
    var choix = -1, aire = Infinity;
    for (var k = 0; k < q.zones.length; k++) {
      var z = q.zones[k]; if (Math.abs(x - z.x) > z.w / 2 || Math.abs(y - z.y) > z.h / 2) continue;
      if (z.w * z.h < aire) { choix = k; aire = z.w * z.h; }
    }
    return choix;
  }
  var NOMBRES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq'];
  Q.reperer = {
    html: function (q, r) {
      r = r || [];
      return consigne(q.consigne) + '<p class="cdo-compteur">' + r.length + ' repère(s) posé(s) sur ' + q.attendus + '</p><div class="cdo-chasse-img cdo-reperer"><img src="' + esc(q.image) + '" alt="' + esc(q.alt || '') + '">' +
        r.map(function (m, k) { return '<span class="cdo-repere" style="left:' + m.x + '%;top:' + m.y + '%">' + (k + 1) + '</span>'; }).join('') +
        '</div>' + (q.docTitre ? '<p class="cdo-legende">' + esc(q.docTitre) + '</p>' : '') + '<button type="button" class="cdo-btn-second" data-effacer>Effacer les repères</button>';
    },
    clic: function (box, ev, r) {
      r = r || [];
      if (ev.target.closest('[data-effacer]')) r = [];
      else {
        var img = ev.target.closest('.cdo-reperer') && box.querySelector('.cdo-reperer img');
        if (img && r.length < box._q.attendus) {
          var b = img.getBoundingClientRect(), x = (ev.clientX - b.left) / b.width * 100, y = (ev.clientY - b.top) / b.height * 100;
          r.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, z: zoneSous(box._q, x, y) });
        }
      }
      box.querySelector('.cdo-eval-q').innerHTML = Q.reperer.html(box._q, r);
      return r;
    },
    pret: function (q, r) { return r && r.length >= q.attendus; },
    noter: function (q, r) {
      var vus = {}; (r || []).forEach(function (m) { if (m.z >= 0) vus[m.z] = 1; });
      return Math.min(q.points, Math.round(q.points * Object.keys(vus).length / q.attendus * 2) / 2);
    },
    corrige: function (q) { var n = NOMBRES[q.attendus] || String(q.attendus); return n.charAt(0).toUpperCase() + n.slice(1) + ' parmi : ' + q.zones.map(function (z) { return z.nom; }).join(' ; '); },
    dit: function (q, r) { var vus = {}; return (r || []).map(function (m) { if (m.z < 0) return 'aucun danger retenu à cet endroit'; if (vus[m.z]) return q.zones[m.z].nom + ' (déjà compté)'; vus[m.z] = 1; return q.zones[m.z].nom; }).join(' ; ') || '—'; }
  };

  function lancer(conteneur, ev, fini) {
    var qs = ev.questions, i = 0, reps = {};
    qs.forEach(function (q) { if (Q[q.type].prep) Q[q.type].prep(q); });
    var total = qs.reduce(function (s, q) { return s + q.points; }, 0);
    var box = document.createElement('section'); box.className = 'cdo-eval'; conteneur.appendChild(box);
    function ecran() {
      var q = qs[i], T = Q[q.type];
      box._q = q;
      box.innerHTML = '<div class="cdo-eval-tete"><span class="cdo-compteur">Question ' + (i + 1) + ' sur ' + qs.length + '</span><span class="cdo-points">' + String(q.points).replace('.', ',') + ' point' + (q.points > 1 ? 's' : '') + '</span></div>' +
        (q.chapeau ? '<p class="cdo-chapeau" data-lire>' + son(q.chapeau) + esc(q.chapeau) + '</p>' : '') +
        (q.document ? '<blockquote class="cdo-doc" data-lire>' + son((q.docTitre || '') + ' ' + q.document) + '<span>' + (q.docTitre ? '<b>' + esc(q.docTitre) + '</b> ' : '') + esc(q.document) + '</span></blockquote>' : '') +
        (q.image && ['choix', 'reperer'].indexOf(q.type) < 0 ? '<figure class="cdo-fig"><img src="' + esc(q.image) + '" alt="' + esc(q.alt || '') + '">' + (q.docTitre && !q.document ? '<figcaption>' + esc(q.docTitre) + '</figcaption>' : '') + '</figure>' : '') +
        '<div class="cdo-eval-q">' + T.html(q, reps[i]) + '</div>' +
        '<div class="cdo-eval-pied">' + (i ? '<button type="button" class="cdo-btn-second" data-prec>Question précédente</button>' : '<span></span>') +
        '<button type="button" class="cdo-btn" data-valider ' + (T.pret(q, reps[i]) ? '' : 'disabled') + '>' + (i + 1 < qs.length ? 'Valider et continuer' : 'Valider et terminer') + '</button></div>';
    }
    box.addEventListener('click', function (e) {
      if (e.target.closest('.cdo-son')) return;
      var q = qs[i], T = Q[q.type];
      if (e.target.closest('[data-prec]')) { A.arreter(); i--; ecran(); return; }
      if (e.target.closest('[data-valider]')) {
        if (!T.pret(q, reps[i])) return;
        if (i + 1 < qs.length) { A.arreter(); i++; ecran(); return; }
        return bilan();
      }
      if (e.target.closest('.cdo-eval-q')) {
        reps[i] = T.clic(box, e, reps[i]);
        var b = box.querySelector('[data-valider]'); if (b) b.disabled = !T.pret(q, reps[i]);
      }
    });
    function bilan() {
      var points = 0, lignes = qs.map(function (q, k) {
        var T = Q[q.type], p = T.noter(q, reps[k]); points += p;
        var juste = p === q.points;
        return '<li class="' + (juste ? 'ok' : p > 0 ? 'moyen' : 'ko') + '" data-lire><b>Question ' + (k + 1) + ' · ' + String(p).replace('.', ',') + ' / ' + q.points + '</b>' +
          '<span>Votre réponse : ' + esc(T.dit(q, reps[k])) + '</span>' + (juste ? '' : '<span>Réponse attendue : ' + esc(T.corrige(q)) + '</span>') +
          (q.explication ? '<em>' + esc(q.explication) + '</em>' : '') + '</li>';
      }).join('');
      var note = Math.round(points / total * 20 * 10) / 10;
      var mot = note >= 16 ? 'Très bien.' : note >= 12 ? 'Bien.' : note >= 8 ? 'C’est un début : relisez la correction.' : 'Relisez la correction avec votre professeur.';
      box.innerHTML = '<div class="cdo-note"><span class="cdo-note-val">' + String(note).replace('.', ',') + '<small> / 20</small></span><p data-lire>' + son(mot) + esc(mot) + '</p></div>' +
        '<h3 class="cdo-ex-titre">La correction</h3><ol class="cdo-correction">' + lignes + '</ol>';
      A.lireAuto('Votre note : ' + String(note).replace('.', ',') + ' sur 20. ' + mot);
      fini({ note: note, points: points, total: total, reponses: JSON.parse(JSON.stringify(reps)), date: new Date().toISOString() });
    }
    ecran();
  }
  window.CDO_EVAL = { lancer: lancer };
})();
