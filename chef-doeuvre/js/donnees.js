/* donnees.js — enregistrement du parcours chef-d'œuvre.
 * Sur l'ordinateur : localStorage, clé « cdo-psr-2026:<code> ». Fichier de secours : exporter / importer (JSON).
 * En ligne (Firebase devoirs-pse) : resultats/{code}/suivi/cdo-psr-2026 (avancement, carnet, avatar)
 *   et resultats/{code}/evaluations/cdo-psr-2026-<séance> (note de l'évaluation, lue par l'Atelier PSE).
 *   Seul le code est envoyé, jamais un nom.
 * ENVOI_EN_LIGNE reste à false tant que Brahim n'a pas autorisé les écritures Firebase (AGENTS.md § 10).
 */
(function () {
  'use strict';
  var ENVOI_EN_LIGNE = false;
  var CLE = 'cdo-psr-2026';
  var CODES_ESSAI = ['ESSAI'];   // code de démonstration : jamais envoyé
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
  async function envoyerSuivi() {
    var f = await firebase(); if (!f) return;
    try {
      await f.fs.setDoc(f.fs.doc(f.db, 'resultats', code, 'suivi', CLE), { eleveCode: code, source: 'chef_doeuvre_psr', etat: JSON.stringify(etat), updatedAtISO: new Date().toISOString(), updatedAt: f.fs.serverTimestamp() }, { merge: true });
    } catch (e) { /* hors ligne : renvoyé au prochain enregistrement */ }
  }
  async function envoyerNote(seance, ev) {
    var f = await firebase(); if (!f) return;
    try {
      await f.fs.setDoc(f.fs.doc(f.db, 'resultats', code, 'evaluations', CLE + '-' + seance.id), {
        eleveCode: code, devoirId: CLE + '-' + seance.id, titre: 'Chef-d’œuvre — ' + seance.titre,
        note_finale: ev.note, bareme: 20, publie: true, autocorrected: true, source: 'chef_doeuvre_psr', type: 'chef_oeuvre',
        module_id: seance.id, reponses: ev.reponses || {}, createdAtISO: ev.date, updatedAtISO: new Date().toISOString(), updatedAt: f.fs.serverTimestamp()
      }, { merge: true });
    } catch (e) { /* hors ligne */ }
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
    noter: function (s, ev) { seance(s.id).evaluation = ev; enregistrer(); envoyerNote(s, ev); },
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
