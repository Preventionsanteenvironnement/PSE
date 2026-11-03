/* Parcours illustré : trois parties, aides et petits bilans, sans note de déclaration. */
(function () {
  'use strict';
  var A = window.CDO_AUDIO, D = window.CDO_DONNEES, esc = window.CDO_EX.esc;
  function lire(tag, texte, cls) {
    return '<' + tag + (cls ? ' class="' + cls + '"' : '') + ' data-lire>' + A.bouton(texte) + '<span>' + esc(texte) + '</span></' + tag + '>';
  }
  function bouton(action, texte, second) {
    return '<button type="button" class="' + (second ? 'cdo-btn-second' : 'cdo-btn') + '" data-guide="' + action + '"><span>' + esc(texte) + '</span>' + A.interne(texte) + '</button>';
  }
  function image(src, alt) { return src ? '<figure class="guide-image"><img width="1536" height="1024" decoding="async" src="' + esc(src) + '" alt="' + esc(alt || '') + '"></figure>' : ''; }
  function cartes(items) {
    return '<div class="guide-cartes">' + items.map(function (c) {
      return '<article' + (c.frise ? ' class="guide-carte-frise"' : '') + '>' + (c.frise ? etapes(c.frise) : image(c.image, c.alt)) + lire('p', c.texte) + '</article>';
    }).join('') + '</div>';
  }
  function etapes(liste) { return '<ol class="guide-frise" aria-label="Étapes dans l’ordre">' + liste.map(function (t) { return '<li data-lire>' + A.bouton(t) + '<span>' + esc(t) + '</span></li>'; }).join('') + '</ol>'; }
  function etat(e) { e.guide = e.guide || {}; e.guide.bilans = e.guide.bilans || {}; return e.guide; }
  function pret(s, e) { var g = etat(e); return s.guide.pages.filter(function (p) { return p.resume; }).every(function (p) { return g.bilans[p.id] === true; }); }
  function recapitulatif(s) {
    return '<section class="guide-recap">' + lire('h2', 'Avant l’épreuve : les repères essentiels') + cartes([
      {image:'img/comprendre/buffet.png',alt:'Un buffet prêt à servir.',texte:'Un projet du métier, avec plusieurs matières.'},
      {frise:['1re année','2e année'],texte:'Un travail personnel, étape par étape.'},
      {image:'img/comprendre/oral.png',alt:'Un candidat devant deux enseignants.',texte:'Une moitié pour la formation, une moitié pour l’oral de 10 minutes.'}
    ]) + '</section>';
  }
  function rendre(z, s, e) {
    var g = etat(e), pages = s.guide.pages;
    var index = Math.max(0, Math.min(pages.length - 1, Number(g.position) || 0));
    var mode = g.pause === pages[index].id ? 'enseignant' : 'lecture';
    function sauver() { g.position = index; D.enregistrer(); }
    function avancer() { if (index < pages.length - 1) { index++; mode = 'lecture'; sauver(); afficher(); } }
    function entete(c) {
      return '<div class="guide-entete">' + lire('p', 'Partie ' + c.partie + ' sur 3 · ' + s.guide.parties[c.partie - 1], 'guide-partie') +
        '<p class="cdo-compteur">Repère ' + (index + 1) + ' sur ' + pages.length + '</p></div>';
    }
    function contenu(c) {
      if (c.resume) return cartes(c.items);
      return (c.parcoursDeuxAns ? cartes([{image:'img/comprendre/livret.png',alt:'Créer un livret.',texte:'1re année · Commencer le travail'},{image:'img/comprendre/oral.png',alt:'Présenter le travail.',texte:'2e année · Poursuivre, puis présenter à l’oral'}]) : c.repartition ? '' : image(c.image, c.alt)) + (c.frise && !c.parcoursDeuxAns ? etapes(c.frise) : '') +
        (c.repartition ? cartes([{image:'img/comprendre/equipe.png',alt:'Le travail réalisé pendant la formation.',texte:'50 % · Travail pendant la formation'},{image:'img/comprendre/oral.png',alt:'La présentation orale.',texte:'50 % · Oral final'}]) : '') +
        lire('p', c.texte, 'guide-texte') + (c.precision ? lire('p', c.precision, 'guide-texte') : '') + (c.etiquettes ? '<div class="guide-etiquettes">' + c.etiquettes.map(function (t) { return lire('p', t); }).join('') + '</div>' : '');
    }
    function question(c) {
      return '<section class="guide-question">' + lire('h2', c.question.question) + '<div class="cdo-choix">' + c.question.choix.map(function (t, i) {
        return '<button type="button" class="cdo-carte" data-guide-reponse="' + i + '" aria-pressed="false"><span>' + esc(t) + '</span>' + A.interne(t) + '</button>';
      }).join('') + '</div><div class="guide-retour" aria-live="polite"></div></section>';
    }
    function afficher() {
      A.arreter();
      var c = pages[index];
      if (g.pause === c.id && mode === 'lecture') mode = 'enseignant';
      var corps = entete(c) + lire('h1', c.titre);
      if (mode === 'enseignant') {
        corps += image('img/comprendre/aide.png', 'Une enseignante reprend une image avec un élève.') +
          lire('h2', 'Une explication avec l’enseignant') + lire('p', 'Demander une explication à l’enseignant présent dans la salle. Le parcours reste sur ce repère.') +
          bouton('reprendre', 'Reprendre le repère');
      } else if (mode === 'reformulation') {
        corps += lire('h2', 'Autre explication') + (c.aideImage ? image(c.aideImage, c.aideAlt) : cartes(c.items)) + (c.frise ? etapes(c.frise) : '') + lire('p', c.aide, 'guide-texte') +
          bouton('verifier', 'Vérifier avec un exemple') + bouton('aide', 'J’ai besoin d’aide', true) + bouton('lecture', 'Revoir le repère', true);
      } else if (mode === 'question') {
        // Le bilan garde son récapitulatif illustré avant la question.
        corps += (c.resume ? cartes(c.items) : image(c.aideImage, c.aideAlt)) + question(c) + bouton('aide', 'J’ai besoin d’aide', true);
      } else {
        corps += contenu(c) + '<div class="guide-accompagnement">' + bouton('compris', 'J’ai compris') + bouton('reformuler', 'Je n’ai pas compris', true) + bouton('aide', 'J’ai besoin d’aide', true) + '</div>';
      }
      corps += '<nav class="guide-navigation" aria-label="Navigation entre repères">' + (index && mode !== 'enseignant' ? bouton('precedent', 'Repère précédent', true) : '') + '</nav>';
      z.innerHTML = '<div class="guide-conteneur" data-guide-page="' + esc(c.id) + '" data-guide-mode="' + mode + '">' + corps + '</div>';
      var titre = z.querySelector('h1'); if (titre) { titre.tabIndex = -1; titre.focus({preventScroll:true}); }
      window.scrollTo(0, 0);
    }
    z.onclick = function (ev) {
      if (ev.target.closest('.cdo-son')) return;
      var c = pages[index], choix = ev.target.closest('[data-guide-reponse]');
      if (choix) {
        var bon = +choix.dataset.guideReponse === c.question.bonne;
        g.essais = g.essais || {}; g.essais[c.id] = (g.essais[c.id] || 0) + 1;
        if (bon && c.resume) g.bilans[c.id] = true;
        sauver(); A.arreter();
        z.querySelectorAll('[data-guide-reponse]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === choix)); b.classList.toggle('pris', b === choix); b.disabled = true; });
        var retour = z.querySelector('.guide-retour');
        retour.innerHTML = lire('p', bon ? 'Réponse correcte.' : 'Réponse à revoir.') +
          (bon ? '' : lire('p', 'Réponse attendue : ' + c.question.choix[c.question.bonne])) + lire('p', c.question.explication) +
          (bon ? (index === pages.length - 1 ? '<a class="cdo-btn" href="#seance/' + s.id + '/2">S’exercer</a><a class="cdo-btn-second" href="#seance/' + s.id + '/3">Voir le récapitulatif avant l’épreuve</a>' : bouton('suivant', 'Continuer')) : bouton('reessayer', 'Réessayer') + bouton('reformuler', 'Revoir une explication', true));
        return;
      }
      var b = ev.target.closest('[data-guide]'); if (!b) return;
      var action = b.dataset.guide; A.arreter();
      if (action === 'compris') {
        g.declarations = g.declarations || {}; g.declarations[c.id] = 'compris'; sauver();
        if (c.resume) { mode = 'question'; afficher(); } else avancer();
      } else if (action === 'suivant') avancer();
      else if (action === 'precedent') { index = Math.max(0, index - 1); mode = 'lecture'; sauver(); afficher(); }
      else if (action === 'reformuler') { mode = 'reformulation'; afficher(); }
      else if (action === 'verifier' || action === 'reessayer') { mode = 'question'; afficher(); }
      else if (action === 'lecture' || action === 'reprendre') { if (action === 'reprendre') delete g.pause; mode = 'lecture'; sauver(); afficher(); }
      else if (action === 'aide') {
        g.demandesAide = g.demandesAide || []; g.demandesAide.push({repere:c.id,titre:c.titre,date:new Date().toISOString()});
        g.pause = c.id; mode = 'enseignant'; sauver(); afficher();
      }
    };
    afficher();
  }
  window.CDO_GUIDE = { rendre:rendre, pret:pret, recapitulatif:recapitulatif };
})();
