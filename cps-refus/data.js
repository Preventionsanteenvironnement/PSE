const STORY = {
  "title": "Dire non et maintenir son choix",
  "objective": "Exprimer un refus en respectant son choix et son interlocuteur.",
  "anchor": "cps-refus-cap",
  "introImage": "demande",
  "endImage": "refus",
  "intro": "Une histoire en images. Choisir les paroles de Lina, explorer les réactions de Noa et essayer une autre version.",
  "phases": [
    "Repérer ce qui compte",
    "Explorer des possibilités",
    "Exprimer et maintenir son choix",
    "Réutiliser"
  ],
  "reference": "S2.1 — Tome II, 2026, p. 169–177, notamment refuser de manière assertive p. 173. Liens avec C1.3 (valeurs et besoins) et C2.4 (demander de l’aide).",
  "teacher": "Adaptation originale pour CAP. Plusieurs formulations de refus sont recevables. Donner une justification n’est pas obligatoire. Les réactions des personnages sont possibles, pas certaines. Refuser n’impose ni un contact visuel direct ni une posture unique. Aucun score, aucune obligation de réponse ; les formulations personnelles ne sont pas corrigées automatiquement. Présentation en bande dessinée interactive : les dialogues sont des exemples à explorer, non des réponses obligatoires. Les émotions proposées restent des hypothèses ; les personnages seuls connaissent leur ressenti. Les sensations de fatigue sont distinguées des émotions.",
  "takeaways": [
    "Repérer son envie, ses besoins et ses limites.",
    "Exprimer son refus clairement.",
    "Maintenir son choix si l’autre insiste, ou prendre de la distance.",
    "Chercher du soutien si nécessaire."
  ],
  "transfer": "À deux, inventer une demande à l’école, au travail ou dans la vie quotidienne. Une personne formule un refus ; l’autre peut accepter ou insister. Chacun peut interrompre ou passer.",
  "nodes": {
    "situation": {
      "title": "Une proposition entre amis",
      "phase": 0,
      "image": "demande",
      "text": "Après un moment entre amis, Noa propose de prolonger la sortie. Lina souhaite rentrer pour se reposer.",
      "condition": "À partir de la situation proposée :",
      "q": "Identifier le choix de Lina en sélectionnant une proposition.",
      "type": "choice",
      "next": "besoin",
      "hints": [
        "Repérer ce que Lina souhaite.",
        "Lina souhaite rentrer, même si Noa propose de rester."
      ],
      "explanation": "Dans cette situation, Lina souhaite rentrer pour se reposer. Noa peut avoir une envie différente.",
      "options": [
        "Rentrer pour se reposer.",
        "Prolonger la sortie.",
        "Organiser une nouvelle fête."
      ],
      "valid": [
        0
      ],
      "dialogue": [
        {
          "speaker": "Noa",
          "text": "On prolonge la sortie ?"
        },
        {
          "speaker": "Lina",
          "text": "Je voudrais rentrer me reposer."
        }
      ]
    },
    "besoin": {
      "title": "Reconnaître son envie",
      "phase": 0,
      "image": "demande",
      "text": "Lina apprécie Noa et souhaite aussi garder du temps pour se reposer. Elle hésite à lui dire non.",
      "condition": "À partir de la situation proposée :",
      "q": "Sélectionner un ressenti possible de Lina en touchant une bulle.",
      "type": "bubbles",
      "next": "actions",
      "hints": [
        "Plusieurs ressentis peuvent coexister.",
        "Lina peut être gênée de refuser ou inquiète de décevoir. La fatigue est une sensation, pas une émotion."
      ],
      "explanation": "Plusieurs émotions sont possibles. L’image seule ne permet pas de connaître avec certitude le ressenti de Lina.",
      "options": [
        "gênée",
        "inquiète",
        "déçue",
        "soulagée",
        "Un autre ressenti est possible."
      ],
      "dialogue": [
        {
          "speaker": "Lina",
          "text": "J’apprécie Noa, mais je souhaite rentrer."
        }
      ],
      "speaker": "Ressenti possible de Lina"
    },
    "actions": {
      "title": "Explorer des façons de répondre",
      "phase": 1,
      "image": "demande",
      "text": "Lina peut choisir comment répondre. Le but est de respecter son choix et la relation, sans promettre la réaction de Noa.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une version de la réponse de Lina en touchant une bulle.",
      "type": "branches",
      "next": "refus",
      "hints": [
        "La demande de Noa n’oblige pas Lina à accepter.",
        "Elle peut refuser, prendre un temps de réflexion ou réexaminer son choix."
      ],
      "explanation": "Un refus peut être direct, accompagné d’une raison ou d’une autre proposition. Aucune formule n’est obligatoire.",
      "options": [
        {
          "label": "Non, je rentre me reposer.",
          "to": "refus"
        },
        {
          "label": "Je prends un moment pour réfléchir.",
          "to": "temps"
        },
        {
          "label": "D’accord, je reste…",
          "to": "accepte"
        }
      ],
      "nextLabel": "Continuer avec un exemple",
      "dialogue": [
        {
          "speaker": "Noa",
          "text": "On reste encore un peu ?"
        },
        {
          "speaker": "Lina",
          "text": "Je souhaite rentrer. Comment le dire ?"
        }
      ]
    },
    "refus": {
      "title": "Formuler son refus",
      "phase": 1,
      "image": "refus",
      "text": "Un peu plus tard, Lina et Noa poursuivent leur échange sur un banc. Lina souhaite toujours rentrer se reposer.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir les paroles de Lina en touchant une bulle.",
      "type": "bubbles",
      "next": "reactions",
      "hints": [
        "Une phrase courte peut suffire.",
        "Exemple : « Non, je rentre me reposer. On peut se revoir un autre jour. »"
      ],
      "explanation": "Lina peut dire non clairement, sans insulte ni justification obligatoire. Une autre formulation peut aussi convenir.",
      "replay": true,
      "options": [
        "Non, je rentre me reposer.",
        "Non, pas aujourd’hui. On peut prévoir une autre sortie.",
        "Non, je préfère rentrer."
      ],
      "dialogue": [
        {
          "speaker": "Lina",
          "text": "Non, je rentre me reposer."
        }
      ]
    },
    "temps": {
      "title": "Prendre le temps de choisir",
      "phase": 1,
      "image": "demande",
      "text": "Dans cette possibilité, Lina dit : « Je prends un moment pour réfléchir. » Elle peut vérifier ce qu’elle souhaite vraiment.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une suite pour Lina en ouvrant une carte.",
      "type": "branches",
      "next": "refus",
      "hints": [
        "Prendre un temps n’oblige pas à répondre oui ensuite.",
        "Lina peut revenir exprimer son choix ou en parler à une personne de confiance."
      ],
      "explanation": "Ce temps sert à écouter ses besoins. La décision reste celle de Lina.",
      "options": [
        {
          "label": "Revenir exprimer son choix",
          "to": "refus"
        },
        {
          "label": "Chercher du soutien",
          "to": "soutien"
        }
      ],
      "replay": true,
      "dialogue": [
        {
          "speaker": "Lina",
          "text": "Je prends un moment pour réfléchir."
        }
      ]
    },
    "accepte": {
      "title": "Vérifier son accord",
      "phase": 1,
      "image": "demande",
      "text": "Dans cette possibilité, Lina accepte pour éviter de déplaire, alors qu’elle souhaite rentrer. Elle peut réexaminer sa réponse.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir les paroles de Lina pour préciser son choix en touchant une bulle.",
      "type": "bubbles",
      "next": "reactions",
      "hints": [
        "Lina peut reconnaître qu’elle a répondu trop vite.",
        "Exemple : « J’ai dit oui trop vite. Je préfère finalement rentrer. »"
      ],
      "explanation": "Un accord peut être libre, et une personne peut aussi changer d’avis. Il s’agit de distinguer son choix de la crainte de déplaire.",
      "replay": true,
      "options": [
        "J’ai dit oui trop vite. Je préfère rentrer me reposer.",
        "Finalement, je ne reste pas. Je rentre."
      ],
      "dialogue": [
        {
          "speaker": "Lina",
          "text": "D’accord, je reste…"
        },
        {
          "speaker": "Lina",
          "text": "Je peux aussi changer d’avis."
        }
      ]
    },
    "reactions": {
      "title": "Noa peut réagir différemment",
      "phase": 2,
      "image": "refus",
      "text": "Lina exprime son souhait de rentrer. Noa peut accepter, insister ou montrer sa déception.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une réaction possible de Noa en touchant une bulle.",
      "type": "branches",
      "next": "insistance",
      "hints": [
        "Le refus ne garantit pas l’accord de l’autre.",
        "Lina peut maintenir son choix, même si Noa est déçu."
      ],
      "explanation": "Les réactions présentées sont des possibilités. Elles n’indiquent pas que Lina a bien ou mal formulé son refus.",
      "options": [
        {
          "label": "« D’accord, on se voit une autre fois. »",
          "to": "accord"
        },
        {
          "label": "« Reste encore un peu, s’il te plaît. »",
          "to": "insistance"
        },
        {
          "label": "« Si tu pars, tu n’es pas sympa. »",
          "to": "soutien"
        }
      ],
      "nextLabel": "Continuer avec un exemple",
      "dialogue": [
        {
          "speaker": "Lina",
          "text": "Je préfère rentrer."
        }
      ]
    },
    "accord": {
      "title": "Un choix accueilli",
      "phase": 2,
      "image": "noa-accepte",
      "text": "Dans cette suite possible, Noa accepte. Lina peut rentrer et, si elle le souhaite, proposer un autre moment de rencontre.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une suite à l’échange en touchant une bulle.",
      "type": "bubbles",
      "next": "transfert",
      "hints": [
        "Préserver la relation ne nécessite pas de renoncer à son choix.",
        "Exemple : « Merci. On peut s’appeler demain pour prévoir une autre sortie. »"
      ],
      "explanation": "Lina peut proposer un autre moment sans y être obligée. Son refus n’a pas besoin d’être compensé.",
      "replay": true,
      "options": [
        "Merci. On peut prévoir une autre sortie.",
        "Merci de comprendre. À bientôt !"
      ],
      "dialogue": [
        {
          "speaker": "Noa",
          "text": "D’accord, on se voit une autre fois."
        }
      ]
    },
    "insistance": {
      "title": "Maintenir son choix",
      "phase": 2,
      "image": "noa-insiste",
      "text": "Noa insiste : « Reste encore un peu ! » Lina souhaite toujours rentrer.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une réponse qui maintient le choix de Lina en sélectionnant une proposition.",
      "type": "choice",
      "next": "soutien",
      "hints": [
        "Lina peut répéter son refus calmement.",
        "Elle peut dire : « Non, j’ai décidé de rentrer. »"
      ],
      "explanation": "Lina peut maintenir son refus ou proposer une autre occasion. Si l’insistance la met en difficulté, elle peut prendre de la distance.",
      "options": [
        "Non, j’ai décidé de rentrer.",
        "Non, pas aujourd’hui. On peut prévoir un autre jour.",
        "D’accord, je dois forcément rester si tu insistes."
      ],
      "valid": [
        0,
        1
      ],
      "replay": true,
      "dialogue": [
        {
          "speaker": "Noa",
          "text": "Reste encore un peu, s’il te plaît !"
        },
        {
          "speaker": "Lina",
          "text": "Je souhaite toujours rentrer."
        }
      ]
    },
    "soutien": {
      "title": "Prendre de la distance ou chercher du soutien",
      "phase": 2,
      "image": "soutien",
      "text": "Une remarque culpabilisante peut rendre le refus difficile. Lina peut interrompre l’échange et se tourner vers une personne de confiance.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une demande de soutien en touchant une bulle.",
      "type": "bubbles",
      "next": "transfert",
      "hints": [
        "Le refus de Lina reste possible malgré une remarque désagréable.",
        "Une personne de confiance peut l’écouter ou l’accompagner."
      ],
      "explanation": "Si une personne se sent sous pression ou en insécurité, prendre de la distance et chercher du soutien est une possibilité.",
      "replay": true,
      "options": [
        "J’ai du mal à maintenir mon refus. Peux-tu m’écouter ?",
        "Peux-tu m’accompagner ? Je préfère partir."
      ],
      "dialogue": [
        {
          "speaker": "Lina",
          "text": "J’ai besoin d’en parler à une personne de confiance."
        }
      ]
    },
    "transfert": {
      "title": "Réutiliser à l’école",
      "phase": 3,
      "image": "transfert",
      "text": "Un camarade demande à Lina de terminer son travail pendant la pause. Lina souhaite garder ce temps pour elle.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir un refus pour Lina en touchant une bulle.",
      "type": "bubbles",
      "next": "bilan",
      "hints": [
        "Lina peut exprimer sa limite sans juger son camarade.",
        "Exemple : « Non, je garde ma pause. Tu peux demander une explication au professeur. »"
      ],
      "explanation": "Il existe plusieurs formulations recevables. Le refus peut rester bref et respectueux.",
      "options": [
        "Non, je garde ma pause pour moi.",
        "Je ne vais pas faire ton travail à ta place. Tu peux demander une explication."
      ],
      "dialogue": [
        {
          "speaker": "Un camarade",
          "text": "Tu peux terminer mon travail pendant la pause ?"
        },
        {
          "speaker": "Lina",
          "text": "Je souhaite garder ma pause."
        }
      ]
    }
  }
};
const ALT = {
  "noa-insiste": "Sur le banc, Noa parle en se penchant légèrement vers Lina. Lina garde une main ouverte pour maintenir sa limite.",
  "noa-accepte": "Noa et Lina sur le banc : Noa sourit légèrement, une main ouverte, et accueille le choix de Lina.",
  "demande": "Noa propose une sortie à Lina à une terrasse. Lina garde son sac près d’elle.",
  "refus": "Lina s’adresse à Noa sur un banc, une main ouverte près de sa poitrine.",
  "soutien": "Lina et Julie échangent sur un banc.",
  "transfert": "Julie et Lina sont assises à une table dans une salle de cours."
};
