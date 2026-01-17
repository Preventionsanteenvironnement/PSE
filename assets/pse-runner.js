/* PSE RUNNER v6 - DÉTECTION ID AMÉLIORÉE */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. CONFIGURATION (Vos clés) ---
const firebaseConfig = {
    apiKey: "AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI",
    authDomain: "devoirs-pse.firebaseapp.com",
    projectId: "devoirs-pse",
    storageBucket: "devoirs-pse.firebasestorage.app",
    messagingSenderId: "614730413904",
    appId: "1:614730413904:web:a5dd478af5de30f6bede55"
};

// --- 2. INITIALISATION ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("🔥 Firebase Connecté (v6 - Détection ID améliorée)");

// --- 3. GESTION BROUILLON (Local) ---
function getStorageKey() {
    return "brouillon_" + (document.title.replace(/[^a-zA-Z0-9]/g, '_') || "defaut");
}

function saveDraft() {
    const data = {};
    document.querySelectorAll("input, textarea, select").forEach((el) => {
        const key = el.getAttribute('data-qid') || el.id;
        if (!key) return;
        
        if (el.type === 'radio' || el.type === 'checkbox') {
            if (el.checked) data[key] = el.value;
        } else {
            data[key] = el.value;
        }
    });
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

function restoreDraft() {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
        try {
            const data = JSON.parse(saved);
            document.querySelectorAll("input, textarea, select").forEach((el) => {
                const key = el.getAttribute('data-qid') || el.id;
                if (data[key] !== undefined) {
                    if (el.type === 'radio' || el.type === 'checkbox') {
                        if (el.value === data[key]) el.checked = true;
                    } else {
                        el.value = data[key];
                    }
                }
            });
            console.log("Brouillon restauré.");
        } catch(e) {}
    }
}

// --- 4. DÉTECTION INTELLIGENTE DE L'ID DEVOIR ---
function detectDevoirId() {
    // Méthode 1 : Attribut data-id-exercice (préféré)
    const attrId = document.body.getAttribute('data-id-exercice');
    if (attrId && attrId !== 'undefined' && attrId !== '') {
        console.log("✅ ID trouvé via data-id-exercice:", attrId);
        return attrId;
    }
    
    // Méthode 2 : Variable globale MON_ID_DEVOIR
    if (typeof window.MON_ID_DEVOIR !== 'undefined' && window.MON_ID_DEVOIR) {
        console.log("✅ ID trouvé via MON_ID_DEVOIR:", window.MON_ID_DEVOIR);
        return window.MON_ID_DEVOIR;
    }
    
    // Méthode 3 : Extraction depuis l'URL (si hébergé)
    const urlMatch = window.location.pathname.match(/devoir_\d+/);
    if (urlMatch) {
        console.log("✅ ID trouvé via URL:", urlMatch[0]);
        return urlMatch[0];
    }
    
    // Méthode 4 : Titre du document (fallback)
    console.warn("⚠️ Fallback sur document.title:", document.title);
    return document.title;
}

// --- 5. FONCTION D'ENVOI (LE FACTEUR) ---
window.envoyerCopie = async function() {
    // Bouton feedback
    const btn = document.querySelector('button[onclick*="tenterEnvoi"]') || document.querySelector('button');
    if(btn) { btn.disabled = true; btn.innerText = "Envoi en cours... ⏳"; }

    try {
        // A. Récupération Identité (RGPD : CODE ANONYME)
        const codeEleve = sessionStorage.getItem("userCode") 
                       || document.getElementById('code-eleve')?.value 
                       || "ANONYME";
                       
        const classeEleve = sessionStorage.getItem("userClasse") 
                         || document.getElementById('classe-eleve')?.value 
                         || "VISITEUR";

        // B. Récupération Réponses
        const reponses = {};
        document.querySelectorAll("input, textarea, select").forEach(el => {
            const key = el.getAttribute('data-qid') || el.id;
            if(key && key !== 'code-eleve' && key !== 'classe-eleve') {
                if(el.type === 'radio') {
                    if(el.checked) reponses[key] = el.value;
                } else if (el.type === 'checkbox') {
                    reponses[key] = el.checked; 
                } else {
                    reponses[key] = el.value;
                }
            }
        });

        // C. Détection intelligente de l'ID devoir
        const idDevoir = detectDevoirId();
        console.log("📋 ID Devoir détecté:", idDevoir);

        // D. Création du Colis (Structure attendue par le Cockpit)
        const paquet = {
            idExercice: idDevoir,        // ← NOM STANDARD pour le Cockpit
            devoirId: idDevoir,          // ← Doublon sécurité
            titre: document.querySelector('h1')?.innerText || document.title,
            createdAt: serverTimestamp(),
            createdAtISO: new Date().toISOString(),
            date: new Date().toISOString(),
            identifiant: codeEleve,      // ← CODE ANONYME (RGPD)
            classe: classeEleve,
            eleve: {
                code: codeEleve,         // ← CODE ANONYME (RGPD)
                classe: classeEleve
            },
            reponses: reponses,
            temps_secondes: 0, 
            version: "v6_id_fix"
        };

        console.log("📤 Envoi vers 'devoirs_rendus' :", paquet);

        // E. Dépôt dans Firebase
        const docRef = await addDoc(collection(db, "devoirs_rendus"), paquet);
        
        console.log("✅ Reçu par Firebase ! ID:", docRef.id);
        alert("✅ Copie bien reçue par le professeur !");
        
        localStorage.removeItem(getStorageKey());
        if(btn) btn.innerText = "Envoyé avec succès ✅";

    } catch (e) {
        console.error("❌ Erreur critique:", e);
        alert("Erreur d'envoi : " + e.message);
        if(btn) { btn.disabled = false; btn.innerText = "Réessayer l'envoi 📤"; }
    }
};

// Démarrage auto
window.addEventListener('DOMContentLoaded', () => {
    restoreDraft();
    setInterval(saveDraft, 5000);
    console.log("🔍 ID Devoir au chargement:", detectDevoirId());
});
