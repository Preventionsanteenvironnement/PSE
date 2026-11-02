/* Séance 4 · La situation dangereuse (25 novembre) — d'après le Tableau, séance 4. */
var P = 'img/pictos/';
(window.CDO_SEANCES = window.CDO_SEANCES || []).push({
  id: 's4', numero: 4, date: '2026-11-25', titre: 'La situation dangereuse', vignette: 'img/pad-chute-travail.jpg',
  objectif: 'Être capable de reconnaître une situation dangereuse.',
  objectifsEleve: ['Revoir le mot « opérateur »', 'Distinguer danger et situation dangereuse', 'Reconnaître une situation dangereuse'],
  decouvrir: [
    { titre: 'Le danger seul ne blesse personne', texte: 'Une friteuse allumée dans une cuisine vide : personne n’est blessé. Pour qu’un accident arrive, un opérateur doit être exposé au danger.', image: 'img/friteuse.jpg' },
    { titre: 'L’opérateur', texte: 'L’opérateur est la personne qui réalise le travail. En cuisine : le cuisinier, le commis, l’agent de restauration, le plongeur.', image: P + '6985.png' },
    { titre: 'La situation dangereuse', texte: 'La situation dangereuse est la situation dans laquelle l’opérateur est exposé au danger.', image: 'img/danger-et-situation-dangereuse.jpg', large: true },
    { titre: 'Écrire une situation dangereuse', texte: 'L’opérateur, puis un verbe d’action, puis le danger. « Le commis coupe des légumes avec un couteau. » « L’agent traverse la cuisine sur un sol mouillé. »' }
  ],
  retenir: 'L’opérateur est la personne qui réalise le travail. La situation dangereuse est la situation dans laquelle l’opérateur est exposé au danger.',
  exercices: [
    { type: 'qcm', titre: 'Rappel : danger et dommage', consigne: 'Choisir la bonne réponse.', questions: [
      { question: 'Une brûlure est…', choix: ['un danger', 'un dommage'], bonne: 1, explication: 'C’est une atteinte à la santé.' },
      { question: 'Une plaque de cuisson allumée est…', choix: ['un danger', 'un dommage'], bonne: 0, explication: 'Elle est susceptible de causer un dommage.' },
      { question: 'Quel dommage peut causer un sol gras ?', choix: ['Une électrisation', 'Une entorse', 'Une irritation'], bonne: 1, explication: 'On glisse, on tombe.' }
    ] },
    { type: 'trous', titre: 'Deux mots nouveaux', consigne: 'Compléter la définition avec deux des trois mots proposés.', source: 'La situation dangereuse est la situation dans laquelle l’[opérateur] est exposé au [danger].', intrus: 'dommage' },
    { type: 'classer', titre: 'Danger ou situation dangereuse ?', consigne: 'Classer chaque phrase dans la bonne colonne.', colonnes: [
      { titre: 'Le danger', elements: [{ t: 'Un couteau sur le plan de travail', image: P + '3237.png' }, { t: 'Une friteuse allumée', image: P + '27772.png' }, { t: 'Un sol mouillé', image: P + '25936.png' }] },
      { titre: 'La situation dangereuse', elements: [{ t: 'Le cuisinier émince des carottes au couteau', image: 'img/pad-coupure-travail.jpg' }, { t: 'Le cuisinier plonge un panier dans la friteuse' }, { t: 'Le plongeur traverse le sol mouillé', image: 'img/pad-chute-travail.jpg' }] }
    ], indice: 'Dans une situation dangereuse, une personne est exposée au danger.' },
    { type: 'tableau', titre: 'Construire la situation dangereuse', consigne: 'Compléter le tableau.', colonnes: ['Le danger', 'L’opérateur', 'La situation dangereuse'], lignes: [
      ['Un four chaud', 'Le cuisinier', '[Le cuisinier sort une plaque du four chaud]'],
      ['Un produit dégraissant', 'L’agent d’entretien', '[L’agent nettoie la hotte avec le dégraissant]'],
      ['Un sac de 25 kg', 'Le commis', '[Le commis porte le sac de 25 kg]']
    ], intrus: 'Le commis a mal au dos' }
  ],
  evaluation: { questions: [
    { type: 'trous', consigne: 'Compléter la définition avec deux des trois mots proposés.', source: 'L’[opérateur] est la personne qui réalise le [travail].', intrus: 'danger', points: 4 },
    { type: 'ranger', consigne: 'Ranger chaque élément : danger ou situation dangereuse.', colonnes: [{ titre: 'Danger', elements: ['Une trancheuse', 'Un four chaud'] }, { titre: 'Situation dangereuse', elements: ['Le commis utilise la trancheuse', 'Le cuisinier sort un plat du four'] }], points: 6 },
    { type: 'choix', chapeau: 'À partir du document 1 :', docTitre: 'Document 1 · Le commis dans la réserve.', image: 'img/pad-sac-travail.jpg', alt: 'Le commis dans la réserve, près d’un sac de farine.', consigne: 'Choisir la situation dangereuse.', choix: ['Un sac de farine est posé au sol', 'Le commis soulève un sac lourd', 'Le commis a mal au dos'], bonne: 1, points: 4, explication: 'L’opérateur est exposé au danger : il soulève le sac.' },
    { type: 'vf', texte: 'Une friteuse allumée dans une cuisine vide est une situation dangereuse.', reponse: false, points: 3, explication: 'Sans opérateur, il n’y a pas de situation dangereuse.' },
    { type: 'choix', chapeau: 'À partir du document 2 :', docTitre: 'Document 2 ·', document: 'Le plongeur traverse le sol mouillé.', consigne: 'Choisir l’opérateur.', choix: ['Le plongeur', 'Le sol mouillé', 'Le chef de cuisine'], bonne: 0, points: 3 }
  ] },
  carnet: {
    fait: ['J’ai rangé danger / situation dangereuse', 'J’ai complété des situations dangereuses', 'J’ai mimé une situation'],
    appris: ['Le mot « opérateur »', 'Le mot « situation dangereuse »', 'La phrase modèle'],
    difficile: ['Rien', 'Écrire une phrase', 'Travailler en équipe']
  }
});
