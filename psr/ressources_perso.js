/* =====================================================================
   ressources_perso.js
   ---------------------------------------------------------------------
   FICHIER À ÉDITER PAR L'ENSEIGNANT·E
   ---------------------------------------------------------------------
   Ce fichier vous permet d'ajouter VOS PROPRES ressources (articles,
   images, vidéos, liens, PDFs) dans les modules pédagogiques du
   portfolio de vos élèves, sans toucher au code principal.

   COMMENT ÇA MARCHE :
     - Vous éditez la constante RESSOURCES_PERSO ci-dessous
     - Vous classez vos ressources par MODULE (clé = id de la section)
     - Quand l'élève ouvre son portfolio, vos ressources apparaissent
       automatiquement dans la bibliothèque du module concerné, en plus
       des ressources officielles déjà fournies
     - Aucun impact sur le JSON de l'élève

   IDS DE MODULE DISPONIBLES :
     - "comprendre"      → J1 — Comprendre le chef-d'œuvre
     - "equilibre"       → J2 — L'assiette équilibrée
     - "eco_responsable" → J3 — Gaspillage / éco / circuits courts
     - "etiquetage"      → J4 — Étiquetage du produit
     - "mon_menu"        → J5 — Mon menu final

   TYPES DE RESSOURCES SUPPORTÉS :
     - "article"      : texte HTML directement intégré (pas besoin de
                        fichier externe). Idéal pour un petit article
                        rédigé par l'enseignant·e.
     - "lien_externe" : un lien vers un site web (ex: mapse2.fr)
     - "video"        : un lien YouTube ou Vimeo (s'embarque automatiquement)
     - "pdf"          : un fichier PDF placé à côté d'index.html
     - "image"        : une image placée à côté d'index.html

   EXEMPLES CI-DESSOUS — À COMPLÉTER OU REMPLACER PAR VOS PROPRES RESSOURCES.
   ===================================================================== */

const RESSOURCES_PERSO = {

  // ================== J1 — Comprendre le chef-d'œuvre ==================
  "comprendre": [
    // Exemple : un lien vers votre site personnel (à modifier)
    // {
    //   id: "perso_j1_mapse",
    //   type: "lien_externe",
    //   titre: "Aide-mémoire vidéo sur mapse2.fr",
    //   description: "Une courte vidéo de présentation du chef-d'œuvre que j'ai préparée pour la classe.",
    //   url: "https://mapse2.fr/chef-doeuvre",
    // },
  ],

  // ================== J2 — L'assiette équilibrée ==================
  "equilibre": [
    // Exemple commenté : décommentez et adaptez pour utiliser
    // {
    //   id: "perso_j2_article1",
    //   type: "article",
    //   titre: "Mon article : Pourquoi l'équilibre alimentaire est important",
    //   description: "Article rédigé pour la classe, à lire avant l'épreuve.",
    //   contenu: `
    //     <h3>L'équilibre alimentaire : pourquoi c'est important pour vous</h3>
    //     <p>En tant que future·s professionnel·les de la cuisine, vous devez
    //     comprendre que l'équilibre alimentaire est le fondement de votre métier.</p>
    //     <p><b>Trois raisons clés :</b></p>
    //     <ul>
    //       <li>Pour vous-même : bien manger c'est mieux travailler</li>
    //       <li>Pour vos clients : ils vous font confiance</li>
    //       <li>Pour la société : un cuisinier transmet une culture alimentaire</li>
    //     </ul>
    //     <p>Pensez-y au moment de composer votre menu de chef-d'œuvre !</p>
    //   `,
    // },
  ],

  // ================== J3 — Gaspillage / éco / circuits courts ==================
  "eco_responsable": [
    // EXEMPLE COMPLET D'UN ARTICLE POUR LE GASPILLAGE :
    {
      id: "perso_j3_gaspi_intro",
      type: "article",
      titre: "Article : Le gaspillage dans notre lycée",
      description: "Constats et idées d'action pour notre classe.",
      contenu: `
        <h3>Le gaspillage alimentaire dans notre lycée</h3>
        <p><b>Le constat :</b> dans la restauration collective française, on gaspille
        en moyenne <b>120 grammes par repas par personne</b>. Pour notre lycée
        de 500 élèves, cela fait près de <b>60 kg de nourriture jetés chaque jour</b>.</p>

        <h4>Pourquoi ?</h4>
        <ul>
          <li>Portions trop grandes mal calibrées</li>
          <li>Aliments mal conservés ou périmés</li>
          <li>Plats mal aimés des élèves</li>
          <li>Manque de sensibilisation</li>
        </ul>

        <h4>Quelques pistes d'action pour notre projet</h4>
        <ol>
          <li>Adapter les portions aux appétits réels</li>
          <li>Proposer un menu attractif testé en amont (enquête)</li>
          <li>Réutiliser les invendus (transformations)</li>
          <li>Communiquer auprès des clients sur la démarche</li>
        </ol>

        <p><i>Source : ADEME — chiffres 2023.</i></p>
      `,
    },
    // Vous pouvez ajouter d'autres ressources ici, par exemple :
    // - une image personnalisée placée à côté d'index.html
    // - une vidéo YouTube
    // - un PDF de cours
  ],

  // ================== J4 — Étiquetage du produit ==================
  "etiquetage": [
    // Exemple commenté
    // {
    //   id: "perso_j4_modele_etiquette",
    //   type: "image",
    //   titre: "Modèle d'étiquette à imprimer",
    //   description: "Modèle vierge d'étiquette à compléter pour votre produit.",
    //   fichier: "ressources_perso/etiquette_modele.png",
    // },
  ],

  // ================== J5 — Mon menu final ==================
  "mon_menu": [
    // Vide pour l'instant — à remplir si besoin
  ],

};

/* =====================================================================
   STRUCTURE D'UNE RESSOURCE :
   ---------------------------------------------------------------------
   Chaque ressource doit avoir AU MINIMUM :
     - id          : identifiant unique (ex: "perso_j2_articleNutrition")
     - type        : "article" | "lien_externe" | "video" | "pdf" | "image"
     - titre       : ce que l'élève voit en gros
     - description : 1 phrase pour expliquer la ressource

   Selon le type :
     - "article"      → champ "contenu" (chaîne HTML : <h3>, <p>, <ul>, etc.)
     - "lien_externe" → champ "url"  (ex: "https://mapse2.fr")
     - "video"        → champ "url"  (lien YouTube ou Vimeo)
     - "pdf"          → champ "fichier" (ex: "ressources_perso/mon_doc.pdf")
     - "image"        → champ "fichier" (ex: "ressources_perso/mon_image.png")

   POUR AJOUTER UNE RESSOURCE :
     1. Choisissez le module (clé : "comprendre" / "equilibre" / etc.)
     2. Ajoutez un objet { id, type, titre, description, ... } dans le tableau
     3. Sauvegardez ce fichier
     4. L'élève recharge son index.html → il voit la nouvelle ressource

   POUR LES PDFs / IMAGES :
     1. Créez (si besoin) un dossier "ressources_perso/" à côté d'index.html
     2. Mettez votre fichier dedans (ex: "ressources_perso/mon_article.pdf")
     3. Référencez le chemin dans la propriété "fichier"
   ===================================================================== */
