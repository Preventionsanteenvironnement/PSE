/* Réussir l'épreuve PSE Bac Pro — dessin des diagrammes à partir de donnees.js */
(function () {
  "use strict";
  var D = window.EPREUVE_DONNEES;
  if (!D) return;

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  // Barres horizontales. valeur : nombre affiché ; largeur : part de la piste (0 à 100).
  function barres(id, lignes) {
    var zone = document.getElementById(id);
    if (!zone) return;
    lignes.forEach(function (l) {
      var b = el("div", "barre");
      b.appendChild(el("span", "lib", l.lib));
      var piste = el("div", "piste");
      var large = l.largeur >= 30;
      var r = el("div", "rempli", large ? l.valeur : "");
      r.style.width = Math.max(0, Math.min(100, l.largeur)) + "%";
      piste.appendChild(r);
      if (!large) piste.appendChild(el("span", "val-dehors", l.valeur));
      piste.setAttribute("role", "img");
      piste.setAttribute("aria-label", l.lib + " : " + l.dit);
      b.appendChild(piste);
      zone.appendChild(b);
    });
  }

  function surVingt(liste, cle) {
    return liste.map(function (x) {
      return { lib: x[cle], valeur: x.sujets + " / " + D.sujets, largeur: x.sujets / D.sujets * 100,
               dit: "présent dans " + x.sujets + " sujets sur " + D.sujets };
    });
  }

  barres("bar-verbes", surVingt(D.verbes, "verbe"));
  barres("bar-notions-p2", surVingt(D.notionsPartie2, "notion"));
  barres("bar-notions-p1", surVingt(D.notionsPartie1, "notion"));
  barres("bar-copies", D.copies.taches.map(function (t) {
    var sur10 = Math.round(t.maitrise / 10);
    return { lib: t.tache, valeur: "≈ " + sur10 + " / 10", largeur: t.maitrise,
             dit: "environ " + sur10 + " réponses sur 10 au niveau maîtrisé" };
  }));

  // Anneau des compétences
  var an = document.getElementById("anneau-comp");
  var lg = document.getElementById("leg-comp");
  if (an && lg) {
    var couleurs = ["#3730a3", "#0f766e", "#b45309", "#be185d"];
    var debut = 0, parts = [];
    D.competences.forEach(function (c, i) {
      parts.push(couleurs[i] + " " + debut + "% " + (debut + c.part) + "%");
      debut += c.part;
      var li = el("li");
      var p = el("span", "pastille"); p.style.background = couleurs[i];
      li.appendChild(p);
      li.appendChild(el("span", null, c.code + " — " + c.nom));
      li.appendChild(el("b", null, "≈ " + c.part + " %"));
      lg.appendChild(li);
    });
    an.style.background = "conic-gradient(" + parts.join(", ") + ")";
    an.setAttribute("role", "img");
    an.setAttribute("aria-label", D.competences.map(function (c) { return c.code + " environ " + c.part + " pour cent"; }).join(", "));
  }

  // Chiffres placés dans le texte : <span data-d="questions.moyenne"></span>
  Array.prototype.forEach.call(document.querySelectorAll("[data-d]"), function (n) {
    var v = n.getAttribute("data-d").split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, D);
    if (v != null) n.textContent = v;
  });
})();
