/* Mots du module C2 Bac Pro (Seconde) — Les notions de base en prévention des risques professionnels.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Les notions de base en prévention des risques professionnels v1.0 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Sami */
window.MOTS = {
  module: "C2", classe: "2nde Bac Pro", titre: "Les notions de base en prévention des risques professionnels", retour: "bcp_2nde_C2_jeux.html", cle: "BP2C2",
  seances: { 1: "Les consignes de sécurité au poste", 2: "Dangers et dommages", 3: "Les familles de risques professionnels" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Ce qui guide le travail en sécurité", m: ["CONSIGNE", "INSTRUCTION", "INFORMATION"] },
    { l: "Les catégories de panneaux", m: ["INTERDICTION", "OBLIGATION", "AVERTISSEMENT", "SAUVETAGE", "MATÉRIEL INCENDIE"] },
    { l: "Les couleurs de fond des panneaux", m: ["BLEU", "JAUNE", "VERT"] },
    { l: "Ce qu'indique le plan d'évacuation", m: ["SORTIES", "EXTINCTEUR", "TROUSSE"] },
    { l: "Les éléments du PAD", m: ["DANGER", "OPÉRATEUR", "SITUATION DANGEREUSE", "ÉVÉNEMENT DANGEREUX", "DOMMAGE POTENTIEL"] },
    { l: "Des dommages potentiels", m: ["ENTORSE", "COUPURE", "FRACTURE", "LOMBALGIE"] },
    { l: "Six familles de risques professionnels", m: ["CHUTE DE PLAIN-PIED", "CHUTE DE HAUTEUR", "CHARGE PHYSIQUE", "PRODUITS CHIMIQUES", "ÉQUIPEMENTS DE TRAVAIL", "BRUIT"] },
    { l: "Les atteintes par les produits chimiques", m: ["INTOXICATION", "ALLERGIE", "BRÛLURE"] }
  ],
  liste: [
    { m: "CONSIGNE", s: 1, d: "Indication de ce qu'il faut faire ou ne pas faire pour travailler sans danger.", e: "Elle est donnée par un responsable, une fiche de poste, un plan, une affiche ou un pictogramme.", x: "« Jeter les films plastiques dans le bac prévu » en est une, sur la fiche de poste de Sami." },
    { m: "INSTRUCTION", s: 1, d: "Conduite précise à suivre au poste de travail.", e: "« Couper en éloignant la lame du corps » en est une : elle dit exactement quel geste faire." },
    { m: "INFORMATION", s: 1, d: "Renseignement utile pour travailler en sécurité.", e: "Elle renseigne sans imposer un geste précis, contrairement à l'instruction, qui fixe une conduite à suivre." },
    { m: "PICTOGRAMME", s: 1, d: "Image simple placée au centre d'un panneau.", e: "La forme et la couleur du panneau indiquent sa catégorie ; l'image au centre montre le danger, l'obligation, l'interdiction ou l'équipement." },
    { m: "FICHE DE POSTE", s: 1, d: "Document qui présente les dangers d'un emploi, les protections obligatoires, les consignes et la conduite en cas d'accident.", e: "La relire permet de repérer les dangers et d'appliquer les consignes qui les évitent.", x: "Sami ne l'a pas relue depuis son premier jour." },
    { m: "PLAN D'ÉVACUATION", s: 1, d: "Document affiché qui montre les sorties, les issues de secours et les directions à suivre.", e: "Il est affiché dans les voies de circulation et indique l'emplacement des équipements de secours. Tout le personnel doit le connaître.", x: "Il est affiché à l'entrée de l'entrepôt de Sami." },
    { m: "INTERDICTION", s: 1, d: "Panneau rond, pictogramme noir sur fond blanc, bordure et bande rouges.", e: "Exemple : flamme nue interdite. La bande en travers signale ce qu'il ne faut pas faire." },
    { m: "OBLIGATION", s: 1, d: "Panneau rond, pictogramme blanc sur fond bleu.", e: "Exemple : gants obligatoires. Il indique ce qu'il faut faire ou porter." },
    { m: "AVERTISSEMENT", s: 1, d: "Panneau triangulaire, pictogramme noir sur fond jaune, bordure noire.", e: "Il signale un danger. Sa forme en triangle le fait reconnaître au premier coup d'œil." },
    { m: "SAUVETAGE", s: 1, d: "Catégorie de panneau carré ou rectangulaire, pictogramme blanc sur fond vert, avec « secours ».", e: "Exemple : premiers secours, avec une croix. Il montre où trouver de l'aide." },
    { m: "MATÉRIEL INCENDIE", s: 1, d: "Panneau carré ou rectangulaire, pictogramme blanc sur fond rouge.", e: "Exemple : extincteur. À ne pas confondre avec le panneau de sauvetage et de secours, sur fond vert." },
    { m: "BLEU", s: 1, d: "Couleur du fond des panneaux d'obligation.", e: "Forme ronde et fond de cette couleur : le panneau indique ce qu'il faut faire, par exemple porter des gants." },
    { m: "JAUNE", s: 1, d: "Couleur du fond des panneaux d'avertissement.", e: "Triangle, bordure noire, fond de cette couleur : le panneau signale un danger." },
    { m: "VERT", s: 1, d: "Couleur du fond des panneaux de sauvetage et de secours.", e: "Il se distingue du fond rouge des panneaux de matériel incendie." },
    { m: "EXTINCTEUR", s: 1, d: "Équipement de lutte contre le feu, signalé par un panneau à fond rouge.", e: "Son emplacement figure sur le plan d'évacuation, repéré par la lettre E." },
    { m: "SORTIES", s: 1, d: "Avec les issues de secours, elles figurent sur le plan d'évacuation.", e: "Connaître la plus proche permet de quitter les lieux sans hésiter en cas d'urgence.", x: "Près de l'emplacement « Vous êtes ici », la plus proche est S1." },
    { m: "TROUSSE", s: 1, d: "Équipement de premiers secours repéré par une croix sur le plan d'évacuation.", e: "Le plan indique où trouver les équipements de secours, en plus des sorties." },
    { m: "GANTS", s: 1, d: "Équipement de protection obligatoire au poste de préparateur de commandes, avec les chaussures de sécurité.", e: "La fiche de poste liste les équipements de protection obligatoires.", x: "Sami ouvre les cartons avec un cutter." },
    { m: "CHAUSSURES DE SÉCURITÉ", s: 1, d: "Équipement de protection des pieds, obligatoire au poste de Sami avec les gants.", e: "Elles figurent sur la fiche de poste parmi les équipements de protection obligatoires." },

    { m: "ACTIVITÉ DE TRAVAIL", s: 2, d: "Ce que la personne fait réellement pour réaliser la tâche demandée.", e: "Elle tient compte du matériel, du lieu et des conditions dans lesquels la personne agit." },
    { m: "PAD", s: 2, d: "Processus d'apparition d'un dommage, en abrégé.", e: "Il relie le danger, l'opérateur, la situation dangereuse, l'événement dangereux et le dommage potentiel. Un poste peut en compter plusieurs." },
    { m: "DANGER", s: 2, d: "Ce qui peut provoquer un dommage : un sol mouillé, un cutter, un colis lourd.", e: "C'est la cause, au début du PAD. À ne pas confondre avec le dommage, qui est l'atteinte à la santé.", x: "Le film plastique au sol, sur lequel Sami a glissé." },
    { m: "OPÉRATEUR", s: 2, d: "Personne qui réalise le travail.", e: "Dans le PAD, il est la personne exposée : par exemple un agent d'entretien.", x: "Dans la glissade, c'est Sami." },
    { m: "SITUATION DANGEREUSE", s: 2, d: "Moment où l'opérateur est exposé au danger.", e: "Exemple : l'agent marche sur le sol mouillé. Le danger seul ne blesse pas : il faut que quelqu'un y soit exposé.", x: "Sami marche dans l'allée encombrée en portant un colis." },
    { m: "ÉVÉNEMENT DANGEREUX", s: 2, d: "Ce qui provoque le dommage, par exemple une glissade.", e: "Il survient pendant la situation dangereuse et déclenche l'atteinte à la santé.", x: "Sami glisse sur le film plastique." },
    { m: "DOMMAGE POTENTIEL", s: 2, d: "Atteinte à la santé qui peut résulter de la situation dangereuse.", e: "C'est la fin du PAD : une entorse, une coupure, une douleur au dos." },
    { m: "ENTORSE", s: 2, d: "Atteinte à la santé possible après une glissade sur un sol mouillé ou encombré.", e: "C'est un dommage potentiel : la conséquence, pas la cause.", x: "Sami aurait pu s'en faire une en glissant sur le film plastique." },
    { m: "COUPURE", s: 2, d: "Atteinte de la main que peut provoquer un cutter.", e: "Le cutter est le danger ; cette blessure est le dommage potentiel.", x: "Sami ouvre les cartons avec un cutter." },
    { m: "FRACTURE", s: 2, d: "Os cassé, dommage possible d'une chute.", e: "Dans le PAD de la glissade de Sami, c'est l'un des dommages potentiels, avec l'entorse et la douleur au dos." },
    { m: "LOMBALGIE", s: 2, d: "Douleur au dos, dommage possible du port de colis lourds.", e: "Le colis de 20 kg est le danger ; ce mal de dos est le dommage potentiel.", x: "Sami porte chaque jour des colis jusqu'à 20 kg." },
    { m: "GLISSADE", s: 2, d: "Perte d'appui du pied sur un sol mouillé ou encombré.", e: "Dans le PAD, c'est l'événement dangereux : ce qui provoque le dommage.", x: "Sami s'est rattrapé de justesse sur le film plastique." },
    { m: "CUTTER", s: 2, d: "Outil tranchant qui est un danger au poste de préparateur de commandes.", e: "Consigne de la fiche de poste : couper en éloignant la lame du corps.", x: "Sami ouvre les cartons avec cet outil." },

    { m: "RISQUE PROFESSIONNEL", s: 3, d: "Il apparaît quand un salarié est exposé à un danger dans son travail.", e: "Sans exposition, pas de risque : le danger existe, mais personne n'y est confronté." },
    { m: "FAMILLES DE RISQUES", s: 3, d: "Regroupements des dangers du travail ; l'INRS en recense vingt.", e: "Le cours en étudie six : chutes de plain-pied et de hauteur, charge physique, produits chimiques, équipements de travail, bruit." },
    { m: "INRS", s: 3, d: "Organisme qui recense vingt familles de risques professionnels.", e: "Son document « Évaluation des risques professionnels » regroupe les risques en familles." },
    { m: "CHUTE DE PLAIN-PIED", s: 3, d: "Glissade, trébuchement ou perte d'équilibre sur une surface plane.", e: "Exemples : sol mouillé, allée encombrée, câble au sol.", x: "Le film plastique dans l'allée de Sami relève de cette famille." },
    { m: "CHUTE DE HAUTEUR", s: 3, d: "Famille de risques : tomber dans le vide depuis un endroit élevé.", e: "Exemples : escabeau, escalier, quai de chargement. À ne pas confondre avec la chute sur une surface plane." },
    { m: "CHARGE PHYSIQUE", s: 3, d: "Famille de risques liés aux efforts, aux postures et aux gestes répétés.", e: "Elle provoque douleurs et troubles musculosquelettiques.", x: "Les colis de 20 kg de Sami relèvent de cette famille." },
    { m: "PRODUITS CHIMIQUES", s: 3, d: "Famille de risques : intoxication, allergie ou brûlure par inhalation, ingestion ou contact avec la peau.", e: "Exemples : produit d'entretien, solvant." },
    { m: "ÉQUIPEMENTS DE TRAVAIL", s: 3, d: "Famille de risques liés aux machines et aux outils : écrasement, coupure, projection.", e: "Le cutter et le compacteur relèvent de cette famille." },
    { m: "BRUIT", s: 3, d: "Famille de risques : atteinte de l'oreille par une forte dose chaque jour ou un son soudain très fort.", e: "Exemples : machine bruyante, compacteur.", x: "Sami passe plusieurs fois par jour près du compacteur à cartons." },
    { m: "ESCABEAU", s: 3, d: "Petit marchepied, exemple de situation de chute de hauteur.", e: "Tomber de ce marchepied relève de la chute de hauteur, et non de la chute de plain-pied." },
    { m: "INTOXICATION", s: 3, d: "Atteinte par un produit chimique inhalé, avalé ou en contact avec la peau.", e: "Avec l'allergie et la brûlure, c'est l'une des atteintes de la famille des produits chimiques." },
    { m: "ALLERGIE", s: 3, d: "Réaction du corps que peut provoquer un produit chimique.", e: "Elle fait partie, avec l'intoxication et la brûlure, des atteintes par les produits chimiques." },
    { m: "BRÛLURE", s: 3, d: "Lésion de la peau que peut provoquer un produit chimique.", e: "Les produits chimiques peuvent agir par inhalation, ingestion ou contact avec la peau." },
    { m: "ÉCRASEMENT", s: 3, d: "Blessure que peut provoquer une machine, comme un compacteur.", e: "C'est un dommage lié aux équipements de travail, comme la coupure." },
    { m: "POSTURES", s: 3, d: "Positions du corps qui, avec les efforts et les gestes répétés, relèvent de la charge physique.", e: "De mauvaises positions répétées provoquent des douleurs et des troubles musculosquelettiques." },
    { m: "COMPACTEUR", s: 3, d: "Machine à cartons qui relève de deux familles : équipements de travail et bruit.", e: "Elle peut écraser ou blesser, et elle est très bruyante.", x: "Sami passe plusieurs fois par jour près du compacteur, où il doit mettre ses bouchons d'oreilles." },
    { m: "TRANSPALETTE", s: 3, d: "Engin à utiliser pour déplacer les colis lourds, selon la fiche de poste.", e: "Il évite de porter les colis lourds à bras et permet de garder la vue sur le sol.", x: "Le gros colis cachait le sol devant les pieds de Sami." }
  ]
};
