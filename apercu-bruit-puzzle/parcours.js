'use strict';
/* Le bruit en puzzles — version pour une élève non lectrice.
   Mêmes notions que apercu-bruit/ ; images réutilisées depuis ce dossier. */
const DOSSIER = '../apercu-bruit/images/';
const pic = (f, mot) => ({ src: f + '.png', mot, l: 298, h: 298 });
const atelier = { src: 'atelier.jpg', mot: 'Yanis dans l’atelier', l: 670, h: 550 };
const schema = { src: 'oreille.jpg', mot: 'L’oreille', l: 1400, h: 1239 };
const ponceuse = { src: 'atelier.jpg', mot: 'La ponceuse', l: 670, h: 550, crop: [0.36, 0.64, 0.34, 0.30] };
const concert = pic(11584, 'Le concert'), oreille = pic(2871, 'L’oreille'), sommeil = pic(31276, 'Le sommeil');
const casque = pic(36357, 'Le casque antibruit'), pause = pic(38213, 'La pause'), sonFaible = pic(38215, 'Son faible');
const sonFort = pic(38216, 'Son fort'), calme = pic(5936, 'Au calme'), sifflement = pic(7157, 'Mal aux oreilles');
const faible = { jauge: '▂', mot: 'Son faible' }, fort = { jauge: '▂▅█', mot: 'Son fort' };

/* Types d’écrans */
const montre = (dit, ...vues) => ({ type: 'montre', icone: '👁', dit, vues });
const puzzle = (image, c, r, aide = 'nette') => ({ type: 'puzzle', icone: '🧩', image, c, r, aide,
  dit: 'Faire le puzzle. ' + (aide === 'aucune' ? 'Sans modèle.' : 'Poser chaque pièce sur son modèle.') });
const bande = (dit, items, aide, retour) => ({ type: 'bande', icone: '➡️', dit, items, aide, retour });
const ombres = (items) => ({ type: 'bande', icone: '◐', dit: 'Poser chaque image sur son ombre.', items, aide: 'ombre', melange: true, retour: 'Toutes les images sont à leur place.' });
const choix = (dit, cartes, bonne, retour, vue) => ({ type: 'choix', icone: '👆', dit, cartes, bonne, retour, vue });
const tri = (dit, boites, items, retour) => ({ type: 'tri', icone: '📦', dit, boites, items, retour });
const paires = (items) => ({ type: 'memo', icone: '🃏', dit: 'Retourner deux cartes. Trouver les images pareilles.', items });
const isoler = () => ({ type: 'local', icone: '🏠', dit: 'Mettre la machine dans le local fermé.', retour: 'La machine est enfermée. Le bruit est plus faible pour tout le monde.' });

