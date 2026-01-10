/* 📁 ANNUAIRE.JS — VERSION MODERNE (v10)
   Gestion centralisée : Auth, Annuaire, Envoi Devoirs, Tracking
*/

// 1. IMPORTS MODERNES (Directement depuis Google)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 2. TA CONFIGURATION SECRÈTE
const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.appspot.com",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

// 3. DÉMARRAGE DU MOTEUR
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// On rend la base de données accessible partout (pour la Zone Prof)
window.db = db;
// On crée une petite fonction pour confirmer que la DB est prête
window._ensureDb = () => window.db; 

console.log("✅ [annuaire.js] Firebase v10 initialisé avec succès.");

// 4. L'ANNUAIRE (Tes codes élèves)
const ANNUAIRE = {
  "INV": "VISITEUR", "PSE": "VISITEUR",
  // B1AGO1
  "KA47": "B1AGO1", "LU83": "B1AGO1", "MO12": "B1AGO1", "QF59": "B1AGO1", 
  "RA26": "B1AGO1", "TI74": "B1AGO1", "NE08": "B1AGO1", "SA91": "B1AGO1",
  // B1AGO2
  "VO35": "B1AGO2", "PY64": "B1AGO2", "XK19": "B1AGO2", "DF82": "B1AGO2", 
  "GE73": "B1AGO2", "MU51": "B1AGO2", "ZO28": "B1AGO2", "HI96": "B1AGO2",
  // 1CAP
  "BA14": "1CAP", "CE72": "1CAP", "DI39": "1CAP", "FO85": "1CAP", "GU61": "1CAP",
  "JE27": "1CAP", "KO93": "1CAP", "LA58": "1CAP", "ME04": "1CAP", "NA46": "1CAP",
  "PE11": "1CAP", "QU75": "1CAP", "RI32": "1CAP", "SO98": "1CAP", "TU65": "1CAP",
  // 2CAP
  "VE21": "2CAP", "WA87": "2CAP", "XA53": "2CAP", "YA19": "2CAP", "ZO76": "2CAP",
  "BU42": "2CAP", "CU08": "2CAP", "DU64": "2CAP", "FU31": "2CAP", "GU97": "2CAP",
  "HU52": "2CAP", "JU18": "2CAP", "KU84": "2CAP", "LU49": "2CAP", "MU15": "2CAP",
  // TCAP
  "NU71": "TCAP", "OU37": "TCAP", "PU03": "TCAP", "RU69": "TCAP", "SU25": "TCAP",
  "TU91": "TCAP", "VU57": "TCAP", "WU13": "TCAP", "XU79": "TCAP", "YU45": "TCAP",
  "ZU01": "TCAP", "AV67": "TCAP", "BV23": "TCAP", "CV89": "TCAP", "DV55": "TCAP",
  // 2BACPRO
  "EV11": "2BACPRO", "FV77": "2BACPRO", "GV33": "2BACPRO", "HV99": "2BACPRO",
  "IV55": "2BACPRO", "JV11": "2BACPRO", "KV77": "2BACPRO", "LV33": "2BACPRO",
  "MV99": "2BACPRO", "NV55": "2BACPRO", "OV11": "2BACPRO", "PV77": "2BACPRO",
  "QV33": "2BACPRO", "RV99": "2BACPRO", "SV55": "2BACPRO",
  // 1BACPRO
  "TV11": "1BACPRO", "UV77": "1BACPRO", "VV33": "1BACPRO", "WV99": "1BACPRO",
  "XV55": "1BACPRO", "YV11": "1BACPRO", "ZV77": "1BACPRO", "AW33": "1BACPRO",
  "BW99": "1BACPRO", "CW55": "1BACPRO", "DW11": "1BACPRO", "EW77": "1BACPRO",
  "FW33": "1BACPRO", "GW99": "1BACPRO", "HW55": "1BACPRO",
  // TBACPRO
  "IW11": "TBACPRO", "JW77": "TBACPRO", "KW33": "TBACPRO", "LW99": "TBACPRO",
  "MW55": "TBACPRO", "NW11": "TBACPRO", "OW77": "TBACPRO", "PW33": "TBACPRO",
  "QW99": "TBACPRO", "RW55": "TBACPRO", "SW11": "TBACPRO", "TW77": "TBACPRO",
  "UW33": "TBACPRO", "VW99": "TBACPRO", "WW55": "TBACPRO",
  // PROF
  "PROFPSE": "PROF", "BRAHMSPSE": "PROF"
};

