// ════════════════════════════════════════════════════════════════════════
// pse-runner.js - Version 7.0 (RGPD COMPLIANT)
// Collection : resultats/{eleveCode}/copies/{docId}
// Date : 26 janvier 2026
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.db = db;
window.PSE_DB = db;

const RUNNER_VERSION = "7.1";
let _visibilityChanges = 0;
let _blurCount = 0;

document.addEventListener("visibilitychange", () => { _visibilityChanges++; }, true);
window.addEventListener("blur", () => { _blurCount++; }, true);

function getDevoirId() {
  return document.body?.dataset?.idExercice || "unknown";
}

function getTitre() {
  return document.querySelector(".main-title-editable")?.textContent?.trim()
    || document.querySelector("h1")?.textContent?.trim()
    || document.title?.trim()
    || "Devoir PSE";
}

async function ensureEleveCode() {
  const inp = document.getElementById("code-eleve");
  const existing = (inp?.value || "").trim();
  if (existing && existing.length >= 2) return existing.toUpperCase();

  if (typeof window.demanderCode === "function") {
    // évite les boucles infinies si l'élève ferme la modale
    if (window.__PSE_CODE_PROMPT_DONE) return null;
    window.__PSE_CODE_PROMPT_DONE = true;

    const user = await window.demanderCode(getTitre());
    const code = (user?.code || "").trim();
    if (code && code.length >= 2) {
      if (inp) inp.value = code.toUpperCase();
      window.eleveData = user;
      return code.toUpperCase();
    }
  }
  return null;
}

function showStartWarningOnce() {
  if (window.__PSE_START_WARNING_SHOWN) return;
  window.__PSE_START_WARNING_SHOWN = true;

  if (document.body?.dataset?.pseStartWarning === "off") return;

  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;";
  const card = document.createElement("div");
  card.style.cssText = "background:#fff;border-radius:14px;max-width:560px;width:100%;padding:18px 18px 14px;font-family:Arial;box-shadow:0 10px 40px rgba(0,0,0,.35);";
  card.innerHTML = `
    <div style="font-size:1.1rem;font-weight:700;margin-bottom:8px;">Avant de commencer</div>
    <div style="font-size:.95rem;line-height:1.4;color:#111827;">
      Travail personnel. Le collage externe n’est pas autorisé.
      <br><br>
      En cas de collage externe, un avertissement s’affiche et c’est comptabilisé.
      <div style="margin-top:10px;color:#6b7280;font-size:.9rem;">Clique sur Continuer pour démarrer.</div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px;">
      <button id="pseStartOk" style="background:#111827;color:#fff;border:0;border-radius:10px;padding:10px 14px;cursor:pointer;">Continuer</button>
    </div>
  `;
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  card.querySelector("#pseStartOk").addEventListener("click", () => overlay.remove());
}

function installExternalPasteWarningIfMissing() {
  // si le master gère déjà le collage + stats, on ne touche pas
  if (typeof window.getPasteStats === "function" || window.__PSE_PASTE_GUARD_INSTALLED) return;
  window.__PSE_PASTE_GUARD_INSTALLED = true;

  const devoirId = getDevoirId();
  const KEY = "paste_log_" + devoirId;
  const msg = "Collage externe détecté : ce n’est pas autorisé. Tape ta réponse.";

  function isExternalPaste(e) {
    try {
      const dt = e.clipboardData;
      if (!dt) return true;
      const html = dt.getData("text/html") || "";
      // convention : le master peut marquer les copies internes
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
    alert(msg);
  }, true);
}

function readPasteStatsFallback() {
  const devoirId = getDevoirId();
  const raw = localStorage.getItem("paste_log_" + devoirId);
  if (!raw) return { total: 0, external: 0, document: 0 };
  try { return JSON.parse(raw); } catch { return { total: 0, external: 0, document: 0 }; }
}

function ensureStartTime() {
  const devoirId = getDevoirId();
  const key = "devoir_start_time_" + devoirId;
  if (!localStorage.getItem(key)) localStorage.setItem(key, String(Date.now()));
}

document.addEventListener("DOMContentLoaded", async () => {
  ensureStartTime();
  showStartWarningOnce();
  installExternalPasteWarningIfMissing();
  await ensureEleveCode();
});


console.log("🚀 PSE Runner v7.0 RGPD - Structure : resultats/{eleveCode}/copies/");

