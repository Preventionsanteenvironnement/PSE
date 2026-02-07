// ════════════════════════════════════════════════════════════════════════
// PSE RUNNER v8.0 - COMPLET SELON CAHIER DES CHARGES
// 🎯 Identification + Surveillance + Anti-triche + Collecte + Envoi
// Collection : resultats/{eleveCode}/copies/{devoirId_timestamp}
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

const RUNNER_VERSION = "8.0";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ════════════════════════════════════════════════════════════════════════
// 🔌 10. Pont Cockpit Prof - Exposition Firebase
// ════════════════════════════════════════════════════════════════════════
window.db = db;
window.PSE_DB = db;
window.__PSE_DB_READY = true;

try { window.dispatchEvent(new Event("pse-db-ready")); } catch {}

// ════════════════════════════════════════════════════════════════════════
// Variables globales du runner
// ════════════════════════════════════════════════════════════════════════
let _eleveData = null;
let _devoirStartTime = null;
let _visibilityChanges = 0;
let _blurCount = 0;
let _pasteStats = { total: 0, internal: 0, external: 0, blocked: 0, details: [] };

// ════════════════════════════════════════════════════════════════════════
// 👁️ 3. Surveillance de comportement
// ════════════════════════════════════════════════════════════════════════
document.addEventListener("visibilitychange", () => { _visibilityChanges++; }, true);
window.addEventListener("blur", () => { _blurCount++; }, true);

// ════════════════════════════════════════════════════════════════════════
// ANNUAIRE INTÉGRÉ (Point 1 - Identification)
// ════════════════════════════════════════════════════════════════════════
const ANNUAIRE = {
  // B1AGO1 (10 élèves)
  "AB12": "B1AGO1", "CD34": "B1AGO1", "EF56": "B1AGO1", "GH78": "B1AGO1",
  "IJ90": "B1AGO1", "KL21": "B1AGO1", "MN43": "B1AGO1", "OP65": "B1AGO1", "QR87": "B1AGO1", "ST09": "B1AGO1",
  
  // B1AGO2 (10 élèves)
  "UV32": "B1AGO2", "WX54": "B1AGO2", "YZ76": "B1AGO2", "BA98": "B1AGO2",
  "DC10": "B1AGO2", "FE31": "B1AGO2", "HG53": "B1AGO2", "JI75": "B1AGO2", "LK97": "B1AGO2", "NM19": "B1AGO2",
  
  // B2GATL1 (10 élèves)
  "PO41": "B2GATL1", "QR63": "B2GATL1", "TS85": "B2GATL1", "VU07": "B2GATL1",
  "XW29": "B2GATL1", "ZY51": "B2GATL1", "AC73": "B2GATL1", "BE95": "B2GATL1", "DF17": "B2GATL1", "GH39": "B2GATL1",
  
  // B2GATL2 (10 élèves)  
  "IJ61": "B2GATL2", "KL83": "B2GATL2", "MN05": "B2GATL2", "OP27": "B2GATL2",
  "QR49": "B2GATL2", "ST71": "B2GATL2", "UV93": "B2GATL2", "WX15": "B2GATL2", "YZ37": "B2GATL2", "BA59": "B2GATL2",
  
  // BTAGO1 (9 élèves)
  "DC81": "BTAGO1", "FE03": "BTAGO1", "HG25": "BTAGO1", "JI47": "BTAGO1",
  "LK69": "BTAGO1", "NM91": "BTAGO1", "PO13": "BTAGO1", "QR35": "BTAGO1", "TS57": "BTAGO1",
  
  // BTAGO2 (9 élèves)
  "VU79": "BTAGO2", "XW01": "BTAGO2", "ZY23": "BTAGO2", "AC45": "BTAGO2",
  "BE67": "BTAGO2", "DF89": "BTAGO2", "GH11": "BTAGO2", "IJ33": "BTAGO2", "KL55": "BTAGO2",
  
  // Codes de test
  "TEST": "DEMO", "PROF": "ADMIN", "DEBUG": "TEST"
};

function getDevoirId() {
  return document.body?.dataset?.idExercice || document.body?.dataset?.devoirId || "unknown";
}

function getTitre() {
  return document.querySelector("h1")?.textContent?.trim()
    || document.title?.trim()
    || "Devoir PSE";
}

