/* PSE Runner v1 (HTML natif + moteur commun) */
/* Prérequis recommandé : Firebase v8 initialisé dans window.db (firestore) */

(function () {
  const PSE = {
    collections: {
      submissions: "copies",            // ou "resultats_exercices"
      usage: "statistiques_usage"
    },
    autosaveMs: 800,
    draftPrefix: "pse_draft_",
    sentPrefix: "pse_sent_",
    submitBtnId: "pse-submit"
  };

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function toast(msg, kind) {
    const el = document.createElement("div");
    el.className = "pse-toast" + (kind ? " " + kind : "");
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  function getMeta(name, fallback = "") {
    const m = document.querySelector(`meta[name="${name}"]`);
    return m ? (m.getAttribute("content") || fallback) : fallback;
  }

  function getExerciceId() {
    return (
      getMeta("pse-exercice") ||
      (document.title || "devoir").trim().slice(0, 120) ||
      "devoir"
    );
  }

  function getVersion() {
    return getMeta("pse-version") || "v1";
  }

  function getMode() {
    const p = new URLSearchParams(location.search);
    return (p.get("mode") || getMeta("pse-mode") || "").toLowerCase();
  }

  function ensureDb() {
    if (window.db && typeof window.db.collection === "function") return true;
    toast("Firestore non initialisé (window.db manquant).", "err");
    return false;
  }

  async function ensureAuth() {
    // Si tu as déjà demanderCode() via annuaire.js, on l’utilise.
    if (typeof window.demanderCode === "function") {
      const res = await window.demanderCode();
      if (res && res.code) {
        localStorage.setItem("userCode", res.code);
        localStorage.setItem("codeEleve", res.code);
      }
      if (res && res.classe) {
        localStorage.setItem("userClasse", res.classe);
        localStorage.setItem("userClasseNom", res.classe);
      }
      return true;
    }

    // Fallback simple si pas d’annuaire.js (optionnel)
    const code = localStorage.getItem("userCode") || localStorage.getItem("codeEleve");
    if (code) return true;

    const input = prompt("Code élève");
    if (!input) return false;
    localStorage.setItem("userCode", input.trim());
    localStorage.setItem("codeEleve", input.trim());
    return true;
  }

  function stableKeyForField(el, idx) {
    return el.getAttribute("data-qid") || el.id || el.name || ("field_" + idx);
  }

  function isInsideExcludedZone(el) {
    return !!el.closest(".answer-key-zone, .prof-comment-zone, .teacher-only, .no-collect, #main-tools, #rich-format-toolbar, .modal, .pse-hidden");
  }

  function collectReponses(root = document) {
    const fields = qsa("input, textarea, select", root)
      .filter(el => !el.disabled)
      .filter(el => !isInsideExcludedZone(el));

    const reponses = {};
    fields.forEach((el, idx) => {
      const key = stableKeyForField(el, idx);
      const tag = el.tagName.toLowerCase();
      const type = (el.getAttribute("type") || "").toLowerCase();

      if (tag === "input" && type === "radio") {
        if (!reponses.hasOwnProperty(key)) reponses[key] = "";
        if (el.checked) reponses[key] = el.value;
        return;
      }

      if (tag === "input" && type === "checkbox") {
        reponses[key] = !!el.checked;
        return;
      }

      reponses[key] = el.value ?? "";
    });

    return reponses;
  }

  function applyReponses(reponses, root = document) {
    if (!reponses) return;
    const fields = qsa("input, textarea, select", root)
      .filter(el => !el.disabled)
      .filter(el => !isInsideExcludedZone(el));

    const byKey = new Map();
    fields.forEach((el, idx) => {
      const key = stableKeyForField(el, idx);
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key).push(el);
    });

    Object.keys(reponses).forEach(key => {
      const els = byKey.get(key);
      if (!els) return;
      const val = reponses[key];

      els.forEach(el => {
        const tag = el.tagName.toLowerCase();
        const type = (el.getAttribute("type") || "").toLowerCase();

        if (tag === "input" && type === "checkbox") {
          el.checked = !!val;
          return;
        }

        if (tag === "input" && type === "radio") {
          el.checked = (String(el.value) === String(val));
          return;
        }

        el.value = (val ?? "");
      });
    });
  }

  function draftKey(exerciceId) {
    const code = localStorage.getItem("userCode") || localStorage.getItem("codeEleve") || "X";
    return PSE.draftPrefix + exerciceId + "_" + code;
  }

  function sentKey(exerciceId) {
    const code = localStorage.getItem("userCode") || localStorage.getItem("codeEleve") || "X";
    return PSE.sentPrefix + exerciceId + "_" + code;
  }

  function saveDraft(exerciceId) {
    const reponses = collectReponses(document);
    const payload = { ts: Date.now(), exerciceId, version: getVersion(), reponses };
    localStorage.setItem(draftKey(exerciceId), JSON.stringify(payload));
  }

  function restoreDraft(exerciceId) {
    const raw = localStorage.getItem(draftKey(exerciceId));
    if (!raw) return false;
    try {
      const payload = JSON.parse(raw);
      if (!payload || !payload.reponses) return false;
      applyReponses(payload.reponses, document);
      toast("Brouillon restauré", "ok");
      return true;
    } catch {
      return false;
    }
  }

  function lockAfterSend() {
    qsa("input, textarea, select, button").forEach(el => {
      if (el.id === PSE.submitBtnId) return;
      el.disabled = true;
    });
    const btn = qs("#" + PSE.submitBtnId);
    if (btn) btn.disabled = true;
  }

  async function traceUsage(exerciceId) {
    if (!ensureDb()) return;
    const code = localStorage.getItem("userCode") || localStorage.getItem("codeEleve") || "";
    const classe = localStorage.getItem("userClasse") || localStorage.getItem("userClasseNom") || "";

    const payload = {
      ts: Date.now(),
      exercice: exerciceId,
      url: location.href,
      eleve: code,
      classe: classe
    };

    try { await window.db.collection(PSE.collections.usage).add(payload); } catch {}
  }

  async function submit() {
    if (!ensureDb()) return;
    const exerciceId = getExerciceId();
    const btn = qs("#" + PSE.submitBtnId);
    if (btn) btn.disabled = true;

    const okAuth = await ensureAuth();
    if (!okAuth) { if (btn) btn.disabled = false; return; }

    const code = localStorage.getItem("userCode") || localStorage.getItem("codeEleve") || "";
    const classe = localStorage.getItem("userClasse") || localStorage.getItem("userClasseNom") || "";

    // Option score si tu as une fonction globale dans le devoir
    let score = null;
    try {
      if (typeof window.computeScore === "function") score = window.computeScore();
    } catch {}

    const payload = {
      ts: Date.now(),
      exercice: exerciceId,
      version: getVersion(),
      url: location.href,
      eleve: code,
      classe: classe,
      reponses: collectReponses(document),
      score: score
    };

    try {
      await window.db.collection(PSE.collections.submissions).add(payload);
      localStorage.setItem(sentKey(exerciceId), String(Date.now()));
      toast("Devoir envoyé", "ok");
      lockAfterSend();
    } catch (e) {
      toast("Erreur envoi. Reviens au brouillon et réessaie.", "err");
      if (btn) btn.disabled = false;
    }
  }

  function setupAutosave(exerciceId) {
    let t = null;
    const handler = () => {
      clearTimeout(t);
      t = setTimeout(() => saveDraft(exerciceId), PSE.autosaveMs);
    };
    document.addEventListener("input", handler, true);
    document.addEventListener("change", handler, true);
  }

  function setupSubmitButton() {
    const btn = qs("#" + PSE.submitBtnId);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      submit();
    });
  }

  function boot() {
    const mode = getMode();
    if (mode === "prof" || mode === "builder") return;

    const exerciceId = getExerciceId();

    // Si déjà envoyé, verrouille
    if (localStorage.getItem(sentKey(exerciceId))) {
      lockAfterSend();
    } else {
      restoreDraft(exerciceId);
      setupAutosave(exerciceId);
    }

    setupSubmitButton();
    traceUsage(exerciceId);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
