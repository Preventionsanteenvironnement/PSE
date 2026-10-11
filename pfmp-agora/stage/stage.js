/* ═══════════════════════════════════════════════════════════════════════════
   MON STAGE PFMP — le parcours de l'élève (mapse.fr › Mon espace › PFMP AGOrA)
   Écrans (chacun est une entrée d'historique) :
     #              accueil : « Déclarer un stage », puis compte à rebours, frise, phase en cours
     #declarer      avatar, PFMP 1 ou 2, dates, domaine (toujours modifiable)
     #p/<phase>     preparation · fiche · preconvention · convention · depart · stage · retour
     #recherches    l'agenda des recherches (entreprise, téléphone, quand, comment, réponse)
     #aide          Besoin d'aide ? : une question (réponse immédiate) ou un problème (un clic prévient le référent)
     Aucune messagerie libre : l'élève n'écrit jamais à un adulte (règle de sécurité du 11/10/2026).
   Rien ne bloque : toutes les pages restent ouvertes. Chaque choix « Autre » ouvre un champ libre.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const P = window.PFMP_COMMUN;
  const CFG = { apiKey: 'AIzaSyBj_GXG8ln3GAxNXxiJkT2HPSWIHJpc1lA', authDomain: 'coordination-pedagogie.firebaseapp.com', projectId: 'coordination-pedagogie', storageBucket: 'coordination-pedagogie.firebasestorage.app', messagingSenderId: '526058585010', appId: '1:526058585010:web:ba4dd6d9c8281ba5bf02ab' };
  const ANNEE = P.anneeScolaire();
  const AVATARS = [['cat', '#D85A30'], ['dog', '#BA7517'], ['butterfly', '#D4537E'], ['fish', '#378ADD'], ['plant-2', '#639922'], ['rocket', '#534AB7'], ['feather', '#1D9E75'], ['planet', '#7F77DD'], ['bike', '#185FA5'], ['music', '#993556'], ['star', '#EF9F27'], ['paw', '#854F0B'], ['ball-football', '#3B6D11'], ['palette', '#A32D2D'], ['camera', '#5F5E5A'], ['bolt', '#C2410C'], ['leaf', '#0F6E56'], ['moon', '#3C3489']];
  const HUMEURS = [['mood-happy', 'Super'], ['mood-smile', 'Bien'], ['mood-neutral', 'Bof'], ['mood-sad', 'Pas bien'], ['mood-nervous', 'Stressé']];
  const DOMAINES = ['Accueil', 'Secrétariat', 'Comptabilité', 'Commerce', 'Logistique', 'Ressources humaines', 'Autre'];
  const STRUCTURES = ['Entreprise privée', 'Association', 'Collectivité', 'Administration', 'Santé', 'Autre'];
  const MOYENS = { appel: ['phone', 'Appel'], visite: ['walk', 'Sur place'], mail: ['mail', 'Mail'], courrier: ['mailbox', 'Courrier'], autre: ['dots', 'Autre'] };
  const REPONSES = { attente: ['En attente', 'att'], pasrep: ['Pas de réponse', 'gris'], rappeler: ['À rappeler', 'att'], entretien: ['Entretien', 'bleu'], refus: ['Refus', 'non'], accord: ['Accord', 'ok'], autre: ['Autre', 'gris'] };
  const VERBES = { appel: 'Appeler', visite: 'Passer chez', mail: 'Écrire à', courrier: 'Écrire à', autre: 'Contacter' };
  const FAIT = { appel: 'Appelé', visite: 'Passé', mail: 'Envoyé', courrier: 'Envoyé', autre: 'Fait' };
  const AVEC = ['Seul', 'Un parent', 'Un professeur', 'Un ami', 'Autre'];
  const SUGG = ['Finir mon CV', 'Finir ma lettre de motivation', 'Appeler 3 entreprises', 'Passer dans une entreprise', 'Envoyer un mail de candidature', 'Préparer mon entretien'];
  const PHASES = {
    preparation: { t: 'Préparation', ic: 'briefcase', sous: 'Avant la recherche d’entreprise' },
    fiche: { t: 'Ma fiche de négociation', ic: 'list-check', sous: 'Avec l’entreprise, avant la pré-convention' },
    preconvention: { t: 'Ma pré-convention', ic: 'file-text', sous: 'L’engagement de l’entreprise' },
    convention: { t: 'Ma convention', ic: 'signature', sous: 'À signer avant le départ' },
    depart: { t: 'Prêt à partir', ic: 'backpack', sous: 'La semaine d’avant' },
    stage: { t: 'Pendant le stage', ic: 'building', sous: '' },
    retour: { t: 'Attestation et bilan', ic: 'trophy', sous: 'Au retour' }
  };
  const ORDRE = ['preparation', 'recherches', 'fiche', 'preconvention', 'convention', 'depart', 'stage', 'retour'];
  /* Fiche de négociation (07/10/2026) : les étapes du socle commun, partagées avec le référent et le professeur principal. */
  const NEG = [['neg_visit', 'Je suis allé à l’entreprise avec ma fiche de négociation'], ['neg_company', 'L’entreprise l’a signée, avec le cachet'], ['neg_family', 'Je l’ai signée, ou mon responsable légal'],
    ['neg_pro', 'Validée par mon enseignant professionnel'], ['neg_return', 'Je l’ai remise à mon enseignant référent'], ['neg_signed', 'Signée et gardée par mon référent']];
  const NEG_A = { neg_visit: 'Aller à l’entreprise avec ma fiche de négociation', neg_company: 'Faire signer la fiche, avec le cachet, par l’entreprise', neg_family: 'Signer la fiche de négociation (ou mon responsable légal)',
    neg_pro: 'Faire valider la fiche par l’enseignant professionnel', neg_return: 'Remettre la fiche à mon enseignant référent' };
  const DEPART_A = { adresse: 'Noter l’adresse du lieu de stage', horaires: 'Connaître mes horaires', tuteur: 'Noter le nom de mon tuteur', tel: 'Noter le numéro de l’entreprise', trajet: 'Repérer mon trajet' };
  const DEPART = [['adresse', 'Je connais l’adresse du lieu de stage'], ['horaires', 'Je connais mes horaires'], ['tuteur', 'Je connais le nom de mon tuteur'], ['tel', 'J’ai le numéro de l’entreprise'], ['trajet', 'J’ai repéré mon trajet'], ['absence', 'Absent ou en retard : je préviens l’entreprise et la vie scolaire']];

  /* Rappels « C'est quoi ? » : une phrase, puis les étapes en quelques mots (procédure, check-list, convention). */
  const RAPPELS = {
    fiche: ['Le document où l’entreprise indique les activités qu’elle vous confiera.', ['À présenter à l’entreprise : le tuteur coche les activités prévues (colonne a)', 'Signature et cachet de l’entreprise', 'Votre signature, ou celle de votre responsable légal', 'Validation par votre enseignant professionnel', 'À remettre à votre enseignant référent, qui la signe et la garde'], 'Ensuite : la pré-convention'],
    preconvention: ['Le document par lequel l’entreprise s’engage à vous accueillir.', ['Remise par votre professeur référent', 'Remplie par l’entreprise : dates, adresse, responsable, assurance, tuteur, horaires', 'Signature et cachet de l’entreprise', 'À rendre à votre professeur référent'], 'Ensuite : la convention'],
    convention: ['Le contrat entre le lycée, l’entreprise et vous.', ['Préparée par votre professeur référent', 'Signée par l’entreprise et le tuteur, avec le cachet', 'Signée par vous, ou par votre responsable légal si vous êtes mineur', 'Rendue au professeur référent, puis signée par la cheffe d’établissement', 'Un exemplaire pour votre famille, un pour l’entreprise'], 'À faire avant le départ'],
    retour: ['L’attestation de stage prouve vos jours de stage.', ['Remise par l’entreprise à la fin du stage', 'À rendre à votre professeur référent', 'Elle permet le versement de l’allocation de l’État'], '']
  };
  function rappel(k) {
    const r = RAPPELS[k]; if (!r) return '';
    return `<details class="rappel"><summary><i class="ti ti-info-circle"></i> C’est quoi ?<i class="ti ti-chevron-down fl"></i></summary>
      <p class="def">${esc(r[0])}</p><ol>${r[1].map(x => `<li>${esc(x)}</li>`).join('')}</ol>${r[2] ? `<p class="apres"><i class="ti ti-arrow-right"></i> ${esc(r[2])}</p>` : ''}</details>`;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const auj = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const fr = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
  const frCourt = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
  const plusJ = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const prochainMercredi = () => { let d = plusJ(auj(), 1); while (new Date(d + 'T12:00:00').getDay() !== 3) d = plusJ(d, 1); return d; };
  const hh = s => s ? s.replace(':', '\u00a0h\u00a0') : '';
  const frLong = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const $ = id => document.getElementById(id);
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('vu'); clearTimeout(toast.m); toast.m = setTimeout(() => el.classList.remove('vu'), 2600); }

  /* ── Données de l'élève ──────────────────────────────────────────────── */
  let code = '', L = null, fs = null, svc = null;
  const suivis = {}, arrets = [];
  let arretParcours = null, msgs = [], arretMsgs = null, plus = false, formR = null, confirmeRetrait = '';
  const vierge = () => ({ avatar: null, declaration: { pfmp: '', debut: '', fin: '', domaine: '', domaineAutre: '' }, prepa: {}, fiche: {}, depart: {}, recherches: [], majLe: '' });
  /* 11/10/2026 — Une copie par PFMP et par année : la PFMP 2 ne reprend jamais les démarches de la PFMP 1.
     PFMP 1 garde la clé d'origine (aucune copie existante n'est perdue) ; PFMP 2 a la sienne ; un pointeur dit laquelle est ouverte. */
  let periodeLocale = 1;
  const cleBase = () => 'pfmp-stage-v1:' + code;
  const cleLocale = n => cleBase() + ((n || periodeLocale) === 2 ? ':p2' : '');
  const lireCopie = n => { try { return JSON.parse(localStorage.getItem(cleLocale(n)) || 'null'); } catch (e) { return null; } };
  function charger() {
    let n = 0; try { n = +localStorage.getItem(cleBase() + ':periode') || 0; } catch (e) {}
    const origine = lireCopie(1);
    /* Une copie d'avant ce changement qui déclarait déjà la PFMP 2 est rangée sous la clé de la PFMP 2 (l'originale reste). */
    if (!n) { n = origine && origine.declaration && origine.declaration.pfmp === 'PFMP 2' ? 2 : 1; if (n === 2 && !lireCopie(2)) { try { localStorage.setItem(cleLocale(2), JSON.stringify(origine)); } catch (e) {} } }
    periodeLocale = n;
    let c = lireCopie(n);
    /* Une copie d'une autre année scolaire est mise de côté, jamais effacée, et l'année repart d'une page vierge. */
    if (c && c.annee && c.annee !== ANNEE) { try { localStorage.setItem(cleLocale(n) + ':' + c.annee, JSON.stringify(c)); } catch (e) {} c = { avatar: c.avatar }; }
    L = Object.assign(vierge(), c || {});
    if (n === 2 && !L.declaration.pfmp) L.declaration.pfmp = 'PFMP 2';
    try { base6 = JSON.parse(localStorage.getItem(cleLocale(n) + ':base') || 'null'); } catch (e) { base6 = null; }
  }
  /* Changer de PFMP dans « Ma période de stage » : on range la copie en cours et on ouvre celle de l'autre période. */
  function changerPeriode(lib) {
    const n = lib === 'PFMP 2' ? 2 : 1; if (n === periodeLocale) return false;
    try { localStorage.setItem(cleLocale(), JSON.stringify(L)); } catch (e) {}
    const avatar = L.avatar; periodeLocale = n;
    try { localStorage.setItem(cleBase() + ':periode', String(n)); } catch (e) {}
    L = Object.assign(vierge(), lireCopie(n) || { avatar });
    try { base6 = JSON.parse(localStorage.getItem(cleLocale(n) + ':base') || 'null'); } catch (e) { base6 = null; }
    L.declaration = Object.assign({ pfmp: '', debut: '', fin: '', domaine: '', domaineAutre: '' }, L.declaration, { pfmp: lib });
    if (arretParcours) { arretParcours(); arretParcours = null; }
    return true;
  }
  let minuteurEnvoi = null, minuteurPistes = null;
  let aEnvoyer = false;
  function sauver(pistes) {
    L.majLe = new Date().toISOString(); L.annee = ANNEE; L.sale = true;
    try { localStorage.setItem(cleLocale(), JSON.stringify(L)); localStorage.setItem(cleBase() + ':periode', String(periodeLocale)); } catch (e) {}
    aEnvoyer = true; if (fs && suivi()) majSync('envoi');
    clearTimeout(minuteurEnvoi); minuteurEnvoi = setTimeout(envoyerParcours, 1200);
    if (pistes) { clearTimeout(minuteurPistes); minuteurPistes = setTimeout(envoyerPistes, 1500); }
  }
  const numero = () => L.declaration.pfmp === 'PFMP 2' ? 2 : 1;
  const sid = () => { try { return P.suiviId(ANNEE, code, numero()); } catch (e) { return ''; } };
  const suivi = () => suivis[numero()] || null;
  const declare = () => !!(L.declaration.pfmp && (L.declaration.debut || officiel()));
  /* Les dates du lycée (fiche synchronisée depuis l'Atelier, qui y écrit la classe) passent avant celles que l'élève a saisies. */
  const officiel = () => { const s = suivi(); return !!(s && s.classe && s.debut); };
  function periode() {
    const s = suivi() || {};
    const debut = officiel() ? s.debut : (L.declaration.debut || s.debut || ''), fin = officiel() ? s.fin : (L.declaration.fin || s.fin || '');
    let dernierJour = s.debut === debut ? s.dernierJour || '' : '';
    if (!dernierJour && debut) dernierJour = P.dernierJourDeCours(debut);
    return { debut, fin, dernierJour };
  }
  const CHAMPS = ['avatar', 'declaration', 'prepa', 'fiche', 'depart', 'recherches', 'majLe'];
  let etatSync = 'envoi', enCours = false;
  const ICONES_SYNC = { ok: ['cloud-check', 'Enregistré'], envoi: ['cloud-up', 'Enregistrement…'], local: ['cloud-off', 'Sur cet appareil'], erreur: ['cloud-x', 'Non enregistré'] };
  let okJusqua = 0;
  const iconeSync = () => `<i class="ti ti-${ICONES_SYNC[etatSync][0]}"></i>${etatSync === 'ok' && Date.now() < okJusqua ? '<span class="sync-txt">Enregistré</span>' : ''}`;
  let enregLe = '';
  const toutGarde = () => etatSync === 'ok' && !aEnvoyer && !enCours;
  function texteEnreg() {
    if (etatSync === 'erreur' || etatSync === 'local') return '<i class="ti ti-device-floppy"></i> Enregistrer';
    if (toutGarde() && enregLe) return `<i class="ti ti-circle-check"></i> Enregistré à ${enregLe}`;
    if (!toutGarde()) return '<i class="ti ti-loader-2 tourne"></i> Enregistrement…';
    return '<i class="ti ti-device-floppy"></i> Enregistrer';
  }
  function majBtnEnreg() { const b = $('btnEnreg'); if (b) { b.innerHTML = texteEnreg(); b.classList.toggle('fait', toutGarde() && !!enregLe); } }
  function majSync(e) {
    if (e === 'ok' && etatSync === 'envoi' && aEnvoyer === false && enCours) { okJusqua = Date.now() + 2000; setTimeout(() => { const x = $('sync'); if (x && etatSync === 'ok') x.innerHTML = iconeSync(); }, 2050); }
    etatSync = e; if (e === 'ok' && !aEnvoyer) enregLe = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ' h '); setTimeout(majBtnEnreg, 0); const x = $('sync'); if (x) { x.className = 'sync ' + e; x.title = ICONES_SYNC[e][1]; x.innerHTML = iconeSync(); } }
  /* 11/10/2026 — Deux appareils sur le même parcours : rien ne s'écrase.
     « base6 » est la dernière copie connue en ligne. Avant d'écrire, on relit la copie en ligne ; si elle a changé
     entre-temps, on fusionne : ce que CET appareil a modifié depuis « base6 » est gardé, le reste vient de l'autre appareil.
     Les démarches se fusionnent une par une (ajoutée ici, modifiée ici ou retirée ici) ; rien n'est perdu. */
  let base6 = null;
  const pareil = (a, b) => JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);
  function fusion3(base, loin, ici) {
    base = base || {}; loin = loin || {}; const o = {};
    ['declaration', 'prepa', 'fiche', 'depart'].forEach(k => {
      const b = base[k] || {}, l = ici[k] || {}, m = Object.assign({}, loin[k] || {});
      new Set(Object.keys(b).concat(Object.keys(l))).forEach(c => { if (!pareil(l[c], b[c])) { if (l[c] === undefined) delete m[c]; else m[c] = l[c]; } });
      o[k] = m;
    });
    o.avatar = pareil(ici.avatar, base.avatar) && loin.avatar !== undefined ? loin.avatar : ici.avatar;
    const B = new Map((base.recherches || []).map(r => [r.id, r])), I = new Map((ici.recherches || []).map(r => [r.id, r])), out = new Map((loin.recherches || []).map(r => [r.id, r]));
    I.forEach((r, id) => { if (!pareil(r, B.get(id))) out.set(id, r); });
    B.forEach((r, id) => { if (!I.has(id)) out.delete(id); });
    o.recherches = [...out.values()].slice(0, 80);
    return o;
  }
  /* Toujours une copie séparée : sinon modifier le parcours modifierait aussi la « base » et la fusion ne verrait plus rien. */
  function garderBase(d) { base6 = JSON.parse(JSON.stringify(d)); try { localStorage.setItem(cleLocale() + ':base', JSON.stringify(base6)); } catch (e) {} }
  function envoyerParcours() {
    if (!fs || !suivi()) { majSync('local'); return; }
    const ref = fs.doc('coordination_pfmp_suivi/' + sid() + '/eleve/parcours'), cle = cleLocale();
    let fusionne = false;
    majSync('envoi'); clearTimeout(minuteurEnvoi); aEnvoyer = false; enCours = true;
    fs.runTransaction(t => t.get(ref).then(sn => {
      const loin = sn.exists ? sn.data() : null;
      if (loin && (!base6 || loin.majLe !== base6.majLe)) { Object.assign(L, fusion3(base6, loin, L)); fusionne = true; }
      const d = {}; CHAMPS.forEach(k => { d[k] = L[k]; });
      d.recherches = (L.recherches || []).slice(0, 80);
      const propre = JSON.parse(JSON.stringify(d)); t.set(ref, propre); return propre;
    })).then(d => {
      if (cle === cleLocale()) { garderBase(d); if (!aEnvoyer) L.sale = false; try { localStorage.setItem(cle, JSON.stringify(L)); } catch (e) {} }
      majSync(aEnvoyer ? 'envoi' : 'ok'); enCours = false; if (fusionne) rendre();
    }).catch(() => { enCours = false; majSync('erreur'); });
  }
  /* La fiche en ligne se crée dès la déclaration : rien ne reste sur le seul ordinateur du lycée.
     L'Atelier la complète ensuite (référent, dates du lycée) sans effacer ce que l'élève a saisi. */
  const connu = {}, creations = {};
  function creerSuivi(n) {
    if (!fs || creations[n] || !declare() || numero() !== n || suivis[n]) return;
    const per = periode(); if (!per.debut) return;
    creations[n] = 1;
    const id = P.suiviId(ANNEE, code, n), le = new Date().toISOString();
    const data = { id, type: 'suivi', annee: ANNEE, code, periode: n, libelle: 'PFMP ' + n, debut: per.debut, fin: per.fin || '', dernierJour: per.dernierJour || '',
      etapes: {}, pistes: [], creeLe: le, majLe: le, majPar: 'eleve', version: 1 };
    const ref = fs.doc(P.COL_SUIVI + '/' + id);
    majSync('envoi');
    fs.runTransaction(async t => { const s = await t.get(ref); if (s.exists) return; t.set(ref, data); }).catch(() => { creations[n] = 0; majSync('erreur'); });
  }
  function envoyerPistes() {
    if (!svc || !suivi()) return;
    const conv = { prevu: 'attente', attente: 'attente', pasrep: 'attente', rappeler: 'attente', entretien: 'entretien', refus: 'refus', accord: 'accord', autre: 'attente' };
    const pistes = (L.recherches || []).slice(0, 40).map(r => ({ id: r.id, structure: 'Entreprise', secteur: '', moyen: MOYENS[r.moyen] ? r.moyen : 'autre', date: r.date || '', reponse: conv[r.statut] || 'attente' }));
    svc.majPistes(sid(), () => pistes, 'eleve').catch(() => {});
  }

  /* ── Connexion à la base (les étapes partagées avec le référent) ─────── */
  async function brancher() {
    for (let i = 0; i < 40 && !window.__PFMP_SHIM__ && !(window.firebase && window.firebase.firestore); i++) await new Promise(r => setTimeout(r, 250));
    try {
      if (window.__PFMP_SHIM__) fs = window.__PFMP_SHIM__;
      else if (window.firebase && window.firebase.firestore) { const fb = window.firebase; fs = ((fb.apps || []).find(a => a.name === 'pfmp-suivi') || fb.initializeApp(CFG, 'pfmp-suivi')).firestore(); }
      if (!fs) { majSync('local'); return; }
      svc = P.service(P.depotCompat(fs));
      [1, 2].forEach(n => {
        let id; try { id = P.suiviId(ANNEE, code, n); } catch (e) { return; }
        arrets.push(svc.ecouterSuivi(id, d => { connu[n] = 1; if (d) suivis[n] = d; else { delete suivis[n]; creerSuivi(n); } ecouterParcours(); ecouterMessages(); rendre(); }, () => {}));
      });
    } catch (e) { majSync('local'); /* hors ligne : tout reste dans ce navigateur */ }
  }
  function ecouterParcours() {
    if (!fs || !suivi()) return;
    const chemin = 'coordination_pfmp_suivi/' + sid() + '/eleve/parcours';
    if (arretParcours && arretParcours.chemin === chemin) return;
    if (arretParcours) arretParcours();
    arretParcours = fs.doc(chemin).onSnapshot(s => {
      const d = s.exists ? s.data() : null;
      if (!d) { envoyerParcours(); return; }
      if (enCours) return;
      /* Rien de neuf en ligne depuis la dernière copie connue. */
      if (base6 && d.majLe === base6.majLe) { if (!L.sale && !aEnvoyer) majSync('ok'); return; }
      /* Cet appareil a des changements non envoyés : la fusion se fait à l'envoi, sans rien écraser. */
      if (L.sale || aEnvoyer || (!base6 && String(L.majLe || '') > String(d.majLe || ''))) { envoyerParcours(); return; }
      /* Sinon, la copie en ligne (venue d'un autre appareil) est reprise telle quelle. */
      garderBase(d); CHAMPS.forEach(k => { if (d[k] !== undefined) L[k] = d[k]; });
      try { localStorage.setItem(cleLocale(), JSON.stringify(L)); } catch (e) {} majSync('ok'); rendre();
    }, () => {});
    arretParcours.chemin = chemin;
  }
  function ecouterMessages() {
    if (!svc || !suivi()) return;
    if (arretMsgs && arretMsgs.pour === sid()) return;
    if (arretMsgs) arretMsgs();
    arretMsgs = svc.ecouterMessages(sid(), l => { msgs = l; const h = location.hash || '#'; if (h === '#' || h.startsWith('#aide')) rendre(); }, () => {});
    arretMsgs.pour = sid();
  }

  /* ── États des étapes ────────────────────────────────────────────────── */
  const en = id => P.entree(suivi(), id);
  const fait = id => ['valide', 'fait'].includes(en(id).e);
  const envoye = id => ['valide', 'fait', 'remis', 'declare'].includes(en(id).e);
  const negFait = id => suivi() ? (envoye(id) || fait(id)) : !!(L.locales || {})[id];
  const ficheOk = () => suivi() ? (fait('neg_signed') || envoye('neg_return')) : !!((L.locales || {}).neg_return || (L.fiche.etapes && L.fiche.etapes.valide));
  const prepaOk = () => !!(L.prepa.cv && L.prepa.lettre && L.prepa.trouve);
  function noeuds() {
    const per = periode(), s = suivi() || {};
    const ec = id => { const e = P.echeance(P.PAR_ID[id], per); return e ? fr(e.date) : ''; };
    const t = auj();
    return [
      { n: 'Préparation', d: '', ok: prepaOk(), lien: '#p/preparation' },
      { n: 'Recherche', d: '', ok: L.prepa.trouve === 'Oui' || envoye('search'), lien: '#recherches' },
      { n: 'Fiche de négociation', d: ec('neg_return'), ok: ficheOk(), lien: '#p/fiche' },
      { n: 'Pré-convention', d: ec('pre_return'), ok: envoye('pre_return'), lien: '#p/preconvention' },
      { n: 'Convention signée', d: ec('conv_return'), ok: envoye('conv_return'), lien: '#p/convention' },
      { n: 'Début du stage', d: fr(per.debut), ok: !!per.debut && t >= per.debut, lien: '#p/stage', stage: 1 },
      { n: 'Visite', d: s.visite && s.visite.le ? 'confirmée' : '', ok: fait('visit') && !!per.debut && t >= per.debut, lien: '#p/stage' },
      { n: 'Fin du stage', d: fr(per.fin), ok: !!per.fin && t > per.fin, lien: '#p/retour', stage: 1 },
      { n: 'Attestation', d: ec('attestation'), ok: envoye('attestation'), lien: '#p/retour' },
      { n: 'Bilan', d: ec('student_eval'), ok: envoye('student_eval'), lien: '#p/retour' }
    ];
  }
  function phaseEnCours() {
    const etat = {
      preparation: prepaOk(), recherches: L.prepa.trouve === 'Oui' || envoye('search'), fiche: ficheOk(), preconvention: envoye('pre_return'),
      convention: envoye('conv_return'), depart: DEPART.every(([k]) => L.depart[k]) || (periode().debut && auj() >= periode().debut),
      stage: envoye('midpoint') || (periode().fin && auj() > periode().fin), retour: envoye('student_eval')
    };
    return { etat, courante: ORDRE.find(k => !etat[k]) || 'retour' };
  }

  /* ── L'action du moment : une ligne en haut ──────────────────────────── */
  const nomR = r => r.nom || 'l’entreprise';
  const avant = id => { const e = P.echeance(P.PAR_ID[id], periode()); return e && e.date ? ' · avant le ' + fr(e.date) : ''; };
  function alerte() {
    const t = auj(), dem = plusJ(t, 1), R = L.recherches || [];
    const tri = (l, k, h) => l.sort((a, b) => ((a[k] || '') + (a[h] || '')).localeCompare((b[k] || '') + (b[h] || '')))[0];
    const ent = tri(R.filter(r => r.statut === 'entretien' && r.entretienLe && r.entretienLe >= t && r.entretienLe <= dem), 'entretienLe', 'entretienH');
    if (ent) return { ic: 'briefcase', t: `Entretien ${ent.entretienLe === t ? 'aujourd’hui' : 'demain'}${ent.entretienH ? ' à ' + hh(ent.entretienH) : ''} · ${nomR(ent)}`, lien: '#recherches', fort: 1 };
    const rap = tri(R.filter(r => r.statut === 'rappeler' && r.rappelLe && r.rappelLe <= t), 'rappelLe', 'rappelH');
    if (rap) return { ic: 'phone-call', t: `Rappeler ${nomR(rap)}${rap.rappelLe < t ? ' · en retard' : rap.rappelH ? ' à ' + hh(rap.rappelH) : ' aujourd’hui'}`, lien: '#recherches', fort: 1 };
    const pre = tri(R.filter(r => r.statut === 'prevu' && r.date && r.date <= t), 'date', 'heure');
    if (pre) return { ic: (MOYENS[pre.moyen] || MOYENS.autre)[0], t: `${VERBES[pre.moyen] || 'Contacter'} ${nomR(pre)}${pre.date < t ? ' · en retard' : pre.heure ? ' à ' + hh(pre.heure) : ' aujourd’hui'}`, lien: '#recherches', fort: 1 };
    const sem = L.prepa.semaine;
    if (sem && sem.prochain && sem.prochain <= t && (sem.items || []).length) return { ic: 'checklist', t: 'Point sur ma semaine', lien: '#recherches' };
    const p = L.prepa;
    if (p.trouve === 'Oui' && suivi() && !en('search').e) return { ic: 'flag', t: 'Prévenir mon référent : j’ai une proposition de stage', lien: '#', fort: 1 };
    if (en('search').e === 'corriger') return { ic: 'alert-circle', t: 'Mon référent demande une correction', lien: '#', fort: 1 };
    return null;
  }

  /* ── Agenda : la reprise de ce qui est déjà noté (démarches, rappels, entretiens, échéances) ── */
  function agenda() {
    const t = auj(), R = L.recherches || [], per = periode(), s = suivi() || {}, l = [];
    R.forEach(r => {
      const avec = r.avec && r.avec !== 'Seul' ? (r.avec === 'Autre' ? r.avecAutre : r.avec) : '';
      if (r.statut === 'prevu' && r.date) l.push({ d: r.date, h: r.heure, ic: (MOYENS[r.moyen] || MOYENS.autre)[0], t: `${VERBES[r.moyen] || 'Contacter'} ${nomR(r)}`, s: avec ? 'avec ' + avec.toLowerCase() : '', lien: '#recherches', act: 1 });
      if (r.statut === 'rappeler' && r.rappelLe) l.push({ d: r.rappelLe, h: r.rappelH, ic: 'phone-call', t: 'Rappeler ' + nomR(r), lien: '#recherches', act: 1 });
      if (r.statut === 'entretien' && r.entretienLe) l.push({ d: r.entretienLe, h: r.entretienH, ic: 'briefcase', t: 'Entretien · ' + nomR(r), lien: '#recherches', fort: 1 });
    });
    const sem = L.prepa.semaine;
    if (sem && sem.prochain) l.push({ d: sem.prochain, ic: 'checklist', t: 'Point sur ma semaine', lien: '#recherches' });
    [['neg_return', 'Fiche de négociation', '#', ficheOk()], ['pre_return', 'Rendre la pré-convention', '#', envoye('pre_return')], ['conv_return', 'Rendre la convention', '#', envoye('conv_return')],
      ['attestation', 'Rendre l’attestation', '#', envoye('attestation')], ['student_eval', 'Bilan du stage', '#', envoye('student_eval')]].forEach(([id, n, lien, ok]) => {
      const e = P.echeance(P.PAR_ID[id], per); if (e && e.date && !ok) l.push({ d: e.date, ic: 'flag', t: n, lien, act: 1 });
    });
    if (per.dernierJour) l.push({ d: per.dernierJour, ic: 'school', t: 'Dernier jour de cours', lien: '#' });
    if (per.debut) l.push({ d: per.debut, ic: 'building', t: 'Début du stage', lien: '#', fort: 1 });
    if (per.fin) l.push({ d: per.fin, ic: 'trophy', t: 'Fin du stage', lien: '#' });
    if (s.visite && /^\d{4}-\d{2}-\d{2}/.test(s.visite.le || '')) l.push({ d: s.visite.le.slice(0, 10), h: (s.visite.le.match(/T(\d\d:\d\d)/) || [])[1], ic: 'calendar-check', t: 'Suivi de mon référent', lien: '#' });
    return l.filter(x => x.d >= t || x.act).sort((a, b) => (a.d + (a.h || '')).localeCompare(b.d + (b.h || '')));
  }
  const nbAgenda = () => { const t = auj(); return agenda().filter(x => x.d <= t).length; };
  let volet = '', attente = null;
  function rendreVolet() {
    const v = $('tiroir'); if (!v) return;
    if (!volet) { v.innerHTML = ''; document.body.classList.remove('fige'); return; }
    document.body.classList.add('fige');
    let c = '';
    if (volet === 'agenda') {
      const t = auj(), dem = plusJ(t, 1), l = agenda();
      const titre = d => d < t ? 'En retard' : d === t ? 'Aujourd’hui' : d === dem ? 'Demain' : frLong(d);
      let g = '';
      c = `<div class="vt"><i class="ti ti-calendar-event"></i><h2>Agenda</h2><button class="rond-btn" data-act="fermer" aria-label="Fermer"><i class="ti ti-x"></i></button></div>`;
      c += l.length ? l.map(x => { const ti = titre(x.d), tete = ti !== g ? `<div class="jour ${x.d < t ? 'retard' : x.d === t ? 'auj' : ''}">${esc(ti)}</div>` : ''; g = ti;
        return tete + `<a class="ag ${x.fort ? 'fort' : ''}" href="${x.lien}" data-act="fermer"><span class="h">${x.h ? esc(hh(x.h)) : ''}</span><span class="ic"><i class="ti ti-${x.ic}"></i></span><span class="x">${esc(x.t)}${x.s ? `<small>${esc(x.s)}</small>` : ''}</span></a>`; }).join('')
        : `<div class="vide"><i class="ti ti-calendar" style="font-size:34px"></i></div>`;
    } else if (volet === 'confirme' && attente) {
      c = `<div class="conf"><span class="ic"><i class="ti ti-${attente.action === 'annuler' ? 'arrow-back-up' : 'circle-check'}"></i></span><h2>Vous confirmez ?</h2><p>${esc(attente.t)}</p>
        <div class="deux-btn"><button class="btn sec" data-act="fermer">Non</button><button class="btn ${attente.action === 'annuler' ? 'pri' : 'vert'}" data-act="oui">Oui</button></div></div>`;
    } else if (volet === 'v6' && fen6) {
      c = `<div class="s6-fen">${fenetre6()}</div>`;
    } else if (volet === 'qr') {
      const url = location.origin + location.pathname + '?c=' + encodeURIComponent(code);
      c = `<div class="vt"><i class="ti ti-device-mobile"></i><h2>Sur mon téléphone</h2><button class="rond-btn" data-act="fermer" aria-label="Fermer"><i class="ti ti-x"></i></button></div>
        <div class="qr-img" id="qr"></div><div class="qr-code">${esc(code)}</div>`;
      setTimeout(() => dessinerQR(url), 0);
    }
    v.innerHTML = `<div class="tiroir-fond" data-act="fermer"></div><aside class="tiroir ${volet === 'confirme' || volet === 'v6' ? 'qr' : volet}" role="dialog" aria-modal="true">${c}</aside>`;
  }
  function dessinerQR(url) {
    const go = () => { const el = $('qr'); if (!el) return; el.innerHTML = ''; new window.QRCode(el, { text: url, width: 232, height: 232, colorDark: '#1f2733', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M }); };
    if (window.QRCode) return go();
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; s.onload = go;
    s.onerror = () => { const el = $('qr'); if (el) el.innerHTML = `<p class="vide">${esc(url)}</p>`; };
    document.head.appendChild(s);
  }

  /* ── Rendu ───────────────────────────────────────────────────────────── */
  let dernierEcran = '';
  function rendre() {
    if (!code) return ecranCode();
    const h = location.hash || '#';
    const rappelOuvert = !!document.querySelector('#app details.rappel[open]');
    const garde = {}; document.querySelectorAll('#app input[id],#app textarea[id],#app select[id]').forEach(x => { garde[x.id] = x.value; });
    const actif = document.activeElement && document.activeElement.id;
    const y = window.scrollY;
    let corps;
    if (h === '#declarer') corps = pageDeclarer();
    else if (h === '#p/depart') corps = pagePhase('depart');
    else if (h.startsWith('#p/')) { location.hash = '#'; return; }   /* anciens écrans retirés : tout est dans Mon suivi */
    else if (h === '#recherches') corps = pageRecherches();
    else if (h.startsWith('#aide')) corps = pageAide(h);
    else corps = pageAccueil();
    const onglet = h.startsWith('#aide') ? 'aide' : h === '#recherches' ? 'recherches' : 'stage';
    const av = L.avatar != null ? AVATARS[L.avatar] : null, per = periode(), s = suivi();
    const tete = declare() ? `<a class="qui" href="#declarer"><b>${esc(L.declaration.pfmp)}${per.debut ? `<span class="dts"> · ${fr(per.debut)} → ${fr(per.fin)}</span>` : ''}</b><small><i class="ti ti-user-check"></i> Référent ${s && s.refSigle ? esc(s.refSigle) : '· à venir'}</small></a>` : `<span class="bonjour">Bonjour !</span>`;
    const nAg = declare() ? nbAgenda() : 0, al = h !== '#declarer' && declare() ? alerte() : null;
    $('app').innerHTML = `
      <a class="retour vers-espace" href="../../index.html#pfmp-agora"><i class="ti ti-chevron-left"></i> Mon espace</a>
      <div class="top"><span class="av" style="background:${av ? av[1] : '#cfc7b8'}"><i class="ti ti-${av ? av[0] : 'user'}"></i></span>${tete}
        <span class="sync ${etatSync}" id="sync" title="${ICONES_SYNC[etatSync][1]}">${iconeSync()}</span>
                <button class="rond-btn pc" data-act="qr" aria-label="Sur mon téléphone"><i class="ti ti-device-mobile"></i></button>
        <button class="rond-btn" data-act="plus" aria-label="Plus"><i class="ti ti-dots"></i></button></div>
      ${plus ? `<div class="plus">${declare() ? `<button data-act="imprimer"><i class="ti ti-printer"></i> Imprimer ma fiche</button>` : ''}<button data-act="qr"><i class="ti ti-device-mobile"></i> Sur mon téléphone</button><a href="../carnet/index.html"><i class="ti ti-notebook"></i> Mon carnet de bord PFMP</a><button data-act="changer"><i class="ti ti-switch-horizontal"></i> Changer de code</button></div>` : ''}
      <nav class="menu"><a href="#" class="${onglet === 'stage' ? 'on' : ''}"><i class="ti ti-route"></i> Mon suivi</a>${declare() ? `<a href="#recherches" class="${onglet === 'recherches' ? 'on' : ''}"><i class="ti ti-list-search"></i> Démarches</a><button class="mi" data-act="agenda"><i class="ti ti-calendar-event"></i> Agenda${nAg ? ` <span class="bd">${nAg}</span>` : ''}</button>` : ''}</nav>
      ${al ? `<a class="alerte ${al.fort ? 'fort' : ''}" href="${al.lien}"><i class="ti ti-${al.ic}"></i><span>${esc(al.t)}</span><i class="ti ti-chevron-right"></i></a>` : ''}
      ${corps}
      ${declare() && !h.startsWith('#aide') ? `<button class="btn enreg ${toutGarde() && enregLe ? 'fait' : ''}" id="btnEnreg" data-act="toutEnregistrer">${texteEnreg()}</button>` : ''}
      <p class="discret"><i class="ti ti-shield-lock"></i> ${esc(code)}</p>
      ${declare() && !h.startsWith('#aide') ? `<a class="s6-fixe" href="#aide" aria-label="Besoin d’aide ?"><i class="ti ti-lifebuoy"></i> Aide</a>` : ''}`;
    Object.entries(garde).forEach(([k, v]) => { const x = $(k); if (x && x.tagName !== 'SELECT' && !x.value && v) x.value = v; });
    if (rappelOuvert && h === dernierEcran) { const d = document.querySelector('#app details.rappel'); if (d) d.open = true; }
    if (actif && $(actif)) $(actif).focus({ preventScroll: true });
    if (h !== dernierEcran) { dernierEcran = h; window.scrollTo(0, 0); } else window.scrollTo(0, y);
    demarrerChrono(); humeur(); if (volet === 'agenda') rendreVolet();
    const fr_ = $('frise'), ici = fr_ && fr_.querySelector('.pt.ici');
    if (ici) fr_.scrollLeft = ici.offsetLeft - fr_.clientWidth / 2 + ici.clientWidth / 2;
  }

  function ecranCode() {
    $('app').innerHTML = `<form id="formCode" style="max-width:380px;margin:12vh auto 0;text-align:center;display:grid;gap:14px">
      <span class="av grand" style="background:var(--p600);margin:0 auto"><i class="ti ti-briefcase"></i></span>
      <h1 style="font-size:24px">Mon suivi de PFMP</h1>
      <label class="sr" for="code">Votre code</label><input type="text" id="code" maxlength="6" autocomplete="off" placeholder="Votre code" style="text-align:center;font-size:24px;letter-spacing:.2em;text-transform:uppercase">
      <div id="errCode" style="color:var(--err);font-size:14px;min-height:18px"></div>
      <button class="btn pri" type="submit">Entrer</button></form>`;
    $('formCode').onsubmit = ev => {
      ev.preventDefault();
      const c = $('code').value.trim().toUpperCase();
      if (!/^[A-Z0-9]{4,6}$/.test(c)) { $('errCode').textContent = 'Code à 4 caractères.'; return; }
      /* ZZ99 : élève de démonstration, pour que les professeurs voient la page (relié au référent de démonstration 999999). */
      if (window.ANNUAIRE && !window.ANNUAIRE[c] && c !== 'ZZ99') { $('errCode').textContent = 'Code inconnu.'; return; }
      try { localStorage.setItem('codeEleve', c); localStorage.setItem('userCode', c); } catch (e) {}
      demarrer(c);
    };
    setTimeout(() => $('code') && $('code').focus(), 0);
  }

  /* La météo des émotions : une fois par visite. Elle reste dans ce navigateur. */
  function humeur() {
    let vue = false; try { vue = !!sessionStorage.getItem('pfmp-humeur:' + code); } catch (e) {}
    const v = $('voile');
    if (vue) { v.innerHTML = ''; return; }
    if (v.innerHTML) return;
    const av = L.avatar != null ? AVATARS[L.avatar] : null;
    v.innerHTML = `<div class="voile"><div class="fen"><span class="av grand" style="background:${av ? av[1] : '#cfc7b8'};margin:0 auto"><i class="ti ti-${av ? av[0] : 'user'}"></i></span>
      <h2>Comment vous sentez-vous aujourd’hui ?</h2><div class="humeurs">${HUMEURS.map(([ic, l], i) => `<button data-h="${i}"><i class="ti ti-${ic}"></i>${l}</button>`).join('')}</div><div id="humAutre"></div></div></div>`;
    v.querySelectorAll('[data-h]').forEach(b => b.onclick = () => {
      const i = +b.dataset.h;
      if (HUMEURS[i][1] === 'Autre') { $('humAutre').innerHTML = `<div style="display:flex;gap:8px;margin-top:12px"><input type="text" id="humTexte" maxlength="60" placeholder="Mon humeur"><button class="btn pri mini" id="humOk">OK</button></div>`; $('humTexte').focus(); $('humOk').onclick = () => noterHumeur('Autre : ' + $('humTexte').value.trim()); return; }
      noterHumeur(HUMEURS[i][1]);
    });
  }
  function noterHumeur(h) {
    try {
      sessionStorage.setItem('pfmp-humeur:' + code, '1');
      const k = 'pfmp-humeurs:' + code, l = JSON.parse(localStorage.getItem(k) || '[]'); l.push({ h, le: new Date().toISOString() }); localStorage.setItem(k, JSON.stringify(l.slice(-60)));
    } catch (e) {}
    $('voile').innerHTML = '';
  }

  /* ── Mon parcours (09/10/2026) : la chronologie validée, vue par l'élève ──
     Ses gestes en cartes ; ce que font les autres en petit ; « Maintenant » = la seule chose à faire.
     Les étapes des autres ne bloquent l'élève que si elles conditionnent la suite (un intervenant, un drapeau). */
  const STATUTS_EL = ['Mon référent', 'Proposition de stage', 'Stage validé', 'Convention signée', 'En stage', 'Terminé'];
  const LIB_ACT = { declarer: 'Valider', remettre: 'Je l’ai remis', recevoir: 'Je l’ai', faire: 'C’est fait' };
  const minus = s => s ? s.charAt(0).toLowerCase() + s.slice(1) : '';
  function refTexte() {
    const s = suivi();
    return s && s.refSigle ? 'Mon enseignant référent : professeur ' + (/^[aeiouéèêh]/i.test(s.refSigle) ? 'd’' : 'de ') + s.refSigle : 'Mon enseignant référent : à venir';
  }
  function entreeEl(id) { const s = suivi(); return s ? P.entree(s, id) : { e: (L.locales || {})[id] ? 'fait' : '' }; }
  function faitEl(et, e) {
    if (et.ty === 'declare') return ['declare', 'fait', 'valide'].includes(e.e);
    if (et.ty === 'remise') return et.from === 'eleve' ? ['remis', 'valide'].includes(e.e) : e.e === 'valide';
    return ['fait', 'valide'].includes(e.e);
  }
  function lienEl(id) {
    if (id === 'search') return L.prepa.trouveR ? '#recherches' : '#p/preparation';
    if (id === 'midpoint') return '#p/stage';
    return '';
  }
  function parcours() {
    const s = suivi(), pr = L.prepa, R = L.recherches || [], items = [];
    P.PHASES.forEach((nom, ph) => {
      items.push({ phase: nom, ph });
      if (ph === 1) {
        items.push({ moi: 1, id: '_cv', titre: 'Mon CV et ma lettre de motivation sont prêts', sous: 'CV : ' + (pr.cv || '—') + ' · lettre : ' + (pr.lettre || '—'), fait: (pr.cv === 'À jour' && pr.lettre === 'Prête') || !!entreeEl('search').e, lien: '#p/preparation' });
        items.push({ moi: 1, id: '_dem', titre: 'Mes démarches', sous: R.length ? R.length + ' démarche' + (R.length > 1 ? 's' : '') + ' notée' + (R.length > 1 ? 's' : '') : 'Appels, visites, mails', fait: R.length > 0 || !!entreeEl('search').e, lien: '#recherches' });
      }
      P.ETAPES.filter(et => et.ph === ph && !et.local && !et.opt && et.ty !== 'journal').forEach(et => {
        const e = entreeEl(et.id);
        if (et.id === 'referent') { items.push({ autre: 1, id: et.id, titre: refTexte(), fait: !!(s && (s.refSigle || P.estFaite(s, 'referent'))), ic: 'school', voit: 1 }); return; }
        const eleve = (et.ty === 'declare' && (!et.act || et.coche === 'eleve')) || (et.ty === 'remise' && (et.from === 'eleve' || et.to === 'eleve'));
        const ech = P.echeance(et, periode());
        if (eleve) items.push({ moi: 1, id: et.id, et, e, titre: et.te || et.t, fait: faitEl(et, e), lien: lienEl(et.id), ech: ech && ech.date,
          sous: et.id === 'search' && pr.trouveR ? ((R.find(r => r.id === pr.trouveR) || {}).nom || '') : (e.e === 'corriger' && e.motif ? 'À corriger : ' + e.motif : '') });
        else if (et.id === 'visit') items.push({ autre: 1, id: et.id, et, titre: 'Visite de mon référent' + (s && s.visite && s.visite.le ? ' · ' + frLong(s.visite.le) : ''), fait: !!s && P.estFaite(s, 'visit'), voit: 1, ic: 'calendar-event' });
        else items.push({ autre: 1, id: et.id, et, titre: et.voit || (et.act ? P.ACTEURS[et.act] + ' · ' + minus(et.t).replace(/ par l’[^·]*$/, '') : 'Votre référent · ' + minus(et.t)),
          fait: !!s && P.estFaite(s, et.id), bloque: !!(et.act || et.flag), voit: !!(et.voit || et.act || et.flag), ic: et.act === 'pro' ? 'tools' : et.act === 'ent' ? 'building-store' : et.act ? 'building' : 'school' });
      });
    });
    return items;
  }
  function maintenant(items) {
    const etapes = items.filter(x => !x.phase);
    const perdu = etapes.find(x => x.e && x.e.e === 'perdu'); if (perdu) return perdu;
    { const per = periode(), t = auj(); if (per.debut && per.fin && t >= per.debut && t <= per.fin) return { moi: 1, id: '_carnet', titre: 'Remplir mon carnet de bord du jour', lien: '../carnet/index.html' }; }
    const per = periode(), t = auj();
    for (const x of etapes) {
      if (x.fait) continue;
      /* Rien de « pendant le stage » avant le premier jour : on prépare le départ. */
      if (x.et && x.et.ph >= 6 && per.debut && t < per.debut) return DEPART.every(([k]) => L.depart[k]) ? { attente: 1, id: '_depart', titre: 'Prêt pour le départ · ' + frLong(per.debut) } : { moi: 1, id: '_depart', titre: 'Préparer mon départ', lien: '#p/depart' };
      if (x.et && ['attest_in', 'attestation', 'student_eval'].includes(x.id) && per.fin && t < per.fin) return { attente: 1, id: '_fin', titre: 'Je suis en stage · fin le ' + frLong(per.fin) };
      if (x.moi) return x;
      if (x.bloque && x.id !== 'referent') return Object.assign({}, x, { attente: 1, titre: (x.et.act ? P.ACTEURS[x.et.act] : 'Votre référent') + ' · ' + minus(x.et.t).replace(/ par l’[^·]*$/, '') });
    }
    return null;
  }
  function statutEl() {
    const s = suivi() || {}, t = auj(), per = periode(); let st = 0;
    if (s.refSigle || P.estFaite(s, 'referent')) st = 1;
    if (entreeEl('search').e) st = 2;
    if (P.estFaite(s, 'neg_signed')) st = 3;
    if (P.estFaite(s, 'ddf_copies') || ['remis', 'valide'].includes(entreeEl('copies').e)) st = 4;
    if (['declare', 'fait'].includes(entreeEl('here').e) || (per.debut && t >= per.debut)) st = 5;
    if (P.estFaite(s, 'student_eval')) st = 6;
    return st;
  }
  function carteMaintenant(m) {
    if (!m) return `<section class="mp-maint fini"><small>Bravo</small><h2>Votre parcours est complet</h2></section>`;
    if (m.e && m.e.e === 'perdu') return `<section class="mp-maint attente perdu"><small>Document perdu</small><h2>${esc(m.et.garde)}</h2><p>Mon référent et mon professeur principal sont prévenus.</p><button class="mp-gros" data-agir="${m.id}" data-action="retrouver"><i class="ti ti-check"></i> Je l’ai retrouvé</button></section>`;
    if (m.attente) return `<section class="mp-maint attente"><small>En attente</small><h2>${esc(m.titre)}</h2><p>Rien à faire pour l’instant : vous serez prévenu ici.</p></section>`;
    const quand = m.ech ? `<p>Avant le ${esc(frLong(m.ech))}</p>` : (m.sous ? `<p>${esc(m.sous)}</p>` : '');
    let bouton = '';
    if (m.lien) bouton = `<a class="mp-gros" href="${m.lien}"><i class="ti ti-arrow-right"></i> ${m.id === '_dem' ? 'Mes recherches' : m.id === '_carnet' ? 'Mon carnet de bord' : 'J’y vais'}</a>`;
    else if (m.et && suivi()) { const a = P.actions(m.et, m.e, 'eleve').find(x => x !== 'annuler'); if (a) bouton = `<button class="mp-gros" data-agir="${m.id}" data-action="${a}"><i class="ti ti-check"></i> ${LIB_ACT[a] || 'Valider'}</button>`; }
    else if (m.et) bouton = `<button class="mp-gros" data-locale="${m.id}"><i class="ti ti-check"></i> Valider</button>`;
    return `<section class="mp-maint"><small>Maintenant</small><h2>${esc(m.titre)}</h2>${quand}${bouton}</section>`;
  }
  const PAGES_PH = { 1: '#p/preparation', 2: '#p/fiche', 3: '#p/preconvention', 4: '#p/convention', 5: '#p/depart', 6: '#p/stage', 7: '#p/retour' };
  function filParcours(items, m) {
    let h = '', n = 0;
    /* « Annuler » sur le dernier geste de l'élève seulement : un oubli se rattrape, l'historique reste net. */
    const dernier = (items.filter(y => y.moi && y.fait && y.et).pop() || {}).id;
    items.forEach((x, i) => {
      if (x.phase) {
        const suite = []; for (let k = i + 1; k < items.length && !items[k].phase; k++) suite.push(items[k]);
        const vis = suite.filter(y => y.moi || y.voit); if (!vis.length) return;
        n++;
        const cle = suite.filter(y => y.moi || y.bloque), ok = (cle.length ? cle : vis).every(y => y.fait), ici = m && suite.includes(items.find(y => y.id === m.id));
        const pg = PAGES_PH[x.ph];
        h += `<${pg ? `a href="${pg}"` : 'div'} class="mp-ph ${ok ? 'ok' : ici ? 'ici' : ''}"><i class="n">${ok ? '✓' : n}</i>${esc(x.phase)}${pg ? '<i class="ti ti-chevron-right"></i>' : ''}</${pg ? 'a' : 'div'}>`;
        return;
      }
      if (x.moi) {
        const ici = m && m.id === x.id && !m.attente;
        const ann = x.id === dernier && suivi() && P.actions(x.et, x.e, 'eleve').includes('annuler') ? `<button class="lien annuler" data-agir="${x.id}" data-action="annuler">Annuler</button>` : '';
        const deux = x.et && x.et.ty === 'remise' ? `<span class="mp-relais ${x.fait ? '' : 'att'}">${x.fait ? '✓✓' : '✓'}</span>` : '';
        /* Les documents gardés : « Je l'ai déjà » à tout moment, « Je l'ai perdu » une fois en main. */
        const acts = x.et && x.et.garde && suivi() ? P.actions(x.et, x.e, 'eleve') : [];
        const perdu = x.e && x.e.e === 'perdu';
        const doc = perdu ? `<span class="mp-perdu">Perdu</span>`
          : !x.fait && !ici && acts.some(a => a === 'declarer' || a === 'recevoir') ? `<button class="lien mp-deja" data-agir="${x.id}" data-action="${acts.find(a => a === 'declarer' || a === 'recevoir')}" data-deja-g="1">${x.e && x.e.e === 'remis' ? 'Je l’ai reçu' : 'Je l’ai déjà'}</button>`
          : acts.includes('perdre') ? `<button class="lien mp-perte" data-agir="${x.id}" data-action="perdre">Je l’ai perdu</button>` : '';
        const tag = x.lien && !x.fait ? `<a class="mp-moi ${ici ? 'ici' : ''}" href="${x.lien}">` : `<div class="mp-moi ${x.fait ? 'fait' : ici ? 'ici' : ''}">`;
        h += `${tag}<span class="b">✓</span><span class="x">${esc(x.titre)}${x.sous ? `<small>${esc(x.sous)}</small>` : ''}${doc ? `<span class="mp-doc">${doc}</span>` : ''}</span>${deux}${ann}${x.lien && !x.fait ? '</a>' : '</div>'}`;
      } else if (x.voit) h += `<div class="mp-autre ${x.fait ? 'fait' : ''}"><i class="ti ti-${x.fait ? 'circle-check' : x.ic}"></i>${esc(x.titre)}</div>`;
    });
    return h;
  }

  /* ══ Mon suivi (11/10/2026) ═══════════════════════════════════════════════
     Étapes repliées · une ligne = un thème + une consigne (un verbe d'action) · bleu = à cliquer, vert = fait,
     horloge = un adulte agit, rouge = à corriger. Rien ne bloque : toute étape s'ouvre d'un clic.
     Aucune communication écrite libre avec un adulte : l'élève choisit, confirme, signale.
     Le moteur partagé (pfmp-commun.js) ne change pas : seuls l'affichage et les mots changent ici. */
  const TXT = {
    neg_ask: ['Ma fiche de négociation', 'Demander', 'la fiche de négociation', 'Demandée'],
    neg_given: ['Réception de ma fiche', 'Confirmer', 'la réception de la fiche de négociation', 'Reçue'],
    neg_visit: ['Fiche à l’entreprise', 'Remettre', 'la fiche de négociation à l’entreprise', 'Remise'],
    neg_company: ['Fiche complétée', 'Récupérer', 'la fiche complétée par l’entreprise', 'Récupérée'],
    neg_family: ['Signature de ma fiche', 'Signer', 'la fiche de négociation', 'Signée'],
    neg_to_pro: ['Remise de ma fiche', 'Remettre', 'la fiche à l’enseignant professionnel', 'Remise'],
    pre_given: ['Ma pré-convention', 'Confirmer', 'la réception de la pré-convention', 'Reçue'],
    pre_ent: ['Pré-convention à l’entreprise', 'Remettre', 'la pré-convention à l’entreprise', 'Remise'],
    pre_filled: ['Pré-convention complétée', 'Récupérer', 'la pré-convention complétée par l’entreprise', 'Récupérée'],
    pre_return: ['Remise de ma pré-convention', 'Remettre', 'la pré-convention à l’enseignant référent', 'Remise'],
    conv_given: ['Réception de ma convention', 'Confirmer', 'la réception de la convention', 'Reçue'],
    company: ['Signature de l’entreprise', 'Faire signer', 'la convention par l’entreprise, avec le cachet', 'Signée, avec le cachet'],
    family: ['Signature du responsable légal', 'Faire signer', 'la convention par le responsable légal (élève majeur : la signer)', 'Signée'],
    conv_return: ['Remise de ma convention', 'Remettre', 'la convention signée à l’enseignant référent', 'Remise'],
    copies: ['Exemplaire pour ma famille', 'Confirmer', 'la réception de l’exemplaire signé', 'Reçu'],
    here: ['Mon arrivée', 'Confirmer', 'l’arrivée dans l’entreprise', 'Confirmée'],
    midpoint: ['Mon stage au quotidien', 'Indiquer', 'comment se passe le stage', ''],
    attest_in: ['Mon attestation', 'Confirmer', 'la réception de l’attestation signée par l’entreprise', 'Reçue'],
    attestation: ['Remise de mon attestation', 'Remettre', 'l’attestation à l’enseignant référent', 'Remise'],
    student_eval: ['Mon bilan de PFMP', 'Réaliser', 'le bilan avec l’enseignant référent', 'Réalisé']
  };
  /* Ce que font les adultes : [ce qu'on attend, ce qui s'affiche une fois fait]. */
  const ADULTES = {
    neg_pro: ['validation de la fiche par l’enseignant professionnel', 'Fiche validée par l’enseignant professionnel'],
    neg_signed: ['validation du lieu de stage par mon enseignant référent', 'Lieu de stage validé par mon enseignant référent'],
    pronote: ['convention en préparation par mon enseignant référent', 'Convention préparée par mon enseignant référent'],
    head: ['signature par le chef d’établissement', 'Convention signée par le chef d’établissement'],
    arrival: ['accueil confirmé avec le tuteur par mon enseignant référent', 'Accueil confirmé avec le tuteur'],
    visit: ['suivi par mon enseignant référent (visite ou appel)', 'Suivi réalisé par mon enseignant référent'],
    attestation_bde: ['attestation transmise au bureau des entreprises, pour l’allocation de stage', 'Attestation transmise au bureau des entreprises, pour l’allocation de stage,'],
    dossier: ['clôture du dossier par mon enseignant référent', 'Dossier de PFMP clôturé']
  };
  /* Les contrôles du référent après une remise : il valide, ou renvoie « à corriger » avec un motif. */
  const CONTROLES = {
    pre_return: ['contrôle de la pré-convention par mon enseignant référent', 'Pré-convention validée par mon enseignant référent'],
    conv_return: ['contrôle et signature par mon enseignant référent', 'Convention contrôlée et signée par mon enseignant référent'],
    attestation: ['contrôle de l’attestation par mon enseignant référent', 'Attestation contrôlée par mon enseignant référent'],
    student_eval: ['validation du bilan par mon enseignant référent', 'Bilan validé par mon enseignant référent']
  };
  /* L'ordre des lignes dans chaque étape. A: = un adulte · L: = geste noté par l'élève seul · _ = ligne particulière. */
  const COMPO = [[], ['_cv', '_lettre', '_dem', 'search'],
    ['neg_ask', 'neg_given', 'neg_visit', 'neg_company', 'neg_family', 'neg_to_pro', 'A:neg_pro', 'A:neg_signed'],
    ['pre_given', 'pre_ent', 'pre_filled', 'pre_return'],
    ['A:pronote', 'conv_given', 'company', 'family', 'conv_return', 'A:head', 'copies'],
    ['_depart', 'A:arrival'], ['here', '_carnet', 'midpoint', 'A:visit', 'attest_in'],
    ['attestation', 'A:attestation_bde', 'student_eval'], ['A:dossier']];
  const TITRES6 = ['Mon enseignant référent', 'Recherche de stage', 'Fiche de négociation', 'Pré-convention', 'Convention', 'Départ', 'En stage', 'Bilan', 'Clôture du dossier'];
  const QUOI6 = {
    2: ['La fiche de négociation', [['Qui me la donne ?', 'L’enseignant professionnel.'], ['Qui la complète ?', 'L’entreprise : elle coche les activités, signe et appose son cachet.'], ['À qui je la rends ?', 'À l’enseignant professionnel, après l’avoir signée.']]],
    3: ['La pré-convention', [['Qui me la donne ?', 'Mon enseignant référent.'], ['Qui la complète ?', 'L’entreprise : dates, adresse, tuteur, horaires, signature et cachet.'], ['À qui je la rends ?', 'À mon enseignant référent.']]],
    4: ['La convention', [['Qui me la donne ?', 'Mon enseignant référent.'], ['Qui la signe ?', 'L’entreprise (avec le cachet), le tuteur, le responsable légal ou l’élève majeur, l’enseignant référent et le chef d’établissement.'], ['À qui je la rends ?', 'À mon enseignant référent, signée par l’entreprise et par le responsable légal.']]],
    7: ['L’attestation de stage', [['Qui me la donne ?', 'L’entreprise, le dernier jour du stage.'], ['À quoi sert-elle ?', 'Elle prouve les jours réalisés. Sans elle, l’allocation n’est pas versée.'], ['À qui je la rends ?', 'À mon enseignant référent.']]]
  };
  const quand6 = le => { const d = le ? new Date(le) : null; return d && !isNaN(d) ? ' le ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : ''; };
  const OKI = '<i class="ti ti-circle-check"></i> ';

  function ligneStage6() {
    const p = L.prepa, en_ = entreeEl('search'), e = en_.e, r = p.trouveR && (L.recherches || []).find(x => x.id === p.trouveR);
    return { k: 'search', type: 'stage', th: 'Mon stage', lieu: r ? (r.nom || 'Entreprise') + (r.adresse ? ' · ' + r.adresse : '') : '', motif: en_.motif, le: en_.le,
      etat: ['valide', 'fait'].includes(e) ? 'fait' : e === 'declare' ? 'attente' : e === 'corriger' ? 'corriger' : (p.trouve === 'Oui' && r) ? 'pret' : 'afaire' };
  }
  function lignes6(ph) {
    const s = suivi(), p = L.prepa, out = [], R = L.recherches || [];
    let prec = ph < 3 || statut6(ph - 1) === 2;   /* un adulte n'est « attendu » que si l'étape d'avant est terminée */
    COMPO[ph].forEach(k => {
      let l;
      if (k === '_cv' || k === '_lettre') {
        const cle = k.slice(1), v = p[cle] || '', ok = v === (cle === 'cv' ? 'À jour' : 'Prête');
        l = { k: cle, type: 'choix', th: cle === 'cv' ? 'Mon CV' : 'Ma lettre de motivation', v: 'Indiquer', o: 'où en est ' + (cle === 'cv' ? 'le CV' : 'la lettre de motivation'), etat: ok ? 'fait' : (v && v !== 'Pas du tout') ? 'cours' : 'afaire', mot: ok ? 'Terminé' : 'En cours' };
      } else if (k === '_dem') {
        const n = x => R.filter(r => r.statut === x).length;
        l = { type: 'page', neutre: 1, th: 'Mes démarches', lien: '#recherches', sous: R.length ? `${R.length} entreprise${R.length > 1 ? 's' : ''}${n('rappeler') ? ' · ' + n('rappeler') + ' à rappeler' : ''}${n('entretien') ? ' · ' + n('entretien') + ' entretien' + (n('entretien') > 1 ? 's' : '') : ''}${n('accord') ? ' · ' + n('accord') + ' accord' + (n('accord') > 1 ? 's' : '') : ''}` : 'Appels, visites, mails' };
      } else if (k === '_depart') l = { type: 'page', neutre: 1, th: 'Prêt à partir', lien: '#p/depart', sous: DEPART.filter(([c]) => L.depart[c]).length + ' / ' + DEPART.length };
      else if (k === '_carnet') l = { type: 'page', neutre: 1, th: 'Mon carnet de bord', lien: '../carnet/index.html', sous: 'Chaque jour de stage' };
      else if (k === 'search') l = ligneStage6();
      else if (k.startsWith('L:')) { const id = k.slice(2), T = TXT[id]; l = { k: id, type: 'local', th: T[0], v: T[1], o: T[2], mot: T[3], etat: L.fiche[id] ? 'fait' : 'afaire' }; }
      else if (k.startsWith('A:')) {
        const id = k.slice(2), en_ = s ? P.entree(s, id) : { e: '' };
        l = { k: id, type: 'adulte', fait: !!s && P.estFaite(s, id), attente: ADULTES[id][0], txt: ADULTES[id][1], le: en_.le, attendu: prec };
        /* Un rendez-vous fixé n'est pas une visite faite : le vert vient du bilan réalisé avec le tuteur. */
        if (id === 'visit') { const b = s ? P.entree(s, 'assessment') : { e: '' }; l.fait = !!s && P.estFaite(s, 'assessment'); l.le = b.le;
          if (!l.fait && s && s.visite && /^\d{4}-\d{2}-\d{2}/.test(s.visite.le || '')) { l.attente = 'rendez-vous de suivi fixé' + quand6(s.visite.le.slice(0, 10) + 'T12:00:00'); l.attendu = true; } }
      } else {
        const et = P.PAR_ID[k], en_ = entreeEl(k), e = en_.e, T = TXT[k], acts = s ? P.actions(et, en_, 'eleve') : [];
        l = { k, type: k === 'midpoint' ? 'passe' : 'etape', et, th: T[0], v: T[1], o: T[2], mot: T[3], motif: en_.motif, garde: et.garde,
          etat: e === 'perdu' ? 'perdu' : e === 'corriger' ? 'corriger' : faitEl(et, en_) ? 'fait' : 'afaire',
          action: acts.find(a => ['declarer', 'remettre', 'recevoir', 'faire'].includes(a)) || '', annulable: acts.includes('annuler'), perdable: acts.includes('perdre') };
        if (k === 'midpoint' && l.etat === 'fait') l.mot = en_.v === 'difficulte' ? 'Difficile' : en_.v === 'moyen' ? 'Moyen' : 'Bien';
      }
      out.push(l);
      if (!l.neutre) prec = l.type === 'adulte' ? l.fait : l.etat === 'fait';
      if (CONTROLES[k]) {
        const en_ = entreeEl(k), c = CONTROLES[k];
        out.push({ k: k + '_c', type: 'adulte', fait: en_.e === 'valide', attente: c[0], txt: c[1], le: en_.le, attendu: ['remis', 'declare'].includes(en_.e), cache: en_.e === 'corriger' });
        prec = en_.e === 'valide';
      }
    });
    /* Une étape n'est terminée que lorsque les gestes administratifs du lycée, non détaillés ici, sont faits eux aussi. */
    if (s) {
      const vus = new Set(COMPO[ph].map(k => k.replace(/^[AL]:/, '')).concat(['visit', 'assessment']));
      const caches = P.ETAPES.filter(et => et.ph === ph && !et.local && !et.opt && et.ty !== 'journal' && !vus.has(et.id));
      if (caches.length) { const ok = caches.every(et => P.estFaite(s, et.id)), dates = caches.map(et => P.entree(s, et.id).le || '').sort();
        out.push({ k: '_admin' + ph, type: 'adulte', fait: ok, attente: 'traitement administratif par le lycée', txt: 'Traitement administratif terminé', le: ok ? dates[dates.length - 1] : '', attendu: prec }); }
    }
    /* Après la validation d'un adulte, ce qui précède dans l'étape ne s'annule plus (traçabilité). */
    out.forEach((l, i) => { if (l.type !== 'adulte' && out.slice(i + 1).some(a => a.type === 'adulte' && a.fait)) l.verrou = true; });
    return out;
  }
  /* 2 = terminée (l'élève ET les adultes ont fini) · 1 = en cours · 0 = pas commencée. */
  function statut6(ph) {
    const s = suivi();
    if (ph === 0) return s && (s.refSigle || P.estFaite(s, 'referent')) ? 2 : 0;
    const ls = lignes6(ph).filter(l => !l.neutre && !l.cache);
    const finie = l => l.type === 'adulte' ? l.fait : l.etat === 'fait';
    if (ls.length && ls.every(finie)) return 2;
    return ls.some(l => l.type === 'adulte' ? l.fait : l.etat !== 'afaire') ? 1 : 0;
  }
  function ligne6(l) {
    const cons = `<span class="g"><b class="th">${esc(l.th)}</b><span class="co"><b>${esc(l.v || '')}</b> ${esc(l.o || '')}</span></span>`;
    const verte = (mot, clic) => `<${clic ? `button data-v6="defaire" data-id="${l.k}"` : 'div'} class="s6-l fait"><span class="g"><b class="th">${esc(l.th)}</b></span><span class="pill ok">${OKI}${esc(mot)}</span></${clic ? 'button' : 'div'}>`;
    if (l.type === 'adulte') {
      if (l.cache) return '';
      if (l.fait) return `<div class="s6-ad ok">${OKI}${esc(l.txt)}${quand6(l.le)}.</div>`;
      return `<div class="s6-ad ${l.attendu ? 'att' : ''}"><i class="ti ti-clock"></i> ${l.attendu ? 'En attente · ' : 'Puis : '}${esc(l.attente)}</div>`;
    }
    if (l.type === 'page') return `<div class="s6-l"><span class="g"><b class="th">${esc(l.th)}</b><span class="co">${esc(l.sous)}</span></span><a class="s6-go" href="${l.lien}">Ouvrir</a></div>`;
    if (l.type === 'choix') return l.etat === 'fait' ? verte(l.mot, true) : `<div class="s6-l">${cons}${l.etat === 'cours' ? '<span class="pill att">En cours</span>' : ''}<button class="s6-go" data-v6="choix" data-id="${l.k}">Répondre</button></div>`;
    if (l.type === 'local') return l.etat === 'fait' ? verte(l.mot, !l.verrou) : `<div class="s6-l">${cons}<button class="s6-go" data-v6="local" data-id="${l.k}">C’est fait</button></div>`;
    if (l.type === 'stage') {
      const lieu = `<span class="g"><b class="th">Mon stage</b><span class="co">${esc(l.lieu)}</span></span>`;
      if (l.etat === 'afaire') return `<div class="s6-l"><span class="g"><b class="th">Mon stage</b></span><button class="s6-go" data-v6="stage">J’ai un stage</button></div>`;
      if (l.etat === 'fait') return `<div class="s6-l fait">${lieu}<span class="pill ok">${OKI}Validé par mon référent</span></div>`;
      if (l.etat === 'attente') return `<div class="s6-l col"><div class="r">${lieu}<span class="pill att"><i class="ti ti-clock"></i> En attente du référent</span></div><span class="co">Envoyé${quand6(l.le)}</span><div class="r2"><button class="s6-sec" data-agir="search" data-action="annuler" data-ok="1">Annuler l’envoi</button></div></div>`;
      if (l.etat === 'corriger') return `<div class="s6-l col cor"><div class="r">${lieu}<span class="pill err">À corriger</span></div>${l.motif ? `<span class="co rouge">Motif : ${esc(l.motif)}</span>` : ''}<div class="r2"><button class="s6-sec" data-v6="stage">Modifier</button><button class="s6-go" data-act="trouve" data-ok="1">C’est corrigé</button></div></div>`;
      return `<div class="s6-l col"><div class="r">${lieu}<span class="pill gris">Pas encore envoyé</span></div>${suivi() ? `<button class="s6-vert" data-act="trouve" data-ok="1"><i class="ti ti-send"></i> Envoyer à mon référent</button>` : ''}<div class="r2"><button class="s6-sec" data-v6="stage">Modifier</button><button class="s6-sec" data-rpasici="${esc(L.prepa.trouveR)}">Ce n’est plus mon stage</button></div></div>`;
    }
    /* Une étape du parcours partagé, ou « comment se passe le stage ». */
    if (l.etat === 'perdu') return `<div class="s6-l col cor"><div class="r"><span class="g"><b class="th">${esc(l.th)}</b></span><span class="pill err">Perdu</span></div><span class="co">Mon référent et mon professeur principal sont prévenus.</span><div class="r2"><button class="s6-go" data-agir="${l.k}" data-action="retrouver" data-ok="1">Je l’ai retrouvé</button></div></div>`;
    if (l.etat === 'corriger') return `<div class="s6-l col cor"><div class="r"><span class="g"><b class="th">${esc(l.th)}</b></span><span class="pill err">À corriger</span></div>${l.motif ? `<span class="co rouge">Motif : ${esc(l.motif)}</span>` : ''}<div class="r2"><button class="s6-go" data-agir="${l.k}" data-action="${l.action}" data-ok="1">C’est corrigé</button></div></div>`;
    if (l.etat === 'fait') return verte(l.mot, !l.verrou && (l.annulable || l.perdable || !suivi()));
    if (l.type === 'passe') return suivi() ? `<div class="s6-l">${cons}<button class="s6-go" data-v6="choix" data-id="midpoint">Répondre</button></div>` : `<div class="s6-l">${cons}</div>`;
    const bouton = !suivi() ? `<button class="s6-go" data-locale="${l.k}">C’est fait</button>` : l.action ? `<button class="s6-go" data-agir="${l.k}" data-action="${l.action}" data-ok="1">C’est fait</button>` : '';
    return `<div class="s6-l">${cons}${bouton}</div>`;
  }
  let ouvert6 = null, avant6 = null;
  function fil6() {
    const s = suivi(), st = TITRES6.map((_, ph) => statut6(ph));
    const suivante = () => { const c = st.findIndex((x, i) => i > 0 && x !== 2); return c < 0 ? 8 : c; };
    if (!ouvert6) { ouvert6 = { 0: true }; ouvert6[suivante()] = true; }
    else if (avant6) st.forEach((x, ph) => { if (ph > 0 && x === 2 && avant6[ph] !== 2) { ouvert6[ph] = false; ouvert6[suivante()] = true; } });
    avant6 = st;
    let h = '';
    TITRES6.forEach((titre, ph) => {
      const ls = ph ? lignes6(ph) : [], cor = ls.some(l => l.etat === 'corriger' || l.etat === 'perdu');
      const p = cor ? '<span class="pill err">À corriger</span>' : st[ph] === 2 ? `<span class="pill ok">${OKI}Terminée</span>` : st[ph] === 1 ? '<span class="pill att">En cours</span>' : '';
      if (!ouvert6[ph]) { h += `<button class="s6-plie ${st[ph] === 2 ? 'fin' : ''}" data-v6="etape" data-id="${ph}"><span class="num">Étape ${ph + 1}</span><span class="g">${esc(titre)}</span>${p}<i class="ti ti-chevron-down"></i></button>`; return; }
      h += `<div class="s6-tete"><button data-v6="etape" data-id="${ph}"><span><span class="num">Étape ${ph + 1}</span> ${p}</span><h2>${esc(titre)} <i class="ti ti-chevron-up"></i></h2></button>${QUOI6[ph] ? `<button class="s6-quoi" data-v6="quoi" data-id="${ph}">C’est quoi ?</button>` : ''}</div>`;
      if (ph === 0) {
        const le = s ? (P.entree(s, 'referent').le || P.entree(s, 'sent').le) : '';
        h += s && s.refSigle ? `<div class="s6-annonce"><i class="ti ti-bell"></i> Un enseignant référent a été désigné${quand6(le)}<b>professeur ${/^[aeiouéèêh]/i.test(s.refSigle) ? 'd’' : 'de '}${esc(s.refSigle)}</b></div>` : `<div class="s6-ad"><i class="ti ti-clock"></i> Mon enseignant référent : à venir</div>`;
      }
      h += ls.map(ligne6).join('');
    });
    return h;
  }

  /* Les petites fenêtres : un clic choisit, la fenêtre se ferme, la ligne se met à jour. */
  let fen6 = null;
  function fenetre6() {
    const f = fen6, x = `<button class="rond-btn" data-act="fermer" aria-label="Fermer"><i class="ti ti-x"></i></button>`;
    const tete = t => `<div class="vt"><h2>${esc(t)}</h2>${x}</div>`;
    if (f.t === 'choix') {
      if (f.id === 'midpoint') return tete('Mon stage au quotidien') + [['ok', 'Bien'], ['moyen', 'Moyen'], ['difficulte', 'Difficile']].map(([v, l]) => `<button class="s6-opt" data-v6c="${v}">${l}</button>`).join('');
      const fin = f.id === 'cv' ? 'À jour' : 'Prête';
      return tete(f.id === 'cv' ? 'Mon CV' : 'Ma lettre de motivation') + `<button class="s6-opt" data-v6c="Pas du tout">À faire</button><button class="s6-opt" data-v6c="En cours">En cours</button><button class="s6-opt vert" data-v6c="${fin}">${OKI}Terminé</button>`;
    }
    if (f.t === 'defaire') {
      const l = f.l;
      return tete(l.th) + (l.type === 'choix' ? `<button class="s6-opt" data-v6a="rechoisir">Modifier ma réponse</button>` : '')
        + (l.type === 'local' || l.annulable || (!suivi() && l.type !== 'choix') ? `<button class="s6-opt" data-v6a="annuler">Annuler</button>` : '')
        + (l.perdable ? `<button class="s6-opt" data-v6a="perdre">Je l’ai perdu</button>` : '');
    }
    if (f.t === 'stage') {
      const R = (L.recherches || []).filter(r => r.statut !== 'refus'), r = L.prepa.trouveR && (L.recherches || []).find(y => y.id === L.prepa.trouveR);
      return tete('J’ai un stage') + (R.length ? R.map(y => `<button class="s6-opt gauche ${r && r.id === y.id ? 'on' : ''}" data-v6r="${esc(y.id)}">${esc(y.nom || 'Entreprise')}${y.adresse ? `<small>${esc(y.adresse)}</small>` : ''}</button>`).join('') + `<p class="s6-ou">ou une autre entreprise</p>` : '')
        + `<label class="champ">Nom de l’entreprise<input type="text" id="s6Nom" maxlength="80"></label><div id="s6Err" class="s6-err"></div><label class="champ">Ville (facultatif)<input type="text" id="s6Ville" maxlength="80"></label><button class="s6-opt vert" data-v6a="okStage">${OKI}Enregistrer</button>`;
    }
    if (f.t === 'quoi') { const q = QUOI6[f.id]; return tete(q[0]) + q[1].map(([a, b]) => `<p class="s6-q">${esc(a)}</p><p class="s6-r">${esc(b)}</p>`).join('') + `<button class="s6-opt" data-act="fermer">Fermer</button>`; }
    return '';
  }
  function ouvrir6(f) { fen6 = f; volet = 'v6'; rendreVolet(); const n = $('s6Nom'); if (n && !(L.recherches || []).some(r => r.statut !== 'refus')) n.focus(); }
  function fermer6() { fen6 = null; volet = ''; rendreVolet(); }
  function trouver6(id) { for (let ph = 1; ph < 9; ph++) { const l = lignes6(ph).find(y => y.k === id); if (l) return l; } return null; }
  function clic6(d) {
    if (d.v6 === 'etape') { ouvert6[d.id] = !ouvert6[d.id]; rendre(); return; }
    if (d.v6 === 'quoi') return ouvrir6({ t: 'quoi', id: +d.id });
    if (d.v6 === 'choix') return ouvrir6({ t: 'choix', id: d.id });
    if (d.v6 === 'stage') return ouvrir6({ t: 'stage' });
    if (d.v6 === 'local') { L.fiche[d.id] = true; sauver(); rendre(); return; }
    if (d.v6 === 'defaire') { const l = trouver6(d.id); if (l) ouvrir6({ t: 'defaire', l }); return; }
    if (d.v6 === 'signal') return signaler6(d.id);
  }
  function agir6(id, action, extra) {
    if (!svc || !suivi()) { toast('Hors ligne : à refaire quand la page est enregistrée.'); return; }
    svc.agir(sid(), id, action, 'eleve', extra).then(() => toast(action === 'perdre' ? 'Votre référent et votre professeur principal sont prévenus.' : action === 'annuler' ? 'Annulé.' : 'Enregistré.')).catch(e => toast(e.message));
  }
  function voletClic6(d) {
    const f = fen6; if (!f) return;
    if (d.v6c != null) {
      fermer6();
      if (f.id === 'midpoint') return agir6('midpoint', 'declarer', { v: d.v6c });
      L.prepa[f.id] = d.v6c; sauver(); rendre(); return;
    }
    if (d.v6r) { Object.assign(L.prepa, { trouve: 'Oui', trouveR: d.v6r }); fermer6(); sauver(true); rendre(); return; }
    if (d.v6a === 'okStage') {
      const nom = $('s6Nom').value.trim(); if (!nom) { $('s6Err').textContent = 'Écrire le nom de l’entreprise.'; $('s6Nom').focus(); return; }
      const id = 'r' + Date.now().toString(36);
      L.recherches = (L.recherches || []).concat([{ id, nom: nom.slice(0, 80), adresse: $('s6Ville').value.trim().slice(0, 80), tel: '', moyen: 'autre', avec: 'Seul', date: auj(), statut: 'accord' }]);
      Object.assign(L.prepa, { trouve: 'Oui', trouveR: id }); fermer6(); sauver(true); rendre(); return;
    }
    if (d.v6a === 'rechoisir') return ouvrir6({ t: 'choix', id: f.l.k });
    if (d.v6a === 'annuler') {
      const l = f.l; fermer6();
      if (l.type === 'local') { L.fiche[l.k] = false; sauver(); rendre(); return; }
      if (!suivi()) { L.locales = L.locales || {}; L.locales[l.k] = false; sauver(); rendre(); return; }
      return agir6(l.k, 'annuler');
    }
    if (d.v6a === 'perdre') { const l = f.l; fermer6(); return agir6(l.k, 'perdre'); }
  }

  /* ── Besoin d'aide ? Une question = une réponse immédiate. Un problème = un clic prévient le référent. ──
     Réponses appuyées sur les textes officiels et sur le calendrier du lycée (listing du 11/10/2026).
     Un signalement est une ligne à texte fixe dans le fil du suivi (« §signal:clé ») : l'élève n'écrit rien. */
  const AIDE = {
    'Mon stage': [
      ['Combien de semaines de stage cette année ?', '6 semaines en seconde.'],
      ['Et sur les trois ans ?', '20 semaines : 6 en seconde, 8 en première, 6 en terminale.'],
      ['Qu’est-ce qu’un jour de stage ?', 'Une journée d’au moins 7 heures de présence.'],
      ['Je ne trouve pas de stage : que faire ?', 'Le dire à l’enseignant référent. Le lycée doit trouver un lieu d’accueil pour chaque élève.'],
      ['Suis-je noté ?', 'En seconde, non : un bilan est fait avec le tuteur et l’enseignant référent.'],
      ['Les stages comptent-ils pour le bac ?', 'Oui. Les attestations de stage font partie du dossier d’examen.']],
    'Mes documents': [
      ['À qui demander ma fiche de négociation ?', 'À l’enseignant professionnel. S’il est absent : au professeur principal.'],
      ['Qui me donne la pré-convention ?', 'L’enseignant référent, en main propre.'],
      ['Qui signe ma convention ?', 'L’entreprise (avec le cachet), le tuteur, le responsable légal ou l’élève majeur, l’enseignant référent et le chef d’établissement.'],
      ['À quoi sert l’attestation de stage ?', 'Elle prouve les jours réalisés. Sans elle, l’allocation n’est pas versée.'],
      ['Quand l’entreprise remplit-elle l’attestation ?', 'Le dernier jour du stage.']],
    'Absence et horaires': [
      ['Si je suis absent, suis-je payé ?', 'Non. Un jour d’absence n’est pas payé, quel que soit le motif.'],
      ['Une demi-journée compte-t-elle ?', 'Non. Seuls les jours entiers comptent.'],
      ['Puis-je rattraper les jours manqués ?', 'Oui : en prolongeant le stage, ou avec une nouvelle convention.'],
      ['Combien d’heures par jour, au maximum ?', 'Élève mineur : 8 heures par jour et 35 heures par semaine.'],
      ['Combien de jours de repos ?', 'Élève mineur : 2 jours de suite chaque semaine, dimanche compris.'],
      ['Puis-je travailler un jour férié ?', 'Élève mineur : non.']],
    'Argent du stage': [
      ['Combien vais-je recevoir ?', '10 € par jour de stage réalisé. 300 € au plus sur l’année de seconde.'],
      ['Qui me paie ?', 'L’État, pas l’entreprise.'],
      ['Quand vais-je recevoir l’argent ?', 'Après le stage, une fois l’attestation rendue au lycée.'],
      ['Puis-je avoir une avance ?', 'Non.'],
      ['Sur quel compte ?', 'Sur le compte de l’élève si le responsable légal l’autorise par écrit, sinon sur le compte du responsable légal.'],
      ['Mes trajets et mes repas sont-ils remboursés ?', 'L’allocation ne les rembourse pas.']],
    'Sécurité': [
      ['Que se passe-t-il en cas d’accident ?', 'L’accident est couvert comme un accident du travail. L’entreprise le déclare dans les 48 heures.'],
      ['Si je casse quelque chose ?', 'Le lycée a une assurance qui couvre le stagiaire.'],
      ['Peut-on me donner une tâche dangereuse ?', 'Non. L’entreprise fournit les protections et explique les risques du poste.'],
      ['On me traite mal : que faire ?', 'Le signaler à l’enseignant référent. Le stagiaire est protégé comme un salarié.']]
  };
  const SIGNAUX = { stage: 'Je ne trouve pas de stage', annule: 'Mon entreprise a annulé mon stage', absent: 'Je suis absent ou en retard', mal: 'Mon stage se passe mal', contact: 'Je souhaite être contacté par mon référent',
    'perdu-neg_given': 'J’ai perdu ma fiche de négociation', 'perdu-pre_given': 'J’ai perdu ma pré-convention', 'perdu-conv_given': 'J’ai perdu ma convention', 'perdu-attest_in': 'J’ai perdu mon attestation' };
  const PROBLEMES6 = ['stage', 'annule', 'absent', '_doc', 'mal', 'contact'];
  const DOCS6 = [['neg_given', 'Fiche de négociation'], ['pre_given', 'Pré-convention'], ['conv_given', 'Convention'], ['attest_in', 'Attestation']];
  let rech6 = '', qouv6 = '';
  const sansAccent = x => String(x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const signaux6 = () => msgs.filter(m => m.de === 'eleve' && /^§signal:/.test(m.texte || '')).map(m => ({ k: m.texte.slice(8), le: m.le, vu: msgs.some(y => y.de !== 'eleve' && y.texte === '§vu:' + m.le) })).filter(x => SIGNAUX[x.k]).reverse();
  const cartesSignaux6 = actifs => signaux6().filter(x => !actifs || !x.vu).map(x => `<div class="s6-l col ${x.vu ? 'fait' : ''}"><b class="th">${esc(SIGNAUX[x.k])}</b><span class="co">Signalement envoyé${quand6(x.le)}</span>
    <span class="co vert">${OKI}Mon référent est prévenu${['mal', 'contact'].includes(x.k) ? '. Il prendra contact avec moi.' : ''}</span>${x.vu ? `<span class="co vert">${OKI}Mon référent a pris connaissance de mon signalement</span>` : ''}</div>`).join('');
  const listeQ6 = l => l.map(([q, a]) => `<button class="s6-q6" data-v6q="${esc(q)}"><span class="g">${esc(q)}</span><i class="ti ti-chevron-${qouv6 === q ? 'up' : 'down'}"></i></button>${qouv6 === q ? `<div class="s6-rep">${esc(a)}</div>` : ''}`).join('');
  function resAide6() {
    const r = sansAccent(rech6.trim());
    if (r.length < 2) return Object.keys(AIDE).map(k => `<a class="s6-q6" href="#aide/q/${encodeURIComponent(k)}"><span class="g">${esc(k)}</span><i class="ti ti-chevron-right"></i></a>`).join('');
    const l = []; Object.keys(AIDE).forEach(k => AIDE[k].forEach(y => { if (sansAccent(y[0] + ' ' + y[1] + ' ' + k).includes(r)) l.push(y); }));
    return l.length ? listeQ6(l) : `<p class="s6-rien">Aucune réponse.</p><a class="s6-go large" href="#aide/probleme">Prévenir mon référent</a>`;
  }
  function pageAide(h) {
    const dos = (lien, t) => `<a class="retour" href="${lien}"><i class="ti ti-chevron-left"></i> ${t}</a>`;
    if (h === '#aide') { const c = cartesSignaux6(false); return dos('#', 'Mon suivi') + `<h1 class="s6-h1">Besoin d’aide ?</h1>
      <a class="s6-q6 gros" href="#aide/question"><i class="ti ti-help-circle"></i><span class="g">J’ai une question</span><i class="ti ti-chevron-right"></i></a>
      <a class="s6-q6 gros fort" href="#aide/probleme"><i class="ti ti-alert-triangle"></i><span class="g">J’ai un problème</span><i class="ti ti-chevron-right"></i></a>${c ? `<p class="s6-grp">Mes signalements</p>` + c : ''}`; }
    if (h === '#aide/question') return dos('#aide', 'Besoin d’aide ?') + `<h1 class="s6-h1">J’ai une question</h1><label class="sr" for="aideR">Ma question</label><input type="search" id="aideR" placeholder="Écrire ma question" value="${esc(rech6)}"><div id="aideRes">${resAide6()}</div>`;
    if (h.startsWith('#aide/q/')) { const k = decodeURIComponent(h.slice(8)); return dos('#aide/question', 'J’ai une question') + `<h1 class="s6-h1">${esc(k)}</h1>` + listeQ6(AIDE[k] || []); }
    if (h === '#aide/probleme') return dos('#aide', 'Besoin d’aide ?') + `<h1 class="s6-h1">J’ai un problème</h1>` + PROBLEMES6.map(k => `<a class="s6-q6" href="${k === '_doc' ? '#aide/document' : '#aide/signaler/' + k}"><span class="g">${k === '_doc' ? 'J’ai perdu un document' : esc(SIGNAUX[k])}</span><i class="ti ti-chevron-right"></i></a>`).join('');
    if (h === '#aide/document') return dos('#aide/probleme', 'J’ai un problème') + `<h1 class="s6-h1">J’ai perdu un document</h1>` + DOCS6.map(([id, n]) => `<a class="s6-q6" href="#aide/signaler/perdu-${id}"><span class="g">${esc(n)}</span><i class="ti ti-chevron-right"></i></a>`).join('');
    if (h.startsWith('#aide/signaler/')) { const k = h.slice(15); if (!SIGNAUX[k]) { location.hash = '#aide'; return ''; }
      return dos(k.startsWith('perdu-') ? '#aide/document' : '#aide/probleme', 'J’ai un problème') + `<h1 class="s6-h1">${esc(SIGNAUX[k])}</h1>${suivi() ? `<button class="s6-vert" data-v6="signal" data-id="${esc(k)}"><i class="ti ti-send"></i> Prévenir mon référent</button>` : `<p class="s6-rien">Disponible quand le stage est ouvert par le lycée.</p>`}`; }
    location.hash = '#aide'; return '';
  }
  function signaler6(k) {
    if (!svc || !suivi() || !SIGNAUX[k]) return;
    /* Un document déjà en main : le moteur a son propre état « perdu », vu par le référent et le professeur principal. */
    if (k.startsWith('perdu-')) { const id = k.slice(6), et = P.PAR_ID[id]; if (P.actions(et, en(id), 'eleve').includes('perdre')) { agir6(id, 'perdre'); location.hash = '#'; return; } }
    if (signaux6().some(x => x.k === k && !x.vu)) { toast('Déjà signalé : votre référent est prévenu.'); location.hash = '#aide'; return; }
    svc.envoyerMessage(sid(), 'eleve', '', '§signal:' + k).then(() => { toast('Votre référent est prévenu.'); location.hash = '#aide'; }).catch(e => toast(e.message));
  }

  /* ── Accueil ─────────────────────────────────────────────────────────── */
  function pageAccueil() {
    if (!declare()) return `<button class="declarer" onclick="location.hash='#declarer'"><i class="ti ti-plus"></i>Déclarer un stage</button>`;
    /* Pendant le stage : le carnet de bord du jour passe en premier. */
    const per = periode(), t = auj(), enStage = per.debut && per.fin && t >= per.debut && t <= per.fin, c = cartesSignaux6(true);
    return `${enStage ? `<a class="alerte fort" href="../carnet/index.html"><i class="ti ti-notebook"></i><span>Remplir mon carnet de bord du jour</span><i class="ti ti-chevron-right"></i></a>` : ''}
      <section class="s6">${fil6()}</section>
      <a class="s6-aide" href="#aide"><i class="ti ti-lifebuoy"></i> Besoin d’aide ?</a>
      ${c ? `<p class="s6-grp">Mes signalements en cours</p>` + c : ''}
      <a class="lien" href="#declarer"><i class="ti ti-pencil"></i> Modifier ma période de stage</a>`;
  }
  let chrono = null;
  function demarrerChrono() {
    clearInterval(chrono);
    if (!$('chrono')) return;
    const per = periode();
    const go = () => {
      const C = $('chrono'); if (!C) { clearInterval(chrono); return; }
      if (!per.debut) { $('jours').textContent = '—'; return; }
      const cible = auj() < per.debut ? new Date(per.debut + 'T08:00:00') : new Date(per.fin + 'T18:00:00');
      const ms = cible - new Date();
      if (ms <= 0) { $('jours').innerHTML = '<i class="ti ti-trophy"></i>'; $('joursL').textContent = 'stage terminé'; C.textContent = ''; return; }
      $('jours').textContent = Math.floor(ms / 864e5);
      $('joursL').textContent = auj() < per.debut ? 'jours avant le départ' : 'jours avant la fin du stage';
      C.textContent = String(Math.floor(ms / 36e5) % 24).padStart(2, '0') + ' h ' + String(Math.floor(ms / 6e4) % 60).padStart(2, '0') + ' min ' + String(Math.floor(ms / 1e3) % 60).padStart(2, '0') + ' s';
    };
    go(); chrono = setInterval(go, 1000);
    const st = document.querySelector('.mp-statut'), ici = st && st.querySelector('.ici');
    if (ici) st.scrollLeft = Math.max(0, ici.offsetLeft - st.offsetLeft - 40);
  }

  /* ── Déclarer / modifier mon stage ───────────────────────────────────── */
  function seg(groupe, cle, options, valeur, gros) {
    return `<div class="seg ${gros ? 'gros' : ''}">${options.map(o => `<button data-seg="${groupe}" data-cle="${cle}" data-v="${esc(o)}" class="${valeur === o ? 'on' : ''}">${valeur === o ? '<i class="ti ti-check"></i>' : ''}${esc(o)}</button>`).join('')}</div>`;
  }
  const champAutre = (groupe, cle, valeur, ph) => `<input type="text" class="autre" id="autre-${groupe}-${cle}" data-autre="${groupe}" data-cle="${cle}" maxlength="80" placeholder="${esc(ph || 'Précisez')}" value="${esc(valeur || '')}">`;
  function pageDeclarer() {
    const D = L.declaration, s = suivi();
    const blk = (n, ok, t, c) => `<div class="blk ${ok ? 'ok' : ''}"><div class="bh"><span class="num">${ok ? '<i class="ti ti-check"></i>' : n}</span>${t}</div>${c}</div>`;
    return `<a class="retour" href="#"><i class="ti ti-chevron-left"></i> Mon suivi</a>
      ${blk(1, L.avatar != null, 'Sélectionnez votre avatar', `<div class="avatars">${AVATARS.map((a, i) => `<button data-avatar="${i}" class="${L.avatar === i ? 'on' : ''}" aria-label="Avatar ${i + 1}"><span class="av" style="background:${a[1]}"><i class="ti ti-${a[0]}"></i></span></button>`).join('')}</div>`)}
      ${blk(2, !!D.pfmp, 'Sélectionnez votre stage', seg('declaration', 'pfmp', ['PFMP 1', 'PFMP 2'], D.pfmp, true))}
      ${blk(3, officiel() || !!(D.debut && D.fin), 'Sélectionnez les dates', `<div class="dates"><label>Début<input type="date" id="debut" data-date="debut" value="${esc(officiel() ? s.debut : (D.debut || (s && s.debut) || ''))}" ${officiel() ? 'disabled' : ''}></label><label>Fin<input type="date" id="fin" data-date="fin" value="${esc(officiel() ? s.fin : (D.fin || (s && s.fin) || ''))}" ${officiel() ? 'disabled' : ''}></label></div>${officiel() ? '<div class="verrou"><i class="ti ti-lock"></i> Dates du lycée</div>' : ''}`)}
      ${blk(4, !!D.domaine, 'Sélectionnez le domaine', seg('declaration', 'domaine', DOMAINES, D.domaine) + (D.domaine === 'Autre' ? champAutre('declaration', 'domaineAutre', D.domaineAutre, 'Domaine') : ''))}
      <button class="btn pri plein" data-act="enregistrer"><i class="ti ti-device-floppy"></i> Enregistrer mon stage</button>`;
  }

  /* ── Les pages de phase ──────────────────────────────────────────────── */
  function entete(k, n, total) {
    const ph = PHASES[k];
    return `<a class="retour" href="#"><i class="ti ti-chevron-left"></i> Mon suivi</a>
      <div class="ptitle"><span class="ic"><i class="ti ti-${ph.ic}"></i></span><span><h1>${esc(ph.t)}</h1>${ph.sous ? `<small>${esc(ph.sous)}</small>` : ''}</span>${total ? `<span class="prog">${n} / ${total}</span>` : ''}</div>`;
  }
  const suite = (lien, t) => `<a class="suite" href="${lien}"><i class="ti ti-arrow-right-circle"></i>${esc(t)}</a>`;
  function question(cle, ic, bg, c, titre, options, groupe) {
    groupe = groupe || 'prepa';
    const v = L[groupe][cle];
    return `<div class="qc ${v ? 'ok' : ''}"><div class="t"><span class="ic" style="background:${bg};color:${c}"><i class="ti ti-${ic}"></i></span>${esc(titre)}${v ? '<i class="ti ti-circle-check chk"></i>' : ''}</div>${seg(groupe, cle, options, v)}${v === 'Autre' ? champAutre(groupe, cle + 'Autre', L[groupe][cle + 'Autre']) : ''}</div>`;
  }
  /* Une étape partagée avec le référent : ses boutons viennent des droits de pfmp-commun. */
  function etape(id, libelle) {
    const et = P.PAR_ID[id], e = en(id), s = suivi();
    let chip = '', btns = '';
    if (!s) {
      const loc = (L.locales || {})[id];
      return `<button class="et ${loc ? 'on' : ''}" data-locale="${id}"><span class="b"><i class="ti ti-check"></i></span>${esc(libelle)}</button>`;
    }
    if (e.e === 'valide' || e.e === 'fait') chip = `<span class="chip ok"><i class="ti ti-check"></i> ${e.e === 'fait' && e.par === 'eleve' ? 'Fait' : 'Validé'}</span>`;
    else if (e.e === 'declare' || (e.e === 'remis' && et.from === 'eleve')) chip = '<span class="chip att">En attente du référent</span>';
    else if (e.e === 'corriger') chip = '<span class="chip non">À corriger</span>';
    else if ((et.ty === 'tache' || et.ty === 'info') && !chip) chip = '<span class="chip gris">En attente</span>';
    const acts = P.actions(et, e, 'eleve');
    btns = acts.filter(a => a !== 'annuler').map(a => `<button class="btn vert mini" data-agir="${id}" data-action="${a}"><i class="ti ti-check"></i> ${a === 'remettre' ? 'Remis' : a === 'recevoir' ? 'Reçu' : 'Valider'}</button>`).join('')
      + (acts.includes('annuler') ? `<button class="lien annuler" data-agir="${id}" data-action="annuler">Annuler</button>` : '');
    const remisRef = et.ty === 'remise' && et.to === 'eleve' && e.e === 'remis' ? '<small>Votre référent indique vous l’avoir remis.</small>' : '';
    return `<div class="ligne"><span class="x">${esc(libelle)}${e.e === 'corriger' && e.motif ? `<small class="err">${esc(e.motif)}</small>` : ''}${remisRef}</span>${chip}${btns}</div>`;
  }
  const infoVoit = id => (suivi() && fait(id) && P.PAR_ID[id].voit) ? `<div class="info"><i class="ti ti-info-circle"></i>${esc(P.PAR_ID[id].voit)}</div>` : '';

  function pagePhase(k) {
    if (!PHASES[k]) { location.hash = '#'; return ''; }
    const p = L.prepa;
    if (k === 'preparation') {
      const n = ['cv', 'lettre', 'trouve'].filter(x => p[x]).length;
      let h = entete(k, n, 3) +
        question('cv', 'file-cv', '#e6effa', '#1d5fae', 'Mon CV', ['À jour', 'En cours', 'Pas du tout', 'Autre']) +
        question('lettre', 'mail', '#fbeaf0', '#993556', 'Ma lettre de motivation', ['Prête', 'En cours', 'Pas du tout', 'Autre']) +
        question('trouve', 'building', '#e3f6ea', '#1f9d4c', 'J’ai une proposition de stage', ['Oui', 'Non', 'Autre']);
      if (p.trouve === 'Oui') {
        const rt = p.trouveR && (L.recherches || []).find(x => x.id === p.trouveR);
        h += `<div class="qc ok">${rt ? `<a class="ici-lien" href="#recherches"><i class="ti ti-map-pin"></i> ${esc(rt.nom || 'Entreprise')}</a>` : ''}${questionsTrouve()}${etatReferent()}</div>`;
        if (!suivi() || !fait('search')) h += suite('#p/fiche', 'Ma fiche de négociation');
      } else if (p.trouve === 'Non') h += suite('#recherches', 'Mes recherches');
      return h;
    }
    if (k === 'fiche') {
      const n = NEG.filter(([id]) => negFait(id)).length;
      let h = entete(k, n, NEG.length) + rappel('fiche') + question('recue', 'file-certificate', '#eeedfe', '#534AB7', 'J’ai ma fiche de négociation', ['Oui', 'Non'], 'fiche');
      if (L.fiche.recue === 'Non') h += `<div class="info"><i class="ti ti-hand-finger"></i>À demander au professeur principal ou à l’enseignant professionnel.</div>`;
      h += `<div class="qc ${n === NEG.length ? 'ok' : ''}">${NEG.map(([id, t]) => etape(id, t)).join('')}</div>`;
      return h + suite('#p/preconvention', 'Ma pré-convention');
    }
    if (k === 'preconvention') {
      const ids = ['pre_given', 'pre_filled', 'pre_return'], n = ids.filter(envoyeOuLocal).length;
      return entete(k, n, 3) + rappel('preconvention') + `<div class="qc">${etape('pre_given', 'J’ai reçu ma pré-convention')}${etape('pre_filled', 'L’entreprise l’a remplie, signée, avec le cachet')}${etape('pre_return', 'Je l’ai rendue à mon référent')}</div>` + suite('#p/convention', 'Ma convention');
    }
    if (k === 'convention') {
      const ids = ['conv_given', 'family', 'company', 'conv_return', 'copies'], n = ids.filter(envoyeOuLocal).length;
      return entete(k, n, 5) + rappel('convention') + `<div class="qc">${etape('conv_given', 'J’ai reçu ma convention à faire signer')}${etape('company', 'Signée par l’entreprise et le tuteur, avec le cachet')}${etape('family', 'Signée par moi, ou mon responsable légal si je suis mineur')}${etape('conv_return', 'Je l’ai rendue à mon référent')}${etape('copies', 'J’ai remis l’exemplaire signé à mes parents')}</div>` + infoVoit('pronote') + infoVoit('bde') + suite('#p/depart', 'Prêt à partir');
    }
    if (k === 'depart') {
      const D = L.depart, n = DEPART.filter(([c]) => D[c]).length, s = suivi();
      return entete(k, n, DEPART.length) + `<div class="qc ${n === DEPART.length ? 'ok' : ''}"><div class="etapes">${DEPART.map(([c, t]) => `<button class="et ${D[c] ? 'on' : ''}" data-depart="${c}"><span class="b"><i class="ti ti-check"></i></span>${esc(t)}</button>`).join('')}</div></div>` +
        infoVoit('arrival') + (s && s.visite && s.visite.le ? `<div class="info vert"><i class="ti ti-calendar-check"></i>Visite de votre référent : ${esc(s.visite.le)}</div>` : '') + suite('#', 'Mon suivi');
    }
    if (k === 'stage') {
      const s = suivi(), mp = en('midpoint');
      let h = entete(k) + `<div class="qc">${etape('here', 'Je suis arrivé dans mon entreprise')}</div>`;
      h += `<div class="qc"><div class="t"><span class="ic" style="background:#e6effa;color:#1d5fae"><i class="ti ti-mood-smile"></i></span>Comment se passe mon stage ?</div>${s ? (mp.e ? `<span class="chip ${mp.v === 'difficulte' ? 'att' : 'ok'}">${mp.v === 'difficulte' ? 'Difficulté signalée' : 'Tout va bien'}</span>` : `<div class="seg"><button data-agir="midpoint" data-action="declarer" data-v="ok"><i class="ti ti-mood-smile"></i> Ça va</button><button data-agir="midpoint" data-action="declarer" data-v="difficulte"><i class="ti ti-alert-circle"></i> J’ai une difficulté</button></div>`) : ''}</div>`;
      if (s && s.visite && s.visite.le) h += `<div class="info vert"><i class="ti ti-calendar-check"></i>Visite de votre référent : ${esc(s.visite.le)}</div>`;
      h += `<a class="lien" href="../carnet/index.html"><i class="ti ti-notebook"></i> Mon carnet de bord PFMP</a>`;
      return h + suite('#p/retour', 'Attestation et bilan');
    }
    if (k === 'retour') {
      const ids = ['attest_in', 'attestation', 'student_eval'], n = ids.filter(envoyeOuLocal).length;
      return entete(k, n, 3) + rappel('retour') + `<div class="qc">${etape('attest_in', 'L’entreprise m’a remis mon attestation')}${etape('attestation', 'Je l’ai rendue à mon référent')}${etape('student_eval', 'J’ai fait le bilan de mon stage')}</div><a class="lien" href="../carnet/index.html#/bilan"><i class="ti ti-notebook"></i> Mon bilan dans mon carnet de bord</a>`;
    }
    return '';
  }
  const envoyeOuLocal = id => suivi() ? envoye(id) : !!(L.locales || {})[id];

  /* ── Mes recherches ──────────────────────────────────────────────────── */
  const semaine = () => { L.prepa.semaine = L.prepa.semaine || { items: [], prochain: '' }; return L.prepa.semaine; };
  function blocSemaine() {
    const S = semaine(), I = S.items || [], n = I.filter(x => x.ok).length, pro = S.prochain || prochainMercredi();
    const libres = SUGG.filter(x => !I.some(i => i.t === x));
    return `<div class="qc semaine ${I.length && n === I.length ? 'ok' : ''}">
      <div class="t"><span class="ic" style="background:var(--p100);color:var(--p700)"><i class="ti ti-checklist"></i></span>Ma semaine${I.length ? `<span class="prog" style="background:var(--bg)">${n} / ${I.length}</span>` : ''}</div>
      <label class="prochain"><i class="ti ti-calendar-repeat"></i><span>Prochain point</span><input type="date" id="semProchain" data-semdate="1" value="${esc(pro)}"></label>
      ${I.length ? `<div class="etapes">${I.map(x => `<div class="et-l"><button class="et ${x.ok ? 'on' : ''}" data-sem="${x.id}"><span class="b"><i class="ti ti-check"></i></span>${esc(x.t)}</button><button class="x-mini" data-semx="${x.id}" aria-label="Retirer"><i class="ti ti-x"></i></button></div>`).join('')}</div>` : ''}
      <form class="ajout" id="formSem"><label class="sr" for="semTexte">Objectif</label><input type="text" id="semTexte" maxlength="80" placeholder="Ajouter un objectif"><button class="btn pri mini" aria-label="Ajouter"><i class="ti ti-plus"></i></button></form>
      ${libres.length && I.length < 3 ? `<div class="sugg">${libres.map(x => `<button data-sugg="${esc(x)}"><i class="ti ti-plus"></i>${esc(x)}</button>`).join('')}</div>` : ''}
      ${n && pro <= auj() ? `<button class="lien" data-act="nouvelleSemaine"><i class="ti ti-refresh"></i> Nouvelle semaine</button>` : ''}
    </div>`;
  }
  const ordreR = (a, b) => (dateR(a) + (heureR(a) || '')).localeCompare(dateR(b) + (heureR(b) || ''));
  const dateR = r => (r.statut === 'rappeler' ? r.rappelLe : r.statut === 'entretien' ? r.entretienLe : r.date) || '9';
  const heureR = r => r.statut === 'rappeler' ? r.rappelH : r.statut === 'entretien' ? r.entretienH : r.heure;
  function pageRecherches() {
    const R = L.recherches || [], t = auj();
    const n = s => R.filter(r => r.statut === s).length;
    let h = `<div class="ptitle"><span class="ic"><i class="ti ti-list-search"></i></span><span><h1>Mes démarches</h1></span><button class="prog imp" data-act="imprimer" aria-label="Imprimer ma fiche"><i class="ti ti-printer"></i></button></div>`;
    h += blocSemaine();
    h += `<div class="stats"><span class="chip gris">${R.length} démarche${R.length > 1 ? 's' : ''}</span><span class="chip att">${n('rappeler')} à rappeler</span><span class="chip bleu">${n('entretien')} entretien${n('entretien') > 1 ? 's' : ''}</span><span class="chip ok">${n('accord')} accord${n('accord') > 1 ? 's' : ''}</span></div>`;
    h += formR ? formulaireRecherche() : `<button class="btn pri plein" data-act="ajouterR" style="margin-top:4px"><i class="ti ti-plus"></i> Ajouter une démarche</button>`;
    const aFaire = R.filter(r => ['prevu', 'rappeler'].includes(r.statut)).sort(ordreR);
    const enCours = R.filter(r => ['attente', 'pasrep', 'entretien'].includes(r.statut)).sort(ordreR);
    const finies = R.filter(r => ['refus', 'accord', 'autre'].includes(r.statut));
    const groupe = (titre, l) => l.length ? `<div class="groupe">${titre}</div>` + l.map(r => carteRecherche(r, t)).join('') : '';
    h += groupe('À faire', aFaire) + groupe('En cours', enCours) + groupe('Réponses', finies);
    if (!R.length && !formR) h += `<div class="vide"><i class="ti ti-calendar-plus" style="font-size:34px"></i></div>`;
    return h;
  }
  function formulaireRecherche() {
    const r = formR === 'new' ? { moyen: 'appel', avec: 'Seul', date: auj() } : ((L.recherches || []).find(x => x.id === formR) || {});
    const segF = (k, opts, v) => `<div class="seg" style="margin-top:4px">${opts.map(([val, ic, l]) => `<button type="button" data-f="${k}" data-v="${esc(val)}" class="${v === val ? 'on' : ''}">${ic ? `<i class="ti ti-${ic}"></i>` : ''}${esc(l)}</button>`).join('')}</div>`;
    return `<form class="form-r" id="formR">
      <label class="champ">Entreprise<input type="text" id="rNom" maxlength="80" value="${esc(r.nom || '')}" placeholder="Nom de l’entreprise"></label>
      <label class="champ">Adresse<input type="text" id="rAdr" maxlength="120" value="${esc(r.adresse || '')}" placeholder="Rue, ville"></label>
      <label class="champ">Téléphone<input type="tel" id="rTel" maxlength="20" value="${esc(r.tel || '')}" placeholder="04 …"></label>
      <div class="champ">Comment${segF('moyen', Object.entries(MOYENS).map(([k, [ic, l]]) => [k, ic, l]), r.moyen || 'appel')}
        <input type="text" class="autre" id="rMoyenAutre" maxlength="60" placeholder="Précisez" value="${esc(r.moyenAutre || '')}" ${r.moyen === 'autre' ? '' : 'hidden'}></div>
      <div class="champ">Avec qui${segF('avec', AVEC.map(a => [a, '', a]), r.avec || 'Seul')}
        <input type="text" class="autre" id="rAvecAutre" maxlength="60" placeholder="Précisez" value="${esc(r.avecAutre || '')}" ${r.avec === 'Autre' ? '' : 'hidden'}></div>
      <div class="deux"><label class="champ">Quand<input type="date" id="rDate" value="${esc(r.date || '')}"></label><label class="champ">Heure<input type="time" id="rHeure" value="${esc(r.heure || '')}"></label></div>
      <input type="hidden" id="rMoyen" value="${esc(r.moyen || 'appel')}"><input type="hidden" id="rAvec" value="${esc(r.avec || 'Seul')}">
      <div style="display:flex;gap:8px"><button type="button" class="btn sec" data-act="annulerR" style="flex:1">Annuler</button><button class="btn pri" style="flex:2"><i class="ti ti-check"></i> Enregistrer</button></div></form>`;
  }
  function carteRecherche(r, t) {
    const [ic, lm] = MOYENS[r.moyen] || MOYENS.autre;
    const quand = r.date ? frLong(r.date) + (r.heure ? ' · ' + hh(r.heure) : '') : '';
    const avec = r.avec && r.avec !== 'Seul' ? (r.avec === 'Autre' ? r.avecAutre || 'Autre' : r.avec).toLowerCase() : '';
    const d = dateR(r), aDate = ['prevu', 'rappeler'].includes(r.statut) && d !== '9';
    const retard = aDate && d < t, ajd = aDate && d === t;
    const champDate = (k, kh, lbl) => `<div class="deux rdate"><label class="champ">${lbl}<input type="date" id="${k}-${r.id}" data-rd="${r.id}" data-k="${k}" value="${esc(r[k] || '')}"></label><label class="champ">Heure<input type="time" id="${kh}-${r.id}" data-rd="${r.id}" data-k="${kh}" value="${esc(r[kh] || '')}"></label></div>`;
    return `<div class="rech ${ajd ? 'auj' : ''} ${retard ? 'retard' : ''}">
      <div class="l1"><span class="moyen" title="${esc(lm)}"><i class="ti ti-${ic}"></i></span><span style="flex:1;min-width:0"><div class="nom">${esc(r.nom || 'Entreprise')}</div>
        <div class="quand">${esc(r.moyen === 'autre' && r.moyenAutre ? r.moyenAutre : lm)}${avec ? ' · avec ' + esc(avec) : ''}${quand ? ' · ' + esc(quand) : ''}${retard ? ' · <b style="color:var(--err)">en retard</b>' : ajd ? ' · <b style="color:var(--p700)">aujourd’hui</b>' : ''}</div></span>
        ${r.statut !== 'prevu' && REPONSES[r.statut] ? `<span class="chip ${REPONSES[r.statut][1]}">${esc(REPONSES[r.statut][0])}</span>` : ''}</div>
      ${r.adresse || r.tel ? `<div class="coord">${r.adresse ? `<a href="https://maps.apple.com/?q=${encodeURIComponent(r.adresse)}" target="_blank" rel="noopener"><i class="ti ti-map-pin"></i> ${esc(r.adresse)}</a>` : ''}${r.tel ? `<a href="tel:${esc(r.tel.replace(/\s/g, ''))}"><i class="ti ti-phone"></i> ${esc(r.tel)}</a>` : ''}</div>` : ''}
      ${r.statut === 'prevu' ? `<div class="actions"><button class="btn vert mini" data-rfait="${r.id}"><i class="ti ti-check"></i> ${esc(FAIT[r.moyen] || 'Fait')}</button></div>`
        : `<div class="res">${Object.entries(REPONSES).map(([k, [l]]) => `<button class="${r.statut === k ? 'on' : ''}" data-rrep="${r.id}" data-v="${k}">${r.statut === k ? '<i class="ti ti-check"></i>' : ''}${l}</button>`).join('')}</div>`}
      ${r.statut === 'accord' ? blocTrouve(r) : ''}
      ${r.statut === 'rappeler' ? champDate('rappelLe', 'rappelH', 'Rappeler le') : ''}
      ${r.statut === 'entretien' ? champDate('entretienLe', 'entretienH', 'Entretien le') : ''}
      ${r.statut === 'autre' ? `<input type="text" class="autre" id="rAutre-${r.id}" data-rautre="${r.id}" maxlength="80" placeholder="Précisez" value="${esc(r.autre || '')}">` : ''}
      ${r.statut !== 'prevu' ? `<textarea class="note" id="rNote-${r.id}" data-rnote="${r.id}" maxlength="300" rows="2" placeholder="Ce qui a été dit">${esc(r.note || '')}</textarea>` : ''}
      <div class="actions bas">${confirmeRetrait === r.id ? `<span style="font-size:14px">Retirer cette démarche ?</span><button class="btn mini sec" data-act="garderR">Garder</button><button class="btn mini" style="background:var(--err);color:#fff" data-rretirer="${r.id}">Retirer</button>` : `<button class="lien" data-rmodif="${r.id}"><i class="ti ti-pencil"></i> Modifier</button><button class="lien" style="color:var(--muted)" data-rconf="${r.id}"><i class="ti ti-trash"></i> Retirer</button>`}</div>
    </div>`;
  }

  /* Une démarche acceptée → « C'est mon stage » → les mêmes questions que dans Préparation → le référent valide. */
  function questionsTrouve() {
    const p = L.prepa;
    return `<div class="sous">
      <div><div class="t">C’est sûr à 100 % ?</div>${seg('prepa', 'sur', ['Oui', 'Pas encore'], p.sur)}</div>
      <div><div class="t">J’ai rencontré le tuteur</div>${seg('prepa', 'tuteurVu', ['Oui', 'Non'], p.tuteurVu)}</div>
      <div><div class="t">J’ai un écrit de l’entreprise</div>${seg('prepa', 'ecrit', ['Oui', 'Non'], p.ecrit)}</div>
      <div><div class="t">Type de structure</div>${seg('prepa', 'structure', STRUCTURES, p.structure)}${p.structure === 'Autre' ? champAutre('prepa', 'structureAutre', p.structureAutre) : ''}</div></div>`;
  }
  function etatReferent() {
    if (!suivi()) return '';
    if (en('search').e) return `<div style="margin-top:12px">${etape('search', 'Mon référent valide mon stage')}</div>${fait('search') ? suite('#p/fiche', 'Ma fiche de négociation') : ''}`;
    return `<button class="btn vert plein" data-act="trouve"><i class="ti ti-flag"></i> Prévenir mon référent</button>`;
  }
  function blocTrouve(r) {
    const p = L.prepa;
    if (p.trouveR !== r.id) return p.trouve === 'Oui' && p.trouveR ? '' : `<button class="btn vert plein mon-stage" data-rtrouve="${r.id}"><i class="ti ti-flag-check"></i> C’est mon stage</button>`;
    return `<div class="trouve-ici"><div class="tt"><i class="ti ti-flag-check"></i> Mon stage${en('search').e ? '' : `<button class="lien" data-rpasici="${r.id}">Ce n’est plus mon stage</button>`}</div>${questionsTrouve()}${etatReferent()}</div>`;
  }

  /* ── Ma fiche imprimée (A4 paysage, aucun nom) ───────────────────────── */
  function fiche() {
    const per = periode(), R = (L.recherches || []).slice().sort((a, b) => ((a.date || '9') + (a.heure || '')).localeCompare((b.date || '9') + (b.heure || ''))), S = semaine();
    const D = L.declaration, dom = D.domaine === 'Autre' ? D.domaineAutre : D.domaine, t = auj();
    const j = per.debut && per.debut > t ? Math.round((new Date(per.debut + 'T12:00:00') - new Date(t + 'T12:00:00')) / 864e5) : null;
    const c = (on, l, suite) => `<div><i class="case ${on ? 'x' : ''}"></i>${l}${suite !== undefined ? `<span class="tir">${suite ? esc(suite) : ''}</span>` : ''}</div>`;
    const lignes = n => '<div class="dit">' + '<i></i>'.repeat(n) + '</div>';
    const ligne = (r, i) => {
      if (!r) return `<tr class="vide"><td class="num">${i}</td><td>${lignes(3)}</td><td><div class="res1">${c(0, 'Appel')}${c(0, 'Sur place')}${c(0, 'Mail')}</div></td><td>${lignes(1)}</td>
        <td><div class="res2">${c(0, 'Fait')}${c(0, 'Pas de réponse')}${c(0, 'Rappeler le', '')}${c(0, 'Entretien le', '')}${c(0, 'Refus')}${c(0, 'Accord')}</div></td><td>${lignes(3)}</td></tr>`;
      const st = r.statut, avec = r.avec === 'Autre' ? r.avecAutre : r.avec;
      const jm = (d, h) => d.slice(8, 10) + '/' + d.slice(5, 7) + (h ? ' ' + h.replace(/^0/, '').replace(':', 'h') : '');
      const quandRap = st === 'rappeler' && r.rappelLe ? jm(r.rappelLe, r.rappelH) : '';
      const quandEnt = st === 'entretien' && r.entretienLe ? jm(r.entretienLe, r.entretienH) : '';
      const dit = [st === 'autre' ? r.autre : '', r.note].filter(Boolean).join(' · ');
      return `<tr><td class="num">${i}</td>
        <td class="ent"><b>${esc(r.nom || 'Entreprise')}</b>${r.adresse ? `<div class="adr">${esc(r.adresse)}</div>` : ''}${r.tel ? `<div class="tel">☎ ${esc(r.tel)}</div>` : ''}</td>
        <td><span class="pastille">${esc(r.moyen === 'autre' && r.moyenAutre ? r.moyenAutre : (MOYENS[r.moyen] || MOYENS.autre)[1])}</span>${avec ? `<span class="pastille gris">${esc(avec)}</span>` : ''}</td>
        <td class="quand"><b>${r.date ? esc(frCourt(r.date)) : '—'}</b><small>${r.heure ? esc(hh(r.heure)) : ''}</small></td>
        <td><div class="res2">${c(st !== 'prevu', FAIT[r.moyen] || 'Fait')}${c(st === 'pasrep', 'Pas de réponse')}${c(st === 'rappeler', 'Rappeler le', quandRap)}${c(st === 'entretien', 'Entretien le', quandEnt)}${c(st === 'refus', 'Refus')}${c(st === 'accord', 'Accord')}</div></td>
        <td>${dit ? `<div class="dit-t">${esc(dit)}</div>${lignes(1)}` : lignes(3)}</td></tr>`;
    };
    const rows = R.map((r, i) => ligne(r, i + 1)); for (let i = R.length; i < Math.max(R.length + 1, 4); i++) rows.push(ligne(null, i + 1));
    const nb = s => R.filter(r => r.statut === s).length, I = S.items || [];
    return `<div class="feuille">
      <div class="f-tete"><div class="f-titre"><div class="sur">Stage PFMP · Mes recherches</div><h1>Carnet de démarches</h1>
        <div class="infos"><span>${esc(D.pfmp || 'PFMP')}</span>${per.debut ? `<span>Du <b>${esc(frCourt(per.debut))}</b> au <b>${esc(frCourt(per.fin))}</b></span>` : ''}${dom ? `<span>Domaine <b>${esc(dom)}</b></span>` : ''}${per.dernierJour ? `<span>Dernier jour de cours <b>${esc(frCourt(per.dernierJour))}</b></span>` : ''}</div></div>
        <div>${j != null ? `<div class="f-compte"><div class="n">J-${j}</div><div class="l">avant le départ</div></div>` : ''}<div class="f-code">Code ${esc(code)} · imprimé le ${new Date().toLocaleDateString('fr-FR')}</div></div></div>
      <table><colgroup><col style="width:7mm"><col style="width:56mm"><col style="width:38mm"><col style="width:25mm"><col style="width:80mm"><col></colgroup>
        <thead><tr><th>N°</th><th>Entreprise</th><th>Comment · avec qui</th><th>Prévu le</th><th>Résultat</th><th>Ce qui a été dit · suite</th></tr></thead><tbody>${rows.join('')}</tbody></table>
      <div class="f-bas"><div class="f-bloc"><h2>Ma semaine</h2><div class="liste">${I.map(x => c(x.ok, esc(x.t))).join('')}${c(0, '', '')}${c(0, '', '')}</div></div>
        <div class="f-bloc"><h2>Prochain point</h2><div class="f-date">${esc(frLong(S.prochain || prochainMercredi()))}</div>
          <div class="bilan"><span><b>${R.length}</b>démarches</span><span><b>${nb('rappeler')}</b>à rappeler</span><span><b>${nb('entretien')}</b>entretiens</span><span><b>${nb('accord')}</b>accords</span></div></div></div>
      <div class="f-pied">mapse.fr › Mon espace › PFMP AGOrA › Mon suivi de PFMP</div></div>`;
  }
  function imprimer() { $('impression').innerHTML = fiche(); setTimeout(() => window.print(), 50); }

  /* ── Messages ────────────────────────────────────────────────────────── */
  /* ── Gestes ──────────────────────────────────────────────────────────── */
  document.addEventListener('click', ev => {
    if (ev.target.closest('#tiroir [data-act="fermer"]')) { volet = ''; attente = null; fen6 = null; rendreVolet(); return; }
    { const t6 = ev.target.closest('#tiroir [data-v6c],#tiroir [data-v6r],#tiroir [data-v6a]'); if (t6) { voletClic6(t6.dataset); return; } }
    if (ev.target.closest('#tiroir [data-act="oui"]') && attente) {
      const a = attente; attente = null; volet = ''; rendreVolet();
      const faux = document.createElement('button'); faux.dataset.ok = '1';
      if (a.trouve) faux.dataset.act = 'trouve'; else { faux.dataset.agir = a.id; faux.dataset.action = a.action; if (a.v) faux.dataset.v = a.v; }
      $('app').appendChild(faux); faux.click(); faux.remove(); return;
    }
    const b = ev.target.closest('button,[data-act]'); if (!b || !$('app').contains(b)) { if (plus && !ev.target.closest('.plus')) { plus = false; rendre(); } return; }
    const d = b.dataset;
    if (d.act === 'plus') { plus = !plus; rendre(); return; }
    if (d.v6) { clic6(d); return; }
    if (d.v6q) { qouv6 = qouv6 === d.v6q ? '' : d.v6q; if ($('aideRes')) $('aideRes').innerHTML = resAide6(); else rendre(); return; }
    if (plus && !b.closest('.plus')) { plus = false; }
    if (d.act === 'toutEnregistrer') {
      if (formulaireRempli()) $('formR').requestSubmit();
      try { localStorage.setItem(cleLocale(), JSON.stringify(L)); } catch (e) {}
      if (fs && suivi()) { aEnvoyer = true; envoyerParcours(); if (svc) envoyerPistes(); }
      else if (fs && connu[numero()] && !suivi()) creerSuivi(numero());
      else { majSync('local'); toast('Enregistré sur cet appareil.'); }
      return;
    }
    if (d.act === 'agenda' || d.act === 'qr') { plus = false; volet = d.act; rendre(); rendreVolet(); return; }
    if (d.act === 'imprimer') { plus = false; rendre(); imprimer(); return; }
    if (d.sem) { const x = (semaine().items || []).find(y => y.id === d.sem); if (x) { x.ok = !x.ok; sauver(); rendre(); } return; }
    if (d.semx) { semaine().items = semaine().items.filter(y => y.id !== d.semx); sauver(); rendre(); return; }
    if (d.sugg) { ajouterObjectif(d.sugg); return; }
    if (d.act === 'nouvelleSemaine') { const S = semaine(); S.items = S.items.filter(y => !y.ok); S.prochain = prochainMercredi(); sauver(); rendre(); return; }
    if (d.act === 'changer') { try { localStorage.removeItem('codeEleve'); } catch (e) {} location.hash = ''; location.reload(); return; }
    if (d.avatar != null) { L.avatar = +d.avatar; sauver(); rendre(); return; }
    if (d.seg === 'declaration' && d.cle === 'pfmp') { if (changerPeriode(d.v)) { prerempliDates(); ecouterParcours(); rendre(); } return; }
    if (d.seg) { L[d.seg] = L[d.seg] || {}; L[d.seg][d.cle] = L[d.seg][d.cle] === d.v ? '' : d.v; sauver(); rendre(); return; }
    if (d.act === 'enregistrer') { lireDates(); if (!L.declaration.pfmp) L.declaration.pfmp = 'PFMP 1'; sauver(); if (connu[numero()] && !suivi()) creerSuivi(numero()); location.hash = '#'; return; }
    if (d.act === 'trouve' && !d.ok) { attente = { trouve: 1, t: 'J’ai trouvé mon stage' }; volet = 'confirme'; rendreVolet(); return; }
    if (d.act === 'trouve') {
      if (!svc || !suivi()) { toast('Enregistré sur cet appareil.'); return; }
      const st = L.prepa.structure === 'Autre' ? (L.prepa.structureAutre || 'Autre') : (L.prepa.structure || 'Entreprise');
      const dom = L.declaration.domaine === 'Autre' ? L.declaration.domaineAutre : L.declaration.domaine;
      b.disabled = true; svc.declarerTrouve(sid(), { structure: st, secteur: dom || '' }).then(() => toast('Envoyé à votre référent.')).catch(e => { toast(e.message); b.disabled = false; });
      return;
    }
    if (d.agir && !d.ok) { if (!svc || !suivi()) return; const et = P.PAR_ID[d.agir]; attente = { id: d.agir, action: d.action, v: d.v, t: d.action === 'annuler' ? 'Annuler : ' + (et.te || et.t) : d.action === 'perdre' ? 'J’ai perdu : ' + minus(et.garde) : d.action === 'retrouver' ? 'J’ai retrouvé : ' + minus(et.garde) : et.garde && d.dejaG ? 'J’ai déjà : ' + minus(et.garde) : (et.te || et.t) }; volet = 'confirme'; rendreVolet(); return; }
    if (d.agir) { if (!svc || !suivi()) return; b.disabled = true; svc.agir(sid(), d.agir, d.action, 'eleve', d.v ? { v: d.v } : undefined).then(() => toast(d.action === 'perdre' ? 'Votre référent et votre professeur principal sont prévenus.' : d.agir === 'midpoint' && d.v === 'difficulte' ? 'Votre référent est prévenu.' : 'Envoyé à votre référent.')).catch(e => { toast(e.message); b.disabled = false; }); return; }
    if (d.locale) { L.locales = L.locales || {}; L.locales[d.locale] = !L.locales[d.locale]; sauver(); rendre(); return; }
    if (d.depart) { L.depart[d.depart] = !L.depart[d.depart]; sauver(); rendre(); return; }
    if (d.act === 'ajouterR') { formR = 'new'; rendre(); setTimeout(() => $('rNom') && $('rNom').focus(), 0); return; }
    if (d.act === 'annulerR') { formR = null; rendre(); return; }
    if (d.f) {
      const k = d.f === 'moyen' ? 'Moyen' : 'Avec';
      $('r' + k).value = d.v; b.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      $('r' + k + 'Autre').hidden = d.v.toLowerCase() !== 'autre'; if (!$('r' + k + 'Autre').hidden) $('r' + k + 'Autre').focus();
      return;
    }
    if (d.rmodif) { formR = d.rmodif; rendre(); return; }
    if (d.rconf) { confirmeRetrait = d.rconf; rendre(); return; }
    if (d.act === 'garderR') { confirmeRetrait = ''; rendre(); return; }
    if (d.rtrouve) { Object.assign(L.prepa, { trouve: 'Oui', trouveR: d.rtrouve }); sauver(); rendre(); return; }
    if (d.rpasici) { if (L.prepa.trouveR === d.rpasici) { L.prepa.trouveR = ''; L.prepa.trouve = ''; } sauver(); rendre(); return; }
    if (d.rretirer) { L.recherches = L.recherches.filter(r => r.id !== d.rretirer); confirmeRetrait = ''; sauver(true); rendre(); return; }
    if (d.rfait) { majR(d.rfait, { statut: 'attente', faitLe: new Date().toISOString() }); return; }
    if (d.rrep) {
      const r = L.recherches.find(y => y.id === d.rrep), patch = { statut: d.v };
      if (d.v === 'rappeler' && r && !r.rappelLe) patch.rappelLe = plusJ(auj(), 1);
      majR(d.rrep, patch);
      if (d.v === 'entretien' && r && !r.entretienLe) setTimeout(() => { const x = $('entretienLe-' + r.id); if (x) x.focus(); }, 0);
      return;
    }
  });
  document.addEventListener('input', ev => {
    const x = ev.target, d = x.dataset;
    if (x.id === 'aideR') { rech6 = x.value; qouv6 = ''; $('aideRes').innerHTML = resAide6(); }
    else if (d.autre) { L[d.autre][d.cle] = x.value; sauver(); }
    else if (d.rnote) { const r = L.recherches.find(y => y.id === d.rnote); if (r) { r.note = x.value; sauver(); } }
    else if (d.rautre) { const r = L.recherches.find(y => y.id === d.rautre); if (r) { r.autre = x.value; sauver(); } }
  });
  document.addEventListener('change', ev => {
    const x = ev.target, d = x.dataset;
    if (d.date) { lireDates(); sauver(); rendre(); }
    else if (d.rd) { const r = L.recherches.find(y => y.id === d.rd); if (r) { r[d.k] = x.value; sauver(true); rendre(); } }
    else if (d.semdate) { semaine().prochain = x.value; sauver(); rendre(); }
  });
  /* Avant de fermer : ce qui attend part tout de suite ; le navigateur prévient si une démarche n'est pas enregistrée. */
  const formulaireRempli = () => !!(formR && ['rNom', 'rAdr', 'rTel'].some(k => $(k) && $(k).value.trim()));
  function envoyerMaintenant() { if (aEnvoyer && fs && suivi()) envoyerParcours(); }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') envoyerMaintenant(); });
  window.addEventListener('beforeunload', ev => {
    envoyerMaintenant();
    if (formulaireRempli() || (fs && suivi() && (aEnvoyer || enCours))) { ev.preventDefault(); ev.returnValue = ''; }
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && volet) { volet = ''; rendreVolet(); } });
  function ajouterObjectif(texte) {
    const S = semaine(); texte = String(texte || '').trim().slice(0, 80); if (!texte) return;
    S.items = (S.items || []).concat([{ id: 's' + Date.now().toString(36), t: texte, ok: false }]).slice(0, 12);
    if (!S.prochain) S.prochain = prochainMercredi();
    sauver(); rendre();
  }
  document.addEventListener('submit', ev => {
    const f = ev.target;
    if (f.id === 'formR') {
      ev.preventDefault();
      const nom = $('rNom').value.trim();
      if (!nom) { $('rNom').focus(); return; }
      const o = { nom, adresse: $('rAdr').value.trim(), tel: $('rTel').value.trim(), moyen: $('rMoyen').value, moyenAutre: $('rMoyenAutre').value.trim(),
        avec: $('rAvec').value, avecAutre: $('rAvecAutre').value.trim(), date: $('rDate').value, heure: $('rHeure').value };
      if (formR === 'new') L.recherches = (L.recherches || []).concat([Object.assign({ id: 'r' + Date.now().toString(36), statut: 'prevu' }, o)]);
      else { const r = L.recherches.find(y => y.id === formR); if (r) Object.assign(r, o); }
      formR = null; sauver(true); rendre();
    } else if (f.id === 'formSem') {
      ev.preventDefault(); const x = $('semTexte'), v = x.value; x.value = ''; ajouterObjectif(v); setTimeout(() => $('semTexte') && $('semTexte').focus(), 0);
    }
  });
  function majR(id, patch) { const r = L.recherches.find(y => y.id === id); if (!r) return; Object.assign(r, patch); sauver(true); rendre(); }
  function lireDates() { const a = $('debut'), b = $('fin'); if (a) L.declaration.debut = a.value; if (b) L.declaration.fin = b.value; }
  function prerempliDates() { const s = suivi(); if (s && !L.declaration.debut) { L.declaration.debut = s.debut || ''; L.declaration.fin = s.fin || ''; } }
  window.addEventListener('hashchange', () => { plus = false; formR = null; confirmeRetrait = ''; volet = ''; fen6 = null; rech6 = ''; qouv6 = ''; rendreVolet(); rendre(); });

  function demarrer(c) {
    code = c; charger(); rendre(); brancher();
  }
  /* Arrivée par le QR code de l'ordinateur : ?c=CODE ouvre directement la page sur le téléphone. */
  const cUrl = (new URLSearchParams(location.search).get('c') || '').trim().toUpperCase();
  if (/^[A-Z0-9]{4,6}$/.test(cUrl)) { try { localStorage.setItem('codeEleve', cUrl); localStorage.setItem('userCode', cUrl); } catch (e) {} history.replaceState(null, '', location.pathname + location.hash); }
  let c0 = cUrl; try { c0 = c0 || (localStorage.getItem('codeEleve') || '').trim().toUpperCase(); } catch (e) {}
  if (/^[A-Z0-9]{4,6}$/.test(c0)) demarrer(c0); else ecranCode();
})();