const etapes = [
  { nom: 'La machine', image: atelier, ecrans: [
    montre('Voici Yanis. Il travaille dans un atelier. La ponceuse fait beaucoup de bruit.', atelier),
    puzzle(atelier, 2, 1),
    choix('Toucher la machine qui fait du bruit.', [ponceuse, oreille, sommeil], 0, 'Oui. La ponceuse fait du bruit.'),
    puzzle(atelier, 3, 1),
    puzzle(atelier, 2, 2),
    choix('Toucher Yanis au travail.', [concert, atelier, sommeil], 1, 'Oui. Yanis travaille dans l’atelier.'),
    puzzle(atelier, 3, 2, 'pale'),
  ]},
  { nom: 'Le volume', image: sonFort, ecrans: [
    montre('Petite jauge : le son est faible. Grande jauge : le son est fort.', faible, fort),
    puzzle(sonFort, 2, 1),
    puzzle(sonFaible, 2, 1),
    choix('Toucher le son fort.', [faible, fort], 1, 'Oui. La grande jauge, c’est un son fort.'),
    bande('Placer le son faible, puis le son fort.', [faible, fort], 'nette', 'Faible, puis fort.'),
    puzzle(concert, 2, 2),
    choix('Toucher le concert. La musique est forte.', [casque, concert, oreille], 1, 'Oui. Au concert, le son est fort.'),
    tri('Ranger chaque image : son fort ou son faible.', [fort, faible], [[concert, 0], [ponceuse, 0], [calme, 1]], 'Le concert et la ponceuse font un son fort.'),
    puzzle(sonFort, 2, 2, 'pale'),
  ]},
  { nom: 'L’oreille', image: oreille, ecrans: [
    montre('Voici l’oreille. Le son entre dans l’oreille. Le tympan vibre.', schema),
    puzzle(oreille, 2, 1),
    puzzle(schema, 2, 2),
    choix('Toucher l’oreille.', [casque, oreille, pause], 1, 'Oui. L’oreille permet d’entendre.'),
    bande('Placer la machine, puis l’oreille.', [ponceuse, oreille], 'nette', 'Le bruit de la machine arrive à l’oreille.'),
    montre('Après un bruit fort, Yanis a mal aux oreilles. Il entend un sifflement.', atelier, sifflement),
    bande('Placer la machine, le son fort, puis Yanis qui a mal aux oreilles.', [ponceuse, sonFort, sifflement], 'pale', 'Le bruit fort fait mal aux oreilles.'),
    choix('Le soir, le bruit gêne. Toucher le sommeil.', [sommeil, casque], 0, 'Oui. Le bruit peut gêner le sommeil.'),
    paires([oreille, sonFort, ponceuse]),
    puzzle(schema, 3, 2, 'pale'),
  ]},
  { nom: 'Se protéger', image: casque, ecrans: [
    montre('Le casque antibruit protège les oreilles.', casque),
    puzzle(casque, 2, 1),
    puzzle(casque, 2, 2),
    choix('Toucher ce qui protège les oreilles.', [pause, casque, sonFort], 1, 'Oui. Le casque antibruit protège les oreilles.'),
    ombres([casque, oreille, pause]),
    bande('Placer la machine, puis le casque.', [ponceuse, casque], 'nette', 'Près de la machine, Yanis porte le casque.'),
    montre('Pour tout le monde : on enferme la machine dans un local. Le bruit est plus faible pour tous.', ponceuse),
    isoler(),
    choix('Baisser le volume. Toucher le son faible.', [fort, faible], 1, 'Oui. Baisser le volume protège les oreilles.'),
    choix('Faire une pause au calme. Toucher l’image du calme.', [concert, calme], 1, 'Oui. Une pause au calme repose les oreilles.'),
    paires([casque, pause, calme, sonFaible]),
  ]},
  { nom: 'Les défis', image: pause, ecrans: [
    puzzle(atelier, 3, 3, 'pale'),
    puzzle(casque, 3, 2, 'aucune'),
    bande('Placer la machine, le son fort, puis Yanis qui a mal aux oreilles.', [ponceuse, sonFort, sifflement], 'aucune', 'Le bruit fort fait mal aux oreilles.'),
    puzzle(schema, 3, 3, 'pale'),
    bande('Placer le son fort, puis le son faible.', [fort, faible], 'aucune', 'Le volume a baissé.'),
    paires([ponceuse, oreille, casque, sifflement]),
    puzzle(concert, 3, 3, 'aucune'),
    puzzle(atelier, 3, 3, 'aucune'),
    montre('Bravo. Le bruit fort abîme les oreilles. Pour se protéger : baisser le volume, faire une pause, porter le casque, enfermer la machine.', casque, pause, faible),
  ]},
];
/* Chaque étape se termine par le puzzle-récompense */
const ecrans = [];
etapes.forEach((e, n) => { e.ecrans.forEach(x => ecrans.push({ ...x, etape: n })); ecrans.push({ type: 'tresor', icone: '🎁', etape: n, dit: 'Bravo. Tu gagnes des pièces de l’image.' }); });

