// ============================================================================
// pse-runner.js - Version corrigée (à mettre sur GitHub)
// ============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Configuration Firebase
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

console.log("🚀 PSE Runner chargé - Version v2.0 (Fix Visiteur)");

/**
 * Fonction d'envoi de la copie élève à Firebase
 * @param {string} code - Code élève (8 chiffres)
 * @param {object} pasteStats - Statistiques de copier-coller
 * @param {object} eleveData - Données élève depuis l'annuaire (NOUVEAU)
 */
window.envoyerCopie = async function(code, pasteStats, eleveData) {
    console.log("📤 Tentative d'envoi...", { code, eleveData });
    
    try {
        // ⭐ FIX PRINCIPAL: Utiliser eleveData si disponible
        const eleveInfo = eleveData || {
            code: code,
            prenom: "Visiteur",
            nom: "",
            classe: "?"
        };
        
        console.log("👤 Élève identifié:", eleveInfo);
        
        // ============================================
        // 1. COLLECTER TOUTES LES RÉPONSES
        // ============================================
        const reponses = {};
        
        // Réponses textuelles (textarea)
        document.querySelectorAll('.reponse-eleve').forEach((el, i) => {
            const questionBlock = el.closest('.question-block');
            const numSelector = questionBlock?.querySelector('.num-selector');
            const questionNum = numSelector?.value || `Q${i+1}`;
            
            reponses[questionNum] = el.value.trim();
        });
        
        // Réponses à choix multiples (exercices "relier")
        document.querySelectorAll('.save-me-match').forEach((el) => {
            const id = el.dataset.id || `match_${Math.random()}`;
            reponses[id] = el.value;
        });
        
        // Réponses "trous" (exercices à compléter)
        document.querySelectorAll('.trou-eleve').forEach((el, i) => {
            const id = `trou_${i}`;
            reponses[id] = el.tagName === 'SELECT' ? el.value : el.value.trim();
        });
        
        console.log("📝 Réponses collectées:", Object.keys(reponses).length);
        
        // ============================================
        // 2. CALCULER LES COMPÉTENCES
        // ============================================
        const competences = {};
        let totalPoints = 0;
        let maxPoints = 0;
        
        document.querySelectorAll('.question-block').forEach(block => {
            const compSelector = block.querySelector('.comp-selector');
            const scoreInput = block.querySelector('.student-score');
            const maxInput = block.querySelector('.point-input');
            
            if(compSelector && scoreInput && maxInput) {
                const comp = compSelector.value;
                const score = parseFloat(scoreInput.value) || 0;
                const max = parseFloat(maxInput.value) || 0;
                
                if(comp && max > 0) {
                    // Calculer le niveau (0-3)
                    const ratio = score / max;
                    let niveau = 0;
                    if(ratio >= 0.85) niveau = 3;
                    else if(ratio >= 0.65) niveau = 2;
                    else if(ratio >= 0.40) niveau = 1;
                    
                    // Ajouter au total de la compétence
                    if(!competences[comp]) competences[comp] = 0;
                    competences[comp] += niveau;
                    
                    totalPoints += score;
                    maxPoints += max;
                }
            }
        });
        
        const noteSur20 = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 20 * 10) / 10 : 0;
        
        console.log("🎯 Compétences:", competences);
        console.log("📊 Note:", noteSur20, "/20");
        
        // ============================================
        // 3. CALCULER LE TEMPS PASSÉ
        // ============================================
        const startTime = parseInt(localStorage.getItem('devoir_start_time_' + (document.body.dataset.idExercice || 'unknown'))) || Date.now();
        const tempsSecondes = Math.floor((Date.now() - startTime) / 1000);
        
        console.log("⏱️ Temps passé:", tempsSecondes, "secondes");
        
        // ============================================
        // 4. PRÉPARER LES DONNÉES COMPLÈTES
        // ============================================
        const devoirId = document.body.dataset.idExercice || "unknown";
        const titre = document.querySelector('.main-title-editable')?.textContent.trim() || "Devoir PSE";
        
        const data = {
            // ⭐ INFORMATIONS ÉLÈVE (CLÉ STABLE)
            eleve: {
                userCode: eleveInfo.code,      // CLÉ UNIQUE ET STABLE
                prenom: eleveInfo.prenom,
                nom: eleveInfo.nom,
                classe: eleveInfo.classe
            },
            
            // ⭐ IDENTIFIANT LISIBLE (pour affichage)
            identifiant: eleveInfo.prenom + " " + eleveInfo.nom,
            
            // Informations devoir
            devoirId: devoirId,
            titre: titre,
            classe: eleveInfo.classe,
            
            // Réponses et scores
            reponses: reponses,
            competences: competences,
            note_finale: noteSur20,
            
            // Métadonnées
            temps_secondes: tempsSecondes,
            pasteStats: pasteStats || { total: 0, external: 0, document: 0 },
            
            // Timestamps
            createdAt: serverTimestamp(),
            createdAtISO: new Date().toISOString(),
            date: new Date().toISOString()
        };
        
        console.log("📦 Données complètes:", data);
        
        // ============================================
        // 5. ENREGISTRER LE TEMPS DE DÉBUT (si pas déjà fait)
        // ============================================
        if(!localStorage.getItem('devoir_start_time_' + devoirId)) {
            localStorage.setItem('devoir_start_time_' + devoirId, Date.now().toString());
        }
        
        // ============================================
        // 6. ENVOI À FIREBASE
        // ============================================
        const docId = `${eleveInfo.code}_${devoirId}_${Date.now()}`;
        
        await setDoc(doc(db, "devoirs_rendus", docId), data);
        
        console.log("✅ Envoi réussi! Doc ID:", docId);
        
        // ============================================
        // 7. CONFIRMATION VISUELLE
        // ============================================
        alert("✅ COPIE ENVOYÉE AVEC SUCCÈS !\n\n" +
              "Élève : " + eleveInfo.prenom + " " + eleveInfo.nom + "\n" +
              "Classe : " + eleveInfo.classe + "\n" +
              "Devoir : " + titre + "\n" +
              "Note : " + noteSur20 + " / 20\n\n" +
              "Votre devoir a bien été transmis au professeur.\n" +
              "Vous pouvez maintenant fermer cette page.");
        
        // Nettoyer le localStorage
        localStorage.removeItem('paste_log_' + devoirId);
        localStorage.removeItem('devoir_start_time_' + devoirId);
        
        // Optionnel : Bloquer la page pour éviter double envoi
        document.body.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; height:100vh; flex-direction:column; font-family:Arial; text-align:center; padding:20px;">
                <div style="font-size:4rem; margin-bottom:20px;">✅</div>
                <h1 style="color:#16a34a; margin:0;">Copie envoyée !</h1>
                <p style="color:#64748b; font-size:1.1rem;">Vous pouvez fermer cette fenêtre.</p>
                <p style="color:#94a3b8; font-size:0.9rem; margin-top:20px;">
                    ${eleveInfo.prenom} ${eleveInfo.nom} • ${eleveInfo.classe}<br>
                    ${titre} • Note: ${noteSur20}/20
                </p>
            </div>
        `;
        
    } catch(error) {
        console.error("❌ Erreur lors de l'envoi:", error);
        
        alert("❌ ERREUR D'ENVOI\n\n" +
              "Une erreur s'est produite lors de l'envoi de votre copie.\n\n" +
              "Détails : " + error.message + "\n\n" +
              "Veuillez :\n" +
              "1. Vérifier votre connexion internet\n" +
              "2. Réessayer dans quelques instants\n" +
              "3. Si le problème persiste, contactez votre professeur");
        
        throw error; // Propager l'erreur pour debugging
    }
};

console.log("✅ window.envoyerCopie défini et prêt");
