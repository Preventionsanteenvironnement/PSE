const STORY = {
  "title": "Faire face à une situation stressante",
  "objective": "Gérer son stress dans différentes situations.",
  "anchor": "cps-stress-cap",
  "introImage": "arrivee",
  "endImage": "information",
  "intro": "Un rendez-vous dans un lieu inconnu. Choisir les pensées et les paroles de Julie, explorer des ressources, puis retrouver son parcours en BD.",
  "phases": [
    "Observer son ressenti",
    "Explorer des ressources",
    "Agir et ajuster",
    "Réutiliser"
  ],
  "reference": "E2.3 — Tome II, 2026, p. 140–148 : reconnaître les réactions de stress, stratégies centrées sur l’expérience émotionnelle et sur le problème. Appui C2.3/C2.4, p. 50–55.",
  "teacher": "Adaptation originale pour CAP, sans diagnostic ni promesse de disparition du stress. Les effets des stratégies varient. Le parcours distingue les actions sur le ressenti des actions sur la situation. Aucune respiration imposée, aucune obligation de fermer les yeux, aucun score. Une proposition personnelle peut rester vide. La BD est une adaptation pédagogique originale. Les bulles de pensée représentent l’expérience de Julie dans cette fiction, sans diagnostic. Les suites sont des hypothèses, pas des effets garantis. La restitution reprend le chemin exploré. Aucune saisie obligatoire.",
  "takeaways": [
    "Repérer les sensations, émotions et pensées présentes.",
    "Prendre un moment pour observer sans se juger.",
    "Chercher une information ou préparer une action concrète.",
    "Observer ce qui aide, ajuster et demander du soutien si nécessaire."
  ],
  "transfer": "À deux, inventer une situation nouvelle à l’école, au travail ou dans la vie quotidienne. Une personne décrit un besoin d’information ; l’autre propose une ressource. Chacun peut passer.",
  "nodes": {
    "situation": {
      "title": "Un lieu inconnu",
      "phase": 0,
      "image": "arrivee",
      "text": "Julie arrive pour un premier rendez-vous. Elle ne sait pas où se présenter et se demande si son dossier est complet.",
      "condition": "À partir de la situation proposée :",
      "q": "Identifier ce qui inquiète Julie en sélectionnant une proposition.",
      "type": "choice",
      "next": "ressenti",
      "hints": [
        "Repérer ce que Julie ne sait pas encore.",
        "Elle manque d’informations sur l’accueil et sur son dossier."
      ],
      "explanation": "Dans cette situation, l’incertitude sur le rendez-vous peut contribuer à son stress. Ce n’est pas le seul ressenti possible.",
      "options": [
        "Elle manque d’informations sur le rendez-vous.",
        "Elle connaît déjà tous les lieux.",
        "Elle souhaite changer la couleur de son dossier."
      ],
      "valid": [
        0
      ],
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "Où dois-je aller ? Mon dossier est-il complet ?"
        }
      ]
    },
    "ressenti": {
      "title": "Reconnaître les signaux",
      "phase": 0,
      "image": "arrivee",
      "text": "Julie dit : « Mon ventre est serré. Je pense que je vais me tromper. »",
      "condition": "À partir de la situation proposée :",
      "q": "Identifier un signal évoqué par Julie en touchant une bulle.",
      "type": "bubbles",
      "next": "actions",
      "hints": [
        "Ses paroles décrivent une sensation et une pensée.",
        "Elle évoque un ventre serré et la crainte de se tromper."
      ],
      "explanation": "Observer une sensation ou une pensée aide à repérer l’état présent. Ces indices ne suffisent pas à établir un diagnostic.",
      "options": [
        "Mon ventre est serré.",
        "Je crains de me tromper.",
        "Je me sens inquiète."
      ],
      "speaker": "Julie — pensée",
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "Mon ventre est serré. Je pense que je vais me tromper."
        }
      ]
    },
    "actions": {
      "title": "Explorer des ressources",
      "phase": 1,
      "image": "arrivee",
      "text": "Julie peut agir sur son ressenti, sur les informations manquantes, ou combiner plusieurs ressources.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une possibilité pour Julie en touchant une bulle.",
      "type": "branches",
      "next": "pause",
      "hints": [
        "Plusieurs actions peuvent aider selon la personne et la situation.",
        "Prendre un moment et demander une information peuvent se compléter."
      ],
      "explanation": "Il n’y a pas une ressource qui fonctionne toujours. Julie peut observer l’effet d’une action puis ajuster.",
      "options": [
        {
          "label": "Je prends un moment pour observer mon ressenti.",
          "to": "pause"
        },
        {
          "label": "Je demande une information à l’accueil.",
          "to": "information"
        },
        {
          "label": "J’attends encore un moment.",
          "to": "attente"
        }
      ],
      "nextLabel": "Continuer avec un exemple",
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "Je peux explorer plusieurs façons de faire."
        }
      ]
    },
    "pause": {
      "title": "Observer sans se juger",
      "phase": 1,
      "image": "pause",
      "text": "Julie prend un moment. Elle peut sentir ses appuis et observer sa respiration sans la forcer. Elle garde les yeux ouverts si elle le souhaite.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir un point d’attention pour Julie en touchant une bulle.",
      "type": "bubbles",
      "next": "preparer",
      "hints": [
        "Une sensation présente peut servir de point d’attention.",
        "Elle peut remarquer ses appuis, sa respiration ou les objets autour d’elle."
      ],
      "explanation": "Cette observation ne doit pas être forcée. Le stress peut rester présent ; Julie peut ensuite chercher une information ou une aide.",
      "replay": true,
      "options": [
        "Je remarque mes pieds au sol.",
        "J’observe ma respiration sans la forcer.",
        "Je regarde un objet autour de moi."
      ],
      "speaker": "Julie — pensée",
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "Je prends un moment, sans me juger."
        }
      ]
    },
    "information": {
      "title": "Demander une précision",
      "phase": 1,
      "image": "information",
      "text": "Julie s’adresse à la personne de l’accueil pour savoir où se présenter et vérifier les documents nécessaires.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une demande d’information pour Julie en touchant une bulle.",
      "type": "bubbles",
      "next": "preparer",
      "hints": [
        "Une question précise peut réduire une incertitude.",
        "Exemple : « Où dois-je me présenter pour mon rendez-vous ? »"
      ],
      "explanation": "Demander une précision agit sur le problème concret. Cela ne garantit pas que toute la tension disparaisse.",
      "replay": true,
      "options": [
        "Bonjour, où dois-je me présenter pour mon rendez-vous ?",
        "Pouvez-vous m’indiquer les documents à préparer ?"
      ],
      "speaker": "Julie",
      "dialogue": [
        {
          "speaker": "Accueil",
          "text": "Bonjour. Que souhaitez-vous savoir ?"
        }
      ]
    },
    "attente": {
      "title": "Observer l’effet de l’attente",
      "phase": 1,
      "image": "arrivee",
      "text": "Dans cette possibilité, Julie attend. Les informations manquent toujours. Elle peut choisir de rester un moment ou de chercher une précision.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une suite pour Julie en touchant une bulle.",
      "type": "branches",
      "next": "information",
      "hints": [
        "Attendre n’apporte pas toujours l’information recherchée.",
        "Julie peut observer son ressenti ou demander un renseignement."
      ],
      "explanation": "L’effet de l’attente varie. Julie peut réexaminer son choix au lieu de rester enfermée dans une seule stratégie.",
      "options": [
        {
          "label": "Je demande une précision à l’accueil.",
          "to": "information"
        },
        {
          "label": "Je prends un moment pour observer.",
          "to": "pause"
        }
      ],
      "replay": true,
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "J’attends, mais je ne sais toujours pas où aller."
        }
      ]
    },
    "preparer": {
      "title": "Préparer une action concrète",
      "phase": 2,
      "image": "information",
      "text": "Julie veut savoir où se présenter et préparer son rendez-vous.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une action de préparation pour Julie en touchant une bulle.",
      "type": "bubbles",
      "next": "reactions",
      "hints": [
        "Une action concrète peut concerner le lieu, les documents ou les questions à poser.",
        "Julie peut vérifier le lieu ou préparer ses questions."
      ],
      "explanation": "Plusieurs préparations peuvent être utiles. L’important est de répondre à une difficulté concrète et de garder une action réalisable.",
      "options": [
        "Je vérifie le lieu où me présenter.",
        "Je note mes questions à poser.",
        "Je prépare les documents demandés."
      ],
      "speaker": "Julie — pensée",
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "Quelle action concrète puis-je préparer ?"
        }
      ]
    },
    "reactions": {
      "title": "Observer ce qui change",
      "phase": 2,
      "image": "information",
      "text": "Après une première action, Julie peut observer ce qui l’aide et ce qui reste difficile.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une suite possible pour Julie en touchant une bulle.",
      "type": "branches",
      "next": "precision",
      "hints": [
        "Le stress peut diminuer, rester présent ou changer.",
        "Une action utile peut être ajustée ou complétée."
      ],
      "explanation": "Aucune suite ne constitue un échec personnel. Le but est d’observer et d’ajuster les ressources.",
      "options": [
        {
          "label": "Je comprends mieux où aller.",
          "to": "clarte"
        },
        {
          "label": "Il me manque encore une information.",
          "to": "precision"
        },
        {
          "label": "Je me sens encore tendue.",
          "to": "soutien"
        }
      ],
      "nextLabel": "Continuer avec un exemple",
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "Qu’est-ce qui change ? De quoi ai-je encore besoin ?"
        }
      ]
    },
    "clarte": {
      "title": "S’appuyer sur une ressource",
      "phase": 2,
      "image": "dossier",
      "text": "Dans cette suite possible, Julie sait où se présenter. Elle peut encore ressentir de la tension tout en avançant.",
      "condition": "À partir de la situation proposée :",
      "q": "Identifier une ressource disponible pour Julie en touchant une bulle.",
      "type": "bubbles",
      "next": "transfert",
      "hints": [
        "Une ressource peut être une information, une personne ou une action préparée.",
        "Elle peut s’appuyer sur le renseignement reçu ou sur ses questions notées."
      ],
      "explanation": "Une situation mieux comprise peut devenir plus abordable. Le ressenti reste propre à Julie.",
      "replay": true,
      "options": [
        "Je peux m’appuyer sur le renseignement reçu.",
        "Je peux poser une question à l’accueil.",
        "Je peux consulter mes questions préparées."
      ],
      "speaker": "Julie — pensée",
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "Je sais où aller. Je peux avancer même si je suis encore un peu tendue."
        }
      ]
    },
    "precision": {
      "title": "Ajuster sa demande",
      "phase": 2,
      "image": "dossier",
      "text": "Julie connaît le lieu, mais ne sait toujours pas si son dossier est complet.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une question sur les documents nécessaires en touchant une bulle.",
      "type": "bubbles",
      "next": "soutien",
      "hints": [
        "La nouvelle question porte sur l’information encore manquante.",
        "Exemple : « Pouvez-vous m’indiquer les documents nécessaires ? »"
      ],
      "explanation": "Une demande peut être précisée sans recommencer tout le parcours. Chercher une information complémentaire est une façon d’ajuster.",
      "replay": true,
      "options": [
        "Pouvez-vous m’indiquer les documents nécessaires ?",
        "Pouvez-vous m’aider à vérifier mon dossier ?"
      ],
      "speaker": "Julie",
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "Je connais le lieu, mais je dois encore vérifier mon dossier."
        }
      ]
    },
    "soutien": {
      "title": "Chercher un accompagnement",
      "phase": 2,
      "image": "soutien",
      "text": "Si Julie reste en difficulté, elle peut en parler à une personne de confiance et demander un accompagnement adapté.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une demande de soutien pour Julie en touchant une bulle.",
      "type": "bubbles",
      "next": "transfert",
      "hints": [
        "Julie peut préciser ce qui lui est difficile et l’aide souhaitée.",
        "Exemple : « J’ai du mal à me repérer. Peux-tu m’accompagner pour cette démarche ? »"
      ],
      "explanation": "Si la tension devient difficile à supporter ou persiste, demander un accompagnement est une ressource. Julie n’a pas à tout résoudre seule.",
      "replay": true,
      "options": [
        "J’ai besoin d’être écoutée avant mon rendez-vous.",
        "Peux-tu m’aider à préparer cette démarche ?",
        "Peux-tu m’accompagner ? J’ai du mal à me repérer."
      ],
      "speaker": "Julie",
      "dialogue": [
        {
          "speaker": "Lina",
          "text": "Je peux t’écouter. De quoi as-tu besoin ?"
        }
      ]
    },
    "transfert": {
      "title": "Réutiliser à l’école",
      "phase": 3,
      "image": "transfert",
      "text": "Julie doit présenter un travail devant un groupe et se sent tendue. Elle souhaite préparer sa prise de parole.",
      "condition": "À partir de la situation proposée :",
      "q": "Choisir une ressource pour préparer la prise de parole en touchant une bulle.",
      "type": "bubbles",
      "next": "bilan",
      "hints": [
        "Elle peut agir sur son ressenti et sur sa préparation.",
        "Elle peut préparer une fiche, demander une précision ou prendre un moment avant de commencer."
      ],
      "explanation": "Les ressources découvertes peuvent être adaptées à un autre contexte. Il n’y a pas une action valable pour tout le monde.",
      "options": [
        "Je prépare une fiche avec mes idées principales.",
        "Je demande ce qui est attendu avant de commencer.",
        "Je prends un moment pour observer mon ressenti."
      ],
      "speaker": "Julie — pensée",
      "dialogue": [
        {
          "speaker": "Julie — pensée",
          "text": "Je dois présenter mon travail. Comment me préparer ?"
        }
      ]
    }
  },
  "character": "Julie",
  "observationNode": "ressenti",
  "otherSpeakers": [
    "Accueil",
    "Lina"
  ],
  "reactionSpeaker": "Julie — pensée"
};
const ALT = {
  "arrivee": "Julie est devant un bâtiment, un dossier contre elle et une main sur le ventre.",
  "information": "Julie échange avec une personne à l’accueil, qui indique un couloir.",
  "soutien": "Julie et Lina échangent sur un banc.",
  "transfert": "Julie tient une feuille devant un groupe en classe.",
  "pause": "Julie est assise dans le hall, les pieds au sol et les yeux ouverts, son dossier sur les genoux.",
  "dossier": "Julie et la personne de l’accueil consultent une feuille posée sur le comptoir."
};
