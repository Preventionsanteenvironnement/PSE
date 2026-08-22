/* effacer.js — « Effacer mes réponses sur cet appareil ».

   Pourquoi : les exercices gardent le texte écrit par l'élève dans le
   localStorage du navigateur, pour qu'un rechargement accidentel ne le fasse
   pas disparaître. En salle informatique, le poste est partagé : sans moyen
   d'effacer, l'élève suivant retrouve la réponse — et parfois le prénom — de
   celui d'avant. Ce bouton rend l'effacement explicite et immédiat.

   Rien n'est envoyé nulle part : on ne fait que vider un stockage local.

   Pose sur une page, AVANT le script :
     <script>window.PSE_CLES_ELEVE = ["c1capbruit_*"];</script>
     <script src="assets/effacer.js" defer></script>

   Une clé qui se termine par « * » vaut préfixe : « eleve_* » efface
   « eleve_q1 », « eleve_q2 »… Sans étoile, la clé est effacée telle quelle.

   Le bouton se place dans l'élément qui porte l'id « pse-effacer-ici », sinon
   à la fin du conteneur principal de la page. */
(function () {
  "use strict";

  function clesAEffacer() {
    var motifs = window.PSE_CLES_ELEVE || [];
    if (!motifs.length) return [];
    var trouvees = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        for (var j = 0; j < motifs.length; j++) {
          var m = motifs[j];
          if (m.charAt(m.length - 1) === "*") {
            if (k.indexOf(m.slice(0, -1)) === 0) { trouvees.push(k); break; }
          } else if (k === m) { trouvees.push(k); break; }
        }
      }
    } catch (e) {}
    return trouvees;
  }

  function viderChamps() {
    document.querySelectorAll("textarea[data-libre], input[data-libre]").forEach(function (z) {
      if (z.type === "checkbox" || z.type === "radio") z.checked = false;
      else z.value = "";
      z.style.borderColor = "";
    });
  }

  function effacer(btn, dit) {
    var n = clesAEffacer().length;
    var question = n
      ? "Effacer définitivement ce que tu as écrit sur cet appareil ?"
      : "Il n'y a rien d'enregistré. Vider quand même les zones de texte ?";
    if (!window.confirm(question)) return;
    clesAEffacer().forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    viderChamps();
    if (window.PSE_APRES_EFFACEMENT) { try { window.PSE_APRES_EFFACEMENT(); } catch (e) {} }
    dit.textContent = "Effacé.";
    setTimeout(function () { dit.textContent = ""; }, 4000);
    btn.focus();
  }

  function poser() {
    if (!(window.PSE_CLES_ELEVE || []).length) return;
    if (document.querySelector(".pse-effacer")) return;
    // « .zone » veut dire une chose differente sur chaque page : on ne s'y fie
    // pas. Sans ancre explicite, le bouton va en fin de contenu principal.
    var hote = document.getElementById("pse-effacer-ici")
            || document.querySelector(".barre-act")
            || document.querySelector("main") || document.querySelector(".wrap")
            || document.body;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pse-effacer";
    btn.textContent = "Effacer mon texte";
    btn.title = "Supprime de cet ordinateur ce que tu as écrit. Sans retour arrière.";

    var dit = document.createElement("span");
    dit.className = "pse-efface-dit";
    dit.setAttribute("role", "status");
    dit.setAttribute("aria-live", "polite");

    btn.addEventListener("click", function () { effacer(btn, dit); });
    hote.appendChild(btn);
    hote.appendChild(dit);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", poser);
  else poser();
})();
