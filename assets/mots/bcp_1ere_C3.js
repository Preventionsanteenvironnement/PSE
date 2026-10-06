/* Mots du module C3 1re Bac Pro — Les acteurs de prévention.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Les acteurs de prévention v3.4 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Maël */
window.MOTS = {
  module: "C3", classe: "1re Bac Pro", titre: "Les acteurs de prévention", retour: "bcp_1ere_C3_jeux.html", cle: "BP1C3",
  seances: { 1: "Les acteurs internes de prévention", 2: "Les acteurs externes et les organismes" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Les acteurs dans l'entreprise", m: ["EMPLOYEUR", "SALARIÉ", "SALARIÉ COMPÉTENT", "CSE", "SST"] },
    { l: "Les autres acteurs et organismes de prévention", m: ["SPST", "INSPECTION DU TRAVAIL", "CARSAT"] },
    { l: "L'équipe pluridisciplinaire du service", m: ["MÉDECIN DU TRAVAIL", "INFIRMIER", "IPRP"] },
    { l: "Ce que le médecin du travail peut proposer pour le poste", m: ["AMÉNAGEMENT", "ADAPTATION", "TRANSFORMATION"] },
    { l: "Les pouvoirs de l'agent de contrôle", m: ["DROIT D'ENTRÉE", "OBSERVATIONS", "MISE EN DEMEURE", "PROCÈS-VERBAL", "ARRÊT TEMPORAIRE"] },
    { l: "Les moyens de la Carsat", m: ["INJONCTION", "FORMATIONS", "AIDES FINANCIÈRES", "COTISATION"] }
  ],
  liste: [
    { m: "PRÉVENTION", s: 1, d: "Ensemble des actions menées pour éviter les accidents et protéger la santé et la sécurité au travail.", e: "Plusieurs acteurs y participent, dans l'entreprise et à l'extérieur : tous agissent ensemble pour la santé et la sécurité." },
    { m: "EMPLOYEUR", s: 1, d: "Personne ou entreprise qui prend les mesures nécessaires pour assurer la sécurité et protéger la santé des travailleurs.", e: "Il évalue les risques et inscrit le résultat dans le DUERP. La responsabilité reste la sienne, même quand il désigne un salarié pour l'aider." },
    { m: "SALARIÉ", s: 1, d: "Personne qui travaille pour un employeur et prend soin de sa santé, de sa sécurité et de celles des autres.", e: "Il respecte les consignes et alerte l'employeur devant un danger grave et imminent. Ses obligations ne retirent rien à la responsabilité de l'employeur.", x: "Maël est agent de conditionnement chez Novalim depuis trois mois." },
    { m: "RESPONSABILITÉ", s: 1, d: "Ce qui reste toujours à l'employeur en matière de santé et de sécurité, même si les travailleurs ont des obligations.", e: "Désigner une personne chargée de la prévention ne la retire pas à l'employeur." },
    { m: "CODE DU TRAVAIL", s: 1, d: "Ensemble des règles officielles qui fixent les obligations de l'employeur et des salariés.", e: "Ses articles fixent par exemple que l'employeur protège la santé des travailleurs et que chacun prend soin de sa sécurité." },
    { m: "CONSIGNES", s: 1, d: "Règles de sécurité que le salarié doit respecter à son poste.", e: "Les respecter fait partie de la participation du salarié à la prévention.", x: "Karine les a présentées à Maël le jour de son arrivée." },
    { m: "ALERTER", s: 1, d: "Prévenir immédiatement l'employeur d'une situation qui présente un danger grave et imminent.", e: "Cette alerte permet à l'employeur de supprimer le danger avant qu'un accident se produise." },
    { m: "DANGER GRAVE ET IMMINENT", s: 1, d: "Situation qui menace sérieusement et très bientôt la santé ou la vie d'un travailleur.", e: "Le salarié doit le signaler sans attendre à l'employeur. Dans ce cas, un agent de contrôle peut aussi arrêter les travaux." },
    { m: "DUERP", s: 1, d: "Document obligatoire dans lequel l'employeur inscrit le résultat de l'évaluation des risques de l'entreprise.", e: "Il rassemble les risques repérés dans l'entreprise. Le CSE est consulté sur ce document." },
    { m: "ÉVALUATION DES RISQUES", s: 1, d: "Démarche obligatoire de l'employeur, dont le résultat est inscrit dans un document unique.", e: "Elle consiste à repérer les dangers du travail ; le salarié compétent y participe." },
    { m: "SALARIÉ COMPÉTENT", s: 1, d: "Personne désignée par l'employeur pour s'occuper de la protection et de la prévention des risques professionnels.", e: "On l'appelle aussi PPRP. Toutes les entreprises sont concernées ; il reçoit une formation en santé au travail.", x: "Karine a été désignée par la direction de Novalim pour cette mission." },
    { m: "SST", s: 1, d: "Membre du personnel formé pour intervenir face à un accident du travail ou à un malaise, et qui repère les situations dangereuses.", e: "Un membre du personnel doit être formé aux premiers secours dans chaque atelier où sont accomplis des travaux dangereux.", x: "La liste est affichée à l'entrée de l'atelier de Novalim." },
    { m: "PREMIERS SECOURS", s: 1, d: "Gestes portés à une victime d'accident ou de malaise sur le lieu de travail.", e: "C'est la mission du sauveteur secouriste du travail, qui participe aussi à la prévention." },
    { m: "MALAISE", s: 1, d: "Trouble soudain de l'état de santé d'une personne, qui demande l'intervention d'un secouriste.", e: "Avec l'accident du travail, c'est l'une des situations où intervient le SST." },
    { m: "CSE", s: 1, d: "Instance représentative du personnel, obligatoire dès onze salariés pendant douze mois consécutifs.", e: "Il réunit l'employeur et une délégation du personnel élue. Il présente les réclamations et peut saisir l'inspection du travail.", x: "Les salariés du poste d'étiquetage ont parlé à ses représentants." },
    { m: "INSTANCE REPRÉSENTATIVE", s: 1, d: "Structure élue qui parle au nom des salariés auprès de l'employeur.", e: "Le comité social et économique en est l'exemple dans l'entreprise." },
    { m: "DÉLÉGATION", s: 1, d: "Groupe de membres du personnel élus qui siègent au CSE avec l'employeur.", e: "Un de ses membres peut s'adresser à l'inspection du travail." },
    { m: "RÉCLAMATIONS", s: 1, d: "Demandes individuelles ou collectives que le CSE présente à l'employeur.", e: "C'est la première mission du CSE dans toutes les entreprises d'au moins onze salariés.", x: "Le CSE peut porter celles des salariés du poste d'étiquetage." },
    { m: "ENQUÊTES", s: 1, d: "Recherches que le CSE réalise après un accident du travail ou une maladie professionnelle.", e: "Elles servent à comprendre ce qui s'est passé pour éviter que cela se reproduise." },
    { m: "ONZE", s: 1, d: "Nombre de salariés, atteint pendant douze mois consécutifs, qui rend le CSE obligatoire.", e: "Dès ce seuil, le CSE présente les réclamations, contribue à la santé et à la sécurité et réalise des enquêtes." },
    { m: "CINQUANTE", s: 1, d: "Effectif à partir duquel le CSE analyse aussi les risques professionnels et propose des actions de prévention.", e: "À partir de ce seuil, ses missions s'élargissent à l'analyse des risques.", x: "Avec 62 salariés, Novalim dépasse ce seuil." },

    { m: "SPST", s: 2, d: "Service dont la mission principale est d'éviter toute altération de la santé des travailleurs du fait de leur travail.", e: "Il surveille l'état de santé des travailleurs, conseille et contribue au maintien dans l'emploi. Il est propre à une entreprise ou commun à plusieurs." },
    { m: "ALTÉRATION", s: 2, d: "Dégradation de la santé ; le service de santé au travail a pour mission principale de l'éviter.", e: "Le service cherche à éviter que le travail abîme la santé des travailleurs." },
    { m: "INTERENTREPRISES", s: 2, d: "Se dit d'un service de prévention et de santé au travail commun à plusieurs entreprises.", e: "Selon l'importance des entreprises, le service est propre à une seule ou partagé." },
    { m: "MAINTIEN DANS L'EMPLOI", s: 2, d: "Objectif du service de santé au travail : permettre à un salarié de garder son poste malgré un problème de santé.", e: "Il fait partie des missions du SPST, avec le conseil et la surveillance de l'état de santé." },
    { m: "ÉQUIPE PLURIDISCIPLINAIRE", s: 2, d: "Groupe de professionnels aux métiers différents qui travaillent ensemble dans le service de santé au travail.", e: "Elle réunit le médecin du travail, qui l'anime, des infirmiers en santé au travail et des IPRP." },
    { m: "MÉDECIN DU TRAVAIL", s: 2, d: "Professionnel de santé qui anime l'équipe du service et peut proposer de modifier un poste.", e: "Après échange avec le salarié et l'employeur, il propose par écrit un aménagement, une adaptation ou une transformation du poste.", x: "C'est l'acteur à solliciter pour le poste d'étiquetage." },
    { m: "INFIRMIER", s: 2, d: "Professionnel qui suit l'état de santé des travailleurs sous l'autorité du médecin du service.", e: "Il fait partie de l'équipe pluridisciplinaire du service de prévention et de santé au travail." },
    { m: "IPRP", s: 2, d: "Professionnel qui apporte des compétences en prévention des risques et en amélioration des conditions de travail.", e: "Il fait partie de l'équipe du service de santé au travail, avec le médecin et les infirmiers." },
    { m: "AMÉNAGEMENT", s: 2, d: "Mesure que le médecin du travail peut proposer pour modifier un poste de travail.", e: "Avec l'adaptation et la transformation, c'est l'une des trois mesures possibles pour le poste.", x: "Le poste d'étiquetage, où les cartons sont posés au sol, en a besoin." },
    { m: "ADAPTATION", s: 2, d: "Mesure proposée par le médecin du travail pour ajuster un poste à la personne qui l'occupe.", e: "C'est l'une des trois mesures individuelles possibles, avec l'aménagement et la transformation." },
    { m: "TRANSFORMATION", s: 2, d: "Mesure proposée par le médecin du travail qui change profondément un poste de travail.", e: "C'est l'une des trois mesures possibles, avec l'aménagement et l'adaptation du poste." },
    { m: "INSPECTION DU TRAVAIL", s: 2, d: "Service de l'État dont les agents veillent à l'application des règles qui protègent les salariés.", e: "Elle informe, conseille, constate les infractions. Un salarié, un membre du CSE ou un employeur peuvent la saisir." },
    { m: "AGENT DE CONTRÔLE", s: 2, d: "Membre de l'inspection du travail qui veille à l'application des règles dans les établissements.", e: "Il constate les infractions et peut, dans certaines situations, décider l'arrêt temporaire d'une activité dangereuse." },
    { m: "INFRACTIONS", s: 2, d: "Manquements aux règles que les agents de l'inspection constatent.", e: "Une fois constatés, l'agent peut adresser des observations, une mise en demeure ou dresser un procès-verbal." },
    { m: "DROIT D'ENTRÉE", s: 2, d: "Pouvoir de l'agent de contrôle d'accéder à tout établissement sans autorisation de l'employeur.", e: "Il lui permet d'accéder aux lieux de travail pour contrôler l'application des règles." },
    { m: "OBSERVATIONS", s: 2, d: "Remarques écrites par lesquelles l'agent de contrôle rappelle la règle à l'employeur.", e: "C'est la réponse la plus légère à une infraction, avant la mise en demeure ou le procès-verbal." },
    { m: "MISE EN DEMEURE", s: 2, d: "Ordre adressé par l'agent de contrôle pour obliger à respecter une règle.", e: "Elle fait partie des pouvoirs prévus par la loi pour l'inspection du travail." },
    { m: "PROCÈS-VERBAL", s: 2, d: "Acte écrit que l'agent de contrôle peut dresser pour constater officiellement une infraction.", e: "C'est l'un des pouvoirs de l'agent, avec les observations et la mise en demeure." },
    { m: "ARRÊT TEMPORAIRE", s: 2, d: "Décision de l'agent de contrôle de suspendre des travaux qui exposent à un danger grave et imminent.", e: "Il n'est possible que dans certaines situations prévues par le code du travail." },
    { m: "CONCILIATEUR", s: 2, d: "Rôle que joue l'agent de l'inspection lors des conflits collectifs.", e: "Il aide les deux parties en désaccord à trouver une solution." },
    { m: "CARSAT", s: 2, d: "Organisme régional de l'Assurance Maladie – Risques professionnels qui conseille, contrôle, forme et aide les entreprises.", e: "Elle accorde des aides financières, alors que l'inspection du travail veille au respect des règles.", x: "C'est l'organisme à solliciter pour financer le projet de prévention de Novalim." },
    { m: "INJONCTION", s: 2, d: "Ordre par lequel un ingénieur-conseil ou un contrôleur de sécurité de la Carsat prescrit une mesure de prévention.", e: "C'est le moyen de contrôle de la Carsat dans les entreprises." },
    { m: "FORMATIONS", s: 2, d: "Moyen de la Carsat pour apprendre aux entreprises à prévenir les risques professionnels.", e: "La Carsat diffuse aussi de la documentation et des bonnes pratiques." },
    { m: "AIDES FINANCIÈRES", s: 2, d: "Sommes d'argent que la Carsat accorde aux entreprises pour des projets de prévention.", e: "C'est ce qui distingue la Carsat de l'inspection du travail, qui contrôle sans financer." },
    { m: "COTISATION", s: 2, d: "Somme versée par l'employeur pour les accidents du travail et les maladies professionnelles (AT/MP).", e: "Son taux dépend en partie des accidents de l'établissement : moins il y en a, plus il peut baisser. Cela encourage la prévention." },
    { m: "TARIFICATION", s: 2, d: "Fixation, par l'Assurance Maladie – Risques professionnels, du taux AT/MP de chaque établissement.", e: "Ce taux dépend en partie des accidents du travail et des maladies professionnelles survenus dans l'établissement." }
  ]
};
