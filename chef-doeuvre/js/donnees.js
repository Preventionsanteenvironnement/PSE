/* donnees.js — enregistrement du parcours chef-d'œuvre.
 * Sur l'ordinateur : localStorage, clé « cdo-psr-2026:<code> ». Fichier de secours : exporter / importer (JSON).
 * En ligne (Firebase devoirs-pse) : resultats/{code}/evaluations/cdo-psr-2026-<séance> (note, tentatives, carnet de la séance),
 *   lue par l'Atelier PSE dans son espace « Chef-d'œuvre ».
 *   Seul le code est envoyé, jamais un nom.
 * Envoi en ligne autorisé par Brahim le 02/11/2026. Le code ESSAI n'est jamais envoyé.
 */
(function () {
  'use strict';
  var ENVOI_EN_LIGNE = true;   // autorisé par Brahim le 02/11/2026
  var CLE = 'cdo-psr-2026';
  var CODES_ESSAI = ['ESSAI', 'PROF', 'PROFPSE', 'PROFPSR'];   // démonstration et code professeur : jamais envoyés
  var code = null, etat = null, fb = null, minuterie = null;

  function vide() { return { v: 1, avatar: null, seances: {}, maj: null }; }
  function lireLocal(c) { try { return JSON.parse(localStorage.getItem(CLE + ':' + c) || 'null') || vide(); } catch (e) { return vide(); } }
  function ecrireLocal() { try { localStorage.setItem(CLE + ':' + code, JSON.stringify(etat)); } catch (e) { /* stockage plein ou refusé */ } }

  /* Codes de la classe : ../data_eleves.js (userCode + classe, sans nom). */
  function codeValide(c) {
    c = String(c || '').trim().toUpperCase();
    if (CODES_ESSAI.indexOf(c) >= 0) return c;
    var base = window.BDD_ELEVES || [];
    var e = base.filter(function (x) { return String(x.userCode || '').toUpperCase() === c; })[0];
    return e && /^C1PSR$/i.test(String(e.classe || '')) ? c : null;
  }

  async function firebase() {
    if (!ENVOI_EN_LIGNE || CODES_ESSAI.indexOf(code) >= 0) return null;
    if (fb) return fb;
    try {
      var app = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      var fs = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      var a = app.initializeApp({ apiKey: 'AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI', authDomain: 'devoirs-pse.firebaseapp.com', projectId: 'devoirs-pse', storageBucket: 'devoirs-pse.appspot.com', messagingSenderId: '614730413904', appId: '1:614730413904:web:a5dd478af5de30f6bede55' }, 'cdo');   // même projet que psr/firebase_psr.js
      fb = { db: fs.getFirestore(a), fs: fs };
      return fb;
    } catch (e) { return null; }
  }
  /* Une fiche par séance évaluée : resultats/{code}/evaluations/cdo-psr-2026-<séance>.
     Pas de document dans « suivi » : cette collection sert au suivi de classe de Mon espace. [02/11/2026] */
  function fiche(s, e) {
    var ev = e.evaluation, suivi = JSON.parse(JSON.stringify(e)); delete suivi.evaluation;
    return {
      eleveCode: code, classe: 'C1PSR', devoirId: CLE + '-' + (s.id === 's0-comprendre-illustre' ? 's0' : s.id), titre: 'Chef-d’œuvre — ' + s.titre,
      note_finale: ev.note, bareme: 20, premiere_note: e.premiereNote != null ? e.premiereNote : ev.note, tentatives: e.tentatives || 1,
      points: ev.points, total: ev.total, publie: true, autocorrected: true, source: 'chef_doeuvre_psr', type: 'chef_oeuvre',
      module_id: s.id === 's0-comprendre-illustre' ? 's0' : s.id, seance_numero: s.numero, seance_date: s.date || '', reponses: ev.reponses || {}, suivi: JSON.stringify(suivi),
      createdAtISO: ev.date, updatedAtISO: new Date().toISOString()
    };
  }
  async function envoyerNote(s, e) {
    var f = await firebase(); if (!f || !e.evaluation) return;
    try {
      var d = fiche(s, e); d.updatedAt = f.fs.serverTimestamp();
      await f.fs.setDoc(f.fs.doc(f.db, 'resultats', code, 'evaluations', d.devoirId), d, { merge: true });
    } catch (err) { /* hors ligne : renvoyé au prochain enregistrement */ }
  }
  /* Le carnet de bord rempli après l'évaluation est renvoyé avec la fiche de la séance. */
  async function envoyerSuivi() {
    var S = window.CDO_SEANCES || [];
    for (var k = 0; k < S.length; k++) { var e = etat && etat.seances[S[k].id]; if (e && e.evaluation) await envoyerNote(S[k], e); }
  }

  function enregistrer() {
    etat.maj = new Date().toISOString();
    ecrireLocal();
    clearTimeout(minuterie); minuterie = setTimeout(envoyerSuivi, 3000);
  }
  function seance(id) { etat.seances[id] = etat.seances[id] || { exercices: {}, carnet: {} }; return etat.seances[id]; }

  /* La connexion tient le temps de la session du navigateur (un rechargement ne déconnecte pas). */
  try { var s0 = sessionStorage.getItem(CLE + '-session'); if (s0 && codeValide(s0)) { code = s0; etat = lireLocal(s0); } } catch (e) {}

  window.CDO_DONNEES = {
    codeValide: codeValide,
    ouvrir: function (c) { code = c; etat = lireLocal(c); try { sessionStorage.setItem(CLE + '-session', c); } catch (e) {} return etat; },
    fermer: function () { code = null; etat = null; try { sessionStorage.removeItem(CLE + '-session'); } catch (e) {} },
    code: function () { return code; },
    etat: function () { return etat; },
    seance: seance,
    enregistrer: enregistrer,
    /* Chaque tentative est comptée ; la meilleure note est gardée, la première aussi. */
    noter: function (s, ev) {
      var e = seance(s.id); e.tentatives = (e.tentatives || 0) + 1;
      if (e.premiereNote == null) e.premiereNote = e.evaluation ? e.evaluation.note : ev.note;
      if (!e.evaluation || ev.note >= e.evaluation.note) e.evaluation = ev;
      ecrireLocal(); envoyerNote(s, e);
    },
    enLigne: function () { return ENVOI_EN_LIGNE && CODES_ESSAI.indexOf(code) < 0; },
    exporter: function () {
      var blob = new Blob([JSON.stringify({ code: code, cle: CLE, etat: etat }, null, 1)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chef-doeuvre-' + code + '.json'; a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    },
    importer: function (texte) {
      var d = JSON.parse(texte);
      if (!d || d.cle !== CLE || !d.etat) throw new Error('Ce fichier n’est pas un fichier du chef-d’œuvre.');
      if (String(d.code).toUpperCase() !== code) throw new Error('Ce fichier appartient à un autre code.');
      etat = d.etat; enregistrer(); return etat;
    }
  };
})();
