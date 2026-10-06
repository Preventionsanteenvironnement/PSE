/* Mots du module SESG CAPa — Le ménage et ses revenus.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Le ménage et ses revenus v4.1 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Victor et Amanda */
window.MOTS = {
  module: "SESG", classe: "CAPa", titre: "Le ménage et ses revenus", retour: "capa_sesg_revenus_jeux.html", cle: "CAPAREV",
  seances: { 1: "Le ménage, le salarié, l'indépendant", 2: "Le bulletin de paie et le SMIC", 3: "La micro-entreprise et les autres revenus", 4: "Le total des ressources" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Des travailleurs indépendants", m: ["AGRICULTEUR", "ARTISAN", "COMMERÇANT"] },
    { l: "Les lignes du bulletin de paie", m: ["BRUT", "COTISATIONS", "NET PAYÉ", "PRÉLÈVEMENT À LA SOURCE"] },
    { l: "Les frais professionnels d'Amanda", m: ["DÉPLACEMENTS", "MATÉRIEL", "ASSURANCE"] },
    { l: "Des revenus de transfert", m: ["ALLOCATIONS", "RETRAITE", "RSA", "CHÔMAGE"] },
    { l: "Calculer les ressources du ménage", m: ["TOTAL", "PART", "POURCENTAGE"] }
  ],
  liste: [
    { m: "MÉNAGE", s: 1, d: "Les personnes qui habitent le même logement, avec ou sans lien de famille.", e: "Deux colocataires forment un seul ménage. Un frère qui vit ailleurs n'en fait pas partie.", x: "Dans la situation : Victor, Amanda et leurs deux enfants, soit quatre personnes." },
    { m: "LOGEMENT", s: 1, d: "Lieu où l'on habite : c'est lui qui définit le ménage.", e: "Habiter au même endroit compte, pas le lien de famille.", x: "Dans la situation : le frère d'Amanda vit dans un autre appartement." },
    { m: "PARENTÉ", s: 1, d: "Lien de famille : il ne suffit pas pour faire partie d'un ménage.", e: "Un frère qui habite ailleurs n'est pas dans le ménage ; deux colocataires sans lien de famille, si." },
    { m: "SALARIÉ", s: 1, d: "Personne qui travaille pour un employeur et reçoit une paie chaque mois.", e: "Il est payé par son employeur, et non par des clients.", x: "Dans la situation : Victor, ouvrier paysagiste en CDI." },
    { m: "SALAIRE", s: 1, d: "Argent versé par l'employeur en échange du travail.", e: "Il est inscrit sur le bulletin de paie. Un indépendant, lui, est payé par ses clients." },
    { m: "EMPLOYEUR", s: 1, d: "Personne ou entreprise qui fait travailler quelqu'un et le paie.", e: "Il verse le salaire et remet le bulletin de paie.", x: "Dans la situation : les Jardins du Rhône, pour Victor." },
    { m: "INDÉPENDANT", s: 1, d: "Travailleur qui vend ses produits ou ses services à des clients, sans employeur.", e: "Agriculteur, artisan, commerçant ou micro-entrepreneur : ce sont ses clients qui le paient.", x: "Dans la situation : Amanda, micro-entrepreneuse." },
    { m: "CLIENTS", s: 1, d: "Ceux qui achètent les produits ou les services d'un travailleur indépendant.", e: "Ce sont eux qui paient l'indépendant, pas un employeur." },
    { m: "CHIFFRE D'AFFAIRES", s: 1, d: "Total encaissé auprès des clients par un indépendant, avant toute dépense.", e: "Ce n'est pas ce qui lui reste : il faut encore retirer les dépenses et les cotisations.", x: "Dans la situation : les 1 640 euros encaissés par Amanda." },
    { m: "HONORAIRES", s: 1, d: "Nom de la somme versée par le client à une profession libérale.", e: "C'est la paie d'une profession libérale, payée par ses clients." },
    { m: "AGRICULTEUR", s: 1, d: "Travailleur indépendant qui vend sa production.", e: "Il n'a pas d'employeur : ce sont ses clients qui le paient." },
    { m: "ARTISAN", s: 1, d: "Exemple de travailleur indépendant cité dans le cours, avec l'agriculteur et le commerçant.", e: "Il vend ses services ou ses produits à des clients." },
    { m: "COMMERÇANT", s: 1, d: "Exemple de travailleur indépendant qui vend à des clients.", e: "Comme l'artisan ou l'agriculteur, il est payé par ses clients." },

    { m: "BULLETIN", s: 2, d: "Feuille de paie remise au salarié : brut, cotisations, net payé.", e: "On l'appelle bulletin de paie. Il permet de vérifier son salaire.", x: "Dans la situation : Victor le sort pour le dossier de la banque." },
    { m: "BRUT", s: 2, d: "Se dit du salaire avant le retrait des cotisations et de l'impôt.", e: "C'est le plus gros montant du bulletin. Le net payé est toujours plus petit.", x: "Dans la situation : 1 950 euros pour Victor." },
    { m: "NET PAYÉ", s: 2, d: "Somme réellement versée sur le compte du salarié.", e: "C'est le salaire brut moins les cotisations et l'impôt.", x: "Dans la situation : 1 498 euros pour Victor." },
    { m: "COTISATIONS", s: 2, d: "Sommes retirées du salaire brut pour payer la protection sociale, comme la retraite.", e: "Elles expliquent en grande partie l'écart entre le brut et le net payé.", x: "Dans la situation : 410 euros sur le bulletin de Victor." },
    { m: "IMPÔT", s: 2, d: "Somme prise sur le revenu, retenue directement par l'employeur sur la paie.", e: "On parle de prélèvement à la source : il est retiré avant le versement du net payé.", x: "Dans la situation : 42 euros pour Victor." },
    { m: "PRÉLÈVEMENT À LA SOURCE", s: 2, d: "Impôt sur le revenu retenu directement par l'employeur sur le salaire.", e: "Avec les cotisations, il forme l'écart entre le brut et le net payé.", x: "Dans la situation : 42 euros pour Victor." },
    { m: "SMIC", s: 2, d: "Salaire légal le plus bas : aucun employeur ne peut payer moins.", e: "On le vérifie avec le taux horaire brut.", x: "Dans la situation : 12,31 euros brut par heure." },
    { m: "MINIMUM", s: 2, d: "Le SMIC est le salaire … légal : en dessous, l'employeur ne respecte pas la loi.", e: "Un salaire plus bas que le SMIC est interdit." },
    { m: "TAUX HORAIRE", s: 2, d: "Somme gagnée en brut pour soixante minutes de travail.", e: "Calcul : salaire brut divisé par le nombre d'heures. On le compare au SMIC.", x: "Dans la situation : 1 950 ÷ 151,67 = 12,86 euros pour Victor." },
    { m: "HEURE", s: 2, d: "Unité de temps : Victor est payé pour 151,67 de ces unités par mois.", e: "Le salaire brut divisé par leur nombre donne le taux horaire brut." },

    { m: "FRAIS", s: 3, d: "Dépenses nécessaires pour travailler : déplacements, matériel, assurance.", e: "L'indépendant les paie lui-même. Il faut les retirer du chiffre d'affaires.", x: "Dans la situation : les déplacements, le petit matériel et l'assurance d'Amanda." },
    { m: "DÉPLACEMENTS", s: 3, d: "Trajets pour travailler, comptés dans les frais professionnels.", e: "Avec le petit matériel, ils font partie des sorties de la micro-entreprise.", x: "Dans la situation : 185 euros avec le petit matériel." },
    { m: "MATÉRIEL", s: 3, d: "Outils et fournitures pour travailler, comptés dans les frais professionnels.", e: "C'est une dépense de l'indépendant : elle réduit ce qui lui reste." },
    { m: "ASSURANCE", s: 3, d: "Contrat professionnel payé par l'indépendant, compté dans ses frais.", e: "C'est une sortie d'argent, retirée du chiffre d'affaires.", x: "Dans la situation : 40 euros pour Amanda." },
    { m: "DISPONIBLE", s: 3, d: "Se dit de la somme qui reste à l'indépendant après ses dépenses et ses cotisations.", e: "Chiffre d'affaires moins les sorties : c'est le vrai revenu de l'indépendant.", x: "Dans la situation : 1 640 − 570 = 1 070 euros pour Amanda." },
    { m: "REVENU D'ACTIVITÉ", s: 3, d: "Argent obtenu grâce au travail.", e: "Exemples : un salaire, ou la somme qui reste à un indépendant.", x: "Dans la situation : le salaire net de Victor et la somme restant à Amanda." },
    { m: "REVENU DU CAPITAL", s: 3, d: "Argent obtenu grâce à ce que l'on possède.", e: "Exemples : un loyer perçu, les intérêts d'un livret d'épargne.", x: "Dans la situation : le loyer du garage loué à un voisin." },
    { m: "REVENU DE TRANSFERT", s: 3, d: "Argent versé par la protection sociale.", e: "Exemples : allocations familiales, retraite, RSA, allocation chômage.", x: "Dans la situation : les allocations pour les deux enfants." },
    { m: "INTÉRÊTS", s: 3, d: "Argent rapporté par un livret d'épargne.", e: "C'est un revenu du capital : il vient de ce que l'on possède, pas du travail." },
    { m: "ALLOCATIONS", s: 3, d: "Aides versées par la protection sociale, par exemple pour les enfants.", e: "Les allocations familiales sont un revenu de transfert.", x: "Dans la situation : 150 euros pour les deux enfants." },
    { m: "RETRAITE", s: 3, d: "Pension versée par la protection sociale après la vie de travail.", e: "C'est un revenu de transfert, comme les allocations ou le RSA." },
    { m: "RSA", s: 3, d: "Revenu de solidarité versé par la protection sociale.", e: "C'est un revenu de transfert : il ne vient ni du travail ni de ce que l'on possède." },
    { m: "CHÔMAGE", s: 3, d: "Situation qui donne droit à une allocation versée par la protection sociale.", e: "L'allocation qui lui est liée est un revenu de transfert." },
    { m: "MSA", s: 3, d: "Organisme de protection sociale des personnes du secteur agricole.", e: "Sigle de la Mutualité sociale agricole. Elle verse les prestations familiales du régime agricole." },

    { m: "RESSOURCES", s: 4, d: "Tout ce qui entre dans le ménage : revenus d'activité, du capital et de transfert.", e: "On les additionne pour connaître le total du ménage.", x: "Dans la situation : la banque demande celles du ménage chaque mois." },
    { m: "TOTAL", s: 4, d: "Résultat de l'addition de toutes les ressources du ménage.", e: "1 498 + 1 070 + 80 + 150 : on additionne les trois types de revenus.", x: "Dans la situation : 2 798 euros pour Victor et Amanda." },
    { m: "PART", s: 4, d: "Morceau d'un total, souvent écrit en pourcentage.", e: "Calcul : la partie divisée par le total, multipliée par 100." },
    { m: "POURCENTAGE", s: 4, d: "Calcul : une partie divisée par le total, multipliée par 100.", e: "Il dit quelle place prend une partie dans le total.", x: "Dans la situation : 92 % des ressources viennent du travail." },
    { m: "LOYER", s: 4, d: "Somme versée par un locataire au propriétaire d'un bien mis en location.", e: "Pour le propriétaire, c'est un revenu du capital.", x: "Dans la situation : 80 euros pour le garage loué à un voisin." },
    { m: "LOCATAIRE", s: 4, d: "Personne qui paie un loyer pour utiliser le bien d'un autre.", e: "Il verse le loyer ; le propriétaire le reçoit.", x: "Dans la situation : le voisin qui loue le garage." },
    { m: "PROPRIÉTAIRE", s: 4, d: "Personne à qui appartient un bien et qui reçoit le loyer.", e: "Le loyer qu'il perçoit est un revenu du capital." },
    { m: "BANQUE", s: 4, d: "Elle demande les ressources mensuelles du ménage pour une demande de prêt.", e: "Elle veut connaître tout ce qui entre dans le ménage, pas seulement le salaire.", x: "Dans la situation : le conseiller dit que le dossier est incomplet." }
  ]
};
