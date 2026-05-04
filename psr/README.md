# PSR — Portfolio Chef-d'œuvre (CAP PSR)

Portfolio numérique pédagogique pour le chef-d'œuvre du **CAP Production et Service en Restaurations**, intégré au site PSE de M. MECHERI.

## 🔒 Conformité RGPD

Cette version **ne stocke aucune donnée nominative** :

- ❌ Pas de nom, pas de prénom, pas de nom de lycée demandés.
- ✅ L'élève s'identifie uniquement avec son **code élève Data Élèves** (4 caractères du type `XX99`).
- ✅ Le code donne accès à la classe, sans donnée personnelle (voir `data_eleves.js`).
- ✅ Code spécial `PROFPSE` = mode enseignant.
- ✅ Le `localStorage` est suffixé par le code, pour que plusieurs élèves puissent utiliser le même navigateur sans collision.

## 📁 Structure des fichiers

```
psr/
├── index.html                    Portfolio (entrée principale)
├── auth.js                       Écran de login userCode
├── data_eleves.js                Base élèves (code + classe seulement)
├── style.css                     Mise en forme
├── app.js                        Logique pédagogique principale
├── banque_images.js              Index des images de ressources_eco/
├── ressources_perso.js           Ressources personnalisables enseignant
├── audit_cuisine_pro.html        Exercice : audit ED 6007
├── mission_anti_contamination.html  Jeu : marche en avant
├── service_du_midi.html          Jeu : gestion d'un service
├── Assiette_Equilibree.html      Outil : composeur d'assiette
├── correction.html               Outil enseignant : correction
├── evaluer.html                  Outil enseignant : évaluation
├── apercu_attestation.html       Aperçu attestation
├── apercu_grille.html            Aperçu grille d'évaluation
├── fiche_eleve_procedure.html    Procédure pour l'élève
└── ressources_eco/
    ├── fiches/                   📋 Fiches HTML pédagogiques
    │   ├── style_fiche.css
    │   ├── fiche_pnns.html
    │   ├── fiche_legumineuses.html
    │   ├── fiche_loi_agec.html
    │   ├── fiche_lois_gaspi.html
    │   ├── fiche_campagne_antigaspi.html
    │   ├── fiche_astuces_antigaspi.html
    │   ├── fiche_circuit_court.html
    │   ├── fiche_bio_local_circuit.html
    │   ├── fiche_circuit_sanitaire.html
    │   ├── fiche_emballages_plastique.html
    │   ├── fiche_pollution_decret.html
    │   ├── fiche_pollution_plastique.html
    │   └── fiche_dlc_ddm.html
    └── (sous-dossiers d'images : légumes, fruits, viandes, labels, etc.)
```

## 🚀 Lancer

Ouvrir `index.html` dans un navigateur moderne. Compatible **GitHub Pages** (zéro dépendance externe, zéro CDN).

L'élève saisit son code → la classe s'affiche → le portfolio se charge.

## 🎯 Sections pédagogiques

1. **Accueil** — présentation du chef-d'œuvre
2. **Ma fiche** — classe + projet (sans nom)
3. **Comprendre** — qu'est-ce que le chef-d'œuvre
4. **Équilibre** — règle ½ ¼ ¼, groupes alimentaires, PNNS
5. **Éco-responsable** — gaspillage, circuit court, emballages
6. **Repas équilibré** — composer son menu
7. **Étiquetage** — DLC/DDM, allergènes, traçabilité (INCO)
8. **Mon menu** — projet final

## 📋 Fiches ressources élèves

Les **anciens PDFs ministère** (peu lisibles pour des élèves de 15-16 ans) ont été remplacés par **10 fiches HTML adaptées** :

| Thème | Fiches |
|-------|--------|
| 🥦 Nutrition | PNNS · Légumineuses |
| 🚯 Anti-gaspi | Loi AGEC · Lois anti-gaspi · Campagne · Astuces |
| 🚜 Circuit court | Circuit court · Bio/local/circuit · Hygiène circuit court |
| ♻️ Emballages | Empreinte plastique · Décret plastiques · Pollution chiffres |
| 📅 Étiquetage | DLC/DDM |

Chaque fiche : **1 page**, **« L'essentiel en 4 points »**, vocabulaire simple, source officielle citée. Imprimable.

## 💾 Sauvegarde / Export

- **Enregistrer** : auto-save dans le `localStorage` du navigateur.
- **Exporter JSON** : un fichier `.json` contenant le portfolio (sans donnée personnelle).
- **Importer JSON** : remplace l'état courant.
- **Imprimer le dossier final** ou **la synthèse orale** : génération HTML imprimable.
- **Se déconnecter** : efface la session, garde les données en local.

❌ Plus d'export Word (retiré pour simplification + RGPD).

## 👨‍🏫 Mode enseignant

Code `PROFPSE` à la connexion → accès au mode enseignant (validation des épreuves, commentaires, notes).

## 🎮 Mini-jeux pédagogiques

- **Mission Anti-Contamination** : marche en avant en cuisine.
- **Service du Midi** : gestion temps réel d'un service à emporter.
- **Audit Cuisine Pro** : 4 exercices sur l'INRS ED 6007.

Ces jeux demandent eux aussi le code élève (RGPD).

## 🔧 Pour modifier le contenu pédagogique

La progression est décrite dans la constante **`SECTIONS_SCHEMA`** en haut de `app.js`.

Types de champs supportés : `text`, `textarea`, `number`, `date`, `checkbox`, `select`, `checklist`, `photo_profil`.

Les portfolios existants se mettent à jour automatiquement à l'ouverture (fusion avec le schéma courant).

## ⚠️ Limites connues

- L'authentification par code est **client-side** : elle dépend de la présence du code dans `data_eleves.js`. C'est suffisant pour un usage scolaire local, mais ne constitue pas une protection forte.
- Les photos volumineuses peuvent alourdir le JSON.
- Le mode enseignant est purement applicatif (pas de session sécurisée).

## 📅 Versions

- **V4.84** — Migration vers PSE (RGPD), suppression export Word, fiches HTML
- **V4.83** — Bilans, météo des émotions, sondages
- **V4.x** — Voir l'historique git
