// ════════════════════════════════════════════════════════════════════════
// pse-runner.js - Version 7.4.0 (RGPD COMPLIANT + Firebase COMPAT)
// Collection : resultats/{eleveCode}/copies/{docId}
// Date : 16 février 2026
// RGPD : Aucun nom/prénom stocké - uniquement code + classe
// Fix v7.4 : API Firebase compat (harmonisé avec annuaire.js)
//   → annuaire.js utilise firebase-app-compat + firebase-firestore-compat
//   → pse-runner.js réutilise window.db créé par annuaire.js (ou le crée)
//   → PLUS de conflit compat vs modulaire
// Fix : blueprint embarqué dans la copie (priorité window.__PSE_BLUEPRINT, fallback JSON)
// Fix : focus (focusLeaves, copyAttempts, pasteBlocked) sauvegardé dans Firestore
// Fix : anti-doublon — une seule soumission par élève et par devoir
// Fix : suppression alert/écran qui écrasait le récépissé du Master
// Fix : alerte doublon Firestore (collection alertes_doublons) pour l'enseignant
// Fix : données chrono sauvegardées dans la copie élève
// Fix : 2ème chance à distance (demandes_2chance)
// ════════════════════════════════════════════════════════════════════════

// ── Firebase compat (chargé dynamiquement car compat n'a pas d'export ES default) ──
try {
  await new Promise((resolve, reject) => {
    if (window.firebase) return resolve();
    const s1 = document.createElement("script");
    s1.src = "https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js";
    s1.onload = () => {
      const s2 = document.createElement("script");
      s2.src = "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js";
      s2.onload = resolve;
      s2.onerror = reject;
      document.head.appendChild(s2);
    };
    s1.onerror = reject;
    document.head.appendChild(s1);
  });
} catch (e) {
  // Pré-vol : le SDK Firebase n'a pas pu se charger (wifi/CDN bloqué, pas de réseau).
  // On prévient l'élève tout de suite plutôt que de le laisser composer pour rien.
  try {
    const _b = document.createElement("div");
    _b.id = "pse-runner-banner";
    _b.setAttribute("role", "alert");
    _b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:100000;background:#b91c1c;color:#fff;padding:10px 14px;font:700 14px/1.4 system-ui,sans-serif;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.3);";
    _b.textContent = "⚠️ Connexion au serveur impossible (réseau ou wifi du lycée). Préviens ton professeur : l'envoi de la copie ne fonctionnera pas.";
    (document.body || document.documentElement).appendChild(_b);
  } catch (_) {}
  throw e;
}
const firebase = window.firebase;

const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.appspot.com",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

// ✅ Init SAFE : réutilise l'app/db de annuaire.js si déjà chargé
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = window.db || firebase.firestore();
window.db = db;

console.log("🚀 PSE Runner v7.4.0 RGPD (compat) - resultats/{eleveCode}/copies/");
const RUNNER_TIMEOUT_MS = 15000;

function withTimeout(promise, ms, context) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error((context || "Operation") + " : delai depasse")), ms);
    })
  ]);
}

function runnerToast(message, kind = "info") {
  try {
    let box = document.getElementById("pse-runner-toast");
    if (!box) {
      box = document.createElement("div");
      box.id = "pse-runner-toast";
      box.style.cssText = "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99999;padding:10px 14px;border-radius:10px;color:#fff;font-size:13px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:88vw;text-align:center;display:none;";
      document.body.appendChild(box);
    }
    if (kind === "error") box.style.background = "#b91c1c";
    else if (kind === "success") box.style.background = "#166534";
    else box.style.background = "#1d4ed8";
    box.textContent = message;
    box.style.display = "block";
    clearTimeout(runnerToast._timer);
    runnerToast._timer = setTimeout(() => {
      box.style.display = "none";
    }, kind === "error" ? 7000 : 3000);
  } catch (_) {}
}

