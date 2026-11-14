'use strict';
/* Français pas à pas — données des exercices.
   Ajouter un exercice = ajouter un objet dans EXERCICES (aucun code à écrire).
   Types : ecoute, choix, paires, tri, ordre, intrus, lien.
   « mot » = ce que la voix dit. Les images sont dans images/. */
(function () {
  const P = (code, mot) => ({ img: 'images/panneaux/' + code + '.png', mot });
  const A = (dossier, f, mot) => ({ img: 'images/aliments/' + dossier + '/' + f + '.jpg', mot });
  const R = (id, mot) => ({ img: 'images/arasaac/' + id + '.png', mot });

  /* ---------- Panneaux (ISO 7010 et SGH, domaine public) ---------- */
  const obligation = [
    P('M014', 'Casque obligatoire'), P('M009', 'Gants obligatoires'),
    P('M008', 'Chaussures de sécurité obligatoires'), P('M004', 'Lunettes de protection obligatoires'),
    P('M003', 'Casque antibruit obligatoire'), P('M017', 'Masque obligatoire'),
    P('M010', 'Vêtements de protection obligatoires'), P('M013', 'Visière obligatoire'),
    P('M018', 'Harnais obligatoire'), P('M024', 'Passage pour piétons obligatoire'),
    P('M001', 'Obligation')
  ];
  const interdiction = [
    P('P002', 'Interdit de fumer'), P('P003', 'Flamme interdite'),
    P('P022', 'Interdit de manger et de boire'), P('P010', 'Ne pas toucher'),
    P('P004', 'Interdit aux piétons'), P('P006', 'Interdit aux chariots'),
    P('P011', 'Ne pas éteindre avec de l’eau')
  ];
  const danger = [
    P('W001', 'Danger'), P('W012', 'Danger électrique'), P('W008', 'Danger de chute'),
    P('W007', 'Danger obstacle au sol'), P('W011', 'Sol glissant'),
    P('W021', 'Danger produit inflammable'), P('W016', 'Danger produit toxique'),
    P('W023', 'Danger produit corrosif'), P('W002', 'Danger explosion'),
    P('W014', 'Danger chariots'), P('W015', 'Danger charge suspendue'),
    P('W009', 'Danger biologique'), P('W010', 'Danger froid'),
    P('W003', 'Danger radioactivité'), P('W004', 'Danger laser'),
    P('W006', 'Danger aimant'), P('W005', 'Danger rayonnement'),
    P('W028', 'Danger produit comburant')
  ];
  const incendie = [
    P('F001', 'Extincteur'), P('F005', 'Alarme incendie'), P('F002', 'Robinet d’incendie'),
    P('F006', 'Téléphone d’urgence incendie'), P('F003', 'Échelle d’incendie'),
    P('F004', 'Matériel d’incendie')
  ];
  const secours = [
    P('E001', 'Sortie de secours'), P('E007', 'Point de rassemblement'),
    P('E003', 'Premiers secours'), P('E010', 'Défibrillateur'),
    P('E004', 'Téléphone d’urgence'), P('E011', 'Lavage des yeux'),
    P('E012', 'Douche de sécurité'), P('E013', 'Civière')
  ];
  const sgh = [
    P('SGH01', 'Explosif'), P('SGH02', 'Inflammable'), P('SGH03', 'Comburant'),
    P('SGH04', 'Gaz sous pression'), P('SGH05', 'Corrosif'), P('SGH06', 'Toxique'),
    P('SGH07', 'Nocif ou irritant'), P('SGH08', 'Dangereux pour la santé'),
    P('SGH09', 'Dangereux pour l’environnement')
  ];

  /* ---------- Aliments (photos déjà publiées sur mapse.fr) ---------- */
  const fruits = [
    A('fruits', 'pomme', 'La pomme'), A('fruits', 'banane', 'La banane'),
    A('fruits', 'orange', 'L’orange'), A('fruits', 'fraise', 'La fraise'),
    A('fruits', 'poire', 'La poire'), A('fruits', 'cerise', 'La cerise'),
    A('fruits', 'raisin', 'Le raisin'), A('fruits', 'kiwi', 'Le kiwi')
  ];
  const legumes = [
    A('legumes', 'tomate', 'La tomate'), A('legumes', 'carotte', 'La carotte'),
    A('legumes', 'salade', 'La salade'), A('legumes', 'oignon', 'L’oignon'),
    A('legumes', 'courgette', 'La courgette'), A('legumes', 'poivron', 'Le poivron'),
    A('legumes', 'poireau', 'Le poireau'), A('legumes', 'radis', 'Le radis')
  ];
  const boissons = [
    A('boissons', 'eau', 'L’eau'), A('boissons', 'cafe', 'Le café'),
    A('boissons', 'jus', 'Le jus d’orange'), A('boissons', 'chocolat', 'Le chocolat chaud'),
    A('boissons', 'soda', 'Le soda'), A('boissons', 'limonade', 'La limonade'),
    A('boissons', 'the_glace', 'Le thé glacé')
  ];
  const desserts = [
    A('desserts', 'gateau', 'Le gâteau'), A('desserts', 'glace', 'La glace'),
    A('desserts', 'tarte', 'La tarte'), A('desserts', 'bonbons', 'Les bonbons'),
    A('desserts', 'gaufres', 'Les gaufres'), A('desserts', 'eclair', 'L’éclair'),
    A('desserts', 'donuts', 'Le beignet'), A('desserts', 'tiramisu', 'Le tiramisu')
  ];

  /* ---------- Le bruit (pictogrammes ARASAAC) ---------- */
  const bonPourOreilles = [
    R(36357, 'Le casque antibruit'), R(5936, 'Le calme'), R(38215, 'Le son faible'), R(38213, 'La pause')
  ];
  const mauvaisPourOreilles = [
    R(11584, 'Le concert très fort'), R(38216, 'Le son fort'), R(7157, 'Mal aux oreilles')
  ];

  /* ---------- Espaces ---------- */
  const ESPACES = [
    { id: 'ecoute', mot: 'J’écoute et je parle', img: 'images/arasaac/2871.png' },
    { id: 'lis', mot: 'Je lis', img: null },
    { id: 'ecris', mot: 'J’écris', img: null },
    { id: 'reconnais', mot: 'Je reconnais les panneaux', img: 'images/panneaux/W001.png' },
    { id: 'vie', mot: 'Ma vie, mon lycée, mon stage', img: 'images/aliments/fruits/pomme.jpg' }
  ];

  /* ---------- Exercices ---------- */
  const EXERCICES = [];
  const add = (e) => EXERCICES.push(e);

  // Je reconnais : pour chaque famille de panneaux, j'écoute, je retrouve, memory
  const familles = [
    ['obligation', 'Les panneaux d’obligation', obligation],
    ['interdiction', 'Les panneaux d’interdiction', interdiction],
    ['danger', 'Les panneaux de danger', danger],
    ['incendie', 'Les panneaux d’incendie', incendie],
    ['secours', 'Les panneaux de secours', secours],
    ['sgh', 'Les produits dangereux', sgh]
  ];
  familles.forEach(([id, nom, items]) => {
    add({ id: 'pan-' + id + '-ecoute', espace: 'reconnais', type: 'ecoute', mot: nom, img: items[0].img, items });
    add({ id: 'pan-' + id + '-choix', espace: 'reconnais', type: 'choix', mot: nom, img: items[1].img, items, tours: Math.min(8, items.length) });
    add({ id: 'pan-' + id + '-paires', espace: 'reconnais', type: 'paires', mot: nom, img: items[2].img, items: items.slice(0, 6) });
  });
  add({ id: 'pan-tri-oblig-inter', espace: 'reconnais', type: 'tri', mot: 'Obligation ou interdiction',
    img: 'images/panneaux/M001.png',
    boites: [{ mot: 'Obligation : je dois le faire', img: 'images/panneaux/M001.png', groupe: 'o' },
             { mot: 'Interdiction : je ne dois pas le faire', img: 'images/panneaux/P002.png', groupe: 'i' }],
    items: obligation.slice(0, 5).map(x => ({ ...x, groupe: 'o' })).concat(interdiction.slice(0, 5).map(x => ({ ...x, groupe: 'i' }))) });
  add({ id: 'pan-tri-danger-secours', espace: 'reconnais', type: 'tri', mot: 'Danger ou secours',
    img: 'images/panneaux/E003.png',
    boites: [{ mot: 'Danger', img: 'images/panneaux/W001.png', groupe: 'd' },
             { mot: 'Secours', img: 'images/panneaux/E003.png', groupe: 's' }],
    items: danger.slice(1, 6).map(x => ({ ...x, groupe: 'd' })).concat(secours.slice(0, 5).map(x => ({ ...x, groupe: 's' }))) });
  add({ id: 'pan-intrus', espace: 'reconnais', type: 'intrus', mot: 'Trouve l’intrus', img: 'images/panneaux/P003.png',
    groupes: [obligation, interdiction, danger, secours], tours: 6 });
  add({ id: 'pan-ordre-alarme', espace: 'reconnais', type: 'ordre', mot: 'L’alarme sonne : que faire ?',
    img: 'images/panneaux/E007.png',
    items: [P('F005', 'L’alarme sonne'), P('E001', 'Je prends la sortie de secours'), P('E007', 'Je vais au point de rassemblement')] });

  // J'écoute et je parle : imagiers sonores
  [['fruits', 'Les fruits', fruits], ['legumes', 'Les légumes', legumes],
   ['boissons', 'Les boissons', boissons], ['desserts', 'Les desserts', desserts]].forEach(([id, nom, items]) => {
    add({ id: 'img-' + id + '-ecoute', espace: 'ecoute', type: 'ecoute', mot: nom, img: items[0].img, items, montreMot: true });
    add({ id: 'img-' + id + '-choix', espace: 'ecoute', type: 'choix', mot: nom, img: items[1].img, items, tours: 6 });
    add({ id: 'img-' + id + '-paires', espace: 'ecoute', type: 'paires', mot: nom, img: items[2].img, items: items.slice(0, 6) });
  });

  // Ma vie, mon lycée, mon stage
  add({ id: 'vie-tri-fruit-legume', espace: 'vie', type: 'tri', mot: 'Fruit ou légume', img: 'images/aliments/legumes/carotte.jpg',
    boites: [{ mot: 'Les fruits', img: 'images/aliments/fruits/pomme.jpg', groupe: 'f' },
             { mot: 'Les légumes', img: 'images/aliments/legumes/carotte.jpg', groupe: 'l' }],
    items: fruits.slice(1, 6).map(x => ({ ...x, groupe: 'f' })).concat(legumes.slice(0, 1).concat(legumes.slice(2, 6)).map(x => ({ ...x, groupe: 'l' }))) });
  add({ id: 'vie-intrus-aliments', espace: 'vie', type: 'intrus', mot: 'Trouve l’intrus', img: 'images/aliments/desserts/glace.jpg',
    groupes: [fruits, legumes, boissons, desserts], tours: 6 });
  add({ id: 'vie-tri-bruit', espace: 'vie', type: 'tri', mot: 'Le bruit et mes oreilles', img: 'images/arasaac/36357.png',
    boites: [{ mot: 'Bon pour mes oreilles', signe: 'oui', groupe: 'b' },
             { mot: 'Mauvais pour mes oreilles', signe: 'non', groupe: 'm' }],
    items: bonPourOreilles.map(x => ({ ...x, groupe: 'b' })).concat(mauvaisPourOreilles.map(x => ({ ...x, groupe: 'm' }))) });
  add({ id: 'vie-bruit-paires', espace: 'vie', type: 'paires', mot: 'Le bruit', img: 'images/arasaac/2871.png',
    items: bonPourOreilles.concat(mauvaisPourOreilles).slice(0, 6) });
  add({ id: 'vie-lien-bruit-puzzle', espace: 'vie', type: 'lien', mot: 'Le bruit en puzzles', img: 'images/arasaac/11584.png', href: '../apercu-bruit-puzzle/' });
  add({ id: 'vie-lien-cuisine', espace: 'vie', type: 'lien', mot: 'La cuisine pas à pas', img: 'images/aliments/legumes/tomate.jpg', href: '../lire_ecrire_cuisine.html' });
  add({ id: 'vie-lien-bruit-images', espace: 'vie', type: 'lien', mot: 'Le bruit au quotidien, en images', img: 'images/arasaac/7157.png', href: '../cap_B4_cours_images.html' });

  window.PAP = { ESPACES, EXERCICES };
})();