// ════════════════════════════════════════════════════════════════════════
// ⏱️ 2. Temps de travail  
// ════════════════════════════════════════════════════════════════════════
function initStartTime() {
  const devoirId = getDevoirId();
  const startKey = `devoir_start_time_${devoirId}`;
  
  if (!localStorage.getItem(startKey)) {
    _devoirStartTime = Date.now();
    localStorage.setItem(startKey, String(_devoirStartTime));
  } else {
    _devoirStartTime = parseInt(localStorage.getItem(startKey));
  }
}

// ════════════════════════════════════════════════════════════════════════
// 📋 4. Avertissement de départ (Modale 1)
// ════════════════════════════════════════════════════════════════════════
function showWarningModal() {
  const devoirId = getDevoirId();
  const warningKey = `pse_warning_shown_${devoirId}`;
  
  // Une seule fois par devoir
  if (localStorage.getItem(warningKey)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.95);
      z-index: 99999; display: flex; align-items: center; justify-content: center;
      font-family: system-ui, -apple-system, sans-serif; color: white;
      backdrop-filter: blur(8px);
    `;
    
    overlay.innerHTML = `
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); 
                  padding: 35px; border-radius: 16px; text-align: center; 
                  max-width: 450px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                  border: 1px solid rgba(255,255,255,0.1);">
        
        <div style="font-size: 2.5rem; margin-bottom: 15px;">⚠️</div>
        <h2 style="margin: 0 0 20px 0; font-size: 1.4rem; color: #f1f5f9;">Avant de commencer</h2>
        
        <div style="text-align: left; background: rgba(59, 130, 246, 0.1); 
                    border: 1px solid rgba(59, 130, 246, 0.3); padding: 20px; 
                    border-radius: 10px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; color: #93c5fd; font-size: 1rem;">Règles importantes :</h3>
          <ul style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li><strong>Travail personnel :</strong> Rédigez avec vos propres mots</li>
            <li><strong>Copier-coller externe interdit :</strong> Collage surveillé et enregistré</li>
            <li><strong>Comportement surveillé :</strong> Changements d'onglet détectés</li>
            <li><strong>Une seule chance :</strong> Vérifiez avant d'envoyer</li>
          </ul>
        </div>
        
        <button id="pse-continue-btn" 
                style="width: 100%; padding: 15px; background: linear-gradient(135deg, #16a34a, #15803d);
                       color: white; border: none; border-radius: 10px; font-size: 16px; 
                       font-weight: 600; cursor: pointer;
                       transition: transform 0.2s, box-shadow 0.2s;">
          J'ai compris, continuer
        </button>
        
        <p style="color: #64748b; font-size: 0.8rem; margin: 15px 0 0 0;">
          ${getTitre()}
        </p>
      </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    const btn = overlay.querySelector("#pse-continue-btn");
    btn.addEventListener("click", () => {
      localStorage.setItem(warningKey, "true");
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.3s ease-out";
      
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
        resolve();
      }, 300);
    });
    
    // Effet hover
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-1px)";
      btn.style.boxShadow = "0 6px 20px rgba(22, 163, 74, 0.4)";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translateY(0)";
      btn.style.boxShadow = "none";
    });
  });
}

// ════════════════════════════════════════════════════════════════════════
// 🧠 1. Identification élève (Modale 2)
// ════════════════════════════════════════════════════════════════════════
function demandCodeEleve() {
  // Vérifier d'abord le champ #code-eleve
  const codeField = document.getElementById("code-eleve");
  const existingCode = (codeField?.value || "").trim().toUpperCase();
  
  if (existingCode && existingCode.length >= 2 && ANNUAIRE[existingCode]) {
    _eleveData = { code: existingCode, classe: ANNUAIRE[existingCode] };
    return Promise.resolve(_eleveData);
  }
  
  // Modale annuaire.js (priorité)
  if (typeof window.demanderCode === "function") {
    return window.demanderCode(getTitre()).then(user => {
      if (user?.code) {
        _eleveData = user;
        // Remplir le champ si présent
        if (codeField) codeField.value = user.code;
        return _eleveData;
      }
      return fallbackPromptCode();
    }).catch(() => {
      return fallbackPromptCode();
    });
  }
  
  // Fallback prompt()
  return fallbackPromptCode();
}

