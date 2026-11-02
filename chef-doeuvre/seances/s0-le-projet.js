/* Séance 0 · Comprendre le chef-d'œuvre — d'après le Tableau, dossier « 0 · Le projet et la frise de l'année ».
 * Le support (BD, photos, affiche…) reste à choisir avec la classe : rien n'est figé ici. */
(window.CDO_SEANCES = window.CDO_SEANCES || []).push({
  id: 's0', numero: 0, date: null, titre: 'Comprendre le chef-d’œuvre', vignette: 'img/cuisine-collective.jpg',
  objectif: 'Être capable d’expliquer ce qu’est le chef-d’œuvre et comment il est évalué.',
  objectifsEleve: ['Comprendre ce qu’est le chef-d’œuvre', 'Connaître les rôles dans l’équipe', 'Savoir comment le chef-d’œuvre est noté'],
  decouvrir: [
    { titre: 'Le chef-d’œuvre, c’est quoi ?', texte: 'Une réalisation concrète, liée au métier, individuelle ou collective. Pour finir, un oral de 10 minutes, seul devant deux professeurs. Notre classe a choisi un projet d’équipe, où chacun a sa part personnelle.', image: 'img/pictos/6985.png' },
    { titre: 'Notre projet', texte: 'Illustrer les dangers du métier en cuisine et leur prévention : le sol glissant, les couteaux, la chaleur, les charges… Pour les nouvelles classes, afin qu’elles repèrent les dangers avant de se blesser. Le support reste à choisir ensemble.', image: 'img/cuisine-collective.jpg', large: true },
    { titre: 'Les rôles', texte: 'Le scénariste écrit l’histoire. Le photographe ou l’illustrateur réalise les images. Les acteurs jouent la scène. Le responsable sécurité vérifie que personne ne se met en danger. Le monteur met en page. Dans notre classe, chacun tient au moins deux rôles : c’est sa part personnelle.' },
    { titre: 'Travailler en équipe', texte: 'Chacun a un rôle et le tient. Une personne parle à la fois. On se met d’accord avant d’écrire. On range et on rend le travail à l’heure.' },
    { titre: 'Sans se blesser', texte: 'Toutes les scènes sont simulées. Matériel de cuisson éteint et froid. Couteau posé ou factice. Eau à la place des produits chimiques. Le dommage est maquillé : pansement, bandage.' },
    { titre: 'Ce qui est évalué', texte: 'Pendant l’année : s’impliquer, tenir sa place dans l’équipe, savoir dire où en est le projet. À l’oral : raconter la démarche, dire les difficultés et les points forts, montrer l’intérêt du projet pour le métier.' }
  ],
  retenir: 'La note du chef-d’œuvre : moitié pour le travail de la formation, moitié pour l’oral de 10 minutes. Chacun a une part personnelle dans le projet de l’équipe.',
  exercices: [
    { type: 'vfserie', titre: 'Le chef-d’œuvre en cinq affirmations', consigne: 'Indiquer si chaque affirmation est vraie ou fausse.', affirmations: [
      { texte: 'Le chef-d’œuvre est lié au métier.', reponse: true, justification: 'C’est une réalisation concrète du métier.' },
      { texte: 'Le chef-d’œuvre se termine par un oral.', reponse: true, justification: 'Un oral de 10 minutes devant deux professeurs.' },
      { texte: 'L’oral dure 10 minutes.', reponse: true, justification: 'Environ 5 minutes de présentation et 5 minutes de questions.' },
      { texte: 'Pendant les scènes, on utilise un vrai produit chimique.', reponse: false, justification: 'On utilise de l’eau à la place des produits chimiques.' },
      { texte: 'L’oral compte pour la moitié de la note.', reponse: true, justification: 'L’autre moitié vient du travail de la formation.' }
    ] },
    { type: 'relier', titre: 'Les rôles dans l’équipe', consigne: 'Relier chaque rôle à sa mission.', paires: [
      { g: 'Le scénariste', d: 'Il écrit l’histoire' }, { g: 'Le responsable sécurité', d: 'Il vérifie que personne ne se met en danger' },
      { g: 'Le monteur', d: 'Il met en page' }, { g: 'Les acteurs', d: 'Ils jouent la scène' }
    ] },
    { type: 'classer', titre: 'Ce qui est évalué', consigne: 'Classer chaque élément selon le moment où il est évalué.', colonnes: [
      { titre: 'Pendant l’année', elements: ['S’impliquer', 'Tenir sa place dans l’équipe', 'Dire où en est le projet'] },
      { titre: 'À l’oral', elements: ['Raconter la démarche', 'Dire les difficultés et les points forts', 'Montrer l’intérêt pour le métier'] }
    ] },
    { type: 'qcm', titre: 'Notre projet', consigne: 'Choisir la bonne réponse.', questions: [
      { question: 'Pour qui la classe réalise-t-elle ce projet ?', choix: ['Pour les nouvelles classes du lycée', 'Pour un restaurant', 'Pour les parents'], bonne: 0, explication: 'Pour qu’elles repèrent les dangers avant de se blesser.' },
      { question: 'Pendant une scène, la plaque de cuisson est…', choix: ['allumée', 'éteinte et froide'], bonne: 1, explication: 'Toutes les scènes sont simulées.' }
    ] }
  ],
  evaluation: { questions: [
    { type: 'choix', consigne: 'Choisir la durée de l’oral du chef-d’œuvre.', choix: ['5 minutes', '10 minutes', '30 minutes'], bonne: 1, points: 3, explication: 'Environ 5 minutes de présentation et 5 minutes de questions.' },
    { type: 'vf', texte: 'Dans le projet de la classe, chacun a une part personnelle.', reponse: true, points: 3, explication: 'Chacun tient au moins deux rôles.' },
    { type: 'associer', consigne: 'Associer chaque rôle à sa mission.', paires: [{ g: 'Le scénariste', d: 'Écrire l’histoire' }, { g: 'Le responsable sécurité', d: 'Vérifier que personne ne se met en danger' }, { g: 'Le monteur', d: 'Mettre en page' }], points: 4 },
    { type: 'ranger', consigne: 'Ranger chaque élément selon le moment où il est évalué.', colonnes: [{ titre: 'Pendant l’année', elements: ['S’impliquer', 'Tenir sa place dans l’équipe'] }, { titre: 'À l’oral', elements: ['Raconter la démarche', 'Dire les difficultés'] }], points: 4 },
    { type: 'trous', consigne: 'Compléter la phrase avec deux des trois mots proposés.', source: 'Le chef-d’œuvre se termine par un [oral] de 10 minutes, devant deux [professeurs].', intrus: 'élèves', points: 3 },
    { type: 'choix', consigne: 'Choisir le public du projet de la classe.', choix: ['Les nouvelles classes du lycée', 'Les clients d’un restaurant', 'Les parents d’élèves'], bonne: 0, points: 3, explication: 'Le projet aide les nouvelles classes à repérer les dangers.' }
  ] },
  carnet: {
    fait: ['J’ai découvert le chef-d’œuvre', 'J’ai découvert les rôles', 'J’ai fait les exercices'],
    appris: ['Ce qu’est un chef-d’œuvre', 'Les rôles dans l’équipe', 'Comment il est noté'],
    difficile: ['Rien', 'Les mots', 'Comprendre la notation']
  }
});
