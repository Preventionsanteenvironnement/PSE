/* MaPSE Direct — moteur Firebase (Firestore du projet devoirs-pse), 18/11/2026
 *
 * À charger APRÈS direct-store.js. Il remplace le moteur « local » par Firestore, avec la même interface,
 * sauf en mode essai : adresse avec ?essai=1 (tout reste alors dans le navigateur, comme le prototype).
 *
 * Qui écrit quoi (règles publiées le 18/11/2026, collections direct_*) :
 *   direct_codes/{codeSeance}               le professeur ; tout le monde peut lire UN code (pas la liste)
 *   direct_seances/{id}                     le professeur ; lisible par tout appareil connecté
 *   direct_seances/{id}/eleves/{code}       l'élève seul (connexion anonyme), et seulement si son code est prévu
 *   direct_seances/{id}/consignes/{code}    le professeur ; lisible par le professeur et par l'élève concerné
 * Le professeur = le compte Google inscrit dans les règles Firebase (son adresse n'est pas écrite ici, page publique).
 * Aucun nom d'élève n'est envoyé : seulement le code à 4 caractères, le pseudo et l'avatar.
 */
(function (global) {
  'use strict';
  const D = global.MapseDirect;
  if (!D || !D.store) { console.error('MaPSE Direct : charger direct-store.js avant direct-firebase.js'); return; }

  /* ---------- Choix du moteur ---------- */
  const CLE_MOTEUR = 'mapse-direct-moteur';
  const params = new URLSearchParams(global.location.search);
  let essai = false;
  try {
    if (params.get('essai') === '1') sessionStorage.setItem(CLE_MOTEUR, 'local');
    if (params.get('essai') === '0') sessionStorage.removeItem(CLE_MOTEUR);
    essai = sessionStorage.getItem(CLE_MOTEUR) === 'local';
  } catch (e) { essai = params.get('essai') === '1'; }
  D.BATTEMENT_MS = 5000;
  if (essai) { D.moteur = 'local'; return; }

  D.moteur = 'firebase';
  // En ligne, chaque signe de vie est une écriture : un toutes les 25 s (25 élèves ≈ 3 600 écritures par heure).
  D.BATTEMENT_MS = 25000;
  D.PRESENCE_MS = 75000;

  const VERSION = '10.8.1';
  const BASE = 'https://www.gstatic.com/firebasejs/' + VERSION + '/';
  const CONFIG = {
    apiKey: 'AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI',
    authDomain: 'devoirs-pse.firebaseapp.com',
    projectId: 'devoirs-pse',
    storageBucket: 'devoirs-pse.appspot.com',
    messagingSenderId: '614730413904',
    appId: '1:614730413904:web:a5dd478af5de30f6bede55'
  };
  const normaliserCode = D.normaliserCode;

  /* ---------- Démarrage ---------- */
  const pret = (async () => {
    const [appM, authM, fsM] = await Promise.all([
      import(BASE + 'firebase-app.js'), import(BASE + 'firebase-auth.js'), import(BASE + 'firebase-firestore.js')
    ]);
    const app = appM.initializeApp(CONFIG, 'mapse-direct');
    const auth = authM.getAuth(app);
    // Long polling forcé : le direct « en continu » (WebChannel) s'est bloqué sur un iPad (Safari) le 18/11/2026,
    // et il peut aussi buter sur le proxy d'un lycée. Le long polling est un peu plus lent mais plus robuste.
    const db = fsM.initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      experimentalAutoDetectLongPolling: false,
      experimentalForceLongPolling: true
    });
    // attendre que Firebase ait relu la connexion gardée sur cet appareil
    await new Promise(r => { const u = authM.onAuthStateChanged(auth, () => { u(); r(); }); });
    return Object.assign({}, authM, fsM, { auth, db });
  })();
  pret.catch(e => signaler('Connexion à Firebase impossible. Vérifie Internet puis recharge la page.', e));

  /* ---------- Messages d'erreur visibles ---------- */
  function signaler(texte, err) {
    if (err) console.error('MaPSE Direct :', texte, err);
    if (!global.document || !document.body) return;
    let boite = document.getElementById('direct-alerte');
    if (!boite) {
      boite = document.createElement('div');
      boite.id = 'direct-alerte';
      boite.setAttribute('role', 'alert');
      boite.style.cssText = 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;max-width:92vw;background:#7f1d1d;color:#fff;padding:10px 16px;border-radius:12px;font:600 15px/1.35 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.3)';
      document.body.appendChild(boite);
    }
    boite.textContent = texte;
    clearTimeout(signaler.t);
    signaler.t = setTimeout(() => boite.remove(), 9000);
  }
  D.signaler = signaler;

  /* ---------- Comptes ---------- */
  async function assurerConnexion() {
    const f = await pret;
    if (!f.auth.currentUser) await f.signInAnonymously(f.auth);
    return f;
  }
  // Est-ce le professeur ? On le demande aux règles : seul son compte peut lire les statistiques de visite.
  const verifies = {};
  async function verifierProf(f) {
    const u = f.auth.currentUser;
    if (!u || u.isAnonymous) return false;
    if (!(u.uid in verifies)) {
      verifies[u.uid] = f.getDocs(f.query(f.collection(f.db, 'statistiques_usage'), f.limit(1)))
        .then(() => true, e => { if (e.code !== 'permission-denied') { delete verifies[u.uid]; console.warn(e); } return false; });
    }
    return verifies[u.uid];
  }
  D.compte = {
    async connexionProf() {
      const f = await pret;
      const fournisseur = new f.GoogleAuthProvider();
      fournisseur.setCustomParameters({ prompt: 'select_account' });
      await f.signInWithPopup(f.auth, fournisseur);
      return verifierProf(f);
    },
    async deconnexion() { const f = await pret; await f.signOut(f.auth); },
    ecouter(rappel) {
      let u = null, fini = false;
      pret.then(f => { if (!fini) u = f.onAuthStateChanged(f.auth, async x => rappel({ email: x && x.email, anonyme: !!(x && x.isAnonymous), prof: await verifierProf(f) })); });
      return () => { fini = true; if (u) u(); };
    }
  };

  /* Écran « Connexion du professeur » pour les pages réservées (tableau de bord, télécommande, projection). */
  D.porteProf = function (quandPret) {
    let ouvert = false;
    const voile = document.createElement('div');
    voile.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(15,23,42,.92);display:flex;align-items:center;justify-content:center;padding:16px';
    voile.innerHTML = '<div style="background:#fff;color:#0f172a;border-radius:18px;max-width:440px;width:100%;padding:24px;font:16px/1.45 system-ui,sans-serif;text-align:center">' +
      '<div style="font-weight:800;font-size:1.25rem;margin-bottom:6px">MaPSE Direct — professeur</div>' +
      '<p id="porte-texte" style="margin:0 0 16px">Connexion en cours…</p>' +
      '<button type="button" id="porte-bouton" style="display:none;font:700 16px system-ui;padding:12px 18px;border-radius:12px;border:0;background:#0f766e;color:#fff;cursor:pointer">Se connecter avec Google</button>' +
      '<p style="margin:14px 0 0;font-size:.8rem;opacity:.7">Réservé au compte du professeur. Les élèves passent par mapse.fr/direct avec leur code.</p></div>';
    document.body.appendChild(voile);
    const texte = voile.querySelector('#porte-texte'), bouton = voile.querySelector('#porte-bouton');
    bouton.onclick = () => {
      bouton.disabled = true;
      D.compte.connexionProf().catch(e => { texte.textContent = 'La connexion n’a pas abouti. Réessaie.'; console.error(e); }).finally(() => { bouton.disabled = false; });
    };
    D.compte.ecouter(c => {
      if (c.prof) {
        voile.style.display = 'none';
        if (!ouvert) { ouvert = true; try { quandPret(c); } catch (e) { console.error(e); } }
        return;
      }
      voile.style.display = 'flex';
      bouton.style.display = '';
      texte.textContent = c.email && !c.anonyme
        ? 'Ce compte (' + c.email + ') n’est pas celui du professeur. Connecte-toi avec ton compte Google de professeur.'
        : 'Connecte-toi avec ton compte Google de professeur pour piloter la séance.';
    });
  };

  /* ---------- Outils ---------- */
  const cacheSeances = {}, cacheEleves = {}, cacheConsignes = {};
  let placePerdue = false;
  const refSeance = (f, id) => f.doc(f.db, 'direct_seances', id);
  const refEleve = (f, id, code) => f.doc(f.db, 'direct_seances', id, 'eleves', normaliserCode(code));
  const refConsigne = (f, id, code) => f.doc(f.db, 'direct_seances', id, 'consignes', normaliserCode(code));
  const refCode = (f, c) => f.doc(f.db, 'direct_codes', String(c));
  const nouvelId = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function propre(patch) {
    const p = {};
    Object.keys(patch || {}).forEach(k => { if (patch[k] !== undefined) p[k] = patch[k]; });
    return p;
  }
  // Écrit seulement les champs donnés (chacun remplacé en entier, comme le moteur local), crée le document s'il manque.
  function ecrireChamps(fabriqueRef, patch, quoi) {
    const p = propre(patch);
    return pret.then(f => f.setDoc(fabriqueRef(f), p, { mergeFields: Object.keys(p) }))
      .catch(e => signaler(quoi + ' : l’enregistrement n’est pas passé (' + (e.code || e.message) + ').', e));
  }
  /* Liaison en direct. Le diagnostic (nombre d'élèves reçus, dernière nouvelle) s'affiche en bas du tableau de bord
     et de la télécommande : il dit tout de suite si les nouvelles arrivent. */
  const diag = { eleves: null, derniere: 0, erreur: '' };
  function majDiag() {
    if (!document.body || document.body.classList.contains('projection') || !document.body.classList.length) return;
    let b = document.getElementById('direct-diag');
    if (!b) {
      b = document.createElement('div');
      b.id = 'direct-diag';
      b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:8000;background:rgba(15,23,42,.82);color:#e2e8f0;font:12px/1.3 system-ui,sans-serif;padding:4px 9px;border-radius:8px;pointer-events:none';
      document.body.appendChild(b);
      setInterval(majDiag, 1000);
    }
    if (diag.erreur) { b.textContent = '⚠ Liaison : ' + diag.erreur; b.style.background = 'rgba(127,29,29,.9)'; return; }
    if (diag.eleves === null) { b.textContent = '⏳ Liaison en cours…'; return; }
    const s = Math.round((Date.now() - diag.derniere) / 1000);
    b.textContent = '📡 ' + diag.eleves + ' élève(s) reçu(s) · dernière nouvelle il y a ' + s + ' s';
    b.style.background = s > 60 ? 'rgba(146,64,14,.9)' : 'rgba(15,23,42,.82)';
  }
  function abonnement(quoi, fabriqueRef, traiter) {
    let u = null, fini = false;
    assurerConnexion().then(f => {
      if (fini) return;
      u = f.onSnapshot(fabriqueRef(f), sn => { if (!fini) traiter(sn); }, e => {
        signaler(quoi + ' : la liaison en direct est coupée (' + (e.code || e.message) + '). Recharge la page.', e);
        if (quoi === 'Élèves') { diag.erreur = e.code || e.message; majDiag(); }
      });
    }).catch(e => signaler('Connexion impossible.', e));
    return () => { fini = true; if (u) u(); };
  }
  function avecIdSeance(snap) { return snap.exists() ? Object.assign({ id: snap.id }, snap.data()) : null; }

  /* ---------- Le moteur ---------- */
  const moteurFirebase = {
    nom: 'firebase',

    /* --- professeur --- */
    async creerSeance(donnees) {
      const f = await pret;
      if (!(await verifierProf(f))) throw new Error('Seul le compte du professeur peut lancer une séance.');
      const ref = f.doc(f.collection(f.db, 'direct_seances'));
      let codeSeance = null;
      for (let essai = 0; essai < 40 && !codeSeance; essai++) {
        const c = String(Math.floor(1000 + Math.random() * 9000));
        if (!(await f.getDoc(refCode(f, c))).exists()) codeSeance = c;
      }
      if (!codeSeance) throw new Error('Aucun code de séance libre.');
      const seance = Object.assign({
        codeSeance, creeLe: Date.now(), ouverte: true,
        mode: 'pilote', etape: 0, fige: false, projeter: null, arret: null
      }, propre(donnees));
      seance.codesAutorises = (seance.codesAutorises || []).map(normaliserCode).filter(Boolean);
      delete seance.id;
      await f.setDoc(ref, seance);
      await f.setDoc(refCode(f, codeSeance), { id: ref.id, creeLe: seance.creeLe });
      cacheSeances[ref.id] = Object.assign({ id: ref.id }, seance);
      return cacheSeances[ref.id];
    },
    async mesSeancesOuvertes() {
      const f = await pret;
      if (!(await verifierProf(f))) return [];
      const snap = await f.getDocs(f.query(f.collection(f.db, 'direct_seances'), f.where('ouverte', '==', true)));
      return snap.docs.map(avecIdSeance).sort((a, b) => (b.creeLe || 0) - (a.creeLe || 0)).slice(0, 30);
    },
    majSeance(id, patch) {
      const p = Object.assign(propre(patch), { majLe: Date.now() });
      cacheSeances[id] = Object.assign({}, cacheSeances[id] || { id }, p);
      ecrireChamps(f => refSeance(f, id), p, 'Séance');
      return cacheSeances[id];
    },
    fermerSeance(id) {
      const s = moteurFirebase.majSeance(id, { ouverte: false, fermeeLe: Date.now() });
      if (s && s.codeSeance) pret.then(f => f.deleteDoc(refCode(f, s.codeSeance))).catch(e => console.warn(e));
      return s;
    },
    majConsigne(id, code, patch) {
      code = normaliserCode(code);
      const p = Object.assign(propre(patch), { majLe: Date.now() });
      cacheConsignes[id] = cacheConsignes[id] || {};
      cacheConsignes[id][code] = Object.assign({}, cacheConsignes[id][code] || {}, p);
      ecrireChamps(f => refConsigne(f, id, code), p, 'Consigne pour ' + code);
      return cacheConsignes[id][code];
    },
    async ajouterMessage(id, code, texte, genre) {
      code = normaliserCode(code);
      let c = (cacheConsignes[id] || {})[code];
      if (!c) {
        const f = await pret;
        try { const s = await f.getDoc(refConsigne(f, id, code)); c = s.exists() ? s.data() : {}; } catch (e) { c = {}; }
      }
      const messages = (c.messages || []).concat([{ id: nouvelId(), texte, genre: genre || 'aide', le: Date.now() }]);
      return moteurFirebase.majConsigne(id, code, { messages: messages.slice(-20) });
    },
    libererPlace(id, code) {
      code = normaliserCode(code);
      if (cacheEleves[id]) delete cacheEleves[id][code];
      return pret.then(f => f.deleteDoc(refEleve(f, id, code)))
        .catch(e => signaler('Impossible de libérer la place de ' + code + ' (' + (e.code || e.message) + ').', e));
    },
    ecouterEleves(id, rappel) {
      // La présence est datée à l'heure de CET appareil (à la réception), pas à l'horloge de l'élève, souvent décalée.
      // Un signe de vie nouveau = la valeur « vu » a changé depuis la dernière lecture.
      const recuLe = {}, dernierVu = {};
      return abonnement('Élèves', f => f.collection(f.db, 'direct_seances', id, 'eleves'), snap => {
        diag.eleves = snap.size; diag.derniere = Date.now(); diag.erreur = ''; majDiag();
        const res = {};
        snap.forEach(d => {
          const e = d.data();
          if (d.id in dernierVu && dernierVu[d.id] !== e.vu) recuLe[d.id] = Date.now();
          dernierVu[d.id] = e.vu;
          if (recuLe[d.id] && e.connecte !== false) e.vu = recuLe[d.id];
          res[d.id] = e;
        });
        Object.keys(dernierVu).forEach(c => { if (!res[c]) { delete dernierVu[c]; delete recuLe[c]; } });
        cacheEleves[id] = res;
        rappel(Object.assign({}, res));
      });
    },
    ecouterConsignes(id, rappel) {
      return abonnement('Consignes', f => f.collection(f.db, 'direct_seances', id, 'consignes'), snap => {
        const res = {};
        snap.forEach(d => { res[d.id] = d.data(); });
        cacheConsignes[id] = res;
        rappel(Object.assign({}, res));
      });
    },

    /* --- élève --- */
    async trouverSeance(codeSeance) {
      const f = await assurerConnexion();
      const c = String(codeSeance || '').trim();
      if (!/^[0-9]{4}$/.test(c)) return null;
      const r = await f.getDoc(refCode(f, c));
      if (!r.exists()) return null;
      const s = avecIdSeance(await f.getDoc(refSeance(f, r.data().id)));
      if (s) cacheSeances[s.id] = s;
      return s && s.ouverte ? s : null;
    },
    /* Prend la place de l'élève dans la séance. Renvoie ce qu'il avait déjà fait (même appareil), ou {}.
       Échoue (erreur 'place-prise') si ce code est déjà utilisé depuis un autre appareil : le professeur peut libérer la place. */
    async rejoindre(id, code) {
      const f = await assurerConnexion();
      code = normaliserCode(code);
      try {
        const s = await f.getDoc(refEleve(f, id, code));
        if (s.exists()) { (cacheEleves[id] = cacheEleves[id] || {})[code] = s.data(); return s.data(); }
      } catch (e) { if (e.code !== 'permission-denied') throw e; }
      const debut = { uid: f.auth.currentUser.uid, code, arriveLe: Date.now() };
      try { await f.setDoc(refEleve(f, id, code), debut); }
      catch (e) { if (e.code === 'permission-denied') { const err = new Error('place-prise'); err.code = 'place-prise'; throw err; } throw e; }
      (cacheEleves[id] = cacheEleves[id] || {})[code] = debut;
      return debut;
    },
    async lireEleve(id, code) {
      code = normaliserCode(code);
      if (cacheEleves[id] && cacheEleves[id][code]) return cacheEleves[id][code];
      try { const f = await assurerConnexion(); const s = await f.getDoc(refEleve(f, id, code)); return s.exists() ? s.data() : null; }
      catch (e) { return null; }
    },
    majEleve(id, code, patch) {
      code = normaliserCode(code);
      cacheEleves[id] = cacheEleves[id] || {};
      const p = Object.assign(propre(patch), { code, majLe: Date.now() });
      cacheEleves[id][code] = Object.assign({}, cacheEleves[id][code] || {}, p);
      if (placePerdue) return cacheEleves[id][code];
      // updateDoc et non setDoc : si le professeur a libéré la place, cet appareil ne recrée pas la case
      // (la case a été créée une fois pour toutes par rejoindre()).
      assurerConnexion().then(f => {
        p.uid = f.auth.currentUser.uid;
        return f.updateDoc(refEleve(f, id, code), p);
      }).catch(e => {
        if (e.code === 'not-found' || e.code === 'permission-denied') {
          if (!placePerdue) { placePerdue = true; console.warn('MaPSE Direct : place perdue', e.code); if (moteurFirebase.surPlacePerdue) moteurFirebase.surPlacePerdue(e.code); }
          return;
        }
        signaler('Ton travail ne s’enregistre pas (Internet ?). Garde la page ouverte.', e);
      });
      return cacheEleves[id][code];
    },
    ecouterConsigne(id, code, rappel) {
      return abonnement('Messages du professeur', f => refConsigne(f, id, code), s => rappel(s.exists() ? s.data() : {}));
    },

    /* --- tous --- */
    ecouterSeance(id, rappel) {
      return abonnement('Séance', f => refSeance(f, id), s => {
        const v = avecIdSeance(s);
        if (v) cacheSeances[id] = v;
        rappel(v);
      });
    },
    async lireSeance(id) {
      if (!id) return null;
      try { const f = await assurerConnexion(); const v = avecIdSeance(await f.getDoc(refSeance(f, id))); if (v) cacheSeances[id] = v; return v; }
      catch (e) { return null; }
    },
    toutEffacer() { signaler('En ligne, rien ne s’efface d’ici : les séances se ferment avec « Terminer la séance ».'); }
  };

  D.store = moteurFirebase;

  // Bandeau : on dit clairement que la séance est en ligne.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.pastille-demo').forEach(p => {
      p.textContent = 'En ligne';
      p.title = 'Séance en direct sur Internet (Firebase). Aucun nom d’élève n’est envoyé.';
      p.style.background = '#ccfbf1'; p.style.color = '#115e59';
    });
  });
})(window);
