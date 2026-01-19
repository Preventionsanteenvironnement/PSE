/* ═══════════════════════════════════════════════════════════════════════
   📁 ANNUAIRE.JS — VERSION FINALE SÉCURISÉE
   
   ⚠️ CE FICHIER EST PUBLIC (GitHub Pages PSE)
   ✅ Il contient UNIQUEMENT code → classe (pas de nom/prénom)
   
   📅 Version : 4.0 - Sécurisée
   👥 Total : 150 élèves + 2 profs + 2 visiteurs = 154 codes
   
   🔐 CHANGEMENTS SÉCURITÉ :
   - Codes élèves allongés (8 caractères alphanumériques)
   - Structure : resultats/{eleveCode}/copies/ et /evaluations/
   - Tracking : tracking/{jour}/visites/
   - Prof authentifié via Google (dans cockpit uniquement)
   ═══════════════════════════════════════════════════════════════════════ */

// 1. IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. CONFIGURATION FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.appspot.com",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

// 3. INITIALISATION
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;
window._ensureDb = () => window.db; 

console.log("✅ [annuaire.js v4.0] Structure sécurisée - Codes longs");

// ═══════════════════════════════════════════════════════════════════════
// 4. ANNUAIRE SÉCURISÉ
// Codes de 8 caractères alphanumériques non séquentiels
// Format : XXNNXXNN (lettres-chiffres alternés)
// ═══════════════════════════════════════════════════════════════════════

