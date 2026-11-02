/* Séance 5 · L'événement déclencheur (2 décembre) — d'après le Tableau, séance 5.
 * Le programme de PSE du CAP (module C3) écrit « événement dangereux » ; l'INRS (ED 4472) écrit « facteur déclenchant », appelé aussi « événement déclenchant » ; « événement déclencheur » est le terme usuel des manuels. */
var P = 'img/pictos/';
(window.CDO_SEANCES = window.CDO_SEANCES || []).push({
  id: 's5', numero: 5, date: '2026-12-02', titre: 'L’événement déclencheur', vignette: 'img/moment-ou-tout-bascule.jpg',
  objectif: 'Être capable de repérer l’événement déclencheur d’un accident.',
  objectifsEleve: ['Comprendre le mot « événement déclencheur »', 'Le distinguer de la situation dangereuse', 'Remettre un accident dans l’ordre'],
  decouvrir: [
    { titre: 'Une situation dangereuse… sans accident', texte: 'Le cuisinier coupe des légumes au couteau tous les jours. Il ne se coupe pas tous les jours. Que faut-il pour que l’accident arrive ?', image: 'img/pad-coupure-travail.jpg' },
    { titre: 'L’événement déclencheur', texte: 'Dans un accident, c’est l’événement soudain qui, dans la situation dangereuse, cause le dommage : le moment où tout bascule. Le programme l’appelle aussi « événement dangereux ».', image: P + '9029.png' },
    { titre: 'Le moment où tout bascule', texte: 'La situation dangereuse, puis l’événement déclencheur, puis le dommage.', image: 'img/moment-ou-tout-bascule.jpg', large: true }
  ],
  retenir: 'Dans un accident, l’événement déclencheur est l’événement soudain qui, dans la situation dangereuse, cause le dommage. Sans événement déclencheur, il n’y a pas d’accident.',
  exercices: [
    { type: 'trous', titre: 'Rappel : la situation dangereuse', consigne: 'Compléter la définition avec deux des trois mots proposés.', source: 'La situation dangereuse est la situation dans laquelle l’[opérateur] est exposé au [danger].', intrus: 'dommage' },
    { type: 'relier', titre: 'Trouver l’événement déclencheur', consigne: 'Relier chaque situation dangereuse à son événement déclencheur.', paires: [
      { g: 'Le cuisinier émince au couteau', imageG: 'img/pad-coupure-travail.jpg', d: 'La lame dérape' },
      { g: 'Le plongeur traverse le sol mouillé', imageG: 'img/pad-chute-travail.jpg', d: 'Son pied glisse' },
      { g: 'Le cuisinier plonge un panier dans la friteuse', d: 'L’huile éclabousse' },
      { g: 'L’agent branche un appareil au fil abîmé', d: 'Sa main touche le fil dénudé' },
      { g: 'Le plongeur verse du dégraissant', imageG: 'img/pad-produit-travail.jpg', d: 'Le produit gicle sur sa peau' }
    ] },
    { type: 'classer', titre: 'Situation dangereuse ou événement déclencheur ?', consigne: 'Classer chaque phrase dans la bonne colonne.', colonnes: [
      { titre: 'La situation dangereuse', elements: ['Le commis porte un bac plein', 'Le cuisinier sort une plaque du four'] },
      { titre: 'L’événement déclencheur', elements: ['Le bac lui échappe des mains', 'Sa manique glisse', 'Il trébuche sur un carton'] }
    ], indice: 'L’événement déclencheur est soudain : il arrive d’un coup.' },
    { type: 'ordre', titre: 'Dans l’ordre', consigne: 'Remettre les étapes de l’accident dans l’ordre.', etapes: ['Une flaque d’huile est au sol.', 'Le commis traverse la cuisine.', 'Son pied glisse sur la flaque.', 'Il se fait une entorse à la cheville.'], images: [P + '25936.png', P + '6985.png', P + '9029.png', P + '3405.png'] }
  ],
  evaluation: { questions: [
    { type: 'trous', consigne: 'Compléter la définition avec deux des trois mots proposés.', source: 'Dans un accident, l’événement déclencheur est l’événement [soudain] qui, dans la situation dangereuse, cause le [dommage].', intrus: 'danger', points: 4 },
    { type: 'associer', consigne: 'Associer chaque situation dangereuse à son événement déclencheur.', paires: [{ g: 'Le cuisinier émince au couteau', d: 'La lame dérape' }, { g: 'Le plongeur traverse le sol mouillé', d: 'Son pied glisse' }, { g: 'Le cuisinier plonge un panier dans la friteuse', d: 'L’huile éclabousse' }], points: 6 },
    { type: 'ranger', consigne: 'Ranger chaque phrase : situation dangereuse ou événement déclencheur.', colonnes: [{ titre: 'Situation dangereuse', elements: ['Le plongeur porte une pile d’assiettes'] }, { titre: 'Événement déclencheur', elements: ['La pile lui échappe des mains', 'Il glisse sur une flaque'] }], points: 4 },
    { type: 'vf', texte: 'L’événement déclencheur arrive après le dommage.', reponse: false, points: 3, explication: 'Il arrive juste avant : c’est lui qui cause le dommage.' },
    { type: 'choix', chapeau: 'À partir du document 1 :', docTitre: 'Document 1 ·', document: 'Le cuisinier sort un plat du four. Sa manique glisse. Il se brûle la main.', consigne: 'Choisir l’événement déclencheur de cet accident.', choix: ['Le cuisinier sort un plat du four', 'Sa manique glisse', 'Il se brûle la main'], bonne: 1, points: 3, explication: 'La manique glisse d’un coup : c’est le moment où tout bascule.' }
  ] },
  carnet: {
    fait: ['J’ai relié situations et événements', 'J’ai remis un accident dans l’ordre', 'J’ai écrit un événement déclencheur'],
    appris: ['Le mot « événement déclencheur »', 'Le moment où tout bascule', 'L’ordre d’un accident'],
    difficile: ['Rien', 'Les mots', 'Remettre dans l’ordre']
  }
});
