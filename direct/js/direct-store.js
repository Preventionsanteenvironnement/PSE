/* MaPSE Direct — liaison temps réel (prototype du 17-18/11/2026)
 *
 * Une seule interface pour toutes les pages (élève, professeur, télécommande, projection).
 * Deux moteurs possibles derrière :
 *   - « local »    : le navigateur seul (localStorage + événement storage). Sert aux essais :
 *                    plusieurs onglets du MÊME navigateur se parlent en direct. Rien ne sort de l'ordinateur.
 *   - « firebase » : Firestore (fichier direct-firebase.js, chargé après celui-ci) : le moteur normal depuis le 18/11/2026 ; « ?essai=1 » garde le moteur local.
 *
 * Organisation des données (identique dans les deux moteurs) :
 *   seances/{id}                   écrit par le professeur seul : titre, classe, codes autorisés, activités, étape, mode, figé…
 *   seances/{id}/eleves/{code}     écrit par l'élève seul : présence, étape, réponses, main levée, fini
 *   seances/{id}/consignes/{code}  écrit par le professeur seul : messages privés, validations, aménagements, libération
 *   codes/{codeSeance}             écrit par le professeur : code de séance (4 chiffres) → id de la séance
 *
 * Aucun nom d'élève n'est jamais écrit : seulement le code à 4 caractères.
 */
