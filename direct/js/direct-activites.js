/* MaPSE Direct — les types d'activités (prototype)
 *
 * Chaque type d'activité est construit UNE fois et sert pour tous les modules.
 * Un type fournit :
 *   afficher(act, zone, etat, envoyer)  → dessine l'activité chez l'élève ; envoyer(reponse) la transmet
 *   corriger(act, reponse)              → { statut: 'juste' | 'partiel' | 'faux' | 'a_valider' | 'fait', bonnes, total }
 *   resumer(act, reponse)               → texte court de la réponse, pour le tableau de bord
 *   texteALire(act)                     → ce que lit le bouton « Écouter »
 *
 * Types du prototype : etape, qcm, courte, classer (tri), processus (apparition du dommage), sondage.
 */
(function (global) {
  'use strict';

  function el(tag, attrs, enfants) {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => {
      if (k === 'texte') n.textContent = attrs[k];
      else if (k === 'classe') n.className = attrs[k];
      else if (k.indexOf('on') === 0) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    });
    (enfants || []).forEach(e => { if (e) n.appendChild(typeof e === 'string' ? document.createTextNode(e) : e); });
    return n;
  }

  function entete(act) {
    const bloc = el('div', { classe: 'act-entete' });
    if (act.image) bloc.appendChild(el('img', { src: act.image, alt: act.imageAlt || '', classe: 'act-image' }));
    const txt = el('div', { classe: 'act-textes' });
    if (act.titre) txt.appendChild(el('h2', { texte: act.titre }));
    if (act.texte) String(act.texte).split('\n').forEach(p => txt.appendChild(el('p', { texte: p })));
    if (act.consigne) txt.appendChild(el('p', { classe: 'act-consigne', texte: act.consigne }));
    if (act.image) txt.appendChild(el('p', { classe: 'act-credit', texte: act.credit || 'Pictogramme : ARASAAC (Sergio Palao), licence CC BY-NC-SA' }));
    bloc.appendChild(txt);
    return bloc;
  }

  const TYPES = {};

  /* --- Étape de cours : on lit, on regarde --- */
  TYPES.etape = {
    nom: 'Étape de cours',
    afficher(act, zone, etat, envoyer) {
      zone.appendChild(entete(act));
      if (act.points) zone.appendChild(el('ul', { classe: 'act-points' }, act.points.map(p => el('li', { texte: p }))));
      if (!etat.reponse) envoyer({ vu: true });
    },
    corriger() { return { statut: 'fait' }; },
    resumer() { return 'lu'; },
    texteALire(act) { return [act.titre, act.texte, (act.points || []).join('. ')].filter(Boolean).join('. '); }
  };

  /* --- QCM : une seule bonne réponse --- */
  TYPES.qcm = {
    nom: 'Question à choix',
    afficher(act, zone, etat, envoyer) {
      zone.appendChild(entete(act));
      zone.appendChild(el('p', { classe: 'act-question', texte: act.question }));
      const rep = etat.reponse;
      const corr = rep ? TYPES.qcm.corriger(act, rep) : null;
      const liste = el('div', { classe: 'act-choix' });
      act.choix.forEach((c, i) => {
        let classe = 'choix';
        if (rep && rep.choix === i) classe += corr.statut === 'juste' ? ' choix-juste' : ' choix-faux';
        const b = el('button', { classe, type: 'button', onclick: () => envoyer({ choix: i }) }, [
          el('span', { classe: 'choix-lettre', texte: String.fromCharCode(65 + i) }), el('span', { texte: c })
        ]);
        liste.appendChild(b);
      });
      zone.appendChild(liste);
      if (rep) zone.appendChild(el('p', { classe: 'act-retour ' + (corr.statut === 'juste' ? 'ok' : 'ko'),
        texte: corr.statut === 'juste' ? 'Bravo, c’est juste.' + (act.explication ? ' ' + act.explication : '') : 'Pas tout à fait. Relis et choisis une autre réponse.' }));
    },
    corriger(act, rep) { return rep && rep.choix === act.bonne ? { statut: 'juste', bonnes: 1, total: 1 } : { statut: 'faux', bonnes: 0, total: 1 }; },
    resumer(act, rep) { return rep ? String.fromCharCode(65 + rep.choix) : '—'; },
    texteALire(act) { return [act.titre, act.texte, act.question].concat(act.choix.map((c, i) => 'Réponse ' + String.fromCharCode(65 + i) + ' : ' + c)).filter(Boolean).join('. '); }
  };

  /* --- Sondage : pas de bonne réponse, résultats anonymes --- */
  TYPES.sondage = {
    nom: 'Sondage',
    afficher(act, zone, etat, envoyer) {
      zone.appendChild(entete(act));
      zone.appendChild(el('p', { classe: 'act-question', texte: act.question }));
      const liste = el('div', { classe: 'act-choix' });
      act.choix.forEach((c, i) => {
        const choisi = etat.reponse && etat.reponse.choix === i;
        liste.appendChild(el('button', { classe: 'choix' + (choisi ? ' choix-pris' : ''), type: 'button', onclick: () => envoyer({ choix: i }) }, [el('span', { texte: c })]));
      });
      zone.appendChild(liste);
      if (etat.reponse) zone.appendChild(el('p', { classe: 'act-retour ok', texte: 'Merci, ta réponse est envoyée. Tu peux la changer.' }));
    },
    corriger() { return { statut: 'fait' }; },
    resumer(act, rep) { return rep ? act.choix[rep.choix] : '—'; },
    texteALire(act) { return [act.question].concat(act.choix).join('. '); }
  };

  /* --- Réponse courte : le professeur valide --- */
  TYPES.courte = {
    nom: 'Réponse rédigée',
    afficher(act, zone, etat, envoyer) {
      zone.appendChild(entete(act));
      zone.appendChild(el('p', { classe: 'act-question', texte: act.question }));
      const ta = el('textarea', { classe: 'act-texte', rows: '4', 'aria-label': 'Ta réponse', placeholder: 'Écris ta réponse ici…' });
      ta.value = etat.reponse ? etat.reponse.texte : '';
      zone.appendChild(ta);
      const ligne = el('div', { classe: 'act-ligne' });
      ligne.appendChild(el('button', { classe: 'bouton-principal', type: 'button', onclick: () => { if (ta.value.trim()) envoyer({ texte: ta.value.trim() }); } }, ['J’envoie ma réponse']));
      if ('webkitSpeechRecognition' in global || 'SpeechRecognition' in global) {
        ligne.appendChild(el('button', { classe: 'bouton-second', type: 'button', onclick: () => dicter(ta) }, ['🎤 Je dicte']));
      }
      zone.appendChild(ligne);
      const v = etat.validation;
      if (v === 'ok') zone.appendChild(el('p', { classe: 'act-retour ok', texte: 'Ton professeur a validé ta réponse. Bravo !' }));
      else if (v === 'refaire') zone.appendChild(el('p', { classe: 'act-retour ko', texte: 'Ton professeur te demande de compléter ta réponse.' }));
      else if (etat.reponse) zone.appendChild(el('p', { classe: 'act-retour attente', texte: 'Réponse envoyée. Ton professeur va la lire.' }));
    },
    corriger(act, rep, validation) {
      if (!rep) return { statut: 'faux' };
      if (validation === 'ok') return { statut: 'juste' };
      if (validation === 'refaire') return { statut: 'partiel' };
      return { statut: 'a_valider' };
    },
    resumer(act, rep) { return rep ? rep.texte : '—'; },
    texteALire(act) { return [act.titre, act.texte, act.question].filter(Boolean).join('. '); }
  };

  function dicter(ta) {
    const R = global.SpeechRecognition || global.webkitSpeechRecognition;
    const r = new R(); r.lang = 'fr-FR'; r.interimResults = false;
    r.onresult = e => { ta.value = (ta.value ? ta.value + ' ' : '') + e.results[0][0].transcript; };
    r.start();
  }

  /* --- Classer : glisser chaque étiquette dans la bonne case (tri, processus) --- */
  function afficherClasser(act, zone, etat, envoyer, enChaine) {
    zone.appendChild(entete(act));
    const placements = Object.assign({}, (etat.reponse && etat.reponse.placements) || {});
    const verifie = !!(etat.reponse && etat.reponse.verifie);
    let choisi = null;

    const aide = el('p', { classe: 'act-aide', texte: 'Fais glisser chaque étiquette dans sa case. Ou touche une étiquette, puis touche la case.' });
    zone.appendChild(aide);

    const reserve = el('div', { classe: 'classer-reserve', 'data-case': '' });
    const cases = el('div', { classe: 'classer-cases' + (enChaine ? ' en-chaine' : '') });
    const zonesParId = {};
    act.cases.forEach((c, i) => {
      if (enChaine && i > 0) cases.appendChild(el('div', { classe: 'chaine-fleche', 'aria-hidden': 'true', texte: c.lien || '→' }));
      const z = el('div', { classe: 'classer-case', 'data-case': c.id, style: c.couleur ? '--case:' + c.couleur : '' }, [
        el('div', { classe: 'case-titre', texte: c.nom })
      ]);
      if (c.aide) z.appendChild(el('div', { classe: 'case-aide', texte: c.aide }));
      z.appendChild(el('div', { classe: 'case-contenu' }));
      z.addEventListener('click', () => { if (choisi) { deposer(choisi, c.id); } });
      zonesParId[c.id] = z;
      cases.appendChild(z);
    });
    reserve.addEventListener('click', ev => { if (choisi && ev.target === reserve) deposer(choisi, ''); });

    function etiquette(item) {
      const b = el('button', { classe: 'etiquette', type: 'button', 'data-item': item.id }, [item.texte]);
      if (verifie && placements[item.id]) b.classList.add(placements[item.id] === item.case ? 'etiquette-juste' : 'etiquette-fausse');
      b.addEventListener('click', ev => {
        ev.stopPropagation();
        if (choisi === item.id) { choisi = null; } else { choisi = item.id; }
        dessiner();
      });
      activerGlisser(b, item.id);
      return b;
    }

    function activerGlisser(b, itemId) {
      let fantome = null, depart = null, bouge = false;
      b.addEventListener('pointerdown', ev => {
        if (ev.button !== undefined && ev.button !== 0) return;
        depart = { x: ev.clientX, y: ev.clientY }; bouge = false;
        b.setPointerCapture && b.setPointerCapture(ev.pointerId);
      });
      b.addEventListener('pointermove', ev => {
        if (!depart) return;
        if (!bouge && Math.hypot(ev.clientX - depart.x, ev.clientY - depart.y) < 8) return;
        if (!bouge) {
          bouge = true;
          fantome = b.cloneNode(true); fantome.classList.add('etiquette-fantome');
          fantome.style.width = b.getBoundingClientRect().width + 'px';
          document.body.appendChild(fantome);
        }
        fantome.style.left = (ev.clientX - 20) + 'px'; fantome.style.top = (ev.clientY - 20) + 'px';
        document.querySelectorAll('.classer-case').forEach(z => z.classList.remove('survol'));
        const sous = zoneSous(ev.clientX, ev.clientY); if (sous) sous.classList.add('survol');
      });
      const fin = ev => {
        if (!depart) return;
        const etaitBouge = bouge; depart = null; bouge = false;
        if (fantome) { fantome.remove(); fantome = null; }
        document.querySelectorAll('.classer-case').forEach(z => z.classList.remove('survol'));
        if (etaitBouge) {
          const sous = zoneSous(ev.clientX, ev.clientY);
          if (sous) deposer(itemId, sous.getAttribute('data-case'));
          b.dataset.ignorerClic = '1'; setTimeout(() => { delete b.dataset.ignorerClic; }, 50);
        }
      };
      b.addEventListener('pointerup', fin);
      b.addEventListener('pointercancel', fin);
      b.addEventListener('click', ev => { if (b.dataset.ignorerClic) { ev.stopImmediatePropagation(); } }, true);
    }

    function zoneSous(x, y) {
      const n = document.elementFromPoint(x, y);
      if (!n) return null;
      const z = n.closest('.classer-case, .classer-reserve');
      return z && zone.contains(z) ? z : null;
    }

    function deposer(itemId, caseId) {
      choisi = null;
      if (caseId) placements[itemId] = caseId; else delete placements[itemId];
      envoyer({ placements: Object.assign({}, placements), verifie: false });
    }

    function dessiner() {
      reserve.innerHTML = '';
      Object.values(zonesParId).forEach(z => { z.querySelector('.case-contenu').innerHTML = ''; });
      act.items.forEach(item => {
        const e = etiquette(item);
        if (choisi === item.id) e.classList.add('etiquette-choisie');
        const ou = placements[item.id];
        if (ou && zonesParId[ou]) zonesParId[ou].querySelector('.case-contenu').appendChild(e);
        else reserve.appendChild(e);
      });
      if (!reserve.children.length) reserve.appendChild(el('span', { classe: 'reserve-vide', texte: 'Toutes les étiquettes sont placées.' }));
      Object.values(zonesParId).forEach(z => z.classList.toggle('cible', !!choisi));
    }

    zone.appendChild(reserve);
    zone.appendChild(cases);
    dessiner();

    const nbPlaces = Object.keys(placements).length;
    const ligne = el('div', { classe: 'act-ligne' });
    ligne.appendChild(el('button', { classe: 'bouton-principal', type: 'button', disabled: nbPlaces < act.items.length ? 'disabled' : null,
      onclick: () => envoyer({ placements: Object.assign({}, placements), verifie: true }) }, ['Je vérifie']));
    if (nbPlaces < act.items.length) ligne.lastChild.setAttribute('disabled', 'disabled'); else ligne.lastChild.removeAttribute('disabled');
    zone.appendChild(ligne);
    if (verifie) {
      const c = corrigerClasser(act, etat.reponse);
      zone.appendChild(el('p', { classe: 'act-retour ' + (c.statut === 'juste' ? 'ok' : 'ko'),
        texte: c.statut === 'juste' ? 'Bravo, tout est bien placé !' + (act.explication ? ' ' + act.explication : '') : c.bonnes + ' sur ' + c.total + ' bien placées. Déplace les étiquettes orange, puis vérifie encore.' }));
    }
  }

  function corrigerClasser(act, rep) {
    const p = (rep && rep.placements) || {};
    let bonnes = 0;
    act.items.forEach(it => { if (p[it.id] === it.case) bonnes++; });
    const total = act.items.length;
    const nbPlaces = Object.keys(p).length;
    let statut = 'faux';
    if (!rep || nbPlaces === 0) statut = 'faux';
    else if (bonnes === total) statut = 'juste';
    else if (!rep.verifie) statut = 'en_cours';
    else statut = bonnes > 0 ? 'partiel' : 'faux';
    return { statut, bonnes, total };
  }

  TYPES.classer = {
    nom: 'Trier',
    afficher(act, zone, etat, envoyer) { afficherClasser(act, zone, etat, envoyer, false); },
    corriger: corrigerClasser,
    resumer(act, rep) { const c = corrigerClasser(act, rep); return c.bonnes + '/' + c.total; },
    texteALire(act) { return [act.titre, act.texte, act.consigne, 'Les cases : ' + act.cases.map(c => c.nom).join(', '), 'Les étiquettes : ' + act.items.map(i => i.texte).join('. ')].filter(Boolean).join('. '); }
  };

  /* --- Processus d'apparition du dommage : même moteur, cases en chaîne --- */
  TYPES.processus = {
    nom: 'Processus d’apparition du dommage',
    afficher(act, zone, etat, envoyer) { afficherClasser(act, zone, etat, envoyer, true); },
    corriger: corrigerClasser,
    resumer(act, rep) { const c = corrigerClasser(act, rep); return c.bonnes + '/' + c.total; },
    texteALire: (act) => TYPES.classer.texteALire(act)
  };

  global.MapseDirect = global.MapseDirect || {};
  global.MapseDirect.types = TYPES;
  global.MapseDirect.el = el;
})(window);
