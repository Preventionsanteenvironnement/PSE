/* MaPSE Direct — élèves fictifs pour la démonstration (prototype)
 * Ils se connectent, suivent le professeur, répondent (avec des erreurs), lèvent parfois la main,
 * et l'un d'eux reste bloqué : de quoi voir le tableau de bord vivre sans classe.
 * Le code « TEST » est laissé libre pour un vrai onglet élève.
 */
(function (global) {
  'use strict';
  const D = global.MapseDirect, store = D.store;
  const PHRASES = [
    'Porter ses bouchons moulés pendant tout le service.',
    'Mettre des bouchons même quand elle parle aux clients.',
    'Demander à son employeur de baisser le son.',
    'Faire des pauses au calme et aller voir le médecin du travail.',
    'mettre des bouchon'
  ];
  let minuteur = null, eleves = {};

  function hasard(n) { return Math.floor(Math.random() * n); }

  function profil(code, i) {
    return {
      code,
      arrivee: Date.now() + 800 + i * 900 + hasard(1500),
      justesse: [0.95, 0.8, 0.6, 0.85, 0.45, 0.9, 0.7][i % 7],
      lenteur: [4, 7, 10, 6, 14, 5, 8][i % 7] * 1000,
      bloqueur: i === 4,          // cet élève ne répond pas aux activités à glisser : il apparaîtra « bloqué »
      reponses: {}, tentatives: {}, position: 0, actuelle: null, actuelleLe: 0, main: false
    };
  }

  function repondre(s, a) {
    const ok = Math.random() < s.justesse;
    switch (a.type) {
      case 'etape': return { vu: true };
      case 'sondage': return { choix: hasard(a.choix.length) };
      case 'qcm': return { choix: ok ? a.bonne : (a.bonne + 1 + hasard(a.choix.length - 1)) % a.choix.length };
      case 'courte': return { texte: PHRASES[hasard(PHRASES.length)] };
      case 'classer': case 'processus': {
        const placements = {};
        a.items.forEach(it => {
          if (Math.random() < s.justesse) placements[it.id] = it.case;
          else { const autres = a.cases.filter(c => c.id !== it.case); placements[it.id] = autres[hasard(autres.length)].id; }
        });
        return { placements, verifie: true };
      }
    }
    return null;
  }

  function tic(id) {
    const seance = store.lireSeance(id);
    if (!seance || !seance.ouverte) { arreter(); return; }
    const maintenant = Date.now();
    Object.values(eleves).forEach(s => {
      if (maintenant < s.arrivee) return;
      const patch = { code: s.code, vu: maintenant, connecte: true, simule: true };
      if (!s.arriveLe) {
        s.arriveLe = maintenant; patch.arriveLe = maintenant;
        const AV = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐧', '🦉', '🐙', '🦄', '🐢', '🐬', '🐨'];
        const PS = ['Renard rapide', 'Panda calme', 'Tigre malin', 'Lion joyeux', 'Grenouille agile', 'Pingouin curieux', 'Hibou brillant', 'Pieuvre maline', 'Licorne', 'Tortue zen', 'Dauphin', 'Koala'];
        const k = Object.keys(eleves).indexOf(s.code);
        patch.pseudo = PS[k % PS.length]; patch.avatar = AV[k % AV.length]; patch.pseudoLe = maintenant;
      }
      const n = seance.activites.length;
      let i;
      if (seance.mode === 'pilote') { i = Math.min(seance.etape || 0, n - 1); s.position = i; }
      else { const limite = seance.arret != null ? seance.arret : n - 1; i = Math.min(s.position, limite, n - 1); }
      if (s.actuelle !== i) { s.actuelle = i; s.actuelleLe = maintenant; patch.actuelle = i; patch.actuelleLe = maintenant; patch.fini = false; }
      const a = seance.activites[i];
      if (!seance.fige) {
        const dejaRep = s.reponses[a.id];
        const attendu = s.lenteur * (0.6 + Math.random() * 0.8);
        const coince = s.bloqueur && (a.type === 'classer' || a.type === 'processus');
        if (!coince && maintenant - s.actuelleLe > attendu) {
          let changer = !dejaRep;
          if (dejaRep) {
            const st = D.types[a.type].corriger(a, dejaRep);
            if ((st.statut === 'faux' || st.statut === 'partiel') && Math.random() < 0.15 && (s.tentatives[a.id] || 0) < 3) changer = true;
          }
          if (changer) {
            let r = repondre(s, a);
            if (dejaRep && a.type === 'qcm') r = { choix: a.bonne };
            if (dejaRep && (a.type === 'classer' || a.type === 'processus')) { r = { placements: {}, verifie: true }; a.items.forEach(it => r.placements[it.id] = it.case); }
            if (r) {
              s.reponses = Object.assign({}, s.reponses, { [a.id]: Object.assign({ le: maintenant }, r) });
              s.tentatives[a.id] = (s.tentatives[a.id] || 0) + 1;
              patch.reponses = s.reponses; patch.tentatives = s.tentatives; patch.derniereAction = maintenant;
              if (seance.mode !== 'pilote' && s.position < n - 1) s.position++;
              patch.position = s.position;
              if (i === n - 1) patch.fini = true;
            }
          }
        }
        if (!s.main && Math.random() < 0.012) { s.main = true; patch.main = true; patch.mainLe = maintenant; }
        else if (s.main && Math.random() < 0.05) { s.main = false; patch.main = false; }
      }
      store.majEleve(id, s.code, patch);
    });
  }

  function demarrer(id) {
    const seance = store.lireSeance(id);
    // seulement les élèves de la classe : ni TEST, ni les élèves ajoutés ou invités, ni un élève réel déjà connecté
    const ajouts = seance.ajouts || {};
    const codes = (seance.codesAutorises || []).filter(c => c !== 'TEST' && !ajouts[c] && !(store.lireEleve(id, c) && !store.lireEleve(id, c).simule));
    eleves = {};
    codes.forEach((c, i) => { eleves[c] = profil(c, i); });
    minuteur = setInterval(() => tic(id), 1500);
  }
  function arreter() {
    if (minuteur) clearInterval(minuteur);
    minuteur = null;
    // les élèves fictifs se « déconnectent » : leur dernier signe de vie vieillit
  }

  D.simulation = {
    basculer(id) { if (minuteur) { arreter(); return false; } demarrer(id); return true; },
    enMarche() { return !!minuteur; }
  };
})(window);
