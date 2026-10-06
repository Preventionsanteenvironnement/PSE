/* Mots du module C7 Tle Bac Pro — Le suivi de la santé au travail.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Le suivi de la santé au travail v1.0 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation d'Emma */
window.MOTS = {
  module: "C7", classe: "Tle Bac Pro", titre: "Le suivi de la santé au travail", retour: "bcp_term_C7_jeux.html", cle: "BPTC7",
  seances: { 1: "Le suivi médical du salarié", 2: "Les défenses de l'organisme", 3: "La vaccination en milieu professionnel" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Qui peut réaliser la visite d'information et de prévention", m: ["MÉDECIN DU TRAVAIL", "COLLABORATEUR", "INTERNE", "INFIRMIER"] },
    { l: "Les défenses de l'organisme", m: ["BARRIÈRE CUTANÉO-MUQUEUSE", "IMMUNITÉ NON SPÉCIFIQUE", "IMMUNITÉ SPÉCIFIQUE"] },
    { l: "Les signes de l'inflammation", m: ["ROUGEUR", "CHALEUR", "GONFLEMENT", "DOULEUR"] },
    { l: "L'examen d'aptitude", m: ["APTITUDE", "INAPTITUDE", "AFFECTATION"] },
    { l: "L'immunité spécifique", m: ["LYMPHOCYTES", "ANTIGÈNE", "ANTICORPS"] },
    { l: "Les voies d'entrée des agents biologiques", m: ["INHALATION", "INGESTION", "PIQÛRE", "COUPURE"] }
  ],
  liste: [
    { m: "SUIVI MÉDICAL", s: 1, d: "Surveillance individuelle de l'état de santé dont bénéficie tout salarié, assurée par le service de prévention et de santé au travail.", e: "Selon le poste, il prend la forme d'une visite d'information et de prévention ou d'un examen d'aptitude." },
    { m: "VIP", s: 1, d: "Rendez-vous de santé prévu dans les 3 mois après la prise d'un poste sans risque particulier.", e: "Elle interroge le salarié sur sa santé, l'informe des risques et le sensibilise à la prévention.", x: "Celle d'Emma a lieu sept semaines après sa prise de poste : le délai est respecté." },
    { m: "SENSIBILISER", s: 1, d: "Rendre le salarié attentif aux moyens de prévention : l'un des buts de la visite d'information.", e: "La visite sert aussi à informer le salarié des risques de son poste et à l'orienter vers le médecin du travail si nécessaire." },
    { m: "PÉRIODICITÉ", s: 1, d: "Rythme de renouvellement de la visite d'information et de prévention, sans dépasser 5 ans.", e: "C'est le médecin du travail qui la fixe." },
    { m: "MÉDECIN DU TRAVAIL", s: 1, d: "Professionnel de santé qui réalise l'examen d'aptitude, fixe le rythme des visites et peut proposer une vaccination.", e: "Il peut confier la visite d'information et de prévention, sous son autorité, à un collaborateur médecin, un interne ou un infirmier." },
    { m: "COLLABORATEUR", s: 1, d: "Médecin qui peut réaliser la visite d'information et de prévention sous l'autorité du médecin du travail.", e: "Il fait partie des professionnels qui peuvent recevoir un salarié pour cette visite." },
    { m: "INTERNE", s: 1, d: "Futur médecin en formation qui peut réaliser la visite d'information et de prévention.", e: "Il agit sous l'autorité du médecin du travail, comme le collaborateur médecin et l'infirmier." },
    { m: "INFIRMIER", s: 1, d: "Professionnel de santé qui peut réaliser la visite d'information et de prévention.", e: "Il intervient sous l'autorité du médecin du travail ; l'examen d'aptitude, lui, reste réservé au médecin." },
    { m: "SUIVI INDIVIDUEL RENFORCÉ", s: 1, d: "Surveillance médicale des postes à risques particuliers, avec un examen avant la prise du poste.", e: "Il concerne par exemple l'exposition à l'amiante, au plomb, aux agents cancérogènes ou aux rayonnements ionisants." },
    { m: "APTITUDE", s: 1, d: "Avis du médecin du travail : l'état de santé du salarié est compatible avec un poste à risques particuliers.", e: "L'examen a lieu avant l'affectation au poste, pour vérifier la santé du salarié avant toute exposition." },
    { m: "INAPTITUDE", s: 1, d: "Avis du médecin du travail : l'état de santé du salarié n'est pas compatible avec le poste.", e: "C'est l'autre avis possible à l'issue de l'examen médical avant l'affectation." },
    { m: "AFFECTATION", s: 1, d: "Placement d'un salarié sur un poste ; pour un poste à risques particuliers, l'examen médical a lieu avant elle.", e: "Il faut vérifier, avant toute exposition, que la santé du salarié est compatible avec le poste." },

    { m: "MICROBES", s: 2, d: "Agents biologiques, comme les bactéries ou les virus, contre lesquels l'organisme se défend.", e: "L'organisme dispose de trois défenses : une barrière, une immunité rapide contre tous, une immunité lente mais ciblée.", x: "Emma travaille au contact du linge sale d'un EHPAD." },
    { m: "PEAU", s: 2, d: "Enveloppe du corps qui, avec les muqueuses, empêche la plupart des agents biologiques d'entrer.", e: "Une coupure ou une plaie y ouvre une porte d'entrée.", x: "L'éclat de verre a coupé le doigt d'Emma, qui ne portait pas ses gants." },
    { m: "MUQUEUSES", s: 2, d: "Membranes de la bouche, du nez et des yeux qui, avec la peau, forment une barrière.", e: "Elles font partie de la première ligne de défense de l'organisme." },
    { m: "PLAIE", s: 2, d: "Ouverture de la peau, comme une coupure, qui laisse entrer les microbes.", e: "Elle ouvre une porte d'entrée dans la barrière que forment la peau et les muqueuses." },
    { m: "BARRIÈRE CUTANÉO-MUQUEUSE", s: 2, d: "Première défense : la peau et les membranes de la bouche, du nez, des yeux, qui empêchent la plupart des microbes d'entrer.", e: "Tant qu'elle est intacte, elle bloque la plupart des microbes ; une plaie l'ouvre." },
    { m: "IMMUNITÉ NON SPÉCIFIQUE", s: 2, d: "Défense rapide et locale contre tous les microbes, sans en cibler un ; on la dit aussi innée.", e: "Elle agit vite et sur place, par l'inflammation et la phagocytose. Elle est moins efficace que la défense ciblée." },
    { m: "INFLAMMATION", s: 2, d: "Réaction de défense : la zone atteinte devient rouge, chaude, gonflée et douloureuse.", e: "Le sang et les cellules de défense affluent vers la zone atteinte pour détruire les microbes.", x: "Le lendemain de sa coupure, le doigt d'Emma présente ces signes." },
    { m: "ROUGEUR", s: 2, d: "Signe d'inflammation : la peau change de couleur parce que le sang afflue.", e: "C'est l'un des quatre signes, avec la chaleur, le gonflement et la douleur." },
    { m: "CHALEUR", s: 2, d: "Signe d'inflammation : la zone atteinte devient plus chaude au toucher.", e: "Elle s'explique par l'afflux de sang et de cellules de défense." },
    { m: "GONFLEMENT", s: 2, d: "Signe d'inflammation : la zone atteinte augmente de volume.", e: "S'il persiste ou s'aggrave, la plaie doit être montrée à un professionnel de santé." },
    { m: "DOULEUR", s: 2, d: "Signe d'inflammation : la zone atteinte fait mal.", e: "Si elle persiste ou s'aggrave, la plaie doit être montrée à un professionnel de santé." },
    { m: "PHAGOCYTOSE", s: 2, d: "Destruction des microbes englobés par des cellules de défense.", e: "C'est un moyen de l'immunité non spécifique, qui agit sur place contre tous les microbes." },
    { m: "PHAGOCYTES", s: 2, d: "Cellules de défense qui englobent les microbes et les détruisent.", e: "Elles agissent dans l'immunité non spécifique, sans cibler un microbe en particulier." },
    { m: "IMMUNITÉ SPÉCIFIQUE", s: 2, d: "Défense plus lente mais plus efficace, dirigée contre un microbe précis ; on la dit aussi adaptative.", e: "Des lymphocytes reconnaissent l'antigène du microbe et produisent des anticorps." },
    { m: "LYMPHOCYTES", s: 2, d: "Cellules qui reconnaissent l'antigène d'un microbe précis et produisent des anticorps.", e: "Certains persistent des années comme cellules mémoires : c'est la base de la vaccination." },
    { m: "ANTIGÈNE", s: 2, d: "Molécule propre à un microbe, que le système immunitaire reconnaît.", e: "Un vaccin en apporte un sans provoquer la maladie." },
    { m: "ANTICORPS", s: 2, d: "Protéines produites par les lymphocytes, capables de reconnaître un antigène précis.", e: "Ils agissent contre un seul microbe, celui dont ils reconnaissent l'antigène." },

    { m: "VACCIN", s: 3, d: "Produit qui apporte un antigène du microbe sans provoquer la maladie : microbe tué ou affaibli, ou un morceau.", e: "Les lymphocytes produisent alors des anticorps et gardent une mémoire du microbe." },
    { m: "TOXINE", s: 3, d: "Substance d'un microbe dont un vaccin peut contenir un morceau, sans provoquer la maladie.", e: "Un vaccin peut contenir un microbe tué ou affaibli, un morceau du microbe ou un morceau de cette substance." },
    { m: "MÉMOIRE IMMUNITAIRE", s: 3, d: "Lymphocytes et anticorps qui persistent des années et permettent une réponse plus rapide au contact du vrai microbe.", e: "Au contact du vrai microbe, la réponse est plus rapide et plus forte, avant que la maladie ne s'installe." },
    { m: "RAPPELS", s: 3, d: "Nouvelles vaccinations qui entretiennent la défense acquise.", e: "Ils maintiennent la mémoire immunitaire dans le temps." },
    { m: "PROTECTION INDIVIDUELLE", s: 3, d: "Effet de la vaccination sur la personne vaccinée elle-même.", e: "Pour une maladie qui ne se transmet pas entre personnes, comme le tétanos, c'est le seul effet du vaccin." },
    { m: "PROTECTION COLLECTIVE", s: 3, d: "Effet de la vaccination qui s'étend aux personnes non vaccinées, pour une maladie qui se transmet.", e: "La vaccination limite alors la circulation du microbe.", x: "Vaccinée, Emma protège aussi les résidents de l'EHPAD, âgés et souvent fragiles." },
    { m: "CIRCULATION", s: 3, d: "Passage d'un microbe d'une personne à l'autre, que la vaccination limite.", e: "Moins une maladie passe d'une personne à l'autre, mieux les personnes non vaccinées sont protégées." },
    { m: "TÉTANOS", s: 3, d: "Maladie qui ne se transmet pas entre personnes : le vaccin ne protège que la personne vaccinée.", e: "Contre elle, la vaccination n'apporte pas de protection collective." },
    { m: "RISQUE MICROBIOLOGIQUE", s: 3, d: "Possibilité d'être exposé au travail à des bactéries, virus, champignons ou parasites qui peuvent nuire à la santé.", e: "La vaccination complète contre lui l'hygiène, la protection collective et les équipements de protection individuelle.", x: "Emma y est exposée en manipulant le linge sale." },
    { m: "INHALATION", s: 3, d: "Voie d'entrée des agents biologiques par l'air respiré.", e: "Le microbe pénètre dans l'organisme par le nez et la bouche, au moment de respirer." },
    { m: "INGESTION", s: 3, d: "Voie d'entrée des agents biologiques par la bouche, en avalant.", e: "Le microbe passe par des mains ou des aliments contaminés portés à la bouche." },
    { m: "PIQÛRE", s: 3, d: "Voie d'entrée des agents biologiques par un objet pointu qui traverse la peau.", e: "Comme la coupure, elle ouvre la barrière de la peau." },
    { m: "COUPURE", s: 3, d: "Voie d'entrée des agents biologiques par une blessure faite par un objet tranchant.", e: "La vaccination ne protège pas des blessures : elle complète les gants, sans les remplacer.", x: "Emma s'est blessée sur un éclat de verre caché dans le linge." },
    { m: "HYGIÈNE", s: 3, d: "Mesure que la vaccination complète sans la remplacer, comme se laver les mains.", e: "Se laver les mains après avoir retiré ses gants fait partie des mesures contre le risque microbiologique." },
    { m: "GANTS", s: 3, d: "Équipement à porter pour manipuler le linge sale.", e: "La vaccination les complète, elle ne les remplace pas.", x: "Emma ne les portait pas le jour de sa coupure." }
  ]
};
