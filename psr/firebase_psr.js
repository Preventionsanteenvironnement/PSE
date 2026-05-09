/* =====================================================================
   firebase_psr.js — Pont Firestore pour le Portfolio PSR (Phase 2)
   ---------------------------------------------------------------------
   Module ESM. Chargé AVANT app.js dans index.html.
   Expose `window.PSR_FIREBASE` (API minimale) à app.js (script classique).

   Schéma Firestore (compatible mapse.fr / resultats.html / cockpit) :
     resultats/{userCode}/evaluations/{devoirId}   ← note finale + appréciation
     resultats/{userCode}/copies/{devoirId}_autoeval ← réponses brutes

   Champ `source: "psr_portfolio"` pour distinguer du PSE classique.
   `publie: true` par défaut (auto-publié — la prof rectifie au besoin).
   ===================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
  authDomain: "devoirs-pse.firebaseapp.com",
  projectId: "devoirs-pse",
  storageBucket: "devoirs-pse.appspot.com",
  messagingSenderId: "614730413904",
  appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db  = getFirestore(app);
} catch (e) {
  console.warn("[PSR_FIREBASE] init impossible :", e);
}

/* ---------- helpers ---------- */

const PENDING_KEY = "psr_pending_writes";
const THROTTLE_MS = 3000;
const _lastWriteAt = new Map(); // devoirId -> timestamp ms

function _userCode() {
  return (window.PSR_USER && window.PSR_USER.userCode) || null;
}

function _online() {
  return typeof navigator !== "undefined" ? navigator.onLine !== false : true;
}

function _readPending() {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || "[]"); }
  catch { return []; }
}
function _writePending(arr) {
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(arr.slice(-50))); } catch {}
}
function _enqueue(item) {
  const arr = _readPending();
  arr.push({ ...item, queuedAt: new Date().toISOString() });
  _writePending(arr);
}

/** RGPD : whitelist stricte pour `infos_eleve`.
 *  Aucune identité personnelle (nom, prénom, lycée, email) ne quitte le poste.
 *  Seules les clés ci-dessous sont autorisées dans Firestore. */
const INFOS_ELEVE_WHITELIST = new Set([
  "userCode", "classe", "annee_scolaire", "titre_dossier",
  "valeurs", "qualites", "interets", "pourquoi_cap", "projet_apres"
]);
const PII_KEYS_BLACKLIST = ["nom", "prenom", "lycee", "lycee_pro", "email", "adresse", "telephone", "tel", "date_naissance"];

function _scrubInfosEleve(infos) {
  if (!infos || typeof infos !== "object") return infos;
  const out = {};
  for (const k of Object.keys(infos)) {
    if (INFOS_ELEVE_WHITELIST.has(k)) out[k] = infos[k];
  }
  return out;
}

/** RGPD : retire toute donnée perso éventuelle avant écriture. */
function _scrubPII(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const out = { ...obj };
  [...PII_KEYS_BLACKLIST, "photo", "photo_url", "photos"].forEach(k => { delete out[k]; });
  if (out.infos_eleve && typeof out.infos_eleve === "object") {
    out.infos_eleve = _scrubInfosEleve(out.infos_eleve);
  }
  if (out.reponses && typeof out.reponses === "object") {
    // les réponses élève peuvent contenir du texte libre — on garde, mais pas de média.
    const r = { ...out.reponses };
    Object.keys(r).forEach(k => {
      const v = r[k];
      if (typeof v === "string" && v.startsWith("data:image/")) delete r[k];
    });
    out.reponses = r;
  }
  return out;
}

function _toast(msg, kind = "ok") {
  try {
    let el = document.getElementById("psr-fb-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "psr-fb-toast";
      el.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);" +
        "background:#1f2937;color:#fff;padding:10px 16px;border-radius:8px;font-size:14px;" +
        "z-index:99999;box-shadow:0 4px 14px rgba(0,0,0,.25);opacity:0;transition:opacity .25s;" +
        "max-width:90vw;";
      document.body.appendChild(el);
    }
    el.style.background = kind === "offline" ? "#92400e" : "#065f46";
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = "0"; }, 3000);
  } catch {}
}

function _throttled(devoirId) {
  const last = _lastWriteAt.get(devoirId) || 0;
  return (Date.now() - last) < THROTTLE_MS;
}

/* ---------- API ---------- */