(function (global) {
  'use strict';

  const PREFIXE = 'mapse-direct:';

  function cle(chemin) { return PREFIXE + chemin; }
  function lire(chemin) {
    try { const v = localStorage.getItem(cle(chemin)); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function ecrire(chemin, valeur) {
    try { localStorage.setItem(cle(chemin), JSON.stringify(valeur)); } catch (e) { console.warn('MaPSE Direct : écriture impossible', e); }
    // l'événement « storage » ne prévient que les AUTRES onglets : on prévient aussi celui-ci
    diffuserLocal(chemin);
  }
  function fusionner(chemin, patch) {
    const actuel = lire(chemin) || {};
    const suivant = Object.assign({}, actuel, patch, { majLe: Date.now() });
    ecrire(chemin, suivant);
    return suivant;
  }

  const abonnes = []; // { filtre(chemin) -> bool, rappel() }
  function diffuserLocal(chemin) {
    abonnes.slice().forEach(a => { if (a.filtre(chemin)) { try { a.rappel(); } catch (e) { console.error(e); } } });
  }
  global.addEventListener && global.addEventListener('storage', ev => {
    if (!ev.key || ev.key.indexOf(PREFIXE) !== 0) return;
    diffuserLocal(ev.key.slice(PREFIXE.length));
  });
  function abonner(filtre, rappel) {
    const a = { filtre, rappel };
    abonnes.push(a);
    rappel();
    return () => { const i = abonnes.indexOf(a); if (i >= 0) abonnes.splice(i, 1); };
  }

  function listerSous(prefixeChemin) {
    const res = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf(cle(prefixeChemin)) === 0) {
          const sousCle = k.slice(cle(prefixeChemin).length);
          if (sousCle.indexOf('/') === -1) { try { res[sousCle] = JSON.parse(localStorage.getItem(k)); } catch (e) {} }
        }
      }
    } catch (e) {}
    return res;
  }

  function nouvelId() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function nouveauCodeSeance() {
    for (let essai = 0; essai < 50; essai++) {
      const c = String(Math.floor(1000 + Math.random() * 9000));
      if (!lire('codes/' + c)) return c;
    }
    return String(Date.now()).slice(-4);
  }
  function normaliserCode(c) { return String(c || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); }

  const moteurLocal = {
    nom: 'local',
    // --- professeur ---
    creerSeance(donnees) {
      const id = nouvelId();
      const codeSeance = nouveauCodeSeance();
      const seance = Object.assign({
        id, codeSeance, creeLe: Date.now(), ouverte: true,
        mode: 'pilote', etape: 0, fige: false, projeter: null, arret: null
      }, donnees);
      seance.codesAutorises = (seance.codesAutorises || []).map(normaliserCode).filter(Boolean);
      ecrire('seances/' + id, seance);
      ecrire('codes/' + codeSeance, { id });
      const liste = lire('mes-seances') || [];
      liste.unshift({ id, codeSeance, titre: seance.titre, classe: seance.classe, creeLe: seance.creeLe });
      ecrire('mes-seances', liste.slice(0, 30));
      return seance;
    },
    mesSeances() { return lire('mes-seances') || []; },
    mesSeancesOuvertes() { return (lire('mes-seances') || []).map(x => lire('seances/' + x.id)).filter(s => s && s.ouverte); },
    libererPlace(id, code) { try { localStorage.removeItem(cle('seances/' + id + '/eleves/' + normaliserCode(code))); } catch (e) {} diffuserLocal('seances/' + id + '/eleves/'); },
    majSeance(id, patch) { return fusionner('seances/' + id, patch); },
    fermerSeance(id) {
      const s = fusionner('seances/' + id, { ouverte: false, fermeeLe: Date.now() });
      if (s && s.codeSeance) { try { localStorage.removeItem(cle('codes/' + s.codeSeance)); } catch (e) {} }
      return s;
    },
    majConsigne(id, code, patch) { return fusionner('seances/' + id + '/consignes/' + normaliserCode(code), patch); },
    ajouterMessage(id, code, texte, genre) {
      const chemin = 'seances/' + id + '/consignes/' + normaliserCode(code);
      const c = lire(chemin) || {};
      const messages = (c.messages || []).concat([{ id: nouvelId(), texte, genre: genre || 'aide', le: Date.now() }]);
      return fusionner(chemin, { messages: messages.slice(-20) });
    },
    ecouterEleves(id, rappel) {
      const base = 'seances/' + id + '/eleves/';
      return abonner(ch => ch.indexOf(base) === 0, () => rappel(listerSous(base)));
    },
    ecouterConsignes(id, rappel) {
      const base = 'seances/' + id + '/consignes/';
      return abonner(ch => ch.indexOf(base) === 0, () => rappel(listerSous(base)));
    },
    // --- élève ---
    trouverSeance(codeSeance) {
      const ref = lire('codes/' + String(codeSeance || '').trim());
      if (!ref) return null;
      const s = lire('seances/' + ref.id);
      return s && s.ouverte ? s : null;
    },
    majEleve(id, code, patch) { return fusionner('seances/' + id + '/eleves/' + normaliserCode(code), patch); },
    lireEleve(id, code) { return lire('seances/' + id + '/eleves/' + normaliserCode(code)); },
    rejoindre(id, code) { return lire('seances/' + id + '/eleves/' + normaliserCode(code)) || {}; },
    ecouterConsigne(id, code, rappel) {
      const ch0 = 'seances/' + id + '/consignes/' + normaliserCode(code);
      return abonner(ch => ch === ch0, () => rappel(lire(ch0) || {}));
    },
    // --- tous ---
    ecouterSeance(id, rappel) {
      const ch0 = 'seances/' + id;
      return abonner(ch => ch === ch0, () => rappel(lire(ch0)));
    },
    lireSeance(id) { return lire('seances/' + id); },
    toutEffacer() {
      const aSuppr = [];
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(PREFIXE) === 0) aSuppr.push(k); }
      aSuppr.forEach(k => localStorage.removeItem(k));
      diffuserLocal('');
    }
  };

  global.MapseDirect = global.MapseDirect || {};
  global.MapseDirect.store = moteurLocal;
  global.MapseDirect.normaliserCode = normaliserCode;
  global.MapseDirect.PRESENCE_MS = 15000; // un élève est « connecté » s'il a donné signe de vie depuis moins de 15 s
})(window);
