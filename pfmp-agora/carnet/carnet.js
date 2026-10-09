
'use strict';
/* Mon carnet de bord PFMP (09/10/2026) — construit d'après la maquette validée par Brahim (suivi-pfmp/carnet-bord-demo.html). */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ── Le référentiel Bac Pro AGOrA : pôles, sous-pôles, activités (intitulés du compte rendu PFMP). ? = explication. ── */
const POLES = [
  { n: '1', t: 'Relations avec les clients, les usagers et les adhérents', sp: [
    ['1.1', 'Préparation et prise en charge de la relation', [
      ['accueil', 'Accueil et renseignement', 'Accueillir une personne en face à face ou au téléphone, la renseigner ou l’orienter.'],
      ['demande', 'Prise en charge de la demande', 'Répondre à une demande ou la transmettre à la bonne personne.'],
      ['promo', 'Organisation d’événements de promotion', 'Préparer un événement, une affiche, un dépliant ou une publication.'],
      ['prospect', 'Prospection', 'Aider à contacter de futurs clients : fichier, publipostage, courriel.']]],
    ['1.2', 'Opérations administratives liées aux clients', [
      ['devis', 'Devis, commandes, contrats', 'Préparer ou vérifier un devis, un bon de commande ou un contrat.'],
      ['facture', 'Livraison et facturation', 'Préparer un bon de livraison ou une facture.'],
      ['encaisse', 'Encaissements', 'Enregistrer un paiement reçu : chèque, virement, carte.'],
      ['reclam', 'Réclamations et litiges', 'Aider à traiter une réclamation ou une relance.']]],
    ['1.3', 'Mise à jour du système d’information', [
      ['dossiers', 'Mise à jour des dossiers', 'Mettre à jour un fichier de clients, d’usagers ou d’adhérents.'],
      ['tdbcom', 'Tableaux de bord', 'Compléter un tableau de suivi : ventes, contacts, demandes.'],
      ['web', 'Réseaux sociaux et site internet', 'Préparer ou mettre à jour une information publiée en ligne.']]]] },
  { n: '2', t: 'Organisation et suivi de l’activité de production', sp: [
    ['2.1', 'Suivi administratif', [
      ['stocks', 'Approvisionnements et stocks', 'Compter un stock, passer ou vérifier une commande de fournitures.'],
      ['fourn', 'Dossiers fournisseurs et prestataires', 'Classer ou mettre à jour le dossier d’un fournisseur.'],
      ['planning', 'Coordination d’un service ou d’un projet', 'Mettre à jour un planning, suivre l’avancement d’un projet.']]],
    ['2.2', 'Suivi financier', [
      ['decaisse', 'Décaissements', 'Enregistrer ou classer une facture d’achat, un règlement à un fournisseur.'],
      ['treso', 'Trésorerie et banques', 'Pointer un relevé bancaire, aider à un état de trésorerie.']]],
    ['2.3', 'Gestion des espaces de travail', [
      ['fournit', 'Fournitures et consommables', 'Faire un inventaire, ranger, préparer une commande de fournitures.'],
      ['reunion', 'Réunions', 'Préparer une salle, des convocations, des documents ou une visioconférence.'],
      ['interne', 'Information interne', 'Afficher une note, diffuser une information, mettre à jour un espace partagé.']]]] },
  { n: '3', t: 'Administration du personnel', sp: [
    ['3.1', 'Suivi de la carrière', [
      ['integ', 'Recrutement, intégration, départ', 'Aider à préparer l’arrivée ou le départ d’un salarié.'],
      ['dosperso', 'Dossiers du personnel', 'Classer ou mettre à jour un dossier du personnel, dans le respect de la confidentialité.']]],
    ['3.2', 'Suivi organisationnel et financier', [
      ['temps', 'Temps de travail', 'Mettre à jour un planning, des congés ou des absences.'],
      ['deplac', 'Déplacements', 'Préparer un déplacement ou vérifier une note de frais.']]],
    ['3.3', 'Activité sociale', [
      ['infosoc', 'Information sociale', 'Diffuser une information au personnel : note, affichage, courriel.']]]] }
];
const ACT = {}; POLES.forEach(p => p.sp.forEach(([c, t, l]) => l.forEach(([id, lib, ex]) => { ACT[id] = { id, lib, ex, sp: c, pole: p.n }; })));
const RESSENTI = ['Très bien', 'Bien', 'Moyen', 'Difficile', 'Autre'];
/* La présence du jour : un retard de démarrage ou une absence se notent, sans bloquer le reste. */
const PRESENCE = ['Présent toute la journée', 'Absent le matin', 'Absent l’après-midi', 'Absent toute la journée', 'Stage pas encore commencé'];
const ABSENT_JOUR = p => p === 'Absent toute la journée' || p === 'Stage pas encore commencé';
const ACCUEIL1 = ['Très bien accueilli', 'Bien accueilli', 'Moyennement accueilli', 'Mal accueilli'];
const AMORCES = ['Aujourd’hui, j’ai été chargé(e) de…', 'Pour cela, j’ai utilisé…', 'J’ai rencontré une difficulté : …', 'J’ai appris à…'];
const TRANSV = [
  ['oral', 'Communication orale', 'S’exprimer clairement avec les clients et les collègues, au téléphone et en face à face.'],
  ['ecrit', 'Communication écrite', 'Rédiger un message, un courriel ou un document sans fautes et dans le bon registre.'],
  ['codes', 'Codes sociaux', 'Tenue, ponctualité, politesse, discrétion : les règles de l’organisation.'],
  ['prio', 'Gestion des priorités', 'Savoir par quoi commencer quand plusieurs tâches arrivent en même temps.'],
  ['equipe', 'Travail en équipe', 'Coopérer, demander de l’aide, rendre compte de son travail.'],
  ['consignes', 'Consignes et procédures', 'Appliquer une consigne, suivre une procédure, vérifier son travail.']];
