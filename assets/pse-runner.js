/* PSE Runner v2 (débutant-friendly) */
/* Prérequis : Firebase v8 initialisé dans window.db (firestore) */

(function () {
  const PSE = {
    collections: {
      submissions: "copies",
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
    setTimeout(() => el.remove(), 2600);
  }

  function bannerEnsure() {
    let b = qs("#pse-banner");
    if (b) return b;
    b = document.createElement("div");
    b.id = "pse-banner";
    b.className = "pse-banner";
    b.innerHTML = `
      <div id="pse-banner-text">PSE : prêt</div>
      <div class="pse-banner-actions">
        <button type="button" id="pse-btn-reset">Recommencer</button>
      </div>
    `;
    document.body.prepend(b);

    const resetBtn = qs("#pse-btn-reset");
    resetBtn.addEventListener("click", () => {
      const exId = getExerciceId();
      localStorage.removeItem(draftKey(exId));
      localStorage.removeItem(sentKey(exId));
      location.reload();
    });

    return b;
  }

  function setBanner(text, kind) {
    const b = bannerEnsure();
    const t = qs("#pse-banner-text");
    t.textContent = text;
    b.classList.remove("ok","err");
    if (kind) b.classList.add(kind);
  }

  function getMeta(name, fallback = "") {
    const m = document.querySelector(`meta[name="${name}"]`);
    return m ? (m.getAttribute("content") || fallback) : fallback;
  }

  function getExerciceId() {
    return (getMeta("pse-exercice") || (document.title || "devoir")).trim().slice(0, 120) || "devoir";
  }

  function getVersion() {
    return getMeta("pse-version") || "v1";
  }

  function getMode() {
    const p = new URLSearchParams(location.search);
    return (p.get("mode") || getMeta("pse-mode") || "").toLowerCase();
  }

  function ensureDbOrExplain() {
    if (window.db && typeof window.db.collection === "function") return true;
    setBanner("Erreur : Firebase/Firestore non initialisé (window.db absent).", "err");
    alert("Erreur : Firestore non initialisé.\n\nIl faut que la page contienne le bloc Firebase v8 (firebase-app + firebase-firestore + firebase.initializeApp + window.db).");
    return false;
  }

  async function ensureAuth() {
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
        if (!Object.prototype.hasOwnProperty.call(reponses, key)) reponses[key] = "";
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
    setBanner("Brouillon sauvegardé automatiquement", null);
  }

  function restoreDraft(exerciceId) {
    const raw = localStorage.getItem(draftKey(exerciceId));
    if (!raw) return false;
    try {
      const payload = JSON.parse(raw);
      if (!payload || !payload.reponses) return false;
      applyReponses(payload.reponses, document);
      setBanner("Brouillon restauré", "ok");
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
    if (!ensureDbOrExplain()) return;
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
    if (!ensureDbOrExplain()) return;
    const exerciceId = getExerciceId();
    const btn = qs("#" + PSE.submitBtnId);
    if (btn) btn.disabled = true;

    const okAuth = await ensureAuth();
    if (!okAuth) { if (btn) btn.disabled = false; return; }

    const code = localStorage.getItem("userCode") || localStorage.getItem("codeEleve") || "";
    const classe = localStorage.getItem("userClasse") || localStorage.getItem("userClasseNom") || "";

    let score = null;
    try { if (typeof window.computeScore === "function") score = window.computeScore(); } catch {}

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
      setBanner("Envoyé au prof ✅", "ok");
      toast("Devoir envoyé", "ok");
      alert("Envoyé au prof ✅\n\nÉtape suivante : ouvre Firebase > Firestore > collection '" + PSE.collections.submissions + "' pour voir la copie.");
      lockAfterSend();
    } catch (e) {
      setBanner("Erreur d’envoi : copie non envoyée", "err");
      const msg = (e && e.message) ? e.message : String(e);
      alert("Erreur d’envoi :\n" + msg + "\n\nTon travail reste sauvegardé (brouillon).");
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

    bannerEnsure();
    const exerciceId = getExerciceId();

    const sentTs = localStorage.getItem(sentKey(exerciceId));
    if (sentTs) {
      const d = new Date(parseInt(sentTs, 10));
      setBanner("Déjà envoyé ✅ (" + d.toLocaleString() + ")", "ok");
      lockAfterSend();
    } else {
      restoreDraft(exerciceId);
      setupAutosave(exerciceId);
      setBanner("Prêt : réponds puis clique ENVOYER AU PROF", null);
    }

    setupSubmitButton();
    traceUsage(exerciceId);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