/* ---------- État ---------- */
const $ = id => document.getElementById(id);
const CLE = 'bruit-puzzle-v1';
let m = {}; try { m = JSON.parse(localStorage.getItem(CLE)) || {}; } catch {}
let pos = Math.min(ecrans.length - 1, Math.max(0, +m.pos || 0));
let faits = m.faits || {}, tresor = m.tresor || [], muet = !!m.muet, aideForte = !!m.aideForte;
const sauver = () => { try { localStorage.setItem(CLE, JSON.stringify({ pos, faits, tresor, muet, aideForte })); } catch {} };
const synth = window.speechSynthesis;
const stop = () => synth?.cancel();
function dire(t) { stop(); if (muet || !synth || !t) return; const u = new SpeechSynthesisUtterance(t); u.lang = 'fr-FR'; u.rate = 0.82; synth.speak(u); }
const melanger = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  if (b.length > 1 && b.every((x, i) => x === a[i])) b.push(b.shift()); return b; };
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

/* Un visuel : pictogramme, photo, morceau de photo ou jauge */
function vue(v) {
  if (v.jauge) { const s = el('span', 'jauge', v.jauge); s.setAttribute('aria-label', v.mot); return s; }
  if (v.crop) {
    const [x, y, w, h] = v.crop, d = el('span', 'crop');
    d.style.backgroundImage = `url("${DOSSIER}${v.src}")`;
    d.style.backgroundSize = `${100 / w}% ${100 / h}%`;
    d.style.backgroundPosition = `${x / (1 - w) * 100}% ${y / (1 - h) * 100}%`;
    d.style.aspectRatio = `${w * v.l} / ${h * v.h}`;
    d.setAttribute('role', 'img'); d.setAttribute('aria-label', v.mot); return d;
  }
  const i = new Image(); i.className = 'v'; i.src = DOSSIER + v.src; i.alt = v.mot; i.draggable = false; return i;
}
/* Un morceau d’image pour le puzzle */
function morceau(img, c, r, col, lig) {
  const d = el('span', 'crop');
  d.style.backgroundImage = `url("${DOSSIER}${img.src}")`;
  d.style.backgroundSize = `${c * 100}% ${r * 100}%`;
  d.style.backgroundPosition = `${c > 1 ? col / (c - 1) * 100 : 0}% ${r > 1 ? lig / (r - 1) * 100 : 0}%`;
  d.style.aspectRatio = `${img.l / c} / ${img.h / r}`;
  return d;
}

/* ---------- Glisser ou toucher ---------- */
let choisie = null;
function deplacable(btn, quand) {
  let depart = null, volant = null, survol = null;
  btn.addEventListener('pointerdown', ev => { if (btn.disabled) return; depart = { x: ev.clientX, y: ev.clientY }; btn.setPointerCapture(ev.pointerId); });
  btn.addEventListener('pointermove', ev => {
    if (!depart) return;
    if (!volant && Math.hypot(ev.clientX - depart.x, ev.clientY - depart.y) > 10) {
      volant = btn.cloneNode(true); volant.classList.add('volant'); volant.style.width = btn.offsetWidth + 'px'; document.body.append(volant);
      selectionner(btn);
    }
    if (volant) {
      volant.style.left = ev.clientX + 'px'; volant.style.top = ev.clientY + 'px';
      const c = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-cible]');
      if (survol !== c) { survol?.classList.remove('survol'); survol = c; c?.classList.add('survol'); }
    }
  });
  const fin = ev => {
    if (!depart) return; depart = null;
    if (volant) { volant.remove(); volant = null; survol?.classList.remove('survol');
      const c = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-cible]'); survol = null;
      if (c) quand(c); }
    else selectionner(btn);
  };
  btn.addEventListener('pointerup', fin);
  btn.addEventListener('pointercancel', () => { depart = null; volant?.remove(); volant = null; survol?.classList.remove('survol'); });
  btn.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectionner(btn); } });
}
function selectionner(btn) {
  document.querySelectorAll('.piece.choisie').forEach(b => b.classList.remove('choisie'));
  choisie = btn; btn.classList.add('choisie');
}
function secouer(b) { b.classList.remove('secoue'); void b.offsetWidth; b.classList.add('secoue'); }