function fallbackPromptCode() {
  return new Promise((resolve, reject) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.95);
      z-index: 99999; display: flex; align-items: center; justify-content: center;
      font-family: system-ui, -apple-system, sans-serif; color: white;
    `;
    
    overlay.innerHTML = `
      <div style="background: #1e293b; padding: 30px; border-radius: 15px; text-align: center; 
                  max-width: 350px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        
        <div style="font-size: 2.5rem; margin-bottom: 15px;">🔒</div>
        <h2 style="margin: 0 0 10px 0; font-size: 1.3rem; color: #f1f5f9;">Code élève</h2>
        <p style="color: #cbd5e1; margin-bottom: 20px; font-size: 0.9rem;">
          Saisissez votre code d'accès
        </p>
        
        <input type="text" id="pse-code-input" placeholder="Ex: AB12" 
               style="width: 100%; padding: 12px; font-size: 16px; border: 1px solid #475569;
                      border-radius: 8px; background: white; text-align: center;
                      text-transform: uppercase; margin-bottom: 15px; outline: none;
                      color: #1e293b; font-weight: 600;">
        
        <button id="pse-validate-code" 
                style="width: 100%; padding: 12px; background: #3b82f6;
                       color: white; border: none; border-radius: 8px; font-size: 15px; 
                       font-weight: 600; cursor: pointer; margin-bottom: 10px;">
          Valider
        </button>
        
        <div id="pse-code-error" style="color: #ef4444; font-size: 13px; min-height: 18px;"></div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const input = overlay.querySelector("#pse-code-input");
    const btn = overlay.querySelector("#pse-validate-code");
    const error = overlay.querySelector("#pse-code-error");
    
    function validateCode() {
      const code = input.value.trim().toUpperCase();
      
      if (!code || code.length < 2) {
        error.textContent = "Code trop court";
        return;
      }
      
      const classe = ANNUAIRE[code];
      if (!classe) {
        error.textContent = "Code inconnu";
        input.value = "";
        input.focus();
        return;
      }
      
      _eleveData = { code, classe };
      overlay.remove();
      resolve(_eleveData);
    }
    
    btn.addEventListener("click", validateCode);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") validateCode();
    });
    
    setTimeout(() => input.focus(), 100);
  });
}

// ════════════════════════════════════════════════════════════════════════
// 🚫📋 5. Anti-copier-coller avec signature automatique
// ════════════════════════════════════════════════════════════════════════
function setupAntiPasteSystem() {
  let lastCopyTime = 0;
  let lastCopyIsInternal = false;
  
  // Signer automatiquement le contenu copié
  document.addEventListener("copy", (e) => {
    try {
      const selection = window.getSelection();
      if (!selection || !selection.toString()) return;
      
      // Injection automatique de la signature
      const clipboardData = e.clipboardData;
      const selectedText = selection.toString();
      
      // Créer HTML avec signature
      const signedHTML = `<span data-origin="pse-certified-internal">${selectedText}</span>`;
      
      clipboardData.setData("text/plain", selectedText);
      clipboardData.setData("text/html", signedHTML);
      
      e.preventDefault();
      
      lastCopyTime = Date.now();
      lastCopyIsInternal = true;
      
    } catch (err) {
      // Si erreur, considérer comme externe
      lastCopyTime = Date.now();
      lastCopyIsInternal = false;
    }
  }, true);
  
  // Vérifier la signature au collage
  document.addEventListener("paste", (e) => {
    const now = Date.now();
    const isRecentCopy = (now - lastCopyTime) < 10000; // 10 secondes
    
    _pasteStats.total++;
    
    try {
      const clipboardData = e.clipboardData;
      const htmlData = clipboardData.getData("text/html");
      const hasSignature = htmlData.includes('data-origin="pse-certified-internal"');
      
      if (hasSignature && isRecentCopy && lastCopyIsInternal) {
        // Collage interne autorisé
        _pasteStats.internal++;
        return; // Laisser passer
      }
      
    } catch (err) {
      // Erreur = externe
    }
    
    // Collage externe = bloquer
    _pasteStats.external++;
    _pasteStats.blocked++;
    _pasteStats.details.push({
      timestamp: now,
      target: e.target?.id || e.target?.dataset?.qid || "unknown"
    });
    
    e.preventDefault();
    showPasteAlert();
    
  }, true);
}

