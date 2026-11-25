const PILOTS = {
  "emotions": {
    "title": "Nommer les émotions",
    "theme": "emo",
    "image": "lina-agacement",
    "objective": "Reconnaître et nommer différentes émotions.",
    "ref": "E1.1 et E1.2 — Tome I, 2025, notamment p. 139–142.",
    "teacher": "L’association de vocabulaire est un entraînement préparatoire : elle ne démontre pas à elle seule la perception de son vécu émotionnel. Les familles proposées sont des repères pédagogiques. Un visage ne prouve pas une émotion.",
    "transfer": "À deux, choisir une situation inventée à l’école ou dans la vie quotidienne. Chacun nomme une émotion possible, puis explique ce qui pourrait la déclencher. Il est possible de passer.",
    "steps": [
      {
        "kind": "choice",
        "tag": "J’observe",
        "image": "lina-agacement",
        "text": "Lina : « Mon crayon casse encore. Ça m’agace ! »",
        "q": "Identifier la famille du mot « agacée » en sélectionnant une réponse.",
        "options": [
          "Colère",
          "Peur",
          "Joie"
        ],
        "correct": 0,
        "hint": "Lina décrit un petit énervement.",
        "ex": "Agacée est un mot de la famille de la colère. Cela ne veut pas dire être furieuse.",
        "condition": "À partir des paroles de Lina :"
      },
      {
        "kind": "families",
        "tag": "Je classe",
        "q": "Associer chaque mot à sa famille d’émotions en sélectionnant la famille correspondante.",
        "pairs": [
          [
            "agacé",
            "Colère"
          ],
          [
            "irrité",
            "Colère"
          ],
          [
            "contrarié",
            "Colère"
          ],
          [
            "inquiet",
            "Peur"
          ],
          [
            "soulagé",
            "Joie"
          ],
          [
            "déçu",
            "Tristesse"
          ],
          [
            "étonné",
            "Surprise"
          ],
          [
            "écœuré",
            "Dégoût"
          ]
        ],
        "families": [
          "Colère",
          "Peur",
          "Joie",
          "Tristesse",
          "Surprise",
          "Dégoût"
        ],
        "hint": "Agacé, irrité et contrarié : colère. Inquiet : peur. Soulagé : joie. Déçu : tristesse. Étonné : surprise. Écœuré : dégoût.",
        "condition": "À partir des mots affichés :"
      },
      {
        "kind": "multi",
        "tag": "Je repère",
        "image": "lina-agacement",
        "q": "Repérer deux indices visibles en sélectionnant deux propositions.",
        "options": [
          "La pointe du crayon est cassée.",
          "Ses sourcils sont rapprochés.",
          "Elle rit aux éclats."
        ],
        "correct": [
          0,
          1
        ],
        "hint": "Regarde le crayon et le visage.",
        "ex": "Ces indices peuvent aider. Pour connaître son émotion, on vérifie aussi ce que Lina dit.",
        "condition": "À partir de l’illustration :"
      },
      {
        "kind": "phrase",
        "tag": "Je formule",
        "image": "lina-agacement",
        "q": "Nommer une émotion possible de Lina en complétant la phrase.",
        "prefix": "Lina pourrait se sentir",
        "words": [
          "agacée",
          "irritée",
          "contrariée"
        ],
        "hint": "Tu peux choisir un mot ou écrire ta proposition.",
        "ex": "Tu proposes une hypothèse, pas une certitude. Tu peux demander à Lina comment elle se sent.",
        "condition": "À partir de l’illustration :"
      },
      {
        "kind": "choice",
        "tag": "Une autre situation",
        "image": "julie-ecoute-lina",
        "text": "Lina dit : « Je suis déçue de mon résultat. »",
        "q": "Identifier la famille du mot « déçue » en sélectionnant une réponse.",
        "options": [
          "Joie",
          "Tristesse",
          "Colère"
        ],
        "correct": 1,
        "hint": "Lina espérait un autre résultat.",
        "ex": "Dans ce repère de vocabulaire, déçue appartient à la famille de la tristesse.",
        "condition": "À partir des paroles de Lina :"
      },
      {
        "kind": "phrase",
        "tag": "Dans les transports",
        "image": "lina-bus",
        "text": "Lina vient de manquer le bus pour retrouver une amie. Elle baisse les épaules.",
        "condition": "À partir de la situation de Lina :",
        "q": "Nommer une émotion possible de Lina en écrivant un mot.",
        "prefix": "Lina pourrait se sentir",
        "words": [
          "déçue",
          "agacée",
          "inquiète"
        ],
        "hint": "Plusieurs ressentis sont possibles : elle peut être déçue, agacée ou inquiète.",
        "ex": "La même situation peut provoquer différentes émotions. Les indices orientent une hypothèse ; Lina peut préciser son ressenti."
      },
      {
        "kind": "choice",
        "tag": "Entre amis",
        "image": "amis-parc",
        "text": "Au parc, Julie dit : « Mon amie vient me voir ce week-end. Je suis ravie ! »",
        "condition": "À partir des paroles de Julie :",
        "q": "Identifier la famille du mot « ravie » en sélectionnant une réponse.",
        "options": [
          "Joie",
          "Surprise",
          "Peur"
        ],
        "correct": 0,
        "hint": "Julie exprime un grand plaisir.",
        "ex": "Ravie est une nuance de la joie. Une visite pourrait aussi susciter d’autres émotions selon la situation."
      },
      {
        "kind": "phrase",
        "tag": "À mon tour",
        "text": "Imagine un rendez-vous annulé au dernier moment. Il peut s’agir d’une situation inventée.",
        "condition": "À partir de la situation proposée :",
        "q": "Nommer une émotion possible en complétant la phrase.",
        "prefix": "Dans cette situation, je pourrais me sentir",
        "words": [
          "déçu ou déçue",
          "soulagé ou soulagée",
          "agacé ou agacée",
          "triste"
        ],
        "hint": "Ta réponse peut être différente de celle d’un camarade. Tu peux aussi passer.",
        "ex": "Il n’y a pas de bonne réponse personnelle. Le but est de choisir un mot pour nommer un ressenti possible."
      }
    ]
  },
  "ecoute": {
    "title": "Écouter pour comprendre",
    "theme": "soc",
    "image": "julie-ecoute-lina",
    "objective": "Reformuler les propos d’une personne pour vérifier la compréhension de son ressenti.",
    "ref": "S1.2 — Tome I, 2025, p. 172–179 : reformulation empathique et vérification.",
    "teacher": "Lire un dialogue permet de préparer l’écoute sans dépendre de l’audio. La compétence relationnelle s’exerce ensuite dans un échange réel. Le regard direct n’est pas un critère obligatoire d’écoute.",
    "transfer": "À deux, inventer un échange entre amis, avec un proche ou au travail. Une personne exprime un ressenti ; l’autre reformule et vérifie. Inverser les rôles, avec le droit de passer.",
    "steps": [
      {
        "kind": "choice",
        "tag": "Je comprends",
        "image": "julie-ecoute-lina",
        "text": "Lina : « J’ai beaucoup travaillé. Je suis déçue de mon résultat. »",
        "q": "Choisir une reformulation des propos de Lina en sélectionnant une phrase.",
        "options": [
          "Tu es déçue malgré tes efforts, c’est bien ça ?",
          "Tu dois arrêter d’y penser.",
          "Moi, j’ai eu une bonne note."
        ],
        "correct": 0,
        "hint": "Reprends les mots importants de Lina, puis vérifie.",
        "ex": "Julie reprend les efforts et la déception. Lina peut confirmer ou corriger.",
        "condition": "À partir des paroles de Lina :"
      },
      {
        "kind": "order",
        "tag": "Je construis",
        "q": "Reconstituer la reformulation en sélectionnant les fragments dans l’ordre.",
        "parts": [
          "Si je comprends bien,",
          "tu es déçue",
          "malgré tes efforts.",
          "C’est bien ça ?"
        ],
        "hint": "Commence par vérifier ta compréhension, puis nomme le ressenti et termine par une question.",
        "ex": "Une reformulation reste une proposition : l’autre peut la corriger.",
        "condition": "Avec les fragments proposés :"
      },
      {
        "kind": "choice",
        "tag": "J’ajuste",
        "text": "Lina répond : « Pas vraiment. Je suis surtout inquiète pour la suite. »",
        "q": "Choisir une réponse adaptée à la précision de Lina en sélectionnant une phrase.",
        "options": [
          "Non, tu as forcément de la peine.",
          "D’accord, tu es surtout inquiète pour la suite, c’est ça ?",
          "Tu changes toujours d’avis."
        ],
        "correct": 1,
        "hint": "Lina connaît son ressenti. Accueille sa correction.",
        "ex": "Julie ajuste sa compréhension au lieu d’imposer une émotion.",
        "condition": "À partir de la précision de Lina :"
      },
      {
        "kind": "phrase",
        "tag": "À mon tour",
        "q": "Formuler une question ouverte pour Lina en écrivant dans la zone de réponse.",
        "words": [
          "Qu’est-ce qui t’inquiète pour la suite ?",
          "Veux-tu m’en dire un peu plus ?"
        ],
        "hint": "Une question ouverte invite à raconter. Tu peux utiliser une proposition puis la modifier.",
        "ex": "Ta question est une proposition à essayer. Elle n’est pas corrigée automatiquement : vérifie qu’elle laisse l’autre parler.",
        "condition": "À partir des paroles de Lina :",
        "text": "Lina : « Je suis surtout inquiète pour la suite. »"
      },
      {
        "kind": "choice",
        "tag": "Une autre situation",
        "text": "Noa : « Je suis content d’avoir terminé mon projet. »",
        "q": "Choisir une reformulation des propos de Noa en sélectionnant une phrase.",
        "options": [
          "Tu es content d’avoir terminé, c’est ça ?",
          "Tu as enfin fait un effort.",
          "Il ne faut pas se réjouir trop vite."
        ],
        "correct": 0,
        "hint": "Reprends son ressenti sans ajouter de jugement.",
        "ex": "La reformulation peut aussi accueillir une émotion agréable.",
        "condition": "À partir des paroles de Noa :"
      },
      {
        "kind": "choice",
        "tag": "Dans la vie quotidienne",
        "image": "amis-parc",
        "text": "Au parc, Lina dit : « Demain, j’ai un entretien pour un emploi. J’ai peur de ne pas savoir répondre. »",
        "condition": "À partir des paroles de Lina :",
        "q": "Choisir une reformulation des propos de Lina en sélectionnant une phrase.",
        "options": [
          "Tu crains de manquer de réponses pendant l’entretien, c’est bien ça ?",
          "Ce n’est pas la peine d’avoir peur.",
          "Moi, je réussirais facilement."
        ],
        "correct": 0,
        "hint": "Reprends sa crainte sans la minimiser.",
        "ex": "Reformuler aide à vérifier ce qu’on comprend. Cela ne consiste pas à décider à la place de l’autre."
      },
      {
        "kind": "phrase",
        "tag": "Avec un proche",
        "image": "amis-parc",
        "text": "Julie dit : « J’ai dû annuler une sortie parce que je suis fatiguée. J’aurais aimé voir mes amis. »",
        "condition": "À partir des paroles de Julie :",
        "q": "Reformuler le ressenti de Julie en écrivant une phrase.",
        "words": [
          "Tu es fatiguée et déçue de manquer la sortie, c’est bien ça ?",
          "Tu aurais aimé voir tes amis, mais tu as besoin de repos, c’est ça ?"
        ],
        "hint": "Reprends ce qui compte pour Julie, puis vérifie avec « c’est ça ? ».",
        "ex": "Cette reformulation est à vérifier avec Julie. Un ressenti ne se déduit pas avec certitude de l’image."
      },
      {
        "kind": "choice",
        "tag": "Vérifier sans imposer",
        "text": "Julie répond : « Oui, je suis déçue. Mais je suis aussi soulagée de pouvoir me reposer. »",
        "condition": "À partir de la précision de Julie :",
        "q": "Choisir une réponse qui accueille les deux ressentis en sélectionnant une phrase.",
        "options": [
          "Tu peux être déçue et soulagée à la fois, c’est ça ?",
          "Il faut choisir une seule émotion.",
          "Si tu es soulagée, tu ne peux pas être déçue."
        ],
        "correct": 0,
        "hint": "Deux émotions peuvent être présentes en même temps.",
        "ex": "L’écoute accueille les nuances et les précisions de l’autre. Elle n’impose pas une seule émotion."
      }
    ]
  },
  "decisions": {
    "title": "Choisir en réfléchissant",
    "theme": "cog",
    "image": "lina-avant-choix",
    "objective": "Prendre une décision en tenant compte du but poursuivi et des conséquences possibles.",
    "ref": "C1.3–C1.4 — Tome I, 2025, p. 49–58 ; prolongements C2.1 et C2.3 — Tome II, 2026, p. 23–30 et 50–55.",
    "teacher": "La décision est reliée aux buts, besoins et conséquences. Une préférence personnelle n’est pas notée. La réponse libre est un entraînement à discuter, pas une preuve automatiquement validée de maîtrise.",
    "transfer": "À deux, inventer une décision à l’école, au travail, entre amis ou à la maison. Comparer deux actions et leurs conséquences, puis chacun justifie son choix.",
    "steps": [
      {
        "kind": "choice",
        "tag": "Je repère mon but",
        "image": "lina-avant-choix",
        "text": "Lina veut préparer son oral pour demain. Elle reçoit des messages.",
        "q": "Identifier le but de Lina en sélectionnant une réponse.",
        "options": [
          "Préparer son oral.",
          "Répondre à tous les messages.",
          "Acheter un nouveau téléphone."
        ],
        "correct": 0,
        "hint": "Repère ce que Lina veut préparer.",
        "ex": "Identifier son but aide à comparer les actions possibles.",
        "condition": "À partir de la situation de Lina :"
      },
      {
        "kind": "compare",
        "tag": "Je compare",
        "image": "lina-avant-choix",
        "q": "Comparer les conséquences des deux actions en ouvrant chaque carte.",
        "cards": [
          {
            "label": "Réviser dix minutes, puis répondre.",
            "effect": "Elle avance dans sa préparation et répond un peu plus tard."
          },
          {
            "label": "Répondre maintenant, sans fixer de limite.",
            "effect": "Elle garde le contact, mais risque de manquer de temps pour préparer son oral."
          }
        ],
        "hint": "Pour chaque action, repère un avantage et une limite.",
        "condition": "À partir de la situation de Lina :",
        "text": "Lina veut préparer son oral pour demain. Elle reçoit des messages."
      },
      {
        "kind": "choice",
        "tag": "Je relie au but",
        "q": "Choisir une action adaptée au but de Lina en sélectionnant une réponse.",
        "options": [
          "Réviser dix minutes, puis répondre.",
          "Répondre maintenant, sans fixer de limite."
        ],
        "correct": 0,
        "hint": "Compare chaque action avec le but de Lina.",
        "ex": "Ce choix est adapté au but annoncé. Dans une autre situation, les priorités pourraient changer.",
        "condition": "À partir de la situation de Lina :",
        "text": "Lina veut préparer son oral pour demain. Elle reçoit des messages."
      },
      {
        "kind": "phrase",
        "tag": "J’explique mon choix",
        "q": "Justifier le choix d’une action pour Lina en écrivant une phrase.",
        "words": [
          "Je révise dix minutes, puis je réponds, parce que je veux avancer dans ma préparation.",
          "Je demande si le message est urgent, puis je décide."
        ],
        "hint": "Tu peux écrire : « Je choisis… parce que… ». Plusieurs propositions sont possibles.",
        "ex": "Ta proposition n’est pas notée. Vérifie qu’elle contient une action et une raison liée à ce qui compte pour Lina.",
        "condition": "À partir de la situation de Lina :",
        "text": "Lina veut préparer son oral pour demain. Elle reçoit des messages."
      },
      {
        "kind": "choice",
        "tag": "J’adapte",
        "text": "Le message vient d’un proche : « Peux-tu me rappeler ? C’est urgent. »",
        "q": "Identifier l’information nouvelle qui peut modifier la décision en sélectionnant une réponse.",
        "options": [
          "L’urgence du message.",
          "La couleur du cahier.",
          "L’heure habituelle de son repas."
        ],
        "correct": 0,
        "hint": "Une information peut changer la priorité.",
        "ex": "Réfléchir, c’est aussi ajuster son choix quand la situation change.",
        "condition": "À partir du nouveau message :"
      },
      {
        "kind": "compare",
        "tag": "À la maison",
        "image": "lina-achat",
        "text": "Lina a prévu de garder son argent pour ses courses de la semaine. Elle voit une paire de chaussures en promotion.",
        "condition": "À partir de la situation de Lina :",
        "q": "Comparer les conséquences des deux actions en ouvrant chaque carte.",
        "cards": [
          {
            "label": "Acheter les chaussures maintenant.",
            "effect": "Lina profite de la promotion, mais risque de manquer d’argent pour ses courses."
          },
          {
            "label": "Reporter l’achat des chaussures.",
            "effect": "Lina garde l’argent prévu pour ses courses, mais peut manquer la promotion."
          }
        ],
        "hint": "Chaque action a un avantage et une limite. Relie-les à ce qui compte pour Lina."
      },
      {
        "kind": "phrase",
        "tag": "Justifier un choix",
        "image": "lina-achat",
        "text": "Lina a prévu de garder son argent pour ses courses de la semaine. Elle voit une paire de chaussures en promotion.",
        "condition": "À partir de la situation de Lina :",
        "q": "Justifier le choix d’une action pour Lina en écrivant une phrase.",
        "words": [
          "Je reporte l’achat pour garder l’argent prévu pour les courses.",
          "Je vérifie mon budget avant de décider, pour connaître l’argent disponible."
        ],
        "hint": "Présente une action et une raison. Plusieurs décisions peuvent se défendre selon les informations disponibles.",
        "ex": "Le raisonnement compte : quelle conséquence le choix a-t-il sur le but de Lina ? Une proposition libre reste à discuter avec l’enseignant."
      },
      {
        "kind": "phrase",
        "tag": "Une autre situation",
        "text": "Lina a promis d’aider un proche à déménager. Une amie lui propose une sortie au même moment.",
        "condition": "À partir de la situation de Lina :",
        "q": "Proposer une action qui tient compte des deux engagements en écrivant une phrase.",
        "words": [
          "Je demande si je peux aider plus tôt, puis rejoindre mon amie.",
          "Je préviens mon amie que je suis déjà engagée et je propose une autre date."
        ],
        "hint": "Lina peut chercher un arrangement et prévenir les personnes concernées.",
        "ex": "Plusieurs solutions sont possibles. Vérifie qui doit être prévenu et quelles conséquences ton choix peut avoir."
      }
    ]
  }
};
const PICTURES = {
  "lina-agacement": "Lina regarde la pointe cassée de son crayon, sourcils rapprochés et une main ouverte.",
  "julie-ecoute-lina": "Lina tient une feuille et parle. Julie est tournée vers elle, les mains sur la table.",
  "lina-avant-choix": "Lina est assise devant un cahier ouvert et un téléphone posé sur la table.",
  "lina-bus": "Lina regarde sa montre à un arrêt de bus. Un bus s’éloigne sur la route.",
  "amis-parc": "Lina parle à Julie sur un banc dans un parc. Julie est tournée vers elle.",
  "lina-achat": "À la maison, Lina regarde des chaussures sur son téléphone. Un porte-monnaie et des chaussures sont sur la table."
};
