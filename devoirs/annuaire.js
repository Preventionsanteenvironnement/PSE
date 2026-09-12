/* ═══════════════════════════════════════════════════════════════════════
   📁 ANNUAIRE.JS — VERSION 4.1 (codes courts) — INIT FIREBASE SAFE
   
   Structure :
   - Copies → resultats/{eleveCode}/copies/
   - Tracking → tracking/{jour}/visites/
   
   Fix v4.1 : évite double initializeApp (getApps/getApp)
   ═══════════════════════════════════════════════════════════════════════ */

// Chargement Firebase compat (compat n'a pas d'export ES default)
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
const firebase = window.firebase;

const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.appspot.com",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

// ✅ Init SAFE : évite Firebase App named '[DEFAULT]' already exists
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = window.db || firebase.firestore();
window.db = db;
window._ensureDb = () => window.db;

console.log("✅ [annuaire.js v4.2] Init Firebase SAFE compat + structure sécurisée");

// ═══════════════════════════════════════════════════════════════════════
// ANNUAIRE - CODES COURTS (inchangés)
// ═══════════════════════════════════════════════════════════════════════

const ANNUAIRE = {
  // Rentrée 2026-2027 : 143 codes, synchronisés avec data_eleves.js.
  "PD83": "B1AGO1",
  "HU84": "B1AGO1",
  "RQ37": "B1AGO1",
  "EX87": "B1AGO1",
  "GS78": "B1AGO1",
  "LJ83": "B1AGO1",
  "QU43": "B1AGO1",
  "NP76": "B1AGO1",
  "DG50": "B1AGO2",
  "KA85": "B1AGO2",
  "AR77": "B1AGO2",
  "QH31": "B1AGO2",
  "HA27": "B1AGO2",
  "JC66": "B1AGO2",
  "KE56": "B1AGO2",
  "YS32": "B1AGO2",
  "ET75": "B1AGO2",
  "SE67": "B1MELEC",
  "HF26": "B1MELEC",
  "XV92": "B1MELEC",
  "EZ75": "B1MELEC",
  "TR33": "B1MELEC",
  "AC69": "B1MELEC",
  "XF25": "B1MELEC",
  "KY93": "B1MELEC",
  "QB67": "B2GATL1",
  "WX74": "B2GATL1",
  "AN64": "B2GATL1",
  "KW77": "B2GATL1",
  "TS54": "B2GATL1",
  "DL32": "B2GATL1",
  "UC38": "B2GATL1",
  "XP84": "B2GATL1",
  "ZT74": "B2GATL2",
  "ZD38": "B2GATL2",
  "HH44": "B2GATL2",
  "WK92": "B2GATL2",
  "FF65": "B2GATL2",
  "SR99": "B2GATL2",
  "JB34": "B2GATL2",
  "MR73": "B2GATL2",
  "WF92": "B2MELEC",
  "RZ97": "B2MELEC",
  "YX99": "B2MELEC",
  "PZ98": "B2MELEC",
  "AV63": "B2MELEC",
  "BJ75": "B2MELEC",
  "WE83": "B2MELEC",
  "CQ38": "B2MELEC",
  "QA44": "BTAGO1",
  "ZS84": "BTAGO1",
  "WB67": "BTAGO1",
  "DT39": "BTAGO1",
  "CU38": "BTAGO1",
  "ZS22": "BTAGO1",
  "BP97": "BTAGO1",
  "LA53": "BTAGO2",
  "KD57": "BTAGO2",
  "UW99": "BTAGO2",
  "QX99": "BTAGO2",
  "BR88": "BTAGO2",
  "VE42": "BTAGO2",
  "GF37": "BTAGO2",
  "XV49": "BTAGO2",
  "HN67": "BTAGO2",
  "US28": "BTMELEC",
  "DS85": "BTMELEC",
  "GM83": "BTMELEC",
  "LD35": "BTMELEC",
  "YV34": "BTMELEC",
  "EK28": "BTMELEC",
  "VD59": "C1CAN",
  "JR34": "C1CAN",
  "VU94": "C1CAN",
  "BL28": "C1CAN",
  "YW95": "C1CAN",
  "GG44": "C1CAN",
  "YD66": "C1CAN",
  "QR63": "C1CAN",
  "DE88": "C1HORT",
  "KJ97": "C1HORT",
  "ZP49": "C1HORT",
  "EZ27": "C1HORT",
  "AN47": "C1HORT",
  "ZT68": "C1HORT",
  "MN68": "C1HORT",
  "GJ85": "C1HORT",
  "FF93": "C1JP",
  "TF92": "C1JP",
  "VP38": "C1JP",
  "DW22": "C1JP",
  "HZ88": "C1JP",
  "BF76": "C1PSR",
  "BH55": "C1PSR",
  "ER62": "C1PSR",
  "SN29": "C1PSR",
  "PN84": "C1PSR",
  "NP66": "C1PSR",
  "AF53": "C1PSR",
  "KS86": "C1VAN",
  "VG79": "C1VAN",
  "PB26": "C1VAN",
  "HJ27": "C2CAN",
  "DX59": "C2CAN",
  "JP56": "C2CAN",
  "XA37": "C2CAN",
  "JA75": "C2CAN",
  "CY57": "C2CAN",
  "ZQ53": "C2CAN",
  "JD65": "C2CAN",
  "SE98": "C2HORT",
  "AS49": "C2HORT",
  "RN39": "C2HORT",
  "PT75": "C2HORT",
  "NM57": "C2HORT",
  "EH59": "C2HORT",
  "PS59": "C2HORT",
  "BV66": "C2HORT",
  "ZZ29": "C2JP",
  "ZH38": "C2JP",
  "NA94": "C2JP",
  "XA65": "C2JP",
  "AK67": "C2JP",
  "CP96": "C2JP",
  "ZH25": "C2JP",
  "FH29": "C2JP",
  "GQ25": "C2PSR",
  "KG84": "C2PSR",
  "VE95": "C2PSR",
  "VJ49": "C2PSR",
  "XT48": "C2PSR",
  "SQ79": "C2PSR",
  "GF55": "C2PSR",
  "RF93": "C2VAN",
  "HP57": "C2VAN",
  "LX25": "C2VAN",
  "FD66": "C2VAN",
  "WN48": "C2VAN",
  "FP58": "C2VAN",
  "BX22": "C2VAN",
  "LT47": "BTAGO1",
  "LY26": "C1HORT",
  "GE68": "C2PSR",

  // Codes historiques conservés.

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

      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
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
    await db.collection("resultats").doc(eleveCode).collection("copies").doc(docId).set(docData);

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

    await db.collection("tracking").doc(jour).collection("visites").add({
      page: (nomPage || document.title || "Page").slice(0, 200),
      userCode: userCode,
      classe: (localStorage.getItem("userClasse") || "VISITEUR").slice(0, 20),
      date: new Date().toISOString(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
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
