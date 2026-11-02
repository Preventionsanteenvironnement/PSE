/* Séance 7 · La prévention : casser la chaîne (16 décembre) — d'après le Tableau, séance 7.
 * Écart volontaire avec le Tableau, conforme à la référence PSE (SOL-02, SOL-07) : l'information et la formation
 * accompagnent toujours les autres mesures (elles ne sont pas un « dernier niveau ») ; le panneau « sol glissant »
 * (signalisation, information) n'est plus classé en protection collective. */
var P = 'img/pictos/';
(window.CDO_SEANCES = window.CDO_SEANCES || []).push({
  id: 's7', numero: 7, date: '2026-12-16', titre: 'La prévention : casser la chaîne', vignette: 'img/trancheuse.jpg',
  objectif: 'Être capable de choisir une mesure de prévention adaptée.',
  objectifsEleve: ['Comprendre le mot « prévention »', 'Distinguer protection collective et individuelle', 'Choisir une mesure contre un danger'],
  decouvrir: [
    { titre: 'Casser la chaîne', texte: 'Pour éviter le dommage, on casse un maillon du processus. C’est la prévention.', schema: ['Le danger', '+', 'L’opérateur', '→ exposition →', 'La situation dangereuse', '→ survient →', 'L’événement déclencheur', '→ entraîne →', 'Le dommage'], large: true },
    { titre: 'D’abord : supprimer ou réduire le danger', texte: 'Essuyer tout de suite un sol mouillé ; faire réparer ou remplacer une rallonge abîmée ; utiliser un produit moins dangereux à la place d’un produit corrosif.' },
    { titre: 'Ensuite : les mesures collectives', texte: 'Elles protègent toutes les personnes exposées : une hotte aspirante, un carter sur la trancheuse, un support pour ranger les couteaux, un chariot pour poser les plaques à la sortie du four.' },
    { titre: 'Puis : la protection individuelle', texte: 'Elle protège une seule personne : des chaussures antidérapantes, des gants anti-chaleur, un gant anti-coupure.' },
    { titre: 'Toujours : l’information et la formation', texte: 'Elles accompagnent chaque mesure : une consigne affichée, une formation aux gestes, un panneau « sol glissant ».' }
  ],
  retenir: 'La prévention casse la chaîne du processus d’apparition du dommage. D’abord supprimer ou réduire le danger, puis protéger collectivement, puis individuellement. L’information et la formation accompagnent toujours ces mesures.',
  exercices: [
    { type: 'chaine', titre: 'Rappel : le processus', consigne: 'Compléter le processus d’apparition du dommage.', etapes: [{ texte: 'Danger + opérateur', cache: true }, { texte: 'Situation dangereuse' }, { texte: 'Événement déclencheur', cache: true }, { texte: 'Dommage', cache: true }], intrus: 'Prévention' },
    { type: 'classer', titre: 'Ranger les mesures', consigne: 'Classer chaque mesure dans la bonne colonne.', colonnes: [
      { titre: 'Protection collective', elements: [{ t: 'Un carter sur la trancheuse' }, { t: 'Une hotte aspirante' }, { t: 'Une grille de protection sur le batteur' }] },
      { titre: 'Protection individuelle', elements: [{ t: 'Des gants anti-chaleur' }, { t: 'Des chaussures antidérapantes' }, { t: 'Un gant en cotte de mailles' }] }
    ], indice: 'Une protection collective protège toutes les personnes exposées ; une protection individuelle protège une seule personne.' },
    { type: 'relier', titre: 'À chaque danger sa mesure', consigne: 'Relier chaque danger à une mesure de prévention.', paires: [
      { g: 'Un sol mouillé', imageG: P + '25936.png', d: 'Essuyer tout de suite' }, { g: 'Un couteau', imageG: P + '3237.png', d: 'Ranger dans son support' },
      { g: 'De l’huile chaude', imageG: P + '27772.png', d: 'Porter des gants anti-chaleur' }, { g: 'Un produit dégraissant', imageG: 'img/produit-entretien.jpg', d: 'Utiliser un produit moins dangereux' },
      { g: 'Une rallonge abîmée', imageG: P + '8656.png', d: 'Faire réparer ou remplacer' }
    ] },
    { type: 'qcm', titre: 'Quelle mesure en premier ?', consigne: 'Choisir la bonne réponse.', questions: [
      { question: 'Quelle mesure cherche-t-on en premier ?', choix: ['Porter des gants', 'Supprimer ou réduire le danger', 'Afficher une consigne'], bonne: 1, explication: 'On agit d’abord sur le danger lui-même.' },
      { question: 'Un carter sur une trancheuse est une protection…', choix: ['collective', 'individuelle'], bonne: 0, explication: 'Il protège toutes les personnes qui utilisent la machine.' }
    ] },
    { type: 'vfserie', titre: 'Bilan de la période', consigne: 'Indiquer si chaque affirmation est vraie ou fausse.', affirmations: [
      { texte: 'Un danger est une atteinte à la santé.', reponse: false, justification: 'C’est la définition du dommage.' },
      { texte: 'Dans une situation dangereuse, il y a toujours un opérateur.', reponse: true, justification: 'L’opérateur est exposé au danger.' },
      { texte: 'L’événement déclencheur arrive après le dommage.', reponse: false, justification: 'Il arrive juste avant : c’est lui qui cause le dommage.' },
      { texte: 'Des gants sont une protection individuelle.', reponse: true, justification: 'Ils protègent une seule personne.' },
      { texte: 'On cherche d’abord à supprimer ou à réduire le danger.', reponse: true, justification: 'C’est la première mesure.' }
    ] }
  ],
  evaluation: { questions: [
    { type: 'choix', consigne: 'Choisir la mesure à chercher en premier.', choix: ['Porter des gants', 'Supprimer ou réduire le danger', 'Afficher une consigne'], bonne: 1, points: 3 },
    { type: 'ranger', consigne: 'Ranger chaque mesure : protection collective ou individuelle.', colonnes: [{ titre: 'Collective', elements: ['Une hotte aspirante', 'Un carter sur la trancheuse'] }, { titre: 'Individuelle', elements: ['Des gants anti-chaleur', 'Des chaussures antidérapantes'] }], points: 4 },
    { type: 'associer', consigne: 'Associer chaque danger à une mesure de prévention.', paires: [{ g: 'Un sol mouillé', image: P + '25936.png', d: 'Essuyer tout de suite' }, { g: 'Un couteau', image: P + '3237.png', d: 'Ranger dans son support' }, { g: 'Une rallonge abîmée', image: P + '8656.png', d: 'Faire réparer ou remplacer' }], points: 5 },
    { type: 'vf', texte: 'L’information et la formation accompagnent toujours les autres mesures.', reponse: true, points: 2 },
    { type: 'choix', chapeau: 'À partir du document 1 :', docTitre: 'Document 1 ·', document: 'Une employée sort une plaque brûlante du four.', consigne: 'Choisir une mesure collective pour éviter cette brûlure.', choix: ['Un chariot pour poser la plaque à la sortie du four', 'Des gants anti-chaleur', 'Un tablier en coton'], bonne: 0, points: 3 },
    { type: 'choix', chapeau: 'À partir du document 1 :', docTitre: 'Document 1 ·', document: 'Une employée sort une plaque brûlante du four.', consigne: 'Choisir la protection individuelle pour éviter cette brûlure.', choix: ['Des gants anti-chaleur', 'Des chaussures antidérapantes', 'Une hotte aspirante'], bonne: 0, points: 3 }
  ] },
  carnet: {
    fait: ['J’ai rangé des mesures de prévention', 'J’ai choisi une mesure pour notre processus', 'J’ai dessiné la case « prévention »'],
    appris: ['Le mot « prévention »', 'Collective ou individuelle', 'Dans quel ordre agir'],
    difficile: ['Rien', 'Collective ou individuelle', 'Travailler en équipe']
  }
});
