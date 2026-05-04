/* ============================================================
   psr/auth.js — Authentification RGPD du portfolio
   ============================================================
   - Aucune donnée personnelle stockée : uniquement userCode + classe
   - Code validé contre window.BDD_ELEVES (data_eleves.js)
   - Code spécial "PROFPSE" = mode enseignant
   - Le portfolio (app.js) lit window.PSR_USER après connexion
   ============================================================ */
(function () {
  "use strict";

  const LS_KEY = "psr_user_session_v1";

  // ==== UTILITIES ===========================================================
  function readSession() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.userCode) return null;
      return obj;
    } catch (e) { return null; }
  }
  function writeSession(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }
  function clearSession()  { localStorage.removeItem(LS_KEY); }

  function findEleve(code) {
    const list = (window.BDD_ELEVES || []);
    const norm = String(code || "").trim().toUpperCase();
    if (!norm) return null;
    return list.find(e => e.userCode === norm) || null;
  }

  function setUserGlobal(eleve) {
    window.PSR_USER = {
      userCode: eleve.userCode,
      classe:   eleve.classe || "",
      isTeacher: eleve.userCode === "PROFPSE",
    };
  }

  // ==== LOGIN UI ============================================================
  function injectStyles() {
    if (document.getElementById("psr-auth-styles")) return;
    const css = `
      #psr-auth-overlay{position:fixed;inset:0;z-index:9999;
        background:linear-gradient(135deg,#0f172a,#1e3a8a 60%,#0f172a);
        display:flex;align-items:center;justify-content:center;padding:20px;
        font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#f1f5f9}
      #psr-auth-overlay.psr-hidden{display:none !important}
      .psr-auth-card{background:rgba(30,41,59,.92);backdrop-filter:blur(8px);
        border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:32px;
        max-width:440px;width:100%;box-shadow:0 30px 80px rgba(0,0,0,.5);text-align:center}
      .psr-auth-card .psr-logo{font-size:48px;margin-bottom:8px}
      .psr-auth-card h1{margin:0 0 6px;font-size:24px;letter-spacing:.5px;
        background:linear-gradient(90deg,#fbbf24,#ec4899);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent}
      .psr-auth-card .psr-sub{color:#cbd5e1;font-size:14px;line-height:1.5;margin-bottom:18px}
      .psr-auth-card input{width:100%;padding:14px 16px;border-radius:10px;
        border:2px solid #475569;background:#0f172a;color:#f1f5f9;
        font-size:18px;letter-spacing:2px;text-align:center;font-weight:700;
        text-transform:uppercase}
      .psr-auth-card input:focus{outline:none;border-color:#fbbf24}
      .psr-auth-card .psr-error{color:#fca5a5;font-size:13px;min-height:18px;margin:8px 0 4px}
      .psr-auth-card button.psr-btn{margin-top:8px;width:100%;padding:14px;
        background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;border:none;
        border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;letter-spacing:.5px}
      .psr-auth-card button.psr-btn:hover{filter:brightness(1.1)}
      .psr-auth-card .psr-help{color:#94a3b8;font-size:12px;margin-top:14px;line-height:1.5}
      .psr-auth-card .psr-help b{color:#cbd5e1}
      .psr-rgpd-tag{display:inline-block;background:#16a34a;color:#fff;
        padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700;
        letter-spacing:1px;margin-bottom:14px}
      /* Bouton de déconnexion + badge utilisateur */
      .psr-user-badge{display:inline-flex;align-items:center;gap:8px;
        background:#1e293b;border:1px solid #334155;border-radius:8px;
        padding:6px 12px;font-size:13px;color:#f1f5f9}
      .psr-user-badge .psr-code{font-weight:700;color:#fbbf24;letter-spacing:1px}
      .psr-user-badge .psr-classe{color:#94a3b8;font-size:11px}
      .psr-logout-btn{background:#475569;border:none;color:#fff;border-radius:6px;
        padding:4px 10px;font-size:11px;cursor:pointer;margin-left:6px}
      .psr-logout-btn:hover{background:#dc2626}
    `;
    const s = document.createElement("style");
    s.id = "psr-auth-styles";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildLoginUI(onSuccess) {
    injectStyles();
    let overlay = document.getElementById("psr-auth-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "psr-auth-overlay";
      overlay.innerHTML = `
        <div class="psr-auth-card">
          <div class="psr-rgpd-tag">RGPD</div>
          <div class="psr-logo">📒</div>
          <h1>Portfolio Chef-d'œuvre PSR</h1>
          <p class="psr-sub">Saisis ton <b>code élève</b> Data Élèves pour accéder au portfolio.</p>
          <input id="psr-auth-input" type="text" maxlength="10" placeholder="CODE" autocomplete="off" autocapitalize="characters" />
          <div class="psr-error" id="psr-auth-error"></div>
          <button class="psr-btn" id="psr-auth-btn">Entrer</button>
          <p class="psr-help">
            Aucun nom, aucun prénom n'est demandé.<br>
            Ton code suffit à retrouver tes données.<br>
            <b>Mode enseignant :</b> code <code>PROFPSE</code>.
          </p>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.classList.remove("psr-hidden");
    const input = document.getElementById("psr-auth-input");
    const btn   = document.getElementById("psr-auth-btn");
    const err   = document.getElementById("psr-auth-error");
    setTimeout(() => input.focus(), 100);

    function tryLogin() {
      const code = input.value.trim().toUpperCase();
      if (!code) { err.textContent = "Saisis ton code."; return; }
      const eleve = findEleve(code);
      if (!eleve) { err.textContent = "Code inconnu. Vérifie auprès de ton enseignant."; return; }
      err.textContent = "";
      const session = { userCode: eleve.userCode, classe: eleve.classe || "", date: new Date().toISOString() };
      writeSession(session);
      setUserGlobal(eleve);
      overlay.classList.add("psr-hidden");
      if (typeof onSuccess === "function") onSuccess(window.PSR_USER);
    }
    btn.onclick = tryLogin;
    input.onkeydown = (e) => { if (e.key === "Enter") tryLogin(); };
  }

  function logout() {
    clearSession();
    window.PSR_USER = null;
    location.reload();
  }

  // ==== INIT ================================================================
  function init() {
    const session = readSession();
    if (session) {
      const eleve = findEleve(session.userCode);
      if (eleve) {
        setUserGlobal(eleve);
        // hide overlay if already in DOM
        const ov = document.getElementById("psr-auth-overlay");
        if (ov) ov.classList.add("psr-hidden");
        return;
      }
    }
    // Pas de session valide → afficher login
    buildLoginUI();
  }

  // Exposer globalement
  window.PSR_AUTH = { logout, getUser: () => window.PSR_USER || null, requireLogin: buildLoginUI };

  // Démarrer dès que possible
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
