/* 📁 ANNUAIRE CENTRAL & CONFIGURATION — Dépôt PSE
   Version corrigée :
   - Compatible Firebase v8 (firebase.initializeApp / firebase.firestore)
   - Codes insensibles à la casse (maj/min)
   - Ne bloque PAS les pages libres
   - Bloque uniquement si window.PSE_CODE_REQUIRED === true
   - Traçage compatible Cockpit (champs attendus)
*/

// 1) CONFIG FIREBASE (officielle)
const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.appspot.com",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

// 2) ANNUAIRE (codes -> classe)
const ANNUAIRE = {
  // --- ACCÈS VISITEURS (Fonctionne en majuscule ou minuscule) ---
  "INV": "VISITEUR",
  "PSE": "VISITEUR",

  // --- B1AGO1 ---
  "KA47": "B1AGO1", "LU83": "B1AGO1", "MO12": "B1AGO1", "QF59": "B1AGO1", "RA26": "B1AGO1", "TI74": "B1AGO1", "NE08": "B1AGO1", "SA91": "B1AGO1",
  // --- B1AGO2 ---
  "VO35": "B1AGO2", "PY64": "B1AGO2", "XK19": "B1AGO2", "DF82": "B1AGO2", "RT57": "B1AGO2", "ML03": "B1AGO2", "HG68": "B1AGO2", "CP41": "B1AGO2", "AJ90": "B1AGO2", "BN25": "B1AGO2",
  // --- B1MELEC ---
  "EU14": "B1MELEC", "SO76": "B1MELEC", "KT52": "B1MELEC", "WD88": "B1MELEC", "LP09": "B1MELEC", "YM63": "B1MELEC", "RF31": "B1MELEC",
  // --- B2GATL1 ---
  "CZ72": "B2GATL1", "QL16": "B2GATL1", "MX48": "B2GATL1", "VA95": "B2GATL1", "HU27": "B2GATL1", "PN60": "B2GATL1", "SJ04": "B2GATL1", "DK81": "B2GATL1",
  // --- B2GATL2 ---
  "TG36": "B2GATL2", "AR58": "B2GATL2", "ZN73": "B2GATL2", "FK10": "B2GATL2", "WL92": "B2GATL2", "BM45": "B2GATL2", "EO67": "B2GATL2", "JC21": "B2GATL2",
  // --- B2MELEC ---
  "PS84": "B2MELEC", "NV33": "B2MELEC", "KQ56": "B2MELEC", "LR07": "B2MELEC", "UH69": "B2MELEC", "XT18": "B2MELEC", "DF94": "B2MELEC", "MA02": "B2MELEC",
  // --- BTAGO1 ---
  "RL61": "BTAGO1", "ZC28": "BTAGO1", "PW75": "BTAGO1", "SF13": "BTAGO1", "QN80": "BTAGO1", "HK47": "BTAGO1", "VT96": "BTAGO1", "JE34": "BTAGO1", "LY52": "BTAGO1",
  // --- BTAGO2 ---
  "MO71": "BTAGO2", "AZ19": "BTAGO2", "KC83": "BTAGO2", "RF06": "BTAGO2", "PU44": "BTAGO2", "YD90": "BTAGO2", "QH27": "BTAGO2", "NS68": "BTAGO2", "LX11": "BTAGO2",
  // --- BTMELEC ---
  "CM59": "BTMELEC", "VA14": "BTMELEC", "ZR72": "BTMELEC", "HP03": "BTMELEC", "WX88": "BTMELEC",
  // --- C1CAN ---
  "JD41": "C1CAN", "EM65": "C1CAN", "TK92": "C1CAN", "QF18": "C1CAN", "LP77": "C1CAN", "ZS24": "C1CAN", "RN50": "C1CAN", "HU09": "C1CAN",
  // --- C1HORT ---
  "AC36": "C1HORT", "QJ81": "C1HORT", "MS47": "C1HORT", "VR02": "C1HORT", "KX93": "C1HORT", "PD68": "C1HORT", "ET15": "C1HORT", "NB74": "C1HORT",
  // --- C1JP ---
  "WY59": "C1JP", "HL07": "C1JP", "MX84": "C1JP", "QP22": "C1JP", "SZ96": "C1JP", "RV31": "C1JP", "JC68": "C1JP", "DT10": "C1JP",
  // --- C1PSR ---
  "KF73": "C1PSR", "PX04": "C1PSR", "NS58": "C1PSR", "QV91": "C1PSR", "HR27": "C1PSR", "LW62": "C1PSR", "ZM19": "C1PSR", "EA80": "C1PSR", "CJ45": "C1PSR",
  // --- C1VAN ---
  "RH12": "C1VAN", "MV66": "C1VAN", "KP90": "C1VAN", "AZ37": "C1VAN",
  // --- C2CAN ---
  "TD54": "C2CAN", "QS71": "C2CAN", "LN08": "C2CAN", "PX29": "C2CAN", "RF63": "C2CAN", "WJ16": "C2CAN", "ZH82": "C2CAN", "AC40": "C2CAN",
  // --- C2HORT ---
  "NE55": "C2HORT", "XQ03": "C2HORT", "HM79": "C2HORT", "VZ24": "C2HORT", "CP68": "C2HORT", "SJ91": "C2HORT", "FT12": "C2HORT",
  // --- C2JP ---
  "RD27": "C2JP", "WM83": "C2JP", "ZF05": "C2JP", "LC66": "C2JP", "QJ19": "C2JP", "AP74": "C2JP", "SV92": "C2JP", "TK38": "C2JP", "HX11": "C2JP", "GX61": "C2JP",
  // --- C2PSR ---
  "PM70": "C2PSR", "ZR26": "C2PSR", "NX51": "C2PSR", "CS09": "C2PSR", "VT84": "C2PSR", "KF17": "C2PSR", "QL63": "C2PSR", "MA28": "C2PSR", "RW95": "C2PSR", "DH42": "C2PSR",
  // --- C2VAN ---
  "ZP60": "C2VAN", "QF14": "C2VAN", "MX88": "C2VAN", "LS23": "C2VAN", "VA71": "C2VAN", "CN05": "C2VAN"
};

