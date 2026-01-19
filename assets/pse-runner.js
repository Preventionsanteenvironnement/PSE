// ════════════════════════════════════════════════════════════════════════
// pse-runner.js - Version 4.0 (Structure sécurisée)
// Écrit dans : resultats/{eleveCode}/copies/{docId}
// ════════════════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

console.log("🚀 PSE Runner v4.0 - Structure sécurisée");

window.envoyerCopie = async function(code, pasteStats, eleveData) {
    console.log("📤 Envoi...", { code, eleveData });
    
    try {
        const eleveInfo = eleveData || { code: code, prenom: "Élève", nom: "", classe: "?" };
        const eleveCode = (eleveInfo.code || code).toUpperCase().trim();
        
        if (!eleveCode || eleveCode.length < 2) {
            throw new Error("Code élève invalide");
        }
        
        // Collecter les réponses
        const reponses = {};
        document.querySelectorAll('.reponse-eleve').forEach((el, i) => {
            const questionBlock = el.closest('.question-block');
            const numSelector = questionBlock?.querySelector('.num-selector');
            const questionNum = numSelector?.value || `Q${i+1}`;
            reponses[questionNum] = el.value.trim();
        });
        document.querySelectorAll('.save-me-match').forEach((el) => {
            reponses[el.dataset.id || `match_${Math.random()}`] = el.value;
        });
        document.querySelectorAll('.trou-eleve').forEach((el, i) => {
            reponses[`trou_${i}`] = el.tagName === 'SELECT' ? el.value : el.value.trim();
        });
        
        // Calculer compétences
        const competences = {};
        let totalPoints = 0, maxPoints = 0;
        document.querySelectorAll('.question-block').forEach(block => {
            const compSelector = block.querySelector('.comp-selector');
            const scoreInput = block.querySelector('.student-score');
            const maxInput = block.querySelector('.point-input');
            if(compSelector && scoreInput && maxInput) {
                const comp = compSelector.value;
                const score = parseFloat(scoreInput.value) || 0;
                const max = parseFloat(maxInput.value) || 0;
                if(comp && max > 0) {
                    const ratio = score / max;
                    let niveau = ratio >= 0.85 ? 3 : ratio >= 0.65 ? 2 : ratio >= 0.40 ? 1 : 0;
                    if(!competences[comp]) competences[comp] = 0;
                    competences[comp] += niveau;
                    totalPoints += score;
                    maxPoints += max;
                }
            }
        });
        const noteSur20 = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 20 * 10) / 10 : 0;
        
        // Temps
        const devoirId = document.body.dataset.idExercice || "unknown";
        const startTime = parseInt(localStorage.getItem('devoir_start_time_' + devoirId)) || Date.now();
        const tempsSecondes = Math.floor((Date.now() - startTime) / 1000);
        
        const titre = document.querySelector('.main-title-editable')?.textContent.trim() || "Devoir PSE";
        
        const data = {
            eleveCode: eleveCode,
            devoirId: devoirId,
            titre: titre,
            classe: eleveInfo.classe,
            eleve: { userCode: eleveCode, prenom: eleveInfo.prenom, nom: eleveInfo.nom, classe: eleveInfo.classe },
            reponses: reponses,
            competences: competences,
            note_auto: noteSur20,
            temps_secondes: tempsSecondes,
            pasteStats: pasteStats || { total: 0, external: 0, document: 0 },
            createdAt: serverTimestamp(),
            createdAtISO: new Date().toISOString()
        };
        
        // ⭐ CHEMIN SÉCURISÉ
        const docId = `${devoirId}_${Date.now()}`;
        await setDoc(doc(db, "resultats", eleveCode, "copies", docId), data);
        
        console.log("✅ Envoyé:", `resultats/${eleveCode}/copies/${docId}`);
        
        alert("✅ COPIE ENVOYÉE !\n\n" + eleveInfo.prenom + " " + eleveInfo.nom + "\n" + titre + "\nNote auto: " + noteSur20 + "/20");
        
        localStorage.removeItem('paste_log_' + devoirId);
        localStorage.removeItem('devoir_start_time_' + devoirId);
        
        document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;font-family:Arial;text-align:center;"><div style="font-size:4rem;">✅</div><h1 style="color:#16a34a;">Copie envoyée !</h1><p style="color:#64748b;">Vous pouvez fermer cette fenêtre.</p></div>`;
        
    } catch(error) {
        console.error("❌ Erreur:", error);
        alert("❌ ERREUR: " + error.message);
        throw error;
    }
};

console.log("✅ window.envoyerCopie prêt");
