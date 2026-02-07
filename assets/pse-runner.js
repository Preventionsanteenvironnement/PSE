// ════════════════════════════════════════════════════════════════════════
// PSE RUNNER v7.4 - CORRECTIF URGENT
// 🛠️ FIX: Ajout compatibilité legacy window.tenterEnvoi
// Collection : resultats/{eleveCode}/copies/{docId}
// Date : 07 février 2026
// RGPD : Aucun nom/prénom stocké - uniquement code + classe
// ════════════════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.appspot.com",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

const RUNNER_VERSION = "7.4";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// exposition pour annuaire.js / cockpit
window.db = db;
window.PSE_DB = db;
window.__PSE_DB_READY = true;

// double signal (immédiat + async) pour éviter le cas où annuaire.js est déjà chargé
try { window.dispatchEvent(new Event("pse-db-ready")); } catch {}
setTimeout(() => { try { window.dispatchEvent(new Event("pse-db-ready")); } catch {} }, 0);

let _visibilityChanges = 0;
let _blurCount = 0;

document.addEventListener("visibilitychange", () => { _visibilityChanges++; }, true);
window.addEventListener("blur", () => { _blurCount++; }, true);

function getDevoirId() {
  return document.body?.dataset?.idExercice || document.body?.dataset?.devoirId || "unknown";
}

function getTitre() {
  return document.querySelector(".main-title-editable")?.textContent?.trim()
    || document.querySelector("h1")?.textContent?.trim()
    || document.title?.trim()
    || "Devoir PSE";
}

function ensureStartTime() {
  const devoirId = getDevoirId();
  const key = "devoir_start_time_" + devoirId;
  if (!localStorage.getItem(key)) localStorage.setItem(key, String(Date.now()));
}

async function ensureEleveCode() {
  const inp = document.getElementById("code-eleve");
  const existing = (inp?.value || "").trim();
  if (existing && existing.length >= 2) return existing.toUpperCase();

  if (typeof window.demanderCode === "function") {
    if (window.__PSE_CODE_PROMPT_DONE) return null;
    window.__PSE_CODE_PROMPT_DONE = true;
    
    try {
      const user = await window.demanderCode(getTitre());
      if (user?.code) {
        if (inp) inp.value = user.code;
        window.eleveData = user;
        return user.code.toUpperCase();
      }
    } catch (e) {
      console.warn("Erreur demande code:", e);
    }
  }

  const manual = prompt("Code élève:");
  if (manual && manual.trim().length >= 2) {
    const code = manual.trim().toUpperCase();
    if (inp) inp.value = code;
    return code;
  }
  
  return null;
}