const NIVEAUX = ['Débutant', 'En progrès', 'À l’aise', 'Autonome'];
const ACCUEIL = ['L’accueil à l’arrivée', 'Les informations de début de stage, dont les consignes de sécurité', 'La santé et la sécurité au travail', 'La disponibilité et l’écoute du tuteur', 'L’accompagnement du tuteur', 'L’intégration dans l’équipe', 'L’espace de travail', 'Les contacts avec les autres salariés', 'Les relations avec les supérieurs hiérarchiques', 'L’ambiance générale de travail'];
const SATIS = ['Très insatisfait', 'Insatisfait', 'Satisfait', 'Très satisfait'];
const Q5 = [['quand', 'Quand et où ?', 'Le jour, le service, le poste de travail.'], ['comment', 'Comment l’avez-vous réalisée ?', 'Les étapes, dans l’ordre.'], ['savoirs', 'Qu’avez-vous utilisé ou appris ?', 'Les outils, les logiciels, les règles connues.'], ['but', 'Dans quel but ?', 'Ce que l’activité devait produire, pour qui.'], ['avis', 'Qu’en pensez-vous ?', 'Ce qui a réussi, ce que vous feriez autrement.']];

/* ── Les périodes : celles du suivi de PFMP de l'élève (coordination_pfmp_suivi/{année}_{code}_p1 et _p2). ── */
const PERIODES = {};
function datesDe(p) { const x = PERIODES[p]; if (!x || !x.debut) return []; const l = []; for (let d = new Date(x.debut + 'T12:00:00'), f = new Date((x.fin || x.debut) + 'T12:00:00'); d <= f && l.length < 60; d.setDate(d.getDate() + 1)) { const w = d.getDay(); if (w && w !== 6) l.push(d.toLocaleDateString('sv-SE')); } return l; }
const frJ = s => new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const frC = s => new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });

/* ── Mémoire : une copie sur cet appareil à chaque saisie, et dans la base de la coordination à chaque « Enregistrer ».
   coordination_pfmp_suivi/<fiche>/eleve/carnet : aucun nom d'élève ; lu par le référent et le professeur principal. ── */
const CFG = { apiKey: 'AIzaSyBj_GXG8ln3GAxNXxiJkT2HPSWIHJpc1lA', authDomain: 'coordination-pedagogie.firebaseapp.com', projectId: 'coordination-pedagogie', storageBucket: 'coordination-pedagogie.firebasestorage.app', messagingSenderId: '526058585010', appId: '1:526058585010:web:ba4dd6d9c8281ba5bf02ab' };
const PC = window.PFMP_COMMUN, ANNEE = PC.anneeScolaire();
const Q = new URLSearchParams(location.search), LECTURE = /^20\d{2}-20\d{2}_[A-Z0-9]{4,6}_p[12]$/.test(Q.get('f') || '') ? Q.get('f') : '';
let CODE = (LECTURE ? LECTURE.split('_')[1] : (Q.get('c') || (function () { try { return localStorage.getItem('codeEleve') || ''; } catch (e) { return ''; } })())).toUpperCase().trim();
const CLE = 'pfmp-carnet-v1:' + CODE;
const VIDE = () => ({ jours: {}, act: [], org: {}, comp: {}, accueil: {}, bilan: {}, meme: '', accueilEnvoye: '', majLe: '' });
let D; try { D = JSON.parse(localStorage.getItem(CLE)); } catch (e) {}
if (!D || !D.p1) D = { periode: 'p1', p1: VIDE(), p2: VIDE() };
if (LECTURE) D.periode = 'p' + LECTURE.slice(-1);
const SUIVIS = {}, ENLIGNE = { p1: '', p2: '' };
let fs = null;
const sidDe = per => PC.suiviId(ANNEE, CODE, +per.slice(1));
function majPeriodes() { ['p1', 'p2'].forEach(k => { const s = SUIVIS[k]; PERIODES[k] = s && s.debut ? { lib: s.libelle || ('PFMP ' + k.slice(1)), quand: frCourt(s.debut) + ' → ' + frCourt(s.fin || s.debut), debut: s.debut, fin: s.fin || s.debut } : null; }); }
const frCourt = s => new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
function nettoyer(p) { const c = JSON.parse(JSON.stringify(p || VIDE())); delete c._local; return c; }
async function envoyer(per) {
  if (!fs || !SUIVIS[per]) return false;
  try { const d = nettoyer(D[per]); d.majLe = new Date().toISOString(); await fs.doc('coordination_pfmp_suivi/' + sidDe(per) + '/eleve/carnet').set(d); D[per].majLe = d.majLe; D[per]._local = false; localGarder(); ENLIGNE[per] = 'ok'; return true; }
  catch (e) { D[per]._local = true; localGarder(); ENLIGNE[per] = 'local'; return false; }
}
function localGarder() { try { localStorage.setItem(CLE, JSON.stringify(D)); } catch (e) {} }
async function brancher() {
  for (let i = 0; i < 40 && !window.__PFMP_SHIM__ && !(window.firebase && window.firebase.firestore); i++) await new Promise(r => setTimeout(r, 250));
  try { if (window.__PFMP_SHIM__) fs = window.__PFMP_SHIM__; else { const fb = window.firebase; fs = ((fb.apps || []).find(a => a.name === 'pfmp-suivi') || fb.initializeApp(CFG, 'pfmp-suivi')).firestore(); } } catch (e) { fs = null; }
  if (!fs || !CODE) { pret(); return; }
  let n = 0;
  ['p1', 'p2'].forEach(per => {
    fs.doc('coordination_pfmp_suivi/' + sidDe(per)).onSnapshot(s => { SUIVIS[per] = s.exists ? s.data() : null; majPeriodes(); if (++n >= 2) pret(); else if (n > 2) rendreSiLibre(); }, () => { if (++n >= 2) pret(); });
    /* Le carnet en ligne : le plus récent gagne ; un enregistrement resté sur l'appareil repart dès que possible. */
    fs.doc('coordination_pfmp_suivi/' + sidDe(per) + '/eleve/carnet').onSnapshot(s => {
      const r = s.exists ? s.data() : null, l = D[per];
      if (r && (!l.majLe || String(r.majLe) > String(l.majLe)) && !l._local) { D[per] = Object.assign(VIDE(), r); localGarder(); rendreSiLibre(); }
      else if (l._local) envoyer(per);
      ENLIGNE[per] = l._local ? 'local' : 'ok';
    }, () => { ENLIGNE[per] = 'local'; });
  });
  setTimeout(pret, 6000);
}
let estPret = false;
function pret() { if (estPret) return; estPret = true; majPeriodes(); if (!PERIODES[D.periode] && PERIODES[D.periode === 'p1' ? 'p2' : 'p1']) D.periode = D.periode === 'p1' ? 'p2' : 'p1'; rendre(); }
function rendreSiLibre() { if (estPret && !modifie) rendre(); }
addEventListener('online', () => ['p1', 'p2'].forEach(per => { if (D[per]._local) envoyer(per); }));
let brouillon = null, modifie = false;
const P = () => D[D.periode];
function garder() { localGarder(); return envoyer(D.periode); }
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('vu'); clearTimeout(toast.m); toast.m = setTimeout(() => el.classList.remove('vu'), 2200); }
function etat() { const e = $('etat'); e.className = 'etat' + (modifie ? ' modif' : ''); e.textContent = modifie ? '● Non enregistré' : brouillon ? '✓ Enregistré' : ''; }
function marquer() { modifie = true; etat(); $('pEnr').classList.remove('fait'); $('pEnr').innerHTML = '<i class="ti ti-device-floppy"></i> Enregistrer'; }