// ────────────────────────────────────────────────────────────────────────
// FILET ANTI-BLOCAGE : bannière + secours (copier / télécharger / réessayer)
// ────────────────────────────────────────────────────────────────────────
function runnerBanner(message) {
  try {
    let b = document.getElementById("pse-runner-banner");
    if (!b) {
      b = document.createElement("div");
      b.id = "pse-runner-banner";
      b.setAttribute("role", "alert");
      b.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:100000;background:#b91c1c;color:#fff;padding:10px 14px;font:700 14px/1.4 system-ui,sans-serif;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.3);";
      (document.body || document.documentElement).appendChild(b);
    }
    b.textContent = message;
    b.style.display = "block";
  } catch (_) {}
}

function runnerCopyFallback(text) {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (e) { return false; }
}

function runnerCopyText(text) {
  return new Promise((resolve) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => resolve(true), () => resolve(runnerCopyFallback(text)));
      } else {
        resolve(runnerCopyFallback(text));
      }
    } catch (e) { resolve(runnerCopyFallback(text)); }
  });
}

function runnerDownloadJson(payload, filename) {
  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "copie_secours.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (e) { return false; }
}

// Écran d'échec clair : montré quand l'envoi Firestore a échoué malgré le retry.
function runnerShowRescue(payload) {
  const eleveCode = payload.eleveCode, devoirId = payload.devoirId,
        stableDocId = payload.stableDocId, data = payload.data, backupKey = payload.backupKey;
  const secours = {
    version: 1, type: "mapse_devoir_copie_secours", exportedAt: new Date().toISOString(),
    eleveCode: eleveCode, devoirId: devoirId, stableDocId: stableDocId, data: data
  };
  const stamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "");
  const filename = "copie_secours_" + String(eleveCode || "eleve") + "_" + String(devoirId || "devoir") + "_" + stamp + ".json";

  const old = document.getElementById("pse-runner-rescue");
  if (old) old.remove();
  const ov = document.createElement("div");
  ov.id = "pse-runner-rescue";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-label", "Copie non envoyée");
  ov.style.cssText = "position:fixed;inset:0;z-index:100001;background:rgba(15,23,42,.75);display:flex;align-items:center;justify-content:center;padding:16px;";
  ov.innerHTML =
    '<div style="background:#fff;color:#0f172a;max-width:440px;width:100%;border-radius:14px;padding:20px;font:400 15px/1.5 system-ui,sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.4);">' +
      '<div style="font-weight:800;font-size:17px;color:#b91c1c;margin-bottom:8px;">⚠️ Ta copie n\'est pas encore partie</div>' +
      '<p style="margin:0 0 14px;">Elle est <b>sauvegardée sur cet appareil</b> et repartira toute seule au retour de la connexion. Par sécurité, tu peux aussi l\'envoyer à ton professeur&nbsp;:</p>' +
      '<div style="display:flex;flex-direction:column;gap:10px;">' +
        '<button type="button" id="pse-rescue-retry" style="padding:12px;border:0;border-radius:10px;background:#166534;color:#fff;font-weight:700;font-size:15px;cursor:pointer;">🔄 Réessayer maintenant</button>' +
        '<button type="button" id="pse-rescue-copy" style="padding:12px;border:0;border-radius:10px;background:#1d4ed8;color:#fff;font-weight:700;font-size:15px;cursor:pointer;">📋 Copier ma copie (à coller au prof)</button>' +
        '<button type="button" id="pse-rescue-dl" style="padding:12px;border:0;border-radius:10px;background:#334155;color:#fff;font-weight:700;font-size:15px;cursor:pointer;">⬇️ Télécharger ma copie (fichier)</button>' +
        '<button type="button" id="pse-rescue-close" style="padding:10px;border:0;border-radius:10px;background:#e2e8f0;color:#0f172a;font-weight:700;font-size:14px;cursor:pointer;">Fermer</button>' +
      '</div>' +
      '<div id="pse-rescue-msg" aria-live="polite" style="margin-top:10px;font-size:13px;color:#166534;min-height:18px;"></div>' +
    '</div>';
  document.body.appendChild(ov);
  const msg = ov.querySelector("#pse-rescue-msg");
  ov.querySelector("#pse-rescue-copy").addEventListener("click", () => {
    runnerCopyText(JSON.stringify(secours)).then((ok) => {
      msg.textContent = ok ? "✅ Copié ! Colle-le dans un message à ton professeur." : "❌ Copie impossible — utilise « Télécharger ».";
    });
  });
  ov.querySelector("#pse-rescue-dl").addEventListener("click", () => {
    const ok = runnerDownloadJson(secours, filename);
    msg.textContent = ok ? "✅ Fichier téléchargé — envoie-le à ton professeur." : "❌ Téléchargement impossible — utilise « Copier ».";
  });
  ov.querySelector("#pse-rescue-close").addEventListener("click", () => ov.remove());
  ov.querySelector("#pse-rescue-retry").addEventListener("click", () => {
    msg.textContent = "Envoi en cours...";
    db.collection("resultats").doc(eleveCode).collection("copies").doc(stableDocId).set(data)
      .then(() => {
        try { localStorage.removeItem(backupKey); } catch (e) {}
        msg.textContent = "✅ Envoyé ! Ta copie est bien arrivée.";
        runnerToast("Copie envoyee avec succes.", "success");
        setTimeout(() => ov.remove(), 1500);
      })
      .catch((err) => {
        msg.textContent = "❌ Toujours pas — réessaie, ou utilise Copier / Télécharger. (" + (err && err.message ? err.message : "") + ")";
      });
  });
}

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
      const resp = await withTimeout(
        fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" }),
        7000,
        "Chargement blueprint"
      );
      if (!resp.ok) continue;
      const json = await resp.json();
      if (json && typeof json === "object") return json;
    } catch (e) {}
  }

  return null;
}

