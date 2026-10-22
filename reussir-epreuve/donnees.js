/* Réussir l'épreuve PSE Bac Pro — données des statistiques (mapse.fr).
   Tirées des sujets nationaux et d'un échantillon de copies.
   Ce sont des ESTIMATIONS : une notion fréquente n'est pas sûre de tomber, une notion rare reste au programme.
   Pour une nouvelle session : ajouter le sujet à la base, recalculer, mettre à jour ce fichier. */
window.EPREUVE_DONNEES = {
  maj: "22/10/2026",
  sujets: 20,
  periode: "2022 à 2026",
  questions: { moyenne: 25, min: 20, max: 30, partie1: 15, partie2: 10 },

  // Part de chaque compétence dans les questions (438 questions de 17 sujets corrigés).
  competences: [
    { code: "C2", nom: "Analyser une situation", part: 48 },
    { code: "C3", nom: "Expliquer", part: 25 },
    { code: "C4", nom: "Proposer une solution", part: 14 },
    { code: "C5", nom: "Argumenter un choix", part: 13 }
  ],

  // Verbes de consigne : nombre de sujets (sur 20) où le verbe apparaît.
  verbes: [
    { verbe: "Expliquer", sujets: 20 },
    { verbe: "Identifier", sujets: 20 },
    { verbe: "Proposer", sujets: 20 },
    { verbe: "Argumenter", sujets: 19 },
    { verbe: "Indiquer", sujets: 18 },
    { verbe: "Préciser", sujets: 15 },
    { verbe: "Formuler", sujets: 11 },
    { verbe: "Sélectionner", sujets: 10 },
    { verbe: "Énoncer", sujets: 10 },
    { verbe: "Évaluer", sujets: 9 }
  ],

  // Notions : nombre de sujets (sur 20) où elles sont mobilisées.
  notionsPartie2: [
    { notion: "Proposer une mesure de prévention en nommant son type", sujets: 20 },
    { notion: "Danger, situation dangereuse, dommage", sujets: 19 },
    { notion: "Famille de risque (liste INRS)", sujets: 17 },
    { notion: "Acteurs de prévention", sujets: 16 },
    { notion: "Évaluer un risque", sujets: 15 },
    { notion: "Accident du travail, de trajet, de mission", sujets: 15 },
    { notion: "DUERP", sujets: 11 },
    { notion: "Obligations de l'employeur", sujets: 10 },
    { notion: "Suivi de l'état de santé", sujets: 10 },
    { notion: "CSE", sujets: 9 }
  ],
  notionsPartie1: [
    { notion: "Déchets et plastique", sujets: 15 },
    { notion: "Effet de serre, gaz à effet de serre", sujets: 12 },
    { notion: "Système de santé, santé publique", sujets: 12 },
    { notion: "Eau", sujets: 10 },
    { notion: "Sécurité alimentaire, principe de précaution", sujets: 10 }
  ],
  problematique: 16,          // sujets sur 20 qui demandent de formuler la problématique
  connaissanceApprise: 1 / 3, // part des questions dont la réponse n'est pas dans les documents

  // Estimation sur un échantillon : part des réponses au niveau maîtrisé, par type de tâche (arrondi).
  copies: {
    taches: [
      { tache: "Prélever une information dans un document", maitrise: 90 },
      { tache: "Proposer une mesure", maitrise: 55 },
      { tache: "Appliquer une méthode de la partie 2 (risques, acteurs, priorité)", maitrise: 30 },
      { tache: "Expliquer un phénomène ou une règle", maitrise: 20 },
      { tache: "Argumenter, justifier", maitrise: 15 },
      { tache: "Formuler la problématique", maitrise: 10 }
    ]
  }
};