const ANNUAIRE = {
  // ─── Visiteurs & Profs ───
  "INVT2026": "VISITEUR", 
  "PSEV2026": "VISITEUR",
  "PROFPSE1": "PROF", 
  "BRAHMPSE": "PROF",
  
  // ─── B1AGO1 (8 élèves) ───
  "KA47M9P2": "B1AGO1",
  "LU83N4Q7": "B1AGO1",
  "MO12K6R3": "B1AGO1",
  "QF59L8S1": "B1AGO1",
  "RA26P3T5": "B1AGO1",
  "TI74Q9U2": "B1AGO1",
  "NE08R5V8": "B1AGO1",
  "SA91S2W4": "B1AGO1",
  
  // ─── B1AGO2 (10 élèves) ───
  "VO35T7X6": "B1AGO2",
  "PY64U4Y9": "B1AGO2",
  "XK19V1Z3": "B1AGO2",
  "DF82W8A5": "B1AGO2",
  "RT57X3B7": "B1AGO2",
  "ML03Y6C1": "B1AGO2",
  "HG68Z2D4": "B1AGO2",
  "CP41A9E8": "B1AGO2",
  "AJ90B5F2": "B1AGO2",
  "BN25C1G6": "B1AGO2",
  
  // ─── B1MELEC (7 élèves) ───
  "EU14D7H3": "B1MELEC",
  "SO76E4J9": "B1MELEC",
  "KT52F1K5": "B1MELEC",
  "WD88G8L2": "B1MELEC",
  "LP09H3M7": "B1MELEC",
  "YM63J6N1": "B1MELEC",
  "RF31K2P4": "B1MELEC",
  
  // ─── B2GATL1 (8 élèves) ───
  "CZ72L9Q8": "B2GATL1",
  "QL16M5R3": "B2GATL1",
  "MX48N2S6": "B2GATL1",
  "VA95P8T1": "B2GATL1",
  "HU27Q4U5": "B2GATL1",
  "PN60R1V9": "B2GATL1",
  "SJ04S7W2": "B2GATL1",
  "DK81T3X6": "B2GATL1",
  
  // ─── B2GATL2 (8 élèves) ───
  "TG36U9Y4": "B2GATL2",
  "AR58V6Z8": "B2GATL2",
  "ZN73W2A1": "B2GATL2",
  "FK10X8B5": "B2GATL2",
  "WL92Y4C9": "B2GATL2",
  "BM45Z1D3": "B2GATL2",
  "EO67A7E6": "B2GATL2",
  "JC21B3F2": "B2GATL2",
  
  // ─── B2MELEC (8 élèves) ───
  "PS84C9G7": "B2MELEC",
  "NV33D5H1": "B2MELEC",
  "KQ56E2J4": "B2MELEC",
  "LR07F8K8": "B2MELEC",
  "UH69G4L3": "B2MELEC",
  "XT18H1M6": "B2MELEC",
  "DF94J7N9": "B2MELEC",
  "MA02K3P5": "B2MELEC",
  
  // ─── BTAGO1 (9 élèves) ───
  "RL61L9Q2": "BTAGO1",
  "ZC28M6R7": "BTAGO1",
  "PW75N2S1": "BTAGO1",
  "SF13P8T4": "BTAGO1",
  "QN80Q5U8": "BTAGO1",
  "HK47R1V3": "BTAGO1",
  "VT96S7W6": "BTAGO1",
  "JE34T4X9": "BTAGO1",
  "LY52U1Y5": "BTAGO1",
  
  // ─── BTAGO2 (9 élèves) ───
  "MO71V8Z2": "BTAGO2",
  "AZ19W4A6": "BTAGO2",
  "KC83X1B9": "BTAGO2",
  "RF06Y7C3": "BTAGO2",
  "PU44Z3D7": "BTAGO2",
  "YD90A9E1": "BTAGO2",
  "QH27B6F4": "BTAGO2",
  "NS68C2G8": "BTAGO2",
  "LX11D8H5": "BTAGO2",
  
  // ─── BTMELEC (5 élèves) ───
  "CM59E5J1": "BTMELEC",
  "VA14F1K4": "BTMELEC",
  "ZR72G7L8": "BTMELEC",
  "HP03H4M2": "BTMELEC",
  "WX88J1N6": "BTMELEC",
  
  // ─── C1CAN (8 élèves) ───
  "JD41K8P9": "C1CAN",
  "EM65L4Q3": "C1CAN",
  "TK92M1R7": "C1CAN",
  "QF18N7S2": "C1CAN",
  "LP77P3T5": "C1CAN",
  "ZS24Q9U9": "C1CAN",
  "RN50R6V4": "C1CAN",
  "HU09S2W8": "C1CAN",
  
  // ─── C1HORT (8 élèves) ───
  "AC36T8X1": "C1HORT",
  "QJ81U5Y6": "C1HORT",
  "MS47V1Z9": "C1HORT",
  "VR02W7A3": "C1HORT",
  "KX93X4B7": "C1HORT",
  "PD68Y1C2": "C1HORT",
  "ET15Z8D5": "C1HORT",
  "NB74A4E9": "C1HORT",
  
  // ─── C1JP (8 élèves) ───
  "WY59B1F6": "C1JP",
  "HL07C7G1": "C1JP",
  "MX84D3H4": "C1JP",
  "QP22E9J8": "C1JP",
  "SZ96F6K3": "C1JP",
  "RV31G2L7": "C1JP",
  "JC68H8M2": "C1JP",
  "DT10J5N5": "C1JP",
  
  // ─── C1PSR (9 élèves) ───
  "KF73K1P9": "C1PSR",
  "PX04L7Q4": "C1PSR",
  "NS58M4R8": "C1PSR",
  "QV91N1S3": "C1PSR",
  "HR27P8T6": "C1PSR",
  "LW62Q4U1": "C1PSR",
  "ZM19R1V5": "C1PSR",
  "EA80S7W9": "C1PSR",
  "CJ45T3X2": "C1PSR",
  
  // ─── C1VAN (4 élèves) ───
  "RH12U9Y6": "C1VAN",
  "MV66V6Z1": "C1VAN",
  "KP90W2A4": "C1VAN",
  "AZ37X8B8": "C1VAN",
  
  // ─── C2CAN (8 élèves) ───
  "TD54Y5C3": "C2CAN",
  "QS71Z1D7": "C2CAN",
  "LN08A8E2": "C2CAN",
  "PX29B4F5": "C2CAN",
  "RF63C1G9": "C2CAN",
  "WJ16D7H6": "C2CAN",
  "ZH82E3J1": "C2CAN",
  "AC40F9K4": "C2CAN",
  
  // ─── C2HORT (7 élèves) ───
  "NE55G6L8": "C2HORT",
  "XQ03H2M3": "C2HORT",
  "HM79J8N7": "C2HORT",
  "VZ24K5P2": "C2HORT",
  "CP68L1Q5": "C2HORT",
  "SJ91M7R9": "C2HORT",
  "FT12N4S6": "C2HORT",
  
  // ─── C2JP (10 élèves) ───
  "RD27P1T1": "C2JP",
  "WM83Q8U4": "C2JP",
  "ZF05R4V8": "C2JP",
  "LC66S1W3": "C2JP",
  "QJ19T7X7": "C2JP",
  "AP74U4Y2": "C2JP",
  "SV92V1Z6": "C2JP",
  "TK38W9A9": "C2JP",
  "HX11X5B5": "C2JP",
  "GX61Y2C1": "C2JP",
  
  // ─── C2PSR (10 élèves) ───
  "PM70Z8D4": "C2PSR",
  "ZR26A5E8": "C2PSR",
  "NX51B1F3": "C2PSR",
  "CS09C7G6": "C2PSR",
  "VT84D4H1": "C2PSR",
  "KF17E1J5": "C2PSR",
  "QL63F8K9": "C2PSR",
  "MA28G4L2": "C2PSR",
  "RW95H1M6": "C2PSR",
  "DH42J9N9": "C2PSR",
  
  // ─── C2VAN (6 élèves) ───
  "ZP60K6P3": "C2VAN",
  "QF14L2Q7": "C2VAN",
  "MX88M8R2": "C2VAN",
  "LS23N5S4": "C2VAN",
  "VA71P1T8": "C2VAN",
  "CN05Q7U3": "C2VAN"
};