/* ---------- Réussite ---------- */
function reussi(message) {
  faits[pos] = true; sauver();
  $('bravo').replaceChildren(el('span', null, '★ Bravo'));
  $('suivant').classList.add('pret');
  dessinerHoraire();
  setTimeout(() => dire(message || 'Bravo.'), 150);
}

/* ---------- Écrans ---------- */
function consigne(a) {
  const p = el('p', 'consigne'); const b = el('button', null, '🔊');
  b.setAttribute('aria-label', 'Écouter'); b.onclick = () => dire(a.dit);
  p.append(b, el('span', null, a.dit)); return p;
}

function ecranMontre(a, z) {
  const f = el('figure', 'vue' + ['', ' une', ' deux', ''][a.vues.length]);
  a.vues.forEach((v, i) => { if (i) f.append(el('span', 'fleche', a.vues.every(x => x.jauge) ? '' : '→')); f.append(vue(v)); });
  z.append(f); faits[pos] = true; sauver(); $('suivant').classList.add('pret');
}

/* Puzzle, bande et ombres : des pièces à poser sur des cases */
function ecranPlacer(a, z) {
  let pieces, cols, aide = a.aide;
  if (aideForte && aide !== 'ombre') aide = aide === 'aucune' ? 'pale' : 'nette';
  if (a.type === 'puzzle') {
    cols = a.c; pieces = [];
    for (let r = 0; r < a.r; r++) for (let c = 0; c < a.c; c++) pieces.push({ id: pieces.length, rendu: () => morceau(a.image, a.c, a.r, c, r) });
  } else {
    cols = a.items.length; pieces = a.items.map((v, i) => ({ id: i, rendu: () => vue(v) }));
  }
  const plateau = el('div', 'plateau' + (a.type === 'puzzle' ? '' : ' bande'));
  plateau.style.gridTemplateColumns = `repeat(${cols},1fr)`;
  if (a.type === 'puzzle') {
    const larg = Math.min(560, 560 * (a.image.l / a.image.h) * 0.62);
    plateau.style.width = `min(${larg}px, 100%)`;
  } else plateau.style.width = `min(${cols * 170}px, 100%)`;
  const ordreCases = a.melange ? melanger(pieces) : pieces;
  let erreurs = 0, restantes = pieces.length;
  ordreCases.forEach(p => {
    const c = el('button', 'case'); c.dataset.cible = p.id; c.setAttribute('aria-label', 'Case');
    const g = p.rendu(); g.classList.add({ nette: 'fantome', pale: 'pale', aucune: 'rien', ombre: 'ombre' }[aide]); c.append(g);
    c.onclick = () => { if (choisie) poser(choisie, c); };
    plateau.append(c);
  });
  const reserve = el('div', 'reserve');
  const largeurPiece = a.type === 'puzzle' ? Math.max(70, Math.min(150, 420 / Math.max(a.c, a.r))) : 120;
  melanger(pieces).forEach(p => {
    const b = el('button', 'piece'); b.dataset.piece = p.id; b.setAttribute('aria-label', 'Pièce');
    b.style.width = largeurPiece + 'px'; b.append(p.rendu());
    deplacable(b, cible => poser(b, cible));
    reserve.append(b);
  });
  function poser(b, caseEl) {
    if (caseEl.classList.contains('pleine') || !caseEl.closest('.plateau')) return;
    if (caseEl.dataset.cible !== b.dataset.piece) {
      erreurs++; secouer(b);
      if (erreurs >= 2) plateau.querySelector(`[data-cible="${b.dataset.piece}"]`)?.classList.add('indice');
      return;
    }
    plateau.querySelectorAll('.indice').forEach(x => x.classList.remove('indice'));
    caseEl.replaceChildren(b.firstChild); caseEl.classList.add('pleine'); caseEl.disabled = true;
    b.remove(); choisie = null; erreurs = 0; restantes--;
    if (!restantes) { plateau.classList.add('complet'); reserve.remove(); reussi(a.retour || 'Bravo. Le puzzle est fini.'); }
  }
  z.append(plateau, reserve);
}

