# Banque d'exercices en ligne

Chaque exercice publié sur `exercices.html` est un fichier `exercices/<id>.json` :
réglages (titre, type, niveau, moduleId, dossier, sous_dossier, difficulte, classeIds, publie)
et contenu de l'exercice (`contenu`).

`index.json` est la liste légère des exercices publiés (sans le contenu), lue par
`exercices.html` à l'ouverture. Le contenu d'un exercice est chargé quand l'élève l'ouvre.

## Ajouter ou modifier un exercice
1. Déposer ou modifier `exercices/<id>.json` (l'id est le nom du fichier).
2. Lancer `python3 outils/banque_construire.py` : vérifie les fichiers et reconstruit `index.json`.
3. Proposer la modification en PR ; le contrôle « Banque d'exercices » refait la vérification.

Retirer un exercice : `"publie": false` (il disparaît de la liste) ou supprimer le fichier.

Ne jamais mettre dans ces fichiers : données d'élèves, sujets d'évaluation non publiés,
consignes de conception (`sourcePrompt`, refusé par le script). Tout fichier ici est public.
