/* Entraînement libre aux notions déjà rencontrées dans le parcours. */
(function () {
  'use strict';
  var mots = [
    ['DANGER', 'Ce qui peut causer une blessure ou une maladie.'],
    ['DOMMAGE', 'La blessure ou l’atteinte à la santé.'],
    ['COUPURE', 'La blessure que peut faire une lame.'],
    ['BRÛLURE', 'La blessure que peut causer une plaque très chaude.'],
    ['ENTORSE', 'Une blessure possible quand on se tord la cheville.'],
    ['COUTEAU', 'L’outil à lame utilisé pour couper les carottes.'],
    ['OPÉRATEUR', 'La personne qui réalise le travail.'],
    ['PRÉVENTION', 'Les actions pour éviter les accidents ou limiter leurs effets.']
  ];
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var index = 0, essayees = new Set(), revele = false;
  function sansAccent(mot) { return mot.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

  window.CDO_JEU_MOTS = {
    rendre: function (vue) {
      var audio = window.CDO_AUDIO;
      var mot = mots[index][0], indice = mots[index][1], lettres = sansAccent(mot);
      vue.innerHTML = '<section class="cdo-bloc-grand cdo-jeu-mots">' +
        '<h1>Mot en lumière</h1><p>Choisir des lettres pour trouver le mot.</p>' +
        '<p class="cdo-jeu-indice" data-lire>' + audio.bouton(indice) + '<span>' + indice + '</span></p>' +
        '<div class="cdo-jeu-cases" aria-label="Lettres du mot"></div>' +
        '<p role="status" class="cdo-jeu-message"></p>' +
        '<div class="cdo-jeu-clavier" aria-label="Choisir une lettre"></div>' +
        '<div class="cdo-jeu-actions"><button type="button" class="cdo-btn-second" data-solution>Voir le mot</button>' +
        '<button type="button" class="cdo-btn" data-mot-suivant>Mot suivant →</button></div></section>';

      var cases = vue.querySelector('.cdo-jeu-cases');
      var clavier = vue.querySelector('.cdo-jeu-clavier');
      var message = vue.querySelector('.cdo-jeu-message');
      var solution = vue.querySelector('[data-solution]');
      var suivant = vue.querySelector('[data-mot-suivant]');
      function afficher() {
        var trouve = Array.from(lettres).every(function (l) { return essayees.has(l); });
        cases.innerHTML = Array.from(mot).map(function (l, i) {
          var visible = revele || essayees.has(lettres[i]);
          return '<span class="' + (visible ? 'allumee' : '') + '">' + (visible ? l : '·') + '</span>';
        }).join('');
        cases.setAttribute('aria-label', 'Mot : ' + Array.from(mot).map(function (l, i) {
          return revele || essayees.has(lettres[i]) ? l : 'lettre cachée';
        }).join(', '));
        if (trouve || revele) {
          message.textContent = trouve ? '✓ Mot trouvé : ' + mot : 'Le mot : ' + mot;
          Array.from(clavier.children).forEach(function (b) { b.disabled = true; });
          solution.disabled = true;
          suivant.focus();
        }
      }
      alphabet.forEach(function (lettre) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = lettre;
        b.disabled = essayees.has(lettre);
        b.onclick = function () {
          essayees.add(lettre);
          b.disabled = true;
          message.textContent = lettres.includes(lettre) ? '✓ ' + lettre + ' est dans le mot.' : lettre + ' n’est pas dans le mot. Réessayer.';
          var prochain = b.nextElementSibling;
          while (prochain && prochain.disabled) prochain = prochain.nextElementSibling;
          (prochain || clavier.querySelector('button:not(:disabled)') || solution).focus();
          afficher();
        };
        clavier.appendChild(b);
      });
      solution.onclick = function () { revele = true; afficher(); };
      suivant.onclick = function () {
        audio.arreter();
        index = (index + 1) % mots.length;
        essayees.clear();
        revele = false;
        window.CDO_JEU_MOTS.rendre(vue);
        var titre = vue.querySelector('h1');
        titre.tabIndex = -1;
        titre.focus();
      };
      afficher();
    }
  };
})();