// 5. FONCTIONS GLOBALES (Pour que tes pages HTML puissent les appeler)

// A. Demander le code élève (Pop-up)
window.demanderCode = function(pageName) {
  return new Promise((resolve) => {
    // Vérif si déjà connecté
    const storedCode = localStorage.getItem("codeEleve");
    const storedClasse = localStorage.getItem("userClasse");
    
    if (storedCode && storedClasse) {
      // Déjà connecté, on trace juste la visite
      window.enregistrerVisite(pageName);
      return resolve({ code: storedCode, classe: storedClasse });
    }

    // Sinon, on crée la fenêtre de connexion
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
        // On sauvegarde
        localStorage.setItem("codeEleve", code);
        localStorage.setItem("userClasse", classe);
        localStorage.setItem("userCode", code); // Legacy support
        
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

// B. Envoyer le devoir (Le coeur du réacteur)
window.PSE_submitDevoir = async function(payload) {
  console.log("📤 Envoi en cours...", payload);
  
  try {
    // On récupère l'identité
    const codeLocal = localStorage.getItem("codeEleve") || "ANONYME";
    const classeLocal = localStorage.getItem("userClasse") || "UNKNOWN";

    const docData = {
      devoirId: payload.devoirId || "Inconnu",
      titre: payload.titre || payload.module || "",
      url: window.location.href,
      module: payload.module || "",
      
      // Dates
      createdAt: serverTimestamp(),
      createdAtISO: new Date().toISOString(),
      
      // Identité Élève
      eleve: {
        code: codeLocal,
        classeCode: classeLocal,
        classe: payload.classe || classeLocal, // Priorité au champ formulaire si rempli
        nom: payload.nom || "",
        prenom: payload.prenom || ""
      },
      
      // Contenu
      reponses: payload.reponses || {},
      resultat_auto: payload.resultat_auto || {}, // Score calculé
      raw: payload // Sauvegarde de sécurité
    };

    // Vérification anti-doublon simple (session)
    const antiKey = "sent_" + docData.devoirId + "_" + docData.createdAtISO.slice(0,16); // à la minute près
    if (sessionStorage.getItem(antiKey)) {
        console.warn("Doublon évité.");
        return { ok: true, id: "doublon" };
    }

    // ENVOI VERS FIRESTORE
    const ref = await addDoc(collection(db, "devoirs_rendus"), docData);
    
    sessionStorage.setItem(antiKey, "1");
    console.log("✅ Devoir enregistré ! ID:", ref.id);
    return { ok: true, id: ref.id };

  } catch (e) {
    console.error("❌ Erreur envoi:", e);
    return { ok: false, error: e.message };
  }
};

// C. Enregistrer une visite (Statistiques)
window.enregistrerVisite = async function(nomPage) {
    try {
        const code = localStorage.getItem("codeEleve") || "INV";
        const classe = localStorage.getItem("userClasse") || "VISITEUR";
        
        await addDoc(collection(db, "statistiques_usage"), {
            date: new Date().toISOString(),
            timestamp: serverTimestamp(),
            page: nomPage || document.title,
            action: "Consultation",
            userCode: code,
            classe: classe
        });
    } catch(e) { console.warn("Erreur stats (pas grave)", e); }
};

// D. Déconnexion
window.resetCodeEleve = function() {
  localStorage.clear();
  location.reload();
};