async function saveEvaluation(evalData) {
  const code = _userCode();
  if (!code || !evalData || !evalData.devoirId) return { ok: false, reason: "no-user-or-id" };
  if (_throttled(evalData.devoirId)) return { ok: false, reason: "throttled" };
  _lastWriteAt.set(evalData.devoirId, Date.now());

  const nowIso = new Date().toISOString();
  const payload = _scrubPII({
    eleveCode: code,
    bareme: 20,
    publie: true,
    autocorrected: true,
    source: "psr_portfolio",
    competences: [],
    questions: {},
    reponses: {},
    createdAtISO: nowIso,
    ...evalData,
    updatedAtISO: nowIso
  });

  if (!db || !_online()) {
    _enqueue({ kind: "evaluation", code, devoirId: payload.devoirId, payload });
    _toast("💾 Note enregistrée localement (sera synchro au prochain accès)", "offline");
    return { ok: true, offline: true };
  }

  try {
    const ref = doc(db, "resultats", code, "evaluations", payload.devoirId);
    await setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
    _toast("✅ Note enregistrée dans Mon espace");
    return { ok: true };
  } catch (e) {
    console.warn("[PSR_FIREBASE] saveEvaluation fail:", e);
    _enqueue({ kind: "evaluation", code, devoirId: payload.devoirId, payload });
    _toast("💾 Note enregistrée localement (sera synchro au prochain accès)", "offline");
    return { ok: false, error: String(e), queued: true };
  }
}

async function saveCopie(copieData) {
  const code = _userCode();
  if (!code || !copieData || !copieData.devoirId) return { ok: false };
  const docId = copieData.devoirId + "_autoeval";
  const payload = _scrubPII({
    eleveCode: code,
    source: "psr_portfolio",
    createdAtISO: new Date().toISOString(),
    reponses: {},
    ...copieData
  });
  if (!db || !_online()) {
    _enqueue({ kind: "copie", code, docId, payload });
    return { ok: true, offline: true };
  }
  try {
    const ref = doc(db, "resultats", code, "copies", docId);
    await setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
    return { ok: true };
  } catch (e) {
    _enqueue({ kind: "copie", code, docId, payload });
    return { ok: false, queued: true };
  }
}

