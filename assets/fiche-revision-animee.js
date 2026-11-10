/* Fiches de révision animées (mapse.fr) : apparition au défilement, cartes à retourner,
   chaînes d'étapes, jeux de tri et quiz « Je vérifie mes acquis ».
   Chaque page déclare window.FICHE = { quiz: {n: [[question, [bonne, autre, autre], explication], …]}, tris: {id: {etiquette: bac}} }. */
(function () {
  "use strict";
  var calme = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var F = window.FICHE || {};

  /* Barre de progression */
  var barre = document.getElementById("progression");
  if (barre) addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - innerHeight;
    barre.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  }, { passive: true });

  /* Apparition au défilement */
  var vus = document.querySelectorAll(".apparait");
  if ("IntersectionObserver" in window && !calme) {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("vu"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    vus.forEach(function (el) { obs.observe(el); });
  } else vus.forEach(function (el) { el.classList.add("vu"); });

  /* Audio : voix du système, rien n'est envoyé. Un bouton 🔊 sur chaque carte, note, étape,
     question (avec ses réponses possibles) et explication. La lecture ne démarre qu'au toucher. */
  var synth = window.speechSynthesis, voixFr = null;
  function choisirVoix() {
    if (!synth) return;
    var v = synth.getVoices().filter(function (x) { return /^fr/i.test(x.lang); });
    voixFr = v.filter(function (x) { return /fr[-_]FR/i.test(x.lang); })[0] || v[0] || null;
  }
  if (synth) { choisirVoix(); if ("onvoiceschanged" in synth) synth.addEventListener("voiceschanged", choisirVoix); }
  function propre(t) {
    return String(t || "").replace(/🔊\s*Écouter/g, "").replace(/Touche pour retourner/g, "")
      .replace(/dB\(A\)/g, "décibels A").replace(/→/g, " : ").replace(/≥/g, " supérieur ou égal à ")
      .replace(/÷/g, " divisé par ").replace(/×/g, " multiplié par ").replace(/≈/g, " environ ")
      .replace(/(\d) (\d{3})/g, "$1$2").replace(/\s+/g, " ").trim();
  }
  /* Un bouton 🔊 lance la lecture ; le même bouton met en pause, puis reprend. Rien ne se lit sans geste de l'élève
     (audio-pause.js ajoute aussi le bandeau Pause / Reprendre / Arrêter en bas de l'écran). */
  var actif = null, etat = "arret";
  function libeller(b, e) {
    if (!b) return;
    b.textContent = e === "lecture" ? "⏸ Pause" : e === "pause" ? "▶ Reprendre" : "🔊 Écouter";
    b.setAttribute("aria-pressed", e === "arret" ? "false" : "true");
  }
  function fini(u) { return function () { if (u._fiche === actif) { libeller(actif, "arret"); actif = null; etat = "arret"; } }; }
  function parler(texte, bouton) {
    if (!synth) return;
    if (bouton && bouton === actif && etat === "lecture") { synth.pause(); etat = "pause"; libeller(bouton, etat); return; }
    if (bouton && bouton === actif && etat === "pause") { synth.resume(); etat = "lecture"; libeller(bouton, etat); return; }
    synth.cancel(); libeller(actif, "arret");
    var u = new SpeechSynthesisUtterance(propre(texte));
    u.lang = "fr-FR"; u.rate = 0.95; if (voixFr) u.voice = voixFr;
    actif = bouton || null; etat = "lecture"; u._fiche = actif; libeller(actif, etat);
    u.onend = fini(u); u.onerror = fini(u);
    synth.speak(u);
  }
  /* Le bandeau commun (Pause / Arrêter) garde le bouton de la carte à jour */
  setInterval(function () {
    if (!actif || !synth) return;
    var e = synth.paused ? "pause" : synth.speaking ? "lecture" : "arret";
    if (e !== etat) { etat = e; libeller(actif, e); if (e === "arret") actif = null; }
  }, 400);
  function texteDe(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll(".audio-mini, .touche, script, style").forEach(function (x) { x.remove(); });
    c.querySelectorAll(".face.dos").forEach(function (x) { x.insertAdjacentText("afterbegin", ". "); });
    c.querySelectorAll("br").forEach(function (x) { x.replaceWith(". "); });
    return c.textContent;
  }
  function boutonAudio(source, libelle) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn audio-mini"; b.textContent = "🔊 Écouter";
    b.setAttribute("aria-label", libelle || "Écouter");
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function (e) { e.stopPropagation(); parler(typeof source === "function" ? source() : texteDe(source), b); });
    return b;
  }
  window.ficheParler = parler;
  if (synth) {
    document.querySelectorAll(".carte-tourne").forEach(function (b) {
      var c = document.createElement("div"); c.className = "case";
      b.parentNode.insertBefore(c, b); c.appendChild(b);
      c.appendChild(boutonAudio(b, "Écouter cette carte et sa réponse"));
    });
    document.querySelectorAll(".carte, .note, .maillon-audio").forEach(function (el) { el.appendChild(boutonAudio(el, "Écouter ce cadre")); });
    document.querySelectorAll(".etape-texte").forEach(function (el) {
      el.insertAdjacentElement("afterend", boutonAudio(el, "Écouter cette étape"));
    });
    document.querySelectorAll("[data-lire]").forEach(function (el) {
      el.appendChild(boutonAudio(function () { return texteDe(document.getElementById(el.getAttribute("data-lire"))); }, "Écouter le résultat"));
    });
  }

  /* Cartes à retourner */
  document.querySelectorAll(".carte-tourne").forEach(function (b) {
    b.addEventListener("click", function () { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); });
  });

  /* Chaînes d'étapes : <div data-chaine> .maillon[data-texte] + boutons [data-ch=lancer|suivant|precedent] + .etape-texte */
  document.querySelectorAll("[data-chaine]").forEach(function (zone) {
    var m = zone.querySelectorAll(".maillon"), txt = zone.querySelector(".etape-texte");
    var depart = txt ? txt.textContent : "", n = -1, minut = null, lancer = zone.querySelector("[data-ch=lancer]");
    function placer(i) {
      n = Math.max(-1, Math.min(m.length - 1, i));
      m.forEach(function (x, k) { x.classList.toggle("allume", k <= n); });
      if (txt) txt.innerHTML = n < 0 ? depart : m[n].getAttribute("data-texte");
    }
    function stop() { clearInterval(minut); minut = null; if (lancer) lancer.textContent = lancer.getAttribute("data-libelle"); }
    if (lancer) lancer.setAttribute("data-libelle", lancer.textContent);
    zone.querySelectorAll("[data-ch]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-ch");
        if (a === "suivant") { stop(); placer(n + 1); }
        else if (a === "precedent") { stop(); placer(n - 1); }
        else if (minut) stop();
        else {
          placer(0); b.textContent = "⏸ Pause";
          minut = setInterval(function () { if (n >= m.length - 1) { stop(); return; } placer(n + 1); }, calme ? 4000 : 2600);
        }
      });
    });
    placer(-1);
  });

  /* Jeux de tri : .tri[data-tri=id] avec .etiquette et .bac[data-bac] */
  document.querySelectorAll(".tri").forEach(function (zone) {
    var sol = (F.tris || {})[zone.getAttribute("data-tri")] || {}, choisie = null;
    var msg = zone.querySelector(".message-tri"), restant = zone.querySelectorAll(".etiquette").length;
    zone.querySelectorAll(".etiquette").forEach(function (e) {
      e.addEventListener("click", function () {
        zone.querySelectorAll(".etiquette").forEach(function (x) { x.classList.remove("choisie"); });
        choisie = e; e.classList.add("choisie");
        msg.className = "message-tri"; msg.textContent = "Touche maintenant la bonne case.";
      });
    });
    zone.querySelectorAll(".bac").forEach(function (bac) {
      bac.addEventListener("click", function () {
        if (!choisie) { msg.className = "message-tri"; msg.textContent = "Touche d'abord une étiquette."; return; }
        var mot = choisie.textContent.replace(/\s+/g, " ").trim();
        if (sol[mot] === bac.getAttribute("data-bac")) {
          var s = document.createElement("span"); s.textContent = mot; bac.querySelector(".contenu").appendChild(s);
          choisie.classList.add("rangee"); choisie.classList.remove("choisie"); choisie = null; restant--;
          msg.className = "message-tri ok"; msg.textContent = restant ? "✔ Bien rangé !" : "✔ Tout est rangé, bravo ! 🎉";
        } else {
          msg.className = "message-tri ko"; msg.textContent = "✘ Pas dans cette case : relis la définition et réessaie.";
        }
      });
    });
  });

  /* Je vérifie mes acquis */
  var total = 0, bons = 0, scoreEl = document.getElementById("score");
  function melanger(t) { t = t.slice(); for (var i = t.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = t[i]; t[i] = t[j]; t[j] = x; } return t; }
  function majScore() { if (scoreEl) scoreEl.textContent = "Je vérifie mes acquis : " + bons + " / " + total + (bons === total && total ? " — Bravo, tout est juste ! 🎉" : ""); }
  document.querySelectorAll(".quiz").forEach(function (zone) {
    var qs = (F.quiz || {})[zone.getAttribute("data-quiz")]; if (!qs) return;
    var h = document.createElement("div"); h.className = "entete"; h.textContent = "✏️ Je vérifie mes acquis"; zone.appendChild(h);
    qs.forEach(function (q) {
      total++;
      var bloc = document.createElement("div"); bloc.className = "question";
      var p = document.createElement("p"); p.textContent = q[0]; bloc.appendChild(p);
      var retour = document.createElement("div"); retour.className = "retour"; retour.setAttribute("aria-live", "polite");
      var boutons = [], ordre = melanger(q[1].map(function (t, k) { return { t: t, bon: k === 0 }; }));
      if (synth) p.appendChild(boutonAudio(function () {
        return q[0] + ". Réponses possibles : " + ordre.map(function (o, k) { return "réponse " + (k + 1) + " : " + o.t; }).join(". ") + ".";
      }, "Écouter la question et les réponses possibles"));
      ordre.forEach(function (o) {
        var b = document.createElement("button"); b.className = "choix"; b.textContent = o.t; b._bon = o.bon;
        b.addEventListener("click", function () {
          boutons.forEach(function (x) { x.disabled = true; if (x._bon) x.classList.add("bon"); });
          if (o.bon) { bons++; retour.className = "retour ok"; retour.textContent = "✔ Bonne réponse ! "; }
          else { b.classList.add("faux"); retour.className = "retour ko"; retour.textContent = "✘ Pas tout à fait : la bonne réponse est en vert. "; }
          var ex = document.createElement("span"); ex.className = "explication"; ex.textContent = q[2]; retour.appendChild(ex);
          var bonne = ordre.filter(function (x) { return x.bon; })[0].t;
          if (synth) ex.appendChild(boutonAudio(function () { return (o.bon ? "Bonne réponse. " : "Pas tout à fait. La bonne réponse est : " + bonne + ". ") + q[2]; }, "Écouter la correction"));
          majScore();
        });
        boutons.push(b); bloc.appendChild(b);
      });
      bloc.appendChild(retour); zone.appendChild(bloc);
    });
  });
  majScore();
})();
