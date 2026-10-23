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

## Parcours acteurs/CSE : entraînement mobile

Les trois fichiers `exo_cse_mobile_n1.json` à `exo_cse_mobile_n3.json` portent
les niveaux Reconnaître, Appliquer et Raisonner (six questions chacun).
Ils utilisent `type=qcm_series_multi`, `contenu.mode=entrainement_mobile`.
Le moteur dédié `assets/quiz-mobile.js` affiche une question à la fois ; les
autres QCM gardent leur fonctionnement existant. Le CSS est limité à `.mq`.
Chaque question conserve les champs QCM habituels ainsi que `titre`, `situation`,
`retours` (un retour par choix) et `correction_pedagogique` (comprendre, exemple,
retenir). Ne pas aplatir ni supprimer ces champs lors d'une édition.
Les résultats de cette activité restent en mémoire le temps de l'ouverture :
aucune écriture Firebase, aucun envoi de copie ou de note scolaire par ce moteur.
Références pédagogiques : module C3 du professeur ; vérification institutionnelle
INRS (acteurs et salarié compétent), Urssaf (CSE), ministère du Travail (CSSCT),
le 23 octobre 2026. Les documents privés du professeur ne sont pas publiés.


## Identification et estimation : entraînement mobile

Les trois fichiers `exo_risques_mobile_n1.json` à `exo_risques_mobile_n3.json`
réutilisent le même moteur mobile et les mêmes champs de corrigés.
Classement : Estimation du risque > Identification et estimation · Bac Pro, module C5.
Les petites grilles intégrées sont des conventions pédagogiques explicites ;
aucune formule ou matrice n’est présentée comme un barème national.
Contenu : identification/PAD, gravité et probabilité, lecture de priorité,
justification et réévaluation. Référence principale : module C5 du professeur.
Documents privés et données d’élèves exclus du dépôt.


## DUERP : entraînement mobile

Les fichiers `exo_duerp_mobile_n1.json` à `exo_duerp_mobile_n3.json`
réutilisent le moteur mobile : 18 questions, trois niveaux et corrigés ciblés.
Classement : DUERP > Parcours DUERP · Bac Pro, module C5.
Conserver les retours par choix, les exemples, les mémos et les liens entre niveaux.
Référence principale : module C5 du professeur ; règles recoupées avec INRS
et ministère du Travail le 23 octobre 2026. Les grilles locales ne sont pas
un barème national. Aucun document privé ni donnée d’élève inclus.
