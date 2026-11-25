const STORY = {
  "title": "Dire non et maintenir son choix",
  "objective": "Exprimer un refus en respectant son choix et son interlocuteur.",
  "anchor": "cps-refus-cap",
  "introImage": "demande",
  "endImage": "refus",
  "intro": "Une sortie proposée, une envie différente. Plusieurs façons de refuser à explorer.",
  "phases": [
    "Repérer ce qui compte",
    "Explorer des possibilités",
    "Exprimer et maintenir son choix",
    "Réutiliser"
  ],
  "reference": "S2.1 — Tome II, 2026, p. 169–177, notamment refuser de manière assertive p. 173. Liens avec C1.3 (valeurs et besoins) et C2.4 (demander de l’aide).",
  "teacher": "Adaptation originale pour CAP. Plusieurs formulations de refus sont recevables. Donner une justification n’est pas obligatoire. Les réactions des personnages sont possibles, pas certaines. Refuser n’impose ni un contact visuel direct ni une posture unique. Aucun score, aucune obligation de réponse ; les formulations personnelles ne sont pas corrigées automatiquement.",
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
      ]
    },
    "besoin": {
      "title": "Reconnaître son envie",
      "phase": 0,
      "image": "demande",
      "text": "Lina apprécie Noa et souhaite aussi garder du temps pour se reposer. Elle hésite à lui dire non.",
      "condition": "À partir de la situation proposée :",
      "q": "Nommer un ressenti possible de Lina en écrivant quelques mots.",
      "type": "text",
      "next": "actions",
      "hints": [
        "Plusieurs ressentis peuvent coexister.",
        "Lina peut être fatiguée, gênée de refuser ou inquiète de décevoir."
      ],
      "explanation": "Il n’y a pas une émotion imposée. Nommer un ressenti peut aider à repérer ce qui compte pour soi.",
      "suggestions": [
        "fatiguée",
        "gênée de refuser",
        "inquiète de décevoir",
        "décidée à rentrer"
      ]
    },
    "actions": {
      "title": "Explorer des façons de répondre",
      "phase": 1,
      "image": "demande",
      "text": "Lina peut choisir comment répondre. Le but est de respecter son choix et la relation, sans promettre la réaction de Noa.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une possibilité à explorer en ouvrant une carte.",
      "type": "branches",
      "next": "refus",
      "hints": [
        "La demande de Noa n’oblige pas Lina à accepter.",
        "Elle peut refuser, prendre un temps de réflexion ou réexaminer son choix."
      ],
      "explanation": "Un refus peut être direct, accompagné d’une raison ou d’une autre proposition. Aucune formule n’est obligatoire.",
      "options": [
        {
          "label": "Dire non clairement",
          "to": "refus"
        },
        {
          "label": "Demander un moment pour réfléchir",
          "to": "temps"
        },
        {
          "label": "Accepter pour éviter de déplaire",
          "to": "accepte"
        }
      ],
      "nextLabel": "Continuer avec un exemple"
    },
    "refus": {
      "title": "Formuler son refus",
      "phase": 1,
      "image": "refus",
      "text": "Un peu plus tard, Lina et Noa poursuivent leur échange sur un banc. Lina souhaite toujours rentrer se reposer.",
      "condition": "À partir de la situation proposée :",
      "q": "Formuler le refus de Lina en écrivant une phrase.",
      "type": "text",
      "next": "reactions",
      "hints": [
        "Une phrase courte peut suffire.",
        "Exemple : « Non, je rentre me reposer. On peut se revoir un autre jour. »"
      ],
      "explanation": "Lina peut dire non clairement, sans insulte ni justification obligatoire. Une autre formulation peut aussi convenir.",
      "suggestions": [
        "Non, je rentre me reposer.",
        "Non, pas aujourd’hui. On peut prévoir une autre sortie."
      ],
      "replay": true
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
      "replay": true
    },
    "accepte": {
      "title": "Vérifier son accord",
      "phase": 1,
      "image": "demande",
      "text": "Dans cette possibilité, Lina accepte pour éviter de déplaire, alors qu’elle souhaite rentrer. Elle peut réexaminer sa réponse.",
      "condition": "À partir de la situation proposée :",
      "q": "Proposer une phrase pour préciser le choix de Lina en écrivant dans la zone de réponse.",
      "type": "text",
      "next": "reactions",
      "hints": [
        "Lina peut reconnaître qu’elle a répondu trop vite.",
        "Exemple : « J’ai dit oui trop vite. Je préfère finalement rentrer. »"
      ],
      "explanation": "Un accord peut être libre, et une personne peut aussi changer d’avis. Il s’agit de distinguer son choix de la crainte de déplaire.",
      "suggestions": [
        "J’ai dit oui trop vite. Je préfère rentrer me reposer."
      ],
      "replay": true
    },
    "reactions": {
      "title": "Noa peut réagir différemment",
      "phase": 2,
      "image": "refus",
      "text": "Lina exprime son souhait de rentrer. Noa peut accepter, insister ou montrer sa déception.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une réaction de Noa à explorer en ouvrant une carte.",
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
      "nextLabel": "Continuer avec un exemple"
    },
    "accord": {
      "title": "Un choix accueilli",
      "phase": 2,
      "image": "refus",
      "text": "Dans cette suite possible, Noa accepte. Lina peut rentrer et, si elle le souhaite, proposer un autre moment de rencontre.",
      "condition": "À partir de la situation proposée :",
      "q": "Proposer une suite à l’échange en écrivant une phrase.",
      "type": "text",
      "next": "transfert",
      "hints": [
        "Préserver la relation ne nécessite pas de renoncer à son choix.",
        "Exemple : « Merci. On peut s’appeler demain pour prévoir une autre sortie. »"
      ],
      "explanation": "Lina peut proposer un autre moment sans y être obligée. Son refus n’a pas besoin d’être compensé.",
      "suggestions": [
        "Merci. On peut prévoir une autre sortie."
      ],
      "replay": true
    },
    "insistance": {
      "title": "Maintenir son choix",
      "phase": 2,
      "image": "refus",
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
      "replay": true
    },
    "soutien": {
      "title": "Prendre de la distance ou chercher du soutien",
      "phase": 2,
      "image": "soutien",
      "text": "Une remarque culpabilisante peut rendre le refus difficile. Lina peut interrompre l’échange et se tourner vers une personne de confiance.",
      "condition": "À partir de la situation proposée :",
      "q": "Formuler une demande de soutien en écrivant une phrase.",
      "type": "text",
      "next": "transfert",
      "hints": [
        "Le refus de Lina reste possible malgré une remarque désagréable.",
        "Une personne de confiance peut l’écouter ou l’accompagner."
      ],
      "explanation": "Si une personne se sent sous pression ou en insécurité, prendre de la distance et chercher du soutien est une possibilité.",
      "suggestions": [
        "J’ai du mal à maintenir mon refus. Peux-tu m’écouter ?"
      ],
      "replay": true
    },
    "transfert": {
      "title": "Réutiliser à l’école",
      "phase": 3,
      "image": "transfert",
      "text": "Un camarade demande à Lina de terminer son travail pendant la pause. Lina souhaite garder ce temps pour elle.",
      "condition": "À partir de la situation proposée :",
      "q": "Formuler un refus pour Lina en écrivant une phrase.",
      "type": "text",
      "next": "bilan",
      "hints": [
        "Lina peut exprimer sa limite sans juger son camarade.",
        "Exemple : « Non, je garde ma pause. Tu peux demander une explication au professeur. »"
      ],
      "explanation": "Il existe plusieurs formulations recevables. Le refus peut rester bref et respectueux.",
      "suggestions": [
        "Non, je garde ma pause pour moi.",
        "Je ne vais pas faire ton travail à ta place. Tu peux demander une explication."
      ]
    }
  }
};
const ALT = {
  "demande": "Noa propose une sortie à Lina à une terrasse. Lina garde son sac près d’elle.",
  "refus": "Lina s’adresse à Noa sur un banc, une main ouverte près de sa poitrine.",
  "soutien": "Lina et Julie échangent sur un banc.",
  "transfert": "Julie et Lina sont assises à une table dans une salle de cours."
};
