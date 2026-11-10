/* eval-garde.js — surveillance d'une évaluation en ligne (mapse.fr)
 * Plein écran, détection des sorties (onglet, fenêtre, application, plein écran quitté),
 * blocage du copier-coller, du clic droit, de l'impression et des raccourcis courants.
 * Chaque sortie est notée avec l'heure et la durée ; le journal part avec la copie.
 * Ce script ne voit PAS le téléphone de l'élève ni son entourage : la surveillance humaine reste nécessaire.
 * API : EvalGarde.demarrer({ maxSorties, surSortie(n), surMax(), surRetour() }), EvalGarde.journal(),
 *       EvalGarde.resume(), EvalGarde.arreter(), EvalGarde.pleinEcran()
 */
(function () {
  "use strict";
  var actif = false, opts = {}, evts = [], sortieEnCours = null, nbSorties = 0, nbCopier = 0, nbColler = 0;
  var debut = null;

  function hms(t) { var d = new Date(t); return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  function noter(type, detail) { evts.push({ t: Date.now(), type: type, detail: detail || "" }); }

  function pleinEcranActif() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function pleinEcran() {
    var el = document.documentElement;
    try {
      if (el.requestFullscreen) return el.requestFullscreen({ navigationUI: "hide" }).catch(function () {});
      if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) {}
    return Promise.resolve();
  }

  function sortir(motif) {
    if (!actif || sortieEnCours) return;
    sortieEnCours = { debut: Date.now(), motif: motif };
    nbSorties++;
    noter("sortie", motif); changement();
    if (opts.surSortie) opts.surSortie(nbSorties, motif);
    if (opts.maxSorties && nbSorties >= opts.maxSorties && opts.surMax) opts.surMax(nbSorties);
  }
  function revenir() {
    if (!actif || !sortieEnCours) return;
    var duree = Math.round((Date.now() - sortieEnCours.debut) / 1000);
    noter("retour", sortieEnCours.motif + " · " + duree + " s");
    sortieEnCours.fin = Date.now(); sortieEnCours.duree = duree;
    sortieEnCours = null; changement();
    if (opts.surRetour) opts.surRetour(nbSorties);
  }
  function changement() { if (opts.surChangement) try { opts.surChangement(); } catch (e) {} }

  function onVisibilite() { if (document.hidden) sortir("onglet ou application quittés"); else if (!pleinEcranRequis()) revenir(); }
  function onBlur() { setTimeout(function () { if (!document.hasFocus()) sortir("fenêtre quittée"); }, 150); }
  function onFocus() { if (!document.hidden && (!pleinEcranRequis())) revenir(); }
  function pleinEcranRequis() { return opts.pleinEcran && opts.pleinEcranPossible && !pleinEcranActif(); }
  function onPleinEcran() {
    if (!actif || !opts.pleinEcranPossible) return;
    if (!pleinEcranActif()) sortir("plein écran quitté");
    else if (!document.hidden && document.hasFocus()) revenir();
  }
  function bloque(e, type) { if (!actif) return; e.preventDefault(); if (type === "copier") nbCopier++; else if (type === "coller") nbColler++; noter("bloqué", type); changement(); if (opts.surBlocage) opts.surBlocage(type); }
  function onCopy(e) { bloque(e, "copier"); }
  function onCut(e) { bloque(e, "couper"); }
  function onPaste(e) { bloque(e, "coller"); }
  function onDrop(e) { bloque(e, "glisser-déposer"); }
  function onMenu(e) { bloque(e, "clic droit"); }
  function onTouche(e) {
    if (!actif) return;
    var k = (e.key || "").toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && ["c", "v", "x", "p", "s", "f", "u", "a"].indexOf(k) >= 0 && !(k === "a" && /^(TEXTAREA|INPUT)$/.test((e.target || {}).tagName))) { bloque(e, "raccourci " + k.toUpperCase()); return; }
    if (k === "f12" || (mod && e.shiftKey && ["i", "j", "c"].indexOf(k) >= 0)) bloque(e, "outils du navigateur");
    if (k === "printscreen") noter("bloqué", "capture d'écran");
  }
  function onAvantQuitter(e) { if (!actif) return; noter("tentative", "quitter ou recharger la page"); e.preventDefault(); e.returnValue = ""; return ""; }
  function onRetourArriere() { if (!actif) return; history.pushState(null, "", location.href); noter("bloqué", "retour arrière"); }

  window.EvalGarde = {
    demarrer: function (o) {
      opts = o || {}; actif = true; debut = debut || Date.now();
      opts.pleinEcranPossible = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
      noter("début", opts.pleinEcranPossible ? "plein écran demandé" : "plein écran impossible sur cet appareil");
      document.addEventListener("visibilitychange", onVisibilite);
      window.addEventListener("blur", onBlur);
      window.addEventListener("focus", onFocus);
      document.addEventListener("fullscreenchange", onPleinEcran);
      document.addEventListener("webkitfullscreenchange", onPleinEcran);
      ["copy", "cut", "paste", "drop", "contextmenu"].forEach(function (t) { document.addEventListener(t, { copy: onCopy, cut: onCut, paste: onPaste, drop: onDrop, contextmenu: onMenu }[t], true); });
      document.addEventListener("keydown", onTouche, true);
      window.addEventListener("beforeunload", onAvantQuitter);
      history.pushState(null, "", location.href);
      window.addEventListener("popstate", onRetourArriere);
      return pleinEcran().then(function () {
        if (opts.pleinEcranPossible && !pleinEcranActif()) { opts.pleinEcranPossible = false; noter("info", "plein écran refusé par le navigateur : surveillance des sorties seule"); }
      });
    },
    /* Bouton « Revenir » : redemande le plein écran ; s'il est refusé, on continue sans lui (noté). */
    revenirEvaluation: function () {
      return pleinEcran().then(function () {
        if (opts.pleinEcranPossible && !pleinEcranActif()) { opts.pleinEcranPossible = false; noter("info", "plein écran refusé au retour : surveillance des sorties seule"); }
        if (!document.hidden) revenir();
      });
    },
    arreter: function () {
      if (sortieEnCours) revenir();
      noter("fin", "");
      actif = false;
      window.removeEventListener("beforeunload", onAvantQuitter);
      try { if (pleinEcranActif()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {}
    },
    pleinEcran: pleinEcran,
    /* État complet (événements et compteurs), pour le garder sur l'appareil et le retrouver après un rechargement. */
    etat: function () { return { evts: evts.slice(), nbSorties: nbSorties, nbCopier: nbCopier, nbColler: nbColler, sortieEnCours: sortieEnCours }; },
    charger: function (e) {
      if (!e) return;
      evts = (e.evts || []).slice(); nbSorties = e.nbSorties | 0; nbCopier = e.nbCopier | 0; nbColler = e.nbColler | 0;
      if (e.sortieEnCours) { /* la page a été fermée ou rechargée pendant une sortie : on la clôt à maintenant */
        var d = Math.round((Date.now() - e.sortieEnCours.debut) / 1000);
        evts.push({ t: Date.now(), type: "retour", detail: e.sortieEnCours.motif + " (page rechargée) · " + d + " s" });
      }
      evts.push({ t: Date.now(), type: "rechargement", detail: "la page a été rouverte" });
    },
    enSortie: function () { return !!sortieEnCours; },
    resume: function () {
      var total = 0;
      evts.forEach(function (e) { if (e.type === "retour") { var m = /· (\d+) s$/.exec(e.detail); if (m) total += +m[1]; } });
      return { sorties: nbSorties, secondesHors: total, copier: nbCopier, coller: nbColler,
               blocages: evts.filter(function (e) { return e.type === "bloqué"; }).length,
               pleinEcranPossible: !!opts.pleinEcranPossible, debut: debut };
    },
    journal: function () {
      return evts.map(function (e) { return hms(e.t) + " — " + e.type + (e.detail ? " : " + e.detail : ""); }).join("\n");
    },
    evenements: function () { return evts.slice(); }
  };
})();
