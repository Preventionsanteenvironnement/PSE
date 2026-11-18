# MaPSE Direct — prototype (nuit du 17 au 18/11/2026)

Branche Git : `mapse-direct` (dossier `~/Documents/GitHub/PSE-direct`). **Rien n'est commité, rien n'est poussé, rien n'est publié.** La branche `main` et mapse.fr en ligne sont inchangés.

## Les pages

| Page | Pour qui | Rôle |
| --- | --- | --- |
| `direct/index.html` | Élève | Entrée par code (4 caractères), puis code de séance (4 chiffres) ; une activité à la fois ; boutons Écouter, J'ai besoin d'aide, J'ai fini |
| `direct/prof.html` | Professeur | Lancer une séance, mosaïque des élèves, vue par question, fil des réponses, aide privée, validation, aménagements, bilan tableur |
| `direct/projection.html` | Tableau de la classe | Code de séance en grand, activité, résultats anonymes |
| `direct/telecommande.html` | Téléphone du professeur | Avancer, figer, rythme libre, projeter, mains levées, élèves bloqués |
| `index.html` (accueil) | Élèves | Nouveau bandeau « 📡 MAPSE DIRECT », sous « Mon espace » |

## Les fichiers

- `js/direct-store.js` : la liaison temps réel. Moteur **local** (navigateur seul) pour les essais. Même organisation que la future base Firebase : `seances/{id}`, `seances/{id}/eleves/{code}`, `seances/{id}/consignes/{code}`, `codes/{codeSeance}`.
- `js/direct-activites.js` : les types d'activités, construits une fois pour tous les modules : `etape`, `qcm`, `sondage`, `courte` (validée par le professeur), `classer` (tri), `processus` (apparition du dommage, en chaîne).
- `seances/catalogue.js` : les séances prêtes. Séance B4 CAP « Camille, serveuse » (7 activités) et une démonstration.
- `js/direct-simulation.js` : élèves fictifs pour voir le tableau de bord vivre (bouton « Lancer des élèves fictifs »).

## Essayer sur le Mac

Dans un terminal :

```bash
cd ~/Documents/GitHub/PSE-direct && python3 -m http.server 8080
```

**En ligne (Firebase, le fonctionnement normal depuis le 18/11/2026)**
1. Ouvrir `http://localhost:8080/direct/prof.html`, puis « Se connecter avec Google » avec le compte du professeur.
2. Lancer la séance : le code de séance s'affiche.
3. Ouvrir `http://127.0.0.1:8080/direct/index.html` (autre adresse, donc un autre « appareil »), puis taper un code prévu et le code de séance.

**Mode essai, sans Internet** : ajouter `?essai=1` à l'adresse (par exemple `prof.html?essai=1`). Tout reste dans le navigateur, et les élèves fictifs marchent. Pour revenir en ligne : `?essai=0`.

## Firebase (branché le 18/11/2026, avec l'accord de M. Mecheri)

- `js/direct-firebase.js` est chargé après `direct-store.js`. Il remplace le moteur local par Firestore (projet `devoirs-pse`, SDK 10.8.1), avec la même interface, plus `rejoindre`, `mesSeancesOuvertes` et `libererPlace`.
- **Connexions**
  - Élève : connexion anonyme Firebase (activée le 18/11/2026, comptes anonymes effacés après 30 jours), plus son code.
  - Professeur : son compte Google, le seul inscrit dans les règles. Le site le reconnaît en essayant une lecture réservée au professeur, sans que l'adresse soit écrite dans le code public. Le tableau de bord, la télécommande et la projection affichent une porte de connexion.
  - Domaine `mapse.fr` ajouté aux domaines autorisés de Firebase Authentication.
- **Collections** : `direct_codes/{code}`, `direct_seances/{id}`, avec ses sous-collections `eleves/{code}` et `consignes/{code}`. Les règles sont publiées le 18/11/2026, dans `~/Documents/MaPSE Direct/Règles Firebase/`.
- **Une case d'élève appartient à l'appareil qui l'a créée.**
  - Le même code sur un autre appareil est refusé.
  - Dans le tableau de bord, le professeur peut cliquer « 🔓 Libérer sa place ». Les réponses de cette séance sont alors effacées.
- **Présence**
  - Un signe de vie toutes les 25 s ; « connecté » = un signe depuis moins de 75 s.
  - Elle est datée à la réception, sur l'appareil du professeur : les horloges des élèves peuvent être décalées.
  - Coût : 25 élèves ≈ 3 600 écritures par heure. Le quota gratuit est de 20 000 écritures par jour.
- **Élèves fictifs** : en mode essai seulement.

**Essai complet réussi le 18/11/2026** (localhost, codes fictifs, séance d'essai ensuite effacée) :
- création de la séance, puis entrée de l'élève AB12 avec pseudo et avatar ;
- réponse au sondage et main levée, vues en direct ;
- « J'arrive » : le message est reçu et la main se baisse ;
- passage de la classe à l'étape suivante ;
- le même code sur un autre appareil est refusé ; « Libérer sa place » permet ensuite de revenir ;
- un élève qui tente de piloter la séance ou d'écrire la consigne d'un autre est refusé (permission-denied) ;
- fin de séance : l'élève voit l'écran de fin.

**Publié sur mapse.fr le 18/11/2026**, avec l'accord de M. Mecheri. **Pas encore fait** : essai avec une vraie classe, relecture du contenu de la séance B4 par M. Mecheri, et le tableau de bord dans l'Atelier (plan, étape B).

## Contenus

La séance B4 reprend la situation de l'escape game (Camille, 92 dB(A), 8 h). Les seuils viennent de l'évaluation contrôlée : 85 dB(A) = « à partir de », contrôle du port des protecteurs. **Relecture de M. Mecheri nécessaire avant tout usage en classe.** Les pictogrammes sont ARASAAC (CC BY-NC-SA, Sergio Palao) : citer la licence sur la page avant publication.
