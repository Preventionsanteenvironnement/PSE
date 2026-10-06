/* Mots du module SESG CAPa — S'alimenter : savoir choisir ce que l'on mange.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours S'alimenter : savoir choisir ce que l'on mange v3.2 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Victor et Amanda */
window.MOTS = {
  module: "SESG", classe: "CAPa", titre: "S'alimenter : savoir choisir ce que l'on mange", retour: "capa_sesg_alimentation_jeux.html", cle: "CAPAALIM",
  seances: { 1: "Où acheter et le coût réel", 2: "Lire une étiquette", 3: "La qualité et les déchets" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Ce que l'étiquette indique", m: ["DÉNOMINATION", "INGRÉDIENTS", "QUANTITÉ", "NUTRI-SCORE"] },
    { l: "Des aliments qui portent une DLC", m: ["YAOURT", "VIANDE", "JAMBON"] },
    { l: "Des aliments qui portent une DDM", m: ["PÂTES", "RIZ", "CONSERVE"] },
    { l: "Des légumes de saison en septembre", m: ["CAROTTE", "POIREAU", "COURGETTE", "TOMATE"] },
    { l: "Les signes officiels de qualité et d'origine", m: ["AGRICULTURE BIOLOGIQUE", "LABEL ROUGE", "AOP", "IGP"] },
    { l: "Réduire et trier les emballages", m: ["VRAC", "RÉUTILISABLE", "VERRE"] }
  ],
  liste: [
    { m: "BUDGET", s: 1, d: "L'argent dépensé par un ménage ; pour manger, on parle de … alimentaire.", e: "La part de l'alimentation dans les dépenses a baissé : 34,6 % en 1960, 20,4 % en 2014.", x: "Dans la situation : l'alimentation est l'une des plus grosses dépenses de Victor et Amanda." },
    { m: "CIRCUIT COURT", s: 1, d: "Vente avec au plus un intermédiaire entre le producteur et le consommateur.", e: "Il compte le nombre d'intermédiaires, pas la distance : il n'est pas toujours local.", x: "Dans la situation : le marché de producteurs du village." },
    { m: "CIRCUIT LONG", s: 1, d: "Vente avec plusieurs intermédiaires : grossiste, centrale d'achat, magasin.", e: "Le produit passe par plusieurs mains avant d'arriver au consommateur.", x: "Dans la situation : le supermarché qui achète ses légumes à un grossiste." },
    { m: "INTERMÉDIAIRE", s: 1, d: "Acteur placé entre le producteur et le consommateur, par exemple un grossiste.", e: "Au plus un : circuit court. Plusieurs : circuit long." },
    { m: "PRODUCTEUR", s: 1, d: "Celui qui fait pousser ou fabrique l'aliment, au début du circuit.", e: "Dans la vente directe, il vend lui-même au consommateur, à la ferme ou au marché." },
    { m: "GROSSISTE", s: 1, d: "Intermédiaire d'un circuit long, placé entre le producteur et le magasin.", e: "Quand un supermarché passe par lui, c'est un circuit long." },
    { m: "VENTE DIRECTE", s: 1, d: "Le producteur vend lui-même au consommateur, sans intermédiaire.", e: "Exemples : à la ferme, au marché. C'est un circuit court." },
    { m: "FERME", s: 1, d: "Lieu où l'on peut acheter directement au producteur.", e: "Y acheter, c'est de la vente directe : aucun intermédiaire." },
    { m: "MARCHÉ", s: 1, d: "Lieu de vente du village où les producteurs vendent eux-mêmes leurs légumes.", e: "C'est un circuit court. Le panier y coûte 12,70 €, sans frais de livraison.", x: "Dans la situation : Amanda y achète des légumes de saison." },
    { m: "SUPERMARCHÉ", s: 1, d: "Grand magasin qui achète souvent ses légumes à un grossiste.", e: "C'est un circuit long. Dans le cours, le panier y coûte le moins cher : 11,30 €.", x: "Dans la situation : Victor le trouve moins cher." },
    { m: "LIVRAISON", s: 1, d: "Service qui apporte les courses à domicile ; ses frais s'ajoutent au prix.", e: "Avec 4,90 € de frais, le panier passe de 12,00 € à 16,90 €.", x: "Dans la situation : Victor pense à commander sur le site d'un magasin." },
    { m: "COÛT RÉEL", s: 1, d: "Prix des produits plus les frais liés à l'achat, comme la livraison.", e: "C'est le prix payé en tout. Il faut le calculer pour comparer les lieux d'achat." },
    { m: "PANIER", s: 1, d: "Ensemble des produits achetés, comparé dans trois lieux d'achat.", e: "Le même ensemble de produits n'a pas le même prix partout : il faut comparer." },

    { m: "ÉTIQUETTE", s: 2, d: "Elle donne les informations obligatoires sur un produit emballé.", e: "Elle indique le nom du produit, les ingrédients, la quantité, la date, le lot.", x: "Dans la situation : Amanda ne comprend pas toujours les dates, les logos et les prix." },
    { m: "DÉNOMINATION", s: 2, d: "Nom de vente qui définit le produit.", e: "C'est la première mention obligatoire de l'étiquette." },
    { m: "INGRÉDIENTS", s: 2, d: "Leur liste va du plus important au moins important.", e: "Le premier de la liste est celui que le produit contient le plus." },
    { m: "ALLERGÈNES", s: 2, d: "Ils sont mis en relief dans la liste des ingrédients.", e: "Exemple du cours : le blé et l'avoine, qui contiennent du gluten." },
    { m: "GLUTEN", s: 2, d: "Allergène présent dans le blé et l'avoine.", e: "Il est mis en relief dans la liste des ingrédients des céréales." },
    { m: "QUANTITÉ", s: 2, d: "Mention obligatoire : la masse ou le volume du produit, dite nette.", e: "Elle sert à calculer le prix au kilo." },
    { m: "DLC", s: 2, d: "Date « à consommer jusqu'au » : une limite à respecter.", e: "Elle concerne les aliments très périssables. Après elle, l'aliment est impropre à la consommation." },
    { m: "DDM", s: 2, d: "Date « à consommer de préférence avant » : une date indicative.", e: "Après elle, un produit fermé et non altéré peut encore être consommé. Il a pu perdre du goût." },
    { m: "YAOURT", s: 2, d: "Produit très périssable, conservé au frais, qui porte une date limite à respecter.", e: "Il porte une DLC : après la date, on ne le mange plus." },
    { m: "VIANDE", s: 2, d: "Aliment très périssable, conservé au frais, qui porte une date limite à respecter.", e: "Elle porte une DLC, comme le poisson et les plats cuisinés réfrigérés." },
    { m: "JAMBON", s: 2, d: "Sous vide, il se conserve au frais et porte une date limite à respecter.", e: "C'est un aliment périssable : il porte une DLC." },
    { m: "PÂTES", s: 2, d: "Produit sec qui porte une date « de préférence avant ».", e: "Elles portent une DDM : après la date, on peut encore les manger si le paquet est fermé." },
    { m: "RIZ", s: 2, d: "Produit sec : sa date dépassée, il peut encore être mangé si le paquet est fermé.", e: "Il porte une DDM, une date indicative." },
    { m: "CONSERVE", s: 2, d: "Produit en boîte qui porte une date « de préférence avant ».", e: "Elle porte une DDM. Sa boîte en métal va dans le bac de tri." },
    { m: "NUTRI-SCORE", s: 2, d: "Note facultative de A à E, calculée pour 100 g ou 100 mL, sur la qualité d'un produit.", e: "Elle juge la qualité nutritionnelle. A est la meilleure note.", x: "Dans la situation : le produit B a A, le produit A a D." },
    { m: "PRIX AU KILO", s: 2, d: "Calcul : ce que coûte le produit divisé par sa quantité en kilogrammes.", e: "Il permet de comparer deux produits de quantités différentes.", x: "Dans la situation : 4,70 € pour le produit A, 4,20 € pour le produit B." },

    { m: "SAISON", s: 3, d: "Période de l'année où un fruit ou un légume pousse naturellement.", e: "Une tomate produite hors de cette période génère 7 fois plus de gaz à effet de serre." },
    { m: "CAROTTE", s: 3, d: "Légume orange cité parmi les légumes de saison en septembre.", e: "Acheter des légumes de saison pèse moins sur l'environnement." },
    { m: "POIREAU", s: 3, d: "Légume cité parmi les légumes de saison en septembre.", e: "Avec la carotte et la courgette, il fait partie des légumes de septembre." },
    { m: "COURGETTE", s: 3, d: "Légume vert cité parmi les légumes de saison en septembre.", e: "C'est un légume de saison en septembre, comme la tomate." },
    { m: "TOMATE", s: 3, d: "Légume de saison entre juin et septembre ; hors saison, elle pollue 7 fois plus.", e: "En décembre, elle génère 7 fois plus de gaz à effet de serre." },
    { m: "GAZ À EFFET DE SERRE", s: 3, d: "Rejets qui pèsent sur l'environnement : une tomate hors saison en produit 7 fois plus.", e: "Manger de saison permet d'en produire moins." },
    { m: "AGRICULTURE BIOLOGIQUE", s: 3, d: "Mode de production sans OGM, avec très peu de produits chimiques (logos AB et Eurofeuille).", e: "C'est un signe officiel, contrôlé par les pouvoirs publics." },
    { m: "LABEL ROUGE", s: 3, d: "Signe officiel d'une qualité supérieure aux produits semblables.", e: "Il est contrôlé par les pouvoirs publics, contrairement à une marque." },
    { m: "AOP", s: 3, d: "Signe officiel : toutes les étapes de production dans la même zone géographique.", e: "À ne pas confondre avec l'IGP, où une seule étape suffit." },
    { m: "IGP", s: 3, d: "Signe officiel : au moins une étape de production dans la zone géographique.", e: "Pour l'AOP, toutes les étapes doivent avoir lieu dans la même zone." },
    { m: "MARQUE", s: 3, d: "Elle appartient à une entreprise et ne garantit ni l'origine ni le mode de production.", e: "Les signes officiels, eux, sont contrôlés par les pouvoirs publics." },
    { m: "COMMERCE ÉQUITABLE", s: 3, d: "Façon de vendre qui veille à mieux payer les producteurs.", e: "Il concerne le café, le thé, le chocolat, la banane, et depuis 2014 des filières françaises." },
    { m: "EMBALLAGE", s: 3, d: "Ce qui entoure le produit ; tous se trient, le verre à part.", e: "Plastique, métal, carton et bois vont dans le bac de tri." },
    { m: "VERRE", s: 3, d: "Matière d'emballage qui va dans un conteneur à part, pas dans le bac de tri.", e: "Une bouteille de ce type se dépose dans le conteneur dédié." },
    { m: "VRAC", s: 3, d: "Achat de produits sans emballage, pour réduire les déchets.", e: "Acheter ainsi réduit les emballages dès les courses." },
    { m: "RÉUTILISABLE", s: 3, d: "Se dit d'un sac que l'on garde pour plusieurs courses.", e: "Prendre ce type de sac réduit les emballages, comme l'achat en vrac." }
  ]
};
