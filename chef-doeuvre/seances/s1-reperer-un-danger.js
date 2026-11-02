/* Séance 1 · Repérer un danger (14 octobre) — d'après le Tableau, « Séance 1 · Le danger — C1PSR » et la feuille élève.
 * Définitions d'après l'INRS (DOC. 1) ; photos réalisées pour le cours. */
var P = 'img/pictos/';
/* Planche « Une cuisine collective » : les dangers VISIBLES (d'après le corrigé en dix situations, plus les feux des fourneaux).
 * [Contrôle 01/11/2026, A5] : on nomme ce qui se voit, jamais un comportement que l'image ne prouve pas. */
window.CDO_ZONES_CUISINE = [
  { nom: 'Le sol mouillé', x: 75, y: 85, w: 26, h: 16 },
  { nom: 'Le carton dans l’allée', x: 34.8, y: 47.9, w: 9, h: 13 },
  { nom: 'L’escabeau', x: 15.6, y: 25.5, w: 9, h: 39 },
  { nom: 'Le sac lourd', x: 24.2, y: 43.4, w: 10, h: 16 },
  { nom: 'Le produit d’entretien', x: 13.5, y: 69, w: 23, h: 38 },
  { nom: 'Le couteau', x: 54, y: 43.4, w: 8, h: 10 },
  { nom: 'Le four ouvert et la plaque brûlante', x: 91.5, y: 38.5, w: 12, h: 23 },
  { nom: 'L’huile très chaude', x: 64.4, y: 17.7, w: 9, h: 11 },
  { nom: 'La rallonge dans l’eau', x: 92, y: 78, w: 14, h: 16 },
  { nom: 'La casserole dont le manche dépasse', x: 77, y: 38, w: 12, h: 10 },
  { nom: 'Les feux et la vapeur des fourneaux', x: 77.5, y: 23.5, w: 13, h: 21 },
  { nom: 'La seconde friteuse', x: 79, y: 31, w: 7, h: 9 },
  { nom: 'La caisse de légumes lourde', x: 36, y: 23, w: 7, h: 12 },
  { nom: 'Les sacs d’oignons au sol', x: 5, y: 39, w: 8, h: 12 },
  { nom: 'Le casier de vaisselle lourd', x: 77, y: 63, w: 8, h: 12 },
  { nom: 'Les cartons rangés en hauteur', x: 9.5, y: 10.5, w: 19, h: 15 }
];
(window.CDO_SEANCES = window.CDO_SEANCES || []).push({
  id: 's1', numero: 1, date: '2026-10-14', titre: 'Repérer un danger', vignette: 'img/couteau.jpg',
  objectif: 'Être capable de repérer un danger dans une cuisine.',
  objectifsEleve: ['Comprendre les mots opérateur, danger, dommage', 'Reconnaître un danger sur une photo', 'Trouver des dangers dans une cuisine'],
  decouvrir: [
    { titre: 'L’opérateur', texte: 'La personne qui réalise le travail. Exemples : un cuisinier, une serveuse, un plongeur.', image: P + '6985.png' },
    { titre: 'Le danger', texte: 'Ce qui est susceptible de causer un dommage à une personne. Exemples : un couteau, une friteuse, un sol mouillé.', image: P + '25315.png' },
    { titre: 'Le dommage', texte: 'Une atteinte à la santé d’une personne : une blessure ou une maladie. Exemples : une coupure, une brûlure, une entorse, un mal de dos.', image: P + '21565.png', source: 'D’après INRS, ED 4472, 2022.' },
    { titre: 'Le schéma d’apparition d’un dommage', texte: 'Un opérateur exposé à un danger peut subir un dommage. Les étapes entre les deux seront étudiées plus tard.', schema: ['L’opérateur exposé', '+', 'Le danger', '→ peut causer →', 'Le dommage'], large: true }
  ],
  retenir: 'Un danger est ce qui est susceptible de causer un dommage à une personne. Le dommage est une atteinte à la santé : une blessure ou une maladie.',
  exercices: [
    { type: 'mots', titre: 'Trois mots à connaître', consigne: 'Toucher chaque mot pour découvrir sa définition.', mots: [
      { mot: 'L’opérateur', def: 'La personne qui réalise le travail.', exemple: 'Le cuisinier, la serveuse, le plongeur.', image: P + '6985.png' },
      { mot: 'Le danger', def: 'Ce qui est susceptible de causer un dommage à une personne.', exemple: 'Le couteau, la friteuse, le sol mouillé.', image: P + '25315.png' },
      { mot: 'Le dommage', def: 'Une atteinte à la santé : une blessure ou une maladie.', exemple: 'La coupure, la brûlure, le mal de dos.', image: P + '21565.png' }
    ] },
    { type: 'trous', titre: 'Définir le danger', consigne: 'Compléter le texte avec trois des quatre mots proposés.', source: 'Un danger est ce qui est [susceptible] de causer un [dommage] à une [personne].', intrus: 'prévention', indice: 'Le mot « prévention » ne sert pas.' },
    { type: 'classer', titre: 'Danger ou absence de danger ?', consigne: 'Classer chaque photographie.', grandesImages: true, colonnes: [
      { titre: 'Danger', elements: [{ t: 'Le couteau', image: 'img/couteau.jpg' }, { t: 'La friteuse', image: 'img/friteuse.jpg' }, { t: 'Le produit d’entretien', image: 'img/produit-entretien.jpg' }, { t: 'La flamme', image: 'img/flamme.jpg' }, { t: 'La trancheuse', image: 'img/trancheuse.jpg' }, { t: 'Le sol mouillé', image: 'img/sol-mouille.jpg' }, { t: 'Le sac de farine', image: 'img/sac-de-farine.jpg' }, { t: 'Le four', image: 'img/four.jpg' }] },
      { titre: 'Absence de danger', elements: [{ t: 'Le torchon', image: 'img/torchon.jpg' }, { t: 'Le cul-de-poule', image: 'img/cul-de-poule.jpg' }, { t: 'Le calot', image: 'img/calot.jpg' }, { t: 'La planche à découper', image: 'img/planche-a-decouper.jpg' }] }
    ], indice: 'Un danger peut couper, brûler, faire glisser, brûler la peau ou blesser le dos.' },
    { type: 'classer', titre: 'Un cuisinier émince des carottes', consigne: 'Classer chaque élément dans la bonne colonne.', image: 'img/pad-coupure-travail.jpg', alt: 'Un cuisinier émince des carottes au couteau.', colonnes: [
      { titre: 'L’opérateur', elements: [{ t: 'Le cuisinier', image: P + '6985.png' }] }, { titre: 'Le danger', elements: [{ t: 'Le couteau', image: P + '3237.png' }] }, { titre: 'Le dommage', elements: [{ t: 'Une coupure', image: P + '5484.png' }] }
    ] },
    { type: 'relier', titre: 'Au travail, puis après l’accident', consigne: 'Relier chaque danger au dommage qu’il a causé.', grandesImages: true, paires: [
      { g: 'Le sol mouillé', imageG: 'img/pad-chute-travail.jpg', d: 'Une entorse', imageD: 'img/pad-chute-dommage.jpg' },
      { g: 'Le produit d’entretien', imageG: 'img/pad-produit-travail.jpg', d: 'Une brûlure chimique de la peau', imageD: 'img/pad-produit-dommage.jpg' },
      { g: 'Le sac lourd', imageG: 'img/pad-sac-travail.jpg', d: 'Un mal de dos', imageD: 'img/pad-sac-dommage.jpg' },
      { g: 'L’huile très chaude', imageG: 'img/pad-friteuse-travail.jpg', d: 'Une brûlure', imageD: 'img/pad-friteuse-dommage.jpg' }
    ] },
    { type: 'chasse', titre: 'Chasse aux dangers : un entrepôt', consigne: 'Repérer chaque danger sur l’illustration.', image: 'img/entrepot.jpg', alt: 'Un entrepôt avec des chariots, des cartons et des employés.', zones: [
      { nom: 'Le chariot élévateur au premier plan', x: 66, y: 50, w: 22, h: 45 },
      { nom: 'Le chariot élévateur au fond', x: 39, y: 31, w: 12, h: 22 },
      { nom: 'La palette levée', x: 32.4, y: 11.4, w: 7, h: 18 },
      { nom: 'Le très gros carton', x: 43.2, y: 48.1, w: 10, h: 15 },
      { nom: 'La flaque d’huile dans l’allée', x: 25.2, y: 50.8, w: 11, h: 10 },
      { nom: 'Les cartons empilés en hauteur', x: 9.2, y: 11.4, w: 10, h: 16 },
      { nom: 'La lame du cutter', x: 41.2, y: 80.2, w: 8, h: 10 },
      { nom: 'Le câble abîmé près du chargeur', x: 22.1, y: 71.9, w: 10, h: 9 },
      { nom: 'Le bidon de produit dangereux renversé', x: 85.6, y: 79.3, w: 8, h: 9 }
    ] }
  ],
  evaluation: { questions: [
    { type: 'trous', consigne: 'Compléter la définition avec trois des quatre mots proposés.', source: 'Un danger est ce qui est [susceptible] de causer un [dommage] à une [personne].', intrus: 'prévention', points: 3 },
    { type: 'choix', consigne: 'Choisir l’objet qui est un danger.', choix: [{ t: 'Le torchon', image: 'img/torchon.jpg' }, { t: 'Le cul-de-poule', image: 'img/cul-de-poule.jpg' }, { t: 'Le calot', image: 'img/calot.jpg' }, { t: 'La trancheuse', image: 'img/trancheuse.jpg' }], bonne: 3, points: 3, explication: 'La lame de la trancheuse peut couper.' },
    { type: 'associer', consigne: 'Associer chaque danger au dommage qu’il peut causer.', paires: [{ g: 'Le couteau', image: P + '3237.png', d: 'Une coupure' }, { g: 'Le sol mouillé', image: P + '25936.png', d: 'Une entorse' }, { g: 'Le sac de 25 kg', image: P + '6210.png', d: 'Un mal de dos' }], points: 3 },
    { type: 'ranger', chapeau: 'À partir du document 1 :', docTitre: 'Document 1 · Le cuisinier plonge un panier dans la friteuse.', image: 'img/pad-friteuse-travail.jpg', consigne: 'Ranger chaque élément : opérateur, danger ou dommage possible.', colonnes: [{ titre: 'Opérateur', elements: ['Le cuisinier'] }, { titre: 'Danger', elements: ['L’huile très chaude'] }, { titre: 'Dommage possible', elements: ['Une brûlure'] }], points: 4 },
    { type: 'reperer', chapeau: 'À partir du document 2 :', docTitre: 'Document 2 · Une cuisine collective.', consigne: 'Repérer trois dangers en les touchant.', image: 'img/cuisine-collective.jpg', alt: 'Document 2 : une cuisine collective où travaillent plusieurs employés.', attendus: 3, zones: window.CDO_ZONES_CUISINE, points: 7 }
  ] },
  carnet: {
    fait: ['J’ai appris trois mots', 'J’ai classé des photos', 'J’ai cherché des dangers'],
    appris: ['Le mot « danger »', 'Le mot « dommage »', 'Le mot « opérateur »'],
    difficile: ['Rien', 'Les mots', 'Trouver les dangers']
  }
});
