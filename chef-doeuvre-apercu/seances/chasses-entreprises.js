/* Exercices supplémentaires : mêmes identifiants des exercices précédents conservés. */
(function(){
var scenes=[
  {
    "id": "entrepot",
    "titre": "1 · Un entrepôt",
    "image": "img/chasses/entrepot.png",
    "alt": "Vue d’ensemble d’un entrepôt, avec rayonnages, préparation de commandes et circulation.",
    "zones": [
      {
        "id": "hauteur",
        "nom": "Le carton en hauteur",
        "x": 18,
        "y": 15,
        "w": 13,
        "h": 18,
        "indice": "Observer le haut du rayonnage, à gauche.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un câble électrique abîmé",
              "Un objet chaud",
              "Le carton en hauteur"
            ],
            "bonne": 2,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le carton en hauteur.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "Les chutes d’objets",
              "Les objets coupants"
            ],
            "bonne": 1,
            "explication": "Un objet placé en hauteur peut tomber sur une personne.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une fracture",
              "Une brûlure",
              "Une électrisation"
            ],
            "bonne": 0,
            "explication": "Le carton peut tomber du rayonnage et heurter une personne. Le choc peut provoquer une fracture. Le dommage possible est une atteinte à la santé : une fracture.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un carton penche au bord d’un rayonnage, au-dessus du passage."
      },
      {
        "id": "charge",
        "nom": "Le carton à porter",
        "x": 84,
        "y": 33,
        "w": 15,
        "h": 20,
        "indice": "Observer le salarié qui porte un carton, à droite.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Le carton à porter",
              "Une lame coupante",
              "Un câble électrique abîmé"
            ],
            "bonne": 0,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le carton à porter.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "Les objets coupants",
              "L’électricité",
              "La manutention de charges"
            ],
            "bonne": 2,
            "explication": "La personne soulève ou porte une charge. Ce travail demande un effort physique.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une brûlure",
              "Un mal de dos",
              "Une électrisation"
            ],
            "bonne": 1,
            "explication": "Porter un carton sollicite le dos, surtout si la charge est lourde. Le dommage possible est une atteinte à la santé : un mal de dos.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un salarié porte un carton devant lui, le dos penché."
      },
      {
        "id": "chariot",
        "nom": "Le chariot élévateur près du piéton",
        "x": 57,
        "y": 48,
        "w": 23,
        "h": 30,
        "indice": "Observer le véhicule et la piétonne au centre.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un câble électrique abîmé",
              "Le chariot élévateur près du piéton",
              "Une lame coupante"
            ],
            "bonne": 1,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le chariot élévateur près du piéton.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "La circulation d’engins",
              "Les objets coupants",
              "L’électricité"
            ],
            "bonne": 0,
            "explication": "Un véhicule se déplace près d’un piéton.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une brûlure",
              "Une électrisation",
              "Une fracture"
            ],
            "bonne": 2,
            "explication": "Un chariot en déplacement peut heurter un piéton. Le choc peut provoquer une fracture. Le dommage possible est une atteinte à la santé : une fracture.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un chariot élévateur circule à côté d’une piétonne."
      },
      {
        "id": "eau",
        "nom": "La flaque d’eau dans le passage",
        "x": 21,
        "y": 80,
        "w": 22,
        "h": 16,
        "indice": "Observer le sol dans l’allée, au premier plan.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "La flaque d’eau dans le passage",
              "Une lame coupante",
              "Un objet chaud"
            ],
            "bonne": 0,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la flaque d’eau dans le passage.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "Les objets coupants",
              "L’électricité",
              "Le sol et les obstacles"
            ],
            "bonne": 2,
            "explication": "L’état du sol ou un obstacle peut faire glisser ou trébucher.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une électrisation",
              "Une entorse",
              "Une brûlure"
            ],
            "bonne": 1,
            "explication": "L’eau au sol peut faire glisser. La chute peut provoquer une entorse. Le dommage possible est une atteinte à la santé : une entorse.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Une flaque d’eau s’étend dans une allée de circulation."
      },
      {
        "id": "cutter",
        "nom": "La lame du cutter",
        "x": 80,
        "y": 76,
        "w": 12,
        "h": 9,
        "indice": "Observer l’outil posé sur la table de préparation des colis, à droite.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "La lame du cutter",
              "Un câble électrique abîmé",
              "Un objet chaud"
            ],
            "bonne": 0,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la lame du cutter.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "La chaleur",
              "Les objets coupants"
            ],
            "bonne": 2,
            "explication": "L’objet possède une lame ou des dents coupantes.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Un mal de dos",
              "Une coupure",
              "Une électrisation"
            ],
            "bonne": 1,
            "explication": "La lame sortie du cutter peut couper la peau. Le dommage possible est une atteinte à la santé : une coupure.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un cutter est posé sur la table de préparation. Sa lame est sortie."
      }
    ]
  },
  {
    "id": "atelier",
    "titre": "2 · Un atelier de maintenance",
    "image": "img/chasses/atelier.png",
    "alt": "Vue d’ensemble d’un atelier de maintenance automobile, avec plusieurs postes de travail.",
    "zones": [
      {
        "id": "cable",
        "nom": "Le câble électrique abîmé",
        "x": 7,
        "y": 34,
        "w": 7,
        "h": 18,
        "indice": "Observer le câble près de l’établi, à gauche.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un objet chaud",
              "Le câble électrique abîmé",
              "Une lame coupante"
            ],
            "bonne": 1,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le câble électrique abîmé.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "Les objets coupants",
              "La chaleur"
            ],
            "bonne": 0,
            "explication": "Le câble est relié à un appareil électrique. Son isolation est abîmée.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une coupure",
              "Un mal de dos",
              "Une électrisation"
            ],
            "bonne": 2,
            "explication": "Le câble abîmé peut mettre une personne en contact avec le courant électrique. Le dommage possible est une atteinte à la santé : une électrisation.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "La gaine du câble électrique près de l’établi est déchirée."
      },
      {
        "id": "chaud",
        "nom": "La pièce métallique chaude",
        "x": 83,
        "y": 39,
        "w": 14,
        "h": 13,
        "indice": "Observer la pièce sur la table de travail, à droite.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un câble électrique abîmé",
              "Une charge lourde",
              "La pièce métallique chaude"
            ],
            "bonne": 2,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la pièce métallique chaude.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "La chaleur",
              "Les objets coupants"
            ],
            "bonne": 1,
            "explication": "Le travail se déroule près d’un objet très chaud.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une brûlure",
              "Une entorse",
              "Un mal de dos"
            ],
            "bonne": 0,
            "explication": "Une pièce métallique chaude peut brûler la peau au contact. Le dommage possible est une atteinte à la santé : une brûlure.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Une pièce métallique rougit sur une table de travail. Une salariée travaille à proximité."
      },
      {
        "id": "roue",
        "nom": "La roue à soulever",
        "x": 47,
        "y": 66,
        "w": 15,
        "h": 25,
        "indice": "Observer le mécanicien qui soulève une roue.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un câble électrique abîmé",
              "La roue à soulever",
              "Une lame coupante"
            ],
            "bonne": 1,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la roue à soulever.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "La manutention de charges",
              "Les objets coupants",
              "L’électricité"
            ],
            "bonne": 0,
            "explication": "La personne soulève ou porte une charge. Ce travail demande un effort physique.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une électrisation",
              "Une brûlure",
              "Un mal de dos"
            ],
            "bonne": 2,
            "explication": "Soulever une roue sollicite le dos, surtout si elle est lourde. Une douleur peut apparaître. Le dommage possible est une atteinte à la santé : un mal de dos.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un mécanicien soulève une roue de voiture posée au sol."
      },
      {
        "id": "huile",
        "nom": "La flaque d’huile au sol",
        "x": 26,
        "y": 85,
        "w": 19,
        "h": 16,
        "indice": "Observer le passage au premier plan, à gauche.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Une lame coupante",
              "Un objet chaud",
              "La flaque d’huile au sol"
            ],
            "bonne": 2,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la flaque d’huile au sol.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "Le sol et les obstacles",
              "Les objets coupants"
            ],
            "bonne": 1,
            "explication": "L’état du sol ou un obstacle peut faire glisser ou trébucher.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une entorse",
              "Une brûlure",
              "Une électrisation"
            ],
            "bonne": 0,
            "explication": "Un sol gras peut faire glisser. Une chute peut provoquer une entorse. Le dommage possible est une atteinte à la santé : une entorse.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Une flaque d’huile se trouve sur le passage d’une salariée."
      },
      {
        "id": "scie",
        "nom": "La lame de la scie",
        "x": 84,
        "y": 89,
        "w": 20,
        "h": 10,
        "indice": "Observer l’outil posé sur l’établi au premier plan, à droite.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "La lame de la scie",
              "Un câble électrique abîmé",
              "Un objet chaud"
            ],
            "bonne": 0,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la lame de la scie.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "La chaleur",
              "Les objets coupants"
            ],
            "bonne": 2,
            "explication": "L’objet possède une lame ou des dents coupantes.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Un mal de dos",
              "Une coupure",
              "Une électrisation"
            ],
            "bonne": 1,
            "explication": "Les dents de la scie peuvent couper la peau. Le dommage possible est une atteinte à la santé : une coupure.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Une scie est posée sur un établi. Ses dents sont proches de la main d’un mécanicien."
      }
    ]
  },
  {
    "id": "magasin",
    "titre": "3 · Un magasin",
    "image": "img/chasses/magasin.png",
    "alt": "Vue d’ensemble d’un magasin, de ses rayons, de sa réserve et de son espace de déballage.",
    "zones": [
      {
        "id": "hauteur",
        "nom": "Le carton en hauteur",
        "x": 19,
        "y": 12,
        "w": 13,
        "h": 18,
        "indice": "Observer les cartons au-dessus des rayonnages, à gauche.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un câble électrique abîmé",
              "Un objet chaud",
              "Le carton en hauteur"
            ],
            "bonne": 2,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le carton en hauteur.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "Les chutes d’objets",
              "Les objets coupants"
            ],
            "bonne": 1,
            "explication": "Un objet placé en hauteur peut tomber sur une personne.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une fracture",
              "Une brûlure",
              "Une électrisation"
            ],
            "bonne": 0,
            "explication": "Un carton en hauteur peut tomber et heurter une personne. Le choc peut provoquer une fracture. Le dommage possible est une atteinte à la santé : une fracture.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un carton est placé en haut d’un rayonnage, au-dessus de l’espace de vente."
      },
      {
        "id": "charge",
        "nom": "Le carton à soulever",
        "x": 79,
        "y": 28,
        "w": 18,
        "h": 25,
        "indice": "Observer la personne dans la réserve, en haut à droite.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Le carton à soulever",
              "Une lame coupante",
              "Un câble électrique abîmé"
            ],
            "bonne": 0,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le carton à soulever.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "Les objets coupants",
              "L’électricité",
              "La manutention de charges"
            ],
            "bonne": 2,
            "explication": "La personne soulève ou porte une charge. Ce travail demande un effort physique.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une brûlure",
              "Un mal de dos",
              "Une électrisation"
            ],
            "bonne": 1,
            "explication": "Soulever un carton sollicite le dos, surtout si la charge est lourde. Le dommage possible est une atteinte à la santé : un mal de dos.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un salarié se penche pour soulever un carton dans la réserve."
      },
      {
        "id": "obstacle",
        "nom": "Le câble dans le passage",
        "x": 58,
        "y": 46,
        "w": 32,
        "h": 13,
        "indice": "Observer le passage entre la vendeuse et la réserve.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un objet chaud",
              "Le câble dans le passage",
              "Une lame coupante"
            ],
            "bonne": 1,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le câble dans le passage.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "Le sol et les obstacles",
              "Les objets coupants",
              "L’électricité"
            ],
            "bonne": 0,
            "explication": "L’état du sol ou un obstacle peut faire glisser ou trébucher.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une brûlure",
              "Une électrisation",
              "Une entorse"
            ],
            "bonne": 2,
            "explication": "Un câble au sol peut faire trébucher. La chute peut provoquer une entorse. Le dommage possible est une atteinte à la santé : une entorse.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un câble traverse le passage entre une salariée et la réserve."
      },
      {
        "id": "eau",
        "nom": "La flaque d’eau au sol",
        "x": 27,
        "y": 67,
        "w": 17,
        "h": 15,
        "indice": "Observer le sol près de l’entrée, à gauche.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "La flaque d’eau au sol",
              "Une lame coupante",
              "Un objet chaud"
            ],
            "bonne": 0,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la flaque d’eau au sol.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "Les objets coupants",
              "L’électricité",
              "Le sol et les obstacles"
            ],
            "bonne": 2,
            "explication": "L’état du sol ou un obstacle peut faire glisser ou trébucher.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une électrisation",
              "Une entorse",
              "Une brûlure"
            ],
            "bonne": 1,
            "explication": "Un sol mouillé peut faire glisser. Une chute peut provoquer une entorse. Le dommage possible est une atteinte à la santé : une entorse.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Une flaque d’eau se trouve sur le chemin d’un salarié, près de l’entrée."
      },
      {
        "id": "cutter",
        "nom": "La lame du cutter",
        "x": 91,
        "y": 61,
        "w": 10,
        "h": 9,
        "indice": "Observer l’outil jaune sur la table de déballage, à droite.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "La lame du cutter",
              "Un câble électrique abîmé",
              "Un objet chaud"
            ],
            "bonne": 0,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la lame du cutter.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "La chaleur",
              "Les objets coupants"
            ],
            "bonne": 2,
            "explication": "L’objet possède une lame ou des dents coupantes.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Un mal de dos",
              "Une coupure",
              "Une électrisation"
            ],
            "bonne": 1,
            "explication": "La lame du cutter peut couper la peau lors du déballage. Le dommage possible est une atteinte à la santé : une coupure.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un cutter avec sa lame sortie est posé sur la table de déballage."
      }
    ]
  },
  {
    "id": "cuisine",
    "titre": "4 · Une cuisine professionnelle",
    "image": "img/chasses/cuisine.png",
    "alt": "Vue d’ensemble d’une cuisine professionnelle, avec stockage, préparation, cuisson et plonge.",
    "zones": [
      {
        "id": "sac",
        "nom": "Le sac de farine à soulever",
        "x": 17,
        "y": 37,
        "w": 15,
        "h": 22,
        "indice": "Observer la réserve de farine, en haut à gauche.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un câble électrique abîmé",
              "Le sac de farine à soulever",
              "Une lame coupante"
            ],
            "bonne": 1,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le sac de farine à soulever.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "La manutention de charges",
              "Les objets coupants",
              "L’électricité"
            ],
            "bonne": 0,
            "explication": "La personne soulève ou porte une charge. Ce travail demande un effort physique.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une électrisation",
              "Une brûlure",
              "Un mal de dos"
            ],
            "bonne": 2,
            "explication": "Soulever un sac sollicite le dos, surtout si la charge est lourde. Une douleur peut apparaître. Le dommage possible est une atteinte à la santé : un mal de dos.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un cuisinier se penche pour soulever un sac de farine."
      },
      {
        "id": "four",
        "nom": "La plaque du four chaud",
        "x": 81,
        "y": 25,
        "w": 15,
        "h": 18,
        "indice": "Observer le cuisinier devant le four, en haut à droite.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "La plaque du four chaud",
              "Un câble électrique abîmé",
              "Une charge lourde"
            ],
            "bonne": 0,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la plaque du four chaud.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "Les objets coupants",
              "L’électricité",
              "La chaleur"
            ],
            "bonne": 2,
            "explication": "Le travail se déroule près d’un objet très chaud.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Un mal de dos",
              "Une brûlure",
              "Une entorse"
            ],
            "bonne": 1,
            "explication": "Une plaque chaude peut brûler les mains au contact. Le dommage possible est une atteinte à la santé : une brûlure.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Un cuisinier sort une plaque d’un four allumé, les mains nues."
      },
      {
        "id": "couteau",
        "nom": "La lame du couteau",
        "x": 48,
        "y": 50,
        "w": 12,
        "h": 14,
        "indice": "Observer la préparation des légumes, au centre.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un objet chaud",
              "La lame du couteau",
              "Un câble électrique abîmé"
            ],
            "bonne": 1,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : la lame du couteau.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "Les objets coupants",
              "L’électricité",
              "La chaleur"
            ],
            "bonne": 0,
            "explication": "L’objet possède une lame ou des dents coupantes.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une électrisation",
              "Un mal de dos",
              "Une coupure"
            ],
            "bonne": 2,
            "explication": "La lame du couteau peut couper les doigts pendant la préparation. Le dommage possible est une atteinte à la santé : une coupure.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Une cuisinière découpe des légumes avec un couteau."
      },
      {
        "id": "sol",
        "nom": "Le sol mouillé de la plonge",
        "x": 13,
        "y": 86,
        "w": 22,
        "h": 24,
        "indice": "Observer le sol près du lave-vaisselle, à gauche.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Une lame coupante",
              "Un objet chaud",
              "Le sol mouillé de la plonge"
            ],
            "bonne": 2,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le sol mouillé de la plonge.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "Le sol et les obstacles",
              "Les objets coupants"
            ],
            "bonne": 1,
            "explication": "L’état du sol ou un obstacle peut faire glisser ou trébucher.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une entorse",
              "Une brûlure",
              "Une électrisation"
            ],
            "bonne": 0,
            "explication": "L’eau au sol peut faire glisser. Une chute peut provoquer une entorse. Le dommage possible est une atteinte à la santé : une entorse.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "Le sol est mouillé près du lave-vaisselle. Une salariée passe à côté."
      },
      {
        "id": "cable",
        "nom": "Le câble électrique abîmé",
        "x": 95,
        "y": 72,
        "w": 8,
        "h": 10,
        "indice": "Observer le câble du batteur, en bas à droite.",
        "questions": [
          {
            "consigne": "Nommer le danger entouré.",
            "choix": [
              "Un objet chaud",
              "Le câble électrique abîmé",
              "Une lame coupante"
            ],
            "bonne": 1,
            "explication": "Le danger est ce qui peut causer un dommage. Ici : le câble électrique abîmé.",
            "aide": "Observer l’objet ou l’état du sol dans la zone entourée."
          },
          {
            "consigne": "Choisir le type de danger.",
            "choix": [
              "L’électricité",
              "Les objets coupants",
              "La chaleur"
            ],
            "bonne": 0,
            "explication": "Le câble est relié à un appareil électrique. Son isolation est abîmée.",
            "aide": "Rechercher ce qui peut agir sur la personne : une lame, la chaleur, l’électricité, une charge ou un déplacement."
          },
          {
            "consigne": "Choisir un dommage possible.",
            "choix": [
              "Une coupure",
              "Un mal de dos",
              "Une électrisation"
            ],
            "bonne": 2,
            "explication": "Un câble abîmé peut mettre une personne en contact avec le courant électrique. Le dommage possible est une atteinte à la santé : une électrisation.",
            "aide": "Choisir une blessure ou une atteinte à la santé pouvant résulter de ce danger."
          }
        ],
        "description": "La gaine du câble qui alimente le batteur est abîmée. Une salariée travaille près du batteur."
      }
    ]
  }
];
var s=window.CDO_SEANCES.filter(function(s){return s.id==="s1";})[0];
if(s)scenes.forEach(function(b){b.type="chasseGuide";s.exercices.push(b);});
window.CDO_CHASSES=scenes;
})();