/* ── Navigation : #/ · #/jour/AAAA-MM-JJ · #/activite/0 · #/organisation · #/competences · #/accueil · #/bilan · #/rapport ── */
function aller(h) { location.hash = h; }
$('pRetour').onclick = () => history.length > 1 ? history.back() : aller('#/');
addEventListener('hashchange', rendre);
addEventListener('beforeunload', e => { if (modifie) { e.preventDefault(); e.returnValue = ''; } });

function ecranCode() {
  $('titre').textContent = 'Mon carnet de bord PFMP'; $('pied').hidden = true;
  $('app').innerHTML = `<section class="bloc"><h3>Mon code</h3><input type="text" id="code" maxlength="6" autocomplete="off" style="text-transform:uppercase"><p class="erreur" id="errCode"></p><button class="rapport-btn" id="okCode" style="background:var(--b)">Ouvrir mon carnet</button></section>`;
  $('okCode').onclick = () => { const c = $('code').value.trim().toUpperCase(); if (!/^[A-Z0-9]{4,6}$/.test(c)) { $('errCode').textContent = 'Code incomplet.'; return; } if (window.ANNUAIRE && !window.ANNUAIRE[c] && c !== 'ZZ99') { $('errCode').textContent = 'Code inconnu.'; return; } try { localStorage.setItem('codeEleve', c); } catch (e) {} location.reload(); };
}
function ecranPasOuvert() {
  $('titre').textContent = 'Mon carnet de bord PFMP'; $('pied').hidden = true;
  $('app').innerHTML = `<section class="bloc"><h3>Mon stage n’est pas encore ouvert</h3><p style="margin:0 0 12px;color:var(--ink2)">Le carnet s’ouvre avec les dates de mon stage, dans Mon suivi de PFMP.</p><a class="rapport-btn" href="../stage/index.html" style="background:var(--b)"><i class="ti ti-route"></i> Mon suivi de PFMP</a></section>${CODE ? `<p style="font-size:13px;color:var(--muted);text-align:center">Code ${esc(CODE)} · <a href="#" id="chg">changer</a></p>` : ''}`;
  const c = $('chg'); if (c) c.onclick = e => { e.preventDefault(); try { localStorage.removeItem('codeEleve'); } catch (x) {} location.reload(); };
}
function rendre() {
  if (!estPret) { $('app').innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">Chargement…</p>'; return; }
  if (modifie && !confirm('Vous n’avez pas enregistré. Quitter quand même ?')) { history.pushState(null, '', rendre.dernier || '#/'); return; }
  modifie = false; brouillon = null;
  const h = location.hash || '#/'; rendre.dernier = h;
  const [, ecran, arg] = h.split('/');
  $('pied').hidden = !ecran || ecran === 'rapport';
  /* Toujours une flèche : vers le carnet, ou depuis le carnet vers Mon espace. */
  $('retour').href = ecran ? '#/' : '../../index.html'; $('retour').innerHTML = '<i class="ti ti-arrow-left"></i> ' + (ecran ? 'Mon carnet' : 'Mon espace');
  if (LECTURE) { $('pied').hidden = true; $('retour').style.visibility = 'hidden'; return ecranRapport(); }
  if (!CODE) return ecranCode();
  if (!PERIODES.p1 && !PERIODES.p2) return ecranPasOuvert();
  window.scrollTo(0, 0);
  if (ecran === 'jour') return ecranJour(arg);
  if (ecran === 'activite') return ecranActivite(+arg);
  if (ecran === 'organisation') return ecranOrg();
  if (ecran === 'competences') return ecranComp();
  if (ecran === 'accueil') return ecranAccueil();
  if (ecran === 'bilan') return ecranBilan();
  if (ecran === 'rapport') return ecranRapport();
  ecranCarnet();
}
function enregistrer(fn) {
  $('pEnr').onclick = async () => {
    fn(); D[D.periode].majLe = new Date().toISOString(); D[D.periode]._local = true; modifie = false; brouillon = true;
    $('pEnr').classList.add('fait'); $('pEnr').innerHTML = '<i class="ti ti-loader-2"></i> Enregistrement…';
    const ok = await garder(); const h = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    $('pEnr').innerHTML = '<i class="ti ti-circle-check"></i> ' + (ok ? 'Enregistré à ' + h : 'Gardé sur cet appareil · ' + h);
    $('etat').className = 'etat' + (ok ? '' : ' modif'); $('etat').textContent = ok ? '✓ Enregistré en ligne' : '● Sur cet appareil, envoi dès que possible';
    toast(ok ? 'Enregistré' : 'Gardé sur cet appareil : envoi en ligne dès que possible');
  };
  $('pEnr').classList.remove('fait'); $('pEnr').innerHTML = '<i class="ti ti-device-floppy"></i> Enregistrer'; etat();
}
function aideBtn(texte) { return `<button class="aide" type="button" data-aide="${esc(texte)}" aria-label="Explication">?</button>`; }
document.addEventListener('click', e => { const b = e.target.closest('[data-aide]'); if (!b) return; const nx = b.parentElement.nextElementSibling; if (nx && nx.classList.contains('explic')) { nx.remove(); return; } b.parentElement.insertAdjacentHTML('afterend', `<div class="explic">${esc(b.dataset.aide)}</div>`); });

/* ── Le carnet ── */
/* Le rendez-vous de bilan avec le tuteur : fixé par le référent (outil RDV PFMP), lu par le carnet (visite.le du suivi). */
function rdvDe() { const v = (SUIVIS[D.periode] || {}).visite || {}, m = String(v.le || '').match(/^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2}))?/); return m ? { date: m[1], h: m[2] ? (+m[2]) + ' h ' + m[3] : '' } : null; }
/* Le premier jour réellement passé en entreprise : l'étiquette « Début du stage » le suit. */
function debutReel(p, dates) { return dates.find(x => p.jours[x] && !ABSENT_JOUR(p.jours[x].pr)) || dates.find(x => !p.jours[x]) || dates[0]; }
function rangPresence(p, dates, d, prD) { let n = 0; for (const x of dates) { const pr = x === d ? prD : p.jours[x] ? p.jours[x].pr : PRESENCE[0]; if (pr && !ABSENT_JOUR(pr)) n++; if (x === d) return n; } return 0; }
function ecranCarnet() {
  $('titre').textContent = 'Mon carnet de bord PFMP';
  const p = P(), dates = datesDe(D.periode), faits = dates.filter(d => p.jours[d]);
  const ici = dates.find(d => !p.jours[d]) || dates[dates.length - 1], debut = debutReel(p, dates), fin = dates[dates.length - 1], rdv = rdvDe();
  const ok = x => Object.keys(x || {}).length > 0;
  const tag = d => d === debut ? '<span class="tag">Début</span>' : d === fin ? '<span class="tag">Fin</span>' : '';
  $('app').innerHTML = `<div class="periodes">${Object.entries(PERIODES).filter(([, v]) => v).map(([k, v]) => `<button class="${D.periode === k ? 'on' : ''}" data-periode="${k}"><b>${v.lib}</b><span>${v.quand}</span></button>`).join('')}</div>
    ${rdv ? `<div class="convoc"><i class="ti ti-calendar-event"></i><div><small>Rendez-vous de bilan</small><b>${esc(frJ(rdv.date))}${rdv.h ? ' · ' + esc(rdv.h) : ''}</b><span>Avec mon tuteur et mon enseignant référent, dans l’entreprise</span></div></div>` : ''}
    <a class="aujourdhui" href="#/jour/${ici}"><div class="x"><small>${faits.length < dates.length ? 'Ma journée' : 'Dernière journée'}</small><b>${esc(frJ(ici))}</b></div><i class="ti ti-chevron-right"></i></a>
    <h2>Mes journées · ${faits.length} / ${dates.length}</h2>
    <div class="jours">${dates.map(d => `<a href="#/jour/${d}" class="${p.jours[d] ? (ABSENT_JOUR(p.jours[d].pr) ? 'absent' : 'fait') : d === ici ? 'ici' : 'avenir'}">${rdv && rdv.date === d ? '<i class="pastille" title="Rendez-vous de bilan"></i>' : ''}${frC(d).split(' ')[0]}<b>${new Date(d + 'T12:00:00').getDate()}</b>${tag(d)}</a>`).join('')}</div>
    <h2>Préparer ma fin de stage</h2>
    <a class="ligne" href="#/competences"><span class="ic"><i class="ti ti-chart-dots"></i></span><span class="x"><b>Mes compétences</b><span>${rdv ? 'Prêtes pour le rendez-vous de bilan · ' + esc(frJ(rdv.date)) : 'Prêtes pour le rendez-vous de bilan avec mon tuteur'}</span></span><span class="puce ${ok(p.comp) ? 'ok' : 'att'}">${ok(p.comp) ? '✓ Prêtes' : 'À faire'}</span></a>
    <a class="ligne" href="#/accueil"><span class="ic"><i class="ti ti-mood-smile"></i></span><span class="x"><b>Mon avis sur l’accueil</b><span>Envoyé à mon référent et à mon professeur principal</span></span><span class="puce ${p.accueilEnvoye ? 'ok' : 'att'}">${p.accueilEnvoye ? '✓ Envoyé' : 'À faire'}</span></a>
    <a class="ligne" href="#/bilan"><span class="ic"><i class="ti ti-flag"></i></span><span class="x"><b>Mon bilan</b><span>Pour l’entretien avec mon référent</span></span><span class="puce ${ok(p.bilan) ? 'ok' : 'att'}">${ok(p.bilan) ? '✓ Fait' : 'À faire'}</span></a>
    <a class="rapport-btn" href="#/rapport"><i class="ti ti-file-text"></i> Mon rapport de stage</a>
    <p style="font-size:13px;color:var(--muted);text-align:center;margin-top:18px">${D[D.periode]._local ? '● Une partie est encore sur cet appareil : envoi dès que possible · ' : ''}<a href="../index.html" style="color:var(--muted)">Mon ancien carnet</a></p>`;
  $('app').querySelectorAll('[data-periode]').forEach(b => b.onclick = () => { D.periode = b.dataset.periode; localGarder(); rendre(); });
}