function ecranChoix(a, z) {
  const zone = el('div', 'cartes'); let essais = 0;
  a.cartes.forEach((v, k) => {
    const b = el('button'); b.append(vue(v)); b.setAttribute('aria-label', v.mot);
    b.onclick = () => {
      if (faits[pos] && zone.dataset.fini) return;
      if (k === a.bonne) { zone.querySelectorAll('button').forEach(x => x.classList.remove('indice', 'attenue')); b.classList.add('bonne'); zone.dataset.fini = 1; reussi(a.retour); }
      else { essais++; b.classList.add('attenue'); secouer(b); zone.children[a.bonne].classList.add('indice'); dire('Regarder l’image entourée.'); }
    };
    zone.append(b);
  });
  z.append(zone);
}

function ecranTri(a, z) {
  const boites = el('div', 'boites'); let erreurs = 0, restantes = a.items.length;
  a.boites.forEach((v, n) => {
    const bt = el('button', 'boite'); bt.dataset.cible = n; bt.setAttribute('aria-label', v.mot);
    const t = el('div', 'tete'); t.append(vue(v)); bt.append(t, el('div', 'dedans'));
    bt.onclick = () => { if (choisie) poser(choisie, bt); };
    boites.append(bt);
  });
  const reserve = el('div', 'reserve');
  melanger(a.items).forEach(([v, n]) => {
    const b = el('button', 'piece'); b.style.width = '120px'; b.dataset.piece = n; b.append(vue(v)); b.setAttribute('aria-label', v.mot);
    deplacable(b, c => poser(b, c)); reserve.append(b);
  });
  function poser(b, boite) {
    if (!boite.classList.contains('boite')) return;
    if (boite.dataset.cible !== b.dataset.piece) { erreurs++; secouer(b); if (erreurs >= 2) boites.children[b.dataset.piece].classList.add('indice'); return; }
    boites.querySelectorAll('.indice').forEach(x => x.classList.remove('indice'));
    boite.querySelector('.dedans').append(b.firstChild); b.remove(); choisie = null; erreurs = 0;
    if (!--restantes) { reserve.remove(); reussi(a.retour); }
  }
  z.append(boites, reserve);
}

function ecranMemo(a, z) {
  const cartes = melanger([...a.items, ...a.items].map((v, i) => ({ v, id: a.items.indexOf(v) })));
  const g = el('div', 'memo'); g.style.gridTemplateColumns = `repeat(${cartes.length <= 6 ? 3 : 4},1fr)`;
  let ouvertes = [], trouvees = 0, bloque = false;
  cartes.forEach(c => {
    const b = el('button', 'dos'); b.append(vue(c.v)); b.setAttribute('aria-label', 'Carte');
    b.onclick = () => {
      if (bloque || !b.classList.contains('dos')) return;
      b.classList.remove('dos'); b.setAttribute('aria-label', c.v.mot); ouvertes.push([b, c]);
      if (ouvertes.length < 2) return;
      const [[b1, c1], [b2, c2]] = ouvertes; ouvertes = [];
      if (c1.id === c2.id) { b1.classList.add('trouve'); b2.classList.add('trouve'); trouvees++;
        if (trouvees === a.items.length) reussi('Bravo. Toutes les paires sont trouvées.'); else dire('Pareil.'); }
      else { bloque = true; setTimeout(() => { [b1, b2].forEach(x => { x.classList.add('dos'); x.setAttribute('aria-label', 'Carte'); }); bloque = false; }, 1100); }
    };
    g.append(b);
  });
  z.append(g);
}

function ecranLocal(a, z) {
  const local = el('button', 'local'); local.dataset.cible = 'local'; local.setAttribute('aria-label', 'Le local');
  const g = vue(ponceuse); g.classList.add('ombre'); g.style.opacity = '.18'; local.append(g);
  local.onclick = () => { if (choisie) poser(choisie); };
  const reserve = el('div', 'reserve');
  const b = el('button', 'piece'); b.style.width = '170px'; b.append(vue(ponceuse)); b.setAttribute('aria-label', 'La ponceuse');
  deplacable(b, c => { if (c === local) poser(b); }); reserve.append(b);
  function poser(p) { local.replaceChildren(p.firstChild); local.classList.add('ferme'); local.disabled = true; p.remove(); choisie = null;
    reserve.replaceChildren(vue(faible)); reserve.firstChild.style.width = '120px'; reussi(a.retour); }
  z.append(local, reserve);
}