window.ANNUAIRE = ANNUAIRE;
console.log(`✅ Annuaire sécurisé : ${Object.keys(ANNUAIRE).length} codes (8 caractères)`);

// ═══════════════════════════════════════════════════════════════════════
// 5. FONCTIONS
// ═══════════════════════════════════════════════════════════════════════

// A. Demander le code élève
window.demanderCode = function(pageName) {
  return new Promise((resolve) => {
    const storedCode = localStorage.getItem("codeEleve");
    const storedClasse = localStorage.getItem("userClasse");
    
    if (storedCode && storedClasse) {
      window.enregistrerVisite(pageName);
      return resolve({ code: storedCode, classe: storedClasse });
    }

    const overlay = document.createElement("div");
    overlay.style = "position:fixed;inset:0;background:#0f172a;z-index:99999;display:flex;align-items:center;justify-content:center;color:white;font-family:system-ui,sans-serif;";
    overlay.innerHTML = `
      <div style="background:#1e293b;padding:30px;border-radius:16px;text-align:center;max-width:400px;width:90%;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
        <h2 style="margin-top:0">🔒 Identification</h2>
        <p style="color:#94a3b8;margin-bottom:20px">Entre ton code personnel (8 caractères).</p>
        <input type="text" id="codeIn" placeholder="Ex: KA47M9P2" style="font-size:18px;padding:12px;width:80%;text-align:center;border-radius:8px;border:none;margin-bottom:20px;text-transform:uppercase;letter-spacing:2px;">
        <br>
        <button id="btnGo" style="background:#2563eb;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:16px;cursor:pointer;font-weight:bold;">Entrer</button>
        <div id="msgErr" style="color:#ef4444;margin-top:15px;font-size:14px;min-height:20px;"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector("#codeIn");
    const btn = overlay.querySelector("#btnGo");
    const msg = overlay.querySelector("#msgErr");

    function valider() {
      const code = input.value.trim().toUpperCase();
      if (ANNUAIRE[code]) {
        const classe = ANNUAIRE[code];
        localStorage.setItem("codeEleve", code);
        localStorage.setItem("userClasse", classe);
        localStorage.setItem("userCode", code);
        
        window.enregistrerVisite(pageName);
        overlay.remove();
        resolve({ code, classe });
      } else {
        msg.textContent = "Code inconnu. Vérifie ton code (8 caractères).";
        input.value = "";
        input.focus();
      }
    }

    btn.onclick = valider;
    input.onkeydown = (e) => { if (e.key === "Enter") valider(); };
    setTimeout(() => input.focus(), 100);
  });
};

// B. Envoyer le devoir → resultats/{eleveCode}/copies/
window.PSE_submitDevoir = async function(payload) {
  console.log("📤 Envoi v4.0 sécurisé...", payload);
  
  try {
    const eleveCode = (localStorage.getItem("codeEleve") || "ANONYME").toUpperCase();
    const classeLocal = localStorage.getItem("userClasse") || "UNKNOWN";

    const docData = {
      devoirId: payload.devoirId || "Inconnu",
      titre: payload.titre || payload.module || "",
      url: window.location.href,
      
      createdAt: serverTimestamp(),
      createdAtISO: new Date().toISOString(),
      
      eleveCode: eleveCode,
      classe: classeLocal,
      eleve: {
        userCode: eleveCode,
        code: eleveCode,
        classe: classeLocal,
      },
      
      reponses: payload.reponses || {},
      resultat_auto: payload.resultat_auto || {},
      competences: payload.competences || {},
      temps_secondes: payload.temps_secondes || 0,
      raw: payload
    };

    // Anti-doublon
    const antiKey = "sent_" + docData.devoirId + "_" + docData.createdAtISO.slice(0,16);
    if (sessionStorage.getItem(antiKey)) {
        console.warn("Doublon évité.");
        return { ok: true, id: "doublon" };
    }

    // ⭐ CHEMIN SÉCURISÉ : resultats/{eleveCode}/copies/{docId}
    const docId = `${docData.devoirId}_${Date.now()}`;
    await setDoc(doc(db, "resultats", eleveCode, "copies", docId), docData);
    
    sessionStorage.setItem(antiKey, "1");
    console.log("✅ Copie enregistrée :", `resultats/${eleveCode}/copies/${docId}`);
    return { ok: true, id: docId };

  } catch (e) {
    console.error("❌ Erreur:", e);
    return { ok: false, error: e.message };
  }
};

// C. Enregistrer une visite → tracking/{jour}/visites/
window.enregistrerVisite = async function(nomPage) {
    try {
        const userCode = localStorage.getItem("codeEleve") || "INVT2026";
        
        // Validation : le code doit avoir au moins 4 caractères
        if (userCode.length < 4) {
            console.warn("Code trop court pour tracking");
            return;
        }
        
        const jour = new Date().toISOString().slice(0, 10);
        
        await addDoc(collection(db, "tracking", jour, "visites"), {
            page: (nomPage || document.title || "Page").slice(0, 200),
            userCode: userCode,
            classe: localStorage.getItem("userClasse") || "VISITEUR",
            date: new Date().toISOString(),
            timestamp: serverTimestamp()
        });
    } catch(e) { 
        // Silencieux
    }
};

// D. Déconnexion
window.resetCodeEleve = function() {
  localStorage.clear();
  location.reload();
};

// E. Debug
window.verifierCode = function(code) {
  const c = code.toUpperCase();
  if (ANNUAIRE[c]) {
    console.log(`✅ ${c} → ${ANNUAIRE[c]}`);
    return ANNUAIRE[c];
  } else {
    console.log(`❌ ${c} inconnu`);
    return null;
  }
};