window.envoyerCopie = async function (code, pasteStats, eleveData) {
  console.log("📤 Envoi...", { code, eleveData });

  if (window.__PSE_SEND_IN_PROGRESS) {
    runnerToast("Un envoi est deja en cours. Patientez quelques secondes.", "info");
    throw new Error("Envoi deja en cours");
  }
  window.__PSE_SEND_IN_PROGRESS = true;
  runnerToast("Envoi en cours...", "info");

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
    // ANTI DOUBLE-CLIC (10s) — empêche les envois accidentels
    // ════════════════════════════════════════════════════════════════
    const antiClickKey = "envoi_lock_" + devoirId + "_" + eleveCode;
    const lastSend = parseInt(sessionStorage.getItem(antiClickKey) || "0", 10);
    if (Date.now() - lastSend < 10000) {
      throw new Error("Envoi déjà en cours. Patientez quelques secondes.");
    }
    sessionStorage.setItem(antiClickKey, String(Date.now()));

    // ════════════════════════════════════════════════════════════════
    // VÉRIF COPIE EXISTANTE + 2ÈME CHANCE
    // ════════════════════════════════════════════════════════════════
    const isSecondeChance = !!(eleveData && eleveData.secondeChance);
    let tentative = 1;

    // Vérifier si une copie existe déjà (copie_1)
    const copie1Snap = await withTimeout(
      db.collection("resultats").doc(eleveCode)
        .collection("copies").doc(`${devoirId}_copie_1`).get(),
      RUNNER_TIMEOUT_MS,
      "Verification copie existante"
    );

    if (copie1Snap.exists && !isSecondeChance) {
      // Copie déjà envoyée et pas de 2ème chance validée → bloquer
      throw new Error("Vous avez déjà envoyé une copie pour cet exercice. Une seule soumission est autorisée.");
    }

    if (isSecondeChance) {
      // Compter les copies existantes pour numéroter
      try {
        const copiesSnap = await withTimeout(
          db.collection("resultats").doc(eleveCode)
            .collection("copies").where("devoirId", "==", devoirId).get(),
          RUNNER_TIMEOUT_MS,
          "Comptage des tentatives"
        );
        tentative = copiesSnap.size + 1;
      } catch (countErr) {
        tentative = 2; // Fallback safe
      }
    }

    const stableDocId = `${devoirId}_copie_${tentative}`;

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

      tentative: tentative,

      chrono: (eleveData && eleveData.chrono) ? {
        actif: !!eleveData.chrono.actif,
        minutesAllouees: Number(eleveData.chrono.minutesAllouees) || 0,
        secondesRestantes: Number(eleveData.chrono.secondesRestantes) || 0,
        tempsUtiliseSec: eleveData.chrono.tempsUtiliseSec != null ? Number(eleveData.chrono.tempsUtiliseSec) : null,
        tempsEcoule: !!eleveData.chrono.tempsEcoule
      } : { actif: false },

      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAtISO: new Date().toISOString(),
      ts: Date.now()
    };

    // ════════════════════════════════════════════════════════════════
    // ÉCRITURE resultats/{eleveCode}/copies/{stableDocId}
    // (avec backup localStorage + retry)
    // ════════════════════════════════════════════════════════════════
    const docPath = `resultats/${eleveCode}/copies/${stableDocId}`;

    // Backup localStorage AVANT tentative Firebase
    const backupKey = `devoir_backup_${eleveCode}_${devoirId}_${tentative}`;
    try {
      localStorage.setItem(backupKey, JSON.stringify({
        eleveCode, devoirId, stableDocId, data, timestamp: Date.now()
      }));
    } catch(bkErr) {}

    let writeSuccess = false;
    try {
      await withTimeout(
        db.collection("resultats").doc(eleveCode).collection("copies").doc(stableDocId).set(data),
        RUNNER_TIMEOUT_MS,
        "Ecriture de la copie"
      );
      writeSuccess = true;
    } catch(writeErr) {
      console.warn("❌ Ecriture copie echouee (tentative 1):", writeErr.message);
      // Retry apres 3s
      try {
        await new Promise(r => setTimeout(r, 3000));
        await withTimeout(
          db.collection("resultats").doc(eleveCode).collection("copies").doc(stableDocId).set(data),
          RUNNER_TIMEOUT_MS,
          "Ecriture de la copie (retry)"
        );
        writeSuccess = true;
      } catch(retryErr) {
        console.error("❌ Ecriture copie echouee (tentative 2):", retryErr.message);
      }
    }

    // Nettoyer backup uniquement si Firebase a confirme
    if (writeSuccess) {
      try { localStorage.removeItem(backupKey); } catch(e) {}
      console.log("✅ Envoyé dans:", docPath);
      runnerToast("Copie envoyee avec succes.", "success");
    } else {
      console.warn("⚠️ Copie sauvegardee localement:", backupKey);
      runnerToast("Envoi impossible pour le moment — copie gardee sur l'appareil.", "error");
      try {
        runnerShowRescue({ eleveCode, devoirId, stableDocId, data, backupKey });
      } catch (e) { console.warn("Rescue UI KO:", e); }
    }

    // Nettoyage localStorage
    localStorage.removeItem("paste_log_" + devoirId);
    localStorage.removeItem(startKey);
  } catch (error) {
    console.error("❌ Erreur:", error);
    runnerToast("Erreur d'envoi : " + (error && error.message ? error.message : "inconnue"), "error");
    // Ne pas afficher d'alert ici : le Master (envoyerDefinitivement) gère l'affichage
    throw error;
  } finally {
    window.__PSE_SEND_IN_PROGRESS = false;
  }
};

