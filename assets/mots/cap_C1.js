/* Mots du module C1 CAP — Les différents contrats de travail.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Les différents contrats de travail v2.2 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Damien */
window.MOTS = {
  module: "C1", classe: "CAP", titre: "Les différents contrats de travail", retour: "cap_C1_jeux.html", cle: "CAPC1",
  seances: { 1: "Les contrats de travail", 2: "Les droits et obligations au travail" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Les trois éléments du contrat de travail", m: ["TRAVAIL", "RÉMUNÉRATION", "SUBORDINATION"] },
    { l: "Les trois contrats de travail principaux", m: ["CDI", "CDD", "CONTRAT DE MISSION"] },
    { l: "Les trois acteurs de l'intérim", m: ["INTÉRIMAIRE", "AGENCE D'INTÉRIM", "ENTREPRISE UTILISATRICE"] },
    { l: "Les motifs du CDD", m: ["REMPLACEMENT", "SURCROÎT D'ACTIVITÉ", "SAISONNIER"] },
    { l: "La fin d'un CDI", m: ["DÉMISSION", "LICENCIEMENT", "RUPTURE CONVENTIONNELLE"] },
    { l: "Les règles qui encadrent le contrat de travail", m: ["CODE DU TRAVAIL", "CONVENTION COLLECTIVE", "RÈGLEMENT INTÉRIEUR"] },
    { l: "Ce que fixe le règlement intérieur", m: ["HYGIÈNE", "SÉCURITÉ", "DISCIPLINE"] },
    { l: "Ce que peut prévoir la convention collective", m: ["SALAIRE MINIMUM", "PRIMES", "CONGÉS"] }
  ],
  liste: [
    { m: "CONTRAT DE TRAVAIL", s: 1, d: "Accord par lequel un salarié fournit une activité à un employeur, sous sa direction, en échange d'une rémunération.", e: "Trois éléments le définissent : un travail fourni, une rémunération versée et un lien de subordination.", x: "Dans la situation : Damien s'interroge sur ce que contient celui qu'on lui propose." },
    { m: "TRAVAIL", s: 1, d: "Ce que le salarié fournit à l'employeur : premier élément du contrat.", e: "Exemple : mettre les produits en rayon. En échange, l'employeur verse une rémunération." },
    { m: "RÉMUNÉRATION", s: 1, d: "Salaire versé par l'employeur en échange de l'activité fournie.", e: "C'est le deuxième élément du contrat de travail. Exemple : le salarié reçoit sa fiche de paie." },
    { m: "SUBORDINATION", s: 1, d: "Lien par lequel le salarié agit sous la direction de l'employeur, qui donne des consignes, contrôle et peut sanctionner.", e: "Troisième élément du contrat de travail. Exemple : le salarié applique les consignes données par sa responsable." },
    { m: "CDI", s: 1, d: "Sigle du contrat sans date de fin, qui correspond à un emploi durable.", e: "Contrat à durée indéterminée. Il ne donne pas droit à une indemnité de fin de contrat.", x: "Dans la situation : c'est le contrat adapté à Damien, qui recherche un emploi stable." },
    { m: "CDD", s: 1, d: "Sigle du contrat obligatoirement écrit, qui indique une date de fin et un motif.", e: "Contrat à durée déterminée. À la fin, le salarié perçoit le plus souvent une indemnité d'au moins 10 % de la rémunération brute totale.", x: "Dans la situation : on propose à Damien un contrat de ce type, de trois mois." },
    { m: "MOTIF", s: 1, d: "Raison du CDD, obligatoirement indiquée par écrit.", e: "Trois exemples : le remplacement d'un salarié absent, un surcroît d'activité, un emploi saisonnier.", x: "Dans la situation : remplacer une salariée absente." },
    { m: "REMPLACEMENT", s: 1, d: "Motif d'un CDD : occuper le poste d'un salarié absent.", e: "Le CDD conclu pour ce motif prend fin quand la durée prévue est terminée.", x: "Dans la situation : Damien doit occuper le poste d'une salariée absente pour congé de maternité." },
    { m: "SURCROÎT D'ACTIVITÉ", s: 1, d: "Motif d'un CDD : plus de travail que d'habitude dans l'entreprise.", e: "C'est l'un des trois motifs de CDD cités dans le cours, avec le remplacement et l'emploi saisonnier." },
    { m: "SAISONNIER", s: 1, d: "Se dit d'un emploi lié à une période de l'année : l'un des motifs du CDD.", e: "Comme le remplacement ou le surcroît d'activité, il justifie un contrat à durée déterminée." },
    { m: "INDEMNITÉ", s: 1, d: "Somme perçue à la fin d'un CDD ou d'une mission : au moins 10 % de la rémunération brute totale.", e: "Le CDI n'y donne pas droit : c'est un emploi durable, sans date de fin." },
    { m: "DÉMISSION", s: 1, d: "Une des trois façons dont prend fin un CDI, à l'initiative du salarié.", e: "Un CDI n'a pas de date de fin : il s'arrête par une démission, un licenciement ou une rupture conventionnelle." },
    { m: "LICENCIEMENT", s: 1, d: "Une des trois façons dont prend fin un CDI, à l'initiative de l'employeur.", e: "Avec la démission et la rupture conventionnelle, c'est l'une des trois façons de mettre fin à un CDI." },
    { m: "RUPTURE CONVENTIONNELLE", s: 1, d: "Fin d'un CDI décidée d'un commun accord entre l'employeur et le salarié.", e: "Elle se distingue de la démission et du licenciement, qui sont décidés par une seule des deux parties." },
    { m: "CONTRAT DE MISSION", s: 1, d: "Accord écrit signé entre l'intérimaire et l'agence d'intérim.", e: "À la fin, l'intérimaire perçoit le plus souvent une indemnité de fin de mission d'au moins 10 % de sa rémunération brute totale." },
    { m: "INTÉRIM", s: 1, d: "Travail temporaire : le salarié est employé par une agence et travaille dans une autre entreprise.", e: "Il fait intervenir trois acteurs : le salarié, l'agence qui l'emploie et l'entreprise utilisatrice." },
    { m: "INTÉRIMAIRE", s: 1, d: "Salarié employé par une entreprise de travail temporaire, qui effectue sa mission ailleurs.", e: "Son employeur est l'agence qui l'embauche et le paie, pas l'entreprise où il travaille." },
    { m: "AGENCE D'INTÉRIM", s: 1, d: "Entreprise de travail temporaire qui embauche le salarié et lui verse son salaire.", e: "Exemple du cours : ALPHA. Elle signe un contrat de mise à disposition avec l'entreprise utilisatrice." },
    { m: "ENTREPRISE UTILISATRICE", s: 1, d: "Société où l'intérimaire effectue sa mission.", e: "Exemple du cours : DUPONT. Elle accueille le salarié, mais ce n'est pas elle qui l'embauche ni qui le paie." },
    { m: "ALTERNANCE", s: 1, d: "Formation qui partage le temps entre l'entreprise et un centre de formation.", e: "Deux contrats l'organisent : le contrat d'apprentissage et le contrat de professionnalisation." },
    { m: "CONTRAT D'APPRENTISSAGE", s: 1, d: "Accord en alternance qui permet de préparer un diplôme ou un titre professionnel, en principe de 16 à 29 ans.", e: "Il est conclu en CDD ou en CDI ; le CDD, ou la période d'apprentissage d'un CDI, dure de six mois à trois ans." },
    { m: "CONTRAT DE PROFESSIONNALISATION", s: 1, d: "Accord en alternance qui permet d'obtenir une qualification reconnue.", e: "Il s'adresse notamment aux jeunes de 16 à 25 ans et aux demandeurs d'emploi de 26 ans et plus, formés dans un organisme de formation." },
    { m: "APPRENTI", s: 1, d: "Jeune qui prépare un diplôme en partageant son temps entre l'entreprise et le CFA.", e: "Il est lié à son employeur par un contrat d'apprentissage." },
    { m: "CFA", s: 1, d: "Sigle du centre où l'apprenti suit sa formation.", e: "Centre de formation d'apprentis : l'apprenti y passe une partie de son temps, l'autre partie en entreprise." },
    { m: "DIPLÔME", s: 1, d: "Ce que prépare le contrat d'apprentissage, par exemple un bac professionnel.", e: "Le contrat de professionnalisation, lui, mène à une qualification professionnelle reconnue.", x: "Dans la situation : Damien a obtenu un CAP." },
    { m: "QUALIFICATION", s: 1, d: "Ce que permet d'obtenir le contrat de professionnalisation : elle est professionnelle et reconnue.", e: "Le contrat d'apprentissage, lui, prépare un diplôme ou un titre professionnel." },

    { m: "DROIT", s: 2, d: "Ce qu'une personne peut exiger dans le cadre du contrat de travail.", e: "Exemple pour le salarié : percevoir sa rémunération. Exemple pour l'employeur : organiser le travail." },
    { m: "OBLIGATION", s: 2, d: "Ce qu'une personne doit faire dans le cadre du contrat de travail.", e: "Elles se répondent : le salarié fournit un travail, l'employeur verse la rémunération." },
    { m: "EMPLOYEUR", s: 2, d: "Personne ou entreprise qui embauche un salarié, organise son travail et lui verse une rémunération.", e: "Il doit fournir le travail prévu, verser la rémunération et assurer la sécurité des salariés." },
    { m: "SALARIÉ", s: 2, d: "Personne qui fournit un travail sous la direction d'un employeur, en échange d'une rémunération.", e: "Il doit réaliser le travail prévu, respecter les horaires, les consignes de sécurité et le règlement intérieur." },
    { m: "HORAIRES", s: 2, d: "Le salarié doit les respecter, comme les consignes de sécurité.", e: "Les respecter fait partie des obligations du salarié." },
    { m: "PROTECTION SOCIALE", s: 2, d: "Droit dont bénéficie le salarié grâce à son contrat de travail.", e: "C'est un droit du salarié, comme percevoir sa rémunération et travailler dans des conditions de sécurité." },
    { m: "INSTRUCTIONS", s: 2, d: "Ce que l'employeur a le droit de donner pour organiser le travail.", e: "Organiser le travail et les donner est un droit de l'employeur ; les respecter est une obligation du salarié." },
    { m: "SANCTIONNER", s: 2, d: "Droit de l'employeur face à un salarié qui ne respecte pas ses obligations.", e: "Ce pouvoir découle du lien de subordination entre le salarié et l'employeur." },
    { m: "CODE DU TRAVAIL", s: 2, d: "Texte qui fixe les règles générales pour tous les salariés : durée, congés, sécurité, rupture du contrat.", e: "C'est le texte le plus général ; la convention collective l'adapte à un secteur d'activité." },
    { m: "CONVENTION COLLECTIVE", s: 2, d: "Texte qui adapte les règles générales à un secteur d'activité.", e: "Elle peut prévoir des dispositions plus favorables que le Code du travail : salaire minimum, primes, congés.", x: "Dans la situation : celle du commerce de détail alimentaire s'applique au contrat de Damien." },
    { m: "RÈGLEMENT INTÉRIEUR", s: 2, d: "Document établi par l'employeur : règles d'hygiène, de sécurité et de discipline dans l'entreprise.", e: "C'est le texte le plus proche de l'entreprise ; le respecter est une obligation du salarié." },
    { m: "HYGIÈNE", s: 2, d: "Domaine de règles fixées par le règlement intérieur, avec la sécurité et la discipline.", e: "Le règlement intérieur fixe ces règles dans l'entreprise." },
    { m: "SÉCURITÉ", s: 2, d: "L'employeur doit l'assurer pour ses salariés ; le règlement intérieur en fixe les règles.", e: "Le salarié doit respecter les consignes qui la concernent ; l'employeur doit l'assurer." },
    { m: "DISCIPLINE", s: 2, d: "Domaine de règles fixées par le règlement intérieur, avec l'hygiène et la sécurité.", e: "Ces règles sont établies par l'employeur pour son entreprise." },
    { m: "SALAIRE MINIMUM", s: 2, d: "Rémunération plancher que peut prévoir la convention collective.", e: "La convention collective peut prévoir des dispositions plus favorables que le Code du travail." },
    { m: "PRIMES", s: 2, d: "Sommes en plus du salaire que peut prévoir la convention collective.", e: "Avec le salaire minimum et les congés, ce sont des dispositions que la convention collective peut prévoir." },
    { m: "CONGÉS", s: 2, d: "Périodes de repos prévues par le Code du travail et parfois améliorées par la convention collective.", e: "La convention collective peut prévoir des dispositions plus favorables que le Code du travail." }
  ]
};