// ════════════════════════════════════════════════════════════════════════
// 🚨 6. Alerte visuelle copier-coller
// ════════════════════════════════════════════════════════════════════════
function showPasteAlert() {
  // Bandeau visuel
  let alertBox = document.getElementById("paste-alert");
  
  if (!alertBox) {
    alertBox = document.createElement("div");
    alertBox.id = "paste-alert";
    alertBox.style.cssText = `
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white; padding: 12px 20px; border-radius: 8px;
      font-family: system-ui; font-size: 14px; font-weight: 600;
      z-index: 50000; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
      border: 1px solid rgba(255,255,255,0.2);
    `;
    document.body.appendChild(alertBox);
  }
  
  alertBox.textContent = "Copier-coller externe interdit - Action enregistrée";
  alertBox.style.display = "block";
  
  // Disparaît automatiquement
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 4000);
}

// ════════════════════════════════════════════════════════════════════════
// 🧾 7. Collecte des réponses (master-compatible)
// ════════════════════════════════════════════════════════════════════════
function collectReponses() {
  const reponses = {};
  
  // Priorité absolue : .reponse-eleve avec data-qid
  document.querySelectorAll(".reponse-eleve[data-qid]").forEach(el => {
    const qid = el.dataset.qid;
    if (!qid) return;

    if (el.type === "radio") {
      if (el.checked) {
        reponses[qid] = el.value;
      }
    } else if (el.type === "checkbox") {
      if (el.checked) {
        if (!reponses[qid]) reponses[qid] = [];
        reponses[qid].push(el.value);
      }
    } else if (el.tagName === "SELECT") {
      if (el.value) reponses[qid] = el.value;
    } else {
      const val = (el.value || "").trim();
      if (val) reponses[qid] = val;
    }
  });
  
  // Fallback pour anciens devoirs : inputs avec id ou name
  document.querySelectorAll("input, select, textarea").forEach(el => {
    const key = el.id || el.name;
    if (!key || reponses[key]) return; // Déjà traité ou pas d'identifiant
    
    if (el.type === "radio") {
      if (el.checked) reponses[key] = el.value;
    } else if (el.type === "checkbox") {
      if (el.checked) {
        if (!reponses[key]) reponses[key] = [];
        reponses[key].push(el.value);
      }
    } else if (el.tagName === "SELECT") {
      if (el.value) reponses[key] = el.value;
    } else {
      const val = (el.value || "").trim();
      if (val) reponses[key] = val;
    }
  });

  return reponses;
}

