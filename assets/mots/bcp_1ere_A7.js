/* Mots du module A7 Bac Pro (Première) — Les pratiques alimentaires.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Les pratiques alimentaires v3.1 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Victor */
window.MOTS = {
  module: "A7", classe: "1re Bac Pro", titre: "Les pratiques alimentaires", retour: "bcp_1ere_A7_jeux.html", cle: "BP1A7",
  seances: { 1: "La digestion des aliments", 2: "Les pratiques alimentaires et leurs enjeux", 3: "L'étiquette alimentaire", 4: "Choix alimentaire et ultra-transformés" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Des organes de l'appareil digestif", m: ["ESTOMAC", "INTESTIN GRÊLE", "PANCRÉAS", "FOIE"] },
    { l: "Les constituants alimentaires transformés par la digestion", m: ["GLUCIDES", "PROTIDES", "LIPIDES"] },
    { l: "Les pratiques alimentaires", m: ["OMNIVORE", "FLEXITARIENNE", "VÉGÉTARIENNE", "VÉGÉTALIENNE"] },
    { l: "Ce que favorisent les excès alimentaires", m: ["SURPOIDS", "OBÉSITÉ", "DIABÈTE", "HYPERTENSION"] },
    { l: "Ce que porte obligatoirement l'étiquette", m: ["DÉNOMINATION", "INGRÉDIENTS", "ALLERGÈNES", "DLC", "DDM", "VALEUR ÉNERGÉTIQUE", "PROVENANCE"] },
    { l: "Ce que mesure le score environnemental", m: ["CLIMAT", "BIODIVERSITÉ", "POLLUTION"] }
  ],
  liste: [
    { m: "DIGESTION", s: 1, d: "Transformation des aliments en nutriments.", e: "Elle associe une action mécanique (couper, broyer, mélanger) et une action chimique (les enzymes des sucs digestifs)." },
    { m: "NUTRIMENTS", s: 1, d: "Substances simples, issues de la digestion, que l'organisme peut absorber et que les cellules utilisent.", e: "Le glucose, les acides aminés, les acides gras et le glycérol en sont des exemples." },
    { m: "ESTOMAC", s: 1, d: "Poche du tube digestif où les muscles de la paroi brassent les aliments.", e: "Le suc gastrique y commence la digestion des protides." },
    { m: "INTESTIN GRÊLE", s: 1, d: "Long tube replié où se termine la digestion et où les nutriments passent dans le sang.", e: "Le suc pancréatique et le suc intestinal y terminent la digestion des glucides, des protides et des lipides." },
    { m: "PANCRÉAS", s: 1, d: "Glande digestive placée sous l'estomac, que les aliments ne traversent pas.", e: "Son suc agit dans l'intestin grêle et termine la digestion des glucides, des protides et des lipides." },
    { m: "FOIE", s: 1, d: "Glande digestive qui fabrique la bile.", e: "La bile facilite la digestion des lipides. Les aliments ne traversent pas cet organe." },
    { m: "MASTICATION", s: 1, d: "Action des dents qui coupent et broient les aliments dans la bouche.", e: "C'est une action mécanique, et non chimique. Mâcher peu réduit le broyage et le mélange avec la salive.", x: "Victor mange vite et mâche peu." },
    { m: "SALIVE", s: 1, d: "Suc digestif de la bouche qui commence la digestion de l'amidon.", e: "Dans l'expérience, le tube qui en contient reste jaune-brun avec l'eau iodée : l'amidon a disparu." },
    { m: "ENZYMES", s: 1, d: "Substances des sucs digestifs qui découpent les grosses molécules des aliments en petites molécules.", e: "Elles réalisent l'action chimique de la digestion ; la salive en contient une qui digère l'amidon." },
    { m: "AMIDON", s: 1, d: "Glucide du pain, des pâtes ou du riz ; l'eau iodée le révèle en bleu-noir.", e: "Sa digestion commence dans la bouche grâce à la salive et se termine en glucose dans l'intestin grêle.", x: "Le pain du sandwich de Victor en apporte." },
    { m: "GLUCIDES", s: 1, d: "Constituants apportés par le pain, les pâtes, le riz, les fruits : amidon et sucres.", e: "Après la digestion, ils donnent du glucose." },
    { m: "PROTIDES", s: 1, d: "Constituants apportés par la viande, le poisson, les œufs, le lait, les légumes secs.", e: "Ce sont les protéines. Après la digestion, ils donnent des acides aminés.", x: "Le jambon du sandwich de Victor en apporte." },
    { m: "LIPIDES", s: 1, d: "Constituants apportés par le beurre, l'huile, le fromage : les graisses.", e: "Après la digestion, ils donnent des acides gras et du glycérol ; la bile facilite leur digestion.", x: "Le beurre du sandwich de Victor en apporte." },
    { m: "GLUCOSE", s: 1, d: "Nutriment obtenu après la digestion des glucides.", e: "Il traverse les villosités intestinales, passe dans le sang et rejoint les cellules." },
    { m: "VILLOSITÉS", s: 1, d: "Replis en forme de doigts de la paroi interne de l'intestin grêle, à la paroi très fine.", e: "Les nutriments les traversent pour passer dans le sang ou la lymphe." },
    { m: "ABSORPTION INTESTINALE", s: 1, d: "Passage des nutriments de l'intestin grêle vers le sang ou la lymphe.", e: "Elle se fait à travers la paroi des villosités ; le sang transporte ensuite les nutriments jusqu'aux cellules." },

    { m: "OMNIVORE", s: 2, d: "Se dit d'une personne qui consomme des aliments d'origine animale et d'origine végétale.", e: "Elle n'exclut aucune catégorie d'aliments, contrairement aux personnes végétariennes ou végétaliennes." },
    { m: "FLEXITARIENNE", s: 2, d: "Pratique qui n'exclut aucun aliment, mais avec plus de protéines végétales et moins de viande et de poisson.", e: "Elle réduit la viande sans la supprimer.", x: "Nadia, 23 ans, ne prend de la viande que deux fois par semaine." },
    { m: "VÉGÉTARIENNE", s: 2, d: "Pratique qui exclut la chair animale mais conserve les œufs et les produits laitiers.", e: "Viande, poisson et fruits de mer sont exclus.", x: "Lina, 24 ans, ne mange plus de viande ni de poisson depuis deux ans." },
    { m: "VÉGÉTALIENNE", s: 2, d: "Pratique qui exclut tous les aliments d'origine animale : chair, œufs, produits laitiers, miel.", e: "Elle demande de la vigilance : la vitamine B12 doit être prise en complément." },
    { m: "GLUTEN", s: 2, d: "Substance présente dans le blé, le seigle ou l'orge, que certaines personnes doivent exclure.", e: "Une personne intolérante supprime tous les aliments qui en contiennent : pain, pâtes, pizzas, gâteaux.", x: "Hugo, 26 ans, vérifie chaque étiquette." },
    { m: "PRATIQUE CHOISIE", s: 2, d: "Manière de s'alimenter adoptée volontairement : convictions, environnement, goût, santé.", e: "Elle s'oppose à la pratique imposée par une maladie, un manque d'argent ou des contraintes du travail.", x: "Lina refuse que des animaux soient tués pour la nourrir." },
    { m: "PRATIQUE SUBIE", s: 2, d: "Manière de s'alimenter imposée : maladie, allergie, intolérance, manque d'argent, contraintes du travail.", e: "Elle ne relève pas d'un choix de la personne.", x: "Victor déjeune en un quart d'heure dans sa voiture, faute de lieu pour manger." },
    { m: "CARENCE", s: 2, d: "Manque durable d'un nutriment, qui provoque des troubles.", e: "Exemples : anémie par manque de fer ou de vitamine B12, déminéralisation des os par manque de calcium." },
    { m: "ANÉMIE", s: 2, d: "Trouble dû à un manque de fer ou de vitamine B12.", e: "C'est un exemple de carence : un apport insuffisant et durable d'un nutriment." },
    { m: "EXCÈS ALIMENTAIRE", s: 2, d: "Apport trop important d'énergie, de sucres, de graisses ou de sel.", e: "L'abus d'aliments gras et sucrés favorise le surpoids, l'obésité, le diabète de type 2 et les maladies cardiovasculaires.", x: "Chips, soda et barres chocolatées chaque jour : Victor a pris quatre kilos." },
    { m: "SURPOIDS", s: 2, d: "Poids trop élevé, favorisé par l'abus d'aliments gras et sucrés.", e: "C'est une conséquence des excès alimentaires, à ne pas confondre avec une carence.", x: "Victor a pris quatre kilos en trois mois." },
    { m: "OBÉSITÉ", s: 2, d: "État favorisé, comme le surpoids, par l'abus d'aliments gras et sucrés.", e: "Avec le surpoids, le diabète de type 2 et les maladies cardiovasculaires, elle fait partie des effets des excès alimentaires." },
    { m: "DIABÈTE", s: 2, d: "Maladie « de type 2 » favorisée par l'abus d'aliments gras et sucrés.", e: "Comme l'obésité et les maladies cardiovasculaires, il est favorisé par les excès alimentaires." },
    { m: "HYPERTENSION", s: 2, d: "Pression artérielle trop élevée, dont l'excès de sel est la principale cause.", e: "Un adulte ne devrait pas dépasser 5 g de sel par jour ; environ 80 % du sel est déjà présent dans les aliments." },
    { m: "GAZ À EFFET DE SERRE", s: 2, d: "Émissions dues à la production, la transformation et le transport des aliments, qui changent le climat.", e: "Un repas avec du bœuf en émet environ six fois plus qu'un repas végétarien.", x: "Nadia cuisine des légumes secs, meilleurs pour la planète." },

    { m: "PRÉEMBALLÉ", s: 3, d: "Se dit d'un produit vendu déjà conditionné, comme un plat en barquette, qui porte une étiquette obligatoire.", e: "Son étiquette indique notamment la dénomination, les ingrédients, les allergènes, une date et la déclaration nutritionnelle." },
    { m: "DÉNOMINATION", s: 3, d: "Nom qui dit ce qu'est le produit, obligatoire sur l'étiquette.", e: "Exemple : « lasagnes à la bolognaise ». C'est la première information à lire." },
    { m: "INGRÉDIENTS", s: 3, d: "Éléments qui composent un produit, rangés du plus important au moins important en poids.", e: "Le premier de la liste est donc présent en plus grande quantité. Les additifs en font partie." },
    { m: "ALLERGÈNES", s: 3, d: "Substances qui déclenchent ou favorisent une allergie ou une intolérance, mises en relief sur l'étiquette.", e: "Quatorze doivent être signalés, dont les céréales contenant du gluten, le lait, les œufs, le céleri.", x: "Le blé du plat A interdit ce plat à Hugo." },
    { m: "ADDITIF", s: 3, d: "Substance ajoutée pour améliorer le goût, l'aspect ou la conservation d'un aliment, souvent notée E suivi d'un nombre.", e: "Son effet à long terme sur la santé est encore mal connu : par précaution, mieux vaut choisir les produits qui en contiennent le moins." },
    { m: "DLC", s: 3, d: "Date limite de consommation : « à consommer jusqu'au… », pour les produits périssables.", e: "Elle concerne par exemple un plat cuisiné frais. À ne pas confondre avec la DDM." },
    { m: "DDM", s: 3, d: "Date de durabilité minimale : « à consommer de préférence avant… ».", e: "Elle concerne par exemple les gâteaux secs ou les conserves. À ne pas confondre avec la DLC." },
    { m: "VALEUR ÉNERGÉTIQUE", s: 3, d: "Énergie apportée par un aliment, en kJ et en kcal, le plus souvent pour 100 g.", e: "Pour une barquette de 300 g du plat A : 141 × 3 = 423 kcal." },
    { m: "KILOCALORIE", s: 3, d: "Unité d'énergie notée kcal, avec le kilojoule.", e: "L'étiquette donne la valeur énergétique dans les deux unités : 590 kJ, soit 141 kcal, pour 100 g du plat A." },
    { m: "KILOJOULE", s: 3, d: "Unité d'énergie notée kJ, indiquée sur l'étiquette avec la kilocalorie.", e: "Le plat B apporte 477 kJ, soit 114 kcal, pour 100 g : moins que le plat A." },
    { m: "PROVENANCE", s: 3, d: "Pays d'origine, obligatoire sur l'étiquette pour certains produits comme les viandes.", e: "Pour une viande, c'est le pays où l'animal a été élevé et abattu.", x: "Bœuf de Pologne dans le plat A, poulet de France dans le plat B." },
    { m: "ALIMENT ULTRA-TRANSFORMÉ", s: 3, d: "Produit qui a subi d'intenses procédés industriels, souvent avec additifs et ingrédients réservés à l'industrie.", e: "Exemples : sodas, nuggets, barres chocolatées. On y trouve amidon modifié, maltodextrine, huiles hydrogénées.", x: "Les lasagnes du plat A, avec amidon modifié et E 621." },

    { m: "NUTRI-SCORE", s: 4, d: "Logo facultatif, de A à E, qui compare la qualité de produits d'un même rayon ; A est la meilleure.", e: "Plus de 87 % des aliments ultra-transformés sont classés C, D ou E. Mais il ne dit pas si un aliment est ultra-transformé." },
    { m: "SCORE ENVIRONNEMENTAL", s: 4, d: "Note facultative, en points : plus elle est élevée, plus l'impact du produit sur la planète est important.", e: "Il tient compte de cinq étapes : ingrédients, transformation, emballages, distribution, consommation." },
    { m: "QUALITÉ ALIMENTAIRE", s: 4, d: "Ensemble réunissant valeur nutritionnelle, degré de transformation, impact sur la planète et adaptation aux besoins.", e: "Un seul critère ne suffit pas pour juger un aliment : il faut les croiser." },
    { m: "CRITÈRES DE CHOIX", s: 4, d: "Éléments à croiser : besoins et santé, qualité nutritionnelle, transformation, impact sur la planète, prix et temps.", e: "Les croiser permet un choix alimentaire raisonné.", x: "Victor peut emporter un repas préparé la veille plutôt qu'acheter en station-service." },
    { m: "CLIMAT", s: 4, d: "L'un des impacts mesurés par le score environnemental, touché par les gaz à effet de serre.", e: "La production, la transformation et le transport des aliments émettent des gaz qui contribuent à son changement." },
    { m: "BIODIVERSITÉ", s: 4, d: "Ensemble du vivant, l'un des impacts pris en compte par le score environnemental.", e: "Le score environnemental mesure aussi les effets sur le climat, la pollution de l'air et de l'eau et l'usage des ressources." },
    { m: "POLLUTION", s: 4, d: "Atteinte à l'air et à l'eau, comptée parmi les impacts du score environnemental.", e: "Avec le climat, la biodiversité et l'usage des ressources, elle forme l'impact environnemental d'un aliment." },
    { m: "EMBALLAGES", s: 4, d: "L'une des cinq étapes de la vie d'un produit prises en compte par le score environnemental.", e: "Les cinq étapes : ingrédients, transformation, emballages, distribution et consommation." },
    { m: "SAISON", s: 4, d: "Les produits frais de cette période de l'année sont conseillés pour cuisiner à la maison.", e: "Les produits de saison font partie des critères liés à l'impact environnemental." },
    { m: "PRÉCAUTION", s: 4, d: "Prudence qui conduit à limiter les aliments ultra-transformés, faute de connaître l'effet à long terme des additifs.", e: "Il est conseillé de limiter leur consommation et de cuisiner davantage avec des produits frais." },
    { m: "MODÉRATION", s: 4, d: "Façon de consommer une pâtisserie maison très sucrée et riche en beurre.", e: "Une pâtisserie faite à la maison n'est pas ultra-transformée, mais elle reste très sucrée : qualité nutritionnelle et transformation sont deux notions différentes." },
    { m: "FAIT MAISON", s: 4, d: "Se dit d'un repas préparé soi-même avec des aliments peu transformés.", e: "C'est l'un des arguments du déjeuner 2 : moins d'aliments ultra-transformés, pas de soda.", x: "Une salade de lentilles et de riz préparée la veille, emportée dans une boîte isotherme." }
  ]
};
