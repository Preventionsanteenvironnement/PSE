# Français pas à pas — mode d’emploi pour le professeur

Section de mapse.fr pour s’entraîner au français **sans savoir lire** : tout se fait au toucher et à la voix, l’élève travaille seul.
Aucun compte, aucun envoi : les étoiles restent sur l’appareil (`localStorage`, clé `pas-a-pas-v1`). Page non indexée (`noindex`).

**Règle :** aucune étiquette d’élève visible (ni « allophone », ni « non lecteur », « FLE », « UPE2A »…), ni dans les titres, ni dans les adresses, ni dans la voix.

## Fichiers
- `index.html` — la seule page. Adresses internes : `#/` accueil, `#/e/<espace>` un espace, `#/x/<id>` un exercice.
- `moteur.js`, `moteur.css` — le moteur commun (ne pas toucher pour ajouter un exercice).
- `donnees.js` — **tous les exercices**. C’est le seul fichier à modifier.
- `images/` — tout est dans le dossier (autonome) :
  - `panneaux/` : panneaux ISO 7010 et pictogrammes SGH, Wikimedia Commons, domaine public (E010 en CC0) ;
  - `arasaac/` : pictogrammes ARASAAC (Sergio Palao, Gouvernement d’Aragon, CC BY-NC-SA), copiés depuis `apercu-bruit/images/` ;
  - `aliments/` : photos copiées depuis `lire_ecrire_cuisine/images/` (origine non documentée dans le dépôt).

## Ajouter un exercice
Dans `donnees.js`, ajouter un objet avec `add({...})`. Champs communs : `id` (unique), `espace` (`ecoute`, `lis`, `ecris`, `reconnais`, `vie`), `type`, `mot` (ce que dit la voix), `img` (image de la tuile).

| type | ce que fait l’élève | champs propres |
|---|---|---|
| `ecoute` | touche chaque image et l’entend | `items`, `montreMot: true` pour écrire le mot sous l’image |
| `choix` | entend un mot, touche la bonne image parmi 3 | `items` (au moins 3), `tours` |
| `paires` | memory | `items` (6 conseillés) |
| `tri` | met chaque image dans la bonne boîte | `boites` (`mot`, `img` ou `signe: 'oui'/'non'`, `groupe`), `items` avec `groupe` |
| `ordre` | touche les images dans l’ordre 1, 2, 3 | `items` dans le bon ordre |
| `intrus` | trouve l’image d’une autre famille parmi 4 | `groupes` (listes d’items), `tours` |
| `lien` | ouvre une page existante du site | `href` |

Un item = `{ img: 'images/…', mot: 'Ce que dit la voix' }`.
Un espace sans exercice n’apparaît pas (« Je lis » et « J’écris » attendent la liste de mots du professeur).
Après une modification, changer `?v=1` en `?v=2` dans `index.html` pour que les appareils rechargent.