// 3) OUTILS
function _normCode(raw) {
  return (raw || "").toString().trim().toUpperCase();
}
function _classeFromCode(codeUpper) {
  return ANNUAIRE[codeUpper] || "AUTRE";
}
function _isValidCode(codeUpper) {
  return !!ANNUAIRE[codeUpper];
}
function _deviceType() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  return isMobile ? "Mobile" : "Ordinateur";
}
function _periodeInfo(now) {
  const jour = now.getDay(); // 0=Dimanche 6=Samedi
  const heure = now.getHours();
  let periode = "Soir/Nuit";
  if (jour === 0 || jour === 6) periode = "Week-end";
  else if (heure >= 8 && heure < 18) periode = "Scolaire (8h-18h)";
  return { jour, heure, periode };
}
function _ensureDb() {
  try {
    if (typeof firebase === "undefined") return null;

    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    if (!window.db) window.db = firebase.firestore();
    return window.db;
  } catch (e) {
    console.error("Firebase init/db error:", e);
    return null;
  }
}

// 4) DOUANIER (optionnel) — utilisé seulement si window.PSE_CODE_REQUIRED === true
function demanderCode(_pageName) {
  if (document.getElementById("douanier-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "douanier-overlay";
  overlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:#0f172a;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;text-align:center;padding:20px;";

  overlay.innerHTML = `
    <div style="background:#1e293b;padding:26px 24px;border-radius:14px;border:1px solid #334155;max-width:360px;width:100%;box-shadow:0 10px 25px rgba(0,0,0,0.5);">
      <div style="font-weight:800;font-size:18px;margin:0 0 6px;">Identification</div>
      <div style="color:#94a3b8;font-size:13px;line-height:1.4;margin:0 0 16px;">Saisissez votre code d'accès</div>
      <input id="codeIn" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false"
        style="padding:12px;border-radius:10px;border:1px solid #475569;width:100%;text-align:center;text-transform:uppercase;font-weight:800;font-size:18px;outline:none;">
      <button id="valBtn"
        style="margin-top:14px;padding:12px 18px;background:#3b82f6;color:white;border:none;border-radius:10px;font-weight:800;cursor:pointer;width:100%;">Valider</button>
      <div id="err" style="color:#ef4444;margin-top:12px;display:none;font-weight:800;">Code non reconnu</div>
      <div style="margin-top:10px;color:#64748b;font-size:11px;">Astuce : minuscules/majuscules acceptées</div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = overlay.querySelector("#codeIn");
  const err = overlay.querySelector("#err");

  const verifier = () => {
    const val = _normCode(input.value);
    if (_isValidCode(val)) {
      localStorage.setItem("codeEleve", val);
      localStorage.setItem("userCode", val);
      localStorage.setItem("userClasse", ANNUAIRE[val]);

      overlay.remove();

      if (typeof enregistrerVisite === "function") {
        enregistrerVisite(_pageName || (document.title || "Page"));
      }
    } else {
      err.style.display = "block";
      input.style.border = "2px solid #ef4444";
    }
  };

  overlay.querySelector("#valBtn").onclick = verifier;
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") verifier(); });
  setTimeout(() => input.focus(), 50);
}

// 5) MOUCHARD — appelé depuis tes pages : enregistrerVisite("Nom page")
async function enregistrerVisite(nomPage) {
  try {
    const db = _ensureDb();
    if (!db) {
      console.warn("Mouchard: db indisponible (Firebase non chargé ?).");
      return;
    }

    const raw = localStorage.getItem("codeEleve") || localStorage.getItem("userCode") || "";
    const codeUpper = _normCode(raw);
    const codeRequired = (window.PSE_CODE_REQUIRED === true);

    if (codeRequired && (!_isValidCode(codeUpper))) {
      demanderCode(nomPage);
      return;
    }

    const finalCode = (_isValidCode(codeUpper) ? codeUpper : "ANONYME");
    const finalClasse = (finalCode === "ANONYME") ? "VISITEUR" : _classeFromCode(finalCode);

    const now = new Date();
    const info = _periodeInfo(now);

    const key = "trace_" + (nomPage || "") + "_" + location.pathname;
    if (sessionStorage.getItem(key)) return;

    await db.collection("statistiques_usage").add({
      date: now.toISOString(),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      page: nomPage || (document.title || "Page"),
      action: "Consultation",
      device: _deviceType(),

      userCode: finalCode,
      classe: finalClasse,
      periode: info.periode,
      heure: info.heure,
      jourSemaine: info.jour
    });

    sessionStorage.setItem(key, "1");
  } catch (e) {
    console.error("Erreur mouchard:", e);
  }
}

// 6) OUTILS PUBLICS (optionnels)
function resetCodeEleve() {
  localStorage.removeItem("codeEleve");
  localStorage.removeItem("userCode");
  localStorage.removeItem("userClasse");
}

// Expose
window.ANNUAIRE = ANNUAIRE;
window.enregistrerVisite = enregistrerVisite;
window.demanderCode = demanderCode;
window.resetCodeEleve = resetCodeEleve;

console.log("✅ annuaire.js chargé (v8 + casse OK + pages libres OK).");