// ════════════════════════════════════════════════════════════════
// DEMANDE DE 2ÈME CHANCE (à distance)
// ════════════════════════════════════════════════════════════════
window.demander2eChanceFirestore = async function (eleveCode, devoirId, classe) {
  const docId = `${eleveCode}_${devoirId}`;
  const ref = db.collection("demandes_2chance").doc(docId);

  // Vérifier si le document existe déjà (un .set() sur doc existant = update,
  // et update exige auth → permission-denied pour l'élève)
  const existing = await ref.get();
  if (existing.exists) {
    // Le doc existe déjà : supprimer puis recréer (delete est interdit sans auth,
    // donc on signale que la demande est déjà en cours)
    const currentStatus = existing.data().status;
    if (currentStatus === "en_attente") {
      console.log("📩 Demande 2ème chance déjà en attente:", docId);
      return; // Pas besoin de réécrire
    }
    // Si refusée ou acceptée, on ne peut pas recréer sans auth → erreur claire
    throw new Error("Une demande existe déjà pour ce devoir (status: " + currentStatus + ").");
  }

  // Nouveau document → create (autorisé sans auth dans les règles)
  await ref.set({
    eleveCode: eleveCode,
    devoirId: devoirId,
    classe: classe || "?",
    status: "en_attente",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdAtISO: new Date().toISOString()
  });
  console.log("📩 Demande 2ème chance envoyée:", docId);
};

