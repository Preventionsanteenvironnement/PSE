/* ═══════════════════════════════════════════════════════════════════════════
   MON STAGE PFMP — rubrique du carnet (mapse.fr › Mon espace › carnet PFMP)
   La frise du stage, de la recherche de l'entreprise au bilan, pour les deux PFMP.
   Ce que l'élève coche arrive en direct chez son enseignant référent
   (coordination-pedagogie/suivi-pfmp/) et chez le professeur principal (Atelier).

   Base : projet Firestore « coordination-pedagogie », collection coordination_pfmp_suivi.
   La base de mapse.fr (« devoirs-pse ») n'est ni lue ni écrite ici.
   Aucun nom, aucun lieu : un code, un type de structure, un secteur.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const P = window.PFMP_COMMUN;
  if (!P) return;
  const CFG = {
    apiKey: 'AIzaSyBj_GXG8ln3GAxNXxiJkT2HPSWIHJpc1lA', authDomain: 'coordination-pedagogie.firebaseapp.com',
    projectId: 'coordination-pedagogie', storageBucket: 'coordination-pedagogie.firebasestorage.app',
    messagingSenderId: '526058585010', appId: '1:526058585010:web:ba4dd6d9c8281ba5bf02ab'
  };
  const ANNEE = P.anneeScolaire();
  const STRUCTURES = ['Entreprise privée', 'Association', 'Collectivité (mairie, département…)', 'Administration de l’État', 'Établissement de santé', 'Établissement scolaire', 'Autre'];
  const REPONSES = { attente: 'En attente', entretien: 'Entretien prévu', refus: 'Refus', accord: 'Accord' };
  const MOYENS = { appel: 'Appel', mail: 'Mail', visite: 'Sur place', courrier: 'Courrier', autre: 'Autre' };

  let svc = null, code = '', etat = 'attente';
  const suivis = {}, arrets = [];
  let periode = 1, msgs = [], arretMsgs = null, formOuvert = '';
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const auj = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const fr = s => s ? new Date(s.length === 10 ? s + 'T12:00:00' : s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
  const frLong = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const dire = m => (typeof window.toast === 'function' ? window.toast(m) : console.log(m));

  /* ── Style de la rubrique (couleurs du carnet) ─────────────────────── */
  const css = document.createElement('style');
  css.textContent = `
  #sec-monstage .ms-hero{display:grid;grid-template-columns:auto 1fr;gap:1.2rem;align-items:center;background:linear-gradient(135deg,var(--p500),var(--p700));color:#fff;border-radius:var(--radl);padding:1.2rem 1.4rem;margin-bottom:1rem}
  #sec-monstage .ms-n{font-family:'Space Grotesk';font-size:3.2rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
  #sec-monstage .ms-n small{display:block;font-size:.85rem;font-weight:500;opacity:.9;margin-top:.3rem}
  #sec-monstage .ms-hero h2{color:#fff;font-size:1.25rem;margin:0}
  #sec-monstage .ms-hero p{margin:.2rem 0 0;opacity:.95;font-size:.92rem}
  #sec-monstage .ms-flags{display:flex;gap:.45rem;margin-top:.6rem}
  #sec-monstage .ms-flags span{width:34px;height:34px;border-radius:50%;border:2px solid rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;font-size:1.05rem;color:rgba(255,255,255,.7)}
  #sec-monstage .ms-flags span.ok{background:#fff;color:var(--ok);border-color:#fff}
  #sec-monstage .ms-tabs{display:flex;gap:.5rem;margin-bottom:.9rem;flex-wrap:wrap}
  #sec-monstage .ms-tabs button{border:1.5px solid var(--line);background:#fff;border-radius:var(--radf);padding:.4rem 1rem;font-weight:600;cursor:pointer;font-family:inherit;color:var(--ink)}
  #sec-monstage .ms-tabs button.on{background:var(--ink);color:#fff;border-color:var(--ink)}
  #sec-monstage .ms-route{display:flex;align-items:flex-start;gap:0;margin:.4rem 0 1rem;overflow-x:auto;padding-bottom:.3rem}
  #sec-monstage .ms-ph{flex:1;min-width:84px;text-align:center;position:relative;font-size:.78rem;color:var(--muted);padding-top:2.4rem}
  #sec-monstage .ms-ph::before{content:"";position:absolute;top:1rem;left:-50%;right:50%;height:4px;background:var(--line)}
  #sec-monstage .ms-ph:first-child::before{display:none}
  #sec-monstage .ms-ph i.ti{position:absolute;top:0;left:50%;transform:translateX(-50%);width:2.1rem;height:2.1rem;border-radius:50%;background:#fff;border:2.5px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:1rem;z-index:1}
  #sec-monstage .ms-ph.fait::before,#sec-monstage .ms-ph.cour::before{background:var(--ok)}
  #sec-monstage .ms-ph.fait i.ti{background:var(--ok);border-color:var(--ok);color:#fff}
  #sec-monstage .ms-ph.cour i.ti{border-color:var(--p500);color:var(--p600);background:var(--p50)}
  #sec-monstage .ms-ph.cour{color:var(--ink);font-weight:700}
  #sec-monstage .ms-item{display:flex;gap:.8rem;align-items:center;padding:.75rem 0;border-top:1px solid var(--line2);flex-wrap:wrap}
  #sec-monstage .ms-item:first-of-type{border-top:none}
  #sec-monstage .ms-item .ms-t{flex:1;min-width:200px;font-weight:600}
  #sec-monstage .ms-item .ms-d{display:block;font-weight:400;font-size:.85rem;color:var(--muted)}
  #sec-monstage .ms-item .ms-d.err{color:var(--err);font-weight:600}
  #sec-monstage .ms-chip{display:inline-flex;gap:.25rem;align-items:center;font-size:.78rem;font-weight:700;border-radius:var(--radf);padding:.1rem .6rem;background:var(--line2);color:var(--ink2);white-space:nowrap}
  #sec-monstage .ms-chip.soon{background:var(--warn-s);color:var(--warn)}
  #sec-monstage .ms-chip.late{background:var(--err-s);color:var(--err)}
  #sec-monstage .ms-chip.ok{background:var(--ok-s);color:var(--ok)}
  #sec-monstage .ms-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:.6rem;width:100%;background:var(--p50);border-radius:var(--rad);padding:.8rem;margin-top:.4rem}
  #sec-monstage .ms-form label{font-size:.8rem;font-weight:600;color:var(--ink2);display:flex;flex-direction:column;gap:.2rem}
  #sec-monstage .ms-form input,#sec-monstage .ms-form select,#sec-monstage textarea{font:inherit;font-size:.95rem;border:1.5px solid var(--line);border-radius:10px;padding:.45rem .6rem;background:#fff}
  #sec-monstage .ms-form .ms-actions{grid-column:1/-1;display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap}
  #sec-monstage .ms-note{font-size:.8rem;color:var(--muted);grid-column:1/-1}
  #sec-monstage .ms-visite{display:flex;gap:1rem;align-items:center}
  #sec-monstage .ms-cal{width:62px;height:62px;border-radius:16px;background:var(--ok);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Space Grotesk';font-weight:700;font-size:1.5rem;line-height:1}
  #sec-monstage .ms-cal small{font-size:.75rem;font-weight:600;margin-top:.15rem}
  #sec-monstage .ms-fil{display:flex;flex-direction:column;gap:.5rem;max-height:340px;overflow:auto;margin-bottom:.6rem}
  #sec-monstage .ms-msg{max-width:85%;padding:.5rem .8rem;border-radius:14px;font-size:.92rem;white-space:pre-wrap;overflow-wrap:anywhere}
  #sec-monstage .ms-msg small{display:block;font-size:.72rem;opacity:.75}
  #sec-monstage .ms-msg.eleve{align-self:flex-end;background:var(--p100);color:var(--p700)}
  #sec-monstage .ms-msg.referent,#sec-monstage .ms-msg.pp{align-self:flex-start;background:var(--b1s);color:#1b3f8a}
  #sec-monstage .ms-ecrire{display:flex;gap:.5rem}
  #sec-monstage .ms-ecrire textarea{flex:1;min-height:46px;resize:vertical}
  #sec-monstage .ms-pistes{width:100%;border-collapse:collapse;font-size:.9rem}
  #sec-monstage .ms-pistes td,#sec-monstage .ms-pistes th{padding:.45rem .5rem;border-top:1px solid var(--line2);text-align:left}
  #sec-monstage .ms-pistes th{font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;border-top:none}
  #sec-monstage .ms-wrap{overflow-x:auto}
  #sec-monstage details.ms-tout>summary{cursor:pointer;font-weight:700;padding:.3rem 0}
  #sec-monstage .ms-badge{display:inline-flex;align-items:center;justify-content:center;min-width:1.3rem;height:1.3rem;border-radius:999px;background:var(--p500);color:#fff;font-size:.72rem;font-weight:700;margin-left:auto;padding:0 .35rem}
  @media(max-width:640px){#sec-monstage .ms-hero{grid-template-columns:1fr}#sec-monstage .ms-n{font-size:2.6rem}}
  `;
  document.head.appendChild(css);

  /* ── Entrée dans le menu du carnet ─────────────────────────────────── */
  const nav = $('nav');
  const sec = document.createElement('section');
  sec.className = 'section'; sec.id = 'sec-monstage';
  $('main').insertBefore(sec, $('sec-dash'));
  const btn = document.createElement('button');
  btn.dataset.sec = 'monstage';
  btn.innerHTML = '<span class="ic"><i class="ti ti-route"></i></span> Mon stage PFMP <span class="ms-badge" id="msBadge" hidden></span>';
  const lbl = document.createElement('div'); lbl.className = 'navlbl'; lbl.textContent = 'Mon stage';
  const sep = document.createElement('div'); sep.className = 'divider';
  nav.insertBefore(sep, nav.firstChild); nav.insertBefore(btn, nav.firstChild); nav.insertBefore(lbl, nav.firstChild);
  nav.addEventListener('click', e => { if (e.target.closest('button[data-sec="monstage"]')) rendre(); });

  /* ── Connexion ─────────────────────────────────────────────────────── */
  async function base() {
    if (svc) return svc;
    for (let i = 0; i < 40 && !window.__PFMP_SHIM__ && !(window.firebase && window.firebase.firestore); i++) await new Promise(r => setTimeout(r, 250));
    if (window.__PFMP_SHIM__) { svc = P.service(P.depotCompat(window.__PFMP_SHIM__)); return svc; }
    if (!(window.firebase && window.firebase.firestore)) throw new Error('Connexion impossible.');
    const fb = window.firebase;
    const app = (fb.apps || []).find(a => a.name === 'pfmp-suivi') || fb.initializeApp(CFG, 'pfmp-suivi');
    svc = P.service(P.depotCompat(app.firestore()));
    return svc;
  }
  function couper() { arrets.splice(0).forEach(f => { try { f(); } catch (e) {} }); if (arretMsgs) { arretMsgs(); arretMsgs = null; } Object.keys(suivis).forEach(k => delete suivis[k]); msgs = []; }
  async function brancher(c) {
    couper(); code = c; etat = 'attente'; rendre();
    if (!c) return;
    let s;
    try { s = await base(); } catch (e) { etat = 'erreur'; rendre(); return; }
    let recus = 0;
    [1, 2].forEach(n => {
      let id; try { id = P.suiviId(ANNEE, c, n); } catch (e) { recus++; return; }
      arrets.push(s.ecouterSuivi(id, d => {
        if (d) suivis[n] = d; else delete suivis[n];
        if (++recus >= 2 || etat === 'pret') etat = 'pret';
        if (!suivis[periode] && suivis[1]) periode = 1; else if (!suivis[periode] && suivis[2]) periode = 2;
        ecouterMessages(); rendre();
      }, () => { recus++; etat = recus >= 2 && !Object.keys(suivis).length ? 'erreur' : etat; rendre(); }));
    });
  }
  function ecouterMessages() {
    const sv = suivis[periode];
    if (!sv || (arretMsgs && arretMsgs.pour === sv.id)) return;
    if (arretMsgs) arretMsgs();
    msgs = [];
    arretMsgs = svc.ecouterMessages(sv.id, l => { msgs = l; rendreFil(); }, () => {});
    arretMsgs.pour = sv.id;
  }
  function codeCourant() { try { return (localStorage.getItem('codeEleve') || '').trim().toUpperCase(); } catch (e) { return ''; } }
  setInterval(() => { const c = codeCourant(); if (c !== code) brancher(c); }, 1500);

  /* ── Écran ─────────────────────────────────────────────────────────── */
  function compte(s) {
    const t = auj(); if (!s.debut) return { n: '—', l: 'dates à venir' };
    const a = P.ecartJours(t, s.debut), b = P.ecartJours(t, s.fin);
    if (a > 0) return { n: a, l: a > 1 ? 'jours avant le départ' : 'jour avant le départ' };
    if (b >= 0) return { n: b, l: 'jours avant la fin du stage' };
    return { n: '✓', l: 'stage terminé' };
  }
  function chipEcheance(et, s) {
    const ec = P.echeance(et, s); if (!ec) return '';
    const n = P.ecartJours(auj(), ec.date);
    return `<span class="ms-chip ${n < 0 ? 'late' : n <= 7 ? 'soon' : ''}"><i class="ti ti-calendar"></i> ${fr(ec.date)}${n < 0 ? ' · en retard' : n === 0 ? ' · aujourd’hui' : ' · J−' + n}</span>`;
  }
  /* La frise de l'élève avance sur SES étapes : une phase est passée quand ses étapes
     à lui sont faites, ou quand il a déjà commencé une phase suivante. Il ne voit à faire
     que les étapes de la phase en cours : la pré-convention vient après l'entreprise validée. */
  function routeEleve(s) {
    const pourEleve = e => !e.opt && (e.ty === 'declare' || e.ty === 'info' || e.id === 'referent' || (e.ty === 'remise' && (e.from === 'eleve' || e.to === 'eleve')));
    const activite = P.EN_LIGNE.filter(e => pourEleve(e) && P.entree(s, e.id).e).map(e => e.ph);
    const plusLoin = activite.length ? Math.max(...activite) : -1;
    const phFaite = ph => ph < plusLoin || P.EN_LIGNE.filter(e => e.ph === ph && pourEleve(e)).every(e => P.estFaite(s, e.id));
    let courante = P.PHASES.findIndex((_, ph) => !phFaite(ph));
    if (courante < 0) courante = P.PHASES.length - 1;
    return { phFaite, courante };
  }
  const ICONES_PH = ['flag-3', 'search', 'file-pencil', 'signature', 'backpack', 'briefcase', 'trophy'];

  function rendre() {
    const el = $('sec-monstage'); if (!el) return;
    const garde = {};
    el.querySelectorAll('input[id],textarea[id],select[id]').forEach(x => { garde[x.id] = x.value; });
    el.innerHTML = contenu();
    Object.entries(garde).forEach(([k, v]) => { const x = $(k); if (x && x.tagName !== 'SELECT' && !x.value && v) x.value = v; });
    rendreFil();
    const b = $('msBadge'); const s = suivis[periode];
    const n = s ? P.aFaire(s, 'eleve').filter(et => et.ph <= routeEleve(s).courante).length : 0;
    if (b) { b.hidden = !n; b.textContent = n; }
  }

  function contenu() {
    if (!code) return `<div class="welcome"><h2>Mon stage PFMP</h2><p>La frise de votre stage, étape par étape, partagée avec votre enseignant référent.</p></div>
      <div class="card"><p>Connectez-vous avec votre code élève pour voir votre stage.</p><button class="btn pri" onclick="document.getElementById('btnConnect').click()"><i class="ti ti-login-2"></i> Se connecter</button></div>`;
    if (etat === 'attente') return '<div class="card"><p>Chargement de votre stage…</p></div>';
    if (etat === 'erreur') return '<div class="card"><p>Le suivi de stage est indisponible pour le moment. Réessayez plus tard.</p></div>';
    if (!suivis[1] && !suivis[2]) return `<div class="welcome"><h2>Mon stage PFMP</h2><p>Code ${esc(code)}</p></div><div class="card"><p>Votre suivi de stage n’est pas encore ouvert. Votre professeur principal l’ouvrira avant la recherche d’entreprise.</p></div>`;
    const s = suivis[periode] || suivis[1] || suivis[2];
    const c = compte(s);
    const flags = P.drapeaux(s).map(d => `<span class="${d.ok ? 'ok' : ''}" title="${esc(d.label)}"><i class="ti ti-${d.label === 'Arrivée' ? 'trophy' : 'flag'}"></i></span>`).join('');
    const tabs = [1, 2].filter(n => suivis[n]).map(n => `<button class="${n === periode ? 'on' : ''}" data-ms="periode" data-n="${n}">${esc(suivis[n].libelle || 'PFMP ' + n)} · ${fr(suivis[n].debut)}</button>`).join('');
    const { phFaite, courante } = routeEleve(s);
    const route = P.PHASES.map((nom, ph) => {
      const fait = phFaite(ph);
      return `<div class="ms-ph ${fait ? 'fait' : ph === courante ? 'cour' : ''}"><i class="ti ti-${fait ? 'check' : ICONES_PH[ph]}"></i>${esc(nom)}</div>`;
    }).join('');

    const aFaire = P.aFaire(s, 'eleve').filter(et => et.ph <= courante);
    const enAttente = P.EN_LIGNE.filter(et => { const e = P.entree(s, et.id).e; return (e === 'declare' && et.verif) || (e === 'remis' && et.from === 'eleve'); });
    const infos = P.EN_LIGNE.filter(et => et.voit && P.estFaite(s, et.id)).slice(-3).reverse();
    const v = s.visite || {};

    return `
    <div class="ms-tabs">${tabs}</div>
    <div class="ms-hero">
      <div class="ms-n">${esc(c.n)}<small>${esc(c.l)}</small></div>
      <div><h2>${esc(s.libelle || 'PFMP')} · du ${frLong(s.debut)} au ${frLong(s.fin)}</h2>
        <p>${s.refSigle ? 'Enseignant référent : ' + esc(s.refSigle) + ' · ' : ''}dernier jour de cours avant le départ : ${frLong(s.dernierJour)}</p>
        <div class="ms-flags">${flags}</div></div>
    </div>
    <div class="ms-route" aria-label="Les étapes du stage">${route}</div>

    <div class="card"><h3><i class="ti ti-hand-finger"></i> Maintenant</h3>
      ${aFaire.length ? aFaire.map(et => ligneEleve(s, et)).join('') : '<p class="hint" style="margin:0">Rien à faire pour le moment.</p>'}
    </div>

    ${enAttente.length ? `<div class="card"><h3><i class="ti ti-hourglass"></i> Vérification en cours</h3>${enAttente.map(et => `<div class="ms-item"><span class="ms-t">${esc(et.te || et.t)}<span class="ms-d">Envoyé le ${fr(P.entree(s, et.id).le)} · votre enseignant référent vérifie</span></span><span class="ms-chip soon">en attente</span></div>`).join('')}</div>` : ''}

    ${v.le ? `<div class="card"><h3><i class="ti ti-calendar-event"></i> Visite de l’enseignant référent</h3><div class="ms-visite"><div class="ms-cal"><i class="ti ti-calendar-check"></i></div><div><b>${esc(v.le)}</b><div class="hint" style="margin:0">${esc(v.type || 'Visite')} · date confirmée avec le tuteur</div></div></div></div>` : ''}

    ${infos.length ? `<div class="card"><h3><i class="ti ti-info-circle"></i> Du côté du lycée</h3>${infos.map(et => `<div class="ms-item"><span class="ms-t">${esc(et.voit)}<span class="ms-d">${fr(P.entree(s, et.id).le)}</span></span><span class="ms-chip ok"><i class="ti ti-check"></i></span></div>`).join('')}</div>` : ''}

    ${courante <= 1 ? pistesHtml(s) : ''}

    <div class="card"><h3><i class="ti ti-messages"></i> Messages avec mon enseignant référent</h3>
      <div class="ms-fil" id="msFil"></div>
      <form class="ms-ecrire" data-ms="message"><label class="sr" for="msTexte" style="position:absolute;left:-9999px">Message</label><textarea id="msTexte" maxlength="1000" placeholder="Votre message"></textarea><button class="btn pri" type="submit"><i class="ti ti-send"></i> Envoyer</button></form>
      <p class="hint" style="margin:.5rem 0 0">Pas de nom d’entreprise ni d’adresse : votre enseignant référent les connaît par la pré-convention.</p>
    </div>

    <div class="card"><details class="ms-tout"><summary>Tout le parcours (${P.avancement(s).faits} étapes sur ${P.avancement(s).total})</summary>
      ${P.PHASES.map((nom, ph) => `<h4 style="margin:.9rem 0 .2rem">${ph + 1}. ${esc(nom)}</h4>` + P.EN_LIGNE.filter(e => e.ph === ph && e.ty !== 'journal').map(et => {
        const en = P.entree(s, et.id), fait = P.estFaite(s, et.id);
        return `<div class="ms-item"><span class="ms-t" style="font-weight:500">${esc(et.te || et.t)}${en.e === 'corriger' ? `<span class="ms-d err">À corriger : ${esc(en.motif || '')}</span>` : ''}</span>${fait ? '<span class="ms-chip ok"><i class="ti ti-check"></i> ' + fr(en.le) + '</span>' : en.e ? '<span class="ms-chip soon">en cours</span>' : chipEcheance(et, s)}</div>`;
      }).join('')).join('')}
    </details></div>`;
  }

  function ligneEleve(s, et) {
    const en = P.entree(s, et.id);
    const acts = P.actions(et, en, 'eleve').filter(a => a !== 'annuler');
    const corr = en.e === 'corriger' ? `<span class="ms-d err"><i class="ti ti-alert-triangle"></i> À corriger : ${esc(en.motif || '')}</span>` : '';
    const remisParRef = et.ty === 'remise' && et.to === 'eleve' && en.e === 'remis' ? '<span class="ms-d">Votre enseignant référent indique vous l’avoir remis.</span>' : '';
    let boutons;
    if (et.id === 'search') {
      boutons = formOuvert === 'search' ? '' : `<button class="btn pri sm" data-ms="ouvrir" data-etape="search"><i class="ti ti-flag"></i> J’ai trouvé</button>`;
    } else if (et.id === 'midpoint') {
      boutons = `<button class="btn sm" data-ms="agir" data-etape="midpoint" data-action="declarer" data-v="ok"><i class="ti ti-mood-smile"></i> Ça va</button><button class="btn sm" data-ms="agir" data-etape="midpoint" data-action="declarer" data-v="difficulte"><i class="ti ti-alert-circle"></i> J’ai une difficulté</button>`;
    } else {
      boutons = acts.map(a => `<button class="btn pri sm" data-ms="agir" data-etape="${et.id}" data-action="${a}">${esc(P.libelleAction(a, 'eleve', et))}</button>`).join('');
    }
    const form = et.id === 'search' && formOuvert === 'search' ? `<form class="ms-form" data-ms="trouve">
      <label>Type de structure<select id="msStruct">${STRUCTURES.map(x => `<option${s.trouve && s.trouve.structure === x ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>
      <label>Secteur d’activité<input id="msSecteur" maxlength="80" placeholder="ex. accueil, comptabilité, logistique" value="${esc((s.trouve && s.trouve.secteur) || '')}"></label>
      <p class="ms-note"><i class="ti ti-shield-lock"></i> Ni nom d’entreprise, ni adresse : ils figurent sur la pré-convention.</p>
      <div class="ms-actions"><button class="btn ghost sm" type="button" data-ms="fermer">Annuler</button><button class="btn pri sm" type="submit"><i class="ti ti-flag"></i> Envoyer à mon enseignant référent</button></div></form>` : '';
    return `<div class="ms-item"><span class="ms-t">${esc(et.te || et.t)}${corr}${remisParRef}</span>${chipEcheance(et, s)}${boutons}${form}</div>`;
  }

  function pistesHtml(s) {
    const pistes = s.pistes || [];
    const ouvert = formOuvert === 'piste';
    return `<div class="card"><h3><i class="ti ti-list-search"></i> Mes pistes d’entreprises <span class="ms-chip" style="margin-left:.4rem">${pistes.length}</span></h3>
      ${pistes.length ? `<div class="ms-wrap"><table class="ms-pistes"><thead><tr><th>Structure</th><th>Secteur</th><th>Contact</th><th>Réponse</th></tr></thead><tbody>${pistes.map(p => `<tr><td>${esc(p.structure)}</td><td>${esc(p.secteur)}</td><td>${esc(MOYENS[p.moyen] || '')}${p.date ? ' · ' + fr(p.date) : ''}</td><td><select data-ms="reponse" data-id="${esc(p.id)}" aria-label="Réponse">${Object.entries(REPONSES).map(([k, l]) => `<option value="${k}"${p.reponse === k ? ' selected' : ''}>${l}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>` : '<p class="hint">Notez chaque entreprise contactée : votre enseignant référent suit votre recherche.</p>'}
      ${ouvert ? `<form class="ms-form" data-ms="piste">
        <label>Type de structure<select id="msPStruct">${STRUCTURES.map(x => `<option>${esc(x)}</option>`).join('')}</select></label>
        <label>Secteur d’activité<input id="msPSecteur" maxlength="80" placeholder="ex. accueil"></label>
        <label>Contact<select id="msPMoyen">${Object.entries(MOYENS).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>
        <label>Date<input id="msPDate" type="date" value="${auj()}"></label>
        <label>Réponse<select id="msPRep">${Object.entries(REPONSES).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></label>
        <p class="ms-note"><i class="ti ti-shield-lock"></i> Ni nom d’entreprise, ni adresse.</p>
        <div class="ms-actions"><button class="btn ghost sm" type="button" data-ms="fermer">Annuler</button><button class="btn pri sm" type="submit"><i class="ti ti-plus"></i> Ajouter</button></div></form>`
      : `<button class="btn sm" data-ms="ouvrir" data-etape="piste" style="margin-top:.6rem"><i class="ti ti-plus"></i> Ajouter une piste</button>`}
    </div>`;
  }

  function rendreFil() {
    const f = $('msFil'); if (!f) return;
    f.innerHTML = msgs.length ? msgs.map(m => `<div class="ms-msg ${esc(m.de)}"><small>${m.de === 'eleve' ? 'Moi' : m.de === 'pp' ? 'Professeur principal' : 'Enseignant référent'}${m.sigle && m.de !== 'eleve' ? ' ' + esc(m.sigle) : ''} · ${fr(m.le)}</small>${esc(m.texte)}</div>`).join('') : '<p class="hint" style="margin:0">Aucun message.</p>';
    f.scrollTop = f.scrollHeight;
  }

  /* ── Gestes ────────────────────────────────────────────────────────── */
  const zone = $('sec-monstage');
  zone.addEventListener('click', ev => {
    const b = ev.target.closest('[data-ms]'); if (!b || b.tagName === 'FORM' || b.tagName === 'SELECT') return;
    const s = suivis[periode];
    const k = b.dataset.ms;
    if (k === 'periode') { periode = +b.dataset.n; if (arretMsgs) { arretMsgs(); arretMsgs = null; } ecouterMessages(); rendre(); return; }
    if (k === 'ouvrir') { formOuvert = b.dataset.etape; rendre(); return; }
    if (k === 'fermer') { formOuvert = ''; rendre(); return; }
    if (k === 'agir' && s) {
      b.disabled = true;
      svc.agir(s.id, b.dataset.etape, b.dataset.action, 'eleve', b.dataset.v ? { v: b.dataset.v } : undefined)
        .then(() => dire(b.dataset.etape === 'midpoint' && b.dataset.v === 'difficulte' ? 'Votre enseignant référent est prévenu.' : 'Envoyé à votre enseignant référent.'))
        .catch(e => { dire(e.message); b.disabled = false; });
    }
  });
  zone.addEventListener('change', ev => {
    const x = ev.target; const s = suivis[periode];
    if (x.dataset && x.dataset.ms === 'reponse' && s) svc.majPistes(s.id, l => l.map(p => p.id === x.dataset.id ? Object.assign({}, p, { reponse: x.value }) : p)).catch(e => dire(e.message));
  });
  zone.addEventListener('submit', ev => {
    const f = ev.target; const s = suivis[periode]; if (!f.dataset || !s) return;
    ev.preventDefault();
    if (f.dataset.ms === 'trouve') {
      svc.declarerTrouve(s.id, { structure: $('msStruct').value, secteur: $('msSecteur').value }).then(() => { formOuvert = ''; dire('Envoyé à votre enseignant référent.'); rendre(); }).catch(e => dire(e.message));
    } else if (f.dataset.ms === 'piste') {
      const p = { structure: $('msPStruct').value, secteur: $('msPSecteur').value, moyen: $('msPMoyen').value, date: $('msPDate').value, reponse: $('msPRep').value };
      svc.majPistes(s.id, l => l.concat([p])).then(() => { formOuvert = ''; rendre(); }).catch(e => dire(e.message));
    } else if (f.dataset.ms === 'message') {
      const t = $('msTexte'); const texte = t.value; t.value = '';
      svc.envoyerMessage(s.id, 'eleve', '', texte).catch(e => { dire(e.message); const z = $('msTexte'); if (z && !z.value) z.value = texte; });
    }
  });

  brancher(codeCourant());
})();
