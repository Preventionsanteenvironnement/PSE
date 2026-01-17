/* PSE RUNNER v5 - CORRIGÉ POUR LE COCKPIT */

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
console.log("🔥 Firebase Connecté (v5 - Vers devoirs_rendus)");

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

// --- 4. FONCTION D'ENVOI (LE FACTEUR) ---
window.envoyerCopie = async function() {
    // Bouton feedback
    const btn = document.querySelector('button[onclick*="tenterEnvoi"]') || document.querySelector('button');
    if(btn) { btn.disabled = true; btn.innerText = "Envoi en cours... ⏳"; }

    try {
        // A. Récupération Identité
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

        // C. Création du Colis (Structure attendue par le Cockpit)
        const paquet = {
            devoirId: document.body.getAttribute('data-id-exercice') || document.title,
            titre: document.querySelector('h1')?.innerText || document.title,
            createdAt: serverTimestamp(),
            createdAtISO: new Date().toISOString(),
            date: new Date().toISOString(), // Doublon sécurité pour le tri
            identifiant: codeEleve, 
            classe: classeEleve,
            eleve: {
                code: codeEleve,
                classe: classeEleve
            },
            reponses: reponses,
            temps_secondes: 0, 
            version: "v5_correct"
        };

        console.log("📤 Envoi vers 'devoirs_rendus' :", paquet);

        // D. Dépôt dans la BONNE boîte aux lettres (CORRECTION ICI)
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
});
