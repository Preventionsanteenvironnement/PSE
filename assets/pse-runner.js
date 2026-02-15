// ════════════════════════════════════════════════════════════════════════
// pse-runner.js - Version 7.3.0 (RGPD COMPLIANT + Firebase SAFE)
// Collection : resultats/{eleveCode}/copies/{docId}
// Date : 15 février 2026
// RGPD : Aucun nom/prénom stocké - uniquement code + classe
// Fix : init Firebase SAFE (évite double initializeApp si annuaire.js est chargé)
// Fix : blueprint embarqué dans la copie (priorité window.__PSE_BLUEPRINT, fallback JSON)
// Fix : focus (focusLeaves, copyAttempts, pasteBlocked) sauvegardé dans Firestore
// Fix : anti-doublon — une seule soumission par élève et par devoir
// Fix : suppression alert/écran qui écrasait le récépissé du Master
// Fix : alerte doublon Firestore (collection alertes_doublons) pour l'enseignant
// Fix : données chrono sauvegardées dans la copie élève
// ════════════════════════════════════════════════════════════════════════

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.appspot.com",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

// ✅ Init SAFE : évite "Firebase App named '[DEFAULT]' already exists"
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🚀 PSE Runner v7.2.0 RGPD - resultats/{eleveCode}/copies/");

// ────────────────────────────────────────────────────────────────────────
// UTIL : charger le blueprint (optionnel) pour l'embarquer dans la copie
// ────────────────────────────────────────────────────────────────────────
async function tryLoadBlueprint(devoirId) {
  if (!devoirId || devoirId === "unknown") return null;

  const candidates = [
    `/devoirs/${devoirId}_blueprint.json`,
    `./${devoirId}_blueprint.json`,
    `${devoirId}_blueprint.json`
  ];

  for (const url of candidates) {
    try {
      const resp = await fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" });
      if (!resp.ok) continue;
      const json = await resp.json();
      if (json && typeof json === "object") return json;
    } catch (e) {}
  }

  return null;
}

