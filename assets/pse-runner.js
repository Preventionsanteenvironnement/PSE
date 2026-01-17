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
console.log("🔥 Firebase Connecté (v5)");

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
        // A. Récupération Identité (Code stocké dans sessionStorage via annuaire.js)
        // Ou fallback sur les inputs visibles s'ils existent
        const codeEleve = sessionStorage.getItem("userCode") 
                       || document.getElementById('code-eleve')?.value 
                       || document.getElementById('code-eleve')?.innerText 
                       || "ANONYME";
                       
        const classeEleve = sessionStorage.getItem("userClasse") 
                         || document.getElementById('classe-eleve')?.value 
                         || "VISITEUR";

        // B. Récupération Réponses
        const reponses = {};
        document.querySelectorAll("input, textarea, select").forEach(el => {
            const key = el.getAttribute('data-qid') || el.id;
            // On ignore les champs d'identité pour ne pas polluer les réponses
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
            // Champs obligatoires pour le tri dans le Cockpit
            devoirId: document.body.getAttribute('data-id-exercice') || document.title,
            titre: document.title,
            
            // Dates (Format Firestore + ISO)
            createdAt: serverTimestamp(),
            createdAtISO: new Date().toISOString(),
            date: new Date().toISOString(), // Doublon sécurité
            
            // Infos Élève (Structure Cockpit)
            identifiant: codeEleve, // Le cockpit utilise ce champ pour l'affichage
            classe: classeEleve,    // Le cockpit utilise ce champ pour le filtre
            eleve: {
                code: codeEleve,
                classe: classeEleve
            },
            
            // Le contenu
            reponses: reponses,
            
            // Métadonnées
            temps_secondes: 0, // Pour futur usage (chrono)
            version: "v5_correct"
        };

        console.log("📤 Envoi du paquet vers 'devoirs_rendus' :", paquet);

        // D. Dépôt dans la BONNE boîte aux lettres
        // C'est ICI que c'était faux avant ("copies" -> "devoirs_rendus")
        const docRef = await addDoc(collection(db, "devoirs_rendus"), paquet);
        
        console.log("✅ Reçu par Firebase ! ID:", docRef.id);
        alert("✅ Copie bien reçue par le professeur !");
        
        // Nettoyage
        localStorage.removeItem(getStorageKey());
        if(btn) btn.innerText = "Envoyé avec succès ✅";

    } catch (e) {
        console.error("❌ Erreur critique:", e);
        alert("Oups ! Erreur d'envoi. Vérifie ta connexion internet.\n\nDétail: " + e.message);
        if(btn) { btn.disabled = false; btn.innerText = "Réessayer l'envoi 📤"; }
    }
};

// Démarrage auto
window.addEventListener('DOMContentLoaded', () => {
    restoreDraft();
    setInterval(saveDraft, 5000);
});
