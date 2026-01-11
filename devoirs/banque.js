/**
 * BANQUE DE DONNÉES PSE - MASTER (Version Intégrale)
 * ---------------------------------------------------------
 * Partie 1 : COMPETENCES (Fixe - pour l'évaluation question par question)
 * Partie 2 : BILAN (Flexible - pour l'appréciation générale et les conseils)
 */

const BANQUE_PSE = {

    // ==============================================================================
    // PARTIE 1 : COMMENTAIRES PAR COMPÉTENCE (POUR LES QUESTIONS)
    // ==============================================================================
    // Basé sur les tableaux d'indicateurs officiels (C2 détaillé par outil)
    COMPETENCES: {
        C1: {
            NT: ["Aucune information attendue identifiée.", "Information relevée fausse ou erronée."],
            I: ["Information attendue partiellement identifiée.", "Tu as trouvé une partie de l'info, mais c'est incomplet."],
            A: ["Information attendue clairement identifiée.", "Tu as bien repéré l'essentiel dans le document."],
            M: ["Information attendue clairement identifiée et reformulée/synthétisée.", "Parfait : info repérée et bien réexpliquée avec tes mots."]
        },
        C2: {
            NT: ["[Général] Problème non identifié.", "[Général] Aucune composante / une seule composante identifiée.", "[Causes-Effets] Une seule cause OU une seule conséquence placée.", "[ITAMaMi] Aucun élément ou réponse incohérente.", "[5M] Aucun élément ou réponse incohérente.", "[QQOQCP] Aucun élément ou réponse incohérente.", "[Risques] Aucun élément de réponse.", "[Travail] Aucun élément de réponse."],
            I: ["[Général] Problème identifié partiellement.", "[Général] Quelques composantes identifiées.", "[Causes-Effets] Une cause ET une conséquence placées.", "[ITAMaMi] 2 parties correctement complétées.", "[5M] 3 parties correctement renseignées.", "[QQOQCP] 3 parties correctement renseignées.", "[Risques] 2 éléments avec mise en relation.", "[Travail] 1 déterminant et 1 effet."],
            A: ["[Général] Problème clairement identifié.", "[Général] Majorité des composantes identifiée.", "[Causes-Effets] Plusieurs causes et au moins une conséquence.", "[ITAMaMi] 3 parties correctement complétées.", "[5M] 4 parties correctement renseignées.", "[QQOQCP] 4 parties correctement renseignées.", "[Risques] 3 éléments avec mise en relation.", "[Travail] Déterminants et Effets identifiés."],
            M: ["[Général] Problème identifié précisément.", "[Général] Toutes les composantes sont identifiées et liées.", "[Causes-Effets] Diagramme complet.", "[ITAMaMi] Les 4 parties correctement complétées.", "[5M] 5 parties correctement renseignées.", "[QQOQCP] 5 parties correctement renseignées.", "[Risques] Tous les éléments avec mise en relation complète.", "[Travail] Tous les éléments et lien de causalité établi."]
        },
        C3: {
            NT: ["Pas d'explication du phénomène/enjeu/règle."],
            I: ["Explication partielle, lien avec la prévention non établi."],
            A: ["Explication correcte, lien établi avec la prévention."],
            M: ["Explication complète avec vocabulaire scientifique/technique."]
        },
        C4: {
            NT: ["Pas de solution proposée ou solution inadaptée."],
            I: ["Solution en lien avec le thème mais pas adaptée à la situation.", "Solution trop vague."],
            A: ["Solution adaptée à la situation problème."],
            M: ["Solution réaliste, complète et associée au niveau adéquat."]
        },
        C5: {
            NT: ["Pas d'argument ou argument sans lien avec le choix."],
            I: ["Argument non pertinent ou justification trop faible."],
            A: ["Argument pertinent en lien avec un choix cohérent."],
            M: ["Argumentation solide avec preuves (coût, efficacité, sécurité)."]
        },
        C6: {
            NT: ["Absence de phrase, vocabulaire inadapté."],
            I: ["Syntaxe fragile, expression maladroite."],
            A: ["Phrases correctes, vocabulaire adapté, compréhensible."],
            M: ["Enchaînement fluide avec transitions et vocabulaire professionnel."]
        }
    },

    // ==============================================================================
    // PARTIE 2 : BILAN GÉNÉRAL (APPRÉCIATION + REMÉDIATION)
    // ==============================================================================
    // Contient vos phrases personnelles pour construire le commentaire de fin.
    
    BILAN: {
        
        // A. APPRÉCIATIONS GLOBALES (Classées par niveau de maîtrise)
        APPRECIATIONS: {
            M: [ // Très bien / Maîtrisé
                "Excellent travail : copie très soignée, réponses précises et bien justifiées.",
                "Très bon travail : ensemble solide, bonne compréhension du cours et des documents.",
                "Bon travail : résultats satisfaisants, quelques points restent à consolider."
            ],
            A: [ // Correct / Acceptable
                "Travail correct : l’essentiel est compris, mais il faut gagner en précision et en méthode.",
                "Travail sérieux : tu t’investis, continue en améliorant la rigueur et la justification.",
                "Bonne progression : des progrès visibles, il faut poursuivre les efforts pour stabiliser les acquis."
            ],
            I: [ // Fragile / Insuffisant
                "Travail inégal : certaines réponses sont réussies, d’autres sont à reprendre plus sérieusement.",
                "Copie soignée mais fragile : présentation correcte, mais des notions du cours sont à retravailler.",
                "Manque de rigueur : attention aux consignes et à la qualité des réponses, relis-toi."
            ],
            NT: [ // Non traité / Très insuffisant
                "Copie incomplète : plusieurs questions non traitées, il faut terminer et revoir la méthode.",
                "Travail insuffisant : plusieurs notions ne sont pas acquises, un temps de révision est nécessaire.",
                "Manque d’implication : réponses trop courtes ou incomplètes, il faut davantage développer."
            ]
        },

        // B. REMÉDIATIONS CIBLÉES (Conseils par compétence)
        REMEDIATIONS: {
            
            C1: [ // S'INFORMER
                "Relire la consigne et repérer exactement ce qui est demandé (C1).",
                "Relever les informations utiles dans les documents (C1).",
                "Surligner les mots-clés et les données chiffrées (C1).",
                "Vérifier unités, dates, pourcentages, sources (C1).",
                "Classer les infos par thèmes (danger, cause, conséquence, prévention) (C1).",
                "Reformuler l’information avec ses propres mots (C1).",
                "Compléter un tableau / schéma à partir des documents (C1).",
                "Éliminer les informations hors sujet (C1)."
            ],

            C2: [ // ANALYSER
                "Faire le QQOQCCP (qui, quoi, où, quand, comment, combien, pourquoi) (C2).",
                "Utiliser ITAMaMi (Individu, Tâche, Activité, Matériel, Milieu) (C2).",
                "Réaliser un PAD (processus d’apparition d’un dommage) (C2).",
                "Utiliser Ishikawa / 5M (Main-d’œuvre, Matériel, Méthode, Milieu, Matière) (C2).",
                "Identifier danger, événement déclencheur, dommage (C2).",
                "Repérer causes et conséquences (cause → effet) (C2).",
                "Lister facteurs aggravants et facteurs protecteurs (C2).",
                "Prioriser les risques (plus grave / plus probable) (C2)."
            ],

            C3: [ // EXPLIQUER
                "Définir les notions avec un vocabulaire scientifique et précis (C3).",
                "Expliquer le lien cause → conséquence (C3).",
                "Citer la règle ou la consigne de sécurité attendue (C3).",
                "Relier la règle à un risque concret (ce que ça évite) (C3).",
                "Donner un exemple concret lié à la situation (C3).",
                "Expliquer le rôle de la prévention (avant / pendant / après) (C3).",
                "Distinguer danger, risque, dommage (C3)."
            ],

            C4: [ // PROPOSER UNE SOLUTION
                "Proposer au moins 2 mesures de prévention (C4).",
                "Classer les mesures (collectives avant individuelles) (C4).",
                "Adapter la solution à la situation (réaliste, applicable) (C4).",
                "Préciser qui fait quoi et avec quel matériel (C4).",
                "Vérifier l’efficacité attendue (ce que ça réduit) (C4).",
                "Prévoir une action de contrôle (vérifier, entretenir, former) (C4).",
                "Utiliser la logique éviter → réduire → protéger (C4)."
            ],

            C5: [ // ARGUMENTER
                "Justifier le choix avec 2 critères minimum (sécurité, coût, efficacité, faisabilité) (C5).",
                "Comparer avantages / limites de plusieurs solutions (C5).",
                "Appuyer l’argumentation sur la situation et les documents (C5).",
                "Utiliser des connecteurs logiques (car, donc, cependant, ainsi) (C5).",
                "Conclure clairement (je choisis… parce que…) (C5).",
                "Vérifier la cohérence entre solution proposée et risque identifié (C5)."
            ],

            C6: [ // COMMUNIQUER
                "Répondre à toutes les questions (ne rien laisser vide) (C6).",
                "Si une question n’est pas comprise, reformuler ce qui est demandé puis répondre (C6).",
                "Répondre dans l’ordre des questions (C6).",
                "Écrire des phrases complètes (sujet + verbe + complément) (C6).",
                "Aérer la réponse (lignes, tirets, mots-clés) (C6).",
                "Utiliser un vocabulaire professionnel adapté (C6).",
                "Soigner l’orthographe des mots-clés PSE (C6).",
                "Éviter les réponses trop vagues (être précis) (C6).",
                "Se relire et corriger avant de rendre (C6)."
            ],

            // REVISION (Lien & QR Code)
            REVISION: [
                {
                    text: "Scanner le code QR ou utiliser le lien internet de révision indiqué sur la fiche pour vous exercer selon la compétence ciblée.",
                    lien: "https://preventionsanteenvironnement.github.io/PSE/",
                    qr: "QR_PSE_GLOBAL.png" // Image générique, ou générée dynamiquement par le script
                }
            ]
        }
    }
};

// Export pour utilisation dans index.html (compatibilité navigateur/module)
if (typeof window !== 'undefined') {
    window.BANQUE_PSE = BANQUE_PSE;
}