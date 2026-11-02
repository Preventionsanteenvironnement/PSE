/* Séance 2 · Les dangers de la cuisine (4 novembre) — d'après le Tableau, séance 2. */
var P = 'img/pictos/';
(window.CDO_SEANCES = window.CDO_SEANCES || []).push({
  id: 's2', numero: 2, date: '2026-11-04', titre: 'Les dangers de la cuisine', vignette: 'img/friteuse.jpg',
  objectif: 'Être capable de nommer les dangers d’une cuisine et de les classer.',
  objectifsEleve: ['Connaître les six familles de dangers', 'Classer un danger dans sa famille', 'Trouver les dangers d’une cuisine'],
  decouvrir: [
    { titre: 'Le sol', texte: 'Mouillé, gras, encombré.', image: P + '25936.png' },
    { titre: 'Les objets coupants', texte: 'Couteau, trancheuse, boîte ouverte.', image: P + '3237.png' },
    { titre: 'La chaleur', texte: 'Plaque, four, friteuse, vapeur.', image: P + '4654.png' },
    { titre: 'Les produits chimiques', texte: 'Dégraissant, désinfectant.', image: 'img/produit-entretien.jpg' },
    { titre: 'L’électricité', texte: 'Appareil, prise, rallonge.', image: P + '8656.png' },
    { titre: 'Les charges', texte: 'Sac, bac plein, carton porté.', image: P + '6210.png' }
  ],
  retenir: 'Les principaux dangers de la cuisine se rangent en familles : le sol, les objets coupants, la chaleur, les produits chimiques, l’électricité, les charges.',
  exercices: [
    { type: 'trous', titre: 'Rappel : le danger', consigne: 'Compléter la définition avec deux des trois mots proposés.', source: 'Un danger est ce qui est [susceptible] de causer un [dommage] à une personne.', intrus: 'danger' },
    { type: 'mots', titre: 'Les six familles de dangers', consigne: 'Toucher chaque famille pour découvrir des exemples.', mots: [
      { mot: 'Le sol', def: 'Mouillé, gras, encombré.', image: P + '25936.png' }, { mot: 'Les objets coupants', def: 'Couteau, trancheuse, boîte ouverte.', image: P + '3237.png' },
      { mot: 'La chaleur', def: 'Plaque, four, friteuse, vapeur.', image: P + '4654.png' }, { mot: 'Les produits chimiques', def: 'Dégraissant, désinfectant.', image: 'img/produit-entretien.jpg' },
      { mot: 'L’électricité', def: 'Appareil, prise, rallonge.', image: P + '8656.png' }, { mot: 'Les charges', def: 'Sac, bac plein, carton porté.', image: P + '6210.png' }
    ] },
    { type: 'classer', titre: 'Ranger les dangers', consigne: 'Classer chaque danger dans sa famille.', colonnes: [
      { titre: 'La chaleur', elements: [{ t: 'La friteuse', image: P + '27772.png' }, { t: 'La vapeur du four', image: 'img/four.jpg' }] },
      { titre: 'Les objets coupants', elements: [{ t: 'La trancheuse', image: P + '35905.png' }, { t: 'Une boîte de conserve ouverte' }] },
      { titre: 'Le sol', elements: [{ t: 'Une flaque d’huile', image: P + '25936.png' }, { t: 'Un carton dans le passage', image: P + '7054.png' }] }
    ] },
    { type: 'relier', titre: 'Les dangers et leur famille', consigne: 'Relier chaque danger à sa famille.', paires: [
      { g: 'Un bidon de dégraissant', imageG: 'img/produit-entretien.jpg', d: 'Les produits chimiques' },
      { g: 'Une rallonge abîmée', d: 'L’électricité' },
      { g: 'Un sac de farine de 25 kg', imageG: 'img/sac-de-farine.jpg', d: 'Les charges' },
      { g: 'Un brûleur à gaz allumé', imageG: 'img/flamme.jpg', d: 'La chaleur' },
      { g: 'Un couteau d’office', imageG: 'img/couteau.jpg', d: 'Les objets coupants' }
    ] },
    { type: 'quisuisje', titre: 'Qui suis-je ?', consigne: 'Trouver le danger à partir des indices.', indices: ['Je suis dans presque toutes les cuisines.', 'Je chauffe l’huile très fort.', 'Je contiens un bain d’huile.'], reponse: 'La friteuse', leurres: ['Le four', 'La trancheuse'], images: { 'La friteuse': P + '27772.png', 'Le four': P + '10135.png', 'La trancheuse': P + '35905.png' }, explication: 'Danger lié à la chaleur.' },
    { type: 'chasse', titre: 'Chasse aux dangers : une cuisine collective', consigne: 'Repérer chaque danger sur l’illustration.', image: 'img/cuisine-collective.jpg', alt: 'Une cuisine collective où travaillent plusieurs employés.', zones: window.CDO_ZONES_CUISINE }
  ],
  evaluation: { questions: [
    { type: 'associer', consigne: 'Associer chaque danger à sa famille.', paires: [{ g: 'Une flaque d’huile', image: P + '25936.png', d: 'Le sol' }, { g: 'La trancheuse', image: P + '35905.png', d: 'Les objets coupants' }, { g: 'La friteuse', image: P + '27772.png', d: 'La chaleur' }, { g: 'Le dégraissant', image: 'img/produit-entretien.jpg', d: 'Les produits chimiques' }, { g: 'Une rallonge abîmée', image: P + '8656.png', d: 'L’électricité' }], points: 6 },
    { type: 'choix', consigne: 'Choisir la famille du sac de farine de 25 kg.', image: 'img/sac-de-farine.jpg', choix: ['La chaleur', 'Les charges', 'Le sol'], bonne: 1, points: 3, explication: 'Un sac lourd fait partie des charges.' },
    { type: 'vf', texte: 'La vapeur du four est un danger lié à la chaleur.', reponse: true, points: 3, explication: 'La vapeur peut brûler.' },
    { type: 'trous', consigne: 'Compléter la phrase avec deux des trois mots proposés.', source: 'Les principaux dangers de la cuisine se rangent en [familles] : le sol, les objets coupants, la [chaleur]…', intrus: 'dommages', points: 3 },
    { type: 'reperer', chapeau: 'À partir du document 1 :', docTitre: 'Document 1 · Une cuisine collective.', consigne: 'Repérer deux dangers liés à la chaleur en les touchant.', image: 'img/cuisine-collective.jpg', alt: 'Document 1 : une cuisine collective où travaillent plusieurs employés.', attendus: 2, zones: window.CDO_ZONES_CUISINE.filter(function (z) { return /four|huile|casserole|feux|friteuse/.test(z.nom); }), points: 5 }
  ] },
  carnet: {
    fait: ['J’ai rangé des dangers en familles', 'J’ai cherché des dangers dans la cuisine', 'J’ai été rapporteur de mon équipe'],
    appris: ['Les six familles de dangers', 'Ranger un danger dans sa famille', 'Où sont les dangers en cuisine'],
    difficile: ['Rien', 'Les familles', 'Travailler en équipe']
  }
});
