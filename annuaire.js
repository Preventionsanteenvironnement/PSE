// --- 1. L'ANNUAIRE DES CODES (A compléter avec tes codes) ---
const ANNUAIRE = {
    "KA47": "B1AGO1",
    "ME22": "B1AGO1",
    "TEST": "DEMO"
};

// --- 2. FONCTION DE TRAÇAGE ---
function tracerActivite(code, classe) {
    if (sessionStorage.getItem("deja_trace_" + location.pathname)) return;

    const now = new Date();
    const h = now.getHours();
    const jour = now.getDay();

    let periode = "Soir/Nuit";
    if (jour === 0 || jour === 6) {
        periode = "Week-end";
    } else if (h >= 8 && h < 18) {
        periode = "Scolaire (8h-18h)";
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const data = {
        userCode: code,
        classe: classe,
        page: document.title || "Exercice sans titre",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        date: now.toISOString(),
        heure: h,
        periode: periode,
        jourSemaine: jour,
        device: isMobile ? "Mobile" : "Ordinateur",
        action: "Consultation" // <--- Aligné sur ton Cockpit
    };

    db.collection("statistiques_usage").add(data)
        .then(() => {
            sessionStorage.setItem("deja_trace_" + location.pathname, "1");
        })
        .catch(e => console.error("Erreur trace:", e));
}

// --- 3. LE DOUANIER (Interface) ---
function demanderCode() {
    const overlay = document.createElement("div");
    overlay.id = "douanier-overlay";
    overlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:#0f172a;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:sans-serif;text-align:center;padding:20px;";
    overlay.innerHTML = `
        <div style="background:#1e293b; padding:30px; border-radius:12px; border:1px solid #334155; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <h2 style="margin-top:0;">Identification</h2>
            <p style="color:#94a3b8;margin-bottom:20px;">Saisissez votre code d'accès :</p>
            <input type="text" id="codeIn" style="padding:12px;border-radius:8px;border:none;width:160px;text-align:center;text-transform:uppercase;font-weight:bold;font-size:1.2rem;outline:none;">
            <br>
            <button id="valBtn" style="margin-top:20px;padding:12px 30px;background:#3b82f6;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">Valider</button>
            <p id="err" style="color:#ef4444;margin-top:15px;display:none;font-weight:bold;">Code non reconnu</p>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById("codeIn");
    const verifier = () => {
        const val = input.value.toUpperCase().trim();
        if (ANNUAIRE[val]) {
            localStorage.setItem("userCode", val);
            localStorage.setItem("userClasse", ANNUAIRE[val]);
            document.body.removeChild(overlay);
            tracerActivite(val, ANNUAIRE[val]);
        } else {
            document.getElementById("err").style.display = "block";
            input.style.border = "2px solid #ef4444";
        }
    };
    document.getElementById("valBtn").onclick = verifier;
    input.onkeypress = (e) => { if(e.key === "Enter") verifier(); };
}

// --- 4. LANCEMENT AUTOMATIQUE ---
window.addEventListener('load', () => {
    const checkDB = setInterval(() => {
        // Fallback technique pour s'assurer que db existe
        if (typeof db === 'undefined' && typeof firebase !== 'undefined' && firebase.apps.length) {
            window.db = firebase.firestore();
        }

        if (typeof db !== 'undefined') {
            clearInterval(checkDB);
            const sessionCodeRaw = localStorage.getItem("userCode") || "";
            const sessionCode = sessionCodeRaw.toUpperCase().trim();
            
            if (!sessionCode || !ANNUAIRE[sessionCode]) {
                demanderCode();
            } else {
                tracerActivite(sessionCode, ANNUAIRE[sessionCode]);
            }
        }
    }, 100);
});