window.envoyerCopie = async function(code, pasteStats, eleveData) {
    console.log("📤 Envoi...", { code, eleveData });
    
    try {
        const eleveInfo = eleveData || { code: code, classe: "?" };
        const eleveCode = (eleveInfo.code || code).toUpperCase().trim();
        
        if (!eleveCode || eleveCode.length < 2) {
            const recovered = await ensureEleveCode();
            if (!recovered) throw new Error("Code élève invalide");
        }
        
        // ════════════════════════════════════════════════════════════════
        // COLLECTE DES RÉPONSES
        // ════════════════════════════════════════════════════════════════
        const reponses = {};
        
        // 1. Textarea et inputs avec data-qid
        document.querySelectorAll('.reponse-eleve').forEach((el, idx) => {
            const qid = el.dataset.qid;
            
            let value = '';
            if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
                if (el.type === 'radio') {
                    if (el.checked) {
                        value = el.value;
                    } else {
                        return;
                    }
                } else if (el.type === 'checkbox') {
                    if (el.checked) {
                        value = el.value || 'checked';
                    } else {
                        return;
                    }
                } else {
                    value = el.value.trim();
                }
            }
            
            if (!value) return;
            
            if (qid) {
                if (reponses[qid]) {
                    if (Array.isArray(reponses[qid])) {
                        reponses[qid].push(value);
                    } else {
                        reponses[qid] = [reponses[qid], value];
                    }
                } else {
                    reponses[qid] = value;
                }
            } else {
                const questionBlock = el.closest('.question-block');
                const numDisplay = questionBlock?.querySelector('.num-display');
                const numSelector = questionBlock?.querySelector('.num-selector');
                let questionNum = numDisplay?.textContent?.trim() 
                               || numSelector?.value 
                               || `Q${idx + 1}`;
                
                let key = questionNum;
                let suffix = 1;
                while (reponses[key] !== undefined) {
                    key = `${questionNum}_${suffix}`;
                    suffix++;
                }
                reponses[key] = value;
            }
        });
        
        // 2. QCM checkboxes
        document.querySelectorAll('.save-me-qcm:checked').forEach((el) => {
            const qid = el.dataset.qid;
            const label = el.closest('label')?.textContent?.trim() || el.value;
            if (qid) {
                if (reponses[qid]) {
                    if (Array.isArray(reponses[qid])) {
                        reponses[qid].push(label);
                    } else {
                        reponses[qid] = [reponses[qid], label];
                    }
                } else {
                    reponses[qid] = label;
                }
            }
        });
        
        // 3. Matching (reliage)
        document.querySelectorAll('.save-me-match').forEach((el) => {
            const questionBlock = el.closest('.question-block');
            const qidFromBlock = questionBlock?.querySelector('[data-qid]')?.dataset.qid;
            const id = el.dataset.id || `match_${Math.random().toString(36).substr(2, 9)}`;
            
            if (el.value) {
                reponses[id] = el.value;
                
                if (qidFromBlock) {
                    if (!reponses[qidFromBlock]) reponses[qidFromBlock] = [];
                    if (!Array.isArray(reponses[qidFromBlock])) reponses[qidFromBlock] = [reponses[qidFromBlock]];
                    const leftText = el.closest('tr')?.querySelector('.matching-left')?.textContent || '';
                    reponses[qidFromBlock].push(`${leftText} → ${el.value}`);
                }
            }
        });
        
        // 4. Textes à trous
        document.querySelectorAll('.trou-eleve').forEach((el, i) => {
            const questionBlock = el.closest('.question-block');
            const qidFromBlock = questionBlock?.querySelector('[data-qid]')?.dataset.qid;
            const qid = el.dataset.qid || `trou_${i}`;
            const value = el.tagName === 'SELECT' ? el.value : el.value.trim();
            
            if (value) {
                reponses[qid] = value;
                
                if (qidFromBlock && qidFromBlock !== qid) {
                    if (!reponses[qidFromBlock + '_trous']) reponses[qidFromBlock + '_trous'] = [];
                    reponses[qidFromBlock + '_trous'].push(value);
                }
            }
        });
        
        // 5. Matrice de risque
        document.querySelectorAll('.risk-cell-value').forEach((el) => {
            const qid = el.dataset.qid;
            if (qid && el.value) {
                reponses[qid + '_matrice'] = el.value;
            }
        });
        
        // 6. Radios de décision
        document.querySelectorAll('input[type="radio"][name*="decision"]:checked').forEach((el) => {
            const qid = el.dataset.qid;
            if (qid) {
                reponses[qid + '_decision'] = el.value;
            }
        });
        
        // 7. Radios de gravité
        document.querySelectorAll('input[type="radio"][name*="grav"]:checked').forEach((el) => {
            const qid = el.dataset.qid;
            if (qid && !reponses[qid + '_gravite']) {
                reponses[qid + '_gravite'] = el.value;
            }
        });
        
        console.log("📋 Réponses collectées:", reponses);
        console.log("📊 Nombre de réponses:", Object.keys(reponses).length);
        
        // ════════════════════════════════════════════════════════════════
        // CALCUL DES COMPÉTENCES
        // ════════════════════════════════════════════════════════════════
        const competences = {};
        let totalPoints = 0, maxPoints = 0;
        
        document.querySelectorAll('.question-block').forEach(block => {
            const compSelector = block.querySelector('.comp-selector');
            const compDisplay = block.querySelector('.comp-display');
            const scoreInput = block.querySelector('.student-score');
            const maxInput = block.querySelector('.point-input');
            
            const comp = compSelector?.value || compDisplay?.textContent?.trim();
            const score = parseFloat(scoreInput?.value) || 0;
            const max = parseFloat(maxInput?.value) || 0;
            
            if(comp && max > 0) {
                const ratio = score / max;
                let niveau = ratio >= 0.85 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.40 ? 1 : 0;
                if(!competences[comp]) competences[comp] = 0;
                competences[comp] += niveau;
                totalPoints += score;
                maxPoints += max;
            }
        });
        
        const noteSur20 = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 20 * 10) / 10 : 0;
        
        // ════════════════════════════════════════════════════════════════
        // TEMPS ET MÉTADONNÉES
        // ════════════════════════════════════════════════════════════════
        const devoirId = document.body.dataset.idExercice || "unknown";
        const startTime = parseInt(localStorage.getItem('devoir_start_time_' + devoirId)) || Date.now();
        const tempsSecondes = Math.floor((Date.now() - startTime) / 1000);
        
        const titre = document.querySelector('.main-title-editable')?.textContent.trim() 
                   || document.querySelector('h1')?.textContent.trim()
                   || "Devoir PSE";
        
        // ════════════════════════════════════════════════════════════════
        // ⭐ STRUCTURE DU DOCUMENT (v7.0 RGPD - sans nom/prénom)
        // ════════════════════════════════════════════════════════════════
        const data = {
            // Identifiants
            eleveCode: eleveCode,
            devoirId: devoirId,
            exercice: devoirId,
            titre: titre,
            
            // Infos élève (RGPD : uniquement code + classe)
            classe: eleveInfo.classe,
            eleve: { 
                userCode: eleveCode, 
                classe: eleveInfo.classe 
            },
            
            // Contenu
            reponses: reponses,
            competences: competences,
            
            // Notes
            note_auto: noteSur20,
            score: noteSur20,
            // note_finale sera ajoutée par le prof lors de la correction
            
            // Métadonnées
            temps_secondes: tempsSecondes,
            pasteStats: pasteStats || (typeof window.getPasteStats === "function" ? window.getPasteStats() : readPasteStatsFallback()),

            meta: {
              runnerVersion: RUNNER_VERSION,
              masterVersion: document.body?.dataset?.masterVersion || "unknown",
              startedAtISO: new Date(parseInt(localStorage.getItem('devoir_start_time_' + devoirId)) || Date.now()).toISOString(),
              durationSec: tempsSecondes,
              visibilityChanges: _visibilityChanges,
              blurCount: _blurCount,
              sendAttempts: (window.__PSE_SEND_ATTEMPTS = (window.__PSE_SEND_ATTEMPTS || 0) + 1),
              answeredCount: Object.keys(reponses).length,
              totalQuestions: document.querySelectorAll(".question-block").length
            },
            
            // Timestamps
            createdAt: serverTimestamp(),
            createdAtISO: new Date().toISOString(),
            ts: Date.now()
        };
        
        // ════════════════════════════════════════════════════════════════
        // ⭐ ÉCRITURE DANS resultats/{eleveCode}/copies/{docId}
        // ════════════════════════════════════════════════════════════════
        const docId = `${devoirId}_${Date.now()}`;
        const docPath = `resultats/${eleveCode}/copies/${docId}`;
        
        await setDoc(doc(db, "resultats", eleveCode, "copies", docId), data);
        
        console.log("✅ Envoyé dans:", docPath);
        console.log("📦 Data:", data);
        
        alert("✅ COPIE ENVOYÉE !\n\n" + 
              "👤 Code : " + eleveCode + "\n" + 
              "📝 " + titre + "\n" +
              "📊 Réponses: " + Object.keys(reponses).length);
        
        // Nettoyage localStorage
        localStorage.removeItem('paste_log_' + devoirId);
        localStorage.removeItem('devoir_start_time_' + devoirId);
        
        // Écran de confirmation
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:Arial;text-align:center;padding:20px;">
                <div style="font-size:4rem;">✅</div>
                <h1 style="color:#16a34a;">Copie envoyée !</h1>
                <p style="color:#64748b;margin-top:10px;">
                    Code : ${eleveCode}<br>
                    ${titre}<br>
                    ${Object.keys(reponses).length} réponses enregistrées
                </p>
                <p style="color:#94a3b8;margin-top:20px;font-size:0.9em;">
                    Vous pouvez fermer cette fenêtre.
                </p>
            </div>
        `;
        
    } catch(error) {
        console.error("❌ Erreur:", error);
        alert("❌ ERREUR: " + error.message);
        throw error;
    }
};

console.log("✅ window.envoyerCopie prêt (v7.0 RGPD - resultats/{eleveCode}/copies/)");
