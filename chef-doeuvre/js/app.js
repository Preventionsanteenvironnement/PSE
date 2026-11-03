/* app.js — parcours chef-d'œuvre CAP PSR 1re année (2026-2027) : écrans et navigation.
 * Accueil → code → avatar (première fois) → mes séances → séance en six étapes :
 * météo et objectif, découvrir, s'exercer, évaluation (notée), carnet de bord, bilan.
 * Contenu : seances/*.js (window.CDO_SEANCES), repris du Tableau de l'Atelier PSE (module CDO).
 */
(function () {
  'use strict';
  var A = window.CDO_AUDIO, D = window.CDO_DONNEES, AV = window.CDO_AVATAR, EX = window.CDO_EX, EV = window.CDO_EVAL;
  var esc = EX.esc, vue = document.getElementById('vue'), tete = document.getElementById('tete');
  var SEANCES = (window.CDO_SEANCES || []).slice().sort(function (a, b) { return a.numero - b.numero; });
  window.CDO_REGLAGES = { parlerRetours: true };
  function son(t, l) { return A.bouton(t, l); }
  function lisible(balise, t, cls) { return '<' + balise + (cls ? ' class="' + cls + '"' : '') + ' data-lire>' + son(t) + '<span>' + esc(t) + '</span></' + balise + '>'; }
  function dateLongue(iso) { var d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); }
  function dateCourte(iso) { var d = new Date(iso + 'T12:00:00'); return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }
  var ICO = {
    retour: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>',
    suite: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    ok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17.5 19.5 7"/></svg>',
    verrou: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>',
    micro: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/></svg>',
    bouclier: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v5c0 4.5 3.2 8 8 10 4.8-2 8-5.5 8-10V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
    outils: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>'
  };

  /* ───────── En-tête ───────── */
  function enTete(titre, retour) {
    var c = D.code(), e = D.etat();
    tete.innerHTML = '<div class="cdo-tete-g">' + (retour ? '<button type="button" class="cdo-retour-btn" data-aller="' + retour + '">' + ICO.retour + 'Retour</button>' : '<span class="cdo-marque">Chef-d’œuvre · CAP PSR</span>') + '</div>' +
      '<div class="cdo-tete-c">' + esc(titre || '') + '</div>' +
      '<div class="cdo-tete-d"><button type="button" class="cdo-ecouter" data-ecouter>' + A.ICONE + 'Écouter<span class="cdo-pas-mobile"> la page</span></button>' +
      (c ? '<button type="button" class="cdo-moi" data-aller="moi" aria-label="Mon espace">' + AV.svg(e.avatar, 44) + '<span>' + esc(c) + '</span></button>' : '') + '</div>';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-ecouter]'); if (b) { if (b.classList.contains('joue')) A.arreter(); else A.lireTout(vue, b); return; }
    var a = ev.target.closest('[data-aller]'); if (a) { A.arreter(); aller(a.getAttribute('data-aller')); }
  });

  /* ───────── Routage ───────── */
  function aller(route) {
    location.hash = route;
  }
  function suivre() {
    A.arreter();
    vue.onclick = null; vue.onchange = null;
    var h = decodeURIComponent(location.hash.replace(/^#/, '')) || 'accueil', p = h.split('/');
    if (!D.code() && ['accueil', 'code', 'outils'].indexOf(p[0]) < 0) p = ['accueil'];
    window.scrollTo(0, 0);
    ({ accueil: accueil, code: ecranCode, avatar: avatar, seances: mesSeances, seance: ecranSeance, moi: moi, outils: outils }[p[0]] || accueil)(p);
    var h1 = vue.querySelector('h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }
  window.addEventListener('hashchange', suivre);

  /* ───────── Accueil : deux portes ───────── */
  function accueil() {
    enTete('');
    vue.innerHTML = '<div class="cdo-accueil">' + lisible('h1', 'Chef-d’œuvre · Les risques en cuisine et leur prévention') +
      '<div class="cdo-portes">' +
      '<a class="cdo-porte cdo-porte-1" href="#' + (D.code() ? 'seances' : 'code') + '">' + ICO.bouclier + '<span class="cdo-porte-t">Mon chef-d’œuvre</span><span>Les séances, les exercices, les évaluations, le carnet de bord.</span><span class="cdo-porte-pied">' + ICO.verrou + 'Accès avec son code</span></a>' +
      '<a class="cdo-porte cdo-porte-2" href="#outils">' + ICO.outils + '<span class="cdo-porte-t">Boîte à outils cuisine</span><span>Hygiène, production, service : fiches, exercices et missions.</span><span class="cdo-porte-pied">Accès libre</span></a>' +
      '</div></div>';
  }

  /* ───────── Code ───────── */
  function ecranCode() {
    enTete('Mon chef-d’œuvre', 'accueil');
    vue.innerHTML = '<form class="cdo-code" autocomplete="off">' + lisible('h1', 'Saisir son code') +
      lisible('p', 'Le code comporte quatre caractères. Il a été remis par le professeur.') +
      '<label for="code" class="cdo-label">Code</label><input id="code" maxlength="10" inputmode="text" autocapitalize="characters" spellcheck="false">' +
      '<p class="cdo-erreur" role="alert" hidden></p><button class="cdo-btn" type="submit">Valider ' + ICO.suite + '</button>' +
      '<p class="cdo-discret">Seul le code est enregistré, jamais le nom.</p></form>';
    var f = vue.querySelector('form'), inp = f.querySelector('input'); inp.focus();
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var c = D.codeValide(inp.value);
      if (!c) { var e = f.querySelector('.cdo-erreur'); e.hidden = false; e.textContent = 'Ce code n’est pas reconnu. Vérifier les quatre caractères.'; A.lire(e.textContent, e); return; }
      var etat = D.ouvrir(c);
      aller(etat.avatar ? 'seances' : 'avatar');
    });
  }

  /* ───────── Avatar ───────── */
  function avatar() {
    var etat = D.etat(), choix = Object.assign({}, AV.DEFAUT, etat.avatar || {}), onglet = 0;
    enTete('Mon avatar', etat.avatar ? 'seances' : null);
    function dessiner() {
      var cat = AV.CATEGORIES[onglet];
      vue.innerHTML = '<div class="cdo-avatar">' +
        '<div class="cdo-av-apercu">' + AV.svg(choix, 260) + lisible('h1', 'Composer son avatar') + lisible('p', 'Il accompagne chaque séance.') +
        '<button type="button" class="cdo-btn" data-garder>Enregistrer l’avatar ' + ICO.ok + '</button></div>' +
        '<div class="cdo-av-reglages"><div class="cdo-av-onglets" role="tablist">' + AV.CATEGORIES.map(function (c, i) { return '<button type="button" role="tab" aria-selected="' + (i === onglet) + '" data-onglet="' + i + '">' + esc(c.libelle) + '</button>'; }).join('') + '</div>' +
        '<div class="cdo-av-options">' + cat.options.map(function (o) {
          var essai = Object.assign({}, choix); essai[cat.cle] = o.v;
          if (cat.cle === 'cheveux' && essai.coiffe !== 'foulard') essai.coiffe = 'aucune';   // la coiffe cacherait la coupe
          var actif = choix[cat.cle] === o.v;
          return '<button type="button" class="cdo-av-option' + (actif ? ' pris' : '') + '" data-v="' + esc(JSON.stringify(o.v)) + '" aria-pressed="' + actif + '">' +
            (o.couleur ? '<span class="cdo-av-pastille" style="background:' + o.couleur + '"></span>' : AV.svg(essai, 96)) + (o.t ? '<span>' + esc(o.t) + '</span>' : '') + '</button>';
        }).join('') + '</div></div></div>';
    }
    dessiner();
    vue.onclick = function (ev) {
      var t = ev.target.closest('[data-onglet]'); if (t) { onglet = +t.dataset.onglet; dessiner(); return; }
      var o = ev.target.closest('.cdo-av-option'); if (o) { choix[AV.CATEGORIES[onglet].cle] = JSON.parse(o.dataset.v); dessiner(); return; }
      if (ev.target.closest('[data-garder]')) { etat.avatar = choix; D.enregistrer(); vue.onclick = null; aller('seances'); }
    };
  }

  /* ───────── Mes séances ───────── */
  function etatSeance(s) {
    var e = D.etat().seances[s.id];
    if (e && e.termine) return 'terminee';
    if (e && (e.objectif != null || Object.keys(e.exercices || {}).length)) return 'commencee';
    return 'afaire';
  }
  function mesSeances() {
    vue.onclick = null;
    enTete('Mes séances');
    var notes = SEANCES.map(function (s) { var e = D.etat().seances[s.id]; return e && e.evaluation ? e.evaluation.note : null; }).filter(function (n) { return n != null; });
    var moy = notes.length ? Math.round(notes.reduce(function (a, b) { return a + b; }, 0) / notes.length * 2) / 2 : null;
    vue.innerHTML = '<div class="cdo-seances"><div class="cdo-seances-liste">' + lisible('h1', 'Période 1 · Du danger à la prévention') +
      SEANCES.map(function (s) {
        var st = etatSeance(s), e = D.etat().seances[s.id] || {};
        return '<a class="cdo-seance-l ' + st + '" href="#seance/' + s.id + '/0">' +
          '<span class="cdo-seance-date">' + (s.date ? esc(dateCourte(s.date)) : 'Introduction') + '</span>' +
          (s.vignette ? '<img src="' + esc(s.vignette) + '" alt="">' : '') +
          '<span class="cdo-seance-t">' + esc(s.titre) + '</span>' +
          '<span class="cdo-seance-etat">' + (st === 'terminee' ? ICO.ok + (e.evaluation ? String(e.evaluation.note).replace('.', ',') + ' / 20' : 'Terminée') : st === 'commencee' ? 'Reprendre' : 'Commencer') + '</span></a>';
      }).join('') + '</div>' +
      '<aside class="cdo-seances-cote"><div class="cdo-bloc">' + lisible('h2', 'Mes résultats') +
      '<p class="cdo-ligne-res"><span>Évaluations (moyenne)</span><b>' + (moy == null ? '—' : String(moy).replace('.', ',') + ' / 20') + '</b></p>' +
      '<p class="cdo-ligne-res"><span>Séances terminées</span><b>' + SEANCES.filter(function (s) { return etatSeance(s) === 'terminee'; }).length + ' / ' + SEANCES.length + '</b></p>' +
      '<p class="cdo-discret">La note de participation est donnée par le professeur.</p></div>' +
      '<a class="cdo-bloc cdo-bloc-lien" href="#moi">' + lisible('h2', 'Mon carnet de bord') + '<span>Ce qui a été fait, appris, trouvé difficile à chaque séance.</span></a></aside></div>';
  }

  /* ───────── Une séance en six étapes ───────── */
  var ETAPES = ['Météo et objectif', 'Découvrir', 'S’exercer', 'Évaluation', 'Carnet de bord', 'Bilan'];
  function ecranSeance(p) {
    vue.onclick = null;
    var s = SEANCES.filter(function (x) { return x.id === p[1]; })[0]; if (!s) return aller('seances');
    var n = Math.max(0, Math.min(5, +p[2] || 0)), e = D.seance(s.id);
    enTete((s.date ? dateCourte(s.date) + ' · ' : '') + s.titre, 'seances');
    vue.innerHTML = '<nav class="cdo-etapes" aria-label="Étapes de la séance">' + ETAPES.map(function (t, i) {
      return '<a href="#seance/' + s.id + '/' + i + '" class="' + (i === n ? 'actif' : i < n ? 'passe' : '') + '"' + (i === n ? ' aria-current="step"' : '') + '><span>' + (i + 1) + '</span>' + esc(t) + '</a>';
    }).join('') + '</nav><div class="cdo-etape"></div>';
    var zone = vue.querySelector('.cdo-etape');
    [etapeMeteo, etapeDecouvrir, etapeExercer, etapeEvaluation, etapeCarnet, etapeBilan][n](zone, s, e, n);
  }
  function piedEtape(s, n, libelle) {
    return '<div class="cdo-pied">' + (n ? '<a class="cdo-btn-second" href="#seance/' + s.id + '/' + (n - 1) + '">' + ICO.retour + 'Étape précédente</a>' : '<span></span>') +
      (n < 5 ? '<a class="cdo-btn" href="#seance/' + s.id + '/' + (n + 1) + '">' + esc(libelle || 'Étape suivante') + ICO.suite + '</a>' : '') + '</div>';
  }

  var METEOS = [
    { t: 'Très bien', svg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>', c: '#b45309' },
    { t: 'Bien', svg: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2"/><path d="M9 2.5v1.5M3 8.5h1.5M4.8 4.3l1 1M13.2 4.3l-1 1M8 20h9a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.4 1.3A3 3 0 0 0 8 20z"/></svg>', c: '#b45309' },
    { t: 'Moyen', svg: '<svg viewBox="0 0 24 24"><path d="M7 19h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 19z"/></svg>', c: '#565b62' },
    { t: 'Difficile', svg: '<svg viewBox="0 0 24 24"><path d="M7 15h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 15z"/><path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5"/></svg>', c: '#1d4ed8' }
  ];
  function etapeMeteo(z, s, e, n) {
    z.innerHTML = '<div class="cdo-bloc-grand">' + (s.objectif ? lisible('p', 'Objectif de la séance : ' + s.objectif, 'cdo-objectif') : '') +
      lisible('h1', 'Météo du jour : indiquer son humeur') +
      '<div class="cdo-meteos">' + METEOS.map(function (m, i) { return '<button type="button" class="cdo-meteo' + (e.meteo === i ? ' pris' : '') + '" data-meteo="' + i + '" style="--c:' + m.c + '" aria-pressed="' + (e.meteo === i) + '">' + m.svg + '<span>' + m.t + '</span></button>'; }).join('') + '</div>' +
      lisible('h2', 'Choisir son objectif pour la séance') +
      '<div class="cdo-objectifs">' + s.objectifsEleve.map(function (o, i) { return '<button type="button" class="cdo-carte cdo-obj' + (e.objectif === i ? ' pris' : '') + '" data-obj="' + i + '" aria-pressed="' + (e.objectif === i) + '">' + esc(o) + A.interne(o) + '</button>'; }).join('') + '</div></div>' + piedEtape(s, n, 'Découvrir');
    z.onclick = function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var m = ev.target.closest('[data-meteo]'), o = ev.target.closest('[data-obj]');
      if (m) { e.meteo = +m.dataset.meteo; D.enregistrer(); z.querySelectorAll('[data-meteo]').forEach(function (x) { x.classList.toggle('pris', x === m); x.setAttribute('aria-pressed', x === m); }); A.lire(METEOS[e.meteo].t); }
      if (o) { e.objectif = +o.dataset.obj; D.enregistrer(); z.querySelectorAll('[data-obj]').forEach(function (x) { x.classList.toggle('pris', x === o); x.setAttribute('aria-pressed', x === o); }); }
    };
  }
  /* Schéma du processus, en cases et flèches (texte seul) : [« Le danger », « + », « L’opérateur », « → », …]. [Contrôle 01/11, B1] */
  function schema(l) {
    return '<figure class="cdo-schema" aria-label="' + esc(l.join(' ')) + '">' + l.map(function (x) {
      return x.charAt(0) === '→' || x === '+' ? '<span class="cdo-schema-lien' + (x.length > 1 ? ' cdo-schema-verbe' : '') + '" aria-hidden="true">' + x + '</span>' : '<span class="cdo-schema-case">' + esc(x) + '</span>';
    }).join('') + '</figure>';
  }
  function etapeDecouvrir(z, s, e, n) {
    z.innerHTML = lisible('h1', 'Découvrir') + '<div class="cdo-cartes-notion">' + s.decouvrir.map(function (c) {
      var dit = (c.titre ? c.titre + '. ' : '') + (c.texte || '');
      return '<article class="cdo-notion' + (c.large ? ' large' : '') + '" data-lire data-dire="' + esc(dit) + '">' +
        (c.schema ? schema(c.schema) : c.image ? '<figure><img src="' + esc(c.image) + '" alt="' + esc(c.alt || '') + '" loading="lazy"></figure>' : '') +
        '<div class="cdo-notion-txt">' + son(dit) + (c.titre ? '<h2>' + esc(c.titre) + '</h2>' : '') + (c.texte ? '<p>' + esc(c.texte) + '</p>' : '') + (c.source ? '<small>' + esc(c.source) + '</small>' : '') + '</div></article>';
    }).join('') + '</div>' + (s.retenir ? '<div class="cdo-retenir" data-lire>' + son('À retenir. ' + s.retenir) + '<h2>À retenir</h2><p>' + esc(s.retenir) + '</p></div>' : '') + piedEtape(s, n, 'S’exercer');
  }
  function etapeExercer(z, s, e, n) {
    var i = Math.min(e.exIndex || 0, s.exercices.length - 1);
    function un() {
      z.innerHTML = '<div class="cdo-ex-tete">' + lisible('h1', 'S’exercer') + '<div class="cdo-ex-points" aria-label="Exercices">' + s.exercices.map(function (_, k) {
        return '<button type="button" data-ex="' + k + '" class="' + (k === i ? 'actif ' : '') + (e.exercices[k] ? 'fait' : '') + '" aria-label="Exercice ' + (k + 1) + '">' + (e.exercices[k] ? ICO.ok : k + 1) + '</button>';
      }).join('') + '</div></div><div class="cdo-ex-zone"></div>' +
        '<div class="cdo-pied">' + (i ? '<button type="button" class="cdo-btn-second" data-ex="' + (i - 1) + '">' + ICO.retour + 'Exercice précédent</button>' : '<a class="cdo-btn-second" href="#seance/' + s.id + '/1">' + ICO.retour + 'Découvrir</a>') +
        (i + 1 < s.exercices.length ? '<button type="button" class="cdo-btn" data-ex="' + (i + 1) + '">Exercice suivant' + ICO.suite + '</button>' : '<a class="cdo-btn" href="#seance/' + s.id + '/3">Passer à l’évaluation' + ICO.suite + '</a>') + '</div>';
      EX.rendre(z.querySelector('.cdo-ex-zone'), s.exercices[i], { fini: function () { e.exercices[i] = true; D.enregistrer(); var pt = z.querySelector('.cdo-ex-points [data-ex="' + i + '"]'); if (pt) { pt.classList.add('fait'); pt.innerHTML = ICO.ok; } } });
    }
    un();
    z.onclick = function (ev) { var b = ev.target.closest('[data-ex]'); if (b) { A.arreter(); i = +b.dataset.ex; e.exIndex = i; D.enregistrer(); un(); window.scrollTo(0, 0); } };
  }
  function etapeEvaluation(z, s, e, n) {
    if (!s.evaluation) { z.innerHTML = lisible('h1', 'Évaluation') + lisible('p', 'Pas d’évaluation pour cette séance.') + piedEtape(s, n, 'Carnet de bord'); return; }
    function debut() {
      z.innerHTML = '<div class="cdo-bloc-grand">' + lisible('h1', 'Évaluation de la séance') +
        (e.evaluation ? lisible('p', 'Évaluation déjà faite : ' + String(e.evaluation.note).replace('.', ',') + ' sur 20.', 'cdo-objectif') : '') +
        lisible('p', s.evaluation.questions.length + ' questions, notées sur 20. Une seule réponse par question. La correction s’affiche à la fin.') +
        '<button type="button" class="cdo-btn" data-commencer>' + (e.evaluation ? 'Refaire l’évaluation' : 'Commencer l’évaluation') + ICO.suite + '</button></div>' + piedEtape(s, n, 'Carnet de bord');
    }
    debut();
    z.onclick = function (ev) {
      if (!ev.target.closest('[data-commencer]')) return;
      z.onclick = null; z.innerHTML = '';
      EV.lancer(z, JSON.parse(JSON.stringify(s.evaluation)), function (r) {
        D.noter(s, r);   // la meilleure tentative est gardée (donnees.js)
        z.insertAdjacentHTML('beforeend', piedEtape(s, n, 'Carnet de bord'));
      });
    };
  }
  /* Dictée vocale si le navigateur la propose ; sinon le champ reste à écrire. */
  var Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
  function etapeCarnet(z, s, e, n) {
    var c = e.carnet = e.carnet || {};
    var Qs = [['fait', 'Aujourd’hui, j’ai fait…'], ['appris', 'J’ai appris…'], ['difficile', 'C’était difficile…']];
    z.innerHTML = lisible('h1', 'Carnet de bord') + Qs.map(function (q) {
      var choix = (s.carnet && s.carnet[q[0]]) || [];
      return '<section class="cdo-carnet-q">' + lisible('h2', q[1]) + '<div class="cdo-banque">' + choix.map(function (t) {
        var pris = (c[q[0]] || []).indexOf(t) >= 0;
        return '<button type="button" class="cdo-carte' + (pris ? ' pris' : '') + '" data-q="' + q[0] + '" data-t="' + esc(t) + '" aria-pressed="' + pris + '">' + esc(t) + '</button>';
      }).join('') + '</div><div class="cdo-carnet-libre"><label for="lib-' + q[0] + '" class="cdo-discret">Autre chose (facultatif)</label><textarea id="lib-' + q[0] + '" data-lib="' + q[0] + '" rows="2">' + esc(c[q[0] + 'Libre'] || '') + '</textarea>' +
        (Reco ? '<button type="button" class="cdo-btn-second" data-dicter="' + q[0] + '">' + ICO.micro + 'Dicter</button>' : '') + '</div></section>';
    }).join('') + lisible('p', 'Le carnet de bord prépare l’oral : objectifs, étapes, part personnelle dans l’équipe.', 'cdo-discret') + piedEtape(s, n, 'Bilan');
    z.onclick = function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var b = ev.target.closest('[data-q]');
      if (b) { var l = c[b.dataset.q] = c[b.dataset.q] || [], k = l.indexOf(b.dataset.t); if (k >= 0) l.splice(k, 1); else l.push(b.dataset.t); b.classList.toggle('pris', k < 0); b.setAttribute('aria-pressed', k < 0); D.enregistrer(); return; }
      var d = ev.target.closest('[data-dicter]');
      if (d && Reco) {
        var r = new Reco(); r.lang = 'fr-FR'; r.interimResults = false; d.classList.add('joue');
        r.onresult = function (x) { var ta = z.querySelector('[data-lib="' + d.dataset.dicter + '"]'); ta.value = (ta.value ? ta.value + ' ' : '') + x.results[0][0].transcript; c[d.dataset.dicter + 'Libre'] = ta.value; D.enregistrer(); };
        r.onend = function () { d.classList.remove('joue'); }; r.start();
      }
    };
    z.oninput = function (ev) { var t = ev.target.closest('[data-lib]'); if (t) { c[t.dataset.lib + 'Libre'] = t.value.slice(0, 600); D.enregistrer(); } };
  }
  function etapeBilan(z, s, e, n) {
    var obj = e.objectif != null ? s.objectifsEleve[e.objectif] : null;
    z.innerHTML = '<div class="cdo-bloc-grand cdo-bilan">' + AV.svg(D.etat().avatar, 150) + lisible('h1', 'Bilan de la séance') +
      (obj ? lisible('p', 'Objectif choisi : « ' + obj + ' ». Est-il atteint ?') + '<div class="cdo-choix">' + ['Oui', 'En partie', 'Pas encore'].map(function (t) { return '<button type="button" class="cdo-carte' + (e.atteint === t ? ' pris' : '') + '" data-at="' + t + '">' + t + '</button>'; }).join('') + '</div>' : '') +
      '<p class="cdo-ligne-res"><span>Exercices réussis</span><b>' + Object.keys(e.exercices || {}).length + ' / ' + s.exercices.length + '</b></p>' +
      '<p class="cdo-ligne-res"><span>Évaluation</span><b>' + (e.evaluation ? String(e.evaluation.note).replace('.', ',') + ' / 20' : 'non faite') + '</b></p>' +
      '<button type="button" class="cdo-btn" data-terminer>Terminer la séance ' + ICO.ok + '</button></div>';
    z.onclick = function (ev) {
      var a = ev.target.closest('[data-at]'); if (a) { e.atteint = a.dataset.at; D.enregistrer(); z.querySelectorAll('[data-at]').forEach(function (x) { x.classList.toggle('pris', x === a); }); return; }
      if (ev.target.closest('[data-terminer]')) { e.termine = true; D.enregistrer(); aller('seances'); }
    };
  }

  /* ───────── Mon espace : avatar, carnet, fichier de secours ───────── */
  function moi() {
    vue.onclick = null;
    enTete('Mon espace', 'seances');
    var et = D.etat();
    vue.innerHTML = '<div class="cdo-moi-page"><div class="cdo-bloc cdo-moi-id">' + AV.svg(et.avatar, 140) + '<p class="cdo-code-aff">' + esc(D.code()) + '</p>' +
      '<button type="button" class="cdo-btn-second" data-aller="avatar">Modifier l’avatar</button></div>' +
      '<div class="cdo-bloc">' + lisible('h1', 'Mon carnet de bord') + SEANCES.map(function (s) {
        var c = (et.seances[s.id] || {}).carnet; if (!c) return '';
        var l = ['fait', 'appris', 'difficile'].map(function (k) { return [].concat(c[k] || [], c[k + 'Libre'] ? [c[k + 'Libre']] : []).join(' ; '); });
        if (!l.join('')) return '';
        return '<section class="cdo-carnet-rel" data-lire><h2>' + esc(s.titre) + '</h2><p><b>Fait :</b> ' + esc(l[0] || '—') + '</p><p><b>Appris :</b> ' + esc(l[1] || '—') + '</p><p><b>Difficile :</b> ' + esc(l[2] || '—') + '</p></section>';
      }).join('') + '</div>' +
      '<div class="cdo-bloc">' + lisible('h2', 'Fichier de secours') + lisible('p', 'Sans Internet : enregistrer son travail dans un fichier, puis le reprendre sur un autre ordinateur.') +
      '<div class="cdo-banque"><button type="button" class="cdo-btn-second" data-exporter>Enregistrer le fichier</button><label class="cdo-btn-second">Reprendre un fichier<input type="file" accept=".json,application/json" hidden data-importer></label></div>' +
      '<p class="cdo-discret">' + (D.enLigne() ? 'Le travail est aussi enregistré en ligne.' : 'Le travail est enregistré sur cet ordinateur.') + '</p>' +
      '<button type="button" class="cdo-btn-second" data-sortir>Se déconnecter</button></div></div>';
    vue.onclick = function (ev) {
      if (ev.target.closest('[data-exporter]')) D.exporter();
      if (ev.target.closest('[data-sortir]')) { D.fermer(); aller('accueil'); }
    };
    vue.onchange = function (ev) {
      var f = ev.target.closest('[data-importer]'); if (!f || !f.files[0]) return;
      f.files[0].text().then(function (t) { try { D.importer(t); moi(); } catch (er) { alert(er.message); } });
    };
  }

  /* ───────── Boîte à outils (accès libre) ───────── */
  function outils() {
    vue.onclick = null;
    enTete('Boîte à outils cuisine', 'accueil');
    var F = window.CDO_OUTILS || [];
    vue.innerHTML = lisible('h1', 'Boîte à outils cuisine') + '<div class="cdo-outils">' + F.map(function (f) {
      return '<section class="cdo-bloc">' + lisible('h2', f.famille) + '<div class="cdo-outils-liste">' + f.fiches.map(function (x) {
        return '<a class="cdo-outil" href="' + esc(x.lien) + '">' + (x.image ? '<img src="' + esc(x.image) + '" alt="" loading="lazy">' : '') + '<span>' + esc(x.titre) + '</span></a>';
      }).join('') + '</div></section>';
    }).join('') + '</div>';
  }

  suivre();
})();
