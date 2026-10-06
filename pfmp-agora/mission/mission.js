/* Mission stage — moteur des chapitres et des 6 types de jeux.
   Écrans : #  (le chemin)   ·   #ch/<id>  (un jeu)   — la flèche « retour » du navigateur marche.
   Résultats : localStorage (« mission-stage-v1 »), et sur la fiche PFMP en ligne de l'élève quand elle existe
   (coordination_pfmp_suivi/<fiche>/jeux, base coordination-pedagogie ; échec silencieux sinon). */
(function () {
  'use strict';
  const M = window.MISSION;
  const $app = () => document.getElementById('app');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const melange = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const CLE = 'mission-stage-v1';
  const tous = () => M.chapitres.concat([M.final]);
  function toast(t) { const el = document.getElementById('toast'); el.textContent = t; el.classList.add('vu'); clearTimeout(toast.m); toast.m = setTimeout(() => el.classList.remove('vu'), 2600); }

  /* ── Mémoire ─────────────────────────────────────────────────────────── */
  const code = () => { try { return (localStorage.getItem('codeEleve') || 'invite').toUpperCase(); } catch (e) { return 'invite'; } };
  function lire() { try { return (JSON.parse(localStorage.getItem(CLE) || '{}')[code()]) || {}; } catch (e) { return {}; } }
  function noter(id, score, sur) {
    let tout = {}; try { tout = JSON.parse(localStorage.getItem(CLE) || '{}'); } catch (e) {}
    const moi = tout[code()] = tout[code()] || {};
    const avant = moi[id];
    if (!avant || score >= avant.score) moi[id] = { score, sur, le: new Date().toISOString() };
    try { localStorage.setItem(CLE, JSON.stringify(tout)); } catch (e) {}
    enLigne(id, score, sur);
  }
  const reussi = r => r && r.score / r.sur >= 0.8;

  /* Sur la fiche PFMP de l'élève, si elle existe (base coordination-pedagogie). */
  const CFG = { apiKey: 'AIzaSyBj_GXG8ln3GAxNXxiJkT2HPSWIHJpc1lA', authDomain: 'coordination-pedagogie.firebaseapp.com', projectId: 'coordination-pedagogie', storageBucket: 'coordination-pedagogie.firebasestorage.app', messagingSenderId: '526058585010', appId: '1:526058585010:web:ba4dd6d9c8281ba5bf02ab' };
  async function enLigne(id, score, sur) {
    try {
      const c = code(); if (c === 'invite' || !window.firebase || !window.firebase.firestore) return;
      const fb = window.firebase;
      const fs = ((fb.apps || []).find(a => a.name === 'pfmp-suivi') || fb.initializeApp(CFG, 'pfmp-suivi')).firestore();
      const d = new Date(), y = d.getFullYear(), annee = d.getMonth() >= 7 ? y + '-' + (y + 1) : (y - 1) + '-' + y;
      const auj = d.toISOString().slice(0, 10);
      let cible = null;
      for (const n of [1, 2]) {
        const s = await fs.doc('coordination_pfmp_suivi/' + annee + '_' + c + '_p' + n).get();
        if (s.exists) { cible = s.id; if ((s.data().fin || '') >= auj) break; }
      }
      if (cible) await fs.collection('coordination_pfmp_suivi/' + cible + '/jeux').doc().set({ jeu: id, score, sur, le: d.toISOString() });
    } catch (e) { /* hors ligne ou règles pas encore publiées : le résultat reste dans ce navigateur */ }
  }

  /* ── Écrans ──────────────────────────────────────────────────────────── */
  function rendre() {
    const h = location.hash;
    if (h.startsWith('#ch/')) return ecranJeu(decodeURIComponent(h.slice(4)));
    ecranChemin();
  }
  window.addEventListener('hashchange', () => { rendre(); window.scrollTo(0, 0); });

  function ecranChemin() {
    const res = lire(), liste = M.chapitres;
    const faits = tous().filter(c => reussi(res[c.id])).length;
    const auj = new Date().toISOString().slice(0, 10);
    let ici = liste.findIndex(c => !reussi(res[c.id]));
    const parDate = liste.reduce((k, c, i) => c.date <= auj ? i : k, 0);
    $app().innerHTML = `
      <div class="haut"><a class="retour" href="../index.html"><i class="ti ti-chevron-left"></i> Mon carnet</a><span class="esp"></span><span class="prog">${faits} / ${tous().length}</span></div>
      <div class="titre"><span class="logo"><i class="ti ti-flag-3"></i></span><h1>Mission stage</h1></div>
      <div class="barre"><i style="width:${Math.round(faits / tous().length * 100)}%"></i></div>
      <div class="aujourdhui"><i class="ti ti-calendar-event"></i> Aujourd’hui : ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      <div class="chemin">
        ${liste.map((c, i) => {
          const r = res[c.id], ok = reussi(r);
          const etat = ok ? '<span class="chip ok"><i class="ti ti-check"></i> Réussi</span>' : r ? `<span class="chip essai">${r.score} / ${r.sur}</span>` : i === parDate ? '<span class="chip ici">En ce moment</span>' : '';
          return `<button class="ch ${ok ? 'fait' : ''} ${i === ici ? 'ici' : ''}" data-aller="${c.id}">
            <span class="pt">${ok ? '<i class="ti ti-check"></i>' : i + 1}</span>
            <span class="carte"><img src="${c.img}" alt="" loading="lazy"><span><span class="quand">${esc(c.quand)}</span><h2>${esc(c.titre)}</h2>${etat}</span></span>
          </button>`;
        }).join('')}
        <button class="ch final ${reussi(res.final) ? 'fait' : ''}" data-aller="final">
          <span class="pt">${reussi(res.final) ? '<i class="ti ti-trophy"></i>' : '<i class="ti ti-trophy"></i>'}</span>
          <span class="carte"><span><span class="quand">Pour finir</span><h2>${esc(M.final.titre)}</h2>${res.final ? `<span class="chip ok">${res.final.score} / ${res.final.sur}</span>` : ''}</span></span>
        </button>
      </div>`;
    $app().querySelectorAll('[data-aller]').forEach(b => b.onclick = () => { location.hash = '#ch/' + b.dataset.aller; });
  }

  function ecranJeu(id) {
    const ch = tous().find(c => c.id === id);
    if (!ch) { location.hash = ''; return; }
    const j = ch.jeu;
    $app().innerHTML = `
      <div class="haut"><a class="retour" href="#"><i class="ti ti-chevron-left"></i> Mission</a><span class="esp"></span><span class="prog">${esc(ch.quand || '')}</span></div>
      ${ch.img ? `<img class="scene" src="${ch.img}" alt="">` : ''}
      <div class="entete"><h1>${esc(ch.titre)}</h1></div>
      <div class="consigne"><i class="ti ti-hand-finger"></i><span>${esc(j.consigne)}</span></div>
      <div class="jeu" id="jeu"></div>
      <div id="fin"></div>`;
    const zone = document.getElementById('jeu');
    const fini = (score, sur, texteFin) => { noter(ch.id, score, sur); finir(ch, score, sur, texteFin); };
    ({ cibles, dialogue, ordre, multi, qcm, associer })[j.type](zone, j, fini);
  }

  function finir(ch, score, sur, texteFin) {
    const ok = score / sur >= 0.8;
    const liste = tous(), i = liste.findIndex(c => c.id === ch.id), suivant = liste[i + 1];
    const fin = document.getElementById('fin');
    fin.innerHTML = `<div class="resultat ${ok ? '' : 'moyen'}" style="margin-top:14px">
      ${ch.id === 'final' && ok ? '<div class="badge"><i class="ti ti-award"></i>Prêt pour mon stage</div>' : `<div class="rond"><i class="ti ti-${ok ? 'check' : 'refresh'}"></i></div>`}
      <h2>${ok ? 'Réussi' : 'Presque'}</h2><div class="note">${score} / ${sur}</div>
      ${texteFin ? `<div class="pq ok">${esc(texteFin)}</div>` : ''}
      <div class="btns"><button class="btn sec" id="rejouer"><i class="ti ti-refresh"></i> Rejouer</button>
      ${suivant ? `<button class="btn pri" id="suivant">${esc(suivant.titre)} <i class="ti ti-chevron-right"></i></button>` : '<a class="btn pri" href="#"><i class="ti ti-route"></i> Le chemin</a>'}</div></div>`;
    document.getElementById('rejouer').onclick = () => rendre();
    const s = document.getElementById('suivant'); if (s) s.onclick = () => { location.hash = '#ch/' + suivant.id; };
    fin.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ── Les 6 jeux ──────────────────────────────────────────────────────── */

  /* Toucher les bonnes lignes d'un document (erreurs du CV, cases vides de la pré-convention). */
  function cibles(zone, j, fini) {
    const aTrouver = j.lignes.filter(l => l.faux).length;
    let trouves = 0, rates = 0;
    zone.innerHTML = `<div class="compteur" id="cpt">0 / ${aTrouver}</div><div class="doc">${j.lignes.map((l, i) => `<button data-i="${i}" class="${l.k === 'titre' ? 'titre-doc' : l.k === 'section' ? 'section' : ''}">${esc(l.t)}</button>`).join('')}</div><div id="pq"></div>`;
    zone.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
      const l = j.lignes[+b.dataset.i];
      if (b.classList.contains('trouve')) return;
      if (l.faux) {
        b.classList.add('trouve'); trouves++;
        document.getElementById('pq').innerHTML = `<div class="pq ok">${esc(l.pq)}</div>`;
        document.getElementById('cpt').textContent = trouves + ' / ' + aTrouver;
        if (trouves === aTrouver) fini(Math.max(0, aTrouver - rates), aTrouver);
      } else {
        rates++; b.classList.add('rate', 'secoue'); setTimeout(() => b.classList.remove('rate', 'secoue'), 500);
      }
    });
  }

  /* Un appel téléphonique : à chaque tour, choisir la bonne réponse. */
  function dialogue(zone, j, fini) {
    let t = 0, bons = 0;
    zone.innerHTML = '<div id="fil" style="display:grid;gap:8px"></div><div id="choix" style="display:grid;gap:8px;margin-top:6px"></div>';
    const fil = zone.querySelector('#fil'), choix = zone.querySelector('#choix');
    function tour() {
      if (t >= j.tours.length) { choix.innerHTML = ''; fini(bons, j.tours.length); return; }
      const tr = j.tours[t];
      fil.insertAdjacentHTML('beforeend', `<div class="bulle eux"><small>Au téléphone</small>${esc(tr.dit)}</div>`);
      choix.innerHTML = melange(tr.rep).map(([txt, ok]) => `<button class="opt" data-ok="${ok}"><span class="coche"><i class="ti ti-check"></i></span>${esc(txt)}</button>`).join('');
      choix.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const ok = b.dataset.ok === '1';
        if (ok) bons++;
        choix.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.dataset.ok === '1') x.classList.add('bon'); });
        if (!ok) b.classList.add('mauvais');
        const bonTxt = tr.rep.find(r => r[1])[0];
        setTimeout(() => {
          fil.insertAdjacentHTML('beforeend', `<div class="bulle moi"><small>Vous</small>${esc(bonTxt)}</div>${ok ? '' : `<div class="pq non">${esc(tr.pq)}</div>`}`);
          t++; tour();
        }, ok ? 500 : 1400);
      });
    }
    tour();
  }

  /* Remettre dans l'ordre : on touche les cartes l'une après l'autre. */
  function ordre(zone, j, fini) {
    let suivant = 0, erreurs = 0;
    const cartes = melange(j.etapes.map((e, i) => Object.assign({ i }, e)));
    zone.innerHTML = `<div class="ordre-zone">${cartes.map(c => `<button class="carte-o" data-i="${c.i}"><span class="n">?</span>${c.p ? `<img src="${M.personnes[c.p].img}" alt="">` : ''}<span>${esc(c.t)}</span></button>`).join('')}</div>`;
    zone.querySelectorAll('.carte-o').forEach(b => b.onclick = () => {
      if (b.classList.contains('place')) return;
      if (+b.dataset.i === suivant) {
        b.classList.add('place'); b.querySelector('.n').textContent = ++suivant;
        const z = zone.querySelector('.ordre-zone'); const avant = [...z.querySelectorAll('.place')].filter(x => x !== b); z.insertBefore(b, avant.length ? avant[avant.length - 1].nextSibling : z.firstChild);
        if (suivant === j.etapes.length) fini(Math.max(0, j.etapes.length - erreurs), j.etapes.length, j.fin);
      } else { erreurs++; b.classList.add('secoue'); setTimeout(() => b.classList.remove('secoue'), 400); }
    });
  }

  /* Choisir toutes les bonnes réponses, puis valider. */
  function multi(zone, j, fini) {
    const opts = melange(j.options);
    const nbBons = opts.filter(o => o[1]).length;
    zone.innerHTML = opts.map(([t, ok], i) => `<button class="opt" data-ok="${ok}"><span class="coche"><i class="ti ti-check"></i></span>${esc(t)}</button>`).join('') + `<button class="btn pri" id="valider" style="justify-self:start;margin-top:4px"><i class="ti ti-check"></i> Valider</button><div id="pq"></div>`;
    zone.querySelectorAll('.opt').forEach(b => b.onclick = () => b.classList.toggle('choisi'));
    zone.querySelector('#valider').onclick = () => {
      let bons = 0;
      zone.querySelectorAll('.opt').forEach(b => {
        const ok = b.dataset.ok === '1', ch = b.classList.contains('choisi');
        b.disabled = true; b.classList.remove('choisi');
        if (ok) b.classList.add('bon'); else if (ch) b.classList.add('mauvais');
        if (ok && ch) bons++; if (!ok && ch) bons--;
      });
      zone.querySelector('#valider').remove();
      if (j.pq) zone.querySelector('#pq').innerHTML = `<div class="pq">${esc(j.pq)}</div>`;
      fini(Math.max(0, bons), nbBons);
    };
  }

  /* Questions à choix unique, l'une après l'autre. */
  function qcm(zone, j, fini) {
    let q = 0, bons = 0;
    function poser() {
      if (q >= j.questions.length) { fini(bons, j.questions.length); return; }
      const Q = j.questions[q];
      zone.innerHTML = `<div class="compteur">Question ${q + 1} / ${j.questions.length}</div><div class="item-a" style="text-align:left">${esc(Q.q)}</div>` +
        melange(Q.rep).map(([t, ok]) => `<button class="opt" data-ok="${ok}"><span class="coche"><i class="ti ti-check"></i></span>${esc(t)}</button>`).join('') + '<div id="pq"></div>';
      zone.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const ok = b.dataset.ok === '1'; if (ok) bons++;
        zone.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.dataset.ok === '1') x.classList.add('bon'); });
        if (!ok) b.classList.add('mauvais');
        zone.querySelector('#pq').innerHTML = (Q.pq ? `<div class="pq ${ok ? 'ok' : 'non'}">${esc(Q.pq)}</div>` : '') + `<button class="btn pri" id="ensuite" style="margin-top:8px">${q + 1 < j.questions.length ? 'Question suivante' : 'Terminer'} <i class="ti ti-chevron-right"></i></button>`;
        zone.querySelector('#ensuite').onclick = () => { q++; poser(); };
      });
    }
    poser();
  }

  /* Associer chaque action à la bonne personne. */
  function associer(zone, j, fini) {
    const items = melange(j.items);
    let k = 0, bons = 0;
    function poser() {
      if (k >= items.length) { fini(bons, items.length); return; }
      const [t, qui] = items[k];
      zone.innerHTML = `<div class="compteur">${k + 1} / ${items.length}</div><div class="item-a">${esc(t)}</div><div class="persos">${j.personnes.map(p => `<button class="perso" data-p="${p}"><img src="${M.personnes[p].img}" alt="">${esc(M.personnes[p].nom)}</button>`).join('')}</div>`;
      zone.querySelectorAll('.perso').forEach(b => b.onclick = () => {
        const ok = b.dataset.p === qui; if (ok) bons++;
        zone.querySelectorAll('.perso').forEach(x => { x.disabled = true; if (x.dataset.p === qui) x.classList.add('bon'); });
        if (!ok) b.classList.add('mauvais');
        setTimeout(() => { k++; poser(); }, ok ? 650 : 1500);
      });
    }
    poser();
  }

  rendre();
})();