window.verifier2eChanceFirestore = async function (eleveCode, devoirId) {
  const docId = `${eleveCode}_${devoirId}`;
  const snap = await db.collection("demandes_2chance").doc(docId).get();
  if (!snap.exists) return null;
  return snap.data().status; // "en_attente", "acceptee", "refusee"
};

// ════════════════════════════════════════════════════════════════
// FLUSH : renvoyer les copies en attente (backup localStorage)
// ════════════════════════════════════════════════════════════════
window.flushPendingDevoirs = function() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("devoir_backup_")) continue;
      let raw;
      try { raw = localStorage.getItem(k); } catch(e) { continue; }
      if (!raw) continue;
      let backup;
      try { backup = JSON.parse(raw); } catch(e) { continue; }
      if (!backup || !backup.eleveCode || !backup.stableDocId || !backup.data) continue;

      console.log("🔄 [FLUSH] Renvoi copie backup:", backup.stableDocId);
      (function(bk, storageKey) {
        db.collection("resultats").doc(bk.eleveCode).collection("copies").doc(bk.stableDocId).set(bk.data)
          .then(function() {
            console.log("✅ [FLUSH] Copie backup envoyee:", bk.stableDocId);
            try { localStorage.removeItem(storageKey); } catch(e) {}
            runnerToast("Copie en attente envoyee avec succes.", "success");
          })
          .catch(function(err) {
            console.warn("❌ [FLUSH] Echec renvoi copie:", err.message);
          });
      })(backup, k);
    }
  } catch(e) { console.warn("[FLUSH] Erreur flush devoirs:", e); }
};

// Auto-flush au chargement
try { window.flushPendingDevoirs(); } catch(e) {}

// Ré-envoi automatique quand la connexion revient (pas seulement au rechargement)
try {
  window.addEventListener("online", function () {
    runnerToast("Connexion revenue — envoi des copies en attente...", "info");
    try { window.flushPendingDevoirs(); } catch (e) {}
    const b = document.getElementById("pse-runner-banner");
    if (b) b.style.display = "none";
  });
  window.addEventListener("offline", function () {
    runnerBanner("⚠️ Connexion perdue. Tes réponses sont gardées ; ne ferme pas la page, l'envoi repartira au retour du réseau.");
  });
} catch (e) {}

// Pré-vol : prévenir si l'appareil est déjà hors-ligne au chargement
try { if (!navigator.onLine) runnerBanner("⚠️ Pas de connexion Internet. Préviens ton professeur avant de composer."); } catch (e) {}

console.log("✅ window.envoyerCopie prêt (v7.4.0 RGPD compat - resultats/{eleveCode}/copies/)");
