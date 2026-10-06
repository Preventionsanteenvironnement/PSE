/* Mots du module A1 CAP — Le système de santé.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Le système de santé v5.6 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Nolan */
window.MOTS = {
  module: "A1", classe: "CAP", titre: "Le système de santé", retour: "cap_A1_jeux.html", cle: "CAPA1",
  seances: { 1: "La santé et ses facteurs", 2: "Le système solidaire de soins" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Les trois bien-être de la santé", m: ["PHYSIQUE", "MENTAL", "SOCIAL"] },
    { l: "Les facteurs internes", m: ["GÈNES", "ÂGE", "COMPORTEMENTS"] },
    { l: "Les facteurs externes", m: ["POLLUTION", "BRUIT", "LOGEMENT", "CONDITIONS DE TRAVAIL"] },
    { l: "Ceux qui versent de l'argent à la Sécurité sociale", m: ["TRAVAILLEURS", "EMPLOYEURS", "ÉTAT"] },
    { l: "Ceux que la Sécurité sociale aide", m: ["MALADES", "FAMILLES", "PERSONNES ÂGÉES", "ACCIDENTÉS DU TRAVAIL"] },
    { l: "Ce que contient Mon espace santé", m: ["TRAITEMENTS", "EXAMENS", "VACCINS"] }
  ],
  liste: [
    { m: "SANTÉ", s: 1, d: "Selon l'OMS, état de complet bien-être physique, mental et social, et pas seulement absence de maladie.", e: "Ne pas être malade ne suffit pas : le corps, les pensées et les émotions, les relations avec les autres doivent aller bien." },
    { m: "OMS", s: 1, d: "Sigle de l'organisation internationale qui a donné la définition de la santé retenue dans le cours.", e: "OMS signifie Organisation mondiale de la santé. Sa définition réunit trois bien-être : physique, mental et social." },
    { m: "BIEN-ÊTRE", s: 1, d: "Ce que la santé réunit sous trois formes : physique, mental et social.", e: "La santé additionne trois bien-être : celui du corps, celui des pensées et des émotions, celui des relations avec les autres." },
    { m: "PHYSIQUE", s: 1, d: "Bien-être du corps : le corps va bien.", e: "Faire du sport et bien manger relèvent du bien-être physique." },
    { m: "MENTAL", s: 1, d: "Bien-être des pensées et des émotions.", e: "Être calme, sans stress, et avoir confiance en soi relèvent du bien-être mental." },
    { m: "SOCIAL", s: 1, d: "Bien-être des relations avec les autres.", e: "Avoir des amis et parler avec sa famille relèvent du bien-être social." },
    { m: "CAPITAL SANTÉ", s: 1, d: "Ensemble des ressources de bien-être de chaque personne dès sa naissance, protégé ou abîmé tout au long de la vie.", e: "Il n'est pas fixé une fois pour toutes : les facteurs internes et externes le protègent ou l'abîment." },
    { m: "FACTEUR INTERNE", s: 1, d: "Élément qui vient de la personne elle-même et agit sur sa santé : gènes, âge, comportements.", e: "Il se distingue du facteur externe, qui vient de ce qui entoure la personne.", x: "Dans la situation : Nolan a 23 ans et a arrêté le sport il y a un an." },
    { m: "FACTEUR EXTERNE", s: 1, d: "Élément qui vient de l'environnement de la personne et agit sur sa santé : pollution, bruit, logement, travail.", e: "Il se distingue du facteur interne, qui vient de la personne elle-même.", x: "Dans la situation : Nolan habite au bord d'une route où passent beaucoup de voitures." },
    { m: "GÈNES", s: 1, d: "Éléments reçus de ses parents, qui font partie des facteurs internes.", e: "Ils viennent de la personne elle-même, comme l'âge et les comportements : ce sont des facteurs internes." },
    { m: "ÂGE", s: 1, d: "Nombre d'années d'une personne, compté parmi les facteurs internes.", e: "Il vient de la personne elle-même : c'est un facteur interne, comme les gènes.", x: "Dans la situation : Nolan a 23 ans." },
    { m: "COMPORTEMENTS", s: 1, d: "Habitudes de vie comme le sport, l'alimentation, le sommeil ou le tabac.", e: "Ce sont des facteurs internes : ils viennent de la personne et peuvent protéger ou abîmer son capital santé." },
    { m: "POLLUTION", s: 1, d: "Facteur externe lié à l'air, qui peut provoquer des maladies du cœur et des poumons.", e: "Réduire celle de l'air fait partie des actions des plans santé.", x: "Dans la situation : les voitures de la route où habite Nolan." },
    { m: "BRUIT", s: 1, d: "Facteur externe qui peut provoquer des troubles du sommeil.", e: "Protéger les jeunes des sons trop forts fait partie des actions des plans santé.", x: "Dans la situation : la route près de chez Nolan." },
    { m: "LOGEMENT", s: 1, d: "Lieu où l'on habite, compté parmi les facteurs externes.", e: "Il vient de ce qui entoure la personne, comme la pollution, le bruit ou les conditions de travail." },
    { m: "CONDITIONS DE TRAVAIL", s: 1, d: "Facteur externe lié à l'emploi occupé et au lieu où il s'exerce.", e: "Elles viennent de ce qui entoure la personne : ce sont des facteurs externes, comme le logement." },
    { m: "SPORT", s: 1, d: "Activité physique ; son manque peut provoquer une prise de poids.", e: "Plus d'activité à l'école pour faire bouger les jeunes est une action des plans santé.", x: "Dans la situation : Nolan l'a arrêté il y a un an." },
    { m: "TABAC", s: 1, d: "Comportement que les plans santé aident les personnes à arrêter.", e: "C'est un comportement, donc un facteur interne : il peut abîmer le capital santé." },
    { m: "PLAN SANTÉ", s: 1, d: "Programme de l'État, mis en place pour plusieurs années, pour protéger la population avant la maladie.", e: "Exemples d'actions : aider à arrêter le tabac, faire bouger les jeunes, réduire la pollution de l'air, vacciner la population." },
    { m: "PRÉVENTION", s: 1, d: "Fait d'agir avant la maladie pour éviter qu'elle arrive.", e: "C'est le but des plans santé : protéger la population avant qu'elle tombe malade." },
    { m: "VACCINATION", s: 1, d: "Action des plans santé qui consiste à protéger la population par des vaccins.", e: "C'est une action de prévention : elle agit avant la maladie." },

    { m: "SÉCURITÉ SOCIALE", s: 2, d: "Organisme qui protège toute la population face à la maladie, aux accidents du travail, à la vieillesse et aux charges de famille.", e: "Elle est financée par les cotisations des travailleurs et des employeurs, et par l'argent de l'État." },
    { m: "COTISATION", s: 2, d: "Somme versée chaque mois par les travailleurs et les employeurs pour financer la protection de toute la population.", e: "Ces sommes, avec l'argent de l'État, permettent d'aider les malades, les familles et les personnes âgées." },
    { m: "SOLIDARITÉ", s: 2, d: "Principe national : chacun donne selon ses moyens, chacun reçoit selon ses besoins.", e: "C'est le principe de la Sécurité sociale : l'argent de tous aide ceux qui en ont besoin." },
    { m: "ASSURANCE MALADIE", s: 2, d: "Partie de la Sécurité sociale qui rembourse les soins.", e: "C'est à elle que l'on déclare son médecin traitant." },
    { m: "TRAVAILLEURS", s: 2, d: "Ils versent chaque mois des cotisations, comme les employeurs.", e: "Leurs cotisations financent la Sécurité sociale, qui aide toute la population." },
    { m: "EMPLOYEURS", s: 2, d: "Ils versent chaque mois des cotisations, comme les travailleurs.", e: "Leurs cotisations financent la Sécurité sociale, avec celles des travailleurs." },
    { m: "ÉTAT", s: 2, d: "Puissance publique qui met en place les plans santé et verse aussi de l'argent à la Sécurité sociale.", e: "Il complète les cotisations des travailleurs et des employeurs." },
    { m: "MALADES", s: 2, d: "Personnes souffrantes que la Sécurité sociale aide.", e: "Ils sont aidés grâce à l'argent de tous : c'est la solidarité nationale." },
    { m: "FAMILLES", s: 2, d: "Elles sont aidées par la Sécurité sociale pour leurs charges.", e: "La Sécurité sociale aide aussi les malades, les accidentés du travail et les personnes âgées." },
    { m: "PERSONNES ÂGÉES", s: 2, d: "Public que la Sécurité sociale aide face à la vieillesse.", e: "La Sécurité sociale protège face à la vieillesse comme face à la maladie." },
    { m: "ACCIDENTÉS DU TRAVAIL", s: 2, d: "Personnes blessées pendant leur activité professionnelle et aidées par la Sécurité sociale.", e: "Ils font partie de la population que la Sécurité sociale aide, avec les malades, les familles et les personnes âgées." },
    { m: "MÉDECIN TRAITANT", s: 2, d: "Professionnel choisi et déclaré à l'Assurance maladie à partir de 16 ans, qui suit le patient et l'oriente.", e: "Le déclarer permet d'être mieux remboursé : 19 € au lieu de 8,40 € pour une consultation à 30 €.", x: "Dans la situation : Nolan n'en a pas." },
    { m: "PARCOURS DE SOINS", s: 2, d: "Fait de consulter d'abord son médecin traitant, qui oriente vers un spécialiste si nécessaire.", e: "Le parcours de soins coordonnés permet d'être mieux suivi et mieux remboursé." },
    { m: "SPÉCIALISTE", s: 2, d: "Médecin vers qui le médecin traitant envoie le patient, si c'est nécessaire.", e: "Quelques-uns se consultent sans passer par le médecin traitant : ophtalmologue, gynécologue, stomatologue." },
    { m: "PSYCHIATRE", s: 2, d: "Spécialiste qu'une personne de 16 à 25 ans peut consulter sans passer par le médecin traitant.", e: "Cet accès direct est réservé aux personnes de 16 à 25 ans ; après, il faut passer par le médecin traitant." },
    { m: "CONSULTATION", s: 2, d: "Rendez-vous chez le médecin ; chez le généraliste, elle coûte 30 €.", e: "Avec un médecin traitant déclaré, l'Assurance maladie rembourse 19 € ; sans, seulement 8,40 €.", x: "Dans la situation : Nolan ne sait pas combien cela va coûter." },
    { m: "REMBOURSEMENT", s: 2, d: "Somme rendue par l'Assurance maladie après des soins : 19 € sur 30 € avec un médecin traitant déclaré.", e: "Sans médecin traitant déclaré, il tombe à 8,40 € : il reste alors 21,60 € à payer au lieu de 11 €." },
    { m: "CARTE VITALE", s: 2, d: "Document gratuit et personnel, reçu vers 16 ans, qui prouve que la personne est assurée.", e: "Elle permet d'être remboursé plus vite, sans envoyer de papier. Elle ne sert pas à payer le médecin.", x: "Dans la situation : Nolan vient de recevoir la sienne avec sa photo." },
    { m: "TIERS PAYANT", s: 2, d: "Possibilité de ne pas avancer la part réglée par l'Assurance maladie.", e: "Dans certaines situations, la carte Vitale le permet : le patient n'avance pas l'argent remboursé." },
    { m: "MON ESPACE SANTÉ", s: 2, d: "Carnet numérique sur Internet qui regroupe les traitements, les résultats d'examens et les vaccins.", e: "Seuls le patient et les professionnels de santé autorisés peuvent le consulter." },
    { m: "DMP", s: 2, d: "Sigle du carnet sur Internet que consultent le patient et les professionnels autorisés.", e: "DMP signifie dossier médical partagé. Il se trouve dans Mon espace santé et aide les médecins à mieux soigner." },
    { m: "TRAITEMENTS", s: 2, d: "Soins prescrits au patient, regroupés dans Mon espace santé.", e: "Ils figurent dans Mon espace santé avec les résultats d'examens et les vaccins." },
    { m: "EXAMENS", s: 2, d: "Leurs résultats figurent dans Mon espace santé.", e: "Les retrouver au même endroit aide les médecins à mieux soigner le patient." },
    { m: "VACCINS", s: 2, d: "Ils sont notés dans Mon espace santé, avec les traitements.", e: "Mon espace santé regroupe traitements, résultats d'examens et vaccins." },
    { m: "PATIENT", s: 2, d: "Personne qui consulte un médecin et reçoit des soins.", e: "Dans le parcours de soins coordonnés, il consulte d'abord son médecin traitant." }
  ]
};