/* ── Une journée : ressenti, activités, compte rendu. ── */
function ecranJour(d) {
  const dates = datesDe(D.periode), i = dates.indexOf(d); if (i < 0) return aller('#/');
  const p = P(), j = JSON.parse(JSON.stringify(p.jours[d] || { pr: '', r: '', a: [], t: '' }));
  j.autres = j.autres || {};
  /* Le premier jour réellement passé en entreprise (pas forcément le lundi) : la question de l'accueil. */
  const premier = dates.find(x => x === d ? !ABSENT_JOUR(j.pr) : p.jours[x] && !ABSENT_JOUR(p.jours[x].pr)) === d;
  const rang = rangPresence(p, dates, d, j.pr || PRESENCE[0]), rdv = rdvDe();
  const ok = x => Object.keys(x || {}).length > 0;
  /* Ce que la journée apporte : l'organisation le premier jour, une activité en détail au 3e et au 7e jour, la préparation du bilan le jour du rendez-vous. */
  const enPlus = [];
  if (premier) enPlus.push(['#/organisation', 'building', 'Mon organisation d’accueil', 'Quelques lignes sur l’organisation, à faire aujourd’hui', ok(p.org)]);
  if (rang === 3 || rang === 7) { const k = rang === 3 ? 0 : 1, a = p.act[k]; enPlus.push(['#/activite/' + k, 'clipboard-text', 'Une activité en détail', a && a.titre ? a.titre : 'Racontez une activité importante, en 5 questions', !!(a && a.titre)]); }
  if (rdv && rdv.date === d) enPlus.push(['#/competences', 'chart-dots', 'Rendez-vous de bilan aujourd’hui' + (rdv.h ? ' · ' + rdv.h : ''), 'Mes compétences doivent être prêtes', ok(p.comp)]);
  $('titre').textContent = 'Jour ' + (i + 1) + ' sur ' + dates.length;
  const coche = id => j.a.includes(id);
  const nbPole = n => j.a.filter(id => ACT[id] && ACT[id].pole === n).length;
  $('app').innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><a class="retour" href="#/jour/${dates[i - 1] || d}" ${i ? '' : 'style="visibility:hidden"'}><i class="ti ti-chevron-left"></i></a><b style="flex:1;text-align:center;font-size:17px">${esc(frJ(d))}</b><a class="retour" href="#/jour/${dates[i + 1] || d}" ${i < dates.length - 1 ? '' : 'style="visibility:hidden"'}><i class="ti ti-chevron-right"></i></a></div>
    <section class="bloc"><h3><span class="n">1</span>Ma présence</h3><div class="choix" id="pres">${PRESENCE.map(r => `<button type="button" class="${j.pr === r ? 'on' : ''}" data-pr="${r}">${r}</button>`).join('')}</div>
      <div id="motifZone" ${j.pr && j.pr !== PRESENCE[0] ? '' : 'hidden'}><label class="champ"><span>Pourquoi ? ${aideBtn('Une phrase suffit : rendez-vous médical, convention pas encore signée, transport… Pensez aussi à prévenir votre tuteur et le lycée.')}</span><input type="text" id="motif" maxlength="200" value="${esc(j.motif || '')}"></label></div></section>
    <div id="suite" ${ABSENT_JOUR(j.pr) ? 'hidden' : ''}>
    <section class="bloc" id="blocAccueil" ${premier ? '' : 'hidden'}><h3><span class="n">★</span>Mon accueil ${aideBtn('Votre premier jour dans l’organisation : comment avez-vous été accueilli ? Présentation de l’équipe, du poste, des consignes de sécurité…')}</h3><div class="choix" id="acc">${ACCUEIL1.map(r => `<button type="button" class="${j.acc === r ? 'on' : ''}" data-acc="${r}">${r}</button>`).join('')}</div>
      <textarea id="accT" maxlength="600" style="min-height:70px;margin-top:10px" placeholder="Ce qui s’est passé à mon arrivée">${esc(j.accT || '')}</textarea></section>
    ${enPlus.map(([h, ic, t2, s, f]) => `<a class="ligne enplus" href="${h}"><span class="ic"><i class="ti ti-${ic}"></i></span><span class="x"><b>${esc(t2)}</b><span>${esc(s)}</span></span><span class="puce ${f ? 'ok' : 'att'}">${f ? '✓ Fait' : 'Aujourd’hui'}</span></a>`).join('')}
    <section class="bloc"><h3><span class="n">2</span>Ma journée</h3><div class="choix" id="ress">${RESSENTI.map(r => `<button type="button" class="${j.r === r ? 'on' : ''}" data-r="${r}">${r}</button>`).join('')}</div>
      <textarea id="ressT" maxlength="600" style="min-height:60px;margin-top:10px" placeholder="Je précise (facultatif)">${esc(j.ressT || '')}</textarea></section>
    <section class="bloc"><h3><span class="n">3</span>Les activités réalisées ${aideBtn('Cochez ce que vous avez fait aujourd’hui. Les intitulés sont ceux du référentiel Bac Pro AGOrA et du compte rendu que remplit votre tuteur. Touchez ? pour un exemple.')}</h3>
      ${POLES.map(po => `<details class="pole" ${nbPole(po.n) || j.autres[po.n] ? 'open' : ''}><summary>Pôle ${po.n} · ${esc(po.t)}<span class="nb" data-nb="${po.n}">${nbPole(po.n) || ''}</span></summary><div class="sp">${po.sp.map(([c, t, l]) => `<small>${c} ${esc(t)}</small>${l.map(([id, lib, ex]) => `<div class="act"><input type="checkbox" id="a-${id}" data-a="${id}" ${coche(id) ? 'checked' : ''}><label for="a-${id}">${esc(lib)}</label>${aideBtn(ex)}</div>`).join('')}`).join('')}
        <small>Autre activité</small><input type="text" data-autre="${po.n}" maxlength="200" value="${esc(j.autres[po.n] || '')}" placeholder="Une activité de ce pôle qui n’est pas dans la liste"></div></details>`).join('')}
      <details class="pole" ${j.autres.x ? 'open' : ''}><summary>Autre · une activité hors des trois pôles</summary><div class="sp"><input type="text" data-autre="x" maxlength="200" value="${esc(j.autres.x || '')}" placeholder="Par exemple : visite d’un autre service"></div></details>
    </section>
    <section class="bloc"><h3><span class="n">4</span>Mon compte rendu ${aideBtn('Quelques phrases suffisent : ce qui vous a été confié, comment vous l’avez fait, ce que vous avez appris. Touchez un début de phrase pour l’ajouter.')}</h3>
      <div class="amorces">${AMORCES.map(a => `<button type="button" data-amorce="${esc(a)}">${esc(a)}</button>`).join('')}</div>
      <textarea id="texte" maxlength="1500" placeholder="Ce que j’ai fait aujourd’hui">${esc(j.t)}</textarea><div class="compte" id="cpt"></div></section></div>`;
  const cpt = () => { $('cpt').textContent = $('texte').value.length + ' / 1500'; };
  cpt();
  $('pres').onclick = e => { const b = e.target.closest('[data-pr]'); if (!b) return; j.pr = b.dataset.pr; $('pres').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); $('motifZone').hidden = j.pr === PRESENCE[0]; $('suite').hidden = ABSENT_JOUR(j.pr);
    const prem = dates.find(x => x === d ? !ABSENT_JOUR(j.pr) : p.jours[x] && !ABSENT_JOUR(p.jours[x].pr)) === d; $('blocAccueil').hidden = !prem; marquer(); };
  $('acc').onclick = e => { const b = e.target.closest('[data-acc]'); if (!b) return; j.acc = b.dataset.acc; $('acc').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); marquer(); };
  $('app').querySelectorAll('[data-autre]').forEach(x => x.oninput = () => { j.autres[x.dataset.autre] = x.value; marquer(); });
  ['motif', 'accT', 'ressT'].forEach(k => { $(k).oninput = () => { j[k] = $(k).value; marquer(); }; });
  $('ress').onclick = e => { const b = e.target.closest('[data-r]'); if (!b) return; j.r = b.dataset.r; $('ress').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); marquer(); };
  $('app').querySelectorAll('[data-a]').forEach(c => c.onchange = () => { const id = c.dataset.a; j.a = c.checked ? j.a.concat(id) : j.a.filter(x => x !== id); const n = ACT[id].pole; $('app').querySelector(`[data-nb="${n}"]`).textContent = nbPole(n) || ''; marquer(); });
  $('app').querySelectorAll('[data-amorce]').forEach(b => b.onclick = () => { const t = $('texte'); t.value = (t.value.trim() ? t.value.trim() + '\n' : '') + b.dataset.amorce + ' '; t.focus(); t.setSelectionRange(t.value.length, t.value.length); cpt(); marquer(); });
  $('texte').oninput = () => { j.t = $('texte').value; cpt(); marquer(); };
  enregistrer(() => { j.t = $('texte').value; p.jours[d] = j; });
}

/* ── Une activité décrite en détail : le modèle de compte rendu d'activité AGOrA. ── */
function ecranActivite(i) {
  const p = P(), a = Object.assign({ titre: '', sp: '' }, p.act[i] || {});
  $('titre').textContent = 'Activité décrite n° ' + (i + 1);
  $('app').innerHTML = `<section class="bloc"><h3>L’activité ${aideBtn('Choisissez une activité importante de votre stage, celle que vous savez le mieux expliquer.')}</h3>
      <label class="champ"><span>Intitulé</span><input type="text" id="f-titre" maxlength="120" value="${esc(a.titre)}" placeholder="Par exemple : traitement du courrier entrant"></label>
      <label class="champ"><span>Sous-pôle du référentiel</span><select id="f-sp"><option value="">Choisir</option>${POLES.map(po => po.sp.map(([c, t]) => `<option value="${c}" ${a.sp === c ? 'selected' : ''}>${c} ${esc(t)}</option>`).join('')).join('')}</select></label></section>
    ${Q5.map(([k, q, ex], n) => `<section class="bloc"><h3><span class="n">${n + 1}</span>${esc(q)} ${aideBtn(ex)}</h3><textarea data-k="${k}" maxlength="800" style="min-height:80px">${esc(a[k] || '')}</textarea></section>`).join('')}`;
  $('app').oninput = () => marquer(); $('app').onchange = () => marquer();
  enregistrer(() => { a.titre = $('f-titre').value.trim(); a.sp = $('f-sp').value; $('app').querySelectorAll('[data-k]').forEach(t => { a[t.dataset.k] = t.value; }); p.act[i] = a; });
}

/* ── L'organisation d'accueil (PFMP 2 : même organisation ou non). ── */
function ecranOrg() {
  const p = P(), o = Object.assign({}, p.org);
  $('titre').textContent = 'Mon organisation d’accueil';
  const meme = D.periode === 'p2' ? `<section class="bloc"><h3>Même organisation qu’en PFMP 1 ?</h3><div class="choix" id="meme">${['Oui', 'Non'].map(x => `<button type="button" class="${p.meme === x ? 'on' : ''}" data-m="${x}">${x}</button>`).join('')}</div></section>` : '';
  const C = [['nom', 'Nom de l’organisation', ''], ['secteur', 'Secteur', 'Entreprise privée, administration, association…'], ['activite', 'Activité principale', 'Ce que l’organisation produit ou propose.'], ['service', 'Mon service', 'Le service où vous travaillez : accueil, comptabilité, ressources humaines…'], ['tuteur', 'Fonction de mon tuteur', 'Le poste de votre tuteur, pas son nom.'], ['effectif', 'Nombre de salariés', 'Une estimation suffit.']];
  $('app').innerHTML = meme + `<section class="bloc">${C.map(([k, l, ex]) => `<label class="champ"><span>${esc(l)} ${ex ? aideBtn(ex) : ''}</span><input type="text" data-k="${k}" maxlength="120" value="${esc(o[k] || '')}"></label>`).join('')}</section>`;
  if ($('meme')) $('meme').onclick = e => { const b = e.target.closest('[data-m]'); if (!b) return; p.meme = b.dataset.m; if (b.dataset.m === 'Oui' && !Object.keys(o).length) { Object.assign(o, D.p1.org); ecranOrgRemplir(o); } $('meme').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); marquer(); };
  $('app').oninput = () => marquer();
  enregistrer(() => { $('app').querySelectorAll('[data-k]').forEach(t => { o[t.dataset.k] = t.value.trim(); }); p.org = o; });
}
function ecranOrgRemplir(o) { $('app').querySelectorAll('[data-k]').forEach(t => { t.value = o[t.dataset.k] || ''; }); }

/* ── Les six compétences transversales. ── */
function ecranComp() {
  const p = P(), c = Object.assign({}, p.comp);
  $('titre').textContent = 'Mes compétences';
  $('app').innerHTML = `<section class="bloc" style="font-size:14px;color:var(--muted)">Les mêmes six compétences que le compte rendu de votre tuteur. Positionnez-vous honnêtement : la comparaison avec son avis fait partie du bilan.</section>` +
    TRANSV.map(([k, t, ex]) => `<section class="bloc"><h3 style="margin-bottom:4px">${esc(t)} ${aideBtn(ex)}</h3><div class="niveaux" data-c="${k}">${NIVEAUX.map(n => `<button type="button" class="${c[k] === n ? 'on' : ''}">${n}</button>`).join('')}</div></section>`).join('');
  $('app').querySelectorAll('[data-c]').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; c[g.dataset.c] = b.textContent; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); marquer(); });
  enregistrer(() => { p.comp = c; });
}

/* ── L'avis sur l'accueil (annexe 4). ── */
function ecranAccueil() {
  const p = P(), a = Object.assign({}, p.accueil);
  $('titre').textContent = 'Mon avis sur l’accueil';
  $('app').innerHTML = `<section class="bloc" style="font-size:14px;color:var(--muted)">Annexe 4 de la convention de stage. Cet avis ne compte ni dans la note ni pour le diplôme.</section>` +
    ACCUEIL.map((q, i) => `<section class="bloc"><h3 style="font-size:15px;margin-bottom:4px">${esc(q)}</h3><div class="niveaux" data-q="${i}">${SATIS.map(s => `<button type="button" class="${a[i] === s ? 'on' : ''}">${s}</button>`).join('')}</div></section>`).join('') +
    `<section class="bloc"><h3>Observations</h3><textarea id="obs" maxlength="600">${esc(a.obs || '')}</textarea></section>`;
  $('app').querySelectorAll('[data-q]').forEach(g => g.onclick = e => { const b = e.target.closest('button'); if (!b) return; a[g.dataset.q] = b.textContent; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); marquer(); });
  $('obs').oninput = () => marquer();
  $('app').insertAdjacentHTML('beforeend', `<button class="rapport-btn" id="envoyerAvis" style="background:var(--b)"><i class="ti ti-send"></i> ${p.accueilEnvoye ? 'Envoyé le ' + esc(p.accueilEnvoye) : 'Envoyer à mon référent et à mon professeur principal'}</button>`);
  $('envoyerAvis').onclick = () => { if (Object.keys(a).filter(k => k !== 'obs').length < ACCUEIL.length) { toast('Répondez aux 10 questions avant d’envoyer.'); return; } a.obs = $('obs').value; p.accueil = a; p.accueilEnvoye = new Date().toLocaleDateString('fr-FR'); p.majLe = new Date().toISOString(); p._local = true; modifie = false; garder().then(ok => { toast(ok ? 'Envoyé à votre référent et à votre professeur principal' : 'Gardé sur cet appareil : envoi dès que possible'); rendre(); }); };
  enregistrer(() => { a.obs = $('obs').value; p.accueil = a; });
}

/* ── Le bilan. ── */
function ecranBilan() {
  const p = P(), b = Object.assign({}, p.bilan);
  $('titre').textContent = 'Mon bilan · entretien avec mon référent';
  const Q = [['appris', 'Ce que j’ai appris', 'Les savoir-faire et les connaissances acquis pendant le stage.'], ['reussi', 'Ce que je réussis le mieux', 'Une ou deux activités où vous êtes à l’aise.'], ['progres', 'Ce que je dois améliorer', 'Une ou deux pistes de progrès, avec un moyen d’y arriver.'], ['projet', 'Mon projet après ce stage', 'Ce que ce stage confirme ou change dans votre projet.']];
  $('app').innerHTML = Q.map(([k, q, ex], n) => `<section class="bloc"><h3><span class="n">${n + 1}</span>${esc(q)} ${aideBtn(ex)}</h3><textarea data-k="${k}" maxlength="800" style="min-height:80px">${esc(b[k] || '')}</textarea></section>`).join('');
  $('app').oninput = () => marquer();
  enregistrer(() => { $('app').querySelectorAll('[data-k]').forEach(t => { b[t.dataset.k] = t.value; }); p.bilan = b; });
}

/* ── Le rapport : une vraie feuille, prête à imprimer ou à enregistrer en PDF. ── */
function ecranRapport() {
  const p = P(), per = PERIODES[D.periode] || { lib: 'PFMP' }, dates = datesDe(D.periode), o = p.org || {};
  if (!dates.length) { $('app').innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px">Ce carnet n’est pas encore ouvert.</p>'; return; }
  $('titre').textContent = LECTURE ? 'Rapport de stage · ' + CODE : 'Mon rapport de stage';
  const jours = dates.filter(d => p.jours[d]);
  const compte = {}; jours.forEach(d => (p.jours[d].a || []).forEach(id => { compte[id] = (compte[id] || 0) + 1; }));
  const autres = []; jours.forEach(d => Object.entries(p.jours[d].autres || {}).forEach(([k, v]) => { if (v && v.trim()) autres.push([k === 'x' ? 'Autre' : 'Pôle ' + k, v.trim(), d]); }));
  const presents = jours.filter(d => !ABSENT_JOUR(p.jours[d].pr)), absences = jours.filter(d => p.jours[d].pr && p.jours[d].pr !== PRESENCE[0]);
  const jAcc = jours.find(d => p.jours[d].acc);
  const sec = (t, h) => `<h2>${t}</h2>${h}`;
  const vide = '<p style="color:#888">Non renseigné.</p>';
  $('app').innerHTML = `<div class="actions-r"><button class="pri" onclick="print()"><i class="ti ti-file-download"></i> Enregistrer en PDF ou imprimer</button></div>
  <article class="feuille" style="margin-top:12px">
    <div class="garde"><small>Baccalauréat professionnel AGOrA · Seconde · ${per.lib}</small><h1>Rapport de période de formation en milieu professionnel</h1>
      <p>${esc(o.nom || 'Organisation d’accueil')} · ${esc(o.service || 'service')}</p><p>Du ${esc(frJ(dates[0]))} au ${esc(frJ(dates[dates.length - 1]))} · ${jours.length} journée${jours.length > 1 ? 's' : ''} renseignée${jours.length > 1 ? 's' : ''}</p></div>
    ${sec('1. L’organisation d’accueil', Object.keys(o).length ? `<table><tr><th>Secteur</th><td>${esc(o.secteur)}</td></tr><tr><th>Activité principale</th><td>${esc(o.activite)}</td></tr><tr><th>Service</th><td>${esc(o.service)}</td></tr><tr><th>Fonction du tuteur</th><td>${esc(o.tuteur)}</td></tr><tr><th>Effectif</th><td>${esc(o.effectif)}</td></tr></table>` : vide)}
    ${sec('2. Présence et accueil', `<table><tr><th>Jours de présence en entreprise</th><td>${presents.length} sur ${dates.length}</td></tr>${absences.map(d => `<tr><th>${esc(frJ(d))}</th><td>${esc(p.jours[d].pr)}${p.jours[d].motif ? ' · ' + esc(p.jours[d].motif) : ''}</td></tr>`).join('')}${jAcc ? `<tr><th>Mon accueil (${esc(frJ(jAcc))})</th><td>${esc(p.jours[jAcc].acc)}${p.jours[jAcc].accT ? ' · ' + esc(p.jours[jAcc].accT) : ''}</td></tr>` : ''}</table>`)}
    ${sec('3. Les activités réalisées', Object.keys(compte).length || autres.length ? `<table><tr><th>Référentiel</th><th>Activité</th><th>Jours</th></tr>${Object.keys(compte).sort((a, b) => ACT[a].sp.localeCompare(ACT[b].sp)).map(id => `<tr><td>${ACT[id].sp}</td><td>${esc(ACT[id].lib)}</td><td>${compte[id]}</td></tr>`).join('')}${autres.map(([k, v, d]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td><td>${esc(frC(d))}</td></tr>`).join('')}</table>` : vide)}
    ${sec('4. Le journal de bord', presents.length ? `<table><tr><th style="width:24%">Jour</th><th>Compte rendu</th></tr>${presents.map(d => `<tr><td>${esc(frJ(d))}${p.jours[d].r ? `<br><span style="color:#666">${esc(p.jours[d].r === 'Autre' ? 'Ma journée' : 'Journée : ' + p.jours[d].r.toLowerCase())}</span>` : ''}</td><td>${esc(p.jours[d].t || '')}${p.jours[d].ressT ? `<br><i style="color:#555">${esc(p.jours[d].ressT)}</i>` : ''}</td></tr>`).join('')}</table>` : vide)}
    ${sec('5. Activités décrites', p.act.filter(a => a && a.titre).map(a => `<p><b>${esc(a.titre)}</b>${a.sp ? ' · ' + esc(a.sp) : ''}</p><table>${Q5.map(([k, q]) => `<tr><th style="width:30%">${esc(q)}</th><td>${esc(a[k] || '')}</td></tr>`).join('')}</table>`).join('') || vide)}
    ${sec('6. Mes compétences', Object.keys(p.comp).length ? `<table><tr><th>Compétence</th><th>Mon positionnement</th></tr>${TRANSV.map(([k, t]) => `<tr><td>${esc(t)}</td><td>${esc(p.comp[k] || '—')}</td></tr>`).join('')}</table>` : vide)}
    ${sec('7. Mon bilan, pour l’entretien avec mon référent', Object.keys(p.bilan).length ? [['appris', 'Ce que j’ai appris'], ['reussi', 'Ce que je réussis le mieux'], ['progres', 'Ce que je dois améliorer'], ['projet', 'Mon projet']].map(([k, t]) => `<p><b>${t}.</b> ${esc(p.bilan[k] || '')}</p>`).join('') : vide)}
    <div class="sign"><div>Signature de l’élève</div><div>Visa de l’enseignant référent</div></div>
  </article>`;
}
brancher(); rendre();
