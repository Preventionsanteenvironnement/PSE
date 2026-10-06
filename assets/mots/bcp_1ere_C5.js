/* Mots du module C5 1re Bac Pro — L'analyse des risques professionnels.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours L'analyse des risques professionnels v1.0 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Kenza */
window.MOTS = {
  module: "C5", classe: "1re Bac Pro", titre: "L'analyse des risques professionnels", retour: "bcp_1ere_C5_jeux.html", cle: "BP1C5",
  seances: { 1: "Les composantes d'une activité de travail", 2: "Le processus d'apparition du dommage", 3: "L'évaluation du risque", 4: "Les mesures de prévention et le DUERP" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Les composantes de l'ITaMaMi", m: ["INDIVIDU", "TÂCHE", "ACTIVITÉ", "MATÉRIEL", "MILIEU"] },
    { l: "Les éléments du PAD", m: ["DANGER", "OPÉRATEUR", "SITUATION DANGEREUSE", "ÉVÉNEMENT DÉCLENCHEUR", "DOMMAGE"] },
    { l: "Des exemples de dommages", m: ["ENTORSE", "FRACTURE", "MALADIE"] },
    { l: "Les degrés de gravité de la grille", m: ["HOSPITALISATION", "INCAPACITÉ", "DÉCÈS"] },
    { l: "Les principes généraux de prévention", m: ["ÉVITER", "COMBATTRE", "ADAPTER", "REMPLACER", "PLANIFIER"] },
    { l: "L'échelle des mesures de prévention", m: ["SUPPRESSION", "PROTECTION COLLECTIVE", "PROTECTION INDIVIDUELLE", "FORMATION"] }
  ],
  liste: [
    { m: "ITAMAMI", s: 1, d: "Outil d'analyse qui décrit une activité de travail en cinq composantes.", e: "Ses initiales donnent les cinq composantes : Individu, Tâche, Activité, Matériel, Milieu. On décrit l'activité avant de chercher les risques." },
    { m: "INDIVIDU", s: 1, d: "Composante qui désigne la personne qui travaille : âge, expérience, formation, état de santé.", e: "C'est le « I » de l'ITaMaMi.", x: "Kenza, 22 ans, employée de libre-service depuis cinq mois." },
    { m: "TÂCHE", s: 1, d: "Le travail demandé, prescrit par l'entreprise.", e: "C'est ce qui est prévu. Ce que la personne fait réellement s'appelle l'activité.", x: "Remplir les rayons des boissons avant l'ouverture." },
    { m: "ACTIVITÉ", s: 1, d: "Ce que la personne fait réellement pour réaliser le travail demandé.", e: "Elle peut s'écarter de ce qui est prescrit, souvent à cause du matériel ou du milieu.", x: "Kenza monte sur l'escabeau les bras chargés, sans se tenir." },
    { m: "MATÉRIEL", s: 1, d: "Composante qui regroupe les outils, les machines, les produits, les charges.", e: "C'est le premier « Ma » de l'ITaMaMi.", x: "Les packs d'eau de 9 kg, l'escabeau de trois marches." },
    { m: "MILIEU", s: 1, d: "Composante qui regroupe le lieu, les horaires, l'ambiance, l'organisation, les autres personnes.", e: "C'est le dernier « Mi » de l'ITaMaMi. Il peut pousser la personne à s'écarter de la façon sûre de travailler.", x: "L'ouverture à 9 heures et la plateforme souvent occupée par un collègue." },
    { m: "ÉCART", s: 1, d: "Différence entre ce que la personne fait réellement et le travail prescrit.", e: "C'est dans cette différence que naissent beaucoup de situations dangereuses.", x: "Pressée, Kenza prend l'escabeau au lieu de la plateforme." },
    { m: "HORAIRES", s: 1, d: "Heures de travail : un élément du milieu.", e: "Une heure limite peut pousser à aller trop vite.", x: "Kenza doit finir avant l'ouverture à 9 heures." },
    { m: "AMBIANCE", s: 1, d: "Élément du milieu : les conditions qui entourent le poste de travail.", e: "Elle fait partie du milieu, avec le lieu, les horaires, l'organisation et les autres personnes." },
    { m: "ORGANISATION", s: 1, d: "Élément du milieu : la façon dont le travail et le matériel sont répartis.", e: "Une mauvaise répartition du matériel peut conduire à une façon de travailler dangereuse.", x: "Une seule plateforme, rangée dans la réserve et souvent occupée." },
    { m: "CHARGES", s: 1, d: "Objets lourds à porter, qui font partie du matériel.", e: "Les porter de façon répétée peut provoquer des douleurs.", x: "Kenza porte des packs d'eau de 9 kg." },

    { m: "PAD", s: 2, d: "Enchaînement qui relie le danger, l'opérateur, la situation dangereuse, l'événement déclencheur et le dommage.", e: "Ce sigle désigne le processus d'apparition du dommage : il décrit comment un dommage peut survenir." },
    { m: "DANGER", s: 2, d: "Ce qui peut provoquer un dommage.", e: "Exemple du cours : un sol mouillé. Il ne blesse pas tant que personne n'y est exposé.", x: "Le travail en hauteur, jusqu'à 1,80 m." },
    { m: "OPÉRATEUR", s: 2, d: "Personne qui réalise le travail.", e: "Exemple du cours : un agent d'entretien.", x: "Kenza est l'opératrice dans le PAD de sa chute." },
    { m: "SITUATION DANGEREUSE", s: 2, d: "Moment où l'opérateur se trouve exposé à ce qui peut provoquer un dommage.", e: "Exemple du cours : l'agent marche sur le sol mouillé.", x: "Kenza monte sur l'escabeau les bras chargés, sans se tenir." },
    { m: "ÉVÉNEMENT DÉCLENCHEUR", s: 2, d: "Ce qui provoque le dommage ; on le dit aussi « dangereux ».", e: "Exemple du cours : l'agent glisse. Sa probabilité compte dans l'évaluation du risque.", x: "L'escabeau bascule : Kenza perd l'équilibre." },
    { m: "DOMMAGE", s: 2, d: "Atteinte à la santé qui peut résulter d'une situation de travail.", e: "Il peut être immédiat (une blessure) ou apparaître après une exposition répétée (une douleur chronique, une maladie)." },
    { m: "BLESSURE", s: 2, d: "Dommage immédiat, provoqué au moment de l'accident.", e: "Elle survient tout de suite, contrairement à la maladie, qui apparaît après une exposition répétée." },
    { m: "ACCIDENT", s: 2, d: "Événement qui provoque un dommage immédiat, une blessure.", e: "Il s'oppose au dommage qui apparaît peu à peu après une exposition répétée.", x: "Lundi, l'escabeau a basculé et Kenza est tombée." },
    { m: "MALADIE", s: 2, d: "Dommage qui peut apparaître après une exposition répétée.", e: "Le dommage n'est pas toujours immédiat : il peut s'installer peu à peu." },
    { m: "ENTORSE", s: 2, d: "Blessure d'une articulation, par exemple du poignet, donnée comme exemple de dommage.", e: "Dans l'exemple du cours, l'agent glisse sur le sol mouillé et se fait ce type de blessure.", x: "Kenza s'est tordu le poignet en tombant." },
    { m: "FRACTURE", s: 2, d: "Os cassé : un dommage grave possible lors d'une chute.", e: "Une chute de hauteur peut en causer une grave, aux séquelles permanentes.", x: "C'est le dommage le plus grave possible pour Kenza." },
    { m: "EXPOSITION", s: 2, d: "Fait d'être en présence d'un danger ; répétée, elle peut créer un dommage.", e: "Le mal de dos n'apparaît pas en une seconde : c'est sa répétition, jour après jour, qui crée le dommage.", x: "Kenza porte des charges chaque matin." },
    { m: "IMMÉDIAT", s: 2, d: "Se dit d'un dommage qui survient tout de suite, comme une blessure.", e: "Le dommage de la chute l'est ; le mal de dos, lui, apparaît peu à peu." },
    { m: "CHRONIQUE", s: 2, d: "Se dit d'une douleur qui dure, apparue après une exposition répétée.", e: "Elle s'oppose au dommage immédiat de l'accident.", x: "Kenza a mal au dos presque chaque soir." },

    { m: "APPRÉCIATION", s: 3, d: "Démarche qui permet d'ordonner les risques pour planifier les actions de prévention et établir leurs priorités.", e: "Ses règles sont définies dans l'entreprise, avec des critères comme la gravité ou la durée d'exposition." },
    { m: "CRITÈRES", s: 3, d: "Éléments qui servent à juger un risque : gravité, durée d'exposition, nombre de personnes exposées, d'accidents survenus.", e: "Beaucoup d'entreprises en croisent deux : la gravité et la probabilité d'occurrence." },
    { m: "GRAVITÉ", s: 3, d: "Importance du dommage possible, de l'accident sans arrêt de travail au décès.", e: "C'est l'un des deux critères croisés dans la grille, avec la probabilité d'occurrence.", x: "La chute de Kenza peut causer une fracture aux séquelles permanentes." },
    { m: "PROBABILITÉ", s: 3, d: "Critère qui exprime la possibilité que le dommage arrive (… d'occurrence).", e: "Elle augmente avec la fréquence d'exposition et avec la probabilité de l'événement déclencheur." },
    { m: "FRÉQUENCE", s: 3, d: "Nombre de fois où l'opérateur est exposé au danger (… d'exposition).", e: "Plus elle est grande, plus la possibilité que le dommage arrive augmente.", x: "Kenza est exposée chaque jour, avant l'ouverture." },
    { m: "GRILLE", s: 3, d: "Tableau d'une entreprise qui note la gravité et la probabilité de 1 à 4.", e: "On y lit le niveau de priorité en croisant les deux notes." },
    { m: "CROISEMENT", s: 3, d: "Lecture combinée des deux notes, gravité et probabilité, qui donne le niveau de priorité.", e: "Deux risques de même probabilité n'ont pas la même priorité si leur gravité diffère." },
    { m: "PRIORITÉ", s: 3, d: "Niveau qui indique quels risques traiter en premier : 1 agir immédiatement, 2 rapidement, 3 dans un délai raisonnable.", e: "Il résulte du croisement de la gravité et de la probabilité.", x: "La chute passe en 1, le mal de dos en 2." },
    { m: "HOSPITALISATION", s: 3, d: "Séjour à l'hôpital ; avec l'arrêt de travail, il correspond à la note de gravité 2 de la grille.", e: "La grille va de l'accident sans arrêt de travail (1) au décès (4)." },
    { m: "INCAPACITÉ", s: 3, d: "Atteinte permanente qui empêche d'accomplir certaines activités ; note de gravité 3 de la grille.", e: "Une fracture grave peut en laisser une : c'est pourquoi la chute passe avant le mal de dos." },
    { m: "DÉCÈS", s: 3, d: "Mort de la personne : la note de gravité la plus haute de la grille, 4.", e: "C'est le dommage le plus grave de l'échelle." },

    { m: "PRINCIPES", s: 4, d: "Les neuf règles générales que suit l'employeur pour mettre en œuvre la prévention.", e: "Ils sont fixés par l'article L. 4121-2 du Code du travail, d'« éviter les risques » à « donner les instructions appropriées »." },
    { m: "ÉVITER", s: 4, d: "Premier principe général de prévention : faire en sorte que le risque n'existe pas.", e: "C'est la mesure la plus efficace : supprimer le risque plutôt que s'en protéger.", x: "Ranger les produits lourds sur les étagères basses." },
    { m: "COMBATTRE", s: 4, d: "Principe de prévention : agir contre les risques à la source.", e: "Agir là où le risque naît plutôt que sur ses effets." },
    { m: "ADAPTER", s: 4, d: "Principe de prévention : faire correspondre le travail à l'homme.", e: "Ce n'est pas à la personne de se plier au poste, mais au poste d'être conçu pour elle." },
    { m: "REMPLACER", s: 4, d: "Principe de prévention : mettre ce qui est moins dangereux à la place de ce qui l'est plus.", e: "C'est le sixième des neuf principes généraux de prévention." },
    { m: "PLANIFIER", s: 4, d: "Principe de prévention : organiser à l'avance les actions de prévention.", e: "Le DUERP sert à définir le programme des actions de prévention." },
    { m: "SUPPRESSION", s: 4, d: "Mesure qui évite le risque ou le combat à la source : le premier niveau de l'échelle.", e: "Si le risque n'existe plus, personne n'y est exposé.", x: "Avec les produits lourds en bas, Kenza n'a plus besoin de monter." },
    { m: "PROTECTION COLLECTIVE", s: 4, d: "Mesure qui met à l'abri toutes les personnes exposées ; prioritaire sur l'équipement porté par chacun.", e: "Elle empêche le dommage quel que soit le geste de la personne.", x: "La plateforme à garde-corps empêche la chute elle-même." },
    { m: "PROTECTION INDIVIDUELLE", s: 4, d: "Équipement porté par le salarié, qui ne vient qu'en complément des mesures pour tous.", e: "Elle ne s'utilise que si les mesures pour tous sont insuffisantes.", x: "Des chaussures antidérapantes limitent les glissades sans empêcher la chute de l'escabeau." },
    { m: "EPI", s: 4, d: "Sigle de ce que le salarié porte sur lui, comme des chaussures antidérapantes, en complément des mesures pour tous.", e: "Exemple du cours : faire porter un harnais vient après l'installation d'un garde-corps." },
    { m: "GARDE-CORPS", s: 4, d: "Barrière qui empêche de tomber d'une hauteur : un exemple de mesure pour tous.", e: "Le cours préfère l'installer plutôt que faire porter un harnais.", x: "La plateforme du magasin en est équipée." },
    { m: "INFORMATION", s: 4, d: "Renseignements donnés aux salariés sur les risques.", e: "Avec l'apprentissage des bons gestes, elle fait partie des instructions appropriées données aux travailleurs." },
    { m: "FORMATION", s: 4, d: "Apprentissage des bons gestes et des mesures de prévention.", e: "Elle fait partie du neuvième principe : donner les instructions appropriées aux travailleurs.", x: "Former Kenza au travail en hauteur et au port de charges." },
    { m: "DUERP", s: 4, d: "Document unique qui recense les risques identifiés et appréciés et sert à définir les actions de prévention.", e: "Il est mis à jour régulièrement, à chaque changement important des conditions de travail ou après une information nouvelle sur un risque." },
    { m: "RECENSEMENT", s: 4, d: "Liste des risques identifiés et appréciés, contenue dans le document unique.", e: "Il est classé par unité de travail, avec la méthode utilisée." },
    { m: "UNITÉ DE TRAVAIL", s: 4, d: "Découpage de l'entreprise selon lequel les risques sont classés dans le document unique.", e: "Le document unique y regroupe les risques identifiés et appréciés, avec la méthode utilisée." }
  ]
};
