/* ═══════════════════════════════════════════════════════════════════════════
   MON STAGE PFMP — le parcours de l'élève (mapse.fr › Mon espace › PFMP AGOrA)
   Écrans (chacun est une entrée d'historique) :
     #              accueil : « Déclarer un stage », puis compte à rebours, frise, phase en cours
     #declarer      avatar, PFMP 1 ou 2, dates, domaine (toujours modifiable)
     #p/<phase>     preparation · fiche · preconvention · convention · depart · stage · retour
     #recherches    l'agenda des recherches (entreprise, téléphone, quand, comment, réponse)
     #messages      le fil avec l'enseignant référent
   Rien ne bloque : toutes les pages restent ouvertes. Chaque choix « Autre » ouvre un champ libre.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const P = window.PFMP_COMMUN;
  const CFG = { apiKey: 'AIzaSyBj_GXG8ln3GAxNXxiJkT2HPSWIHJpc1lA', authDomain: 'coordination-pedagogie.firebaseapp.com', projectId: 'coordination-pedagogie', storageBucket: 'coordination-pedagogie.firebasestorage.app', messagingSenderId: '526058585010', appId: '1:526058585010:web:ba4dd6d9c8281ba5bf02ab' };
  const ANNEE = P.anneeScolaire();
  const AVATARS = [['cat', '#D85A30'], ['dog', '#BA7517'], ['butterfly', '#D4537E'], ['fish', '#378ADD'], ['plant-2', '#639922'], ['rocket', '#534AB7'], ['feather', '#1D9E75'], ['planet', '#7F77DD'], ['bike', '#185FA5'], ['music', '#993556'], ['star', '#EF9F27'], ['paw', '#854F0B'], ['ball-football', '#3B6D11'], ['palette', '#A32D2D'], ['camera', '#5F5E5A'], ['bolt', '#C2410C'], ['leaf', '#0F6E56'], ['moon', '#3C3489']];
  const HUMEURS = [['mood-happy', 'Super'], ['mood-smile', 'Bien'], ['mood-neutral', 'Bof'], ['mood-sad', 'Pas bien'], ['mood-nervous', 'Stressé'], ['dots', 'Autre']];
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
  const FICHE = [['remise', 'Je l’ai remise à mon tuteur'], ['coche', 'Le tuteur a coché 2 ou 3 activités'], ['tampon', 'L’entreprise l’a signée et tamponnée'], ['referent', 'Le professeur référent l’a signée'], ['famille', 'Je l’ai signée, ou mon responsable légal'], ['valide', 'Mon enseignant professionnel l’a validée']];
  const FICHE_A = { remise: 'Remettre la fiche de négociation au tuteur', coche: 'Faire cocher 2 ou 3 activités par le tuteur', tampon: 'Faire signer et tamponner la fiche par l’entreprise', referent: 'Faire signer la fiche par le professeur référent', famille: 'Signer la fiche, ou la faire signer par mon responsable légal', valide: 'Faire valider la fiche par l’enseignant professionnel' };
  const DEPART_A = { adresse: 'Noter l’adresse du lieu de stage', horaires: 'Connaître mes horaires', tuteur: 'Noter le nom de mon tuteur', tel: 'Noter le numéro de l’entreprise', trajet: 'Repérer mon trajet' };
  const DEPART = [['adresse', 'Je connais l’adresse du lieu de stage'], ['horaires', 'Je connais mes horaires'], ['tuteur', 'Je connais le nom de mon tuteur'], ['tel', 'J’ai le numéro de l’entreprise'], ['trajet', 'J’ai repéré mon trajet'], ['absence', 'Absent ou en retard : je préviens l’entreprise et la vie scolaire']];

  /* Rappels « C'est quoi ? » : une phrase, puis les étapes en quelques mots (procédure, check-list, convention). */
  const RAPPELS = {
    fiche: ['Le document où l’entreprise indique les activités qu’elle vous confiera.', ['À demander au professeur principal ou à l’enseignant professionnel', 'À remettre à votre tuteur', 'Le tuteur coche 2 ou 3 activités (colonne a)', 'Signature et cachet de l’entreprise', 'Signatures du professeur référent, et de vous ou de votre responsable légal', 'Validation par votre enseignant professionnel'], 'Ensuite : la pré-convention'],
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
  const cleLocale = () => 'pfmp-stage-v1:' + code;
  function charger() { try { L = Object.assign(vierge(), JSON.parse(localStorage.getItem(cleLocale()) || '{}')); } catch (e) { L = vierge(); } }
  let minuteurEnvoi = null, minuteurPistes = null;
  function sauver(pistes) {
    L.majLe = new Date().toISOString();
    try { localStorage.setItem(cleLocale(), JSON.stringify(L)); } catch (e) {}
    clearTimeout(minuteurEnvoi); minuteurEnvoi = setTimeout(envoyerParcours, 1200);
    if (pistes) { clearTimeout(minuteurPistes); minuteurPistes = setTimeout(envoyerPistes, 1500); }
  }
  const numero = () => L.declaration.pfmp === 'PFMP 2' ? 2 : 1;
  const sid = () => { try { return P.suiviId(ANNEE, code, numero()); } catch (e) { return ''; } };
  const suivi = () => suivis[numero()] || null;
  const declare = () => !!(L.declaration.pfmp && L.declaration.debut);
  function periode() {
    const s = suivi() || {};
    const debut = L.declaration.debut || s.debut || '', fin = L.declaration.fin || s.fin || '';
    let dernierJour = s.debut === debut ? s.dernierJour || '' : '';
    if (!dernierJour && debut) dernierJour = P.dernierJourDeCours(debut, [], []);
    return { debut, fin, dernierJour };
  }
  const CHAMPS = ['avatar', 'declaration', 'prepa', 'fiche', 'depart', 'recherches', 'majLe'];
  let etatSync = 'envoi';
  const ICONES_SYNC = { ok: ['cloud-check', 'Enregistré'], envoi: ['cloud-up', 'Enregistrement…'], local: ['cloud-off', 'Sur cet appareil'], erreur: ['cloud-x', 'Non enregistré'] };
  const iconeSync = () => `<i class="ti ti-${ICONES_SYNC[etatSync][0]}"></i>`;
  function majSync(e) { etatSync = e; const x = $('sync'); if (x) { x.className = 'sync ' + e; x.title = ICONES_SYNC[e][1]; x.innerHTML = iconeSync(); } }
  function envoyerParcours() {
    if (!fs || !suivi()) { majSync('local'); return; }
    const d = {}; CHAMPS.forEach(k => { d[k] = L[k]; });
    d.recherches = (L.recherches || []).slice(0, 80);
    majSync('envoi');
    fs.doc('coordination_pfmp_suivi/' + sid() + '/eleve/parcours').set(JSON.parse(JSON.stringify(d))).then(() => majSync('ok')).catch(() => majSync('erreur'));
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
    const pistes = (L.recherches || []).slice(0, 40).map(r => ({ id: r.id, structure: r.nom || 'Entreprise', secteur: '', moyen: MOYENS[r.moyen] ? r.moyen : 'autre', date: r.date || '', reponse: conv[r.statut] || 'attente' }));
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
      if (d && String(d.majLe || '') > String(L.majLe || '')) { CHAMPS.forEach(k => { if (d[k] !== undefined) L[k] = d[k]; }); try { localStorage.setItem(cleLocale(), JSON.stringify(L)); } catch (e) {} majSync('ok'); rendre(); }
      else if (!d || String(d.majLe || '') < String(L.majLe || '')) envoyerParcours();
      else majSync('ok');
    }, () => {});
    arretParcours.chemin = chemin;
  }
  function ecouterMessages() {
    if (!svc || !suivi()) return;
    if (arretMsgs && arretMsgs.pour === sid()) return;
    if (arretMsgs) arretMsgs();
    arretMsgs = svc.ecouterMessages(sid(), l => { msgs = l; if (location.hash === '#messages') rendreFil(); majBadge(); }, () => {});
    arretMsgs.pour = sid();
  }
  const nonLus = () => { let vu = ''; try { vu = localStorage.getItem(cleLocale() + ':vu') || ''; } catch (e) {} return msgs.filter(m => m.de !== 'eleve' && String(m.le) > vu).length; };
  function majBadge() { const b = $('badgeMsg'); if (b) { const n = nonLus(); b.hidden = !n; b.textContent = n; } }

  /* ── États des étapes ────────────────────────────────────────────────── */
  const en = id => P.entree(suivi(), id);
  const fait = id => ['valide', 'fait'].includes(en(id).e);
  const envoye = id => ['valide', 'fait', 'remis', 'declare'].includes(en(id).e);
  const ficheOk = () => !!(L.fiche.etapes && L.fiche.etapes.valide);
  const prepaOk = () => !!(L.prepa.cv && L.prepa.lettre && L.prepa.trouve);
  function noeuds() {
    const per = periode(), s = suivi() || {};
    const ec = id => { const e = P.echeance(P.PAR_ID[id], per); return e ? fr(e.date) : ''; };
    const t = auj();
    return [
      { n: 'Préparation', d: '', ok: prepaOk(), lien: '#p/preparation' },
      { n: 'Recherche', d: '', ok: L.prepa.trouve === 'Oui' || envoye('search'), lien: '#recherches' },
      { n: 'Fiche de négociation', d: ec('search'), ok: ficheOk(), lien: '#p/fiche' },
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
    if (nonLus()) return { ic: 'message', t: 'Nouveau message', lien: '#messages', fort: 1 };
    const sem = L.prepa.semaine;
    if (sem && sem.prochain && sem.prochain <= t && (sem.items || []).length) return { ic: 'checklist', t: 'Point sur ma semaine', lien: '#recherches' };
    const { courante } = phaseEnCours(), p = L.prepa;
    if (p.trouve === 'Oui' && suivi() && !en('search').e) return { ic: 'flag', t: 'Prévenir mon référent : j’ai trouvé mon stage', lien: p.trouveR ? '#recherches' : '#p/preparation', fort: 1 };
    if (en('search').e === 'corriger') return { ic: 'alert-circle', t: 'Mon référent demande une correction', lien: p.trouveR ? '#recherches' : '#p/preparation', fort: 1 };
    if (courante === 'preparation') {
      if (p.cv !== 'À jour') return { ic: 'file-cv', t: 'Finir mon CV', lien: '#p/preparation' };
      if (p.lettre !== 'Prête') return { ic: 'mail', t: 'Finir ma lettre de motivation', lien: '#p/preparation' };
      return { ic: 'list-search', t: R.length ? 'Prévoir ma prochaine démarche' : 'Prévoir mes premières démarches', lien: '#recherches' };
    }
    if (courante === 'recherches') {
      if (!R.some(r => r.statut === 'prevu' && (!r.date || r.date >= t))) return { ic: 'list-search', t: R.length ? 'Prévoir ma prochaine démarche' : 'Prévoir mes premières démarches', lien: '#recherches' };
      return null;
    }
    if (courante === 'fiche') {
      if (L.fiche.recue !== 'Oui') return { ic: 'hand-finger', t: 'Récupérer la fiche de négociation auprès du professeur' + avant('search'), lien: '#p/fiche' };
      const k = FICHE.find(([c]) => !(L.fiche.etapes || {})[c]);
      return k ? { ic: 'list-check', t: FICHE_A[k[0]] + avant('search'), lien: '#p/fiche' } : null;
    }
    if (courante === 'preconvention') {
      if (!envoyeOuLocal('pre_given')) return { ic: 'file-text', t: 'Demander la pré-convention au référent', lien: '#p/preconvention' };
      if (!envoyeOuLocal('pre_filled')) return { ic: 'file-text', t: 'Faire remplir la pré-convention par l’entreprise' + avant('pre_return'), lien: '#p/preconvention' };
      return { ic: 'file-text', t: 'Rendre la pré-convention au référent' + avant('pre_return'), lien: '#p/preconvention' };
    }
    if (courante === 'convention') {
      if (!envoyeOuLocal('company') || !envoyeOuLocal('family')) return { ic: 'signature', t: 'Faire signer la convention' + avant('conv_return'), lien: '#p/convention' };
      return { ic: 'signature', t: 'Rendre la convention au référent' + avant('conv_return'), lien: '#p/convention' };
    }
    if (courante === 'depart') { const k = DEPART.find(([c]) => !L.depart[c] && DEPART_A[c]); return k ? { ic: 'backpack', t: DEPART_A[k[0]], lien: '#p/depart' } : null; }
    if (courante === 'retour') return { ic: 'trophy', t: envoyeOuLocal('attestation') ? 'Faire le bilan de mon stage' : 'Rendre mon attestation au référent' + avant('attestation'), lien: '#p/retour' };
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
    [['search', 'Fiche de négociation', '#p/fiche', ficheOk()], ['pre_return', 'Rendre la pré-convention', '#p/preconvention', envoye('pre_return')], ['conv_return', 'Rendre la convention', '#p/convention', envoye('conv_return')],
      ['attestation', 'Rendre l’attestation', '#p/retour', envoye('attestation')], ['student_eval', 'Bilan du stage', '#p/retour', envoye('student_eval')]].forEach(([id, n, lien, ok]) => {
      const e = P.echeance(P.PAR_ID[id], per); if (e && e.date && !ok) l.push({ d: e.date, ic: 'flag', t: n, lien, act: 1 });
    });
    if (per.dernierJour) l.push({ d: per.dernierJour, ic: 'school', t: 'Dernier jour de cours', lien: '#' });
    if (per.debut) l.push({ d: per.debut, ic: 'building', t: 'Début du stage', lien: '#p/stage', fort: 1 });
    if (per.fin) l.push({ d: per.fin, ic: 'trophy', t: 'Fin du stage', lien: '#p/retour' });
    if (s.visite && /^\d{4}-\d{2}-\d{2}/.test(s.visite.le || '')) l.push({ d: s.visite.le.slice(0, 10), h: (s.visite.le.match(/T(\d\d:\d\d)/) || [])[1], ic: 'calendar-check', t: 'Visite du référent', lien: '#p/stage' });
    return l.filter(x => x.d >= t || x.act).sort((a, b) => (a.d + (a.h || '')).localeCompare(b.d + (b.h || '')));
  }
  const nbAgenda = () => { const t = auj(); return agenda().filter(x => x.d <= t).length; };
  let volet = '';
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
    } else if (volet === 'qr') {
      const url = location.origin + location.pathname + '?c=' + encodeURIComponent(code);
      c = `<div class="vt"><i class="ti ti-device-mobile"></i><h2>Sur mon téléphone</h2><button class="rond-btn" data-act="fermer" aria-label="Fermer"><i class="ti ti-x"></i></button></div>
        <div class="qr-img" id="qr"></div><div class="qr-code">${esc(code)}</div>`;
      setTimeout(() => dessinerQR(url), 0);
    }
    v.innerHTML = `<div class="tiroir-fond" data-act="fermer"></div><aside class="tiroir ${volet}" role="dialog" aria-modal="true">${c}</aside>`;
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
    else if (h.startsWith('#p/')) corps = pagePhase(h.slice(3));
    else if (h === '#recherches') corps = pageRecherches();
    else if (h === '#messages') corps = pageMessages();
    else corps = pageAccueil();
    const onglet = h === '#messages' ? 'messages' : h === '#recherches' ? 'recherches' : 'stage';
    const av = L.avatar != null ? AVATARS[L.avatar] : null, per = periode(), s = suivi();
    const tete = declare() ? `<a class="qui" href="#declarer"><b>${esc(L.declaration.pfmp)}${per.debut ? `<span class="dts"> · ${fr(per.debut)} → ${fr(per.fin)}</span>` : ''}</b><small><i class="ti ti-user-check"></i> Référent ${s && s.refSigle ? esc(s.refSigle) : '· à venir'}</small></a>` : `<span class="bonjour">Bonjour !</span>`;
    const nAg = declare() ? nbAgenda() : 0, al = h !== '#declarer' && declare() ? alerte() : null;
    $('app').innerHTML = `
      <div class="top"><span class="av" style="background:${av ? av[1] : '#cfc7b8'}"><i class="ti ti-${av ? av[0] : 'user'}"></i></span>${tete}
        <span class="sync ${etatSync}" id="sync" title="${ICONES_SYNC[etatSync][1]}">${iconeSync()}</span>
        ${declare() ? `<button class="rond-btn" data-act="agenda" aria-label="Agenda"><i class="ti ti-calendar-event"></i>${nAg ? `<span class="pastille">${nAg}</span>` : ''}</button>` : ''}
        <button class="rond-btn pc" data-act="qr" aria-label="Sur mon téléphone"><i class="ti ti-device-mobile"></i></button>
        <button class="rond-btn" data-act="plus" aria-label="Plus"><i class="ti ti-dots"></i></button></div>
      ${plus ? `<div class="plus">${declare() ? `<button data-act="imprimer"><i class="ti ti-printer"></i> Imprimer ma fiche</button>` : ''}<button data-act="qr"><i class="ti ti-device-mobile"></i> Sur mon téléphone</button><a href="../index.html"><i class="ti ti-notebook"></i> Mon carnet de bord</a><button data-act="changer"><i class="ti ti-switch-horizontal"></i> Changer de code</button></div>` : ''}
      <nav class="menu"><a href="#" class="${onglet === 'stage' ? 'on' : ''}"><i class="ti ti-route"></i> Mon stage</a>${declare() ? `<a href="#recherches" class="${onglet === 'recherches' ? 'on' : ''}"><i class="ti ti-list-search"></i> Recherches</a>` : ''}<a href="#messages" class="${onglet === 'messages' ? 'on' : ''}"><i class="ti ti-messages"></i> Messages <span class="bd" id="badgeMsg" hidden></span></a></nav>
      ${al ? `<a class="alerte ${al.fort ? 'fort' : ''}" href="${al.lien}"><i class="ti ti-${al.ic}"></i><span>${esc(al.t)}</span><i class="ti ti-chevron-right"></i></a>` : ''}
      ${corps}
      <p class="discret"><i class="ti ti-shield-lock"></i> ${esc(code)}</p>`;
    Object.entries(garde).forEach(([k, v]) => { const x = $(k); if (x && x.tagName !== 'SELECT' && !x.value && v) x.value = v; });
    if (rappelOuvert && h === dernierEcran) { const d = document.querySelector('#app details.rappel'); if (d) d.open = true; }
    if (actif && $(actif)) $(actif).focus({ preventScroll: true });
    if (h !== dernierEcran) { dernierEcran = h; window.scrollTo(0, 0); } else window.scrollTo(0, y);
    if (h === '#messages') { rendreFil(); try { localStorage.setItem(cleLocale() + ':vu', new Date().toISOString()); } catch (e) {} }
    majBadge(); demarrerChrono(); humeur(); if (volet === 'agenda') rendreVolet();
    const fr_ = $('frise'), ici = fr_ && fr_.querySelector('.pt.ici');
    if (ici) fr_.scrollLeft = ici.offsetLeft - fr_.clientWidth / 2 + ici.clientWidth / 2;
  }

  function ecranCode() {
    $('app').innerHTML = `<form id="formCode" style="max-width:380px;margin:12vh auto 0;text-align:center;display:grid;gap:14px">
      <span class="av grand" style="background:var(--p600);margin:0 auto"><i class="ti ti-briefcase"></i></span>
      <h1 style="font-size:24px">Mon stage PFMP</h1>
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

  /* ── Accueil ─────────────────────────────────────────────────────────── */
  function pageAccueil() {
    if (!declare()) return `<button class="declarer" onclick="location.hash='#declarer'"><i class="ti ti-plus"></i>Déclarer un stage</button>`;
    const per = periode(), nds = noeuds(), ici = nds.findIndex(x => !x.ok);
    const { etat, courante } = phaseEnCours();
    const drap = P.drapeaux(suivi() || {}).map(d => `<span class="${d.ok ? 'ok' : ''}" title="${esc(d.label)}"><i class="ti ti-${d.label === 'Arrivée' ? 'trophy' : 'flag'}"></i></span>`).join('');
    const pc = courante === 'recherches' ? { t: 'Mes recherches', ic: 'list-search', sous: 'Appels, visites, réponses' } : PHASES[courante];
    const lienPc = courante === 'recherches' ? '#recherches' : '#p/' + courante;
    return `
      <div class="compte"><b id="jours">—</b><span class="l" id="joursL">jours avant le départ</span><div class="chrono" id="chrono"></div>
        <div class="l" style="margin-top:6px">${esc(L.declaration.pfmp)} · ${fr(per.debut)} → ${fr(per.fin)}${suivi() && suivi().refSigle ? ' · référent ' + esc(suivi().refSigle) : ''}</div>
        <div class="drapeaux">${drap}</div></div>
      <div class="frise" id="frise">${nds.map((x, i) => `<button class="pt ${x.ok ? 'ok' : ''} ${i === ici ? 'ici' : ''} ${x.stage ? 'stage' : ''}" onclick="location.hash='${x.lien}'"><i class="d"></i><div class="n">${esc(x.n)}</div><div class="dt">${esc(x.d) || '&nbsp;'}</div></button>`).join('')}</div>
      <a class="phase" href="${lienPc}"><span class="ic"><i class="ti ti-${pc.ic}"></i></span><span style="flex:1"><b>${esc(pc.t)}</b>${pc.sous ? `<small>${esc(pc.sous)}</small>` : ''}</span><i class="ti ti-chevron-right" style="font-size:22px"></i></a>
      <div class="phases-mini">${ORDRE.filter(k => k !== courante).map(k => { const ph = k === 'recherches' ? { t: 'Mes recherches', ic: 'list-search' } : PHASES[k]; return `<a href="${k === 'recherches' ? '#recherches' : '#p/' + k}"><i class="ti ti-${ph.ic}"></i>${esc(ph.t)}<span class="etat">${etat[k] ? '<span class="chip ok"><i class="ti ti-check"></i></span>' : ''}</span></a>`; }).join('')}</div>
      <a class="lien" href="#declarer"><i class="ti ti-pencil"></i> Modifier mon stage</a>`;
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
  }

  /* ── Déclarer / modifier mon stage ───────────────────────────────────── */
  function seg(groupe, cle, options, valeur, gros) {
    return `<div class="seg ${gros ? 'gros' : ''}">${options.map(o => `<button data-seg="${groupe}" data-cle="${cle}" data-v="${esc(o)}" class="${valeur === o ? 'on' : ''}">${valeur === o ? '<i class="ti ti-check"></i>' : ''}${esc(o)}</button>`).join('')}</div>`;
  }
  const champAutre = (groupe, cle, valeur, ph) => `<input type="text" class="autre" id="autre-${groupe}-${cle}" data-autre="${groupe}" data-cle="${cle}" maxlength="80" placeholder="${esc(ph || 'Précisez')}" value="${esc(valeur || '')}">`;
  function pageDeclarer() {
    const D = L.declaration, s = suivi();
    const blk = (n, ok, t, c) => `<div class="blk ${ok ? 'ok' : ''}"><div class="bh"><span class="num">${ok ? '<i class="ti ti-check"></i>' : n}</span>${t}</div>${c}</div>`;
    return `<a class="retour" href="#"><i class="ti ti-chevron-left"></i> Mon stage</a>
      ${blk(1, L.avatar != null, 'Sélectionnez votre avatar', `<div class="avatars">${AVATARS.map((a, i) => `<button data-avatar="${i}" class="${L.avatar === i ? 'on' : ''}" aria-label="Avatar ${i + 1}"><span class="av" style="background:${a[1]}"><i class="ti ti-${a[0]}"></i></span></button>`).join('')}</div>`)}
      ${blk(2, !!D.pfmp, 'Sélectionnez votre stage', seg('declaration', 'pfmp', ['PFMP 1', 'PFMP 2'], D.pfmp, true))}
      ${blk(3, !!(D.debut && D.fin), 'Sélectionnez les dates', `<div class="dates"><label>Début<input type="date" id="debut" data-date="debut" value="${esc(D.debut || (s && s.debut) || '')}"></label><label>Fin<input type="date" id="fin" data-date="fin" value="${esc(D.fin || (s && s.fin) || '')}"></label></div>`)}
      ${blk(4, !!D.domaine, 'Sélectionnez le domaine', seg('declaration', 'domaine', DOMAINES, D.domaine) + (D.domaine === 'Autre' ? champAutre('declaration', 'domaineAutre', D.domaineAutre, 'Domaine') : ''))}
      <button class="btn pri plein" data-act="enregistrer"><i class="ti ti-device-floppy"></i> Enregistrer mon stage</button>`;
  }

  /* ── Les pages de phase ──────────────────────────────────────────────── */
  function entete(k, n, total) {
    const ph = PHASES[k];
    return `<a class="retour" href="#"><i class="ti ti-chevron-left"></i> Mon stage</a>
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
    if (e.e === 'valide' || e.e === 'fait') chip = '<span class="chip ok"><i class="ti ti-check"></i> Validé</span>';
    else if (e.e === 'declare' || (e.e === 'remis' && et.from === 'eleve')) chip = '<span class="chip att">En attente du référent</span>';
    else if (e.e === 'corriger') chip = '<span class="chip non">À corriger</span>';
    btns = P.actions(et, e, 'eleve').filter(a => a !== 'annuler').map(a => `<button class="btn vert mini" data-agir="${id}" data-action="${a}"><i class="ti ti-check"></i> ${a === 'remettre' ? 'Remis' : a === 'recevoir' ? 'Reçu' : 'Fait'}</button>`).join('');
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
        question('trouve', 'building', '#e3f6ea', '#1f9d4c', 'J’ai trouvé un stage', ['Oui', 'Non', 'Autre']);
      if (p.trouve === 'Oui') {
        const rt = p.trouveR && (L.recherches || []).find(x => x.id === p.trouveR);
        h += `<div class="qc ok">${rt ? `<a class="ici-lien" href="#recherches"><i class="ti ti-map-pin"></i> ${esc(rt.nom || 'Entreprise')}</a>` : ''}${questionsTrouve()}${etatReferent()}</div>`;
        if (!suivi() || !fait('search')) h += suite('#p/fiche', 'Ma fiche de négociation');
      } else if (p.trouve === 'Non') h += suite('#recherches', 'Mes recherches');
      return h;
    }
    if (k === 'fiche') {
      const E = L.fiche.etapes || {}, n = FICHE.filter(([c]) => E[c]).length;
      let h = entete(k, n, FICHE.length) + rappel('fiche') + question('recue', 'file-certificate', '#eeedfe', '#534AB7', 'J’ai ma fiche de négociation', ['Oui', 'Non'], 'fiche');
      if (L.fiche.recue === 'Non') h += `<div class="info"><i class="ti ti-hand-finger"></i>À demander au professeur principal ou à l’enseignant professionnel.</div>`;
      h += `<div class="qc ${n === FICHE.length ? 'ok' : ''}"><div class="etapes">${FICHE.map(([c, t]) => `<button class="et ${E[c] ? 'on' : ''}" data-fiche="${c}"><span class="b"><i class="ti ti-check"></i></span>${esc(t)}</button>`).join('')}</div></div>`;
      return h + suite('#p/preconvention', 'Ma pré-convention');
    }
    if (k === 'preconvention') {
      const ids = ['pre_given', 'pre_filled', 'pre_return'], n = ids.filter(envoyeOuLocal).length;
      return entete(k, n, 3) + rappel('preconvention') + `<div class="qc">${etape('pre_given', 'J’ai reçu ma pré-convention')}${etape('pre_filled', 'L’entreprise l’a remplie, signée et tamponnée')}${etape('pre_return', 'Je l’ai rendue à mon référent')}</div>` + suite('#p/convention', 'Ma convention');
    }
    if (k === 'convention') {
      const ids = ['conv_given', 'family', 'company', 'conv_return', 'copies'], n = ids.filter(envoyeOuLocal).length;
      return entete(k, n, 5) + rappel('convention') + `<div class="qc">${etape('conv_given', 'J’ai reçu ma convention à faire signer')}${etape('company', 'Signée par l’entreprise et le tuteur, avec le cachet')}${etape('family', 'Signée par moi, ou mon responsable légal si je suis mineur')}${etape('conv_return', 'Je l’ai rendue à mon référent')}${etape('copies', 'J’ai remis l’exemplaire signé à mes parents')}</div>` + infoVoit('pronote') + infoVoit('bde') + suite('#p/depart', 'Prêt à partir');
    }
    if (k === 'depart') {
      const D = L.depart, n = DEPART.filter(([c]) => D[c]).length, s = suivi();
      return entete(k, n, DEPART.length) + `<div class="qc ${n === DEPART.length ? 'ok' : ''}"><div class="etapes">${DEPART.map(([c, t]) => `<button class="et ${D[c] ? 'on' : ''}" data-depart="${c}"><span class="b"><i class="ti ti-check"></i></span>${esc(t)}</button>`).join('')}</div></div>` +
        infoVoit('arrival') + (s && s.visite && s.visite.le ? `<div class="info vert"><i class="ti ti-calendar-check"></i>Visite de votre référent : ${esc(s.visite.le)}</div>` : '') + suite('#p/stage', 'Pendant le stage');
    }
    if (k === 'stage') {
      const s = suivi(), mp = en('midpoint');
      let h = entete(k) + `<div class="qc">${etape('here', 'Je suis arrivé dans mon entreprise')}</div>`;
      h += `<div class="qc"><div class="t"><span class="ic" style="background:#e6effa;color:#1d5fae"><i class="ti ti-mood-smile"></i></span>Comment se passe mon stage ?</div>${s ? (mp.e ? `<span class="chip ${mp.v === 'difficulte' ? 'att' : 'ok'}">${mp.v === 'difficulte' ? 'Difficulté signalée' : 'Tout va bien'}</span>` : `<div class="seg"><button data-agir="midpoint" data-action="declarer" data-v="ok"><i class="ti ti-mood-smile"></i> Ça va</button><button data-agir="midpoint" data-action="declarer" data-v="difficulte"><i class="ti ti-alert-circle"></i> J’ai une difficulté</button></div>`) : ''}</div>`;
      if (s && s.visite && s.visite.le) h += `<div class="info vert"><i class="ti ti-calendar-check"></i>Visite de votre référent : ${esc(s.visite.le)}</div>`;
      h += `<a class="lien" href="../index.html"><i class="ti ti-notebook"></i> Mon carnet de bord</a>`;
      return h + suite('#p/retour', 'Attestation et bilan');
    }
    if (k === 'retour') {
      const ids = ['attest_in', 'attestation', 'student_eval'], n = ids.filter(envoyeOuLocal).length;
      return entete(k, n, 3) + rappel('retour') + `<div class="qc">${etape('attest_in', 'L’entreprise m’a remis mon attestation')}${etape('attestation', 'Je l’ai rendue à mon référent')}${etape('student_eval', 'J’ai fait le bilan de mon stage')}</div><a class="lien" href="../index.html"><i class="ti ti-notebook"></i> Mon bilan dans le carnet</a>`;
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
    let h = `<div class="ptitle"><span class="ic"><i class="ti ti-list-search"></i></span><span><h1>Mes recherches</h1></span><button class="prog imp" data-act="imprimer" aria-label="Imprimer ma fiche"><i class="ti ti-printer"></i></button></div>`;
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
      <div class="f-pied">mapse.fr › Mon espace › PFMP AGOrA › Mon stage PFMP</div></div>`;
  }
  function imprimer() { $('impression').innerHTML = fiche(); setTimeout(() => window.print(), 50); }

  /* ── Messages ────────────────────────────────────────────────────────── */
  function pageMessages() {
    if (!suivi()) return `<div class="vide"><i class="ti ti-messages" style="font-size:34px"></i><p>Messagerie disponible quand votre stage est ouvert par le lycée.</p></div>`;
    return `<div class="fil" id="fil"></div><form class="ecrire" id="formMsg"><label class="sr" for="texte">Message</label><textarea id="texte" maxlength="1000" placeholder="Votre message"></textarea><button class="btn pri" aria-label="Envoyer"><i class="ti ti-send"></i></button></form>`;
  }
  function rendreFil() {
    const f = $('fil'); if (!f) return;
    f.innerHTML = msgs.length ? msgs.map(m => `<div class="msg ${esc(m.de)}"><small>${m.de === 'eleve' ? 'Moi' : m.de === 'pp' ? 'Professeur principal' : 'Référent'}${m.sigle && m.de !== 'eleve' ? ' ' + esc(m.sigle) : ''} · ${m.le ? new Date(m.le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}</small>${esc(m.texte)}</div>`).join('') : '<div class="vide">Aucun message.</div>';
    f.scrollTop = f.scrollHeight;
  }

  /* ── Gestes ──────────────────────────────────────────────────────────── */
  document.addEventListener('click', ev => {
    if (ev.target.closest('#tiroir [data-act="fermer"]')) { volet = ''; rendreVolet(); return; }
    const b = ev.target.closest('button,[data-act]'); if (!b || !$('app').contains(b)) { if (plus && !ev.target.closest('.plus')) { plus = false; rendre(); } return; }
    const d = b.dataset;
    if (d.act === 'plus') { plus = !plus; rendre(); return; }
    if (plus && !b.closest('.plus')) { plus = false; }
    if (d.act === 'agenda' || d.act === 'qr') { plus = false; volet = d.act; rendre(); rendreVolet(); return; }
    if (d.act === 'imprimer') { plus = false; rendre(); imprimer(); return; }
    if (d.sem) { const x = (semaine().items || []).find(y => y.id === d.sem); if (x) { x.ok = !x.ok; sauver(); rendre(); } return; }
    if (d.semx) { semaine().items = semaine().items.filter(y => y.id !== d.semx); sauver(); rendre(); return; }
    if (d.sugg) { ajouterObjectif(d.sugg); return; }
    if (d.act === 'nouvelleSemaine') { const S = semaine(); S.items = S.items.filter(y => !y.ok); S.prochain = prochainMercredi(); sauver(); rendre(); return; }
    if (d.act === 'changer') { try { localStorage.removeItem('codeEleve'); } catch (e) {} location.hash = ''; location.reload(); return; }
    if (d.avatar != null) { L.avatar = +d.avatar; sauver(); rendre(); return; }
    if (d.seg) { L[d.seg] = L[d.seg] || {}; L[d.seg][d.cle] = L[d.seg][d.cle] === d.v ? '' : d.v; if (d.seg === 'declaration' && d.cle === 'pfmp') prerempliDates(); sauver(); rendre(); return; }
    if (d.act === 'enregistrer') { lireDates(); if (!L.declaration.pfmp) L.declaration.pfmp = 'PFMP 1'; sauver(); if (connu[numero()] && !suivi()) creerSuivi(numero()); location.hash = '#'; return; }
    if (d.act === 'trouve') {
      const st = L.prepa.structure === 'Autre' ? (L.prepa.structureAutre || 'Autre') : (L.prepa.structure || 'Entreprise');
      const dom = L.declaration.domaine === 'Autre' ? L.declaration.domaineAutre : L.declaration.domaine;
      b.disabled = true; svc.declarerTrouve(sid(), { structure: st, secteur: dom || '' }).then(() => toast('Envoyé à votre référent.')).catch(e => { toast(e.message); b.disabled = false; });
      return;
    }
    if (d.agir) { if (!svc || !suivi()) return; b.disabled = true; svc.agir(sid(), d.agir, d.action, 'eleve', d.v ? { v: d.v } : undefined).then(() => toast(d.agir === 'midpoint' && d.v === 'difficulte' ? 'Votre référent est prévenu.' : 'Envoyé à votre référent.')).catch(e => { toast(e.message); b.disabled = false; }); return; }
    if (d.locale) { L.locales = L.locales || {}; L.locales[d.locale] = !L.locales[d.locale]; sauver(); rendre(); return; }
    if (d.fiche) { L.fiche.etapes = L.fiche.etapes || {}; L.fiche.etapes[d.fiche] = !L.fiche.etapes[d.fiche]; sauver(); rendre(); return; }
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
    if (d.autre) { L[d.autre][d.cle] = x.value; sauver(); }
    else if (d.rnote) { const r = L.recherches.find(y => y.id === d.rnote); if (r) { r.note = x.value; sauver(); } }
    else if (d.rautre) { const r = L.recherches.find(y => y.id === d.rautre); if (r) { r.autre = x.value; sauver(); } }
  });
  document.addEventListener('change', ev => {
    const x = ev.target, d = x.dataset;
    if (d.date) { lireDates(); sauver(); rendre(); }
    else if (d.rd) { const r = L.recherches.find(y => y.id === d.rd); if (r) { r[d.k] = x.value; sauver(true); rendre(); } }
    else if (d.semdate) { semaine().prochain = x.value; sauver(); rendre(); }
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
    } else if (f.id === 'formMsg') {
      ev.preventDefault();
      const t = $('texte'), texte = t.value; if (!texte.trim()) return; t.value = '';
      svc.envoyerMessage(sid(), 'eleve', '', texte).catch(e => { toast(e.message); t.value = texte; });
    }
  });
  function majR(id, patch) { const r = L.recherches.find(y => y.id === id); if (!r) return; Object.assign(r, patch); sauver(true); rendre(); }
  function lireDates() { const a = $('debut'), b = $('fin'); if (a) L.declaration.debut = a.value; if (b) L.declaration.fin = b.value; }
  function prerempliDates() { const s = suivi(); if (s && !L.declaration.debut) { L.declaration.debut = s.debut || ''; L.declaration.fin = s.fin || ''; } }
  window.addEventListener('hashchange', () => { plus = false; formR = null; confirmeRetrait = ''; volet = ''; rendreVolet(); rendre(); });

  function demarrer(c) {
    code = c; charger(); rendre(); brancher();
  }
  /* Arrivée par le QR code de l'ordinateur : ?c=CODE ouvre directement la page sur le téléphone. */
  const cUrl = (new URLSearchParams(location.search).get('c') || '').trim().toUpperCase();
  if (/^[A-Z0-9]{4,6}$/.test(cUrl)) { try { localStorage.setItem('codeEleve', cUrl); localStorage.setItem('userCode', cUrl); } catch (e) {} history.replaceState(null, '', location.pathname + location.hash); }
  let c0 = cUrl; try { c0 = c0 || (localStorage.getItem('codeEleve') || '').trim().toUpperCase(); } catch (e) {}
  if (/^[A-Z0-9]{4,6}$/.test(c0)) demarrer(c0); else ecranCode();
})();
