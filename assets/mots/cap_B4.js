/* Mots du module B4 CAP — Le bruit au quotidien.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cap_B4_cours.html (notions, DOC. 1 à 9). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Yanis */
window.MOTS = {
  module: "B4", classe: "CAP", titre: "Le bruit au quotidien", retour: "cap_B4_jeux.html", cle: "CAPB4",
  seances: { 1: "Le son et le bruit", 2: "L'oreille et les effets du bruit", 3: "La prévention du bruit" },
  /* Dessin du pendu : l'échelle des niveaux sonores (DOC. 2 et 3), une marche par erreur. */
  jauge: [
    { v: "50", l: "Conversation" },
    { v: "80", l: "Seuil de nocivité" },
    { v: "85", l: "12 h 30 par semaine" },
    { v: "90", l: "4 h par semaine" },
    { v: "100", l: "20 min par semaine" },
    { v: "102", l: "Maximum en concert" },
    { v: "120", l: "Seuil de douleur" }
  ],
  uniteJauge: "dB(A)",
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Décrire un son", m: ["INTENSITÉ", "FRÉQUENCE", "GRAVE", "AIGU", "DÉCIBEL", "HERTZ"] },
    { l: "Les seuils de l'échelle des niveaux sonores", m: ["SEUIL D'AUDIBILITÉ", "SEUIL DE NOCIVITÉ", "SEUIL DE DOULEUR"] },
    { l: "Les parties de l'appareil auditif", m: ["PAVILLON", "CONDUIT AUDITIF", "TYMPAN", "OSSELETS", "COCHLÉE", "CELLULES CILIÉES", "NERF AUDITIF"] },
    { l: "Les effets auditifs du bruit", m: ["FATIGUE AUDITIVE", "ACOUPHÈNES", "SURDITÉ"] },
    { l: "Les effets extra-auditifs du bruit", m: ["STRESS", "SOMMEIL", "CONCENTRATION"] },
    { l: "Les conséquences sur la vie sociale et professionnelle", m: ["ISOLEMENT", "CONFLIT", "ACCIDENT DU TRAVAIL"] },
    { l: "Se protéger du bruit", m: ["BOUCHONS D'OREILLES", "CASQUE ANTIBRUIT", "PAUSE", "VOLUME", "PROTECTEURS INDIVIDUELS", "ZONE DE REPOS AUDITIF"] },
    { l: "Les bruits de voisinage", m: ["VOISINAGE", "COMPORTEMENT CIVIQUE", "RÉPRESSION", "AMENDE", "CONCILIATEUR"] }
  ],
  liste: [
    { m: "SON", s: 1, d: "Vibration de l'air, produite par une source, que l'oreille perçoit.", e: "Une source vibre (une voix, une enceinte, une machine). L'air vibre à son tour et transporte cette vibration jusqu'à l'oreille." },
    { m: "ONDE SONORE", s: 1, d: "Vibration qui transmet le son de la source jusqu'à l'oreille.", e: "Entre la source et l'oreille, ce n'est pas l'air qui voyage : c'est sa vibration, l'onde sonore." },
    { m: "BRUIT", s: 1, d: "Son ou ensemble de sons perçu comme gênant.", e: "Un bruit est toujours un son, mais un son n'est pas toujours un bruit : il devient un bruit quand il gêne.", x: "La musique de Yanis après 23 heures est un bruit pour son voisin." },
    { m: "INTENSITÉ", s: 1, d: "Force d'un son : faible ou fort.", e: "Une onde de faible amplitude donne un son faible ; une onde de grande amplitude, un son fort. L'intensité se mesure en décibels, dB(A)." },
    { m: "DÉCIBEL", s: 1, d: "Unité de mesure de l'intensité d'un son, notée dB(A).", e: "Le « A » indique que la mesure tient compte de la sensibilité de l'oreille humaine. 0 dB(A) : le bruit le plus faible perçu ; 120 dB(A) : la douleur." },
    { m: "FRÉQUENCE", s: 1, d: "Nombre de vibrations par seconde : il rend un son grave ou aigu.", e: "Peu de vibrations par seconde : son grave. Beaucoup de vibrations par seconde : son aigu." },
    { m: "HERTZ", s: 1, d: "Unité de mesure de la fréquence, notée Hz.", e: "La fréquence se mesure en hertz, l'intensité en décibels. L'oreille humaine perçoit les fréquences de 20 à 20 000 Hz." },
    { m: "GRAVE", s: 1, d: "Se dit d'un son qui a peu de vibrations par seconde.", e: "Une basse fréquence donne un son grave ; une haute fréquence donne un son aigu." },
    { m: "AIGU", s: 1, d: "Se dit d'un son qui a beaucoup de vibrations par seconde.", e: "Une haute fréquence donne un son aigu ; une basse fréquence donne un son grave." },
    { m: "SEUIL D'AUDIBILITÉ", s: 1, d: "Le bruit le plus faible que l'oreille perçoit : 0 dB(A).", e: "0 dB(A) ne signifie pas « aucun son » : c'est le point de départ, le plus petit bruit que l'oreille commence à entendre." },
    { m: "SEUIL DE NOCIVITÉ", s: 1, d: "Niveau sonore à partir duquel le bruit devient dangereux pour l'oreille : 80 dB(A), pour 8 heures par jour.", e: "Au-delà de 80 dB(A), le danger dépend du temps passé dans le bruit.", x: "Les 86 dB(A) de l'atelier de Yanis dépassent ce seuil." },
    { m: "SEUIL DE DOULEUR", s: 1, d: "Niveau sonore à partir duquel le bruit fait mal : 120 dB(A).", e: "Au-delà de 120 dB(A), le bruit n'est plus seulement dangereux : il provoque une douleur." },
    { m: "NIVEAU SONORE", s: 1, d: "Intensité d'un bruit mesurée à un endroit donné, en dB(A).", e: "Le niveau sonore change selon l'endroit : il est plus élevé tout près d'une enceinte qu'au fond de la salle." },
    { m: "DURÉE D'EXPOSITION", s: 1, d: "Temps passé dans le bruit.", e: "Le risque dépend de deux grandeurs : le niveau sonore et la durée d'exposition. À 80 dB(A), 40 heures par semaine restent sans risque ; à 100 dB(A), 20 minutes seulement." },

    { m: "APPAREIL AUDITIF", s: 2, d: "Ensemble de l'oreille et du nerf qui la relie au cerveau : il permet d'entendre.", e: "Il comprend trois parties, l'oreille externe, l'oreille moyenne et l'oreille interne, puis le nerf auditif relié au cerveau." },
    { m: "PAVILLON", s: 2, d: "Partie visible de l'oreille externe, qui capte l'onde sonore.", e: "C'est la première étape du trajet du son : le pavillon recueille l'onde sonore." },
    { m: "CONDUIT AUDITIF", s: 2, d: "Canal de l'oreille externe que parcourt l'onde sonore jusqu'au tympan.", e: "Deuxième étape du trajet : l'onde sonore parcourt le conduit auditif jusqu'au tympan." },
    { m: "TYMPAN", s: 2, d: "Fine membrane qui vibre quand l'onde sonore l'atteint.", e: "Le tympan sépare l'oreille externe de l'oreille moyenne. Il transforme l'onde sonore en vibrations." },
    { m: "OSSELETS", s: 2, d: "Trois petits os de l'oreille moyenne qui transmettent les vibrations.", e: "Les osselets font passer les vibrations du tympan jusqu'à l'oreille interne." },
    { m: "COCHLÉE", s: 2, d: "Organe de l'oreille interne qui contient les cellules ciliées.", e: "Dans la cochlée, les vibrations sont transformées en message nerveux." },
    { m: "CELLULES CILIÉES", s: 2, d: "Éléments sensoriels de la cochlée, munis de cils, qui transforment les vibrations en influx nerveux.", e: "Un bruit intense et prolongé les détruit peu à peu. Elles ne se réparent pas : c'est la cause de la surdité." },
    { m: "INFLUX NERVEUX", s: 2, d: "Message conduit par le nerf auditif jusqu'au cerveau.", e: "Les cellules ciliées transforment les vibrations en influx nerveux : le son devient un message que le cerveau peut lire." },
    { m: "NERF AUDITIF", s: 2, d: "Il conduit l'influx nerveux de l'oreille interne jusqu'au cerveau.", e: "Dernier relais avant le cerveau, le nerf auditif fait partie de l'appareil auditif." },
    { m: "CERVEAU", s: 2, d: "Organe qui reçoit l'influx nerveux et interprète le son.", e: "L'oreille capte et transforme le son ; c'est le cerveau qui le reconnaît : une voix, une alarme, une musique." },
    { m: "OREILLE EXTERNE", s: 2, d: "Pavillon et conduit auditif : elle capte l'onde sonore.", e: "Son rôle : capter le son et le conduire jusqu'au tympan." },
    { m: "OREILLE MOYENNE", s: 2, d: "Tympan et osselets : elle transmet les vibrations.", e: "Son rôle : faire passer les vibrations de l'oreille externe à l'oreille interne." },
    { m: "OREILLE INTERNE", s: 2, d: "Cochlée et cellules ciliées : elle transforme les vibrations en influx nerveux.", e: "C'est la partie la plus fragile : ses cellules ciliées détruites ne repoussent pas." },
    { m: "FATIGUE AUDITIVE", s: 2, d: "Baisse passagère de la capacité à entendre, avec sifflements, après un bruit intense.", e: "Elle disparaît avec le repos, à condition de ne pas retourner aussitôt dans le bruit. C'est un signal d'alerte.", x: "Après le concert, Yanis entend un sifflement et comprend mal ses collègues." },
    { m: "ACOUPHÈNES", s: 2, d: "Sifflements ou bourdonnements entendus dans les oreilles.", e: "Aucun son extérieur ne les produit : ils viennent de l'oreille fatiguée ou abîmée. C'est un effet auditif." },
    { m: "SURDITÉ", s: 2, d: "Perte d'audition ; due au bruit, elle est définitive.", e: "Un bruit intense et prolongé détruit les cellules ciliées. Elles ne se réparent pas : l'audition perdue ne revient pas." },
    { m: "EFFETS AUDITIFS", s: 2, d: "Conséquences du bruit sur l'oreille elle-même : acouphènes, surdité, baisse passagère de la capacité à entendre.", e: "Ils touchent l'oreille elle-même. Les autres effets, sur le reste du corps, sont dits extra-auditifs." },
    { m: "EFFETS EXTRA-AUDITIFS", s: 2, d: "Conséquences du bruit sur le reste de l'organisme : fatigue, stress, troubles du sommeil.", e: "« Extra » signifie « en dehors » : ces effets touchent le corps en dehors de l'oreille.", x: "Yanis dort mal et se sent fatigué." },
    { m: "STRESS", s: 2, d: "Tension nerveuse provoquée, entre autres, par un bruit qui dure.", e: "C'est un effet extra-auditif du bruit, comme la fatigue ou l'irritabilité." },
    { m: "SOMMEIL", s: 2, d: "Repos de la nuit que le bruit peut perturber.", e: "Les troubles du sommeil sont un effet extra-auditif : le bruit agit sur tout l'organisme, pas seulement sur l'oreille." },

    { m: "CONCENTRATION", s: 3, d: "Capacité à fixer son attention sur une tâche ; le bruit la diminue.", e: "Au travail, le bruit diminue la concentration et augmente la fatigue." },
    { m: "ISOLEMENT", s: 3, d: "Situation d'une personne qui s'éloigne des autres parce qu'elle entend mal.", e: "Une personne qui entend mal suit difficilement une conversation : c'est une conséquence du bruit sur la vie sociale." },
    { m: "CONFLIT", s: 3, d: "Désaccord, par exemple entre voisins, provoqué par le bruit.", e: "Le bruit fait par un voisin est une source fréquente de conflits.", x: "Le voisin de Yanis est venu se plaindre de sa musique." },
    { m: "ACCIDENT DU TRAVAIL", s: 3, d: "Événement soudain qui blesse un salarié pendant son activité professionnelle ; le bruit peut le favoriser.", e: "Le bruit peut masquer un signal d'alarme : le salarié ne l'entend pas et ne réagit pas à temps." },
    { m: "PRÉVENTION", s: 3, d: "Ensemble des mesures prises pour éviter les effets du bruit sur la santé.", e: "Prévenir, c'est agir avant le dommage : baisser le volume, faire des pauses, porter des protections." },
    { m: "BOUCHONS D'OREILLES", s: 3, d: "Protecteurs individuels placés dans le conduit auditif.", e: "Ils ne protègent que s'ils sont bien mis et portés pendant toute la durée du bruit." },
    { m: "CASQUE ANTIBRUIT", s: 3, d: "Protecteur individuel qui couvre les deux oreilles.", e: "Un casque enlevé, même peu de temps, ne protège plus.", x: "Yanis enlève souvent son casque parce qu'il a chaud." },
    { m: "PAUSE", s: 3, d: "Moment de repos, loin du bruit, pour reposer les oreilles.", e: "Faire des pauses limite la durée d'exposition au bruit." },
    { m: "VOLUME", s: 3, d: "Réglage de la puissance du son des écouteurs : 60 % au plus du maximum.", e: "Baisser le volume réduit le niveau sonore qui arrive dans l'oreille.", x: "Yanis écoute sa musique au volume maximal : 95 dB(A)." },
    { m: "PROTECTEURS INDIVIDUELS", s: 3, d: "Bouchons d'oreilles ou casque antibruit, portés par une personne pour se protéger du bruit.", e: "Au travail, au-dessus de 80 dB(A) sur 8 heures, l'employeur les met à disposition ; au-dessus de 85 dB(A), il contrôle leur port." },
    { m: "RÉGLEMENTATION", s: 3, d: "Ensemble des règles qui limitent le bruit : au travail, dans les concerts, entre voisins.", e: "Par exemple, dans un concert, le niveau sonore ne doit pas dépasser 102 dB(A) en moyenne sur 15 minutes." },
    { m: "ZONE DE REPOS AUDITIF", s: 3, d: "Espace d'un concert ou d'une discothèque où le bruit est plus faible.", e: "L'organisateur doit la créer pour que le public puisse reposer ses oreilles." },
    { m: "COMPORTEMENT CIVIQUE", s: 3, d: "Attitude qui consiste à limiter le bruit que l'on fait pour ne pas gêner les autres.", e: "Baisser la musique, prévenir ses voisins avant une fête, porter un casque le soir : ce sont des gestes civiques." },
    { m: "VOISINAGE", s: 3, d: "Ensemble des personnes qui habitent à côté de chez soi.", e: "Un bruit de voisinage peut être sanctionné de jour comme de nuit s'il est anormal par son intensité, sa durée ou sa répétition." },
    { m: "RÉPRESSION", s: 3, d: "Sanction d'une infraction, par exemple une amende pour un bruit de voisinage.", e: "La police ou la gendarmerie peut constater l'infraction et la sanctionner." },
    { m: "AMENDE", s: 3, d: "Somme d'argent à payer en sanction d'une infraction.", e: "Pour un bruit de voisinage, l'amende forfaitaire est de 68 € ; elle peut aller jusqu'à 450 €." },
    { m: "CONCILIATEUR", s: 3, d: "Personne qui aide gratuitement deux voisins en désaccord à trouver une solution.", e: "En cas de gêne : parler d'abord au voisin, puis lui écrire, puis faire appel au conciliateur de justice." }
  ]
};