window.envoyerCopie = async function (code, pasteStats, eleveData) {
  console.log("📤 Envoi...", { code, eleveData });

  try {
    const eleveInfo = eleveData || { code: code, classe: "?" };
    const eleveCode = (eleveInfo.code || code || "").toUpperCase().trim();

    if (!eleveCode || eleveCode.length < 2) throw new Error("Code élève invalide");

    const classe =
      (eleveInfo.classe && String(eleveInfo.classe).trim()) ||
      (localStorage.getItem("userClasse") || "").trim() ||
      "?";

    // ════════════════════════════════════════════════════════════════
    // COLLECTE DES RÉPONSES
    // ════════════════════════════════════════════════════════════════
    const reponses = {};

    // 1) Champs texte/textarea & inputs (data-qid prioritaire)
    document.querySelectorAll(".reponse-eleve").forEach((el, idx) => {
      const qid = el.dataset.qid;

      let value = "";
      if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
        if (el.type === "radio") {
          if (!el.checked) return;
          value = el.value;
        } else if (el.type === "checkbox") {
          if (!el.checked) return;
          value = el.value || "checked";
        } else {
          value = (el.value || "").trim();
        }
      }

      if (!value) return;

      if (qid) {
        if (reponses[qid]) {
          if (Array.isArray(reponses[qid])) reponses[qid].push(value);
          else reponses[qid] = [reponses[qid], value];
        } else {
          reponses[qid] = value;
        }
      } else {
        const questionBlock = el.closest(".question-block");
        const numDisplay = questionBlock?.querySelector(".num-display");
        const numSelector = questionBlock?.querySelector(".num-selector");
        const questionNum =
          (numDisplay?.textContent || "").trim() || numSelector?.value || `Q${idx + 1}`;

        let key = questionNum;
        let suffix = 1;
        while (reponses[key] !== undefined) {
          key = `${questionNum}_${suffix}`;
          suffix++;
        }
        reponses[key] = value;
      }
    });

    // 2) QCM (checkbox/radio) si classe spécifique
    document.querySelectorAll(".save-me-qcm:checked").forEach((el) => {
      const qid = el.dataset.qid;
      if (!qid) return;

      const label = el.closest("label")?.textContent?.trim() || el.value;

      if (reponses[qid]) {
        if (Array.isArray(reponses[qid])) reponses[qid].push(label);
        else reponses[qid] = [reponses[qid], label];
      } else {
        reponses[qid] = label;
      }
    });

    // 3) Matching (reliage)
    document.querySelectorAll(".save-me-match").forEach((el) => {
      const questionBlock = el.closest(".question-block");
      const qidFromBlock = questionBlock?.querySelector("[data-qid]")?.dataset.qid;
      const id = el.dataset.id || `match_${Math.random().toString(36).substr(2, 9)}`;

      if (!el.value) return;

      reponses[id] = el.value;

      if (qidFromBlock) {
        if (!reponses[qidFromBlock]) reponses[qidFromBlock] = [];
        if (!Array.isArray(reponses[qidFromBlock])) reponses[qidFromBlock] = [reponses[qidFromBlock]];
        const leftText = el.closest("tr")?.querySelector(".matching-left")?.textContent || "";
        reponses[qidFromBlock].push(`${leftText} → ${el.value}`);
      }
    });

    // 4) Textes à trous
    document.querySelectorAll(".trou-eleve").forEach((el, i) => {
      const questionBlock = el.closest(".question-block");
      const qidFromBlock = questionBlock?.querySelector("[data-qid]")?.dataset.qid;
      const qid = el.dataset.qid || `trou_${i}`;
      const value = el.tagName === "SELECT" ? el.value : (el.value || "").trim();

      if (!value) return;

      reponses[qid] = value;

      if (qidFromBlock && qidFromBlock !== qid) {
        const k = qidFromBlock + "_trous";
        if (!reponses[k]) reponses[k] = [];
        reponses[k].push(value);
      }
    });

    // 5) Matrice de risque
    document.querySelectorAll(".risk-cell-value").forEach((el) => {
      const qid = el.dataset.qid;
      if (qid && el.value) reponses[qid + "_matrice"] = el.value;
    });

    // 6) Radios de décision
    document.querySelectorAll('input[type="radio"][name*="decision"]:checked').forEach((el) => {
      const qid = el.dataset.qid;
      if (qid) reponses[qid + "_decision"] = el.value;
    });

    // 7) Radios de gravité
    document.querySelectorAll('input[type="radio"][name*="grav"]:checked').forEach((el) => {
      const qid = el.dataset.qid;
      if (qid && !reponses[qid + "_gravite"]) reponses[qid + "_gravite"] = el.value;
    });

    console.log("📋 Réponses collectées:", reponses);
    console.log("📊 Nombre de réponses:", Object.keys(reponses).length);

    // ════════════════════════════════════════════════════════════════
    // CALCUL DES COMPÉTENCES (si le devoir a des champs score/max visibles)
    // ════════════════════════════════════════════════════════════════
    const competences = {};
    let totalPoints = 0;
    let maxPoints = 0;

    document.querySelectorAll(".question-block").forEach((block) => {
      const compSelector = block.querySelector(".comp-selector");
      const compDisplay = block.querySelector(".comp-display");
      const scoreInput = block.querySelector(".student-score");
      const maxInput = block.querySelector(".point-input");

      const comp = compSelector?.value || compDisplay?.textContent?.trim();
      const score = parseFloat(scoreInput?.value) || 0;
      const max = parseFloat(maxInput?.value) || 0;

      if (!comp || max <= 0) return;

      const ratio = score / max;
      const niveau = ratio >= 0.85 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.4 ? 1 : 0;

      if (!competences[comp]) competences[comp] = 0;
      competences[comp] += niveau;

      totalPoints += score;
      maxPoints += max;
    });

    const noteSur20 = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 20 * 10) / 10 : 0;

    // ════════════════════════════════════════════════════════════════
    // TEMPS & MÉTADONNÉES
    // ════════════════════════════════════════════════════════════════
    const devoirId = document.body.dataset.idExercice || "unknown";

    const startKey = "devoir_start_time_" + devoirId;
    let startTime = parseInt(localStorage.getItem(startKey) || "", 10);
    if (!startTime) {
      startTime = Date.now();
      localStorage.setItem(startKey, String(startTime));
    }
    const tempsSecondes = Math.floor((Date.now() - startTime) / 1000);

    const titre =
      document.querySelector(".main-title-editable")?.textContent.trim() ||
      document.querySelector("h1")?.textContent.trim() ||
      "Devoir PSE";

    // ════════════════════════════════════════════════════════════════
    // BLUEPRINT (embarqué dans la copie : priorité au blueprint injecté)
    // ════════════════════════════════════════════════════════════════
    let blueprint = null;

    // 1) Priorité au blueprint injecté dans le HTML élève par le Master
    try {
      if (window.__PSE_BLUEPRINT && typeof window.__PSE_BLUEPRINT === "object") {
        blueprint = window.__PSE_BLUEPRINT;
        console.log("✅ Blueprint embarqué depuis window.__PSE_BLUEPRINT");
      }
    } catch (e) {}

    // 2) Fallback : tenter le fichier JSON externe (si présent et bien nommé)
    if (!blueprint) {
      blueprint = await tryLoadBlueprint(devoirId);
      if (blueprint) console.log("✅ Blueprint embarqué depuis fichier JSON externe");
    }

    const blueprintEmbedded = !!blueprint;

    // ════════════════════════════════════════════════════════════════
    // ANTI-DOUBLON : vérifier si une copie existe déjà pour ce devoir
    // ════════════════════════════════════════════════════════════════
    const stableDocId = `${devoirId}_copie`;
    const isSecondeChance = !!(eleveData && eleveData.secondeChance);
    const existingSnap = await getDoc(doc(db, "resultats", eleveCode, "copies", stableDocId));
    if (existingSnap.exists() && !isSecondeChance) {
      // ── ALERTE DOUBLON → notification Firestore pour l'enseignant ──
      try {
        await addDoc(collection(db, "alertes_doublons"), {
          eleveCode: eleveCode,
          classe: classe,
          devoirId: devoirId,
          titre: titre,
          type: "doublon",
          message: eleveCode + " a tenté de renvoyer sa copie pour « " + titre + " »",
          createdAt: serverTimestamp(),
          lu: false
        });
        console.log("🔔 Alerte doublon envoyée à Firestore");
      } catch (alertErr) {
        console.warn("⚠️ Impossible d'envoyer l'alerte doublon:", alertErr);
      }
      throw new Error("Vous avez déjà envoyé une copie pour cet exercice. Une seule soumission est autorisée.");
    }

    // ════════════════════════════════════════════════════════════════
    // FOCUS / ANTI-TRICHE (transmis par le Master via eleveData.focus)
    // ════════════════════════════════════════════════════════════════
    const focusData = (eleveData && eleveData.focus) ? {
      focusLeaves: Number(eleveData.focus.focusLeaves) || 0,
      copyAttempts: Number(eleveData.focus.copyAttempts) || 0,
      pasteBlocked: Number(eleveData.focus.pasteBlocked) || 0
    } : { focusLeaves: 0, copyAttempts: 0, pasteBlocked: 0 };

    // ════════════════════════════════════════════════════════════════
    // DOCUMENT (RGPD)
    // ════════════════════════════════════════════════════════════════
    const data = {
      eleveCode: eleveCode,
      devoirId: devoirId,
      exercice: devoirId,
      titre: titre,

      classe: classe,
      eleve: {
        userCode: eleveCode,
        classe: classe
      },

      reponses: reponses,
      competences: competences,

      note_auto: noteSur20,
      score: noteSur20,

      temps_secondes: tempsSecondes,
      pasteStats: pasteStats || { total: 0, external: 0, document: 0 },
      focus: focusData,

      blueprint: blueprint,
      blueprintEmbedded: blueprintEmbedded,

      tentative: isSecondeChance ? 2 : 1,

      chrono: (eleveData && eleveData.chrono) ? {
        actif: !!eleveData.chrono.actif,
        minutesAllouees: Number(eleveData.chrono.minutesAllouees) || 0,
        secondesRestantes: Number(eleveData.chrono.secondesRestantes) || 0,
        tempsUtiliseSec: eleveData.chrono.tempsUtiliseSec != null ? Number(eleveData.chrono.tempsUtiliseSec) : null,
        tempsEcoule: !!eleveData.chrono.tempsEcoule
      } : { actif: false },

      createdAt: serverTimestamp(),
      createdAtISO: new Date().toISOString(),
      ts: Date.now()
    };

    // ════════════════════════════════════════════════════════════════
    // ÉCRITURE resultats/{eleveCode}/copies/{stableDocId}
    // ════════════════════════════════════════════════════════════════
    const docPath = `resultats/${eleveCode}/copies/${stableDocId}`;

    await setDoc(doc(db, "resultats", eleveCode, "copies", stableDocId), data);

    console.log("✅ Envoyé dans:", docPath);

    // Nettoyage localStorage
    localStorage.removeItem("paste_log_" + devoirId);
    localStorage.removeItem(startKey);
  } catch (error) {
    console.error("❌ Erreur:", error);
    // Ne pas afficher d'alert ici : le Master (envoyerDefinitivement) gère l'affichage
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════
// DEMANDE DE 2ÈME CHANCE (à distance)
// ════════════════════════════════════════════════════════════════
window.demander2eChanceFirestore = async function (eleveCode, devoirId, classe) {
  const docId = `${eleveCode}_${devoirId}`;
  await setDoc(doc(db, "demandes_2chance", docId), {
    eleveCode: eleveCode,
    devoirId: devoirId,
    classe: classe || "?",
    status: "en_attente",
    createdAt: serverTimestamp(),
    createdAtISO: new Date().toISOString()
  });
  console.log("📩 Demande 2ème chance envoyée:", docId);
};

window.verifier2eChanceFirestore = async function (eleveCode, devoirId) {
  const docId = `${eleveCode}_${devoirId}`;
  const snap = await getDoc(doc(db, "demandes_2chance", docId));
  if (!snap.exists()) return null;
  return snap.data().status; // "en_attente", "acceptee", "refusee"
};

console.log("✅ window.envoyerCopie prêt (v7.3.0 RGPD - resultats/{eleveCode}/copies/)");
