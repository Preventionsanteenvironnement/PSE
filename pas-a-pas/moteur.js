'use strict';
/* Français pas à pas — moteur commun.
   Une seule page (index.html). Navigation par l'adresse :
     #/            accueil (les espaces)
     #/e/<espace>  les exercices d'un espace
     #/x/<id>      un exercice
   Principe : chaque élément se touche pour l'entendre ; un 2e toucher l'ouvre.
   Rien n'est envoyé : la progression (étoiles) reste sur l'appareil. */
(function () {
  const { ESPACES, EXERCICES } = window.PAP;
  const app = document.getElementById('app');
  const CLE = 'pas-a-pas-v1';

  /* ---------- Voix ---------- */
  let voixFr = null;
  function choisirVoix() {
    if (!('speechSynthesis' in window)) return;
    const v = speechSynthesis.getVoices().filter(x => /^fr(-|_|$)/i.test(x.lang));
    voixFr = v.find(x => /fr-FR/i.test(x.lang) && x.localService) || v.find(x => /fr-FR/i.test(x.lang)) || v[0] || null;
  }
  if ('speechSynthesis' in window) { choisirVoix(); speechSynthesis.onvoiceschanged = choisirVoix; }
  let derniereConsigne = '';
  function dire(texte, ensuite) {
    if (!('speechSynthesis' in window) || !texte) { if (ensuite) setTimeout(ensuite, 300); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texte);
    u.lang = 'fr-FR'; u.rate = 0.85;
    if (voixFr) u.voice = voixFr;
    if (ensuite) { let fait = false; const fin = () => { if (!fait) { fait = true; ensuite(); } }; u.onend = fin; setTimeout(fin, 600 + texte.length * 110); }
    speechSynthesis.speak(u);
  }
  function consigne(texte) { derniereConsigne = texte; dire(texte); }

  /* ---------- Progression locale ---------- */
  function lire() { try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; } }
  function etoile(id) { const p = lire(); p[id] = 1; try { localStorage.setItem(CLE, JSON.stringify(p)); } catch (e) { /* stockage indisponible */ } }
  const fait = (id) => !!lire()[id];

  /* ---------- Outils ---------- */
  const melange = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const el = (tag, cls, attrs) => { const n = document.createElement(tag); if (cls) n.className = cls; if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
  const ICONES = {
    maison: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/></svg>',
    retour: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    haut: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 5V5L8 10zm12.5 2A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
    go: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16l13-8z"/></svg>',
    etoile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z"/></svg>',
    encore: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>',
    suivant: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    oui: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    non: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
    lien: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14zM5 5h6v2H7v10h10v-4h2v6H5z"/></svg>'
  };
  const TYPE_ICONE = { ecoute: 'haut', choix: 'go', paires: 'encore', tri: 'oui', ordre: 'suivant', intrus: 'non', lien: 'lien' };

  function barre(retourHref, retourMot) {
    const b = el('div', 'barre');
    const r = el('a', 'rond', { href: retourHref, 'aria-label': retourMot });
    r.innerHTML = retourHref === '../index.html' || retourHref.startsWith('#/e/') ? ICONES.retour : ICONES.maison;
    r.addEventListener('pointerdown', () => dire(retourMot));
    const s = el('button', 'rond haut', { type: 'button', 'aria-label': 'Écouter encore' });
    s.innerHTML = ICONES.haut;
    s.addEventListener('click', () => dire(derniereConsigne));
    b.append(r, s);
    return b;
  }
  function imageDe(item, cls) {
    const f = el('span', 'vignette ' + (cls || ''));
    if (item.img) { const i = el('img', '', { src: item.img, alt: '', draggable: 'false' }); f.append(i); }
    else if (item.signe) { f.classList.add('signe-' + item.signe); f.innerHTML = ICONES[item.signe]; }
    return f;
  }

  /* Tuile « toucher = entendre, 2e toucher = ouvrir » */
  let selection = null;
  function tuileNav(item, href, extra) {
    const a = el('a', 'tuile', { href, 'aria-label': item.mot });
    a.append(imageDe(item));
    if (extra) a.append(extra);
    const go = el('span', 'tuile-go', { 'aria-hidden': 'true' }); go.innerHTML = ICONES.go; a.append(go);
    a.addEventListener('click', (ev) => {
      if (selection !== a) {
        ev.preventDefault();
        if (selection) selection.classList.remove('choisie');
        selection = a; a.classList.add('choisie');
        dire(item.mot);
      } else if (href.startsWith('#')) { ev.preventDefault(); location.hash = href.slice(1); }
    });
    a.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); selection = a; if (href.startsWith('#')) location.hash = href.slice(1); else location.href = href; } });
    return a;
  }

  /* ---------- Écrans ---------- */
  function accueil() {
    selection = null;
    app.innerHTML = '';
    app.append(barre('../index.html', 'Retour au site'));
    const g = el('div', 'grille grande');
    ESPACES.forEach(e => {
      const liste = EXERCICES.filter(x => x.espace === e.id);
      if (!liste.length) return; // espace vide : pas encore affiché
      const n = liste.filter(x => fait(x.id)).length;
      const badge = el('span', 'compte', { 'aria-hidden': 'true' });
      badge.innerHTML = ICONES.etoile + '<b>' + n + '/' + liste.length + '</b>';
      g.append(tuileNav(e, '#/e/' + e.id, badge));
    });
    app.append(g);
    consigne('Bonjour. Touche une image pour l’écouter. Touche encore pour commencer.');
  }

  function espace(id) {
    selection = null;
    const e = ESPACES.find(x => x.id === id); if (!e) return accueil();
    app.innerHTML = '';
    app.append(barre('#/', 'Accueil'));
    const g = el('div', 'grille');
    EXERCICES.filter(x => x.espace === id).forEach(x => {
      const deco = el('span', 'coin', { 'aria-hidden': 'true' });
      deco.innerHTML = ICONES[TYPE_ICONE[x.type]] + (fait(x.id) ? '<i class="ok">' + ICONES.etoile + '</i>' : '');
      g.append(tuileNav(x, x.type === 'lien' ? x.href : '#/x/' + x.id, deco));
    });
    app.append(g);
    consigne(e.mot + '. Touche une image pour l’écouter. Touche encore pour commencer.');
  }

  function exercice(id) {
    const x = EXERCICES.find(e => e.id === id); if (!x) return accueil();
    app.innerHTML = '';
    app.append(barre('#/e/' + x.espace, 'Retour'));
    const zone = el('div', 'zone'); app.append(zone);
    const fin = () => bravo(x);
    ({ ecoute, choix, paires, tri, ordre, intrus })[x.type](x, zone, fin);
  }

  function bravo(x) {
    etoile(x.id);
    const z = app.querySelector('.zone'); z.innerHTML = '';
    const s = el('div', 'bravo', { 'aria-hidden': 'true' }); s.innerHTML = ICONES.etoile; z.append(s);
    const liste = EXERCICES.filter(e => e.espace === x.espace && e.type !== 'lien');
    const suivant = liste[liste.indexOf(x) + 1];
    const actions = el('div', 'actions');
    const encore = el('button', 'gros', { type: 'button', 'aria-label': 'Recommencer' }); encore.innerHTML = ICONES.encore;
    encore.addEventListener('click', () => exercice(x.id));
    actions.append(encore);
    if (suivant) {
      const n = el('button', 'gros vert', { type: 'button', 'aria-label': 'Exercice suivant' }); n.innerHTML = ICONES.suivant;
      n.addEventListener('click', () => { location.hash = '/x/' + suivant.id; });
      actions.append(n);
    }
    z.append(actions);
    consigne('Bravo ! Tu as gagné une étoile.');
  }

  function carte(item, cls) {
    const b = el('button', 'carte ' + (cls || ''), { type: 'button', 'aria-label': item.mot });
    b.append(imageDe(item));
    return b;
  }
  const secoue = (b) => { b.classList.remove('faux'); void b.offsetWidth; b.classList.add('faux'); };

  /* 1. J'écoute : toucher chaque image */
  function ecoute(x, zone, fin) {
    const g = el('div', 'grille cartes'); zone.append(g);
    const entendus = new Set();
    x.items.forEach((it, i) => {
      const b = carte(it);
      if (x.montreMot) { const m = el('span', 'mot'); m.textContent = it.mot; b.append(m); }
      b.addEventListener('click', () => {
        entendus.add(i); b.classList.add('vu');
        dire(it.mot, entendus.size === x.items.length ? () => setTimeout(fin, 400) : null);
      });
      g.append(b);
    });
    consigne('Touche chaque image. Écoute. Répète.');
  }

  /* 2. J'entends, je touche la bonne image */
  function choix(x, zone, fin) {
    const cibles = melange(x.items).slice(0, x.tours || x.items.length);
    let t = 0;
    const pts = points(zone, cibles.length);
    const g = el('div', 'grille cartes trois'); zone.append(g);
    function tour() {
      g.innerHTML = '';
      const cible = cibles[t];
      const autres = melange(x.items.filter(i => i !== cible)).slice(0, 2);
      melange([cible, ...autres]).forEach(it => {
        const b = carte(it);
        b.addEventListener('click', () => {
          if (it === cible) {
            b.classList.add('bon'); pts.marque(t); g.classList.add('bloque');
            dire('Oui ! ' + it.mot, () => { g.classList.remove('bloque'); t++; t < cibles.length ? tour() : fin(); });
          } else { secoue(b); dire('Non. Ça, c’est : ' + it.mot + '. Touche : ' + cible.mot); }
        });
        g.append(b);
      });
      consigne('Touche : ' + cible.mot);
    }
    tour();
  }

  /* 3. Memory : trouver les paires */
  function paires(x, zone, fin) {
    const jeu = melange(x.items.concat(x.items));
    const g = el('div', 'grille cartes memo'); zone.append(g);
    let ouvertes = [], trouvees = 0, verrou = false;
    jeu.forEach(it => {
      const b = el('button', 'carte dos', { type: 'button', 'aria-label': 'Carte cachée' });
      b.append(imageDe(it));
      b.addEventListener('click', () => {
        if (verrou || !b.classList.contains('dos')) return;
        b.classList.remove('dos'); b.setAttribute('aria-label', it.mot); dire(it.mot);
        ouvertes.push([b, it]);
        if (ouvertes.length === 2) {
          const [[b1, i1], [b2, i2]] = ouvertes; ouvertes = [];
          if (i1 === i2) {
            b1.classList.add('bon'); b2.classList.add('bon'); trouvees++;
            if (trouvees === x.items.length) setTimeout(() => dire('Bravo !', fin), 700);
          } else {
            verrou = true;
            setTimeout(() => { [b1, b2].forEach(c => { c.classList.add('dos'); c.setAttribute('aria-label', 'Carte cachée'); }); verrou = false; }, 1300);
          }
        }
      });
      g.append(b);
    });
    consigne('Retourne deux cartes. Trouve les images pareilles.');
  }

  /* 4. Trier : une image à la fois, la mettre dans la bonne boîte */
  function tri(x, zone, fin) {
    const file = melange(x.items); let t = 0;
    const pts = points(zone, file.length);
    const scene = el('div', 'scene'); zone.append(scene);
    const boites = el('div', 'boites'); zone.append(boites);
    const elsBoites = x.boites.map(bx => {
      const b = el('button', 'boite', { type: 'button', 'aria-label': bx.mot });
      b.append(imageDe(bx, 'tete')); const dedans = el('span', 'dedans'); b.append(dedans);
      boites.append(b); return { bx, b, dedans };
    });
    function tour() {
      scene.innerHTML = '';
      const it = file[t];
      const c = carte(it, 'seule'); c.addEventListener('click', () => dire(it.mot)); scene.append(c);
      consigne(it.mot + '. Où va cette image ?');
    }
    elsBoites.forEach(({ bx, b, dedans }) => b.addEventListener('click', () => {
      const it = file[t]; if (!it) return;
      if (it.groupe === bx.groupe) {
        const v = imageDe(it, 'mini'); dedans.append(v); pts.marque(t); t++;
        dire('Oui ! ' + bx.mot, () => (t < file.length ? tour() : fin()));
        scene.innerHTML = '';
      } else { secoue(b); dire('Non. ' + bx.mot + '. Essaie encore.'); }
    }));
    tour();
  }

  /* 5. Remettre dans l'ordre */
  function ordre(x, zone, fin) {
    const cases = el('div', 'cases'); zone.append(cases);
    const slots = x.items.map((_, i) => { const s = el('span', 'case'); s.innerHTML = '<b>' + (i + 1) + '</b>'; cases.append(s); return s; });
    const g = el('div', 'grille cartes trois'); zone.append(g);
    let t = 0;
    melange(x.items).forEach(it => {
      const b = carte(it);
      b.addEventListener('click', () => {
        if (b.classList.contains('pose')) return;
        if (it === x.items[t]) {
          slots[t].append(imageDe(it, 'mini')); b.classList.add('pose'); t++;
          dire(t + '. ' + it.mot, t === x.items.length ? () => setTimeout(fin, 300) : null);
        } else { secoue(b); dire(it.mot + '. Pas encore.'); }
      });
      g.append(b);
    });
    consigne(x.mot + ' Touche les images dans l’ordre : 1, 2, 3.');
  }

  /* 6. Trouver l'intrus */
  function intrus(x, zone, fin) {
    const n = x.tours || 5; let t = 0;
    const pts = points(zone, n);
    const g = el('div', 'grille cartes quatre'); zone.append(g);
    function tour() {
      g.innerHTML = '';
      const [ga, gb] = melange(x.groupes).slice(0, 2);
      const intru = melange(gb)[0];
      melange(melange(ga).slice(0, 3).concat([intru])).forEach(it => {
        const b = carte(it);
        b.addEventListener('click', () => {
          if (it === intru) {
            b.classList.add('bon'); pts.marque(t); g.classList.add('bloque');
            dire('Oui ! ' + it.mot + ' n’est pas de la même famille.', () => { g.classList.remove('bloque'); t++; t < n ? tour() : fin(); });
          } else { secoue(b); dire(it.mot + '. Cherche encore.'); }
        });
        g.append(b);
      });
      consigne('Une image n’est pas de la même famille. Touche-la.');
    }
    tour();
  }

  function points(zone, n) {
    const p = el('div', 'points', { 'aria-hidden': 'true' });
    const ds = Array.from({ length: n }, () => { const d = el('i'); p.append(d); return d; });
    zone.append(p);
    return { marque: (i) => ds[i] && ds[i].classList.add('plein') };
  }

  /* ---------- Routeur ---------- */
  function route() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    const h = location.hash.replace(/^#/, '');
    let m;
    if ((m = h.match(/^\/e\/([\w-]+)$/))) espace(m[1]);
    else if ((m = h.match(/^\/x\/([\w-]+)$/))) exercice(m[1]);
    else accueil();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