// ════════════════════════════════════════════════════════════════════════
// 📊 8. Fonction d'envoi (Données Firestore)
// ════════════════════════════════════════════════════════════════════════
window.envoyerCopie = async function() {
  try {
    console.log("📤 Démarrage envoi PSE...");
    
    // Vérifier authentification
    if (!_eleveData) {
      _eleveData = await demandCodeEleve();
    }
    
    const reponses = collectReponses();
    if (Object.keys(reponses).length === 0) {
      throw new Error("Aucune réponse détectée");
    }
    
    const devoirId = getDevoirId();
    const titre = getTitre();
    const duration = _devoirStartTime ? Math.round((Date.now() - _devoirStartTime) / 1000) : 0;
    
    // Structure Firestore voulue
    const payload = {
      eleveCode: _eleveData.code,
      classe: _eleveData.classe,
      devoirId: devoirId,
      titre: titre,
      reponses: reponses,
      pasteStats: _pasteStats,
      meta: {
        runnerVersion: RUNNER_VERSION,
        durationSeconds: duration,
        blurCount: _blurCount,
        visibilityChanges: _visibilityChanges,
        userAgent: navigator.userAgent,
        createdAt: serverTimestamp(),
        ts: new Date().toISOString()
      }
    };
    
    console.log("📦 Payload envoi:", payload);
    
    // Structure : resultats/<eleveCode>/copies/<devoirId_timestamp>
    const docId = `${devoirId}_${Date.now()}`;
    const docRef = doc(db, "resultats", _eleveData.code, "copies", docId);
    
    await setDoc(docRef, payload);
    
    console.log(`✅ Envoyé: resultats/${_eleveData.code}/copies/${docId}`);
    
    // Nettoyage localStorage
    localStorage.removeItem(`devoir_start_time_${devoirId}`);
    
    // Page de confirmation
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                  flex-direction:column;font-family:system-ui;text-align:center;padding:20px;
                  background:linear-gradient(135deg, #10b981, #059669); color: white;">
        <div style="background:white;padding:40px;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.3);
                    color: #1f2937; max-width: 500px; width: 90%;">
          <div style="font-size:4rem;margin-bottom:20px;">✅</div>
          <h1 style="color:#059669;margin:0 0 20px 0;">Copie envoyée !</h1>
          <div style="color:#374151;font-size:16px;line-height:1.6;">
            <p><strong>Code élève :</strong> ${_eleveData.code}</p>
            <p><strong>Classe :</strong> ${_eleveData.classe}</p>
            <p><strong>Devoir :</strong> ${titre}</p>
            <p><strong>Réponses :</strong> ${Object.keys(reponses).length} enregistrées</p>
            <p><strong>Durée :</strong> ${Math.floor(duration/60)}min ${duration%60}s</p>
          </div>
          <div style="margin-top:25px;padding:15px;background:#f3f4f6;border-radius:8px;color:#6b7280;font-size:14px;">
            Vous pouvez fermer cette fenêtre
          </div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error("❌ Erreur envoi PSE:", error);
    alert(`❌ Erreur lors de l'envoi :\n\n${error.message || error}`);
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════════════
// 🔄 9. Rétro-compatibilité absolue
// ════════════════════════════════════════════════════════════════════════
window.tenterEnvoi = window.envoyerCopie;

// Compatibilité annuaire.js
window.demanderCode = window.demanderCode || demandCodeEleve;
window.eleveData = _eleveData;

// ════════════════════════════════════════════════════════════════════════
// 🛡️ 11. Sécurité / robustesse + 📱 12. Compatibilité terrain
// ════════════════════════════════════════════════════════════════════════
async function initPSERunner() {
  try {
    console.log(`🚀 PSE Runner v${RUNNER_VERSION} - Initialisation...`);
    
    // Logs console explicites
    console.log("✅ Firebase initialisé");
    console.log("✅ Annuaire chargé:", Object.keys(ANNUAIRE).length, "codes");
    
    // ⏱️ 2. Temps de travail
    initStartTime();
    console.log("✅ Temps démarré:", new Date(_devoirStartTime).toLocaleTimeString());
    
    // 📋 4. Avertissement de départ (Modale 1)
    await showWarningModal();
    console.log("✅ Avertissement validé");
    
    // 🚫📋 5. Anti-copier-coller
    setupAntiPasteSystem();
    console.log("✅ Surveillance copier-coller active");
    
    // Auto-remplissage des champs
    const codeFields = document.querySelectorAll("#code-eleve, input[name='code'], input[placeholder*='code']");
    const dateFields = document.querySelectorAll("#date-eleve, #date-jour, input[type='date']");
    
    dateFields.forEach(field => { 
      if (!field.value) field.valueAsDate = new Date(); 
    });
    
    // Raccordement automatique boutons d'envoi
    const submitButtons = document.querySelectorAll(
      "#btn-envoi, #btnSend, .submit-btn, button[onclick*='envoi'], button[onclick*='tenter']"
    );
    
    submitButtons.forEach(btn => {
      // Nettoyer anciens handlers
      btn.removeAttribute("onclick");
      btn.type = "button";
      
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = "📤 Envoi en cours...";
        
        try {
          await window.envoyerCopie();
        } catch (error) {
          btn.disabled = false;
          btn.textContent = "🔄 Réessayer";
        }
      });
    });
    
    console.log(`✅ Runner PSE v${RUNNER_VERSION} opérationnel - ${submitButtons.length} bouton(s) raccordé(s)`);
    console.log("📊 Structure:", "resultats/{eleveCode}/copies/{devoirId_timestamp}");
    
  } catch (error) {
    console.error("❌ Erreur initialisation PSE Runner:", error);
    alert(`⚠️ Erreur système PSE :\n\n${error.message}\n\nContactez votre enseignant.`);
  }
}

// Démarrage automatique adaptatif
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPSERunner, { once: true });
} else {
  initPSERunner();
}

// Log final
console.log(`🚀 PSE Runner v${RUNNER_VERSION} chargé - RGPD compliant - Structure Firestore: resultats/{eleveCode}/copies/{devoirId_timestamp}`);
