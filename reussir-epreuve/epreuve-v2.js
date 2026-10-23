/* Réussir l'épreuve PSE Bac Pro — navigation v2 (mapse.fr)
   Ajoute une barre de progression de lecture et un sommaire qui reste en haut.
   Ne modifie aucun texte : le sommaire reprend les titres des sections de la page. */
(function () {
  "use strict";

  // Barre de progression de lecture
  var barre = document.createElement("div");
  barre.className = "v2-progres";
  barre.setAttribute("aria-hidden", "true");
  barre.appendChild(document.createElement("i"));
  document.body.appendChild(barre);
  function progres() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    barre.firstChild.style.width = (h > 0 ? Math.min(100, window.scrollY / h * 100) : 0) + "%";
  }
  window.addEventListener("scroll", progres, { passive: true });
  window.addEventListener("resize", progres);
  progres();

  // Sommaire : celui de la page s'il existe, sinon construit à partir des titres des sections
  var sommaire = document.querySelector(".pastilles");
  var main = document.querySelector("main");
  if (!sommaire && main) {
    var sections = Array.prototype.filter.call(main.querySelectorAll("section.bloc"), function (s) {
      return s.querySelector(":scope > h2");
    });
    if (sections.length >= 3) {
      sommaire = document.createElement("nav");
      sommaire.className = "pastilles";
      sommaire.setAttribute("aria-label", "Sommaire de la page");
      sections.forEach(function (s, i) {
        if (!s.id) s.id = "partie-" + (i + 1);
        var a = document.createElement("a");
        a.href = "#" + s.id;
        a.textContent = s.querySelector(":scope > h2").textContent.trim();
        sommaire.appendChild(a);
      });
      main.insertBefore(sommaire, main.firstChild);
    }
  }
  if (!sommaire) return;

  // Ombre quand le sommaire est collé en haut
  var temoin = document.createElement("div");
  temoin.style.height = "1px";
  sommaire.parentNode.insertBefore(temoin, sommaire);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      sommaire.classList.toggle("colle", !e[0].isIntersecting);
    }).observe(temoin);
  }

  // Section en cours surlignée dans le sommaire
  var liens = Array.prototype.slice.call(sommaire.querySelectorAll('a[href^="#"]'));
  var cibles = liens.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  function actif() {
    var seuil = sommaire.getBoundingClientRect().bottom + 24, courant = -1;
    cibles.forEach(function (c, i) { if (c && c.getBoundingClientRect().top <= seuil) courant = i; });
    liens.forEach(function (a, i) {
      var on = i === courant;
      a.classList.toggle("actif", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    if (courant >= 0 && liens[courant].scrollIntoView && sommaire.scrollWidth > sommaire.clientWidth) {
      var l = liens[courant], g = l.offsetLeft - sommaire.clientWidth / 2 + l.clientWidth / 2;
      sommaire.scrollTo({ left: g, behavior: "smooth" });
    }
  }
  var attente = null;
  window.addEventListener("scroll", function () {
    if (attente) return;
    attente = setTimeout(function () { attente = null; actif(); }, 80);
  }, { passive: true });
  actif();
})();
