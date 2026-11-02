/* Séance 6 · Le processus d'apparition du dommage (9 décembre) — d'après le Tableau, séance 6. */
var P = 'img/pictos/';
(window.CDO_SEANCES = window.CDO_SEANCES || []).push({
  id: 's6', numero: 6, date: '2026-12-09', titre: 'Le processus d’apparition du dommage', vignette: 'img/pad-chute-travail.jpg',
  objectif: 'Être capable de reconstituer le processus d’apparition d’un dommage.',
  objectifsEleve: ['Connaître les cinq mots du processus', 'Remettre le processus dans l’ordre', 'Compléter le processus d’un accident'],
  decouvrir: [
    { titre: 'Le processus d’apparition du dommage', texte: 'Dans un accident, le chemin qui mène du danger au dommage. On l’appelle aussi le PAD.', schema: ['Le danger', '+', 'L’opérateur', '→ exposition →', 'La situation dangereuse', '→ survient →', 'L’événement déclencheur', '→ entraîne →', 'Le dommage'], large: true },
    { titre: 'Une chute, étape par étape', texte: 'La situation dangereuse : le plongeur traverse le sol mouillé. L’événement déclencheur : son pied glisse. Le dommage : une entorse.', image: 'img/moment-ou-tout-bascule.jpg', large: true },
    { titre: 'Notre futur support', texte: 'Une case par étape : l’opérateur, le danger, la situation dangereuse, l’événement déclencheur, le dommage, puis une case pour la prévention.' }
  ],
  retenir: 'Dans un accident, le processus d’apparition du dommage : le danger et l’opérateur, la situation dangereuse, l’événement déclencheur, le dommage. Casser un maillon de la chaîne permet d’éviter le dommage.',
  exercices: [
    { type: 'relier', titre: 'Rappel : les cinq mots', consigne: 'Relier chaque mot à sa définition.', paires: [
      { g: 'Le danger', imageG: P + '25315.png', d: 'Ce qui est susceptible de causer un dommage' }, { g: 'L’opérateur', imageG: P + '6985.png', d: 'Personne qui réalise le travail' },
      { g: 'La situation dangereuse', d: 'L’opérateur est exposé au danger' }, { g: 'L’événement déclencheur', imageG: P + '9029.png', d: 'Le moment où tout bascule' },
      { g: 'Le dommage', imageG: P + '21565.png', d: 'Atteinte à la santé' }
    ] },
    { type: 'chaine', titre: 'Le processus en chaîne', consigne: 'Compléter les cases manquantes du processus.', etapes: [{ texte: 'Danger + opérateur' }, { texte: 'Situation dangereuse', cache: true }, { texte: 'Événement déclencheur', cache: true }, { texte: 'Dommage' }], intrus: 'Prévention' },
    { type: 'tableau', titre: 'Le processus de la brûlure', consigne: 'Compléter le processus d’apparition du dommage.', image: 'img/pad-friteuse-travail.jpg', colonnes: ['L’élément', 'Dans la cuisine'], lignes: [
      ['Le danger', 'L’huile chaude de la friteuse'], ['L’opérateur', '[Le cuisinier]'],
      ['La situation dangereuse', '[Le cuisinier plonge un panier de frites dans l’huile chaude]'], ['L’événement déclencheur', '[L’huile éclabousse]'], ['Le dommage possible', '[Une brûlure à la main]']
    ], intrus: 'Une coupure au doigt' },
    { type: 'ordre', titre: 'Le processus de la coupure', consigne: 'Remettre les éléments du processus dans l’ordre.', etapes: ['Un couteau', 'Le cuisinier émince des carottes', 'Le couteau glisse sur la carotte', 'Une coupure au doigt'], images: [P + '3237.png', 'img/pad-coupure-travail.jpg', P + '21565.png', 'img/pad-coupure-dommage.jpg'] }
  ],
  evaluation: { questions: [
    { type: 'associer', consigne: 'Associer chaque mot à sa définition.', paires: [{ g: 'Le danger', d: 'Ce qui est susceptible de causer un dommage' }, { g: 'La situation dangereuse', d: 'L’opérateur est exposé au danger' }, { g: 'L’événement déclencheur', d: 'Le moment où tout bascule' }, { g: 'Le dommage', d: 'Atteinte à la santé' }], points: 6 },
    { type: 'ranger', chapeau: 'À partir du document 1 :', docTitre: 'Document 1 ·', document: 'Dans la réserve, le commis soulève un sac de farine de 25 kg. Il fait un effort brusque. Une douleur soudaine lui bloque le dos : un lumbago.', image: 'img/pad-sac-travail.jpg', consigne: 'Ranger chaque élément : danger, situation dangereuse, événement déclencheur ou dommage.', colonnes: [{ titre: 'Danger', elements: ['Le sac de 25 kg'] }, { titre: 'Situation dangereuse', elements: ['Le commis soulève le sac'] }, { titre: 'Événement déclencheur', elements: ['Il fait un effort brusque'] }, { titre: 'Dommage', elements: ['Un lumbago'] }], points: 8 },
    { type: 'vf', texte: 'Casser un maillon de la chaîne permet d’éviter le dommage.', reponse: true, points: 3 },
    { type: 'choix', consigne: 'Choisir le premier maillon du processus.', choix: ['Le dommage', 'Le danger et l’opérateur', 'L’événement déclencheur'], bonne: 1, points: 3 }
  ] },
  carnet: {
    fait: ['J’ai complété un processus', 'J’ai remis un processus dans l’ordre', 'J’ai construit le processus de mon équipe'],
    appris: ['Les cinq mots du processus', 'L’ordre du processus', 'Retirer un maillon évite le dommage'],
    difficile: ['Rien', 'L’ordre des maillons', 'Travailler en équipe']
  }
});
