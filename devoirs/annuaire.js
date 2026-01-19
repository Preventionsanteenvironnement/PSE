/* ═══════════════════════════════════════════════════════════════════════
   📁 ANNUAIRE.JS — VERSION SÉCURISÉE (codes courts)
   
   Structure sécurisée :
   - Copies → resultats/{eleveCode}/copies/
   - Tracking → tracking/{jour}/visites/
   
   📅 Version : 4.0
   ═══════════════════════════════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
window._ensureDb = () => window.db; 

console.log("✅ [annuaire.js v4.0] Structure sécurisée");

// ═══════════════════════════════════════════════════════════════════════
// ANNUAIRE - CODES COURTS (inchangés)
// ═══════════════════════════════════════════════════════════════════════

const ANNUAIRE = {
  // Visiteurs & Profs
  "INV": "VISITEUR", 
  "PSE": "VISITEUR",
  "PROFPSE": "PROF", 
  "BRAHMSPSE": "PROF",
  
  // B1AGO1 (8 élèves)
  "KA47": "B1AGO1", "LU83": "B1AGO1", "MO12": "B1AGO1", "QF59": "B1AGO1", 
  "RA26": "B1AGO1", "TI74": "B1AGO1", "NE08": "B1AGO1", "SA91": "B1AGO1",
  
  // B1AGO2 (10 élèves)
  "VO35": "B1AGO2", "PY64": "B1AGO2", "XK19": "B1AGO2", "DF82": "B1AGO2", 
  "RT57": "B1AGO2", "ML03": "B1AGO2", "HG68": "B1AGO2", "CP41": "B1AGO2", 
  "AJ90": "B1AGO2", "BN25": "B1AGO2",
  
  // B1MELEC (7 élèves)
  "EU14": "B1MELEC", "SO76": "B1MELEC", "KT52": "B1MELEC", "WD88": "B1MELEC", 
  "LP09": "B1MELEC", "YM63": "B1MELEC", "RF31": "B1MELEC",
  
  // B2GATL1 (8 élèves)
  "CZ72": "B2GATL1", "QL16": "B2GATL1", "MX48": "B2GATL1", "VA95": "B2GATL1", 
  "HU27": "B2GATL1", "PN60": "B2GATL1", "SJ04": "B2GATL1", "DK81": "B2GATL1",
  
  // B2GATL2 (8 élèves)
  "TG36": "B2GATL2", "AR58": "B2GATL2", "ZN73": "B2GATL2", "FK10": "B2GATL2", 
  "WL92": "B2GATL2", "BM45": "B2GATL2", "EO67": "B2GATL2", "JC21": "B2GATL2",
  
  // B2MELEC (8 élèves)
  "PS84": "B2MELEC", "NV33": "B2MELEC", "KQ56": "B2MELEC", "LR07": "B2MELEC", 
  "UH69": "B2MELEC", "XT18": "B2MELEC", "DF94": "B2MELEC", "MA02": "B2MELEC",
  
  // BTAGO1 (9 élèves)
  "RL61": "BTAGO1", "ZC28": "BTAGO1", "PW75": "BTAGO1", "SF13": "BTAGO1", 
  "QN80": "BTAGO1", "HK47": "BTAGO1", "VT96": "BTAGO1", "JE34": "BTAGO1", "LY52": "BTAGO1",
  
  // BTAGO2 (9 élèves)
  "MO71": "BTAGO2", "AZ19": "BTAGO2", "KC83": "BTAGO2", "RF06": "BTAGO2", 
  "PU44": "BTAGO2", "YD90": "BTAGO2", "QH27": "BTAGO2", "NS68": "BTAGO2", "LX11": "BTAGO2",
  
  // BTMELEC (5 élèves)
  "CM59": "BTMELEC", "VA14": "BTMELEC", "ZR72": "BTMELEC", "HP03": "BTMELEC", "WX88": "BTMELEC",
  
  // C1CAN (8 élèves)
  "JD41": "C1CAN", "EM65": "C1CAN", "TK92": "C1CAN", "QF18": "C1CAN", 
  "LP77": "C1CAN", "ZS24": "C1CAN", "RN50": "C1CAN", "HU09": "C1CAN",
  
  // C1HORT (8 élèves)
  "AC36": "C1HORT", "QJ81": "C1HORT", "MS47": "C1HORT", "VR02": "C1HORT", 
  "KX93": "C1HORT", "PD68": "C1HORT", "ET15": "C1HORT", "NB74": "C1HORT",
  
  // C1JP (8 élèves)
  "WY59": "C1JP", "HL07": "C1JP", "MX84": "C1JP", "QP22": "C1JP", 
  "SZ96": "C1JP", "RV31": "C1JP", "JC68": "C1JP", "DT10": "C1JP",
  
  // C1PSR (9 élèves)
  "KF73": "C1PSR", "PX04": "C1PSR", "NS58": "C1PSR", "QV91": "C1PSR", 
  "HR27": "C1PSR", "LW62": "C1PSR", "ZM19": "C1PSR", "EA80": "C1PSR", "CJ45": "C1PSR",
  
  // C1VAN (4 élèves)
  "RH12": "C1VAN", "MV66": "C1VAN", "KP90": "C1VAN", "AZ37": "C1VAN",
  
  // C2CAN (8 élèves)
  "TD54": "C2CAN", "QS71": "C2CAN", "LN08": "C2CAN", "PX29": "C2CAN", 
  "RF63": "C2CAN", "WJ16": "C2CAN", "ZH82": "C2CAN", "AC40": "C2CAN",
  
  // C2HORT (7 élèves)
  "NE55": "C2HORT", "XQ03": "C2HORT", "HM79": "C2HORT", "VZ24": "C2HORT", 
  "CP68": "C2HORT", "SJ91": "C2HORT", "FT12": "C2HORT",
  
  // C2JP (10 élèves)
  "RD27": "C2JP", "WM83": "C2JP", "ZF05": "C2JP", "LC66": "C2JP", 
  "QJ19": "C2JP", "AP74": "C2JP", "SV92": "C2JP", "TK38": "C2JP", "HX11": "C2JP", "GX61": "C2JP",
  
  // C2PSR (10 élèves)
  "PM70": "C2PSR", "ZR26": "C2PSR", "NX51": "C2PSR", "CS09": "C2PSR", 
  "VT84": "C2PSR", "KF17": "C2PSR", "QL63": "C2PSR", "MA28": "C2PSR", "RW95": "C2PSR", "DH42": "C2PSR",
  
  // C2VAN (6 élèves)
  "ZP60": "C2VAN", "QF14": "C2VAN", "MX88": "C2VAN", "LS23": "C2VAN", 
  "VA71": "C2VAN", "CN05": "C2VAN"
};

window.ANNUAIRE = ANNUAIRE;
console.log(`✅ Annuaire : ${Object.keys(ANNUAIRE).length} codes`);

// ═══════════════════════════════════════════════════════════════════════
// FONCTIONS
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
        <p style="color:#94a3b8;margin-bottom:20px">Entre ton code personnel.</p>
        <input type="text" id="codeIn" placeholder="Code (ex: KA47)" style="font-size:18px;padding:12px;width:80%;text-align:center;border-radius:8px;border:none;margin-bottom:20px;text-transform:uppercase;">
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
        msg.textContent = "Code inconnu. Réessaie.";
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
  console.log("📤 Envoi sécurisé...", payload);
  
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
        const userCode = localStorage.getItem("codeEleve") || "INV";
        
        if (userCode.length < 2) return;
        
        const jour = new Date().toISOString().slice(0, 10);
        
        await addDoc(collection(db, "tracking", jour, "visites"), {
            page: (nomPage || document.title || "Page").slice(0, 200),
            userCode: userCode,
            classe: (localStorage.getItem("userClasse") || "VISITEUR").slice(0, 20),
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