async function getEvaluation(devoirId) {
  const code = _userCode();
  if (!code || !db || !devoirId) return null;
  try {
    const ref = doc(db, "resultats", code, "evaluations", devoirId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch { return null; }
}

async function flushPending() {
  if (!db || !_online()) return;
  const arr = _readPending();
  if (!arr.length) return;
  const remaining = [];
  for (const it of arr) {
    try {
      if (it.kind === "evaluation") {
        const ref = doc(db, "resultats", it.code, "evaluations", it.devoirId);
        await setDoc(ref, { ...it.payload, updatedAt: serverTimestamp() }, { merge: true });
      } else if (it.kind === "copie") {
        const ref = doc(db, "resultats", it.code, "copies", it.docId);
        await setDoc(ref, { ...it.payload, updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      remaining.push(it);
    }
  }
  _writePending(remaining);
  if (arr.length && remaining.length < arr.length) {
    _toast("✅ Notes en attente synchronisées");
  }
}

function isAvailable() { return !!db && _online(); }

/* =====================================================================
   PHASE 4 — Synchronisation du state complet du portfolio
   ---------------------------------------------------------------------
   Doc cible : resultats/{userCode}/portfolio/state
   - Photos (data:image/...) filtrées avant envoi (RGPD + taille)
   - Throttle 5 s (debounce écriture)
   - Mode offline : file en localStorage, flush au retour online
   - Last-write-wins (pas de verrou multi-onglets)
   ===================================================================== */

const STATE_THROTTLE_MS = 5000;
const STATE_MAX_BYTES = 500 * 1024; // 500 Ko
const STATE_PENDING_KEY = "psr_pending_state";
let _stateTimer = null;
let _stateLastWrite = 0;
let _stateInFlight = false;

function _setSyncIndicator(active, status /* 'online' | 'offline' | 'error' */) {
  try {
    const el = document.getElementById("sync-indicator");
    if (!el) return;
    el.classList.toggle("syncing", !!active);
    if (status === "offline") {
      el.title = "Synchro à la prochaine connexion";
      el.classList.add("offline");
    } else if (status === "error") {
      el.title = "Erreur de synchro — réessai au prochain enregistrement";
      el.classList.add("error");
    } else {
      el.title = "Travail synchronisé sur tous tes appareils";
      el.classList.remove("offline");
      el.classList.remove("error");
    }
  } catch {}
}

/** Filtre récursivement les valeurs `data:image/...` et champs PII.
 *  Whitelisting strict pour `infos_eleve`. Drop des items `champs` dont l'id est PII
 *  (sections de type "identite" qui contiennent {id:"nom", valeur:"DURAND"}). */
function _stripPhotosAndPII(input) {
  const seen = new WeakSet();
  const piiIdRe = new RegExp("^(" + PII_KEYS_BLACKLIST.join("|") + ")$", "i");
  function walk(v, parentKey) {
    if (v == null) return v;
    if (typeof v === "string") {
      if (v.startsWith("data:image/")) return "<photo locale>";
      return v;
    }
    if (typeof v !== "object") return v;
    if (seen.has(v)) return undefined;
    seen.add(v);
    if (Array.isArray(v)) {
      const out = [];
      for (const x of v) {
        // Drop les items {id, valeur} où id est un champ PII (section identite).
        if (x && typeof x === "object" && !Array.isArray(x) &&
            typeof x.id === "string" && piiIdRe.test(x.id)) continue;
        const r = walk(x, parentKey);
        if (r !== undefined) out.push(r);
      }
      return out;
    }
    // Whitelist stricte pour infos_eleve.
    if (parentKey === "__infos_eleve__") {
      const out = {};
      for (const k of Object.keys(v)) {
        if (INFOS_ELEVE_WHITELIST.has(k)) {
          const r = walk(v[k], k);
          if (r !== undefined && r !== null && r !== "") out[k] = r;
        }
      }
      return out;
    }
    const out = {};
    for (const k of Object.keys(v)) {
      // Photos jamais envoyées.
      if (/^(photo|photo_url|photos)$/i.test(k)) continue;
      // PII jamais envoyée (à n'importe quel niveau).
      if (piiIdRe.test(k)) continue;
      const childParent = (k === "infos_eleve") ? "__infos_eleve__" : k;
      const r = walk(v[k], childParent);
      if (r === undefined) continue;
      // compresse : retire null / "" / [] / {} pour gagner de la place
      if (r === null) continue;
      if (typeof r === "string" && r === "") continue;
      if (Array.isArray(r) && r.length === 0) continue;
      if (typeof r === "object" && !Array.isArray(r) && Object.keys(r).length === 0) continue;
      out[k] = r;
    }
    return out;
  }
  return walk(input, null);
}

/* =====================================================================
   TEST RGPD — à exécuter depuis la console :
     PSR_FIREBASE._psrTestRGPD()
   Vérifie que nom/prenom/lycee/email/photos sortent du payload,
   et que userCode/classe/projet sont conservés.
   ===================================================================== */
function _psrTestRGPD() {
  const fixture = {
    meta: { app_version: "test" },
    infos_eleve: {
      userCode: "KA47", classe: "CAP PSR 1A",
      nom: "DURAND", prenom: "Marie", lycee: "Jean Moulin",
      email: "marie@x.fr", titre_dossier: "Bowl bio",
      valeurs: ["Respect"], qualites: ["Soignée"],
      pourquoi_cap: "J'aime cuisiner.", projet_apres: "Bac pro."
    },
    sections: [{
      id: "identite",
      champs: [
        { id: "nom", valeur: "DURAND" },
        { id: "prenom", valeur: "Marie" },
        { id: "lycee", valeur: "Jean Moulin" },
        { id: "valeurs", valeur: ["Respect"] }
      ],
      preuves: [{ id: "p1", data: "data:image/jpeg;base64,AAAA" }]
    }]
  };
  const cleaned = _stripPhotosAndPII(fixture);
  const ie = cleaned.infos_eleve || {};
  const champsIds = (cleaned.sections?.[0]?.champs || []).map(c => c.id);
  const checks = {
    "infos_eleve.nom absent": !("nom" in ie),
    "infos_eleve.prenom absent": !("prenom" in ie),
    "infos_eleve.lycee absent": !("lycee" in ie),
    "infos_eleve.email absent": !("email" in ie),
    "infos_eleve.userCode présent": ie.userCode === "KA47",
    "infos_eleve.classe présent": ie.classe === "CAP PSR 1A",
    "infos_eleve.titre_dossier présent": ie.titre_dossier === "Bowl bio",
    "infos_eleve.pourquoi_cap présent": !!ie.pourquoi_cap,
    "champs identité 'nom' droppé": !champsIds.includes("nom"),
    "champs identité 'prenom' droppé": !champsIds.includes("prenom"),
    "champs identité 'lycee' droppé": !champsIds.includes("lycee"),
    "champs identité 'valeurs' conservé": champsIds.includes("valeurs"),
    "photo neutralisée": JSON.stringify(cleaned).indexOf("data:image/") === -1
  };
  const fails = Object.entries(checks).filter(([, ok]) => !ok);
  console.log("[PSR_FIREBASE._psrTestRGPD] résultat :", checks);
  console.log(fails.length ? "❌ FAILS:" : "✅ Tous les tests passent.", fails);
  return { ok: fails.length === 0, checks, cleaned };
}

function _truncateState(state) {
  // Stratégie : garder meta + infos_eleve + progression + les 30 sections les plus récentes (par date_maj).
  const out = { ...state };
  if (Array.isArray(out.sections) && out.sections.length > 30) {
    const sorted = [...out.sections].sort((a, b) => {
      const da = new Date(a?.date_maj || 0).getTime();
      const db = new Date(b?.date_maj || 0).getTime();
      return db - da;
    });
    out.sections = sorted.slice(0, 30);
    out._truncated = true;
  }
  return out;
}

async function _writeStateNow(state) {
  const code = _userCode();
  if (!code || !db) return { ok: false, reason: "no-db-or-user" };
  let filtered = _stripPhotosAndPII(state);
  let json = JSON.stringify(filtered);
  if (json.length > STATE_MAX_BYTES) {
    console.warn("[PSR_FIREBASE] state > 500 Ko, troncature…");
    filtered = _truncateState(filtered);
    json = JSON.stringify(filtered);
    if (json.length > STATE_MAX_BYTES) {
      console.warn("[PSR_FIREBASE] state toujours > 500 Ko après troncature, abandon");
      return { ok: false, reason: "too-large" };
    }
  }
  try {
    _stateInFlight = true;
    _setSyncIndicator(true, "online");
    const ref = doc(db, "resultats", code, "portfolio", "state");
    await setDoc(ref, {
      eleveCode: code,
      source: "psr_portfolio",
      state: filtered,
      updatedAtISO: new Date().toISOString(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    _stateLastWrite = Date.now();
    _setSyncIndicator(false, "online");
    return { ok: true };
  } catch (e) {
    console.warn("[PSR_FIREBASE] savePortfolioState fail:", e);
    try { localStorage.setItem(STATE_PENDING_KEY, JSON.stringify(filtered)); } catch {}
    _setSyncIndicator(false, "error");
    return { ok: false, error: String(e), queued: true };
  } finally {
    _stateInFlight = false;
  }
}

function savePortfolioState(state) {
  if (!state) return;
  if (!_userCode()) return;
  if (!_online() || !db) {
    try { localStorage.setItem(STATE_PENDING_KEY, JSON.stringify(_stripPhotosAndPII(state))); } catch {}
    _setSyncIndicator(false, "offline");
    return;
  }
  // Debounce : écrit au plus une fois toutes les 5 s.
  clearTimeout(_stateTimer);
  const elapsed = Date.now() - _stateLastWrite;
  const delay = elapsed >= STATE_THROTTLE_MS ? 50 : (STATE_THROTTLE_MS - elapsed);
  _stateTimer = setTimeout(() => { _writeStateNow(state); }, delay);
}

async function loadPortfolioState() {
  const code = _userCode();
  if (!code || !db) return null;
  try {
    const ref = doc(db, "resultats", code, "portfolio", "state");
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return data && data.state ? data.state : null;
  } catch (e) {
    console.warn("[PSR_FIREBASE] loadPortfolioState fail:", e);
    return null;
  }
}

async function _flushPendingState() {
  if (!db || !_online()) return;
  const raw = localStorage.getItem(STATE_PENDING_KEY);
  if (!raw) return;
  try {
    const filtered = JSON.parse(raw);
    const r = await _writeStateNow(filtered);
    if (r.ok) localStorage.removeItem(STATE_PENDING_KEY);
  } catch {}
}

window.PSR_FIREBASE = {
  saveEvaluation, saveCopie, getEvaluation, flushPending, isAvailable,
  savePortfolioState, loadPortfolioState,
  // test / debug
  _psrTestRGPD, _stripPhotosAndPII, _scrubPII
};

// Tente une synchro à l'init et à chaque retour en ligne.
window.addEventListener("online", () => { flushPending(); _flushPendingState(); _setSyncIndicator(false, "online"); });
window.addEventListener("offline", () => { _setSyncIndicator(false, "offline"); });
setTimeout(() => { flushPending(); _flushPendingState(); }, 2500);

/* =====================================================================
   COCKPIT (futur cockpit_psr.html) — comment lire les notes PSR :

     import { getFirestore, collectionGroup, query, where, getDocs }
       from "firebase-firestore";
     const q = query(collectionGroup(db, "evaluations"),
                     where("source", "==", "psr_portfolio"));
     const snap = await getDocs(q);

   ENSEIGNANT — modifier une note :
     L'enseignant écrit setDoc(ref, { note_finale, appreciation, publie },
     { merge: true }) sur le MÊME devoirId. L'élève voit la version la plus
     récente à sa prochaine ouverture de resultats.html (ou cockpit).
   ===================================================================== */