function ecranTresor(a, z) {
  const avant = tresor.length;
  if (!tresor.includes(a.etape)) tresor.push(a.etape);
  const n = Math.round(9 * tresor.length / etapes.length), vus = Math.round(9 * avant / etapes.length);
  const t = el('div', 'tresor');
  for (let i = 0; i < 9; i++) {
    const d = el('div');
    if (i < n) { d.className = 'vu' + (i >= vus ? ' neuf' : ''); d.style.animationDelay = (i - vus) * 0.35 + 's';
      d.style.backgroundImage = `url("${DOSSIER}${casque.src}")`; d.style.backgroundSize = '300% 300%';
      d.style.backgroundPosition = `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`; }
    t.append(d);
  }
  z.append(t); reussi(n === 9 ? 'Bravo. L’image est complète !' : 'Bravo. Tu gagnes des pièces de l’image.');
}

/* ---------- Affichage ---------- */
function dessinerEtapes() {
  const e = ecrans[pos].etape, box = $('etapes'); box.replaceChildren();
  etapes.forEach((x, n) => { const s = el('span', n === e ? 'ici' : tresor.includes(n) ? 'fini' : '');
    s.style.backgroundImage = `url("${DOSSIER}${x.image.src}")`; s.title = x.nom; box.append(s); });
}
function dessinerHoraire() {
  const e = ecrans[pos].etape, h = $('horaire'); h.replaceChildren();
  ecrans.forEach((x, i) => { if (x.etape !== e) return; h.append(el('span', i === pos ? 'ici' : faits[i] ? 'fait' : '', x.icone)); });
}
function rendu() {
  stop(); choisie = null;
  const a = ecrans[pos], z = $('ecran'); z.replaceChildren();
  $('bravo').replaceChildren(); $('suivant').classList.remove('pret');
  if (a.type !== 'tresor') z.append(consigne(a));
  ({ montre: ecranMontre, puzzle: ecranPlacer, bande: ecranPlacer, choix: ecranChoix, tri: ecranTri, memo: ecranMemo, local: ecranLocal, tresor: ecranTresor })[a.type](a, z);
  dessinerEtapes(); dessinerHoraire();
  $('avant').disabled = pos === 0;
  if (a.type !== 'tresor') setTimeout(() => dire(a.dit), 250);
}
function aller(n) { pos = (n + ecrans.length) % ecrans.length; sauver(); rendu(); window.scrollTo(0, 0); }
$('avant').onclick = () => aller(pos - 1);
$('suivant').onclick = () => aller(pos + 1);
$('ecouter').onclick = () => dire(ecrans[pos].dit);
function modeVoix() { $('muet').textContent = muet ? '🔇' : '🗣️'; $('muet').setAttribute('aria-pressed', String(muet)); }
$('muet').onclick = () => { stop(); muet = !muet; modeVoix(); sauver(); };

/* Réglages pour l’adulte */
function reglages() {
  const r = $('reglages'); r.replaceChildren();
  etapes.forEach((e, n) => { const b = el('button', null, 'Étape ' + (n + 1) + ' : ' + e.nom);
    b.onclick = () => aller(ecrans.findIndex(x => x.etape === n)); r.append(b); });
  const aide = el('button', null, 'Aide forte : ' + (aideForte ? 'oui' : 'non'));
  aide.onclick = () => { aideForte = !aideForte; sauver(); reglages(); rendu(); };
  const zero = el('button', null, 'Tout recommencer');
  zero.onclick = () => { if (confirm('Effacer la progression de cette tablette ?')) { faits = {}; tresor = []; aller(0); } };
  r.append(aide, zero);
}
window.addEventListener('pagehide', stop);
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
modeVoix(); reglages(); rendu();
