# Chef-d'œuvre CAP PSR 1re année (2026-2027) — parcours individuel

Demande de M. Mecheri (1er novembre 2026). Branche `chef-doeuvre/parcours-risques`, **non publiée**.

## Ce que c'est
- `index.html` : deux portes. **Mon chef-d'œuvre** (code élève de 4 caractères, classe C1PSR dans `../data_eleves.js`) et **Boîte à outils cuisine** (libre).
- Une séance = six étapes : météo et objectif, découvrir, s'exercer, évaluation notée sur 20, carnet de bord, bilan.
- Contenu : `seances/s0…s7` (introduction, puis séances du 14 octobre au 16 décembre), repris du Tableau de l'Atelier PSE (module CDO), des feuilles élèves de la séance 1 et de la planche « Une cuisine collective ».
- `js/audio.js` (lecture à voix haute partout), `js/avatar.js` (portrait en tenue de cuisine), `js/exercices.js` (classer, relier, trous, qcm, intrus, tableau, ordre, chaîne, qui suis-je, vrai/faux, mots, chasse aux dangers), `js/evaluation.js` (choix, vf, trous, associer, ranger, repérer sur une illustration), `js/donnees.js` (enregistrement), `js/app.js` (écrans).

## Données
- Sur l'ordinateur : `localStorage` `cdo-psr-2026:<code>` ; fichier de secours à exporter / importer (Mon espace).
- En ligne (Firebase `devoirs-pse`) : `resultats/{code}/evaluations/cdo-psr-2026-<séance>` (même forme que le portfolio PSR : `note_finale`, `bareme`, `devoirId`…, lue par le Centre en ligne de l'Atelier). Seul le code part, jamais un nom.
- **`ENVOI_EN_LIGNE = true`** : envoi autorisé par M. Mecheri. Les codes `PROF`, `ESSAI`, `PROFPSE`, `PROFPSR` ne sont jamais envoyés.

## Note enseignant (choix par défaut, à confirmer par M. Mecheri — contrôle du 01/11/2026)
- Les évaluations de séance sont des **quiz de séance** (part « Comprendre » de la note du chef-d'œuvre), pas des évaluations ordinaires au profil CAP (EVA-15 : 7 questions, 18 + 2 C6). Elles n'entrent pas dans la note de PSE.
- La séance 0 (le chef-d'œuvre) ne relève pas du programme de PSE : sa note reste dans le chef-d'œuvre.
- Le projet tient lieu de situation transversale ; la notion de **risque**, le poste de travail, les consignes au poste et ITaMaMi/QQOQCP, le dommage potentiel (vu ici sous le nom « dommage possible »), les mesures existantes au poste et la justification d'une mesure, le choix d'un risque et le retour au projet sont prévus en période 2 (séances 8 à 10 du plan), avec de vrais documents variés.
- Hors des notions du module C3 et à confirmer par M. Mecheri : les « familles de dangers » (séance 2) et la gravité du dommage (séance 3, question 5).
- Repérage sur une illustration : quand des zones se recouvrent, un point appartient toujours à la plus petite zone qui le contient (même règle dans l'exercice et dans l'évaluation).
- « Absence de danger » (s1) est gardé tel que dans le document 2 de M. Mecheri.
- Les cartes de vocabulaire rédigées par l'IA (« Les dommages ») ont été retirées : le lexique appartient à M. Mecheri. Les réponses proposées du carnet de bord sont à relire par lui.
- Les explications affichées après la correction sont gardées comme rétroaction en ligne.

## Avant diffusion
- Contrôle des évaluations (compétence `controler-cours`) ; lexique et auto-évaluation : M. Mecheri.
- Images : photos et illustrations réalisées pour le cours (Tableau, feuilles élèves) ; pictogrammes ARASAAC (CC BY-NC-SA, crédit en pied de page).
- Écarts volontaires avec le Tableau (référence PSE SOL-02 / SOL-07), séance 7 : l'information et la formation accompagnent toujours les autres mesures ; le panneau « sol glissant » n'est plus une protection collective.

## Audio optionnel — 3 novembre 2026
- Mode initial : **À la demande**. Les boutons d'écoute restent disponibles, y compris sur les cartes et propositions des exercices.
- Menu **Audio** sur chaque écran : questions et consignes, réponses et corrections, ou tout le contenu en automatique.
- **Arrêter** annule immédiatement la lecture et les lectures en attente. Une nouvelle consigne ou action peut déclencher la lecture suivante si le mode automatique reste activé.
- Réglage conservé sur cet ordinateur, séparément pour chaque code ; il ne modifie pas les résultats ni les données Firebase.
- Vérification navigateur Chrome à 375 px : 48 écrans, 37 exercices et 41 questions ; synthèse vocale simulée pour contrôler les déclenchements, les quatre modes, l'arrêt et la persistance. Le rendu sonore dépend des voix disponibles sur l'appareil.

## Activation du parcours illustré — 3 novembre 2026
- Accès élèves : https://mapse.fr/chef-doeuvre/#code, codes existants C1PSR. Aperçu professeur conservé séparément.
- Introduction : `s0-comprendre-illustre`, trois parties et huit questions /20. État local distinct de l’ancienne introduction pour ne pas réutiliser sa validation.
- Compatibilité Atelier installé : la nouvelle épreuve utilise le document existant `cdo-psr-2026-s0`, `module_id:s0`, colonne S0 « Le projet ». Le document distant antérieur reste jusqu’au passage de la nouvelle épreuve, qui le remplace ; pas de migration ni de suppression.
- Atelier : Centre en ligne → Synchroniser MAPSE → « Chef-d’œuvre — CAP PSR 1re année (C1PSR) ». Meilleure note, première note, essais ; hors moyennes PSE et Pronote.
- Transport testé sur données fictives et Firebase simulé ; aucune fausse note créée dans les données réelles. Première réception distante à constater après un vrai passage élève.

## Raccordement du 3 novembre 2026
- Parcours élèves complet : recherche de dangers, approfondissement optionnel et épreuve individuelle de cinq questions /20. Contenu/moteurs identiques à l’aperçu contrôlé.
- En fin d’épreuve, note de séance s1, première/meilleure notes et tentatives vers resultats/{code}/evaluations/cdo-psr-2026-s1 (source chef_doeuvre_psr). Le suivi JSON de séance contient recherches, réponses, aides et historiques.
- Atelier PSE : Centre en ligne → Chef-d’œuvre — CAP PSR. Réception automatique lorsque cet espace est ouvert, par écoute Firestore des seuls codes C1PSR. Notes séparées des notes PSE/Pronote ; volet Travail réalisé par élève. Si l’Atelier est fermé, les notes restent dans Firebase pour la prochaine ouverture. Synchroniser MAPSE reste disponible.
- PROF/ESSAI ne sont jamais envoyés ; validation de transmission effectuée sur transport simulé pour ne pas créer de fausse note dans les données réelles. Première réception d’une nouvelle note réelle à constater après passage élève.
