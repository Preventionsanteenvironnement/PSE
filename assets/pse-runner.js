/* PSE RUNNER v4 - FUTURE PROOF (Firebase v9 Modular) */

// On importe les fonctions modernes directement depuis les serveurs de Google
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc } 
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
console.log("🔥 Firebase v9 (Modulaire) Initialisé");

// --- 3. LOGIQUE DU DEVOIR ---

// Fonction utilitaire pour sauvegarder en local (anti-crash)
function getStorageKey() {
    // Nettoie le titre pour en faire une clé unique
    const id = document.title.replace(/[^a-zA-Z0-9]/g, '_');
    return "brouillon_" + id;
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
    }
}

// Fonction d'envoi exportée pour être utilisée dans le HTML
window.envoyerCopie = async function() {
    const btn = document.getElementById('btn-envoi');
    if(btn) { btn.disabled = true; btn.innerText = "Envoi en cours..."; }

    try {
        // 1. Récupération des réponses
        const reponses = {};
        document.querySelectorAll("input, textarea, select").forEach(el => {
            const key = el.getAttribute('data-qid') || el.id;
            if(key) {
                if(el.type === 'radio') {
                    if(el.checked) reponses[key] = el.value;
                } else if (el.type === 'checkbox') {
                    // Pour les checkbox, on gère souvent un tableau ou un booléen
                    reponses[key] = el.checked; 
                } else {
                    reponses[key] = el.value;
                }
            }
        });

        // 2. Création du paquet de données
        const paquet = {
            date: new Date().toISOString(),
            // L'ID du devoir est stocké dans le body ou le titre pour lier avec le Blueprint
            idExercice: document.body.getAttribute('data-id-exercice') || "inconnu", 
            eleve: {
                nom: document.getElementById('nom-eleve')?.value || "Anonyme",
                prenom: document.getElementById('prenom-eleve')?.value || "",
                classe: document.querySelector('input[placeholder*="Classe"]')?.value || ""
            },
            reponses: reponses,
            version: "v4_modern"
        };

        // 3. Envoi vers Firestore (Nouvelle syntaxe v9)
        const docRef = await addDoc(collection(db, "copies"), paquet);
        
        console.log("Document écrit avec ID: ", docRef.id);
        alert("✅ Copie envoyée au professeur !");
        localStorage.removeItem(getStorageKey()); // Nettoyage brouillon
        
        if(btn) btn.innerText = "Envoyé avec succès";

    } catch (e) {
        console.error("Erreur d'ajout: ", e);
        alert("❌ Erreur technique : " + e.message);
        if(btn) { btn.disabled = false; btn.innerText = "Réessayer"; }
    }
};

// Démarrage automatique au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    restoreDraft();
    setInterval(saveDraft, 5000); // Sauvegarde auto toutes les 5s
});
