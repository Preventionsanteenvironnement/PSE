# Portfolio PSR — Guide de déploiement

## 1. Déploiement (production)

```bash
cd /Users/brahms/Documents/GitHub/PSE
git add psr/ ../CockpitPSE/cockpit_psr.html ../CockpitPSE/dashboard.html
git commit -m "Portfolio PSR : sync Firebase + cockpit + RGPD strict"
git push
```

GitHub Pages publie automatiquement `/psr/index.html` (côté élève) et le cockpit
côté `mapse.fr/CockpitPSE/`.

## 2. Tester en local

```bash
cd /Users/brahms/Documents/GitHub/PSE/psr
python3 -m http.server 8000
# puis http://localhost:8000/
```

Pour le cockpit :

```bash
cd /Users/brahms/Documents/GitHub/CockpitPSE
python3 -m http.server 8001
# puis http://localhost:8001/cockpit_psr.html
```

## 3. Ajouter / modifier un élève

Éditer `psr/data_eleves.js` (et idéalement aussi `CockpitPSE/data_eleves.js`
pour la prof). Format :

```js
{ userCode: "AB12", prenom: "...", nom: "...", classe: "CAP PSR 1A" }
```

Le `userCode` est la SEULE donnée envoyée vers Firebase. Le prenom/nom restent
LOCAUX (servent à afficher l'élève dans le cockpit, jamais persistés cloud côté
élève).

## 4. Accès enseignant (cockpit)

1. Aller sur `cockpit_psr.html` (ou via dashboard.html → bouton 🍱 Cockpit PSR)
2. Saisir le code `PROFPSE`
3. Tableau des élèves : progression chef-d'œuvre + formation PSR
4. Cliquer sur un élève → modale détail → modifier note/appréciation
5. La modification écrit dans `resultats/{userCode}/evaluations/{devoirId}`
   avec `{ merge: true }` ; l'élève voit la nouvelle note à la prochaine
   ouverture de `resultats.html` ou de son portfolio.

## 5. Mode offline (Firebase down)

`firebase_psr.js` détecte `navigator.onLine === false` ou un échec setDoc :

- Les notes (`saveEvaluation`) et copies (`saveCopie`) sont mises en file
  d'attente dans `localStorage["psr_pending_writes"]` (max 50 derniers).
- Le state portfolio (`savePortfolioState`) est sauvé dans
  `localStorage["psr_pending_state"]`.
- Au retour `online` (event `online` ou tick `setTimeout 2.5s`), on flush
  automatiquement.
- L'indicateur `#sync-indicator` passe en mode `offline` puis revient à
  `online` après synchro.

Aucune perte de travail tant que le navigateur n'est pas vidé.

## 6. Réinitialiser un élève

Côté Firestore (console Firebase) :

```
resultats/{userCode}/portfolio/state          ← state portfolio
resultats/{userCode}/evaluations/{devoirId}   ← notes
resultats/{userCode}/copies/{devoirId}_autoeval
```

Supprimer ces docs. L'élève redémarre avec un portfolio vide à sa prochaine
ouverture (le local lui restera tant qu'il ne vide pas son navigateur — pour
forcer un reset complet, lui demander de vider le localStorage du domaine).

## 7. Sécurité

- **`PROFPSE` en clair côté client** : acceptable car (a) aucune donnée
  critique n'est exposée — pas d'identités, pas de notes vie-scolaire, juste
  des évaluations PSR par `userCode` ; (b) GitHub Pages est statique, pas
  d'autre option simple ; (c) un attaquant qui devine le code peut au pire
  modifier des notes PSR — détectable et réversible.
- **Règles Firestore à durcir avant production** : exiger `request.auth` ou
  bloquer `delete` sur `resultats/*`. Aujourd'hui le projet `devoirs-pse` est
  ouvert en lecture/écriture (mode dev). Voir `firestore.rules`.
- **RGPD** : whitelist stricte sur `infos_eleve` côté `firebase_psr.js`. Aucun
  `nom`, `prenom`, `lycee`, `email`, `adresse`, `tel` ne quitte le poste
  élève. Test automatique :
  ```js
  PSR_FIREBASE._psrTestRGPD()
  ```
  à exécuter dans la console JS de `index.html`.

## 8. Architecture

```
psr/index.html
 ├─ data_eleves.js       (BDD locale, pas de réseau)
 ├─ auth.js              (login userCode → window.PSR_USER)
 ├─ firebase_psr.js      (module ESM, expose window.PSR_FIREBASE)
 │   ├─ saveEvaluation        — note finale jalon
 │   ├─ saveCopie             — réponses brutes
 │   ├─ savePortfolioState    — state debounced 5 s
 │   ├─ loadPortfolioState    — restore cross-device
 │   ├─ getEvaluation         — relire note
 │   ├─ flushPending          — rejouer file offline
 │   ├─ isAvailable           — db prête + online
 │   └─ _psrTestRGPD          — test console
 └─ app.js               (UI, sections, exports désactivés)
```

Le cockpit lit via `collectionGroup("evaluations")` filtré sur
`source == "psr_portfolio"`.
