/* avatar.js — portrait de l'élève en tenue de cuisine, composé en SVG (rien de téléchargé).
 *   CDO_AVATAR.svg(choix, taille)  → chaîne SVG
 *   CDO_AVATAR.CATEGORIES          → réglages proposés à l'élève (libellé, options)
 *   CDO_AVATAR.DEFAUT
 */
(function () {
  'use strict';
  var PEAUX = ['#f6d7c3', '#eec1a0', '#d9a07a', '#b97b52', '#8d5634', '#6a3b22', '#4a2914'];
  var CHEVEUX_C = ['#1d1a19', '#3b2416', '#6b4226', '#a8703c', '#d9b46a', '#b5452c', '#8c8c8c', '#e8e2d6'];
  var VESTES = { blanche: ['#ffffff', '#d9dde3'], noire: ['#23262b', '#3a3f46'], marine: ['#1f3b63', '#2c5185'], bordeaux: ['#6d1f2c', '#8a2b3b'] };
  var FONDS = ['#cfe8e4', '#f6dcc8', '#dbe4f5', '#efe1f3', '#fbeab0', '#e3e3e3'];

  var DEFAUT = { peau: 2, visage: 'ovale', yeux: 'ronds', bouche: 'sourire', cheveux: 'courts', couleurCheveux: 1, barbe: 'aucune', lunettes: 'aucune', coiffe: 'calot', veste: 'blanche', fond: 0 };

  function cheveuxArriere(s, c) {
    if (s === 'longs') return '<path d="M66 104c-6 46 2 86 20 104h68c18-18 26-58 20-104-6-34-26-52-54-52s-48 18-54 52z" fill="' + c + '"/>';
    if (s === 'tresses') return '<path d="M72 110c-4 30-2 70 6 96M168 110c4 30 2 70-6 96" stroke="' + c + '" stroke-width="16" stroke-linecap="round" fill="none"/>';
    if (s === 'afro') return '<circle cx="120" cy="92" r="66" fill="' + c + '"/>';
    return '';
  }
  function cheveuxAvant(s, c) {
    switch (s) {
      case 'courts': return '<path d="M73 100c0-34 20-54 47-54s47 20 47 54c-8-12-22-20-47-21-24 1-39 9-47 21z" fill="' + c + '"/>';
      case 'degrade': return '<path d="M74 96c2-30 20-48 46-48s44 18 46 48c-10-16-26-24-46-24s-36 8-46 24z" fill="' + c + '"/><path d="M76 98v14M164 98v14" stroke="' + c + '" stroke-width="5" stroke-linecap="round"/>';
      case 'boucles': return '<g fill="' + c + '"><circle cx="82" cy="86" r="14"/><circle cx="100" cy="68" r="15"/><circle cx="122" cy="62" r="16"/><circle cx="144" cy="70" r="15"/><circle cx="160" cy="88" r="13"/><circle cx="76" cy="104" r="10"/><circle cx="165" cy="104" r="10"/></g>';
      case 'longs': return '<path d="M72 104c4-36 22-58 48-58s44 22 48 58c-14-20-30-30-48-30-12 6-30 18-48 30z" fill="' + c + '"/>';
      case 'chignon': return '<circle cx="120" cy="44" r="18" fill="' + c + '"/><path d="M73 100c0-32 20-52 47-52s47 20 47 52c-12-14-28-22-47-22s-35 8-47 22z" fill="' + c + '"/>';
      case 'tresses': return '<path d="M73 102c0-34 20-54 47-54s47 20 47 54c-10-14-26-22-47-22s-37 8-47 22z" fill="' + c + '"/><path d="M120 50v28" stroke="rgba(0,0,0,.18)" stroke-width="2"/>';
      case 'afro': return '<path d="M70 100c2-30 22-46 50-46s48 16 50 46c-14-14-30-20-50-20s-36 6-50 20z" fill="' + c + '"/>';
      case 'rases': return '<path d="M76 96c4-28 20-44 44-44s40 16 44 44c-12-10-26-16-44-16s-32 6-44 16z" fill="' + c + '" opacity=".55"/>';
      default: return '';
    }
  }
  function visage(f, p) {
    if (f === 'rond') return '<ellipse cx="120" cy="108" rx="48" ry="50" fill="' + p + '"/>';
    if (f === 'carre') return '<path d="M73 92c0-28 20-46 47-46s47 18 47 46v22c0 30-20 46-47 46s-47-16-47-46z" fill="' + p + '"/>';
    return '<ellipse cx="120" cy="108" rx="46" ry="55" fill="' + p + '"/>';
  }
  function yeux(y) {
    var c = '#24201e';
    if (y === 'amande') return '<path d="M94 106q8-7 16 0q-8 5-16 0zM130 106q8-7 16 0q-8 5-16 0z" fill="' + c + '"/><circle cx="103" cy="105" r="1.6" fill="#fff"/><circle cx="139" cy="105" r="1.6" fill="#fff"/>';
    if (y === 'rieurs') return '<path d="M94 107q8-8 16 0M130 107q8-8 16 0" stroke="' + c + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
    return '<circle cx="102" cy="106" r="5" fill="' + c + '"/><circle cx="138" cy="106" r="5" fill="' + c + '"/><circle cx="103.6" cy="104.4" r="1.6" fill="#fff"/><circle cx="139.6" cy="104.4" r="1.6" fill="#fff"/>';
  }
  function sourcils(c) {
    return '<path d="M92 94q10-6 20-1M128 93q10-5 20 1" stroke="' + c + '" stroke-width="3.6" fill="none" stroke-linecap="round"/>';
  }
  function bouche(b) {
    if (b === 'grand') return '<path d="M104 132q16 18 32 0z" fill="#7a2e2a"/><path d="M107 133q13 6 26 0" stroke="#fff" stroke-width="3" fill="none"/>';
    if (b === 'neutre') return '<path d="M108 136h24" stroke="#7a3d32" stroke-width="3.4" stroke-linecap="round"/>';
    return '<path d="M104 132q16 13 32 0" stroke="#7a3d32" stroke-width="3.6" fill="none" stroke-linecap="round"/>';
  }
  function barbe(b, c) {
    if (b === 'courte') return '<path d="M76 116c4 34 22 48 44 48s40-14 44-48c-8 14-14 20-22 22-8-6-14-8-22-8s-14 2-22 8c-8-2-14-8-22-22z" fill="' + c + '" opacity=".9"/>';
    if (b === 'moustache') return '<path d="M102 126q9-7 18-2 9-5 18 2-9 4-18 1-9 3-18-1z" fill="' + c + '"/>';
    if (b === 'bouc') return '<path d="M110 146q10 14 20 0v-8q-10 6-20 0z" fill="' + c + '"/><path d="M104 126q8-6 16-2 8-4 16 2-8 3-16 1-8 2-16-1z" fill="' + c + '"/>';
    return '';
  }
  function lunettes(l) {
    var s = 'stroke="#2b2f36" stroke-width="3.2" fill="rgba(255,255,255,.18)"';
    if (l === 'rondes') return '<circle cx="102" cy="106" r="12" ' + s + '/><circle cx="138" cy="106" r="12" ' + s + '/><path d="M114 106h12M90 104l-14-3M150 104l14-3" stroke="#2b2f36" stroke-width="3"/>';
    if (l === 'rectangles') return '<rect x="88" y="97" width="28" height="19" rx="4" ' + s + '/><rect x="124" y="97" width="28" height="19" rx="4" ' + s + '/><path d="M116 105h8M88 103l-12-3M152 103l12-3" stroke="#2b2f36" stroke-width="3"/>';
    return '';
  }
  function coiffe(k, cheveux) {
    switch (k) {
      case 'toque': return '<path d="M78 84h84l-4-14H82z" fill="#f3f4f6" stroke="#cdd2d9" stroke-width="2"/><path d="M84 72c-14-4-16-26 2-30 2-16 22-22 34-12 12-10 32-4 34 12 18 4 16 26 2 30z" fill="#ffffff" stroke="#cdd2d9" stroke-width="2"/>';
      case 'calot': return '<path d="M74 86c2-24 20-38 46-38s44 14 46 38z" fill="#ffffff" stroke="#cdd2d9" stroke-width="2"/><path d="M74 86h92" stroke="#0f6b63" stroke-width="5"/>';
      case 'charlotte': return '<path d="M70 92c-2-30 20-50 50-50s52 20 50 50c-4 6-10 8-16 6-10 4-22 6-34 6s-24-2-34-6c-6 2-12 0-16-6z" fill="#e8f1fb" stroke="#b6c9df" stroke-width="2"/><path d="M80 96q10 4 20 0t20 0 20 0 20 0" stroke="#b6c9df" stroke-width="2" fill="none"/>';
      case 'bandana': return '<path d="M72 92c2-28 20-44 48-44s46 16 48 44c-14-8-30-12-48-12s-34 4-48 12z" fill="#b4470f"/><circle cx="96" cy="70" r="2.5" fill="#fff"/><circle cx="126" cy="62" r="2.5" fill="#fff"/><circle cx="148" cy="74" r="2.5" fill="#fff"/><path d="M164 90l14 10-12 4z" fill="#b4470f"/>';
      case 'foulard': return '<path d="M64 112c-4-46 20-70 56-70s60 24 56 70c-2 34-12 58-22 66H86c-10-8-20-32-22-66z" fill="#4c4a8a"/>';
      default: return '';
    }
  }
  function veste(v) {
    var c = VESTES[v] || VESTES.blanche, liseret = v === 'blanche' ? '#0f6b63' : '#e9e4d8';
    return '<path d="M40 240c4-46 34-70 80-70s76 24 80 70z" fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2"/>' +
      '<path d="M100 172l20 26 20-26" fill="none" stroke="' + c[1] + '" stroke-width="3"/>' +
      '<path d="M102 176v64" stroke="' + liseret + '" stroke-width="3"/>' +
      '<g fill="' + (v === 'blanche' ? '#9aa3ad' : '#d7d2c6') + '"><circle cx="112" cy="208" r="3.4"/><circle cx="112" cy="226" r="3.4"/><circle cx="134" cy="208" r="3.4"/><circle cx="134" cy="226" r="3.4"/></g>';
  }

  function svg(o, taille) {
    o = Object.assign({}, DEFAUT, o || {});
    var p = PEAUX[o.peau] || PEAUX[2], ch = CHEVEUX_C[o.couleurCheveux] || CHEVEUX_C[1], foulard = o.coiffe === 'foulard';
    var h = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="' + (taille || 160) + '" height="' + (taille || 160) + '" role="img" aria-label="Avatar">' +
      '<defs><clipPath id="cdo-av-rond"><circle cx="120" cy="120" r="120"/></clipPath></defs>' +
      '<g clip-path="url(#cdo-av-rond)"><rect width="240" height="240" fill="' + (FONDS[o.fond] || FONDS[0]) + '"/>';
    if (foulard) h += coiffe('foulard');
    else h += cheveuxArriere(o.cheveux, ch);
    h += veste(o.veste);
    h += '<path d="M106 150h28v28c-8 6-20 6-28 0z" fill="' + p + '"/>';
    h += foulard ? '' : '<ellipse cx="72" cy="112" rx="8" ry="11" fill="' + p + '"/><ellipse cx="168" cy="112" rx="8" ry="11" fill="' + p + '"/>';
    h += visage(o.visage, p);
    h += '<path d="M90 124q4 3 8 0M142 124q4 3 8 0" stroke="#e48d7a" stroke-width="3" stroke-linecap="round" opacity=".55"/>';
    h += yeux(o.yeux) + sourcils(foulard ? '#2b2420' : ch) + '<path d="M118 112q-4 10 2 12" stroke="rgba(0,0,0,.25)" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    h += bouche(o.bouche) + barbe(o.barbe, ch) + lunettes(o.lunettes);
    if (!foulard) h += cheveuxAvant(o.coiffe === 'charlotte' || o.coiffe === 'toque' ? 'aucun' : o.cheveux, ch);
    if (!foulard) h += coiffe(o.coiffe);
    h += '</g></svg>';
    return h;
  }

  var CATEGORIES = [
    { cle: 'peau', libelle: 'Teint', options: PEAUX.map(function (c, i) { return { v: i, couleur: c }; }) },
    { cle: 'visage', libelle: 'Visage', options: [{ v: 'ovale', t: 'Ovale' }, { v: 'rond', t: 'Rond' }, { v: 'carre', t: 'Carré' }] },
    { cle: 'yeux', libelle: 'Yeux', options: [{ v: 'ronds', t: 'Ronds' }, { v: 'amande', t: 'En amande' }, { v: 'rieurs', t: 'Rieurs' }] },
    { cle: 'bouche', libelle: 'Expression', options: [{ v: 'sourire', t: 'Sourire' }, { v: 'grand', t: 'Grand sourire' }, { v: 'neutre', t: 'Sérieux' }] },
    { cle: 'cheveux', libelle: 'Cheveux', options: [{ v: 'courts', t: 'Courts' }, { v: 'degrade', t: 'Dégradé' }, { v: 'rases', t: 'Rasés' }, { v: 'boucles', t: 'Bouclés' }, { v: 'afro', t: 'Afro' }, { v: 'chignon', t: 'Chignon' }, { v: 'tresses', t: 'Tresses' }, { v: 'longs', t: 'Longs' }] },
    { cle: 'couleurCheveux', libelle: 'Couleur des cheveux', options: CHEVEUX_C.map(function (c, i) { return { v: i, couleur: c }; }) },
    { cle: 'barbe', libelle: 'Barbe', options: [{ v: 'aucune', t: 'Aucune' }, { v: 'courte', t: 'Courte' }, { v: 'moustache', t: 'Moustache' }, { v: 'bouc', t: 'Bouc' }] },
    { cle: 'lunettes', libelle: 'Lunettes', options: [{ v: 'aucune', t: 'Aucune' }, { v: 'rondes', t: 'Rondes' }, { v: 'rectangles', t: 'Rectangulaires' }] },
    { cle: 'coiffe', libelle: 'Coiffe', options: [{ v: 'calot', t: 'Calot' }, { v: 'toque', t: 'Toque' }, { v: 'charlotte', t: 'Charlotte' }, { v: 'bandana', t: 'Bandana' }, { v: 'foulard', t: 'Foulard' }, { v: 'aucune', t: 'Aucune' }] },
    { cle: 'veste', libelle: 'Veste', options: [{ v: 'blanche', t: 'Blanche' }, { v: 'noire', t: 'Noire' }, { v: 'marine', t: 'Marine' }, { v: 'bordeaux', t: 'Bordeaux' }] },
    { cle: 'fond', libelle: 'Fond', options: FONDS.map(function (c, i) { return { v: i, couleur: c }; }) }
  ];

  window.CDO_AVATAR = { svg: svg, CATEGORIES: CATEGORIES, DEFAUT: DEFAUT };
})();
