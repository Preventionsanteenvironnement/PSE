/* MaPSE Direct — tableau de bord du professeur (prototype)
 * Lit la séance, les élèves et les consignes ; écrit seulement la séance et les consignes.
 * Les noms restent sur cet ordinateur (clé locale à part, jamais envoyée).
 */
(function () {
  'use strict';
  const D = window.MapseDirect, store = D.store, el = D.el;
  const $ = id => document.getElementById(id);
  const NOMS_LOCAUX = 'mapse-direct-noms-locaux';
  const ICONES = { juste: '✔', partiel: '◐', faux: '✗', en_cours: '…', a_valider: '✎', fait: '✔' };
  const LIBELLES = { juste: '✔ juste', partiel: '◐ à revoir', faux: '✗ à revoir', en_cours: '… en train de placer', a_valider: '✎ à lire', fait: '✔ fait' };

  let seance = null, eleves = {}, consignes = {}, choisi = null, vue = 'mosaique', modeleChoisi = D.catalogue[0].id;
  let noms = {};
  try { noms = JSON.parse(localStorage.getItem(NOMS_LOCAUX) || '{}'); } catch (e) {}
  const sauverNoms = () => { try { localStorage.setItem(NOMS_LOCAUX, JSON.stringify(noms)); } catch (e) {} };

  /* ================= Préparation ================= */
  function dessinerCatalogue() {
    const zone = $('liste-catalogue'); zone.innerHTML = '';
    D.catalogue.forEach(m => {
      const types = Array.from(new Set(m.activites.map(a => (D.types[a.type] || {}).nom || a.type)));
      zone.appendChild(el('button', { type: 'button', classe: 'choix-seance' + (m.id === modeleChoisi ? ' pris' : ''), onclick: () => { modeleChoisi = m.id; dessinerCatalogue(); } }, [
        el('div', {}, [el('strong', { texte: m.titre }),
          el('div', { classe: 'aide-clavier', texte: [m.niveau, m.module, m.theme, m.duree, m.activites.length + ' activités'].filter(Boolean).join(' · ') }),
          el('div', { classe: 'aide-clavier', texte: types.join(', ') })]),
        el('span', { texte: m.id === modeleChoisi ? '✔' : '' })
      ]));
    });
  }
  async function dessinerMesSeances() {
    const zone = $('liste-mes-seances');
    let liste = [];
    try { liste = await store.mesSeancesOuvertes(); } catch (e) { console.error(e); }
    zone.innerHTML = '';
    $('bloc-reprendre').classList.toggle('cache', !liste.length);
    liste.forEach(s => zone.appendChild(el('button', { type: 'button', classe: 'choix-seance', onclick: () => ouvrir(s.id) }, [
      el('div', {}, [el('strong', { texte: s.titre }), el('div', { classe: 'aide-clavier', texte: s.classe + ' · code ' + s.codeSeance + ' · lancée le ' + new Date(s.creeLe).toLocaleString('fr-FR') })]),
      el('span', { texte: 'Reprendre →' })
    ])));
  }
  $('b-lancer').addEventListener('click', async () => {
    if ($('b-lancer').disabled) return;
    const modele = D.catalogue.find(m => m.id === modeleChoisi);
    const codes = $('p-codes').value.split(/[\s,;]+/).map(D.normaliserCode).filter(c => c.length === 4);
    $('p-noms').value.split('\n').forEach(l => { const m = l.trim().match(/^([A-Za-z0-9]{4})\s+(.+)$/); if (m) noms[D.normaliserCode(m[1])] = m[2].trim(); });
    sauverNoms();
    $('b-lancer').disabled = true;
    try {
      const s = await store.creerSeance({ titre: modele.titre, modele: modele.id, classe: $('p-classe').value.trim() || 'Classe', codesAutorises: Array.from(new Set(codes)), ajouts: {}, activites: modele.activites });
      ouvrir(s.id);
    } catch (e) {
      console.error(e);
      alert('La séance n’a pas pu être lancée : ' + (e.message || e) + '\nVérifie Internet et ta connexion Google, puis réessaie.');
    } finally { $('b-lancer').disabled = false; }
  });

  /* ================= Séance ouverte ================= */
  function ouvrir(id) {
    $('vue-preparer').classList.add('cache');
    $('vue-seance').classList.remove('cache');
    store.ecouterSeance(id, s => { seance = s; dessiner(); });
    store.ecouterEleves(id, e => { eleves = e; dessiner(); });
    store.ecouterConsignes(id, c => { consignes = c; dessiner(); });
    try { history.replaceState(null, '', '?seance=' + id); } catch (e) {}
    setInterval(dessiner, 2000);
  }

  const etape = () => seance.etape || 0;
  const act = () => seance.activites[etape()];
  const maj = patch => store.majSeance(seance.id, patch);
  const etapeDe = e => (e && e.actuelle != null ? e.actuelle : null);
  const connecte = e => !!(e && e.vu && Date.now() - e.vu < D.PRESENCE_MS && e.connecte !== false);
  function statutPour(e, a) {
    const rep = e && e.reponses && e.reponses[a.id];
    if (!rep) return null;
    const v = ((consignes[e.code] || {}).validations || {})[a.id];
    return D.types[a.type].corriger(a, rep, v);
  }
  function listeCodes() {
    const set = new Set(seance.codesAutorises || []);
    Object.keys(eleves).forEach(c => set.add(c));
    return Array.from(set).sort((a, b) => (typeAjout(a) ? 1 : 0) - (typeAjout(b) ? 1 : 0) || a.localeCompare(b));
  }
  const typeAjout = code => (seance.ajouts || {})[code] || null; // 'eleve' (autre classe) | 'invite'
  const voirNoms = () => $('voir-noms').checked;
  const nomDe = code => (voirNoms() && noms[code]) || '';
  function bloque(e) {
    if (!connecte(e) || e.main || e.fini) return false;
    const a = seance.activites[etapeDe(e) || 0];
    if (!a || a.type === 'etape') return false;
    const st = statutPour(e, a);
    if (st && (st.statut === 'juste' || st.statut === 'a_valider' || st.statut === 'fait')) return false;
    return Date.now() - Math.max(e.actuelleLe || 0, e.derniereAction || 0) > Number($('seuil').value) * 1000;
  }
  function enDifficulte(e, a) {
    const st = statutPour(e, a);
    return !!(st && (st.statut === 'faux' || st.statut === 'partiel') && ((e.tentatives || {})[a.id] || 0) >= 2);
  }
  function identite(code, e) {
    const bloc = el('div', { classe: 'identite' }, [
      el('span', { classe: 'avatar', 'aria-hidden': 'true', texte: (e && e.avatar) || (typeAjout(code) === 'invite' ? '🎟' : '·') }),
      el('div', {}, [
        el('div', { classe: 'pseudo', texte: (e && e.pseudo) || 'en attente' }),
        el('div', { classe: 'qui' }, [el('b', { texte: code }), nomDe(code) ? ' · ' + nomDe(code) : '', typeAjout(code) === 'invite' ? el('span', { classe: 'etiq inv', texte: 'invité' }) : typeAjout(code) === 'eleve' ? el('span', { classe: 'etiq aut', texte: 'autre classe' }) : null])
      ])
    ]);
    return bloc;
  }

  /* ================= Dessin ================= */
  function dessiner() {
    if (!seance) return;
    if (!seance.ouverte) { document.body.innerHTML = '<main class="page"><div class="carte"><h1>Séance terminée</h1><p>Les élèves voient l’écran de fin. <a href="prof.html">Lancer une autre séance</a></p></div></main>'; return; }
    const a = act(), n = seance.activites.length;
    $('titre-seance').textContent = seance.titre + ' — ' + seance.classe;
    const min = Math.floor((Date.now() - seance.creeLe) / 60000);
    $('chrono').textContent = '⏱ ' + (min >= 60 ? Math.floor(min / 60) + ' h ' + String(min % 60).padStart(2, '0') : min + ' min');
    $('etape-actuelle').textContent = 'Étape ' + (etape() + 1) + ' / ' + n + ' — ' + (a.titre || D.types[a.type].nom);
    $('c-prec').disabled = etape() === 0;
    $('c-suiv').disabled = etape() >= n - 1;
    $('c-fige').classList.toggle('on', !!seance.fige);
    $('c-fige').textContent = seance.fige ? '▶ Libérer les écrans' : '⏸ Figer les écrans';
    $('c-mode').classList.toggle('on', seance.mode !== 'pilote');
    $('c-mode').textContent = seance.mode === 'pilote' ? '🚶 Rythme libre' : '🎯 Revenir au mode piloté';
    $('c-arret').classList.toggle('on', seance.arret != null);
    $('c-arret').textContent = seance.arret != null ? '🛑 Arrêt à l’étape ' + (seance.arret + 1) + ' (retirer)' : '🛑 Point d’arrêt ici';
    $('c-arret').disabled = seance.mode === 'pilote';
    $('c-projeter').classList.toggle('on', seance.projeter === a.id);
    $('code-seance').textContent = seance.codeSeance;
    $('adresse-eleve').textContent = 'Les élèves vont sur mapse.fr/direct, tapent leur code, puis ce code.';
    const codes = listeCodes();
    dessinerFrise(codes);
    dessinerIndicateurs(codes, a);
    const zv = $('zone-vue'); zv.innerHTML = '';
    ['mosaique', 'suivi', 'question', 'fil'].forEach(v => $('v-' + v).classList.toggle('on', vue === v));
    if (vue === 'mosaique') dessinerMosaique(zv, codes);
    else if (vue === 'suivi') dessinerSuivi(zv, codes);
    else if (vue === 'question') dessinerQuestion(zv, a, codes);
    else dessinerFil(zv);
    dessinerPanneau(codes);
  }

  // Frise : chaque activité, avec la part de la classe qui l'a faite et réussie ; un clic y emmène toute la classe
  function dessinerFrise(codes) {
    const f = $('frise'); f.innerHTML = '';
    const presents = codes.filter(c => eleves[c]);
    seance.activites.forEach((a, k) => {
      let rep = 0, ok = 0;
      presents.forEach(c => { const st = statutPour(eleves[c], a); if (st) { rep++; if (st.statut === 'juste' || st.statut === 'fait') ok++; } });
      const tot = presents.length || 1;
      f.appendChild(el('button', { type: 'button', classe: 'frise-etape' + (k === etape() ? ' courante' : '') + (seance.arret === k ? ' arret' : ''), title: (a.titre || '') + ' — ' + rep + ' réponse(s), ' + ok + ' réussite(s)', onclick: () => maj({ etape: k, projeter: null }) }, [
        el('span', { classe: 'frise-num', texte: String(k + 1) }),
        el('span', { classe: 'frise-titre', texte: (a.titre || D.types[a.type].nom) }),
        el('span', { classe: 'frise-barre' }, [el('i', { classe: 'r', style: 'width:' + Math.round(100 * rep / tot) + '%' }), el('i', { classe: 'o', style: 'width:' + Math.round(100 * ok / tot) + '%' })])
      ]));
    });
  }

  function dessinerIndicateurs(codes, a) {
    const presents = codes.filter(c => connecte(eleves[c]));
    const ont = presents.filter(c => eleves[c].reponses && eleves[c].reponses[a.id]);
    const justes = ont.filter(c => { const st = statutPour(eleves[c], a); return st && (st.statut === 'juste' || st.statut === 'fait'); });
    const mains = presents.filter(c => eleves[c].main), bloques = presents.filter(c => bloque(eleves[c])), finis = presents.filter(c => eleves[c].fini);
    const z = $('indicateurs'); z.innerHTML = '';
    const anneau = (val, tot, txt, couleur) => {
      const p = tot ? val / tot : 0, R = 22, C = 2 * Math.PI * R;
      const svg = '<svg viewBox="0 0 56 56" width="56" height="56" aria-hidden="true"><circle cx="28" cy="28" r="' + R + '" fill="none" stroke="#e5e9f0" stroke-width="7"/><circle cx="28" cy="28" r="' + R + '" fill="none" stroke="' + couleur + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + (C * p).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 28 28)"/></svg>';
      const b = el('div', { classe: 'indic anneau' }); b.innerHTML = svg;
      b.appendChild(el('div', {}, [el('b', { texte: val + ' / ' + tot }), el('span', { texte: txt })]));
      return b;
    };
    z.appendChild(anneau(presents.length, codes.length, 'connectés', '#0f766e'));
    z.appendChild(anneau(ont.length, presents.length, 'ont répondu', '#2563eb'));
    if (a.type !== 'etape' && a.type !== 'sondage') z.appendChild(anneau(justes.length, ont.length, 'réussissent', '#16a34a'));
    [['✋', mains.length, 'mains levées', 'rouge'], ['⏳', bloques.length, 'bloqués', 'orange'], ['✅', finis.length, 'ont fini', 'vert']].forEach(([i, v, t, c]) =>
      z.appendChild(el('div', { classe: 'indic chiffre ' + (v ? c : '') }, [el('span', { classe: 'i', texte: i }), el('b', { texte: String(v) }), el('span', { texte: t })])));
  }

  function dessinerMosaique(zone, codes) {
    const grille = el('div', { classe: 'mosaique' });
    codes.forEach(code => {
      const e = eleves[code], present = connecte(e), k = etapeDe(e);
      const aE = k != null ? seance.activites[k] : null;
      const st = aE ? statutPour(e, aE) : null;
      let classe = 'tuile';
      if (!present) classe += ' absent'; else if (st) classe += ' ' + st.statut;
      if (choisi === code) classe += ' choisie';
      const am = consignes[code] || {};
      let etat = !e ? 'pas encore venu' : !present ? 'déconnecté' : !st ? (aE && aE.type === 'etape' ? 'lit' : 'pas encore répondu') : LIBELLES[st.statut] || st.statut;
      if (st && st.total > 1) etat += ' (' + st.bonnes + '/' + st.total + ')';
      grille.appendChild(el('button', { type: 'button', classe, onclick: () => { choisi = choisi === code ? null : code; dessiner(); } }, [
        el('div', { classe: 'badges' }, [
          e && e.main && present ? el('span', { classe: 'badge main', texte: '✋' }) : null,
          present && bloque(e) ? el('span', { classe: 'badge bloque', texte: '⏳' }) : null,
          e && e.fini && present ? el('span', { classe: 'badge fini', texte: '✔' }) : null,
          el('span', { classe: 'badge ' + (present ? 'connecte' : 'deconnecte'), title: present ? 'connecté' : 'pas connecté' })
        ]),
        identite(code, e),
        el('div', { classe: 'ligne', texte: k != null ? 'Étape ' + (k + 1) + (k !== etape() && seance.mode === 'pilote' && !am.libere ? ' (en retard)' : '') : '' }),
        el('div', { classe: 'etat', texte: etat }),
        el('div', { classe: 'ligne', texte: [am.libere ? '🚶 libre' : '', am.grand ? '🔠' : '', am.audio ? '🔊' : ''].filter(Boolean).join(' ') })
      ]));
    });
    zone.appendChild(grille);
  }

  // Suivi : élèves × activités, d'un seul coup d'œil
  function dessinerSuivi(zone, codes) {
    const t = el('table', { classe: 'suivi' });
    const tete = el('tr', {}, [el('th', { texte: 'Élève' })]);
    seance.activites.forEach((a, k) => {
      let rep = 0, ok = 0;
      codes.forEach(c => { const st = statutPour(eleves[c], a); if (st) { rep++; if (st.statut === 'juste' || st.statut === 'fait') ok++; } });
      tete.appendChild(el('th', { classe: k === etape() ? 'courante' : '', title: a.titre || '' }, [el('div', { texte: String(k + 1) }), el('small', { texte: rep ? Math.round(100 * ok / rep) + ' %' : '—' })]));
    });
    tete.appendChild(el('th', { texte: 'Score' }));
    t.appendChild(el('thead', {}, [tete]));
    const corps = el('tbody');
    codes.forEach(code => {
      const e = eleves[code];
      let points = 0, sur = 0;
      const ligne = el('tr', { classe: (choisi === code ? 'choisie' : '') + (connecte(e) ? '' : ' absent'), onclick: () => { choisi = code; dessiner(); } }, [el('td', {}, [identite(code, e)])]);
      seance.activites.forEach((a, k) => {
        const st = statutPour(e, a);
        if (a.type !== 'etape' && a.type !== 'sondage') { sur++; if (st && st.statut === 'juste') points++; else if (st && st.statut === 'partiel') points += 0.5; }
        const essais = ((e && e.tentatives) || {})[a.id] || 0;
        ligne.appendChild(el('td', { classe: 'case ' + (st ? st.statut : 'vide') + (k === etape() ? ' courante' : '') + (e && e.actuelle === k && connecte(e) ? ' ici' : ''),
          title: st ? (LIBELLES[st.statut] || st.statut) + (essais > 1 ? ' · ' + essais + ' essais' : '') : 'pas de réponse' }, [st ? ICONES[st.statut] || '·' : '']));
      });
      ligne.appendChild(el('td', { classe: 'score', texte: sur ? (Math.round(points * 10) / 10) + ' / ' + sur : '—' }));
      corps.appendChild(ligne);
    });
    t.appendChild(corps);
    zone.appendChild(el('div', { classe: 'suivi-cadre' }, [t]));
    zone.appendChild(el('p', { classe: 'aide-clavier', texte: 'Le contour bleu montre où est chaque élève. Le pourcentage sous chaque numéro = part des réponses justes. Clique sur une ligne pour ouvrir l’élève, sur un numéro de la frise pour y emmener la classe.' }));
  }

  function dessinerQuestion(zone, a, codes) {
    zone.appendChild(el('h3', { texte: (a.titre || '') + (a.question ? ' — ' + a.question : '') }));
    const reps = codes.map(c => ({ code: c, e: eleves[c] })).filter(x => x.e && x.e.reponses && x.e.reponses[a.id]);
    zone.appendChild(el('p', { classe: 'aide-clavier', texte: reps.length + ' réponse(s)' }));
    zone.appendChild(resultatsAnonymes(a, reps.map(x => x.e.reponses[a.id])));
    if (a.type === 'courte') {
      const liste = el('div', { classe: 'reponses-courtes' });
      reps.forEach(x => {
        const v = ((consignes[x.code] || {}).validations || {})[a.id];
        liste.appendChild(el('div', { classe: 'rep-courte' }, [
          identite(x.code, x.e), el('span', { classe: 'aide-clavier', texte: v === 'ok' ? '✔ validée' : v === 'refaire' ? '↺ à compléter' : 'à lire' }),
          el('div', { classe: 'rep-texte', texte: x.e.reponses[a.id].texte }),
          el('div', { classe: 'actions' }, [
            el('button', { type: 'button', classe: 'petit vert', onclick: () => valider(x.code, a.id, 'ok') }, ['✔ Valider']),
            el('button', { type: 'button', classe: 'petit orange', onclick: () => valider(x.code, a.id, 'refaire') }, ['↺ À compléter'])
          ])
        ]));
      });
      zone.appendChild(liste);
    }
  }

  function resultatsAnonymes(a, reps) {
    const bloc = el('div', { classe: 'barres' });
    const ligne = (texte, nb, total, bonne) => el('div', { classe: 'barre-ligne' }, [
      el('div', { classe: 'barre-fond' }, [el('div', { classe: 'barre-plein' + (bonne ? ' bonne' : ''), style: 'width:' + (total ? Math.round(100 * nb / total) : 0) + '%' }), el('span', { classe: 'barre-texte', texte: texte })]),
      el('b', { texte: String(nb) })]);
    if (a.type === 'qcm' || a.type === 'sondage') a.choix.forEach((c, i) => bloc.appendChild(ligne((a.type === 'qcm' ? String.fromCharCode(65 + i) + '. ' : '') + c, reps.filter(r => r.choix === i).length, reps.length, a.type === 'qcm' && i === a.bonne)));
    else if (a.type === 'classer' || a.type === 'processus') {
      a.items.forEach(it => bloc.appendChild(ligne(it.texte + ' → ' + (a.cases.find(c => c.id === it.case) || {}).nom, reps.filter(r => r.placements && r.placements[it.id] === it.case).length, reps.length, true)));
      bloc.appendChild(el('p', { classe: 'aide-clavier', texte: 'Barre = nombre d’élèves qui ont bien placé l’étiquette.' }));
    } else if (a.type === 'etape') bloc.appendChild(el('p', { texte: reps.length + ' élève(s) ont ouvert cette étape.' }));
    else if (a.type === 'courte') bloc.appendChild(el('p', { classe: 'aide-clavier', texte: 'Réponses rédigées : à lire ci-dessous.' }));
    return bloc;
  }

  function dessinerFil(zone) {
    const items = [];
    Object.values(eleves).forEach(e => Object.keys(e.reponses || {}).forEach(id => {
      const a = seance.activites.find(x => x.id === id); if (!a) return;
      items.push({ le: e.reponses[id].le || 0, e, a, r: e.reponses[id], st: statutPour(e, a) });
    }));
    items.sort((x, y) => y.le - x.le);
    const fil = el('div', { classe: 'fil' });
    items.slice(0, 80).forEach(x => fil.appendChild(el('div', { classe: 'entree-fil' }, [
      el('span', { classe: 'aide-clavier', texte: new Date(x.le).toLocaleTimeString('fr-FR') + ' ' }),
      el('span', { texte: (x.e.avatar || '') + ' ' }), el('b', { texte: x.e.code }), nomDe(x.e.code) ? ' (' + nomDe(x.e.code) + ')' : '',
      ' · ' + (x.a.titre || '') + ' : ' + String(D.types[x.a.type].resumer(x.a, x.r)).slice(0, 90) + (x.st && x.st.statut !== 'fait' ? '  [' + x.st.statut.replace('_', ' ') + ']' : '')
    ])));
    if (!items.length) fil.appendChild(el('p', { classe: 'aide-clavier', texte: 'Les réponses apparaîtront ici, une par une, dès qu’elles arrivent.' }));
    zone.appendChild(fil);
  }

  /* ================= Panneau de droite ================= */
  function dessinerPanneau(codes) {
    const p = $('panneau');
    if (p.contains(document.activeElement) && document.activeElement.tagName === 'TEXTAREA') return; // ne pas effacer un message en cours
    p.innerHTML = '';
    if (!choisi) return dessinerAider(p, codes);
    const code = choisi, e = eleves[code] || {}, c = consignes[code] || {};
    p.appendChild(el('div', { classe: 'tete-eleve' }, [identite(code, e), el('button', { type: 'button', classe: 'petit', onclick: () => { choisi = null; dessiner(); } }, ['✕'])]));
    p.appendChild(el('p', { classe: 'aide-clavier', texte: (connecte(e) ? '🟢 connecté' : '⚪ pas connecté') + (e.arriveLe ? ' · arrivé à ' + new Date(e.arriveLe).toLocaleTimeString('fr-FR') : '') }));
    const det = el('div', { classe: 'detail-eleve' });
    seance.activites.forEach((a, k) => {
      const rep = e.reponses && e.reponses[a.id], st = statutPour(e, a);
      det.appendChild(el('div', { classe: 'ligne-act' }, [el('span', { texte: rep ? ICONES[st.statut] || '·' : '·' }),
        el('span', { texte: (k + 1) + '. ' + (a.titre || D.types[a.type].nom) + (rep ? ' — ' + String(D.types[a.type].resumer(a, rep)).slice(0, 120) : '') + ((e.tentatives || {})[a.id] > 1 ? ' (' + e.tentatives[a.id] + ' essais)' : '') }),
        a.type === 'courte' && rep ? el('span', {}, [el('button', { type: 'button', classe: 'petit vert', onclick: () => valider(code, a.id, 'ok') }, ['✔']), el('button', { type: 'button', classe: 'petit orange', onclick: () => valider(code, a.id, 'refaire') }, ['↺'])]) : el('span')]));
    });
    p.appendChild(det);
    p.appendChild(el('h3', { texte: 'Lui écrire', style: 'margin-top:14px' }));
    const ta = el('textarea', { rows: '2', classe: 'act-texte', placeholder: 'Une aide, un indice… (lui seul le verra)' });
    p.appendChild(ta);
    p.appendChild(el('div', { classe: 'commandes', style: 'margin-top:6px' }, [
      el('button', { type: 'button', onclick: () => { if (ta.value.trim()) { store.ajouterMessage(seance.id, code, ta.value.trim(), 'aide'); ta.value = ''; ta.blur(); } } }, ['Envoyer l’aide']),
      el('button', { type: 'button', onclick: () => store.ajouterMessage(seance.id, code, 'Bravo, continue comme ça !', 'bravo') }, ['👏 Bravo']),
      e.main ? el('button', { type: 'button', onclick: () => jArrive(code) }, ['✋ J’arrive']) : null
    ]));
    p.appendChild(el('h3', { texte: 'Pour lui seul', style: 'margin-top:14px' }));
    const inter = el('div', { classe: 'interrupteurs' });
    [['libere', '🚶 Le laisser avancer à son rythme'], ['grand', '🔠 Texte agrandi'], ['audio', '🔊 Lecture automatique des consignes']].forEach(([cle, txt]) => {
      const cb = el('input', { type: 'checkbox' }); cb.checked = !!c[cle];
      cb.addEventListener('change', () => store.majConsigne(seance.id, code, { [cle]: cb.checked }));
      inter.appendChild(el('label', {}, [cb, txt]));
    });
    p.appendChild(inter);
    p.appendChild(el('div', { classe: 'commandes', style: 'margin-top:8px' }, [
      el('button', { type: 'button', classe: 'petit', onclick: () => { store.majConsigne(seance.id, code, { repseudo: Date.now() }); } }, ['🔁 Lui demander un autre pseudo']),
      el('button', { type: 'button', classe: 'petit', title: 'Si son code est bloqué sur un autre appareil (ordinateur changé, autre navigateur) : il pourra se reconnecter. Ses réponses de cette séance sont effacées.', onclick: () => {
        if (confirm('Libérer la place de ' + code + ' ? Il pourra se reconnecter depuis un autre appareil ; ses réponses de cette séance seront effacées.')) store.libererPlace(seance.id, code);
      } }, ['🔓 Libérer sa place'])
    ]));
  }

  // « À aider maintenant » : qui a besoin de toi, par ordre d'urgence
  function dessinerAider(p, codes) {
    const a = act();
    const liste = [];
    codes.forEach(code => {
      const e = eleves[code];
      if (!connecte(e)) return;
      if (e.main) liste.push({ code, e, rang: 0, raison: '✋ lève la main' });
      else if (bloque(e)) liste.push({ code, e, rang: 1, raison: '⏳ bloqué à l’étape ' + ((e.actuelle || 0) + 1) });
      else if (enDifficulte(e, seance.activites[e.actuelle || 0] || a)) liste.push({ code, e, rang: 2, raison: '↺ plusieurs essais sans réussir' });
    });
    const partis = codes.filter(c => eleves[c] && !connecte(eleves[c]));
    liste.sort((x, y) => x.rang - y.rang);
    p.appendChild(el('h3', { texte: 'À aider maintenant' }));
    if (!liste.length) p.appendChild(el('p', { classe: 'tout-va', texte: '🙂 Personne ne semble en difficulté pour l’instant.' }));
    liste.forEach(x => p.appendChild(el('div', { classe: 'aider rang' + x.rang }, [
      identite(x.code, x.e),
      el('div', { classe: 'raison', texte: x.raison }),
      el('div', { classe: 'actions' }, [
        x.rang === 0 ? el('button', { type: 'button', classe: 'petit', onclick: () => jArrive(x.code) }, ['J’arrive']) : el('button', { type: 'button', classe: 'petit', onclick: () => store.ajouterMessage(seance.id, x.code, 'Besoin d’un coup de main ? Relis la consigne avec 🔊, ou lève la main.', 'aide') }, ['Relancer']),
        el('button', { type: 'button', classe: 'petit', onclick: () => { choisi = x.code; dessiner(); } }, ['Ouvrir'])
      ])
    ])));
    if (partis.length) p.appendChild(el('p', { classe: 'aide-clavier', texte: '⚪ Déconnectés : ' + partis.join(', ') }));
  }

  function valider(code, actId, valeur) {
    const v = Object.assign({}, (consignes[code] || {}).validations || {}, { [actId]: valeur });
    store.majConsigne(seance.id, code, { validations: v });
    if (valeur === 'ok') store.ajouterMessage(seance.id, code, 'Ta réponse est validée. Bravo !', 'bravo');
  }
  function jArrive(code) {
    store.majConsigne(seance.id, code, { baisserMain: Date.now() });
    store.ajouterMessage(seance.id, code, 'J’arrive pour t’aider.', 'aide');
  }

  /* ================= Ajouter un élève ou un invité ================= */
  function retour(t) { $('aj-retour').textContent = t; }
  $('aj-eleve').onclick = () => {
    const c = D.normaliserCode($('aj-code').value);
    if (c.length !== 4) return retour('Le code doit avoir 4 caractères.');
    if ((seance.codesAutorises || []).indexOf(c) >= 0) return retour(c + ' fait déjà partie de la séance.');
    // En ligne, le code sera vérifié dans la liste des codes du lycée (BDD_ELEVES)
    maj({ codesAutorises: (seance.codesAutorises || []).concat([c]), ajouts: Object.assign({}, seance.ajouts, { [c]: 'eleve' }) });
    $('aj-code').value = ''; retour('✔ ' + c + ' peut entrer dans la séance.');
  };
  $('aj-inv').onclick = () => {
    const pris = new Set(seance.codesAutorises || []);
    let c = '';
    for (let k = 1; k < 100 && !c; k++) { const x = 'IN' + String(k).padStart(2, '0'); if (!pris.has(x)) c = x; } // « IN » + 2 chiffres : jamais un vrai code (les vrais n'ont ni I ni O)
    if (!c) return retour('Trop d’invités.');
    const nom = $('aj-invite').value.trim();
    if (nom) { noms[c] = nom; sauverNoms(); }
    maj({ codesAutorises: (seance.codesAutorises || []).concat([c]), ajouts: Object.assign({}, seance.ajouts, { [c]: 'invite' }) });
    $('aj-invite').value = ''; retour('✔ Code d’invité : ' + c + ' — à lui donner avec le code de séance.');
  };

  /* ================= Commandes ================= */
  const commandes = {
    prec() { if (etape() > 0) maj({ etape: etape() - 1, projeter: null }); },
    suiv() { if (etape() < seance.activites.length - 1) maj({ etape: etape() + 1, projeter: null }); },
    fige() { maj({ fige: !seance.fige }); },
    mode() { maj(seance.mode === 'pilote' ? { mode: 'libre' } : { mode: 'pilote', arret: null }); },
    arret() { if (seance.mode !== 'pilote') maj({ arret: seance.arret != null ? null : etape() }); },
    projeter() { const a = act(); maj({ projeter: seance.projeter === a.id ? null : a.id }); }
  };
  D.commandesProf = commandes;
  $('c-prec').onclick = commandes.prec; $('c-suiv').onclick = commandes.suiv; $('c-fige').onclick = commandes.fige;
  $('c-mode').onclick = commandes.mode; $('c-arret').onclick = commandes.arret; $('c-projeter').onclick = commandes.projeter;
  ['mosaique', 'suivi', 'question', 'fil'].forEach(v => $('v-' + v).onclick = () => { vue = v; dessiner(); });
  $('seuil').onchange = dessiner; $('voir-noms').onchange = dessiner;
  $('c-ouvrir-projection').onclick = () => window.open('projection.html?seance=' + seance.id, 'mapse-direct-projection');
  $('c-ouvrir-tele').onclick = () => window.open('telecommande.html?seance=' + seance.id, 'mapse-direct-tele', 'width=430,height=820');
  $('c-fermer').onclick = () => { if (confirm('Terminer la séance pour tous les élèves ?')) store.fermerSeance(seance.id); };
  $('c-bilan').onclick = telechargerBilan;
  $('c-simu').onclick = () => { if (D.simulation) { const m = D.simulation.basculer(seance.id); $('c-simu').textContent = m ? '⏹ Arrêter les élèves fictifs' : '🤖 Lancer des élèves fictifs'; } };

  document.addEventListener('keydown', ev => {
    if (!seance || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
    const k = ev.key;
    if (k === 'ArrowRight') { commandes.suiv(); ev.preventDefault(); }
    else if (k === 'ArrowLeft') { commandes.prec(); ev.preventDefault(); }
    else if (k === ' ' && document.activeElement.tagName !== 'BUTTON') { commandes.fige(); ev.preventDefault(); }
    else if (k === 'l' || k === 'L') commandes.mode();
    else if (k === 'a' || k === 'A') commandes.arret();
    else if (k === 'p' || k === 'P') commandes.projeter();
    else if (k >= '1' && k <= '4') { vue = ['mosaique', 'suivi', 'question', 'fil'][Number(k) - 1]; dessiner(); }
    else if (k === 'Escape') { choisi = null; dessiner(); }
  });

  /* ================= Bilan pour l'Atelier ================= */
  function telechargerBilan() {
    const lignes = [['code', 'pseudo', 'type', 'connecte_a', 'etape'].concat(seance.activites.map((a, k) => (k + 1) + '. ' + (a.titre || a.type)))];
    listeCodes().forEach(code => {
      const e = eleves[code] || {};
      lignes.push([code, e.pseudo || '', typeAjout(code) || 'classe', e.arriveLe ? new Date(e.arriveLe).toLocaleTimeString('fr-FR') : 'absent', e.actuelle != null ? e.actuelle + 1 : '']
        .concat(seance.activites.map(a => { const r = e.reponses && e.reponses[a.id]; if (!r) return ''; const st = statutPour(e, a); return st.statut + (st.total > 1 ? ' ' + st.bonnes + '/' + st.total : ''); })));
    });
    const csv = '﻿' + lignes.map(l => l.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'MaPSE-Direct-' + (seance.classe || 'classe') + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  }

  async function demarrer() {
    dessinerMesSeances();
    const id = new URLSearchParams(location.search).get('seance');
    if (!id) return;
    const s = await store.lireSeance(id);
    if (s && s.ouverte) ouvrir(id);
  }
  dessinerCatalogue();
  if (D.moteur === 'firebase') {
    // En ligne : pas d'élèves fictifs (seuls de vrais appareils peuvent écrire une case d'élève).
    $('bloc-demo').classList.add('cache');
    D.porteProf(demarrer);
  } else demarrer();
})();
