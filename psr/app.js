/* =====================================================================
   Portfolio Chef-d'œuvre CAP — app.js (V2)
   ---------------------------------------------------------------------
   Modifications V2 (par rapport à V1) :
     - Chaque section du schéma porte désormais trois champs pédagogiques :
         consigne  : ce que l'élève doit faire
         production: ce qu'il doit produire
         attentes  : ce que l'enseignant attend
       → affichés dans un encart visible en haut de chaque section.
     - Nouvelles vues dans la zone principale :
         "oral-summary"  : Synthèse orale finale (8 grandes parties)
         "teacher-recap" : Tableau récapitulatif enseignant avec filtres
     - Export "Dossier final" imprimable : page de garde + identité +
       sommaire + sections numérotées + synthèse orale + annexes photos.
     - Photos : redimensionnement + compression JPEG côté navigateur
       avant stockage (canvas). Miniature conservée.
   ---------------------------------------------------------------------
   COMMENT AJOUTER UNE SECTION
     Ajouter un objet dans SECTIONS_SCHEMA avec, au minimum :
       { id, titre, description,
         pedago: { consigne, production, attentes },
         fields: [ { id, label, type, hint? } ] }
   ===================================================================== */

/* =====================================================================
   1. CONSTANTES
   ===================================================================== */

const APP_VERSION = "4.84.0";
/* RGPD : la clé localStorage est suffixée par le userCode pour que chaque
   élève sur le même navigateur ait son propre portfolio sans collision. */
const STORAGE_KEY_BASE = "portfolio_cap_chef_doeuvre";
const STORAGE_KEY = (() => {
  const code = (window.PSR_USER && window.PSR_USER.userCode) || "";
  return code ? STORAGE_KEY_BASE + "_" + code : STORAGE_KEY_BASE;
})();
const AUTOSAVE_DELAY_MS = 1200;

/* Redimensionnement / compression photos */
const PHOTO_MAX_WIDTH = 1280;
const PHOTO_MAX_HEIGHT = 1280;
const PHOTO_JPEG_QUALITY = 0.75;

/* Seuil de remplissage minimum (ratio de champs non vides) en dessous
   duquel une section marquée "terminée" est signalée comme peu remplie. */
const MIN_COMPLETENESS = 0.4;

/* Champs de la section "identite" qui alimentent state.infos_eleve.
   RGPD : nom/prenom/lycee retirés. Le code élève + classe viennent de PSR_USER (auth.js). */
const IDENTITE_SYNC = ["classe", "annee_scolaire", "titre_dossier"];

/* V4.14 — Portfolio démo intégré (Marie DURAND) pour aperçu rapide. */
const DEMO_PORTFOLIO_JSON = `{"meta":{"app_version":"4.13.0","projet_titre":"Chef-d'œuvre : concevoir un repas ou menu équilibré et éco-responsable","date_creation":"2025-09-15T08:30:00.000Z","date_derniere_modification":"2026-04-26T15:42:00.000Z","date_dernier_export":"2026-04-26T15:42:00.000Z"},"infos_eleve":{"userCode":"DEMO","classe":"CAP PSR — 1re année","annee_scolaire":"2025-2026","titre_dossier":"Mon bowl bio et de saison à emporter","nom":"","prenom":"","lycee":""},"progression":{"pourcentage_global":73,"sections_terminees":6,"sections_validees":4},"sections":[{"id":"accueil","statut_eleve":"done","statut_enseignant":"validated","date_maj":"2025-09-29T10:15:00.000Z","date_validation":"2025-10-05","champs":[{"id":"titre_projet","valeur":"Concevoir un repas ou menu équilibré et éco-responsable"},{"id":"objectif","valeur":"Apprendre à concevoir un repas équilibré et respectueux de l'environnement, à le présenter à un client et à le défendre lors d'un oral en juin 2027."},{"id":"comprendre","valeur":"Le chef-d'œuvre, c'est un grand projet de fin de CAP qui dure 2 ans. À la fin, je présenterai mon projet pendant 10 minutes devant deux profs."},{"id":"capacite_finale","valeur":"Concevoir un menu équilibré et éco-responsable à emporter, le présenter et le défendre à l'oral."},{"id":"duree","valeur":"2 ans (de septembre 2025 à juin 2027)"}],"preuves":[]},{"id":"identite","statut_eleve":"done","statut_enseignant":"validated","date_maj":"2025-09-22T09:05:00.000Z","date_validation":"2025-09-29","champs":[{"id":"classe","valeur":"CAP PSR — 1re année"},{"id":"annee_scolaire","valeur":"2025-2026"},{"id":"titre_dossier","valeur":"Mon bowl bio et de saison à emporter"},{"id":"valeurs","valeur":["Respect","Entraide","Persévérance","Créativité","Bienveillance"]},{"id":"qualites","valeur":["Organisée","Soigneuse","Motivée","Patiente","Méthodique"]},{"id":"interets","valeur":["Cuisine","Pâtisserie","Lecture","Nature","Animaux"]},{"id":"pourquoi_cap","valeur":"J'ai choisi ce CAP parce que j'aime cuisiner depuis toute petite avec ma grand-mère. J'aimerais plus tard ouvrir mon propre restaurant éco-responsable, où on cuisinerait avec des produits locaux et de saison."},{"id":"projet_apres","valeur":"Continuer en bac professionnel restauration puis ouvrir un food-truck bio à Lyon, avec des plats simples mais sains."}],"preuves":[]},{"id":"comprendre","statut_eleve":"done","statut_enseignant":"validated","date_maj":"2025-10-13T11:30:00.000Z","date_validation":"2025-10-20","champs":[{"id":"compris","valeur":"Le chef-d'œuvre, c'est un projet concret que je vais mener pendant 2 ans. Ça doit être lié à mon métier. À la fin, je présenterai mon projet à l'oral pendant 10 minutes."},{"id":"reussir","valeur":"Je dois réussir à concevoir un menu équilibré et éco-responsable à emporter, et savoir le défendre devant un jury."},{"id":"important","valeur":"Ce qui me paraît le plus important, c'est d'avancer étape par étape sans me décourager, et d'apprendre à argumenter mes choix."}],"module_state":{"qcm_answers":{"q1":2,"q2":1,"q3":2,"q4":1,"q5":1,"q6":1,"q7":1,"q8":2},"qcm_score":8,"qcm_total":8,"qcm_completed":true,"exercice_order":["e1","e2","e3","e4","e5","e6"],"exercice_ok":true,"ressources_lues":{"r_mapse_j1":"2025-10-06T14:00:00.000Z"},"epreuve_state":{"reponses":{"ep1":2,"ep2":1,"ep3":1,"ep4":1,"ep5":["démarche","présentation"],"ep6":["repas équilibré","éco-responsable"],"ep7":"Le chef-d'œuvre c'est un projet concret qu'on fait sur 2 ans en lien avec notre métier. À la fin on doit le présenter à l'oral pour montrer ce qu'on a appris.","ep8":"Il y a une note pendant les 2 ans (50%) et une note à l'oral final (50%).","ep9":"Si je n'y arrive pas du premier coup, je peux recommencer. C'est normal de se tromper, on corrige et on apprend."},"validations":{"ep7":{"state":"ok","commentaire":"Très bonne réformulation, vocabulaire juste. Bon travail.","modifie_le":"2025-10-20T14:00:00.000Z"},"ep8":{"state":"ok","commentaire":"Bonne réponse, claire et précise.","modifie_le":"2025-10-20T14:00:00.000Z"},"ep9":{"state":"ok","commentaire":"Bonne posture, c'est exactement la démarche attendue.","modifie_le":"2025-10-20T14:00:00.000Z"}},"validation_finale":{"state":"validee","enseignant":"Mme Lefèvre","commentaire":"Très bonne épreuve, Marie a bien compris l'esprit du chef-d'œuvre.","date":"2025-10-20T14:30:00.000Z"},"note_brute":22,"note_max":22,"note_sur_20":20,"date":"2025-10-13","tentative":1}},"preuves":[]},{"id":"equilibre","statut_eleve":"done","statut_enseignant":"validated","date_maj":"2026-01-19T10:30:00.000Z","date_validation":"2026-01-26","champs":[{"id":"appris","valeur":"J'ai appris qu'il y a 7 groupes d'aliments différents, et que chaque constituant alimentaire (protides, glucides, lipides…) joue un rôle précis dans le corps. Et la règle ½ ¼ ¼ pour bien composer une assiette."},{"id":"retiens","valeur":"Quand je vais composer mon menu, je vais penser à mettre la moitié de mon assiette en légumes, un quart de féculents et un quart de protéines."},{"id":"mon_assiette","valeur":"Une assiette équilibrée pour mon menu : salade de carottes râpées (½), riz aux légumes (¼), lentilles (¼), avec un yaourt nature et une pomme bio en dessert."}],"module_state":{"qcm_answers":{"q1":2,"q2":1,"q3":1,"q4":1,"q5":2,"q6":1,"q7":2,"q8":2,"q9":1,"q10":1},"qcm_score":10,"qcm_total":10,"qcm_completed":true,"ressources_lues":{"r_pnns":"2026-01-12T13:30:00.000Z","r_lentilles":"2026-01-19T10:15:00.000Z"},"epreuve_state":{"reponses":{"ep1":2,"ep2":1,"ep3":1,"ep4":1,"ep5":1,"ep6":1,"ep7":2,"ep8":1,"ep9":2,"ep10":1},"validations":{},"validation_finale":{"state":"validee","enseignant":"Mme Lefèvre","commentaire":"Marie maîtrise les notions, bonne épreuve.","date":"2026-01-26T14:00:00.000Z"},"note_brute":9,"note_max":10,"note_sur_20":18,"date":"2026-01-19","tentative":1}},"preuves":[]},{"id":"eco_responsable","statut_eleve":"done","statut_enseignant":"validated","date_maj":"2026-03-30T14:25:00.000Z","date_validation":"2026-04-06","champs":[{"id":"gaspillage","valeur":"Pour éviter le gaspillage je vais cuisiner uniquement les quantités prévues, utiliser les épluchures de carottes pour faire un bouillon, et vendre mon menu seulement à la commande."},{"id":"packaging","valeur":"Je vais utiliser un bol en carton recyclable avec un couvercle compostable, et une cuillère en bois."},{"id":"packaging_lieu","valeur":"Magasin de fournitures bio La Vie Claire à Lyon ou commande chez VegWare."},{"id":"fournisseurs","valeur":[{"id":"f1","produit":"Carottes","lieu":"Marché de la Croix-Rousse à Lyon","saison":"Oui","circuit":"Oui (au plus 1 intermédiaire)","label":"Producteur local"},{"id":"f2","produit":"Lentilles vertes","lieu":"AMAP Lyon 7","saison":"Oui","circuit":"Oui (au plus 1 intermédiaire)","label":"AOP Lentille verte du Puy"},{"id":"f3","produit":"Pommes Reinettes","lieu":"Verger des Monts du Lyonnais","saison":"Oui","circuit":"Oui (au plus 1 intermédiaire)","label":"AB"},{"id":"f4","produit":"Riz semi-complet","lieu":"Magasin bio La Vie Claire","saison":"À vérifier","circuit":"Non","label":"AB"}]}],"module_state":{"qcm_answers":{"q1":1,"q2":2,"q3":1,"q4":2,"q5":0,"q6":2,"q7":1,"q8":1,"q9":1,"q10":1,"q11":3,"q12":1},"qcm_score":11,"qcm_total":12,"qcm_completed":true,"ressources_lues":{"r_loi_agec":"2026-02-23T14:30:00.000Z","r_lois_gaspi":"2026-02-23T14:45:00.000Z","r_circuit_def":"2026-03-09T13:30:00.000Z","r_video_ademe":"2026-03-02T13:15:00.000Z"},"epreuve_state":{"reponses":{"ep1":2,"ep2":1,"ep3":2,"ep4":1,"ep5":["AB","Label Rouge","AOP"],"ep6":["carton","verre"],"ep7":"Les poivrons ne poussent pas en hiver à Lyon. Donc en décembre ils viennent d'Espagne ou du Maroc, en avion ou en serre chauffée. Ça pollue beaucoup et c'est plus cher.","ep8":"Faire des portions adaptées et utiliser les restes (épluchures pour bouillon, pain rassis pour croûtons).","ep9":"Je choisis un emballage en carton recyclable et un couvercle en bioplastique compostable. Comme ça l'emballage peut être recyclé ou composté à la fin, ce qui est conforme à la loi AGEC."},"validations":{"ep7":{"state":"ok","commentaire":"Très bon raisonnement, exemples concrets et bien argumenté.","modifie_le":"2026-04-06T14:30:00.000Z"},"ep8":{"state":"ok","commentaire":"Idée juste et concrète. Bon travail.","modifie_le":"2026-04-06T14:30:00.000Z"},"ep9":{"state":"ok","commentaire":"Excellente argumentation, mention de la loi AGEC très pertinente.","modifie_le":"2026-04-06T14:30:00.000Z"}},"validation_finale":{"state":"validee","enseignant":"Mme Lefèvre","commentaire":"Marie a parfaitement intégré les notions d'éco-responsabilité, bonne épreuve.","date":"2026-04-06T15:00:00.000Z"},"note_brute":21,"note_max":22,"note_sur_20":19,"date":"2026-03-30","tentative":1}},"preuves":[]},{"id":"repas_equilibre","statut_eleve":"done","statut_enseignant":"none","date_maj":"2026-04-13T11:00:00.000Z","champs":[{"id":"entree","valeur":"Salade de carottes râpées au citron et persil"},{"id":"plat","valeur":"Bowl de riz semi-complet aux lentilles vertes du Puy AOP, avec poireaux braisés et œuf mollet"},{"id":"dessert","valeur":"Pomme Reinette bio du verger local, cuite à la cannelle"},{"id":"laitage","valeur":"Yaourt nature de la ferme du Mont d'Or"},{"id":"boisson","valeur":"Eau plate"},{"id":"equilibre_global","valeur":"Mon repas respecte la règle ½ ¼ ¼ : la moitié du bol est en légumes (carottes + poireaux), un quart en féculents (riz semi-complet) et un quart en protéines (lentilles + œuf)."},{"id":"justification","valeur":"Les carottes et les poireaux apportent les vitamines et les fibres. Le riz semi-complet donne l'énergie nécessaire pour la journée (glucides). Les lentilles et l'œuf apportent les protéines (bâtisseurs du corps). Le yaourt complète avec du calcium pour les os."},{"id":"regle","valeur":"Règle ½ ¼ ¼ avec un produit laitier en complément, un fruit en dessert et un verre d'eau."}],"preuves":[]},{"id":"etiquetage","statut_eleve":"done","statut_enseignant":"validated","date_maj":"2026-04-20T10:45:00.000Z","date_validation":"2026-04-26","champs":[{"id":"design_general","valeur":"Étiquette en papier kraft recyclé avec encres végétales. Couleurs naturelles (vert et beige). Petit dessin d'une pomme stylisée en haut. Logo AB visible."},{"id":"etiquettes","valeur":[{"id":"et1","nom_produit":"Bowl bio de Marie","slogan":"Le bon goût des produits de saison","type_date":"DLC (à consommer jusqu'au)","date":"2026-04-21","poids":"350 g","ingredients":"Carottes BIO, riz semi-complet BIO, lentilles vertes du Puy AOP, poireaux BIO, œuf, yaourt nature, citron, persil, sel, poivre, huile d'olive.","allergenes":"ŒUF, LAIT (yaourt). Peut contenir des traces de GLUTEN.","tracabilite":"Carottes : Marché Croix-Rousse, Lyon. Lentilles : AMAP Lyon 7. Riz : La Vie Claire, Lyon. Œufs : Ferme du Mont d'Or, Limonest. Yaourt : Ferme du Mont d'Or, Limonest.","conservation":"À conserver entre 0 °C et 4 °C. À consommer dans les 24 heures."},{"id":"et2","nom_produit":"Pomme Reinette cuite","slogan":"Le dessert simple, local et de saison","type_date":"DLC (à consommer jusqu'au)","date":"2026-04-21","poids":"150 g","ingredients":"Pomme Reinette BIO du verger local, cannelle, miel local.","allergenes":"Aucun allergène majeur.","tracabilite":"Pomme : Verger des Monts du Lyonnais. Miel : Apiculteur de Mornant.","conservation":"À conserver au frais. Se déguste tiède."}]}],"module_state":{"qcm_answers":{"q1":2,"q2":1,"q3":0,"q4":1,"q5":1,"q6":1,"q7":2,"q8":1,"q9":1,"q10":1},"qcm_score":10,"qcm_total":10,"qcm_completed":true,"ressources_lues":{"r_dlc_ddm":"2026-04-13T13:00:00.000Z"},"epreuve_state":{"reponses":{"ep1":2,"ep2":1,"ep3":2,"ep4":2,"ep5":["nom du produit","ingrédients","DLC"],"ep6":["œuf","lait"],"ep7":"Sur mon dessert au yaourt je mets une DLC parce que c'est un produit frais à base de lait, donc périssable. Si on dépasse la date, ça peut rendre malade.","ep8":"La traçabilité c'est savoir d'où vient un produit, qui l'a fait et quand. Ça sert à pouvoir le retirer du marché s'il y a un problème, et ça rassure le client.","ep9":"Pour rendre mon étiquette vendeuse, je mets un nom accrocheur (« Bowl bio de Marie »), une jolie illustration de pomme, et le logo AB bien visible."},"validations":{"ep7":{"state":"ok","commentaire":"Bonne distinction DLC/DDM, justification claire.","modifie_le":"2026-04-26T15:00:00.000Z"},"ep8":{"state":"ok","commentaire":"Très bonne définition + utilité bien expliquée.","modifie_le":"2026-04-26T15:00:00.000Z"},"ep9":{"state":"ok","commentaire":"3 éléments vendeurs, bien.","modifie_le":"2026-04-26T15:00:00.000Z"}},"validation_finale":{"state":"validee","enseignant":"M. Bertrand","commentaire":"Marie a bien intégré la réglementation INCO, étiquette conforme.","date":"2026-04-26T15:30:00.000Z"},"note_brute":22,"note_max":22,"note_sur_20":20,"date":"2026-04-20","tentative":1}},"preuves":[]},{"id":"mon_menu","statut_eleve":"in_progress","statut_enseignant":"none","date_maj":"2026-04-26T15:42:00.000Z","champs":[{"id":"nom_menu","valeur":"Bowl bio de Marie"},{"id":"description","valeur":"Un bol complet à emporter, cuisiné avec uniquement des produits bio, de saison et locaux : carottes du marché, lentilles de l'AMAP, riz bio, poireaux du potager, œuf et yaourt de la ferme du Mont d'Or. En dessert, une pomme cuite du verger local."},{"id":"pourquoi_plats","valeur":"J'ai choisi ces plats parce qu'ils sont équilibrés (½ légumes, ¼ féculents, ¼ protéines), simples à cuisiner, bons à manger même tiède, et tous les ingrédients sont disponibles à Lyon en avril."},{"id":"equilibre","valeur":"Mon menu est équilibré : la moitié de l'assiette est en légumes (carottes + poireaux), un quart en féculents (riz semi-complet) et un quart en protéines (lentilles + œuf). Le yaourt apporte le calcium et la pomme la vitamine C."},{"id":"eco","valeur":"Mon menu est éco-responsable : tous les ingrédients sont de saison à Lyon en avril, achetés en circuit court (marché, AMAP, ferme), avec des labels (AB et AOP). L'emballage est en carton recyclable. Pas de gaspillage : portions calibrées et restes utilisés."},{"id":"points_forts","valeur":"Repas complet, savoureux, économique (entre 4 et 5 € le bol), et 100 % traçable. Les clients voient d'où viennent leurs aliments."},{"id":"ameliorations","valeur":"Je pourrais varier les légumes selon la saison (en été : courgettes, tomates, basilic). Je pourrais aussi proposer une version végane sans œuf ni yaourt."}],"preuves":[]}],"evaluations":[{"jalon_id":"j1_comprendre","source":"epreuve_auto","criteres":[{"id":"Connaissance des modalités du chef-d'œuvre","label":"Connaissance des modalités du chef-d'œuvre","capacite":"Connaître le cadre officiel du chef-d'œuvre et ses modalités.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Connaissance du projet de l'année","label":"Connaissance du projet de l'année","capacite":"Identifier et nommer le projet personnel mené dans le cadre du chef-d'œuvre.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Connaissance des capacités évaluées à l'oral","label":"Connaissance des capacités évaluées à l'oral","capacite":"Identifier ce qui est attendu et évalué à l'oral final.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Capacité à expliquer le chef-d'œuvre avec ses mots","label":"Capacité à expliquer le chef-d'œuvre avec ses mots","capacite":"Reformuler une notion scolaire en langage courant compréhensible.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Connaissance des règles d'évaluation et du droit à l'erreur","label":"Connaissance des règles d'évaluation et du droit à l'erreur","capacite":"Comprendre l'évaluation du chef-d'œuvre et adopter une posture de progression.","niveau":"M","note":4,"max":4,"remediation":null}],"note_totale":20,"commentaire":"Évaluation produite automatiquement par l'épreuve d'attestation. Validée par Mme Lefèvre.","date":"2025-10-13","enseignant":"Mme Lefèvre"},{"jalon_id":"j2_repas_equilibre","source":"epreuve_auto","criteres":[{"id":"Connaissance des groupes alimentaires","label":"Connaissance des groupes alimentaires","capacite":"Connaître et différencier les 7 groupes alimentaires.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Connaissance des constituants et de leurs rôles","label":"Connaissance des constituants et de leurs rôles","capacite":"Identifier les constituants alimentaires et expliquer leur rôle pour la santé.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Application de la règle ½ légumes / ¼ féculents / ¼ protéines","label":"Application de la règle ½ légumes / ¼ féculents / ¼ protéines","capacite":"Composer une assiette équilibrée selon la règle ½ ¼ ¼.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Capacité d'analyse et de proposition d'amélioration","label":"Capacité d'analyse et de proposition d'amélioration","capacite":"Analyser un menu existant, repérer le déséquilibre et proposer une amélioration concrète.","niveau":"A","note":3,"max":4,"remediation":null},{"id":"Vocabulaire technique et argumentation","label":"Vocabulaire technique et argumentation","capacite":"Utiliser le vocabulaire de la nutrition et argumenter un choix alimentaire.","niveau":"M","note":4,"max":4,"remediation":null}],"note_totale":18,"commentaire":"Évaluation produite automatiquement par l'épreuve d'attestation. Validée par Mme Lefèvre.","date":"2026-01-19","enseignant":"Mme Lefèvre"},{"jalon_id":"j3_eco_responsable","source":"epreuve_auto","criteres":[{"id":"Connaissance du gaspillage alimentaire et des moyens de lutte","label":"Connaissance du gaspillage alimentaire et des moyens de lutte","capacite":"Identifier l'ampleur du gaspillage alimentaire et proposer des actions concrètes.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Maîtrise des dates DLC / DDM","label":"Maîtrise des dates DLC / DDM","capacite":"Lire et interpréter correctement les dates de consommation indiquées sur les produits.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Saisonnalité et circuits courts","label":"Saisonnalité et circuits courts","capacite":"Choisir des produits de saison et favoriser les circuits courts.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Connaissance des labels officiels","label":"Connaissance des labels officiels","capacite":"Reconnaître les labels officiels et expliquer ce qu'ils certifient.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Choix d'emballages éco-responsables","label":"Choix d'emballages éco-responsables","capacite":"Choisir un emballage à faible impact environnemental et justifier ce choix.","niveau":"A","note":3,"max":4,"remediation":null}],"note_totale":19,"commentaire":"Évaluation produite automatiquement par l'épreuve d'attestation. Validée par Mme Lefèvre.","date":"2026-03-30","enseignant":"Mme Lefèvre"},{"jalon_id":"j4_etiquetage","source":"epreuve_auto","criteres":[{"id":"Connaissance des mentions obligatoires (règlement INCO)","label":"Connaissance des mentions obligatoires (règlement INCO)","capacite":"Identifier et lister les informations obligatoires sur une étiquette alimentaire.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Maîtrise des allergènes (14 allergènes majeurs)","label":"Maîtrise des allergènes (14 allergènes majeurs)","capacite":"Identifier les allergènes majeurs et les présenter de manière conforme.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Maîtrise des dates DLC / DDM appliquée à l'étiquetage","label":"Maîtrise des dates DLC / DDM appliquée à l'étiquetage","capacite":"Choisir la bonne mention de date selon la nature du produit.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Compréhension de la traçabilité","label":"Compréhension de la traçabilité","capacite":"Définir la traçabilité et identifier ses enjeux.","niveau":"M","note":4,"max":4,"remediation":null},{"id":"Présentation vendeuse et cohérence éco-responsable","label":"Présentation vendeuse et cohérence éco-responsable","capacite":"Concevoir une étiquette vendeuse et cohérente avec la démarche éco-responsable.","niveau":"M","note":4,"max":4,"remediation":null}],"note_totale":20,"commentaire":"Évaluation produite automatiquement par l'épreuve d'attestation. Validée par M. Bertrand.","date":"2026-04-20","enseignant":"M. Bertrand"}]}`;


/* V3 : années scolaires du chef-d'œuvre */
const ANNEES = {
  A1:   { code: "A1",   label: "Année 1 (2025-2026)", short: "A1" },
  A2:   { code: "A2",   label: "Année 2 (2026-2027)", short: "A2" },
  both: { code: "both", label: "Sur les 2 ans",       short: "A1-A2" },
};

/* V3 : jalons notés. Chaque jalon porte ses critères et son barème.
   Les notes sont stockées dans state.evaluations (voir buildDefaultState). */
const JALONS = [
  {
    id: "j1_comprendre",
    titre: "Jalon 1 — Comprendre le chef-d'œuvre",
    annee: "A1",
    consigne: "L'élève présente ce qu'il a compris du chef-d'œuvre et ses attentes.",
    sections: ["accueil", "comprendre"],
    criteres: [
      { id: "c1", label: "Compréhension du projet et des attentes",             max: 5 },
      { id: "c2", label: "Capacité à dire ce qu'il faudra savoir faire",        max: 5 },
      { id: "c3", label: "Vocabulaire clair et juste",                          max: 5 },
      { id: "c4", label: "Remplissage soigné et complet",                       max: 5 },
    ],
  },
  {
    id: "j2_repas_equilibre",
    titre: "Jalon 2 — Présentation d'un repas équilibré",
    annee: "A1",
    consigne: "L'élève construit un repas équilibré (½ légumes, ¼ féculents, ¼ protéines) et le justifie.",
    sections: ["equilibre", "repas_equilibre"],
    criteres: [
      { id: "c1", label: "Respect de la règle ½ légumes / ¼ féculents / ¼ protéines", max: 5 },
      { id: "c2", label: "Justification nutritionnelle",                               max: 5 },
      { id: "c3", label: "Cohérence entrée / plat / (laitage) / dessert",              max: 5 },
      { id: "c4", label: "Présentation soignée et complète",                           max: 5 },
    ],
  },
  {
    id: "j3_eco_responsable",
    titre: "Jalon 3 — Repas équilibré ET éco-responsable",
    annee: "A1",
    consigne: "L'élève intègre saisonnalité, circuits courts et lutte contre le gaspillage.",
    sections: ["eco_responsable", "mon_menu"],
    criteres: [
      { id: "c1", label: "Produits de saison identifiés",              max: 4 },
      { id: "c2", label: "Circuit court / filière de proximité",       max: 4 },
      { id: "c3", label: "Lutte contre le gaspillage",                 max: 4 },
      { id: "c4", label: "Arguments nutritionnels maintenus",          max: 4 },
      { id: "c5", label: "Cohérence globale du menu",                  max: 4 },
    ],
  },
  {
    id: "j4_etiquetage",
    titre: "Jalon 4 — Étiquetage du produit",
    annee: "A1",
    consigne: "L'élève produit une étiquette conforme et vendeuse.",
    sections: ["etiquetage"],
    criteres: [
      { id: "c1", label: "Nom du produit clair",                        max: 2 },
      { id: "c2", label: "DLC / DDM correcte",                          max: 3 },
      { id: "c3", label: "Traçabilité",                                 max: 3 },
      { id: "c4", label: "Liste des ingrédients",                       max: 4 },
      { id: "c5", label: "Informations utiles au client",               max: 4 },
      { id: "c6", label: "Design vendeur + conscience écologique",      max: 4 },
    ],
  },
  {
    id: "j6_marche_en_avant",
    titre: "Jalon 6 — Marche en avant et hygiène alimentaire",
    annee: "A1",
    consigne: "L'élève maîtrise la marche en avant (du sale vers le propre) et sait identifier les risques de contamination croisée pour son repas à emporter.",
    sections: ["marche_en_avant"],
    criteres: [
      { id: "c1", label: "Connaissance des 9 étapes de la marche en avant", max: 4 },
      { id: "c2", label: "Identification des zones sales et zones propres",  max: 4 },
      { id: "c3", label: "Repérage des erreurs de contamination croisée",    max: 4 },
      { id: "c4", label: "Marche en avant dans le temps (espace limité)",    max: 4 },
      { id: "c5", label: "Application concrète des règles d'hygiène",        max: 4 },
    ],
  },
  {
    id: "j5_menu_final",
    titre: "Jalon 5 — Mon menu final (synthèse année 1)",
    annee: "A1",
    consigne: "L'élève présente un menu complet, cohérent, justifié sur les plans nutritionnel, éco-responsable et règlementaire.",
    sections: ["mon_menu", "repas_equilibre", "eco_responsable", "etiquetage"],
    criteres: [
      { id: "c1", label: "Cohérence du menu (équilibre nutritionnel)", max: 4 },
      { id: "c2", label: "Démarche éco-responsable",                    max: 4 },
      { id: "c3", label: "Étiquetage et conformité",                    max: 4 },
      { id: "c4", label: "Argumentation et justification",              max: 4 },
      { id: "c5", label: "Présentation et clarté",                      max: 4 },
    ],
  },
];

function jalonMax(j) { return j.criteres.reduce((s, c) => s + c.max, 0); }

const STATUS_STUDENT = {
  not_started: "Non commencée",
  in_progress: "En cours",
  done:        "Terminée",
};

const STATUS_TEACHER = {
  none:      "—",
  to_review: "À revoir",
  validated: "Validée",
};

/* =====================================================================
   V4.40 — BANQUES POUR LE COMPOSEUR DE REPAS GUIDÉ
   ---------------------------------------------------------------------
   Utilisées par le champ de type "composante_repas" pour proposer des
   ingrédients à cliquer plutôt qu'à saisir librement, et des
   justifications nutritionnelles pré-rédigées.
   ===================================================================== */

const BANQUE_ALIMENTS = {
  "Légumes":          ["Carottes","Poireaux","Tomates","Courgettes","Salade verte","Épinards","Brocoli","Chou","Haricots verts","Poivrons","Concombre","Radis","Champignons","Betterave","Aubergine","Oignon","Ail"],
  "Fruits":           ["Pomme","Poire","Banane","Orange","Fraise","Kiwi","Raisin","Pêche","Abricot","Melon","Ananas","Citron","Compote sans sucre"],
  "Féculents":        ["Riz","Riz semi-complet","Pâtes","Pâtes complètes","Pain","Pain complet","Pommes de terre","Semoule","Quinoa","Boulgour","Blé","Polenta"],
  "Légumineuses":     ["Lentilles","Lentilles vertes du Puy","Pois chiches","Haricots rouges","Haricots blancs","Fèves","Pois cassés"],
  "VPO (viande/poisson/œuf)": ["Bœuf","Poulet","Dinde","Porc","Jambon blanc","Saumon","Cabillaud","Thon","Sardine","Œuf","Œuf mollet","Steak haché"],
  "Produits laitiers": ["Yaourt nature","Yaourt aux fruits","Fromage blanc","Petit-suisse","Lait","Camembert","Emmental","Comté","Chèvre","Mozzarella"],
  "Matières grasses": ["Huile d'olive","Huile de colza","Beurre","Crème fraîche","Vinaigrette maison"],
  "Produits sucrés":  ["Sucre","Miel","Confiture","Chocolat","Biscuit"],
  "Boissons":         ["Eau plate","Eau gazeuse","Tisane","Jus de fruit 100 % pur jus"],
};

// Mapping vers les 3 grandes catégories de la règle ½ ¼ ¼.
const GROUPE_VERS_CATEG = {
  "Légumes": "legumes",
  "Fruits": "fruits",
  "Féculents": "feculents",
  "Légumineuses": "proteines",   // les légumineuses comptent comme protéines végétales
  "VPO (viande/poisson/œuf)": "proteines",
  "Produits laitiers": "laitier",
  "Matières grasses": "gras",
  "Produits sucrés": "sucre",
  "Boissons": "boisson",
};

// Justifications proposées pour chaque composante (l'élève coche celles qui s'appliquent).
const BANQUE_JUSTIFICATIONS = [
  "Apporte des fibres",
  "Apporte des vitamines",
  "Apporte des minéraux (fer, calcium, magnésium…)",
  "Apporte de l'énergie (glucides complexes)",
  "Apporte des protéines (rôle bâtisseur)",
  "Apporte du calcium (os et dents)",
  "Apporte des bonnes graisses (oméga 3)",
  "Aliment de saison",
  "Produit local / circuit court",
  "Produit avec un label (AB, AOP, Label Rouge…)",
  "Faible en sucres ajoutés",
  "Faible en sel",
  "Adapté pour un repas à emporter",
  "Plait à mes clients",
];

const BANQUE_JUSTIF_GLOBALE = [
  "La moitié de l'assiette est en légumes",
  "Un quart de l'assiette est en féculents",
  "Un quart de l'assiette est en protéines",
  "Le repas contient un produit laitier",
  "Le repas contient un fruit",
  "La boisson est de l'eau",
  "Le repas est complet et varié",
  "Tous les groupes essentiels sont présents",
  "Pas d'excès de matières grasses ni de sucres",
  "Cohérent avec la démarche éco-responsable",
];

/* =====================================================================
   V4.41 — BANQUES D'EXERCICES INTERACTIFS (DRAG & DROP)
   ---------------------------------------------------------------------
   Pour chaque module pédagogique, plusieurs exercices manipulables où
   l'élève glisse des cartes dans des zones colorées. Validation item
   par item avec une explication pédagogique courte. Possibilité de
   recommencer à l'infini. Score sauvegardé dans module_state.dnd_state.
   Ciblage : élèves CAP — répétition, faible charge cognitive,
   confirmations, mémorisation par mots-clés.
   ===================================================================== */

const EXOS_DND = {
  // ============== ECO RESPONSABLE (5 exercices) ==============
  eco_responsable: [
    {
      id: "frigo",
      titre: "🧊 Range ton frigo (5 zones)",
      intro: "Le frigo n'est pas uniforme : chaque zone a sa température. Glisse chaque aliment dans la bonne zone.",
      buckets: [
        { id: "haut",   label: "Haut",   sub: "4-6 °C",          tip: "Restes, fromages, yaourts" },
        { id: "milieu", label: "Milieu", sub: "3-4 °C",          tip: "Viandes cuites, plats préparés" },
        { id: "bas",    label: "Bas",    sub: "0-3 °C — le + froid", tip: "Viande et poisson crus" },
        { id: "bac",    label: "Bac à légumes", sub: "8-10 °C",  tip: "Fruits et légumes frais" },
        { id: "porte",  label: "Porte",  sub: "6-8 °C — le + chaud", tip: "Œufs, beurre, sauces, boissons" },
      ],
      items: [
        { id: "yaourt",  label: "Yaourt",          bucket: "haut",   why: "Le haut (4-6 °C) est idéal pour les yaourts.",
          photo: "ressources_eco/produits_laitiers/yaourt.jpg" },
        { id: "steak",   label: "Steak cru",       bucket: "bas",    why: "Les viandes crues vont en zone la plus froide (0-3 °C) pour ne pas développer de bactéries.",
          photo: "ressources_eco/banque_images_chaine_du_froid/viande_crue/viande_cru.jpg" },
        { id: "carottes",label: "Carottes",         bucket: "bac",    why: "Le bac à légumes (8-10 °C) garde les légumes frais sans les abîmer.",
          photo: "ressources_eco/legumes/carotte.jpg" },
        { id: "oeuf",    label: "Œufs",             bucket: "porte",  why: "Les œufs vont dans la porte (6-8 °C).",
          photo: "ressources_eco/les_oeufs_et_preparations_a_base_doeufs/oeufcru.jpg" },
        { id: "poulet",  label: "Poulet rôti",      bucket: "milieu", why: "Les viandes CUITES se rangent au milieu (3-4 °C).",
          photo: "ressources_eco/plats_prepares_et_traiteur/pouletroti.jpg" },
        { id: "fromage", label: "Camembert",        bucket: "haut",   why: "Les fromages se rangent en haut (4-6 °C).",
          photo: "ressources_eco/produits_laitiers/camembert.jpg" },
        { id: "saumon",  label: "Saumon cru",       bucket: "bas",    why: "Comme la viande crue : zone la plus froide (0-3 °C).",
          photo: "ressources_eco/banque_images_chaine_du_froid/poissoncru/poisson_cru.jpg" },
        { id: "pomme",   label: "Pomme",            bucket: "bac",    why: "Les fruits frais → bac à légumes (8-10 °C).",
          photo: "ressources_eco/fruits/pomme.jpg" },
        { id: "beurre",  label: "Beurre",           bucket: "porte",  why: "Le beurre va dans la porte (6-8 °C).",
          photo: "ressources_eco/produits_laitiers/beurre.jpg" },
        { id: "restes",  label: "Restes (lasagnes)", bucket: "haut",  why: "Les restes se rangent en haut (4-6 °C) pour les consommer rapidement.",
          photo: "ressources_eco/plats_prepares_et_traiteur/lasagnebolognaise.jpg" },
        { id: "jus",     label: "Bouteille de jus", bucket: "porte",  why: "Les boissons se rangent dans la porte.",
          photo: "ressources_eco/boissons_sansalcool/jusdorange.jpg" },
        { id: "lasagnes",label: "Plat préparé",     bucket: "milieu", why: "Plats préparés → milieu (3-4 °C).",
          photo: "ressources_eco/plats_prepares_et_traiteur/hachisparmentier.jpg" },
      ],
      mots_cles: [
        { mot: "0 à 3 °C",       def: "La zone la plus froide du frigo : viande et poisson crus." },
        { mot: "Bac à légumes",  def: "8 à 10 °C : pour fruits et légumes frais." },
        { mot: "Porte",          def: "6 à 8 °C, la zone la plus chaude : œufs, beurre, sauces, boissons." },
        { mot: "Chaîne du froid",def: "Garder les aliments au froid sans interruption, du magasin à l'assiette." },
      ],
    },
    {
      id: "saison_lyon",
      titre: "📅 De saison à Lyon ou pas ?",
      intro: "Range chaque fruit ou légume selon la SAISON où il pousse naturellement à Lyon. (Source : mangerbouger.fr)",
      buckets: [
        { id: "hiver",     label: "Hiver",     sub: "déc → fév", tip: "Poireaux, carottes, choux, pommes, oranges" },
        { id: "printemps", label: "Printemps", sub: "mars → mai", tip: "Asperges, radis, fraises" },
        { id: "ete",       label: "Été",       sub: "juin → août", tip: "Tomates, courgettes, pêches, melons" },
        { id: "automne",   label: "Automne",   sub: "sept → nov", tip: "Courges, champignons, raisin, pommes" },
      ],
      items: [
        { id: "poireau",   label: "🥬 Poireau",   bucket: "hiver",     why: "Le poireau est un légume d'hiver, parfait pour les soupes." },
        { id: "fraise",    label: "🍓 Fraise",    bucket: "printemps", why: "Les fraises poussent en avril-mai en France." },
        { id: "tomate",    label: "🍅 Tomate",    bucket: "ete",       why: "Les tomates ont besoin de soleil et de chaleur (juin-septembre)." },
        { id: "courge",    label: "🎃 Courge",    bucket: "automne",   why: "Les courges sont récoltées en automne." },
        { id: "asperge",   label: "🌱 Asperge",   bucket: "printemps", why: "Saison très courte : avril-juin." },
        { id: "courgette", label: "🥒 Courgette", bucket: "ete",       why: "La courgette est un légume d'été." },
        { id: "champignon",label: "🍄 Champignon", bucket: "automne",  why: "Les champignons se ramassent surtout en automne." },
        { id: "carotte",   label: "🥕 Carotte",   bucket: "hiver",     why: "La carotte se conserve tout l'hiver." },
        { id: "peche",     label: "🍑 Pêche",     bucket: "ete",       why: "Les pêches sont des fruits d'été." },
        { id: "raisin",    label: "🍇 Raisin",    bucket: "automne",   why: "Vendanges en septembre." },
      ],
      mots_cles: [
        { mot: "Produit de saison", def: "Fruit ou légume qui pousse NATURELLEMENT à un moment précis de l'année dans notre région." },
        { mot: "Hors saison",       def: "Vient souvent de loin (avion, serre chauffée) → pollue beaucoup, plus cher, moins de goût." },
      ],
    },
    {
      id: "dlc_ddm",
      titre: "📅 DLC ou DDM ? Je consomme ou je jette ?",
      intro: "Range chaque produit selon la mention de date qui doit y figurer.",
      buckets: [
        { id: "dlc", label: "DLC",   sub: "À consommer JUSQU'AU…", tip: "Produits frais : ne pas dépasser !" },
        { id: "ddm", label: "DDM",   sub: "À consommer DE PRÉFÉRENCE avant…", tip: "Le produit reste sûr après, peut juste perdre du goût." },
      ],
      items: [
        { id: "yaourt", label: "Yaourt frais",      bucket: "dlc", why: "Produit laitier frais → DLC à respecter.",
          photo: "ressources_eco/produits_laitiers/yaourt.jpg" },
        { id: "viande", label: "Viande sous vide",  bucket: "dlc", why: "Produit frais carné → DLC stricte.",
          photo: "ressources_eco/banque_images_chaine_du_froid/viande_crue/viande_cru.jpg" },
        { id: "pates",  label: "Paquet de pâtes",   bucket: "ddm", why: "Produit sec → DDM (peut se consommer même après).",
          photo: "ressources_eco/feculents/sachet_paquet_pates.jpg" },
        { id: "conserve",label: "Conserve de tomates", bucket: "ddm", why: "Conserve appertisée → DDM.",
          photo: "ressources_eco/conserves/conserve_tomates_pelees.jpg" },
        { id: "lait",   label: "Brique de lait UHT", bucket: "ddm", why: "Lait UHT non ouvert → DDM. (Une fois ouvert : DLC à 3 jours.)",
          photo: "ressources_eco/conserves/brique_lait_uht.jpg" },
        { id: "poisson",label: "Saumon frais",      bucket: "dlc", why: "Poisson frais → DLC. Très périssable.",
          photo: "ressources_eco/poissons_et_fruits_de_mer/saumon.jpg" },
        { id: "biscuit",label: "Paquet de biscuits", bucket: "ddm", why: "Produit sec → DDM.",
          photo: "ressources_eco/desserts/cookies.jpg" },
        { id: "fromage",label: "Fromage frais",     bucket: "dlc", why: "Fromage frais (faisselle, ricotta…) → DLC.",
          photo: "ressources_eco/produits_laitiers/fromagefrais.jpg" },
        { id: "riz",    label: "Sachet de riz",     bucket: "ddm", why: "Produit sec → DDM (souvent indéterminée).",
          photo: "ressources_eco/feculents/sachet_riz.jpg" },
        { id: "salade", label: "Salade en sachet",  bucket: "dlc", why: "Produit frais lavé → DLC stricte.",
          photo: "ressources_eco/plats_a_emporter/salade_en_barquette.jpg" },
      ],
      mots_cles: [
        { mot: "DLC",      def: "Date Limite de Consommation. Au-delà = dangereux. Produits frais." },
        { mot: "DDM",      def: "Date de Durabilité Minimale. Au-delà = pas dangereux, juste moins bon. Produits secs/conserves." },
        { mot: "Anti-gaspi", def: "La DDM dépassée n'est PAS une raison de jeter. On peut sentir, goûter, juger." },
      ],
    },
    {
      id: "emballages",
      titre: "📦 Bon ou mauvais emballage éco-responsable ?",
      intro: "Range chaque emballage selon son impact environnemental.",
      buckets: [
        { id: "bon",     label: "✅ Bon choix",     sub: "Recyclable / compostable / réutilisable", tip: "Carton, verre, bioplastique compostable, inox réutilisable" },
        { id: "moyen",   label: "🟡 À limiter",    sub: "Recyclable mais énergivore",            tip: "Aluminium, plastique recyclé" },
        { id: "mauvais", label: "❌ À éviter",     sub: "Polluant, jetable",                      tip: "Polystyrène, plastique à usage unique" },
      ],
      items: [
        { id: "carton",   label: "Bol en carton kraft",   bucket: "bon",     why: "Carton 100 % recyclable et biodégradable. Top choix.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/emballage_pour_transporter_plats/boiteenartonkraft_biodegradable.jpg" },
        { id: "verre",    label: "Bocal en verre",              bucket: "bon",     why: "Le verre se recycle à l'infini.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/emballage_pour_transporter_plats/bocal_en_verre_couvercle.jpg" },
        { id: "bio",      label: "Boîte en bagasse (canne à sucre)", bucket: "bon",     why: "Bioplastique compostable issu d'un déchet agricole.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/emballage_pour_transporter_plats/boiteenbagasse_canneasucre.jpg" },
        { id: "couvert_bois", label: "Couverts en bambou",     bucket: "bon",     why: "Réutilisables ou compostables, naturels.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/couverts_etables/couvert_en_bambou.jpg" },
        { id: "polystyrene",label: "Barquette en plastique réutilisable",     bucket: "moyen", why: "Réutilisable mais reste du plastique.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/emballage_pour_transporter_plats/boite_en_plastique_reutilisable.jpg" },
        { id: "plastique",label: "Couvert plastique jetable",   bucket: "mauvais", why: "Interdit progressivement par la loi AGEC depuis 2020.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/couverts_etables/couvert_plastique_jetable.jpg" },
        { id: "alu",      label: "Barquette aluminium",         bucket: "moyen",   why: "Recyclable mais sa fabrication consomme beaucoup d'énergie.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/emballage_pour_transporter_plats/barquette_aluminium_couvercle.jpg" },
        { id: "papier",   label: "Sac en papier kraft",         bucket: "bon",     why: "Recyclable et biodégradable.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/sachets/sac_en_papier_kraft.jpg" },
        { id: "tissu",    label: "Sac en tissu réutilisable",   bucket: "bon",     why: "Réutilisable des centaines de fois → zéro déchet.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/sachets/sac_en_tissu_reutilisable.jpg" },
        { id: "consigne", label: "Bocal en verre avec couvercle", bucket: "bon",    why: "Verre + couvercle réutilisable → solution durable.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/emballage_pour_transporter_plats/bocal_en_verre_couvercle.jpg" },
        { id: "paille",   label: "Paille en papier",            bucket: "bon",     why: "Alternative biodégradable aux pailles plastique (interdites depuis 2021).",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/couverts_etables/paille_en_papier.jpg" },
        { id: "couvert_jetable_plastique", label: "Sac plastique réutilisable", bucket: "moyen", why: "Mieux que jetable, mais reste du plastique.",
          photo: "ressources_eco/materiel_et_fournitures_pour_plats_a_emporter/sachets/sac_plastique_reutilisable.jpg" },
      ],
      mots_cles: [
        { mot: "Loi AGEC",      def: "Loi Anti-Gaspillage et Économie Circulaire (2020) : interdit de plus en plus de plastiques jetables." },
        { mot: "Recyclable",    def: "Peut être transformé en nouveau produit." },
        { mot: "Compostable",   def: "Se décompose naturellement en compost (engrais)." },
        { mot: "Réutilisable",  def: "Peut servir plusieurs fois → zéro déchet." },
      ],
    },
    {
      id: "labels",
      titre: "🏅 Reconnaître les labels officiels (SIQO)",
      intro: "Associe chaque description au bon label officiel.",
      buckets: [
        { id: "ab",        label: "AB",          sub: "Agriculture Biologique" },
        { id: "labelrouge",label: "Label Rouge", sub: "Qualité supérieure" },
        { id: "aop",       label: "AOP",         sub: "Origine européenne protégée" },
        { id: "igp",       label: "IGP",         sub: "Indication géographique" },
      ],
      items: [
        { id: "i1", label: "Pas de pesticides chimiques ni d'OGM",            bucket: "ab",        why: "Définition officielle du label AB (Agriculture Biologique)." },
        { id: "i2", label: "Lentille verte du Puy",                          bucket: "aop",       why: "Lien à un terroir précis (Auvergne) → AOP." },
        { id: "i3", label: "Poulet de Bresse fermier",                       bucket: "labelrouge",why: "Qualité supérieure liée à un mode d'élevage particulier." },
        { id: "i4", label: "Jambon de Bayonne",                              bucket: "igp",       why: "Lien plus large à une région → IGP." },
        { id: "i5", label: "Roquefort",                                       bucket: "aop",       why: "AOP célèbre, lien à un terroir précis." },
        { id: "i6", label: "Logo vert avec une feuille européenne",          bucket: "ab",        why: "Le logo officiel européen Bio est vert avec une feuille étoilée." },
        { id: "i7", label: "Garantit goût et qualité supérieurs",            bucket: "labelrouge",why: "C'est la promesse du Label Rouge." },
        { id: "i8", label: "Beaufort (fromage)",                              bucket: "aop",       why: "Fromage AOP de Savoie." },
      ],
      mots_cles: [
        { mot: "SIQO",  def: "Signes Officiels d'Identification de la Qualité et de l'Origine." },
        { mot: "AB",    def: "Agriculture Biologique : sans pesticides chimiques, sans OGM." },
        { mot: "AOP",   def: "Appellation d'Origine Protégée. Ex : Roquefort, Beaufort, Lentille du Puy." },
        { mot: "IGP",   def: "Indication Géographique Protégée. Lien plus large à une région." },
      ],
    },
  ],

  // ============== ÉQUILIBRE (3 exercices) ==============
  equilibre: [
    {
      id: "groupes_aliments",
      titre: "🥗 Range chaque aliment dans son groupe",
      intro: "7 groupes alimentaires existent. Glisse chaque aliment dans le bon groupe.",
      buckets: [
        { id: "fl",   label: "Fruits et légumes",    tip: "Vitamines, fibres" },
        { id: "fec",  label: "Féculents",            tip: "Énergie (glucides)" },
        { id: "vpo",  label: "Viandes/Poissons/Œufs",tip: "Protéines bâtisseuses" },
        { id: "pl",   label: "Produits laitiers",    tip: "Calcium" },
        { id: "mg",   label: "Matières grasses",     tip: "À limiter" },
        { id: "ps",   label: "Produits sucrés",      tip: "Avec modération" },
        { id: "boi",  label: "Boissons (eau)",       tip: "Hydratation" },
      ],
      items: [
        { id: "carotte", label: "Carotte",  bucket: "fl",  why: "Légume → groupe Fruits et légumes (vitamines, fibres).",
          photo: "ressources_eco/legumes/carotte.jpg" },
        { id: "riz",     label: "Riz",      bucket: "fec", why: "Céréale → groupe Féculents (énergie).",
          photo: "ressources_eco/feculents/riz_cru.jpg" },
        { id: "poulet",  label: "Poulet",   bucket: "vpo", why: "Viande → groupe VPO (protéines).",
          photo: "ressources_eco/viandes/poulet.jpg" },
        { id: "yaourt",  label: "Yaourt",   bucket: "pl",  why: "Produit laitier → calcium.",
          photo: "ressources_eco/produits_laitiers/yaourt.jpg" },
        { id: "huile",   label: "Huile d'olive", bucket: "mg", why: "Matière grasse végétale.",
          photo: "ressources_eco/sauces_condiments_herbes_et/huiledolive.jpg" },
        { id: "bonbon",  label: "Bonbon",   bucket: "ps",  why: "Produit sucré, à limiter.",
          photo: "ressources_eco/desserts/bonbon.jpg" },
        { id: "eau",     label: "Eau",      bucket: "boi", why: "Seule boisson indispensable.",
          photo: "ressources_eco/boissons_sansalcool/eauplate.jpg" },
        { id: "lentille",label: "Lentilles",bucket: "vpo", why: "Légumineuses : sources de protéines végétales.",
          photo: "ressources_eco/legumineuses/lentilles_crues.jpg" },
        { id: "pomme",   label: "Pomme",    bucket: "fl",  why: "Fruit frais : vitamines et fibres.",
          photo: "ressources_eco/fruits/pomme.jpg" },
        { id: "pates",   label: "Pâtes",    bucket: "fec", why: "Féculents : énergie pour la journée.",
          photo: "ressources_eco/feculents/pates_crues.jpg" },
        { id: "fromage", label: "Comté",    bucket: "pl",  why: "Fromage = produit laitier (calcium).",
          photo: "ressources_eco/produits_laitiers/comte.jpg" },
        { id: "beurre",  label: "Beurre",   bucket: "mg",  why: "Matière grasse animale.",
          photo: "ressources_eco/produits_laitiers/beurre.jpg" },
      ],
      mots_cles: [
        { mot: "Fibres",    def: "Aident la digestion. On les trouve dans fruits, légumes, féculents complets." },
        { mot: "Protéines", def: "« Bâtisseuses » : muscles, peau. Viande, poisson, œuf, légumineuses." },
        { mot: "Glucides",  def: "L'énergie de la journée. Féculents (riz, pâtes, pain)." },
        { mot: "Calcium",   def: "Os et dents. Produits laitiers." },
      ],
    },
    {
      id: "constituants",
      titre: "🔬 Constituants alimentaires et leur rôle",
      intro: "Associe chaque aliment au constituant qu'il apporte principalement.",
      buckets: [
        { id: "prot",  label: "Protides",     sub: "Bâtisseurs",   tip: "Muscles, peau, cheveux" },
        { id: "gluc",  label: "Glucides",     sub: "Énergie",      tip: "Carburant du corps" },
        { id: "lip",   label: "Lipides",      sub: "Réserve",      tip: "Graisses, oméga" },
        { id: "vit",   label: "Vitamines/Minéraux", sub: "Protection", tip: "Bon fonctionnement" },
      ],
      items: [
        { id: "i1", label: "Blanc de poulet", bucket: "prot", why: "Viande maigre = protides.",
          photo: "ressources_eco/charcuteries/blancdepoulet.jpg" },
        { id: "i2", label: "Pain",            bucket: "gluc", why: "Pain = glucides complexes.",
          photo: "ressources_eco/feculents/pain_baguette.jpg" },
        { id: "i3", label: "Avocat",           bucket: "lip",  why: "Riche en bonnes graisses." },
        { id: "i4", label: "Orange",           bucket: "vit",  why: "Vitamine C.",
          photo: "ressources_eco/fruits/orange.jpg" },
        { id: "i5", label: "Œuf",              bucket: "prot", why: "Source de protéines complète.",
          photo: "ressources_eco/les_oeufs_et_preparations_a_base_doeufs/oeufcru.jpg" },
        { id: "i6", label: "Riz",              bucket: "gluc", why: "Céréale = glucides.",
          photo: "ressources_eco/feculents/riz_cru.jpg" },
        { id: "i7", label: "Huile d'olive",    bucket: "lip",  why: "Lipides végétaux (oméga-9).",
          photo: "ressources_eco/sauces_condiments_herbes_et/huiledolive.jpg" },
        { id: "i8", label: "Épinards",         bucket: "vit",  why: "Vitamines (A, K) et fer.",
          photo: "ressources_eco/legumes/epinard.jpg" },
      ],
      mots_cles: [
        { mot: "Protides",  def: "Constituant bâtisseur du corps." },
        { mot: "Glucides",  def: "Carburant : énergie pour bouger et penser." },
        { mot: "Lipides",   def: "Graisses utiles (oméga 3) ou à limiter." },
        { mot: "Vitamines", def: "Protègent et font bien fonctionner le corps." },
      ],
    },
    {
      id: "demi_quart",
      titre: "🍽️ Compose une assiette ½ ¼ ¼",
      intro: "Range chaque aliment dans la PART de l'assiette où il devrait se trouver.",
      buckets: [
        { id: "moitie", label: "½ Légumes",   sub: "La moitié de l'assiette" },
        { id: "quart1", label: "¼ Féculents", sub: "Un quart" },
        { id: "quart2", label: "¼ Protéines", sub: "Un quart" },
      ],
      items: [
        { id: "i1", label: "Carottes râpées", bucket: "moitie", why: "Légume → moitié de l'assiette.",
          photo: "ressources_eco/plats_prepares_et_traiteur/carotterapee.jpg" },
        { id: "i2", label: "Brocoli",          bucket: "moitie", why: "Légume → moitié de l'assiette.",
          photo: "ressources_eco/legumes/brocolis.jpg" },
        { id: "i3", label: "Riz",              bucket: "quart1", why: "Féculent → un quart.",
          photo: "ressources_eco/feculents/riz_cru.jpg" },
        { id: "i4", label: "Pommes de terre", bucket: "quart1", why: "Féculent → un quart.",
          photo: "ressources_eco/legumes/pommedeterre.jpg" },
        { id: "i5", label: "Poulet",           bucket: "quart2", why: "Viande → un quart (protéines).",
          photo: "ressources_eco/viandes/poulet.jpg" },
        { id: "i6", label: "Lentilles",        bucket: "quart2", why: "Légumineuses = protéines végétales → un quart.",
          photo: "ressources_eco/legumineuses/lentilles_crues.jpg" },
        { id: "i7", label: "Épinards",         bucket: "moitie", why: "Légume vert → moitié.",
          photo: "ressources_eco/legumes/epinard.jpg" },
        { id: "i8", label: "Pâtes",            bucket: "quart1", why: "Féculent → un quart.",
          photo: "ressources_eco/feculents/pates_crues.jpg" },
        { id: "i9", label: "Cabillaud",        bucket: "quart2", why: "Poisson → un quart (protéines).",
          photo: "ressources_eco/poissons_et_fruits_de_mer/cabillaud.jpg" },
      ],
      mots_cles: [
        { mot: "½ ¼ ¼",       def: "Moitié légumes, quart féculents, quart protéines : la règle d'or de l'assiette équilibrée." },
        { mot: "PNNS",        def: "Programme National Nutrition Santé : mangerbouger.fr." },
      ],
    },
  ],

  // ============== ÉTIQUETAGE (2 exercices) ==============
  etiquetage: [
    {
      id: "mentions_obligatoires",
      titre: "📝 Mention obligatoire ou pas ?",
      intro: "Le règlement INCO (UE 1169/2011) liste ce qui DOIT figurer sur une étiquette. Range chaque mention.",
      buckets: [
        { id: "oblig", label: "✅ Obligatoire", tip: "Imposé par la loi" },
        { id: "facu",  label: "🟡 Facultatif",  tip: "Le fabricant peut choisir" },
      ],
      items: [
        { id: "i1", label: "Nom du produit",          bucket: "oblig", why: "Mention obligatoire (INCO art. 9)." },
        { id: "i2", label: "Liste des ingrédients",   bucket: "oblig", why: "Obligatoire si plus d'un ingrédient." },
        { id: "i3", label: "DLC ou DDM",               bucket: "oblig", why: "Obligatoire pour permettre une consommation sûre." },
        { id: "i4", label: "Liste des allergènes",     bucket: "oblig", why: "Les 14 allergènes majeurs doivent être MIS EN ÉVIDENCE (gras, majuscules)." },
        { id: "i5", label: "Quantité nette (poids)",   bucket: "oblig", why: "Le poids ou volume doit être indiqué." },
        { id: "i6", label: "Coordonnées du producteur",bucket: "oblig", why: "Pour permettre la traçabilité et le rappel produit." },
        { id: "i7", label: "Slogan publicitaire",      bucket: "facu",  why: "Le fabricant peut en mettre un, mais ce n'est pas obligatoire." },
        { id: "i8", label: "Recette suggérée",         bucket: "facu",  why: "Facultatif." },
        { id: "i9", label: "Logo du label AB",         bucket: "facu",  why: "Affichable seulement si le produit est certifié bio (mais pas obligatoire)." },
        { id: "i10",label: "Numéro de lot",            bucket: "oblig", why: "Permet de tracer le produit en cas de problème." },
      ],
      mots_cles: [
        { mot: "INCO",         def: "Règlement européen 1169/2011 sur l'information du consommateur." },
        { mot: "Allergène",    def: "14 substances majeures à signaler en caractères gras (gluten, œuf, lait, arachide…)." },
        { mot: "Traçabilité",  def: "Savoir d'où vient le produit, qui l'a fait, quand." },
      ],
    },
    {
      id: "allergenes",
      titre: "⚠️ Quel allergène se cache dedans ?",
      intro: "Trouve l'allergène majeur présent dans chaque aliment.",
      buckets: [
        { id: "gluten",   label: "🌾 Gluten" },
        { id: "lait",     label: "🥛 Lait" },
        { id: "oeuf",     label: "🥚 Œuf" },
        { id: "fruits",   label: "🥜 Fruits à coque" },
        { id: "poisson",  label: "🐟 Poisson" },
      ],
      items: [
        { id: "i1", label: "Baguette de pain",       bucket: "gluten",  why: "Le pain est fait de blé → gluten.",
          photo: "ressources_eco/feculents/pain_baguette.jpg" },
        { id: "i2", label: "Panna cotta",              bucket: "lait",    why: "La panna cotta est faite à base de crème et de lait.",
          photo: "ressources_eco/desserts/pannacotta.jpg" },
        { id: "i3", label: "Mayonnaise",              bucket: "oeuf",    why: "Mayonnaise = jaune d'œuf.",
          photo: "ressources_eco/sauces_condiments_herbes_et/mayonnaise.jpg" },
        { id: "i4", label: "Tarte au citron meringuée", bucket: "oeuf",  why: "Meringue = blancs d'œufs.",
          photo: "ressources_eco/desserts/tartecitron.jpg" },
        { id: "i5", label: "Sandwich jambon-beurre",  bucket: "gluten",  why: "Le pain contient du blé → gluten (et le beurre = lait, double allergène).",
          photo: "ressources_eco/plats_a_emporter/sandwich_jambon_beurre.jpg" },
        { id: "i6", label: "Cookies",                  bucket: "gluten",  why: "Farine de blé dans les cookies.",
          photo: "ressources_eco/desserts/cookies.jpg" },
        { id: "i7", label: "Glace cornet",             bucket: "lait",    why: "Glace au lait.",
          photo: "ressources_eco/desserts/glace_cornet.jpg" },
        { id: "i8", label: "Conserve de sardines",     bucket: "poisson", why: "Sardine = poisson.",
          photo: "ressources_eco/conserves/conserve_sardines_huile.jpg" },
      ],
      mots_cles: [
        { mot: "14 allergènes", def: "Liste officielle imposée par le règlement INCO." },
        { mot: "Mise en évidence", def: "Sur l'étiquette : caractères gras, majuscules ou couleur différente." },
      ],
    },
  ],

  // ============== COMPRENDRE (1 exercice) ==============
  comprendre: [
    {
      id: "vrai_faux_cdo",
      titre: "✅ Vrai ou faux sur le chef-d'œuvre",
      intro: "Range chaque affirmation.",
      buckets: [
        { id: "v", label: "✅ Vrai" },
        { id: "f", label: "❌ Faux" },
      ],
      items: [
        { id: "i1", label: "Le chef-d'œuvre dure 2 ans.",                                bucket: "v", why: "Sur les 2 années de CAP." },
        { id: "i2", label: "L'oral final dure 10 minutes.",                              bucket: "v", why: "Présentation orale en juin de la 2e année." },
        { id: "i3", label: "Si je rate du premier coup, c'est foutu.",                   bucket: "f", why: "Faux : on a le droit à l'erreur, on peut recommencer." },
        { id: "i4", label: "Le chef-d'œuvre compte pour 50 % de la note.",                bucket: "v", why: "50 % suivi sur 2 ans + 50 % oral final." },
        { id: "i5", label: "Le chef-d'œuvre n'a aucun lien avec mon métier.",            bucket: "f", why: "Faux : il doit être en lien direct avec le métier préparé." },
        { id: "i6", label: "Je dois présenter mon projet devant un jury.",                bucket: "v", why: "Devant 2 enseignants à l'oral final : un de matière générale et un de spécialité professionnelle." },
      ],
      mots_cles: [
        { mot: "Chef-d'œuvre", def: "Projet concret de 2 ans en lien avec ton métier, défendu à l'oral." },
        { mot: "Droit à l'erreur", def: "Tu peux recommencer ce qui ne va pas. C'est normal de progresser par essais." },
      ],
    },
  ],

  // ============== MARCHE EN AVANT (5 exercices avec photos) ==============
  marche_en_avant: [
    // ---- Exo 1 : Identifier les zones (sale ou propre) ----
    {
      id: "zones_sale_propre",
      titre: "🎯 Zone sale ou zone propre ?",
      intro: "Glisse chaque image vers la bonne zone. Souviens-toi : on AVANCE du sale vers le propre.",
      buckets: [
        { id: "sale",   label: "🚯 Zone SALE",   sub: "Cartons, déchets, plonge", tip: "Là où arrive et part la saleté" },
        { id: "propre", label: "✨ Zone PROPRE", sub: "Cuisson, conditionnement, étiquetage", tip: "Là où le produit fini est manipulé" },
      ],
      items: [
        { id: "z1", label: "Réception des marchandises",          bucket: "sale",   why: "Les cartons arrivent sales de l'extérieur.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/01_zone_sale_reception_marchandises.jpg" },
        { id: "z2", label: "Déconditionnement",                    bucket: "sale",   why: "On enlève les emballages extérieurs sales.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/02_zone_sale_deconditionnement.jpg" },
        { id: "z3", label: "Lavage initial des produits terreux", bucket: "sale",   why: "Le lavage retire la terre et les saletés.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/03_zone_sale_lavage_initial_produits_terreux.jpg" },
        { id: "z4", label: "Zone des déchets",                     bucket: "sale",   why: "Là où vont les épluchures et déchets.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/04_zone_sale_dechets.jpg" },
        { id: "z5", label: "Plonge / vaisselle sale",              bucket: "sale",   why: "Vaisselle utilisée à laver.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/05_zone_sale_plonge_vaisselle_sale.jpg" },
        { id: "z6", label: "Stockage des déchets",                 bucket: "sale",   why: "Conteneur dédié aux déchets, séparé du reste.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/06_zone_sale_stockage_dechets.jpg" },
        { id: "z7", label: "Préparation des aliments lavés",       bucket: "propre", why: "Les aliments sont propres, prêts à être travaillés.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/07_zone_propre_preparation_aliments_laves.jpg" },
        { id: "z8", label: "Cuisson",                              bucket: "propre", why: "La cuisson détruit les bactéries restantes.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/08_zone_propre_cuisson.jpg" },
        { id: "z9", label: "Conditionnement",                      bucket: "propre", why: "On met le produit fini dans une barquette propre.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/09_zone_propre_conditionnement.jpg" },
        { id: "z10", label: "Stockage froid des produits finis",   bucket: "propre", why: "Frigo dédié aux produits finis, séparé du cru.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/10_zone_propre_stockage_froid_produits_finis.jpg" },
        { id: "z11", label: "Étiquetage",                          bucket: "propre", why: "Apposer l'étiquette se fait sur le produit fini propre.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/11_zone_propre_etiquetage.jpg" },
        { id: "z12", label: "Distribution / vente à emporter",     bucket: "propre", why: "Remise au client : l'aboutissement de la marche en avant.",
          photo: "ressources_eco/marche_en_avant/3_zones_cuisine/12_zone_propre_distribution_vente_emporter.jpg" },
      ],
      mots_cles: [
        { mot: "Zone sale",     def: "Là où la saleté arrive ou est éliminée : réception, déchets, plonge." },
        { mot: "Zone propre",   def: "Là où le produit fini est manipulé : cuisson, conditionnement, distribution." },
        { mot: "Marche en avant", def: "Le produit AVANCE toujours du sale vers le propre, sans revenir." },
      ],
    },

    // ---- Exo 2 : Bon geste ou erreur ? ----
    {
      id: "bon_geste_ou_erreur",
      titre: "⚠️ Bon geste ou erreur ?",
      intro: "Regarde chaque image et glisse-la dans la bonne case. Toutes les images d'erreurs sont des risques de contamination croisée.",
      buckets: [
        { id: "bon",    label: "✅ Bon geste",    sub: "Hygiène respectée", tip: "Conforme à la marche en avant" },
        { id: "erreur", label: "❌ ERREUR",       sub: "Risque de contamination", tip: "À ne JAMAIS faire" },
      ],
      items: [
        // 6 bons gestes (issus du parcours 9 étapes)
        { id: "b1", label: "Lavage des légumes terreux à l'eau",      bucket: "bon",    why: "Le lavage en zone sale est une étape correcte.",
          photo: "ressources_eco/marche_en_avant/1_parcours_9_etapes/04_lavage_legumes_produits.jpg" },
        { id: "b2", label: "Cuisson à la bonne température",          bucket: "bon",    why: "La cuisson en zone propre détruit les bactéries.",
          photo: "ressources_eco/marche_en_avant/1_parcours_9_etapes/06_cuisson_aliments_bonne_temperature.jpg" },
        { id: "b3", label: "Mise en barquette propre",                 bucket: "bon",    why: "Conditionner dans un contenant propre, en zone propre.",
          photo: "ressources_eco/marche_en_avant/1_parcours_9_etapes/07_conditionnement_barquette_contenant_propre.jpg" },
        { id: "b4", label: "Étiquetage avec DLC",                      bucket: "bon",    why: "Étiquette + stockage froid = traçabilité conforme.",
          photo: "ressources_eco/marche_en_avant/1_parcours_9_etapes/08_etiquetage_dlc_stockage_froid.jpg" },
        // 6 erreurs typiques
        { id: "e1", label: "Cartons posés sur plan de travail propre",   bucket: "erreur", why: "Les cartons portent les bactéries de l'extérieur. Ils ne doivent pas toucher les zones propres.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/01_erreur_cartons_sur_plan_travail_propre.jpg" },
        { id: "e2", label: "Légumes terreux à côté d'une salade prête", bucket: "erreur", why: "La terre des légumes peut contaminer la salade prête à manger.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/02_erreur_legumes_terreux_a_cote_salade_prete.jpg" },
        { id: "e3", label: "Viande crue à côté d'aliments prêts",       bucket: "erreur", why: "La viande crue contient des bactéries qui peuvent contaminer les aliments prêts.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/03_erreur_viande_crue_a_cote_aliments_prets.jpg" },
        { id: "e4", label: "Même couteau pour viande crue et légumes",  bucket: "erreur", why: "Toujours utiliser des couteaux séparés et bien désinfecter.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/06_erreur_meme_couteau_viande_crue_legumes.jpg" },
        { id: "e5", label: "Employé sans lavage des mains",              bucket: "erreur", why: "Les mains sont le 1er vecteur de contamination. À laver TRÈS souvent.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/07_erreur_employe_sans_lavage_mains.jpg" },
        { id: "e6", label: "Déchets alimentaires dans la zone propre",   bucket: "erreur", why: "Les déchets attirent les bactéries et les nuisibles. Zone séparée obligatoire.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/11_erreur_dechets_alimentaires_zone_propre.jpg" },
      ],
      mots_cles: [
        { mot: "Contamination croisée", def: "Quand des bactéries passent d'un aliment ou objet sale vers un aliment propre." },
        { mot: "Hygiène des mains",     def: "Se laver les mains avant chaque nouvelle tâche, après être allé aux toilettes, après avoir manipulé du cru." },
        { mot: "Séparation cru/cuit",   def: "Couteaux, planches et zones différentes pour ce qui est cru et ce qui est prêt à manger." },
      ],
    },

    // ---- Exo 3 : Repérer les erreurs ----
    {
      id: "type_erreur",
      titre: "🔍 Quel type d'erreur ?",
      intro: "Pour chaque image d'erreur, identifie le TYPE de risque.",
      buckets: [
        { id: "croisement", label: "🔀 Croisement cru / propre",   tip: "Aliments crus mélangés à des prêts à manger" },
        { id: "retour",     label: "↩️ Retour en arrière",          tip: "Plat propre qui repasse en zone sale" },
        { id: "hygiene",    label: "🧼 Manque d'hygiène",            tip: "Mains, plan, matériel non nettoyés" },
        { id: "stockage",   label: "📦 Mauvais stockage",            tip: "Aliments mal placés ou exposés" },
      ],
      items: [
        { id: "te1", label: "Cartons sur plan de travail propre",   bucket: "stockage", why: "Mauvais placement : zones sales et propres mélangées.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/01_erreur_cartons_sur_plan_travail_propre.jpg" },
        { id: "te2", label: "Légumes terreux à côté de salade",     bucket: "croisement", why: "Cru sale (terre) en contact avec prêt à manger.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/02_erreur_legumes_terreux_a_cote_salade_prete.jpg" },
        { id: "te3", label: "Viande crue à côté d'aliments prêts",  bucket: "croisement", why: "Croisement cru/prêt à manger.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/03_erreur_viande_crue_a_cote_aliments_prets.jpg" },
        { id: "te4", label: "Plat préparé qui repasse en zone sale", bucket: "retour",   why: "Retour en arrière : il faut toujours avancer.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/05_erreur_retour_arriere_plat_prepare_zone_sale.jpg" },
        { id: "te5", label: "Même couteau viande/légumes",          bucket: "croisement", why: "Croisement par matériel non nettoyé.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/06_erreur_meme_couteau_viande_crue_legumes.jpg" },
        { id: "te6", label: "Employé sans lavage des mains",         bucket: "hygiene",  why: "Hygiène corporelle non respectée.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/07_erreur_employe_sans_lavage_mains.jpg" },
        { id: "te7", label: "Vaisselle sale près d'aliments propres", bucket: "stockage", why: "Mauvais stockage : sale et propre côte à côte.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/08_erreur_vaisselle_sale_pres_aliments_propres.jpg" },
        { id: "te8", label: "Plan de travail non nettoyé entre 2 préparations", bucket: "hygiene", why: "Manque de nettoyage entre les tâches.",
          photo: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/12_erreur_plan_travail_non_nettoye.jpg" },
      ],
      mots_cles: [
        { mot: "5M", def: "Méthode des 5M : Matières, Matériel, Milieu, Méthode, Main-d'œuvre — les 5 sources possibles de contamination." },
        { mot: "HACCP", def: "Système d'analyse des risques en alimentation (Hazard Analysis Critical Control Point)." },
      ],
    },

    // ---- Exo 4 : Marche en avant dans le temps ----
    {
      id: "marche_temps",
      titre: "⏱️ Marche en avant DANS LE TEMPS",
      intro: "Quand l'espace est limité, on respecte la marche en avant DANS LE TEMPS. Range les 5 étapes dans l'ordre.",
      buckets: [
        { id: "etape1", label: "1️⃣ Étape 1" },
        { id: "etape2", label: "2️⃣ Étape 2" },
        { id: "etape3", label: "3️⃣ Étape 3" },
        { id: "etape4", label: "4️⃣ Étape 4" },
        { id: "etape5", label: "5️⃣ Étape 5" },
      ],
      items: [
        { id: "mt1", label: "Préparation des aliments SALES (légumes terreux)", bucket: "etape1", why: "On commence toujours par le sale.",
          photo: "ressources_eco/marche_en_avant/4_marche_dans_le_temps/01_preparation_sale_legumes_terreux.jpg" },
        { id: "mt2", label: "Nettoyage et désinfection du plan de travail",      bucket: "etape2", why: "On nettoie après le sale, avant de toucher au propre.",
          photo: "ressources_eco/marche_en_avant/4_marche_dans_le_temps/02_nettoyage_plan_travail_materiel.jpg" },
        { id: "mt3", label: "Lavage des mains avant le propre",                  bucket: "etape3", why: "Mains propres avant de manipuler les aliments propres.",
          photo: "ressources_eco/marche_en_avant/4_marche_dans_le_temps/03_lavage_mains_avant_preparation_propre.jpg" },
        { id: "mt4", label: "Préparation des aliments PROPRES (prêts à manger)", bucket: "etape4", why: "Maintenant on peut travailler les aliments propres.",
          photo: "ressources_eco/marche_en_avant/4_marche_dans_le_temps/04_preparation_propre_aliments_prets_manger.jpg" },
        { id: "mt5", label: "Nettoyage final après toute la préparation",        bucket: "etape5", why: "Pour laisser la cuisine propre.",
          photo: "ressources_eco/marche_en_avant/4_marche_dans_le_temps/05_nettoyage_final_apres_preparation.jpg" },
      ],
      mots_cles: [
        { mot: "Marche en avant dans le temps", def: "Quand l'espace est limité : on fait d'abord le sale, on nettoie, on se lave les mains, puis le propre." },
        { mot: "Désinfection", def: "Détruire les microbes avec un produit (alcool, javel diluée, etc.) après nettoyage." },
      ],
    },

    // ---- Exo 5 : Vrai/Faux essentiel ----
    {
      id: "vrai_faux_marche",
      titre: "✅❌ Vrai ou Faux ?",
      intro: "Range chaque affirmation pour vérifier que tu as compris.",
      buckets: [
        { id: "v", label: "✅ VRAI" },
        { id: "f", label: "❌ FAUX" },
      ],
      items: [
        { id: "vf1", label: "On peut revenir en arrière dans la marche en avant si on lave bien.", bucket: "f", why: "FAUX. La règle d'or est de ne JAMAIS revenir en arrière." },
        { id: "vf2", label: "Il faut se laver les mains entre la préparation cru et la préparation prêt à manger.", bucket: "v", why: "VRAI. Les mains sont le 1er vecteur de contamination." },
        { id: "vf3", label: "On peut utiliser le même couteau pour la viande crue et la salade.", bucket: "f", why: "FAUX. Toujours des ustensiles séparés ou parfaitement désinfectés." },
        { id: "vf4", label: "La zone de cuisson est une zone PROPRE.", bucket: "v", why: "VRAI. La cuisson est une zone propre, après le lavage et la préparation." },
        { id: "vf5", label: "La plonge (vaisselle sale) est une zone PROPRE.", bucket: "f", why: "FAUX. La plonge est une zone SALE." },
        { id: "vf6", label: "La chaîne du froid pour les produits frais c'est 0 à 4 °C.", bucket: "v", why: "VRAI. Au-dessus de 4 °C, les bactéries se multiplient vite." },
        { id: "vf7", label: "Si je n'ai pas la place pour 2 zones, je peux ignorer la marche en avant.", bucket: "f", why: "FAUX. On l'applique DANS LE TEMPS : sale → nettoyage → propre." },
        { id: "vf8", label: "Le règlement européen CE 852/2004 oblige à respecter la marche en avant.", bucket: "v", why: "VRAI. C'est une obligation légale en France et en Europe." },
      ],
      mots_cles: [
        { mot: "Règle d'or",          def: "On avance du sale vers le propre, on ne revient JAMAIS en arrière." },
        { mot: "CE 852/2004",          def: "Règlement européen sur l'hygiène des denrées alimentaires." },
        { mot: "Chaîne du froid",      def: "0 à 4 °C : préserve les aliments en empêchant les bactéries de se multiplier." },
      ],
    },
  ],
};

/* =====================================================================
   V4.41 — BANQUES DE MOTS-CLÉS pour les champs de rédaction guidée
   Quand l'élève rédige (ex: "Comment éviter le gaspillage…"), il peut
   cliquer sur des mots-clés qui s'insèrent dans son texte. Aide les
   élèves qui ont du mal à démarrer une phrase.
   ===================================================================== */

const KEYWORDS_BANKS = {
  gaspillage_recette: [
    "portions adaptées", "pas trop cuisiner", "réutiliser les restes",
    "épluchures pour bouillon", "bien conserver", "respecter la DLC",
    "vendre uniquement à la commande", "congeler le surplus",
    "fond de tiroir", "pain rassis en croûtons", "soupe avec les restes",
  ],
  emballage_eco: [
    "carton recyclable", "verre", "bioplastique compostable", "couvercle en amidon de maïs",
    "papier kraft", "bocal en verre", "boîte inox réutilisable", "consigne",
    "loi AGEC", "zéro plastique à usage unique", "biodégradable",
  ],
  // V4.52 — pour les justifications du composeur de repas
  equilibre_repas: [
    "½ légumes", "¼ féculents", "¼ protéines", "produit laitier",
    "fruit en dessert", "verre d'eau", "groupes alimentaires variés",
    "tous les groupes essentiels", "pas d'excès de gras ni de sucres",
    "respecte le PNNS",
  ],
  nutrition_repas: [
    "vitamines", "minéraux", "fibres",
    "protides (rôle bâtisseur)", "glucides (énergie)", "lipides (réserve)",
    "calcium (os)", "fer", "oméga 3",
    "viandes/poissons/œufs", "produits laitiers", "féculents complets",
  ],
  regle_repas: [
    "règle ½ ¼ ¼", "PNNS — mangerbouger.fr", "5 fruits et légumes par jour",
    "1 produit laitier par repas", "diversité alimentaire", "modération sucres et gras",
    "1 fruit en dessert", "eau à volonté",
  ],
  // V4.53 — Marche en avant
  marche_avant_appris: [
    "du sale vers le propre", "9 étapes", "ne jamais revenir en arrière",
    "zones sales", "zones propres", "contamination croisée",
    "marche en avant dans le temps", "lavage des mains", "chaîne du froid",
    "désinfection", "nettoyage", "règle d'or",
  ],
  marche_avant_projet: [
    "se laver les mains", "séparer cru/cuit",
    "nettoyer le plan de travail", "désinfecter le matériel",
    "respecter la chaîne du froid", "0 à 4 °C",
    "couteaux séparés (viande / légumes)", "tenue propre",
    "déchets fermés", "pas de retour en arrière",
    "DLC à respecter", "étiquetage soigné",
  ],
};

/* =====================================================================
   2. SCHÉMA PÉDAGOGIQUE
   Chaque section contient un bloc pedago (consigne/production/attentes)
   ===================================================================== */

const SECTIONS_SCHEMA = [
  {
    id: "accueil",
    annee: "A1",
    titre: "Accueil et présentation du chef-d'œuvre",
    description: "Rappel de ce qu'est le chef-d'œuvre et de ses attentes. Durée : 2 ans (année 1 et année 2).",
    pedago: {
      consigne: "Lisez la présentation du projet et écrivez, avec vos propres mots, ce que vous comprenez du chef-d'œuvre.",
      production: "Un texte court qui explique le projet et ce que vous devrez réussir à la fin.",
      attentes: "L'enseignant vérifie que vous avez compris l'objectif, la durée (2 ans) et l'oral final.",
    },
    fields: [
      { id: "titre_projet",     label: "Titre du projet",                               type: "text",
        default_value: "Réaliser un menu équilibré et éco-responsable" },
      { id: "objectif",         label: "Objectif général du chef-d'œuvre",              type: "textarea",
        default_value: "Concevoir et présenter un menu équilibré et éco-responsable à emporter.",
        details: "Pendant les deux années de mon CAP, je vais réaliser ce chef-d'œuvre en travaillant trois aspects de mon métier : l'équilibre du repas, le respect de l'environnement et le respect des règles (étiquetage, hygiène, traçabilité). À la fin, je présenterai mon projet à l'oral pendant 10 minutes, devant deux enseignants : un de matière générale et un de ma spécialité. La note finale est composée à moitié des notes prises pendant les 2 ans, et à moitié de la note de l'oral final." },
      { id: "comprendre",       label: "Ce qu'est le chef-d'œuvre (avec mes mots)",     type: "textarea" },
      { id: "capacite_finale",  label: "Ce que je devrai savoir faire à la fin",        type: "textarea" },
    ],
  },
  {
    id: "identite",
    annee: "both",
    titre: "Ma fiche",
    description: "Une fiche de présentation pour mon dossier de chef-d'œuvre.",
    pedago: {
      consigne: "Remplis ton état civil, choisis ce qui te correspond, ajoute une photo si tu veux.",
      production: "Une fiche de présentation soignée qui figurera sur ton dossier final.",
      attentes: "Une fiche complète, sérieuse, valorisante.",
    },
    fields: [
      // RGPD : ni nom, ni prénom, ni lycée. L'identité = code élève (Data Élèves).
      { id: "classe",          label: "Classe",                               type: "text", hint: "Renseignée automatiquement depuis ton code." },
      { id: "annee_scolaire",  label: "Année scolaire",                       type: "text", hint: "Ex : 2025-2026" },
      { id: "titre_dossier",   label: "Titre de mon dossier (mon projet)",   type: "text", hint: "Ex : Ma cuisine éco-responsable" },
      { id: "photo_profil",    label: "Mon avatar (optionnel)",               type: "photo_profil" },
      { id: "valeurs",         label: "Mes valeurs",                          type: "checklist",
        hint: "Coche les valeurs qui te correspondent (plusieurs choix possibles).",
        allow_custom: true,
        options: [
          "Respect", "Entraide", "Persévérance", "Créativité", "Rigueur", "Honnêteté",
          "Partage", "Curiosité", "Bienveillance", "Esprit d'équipe", "Engagement",
          "Ouverture d'esprit", "Solidarité", "Tolérance", "Responsabilité", "Loyauté",
        ],
      },
      { id: "qualites",        label: "Mes qualités au travail",              type: "checklist",
        hint: "Mes points forts en classe ou à l'atelier.",
        allow_custom: true,
        options: [
          "Organisé(e)", "Ponctuel(le)", "Soigneux(se)", "Attentif(ve)", "Motivé(e)",
          "Autonome", "Collaboratif(ve)", "Patient(e)", "Persévérant(e)", "Précis(e)",
          "Méthodique", "À l'écoute", "Concentré(e)", "Sérieux(se)", "Réactif(ve)",
          "Curieux(se) d'apprendre", "Manuel(le)",
        ],
      },
      { id: "interets",        label: "Mes centres d'intérêt",                type: "checklist",
        hint: "Ce que j'aime faire en dehors de l'école.",
        allow_custom: true,
        options: [
          "Cuisine", "Pâtisserie", "Sport", "Musique", "Lecture", "Cinéma",
          "Dessin / arts", "Jeux vidéo", "Voyages", "Mode", "Bricolage", "Nature",
          "Animaux", "Photographie", "Danse", "Bénévolat", "Famille", "Amis",
        ],
      },
      { id: "pourquoi_cap",    label: "Pourquoi j'ai choisi ce CAP",          type: "textarea",
        hint: "En quelques phrases, ce qui t'a motivé." },
      { id: "projet_apres",    label: "Ce que je veux faire après mon CAP",   type: "textarea",
        hint: "Ton projet professionnel ou de poursuite d'études." },
    ],
  },
  {
    // =====================================================================
    // V3 — MODULE PÉDAGOGIQUE : Comprendre le chef-d'œuvre (jalon J1)
    // Structure : cours (textes + audio) + QCM + exercice + champs libres.
    // L'élève peut écouter chaque texte (Web Speech API), répondre au QCM,
    // faire l'exercice, puis rédiger sa propre compréhension.
    // Un bouton exporte une fiche Word qui sert d'appui pour l'oral et
    // d'évaluation côté enseignant.
    //
    // POUR MODIFIER LE CONTENU : éditez le champ `module` ci-dessous.
    // POUR AJOUTER UN MODULE AILLEURS : copiez cette structure dans une
    // autre section et renommez l'id.
    // =====================================================================
    id: "comprendre",
    annee: "A1",
    titre: "🎓 Comprendre le chef-d'œuvre",
    description: "Je découvre ce qu'est le chef-d'œuvre, comment je vais être noté et ce que je dois faire.",
    pedago: {
      consigne: "Lis les cours, écoute si tu préfères, puis fais le quiz et l'exercice.",
      production: "Un quiz rempli, un exercice validé et trois phrases sur ce que tu as compris.",
      attentes: "Tu sais expliquer ce qu'est le chef-d'œuvre et ce qu'on attend de toi.",
    },
    module: {
      jalon_id: "j1_comprendre",
      cours: [
        {
          id: "c1",
          titre: "🧭 C'est quoi, un chef-d'œuvre ?",
          texte: `Le chef-d'œuvre, c'est un **grand projet** que tu vas mener pendant toute ta formation CAP, sur **2 ans**.

C'est une **réalisation concrète** qui te ressemble et qui montre ce que tu sais faire dans ton métier.

> 📌 Ce n'est pas un exercice scolaire comme les autres : c'est une **preuve** de ce que tu es capable de faire à la fin de ton CAP.`,
        },
        {
          id: "c2",
          titre: "⏳ Combien de temps ça dure ?",
          texte: `Le chef-d'œuvre dure **deux années scolaires**.

Tu vas avancer **étape par étape** :

- Comprendre
- Chercher
- Choisir
- Réaliser
- Améliorer
- Présenter

> 💡 Tu as le **droit à l'erreur** : on teste, on corrige, on recommence. C'est normal de se tromper, c'est comme ça qu'on apprend.`,
        },
        {
          id: "c3",
          titre: "🧑‍🤝‍🧑 Seul ou en groupe ?",
          texte: `Le projet peut être :

- **Collectif** (à plusieurs)
- Ou **individuel** (tout seul)

> ⚠️ Dans les deux cas, la **partie que toi tu as faite** doit pouvoir être identifiée. À l'oral, tu devras expliquer **ce que tu as fait toi-même**.`,
        },
        {
          id: "c4",
          titre: "🎯 Quel est notre projet ?",
          texte: `Notre chef-d'œuvre, c'est de **concevoir et réaliser un repas ou un menu équilibré et éco-responsable, à emporter**.

**Ce que tu vas apprendre**

- Choisir des aliments **équilibrés**
- Respecter l'**environnement** : produits de **saison**, **circuits courts**, lutte contre le **gaspillage**
- Calculer les **coûts**
- Préparer, tester
- Communiquer et présenter`,
        },
        {
          id: "c5",
          titre: "📊 Comment je suis noté ?",
          texte: `Ta note finale est divisée en **deux parties égales**.

- 📒 **50 %** : notes pendant les **2 ans** (note dite « de livret »)
- 🎤 **50 %** : note de l'**oral final**

**L'oral final** dure **10 minutes** :

- 5 minutes pour **présenter** ton projet
- 5 minutes de **questions** du jury`,
        },
        {
          id: "c6",
          titre: "🎤 L'oral final",
          texte: `Tu présenteras ton chef-d'œuvre devant **deux enseignants** :

- Un de **matière générale** (par exemple français ou maths)
- Un de ta **spécialité professionnelle**

**Le support**

Un support de **5 pages maximum** (papier ou numérique).

**Ce que tu devras expliquer**

- Ta **démarche** (comment tu t'y es pris)
- Ce que tu as fait **seul**
- Les **difficultés** rencontrées et comment tu les as **dépassées**
- Les **améliorations possibles**
- La **valeur** de ton projet pour ton métier`,
        },
      ],
      qcm: [
        {
          id: "q1",
          question: "Le chef-d'œuvre dure combien de temps ?",
          options: ["Un trimestre", "Un an", "Deux ans", "Trois ans"],
          correct: 2,
          explication: "Le chef-d'œuvre dure toute la formation CAP, soit 2 ans.",
        },
        {
          id: "q2",
          question: "Le chef-d'œuvre, c'est :",
          options: [
            "Un simple exposé à faire",
            "Un projet concret relié à mon métier",
            "Un devoir surveillé",
            "Un stage en entreprise",
          ],
          correct: 1,
          explication: "C'est une réalisation concrète, ancrée dans ta spécialité professionnelle.",
        },
        {
          id: "q3",
          question: "Notre projet précis, c'est de concevoir :",
          options: [
            "Un dessert maison",
            "Une affiche publicitaire",
            "Un repas/menu équilibré et éco-responsable à emporter",
            "Un site internet",
          ],
          correct: 2,
        },
        {
          id: "q4",
          question: "À la fin, je passe un oral. Il dure :",
          options: ["5 minutes", "10 minutes", "20 minutes", "30 minutes"],
          correct: 1,
          explication: "10 min au total : 5 min de présentation + 5 min de questions.",
        },
        {
          id: "q5",
          question: "Combien de pages au maximum pour mon support d'oral ?",
          options: ["2 pages", "5 pages", "10 pages", "Autant que je veux"],
          correct: 1,
          explication: "Règle officielle : support de 5 pages maximum.",
        },
        {
          id: "q6",
          question: "Est-ce que j'ai le droit à l'erreur pendant le projet ?",
          options: [
            "Non, il faut tout réussir du premier coup",
            "Oui, je peux tester, me tromper, corriger",
            "Non, sinon je rate mon CAP",
          ],
          correct: 1,
          explication: "Le chef-d'œuvre est une démarche : essais, erreurs, améliorations.",
        },
        {
          id: "q7",
          question: "Si je travaille en groupe, qu'est-ce que le jury veut savoir ?",
          options: [
            "Rien, c'est collectif",
            "Ce que chacun a fait individuellement",
            "Seulement le résultat final",
          ],
          correct: 1,
          explication: "Ta part individuelle doit être clairement identifiable à l'oral.",
        },
        {
          id: "q8",
          question: "Les profs m'évaluent sur :",
          options: [
            "Seulement le résultat final",
            "Seulement l'oral",
            "Ma démarche ET ma réalisation ET mon oral",
          ],
          correct: 2,
          explication: "Démarche + réalisation + capacité à expliquer à l'oral.",
        },
      ],
      // V4.8 — Épreuve d'attestation J1 : Comprendre le chef-d'œuvre
      epreuve: {
        id: "ep_comprendre_cdo",
        titre: "Épreuve d'attestation — Comprendre le chef-d'œuvre",
        verbe_action: "EXPLIQUER",
        objectif: "Expliquer ce qu'est le chef-d'œuvre du CAP, ses modalités d'évaluation et les attendus de l'épreuve orale finale.",
        mise_en_situation: "Un nouvel élève arrive dans la classe en cours d'année. Il ne sait pas ce qu'est le chef-d'œuvre. Tu dois être capable de lui expliquer simplement de quoi il s'agit, combien de temps cela dure, comment il sera évalué et ce qu'il devra faire à l'oral final.",
        seuil: 12,
        duree: "20 à 30 minutes",
        questions: [
          // QCM connaissances modalités
          { id: "ep1", type: "qcm", points: 2,
            question: "Le chef-d'œuvre dure :",
            options: ["Un trimestre", "Un an", "Deux ans (toute la formation CAP)", "Trois ans"],
            correct: 2 },
          { id: "ep2", type: "qcm", points: 2,
            question: "Le chef-d'œuvre est :",
            options: ["Un simple devoir", "Une réalisation concrète liée au métier", "Un stage en entreprise", "Un examen écrit"],
            correct: 1 },
          { id: "ep3", type: "qcm", points: 2,
            question: "L'oral final dure :",
            options: ["5 minutes", "10 minutes", "20 minutes", "30 minutes"],
            correct: 1 },
          { id: "ep4", type: "qcm", points: 2,
            question: "Pendant l'oral, tu peux utiliser un support de :",
            options: ["2 pages maximum", "5 pages maximum", "10 pages maximum", "Sans limite"],
            correct: 1 },

          // Mots
          { id: "ep5", type: "mots", points: 3,
            question: "Cite 2 capacités évaluées à l'oral du chef-d'œuvre (un mot ou expression par champ).",
            n_champs: 2,
            cles: [
              "demarche","démarche","réalisation","realisation",
              "analyse","analyser",
              "présentation","presentation","présenter","presenter",
              "argumentation","argumenter","argument","arguments",
              "difficulté","difficultes","difficulté rencontrée","difficultes rencontrees",
              "amélioration","ameliorations","amelioration",
              "réflexivité","reflexivite",
              "vocabulaire","clarte","clarté",
              "individuel","collectif","part individuelle"
            ] },
          { id: "ep6", type: "mots", points: 2,
            question: "Quel est le nom de notre projet précis cette année ? (en 2 ou 3 mots-clés)",
            n_champs: 2,
            cles: [
              "repas","menu","équilibré","equilibre","éco-responsable","eco-responsable","ecoresponsable","éco","eco","responsable",
              "à emporter","a emporter","emporter"
            ] },

          // Phrases (validation enseignant)
          { id: "ep7", type: "phrase", points: 3,
            question: "Avec tes propres mots, explique en 2 phrases ce qu'est un chef-d'œuvre.",
            indice_correction: "Réponse attendue : projet concret, lié au métier, mené sur 2 ans, présenté à l'oral à la fin du CAP. Tolérer les variantes.",
            attendu: "Idée de réalisation concrète, durée 2 ans, lien avec le métier" },
          { id: "ep8", type: "phrase", points: 3,
            question: "Comment peux-tu être évalué·e pendant le chef-d'œuvre ? Cite les 2 grandes parties de la note.",
            indice_correction: "Réponse attendue : 50 % notes du livret de formation pendant les 2 ans + 50 % oral final.",
            attendu: "Mentionne livret + oral final, ou les deux composantes" },
          { id: "ep9", type: "phrase", points: 3,
            question: "Si tu ne réussis pas du premier coup une étape, qu'est-ce que tu fais ? Explique en quelques phrases.",
            indice_correction: "L'élève doit comprendre qu'il a le droit à l'erreur, qu'on peut tester, corriger, recommencer, et que cela fait partie de la démarche.",
            attendu: "Notion de droit à l'erreur, de démarche, d'amélioration" },
        ],
        criteres_grille: [
          {
            label: "Connaissance des modalités du chef-d'œuvre",
            indicateur: "L'élève connaît la durée (2 ans), la nature (réalisation concrète liée au métier), et les contraintes formelles de l'oral (10 min, 5 pages max).",
            capacite: "Connaître le cadre officiel du chef-d'œuvre et ses modalités.",
            remediation: "Reprendre la fiche d'information officielle du chef-d'œuvre (durée, oral, pages, évaluation) et la relire jusqu'à la maîtriser.",
            questions: ["ep1","ep2","ep3","ep4"],
          },
          {
            label: "Connaissance du projet de l'année",
            indicateur: "L'élève sait nommer le projet précis : un repas / menu équilibré et éco-responsable à emporter.",
            capacite: "Identifier et nommer le projet personnel mené dans le cadre du chef-d'œuvre.",
            remediation: "Revoir le titre exact du projet et ses deux dimensions (équilibré + éco-responsable).",
            questions: ["ep6"],
          },
          {
            label: "Connaissance des capacités évaluées à l'oral",
            indicateur: "L'élève cite des capacités évaluées : démarche, analyse, présentation, argumentation, réflexivité.",
            capacite: "Identifier ce qui est attendu et évalué à l'oral final.",
            remediation: "Lister les capacités évaluées (démarche, analyse, présentation, argumentation) et s'entraîner à les reconnaître.",
            questions: ["ep5"],
          },
          {
            label: "Capacité à expliquer le chef-d'œuvre avec ses mots",
            indicateur: "L'élève reformule clairement et simplement ce qu'est le chef-d'œuvre.",
            capacite: "Reformuler une notion scolaire en langage courant compréhensible.",
            remediation: "S'entraîner à expliquer le chef-d'œuvre à voix haute, sans lire ses notes, en 2 ou 3 phrases simples.",
            questions: ["ep7"],
          },
          {
            label: "Connaissance des règles d'évaluation et du droit à l'erreur",
            indicateur: "L'élève connaît la composition de la note (livret + oral) et comprend que l'erreur fait partie de la démarche.",
            capacite: "Comprendre l'évaluation du chef-d'œuvre et adopter une posture de progression.",
            remediation: "Revoir la composition de la note (50/50) et la posture attendue : tester, se tromper, améliorer.",
            questions: ["ep8","ep9"],
          },
        ],
      },

      ressources: [
        { id: "r_mapse_j1", type: "lien_externe",
          url: "https://mapse2.fr",
          titre: "Espace pédagogique mapse2.fr — partie chef-d'œuvre",
          description: "Ressources complémentaires de l'enseignant·e." },
        { id: "r_video_cdo", type: "video",
          url: "https://www.youtube.com/results?search_query=chef+d+oeuvre+cap+presentation",
          titre: "Vidéos sur le chef-d'œuvre en CAP",
          description: "Vidéos d'élèves et enseignants présentant le chef-d'œuvre (à choisir par l'enseignant)." },
      ],

      exercice: {
        type: "ordering",
        titre: "🧩 Remets les grandes étapes du projet dans l'ordre",
        consigne: "Fais glisser (ou clique sur ↑ ↓) pour remettre les étapes du chef-d'œuvre dans le bon ordre, du début à la fin.",
        items: [
          { id: "e1", label: "🔍 Je comprends ce qu'est le chef-d'œuvre",                     order: 1 },
          { id: "e2", label: "📝 Je décris mon projet (mon repas à emporter)",                 order: 2 },
          { id: "e3", label: "📚 J'apprends les notions (équilibre, hygiène, éco, étiquetage)", order: 3 },
          { id: "e4", label: "🍽️ Je conçois mon menu (composition, emballage, couverts, étiquette)", order: 4 },
          { id: "e5", label: "👨‍🍳 Je réalise et je teste mon repas (année 2)",                  order: 5 },
          { id: "e6", label: "🎤 Je prépare et passe mon oral (juin 2027)",                     order: 6 },
        ],
      },
    },
    fields: [
      { id: "compris",    label: "✍️ Avec mes mots : ce que j'ai compris du chef-d'œuvre", type: "textarea" },
      { id: "reussir",    label: "✍️ Ce que je dois réussir à faire",                       type: "textarea" },
      { id: "important",  label: "✍️ Ce qui me paraît important / une question que je me pose", type: "textarea" },
    ],
  },
  {
    id: "planification",
    annee: "both",
    teacher_only: true,
    titre: "Planification du projet",
    description: "Les grandes étapes, le calendrier et les contraintes.",
    pedago: {
      consigne: "Listez les grandes étapes du projet et placez-les dans le temps (année 1, année 2).",
      production: "Un calendrier ou une liste d'étapes tenant compte des PFMP, des vacances et de l'oral.",
      attentes: "Les dates clés et les contraintes doivent apparaître clairement.",
    },
    fields: [
      { id: "etapes",      label: "Grandes étapes prévues",            type: "textarea" },
      { id: "calendrier",  label: "Calendrier sur 2 ans",              type: "textarea" },
      { id: "pfmp",        label: "Périodes de PFMP",                  type: "textarea" },
      { id: "vacances",    label: "Vacances à prendre en compte",      type: "textarea" },
      { id: "delais",      label: "Délais importants",                 type: "textarea" },
      { id: "oral",        label: "Préparation de l'oral",             type: "textarea" },
      { id: "remarques",   label: "Autres remarques",                  type: "textarea" },
    ],
  },
  {
    // =====================================================================
    // V3 — MODULE J2 : Mon assiette équilibrée
    // Sources officielles : Programme National Nutrition Santé (PNNS 2019-2023),
    // Santé Publique France — mangerbouger.fr ; ANSES (Agence nationale de
    // sécurité sanitaire) — repères de consommation.
    // =====================================================================
    id: "equilibre",
    annee: "A1",
    titre: "🥗 L'assiette équilibrée (notions)",
    description: "Avant de composer ton repas, tu dois maîtriser les notions : groupes alimentaires, constituants, besoins de l'organisme et règle ½ ¼ ¼.",
    pedago: {
      consigne: "Lis chaque cours (avec l'audio si tu veux), fais le quiz et classe les aliments.",
      production: "Un quiz réussi, des aliments bien classés, et ma propre assiette équilibrée.",
      attentes: "Tu sais expliquer ce qu'est un repas équilibré avec des arguments nutritionnels.",
    },
    module: {
      jalon_id: "j2_repas_equilibre",
      cours: [
        {
          id: "c1",
          titre: "🧺 Les 7 groupes d'aliments",
          texte: `Pour bien manger, on classe les aliments en **grandes familles** (source : Programme National Nutrition Santé).

**Les 7 groupes**

1. **Fruits et légumes** — vitamines, minéraux, fibres
2. **Féculents et céréales** — pâtes, riz, pain, pommes de terre. Donnent de l'**énergie**
3. **Produits laitiers** — lait, yaourt, fromage. Apportent du **calcium**
4. **VPO** : Viandes, Poissons, Œufs. Apportent les **protéines**
5. **Matières grasses** — huile, beurre. En petite quantité
6. **Produits sucrés** — à limiter
7. **Boissons** — l'**eau** est la seule indispensable`,
        },
        {
          id: "c2",
          titre: "🧬 Les constituants alimentaires et leurs rôles",
          texte: `Les aliments apportent **6 constituants** qui ont chacun un rôle précis dans le corps.

- 🏗️ **Protides (protéines)** — les **bâtisseurs** : construisent les muscles, les os, les cheveux. *Viande, poisson, œufs, légumes secs.*
- ⚡ **Glucides** — les **carburants rapides** de l'organisme. *Pâtes, riz, pain, fruits.*
- 🛢️ **Lipides** — l'**énergie de réserve**. *Huiles, beurre, fruits à coque.*
- 🛡️ **Vitamines et minéraux** — les **protecteurs**. *Fruits, légumes, produits laitiers.*
- 💧 **Eau** — vitale, elle représente environ **60 % du corps humain**.`,
        },
        {
          id: "c3",
          titre: "💪 Les besoins de l'organisme",
          texte: `Notre corps a besoin d'**énergie** tous les jours pour vivre, bouger, grandir. On mesure cette énergie en **kilocalories (kcal)**.

> 📌 Un adolescent a besoin d'environ **2 200 à 2 800 kcal par jour**.

Ces besoins varient selon :

- L'**âge**
- Le **sexe**
- L'**activité physique**

> 💡 Pour bien fonctionner, l'organisme a besoin d'un **apport équilibré** entre les groupes d'aliments. Chaque repas doit combiner plusieurs groupes pour couvrir tous les besoins.`,
        },
        {
          id: "c4",
          titre: "🍽️ La règle d'or : ½ · ¼ · ¼",
          texte: `Pour composer une **assiette équilibrée**, pense à la règle visuelle recommandée par **Santé Publique France**.

- 🥗 **½ légumes** — la moitié de l'assiette : crus ou cuits, variés
- 🍚 **¼ féculents** — pâtes, riz, pain, pommes de terre, lentilles
- 🍗 **¼ protéines** — VPO ou légumes secs

**À ajouter au repas**

- Un **produit laitier**
- Un **fruit frais** en dessert
- Un **verre d'eau**

> 📌 Cette règle simple garantit un repas équilibré.`,
        },
        {
          id: "c6",
          titre: "🫘 Penser aux légumineuses",
          texte: `Les **légumineuses** (lentilles, haricots, pois chiches, fèves) sont à la fois des **féculents** ET des **protéines végétales**.

> 💡 Le **ministère de l'Agriculture** recommande d'en consommer plus souvent.

**Pourquoi ?**

- Bon pour la **santé**
- **Économique**
- Bon pour la **planète**

Tu peux remplacer parfois la viande par un plat de lentilles ou de pois chiches.`,
        },
        {
          id: "c5",
          titre: "💡 Astuces pour un vrai repas équilibré",
          texte: `**Quelques règles simples à appliquer chaque jour**

- 🌈 **Varie les couleurs** dans ton assiette : plus c'est coloré, plus c'est riche en vitamines
- ✨ Privilégie les aliments **peu transformés**
- ⚠️ Attention au **gras caché** et au **sel** : lis les étiquettes
- 🍬 Limite les **produits sucrés** et les **boissons sucrées**
- 💧 Bois au moins **1,5 litre d'eau** par jour

> 📌 Ces repères viennent du site officiel **mangerbouger.fr**, mis à jour par Santé Publique France.`,
        },
      ],
      qcm: [
        { id: "q1", lie_cours: "c1", question: "Combien y a-t-il de grands groupes d'aliments ?",
          options: ["3", "5", "7", "10"], correct: 2,
          explication: "7 groupes selon le PNNS (Programme National Nutrition Santé)." },
        { id: "q2", lie_cours: "c2", question: "Les protéines (protides) sont surtout des…",
          options: ["Carburants rapides", "Bâtisseurs du corps", "Protecteurs", "Réserves de graisse"],
          correct: 1, explication: "Les protéines construisent les muscles, les os, etc." },
        { id: "q3", lie_cours: "c1", question: "Dans quel groupe classer les pâtes ?",
          options: ["Fruits et légumes", "Féculents et céréales", "Produits laitiers", "Matières grasses"],
          correct: 1 },
        { id: "q4", lie_cours: "c1", question: "Le calcium se trouve surtout dans :",
          options: ["Les pâtes", "Les produits laitiers", "Les matières grasses", "Les fruits"],
          correct: 1, explication: "Lait, yaourt, fromage sont riches en calcium." },
        { id: "q5", lie_cours: "c4", question: "Dans une assiette équilibrée, les légumes occupent :",
          options: ["Un quart", "Un tiers", "La moitié", "Tout"],
          correct: 2, explication: "La MOITIÉ de l'assiette (½), c'est la règle ½ ¼ ¼." },
        { id: "q6", lie_cours: "c4", question: "Les protéines occupent :",
          options: ["La moitié", "Un quart", "Rien", "Trois quarts"],
          correct: 1, explication: "Un quart (¼) de l'assiette." },
        { id: "q7", lie_cours: "c5", question: "Quelle est la seule boisson indispensable ?",
          options: ["Le jus de fruit", "Le lait", "L'eau", "Le soda"],
          correct: 2 },
        { id: "q8", lie_cours: "c3", question: "Un adolescent a besoin de combien de kcal par jour environ ?",
          options: ["500-800", "1 200-1 500", "2 200-2 800", "5 000"], correct: 2 },
        { id: "q9", lie_cours: "c2", question: "Les lipides (huile, beurre) jouent surtout le rôle de :",
          options: ["Bâtisseurs", "Énergie de réserve", "Protecteurs", "Hydratants"],
          correct: 1 },
        { id: "q10", lie_cours: "c5", question: "Pour bien manger, il faut :",
          options: ["Manger tout le temps la même chose", "Varier les couleurs et les groupes", "Éviter les légumes", "Manger seulement des protéines"],
          correct: 1, explication: "La variété = équilibre." },
      ],
      infographie: {
        titre: "📊 L'assiette équilibrée — infographie interactive",
        fichier: "Assiette_Equilibree.html",
        hauteur: "650px",
      },
      ressources: [
        // V4.9 — Vidéos / liens externes
        { id: "r_mapse_j2", type: "lien_externe",
          url: "https://mapse2.fr",
          titre: "Espace pédagogique mapse2.fr — partie chef-d'œuvre",
          description: "Ressources complémentaires de l'enseignant·e (vidéos, fiches, exercices)." },
        { id: "r_video_assiette", type: "video",
          url: "https://www.youtube.com/results?search_query=manger+bouger+assiette+%C3%A9quilibr%C3%A9e",
          titre: "Vidéos Manger Bouger — l'assiette équilibrée",
          description: "Vidéos officielles de Santé Publique France (à choisir/ajouter par l'enseignant)." },
        { id: "r_pnns", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_pnns.html",
          titre: "Le PNNS — Manger mieux pour vivre mieux",
          description: "Fiche claire : les repères officiels du Programme National Nutrition Santé." },
        { id: "r_lentilles", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_legumineuses.html",
          titre: "Plus de légumineuses dans l'assiette",
          description: "Pourquoi mettre lentilles, pois chiches et haricots dans tes recettes." },
      ],
      // V4.7 — Épreuve d'attestation "Mon assiette équilibrée"
      // Mix de QCM (auto), questions à mots-clés (auto), questions à phrase (validation enseignant).
      // Seuil 12/20 pour débloquer l'attestation, mais validation enseignant requise avant impression.
      epreuve: {
        id: "ep_assiette",
        titre: "Épreuve d'attestation — Composer une assiette équilibrée",
        verbe_action: "COMPOSER",
        objectif: "une assiette équilibrée respectant la règle ½ légumes / ¼ féculents / ¼ protéines, à partir des groupes alimentaires et des constituants nutritionnels étudiés (PNNS, Santé Publique France).",
        mise_en_situation: "Vous êtes apprenti(e) cuisinier(ère) dans un restaurant scolaire. Le chef vous demande de composer un menu du jour pour les élèves de votre lycée. Le menu doit respecter les règles de l'équilibre alimentaire : il doit comporter les bons groupes d'aliments dans les bonnes proportions et les bons constituants pour la santé. Vous devez aussi savoir justifier vos choix.",
        seuil: 12,
        duree: "30 à 45 minutes",
        questions: [
          // ----- Partie 1 : Connaissances (QCM) -----
          { id: "ep1", type: "qcm", points: 2,
            question: "Dans une assiette équilibrée, les légumes doivent occuper :",
            options: ["Un quart", "Un tiers", "La moitié", "La totalité"], correct: 2 },
          { id: "ep2", type: "qcm", points: 2,
            question: "Les protides (protéines) ont surtout un rôle de :",
            options: ["Carburant rapide", "Bâtisseur des muscles, os, cheveux", "Réserve de graisse", "Hydratation"],
            correct: 1 },
          { id: "ep3", type: "qcm", points: 2,
            question: "Quel constituant alimentaire est le carburant rapide de l'organisme ?",
            options: ["Les protides", "Les glucides", "Les lipides", "Les vitamines"], correct: 1 },
          { id: "ep4", type: "qcm", points: 2,
            question: "Le calcium, indispensable aux os, se trouve principalement dans :",
            options: ["Les pâtes", "Les produits laitiers", "Les huiles", "Les fruits"], correct: 1 },

          // ----- Partie 2 : Vocabulaire (mots à écrire) -----
          { id: "ep5", type: "mots", points: 3,
            question: "Cite 3 groupes d'aliments différents (un par champ).",
            n_champs: 3,
            cles: [
              "fruit","fruits","légume","legume","légumes","legumes",
              "féculent","feculent","féculents","feculents","céréale","cereale","céréales","cereales",
              "produit laitier","produits laitiers","laitier","laitiers","lait",
              "viande","viandes","poisson","poissons","œuf","oeuf","œufs","oeufs","vpo",
              "matière grasse","matieres grasses","matiere grasse","matières grasses","gras","huile","beurre",
              "sucre","sucré","sucres","produit sucré","produits sucrés",
              "boisson","boissons","eau"
            ] },
          { id: "ep6", type: "mots", points: 2,
            question: "Donne 2 exemples d'aliments source de PROTÉINES (un par champ).",
            n_champs: 2,
            cles: ["viande","poulet","dinde","bœuf","boeuf","veau","porc","jambon","steak",
                   "poisson","saumon","thon","cabillaud","colin","sardine",
                   "œuf","oeuf","œufs","oeufs",
                   "tofu","seitan",
                   "lentille","lentilles","pois chiche","pois chiches","haricot","haricots","légumineuse","légumineuses","fève","fèves",
                   "fromage","yaourt","mozzarella"] },

          // ----- Partie 3 : Application (phrase courte, validation enseignant) -----
          { id: "ep7", type: "phrase", points: 3,
            question: "Avec tes propres mots, explique la règle de l'assiette ½ ¼ ¼ (en 2 phrases maximum).",
            indice_correction: "L'élève doit parler de ½ légumes, ¼ féculents, ¼ protéines, en mentionnant que c'est la proportion idéale dans l'assiette.",
            attendu: "Évoque les 3 zones avec proportions" },
          { id: "ep8", type: "phrase", points: 3,
            question: "Le menu suivant est-il équilibré ? Justifie. Menu : carottes râpées + poulet seul + yaourt.",
            indice_correction: "Bonne réponse attendue : NON, il manque des féculents (riz, pâtes, pommes de terre, pain) pour apporter de l'énergie.",
            attendu: "Identifie le déséquilibre + propose un féculent" },
          { id: "ep9", type: "phrase", points: 3,
            question: "Cite un repas équilibré complet (entrée, plat, dessert) que tu pourrais proposer dans la cantine. Précise les ingrédients.",
            indice_correction: "L'élève doit proposer un repas avec les 3 groupes principaux + un dessert pertinent. Tolérer les variantes.",
            attendu: "3 groupes représentés, repas faisable et logique" },
        ],
        // V4.8 — Critères enrichis : chaque critère porte une capacité ciblée
        // et une remédiation concrète si le niveau est insuffisant.
        // Lien avec les questions : ids des questions qui évaluent ce critère.
        criteres_grille: [
          {
            label: "Connaissance des groupes alimentaires",
            indicateur: "L'élève cite et classe correctement les 7 groupes (fruits/légumes, féculents, VPO, produits laitiers, matières grasses, sucrés, boissons).",
            capacite: "Connaître et différencier les 7 groupes alimentaires.",
            remediation: "Reprendre la liste des 7 groupes et leurs caractéristiques. S'entraîner à classer des aliments concrets par groupe.",
            questions: ["ep5"],
          },
          {
            label: "Connaissance des constituants et de leurs rôles",
            indicateur: "L'élève associe protides, glucides, lipides, vitamines, minéraux et eau à leur rôle dans l'organisme (bâtisseur, énergie, protection, hydratation).",
            capacite: "Identifier les constituants alimentaires et expliquer leur rôle pour la santé.",
            remediation: "Revoir la fonction de chaque constituant. S'entraîner sur des associations aliment → constituant principal → rôle.",
            questions: ["ep2","ep3","ep4","ep6"],
          },
          {
            label: "Application de la règle ½ légumes / ¼ féculents / ¼ protéines",
            indicateur: "L'élève applique correctement la proportion lors de la composition ou de l'analyse d'un menu.",
            capacite: "Composer une assiette équilibrée selon la règle ½ ¼ ¼.",
            remediation: "S'entraîner à dessiner et composer plusieurs assiettes équilibrées différentes en respectant les proportions.",
            questions: ["ep1","ep7"],
          },
          {
            label: "Capacité d'analyse et de proposition d'amélioration",
            indicateur: "L'élève identifie ce qui manque dans un menu donné et propose un aliment concret pour rétablir l'équilibre.",
            capacite: "Analyser un menu existant, repérer le déséquilibre et proposer une amélioration concrète.",
            remediation: "Travailler des cas pratiques d'analyse de menus déséquilibrés. Pour chaque cas, identifier la famille d'aliments manquante et proposer 2 ou 3 aliments précis.",
            questions: ["ep8"],
          },
          {
            label: "Vocabulaire technique et argumentation",
            indicateur: "L'élève utilise un vocabulaire nutritionnel précis (groupes, constituants, rôles) et justifie ses choix.",
            capacite: "Utiliser le vocabulaire de la nutrition et argumenter un choix alimentaire.",
            remediation: "Constituer un lexique personnel des termes essentiels et s'entraîner à formuler des phrases d'argumentation type « Ce repas est équilibré parce que… ».",
            questions: ["ep9"],
          },
        ],
      },

      exercice: {
        type: "classification",
        titre: "🎯 Place chaque aliment dans le bon groupe",
        consigne: "Clique sur un aliment puis sur le groupe où il va. Vérifie à la fin.",
        colonnes: [
          { id: "legumes",   label: "½ Légumes",   color: "#d5ecdd" },
          { id: "feculents", label: "¼ Féculents", color: "#fff0cc" },
          { id: "proteines", label: "¼ Protéines", color: "#fadbdf" },
        ],
        items: [
          { id: "i1", label: "🥕 Carottes",       correct: "legumes"   },
          { id: "i2", label: "🍚 Riz",            correct: "feculents" },
          { id: "i3", label: "🐟 Saumon",         correct: "proteines" },
          { id: "i4", label: "🥦 Brocoli",        correct: "legumes"   },
          { id: "i5", label: "🍝 Pâtes",          correct: "feculents" },
          { id: "i6", label: "🥚 Œuf",            correct: "proteines" },
          { id: "i7", label: "🥗 Salade verte",   correct: "legumes"   },
          { id: "i8", label: "🍞 Pain",           correct: "feculents" },
          { id: "i9", label: "🍗 Poulet",         correct: "proteines" },
          { id: "i10", label: "🫘 Lentilles",     correct: "proteines" },
          { id: "i11", label: "🥔 Pommes de terre", correct: "feculents" },
          { id: "i12", label: "🍅 Tomate",        correct: "legumes"   },
        ],
      },
    },
    fields: [
      { id: "appris",         label: "✍️ Ce que j'ai appris (3 choses)",     type: "textarea" },
      { id: "retiens",        label: "✍️ Ce que je retiens pour mon menu",   type: "textarea" },
      { id: "mon_assiette",   label: "✍️ Exemple d'assiette équilibrée que je pourrais faire",   type: "textarea" },
    ],
  },
  {
    id: "repas_equilibre",
    annee: "A1",
    titre: "Composer un repas équilibré",
    description: "Construire un repas complet et justifier ses choix.",
    pedago: {
      consigne: "Proposez un repas complet (entrée, plat, dessert) et justifiez son équilibre.",
      production: "Un repas cohérent avec une justification nutritionnelle.",
      attentes: "L'équilibre doit être démontré, pas seulement affirmé.",
    },
    fields: [
      // ===== Composantes du repas (chacune sa propre rangée visuelle) =====
      { id: "entree",          label: "🥗 Entrée",                        type: "composante_repas", composante: "entree",  facultatif: false },
      { id: "plat",            label: "🍽️ Plat principal",                type: "composante_repas", composante: "plat",    facultatif: false },
      { id: "laitage",         label: "🧀 Laitage",                        type: "composante_repas", composante: "laitage", facultatif: true },
      { id: "dessert",         label: "🍎 Dessert",                        type: "composante_repas", composante: "dessert", facultatif: false },
      { id: "boisson",         label: "🥤 Boisson",                        type: "composante_repas", composante: "boisson", facultatif: true },

      // ===== V4.47 : Plateau à emporter =====
      { id: "emballage_plat",  label: "📦 Emballage du plat",             type: "image_picker_single", banque_cat: "emballages", banque_subs: ["Boîtes & barquettes"], hint: "Choisis ta boîte ou barquette pour transporter le plat principal." },
      { id: "couverts_emporte",label: "🍴 Couverts",                       type: "image_picker_single", banque_cat: "emballages", banque_subs: ["Couverts"], hint: "Choisis le couvert qui accompagne ton plat." },
      { id: "verre_emporte",   label: "🥃 Verre / Gobelet",               type: "image_picker_single", banque_cat: "emballages", banque_subs: ["Verres & gobelets"], hint: "Pour la boisson." },
      { id: "serviette_emporte",label:"🧻 Serviette",                     type: "image_picker_single", banque_cat: "emballages", banque_subs: ["Serviettes & accessoires"], hint: "Une serviette est-elle nécessaire ?" },
      { id: "accessoires_emporte", label: "🧂 Petits accessoires (sel, ketchup, sucre, condiments…)", type: "image_picker_multi", banque_cat: "emballages", banque_subs: ["Condiments individuels"], hint: "Sélectionne tous les petits accessoires que tu mets dans le plateau." },

      // ===== Justifications (V4.52 : avec mots-clés cliquables) =====
      { id: "equilibre_global",label: "Pourquoi mon repas est équilibré (synthèse)", type: "textarea_keywords", keywords_bank: "equilibre_repas",
        placeholder: "Ex : Mon repas est équilibré parce que la moitié de l'assiette est en légumes…" },
      { id: "justification",   label: "Justification nutritionnelle complémentaire", type: "textarea_keywords", keywords_bank: "nutrition_repas",
        placeholder: "Ex : Les carottes apportent des vitamines, le riz apporte de l'énergie (glucides)…" },
      { id: "regle",           label: "Règle de composition utilisée",                type: "textarea_keywords", keywords_bank: "regle_repas",
        placeholder: "Ex : J'ai utilisé la règle ½ ¼ ¼ recommandée par le PNNS…" },
    ],
  },
  {
    // =====================================================================
    // V3 — MODULE J3 : Menu éco-responsable
    // Sources : ADEME (Agence de la Transition Écologique) — gaspillage
    // alimentaire ; ministère de l'Agriculture — SIQO (Label Rouge, AB, AOP) ;
    // mangerbouger.fr — produits de saison et circuits courts.
    // =====================================================================
    id: "eco_responsable",
    annee: "A1",
    titre: "🌱 Gaspillage, circuits courts et éco-responsabilité",
    description: "Avant de composer ton menu éco-responsable, tu dois maîtriser les notions essentielles : gaspillage alimentaire, saisonnalité, circuits courts, labels officiels et emballages.",
    pedago: {
      consigne: "Découvre les 5 cours, teste-toi au quiz et repère les produits de saison.",
      production: "Un menu revu avec des critères éco-responsables argumentés.",
      attentes: "Tu sais relier chaque choix à un vrai critère écologique.",
    },
    module: {
      jalon_id: "j3_eco_responsable",
      cours: [
        {
          id: "c1",
          titre: "🗑️ Le gaspillage alimentaire : chiffres, causes, conséquences",
          texte: `**Les chiffres en France**

- 🚮 Chaque personne jette environ **30 kg de nourriture par an**, dont **7 kg encore emballés**
- 📊 Au total : près de **10 millions de tonnes** de nourriture jetées chaque année

> *Source officielle : ADEME — Agence de la Transition Écologique.*

**Les causes principales**

- Portions trop importantes lors des achats
- Mauvaise **conservation**
- Confusion entre **DLC** et **DDM**
- Restes non réutilisés

**Les conséquences**

- 💶 **Économiques** : 240 € jetés par an et par personne
- 🌍 **Environnementales** : 3 % des émissions de CO₂ de la France
- 🤝 **Sociales** : alors que des millions de personnes ont faim`,
          image: {
            fichier: "ressources_eco/2509_gaspillage_inf.png",
            legende: "Source : Ministère de l'Agriculture — campagne nationale anti-gaspi",
          },
        },
        {
          id: "c2",
          titre: "✋ Comment lutter contre le gaspillage : les bons gestes",
          texte: `Il existe des **gestes simples** pour réduire le gaspillage.

1. 📝 Faire une **liste** de courses pour acheter le juste nécessaire
2. ⚖️ **Respecter les portions** : adapter les quantités cuisinées au nombre de convives
3. ♻️ **Utiliser les restes** : les transformer en nouvelles recettes (gratin, salade, soupe)
4. ❄️ **Bien conserver** : ranger correctement le frigo, congeler ce qui ne sera pas mangé
5. 📅 **Comprendre les dates** :

> ⚠️ **DLC** (Date Limite de Consommation) — « À consommer jusqu'au… ». Doit être **respectée** pour les produits frais.

> 💡 **DDM** (Date de Durabilité Minimale) — « À consommer de préférence avant… ». Peut être **dépassée sans danger** pour la santé : le produit peut juste perdre du goût.`,
        },
        {
          id: "c3",
          titre: "❄️ Bien ranger son frigo : un geste anti-gaspi essentiel",
          texte: `Le frigo n'est pas un endroit uniforme : il a des **zones de températures différentes** !

**Les 5 zones du frigo**

- 🔝 **Le haut** (4-6 °C) — restes, fromages, yaourts
- ➖ **Le milieu** (3-4 °C) — viandes cuites, plats préparés
- 🥶 **Le bas** (0-3 °C, zone la plus froide) — viandes et poissons **crus**, charcuteries
- 🥬 **Le bac à légumes** (8-10 °C) — fruits et légumes frais
- 🚪 **La porte** (6-8 °C, zone la plus chaude) — œufs, beurre, sauces, boissons

> 📌 Bien ranger son frigo, c'est **prolonger la durée de vie** des aliments et **éviter de jeter**.`,
          image: {
            fichier: "ressources_eco/infographie_un_frigo_bien_range.png",
            legende: "Source : Ministère de l'Agriculture",
          },
        },
        {
          id: "c4",
          titre: "📅 Manger de saison : meilleur, moins cher, plus écolo",
          texte: `Un **produit de saison**, c'est un fruit ou un légume qui pousse **naturellement** à un moment précis de l'année dans notre région.

**Les fruits et légumes par saison**

- ❄️ **Hiver** — poireaux, choux, carottes, pommes, oranges
- 🌷 **Printemps** — asperges, radis, fraises
- ☀️ **Été** — tomates, courgettes, pêches, melons
- 🍂 **Automne** — courges, champignons, raisin

> ⚠️ Exemple : à Lyon, en plein mois de décembre, acheter des poivrons ou des fraises veut dire qu'ils viennent d'Espagne ou du Maroc, sous **serres chauffées** ou en **avion**. Ce n'est **pas de saison**, c'est polluant et cher.

**Pourquoi manger de saison ?**

- 😋 **Meilleur goût**
- 💶 **Moins cher**
- 🌱 Beaucoup **moins de CO₂**
- 👨‍🌾 **Soutien à l'agriculture locale**`,
        },
        {
          id: "c5",
          titre: "🚚 Les circuits courts et la filière de proximité",
          texte: `Un **circuit court**, c'est quand il y a **au maximum 1 intermédiaire** entre le producteur et toi.

> *Définition officielle du ministère de l'Agriculture, 2009.*

**Exemples de circuits courts**

- 🏪 **Marché**
- 👨‍🌾 **Vente directe à la ferme**
- 🌾 **AMAP** (Association pour le Maintien d'une Agriculture Paysanne)
- 🚗 **Magasin de producteurs** (« Drive fermier »)
- 🛒 **Magasins de quartier**

**La filière de proximité**

C'est le fait d'acheter des produits cultivés ou fabriqués **près de chez nous** (notre région, par exemple Auvergne-Rhône-Alpes).

**Les avantages**

- 🚛 Moins de kilomètres parcourus → beaucoup **moins de CO₂**
- 👨‍🌾 **Soutien direct** aux agriculteurs locaux
- 🥬 Produits plus **frais et goûteux**
- 🔍 **Traçabilité** claire`,
          image: {
            fichier: "ressources_eco/labelcircuitcourt.jpg",
            legende: "Le label « Circuit court » identifie ces produits.",
          },
        },
        {
          id: "c6",
          titre: "🏅 Les labels officiels : SIQO",
          texte: `Les labels alimentaires officiels sont regroupés sous le nom de **SIQO** : Signes Officiels d'Identification de la Qualité et de l'Origine.

**Les principaux labels**

- 🌿 **AB** (Agriculture Biologique) — sans pesticides chimiques ni OGM. Certification européenne.
- 🏆 **Label Rouge** — garantit une qualité supérieure liée à un mode de production particulier
- 🇪🇺 **AOP** (Appellation d'Origine Protégée européenne) — produit lié à un terroir précis. *Exemples : Roquefort, Beaufort, Lentille du Puy.*
- 🇫🇷 **AOC** — équivalent français de l'AOP
- 📍 **IGP** (Indication Géographique Protégée) — lien plus large à une région
- 🛡️ **STG** (Spécialité Traditionnelle Garantie)

> 💡 Pour ton chef-d'œuvre, choisir un **produit labellisé** = preuve de **qualité** et d'**origine**.`,
        },
        {
          id: "c7",
          titre: "📦 Les emballages éco-responsables et la loi AGEC",
          texte: `Un bon emballage **protège le produit sans polluer**.

**À privilégier ✅**

- 📦 **Carton** et **papier** — recyclables à 100 %, biodégradables
- 🥃 **Verre** — recyclable à l'infini
- 🌽 **Bioplastiques** à base d'amidon de maïs — compostables
- ♻️ **Emballages réutilisables** — boîtes en inox, contenants consignés

**À éviter ❌**

- Le **plastique à usage unique**
- Le **polystyrène** (très polluant)

**La loi AGEC**

> 📌 La **loi AGEC** (Anti-Gaspillage et Économie Circulaire, 2020) interdit progressivement de nombreux plastiques jetables.

- Depuis **2023** : plus de vaisselle jetable dans la restauration à emporter quand on mange sur place
- Les **emballages plastiques** de fruits et légumes frais sont interdits sous certaines conditions

> 💡 Pour ton menu à emporter, vise un emballage **léger**, **recyclable ou compostable**, et **adapté au produit**.`,
        },
      ],
      qcm: [
        // V4.9 — questions remappées sur les nouveaux cours c1..c7
        { id: "q1",  lie_cours: "c4", question: "Un produit de saison c'est :",
          options: ["Un produit qu'on peut manger toute l'année", "Un produit qui pousse naturellement à un moment précis de l'année", "Un produit en promotion", "Un produit du supermarché"],
          correct: 1 },
        { id: "q2",  lie_cours: "c4", question: "En hiver à Lyon, quel légume est de saison ?",
          options: ["Tomate", "Courgette", "Poireau", "Fraise"], correct: 2 },
        { id: "q3",  lie_cours: "c5", question: "Un circuit court c'est :",
          options: ["Passer par une grande surface", "Au maximum 1 intermédiaire entre producteur et consommateur", "Un circuit sportif", "Manger vite"],
          correct: 1, explication: "Définition officielle du ministère de l'Agriculture (2009)." },
        { id: "q4",  lie_cours: "c1", question: "En France, combien de kg de nourriture chaque personne jette par an ?",
          options: ["1 kg", "10 kg", "30 kg", "100 kg"], correct: 2,
          explication: "Environ 30 kg / personne / an selon l'ADEME." },
        { id: "q5",  lie_cours: "c2", question: "La DLC c'est :",
          options: ["Date limite de consommation (à respecter sur les produits frais)", "Date de livraison", "Durée de cuisson", "Date de la commande"],
          correct: 0 },
        { id: "q6",  lie_cours: "c2", question: "La DDM c'est :",
          options: ["Date à ne jamais dépasser", "Date de dégustation maximale", "Date de Durabilité Minimale : le produit reste sûr après, mais peut perdre du goût", "Date de mise en rayon"],
          correct: 2 },
        { id: "q7",  lie_cours: "c6", question: "Le label AB garantit :",
          options: ["Un très bon goût", "Une agriculture sans pesticides chimiques ni OGM", "Le meilleur prix", "Un produit français"],
          correct: 1 },
        { id: "q8",  lie_cours: "c6", question: "AOP signifie :",
          options: ["À offrir aux parents", "Appellation d'Origine Protégée (produit d'un terroir précis)", "Agriculture Officielle de Paris", "Association des Origines Produites"],
          correct: 1 },
        { id: "q9",  lie_cours: "c7", question: "Le meilleur emballage pour l'environnement c'est :",
          options: ["Plastique noir", "Carton recyclable ou verre", "Polystyrène", "Aluminium"], correct: 1 },
        { id: "q10", lie_cours: "c5", question: "Pourquoi choisir des circuits courts ?",
          options: ["C'est plus cher", "Moins de transport donc moins de CO₂", "C'est plus long", "Ça ne change rien"], correct: 1 },
        // Nouvelles questions
        { id: "q11", lie_cours: "c3", question: "Dans le frigo, où ranger la viande crue ?",
          options: ["En haut (le plus chaud)", "Dans la porte", "Dans le bac à légumes", "En bas (le plus froid)"], correct: 3 },
        { id: "q12", lie_cours: "c7", question: "La loi AGEC, c'est :",
          options: ["Une loi sur les vacances", "La loi Anti-Gaspillage et Économie Circulaire (2020)", "Une loi pour les agriculteurs", "Une loi européenne sur l'alcool"],
          correct: 1 },
      ],
      // V4.9 — Épreuve d'attestation J3 : Concevoir un menu éco-responsable
      epreuve: {
        id: "ep_eco",
        titre: "Épreuve d'attestation — Concevoir un menu éco-responsable",
        verbe_action: "CHOISIR",
        objectif: "des produits et un emballage éco-responsables pour un menu, en tenant compte de la saison, des circuits courts, des labels officiels et de la lutte contre le gaspillage.",
        mise_en_situation: "Tu prépares ton menu de chef-d'œuvre, à emporter, pour le mois de mars à Lyon. Tu vas faire les courses pour acheter les produits et choisir l'emballage. Tu dois garantir une démarche éco-responsable : produits de saison, circuits courts, labels officiels, lutte contre le gaspillage et emballage à faible impact environnemental. Tu dois aussi savoir justifier tes choix face à ton client.",
        seuil: 12,
        duree: "30 à 45 minutes",
        questions: [
          // QCM connaissances (4)
          { id: "ep1", type: "qcm", points: 2,
            question: "Combien de kg de nourriture jette chaque Français·e par an ? (source ADEME)",
            options: ["10 kg", "20 kg", "30 kg", "100 kg"], correct: 2 },
          { id: "ep2", type: "qcm", points: 2,
            question: "Un produit qui dépasse sa DDM (Date de Durabilité Minimale) est :",
            options: ["Dangereux pour la santé, à jeter", "Toujours consommable, peut juste perdre du goût", "Forcément périmé", "Interdit à la vente partout"],
            correct: 1 },
          { id: "ep3", type: "qcm", points: 2,
            question: "Tu achètes en mars à Lyon. Lequel de ces fruits N'EST PAS de saison ?",
            options: ["Pomme", "Poire", "Fraise", "Orange"],
            correct: 2, explication: "La fraise française commence en avril/mai, en mars elle vient d'Espagne ou du Maroc." },
          { id: "ep4", type: "qcm", points: 2,
            question: "Un circuit court, c'est au maximum :",
            options: ["Aucun intermédiaire", "1 intermédiaire entre producteur et consommateur", "3 intermédiaires", "5 intermédiaires"],
            correct: 1 },

          // Mots (2)
          { id: "ep5", type: "mots", points: 3,
            question: "Cite 3 labels officiels de qualité ou d'origine (un par champ).",
            n_champs: 3,
            cles: [
              "ab","agriculture biologique","bio",
              "label rouge",
              "aop","appellation d'origine protégée","appellation d origine protegee",
              "aoc","appellation d'origine contrôlée","appellation d origine controlee",
              "igp","indication géographique protégée","indication geographique protegee",
              "stg","spécialité traditionnelle garantie","specialite traditionnelle garantie",
              "siqo","bleu blanc cœur","bleu blanc coeur","msc",
            ] },
          { id: "ep6", type: "mots", points: 2,
            question: "Cite 2 emballages éco-responsables (un par champ).",
            n_champs: 2,
            cles: [
              "carton","papier","papier recyclé","papier recycle",
              "verre","bocal",
              "bois",
              "bioplastique","bio plastique","amidon","amidon de mais","amidon de maïs","compostable","biodegradable","biodégradable",
              "métal","metal","aluminium","inox",
              "réutilisable","reutilisable","contenant consigné","consigne","consigné","tissu",
              "cire d'abeille","cire abeille","bee wrap"
            ] },

          // Phrases (3) — validation enseignant
          { id: "ep7", type: "phrase", points: 3,
            question: "Tu dois cuisiner des poivrons en plein mois de décembre à Lyon. Pourquoi ce n'est pas un choix éco-responsable ? Justifie en 2 phrases.",
            indice_correction: "Les poivrons ne poussent pas en décembre en France. Ils viennent donc d'Espagne / Maroc / Pays-Bas (avion ou serres chauffées). Cela génère beaucoup de CO₂, c'est plus cher, et ne soutient pas les producteurs locaux.",
            attendu: "Évoque le hors-saison + transport long + impact CO₂" },
          { id: "ep8", type: "phrase", points: 3,
            question: "Cite 2 gestes concrets pour lutter contre le gaspillage alimentaire en cuisine.",
            indice_correction: "Réponses possibles : adapter les portions, utiliser les restes, bien ranger le frigo, comprendre DLC/DDM, congeler, faire une liste de courses, etc.",
            attendu: "Au moins 2 gestes concrets et différents" },
          { id: "ep9", type: "phrase", points: 3,
            question: "Pour ton menu à emporter, quel emballage choisis-tu et pourquoi ? Donne 2 raisons.",
            indice_correction: "L'élève doit choisir un emballage recyclable, biodégradable, compostable, ou réutilisable. Raisons : peu polluant, conforme à la loi AGEC, en cohérence avec la démarche du chef-d'œuvre.",
            attendu: "Choix justifié par 2 critères écologiques pertinents" },
        ],
        criteres_grille: [
          {
            label: "Connaissance du gaspillage alimentaire et des moyens de lutte",
            indicateur: "L'élève cite les chiffres-clés du gaspillage (30 kg/personne/an) et propose des gestes concrets pour le réduire.",
            capacite: "Identifier l'ampleur du gaspillage alimentaire et proposer des actions concrètes pour le réduire.",
            remediation: "Reprendre les chiffres officiels de l'ADEME et lister 5 gestes anti-gaspi à appliquer en cuisine.",
            questions: ["ep1","ep8"],
          },
          {
            label: "Maîtrise des dates DLC / DDM",
            indicateur: "L'élève distingue clairement DLC (à consommer jusqu'au, obligatoire) et DDM (à consommer de préférence avant, le produit reste sûr).",
            capacite: "Lire et interpréter correctement les dates de consommation indiquées sur les produits.",
            remediation: "Revoir la différence DLC / DDM avec des exemples concrets de produits (yaourt, pâtes, conserve, viande).",
            questions: ["ep2"],
          },
          {
            label: "Saisonnalité et circuits courts",
            indicateur: "L'élève identifie les produits de saison à un moment donné et justifie l'intérêt d'un circuit court (CO₂, prix, fraîcheur, soutien local).",
            capacite: "Choisir des produits de saison et favoriser les circuits courts pour réduire l'impact environnemental.",
            remediation: "Étudier le calendrier des fruits et légumes de saison (Auvergne-Rhône-Alpes) et lister 3 lieux de circuit court possibles près du lycée (marché, AMAP, ferme).",
            questions: ["ep3","ep4","ep7"],
          },
          {
            label: "Connaissance des labels officiels",
            indicateur: "L'élève cite plusieurs labels SIQO (AB, Label Rouge, AOP, IGP) et sait ce qu'ils garantissent.",
            capacite: "Reconnaître les labels officiels et expliquer ce qu'ils certifient.",
            remediation: "Mémoriser les principaux labels SIQO, leur logo et ce qu'ils garantissent (qualité, origine, mode de production).",
            questions: ["ep5"],
          },
          {
            label: "Choix d'emballages éco-responsables",
            indicateur: "L'élève sélectionne des emballages adaptés (carton, verre, bioplastique, réutilisables) et argumente leur choix au regard de la loi AGEC.",
            capacite: "Choisir un emballage à faible impact environnemental et justifier ce choix.",
            remediation: "Comparer 4 emballages courants (plastique, carton, verre, bioplastique) sur les critères de recyclabilité et d'impact CO₂. Connaître les principales interdictions de la loi AGEC.",
            questions: ["ep6","ep9"],
          },
        ],
      },

      ressources: [
        // V4.9 — Vidéos et liens externes en tête de bibliothèque
        { id: "r_video_ademe", type: "video",
          url: "https://www.youtube.com/results?search_query=ademe+gaspillage+alimentaire",
          titre: "Vidéo ADEME — Stop au gaspillage alimentaire",
          description: "Vidéos officielles de sensibilisation (à choisir/ajouter par l'enseignant)." },
        { id: "r_lien_mapse", type: "lien_externe",
          url: "https://mapse2.fr",
          titre: "Espace pédagogique mapse2.fr — partie chef-d'œuvre",
          description: "Ressources complémentaires de l'enseignant·e (vidéos, fiches, exercices)." },
        // Gaspillage
        { id: "r_loi_agec", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_loi_agec.html",
          titre: "Loi AGEC — Anti-Gaspillage et Économie Circulaire",
          description: "L'essentiel à connaître sur la loi qui change tout depuis 2020." },
        { id: "r_lois_gaspi", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_lois_gaspi.html",
          titre: "Les lois françaises contre le gaspillage",
          description: "Garot, EGalim, AGEC : un repère simple sur 3 grandes lois." },
        { id: "r_affiches_antigaspi", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_campagne_antigaspi.html",
          titre: "La campagne nationale Antigaspi",
          description: "Les messages-clés pour ta propre affiche." },
        { id: "r_gaspi_astuces", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_astuces_antigaspi.html",
          titre: "Astuces anti-gaspi à la maison",
          description: "Des gestes simples pour ne plus rien jeter." },
        // Circuits courts
        { id: "r_circuit_def", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_circuit_court.html",
          titre: "Le circuit court : définition et exemples",
          description: "1 intermédiaire maximum entre le producteur et toi." },
        { id: "r_bio_local", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_bio_local_circuit.html",
          titre: "Bio, local, circuit-court : les différences",
          description: "Trois mots à ne pas confondre, expliqués clairement." },
        { id: "r_circuit_sani", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_circuit_sanitaire.html",
          titre: "Circuits courts : règles sanitaires",
          description: "Les règles d'hygiène allégées pour les petits producteurs." },
        // Emballages
        { id: "r_emb_plast", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_emballages_plastique.html",
          titre: "Réduire l'empreinte plastique des emballages",
          description: "Pourquoi et comment changer d'emballage." },
        { id: "r_pollu_decret", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_pollution_decret.html",
          titre: "Plastiques interdits : ce que dit la loi",
          description: "Liste des plastiques à usage unique interdits." },
        { id: "r_pollu_plast", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_pollution_plastique.html",
          titre: "Pollution plastique — les chiffres clés",
          description: "Comprendre l'enjeu en quelques chiffres." },
      ],
      exercice: {
        type: "classification",
        titre: "📅 Saison ou pas saison ? (mois de juillet)",
        consigne: "On est en été (juillet). Classe ces produits : sont-ils de saison ou HORS saison en France ?",
        colonnes: [
          { id: "saison",     label: "✅ De saison en juillet", color: "#d5ecdd" },
          { id: "hors_saison", label: "❌ Hors saison",         color: "#fadbdf" },
        ],
        items: [
          { id: "i1", label: "🍓 Fraises",       correct: "saison" },
          { id: "i2", label: "🍅 Tomates",       correct: "saison" },
          { id: "i3", label: "🥝 Kiwi",          correct: "hors_saison" },
          { id: "i4", label: "🍉 Pastèque",      correct: "saison" },
          { id: "i5", label: "🥬 Chou de Bruxelles", correct: "hors_saison" },
          { id: "i6", label: "🍑 Pêche",         correct: "saison" },
          { id: "i7", label: "🥔 Pomme de terre nouvelle", correct: "saison" },
          { id: "i8", label: "🎃 Potiron",       correct: "hors_saison" },
          { id: "i9", label: "🥒 Courgette",     correct: "saison" },
          { id: "i10", label: "🍊 Clémentine",   correct: "hors_saison" },
        ],
      },
    },
    fields: [
      { id: "gaspillage",   label: "Comment je vais éviter le gaspillage dans ma recette",  type: "textarea_keywords", keywords_bank: "gaspillage_recette" },
      { id: "packaging",    label: "Quel emballage éco-responsable je vais utiliser",       type: "textarea_keywords", keywords_bank: "emballage_eco" },
      { id: "packaging_lieu", label: "Où je peux me procurer cet emballage",                type: "text" },
      // V4 — Fournisseurs / produits utilisés (repeater)
      // V4.75 — enrichi : composante du menu, type de commerce, labels multi,
      //         critères éco-responsables multi, prix unitaire, adresse précise.
      { id: "fournisseurs", label: "Mes produits et où je les achète", type: "repeater",
        item_label: "Produit",
        item_title_field: "produit",
        fields: [
          { id: "produit",         label: "Nom du produit / ingrédient",                       type: "text" },
          { id: "composante_liee", label: "Composante du menu liée",                            type: "select",
            options: ["—", "Entrée", "Plat principal", "Laitage", "Dessert", "Boisson", "Plusieurs / Menu complet"] },
          { id: "type_commerce",   label: "Type de commerce",                                    type: "select",
            options: ["—", "Marché", "AMAP", "Vente directe à la ferme", "Drive fermier / Magasin de producteurs", "Magasin bio", "Magasin de quartier", "Supermarché", "Autre"] },
          { id: "lieu",            label: "Nom du commerce / adresse précise",                   type: "text",  hint: "Ex : Marché Croix-Rousse, Lyon · Ferme du Mont d'Or, Limonest" },
          { id: "labels",          label: "Labels officiels (coche tous ceux qui s'appliquent)", type: "checklist",
            options: ["AB (Agriculture Biologique)", "Label Rouge", "AOP", "AOC", "IGP", "STG", "Producteur local (sans label officiel)"] },
          { id: "criteres_eco",    label: "Critères éco-responsables vérifiés",                 type: "checklist",
            options: ["Bio", "De saison", "Circuit court (≤ 1 intermédiaire)", "Local (région)", "Sans pesticides", "Sans OGM"] },
          { id: "saison",          label: "C'est de saison ?",                                  type: "select", options: ["Oui", "Non", "À vérifier"] },
          { id: "circuit",         label: "Circuit court ?",                                    type: "select", options: ["Oui (au plus 1 intermédiaire)", "Non", "À vérifier"] },
          { id: "prix_unitaire",   label: "Prix estimé (€)",                                    type: "text",  hint: "Ex : 2,50 € le kilo · 1,20 € la pièce" },
          { id: "label",           label: "Autre label / précision libre",                       type: "text",  hint: "Si tu en as un qui n'est pas dans la liste ci-dessus" },
        ],
      },
    ],
  },
  {
    // =====================================================================
    // V4.53 — MODULE J6 : Marche en avant et hygiène alimentaire
    // Source : INRS, ANSES, Manuel HACCP, Réglementation européenne CE 852/2004.
    // =====================================================================
    id: "marche_en_avant",
    annee: "A1",
    titre: "🧼 Marche en avant : hygiène et sécurité alimentaire",
    description: "Avant de produire ton repas à emporter, tu dois maîtriser la MARCHE EN AVANT : l'organisation du travail qui va du SALE vers le PROPRE pour éviter les contaminations croisées et empêcher tes clients de tomber malades.",
    pedago: {
      consigne: "Découvre les 5 cours, fais tous les exercices, et passe l'épreuve d'attestation à la fin.",
      production: "Une connaissance solide de la marche en avant et des règles d'hygiène pour ton chef-d'œuvre.",
      attentes: "Tu sais reconnaître les bonnes pratiques, identifier les erreurs de contamination, et organiser ta cuisine du sale vers le propre.",
    },
    module: {
      jalon_id: "j6_marche_en_avant",
      cours: [
        {
          id: "c1",
          titre: "🚦 La règle d'or : on avance du SALE vers le PROPRE",
          texte: `En cuisine professionnelle, les aliments et les contenants avancent toujours **du SALE vers le PROPRE**, sans jamais revenir en arrière. C'est ce qu'on appelle la **marche en avant**.

**Pourquoi cette règle ?**

- Les zones sales (cartons, terre, déchets) contiennent des **bactéries**
- Si un plat propre revient dans une zone sale, il est **contaminé**
- Conséquence : le client peut **tomber malade**

**Où s'applique la marche en avant ?**

- 📐 **Dans l'espace** : l'aliment passe d'une zone à l'autre, dans un seul sens
- ⏱️ **Dans le temps** : si la cuisine est petite, on fait d'abord le sale, on nettoie, puis le propre

> 📌 À retenir : du sale vers le propre, jamais l'inverse. C'est le **principe d'or** de l'hygiène alimentaire.`,
        },
        {
          id: "c2",
          titre: "📋 Les 9 étapes de la marche en avant",
          texte: `Le parcours d'un aliment dans une cuisine professionnelle suit **9 étapes** successives, toujours dans le même ordre.

1. **Réception** — arrivée des marchandises en cartons et cagettes
2. **Stockage** — rangement en réserve sèche ou en chambre froide
3. **Déconditionnement** — retrait des emballages extérieurs sales
4. **Lavage** — lavage des légumes et des produits terreux
5. **Préparation** — découpe et assemblage sur un plan propre
6. **Cuisson** — à la bonne température (≥ 63 °C)
7. **Conditionnement** — mise en barquette ou contenant propre
8. **Étiquetage et stockage froid** — DLC, traçabilité, 0 à 4 °C
9. **Distribution** — remise au client, vente à emporter

> ⚠️ Attention : on ne saute **aucune étape** et on ne revient **jamais** en arrière.`,
        },
        {
          id: "c3",
          titre: "🎯 Les zones de la cuisine : SALES vs PROPRES",
          texte: `La cuisine est organisée en **deux grandes zones**, séparées physiquement quand c'est possible.

**🟥 Les zones SALES**

- Réception des marchandises
- Déconditionnement (retrait des emballages)
- Lavage initial des produits terreux
- Plonge (vaisselle sale)
- Stockage des déchets

**🟩 Les zones PROPRES**

- Préparation des aliments lavés
- Cuisson
- Conditionnement
- Stockage froid des produits finis
- Étiquetage
- Distribution au client

> 📌 Règle absolue : un objet sale n'entre **jamais** dans une zone propre, et un produit propre ne sort **jamais** par la zone des déchets.`,
        },
        {
          id: "c4",
          titre: "⏱️ La marche en avant DANS LE TEMPS",
          texte: `Dans une petite cuisine, il n'y a pas toujours la place de faire deux zones séparées. On respecte alors la marche en avant **dans le temps** : on fait les choses dans l'ordre, en nettoyant entre chaque étape.

**Les 5 étapes dans le temps**

1. Préparer les aliments **SALES** en premier (légumes terreux, viande crue)
2. **Nettoyer** et désinfecter le plan de travail et le matériel
3. Se **laver les mains** soigneusement
4. Préparer les aliments **PROPRES** (salades prêtes à manger, garnitures)
5. Faire un **nettoyage final** après toute la préparation

> 💡 Astuce : cette méthode demande de la **rigueur**, mais elle permet de cuisiner en sécurité même dans un espace réduit.`,
        },
        {
          id: "c5",
          titre: "⚠️ Les erreurs à éviter (contamination croisée)",
          texte: `La **contamination croisée** est le passage de bactéries d'un aliment ou d'une surface vers un autre aliment.

**Les erreurs les plus fréquentes**

- Poser des cartons (sales) sur un plan de travail propre
- Mettre des légumes terreux à côté d'une salade prête à consommer
- Utiliser le **même couteau** pour la viande crue et les légumes prêts à manger
- Oublier de se laver les mains entre deux préparations
- Laisser une poubelle ouverte près de la zone de préparation
- Poser un produit propre sur un chiffon sale
- Mettre un sac de livraison sur le sol puis sur le plan de travail

**Pour éviter tout cela**

- ✅ **Respecte** la marche en avant
- ✅ **Nettoie** entre chaque étape
- ✅ **Lave-toi les mains** régulièrement
- ✅ **Sépare** les ustensiles selon les zones (cru / cuit, sale / propre)`,
        },
        {
          id: "c6",
          titre: "🔑 Les 6 règles essentielles à retenir",
          texte: `Pour bien réussir l'hygiène de ton chef-d'œuvre, mémorise ces **6 règles d'or**.

1. Toujours **avancer du sale vers le propre**
2. **Ne jamais** revenir en arrière
3. **Éviter les contaminations croisées** (séparer cru / cuit, sale / propre)
4. Respecter le **nettoyage** et la désinfection des plans de travail
5. Se **laver les mains** régulièrement (avant chaque nouvelle tâche)
6. Respecter la **chaîne du froid** (0 à 4 °C pour les produits sensibles)

> ⚠️ Important : ces règles ne sont pas optionnelles. Ce sont des **obligations légales** (règlement européen CE 852/2004 sur l'hygiène des denrées alimentaires).`,
        },
      ],
      qcm: [
        { id: "q1", lie_cours: "c1", question: "Quelle est la règle d'or de la marche en avant ?",
          options: ["On avance du sale vers le propre, sans jamais revenir en arrière", "On peut revenir en arrière si on lave bien", "On va du propre au sale", "On ne fait pas attention au sens"], correct: 0 },
        { id: "q2", lie_cours: "c2", question: "Combien y a-t-il d'étapes dans la marche en avant ?",
          options: ["5", "7", "9", "12"], correct: 2 },
        { id: "q3", lie_cours: "c2", question: "Quelle est la PREMIÈRE étape de la marche en avant ?",
          options: ["La cuisson", "La réception des marchandises", "Le lavage", "L'étiquetage"], correct: 1 },
        { id: "q4", lie_cours: "c2", question: "Après la PRÉPARATION, l'étape suivante est :",
          options: ["L'étiquetage", "La cuisson", "Le stockage", "Le déconditionnement"], correct: 1 },
        { id: "q5", lie_cours: "c3", question: "Laquelle de ces zones est une zone SALE ?",
          options: ["Le conditionnement", "L'étiquetage", "La plonge / vaisselle sale", "La distribution"], correct: 2 },
        { id: "q6", lie_cours: "c3", question: "Laquelle de ces zones est une zone PROPRE ?",
          options: ["La réception des marchandises", "La préparation des aliments lavés", "Le déconditionnement", "Le stockage des déchets"], correct: 1 },
        { id: "q7", lie_cours: "c4", question: "Quand on a un espace LIMITÉ, on respecte la marche en avant :",
          options: ["Dans l'espace seulement", "Dans le temps : on fait le sale, on nettoie, puis le propre", "On ne peut pas la respecter", "On fait n'importe comment"], correct: 1 },
        { id: "q8", lie_cours: "c5", question: "Utiliser le MÊME couteau pour la viande crue et les légumes prêts à manger, c'est :",
          options: ["Pratique et autorisé", "Une erreur de contamination croisée", "Conseillé pour gagner du temps", "Sans risque"], correct: 1 },
        { id: "q9", lie_cours: "c5", question: "Que faire avant de passer d'une préparation sale à une préparation propre ?",
          options: ["Rien, on continue", "Se laver les mains et nettoyer le matériel", "Juste s'essuyer les mains", "Mettre une casquette"], correct: 1 },
        { id: "q10", lie_cours: "c6", question: "À quelle température doit être stocké un produit frais (DLC) ?",
          options: ["10-15 °C", "0-4 °C (chaîne du froid)", "20 °C (température ambiante)", "Plus de 14 °C"], correct: 1 },
        { id: "q11", lie_cours: "c6", question: "Le règlement européen CE 852/2004 concerne :",
          options: ["L'étiquetage", "L'hygiène des denrées alimentaires", "Les emballages", "Les prix"], correct: 1 },
        { id: "q12", lie_cours: "c1", question: "Pourquoi la marche en avant est-elle importante ?",
          options: ["Pour aller plus vite", "Pour décorer la cuisine", "Pour éviter de rendre les clients malades (contamination croisée)", "C'est juste une tradition"], correct: 2 },
      ],
      exercice: {
        type: "ordering",
        titre: "🔢 Exercice : range les 9 étapes dans le bon ordre",
        consigne: "Glisse les étapes pour les remettre dans l'ordre correct de la marche en avant, du SALE (en haut) au PROPRE (en bas).",
        items: [
          { id: "e1", label: "1. Réception des marchandises (cartons, cagettes)" },
          { id: "e2", label: "2. Stockage (réserve, chambre froide)" },
          { id: "e3", label: "3. Déconditionnement (retrait des emballages)" },
          { id: "e4", label: "4. Lavage (légumes, produits terreux)" },
          { id: "e5", label: "5. Préparation (découpe sur plan propre)" },
          { id: "e6", label: "6. Cuisson (à la bonne température)" },
          { id: "e7", label: "7. Conditionnement (mise en barquette)" },
          { id: "e8", label: "8. Étiquetage et stockage froid" },
          { id: "e9", label: "9. Distribution / vente à emporter" },
        ],
      },
      ressources: [
        { id: "r_inrs",  type: "lien_externe", titre: "INRS — Risques en restauration",
          description: "Fiche de l'Institut National de Recherche et de Sécurité sur les risques en cuisine collective.",
          url: "https://www.inrs.fr/metiers/commerce-services/restauration.html" },
        { id: "r_anses", type: "lien_externe", titre: "ANSES — Hygiène et alimentation",
          description: "Conseils officiels de l'Agence nationale de sécurité sanitaire.",
          url: "https://www.anses.fr/fr/content/hygi%C3%A8ne-alimentaire" },
      ],
      epreuve: {
        id: "ep_marche_en_avant",
        titre: "Épreuve d'attestation — Marche en avant et hygiène",
        verbe_action: "APPLIQUER",
        objectif: "Démontrer que tu connais la marche en avant, les zones de la cuisine, et que tu sais éviter les contaminations croisées.",
        mise_en_situation: "Tu vas produire ton repas à emporter du chef-d'œuvre dans le laboratoire de cuisine du lycée. Avant de commencer, l'enseignant·e te pose des questions pour vérifier que tu maîtrises les règles d'hygiène et la marche en avant. Démontre que tu es prêt·e à cuisiner en sécurité.",
        seuil: 13,
        duree: "20 à 30 minutes",
        questions: [
          // ===== Connaissance de la règle (QCM rapide) =====
          { id: "ep1", type: "qcm", points: 2,
            question: "La marche en avant signifie :",
            options: ["On avance du propre vers le sale", "On avance du sale vers le propre", "Peu importe le sens", "On revient en arrière si nécessaire"],
            correct: 1 },

          // ===== Vrai / Faux =====
          { id: "ep2", type: "vrai_faux", points: 2,
            question: "Dans une cuisine, on peut ramener un plat préparé dans la zone de réception des cartons si on est pressé.",
            correct: false,
            indice_correction: "FAUX. On ne revient jamais en arrière dans la marche en avant : risque de contamination croisée." },

          // ===== Ordering : remettre les 9 étapes =====
          { id: "ep3", type: "ordering_eval", points: 4,
            question: "Remets les 9 étapes de la marche en avant dans le bon ordre, du sale (en haut) au propre (en bas).",
            indice_correction: "Ordre attendu : Réception → Stockage → Déconditionnement → Lavage → Préparation → Cuisson → Conditionnement → Étiquetage et stockage froid → Distribution.",
            items: [
              { id: "i1", label: "Réception des marchandises (cartons, cagettes)" },
              { id: "i2", label: "Stockage (réserve, chambre froide)" },
              { id: "i3", label: "Déconditionnement (retrait des emballages)" },
              { id: "i4", label: "Lavage (légumes, produits terreux)" },
              { id: "i5", label: "Préparation (découpe sur plan propre)" },
              { id: "i6", label: "Cuisson (à la bonne température)" },
              { id: "i7", label: "Conditionnement (mise en barquette)" },
              { id: "i8", label: "Étiquetage et stockage froid" },
              { id: "i9", label: "Distribution / vente à emporter" },
            ] },

          // ===== Classify (drag-drop SALE / PROPRE) =====
          { id: "ep4", type: "classify", points: 4,
            question: "Pour chaque zone de la cuisine, indique si elle est SALE ou PROPRE.",
            indice_correction: "Zones sales : réception, déconditionnement, lavage initial, plonge, déchets. Zones propres : préparation, cuisson, conditionnement, étiquetage, stockage froid, distribution.",
            zones: [
              { id: "sale",   label: "🟥 Zone SALE" },
              { id: "propre", label: "🟩 Zone PROPRE" },
            ],
            items: [
              { id: "z1", label: "Réception des marchandises", zone: "sale" },
              { id: "z2", label: "Cuisson", zone: "propre" },
              { id: "z3", label: "Plonge / vaisselle sale", zone: "sale" },
              { id: "z4", label: "Conditionnement (mise en barquette)", zone: "propre" },
              { id: "z5", label: "Stockage des déchets", zone: "sale" },
              { id: "z6", label: "Distribution au client", zone: "propre" },
            ] },

          // ===== Image-choice : repérer l'erreur d'hygiène =====
          { id: "ep5", type: "image_choice", points: 3,
            question: "Sur ces 4 photos, laquelle montre une erreur d'hygiène (contamination croisée) ?",
            indice_correction: "Le même couteau pour la viande crue et les légumes prêts à manger est une erreur classique de contamination croisée.",
            options: [
              { image: "ressources_eco/marche_en_avant/2_erreurs_a_identifier/06_erreur_meme_couteau_viande_crue_legumes.jpg", label: "Même couteau viande crue / légumes" },
              { image: "ressources_eco/marche_en_avant/3_zones_cuisine/08_zone_propre_cuisson.jpg", label: "Cuisson en zone propre" },
              { image: "ressources_eco/marche_en_avant/3_zones_cuisine/09_zone_propre_conditionnement.jpg", label: "Conditionnement en zone propre" },
              { image: "ressources_eco/marche_en_avant/4_marche_dans_le_temps/03_lavage_mains_avant_preparation_propre.jpg", label: "Lavage des mains" },
            ],
            correct: 0 },

          // ===== Mots à écrire =====
          { id: "ep6", type: "mots", points: 3,
            question: "Cite 2 zones SALES de la cuisine (un mot par champ).",
            n_champs: 2,
            cles: ["reception","réception","deconditionnement","déconditionnement","lavage","dechets","déchets","poubelle","plonge","vaisselle"] },

          // ===== Phrase rédigée (validation enseignant) =====
          { id: "ep7", type: "phrase", points: 3,
            question: "Explique avec tes mots ce qu'est une CONTAMINATION CROISÉE et donne un exemple.",
            placeholder: "Une contamination croisée c'est…",
            cles_min: 2,
            cles: ["bacterie","bactéries","cru","crue","propre","sale","melange","mélanger","viande","couteau","contamine","contaminer"] },

          { id: "ep8", type: "phrase", points: 3,
            question: "Tu as un petit espace de cuisine. Comment respectes-tu la marche en avant DANS LE TEMPS ?",
            placeholder: "D'abord je…",
            cles_min: 2,
            cles: ["sale","propre","nettoyer","nettoie","desinfecter","mains","laver","apres","avant","etape","etapes"] },

          { id: "ep9", type: "phrase", points: 2,
            question: "Pour ton repas à emporter du chef-d'œuvre, cite UNE règle d'hygiène que tu vas respecter et explique pourquoi.",
            placeholder: "Je vais…",
            cles_min: 1,
            cles: ["mains","laver","propre","sale","nettoyer","temperature","température","froid","cuisson","emballage","contaminer","client","sante","santé"] },
        ],
        criteres_grille: [
          {
            label: "Connaissance des 9 étapes de la marche en avant",
            indicateur: "L'élève remet les 9 étapes dans le bon ordre et connaît la règle de progression du sale vers le propre.",
            capacite: "Connaître l'enchaînement des 9 étapes de la marche en avant.",
            remediation: "Reprendre le cours sur les 9 étapes (réception → distribution) et s'entraîner à les remettre en ordre.",
            questions: ["ep1", "ep3"],
          },
          {
            label: "Identification des zones sales et zones propres",
            indicateur: "L'élève classe correctement les zones de la cuisine entre SALES et PROPRES.",
            capacite: "Distinguer les zones sales des zones propres dans une cuisine professionnelle.",
            remediation: "Reprendre le cours sur les zones et lister 6 zones sales / 6 zones propres.",
            questions: ["ep4", "ep6"],
          },
          {
            label: "Repérage des erreurs de contamination croisée",
            indicateur: "L'élève identifie une erreur d'hygiène sur photo et sait expliquer la contamination croisée.",
            capacite: "Repérer visuellement une situation de contamination croisée et la décrire.",
            remediation: "Réviser le cours sur les erreurs fréquentes et donner 5 exemples de contamination croisée.",
            questions: ["ep5", "ep7"],
          },
          {
            label: "Marche en avant dans le temps",
            indicateur: "L'élève sait expliquer comment respecter la marche en avant dans une petite cuisine en organisant les étapes dans le temps.",
            capacite: "Appliquer la marche en avant quand l'espace est limité.",
            remediation: "Reprendre le cours sur la marche en avant dans le temps : sale → nettoyage → propre.",
            questions: ["ep2", "ep8"],
          },
          {
            label: "Application concrète des règles d'hygiène",
            indicateur: "L'élève cite et justifie une règle d'hygiène appliquée à son chef-d'œuvre.",
            capacite: "Mobiliser une règle d'hygiène concrète pour son projet.",
            remediation: "Lister 6 règles d'hygiène applicables à une production en cuisine et choisir celles pertinentes pour le repas à emporter.",
            questions: ["ep9"],
          },
        ],
      },
    },
    fields: [
      { id: "ce_que_jai_appris",      label: "Ce que j'ai appris sur la marche en avant", type: "textarea_keywords", keywords_bank: "marche_avant_appris", placeholder: "Ex : J'ai appris qu'il faut toujours avancer du sale vers le propre…" },
      { id: "regles_pour_mon_projet", label: "Les règles que je vais appliquer pour mon repas à emporter", type: "textarea_keywords", keywords_bank: "marche_avant_projet", placeholder: "Ex : Je vais me laver les mains régulièrement, séparer les ustensiles cru/cuit…" },
    ],
  },
  {
    id: "mon_menu",
    annee: "both",
    titre: "📌 Mon menu final — application totale",
    description: "L'aboutissement : tu présentes ton menu complet en croisant tout ce que tu as appris (équilibre, éco-responsabilité, étiquetage). C'est le jalon final de l'année 1.",
    pedago: {
      consigne: "Compose ton menu, vérifie qu'il respecte les 3 dimensions (équilibre + éco + étiquette), justifie tes choix, puis passe l'épreuve finale.",
      production: "Un menu complet, cohérent, justifié et conforme. Validé par épreuve d'attestation finale.",
      attentes: "Le menu doit être réaliste, défendable à l'oral, et aligné avec les notions des modules précédents.",
    },
    module: {
      jalon_id: "j5_menu_final",
      auto_verification: true,  // V4.12 : déclenche l'affichage du bloc de vérification automatique
      cours: [
        {
          id: "c1",
          titre: "🎯 L'objectif final de l'année 1",
          texte: `Pendant cette année, tu as appris :

- 🥗 Composer une **assiette équilibrée** (groupes, constituants, règle ½ ¼ ¼)
- 🌱 Comprendre l'**éco-responsabilité** (gaspillage, saison, circuits courts, labels, emballages)
- 🏷️ Maîtriser l'**étiquetage** légal et vendeur

> 📌 Maintenant, il est temps de **tout mettre ensemble** dans un **menu complet** : un repas qui soit à la fois **équilibré, éco-responsable, étiquetable et défendable**.

C'est ton jalon final de fin d'année 1, qui sera présenté à l'oral devant la classe et tes enseignants.`,
        },
        {
          id: "c2",
          titre: "✅ Comment je vérifie que mon menu est bon",
          texte: `Un bon menu de chef-d'œuvre tient sur **5 critères**.

1. ⚖️ **Équilibre** — les 3 groupes sont présents, la règle ½ ¼ ¼ est respectée
2. 🌱 **Éco-responsable** — produits de saison, circuits courts, labels, anti-gaspi, emballage adapté
3. 🏷️ **Étiqueté** — au moins une étiquette par produit avec mentions obligatoires (DLC, allergènes, traçabilité)
4. 💬 **Justifié** — tu peux expliquer chaque choix par une raison précise
5. ✨ **Présentable** — nom accrocheur, photo soignée, description claire

> 💡 Ton portfolio **croise automatiquement** les données pour t'aider à vérifier (vois le bloc « Vérification automatique » ci-dessous).`,
        },
      ],
      qcm: [
        { id: "q1", lie_cours: "c1", question: "Quel est l'objectif final de l'année 1 du chef-d'œuvre ?",
          options: ["Faire un seul plat", "Composer un menu complet alliant équilibre, éco-responsabilité et étiquetage", "Faire un exposé sur la nutrition", "Réussir un examen écrit"],
          correct: 1 },
        { id: "q2", lie_cours: "c2", question: "Combien de critères principaux pour un bon menu de chef-d'œuvre ?",
          options: ["2", "3", "5", "10"], correct: 2 },
        { id: "q3", lie_cours: "c2", question: "Si tu ne peux pas justifier un de tes choix, que faire ?",
          options: ["Garder ce choix", "Revoir ce choix et l'argumenter ou le changer", "Supprimer le menu", "Ne rien faire"], correct: 1 },
      ],

      // V4.12 — Épreuve d'attestation finale (synthèse année 1)
      epreuve: {
        id: "ep_menu_final",
        titre: "Épreuve finale — Présentation de mon menu complet",
        verbe_action: "PRÉSENTER",
        objectif: "un menu complet et cohérent, équilibré, éco-responsable et conforme aux règles d'étiquetage, devant un jury (enseignants + camarades) en argumentant ses choix.",
        mise_en_situation: "C'est le grand moment. Tu présentes ton menu de chef-d'œuvre devant ton enseignant·e et tes camarades. Tu dois être capable d'expliquer le contenu de ton menu, de prouver qu'il est équilibré, de démontrer sa démarche éco-responsable, de présenter ton étiquette conforme, et de justifier chacun de tes choix avec un vocabulaire technique précis. Cette épreuve clôt l'année 1 et prépare la fin du chef-d'œuvre l'an prochain.",
        seuil: 12,
        duree: "30 à 45 minutes",
        questions: [
          // QCM (3) — synthèse rapide
          { id: "ep1", type: "qcm", points: 2,
            question: "Pour défendre que ton menu est équilibré, tu mobilises :",
            options: ["La règle ½ ¼ ¼ et les groupes alimentaires", "Le prix bas", "L'aspect", "L'opinion personnelle"],
            correct: 0 },
          { id: "ep2", type: "qcm", points: 2,
            question: "Pour défendre que ton menu est éco-responsable, tu cites :",
            options: ["Le marketing du produit", "Saison + circuit court + label + emballage adapté + anti-gaspi", "Le nom de la marque", "Le goût"],
            correct: 1 },
          { id: "ep3", type: "qcm", points: 2,
            question: "Une étiquette conforme contient en priorité :",
            options: ["Une photo et un slogan", "Les 7 mentions obligatoires INCO + 14 allergènes mis en évidence", "Seulement le nom", "Seulement la date"],
            correct: 1 },

          // Mots (2) — synthèse vocabulaire
          { id: "ep4", type: "mots", points: 3,
            question: "Cite 3 critères que tu vérifies pour valider ton menu (un par champ).",
            n_champs: 3,
            cles: [
              "équilibre","equilibre","équilibré","equilibré","equilibre nutritionnel",
              "éco-responsable","eco-responsable","ecoresponsable","éco","eco","environnement","durable",
              "saison","saisonnalité","saisonnier","saisonniere",
              "circuit court","circuit-court","proximité","local","locale","régional","regional",
              "label","labels","ab","aop","aoc","igp","label rouge","siqo",
              "gaspillage","anti-gaspi","antigaspi","anti-gaspillage",
              "emballage","emballages","packaging","biodégradable","biodegradable","recyclable","compostable",
              "étiquette","etiquette","étiquetage","etiquetage","inco","mentions obligatoires",
              "dlc","ddm","allergène","allergenes","traçabilité","tracabilite",
              "argumentation","argument","argumenter","justification","justifier",
              "présentation","presentation","clarté","clarte"
            ] },
          { id: "ep5", type: "mots", points: 2,
            question: "Cite le nom de ton menu et son ingrédient principal (1 par champ).",
            n_champs: 2,
            cles: [
              // accepte n'importe quel mot non vide (l'enseignant valide la pertinence)
              "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
              "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
              "0","1","2","3","4","5","6","7","8","9"
            ],
            note_libre: true },

          // Phrases (4) — argumentation
          { id: "ep6", type: "phrase", points: 3,
            question: "Présente ton menu en une phrase (nom + composition courte) puis explique pourquoi il est ÉQUILIBRÉ en 2 à 3 phrases.",
            indice_correction: "L'élève doit nommer son menu, citer entrée/plat/dessert et démontrer la présence des 3 groupes (légumes, féculents, protéines) avec mention de la règle ½ ¼ ¼.",
            attendu: "Menu identifié + démonstration de l'équilibre via groupes + règle" },
          { id: "ep7", type: "phrase", points: 3,
            question: "Explique en quoi ton menu est ÉCO-RESPONSABLE. Donne au moins 3 arguments concrets.",
            indice_correction: "Réponses possibles : produits de saison, circuit court, label officiel, anti-gaspillage, emballage recyclable/compostable, transport limité.",
            attendu: "Au moins 3 arguments distincts et concrets" },
          { id: "ep8", type: "phrase", points: 3,
            question: "Décris ton étiquette : quelles informations légales y figurent ? Comment as-tu rendu cette étiquette VENDEUSE ?",
            indice_correction: "Informations légales : nom, ingrédients, allergènes mis en évidence, DLC/DDM, quantité, fabricant, conservation. Vendeuse : nom accrocheur, slogan, image, labels visibles.",
            attendu: "Mentions légales citées + au moins 2 éléments vendeurs" },
          { id: "ep9", type: "phrase", points: 2,
            question: "Si un client te dit « ton menu est trop cher pour moi », comment réponds-tu pour le convaincre ?",
            indice_correction: "L'élève peut argumenter sur la qualité, l'origine locale, l'absence de pesticides, le respect de l'environnement, le soutien aux producteurs locaux, etc.",
            attendu: "Argumentation cohérente sur la valeur perçue du menu" },
        ],
        criteres_grille: [
          {
            label: "Cohérence du menu et équilibre nutritionnel",
            indicateur: "L'élève présente un menu qui respecte la règle ½ ¼ ¼ et mobilise les notions des groupes alimentaires.",
            capacite: "Concevoir un menu équilibré et démontrer son équilibre.",
            remediation: "Reprendre le module Assiette équilibrée et appliquer la règle ½ ¼ ¼ à plusieurs cas avant de proposer un menu.",
            questions: ["ep1","ep4","ep6"],
          },
          {
            label: "Démarche éco-responsable",
            indicateur: "L'élève cite et justifie au moins 3 critères éco-responsables appliqués à son menu (saison, circuit court, label, anti-gaspi, emballage).",
            capacite: "Mobiliser les critères éco-responsables pour défendre un menu.",
            remediation: "Revoir le module Gaspillage / Circuits courts / Éco et lister 5 arguments éco-responsables transposables à son menu.",
            questions: ["ep2","ep7"],
          },
          {
            label: "Étiquetage et conformité",
            indicateur: "L'élève sait citer les mentions obligatoires de l'étiquette et la rend vendeuse.",
            capacite: "Concevoir une étiquette conforme à la loi ET attractive.",
            remediation: "Reprendre le module Étiquetage et concevoir l'étiquette de chaque composant du menu.",
            questions: ["ep3","ep8"],
          },
          {
            label: "Argumentation et justification",
            indicateur: "L'élève sait défendre son menu face à des objections et donner des arguments précis.",
            capacite: "Argumenter ses choix avec un vocabulaire technique adapté.",
            remediation: "S'entraîner à présenter le menu à voix haute et à répondre à 3 objections types (« trop cher », « pas connu », « pas équilibré »).",
            questions: ["ep9"],
          },
          {
            label: "Présentation et clarté",
            indicateur: "L'élève présente son menu de manière claire, structurée, avec un vocabulaire approprié.",
            capacite: "Communiquer clairement à l'oral un projet professionnel.",
            remediation: "Préparer une trame de présentation (nom → composition → équilibre → éco → étiquette) et la répéter à l'oral.",
            questions: ["ep5","ep6"],
          },
        ],
      },
    },
    fields: [
      { id: "nom_menu",      label: "Nom de mon menu",                       type: "text" },
      { id: "description",   label: "Description courte du menu",            type: "textarea" },
      { id: "pourquoi_plats",label: "Pourquoi ces plats ?",                  type: "textarea" },
      { id: "equilibre",     label: "Pourquoi ce menu est équilibré ?",      type: "textarea" },
      { id: "eco",           label: "Pourquoi il est éco-responsable ?",     type: "textarea" },
      { id: "points_forts",  label: "Points forts de mon menu",              type: "textarea" },
      { id: "ameliorations", label: "Points à améliorer",                    type: "textarea" },
    ],
  },
  {
    // =====================================================================
    // V3 — MODULE J4 : L'étiquette de mon produit
    // Source officielle : Règlement (UE) n° 1169/2011 (dit "INCO" —
    // information des consommateurs sur les denrées alimentaires),
    // obligatoire dans toute l'Union européenne depuis le 13 décembre 2014.
    // =====================================================================
    id: "etiquetage",
    annee: "A1",
    titre: "🏷️ L'étiquetage du produit (notions)",
    description: "Tu apprends ce que doit contenir une étiquette légale (règlement INCO 1169/2011) avant de créer celle de ton produit à emporter.",
    pedago: {
      consigne: "Découvre les 5 cours, teste-toi au quiz et repère les bonnes infos obligatoires.",
      production: "Une étiquette qui respecte la réglementation ET qui donne envie d'acheter.",
      attentes: "Toutes les mentions obligatoires + un design vendeur et éco-responsable.",
    },
    module: {
      jalon_id: "j4_etiquetage",
      cours: [
        {
          id: "c1",
          titre: "📋 Les 7 mentions obligatoires sur une étiquette",
          texte: `Selon le **règlement européen INCO n° 1169/2011**, toute étiquette alimentaire doit comporter **7 informations obligatoires**.

**Les 7 mentions obligatoires**

1. La **dénomination** du produit (son nom)
2. La **liste des ingrédients** par ordre **décroissant**
3. Les **allergènes** mis en évidence (gras, souligné…)
4. La **quantité nette** (poids ou volume)
5. La **date** : DLC ou DDM
6. Les **conditions de conservation** (ex : à conserver au frais)
7. Le **nom et l'adresse** du fabricant ou du responsable

> 📌 Pour les produits préemballés : il faut en plus la **déclaration nutritionnelle** (énergie, matières grasses, sucres, sel…).`,
        },
        {
          id: "c2",
          titre: "📅 DLC ou DDM ? La différence",
          texte: `**DLC — Date Limite de Consommation**

- Mention : « **À consommer jusqu'au…** »
- Pour les **produits périssables** : viande, poisson, produits laitiers frais
- ⚠️ Après cette date : produit **dangereux** pour la santé. On ne le consomme **pas**.

**DDM — Date de Durabilité Minimale**

- Mention : « **À consommer de préférence avant…** »
- Pour les produits qui se **conservent longtemps** : pâtes, riz, conserves, chocolat
- 💡 Après cette date : produit qui peut **perdre du goût** mais reste **sain et consommable**.

> 📌 Retenir cette différence aide à **lutter contre le gaspillage** !`,
        },
        {
          id: "c3",
          titre: "🔍 La traçabilité",
          texte: `La **traçabilité**, c'est la capacité à savoir **d'où vient** un produit et à le **suivre de la ferme à l'assiette**.

> 📌 Obligatoire dans l'Union européenne depuis **2005** (règlement 178/2002).

**Les questions à se poser**

- 📍 **D'où** viennent les ingrédients ? *Exemple : œufs de la ferme X à Rhône-Alpes*
- 👤 **Qui** a fabriqué ?
- 📅 **Quand** ?
- 🔢 À quel **numéro de lot** ?

**Pourquoi c'est important ?**

- ⚠️ Permet de **retirer du marché** un produit en cas de problème sanitaire
- 📜 C'est une **exigence légale**
- 💼 Mais aussi un **argument de vente** : le client veut savoir.`,
        },
        {
          id: "c4",
          titre: "⚠️ Les allergènes : 14 à déclarer obligatoirement",
          texte: `Le **règlement INCO** impose de mettre en évidence **14 allergènes majeurs** dans la liste des ingrédients (en gras, souligné ou en MAJUSCULES).

**La liste des 14 allergènes**

1. **Gluten** (blé, seigle, orge…)
2. **Crustacés**
3. **Œufs**
4. **Poisson**
5. **Arachide**
6. **Soja**
7. **Lait**
8. **Fruits à coque** (amande, noisette…)
9. **Céleri**
10. **Moutarde**
11. **Graines de sésame**
12. **Anhydride sulfureux** et sulfites
13. **Lupin**
14. **Mollusques**

> ⚠️ Ces infos **sauvent des vies** : une personne allergique doit pouvoir les repérer **instantanément**.`,
        },
        {
          id: "c5",
          titre: "🎨 Un design vendeur et éco-responsable",
          texte: `Au-delà du légal, ton étiquette doit **donner envie** !

**Les éléments à soigner**

- ✏️ **Le nom** — original, court, qui reste en tête
- 🎨 **Les couleurs** — naturelles pour un produit sain (vert, beige, marron). Évite le flashy.
- 🖼️ Une **image** ou illustration simple
- 💬 Un **slogan** court (« Fait-maison », « Produits locaux »…)
- 🏅 La mention des **labels** obtenus (AB, Label Rouge)

**Et pour rester éco-responsable**

- 📄 Une étiquette en **papier recyclé**
- 🌱 Avec des **encres végétales**
- 📏 Une **taille raisonnable**`,
        },
      ],
      qcm: [
        { id: "q1", lie_cours: "c1", question: "Combien de mentions sont obligatoires sur une étiquette alimentaire ?",
          options: ["3", "5", "7", "15"], correct: 2,
          explication: "7 mentions obligatoires selon le règlement INCO n° 1169/2011." },
        { id: "q2", lie_cours: "c1", question: "La liste des ingrédients est classée :",
          options: ["Par ordre alphabétique", "Par ordre décroissant (le plus présent en premier)", "Au hasard", "Par couleur"],
          correct: 1 },
        { id: "q3", lie_cours: "c2", question: "DLC signifie :",
          options: ["Date Limite de Consommation", "Date de Livraison Conforme", "Durée Longue de Conservation", "Date du Lot de Cuisson"],
          correct: 0 },
        { id: "q4", lie_cours: "c2", question: "Après la DLC, je peux :",
          options: ["Encore consommer le produit", "Le jeter (risque pour la santé)", "Le recuisiner", "Le congeler"],
          correct: 1, explication: "DLC = à ne jamais dépasser sur les produits frais." },
        { id: "q5", lie_cours: "c2", question: "DDM signifie :",
          options: ["Date Dernière Mention", "Date de Durabilité Minimale", "Durée de Degré Minimum", "Date de Départ Magasin"],
          correct: 1 },
        { id: "q6", lie_cours: "c2", question: "Après la DDM :",
          options: ["Le produit est toxique", "Le produit reste sain, peut perdre du goût", "On le jette obligatoirement", "On le congèle"],
          correct: 1 },
        { id: "q7", lie_cours: "c4", question: "Combien d'allergènes majeurs à déclarer obligatoirement ?",
          options: ["5", "10", "14", "20"], correct: 2 },
        { id: "q8", lie_cours: "c3", question: "La traçabilité c'est :",
          options: ["Suivre les ventes", "Savoir d'où vient le produit et pouvoir le retrouver", "Compter les calories", "Dessiner le logo"],
          correct: 1 },
        { id: "q9", lie_cours: "c4", question: "Sur l'étiquette, les allergènes doivent être :",
          options: ["Cachés", "Mis en évidence (gras, souligné, MAJUSCULES)", "À la fin", "Barrés"],
          correct: 1 },
        { id: "q10", lie_cours: "c5", question: "Pour une étiquette éco-responsable, je choisis :",
          options: ["Plastique brillant", "Papier recyclé et encres végétales", "Grande étiquette colorée", "Aluminium"],
          correct: 1 },
      ],
      // V4.10 — Épreuve d'attestation J4 : L'étiquetage du produit
      epreuve: {
        id: "ep_etiquette",
        titre: "Épreuve d'attestation — Étiqueter mon produit selon la loi",
        verbe_action: "ÉTIQUETER",
        objectif: "un produit alimentaire à emporter en respectant le règlement européen INCO 1169/2011 et en proposant une présentation vendeuse et éco-responsable.",
        mise_en_situation: "Ton menu à emporter est prêt. Tu dois maintenant créer l'étiquette qui sera collée sur l'emballage avant la vente. Cette étiquette doit respecter le règlement européen INCO 1169/2011 (qui s'applique partout en Europe) : informations obligatoires, allergènes mis en évidence, dates correctes. Elle doit aussi donner envie d'acheter (nom, présentation soignée) et rester cohérente avec la démarche éco-responsable du chef-d'œuvre.",
        seuil: 12,
        duree: "30 à 45 minutes",
        questions: [
          // QCM (4)
          { id: "ep1", type: "qcm", points: 2,
            question: "Combien de mentions sont obligatoires sur une étiquette alimentaire selon le règlement INCO 1169/2011 ?",
            options: ["3", "5", "7", "12"], correct: 2 },
          { id: "ep2", type: "qcm", points: 2,
            question: "La liste des ingrédients sur une étiquette est classée :",
            options: ["Par ordre alphabétique", "Par ordre décroissant (le plus présent en premier)", "Au hasard", "Par couleur"],
            correct: 1 },
          { id: "ep3", type: "qcm", points: 2,
            question: "Combien d'allergènes majeurs doivent être déclarés OBLIGATOIREMENT et mis en évidence ?",
            options: ["5", "10", "14", "20"], correct: 2,
            explication: "Le règlement INCO impose la déclaration de 14 allergènes majeurs." },
          { id: "ep4", type: "qcm", points: 2,
            question: "Sur l'étiquette, les allergènes doivent être :",
            options: ["Cachés", "À la fin de la liste", "Mis en évidence (gras, souligné ou MAJUSCULES)", "Barrés"],
            correct: 2 },

          // Mots (2)
          { id: "ep5", type: "mots", points: 3,
            question: "Cite 3 informations obligatoires sur une étiquette alimentaire (un par champ).",
            n_champs: 3,
            cles: [
              "nom","dénomination","denomination","nom du produit",
              "ingrédients","ingredients","liste ingrédients","liste ingredients",
              "allergène","allergenes","allergènes",
              "quantité nette","quantite nette","poids","volume","quantité","quantite",
              "dlc","ddm","date","date limite","date limite de consommation","date de durabilité minimale","date durabilite minimale",
              "conservation","conditions de conservation",
              "fabricant","nom du fabricant","adresse","adresse fabricant","responsable",
              "lot","numéro de lot","numero de lot",
              "tracabilite","traçabilité","origine"
            ] },
          { id: "ep6", type: "mots", points: 2,
            question: "Cite 2 allergènes majeurs à déclarer obligatoirement (un par champ).",
            n_champs: 2,
            cles: [
              "gluten","blé","ble","seigle","orge","avoine",
              "crustacés","crustaces","crevette","crabe",
              "œuf","oeuf","œufs","oeufs",
              "poisson","poissons",
              "arachide","arachides","cacahuète","cacahuetes","cacahuète",
              "soja",
              "lait","lactose","produits laitiers",
              "fruits à coque","fruits a coque","amande","amandes","noisette","noisettes","noix","pistache","pistaches","cajou",
              "céleri","celeri",
              "moutarde",
              "sésame","sesame","graines de sésame","graines sesame",
              "sulfites","anhydride sulfureux",
              "lupin",
              "mollusques","moule","huître","huitre"
            ] },

          // Phrases (3) — validation enseignant
          { id: "ep7", type: "phrase", points: 3,
            question: "Pour ton dessert au yaourt à emporter, vas-tu mettre une DLC ou une DDM ? Justifie.",
            indice_correction: "Réponse attendue : DLC, parce que c'est un produit frais à base de produit laitier, périssable, dont la consommation après cette date peut présenter un risque pour la santé.",
            attendu: "Identifie DLC + justifie par caractère frais/périssable" },
          { id: "ep8", type: "phrase", points: 3,
            question: "Qu'est-ce que la traçabilité ? À quoi sert-elle ? Réponds en 2 phrases.",
            indice_correction: "La traçabilité, c'est la possibilité de suivre un produit de la production à la consommation (origine des ingrédients, fabricant, date, n° de lot). Elle sert à retirer un produit du marché en cas de problème sanitaire et à garantir la confiance du client.",
            attendu: "Définition + utilité (sécurité / retrait, confiance client)" },
          { id: "ep9", type: "phrase", points: 3,
            question: "Cite 2 éléments qui rendent une étiquette VENDEUSE (en plus du légal).",
            indice_correction: "Éléments possibles : nom original / accrocheur, slogan, photo ou illustration, couleurs cohérentes avec le produit, mention des labels (AB, Label Rouge), aspect soigné, papier de qualité.",
            attendu: "Cite au moins 2 éléments vendeurs distincts" },
        ],
        criteres_grille: [
          {
            label: "Connaissance des mentions obligatoires (règlement INCO)",
            indicateur: "L'élève cite au moins 7 mentions obligatoires (nom, ingrédients, allergènes, quantité, date, conservation, fabricant) et connaît leur ordre.",
            capacite: "Identifier et lister les informations obligatoires sur une étiquette alimentaire selon le règlement INCO 1169/2011.",
            remediation: "Reprendre la liste des 7 mentions obligatoires et l'apprendre par cœur. S'entraîner à les repérer sur des étiquettes du commerce.",
            questions: ["ep1","ep2","ep5"],
          },
          {
            label: "Maîtrise des allergènes (14 allergènes majeurs)",
            indicateur: "L'élève cite plusieurs allergènes parmi les 14 obligatoires et sait qu'ils doivent être mis en évidence (gras / souligné / majuscules).",
            capacite: "Identifier les allergènes majeurs et les présenter de manière conforme sur une étiquette.",
            remediation: "Apprendre la liste des 14 allergènes majeurs (gluten, crustacés, œufs, poisson, arachide, soja, lait, fruits à coque, céleri, moutarde, sésame, sulfites, lupin, mollusques) et la règle de mise en évidence.",
            questions: ["ep3","ep4","ep6"],
          },
          {
            label: "Maîtrise des dates DLC / DDM appliquée à l'étiquetage",
            indicateur: "L'élève sait choisir entre DLC et DDM selon le type de produit, et formuler correctement la mention.",
            capacite: "Choisir la bonne mention de date selon la nature du produit (frais ou stable) et la formuler correctement.",
            remediation: "Pour chaque type de produit (yaourt, pâtes, conserve, viande, biscuit), s'entraîner à choisir DLC ou DDM et la formulation associée.",
            questions: ["ep7"],
          },
          {
            label: "Compréhension de la traçabilité",
            indicateur: "L'élève définit clairement la traçabilité et explique son utilité (sécurité sanitaire, confiance client).",
            capacite: "Définir la traçabilité et identifier ses enjeux pour le consommateur et le producteur.",
            remediation: "Revoir la définition de la traçabilité (règlement 178/2002) et lister les informations qui la rendent possible (origine, fabricant, n° de lot, date).",
            questions: ["ep8"],
          },
          {
            label: "Présentation vendeuse et cohérence éco-responsable",
            indicateur: "L'élève propose des éléments qui rendent l'étiquette attrayante (nom, slogan, image, labels) tout en restant cohérent avec une démarche écologique (papier recyclé, encres végétales).",
            capacite: "Concevoir une étiquette vendeuse et cohérente avec la démarche éco-responsable du projet.",
            remediation: "Observer 3 étiquettes du commerce et lister ce qui les rend attractives. Choisir 2 éléments à reprendre pour son propre produit, en restant éco-responsable.",
            questions: ["ep9"],
          },
        ],
      },

      ressources: [
        { id: "r_mapse_j4", type: "lien_externe",
          url: "https://mapse2.fr",
          titre: "Espace pédagogique mapse2.fr — partie chef-d'œuvre",
          description: "Ressources complémentaires de l'enseignant·e (vidéos, fiches, exercices)." },
        { id: "r_video_etiquette", type: "video",
          url: "https://www.youtube.com/results?search_query=etiquetage+alimentaire+inco+1169",
          titre: "Vidéos sur l'étiquetage alimentaire (règlement INCO)",
          description: "Vidéos pédagogiques sur les mentions obligatoires (à choisir/ajouter par l'enseignant)." },
        { id: "r_dlc_ddm", type: "fiche",
          fichier: "ressources_eco/fiches/fiche_dlc_ddm.html",
          titre: "DLC ou DDM ? Comprendre les dates",
          description: "Une date à ne pas confondre — la santé du client en dépend." },
      ],
      exercice: {
        type: "classification",
        titre: "🧐 Ces informations doivent-elles figurer sur l'étiquette ?",
        consigne: "Classe chaque information : obligatoire, vendeuse (utile mais non obligatoire), ou inutile ?",
        colonnes: [
          { id: "obligatoire", label: "📋 OBLIGATOIRE",  color: "#cfe2ff" },
          { id: "vendeuse",    label: "✨ VENDEUSE",     color: "#fff0cc" },
          { id: "inutile",     label: "❌ INUTILE",       color: "#fadbdf" },
        ],
        items: [
          { id: "i1",  label: "Nom du produit",                         correct: "obligatoire" },
          { id: "i2",  label: "DLC ou DDM",                             correct: "obligatoire" },
          { id: "i3",  label: "Liste des ingrédients",                  correct: "obligatoire" },
          { id: "i4",  label: "Allergènes mis en évidence",             correct: "obligatoire" },
          { id: "i5",  label: "Nom et adresse du fabricant",            correct: "obligatoire" },
          { id: "i6",  label: "Quantité nette (poids ou volume)",       correct: "obligatoire" },
          { id: "i7",  label: "Slogan (\"Fait maison\")",               correct: "vendeuse"    },
          { id: "i8",  label: "Logo du label AB",                       correct: "vendeuse"    },
          { id: "i9",  label: "Photo appétissante du produit",          correct: "vendeuse"    },
          { id: "i10", label: "Signe astrologique du cuisinier",        correct: "inutile"     },
          { id: "i11", label: "Couleur préférée du propriétaire",       correct: "inutile"     },
          { id: "i12", label: "Conditions de conservation",             correct: "obligatoire" },
        ],
      },
    },
    fields: [
      { id: "nom_produit",   label: "🏷️ Nom de mon produit (accrocheur)",           type: "text" },
      { id: "slogan",        label: "💬 Slogan / phrase d'accroche",                 type: "text" },
      { id: "dlc",           label: "📅 DLC ou DDM que j'indiquerais",                type: "text" },
      { id: "ingredients",   label: "📋 Liste des ingrédients (ordre décroissant)",   type: "textarea" },
      { id: "allergenes",    label: "⚠️ Allergènes présents (à mettre en évidence)",  type: "textarea" },
      { id: "tracabilite",   label: "🔍 Traçabilité (d'où viennent mes ingrédients)", type: "textarea" },
      { id: "design",        label: "🎨 Description du design (couleurs, image…)",   type: "textarea" },
      // V4 — étiquettes par produit (repeater)
      // V4.75 — ajout du champ « composante_liee » pour relier l'étiquette à
      //         une composante du menu (entrée, plat, dessert…).
      { id: "etiquettes", label: "Mes étiquettes (une par produit / composant)", type: "repeater",
        item_label: "Étiquette",
        item_title_field: "nom_produit",
        fields: [
          { id: "composante_liee", label: "À quelle composante du menu cette étiquette correspond ?",
            type: "select",
            options: ["—", "Entrée", "Plat principal", "Laitage", "Dessert", "Boisson", "Menu complet", "Autre"] },
          { id: "nom_produit",  label: "Nom du produit",                                 type: "text" },
          { id: "slogan",       label: "Slogan / phrase d'accroche",                     type: "text" },
          { id: "type_date",    label: "Type de date",                                    type: "select",
            options: ["DLC (à consommer jusqu'au)", "DDM (à consommer de préférence avant)"] },
          { id: "date",         label: "Date",                                            type: "date" },
          { id: "poids",        label: "Quantité nette (poids ou volume)",               type: "text" },
          { id: "ingredients",  label: "Liste des ingrédients (ordre décroissant)",      type: "textarea" },
          { id: "allergenes",   label: "Allergènes (mettre en évidence)",                type: "textarea" },
          { id: "tracabilite",  label: "Traçabilité (origine, fabricant…)",              type: "textarea" },
          { id: "conservation", label: "Conditions de conservation",                      type: "text" },
        ],
      },
    ],
  },
  {
    id: "cout_vente",
    annee: "A2",
    titre: "Coût et prix de vente",
    description: "Tous les coûts à prendre en compte pour fixer le prix.",
    pedago: {
      consigne: "Calculez les coûts et fixez un prix de vente justifié.",
      production: "Un tableau de coûts et un prix argumenté.",
      attentes: "Cohérence entre les coûts, la marge et la clientèle visée.",
    },
    fields: [
      { id: "cout_ingredients",   label: "Coût des ingrédients",       type: "text" },
      { id: "cout_mo",            label: "Coût de la main d'œuvre",    type: "text" },
      { id: "cout_fonctionnement",label: "Coût de fonctionnement",     type: "text" },
      { id: "cout_emballage",     label: "Coût de l'emballage",        type: "text" },
      { id: "prix_vente",         label: "Prix de vente",              type: "text" },
      { id: "justif_prix",        label: "Justification du prix",      type: "textarea" },
      { id: "reflexion",          label: "Réflexion commerciale",      type: "textarea" },
    ],
  },
  {
    id: "realisation",
    annee: "A2",
    titre: "Préparation et réalisation",
    description: "La fiche technique et le déroulement de la production.",
    pedago: {
      consigne: "Rédigez votre fiche technique et décrivez le déroulement de la production.",
      production: "Une fiche technique précise et un bilan de la réalisation.",
      attentes: "Ingrédients, étapes, cuissons et difficultés doivent être détaillés.",
    },
    fields: [
      { id: "ingredients",   label: "Ingrédients (fiche technique)", type: "textarea" },
      { id: "materiel",      label: "Matériel et ustensiles",        type: "textarea" },
      { id: "etapes",        label: "Étapes de préparation",         type: "textarea" },
      { id: "cuissons",      label: "Cuissons",                      type: "textarea" },
      { id: "bon_commande",  label: "Bon de commande",               type: "textarea", hint: "Si utile" },
      { id: "anticipation",  label: "Anticipation des ressources",   type: "textarea" },
      { id: "difficultes",   label: "Difficultés rencontrées",       type: "textarea" },
    ],
  },
  {
    id: "degustation",
    annee: "A2",
    titre: "Test, dégustation et amélioration",
    description: "Ce qu'a donné la réalisation et ce qu'il faut améliorer.",
    pedago: {
      consigne: "Analysez le résultat de la dégustation et notez les améliorations à apporter.",
      production: "Une analyse organoleptique et une liste d'améliorations.",
      attentes: "Regard critique, appuyé par des faits ou des avis recueillis.",
    },
    fields: [
      { id: "resultat",      label: "Résultat obtenu",               type: "textarea" },
      { id: "organoleptique",label: "Analyse organoleptique",        type: "textarea" },
      { id: "bien",          label: "Ce qui a bien fonctionné",      type: "textarea" },
      { id: "ameliorer",     label: "Ce qu'il faut améliorer",       type: "textarea" },
      { id: "modifs",        label: "Modifications de recette",      type: "textarea" },
      { id: "avis",          label: "Avis recueillis",               type: "textarea" },
    ],
  },
  {
    id: "communication",
    annee: "A2",
    titre: "Communication et promotion",
    description: "Affiche, clientèle ciblée et moyens de diffusion.",
    pedago: {
      consigne: "Construisez la communication autour de votre menu (affiche, message, cible).",
      production: "Un support de communication cohérent avec votre démarche éco-responsable.",
      attentes: "Le message doit être clair, adapté à la cible et visuellement soigné.",
    },
    fields: [
      { id: "affiche",        label: "Affiche (description)",        type: "textarea" },
      { id: "clientele",      label: "Clientèle ciblée",             type: "textarea" },
      { id: "message",        label: "Contenu du message",           type: "textarea" },
      { id: "qqoqcp",         label: "QQOQCP",                       type: "textarea", hint: "Quoi, Qui, Où, Quand, Comment, Pourquoi" },
      { id: "mise_en_forme",  label: "Mise en forme",                type: "textarea" },
      { id: "diffusion",      label: "Moyens de diffusion",          type: "textarea" },
      { id: "eco_support",    label: "Support éco-responsable",      type: "textarea" },
    ],
  },
  {
    id: "enquete",
    annee: "A2",
    titre: "Enquête de satisfaction",
    description: "Recueil et analyse des retours.",
    pedago: {
      consigne: "Créez un questionnaire et analysez les réponses obtenues.",
      production: "Un formulaire, des résultats chiffrés et une conclusion.",
      attentes: "Questions pertinentes et conclusion argumentée à partir des résultats.",
    },
    fields: [
      { id: "formulaire",   label: "Formulaire utilisé",       type: "textarea" },
      { id: "resultats",    label: "Résultats obtenus",        type: "textarea" },
      { id: "stats",        label: "Statistiques simples",     type: "textarea" },
      { id: "conclusion",   label: "Conclusion de l'enquête",  type: "textarea" },
    ],
  },
  {
    id: "bilan",
    annee: "A2",
    titre: "Bilan personnel",
    description: "Retour sur votre parcours et sur ce que vous avez appris.",
    pedago: {
      consigne: "Prenez du recul : qu'avez-vous appris, que referiez-vous autrement ?",
      production: "Un bilan sincère et structuré.",
      attentes: "Honnêteté, prise de recul, lien avec votre formation.",
    },
    fields: [
      { id: "difficultes",  label: "Difficultés rencontrées",                 type: "textarea" },
      { id: "solutions",    label: "Solutions trouvées",                       type: "textarea" },
      { id: "appris",       label: "Ce que j'ai appris",                       type: "textarea" },
      { id: "interesse",    label: "Ce qui m'a intéressé",                     type: "textarea" },
      { id: "autrement",    label: "Ce que je ferais autrement",               type: "textarea" },
      { id: "interet",      label: "Intérêt du projet pour ma formation",      type: "textarea" },
    ],
  },
  {
    id: "oral",
    annee: "A2",
    titre: "Préparation de l'oral final",
    description: "Votre support et votre discours pour l'épreuve.",
    pedago: {
      consigne: "Préparez votre présentation orale et les réponses aux questions possibles.",
      production: "Un plan d'oral + un support + des arguments clairs.",
      attentes: "Discours structuré, appuyé sur le travail réalisé dans les sections précédentes.",
    },
    fields: [
      { id: "resume",       label: "Résumé du projet",            type: "textarea" },
      { id: "etapes",       label: "Étapes principales",          type: "textarea" },
      { id: "collectif",    label: "Travail collectif",           type: "textarea" },
      { id: "individuel",   label: "Travail individuel",          type: "textarea" },
      { id: "difficultes",  label: "Difficultés",                 type: "textarea" },
      { id: "ameliorations",label: "Améliorations",               type: "textarea" },
      { id: "menu",         label: "Choix du menu",               type: "textarea" },
      { id: "arguments",    label: "Arguments",                   type: "textarea" },
      { id: "support",      label: "Support d'oral",              type: "textarea" },
      { id: "a_dire",       label: "Ce que je dois dire",         type: "textarea" },
    ],
  },
  {
    id: "annexes",
    annee: "both",
    titre: "Mes photos",
    description: "Photos et documents témoignant du travail réalisé.",
    pedago: {
      consigne: "Déposez ici les photos et traces qui prouvent votre travail tout au long du projet.",
      production: "Une sélection de photos légendées et de notes de travail.",
      attentes: "Les photos doivent être lisibles, pertinentes et légendées.",
    },
    fields: [
      { id: "notes",   label: "Notes libres / liste des preuves", type: "textarea" },
    ],
  },
];

/* =====================================================================
   3. ÉTAT & STOCKAGE
   ===================================================================== */

let state = null;
let autoSaveTimer = null;
let currentView = { type: "section", id: null };  // type: section | oral-summary | teacher-recap
// V4 : le mode enseignant a été retiré du portfolio élève.
// L'évaluation se fait uniquement dans evaluer.html à partir du JSON exporté.
const teacherMode = false;

// V4.13 : suivi des modifications non exportées + rappel périodique
let dirtySinceExport = false;
let exportRappelTimer = null;

// V4.14 : mode démo — pour visualiser un exemple sans écraser le vrai portfolio
let demoModeActive = false;
let savedRealState = null;

let recapFilter = "all"; // all | not_started | in_progress | done | to_review | validated
let oralMode = "detailed"; // detailed | concise

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return mergeWithSchema(JSON.parse(raw)); }
    catch (e) { console.warn("Données corrompues.", e); }
  }
  return buildDefaultState();
}

function saveState(markSaved = true) {
  state.meta.date_derniere_modification = new Date().toISOString();
  // V4.60 : toute modification doit déclencher le rappel "à exporter"
  dirtySinceExport = true;
  // V4.14 : en mode démo, on ne sauvegarde RIEN dans localStorage.
  // V4.15 : en mode outil enseignant, idem — on ne touche pas au localStorage.
  if (!demoModeActive && !window.IS_TEACHER_TOOL) {
    // V4.60 : try/catch en cas de quota dépassé (ex: trop de photos)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      const isQuota = e && (e.name === "QuotaExceededError" ||
                            e.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
                            (e.code && (e.code === 22 || e.code === 1014)));
      console.error("Sauvegarde localStorage impossible :", e);
      if (markSaved) updateSaveIndicator(false, "⚠️ Sauvegarde locale impossible");
      // Alerte non bloquante : on prévient l'élève UNE FOIS par session
      if (isQuota && !window._quotaAlerted) {
        window._quotaAlerted = true;
        setTimeout(() => alert(
          "⚠️ Mémoire locale saturée !\n\n" +
          "Trop de photos / données dans ton portfolio. La sauvegarde automatique sur cet ordinateur est en pause.\n\n" +
          "👉 EXPORTE TON JSON MAINTENANT (bouton Sauvegarde → Exporter JSON) pour ne rien perdre.\n\n" +
          "Astuce : tu peux aussi supprimer des photos volumineuses pour libérer de la place."
        ), 50);
      }
      return;
    }
  }
  if (markSaved) updateSaveIndicator(true);
  // V4.60 : met à jour le rappel "à exporter" même quand saveState est appelé directement
  if (typeof updateExportIndicator === "function") updateExportIndicator();
}

function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  updateSaveIndicator(false, "Modifications non enregistrées…");
  // V4.13 : marqueur de modifications non exportées
  dirtySinceExport = true;
  autoSaveTimer = setTimeout(() => { saveState(true); updateExportIndicator(); }, AUTOSAVE_DELAY_MS);
}

/* =====================================================================
   4. INITIALISATION DU MODÈLE
   ===================================================================== */

function buildDefaultState() {
  const now = new Date().toISOString();
  return {
    meta: {
      app_version: APP_VERSION,
      projet_titre: "Chef-d'œuvre : concevoir un repas ou menu équilibré et éco-responsable",
      date_creation: now,
      date_derniere_modification: now,
      date_dernier_export: null, // V4.13 : suivi du dernier export JSON
    },
    // RGPD : nom/prenom/lycee retirés. userCode et classe viennent de PSR_USER (auth.js).
    // On garde des clés vides nom/prenom/lycee pour la compatibilité du code existant
    // qui lit ces champs (ils ne seront jamais affichés ni saisis).
    infos_eleve: {
      userCode: (window.PSR_USER && window.PSR_USER.userCode) || "",
      classe:   (window.PSR_USER && window.PSR_USER.classe)   || "",
      annee_scolaire: "",
      titre_dossier: "",
      // shims RGPD-vides pour éviter des "undefined" dans les anciens accès
      nom: "", prenom: "", lycee: "",
    },
    // V4.20 : préférences utilisateur (additif, sûr pour l'existant)
    preferences: { couleur_theme: "bleu", contraste: false, avatar: null },
    // V4.20 : notes personnelles type post-it
    notes: [],
    // V4.20 : progression flashcards
    flashcards_state: {},
    progression: { pourcentage_global: 0, sections_terminees: 0, sections_validees: 0 },
    sections: SECTIONS_SCHEMA.map(s => buildDefaultSection(s)),
    // V3 : évaluations par jalon. Produites par l'outil enseignant evaluer.html
    // puis importées dans le portfolio. Format : voir applyEvaluationImport().
    evaluations: [],
    // V4.28 : météo des émotions
    meteo_emotions: [],
    meteo_last_check: null,
    // V4.21 : conversations
    conversations_state: {},
    // V4.29 : bilans, auto-évaluations, sondages
    bilans_seance: [],
    auto_evaluations: [],
    sondages: [],
    // V4.54 : suggestions d'aliments à ajouter à la banque
    suggestions_aliments: [],
    // V4.58 : auto-évaluation du référentiel PSR (compétences acquises)
    referentiel_psr: {},
    // V4.61 : drapeau pour ne montrer le tutoriel "Première visite" qu'1x
    tutoriel_termine: false,
  };
}

function buildDefaultSection(schemaSec) {
  const sec = {
    id: schemaSec.id,
    titre: schemaSec.titre,
    description: schemaSec.description,
    statut_eleve: "not_started",
    statut_enseignant: "none",
    date_maj: null,
    champs: schemaSec.fields.map(f => ({ id: f.id, label: f.label, type: f.type, valeur: (f.default_value !== undefined ? f.default_value : defaultValueForType(f.type)) })),
    commentaires_enseignant: "",
    note: "",
    date_validation: "",
    preuves: [],
  };
  // V3 : section avec module pédagogique → état des réponses
  if (schemaSec.module) {
    sec.module_state = {
      qcm_answers: {},        // id question -> index de réponse choisie
      qcm_score: null,        // nb bonnes réponses
      qcm_total: schemaSec.module.qcm?.length || 0,
      qcm_completed: false,
      exercice_order: null,   // ordre saisi par l'élève (ids)
      exercice_ok: null,      // true/false
      validated_at: null,
    };
  }
  return sec;
}

function defaultValueForType(t) {
  if (t === "checkbox") return false;
  return "";
}

/* --- Synchronisation identité <-> infos_eleve (V2.1) -----------------
   La section "identite" contient les vrais champs saisis par l'élève.
   state.infos_eleve est un miroir utilisé par la page de garde et la
   synthèse orale. On synchronise dans les deux sens à l'init, et dans
   le sens identite → infos_eleve à chaque saisie.
---------------------------------------------------------------------- */
function syncIdentiteToInfos() {
  const sec = state.sections.find(s => s.id === "identite");
  if (!sec) return;
  IDENTITE_SYNC.forEach(fid => {
    const f = sec.champs.find(c => c.id === fid);
    if (f) state.infos_eleve[fid] = f.valeur || "";
  });
}

function syncInfosToIdentite() {
  const sec = state.sections.find(s => s.id === "identite");
  if (!sec) return;
  IDENTITE_SYNC.forEach(fid => {
    const f = sec.champs.find(c => c.id === fid);
    if (f && !f.valeur && state.infos_eleve[fid]) f.valeur = state.infos_eleve[fid];
  });
}

function mergeWithSchema(loaded) {
  const base = buildDefaultState();
  if (loaded.meta) Object.assign(base.meta, loaded.meta);
  if (loaded.infos_eleve) Object.assign(base.infos_eleve, loaded.infos_eleve);
  // RGPD : on neutralise systématiquement nom/prenom/lycee même si présents dans un ancien export
  base.infos_eleve.nom = "";
  base.infos_eleve.prenom = "";
  base.infos_eleve.lycee = "";
  // RGPD : userCode + classe sont maîtrisés par PSR_USER (auth.js)
  if (window.PSR_USER) {
    base.infos_eleve.userCode = window.PSR_USER.userCode || "";
    base.infos_eleve.classe   = window.PSR_USER.classe   || base.infos_eleve.classe || "";
  }
  if (Array.isArray(loaded.sections)) {
    base.sections = base.sections.map(defSec => {
      const prev = loaded.sections.find(s => s.id === defSec.id);
      if (!prev) return defSec;
      return {
        ...defSec,
        statut_eleve: prev.statut_eleve || defSec.statut_eleve,
        statut_enseignant: prev.statut_enseignant || defSec.statut_enseignant,
        date_maj: prev.date_maj || null,
        commentaires_enseignant: prev.commentaires_enseignant || "",
        note: prev.note || "",
        date_validation: prev.date_validation || "",
        preuves: Array.isArray(prev.preuves) ? prev.preuves : [],
        champs: defSec.champs.map(defCh => {
          const pf = (prev.champs || []).find(c => c.id === defCh.id);
          // V4.72 : si l'élève n'a rien saisi (champ vide) et qu'une valeur par
          // défaut existe dans le schéma, on l'applique. Sinon on respecte la
          // valeur saisie par l'élève.
          if (pf) {
            const isEmpty = pf.valeur === "" || pf.valeur == null;
            return { ...defCh, valeur: isEmpty && defCh.valeur ? defCh.valeur : pf.valeur };
          }
          return defCh;
        }),
        // V3 : préserver l'état du module pédagogique
        module_state: prev.module_state ? { ...defSec.module_state, ...prev.module_state } : defSec.module_state,
        // V4.52 : préserver la soumission de menu (repas_equilibre)
        menu_soumis: prev.menu_soumis || false,
        menu_soumis_le: prev.menu_soumis_le || null,
      };
    });
  }
  // V3 : préserver les évaluations importées
  if (Array.isArray(loaded.evaluations)) base.evaluations = loaded.evaluations;
  // V4.20 : préserver préférences, notes, flashcards
  if (loaded.preferences) base.preferences = { ...base.preferences, ...loaded.preferences };
  if (Array.isArray(loaded.notes)) base.notes = loaded.notes;
  if (loaded.flashcards_state) base.flashcards_state = loaded.flashcards_state;
  // V4.21 : conversations terminées
  if (loaded.conversations_state) base.conversations_state = loaded.conversations_state;
  // V4.28 : météo des émotions
  if (Array.isArray(loaded.meteo_emotions)) base.meteo_emotions = loaded.meteo_emotions;
  if (loaded.meteo_last_check) base.meteo_last_check = loaded.meteo_last_check;
  // V4.29 : bilans, auto-évaluations, sondages
  if (Array.isArray(loaded.bilans_seance)) base.bilans_seance = loaded.bilans_seance;
  if (Array.isArray(loaded.auto_evaluations)) base.auto_evaluations = loaded.auto_evaluations;
  if (Array.isArray(loaded.sondages)) base.sondages = loaded.sondages;
  // V4.54 : suggestions d'aliments
  if (Array.isArray(loaded.suggestions_aliments)) base.suggestions_aliments = loaded.suggestions_aliments;
  // V4.58 : référentiel PSR
  if (loaded.referentiel_psr && typeof loaded.referentiel_psr === "object") base.referentiel_psr = loaded.referentiel_psr;
  // V4.61 : drapeau tutoriel
  if (loaded.tutoriel_termine) base.tutoriel_termine = true;
  // V4.84 : préserver les clés inconnues dans extras (évite les pertes lors d'évolutions futures)
  const KNOWN_KEYS = new Set([
    "meta","infos_eleve","sections","progression","evaluations","preferences",
    "notes","flashcards_state","conversations_state","meteo_emotions","meteo_last_check",
    "bilans_seance","auto_evaluations","sondages","suggestions_aliments",
    "referentiel_psr","tutoriel_termine","extras"
  ]);
  const extras = (loaded.extras && typeof loaded.extras === "object") ? { ...loaded.extras } : {};
  Object.keys(loaded).forEach(k => {
    if (!KNOWN_KEYS.has(k)) extras[k] = loaded[k];
  });
  if (Object.keys(extras).length) base.extras = extras;
  base.meta.app_version = APP_VERSION;
  return base;
}

/* =====================================================================
   5. RENDU UI — SIDEBAR
   ===================================================================== */

function renderSidebar() {
  const ul = document.getElementById("section-list");
  ul.innerHTML = "";

  // V3 : regroupement par année pour aider l'élève à se repérer
  let currentGroup = null;
  state.sections.forEach((sec, idx) => {
    const schemaSec = SECTIONS_SCHEMA.find(s => s.id === sec.id);
    // V3.1 : certaines sections sont réservées à l'enseignant (planification…)
    if (schemaSec?.teacher_only && !teacherMode) return;
    const annee = schemaSec?.annee || "both";
    const group = annee === "A2" ? "A2" : (annee === "both" ? currentGroup || "A1" : "A1");
    if (group !== currentGroup) {
      currentGroup = group;
      const sep = document.createElement("li");
      sep.className = "year-separator";
      sep.textContent = group === "A1" ? "📘 Année 1 (2025-2026)" : "📗 Année 2 (2026-2027)";
      ul.appendChild(sep);
    }

    const li = document.createElement("li");
    li.dataset.id = sec.id;
    if (currentView.type === "section" && sec.id === currentView.id) li.classList.add("active");

    if (isSectionEmpty(sec) && sec.statut_eleve === "not_started") li.classList.add("alert-empty");
    if (sec.statut_enseignant === "to_review") li.classList.add("to-review-highlight");
    if (isUnderfilled(sec)) li.classList.add("underfilled");

    const num = document.createElement("span");
    num.className = "sec-num"; num.textContent = (idx + 1) + ".";

    const title = document.createElement("span");
    title.className = "sec-title"; title.textContent = sec.titre;

    const badge = document.createElement("span");
    badge.className = "badge " + badgeClassFor(sec);
    badge.textContent = shortStatus(sec);

    // Petit indicateur de complétude (barre)
    const fill = document.createElement("span");
    fill.className = "mini-fill";
    const pct = Math.round(computeCompleteness(sec) * 100);
    fill.innerHTML = `<span style="width:${pct}%"></span>`;
    fill.title = `Rempli à ${pct} %`;

    li.append(num, title, fill, badge);
    li.addEventListener("click", () => selectSection(sec.id));
    ul.appendChild(li);
  });

  // Boutons de vue (synthèse orale, tableau enseignant)
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.classList.toggle("active", currentView.type === btn.dataset.view);
  });
}

function shortStatus(sec) {
  if (sec.statut_enseignant === "validated") return "Validée";
  if (sec.statut_enseignant === "to_review") return "À revoir";
  return STATUS_STUDENT[sec.statut_eleve] || "—";
}

function badgeClassFor(sec) {
  if (sec.statut_enseignant === "validated") return "badge-validated";
  if (sec.statut_enseignant === "to_review") return "badge-to-review";
  if (sec.statut_eleve === "done") return "badge-done";
  if (sec.statut_eleve === "in_progress") return "badge-in-progress";
  return "badge-not-started";
}

/* =====================================================================
   6. NAVIGATION & RENDU PRINCIPAL
   ===================================================================== */

function selectSection(id) {
  currentView = { type: "section", id };
  renderSidebar();
  renderMain();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectView(type) {
  currentView = { type, id: null };
  renderSidebar();
  renderMain();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* V4.77 — Routeur unifié : décide entre une vue custom (creer-etiquettes,
   choisir-fournisseurs, dossier, projet, parcours) et une section classique. */
const CUSTOM_VIEWS = new Set(["creer-etiquettes", "choisir-fournisseurs", "dossier", "projet", "parcours", "jalons", "oral-summary", "revision", "home"]);
let pendingScrollToCompo = null; // V4.78 — Cible de scroll après navigation
function navigateGoto(target, opts) {
  if (!target) return;
  if (opts && opts.compo) pendingScrollToCompo = opts.compo;
  if (CUSTOM_VIEWS.has(target)) {
    selectView(target);
  } else {
    selectSection(target);
  }
}
function applyPendingScroll() {
  if (!pendingScrollToCompo) return;
  const id = "compo-card-" + pendingScrollToCompo;
  pendingScrollToCompo = null;
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("compo-card-flash");
      setTimeout(() => el.classList.remove("compo-card-flash"), 1500);
    }
  }, 50);
}

function renderMain() {
  const container = document.getElementById("section-container");
  container.innerHTML = "";

  // V4.5 : welcome banner retirée — l'identité est dans la sidebar / splash.

  if (currentView.type === "oral-summary") {
    container.appendChild(renderOralSummary());
    return;
  }
  if (currentView.type === "home") {
    container.appendChild(renderHomeView());
    return;
  }
  if (currentView.type === "parcours") {
    container.appendChild(renderParcoursView());
    return;
  }
  if (currentView.type === "epreuve") {
    container.appendChild(renderEpreuveView(currentView.id));
    return;
  }
  if (currentView.type === "revision") {
    container.appendChild(renderRevisionView());
    return;
  }
  if (currentView.type === "projet") {
    container.appendChild(renderProjetView());
    return;
  }
  // V4.77 — Vues d'application (alternatives aux sections classiques)
  if (currentView.type === "creer-etiquettes") {
    container.appendChild(renderCreerEtiquettesView());
    return;
  }
  if (currentView.type === "choisir-fournisseurs") {
    container.appendChild(renderChoisirFournisseursView());
    return;
  }
  if (currentView.type === "dossier") {
    container.appendChild(renderDossierProjetView());
    return;
  }
  if (currentView.type === "jalons") {
    container.appendChild(renderJalonsView());
    return;
  }
  // Par défaut : affichage d'une section
  if (!currentView.id) currentView.id = state.sections[0].id;
  container.appendChild(renderSection(currentView.id));
}

/* =====================================================================
   7. RENDU D'UNE SECTION
   ===================================================================== */

/* V3 : bannière de bienvenue personnalisée — se met à jour avec le nom
   de l'élève et la progression. Aide aux élèves à se repérer séance après
   séance et à reprendre là où ils en sont. */
function renderWelcomeBanner() {
  const banner = document.createElement("div");
  banner.className = "welcome-banner no-print";
  const e = state.infos_eleve;
  const prenom = e.prenom ? escapeHtml(e.prenom) : "à toi";
  const total = state.sections.length;
  const done = state.sections.filter(s => s.statut_eleve === "done").length;
  const pct = Math.round(done / total * 100);

  const moduleSections = SECTIONS_SCHEMA.filter(s => s.module);
  const modulesFaits = moduleSections.filter(ms => {
    const sec = state.sections.find(s => s.id === ms.id);
    return sec?.module_state?.qcm_completed;
  }).length;

  const eDate = state.meta.date_derniere_modification
    ? new Date(state.meta.date_derniere_modification).toLocaleDateString("fr-FR")
    : "—";
  banner.innerHTML = `
    <div class="wb-left">
      <div class="wb-title">Portfolio — ${prenom}</div>
      <div class="wb-subtitle">Avancement : ${done}/${total} étapes terminées · ${modulesFaits}/${moduleSections.length} modules complétés
        · Dernière sauvegarde : ${eDate}</div>
    </div>
    <div class="wb-right">
      <div class="wb-tip">Pense à exporter ton portfolio en JSON à la fin de la séance.</div>
    </div>
  `;
  return banner;
}

function renderSection(sectionId) {
  const sec = state.sections.find(s => s.id === sectionId);
  const schema = SECTIONS_SCHEMA.find(s => s.id === sectionId);
  const card = document.createElement("section");
  card.className = "section-card";

  // V4.2 : barre de retour visible en haut de chaque section
  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `
    <button type="button" class="btn btn-back" data-go="home">← Retour à l'accueil</button>
    <button type="button" class="btn btn-back-projet" data-go="projet">Voir mon projet →</button>
  `;
  back.querySelector("[data-go='home']").addEventListener("click", () => selectView("home"));
  back.querySelector("[data-go='projet']").addEventListener("click", () => selectView("projet"));
  card.appendChild(back);

  /* En-tête */
  const head = document.createElement("div");
  head.className = "section-head";

  const left = document.createElement("div");
  const anneeTag = schema?.annee ? `<span class="year-badge year-${schema.annee}">${escapeHtml(ANNEES[schema.annee].label)}</span>` : "";
  left.innerHTML = `${anneeTag}<h2>${escapeHtml(sec.titre)}</h2><p class="desc">${escapeHtml(sec.description)}</p>`;

  const meta = document.createElement("div");
  meta.className = "section-meta";

  const statutLabel = document.createElement("label");
  statutLabel.innerHTML = `Statut élève : `;
  const statutSel = document.createElement("select");
  statutSel.className = "status-select";
  for (const [k, v] of Object.entries(STATUS_STUDENT)) {
    const opt = document.createElement("option");
    opt.value = k; opt.textContent = v;
    if (sec.statut_eleve === k) opt.selected = true;
    statutSel.appendChild(opt);
  }
  statutSel.addEventListener("change", () => {
    sec.statut_eleve = statutSel.value;
    sec.date_maj = new Date().toISOString();
    renderSidebar(); updateProgress(); scheduleAutoSave();
  });
  statutLabel.appendChild(statutSel);

  const badge = document.createElement("span");
  badge.className = "badge " + badgeClassFor(sec);
  badge.textContent = shortStatus(sec);

  // V2.1 : indicateur de remplissage réel (distinct du statut manuel)
  const pct = Math.round(computeCompleteness(sec) * 100);
  const fillInfo = document.createElement("div");
  fillInfo.className = "section-fill";
  fillInfo.innerHTML = `
    <div class="fill-label">Rempli à <b>${pct} %</b></div>
    <div class="fill-bar"><div style="width:${pct}%"></div></div>
  `;

  meta.append(statutLabel, badge, fillInfo);
  if (isUnderfilled(sec)) {
    const warn = document.createElement("div");
    warn.className = "alert-box";
    warn.style.margin = "0";
    warn.innerHTML = `⚠️ Cette section est marquée <b>terminée</b> mais elle reste peu remplie (${pct} %). Pensez à compléter les champs importants.`;
    meta.append(warn);
  }
  head.append(left, meta);
  card.appendChild(head);

  /* V4.5 : encart pédagogique transformé en bouton info discret.
     Cliquer dessus dévoile/replie la consigne. Réduit la pollution visuelle. */
  if (schema?.pedago) {
    const p = schema.pedago;
    const ped = document.createElement("div");
    ped.className = "pedago-toggle";
    ped.innerHTML = `
      <button type="button" class="pedago-info-btn" title="Voir les consignes">
        <span class="pedago-i">i</span><span>Consignes de cette étape</span>
        <span class="pedago-chevron">▾</span>
      </button>
      <div class="pedago-content" hidden>
        <div class="pedago-item"><b>Ce que je dois faire</b>${escapeHtml(p.consigne)}</div>
        <div class="pedago-item production"><b>Ce que je dois produire</b>${escapeHtml(p.production)}</div>
        <div class="pedago-item attentes"><b>Ce que l'enseignant attend</b>${escapeHtml(p.attentes)}</div>
      </div>
    `;
    const btn = ped.querySelector(".pedago-info-btn");
    const content = ped.querySelector(".pedago-content");
    btn.addEventListener("click", () => {
      const open = !content.hidden;
      content.hidden = open;
      btn.classList.toggle("open", !open);
    });
    card.appendChild(ped);
  }

  /* V3 : module pédagogique (cours + QCM + exercice) */
  if (schema?.module) {
    card.appendChild(renderPedagogicalModule(sec, schema.module));
  }

  /* V4.40 : récap automatique pour la section "repas_equilibre" */
  if (sec.id === "repas_equilibre") {
    card.appendChild(renderRecapRepas(sec));
  }

  /* Champs */
  (schema?.fields || []).forEach(fieldSchema => {
    const field = sec.champs.find(c => c.id === fieldSchema.id);
    card.appendChild(renderField(sec, field, fieldSchema));
  });

  /* Photos — masqué pour la section "accueil" (texte d'introduction, rien à prouver) */
  if (sec.id !== "accueil") card.appendChild(renderPhotosBlock(sec));

  /* V4.22 : bloc "Mes notes pour cette section" en post-it visibles */
  card.appendChild(renderSectionNotes(sec));

  /* V4.5 : pour la fiche identité, on transforme l'affichage en SPLIT :
     formulaire à gauche, aperçu live de la fiche à droite, qui se met à
     jour à chaque saisie. + boutons d'export en bas. */
  if (sec.id === "identite") {
    const split = document.createElement("div");
    split.className = "fiche-split";
    split.id = "fiche-live-preview";
    split.innerHTML = buildFicheIdentiteHTML(false);
    card.appendChild(split);

    const actions = document.createElement("div");
    actions.className = "module-actions";
    actions.innerHTML = `
      <button type="button" class="btn" id="btn-fiche-preview">Aperçu plein écran</button>
      <button type="button" class="btn btn-accent" id="btn-fiche-word">Exporter ma fiche en Word</button>
      <button type="button" class="btn" id="btn-fiche-pdf">Imprimer / PDF</button>
    `;
    actions.querySelector("#btn-fiche-preview").addEventListener("click", () => openFichePreview(false));
    actions.querySelector("#btn-fiche-word").addEventListener("click", exportFicheIdentiteWord);
    actions.querySelector("#btn-fiche-pdf").addEventListener("click", () => openFichePreview(true));
    card.appendChild(actions);
  }

  /* V4.3 : bouton "Exporter cette étape en Word" générique sur toutes les sections.
     Pour les modules pédagogiques, l'export est déjà dans le bloc module (avec QCM).
     Pour les autres sections, on l'ajoute ici. */
  if (sec.id !== "identite" && !schema?.module) {
    const actions = document.createElement("div");
    actions.className = "module-actions";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-accent";
    btn.textContent = "Exporter cette étape en Word";
    btn.addEventListener("click", () => exportSectionWord(sec, schema));
    actions.appendChild(btn);
    // V4.52 : bouton "Je soumets mon menu" pour la section composeur
    if (sec.id === "repas_equilibre") {
      const submitBtn = document.createElement("button");
      submitBtn.type = "button";
      submitBtn.className = "btn btn-primary btn-soumettre-menu";
      const isSubmitted = sec.menu_soumis === true;
      submitBtn.innerHTML = isSubmitted
        ? "🎉 Menu soumis — voir le récap"
        : "✅ Je soumets ma proposition de menu";
      submitBtn.addEventListener("click", () => openSoumettreMenu(sec));
      actions.insertBefore(submitBtn, btn);
    }
    card.appendChild(actions);
  }

  /* V4 : si l'enseignant a fait un retour "à revoir", l'élève le voit */
  if (sec.statut_enseignant === "to_review" && sec.commentaires_enseignant) {
    const note = document.createElement("div");
    note.className = "alert-box review";
    note.innerHTML = `<b>Commentaire de l'enseignant :</b><br />${escapeHtml(sec.commentaires_enseignant)}`;
    card.appendChild(note);
  }

  return card;
}

function renderField(sec, field, schema) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  const id = `f_${sec.id}_${field.id}`;

  // V4 : champ "repeater"
  if (schema.type === "repeater") {
    if (!Array.isArray(field.valeur)) field.valeur = [];
    return renderRepeater(sec, field, schema);
  }
  // V4.2 : champ "checklist" (cases à cocher avec ajout libre)
  if (schema.type === "checklist") {
    if (!Array.isArray(field.valeur)) field.valeur = [];
    return renderChecklist(sec, field, schema);
  }
  // V4.2 : champ "photo_profil" (photo unique pour la fiche identité)
  if (schema.type === "photo_profil") {
    return renderPhotoProfil(sec, field, schema);
  }
  // V4.40 : composeur de composante de repas (entrée, plat, etc.)
  if (schema.type === "composante_repas") {
    return renderComposanteRepas(sec, field, schema);
  }
  // V4.41 : textarea avec mots-clés cliquables
  if (schema.type === "textarea_keywords") {
    return renderTextareaKeywords(sec, field, schema);
  }
  // V4.47 : sélecteur d'image unique depuis la galerie
  if (schema.type === "image_picker_single") {
    return renderImagePickerSingle(sec, field, schema);
  }
  // V4.47 : sélecteur d'images multiples depuis la galerie
  if (schema.type === "image_picker_multi") {
    return renderImagePickerMulti(sec, field, schema);
  }

  if (schema.type === "checkbox") {
    wrap.classList.add("field-check");
    const input = document.createElement("input");
    input.type = "checkbox"; input.id = id; input.checked = !!field.valeur;
    const label = document.createElement("label");
    label.htmlFor = id; label.textContent = schema.label;
    input.addEventListener("change", () => {
      field.valeur = input.checked;
      sec.date_maj = new Date().toISOString();
      scheduleAutoSave();
    });
    wrap.append(input, label);
    return wrap;
  }

  const label = document.createElement("label");
  label.htmlFor = id; label.textContent = schema.label;
  wrap.appendChild(label);

  let input;
  if (schema.type === "textarea") input = document.createElement("textarea");
  else if (schema.type === "select") {
    input = document.createElement("select");
    (schema.options || []).forEach(opt => {
      const o = document.createElement("option");
      o.value = opt; o.textContent = opt;
      if (field.valeur === opt) o.selected = true;
      input.appendChild(o);
    });
  } else {
    input = document.createElement("input");
    input.type = schema.type === "number" ? "number" : schema.type === "date" ? "date" : "text";
  }
  input.id = id;
  if (input.tagName !== "SELECT") input.value = field.valeur ?? "";

  input.addEventListener("input", () => {
    field.valeur = input.value;
    sec.date_maj = new Date().toISOString();
    if (sec.statut_eleve === "not_started") {
      sec.statut_eleve = "in_progress";
      renderSidebar();
    }
    // V2.1 : synchronisation identité → infos_eleve
    if (sec.id === "identite" && IDENTITE_SYNC.includes(field.id)) {
      state.infos_eleve[field.id] = input.value;
    }
    scheduleAutoSave();
    // V4.5 : aperçu live de la fiche
    refreshFicheLivePreview();
  });

  wrap.appendChild(input);
  if (schema.hint) {
    const h = document.createElement("div");
    h.className = "hint"; h.textContent = schema.hint;
    wrap.appendChild(h);
  }
  // V4.72 : déroulant « En savoir plus » pour expliquer le cadre/contexte du champ
  if (schema.details) {
    const det = document.createElement("details");
    det.className = "field-details";
    det.style.cssText = "margin-top:6px; font-size:.92rem; color:#5a6471;";
    const sum = document.createElement("summary");
    sum.textContent = "En savoir plus";
    sum.style.cssText = "cursor:pointer; color:var(--c-primary-dark); font-weight:600; user-select:none;";
    det.appendChild(sum);
    const body = document.createElement("div");
    body.style.cssText = "margin-top:6px; padding:8px 12px; background:#f1f7ff; border-left:3px solid var(--c-primary-dark); border-radius:4px; line-height:1.5;";
    body.textContent = schema.details;
    det.appendChild(body);
    wrap.appendChild(det);
  }
  return wrap;
}

/* =====================================================================
   V4.40 — RENDERER "COMPOSANTE DE REPAS"
   ---------------------------------------------------------------------
   Affiche un panneau guidé pour composer une partie du repas (entrée,
   plat, laitage, dessert, boisson) :
     - un nom de plat (libre)
     - une liste d'ingrédients à AJOUTER en cliquant dans la banque
       d'aliments classée par groupe alimentaire
     - pour chaque ingrédient : possibilité de saisir une quantité
     - une liste de justifications nutritionnelles à cocher
     - un champ libre complémentaire
   Migration : si la valeur est une simple chaîne (ancien format), elle
   est convertie en { nom: "<chaîne>", ingredients: [], justifs: [], justif_libre: "" }.
   ===================================================================== */
function renderComposanteRepas(sec, field, schema) {
  // Migration depuis l'ancien format texte
  if (typeof field.valeur === "string" || field.valeur == null) {
    field.valeur = {
      nom: typeof field.valeur === "string" ? field.valeur : "",
      ingredients: [],
      justifs: [],
      justif_libre: "",
    };
  }
  const v = field.valeur;
  if (!Array.isArray(v.ingredients)) v.ingredients = [];
  if (!Array.isArray(v.justifs))     v.justifs = [];
  if (typeof v.justif_libre !== "string") v.justif_libre = "";
  if (typeof v.nom !== "string")     v.nom = "";

  const wrap = document.createElement("details");
  wrap.className = "field composante-repas";
  // V4.52 : toujours ouvert pour que le bouton "Choisir" soit visible
  wrap.open = true;

  const sum = document.createElement("summary");
  sum.className = "composante-summary";
  const refreshSummary = () => {
    const fac = schema.facultatif ? ` <span class="cr-fac">(facultatif)</span>` : "";
    const count = v.ingredients.length;
    const dot = count > 0 ? `<span class="cr-dot ok">●</span>` : `<span class="cr-dot ko">○</span>`;
    sum.innerHTML = `${dot} <b>${escapeHtml(schema.label)}</b>${fac} ${v.nom ? `— <i>${escapeHtml(v.nom)}</i>` : ""} <span class="cr-count">${count} ingrédient${count>1?"s":""}</span>`;
  };
  refreshSummary();
  wrap.appendChild(sum);

  const body = document.createElement("div");
  body.className = "composante-body";

  // V4.79 — Hint pédagogique selon la composante
  const COMPO_HINTS = {
    entree:  { txt: "Une entrée pour ouvrir l'appétit. Idéal : crudités ou légumes (vinaigrette, salade, soupe…).", icon: "🥗" },
    plat:    { txt: "Le plat principal contient plusieurs ingrédients : 🌾 1 féculent (riz, pâtes, pommes de terre, lentilles…) + 🥩 1 protéine (viande, poisson, œuf, légumineuses…) + 🥦 1 ou 2 légumes. Vise la règle ½ ¼ ¼.", icon: "🍽️" },
    laitage: { txt: "Un produit laitier qui apporte du calcium : yaourt, fromage blanc, fromage…", icon: "🧀" },
    dessert: { txt: "Un dessert sain et plaisant : un fruit frais, un fruit cuit, ou une compote sans sucre ajouté.", icon: "🍎" },
    boisson: { txt: "L'eau est la seule boisson indispensable. Évite les boissons sucrées.", icon: "💧" },
  };
  const hint = COMPO_HINTS[schema.composante];
  if (hint) {
    const hintBlock = document.createElement("div");
    hintBlock.className = "cr-pedago-hint";
    hintBlock.innerHTML = `<span class="cph-icon">${hint.icon}</span><div class="cph-txt">${hint.txt}</div>`;
    body.appendChild(hintBlock);
  }

  // 1) Nom du plat
  const nomBlock = document.createElement("div");
  nomBlock.className = "cr-block";
  nomBlock.innerHTML = `<label class="cr-label">Nom du plat / de la composante</label>`;
  const nomInput = document.createElement("input");
  nomInput.type = "text";
  nomInput.className = "cr-nom";
  nomInput.placeholder = "Ex : Salade de carottes au citron";
  nomInput.value = v.nom;
  nomInput.addEventListener("input", () => {
    v.nom = nomInput.value;
    sec.date_maj = new Date().toISOString();
    if (sec.statut_eleve === "not_started") { sec.statut_eleve = "in_progress"; renderSidebar(); }
    refreshSummary();
    refreshRecapRepas(sec);
    scheduleAutoSave();
  });
  nomBlock.appendChild(nomInput);
  body.appendChild(nomBlock);

  // 2) V4.47 — Bouton qui ouvre la galerie d'images
  const banqueBlock = document.createElement("div");
  banqueBlock.className = "cr-block cr-banque-block";
  // Catégories suggérées selon la composante
  const COMPO_CATS = {
    entree:  ["aliments", "plats", "pedago"],
    plat:    ["aliments", "plats"],
    laitage: ["aliments"],
    dessert: ["aliments", "plats"],
    boisson: ["aliments"],
  };
  const cats = COMPO_CATS[schema.composante] || ["aliments", "plats"];
  banqueBlock.innerHTML = `<label class="cr-label">Mes ingrédients — clique pour piocher dans la banque d'images</label>`;
  const btnPick = document.createElement("button");
  btnPick.type = "button";
  btnPick.className = "btn btn-primary cr-pick-btn";
  btnPick.innerHTML = `🖼️ Choisir des aliments / plats dans la banque d'images`;
  btnPick.addEventListener("click", () => {
    openGaleriePicker({
      title: `🖼️ Choisir des ingrédients pour : ${schema.label}`,
      multi: true,
      withQuantity: true,  // V4.52 : saisir la quantité directement dans la galerie
      categories: cats,
      onSelect: (selection) => {
        const arr = Array.isArray(selection) ? selection : [selection];
        // V4.50 : anti-doublons par photo OU par nom normalisé
        const norm = s => (s || "").toLowerCase()
          .normalize("NFD").replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]/g, "");
        arr.forEach(sel => {
          if (v.ingredients.some(ing => ing.photo === sel.fichier)) return;
          if (v.ingredients.some(ing => norm(ing.aliment) === norm(sel.nom))) return;
          v.ingredients.push({
            aliment: sel.nom,
            photo: sel.fichier,
            groupe: sel.sous_categorie,
            quantite: sel.quantite || "",  // V4.52 : récupère la quantité saisie
          });
        });
        sec.date_maj = new Date().toISOString();
        if (sec.statut_eleve === "not_started") { sec.statut_eleve = "in_progress"; renderSidebar(); }
        refreshList(); refreshSummary(); refreshRecapRepas(sec); scheduleAutoSave();
      },
    });
  });
  banqueBlock.appendChild(btnPick);

  // V4.54 : ajout libre d'un aliment qui n'est pas dans la banque
  const libreBlock = document.createElement("div");
  libreBlock.className = "cr-libre-add-block";
  libreBlock.innerHTML = `
    <div class="cr-libre-label">Mon aliment n'est pas dans la banque ? Ajoute-le librement :</div>
    <div class="cr-libre-row">
      <input type="text" class="cr-libre-input" placeholder="Ex : Radis noir, Quinoa rouge…" />
      <select class="cr-libre-groupe-sel">
        <option value="">Choisir un groupe…</option>
        <option value="Légumes">🥕 Légumes</option>
        <option value="Fruits">🍎 Fruits</option>
        <option value="Viandes">🥩 Viandes</option>
        <option value="Poissons & fruits de mer">🐟 Poissons / Fruits de mer</option>
        <option value="Produits laitiers">🧀 Produits laitiers</option>
        <option value="Œufs & préparations">🥚 Œufs</option>
        <option value="Charcuteries">🥓 Charcuteries</option>
        <option value="Féculents">🍞 Féculents</option>
        <option value="Légumineuses">🫘 Légumineuses</option>
        <option value="Boissons">🥤 Boissons</option>
        <option value="Desserts">🍰 Desserts / sucreries</option>
        <option value="Sauces & herbes">🌿 Sauces / herbes</option>
        <option value="Autre">❓ Autre</option>
      </select>
      <button type="button" class="btn btn-small cr-libre-add-btn">+ Ajouter</button>
    </div>
  `;
  const libreInput = libreBlock.querySelector(".cr-libre-input");
  const libreSel = libreBlock.querySelector(".cr-libre-groupe-sel");
  libreBlock.querySelector(".cr-libre-add-btn").addEventListener("click", () => {
    const aliment = (libreInput.value || "").trim();
    const groupe = libreSel.value || "Autre";
    if (!aliment) return;
    // Anti-doublon
    const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
    if (v.ingredients.some(ing => norm(ing.aliment) === norm(aliment))) {
      showAppToast("⚠️ Cet aliment est déjà dans la composante.");
      return;
    }
    v.ingredients.push({
      aliment: aliment,
      photo: null,        // pas de photo (sera affiché en lettre)
      groupe: groupe,
      quantite: "",
      ajout_libre: true,  // marqueur pour la suggestion
    });
    libreInput.value = "";
    libreSel.value = "";
    sec.date_maj = new Date().toISOString();
    if (sec.statut_eleve === "not_started") { sec.statut_eleve = "in_progress"; renderSidebar(); }
    refreshList(); refreshSummary(); refreshRecapRepas(sec); scheduleAutoSave();
    // Propose de suggérer cet aliment pour la banque
    proposerSuggestionAliment(aliment, groupe);
  });
  banqueBlock.appendChild(libreBlock);
  body.appendChild(banqueBlock);

  // 3) Liste des ingrédients ajoutés
  const listBlock = document.createElement("div");
  listBlock.className = "cr-block";
  listBlock.innerHTML = `<label class="cr-label">Mes ingrédients sélectionnés</label>`;
  const list = document.createElement("div");
  list.className = "cr-liste";
  listBlock.appendChild(list);
  body.appendChild(listBlock);

  function refreshList() {
    list.innerHTML = "";
    if (v.ingredients.length === 0) {
      list.innerHTML = `<p class="cr-empty">Aucun ingrédient pour l'instant — clique sur le bouton ci-dessus pour piocher dans la banque d'images.</p>`;
      return;
    }
    v.ingredients.forEach((ing, idx) => {
      // V4.47 : tuile visuelle avec photo (V4.50 : auto-match si pas définie)
      const tile = document.createElement("div");
      tile.className = "cr-ing-tile";
      const photoSrc = ing.photo || findPhotoForExoItem(ing.aliment);
      const photoHTML = photoSrc
        ? `<img class="cr-ing-photo" src="${encodeURI(photoSrc)}" alt="${escapeHtml(ing.aliment)}" loading="lazy" />`
        : `<div class="cr-ing-photo cr-ing-photo-empty" data-letter="${escapeHtml((ing.aliment || "?").trim().charAt(0).toUpperCase())}"></div>`;
      tile.innerHTML = `
        ${photoHTML}
        <button type="button" class="cr-ing-del" title="Retirer">✕</button>
        <div class="cr-ing-info">
          <div class="cr-ing-nom">${escapeHtml(ing.aliment || "")}</div>
          <div class="cr-ing-grp">${escapeHtml(ing.groupe || "—")}</div>
          <input type="text" class="cr-ing-qte" placeholder="Quantité (ex: 80 g)" value="${escapeHtml(ing.quantite || "")}" />
        </div>
      `;
      const qte = tile.querySelector(".cr-ing-qte");
      qte.addEventListener("input", () => {
        ing.quantite = qte.value;
        sec.date_maj = new Date().toISOString();
        scheduleAutoSave();
      });
      tile.querySelector(".cr-ing-del").addEventListener("click", () => {
        v.ingredients.splice(idx, 1);
        sec.date_maj = new Date().toISOString();
        refreshList(); refreshSummary(); refreshRecapRepas(sec); scheduleAutoSave();
      });
      list.appendChild(tile);
    });
  }
  refreshList();

  // 4) Justifications nutritionnelles
  const justifBlock = document.createElement("div");
  justifBlock.className = "cr-block";
  justifBlock.innerHTML = `<label class="cr-label">Pourquoi j'ai choisi cette composante (coche celles qui s'appliquent)</label>`;
  const justifW = document.createElement("div");
  justifW.className = "cr-justifs";
  BANQUE_JUSTIFICATIONS.forEach(j => {
    const lab = document.createElement("label");
    lab.className = "cr-justif";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = v.justifs.includes(j);
    cb.addEventListener("change", () => {
      if (cb.checked && !v.justifs.includes(j)) v.justifs.push(j);
      if (!cb.checked) v.justifs = v.justifs.filter(x => x !== j);
      sec.date_maj = new Date().toISOString();
      scheduleAutoSave();
    });
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(" " + j));
    justifW.appendChild(lab);
  });
  justifBlock.appendChild(justifW);
  body.appendChild(justifBlock);

  // 5) Justification libre
  const libreJ = document.createElement("div");
  libreJ.className = "cr-block";
  libreJ.innerHTML = `<label class="cr-label">Précision personnelle (facultatif)</label>`;
  const ta = document.createElement("textarea");
  ta.className = "cr-justif-libre";
  ta.placeholder = "Ex : J'ai choisi des carottes du marché de la Croix-Rousse parce qu'elles sont locales.";
  ta.value = v.justif_libre;
  ta.addEventListener("input", () => {
    v.justif_libre = ta.value;
    sec.date_maj = new Date().toISOString();
    scheduleAutoSave();
  });
  libreJ.appendChild(ta);
  body.appendChild(libreJ);

  // V4.76 — Aperçu de l'étiquette liée à cette composante
  body.appendChild(renderEtiquetteLieeBlock(schema));

  wrap.appendChild(body);
  return wrap;
}

/* =====================================================================
   V4.76 — Bloc « étiquette liée » affiché sous chaque composante du menu.
   Cherche dans state.sections[etiquetage].champs.etiquettes une étiquette
   dont composante_liee correspond à la composante (Entrée, Plat, ...).
   Si trouvée → affiche un aperçu vignette. Sinon → CTA « Créer maintenant ».
   ===================================================================== */
const COMPOSANTE_LABEL_MAP = {
  entree:  "Entrée",
  plat:    "Plat principal",
  laitage: "Laitage",
  dessert: "Dessert",
  boisson: "Boisson",
};

function findEtiquetteForComposante(composanteKey) {
  const cible = COMPOSANTE_LABEL_MAP[composanteKey];
  if (!cible) return null;
  const secEt = state.sections.find(s => s.id === "etiquetage");
  if (!secEt) return null;
  const champEt = secEt.champs.find(c => c.id === "etiquettes");
  if (!champEt || !Array.isArray(champEt.valeur)) return null;
  return champEt.valeur.find(et => et.composante_liee === cible) || null;
}

function renderEtiquetteLieeBlock(schema) {
  const wrap = document.createElement("div");
  wrap.className = "cr-block cr-etiquette-bloc";
  const composanteKey = schema.composante;
  const et = findEtiquetteForComposante(composanteKey);

  if (et) {
    // Aperçu de l'étiquette créée
    const dateMention = et.type_date && et.date
      ? `${et.type_date.includes("DLC") ? "DLC" : "DDM"} : ${escapeHtml(et.date)}`
      : "";
    wrap.innerHTML = `
      <label class="cr-label">🏷️ Étiquette liée à cette composante</label>
      <div class="etiq-preview">
        <div class="etiq-preview-head">
          <b>${escapeHtml(et.nom_produit || "(sans nom)")}</b>
          ${et.slogan ? `<i>« ${escapeHtml(et.slogan)} »</i>` : ""}
        </div>
        <div class="etiq-preview-body">
          ${et.ingredients ? `<div><b>Ingrédients :</b> ${escapeHtml(et.ingredients)}</div>` : ""}
          ${et.allergenes  ? `<div class="etiq-allerg"><b>⚠️ Allergènes :</b> ${escapeHtml(et.allergenes)}</div>` : ""}
          ${dateMention   ? `<div>${dateMention}</div>` : ""}
          ${et.poids       ? `<div><b>Quantité :</b> ${escapeHtml(et.poids)}</div>` : ""}
          ${et.tracabilite ? `<div><b>Traçabilité :</b> ${escapeHtml(et.tracabilite)}</div>` : ""}
        </div>
        <button type="button" class="btn btn-sm btn-secondary etiq-go">Modifier l'étiquette</button>
      </div>`;
  } else {
    wrap.innerHTML = `
      <label class="cr-label">🏷️ Étiquette liée à cette composante</label>
      <div class="etiq-empty">
        <span class="etiq-empty-icon">⚠️</span>
        <div>
          <b>Pas encore d'étiquette pour cette composante.</b>
          <div class="hint">Crée une étiquette dans la section <b>Étiquetage</b> et choisis « ${escapeHtml(COMPOSANTE_LABEL_MAP[composanteKey] || "—")} » comme composante liée.</div>
        </div>
        <button type="button" class="btn btn-sm btn-primary etiq-go">Créer maintenant →</button>
      </div>`;
  }
  // V4.77 — Lien vers la vue d'application "Créer mes étiquettes" (pas les cours)
  wrap.querySelector(".etiq-go").addEventListener("click", () => {
    selectView("creer-etiquettes");
  });
  return wrap;
}

/* V4.40 — Récap automatique du repas (½ ¼ ¼) injecté en haut de la
   section "repas_equilibre". Recalculé à chaque ajout/retrait. */
function renderRecapRepas(sec) {
  const wrap = document.createElement("div");
  wrap.className = "recap-repas";
  wrap.id = "recap-repas-" + sec.id;
  refreshRecapRepasInto(sec, wrap);
  return wrap;
}
function refreshRecapRepas(sec) {
  const el = document.getElementById("recap-repas-" + sec.id);
  if (el) refreshRecapRepasInto(sec, el);
}
function refreshRecapRepasInto(sec, el) {
  const counts = { legumes:0, fruits:0, feculents:0, proteines:0, laitier:0, gras:0, sucre:0, boisson:0 };
  const groupesPresents = new Set();
  ["entree","plat","laitage","dessert","boisson"].forEach(fid => {
    const f = sec.champs.find(c => c.id === fid);
    if (!f || !f.valeur || typeof f.valeur !== "object") return;
    const ings = Array.isArray(f.valeur.ingredients) ? f.valeur.ingredients : [];
    ings.forEach(i => {
      groupesPresents.add(i.groupe);
      const cat = GROUPE_VERS_CATEG[i.groupe];
      if (cat && (cat in counts)) counts[cat]++;
    });
  });
  const principaux = counts.legumes + counts.feculents + counts.proteines;
  const pct = (n) => principaux > 0 ? Math.round(n / principaux * 100) : 0;
  const pLeg = pct(counts.legumes), pFec = pct(counts.feculents), pPro = pct(counts.proteines);
  const ok = (n,t) => Math.abs(n - t) <= 15;
  const checkLeg = ok(pLeg, 50), checkFec = ok(pFec, 25), checkPro = ok(pPro, 25);
  const hasLait = counts.laitier > 0;
  const hasFruit = counts.fruits > 0;
  const hasBoisson = counts.boisson > 0;

  el.innerHTML = `
    <h3>📊 Récap automatique de mon repas</h3>
    <p class="recap-hint">Cible : ½ légumes / ¼ féculents / ¼ protéines</p>
    <div class="recap-bar">
      <div class="recap-seg seg-leg ${checkLeg ? "ok" : "ko"}" style="width:${Math.max(pLeg,5)}%" title="Légumes ${pLeg}%">Légumes ${pLeg}%</div>
      <div class="recap-seg seg-fec ${checkFec ? "ok" : "ko"}" style="width:${Math.max(pFec,5)}%" title="Féculents ${pFec}%">Féculents ${pFec}%</div>
      <div class="recap-seg seg-pro ${checkPro ? "ok" : "ko"}" style="width:${Math.max(pPro,5)}%" title="Protéines ${pPro}%">Protéines ${pPro}%</div>
    </div>
    <ul class="recap-checks">
      <li class="${checkLeg ? "ok" : "ko"}">${checkLeg ? "✅" : "⚠️"} Moitié de légumes (cible ~50 %, actuel ${pLeg}%)</li>
      <li class="${checkFec ? "ok" : "ko"}">${checkFec ? "✅" : "⚠️"} Quart de féculents (cible ~25 %, actuel ${pFec}%)</li>
      <li class="${checkPro ? "ok" : "ko"}">${checkPro ? "✅" : "⚠️"} Quart de protéines (cible ~25 %, actuel ${pPro}%)</li>
      <li class="${hasLait ? "ok" : "ko"}">${hasLait ? "✅" : "○"} Un produit laitier</li>
      <li class="${hasFruit ? "ok" : "ko"}">${hasFruit ? "✅" : "○"} Un fruit</li>
      <li class="${hasBoisson ? "ok" : "ko"}">${hasBoisson ? "✅" : "○"} Une boisson</li>
    </ul>
    <p class="recap-groupes"><b>Groupes présents :</b> ${groupesPresents.size > 0 ? [...groupesPresents].map(g => `<span class="recap-grp-tag">${escapeHtml(g)}</span>`).join(" ") : "<i>aucun pour l'instant</i>"}</p>
  `;
}

/* =====================================================================
   V4.2 — RENDERER CHECKLIST
   ---------------------------------------------------------------------
   Champ avec liste prédéfinie de cases à cocher (chips cliquables).
   Si schema.allow_custom = true, l'élève peut en ajouter librement.
   La valeur est un tableau de strings.
   ===================================================================== */
function renderChecklist(sec, field, schema) {
  const wrap = document.createElement("div");
  wrap.className = "field checklist-field";
  const label = document.createElement("label");
  label.textContent = schema.label;
  wrap.appendChild(label);
  if (schema.hint) {
    const h = document.createElement("div");
    h.className = "hint"; h.textContent = schema.hint;
    wrap.appendChild(h);
  }

  // Toutes les options (prédéfinies + custom déjà ajoutées par l'élève)
  const allOptions = new Set([...schema.options, ...field.valeur]);

  const grid = document.createElement("div");
  grid.className = "checklist-grid";
  Array.from(allOptions).forEach(opt => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chk-chip";
    const checked = field.valeur.includes(opt);
    if (checked) chip.classList.add("checked");
    const isCustom = !schema.options.includes(opt);
    chip.innerHTML = `<span class="chk-mark">${checked ? "✓" : ""}</span><span>${escapeHtml(opt)}</span>`;
    if (isCustom) {
      chip.classList.add("custom");
      const del = document.createElement("span");
      del.className = "chk-del"; del.title = "Retirer";
      del.textContent = "×";
      del.addEventListener("click", (ev) => {
        ev.stopPropagation();
        field.valeur = field.valeur.filter(v => v !== opt);
        scheduleAutoSave(); renderMain();
      });
      chip.appendChild(del);
    }
    chip.addEventListener("click", () => {
      if (field.valeur.includes(opt)) {
        field.valeur = field.valeur.filter(v => v !== opt);
      } else {
        field.valeur = [...field.valeur, opt];
      }
      scheduleAutoSave(); renderMain(); refreshFicheLivePreview();
    });
    grid.appendChild(chip);
  });
  wrap.appendChild(grid);

  if (schema.allow_custom) {
    const add = document.createElement("div");
    add.className = "checklist-add";
    add.innerHTML = `
      <input type="text" placeholder="Ajouter un autre élément" />
      <button type="button" class="btn btn-sm">Ajouter</button>
    `;
    const inp = add.querySelector("input");
    const btn = add.querySelector("button");
    const doAdd = () => {
      const v = inp.value.trim();
      if (!v) return;
      if (!field.valeur.includes(v)) field.valeur = [...field.valeur, v];
      inp.value = "";
      scheduleAutoSave(); renderMain();
    };
    btn.addEventListener("click", doAdd);
    inp.addEventListener("keydown", (ev) => { if (ev.key === "Enter") { ev.preventDefault(); doAdd(); } });
    wrap.appendChild(add);
  }

  return wrap;
}

/* =====================================================================
   V4.2 — RENDERER PHOTO DE PROFIL
   ---------------------------------------------------------------------
   Réutilise resizeAndCompressImage(). La photo est stockée dans
   state.infos_eleve.photo_profil (base64). Elle apparaîtra dans la
   fiche imprimable.
   ===================================================================== */
function renderPhotoProfil(sec, field, schema) {
  const wrap = document.createElement("div");
  wrap.className = "field photo-profil-field";
  const label = document.createElement("label");
  label.textContent = schema.label;
  wrap.appendChild(label);

  const block = document.createElement("div");
  block.className = "photo-profil-block";
  const current = state.infos_eleve.photo_profil;
  if (current) {
    const img = document.createElement("img");
    img.className = "photo-profil-preview";
    img.src = current; img.alt = "Photo de profil";
    block.appendChild(img);

    const del = document.createElement("button");
    del.type = "button"; del.className = "btn btn-sm";
    del.textContent = "Retirer la photo";
    del.addEventListener("click", () => {
      if (!confirm("Retirer la photo ?")) return;
      delete state.infos_eleve.photo_profil;
      scheduleAutoSave(); renderMain();
    });
    block.appendChild(del);
  } else {
    const empty = document.createElement("div");
    empty.className = "photo-profil-empty";
    empty.textContent = "Pas encore de photo.";
    block.appendChild(empty);

    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.addEventListener("change", async () => {
      const f = inp.files[0]; if (!f) return;
      try {
        state.infos_eleve.photo_profil = await resizeAndCompressImage(f);
        scheduleAutoSave(); renderMain();
      } catch { alert("Impossible d'ajouter la photo."); }
    });
    block.appendChild(inp);
  }
  wrap.appendChild(block);
  return wrap;
}

/* =====================================================================
   V4 — RENDERER REPEATER (champs multiples : étiquettes, fournisseurs)
   ---------------------------------------------------------------------
   Stocke un tableau d'objets dans field.valeur. Chaque objet a un id
   unique et les sous-champs définis dans schema.fields.
   ===================================================================== */
function uid() { return "i" + Math.random().toString(36).slice(2, 9); }

function renderRepeater(sec, field, schema) {
  const wrap = document.createElement("div");
  wrap.className = "field repeater-field";

  const label = document.createElement("label");
  label.textContent = schema.label;
  wrap.appendChild(label);

  const list = document.createElement("div");
  list.className = "repeater-list";

  field.valeur.forEach((item, idx) => {
    const itemWrap = document.createElement("div");
    itemWrap.className = "repeater-item";

    // En-tête de l'item : titre + bouton replier + bouton supprimer
    const head = document.createElement("div");
    head.className = "repeater-item-head";
    const title = item[schema.item_title_field] || `${schema.item_label || "Item"} ${idx + 1}`;
    const collapsedKey = `_collapsed_${sec.id}_${field.id}_${item.id}`;
    const isCollapsed = !!sec[collapsedKey];

    head.innerHTML = `
      <span class="repeater-item-num">${idx + 1}</span>
      <span class="repeater-item-title">${escapeHtml(title)}</span>
      <button type="button" class="btn btn-sm btn-toggle">${isCollapsed ? "▸ Déplier" : "▾ Replier"}</button>
      <button type="button" class="btn btn-sm btn-delete">Supprimer</button>
    `;
    head.querySelector(".btn-toggle").addEventListener("click", () => {
      sec[collapsedKey] = !sec[collapsedKey]; renderMain();
    });
    head.querySelector(".btn-delete").addEventListener("click", () => {
      if (confirm(`Supprimer "${title}" ?`)) {
        field.valeur.splice(idx, 1);
        scheduleAutoSave(); renderMain();
      }
    });
    itemWrap.appendChild(head);

    if (!isCollapsed) {
      const body = document.createElement("div");
      body.className = "repeater-item-body";
      // V4.61 : pour le repeater "etiquettes" → pré-remplissage depuis le menu
      if (sec.id === "etiquetage" && field.id === "etiquettes") {
        const aide = document.createElement("div");
        aide.className = "etiq-prefill";
        aide.innerHTML = `
          <span class="etiq-prefill-icon">💡</span>
          <span class="etiq-prefill-txt">Aide-toi de ton menu déjà composé :</span>
          <button type="button" class="btn btn-sm" data-action="prefill-ing">📋 Reprendre les ingrédients</button>
          <button type="button" class="btn btn-sm" data-action="prefill-all">⚠️ Détecter les allergènes</button>
        `;
        aide.querySelector('[data-action="prefill-ing"]').addEventListener("click", () => {
          const txt = collectIngredientsFromMenu();
          if (!txt) { showAppToast("⚠️ Aucun ingrédient dans ton menu pour le moment. Va d'abord composer ton repas."); return; }
          if (item.ingredients && !confirm("Le champ ingrédients n'est pas vide. Le remplacer ?")) return;
          item.ingredients = txt;
          scheduleAutoSave();
          renderMain();
        });
        aide.querySelector('[data-action="prefill-all"]').addEventListener("click", () => {
          const allergenes = detectAllergenesFromMenu();
          if (allergenes.length === 0) { showAppToast("✅ Aucun allergène majeur détecté dans ton menu (à vérifier quand même !)."); return; }
          const txt = allergenes.join(", ") + ". Peut contenir des traces de GLUTEN, LAIT, ŒUF (à vérifier selon le contexte de production).";
          if (item.allergenes && !confirm("Le champ allergènes n'est pas vide. Le remplacer ?")) return;
          item.allergenes = txt;
          scheduleAutoSave();
          renderMain();
        });
        body.appendChild(aide);
      }
      schema.fields.forEach(subSchema => {
        const fld = document.createElement("div");
        fld.className = "field";
        const lbl = document.createElement("label");
        lbl.textContent = subSchema.label;
        fld.appendChild(lbl);

        // V4.75 — support du type "checklist" dans un repeater
        if (subSchema.type === "checklist") {
          if (!Array.isArray(item[subSchema.id])) item[subSchema.id] = [];
          const cur = item[subSchema.id];
          const box = document.createElement("div");
          box.className = "rep-checklist";
          (subSchema.options || []).forEach(opt => {
            const lab = document.createElement("label");
            lab.className = "rep-check";
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = cur.includes(opt);
            cb.addEventListener("change", () => {
              if (cb.checked && !cur.includes(opt)) cur.push(opt);
              else if (!cb.checked) {
                const idx = cur.indexOf(opt);
                if (idx >= 0) cur.splice(idx, 1);
              }
              sec.date_maj = new Date().toISOString();
              scheduleAutoSave();
            });
            lab.append(cb, document.createTextNode(" " + opt));
            box.appendChild(lab);
          });
          fld.appendChild(box);
          body.appendChild(fld);
          return;
        }

        let inp;
        if (subSchema.type === "textarea") inp = document.createElement("textarea");
        else if (subSchema.type === "select") {
          inp = document.createElement("select");
          (subSchema.options || []).forEach(opt => {
            const o = document.createElement("option");
            o.value = opt; o.textContent = opt;
            if (item[subSchema.id] === opt) o.selected = true;
            inp.appendChild(o);
          });
        } else {
          inp = document.createElement("input");
          inp.type = subSchema.type === "date" ? "date" : subSchema.type === "number" ? "number" : "text";
        }
        if (inp.tagName !== "SELECT") inp.value = item[subSchema.id] || "";
        inp.addEventListener("input", () => {
          item[subSchema.id] = inp.value;
          sec.date_maj = new Date().toISOString();
          scheduleAutoSave();
        });
        fld.appendChild(inp);
        if (subSchema.hint) {
          const h = document.createElement("div");
          h.className = "hint"; h.textContent = subSchema.hint;
          fld.appendChild(h);
        }
        body.appendChild(fld);
      });
      itemWrap.appendChild(body);
    }
    list.appendChild(itemWrap);
  });

  wrap.appendChild(list);

  const btnAdd = document.createElement("button");
  btnAdd.type = "button";
  btnAdd.className = "btn btn-primary repeater-add";
  btnAdd.textContent = `+ Ajouter ${schema.item_label || "un élément"}`;
  btnAdd.addEventListener("click", () => {
    const newItem = { id: uid() };
    schema.fields.forEach(s => {
      if (s.type === "checklist") newItem[s.id] = [];
      else if (s.type === "select") newItem[s.id] = (s.options?.[0] || "");
      else newItem[s.id] = "";
    });
    field.valeur.push(newItem);
    scheduleAutoSave(); renderMain();
  });
  wrap.appendChild(btnAdd);

  return wrap;
}

/* =====================================================================
   8. PHOTOS — redimensionnement et compression (V2)
   ---------------------------------------------------------------------
   Les photos sont toujours stockées en base64 dans le JSON (autonomie
   locale), mais on les redimensionne à PHOTO_MAX_WIDTH/HEIGHT et on les
   compresse en JPEG (qualité PHOTO_JPEG_QUALITY) avant stockage.
   Cela réduit fortement la taille du JSON (~10× plus léger).
   ===================================================================== */

function renderPhotosBlock(sec) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  const label = document.createElement("label");
  label.textContent = "Photos / preuves";
  wrap.appendChild(label);

  const block = document.createElement("div");
  block.className = "photos-block";

  const fileInput = document.createElement("input");
  fileInput.type = "file"; fileInput.accept = "image/*"; fileInput.multiple = true;
  fileInput.addEventListener("change", async () => {
    await handlePhotoUpload(sec, fileInput.files);
    fileInput.value = "";
    renderMain();
  });
  block.appendChild(fileInput);

  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = `Les photos sont automatiquement redimensionnées (max ${PHOTO_MAX_WIDTH}px) et compressées.`;
  block.appendChild(hint);

  const grid = document.createElement("div");
  grid.className = "photos-grid";

  sec.preuves.forEach((p, idx) => {
    if (p.type !== "photo") return;
    const item = document.createElement("div");
    item.className = "photo-item";

    const img = document.createElement("img");
    img.src = p.contenu; img.alt = p.nom_fichier || "photo";

    const del = document.createElement("button");
    del.type = "button"; del.className = "photo-del"; del.textContent = "×";
    del.title = "Supprimer la photo";
    del.addEventListener("click", () => {
      if (confirm("Supprimer cette photo ?")) {
        sec.preuves.splice(idx, 1);
        sec.date_maj = new Date().toISOString();
        saveState(); renderMain();
      }
    });

    // V3 : étoile "photo principale" (utile pour la fiche menu Word)
    const star = document.createElement("button");
    star.type = "button"; star.className = "photo-star";
    star.textContent = p.is_main ? "★" : "☆";
    star.title = "Définir comme photo principale du menu";
    if (p.is_main) star.classList.add("active");
    star.addEventListener("click", () => {
      // Une seule photo principale à la fois, toutes sections confondues
      state.sections.forEach(s => s.preuves.forEach(pp => { pp.is_main = false; }));
      p.is_main = true;
      saveState(); renderMain();
    });

    const cap = document.createElement("input");
    cap.type = "text"; cap.className = "photo-caption";
    cap.value = p.commentaire || "";
    cap.placeholder = "Légende";
    cap.addEventListener("input", () => { p.commentaire = cap.value; scheduleAutoSave(); });

    item.append(img, del, star, cap);
    if (p.is_main) item.classList.add("is-main-photo");
    grid.appendChild(item);
  });

  block.appendChild(grid);
  wrap.appendChild(block);
  return wrap;
}

async function handlePhotoUpload(sec, files) {
  for (const f of files) {
    try {
      const b64 = await resizeAndCompressImage(f);
      sec.preuves.push({
        type: "photo",
        nom_fichier: f.name,
        contenu: b64,
        date_ajout: new Date().toISOString(),
        commentaire: "",
      });
    } catch (e) {
      console.error("Erreur photo", e);
      alert("Impossible d'ajouter la photo : " + f.name);
    }
  }
  sec.date_maj = new Date().toISOString();
  saveState();
}

/** Redimensionne et compresse une image via canvas. */
function resizeAndCompressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        const ratio = Math.min(PHOTO_MAX_WIDTH / width, PHOTO_MAX_HEIGHT / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/* =====================================================================
   9. BLOC ENSEIGNANT
   ===================================================================== */

function renderTeacherBlock(sec) {
  const block = document.createElement("div");
  block.className = "teacher-block";
  block.innerHTML = `<h3>Espace enseignant</h3>`;

  const hint = document.createElement("div");
  hint.className = "hint-role";
  hint.textContent = "Activez le mode enseignant (en haut à droite) pour modifier ces informations.";
  block.appendChild(hint);

  const selLabel = document.createElement("label");
  selLabel.textContent = "Statut enseignant : ";
  const sel = document.createElement("select");
  sel.className = "status-select teacher-only-edit";
  for (const [k, v] of Object.entries(STATUS_TEACHER)) {
    const o = document.createElement("option");
    o.value = k; o.textContent = v;
    if (sec.statut_enseignant === k) o.selected = true;
    sel.appendChild(o);
  }
  sel.disabled = !teacherMode;
  sel.addEventListener("change", () => {
    sec.statut_enseignant = sel.value;
    if (sel.value === "validated") sec.date_validation = new Date().toISOString().slice(0, 10);
    renderSidebar(); updateProgress(); scheduleAutoSave(); renderMain();
  });
  selLabel.appendChild(sel);
  block.appendChild(selLabel);

  const c = document.createElement("div"); c.className = "field";
  const cl = document.createElement("label"); cl.textContent = "Commentaire enseignant";
  const ct = document.createElement("textarea");
  ct.value = sec.commentaires_enseignant || "";
  ct.disabled = !teacherMode;
  ct.classList.add("teacher-only-edit");
  ct.addEventListener("input", () => { sec.commentaires_enseignant = ct.value; scheduleAutoSave(); });
  c.append(cl, ct); block.appendChild(c);

  const n = document.createElement("div"); n.className = "field";
  const nl = document.createElement("label"); nl.textContent = "Note locale (facultative)";
  const ni = document.createElement("input"); ni.type = "text";
  ni.value = sec.note || ""; ni.disabled = !teacherMode;
  ni.classList.add("teacher-only-edit");
  ni.addEventListener("input", () => { sec.note = ni.value; scheduleAutoSave(); });
  n.append(nl, ni); block.appendChild(n);

  const d = document.createElement("div"); d.className = "field";
  const dl = document.createElement("label"); dl.textContent = "Date de validation";
  const di = document.createElement("input"); di.type = "date";
  di.value = sec.date_validation || ""; di.disabled = !teacherMode;
  di.classList.add("teacher-only-edit");
  di.addEventListener("input", () => { sec.date_validation = di.value; scheduleAutoSave(); });
  d.append(dl, di); block.appendChild(d);

  return block;
}

/* =====================================================================
   10. SYNTHÈSE ORALE FINALE (V2)
   ---------------------------------------------------------------------
   Agrège automatiquement le contenu rempli par l'élève en 8 parties
   utiles pour préparer l'oral du chef-d'œuvre.
   ===================================================================== */

const ORAL_PARTS = [
  {
    titre: "1. Présentation du projet",
    sources: [
      { sec: "accueil",     fields: ["titre_projet", "objectif", "comprendre"] },
      { sec: "identite",    fields: ["presentation", "titre_dossier"] },
    ],
  },
  {
    titre: "2. Ce que j'ai appris",
    sources: [
      { sec: "equilibre",  fields: ["appris", "retiens"] },
      { sec: "bilan",      fields: ["appris"] },
      { sec: "comprendre", fields: ["apprendre"] },
    ],
  },
  {
    titre: "3. Comment j'ai conçu mon menu",
    sources: [
      { sec: "mon_menu", fields: ["nom_menu", "description", "pourquoi_plats"] },
      { sec: "realisation", fields: ["etapes"] },
    ],
  },
  {
    titre: "4. En quoi mon menu est équilibré",
    sources: [
      { sec: "repas_equilibre", fields: ["equilibre_global", "justification"] },
      { sec: "mon_menu",        fields: ["equilibre"] },
    ],
  },
  {
    titre: "5. En quoi mon menu est éco-responsable",
    sources: [
      { sec: "eco_responsable", fields: ["saison", "circuits", "labels", "gaspillage", "packaging"] },
      { sec: "mon_menu",        fields: ["eco"] },
    ],
  },
  {
    titre: "6. Difficultés rencontrées",
    sources: [
      { sec: "realisation", fields: ["difficultes"] },
      { sec: "bilan",       fields: ["difficultes", "solutions"] },
    ],
  },
  {
    titre: "7. Améliorations",
    sources: [
      { sec: "degustation", fields: ["ameliorer", "modifs"] },
      { sec: "mon_menu",    fields: ["ameliorations"] },
      { sec: "bilan",       fields: ["autrement"] },
    ],
  },
  {
    titre: "8. Intérêt du projet pour ma formation",
    sources: [
      { sec: "bilan",      fields: ["interet", "interesse"] },
      { sec: "oral",       fields: ["arguments", "a_dire"] },
    ],
  },
];

function buildOralParts() {
  return ORAL_PARTS.map(part => {
    const lines = [];
    part.sources.forEach(src => {
      const sec = state.sections.find(s => s.id === src.sec);
      if (!sec) return;
      src.fields.forEach(fid => {
        const f = sec.champs.find(c => c.id === fid);
        if (!f) return;
        const v = typeof f.valeur === "string" ? f.valeur.trim() : "";
        if (v) lines.push({ label: f.label, valeur: v });
      });
    });
    return { titre: part.titre, lines };
  });
}

/** Pour la version concise : on extrait la première phrase ou max ~180 car. */
function conciseOf(text) {
  const t = String(text || "").trim().replace(/\s+/g, " ");
  if (!t) return "";
  const firstSentence = t.split(/(?<=[.!?])\s/)[0];
  const chosen = firstSentence.length > 10 ? firstSentence : t;
  return chosen.length > 180 ? chosen.slice(0, 177) + "…" : chosen;
}

function renderOralSummary() {
  const wrap = document.createElement("div");
  wrap.className = "oral-summary";

  // Barre retour
  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `<button type="button" class="btn btn-back">← Retour à l'accueil</button>`;
  back.querySelector("button").addEventListener("click", () => selectView("home"));
  wrap.appendChild(back);

  const e = state.infos_eleve;

  const controls = `
    <div class="oral-controls no-print">
      <div class="oral-mode-switch">
        <button class="btn ${oralMode === "concise" ? "btn-primary" : ""}" data-mode="concise" type="button">Version concise</button>
        <button class="btn ${oralMode === "detailed" ? "btn-primary" : ""}" data-mode="detailed" type="button">Version détaillée</button>
      </div>
      <div class="oral-actions">
        <button class="btn" id="btn-oral-copy" type="button">📋 Copier la synthèse</button>
        <button class="btn btn-primary" id="btn-oral-print" type="button">🖨️ Imprimer</button>
      </div>
    </div>
  `;

  wrap.innerHTML = `
    <h2>🎤 Synthèse orale finale — plan prêt à apprendre</h2>
    <p><b>${escapeHtml(e.prenom)} ${escapeHtml(e.nom)}</b> — ${escapeHtml(e.classe)} (${escapeHtml(e.annee_scolaire)})</p>
    <p class="hint">Cette synthèse est construite automatiquement à partir de vos réponses.
       Choisissez la <b>version concise</b> pour un aide-mémoire, ou la <b>version détaillée</b> pour tout revoir.</p>
    ${controls}
  `;

  const parts = buildOralParts();
  parts.forEach((part, i) => {
    const block = document.createElement("div");
    block.className = "oral-part plan-part";
    let inner = `<h3>${escapeHtml(part.titre)}</h3>`;
    if (part.lines.length === 0) {
      inner += `<p class="oral-empty">À compléter dans les sections correspondantes.</p>`;
    } else if (oralMode === "concise") {
      // Plan oral : une puce par idée clé, en phrases courtes
      inner += `<ul class="oral-bullets">`;
      part.lines.forEach(l => {
        const c = conciseOf(l.valeur);
        if (c) inner += `<li>${escapeHtml(c)}</li>`;
      });
      inner += `</ul>`;
    } else {
      // Version détaillée : libellé + texte complet
      part.lines.forEach(l => {
        inner += `<p><b>${escapeHtml(l.label)} :</b><br />${escapeHtml(l.valeur).replace(/\n/g, "<br>")}</p>`;
      });
    }
    block.innerHTML = inner;
    wrap.appendChild(block);
  });

  // Bascule de mode
  wrap.querySelectorAll("[data-mode]").forEach(b => {
    b.addEventListener("click", () => { oralMode = b.dataset.mode; renderMain(); });
  });
  wrap.querySelector("#btn-oral-print").addEventListener("click", printOralOnly);
  wrap.querySelector("#btn-oral-copy").addEventListener("click", () => copyOralText(parts));

  return wrap;
}

/** Copie la synthèse orale en texte brut dans le presse-papiers. */
function copyOralText(parts) {
  const e = state.infos_eleve;
  const lines = [];
  lines.push(`SYNTHÈSE ORALE — ${e.prenom || ""} ${e.nom || ""} (${e.classe || ""} / ${e.annee_scolaire || ""})`);
  lines.push("");
  parts.forEach(part => {
    lines.push(part.titre.toUpperCase());
    if (!part.lines.length) lines.push("  — à compléter");
    else if (oralMode === "concise") {
      part.lines.forEach(l => { const c = conciseOf(l.valeur); if (c) lines.push("  • " + c); });
    } else {
      part.lines.forEach(l => {
        lines.push("  " + l.label + " :");
        String(l.valeur).split("\n").forEach(ln => lines.push("    " + ln));
      });
    }
    lines.push("");
  });
  const text = lines.join("\n");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => alert("Synthèse copiée dans le presse-papiers ✅"),
      () => fallbackCopy(text)
    );
  } else fallbackCopy(text);
}
function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text; document.body.appendChild(ta);
  ta.select(); try { document.execCommand("copy"); alert("Synthèse copiée ✅"); }
  catch { alert("Copie impossible. Sélectionnez le texte manuellement."); }
  document.body.removeChild(ta);
}

/* =====================================================================
   11. TABLEAU RÉCAPITULATIF ENSEIGNANT (V2)
   ===================================================================== */

function renderTeacherRecap() {
  const wrap = document.createElement("div");
  wrap.className = "recap-table-wrap";

  const totals = computeTotals();
  wrap.innerHTML = `
    <h2>📋 Tableau récapitulatif</h2>
    <p>
      ${totals.done} terminées ·
      ${totals.validated} validées ·
      <span style="color:var(--c-danger)">${totals.to_review} à revoir</span> ·
      ${totals.in_progress} en cours ·
      ${totals.not_started} non commencées
    </p>
  `;

  /* Filtres */
  const filters = document.createElement("div");
  filters.className = "recap-filters";
  const defs = [
    ["all", "Toutes"],
    ["to_review", "À revoir"],
    ["not_started", "Non commencées"],
    ["in_progress", "En cours"],
    ["done", "Terminées"],
    ["validated", "Validées"],
  ];
  defs.forEach(([k, lbl]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn";
    if (recapFilter === k) b.classList.add("btn-primary");
    b.textContent = lbl;
    b.addEventListener("click", () => { recapFilter = k; renderMain(); });
    filters.appendChild(b);
  });
  wrap.appendChild(filters);

  /* Table */
  const table = document.createElement("table");
  table.className = "recap-table";
  table.innerHTML = `
    <thead><tr>
      <th>#</th><th>Section</th><th>Élève</th><th>Enseignant</th>
      <th>Note</th><th>Validation</th><th>Commentaire</th><th>Actions</th>
    </tr></thead>`;
  const tbody = document.createElement("tbody");
  state.sections.forEach((sec, idx) => {
    if (!matchesFilter(sec, recapFilter)) return;
    const tr = document.createElement("tr");
    if (sec.statut_enseignant === "to_review") tr.classList.add("row-review");
    else if (sec.statut_enseignant === "validated") tr.classList.add("row-validated");
    else if (sec.statut_eleve === "done") tr.classList.add("row-done");

    const pct = Math.round(computeCompleteness(sec) * 100);

    // # + titre + élève + remplissage (lecture seule)
    const tdN = document.createElement("td"); tdN.textContent = idx + 1;
    const tdT = document.createElement("td");
    tdT.innerHTML = `<b>${escapeHtml(sec.titre)}</b>
      <div class="fill-bar small"><div style="width:${pct}%"></div></div>
      <div class="hint">Rempli ${pct} %${isUnderfilled(sec) ? " · ⚠️ peu rempli" : ""}</div>`;
    const tdE = document.createElement("td"); tdE.textContent = STATUS_STUDENT[sec.statut_eleve];

    // Statut enseignant éditable
    const tdEn = document.createElement("td");
    const selEn = document.createElement("select");
    selEn.className = "status-select";
    for (const [k, v] of Object.entries(STATUS_TEACHER)) {
      const o = document.createElement("option");
      o.value = k; o.textContent = v;
      if (sec.statut_enseignant === k) o.selected = true;
      selEn.appendChild(o);
    }
    selEn.addEventListener("change", () => {
      sec.statut_enseignant = selEn.value;
      if (selEn.value === "validated" && !sec.date_validation) {
        sec.date_validation = new Date().toISOString().slice(0, 10);
      }
      scheduleAutoSave(); renderMain(); renderSidebar(); updateProgress();
    });
    tdEn.appendChild(selEn);

    // Note éditable
    const tdNote = document.createElement("td");
    const inpNote = document.createElement("input");
    inpNote.type = "text"; inpNote.value = sec.note || "";
    inpNote.style.width = "80px";
    inpNote.addEventListener("input", () => { sec.note = inpNote.value; scheduleAutoSave(); });
    tdNote.appendChild(inpNote);

    // Date validation éditable
    const tdDate = document.createElement("td");
    const inpDate = document.createElement("input");
    inpDate.type = "date"; inpDate.value = sec.date_validation || "";
    inpDate.addEventListener("input", () => { sec.date_validation = inpDate.value; scheduleAutoSave(); });
    tdDate.appendChild(inpDate);

    // Commentaire éditable
    const tdCom = document.createElement("td");
    const inpCom = document.createElement("textarea");
    inpCom.value = sec.commentaires_enseignant || "";
    inpCom.rows = 2; inpCom.style.width = "220px";
    inpCom.addEventListener("input", () => {
      sec.commentaires_enseignant = inpCom.value; scheduleAutoSave();
    });
    tdCom.appendChild(inpCom);

    // Actions
    const tdA = document.createElement("td");
    tdA.className = "actions";
    const btnOpen = document.createElement("button");
    btnOpen.className = "btn"; btnOpen.textContent = "Ouvrir";
    btnOpen.addEventListener("click", () => selectSection(sec.id));
    tdA.appendChild(btnOpen);

    tr.append(tdN, tdT, tdE, tdEn, tdNote, tdDate, tdCom, tdA);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);

  return wrap;
}

function matchesFilter(sec, f) {
  if (f === "all") return true;
  if (f === "to_review")  return sec.statut_enseignant === "to_review";
  if (f === "validated")  return sec.statut_enseignant === "validated";
  return sec.statut_eleve === f;
}

/* =====================================================================
   V4.3 — EXPORT WORD GÉNÉRIQUE D'UNE SECTION
   ---------------------------------------------------------------------
   Génère un document Word sérieux pour n'importe quelle section : titre,
   identité élève, valeurs des champs (textes, repeaters, photos), sans
   emojis dans l'imprimé.
   ===================================================================== */
function exportSectionWord(sec, schema) {
  syncIdentiteToInfos();
  const e = state.infos_eleve;
  const br = s => escapeHtml(s).replace(/\n/g, "<br>");
  const stripEmoji = s => String(s||"").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();

  let body = "";
  (schema.fields || []).forEach(fSchema => {
    const f = sec.champs.find(c => c.id === fSchema.id);
    if (!f) return;
    const v = f.valeur;
    if (v === undefined || v === null) return;
    const lbl = stripEmoji(fSchema.label);

    if (fSchema.type === "checklist") {
      if (Array.isArray(v) && v.length) {
        body += `<h3>${escapeHtml(lbl)}</h3><ul>${v.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
      }
    } else if (fSchema.type === "repeater") {
      if (Array.isArray(v) && v.length) {
        body += `<h3>${escapeHtml(lbl)}</h3>`;
        v.forEach((item, i) => {
          body += `<div class="repeater-block"><h4>${i+1}. ${escapeHtml(item[fSchema.item_title_field] || (fSchema.item_label || "Item"))}</h4>`;
          fSchema.fields.forEach(sf => {
            if (item[sf.id]) body += `<p><b>${escapeHtml(stripEmoji(sf.label))} :</b> ${br(item[sf.id])}</p>`;
          });
          body += `</div>`;
        });
      }
    } else if (fSchema.type === "checkbox") {
      body += `<p><b>${escapeHtml(lbl)} :</b> ${v ? "Oui" : "Non"}</p>`;
    } else if (fSchema.type === "photo_profil") {
      // déjà dans la fiche identité
    } else if (typeof v === "string" && v.trim()) {
      body += `<h3>${escapeHtml(lbl)}</h3><p>${br(v)}</p>`;
    }
  });

  // Photos de la section
  const photos = (sec.preuves || []).filter(p => p.type === "photo");
  if (photos.length) {
    body += `<h3>Photos</h3><div class="photos">`;
    photos.forEach(p => {
      body += `<figure><img src="${p.contenu}" alt="" />${p.commentaire ? `<figcaption>${escapeHtml(p.commentaire)}</figcaption>` : ""}</figure>`;
    });
    body += `</div>`;
  }

  const titreEtape = stripEmoji(sec.titre);
  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>${escapeHtml(titreEtape)}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 0.7cm; }
  body { font-family: "Calibri", Arial, sans-serif; color: #1a2330; font-size: 11pt; line-height: 1.55; }
  .head {
    border-bottom: 2pt solid #1f4f86; padding-bottom: 8pt; margin-bottom: 16pt;
  }
  .eyebrow { font-size: 9pt; letter-spacing: .14em; text-transform: uppercase; color: #6b7785; }
  h1 { color: #1f4f86; font-size: 22pt; margin: 4pt 0 2pt; }
  .author { color: #444; font-size: 11pt; }
  h3 { color: #1f4f86; font-size: 12pt; margin-top: 14pt; border-bottom: .5pt solid #d2dae3; padding-bottom: 2pt; }
  h4 { color: #2e8b57; font-size: 11pt; margin-bottom: 4pt; }
  ul { margin: 4pt 0 4pt 18pt; }
  .repeater-block { background: #fafbfc; border: 1pt solid #d2dae3; border-radius: 4pt; padding: 6pt 10pt; margin: 6pt 0; page-break-inside: avoid; }
  .photos { display: flex; flex-wrap: wrap; gap: 8pt; }
  .photos figure { margin: 0; max-width: 8cm; }
  .photos img { width: 100%; max-height: 6cm; object-fit: cover; border: 1pt solid #d2dae3; }
  .photos figcaption { font-size: 9pt; color: #6b7785; margin-top: 2pt; }
  .foot { margin-top: 24pt; padding-top: 8pt; border-top: 1pt solid #d2dae3; font-size: 9pt; color: #6b7785; display: flex; justify-content: space-between; }
</style></head>
<body>
  <div class="head">
    <div class="eyebrow">Chef-d'œuvre — ${escapeHtml(stripEmoji(sec.titre))}</div>
    <h1>${escapeHtml(titreEtape)}</h1>
    <div class="author">${escapeHtml(e.prenom||"")} ${escapeHtml(e.nom||"")}
      ${e.classe ? " · " + escapeHtml(e.classe) : ""}
      ${e.annee_scolaire ? " · " + escapeHtml(e.annee_scolaire) : ""}
    </div>
  </div>
  ${body || "<p><i>Aucune information saisie.</i></p>"}
  <div class="foot">
    <span>${escapeHtml(state.meta.projet_titre || "")}</span>
    <span>Édité le ${new Date().toLocaleDateString("fr-FR")}</span>
  </div>
</body></html>`;

  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const n = (e.nom || "eleve").replace(/\s+/g, "_");
  a.href = url;
  a.download = `${sec.id}_${n}_${new Date().toISOString().slice(0,10)}.doc`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

/* =====================================================================
   V4.2 — APERÇU ET EXPORT DE LA FICHE IDENTITÉ
   ---------------------------------------------------------------------
   - openFichePreview() : ouvre une modale avec l'aperçu de la fiche
     telle qu'elle sortira (sans emojis, design sérieux).
   - exportFicheIdentiteWord() : produit un .doc (HTML Word-compatible)
     mis en page comme une fiche d'identité scolaire propre.
   ===================================================================== */

// V4.5 : rafraîchit l'aperçu live de la fiche dans la section identité.
function refreshFicheLivePreview() {
  const node = document.getElementById("fiche-live-preview");
  if (node) node.innerHTML = buildFicheIdentiteHTML(false);
}

function buildFicheIdentiteHTML(forPrint) {
  const e = state.infos_eleve;
  const sec = state.sections.find(s => s.id === "identite");
  const get = id => sec.champs.find(c => c.id === id)?.valeur || "";
  const valeurs   = get("valeurs")   || [];
  const qualites  = get("qualites")  || [];
  const interets  = get("interets")  || [];
  const pourquoi  = get("pourquoi_cap");
  const apres     = get("projet_apres");
  const titre     = get("titre_dossier");
  const photo     = e.photo_profil;
  const list = arr => Array.isArray(arr) && arr.length
    ? arr.map(v => `<li>${escapeHtml(v)}</li>`).join("") : `<li class="empty">Non renseigné</li>`;

  // V4.5 : pour l'aperçu live (forPrint=false), on retourne juste le contenu, pas la doc complète
  if (!forPrint) {
    return `
<style>
  .fiche-live { font-family: "Calibri", "Helvetica Neue", Arial, sans-serif; color: #1a2330; }
  .fiche-live .band {
    background: linear-gradient(135deg, #1f4f86 0%, #2e8b57 100%);
    color: #fff; padding: 22px 26px; border-radius: 10px 10px 0 0;
  }
  .fiche-live .eyebrow { font-size: .7rem; letter-spacing: .14em; text-transform: uppercase; opacity: .85; }
  .fiche-live .name { font-size: 1.6rem; font-weight: 700; margin: 4px 0 2px; }
  .fiche-live .meta { font-size: .92rem; opacity: .92; }
  .fiche-live .projet { margin-top: 8px; font-size: .92rem; font-style: italic; background: rgba(255,255,255,.15); display: inline-block; padding: 4px 10px; border-radius: 4px; }
  .fiche-live .body { background: #fff; border: 1px solid var(--c-border); border-top: none; border-radius: 0 0 10px 10px; padding: 18px 22px; display: grid; grid-template-columns: 110px 1fr; gap: 18px; }
  .fiche-live .photo img, .fiche-live .photo-empty { width: 100px; height: 130px; object-fit: cover; border: 1.5px solid #1f4f86; border-radius: 4px; }
  .fiche-live .photo-empty { background: #f3f5f8; display: flex; align-items: center; justify-content: center; color: #8a99a8; font-size: .8rem; text-align: center; padding: 6px; }
  .fiche-live .blk { margin-bottom: 14px; }
  .fiche-live .blk h4 { color: #1f4f86; font-size: .82rem; text-transform: uppercase; letter-spacing: .08em; border-bottom: 1px solid #1f4f86; padding-bottom: 2px; margin: 0 0 5px; }
  .fiche-live .pills { display: flex; flex-wrap: wrap; gap: 4px; }
  .fiche-live .pill { background: #eef2f6; color: #1a2330; padding: 2px 10px; border-radius: 12px; font-size: .82rem; }
  .fiche-live .empty { color: #8a99a8; font-style: italic; font-size: .85rem; }
  .fiche-live p { margin: 0; font-size: .92rem; line-height: 1.5; }
</style>
<div class="fiche-live">
  <div class="band">
    <div class="eyebrow">Fiche de présentation — Chef-d'œuvre CAP</div>
    <div class="name">${escapeHtml(e.prenom||"Prénom")} ${escapeHtml(e.nom||"Nom")}</div>
    <div class="meta">
      ${escapeHtml(e.classe||"Classe")}
      ${e.lycee ? "&nbsp;&middot;&nbsp;" + escapeHtml(e.lycee) : ""}
      ${e.annee_scolaire ? "&nbsp;&middot;&nbsp;" + escapeHtml(e.annee_scolaire) : ""}
    </div>
    ${titre ? `<div class="projet">${escapeHtml(titre)}</div>` : ""}
  </div>
  <div class="body">
    <div class="photo">
      ${(state.preferences && state.preferences.avatar_compose)
        ? `<div class="fiche-svg-avatar">${buildAvatarSVG(state.preferences.avatar_compose, 110)}</div>`
        : photo
          ? `<img src="${photo}" alt="" />`
          : `<div class="photo-empty">Photo<br />ou avatar<br />facultatif</div>`}
    </div>
    <div>
      <div class="blk"><h4>Mes valeurs</h4><div class="pills">${
        valeurs.length ? valeurs.map(v => `<span class="pill">${escapeHtml(v)}</span>`).join("") : `<span class="empty">Non renseigné</span>`
      }</div></div>
      <div class="blk"><h4>Mes qualités au travail</h4><div class="pills">${
        qualites.length ? qualites.map(v => `<span class="pill">${escapeHtml(v)}</span>`).join("") : `<span class="empty">Non renseigné</span>`
      }</div></div>
      <div class="blk"><h4>Mes centres d'intérêt</h4><div class="pills">${
        interets.length ? interets.map(v => `<span class="pill">${escapeHtml(v)}</span>`).join("") : `<span class="empty">Non renseigné</span>`
      }</div></div>
      <div class="blk"><h4>Pourquoi j'ai choisi ce CAP</h4>
        <p class="${pourquoi ? "" : "empty"}">${pourquoi ? escapeHtml(pourquoi).replace(/\n/g,"<br>") : "Non renseigné"}</p>
      </div>
      <div class="blk"><h4>Ce que je veux faire après mon CAP</h4>
        <p class="${apres ? "" : "empty"}">${apres ? escapeHtml(apres).replace(/\n/g,"<br>") : "Non renseigné"}</p>
      </div>
    </div>
  </div>
</div>`;
  }

  return `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>Fiche de présentation — ${escapeHtml(e.prenom||"")} ${escapeHtml(e.nom||"")}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 0.7cm; }
  body { font-family: "Calibri", "Helvetica Neue", Arial, sans-serif; color: #1a2330; font-size: 11pt; line-height: 1.55; margin: 0; }
  .fiche-page { ${forPrint ? "" : "max-width: 720px; margin: 0 auto; background: #fff; padding: 40px;"} }
  .fiche-band {
    background: #1f4f86; color: #fff; padding: 18pt 24pt 22pt;
    border-radius: 4pt; margin-bottom: 20pt;
  }
  .fiche-eyebrow {
    font-size: 8.5pt; letter-spacing: .18em; text-transform: uppercase;
    opacity: .85; margin-bottom: 4pt;
  }
  .fiche-name { font-size: 26pt; font-weight: 700; line-height: 1.05; margin: 0; }
  .fiche-meta { margin-top: 6pt; font-size: 11pt; opacity: .95; }
  .fiche-projet { margin-top: 12pt; font-size: 12pt; font-style: italic; }

  .fiche-grid {
    display: grid; grid-template-columns: 110pt 1fr; gap: 18pt;
  }
  .fiche-photo-wrap {
    text-align: center;
  }
  .fiche-photo {
    width: 110pt; height: 140pt; object-fit: cover;
    border: 1.5pt solid #1f4f86; border-radius: 4pt;
  }
  .fiche-photo-empty {
    width: 110pt; height: 140pt; border: 1.5pt dashed #b0bdcb;
    display: flex; align-items: center; justify-content: center;
    color: #8a99a8; font-size: 9pt; text-align: center; padding: 8pt;
    border-radius: 4pt;
  }

  .fiche-block { margin-bottom: 16pt; }
  .fiche-block h2 {
    color: #1f4f86; font-size: 11pt;
    text-transform: uppercase; letter-spacing: .1em;
    border-bottom: 1.2pt solid #1f4f86;
    padding-bottom: 3pt; margin: 0 0 6pt;
  }
  .fiche-list {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-wrap: wrap; gap: 5pt;
  }
  .fiche-list li {
    background: #eef2f6; color: #1a2330;
    padding: 3pt 10pt; border-radius: 12pt;
    font-size: 10pt;
  }
  .fiche-list li.empty { background: transparent; color: #8a99a8; font-style: italic; padding-left: 0; }

  .fiche-text { margin: 0; padding: 8pt 0; font-size: 11pt; }
  .fiche-text.empty { color: #8a99a8; font-style: italic; }

  .fiche-foot {
    margin-top: 24pt; padding-top: 10pt;
    border-top: 1pt solid #d2dae3;
    font-size: 8.5pt; color: #6b7785;
    display: flex; justify-content: space-between;
  }
</style></head>
<body>
<div class="fiche-page">
  <div class="fiche-band">
    <div class="fiche-eyebrow">Fiche de présentation — Chef-d'œuvre CAP</div>
    <h1 class="fiche-name">${escapeHtml(e.prenom||"")} ${escapeHtml(e.nom||"")}</h1>
    <div class="fiche-meta">
      ${escapeHtml(e.classe||"")}
      ${e.annee_scolaire ? "&nbsp;&middot;&nbsp;" + escapeHtml(e.annee_scolaire) : ""}
    </div>
    ${titre ? `<div class="fiche-projet">${escapeHtml(titre)}</div>` : ""}
  </div>

  <div class="fiche-grid">
    <div class="fiche-photo-wrap">
      ${photo
        ? `<img class="fiche-photo" src="${photo}" alt="" />`
        : `<div class="fiche-photo-empty">Photo facultative</div>`}
    </div>
    <div>
      <div class="fiche-block">
        <h2>Mes valeurs</h2>
        <ul class="fiche-list">${list(valeurs)}</ul>
      </div>
      <div class="fiche-block">
        <h2>Mes qualités au travail</h2>
        <ul class="fiche-list">${list(qualites)}</ul>
      </div>
      <div class="fiche-block">
        <h2>Mes centres d'intérêt</h2>
        <ul class="fiche-list">${list(interets)}</ul>
      </div>
    </div>
  </div>

  <div class="fiche-block">
    <h2>Pourquoi j'ai choisi ce CAP</h2>
    <p class="fiche-text ${pourquoi ? "" : "empty"}">${pourquoi ? escapeHtml(pourquoi).replace(/\n/g,"<br>") : "Non renseigné"}</p>
  </div>
  <div class="fiche-block">
    <h2>Ce que je veux faire après mon CAP</h2>
    <p class="fiche-text ${apres ? "" : "empty"}">${apres ? escapeHtml(apres).replace(/\n/g,"<br>") : "Non renseigné"}</p>
  </div>

  <div class="fiche-foot">
    <span>Portfolio Chef-d'œuvre &mdash; ${escapeHtml(state.meta.projet_titre || "")}</span>
    <span>Édité le ${new Date().toLocaleDateString("fr-FR")}</span>
  </div>
</div>
</body>
</html>
  `;
}

function openFichePreview(autoPrint) {
  // V4.3 : on remplace window.open par une modale interne avec iframe srcdoc.
  // Plus fiable (pas bloqué par les bloqueurs de pop-up), responsive,
  // contrôlable. L'iframe contient le rendu A4 sérieux de la fiche.
  const html = buildFicheIdentiteHTML(true);

  // Nettoyer une éventuelle modale ouverte
  const old = document.getElementById("fiche-preview-modal");
  if (old) old.remove();

  const modal = document.createElement("div");
  modal.id = "fiche-preview-modal";
  modal.className = "preview-modal";
  modal.innerHTML = `
    <div class="preview-modal-bar">
      <span>Aperçu de ma fiche</span>
      <div>
        <button class="btn" id="preview-print">Imprimer / PDF</button>
        <button class="btn" id="preview-word">Télécharger en Word</button>
        <button class="btn btn-back" id="preview-close">Fermer</button>
      </div>
    </div>
    <iframe id="preview-frame"></iframe>
  `;
  document.body.appendChild(modal);
  const iframe = modal.querySelector("#preview-frame");
  iframe.srcdoc = html;

  modal.querySelector("#preview-close").addEventListener("click", () => modal.remove());
  modal.querySelector("#preview-word").addEventListener("click", exportFicheIdentiteWord);
  modal.querySelector("#preview-print").addEventListener("click", () => {
    try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch {}
  });

  if (autoPrint) {
    iframe.addEventListener("load", () => {
      try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch {}
    }, { once: true });
  }
}

function exportFicheIdentiteWord() {
  const html = buildFicheIdentiteHTML(false);
  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const e = state.infos_eleve;
  const n = (e.nom || "eleve").replace(/\s+/g, "_");
  a.href = url;
  a.download = `FichePresentation_${n}_${new Date().toISOString().slice(0,10)}.doc`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

/* =====================================================================
   V4 — DÉTECTION INTELLIGENTE DES GROUPES ALIMENTAIRES
   ---------------------------------------------------------------------
   À partir des ingrédients saisis, on cherche des mots-clés pour
   détecter la présence des 3 grands groupes : légumes, féculents,
   protéines. C'est volontairement simple et tolérant aux fautes.
   ===================================================================== */

const KEYWORDS_GROUPES = {
  legumes: ["salade","laitue","carotte","tomate","concombre","poivron","courgette","aubergine","brocoli","chou","épinard","poireau","oignon","ail","champignon","radis","betterave","navet","fenouil","artichaut","asperge","haricot vert","petit pois","légume","crudité","crudités","ratatouille","mâche","roquette","endive","céleri"],
  feculents: ["riz","pâte","pâtes","pasta","semoule","boulgour","quinoa","blé","pain","baguette","biscotte","pomme de terre","patate","frite","purée","polenta","couscous","tortilla","galette","crêpe","gnocchi","penne","spaghetti","fusilli"],
  proteines: ["poulet","dinde","bœuf","boeuf","veau","porc","jambon","saucisse","steak","escalope","poisson","saumon","thon","cabillaud","colin","sardine","crevette","fruits de mer","œuf","oeuf","tofu","seitan","lentille","pois chiche","haricot rouge","haricot blanc","fève","légumineuse","fromage","yaourt","mozzarella","jambon"],
};

function detectGroupes(textConcat) {
  const t = textConcat.toLowerCase();
  const found = { legumes: [], feculents: [], proteines: [] };
  for (const [grp, kws] of Object.entries(KEYWORDS_GROUPES)) {
    kws.forEach(k => {
      if (t.includes(k.toLowerCase()) && !found[grp].includes(k)) found[grp].push(k);
    });
  }
  return found;
}

/* =====================================================================
   V4 — VUE "MON PROJET" (dashboard agrégé)
   ---------------------------------------------------------------------
   Tableau de bord vivant qui synthétise l'état réel du projet de l'élève
   à un instant T. Chaque bloc est rempli si les sections correspondantes
   ont des données, sinon affiche un lien vers la section à compléter.
   ===================================================================== */

function fv(secId, fId) {  // helper court pour récupérer une valeur de champ
  const sec = state.sections.find(s => s.id === secId);
  if (!sec) return "";
  const f = sec.champs.find(c => c.id === fId);
  if (!f) return "";
  // V4.40 : si c'est un objet "composante_repas", on synthétise une chaîne
  // lisible pour préserver la compatibilité de tout le code aval (exports
  // Word, projection assiette, fiche menu, etc.).
  if (f.valeur && typeof f.valeur === "object" && !Array.isArray(f.valeur) && "ingredients" in f.valeur) {
    return composanteToString(f.valeur);
  }
  return f.valeur;
}
function composanteToString(c) {
  if (!c) return "";
  const ings = Array.isArray(c.ingredients) ? c.ingredients : [];
  const nom = (c.nom || "").trim();
  if (ings.length === 0) return nom;
  const list = ings.map(i => {
    const a = (i.aliment || "").trim();
    const q = (i.quantite || "").trim();
    return q ? `${a} (${q})` : a;
  }).filter(Boolean).join(", ");
  return nom ? `${nom} — ${list}` : list;
}
function fa(secId, fId) {  // helper pour un repeater (tableau)
  const v = fv(secId, fId);
  return Array.isArray(v) ? v : [];
}
// V4.48 : valeur brute (sans synthèse pour les composante_repas)
function fvRaw(secId, fId) {
  const sec = state.sections.find(s => s.id === secId);
  if (!sec) return null;
  const f = sec.champs.find(c => c.id === fId);
  return f ? f.valeur : null;
}

/* V4.51 — Helpers : couleur par groupe alimentaire + détection allergènes + scores */
const GROUPE_COULEURS = {
  "Légumes":          "#4a9d5e",
  "Fruits":           "#e8a13a",
  "Viandes":          "#c25a5a",
  "Poissons & fruits de mer": "#3a7ec0",
  "Produits laitiers":"#d4a464",
  "Œufs & préparations": "#e8c43a",
  "Charcuteries":     "#a86060",
  "Desserts":         "#c97a8c",
  "Boissons":         "#3a9bc0",
  "Sauces & herbes":  "#8a6a3a",
  "Féculents":        "#d8a23a",
  "Légumineuses":     "#9b6c3a",
  "Conserves & longue conservation": "#888",
  "Plats préparés":   "#5a8c5a",
  "Plats du monde":   "#5a8c5a",
  "Plats à emporter": "#5a8c5a",
  "Produits labellisés": "#9c8b3a",
};
function getGroupeColor(sousCat) {
  return GROUPE_COULEURS[sousCat] || "#888";
}

const ALLERGENES_TRIGGERS = [
  { all: "GLUTEN",         mots: ["pain","baguette","pates","pâtes","pate","biscuit","cookie","pizza","lasagne","tarte","quiche","semoule","blé","ble","boulgour","cannelloni","brioche","gateau","gâteau"] },
  { all: "LAIT",           mots: ["lait","yaourt","yaourth","fromage","beurre","creme","crème","camembert","comté","conté","emmental","gruyere","brie","mozarella","mozzarella","feta","parmesan","roquefort","mimolette","morbier","coulommier","ricotta","faisselle","petit-suisse","petit_suisse","petitsuisse","panna_cotta","tiramisu","glace","eclair","mousse","chevre","chèvre"] },
  { all: "ŒUF",            mots: ["oeuf","œuf","oeufs","œufs","mayonnaise","tortilla","frittata","quiche","brioche","meringue","tiramisu"] },
  { all: "FRUITS À COQUE", mots: ["noix","noisette","amande","cajou","pistache"] },
  { all: "POISSON",        mots: ["saumon","thon","sardine","cabillaud","merlu","aiglefin","morue","truite","maquereau","rouget","bar","lieu_noir","lieunoir","brandade"] },
  { all: "CRUSTACÉS",      mots: ["crevette","gamba","langoustine","homard","crabe","ecrevisse","langouste"] },
  { all: "MOLLUSQUES",     mots: ["moule","huitre","calmar","palourde","bulot","coquille_saint_jacques","coquillesaintjacques"] },
  { all: "SOJA",           mots: ["soja","tofu"] },
  { all: "MOUTARDE",       mots: ["moutarde"] },
  { all: "SÉSAME",         mots: ["sesame","sésame"] },
  { all: "CÉLERI",         mots: ["celeri","céleri"] },
];
function detectAllergenes(ingredients) {
  const found = new Set();
  const norm = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  ingredients.forEach(ing => {
    const txt = norm(ing.aliment) + " " + norm(ing.groupe || "");
    ALLERGENES_TRIGGERS.forEach(rule => {
      if (rule.mots.some(m => txt.includes(m))) found.add(rule.all);
    });
  });
  return [...found];
}

/* Score nutrition (0-10) basé sur la composition */
function calculScoreNutrition() {
  const composantes = ["entree","plat","laitage","dessert","boisson"];
  const allIngs = [];
  composantes.forEach(c => {
    const raw = fvRaw("repas_equilibre", c);
    if (raw && typeof raw === "object" && Array.isArray(raw.ingredients)) {
      raw.ingredients.forEach(i => allIngs.push(i));
    }
  });
  if (allIngs.length === 0) return { score: 0, total: 10, criteres: [] };
  const groupesPresents = new Set(allIngs.map(i => i.groupe));
  const has = subs => subs.some(s => groupesPresents.has(s));
  const criteres = [
    { label: "Présence de légumes",      ok: has(["Légumes"]) },
    { label: "Présence de fruits",       ok: has(["Fruits"]) },
    { label: "Présence de féculents",    ok: has(["Féculents","Plats préparés","Plats du monde","Plats à emporter"]) },
    { label: "Présence de protéines",    ok: has(["Viandes","Poissons & fruits de mer","Œufs & préparations","Légumineuses","Charcuteries"]) },
    { label: "Présence d'un laitage",    ok: has(["Produits laitiers"]) },
    { label: "Présence d'une boisson",   ok: has(["Boissons"]) },
    { label: "Repas varié (≥ 5 ingrédients)", ok: allIngs.length >= 5 },
    { label: "Pas trop de sucreries",    ok: allIngs.filter(i => i.groupe === "Desserts").length <= 2 },
  ];
  // Bonus argumentaire
  const argu = (fv("repas_equilibre","equilibre_global") || "") + " " + (fv("repas_equilibre","justification") || "");
  if (/½|moiti|legum/i.test(argu)) criteres.push({ label: "Justification ½ ¼ ¼ écrite", ok: true });
  else                              criteres.push({ label: "Justification ½ ¼ ¼ écrite", ok: false });
  const enReserve = 10 - criteres.length;
  for (let i = 0; i < enReserve; i++) criteres.push({ label: "—", ok: true });
  const score = criteres.filter(c => c.ok && c.label !== "—").length;
  return { score, total: criteres.filter(c => c.label !== "—").length, criteres: criteres.filter(c => c.label !== "—") };
}

/* Score éco (0-10) basé sur emballages + labels + saisonnalité */
function calculScoreEco() {
  const composantes = ["entree","plat","laitage","dessert","boisson"];
  const allIngs = [];
  composantes.forEach(c => {
    const raw = fvRaw("repas_equilibre", c);
    if (raw && typeof raw === "object" && Array.isArray(raw.ingredients)) {
      raw.ingredients.forEach(i => allIngs.push(i));
    }
  });
  // Plateau
  const embPlat = fvRaw("repas_equilibre","emballage_plat");
  const couverts = fvRaw("repas_equilibre","couverts_emporte");
  const verre = fvRaw("repas_equilibre","verre_emporte");
  const serviette = fvRaw("repas_equilibre","serviette_emporte");
  const accs = fvRaw("repas_equilibre","accessoires_emporte") || [];
  const allEmb = [embPlat, couverts, verre, serviette, ...(Array.isArray(accs) ? accs : [])].filter(x => x && x.fichier);

  const ecoBon = allEmb.filter(e => e.eco === "bon").length;
  const ecoMauvais = allEmb.filter(e => e.eco === "mauvais").length;

  const txtAll = (allIngs.map(i => i.aliment).join(" ") + " " +
                  fv("repas_equilibre","equilibre_global") + " " +
                  fv("repas_equilibre","justification") + " " +
                  fv("eco_responsable","gaspillage") + " " +
                  fv("eco_responsable","packaging")).toLowerCase();

  const criteres = [
    { label: "Au moins un emballage choisi",        ok: allEmb.length > 0 },
    { label: "Tous les emballages sont éco ✅",     ok: allEmb.length > 0 && ecoMauvais === 0 },
    { label: "Au moins 2 emballages bon choix",     ok: ecoBon >= 2 },
    { label: "Aucun plastique jetable / polystyrène", ok: ecoMauvais === 0 },
    { label: "Mention de produits labellisés (AB, AOP…)", ok: /\b(ab|bio|aop|aoc|igp|label rouge|hve)\b/i.test(txtAll) },
    { label: "Mention circuit court / local",       ok: /circuit court|local|march|amap|ferme|producteur/i.test(txtAll) },
    { label: "Mention saisonnalité",                ok: /saison|hiver|printemps|été|ete|automne/i.test(txtAll) },
    { label: "Lutte anti-gaspillage évoquée",       ok: /gaspi|reste|portion|epluchur/i.test(txtAll) },
    { label: "Au moins une légumineuse",            ok: allIngs.some(i => i.groupe === "Légumineuses") },
    { label: "Pas trop de viande (≤ 1)",            ok: allIngs.filter(i => i.groupe === "Viandes").length <= 1 },
  ];
  const score = criteres.filter(c => c.ok).length;
  return { score, total: criteres.length, criteres };
}

function projetEtatBloc(rempli, sectionId, label) {
  return rempli
    ? `<span class="bloc-etat ok">Renseigné</span>`
    : `<span class="bloc-etat ko">À compléter <a class="link-rempli" data-section="${sectionId}">→ ${escapeHtml(label)}</a></span>`;
}

function renderProjetView() {
  syncIdentiteToInfos();
  const e = state.infos_eleve;

  const wrap = document.createElement("div");
  wrap.className = "projet-view";

  // Barre retour
  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `<button type="button" class="btn btn-back">← Retour à l'accueil</button>`;
  back.querySelector("button").addEventListener("click", () => selectView("home"));
  wrap.appendChild(back);

  // ---- En-tête ----
  const nomMenu = fv("mon_menu", "nom_menu") || "Menu à nommer";
  const description = fv("mon_menu", "description") || "";
  const mainPhoto = findMainPhoto();

  // V4.5 : calcul du % de complétude global du projet
  const coreSecs = ["repas_equilibre","mon_menu","eco_responsable","etiquetage"];
  const coreCompletude = coreSecs.reduce((sum, id) => {
    const s = state.sections.find(x => x.id === id);
    return sum + (s ? computeCompleteness(s) : 0);
  }, 0) / coreSecs.length;
  const pct = Math.round(coreCompletude * 100);

  // V4.5 : donut SVG (camembert)
  const R = 50, C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;

  wrap.innerHTML = `
    <header class="projet-header-v2">
      <div class="ph-eyebrow">Mon chef-d'œuvre</div>
      <h1 class="ph-titre">${escapeHtml(nomMenu)}</h1>
      <div class="ph-author">
        ${escapeHtml(e.prenom || "")} ${escapeHtml(e.nom || "")}
        ${e.classe ? " · " + escapeHtml(e.classe) : ""}
        ${e.lycee ? " · " + escapeHtml(e.lycee) : ""}
        ${e.annee_scolaire ? " · " + escapeHtml(e.annee_scolaire) : ""}
      </div>

      <div class="ph-row">
        <div class="ph-photo">
          ${mainPhoto
            ? `<img src="${mainPhoto.contenu}" alt="" />`
            : `<div class="ph-photo-empty">Photo principale<br /><small>(à choisir dans une étape)</small></div>`}
        </div>

        <div class="ph-donut">
          <svg viewBox="0 0 120 120" width="140" height="140">
            <circle cx="60" cy="60" r="${R}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="14"/>
            <circle cx="60" cy="60" r="${R}" fill="none" stroke="#fff" stroke-width="14"
                    stroke-dasharray="${dash} ${C}" stroke-linecap="round"
                    transform="rotate(-90 60 60)" />
            <text x="60" y="64" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">${pct}%</text>
          </svg>
          <div class="ph-donut-label">d'avancement</div>
        </div>
      </div>

      ${description ? `<p class="ph-desc">${escapeHtml(description)}</p>` : ""}

      <div class="ph-actions">
        <button type="button" class="btn btn-ph-action" id="ph-go-dossier">🏆 Voir mon œuvre →</button>
        <button type="button" class="btn btn-ph-action ghost" id="ph-go-cours">📚 Mes cours</button>
      </div>
    </header>
  `;
  setTimeout(() => {
    const a = wrap.querySelector("#ph-go-dossier");
    if (a) a.addEventListener("click", () => selectView("dossier"));
    const b = wrap.querySelector("#ph-go-cours");
    if (b) b.addEventListener("click", () => selectView("parcours"));
  }, 0);

  // V4.80 — Hub des étapes de création (les sections "projet")
  const hub = document.createElement("section");
  hub.className = "projet-hub";
  hub.innerHTML = `
    <h3 class="projet-hub-titre">✏️ Les étapes pour concevoir mon projet</h3>
    <div class="projet-hub-grid">
      <button type="button" class="hub-card" data-target="repas_equilibre">
        <span class="hub-icon">🍽️</span>
        <span class="hub-label">Composer mon repas</span>
        <span class="hub-sub">Entrée, plat, dessert, boisson + ingrédients</span>
      </button>
      <button type="button" class="hub-card" data-target="creer-etiquettes">
        <span class="hub-icon">🏷️</span>
        <span class="hub-label">Créer mes étiquettes</span>
        <span class="hub-sub">Une étiquette par composante du menu</span>
      </button>
      <button type="button" class="hub-card" data-target="choisir-fournisseurs">
        <span class="hub-icon">🛒</span>
        <span class="hub-label">Choisir mes fournisseurs</span>
        <span class="hub-sub">Où j'achète, labels, prix, critères éco</span>
      </button>
      <button type="button" class="hub-card" data-target="mon_menu">
        <span class="hub-icon">📌</span>
        <span class="hub-label">Mon menu final</span>
        <span class="hub-sub">Synthèse + épreuve d'attestation</span>
      </button>
      <button type="button" class="hub-card" data-target="annexes">
        <span class="hub-icon">📁</span>
        <span class="hub-label">Mes photos</span>
        <span class="hub-sub">Pour illustrer mon projet</span>
      </button>
    </div>
  `;
  setTimeout(() => {
    hub.querySelectorAll(".hub-card").forEach(c => {
      c.addEventListener("click", () => navigateGoto(c.dataset.target));
    });
  }, 0);
  wrap.appendChild(hub);

  // ---- Grille des blocs ----
  const grid = document.createElement("div");
  grid.className = "projet-grid";

  // V4.51 — Bloc scores (jauges nutrition + éco)
  grid.appendChild(blocScores());
  // Bloc Composition
  grid.appendChild(blocComposition());
  // V4.48 — Bloc Plateau à emporter
  grid.appendChild(blocPlateau());
  // Bloc Équilibre
  grid.appendChild(blocEquilibre());
  // Bloc Éco-responsable
  grid.appendChild(blocEcoResponsable());
  // Bloc Étiquettes
  grid.appendChild(blocEtiquettes());
  // V4.76 — Bloc Sourcing global (où acheter tous les produits + stats éco)
  grid.appendChild(blocSourcingGlobal());
  // Bloc Emballage
  grid.appendChild(blocEmballage());
  // Bloc Coût (verrouillé)
  grid.appendChild(blocCout());

  wrap.appendChild(grid);

  // Actions
  const actions = document.createElement("div");
  actions.className = "projet-actions no-print";
  actions.innerHTML = `
    <button class="btn btn-accent btn-lg" id="btn-projet-word">📝 Exporter ma fiche projet en Word</button>
    <button class="btn"     id="btn-projet-print">🖨️ Imprimer cette fiche</button>
  `;
  actions.querySelector("#btn-projet-word").addEventListener("click", exportFicheProjetWord);
  actions.querySelector("#btn-projet-print").addEventListener("click", () => window.print());
  wrap.appendChild(actions);

  // Liens "→ section à compléter"
  // V4.77 — supporte aussi les vues custom via data-goto
  setTimeout(() => {
    wrap.querySelectorAll(".link-rempli").forEach(a => {
      a.addEventListener("click", e => {
        e.preventDefault();
        const target = a.dataset.goto || a.dataset.section;
        navigateGoto(target);
      });
    });
  }, 0);

  return wrap;
}

/* ---------- V4.54 : Suggestion d'aliment manquant à la banque ---------- */
function proposerSuggestionAliment(aliment, groupe) {
  // Initialise le tableau si besoin
  if (!Array.isArray(state.suggestions_aliments)) state.suggestions_aliments = [];
  // Évite les doublons
  const dejaEnregistre = state.suggestions_aliments.some(s =>
    (s.aliment || "").toLowerCase().trim() === aliment.toLowerCase().trim());
  if (dejaEnregistre) {
    showAppToast(`✅ "${aliment}" ajouté à ton menu (déjà dans tes suggestions).`);
    return;
  }
  // Modale de proposition
  const back = document.createElement("div");
  back.className = "img-info-backdrop";
  back.addEventListener("click", e => { if (e.target === back) back.remove(); });

  const card = document.createElement("div");
  card.className = "soumettre-card";
  card.style.borderTopColor = "#4a90d9";
  card.innerHTML = `
    <button type="button" class="img-info-close" title="Fermer">✕</button>
    <h2>💡 Ton aliment a bien été ajouté !</h2>
    <p>Tu as ajouté <b>"${escapeHtml(aliment)}"</b> à ton menu.</p>
    <p>Cet aliment ne fait pas encore partie de la banque d'images officielle. <b>Veux-tu suggérer à ton·ta enseignant·e d'ajouter une photo</b> pour cet aliment ? Ça aidera les autres élèves !</p>
    <div class="soumettre-actions">
      <button type="button" class="btn" id="sugg-no">Non merci</button>
      <button type="button" class="btn btn-primary" id="sugg-yes">💡 Oui, je suggère</button>
    </div>
  `;
  back.appendChild(card);
  document.body.appendChild(back);
  card.querySelector(".img-info-close").addEventListener("click", () => back.remove());
  card.querySelector("#sugg-no").addEventListener("click", () => back.remove());
  card.querySelector("#sugg-yes").addEventListener("click", () => {
    state.suggestions_aliments.push({
      aliment: aliment,
      groupe: groupe || "Autre",
      eleve: (state.infos_eleve && state.infos_eleve.prenom) || "",
      date: new Date().toISOString(),
    });
    scheduleAutoSave();
    back.remove();
    showAppToast(`✅ Suggestion envoyée à l'enseignant·e ! Merci.`);
  });
  const escH = (e) => { if (e.key === "Escape") { back.remove(); document.removeEventListener("keydown", escH); } };
  document.addEventListener("keydown", escH);
}

/* ---------- V4.52 : Modale "Je soumets mon menu" — récap + validation ---------- */
function openSoumettreMenu(sec) {
  // Ferme une éventuelle modale ouverte
  const old = document.getElementById("soumettre-menu-modal");
  if (old) old.remove();

  const sn = calculScoreNutrition();
  const se = calculScoreEco();
  const composantes = ["entree","plat","laitage","dessert","boisson"];
  const labels = { entree: "Entrée", plat: "Plat", laitage: "Laitage", dessert: "Dessert", boisson: "Boisson" };
  const filled = composantes.filter(c => {
    const r = fvRaw("repas_equilibre", c);
    return r && typeof r === "object" && (r.nom || (r.ingredients && r.ingredients.length));
  });
  const totalIng = composantes.reduce((s, c) => {
    const r = fvRaw("repas_equilibre", c);
    return s + (r && Array.isArray(r.ingredients) ? r.ingredients.length : 0);
  }, 0);

  // Vérifications minimales
  const checks = [
    { ok: filled.length >= 3,    label: `Au moins 3 composantes complétées (actuel : ${filled.length}/5)` },
    { ok: totalIng >= 5,         label: `Au moins 5 ingrédients au total (actuel : ${totalIng})` },
    { ok: !!fvRaw("repas_equilibre", "emballage_plat"), label: "Emballage du plat choisi" },
    { ok: !!(fv("repas_equilibre", "equilibre_global") || "").trim(), label: "Argumentaire d'équilibre rédigé" },
  ];
  const allOk = checks.every(c => c.ok);
  const verdict = allOk ? "Tu peux soumettre ton menu !" : "Encore quelques points à vérifier.";

  const back = document.createElement("div");
  back.id = "soumettre-menu-modal";
  back.className = "img-info-backdrop";
  back.addEventListener("click", e => { if (e.target === back) back.remove(); });

  const card = document.createElement("div");
  card.className = "soumettre-card";
  card.innerHTML = `
    <button type="button" class="img-info-close" title="Fermer">✕</button>
    <h2>📋 Récapitulatif de mon menu</h2>
    <p class="soumettre-intro">${escapeHtml(verdict)}</p>

    <div class="soumettre-scores">
      <div class="ss-pill" style="--c:#4a9d5e">🍎 Nutrition <b>${sn.score}/${sn.total}</b></div>
      <div class="ss-pill" style="--c:#3a7ec0">🌱 Éco <b>${se.score}/${se.total}</b></div>
      <div class="ss-pill" style="--c:#888">🍽️ ${totalIng} ingrédients</div>
    </div>

    <h3>📝 Composantes</h3>
    <ul class="soumettre-list">
      ${composantes.map(c => {
        const r = fvRaw("repas_equilibre", c);
        const has = r && typeof r === "object" && (r.nom || (r.ingredients && r.ingredients.length));
        if (has) {
          const nom = r.nom || "(sans nom)";
          const nbi = (r.ingredients || []).length;
          return `<li class="ok">✅ <b>${labels[c]}</b> — ${escapeHtml(nom)} <i>(${nbi} ingr.)</i></li>`;
        }
        return `<li class="ko">⬜ <b>${labels[c]}</b> — non rempli</li>`;
      }).join("")}
    </ul>

    <h3>📋 Vérifications</h3>
    <ul class="soumettre-list">
      ${checks.map(c => `<li class="${c.ok ? 'ok' : 'ko'}">${c.ok ? '✅' : '⚠️'} ${escapeHtml(c.label)}</li>`).join("")}
    </ul>

    <div class="soumettre-actions">
      <button type="button" class="btn" id="sm-cancel">Continuer à modifier</button>
      <button type="button" class="btn btn-primary" id="sm-submit" ${!allOk ? "" : ""}>
        ${sec.menu_soumis ? "🔄 Mettre à jour ma soumission" : "✅ Confirmer la soumission"}
      </button>
    </div>
    ${!allOk ? `<p class="soumettre-warn">⚠️ Tu peux soumettre quand même, mais essaye de compléter les points manquants pour un meilleur score.</p>` : ""}
  `;
  back.appendChild(card);
  document.body.appendChild(back);

  card.querySelector(".img-info-close").addEventListener("click", () => back.remove());
  card.querySelector("#sm-cancel").addEventListener("click", () => back.remove());
  card.querySelector("#sm-submit").addEventListener("click", () => {
    sec.menu_soumis = true;
    sec.menu_soumis_le = new Date().toISOString();
    sec.statut_eleve = "done";
    sec.date_maj = new Date().toISOString();
    scheduleAutoSave();
    back.remove();
    showAppToast("🎉 Bravo ! Ton menu est soumis. Ton·ta enseignant·e pourra le valider.");
    showConfetti(); // V4.63 : célébration !
    renderAll();
  });

  const escH = (e) => { if (e.key === "Escape") { back.remove(); document.removeEventListener("keydown", escH); } };
  document.addEventListener("keydown", escH);
}

/* ---------- V4.51 : Bloc SCORES (jauges nutrition + éco) ---------- */
function blocScores() {
  const block = document.createElement("section");
  block.className = "projet-bloc bloc-scores";
  const sn = calculScoreNutrition();
  const se = calculScoreEco();

  function jauge(titre, icon, color, score, total, criteres) {
    const pct = total > 0 ? Math.round(score / total * 100) : 0;
    const verdict = pct >= 80 ? "Excellent" : pct >= 60 ? "Bon" : pct >= 40 ? "Moyen" : "À améliorer";
    const manquants = criteres.filter(c => !c.ok);
    const hintHTML = (score < total && manquants.length)
      ? `<div class="score-hint">💡 <b>Pour passer à ${total}/${total}</b>, il te reste à valider : ${manquants.slice(0, 3).map(m => `<span class="score-todo">${escapeHtml(m.label)}</span>`).join(" • ")}${manquants.length > 3 ? ` <i>et ${manquants.length - 3} autre${manquants.length-3 > 1 ? "s" : ""}…</i>` : ""}</div>`
      : (score === total && total > 0 ? `<div class="score-hint score-perfect">🎉 <b>Score parfait, bravo !</b></div>` : "");
    return `
      <div class="score-card" style="--c:${color}">
        <div class="score-head">
          <span class="score-icon">${icon}</span>
          <span class="score-titre">${escapeHtml(titre)}</span>
          <span class="score-verdict">${verdict}</span>
        </div>
        <div class="score-bar-wrap">
          <div class="score-bar"><div class="score-fill" style="width:${pct}%"></div></div>
          <div class="score-num">${score} / ${total}</div>
        </div>
        ${hintHTML}
        <details class="score-details" open>
          <summary>Voir le détail</summary>
          <ul>
            ${criteres.map(c => `<li class="${c.ok ? 'ok' : 'ko'}">${c.ok ? '✅' : '⬜'} ${escapeHtml(c.label)}</li>`).join("")}
          </ul>
        </details>
      </div>
    `;
  }

  block.innerHTML = `
    <div class="bloc-head">
      <h3>📊 Mes scores en direct</h3>
      <span class="bloc-etat">Calculé automatiquement</span>
    </div>
    <div class="scores-grid">
      ${jauge("Score nutrition", "🍎", "#4a9d5e", sn.score, sn.total, sn.criteres)}
      ${jauge("Score éco-responsable", "🌱", "#3a7ec0", se.score, se.total, se.criteres)}
    </div>
  `;
  return block;
}

/* ---------- Bloc COMPOSITION (entrée / plat / dessert) — V4.48 visuel ---------- */
function blocComposition() {
  const block = document.createElement("section");
  block.className = "projet-bloc bloc-composition";
  const composantes = [
    { id: "entree",  lbl: "Entrée",       icon: "🥗" },
    { id: "plat",    lbl: "Plat principal", icon: "🍛" },
    { id: "laitage", lbl: "Laitage",      icon: "🧀" },
    { id: "dessert", lbl: "Dessert",      icon: "🍎" },
    { id: "boisson", lbl: "Boisson",      icon: "🥤" },
  ];
  // Pour chaque composante, lire la valeur brute (objet) et la valeur texte (synthétisée)
  const data = composantes.map(c => {
    const raw = fvRaw("repas_equilibre", c.id);
    const isObj = raw && typeof raw === "object" && !Array.isArray(raw) && "ingredients" in raw;
    return {
      ...c,
      raw,
      isObj,
      nom: isObj ? (raw.nom || "") : (typeof raw === "string" ? raw : ""),
      ingredients: isObj && Array.isArray(raw.ingredients) ? raw.ingredients : [],
      hasContent: isObj ? (raw.nom || (raw.ingredients && raw.ingredients.length > 0)) : !!raw,
    };
  });
  const rempli = data.some(d => d.hasContent);

  block.innerHTML = `
    <div class="bloc-head">
      <h3>🍽️ Composition de mon repas</h3>
      ${projetEtatBloc(rempli, "repas_equilibre", "Composer mon repas")}
    </div>
    <div class="proj-rangees"></div>
  `;
  const rangees = block.querySelector(".proj-rangees");

  data.forEach(d => {
    const row = document.createElement("div");
    row.className = "proj-rangee";
    if (!d.hasContent) row.classList.add("vide");

    // V4.51 : allergènes auto-détectés par composante
    const allergenes = detectAllergenes(d.ingredients);
    const alleHTML = allergenes.length
      ? `<span class="prh-aller" title="Allergènes détectés"> ⚠️ ${allergenes.map(a => `<b>${escapeHtml(a)}</b>`).join(", ")}</span>`
      : "";

    // V4.54 : en-tête de rangée — gros titre centré encadré
    const header = `
      <div class="proj-rangee-head-v2">
        <div class="prh-banner">
          <span class="prh-icon-big">${d.icon}</span>
          <span class="prh-label-big">${escapeHtml(d.lbl.toUpperCase())}</span>
        </div>
        <div class="prh-meta">
          ${d.nom ? `<span class="prh-nom">${escapeHtml(d.nom)}</span>` : `<span class="prh-nom prh-nom-empty">— Pas encore nommé —</span>`}
          <span class="prh-count">${d.ingredients.length} ingrédient${d.ingredients.length > 1 ? "s" : ""}</span>
          ${alleHTML}
        </div>
      </div>
    `;

    // Corps : photos des ingrédients
    let body;
    if (d.ingredients.length > 0) {
      body = `<div class="proj-ing-grid">
        ${d.ingredients.map(ing => {
          // V4.50 : auto-match photo si pas définie (legacy data)
          const photoSrc = ing.photo || findPhotoForExoItem(ing.aliment);
          const photo = photoSrc
            ? `<img src="${encodeURI(photoSrc)}" alt="${escapeHtml(ing.aliment)}" loading="lazy" />`
            : `<div class="proj-ing-noimg" data-letter="${escapeHtml((ing.aliment || "?").trim().charAt(0).toUpperCase())}"></div>`;
          // V4.51 : couleur de bordure selon le groupe alimentaire
          const groupeColor = getGroupeColor(ing.groupe);
          return `
            <div class="proj-ing-tile" style="border-color:${groupeColor}; box-shadow: inset 0 -3px 0 ${groupeColor}33;" title="${escapeHtml(ing.aliment + (ing.quantite ? ` — ${ing.quantite}` : "") + (ing.groupe ? ` · ${ing.groupe}` : ""))}">
              ${photo}
              <div class="proj-ing-cap">
                <div class="proj-ing-nom">${escapeHtml(ing.aliment || "")}</div>
                ${ing.quantite ? `<div class="proj-ing-qte">${escapeHtml(ing.quantite)}</div>` : ""}
                ${ing.groupe ? `<div class="proj-ing-groupe-tag" style="background:${groupeColor}">${escapeHtml(ing.groupe)}</div>` : ""}
              </div>
            </div>
          `;
        }).join("")}
      </div>`;
    } else if (typeof d.raw === "string" && d.raw) {
      // Ancien format texte
      body = `<div class="proj-rangee-text">${escapeHtml(d.raw)}</div>`;
    } else {
      body = `<div class="proj-rangee-empty">— rien pour le moment <a class="link-rempli" data-section="repas_equilibre">→ ajouter</a></div>`;
    }
    // V4.76 — Étiquette liée à la composante (aperçu)
    const etiquette = findEtiquetteForComposante(d.id);
    const etHtml = renderEtiquetteCardForProjet(etiquette, COMPOSANTE_LABEL_MAP[d.id], d.id);

    // V4.76 — Fournisseurs liés à la composante
    const fournLies = findFournisseursForComposante(d.id);
    const fournHtml = renderFournisseursForProjet(fournLies, d.id);

    row.innerHTML = header + body + etHtml + fournHtml;
    rangees.appendChild(row);
  });

  // Délégation : clic sur les boutons d'aperçu dans cette zone redirige
  // V4.77+78 — supporte les vues custom + scroll auto vers la composante
  rangees.addEventListener("click", (e) => {
    const a = e.target.closest("[data-goto]");
    if (a) navigateGoto(a.dataset.goto, { compo: a.dataset.compo });
  });
  return block;
}

/* V4.76 — Cherche les fournisseurs liés à une composante (par label). */
function findFournisseursForComposante(composanteKey) {
  const cible = COMPOSANTE_LABEL_MAP[composanteKey];
  if (!cible) return [];
  const fourn = fa("eco_responsable", "fournisseurs");
  return fourn.filter(f => f.composante_liee === cible);
}

/* V4.76 — Carte étiquette dans la vue Mon projet (sous une composante). */
function renderEtiquetteCardForProjet(et, labelCible, compoKey) {
  const compoAttr = compoKey ? ` data-compo="${escapeHtml(compoKey)}"` : "";
  if (!et) {
    return `
      <div class="proj-etiq-line proj-etiq-empty">
        <span>🏷️</span>
        <span>Pas encore d'étiquette pour cette composante.</span>
        <button type="button" class="btn btn-sm btn-primary" data-goto="creer-etiquettes"${compoAttr}>Créer maintenant →</button>
      </div>`;
  }
  const dateMention = et.type_date && et.date
    ? `${et.type_date.includes("DLC") ? "DLC" : "DDM"} : ${escapeHtml(et.date)}`
    : "";
  return `
    <div class="proj-etiq-card">
      <div class="proj-etiq-card-head">
        <span class="proj-etiq-tag">🏷️ Étiquette</span>
        <b>${escapeHtml(et.nom_produit || "(sans nom)")}</b>
        ${et.slogan ? `<i>« ${escapeHtml(et.slogan)} »</i>` : ""}
        <button type="button" class="btn btn-xs" data-goto="creer-etiquettes"${compoAttr}>Modifier</button>
      </div>
      <dl class="proj-etiq-defs">
        ${et.ingredients ? `<dt>Ingrédients</dt><dd>${escapeHtml(et.ingredients)}</dd>` : ""}
        ${et.allergenes  ? `<dt>Allergènes</dt><dd class="alerte">⚠️ ${escapeHtml(et.allergenes)}</dd>` : ""}
        ${dateMention   ? `<dt>${dateMention.split(" :")[0]}</dt><dd>${dateMention.split(" : ").slice(1).join(" : ")}</dd>` : ""}
        ${et.poids       ? `<dt>Quantité</dt><dd>${escapeHtml(et.poids)}</dd>` : ""}
        ${et.tracabilite ? `<dt>Traçabilité</dt><dd>${escapeHtml(et.tracabilite)}</dd>` : ""}
        ${et.conservation? `<dt>Conservation</dt><dd>${escapeHtml(et.conservation)}</dd>` : ""}
      </dl>
    </div>`;
}

/* V4.76 — Bloc « où acheter » dans la vue Mon projet (sous une composante). */
function renderFournisseursForProjet(fournisseurs, compoKey) {
  const compoAttr = compoKey ? ` data-compo="${escapeHtml(compoKey)}"` : "";
  if (!fournisseurs.length) {
    return `
      <div class="proj-sourcing-line proj-sourcing-empty">
        <span>🛒</span>
        <span>Aucun fournisseur indiqué pour cette composante.</span>
        <button type="button" class="btn btn-sm btn-primary" data-goto="choisir-fournisseurs"${compoAttr}>Ajouter un fournisseur →</button>
      </div>`;
  }
  const rows = fournisseurs.map(f => {
    const labels = Array.isArray(f.labels) && f.labels.length ? f.labels : [];
    const criteres = Array.isArray(f.criteres_eco) && f.criteres_eco.length ? f.criteres_eco : [];
    const labelsHtml = labels.length
      ? `<span class="proj-srcs-pills">${labels.map(l => `<span class="pill ok">${escapeHtml(l.split(" (")[0])}</span>`).join("")}</span>`
      : (f.label ? `<span class="pill warn">${escapeHtml(f.label)}</span>` : "");
    const critHtml = criteres.length
      ? `<span class="proj-srcs-pills">${criteres.map(c => `<span class="pill ok">✅ ${escapeHtml(c)}</span>`).join("")}</span>`
      : "";
    return `
      <div class="proj-srcs-row">
        <div class="proj-srcs-prod"><b>${escapeHtml(f.produit || "—")}</b></div>
        <div class="proj-srcs-where">
          ${f.type_commerce && f.type_commerce !== "—" ? `<span class="srcs-type">${escapeHtml(f.type_commerce)}</span>` : ""}
          ${f.lieu ? `<span class="srcs-lieu">${escapeHtml(f.lieu)}</span>` : ""}
          ${f.prix_unitaire ? `<span class="srcs-prix">💶 ${escapeHtml(f.prix_unitaire)}</span>` : ""}
        </div>
        <div class="proj-srcs-meta">${labelsHtml}${critHtml}</div>
      </div>`;
  }).join("");
  return `
    <div class="proj-sourcing-card">
      <div class="proj-sourcing-head">
        <span class="proj-srcs-tag">🛒 Où j'achète</span>
        <button type="button" class="btn btn-xs" data-goto="choisir-fournisseurs"${compoAttr}>Modifier</button>
      </div>
      <div class="proj-srcs-list">${rows}</div>
    </div>`;
}

/* ---------- V4.48 : Bloc PLATEAU À EMPORTER (emballage / couverts / accessoires) ---------- */
function blocPlateau() {
  const block = document.createElement("section");
  block.className = "projet-bloc bloc-plateau";
  const items = [
    { id: "emballage_plat",      lbl: "Emballage du plat", icon: "📦" },
    { id: "couverts_emporte",    lbl: "Couverts",          icon: "🍴" },
    { id: "verre_emporte",       lbl: "Verre / Gobelet",   icon: "🥃" },
    { id: "serviette_emporte",   lbl: "Serviette",         icon: "🧻" },
  ];
  const accs = fvRaw("repas_equilibre", "accessoires_emporte");
  const accsArr = Array.isArray(accs) ? accs : [];

  const singles = items.map(it => ({ ...it, val: fvRaw("repas_equilibre", it.id) }));
  const rempli = singles.some(s => s.val && s.val.fichier) || accsArr.length > 0;

  // Synthèse éco-score globale
  let ecoBon = 0, ecoMoyen = 0, ecoMauvais = 0;
  const allEco = [...singles.map(s => s.val).filter(Boolean), ...accsArr];
  allEco.forEach(v => {
    if (v.eco === "bon") ecoBon++;
    else if (v.eco === "moyen") ecoMoyen++;
    else if (v.eco === "mauvais") ecoMauvais++;
  });

  let ecoSummary = "";
  if (allEco.length > 0) {
    if (ecoMauvais === 0 && ecoMoyen === 0) {
      ecoSummary = `<div class="plateau-eco ok">✅ Plateau 100 % éco-responsable !</div>`;
    } else if (ecoMauvais > 0) {
      ecoSummary = `<div class="plateau-eco ko">⚠️ ${ecoMauvais} élément${ecoMauvais > 1 ? "s" : ""} à éviter — pense à les remplacer.</div>`;
    } else {
      ecoSummary = `<div class="plateau-eco moyen">🟡 ${ecoMoyen} élément${ecoMoyen > 1 ? "s" : ""} à limiter.</div>`;
    }
  }

  block.innerHTML = `
    <div class="bloc-head">
      <h3>🎁 Mon plateau à emporter</h3>
      ${projetEtatBloc(rempli, "repas_equilibre", "Composer mon repas")}
    </div>
    ${ecoSummary}
    <div class="plateau-grid"></div>
  `;
  const grid = block.querySelector(".plateau-grid");

  singles.forEach(s => {
    const cell = document.createElement("div");
    cell.className = "plateau-cell";
    if (!s.val || !s.val.fichier) cell.classList.add("vide");
    if (s.val && s.val.fichier) {
      const ecoBadge = s.val.eco === "bon" ? `<span class="pl-eco bon">✅</span>` :
                       s.val.eco === "moyen" ? `<span class="pl-eco moyen">🟡</span>` :
                       s.val.eco === "mauvais" ? `<span class="pl-eco mauvais">❌</span>` : "";
      cell.innerHTML = `
        <div class="plateau-cell-head"><span class="plc-icon">${s.icon}</span><span class="plc-label">${escapeHtml(s.lbl)}</span></div>
        <div class="plateau-cell-photo">
          <img src="${encodeURI(s.val.fichier)}" alt="${escapeHtml(s.val.nom)}" loading="lazy" />
          ${ecoBadge}
        </div>
        <div class="plateau-cell-nom">${escapeHtml(s.val.nom)}</div>
      `;
    } else {
      cell.innerHTML = `
        <div class="plateau-cell-head"><span class="plc-icon">${s.icon}</span><span class="plc-label">${escapeHtml(s.lbl)}</span></div>
        <div class="plateau-cell-empty">— pas encore choisi <a class="link-rempli" data-section="repas_equilibre">→ ajouter</a></div>
      `;
    }
    grid.appendChild(cell);
  });

  // Petits accessoires (multi)
  if (accsArr.length > 0) {
    const accsCell = document.createElement("div");
    accsCell.className = "plateau-cell plateau-cell-multi";
    accsCell.innerHTML = `
      <div class="plateau-cell-head"><span class="plc-icon">🧂</span><span class="plc-label">Petits accessoires (${accsArr.length})</span></div>
      <div class="plateau-multi-grid">
        ${accsArr.map(a => {
          const eco = a.eco === "bon" ? `<span class="pl-eco bon mini">✅</span>` :
                      a.eco === "moyen" ? `<span class="pl-eco moyen mini">🟡</span>` :
                      a.eco === "mauvais" ? `<span class="pl-eco mauvais mini">❌</span>` : "";
          return `<div class="plateau-mini" title="${escapeHtml(a.nom)}"><img src="${encodeURI(a.fichier)}" alt="${escapeHtml(a.nom)}" loading="lazy" />${eco}</div>`;
        }).join("")}
      </div>
    `;
    grid.appendChild(accsCell);
  }
  return block;
}

/* ---------- Bloc ÉQUILIBRE (détection automatique des 3 groupes) ---------- */
function blocEquilibre() {
  const block = document.createElement("section");
  block.className = "projet-bloc bloc-equilibre";

  // On agrège tous les textes de la composition pour détecter les groupes
  const texte = [
    fv("repas_equilibre","entree"), fv("repas_equilibre","plat"),
    fv("repas_equilibre","laitage"), fv("repas_equilibre","dessert"),
    fv("mon_menu","description"), fv("mon_menu","pourquoi_plats"),
  ].filter(Boolean).join(" ");

  const found = detectGroupes(texte);
  const groupes = [
    { id: "legumes",   label: "½ Légumes",   color: "#d5ecdd", barColor: "var(--c-accent)" },
    { id: "feculents", label: "¼ Féculents", color: "#fff0cc", barColor: "var(--c-warning)" },
    { id: "proteines", label: "¼ Protéines", color: "#fadbdf", barColor: "var(--c-danger)" },
  ];
  const allFound = groupes.every(g => found[g.id].length > 0);
  const equilibreText = fv("mon_menu","equilibre") || fv("repas_equilibre","equilibre_global") || fv("repas_equilibre","justification");

  block.innerHTML = `
    <div class="bloc-head">
      <h3>⚖️ Mon menu est-il équilibré ?</h3>
      ${allFound
        ? `<span class="bloc-etat ok">Les 3 groupes sont présents</span>`
        : `<span class="bloc-etat ko">Il manque un ou plusieurs groupes</span>`}
    </div>
    <div class="assiette-check">
      ${groupes.map(g => `
        <div class="assiette-part" style="background:${g.color};">
          <div class="assiette-part-label">${g.label}</div>
          ${found[g.id].length
            ? `<div class="assiette-part-found">${found[g.id].slice(0, 4).map(escapeHtml).join(", ")}${found[g.id].length > 4 ? "…" : ""}</div>`
            : `<div class="assiette-part-missing">⚠ Non détecté <a class="link-rempli" data-section="repas_equilibre">→ ajouter</a></div>`}
        </div>
      `).join("")}
    </div>
    ${equilibreText
      ? `<div class="bloc-text"><b>Mon argumentaire :</b> ${escapeHtml(equilibreText)}</div>`
      : `<div class="bloc-text empty">Pas encore d'argumentaire. <a class="link-rempli" data-section="mon_menu">→ Aller à "Choix de mon menu"</a> pour expliquer pourquoi ton menu est équilibré.</div>`}
  `;
  return block;
}

/* ---------- Bloc ÉCO-RESPONSABLE (saison / circuit / labels / fournisseurs) ---------- */
function blocEcoResponsable() {
  const block = document.createElement("section");
  block.className = "projet-bloc bloc-eco";

  const fournisseurs = fa("eco_responsable", "fournisseurs");
  const argEco       = fv("mon_menu", "eco");
  const gaspillage   = fv("eco_responsable", "gaspillage");

  // Compteurs
  const nbSaison = fournisseurs.filter(f => f.saison === "Oui").length;
  const nbCircuit = fournisseurs.filter(f => f.circuit && f.circuit.startsWith("Oui")).length;
  const nbLabel = fournisseurs.filter(f => (f.label || "").trim()).length;

  block.innerHTML = `
    <div class="bloc-head">
      <h3>🌱 Mon menu est-il éco-responsable ?</h3>
      ${fournisseurs.length
        ? `<span class="bloc-etat ${argEco ? "ok" : "warn"}">${fournisseurs.length} produit(s) renseigné(s)</span>`
        : `<span class="bloc-etat ko">À compléter <a class="link-rempli" data-section="eco_responsable">→ Mon menu éco-responsable</a></span>`}
    </div>
    ${fournisseurs.length ? `
      <div class="eco-stats">
        <div class="eco-stat"><b>${nbSaison}</b><span>de saison</span></div>
        <div class="eco-stat"><b>${nbCircuit}</b><span>en circuit court</span></div>
        <div class="eco-stat"><b>${nbLabel}</b><span>avec un label</span></div>
      </div>
      <table class="eco-table">
        <thead><tr><th>Produit</th><th>Lieu d'achat</th><th>Saison</th><th>Circuit</th><th>Label</th></tr></thead>
        <tbody>
          ${fournisseurs.map(f => `
            <tr>
              <td><b>${escapeHtml(f.produit || "—")}</b></td>
              <td>${escapeHtml(f.lieu || "—")}</td>
              <td>${pillSaison(f.saison)}</td>
              <td>${pillCircuit(f.circuit)}</td>
              <td>${escapeHtml(f.label || "—")}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    ` : ""}
    ${argEco
      ? `<div class="bloc-text"><b>Mon argumentaire éco :</b> ${escapeHtml(argEco)}</div>`
      : `<div class="bloc-text empty">Pas encore d'argumentaire éco. <a class="link-rempli" data-section="mon_menu">→ Aller à "Choix de mon menu"</a></div>`}
    ${gaspillage ? `<div class="bloc-text"><b>Anti-gaspi :</b> ${escapeHtml(gaspillage)}</div>` : ""}
  `;
  return block;
}
function pillSaison(v) {
  if (v === "Oui") return `<span class="pill ok">Oui</span>`;
  if (v === "Non") return `<span class="pill ko">Non</span>`;
  return `<span class="pill warn">${escapeHtml(v || "—")}</span>`;
}
function pillCircuit(v) {
  if (!v) return `<span class="pill warn">—</span>`;
  if (v.startsWith("Oui")) return `<span class="pill ok">Oui</span>`;
  if (v === "Non") return `<span class="pill ko">Non</span>`;
  return `<span class="pill warn">À vérifier</span>`;
}

/* ---------- V4.76 — Bloc SOURCING GLOBAL ----------
   Récapitule où l'élève va acheter tous ses produits, regroupés par type
   de commerce, avec les statistiques éco-responsables (% bio, saison, etc.) */
function blocSourcingGlobal() {
  const block = document.createElement("section");
  block.className = "projet-bloc bloc-sourcing";
  const fournisseurs = fa("eco_responsable", "fournisseurs");

  if (!fournisseurs.length) {
    block.innerHTML = `
      <div class="bloc-head">
        <h3>🛒 Où j'achète mes produits</h3>
        <span class="bloc-etat ko">À compléter <a class="link-rempli" data-section="eco_responsable">→ Mes produits et fournisseurs</a></span>
      </div>
      <div class="bloc-text empty">Pour chaque ingrédient de mon menu, je dois indiquer où je vais l'acheter (marché, AMAP, ferme, magasin bio…), à quel prix, et quels critères éco-responsables il respecte (Bio, Label Rouge, AOP, circuit court…).</div>`;
    return block;
  }

  // Stats globales
  const total = fournisseurs.length;
  const compteCriteres = (cri) => fournisseurs.filter(f => Array.isArray(f.criteres_eco) && f.criteres_eco.includes(cri)).length;
  const compteLabel = (lab) => fournisseurs.filter(f => Array.isArray(f.labels) && f.labels.some(l => l.startsWith(lab))).length;
  const nbBio = compteCriteres("Bio");
  const nbSaison = compteCriteres("De saison") || fournisseurs.filter(f => f.saison === "Oui").length;
  const nbCircuit = compteCriteres("Circuit court (≤ 1 intermédiaire)") || fournisseurs.filter(f => f.circuit && f.circuit.startsWith("Oui")).length;
  const nbLocal = compteCriteres("Local (région)");
  const nbAB = compteLabel("AB");
  const nbLR = compteLabel("Label Rouge");
  const nbAOP = compteLabel("AOP");

  // Regroupement par type de commerce
  const parCommerce = {};
  fournisseurs.forEach(f => {
    const k = f.type_commerce && f.type_commerce !== "—" ? f.type_commerce : "Non précisé";
    if (!parCommerce[k]) parCommerce[k] = [];
    parCommerce[k].push(f);
  });

  // Calcul du budget total (extrait des prix saisis sous forme de texte)
  const budgetTotal = fournisseurs.reduce((s, f) => {
    const m = String(f.prix_unitaire || "").match(/(\d+[.,]?\d*)/);
    return s + (m ? parseFloat(m[1].replace(",", ".")) : 0);
  }, 0);

  const pct = (n) => total > 0 ? Math.round((n / total) * 100) : 0;

  block.innerHTML = `
    <div class="bloc-head">
      <h3>🛒 Où j'achète mes produits</h3>
      <span class="bloc-etat ok">${total} produit${total > 1 ? "s" : ""}</span>
    </div>

    <div class="srcs-stats">
      <div class="srcs-stat"><b>${nbBio}</b><span>Bio</span><small>${pct(nbBio)}%</small></div>
      <div class="srcs-stat"><b>${nbSaison}</b><span>De saison</span><small>${pct(nbSaison)}%</small></div>
      <div class="srcs-stat"><b>${nbCircuit}</b><span>Circuit court</span><small>${pct(nbCircuit)}%</small></div>
      <div class="srcs-stat"><b>${nbLocal}</b><span>Local</span><small>${pct(nbLocal)}%</small></div>
      <div class="srcs-stat-labels">
        <div class="srcs-lbl-line">${nbAB ? `<span class="pill ok">${nbAB}× AB</span>` : ""} ${nbLR ? `<span class="pill ok">${nbLR}× Label Rouge</span>` : ""} ${nbAOP ? `<span class="pill ok">${nbAOP}× AOP</span>` : ""}</div>
      </div>
      ${budgetTotal > 0 ? `<div class="srcs-stat srcs-budget"><b>${budgetTotal.toFixed(2)} €</b><span>Budget estimé</span></div>` : ""}
    </div>

    <div class="srcs-by-shop">
      ${Object.entries(parCommerce).map(([commerce, prods]) => `
        <div class="srcs-shop-group">
          <h4>${escapeHtml(commerce)} <span class="srcs-shop-count">${prods.length}</span></h4>
          <ul>${prods.map(f => `
            <li>
              <b>${escapeHtml(f.produit || "—")}</b>
              ${f.lieu ? ` · <span class="srcs-mini-lieu">${escapeHtml(f.lieu)}</span>` : ""}
              ${f.prix_unitaire ? ` · <span class="srcs-mini-prix">${escapeHtml(f.prix_unitaire)}</span>` : ""}
              ${(Array.isArray(f.labels) && f.labels.length) ? ` · ${f.labels.map(l => `<span class="pill ok mini">${escapeHtml(l.split(" (")[0])}</span>`).join(" ")}` : ""}
            </li>`).join("")}</ul>
        </div>`).join("")}
    </div>

    <div class="srcs-actions">
      <a class="link-rempli" data-goto="choisir-fournisseurs">→ Modifier mes fournisseurs</a>
    </div>
  `;
  // Délégation pour les liens de cette zone
  setTimeout(() => {
    block.querySelectorAll("[data-goto]").forEach(a => {
      a.addEventListener("click", (e) => { e.preventDefault(); navigateGoto(a.dataset.goto); });
    });
  }, 0);
  return block;
}

/* ---------- Bloc ÉTIQUETTES (multiple par produit) ---------- */
function blocEtiquettes() {
  const block = document.createElement("section");
  block.className = "projet-bloc bloc-etiquettes";
  const etiquettes = fa("etiquetage", "etiquettes");

  block.innerHTML = `
    <div class="bloc-head">
      <h3>🏷️ Mes étiquettes</h3>
      ${etiquettes.length
        ? `<span class="bloc-etat ok">${etiquettes.length} étiquette(s)</span>`
        : `<span class="bloc-etat ko">À créer <a class="link-rempli" data-section="etiquetage">→ Étiquetage</a></span>`}
    </div>
    ${etiquettes.length ? `
      <div class="etiquettes-list">
        ${etiquettes.map(et => {
          const complets = ["nom_produit","date","ingredients","allergenes","tracabilite","conservation"]
            .filter(k => (et[k] || "").trim()).length;
          const total = 6;
          return `
          <article class="etiquette-card">
            <header class="etiquette-card-head">
              <h4>${escapeHtml(et.nom_produit || "Étiquette sans nom")}</h4>
              <span class="pill ${complets === total ? "ok" : complets > 0 ? "warn" : "ko"}">${complets}/${total} infos</span>
            </header>
            ${et.slogan ? `<div class="et-slogan">« ${escapeHtml(et.slogan)} »</div>` : ""}
            <dl class="et-defs">
              ${et.type_date || et.date ? `<dt>${escapeHtml((et.type_date || "").split(" ")[0] || "Date")}</dt><dd>${escapeHtml(et.date || "—")}</dd>` : ""}
              ${et.poids ? `<dt>Quantité</dt><dd>${escapeHtml(et.poids)}</dd>` : ""}
              ${et.ingredients ? `<dt>Ingrédients</dt><dd>${escapeHtml(et.ingredients)}</dd>` : ""}
              ${et.allergenes ? `<dt>Allergènes</dt><dd class="alerte">${escapeHtml(et.allergenes)}</dd>` : ""}
              ${et.tracabilite ? `<dt>Traçabilité</dt><dd>${escapeHtml(et.tracabilite)}</dd>` : ""}
              ${et.conservation ? `<dt>Conservation</dt><dd>${escapeHtml(et.conservation)}</dd>` : ""}
            </dl>
          </article>`;
        }).join("")}
      </div>
    ` : ""}
  `;
  return block;
}

/* ---------- Bloc EMBALLAGE ---------- */
function blocEmballage() {
  const packaging = fv("eco_responsable","packaging");
  const lieu      = fv("eco_responsable","packaging_lieu");
  const block = document.createElement("section");
  block.className = "projet-bloc bloc-emballage";
  const rempli = (packaging || lieu);
  block.innerHTML = `
    <div class="bloc-head">
      <h3>📦 Mon emballage</h3>
      ${projetEtatBloc(rempli, "eco_responsable", "Section éco-responsable")}
    </div>
    ${packaging ? `<div class="bloc-text"><b>Type :</b> ${escapeHtml(packaging)}</div>` : ""}
    ${lieu      ? `<div class="bloc-text"><b>Où me le procurer :</b> ${escapeHtml(lieu)}</div>` : ""}
  `;
  return block;
}

/* =====================================================================
   V4.77 — VUE « Créer mes étiquettes »
   Affiche les composantes du menu et permet de créer/éditer une étiquette
   pour chacune. Stockage dans state.sections[etiquetage].champs.etiquettes.
   ===================================================================== */
function renderCreerEtiquettesView() {
  const wrap = document.createElement("div");
  wrap.className = "vue-application";

  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `<button type="button" class="btn btn-back">← Mon parcours</button>`;
  back.querySelector("button").addEventListener("click", () => selectView("parcours"));
  wrap.appendChild(back);

  const head = document.createElement("header");
  head.className = "appli-head";
  head.innerHTML = `
    <span class="appli-badge">✏️ Je crée mon projet</span>
    <h2>🏷️ Créer mes étiquettes</h2>
    <p>Pour chaque composante de ton menu, crée l'étiquette qui ira sur le produit.<br>
       L'étiquette apparaît automatiquement dans <b>Mon projet</b> et dans le dossier final.</p>
    <p class="hint">📚 Pour réviser les notions (mentions obligatoires, allergènes, DLC/DDM, traçabilité), va dans <a class="link-rempli" data-section="etiquetage">L'étiquetage du produit</a>.</p>
  `;
  wrap.appendChild(head);

  // Section etiquetage = stockage. On édite ses étiquettes ici.
  const secEt = state.sections.find(s => s.id === "etiquetage");
  if (!secEt) return wrap;
  const champ = secEt.champs.find(c => c.id === "etiquettes");
  if (!champ) return wrap;
  if (!Array.isArray(champ.valeur)) champ.valeur = [];

  const composantes = [
    { id: "entree",  lbl: "Entrée",         icon: "🥗" },
    { id: "plat",    lbl: "Plat principal", icon: "🍛" },
    { id: "laitage", lbl: "Laitage",        icon: "🧀" },
    { id: "dessert", lbl: "Dessert",        icon: "🍎" },
    { id: "boisson", lbl: "Boisson",        icon: "🥤" },
  ];

  // V4.78 — Empty state riche si aucune composante composée
  const aucunComposante = composantes.every(c => {
    const raw = fvRaw("repas_equilibre", c.id);
    const isObj = raw && typeof raw === "object" && !Array.isArray(raw) && "ingredients" in raw;
    const nom = isObj ? (raw.nom || "") : (typeof raw === "string" ? raw : "");
    return !nom;
  });
  if (aucunComposante) {
    const empty = document.createElement("section");
    empty.className = "vue-empty-big";
    empty.innerHTML = `
      <div class="vue-empty-icon">🍽️</div>
      <h3>Avant de créer tes étiquettes…</h3>
      <p>Tu dois d'abord <b>composer ton repas</b> (entrée, plat, dessert, etc.). Une fois que tu auras choisi tes plats, tu pourras créer une étiquette pour chacun.</p>
      <button type="button" class="btn btn-primary btn-big">→ Composer mon repas</button>
    `;
    empty.querySelector("button").addEventListener("click", () => selectSection("repas_equilibre"));
    wrap.appendChild(empty);
    return wrap;
  }

  composantes.forEach(c => {
    const composanteLabel = COMPOSANTE_LABEL_MAP[c.id];
    const raw = fvRaw("repas_equilibre", c.id);
    const isObj = raw && typeof raw === "object" && !Array.isArray(raw) && "ingredients" in raw;
    const nomPlat = isObj ? (raw.nom || "") : (typeof raw === "string" ? raw : "");
    let etIdx = champ.valeur.findIndex(e => e.composante_liee === composanteLabel);

    const card = document.createElement("section");
    card.className = "vue-compo-card";
    card.id = "compo-card-" + c.id; // V4.78 — pour scroll auto
    card.innerHTML = `
      <div class="vue-compo-banner"><span>${c.icon}</span><span>${c.lbl.toUpperCase()}</span></div>
      <div class="vue-compo-nom">${nomPlat ? escapeHtml(nomPlat) : `<i>— Pas encore composé pour cette composante. <a class="link-rempli" data-section="repas_equilibre">→ Composer mon repas</a></i>`}</div>
    `;

    if (etIdx >= 0) {
      // Étiquette existante → on rend son formulaire
      const formBox = document.createElement("div");
      formBox.className = "vue-form-box";
      formBox.appendChild(renderEtiquetteFormForCompo(secEt, champ, etIdx, composanteLabel));
      card.appendChild(formBox);
      const actions = document.createElement("div");
      actions.className = "vue-compo-actions";
      actions.innerHTML = `<button type="button" class="btn btn-danger btn-sm">Supprimer cette étiquette</button>`;
      actions.querySelector("button").addEventListener("click", () => {
        if (!confirm("Supprimer l'étiquette de cette composante ?")) return;
        champ.valeur.splice(etIdx, 1);
        secEt.date_maj = new Date().toISOString();
        scheduleAutoSave();
        renderMain();
      });
      card.appendChild(actions);
    } else {
      // Pas encore d'étiquette → CTA
      const cta = document.createElement("div");
      cta.className = "vue-compo-cta";
      cta.innerHTML = `<button type="button" class="btn btn-primary">+ Créer l'étiquette pour cette composante</button>`;
      cta.querySelector("button").addEventListener("click", () => {
        const newEt = {
          id: uid(),
          composante_liee: composanteLabel,
          nom_produit: nomPlat || "",
          slogan: "",
          type_date: "DLC (à consommer jusqu'au)",
          date: "",
          poids: "",
          ingredients: "",
          allergenes: "",
          tracabilite: "",
          conservation: "",
        };
        champ.valeur.push(newEt);
        secEt.date_maj = new Date().toISOString();
        if (secEt.statut_eleve === "not_started") secEt.statut_eleve = "in_progress";
        scheduleAutoSave();
        renderMain();
      });
      card.appendChild(cta);
    }
    wrap.appendChild(card);
  });

  // V4.78 — Lien vers la suite logique
  const next = document.createElement("section");
  next.className = "vue-next-step";
  next.innerHTML = `
    <h4>Et après les étiquettes ?</h4>
    <p>Une fois tes étiquettes créées, indique <b>où tu vas acheter</b> chaque ingrédient.</p>
    <button type="button" class="btn btn-primary">🛒 Choisir mes fournisseurs →</button>
  `;
  next.querySelector("button").addEventListener("click", () => selectView("choisir-fournisseurs"));
  wrap.appendChild(next);

  // Délégation pour les liens inline
  wrap.addEventListener("click", e => {
    const a = e.target.closest(".link-rempli");
    if (a) { e.preventDefault(); navigateGoto(a.dataset.goto || a.dataset.section); }
  });

  // V4.78 — Scroll auto vers la composante ciblée si demandé
  applyPendingScroll();
  return wrap;
}

/* Petit moteur de formulaire d'étiquette aligné sur le schéma. */
function renderEtiquetteFormForCompo(secEt, champ, idx, composanteLabel) {
  const item = champ.valeur[idx];
  if (!item.composante_liee) item.composante_liee = composanteLabel;
  const subSchemas = SECTIONS_SCHEMA.find(s => s.id === "etiquetage").fields.find(f => f.id === "etiquettes").fields;

  const wrap = document.createElement("div");
  wrap.className = "etiq-form";
  subSchemas.forEach(sub => {
    if (sub.id === "composante_liee") return; // déjà fixé
    const fld = document.createElement("div");
    fld.className = "field";
    const lbl = document.createElement("label");
    lbl.textContent = sub.label;
    fld.appendChild(lbl);
    let inp;
    if (sub.type === "textarea") inp = document.createElement("textarea");
    else if (sub.type === "select") {
      inp = document.createElement("select");
      (sub.options || []).forEach(opt => {
        const o = document.createElement("option");
        o.value = opt; o.textContent = opt;
        if (item[sub.id] === opt) o.selected = true;
        inp.appendChild(o);
      });
    } else {
      inp = document.createElement("input");
      inp.type = sub.type === "date" ? "date" : "text";
    }
    if (inp.tagName !== "SELECT") inp.value = item[sub.id] || "";
    inp.addEventListener("input", () => {
      item[sub.id] = inp.value;
      secEt.date_maj = new Date().toISOString();
      scheduleAutoSave();
    });
    fld.appendChild(inp);
    wrap.appendChild(fld);
  });
  return wrap;
}

/* =====================================================================
   V4.77 — VUE « Choisir mes fournisseurs »
   Affiche les composantes du menu et permet d'ajouter/éditer des fournisseurs
   par composante. Stockage dans state.sections[eco_responsable].champs.fournisseurs.
   ===================================================================== */
function renderChoisirFournisseursView() {
  const wrap = document.createElement("div");
  wrap.className = "vue-application";

  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `<button type="button" class="btn btn-back">← Mon parcours</button>`;
  back.querySelector("button").addEventListener("click", () => selectView("parcours"));
  wrap.appendChild(back);

  const head = document.createElement("header");
  head.className = "appli-head";
  head.innerHTML = `
    <span class="appli-badge">✏️ Je crée mon projet</span>
    <h2>🛒 Choisir mes fournisseurs</h2>
    <p>Pour chaque composante de ton menu, indique <b>où tu vas acheter</b> tes ingrédients.<br>
       Ajoute le type de commerce, le lieu, les labels, les critères éco, et le prix estimé.</p>
    <p class="hint">📚 Pour réviser les notions (circuit court, saison, labels, AGEC), va dans <a class="link-rempli" data-section="eco_responsable">Gaspillage, circuits courts, éco</a>.</p>
  `;
  wrap.appendChild(head);

  const secEco = state.sections.find(s => s.id === "eco_responsable");
  if (!secEco) return wrap;
  const champ = secEco.champs.find(c => c.id === "fournisseurs");
  if (!champ) return wrap;
  if (!Array.isArray(champ.valeur)) champ.valeur = [];

  const composantes = [
    { id: "entree",  lbl: "Entrée",         icon: "🥗" },
    { id: "plat",    lbl: "Plat principal", icon: "🍛" },
    { id: "laitage", lbl: "Laitage",        icon: "🧀" },
    { id: "dessert", lbl: "Dessert",        icon: "🍎" },
    { id: "boisson", lbl: "Boisson",        icon: "🥤" },
  ];

  // V4.78 — Empty state riche
  const aucunComposante = composantes.every(c => {
    const raw = fvRaw("repas_equilibre", c.id);
    const isObj = raw && typeof raw === "object" && !Array.isArray(raw) && "ingredients" in raw;
    const nom = isObj ? (raw.nom || "") : (typeof raw === "string" ? raw : "");
    return !nom;
  });
  if (aucunComposante) {
    const empty = document.createElement("section");
    empty.className = "vue-empty-big";
    empty.innerHTML = `
      <div class="vue-empty-icon">🍽️</div>
      <h3>Avant de choisir tes fournisseurs…</h3>
      <p>Tu dois d'abord <b>composer ton repas</b>. Une fois que tu sauras quels ingrédients tu vas utiliser, tu pourras dire <b>où</b> tu vas les acheter.</p>
      <button type="button" class="btn btn-primary btn-big">→ Composer mon repas</button>
    `;
    empty.querySelector("button").addEventListener("click", () => selectSection("repas_equilibre"));
    wrap.appendChild(empty);
    return wrap;
  }

  composantes.forEach(c => {
    const composanteLabel = COMPOSANTE_LABEL_MAP[c.id];
    const raw = fvRaw("repas_equilibre", c.id);
    const isObj = raw && typeof raw === "object" && !Array.isArray(raw) && "ingredients" in raw;
    const nomPlat = isObj ? (raw.nom || "") : (typeof raw === "string" ? raw : "");
    const fournisseurs = champ.valeur.map((f, i) => ({ f, i })).filter(x => x.f.composante_liee === composanteLabel);

    const card = document.createElement("section");
    card.className = "vue-compo-card";
    card.id = "compo-card-" + c.id; // V4.78 — pour scroll auto
    card.innerHTML = `
      <div class="vue-compo-banner"><span>${c.icon}</span><span>${c.lbl.toUpperCase()}</span></div>
      <div class="vue-compo-nom">${nomPlat ? escapeHtml(nomPlat) : `<i>— Pas encore composé pour cette composante. <a class="link-rempli" data-section="repas_equilibre">→ Composer mon repas</a></i>`}</div>
    `;
    const list = document.createElement("div");
    list.className = "vue-fourn-list";
    fournisseurs.forEach(({ f, i }) => list.appendChild(renderFournisseurFormForCompo(secEco, champ, i, composanteLabel)));
    card.appendChild(list);

    const cta = document.createElement("div");
    cta.className = "vue-compo-cta";
    cta.innerHTML = `<button type="button" class="btn btn-primary">+ Ajouter un produit / fournisseur</button>`;
    cta.querySelector("button").addEventListener("click", () => {
      const subSchemas = SECTIONS_SCHEMA.find(s => s.id === "eco_responsable").fields.find(f => f.id === "fournisseurs").fields;
      const newF = { id: uid() };
      subSchemas.forEach(s => {
        if (s.type === "checklist") newF[s.id] = [];
        else if (s.type === "select") newF[s.id] = (s.options?.[0] || "");
        else newF[s.id] = "";
      });
      newF.composante_liee = composanteLabel;
      champ.valeur.push(newF);
      secEco.date_maj = new Date().toISOString();
      if (secEco.statut_eleve === "not_started") secEco.statut_eleve = "in_progress";
      scheduleAutoSave();
      renderMain();
    });
    card.appendChild(cta);
    wrap.appendChild(card);
  });

  // V4.78 — Lien vers la suite logique
  const next = document.createElement("section");
  next.className = "vue-next-step";
  next.innerHTML = `
    <h4>Et après les fournisseurs ?</h4>
    <p>Tu peux maintenant visualiser ton dossier projet complet, prêt à être imprimé.</p>
    <button type="button" class="btn btn-primary">📖 Voir mon dossier projet →</button>
  `;
  next.querySelector("button").addEventListener("click", () => selectView("dossier"));
  wrap.appendChild(next);

  wrap.addEventListener("click", e => {
    const a = e.target.closest(".link-rempli");
    if (a) { e.preventDefault(); navigateGoto(a.dataset.goto || a.dataset.section); }
  });

  // V4.78 — Scroll auto vers la composante ciblée
  applyPendingScroll();
  return wrap;
}

function renderFournisseurFormForCompo(secEco, champ, idx, composanteLabel) {
  const item = champ.valeur[idx];
  if (!item.composante_liee) item.composante_liee = composanteLabel;
  const subSchemas = SECTIONS_SCHEMA.find(s => s.id === "eco_responsable").fields.find(f => f.id === "fournisseurs").fields;

  const wrap = document.createElement("div");
  wrap.className = "fourn-form";
  const head = document.createElement("div");
  head.className = "fourn-form-head";
  head.innerHTML = `<b>${escapeHtml(item.produit || "Nouveau produit")}</b>`;
  const del = document.createElement("button");
  del.type = "button"; del.className = "btn btn-sm btn-danger";
  del.textContent = "Supprimer";
  del.addEventListener("click", () => {
    if (!confirm("Supprimer ce produit ?")) return;
    champ.valeur.splice(idx, 1);
    secEco.date_maj = new Date().toISOString();
    scheduleAutoSave();
    renderMain();
  });
  head.appendChild(del);
  wrap.appendChild(head);

  subSchemas.forEach(sub => {
    if (sub.id === "composante_liee") return;
    const fld = document.createElement("div");
    fld.className = "field";
    const lbl = document.createElement("label");
    lbl.textContent = sub.label;
    fld.appendChild(lbl);

    if (sub.type === "checklist") {
      if (!Array.isArray(item[sub.id])) item[sub.id] = [];
      const cur = item[sub.id];
      const box = document.createElement("div");
      box.className = "rep-checklist";
      (sub.options || []).forEach(opt => {
        const lab = document.createElement("label");
        lab.className = "rep-check";
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.checked = cur.includes(opt);
        cb.addEventListener("change", () => {
          if (cb.checked && !cur.includes(opt)) cur.push(opt);
          else if (!cb.checked) {
            const i = cur.indexOf(opt);
            if (i >= 0) cur.splice(i, 1);
          }
          secEco.date_maj = new Date().toISOString();
          scheduleAutoSave();
        });
        lab.append(cb, document.createTextNode(" " + opt));
        box.appendChild(lab);
      });
      fld.appendChild(box);
      wrap.appendChild(fld);
      return;
    }

    let inp;
    if (sub.type === "textarea") inp = document.createElement("textarea");
    else if (sub.type === "select") {
      inp = document.createElement("select");
      (sub.options || []).forEach(opt => {
        const o = document.createElement("option");
        o.value = opt; o.textContent = opt;
        if (item[sub.id] === opt) o.selected = true;
        inp.appendChild(o);
      });
    } else {
      inp = document.createElement("input");
      inp.type = "text";
    }
    if (inp.tagName !== "SELECT") inp.value = item[sub.id] || "";
    inp.addEventListener("input", () => {
      item[sub.id] = inp.value;
      secEco.date_maj = new Date().toISOString();
      scheduleAutoSave();
      // Refresh head label si on a changé "produit"
      if (sub.id === "produit") {
        const headB = wrap.querySelector(".fourn-form-head b");
        if (headB) headB.textContent = inp.value || "Nouveau produit";
      }
    });
    fld.appendChild(inp);
    if (sub.hint) {
      const h = document.createElement("div");
      h.className = "hint"; h.textContent = sub.hint;
      fld.appendChild(h);
    }
    wrap.appendChild(fld);
  });
  return wrap;
}

/* =====================================================================
   V4.77 — VUE « Mon dossier projet »
   Rendu HTML façon magazine du projet final, en temps réel. Sans donut,
   sans avertissements. C'est le rendu visuel du dossier imprimable.
   ===================================================================== */
function renderDossierProjetView() {
  syncIdentiteToInfos();
  const e = state.infos_eleve;
  const wrap = document.createElement("div");
  wrap.className = "dossier-view";

  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `<button type="button" class="btn btn-back">← Retour à l'accueil</button>
    <button type="button" class="btn btn-primary" id="dossier-print">🖨️ Exporter en Word</button>`;
  back.querySelector(".btn-back").addEventListener("click", () => selectView("home"));
  back.querySelector("#dossier-print").addEventListener("click", exportFicheProjetWord);
  wrap.appendChild(back);

  const nomMenu = fv("mon_menu","nom_menu") || fv("infos_eleve","titre_dossier") || "Mon menu";
  const desc = fv("mon_menu","description") || "";
  const equilibre = fv("mon_menu","equilibre") || fv("repas_equilibre","equilibre_global") || "";
  const eco = fv("mon_menu","eco") || "";
  const photo = findMainPhoto();

  // Couverture
  const cover = document.createElement("section");
  cover.className = "doss-cover";
  cover.innerHTML = `
    <div class="doss-eyebrow">Mon chef-d'œuvre · Dossier projet</div>
    <h1 class="doss-titre">${escapeHtml(nomMenu)}</h1>
    <div class="doss-author">
      ${escapeHtml(e.prenom || "")} ${escapeHtml(e.nom || "")}
      ${e.classe ? " · " + escapeHtml(e.classe) : ""}
      ${e.lycee ? " · " + escapeHtml(e.lycee) : ""}
      ${e.annee_scolaire ? " · " + escapeHtml(e.annee_scolaire) : ""}
    </div>
    ${desc ? `<p class="doss-desc">${escapeHtml(desc)}</p>` : ""}
    ${photo ? `<img class="doss-photo" src="${photo.contenu}" alt="" />` : ""}
  `;
  wrap.appendChild(cover);

  // Argumentaire
  if (equilibre || eco) {
    const argB = document.createElement("section");
    argB.className = "doss-argum";
    argB.innerHTML = `
      ${equilibre ? `<div class="doss-pillier doss-eq"><h3>⚖️ Pourquoi ce menu est équilibré</h3><p>${escapeHtml(equilibre)}</p></div>` : ""}
      ${eco ? `<div class="doss-pillier doss-eco"><h3>🌱 Pourquoi ce menu est éco-responsable</h3><p>${escapeHtml(eco)}</p></div>` : ""}
    `;
    wrap.appendChild(argB);
  }

  // Composantes
  const composantes = [
    { id: "entree",  lbl: "Entrée",         icon: "🥗" },
    { id: "plat",    lbl: "Plat principal", icon: "🍛" },
    { id: "laitage", lbl: "Laitage",        icon: "🧀" },
    { id: "dessert", lbl: "Dessert",        icon: "🍎" },
    { id: "boisson", lbl: "Boisson",        icon: "🥤" },
  ];

  const compoSection = document.createElement("section");
  compoSection.className = "doss-compos";
  compoSection.innerHTML = `<h2 class="doss-h2">📋 Mon repas, étiquettes &amp; achats</h2>`;
  composantes.forEach(c => {
    const raw = fvRaw("repas_equilibre", c.id);
    const isObj = raw && typeof raw === "object" && !Array.isArray(raw) && "ingredients" in raw;
    const nom = isObj ? (raw.nom || "") : (typeof raw === "string" ? raw : "");
    const ingredients = isObj && Array.isArray(raw.ingredients) ? raw.ingredients : [];
    const et = findEtiquetteForComposante(c.id);
    const fournLies = findFournisseursForComposante(c.id);
    if (!nom && !ingredients.length && !et && !fournLies.length) return; // skip vide

    const card = document.createElement("article");
    card.className = "doss-compo-card";
    const ingHtml = ingredients.length
      ? `<ul class="doss-ing-list">${ingredients.map(i => `<li>${escapeHtml(i.aliment || "")}${i.quantite ? ` <small>(${escapeHtml(i.quantite)})</small>` : ""}</li>`).join("")}</ul>`
      : "";
    const dateMention = et && et.type_date && et.date
      ? `${et.type_date.includes("DLC") ? "DLC" : "DDM"} : ${escapeHtml(et.date)}`
      : "";
    const etHtml = et ? `
      <div class="doss-etiq">
        <div class="doss-etiq-tag">🏷️ ÉTIQUETTE</div>
        <div class="doss-etiq-nom">${escapeHtml(et.nom_produit || "")}</div>
        ${et.slogan ? `<div class="doss-etiq-slogan">« ${escapeHtml(et.slogan)} »</div>` : ""}
        <dl>
          ${et.ingredients ? `<dt>Ingrédients</dt><dd>${escapeHtml(et.ingredients)}</dd>` : ""}
          ${et.allergenes ? `<dt>Allergènes</dt><dd class="alerte">⚠️ ${escapeHtml(et.allergenes)}</dd>` : ""}
          ${dateMention ? `<dt>Date</dt><dd>${dateMention}</dd>` : ""}
          ${et.poids ? `<dt>Quantité</dt><dd>${escapeHtml(et.poids)}</dd>` : ""}
          ${et.tracabilite ? `<dt>Traçabilité</dt><dd>${escapeHtml(et.tracabilite)}</dd>` : ""}
          ${et.conservation ? `<dt>Conservation</dt><dd>${escapeHtml(et.conservation)}</dd>` : ""}
        </dl>
      </div>` : `<div class="doss-empty">🏷️ Étiquette : à créer</div>`;
    const fournHtml = fournLies.length ? `
      <div class="doss-fourn">
        <div class="doss-fourn-tag">🛒 OÙ J'ACHÈTE</div>
        <table class="doss-fourn-tab">
          <thead><tr><th>Produit</th><th>Commerce</th><th>Lieu</th><th>Labels &amp; critères</th><th>Prix</th></tr></thead>
          <tbody>
          ${fournLies.map(f => {
            const lbls = (Array.isArray(f.labels) ? f.labels : []).concat(Array.isArray(f.criteres_eco) ? f.criteres_eco : []);
            const tags = lbls.length
              ? lbls.map(t => `<span class="doss-pill">${escapeHtml(t.split(" (")[0])}</span>`).join(" ")
              : (f.label ? escapeHtml(f.label) : "—");
            return `<tr>
              <td><b>${escapeHtml(f.produit || "—")}</b></td>
              <td>${escapeHtml(f.type_commerce && f.type_commerce !== "—" ? f.type_commerce : "—")}</td>
              <td>${escapeHtml(f.lieu || "—")}</td>
              <td>${tags}</td>
              <td>${escapeHtml(f.prix_unitaire || "—")}</td>
            </tr>`;
          }).join("")}
          </tbody>
        </table>
      </div>` : `<div class="doss-empty">🛒 Fournisseurs : à compléter</div>`;
    card.innerHTML = `
      <header class="doss-compo-head">
        <span class="doss-compo-icon">${c.icon}</span>
        <span class="doss-compo-lbl">${c.lbl.toUpperCase()}</span>
        <span class="doss-compo-actions no-print">
          <button type="button" class="btn btn-xs doss-edit" data-goto="repas_equilibre">Modifier le plat</button>
          <button type="button" class="btn btn-xs doss-edit" data-goto="creer-etiquettes" data-compo="${c.id}">Modifier l'étiquette</button>
          <button type="button" class="btn btn-xs doss-edit" data-goto="choisir-fournisseurs" data-compo="${c.id}">Modifier le sourcing</button>
        </span>
      </header>
      <div class="doss-compo-nom">${nom ? escapeHtml(nom) : `<i style="color:#999">— pas encore nommé —</i>`}</div>
      ${ingHtml}
      <div class="doss-compo-body">
        ${etHtml}
        ${fournHtml}
      </div>`;
    compoSection.appendChild(card);
  });
  wrap.appendChild(compoSection);

  // V4.78 — Délégation pour les boutons "Modifier" du dossier
  wrap.addEventListener("click", e => {
    const a = e.target.closest("[data-goto]");
    if (a) navigateGoto(a.dataset.goto, { compo: a.dataset.compo });
  });

  // Plateau à emporter
  const packaging = fv("eco_responsable","packaging");
  const packagingLieu = fv("eco_responsable","packaging_lieu");
  if (packaging || packagingLieu) {
    const plat = document.createElement("section");
    plat.className = "doss-plateau";
    plat.innerHTML = `
      <h2 class="doss-h2">📦 Mon plateau à emporter</h2>
      ${packaging ? `<p><b>Type d'emballage :</b> ${escapeHtml(packaging)}</p>` : ""}
      ${packagingLieu ? `<p><b>Où le trouver :</b> ${escapeHtml(packagingLieu)}</p>` : ""}
    `;
    wrap.appendChild(plat);
  }

  return wrap;
}

/* ---------- Bloc COÛT (verrouillé année 2) ---------- */
function blocCout() {
  const block = document.createElement("section");
  block.className = "projet-bloc bloc-cout locked";
  const sec = state.sections.find(s => s.id === "cout_vente");
  const hasData = sec?.champs.some(c => c.valeur);
  block.innerHTML = `
    <div class="bloc-head">
      <h3>💶 Coût et prix de vente</h3>
      <span class="bloc-etat locked-tag">🔒 Année 2 (avec maths)</span>
    </div>
    <div class="bloc-text empty">${hasData
      ? "Des données sont déjà saisies. <a class='link-rempli' data-section='cout_vente'>→ Voir</a>"
      : "Cette partie sera travaillée en année 2 avec les enseignants de mathématiques. Tu n'as rien à faire pour l'instant."
    }</div>
  `;
  return block;
}

/* ---------- Export Word "Fiche projet" ---------- */
function exportFicheProjetWord() {
  syncIdentiteToInfos();
  const e = state.infos_eleve;
  const nomMenu = fv("mon_menu","nom_menu") || "(menu sans nom)";
  const desc    = fv("mon_menu","description");
  const photo   = findMainPhoto();
  const fournisseurs = fa("eco_responsable", "fournisseurs");
  const etiquettes   = fa("etiquetage", "etiquettes");
  const br = s => escapeHtml(s).replace(/\n/g, "<br>");

  // V4.76 — Composantes du menu avec leur étiquette + leurs fournisseurs liés
  const composantes = [
    { id: "entree",  lbl: "Entrée",         icon: "🥗" },
    { id: "plat",    lbl: "Plat principal", icon: "🍛" },
    { id: "laitage", lbl: "Laitage",        icon: "🧀" },
    { id: "dessert", lbl: "Dessert",        icon: "🍎" },
    { id: "boisson", lbl: "Boisson",        icon: "🥤" },
  ];

  const renderCompoCard = (c) => {
    const raw = fvRaw("repas_equilibre", c.id);
    const isObj = raw && typeof raw === "object" && !Array.isArray(raw) && "ingredients" in raw;
    const nom = isObj ? (raw.nom || "") : (typeof raw === "string" ? raw : "");
    const ingredients = isObj && Array.isArray(raw.ingredients) ? raw.ingredients : [];
    const et = findEtiquetteForComposante(c.id);
    const fournLies = findFournisseursForComposante(c.id);
    if (!nom && !ingredients.length && !et && !fournLies.length) return "";

    const ingHtml = ingredients.length
      ? `<div class="ing-list">${ingredients.map(i => `<span class="ing-pill">${br(i.aliment || "")}${i.quantite ? ` <small>(${br(i.quantite)})</small>` : ""}</span>`).join("")}</div>`
      : "";

    const dateMention = et && et.type_date && et.date
      ? `${et.type_date.includes("DLC") ? "DLC" : "DDM"}&nbsp;: ${br(et.date)}`
      : "";
    const etCard = et ? `
      <div class="cw-etiq">
        <div class="cw-etiq-head"><span class="cw-tag cw-tag-blue">🏷️ Étiquette</span> <b>${br(et.nom_produit || "(sans nom)")}</b>
        ${et.slogan ? ` <i>« ${br(et.slogan)} »</i>` : ""}</div>
        <table class="cw-etiq-tab">
          ${et.ingredients ? `<tr><th>Ingrédients</th><td>${br(et.ingredients)}</td></tr>` : ""}
          ${et.allergenes  ? `<tr><th>Allergènes</th><td class="alerte">⚠️ ${br(et.allergenes)}</td></tr>` : ""}
          ${dateMention   ? `<tr><th>Date</th><td>${dateMention}</td></tr>` : ""}
          ${et.poids       ? `<tr><th>Quantité</th><td>${br(et.poids)}</td></tr>` : ""}
          ${et.tracabilite ? `<tr><th>Traçabilité</th><td>${br(et.tracabilite)}</td></tr>` : ""}
          ${et.conservation? `<tr><th>Conservation</th><td>${br(et.conservation)}</td></tr>` : ""}
        </table>
      </div>` : `<div class="cw-warn">⚠️ Pas encore d'étiquette pour cette composante.</div>`;

    const sourcing = fournLies.length ? `
      <div class="cw-sourcing">
        <div class="cw-sourcing-head"><span class="cw-tag cw-tag-green">🛒 Où j'achète</span></div>
        <table class="cw-srcs-tab">
          <thead><tr><th>Produit</th><th>Type de commerce</th><th>Lieu / adresse</th><th>Labels &amp; critères éco</th><th>Prix</th></tr></thead>
          <tbody>
          ${fournLies.map(f => {
            const labels = Array.isArray(f.labels) ? f.labels : [];
            const crits  = Array.isArray(f.criteres_eco) ? f.criteres_eco : [];
            const tags = [...labels, ...crits].map(x => x.split(" (")[0]);
            const tagsHtml = tags.length ? tags.map(t => `<span class="cw-pill">${br(t)}</span>`).join(" ") : (f.label ? br(f.label) : "—");
            return `<tr>
              <td><b>${br(f.produit || "—")}</b></td>
              <td>${br(f.type_commerce && f.type_commerce !== "—" ? f.type_commerce : "—")}</td>
              <td>${br(f.lieu || "—")}</td>
              <td>${tagsHtml}</td>
              <td>${br(f.prix_unitaire || "—")}</td>
            </tr>`;
          }).join("")}
          </tbody>
        </table>
      </div>` : `<div class="cw-warn">🛒 Aucun fournisseur indiqué pour cette composante.</div>`;

    return `
      <section class="compo-bloc">
        <div class="compo-banner"><span class="cb-icon">${c.icon}</span><span class="cb-label">${c.lbl.toUpperCase()}</span></div>
        ${nom ? `<div class="compo-nom">${br(nom)}</div>` : `<div class="compo-nom-empty">— Pas encore nommé —</div>`}
        ${ingHtml}
        ${etCard}
        ${sourcing}
      </section>`;
  };

  // Étiquettes orphelines (pas liées à une composante du menu)
  const composanteLabels = composantes.map(c => COMPOSANTE_LABEL_MAP[c.id]);
  const etOrphelines = etiquettes.filter(et => !composanteLabels.includes(et.composante_liee));
  const fournOrphelins = fournisseurs.filter(f => {
    return !composanteLabels.includes(f.composante_liee);
  });

  // Stats globales
  const total = fournisseurs.length;
  const compteCriteres = (cri) => fournisseurs.filter(f => Array.isArray(f.criteres_eco) && f.criteres_eco.includes(cri)).length;
  const nbBio = compteCriteres("Bio");
  const nbSaison = compteCriteres("De saison") || fournisseurs.filter(f => f.saison === "Oui").length;
  const nbCircuit = compteCriteres("Circuit court (≤ 1 intermédiaire)") || fournisseurs.filter(f => f.circuit && f.circuit.startsWith("Oui")).length;
  const budgetTotal = fournisseurs.reduce((s, f) => {
    const m = String(f.prix_unitaire || "").match(/(\d+[.,]?\d*)/);
    return s + (m ? parseFloat(m[1].replace(",", ".")) : 0);
  }, 0);

  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>Fiche projet — ${br(nomMenu)}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 0.7cm; }
  body { font-family: Calibri, Arial, sans-serif; color: #222; font-size: 10.5pt; line-height: 1.5; }
  .cover { border-bottom: 3pt solid #2f6fb5; padding-bottom: 12pt; margin-bottom: 14pt; }
  .eyebrow { color: #5b6b7b; text-transform: uppercase; letter-spacing: .12em; font-size: 9pt; }
  h1 { color: #1f4f86; font-size: 24pt; margin: 4pt 0 4pt; }
  .author { color: #444; font-size: 11pt; }
  h2 { color: #1f6b3d; font-size: 13pt; border-bottom: 1pt solid #2e8b57; padding-bottom: 2pt; margin-top: 14pt; }
  h3 { color: #1f4f86; font-size: 11pt; margin: 8pt 0 4pt; }
  table { width: 100%; border-collapse: collapse; margin: 4pt 0; }
  td, th { border: .8pt solid #d2dae3; padding: 4pt 6pt; vertical-align: top; font-size: 9.5pt; }
  th { background: #eef2f6; color: #1f4f86; text-align: left; }
  .photo { float: right; width: 6cm; max-height: 5cm; border: 1pt solid #2f6fb5; margin-left: 12pt; }

  /* V4.76 — bloc composante (page-break: avoid si possible) */
  .compo-bloc { margin: 10pt 0; padding: 8pt 10pt; border: 1pt solid #d4dee8; border-radius: 4pt; background: #fafdff; page-break-inside: avoid; }
  .compo-banner { background: #1f4f86; color: #fff; padding: 4pt 10pt; border-radius: 4pt; font-weight: 700; letter-spacing: .08em; margin-bottom: 6pt; font-size: 10pt; }
  .cb-icon { font-size: 12pt; margin-right: 6pt; }
  .compo-nom { font-size: 13pt; color: #1f4f86; font-weight: 700; margin: 4pt 0; }
  .compo-nom-empty { color: #999; font-style: italic; }
  .ing-list { margin: 4pt 0 6pt; }
  .ing-pill { display: inline-block; background: #fff; border: .5pt solid #d4dee8; border-radius: 10pt; padding: 1pt 8pt; margin: 2pt 4pt 2pt 0; font-size: 9pt; }
  .cw-tag { display: inline-block; padding: 1pt 6pt; border-radius: 3pt; font-size: 8.5pt; font-weight: 700; letter-spacing: .04em; margin-right: 4pt; }
  .cw-tag-blue { background: #1f4f86; color: #fff; }
  .cw-tag-green { background: #2e8b57; color: #fff; }
  .cw-etiq { margin-top: 6pt; padding: 6pt 8pt; border: 1pt dashed #1f4f86; border-radius: 4pt; background: #fff; }
  .cw-etiq-head { margin-bottom: 4pt; }
  .cw-etiq-tab th { width: 22%; font-size: 9pt; }
  .cw-etiq-tab td { font-size: 9pt; }
  .cw-sourcing { margin-top: 6pt; padding: 6pt 8pt; border: 1pt solid #2e8b57; border-radius: 4pt; background: #f6fbf7; }
  .cw-srcs-tab th { background: #d4ebd9; color: #1f6b3d; font-size: 8.5pt; }
  .cw-srcs-tab td { font-size: 9pt; }
  .cw-pill { display: inline-block; background: #d4ebd9; color: #1f6b3d; border-radius: 8pt; padding: 1pt 6pt; margin: 1pt 2pt 1pt 0; font-size: 8.5pt; font-weight: 600; }
  .cw-warn { margin-top: 6pt; padding: 5pt 8pt; background: #fff7eb; border: 1pt dashed #d97706; border-radius: 4pt; color: #7c4a00; font-size: 9pt; }
  .alerte { color: #b23a48; font-weight: bold; }

  .stats-row { display: table; width: 100%; margin: 6pt 0; }
  .stat-cell { display: table-cell; padding: 6pt 8pt; background: #f6fbf7; border: 1pt solid #2e8b57; border-radius: 4pt; text-align: center; width: 25%; }
  .stat-cell b { display: block; color: #1f6b3d; font-size: 16pt; }
  .stat-cell span { display: block; font-size: 8.5pt; color: #2a3340; font-weight: 600; }
</style>
</head>
<body>
  <div class="cover">
    <div class="eyebrow">Mon chef-d'œuvre · Dossier projet · Année 1</div>
    <h1>${br(nomMenu)}</h1>
    <div class="author">${br(e.prenom || "")} ${br(e.nom || "")}
      ${e.classe ? " · " + br(e.classe) : ""}
      ${e.lycee ? " · " + br(e.lycee) : ""}
      ${e.annee_scolaire ? " · " + br(e.annee_scolaire) : ""}
      · Édité le ${new Date().toLocaleDateString("fr-FR")}</div>
    ${desc ? `<p>${br(desc)}</p>` : ""}
  </div>

  ${photo ? `<img class="photo" src="${photo.contenu}" alt="" />` : ""}

  <h2>Mon projet</h2>
  <p><b>Pourquoi ce menu est équilibré :</b> ${br(fv("mon_menu","equilibre") || fv("repas_equilibre","equilibre_global") || "—")}</p>
  <p><b>Pourquoi ce menu est éco-responsable :</b> ${br(fv("mon_menu","eco") || "—")}</p>

  <h2>Composition de mon repas, étiquettes et fournisseurs</h2>
  ${composantes.map(renderCompoCard).join("")}

  ${total > 0 ? `
    <h2>Récapitulatif éco-responsable</h2>
    <div class="stats-row">
      <div class="stat-cell"><b>${nbBio}</b><span>Bio</span></div>
      <div class="stat-cell"><b>${nbSaison}</b><span>De saison</span></div>
      <div class="stat-cell"><b>${nbCircuit}</b><span>Circuit court</span></div>
      ${budgetTotal > 0 ? `<div class="stat-cell" style="background:#fff7eb; border-color:#d97706;"><b style="color:#7c4a00;">${budgetTotal.toFixed(2)} €</b><span style="color:#7c4a00;">Budget estimé</span></div>` : ""}
    </div>
  ` : ""}

  ${etOrphelines.length || fournOrphelins.length ? `
    <h2>Autres éléments</h2>
    ${etOrphelines.length ? `
      <h3>Étiquettes non liées à une composante</h3>
      ${etOrphelines.map(et => `
        <div class="cw-etiq">
          <div class="cw-etiq-head"><b>${br(et.nom_produit || "(sans nom)")}</b>${et.composante_liee ? ` — <i>${br(et.composante_liee)}</i>` : ""}</div>
          <table class="cw-etiq-tab">
            ${et.ingredients ? `<tr><th>Ingrédients</th><td>${br(et.ingredients)}</td></tr>` : ""}
            ${et.allergenes ? `<tr><th>Allergènes</th><td class="alerte">${br(et.allergenes)}</td></tr>` : ""}
            ${et.date ? `<tr><th>Date</th><td>${br(et.type_date||"")} ${br(et.date)}</td></tr>` : ""}
          </table>
        </div>`).join("")}
    ` : ""}
    ${fournOrphelins.length ? `
      <h3>Fournisseurs non liés à une composante</h3>
      <table>
        <thead><tr><th>Produit</th><th>Type de commerce</th><th>Lieu</th><th>Prix</th></tr></thead>
        <tbody>${fournOrphelins.map(f => `
          <tr><td>${br(f.produit||"—")}</td><td>${br(f.type_commerce||"—")}</td><td>${br(f.lieu||"—")}</td><td>${br(f.prix_unitaire||"—")}</td></tr>`).join("")}</tbody>
      </table>` : ""}
  ` : ""}

  <h2>Mon plateau à emporter (emballage)</h2>
  <p><b>Type d'emballage :</b> ${br(fv("eco_responsable","packaging") || "—")}</p>
  <p><b>Où le trouver :</b> ${br(fv("eco_responsable","packaging_lieu") || "—")}</p>
</body></html>`;

  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const n = (e.nom || "eleve").replace(/\s+/g, "_");
  a.href = url;
  a.download = `FicheProjet_${n}_${new Date().toISOString().slice(0,10)}.doc`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

/* =====================================================================
   V4 — VUE "MON PARCOURS" (page d'accueil élève)
   ---------------------------------------------------------------------
   Vue principale : ligne du temps des grandes étapes, indique où en
   est l'élève, propose un bouton "Continuer" sur la première étape
   non terminée. Plus claire que la sidebar plate.
   ===================================================================== */

/* V4.3 — "identite" sort de la liste : il devient un BANDEAU au sommet.
   "comprendre" passe en 1, "accueil" en 2. Les modules pédagogiques
   sont mis en évidence comme groupe à part dans la home view. */
const PARCOURS = [
  // V4.77 — Distinction visuelle : J'APPRENDS (cours + auto-éval) vs JE CRÉE MON PROJET (application)
  { id: "accueil",         label: "Accueil et présentation du projet",            emoji: "📖", categorie: "projet" },
  { id: "comprendre",      label: "Comprendre le chef-d'œuvre",                   emoji: "🎓", jalon: "j1_comprendre",       isModule: true, categorie: "apprendre" },
  { id: "marche_en_avant", label: "Marche en avant — hygiène & sécurité",          emoji: "🧼", jalon: "j6_marche_en_avant",  isModule: true, categorie: "apprendre" },
  { id: "equilibre",       label: "L'assiette équilibrée — notions",              emoji: "🥗", jalon: "j2_repas_equilibre",  isModule: true, categorie: "apprendre" },
  { id: "eco_responsable", label: "Gaspillage, circuits courts, éco — notions",   emoji: "🌱", jalon: "j3_eco_responsable",  isModule: true, categorie: "apprendre" },
  { id: "etiquetage",      label: "L'étiquetage du produit — notions",            emoji: "🏷️", jalon: "j4_etiquetage",       isModule: true, categorie: "apprendre" },
  { id: "repas_equilibre", label: "Composer mon repas",                            emoji: "🍽️", categorie: "projet" },
  // V4.77 — Vues d'application (pas des sections, juste des UI alternatives sur les mêmes données)
  { id: "creer-etiquettes",     label: "Créer mes étiquettes",                     emoji: "🏷️", categorie: "projet", customView: "creer-etiquettes" },
  { id: "choisir-fournisseurs", label: "Choisir mes fournisseurs (où j'achète)",   emoji: "🛒", categorie: "projet", customView: "choisir-fournisseurs" },
  { id: "mon_menu",        label: "Mon menu final — épreuve de synthèse",         emoji: "📌", jalon: "j5_menu_final", isModule: true, categorie: "projet" },
  { id: "annexes",         label: "Mes photos",                                   emoji: "📁", categorie: "projet" },
  { id: "cout_vente",      label: "Le prix de vente",                    emoji: "💶", anneeNote: "Année 2", categorie: "projet" },
  { id: "realisation",     label: "La réalisation",                     emoji: "👨‍🍳", anneeNote: "Année 2", categorie: "projet" },
  { id: "degustation",     label: "La dégustation",                     emoji: "👅", anneeNote: "Année 2", categorie: "projet" },
  { id: "communication",   label: "La communication",                   emoji: "📣", anneeNote: "Année 2", categorie: "projet" },
  { id: "enquete",         label: "L'enquête de satisfaction",          emoji: "📊", anneeNote: "Année 2", categorie: "projet" },
  { id: "bilan",           label: "Mon bilan",                          emoji: "📝", anneeNote: "Année 2", categorie: "projet" },
  { id: "oral",            label: "Préparer mon oral",                  emoji: "🎤", anneeNote: "Année 2", categorie: "projet" },
];

function statutEtape(sec) {
  if (!sec) return "todo";
  if (sec.statut_eleve === "done") return "done";
  if (sec.statut_eleve === "in_progress") return "progress";
  return "todo";
}

function renderHomeView() {
  const wrap = document.createElement("div");
  wrap.className = "home-view home-v2";

  const e = state.infos_eleve;

  /* ===== 1. SALUTATION ENRICHIE ===== */
  const h = new Date().getHours();
  const salutation = h < 6 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  const emojiSalut = h < 6 ? "🌙" : h < 12 ? "☀️" : h < 18 ? "🌤️" : "🌆";
  const today = new Date().toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const nomMenu = fv("mon_menu", "nom_menu") || "";
  const greet = document.createElement("section");
  greet.className = "h2-greet";
  greet.innerHTML = `
    <div class="h2-greet-main">
      <span class="h2-greet-emoji">${emojiSalut}</span>
      <div>
        <div class="h2-greet-text">${escapeHtml(salutation)}${e.prenom ? ", " : ""}<b>${escapeHtml(e.prenom || "")}</b> !</div>
        <div class="h2-greet-meta">${escapeHtml(today)}${e.classe ? " · " + escapeHtml(e.classe) : ""}</div>
      </div>
    </div>
    ${nomMenu ? `<div class="h2-greet-menu">🍽️ <b>${escapeHtml(nomMenu)}</b></div>` : ""}
  `;
  wrap.appendChild(greet);

  /* ===== 2. ALERTE si fiche identité vide ===== */
  if (!e.prenom && !e.nom) {
    const alerte = document.createElement("section");
    alerte.className = "h2-alerte-identite";
    alerte.innerHTML = `
      <span class="hai-emoji">👋</span>
      <div class="hai-text">
        <b>Bienvenue ! On commence par te présenter ?</b>
        <small>Remplis ta fiche identité (nom, prénom, classe…) pour personnaliser ton portfolio.</small>
      </div>
      <button type="button" class="btn btn-primary" id="hai-btn">🎓 Je remplis maintenant →</button>
    `;
    alerte.querySelector("#hai-btn").addEventListener("click", () => selectSection("identite"));
    wrap.appendChild(alerte);
  }

  /* ===== 3. PROGRESSION SUR 2 ANS — TIMELINE BELLE ===== */
  // On considère "validée" = note de l'épreuve >= seuil OU statut "done"
  const ann1 = PARCOURS.filter(p => !p.anneeNote && p.id !== "annexes" && p.id !== "accueil" && !p.customView);
  const ann2 = PARCOURS.filter(p => p.anneeNote);
  // V4.82 — Le % utilise la même logique pédagogique
  const calcPct = (items) => {
    if (!items.length) return 0;
    // Note : on utilise statutPedago qui sera défini juste après
    const done = items.filter(p => {
      const sec = state.sections.find(s => s.id === p.id);
      if (!sec) return false;
      if (p.jalon && sec.module_state && sec.module_state.epreuve_state) {
        const ep = sec.module_state.epreuve_state;
        return ep.validation_finale && ep.validation_finale.state === "validee";
      }
      return sec.statut_eleve === "done";
    }).length;
    return Math.round((done / items.length) * 100);
  };
  const pct1 = calcPct(ann1);
  const pct2 = calcPct(ann2);

  // V4.82 — Statut pédagogique : tient compte de l'auto-évaluation passée
  const statutPedago = (p) => {
    const sec = state.sections.find(s => s.id === p.id);
    if (!sec) return "todo";
    // Sections avec auto-évaluation (jalon) : on regarde la validation de l'épreuve
    if (p.jalon && sec.module_state && sec.module_state.epreuve_state) {
      const ep = sec.module_state.epreuve_state;
      if (ep.validation_finale && ep.validation_finale.state === "validee") return "done";
      // En cours : a commencé l'épreuve, lu des cours, ou rempli des champs
      const aCommence = ep.note_sur_20 != null
        || (ep.reponses && Object.keys(ep.reponses).length)
        || (sec.module_state.qcm_score != null)
        || sec.champs.some(c => c.valeur && c.valeur !== "");
      return aCommence ? "progress" : "todo";
    }
    // Section sans module : statut_eleve + complétude
    if (sec.statut_eleve === "done") return "done";
    if (sec.statut_eleve === "in_progress") return "progress";
    // Fallback : si quelque chose est rempli → progress
    if (sec.champs && sec.champs.some(c => c.valeur && c.valeur !== "")) return "progress";
    return "todo";
  };

  // V4.83 — Stepper horizontal (Concept A)
  const renderStepperItem = (p, i) => {
    const statut = statutPedago(p);
    const icon = statut === "done" ? "✅" : statut === "progress" ? "⏳" : "○";
    const subText = statut === "done" ? "Validée"
                  : statut === "progress" ? "En cours"
                  : "À réaliser";
    // Note obtenue (visible seulement si validée)
    let noteHtml = "";
    if (statut === "done" && p.jalon) {
      const ev = (state.evaluations || []).find(x => x.jalon_id === p.jalon);
      if (ev && typeof ev.note_totale === "number") {
        noteHtml = `<span class="step-note">${ev.note_totale}/20</span>`;
      }
    }
    return `
      <button type="button" class="h2-step h2-step-${statut}" data-id="${p.id}" data-idx="${i}">
        <span class="step-num">${i + 1}</span>
        <span class="step-circle">
          <span class="step-emoji">${escapeHtml(p.emoji || "")}</span>
          <span class="step-status-icon">${icon}</span>
        </span>
        <span class="step-label">${escapeHtml(p.label)}</span>
        <span class="step-substatus">${subText}</span>
        ${noteHtml}
      </button>`;
  };
  const renderStepper = (items) => {
    if (!items.length) return "";
    // Calcul de la progression cumulée pour remplir la ligne en vert
    const statuts = items.map(p => statutPedago(p));
    let lastDone = -1;
    statuts.forEach((s, i) => { if (s === "done") lastDone = i; });
    let progressIdx = lastDone;
    if (progressIdx === -1) {
      // Aucune validée → si une est en cours, on remplit jusqu'à elle (à moitié)
      const firstProgress = statuts.findIndex(s => s === "progress");
      progressIdx = firstProgress >= 0 ? firstProgress - 0.5 : -1;
    } else {
      // Si la suivante est en cours, on prolonge la ligne d'un demi-pas
      if (statuts[progressIdx + 1] === "progress") progressIdx += 0.5;
    }
    // Convertit l'index en % de la ligne (entre les centres des cercles)
    const fillPct = items.length > 1 && progressIdx >= 0
      ? Math.min(100, Math.max(0, (progressIdx / (items.length - 1)) * 100))
      : 0;
    const stepsHtml = items.map((p, i) => renderStepperItem(p, i)).join("");
    return `<div class="h2-stepper" data-count="${items.length}">
      <div class="h2-stepper-line-bg"></div>
      <div class="h2-stepper-line-fill" style="width:${fillPct}%"></div>
      ${stepsHtml}
    </div>`;
  };
  const countDone = (items) => items.filter(p => statutPedago(p) === "done").length;
  const countProgress = (items) => items.filter(p => statutPedago(p) === "progress").length;

  const done1 = countDone(ann1), prog1 = countProgress(ann1), todo1 = ann1.length - done1 - prog1;
  const done2 = countDone(ann2), prog2 = countProgress(ann2), todo2 = ann2.length - done2 - prog2;

  const progress = document.createElement("section");
  progress.className = "h2-progress";
  progress.innerHTML = `
    <h3 class="h2-section-title">📅 Ma progression sur 2 ans</h3>
    <div class="h2-legend">
      <span class="h2-legend-item h2-legend-todo"><span class="h2-legend-dot"></span>○ À réaliser</span>
      <span class="h2-legend-item h2-legend-progress"><span class="h2-legend-dot"></span>⏳ En cours</span>
      <span class="h2-legend-item h2-legend-done"><span class="h2-legend-dot"></span>✅ Validée</span>
      <span class="h2-legend-hint">— Clique sur une étape pour l'ouvrir</span>
    </div>

    <div class="h2-year h2-year-1">
      <div class="h2-year-head">
        <span class="h2-year-label">ANNÉE 1 · 2025-2026</span>
        <span class="h2-year-pct">${pct1} %</span>
      </div>
      <div class="h2-bar"><div class="h2-bar-fill" style="width:${pct1}%"></div></div>
      <div class="h2-year-recap">
        <span class="recap-chip recap-done">✅ ${done1} validée${done1>1?"s":""}</span>
        <span class="recap-chip recap-progress">⏳ ${prog1} en cours</span>
        <span class="recap-chip recap-todo">○ ${todo1} à réaliser</span>
      </div>
      ${renderStepper(ann1)}
    </div>

    <div class="h2-year h2-year-2">
      <div class="h2-year-head">
        <span class="h2-year-label">ANNÉE 2 · 2026-2027</span>
        <span class="h2-year-pct">${pct2} %</span>
      </div>
      <div class="h2-bar"><div class="h2-bar-fill" style="width:${pct2}%"></div></div>
      ${pct2 === 0 && done2 === 0 && prog2 === 0
        ? `<div class="h2-locked">🔒 L'année 2 démarre en septembre 2026.</div>`
        : `<div class="h2-year-recap">
             <span class="recap-chip recap-done">✅ ${done2} validée${done2>1?"s":""}</span>
             <span class="recap-chip recap-progress">⏳ ${prog2} en cours</span>
             <span class="recap-chip recap-todo">○ ${todo2} à réaliser</span>
           </div>
           ${renderStepper(ann2)}`}
    </div>
  `;
  setTimeout(() => {
    progress.querySelectorAll(".h2-step").forEach(b => {
      b.addEventListener("click", () => selectSection(b.dataset.id));
    });
  }, 0);
  wrap.appendChild(progress);

  /* ===== 4. AUJOURD'HUI JE FAIS QUOI ? + MES VICTOIRES ===== */
  const dual = document.createElement("section");
  dual.className = "h2-dual";

  // V4.82 — Prochaine étape : 1ère non-validée pédagogiquement en année 1
  let firstNonDone = ann1.find(p => statutPedago(p) !== "done");

  // 4a. Aujourd'hui
  const todayCard = document.createElement("div");
  todayCard.className = "h2-today-card";
  if (firstNonDone) {
    const sec = state.sections.find(s => s.id === firstNonDone.id);
    const statut = statutEtape(sec);
    const verbe = statut === "progress" ? "Continue" : "Démarre";
    todayCard.innerHTML = `
      <div class="h2-card-eyebrow">🎯 Aujourd'hui je fais quoi ?</div>
      <div class="h2-today-emoji">${firstNonDone.emoji}</div>
      <div class="h2-today-titre">${escapeHtml(firstNonDone.label)}</div>
      <div class="h2-today-sub">${verbe} cette étape</div>
      <button type="button" class="btn btn-primary btn-big" id="h2-btn-today">→ Y aller</button>
    `;
    todayCard.querySelector("#h2-btn-today").addEventListener("click", () => selectSection(firstNonDone.id));
  } else {
    todayCard.innerHTML = `
      <div class="h2-card-eyebrow">🎉 Bravo</div>
      <div class="h2-today-emoji">🏆</div>
      <div class="h2-today-titre">Toutes les étapes de l'année 1 sont terminées !</div>
      <div class="h2-today-sub">Tu peux maintenant peaufiner ton œuvre.</div>
      <button type="button" class="btn btn-primary btn-big" id="h2-btn-today">→ Voir mon œuvre</button>
    `;
    todayCard.querySelector("#h2-btn-today").addEventListener("click", () => selectView("dossier"));
  }
  dual.appendChild(todayCard);

  // V4.83 — Mes résultats : graphique avec placeholders pour les évals à réaliser
  // On liste TOUTES les évaluations attendues (jalons année 1) et on affiche
  // soit la note obtenue (barre pleine), soit un placeholder "À réaliser".
  const jalonsAttendus = ann1.filter(p => p.jalon);
  const evalByJalon = {};
  (state.evaluations || []).forEach(ev => {
    if (typeof ev.note_totale === "number") evalByJalon[ev.jalon_id] = ev;
  });
  const notesObtenues = jalonsAttendus
    .map(p => evalByJalon[p.jalon])
    .filter(Boolean);
  const moyenne = notesObtenues.length
    ? (notesObtenues.reduce((s, ev) => s + (ev.note_totale || 0), 0) / notesObtenues.length).toFixed(1)
    : null;
  const aRealiser = jalonsAttendus.length - notesObtenues.length;

  const resultats = document.createElement("div");
  resultats.className = "h2-resultats-card";

  if (jalonsAttendus.length === 0) {
    // Cas extrême : aucun jalon en année 1 (improbable)
    resultats.innerHTML = `
      <div class="h2-card-eyebrow">📊 Mes résultats</div>
      <div class="h2-vict-empty">
        <div class="h2-vict-emoji">🌱</div>
        <p>Aucune auto-évaluation à passer.</p>
      </div>`;
  } else {
    const bars = jalonsAttendus.map(p => {
      const ev = evalByJalon[p.jalon];
      const label = p.label;
      if (ev) {
        const note = ev.note_totale;
        const pct = Math.max(2, Math.round(note / 20 * 100));
        const cls = note >= 16 ? "bar-tres-bien" : note >= 14 ? "bar-bien" : note >= 12 ? "bar-ok" : "bar-bas";
        return `
          <div class="h2-bar-row">
            <div class="h2-bar-label"><span class="bar-icon">✅</span>${escapeHtml(label)}</div>
            <div class="h2-bar-track">
              <div class="h2-bar-fill-note ${cls}" style="width:${pct}%"></div>
              <div class="h2-bar-value">${note}/20</div>
            </div>
          </div>`;
      } else {
        // Placeholder : barre vide "À réaliser"
        return `
          <div class="h2-bar-row h2-bar-row-todo">
            <div class="h2-bar-label"><span class="bar-icon">⏱</span>${escapeHtml(label)}</div>
            <div class="h2-bar-track h2-bar-track-todo">
              <div class="h2-bar-value h2-bar-value-todo">⏱ À réaliser</div>
            </div>
          </div>`;
      }
    }).join("");
    resultats.innerHTML = `
      <div class="h2-card-eyebrow">📊 Mes résultats — ${jalonsAttendus.length} auto-évaluation${jalonsAttendus.length>1?"s":""} en année 1</div>
      <div class="h2-bars-chart">${bars}</div>
      <div class="h2-resultats-footer">
        ${moyenne ? `<div class="h2-moyenne-block">
          <span class="h2-moyenne-label">Moyenne</span>
          <span class="h2-moyenne-val">${moyenne}<small>/20</small></span>
        </div>` : `<div class="h2-moyenne-block h2-moyenne-empty"><span class="h2-moyenne-label">Pas encore de note</span></div>`}
        <div class="h2-resultats-count">
          ${notesObtenues.length} validée${notesObtenues.length>1?"s":""} ·
          ${aRealiser} à réaliser
        </div>
      </div>
    `;
  }
  dual.appendChild(resultats);

  wrap.appendChild(dual);

  /* ===== 5. STATS RAPIDES ===== */
  const fournisseurs = fa("eco_responsable", "fournisseurs");
  const etiquettes   = fa("etiquetage", "etiquettes");
  const photosTotal = state.sections.reduce((s, sec) => s + (sec.preuves || []).filter(p => p.type === "photo").length, 0);
  const coursValides = ann1.filter(p => p.categorie === "apprendre" && statutEtape(state.sections.find(s => s.id === p.id)) === "done").length;

  const stats = document.createElement("section");
  stats.className = "h2-stats";
  stats.innerHTML = `
    <div class="h2-stat"><b>${coursValides}</b><span>cours validés</span></div>
    <div class="h2-stat"><b>${etiquettes.length}</b><span>étiquette${etiquettes.length>1?"s":""}</span></div>
    <div class="h2-stat"><b>${fournisseurs.length}</b><span>fournisseur${fournisseurs.length>1?"s":""}</span></div>
    <div class="h2-stat"><b>${photosTotal}</b><span>photo${photosTotal>1?"s":""}</span></div>
  `;
  wrap.appendChild(stats);

  /* ===== 6. RACCOURCI démo (si pas en mode démo) ===== */
  if (!demoModeActive) {
    const demoBlock = document.createElement("div");
    demoBlock.className = "h2-demo-block";
    demoBlock.innerHTML = `<button type="button" class="btn home-demo-btn" id="home-demo">👀 Voir un exemple de portfolio rempli</button>`;
    demoBlock.querySelector("#home-demo").addEventListener("click", enterDemoMode);
    wrap.appendChild(demoBlock);
  }

  return wrap;
}

/* =====================================================================
   V4.5 — VUE "MON PARCOURS"
   ---------------------------------------------------------------------
   Liste complète des 15 étapes du chef-d'œuvre, regroupée Année 1/2.
   Séparée de l'Accueil pour ne pas le surcharger.
   ===================================================================== */
function renderParcoursView() {
  const wrap = document.createElement("div");
  wrap.className = "parcours-view";

  // Barre retour
  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `<button type="button" class="btn btn-back">← Retour à l'accueil</button>`;
  back.querySelector("button").addEventListener("click", () => selectView("home"));
  wrap.appendChild(back);

  const head = document.createElement("header");
  head.className = "parcours-head parcours-head-cours";
  head.innerHTML = `
    <div class="parcours-eyebrow">📚 J'apprends</div>
    <h2>Mes cours</h2>
    <p class="hint">Toutes les notions à maîtriser pour ton chef-d'œuvre. Chaque cours se termine par une auto-évaluation notée.<br>👉 Pour la <b>création de ton projet</b>, va dans <a href="#" data-go-projet>✏️ Concevoir mon projet</a>.</p>
  `;
  wrap.appendChild(head);
  setTimeout(() => {
    const a = head.querySelector("[data-go-projet]");
    if (a) a.addEventListener("click", e => { e.preventDefault(); selectView("projet"); });
  }, 0);

  // V4.80 — On filtre : Mes cours = uniquement les sections "apprendre"
  const annee1 = PARCOURS.filter(p => !p.anneeNote && p.categorie === "apprendre");
  const annee2 = PARCOURS.filter(p => p.anneeNote && p.categorie === "apprendre");

  const renderRow = (p) => {
    // V4.77 — Vues custom (pas une section dans state.sections)
    if (p.customView) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = `parcours-row parcours-row-todo parcours-row-custom`;
      row.innerHTML = `
        <span class="parcours-row-emoji">${p.emoji}</span>
        <span class="parcours-row-label">${escapeHtml(p.label)}</span>
        <span class="parcours-row-statut">Vue projet</span>
        <span class="parcours-row-arrow">→</span>`;
      row.addEventListener("click", () => {
        currentView = { type: p.customView, id: null };
        renderSidebar(); renderMain();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      return row;
    }
    const sec = state.sections.find(s => s.id === p.id);
    if (!sec) return null;
    const statut = statutEtape(sec);
    const pct = Math.round(computeCompleteness(sec) * 100);
    let noteHtml = "";
    if (p.jalon) {
      const ev = (state.evaluations || []).find(x => x.jalon_id === p.jalon);
      if (ev) noteHtml = `<span class="parcours-row-note">Note : ${ev.note_totale}/20</span>`;
    }
    const row = document.createElement("button");
    row.type = "button";
    row.className = `parcours-row parcours-row-${statut}`;
    row.innerHTML = `
      <span class="parcours-row-emoji">${p.emoji}</span>
      <span class="parcours-row-label">${escapeHtml(p.label)}</span>
      ${noteHtml}
      <span class="parcours-row-statut">${
        statut === "done" ? "Terminé"
        : statut === "progress" ? "En cours · " + pct + "%"
        : "À faire"
      }</span>
      <span class="parcours-row-arrow">→</span>
    `;
    row.addEventListener("click", () => selectSection(p.id));
    return row;
  };

  // V4.77 — Groupement par catégorie pédagogique
  const renderCategorie = (titre, sousTitre, badge, items, accentClass) => {
    if (!items.length) return null;
    const group = document.createElement("section");
    group.className = `parcours-cat-group ${accentClass}`;
    group.innerHTML = `
      <header class="parcours-cat-head">
        <span class="parcours-cat-badge">${badge}</span>
        <div class="parcours-cat-titles">
          <h3>${escapeHtml(titre)}</h3>
          <p>${escapeHtml(sousTitre)}</p>
        </div>
      </header>
      <div class="parcours-cat-rows"></div>`;
    const rowsBox = group.querySelector(".parcours-cat-rows");
    items.forEach(p => { const r = renderRow(p); if (r) rowsBox.appendChild(r); });
    return group;
  };

  const renderAnneeBlock = (titre, sub, items) => {
    const block = document.createElement("section");
    block.className = "parcours-vue-group";
    block.innerHTML = `<h3 class="parcours-group-title-v">${escapeHtml(titre)} <span>${escapeHtml(sub)}</span></h3>`;
    const apprendre = items.filter(p => p.categorie === "apprendre");
    const projet    = items.filter(p => p.categorie === "projet");
    const autre     = items.filter(p => !p.categorie);

    const gApprendre = renderCategorie(
      "📚 J'apprends",
      "Cours, glossaire, auto-évaluations. Apprendre les notions et se faire noter.",
      "📚",
      apprendre, "cat-apprendre"
    );
    const gProjet = renderCategorie(
      "✏️ Je crée mon projet",
      "Application : ce que je remplis ici alimente mon dossier projet.",
      "✏️",
      projet, "cat-projet"
    );
    if (gApprendre) block.appendChild(gApprendre);
    if (gProjet)    block.appendChild(gProjet);
    autre.forEach(p => { const r = renderRow(p); if (r) block.appendChild(r); });
    return block;
  };

  wrap.appendChild(renderAnneeBlock("Année 1", "(2025-2026)", annee1));
  if (annee2.length) wrap.appendChild(renderAnneeBlock("Année 2", "(2026-2027)", annee2));
  return wrap;
}

/* =====================================================================
   V3 — MODULE PÉDAGOGIQUE (cours + QCM + exercice ordering)
   ---------------------------------------------------------------------
   Appelé depuis renderSection() quand une section a une propriété
   `module` dans SECTIONS_SCHEMA. Gère :
     - affichage des cours avec bouton audio (Web Speech API)
     - QCM interactif avec feedback immédiat
     - exercice "remettre dans l'ordre" (↑↓)
     - bouton d'export Word de la fiche du module
   ===================================================================== */

/* =====================================================================
   V4.73 — Glossaire + moteur de mise en forme riche (Markdown light)
   pour rendre les cours plus aérés et accessibles aux élèves de 15-16 ans.
   ===================================================================== */

/* Dictionnaire de termes techniques. Les clés (lowercase) servent à matcher
   le texte. Les `mots` listent les variantes à reconnaître. */
const GLOTERMES = {
  "marche_en_avant": {
    titre: "Marche en avant",
    mots: ["marche en avant"],
    def: "Principe d'organisation de la cuisine professionnelle : les aliments avancent toujours du sale (réception, déconditionnement) vers le propre (préparation, cuisson, distribution), sans jamais revenir en arrière.",
  },
  "contamination_croisee": {
    titre: "Contamination croisée",
    mots: ["contamination croisée", "contaminations croisées"],
    def: "Passage de bactéries d'un aliment ou d'une surface (sale, crue) vers un autre aliment (propre, prêt à manger). Exemple : utiliser le même couteau pour la viande crue et la salade.",
  },
  "dlc": {
    titre: "DLC (Date Limite de Consommation)",
    mots: ["dlc", "date limite de consommation"],
    def: "Date inscrite sur les produits frais et périssables (yaourt, viande). Après la date, l'aliment peut rendre malade. À ne pas confondre avec la DDM.",
  },
  "ddm": {
    titre: "DDM (Date de Durabilité Minimale)",
    mots: ["ddm", "date de durabilité minimale"],
    def: "Date inscrite sur les produits secs (riz, conserves). Après la date, l'aliment perd en qualité (goût, texture) mais reste consommable sans risque.",
  },
  "circuit_court": {
    titre: "Circuit court",
    mots: ["circuit court", "circuits courts"],
    def: "Vente directe ou avec un seul intermédiaire entre le producteur et le consommateur. Réduit les transports et soutient les producteurs locaux.",
  },
  "agec": {
    titre: "Loi AGEC",
    mots: ["loi agec", "agec"],
    def: "Loi française Anti-Gaspillage et Économie Circulaire (2020). Elle oblige à réduire les emballages plastiques et favorise le recyclage.",
  },
  "ab": {
    titre: "Label AB (Agriculture Biologique)",
    mots: ["label ab", "agriculture biologique"],
    def: "Logo officiel français qui garantit qu'un produit est issu de l'agriculture biologique : sans pesticides chimiques, OGM ni engrais de synthèse.",
  },
  "aop": {
    titre: "AOP (Appellation d'Origine Protégée)",
    mots: ["aop"],
    def: "Label européen qui certifie qu'un produit est fabriqué dans une zone géographique précise selon un savoir-faire reconnu (ex : Lentille verte du Puy AOP).",
  },
  "tracabilite": {
    titre: "Traçabilité",
    mots: ["traçabilité", "tracabilité"],
    def: "Possibilité de suivre un produit depuis sa production jusqu'au consommateur (qui l'a fait, où, quand). Sert à retirer un produit du marché en cas de problème.",
  },
  "allergene": {
    titre: "Allergène",
    mots: ["allergène", "allergènes"],
    def: "Substance qui peut provoquer une réaction allergique (œuf, lait, gluten, arachide…). 14 allergènes sont réglementés en Europe et doivent figurer en évidence sur l'étiquette.",
  },
  "inco": {
    titre: "Règlement INCO",
    mots: ["règlement inco", "inco"],
    def: "Règlement européen sur l'INformation du COnsommateur (2011). Il fixe les mentions obligatoires sur les étiquettes alimentaires : ingrédients, allergènes, dates, origine, etc.",
  },
  "pluridisciplinaire": {
    titre: "Pluridisciplinaire",
    mots: ["pluridisciplinaire", "pluridisciplinarité"],
    def: "Qui mobilise plusieurs disciplines (cuisine, français, gestion, sciences…). Le chef-d'œuvre est un projet pluridisciplinaire par nature.",
  },
  "demarche": {
    titre: "Démarche",
    mots: ["démarche"],
    def: "Façon dont on s'y prend pour atteindre un objectif : l'enchaînement des étapes, des choix faits, des essais et corrections. Au chef-d'œuvre, on évalue la démarche autant que le résultat.",
  },
  "saisonnalite": {
    titre: "Saisonnalité",
    mots: ["saisonnalité", "produits de saison"],
    def: "Le fait qu'un fruit ou un légume soit disponible naturellement à un moment de l'année dans une région. Manger de saison = moins de transport, plus de goût, moins cher.",
  },
  "gaspillage": {
    titre: "Gaspillage alimentaire",
    mots: ["gaspillage alimentaire", "gaspillage"],
    def: "Nourriture jetée alors qu'elle pouvait encore être consommée. En France, environ 30 kg par personne et par an. La loi impose de le réduire.",
  },
  "constituant_alimentaire": {
    titre: "Constituants alimentaires",
    mots: ["constituants alimentaires", "constituant alimentaire"],
    def: "Les éléments contenus dans la nourriture : protides (viande, œuf), glucides (riz, pâtes), lipides (huile, beurre), vitamines, minéraux, eau. Chacun a un rôle dans le corps.",
  },
  "haccp": {
    titre: "HACCP",
    mots: ["haccp"],
    def: "Méthode internationale d'analyse des risques en cuisine professionnelle. Elle impose d'identifier les points critiques (cuisson, refroidissement…) et de les maîtriser.",
  },
  "chaine_du_froid": {
    titre: "Chaîne du froid",
    mots: ["chaîne du froid", "chaine du froid"],
    def: "Maintien d'un produit frais entre 0 °C et 4 °C de sa fabrication jusqu'à sa consommation. Si elle est rompue, les bactéries se développent et l'aliment devient dangereux.",
  },
};

/* Construction d'un index de regex global pour toutes les variantes */
const GLOTERMES_REGEX = (() => {
  const all = [];
  for (const [key, entry] of Object.entries(GLOTERMES)) {
    entry.mots.forEach(m => all.push({ mot: m, key }));
  }
  // Plus longs d'abord (pour matcher "contamination croisée" avant "contamination")
  all.sort((a, b) => b.mot.length - a.mot.length);
  return all;
})();

/* Convertit un texte brut Markdown-light en HTML aéré, avec injection
   automatique des termes du glossaire (cliquables pour définition). */
function renderRichText(text) {
  if (!text) return "";
  // 1) Découpage par paragraphes (double saut de ligne)
  const blocks = String(text).split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  const renderInline = (s) => {
    // Échappement HTML d'abord
    let h = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    // Gras : **mot** → <strong>mot</strong>
    h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Glossaire (sur les segments hors balises)
    GLOTERMES_REGEX.forEach(({ mot, key }) => {
      const escaped = mot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp("(?<![\\wÀ-ÿ])(" + escaped + ")(?![\\wÀ-ÿ])", "i");
      h = h.replace(re, `<span class="glo-term" data-glo="${key}" tabindex="0" role="button" title="Cliquer pour la définition">$1</span>`);
    });
    return h;
  };

  return blocks.map(block => {
    // Encadré : > 💡 ... ou > ⚠️ ... ou > 📌 ...
    if (/^>\s*(💡|⚠️|📌)/.test(block)) {
      const m = block.match(/^>\s*(💡|⚠️|📌)\s*(.+)/s);
      const icon = m[1];
      const cls = icon === "💡" ? "encadre-astuce" : icon === "⚠️" ? "encadre-attention" : "encadre-cle";
      const content = m[2].split("\n").map(l => l.replace(/^>\s?/, "")).join(" ");
      return `<div class="cours-encadre ${cls}"><span class="enc-icon">${icon}</span><div class="enc-body">${renderInline(content)}</div></div>`;
    }
    // Liste à puces
    if (/^- /m.test(block) && block.split("\n").every(l => /^- /.test(l) || !l.trim())) {
      const items = block.split("\n").filter(l => l.trim()).map(l => `<li>${renderInline(l.replace(/^- /, ""))}</li>`).join("");
      return `<ul class="cours-list">${items}</ul>`;
    }
    // Liste numérotée
    if (/^\d+\. /m.test(block) && block.split("\n").every(l => /^\d+\. /.test(l) || !l.trim())) {
      const items = block.split("\n").filter(l => l.trim()).map(l => `<li>${renderInline(l.replace(/^\d+\.\s*/, ""))}</li>`).join("");
      return `<ol class="cours-list">${items}</ol>`;
    }
    // Sous-titre : **Texte sur ligne seule**
    const onlyBold = block.match(/^\*\*(.+)\*\*$/);
    if (onlyBold) return `<h5 class="cours-soustitre">${renderInline(onlyBold[1])}</h5>`;
    // Paragraphe normal
    return `<p class="cours-text">${renderInline(block)}</p>`;
  }).join("");
}

/* Modale qui affiche la définition d'un terme du glossaire */
function openGlossaireTerme(key) {
  const entry = GLOTERMES[key];
  if (!entry) return;
  const old = document.getElementById("glo-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "glo-modal"; m.className = "modal";
  m.innerHTML = `
    <div class="modal-content" style="max-width:480px;">
      <button class="modal-close" id="glo-close">×</button>
      <h3 style="color:var(--c-primary-dark); margin-top:0;">📖 ${entry.titre}</h3>
      <p style="font-size:1rem; line-height:1.6; margin:12px 0;">${entry.def.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</p>
      <button class="btn btn-primary" id="glo-ok" style="margin-top:8px;">J'ai compris</button>
    </div>`;
  document.body.appendChild(m);
  m.querySelector("#glo-close").addEventListener("click", () => m.remove());
  m.querySelector("#glo-ok").addEventListener("click", () => m.remove());
  m.addEventListener("click", e => { if (e.target === m) m.remove(); });
}

/* Modale qui affiche TOUT le glossaire (déclenché par le bouton sidebar) */
function openGlossaireComplet() {
  const old = document.getElementById("glo-full-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "glo-full-modal"; m.className = "modal";
  const items = Object.entries(GLOTERMES)
    .sort((a, b) => a[1].titre.localeCompare(b[1].titre, "fr"))
    .map(([k, e]) => `<div class="glo-entry"><h4>${e.titre}</h4><p>${e.def.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</p></div>`)
    .join("");
  m.innerHTML = `
    <div class="modal-content" style="max-width:680px; max-height:85vh; overflow-y:auto;">
      <button class="modal-close" id="glo-full-close">×</button>
      <h3 style="color:var(--c-primary-dark); margin-top:0;">📖 Glossaire du chef-d'œuvre</h3>
      <p class="hint" style="margin-bottom:14px;">Tous les mots techniques expliqués simplement. Tu peux aussi cliquer sur les mots soulignés dans les cours.</p>
      <div class="glo-list">${items}</div>
    </div>`;
  document.body.appendChild(m);
  m.querySelector("#glo-full-close").addEventListener("click", () => m.remove());
  m.addEventListener("click", e => { if (e.target === m) m.remove(); });
}

/* Délégation globale : un seul listener pour tous les .glo-term */
document.addEventListener("click", (e) => {
  const t = e.target.closest(".glo-term");
  if (t && t.dataset.glo) { e.preventDefault(); openGlossaireTerme(t.dataset.glo); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    const t = e.target.closest && e.target.closest(".glo-term");
    if (t && t.dataset.glo) { e.preventDefault(); openGlossaireTerme(t.dataset.glo); }
  }
});

function renderPedagogicalModule(sec, mod) {
  const wrap = document.createElement("div");
  wrap.className = "pedago-module";

  /* V4 : si chaque question QCM a un champ `lie_cours`, on affiche les
     questions juste après le cours qu'elles évaluent (apprentissage par
     petites étapes). Sinon on garde le mode "tout en bas". */
  const linkedQcm = mod.qcm && mod.qcm.length && mod.qcm.every(q => q.lie_cours);

  // --- Cours avec audio -------------------------------------------------
  const coursWrap = document.createElement("div");
  coursWrap.className = "module-cours";
  coursWrap.innerHTML = `<h3>📘 Le cours</h3><p class="hint">Clique sur 🔊 pour écouter le texte à voix haute. Réponds aux questions au fur et à mesure.</p>`;
  mod.cours.forEach(c => {
    const card = document.createElement("div");
    card.className = "cours-card";
    let html = `
      <div class="cours-head">
        <h4>${escapeHtml(c.titre)}</h4>
        <button type="button" class="btn btn-sm btn-audio" title="Écouter">🔊 Écouter</button>
      </div>
      <div class="cours-body">${renderRichText(c.texte)}</div>
    `;
    // V3.2 : image inline dans un cours (infographie ministère, etc.)
    if (c.image) {
      const src = encodeURI(c.image.fichier);
      html += `
        <figure class="cours-figure">
          <a href="${src}" target="_blank" title="Voir en grand">
            <img src="${src}" alt="${escapeHtml(c.image.legende || '')}" />
          </a>
          ${c.image.legende ? `<figcaption>${escapeHtml(c.image.legende)}</figcaption>` : ""}
        </figure>
      `;
    }
    card.innerHTML = html;
    card.id = `cours-${sec.id}-${c.id}`;  // pour pouvoir scroller depuis le feedback
    card.querySelector(".btn-audio").addEventListener("click", (ev) => {
      // V4.73 : on nettoie le Markdown léger avant lecture audio
      const cleanForSpeech = (c.texte || "")
        .replace(/\*\*(.+?)\*\*/g, "$1")           // gras
        .replace(/^>\s*(💡|⚠️|📌)\s*/gm, "")      // marqueurs encadré
        .replace(/^[-•]\s+/gm, "")                 // puces
        .replace(/^\d+\.\s+/gm, "");               // listes numérotées
      speakText(cleanForSpeech, ev.currentTarget);
    });
    coursWrap.appendChild(card);

    // V4 : si questions liées à ce cours, les afficher juste après
    if (linkedQcm) {
      const qLiees = mod.qcm.filter(q => q.lie_cours === c.id);
      if (qLiees.length) {
        const qBlock = document.createElement("div");
        qBlock.className = "qcm-after-cours";
        qBlock.innerHTML = `<div class="qcm-after-label">À toi : ${qLiees.length} question${qLiees.length>1?"s":""} pour vérifier que tu as compris</div>`;
        qLiees.forEach((q, qi) => {
          qBlock.appendChild(renderSingleQcm(sec, mod, q, mod.qcm.indexOf(q)));
        });
        coursWrap.appendChild(qBlock);
      }
    }
  });
  wrap.appendChild(coursWrap);

  // V3.2 : infographie HTML interactive (iframe)
  if (mod.infographie) {
    wrap.appendChild(renderInfographie(mod.infographie));
  }

  // V4.12 : bloc de vérification automatique (croise les sections)
  if (mod.auto_verification) {
    wrap.appendChild(renderAutoVerification());
  }

  // V4.41 — Bloc d'exercices interactifs (drag & drop) pour ce module
  wrap.appendChild(renderExosDnDBlock(sec));

  // V4.45 — Exercice spécial "Curseur chaîne du froid" pour le module éco
  if (sec.id === "eco_responsable") {
    wrap.appendChild(renderExoChaineFroid(sec));
  }

  // --- QCM (mode "tout en bas" uniquement si pas intercalé) ------------
  if (mod.qcm && mod.qcm.length && !linkedQcm) {
    wrap.appendChild(renderQcm(sec, mod));
  } else if (linkedQcm) {
    // V4 : on affiche un récap du score global en bas
    wrap.appendChild(renderQcmScoreOnly(sec, mod));
  }

  // --- Exercice ordering ou classification ----------------------------
  if (mod.exercice && mod.exercice.type === "ordering") {
    wrap.appendChild(renderOrderingExercise(sec, mod.exercice));
  } else if (mod.exercice && mod.exercice.type === "classification") {
    wrap.appendChild(renderClassificationExercise(sec, mod.exercice));
  }

  // V3.2 : bibliothèque de ressources (PDF, images, liens)
  if (mod.ressources && mod.ressources.length) {
    wrap.appendChild(renderRessources(sec, mod.ressources));
  }

  // V4.22 : raccourcis vers les outils de révision liés à ce module
  wrap.appendChild(renderModuleReviewLinks(sec, mod));

  // --- Bouton export Word + validation --------------------------------
  const actions = document.createElement("div");
  actions.className = "module-actions";
  const btnWord = document.createElement("button");
  btnWord.type = "button";
  btnWord.className = "btn btn-accent";
  btnWord.textContent = "Exporter ma fiche en Word";
  btnWord.addEventListener("click", () => exportModuleWord(sec, mod));
  actions.appendChild(btnWord);

  // V4.6 : nouvelle voie d'attestation par épreuve sérieuse
  if (mod.epreuve) {
    const st = sec.module_state;
    const ep = st.epreuve_state;
    const validee = ep && ep.validation_finale && ep.validation_finale.state === "validee";
    const noteConnue = ep && ep.note_sur_20 !== null && ep.note_sur_20 !== undefined;
    const btnEp = document.createElement("button");
    btnEp.type = "button";
    btnEp.className = validee ? "btn" : "btn btn-primary";
    btnEp.textContent = validee
      ? `Épreuve validée par l'enseignant (note actuelle : ${ep.note_sur_20}/20)`
      : noteConnue
        ? `Recommencer l'épreuve (note précédente : ${ep.note_sur_20}/20 — seuil : ${mod.epreuve.seuil}/20)`
        : "Passer l'épreuve d'attestation";
    btnEp.addEventListener("click", () => {
      // V4.61 : vérification "Es-tu prêt ?" avant l'épreuve
      // Pour la 1re tentative seulement (sinon trop intrusif aux re-tentatives)
      const dejaPasse = noteConnue;
      if (!validee && !dejaPasse && !verifierPretPourEpreuve(sec, mod)) return;
      currentView = { type: "epreuve", id: sec.id };
      renderMain(); renderSidebar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    actions.appendChild(btnEp);

    if (validee) {
      const btnAtt = document.createElement("button");
      btnAtt.type = "button";
      btnAtt.className = "btn btn-accent";
      btnAtt.textContent = "Télécharger mon attestation (Word)";
      btnAtt.addEventListener("click", () => exportAttestationOfficielle(sec, mod));
      actions.appendChild(btnAtt);
      const btnGr = document.createElement("button");
      btnGr.type = "button";
      btnGr.className = "btn";
      btnGr.textContent = "Grille d'évaluation pour l'enseignant (Word)";
      btnGr.addEventListener("click", () => exportGrilleEvaluation(sec, mod));
      actions.appendChild(btnGr);
    }
  }

  wrap.appendChild(actions);

  return wrap;
}

/* =====================================================================
   V4.7 — Helpers d'épreuve : matching mots, score, feedback
   ===================================================================== */
function normMot(s) {
  return String(s||"").toLowerCase().trim()
    .replace(/[àâäãå]/g,"a").replace(/[éèêë]/g,"e").replace(/[îï]/g,"i")
    .replace(/[ôöõ]/g,"o").replace(/[ùûü]/g,"u").replace(/[ç]/g,"c")
    .replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
}
function motMatch(reponse, cles) {
  const r = normMot(reponse);
  if (!r) return false;
  return cles.some(k => r === normMot(k) || r.includes(normMot(k)));
}
function isMotsQuestionOk(q, reponses) {
  const n = q.n_champs || 3;
  if (!Array.isArray(reponses)) return false;
  const distinct = new Set();
  reponses.forEach(r => {
    if (motMatch(r, q.cles)) distinct.add(normMot(r));
  });
  // tous les champs doivent contenir un mot reconnu (et idéalement distincts)
  return distinct.size >= n;
}
function buildEpreuveFeedback(q, isOk, sec, mode) {
  const valState = (sec.module_state.epreuve_state.validations && sec.module_state.epreuve_state.validations[q.id]);
  const forced = valState && (valState.state === "ok" || valState.state === "ko");
  const displayOk = forced ? valState.state === "ok" : isOk;
  const fb = document.createElement("div");
  fb.className = "qcm-feedback " + (displayOk ? "ok" : "ko");
  if (forced) {
    fb.innerHTML = displayOk
      ? `<b>Validé par l'enseignant.</b>`
      : `<b>Non validé par l'enseignant.</b>`;
  } else if (q.type === "qcm") {
    fb.innerHTML = isOk
      ? `<b>Bonne réponse.</b> ${q.explication ? escapeHtml(q.explication) : ""}`
      : `<b>Réponse incorrecte.</b> Bonne réponse : <b>${escapeHtml(q.options[q.correct])}</b>. ${q.explication ? escapeHtml(q.explication) : ""}`;
  } else if (q.type === "mots") {
    fb.innerHTML = isOk
      ? `<b>Réponse acceptée.</b>`
      : `<b>Réponse incomplète ou incorrecte.</b> Tu dois donner ${q.n_champs} mot(s) faisant partie des bonnes réponses attendues.`;
  }
  // V4.7 : bouton "Validation enseignant" pour modifier juste/faux d'une question auto
  if (valState && valState.modifie_le) {
    const m = document.createElement("div");
    m.className = "feedback-detail";
    m.innerHTML = `<small>Modifié par l'enseignant le ${escapeHtml(new Date(valState.modifie_le).toLocaleDateString("fr-FR"))}.${valState.commentaire ? " " + escapeHtml(valState.commentaire) : ""}</small>`;
    fb.appendChild(m);
  }
  // V4.67 : bouton "Validation enseignant" en mode enseignant (correction.html OU mode local activé)
  if (mode === "auto" && isTeacherMode()) {
    const teach = document.createElement("button");
    teach.type = "button"; teach.className = "btn btn-sm teacher-validate-btn";
    teach.textContent = "🔓 Validation enseignant";
    teach.style.marginTop = "8px";
    teach.addEventListener("click", () => openTeacherValidation(sec, q));
    fb.appendChild(teach);
  }
  return fb;
}

/* ----- V4.11 : Banque de commentaires-types pour la remédiation ----- */
const COMMENTAIRES_TYPES = {
  "Positif (M – Maîtrisé)": [
    "Très bonne réponse, bien argumentée.",
    "Vocabulaire technique maîtrisé.",
    "Connaissances solides et bien mobilisées.",
    "Bonne capacité d'analyse.",
    "Réponse claire et précise.",
    "Excellente justification.",
    "Réponse complète : tous les éléments attendus sont présents.",
    "Tous les points obtenus : maîtrise totale de la notion.",
    "Argumentation structurée, exemples pertinents.",
    "Très bonne reformulation avec tes propres mots.",
  ],
  "Justification du barème — points entiers": [
    "Tous les éléments attendus sont présents : note maximale.",
    "Réponse juste et complète : barème total accordé.",
    "Idée centrale juste, formulation claire : point complet.",
    "Compréhension démontrée + exemple concret : barème entier.",
  ],
  "Justification du barème — demi-point / partiel": [
    "Idée juste mais formulation imprécise : ½ point.",
    "1 élément attendu sur 2 cité : ½ point.",
    "2 éléments cités sur 3 attendus : barème partiel.",
    "Bonne piste mais argumentation incomplète : ½ point.",
    "Réponse correcte mais sans exemple : ½ point.",
    "Vocabulaire approximatif mais sens préservé : ½ point.",
    "L'idée est là, l'explication manque : barème partiel.",
    "Réponse trop courte pour la totalité des points : ½.",
  ],
  "Acceptable (A)": [
    "Idée juste, à approfondir avec un exemple concret.",
    "Bonne base, à préciser avec le vocabulaire technique.",
    "Réponse correcte mais peut être enrichie.",
    "Argumentation un peu courte, à développer.",
    "Sur la bonne voie, il manque encore un élément clé.",
    "Tu as compris l'essentiel, tu peux pousser plus loin.",
  ],
  "Remédiation (I / NT)": [
    "Réponse incomplète : reprendre le cours et donner plus d'éléments.",
    "Vocabulaire à préciser : utiliser les termes techniques étudiés.",
    "Donner des exemples concrets pour étayer la réponse.",
    "Erreur de définition : revoir le cours correspondant.",
    "Manque de rigueur : être plus précis dans la formulation.",
    "À retravailler : la notion n'est pas encore acquise.",
    "Confusion entre deux notions : les revoir séparément.",
    "Pas de réponse traitée : reprendre l'exercice après lecture du cours.",
    "Hors sujet : la question portait sur autre chose, relis l'énoncé.",
    "Réponse trop vague : manque de contenu précis.",
    "0 point : aucun élément attendu n'apparaît dans la réponse.",
    "Réponse non rédigée ou illisible : 0.",
  ],
  "Forme et rédaction": [
    "Phrase à structurer : sujet + verbe + complément.",
    "Attention à l'orthographe et à la ponctuation.",
    "Bien rédigé, c'est lisible et clair.",
    "Réponse trop télégraphique : rédige une vraie phrase.",
    "Bon effort de rédaction même si le contenu reste à enrichir.",
  ],
  "Encouragement / suite": [
    "Bon travail, continue dans cette voie.",
    "Tu progresses bien, garde ce rythme.",
    "C'est la bonne démarche.",
    "Bonne réflexivité, à transposer aux autres notions.",
    "Tu peux faire encore mieux à la prochaine tentative.",
    "N'hésite pas à reprendre la ressource avant de retenter.",
    "Ne te décourage pas : c'est en se trompant qu'on apprend.",
  ],
};

/* ----- Modale "Validation enseignant" pour une question -------------- */
function openTeacherValidation(sec, q) {
  // V4.18 : défensif — éviter les erreurs silencieuses si la structure manque
  if (!sec) { console.error("openTeacherValidation : sec manquant"); return; }
  if (!sec.module_state) sec.module_state = {};
  if (!sec.module_state.epreuve_state) sec.module_state.epreuve_state = { reponses: {}, validations: {} };
  if (!sec.module_state.epreuve_state.validations) sec.module_state.epreuve_state.validations = {};
  const cur = sec.module_state.epreuve_state.validations[q.id] || { state: "a_valider", commentaire: "" };

  const old = document.getElementById("teach-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "teach-modal"; m.className = "modal";
  m.innerHTML = `
    <div class="modal-content" style="max-width:520px;">
      <button class="modal-close" id="tm-close">×</button>
      <h3 style="color:var(--c-primary-dark); margin-top:0;">Validation enseignant</h3>
      <p style="font-size:.92rem; color:var(--c-muted);">Question : ${escapeHtml(q.question)}</p>
      ${q.indice_correction ? `<p style="font-size:.85rem; background:#fff8e0; padding:8px 12px; border-radius:6px;"><b>Correction attendue :</b> ${escapeHtml(q.indice_correction)}</p>` : ""}
      <div style="margin:12px 0;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">Décision rapide</label>
        <div style="display:flex; gap:6px; flex-wrap: wrap;">
          <button type="button" class="btn ${cur.state === "ok" ? "btn-accent" : ""}" data-set="ok">✅ Juste (${q.points || 1} pt${(q.points||1)>1?"s":""})</button>
          <button type="button" class="btn ${cur.state === "presque" ? "btn-warning" : ""}" data-set="presque">🟡 Partiel (½)</button>
          <button type="button" class="btn ${cur.state === "ko" ? "btn-danger" : ""}" data-set="ko">❌ Faux (0)</button>
          <button type="button" class="btn ${cur.state === "a_valider" ? "btn-primary" : ""}" data-set="a_valider">⏳ À revoir</button>
        </div>
      </div>
      <!-- V4.68 : note manuelle libre -->
      <div style="margin:12px 0; padding:10px 14px; background:#fff7e8; border:1px dashed #f0c98c; border-radius:8px;">
        <label style="display:block; font-weight:600; margin-bottom:6px; color:#6d4400;">
          🎯 Ou note manuelle (entre 0 et ${q.points || 1}, par pas de 0,5)
        </label>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="number" id="tm-note" min="0" max="${q.points || 1}" step="0.5"
            value="${cur.note_manuelle != null ? cur.note_manuelle : ""}"
            placeholder="Ex: 0.5"
            style="width:90px; padding:8px 10px; border:1px solid #d4a350; border-radius:6px; font-weight:700; font-size:1.05rem; text-align:center;" />
          <span style="color:#6d4400;">/ ${q.points || 1}</span>
          <button type="button" class="btn btn-small" id="tm-note-clear" title="Effacer la note manuelle">✕ Effacer</button>
          <small style="color:#5a6471; font-style:italic; flex-basis: 100%; margin-top:6px;">Si tu mets une note manuelle, elle remplace la décision rapide.</small>
        </div>
      </div>
      <div>
        <label style="display:block; font-weight:600; margin-bottom:6px;">Commentaire (facultatif)</label>
        <textarea id="tm-com" rows="3" style="width:100%; padding:8px; border:1px solid var(--c-border); border-radius:8px;">${escapeHtml(cur.commentaire || "")}</textarea>
      </div>
      <details class="comments-bank" style="margin-top:10px;">
        <summary style="cursor:pointer; font-size:.88rem; color:var(--c-primary-dark); font-weight:600;">
          Banque de commentaires types — cliquer pour piocher
        </summary>
        <div id="tm-bank" style="margin-top:8px; max-height:220px; overflow-y:auto; padding:6px; background:#fafbfc; border-radius:6px;"></div>
      </details>
      <div style="margin-top:14px; display:flex; gap:8px; justify-content:flex-end;">
        <button class="btn" id="tm-cancel">Annuler</button>
        <button class="btn btn-primary" id="tm-save">Enregistrer la modification</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
  let pickedState = cur.state;
  m.querySelectorAll("[data-set]").forEach(b => {
    b.addEventListener("click", () => {
      pickedState = b.dataset.set;
      m.querySelectorAll("[data-set]").forEach(x => x.classList.remove("btn-accent","btn-danger","btn-primary","btn-warning"));
      if (pickedState === "ok") b.classList.add("btn-accent");
      if (pickedState === "presque") b.classList.add("btn-warning");
      if (pickedState === "ko") b.classList.add("btn-danger");
      if (pickedState === "a_valider") b.classList.add("btn-primary");
      // V4.68 : si on choisit une décision rapide, on efface la note manuelle
      const noteInp = m.querySelector("#tm-note");
      if (noteInp) noteInp.value = "";
    });
  });
  // V4.68 : bouton effacer note manuelle
  const tmNoteClear = m.querySelector("#tm-note-clear");
  if (tmNoteClear) tmNoteClear.addEventListener("click", () => {
    m.querySelector("#tm-note").value = "";
  });
  // V4.11 — banque de commentaires : on rend chaque catégorie + chips cliquables
  const bank = m.querySelector("#tm-bank");
  if (bank) {
    let bankHtml = "";
    for (const [cat, lines] of Object.entries(COMMENTAIRES_TYPES)) {
      bankHtml += `<div class="cb-cat"><div class="cb-cat-title">${escapeHtml(cat)}</div><div class="cb-chips">`;
      lines.forEach(line => {
        bankHtml += `<button type="button" class="cb-chip" data-com="${escapeHtml(line)}">${escapeHtml(line)}</button>`;
      });
      bankHtml += `</div></div>`;
    }
    bank.innerHTML = bankHtml;
    bank.querySelectorAll(".cb-chip").forEach(b => {
      b.addEventListener("click", () => {
        const ta = m.querySelector("#tm-com");
        const txt = b.dataset.com;
        ta.value = ta.value ? (ta.value.trim() + " " + txt) : txt;
      });
    });
  }

  const close = () => m.remove();
  m.querySelector("#tm-close").addEventListener("click", close);
  m.querySelector("#tm-cancel").addEventListener("click", close);
  m.querySelector("#tm-save").addEventListener("click", () => {
    // V4.68 : note manuelle prioritaire si renseignée
    const noteInp = m.querySelector("#tm-note");
    const noteRaw = (noteInp && noteInp.value || "").trim();
    let noteManuelle = null;
    if (noteRaw !== "") {
      const n = parseFloat(noteRaw.replace(",", "."));
      const max = q.points || 1;
      if (!isNaN(n) && n >= 0 && n <= max) {
        noteManuelle = Math.round(n * 2) / 2; // arrondi à 0.5
      }
    }
    sec.module_state.epreuve_state.validations[q.id] = {
      state: pickedState,
      commentaire: m.querySelector("#tm-com").value,
      modifie_le: new Date().toISOString(),
      par: "enseignant", // V4.67
      modifie_apres_par_eleve: false,
      note_manuelle: noteManuelle, // V4.68 : null OU 0..q.points par 0.5
    };
    // Recalculer la note + sync vers Mes évaluations
    recomputeEpreuveScore(sec);
    saveState(); close(); renderMain();
  });
}

/* ----- Modale "Validation finale enseignant" pour l'attestation ----- */
function openValidationFinaleEnseignant(sec) {
  // V4.18 : défensif
  if (!sec) { console.error("openValidationFinaleEnseignant : sec manquant"); return; }
  if (!sec.module_state) sec.module_state = {};
  if (!sec.module_state.epreuve_state) sec.module_state.epreuve_state = { reponses: {} };
  const old = document.getElementById("vf-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "vf-modal"; m.className = "modal";
  const st = sec.module_state.epreuve_state;
  m.innerHTML = `
    <div class="modal-content" style="max-width:520px;">
      <button class="modal-close" id="vf-close">×</button>
      <h3 style="color:var(--c-primary-dark); margin-top:0;">Validation finale par l'enseignant·e</h3>
      <p style="font-size:.92rem;">En validant, vous confirmez que :</p>
      <ul style="font-size:.92rem; line-height:1.6;">
        <li>Les réponses ont été vérifiées (notamment les phrases rédigées).</li>
        <li>La note finale (${st.note_sur_20}/20) reflète le niveau de l'élève.</li>
        <li>L'élève peut télécharger son attestation officielle.</li>
      </ul>
      <div style="margin-top:14px;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">Nom de l'enseignant·e</label>
        <input type="text" id="vf-name" style="width:100%; padding:8px; border:1px solid var(--c-border); border-radius:8px;" placeholder="Ex : Mme Martin">
      </div>
      <div style="margin-top:10px;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">Commentaire (facultatif)</label>
        <textarea id="vf-com" rows="2" style="width:100%; padding:8px; border:1px solid var(--c-border); border-radius:8px;"></textarea>
      </div>
      <div style="margin-top:14px; display:flex; gap:8px; justify-content:flex-end;">
        <button class="btn" id="vf-cancel">Annuler</button>
        <button class="btn btn-accent" id="vf-save">Valider l'attestation</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
  m.querySelector("#vf-close").addEventListener("click", () => m.remove());
  m.querySelector("#vf-cancel").addEventListener("click", () => m.remove());
  m.querySelector("#vf-save").addEventListener("click", () => {
    sec.module_state.epreuve_state.validation_finale = {
      state: "validee",
      enseignant: m.querySelector("#vf-name").value.trim(),
      commentaire: m.querySelector("#vf-com").value.trim(),
      date: new Date().toISOString(),
    };
    syncEpreuveToEvaluations(sec);
    saveState(); m.remove(); renderMain();
  });
}

/* ----- Modale enseignant : ajustement manuel de la note finale -------- */
function openFinalNoteOverride(sec) {
  if (!sec) { console.error("openFinalNoteOverride : sec manquant"); return; }
  if (!sec.module_state) sec.module_state = {};
  if (!sec.module_state.epreuve_state) sec.module_state.epreuve_state = { reponses: {}, validations: {} };
  const st = sec.module_state.epreuve_state;
  const old = document.getElementById("note-modal");
  if (old) old.remove();

  const currentNote = st.note_sur_20 ?? st.note_calculee_sur_20 ?? 0;
  const calcNote = st.note_calculee_sur_20 ?? st.note_sur_20 ?? 0;
  const override = st.note_override && st.note_override.active ? st.note_override : null;

  const m = document.createElement("div");
  m.id = "note-modal";
  m.className = "modal";
  m.innerHTML = `
    <div class="modal-content" style="max-width:520px;">
      <button class="modal-close" id="note-close">×</button>
      <h3 style="color:var(--c-primary-dark); margin-top:0;">Modifier la note finale</h3>
      <p style="font-size:.92rem; color:var(--c-muted);">
        Note calculée automatiquement : <b>${calcNote} / 20</b>.
        Vous pouvez ajuster la note finale autant de fois que nécessaire.
      </p>
      <div style="margin-top:14px;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">Note finale sur 20</label>
        <input type="number" id="note-value" min="0" max="20" step="0.5"
          value="${escapeHtml(currentNote)}"
          style="width:100%; padding:8px; border:1px solid var(--c-border); border-radius:8px;">
      </div>
      <div style="margin-top:10px;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">Justification / commentaire (facultatif)</label>
        <textarea id="note-comment" rows="3" style="width:100%; padding:8px; border:1px solid var(--c-border); border-radius:8px;">${escapeHtml(override?.commentaire || "")}</textarea>
      </div>
      <div style="margin-top:14px; display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap;">
        ${override ? `<button class="btn btn-danger" id="note-remove">Revenir à la note automatique</button>` : ""}
        <button class="btn" id="note-cancel">Annuler</button>
        <button class="btn btn-primary" id="note-save">Enregistrer la note</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);

  const close = () => m.remove();
  m.querySelector("#note-close").addEventListener("click", close);
  m.querySelector("#note-cancel").addEventListener("click", close);
  const remove = m.querySelector("#note-remove");
  if (remove) {
    remove.addEventListener("click", () => {
      st.note_override = null;
      recomputeEpreuveScore(sec);
      saveState(); close(); renderMain();
    });
  }
  m.querySelector("#note-save").addEventListener("click", () => {
    let value = parseFloat(m.querySelector("#note-value").value);
    if (!Number.isFinite(value)) value = 0;
    value = Math.max(0, Math.min(20, Math.round(value * 10) / 10));
    st.note_sur_20 = value;
    st.note_override = {
      active: true,
      value,
      commentaire: m.querySelector("#note-comment").value.trim(),
      modifie_le: new Date().toISOString(),
    };
    syncEpreuveToEvaluations(sec);
    saveState(); close(); renderMain();
  });
}

/* ----- V4.8 : injecte la note de l'épreuve dans state.evaluations ----- */
function syncEpreuveToEvaluations(sec) {
  const schema = SECTIONS_SCHEMA.find(s => s.id === sec.id);
  const mod = schema?.module;
  if (!mod || !mod.epreuve || !mod.jalon_id) return;
  const st = sec.module_state.epreuve_state;
  if (!st || st.note_sur_20 === null) return;

  if (!Array.isArray(state.evaluations)) state.evaluations = [];

  // Calcule les niveaux par critère pour les inclure dans l'évaluation
  const ep = mod.epreuve;
  const criteresEval = (ep.criteres_grille || []).map(c => {
    const qIds = c.questions || [];
    let total = 0, ok = 0;
    qIds.forEach(qid => {
      const q = ep.questions.find(x => x.id === qid);
      if (!q) return;
      total++;
      const ans = st.reponses?.[q.id];
      const v = (st.validations || {})[q.id];
      let isOk = false;
      if (v && (v.state === "ok" || v.state === "ko")) isOk = v.state === "ok";
      else if (q.type === "qcm" || q.type === "image_choice") isOk = ans === q.correct;
      else if (q.type === "vrai_faux") isOk = ans === q.correct;
      else if (q.type === "mots") isOk = isMotsQuestionOk(q, ans);
      else if (q.type === "classify") {
        const choix = ans || {};
        isOk = q.items.every(it => choix[it.id] === it.zone);
      }
      else if (q.type === "ordering_eval") {
        const order = Array.isArray(ans) ? ans : [];
        const good = q.items.map(it => it.id);
        isOk = JSON.stringify(order) === JSON.stringify(good);
      }
      if (isOk) ok++;
    });
    if (total === 0) return null;
    const ratio = ok / total;
    let niveau, points;
    if (ratio >= 0.99) { niveau = "M"; points = 4; }
    else if (ratio >= 0.5) { niveau = "A"; points = 3; }
    else if (ratio > 0) { niveau = "I"; points = 1; }
    else { niveau = "NT"; points = 0; }
    const remediation_active = (niveau === "NT" || niveau === "I") ? c.remediation : null;
    return { id: c.label, label: c.label, capacite: c.capacite, niveau, note: points, max: 4, remediation: remediation_active };
  }).filter(Boolean);

  const ev = {
    jalon_id: mod.jalon_id,
    source: "epreuve_auto",
    criteres: criteresEval,
    note_totale: st.note_sur_20,
    note_calculee_sur_20: st.note_calculee_sur_20 ?? st.note_sur_20,
    note_override: st.note_override || null,
    commentaire: "Évaluation produite automatiquement par l'épreuve d'attestation. " +
      (st.validation_finale && st.validation_finale.state === "validee"
        ? `Validée par ${st.validation_finale.enseignant || "l'enseignant·e"}.`
        : "En attente de validation enseignant.") +
      (st.note_override && st.note_override.active
        ? ` Note finale ajustée par l'enseignant${st.note_override.commentaire ? " : " + st.note_override.commentaire : "."}`
        : ""),
    date: st.date || new Date().toISOString().slice(0,10),
    enseignant: st.validation_finale?.enseignant || "",
  };
  const idx = state.evaluations.findIndex(x => x.jalon_id === mod.jalon_id && x.source === "epreuve_auto");
  if (idx >= 0) state.evaluations[idx] = ev;
  else state.evaluations.push(ev);
}

/* ----- Recalcul de la note avec validations enseignant + note manuelle (V4.68) ---- */
function recomputeEpreuveScore(sec) {
  const ep = SECTIONS_SCHEMA.find(s => s.id === sec.id).module.epreuve;
  const st = sec.module_state.epreuve_state;
  let pointsObtenus = 0, pointsMax = 0;
  ep.questions.forEach(q => {
    const pts = q.points || 1;
    pointsMax += pts;
    const valState = (st.validations || {})[q.id];
    // V4.68 : 1) note manuelle enseignant prioritaire (peut être 0, 0.5, 1, 1.5, etc.)
    if (valState && typeof valState.note_manuelle === "number" && !isNaN(valState.note_manuelle)) {
      pointsObtenus += Math.max(0, Math.min(pts, valState.note_manuelle));
      return;
    }
    // 2) Décision rapide enseignant
    if (valState && valState.state) {
      if (valState.state === "ok")      { pointsObtenus += pts;       return; }
      if (valState.state === "presque") { pointsObtenus += pts / 2;   return; }
      if (valState.state === "ko")      {                              return; } // 0 pt
      // "a_valider" → fallback auto-correction si possible
    }
    // 3) Auto-correction
    let isOk = false;
    if (q.type === "qcm" || q.type === "image_choice") {
      isOk = st.reponses[q.id] === q.correct;
    } else if (q.type === "vrai_faux") {
      isOk = st.reponses[q.id] === q.correct;
    } else if (q.type === "mots") {
      const effN = st.mode_facile ? 1 : (q.n_champs || 3);
      const r = st.reponses[q.id];
      let count = 0;
      if (Array.isArray(r)) r.forEach(x => { if (motMatch(x, q.cles)) count++; });
      isOk = count >= effN;
    } else if (q.type === "classify") {
      // Score proportionnel aux items correctement placés
      const choix = st.reponses[q.id] || {};
      const total = q.items.length;
      const ok = q.items.filter(it => choix[it.id] === it.zone).length;
      pointsObtenus += pts * (ok / total);
      return;
    } else if (q.type === "ordering_eval") {
      const order = Array.isArray(st.reponses[q.id]) ? st.reponses[q.id] : [];
      const goodOrder = q.items.map(it => it.id);
      const okCount = order.filter((iid, idx) => goodOrder[idx] === iid).length;
      pointsObtenus += pts * (okCount / goodOrder.length);
      return;
    }
    if (isOk) pointsObtenus += pts;
  });
  const noteCalculee = pointsMax > 0 ? Math.round((pointsObtenus / pointsMax) * 20 * 10) / 10 : 0;
  st.note_brute = pointsObtenus;
  st.note_max = pointsMax;
  st.note_calculee_sur_20 = noteCalculee;
  if (!(st.note_override && st.note_override.active)) {
    st.note_sur_20 = noteCalculee;
  }
  // V4.8 : synchronise automatiquement la note dans les évaluations visibles à l'élève
  syncEpreuveToEvaluations(sec);
}

/* =====================================================================
   V4.6 — VUE ÉPREUVE D'ATTESTATION (sérieuse, sur page dédiée)
   ---------------------------------------------------------------------
   Présente une mise en situation, des questions de connaissances,
   calcule automatiquement le score, propose une remédiation si raté,
   débloque deux exports Word (attestation + grille d'évaluation).
   ===================================================================== */
function renderEpreuveView(secId) {
  const sec = state.sections.find(s => s.id === secId);
  const schema = SECTIONS_SCHEMA.find(s => s.id === secId);
  const mod = schema?.module;
  if (!mod || !mod.epreuve) {
    const err = document.createElement("div");
    err.textContent = "Pas d'épreuve disponible pour cette section.";
    return err;
  }
  const ep = mod.epreuve;
  if (!sec.module_state.epreuve_state) {
    sec.module_state.epreuve_state = { reponses: {}, note_brute: null, note_sur_20: null, date: null, tentative: 0 };
  }
  const st = sec.module_state.epreuve_state;
  if (!st.reponses) st.reponses = {};
  if (!st.validations) st.validations = {};

  const wrap = document.createElement("div");
  wrap.className = "epreuve-view";

  // Barre retour
  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `<button type="button" class="btn btn-back">← Retour à l'étape</button>`;
  back.querySelector("button").addEventListener("click", () => selectSection(secId));
  wrap.appendChild(back);

  // En-tête
  const head = document.createElement("header");
  head.className = "epreuve-head";
  head.innerHTML = `
    <div class="epreuve-eyebrow">Épreuve d'attestation</div>
    <h1>${escapeHtml(ep.titre)}</h1>
    <div class="epreuve-meta">Durée indicative : ${escapeHtml(ep.duree)} · Seuil de réussite : ${ep.seuil}/20</div>
  `;
  wrap.appendChild(head);

  // V4.69 — Toggle "Mode facile" pour les élèves fragiles
  const corrigeeForMode = st.note_sur_20 !== null;
  const modeFacile = !!st.mode_facile;
  const modeBox = document.createElement("section");
  modeBox.className = "epreuve-mode" + (modeFacile ? " on" : "");
  modeBox.innerHTML = `
    <div class="em-icon">${modeFacile ? "🌱" : "🎯"}</div>
    <div class="em-text">
      <b>${modeFacile ? "Mode facile activé" : "Niveau standard"}</b>
      <small>${modeFacile
        ? "Les questions sont simplifiées : QCM avec 2 options, mots faciles à compléter, mots-clés cliquables."
        : "Tu galères ? Active le mode facile pour des questions simplifiées."}</small>
    </div>
    <button type="button" class="btn ${modeFacile ? "" : "btn-primary"}" id="em-toggle">
      ${modeFacile ? "Revenir au niveau standard" : "🌱 Activer le mode facile"}
    </button>
  `;
  modeBox.querySelector("#em-toggle").addEventListener("click", () => {
    if (corrigeeForMode) {
      if (!confirm("Tu as déjà passé cette épreuve. Si tu changes de mode, tes réponses seront effacées.\n\nContinuer ?")) return;
      st.reponses = {};
      st.note_sur_20 = null;
      st.note_brute = null;
      st.note_calculee_sur_20 = null;
    } else if (Object.keys(st.reponses || {}).length > 0) {
      if (!confirm("Changer de mode va réinitialiser les réponses en cours.\nContinuer ?")) return;
      st.reponses = {};
    }
    st.mode_facile = !modeFacile;
    st.mode_facile_qcm = {}; // reset le mapping QCM facile
    saveState(); renderMain();
  });
  wrap.appendChild(modeBox);

  // Mise en situation
  const situ = document.createElement("section");
  situ.className = "epreuve-situation";
  situ.innerHTML = `
    <h3>Mise en situation</h3>
    <p>${escapeHtml(ep.mise_en_situation)}</p>
  `;
  wrap.appendChild(situ);

  // Questions (V4.7 : 3 types — qcm / mots / phrase)
  const qSec = document.createElement("section");
  qSec.className = "epreuve-questions";
  qSec.innerHTML = `<h3>Vos réponses</h3>`;
  const corrigee = st.note_sur_20 !== null;
  ep.questions.forEach((q, qi) => {
    const block = document.createElement("div");
    block.className = "epreuve-q epreuve-q-" + q.type;
    const typeBadge = q.type === "qcm" ? "QCM"
                    : q.type === "mots" ? "Mots à écrire"
                    : q.type === "image_choice" ? "Image à choisir"
                    : q.type === "classify" ? "Glisser-déposer"
                    : q.type === "vrai_faux" ? "Vrai / Faux"
                    : q.type === "ordering_eval" ? "À remettre dans l'ordre"
                    : "Phrase à rédiger";
    const pts = q.points || 1;
    block.innerHTML = `<div class="q-label">
      <span class="q-type-badge q-type-${q.type}">${typeBadge}</span>
      <b>${qi+1}. </b>${escapeHtml(q.question)}
      <span class="q-points">${pts} point${pts>1?"s":""}</span>
    </div>`;

    /* ===== QCM ===== */
    if (q.type === "qcm") {
      // V4.69 : mode facile = on réduit à 2 options (correct + 1 distracteur, deterministic)
      let optionIdxs = q.options.map((_, i) => i); // par défaut tous
      if (st.mode_facile) {
        if (!st.mode_facile_qcm) st.mode_facile_qcm = {};
        if (!st.mode_facile_qcm[q.id]) {
          const distractors = q.options.map((_, i) => i).filter(i => i !== q.correct);
          const distIdx = distractors[Math.floor(Math.random() * distractors.length)];
          const newOpts = [q.correct, distIdx];
          if (Math.random() > 0.5) newOpts.reverse();
          st.mode_facile_qcm[q.id] = newOpts;
        }
        optionIdxs = st.mode_facile_qcm[q.id];
      }
      const opts = document.createElement("div");
      opts.className = "qcm-options";
      optionIdxs.forEach((oi, displayIdx) => {
        const opt = q.options[oi];
        const b = document.createElement("button");
        b.type = "button"; b.className = "qcm-opt";
        b.textContent = String.fromCharCode(65 + displayIdx) + ". " + opt;
        if (st.reponses[q.id] === oi) b.classList.add("selected");
        if (corrigee) {
          b.disabled = true;
          if (oi === q.correct) b.classList.add("correct");
          if (oi === st.reponses[q.id] && oi !== q.correct) b.classList.add("wrong");
        }
        b.addEventListener("click", () => {
          if (corrigee) return;
          st.reponses[q.id] = oi;
          markResponseModified(st, q.id); // V4.67
          scheduleAutoSave(); renderMain();
        });
        opts.appendChild(b);
      });
      block.appendChild(opts);
      if (corrigee) {
        const isOk = st.reponses[q.id] === q.correct;
        block.appendChild(buildEpreuveFeedback(q, isOk, sec, "auto"));
      }
    }

    /* ===== MOTS (n champs courts, validation par mots-clés) ===== */
    if (q.type === "mots") {
      // V4.69 : mode facile = 1 seul champ + indice
      const n = st.mode_facile ? 1 : (q.n_champs || 3);
      if (!Array.isArray(st.reponses[q.id])) st.reponses[q.id] = Array(n).fill("");
      const wrapM = document.createElement("div");
      wrapM.className = "epreuve-mots";
      for (let i = 0; i < n; i++) {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.placeholder = `Réponse ${i+1}`;
        inp.value = st.reponses[q.id][i] || "";
        inp.disabled = corrigee;
        inp.addEventListener("input", () => {
          st.reponses[q.id][i] = inp.value;
          markResponseModified(st, q.id); // V4.67
          scheduleAutoSave();
        });
        wrapM.appendChild(inp);
      }
      block.appendChild(wrapM);
      if (corrigee) {
        const nbOk = (st.reponses[q.id] || []).filter(v => motMatch(v, q.cles)).length;
        const isOk = isMotsQuestionOk(q, st.reponses[q.id]);
        const fb = buildEpreuveFeedback(q, isOk, sec, "auto");
        const detail = document.createElement("div");
        detail.className = "feedback-detail";
        detail.innerHTML = `<small>${nbOk} / ${n} mot(s) reconnu(s) parmi les attendus.</small>`;
        fb.appendChild(detail);
        block.appendChild(fb);
      }
    }

    /* ===== PHRASE (rédaction, validation enseignant) ===== */
    if (q.type === "phrase") {
      const ta = document.createElement("textarea");
      ta.rows = st.mode_facile ? 2 : 3;
      ta.placeholder = st.mode_facile
        ? "Écris ta réponse simplement (1 ou 2 phrases). Tu peux cliquer les mots-clés ci-dessous pour t'aider."
        : "Écris ta réponse en quelques phrases.";
      ta.value = st.reponses[q.id] || "";
      ta.disabled = corrigee;
      ta.addEventListener("input", () => {
        st.reponses[q.id] = ta.value;
        markResponseModified(st, q.id); // V4.67
        scheduleAutoSave();
      });
      block.appendChild(ta);
      // V4.69 : mode facile = mots-clés cliquables + indice de correction visible
      if (st.mode_facile && !corrigee) {
        if (Array.isArray(q.cles) && q.cles.length) {
          const kwBox = document.createElement("div");
          kwBox.className = "phrase-mots-cles";
          kwBox.innerHTML = `<small>💡 Clique sur ces mots-clés pour les ajouter à ta réponse :</small>`;
          const row = document.createElement("div");
          row.className = "pmc-row";
          // Limiter à 8 mots-clés max pour pas surcharger
          const keys = q.cles.slice(0, 8);
          keys.forEach(k => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "pmc-chip";
            chip.textContent = "+ " + k;
            chip.addEventListener("click", () => {
              const sep = ta.value && !/[\s,.]$/.test(ta.value) ? " " : "";
              ta.value = ta.value + sep + k + " ";
              st.reponses[q.id] = ta.value;
              ta.focus();
              scheduleAutoSave();
            });
            row.appendChild(chip);
          });
          kwBox.appendChild(row);
          if (q.indice_correction) {
            const ind = document.createElement("div");
            ind.className = "pmc-indice";
            ind.innerHTML = `<small>📘 <b>Indice :</b> ${escapeHtml(q.indice_correction)}</small>`;
            kwBox.appendChild(ind);
          }
          block.appendChild(kwBox);
        }
      }
      if (corrigee) {
        // Statut par défaut : "à valider par l'enseignant".
        // L'enseignant peut basculer juste/faux + commenter.
        const valState = (st.validations && st.validations[q.id]) || { state: "a_valider" };
        const isOk = valState.state === "ok";
        const isKo = valState.state === "ko";
        const isPending = valState.state === "a_valider";
        const fb = document.createElement("div");
        fb.className = "qcm-feedback " + (isOk ? "ok" : isKo ? "ko" : "warn");
        // V4.61 : message clair pour rassurer l'élève en attente de correction
        const pendingMsg = isPending && !isTeacherMode()
          ? "📨 <b>En attente de correction par ton·ta enseignant·e</b>.<br /><small>Ta réponse a bien été enregistrée. Cette question vaut <b>0 point pour le moment</b>, mais ta note finale sera mise à jour automatiquement <b>dès que ton·ta prof aura corrigé</b>. Pas d'inquiétude 👌</small>"
          : "";
        // V4.67 : alerte si l'élève a modifié sa réponse APRÈS une validation enseignant
        const alerteModifPost = valState.modifie_apres_par_eleve
          ? `<div class="alerte-modif-post"><b>⚠️ ATTENTION ENSEIGNANT·E</b><br />L'élève a modifié sa réponse <b>APRÈS ta validation</b>${valState.modifie_apres_le ? ` (le ${escapeHtml(new Date(valState.modifie_apres_le).toLocaleString("fr-FR"))})` : ""}. Pense à revérifier sa nouvelle réponse.</div>`
          : "";
        // V4.68 : affiche la note manuelle si présente
        const noteManuelleHTML = (valState && typeof valState.note_manuelle === "number")
          ? `<br /><b style="color:#6d4400;">📝 Note attribuée : ${valState.note_manuelle} / ${q.points || 1}</b>`
          : (valState && valState.state === "presque")
            ? `<br /><b style="color:#8a5500;">🟡 Réponse partielle (½ des points)</b>`
            : "";
        const stateLabel = isOk ? "✅ Validé"
                          : isKo ? "❌ Non validé"
                          : (valState && valState.state === "presque") ? "🟡 Partiellement validé"
                          : "⏳ À valider par l'enseignant";
        fb.innerHTML = `
          <b>${stateLabel}</b>
          ${noteManuelleHTML}
          ${pendingMsg ? "<br />" + pendingMsg : ""}
          ${valState.commentaire ? "<br /><i>Commentaire : " + escapeHtml(valState.commentaire) + "</i>" : ""}
          ${valState.modifie_le ? `<br /><small>Modifié par l'enseignant le ${escapeHtml(new Date(valState.modifie_le).toLocaleDateString("fr-FR"))}</small>` : ""}
          ${q.indice_correction ? `<br /><small><b>Indice de correction :</b> ${escapeHtml(q.indice_correction)}</small>` : ""}
          ${alerteModifPost}
        `;
        block.appendChild(fb);
        // V4.67 : Bouton "Validation enseignant" si mode enseignant actif
        if (isTeacherMode()) {
          const teach = document.createElement("button");
          teach.type = "button"; teach.className = "btn btn-sm";
          teach.textContent = "🔓 Validation enseignant";
          teach.style.marginTop = "8px";
          teach.addEventListener("click", () => openTeacherValidation(sec, q));
          block.appendChild(teach);
        }
      }
    }

    /* ===== IMAGE_CHOICE (QCM avec images) ===== */
    if (q.type === "image_choice") {
      const grid = document.createElement("div");
      grid.className = "ic-grid";
      q.options.forEach((opt, oi) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "ic-card";
        if (st.reponses[q.id] === oi) card.classList.add("selected");
        if (corrigee) {
          card.disabled = true;
          if (oi === q.correct) card.classList.add("correct");
          if (oi === st.reponses[q.id] && oi !== q.correct) card.classList.add("wrong");
        }
        const src = encodeURI(opt.image || "");
        card.innerHTML = `
          <div class="ic-img-wrap"><img src="${src}" alt="${escapeHtml(opt.label || '')}" /></div>
          <div class="ic-label">${escapeHtml(opt.label || '')}</div>`;
        card.addEventListener("click", () => {
          if (corrigee) return;
          st.reponses[q.id] = oi;
          markResponseModified(st, q.id);
          scheduleAutoSave(); renderMain();
        });
        grid.appendChild(card);
      });
      block.appendChild(grid);
      if (corrigee) {
        const isOk = st.reponses[q.id] === q.correct;
        block.appendChild(buildEpreuveFeedback(q, isOk, sec, "auto"));
      }
    }

    /* ===== VRAI / FAUX ===== */
    if (q.type === "vrai_faux") {
      const opts = document.createElement("div");
      opts.className = "vf-options";
      [{ v: true, l: "✅ Vrai" }, { v: false, l: "❌ Faux" }].forEach(({ v, l }) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "vf-opt";
        b.textContent = l;
        if (st.reponses[q.id] === v) b.classList.add("selected");
        if (corrigee) {
          b.disabled = true;
          if (v === q.correct) b.classList.add("correct");
          if (v === st.reponses[q.id] && v !== q.correct) b.classList.add("wrong");
        }
        b.addEventListener("click", () => {
          if (corrigee) return;
          st.reponses[q.id] = v;
          markResponseModified(st, q.id);
          scheduleAutoSave(); renderMain();
        });
        opts.appendChild(b);
      });
      block.appendChild(opts);
      if (corrigee) {
        const isOk = st.reponses[q.id] === q.correct;
        block.appendChild(buildEpreuveFeedback(q, isOk, sec, "auto"));
      }
    }

    /* ===== CLASSIFY (placer chaque item dans la bonne zone) ===== */
    if (q.type === "classify") {
      if (!st.reponses[q.id] || typeof st.reponses[q.id] !== "object" || Array.isArray(st.reponses[q.id])) {
        st.reponses[q.id] = {};
      }
      const choix = st.reponses[q.id];
      const wrapC = document.createElement("div");
      wrapC.className = "classify-wrap";
      const consigne = document.createElement("div");
      consigne.className = "classify-consigne";
      consigne.innerHTML = `<small>Pour chaque élément, clique sur la zone à laquelle il appartient.</small>`;
      wrapC.appendChild(consigne);
      const list = document.createElement("div");
      list.className = "classify-list";
      q.items.forEach(it => {
        const row = document.createElement("div");
        row.className = "classify-item";
        const itemOk = corrigee ? (choix[it.id] === it.zone) : null;
        if (itemOk === true) row.classList.add("correct");
        if (itemOk === false) row.classList.add("wrong");
        const labelHtml = it.image
          ? `<div class="classify-thumb"><img src="${encodeURI(it.image)}" alt="${escapeHtml(it.label)}"/></div><div class="classify-text">${escapeHtml(it.label)}</div>`
          : `<div class="classify-text">${escapeHtml(it.label)}</div>`;
        const btns = q.zones.map(z => {
          const sel = choix[it.id] === z.id ? " selected" : "";
          const disp = corrigee && z.id === it.zone ? " is-good" : "";
          return `<button type="button" class="cz-btn cz-${z.id}${sel}${disp}" data-item="${it.id}" data-zone="${z.id}" ${corrigee ? "disabled" : ""}>${escapeHtml(z.label)}</button>`;
        }).join("");
        row.innerHTML = `<div class="classify-label">${labelHtml}</div><div class="classify-zones">${btns}</div>`;
        list.appendChild(row);
      });
      wrapC.appendChild(list);
      block.appendChild(wrapC);
      list.addEventListener("click", e => {
        const b = e.target.closest(".cz-btn");
        if (!b || corrigee) return;
        const itemId = b.dataset.item, zoneId = b.dataset.zone;
        choix[itemId] = zoneId;
        markResponseModified(st, q.id);
        scheduleAutoSave(); renderMain();
      });
      if (corrigee) {
        const total = q.items.length;
        const ok = q.items.filter(it => choix[it.id] === it.zone).length;
        const isOk = ok === total;
        const fb = buildEpreuveFeedback(q, isOk, sec, "auto");
        const detail = document.createElement("div");
        detail.className = "feedback-detail";
        detail.innerHTML = `<small>${ok} / ${total} éléments correctement placés.</small>`;
        fb.appendChild(detail);
        block.appendChild(fb);
      }
    }

    /* ===== ORDERING_EVAL (remettre des étapes dans l'ordre, dans l'épreuve) ===== */
    if (q.type === "ordering_eval") {
      if (!Array.isArray(st.reponses[q.id])) {
        st.reponses[q.id] = q.items.map(it => it.id).slice().sort(() => Math.random() - 0.5);
      }
      const order = st.reponses[q.id];
      const wrapO = document.createElement("div");
      wrapO.className = "ord-wrap";
      const ul = document.createElement("ol");
      ul.className = "ord-list";
      order.forEach((iid, idx) => {
        const item = q.items.find(it => it.id === iid);
        if (!item) return;
        const li = document.createElement("li");
        li.className = "ord-item";
        if (corrigee) {
          const correctIdx = q.items.findIndex(it => it.id === iid);
          if (correctIdx === idx) li.classList.add("correct");
          else li.classList.add("wrong");
        }
        li.innerHTML = `
          <span class="ord-text">${escapeHtml(item.label)}</span>
          <span class="ord-controls">
            <button type="button" class="ord-up" ${idx === 0 || corrigee ? "disabled" : ""} aria-label="Monter">▲</button>
            <button type="button" class="ord-down" ${idx === order.length - 1 || corrigee ? "disabled" : ""} aria-label="Descendre">▼</button>
          </span>`;
        li.querySelector(".ord-up").addEventListener("click", () => {
          if (idx === 0 || corrigee) return;
          [order[idx-1], order[idx]] = [order[idx], order[idx-1]];
          markResponseModified(st, q.id); scheduleAutoSave(); renderMain();
        });
        li.querySelector(".ord-down").addEventListener("click", () => {
          if (idx === order.length - 1 || corrigee) return;
          [order[idx+1], order[idx]] = [order[idx], order[idx+1]];
          markResponseModified(st, q.id); scheduleAutoSave(); renderMain();
        });
        ul.appendChild(li);
      });
      wrapO.appendChild(ul);
      block.appendChild(wrapO);
      if (corrigee) {
        const goodOrder = q.items.map(it => it.id);
        const isOk = JSON.stringify(order) === JSON.stringify(goodOrder);
        const okCount = order.filter((iid, idx) => goodOrder[idx] === iid).length;
        const fb = buildEpreuveFeedback(q, isOk, sec, "auto");
        const detail = document.createElement("div");
        detail.className = "feedback-detail";
        detail.innerHTML = `<small>${okCount} / ${order.length} étapes à la bonne place.</small>`;
        fb.appendChild(detail);
        block.appendChild(fb);
      }
    }

    qSec.appendChild(block);
  });
  wrap.appendChild(qSec);

  // Bouton de validation / résultat
  const actionBox = document.createElement("section");
  actionBox.className = "epreuve-action";

  if (st.note_sur_20 === null) {
    const answeredCount = ep.questions.filter(q => {
      const ans = st.reponses[q.id];
      if (ans === undefined || ans === null) return false;
      if (Array.isArray(ans)) return ans.some(v => String(v || "").trim());
      return String(ans).trim() !== "";
    }).length;
    const missingCount = ep.questions.length - answeredCount;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-primary btn-lg";
    btn.textContent = "Valider mon épreuve";
    if (missingCount > 0) {
      const info = document.createElement("p");
      info.className = "hint";
      info.textContent = `${missingCount} question(s) sans réponse : tu peux quand même valider. Elles compteront 0 ou seront vérifiées par l'enseignant.`;
      actionBox.appendChild(info);
    }
    btn.addEventListener("click", () => {
      // V4.7 : calcul mixte (QCM + mots auto + phrases en attente enseignant)
      st.date = new Date().toISOString().slice(0, 10);
      st.tentative = (st.tentative || 0) + 1;
      st.validations = st.validations || {};
      ep.questions.forEach(q => {
        if (q.type === "phrase" && !st.validations[q.id]) {
          st.validations[q.id] = { state: "a_valider", commentaire: "" };
        }
      });
      recomputeEpreuveScore(sec);
      saveState(); renderMain();
      // V4.29 : auto-évaluation rapide après épreuve
      setTimeout(() => showAutoEvalEpreuve(sec, ep), 600);
    });
    actionBox.appendChild(btn);
  } else {
    const reussi = st.note_sur_20 >= ep.seuil;
    const noteOverrideActive = st.note_override && st.note_override.active;
    const noteAuto = st.note_calculee_sur_20 ?? st.note_sur_20;
    actionBox.innerHTML = `
      <div class="epreuve-result ${reussi ? "ok" : "ko"}">
        <div class="er-eyebrow">Résultat — Tentative ${st.tentative}</div>
        <div class="er-note">${st.note_sur_20} <small>/ 20</small></div>
        ${noteOverrideActive ? `<div class="er-msg"><small>Note finale ajustée par l'enseignant·e. Calcul automatique : ${noteAuto} / 20.</small></div>` : ""}
        <div class="er-msg">
          ${reussi
            ? "Note au-dessus du seuil. Ton enseignant·e doit maintenant valider l'attestation pour que tu puisses la télécharger."
            : `Note actuellement en dessous du seuil (${ep.seuil}/20). L'enseignant·e peut corriger les questions ; la note automatique sera recalculée. La note finale peut aussi être ajustée manuellement.`}
        </div>
      </div>
    `;
    /* =====================================================================
       V4.17 — Espace enseignant unifié
       Quel que soit le score (réussi ou en dessous du seuil), l'enseignant
       peut TOUJOURS :
         - corriger les questions à phrase (boutons sur chaque question)
         - valider l'attestation (avec confirmation si en dessous du seuil)
         - télécharger l'attestation Word et la grille d'évaluation Word
       L'élève peut toujours recommencer l'épreuve.
       ===================================================================== */
    const validee = st.validation_finale && st.validation_finale.state === "validee";
    const aValider = ep.questions.some(q => q.type === "phrase" &&
      (!(st.validations && st.validations[q.id]) || st.validations[q.id].state === "a_valider"));

    // 1) Remédiation (QCM ratés) — utile à l'élève quel que soit le seuil
    const remed = document.createElement("div");
    remed.className = "epreuve-remediation";
    remed.innerHTML = `<h3>${reussi ? "Points à consolider" : "Points à retravailler"}</h3>`;
    const list = document.createElement("ul");
    ep.questions.forEach((q, qi) => {
      if (q.type !== "qcm") return;
      if (st.reponses[q.id] !== q.correct) {
        const li = document.createElement("li");
        li.innerHTML = `<b>Question ${qi+1} :</b> ${escapeHtml(q.question)}<br /><i>Bonne réponse : ${escapeHtml(q.options[q.correct])}</i>${q.explication ? "<br />" + escapeHtml(q.explication) : ""}`;
        list.appendChild(li);
      }
    });
    if (list.children.length > 0) {
      remed.appendChild(list);
      actionBox.appendChild(remed);
    }

    // 2) ESPACE ENSEIGNANT
    // V4.60 : visible UNIQUEMENT dans correction.html (pas pour l'élève seul).
    // Si validée, l'élève voit juste un bandeau "Attestation validée" sans boutons.
    const teach = document.createElement("div");
    teach.className = "epreuve-await-teacher" + (validee ? " ok" : "");
    if (validee) {
      // Cas A : attestation déjà validée par l'enseignant
      teach.innerHTML = `
        <h3>✅ Attestation validée</h3>
        <p>Validée par <b>${escapeHtml(st.validation_finale.enseignant || "—")}</b>
        ${st.validation_finale.date ? " — " + escapeHtml(new Date(st.validation_finale.date).toLocaleDateString("fr-FR")) : ""}</p>
        ${st.validation_finale.commentaire ? `<p><i>« ${escapeHtml(st.validation_finale.commentaire)} »</i></p>` : ""}
      `;
      // L'élève peut télécharger son attestation officielle (récompense)
      const btnA = document.createElement("button");
      btnA.type = "button"; btnA.className = "btn btn-accent btn-lg";
      btnA.textContent = "🏆 Télécharger mon attestation (Word)";
      btnA.style.marginTop = "8px";
      btnA.addEventListener("click", () => exportAttestationOfficielle(sec, mod));
      teach.appendChild(btnA);

      // V4.67 : Bouton "Retirer la validation" en mode enseignant
      if (isTeacherMode()) {
        const btnUndo = document.createElement("button");
        btnUndo.type = "button"; btnUndo.className = "btn";
        btnUndo.textContent = "Retirer la validation (enseignant)";
        btnUndo.style.marginTop = "6px";
        btnUndo.style.marginLeft = "6px";
        btnUndo.style.fontSize = ".85rem";
        btnUndo.addEventListener("click", () => {
          if (!confirm("Retirer la validation enseignant ?")) return;
          st.validation_finale = { state: "en_attente" };
          syncEpreuveToEvaluations(sec);
          saveState(); renderMain();
        });
        teach.appendChild(btnUndo);
      }
    } else if (isTeacherMode()) {
      // V4.67 — Cas B : pas encore validée, mode enseignant actif
      teach.innerHTML = `
        <h3>🔓 Espace enseignant</h3>
        <p>Note actuelle : <b>${st.note_sur_20} / 20</b>
        ${reussi ? "(au-dessus du seuil de " + ep.seuil + "/20)" : "(en dessous du seuil de " + ep.seuil + "/20)"}.</p>
        <p>Tu peux corriger chaque question ci-dessus (bouton « 🔓 Validation enseignant »).
           La note automatique se recalcule, et la note finale peut aussi être ajustée manuellement.</p>
      `;
      if (aValider) {
        const w = document.createElement("p");
        w.style.color = "#8a5a00";
        w.style.fontWeight = "600";
        w.innerHTML = "⚠ Certaines questions à phrase doivent encore être corrigées.";
        teach.appendChild(w);
      }
      const btnVal = document.createElement("button");
      btnVal.type = "button";
      btnVal.className = reussi ? "btn btn-primary btn-lg" : "btn btn-danger btn-lg";
      btnVal.textContent = reussi
        ? "Valider l'attestation (enseignant)"
        : "Valider l'attestation malgré tout (sous le seuil)";
      btnVal.style.marginTop = "8px";
      btnVal.addEventListener("click", () => {
        if (!reussi && !confirm("L'élève est en dessous du seuil de validation (" + ep.seuil + "/20).\nValider l'attestation quand même ?\n\nCela doit être un cas exceptionnel justifié (ex : difficulté spécifique, cohérence pédagogique).")) return;
        openValidationFinaleEnseignant(sec);
      });
      teach.appendChild(btnVal);
    }

    // V4.60 : 3) Note ajustée affichée pour info à l'élève (lecture seule)
    if (st.note_override && st.note_override.active) {
      const noteInfo = document.createElement("p");
      noteInfo.style.marginTop = "10px";
      noteInfo.innerHTML = `<b>Note finale ajustée :</b> ${escapeHtml(st.note_sur_20)} / 20
        <small>(calcul automatique : ${escapeHtml(st.note_calculee_sur_20 ?? st.note_sur_20)} / 20)</small>
        ${st.note_override.commentaire ? `<br /><i>${escapeHtml(st.note_override.commentaire)}</i>` : ""}`;
      teach.appendChild(noteInfo);
    }
    // 3-bis) Bouton "Modifier la note finale" : en mode enseignant
    if (isTeacherMode()) {
      const btnNote = document.createElement("button");
      btnNote.type = "button";
      btnNote.className = "btn";
      btnNote.textContent = "Modifier la note finale (enseignant)";
      btnNote.style.marginTop = "8px";
      btnNote.style.marginRight = "6px";
      btnNote.addEventListener("click", () => openFinalNoteOverride(sec));
      teach.appendChild(btnNote);

      // 4) Grille d'évaluation Word — UNIQUEMENT côté enseignant
      const btnG = document.createElement("button");
      btnG.type = "button"; btnG.className = "btn";
      btnG.textContent = "Télécharger la grille d'évaluation (Word)";
      btnG.style.marginTop = "8px";
      btnG.style.display = "block";
      btnG.addEventListener("click", () => exportGrilleEvaluation(sec, mod));
      teach.appendChild(btnG);
    }

    actionBox.appendChild(teach);

    // 5) Bouton "Recommencer" — pour l'élève
    const btnReset = document.createElement("button");
    btnReset.type = "button"; btnReset.className = "btn";
    btnReset.textContent = "Recommencer l'épreuve";
    btnReset.style.marginTop = "14px";
    btnReset.addEventListener("click", () => {
      if (!confirm("Recommencer l'épreuve effacera les réponses précédentes (les notes restent dans Mes évaluations).\nContinuer ?")) return;
      st.reponses = {}; st.note_brute = null; st.note_sur_20 = null; st.date = null;
      st.note_calculee_sur_20 = null; st.note_override = null;
      st.validations = {}; st.validation_finale = null;
      saveState(); renderMain();
    });
    actionBox.appendChild(btnReset);
  }
  wrap.appendChild(actionBox);
  return wrap;
}

/* ---------- ATTESTATION OFFICIELLE (Word, paysage, sérieuse, sans emojis) ---------- */
function exportAttestationOfficielle(sec, mod) {
  syncIdentiteToInfos();
  const e = state.infos_eleve;
  const ep = mod.epreuve;
  const st = sec.module_state.epreuve_state;
  const date = (st && st.date) ? new Date(st.date).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR");

  // V4.71 — Mention selon la note
  const noteEleve = (st && typeof st.note_sur_20 === "number") ? st.note_sur_20 : 0;
  let mention = "Acquis";
  if (noteEleve >= 18) mention = "Excellent — Félicitations du jury";
  else if (noteEleve >= 16) mention = "Très bien";
  else if (noteEleve >= 14) mention = "Bien";
  else if (noteEleve >= 12) mention = "Assez bien";

  // Thème court (sans le préfixe « Épreuve d'attestation — »)
  const themeAttestation = (ep.titre || "")
    .replace(/^Épreuve d'attestation\s*[—–-]\s*/i, "")
    .replace(/^Épreuve\s*[—–-]\s*/i, "")
    .trim();

  // Nom de l'enseignant·e (s'il a validé l'attestation)
  const enseignantNom = (st && st.validation_finale && st.validation_finale.enseignant) || "";

  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>Attestation officielle — Chef-d'œuvre CAP</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  @page WordSection1 { size: 29.7cm 21cm; mso-page-orientation: landscape; margin: 1cm; }
  div.WordSection1 { page: WordSection1; }
  body { font-family: "Garamond", "Times New Roman", serif; color: #1a2330; margin: 0; padding: 0; }
  .att-outer { border: 5pt double #1f3a68; padding: 6pt; }
  .att-inner { border: 1pt solid #c9a14a; padding: 18pt 40pt 14pt; text-align: center; }
  .att-republic { font-size: 9.5pt; letter-spacing: .42em; text-transform: uppercase; color: #1f3a68; font-weight: 700; }
  .att-program { font-size: 9pt; letter-spacing: .25em; text-transform: uppercase; color: #6b7785; margin-top: 2pt; }
  .att-rule { border: 0; border-top: .8pt solid #c9a14a; width: 60%; margin: 10pt auto 6pt; }
  .att-orn { color: #c9a14a; font-size: 14pt; letter-spacing: .8em; margin: 4pt 0 2pt; }
  .att-title { color: #1f3a68; font-size: 38pt; font-weight: 700; letter-spacing: .04em; margin: 4pt 0 2pt; font-variant: small-caps; }
  .att-subtitle { color: #2e6b3f; font-size: 17pt; font-style: italic; margin: 0 0 14pt; }
  .att-delivree { font-size: 12pt; color: #444; letter-spacing: .15em; text-transform: uppercase; margin: 8pt 0 2pt; }
  .att-name { font-size: 30pt; font-style: italic; color: #1a2330; margin: 2pt 0 4pt; }
  .att-name-rule { border: 0; border-top: .5pt solid #aaa; width: 42%; margin: 0 auto 8pt; }
  .att-classe { font-size: 11pt; color: #555; margin-bottom: 14pt; }
  .att-text { font-size: 13pt; line-height: 1.65; margin: 6pt auto; max-width: 22cm; color: #1a2330; }
  .att-text b { color: #1f3a68; }
  .att-medaille-wrap { margin: 14pt 0 8pt; }
  .att-medaille { display: inline-block; border: 2.5pt solid #c9a14a; border-radius: 50%; width: 3.6cm; height: 3.6cm; line-height: 3.6cm; background: #fdf8ec; color: #1f3a68; font-size: 30pt; font-weight: 700; vertical-align: middle; }
  .att-mention { font-size: 14pt; font-style: italic; color: #2e6b3f; margin-top: 4pt; }
  .att-foot-table { width: 100%; margin-top: 18pt; border-collapse: collapse; }
  .att-foot-table td { width: 50%; vertical-align: top; padding: 0 6pt; font-size: 10.5pt; color: #1a2330; }
  .att-sig-rule { border: 0; border-top: .5pt solid #555; margin: 22pt 12pt 4pt; }
  .att-sig-label { font-size: 9pt; color: #6b7785; letter-spacing: .12em; text-transform: uppercase; }
  .att-ref { margin-top: 10pt; font-size: 8pt; color: #8a93a0; font-style: italic; letter-spacing: .03em; }
</style></head>
<body><div class="WordSection1">
  <div class="att-outer">
    <div class="att-inner">
      <div class="att-republic">Certificat d'aptitude professionnelle &middot; Chef-d'œuvre</div>
      <div class="att-orn">&#10086; &#10022; &#10086;</div>
      <div class="att-title">Attestation de connaissances</div>
      <div class="att-subtitle">${escapeHtml(themeAttestation)}</div>
      <hr class="att-rule" />

      <div class="att-delivree">Délivrée à</div>
      <div class="att-name">${escapeHtml(((e.prenom||"") + " " + (e.nom||"")).trim()) || "—"}</div>
      <hr class="att-name-rule" />
      <div class="att-classe">
        ${e.classe ? escapeHtml(e.classe) : ""}${e.lycee ? " &middot; " + escapeHtml(e.lycee) : ""}${e.annee_scolaire ? " &middot; année scolaire " + escapeHtml(e.annee_scolaire) : ""}
      </div>

      <p class="att-text">
        A satisfait avec succès aux exigences de l'épreuve d'attestation portant sur
        <b>${escapeHtml(themeAttestation)}</b> et démontré la maîtrise des connaissances et
        des capacités attendues à ce stade du chef-d'œuvre du certificat d'aptitude professionnelle.
      </p>

      <div class="att-medaille-wrap">
        <div class="att-mention">Mention&nbsp;: ${escapeHtml(mention)}</div>
      </div>

      <table class="att-foot-table">
        <tr>
          <td style="text-align:left;">
            <hr class="att-sig-rule" style="margin-left:0;" />
            <div class="att-sig-label">Délivrée le</div>
            <div style="font-size:11pt; margin-top:2pt;">${escapeHtml(date)}</div>
          </td>
          <td style="text-align:right;">
            <hr class="att-sig-rule" style="margin-right:0;" />
            <div class="att-sig-label">Signature de l'enseignant·e</div>
            <div style="font-size:11pt; margin-top:2pt; font-style:italic;">${escapeHtml(enseignantNom) || "&nbsp;"}</div>
          </td>
        </tr>
      </table>

    </div>
  </div>
</div></body></html>`;
  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const n = (e.nom || "eleve").replace(/\s+/g, "_");
  a.href = url;
  a.download = `Attestation_${ep.id}_${n}_${new Date().toISOString().slice(0,10)}.doc`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

/* ---------- GRILLE D'ÉVALUATION POUR L'ENSEIGNANT (Word, sérieuse, V4.8) ----------
   Inclut : objectif avec verbe d'action, critères + indicateurs + capacités,
   niveaux NT/I/A/M cochés automatiquement à partir des réponses, note totale,
   remédiations CIBLÉES par critère faiblement réussi. */
function exportGrilleEvaluation(sec, mod) {
  syncIdentiteToInfos();
  const e = state.infos_eleve;
  const ep = mod.epreuve;
  const st = sec.module_state.epreuve_state || {};
  const date = (st.date) ? new Date(st.date).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR");

  // Calcule niveau NT/I/A/M par critère selon la performance sur ses questions.
  // Règles : 100% bonnes = M, ≥50% = A, >0% = I, sinon NT.
  const evalCritere = (crit) => {
    const qIds = crit.questions || [];
    let total = 0, ok = 0, nbReponses = 0;
    qIds.forEach(qid => {
      const q = ep.questions.find(x => x.id === qid);
      if (!q) return;
      total++;
      const ans = st.reponses?.[q.id];
      const v = (st.validations || {})[q.id];
      if (ans !== undefined && ans !== null && (Array.isArray(ans) ? ans.some(x => x) : true)) nbReponses++;
      let isOk = false;
      if (v && (v.state === "ok" || v.state === "ko")) isOk = v.state === "ok";
      else if (q.type === "qcm" || q.type === "image_choice") isOk = ans === q.correct;
      else if (q.type === "vrai_faux") isOk = ans === q.correct;
      else if (q.type === "mots") isOk = isMotsQuestionOk(q, ans);
      else if (q.type === "classify") {
        const choix = ans || {};
        isOk = q.items.every(it => choix[it.id] === it.zone);
      }
      else if (q.type === "ordering_eval") {
        const order = Array.isArray(ans) ? ans : [];
        const good = q.items.map(it => it.id);
        isOk = JSON.stringify(order) === JSON.stringify(good);
      }
      if (isOk) ok++;
    });
    if (total === 0) return { niveau: "NT", points: 0 };
    if (nbReponses === 0) return { niveau: "NT", points: 0 };
    const ratio = ok / total;
    if (ratio >= 0.99) return { niveau: "M", points: 4 };
    if (ratio >= 0.5)  return { niveau: "A", points: 3 };
    if (ratio > 0)     return { niveau: "I", points: 1 };
    return { niveau: "NT", points: 0 };
  };

  // V4.19 — La note finale est TOUJOURS st.note_sur_20 (la vraie note calculée
  // à partir des points par question). Les niveaux NT/I/A/M par critère sont
  // affichés comme indicateurs visuels mais ne sont PAS sommés (sinon
  // incohérence avec la note vue par l'élève dans Mes évaluations).
  const critRows = (ep.criteres_grille || []).map((c, i) => {
    const r = evalCritere(c);
    const cell = (lvl) => `<td style="text-align:center; ${r.niveau === lvl ? "background:#1f4f86; color:#fff; font-weight:700;" : ""}">${r.niveau === lvl ? "✓" : ""}</td>`;
    return `<tr>
      <td style="text-align:center; font-weight:700;">${i+1}</td>
      <td><b>${escapeHtml(c.label)}</b><br /><span style="font-size:9pt; color:#444;">Capacité : ${escapeHtml(c.capacite || "")}</span></td>
      <td style="font-size:9pt;">${escapeHtml(c.indicateur || "")}</td>
      ${cell("NT")}${cell("I")}${cell("A")}${cell("M")}
    </tr>`;
  }).join("");

  // Note finale = la VRAIE note de l'épreuve (cohérente avec Mes évaluations
  // et avec ce que voit l'élève dans son écran d'épreuve).
  const noteG = st.note_sur_20 ?? 0;
  // Si l'enseignant a ajusté manuellement, on récupère la note auto pour info
  const noteOverrideActive = st.note_override && st.note_override.active;
  const noteAutoCalculee = st.note_calculee_sur_20;
  const noteOverrideRow = noteOverrideActive
    ? `<tr><th>Note finale ajustée</th><td>${escapeHtml(noteG)} / 20
        <br /><small>Note automatique calculée : ${escapeHtml(noteAutoCalculee ?? "—")} / 20${st.note_override.commentaire ? " — " + escapeHtml(st.note_override.commentaire) : ""}</small></td></tr>`
    : "";

  // Remédiations ciblées : ne lister que les critères avec niveau < A
  const remediations = (ep.criteres_grille || [])
    .map(c => ({ c, r: evalCritere(c) }))
    .filter(x => x.r.niveau === "NT" || x.r.niveau === "I")
    .map(x => `<li><b>${escapeHtml(x.c.label)}</b> — ${escapeHtml(x.c.remediation || "À retravailler.")}</li>`)
    .join("");

  // Points forts : critères au niveau M
  const pointsForts = (ep.criteres_grille || [])
    .map(c => ({ c, r: evalCritere(c) }))
    .filter(x => x.r.niveau === "M")
    .map(x => `<li>${escapeHtml(x.c.capacite || x.c.label)}</li>`)
    .join("");

  // Points à consolider : critères A
  const pointsConsolider = (ep.criteres_grille || [])
    .map(c => ({ c, r: evalCritere(c) }))
    .filter(x => x.r.niveau === "A")
    .map(x => `<li>${escapeHtml(x.c.capacite || x.c.label)} — bien acquis, à consolider sur des cas plus variés.</li>`)
    .join("");

  // V4.70 — « Être capable de/d' » + objectif avec verbe à l'infinitif (sans pastille).
  // Le champ `objectif` commence déjà par un verbe à l'infinitif → on le passe
  // en minuscule et on gère l'élision (de/d') selon la 1re lettre.
  let objectifTexte = mod.epreuve.objectif || "Composer une assiette équilibrée respectant la règle ½ légumes / ¼ féculents / ¼ protéines.";
  const firstChar = (objectifTexte.charAt(0) || "").toLowerCase();
  const voyellesOuH = "aeiouhâàäéèêëîïôöùûüy";
  const liaison = voyellesOuH.includes(firstChar) ? "d'" : "de ";
  const objectifMinuscule = objectifTexte.charAt(0).toLowerCase() + objectifTexte.slice(1);

  // V4.70 — Titre court « Évaluation — <thème> » (sans Année)
  const themeBrut = (ep.titre || "")
    .replace(/^Épreuve d'attestation\s*[—–-]\s*/i, "")
    .replace(/^Épreuve\s*[—–-]\s*/i, "")
    .trim();
  const titreCourt = `Évaluation — ${themeBrut}`;

  // Statut
  const reussi = (noteG >= ep.seuil);
  const validationFinaleOk = st.validation_finale && st.validation_finale.state === "validee";
  const statutLabel = validationFinaleOk
    ? `<b style="color:#1f6b3d;">VALIDÉE</b> — Validation finale enseignant·e enregistrée`
    : reussi
    ? `<b style="color:#1f6b3d;">SEUIL ATTEINT</b> — En attente de validation finale enseignant·e`
    : `<b style="color:#b23a48;">NON VALIDÉE</b> — Reprise de l'épreuve nécessaire`;

  const validateurFinal = validationFinaleOk
    ? `${escapeHtml(st.validation_finale.enseignant || "—")} &mdash; le ${escapeHtml(new Date(st.validation_finale.date).toLocaleDateString("fr-FR"))}`
    : "À renseigner";

  const observationsAuto = noteOverrideActive
    ? `Note finale ajustée par l'enseignant·e. Note automatique calculée : ${escapeHtml(noteAutoCalculee ?? "—")} / 20.${st.note_override.commentaire ? " " + escapeHtml(st.note_override.commentaire) : ""}`
    : "";

  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>Grille d'évaluation</title>
<style>
  @page { size: 21cm 29.7cm; margin: 0.7cm; }
  body { font-family: "Calibri", Arial, sans-serif; color: #1a2330; font-size: 10pt; line-height: 1.35; }
  h1 { color: #1f4f86; font-size: 14pt; margin: 0; }
  h2 { color: #1f4f86; font-size: 10.5pt; border-bottom: 1pt solid #1f4f86; padding-bottom: 1pt; margin: 8pt 0 4pt; text-transform: uppercase; letter-spacing: .04em; }
  h2.page-break { page-break-before: always; }
  .head-table { width: 100%; border-collapse: collapse; }
  .head-table td { vertical-align: top; padding: 0; border: 0; }
  .head-note { text-align: right; white-space: nowrap; color: #1f6b3d; font-weight: 700; font-size: 10.5pt; }
  .head-note b { font-size: 16pt; }
  .head-rule { border-top: 2pt solid #1f4f86; margin: 5pt 0 6pt; height: 0; line-height: 0; font-size: 0; }
  .head-id-line { font-size: 9.5pt; margin: 0; padding: 0; }
  .head-id-line span { margin-right: 16pt; }
  .head-id-line b { color: #1f4f86; }
  .objectif { background: #f1f7ff; border-left: 3pt solid #1f4f86; padding: 5pt 10pt; margin: 4pt 0; font-size: 10pt; }
  .objectif b { color: #1f4f86; }
  table.criteres { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 3pt; }
  table.criteres th, table.criteres td { border: .8pt solid #1a2330; padding: 3pt 5pt; vertical-align: top; }
  table.criteres th { background: #eef2f6; color: #1f4f86; font-weight: 700; text-align: center; font-size: 8.5pt; }
  .legend { font-size: 8pt; color: #555; margin: 3pt 0; }
  .legend b { color: #1f4f86; }
  .appreciation table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  .appreciation th, .appreciation td { border: .6pt solid #999; padding: 3pt 6pt; vertical-align: top; }
  .appreciation th { width: 28%; background: #eef2f6; color: #1f4f86; text-align: left; }
  ul.appr { margin: 2pt 0 2pt 14pt; padding: 0; }
  ul.appr li { margin: 1pt 0; }
</style></head>
<body>
  <table class="head-table">
    <tr>
      <td><h1>${escapeHtml(titreCourt)}</h1></td>
      <td class="head-note">Note&nbsp;: <b>${noteG}</b>&nbsp;/&nbsp;20</td>
    </tr>
  </table>
  <div class="head-rule"></div>
  <p class="head-id-line">
    <span><b>Élève&nbsp;:</b> ${escapeHtml(((e.prenom||"") + " " + (e.nom||"")).trim()) || "—"}</span>
    <span><b>Classe&nbsp;:</b> ${escapeHtml(e.classe||"—")}</span>
    <span><b>Année scolaire&nbsp;:</b> ${escapeHtml(e.annee_scolaire||"—")}</span>
    <span><b>Date&nbsp;:</b> ${escapeHtml(date)}</span>
  </p>

  <h2>I. Objectif de l'épreuve</h2>
  <div class="objectif">
    Être capable ${liaison}${escapeHtml(objectifMinuscule)}
  </div>

  <h2>II. Critères d'évaluation et indicateurs</h2>
  <div class="legend">
    <b>NT</b> Non traité (0 pt) ·
    <b>I</b> Insuffisamment maîtrisé (1 pt) ·
    <b>A</b> Acceptable (3 pts) ·
    <b>M</b> Maîtrisé (4 pts).
  </div>
  <table class="criteres">
    <thead><tr>
      <th style="width:6%">N°</th>
      <th style="width:30%">Critère</th>
      <th style="width:42%">Indicateur observable</th>
      <th style="width:5.5%">NT</th><th style="width:5.5%">I</th><th style="width:5.5%">A</th><th style="width:5.5%">M</th>
    </tr></thead>
    <tbody>${critRows}</tbody>
    <tfoot><tr>
      <th colspan="6" style="text-align:right; background:#eef2f6;">Note finale de l'épreuve</th>
      <th style="background:#2e8b57; color:#fff;">${noteG} / 20</th>
    </tr></tfoot>
  </table>

  <h2 class="page-break">III. Appréciation pédagogique</h2>
  <div class="appreciation">
    <table>
      <tr>
        <th>Capacités acquises</th>
        <td>${pointsForts ? `<ul class="appr">${pointsForts}</ul>` : "<i>Aucune capacité maîtrisée à ce stade.</i>"}</td>
      </tr>
      <tr>
        <th>Capacités à consolider</th>
        <td>${pointsConsolider ? `<ul class="appr">${pointsConsolider}</ul>` : "<i>—</i>"}</td>
      </tr>
      <tr>
        <th>Capacités à retravailler — remédiation</th>
        <td>${remediations ? `<ul class="appr">${remediations}</ul>` : "<i>Aucune remédiation nécessaire.</i>"}</td>
      </tr>
      <tr>
        <th>Observations de l'enseignant·e</th>
        <td style="height:46pt;">${observationsAuto}</td>
      </tr>
    </table>
  </div>


</body></html>`;

  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const n = (e.nom || "eleve").replace(/\s+/g, "_");
  a.href = url;
  a.download = `GrilleEval_${ep.id}_${n}_${new Date().toISOString().slice(0,10)}.doc`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

/* ---------- (Ancienne) Attestation J2 simple — conservée pour compat ---------- */
function exportAttestationAssiette(sec, mod) {
  syncIdentiteToInfos();
  const e = state.infos_eleve;
  const st = sec.module_state;
  const score20 = Math.round((st.qcm_score / st.qcm_total) * 20);
  const date = new Date().toLocaleDateString("fr-FR");

  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>Attestation</title>
<style>
  @page { size: 21cm 29.7cm; margin: 0.7cm; }
  body { font-family: "Garamond", "Times New Roman", serif; color: #1a2330; text-align: center; }
  .att-frame { border: 4pt double #1f4f86; padding: 30pt; margin-top: 30pt; }
  .att-eyebrow { font-size: 9pt; letter-spacing: .35em; text-transform: uppercase; color: #6b7785; }
  h1 { color: #1f4f86; font-size: 30pt; margin: 14pt 0 10pt; letter-spacing: .03em; }
  h2 { color: #2e8b57; font-size: 18pt; margin: 16pt 0 6pt; font-style: italic; font-weight: normal; }
  .att-name { font-size: 22pt; font-weight: 700; margin: 18pt 0 4pt; color: #1a2330; }
  .att-classe { font-size: 12pt; color: #6b7785; }
  .att-text { font-size: 13pt; margin: 22pt auto; max-width: 14cm; line-height: 1.7; }
  .att-text b { color: #1f4f86; }
  .att-score { font-size: 14pt; margin-top: 14pt; }
  .att-score .num { font-size: 26pt; font-weight: 700; color: #2e8b57; }
  .att-foot { margin-top: 38pt; display: flex; justify-content: space-between; font-size: 10pt; color: #6b7785; }
</style></head>
<body>
  <div class="att-frame">
    <div class="att-eyebrow">Chef-d'œuvre — CAP — Jalon 2</div>
    <h1>Attestation de connaissances</h1>
    <h2>Je sais composer une assiette équilibrée</h2>

    <div class="att-name">${escapeHtml(e.prenom||"")} ${escapeHtml(e.nom||"")}</div>
    <div class="att-classe">${escapeHtml(e.classe||"")}${e.annee_scolaire ? " — " + escapeHtml(e.annee_scolaire) : ""}</div>

    <p class="att-text">
      A étudié les <b>groupes alimentaires</b>, les <b>constituants alimentaires</b>,
      les <b>besoins de l'organisme</b> et la règle de composition d'une assiette équilibrée
      (½ légumes, ¼ féculents, ¼ protéines).
      <br /><br />
      A validé l'évaluation de connaissances avec un score de :
    </p>

    <div class="att-score"><span class="num">${score20}</span> / 20</div>

    <div class="att-foot">
      <span>Délivré le ${date}</span>
      <span>Portfolio Chef-d'œuvre — Année 1</span>
    </div>
  </div>
</body></html>`;

  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const n = (e.nom || "eleve").replace(/\s+/g, "_");
  a.href = url;
  a.download = `Attestation_Assiette_${n}_${new Date().toISOString().slice(0,10)}.doc`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

/* ---------- V4.12 : Vérification automatique du menu final ----------
   Croise les données de plusieurs sections pour détecter en direct
   ce qui manque et alerter l'élève AVANT l'épreuve finale. */
function renderAutoVerification() {
  const wrap = document.createElement("div");
  wrap.className = "auto-verif-block";

  // 1) ÉQUILIBRE — détection des 3 groupes via les ingrédients saisis
  const texteRepas = [
    fv("repas_equilibre","entree"), fv("repas_equilibre","plat"),
    fv("repas_equilibre","laitage"), fv("repas_equilibre","dessert"),
    fv("mon_menu","description"), fv("mon_menu","pourquoi_plats"),
  ].filter(Boolean).join(" ");
  const grp = detectGroupes(texteRepas);
  const equilibreOk = grp.legumes.length && grp.feculents.length && grp.proteines.length;

  // 2) ÉCO — fournisseurs renseignés ?
  const fournisseurs = fa("eco_responsable", "fournisseurs");
  const nbSaison  = fournisseurs.filter(f => f.saison === "Oui").length;
  const nbCircuit = fournisseurs.filter(f => f.circuit && f.circuit.startsWith("Oui")).length;
  const ecoOk = fournisseurs.length >= 2 && (nbSaison >= 1 || nbCircuit >= 1);

  // 3) EMBALLAGE
  const packaging = fv("eco_responsable","packaging");
  const emballageOk = !!packaging;

  // 4) ÉTIQUETTES
  const etiquettes = fa("etiquetage", "etiquettes");
  const etiquetteOk = etiquettes.length >= 1;

  // 5) ARGUMENTAIRES
  const argEq  = fv("mon_menu","equilibre");
  const argEco = fv("mon_menu","eco");
  const argsOk = argEq && argEco;

  const item = (lbl, ok, lien, desc) => {
    const sec = lien;
    return `<li class="av-item av-${ok ? "ok" : "ko"}">
      <span class="av-pic">${ok ? "✓" : "!"}</span>
      <div>
        <div class="av-label">${escapeHtml(lbl)}</div>
        <div class="av-desc">${escapeHtml(desc)}</div>
      </div>
      ${ok ? "" : `<button type="button" class="btn btn-sm av-link" data-go="${sec}">Y aller →</button>`}
    </li>`;
  };

  const allOk = equilibreOk && ecoOk && emballageOk && etiquetteOk && argsOk;

  wrap.innerHTML = `
    <div class="av-head">
      <h3>🔎 Vérification automatique de mon menu</h3>
      <span class="av-badge ${allOk ? "ok" : "ko"}">${allOk ? "Menu prêt pour l'épreuve" : "Menu à compléter"}</span>
    </div>
    <p class="hint">Le portfolio analyse en direct ce que tu as saisi dans les sections précédentes. Complète les manquants avant de passer l'épreuve finale.</p>
    <ul class="av-list">
      ${item(
        "Équilibre nutritionnel (½ ¼ ¼)",
        equilibreOk,
        "repas_equilibre",
        equilibreOk
          ? `Les 3 groupes sont présents : ${grp.legumes.slice(0,2).concat(grp.feculents.slice(0,2)).concat(grp.proteines.slice(0,2)).join(", ")}…`
          : "Il manque un groupe (légumes / féculents / protéines) dans la composition."
      )}
      ${item(
        "Démarche éco-responsable",
        ecoOk,
        "eco_responsable",
        ecoOk
          ? `${fournisseurs.length} produit(s) renseigné(s) dont ${nbSaison} de saison et ${nbCircuit} en circuit court.`
          : "Renseigne au moins 2 produits avec leur lieu d'achat / saison / circuit court."
      )}
      ${item(
        "Emballage choisi",
        emballageOk,
        "eco_responsable",
        emballageOk ? `Emballage prévu : ${escapeHtml(packaging)}` : "Pas d'emballage choisi pour le produit à emporter."
      )}
      ${item(
        "Étiquette du produit",
        etiquetteOk,
        "etiquetage",
        etiquetteOk ? `${etiquettes.length} étiquette(s) créée(s).` : "Aucune étiquette créée pour ton produit."
      )}
      ${item(
        "Argumentaires (équilibre + éco)",
        argsOk,
        "mon_menu",
        argsOk ? "Tu as bien rédigé tes arguments." : "Rédige les 2 paragraphes : pourquoi équilibré et pourquoi éco-responsable."
      )}
    </ul>
  `;
  setTimeout(() => {
    wrap.querySelectorAll(".av-link").forEach(b => {
      b.addEventListener("click", () => selectSection(b.dataset.go));
    });
  }, 0);
  return wrap;
}

/* V4.31 : Modale qui affiche un article HTML inline (rédigé par l'enseignant·e) */
function openArticleModal(r) {
  const old = document.getElementById("article-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "article-modal"; m.className = "modal";
  m.innerHTML = `
    <div class="modal-content article-modal-content">
      <button class="modal-close" id="art-close">×</button>
      <div class="article-eyebrow">📰 Article du prof</div>
      <h2 style="color:var(--c-primary-dark); margin-top:4px;">${escapeHtml(r.titre)}</h2>
      ${r.description ? `<p class="hint" style="margin-bottom:14px;">${escapeHtml(r.description)}</p>` : ""}
      <div class="article-body">${r.contenu || "<i>Article vide.</i>"}</div>
      <div style="margin-top:14px; text-align:right;">
        <button type="button" class="btn btn-primary" id="art-ok">J'ai lu, fermer</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
  m.addEventListener("click", e => { if (e.target.id === "article-modal") m.remove(); });
  m.querySelector("#art-close").addEventListener("click", () => m.remove());
  m.querySelector("#art-ok").addEventListener("click", () => {
    // Marque comme consulté
    if (currentView.type === "section") {
      const sec = state.sections.find(s => s.id === currentView.id);
      if (sec && sec.module_state) {
        if (!sec.module_state.ressources_lues) sec.module_state.ressources_lues = {};
        if (!sec.module_state.ressources_lues[r.id]) {
          sec.module_state.ressources_lues[r.id] = new Date().toISOString();
          saveState();
          renderMain();
        }
      }
    }
    m.remove();
  });
}

/* ---------- Infographie HTML (iframe) ---------- */
function renderInfographie(info) {
  const wrap = document.createElement("div");
  wrap.className = "infographie-block";
  const src = encodeURI(info.fichier);
  wrap.innerHTML = `
    <div class="infographie-head">
      <h3>${escapeHtml(info.titre || "📊 Infographie")}</h3>
      <a href="${src}" target="_blank" class="btn btn-sm">🔍 Plein écran</a>
    </div>
    <iframe src="${src}" loading="lazy" title="${escapeHtml(info.titre || '')}"
      style="width:100%; height:${info.hauteur || '650px'}; border:1px solid #d2dae3; border-radius:10px; background:#fff;"></iframe>
  `;
  return wrap;
}

/* ---------- Bibliothèque de ressources (PDF, images, liens) ----------
   Chaque ressource peut être marquée "consultée" par l'élève.
   L'état est sauvegardé dans sec.module_state.ressources_lues (Set d'ids).
------------------------------------------------------------------------ */
function renderRessources(sec, ressources) {
  const st = sec.module_state;
  if (!st.ressources_lues) st.ressources_lues = {};

  // V4.31 : on fusionne avec les ressources personnalisées de l'enseignant·e
  // (définies dans ressources_perso.js)
  if (typeof RESSOURCES_PERSO !== "undefined" && RESSOURCES_PERSO[sec.id]) {
    const ajouts = RESSOURCES_PERSO[sec.id];
    if (Array.isArray(ajouts) && ajouts.length) {
      // On ajoute les ressources perso EN TÊTE pour qu'elles soient bien visibles
      ressources = [...ajouts, ...ressources];
    }
  }

  const wrap = document.createElement("div");
  wrap.className = "ressources-block";
  wrap.innerHTML = `<h3>📚 Pour aller plus loin — bibliothèque</h3>
    <p class="hint">Documents officiels, infographies et articles. Clique pour ouvrir, puis marque comme lu.</p>`;

  const grid = document.createElement("div");
  grid.className = "ressources-grid";
  ressources.forEach(r => {
    const card = document.createElement("div");
    card.className = "ressource-card";
    if (r.type === "video" || r.type === "lien_externe" || r.type === "article") card.classList.add("ressource-card-large");
    if (st.ressources_lues[r.id]) card.classList.add("lue");
    if (r.id && r.id.startsWith("perso_")) card.classList.add("ressource-perso");
    const url = r.url || encodeURI(r.fichier || "");
    const icon = r.type === "pdf"          ? "📄"
              : r.type === "fiche"         ? "📋"
              : r.type === "image"         ? "🖼️"
              : r.type === "lien"          ? "🔗"
              : r.type === "lien_externe"  ? "🌐"
              : r.type === "video"         ? "🎬"
              : r.type === "article"       ? "📰"
              : r.type === "html"          ? "🧩"
              : "📎";
    const typeLabel = r.type === "lien_externe" ? "SITE WEB"
                    : r.type === "video"        ? "VIDÉO"
                    : r.type === "article"      ? "ARTICLE DU PROF"
                    : r.type === "fiche"        ? "FICHE"
                    : (r.type || "doc").toUpperCase();

    // V4.9 : embed YouTube/Vimeo si on détecte l'URL
    let embedHtml = "";
    if (r.type === "video" && r.url) {
      const yt = r.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
      const vim = r.url.match(/vimeo\.com\/(\d+)/);
      if (yt) embedHtml = `<iframe class="ressource-embed" src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen></iframe>`;
      else if (vim) embedHtml = `<iframe class="ressource-embed" src="https://player.vimeo.com/video/${vim[1]}" allowfullscreen></iframe>`;
    }

    // V4.31 : type "article" — texte HTML inline, ouvre une modale au clic
    if (r.type === "article") {
      card.innerHTML = `
        <div class="ressource-link" style="cursor:pointer;">
          <div class="ressource-icon">${icon}</div>
          <div class="ressource-meta">
            <div class="ressource-type">${escapeHtml(typeLabel)}</div>
            <div class="ressource-titre">${escapeHtml(r.titre)}</div>
            ${r.description ? `<div class="ressource-desc">${escapeHtml(r.description)}</div>` : ""}
          </div>
        </div>
        <button type="button" class="btn btn-sm ressource-lue-btn">
          ${st.ressources_lues[r.id] ? "Consulté ✓" : "Marquer comme consulté"}
        </button>
      `;
      card.querySelector(".ressource-link").addEventListener("click", () => openArticleModal(r));
    } else {
      card.innerHTML = `
        <a class="ressource-link" href="${url}" target="_blank" rel="noopener">
          <div class="ressource-icon">${icon}</div>
          <div class="ressource-meta">
            <div class="ressource-type">${escapeHtml(typeLabel)}</div>
            <div class="ressource-titre">${escapeHtml(r.titre)}</div>
            ${r.description ? `<div class="ressource-desc">${escapeHtml(r.description)}</div>` : ""}
          </div>
        </a>
        ${embedHtml}
        <button type="button" class="btn btn-sm ressource-lue-btn">
          ${st.ressources_lues[r.id] ? "Consulté ✓" : "Marquer comme consulté"}
        </button>
      `;
    }
    card.querySelector(".ressource-lue-btn").addEventListener("click", () => {
      if (st.ressources_lues[r.id]) {
        delete st.ressources_lues[r.id];
      } else {
        st.ressources_lues[r.id] = new Date().toISOString();
      }
      scheduleAutoSave(); renderMain();
    });
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  // Petit compteur
  const total = ressources.length;
  const lues = Object.keys(st.ressources_lues).filter(id => ressources.find(r => r.id === id)).length;
  const counter = document.createElement("div");
  counter.className = "ressources-counter";
  counter.innerHTML = `📊 <b>${lues} / ${total}</b> ressources consultées`;
  wrap.appendChild(counter);
  return wrap;
}

/* ---------- Audio : Web Speech API ---------- */
let currentUtterance = null;
function speakText(text, btn) {
  if (!("speechSynthesis" in window)) {
    alert("La lecture audio n'est pas disponible sur ce navigateur.");
    return;
  }
  // Stop si déjà en train de parler
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    document.querySelectorAll(".btn-audio.playing").forEach(b => {
      b.classList.remove("playing"); b.textContent = "🔊 Écouter";
    });
    if (currentUtterance && currentUtterance._btn === btn) return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR"; u.rate = 0.95; u.pitch = 1.0;
  u._btn = btn;
  u.onend = () => { btn.classList.remove("playing"); btn.textContent = "🔊 Écouter"; };
  u.onerror = u.onend;
  currentUtterance = u;
  btn.classList.add("playing"); btn.textContent = "⏸ Arrêter";
  window.speechSynthesis.speak(u);
}

/* ---------- QCM : une seule question (V4 : utilisée pour intercalation) ---------- */
function renderSingleQcm(sec, mod, q, qi) {
  const st = sec.module_state;
  const qBlock = document.createElement("div");
  qBlock.className = "qcm-question";
  qBlock.innerHTML = `<div class="q-label"><b>Question ${qi + 1}.</b> ${escapeHtml(q.question)}</div>`;

  const optsWrap = document.createElement("div");
  optsWrap.className = "qcm-options";
  q.options.forEach((opt, oi) => {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "qcm-opt";
    btn.textContent = String.fromCharCode(65 + oi) + ". " + opt;
    const answered = st.qcm_answers[q.id];
    if (answered !== undefined) {
      if (oi === q.correct) btn.classList.add("correct");
      if (oi === answered && oi !== q.correct) btn.classList.add("wrong");
      if (oi === answered) btn.classList.add("selected");
      btn.disabled = true;
    }
    btn.addEventListener("click", () => {
      st.qcm_answers[q.id] = oi;
      computeQcmScore(sec, mod);
      scheduleAutoSave();
      renderMain();
    });
    optsWrap.appendChild(btn);
  });
  qBlock.appendChild(optsWrap);

  const answered = st.qcm_answers[q.id];
  if (answered !== undefined) {
    const fb = document.createElement("div");
    const isOk = answered === q.correct;
    fb.className = "qcm-feedback " + (isOk ? "ok" : "ko");
    if (isOk) {
      fb.innerHTML = `<b>Bonne réponse.</b> ${q.explication ? escapeHtml(q.explication) : ""}`;
    } else {
      // V4 : feedback pédagogique enrichi avec lien "Revoir le cours"
      let explication = q.explication ? escapeHtml(q.explication)
                       : `La bonne réponse était : <b>${escapeHtml(q.options[q.correct])}</b>.`;
      let link = "";
      if (q.lie_cours) {
        link = ` <a class="link-revoir" href="#cours-${sec.id}-${q.lie_cours}">Revoir le cours</a>`;
      }
      fb.innerHTML = `<b>Réponse incorrecte.</b> Bonne réponse : <b>${escapeHtml(q.options[q.correct])}</b>. ${explication}${link}
        <div class="retry-line"><button type="button" class="btn btn-sm retry-q">Réessayer cette question</button></div>`;
      // bouton réessayer cette question
      setTimeout(() => {
        const r = fb.querySelector(".retry-q");
        if (r) r.addEventListener("click", () => {
          delete st.qcm_answers[q.id];
          computeQcmScore(sec, mod);
          scheduleAutoSave();
          renderMain();
        });
      }, 0);
    }
    qBlock.appendChild(fb);
  }
  return qBlock;
}

/* ---------- QCM : récap score uniquement (mode intercalé) ---------- */
function renderQcmScoreOnly(sec, mod) {
  const st = sec.module_state;
  const total = mod.qcm.length;
  const answered = Object.keys(st.qcm_answers).length;
  const score = st.qcm_score;
  const box = document.createElement("div");
  box.className = "qcm-score-box";
  if (answered === 0) {
    box.innerHTML = `<span class="hint">Réponds aux ${total} questions glissées dans les cours ci-dessus.</span>`;
  } else if (answered < total) {
    box.innerHTML = `<b>${answered} / ${total}</b> question(s) répondue(s).`;
  } else {
    const msg = score / total >= 0.75 ? "Quiz bien réussi."
              : score / total >= 0.5  ? "Reprends les questions où tu t'es trompé."
              :                          "Revois le cours puis réessaie les questions.";
    box.innerHTML = `<b>Quiz terminé : ${score} / ${total}.</b> <span class="hint">${msg}</span>
      <button type="button" class="btn btn-sm" id="btn-qcm-reset-all">Recommencer tout le quiz</button>`;
    setTimeout(() => {
      const b = document.getElementById("btn-qcm-reset-all");
      if (b) b.addEventListener("click", () => {
        st.qcm_answers = {}; st.qcm_score = null; st.qcm_completed = false;
        scheduleAutoSave(); renderMain();
      });
    }, 0);
  }
  return box;
}

/* ---------- QCM : ancien mode "tout en bas" (gardé pour modules sans lie_cours) ---------- */
function renderQcm(sec, mod) {
  const st = sec.module_state;
  const wrap = document.createElement("div");
  wrap.className = "module-qcm";
  wrap.innerHTML = `<h3>✅ Je vérifie ce que j'ai compris</h3>`;

  mod.qcm.forEach((q, qi) => {
    const qBlock = document.createElement("div");
    qBlock.className = "qcm-question";
    qBlock.innerHTML = `<div class="q-label"><b>Question ${qi + 1}.</b> ${escapeHtml(q.question)}</div>`;

    const optsWrap = document.createElement("div");
    optsWrap.className = "qcm-options";
    q.options.forEach((opt, oi) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "qcm-opt";
      btn.textContent = String.fromCharCode(65 + oi) + ". " + opt;
      const answered = st.qcm_answers[q.id];
      if (answered !== undefined) {
        if (oi === q.correct) btn.classList.add("correct");
        if (oi === answered && oi !== q.correct) btn.classList.add("wrong");
        if (oi === answered) btn.classList.add("selected");
        btn.disabled = true;
      }
      btn.addEventListener("click", () => {
        st.qcm_answers[q.id] = oi;
        computeQcmScore(sec, mod);
        scheduleAutoSave();
        renderMain();
      });
      optsWrap.appendChild(btn);
    });
    qBlock.appendChild(optsWrap);

    const answered = st.qcm_answers[q.id];
    if (answered !== undefined) {
      const fb = document.createElement("div");
      const isOk = answered === q.correct;
      fb.className = "qcm-feedback " + (isOk ? "ok" : "ko");
      fb.innerHTML = isOk
        ? `✅ <b>Bonne réponse !</b> ${q.explication ? escapeHtml(q.explication) : ""}`
        : `❌ <b>Pas tout à fait.</b> Bonne réponse : <b>${escapeHtml(q.options[q.correct])}</b>. ${q.explication ? escapeHtml(q.explication) : ""}`;
      qBlock.appendChild(fb);
    }
    wrap.appendChild(qBlock);
  });

  // Score + bouton recommencer
  const total = mod.qcm.length;
  const answered = Object.keys(st.qcm_answers).length;
  const score = st.qcm_score;
  const scoreBox = document.createElement("div");
  scoreBox.className = "qcm-score-box";
  if (answered === 0) {
    scoreBox.innerHTML = `<span class="hint">Réponds aux ${total} questions.</span>`;
  } else if (answered < total) {
    scoreBox.innerHTML = `<b>${answered} / ${total}</b> question(s) répondue(s) — continue !`;
  } else {
    const pct = Math.round(score / total * 100);
    const msg = pct >= 75 ? "Quiz bien réussi."
             : pct >= 50 ? "Quiz à revoir : reprends les points où tu t'es trompé."
             :             "Revois le cours puis recommence le quiz.";
    scoreBox.innerHTML = `<b>Quiz terminé — score : ${score} / ${total}</b><br /><span class="hint">${msg}</span>
      <button type="button" class="btn btn-sm" id="btn-qcm-reset">Recommencer le quiz</button>`;
    setTimeout(() => {
      const b = document.getElementById("btn-qcm-reset");
      if (b) b.addEventListener("click", () => {
        st.qcm_answers = {}; st.qcm_score = null; st.qcm_completed = false;
        scheduleAutoSave(); renderMain();
      });
    }, 0);
  }
  wrap.appendChild(scoreBox);
  return wrap;
}

function computeQcmScore(sec, mod) {
  const st = sec.module_state;
  let score = 0;
  mod.qcm.forEach(q => { if (st.qcm_answers[q.id] === q.correct) score++; });
  st.qcm_score = score;
  st.qcm_completed = Object.keys(st.qcm_answers).length === mod.qcm.length;
}

/* ---------- Exercice "remettre dans l'ordre" ---------- */
function renderOrderingExercise(sec, exo) {
  const st = sec.module_state;
  if (!st.exercice_order) {
    // Mélanger l'ordre initial
    st.exercice_order = [...exo.items].sort(() => Math.random() - 0.5).map(i => i.id);
  }

  const wrap = document.createElement("div");
  wrap.className = "module-exo";
  wrap.innerHTML = `<h3>🎯 ${escapeHtml(exo.titre)}</h3>
    <p class="hint">${escapeHtml(exo.consigne)}</p>`;

  const list = document.createElement("ol");
  list.className = "exo-ordering";
  st.exercice_order.forEach((id, idx) => {
    const item = exo.items.find(i => i.id === id);
    if (!item) return;
    const li = document.createElement("li");
    li.className = "exo-item";
    const isCorrect = st.exercice_ok && (item.order === idx + 1);
    if (st.exercice_ok !== null) {
      li.classList.add(item.order === idx + 1 ? "item-ok" : "item-ko");
    }
    li.innerHTML = `
      <span class="exo-num">${idx + 1}.</span>
      <span class="exo-label">${escapeHtml(item.label)}</span>
      <span class="exo-btns">
        <button type="button" class="btn btn-sm btn-up"  ${idx === 0 ? "disabled" : ""}>↑</button>
        <button type="button" class="btn btn-sm btn-down"${idx === st.exercice_order.length - 1 ? "disabled" : ""}>↓</button>
      </span>
    `;
    li.querySelector(".btn-up").addEventListener("click", () => {
      [st.exercice_order[idx - 1], st.exercice_order[idx]] = [st.exercice_order[idx], st.exercice_order[idx - 1]];
      st.exercice_ok = null; scheduleAutoSave(); renderMain();
    });
    li.querySelector(".btn-down").addEventListener("click", () => {
      [st.exercice_order[idx], st.exercice_order[idx + 1]] = [st.exercice_order[idx + 1], st.exercice_order[idx]];
      st.exercice_ok = null; scheduleAutoSave(); renderMain();
    });
    list.appendChild(li);
  });
  wrap.appendChild(list);

  const actions = document.createElement("div");
  actions.className = "exo-actions";
  const btnCheck = document.createElement("button");
  btnCheck.type = "button"; btnCheck.className = "btn btn-primary";
  btnCheck.textContent = "Vérifier mon ordre";
  btnCheck.addEventListener("click", () => {
    const ok = st.exercice_order.every((id, idx) => {
      const it = exo.items.find(i => i.id === id);
      return it && it.order === idx + 1;
    });
    st.exercice_ok = ok;
    scheduleAutoSave(); renderMain();
  });
  actions.appendChild(btnCheck);
  wrap.appendChild(actions);

  if (st.exercice_ok !== null) {
    const fb = document.createElement("div");
    fb.className = "exo-feedback " + (st.exercice_ok ? "ok" : "ko");
    fb.innerHTML = st.exercice_ok
      ? "<b>Ordre correct.</b>"
      : "<b>Certaines étapes ne sont pas au bon endroit.</b> Les lignes en rouge sont mal placées, déplace-les.";
    wrap.appendChild(fb);
  }
  return wrap;
}

/* ---------- Exercice "classification" (classer dans colonnes) ----------
   L'élève clique un aliment puis clique sur la colonne cible.
   Validation : ouvre en couleur vert si OK, rouge si KO.
------------------------------------------------------------------------ */
function renderClassificationExercise(sec, exo) {
  const st = sec.module_state;
  if (!st.classif_state) {
    // Map item_id -> column_id (non classé = null). Conservé dans module_state.
    st.classif_state = {};
    exo.items.forEach(it => { st.classif_state[it.id] = null; });
  }
  if (!st.classif_selected) st.classif_selected = null;

  const wrap = document.createElement("div");
  wrap.className = "module-exo";
  wrap.innerHTML = `<h3>🎯 ${escapeHtml(exo.titre)}</h3>
    <p class="hint">${escapeHtml(exo.consigne)}</p>`;

  // Pile d'items non classés
  const pile = document.createElement("div");
  pile.className = "classif-pile";
  const nonClasses = exo.items.filter(it => !st.classif_state[it.id]);
  nonClasses.forEach(it => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "classif-chip";
    if (st.classif_selected === it.id) chip.classList.add("selected");
    chip.textContent = it.label;
    chip.addEventListener("click", () => {
      st.classif_selected = st.classif_selected === it.id ? null : it.id;
      renderMain();
    });
    pile.appendChild(chip);
  });
  if (nonClasses.length === 0) {
    pile.innerHTML = `<p class="hint">Tous les éléments sont classés. Tu peux vérifier.</p>`;
  }
  wrap.appendChild(pile);

  // Colonnes cibles
  const cols = document.createElement("div");
  cols.className = "classif-cols";
  exo.colonnes.forEach(col => {
    const c = document.createElement("div");
    c.className = "classif-col";
    c.style.background = col.color || "#f7faff";
    c.innerHTML = `<h4>${escapeHtml(col.label)}</h4>`;
    const box = document.createElement("div");
    box.className = "classif-box";
    // Items déjà placés ici
    exo.items.forEach(it => {
      if (st.classif_state[it.id] !== col.id) return;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "classif-chip placed";
      if (st.classif_validated) {
        chip.classList.add(it.correct === col.id ? "ok" : "ko");
      }
      chip.textContent = it.label;
      chip.title = "Cliquer pour retirer";
      chip.addEventListener("click", () => {
        st.classif_state[it.id] = null;
        st.classif_validated = false;
        scheduleAutoSave(); renderMain();
      });
      box.appendChild(chip);
    });
    // Cliquer la colonne = assigner l'item sélectionné
    c.addEventListener("click", (ev) => {
      if (ev.target.classList.contains("classif-chip")) return; // ne pas déclencher en cliquant sur un chip
      if (!st.classif_selected) return;
      st.classif_state[st.classif_selected] = col.id;
      st.classif_selected = null;
      st.classif_validated = false;
      scheduleAutoSave(); renderMain();
    });
    c.appendChild(box);
    cols.appendChild(c);
  });
  wrap.appendChild(cols);

  // Actions
  const actions = document.createElement("div");
  actions.className = "exo-actions";
  const btnCheck = document.createElement("button");
  btnCheck.type = "button"; btnCheck.className = "btn btn-primary";
  btnCheck.textContent = "Vérifier mon classement";
  btnCheck.disabled = nonClasses.length > 0;
  btnCheck.addEventListener("click", () => {
    st.classif_validated = true;
    const nbOk = exo.items.filter(it => st.classif_state[it.id] === it.correct).length;
    st.classif_score = nbOk;
    st.classif_total = exo.items.length;
    scheduleAutoSave(); renderMain();
  });
  const btnReset = document.createElement("button");
  btnReset.type = "button"; btnReset.className = "btn";
  btnReset.textContent = "Tout remettre dans la pile";
  btnReset.addEventListener("click", () => {
    exo.items.forEach(it => { st.classif_state[it.id] = null; });
    st.classif_validated = false; st.classif_selected = null;
    scheduleAutoSave(); renderMain();
  });
  actions.append(btnCheck, btnReset);
  wrap.appendChild(actions);

  if (st.classif_validated) {
    const fb = document.createElement("div");
    const allOk = st.classif_score === st.classif_total;
    fb.className = "exo-feedback " + (allOk ? "ok" : "ko");
    fb.innerHTML = allOk
      ? `<b>Tous les éléments sont bien placés (${st.classif_total} / ${st.classif_total}).</b>`
      : `<b>Score : ${st.classif_score} / ${st.classif_total}.</b> Les éléments en rouge sont mal classés. Clique dessus pour les retirer puis place-les ailleurs.`;
    wrap.appendChild(fb);
  }
  return wrap;
}

/* =====================================================================
   V4.41 — MOTEUR D'EXERCICES INTERACTIFS (DRAG & DROP + click fallback)
   ---------------------------------------------------------------------
   Pour chaque exercice de EXOS_DND :
     - cartes en bas, zones colorées en haut
     - drag&drop natif HTML5 + fallback "click pour sélectionner / click
       pour déposer" (mode tactile pour tablette)
     - validation immédiate à chaque dépôt : carte verte si OK + tooltip
       explicatif, carte rouge + secousse + message si KO (et la carte
       revient dans la pile)
     - bouton "Recommencer" → mélange et tout réinitialise
     - bouton "Indice" → met en surbrillance la bonne zone pour la carte
       sélectionnée (utilise une vie sur 3)
     - quand 100 % réussi : message de félicitations + chips de
       mots-clés cliquables (recto/verso : mot ↔ définition) pour
       mémoriser les notions importantes
     - score sauvegardé dans sec.module_state.dnd_state[exoId]
   ===================================================================== */

/* =====================================================================
   V4.45 — EXERCICE "CURSEUR CHAÎNE DU FROID"
   ---------------------------------------------------------------------
   L'élève déplace un curseur entre 4 paliers de température. Pour chaque
   palier, 4 photos d'aliments (viande, poisson, fraise, citron)
   s'actualisent en direct, montrant la dégradation visuelle, avec une
   description courte. À la fin, un message "À retenir" rappelle la règle
   de la chaîne du froid (0-4 °C).
   Sources : photos issues de banque_images_chaine_du_froid/.
   ===================================================================== */

const EXO_CHAINE_FROID_DATA = {
  paliers: [
    { id: "0_2",    zone: "bas",    label: "Bas du frigo",   sub: "0 – 3 °C — Zone la plus froide",        verdict: "Conservation optimale ✅", color_bg: "#dbeaf6", color_fg: "#1f5c8b", emoji: "❄️" },
    { id: "4_6",    zone: "haut",   label: "Haut / Milieu du frigo",  sub: "3 – 6 °C — Zones froides",     verdict: "Début d'altération 🟡",     color_bg: "#dcecd5", color_fg: "#2a6b3a", emoji: "🟢" },
    { id: "10_12",  zone: "bac",    label: "Bac à légumes / Porte",    sub: "8 – 10 °C — Zones plus chaudes", verdict: "Altération avancée ⚠️",  color_bg: "#f9e7c9", color_fg: "#8a5500", emoji: "🟡" },
    { id: "plus14", zone: "hors",   label: "Hors du frigo",            sub: "> 14 °C — Chaîne du froid rompue", verdict: "DANGER : risque sanitaire ⛔", color_bg: "#f5d2d2", color_fg: "#a83232", emoji: "⛔" },
  ],
  aliments: [
    {
      id: "viande", label: "Viande crue (bœuf)", icon: "🥩",
      photos: {
        "0_2":    "ressources_eco/banque_images_chaine_du_froid/viande_crue/viande_0_2degre.jpg",
        "4_6":    "ressources_eco/banque_images_chaine_du_froid/viande_crue/viande_4_6degre.jpg",
        "10_12":  "ressources_eco/banque_images_chaine_du_froid/viande_crue/viande_10_12degre.jpg",
        "plus14": "ressources_eco/banque_images_chaine_du_froid/viande_crue/viande_plusde14_degre.jpg",
      },
      desc: {
        "0_2":    "Couleur rouge vif, texture ferme, odeur neutre.",
        "4_6":    "Couleur moins vive, début de dessèchement.",
        "10_12":  "Couleur terne, odeur suspecte.",
        "plus14": "Odeur forte, surface visqueuse, risque d'intoxication.",
      },
    },
    {
      id: "poisson", label: "Poisson cru (filet)", icon: "🐟",
      photos: {
        "0_2":    "ressources_eco/banque_images_chaine_du_froid/poissoncru/poission_0_2degre.jpg",
        "4_6":    "ressources_eco/banque_images_chaine_du_froid/poissoncru/poission_4_6degre.jpg",
        "10_12":  "ressources_eco/banque_images_chaine_du_froid/poissoncru/poission_10_12degre.jpg",
        "plus14": "ressources_eco/banque_images_chaine_du_froid/poissoncru/poission_plusde14_degre.jpg",
      },
      desc: {
        "0_2":    "Chair brillante, ferme, odeur fraîche de mer.",
        "4_6":    "Chair moins brillante, odeur moins fraîche.",
        "10_12":  "Chair terne, odeur plus forte.",
        "plus14": "Chair molle, odeur très forte, risque élevé.",
      },
    },
    {
      id: "fraise", label: "Fraise (fruit frais)", icon: "🍓",
      photos: {
        "0_2":    "ressources_eco/banque_images_chaine_du_froid/fraise/fraise_frais.0_2_degre.jpg",
        "4_6":    "ressources_eco/banque_images_chaine_du_froid/fraise/fraise_frais.4_6_degre.jpg",
        "10_12":  "ressources_eco/banque_images_chaine_du_froid/fraise/fraise_frais.10_12_degre.jpg",
        "plus14": "ressources_eco/banque_images_chaine_du_froid/fraise/fraise_frais.plusde_14_degre.jpg",
      },
      desc: {
        "0_2":    "Ferme, brillante, couleur vive.",
        "4_6":    "Début de ramollissement.",
        "10_12":  "Molle, jus en surface, moisissures possibles.",
        "plus14": "Très molle, moisissures visibles, non consommable.",
      },
    },
    {
      id: "citron", label: "Citron (fruit frais)", icon: "🍋",
      photos: {
        "0_2":    "ressources_eco/banque_images_chaine_du_froid/citron/citron_frais_0_2_degre.jpg",
        "4_6":    "ressources_eco/banque_images_chaine_du_froid/citron/citron_frais_4_6_degre.jpg",
        "10_12":  "ressources_eco/banque_images_chaine_du_froid/citron/citron_frais_10_12_degre.jpg",
        "plus14": "ressources_eco/banque_images_chaine_du_froid/citron/citron_frais_plusde14_degre.jpg",
      },
      desc: {
        "0_2":    "Peau lisse, ferme, sans tache.",
        "4_6":    "Légères taches, peau moins ferme.",
        "10_12":  "Taches brunes, peau ridée.",
        "plus14": "Peau très abîmée, moisissures, impropre.",
      },
    },
  ],
  rappel: "Respecter la chaîne du froid (0–4 °C) ralentit la prolifération des bactéries et préserve la qualité des aliments.",
};

function renderExoChaineFroid(sec) {
  const wrap = document.createElement("div");
  wrap.className = "exo-chaine-froid";

  const data = EXO_CHAINE_FROID_DATA;
  const paliers = data.paliers;

  wrap.innerHTML = `
    <h3>🌡️ La chaîne du froid : où ranger mes aliments dans le frigo ?</h3>
    <p class="hint">Déplace le curseur ou clique sur une zone du frigo pour voir comment chaque aliment évolue selon l'endroit où tu le ranges. Plus la zone est chaude, plus les aliments se dégradent vite.</p>
  `;

  // Layout : frigo schématique à gauche, contrôles à droite
  const layout = document.createElement("div");
  layout.className = "ecf-layout";

  // ===== Frigo schématique (cliquable) =====
  const frigoBox = document.createElement("div");
  frigoBox.className = "ecf-frigo";
  frigoBox.innerHTML = `
    <div class="ecf-frigo-title">🧊 Mon frigo</div>
    <div class="ecf-frigo-shell">
      <div class="ecf-frigo-zone" data-zone="haut" data-idx="1">
        <span class="zlbl">Haut</span><span class="ztemp">4-6 °C</span>
      </div>
      <div class="ecf-frigo-zone" data-zone="haut" data-idx="1">
        <span class="zlbl">Milieu</span><span class="ztemp">3-4 °C</span>
      </div>
      <div class="ecf-frigo-zone" data-zone="bas" data-idx="0">
        <span class="zlbl">Bas <span class="zfroid">❄️</span></span><span class="ztemp">0-3 °C</span>
      </div>
      <div class="ecf-frigo-zone" data-zone="bac" data-idx="2">
        <span class="zlbl">Bac à légumes</span><span class="ztemp">8-10 °C</span>
      </div>
      <div class="ecf-frigo-porte"></div>
      <div class="ecf-frigo-zone-porte" data-zone="bac" data-idx="2">
        <span class="zlbl">Porte</span><span class="ztemp">6-8 °C</span>
      </div>
    </div>
    <div class="ecf-frigo-out">
      <button type="button" class="ecf-frigo-zone-out" data-zone="hors" data-idx="3">
        <span class="zlbl">⛔ Hors du frigo</span><span class="ztemp">&gt; 14 °C</span>
      </button>
    </div>
  `;
  layout.appendChild(frigoBox);

  // ===== Bloc contrôles (banner + slider + grid) =====
  const controlBox = document.createElement("div");
  controlBox.className = "ecf-control";

  // Panneau du palier actuel
  const palierBanner = document.createElement("div");
  palierBanner.className = "ecf-banner";
  controlBox.appendChild(palierBanner);

  // Curseur (range slider) avec libellés
  const sliderBox = document.createElement("div");
  sliderBox.className = "ecf-slider-box";
  sliderBox.innerHTML = `
    <input type="range" min="0" max="${paliers.length - 1}" step="1" value="0" class="ecf-slider" id="ecf-slider-${sec.id}" />
    <div class="ecf-ticks">
      ${paliers.map((p, i) => `<button type="button" class="ecf-tick" data-idx="${i}" style="--t-color:${p.color_fg}"><span class="ecf-tick-emoji">${p.emoji}</span><span class="ecf-tick-label">${escapeHtml(p.label)}</span></button>`).join("")}
    </div>
  `;
  controlBox.appendChild(sliderBox);
  layout.appendChild(controlBox);
  wrap.appendChild(layout);

  // Grille d'aliments
  const grid = document.createElement("div");
  grid.className = "ecf-grid";
  data.aliments.forEach(al => {
    const card = document.createElement("div");
    card.className = "ecf-card";
    card.dataset.aliment = al.id;
    card.innerHTML = `
      <div class="ecf-card-head">
        <span class="ecf-aliment-icon">${al.icon}</span>
        <span class="ecf-aliment-nom">${escapeHtml(al.label)}</span>
      </div>
      <div class="ecf-photo-wrap">
        <img class="ecf-photo" src="" alt="${escapeHtml(al.label)}" loading="lazy" />
      </div>
      <div class="ecf-desc"></div>
    `;
    grid.appendChild(card);
  });
  wrap.appendChild(grid);

  // Rappel pédagogique
  const rappel = document.createElement("div");
  rappel.className = "ecf-rappel";
  rappel.innerHTML = `<span class="ecf-rappel-icon">💡</span> <b>À retenir :</b> ${escapeHtml(data.rappel)}`;
  wrap.appendChild(rappel);

  // ----- Logique d'actualisation -----
  const slider = wrap.querySelector(".ecf-slider");

  function update(idx) {
    const palier = paliers[idx];
    palierBanner.style.background = palier.color_bg;
    palierBanner.style.color = palier.color_fg;
    palierBanner.innerHTML = `
      <div class="ecf-banner-emoji">${palier.emoji}</div>
      <div class="ecf-banner-text">
        <div class="ecf-banner-temp">${escapeHtml(palier.label)}</div>
        <div class="ecf-banner-sub">${escapeHtml(palier.sub)}</div>
        <div class="ecf-banner-verdict">${escapeHtml(palier.verdict)}</div>
      </div>
    `;
    // Met à jour le slider visuel
    slider.value = idx;
    // Mets à jour les tick buttons
    wrap.querySelectorAll(".ecf-tick").forEach((t, i) => {
      t.classList.toggle("active", i === idx);
    });
    // V4.46 : surligne la (les) zone(s) du frigo correspondant au palier
    wrap.querySelectorAll(".ecf-frigo-zone, .ecf-frigo-zone-porte, .ecf-frigo-zone-out").forEach(z => {
      const matches = parseInt(z.dataset.idx, 10) === idx;
      z.classList.toggle("active", matches);
    });
    // Mets à jour les images + descriptions
    data.aliments.forEach(al => {
      const card = grid.querySelector(`.ecf-card[data-aliment="${al.id}"]`);
      const img = card.querySelector(".ecf-photo");
      const desc = card.querySelector(".ecf-desc");
      img.src = encodeURI(al.photos[palier.id]);
      desc.textContent = al.desc[palier.id];
      // Effet visuel selon le danger
      card.classList.remove("danger-1", "danger-2", "danger-3", "danger-4");
      card.classList.add(`danger-${idx + 1}`);
    });
  }

  slider.addEventListener("input", (e) => update(parseInt(e.target.value, 10)));
  wrap.querySelectorAll(".ecf-tick").forEach(t => {
    t.addEventListener("click", () => update(parseInt(t.dataset.idx, 10)));
  });
  // V4.46 : clic sur une zone du frigo → bascule au bon palier
  wrap.querySelectorAll(".ecf-frigo-zone, .ecf-frigo-zone-porte, .ecf-frigo-zone-out").forEach(z => {
    z.addEventListener("click", () => update(parseInt(z.dataset.idx, 10)));
    z.style.cursor = "pointer";
  });

  // Init au palier 0 (conservation optimale)
  update(0);
  return wrap;
}

/* V4.43 — Recherche automatique d'une photo dans BANQUE_IMAGES à partir
   d'un label. On nettoie le label (emojis, accents, casse) et on compare
   au slug du nom de fichier. Renvoie un chemin ou null. */
function findPhotoForExoItem(label, opts) {
  if (typeof BANQUE_IMAGES === "undefined") return null;
  if (!label) return null;
  // V4.53.1 : ne jamais auto-matcher une PHRASE (vrai/faux, affirmations, etc.)
  // Si le label fait > 6 mots OU > 40 caractères, c'est probablement une phrase
  // donc pas un aliment → pas de photo automatique (évite les faux matches).
  const wc = String(label).trim().split(/\s+/).length;
  if (wc > 6 || String(label).length > 40) return null;
  // Nettoyage : retire emojis, gère œ/æ, accents, casse
  const cleaned = String(label)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/gu, "")
    .replace(/œ/g, "oe").replace(/Œ/g, "oe").replace(/æ/g, "ae").replace(/Æ/g, "ae")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  // Slug entier
  const qFull = cleaned.replace(/[^a-z0-9]+/g, "");
  // Premiers mots significatifs (filtre articles/qualificatifs)
  const stopwords = new Set(["le","la","les","du","de","des","un","une","au","aux","et","ou","cru","crue","cuit","cuite","frais","fraiche","fraiches","sous","vide","sachet","midi","maison","entier","entiere","fermier","fermiere","bio","local","local","verte","vert","rouge","rouges","blanc","blanche","blanches","jaune","grand","petit","petits","grosses","grosse","petite"]);
  const words = cleaned.split(/[^a-z0-9]+/).filter(w => w.length >= 3 && !stopwords.has(w));
  if (!qFull && words.length === 0) return null;

  const cats = (opts && opts.cats) || ["aliments", "plats", "emballages", "labels", "pedago"];

  // Helper : compare slug fichier vs slug recherche
  function tryMatch(matchFn) {
    for (const cat of cats) {
      const data = BANQUE_IMAGES[cat] || {};
      for (const sub of Object.keys(data)) {
        const arr = Array.isArray(data[sub]) ? data[sub] : [];
        for (const img of arr) {
          const fn = (img.fichier.split("/").pop() || "").replace(/\.[^.]+$/, "");
          const s = fn.toLowerCase().replace(/_v?\d+$/, "").replace(/[^a-z0-9]+/g, "");
          if (s && matchFn(s)) return img.fichier;
        }
      }
    }
    return null;
  }

  // Passage 1 : match exact slug complet
  if (qFull && qFull.length >= 4) {
    const m = tryMatch(s => s === qFull);
    if (m) return m;
  }
  // Passage 2 : substring match avec le slug complet (très spécifique)
  if (qFull && qFull.length >= 5) {
    const m = tryMatch(s => s.length >= 5 && (qFull.includes(s) || s.includes(qFull)));
    if (m) return m;
  }
  // Passage 3 : match du PREMIER mot significatif (ex: "saumon cru" → saumon)
  for (const w of words) {
    if (w.length < 4) continue;
    const m = tryMatch(s => s === w || (s.length >= 4 && (s.includes(w) || w.includes(s))));
    if (m) return m;
  }
  return null;
}

/* Mapping explicite pour les zones d'exercices (icônes pédagogiques fortes) */
const EXOS_DND_BUCKET_PHOTOS = {
  // Exo "groupes_aliments"
  "fl":  "ressources_eco/groupes_aliments/fruitselegumes.jpg",
  "fec": "ressources_eco/groupes_aliments/feculents.jpg",
  "vpo": "ressources_eco/groupes_aliments/viandepoissonsoeuf_vpo.jpg",
  "pl":  "ressources_eco/groupes_aliments/produitslaitiers.jpg",
  "mg":  "ressources_eco/groupes_aliments/matieresgrasses.jpg",
  "ps":  "ressources_eco/groupes_aliments/produitssucreesetplaisirs.jpg",
  "boi": "ressources_eco/groupes_aliments/boissons.jpg",
  // Exo "constituants"
  "prot":"ressources_eco/les_constituants_alimentaires/proteine.jpg",
  "gluc":"ressources_eco/les_constituants_alimentaires/glucides_sucres.jpg",
  "lip": "ressources_eco/les_constituants_alimentaires/lipides.jpg",
  "vit": "ressources_eco/les_constituants_alimentaires/vitamines.jpg",
  // Exo "labels"
  "ab":         "ressources_eco/labels_logos_mentions_pour_choisir_un_produit_ecoresponsable/ab.jpg",
  "labelrouge": "ressources_eco/labels_logos_mentions_pour_choisir_un_produit_ecoresponsable/label_rouge.jpg",
  "aop":        "ressources_eco/labels_logos_mentions_pour_choisir_un_produit_ecoresponsable/label_aoc_aop.jpg",
  "igp":        "ressources_eco/labels_logos_mentions_pour_choisir_un_produit_ecoresponsable/igp.jpg",
};

function renderExosDnDBlock(sec) {
  const exos = (EXOS_DND || {})[sec.id];
  if (!exos || !exos.length) return document.createDocumentFragment();
  const wrap = document.createElement("div");
  wrap.className = "exos-dnd-block";
  wrap.innerHTML = `
    <h3>🎮 Je m'entraîne en manipulant — exercices interactifs</h3>
    <p class="hint">Glisse les cartes vers les bonnes zones (ou clique sur une carte puis sur la zone). Tu peux recommencer autant de fois que tu veux !</p>
  `;
  exos.forEach(exo => wrap.appendChild(renderUnExoDnD(sec, exo)));
  return wrap;
}

function renderUnExoDnD(sec, exo) {
  // État persistant
  if (!sec.module_state.dnd_state) sec.module_state.dnd_state = {};
  const total = exo.items.length;
  if (!sec.module_state.dnd_state[exo.id]) {
    sec.module_state.dnd_state[exo.id] = { best: 0, total: total, attempts: 0, completed: false };
  }
  const persist = sec.module_state.dnd_state[exo.id];

  // État de la session (en mémoire, recréé à chaque rendu)
  const ses = {
    placements: {},  // itemId -> { bucket, correct }
    selected: null,  // itemId sélectionné en mode click
    indices: 3,
    erreurs: 0,
  };

  const det = document.createElement("details");
  det.className = "exo-dnd";
  det.open = !persist.completed;

  const sum = document.createElement("summary");
  sum.className = "exo-dnd-sum";
  const refreshSum = () => {
    const placed = Object.keys(ses.placements).length;
    const ok = Object.values(ses.placements).filter(p => p.correct).length;
    let badge;
    if (persist.completed) badge = `<span class="exo-dnd-badge ok">✅ Maîtrisé (${persist.best}/${persist.total})</span>`;
    else if (placed > 0)   badge = `<span class="exo-dnd-badge en-cours">${ok}/${total} placés correctement</span>`;
    else if (persist.attempts > 0) badge = `<span class="exo-dnd-badge encore">À refaire (meilleur : ${persist.best}/${persist.total})</span>`;
    else badge = `<span class="exo-dnd-badge new">À faire</span>`;
    sum.innerHTML = `<span class="exo-dnd-titre">${escapeHtml(exo.titre)}</span> ${badge}`;
  };
  det.appendChild(sum);

  const body = document.createElement("div");
  body.className = "exo-dnd-body";
  body.innerHTML = `<p class="exo-dnd-intro">${escapeHtml(exo.intro)}</p>`;

  // Zone de feedback en direct
  const live = document.createElement("div");
  live.className = "exo-dnd-live";
  live.setAttribute("aria-live", "polite");

  // 1) Zones cibles
  const zones = document.createElement("div");
  zones.className = "exo-dnd-zones";
  exo.buckets.forEach(b => {
    const z = document.createElement("div");
    z.className = "exo-dnd-zone";
    z.dataset.bucket = b.id;
    // V4.43 : photo de zone (mapping explicite ou b.photo)
    const bucketPhoto = b.photo || EXOS_DND_BUCKET_PHOTOS[b.id] || null;
    if (bucketPhoto) z.classList.add("with-photo");
    const photoHTML = bucketPhoto ? `<img class="dz-photo" src="${encodeURI(bucketPhoto)}" alt="${escapeHtml(b.label)}" loading="lazy" />` : "";
    z.innerHTML = `
      ${photoHTML}
      <div class="dz-head">
        <b>${escapeHtml(b.label)}</b>
        ${b.sub ? `<span class="dz-sub">${escapeHtml(b.sub)}</span>` : ""}
      </div>
      ${b.tip ? `<div class="dz-tip">${escapeHtml(b.tip)}</div>` : ""}
      <div class="dz-drop" data-bucket="${b.id}"></div>
    `;
    // Drop natif
    const drop = z.querySelector(".dz-drop");
    drop.addEventListener("dragover", (e) => { e.preventDefault(); z.classList.add("dz-hover"); });
    drop.addEventListener("dragleave", () => z.classList.remove("dz-hover"));
    drop.addEventListener("drop", (e) => {
      e.preventDefault(); z.classList.remove("dz-hover");
      const itemId = e.dataTransfer.getData("text/plain");
      if (itemId) tryPlace(itemId, b.id);
    });
    // Click pour déposer en mode tactile
    z.addEventListener("click", () => {
      if (ses.selected) tryPlace(ses.selected, b.id);
    });
    zones.appendChild(z);
  });
  body.appendChild(zones);
  body.appendChild(live);

  // 2) Pile d'items à classer
  const pileWrap = document.createElement("div");
  pileWrap.className = "exo-dnd-pile-wrap";
  pileWrap.innerHTML = `<div class="exo-dnd-pile-label">Cartes à classer (${total}) :</div>`;
  const pile = document.createElement("div");
  pile.className = "exo-dnd-pile";
  pileWrap.appendChild(pile);
  body.appendChild(pileWrap);

  // 3) Actions
  const actions = document.createElement("div");
  actions.className = "exo-dnd-actions";

  const btnHint = document.createElement("button");
  btnHint.type = "button"; btnHint.className = "btn btn-small";
  btnHint.textContent = `💡 Indice (${ses.indices})`;
  btnHint.addEventListener("click", () => {
    if (!ses.selected) { setLive("⚠️ Sélectionne d'abord une carte (en cliquant dessus).", "ko"); return; }
    if (ses.indices <= 0) { setLive("Plus d'indices disponibles, recommence pour en récupérer.", "ko"); return; }
    const item = exo.items.find(i => i.id === ses.selected);
    ses.indices--;
    btnHint.textContent = `💡 Indice (${ses.indices})`;
    document.querySelectorAll(".exo-dnd-zone").forEach(z => z.classList.remove("dz-hint"));
    const z = zones.querySelector(`.exo-dnd-zone[data-bucket="${item.bucket}"]`);
    if (z) {
      z.classList.add("dz-hint");
      setTimeout(() => z.classList.remove("dz-hint"), 2500);
      setLive(`💡 La bonne zone est en surbrillance pendant 2 secondes.`, "info");
    }
  });

  const btnReset = document.createElement("button");
  btnReset.type = "button"; btnReset.className = "btn btn-small";
  btnReset.textContent = "🔄 Recommencer";
  btnReset.addEventListener("click", () => { resetSession(); });

  actions.append(btnHint, btnReset);
  body.appendChild(actions);

  // 4) Bloc final (mots-clés à mémoriser) — masqué tant que pas 100%
  const finalBlock = document.createElement("div");
  finalBlock.className = "exo-dnd-final";
  finalBlock.style.display = "none";
  body.appendChild(finalBlock);

  det.appendChild(body);

  // ----------- Fonctions internes -----------
  function setLive(msg, type) {
    live.className = "exo-dnd-live " + (type || "");
    live.textContent = msg;
  }

  function buildItemCard(item) {
    const c = document.createElement("button");
    c.type = "button";
    c.className = "exo-dnd-card";
    c.draggable = true;
    c.dataset.id = item.id;
    // V4.43 : photo automatique depuis BANQUE_IMAGES si dispo
    const photo = item.photo || findPhotoForExoItem(item.label);
    if (photo) {
      c.classList.add("with-photo");
      // Nettoie les emojis du label si on a une photo (la photo remplace l'icône)
      const cleanLabel = String(item.label).replace(/^[\s\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]+/gu, "").trim();
      c.innerHTML = `
        <img src="${encodeURI(photo)}" alt="${escapeHtml(cleanLabel)}" loading="lazy" />
        <span class="card-label">${escapeHtml(cleanLabel)}</span>
      `;
    } else {
      c.textContent = item.label;
    }
    c.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", item.id);
      c.classList.add("dragging");
      ses.selected = item.id;
      refreshSelectedMark();
    });
    c.addEventListener("dragend", () => c.classList.remove("dragging"));
    c.addEventListener("click", () => {
      ses.selected = ses.selected === item.id ? null : item.id;
      refreshSelectedMark();
      if (ses.selected) setLive(`Carte sélectionnée : "${item.label}". Clique maintenant sur la bonne zone.`, "info");
    });
    return c;
  }

  function refreshSelectedMark() {
    pile.querySelectorAll(".exo-dnd-card").forEach(el => {
      el.classList.toggle("selected", el.dataset.id === ses.selected);
    });
  }

  function tryPlace(itemId, bucketId) {
    if (ses.placements[itemId]) return;  // déjà placé
    const item = exo.items.find(i => i.id === itemId);
    if (!item) return;
    const correct = item.bucket === bucketId;
    if (correct) {
      ses.placements[itemId] = { bucket: bucketId, correct: true };
      // Affiche dans la zone, avec explication
      const dz = zones.querySelector(`.exo-dnd-zone[data-bucket="${bucketId}"] .dz-drop`);
      const placed = document.createElement("div");
      placed.className = "exo-dnd-placed ok";
      // V4.43 : photo dans le placement final si dispo
      const placedPhoto = item.photo || findPhotoForExoItem(item.label);
      const cleanLabel = String(item.label).replace(/^[\s\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]+/gu, "").trim();
      // V4.59 : bouton ✕ pour retirer la carte et la remettre dans la pile
      placed.innerHTML = `
        <button type="button" class="placed-remove" title="Retirer et remettre dans la pile">✕</button>
        ${placedPhoto ? `<img class="placed-photo" src="${encodeURI(placedPhoto)}" alt="${escapeHtml(cleanLabel)}" loading="lazy" />` : ""}
        <div class="placed-text"><b>✅ ${escapeHtml(cleanLabel)}</b><span class="why">${escapeHtml(item.why || "")}</span></div>
      `;
      placed.querySelector(".placed-remove").addEventListener("click", (ev) => {
        ev.stopPropagation();
        delete ses.placements[itemId];
        placed.remove();
        pile.appendChild(buildItemCard(item));
        setLive(`↩️ Tu as retiré "${cleanLabel}" — il est revenu dans la pile.`, "info");
        // Si on avait fini à 100%, réinitialise le bloc final
        if (finalBlock.style.display !== "none") {
          finalBlock.style.display = "none";
          finalBlock.innerHTML = "";
          if (persist.completed && Object.keys(ses.placements).length < total) {
            // On ne reset pas persist.completed (le score historique reste)
          }
        }
        refreshSum();
      });
      dz.appendChild(placed);
      // Retire de la pile
      const card = pile.querySelector(`.exo-dnd-card[data-id="${itemId}"]`);
      if (card) card.remove();
      ses.selected = null;
      setLive(`✅ Bien joué ! ${item.why || ""}`, "ok");
      checkComplete();
    } else {
      ses.erreurs++;
      ses.placements[itemId] = undefined;  // pas validé
      delete ses.placements[itemId];
      const card = pile.querySelector(`.exo-dnd-card[data-id="${itemId}"]`);
      if (card) {
        card.classList.add("shake-ko");
        setTimeout(() => card.classList.remove("shake-ko"), 600);
      }
      const goodBucket = exo.buckets.find(b => b.id === item.bucket);
      setLive(`❌ Pas tout à fait : "${item.label}" n'est pas dans "${exo.buckets.find(b=>b.id===bucketId).label}". Indice : ${goodBucket.tip || "réfléchis aux caractéristiques du produit."}`, "ko");
    }
    refreshSum();
  }

  function checkComplete() {
    const placed = Object.keys(ses.placements).length;
    if (placed === total) {
      // 100% réussi → on incrémente le score, on affiche les mots-clés
      const score = total - 0; // tous corrects (les erreurs ne placent pas)
      persist.attempts++;
      if (score > persist.best) persist.best = score;
      persist.total = total;
      persist.completed = true;
      scheduleAutoSave();
      finalBlock.style.display = "block";
      if (typeof showConfetti === "function") showConfetti(2200);
      finalBlock.innerHTML = `
        <div class="exo-dnd-success">
          <h4>🎉 Bravo, tout est correctement placé !</h4>
          <p>Tu as fait <b>${ses.erreurs}</b> erreur${ses.erreurs > 1 ? "s" : ""} en cours de route. ${ses.erreurs === 0 ? "C'est parfait du premier coup !" : "Recommence pour faire 0 erreur."}</p>
        </div>
      `;
      if (exo.mots_cles && exo.mots_cles.length) {
        const mcWrap = document.createElement("div");
        mcWrap.className = "exo-dnd-motscles";
        mcWrap.innerHTML = `<h4>📌 Mots-clés à mémoriser (clique pour voir la définition)</h4>`;
        const grid = document.createElement("div");
        grid.className = "exo-dnd-mc-grid";
        exo.mots_cles.forEach(mc => {
          const card = document.createElement("button");
          card.type = "button";
          card.className = "exo-dnd-mc-card";
          card.innerHTML = `<span class="mc-recto">${escapeHtml(mc.mot)}</span><span class="mc-verso">${escapeHtml(mc.def)}</span>`;
          card.addEventListener("click", () => card.classList.toggle("flipped"));
          grid.appendChild(card);
        });
        mcWrap.appendChild(grid);
        finalBlock.appendChild(mcWrap);
      }
      // Bouton refaire pour viser 0 erreur
      const refaire = document.createElement("button");
      refaire.type = "button"; refaire.className = "btn btn-primary";
      refaire.textContent = "🔁 Refaire pour viser 0 erreur";
      // V4.65 : ne pas passer l'event en argument (sinon firstTime = event = truthy → message faux)
      refaire.addEventListener("click", () => resetSession());
      finalBlock.appendChild(refaire);
    }
  }

  function resetSession(firstTime) {
    ses.placements = {};
    ses.selected = null;
    ses.indices = 3;
    ses.erreurs = 0;
    btnHint.textContent = `💡 Indice (3)`;
    finalBlock.style.display = "none";
    finalBlock.innerHTML = "";
    // Reset zones
    zones.querySelectorAll(".dz-drop").forEach(d => d.innerHTML = "");
    // Repopule la pile dans un ordre mélangé
    pile.innerHTML = "";
    const shuffled = [...exo.items].sort(() => Math.random() - 0.5);
    shuffled.forEach(it => pile.appendChild(buildItemCard(it)));
    // V4.41.1 : pas de message bleu "nouvelle tentative" à la 1re ouverture.
    if (firstTime) {
      setLive(persist.completed
        ? `✅ Tu as déjà réussi cet exercice (${persist.best}/${persist.total}). Tu peux le refaire pour t'entraîner.`
        : `Glisse les cartes ou clique dessus pour les sélectionner, puis clique sur la bonne zone.`, "info");
    } else {
      setLive("🔄 Nouvelle tentative — bon courage !", "info");
    }
    refreshSum();
  }

  // Init
  resetSession(true);
  refreshSum();

  return det;
}

/* =====================================================================
   V4.41 — Champ "textarea_keywords"
   Une zone de texte + une rangée de mots-clés cliquables qui s'insèrent
   à la fin du texte au clic. Aide les élèves qui ont du mal à démarrer.
   ===================================================================== */

function renderTextareaKeywords(sec, field, schema) {
  const wrap = document.createElement("div");
  wrap.className = "field tk-field";
  const id = `f_${sec.id}_${field.id}`;
  const lab = document.createElement("label");
  lab.htmlFor = id; lab.textContent = schema.label;
  wrap.appendChild(lab);

  const ta = document.createElement("textarea");
  ta.id = id;
  ta.value = field.valeur || "";
  ta.placeholder = schema.placeholder || "Tu peux écrire avec tes mots, ou cliquer sur les mots-clés ci-dessous pour t'aider.";
  ta.rows = 3;
  ta.addEventListener("input", () => {
    field.valeur = ta.value;
    sec.date_maj = new Date().toISOString();
    if (sec.statut_eleve === "not_started") { sec.statut_eleve = "in_progress"; renderSidebar(); }
    scheduleAutoSave();
  });
  wrap.appendChild(ta);

  const bank = (KEYWORDS_BANKS && KEYWORDS_BANKS[schema.keywords_bank]) || schema.keywords || [];
  if (bank.length) {
    const kwWrap = document.createElement("div");
    kwWrap.className = "tk-kw-wrap";
    kwWrap.innerHTML = `<div class="tk-kw-label">💡 Mots-clés à insérer (clique pour les ajouter à ton texte) :</div>`;
    const row = document.createElement("div");
    row.className = "tk-kw-row";
    bank.forEach(k => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "tk-kw-chip";
      chip.textContent = "+ " + k;
      chip.addEventListener("click", () => {
        const sep = ta.value && !/[\s,.]$/.test(ta.value) ? ", " : "";
        ta.value = ta.value + sep + k;
        field.valeur = ta.value;
        sec.date_maj = new Date().toISOString();
        ta.focus();
        scheduleAutoSave();
      });
      row.appendChild(chip);
    });
    kwWrap.appendChild(row);
    wrap.appendChild(kwWrap);
  }
  return wrap;
}

/* =====================================================================
   V4.47 — Sélecteurs d'images depuis la galerie
   ---------------------------------------------------------------------
   image_picker_single → l'élève choisit UNE image (l'emballage, les
                          couverts, le verre…). Affichée comme grande
                          carte avec photo + nom + badge éco.
   image_picker_multi  → l'élève choisit PLUSIEURS images (les petits
                          accessoires : sel, ketchup…). Affichées comme
                          galerie de tuiles supprimables.
   ===================================================================== */
function renderImagePickerSingle(sec, field, schema) {
  const wrap = document.createElement("div");
  wrap.className = "field img-picker img-picker-single";

  const lab = document.createElement("label");
  lab.textContent = schema.label;
  wrap.appendChild(lab);
  if (schema.hint) {
    const h = document.createElement("div");
    h.className = "hint";
    h.textContent = schema.hint;
    wrap.appendChild(h);
  }

  const cardZone = document.createElement("div");
  cardZone.className = "img-picker-zone";
  wrap.appendChild(cardZone);

  function refreshDisplay() {
    cardZone.innerHTML = "";
    const sel = field.valeur && field.valeur.fichier ? field.valeur : null;
    if (!sel) {
      const empty = document.createElement("button");
      empty.type = "button";
      empty.className = "img-picker-empty";
      empty.innerHTML = `<span class="ipe-icon">🖼️</span><span>Choisir une image dans la banque</span>`;
      empty.addEventListener("click", openPicker);
      cardZone.appendChild(empty);
    } else {
      const card = document.createElement("div");
      card.className = "img-picker-card";
      const ecoBadge = sel.eco === "bon" ? `<span class="ipc-eco bon">✅ Bon choix éco</span>` :
                       sel.eco === "moyen" ? `<span class="ipc-eco moyen">🟡 À limiter</span>` :
                       sel.eco === "mauvais" ? `<span class="ipc-eco mauvais">❌ À éviter</span>` : "";
      card.innerHTML = `
        <img src="${encodeURI(sel.fichier)}" alt="${escapeHtml(sel.nom)}" loading="lazy" />
        <div class="img-picker-card-body">
          <div class="ipc-nom">${escapeHtml(sel.nom)}</div>
          <div class="ipc-sub">${escapeHtml(sel.sous_categorie || "")}</div>
          ${ecoBadge}
          <div class="img-picker-actions">
            <button type="button" class="btn btn-small ipc-change">🔄 Changer</button>
            <button type="button" class="btn btn-small btn-danger ipc-clear">✕ Retirer</button>
          </div>
        </div>
      `;
      card.querySelector(".ipc-change").addEventListener("click", openPicker);
      card.querySelector(".ipc-clear").addEventListener("click", () => {
        field.valeur = null;
        sec.date_maj = new Date().toISOString();
        scheduleAutoSave();
        refreshDisplay();
      });
      cardZone.appendChild(card);
    }
  }

  function openPicker() {
    openGaleriePicker({
      title: `🖼️ ${schema.label}`,
      multi: false,
      categories: schema.banque_cat ? [schema.banque_cat] : undefined,
      onSelect: (sel) => {
        // Si subs filtré, on accepte tout (la galerie présentera la sous-cat)
        field.valeur = {
          fichier: sel.fichier,
          nom: sel.nom,
          eco: sel.eco || null,
          categorie: sel.categorie,
          sous_categorie: sel.sous_categorie,
        };
        sec.date_maj = new Date().toISOString();
        if (sec.statut_eleve === "not_started") { sec.statut_eleve = "in_progress"; renderSidebar(); }
        scheduleAutoSave();
        refreshDisplay();
      },
    });
  }

  refreshDisplay();
  return wrap;
}

function renderImagePickerMulti(sec, field, schema) {
  if (!Array.isArray(field.valeur)) field.valeur = [];

  const wrap = document.createElement("div");
  wrap.className = "field img-picker img-picker-multi";

  const lab = document.createElement("label");
  lab.textContent = schema.label;
  wrap.appendChild(lab);
  if (schema.hint) {
    const h = document.createElement("div");
    h.className = "hint";
    h.textContent = schema.hint;
    wrap.appendChild(h);
  }

  const grid = document.createElement("div");
  grid.className = "img-picker-grid";
  wrap.appendChild(grid);

  function refresh() {
    grid.innerHTML = "";
    field.valeur.forEach((it, idx) => {
      const tile = document.createElement("div");
      tile.className = "img-picker-mini";
      const ecoBadge = it.eco === "bon" ? `<span class="ipm-eco bon">✅</span>` :
                       it.eco === "moyen" ? `<span class="ipm-eco moyen">🟡</span>` :
                       it.eco === "mauvais" ? `<span class="ipm-eco mauvais">❌</span>` : "";
      tile.innerHTML = `
        <button type="button" class="ipm-del" title="Retirer">✕</button>
        ${ecoBadge}
        <img src="${encodeURI(it.fichier)}" alt="${escapeHtml(it.nom)}" loading="lazy" />
        <div class="ipm-nom">${escapeHtml(it.nom)}</div>
      `;
      tile.querySelector(".ipm-del").addEventListener("click", () => {
        field.valeur.splice(idx, 1);
        sec.date_maj = new Date().toISOString();
        scheduleAutoSave();
        refresh();
      });
      grid.appendChild(tile);
    });
    // Bouton "+ Ajouter"
    const add = document.createElement("button");
    add.type = "button";
    add.className = "img-picker-add";
    add.innerHTML = `<span class="ipa-plus">+</span><span>Ajouter</span>`;
    add.addEventListener("click", () => {
      openGaleriePicker({
        title: `🖼️ ${schema.label}`,
        multi: true,
        categories: schema.banque_cat ? [schema.banque_cat] : undefined,
        onSelect: (sel) => {
          const arr = Array.isArray(sel) ? sel : [sel];
          arr.forEach(s => {
            if (field.valeur.some(v => v.fichier === s.fichier)) return;  // anti-doublon
            field.valeur.push({
              fichier: s.fichier, nom: s.nom, eco: s.eco || null,
              categorie: s.categorie, sous_categorie: s.sous_categorie,
            });
          });
          sec.date_maj = new Date().toISOString();
          if (sec.statut_eleve === "not_started") { sec.statut_eleve = "in_progress"; renderSidebar(); }
          scheduleAutoSave();
          refresh();
        },
      });
    });
    grid.appendChild(add);
  }
  refresh();
  return wrap;
}

/* =====================================================================
   V4.42 — GALERIE D'IMAGES UNIVERSELLE (Phase 1)
   ---------------------------------------------------------------------
   API publique :
     openGaleriePicker({
       categories: ["aliments","plats","labels","emballages","pedago","chaine_du_froid"],
       multi: true|false,
       title: "Choisir un aliment",
       onSelect: (selection) => {…}
     })
   Le bouton flottant en bas à droite ouvre la galerie en consultation
   libre depuis n'importe quelle vue.
   ===================================================================== */

let _galerieState = null;

const GALERIE_CAT_LABELS = {
  aliments:        { icon: "🥗", label: "Aliments" },
  plats:           { icon: "🍽️", label: "Plats" },
  labels:          { icon: "🏅", label: "Labels & logos" },
  emballages:      { icon: "📦", label: "Emballages" },
  pedago:          { icon: "📘", label: "Vues pédagogiques" },
  // V4.45 : chaine_du_froid masquée — utilisée uniquement pour l'exercice
  // dédié "curseur de température" et pas dans la bibliothèque générale.
};

/* V4.48 — Métadonnées pédagogiques par sous-catégorie : groupe alimentaire,
   constituants principaux, conseils PNNS. Affichées dans le popup info. */
const META_PAR_SOUSCAT = {
  "Légumes":          { groupe: "Fruits et légumes", constituants: ["Vitamines", "Minéraux", "Fibres"],     pnns: "5 par jour. Cible la moitié de l'assiette.", couleur: "#4a9d5e" },
  "Fruits":           { groupe: "Fruits et légumes", constituants: ["Vitamines (C, A)", "Sucres naturels", "Fibres"], pnns: "1 fruit par repas idéalement.", couleur: "#e8a13a" },
  "Viandes":          { groupe: "VPO (Viandes/Poissons/Œufs)", constituants: ["Protides", "Fer"],           pnns: "1 à 2 fois par jour, alterner avec poisson/œuf.", couleur: "#c25a5a" },
  "Poissons & fruits de mer": { groupe: "VPO (Viandes/Poissons/Œufs)", constituants: ["Protides", "Oméga-3", "Iode"], pnns: "Au moins 2 fois par semaine, dont 1 gras.", couleur: "#3a7ec0" },
  "Œufs & préparations":      { groupe: "VPO (Viandes/Poissons/Œufs)", constituants: ["Protides complets"], pnns: "Excellente source de protéines.", couleur: "#e8a13a" },
  "Charcuteries":     { groupe: "VPO (à limiter)", constituants: ["Protides", "Lipides", "Sel"],            pnns: "À limiter — riche en sel et graisses saturées.", couleur: "#a86060" },
  "Produits laitiers":{ groupe: "Produits laitiers", constituants: ["Calcium", "Protides"],                  pnns: "2 par jour pour les os et les dents.", couleur: "#f0d4a4" },
  "Féculents":        { groupe: "Féculents", constituants: ["Glucides complexes", "Fibres (si complets)"],   pnns: "À chaque repas, privilégier les complets.", couleur: "#d8a23a" },
  "Légumineuses":     { groupe: "VPO (protéines végétales)", constituants: ["Protides végétaux", "Fibres", "Glucides"], pnns: "Au moins 2 fois par semaine.", couleur: "#9b6c3a" },
  "Boissons":         { groupe: "Boissons", constituants: ["Eau"],                                            pnns: "Eau à volonté ; limite jus/sodas.", couleur: "#3a7ec0" },
  "Sauces & herbes":  { groupe: "Matières grasses / Condiments", constituants: ["Lipides ou aromates"],       pnns: "Privilégier huiles végétales (olive, colza).", couleur: "#aa8a3a" },
  "Desserts":         { groupe: "Produits sucrés", constituants: ["Sucres", "Lipides"],                        pnns: "Avec modération — plaisir occasionnel.", couleur: "#c97a8c" },
  "Conserves & longue conservation": { groupe: "Variable selon le produit", constituants: ["Variable"],       pnns: "Pratique mais vérifier le sel ajouté.", couleur: "#888" },
  "Plats préparés":   { groupe: "Plat composé", constituants: ["Variable selon ingrédients"],                 pnns: "Vérifier l'équilibre et la composition.", couleur: "#5a8c5a" },
  "Plats du monde":   { groupe: "Plat composé", constituants: ["Variable selon ingrédients"],                 pnns: "Découvre la diversité culturelle !", couleur: "#5a8c5a" },
  "Plats à emporter": { groupe: "Plat composé", constituants: ["Variable selon ingrédients"],                 pnns: "Souvent riche en sel et graisses.", couleur: "#5a8c5a" },
  "Produits labellisés": { groupe: "Produits avec garantie de qualité", constituants: ["Variable"],            pnns: "Garantit qualité et origine.", couleur: "#9c8b3a" },
  // Vues pédagogiques : pas de meta nutritionnelle classique
  "Groupes alimentaires": { groupe: "Vue pédagogique", constituants: [], pedago: true, couleur: "#5a6471" },
  "Constituants":     { groupe: "Vue pédagogique", constituants: [], pedago: true, couleur: "#5a6471" },
  "Vue frigo (par groupe)": { groupe: "Vue pédagogique", constituants: [], pedago: true, couleur: "#5a6471" },
  "Modes de cuisson": { groupe: "Mode de cuisson", constituants: [], pedago: true, couleur: "#aa6a3a" },
  "Saisons":          { groupe: "Saison de l'année", constituants: [], pedago: true, couleur: "#4a9d5e" },
  "Contextes (marché, ferme, AMAP…)": { groupe: "Contexte d'achat", constituants: [], pedago: true, couleur: "#5a8c5a" },
  // Emballages : c'est l'éco-score qui compte
  "Boîtes & barquettes":  { type_emballage: "Contenant principal", couleur: "#8c6a3a" },
  "Couverts":             { type_emballage: "Couverts", couleur: "#8c6a3a" },
  "Sachets & sacs":       { type_emballage: "Emballage de transport", couleur: "#8c6a3a" },
  "Verres & gobelets":    { type_emballage: "Récipient à boisson", couleur: "#8c6a3a" },
  "Serviettes & accessoires": { type_emballage: "Accessoire", couleur: "#8c6a3a" },
  "Condiments individuels":   { type_emballage: "Petit accessoire", couleur: "#8c6a3a" },
  // Labels
  "Labels & logos":   { type: "Label officiel", couleur: "#aa6a3a" },
};

function getImageMeta(item) {
  return META_PAR_SOUSCAT[item.sous_categorie] || null;
}

function openGaleriePicker(opts = {}) {
  closeGaleriePicker();
  if (typeof BANQUE_IMAGES === "undefined") {
    alert("La banque d'images n'a pas été chargée. Vérifie que banque_images.js est bien inclus.");
    return;
  }
  const cats = opts.categories && opts.categories.length
    ? opts.categories
    : Object.keys(GALERIE_CAT_LABELS).filter(c => BANQUE_IMAGES[c] && Object.keys(BANQUE_IMAGES[c]).length);

  const state = {
    cats,
    cat: cats[0],
    sub: null,
    search: "",
    selected: [],
    multi: !!opts.multi,
    withQuantity: !!opts.withQuantity,  // V4.52 : champ quantité par tuile sélectionnée
    onSelect: opts.onSelect || (() => {}),
    title: opts.title || "🖼️ Banque d'images",
    browseMode: !!opts.browseMode, // V4.79 — mode "parcours libre" : pas d'ajout, juste voir
  };
  _galerieState = state;

  const back = document.createElement("div");
  back.className = "galerie-backdrop";
  back.id = "galerie-backdrop";
  back.addEventListener("click", (e) => { if (e.target === back) closeGaleriePicker(); });

  const modal = document.createElement("div");
  modal.className = "galerie-modal";
  modal.innerHTML = `
    <div class="galerie-header">
      <h2>${escapeHtml(state.title)}</h2>
      <div class="galerie-search">
        <input type="search" id="galerie-search-input" placeholder="🔍 Rechercher un aliment, un label, un emballage…" autocomplete="off" />
      </div>
      <button type="button" class="galerie-close" title="Fermer">✕</button>
    </div>
    <div class="galerie-tabs"></div>
    <div class="galerie-subs"></div>
    <div class="galerie-grid"></div>
    <div class="galerie-footer">
      <div class="galerie-selected-info">Aucune sélection</div>
      <div class="galerie-actions">
        <button type="button" class="btn galerie-cancel">Annuler</button>
        <button type="button" class="btn btn-primary galerie-validate" disabled>Ajouter</button>
      </div>
    </div>
  `;
  back.appendChild(modal);
  document.body.appendChild(back);

  const tabsEl = modal.querySelector(".galerie-tabs");
  cats.forEach(c => {
    const m = GALERIE_CAT_LABELS[c] || { icon: "📂", label: c };
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "galerie-tab";
    if (c === state.cat) btn.classList.add("active");
    btn.dataset.cat = c;
    btn.innerHTML = `<span class="gtab-icon">${m.icon}</span><span>${escapeHtml(m.label)}</span>`;
    btn.addEventListener("click", () => {
      state.cat = c; state.sub = null; state.search = "";
      modal.querySelector("#galerie-search-input").value = "";
      modal.querySelectorAll(".galerie-tab").forEach(t => t.classList.toggle("active", t.dataset.cat === c));
      renderSubs(); renderGrid();
    });
    tabsEl.appendChild(btn);
  });

  function renderSubs() {
    const subs = modal.querySelector(".galerie-subs");
    subs.innerHTML = "";
    const data = BANQUE_IMAGES[state.cat] || {};
    const subKeys = Object.keys(data);
    if (subKeys.length === 0) return;
    const allChip = document.createElement("button");
    allChip.type = "button";
    allChip.className = "galerie-sub-chip" + (state.sub === null ? " active" : "");
    allChip.textContent = `Tous (${subKeys.reduce((acc,k) => acc + (Array.isArray(data[k]) ? data[k].length : 0), 0)})`;
    allChip.addEventListener("click", () => { state.sub = null; renderSubs(); renderGrid(); });
    subs.appendChild(allChip);
    subKeys.forEach(k => {
      const arr = Array.isArray(data[k]) ? data[k] : [];
      const c = document.createElement("button");
      c.type = "button";
      c.className = "galerie-sub-chip" + (state.sub === k ? " active" : "");
      c.textContent = `${k} (${arr.length})`;
      c.addEventListener("click", () => { state.sub = k; renderSubs(); renderGrid(); });
      subs.appendChild(c);
    });
  }

  function getCurrentItems() {
    const data = BANQUE_IMAGES[state.cat] || {};
    let items = [];
    if (state.sub) {
      items = (Array.isArray(data[state.sub]) ? data[state.sub] : []).map(it => ({ ...it, _cat: state.cat, _sub: state.sub }));
    } else {
      Object.keys(data).forEach(k => {
        const arr = Array.isArray(data[k]) ? data[k] : [];
        arr.forEach(it => items.push({ ...it, _cat: state.cat, _sub: k }));
      });
    }
    if (state.search.trim()) {
      const q = state.search.trim().toLowerCase();
      items = items.filter(it => (it.nom || "").toLowerCase().includes(q) || (it._sub || "").toLowerCase().includes(q));
    }
    return items;
  }

  function renderGrid() {
    const grid = modal.querySelector(".galerie-grid");
    grid.innerHTML = "";
    const items = getCurrentItems();
    if (items.length === 0) {
      grid.innerHTML = `<div class="galerie-empty">Aucune image ne correspond à ta recherche.</div>`;
      return;
    }
    items.forEach(it => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "galerie-tile";
      tile.draggable = true;
      const isSelected = state.selected.some(s => s.fichier === it.fichier);
      if (isSelected) tile.classList.add("selected");
      const ecoBadge = it.eco === "bon"     ? `<span class="g-eco bon" title="Bon choix éco-responsable">✅</span>` :
                       it.eco === "moyen"   ? `<span class="g-eco moyen" title="Choix moyen">🟡</span>` :
                       it.eco === "mauvais" ? `<span class="g-eco mauvais" title="Mauvais choix éco">❌</span>` : "";
      tile.innerHTML = `
        <div class="g-img-wrap">
          <img src="${encodeURI(it.fichier)}" alt="${escapeHtml(it.nom)}" loading="lazy" />
          ${ecoBadge}
          <span class="g-check">✓</span>
        </div>
        <div class="g-name">${escapeHtml(it.nom)}</div>
        <div class="g-sub">${escapeHtml(it._sub)}</div>
      `;
      tile.addEventListener("click", () => toggleSelect(it, tile));
      tile.addEventListener("dragstart", (e) => {
        const payload = { fichier: it.fichier, nom: it.nom, eco: it.eco || null, categorie: it._cat, sous_categorie: it._sub };
        e.dataTransfer.setData("application/x-galerie-image", JSON.stringify(payload));
        e.dataTransfer.setData("text/plain", it.fichier);
        e.dataTransfer.effectAllowed = "copy";
        tile.classList.add("dragging");
      });
      tile.addEventListener("dragend", () => tile.classList.remove("dragging"));
      grid.appendChild(tile);
    });
  }

  function toggleSelect(item, tileEl) {
    const idx = state.selected.findIndex(s => s.fichier === item.fichier);
    if (idx >= 0) {
      state.selected.splice(idx, 1);
      tileEl.classList.remove("selected");
      // Retire l'input quantité s'il existe
      const q = tileEl.querySelector(".g-qte-input");
      if (q) q.remove();
    } else {
      if (!state.multi) {
        state.selected = [];
        modal.querySelectorAll(".galerie-tile.selected").forEach(t => {
          t.classList.remove("selected");
          const oq = t.querySelector(".g-qte-input");
          if (oq) oq.remove();
        });
      }
      const obj = {
        fichier: item.fichier, nom: item.nom, eco: item.eco || null,
        categorie: item._cat, sous_categorie: item._sub
      };
      // V4.52 : ajoute un champ quantité dans la tuile si demandé
      if (state.withQuantity) {
        obj.quantite = "";
        const qIn = document.createElement("input");
        qIn.type = "text";
        qIn.className = "g-qte-input";
        qIn.placeholder = "Qté (ex: 100g)";
        qIn.addEventListener("click", e => e.stopPropagation()); // ne pas désélectionner
        qIn.addEventListener("input", () => { obj.quantite = qIn.value; });
        tileEl.appendChild(qIn);
        setTimeout(() => qIn.focus(), 50);
      }
      state.selected.push(obj);
      tileEl.classList.add("selected");
    }
    refreshFooter();
  }

  function refreshFooter() {
    const info = modal.querySelector(".galerie-selected-info");
    const btn = modal.querySelector(".galerie-validate");
    // V4.79 — mode browse : on parcourt sans ajouter
    if (state.browseMode) {
      if (state.selected.length === 0) {
        info.textContent = "Clique sur une image pour la voir en grand";
        btn.disabled = true;
        btn.textContent = "🔍 Voir en grand";
      } else {
        info.textContent = `🖼️ ${state.selected[0].nom}`;
        btn.disabled = false;
        btn.textContent = "🔍 Voir en grand";
      }
      return;
    }
    if (state.selected.length === 0) {
      info.textContent = state.multi ? "Aucune sélection — clique sur les images" : "Clique sur une image pour la choisir";
      btn.disabled = true;
      btn.textContent = "Ajouter";
    } else {
      info.textContent = state.multi
        ? `${state.selected.length} image${state.selected.length>1?"s":""} sélectionnée${state.selected.length>1?"s":""}`
        : `✅ Sélection : ${state.selected[0].nom}`;
      btn.disabled = false;
      btn.textContent = state.multi ? `Ajouter (${state.selected.length})` : "Ajouter";
    }
  }

  modal.querySelector("#galerie-search-input").addEventListener("input", (e) => {
    state.search = e.target.value; renderGrid();
  });
  modal.querySelector(".galerie-close").addEventListener("click", closeGaleriePicker);
  modal.querySelector(".galerie-cancel").addEventListener("click", closeGaleriePicker);
  modal.querySelector(".galerie-validate").addEventListener("click", () => {
    if (state.selected.length === 0) return;
    // V4.79 — mode browse : ouvre l'image en grand dans une lightbox
    if (state.browseMode) {
      const img = state.selected[0];
      openImageLightbox(img.fichier, img.nom);
      return;
    }
    const result = state.multi ? state.selected : state.selected[0];
    state.onSelect(result);
    closeGaleriePicker();
  });
  state._escHandler = (e) => { if (e.key === "Escape") closeGaleriePicker(); };
  document.addEventListener("keydown", state._escHandler);

  renderSubs(); renderGrid(); refreshFooter();
  setTimeout(() => modal.querySelector("#galerie-search-input").focus(), 80);
}

/* V4.48 — Popup d'information sur une image (groupe, constituant, conseils) */
function showImageInfoPopup(item) {
  // Ferme l'éventuelle popup ouverte
  const old = document.getElementById("img-info-popup");
  if (old) old.remove();

  const meta = getImageMeta(item) || {};
  const ecoLabels = { bon: "✅ Bon choix éco-responsable", moyen: "🟡 À limiter", mauvais: "❌ À éviter" };

  const back = document.createElement("div");
  back.id = "img-info-popup";
  back.className = "img-info-backdrop";
  back.addEventListener("click", (e) => { if (e.target === back) back.remove(); });

  const card = document.createElement("div");
  card.className = "img-info-card";
  card.style.borderTopColor = meta.couleur || "#4a90d9";

  let infoHTML = "";

  // Bloc nutrition (si pas un emballage/label)
  if (meta.groupe && !meta.type_emballage && !meta.type) {
    infoHTML += `
      <div class="iir-row">
        <div class="iir-label">🥗 Groupe alimentaire</div>
        <div class="iir-value" style="color:${meta.couleur || '#2c3e50'}"><b>${escapeHtml(meta.groupe)}</b></div>
      </div>
    `;
    if (meta.constituants && meta.constituants.length > 0) {
      infoHTML += `
        <div class="iir-row">
          <div class="iir-label">🔬 Constituants principaux</div>
          <div class="iir-value">${meta.constituants.map(c => `<span class="iir-chip">${escapeHtml(c)}</span>`).join("")}</div>
        </div>
      `;
    }
    if (meta.pnns) {
      infoHTML += `
        <div class="iir-row pnns">
          <div class="iir-label">📘 Conseil PNNS</div>
          <div class="iir-value"><i>${escapeHtml(meta.pnns)}</i></div>
        </div>
      `;
    }
  }
  // Bloc emballage
  if (meta.type_emballage) {
    infoHTML += `
      <div class="iir-row">
        <div class="iir-label">📦 Type</div>
        <div class="iir-value"><b>${escapeHtml(meta.type_emballage)}</b></div>
      </div>
    `;
  }
  // Bloc label
  if (meta.type === "Label officiel") {
    infoHTML += `
      <div class="iir-row">
        <div class="iir-label">🏅 Type</div>
        <div class="iir-value"><b>Label officiel garantissant la qualité ou l'origine</b></div>
      </div>
    `;
  }
  // Éco-score
  if (item.eco) {
    infoHTML += `
      <div class="iir-row">
        <div class="iir-label">🌱 Éco-score</div>
        <div class="iir-value"><b>${escapeHtml(ecoLabels[item.eco] || item.eco)}</b></div>
      </div>
    `;
  }
  // Sous-catégorie
  infoHTML += `
    <div class="iir-row">
      <div class="iir-label">📂 Catégorie</div>
      <div class="iir-value">${escapeHtml(item.sous_categorie || "")}</div>
    </div>
  `;

  card.innerHTML = `
    <button type="button" class="img-info-close" title="Fermer">✕</button>
    <div class="img-info-photo"><img src="${encodeURI(item.fichier)}" alt="${escapeHtml(item.nom)}" /></div>
    <div class="img-info-body">
      <h3>${escapeHtml(item.nom)}</h3>
      ${infoHTML}
    </div>
  `;
  card.querySelector(".img-info-close").addEventListener("click", () => back.remove());
  back.appendChild(card);
  document.body.appendChild(back);

  // Ferme avec Échap
  const escH = (e) => { if (e.key === "Escape") { back.remove(); document.removeEventListener("keydown", escH); } };
  document.addEventListener("keydown", escH);
}

function closeGaleriePicker() {
  const back = document.getElementById("galerie-backdrop");
  if (back) back.remove();
  if (_galerieState && _galerieState._escHandler) {
    document.removeEventListener("keydown", _galerieState._escHandler);
  }
  _galerieState = null;
}

/* V4.49 — Bouton dans la barre latérale (remplace l'ancien bouton flottant). */
function installGalerieFloatingButton() {
  if (typeof BANQUE_IMAGES === "undefined") return;
  const btn = document.getElementById("sidebar-banque-images");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // V4.79 — Mode "parcours libre" : on regarde, on n'ajoute rien.
    openGaleriePicker({
      title: "🖼️ Banque d'images — parcourir",
      multi: false,
      browseMode: true,
    });
  });
}

/* V4.79 — Lightbox simple pour zoomer sur une image de la banque. */
function openImageLightbox(fichier, nom) {
  const old = document.getElementById("lightbox-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "lightbox-modal";
  m.className = "lightbox-overlay";
  m.innerHTML = `
    <button class="lightbox-close" aria-label="Fermer">×</button>
    <div class="lightbox-content">
      <img src="${encodeURI(fichier)}" alt="${escapeHtml(nom || '')}" />
      <div class="lightbox-caption">${escapeHtml(nom || '')}</div>
    </div>`;
  document.body.appendChild(m);
  const close = () => m.remove();
  m.querySelector(".lightbox-close").addEventListener("click", close);
  m.addEventListener("click", e => { if (e.target === m) close(); });
  const esc = (e) => { if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); } };
  document.addEventListener("keydown", esc);
}

/* =====================================================================
   V4.66 — 🃏 Jeu MEMORY (paires à associer) — pour réviser un module
   Données par module : MEMORY_DATA[moduleId] = [ {a, b}, ... ]
   ===================================================================== */
const MEMORY_DATA = {
  comprendre: [
    { a: "🎓 Chef-d'œuvre",       b: "Projet de 2 ans en lien avec mon métier" },
    { a: "🎤 Oral final",          b: "10 min devant 2 profs (1 général + 1 spécialité)" },
    { a: "📅 Durée",                b: "2 ans (toute la formation CAP)" },
    { a: "💪 Droit à l'erreur",    b: "Je peux recommencer" },
    { a: "🍽️ Mon projet",          b: "Repas équilibré et éco-responsable" },
    { a: "📊 Note suivi",           b: "50 % de la note finale" },
    { a: "🏁 Date oral",           b: "Juin 2027" },
    { a: "🎯 Capacité évaluée",    b: "Argumenter mes choix" },
  ],
};

function openMemoryGame(moduleId, titreModule) {
  const data = MEMORY_DATA[moduleId];
  if (!data || !data.length) {
    showAppToast("Pas encore de jeu Memory pour ce module 😉");
    return;
  }
  const old = document.getElementById("memory-back");
  if (old) old.remove();

  // Construit les 16 cartes (8 paires × 2)
  const cards = [];
  data.forEach((p, i) => {
    cards.push({ pairId: i, side: "a", txt: p.a });
    cards.push({ pairId: i, side: "b", txt: p.b });
  });
  // Mélange Fisher-Yates
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  const back = document.createElement("div");
  back.id = "memory-back";
  back.className = "img-info-backdrop";
  const card = document.createElement("div");
  card.className = "memory-card";
  back.appendChild(card);
  document.body.appendChild(back);

  let revealed = []; // cartes face visible (en cours de tentative)
  let matched = 0;
  let moves = 0;
  let locked = false;
  const tStart = Date.now();

  function render() {
    card.innerHTML = `
      <button type="button" class="img-info-close" title="Fermer">✕</button>
      <h2>🃏 Memory — ${escapeHtml(titreModule || "Réviser")}</h2>
      <p class="mem-intro">Trouve les <b>${data.length} paires</b> en retournant les cartes 2 par 2. Concentre-toi !</p>
      <div class="mem-stats">
        <span>🎯 Paires : <b id="mem-matched">${matched}</b> / ${data.length}</span>
        <span>🔄 Coups : <b id="mem-moves">${moves}</b></span>
        <span id="mem-timer">⏱️ 0s</span>
      </div>
      <div class="mem-grid">
        ${cards.map((c, i) => `
          <button type="button" class="mem-tile ${c.matched ? "matched" : ""} ${c.flipped ? "flipped" : ""}" data-i="${i}">
            <span class="mem-tile-back">?</span>
            <span class="mem-tile-front">${escapeHtml(c.txt)}</span>
          </button>
        `).join("")}
      </div>
      <div id="mem-end" class="mem-end" style="display:none"></div>
    `;
    card.querySelectorAll(".mem-tile").forEach(t => {
      t.addEventListener("click", () => {
        const i = parseInt(t.dataset.i, 10);
        flipCard(i);
      });
    });
    card.querySelector(".img-info-close").addEventListener("click", close);
  }

  function flipCard(i) {
    if (locked) return;
    const c = cards[i];
    if (c.matched || c.flipped) return;
    c.flipped = true;
    revealed.push(i);
    update();
    if (revealed.length === 2) {
      moves++;
      const [i1, i2] = revealed;
      const c1 = cards[i1], c2 = cards[i2];
      if (c1.pairId === c2.pairId && c1.side !== c2.side) {
        // Match !
        c1.matched = c2.matched = true;
        matched++;
        revealed = [];
        update();
        if (matched === data.length) endGame();
      } else {
        // Pas de match : retourner après 900ms
        locked = true;
        setTimeout(() => {
          c1.flipped = false;
          c2.flipped = false;
          revealed = [];
          locked = false;
          update();
        }, 900);
      }
    }
  }

  function update() {
    cards.forEach((c, i) => {
      const t = card.querySelector(`.mem-tile[data-i="${i}"]`);
      if (!t) return;
      t.classList.toggle("flipped", !!c.flipped);
      t.classList.toggle("matched", !!c.matched);
    });
    const m1 = card.querySelector("#mem-matched");
    const m2 = card.querySelector("#mem-moves");
    if (m1) m1.textContent = matched;
    if (m2) m2.textContent = moves;
  }

  function endGame() {
    const tEnd = Math.round((Date.now() - tStart) / 1000);
    const end = card.querySelector("#mem-end");
    end.style.display = "block";
    const stars = moves <= data.length + 2 ? "🌟🌟🌟" : moves <= data.length + 5 ? "🌟🌟" : "🌟";
    end.innerHTML = `
      <div class="mem-end-emoji">🎉</div>
      <h3>Bravo, toutes les paires trouvées !</h3>
      <p>${stars}<br><b>${moves}</b> coups · <b>${tEnd}</b> secondes</p>
      <div class="mem-end-actions">
        <button type="button" class="btn" id="mem-rejouer">🔁 Rejouer</button>
        <button type="button" class="btn btn-primary" id="mem-fini">Fermer</button>
      </div>
    `;
    showConfetti(2500);
    end.querySelector("#mem-rejouer").addEventListener("click", () => {
      close();
      openMemoryGame(moduleId, titreModule);
    });
    end.querySelector("#mem-fini").addEventListener("click", close);
  }

  // Timer d'affichage
  const timerInt = setInterval(() => {
    const t = card.querySelector("#mem-timer");
    if (!t) return;
    t.textContent = `⏱️ ${Math.round((Date.now() - tStart) / 1000)}s`;
  }, 1000);

  function close() {
    clearInterval(timerInt);
    back.remove();
    document.removeEventListener("keydown", escH);
  }
  const escH = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", escH);
  back.addEventListener("click", e => { if (e.target === back) close(); });

  render();
}

/* =====================================================================
   V4.63 — 🎈 Bulles à éclater (mini-jeu anti-stress)
   Léger, pas de polling continu : intervalle de 700ms, max 12 bulles
   simultanément.
   ===================================================================== */
function openBullesGame() {
  const old = document.getElementById("bulles-back");
  if (old) old.remove();
  const back = document.createElement("div");
  back.id = "bulles-back";
  back.className = "img-info-backdrop";
  const card = document.createElement("div");
  card.className = "bulles-card";
  card.innerHTML = `
    <button type="button" class="img-info-close" title="Fermer">✕</button>
    <h2>🎈 Bulles à éclater</h2>
    <p class="bulles-stats">🌊 Détends-toi · Bulles éclatées : <b id="bulles-count">0</b></p>
    <div class="bulles-zone" id="bulles-zone"></div>
    <p class="bulles-hint">Clique sur les bulles qui montent pour les éclater. Respire calmement.</p>
  `;
  back.appendChild(card);
  document.body.appendChild(back);

  let count = 0;
  const zone = card.querySelector("#bulles-zone");
  const counter = card.querySelector("#bulles-count");
  let stopped = false;

  function spawn() {
    if (stopped) return;
    if (zone.childElementCount >= 12) return; // limiter à 12 bulles simultanées
    const b = document.createElement("button");
    b.type = "button";
    b.className = "bulle";
    const size = 36 + Math.random() * 50;
    b.style.width = size + "px";
    b.style.height = size + "px";
    b.style.left = (5 + Math.random() * 85) + "%";
    b.style.animationDuration = (5 + Math.random() * 4) + "s";
    const colors = ["#a5c8e8", "#b6dac4", "#f0c98c", "#c97a8c", "#9ed8a8"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    b.style.background = `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), ${color})`;
    b.addEventListener("click", () => {
      b.classList.add("pop");
      count++;
      counter.textContent = count;
      // confettis micro chaque 10 bulles
      if (count % 10 === 0) showConfetti(1200);
      setTimeout(() => b.remove(), 350);
    });
    zone.appendChild(b);
    setTimeout(() => { if (b.parentElement) b.remove(); }, 9500);
  }

  const interval = setInterval(spawn, 700);

  function close() {
    stopped = true;
    clearInterval(interval);
    back.remove();
    document.removeEventListener("keydown", escH);
  }
  const escH = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", escH);
  back.addEventListener("click", e => { if (e.target === back) close(); });
  card.querySelector(".img-info-close").addEventListener("click", close);
}

/* =====================================================================
   V4.63 — 🎡 Roue des défis (motivation)
   Roue SVG à 8 segments. Click "Tourner" → animation rotation random,
   atterrit sur une activité, propose de la lancer.
   ===================================================================== */
const ROUE_DEFIS = [
  { emoji: "🃏", label: "Flashcards",     action: () => openFlashcards(null) },
  { emoji: "🎯", label: "Pendu",           action: () => openPendu() },
  { emoji: "💡", label: "Trouve le mot",   action: () => openTrouveLeMot() },
  { emoji: "📱", label: "Conversation",    action: () => openConversations() },
  { emoji: "📖", label: "Glossaire",       action: () => openGlossaire() },
  { emoji: "🌡️", label: "Chaîne du froid", action: () => selectView("section", "eco_responsable") },
  { emoji: "🎈", label: "Bulles détente",  action: () => openBullesGame() },
];

function openRoueDefis() {
  const old = document.getElementById("roue-back");
  if (old) old.remove();

  const back = document.createElement("div");
  back.id = "roue-back";
  back.className = "img-info-backdrop";
  const card = document.createElement("div");
  card.className = "roue-card";
  back.appendChild(card);
  document.body.appendChild(back);

  const N = ROUE_DEFIS.length;
  const SIZE = 360;
  const CX = SIZE / 2, CY = SIZE / 2;
  const R = 160;
  const colors = ["#f0c98c","#4a90d9","#2a8b3a","#e8a13a","#c97a8c","#9b6c3a","#9ed8a8","#f6e07d"];

  // Construit le SVG : 1 segment par activité
  function buildWheelSVG() {
    let svg = `<svg viewBox="0 0 ${SIZE} ${SIZE}" class="roue-svg" id="roue-svg">`;
    for (let i = 0; i < N; i++) {
      const a1 = (Math.PI * 2 * i) / N - Math.PI / 2;
      const a2 = (Math.PI * 2 * (i + 1)) / N - Math.PI / 2;
      const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
      const x2 = CX + R * Math.cos(a2), y2 = CY + R * Math.sin(a2);
      const path = `M${CX},${CY} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`;
      svg += `<path d="${path}" fill="${colors[i % colors.length]}" stroke="#fff" stroke-width="2" />`;
      // Label au centre du segment
      const aMid = (a1 + a2) / 2;
      const tx = CX + (R * 0.65) * Math.cos(aMid);
      const ty = CY + (R * 0.65) * Math.sin(aMid);
      const item = ROUE_DEFIS[i];
      svg += `<text x="${tx}" y="${ty}" text-anchor="middle" font-size="22" dominant-baseline="middle">${item.emoji}</text>`;
      svg += `<text x="${tx}" y="${ty + 18}" text-anchor="middle" font-size="9" font-weight="700" fill="#2c3e50">${escapeHtml(item.label)}</text>`;
    }
    // Centre + flèche
    svg += `<circle cx="${CX}" cy="${CY}" r="22" fill="#fff" stroke="#2c3e50" stroke-width="3" />`;
    svg += `<text x="${CX}" y="${CY + 6}" text-anchor="middle" font-size="20">🎯</text>`;
    svg += `</svg>`;
    return svg;
  }

  card.innerHTML = `
    <button type="button" class="img-info-close" title="Fermer">✕</button>
    <h2>🎡 La Roue des défis</h2>
    <p class="roue-intro">Lance la roue et fais le défi qui sort ! Une autre façon de réviser 🌟</p>
    <div class="roue-wrap">
      <div class="roue-pointer">▼</div>
      <div class="roue-spinner" id="roue-spinner">${buildWheelSVG()}</div>
    </div>
    <div class="roue-actions">
      <button type="button" class="btn btn-primary" id="roue-spin">🎲 Tourner la roue !</button>
    </div>
    <div class="roue-resultat" id="roue-resultat" style="display:none"></div>
  `;

  let spinning = false;
  let totalRotation = 0;
  card.querySelector("#roue-spin").addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    const winnerIdx = Math.floor(Math.random() * N);
    const segDeg = 360 / N;
    // On veut que le pointeur (en haut) arrive sur le centre du segment gagnant
    // Le segment 0 commence à -90° (haut), donc le centre du segment i est à : -90 + (i + 0.5) * segDeg
    // Pour aligner ce centre avec le pointeur (qui est à -90°), on tourne de -((i + 0.5) * segDeg)
    const cible = -((winnerIdx + 0.5) * segDeg);
    // Ajoute 5 tours pour l'effet
    const finalRot = 360 * 5 + cible;
    totalRotation = finalRot;
    const spinner = card.querySelector("#roue-spinner");
    spinner.style.transition = "transform 3.2s cubic-bezier(0.18, 0.95, 0.25, 1)";
    spinner.style.transform = `rotate(${finalRot}deg)`;
    card.querySelector("#roue-spin").disabled = true;
    setTimeout(() => {
      const winner = ROUE_DEFIS[winnerIdx];
      const res = card.querySelector("#roue-resultat");
      res.style.display = "block";
      res.innerHTML = `
        <div class="roue-winner">
          <div class="rw-emoji">${winner.emoji}</div>
          <div class="rw-titre">Ton défi : <b>${escapeHtml(winner.label)}</b></div>
        </div>
        <div class="roue-actions">
          <button type="button" class="btn" id="roue-rejouer">🎲 Re-tourner</button>
          <button type="button" class="btn btn-primary" id="roue-go">🚀 Lancer le défi</button>
        </div>
      `;
      showConfetti(1500);
      res.querySelector("#roue-rejouer").addEventListener("click", () => {
        spinning = false;
        res.style.display = "none";
        card.querySelector("#roue-spin").disabled = false;
      });
      res.querySelector("#roue-go").addEventListener("click", () => {
        close();
        try { winner.action(); } catch (e) { console.error(e); }
      });
    }, 3300);
  });

  function close() {
    back.remove();
    document.removeEventListener("keydown", escH);
  }
  const escH = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", escH);
  back.addEventListener("click", e => { if (e.target === back) close(); });
  card.querySelector(".img-info-close").addEventListener("click", close);
}

/* =====================================================================
   V4.63 — Confettis de victoire (CSS pur, léger)
   À appeler aux moments forts : épreuve validée, menu soumis, attestation,
   DnD 100% réussi, etc.
   ===================================================================== */
function showConfetti(durationMs) {
  if (window._confettiRunning) return;
  window._confettiRunning = true;
  const dur = durationMs || 2800;
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);
  const colors = ["#f0c98c", "#4a90d9", "#2a8b3a", "#e8a13a", "#c97a8c", "#9b6c3a", "#9ed8a8", "#f6e07d"];
  const N = 70;
  for (let i = 0; i < N; i++) {
    const c = document.createElement("div");
    c.className = "confetti-piece";
    c.style.left = (Math.random() * 100) + "%";
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = (Math.random() * 0.6) + "s";
    c.style.animationDuration = (2 + Math.random() * 2) + "s";
    c.style.width = (6 + Math.random() * 6) + "px";
    c.style.height = (10 + Math.random() * 14) + "px";
    c.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    c.style.setProperty("--shift", (Math.random() * 200 - 100) + "px");
    container.appendChild(c);
  }
  setTimeout(() => { container.remove(); window._confettiRunning = false; }, dur + 200);
}

function showAppToast(msg) {
  let t = document.getElementById("app-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "app-toast";
    t.className = "app-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("visible");
  clearTimeout(t._tmo);
  t._tmo = setTimeout(() => t.classList.remove("visible"), 2800);
}

/* ---------- Export Word de la fiche module ---------- */
function exportModuleWord(sec, mod) {
  syncIdentiteToInfos();
  const e = state.infos_eleve;
  const st = sec.module_state;
  const br = s => escapeHtml(s).replace(/\n/g, "<br>");

  let qcmHtml = "";
  if (mod.qcm && st.qcm_score !== null) {
    qcmHtml += `<h2>Mon quiz</h2><p><b>Score : ${st.qcm_score} / ${mod.qcm.length}</b></p><ol>`;
    mod.qcm.forEach(q => {
      const ans = st.qcm_answers[q.id];
      const ok  = ans === q.correct;
      qcmHtml += `<li>${br(q.question)}<br />
        <i>Ma réponse : ${ans !== undefined ? br(q.options[ans]) : "<em>pas de réponse</em>"}</i>
        ${ok ? " ✅" : " ❌ (correct : " + br(q.options[q.correct]) + ")"}
      </li>`;
    });
    qcmHtml += `</ol>`;
  }

  let exoHtml = "";
  if (mod.exercice && st.exercice_order) {
    exoHtml += `<h2>${br(mod.exercice.titre)}</h2>`;
    exoHtml += `<p>Résultat : <b>${st.exercice_ok === true ? "correct ✅" : st.exercice_ok === false ? "incorrect ❌" : "non validé"}</b></p>`;
    exoHtml += `<ol>`;
    st.exercice_order.forEach(id => {
      const it = mod.exercice.items.find(i => i.id === id);
      if (it) exoHtml += `<li>${br(it.label)}</li>`;
    });
    exoHtml += `</ol>`;
  }

  let champsHtml = "";
  sec.champs.forEach(c => {
    if (c.valeur && String(c.valeur).trim()) {
      champsHtml += `<h3>${br(c.label)}</h3><p>${br(c.valeur)}</p>`;
    }
  });

  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>Fiche — ${br(sec.titre)}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 0.7cm; }
  body { font-family: Calibri, Arial, sans-serif; color: #222; font-size: 12pt; }
  h1 { color: #1f4f86; font-size: 22pt; margin: 0 0 6pt; }
  h2 { color: #1f6b3d; font-size: 14pt; border-bottom: 1pt solid #2e8b57; padding-bottom: 3pt; margin-top: 14pt; }
  h3 { color: #1f4f86; font-size: 12pt; margin-top: 10pt; }
  .identity { color: #333; margin-bottom: 10pt; }
  ol, ul { margin: 6pt 0; }
  .score { padding: 6pt; background: #eef4ff; border-left: 4pt solid #2f6fb5; margin: 8pt 0; }
</style></head>
<body>
  <h1>${br(sec.titre)}</h1>
  <div class="identity">
    <b>${br(e.prenom)} ${br(e.nom)}</b> — ${br(e.classe)} (${br(e.annee_scolaire)})
    — ${new Date().toLocaleDateString("fr-FR")}
  </div>

  <h2>Le cours</h2>
  ${mod.cours.map(c => `<h3>${br(c.titre)}</h3><p>${br(c.texte)}</p>`).join("")}

  ${qcmHtml}
  ${exoHtml}

  ${champsHtml ? `<h2>Ce que j'en retiens</h2>${champsHtml}` : ""}
</body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const n = (e.nom || "eleve").replace(/\s+/g, "_");
  a.href = url;
  a.download = `Fiche_${sec.id}_${n}_${new Date().toISOString().slice(0,10)}.doc`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

/* =====================================================================
   V3 — VUE "MES ÉVALUATIONS" (côté élève, lecture seule)
   Affiche les jalons, les notes reçues et les commentaires.
   ===================================================================== */

/* =====================================================================
   V4.62 — Dashboard visuel des évaluations (radar SVG + 6 tuiles colorées)
   Affiché en haut de la vue "Mes évaluations" pour donner à l'élève une
   vue immédiate de sa progression. Couleurs adaptées ado :
     - Rouge < 10  · Orange 10-12  · Jaune 13-14  · Vert 15-17  · Or 18-20.
   ===================================================================== */
function couleurNote(n) {
  if (n == null || isNaN(n)) return { bg: "#e3e7ee", fg: "#5a6471", label: "—",            emoji: "⏳" };
  if (n >= 18) return { bg: "#f0c98c", fg: "#6d4400", label: "Excellent",   emoji: "🏆" };
  if (n >= 15) return { bg: "#9ed8a8", fg: "#1f5e36", label: "Très bien",   emoji: "🌟" };
  if (n >= 13) return { bg: "#f6e07d", fg: "#6d5400", label: "Bien",        emoji: "👍" };
  if (n >= 10) return { bg: "#f6b27a", fg: "#8a3a00", label: "Moyen",       emoji: "💪" };
  return            { bg: "#e89292", fg: "#7a2222", label: "À retravailler", emoji: "📚" };
}

function renderDashboardEvaluations() {
  const wrap = document.createElement("section");
  wrap.className = "dashboard-eval";

  // Récupérer les notes (ou null si pas évalué) pour les 6 jalons
  const data = JALONS.map(j => {
    const ev = (state.evaluations || []).find(e => e.jalon_id === j.id);
    const note = ev ? ev.note_totale : null;
    return { id: j.id, titre: j.titre, court: j.titre.replace(/^Jalon \d+ — /, ""), note: note, ev: ev };
  });

  const evaluees = data.filter(d => d.note != null);
  const moyenne = evaluees.length > 0 ? Math.round(evaluees.reduce((s, d) => s + d.note, 0) / evaluees.length * 10) / 10 : null;
  const meilleure = evaluees.length > 0 ? Math.max(...evaluees.map(d => d.note)) : null;
  const aFaire = data.length - evaluees.length;

  // Bandeau résumé
  const bandeau = document.createElement("div");
  bandeau.className = "dash-summary";
  if (evaluees.length === 0) {
    bandeau.innerHTML = `
      <div class="ds-emoji">🚀</div>
      <div class="ds-text">
        <div class="ds-titre">Tu n'as pas encore d'évaluation</div>
        <div class="ds-sous">Avance dans ton parcours et passe les épreuves : tes notes apparaîtront ici en temps réel !</div>
      </div>
    `;
  } else {
    const moyCol = couleurNote(moyenne);
    bandeau.innerHTML = `
      <div class="ds-emoji">${moyCol.emoji}</div>
      <div class="ds-text">
        <div class="ds-titre">Moyenne de tes évaluations : <b style="color:${moyCol.fg}">${moyenne} / 20</b></div>
        <div class="ds-sous">${evaluees.length}/${data.length} jalons évalués · meilleure note <b>${meilleure}/20</b>${aFaire > 0 ? ` · ${aFaire} restant${aFaire > 1 ? "s" : ""}` : " 🎉 Tous évalués !"}</div>
      </div>
      <div class="ds-stat-pill" style="background:${moyCol.bg};color:${moyCol.fg}">${moyCol.label}</div>
    `;
  }
  wrap.appendChild(bandeau);

  // Conteneur en 2 colonnes : radar à gauche, tuiles à droite
  const grid = document.createElement("div");
  grid.className = "dash-grid";

  // ============ 1. RADAR SVG ============
  const radarBox = document.createElement("div");
  radarBox.className = "dash-radar-box";
  radarBox.innerHTML = `<div class="dash-radar-titre">📊 Mon radar de progression</div>`;
  const N = data.length;
  const SIZE = 320;
  const CX = SIZE / 2, CY = SIZE / 2;
  const R = 130;
  // 5 paliers de 4/20
  const paliers = [4, 8, 12, 16, 20];
  // Coordonnées des sommets pour une note donnée
  function pt(i, value) {
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
    const r = (value / 20) * R;
    return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
  }
  // Polygone des notes réelles (0 si non évalué)
  const ptsReels = data.map((d, i) => pt(i, d.note || 0));
  const polyReels = ptsReels.map(p => `${p.x},${p.y}`).join(" ");

  // Construction du SVG
  let svg = `<svg viewBox="0 0 ${SIZE} ${SIZE}" class="dash-radar-svg" aria-label="Radar des notes par jalon">`;
  // Cercles de fond (paliers)
  paliers.forEach(v => {
    const r = (v / 20) * R;
    svg += `<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="#e3e7ee" stroke-width="1" />`;
  });
  // Étiquettes des paliers (4, 8, 12, 16, 20)
  paliers.forEach(v => {
    const r = (v / 20) * R;
    svg += `<text x="${CX + 3}" y="${CY - r - 2}" font-size="9" fill="#888">${v}</text>`;
  });
  // Axes
  data.forEach((d, i) => {
    const p = pt(i, 20);
    svg += `<line x1="${CX}" y1="${CY}" x2="${p.x}" y2="${p.y}" stroke="#e3e7ee" stroke-width="1" />`;
  });
  // Polygone réel (rempli)
  const moyCol = couleurNote(moyenne);
  svg += `<polygon points="${polyReels}" fill="${moyCol.bg}" fill-opacity="0.55" stroke="${moyCol.fg}" stroke-width="2.5" stroke-linejoin="round" />`;
  // Points individuels colorés selon la note
  data.forEach((d, i) => {
    const p = ptsReels[i];
    const c = couleurNote(d.note);
    svg += `<circle cx="${p.x}" cy="${p.y}" r="${d.note != null ? 6 : 3}" fill="${c.bg}" stroke="${c.fg}" stroke-width="2" />`;
    if (d.note != null) {
      svg += `<text x="${p.x}" y="${p.y + 3}" font-size="8" font-weight="700" fill="${c.fg}" text-anchor="middle">${d.note}</text>`;
    }
  });
  // Étiquettes des axes (J1, J2, …)
  data.forEach((d, i) => {
    const p = pt(i, 22);
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
    const align = Math.cos(angle) > 0.3 ? "start" : Math.cos(angle) < -0.3 ? "end" : "middle";
    const labelCourt = "J" + (i + 1);
    svg += `<text x="${p.x}" y="${p.y + 4}" font-size="13" font-weight="700" fill="#2c3e50" text-anchor="${align}">${labelCourt}</text>`;
  });
  svg += `</svg>`;
  radarBox.innerHTML += svg;

  // Légende sous le radar
  const legend = document.createElement("div");
  legend.className = "dash-legend";
  legend.innerHTML = `
    <span class="dl-item"><span class="dl-dot" style="background:#e89292"></span> &lt;10</span>
    <span class="dl-item"><span class="dl-dot" style="background:#f6b27a"></span> 10-12</span>
    <span class="dl-item"><span class="dl-dot" style="background:#f6e07d"></span> 13-14</span>
    <span class="dl-item"><span class="dl-dot" style="background:#9ed8a8"></span> 15-17</span>
    <span class="dl-item"><span class="dl-dot" style="background:#f0c98c"></span> 18-20</span>
  `;
  radarBox.appendChild(legend);
  grid.appendChild(radarBox);

  // ============ 2. TUILES PAR JALON ============
  const tilesBox = document.createElement("div");
  tilesBox.className = "dash-tiles-box";
  tilesBox.innerHTML = `<div class="dash-tiles-titre">🎯 Mes notes par jalon</div>`;
  const tilesGrid = document.createElement("div");
  tilesGrid.className = "dash-tiles";
  data.forEach((d, i) => {
    const c = couleurNote(d.note);
    const tile = document.createElement("a");
    tile.className = "dash-tile";
    tile.href = "#" + d.id;
    tile.style.borderColor = c.fg;
    tile.style.background = `linear-gradient(135deg, ${c.bg} 0%, color-mix(in srgb, ${c.bg} 70%, white) 100%)`;
    tile.innerHTML = `
      <div class="dt-num" style="color:${c.fg}">J${i + 1}</div>
      <div class="dt-titre">${escapeHtml(d.court)}</div>
      <div class="dt-note" style="color:${c.fg}">${d.note != null ? d.note + "<small>/20</small>" : "—"}</div>
      <div class="dt-status" style="color:${c.fg}">${c.emoji} ${c.label}</div>
    `;
    tile.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(d.id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    tilesGrid.appendChild(tile);
  });
  tilesBox.appendChild(tilesGrid);
  grid.appendChild(tilesBox);

  wrap.appendChild(grid);
  return wrap;
}

function renderJalonsView() {
  const wrap = document.createElement("div");
  wrap.className = "jalons-view";
  // Barre retour
  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `<button type="button" class="btn btn-back">← Retour à l'accueil</button>`;
  back.querySelector("button").addEventListener("click", () => selectView("home"));
  wrap.appendChild(back);

  const head = document.createElement("div");
  head.innerHTML = `
    <h2>Mes évaluations</h2>
    <p class="hint">Voici les jalons de ton parcours et les notes données par tes enseignants.
       Tu peux à tout moment importer un retour d'évaluation transmis par ton professeur.</p>
    <div class="jalons-actions no-print">
      <button class="btn btn-primary" id="btn-import-eval" type="button">Importer une évaluation enseignant</button>
      <input type="file" id="import-eval-file" accept="application/json" hidden />
    </div>
  `;
  wrap.appendChild(head);

  // V4.62 — Tableau de bord visuel des évaluations (radar + tuiles colorées)
  wrap.appendChild(renderDashboardEvaluations());

  JALONS.forEach(j => {
    const ev = (state.evaluations || []).find(e => e.jalon_id === j.id);
    const card = document.createElement("div");
    card.className = "jalon-card" + (ev ? " evaluated" : "");
    card.id = j.id; // V4.62 : ancre pour le scroll depuis les tuiles dashboard

    let inner = `
      <div class="jalon-head">
        <div>
          <span class="year-badge year-${j.annee}">${escapeHtml(ANNEES[j.annee].label)}</span>
          <h3>${escapeHtml(j.titre)}</h3>
          <p class="hint">${escapeHtml(j.consigne)}</p>
        </div>
        <div class="jalon-score">
          ${ev
            ? `<div class="score-big">${ev.note_totale} / 20</div>
               <div class="hint">${escapeHtml(ev.date || "")}</div>`
            : `<div class="score-pending">Pas encore noté</div>`}
        </div>
      </div>
    `;

    // V4.8 : détail des critères avec niveau + remédiation si présente
    if (ev && Array.isArray(ev.criteres) && ev.criteres.length) {
      inner += `<ul class="criteres-list">`;
      ev.criteres.forEach(c => {
        const niv = c.niveau ? `<span class="niv-badge niv-${c.niveau}">${c.niveau}</span>` : "";
        inner += `<li>
          <div class="cl-main">
            ${niv}
            <span class="cl-label">${escapeHtml(c.label || c.id || "")}</span>
            <b class="cl-pts">${c.note ?? "—"}${c.max ? " / " + c.max : ""}</b>
          </div>
          ${c.capacite ? `<div class="cl-cap"><i>Capacité : ${escapeHtml(c.capacite)}</i></div>` : ""}
          ${c.remediation ? `<div class="cl-rem"><b>À retravailler :</b> ${escapeHtml(c.remediation)}</div>` : ""}
        </li>`;
      });
      inner += `</ul>`;
    } else {
      // ancien format : critères du JALONS statique
      inner += `<ul class="criteres-list">`;
      j.criteres.forEach(c => {
        const val = ev ? (ev.criteres?.find(x => x.id === c.id)?.note ?? "—") : "—";
        inner += `<li><div class="cl-main"><span class="cl-label">${escapeHtml(c.label)}</span><b class="cl-pts">${val} / ${c.max}</b></div></li>`;
      });
      inner += `</ul>`;
    }

    if (ev && ev.commentaire) {
      inner += `<div class="jalon-comment"><b>Commentaire :</b> ${escapeHtml(ev.commentaire).replace(/\n/g, "<br>")}</div>`;
    }

    card.innerHTML = inner;
    wrap.appendChild(card);
  });

  // Brancher l'import
  setTimeout(() => {
    wrap.querySelector("#btn-import-eval").addEventListener("click",
      () => wrap.querySelector("#import-eval-file").click());
    wrap.querySelector("#import-eval-file").addEventListener("change", importEvaluationFile);
  }, 0);

  return wrap;
}

function importEvaluationFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      applyEvaluationImport(data);
      saveState();
      renderMain();
      alert("Évaluation importée avec succès ✅");
    } catch (err) { alert("Fichier invalide : " + err.message); }
  };
  r.readAsText(file);
  e.target.value = "";
}

/** Applique un fichier produit par evaluer.html. Structure attendue :
    { type: "cdo_evaluation", eleve: {...}, evaluations: [ {jalon_id, criteres, note_totale, commentaire, date, enseignant} ] }
 */
function applyEvaluationImport(data) {
  if (!data || (data.type && data.type !== "cdo_evaluation")) {
    throw new Error("Ce fichier n'est pas une évaluation enseignant.");
  }
  if (data.eleve) {
    const expected = [state.infos_eleve.nom, state.infos_eleve.prenom, state.infos_eleve.classe]
      .map(v => String(v || "").trim().toLowerCase()).join("|");
    const incoming = [data.eleve.nom, data.eleve.prenom, data.eleve.classe]
      .map(v => String(v || "").trim().toLowerCase()).join("|");
    if (expected !== "||" && incoming !== "||" && expected !== incoming) {
      const ok = confirm("Attention : ce retour d'évaluation ne semble pas correspondre à cet élève.\n\nImporter quand même ?");
      if (!ok) throw new Error("Import annulé : élève différent.");
    }
  }
  if (!Array.isArray(state.evaluations)) state.evaluations = [];
  const incoming = Array.isArray(data.evaluations) ? data.evaluations : [];
  incoming.forEach(ev => {
    // Distinguer par jalon_id + source pour ne pas écraser une auto-éval avec une éval enseignant
    const src = ev.source || "enseignant_import";
    ev.source = src;
    const idx = state.evaluations.findIndex(e => e.jalon_id === ev.jalon_id && (e.source || "enseignant_import") === src);
    if (idx >= 0) {
      // Conserver l'ancienne version dans un historique
      const prev = state.evaluations[idx];
      if (!Array.isArray(prev.historique)) prev.historique = [];
      const snapshot = Object.assign({}, prev);
      delete snapshot.historique;
      prev.historique.push(snapshot);
      ev.historique = prev.historique;
      state.evaluations[idx] = ev;
    } else {
      state.evaluations.push(ev);
    }
  });
}

/* =====================================================================
   V3 — EXPORT WORD : FICHE MENU
   Génère un .doc (HTML Word-compatible) mettant en avant le menu
   avec photo principale, équilibre, éco-responsabilité.
   ===================================================================== */

function findMainPhoto() {
  for (const s of state.sections) {
    for (const p of s.preuves) if (p.is_main && p.type === "photo") return p;
  }
  // fallback : première photo de mon_menu, puis toutes sections
  const mm = state.sections.find(s => s.id === "mon_menu");
  if (mm) { const p = mm.preuves.find(x => x.type === "photo"); if (p) return p; }
  for (const s of state.sections) {
    const p = s.preuves.find(x => x.type === "photo");
    if (p) return p;
  }
  return null;
}

function fieldValue(sectionId, fieldId) {
  const sec = state.sections.find(s => s.id === sectionId);
  if (!sec) return "";
  const f = sec.champs.find(c => c.id === fieldId);
  return f ? (f.valeur || "") : "";
}

function exportFicheMenuWord() {
  syncIdentiteToInfos();
  const e = state.infos_eleve;
  const mainPhoto = findMainPhoto();

  const nomMenu      = fieldValue("mon_menu", "nom_menu") || "(sans titre)";
  const description  = fieldValue("mon_menu", "description");
  const entree       = fieldValue("repas_equilibre", "entree");
  const plat         = fieldValue("repas_equilibre", "plat");
  const laitage      = fieldValue("repas_equilibre", "laitage");
  const dessert      = fieldValue("repas_equilibre", "dessert");
  const equilibre    = fieldValue("mon_menu", "equilibre") || fieldValue("repas_equilibre", "equilibre_global");
  const justif       = fieldValue("repas_equilibre", "justification");
  const ecoResp      = fieldValue("mon_menu", "eco");
  const saison       = fieldValue("eco_responsable", "saison");
  const circuits     = fieldValue("eco_responsable", "circuits");
  const gaspi        = fieldValue("eco_responsable", "gaspillage");
  const packaging    = fieldValue("eco_responsable", "packaging");
  const pointsForts  = fieldValue("mon_menu", "points_forts");

  const br = s => escapeHtml(s).replace(/\n/g, "<br>");

  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>Fiche menu — ${br(nomMenu)}</title>
<style>
  @page WordSection1 { size: 21cm 29.7cm; margin: 0.7cm; }
  body { font-family: Calibri, Arial, sans-serif; color: #222; font-size: 12pt; }
  h1 { color: #1f4f86; font-size: 28pt; margin: 0 0 6pt; }
  h2 { color: #1f6b3d; font-size: 16pt; border-bottom: 2pt solid #2e8b57; padding-bottom: 4pt; margin-top: 20pt; }
  .subtitle { color: #5b6b7b; font-style: italic; font-size: 14pt; margin-bottom: 12pt; }
  .identity { font-size: 11pt; color: #333; margin-bottom: 16pt; }
  .photo-main { text-align: center; margin: 14pt 0; }
  .photo-main img { max-width: 14cm; max-height: 10cm; border: 1pt solid #2f6fb5; }
  .menu-parts { width: 100%; border-collapse: collapse; margin: 10pt 0; }
  .menu-parts td { border: 1pt solid #d2dae3; padding: 8pt 10pt; vertical-align: top; }
  .menu-parts td.label { background: #eef2f6; font-weight: bold; width: 30%; color: #1f4f86; }
  .block { margin: 10pt 0; }
  .block b.label { color: #1f4f86; display: block; margin-bottom: 2pt; }
</style>
</head>
<body>
  <h1>${br(nomMenu)}</h1>
  <div class="subtitle">Fiche menu — Chef-d'œuvre CAP</div>
  <div class="identity">
    <b>${br(e.prenom)} ${br(e.nom)}</b> — ${br(e.classe)} (${br(e.annee_scolaire)})
    — ${new Date().toLocaleDateString("fr-FR")}
  </div>

  ${mainPhoto ? `<div class="photo-main"><img src="${mainPhoto.contenu}" alt="" /></div>` : ""}

  ${description ? `<div class="block"><b class="label">Description du menu</b>${br(description)}</div>` : ""}

  <h2>Composition du menu</h2>
  <table class="menu-parts">
    ${entree  ? `<tr><td class="label">Entrée</td><td>${br(entree)}</td></tr>` : ""}
    ${plat    ? `<tr><td class="label">Plat principal</td><td>${br(plat)}</td></tr>` : ""}
    ${laitage ? `<tr><td class="label">Laitage</td><td>${br(laitage)}</td></tr>` : ""}
    ${dessert ? `<tr><td class="label">Dessert</td><td>${br(dessert)}</td></tr>` : ""}
  </table>

  <h2>Pourquoi ce menu est équilibré</h2>
  ${equilibre ? `<div class="block">${br(equilibre)}</div>` : ""}
  ${justif    ? `<div class="block"><b class="label">Justification nutritionnelle</b>${br(justif)}</div>` : ""}

  <h2>Pourquoi ce menu est éco-responsable</h2>
  ${ecoResp   ? `<div class="block">${br(ecoResp)}</div>` : ""}
  ${saison    ? `<div class="block"><b class="label">Produits de saison</b>${br(saison)}</div>` : ""}
  ${circuits  ? `<div class="block"><b class="label">Circuits courts / proximité</b>${br(circuits)}</div>` : ""}
  ${gaspi     ? `<div class="block"><b class="label">Lutte contre le gaspillage</b>${br(gaspi)}</div>` : ""}
  ${packaging ? `<div class="block"><b class="label">Packaging éco-responsable</b>${br(packaging)}</div>` : ""}

  ${pointsForts ? `<h2>Points forts</h2><div class="block">${br(pointsForts)}</div>` : ""}

</body></html>`;

  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const n = (e.nom || "eleve").replace(/\s+/g, "_");
  a.href = url;
  a.download = `FicheMenu_${n}_${new Date().toISOString().slice(0,10)}.doc`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
}

function computeTotals() {
  const t = { done: 0, validated: 0, to_review: 0, in_progress: 0, not_started: 0 };
  state.sections.forEach(s => {
    if (s.statut_enseignant === "validated") t.validated++;
    if (s.statut_enseignant === "to_review") t.to_review++;
    if (s.statut_eleve === "done") t.done++;
    else if (s.statut_eleve === "in_progress") t.in_progress++;
    else t.not_started++;
  });
  return t;
}

/* =====================================================================
   12. ÉVÉNEMENTS GLOBAUX
   ===================================================================== */

function bindGlobalEvents() {
  const on = (id, event, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  };
  on("btn-save", "click", () => saveState(true));
  on("btn-export", "click", exportJSON);
  on("btn-import", "click", () => document.getElementById("import-file")?.click());
  on("import-file", "change", importJSON);
  on("btn-print-dossier", "click", printDossier);
  on("btn-print-oral", "click", printOralOnly);
  // RGPD : export Word retiré
  on("btn-logout", "click", () => { if (window.PSR_AUTH) window.PSR_AUTH.logout(); });
  on("btn-reset", "click", resetAll);

  document.querySelectorAll(".view-btn").forEach(b => {
    b.addEventListener("click", () => selectView(b.dataset.view));
  });

  // V4 : bouton "Mon projet" persistant dans le header
  const btnMonProjet = document.getElementById("btn-mon-projet");
  if (btnMonProjet) btnMonProjet.addEventListener("click", () => selectView("projet"));

  // V4.25 : avatar header cliquable pour ouvrir l'éditeur
  const headerAvatar = document.getElementById("header-avatar");
  if (headerAvatar) headerAvatar.addEventListener("click", openAvatarEditor);
}

/* =====================================================================
   13. IMPORT / EXPORT / RESET
   ===================================================================== */

function exportJSON() {
  // V4.29 : mini-bilan optionnel avant l'export
  showBilanSeance(() => doExportJSON());
}
function doExportJSON() {
  state.meta.date_dernier_export = new Date().toISOString();
  saveState(true);
  dirtySinceExport = false;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const n = (state.infos_eleve.nom || "eleve").replace(/\s+/g, "_");
  a.href = url; a.download = `portfolio_${n}_${new Date().toISOString().slice(0,10)}.json`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  updateExportIndicator();
}

function importJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!confirm("Importer ce fichier remplacera vos données actuelles. Continuer ?")) {
    e.target.value = ""; return;
  }
  const r = new FileReader();
  r.onload = () => {
    try {
      state = mergeWithSchema(JSON.parse(r.result));
      saveState();
      // V4.13 : un import vient d'être fait, donc l'état est cohérent avec le dernier export
      dirtySinceExport = false;
      updateExportIndicator();
      currentView = { type: "home", id: null };
      renderAll();
      alert("Import réussi.");
    } catch (err) { alert("Fichier invalide : " + err.message); }
  };
  r.readAsText(file);
  e.target.value = "";
}

function resetAll() {
  if (!confirm("Effacer TOUT le portfolio ?")) return;
  if (!confirm("Confirmez une seconde fois : tout sera perdu.")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = buildDefaultState();
  saveState();
  currentView = { type: "section", id: state.sections[0].id };
  renderAll();
}

/* =====================================================================
   14. IMPRESSION — DOSSIER FINAL & SYNTHÈSE ORALE (V2)
   ===================================================================== */

function printDossier() {
  const area = document.getElementById("print-area");
  area.innerHTML = buildDossierHTML();
  window.print();
}

function printOralOnly() {
  const area = document.getElementById("print-area");
  area.innerHTML = buildOralHTML(true);
  window.print();
}

function buildDossierHTML() {
  // V2.1 : resynchronisation de sécurité avant impression
  syncIdentiteToInfos();
  const e = state.infos_eleve;
  const today = new Date().toLocaleDateString("fr-FR");

  /* Page de garde */
  let html = `<div class="print-doc">`;
  html += `
    <div class="print-cover">
      <h1>Portfolio — Chef-d'œuvre</h1>
      <div class="project-title">${escapeHtml(state.meta.projet_titre)}</div>
      <div class="project-title"><b>${escapeHtml(e.titre_dossier || "Sans titre")}</b></div>
      <div class="identity">
        <div><b>Nom :</b> ${escapeHtml(e.nom)}</div>
        <div><b>Prénom :</b> ${escapeHtml(e.prenom)}</div>
        <div><b>Classe :</b> ${escapeHtml(e.classe)}</div>
        <div><b>Année scolaire :</b> ${escapeHtml(e.annee_scolaire)}</div>
        <div style="margin-top:14px;"><b>Date d'édition :</b> ${today}</div>
      </div>
    </div>
  `;

  /* Sommaire */
  html += `<div class="print-toc"><h2>Sommaire</h2><ol>`;
  state.sections.forEach((sec) => {
    html += `<li>${escapeHtml(sec.titre)}</li>`;
  });
  html += `<li><b>Synthèse orale finale</b></li>`;
  html += `<li><b>Annexes photos</b></li>`;
  html += `</ol></div>`;

  /* Séparateur : début du dossier principal */
  html += `<div class="print-divider"><span>PARTIE 1 — DOSSIER PRINCIPAL</span></div>`;

  /* Sections numérotées */
  state.sections.forEach((sec, idx) => {
    html += `<div class="print-section">`;
    html += `<div class="print-section-num">${idx + 1}</div>`;
    html += `<h2>${idx + 1}. ${escapeHtml(sec.titre)}</h2>`;
    html += `<p><em>${escapeHtml(sec.description)}</em></p>`;
    html += `<p><b>Statut :</b> ${shortStatus(sec)}`;
    if (sec.date_validation) html += ` · <b>Validé le :</b> ${escapeHtml(sec.date_validation)}`;
    html += `</p>`;

    sec.champs.forEach(c => {
      const v = typeof c.valeur === "boolean" ? (c.valeur ? "Oui" : "Non") : (c.valeur || "");
      if (!v) return;
      html += `<div class="print-field"><b>${escapeHtml(c.label)} :</b>${escapeHtml(String(v)).replace(/\n/g, "<br>")}</div>`;
    });

    if (sec.commentaires_enseignant) {
      html += `<div class="print-field" style="background:#fff8e0;padding:6px;border-left:3px solid #c47a00;">
               <b>Commentaire enseignant :</b> ${escapeHtml(sec.commentaires_enseignant)}</div>`;
    }
    if (sec.note) html += `<div class="print-field"><b>Note :</b> ${escapeHtml(sec.note)}</div>`;
    html += `</div>`;
  });

  /* Séparateur : synthèse orale */
  html += `<div class="print-divider"><span>PARTIE 2 — SYNTHÈSE ORALE FINALE</span></div>`;
  html += buildOralHTML(false);

  /* Séparateur : annexes */
  html += `<div class="print-divider"><span>PARTIE 3 — ANNEXES PHOTOS</span></div>`;
  html += `<div class="print-annex"><h2>Annexes photos</h2>`;
  let hasPhoto = false;
  state.sections.forEach((sec, idx) => {
    const photos = sec.preuves.filter(p => p.type === "photo");
    if (!photos.length) return;
    hasPhoto = true;
    html += `<h3>${idx + 1}. ${escapeHtml(sec.titre)}</h3>`;
    html += `<div class="photos-grid">`;
    photos.forEach(p => {
      html += `<div class="photo-item">
        <img src="${p.contenu}" alt="${escapeHtml(p.nom_fichier || '')}" />
        <div style="font-size:.85rem;padding:4px;">${escapeHtml(p.commentaire || "")}</div>
      </div>`;
    });
    html += `</div>`;
  });
  if (!hasPhoto) html += `<p><em>Aucune photo déposée.</em></p>`;
  html += `</div>`;

  html += `</div>`; // .print-doc
  return html;
}

function buildOralHTML(asFullDoc) {
  const e = state.infos_eleve;
  const parts = buildOralParts();
  let html = asFullDoc ? `<div class="print-doc"><div class="print-oral" style="page-break-before:auto;">` : `<div class="print-oral">`;
  html += `<h2>🎤 Synthèse orale finale</h2>`;
  html += `<p><b>${escapeHtml(e.prenom)} ${escapeHtml(e.nom)}</b> — ${escapeHtml(e.classe)} (${escapeHtml(e.annee_scolaire)})</p>`;
  parts.forEach(part => {
    html += `<div class="oral-part"><h3>${escapeHtml(part.titre)}</h3>`;
    if (part.lines.length === 0) {
      html += `<p><em>Section à compléter.</em></p>`;
    } else {
      part.lines.forEach(l => {
        html += `<p><b>${escapeHtml(l.label)} :</b><br />${escapeHtml(l.valeur).replace(/\n/g, "<br>")}</p>`;
      });
    }
    html += `</div>`;
  });
  html += `</div>`;
  if (asFullDoc) html += `</div>`;
  return html;
}

/* =====================================================================
   15. PROGRESSION, ALERTES
   ===================================================================== */

function isSectionEmpty(sec) {
  return sec.champs.every(c => !c.valeur || c.valeur === false) && sec.preuves.length === 0;
}

/** Ratio de champs réellement remplis (0..1). Les photos comptent comme un champ. */
function computeCompleteness(sec) {
  const total = sec.champs.length + 1; // +1 pour les preuves/photos
  if (total === 0) return 0;
  let filled = 0;
  sec.champs.forEach(c => {
    const v = c.valeur;
    // V4.60 : gérer tous les types de valeur (chaîne, tableau, objet, booléen)
    if (c.type === "checkbox") {
      if (v) filled++;
    } else if (typeof v === "string") {
      if (v.trim()) filled++;
    } else if (Array.isArray(v)) {
      // Repeater, checklist, image_picker_multi, etc.
      if (v.length > 0) filled++;
    } else if (v && typeof v === "object") {
      // composante_repas (a un nom OU des ingrédients) ; image_picker_single (a un fichier)
      if (v.fichier) filled++;
      else if (Array.isArray(v.ingredients) && v.ingredients.length > 0) filled++;
      else if (typeof v.nom === "string" && v.nom.trim()) filled++;
      else if (Object.keys(v).some(k => v[k])) filled++;
    } else if (typeof v === "number") {
      filled++;
    }
  });
  if (sec.preuves.length > 0) filled++;
  return filled / total;
}

/** Une section est "marquée terminée mais peu remplie" si l'élève a mis
    "done" mais que la complétude est en dessous du seuil. */
function isUnderfilled(sec) {
  return sec.statut_eleve === "done" && computeCompleteness(sec) < MIN_COMPLETENESS;
}

function updateProgress() {
  const total = state.sections.length;
  let done = 0, validated = 0;
  state.sections.forEach(s => {
    if (s.statut_eleve === "done") done++;
    if (s.statut_enseignant === "validated") validated++;
  });
  const pct = Math.round((done / total) * 100);
  state.progression = { pourcentage_global: pct, sections_terminees: done, sections_validees: validated };
  document.getElementById("progress-percent").textContent = pct + " %";
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-stats").textContent = `${done} / ${total} terminées · ${validated} validées`;
  renderAlerts();
}

function renderAlerts() {
  // V4.6 : on ne garde que l'alerte "à revoir" (utile à l'élève).
  // L'alerte "sections non remplies" a été retirée — elle polluait l'affichage.
  const box = document.getElementById("alerts");
  box.innerHTML = "";
  const toReview = state.sections.filter(s => s.statut_enseignant === "to_review");
  if (toReview.length) {
    const a = document.createElement("div");
    a.className = "alert-box review";
    a.innerHTML = `<b>${toReview.length} section(s) à revoir</b> : ` +
      toReview.map(s => escapeHtml(s.titre)).join(" · ");
    box.appendChild(a);
  }
}

function updateSaveIndicator(saved, overrideText) {
  const el = document.getElementById("save-indicator");
  if (overrideText) { el.textContent = overrideText; el.classList.remove("saved"); return; }
  if (saved) {
    el.textContent = "Enregistré à " + new Date().toLocaleTimeString("fr-FR");
    el.classList.add("saved");
  }
}

/* =====================================================================
   V4.13 — INDICATEUR D'EXPORT + RAPPELS + AVERTISSEMENT FERMETURE
   ---------------------------------------------------------------------
   3 niveaux de protection contre la perte de données :
   - Indicateur permanent du dernier export dans le header
   - Rappel automatique au-delà de 25 min sans export (toast)
   - Avertissement avant fermeture si modifications non exportées
   ===================================================================== */

// Affiche le temps écoulé depuis le dernier export, en relatif
function updateExportIndicator() {
  const el = document.getElementById("export-indicator");
  if (!el) return;
  const last = state.meta.date_dernier_export;
  // V4.64 : ne pas alerter un nouveau portfolio (créé < 1h) — sinon ça fait peur
  const created = state.meta && state.meta.date_creation ? new Date(state.meta.date_creation).getTime() : Date.now();
  const ageMs = Date.now() - created;
  const isNewPortfolio = ageMs < 60 * 60 * 1000; // < 1h depuis création

  if (!last) {
    if (isNewPortfolio) {
      // Nouveau : message doux d'invitation
      el.textContent = "💾 N'oublie pas d'exporter en fin de séance";
      el.className = "export-indicator soft";
    } else {
      el.textContent = "Jamais exporté ⚠";
      el.className = "export-indicator never";
    }
    return;
  }
  const ms = Date.now() - new Date(last).getTime();
  const min = Math.floor(ms / 60000);
  const heures = Math.floor(min / 60);
  const jours  = Math.floor(heures / 24);
  let txt, cls;
  if (min < 1)        { txt = "✅ Exporté à l'instant";        cls = "fresh"; }
  else if (min < 5)   { txt = `✅ Exporté il y a ${min} min`;  cls = "fresh"; }
  else if (min < 30)  { txt = `Exporté il y a ${min} min`;     cls = (dirtySinceExport ? "warning" : "ok"); }
  else if (min < 120) { txt = `Pense à exporter (${min} min)`; cls = "warning"; }
  else if (heures < 24){ txt = `⚠ Pas exporté depuis ${heures}h`; cls = "alert"; }
  else                { txt = `🚨 Pas exporté depuis ${jours} jour${jours>1?"s":""} !`; cls = "alert"; }
  el.textContent = txt;
  el.className = "export-indicator " + cls;
}

// Affiche un toast de rappel (non bloquant)
function showExportRappelToast() {
  const old = document.getElementById("export-toast");
  if (old) return; // pas de doublon
  const t = document.createElement("div");
  t.id = "export-toast";
  t.className = "export-toast";
  t.innerHTML = `
    <div class="et-icon">⚠</div>
    <div class="et-body">
      <div class="et-title">Pense à exporter ton portfolio</div>
      <div class="et-desc">Tu as fait beaucoup de modifications. Exporte ton fichier JSON pour ne rien perdre.</div>
    </div>
    <button type="button" class="btn btn-primary" id="et-export">Exporter maintenant</button>
    <button type="button" class="btn btn-sm" id="et-close">Plus tard</button>
  `;
  document.body.appendChild(t);
  t.querySelector("#et-export").addEventListener("click", () => {
    exportJSON();
    t.remove();
  });
  t.querySelector("#et-close").addEventListener("click", () => t.remove());
}

// Vérifie périodiquement si un rappel est nécessaire
function startExportRappel() {
  if (exportRappelTimer) clearInterval(exportRappelTimer);
  // Vérification toutes les 60 secondes : MAJ indicateur + déclenche toast si dépassé
  exportRappelTimer = setInterval(() => {
    updateExportIndicator();
    const last = state.meta.date_dernier_export;
    if (!dirtySinceExport) return;
    const minSinceExport = last ? (Date.now() - new Date(last).getTime()) / 60000 : Infinity;
    if (minSinceExport >= 25) showExportRappelToast();
  }, 60000);
}

// Avertissement avant fermeture / rechargement de la page
function setupBeforeUnload() {
  window.addEventListener("beforeunload", (e) => {
    if (!dirtySinceExport) return;
    // Le navigateur affiche un message générique standard. On retourne juste une chaîne.
    const msg = "Tu as des modifications non exportées en JSON. Si tu fermes la page maintenant, elles ne seront sauvegardées que dans ce navigateur. Pense à exporter ton fichier JSON.";
    e.preventDefault();
    e.returnValue = msg; // pour Chrome
    return msg;
  });
}

/* =====================================================================
   16. UTILS & DÉMARRAGE
   ===================================================================== */

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function renderAll() {
  renderSidebar();
  renderMain();
  updateProgress();
  // V4.25 : met à jour l'avatar + prénom dans le header (permanent)
  updateHeaderAvatar();
}

/* V4.25 : avatar + prénom dans le header, cliquable pour ouvrir l'éditeur */
function updateHeaderAvatar() {
  const visu = document.getElementById("header-avatar-visu");
  const name = document.getElementById("header-avatar-name");
  if (!visu || !name) return;
  const e = state.infos_eleve || {};
  const conf = state.preferences && state.preferences.avatar_compose;
  if (conf) {
    visu.innerHTML = buildAvatarSVG(conf, 36);
  } else if (e.photo_profil) {
    visu.innerHTML = `<img src="${e.photo_profil}" alt="" />`;
  } else if (state.preferences && state.preferences.avatar) {
    visu.innerHTML = `<span class="hav-emoji">${escapeHtml(state.preferences.avatar)}</span>`;
  } else {
    // RGPD : initiales basées sur le code élève (1-2 premiers caractères)
    const code = e.userCode || "?";
    const initials = code.slice(0, 2).toUpperCase();
    visu.innerHTML = `<span class="hav-initials">${escapeHtml(initials)}</span>`;
  }
  // RGPD : on affiche le code élève (jamais le prénom/nom)
  name.textContent = e.userCode || "Mon profil";
}

function init() {
  // V4.15 : si on est dans correction.html, l'outil enseignant gère lui-même son init
  if (window.IS_TEACHER_TOOL) {
    if (typeof initTeacherCorrection === "function") {
      initTeacherCorrection();
    }
    return;
  }
  state = loadState();
  // V2.1 : sync bidirectionnelle identité / infos_eleve à l'ouverture
  syncInfosToIdentite();
  syncIdentiteToInfos();
  // V4 : on démarre sur la page "Accueil" plutôt qu'une section au hasard
  currentView = { type: "home", id: null };
  bindGlobalEvents();
  renderAll();
  updateSaveIndicator(true);
  // V4.13 : indicateur export + rappels + avertissement fermeture
  updateExportIndicator();
  startExportRappel();
  setupBeforeUnload();
  // V4.20 : applique les préférences (couleur, contraste) + boutons flottants
  applyPreferences();
  setupFloatingTools();
  // V4.42 : bouton flottant universel pour la banque d'images
  installGalerieFloatingButton();
  // V4.4 : écran d'accueil au démarrage
  showSplashScreen();
  // V4.61 : tutoriel "Première visite" pour les nouveaux élèves
  setTimeout(() => maybeShowTutorielPremiereVisite(), 1500);
}

/* V4.61 — Helpers pré-remplissage étiquetage depuis le menu composé */
function collectIngredientsFromMenu() {
  const composantes = ["entree","plat","laitage","dessert","boisson"];
  const all = [];
  composantes.forEach(c => {
    const r = fvRaw("repas_equilibre", c);
    if (r && typeof r === "object" && Array.isArray(r.ingredients)) {
      r.ingredients.forEach(i => {
        if (i.aliment) {
          const q = i.quantite ? ` (${i.quantite})` : "";
          all.push(i.aliment + q);
        }
      });
    } else if (typeof r === "string" && r.trim()) {
      all.push(r.trim());
    }
  });
  if (all.length === 0) return "";
  return all.join(", ") + ".";
}

function detectAllergenesFromMenu() {
  const composantes = ["entree","plat","laitage","dessert","boisson"];
  const allIngs = [];
  composantes.forEach(c => {
    const r = fvRaw("repas_equilibre", c);
    if (r && typeof r === "object" && Array.isArray(r.ingredients)) {
      r.ingredients.forEach(i => allIngs.push(i));
    }
  });
  return detectAllergenes(allIngs);
}

/* V4.61 — Vérification "Es-tu prêt pour l'épreuve ?"
   Avant la 1re tentative d'une épreuve, vérifie que l'élève a vraiment
   travaillé : QCM tous faits, score ≥ 60%, exercice fait, ≥ 50% des DnD
   réussis. Si lacunes détectées, propose un confirm() avec récap.
   Objectif pédagogique : éviter le survol et garantir un acquis solide. */
function verifierPretPourEpreuve(sec, mod) {
  const st = sec.module_state || {};
  const lacunes = [];
  const totalQcm = (mod.qcm || []).length;
  const repondus = Object.keys(st.qcm_answers || {}).length;
  if (totalQcm > 0 && repondus < totalQcm) {
    lacunes.push({ icon: "📝", txt: `<b>${repondus} / ${totalQcm} questions QCM répondues</b>`,
                   conseil: "Réponds à toutes les questions du cours d'abord." });
  }
  if (totalQcm > 0 && repondus === totalQcm && st.qcm_score !== undefined &&
      st.qcm_score !== null && (st.qcm_score / totalQcm) < 0.6) {
    lacunes.push({ icon: "📊", txt: `Score QCM <b>${st.qcm_score} / ${totalQcm}</b> — sous 60%`,
                   conseil: "Relis les cours sur ce que tu as raté." });
  }
  if (mod.exercice && st.exercice_ok !== true) {
    lacunes.push({ icon: "🎯", txt: "Exercice de manipulation pas encore réussi",
                   conseil: "Fais l'exercice de classement / d'ordre avant." });
  }
  const exosDnd = (typeof EXOS_DND !== "undefined" && EXOS_DND[sec.id]) || [];
  const dndState = st.dnd_state || {};
  const dndsFaits = exosDnd.filter(e => dndState[e.id] && dndState[e.id].completed).length;
  if (exosDnd.length > 0 && dndsFaits < Math.ceil(exosDnd.length / 2)) {
    lacunes.push({ icon: "🎮", txt: `Seulement <b>${dndsFaits} / ${exosDnd.length} exercices interactifs</b> réussis`,
                   conseil: "Fais au moins la moitié des exos drag & drop avant l'épreuve." });
  }
  if (lacunes.length === 0) return true;

  // Affiche un confirm() avec les lacunes (simple et synchrone)
  const msg =
    "⚠️ ES-TU VRAIMENT PRÊT·E POUR L'ÉPREUVE ?\n\n" +
    "On a détecté quelques points à travailler avant :\n\n" +
    lacunes.map(l => `${l.icon}  ${l.txt.replace(/<[^>]+>/g,"")}\n   👉 ${l.conseil}`).join("\n\n") +
    "\n\n💡 L'épreuve compte pour ton attestation. Mieux vaut être bien préparé·e.\n\n" +
    "Veux-tu quand même passer l'épreuve maintenant ?\n" +
    "(Annuler = je retourne travailler ; OK = je passe quand même)";
  return confirm(msg);
}

/* V4.61 — Tutoriel "Première visite" pour guider les élèves perdus.
   S'affiche UNE SEULE FOIS, après le splash. Sauvegardé dans
   state.tutoriel_termine = true pour ne pas se rejouer. */
function maybeShowTutorielPremiereVisite() {
  if (state.tutoriel_termine) return;
  // Si l'élève a déjà commencé à remplir, c'est qu'il connaît déjà
  const dejaCommence = state.sections.some(s => s.statut_eleve !== "not_started");
  if (dejaCommence) {
    state.tutoriel_termine = true;
    saveState();
    return;
  }
  openTutorielPremiereVisite();
}

function openTutorielPremiereVisite() {
  const old = document.getElementById("tutoriel-back");
  if (old) old.remove();
  const back = document.createElement("div");
  back.id = "tutoriel-back";
  back.className = "img-info-backdrop";
  const card = document.createElement("div");
  card.className = "tutoriel-card";
  back.appendChild(card);
  document.body.appendChild(back);
  let etape = 0;
  const etapes = [
    {
      emoji: "👋", titre: "Bienvenue dans ton portfolio chef-d'œuvre !",
      texte: "Sur 2 ans, tu vas concevoir un <b>repas équilibré et éco-responsable</b> à emporter. Tu vas le défendre à l'oral à la fin de ton CAP.<br><br>Ce portfolio va t'aider <b>étape par étape</b>.",
      cta: "Suivant →",
    },
    {
      emoji: "📚", titre: "Ton parcours est numéroté 1 → 9",
      texte: "Dans la barre de gauche, clique sur <b>« Mon parcours »</b>. Tu y verras 9 étapes à faire <b>dans l'ordre</b> :<br>1. Comprendre le projet<br>2. Identité<br>3. Hygiène (marche en avant)<br>4. Équilibre alimentaire<br>5. Éco-responsabilité<br>6. Composer ton repas<br>7. Étiquetage<br>8. Mon menu final<br>9. Photos<br><br>👉 Commence par <b>la 1</b> et avance dans l'ordre.",
      cta: "Suivant →",
    },
    {
      emoji: "🎯", titre: "Pour chaque module : cours, exercices, épreuve",
      texte: "Dans chaque étape :<br>1. Tu lis le <b>cours</b> (avec audio si tu veux)<br>2. Tu fais des <b>QCM</b> et des <b>exercices interactifs</b> (drag & drop, ordering…)<br>3. Tu passes l'<b>épreuve d'attestation</b><br>4. Ton·ta enseignant·e <b>valide</b> ton attestation<br><br>👉 Ne saute pas les exercices : ils t'aident à <b>vraiment comprendre</b> avant l'épreuve.",
      cta: "Suivant →",
    },
    {
      emoji: "🆘", titre: "Si tu galères ou si tu veux réviser",
      texte: "<b>💪 Entraîne-toi</b> (en bas à gauche) regroupe :<br>📖 Glossaire · 🃏 Flashcards · 📱 Conversations · 🎯 Pendu · 💡 Trouve le mot · 🎡 Roue des défis · 🎈 Bulles détente<br><br><b>💬 Donner mon avis</b> : dis-nous ce qui marche ou pas.<br><br><b>👤 Mon avatar</b> : personnalise ton profil 😊",
      cta: "Suivant →",
    },
    {
      emoji: "💾", titre: "Important : sauvegarde ton travail !",
      texte: "Tout est sauvegardé automatiquement <b>sur cet ordinateur</b>.<br><br>👉 <b>À chaque fin de séance</b> : clique sur <b>Sauvegarde → Exporter JSON</b> pour récupérer un fichier.<br><br>Ce fichier te permet de continuer ton travail <b>sur un autre ordinateur</b> (ou à la maison). Garde-le précieusement !",
      cta: "🚀 J'ai compris, je commence !",
    },
  ];

  function render() {
    const e = etapes[etape];
    card.innerHTML = `
      <div class="tut-progress">${etape + 1} / ${etapes.length}</div>
      <div class="tut-bar"><div class="tut-bar-fill" style="width:${((etape + 1) / etapes.length) * 100}%"></div></div>
      <div class="tut-emoji">${e.emoji}</div>
      <h2>${escapeHtml(e.titre)}</h2>
      <div class="tut-texte">${e.texte}</div>
      <div class="tut-actions">
        ${etape > 0 ? `<button type="button" class="btn" id="tut-prev">← Précédent</button>` : ""}
        <button type="button" class="btn" id="tut-skip">Passer</button>
        <button type="button" class="btn btn-primary" id="tut-next">${escapeHtml(e.cta)}</button>
      </div>
    `;
    if (etape > 0) card.querySelector("#tut-prev").addEventListener("click", () => { etape--; render(); });
    card.querySelector("#tut-skip").addEventListener("click", finish);
    card.querySelector("#tut-next").addEventListener("click", () => {
      if (etape >= etapes.length - 1) finish();
      else { etape++; render(); }
    });
  }
  function finish() {
    state.tutoriel_termine = true;
    saveState();
    back.remove();
    // Diriger vers Mon parcours
    if (state.sections.find(s => s.id === "identite" && s.statut_eleve === "not_started")) {
      selectView("section", "identite");
    }
  }
  render();
}

/* =====================================================================
   V4.29 — PENSÉE DU JOUR (sur le splash)
   40 phrases qui tournent selon le jour de l'année (déterministe).
   ===================================================================== */
const PENSEES_DU_JOUR = [
  "Une étape à la fois suffit pour avancer.",
  "Tu apprends même quand tu te trompes.",
  "Demander de l'aide, c'est une force.",
  "Tu es plus capable que tu le penses.",
  "Le travail bien fait commence par un pas.",
  "Ce qui est difficile aujourd'hui sera facile demain.",
  "Prendre son temps n'est pas une perte de temps.",
  "Tes idées valent la peine d'être exprimées.",
  "Tu n'es pas seul·e dans ce parcours.",
  "Chaque petit progrès compte.",
  "Tu as le droit de poser des questions.",
  "Une bonne préparation rend tout plus simple.",
  "L'erreur fait partie du chemin.",
  "Garde confiance en ce que tu fais.",
  "Ton avis a de la valeur.",
  "La curiosité est une qualité professionnelle.",
  "Reste fier·e de tes efforts, pas seulement de tes réussites.",
  "Ce que tu fais aujourd'hui prépare ton avenir.",
  "Respire avant de répondre.",
  "Apprends à dire « je ne sais pas encore ».",
  "Le sérieux n'empêche pas la bonne humeur.",
  "Travailler à son rythme, c'est avancer plus loin.",
  "Une assiette équilibrée, c'est aussi un esprit équilibré.",
  "Choisis avec soin : ça se voit à la fin.",
  "Pose des questions plutôt que de rester bloqué·e.",
  "Tu es l'auteur·e de ton chef-d'œuvre.",
  "Note ce que tu apprends, tu seras content·e plus tard.",
  "Mieux vaut un petit travail soigné qu'un grand travail bâclé.",
  "Apprendre est un super-pouvoir.",
  "Sois patient·e avec toi-même.",
  "L'important, c'est de comprendre, pas d'aller vite.",
  "La rigueur en cuisine, c'est la qualité dans l'assiette.",
  "Une bonne idée notée vaut mieux qu'une bonne idée oubliée.",
  "Ton parcours est unique. Reste-toi.",
  "L'organisation libère la créativité.",
  "Un repas réfléchi vaut mieux que dix repas improvisés.",
  "On peut être sérieux·se et passionné·e à la fois.",
  "L'essentiel, c'est de continuer.",
  "Chaque attestation est une étape franchie.",
  "Crois en ton projet.",
];
function getPenseeDuJour() {
  // Index déterministe selon le jour de l'année
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((Date.now() - start.getTime()) / 86400000);
  return PENSEES_DU_JOUR[day % PENSEES_DU_JOUR.length];
}

/* =====================================================================
   V4.29 — BOUTON RESPIRATION ANTI-STRESS (méthode 4-7-8)
   ===================================================================== */
function openRespiration() {
  const old = document.getElementById("resp-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "resp-modal"; m.className = "modal";
  m.innerHTML = `
    <div class="modal-content" style="max-width:480px; text-align:center;">
      <button class="modal-close" id="resp-close">×</button>
      <h2 style="color:var(--c-primary-dark); margin-top:0;">🧘 Pause respiration</h2>
      <p class="hint">Méthode 4-7-8 : inspire 4 sec, retiens 7 sec, expire 8 sec. Trois cycles.</p>
      <div class="resp-anim">
        <div class="resp-circle" id="resp-circle"></div>
        <div class="resp-text" id="resp-text">Prêt(e) ?</div>
      </div>
      <div class="resp-actions">
        <button type="button" class="btn btn-primary" id="resp-start">Commencer</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
  m.addEventListener("click", e => { if (e.target.id === "resp-modal") m.remove(); });
  m.querySelector("#resp-close").addEventListener("click", () => m.remove());

  const circle = m.querySelector("#resp-circle");
  const text = m.querySelector("#resp-text");
  const startBtn = m.querySelector("#resp-start");

  startBtn.addEventListener("click", async () => {
    startBtn.disabled = true; startBtn.textContent = "Cycle en cours…";
    for (let i = 1; i <= 3; i++) {
      text.textContent = `Cycle ${i}/3 — Inspire (4 sec)`;
      circle.className = "resp-circle inspire";
      await new Promise(r => setTimeout(r, 4000));
      text.textContent = `Cycle ${i}/3 — Retiens (7 sec)`;
      circle.className = "resp-circle retiens";
      await new Promise(r => setTimeout(r, 7000));
      text.textContent = `Cycle ${i}/3 — Expire (8 sec)`;
      circle.className = "resp-circle expire";
      await new Promise(r => setTimeout(r, 8000));
    }
    text.textContent = "Voilà, tu peux y aller 🌿";
    circle.className = "resp-circle done";
    startBtn.disabled = false; startBtn.textContent = "Recommencer";
  });
}

/* =====================================================================
   V4.29 — MINI-BILAN DE FIN DE SÉANCE (au moment de l'export JSON)
   ===================================================================== */
function showBilanSeance(callbackAfter) {
  // Si déjà fait dans la dernière heure, on saute
  const last = (state.bilans_seance || [])[(state.bilans_seance || []).length - 1];
  if (last && (Date.now() - new Date(last.date).getTime()) < 3600000) {
    if (callbackAfter) callbackAfter();
    return;
  }
  const old = document.getElementById("bilan-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "bilan-modal"; m.className = "modal";
  m.innerHTML = `
    <div class="modal-content" style="max-width:480px;">
      <button class="modal-close" id="bilan-close">×</button>
      <h2 style="color:var(--c-primary-dark); margin-top:0;">📋 Bilan rapide de ta séance</h2>
      <p class="hint">30 secondes pour faire le point. Ça t'aidera plus tard pour ton oral.</p>
      <div style="margin:14px 0;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">Comment s'est passée ta séance ?</label>
        <div class="bilan-stars" id="bilan-stars">
          ${[1,2,3,4,5].map(n => `<button type="button" class="bilan-star" data-n="${n}">☆</button>`).join("")}
        </div>
      </div>
      <div style="margin:14px 0;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">En une phrase, qu'est-ce que tu retiens ? (optionnel)</label>
        <input type="text" id="bilan-input" maxlength="200" placeholder="Ex : J'ai compris la règle ½ ¼ ¼." style="width:100%; padding:10px; border:1px solid var(--c-border); border-radius:8px;" />
      </div>
      <div style="margin-top:14px; display:flex; gap:8px; justify-content:flex-end;">
        <button type="button" class="btn" id="bilan-skip">Passer</button>
        <button type="button" class="btn btn-primary" id="bilan-save">Enregistrer</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
  let pickedNote = 0;
  m.querySelectorAll(".bilan-star").forEach(b => {
    b.addEventListener("click", () => {
      pickedNote = parseInt(b.dataset.n);
      m.querySelectorAll(".bilan-star").forEach((s, i) => {
        s.textContent = i < pickedNote ? "★" : "☆";
        s.classList.toggle("active", i < pickedNote);
      });
    });
  });
  const close = (saved) => { m.remove(); if (callbackAfter) callbackAfter(); };
  m.querySelector("#bilan-close").addEventListener("click", () => close(false));
  m.querySelector("#bilan-skip").addEventListener("click", () => close(false));
  m.querySelector("#bilan-save").addEventListener("click", () => {
    if (!Array.isArray(state.bilans_seance)) state.bilans_seance = [];
    state.bilans_seance.push({
      date: new Date().toISOString(),
      note: pickedNote || null,
      retient: m.querySelector("#bilan-input").value.trim() || null,
    });
    saveState();
    close(true);
  });
}

/* =====================================================================
   V4.29 — AUTO-ÉVALUATION RAPIDE APRÈS UNE ÉPREUVE
   ===================================================================== */
function showAutoEvalEpreuve(sec, ep) {
  const st = sec.module_state.epreuve_state;
  if (!st) return;
  // Pas plus d'une auto-éval par tentative
  st.auto_eval_done = st.auto_eval_done || {};
  if (st.auto_eval_done[st.tentative]) return;

  const old = document.getElementById("autoeval-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "autoeval-modal"; m.className = "modal";
  m.innerHTML = `
    <div class="modal-content" style="max-width:520px;">
      <button class="modal-close" id="ae2-close">×</button>
      <h2 style="color:var(--c-primary-dark); margin-top:0;">📌 Comment tu as vécu cette épreuve ?</h2>
      <p class="hint">Réponse rapide, ça nous aide à mieux t'accompagner.</p>
      <div class="ae2-block">
        <label>Comment tu te sens après ?</label>
        <div class="ae2-emos">
          <button type="button" class="ae2-emo" data-mood="bien">😊<br /><small>Bien</small></button>
          <button type="button" class="ae2-emo" data-mood="moyen">😐<br /><small>Moyen</small></button>
          <button type="button" class="ae2-emo" data-mood="dur">😟<br /><small>Difficile</small></button>
        </div>
      </div>
      <div class="ae2-block">
        <label>Qu'est-ce qui t'a le plus aidé ?</label>
        <div class="ae2-options">
          <button type="button" class="ae2-opt" data-aide="cours">📘 Le cours</button>
          <button type="button" class="ae2-opt" data-aide="quiz">✅ Les quiz</button>
          <button type="button" class="ae2-opt" data-aide="flashcards">🃏 Les flashcards</button>
          <button type="button" class="ae2-opt" data-aide="conv">📱 Les conversations</button>
          <button type="button" class="ae2-opt" data-aide="prof">👩‍🏫 L'enseignant·e</button>
          <button type="button" class="ae2-opt" data-aide="camarades">👥 Mes camarades</button>
          <button type="button" class="ae2-opt" data-aide="rien">🤷 Rien de particulier</button>
        </div>
      </div>
      <div class="ae2-block">
        <label>Qu'est-ce qui a été difficile ? (optionnel)</label>
        <input type="text" id="ae2-difficile" maxlength="200" placeholder="Une phrase…" style="width:100%; padding:10px; border:1px solid var(--c-border); border-radius:8px;" />
      </div>
      <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px;">
        <button type="button" class="btn" id="ae2-skip">Passer</button>
        <button type="button" class="btn btn-primary" id="ae2-save">Enregistrer</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
  let mood = null, aides = new Set();
  m.querySelectorAll(".ae2-emo").forEach(b => {
    b.addEventListener("click", () => {
      mood = b.dataset.mood;
      m.querySelectorAll(".ae2-emo").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
    });
  });
  m.querySelectorAll(".ae2-opt").forEach(b => {
    b.addEventListener("click", () => {
      const a = b.dataset.aide;
      if (aides.has(a)) { aides.delete(a); b.classList.remove("active"); }
      else { aides.add(a); b.classList.add("active"); }
    });
  });
  const close = () => m.remove();
  m.querySelector("#ae2-close").addEventListener("click", close);
  m.querySelector("#ae2-skip").addEventListener("click", close);
  m.querySelector("#ae2-save").addEventListener("click", () => {
    st.auto_eval_done[st.tentative] = true;
    if (!Array.isArray(state.auto_evaluations)) state.auto_evaluations = [];
    state.auto_evaluations.push({
      date: new Date().toISOString(),
      epreuve: ep.id,
      jalon_section: sec.id,
      tentative: st.tentative,
      mood: mood,
      aides: Array.from(aides),
      difficile: m.querySelector("#ae2-difficile").value.trim() || null,
    });
    saveState();
    close();
  });
}

/* =====================================================================
   V4.29 — SONDAGE (donne ton avis pour améliorer le portfolio)
   ===================================================================== */
// V4.56 : sondage enrichi — checkboxes thématiques + texte libre
const SONDAGE_QUESTIONS = [
  { id: "global",   type: "stars", label: "Globalement, ce portfolio te plaît ?" },
  { id: "facilite", type: "stars", label: "Est-il facile à utiliser ?" },
  { id: "aide",     type: "stars", label: "T'aide-t-il à apprendre ?" },

  { id: "modules_aimes", type: "multi",
    label: "Quels modules as-tu le plus AIMÉS ? (plusieurs choix possibles)",
    options: [
      "🎓 Comprendre le chef-d'œuvre",
      "🧼 Marche en avant (hygiène)",
      "🥗 L'assiette équilibrée",
      "🌱 Gaspillage / éco / circuits courts",
      "🍽️ Composer mon repas",
      "🏷️ L'étiquetage du produit",
      "📌 Mon menu final",
    ] },

  { id: "exercices_aimes", type: "multi",
    label: "Quels TYPES D'EXERCICES t'aident le plus à apprendre ?",
    options: [
      "📘 Les cours à lire (avec audio)",
      "✅ Les QCM (questions à choix multiples)",
      "🎮 Les exercices drag & drop avec photos",
      "🃏 Les flashcards recto/verso",
      "📱 Les conversations façon SMS",
      "🎯 Le pendu nutritionnel",
      "💡 Trouve le mot",
      "🌡️ Le curseur chaîne du froid",
      "🍽️ Le composeur visuel de menu",
    ] },

  { id: "themes_difficiles", type: "multi",
    label: "Quels THÈMES te paraissent les plus DIFFICILES ?",
    options: [
      "Les groupes alimentaires",
      "Les constituants (protides/glucides/lipides)",
      "La règle ½ ¼ ¼",
      "DLC / DDM",
      "Les labels (AB, AOP, IGP, Label Rouge…)",
      "La saisonnalité",
      "Les circuits courts",
      "Les emballages éco-responsables",
      "L'étiquetage / 14 allergènes",
      "La marche en avant",
      "Les zones sales / propres",
      "La chaîne du froid",
    ] },

  { id: "outils_utiles", type: "multi",
    label: "Quels OUTILS DE RÉVISION as-tu le plus utilisés ?",
    options: [
      "📖 Glossaire",
      "🃏 Flashcards",
      "📱 Conversations",
      "🎯 Pendu",
      "💡 Trouve le mot",
      "📝 Mes notes",
      "🌦️ Météo des émotions",
      "🖼️ Banque d'images",
      "👤 Mon avatar",
    ] },

  { id: "manque", type: "multi",
    label: "Qu'est-ce qui te MANQUE ?",
    options: [
      "Plus d'exercices",
      "Plus de jeux",
      "Plus de vidéos",
      "Plus d'images",
      "Plus d'aide audio (lecture des cours)",
      "Plus d'exemples concrets de menus",
      "Plus de simplicité",
      "Plus de couleurs",
      "Mode hors-ligne",
      "Autre",
    ] },

  { id: "ressentis", type: "multi",
    label: "Comment tu te SENS quand tu utilises le portfolio ?",
    options: [
      "😊 Motivé·e",
      "💪 En confiance",
      "🤔 Concentré·e",
      "😐 Neutre",
      "😫 Surchargé·e",
      "😴 Fatigué·e",
      "❓ Perdu·e",
      "🎉 Fier·ère de mon travail",
    ] },

  { id: "difficile",     type: "text", label: "🤔 Qu'est-ce qui te paraît le plus difficile ? (1 phrase)" },
  { id: "amelioration",  type: "text", label: "💡 Une chose que tu voudrais qu'on ajoute ou améliore" },
  { id: "felicitations", type: "text", label: "🎁 Un mot pour ton·ta enseignant·e (facultatif)" },
];

function openSondage() {
  const old = document.getElementById("sondage-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "sondage-modal"; m.className = "modal";
  let answers = {};
  let html = `
    <div class="modal-content" style="max-width:680px;">
      <button class="modal-close" id="sg-close">×</button>
      <h2 style="color:var(--c-primary-dark); margin-top:0;">💬 Donne ton avis</h2>
      <p class="hint">Tes réponses aident ton enseignant·e à améliorer le portfolio. C'est anonyme pour la classe (mais associé à ton portfolio).</p>
  `;
  SONDAGE_QUESTIONS.forEach(q => {
    html += `<div class="sg-q"><label>${escapeHtml(q.label)}</label>`;
    if (q.type === "stars") {
      html += `<div class="sg-stars" data-qid="${q.id}">${[1,2,3,4,5].map(n => `<button type="button" class="sg-star" data-q="${q.id}" data-n="${n}">☆</button>`).join("")}</div>`;
    } else if (q.type === "multi") {
      html += `<div class="sg-multi">${q.options.map(o => `<button type="button" class="sg-opt" data-q="${q.id}" data-o="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join("")}</div>`;
    } else if (q.type === "text") {
      html += `<input type="text" data-q="${q.id}" maxlength="240" placeholder="Ta réponse…" style="width:100%; padding:10px; border:1px solid var(--c-border); border-radius:8px;" />`;
    }
    html += `</div>`;
  });
  html += `
      <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:14px;">
        <button type="button" class="btn" id="sg-skip">Annuler</button>
        <button type="button" class="btn btn-primary" id="sg-save">Envoyer</button>
      </div>
    </div>
  `;
  m.innerHTML = html;
  document.body.appendChild(m);
  m.addEventListener("click", e => { if (e.target.id === "sondage-modal") m.remove(); });
  m.querySelector("#sg-close").addEventListener("click", () => m.remove());
  m.querySelector("#sg-skip").addEventListener("click", () => m.remove());

  m.querySelectorAll(".sg-star").forEach(b => {
    b.addEventListener("click", () => {
      const q = b.dataset.q;
      answers[q] = parseInt(b.dataset.n);
      m.querySelectorAll(`.sg-star[data-q="${q}"]`).forEach((s, i) => {
        s.textContent = i < answers[q] ? "★" : "☆";
        s.classList.toggle("active", i < answers[q]);
      });
    });
  });
  m.querySelectorAll(".sg-opt").forEach(b => {
    b.addEventListener("click", () => {
      const q = b.dataset.q;
      answers[q] = answers[q] || [];
      const o = b.dataset.o;
      const idx = answers[q].indexOf(o);
      if (idx >= 0) { answers[q].splice(idx, 1); b.classList.remove("active"); }
      else { answers[q].push(o); b.classList.add("active"); }
    });
  });
  m.querySelector("#sg-save").addEventListener("click", () => {
    // textes
    m.querySelectorAll(`input[data-q]`).forEach(i => {
      if (i.value.trim()) answers[i.dataset.q] = i.value.trim();
    });
    if (!Array.isArray(state.sondages)) state.sondages = [];
    state.sondages.push({ date: new Date().toISOString(), reponses: answers });
    saveState();
    // Confirmation
    m.querySelector(".modal-content").innerHTML = `
      <h2 style="color:var(--c-accent-dark); margin-top:0;">Merci 🙏</h2>
      <p>Ton avis a été enregistré. Il sera dans le prochain JSON que tu envoies à ton enseignant·e.</p>
      <button type="button" class="btn btn-primary" onclick="document.getElementById('sondage-modal').remove();">Fermer</button>
    `;
  });
}

/* =====================================================================
   V4.28 — MÉTÉO DES ÉMOTIONS (à chaque nouvelle journée)
   ---------------------------------------------------------------------
   Outil PSE : 6 émotions primaires avec nuances pour enrichir le
   vocabulaire émotionnel des élèves. Affiché 1 fois par jour après
   le splash. Sauvegardé dans state.meteo_emotions[].
   ===================================================================== */
const EMOTIONS_PRIMAIRES = [
  {
    id: "joie",
    label: "Joie",
    emoji: "😊",
    couleur: "#fff5a5",
    couleurDark: "#8a5a00",
    description: "Je me sens bien.",
    nuances: ["Content(e)", "Heureux(se)", "Fier(ère)", "Enthousiaste", "Détendu(e)", "Reconnaissant(e)", "Optimiste"],
  },
  {
    id: "tristesse",
    label: "Tristesse",
    emoji: "😢",
    couleur: "#cfe2ff",
    couleurDark: "#1f4f86",
    description: "Quelque chose me peine.",
    nuances: ["Triste", "Déçu(e)", "Découragé(e)", "Abattu(e)", "Mélancolique", "Nostalgique", "Démoralisé(e)"],
  },
  {
    id: "colere",
    label: "Colère",
    emoji: "😠",
    couleur: "#fadbdf",
    couleurDark: "#8a2231",
    description: "Quelque chose m'énerve.",
    nuances: ["Frustré(e)", "Agacé(e)", "Énervé(e)", "Irrité(e)", "En colère", "Exaspéré(e)", "Contrarié(e)"],
  },
  {
    id: "peur",
    label: "Peur / Stress",
    emoji: "😨",
    couleur: "#e8dcfe",
    couleurDark: "#5e3da0",
    description: "Quelque chose m'inquiète.",
    nuances: ["Inquiet(ète)", "Stressé(e)", "Anxieux(se)", "Nerveux(se)", "Angoissé(e)", "Intimidé(e)", "Apeuré(e)"],
  },
  {
    id: "surprise",
    label: "Surprise",
    emoji: "😮",
    couleur: "#ffd6e0",
    couleurDark: "#a83b46",
    description: "Quelque chose me prend au dépourvu.",
    nuances: ["Étonné(e)", "Surpris(e)", "Émerveillé(e)", "Curieux(se)", "Intrigué(e)", "Bouche bée"],
  },
  {
    id: "calme",
    label: "Calme / Neutre",
    emoji: "😐",
    couleur: "#d5ecdd",
    couleurDark: "#1f6b3d",
    description: "Je me sens tranquille (ou fatigué).",
    nuances: ["Calme", "Tranquille", "Serein(e)", "Fatigué(e)", "Reposé(e)", "Concentré(e)", "Indifférent(e)"],
  },
];

const TODAY_KEY = () => new Date().toISOString().slice(0, 10);

/* Affiche la météo des émotions si pas encore faite aujourd'hui. */
function showMeteoEmotions(forceShow) {
  const today = TODAY_KEY();
  if (!forceShow && state.meteo_last_check === today) return false;
  // V4.61 : ne pas surcharger les nouveaux élèves — pas de météo
  // pendant les 3 premiers jours OU si le tutoriel n'est pas terminé.
  if (!forceShow) {
    if (!state.tutoriel_termine) return false;
    const created = state.meta && state.meta.date_creation ? new Date(state.meta.date_creation) : null;
    if (created) {
      const ageDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (ageDays < 3) return false;
    }
  }

  const old = document.getElementById("meteo-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "meteo-modal"; m.className = "modal meteo-modal";
  m.innerHTML = `
    <div class="modal-content meteo-content">
      <button class="modal-close" id="meteo-close">×</button>
      <div class="meteo-header">
        <div class="meteo-eyebrow">Météo des émotions</div>
        <h2>Comment tu te sens aujourd'hui ?</h2>
        <p class="hint">Choisis l'émotion qui te correspond le mieux. Tu pourras préciser.</p>
      </div>
      <div class="meteo-emotions" id="meteo-step1">
        ${EMOTIONS_PRIMAIRES.map(e => `
          <button type="button" class="meteo-card" data-emo="${e.id}" style="background:${e.couleur};">
            <div class="meteo-emoji">${e.emoji}</div>
            <div class="meteo-label" style="color:${e.couleurDark};">${escapeHtml(e.label)}</div>
            <div class="meteo-desc">${escapeHtml(e.description)}</div>
          </button>
        `).join("")}
      </div>
      <div class="meteo-skip">
        <button type="button" class="btn btn-sm" id="meteo-skip">Passer pour aujourd'hui</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);

  m.querySelector("#meteo-close").addEventListener("click", () => m.remove());
  m.querySelector("#meteo-skip").addEventListener("click", () => {
    state.meteo_last_check = today;
    saveState();
    m.remove();
  });
  m.querySelectorAll("[data-emo]").forEach(b => {
    b.addEventListener("click", () => showMeteoStep2(b.dataset.emo, m));
  });
  return true;
}

function showMeteoStep2(emoId, modal) {
  const emo = EMOTIONS_PRIMAIRES.find(e => e.id === emoId);
  if (!emo) return;
  const c = modal.querySelector(".meteo-content");
  c.innerHTML = `
    <button class="modal-close" id="meteo-close">×</button>
    <div class="meteo-header">
      <div class="meteo-eyebrow">Météo des émotions · 2/2</div>
      <h2 style="color:${emo.couleurDark};">${emo.emoji} ${escapeHtml(emo.label)}</h2>
      <p class="hint">Plus précisément, parmi ces mots, lequel décrit le mieux ton ressenti ?</p>
    </div>
    <div class="meteo-nuances">
      ${emo.nuances.map(n => `
        <button type="button" class="meteo-nuance" data-nuance="${escapeHtml(n)}" style="border-color:${emo.couleurDark}; color:${emo.couleurDark};">
          ${escapeHtml(n)}
        </button>
      `).join("")}
    </div>
    <div class="meteo-back">
      <button type="button" class="btn btn-sm" id="meteo-back">← Retour</button>
    </div>
  `;
  c.querySelector("#meteo-close").addEventListener("click", () => modal.remove());
  c.querySelector("#meteo-back").addEventListener("click", () => {
    modal.remove();
    showMeteoEmotions(true);
  });
  c.querySelectorAll("[data-nuance]").forEach(b => {
    b.addEventListener("click", () => recordMeteoEmotion(emo, b.dataset.nuance, modal));
  });
}

function recordMeteoEmotion(emo, nuance, modal) {
  if (!Array.isArray(state.meteo_emotions)) state.meteo_emotions = [];
  state.meteo_emotions.push({
    date: new Date().toISOString(),
    emotion: emo.id,
    label: emo.label,
    emoji: emo.emoji,
    couleur: emo.couleur,
    couleurDark: emo.couleurDark,
    nuance: nuance,
  });
  state.meteo_last_check = TODAY_KEY();
  saveState();

  // Écran de confirmation
  const c = modal.querySelector(".meteo-content");
  c.innerHTML = `
    <div class="meteo-header">
      <div class="meteo-eyebrow">Merci d'avoir partagé</div>
      <h2 style="color:${emo.couleurDark};">${emo.emoji} ${escapeHtml(nuance)}</h2>
      <p class="hint">Ton émotion a été enregistrée.</p>
    </div>
    <div class="meteo-confirm">
      <p style="text-align:center;">Bonne séance${state.infos_eleve.prenom ? ", " + escapeHtml(state.infos_eleve.prenom) : ""} !</p>
      <button type="button" class="btn btn-primary btn-lg" id="meteo-go">Commencer ma séance</button>
    </div>
  `;
  c.querySelector("#meteo-go").addEventListener("click", () => modal.remove());
}

/* Vue "Mon journal des émotions" — accessible depuis Espace révision */
function openJournalEmotions() {
  const old = document.getElementById("journal-modal");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "journal-modal"; m.className = "modal";
  const list = (state.meteo_emotions || []).slice().reverse();

  // Stats simples : compte par émotion
  const counts = {};
  list.forEach(e => { counts[e.emotion] = (counts[e.emotion] || 0) + 1; });
  const total = list.length;
  const statsHtml = total === 0
    ? `<p class="hint" style="text-align:center;">Aucune émotion enregistrée pour l'instant.</p>`
    : `<div class="journal-stats">
        ${EMOTIONS_PRIMAIRES.map(e => {
          const n = counts[e.id] || 0;
          const pct = total ? Math.round(n / total * 100) : 0;
          return `<div class="js-row">
            <span class="js-emoji">${e.emoji}</span>
            <span class="js-label">${escapeHtml(e.label)}</span>
            <div class="js-bar"><div style="width:${pct}%; background:${e.couleurDark};"></div></div>
            <span class="js-count">${n}</span>
          </div>`;
        }).join("")}
      </div>`;

  m.innerHTML = `
    <div class="modal-content" style="max-width:680px;">
      <button class="modal-close" id="journal-close">×</button>
      <h2 style="color:var(--c-primary-dark); margin-top:0;">📅 Mon journal des émotions</h2>
      <p class="hint">Voici toutes les émotions que tu as partagées. Cela t'aide à mieux te connaître.</p>
      ${statsHtml}
      ${list.length ? `
        <h3 style="margin-top:18px; color:var(--c-primary-dark);">Historique récent</h3>
        <div class="journal-list">
          ${list.slice(0, 30).map(e => {
            const dt = new Date(e.date).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
            return `<div class="journal-item" style="border-left-color:${e.couleurDark}; background:${e.couleur};">
              <div class="ji-emoji">${e.emoji}</div>
              <div class="ji-info">
                <div class="ji-nuance">${escapeHtml(e.nuance)}</div>
                <div class="ji-meta">${escapeHtml(e.label)} · ${escapeHtml(dt)}</div>
              </div>
            </div>`;
          }).join("")}
        </div>
      ` : ""}
      <div style="margin-top:14px; text-align:center;">
        <button type="button" class="btn btn-primary" id="journal-new">Enregistrer une émotion maintenant</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
  m.addEventListener("click", e => { if (e.target.id === "journal-modal") m.remove(); });
  m.querySelector("#journal-close").addEventListener("click", () => m.remove());
  m.querySelector("#journal-new").addEventListener("click", () => {
    m.remove();
    showMeteoEmotions(true);
  });
}

/* =====================================================================
   V4.4 — ÉCRAN D'ACCUEIL AU DÉMARRAGE
   ---------------------------------------------------------------------
   Sobre, fade-in, montre où en est l'élève. Bouton pour entrer.
   ===================================================================== */
/* =====================================================================
   V4.14 — MODE DÉMO
   ---------------------------------------------------------------------
   L'élève peut visualiser un portfolio d'exemple (Marie DURAND) sans
   toucher au sien. Le vrai état est mis de côté en mémoire JS, le démo
   est chargé en mémoire (PAS écrit dans localStorage), un bandeau visible
   indique le mode démo, et un bouton "Revenir à mon portfolio" restaure.
   ===================================================================== */
function enterDemoMode() {
  if (demoModeActive) return;
  // 1. on sauvegarde le vrai état (en mémoire, pas en localStorage)
  savedRealState = JSON.parse(JSON.stringify(state));
  // 2. on charge le démo en mémoire uniquement (pas saveState !)
  try {
    const demo = JSON.parse(DEMO_PORTFOLIO_JSON);
    state = mergeWithSchema(demo);
  } catch (err) {
    alert("Impossible de charger le portfolio d'exemple : " + err.message);
    savedRealState = null;
    return;
  }
  demoModeActive = true;
  currentView = { type: "home", id: null };
  renderAll();
  showDemoBanner();
  updateExportIndicator();
}

function exitDemoMode() {
  if (!demoModeActive || !savedRealState) return;
  state = savedRealState;
  savedRealState = null;
  demoModeActive = false;
  // restaure dans localStorage l'état réel (par sécurité)
  saveState(true);
  hideDemoBanner();
  currentView = { type: "home", id: null };
  renderAll();
  updateExportIndicator();
}

function showDemoBanner() {
  if (document.getElementById("demo-banner")) return;
  const b = document.createElement("div");
  b.id = "demo-banner";
  b.className = "demo-banner";
  b.innerHTML = `
    <div class="db-left">
      <div class="db-tag">Mode exemple</div>
      <div class="db-text">Tu regardes le portfolio de <b>Marie DURAND</b> (élève fictive).
      Tes propres données sont en sécurité.</div>
    </div>
    <button type="button" class="btn btn-primary" id="db-exit">← Revenir à mon portfolio</button>
  `;
  b.querySelector("#db-exit").addEventListener("click", exitDemoMode);
  document.body.insertBefore(b, document.body.firstChild);
  document.body.classList.add("with-demo-banner");
}

function hideDemoBanner() {
  const b = document.getElementById("demo-banner");
  if (b) b.remove();
  document.body.classList.remove("with-demo-banner");
}

function showSplashScreen() {
  const e = state.infos_eleve;
  const photo = e.photo_profil;
  const total = PARCOURS.length;
  const sectionsTerminees = PARCOURS.filter(p =>
    statutEtape(state.sections.find(s => s.id === p.id)) === "done"
  ).length;
  const modulesTotal = PARCOURS.filter(p => p.isModule).length;
  const modulesFaits = PARCOURS.filter(p => {
    if (!p.isModule) return false;
    const sec = state.sections.find(s => s.id === p.id);
    return sec?.module_state?.qcm_completed;
  }).length;
  const notesEval = (state.evaluations || []).length;

  let prochaine = null;
  for (const p of PARCOURS) {
    if (p.anneeNote) continue;
    const sec = state.sections.find(s => s.id === p.id);
    if (sec && statutEtape(sec) !== "done") { prochaine = p; break; }
  }

  const splash = document.createElement("div");
  splash.id = "splash-screen";
  splash.className = "splash";
  const initials = (escapeHtml((e.prenom||"?").charAt(0)) + escapeHtml((e.nom||"").charAt(0))).toUpperCase() || "?";
  splash.innerHTML = `
    <div class="splash-content">
      <div class="splash-eyebrow">Portfolio Chef-d'œuvre · CAP</div>

      <div class="splash-identity">
        <div class="splash-photo">
          ${(state.preferences && state.preferences.avatar_compose)
            ? `<div class="splash-svg-avatar">${buildAvatarSVG(state.preferences.avatar_compose, 80)}</div>`
            : photo
              ? `<img src="${photo}" alt="" />`
              : `<div class="splash-photo-empty">${initials}</div>`}
        </div>
        <div class="splash-meta">
          <h1 class="splash-name">${escapeHtml(e.prenom || "Bienvenue")} ${escapeHtml(e.nom || "")}</h1>
          <div class="splash-classe">
            ${escapeHtml(e.classe || "")}
            ${e.lycee ? " · " + escapeHtml(e.lycee) : ""}
            ${e.annee_scolaire ? " · " + escapeHtml(e.annee_scolaire) : ""}
          </div>
          ${e.titre_dossier ? `<div class="splash-projet">${escapeHtml(e.titre_dossier)}</div>` : ""}
        </div>
      </div>

      <div class="splash-progress-line">
        <span>Avancement année 1</span>
        <span class="splash-progress-num"><b>${Math.round(sectionsTerminees/total*100)}</b><small> %</small></span>
      </div>
      <div class="splash-progress-bar"><div class="splash-progress-fill" style="width:${Math.round(sectionsTerminees/total*100)}%"></div></div>

      <div class="splash-stats">
        <div class="splash-stat" style="animation-delay:.15s">
          <div class="ss-num">${sectionsTerminees}<small>/${total}</small></div>
          <div class="ss-label">Étapes terminées</div>
        </div>
        <div class="splash-stat" style="animation-delay:.25s">
          <div class="ss-num">${modulesFaits}<small>/${modulesTotal}</small></div>
          <div class="ss-label">Modules réussis</div>
        </div>
        <div class="splash-stat" style="animation-delay:.35s">
          <div class="ss-num">${notesEval}</div>
          <div class="ss-label">Notes reçues</div>
        </div>
      </div>

      ${prochaine
        ? `<div class="splash-next" style="animation-delay:.45s">
             <div class="sn-eyebrow">Prochaine étape</div>
             <div class="sn-titre">${prochaine.emoji} ${escapeHtml(prochaine.label.replace(/^\d+\.\s*/, ""))}</div>
           </div>`
        : `<div class="splash-next" style="animation-delay:.45s">
             <div class="sn-eyebrow">Année 1</div>
             <div class="sn-titre">Toutes les étapes sont terminées.</div>
           </div>`}

      <!-- V4.29 : pensée du jour, sobre, sous la prochaine étape -->
      <div class="splash-pensee" style="animation-delay:.55s">
        « ${escapeHtml(getPenseeDuJour())} »
      </div>


      <button type="button" class="btn btn-primary btn-lg splash-enter" style="animation-delay:.6s">
        Entrer dans mon portfolio
      </button>
      <!-- V4.14 : voir un exemple rempli -->
      <button type="button" class="btn btn-lg splash-demo" style="animation-delay:.7s; margin-top:6px; width:100%;">
        Voir un exemple de portfolio rempli
      </button>
      <div class="splash-demo-hint" style="animation-delay:.75s;">
        Pour découvrir à quoi ressemble un portfolio terminé. Tes données ne seront pas modifiées.
      </div>
    </div>
  `;
  document.body.appendChild(splash);
  const close = () => {
    splash.classList.add("splash-leaving");
    setTimeout(() => {
      splash.remove();
      // V4.28 : après le splash, on propose la météo des émotions (1 fois par jour)
      setTimeout(() => showMeteoEmotions(false), 200);
    }, 500);
  };
  splash.querySelector(".splash-enter").addEventListener("click", close);
  // V4.14 : bouton "Voir un exemple"
  const demoBtn = splash.querySelector(".splash-demo");
  if (demoBtn) demoBtn.addEventListener("click", () => {
    close();
    setTimeout(enterDemoMode, 300);
  });
  document.addEventListener("keydown", function onEsc(ev) {
    if (ev.key === "Escape" || ev.key === "Enter") {
      close();
      document.removeEventListener("keydown", onEsc);
    }
  });
}

/* =====================================================================
   V4.20 — GLOSSAIRE INTÉGRÉ
   Définitions très simplifiées pour CAP, accessibles depuis un panneau.
   ===================================================================== */
const GLOSSAIRE = [
  { mot: "Allergène", def: "Aliment qui peut provoquer une réaction grave chez certaines personnes (œuf, lait, gluten, etc.). Il y en a 14 à signaler obligatoirement sur l'étiquette." },
  { mot: "Allergènes majeurs (les 14)", def: "Liste officielle imposée par la réglementation INCO : gluten, crustacés, œufs, poissons, arachides, soja, lait, fruits à coque, céleri, moutarde, sésame, sulfites, lupin, mollusques. Doivent apparaître en gras ou souligné dans la liste des ingrédients." },
  { mot: "AMAP", def: "Association pour le Maintien d'une Agriculture Paysanne. Tu commandes ton panier directement à un producteur, sans intermédiaire. C'est de la vente directe (circuit court)." },
  { mot: "AOP", def: "Appellation d'Origine Protégée. Label européen qui garantit qu'un produit vient d'un endroit précis (ex : Lentille verte du Puy)." },
  { mot: "AOC", def: "Appellation d'Origine Contrôlée. Version française de l'AOP. Garantit l'origine et le savoir-faire." },
  { mot: "AB (Agriculture Biologique)", def: "Label européen. Garantit que le produit est cultivé sans pesticides chimiques ni OGM." },
  { mot: "AGEC (Loi)", def: "Loi Anti-Gaspillage et Économie Circulaire (2020). Interdit de jeter les invendus, encadre les emballages plastiques." },
  { mot: "Anti-gaspi", def: "Tout ce qui aide à ne pas jeter de la nourriture : faire une liste, utiliser les restes, bien conserver, etc." },
  { mot: "Bâtisseur", def: "Rôle des protéines : construire les muscles, les os, les cheveux. On en a besoin pour grandir et se réparer." },
  { mot: "Bio", def: "Produit cultivé sans pesticides chimiques, conformément aux règles de l'agriculture biologique. Souvent labellisé AB." },
  { mot: "Bioplastique", def: "Plastique fabriqué à partir de plantes (maïs, canne à sucre). Souvent compostable, plus écolo que le plastique classique." },
  { mot: "Biodégradable", def: "Qui peut se décomposer naturellement sous l'action des bactéries. Pas forcément compostable (peut prendre des années)." },
  { mot: "Calcium", def: "Minéral indispensable pour les os et les dents. On en trouve surtout dans les produits laitiers (lait, yaourt, fromage)." },
  { mot: "Carbone (CO₂)", def: "Gaz qui réchauffe la planète. Plus on transporte des produits de loin, plus on émet de CO₂." },
  { mot: "Chaîne du froid", def: "Maintien des produits frais à température basse (entre 0 et 4 °C) tout au long du transport, du stockage et de la vente. Sa rupture rend les aliments dangereux." },
  { mot: "Circuit court", def: "Quand il y a au maximum 1 intermédiaire entre celui qui produit et celui qui mange. Exemples : marché, AMAP, vente directe à la ferme." },
  { mot: "Compostable", def: "Qui se transforme en compost (terre fertile) en quelques mois, dans un composteur. Plus rapide que le simple « biodégradable »." },
  { mot: "Congélation", def: "Conservation à -18 °C ou moins. Stoppe la multiplication des bactéries. Conservation longue (plusieurs mois)." },
  { mot: "Conserve", def: "Aliment stérilisé puis fermé dans un récipient hermétique (boîte, bocal). Se conserve plusieurs années à température ambiante." },
  { mot: "Constituants alimentaires", def: "Éléments contenus dans les aliments : protides, glucides, lipides, vitamines, minéraux, eau. Chacun a un rôle pour la santé." },
  { mot: "Contamination croisée", def: "Quand des microbes passent d'un aliment cru ou sale vers un aliment cuit ou propre (ex : couteau qui sert à la viande crue puis aux légumes). Cause majeure d'intoxication." },
  { mot: "Cuisson à cœur", def: "Cuire l'aliment jusqu'à ce que la température au centre atteigne 63 °C (au moins). Détruit la majorité des bactéries." },
  { mot: "DLC", def: "Date Limite de Consommation. À ne pas dépasser sur les produits frais (yaourt, viande). Affichée « À consommer jusqu'au… »." },
  { mot: "DDM", def: "Date de Durabilité Minimale. Le produit reste sain après cette date, mais peut perdre du goût. Affichée « À consommer de préférence avant… »." },
  { mot: "DLUO", def: "Date Limite d'Utilisation Optimale. Ancien nom de la DDM, encore parfois employé. Même signification." },
  { mot: "Doggy bag", def: "Boîte fournie au client pour emporter ce qu'il n'a pas mangé au restaurant. Obligatoire pour les pros depuis la loi AGEC." },
  { mot: "Éco-responsable", def: "Qui respecte la planète : produits de saison, circuits courts, peu d'emballage, anti-gaspillage." },
  { mot: "EGalim (Loi)", def: "Loi pour l'équilibre des relations commerciales agricoles et une alimentation saine et durable (2018). Oblige 50 % de produits durables et 20 % de bio dans la restauration collective." },
  { mot: "Empreinte carbone", def: "Quantité de gaz à effet de serre (CO₂ surtout) émise pour produire, transporter ou consommer un produit. Plus elle est faible, mieux c'est pour la planète." },
  { mot: "Énergie (alimentaire)", def: "Ce que les aliments donnent au corps pour fonctionner. On la mesure en kilocalories (kcal). Surtout fournie par les glucides et les lipides." },
  { mot: "Étiquetage", def: "Toutes les informations écrites sur l'emballage d'un produit : nom, ingrédients, allergènes, dates, fabricant." },
  { mot: "Féculents", def: "Aliments qui apportent de l'énergie : pâtes, riz, pain, pommes de terre, semoule, lentilles, pois chiches." },
  { mot: "Fibre", def: "Élément des fruits, légumes et céréales complètes. Aide à la digestion et au bon fonctionnement du ventre." },
  { mot: "Filière de proximité", def: "Achats faits près de chez soi (dans la région). Réduit le transport et soutient les producteurs locaux." },
  { mot: "Garot (Loi)", def: "Loi anti-gaspillage de 2016. Interdit aux supermarchés de plus de 400 m² de jeter ou détruire de la nourriture encore consommable. Don aux associations obligatoire." },
  { mot: "Glucides", def: "Sucres et amidons. Ils donnent l'énergie rapide au corps. Présents dans les pâtes, le riz, le pain, les fruits." },
  { mot: "Groupes alimentaires", def: "Les 7 grandes familles d'aliments : 1) fruits-légumes, 2) féculents, 3) produits laitiers, 4) VPO (viande-poisson-œuf), 5) matières grasses, 6) produits sucrés, 7) boissons." },
  { mot: "HACCP", def: "Hazard Analysis Critical Control Point. Méthode obligatoire en cuisine pour identifier les risques (microbes, contamination) et les points critiques à maîtriser." },
  { mot: "Hygiène alimentaire", def: "Règles pour éviter de tomber malade : se laver les mains, bien cuire les aliments, respecter le froid." },
  { mot: "IGP", def: "Indication Géographique Protégée. Label européen qui garantit qu'au moins une étape (production, transformation, élaboration) a eu lieu dans une région précise (ex : Jambon de Bayonne)." },
  { mot: "INCO", def: "Règlement européen 1169/2011. Définit toutes les informations obligatoires sur les étiquettes alimentaires en Europe." },
  { mot: "Label", def: "Marque officielle qui garantit la qualité ou l'origine d'un produit (AB, Label Rouge, AOP…)." },
  { mot: "Label Rouge", def: "Label français qui garantit une qualité supérieure liée au mode de production." },
  { mot: "Légumineuses", def: "Famille d'aliments qui sont à la fois féculents ET protéines végétales : lentilles, pois chiches, haricots, fèves." },
  { mot: "Lipides", def: "Matières grasses. Énergie de réserve du corps. Huile, beurre, fruits à coque, fromage." },
  { mot: "Marche en avant", def: "Principe d'organisation d'une cuisine pro : le produit avance toujours du sale vers le propre, sans jamais revenir en arrière. Évite les contaminations." },
  { mot: "Mention d'allergène", def: "Sur l'étiquette, l'allergène doit être mis en valeur (gras, souligné ou couleur différente) dans la liste des ingrédients pour qu'on le repère facilement." },
  { mot: "Menu équilibré", def: "Repas qui combine les bons groupes alimentaires dans les bonnes proportions (½ légumes, ¼ féculents, ¼ protéines)." },
  { mot: "Minéraux", def: "Calcium, fer, magnésium… Présents en petite quantité mais indispensables à la santé. Dans les fruits, légumes, produits laitiers." },
  { mot: "Organoleptique (analyse)", def: "Manière d'évaluer un aliment avec ses sens : la vue, l'odorat, le goût, le toucher." },
  { mot: "Packaging", def: "Mot anglais pour « emballage ». Tout ce qui entoure le produit pour le protéger et le présenter." },
  { mot: "Plat à emporter", def: "Plat préparé et conditionné pour être consommé ailleurs qu'au lieu de vente. Doit être étiqueté (DLC, ingrédients, allergènes) et respecter la chaîne du froid." },
  { mot: "PNNS", def: "Programme National Nutrition Santé. Recommandations officielles françaises pour bien manger (mangerbouger.fr)." },
  { mot: "Protides (protéines)", def: "Bâtisseurs du corps : construisent les muscles, les os, les cheveux. Dans la viande, le poisson, l'œuf, les légumineuses, les produits laitiers." },
  { mot: "Recyclable", def: "Qui peut être transformé pour fabriquer un nouvel objet (carton, verre, métal). Bien trier permet de recycler." },
  { mot: "Réfrigération", def: "Conservation entre 0 et 4 °C pour les produits très périssables (viande, poisson, plats préparés). Ralentit la multiplication des bactéries." },
  { mot: "Saisonnalité", def: "Manger de saison = manger des fruits et légumes qui poussent à ce moment de l'année dans notre région. Meilleur, moins cher, moins polluant." },
  { mot: "Sécurité alimentaire", def: "Ensemble des règles qui garantissent que les aliments servis ne rendront pas malade. Repose sur l'hygiène, la chaîne du froid, la marche en avant et la traçabilité." },
  { mot: "SIQO", def: "Signes Officiels d'Identification de la Qualité et de l'Origine. Regroupe AB, Label Rouge, AOP, AOC, IGP, STG." },
  { mot: "Surgelé", def: "Aliment congelé très rapidement à très basse température (-30 °C ou moins). Préserve la qualité et la texture mieux qu'une congélation classique." },
  { mot: "TIAC", def: "Toxi-Infection Alimentaire Collective. Quand au moins 2 personnes tombent malades après avoir mangé le même aliment. À déclarer obligatoirement." },
  { mot: "Traçabilité", def: "Pouvoir savoir d'où vient un produit, qui l'a fait, quand. Permet de retirer un produit s'il y a un problème." },
  { mot: "Vente à emporter", def: "Activité commerciale où le client achète un repas qu'il consomme ailleurs. Soumise à la réglementation INCO (étiquetage) et HACCP (hygiène)." },
  { mot: "Vitamines", def: "Petites quantités, grands rôles : protègent l'organisme et le maintiennent en bonne santé. Dans les fruits, légumes, produits laitiers." },
  { mot: "VPO", def: "Viandes - Poissons - Œufs. Groupe alimentaire qui apporte les protéines animales." },
];

let glossaireQuery = "";
function openGlossaire() {
  let panel = document.getElementById("glossaire-panel");
  if (panel) { panel.classList.toggle("open"); return; }
  panel = document.createElement("div");
  panel.id = "glossaire-panel"; panel.className = "glossaire-panel open";
  panel.innerHTML = `
    <div class="glo-header">
      <h3>📖 Glossaire</h3>
      <button type="button" class="glo-close" id="glo-close">×</button>
    </div>
    <input type="search" id="glo-search" placeholder="Rechercher un mot…" />
    <div class="glo-list" id="glo-list"></div>
  `;
  document.body.appendChild(panel);
  panel.querySelector("#glo-close").addEventListener("click", () => panel.classList.remove("open"));
  panel.querySelector("#glo-search").addEventListener("input", (e) => {
    glossaireQuery = e.target.value;
    renderGlossaireList();
  });
  renderGlossaireList();
}
function renderGlossaireList() {
  const list = document.getElementById("glo-list");
  if (!list) return;
  const q = (glossaireQuery || "").toLowerCase().trim();
  const items = GLOSSAIRE
    .filter(t => !q || t.mot.toLowerCase().includes(q) || t.def.toLowerCase().includes(q))
    .sort((a,b) => a.mot.localeCompare(b.mot));
  list.innerHTML = items.length
    ? items.map(t => `<div class="glo-item"><b>${escapeHtml(t.mot)}</b><p>${escapeHtml(t.def)}</p></div>`).join("")
    : `<div class="hint" style="padding:14px;">Aucun terme trouvé.</div>`;
}

/* =====================================================================
   V4.20 — NOTES PERSONNELLES (post-it)
   L'élève peut prendre des notes libres datées sur n'importe quelle section.
   ===================================================================== */
function openNotesPanel() {
  let panel = document.getElementById("notes-panel");
  if (panel) { panel.classList.toggle("open"); return; }
  panel = document.createElement("div");
  panel.id = "notes-panel"; panel.className = "notes-panel open";
  panel.innerHTML = `
    <div class="glo-header">
      <h3>📝 Mes notes</h3>
      <button type="button" class="glo-close" id="notes-close">×</button>
    </div>
    <div class="notes-add">
      <textarea id="notes-input" rows="3" placeholder="Écris ici une note (ce que tu retiens, une question, une idée…)"></textarea>
      <button type="button" class="btn btn-primary" id="notes-add-btn">Ajouter</button>
    </div>
    <div class="notes-list" id="notes-list"></div>
  `;
  document.body.appendChild(panel);
  panel.querySelector("#notes-close").addEventListener("click", () => panel.classList.remove("open"));
  panel.querySelector("#notes-add-btn").addEventListener("click", () => {
    const ta = panel.querySelector("#notes-input");
    const v = ta.value.trim();
    if (!v) return;
    if (!Array.isArray(state.notes)) state.notes = [];
    const sectionId = currentView.type === "section" ? currentView.id : null;
    state.notes.push({
      id: "n" + Math.random().toString(36).slice(2,9),
      texte: v,
      section: sectionId,
      date: new Date().toISOString(),
    });
    ta.value = "";
    saveState(); renderNotesList();
  });
  renderNotesList();
}
function renderNotesList() {
  const list = document.getElementById("notes-list");
  if (!list) return;
  const notes = (state.notes || []).slice().reverse();
  list.innerHTML = notes.length
    ? notes.map(n => {
        const sec = n.section ? state.sections.find(s => s.id === n.section) : null;
        const dt = new Date(n.date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
        return `
          <div class="notes-item" data-id="${n.id}">
            <div class="notes-meta">
              ${escapeHtml(dt)}${sec ? " · " + escapeHtml(sec.titre.replace(/[^\w\sÀ-ÿ]/g,"").trim()) : ""}
              <button type="button" class="notes-del" data-del="${n.id}" title="Supprimer">×</button>
            </div>
            <div class="notes-texte">${escapeHtml(n.texte).replace(/\n/g,"<br>")}</div>
          </div>`;
      }).join("")
    : `<div class="hint" style="padding:14px;">Aucune note pour l'instant. Écris ta première au-dessus.</div>`;
  list.querySelectorAll(".notes-del").forEach(b => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!confirm("Supprimer cette note ?")) return;
      state.notes = state.notes.filter(x => x.id !== b.dataset.del);
      saveState(); renderNotesList();
    });
  });
}

/* =====================================================================
   V4.20 — FLASHCARDS DE RÉVISION
   Cartes recto/verso pour réviser le vocabulaire essentiel.
   ===================================================================== */
const FLASHCARDS_DECKS = [
  // V4.66 — Comprendre le chef-d'œuvre
  {
    id: "comprendre",
    titre: "Comprendre le chef-d'œuvre",
    cartes: [
      { recto: "C'est quoi le chef-d'œuvre ?", verso: "Un projet concret de 2 ans en lien avec mon métier, défendu à l'oral final." },
      { recto: "Combien d'années dure le chef-d'œuvre ?", verso: "2 ans (toute la formation CAP)." },
      { recto: "Combien de temps dure l'oral final ?", verso: "10 minutes : 5 min de présentation + 5 min de questions du jury." },
      { recto: "Combien de personnes au jury de l'oral ?", verso: "2 enseignants." },
      { recto: "Quelle proportion de la note pour le suivi sur 2 ans ?", verso: "50 %." },
      { recto: "Quelle proportion pour l'oral final ?", verso: "50 %." },
      { recto: "Si je rate du premier coup, qu'est-ce que je peux faire ?", verso: "Recommencer ! C'est le DROIT À L'ERREUR." },
      { recto: "C'est quoi MON projet de chef-d'œuvre ?", verso: "Concevoir un repas/menu équilibré et éco-responsable à emporter." },
      { recto: "Quand est l'oral final ?", verso: "Juin 2027 (fin de la 2e année du CAP)." },
      { recto: "Cite 3 capacités évaluées à l'oral.", verso: "Démarche · Présentation · Argumentation. (et aussi : analyse, réflexivité)" },
    ],
  },
  {
    id: "groupes",
    titre: "Les 7 groupes d'aliments",
    cartes: [
      { recto: "🥦 À quel groupe appartient la carotte ?", verso: "Fruits et légumes" },
      { recto: "🍝 À quel groupe appartiennent les pâtes ?", verso: "Féculents" },
      { recto: "🐟 À quel groupe appartient le poisson ?", verso: "VPO (Viande, Poisson, Œuf)" },
      { recto: "🧀 À quel groupe appartient le yaourt ?", verso: "Produits laitiers" },
      { recto: "🥖 À quel groupe appartient le pain ?", verso: "Féculents" },
      { recto: "🥚 À quel groupe appartient l'œuf ?", verso: "VPO (Viande, Poisson, Œuf)" },
      { recto: "🍫 Le chocolat appartient à quel groupe ?", verso: "Produits sucrés (à limiter)" },
      { recto: "🥛 Le lait appartient à quel groupe ?", verso: "Produits laitiers" },
      { recto: "🥑 L'huile d'olive appartient à quel groupe ?", verso: "Matières grasses" },
      { recto: "💧 La boisson indispensable chaque jour ?", verso: "L'eau" },
    ],
  },
  {
    id: "constituants",
    titre: "Les constituants alimentaires et leurs rôles",
    cartes: [
      { recto: "Quel est le rôle des PROTIDES (protéines) ?", verso: "Bâtisseurs : construisent les muscles, les os, les cheveux." },
      { recto: "Quel est le rôle des GLUCIDES ?", verso: "Carburant rapide : donnent de l'énergie au corps." },
      { recto: "Quel est le rôle des LIPIDES ?", verso: "Énergie de réserve. Le corps les stocke." },
      { recto: "Quel est le rôle des VITAMINES ?", verso: "Protectrices : maintiennent l'organisme en bonne santé." },
      { recto: "Quel est le rôle des MINÉRAUX ?", verso: "Solidifient (ex : calcium pour les os) et protègent." },
      { recto: "Quel est le rôle de l'EAU ?", verso: "Hydrate. Représente 60 % du corps humain." },
      { recto: "Où trouve-t-on le CALCIUM ?", verso: "Surtout dans les produits laitiers." },
      { recto: "Où trouve-t-on les protéines ?", verso: "Viande, poisson, œuf, légumineuses, produits laitiers." },
    ],
  },
  {
    id: "labels",
    titre: "Les labels officiels (SIQO)",
    cartes: [
      { recto: "Que garantit le label AB ?", verso: "Agriculture Biologique : sans pesticides chimiques ni OGM." },
      { recto: "Que veut dire AOP ?", verso: "Appellation d'Origine Protégée (label européen, lié à un terroir)." },
      { recto: "Que veut dire AOC ?", verso: "Appellation d'Origine Contrôlée (version française de l'AOP)." },
      { recto: "Que garantit le Label Rouge ?", verso: "Une qualité supérieure liée au mode de production." },
      { recto: "Que veut dire IGP ?", verso: "Indication Géographique Protégée (lien à une région)." },
      { recto: "Que regroupe le terme SIQO ?", verso: "Signes Officiels d'Identification de la Qualité et de l'Origine (AB, Label Rouge, AOP, AOC, IGP, STG)." },
    ],
  },
  {
    id: "allergenes",
    titre: "Les 14 allergènes obligatoires",
    cartes: [
      { recto: "Cite 3 allergènes parmi les 14 obligatoires.", verso: "Gluten · Œuf · Lait · Arachide · Soja · Poisson · Crustacés · Fruits à coque · Céleri · Moutarde · Sésame · Sulfites · Lupin · Mollusques." },
      { recto: "Pourquoi mettre les allergènes en évidence sur l'étiquette ?", verso: "Pour qu'une personne allergique les repère immédiatement (en gras, souligné ou MAJUSCULES). Cela peut sauver des vies." },
      { recto: "Combien d'allergènes majeurs faut-il déclarer obligatoirement ?", verso: "14 allergènes (règlement INCO 1169/2011)." },
      { recto: "Le yaourt contient quel allergène ?", verso: "Le lait." },
      { recto: "Le pain contient généralement quel allergène ?", verso: "Le gluten (présent dans le blé)." },
    ],
  },
  {
    id: "eco",
    titre: "Éco-responsabilité et anti-gaspi",
    cartes: [
      { recto: "Que veut dire DLC ?", verso: "Date Limite de Consommation. À NE PAS dépasser sur les produits frais." },
      { recto: "Que veut dire DDM ?", verso: "Date de Durabilité Minimale. Le produit reste sain après, peut perdre du goût." },
      { recto: "Combien de kg de nourriture chaque Français jette par an ?", verso: "Environ 30 kg (source ADEME)." },
      { recto: "Qu'est-ce qu'un circuit court ?", verso: "Au maximum 1 intermédiaire entre le producteur et le consommateur." },
      { recto: "Que dit la loi AGEC (2020) ?", verso: "Loi Anti-Gaspillage et Économie Circulaire. Interdit de jeter les invendus, encadre les plastiques." },
      { recto: "Cite 3 emballages éco-responsables.", verso: "Carton recyclable · Verre · Bioplastique compostable · Inox réutilisable." },
    ],
  },
  // V4.54 — Marche en avant
  {
    id: "marche_en_avant",
    titre: "Marche en avant et hygiène",
    cartes: [
      { recto: "Quelle est la règle d'or de la marche en avant ?", verso: "On AVANCE du SALE vers le PROPRE, sans JAMAIS revenir en arrière." },
      { recto: "Combien d'étapes y a-t-il dans la marche en avant ?", verso: "9 étapes : Réception → Stockage → Déconditionnement → Lavage → Préparation → Cuisson → Conditionnement → Étiquetage → Distribution." },
      { recto: "Quelle est la 1ère étape de la marche en avant ?", verso: "La RÉCEPTION des marchandises (cartons, cagettes)." },
      { recto: "Quelle est la dernière étape de la marche en avant ?", verso: "La DISTRIBUTION (remise au client / vente à emporter)." },
      { recto: "Cite 3 zones SALES de la cuisine.", verso: "Réception · Déconditionnement · Lavage initial · Plonge · Déchets · Stockage déchets." },
      { recto: "Cite 3 zones PROPRES de la cuisine.", verso: "Préparation · Cuisson · Conditionnement · Stockage froid · Étiquetage · Distribution." },
      { recto: "Qu'est-ce qu'une contamination croisée ?", verso: "C'est le passage de bactéries d'un aliment ou d'une surface SALE vers un aliment PROPRE." },
      { recto: "Comment respecter la marche en avant DANS LE TEMPS ?", verso: "1) Préparer le SALE · 2) Nettoyer · 3) Se laver les mains · 4) Préparer le PROPRE · 5) Nettoyer encore." },
      { recto: "À quelle température doit être la chaîne du froid ?", verso: "0 à 4 °C pour les produits frais (DLC)." },
      { recto: "Quel règlement européen oblige à respecter l'hygiène ?", verso: "Le règlement CE 852/2004." },
      { recto: "Pourquoi se laver les mains entre cru et prêt-à-manger ?", verso: "Les mains sont le 1er vecteur de bactéries. Indispensable pour éviter les contaminations." },
      { recto: "Peut-on utiliser le même couteau pour la viande crue et la salade ?", verso: "NON. Toujours des ustensiles séparés ou parfaitement désinfectés." },
      { recto: "Que faire si on n'a pas la place pour 2 zones séparées ?", verso: "On respecte la marche en avant DANS LE TEMPS : sale → nettoyage → propre." },
      { recto: "Cite 3 erreurs typiques de contamination croisée.", verso: "Cartons sur plan propre · Même couteau cru/prêt-à-manger · Pas de lavage des mains · Déchets en zone propre." },
      { recto: "Pourquoi la marche en avant est-elle obligatoire ?", verso: "Pour éviter les intoxications alimentaires des clients (obligation légale CE 852/2004)." },
    ],
  },
];

let currentDeckId = null;
let currentCardIdx = 0;
let cardFlipped = false;

function openFlashcards(deckId) {
  let panel = document.getElementById("flash-panel");
  if (panel) panel.remove();
  panel = document.createElement("div");
  panel.id = "flash-panel"; panel.className = "modal";
  panel.innerHTML = `
    <div class="modal-content" style="max-width:640px;">
      <button class="modal-close" id="flash-close">×</button>
      <div id="flash-content"></div>
    </div>
  `;
  document.body.appendChild(panel);
  panel.querySelector("#flash-close").addEventListener("click", () => panel.remove());
  panel.addEventListener("click", e => { if (e.target.id === "flash-panel") panel.remove(); });

  if (deckId) {
    currentDeckId = deckId; currentCardIdx = 0; cardFlipped = false;
    renderFlashcardScreen();
  } else {
    renderFlashcardDeckList();
  }
}
function renderFlashcardDeckList() {
  const c = document.getElementById("flash-content");
  if (!c) return;
  const st = state.flashcards_state || {};
  c.innerHTML = `
    <h2 style="color:var(--c-primary-dark); margin-top:0;">Mes flashcards de révision</h2>
    <p class="hint">Choisis un thème pour réviser le vocabulaire. Clique une carte pour voir la réponse.</p>
    <div class="flash-decks">
      ${FLASHCARDS_DECKS.map(d => {
        const reussies = (st[d.id]?.reussies || []).length;
        return `
          <button type="button" class="flash-deck" data-deck="${d.id}">
            <div class="fd-titre">${escapeHtml(d.titre)}</div>
            <div class="fd-meta">${d.cartes.length} cartes · ${reussies} retenues</div>
          </button>`;
      }).join("")}
    </div>
  `;
  c.querySelectorAll("[data-deck]").forEach(b => {
    b.addEventListener("click", () => {
      currentDeckId = b.dataset.deck; currentCardIdx = 0; cardFlipped = false;
      renderFlashcardScreen();
    });
  });
}
function renderFlashcardScreen() {
  const c = document.getElementById("flash-content");
  const deck = FLASHCARDS_DECKS.find(d => d.id === currentDeckId);
  if (!c || !deck) return;
  const st = state.flashcards_state[deck.id] || { reussies: [], a_revoir: [] };
  state.flashcards_state[deck.id] = st;
  const card = deck.cartes[currentCardIdx];
  const isLast = currentCardIdx >= deck.cartes.length - 1;
  c.innerHTML = `
    <div class="flash-head">
      <button type="button" class="btn btn-sm" id="flash-back">← Liste</button>
      <h3 style="margin:0; color:var(--c-primary-dark);">${escapeHtml(deck.titre)}</h3>
      <div class="flash-progress">${currentCardIdx+1} / ${deck.cartes.length}</div>
    </div>
    <div class="flashcard ${cardFlipped ? "flipped" : ""}" id="flash-card">
      <div class="fc-face fc-recto">
        <div class="fc-label">QUESTION</div>
        <div class="fc-text">${escapeHtml(card.recto)}</div>
        <div class="fc-hint">Clique pour voir la réponse</div>
      </div>
      <div class="fc-face fc-verso">
        <div class="fc-label">RÉPONSE</div>
        <div class="fc-text">${escapeHtml(card.verso)}</div>
      </div>
    </div>
    <div class="flash-actions">
      ${cardFlipped ? `
        <button type="button" class="btn" id="flash-revoir">À revoir</button>
        <button type="button" class="btn btn-accent" id="flash-retenu">J'ai retenu ✓</button>
      ` : `<button type="button" class="btn btn-primary" id="flash-flip">Voir la réponse</button>`}
    </div>
  `;
  c.querySelector("#flash-back").addEventListener("click", () => {
    currentDeckId = null; renderFlashcardDeckList();
  });
  if (cardFlipped) {
    c.querySelector("#flash-revoir").addEventListener("click", () => markCard(deck, "a_revoir"));
    c.querySelector("#flash-retenu").addEventListener("click", () => markCard(deck, "reussies"));
  } else {
    c.querySelector("#flash-flip").addEventListener("click", () => { cardFlipped = true; renderFlashcardScreen(); });
    c.querySelector("#flash-card").addEventListener("click", () => { cardFlipped = true; renderFlashcardScreen(); });
  }
}
function markCard(deck, target) {
  const st = state.flashcards_state[deck.id];
  const card = deck.cartes[currentCardIdx];
  // Retire des deux listes puis ajoute
  st.reussies = (st.reussies || []).filter((_,i) => i !== currentCardIdx);
  st.a_revoir = (st.a_revoir || []).filter((_,i) => i !== currentCardIdx);
  if (target === "reussies") st.reussies = [...(st.reussies || []), currentCardIdx];
  else st.a_revoir = [...(st.a_revoir || []), currentCardIdx];
  saveState();
  if (currentCardIdx < deck.cartes.length - 1) {
    currentCardIdx++; cardFlipped = false; renderFlashcardScreen();
  } else {
    document.getElementById("flash-content").innerHTML = `
      <h2 style="color:var(--c-accent-dark);">Deck terminé !</h2>
      <p>Tu as terminé toutes les cartes de « ${escapeHtml(deck.titre)} ».</p>
      <p>Retenues : <b>${st.reussies.length}</b> · À revoir : <b>${st.a_revoir.length}</b></p>
      <button type="button" class="btn btn-primary" onclick="currentCardIdx=0;cardFlipped=false;renderFlashcardScreen();">Recommencer</button>
      <button type="button" class="btn" onclick="currentDeckId=null;renderFlashcardDeckList();">Retour à la liste</button>
    `;
  }
}

/* =====================================================================
   V4.20 — MINI-JEU PENDU NUTRITIONNEL
   Mots à deviner liés au vocabulaire CAP.
   ===================================================================== */
const PENDU_MOTS = [
  { mot: "FECULENTS", indice: "Groupe alimentaire de l'énergie : pâtes, riz, pain…" },
  { mot: "CALCIUM", indice: "Minéral indispensable aux os, dans les produits laitiers." },
  { mot: "PROTEINES", indice: "Constituants bâtisseurs du corps." },
  { mot: "VITAMINES", indice: "Constituants protecteurs, dans les fruits et légumes." },
  { mot: "GLUCIDES", indice: "Carburant rapide de l'organisme." },
  { mot: "LIPIDES", indice: "Énergie de réserve : huile, beurre…" },
  { mot: "TRACABILITE", indice: "Pouvoir suivre un produit du producteur au consommateur." },
  { mot: "ALLERGENE", indice: "Aliment dangereux pour certaines personnes (œuf, lait, gluten…)." },
  { mot: "GASPILLAGE", indice: "Action de jeter de la nourriture encore consommable." },
  { mot: "SAISONNALITE", indice: "Le fait de manger des produits qui poussent à ce moment de l'année." },
  { mot: "COMPOSTABLE", indice: "Emballage qui peut se dégrader naturellement." },
  { mot: "RECYCLABLE", indice: "Qui peut être transformé pour fabriquer un nouvel objet." },
  { mot: "ETIQUETTE", indice: "Document collé sur l'emballage avec les infos obligatoires." },
  { mot: "BIODEGRADABLE", indice: "Qui se décompose naturellement sans polluer." },
  { mot: "EQUILIBRE", indice: "Mot-clé d'un repas qui combine bien les groupes alimentaires." },
];
const PENDU_MAX_ERREURS = 7;
let penduState = null;

function openPendu() {
  let panel = document.getElementById("pendu-panel");
  if (panel) panel.remove();
  panel = document.createElement("div");
  panel.id = "pendu-panel"; panel.className = "modal";
  panel.innerHTML = `
    <div class="modal-content" style="max-width:600px;">
      <button class="modal-close" id="pendu-close">×</button>
      <div id="pendu-content"></div>
    </div>
  `;
  document.body.appendChild(panel);
  panel.querySelector("#pendu-close").addEventListener("click", () => panel.remove());
  panel.addEventListener("click", e => { if (e.target.id === "pendu-panel") panel.remove(); });
  penduNouveauMot();
}
function penduNouveauMot() {
  const item = PENDU_MOTS[Math.floor(Math.random() * PENDU_MOTS.length)];
  penduState = { mot: item.mot, indice: item.indice, lettres: [], erreurs: 0 };
  renderPendu();
}
function renderPendu() {
  const c = document.getElementById("pendu-content");
  if (!c) return;
  const { mot, indice, lettres, erreurs } = penduState;
  const affichage = mot.split("").map(l => l === " " ? " " : (lettres.includes(l) ? l : "_")).join(" ");
  const gagne = !affichage.includes("_");
  const perdu = erreurs >= PENDU_MAX_ERREURS;
  const fini = gagne || perdu;
  c.innerHTML = `
    <h2 style="color:var(--c-primary-dark); margin-top:0;">🎯 Pendu nutritionnel</h2>
    <div class="pendu-indice">Indice : <i>${escapeHtml(indice)}</i></div>
    <div class="pendu-mot">${affichage}</div>
    <div class="pendu-stats">
      Erreurs : <b>${erreurs}</b> / ${PENDU_MAX_ERREURS}
      ${perdu ? ' <span style="color:var(--c-danger); font-weight:700;">PERDU</span>' : ''}
      ${gagne ? ' <span style="color:var(--c-accent-dark); font-weight:700;">GAGNÉ</span>' : ''}
    </div>
    <div class="pendu-bonhomme">${"❌".repeat(erreurs)}${"⬜".repeat(PENDU_MAX_ERREURS - erreurs)}</div>
    ${fini ? `<div class="pendu-mot-revele">Le mot était : <b>${escapeHtml(mot)}</b></div>` : ""}
    <div class="pendu-clavier">
      ${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => {
        const used = lettres.includes(l);
        const inWord = mot.includes(l);
        const cls = used ? (inWord ? "used ok" : "used ko") : "";
        return `<button type="button" class="pendu-key ${cls}" data-letter="${l}" ${used || fini ? "disabled" : ""}>${l}</button>`;
      }).join("")}
    </div>
    <div style="margin-top:12px; text-align:center;">
      <button type="button" class="btn btn-primary" id="pendu-new">Nouveau mot</button>
    </div>
  `;
  c.querySelectorAll(".pendu-key:not(:disabled)").forEach(b => {
    b.addEventListener("click", () => {
      const l = b.dataset.letter;
      penduState.lettres.push(l);
      if (!mot.includes(l)) penduState.erreurs++;
      renderPendu();
    });
  });
  c.querySelector("#pendu-new").addEventListener("click", penduNouveauMot);
}

/* =====================================================================
   V4.24 — AVATAR COMPOSABLE EN SVG
   L'élève compose son personnage : visage, peau, cheveux, yeux, etc.
   Stocké dans state.preferences.avatar_compose (additif).
   ===================================================================== */
const AVATAR_OPTIONS = {
  fond: [
    { id: "blanc",   color: "#ffffff", label: "Blanc" },
    { id: "creme",   color: "#fdf6e3", label: "Crème" },
    { id: "bleu",    color: "#cfe2ff", label: "Bleu" },
    { id: "vert",    color: "#d5ecdd", label: "Vert" },
    { id: "rose",    color: "#ffd6e0", label: "Rose" },
    { id: "violet",  color: "#e8dcfe", label: "Violet" },
    { id: "jaune",   color: "#fff5a5", label: "Jaune" },
  ],
  forme: [
    { id: "rond",     label: "Rond" },
    { id: "ovale",    label: "Ovale" },
    { id: "carre",    label: "Carré" },
    { id: "triangle", label: "Triangulaire" },
    { id: "long",     label: "Allongé" },
  ],
  peau: [
    { id: "p1", color: "#fde2c8" },
    { id: "p2", color: "#f5cba7" },
    { id: "p3", color: "#e0a87c" },
    { id: "p4", color: "#d4a373" },
    { id: "p5", color: "#a87548" },
    { id: "p6", color: "#7b4f2f" },
    { id: "p7", color: "#5a3a20" },
    { id: "p8", color: "#3b2418" },
  ],
  taches: [
    { id: "non",     label: "Sans" },
    { id: "oui",     label: "Taches de rousseur" },
  ],
  sourcils: [
    { id: "fins",    label: "Fins" },
    { id: "epais",   label: "Épais" },
    { id: "arques",  label: "Arqués" },
    { id: "fronces", label: "Froncés" },
    { id: "aucun",   label: "Aucun" },
  ],
  cheveux_style: [
    { id: "aucun",     label: "Chauve" },
    { id: "court",     label: "Court" },
    { id: "milong",    label: "Mi-long" },
    { id: "long",      label: "Long" },
    { id: "boucle",    label: "Bouclé" },
    { id: "queue",     label: "Queue de cheval" },
    { id: "afro",      label: "Afro" },
    { id: "mohawk",    label: "Crête / Mohawk" },
    { id: "frange",    label: "Frange droite" },
    { id: "chignon",   label: "Chignon" },
    { id: "tresses",   label: "Tresses" },
    { id: "mulet",     label: "Mulet" },
    // V4.85 — nouvelles coiffures
    { id: "dreadlocks",     label: "Dreadlocks" },
    { id: "herisses",       label: "Hérissés / piques" },
    { id: "banane",         label: "Banane" },
    { id: "raie_milieu",    label: "Raie au milieu" },
    { id: "tresses_afro",   label: "Tresses africaines" },
    { id: "demi_queue",     label: "Demi-queue" },
  ],
  cheveux_couleur: [
    { id: "noir",     color: "#1a1a1a" },
    { id: "brun",     color: "#3b2418" },
    { id: "chatain",  color: "#7b4f2f" },
    { id: "blond",    color: "#d4af37" },
    { id: "platine",  color: "#f0e8d0" },
    { id: "roux",     color: "#b94a2c" },
    { id: "gris",     color: "#9a9a9a" },
    { id: "blanc",    color: "#f5f5f5" },
    { id: "rose",     color: "#e87bb1" },
    { id: "bleu",     color: "#3a86ff" },
    { id: "vert",     color: "#3aa86b" },
    { id: "violet",   color: "#8b3aff" },
    // V4.85 — couleurs fluo
    { id: "arcenciel", color: "url(#hairRainbow)", isSpecial: true, label: "🌈 Arc-en-ciel" },
    { id: "bicolore",  color: "url(#hairBicolor)",  isSpecial: true, label: "🎭 Bicolore" },
    { id: "meches",    color: "url(#hairMeches)",   isSpecial: true, label: "✨ Mèches" },
  ],
  barbe: [
    { id: "aucune",    label: "Aucune" },
    { id: "moustache", label: "Moustache" },
    { id: "bouc",      label: "Bouc" },
    { id: "courte",    label: "Barbe courte" },
    { id: "longue",    label: "Barbe longue" },
  ],
  yeux: [
    { id: "ronds",    label: "Ronds" },
    { id: "amande",   label: "Amande" },
    { id: "sourire",  label: "Souriants" },
    { id: "endormis", label: "Endormis" },
    { id: "surpris",  label: "Surpris" },
    { id: "clin",     label: "Clin d'œil" },
  ],
  bouche: [
    { id: "sourire",       label: "Sourire" },
    { id: "neutre",        label: "Neutre" },
    { id: "grand_sourire", label: "Grand sourire" },
    { id: "coin",          label: "Sourire en coin" },
    { id: "langue",        label: "Langue dehors" },
    { id: "ohno",          label: "Surpris (Oh!)" },
  ],
  lunettes: [
    { id: "aucune",         label: "Aucune" },
    { id: "rondes",         label: "Rondes" },
    { id: "rectangulaires", label: "Rectangulaires" },
    { id: "soleil",         label: "Soleil" },
    { id: "aviateur",       label: "Aviateur" },
    { id: "carrees_grosses", label: "Grosses carrées" },
  ],
  accessoire: [
    { id: "aucun",        label: "Aucun" },
    { id: "toque",        label: "Toque de chef" },
    { id: "casquette",    label: "Casquette" },
    { id: "bonnet",       label: "Bonnet" },
    { id: "bandana",      label: "Bandana" },
    { id: "foulard",      label: "Foulard cou" },
    { id: "boucles",      label: "Boucles d'oreille" },
    { id: "headband",     label: "Bandeau" },
    // V4.85 — nouvelles coiffes
    { id: "charlotte",    label: "Charlotte cuisine" },
    { id: "turban",       label: "Turban" },
    { id: "couronne",     label: "Couronne" },
    { id: "casque_pomp",  label: "Casque pompier" },
    { id: "cowboy",       label: "Chapeau cowboy" },
    { id: "beret",        label: "Béret" },
    { id: "bandana_pois", label: "Bandana à pois" },
  ],
  vetement: [
    { id: "aucun",          label: "Aucun" },
    { id: "veste_chef",     label: "Veste de chef" },
    { id: "tablier",        label: "Tablier de cuisine" },
    { id: "polo",           label: "Polo" },
    { id: "tshirt_bleu",    label: "T-shirt bleu" },
    { id: "tshirt_rouge",   label: "T-shirt rouge" },
    { id: "pull_vert",      label: "Pull vert" },
    // V4.85 — nouveaux vêtements
    { id: "sweat_capuche",  label: "Sweat à capuche" },
    { id: "pull_raye",      label: "Pull rayé" },
    { id: "salopette",      label: "Salopette" },
    { id: "chemise",        label: "Chemise" },
    { id: "kimono",         label: "Kimono" },
    { id: "blouson",        label: "Blouson" },
    { id: "tshirt_licorne", label: "T-shirt licorne 🦄" },
    { id: "pull_pingouin",  label: "Pull pingouin 🐧" },
  ],
  // V4.85 — Nouvelles catégories pour rendre l'avatar plus expressif
  maquillage: [
    { id: "sans",     label: "Sans" },
    { id: "rouge",    label: "Rouge" },
    { id: "rose",     label: "Rose" },
    { id: "violet",   label: "Violet" },
    { id: "brillant", label: "Brillant" },
  ],
  joues: [
    { id: "sans",     label: "Sans" },
    { id: "legeres",  label: "Légères" },
    { id: "marquees", label: "Marquées" },
  ],
  tatouage: [
    { id: "sans",      label: "Sans" },
    { id: "coeur",     label: "❤️ Cœur" },
    { id: "etoile",    label: "⭐ Étoile" },
    { id: "flamme",    label: "🔥 Flamme" },
    { id: "papillon",  label: "🦋 Papillon" },
    { id: "goutte",    label: "💧 Goutte" },
  ],
  piercing: [
    { id: "sans",     label: "Sans" },
    { id: "nez",      label: "Nez" },
    { id: "sourcil",  label: "Sourcil" },
    { id: "levre",    label: "Lèvre" },
  ],
  motif_fond: [
    { id: "uni",       label: "Uni" },
    { id: "etoiles",   label: "✨ Étoiles" },
    { id: "coeurs",    label: "💗 Cœurs" },
    { id: "vagues",    label: "🌊 Vagues" },
    { id: "degrade",   label: "Dégradé" },
    { id: "nuages",    label: "☁️ Nuages" },
  ],
};

const DEFAULT_AVATAR = {
  fond: "creme",
  forme: "ovale", peau: "p2",
  taches: "non",
  sourcils: "fins",
  cheveux_style: "court", cheveux_couleur: "brun",
  barbe: "aucune",
  yeux: "ronds", bouche: "sourire",
  lunettes: "aucune", accessoire: "aucun",
  vetement: "aucun",
  // V4.85 — nouvelles options par défaut
  maquillage: "sans",
  joues: "sans",
  tatouage: "sans",
  piercing: "sans",
  motif_fond: "uni",
};

function getAvatarConfig() {
  return Object.assign({}, DEFAULT_AVATAR, (state.preferences && state.preferences.avatar_compose) || {});
}

/* Génère le SVG complet de l'avatar selon la config (V4.26 — enrichi). */
function buildAvatarSVG(config, size) {
  const c = Object.assign({}, DEFAULT_AVATAR, config || {});
  size = size || 120;
  const peau = AVATAR_OPTIONS.peau.find(p => p.id === c.peau)?.color || "#f5cba7";
  const peauOmbre = adjustColor(peau, -25);
  const chevOpt = AVATAR_OPTIONS.cheveux_couleur.find(p => p.id === c.cheveux_couleur);
  const chevColor = chevOpt?.color || "#3b2418";
  const chevIsSpecial = chevOpt?.isSpecial;
  const fondColor = AVATAR_OPTIONS.fond.find(p => p.id === c.fond)?.color || "#fdf6e3";

  // V4.85 — Definitions SVG (gradients pour cheveux fluo + motifs de fond)
  const defs = `
    <defs>
      <linearGradient id="hairRainbow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"  stop-color="#ff3366"/>
        <stop offset="20%" stop-color="#ff8c1a"/>
        <stop offset="40%" stop-color="#ffd700"/>
        <stop offset="60%" stop-color="#3aa86b"/>
        <stop offset="80%" stop-color="#3a86ff"/>
        <stop offset="100%" stop-color="#8b3aff"/>
      </linearGradient>
      <linearGradient id="hairBicolor" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"  stop-color="#1a1a1a"/>
        <stop offset="50%" stop-color="#1a1a1a"/>
        <stop offset="50%" stop-color="#e87bb1"/>
        <stop offset="100%" stop-color="#e87bb1"/>
      </linearGradient>
      <linearGradient id="hairMeches" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"  stop-color="#d4af37"/>
        <stop offset="40%" stop-color="#3b2418"/>
        <stop offset="100%" stop-color="#3b2418"/>
      </linearGradient>
      <linearGradient id="bgDegrade" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"  stop-color="#cfe2ff"/>
        <stop offset="100%" stop-color="#ffd6e0"/>
      </linearGradient>
    </defs>`;

  // Fond (rectangle complet) + motif optionnel
  let fond = `<rect x="0" y="0" width="200" height="200" fill="${fondColor}" />`;
  // V4.85 — Motifs de fond
  if (c.motif_fond === "etoiles") {
    fond += `
      <text x="20" y="32" font-size="18" opacity="0.45">⭐</text>
      <text x="170" y="40" font-size="14" opacity="0.45">⭐</text>
      <text x="15" y="180" font-size="14" opacity="0.4">⭐</text>
      <text x="175" y="190" font-size="18" opacity="0.4">⭐</text>
      <text x="100" y="20" font-size="12" opacity="0.35">⭐</text>`;
  } else if (c.motif_fond === "coeurs") {
    fond += `
      <text x="18" y="34" font-size="16" opacity="0.4">💗</text>
      <text x="170" y="44" font-size="14" opacity="0.4">💗</text>
      <text x="20" y="180" font-size="14" opacity="0.35">💗</text>
      <text x="175" y="190" font-size="16" opacity="0.35">💗</text>`;
  } else if (c.motif_fond === "vagues") {
    fond += `
      <path d="M 0 30 Q 25 20 50 30 T 100 30 T 150 30 T 200 30" stroke="rgba(31,79,134,.25)" stroke-width="2" fill="none"/>
      <path d="M 0 175 Q 25 165 50 175 T 100 175 T 150 175 T 200 175" stroke="rgba(31,79,134,.25)" stroke-width="2" fill="none"/>
      <path d="M 0 188 Q 25 180 50 188 T 100 188 T 150 188 T 200 188" stroke="rgba(31,79,134,.18)" stroke-width="2" fill="none"/>`;
  } else if (c.motif_fond === "degrade") {
    fond = `<rect x="0" y="0" width="200" height="200" fill="url(#bgDegrade)" />`;
  } else if (c.motif_fond === "nuages") {
    fond += `
      <ellipse cx="35" cy="30" rx="22" ry="10" fill="#fff" opacity="0.7"/>
      <ellipse cx="50" cy="32" rx="14" ry="8" fill="#fff" opacity="0.6"/>
      <ellipse cx="165" cy="180" rx="22" ry="10" fill="#fff" opacity="0.7"/>
      <ellipse cx="178" cy="178" rx="12" ry="7" fill="#fff" opacity="0.6"/>`;
  }

  // Forme du visage
  let visage = "";
  if (c.forme === "rond")        visage = `<circle cx="100" cy="105" r="60" fill="${peau}" />`;
  else if (c.forme === "carre")  visage = `<rect x="42" y="55" width="116" height="120" rx="20" fill="${peau}" />`;
  else if (c.forme === "triangle") visage = `<path d="M 100 45 L 165 175 L 35 175 Z" fill="${peau}" />`;
  else if (c.forme === "long")   visage = `<ellipse cx="100" cy="115" rx="48" ry="78" fill="${peau}" />`;
  else /* ovale */               visage = `<ellipse cx="100" cy="110" rx="55" ry="68" fill="${peau}" />`;

  // Cou
  const cou = `<rect x="84" y="160" width="32" height="30" fill="${peauOmbre}" />`;

  // Vêtement (sur le cou et plus bas)
  let vetement = "";
  if (c.vetement === "veste_chef") {
    vetement = `
      <rect x="20" y="175" width="160" height="25" fill="#fff" stroke="#ccc" stroke-width="1" />
      <line x1="100" y1="175" x2="100" y2="200" stroke="#ccc" stroke-width="1" />
      <circle cx="92" cy="183" r="2" fill="#ccc" />
      <circle cx="92" cy="193" r="2" fill="#ccc" />
      <circle cx="108" cy="183" r="2" fill="#ccc" />
      <circle cx="108" cy="193" r="2" fill="#ccc" />
    `;
  } else if (c.vetement === "tablier") {
    vetement = `
      <rect x="20" y="175" width="160" height="25" fill="#a85a4a" />
      <rect x="60" y="175" width="80" height="25" fill="#fff" />
      <line x1="60" y1="175" x2="60" y2="200" stroke="#888" stroke-width="1" />
      <line x1="140" y1="175" x2="140" y2="200" stroke="#888" stroke-width="1" />
    `;
  } else if (c.vetement === "polo") {
    vetement = `
      <path d="M 20 200 L 20 180 L 70 175 L 100 195 L 130 175 L 180 180 L 180 200 Z" fill="#2f6fb5" />
      <path d="M 85 175 L 100 195 L 115 175 L 110 175 L 100 185 L 90 175 Z" fill="#fff" />
    `;
  } else if (c.vetement === "tshirt_bleu") {
    vetement = `<path d="M 20 200 L 20 178 L 70 170 L 130 170 L 180 178 L 180 200 Z" fill="#2f6fb5" />`;
  } else if (c.vetement === "tshirt_rouge") {
    vetement = `<path d="M 20 200 L 20 178 L 70 170 L 130 170 L 180 178 L 180 200 Z" fill="#cc4a55" />`;
  } else if (c.vetement === "pull_vert") {
    vetement = `<path d="M 20 200 L 20 175 L 70 168 L 130 168 L 180 175 L 180 200 Z" fill="#2e8b57" />`;
  }
  // V4.85 — nouveaux vêtements
  else if (c.vetement === "sweat_capuche") {
    vetement = `
      <path d="M 20 200 L 20 175 L 70 168 L 130 168 L 180 175 L 180 200 Z" fill="#444" />
      <path d="M 60 165 Q 100 155 140 165 L 145 180 L 55 180 Z" fill="#5a5a5a" />
      <line x1="92" y1="178" x2="89" y2="200" stroke="#fff" stroke-width="1.5"/>
      <line x1="108" y1="178" x2="111" y2="200" stroke="#fff" stroke-width="1.5"/>`;
  } else if (c.vetement === "pull_raye") {
    vetement = `
      <path d="M 20 200 L 20 175 L 70 168 L 130 168 L 180 175 L 180 200 Z" fill="#1f4f86" />
      <line x1="20" y1="180" x2="180" y2="180" stroke="#fff" stroke-width="3"/>
      <line x1="20" y1="190" x2="180" y2="190" stroke="#fff" stroke-width="3"/>`;
  } else if (c.vetement === "salopette") {
    vetement = `
      <path d="M 20 200 L 20 178 L 70 175 L 130 175 L 180 178 L 180 200 Z" fill="#3a86ff" />
      <rect x="78" y="172" width="44" height="20" fill="#3a86ff" />
      <line x1="80" y1="175" x2="80" y2="200" stroke="#1f4f86" stroke-width="2"/>
      <line x1="120" y1="175" x2="120" y2="200" stroke="#1f4f86" stroke-width="2"/>
      <circle cx="80" cy="180" r="2.5" fill="#ffd700"/>
      <circle cx="120" cy="180" r="2.5" fill="#ffd700"/>`;
  } else if (c.vetement === "chemise") {
    vetement = `
      <path d="M 20 200 L 20 178 L 70 170 L 130 170 L 180 178 L 180 200 Z" fill="#fff" stroke="#888" stroke-width="1"/>
      <path d="M 80 170 L 100 195 L 120 170 L 115 170 L 100 188 L 85 170 Z" fill="#f0f0f0" stroke="#888" stroke-width="1"/>
      <circle cx="100" cy="188" r="1.5" fill="#888"/>
      <circle cx="100" cy="200" r="1.5" fill="#888"/>`;
  } else if (c.vetement === "kimono") {
    vetement = `
      <path d="M 20 200 L 20 175 L 70 170 L 130 170 L 180 175 L 180 200 Z" fill="#a83b46" />
      <path d="M 70 170 L 100 200 L 130 170 L 105 170 L 100 175 L 95 170 Z" fill="#fff"/>
      <line x1="95" y1="175" x2="105" y2="175" stroke="#3aa86b" stroke-width="3"/>`;
  } else if (c.vetement === "blouson") {
    vetement = `
      <path d="M 20 200 L 20 175 L 70 168 L 130 168 L 180 175 L 180 200 Z" fill="#222" />
      <path d="M 70 168 L 100 195 L 130 168" stroke="#444" stroke-width="2" fill="none"/>
      <circle cx="100" cy="178" r="1.5" fill="#999"/>
      <circle cx="100" cy="186" r="1.5" fill="#999"/>
      <circle cx="100" cy="194" r="1.5" fill="#999"/>`;
  } else if (c.vetement === "tshirt_licorne") {
    vetement = `
      <path d="M 20 200 L 20 178 L 70 170 L 130 170 L 180 178 L 180 200 Z" fill="#ffd6e0" />
      <text x="100" y="192" font-size="20" text-anchor="middle">🦄</text>`;
  } else if (c.vetement === "pull_pingouin") {
    vetement = `
      <path d="M 20 200 L 20 175 L 70 168 L 130 168 L 180 175 L 180 200 Z" fill="#1f4f86" />
      <text x="100" y="194" font-size="20" text-anchor="middle">🐧</text>`;
  }

  // Cheveux
  let cheveux = "";
  if (c.cheveux_style === "court") {
    cheveux = `<path d="M 45 70 Q 100 30 155 70 Q 160 90 150 95 Q 100 65 50 95 Q 40 90 45 70 Z" fill="${chevColor}" />`;
  } else if (c.cheveux_style === "milong") {
    cheveux = `<path d="M 40 70 Q 100 25 160 70 L 165 130 Q 155 100 150 95 Q 100 65 50 95 Q 45 100 35 130 Z" fill="${chevColor}" />`;
  } else if (c.cheveux_style === "long") {
    cheveux = `<path d="M 35 65 Q 100 20 165 65 L 175 175 Q 158 100 150 95 Q 100 65 50 95 Q 42 100 25 175 Z" fill="${chevColor}" />`;
  } else if (c.cheveux_style === "boucle") {
    cheveux = `
      <circle cx="55" cy="70" r="14" fill="${chevColor}" />
      <circle cx="75" cy="55" r="15" fill="${chevColor}" />
      <circle cx="100" cy="48" r="16" fill="${chevColor}" />
      <circle cx="125" cy="55" r="15" fill="${chevColor}" />
      <circle cx="145" cy="70" r="14" fill="${chevColor}" />
      <circle cx="60" cy="90" r="11" fill="${chevColor}" />
      <circle cx="140" cy="90" r="11" fill="${chevColor}" />
    `;
  } else if (c.cheveux_style === "queue") {
    cheveux = `
      <path d="M 50 70 Q 100 35 150 70 Q 152 88 142 92 Q 100 70 58 92 Q 48 88 50 70 Z" fill="${chevColor}" />
      <ellipse cx="155" cy="120" rx="12" ry="30" fill="${chevColor}" />
    `;
  } else if (c.cheveux_style === "afro") {
    cheveux = `
      <circle cx="100" cy="60" r="55" fill="${chevColor}" />
      <circle cx="55" cy="80" r="22" fill="${chevColor}" />
      <circle cx="145" cy="80" r="22" fill="${chevColor}" />
      <circle cx="100" cy="105" r="25" fill="${peau}" opacity="0" />
    `;
  } else if (c.cheveux_style === "mohawk") {
    cheveux = `
      <path d="M 75 95 Q 70 35 100 25 Q 130 35 125 95 Z" fill="${chevColor}" />
    `;
  } else if (c.cheveux_style === "frange") {
    cheveux = `
      <path d="M 40 75 Q 100 30 160 75 L 160 100 Q 100 75 40 100 Z" fill="${chevColor}" />
      <path d="M 60 100 Q 75 90 90 100 Q 100 95 110 100 Q 125 90 140 100 L 140 80 Q 100 65 60 80 Z" fill="${chevColor}" />
    `;
  } else if (c.cheveux_style === "chignon") {
    cheveux = `
      <path d="M 50 70 Q 100 35 150 70 Q 152 88 142 92 Q 100 70 58 92 Q 48 88 50 70 Z" fill="${chevColor}" />
      <circle cx="100" cy="35" r="18" fill="${chevColor}" />
    `;
  } else if (c.cheveux_style === "tresses") {
    cheveux = `
      <path d="M 45 70 Q 100 35 155 70 Q 160 90 150 95 Q 100 65 50 95 Q 40 90 45 70 Z" fill="${chevColor}" />
      <ellipse cx="40" cy="120" rx="10" ry="35" fill="${chevColor}" />
      <ellipse cx="160" cy="120" rx="10" ry="35" fill="${chevColor}" />
      <line x1="40" y1="100" x2="40" y2="155" stroke="${adjustColor(chevColor,-30)}" stroke-width="1.5" stroke-dasharray="4 3" />
      <line x1="160" y1="100" x2="160" y2="155" stroke="${adjustColor(chevColor,-30)}" stroke-width="1.5" stroke-dasharray="4 3" />
    `;
  } else if (c.cheveux_style === "mulet") {
    cheveux = `
      <path d="M 45 70 Q 100 30 155 70 Q 160 90 150 95 Q 100 65 50 95 Q 40 90 45 70 Z" fill="${chevColor}" />
      <path d="M 60 95 Q 100 105 140 95 L 145 165 Q 100 130 55 165 Z" fill="${chevColor}" />
    `;
  }
  // V4.85 — nouvelles coiffures
  else if (c.cheveux_style === "dreadlocks") {
    cheveux = `
      <path d="M 45 70 Q 100 30 155 70 Q 160 90 150 95 Q 100 65 50 95 Q 40 90 45 70 Z" fill="${chevColor}" />
      <ellipse cx="40" cy="130" rx="6" ry="40" fill="${chevColor}"/>
      <ellipse cx="55" cy="135" rx="6" ry="38" fill="${chevColor}"/>
      <ellipse cx="160" cy="130" rx="6" ry="40" fill="${chevColor}"/>
      <ellipse cx="145" cy="135" rx="6" ry="38" fill="${chevColor}"/>`;
  } else if (c.cheveux_style === "herisses") {
    cheveux = `
      <path d="M 45 75 Q 100 35 155 75 Q 160 90 150 95 Q 100 70 50 95 Q 40 90 45 75 Z" fill="${chevColor}" />
      <path d="M 60 50 L 65 30 L 75 50 Z" fill="${chevColor}"/>
      <path d="M 80 45 L 85 22 L 95 45 Z" fill="${chevColor}"/>
      <path d="M 100 42 L 105 18 L 115 42 Z" fill="${chevColor}"/>
      <path d="M 120 45 L 125 22 L 135 45 Z" fill="${chevColor}"/>
      <path d="M 140 50 L 145 30 L 155 50 Z" fill="${chevColor}"/>`;
  } else if (c.cheveux_style === "banane") {
    cheveux = `
      <path d="M 50 75 Q 100 35 150 75 L 145 95 Q 100 75 55 95 Z" fill="${chevColor}" />
      <path d="M 70 60 Q 100 25 130 60 Q 130 40 100 35 Q 70 40 70 60 Z" fill="${chevColor}"/>`;
  } else if (c.cheveux_style === "raie_milieu") {
    cheveux = `
      <path d="M 45 75 Q 70 40 100 50 L 100 95 Q 70 75 50 95 Q 40 90 45 75 Z" fill="${chevColor}" />
      <path d="M 100 50 Q 130 40 155 75 Q 160 90 150 95 Q 130 75 100 95 Z" fill="${chevColor}" />
      <line x1="100" y1="50" x2="100" y2="95" stroke="${adjustColor(chevColor,-25)}" stroke-width="1"/>`;
  } else if (c.cheveux_style === "tresses_afro") {
    cheveux = `
      <path d="M 45 70 Q 100 35 155 70 Q 160 90 150 95 Q 100 65 50 95 Q 40 90 45 70 Z" fill="${chevColor}" />
      <line x1="60" y1="70" x2="55" y2="100" stroke="${adjustColor(chevColor,-30)}" stroke-width="2"/>
      <line x1="80" y1="60" x2="78" y2="100" stroke="${adjustColor(chevColor,-30)}" stroke-width="2"/>
      <line x1="100" y1="55" x2="100" y2="100" stroke="${adjustColor(chevColor,-30)}" stroke-width="2"/>
      <line x1="120" y1="60" x2="122" y2="100" stroke="${adjustColor(chevColor,-30)}" stroke-width="2"/>
      <line x1="140" y1="70" x2="145" y2="100" stroke="${adjustColor(chevColor,-30)}" stroke-width="2"/>`;
  } else if (c.cheveux_style === "demi_queue") {
    cheveux = `
      <path d="M 45 70 Q 100 30 155 70 Q 160 90 150 95 Q 100 65 50 95 Q 40 90 45 70 Z" fill="${chevColor}" />
      <ellipse cx="100" cy="42" rx="20" ry="14" fill="${chevColor}"/>
      <rect x="93" y="48" width="14" height="6" fill="${adjustColor(chevColor,-30)}" rx="2"/>`;
  }

  // Sourcils (sous les cheveux mais au-dessus du visage)
  let sourcils = "";
  if (c.sourcils !== "aucun" && c.lunettes !== "soleil") {
    if (c.sourcils === "fins") {
      sourcils = `
        <line x1="68" y1="92" x2="88" y2="90" stroke="${chevColor}" stroke-width="2.5" stroke-linecap="round" />
        <line x1="112" y1="90" x2="132" y2="92" stroke="${chevColor}" stroke-width="2.5" stroke-linecap="round" />
      `;
    } else if (c.sourcils === "epais") {
      sourcils = `
        <path d="M 67 94 Q 78 86 89 92 L 89 96 Q 78 91 67 98 Z" fill="${chevColor}" />
        <path d="M 111 92 Q 122 86 133 94 L 133 98 Q 122 91 111 96 Z" fill="${chevColor}" />
      `;
    } else if (c.sourcils === "arques") {
      sourcils = `
        <path d="M 67 94 Q 78 84 89 94" stroke="${chevColor}" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 111 94 Q 122 84 133 94" stroke="${chevColor}" stroke-width="3" fill="none" stroke-linecap="round" />
      `;
    } else if (c.sourcils === "fronces") {
      sourcils = `
        <path d="M 67 88 L 89 96" stroke="${chevColor}" stroke-width="3" stroke-linecap="round" />
        <path d="M 111 96 L 133 88" stroke="${chevColor}" stroke-width="3" stroke-linecap="round" />
      `;
    }
  }

  // Taches de rousseur
  let taches = "";
  if (c.taches === "oui") {
    const couleurT = adjustColor(peau, -45);
    taches = `
      <circle cx="78" cy="120" r="1.5" fill="${couleurT}" />
      <circle cx="84" cy="124" r="1.2" fill="${couleurT}" />
      <circle cx="74" cy="128" r="1.3" fill="${couleurT}" />
      <circle cx="116" cy="120" r="1.5" fill="${couleurT}" />
      <circle cx="122" cy="124" r="1.2" fill="${couleurT}" />
      <circle cx="126" cy="128" r="1.3" fill="${couleurT}" />
      <circle cx="100" cy="125" r="1.2" fill="${couleurT}" />
    `;
  }

  // Lunettes
  let lunettes = "";
  if (c.lunettes !== "aucune") {
    if (c.lunettes === "rondes") {
      lunettes = `
        <circle cx="78" cy="108" r="14" fill="rgba(255,255,255,.2)" stroke="#1a1a1a" stroke-width="3" />
        <circle cx="122" cy="108" r="14" fill="rgba(255,255,255,.2)" stroke="#1a1a1a" stroke-width="3" />
        <line x1="92" y1="108" x2="108" y2="108" stroke="#1a1a1a" stroke-width="3" />
      `;
    } else if (c.lunettes === "rectangulaires") {
      lunettes = `
        <rect x="62" y="100" width="32" height="18" rx="3" fill="rgba(255,255,255,.2)" stroke="#1a1a1a" stroke-width="3" />
        <rect x="106" y="100" width="32" height="18" rx="3" fill="rgba(255,255,255,.2)" stroke="#1a1a1a" stroke-width="3" />
        <line x1="94" y1="109" x2="106" y2="109" stroke="#1a1a1a" stroke-width="3" />
      `;
    } else if (c.lunettes === "soleil") {
      lunettes = `
        <rect x="62" y="100" width="32" height="18" rx="6" fill="#1a1a1a" />
        <rect x="106" y="100" width="32" height="18" rx="6" fill="#1a1a1a" />
        <line x1="94" y1="109" x2="106" y2="109" stroke="#1a1a1a" stroke-width="3" />
      `;
    } else if (c.lunettes === "aviateur") {
      lunettes = `
        <path d="M 60 100 L 96 100 Q 96 124 78 124 Q 60 124 60 100 Z" fill="rgba(120,180,220,.3)" stroke="#7a7a7a" stroke-width="2" />
        <path d="M 104 100 L 140 100 Q 140 124 122 124 Q 104 124 104 100 Z" fill="rgba(120,180,220,.3)" stroke="#7a7a7a" stroke-width="2" />
        <line x1="96" y1="105" x2="104" y2="105" stroke="#7a7a7a" stroke-width="2" />
      `;
    } else if (c.lunettes === "carrees_grosses") {
      lunettes = `
        <rect x="58" y="96" width="40" height="26" rx="3" fill="rgba(255,255,255,.15)" stroke="#1a1a1a" stroke-width="4" />
        <rect x="102" y="96" width="40" height="26" rx="3" fill="rgba(255,255,255,.15)" stroke="#1a1a1a" stroke-width="4" />
        <line x1="98" y1="109" x2="102" y2="109" stroke="#1a1a1a" stroke-width="4" />
      `;
    }
  }

  // Yeux (cachés derrière les lunettes soleil/aviateur foncés)
  let yeux = "";
  const yeuxCaches = (c.lunettes === "soleil");
  if (!yeuxCaches) {
    if (c.yeux === "ronds") {
      yeux = `
        <circle cx="78" cy="108" r="5" fill="#1a1a1a" />
        <circle cx="122" cy="108" r="5" fill="#1a1a1a" />
        <circle cx="79" cy="106" r="1.5" fill="#fff" />
        <circle cx="123" cy="106" r="1.5" fill="#fff" />
      `;
    } else if (c.yeux === "amande") {
      yeux = `
        <ellipse cx="78" cy="108" rx="6" ry="3" fill="#1a1a1a" />
        <ellipse cx="122" cy="108" rx="6" ry="3" fill="#1a1a1a" />
      `;
    } else if (c.yeux === "sourire") {
      yeux = `
        <path d="M 72 108 Q 78 102 84 108" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 116 108 Q 122 102 128 108" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />
      `;
    } else if (c.yeux === "endormis") {
      yeux = `
        <line x1="70" y1="108" x2="86" y2="108" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" />
        <line x1="114" y1="108" x2="130" y2="108" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" />
      `;
    } else if (c.yeux === "surpris") {
      yeux = `
        <circle cx="78" cy="108" r="8" fill="#fff" stroke="#1a1a1a" stroke-width="2" />
        <circle cx="122" cy="108" r="8" fill="#fff" stroke="#1a1a1a" stroke-width="2" />
        <circle cx="78" cy="108" r="3" fill="#1a1a1a" />
        <circle cx="122" cy="108" r="3" fill="#1a1a1a" />
      `;
    } else if (c.yeux === "clin") {
      yeux = `
        <path d="M 72 108 Q 78 100 84 108" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />
        <circle cx="122" cy="108" r="5" fill="#1a1a1a" />
      `;
    }
  }

  // Bouche
  let bouche = "";
  if (c.bouche === "sourire") {
    bouche = `<path d="M 85 138 Q 100 150 115 138" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />`;
  } else if (c.bouche === "neutre") {
    bouche = `<line x1="88" y1="140" x2="112" y2="140" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round" />`;
  } else if (c.bouche === "grand_sourire") {
    bouche = `<path d="M 80 134 Q 100 156 120 134 Q 100 142 80 134 Z" fill="#cc4a55" stroke="#1a1a1a" stroke-width="2" />`;
  } else if (c.bouche === "coin") {
    bouche = `<path d="M 88 142 Q 105 134 118 138" stroke="#1a1a1a" stroke-width="3" fill="none" stroke-linecap="round" />`;
  } else if (c.bouche === "langue") {
    bouche = `
      <path d="M 80 134 Q 100 152 120 134 Q 100 142 80 134 Z" fill="#cc4a55" stroke="#1a1a1a" stroke-width="2" />
      <ellipse cx="105" cy="148" rx="8" ry="6" fill="#ff7d8c" />
    `;
  } else if (c.bouche === "ohno") {
    bouche = `<ellipse cx="100" cy="142" rx="7" ry="9" fill="#1a1a1a" />`;
  }

  // Barbe / pilosité (sous la bouche)
  let barbe = "";
  if (c.barbe === "moustache") {
    barbe = `<path d="M 82 132 Q 92 128 100 132 Q 108 128 118 132 Q 110 138 100 135 Q 90 138 82 132 Z" fill="${chevColor}" />`;
  } else if (c.barbe === "bouc") {
    barbe = `<path d="M 90 150 Q 100 165 110 150 Q 108 158 100 162 Q 92 158 90 150 Z" fill="${chevColor}" />`;
  } else if (c.barbe === "courte") {
    barbe = `<path d="M 65 130 Q 100 155 135 130 L 130 165 Q 100 175 70 165 Z" fill="${chevColor}" opacity=".75" />`;
  } else if (c.barbe === "longue") {
    barbe = `<path d="M 60 125 Q 100 165 140 125 L 145 175 Q 100 195 55 175 Z" fill="${chevColor}" />`;
  }

  // Accessoires
  let accessoire = "";
  if (c.accessoire === "toque") {
    accessoire = `
      <ellipse cx="100" cy="48" rx="38" ry="14" fill="#fff" stroke="#ccc" stroke-width="1.5" />
      <path d="M 65 48 Q 65 12 100 18 Q 135 12 135 48 Q 135 25 100 30 Q 65 25 65 48 Z" fill="#fff" stroke="#ccc" stroke-width="1.5" />
    `;
  } else if (c.accessoire === "casquette") {
    accessoire = `
      <path d="M 50 70 Q 100 35 150 70 L 150 90 Q 100 75 50 90 Z" fill="#2f6fb5" />
      <path d="M 50 90 Q 100 78 150 90 L 165 100 Q 100 85 35 100 Z" fill="#1f4f86" />
      <circle cx="100" cy="62" r="6" fill="#fff" />
    `;
  } else if (c.accessoire === "bonnet") {
    accessoire = `
      <path d="M 50 80 Q 50 30 100 25 Q 150 30 150 80 Q 100 75 50 80 Z" fill="#cc4a55" />
      <ellipse cx="100" cy="80" rx="50" ry="10" fill="#a83b46" />
      <circle cx="100" cy="22" r="8" fill="#fff" />
    `;
  } else if (c.accessoire === "bandana") {
    accessoire = `
      <path d="M 45 75 Q 100 50 155 75 L 155 90 Q 100 85 45 90 Z" fill="#cc4a55" />
      <path d="M 45 75 L 50 95 L 60 78 Z M 155 75 L 150 95 L 140 78 Z" fill="#cc4a55" />
      <circle cx="80" cy="82" r="2" fill="#fff" />
      <circle cx="100" cy="80" r="2" fill="#fff" />
      <circle cx="120" cy="82" r="2" fill="#fff" />
    `;
  } else if (c.accessoire === "headband") {
    accessoire = `
      <rect x="40" y="74" width="120" height="10" fill="#2f6fb5" rx="3" />
      <circle cx="100" cy="79" r="3" fill="#fff" />
    `;
  } else if (c.accessoire === "foulard") {
    accessoire = `
      <path d="M 50 165 Q 100 180 150 165 L 150 195 L 50 195 Z" fill="#cc4a55" />
      <path d="M 100 175 L 95 195 L 105 195 Z" fill="#a83b46" />
    `;
  } else if (c.accessoire === "boucles") {
    accessoire = `
      <circle cx="48" cy="125" r="4" fill="#ffd700" />
      <circle cx="152" cy="125" r="4" fill="#ffd700" />
    `;
  }
  // V4.85 — nouvelles coiffes
  else if (c.accessoire === "charlotte") {
    accessoire = `
      <ellipse cx="100" cy="55" rx="55" ry="22" fill="#fff" stroke="#ccc" stroke-width="1"/>
      <ellipse cx="100" cy="55" rx="55" ry="22" fill="url(#charlotteDots)" opacity="0"/>
      <circle cx="70" cy="48" r="1.5" fill="#bbb"/>
      <circle cx="85" cy="40" r="1.5" fill="#bbb"/>
      <circle cx="100" cy="38" r="1.5" fill="#bbb"/>
      <circle cx="115" cy="40" r="1.5" fill="#bbb"/>
      <circle cx="130" cy="48" r="1.5" fill="#bbb"/>
      <circle cx="80" cy="60" r="1.2" fill="#bbb"/>
      <circle cx="120" cy="60" r="1.2" fill="#bbb"/>`;
  } else if (c.accessoire === "turban") {
    accessoire = `
      <path d="M 40 80 Q 100 35 160 80 L 160 95 Q 100 75 40 95 Z" fill="#a83b46"/>
      <path d="M 50 65 Q 100 30 150 65 Q 100 50 50 65 Z" fill="#cc4a55"/>
      <ellipse cx="155" cy="72" rx="8" ry="14" fill="#cc4a55" transform="rotate(20 155 72)"/>`;
  } else if (c.accessoire === "couronne") {
    accessoire = `
      <path d="M 55 78 L 65 45 L 80 65 L 100 35 L 120 65 L 135 45 L 145 78 Z" fill="#ffd700" stroke="#b8860b" stroke-width="1.5"/>
      <circle cx="65" cy="45" r="3" fill="#ff3366"/>
      <circle cx="100" cy="35" r="3" fill="#3a86ff"/>
      <circle cx="135" cy="45" r="3" fill="#3aa86b"/>`;
  } else if (c.accessoire === "casque_pomp") {
    accessoire = `
      <path d="M 45 80 Q 100 30 155 80 L 155 95 Q 100 80 45 95 Z" fill="#cc1f1f"/>
      <ellipse cx="100" cy="48" rx="35" ry="14" fill="#cc1f1f"/>
      <rect x="80" y="40" width="40" height="14" fill="#fff"/>
      <text x="100" y="51" font-size="9" text-anchor="middle" fill="#cc1f1f" font-weight="bold">SP</text>`;
  } else if (c.accessoire === "cowboy") {
    accessoire = `
      <path d="M 30 80 Q 100 60 170 80 L 170 88 Q 100 78 30 88 Z" fill="#8b5a2b"/>
      <path d="M 60 75 Q 100 35 140 75 Q 100 50 60 75 Z" fill="#a8703a"/>
      <ellipse cx="100" cy="80" rx="50" ry="6" fill="#6e3f1c"/>`;
  } else if (c.accessoire === "beret") {
    accessoire = `
      <ellipse cx="100" cy="55" rx="48" ry="20" fill="#1a1a1a"/>
      <ellipse cx="100" cy="60" rx="42" ry="14" fill="#1a1a1a"/>
      <circle cx="125" cy="40" r="4" fill="#1a1a1a"/>`;
  } else if (c.accessoire === "bandana_pois") {
    accessoire = `
      <path d="M 45 75 Q 100 50 155 75 L 155 90 Q 100 85 45 90 Z" fill="#3a86ff"/>
      <path d="M 45 75 L 50 95 L 60 78 Z M 155 75 L 150 95 L 140 78 Z" fill="#3a86ff"/>
      <circle cx="65" cy="80" r="2.5" fill="#fff"/>
      <circle cx="85" cy="76" r="2.5" fill="#fff"/>
      <circle cx="105" cy="80" r="2.5" fill="#fff"/>
      <circle cx="125" cy="76" r="2.5" fill="#fff"/>
      <circle cx="145" cy="80" r="2.5" fill="#fff"/>`;
  }

  // V4.85 — Joues rosées
  let joues = "";
  if (c.joues === "legeres") {
    joues = `
      <ellipse cx="73" cy="128" rx="9" ry="6" fill="#ff8a9c" opacity="0.35"/>
      <ellipse cx="127" cy="128" rx="9" ry="6" fill="#ff8a9c" opacity="0.35"/>`;
  } else if (c.joues === "marquees") {
    joues = `
      <ellipse cx="73" cy="128" rx="11" ry="7" fill="#ff5c75" opacity="0.55"/>
      <ellipse cx="127" cy="128" rx="11" ry="7" fill="#ff5c75" opacity="0.55"/>`;
  }

  // V4.85 — Maquillage des lèvres : surcouche colorée sur la bouche
  let maquillage = "";
  if (c.maquillage && c.maquillage !== "sans") {
    const lipFill = c.maquillage === "rouge"   ? "#cc1f3d"
                  : c.maquillage === "rose"    ? "#e87bb1"
                  : c.maquillage === "violet"  ? "#8b3aff"
                  : /* brillant */               "#ff3366";
    // Forme générale de lèvres au-dessus de la bouche existante
    maquillage = `<path d="M 80 138 Q 90 130 100 134 Q 110 130 120 138 Q 110 144 100 142 Q 90 144 80 138 Z" fill="${lipFill}" opacity="0.9"/>`;
    if (c.maquillage === "brillant") {
      maquillage += `<ellipse cx="93" cy="135" rx="3" ry="1.2" fill="#fff" opacity="0.7"/>`;
    }
  }

  // V4.85 — Tatouage joue (emoji)
  let tatouage = "";
  if (c.tatouage && c.tatouage !== "sans") {
    const emojiTat = c.tatouage === "coeur" ? "❤️"
                  : c.tatouage === "etoile" ? "⭐"
                  : c.tatouage === "flamme" ? "🔥"
                  : c.tatouage === "papillon" ? "🦋"
                  : "💧";
    tatouage = `<text x="135" y="143" font-size="14" text-anchor="middle">${emojiTat}</text>`;
  }

  // V4.85 — Piercing
  let piercing = "";
  if (c.piercing === "nez") {
    piercing = `<circle cx="103" cy="125" r="2" fill="#ffd700" stroke="#b8860b" stroke-width="0.5"/>`;
  } else if (c.piercing === "sourcil") {
    piercing = `<circle cx="135" cy="92" r="2" fill="#c0c0c0" stroke="#888" stroke-width="0.5"/>`;
  } else if (c.piercing === "levre") {
    piercing = `<circle cx="120" cy="143" r="1.8" fill="#c0c0c0" stroke="#888" stroke-width="0.5"/>`;
  }

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    ${defs}
    ${fond}
    ${cou}
    ${vetement}
    ${visage}
    ${cheveux}
    ${sourcils}
    ${taches}
    ${joues}
    ${yeux}
    ${lunettes}
    ${bouche}
    ${maquillage}
    ${barbe}
    ${piercing}
    ${tatouage}
    ${accessoire}
  </svg>`;
}

function adjustColor(hex, amount) {
  // Ajuste la luminosité d'une couleur hex (-100 à +100)
  // V4.85 : si on reçoit une URL de gradient (cheveux fluo), retourne la couleur sombre par défaut
  if (!hex || !hex.startsWith("#")) return amount < 0 ? "#3b2418" : "#9a9a9a";
  const num = parseInt(hex.replace("#",""), 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0xff) + amount;
  let b = (num & 0xff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

/* Modale d'édition d'avatar composable */
function openAvatarEditor() {
  const old = document.getElementById("avatar-editor");
  if (old) old.remove();
  const m = document.createElement("div");
  m.id = "avatar-editor"; m.className = "modal";
  let working = JSON.parse(JSON.stringify(getAvatarConfig()));

  m.innerHTML = `
    <div class="modal-content" style="max-width:820px;">
      <button class="modal-close" id="ae-close">×</button>
      <h2 style="color:var(--c-primary-dark); margin-top:0;">🧑‍🎨 Compose ton avatar</h2>
      <div class="ae-grid">
        <div class="ae-preview">
          <div id="ae-preview-svg"></div>
          <div class="ae-preview-actions">
            <button type="button" class="btn btn-sm" id="ae-random">🎲 Aléatoire</button>
            <button type="button" class="btn btn-sm" id="ae-random-chef">👨‍🍳 Cuisinier</button>
            <button type="button" class="btn btn-sm" id="ae-reset">↺ Réinitialiser</button>
            <button type="button" class="btn btn-sm" id="ae-png">📸 Télécharger PNG</button>
          </div>
          <!-- V4.85 — Préréglages thématiques -->
          <div class="ae-presets">
            <div class="ae-presets-label">Préréglages</div>
            <div class="ae-presets-grid">
              <button type="button" class="ae-preset" data-preset="chef">👨‍🍳 Chef</button>
              <button type="button" class="ae-preset" data-preset="ecolier">🎓 Écolier</button>
              <button type="button" class="ae-preset" data-preset="sport">🏃 Sport</button>
              <button type="button" class="ae-preset" data-preset="hiver">❄️ Hiver</button>
              <button type="button" class="ae-preset" data-preset="festif">🎉 Festif</button>
            </div>
          </div>
        </div>
        <div class="ae-controls" id="ae-controls"></div>
      </div>
      <div style="margin-top:14px; display:flex; gap:8px; justify-content:flex-end;">
        <button type="button" class="btn" id="ae-cancel">Annuler</button>
        <button type="button" class="btn btn-primary" id="ae-save">Enregistrer mon avatar</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
  m.addEventListener("click", e => { if (e.target.id === "avatar-editor") m.remove(); });
  m.querySelector("#ae-close").addEventListener("click", () => m.remove());
  m.querySelector("#ae-cancel").addEventListener("click", () => m.remove());

  function renderPreview() {
    document.getElementById("ae-preview-svg").innerHTML = buildAvatarSVG(working, 200);
  }
  function renderControls() {
    const ctrl = document.getElementById("ae-controls");
    let html = "";
    const groups = [
      ["fond",            "Couleur de fond"],
      ["motif_fond",      "Motif du fond"],
      ["forme",           "Forme du visage"],
      ["peau",            "Couleur de peau"],
      ["taches",          "Taches de rousseur"],
      ["joues",           "Joues rosées"],
      ["sourcils",        "Sourcils"],
      ["cheveux_style",   "Style de cheveux"],
      ["cheveux_couleur", "Couleur de cheveux"],
      ["barbe",           "Barbe / Moustache"],
      ["yeux",            "Yeux"],
      ["bouche",          "Bouche"],
      ["maquillage",      "Maquillage des lèvres"],
      ["lunettes",        "Lunettes"],
      ["piercing",        "Piercing"],
      ["tatouage",        "Tatouage joue"],
      ["accessoire",      "Couvre-chef / Accessoire"],
      ["vetement",        "Vêtement"],
    ];
    groups.forEach(([key, lbl]) => {
      html += `<div class="ae-group"><label>${lbl}</label><div class="ae-options">`;
      AVATAR_OPTIONS[key].forEach(opt => {
        const active = working[key] === opt.id;
        if (opt.color) {
          html += `<button type="button" class="ae-opt ae-color ${active ? "active" : ""}" data-k="${key}" data-v="${opt.id}" style="background:${opt.color};" title="${opt.id}"></button>`;
        } else {
          html += `<button type="button" class="ae-opt ae-text ${active ? "active" : ""}" data-k="${key}" data-v="${opt.id}">${escapeHtml(opt.label)}</button>`;
        }
      });
      html += `</div></div>`;
    });
    ctrl.innerHTML = html;
    ctrl.querySelectorAll("[data-k]").forEach(b => {
      b.addEventListener("click", () => {
        working[b.dataset.k] = b.dataset.v;
        renderPreview(); renderControls();
      });
    });
  }
  renderPreview(); renderControls();

  m.querySelector("#ae-random").addEventListener("click", () => {
    Object.keys(AVATAR_OPTIONS).forEach(k => {
      const opts = AVATAR_OPTIONS[k];
      working[k] = opts[Math.floor(Math.random() * opts.length)].id;
    });
    renderPreview(); renderControls();
  });
  // V4.85 — Random "Cuisinier" : aléatoire MAIS verrouille tenue chef
  m.querySelector("#ae-random-chef").addEventListener("click", () => {
    Object.keys(AVATAR_OPTIONS).forEach(k => {
      const opts = AVATAR_OPTIONS[k];
      working[k] = opts[Math.floor(Math.random() * opts.length)].id;
    });
    working.accessoire = Math.random() > 0.5 ? "toque" : "charlotte";
    working.vetement   = Math.random() > 0.5 ? "veste_chef" : "tablier";
    working.barbe      = Math.random() > 0.7 ? working.barbe : "aucune";
    working.lunettes   = "aucune"; // pas de lunettes en cuisine
    renderPreview(); renderControls();
  });
  m.querySelector("#ae-reset").addEventListener("click", () => {
    working = JSON.parse(JSON.stringify(DEFAULT_AVATAR));
    renderPreview(); renderControls();
  });
  // V4.85 — Préréglages thématiques
  const PRESETS = {
    chef:    { accessoire: "toque",      vetement: "veste_chef",     bouche: "sourire",       fond: "blanc" },
    ecolier: { accessoire: "aucun",      vetement: "polo",            bouche: "sourire",       lunettes: "rondes", fond: "creme" },
    sport:   { accessoire: "headband",   vetement: "tshirt_bleu",     bouche: "sourire",       cheveux_style: "queue", joues: "legeres", fond: "vert" },
    hiver:   { accessoire: "bonnet",     vetement: "sweat_capuche",   bouche: "sourire",       motif_fond: "nuages", joues: "marquees" },
    festif:  { accessoire: "couronne",   vetement: "tshirt_licorne",  bouche: "grand_sourire", motif_fond: "etoiles", maquillage: "brillant", tatouage: "etoile" },
  };
  m.querySelectorAll(".ae-preset").forEach(b => {
    b.addEventListener("click", () => {
      const preset = PRESETS[b.dataset.preset];
      if (!preset) return;
      Object.keys(preset).forEach(k => { working[k] = preset[k]; });
      renderPreview(); renderControls();
    });
  });
  // V4.85 — Téléchargement PNG (rendu via canvas)
  m.querySelector("#ae-png").addEventListener("click", () => {
    const svg = buildAvatarSVG(working, 400);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 400;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 400, 400);
      URL.revokeObjectURL(url);
      canvas.toBlob((png) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(png);
        const nom = (state.infos_eleve.prenom || "avatar").replace(/\s+/g, "_");
        a.download = `Avatar_${nom}_${new Date().toISOString().slice(0,10)}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }, "image/png");
    };
    img.src = url;
  });
  m.querySelector("#ae-save").addEventListener("click", () => {
    if (!state.preferences) state.preferences = {};
    state.preferences.avatar_compose = working;
    saveState();
    m.remove();
    // V4.27 : il faut renderAll (pas seulement renderMain) pour rafraîchir le header
    renderAll();
  });
}

/* Renvoie le HTML d'avatar prêt à insérer (SVG si configuré, sinon emoji
   d'ancienne version, sinon placeholder initiales). */
function renderAvatarHTML(size, prenom, nom) {
  const conf = state.preferences && state.preferences.avatar_compose;
  if (conf) return buildAvatarSVG(conf, size);
  // Fallback : avatar emoji existant si défini
  const emojiAv = state.preferences && state.preferences.avatar;
  if (emojiAv) {
    return `<div style="width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center; font-size:${Math.round(size*0.55)}px; background:linear-gradient(135deg, #1f4f86, #2e8b57); color:#fff; border-radius:50%;">${escapeHtml(emojiAv)}</div>`;
  }
  // Initiales par défaut
  const initials = ((prenom||"?").charAt(0) + (nom||"").charAt(0)).toUpperCase() || "?";
  return `<div style="width:${size}px; height:${size}px; display:flex; align-items:center; justify-content:center; font-size:${Math.round(size*0.4)}px; font-weight:700; background:linear-gradient(135deg, #1f4f86, #2e8b57); color:#fff; border-radius:50%;">${escapeHtml(initials)}</div>`;
}

/* =====================================================================
   V4.20 — PRÉFÉRENCES UTILISATEUR (couleur, contraste, avatar)
   ===================================================================== */
const COULEURS_THEMES = {
  bleu:   { primary: "#2f6fb5", primaryDark: "#1f4f86" },
  vert:   { primary: "#2e8b57", primaryDark: "#1f6b3d" },
  violet: { primary: "#7b51c7", primaryDark: "#5e3da0" },
  orange: { primary: "#e07b00", primaryDark: "#a85a00" },
};
const AVATARS = ["👨‍🍳","👩‍🍳","🧑‍🍳","🥗","🍽️","🌱","🥖","🍅","🍎","🧁","🍳","🌿","🌾","🥕"];

function applyPreferences() {
  const p = state.preferences || {};
  const theme = COULEURS_THEMES[p.couleur_theme || "bleu"];
  if (theme) {
    document.documentElement.style.setProperty("--c-primary", theme.primary);
    document.documentElement.style.setProperty("--c-primary-dark", theme.primaryDark);
  }
  document.body.classList.toggle("contraste-eleve", !!p.contraste);
}

function openPreferences() {
  let panel = document.getElementById("pref-panel");
  if (panel) panel.remove();
  panel = document.createElement("div");
  panel.id = "pref-panel"; panel.className = "modal";
  const p = state.preferences || {};
  panel.innerHTML = `
    <div class="modal-content" style="max-width:520px;">
      <button class="modal-close" id="pref-close">×</button>
      <h2 style="color:var(--c-primary-dark); margin-top:0;">⚙️ Mes préférences</h2>

      <div class="pref-group">
        <label>Couleur principale</label>
        <div class="pref-couleurs">
          ${Object.keys(COULEURS_THEMES).map(c => `
            <button type="button" class="pref-couleur ${p.couleur_theme === c ? "active" : ""}" data-c="${c}"
              style="background:${COULEURS_THEMES[c].primary};">${c}</button>
          `).join("")}
        </div>
      </div>

      <div class="pref-group">
        <label>Mon avatar</label>
        <div class="pref-avatar-current">
          ${p.avatar_compose
            ? `<div class="pac-svg">${buildAvatarSVG(p.avatar_compose, 80)}</div>`
            : p.avatar
              ? `<div class="pac-emoji">${escapeHtml(p.avatar)}</div>`
              : `<div class="pac-empty">Pas d'avatar</div>`}
          <button type="button" class="btn btn-primary" id="pref-compose">🧑‍🎨 Composer mon avatar</button>
        </div>
        <details style="margin-top:8px;">
          <summary style="cursor:pointer; color:var(--c-muted); font-size:.85rem;">Ou choisir un emoji simple</summary>
          <div class="pref-avatars" style="margin-top:6px;">
            <button type="button" class="pref-avatar ${!p.avatar && !p.avatar_compose ? "active" : ""}" data-a="">Aucun</button>
            ${AVATARS.map(a => `
              <button type="button" class="pref-avatar ${p.avatar === a ? "active" : ""}" data-a="${a}">${a}</button>
            `).join("")}
          </div>
        </details>
      </div>

      <div class="pref-group">
        <label>
          <input type="checkbox" id="pref-contraste" ${p.contraste ? "checked" : ""}>
          Contraste élevé (pour mieux lire)
        </label>
      </div>

      <div style="text-align:right; margin-top:14px;">
        <button type="button" class="btn btn-primary" id="pref-save">Enregistrer</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
  panel.addEventListener("click", e => { if (e.target.id === "pref-panel") panel.remove(); });
  panel.querySelector("#pref-close").addEventListener("click", () => panel.remove());
  let pickedCouleur = p.couleur_theme || "bleu";
  let pickedAvatar = p.avatar || null;
  panel.querySelectorAll(".pref-couleur").forEach(b => {
    b.addEventListener("click", () => {
      pickedCouleur = b.dataset.c;
      panel.querySelectorAll(".pref-couleur").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
    });
  });
  panel.querySelectorAll(".pref-avatar").forEach(b => {
    b.addEventListener("click", () => {
      pickedAvatar = b.dataset.a || null;
      panel.querySelectorAll(".pref-avatar").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      // Si on choisit un emoji, on supprime l'avatar composé
      if (state.preferences) state.preferences.avatar_compose = null;
    });
  });
  // V4.24 : bouton "Composer mon avatar" → ouvre l'éditeur SVG
  const composeBtn = panel.querySelector("#pref-compose");
  if (composeBtn) composeBtn.addEventListener("click", () => {
    panel.remove(); // ferme la modale préférences
    setTimeout(openAvatarEditor, 200);
  });
  panel.querySelector("#pref-save").addEventListener("click", () => {
    state.preferences = state.preferences || {};
    state.preferences.couleur_theme = pickedCouleur;
    state.preferences.avatar = pickedAvatar;
    state.preferences.contraste = panel.querySelector("#pref-contraste").checked;
    saveState();
    applyPreferences();
    panel.remove();
    // V4.27 : rafraîchit le header (avatar emoji / prénom / couleur)
    updateHeaderAvatar();
  });
}

/* =====================================================================
   V4.22 — Raccourcis "réviser ce module" en bas de chaque module pédago
   ===================================================================== */
const MODULE_REVIEW_MAP = {
  // section_id → { flash_deck, conversation, glossaire_filtre, memory:true }
  "comprendre":      { flash: ["comprendre"], conv: "conv_j1", glo: "chef-d'œuvre", memory: true },
  "equilibre":       { flash: ["groupes", "constituants"], conv: "conv_j2", glo: "groupe" },
  "eco_responsable": { flash: ["labels", "eco"], conv: "conv_j3", glo: "circuit" },
  "etiquetage":      { flash: ["allergenes"], conv: "conv_j4", glo: "DLC" },
  "marche_en_avant": { flash: ["marche_en_avant"], conv: "conv_j6", glo: "marche en avant" },
  "mon_menu":        { conv: "conv_j5" },
};

function renderModuleReviewLinks(sec, mod) {
  const map = MODULE_REVIEW_MAP[sec.id];
  const wrap = document.createElement("div");
  wrap.className = "module-review-block";
  if (!map) {
    wrap.style.display = "none";
    return wrap;
  }

  let buttons = "";
  if (map.flash) {
    map.flash.forEach(deckId => {
      const deck = FLASHCARDS_DECKS.find(d => d.id === deckId);
      if (deck) {
        buttons += `<button type="button" class="review-link" data-rev="flash" data-arg="${deckId}">
          <span class="rl-icon">🃏</span>
          <span class="rl-text"><b>Flashcards</b><br /><small>${escapeHtml(deck.titre)}</small></span>
        </button>`;
      }
    });
  }
  if (map.conv) {
    const conv = CONVERSATIONS.find(c => c.id === map.conv);
    if (conv) {
      buttons += `<button type="button" class="review-link" data-rev="conv" data-arg="${map.conv}">
        <span class="rl-icon">📱</span>
        <span class="rl-text"><b>Conversation</b><br /><small>${escapeHtml(conv.titre)}</small></span>
      </button>`;
    }
  }
  if (map.glo) {
    buttons += `<button type="button" class="review-link" data-rev="glo" data-arg="${map.glo}">
      <span class="rl-icon">📖</span>
      <span class="rl-text"><b>Glossaire</b><br /><small>Recherche : « ${escapeHtml(map.glo)} »</small></span>
    </button>`;
  }
  buttons += `<button type="button" class="review-link" data-rev="pendu">
    <span class="rl-icon">🎯</span>
    <span class="rl-text"><b>Pendu</b><br /><small>Devine les mots</small></span>
  </button>`;
  // V4.66 : bouton Memory si données dispo pour ce module
  if (map.memory && MEMORY_DATA[sec.id]) {
    buttons += `<button type="button" class="review-link review-link-fun" data-rev="memory">
      <span class="rl-icon">🃏</span>
      <span class="rl-text"><b>Jeu Memory</b><br /><small>Trouve les paires en t'amusant</small></span>
    </button>`;
  }
  // V4.66 : roue des défis (toujours)
  buttons += `<button type="button" class="review-link review-link-fun" data-rev="roue">
    <span class="rl-icon">🎡</span>
    <span class="rl-text"><b>Roue des défis</b><br /><small>Tourne, le défi te tombe dessus !</small></span>
  </button>`;

  wrap.innerHTML = `
    <h3>📚 Pour réviser ce module — t'amuser et tester !</h3>
    <p class="hint">Choisis un outil ludique pour t'entraîner ou mémoriser. C'est en jouant qu'on apprend le mieux 🌟</p>
    <div class="review-links">${buttons}</div>
  `;

  setTimeout(() => {
    wrap.querySelectorAll(".review-link").forEach(b => {
      b.addEventListener("click", () => {
        const t = b.dataset.rev, a = b.dataset.arg;
        if (t === "flash") openFlashcards(a);
        else if (t === "conv") { openConversations(); setTimeout(() => startConversation(a), 200); }
        else if (t === "glo") { openGlossaire(); glossaireQuery = a; setTimeout(() => { const i = document.getElementById("glo-search"); if (i) { i.value = a; renderGlossaireList(); } }, 100); }
        else if (t === "pendu") openPendu();
        else if (t === "memory") openMemoryGame(sec.id, sec.titre);
        else if (t === "roue") openRoueDefis();
      });
    });
  }, 0);

  return wrap;
}

/* =====================================================================
   V4.22 — VUE "ESPACE RÉVISION"
   Regroupe Glossaire, Flashcards, Pendu, Conversations dans un seul écran.
   ===================================================================== */
function renderRevisionView() {
  const wrap = document.createElement("div");
  wrap.className = "revision-view";

  // Calcul de progression révision
  const flashTotal = FLASHCARDS_DECKS.reduce((s, d) => s + d.cartes.length, 0);
  const flashRetenues = Object.values(state.flashcards_state || {})
    .reduce((s, st) => s + ((st.reussies || []).length), 0);
  const convFaites = Object.values(state.conversations_state || {})
    .filter(c => c.terminee).length;

  // Barre retour
  const back = document.createElement("div");
  back.className = "back-bar no-print";
  back.innerHTML = `<button type="button" class="btn btn-back">← Retour à l'accueil</button>`;
  back.querySelector("button").addEventListener("click", () => selectView("home"));
  wrap.appendChild(back);

  wrap.innerHTML += `
    <header class="revision-head">
      <div class="parcours-eyebrow">Mes outils pour m'entraîner</div>
      <h2>💪 Entraîne-toi</h2>
      <p class="hint">Tu peux revenir ici à tout moment pour réviser, t'entraîner et apprendre en t'amusant.</p>
    </header>

    <div class="revision-grid">
      <button type="button" class="revision-card" data-tool="glossaire">
        <div class="rev-icon">📖</div>
        <div class="rev-titre">Glossaire</div>
        <div class="rev-desc">40 mots-clés expliqués simplement : DLC, AOP, allergènes, protides…</div>
        <div class="rev-stat">${GLOSSAIRE.length} définitions</div>
      </button>

      <button type="button" class="revision-card" data-tool="flashcards">
        <div class="rev-icon">🃏</div>
        <div class="rev-titre">Flashcards</div>
        <div class="rev-desc">Cartes recto-verso pour mémoriser : groupes, constituants, labels…</div>
        <div class="rev-stat">${flashRetenues} / ${flashTotal} cartes retenues</div>
      </button>

      <button type="button" class="revision-card" data-tool="conversations">
        <div class="rev-icon">📱</div>
        <div class="rev-titre">Conversations</div>
        <div class="rev-desc">Échanges en mode SMS avec M. Bertrand, Lucas, Mme Dupont, Chef Marc.</div>
        <div class="rev-stat">${convFaites} / ${CONVERSATIONS.length} discussions terminées</div>
      </button>

      <button type="button" class="revision-card" data-tool="pendu">
        <div class="rev-icon">🎯</div>
        <div class="rev-titre">Pendu nutritionnel</div>
        <div class="rev-desc">Devine les mots du vocabulaire avant la fin des essais.</div>
        <div class="rev-stat">15 mots à découvrir</div>
      </button>

      <button type="button" class="revision-card" data-tool="notes">
        <div class="rev-icon">📝</div>
        <div class="rev-titre">Mes notes</div>
        <div class="rev-desc">Mes idées, mes questions, ce que je veux retenir.</div>
        <div class="rev-stat">${(state.notes || []).length} note(s)</div>
      </button>

      <button type="button" class="revision-card" data-tool="meteo">
        <div class="rev-icon">🌦️</div>
        <div class="rev-titre">Météo de mes émotions</div>
        <div class="rev-desc">Comment je me sens aujourd'hui ? Voir mon journal des émotions.</div>
        <div class="rev-stat">${(state.meteo_emotions || []).length} émotion(s) partagée(s)</div>
      </button>

      <button type="button" class="revision-card" data-tool="trouve_mot">
        <div class="rev-icon">💡</div>
        <div class="rev-titre">Trouve le mot</div>
        <div class="rev-desc">10 définitions à deviner sur tous les modules.</div>
        <div class="rev-stat">${TROUVE_LE_MOT_BANQUE.length} mots à découvrir</div>
      </button>

      <button type="button" class="revision-card rev-card-fun" data-tool="roue_defis">
        <div class="rev-icon">🎡</div>
        <div class="rev-titre">La Roue des défis</div>
        <div class="rev-desc">Tourne la roue, fais le défi qui sort ! 8 activités au hasard.</div>
        <div class="rev-stat">🎲 Surprise garantie</div>
      </button>

      <button type="button" class="revision-card rev-card-fun" data-tool="bulles">
        <div class="rev-icon">🎈</div>
        <div class="rev-titre">Bulles à éclater</div>
        <div class="rev-desc">Pause détente : clique sur les bulles pour les éclater. Anti-stress.</div>
        <div class="rev-stat">🌊 Pour respirer</div>
      </button>

      <button type="button" class="revision-card" data-tool="preferences">
        <div class="rev-icon">⚙️</div>
        <div class="rev-titre">Préférences</div>
        <div class="rev-desc">Couleur d'accent, contraste, taille du texte…</div>
        <div class="rev-stat">Personnalise ton portfolio</div>
      </button>
    </div>
  `;

  setTimeout(() => {
    wrap.querySelectorAll("[data-tool]").forEach(b => {
      b.addEventListener("click", () => {
        const tool = b.dataset.tool;
        if (tool === "glossaire") openGlossaire();
        else if (tool === "flashcards") openFlashcards(null);
        else if (tool === "conversations") openConversations();
        else if (tool === "pendu") openPendu();
        else if (tool === "notes") openNotesPanel();
        else if (tool === "meteo") openJournalEmotions();
        else if (tool === "trouve_mot") openTrouveLeMot();
        else if (tool === "referentiel_psr") openReferentielPsr();
        else if (tool === "roue_defis") openRoueDefis();
        else if (tool === "bulles") openBullesGame();
        else if (tool === "preferences") openPreferences();
      });
    });
  }, 0);

  return wrap;
}

/* =====================================================================
   V4.21 — MINI-JEU « CONVERSATIONS » (style smartphone)
   L'élève reçoit des messages d'un personnage scolaire/pro et répond en
   choisissant parmi des bulles. Animation réaliste type SMS.
   ===================================================================== */
const CONVERSATIONS = [
  {
    id: "conv_j1",
    titre: "Discussion avec M. Bertrand",
    sous_titre: "Tu comprends ton chef-d'œuvre ?",
    jalon: "j1_comprendre",
    contact: { nom: "M. Bertrand", role: "Prof de cuisine", avatar: "👨‍🏫" },
    intro: "M. Bertrand veut s'assurer que tu as bien compris ton projet de chef-d'œuvre. Il t'envoie un message…",
    echanges: [
      { from: "pnj", txt: "Salut ! C'est M. Bertrand 👋 J'ai 5 min pour vérifier que tu as bien compris ton projet de chef-d'œuvre. Tu peux me dire en quelques mots ce que c'est ?" },
      { from: "choix", options: [
        { txt: "Un grand projet sur 2 ans, lié à mon métier, présenté à l'oral à la fin.", ok: true },
        { txt: "Un simple devoir sur table à rendre.", ok: false, retour: "Non, ce n'est pas un devoir. C'est un projet concret sur 2 ans !" },
        { txt: "Un stage en entreprise en CAP.", ok: false, retour: "Pas tout à fait. Ce n'est pas un stage, c'est une réalisation perso." },
      ] },
      { from: "pnj", txt: "Très bien 👍 Et tu peux me dire combien de temps ça dure ?" },
      { from: "choix", options: [
        { txt: "1 an seulement.", ok: false, retour: "Non, c'est plus long que ça." },
        { txt: "2 ans (toute la formation CAP).", ok: true },
        { txt: "Tout le lycée.", ok: false, retour: "Non, c'est uniquement pendant ton CAP." },
      ] },
      { from: "pnj", txt: "Parfait. Et l'oral final, c'est combien de temps ?" },
      { from: "choix", options: [
        { txt: "5 minutes.", ok: false, retour: "Plus que ça, c'est 10 minutes au total." },
        { txt: "10 minutes (5 de présentation + 5 de questions).", ok: true },
        { txt: "30 minutes.", ok: false, retour: "Non, c'est plus court : 10 min." },
      ] },
      { from: "pnj", txt: "Et combien de pages au max pour ton support oral ?" },
      { from: "choix", options: [
        { txt: "2 pages.", ok: false, retour: "C'est un peu plus, 5 pages max." },
        { txt: "5 pages maximum.", ok: true },
        { txt: "Pas de limite.", ok: false, retour: "Non, c'est limité à 5 pages." },
      ] },
      { from: "pnj", txt: "Excellent 🎯 Dernière question : si tu te trompes pendant le projet, qu'est-ce qu'il faut faire ?" },
      { from: "choix", options: [
        { txt: "Tout abandonner et changer de projet.", ok: false, retour: "Surtout pas ! L'erreur fait partie du chemin." },
        { txt: "Recommencer, corriger, améliorer. C'est normal.", ok: true },
        { txt: "Cacher l'erreur pour pas être noté dessus.", ok: false, retour: "Au contraire, on l'analyse pour progresser." },
      ] },
      { from: "pnj_final_ok", txt: "Bravo Yanis, tu maîtrises ton sujet ! Tu es prêt(e) pour la suite. À demain en cuisine 🔪✨" },
    ],
  },

  {
    id: "conv_j2",
    titre: "Question express de M. Bertrand",
    sous_titre: "L'assiette équilibrée — tu suis ?",
    jalon: "j2_repas_equilibre",
    contact: { nom: "M. Bertrand", role: "Prof de cuisine", avatar: "👨‍🏫" },
    intro: "M. Bertrand te teste sur la composition d'une assiette équilibrée. Il t'envoie un message juste avant le cours…",
    echanges: [
      { from: "pnj", txt: "Salut ! Petit test rapide avant le cours 😉 Quelle est la règle de proportions de l'assiette équilibrée ?" },
      { from: "choix", options: [
        { txt: "⅓ légumes, ⅓ féculents, ⅓ protéines.", ok: false, retour: "Presque ! Mais les légumes prennent plus de place." },
        { txt: "½ légumes, ¼ féculents, ¼ protéines.", ok: true },
        { txt: "¼ légumes, ½ féculents, ¼ protéines.", ok: false, retour: "Non, c'est l'inverse : la moitié de l'assiette = légumes." },
      ] },
      { from: "pnj", txt: "Top 👌 Et les protides, ils servent à quoi dans le corps ?" },
      { from: "choix", options: [
        { txt: "À donner de l'énergie rapide.", ok: false, retour: "Ça c'est plutôt les glucides." },
        { txt: "À construire les muscles, les os, les cheveux. Ce sont les bâtisseurs.", ok: true },
        { txt: "À hydrater le corps.", ok: false, retour: "Ça c'est l'eau." },
      ] },
      { from: "pnj", txt: "Et où on trouve principalement le calcium ?" },
      { from: "choix", options: [
        { txt: "Dans les pâtes et le pain.", ok: false, retour: "Non, ça c'est des féculents." },
        { txt: "Dans les produits laitiers (lait, yaourt, fromage).", ok: true },
        { txt: "Dans les huiles.", ok: false, retour: "Non, ça c'est les lipides." },
      ] },
      { from: "pnj", txt: "Dernière : tu composes un menu, il y a poulet + carottes + yaourt. Qu'est-ce qui manque ?" },
      { from: "choix", options: [
        { txt: "Des protéines.", ok: false, retour: "Non, le poulet en apporte déjà." },
        { txt: "Des féculents (riz, pâtes, pommes de terre…).", ok: true },
        { txt: "Du sucre.", ok: false, retour: "Le sucre n'est pas indispensable au repas." },
      ] },
      { from: "pnj_final_ok", txt: "Bravo, tu maîtrises ! Tu es prêt(e) pour passer l'épreuve d'attestation 💪" },
    ],
  },

  {
    id: "conv_j3",
    titre: "Lucas te chambre 😏",
    sous_titre: "Argumenter le bio et les circuits courts",
    jalon: "j3_eco_responsable",
    contact: { nom: "Lucas", role: "Camarade de classe", avatar: "🧑" },
    intro: "Lucas, ton copain de classe, n'est pas convaincu par ton projet éco-responsable. À toi de lui répondre…",
    echanges: [
      { from: "pnj", txt: "Eh, pourquoi tu mets que des trucs bio dans ton menu ? Le bio c'est juste un truc qui coûte cher pour rien 🤷" },
      { from: "choix", options: [
        { txt: "Le bio garantit qu'il n'y a pas de pesticides chimiques ni d'OGM. C'est un vrai label.", ok: true },
        { txt: "Tu as raison, c'est juste pour faire bien.", ok: false, retour: "Le bio garantit pourtant l'absence de pesticides chimiques." },
        { txt: "Aucune idée, je fais comme on m'a dit.", ok: false, retour: "Tu sais pourquoi en fait : c'est cultivé sans pesticides chimiques." },
      ] },
      { from: "pnj", txt: "Mouais. Mais pourquoi tu vas au marché alors qu'au supermarché c'est moins cher ?" },
      { from: "choix", options: [
        { txt: "C'est moins polluant : moins de transport et de CO₂. C'est ça un circuit court.", ok: true },
        { txt: "Pour faire genre, c'est plus stylé.", ok: false, retour: "C'est plus que stylé : moins de CO₂ et soutien aux producteurs locaux." },
        { txt: "Aucune raison particulière.", ok: false, retour: "Si : moins de transport, donc moins de pollution." },
      ] },
      { from: "pnj", txt: "OK… et les emballages plastiques alors ? Tout le monde en utilise non ?" },
      { from: "choix", options: [
        { txt: "Justement la loi AGEC (2020) interdit certains plastiques jetables. Je préfère du carton recyclable.", ok: true },
        { txt: "Je m'en fiche, je prends ce qu'il y a.", ok: false, retour: "Non, il y a une loi (AGEC) qui en interdit beaucoup." },
        { txt: "Le plastique c'est pareil que le carton.", ok: false, retour: "Pas vraiment : le carton est recyclable, le plastique pollue beaucoup plus." },
      ] },
      { from: "pnj", txt: "Et c'est quoi en vrai un produit de saison ?" },
      { from: "choix", options: [
        { txt: "Un produit qui pousse naturellement à un moment précis de l'année dans notre région.", ok: true },
        { txt: "Un produit en promo cette semaine.", ok: false, retour: "Non, ça c'est juste du marketing." },
        { txt: "Un produit qu'on trouve toute l'année.", ok: false, retour: "Au contraire, c'est limité à une période précise." },
      ] },
      { from: "pnj_final_ok", txt: "OK respect 🙏 J'avoue je vais regarder ce que tu fais. Tu m'apprends un truc !" },
    ],
  },

  {
    id: "conv_j4",
    titre: "Mme Dupont te questionne",
    sous_titre: "Étiquetage et allergies",
    jalon: "j4_etiquetage",
    contact: { nom: "Mme Dupont", role: "Cliente", avatar: "👩" },
    intro: "Mme Dupont, une cliente du restaurant scolaire, t'envoie un message au sujet de ton menu à emporter. Elle a peur pour sa fille allergique…",
    echanges: [
      { from: "pnj", txt: "Bonjour, ma fille est allergique aux œufs et au gluten. Votre menu en contient-il ?" },
      { from: "choix", options: [
        { txt: "Bonjour, je vérifie sur l'étiquette du produit, les allergènes sont mis en évidence en gras.", ok: true },
        { txt: "Aucune idée Madame.", ok: false, retour: "Tu DOIS savoir : la loi exige les allergènes en évidence sur l'étiquette." },
        { txt: "Donnez-lui sans regarder, ça va aller.", ok: false, retour: "Surtout pas ! L'allergie peut être très grave." },
      ] },
      { from: "pnj", txt: "Merci. Et c'est quoi exactement la différence entre DLC et DDM ?" },
      { from: "choix", options: [
        { txt: "DLC = à ne pas dépasser (produits frais). DDM = perd du goût mais reste sain.", ok: true },
        { txt: "C'est pareil.", ok: false, retour: "Non, c'est très différent et important." },
        { txt: "DLC = bio, DDM = pas bio.", ok: false, retour: "Non, ces sigles concernent les dates, pas la nature du produit." },
      ] },
      { from: "pnj", txt: "Et combien d'allergènes faut-il déclarer obligatoirement sur une étiquette ?" },
      { from: "choix", options: [
        { txt: "5.", ok: false, retour: "Il y en a plus que ça." },
        { txt: "14 (selon le règlement européen INCO).", ok: true },
        { txt: "Aucun, c'est pas obligatoire.", ok: false, retour: "Si, c'est obligatoire. Il y a 14 allergènes majeurs." },
      ] },
      { from: "pnj", txt: "Sur l'étiquette, comment je dois reconnaître les allergènes ?" },
      { from: "choix", options: [
        { txt: "Mis en évidence : en gras, soulignés ou en MAJUSCULES.", ok: true },
        { txt: "Cachés à la fin de la liste.", ok: false, retour: "Au contraire, ils doivent être bien visibles." },
        { txt: "Sur une étiquette à part.", ok: false, retour: "Non, ils sont dans la liste des ingrédients mais en évidence." },
      ] },
      { from: "pnj_final_ok", txt: "Merci beaucoup ! Vous me rassurez. Je vais commander votre menu pour ma fille en toute confiance 😊" },
    ],
  },

  {
    id: "conv_j5",
    titre: "Chef Marc te briefe",
    sous_titre: "Présenter ton menu à l'oral",
    jalon: "j5_menu_final",
    contact: { nom: "Chef Marc", role: "Chef en stage", avatar: "👨‍🍳" },
    intro: "Tu es en stage. Le Chef Marc veut que tu présentes ton menu de chef-d'œuvre comme si c'était à l'oral. Prêt(e) ?",
    echanges: [
      { from: "pnj", txt: "Yo ! Allez, présente-moi ton menu. Pour défendre qu'il est ÉQUILIBRÉ, tu mobilises quoi ?" },
      { from: "choix", options: [
        { txt: "La règle ½ légumes / ¼ féculents / ¼ protéines + les groupes alimentaires.", ok: true },
        { txt: "Le prix bas du menu.", ok: false, retour: "Le prix ne prouve pas l'équilibre nutritionnel." },
        { txt: "Le fait que c'est joli.", ok: false, retour: "L'esthétique n'est pas un argument nutritionnel." },
      ] },
      { from: "pnj", txt: "Bien 👍 Et pour défendre qu'il est ÉCO-RESPONSABLE ?" },
      { from: "choix", options: [
        { txt: "Saison + circuit court + label + emballage adapté + anti-gaspi.", ok: true },
        { txt: "Le nom de la marque.", ok: false, retour: "Une marque ne garantit pas l'éco-responsabilité." },
        { txt: "Le goût du plat.", ok: false, retour: "Le goût ne suffit pas à prouver l'éco-démarche." },
      ] },
      { from: "pnj", txt: "Bien vu. Sur ton étiquette, qu'est-ce qui est OBLIGATOIRE en priorité ?" },
      { from: "choix", options: [
        { txt: "Photo et slogan.", ok: false, retour: "C'est utile mais pas obligatoire. Pense aux infos légales." },
        { txt: "Les 7 mentions INCO + les 14 allergènes en évidence.", ok: true },
        { txt: "Juste le nom du produit.", ok: false, retour: "Beaucoup plus que ça : 7 mentions obligatoires." },
      ] },
      { from: "pnj", txt: "Imagine un client te dit : « Ton menu est trop cher pour moi. » Tu réponds quoi ?" },
      { from: "choix", options: [
        { txt: "Je lui explique que c'est de la qualité, local, sans pesticides, et que ça soutient les producteurs.", ok: true },
        { txt: "Je baisse le prix tout de suite.", ok: false, retour: "Pas la première chose à faire : argumente la valeur d'abord." },
        { txt: "Je lui dis « Tant pis, va voir ailleurs ».", ok: false, retour: "Surtout pas ! Tu perds le client. Argumente la qualité." },
      ] },
      { from: "pnj", txt: "Dernière : pendant l'oral, tu as combien de temps de présentation ?" },
      { from: "choix", options: [
        { txt: "5 minutes (puis 5 min de questions du jury).", ok: true },
        { txt: "30 minutes.", ok: false, retour: "Trop long ! C'est 5 min pour la présentation." },
        { txt: "1 minute.", ok: false, retour: "Trop court. C'est 5 min." },
      ] },
      { from: "pnj_final_ok", txt: "Excellent travail ! Tu es prêt(e) pour ton oral 🎤 N'oublie pas : confiance, vocabulaire technique, et tu argumentes chaque choix !" },
    ],
  },
  // V4.54 — Marche en avant
  {
    id: "conv_j6",
    titre: "Discussion avec Chef Marc — la marche en avant",
    sous_titre: "Tu es prêt·e à cuisiner en sécurité ?",
    jalon: "j6_marche_en_avant",
    contact: { nom: "Chef Marc", role: "Chef formateur", avatar: "👨‍🍳" },
    intro: "Chef Marc te contacte avant ton TP de cuisine. Il veut vérifier que tu connais bien la marche en avant et les règles d'hygiène avant de te laisser entrer en cuisine.",
    echanges: [
      { from: "pnj", txt: "Salut ! Demain on a TP cuisine. Avant de te laisser cuisiner, j'ai 5 questions pour vérifier que tu maîtrises la marche en avant 😊" },
      { from: "pnj", txt: "Question 1 : C'est quoi la règle d'or de la marche en avant ?" },
      { from: "choix", options: [
        { txt: "On avance du sale vers le propre, sans jamais revenir en arrière.", ok: true },
        { txt: "On va du propre au sale.", ok: false, retour: "Non, c'est l'inverse. Du sale vers le propre !" },
        { txt: "On peut revenir en arrière si on lave bien.", ok: false, retour: "Non, JAMAIS de retour en arrière. Même si on lave." },
      ] },
      { from: "pnj", txt: "Bien ! Question 2 : combien d'étapes y a-t-il dans la marche en avant ?" },
      { from: "choix", options: [
        { txt: "5 étapes.", ok: false, retour: "Plus que ça !" },
        { txt: "9 étapes : de la réception à la distribution.", ok: true },
        { txt: "12 étapes.", ok: false, retour: "Un peu trop. C'est 9." },
      ] },
      { from: "pnj", txt: "Parfait. Question 3 : la PLONGE (où on lave la vaisselle sale), c'est une zone…" },
      { from: "choix", options: [
        { txt: "Propre.", ok: false, retour: "Attention ! La vaisselle SALE rend la zone SALE." },
        { txt: "Sale.", ok: true },
        { txt: "Mixte.", ok: false, retour: "Non, c'est clairement une zone SALE." },
      ] },
      { from: "pnj", txt: "Bien joué 👏 Question 4 : tu prépares de la viande crue puis tu veux préparer une salade. Que fais-tu d'abord ?" },
      { from: "choix", options: [
        { txt: "Je prends le même couteau, je gagne du temps.", ok: false, retour: "NON ! Risque de contamination croisée." },
        { txt: "Je nettoie le plan, je désinfecte, je me lave les mains, je change de couteau.", ok: true },
        { txt: "Je continue avec le même équipement, c'est pas grave.", ok: false, retour: "Très grave au contraire ! On peut rendre les clients malades." },
      ] },
      { from: "pnj", txt: "Excellent ! Dernière question : à quelle température faut-il garder un yaourt frais ?" },
      { from: "choix", options: [
        { txt: "20 °C, c'est OK.", ok: false, retour: "Trop chaud ! Les bactéries se multiplient." },
        { txt: "Entre 0 et 4 °C (chaîne du froid).", ok: true },
        { txt: "Plus de 14 °C, ça va.", ok: false, retour: "DANGER ! Au-dessus de 4 °C, les bactéries explosent." },
      ] },
      { from: "pnj_final_ok", txt: "🎉 Bravo ! Tu maîtrises la marche en avant. Tu peux cuisiner en toute sécurité demain. N'oublie pas : du SALE vers le PROPRE, et lave-toi les mains régulièrement !" },
    ],
  },
];

let currentConvId = null;
let currentConvIdx = 0;
let currentConvScore = 0;
let currentConvTotal = 0;

function openConversations() {
  let panel = document.getElementById("conv-panel");
  if (panel) panel.remove();
  panel = document.createElement("div");
  panel.id = "conv-panel"; panel.className = "modal";
  panel.innerHTML = `<div class="modal-content phone-modal" id="conv-modal-content"></div>`;
  document.body.appendChild(panel);
  panel.addEventListener("click", e => { if (e.target.id === "conv-panel") panel.remove(); });
  renderConvList();
}

function renderConvList() {
  const c = document.getElementById("conv-modal-content");
  if (!c) return;
  c.classList.remove("phone-active");
  c.innerHTML = `
    <button class="modal-close" id="conv-close">×</button>
    <h2 style="color:var(--c-primary-dark); margin-top:0;">📱 Conversations d'entraînement</h2>
    <p class="hint">Choisis un échange. Comme un vrai SMS : tu réponds, et la personne te répond. Idéal pour réviser sans pression.</p>
    <div class="conv-list">
      ${CONVERSATIONS.map(cv => {
        const st = (state.conversations_state || {})[cv.id];
        const done = st && st.terminee;
        return `
          <button type="button" class="conv-card ${done ? "conv-done" : ""}" data-conv="${cv.id}">
            <div class="conv-avatar">${cv.contact.avatar}</div>
            <div class="conv-info">
              <div class="conv-titre">${escapeHtml(cv.titre)}</div>
              <div class="conv-sub">${escapeHtml(cv.sous_titre)}</div>
              <div class="conv-pill">${escapeHtml(cv.contact.nom)} · ${escapeHtml(cv.contact.role)}</div>
            </div>
            <div class="conv-arrow">${done ? "✓" : "→"}</div>
          </button>`;
      }).join("")}
    </div>
  `;
  c.querySelector("#conv-close").addEventListener("click", () => document.getElementById("conv-panel").remove());
  c.querySelectorAll("[data-conv]").forEach(b => {
    b.addEventListener("click", () => startConversation(b.dataset.conv));
  });
}

function startConversation(id) {
  const cv = CONVERSATIONS.find(x => x.id === id);
  if (!cv) return;
  currentConvId = id; currentConvIdx = 0;
  currentConvScore = 0;
  currentConvTotal = cv.echanges.filter(e => e.from === "choix").length;

  const c = document.getElementById("conv-modal-content");
  c.classList.add("phone-active");
  c.innerHTML = `
    <div class="phone-frame">
      <div class="phone-header">
        <button class="phone-back" id="phone-back">←</button>
        <div class="phone-avatar">${cv.contact.avatar}</div>
        <div class="phone-contact">
          <div class="phone-name">${escapeHtml(cv.contact.nom)}</div>
          <div class="phone-status">en ligne</div>
        </div>
        <button class="phone-close" id="phone-close">×</button>
      </div>
      <div class="phone-intro">${escapeHtml(cv.intro)}</div>
      <div class="phone-conv" id="phone-conv"></div>
      <div class="phone-input" id="phone-input"></div>
    </div>
  `;
  c.querySelector("#phone-back").addEventListener("click", renderConvList);
  c.querySelector("#phone-close").addEventListener("click", () => document.getElementById("conv-panel").remove());

  setTimeout(playNextEchange, 600);
}

function playNextEchange() {
  const cv = CONVERSATIONS.find(x => x.id === currentConvId);
  if (!cv) return;
  const conv = document.getElementById("phone-conv");
  const inputArea = document.getElementById("phone-input");
  if (!conv || !inputArea) return;

  if (currentConvIdx >= cv.echanges.length) return;
  const e = cv.echanges[currentConvIdx];

  // Bulle PNJ avec animation "..."
  if (e.from === "pnj" || e.from === "pnj_final_ok") {
    inputArea.innerHTML = "";
    const typing = document.createElement("div");
    typing.className = "phone-bubble phone-bubble-pnj typing";
    typing.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    conv.appendChild(typing);
    conv.scrollTop = conv.scrollHeight;

    const delay = 800 + Math.min(60 * (e.txt.length || 30), 1500);
    setTimeout(() => {
      typing.remove();
      const bubble = document.createElement("div");
      bubble.className = "phone-bubble phone-bubble-pnj";
      if (e.from === "pnj_final_ok") bubble.classList.add("pnj-final");
      bubble.textContent = e.txt;
      conv.appendChild(bubble);
      conv.scrollTop = conv.scrollHeight;
      currentConvIdx++;
      if (e.from === "pnj_final_ok") {
        setTimeout(showConvScore, 800);
      } else {
        setTimeout(playNextEchange, 500);
      }
    }, delay);
  }
  // Choix de réponse — bulles cliquables
  else if (e.from === "choix") {
    inputArea.innerHTML = "";
    e.options.forEach((opt, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "phone-choice";
      b.textContent = opt.txt;
      b.addEventListener("click", () => answerChoice(opt, i, e));
      inputArea.appendChild(b);
    });
  }
}

// V4.23 : petites réactions positives variées du PNJ quand l'élève a juste
const REACTIONS_POSITIVES = [
  "👍 Exact !",
  "✅ Bien vu !",
  "🎯 T'as compris !",
  "💪 Bravo, continue.",
  "⭐ Parfait.",
  "🔥 Top.",
  "👌 Pile poil.",
  "Yes 💯",
  "Bingo 🎯",
  "👏 Bien joué.",
  "🙌 Excellent.",
  "📚 C'est ça !",
];
function pickReactionPositive() {
  return REACTIONS_POSITIVES[Math.floor(Math.random() * REACTIONS_POSITIVES.length)];
}

function answerChoice(opt, idx, echange) {
  const conv = document.getElementById("phone-conv");
  const inputArea = document.getElementById("phone-input");
  inputArea.innerHTML = "";

  // Bulle élève
  const me = document.createElement("div");
  me.className = "phone-bubble phone-bubble-me";
  me.textContent = opt.txt;
  conv.appendChild(me);
  conv.scrollTop = conv.scrollHeight;

  if (opt.ok) currentConvScore++;
  currentConvIdx++;

  if (opt.ok) {
    // V4.23 : petite réaction positive du PNJ avant d'enchaîner sur la question suivante
    const reaction = pickReactionPositive();
    setTimeout(() => {
      // Mini animation "..." rapide
      const typing = document.createElement("div");
      typing.className = "phone-bubble phone-bubble-pnj typing";
      typing.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
      conv.appendChild(typing);
      conv.scrollTop = conv.scrollHeight;
      setTimeout(() => {
        typing.remove();
        const bubble = document.createElement("div");
        bubble.className = "phone-bubble phone-bubble-pnj phone-reaction";
        bubble.textContent = reaction;
        conv.appendChild(bubble);
        conv.scrollTop = conv.scrollHeight;
        setTimeout(playNextEchange, 700);
      }, 500);
    }, 400);
  } else {
    // Petit retour rouge correctif puis on continue
    setTimeout(() => {
      const r = document.createElement("div");
      r.className = "phone-bubble phone-bubble-pnj phone-correction";
      r.textContent = opt.retour || "Pas tout à fait, on reprend.";
      conv.appendChild(r);
      conv.scrollTop = conv.scrollHeight;

      // Re-proposer le choix
      setTimeout(() => {
        const e2 = echange;
        e2.options.forEach(o2 => {
          if (o2 === opt) return;
          const b = document.createElement("button");
          b.type = "button";
          b.className = "phone-choice";
          b.textContent = o2.txt;
          b.addEventListener("click", () => {
            // Sur la 2e tentative : on accepte la suite mais pas de point
            const me2 = document.createElement("div");
            me2.className = "phone-bubble phone-bubble-me";
            me2.textContent = o2.txt;
            conv.appendChild(me2);
            inputArea.innerHTML = "";
            if (o2.ok) {
              setTimeout(playNextEchange, 600);
            } else {
              setTimeout(() => answerChoice(o2, 0, e2), 400);
            }
          });
          inputArea.appendChild(b);
        });
      }, 700);
    }, 800);
  }
}

function showConvScore() {
  const inputArea = document.getElementById("phone-input");
  if (!inputArea) return;
  // Sauvegarde
  if (!state.conversations_state) state.conversations_state = {};
  state.conversations_state[currentConvId] = {
    terminee: true,
    score: currentConvScore,
    total: currentConvTotal,
    date: new Date().toISOString(),
  };
  saveState();

  const pct = currentConvTotal ? Math.round((currentConvScore / currentConvTotal) * 100) : 0;
  // V4.23 : étoiles selon performance (1 à 3 étoiles)
  const etoiles = pct >= 80 ? "🌟🌟🌟" : pct >= 60 ? "🌟🌟" : pct >= 40 ? "🌟" : "";
  const emojiMsg = pct >= 80 ? "🎉" : pct >= 60 ? "👍" : pct >= 40 ? "💪" : "📚";
  inputArea.innerHTML = `
    <div class="phone-score">
      ${etoiles ? `<div class="ps-stars">${etoiles}</div>` : ""}
      <div class="ps-pct">${currentConvScore} / ${currentConvTotal}</div>
      <div class="ps-msg">${emojiMsg} ${
        pct >= 80 ? "Excellent, tu maîtrises ce thème !"
        : pct >= 60 ? "Bien joué, tu peux refaire pour consolider."
        : pct >= 40 ? "Pas mal, mais reprends quelques notions."
        : "Reprends le cours puis recommence : tu vas y arriver."
      }</div>
      <div class="ps-actions">
        <button type="button" class="btn" id="ps-restart">Recommencer</button>
        <button type="button" class="btn btn-primary" id="ps-back">Retour aux discussions</button>
      </div>
    </div>
  `;
  inputArea.querySelector("#ps-restart").addEventListener("click", () => startConversation(currentConvId));
  inputArea.querySelector("#ps-back").addEventListener("click", renderConvList);
}

/* =====================================================================
   V4.22 — Notes en post-it visibles dans chaque section
   ===================================================================== */
const POSTIT_COULEURS = ["jaune", "rose", "vert", "bleu", "orange"];
function postitColor(noteId) {
  // Choix stable : hash de l'id pour avoir toujours la même couleur sur un post-it
  let h = 0;
  for (let i = 0; i < noteId.length; i++) h = (h * 31 + noteId.charCodeAt(i)) & 0xfff;
  return POSTIT_COULEURS[h % POSTIT_COULEURS.length];
}
function postitRotate(noteId) {
  let h = 0;
  for (let i = 0; i < noteId.length; i++) h = (h * 17 + noteId.charCodeAt(i)) & 0xff;
  return ((h % 5) - 2) * 0.6; // -1.2 à +1.2 deg
}

function renderSectionNotes(sec) {
  const wrap = document.createElement("div");
  wrap.className = "section-notes-block";
  const sectionNotes = (state.notes || []).filter(n => n.section === sec.id);

  wrap.innerHTML = `
    <div class="snb-head">
      <h3>📝 Mes notes pour cette section</h3>
      <button type="button" class="btn btn-sm" id="snb-add-${sec.id}">+ Ajouter une note</button>
    </div>
    <div class="postit-board" id="snb-board-${sec.id}">
      ${sectionNotes.length === 0
        ? `<div class="snb-empty">Aucune note pour le moment. Clique sur « + Ajouter » pour écrire une idée, une question, ou un mot que tu veux retenir.</div>`
        : sectionNotes.map(n => {
            const couleur = postitColor(n.id);
            const rot = postitRotate(n.id);
            const dt = new Date(n.date).toLocaleDateString("fr-FR");
            return `
              <div class="postit postit-${couleur}" style="transform: rotate(${rot}deg);" data-id="${n.id}">
                <button type="button" class="postit-del" title="Supprimer">×</button>
                <div class="postit-texte">${escapeHtml(n.texte).replace(/\n/g, "<br>")}</div>
                <div class="postit-date">${escapeHtml(dt)}</div>
              </div>`;
          }).join("")
      }
    </div>
  `;
  setTimeout(() => bindSectionNotes(sec, wrap), 0);
  return wrap;
}

function bindSectionNotes(sec, wrap) {
  const addBtn = wrap.querySelector(`#snb-add-${sec.id}`);
  if (addBtn) addBtn.addEventListener("click", () => addInlineNote(sec));
  wrap.querySelectorAll(".postit-del").forEach(b => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const noteId = b.closest(".postit").dataset.id;
      if (!confirm("Supprimer cette note ?")) return;
      state.notes = (state.notes || []).filter(n => n.id !== noteId);
      saveState(); renderMain();
    });
  });
}

function addInlineNote(sec) {
  // Mini-formulaire inline pour ajouter une note dans la section
  const board = document.getElementById(`snb-board-${sec.id}`);
  if (!board) return;
  // Si un formulaire est déjà ouvert, focus dessus
  if (document.getElementById(`snb-form-${sec.id}`)) {
    document.getElementById(`snb-form-input-${sec.id}`).focus(); return;
  }
  const form = document.createElement("div");
  form.id = `snb-form-${sec.id}`;
  form.className = "postit-form";
  form.innerHTML = `
    <textarea id="snb-form-input-${sec.id}" rows="3" placeholder="Écris ta note ici…"></textarea>
    <div class="snb-form-actions">
      <button type="button" class="btn btn-sm" id="snb-cancel-${sec.id}">Annuler</button>
      <button type="button" class="btn btn-primary btn-sm" id="snb-save-${sec.id}">Coller le post-it</button>
    </div>
  `;
  // S'il n'y a pas encore de note (board vide), on remplace le message vide
  const empty = board.querySelector(".snb-empty");
  if (empty) board.innerHTML = "";
  board.prepend(form);
  document.getElementById(`snb-form-input-${sec.id}`).focus();

  document.getElementById(`snb-cancel-${sec.id}`).addEventListener("click", () => {
    form.remove();
    if (!board.children.length) renderMain();
  });
  document.getElementById(`snb-save-${sec.id}`).addEventListener("click", () => {
    const v = document.getElementById(`snb-form-input-${sec.id}`).value.trim();
    if (!v) return;
    if (!Array.isArray(state.notes)) state.notes = [];
    state.notes.push({
      id: "n" + Math.random().toString(36).slice(2, 9),
      texte: v,
      section: sec.id,
      date: new Date().toISOString(),
    });
    saveState(); renderMain();
  });
}

/* =====================================================================
   V4.58 — Mon référentiel PSR (Production Service Restauration)
   ---------------------------------------------------------------------
   Auto-évaluation des compétences du référentiel CAP PSR : 11 familles,
   ~165 compétences avec explications simples. Sauvegarde dans
   state.referentiel_psr[itemId] = "acquis" | "en_cours" | null.
   Vue compacte : 11 cartes famille → modale détaillée par famille.
   ===================================================================== */

const REFERENTIEL_PSR = [
  {
    id: "f1", titre: "Réception des marchandises", emoji: "🚚",
    couleur: "#4a90d9",
    description: "Accueillir et vérifier les livraisons.",
    items: [
      { txt: "Réception des marchandises",       expl: "vérifier la livraison à son arrivée" },
      { txt: "Contrôle quantitatif des livraisons", expl: "compter ce qui est livré" },
      { txt: "Contrôle qualitatif des livraisons",  expl: "vérifier l'état et la fraîcheur" },
      { txt: "DLC",                              expl: "Date Limite de Consommation, à respecter" },
      { txt: "DDM",                              expl: "Date de Durabilité Minimale, peut être dépassée" },
      { txt: "Conformité des emballages",        expl: "emballage non abîmé, non gonflé" },
      { txt: "Critères de fraîcheur",            expl: "couleur, odeur, texture du produit" },
      { txt: "Produits non conformes",           expl: "que faire d'un produit refusé" },
      { txt: "Bon de commande",                  expl: "le document qu'on a envoyé au fournisseur" },
      { txt: "Bon de livraison",                 expl: "le document qui accompagne la livraison" },
      { txt: "Fiche de stock",                   expl: "tableau qui suit les entrées/sorties" },
      { txt: "Facture",                          expl: "le document qu'on doit payer" },
      { txt: "Traçabilité",                      expl: "savoir d'où vient le produit" },
    ],
  },
  {
    id: "f2", titre: "Stockage", emoji: "❄️",
    couleur: "#3a7ec0",
    description: "Bien ranger les produits selon les zones et températures.",
    items: [
      { txt: "Stockage des produits alimentaires" },
      { txt: "Stockage des produits non alimentaires" },
      { txt: "Réserve sèche",                    expl: "stockage à température ambiante (riz, pâtes, conserves)" },
      { txt: "Enceinte froide positive",         expl: "frigo, 0 à 8 °C" },
      { txt: "Enceinte froide négative",         expl: "congélateur, -18 °C" },
      { txt: "Plan de rangement",                expl: "schéma qui dit où ranger quoi" },
      { txt: "Règles de rangement" },
      { txt: "Premier entré / premier sorti",    expl: "FIFO — sortir d'abord les produits arrivés en premier" },
      { txt: "Marche en avant",                  expl: "avancer du sale vers le propre" },
      { txt: "Température de stockage",          expl: "0 à 4 °C pour les frais" },
      { txt: "Lieu de stockage adapté",          expl: "le bon endroit pour le bon produit" },
    ],
  },
  {
    id: "f3", titre: "Préparation préliminaire", emoji: "🥬",
    couleur: "#4a9d5e",
    description: "Préparer les aliments avant de les cuisiner.",
    items: [
      { txt: "Déconditionnement",                expl: "enlever les emballages sales" },
      { txt: "Tri des emballages",               expl: "séparer carton, plastique, etc. pour le recyclage" },
      { txt: "Évacuation des déchets" },
      { txt: "Décongélation",                    expl: "passer du congelé au frais SANS rompre la chaîne du froid" },
      { txt: "Pesée des produits",               expl: "utiliser une balance" },
      { txt: "Comptage des produits" },
      { txt: "Mesures et quantités",             expl: "respecter les grammes et les ml" },
      { txt: "Lavage des fruits et légumes" },
      { txt: "Décontamination des fruits et légumes", expl: "tremper avec un produit pour tuer les microbes" },
      { txt: "Épluchage" },
      { txt: "Taillage",                         expl: "couper en formes précises (julienne, brunoise…)" },
      { txt: "Tranchage",                        expl: "couper en tranches" },
      { txt: "Mise en attente des produits",     expl: "stocker temporairement avant cuisson" },
      { txt: "Conditionnement des produits en attente" },
      { txt: "Étiquetage des produits en attente" },
    ],
  },
  {
    id: "f4", titre: "Hygiène & sécurité alimentaire", emoji: "🧼",
    couleur: "#2a8b3a",
    description: "Éviter les contaminations et travailler proprement.",
    items: [
      { txt: "Contamination alimentaire",        expl: "présence de microbes ou produits chimiques dans l'aliment" },
      { txt: "Contamination croisée",            expl: "transfert de microbes entre 2 aliments ou surfaces" },
      { txt: "Prévention des contaminations" },
      { txt: "Hygiène des mains",                expl: "se laver souvent et correctement les mains" },
      { txt: "Tenue professionnelle",            expl: "blouse propre, charlotte, chaussures de sécurité" },
      { txt: "EPI",                              expl: "Équipements de Protection Individuelle (gants, masque…)" },
      { txt: "Nettoyage",                        expl: "enlever les saletés visibles" },
      { txt: "Désinfection",                     expl: "tuer les microbes (avec javel diluée par exemple)" },
      { txt: "Plan de nettoyage",                expl: "tableau qui dit quoi nettoyer, quand, comment" },
      { txt: "Dosage des produits d'entretien",  expl: "respecter les quantités sur l'étiquette" },
      { txt: "Pictogrammes de danger",           expl: "les symboles oranges/rouges sur les produits" },
      { txt: "Stockage des produits d'entretien", expl: "à part des aliments, fermé à clé si possible" },
      { txt: "Matériel de nettoyage" },
      { txt: "Entretien du matériel" },
      { txt: "Lavage manuel de la vaisselle" },
      { txt: "Lavage mécanisé de la vaisselle",  expl: "lave-vaisselle pro" },
      { txt: "Tri des déchets" },
      { txt: "Entreposage des déchets" },
    ],
  },
  {
    id: "f5", titre: "Cuisson & maintien", emoji: "🔥",
    couleur: "#c97a3a",
    description: "Cuire à la bonne température et maintenir au bon degré.",
    items: [
      { txt: "Cuisson à l'eau",                  expl: "bouilli, pochage" },
      { txt: "Cuisson à la vapeur" },
      { txt: "Cuisson au four" },
      { txt: "Cuisson saisie",                   expl: "départ à feu vif (steak, légumes wok)" },
      { txt: "Cuisson grillée",                  expl: "sur grill ou plancha" },
      { txt: "Cuisson toastée",                  expl: "comme un pain grillé" },
      { txt: "Cuisson gratinée",                 expl: "finition au four pour la croûte dorée" },
      { txt: "Friture",                          expl: "cuisson dans un bain d'huile chaude" },
      { txt: "Contrôle de cuisson",              expl: "vérifier qu'un plat est bien cuit (≥ 63 °C à cœur)" },
      { txt: "Bain de friture",                  expl: "huile à bonne température (180 °C max)" },
      { txt: "Préparation chaude" },
      { txt: "Préparation froide" },
      { txt: "Produits semi-élaborés",           expl: "produits déjà préparés à terminer (ex: pâte à tarte)" },
      { txt: "Produits élaborés",                expl: "produits prêts à servir" },
      { txt: "Fiche technique",                  expl: "recette pro avec quantités, étapes, photos" },
      { txt: "Respect des pesées" },
      { txt: "Respect des mesures" },
      { txt: "Maintien en température",          expl: "garder un plat chaud (≥ 63 °C) ou froid (≤ 4 °C)" },
      { txt: "Remise en température",            expl: "réchauffer un plat préparé en sécurité" },
      { txt: "Couple temps-température",         expl: "le BON temps × la BONNE température pour tuer les bactéries" },
      { txt: "Maintien au chaud" },
      { txt: "Maintien au froid" },
      { txt: "Refroidissement rapide",           expl: "passer de 63 °C à 10 °C en moins de 2h" },
      { txt: "Contrôle des températures",        expl: "avec un thermomètre sonde" },
      { txt: "Qualités organoleptiques",         expl: "ce qui plaît aux 5 sens : goût, odeur, vue, toucher, ouïe" },
    ],
  },
  {
    id: "f6", titre: "Assemblage & dressage", emoji: "🍽️",
    couleur: "#d4a350",
    description: "Composer et présenter un plat appétissant.",
    items: [
      { txt: "Assemblage",                       expl: "monter les ingrédients d'un plat" },
      { txt: "Portionnement",                    expl: "diviser en parts individuelles" },
      { txt: "Dressage",                         expl: "disposer joliment dans l'assiette" },
      { txt: "Mise en valeur des préparations",  expl: "rendre le plat appétissant (couleurs, formes)" },
    ],
  },
  {
    id: "f7", titre: "Conditionnement", emoji: "📦",
    couleur: "#8a6a3a",
    description: "Mettre en barquette, sachet, carton pour la vente à emporter.",
    items: [
      { txt: "Conditionnement individuel",       expl: "1 portion = 1 contenant" },
      { txt: "Conditionnement multiportions",    expl: "plusieurs portions dans 1 contenant" },
      { txt: "Vente à emporter" },
      { txt: "Mise en sachet" },
      { txt: "Mise en carton" },
      { txt: "Mise en barquette" },
      { txt: "Choix du conditionnement",         expl: "carton, plastique réutilisable, bagasse, verre…" },
      { txt: "Grammage",                         expl: "le poids exact de chaque portion" },
      { txt: "Portion",                          expl: "ce qu'une personne mange en 1 fois" },
    ],
  },
  {
    id: "f8", titre: "Distribution & vente", emoji: "🛒",
    couleur: "#8a5cb5",
    description: "Mettre en place l'espace de vente et accueillir le client.",
    items: [
      { txt: "Entreposage avant distribution" },
      { txt: "Réapprovisionnement",              expl: "remplir l'étal au fur et à mesure" },
      { txt: "Mise en place de l'espace de distribution" },
      { txt: "Mise en valeur de l'espace de vente" },
      { txt: "Affichage des informations produits", expl: "prix, allergènes, origine" },
      { txt: "Composition des produits" },
      { txt: "Provenance des produits" },
      { txt: "Qualité des produits" },
      { txt: "Prix" },
      { txt: "Promotion",                        expl: "réduction temporaire pour vendre plus" },
      { txt: "Flux clients",                     expl: "comment les clients circulent" },
      { txt: "Gestion des stocks",               expl: "savoir ce qui reste, ce qui manque" },
      { txt: "Produits non servis" },
      { txt: "Invendus",                         expl: "ce qui n'est pas vendu en fin de journée" },
      { txt: "Anti-gaspillage",                  expl: "éviter de jeter (loi AGEC 2020)" },
      { txt: "Accueil client",                   expl: "sourire, bonjour, contact visuel" },
      { txt: "Besoin du client" },
      { txt: "Attente du client",                expl: "temps maximum pour servir" },
      { txt: "Conseil client",                   expl: "guider son choix" },
      { txt: "Vente additionnelle",              expl: "proposer un dessert ou une boisson en plus" },
      { txt: "Prise de commande" },
      { txt: "Préparation de commande" },
      { txt: "Service des repas" },
      { txt: "Anomalie en zone de distribution", expl: "ex : un plat qui manque, un emballage abîmé" },
      { txt: "Réclamation client",               expl: "le client n'est pas content : que faire ?" },
      { txt: "Objection client",                 expl: "le client hésite : que dire ?" },
      { txt: "Prise de congé",                   expl: "dire au revoir poliment" },
      { txt: "Transmission d'information à l'équipe" },
    ],
  },
  {
    id: "f9", titre: "Encaissement", emoji: "💶",
    couleur: "#2a8b8a",
    description: "Gérer la caisse et les paiements.",
    items: [
      { txt: "Encaissement" },
      { txt: "Ouverture de caisse",              expl: "vérifier le fond de caisse en début de journée" },
      { txt: "Clôture de caisse",                expl: "compter et vérifier en fin de journée" },
      { txt: "Saisie des prestations",           expl: "entrer les produits vendus" },
      { txt: "Prix" },
      { txt: "Codes produits",                   expl: "le numéro qui identifie chaque produit" },
      { txt: "Modes de paiement",                expl: "espèces, CB, sans contact, ticket-restau…" },
      { txt: "Rendu de monnaie",                 expl: "calcul mental du change" },
      { txt: "Erreur d'encaissement",            expl: "que faire en cas d'erreur ?" },
      { txt: "Sécurité des fonds",               expl: "protéger l'argent (coffre, dépôts banque)" },
    ],
  },
  {
    id: "f10", titre: "Risques professionnels", emoji: "🛡️",
    couleur: "#c25a5a",
    description: "Connaître et prévenir les risques au travail.",
    items: [
      { txt: "Risques professionnels" },
      { txt: "Risque de chute",                  expl: "sol glissant, mauvais équilibre" },
      { txt: "Risque de coupure",                expl: "couteaux, trancheuses, mandolines" },
      { txt: "Risque de brûlure",                expl: "fours, plaques, fritures, vapeur" },
      { txt: "Risque mécanique",                 expl: "machines (mixeur, robot…)" },
      { txt: "Risque électrique" },
      { txt: "Risque biologique",                expl: "microbes, virus, contamination" },
      { txt: "Risque chimique",                  expl: "produits ménagers, vapeurs" },
      { txt: "Gestes et postures",               expl: "porter sans se blesser le dos" },
      { txt: "Manutention",                      expl: "déplacer des charges lourdes correctement" },
      { txt: "Prévention des TMS",               expl: "Troubles Musculo-Squelettiques (mal de dos, tendinite…)" },
    ],
  },
  {
    id: "f11", titre: "Éco-responsabilité & alimentation", emoji: "🌱",
    couleur: "#4a9d5e",
    description: "Cuisiner durable et équilibré (lien direct avec ton chef-d'œuvre).",
    items: [
      { txt: "Écogestes",                        expl: "petits gestes au quotidien pour la planète" },
      { txt: "Économie d'eau" },
      { txt: "Économie d'énergie" },
      { txt: "Utilisation raisonnée des produits", expl: "pas trop, juste ce qu'il faut" },
      { txt: "Développement durable",            expl: "préserver pour les générations futures" },
      { txt: "Alimentation équilibrée",          expl: "règle ½ légumes ¼ féculents ¼ protéines" },
      { txt: "Familles d'aliments",              expl: "les 7 groupes : F&L, féculents, VPO, laitiers, gras, sucrés, boissons" },
      { txt: "Constituants alimentaires",        expl: "protides, glucides, lipides, vitamines, minéraux, fibres, eau" },
      { txt: "Allergènes",                       expl: "14 substances officielles (gluten, lait, œuf, fruits à coque…)" },
      { txt: "Étiquetage alimentaire",           expl: "ce qui doit être écrit sur l'emballage (INCO)" },
      { txt: "Mentions obligatoires",            expl: "nom, ingrédients, DLC/DDM, allergènes, poids, traçabilité" },
      { txt: "Consignes de conservation",        expl: "à conserver entre… après ouverture…" },
      { txt: "Consignes de réchauffage",         expl: "à réchauffer X min à Y°C" },
      { txt: "Consignes de tri",                 expl: "info sur le tri de l'emballage" },
      { txt: "Labels alimentaires",              expl: "AB, AOP, IGP, Label Rouge, HVE…" },
      { txt: "Produits de saison",               expl: "fruits/légumes du moment dans la région" },
      { txt: "Produits locaux" },
      { txt: "Circuits courts",                  expl: "max 1 intermédiaire entre producteur et consommateur" },
    ],
  },
];

// Génère un ID stable par item
REFERENTIEL_PSR.forEach(fam => {
  fam.items.forEach((it, i) => { it.id = `${fam.id}_${i + 1}`; });
});

function getRefStat(itemId) {
  return (state.referentiel_psr && state.referentiel_psr[itemId]) || null;
}
function setRefStat(itemId, val) {
  if (!state.referentiel_psr) state.referentiel_psr = {};
  if (val) state.referentiel_psr[itemId] = val;
  else delete state.referentiel_psr[itemId];
  scheduleAutoSave();
}

function openReferentielPsr() {
  const old = document.getElementById("ref-psr-back");
  if (old) old.remove();

  const back = document.createElement("div");
  back.id = "ref-psr-back";
  back.className = "img-info-backdrop";
  back.addEventListener("click", e => { if (e.target === back) close(); });

  const card = document.createElement("div");
  card.className = "ref-psr-card";
  back.appendChild(card);
  document.body.appendChild(back);

  function close() { back.remove(); document.removeEventListener("keydown", escH); }
  const escH = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", escH);

  function statsByFamily(fam) {
    const total = fam.items.length;
    let acquis = 0, encours = 0;
    fam.items.forEach(it => {
      const s = getRefStat(it.id);
      if (s === "acquis") acquis++;
      else if (s === "en_cours") encours++;
    });
    return { total, acquis, encours, pct: Math.round(acquis / total * 100) };
  }

  function renderHome() {
    const totalItems = REFERENTIEL_PSR.reduce((s, f) => s + f.items.length, 0);
    let totalAcquis = 0;
    REFERENTIEL_PSR.forEach(f => f.items.forEach(it => { if (getRefStat(it.id) === "acquis") totalAcquis++; }));
    const pctTot = Math.round(totalAcquis / totalItems * 100);
    card.innerHTML = `
      <button type="button" class="img-info-close" title="Fermer">✕</button>
      <div class="rps-header">
        <h2>📋 Mon référentiel PSR</h2>
        <p class="rps-intro">Toutes les compétences de ton CAP Production Service Restauration.<br>Clique sur une famille pour voir ce que tu dois savoir et coche au fur et à mesure.</p>
        <div class="rps-progress-tot">
          <span><b>${totalAcquis}</b> / ${totalItems} compétences acquises</span>
          <div class="rps-bar"><div class="rps-bar-fill" style="width:${pctTot}%"></div></div>
          <span><b>${pctTot}%</b></span>
        </div>
      </div>
      <div class="rps-grid"></div>
    `;
    const grid = card.querySelector(".rps-grid");
    REFERENTIEL_PSR.forEach(fam => {
      const st = statsByFamily(fam);
      const cardF = document.createElement("button");
      cardF.type = "button";
      cardF.className = "rps-fam-card";
      cardF.style.setProperty("--c", fam.couleur);
      cardF.innerHTML = `
        <div class="rps-fam-icon">${fam.emoji}</div>
        <div class="rps-fam-titre">${escapeHtml(fam.titre)}</div>
        <div class="rps-fam-desc">${escapeHtml(fam.description)}</div>
        <div class="rps-fam-bar"><div class="rps-fam-bar-fill" style="width:${st.pct}%"></div></div>
        <div class="rps-fam-stats">${st.acquis} / ${st.total} ${st.encours > 0 ? `· 🟡 ${st.encours} en cours` : ""}</div>
      `;
      cardF.addEventListener("click", () => renderFamily(fam));
      grid.appendChild(cardF);
    });
    card.querySelector(".img-info-close").addEventListener("click", close);
  }

  function renderFamily(fam) {
    card.innerHTML = `
      <button type="button" class="img-info-close" title="Fermer">✕</button>
      <div class="rps-fam-header" style="--c:${fam.couleur}">
        <button type="button" class="rps-back" title="Retour à la liste des familles">← Retour</button>
        <div class="rps-fam-h-content">
          <span class="rps-fam-h-emoji">${fam.emoji}</span>
          <h2>${escapeHtml(fam.titre)}</h2>
        </div>
        <p class="rps-fam-h-desc">${escapeHtml(fam.description)}</p>
      </div>
      <div class="rps-items"></div>
      <div class="rps-fam-footer">
        Clique sur ⬜ pour passer à 🟡 (en cours), puis à ✅ (acquis), puis à ⬜ (recommencer).
      </div>
    `;
    const itemsZone = card.querySelector(".rps-items");
    fam.items.forEach(it => {
      const row = document.createElement("div");
      row.className = "rps-item-row";
      const refresh = () => {
        const s = getRefStat(it.id);
        row.classList.remove("acquis", "en_cours");
        if (s === "acquis")  row.classList.add("acquis");
        if (s === "en_cours") row.classList.add("en_cours");
        row.querySelector(".rps-status").textContent =
          s === "acquis" ? "✅" : s === "en_cours" ? "🟡" : "⬜";
      };
      row.innerHTML = `
        <button type="button" class="rps-status" title="Cliquer pour changer le statut">⬜</button>
        <div class="rps-item-content">
          <div class="rps-item-txt">${escapeHtml(it.txt)}</div>
          ${it.expl ? `<div class="rps-item-expl">(${escapeHtml(it.expl)})</div>` : ""}
        </div>
      `;
      row.querySelector(".rps-status").addEventListener("click", () => {
        const cur = getRefStat(it.id);
        const next = cur == null ? "en_cours" : cur === "en_cours" ? "acquis" : null;
        setRefStat(it.id, next);
        refresh();
      });
      itemsZone.appendChild(row);
      refresh();
    });
    card.querySelector(".rps-back").addEventListener("click", renderHome);
    card.querySelector(".img-info-close").addEventListener("click", close);
  }

  renderHome();
}

/* =====================================================================
   V4.57 — "Donner mon avis" — version banque de commentaires cliquables
   ---------------------------------------------------------------------
   3 banques de commentaires pré-rédigés (positifs / à améliorer / vie pro)
   + étoiles + champ libre. Design fun et coloré pour adolescents.
   Sauvegarde dans state.sondages[] (compatible avec l'existant).
   ===================================================================== */

const COMMENTAIRES_BANQUE = {
  positifs: [
    { txt: "J'adore la banque d'images",                emoji: "📷" },
    { txt: "Les flashcards m'aident vraiment",          emoji: "🃏" },
    { txt: "Les conversations sont marrantes",          emoji: "📱" },
    { txt: "Le composeur de menu est top",              emoji: "🍽️" },
    { txt: "Les exercices drag & drop sont sympa",      emoji: "🎮" },
    { txt: "Les couleurs sont jolies",                  emoji: "🌈" },
    { txt: "Le pendu c'est cool",                       emoji: "🎯" },
    { txt: "Le curseur chaîne du froid est génial",     emoji: "🌡️" },
    { txt: "J'apprends beaucoup avec ce site",          emoji: "📚" },
    { txt: "C'est mieux qu'un manuel papier",           emoji: "📕" },
    { txt: "L'avatar est rigolo",                       emoji: "👤" },
    { txt: "Les photos rendent les exercices clairs",   emoji: "🖼️" },
    { txt: "Le glossaire m'aide à comprendre",          emoji: "📖" },
    { txt: "Trouve le mot c'est sympa",                 emoji: "💡" },
    { txt: "Le récap auto de mon menu est utile",       emoji: "✅" },
    { txt: "C'est facile à utiliser",                   emoji: "👌" },
  ],
  ameliorer: [
    { txt: "Il y a trop de choses à lire",              emoji: "📖" },
    { txt: "Je voudrais plus de jeux",                  emoji: "🎮" },
    { txt: "Plus de vidéos serait bien",                emoji: "🎥" },
    { txt: "Un mode hors-ligne serait utile",           emoji: "📵" },
    { txt: "Trop compliqué de naviguer",                emoji: "🧭" },
    { txt: "J'aimerais une appli mobile",               emoji: "📱" },
    { txt: "Plus d'audio (lecture des cours)",          emoji: "🔊" },
    { txt: "Plus d'exemples concrets de menus",         emoji: "🍱" },
    { txt: "Plus simple à comprendre",                  emoji: "💭" },
    { txt: "Plus rapide à charger",                     emoji: "⚡" },
    { txt: "Trop de clics pour faire une action",       emoji: "🖱️" },
    { txt: "J'ai du mal à trouver mes informations",    emoji: "🔍" },
    { txt: "Plus de couleurs / décoration",             emoji: "🎨" },
    { txt: "Plus de récompenses / badges",              emoji: "🏆" },
    { txt: "Pouvoir partager avec mes camarades",       emoji: "👥" },
  ],
  metier: [
    { txt: "Ça m'aidera pour mes futurs clients",       emoji: "🤝" },
    { txt: "J'ai mieux compris l'hygiène",              emoji: "🧼" },
    { txt: "Je sais maintenant lire une étiquette",     emoji: "🏷️" },
    { txt: "Je vais utiliser ça en stage",              emoji: "🛍️" },
    { txt: "Ça me prépare bien au CAP",                 emoji: "🎓" },
    { txt: "Je sais composer un menu équilibré",        emoji: "🍽️" },
    { txt: "J'ai compris la marche en avant",           emoji: "🚦" },
    { txt: "Je connais les labels (AB, AOP…)",          emoji: "🏅" },
    { txt: "Je sais éviter le gaspillage",              emoji: "🌱" },
    { txt: "Je connais la chaîne du froid",             emoji: "❄️" },
    { txt: "Je peux conseiller un client allergique",   emoji: "⚠️" },
    { txt: "Je sais ce qu'est un circuit court",        emoji: "🚜" },
    { txt: "Je suis plus à l'aise avec le vocabulaire", emoji: "📖" },
    { txt: "Je sens que je vais réussir mon métier",    emoji: "💼" },
  ],
};

const SONDAGE_STARS = [
  { id: "global",   label: "Globalement, ce portfolio te plaît ?" },
  { id: "facilite", label: "Est-il facile à utiliser ?" },
  { id: "aide",     label: "T'aide-t-il à apprendre ?" },
];

function openMonAvis() {
  const old = document.getElementById("mon-avis-back");
  if (old) old.remove();

  const reponses = {
    stars: {},
    positifs: [],
    ameliorer: [],
    metier: [],
    libre: "",
    enseignant: "",
  };

  const back = document.createElement("div");
  back.id = "mon-avis-back";
  back.className = "img-info-backdrop";
  back.addEventListener("click", e => { if (e.target === back) close(); });

  const card = document.createElement("div");
  card.className = "mon-avis-card";
  back.appendChild(card);
  document.body.appendChild(back);

  function close() {
    back.remove();
    document.removeEventListener("keydown", escH);
  }
  const escH = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", escH);

  function renderChips(key, banque) {
    return banque.map(c => {
      const id = `${key}_${banque.indexOf(c)}`;
      return `<button type="button" class="ma-chip" data-key="${key}" data-txt="${escapeHtml(c.txt)}">
        <span class="ma-chip-emoji">${c.emoji}</span>
        <span class="ma-chip-txt">${escapeHtml(c.txt)}</span>
      </button>`;
    }).join("");
  }

  function renderStars(qid, label) {
    return `<div class="ma-star-row">
      <div class="ma-star-label">${escapeHtml(label)}</div>
      <div class="ma-stars" data-qid="${qid}">
        ${[1,2,3,4,5].map(n => `<button type="button" class="ma-star" data-q="${qid}" data-n="${n}">☆</button>`).join("")}
      </div>
    </div>`;
  }

  card.innerHTML = `
    <button type="button" class="img-info-close" title="Fermer">✕</button>
    <div class="ma-header">
      <h2>💬 Donne ton avis !</h2>
      <p class="ma-intro">Aide ton·ta enseignant·e à <b>améliorer le portfolio</b>. Clique sur les commentaires qui te ressemblent ✨ ou écris les tiens.</p>
    </div>

    <section class="ma-section ma-stars-section">
      <h3>⭐ Comment tu trouves le portfolio ?</h3>
      ${SONDAGE_STARS.map(s => renderStars(s.id, s.label)).join("")}
    </section>

    <section class="ma-section ma-section-pos">
      <h3>💚 Ce que j'ai aimé <span class="ma-chip-count" id="ma-cnt-pos">0</span></h3>
      <div class="ma-chips">${renderChips("positifs", COMMENTAIRES_BANQUE.positifs)}</div>
    </section>

    <section class="ma-section ma-section-amel">
      <h3>💡 Ce qu'on pourrait améliorer <span class="ma-chip-count" id="ma-cnt-amel">0</span></h3>
      <div class="ma-chips">${renderChips("ameliorer", COMMENTAIRES_BANQUE.ameliorer)}</div>
    </section>

    <section class="ma-section ma-section-pro">
      <h3>👨‍🍳 Pour mon métier (PSR / restauration) <span class="ma-chip-count" id="ma-cnt-pro">0</span></h3>
      <div class="ma-chips">${renderChips("metier", COMMENTAIRES_BANQUE.metier)}</div>
    </section>

    <section class="ma-section ma-section-libre">
      <h3>✍️ Mon mot perso (facultatif)</h3>
      <textarea id="ma-libre" rows="3" placeholder="Écris ce que tu veux dire à ton·ta enseignant·e ou ton idée d'amélioration…"></textarea>
    </section>

    <div class="ma-actions">
      <button type="button" class="btn" id="ma-cancel">Annuler</button>
      <button type="button" class="btn btn-primary" id="ma-submit">📨 Envoyer mon avis</button>
    </div>
  `;

  // Étoiles
  card.querySelectorAll(".ma-star").forEach(b => {
    b.addEventListener("click", () => {
      const q = b.dataset.q;
      reponses.stars[q] = parseInt(b.dataset.n, 10);
      card.querySelectorAll(`.ma-star[data-q="${q}"]`).forEach((s, i) => {
        s.textContent = i < reponses.stars[q] ? "★" : "☆";
        s.classList.toggle("active", i < reponses.stars[q]);
      });
    });
  });

  // Chips multi
  card.querySelectorAll(".ma-chip").forEach(b => {
    b.addEventListener("click", () => {
      const key = b.dataset.key;
      const txt = b.dataset.txt;
      const arr = reponses[key];
      const idx = arr.indexOf(txt);
      if (idx >= 0) {
        arr.splice(idx, 1);
        b.classList.remove("active");
      } else {
        arr.push(txt);
        b.classList.add("active");
      }
      // Mettre à jour le compteur
      const counterId = key === "positifs" ? "ma-cnt-pos" : key === "ameliorer" ? "ma-cnt-amel" : "ma-cnt-pro";
      const c = card.querySelector(`#${counterId}`);
      if (c) c.textContent = arr.length;
    });
  });

  // Boutons
  card.querySelector(".img-info-close").addEventListener("click", close);
  card.querySelector("#ma-cancel").addEventListener("click", close);
  card.querySelector("#ma-submit").addEventListener("click", () => {
    reponses.libre = (card.querySelector("#ma-libre").value || "").trim();
    if (!Array.isArray(state.sondages)) state.sondages = [];
    state.sondages.push({ date: new Date().toISOString(), reponses: reponses });
    scheduleAutoSave();
    // Confirmation festive
    card.innerHTML = `
      <button type="button" class="img-info-close" title="Fermer">✕</button>
      <div class="ma-merci">
        <div class="ma-merci-emoji">🎉</div>
        <h2>Merci !</h2>
        <p>Ton avis a été enregistré et sera transmis à ton·ta enseignant·e dans le prochain export JSON.</p>
        <p class="ma-merci-petit">Grâce à toi, le portfolio va s'améliorer 💪</p>
        <button type="button" class="btn btn-primary" id="ma-close-final">Fermer</button>
      </div>
    `;
    card.querySelector("#ma-close-final").addEventListener("click", close);
    card.querySelector(".img-info-close").addEventListener("click", close);
  });
}

/* Pour rétro-compatibilité : openSondage redirige vers openMonAvis */
function openSondage() { openMonAvis(); }

/* V4.55 — Jeu "Trouve le mot" : définitions liées aux modules à deviner. */
const TROUVE_LE_MOT_BANQUE = [
  // ===== Comprendre =====
  { module: "Comprendre", def: "Mot qui désigne le projet concret de 2 ans qu'on présente à l'oral final.", reponse: "chef-d'œuvre", aliases: ["chef d'oeuvre","chefdoeuvre","chefdoeufre"] },
  { module: "Comprendre", def: "Durée totale du chef-d'œuvre, en années.", reponse: "2", aliases: ["deux"] },
  { module: "Comprendre", def: "Type d'épreuve à la fin : présentation devant un jury (en un mot).", reponse: "oral", aliases: ["orale"] },
  // ===== Équilibre =====
  { module: "Équilibre", def: "Constituants bâtisseurs des muscles, peau, cheveux.", reponse: "protides", aliases: ["proteines","protéines","protides","protide"] },
  { module: "Équilibre", def: "Constituants qui donnent de l'énergie rapide (carburant).", reponse: "glucides", aliases: ["glucide","sucres"] },
  { module: "Équilibre", def: "Constituants qui sont l'énergie de réserve (graisses).", reponse: "lipides", aliases: ["lipide","graisses"] },
  { module: "Équilibre", def: "Le minéral indispensable aux os et aux dents.", reponse: "calcium" },
  { module: "Équilibre", def: "Groupe alimentaire à mettre dans la moitié de l'assiette.", reponse: "légumes", aliases: ["legumes","fruits et légumes","fruits et legumes","fruits"] },
  { module: "Équilibre", def: "Programme officiel de santé publique sur la nutrition (sigle).", reponse: "PNNS" },
  { module: "Équilibre", def: "Boisson indispensable, à privilégier à volonté.", reponse: "eau" },
  // ===== Éco-responsable =====
  { module: "Éco-responsable", def: "Produit qui pousse naturellement à un moment précis de l'année.", reponse: "saison", aliases: ["de saison","produit de saison"] },
  { module: "Éco-responsable", def: "Au maximum 1 intermédiaire entre producteur et consommateur (2 mots collés).", reponse: "circuit court", aliases: ["circuitcourt"] },
  { module: "Éco-responsable", def: "Label officiel de l'Agriculture Biologique (2 lettres).", reponse: "AB" },
  { module: "Éco-responsable", def: "Appellation d'Origine Protégée européenne (sigle).", reponse: "AOP", aliases: ["aoc"] },
  { module: "Éco-responsable", def: "Indication Géographique Protégée (sigle).", reponse: "IGP" },
  { module: "Éco-responsable", def: "Loi française anti-gaspillage et économie circulaire (2020) — sigle.", reponse: "AGEC" },
  { module: "Éco-responsable", def: "Type d'emballage le plus durable, recyclable à l'infini.", reponse: "verre" },
  { module: "Éco-responsable", def: "Matériau d'emballage compostable, à base d'amidon de maïs.", reponse: "bioplastique", aliases: ["bio plastique","bagasse"] },
  // ===== Étiquetage =====
  { module: "Étiquetage", def: "Date au-delà de laquelle le produit est dangereux à consommer (sigle).", reponse: "DLC" },
  { module: "Étiquetage", def: "Date de durabilité minimale : produit moins bon mais pas dangereux (sigle).", reponse: "DDM" },
  { module: "Étiquetage", def: "Règlement européen 1169/2011 sur l'information du consommateur.", reponse: "INCO" },
  { module: "Étiquetage", def: "Combien y a-t-il d'allergènes majeurs à signaler ?", reponse: "14", aliases: ["quatorze"] },
  { module: "Étiquetage", def: "Action de savoir d'où vient un produit, qui l'a fait, quand.", reponse: "traçabilité", aliases: ["tracabilite","tracabilité","tracabilité"] },
  // ===== Marche en avant =====
  { module: "Marche en avant", def: "On avance toujours du sale vers le ___ (un mot).", reponse: "propre" },
  { module: "Marche en avant", def: "Combien d'étapes y a-t-il dans la marche en avant ?", reponse: "9", aliases: ["neuf"] },
  { module: "Marche en avant", def: "1ère étape de la marche en avant : arrivée des marchandises.", reponse: "réception", aliases: ["reception"] },
  { module: "Marche en avant", def: "Dernière étape : remise au client.", reponse: "distribution" },
  { module: "Marche en avant", def: "Quand bactéries passent d'un aliment sale vers un aliment propre, c'est une contamination ___.", reponse: "croisée", aliases: ["croisee","croisée"] },
  { module: "Marche en avant", def: "Température maximale de la chaîne du froid pour les produits frais (en °C).", reponse: "4" },
  { module: "Marche en avant", def: "Geste essentiel à faire entre 2 préparations : se les laver.", reponse: "mains", aliases: ["main"] },
  { module: "Marche en avant", def: "Système d'analyse des risques en alimentation (sigle anglais).", reponse: "HACCP" },
];

/* Ouvre la modale du jeu "Trouve le mot" */
function openTrouveLeMot() {
  const old = document.getElementById("trouve-mot-back");
  if (old) old.remove();

  // Initialise la session : 10 questions piochées au hasard, mélangées
  const all = [...TROUVE_LE_MOT_BANQUE];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const session = all.slice(0, 10);
  let idx = 0;
  let score = 0;

  const back = document.createElement("div");
  back.id = "trouve-mot-back";
  back.className = "img-info-backdrop";
  back.addEventListener("click", e => { if (e.target === back) close(); });

  const card = document.createElement("div");
  card.className = "trouve-mot-card";
  back.appendChild(card);
  document.body.appendChild(back);

  function normalize(s) {
    return String(s || "").toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function close() {
    back.remove();
    document.removeEventListener("keydown", escH);
  }
  const escH = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", escH);

  function renderQuestion() {
    if (idx >= session.length) return renderFin();
    const q = session[idx];
    card.innerHTML = `
      <button type="button" class="img-info-close" title="Fermer">✕</button>
      <div class="tm-progress">Question <b>${idx + 1}</b> / ${session.length} · Score : <b>${score}</b></div>
      <div class="tm-bar"><div class="tm-bar-fill" style="width:${(idx / session.length) * 100}%"></div></div>
      <div class="tm-module">📚 ${escapeHtml(q.module)}</div>
      <h2 class="tm-def">"${escapeHtml(q.def)}"</h2>
      <p class="tm-hint">Tape le mot ou l'expression qui correspond à cette définition.</p>
      <div class="tm-input-row">
        <input type="text" class="tm-input" placeholder="Ta réponse…" autocomplete="off" />
        <button type="button" class="btn btn-primary tm-valider">Valider</button>
      </div>
      <div class="tm-feedback"></div>
    `;
    const inp = card.querySelector(".tm-input");
    const btnV = card.querySelector(".tm-valider");
    const fb = card.querySelector(".tm-feedback");
    setTimeout(() => inp.focus(), 50);

    function valider() {
      const userRaw = inp.value.trim();
      if (!userRaw) return;
      const user = normalize(userRaw);
      const target = normalize(q.reponse);
      const aliases = (q.aliases || []).map(normalize);
      const ok = user === target || aliases.includes(user) || target.includes(user) && user.length >= 3;
      if (ok) {
        score++;
        fb.className = "tm-feedback ok";
        fb.innerHTML = `✅ <b>Bonne réponse !</b> La réponse était <b>${escapeHtml(q.reponse)}</b>.`;
      } else {
        fb.className = "tm-feedback ko";
        fb.innerHTML = `❌ <b>Pas tout à fait.</b> La bonne réponse était <b>${escapeHtml(q.reponse)}</b>.`;
      }
      btnV.disabled = true;
      inp.disabled = true;
      // Bouton suivant
      const next = document.createElement("button");
      next.type = "button";
      next.className = "btn btn-primary";
      next.textContent = idx === session.length - 1 ? "🏁 Voir mon score" : "Question suivante →";
      next.style.marginTop = "12px";
      next.addEventListener("click", () => { idx++; renderQuestion(); });
      fb.appendChild(next);
      setTimeout(() => next.focus(), 50);
    }
    btnV.addEventListener("click", valider);
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") valider(); });
    card.querySelector(".img-info-close").addEventListener("click", close);
  }

  function renderFin() {
    const pct = Math.round(score / session.length * 100);
    const verdict =
      pct >= 90 ? { emoji: "🏆", txt: "Excellent ! Tu maîtrises ton vocabulaire.", c: "#1f5e36" } :
      pct >= 70 ? { emoji: "👏", txt: "Très bien ! Encore quelques mots à revoir.", c: "#2a8b3a" } :
      pct >= 50 ? { emoji: "💪", txt: "Bon début. Continue à t'entraîner.", c: "#8a5500" } :
                  { emoji: "📚", txt: "Tu peux mieux faire — révise et recommence.", c: "#a83232" };
    card.innerHTML = `
      <button type="button" class="img-info-close" title="Fermer">✕</button>
      <h2 class="tm-fin-titre">${verdict.emoji} ${escapeHtml(verdict.txt)}</h2>
      <div class="tm-fin-score" style="color:${verdict.c}">${score} / ${session.length}</div>
      <p class="tm-fin-pct">${pct} %</p>
      <div class="soumettre-actions">
        <button type="button" class="btn" id="tm-close">Fermer</button>
        <button type="button" class="btn btn-primary" id="tm-rejouer">🔁 Rejouer (10 nouveaux mots)</button>
      </div>
    `;
    card.querySelector(".img-info-close").addEventListener("click", close);
    card.querySelector("#tm-close").addEventListener("click", close);
    card.querySelector("#tm-rejouer").addEventListener("click", () => { close(); openTrouveLeMot(); });
  }

  renderQuestion();
}

/* V4.67 — Mode enseignant local
   ---------------------------------------------------------------------
   Permet à l'enseignant de valider directement sur l'ordinateur de
   l'élève, sans devoir charger un JSON séparé dans correction.html.
   Mode en RAM uniquement (pas sauvegardé) → l'élève ne peut pas le
   réactiver après fermeture. Trace toute modification d'épreuve avec
   `par: "enseignant"` et date. Alerte si l'élève modifie sa réponse
   après une validation enseignant. */
let modeEnseignantActif = false;
function isTeacherMode() { return window.IS_TEACHER_TOOL || modeEnseignantActif; }
/* V4.67 — Marque une réponse modifiée après validation enseignant. */
function markResponseModified(st, qId) {
  if (!st || !st.validations || !st.validations[qId]) return;
  const v = st.validations[qId];
  if (v.modifie_le && !isTeacherMode()) {
    v.modifie_apres_par_eleve = true;
    v.modifie_apres_le = new Date().toISOString();
  }
}
function toggleModeEnseignant() {
  if (modeEnseignantActif) {
    modeEnseignantActif = false;
    showAppToast("🔒 Mode enseignant désactivé.");
  } else {
    const ok = confirm(
      "🔓 Activer le MODE ENSEIGNANT ?\n\n" +
      "Cela permet de :\n" +
      "  • Valider les questions à phrase d'épreuve (OK / presque / KO)\n" +
      "  • Modifier la note finale\n" +
      "  • Valider l'attestation officielle\n\n" +
      "À UTILISER UNIQUEMENT PAR L'ENSEIGNANT·E.\n\n" +
      "Le mode se désactive automatiquement à la fermeture de la page."
    );
    if (!ok) return;
    modeEnseignantActif = true;
    showAppToast("🔓 Mode enseignant ACTIVÉ — tu peux valider directement les épreuves.");
  }
  // Mise à jour visuelle du bouton + ré-affichage
  updateModeEnseignantBadge();
  renderAll();
}
function updateModeEnseignantBadge() {
  const btn = document.getElementById("sidebar-mode-enseignant");
  if (!btn) return;
  if (modeEnseignantActif) {
    btn.classList.add("active");
    btn.innerHTML = `<span class="stb-icon">🔓</span><span>Mode enseignant <b>ON</b></span>`;
  } else {
    btn.classList.remove("active");
    btn.innerHTML = `<span class="stb-icon">🔒</span><span>Mode enseignant</span>`;
  }
}

/* V4.49 : plus de dock flottant. Les outils Mon avatar et Mode zen sont
   isolés dans la sidebar (ils ne servent pas à apprendre, juste à se sentir
   bien / se personnaliser). Le reste (glossaire, notes, flashcards, pendu,
   conversations, préférences) est intégré dans la vue Espace révision. */
function setupFloatingTools() {
  if (window.IS_TEACHER_TOOL) return; // pas dans correction.html
  // Nettoie l'ancien dock s'il subsiste d'un état précédent
  const old = document.getElementById("tools-fab");
  if (old) old.remove();

  // Branchement des boutons sidebar isolés
  const btnGlo = document.getElementById("sidebar-glossaire");
  if (btnGlo) btnGlo.addEventListener("click", openGlossaireComplet);
  const btnAvatar = document.getElementById("sidebar-mon-avatar");
  // V4.84 — Le bouton « Ma fiche de présentation » ouvre la section complète
  // (état civil, lycée, classe, photo, valeurs, qualités, intérêts, projet…).
  if (btnAvatar) btnAvatar.addEventListener("click", () => selectSection("identite"));
  // V4.84 — Bouton dédié pour composer l'avatar (apparence visuelle)
  const btnEditAvatar = document.getElementById("sidebar-edit-avatar");
  if (btnEditAvatar) btnEditAvatar.addEventListener("click", openAvatarEditor);
  const btnMonAvis = document.getElementById("sidebar-mon-avis");
  if (btnMonAvis) btnMonAvis.addEventListener("click", openMonAvis);
  const btnModeEns = document.getElementById("sidebar-mode-enseignant");
  if (btnModeEns) btnModeEns.addEventListener("click", toggleModeEnseignant);
  updateModeEnseignantBadge();
}

document.addEventListener("DOMContentLoaded", init);
