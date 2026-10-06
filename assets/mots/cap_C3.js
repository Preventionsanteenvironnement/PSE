/* Mots du module C3 CAP — La démarche de prévention appliquée à une activité de travail.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours La démarche de prévention appliquée à une activité de travail v1.0 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation d'Inès */
window.MOTS = {
  module: "C3", classe: "CAP", titre: "La démarche de prévention appliquée à une activité de travail", retour: "cap_C3_jeux.html", cle: "CAPC3",
  seances: { 1: "Les consignes et l'activité de travail", 2: "Le danger et le PAD", 3: "Les mesures de protection" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Les formes d'une consigne de sécurité", m: ["VISUELLE", "ÉCRITE", "ORALE"] },
    { l: "Les composantes de l'ITaMaMi", m: ["INDIVIDU", "TÂCHE", "ACTIVITÉ", "MATÉRIEL", "MILIEU"] },
    { l: "Les éléments du PAD", m: ["DANGER", "OPÉRATEUR", "SITUATION DANGEREUSE", "ÉVÉNEMENT DANGEREUX", "DOMMAGE POTENTIEL"] },
    { l: "Des dangers au poste de travail", m: ["COUTEAU", "SOL MOUILLÉ", "FOUR CHAUD", "CARTON LOURD"] },
    { l: "Des dommages", m: ["BRÛLURE", "COUPURE", "ENTORSE", "FRACTURE"] },
    { l: "Des protections collectives", m: ["CAPOT", "VENTILATION", "PROTÈGE-LAME"] },
    { l: "Des protections individuelles (EPI)", m: ["GANTS", "LUNETTES", "CHAUSSURES DE SÉCURITÉ"] }
  ],
  liste: [
    { m: "CONSIGNE", s: 1, d: "Message qui indique ce qu'il faut faire ou ne pas faire pour travailler sans danger.", e: "Elle peut être visuelle, écrite ou orale. Donner les instructions appropriées fait partie des principes généraux de prévention.", x: "Dans la situation : Inès ne suit pas celles de la fiche de poste parce qu'elle est pressée." },
    { m: "VISUELLE", s: 1, d: "Forme de consigne transmise par un pictogramme ou une affiche.", e: "Elle se comprend d'un coup d'œil, sans lire de texte." },
    { m: "ÉCRITE", s: 1, d: "Forme de consigne transmise par une fiche de poste ou la notice d'une machine.", e: "Elle reste affichée ou disponible : on peut la relire à tout moment." },
    { m: "ORALE", s: 1, d: "Forme de consigne transmise de vive voix par un responsable ou un tuteur.", e: "Elle complète les consignes visuelles et écrites." },
    { m: "PICTOGRAMME", s: 1, d: "Dessin qui transmet une consigne visuelle : danger, obligation ou interdiction.", e: "Sur la fiche de la trancheuse : triangle jaune pour le danger, disque bleu pour l'obligation, cercle rouge barré pour l'interdiction." },
    { m: "FICHE DE POSTE", s: 1, d: "Document affiché près de la machine, qui donne par écrit les consignes d'une tâche.", e: "L'employeur s'en sert pour former et informer les salariés.", x: "Dans la situation : débrancher, mettre des gants anti-coupure, remettre le protège-lame." },
    { m: "INFORMATION", s: 1, d: "Renseignement donné pour comprendre un risque.", e: "Exemple : « Lame très coupante ». Elle fait comprendre ; l'instruction, elle, dit quoi faire." },
    { m: "INSTRUCTION", s: 1, d: "Ordre précis à appliquer.", e: "Exemple : « Débrancher la trancheuse ». Une phrase qui commence par un verbe d'action en est une." },
    { m: "OUTIL D'ANALYSE", s: 1, d: "Méthode qui aide à décrire une activité de travail avant de chercher les risques.", e: "Le cours en présente deux : le QQOQCP et l'ITaMaMi." },
    { m: "QQOQCP", s: 1, d: "Méthode qui pose six questions : Qui ? Quoi ? Où ? Quand ? Comment ? Pourquoi ?", e: "Elle sert à relever les éléments d'une situation avant de chercher les risques." },
    { m: "ITAMAMI", s: 1, d: "Méthode qui décrit cinq composantes : individu, tâche, activité, matériel, milieu.", e: "Elle fait apparaître l'écart entre le travail demandé et ce que la personne fait réellement." },
    { m: "INDIVIDU", s: 1, d: "La personne qui travaille, avec son âge, son expérience, sa formation.", e: "C'est la première composante de l'ITaMaMi.", x: "Dans la situation : Inès, 24 ans, employée polyvalente depuis quatre mois." },
    { m: "TÂCHE", s: 1, d: "Le travail demandé.", e: "Elle peut être différente de l'activité, c'est-à-dire de ce que la personne fait réellement.", x: "Dans la situation : nettoyer la trancheuse en respectant la fiche de poste." },
    { m: "ACTIVITÉ", s: 1, d: "Ce que la personne fait réellement pour réaliser le travail demandé.", e: "Quand elle s'écarte de la tâche, cet écart peut exposer au danger.", x: "Dans la situation : Inès nettoie la lame avec une éponge, trancheuse branchée, sans gants." },
    { m: "MATÉRIEL", s: 1, d: "Les outils, les machines et les produits utilisés.", e: "C'est une composante de l'ITaMaMi, avec l'individu, la tâche, l'activité et le milieu.", x: "Dans la situation : la trancheuse à jambon et une éponge." },
    { m: "MILIEU", s: 1, d: "Le lieu, le moment, l'ambiance et l'organisation du travail.", e: "C'est la dernière composante de l'ITaMaMi.", x: "Dans la situation : la cuisine de la cafétéria, avant la réouverture à 14 heures." },

    { m: "POSTE DE TRAVAIL", s: 2, d: "Endroit où l'opérateur exerce son activité, avec son matériel.", e: "Exemples : la cuisson au four, la découpe des légumes, le lavage des sols, le rangement de la réserve." },
    { m: "DANGER", s: 2, d: "Ce qui peut porter atteinte à la santé : équipement, produit, énergie, situation ou organisation de travail.", e: "Exemples : le four chaud, le couteau, le sol mouillé. Il ne blesse que si un opérateur y est exposé.", x: "Dans la situation : la lame coupante de la trancheuse." },
    { m: "RISQUE", s: 2, d: "Possibilité qu'un dommage survienne quand l'opérateur est exposé au danger.", e: "Un couteau rangé dans un tiroir fermé n'en présente pas : personne n'y est exposé." },
    { m: "EXPOSITION", s: 2, d: "Fait, pour l'opérateur, de se trouver face au danger dans son travail.", e: "Le risque en résulte : sans elle, le danger ne peut pas provoquer de dommage." },
    { m: "DOMMAGE", s: 2, d: "Atteinte à la santé : une blessure ou une maladie.", e: "Exemples : une brûlure, une coupure, une entorse." },
    { m: "OPÉRATEUR", s: 2, d: "Personne qui réalise le travail.", e: "Dans le PAD, il fait le lien entre le danger et la situation dangereuse.", x: "Dans la situation : Inès." },
    { m: "PAD", s: 2, d: "Sigle du schéma qui montre comment un dommage peut survenir, du danger jusqu'à l'atteinte à la santé.", e: "Processus d'apparition d'un dommage : danger, opérateur, situation dangereuse, événement dangereux, dommage potentiel." },
    { m: "SITUATION DANGEREUSE", s: 2, d: "Moment où l'opérateur se trouve exposé à ce qui peut le blesser.", e: "Exemple : l'agent d'entretien marche sur le sol mouillé.", x: "Dans la situation : Inès nettoie la lame de la trancheuse branchée, sans gants." },
    { m: "ÉVÉNEMENT DANGEREUX", s: 2, d: "Fait qui déclenche le dommage.", e: "Exemple : l'agent glisse. La consigne « Débrancher la trancheuse » empêche celui de la situation d'Inès.", x: "Dans la situation : la trancheuse se met en marche pendant le nettoyage." },
    { m: "DOMMAGE POTENTIEL", s: 2, d: "Blessure ou maladie qui peut résulter de la situation dangereuse.", e: "C'est le dernier élément du PAD. Exemple : une entorse après une glissade.", x: "Dans la situation : une coupure de la main ou des doigts." },
    { m: "COUTEAU", s: 2, d: "Danger du poste de découpe des légumes.", e: "Rangé dans un tiroir fermé, il ne présente pas de risque : personne n'y est exposé." },
    { m: "SOL MOUILLÉ", s: 2, d: "Surface glissante après le lavage : un danger qui peut provoquer une entorse.", e: "Exemple du PAD : l'agent d'entretien y marche (situation dangereuse), puis glisse (événement dangereux)." },
    { m: "FOUR CHAUD", s: 2, d: "Danger du poste de cuisson, qui peut provoquer une brûlure.", e: "C'est un équipement : un danger n'est pas forcément un produit." },
    { m: "CARTON LOURD", s: 2, d: "Danger du rangement de la réserve, qui peut provoquer une douleur au dos.", e: "Le danger peut venir d'un objet manipulé, pas seulement d'une machine." },
    { m: "BRÛLURE", s: 2, d: "Dommage que peut provoquer le four chaud.", e: "C'est une blessure, donc une atteinte à la santé : un dommage." },
    { m: "COUPURE", s: 2, d: "Dommage que peut provoquer un couteau ou une lame.", e: "C'est le dommage potentiel du PAD de la trancheuse.", x: "Dans la situation : Chloé, la collègue d'Inès, s'est déjà blessée ainsi en nettoyant la trancheuse." },
    { m: "ENTORSE", s: 2, d: "Dommage que peut provoquer une glissade sur un sol mouillé.", e: "Dans l'exemple du PAD, c'est le dommage potentiel de l'agent d'entretien qui glisse." },
    { m: "FRACTURE", s: 2, d: "Dommage possible, comme l'entorse, après une chute sur un sol mouillé.", e: "Le lavage des sols peut provoquer une entorse ou une fracture." },

    { m: "PRÉVENTION", s: 3, d: "Ensemble des dispositions prises dans l'entreprise pour assurer la sécurité des salariés et préserver leur santé.", e: "Elle choisit les mesures dans un ordre : supprimer ou réduire le risque, protection collective, protection individuelle, formation et information." },
    { m: "MESURE DE PROTECTION", s: 3, d: "Moyen choisi pour éviter un dommage, dans un ordre précis.", e: "D'abord supprimer ou réduire le risque, puis protéger collectivement, puis individuellement, enfin former et informer." },
    { m: "SOURCE", s: 3, d: "Là où il faut agir en premier pour supprimer ou réduire le risque.", e: "Exemple : remplacer un produit dangereux par un produit qui l'est moins.", x: "Dans la situation : débrancher la trancheuse empêche qu'elle se mette en marche." },
    { m: "ÉPAISSEUR", s: 3, d: "Réglage de coupe de la trancheuse à mettre sur zéro pour moins exposer le tranchant.", e: "C'est une mesure qui réduit le risque, avant même la protection collective." },
    { m: "PROTECTION COLLECTIVE", s: 3, d: "Mesure qui met à l'abri toutes les personnes présentes, comme un capot sur une machine.", e: "Elle passe avant l'EPI : elle ne dépend pas du geste de chacun.", x: "Dans la situation : remettre le protège-lame sur la trancheuse." },
    { m: "PROTECTION INDIVIDUELLE", s: 3, d: "Équipement porté par une personne pour la mettre à l'abri, comme des gants ou des lunettes.", e: "Elle complète la protection collective ; elle ne la remplace pas." },
    { m: "EPI", s: 3, d: "Sigle désignant des gants, des lunettes ou des chaussures de sécurité portés par une personne.", e: "Équipement de protection individuelle : il ne protège que la personne qui le porte, et seulement si elle le porte." },
    { m: "GANTS", s: 3, d: "Équipement individuel porté aux mains ; anti-coupure pour nettoyer la trancheuse.", e: "La lame reste coupante même débranchée : ils restent nécessaires.", x: "Dans la situation : Inès nettoie la lame sans eux." },
    { m: "LUNETTES", s: 3, d: "Équipement individuel de protection porté sur le visage.", e: "Comme les gants ou les chaussures de sécurité, c'est un EPI." },
    { m: "CHAUSSURES DE SÉCURITÉ", s: 3, d: "Équipement individuel de protection porté aux pieds.", e: "Comme les gants ou les lunettes, c'est un EPI : il ne protège que la personne qui le porte." },
    { m: "CAPOT", s: 3, d: "Couvercle installé sur une machine pour protéger toutes les personnes présentes.", e: "C'est une protection collective : elle passe avant l'EPI." },
    { m: "VENTILATION", s: 3, d: "Installation qui renouvelle l'air : un exemple de protection collective.", e: "Elle protège toutes les personnes présentes, sans dépendre du geste de chacun." },
    { m: "PROTÈGE-LAME", s: 3, d: "Pièce à remettre sur la trancheuse après le nettoyage, avant de la rebrancher.", e: "C'est une protection collective, prévue par la fiche de poste." },
    { m: "FORMATION", s: 3, d: "Apprentissage qui permet aux salariés d'appliquer les consignes et les mesures de prévention.", e: "Elle vient en dernier dans l'ordre des mesures, avec l'information.", x: "Dans la situation : apprendre à Inès à nettoyer la trancheuse avec la fiche de poste." }
  ]
};
