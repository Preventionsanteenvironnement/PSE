/* Séance 3 · Du danger au dommage (18 novembre) — d'après le Tableau, séance 3. */
var P = 'img/pictos/';
(window.CDO_SEANCES = window.CDO_SEANCES || []).push({
  id: 's3', numero: 3, date: '2026-11-18', titre: 'Du danger au dommage', vignette: 'img/pad-coupure-dommage.jpg',
  objectif: 'Être capable d’associer un danger au dommage qu’il peut causer.',
  objectifsEleve: ['Revoir le mot « dommage »', 'Associer un danger à son dommage', 'Distinguer danger et dommage'],
  decouvrir: [
    { titre: 'Le dommage', texte: 'Un dommage est une atteinte à la santé : une blessure ou une maladie. Exemples : une coupure, une brûlure, une entorse, une fracture.', image: P + '21565.png' },
    { titre: 'Six dangers, six dommages', texte: 'Le sol mouillé : une entorse. Le couteau : une coupure. L’eau bouillante : une brûlure. Le produit dégraissant : une brûlure chimique de la peau. La rallonge abîmée : une électrisation (le courant traverse le corps). Le sac lourd : un mal de dos.', image: 'img/six-dangers-six-dommages.jpg', large: true },
    { titre: 'Une coupure légère', texte: 'Après avoir nettoyé la plaie, un pansement suffit.', image: 'img/pad-coupure-dommage.jpg' },
    { titre: 'Une coupure profonde', texte: 'Elle peut demander des points de suture et un arrêt de travail.', image: P + '5484.png' },
    { titre: 'Une main sectionnée', texte: 'Par une trancheuse : elle peut laisser une incapacité pour la vie. Le dommage peut être léger, grave ou très grave.', image: P + '35905.png' }
  ],
  retenir: 'Un dommage est une atteinte à la santé : une blessure ou une maladie. Un danger peut causer un ou plusieurs dommages : le couteau, une coupure ; l’huile chaude, une brûlure.',
  exercices: [
    { type: 'intrus', titre: 'Rappel : les familles de dangers', consigne: 'Trouver l’intrus dans chaque série.', images: { 'Le couteau': P + '3237.png', 'La trancheuse': P + '35905.png', 'La friteuse': P + '27772.png', 'La rallonge': P + '8656.png', 'Le dégraissant': 'img/produit-entretien.jpg' }, series: [
      { elements: ['Le couteau', 'La trancheuse', 'La friteuse', 'La boîte ouverte'], intrus: 2, explication: 'La friteuse appartient à la famille de la chaleur.' },
      { elements: ['Le dégraissant', 'Le désinfectant', 'La rallonge'], intrus: 2, explication: 'La rallonge appartient à la famille de l’électricité.' }
    ] },
    { type: 'relier', titre: 'À chaque danger son dommage', consigne: 'Relier chaque danger au dommage qu’il peut causer.', paires: [
      { g: 'Un sol mouillé', imageG: P + '25936.png', d: 'Une entorse', imageD: P + '3405.png' }, { g: 'Un couteau', imageG: P + '3237.png', d: 'Une coupure', imageD: P + '5484.png' },
      { g: 'De l’huile chaude', imageG: P + '27772.png', d: 'Une brûlure', imageD: P + '10266.png' }, { g: 'Un produit dégraissant', imageG: 'img/produit-entretien.jpg', d: 'Une brûlure chimique de la peau' },
      { g: 'Une rallonge abîmée', imageG: P + '8656.png', d: 'Une électrisation' }, { g: 'Un sac de 25 kg', imageG: P + '6210.png', d: 'Un mal de dos', imageD: P + '7775.png' }
    ] },
    { type: 'classer', titre: 'Danger ou dommage ?', consigne: 'Classer chaque mot dans la bonne colonne.', colonnes: [
      { titre: 'Un danger', elements: [{ t: 'La vapeur', image: 'img/four.jpg' }, { t: 'La trancheuse', image: P + '35905.png' }, { t: 'Un sol gras', image: P + '25936.png' }] },
      { titre: 'Un dommage', elements: [{ t: 'Une brûlure', image: P + '10266.png' }, { t: 'Une fracture', image: P + '26849.png' }, { t: 'Une coupure', image: P + '5484.png' }] }
    ], indice: 'Le dommage touche la santé de la personne : une blessure ou une maladie.' },
    { type: 'tableau', titre: 'Le danger, le dommage', consigne: 'Compléter le tableau.', colonnes: ['Le danger', 'Le dommage possible'], lignes: [['Un four chaud', '[Une brûlure]'], ['Un carton dans le passage', '[Une entorse]'], ['[Un couteau]', 'Une coupure'], ['Un sac de 25 kg', '[Un mal de dos]']], intrus: 'Une électrisation' },
    { type: 'qcm', titre: 'Observer une scène de travail', questions: [
      { image: 'img/pad-coupure-travail.jpg', alt: 'Un cuisinier découpe des carottes au couteau.', question: 'Choisir le dommage que peut causer l’outil utilisé.', choix: ['Une brûlure', 'Une coupure', 'Une entorse'], bonne: 1, explication: 'La lame peut couper la peau.' },
      { image: 'img/pad-chute-travail.jpg', alt: 'Un agent marche dans une zone où le sol est mouillé.', question: 'Choisir le dommage possible si la personne glisse.', choix: ['Une entorse', 'Une coupure', 'Une brûlure'], bonne: 0, explication: 'Une torsion de la cheville peut causer une entorse.' },
      { image: 'img/pad-sac-travail.jpg', alt: 'Un commis manipule un sac lourd.', question: 'Choisir le dommage possible lors du port du sac.', choix: ['Une brûlure à la main', 'Une coupure au doigt', 'Un mal de dos'], bonne: 2, explication: 'L’effort pour porter une charge lourde peut provoquer un mal de dos.' }
    ] },
    { type: 'motCourt', titre: 'Nommer le dommage', consigne: 'Nommer en un mot la blessure.', legende: 'La lame a ouvert la peau du doigt.', image: 'img/pad-coupure-dommage.jpg', alt: 'Un doigt porte un pansement. Un couteau est posé à côté.', acceptes: ['coupure', 'plaie', 'entaille'], indice: 'La lame a ouvert la peau. Chercher le nom précis de cette blessure.', explication: 'Une coupure.' }
  ],
  evaluation: { questions: [
    { type: 'trous', consigne: 'Compléter la définition avec deux des trois mots proposés.', source: 'Un dommage est une atteinte à la [santé] : une [blessure] ou une maladie.', intrus: 'sécurité', points: 4 },
    { type: 'associer', consigne: 'Associer chaque danger au dommage qu’il peut causer.', paires: [{ g: 'Un sol mouillé', image: P + '25936.png', d: 'Une entorse' }, { g: 'De l’huile chaude', image: P + '27772.png', d: 'Une brûlure' }, { g: 'Un produit dégraissant', image: 'img/produit-entretien.jpg', d: 'Une brûlure chimique de la peau' }, { g: 'Un sac de 25 kg', image: P + '6210.png', d: 'Un mal de dos' }], points: 6 },
    { type: 'ranger', consigne: 'Ranger chaque mot : danger ou dommage.', colonnes: [{ titre: 'Danger', elements: ['La friteuse', 'Un sol gras'] }, { titre: 'Dommage', elements: ['Une fracture', 'Une coupure'] }], points: 4 },
    { type: 'choix', consigne: 'Choisir le dommage qu’un couteau peut causer.', image: 'img/couteau.jpg', choix: ['Une brûlure', 'Une coupure', 'Une électrisation'], bonne: 1, points: 3 },
    { type: 'vf', texte: 'Un dommage peut être léger, grave ou très grave.', reponse: true, points: 3, explication: 'Une coupure peut demander un pansement ou des points de suture.' }
  ] },
  carnet: {
    fait: ['J’ai relié les dangers aux dommages', 'J’ai rangé les mots danger / dommage', 'J’ai complété le tableau'],
    appris: ['Le mot « dommage »', 'Un danger peut causer un dommage', 'Un dommage peut être léger ou grave'],
    difficile: ['Rien', 'Les mots', 'Travailler en équipe']
  }
});