function showStartWarningOnce() {
  if (window.__PSE_WARNING_SHOWN) return;
  window.__PSE_WARNING_SHOWN = true;

  const existing = document.querySelector("#pse-start-warning");
  if (existing) return;

  const box = document.createElement("div");
  box.id = "pse-start-warning";
  box.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white; padding: 12px 20px; border-radius: 25px;
    font-family: system-ui; font-size: 14px; font-weight: 500;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    z-index: 10000; max-width: 90%; text-align: center;
    border: 2px solid rgba(255,255,255,0.3);
  `;
  box.innerHTML = `🛡️ <strong>Surveillance active</strong> • Copier-coller contrôlé`;
  
  document.body.appendChild(box);
  setTimeout(() => { if (box.parentNode) box.remove(); }, 4000);
}

function ensurePasteBanner() {
  let box = document.getElementById("paste-alert");
  if (!box) {
    box = document.createElement("div");
    box.id = "paste-alert";
    box.style.cssText = `
      display: none; margin: 15px auto; padding: 12px 16px;
      background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px;
      color: #92400e; font-weight: 600; font-size: 14px; text-align: center;
      max-width: 600px; box-shadow: 0 2px 4px rgba(245,158,11,0.1);
    `;
    const container = document.querySelector(".container") || document.body;
    container.appendChild(box);
  }
  return box;
}

function installExternalPasteWarningIfMissing() {
  const devoirId = getDevoirId();
  const KEY = "paste_log_" + devoirId;
  const msg = "⚠️ Attention : collage externe détecté et enregistré. Tape ta réponse.";

  function isExternalPaste(e) {
    try {
      const dt = e.clipboardData;
      if (!dt) return true;
      const html = dt.getData("text/html") || "";
      return !html.includes('data-origin="pse-document"');
    } catch {
      return true;
    }
  }

  function bumpExternalPaste(target) {
    const raw = localStorage.getItem(KEY);
    const st = raw ? JSON.parse(raw) : { total: 0, external: 0, document: 0, details: [] };
    st.total++;
    st.external++;
    st.details = st.details || [];
    st.details.push({
      ts: Date.now(),
      id: target?.id || null,
      qid: target?.dataset?.qid || null
    });
    localStorage.setItem(KEY, JSON.stringify(st));
  }

  document.addEventListener("paste", (e) => {
    if (!isExternalPaste(e)) return;

    bumpExternalPaste(e.target);
    e.preventDefault();

    const box = ensurePasteBanner();
    box.style.display = "block";
    box.textContent = "Attention : le copier-coller est surveillé (collage externe détecté).";

    alert(msg);
  }, true);
}

function readPasteStatsFallback() {
  const devoirId = getDevoirId();
  const raw = localStorage.getItem("paste_log_" + devoirId);
  if (!raw) return { total: 0, external: 0, document: 0 };
  try { return JSON.parse(raw); } catch { return { total: 0, external: 0, document: 0 }; }
}

function collectReponses() {
  const reponses = {};
  
  // Priorité 1: .reponse-eleve avec data-qid
  document.querySelectorAll(".reponse-eleve[data-qid]").forEach(el => {
    const qid = el.dataset.qid;
    if (!qid) return;

    if (el.type === "checkbox" || el.type === "radio") {
      if (el.checked) {
        if (!reponses[qid]) reponses[qid] = [];
        if (!reponses[qid].includes(el.value)) reponses[qid].push(el.value);
      }
    } else {
      const val = (el.value || "").trim();
      if (val) reponses[qid] = val;
    }
  });

  // Fallback: éléments avec id ou name (legacy)
  document.querySelectorAll("input, select, textarea").forEach(el => {
    const key = el.id || el.name;
    if (!key || reponses[key]) return; // Déjà traité
    
    if (el.type === "checkbox" || el.type === "radio") {
      if (el.checked) {
        if (!reponses[key]) reponses[key] = [];
        if (!reponses[key].includes(el.value)) reponses[key].push(el.value);
      }
    } else {
      const val = (el.value || "").trim();
      if (val) reponses[key] = val;
    }
  });

  return reponses;
}

window.envoyerCopie = async function(code, pasteStats, eleveData) {
  console.log("📤 Envoi...", { code, eleveData });

  try {
    const eleveInfo = eleveData || window.eleveData || { code: code, classe: "?" };
    const finalCode = (code || eleveInfo.code || await ensureEleveCode() || "").trim().toUpperCase();

    if (!finalCode || finalCode.length < 2) {
      throw new Error("Code élève requis (au moins 2 caractères)");
    }

    const reponses = collectReponses();
    if (Object.keys(reponses).length === 0) {
      throw new Error("Aucune réponse détectée");
    }

    const devoirId = getDevoirId();
    const titre = getTitre();
    const startKey = "devoir_start_time_" + devoirId;
    const startTime = parseInt(localStorage.getItem(startKey)) || Date.now();
    const duration = Math.round((Date.now() - startTime) / 1000);

    const pasteData = pasteStats || readPasteStatsFallback();
    
    const payload = {
      devoirId: devoirId,
      titre: titre,
      reponses: reponses,
      eleve: {
        userCode: finalCode,
        classe: eleveInfo.classe || "UNKNOWN"
      },
      pasteStats: pasteData,
      meta: {
        visibilityChanges: _visibilityChanges,
        blurCount: _blurCount,
        durationSeconds: duration,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      },
      timestamps: {
        start: new Date(startTime).toISOString(),
        end: serverTimestamp()
      }
    };

    console.log("📦 Payload:", payload);

    const docId = `${devoirId}_${Date.now()}`;
    const docRef = doc(db, "resultats", finalCode, "copies", docId);
    
    await setDoc(docRef, payload);
    
    console.log(
      `✅ Envoyé: resultats/${finalCode}/copies/${docId}`,
      `Réponses: ${Object.keys(reponses).length}`,
      `Durée: ${duration}s`,
      `Paste: ${pasteData.external || 0} externe`
    );

    localStorage.removeItem("paste_log_" + devoirId);
    localStorage.removeItem(startKey);

    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:flex-start;height:100vh;flex-direction:column;font-family:Arial;text-align:center;padding:20px;">
        <div style="font-size:4rem;">✅</div>
        <h1 style="color:#16a34a;">Copie envoyée !</h1>
        <p style="color:#64748b;margin-top:10px;">
          Code : ${finalCode}<br>
          ${titre}<br>
          ${Object.keys(reponses).length} réponses enregistrées
        </p>
        <p style="color:#94a3b8;margin-top:20px;font-size:0.9em;">
          Vous pouvez fermer cette fenêtre.
        </p>
      </div>
    `;

  } catch (error) {
    console.error("❌ Erreur:", error);
    alert("❌ ERREUR: " + (error?.message || error));
    throw error;
  }
};

async function initRunner() {
  try {
    ensureStartTime();
    showStartWarningOnce();
    installExternalPasteWarningIfMissing();
    await ensureEleveCode();
  } catch (e) {
    console.warn("Init runner: ", e);
  }
}

// IMPORTANT : si le module se charge après DOMContentLoaded, on initialise quand même
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initRunner, { once: true });
} else {
  initRunner();
}

console.log(`🚀 PSE Runner v${RUNNER_VERSION} RGPD - Structure : resultats/{eleveCode}/copies/`);

// ============================================================================
// 🛠️ FIX CRITIQUE : COMPATIBILITÉ LEGACY
// ============================================================================
window.tenterEnvoi = window.envoyerCopie; // ✅ LIGNE AJOUTÉE POUR CORRIGER LE BUG

console.log(`✅ window.envoyerCopie prêt (v${RUNNER_VERSION} RGPD - resultats/{eleveCode}/copies/)`);
console.log(`✅ Compatibilité legacy: window.tenterEnvoi disponible`); // ✅ LIGNE AJOUTÉE POUR CORRIGER LE BUG
