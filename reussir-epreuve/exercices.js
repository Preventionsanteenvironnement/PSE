/* Réussir l'épreuve PSE Bac Pro — exercices interactifs.
   Moteur de la ludothèque de l'Atelier PSE (moteur/jeux-core.js, moteur/jeux-ecran.js) :
   chaque <script type="application/json" class="jeu"> est joué dans le bloc qui le suit. */
(function () {
  "use strict";
  var J = window.PSE_JEUX, E = window.PSE_JEUX_ECRAN;
  if (!J || !E) return;
  var st = document.createElement("style");
  st.textContent = J.CSS + "\n" + E.CSS +
    "\n.jxe{font-family:inherit;font-size:16px}.jxe h2{font-size:1.05rem;color:#3730a3}.jxe-b{border-color:#3730a3;background:#3730a3}.jxe-b.second{color:#3730a3;background:#fff}" +
    "\n.jxe-relier table{width:100%}.jxe select{max-width:100%}.jxe-tab{width:100%}.jxe-tab td,.jxe-tab th{font-size:.92rem}" +
    // Classer : le nom de la catégorie en toutes lettres sur chaque bouton, plutôt que sa lettre.
    "\n.jxe-cats{flex-wrap:wrap}.jxe-cats button{font-size:0;padding:6px 10px}.jxe-cats button::after{content:attr(title);font-size:14px}.jxe-bulles+.jxe-aide{display:none}";
  document.head.appendChild(st);
  Array.prototype.forEach.call(document.querySelectorAll("script.jeu"), function (s) {
    var zone = document.createElement("div");
    zone.className = "exo";
    s.parentNode.insertBefore(zone, s.nextSibling);
    try { E.monter(zone, JSON.parse(s.textContent)); }
    catch (e) { zone.textContent = "Exercice indisponible."; }
  });
})();
