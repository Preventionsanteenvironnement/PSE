/* ============================================
   📦 MODULE COMPLÉMENTAIRE MASTER PSE v17.0
   
   MODIFICATIONS v17 (Février 2026) :
   - Values Vrai/Faux parlantes ("vrai"/"faux" au lieu de "true"/"false")
   - Compatible avec les 3 invariants de l'instruction v3.3
   
   COMPLET : Tableaux, Articles, Séparateurs, 
   Encadrés, Vrai/Faux, Texte+Image, PAD2
   ============================================ */

// ============================================
// 🎨 STYLES CSS
// ============================================
(function injectStyles() {
    const style = document.createElement('style');
    style.id = 'module-tableaux-styles';
    style.textContent = `
    
    /* ========== RÈGLE GLOBALE : TEXTE JUSTIFIÉ PARTOUT ========== */
    .text-block, .doc-block, .article-block, .question-block {
        text-align: justify;
    }
    
    .text-block *, .doc-block *, .article-block *, .doc-enriched-text,
    .important-box-content, .article-content, .theme-box-subtitle, 
    .banner-box-subtitle, .separator-illustrated-subtitle {
        text-align: justify !important;
        hyphens: auto;
        -webkit-hyphens: auto;
    }
    
    /* Exception pour les titres et éléments courts */
    .doc-title, .section-title-editable, .theme-box-title, 
    .banner-box-title, .important-box-label, .doc-enriched-title,
    .doc-enriched-badge, .num-box, .text-box, .vf-item-text {
        text-align: left !important;
    }
    
    /* ========== SÉPARATEURS ========== */
    
    .separator-line {
        margin: 30px 0;
        border: none;
        border-top: 2px solid #cbd5e1;
        position: relative;
    }
    
    .separator-titled {
        margin: 30px 0;
        position: relative;
        text-align: center;
        padding-right: 110px;
    }
    
    .separator-titled::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 0;
        right: 110px;
        height: 2px;
        background: linear-gradient(to right, transparent, #94a3b8, #94a3b8, transparent);
    }
    
    .separator-titled-text {
        display: inline-block;
        background: #f4f4f4;
        padding: 8px 20px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 2px;
        font-size: 0.9em;
        position: relative;
        z-index: 1;
        cursor: text;
    }
    
    .theme-box {
        margin: 30px 0 20px 0;
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        color: white;
        padding: 20px 25px;
        padding-right: 110px;
        border-radius: 12px;
        position: relative;
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    
    .theme-box-icon { font-size: 1.5em; margin-right: 10px; }
    .theme-box-title { font-size: 1.2em; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: text; }
    .theme-box-subtitle { font-size: 0.9em; opacity: 0.85; margin-top: 5px; cursor: text; }
    
    .banner-box {
        margin: 30px 0 20px 0;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 18px 25px;
        padding-right: 110px;
        border-radius: 10px;
        position: relative;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .banner-box-icon { font-size: 2em; flex-shrink: 0; }
    .banner-box-content { flex: 1; }
    .banner-box-title { font-size: 1.1em; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: text; }
    .banner-box-subtitle { font-size: 0.85em; opacity: 0.9; margin-top: 3px; cursor: text; }
    
    .important-box {
        margin: 20px 0;
        background: #fef3c7;
        border: 2px solid #f59e0b;
        border-left: 6px solid #f59e0b;
        border-radius: 10px;
        padding: 15px 20px;
        padding-right: 110px;
        position: relative;
    }
    
    .important-box.info { background: #dbeafe; border-color: #3b82f6; }
    .important-box.success { background: #dcfce7; border-color: #22c55e; }
    .important-box.danger { background: #fee2e2; border-color: #ef4444; }
    
    .important-box-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .important-box-icon { font-size: 1.3em; }
    .important-box-label { font-weight: 800; text-transform: uppercase; font-size: 0.85em; letter-spacing: 0.5px; color: #92400e; cursor: text; }
    .important-box.info .important-box-label { color: #1e40af; }
    .important-box.success .important-box-label { color: #166534; }
    .important-box.danger .important-box-label { color: #991b1b; }
    .important-box-content { font-size: 0.95em; line-height: 1.6; color: #1f2937; cursor: text; }
    
    .important-type-selector {
        position: absolute;
        top: 10px;
        right: 115px;
        font-size: 0.75em;
        padding: 3px 6px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        cursor: pointer;
    }
    
    /* ========== VRAI / FAUX ========== */
    
    .vf-container {
        margin-top: 10px;
    }
    
    .vf-options-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-radius: 8px;
        margin-bottom: 10px;
        flex-wrap: wrap;
    }
    
    .vf-options-bar label {
        font-size: 0.85em;
        font-weight: 600;
        color: #0369a1;
    }
    
    .vf-options-bar input[type="text"] {
        padding: 5px 10px;
        border: 1px solid #7dd3fc;
        border-radius: 5px;
        font-size: 0.85em;
        width: 100px;
    }
    
    .vf-options-bar button {
        padding: 6px 12px;
        border: 1px solid #0ea5e9;
        background: white;
        color: #0284c7;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8em;
        font-weight: 600;
    }
    
    .vf-options-bar button:hover {
        background: #0ea5e9;
        color: white;
    }
    
    .vf-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 15px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #3b82f6;
        border-radius: 8px;
        margin-bottom: 10px;
        position: relative;
    }
    
    .vf-item:nth-child(even) {
        border-left-color: #8b5cf6;
    }
    
    .vf-item-number {
        background: #3b82f6;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.85em;
        flex-shrink: 0;
    }
    
    .vf-item:nth-child(even) .vf-item-number {
        background: #8b5cf6;
    }
    
    .vf-item-content {
        flex: 1;
    }
    
    .vf-item-text {
        font-size: 0.95em;
        margin-bottom: 10px;
        cursor: text;
        min-height: 20px;
    }
    
    .vf-item-choices {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }
    
    .vf-choice {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 25px;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 600;
        font-size: 0.9em;
    }
    
    .vf-choice:hover {
        border-color: #3b82f6;
        background: #eff6ff;
    }
    
    .vf-choice.selected-true {
        border-color: #22c55e;
        background: #dcfce7;
        color: #166534;
    }
    
    .vf-choice.selected-false {
        border-color: #ef4444;
        background: #fee2e2;
        color: #991b1b;
    }
    
    .vf-choice input[type="radio"] {
        margin: 0;
        cursor: pointer;
    }
    
    .vf-item-justification {
        margin-top: 10px;
    }
    
    .vf-item-justification textarea {
        width: 100%;
        min-height: 50px;
        padding: 8px 12px;
        border: 1px dashed #94a3b8;
        border-radius: 6px;
        font-family: inherit;
        font-size: 0.9em;
        resize: vertical;
        box-sizing: border-box;
    }
    
    .vf-item-justification textarea::placeholder {
        color: #94a3b8;
    }
    
    .vf-item-delete {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #fee2e2;
        border: 1px solid #fca5a5;
        color: #dc2626;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.8em;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .vf-item-delete:hover {
        background: #dc2626;
        color: white;
    }
    
    /* Mode élève */
    body.student-view .vf-options-bar,
    body.student-view .vf-item-delete {
        display: none !important;
    }
    
    body.student-view .vf-item-text {
        cursor: default;
    }
    
    /* ========== ZONE ARTICLE ========== */
    .article-block {
        margin-bottom: 20px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-left: 5px solid #6366f1;
        border-radius: 8px;
        position: relative;
        padding: 0;
    }
    
    .article-header {
        background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
        padding: 12px 15px;
        padding-right: 110px;
        border-bottom: 1px solid #c7d2fe;
    }
    
    .article-source { font-size: 0.85em; color: #4f46e5; font-style: italic; cursor: text; padding: 2px 5px; }
    .article-content { padding: 20px; font-size: 1em; line-height: 1.8; text-align: justify; color: #1f2937; cursor: text; min-height: 100px; }
    .article-content:hover { background: #fafafa; }
    
    /* ========== TABLEAU FLEXIBLE ========== */
    .flex-table-container {
        padding: 15px;
        overflow-x: auto;
        background: #f8fafc;
        border-radius: 8px;
        margin-top: 10px;
    }
    
    .flex-table-controls {
        display: flex;
        gap: 6px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 10px;
        padding: 10px;
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        border-radius: 8px;
    }
    
    .flex-table-btn {
        padding: 6px 10px;
        border: 1px solid #10b981;
        background: white;
        color: #059669;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8em;
        font-weight: 600;
        transition: all 0.2s;
    }
    
    .flex-table-btn:hover { background: #10b981; color: white; }
    .flex-table-btn.danger { border-color: #ef4444; color: #dc2626; }
    .flex-table-btn.danger:hover { background: #ef4444; color: white; }
    
    table.flex-table { width: 100%; border-collapse: collapse; font-size: 0.95em; }
    table.flex-table th, table.flex-table td { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; position: relative; min-width: 80px; }
    table.flex-table th { background: #f3f4f6; font-weight: 700; }
    
    .cell-prof { background: #fefce8; }
    .cell-prof-content { min-height: 30px; cursor: text; }
    .cell-eleve { background: #f0fdf4; }
    .cell-eleve textarea { width: 100%; min-height: 40px; border: 1px dashed #86efac; background: white; padding: 6px; border-radius: 4px; resize: vertical; font-family: inherit; font-size: inherit; box-sizing: border-box; }
    .cell-image { background: #eff6ff; text-align: center; }
    .cell-image img { max-width: 100%; max-height: 120px; border-radius: 4px; cursor: pointer; }
    .cell-image-placeholder { padding: 15px 10px; color: #64748b; font-size: 0.8em; cursor: pointer; }
    .cell-image-placeholder:hover { background: #dbeafe; }
    .cell-type-selector { position: absolute; top: 2px; right: 2px; font-size: 0.65em; padding: 1px 3px; border: 1px solid #d1d5db; border-radius: 3px; background: white; cursor: pointer; z-index: 10; }
    
    /* Mode élève */
    body.student-view .cell-type-selector,
    body.student-view .flex-table-controls,
    body.student-view .important-type-selector {
        display: none !important;
    }
    
    /* Responsive */
    @media (max-width: 720px) {
        .flex-table-container { padding: 10px; }
        table.flex-table th, table.flex-table td { padding: 6px; font-size: 0.85em; min-width: 60px; }
        .flex-table-controls { justify-content: center; }
        .theme-box, .banner-box, .important-box, .separator-titled { padding-right: 60px; }
        .important-type-selector { right: 65px; }
        .vf-item { flex-direction: column; }
        .vf-item-number { align-self: flex-start; }
    }
    
    /* Impression */
    @media print {
        .cell-type-selector, .flex-table-controls, .flex-table-btn, .important-type-selector, .vf-options-bar, .vf-item-delete { display: none !important; }
        .cell-eleve textarea { border: 1px solid #ccc; background: white; }
        .article-block, .theme-box, .banner-box, .important-box { break-inside: avoid; }
        .theme-box, .banner-box { color: black !important; background: #f3f4f6 !important; box-shadow: none; }
    }
    
    /* ========== BLOC TEXTE + IMAGE ========== */
    .text-image-block {
        margin-bottom: 20px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-left: 5px solid #10b981;
        border-radius: 8px;
        position: relative;
        padding: 20px;
        padding-right: 110px;
    }
    
    .text-image-container {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }
    
    .text-image-content {
        flex: 1;
        min-width: 0;
    }
    
    .text-image-title {
        font-size: 1.1em;
        font-weight: 700;
        color: #065f46;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid #d1fae5;
        cursor: text;
    }
    
    .text-image-title:empty::before {
        content: "Titre (optionnel)...";
        color: #9ca3af;
        font-style: italic;
    }
    
    .text-image-text {
        font-size: 1em;
        line-height: 1.7;
        text-align: justify;
        color: #1f2937;
        cursor: text;
        min-height: 60px;
    }
    
    .text-image-text:empty::before {
        content: "Écrivez votre texte ici...";
        color: #9ca3af;
        font-style: italic;
    }
    
    .text-image-side {
        flex-shrink: 0;
        width: 180px;
        text-align: center;
    }
    
    .text-image-img-container {
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        padding: 10px;
        background: #f9fafb;
        cursor: pointer;
        transition: all 0.2s;
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .text-image-img-container:hover {
        border-color: #10b981;
        background: #ecfdf5;
    }
    
    .text-image-img-container img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .text-image-placeholder {
        color: #6b7280;
        font-size: 0.85em;
        text-align: center;
    }
    
    .text-image-placeholder-icon {
        font-size: 2em;
        margin-bottom: 5px;
        display: block;
    }
    
    /* Options de style texte+image */
    .text-image-options {
        position: absolute;
        top: 8px;
        right: 115px;
        display: flex;
        gap: 5px;
    }
    
    .text-image-options select {
        font-size: 0.7em;
        padding: 2px 5px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        cursor: pointer;
    }
    
    /* Mode élève */
    body.student-view .text-image-options {
        display: none !important;
    }
    
    body.student-view .text-image-title,
    body.student-view .text-image-text {
        cursor: default;
    }
    
    body.student-view .text-image-img-container {
        cursor: default;
        border-style: solid;
    }
    
    /* Responsive */
    @media (max-width: 720px) {
        .text-image-container {
            flex-direction: column;
        }
        .text-image-side {
            width: 100%;
            max-width: 250px;
            margin: 0 auto;
        }
        .text-image-block {
            padding-right: 60px;
        }
        .text-image-options {
            right: 65px;
        }
    }
    
    @media print {
        .text-image-options { display: none !important; }
        .text-image-img-container { border-style: solid; border-color: #d1d5db; }
    }
    
    /* ========== DOCUMENT ENRICHI (Option D) ========== */
    .doc-enriched {
        margin-bottom: 20px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
    }
    
    .doc-enriched-header {
        padding: 12px 20px;
        padding-right: 180px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }
    
    /* Couleurs de bandeau */
    .doc-enriched.color-green .doc-enriched-header { background: linear-gradient(135deg, #27ae60, #2ecc71); }
    .doc-enriched.color-green { border-left: 5px solid #27ae60; }
    
    .doc-enriched.color-blue .doc-enriched-header { background: linear-gradient(135deg, #2980b9, #3498db); }
    .doc-enriched.color-blue { border-left: 5px solid #2980b9; }
    
    .doc-enriched.color-purple .doc-enriched-header { background: linear-gradient(135deg, #8e44ad, #9b59b6); }
    .doc-enriched.color-purple { border-left: 5px solid #8e44ad; }
    
    .doc-enriched.color-red .doc-enriched-header { background: linear-gradient(135deg, #c0392b, #e74c3c); }
    .doc-enriched.color-red { border-left: 5px solid #c0392b; }
    
    .doc-enriched.color-orange .doc-enriched-header { background: linear-gradient(135deg, #d35400, #e67e22); }
    .doc-enriched.color-orange { border-left: 5px solid #d35400; }
    
    .doc-enriched.color-dark .doc-enriched-header { background: linear-gradient(135deg, #2c3e50, #34495e); }
    .doc-enriched.color-dark { border-left: 5px solid #2c3e50; }
    
    .doc-enriched-title {
        font-weight: 700;
        font-size: 1.1em;
        color: white;
        cursor: text;
        flex: 1;
    }
    
    .doc-enriched-badge {
        background: rgba(255,255,255,0.3);
        padding: 3px 12px;
        border-radius: 12px;
        font-size: 0.8em;
        color: white;
        cursor: text;
        white-space: nowrap;
    }
    
    .doc-enriched-body {
        display: flex;
        padding: 15px 20px;
        gap: 20px;
        align-items: flex-start;
    }
    
    .doc-enriched-text {
        flex: 1;
        font-size: 0.95em;
        line-height: 1.7;
        color: #333;
        text-align: justify !important;
        cursor: text;
        min-height: 60px;
        hyphens: auto;
        -webkit-hyphens: auto;
    }
    
    .doc-enriched-image {
        width: 140px;
        flex-shrink: 0;
    }
    
    /* Image masquée */
    .doc-enriched.no-image .doc-enriched-image {
        display: none;
    }
    
    .doc-enriched.no-image .doc-enriched-text {
        flex: 1;
        max-width: 100%;
    }
    
    /* Bouton toggle image */
    .doc-enriched-toggle-image {
        position: absolute;
        top: 8px;
        right: 185px;
        font-size: 0.7em;
        padding: 2px 8px;
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 4px;
        background: rgba(255,255,255,0.2);
        color: white;
        cursor: pointer;
    }
    
    .doc-enriched-toggle-image:hover {
        background: rgba(255,255,255,0.4);
    }
    
    .doc-enriched-image img {
        width: 100%;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        cursor: pointer;
    }
    
    .doc-enriched-image-placeholder {
        width: 100%;
        height: 100px;
        background: #f8f9fa;
        border: 2px dashed #ccc;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 0.8em;
        color: #888;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .doc-enriched-image-placeholder:hover {
        border-color: #27ae60;
        background: #f0fff4;
        color: #27ae60;
    }
    
    .doc-enriched-image-placeholder-icon {
        font-size: 2em;
        margin-bottom: 5px;
    }
    
    /* Sélecteur de couleur */
    .doc-enriched-color-selector {
        position: absolute;
        top: 8px;
        right: 115px;
        font-size: 0.7em;
        padding: 2px 5px;
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 4px;
        background: rgba(255,255,255,0.2);
        color: white;
        cursor: pointer;
    }
    
    .doc-enriched-color-selector option {
        color: #333;
    }
    
    /* Mode élève */
    body.student-view .doc-enriched-color-selector,
    body.student-view .doc-enriched-toggle-image {
        display: none !important;
    }
    
    body.student-view .doc-enriched-title,
    body.student-view .doc-enriched-badge,
    body.student-view .doc-enriched-text {
        cursor: default;
    }
    
    body.student-view .doc-enriched-image-placeholder {
        cursor: default;
    }
    
    /* Responsive */
    @media (max-width: 600px) {
        .doc-enriched-header {
            padding-right: 70px;
        }
        .doc-enriched-body {
            flex-direction: column;
        }
        .doc-enriched-text {
            text-align: justify !important;
        }
        .doc-enriched-image {
            width: 100%;
            max-width: 200px;
            margin: 0 auto;
        }
        .doc-enriched-color-selector {
            right: 65px;
            font-size: 0.65em;
        }
        .doc-enriched-toggle-image {
            position: static;
            display: block;
            margin: 5px auto 0 auto;
            background: rgba(0,0,0,0.1);
            color: #333;
            border-color: #ccc;
        }
    }
    
    @media print {
        .doc-enriched-color-selector { display: none !important; }
        .doc-enriched { break-inside: avoid; }
        .doc-enriched-header { color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }

    /* ========== PAD SIMPLIFIÉ (sans événement déclencheur) ========== */
    .pad2-wrap {
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 16px;
        background: #1e293b;
        color: #fff;
    }
    
    .pad2-row-top {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        max-width: 400px;
        margin: 0 auto;
    }
    
    .pad2-row-middle {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 8px;
        align-items: center;
        margin: 16px 0;
    }
    
    .pad2-row-bottom {
        margin-top: 16px;
    }
    
    .pad2-box {
        border-radius: 12px;
        padding: 12px;
        position: relative;
    }
    
    .pad2-box-title {
        font-weight: 900;
        text-transform: uppercase;
        font-size: 13px;
        margin-bottom: 8px;
        text-align: center;
        letter-spacing: 0.5px;
    }
    
    .pad2-box textarea.reponse-eleve {
        width: 100%;
        min-height: 60px;
        resize: vertical;
        border: none;
        border-radius: 8px;
        padding: 10px;
        font-size: 14px;
        box-sizing: border-box;
    }
    
    .pad2-situation {
        background: #e57373;
        color: #fff;
    }
    
    .pad2-situation textarea {
        background: #ef9a9a;
        color: #000;
    }
    
    .pad2-danger {
        background: #fff176;
        color: #000;
        border-radius: 50%;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .pad2-danger textarea {
        background: #fff9c4;
        color: #000;
        border-radius: 8px;
    }
    
    .pad2-operateur {
        background: #81d4fa;
        color: #000;
        border-radius: 50%;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .pad2-operateur textarea {
        background: #b3e5fc;
        color: #000;
        border-radius: 8px;
    }
    
    .pad2-interaction {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 48px;
        color: #ffc107;
        text-shadow: 0 0 10px rgba(255,193,7,0.5);
    }
    
    .pad2-dommage {
        background: #81c784;
        color: #000;
    }
    
    .pad2-dommage textarea {
        background: #c8e6c9;
        color: #000;
    }
    
    .pad2-arrow {
        display: flex;
        justify-content: center;
        align-items: center;
        color: #90a4ae;
        font-size: 24px;
    }
    
    /* Responsive PAD2 */
    @media (max-width: 720px) {
        .pad2-row-top,
        .pad2-row-middle {
            grid-template-columns: 1fr;
        }
        .pad2-danger,
        .pad2-operateur {
            border-radius: 12px;
            min-height: auto;
        }
        .pad2-interaction {
            margin: 12px 0;
        }
    }
    `;
    document.head.appendChild(style);
})();

// ============================================
// 1️⃣ TRAIT SIMPLE
// ============================================
window.addSeparatorLine = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'text-block';
    div.style.cssText = 'padding:0; border:none; background:transparent;';
    div.innerHTML = `${getControlButtonsHTMLSimple()}<hr class="separator-line">`;
    container.appendChild(div);
};

// ============================================
// 2️⃣ SÉPARATEUR AVEC TITRE
// ============================================
window.addSeparatorTitled = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'text-block separator-titled';
    div.style.cssText = 'border:none; background:transparent;';
    div.innerHTML = `${getControlButtonsHTMLSimple()}<span class="separator-titled-text" contenteditable="true">PARTIE 2</span>`;
    container.appendChild(div);
};

// ============================================
// 3️⃣ ENCADRÉ THÈME
// ============================================
window.addThemeBox = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'text-block theme-box';
    div.innerHTML = `${getControlButtonsHTMLSimple()}<span class="theme-box-icon">📚</span><div><div class="theme-box-title" contenteditable="true">THÈME 2 : LES RISQUES PROFESSIONNELS</div><div class="theme-box-subtitle" contenteditable="true">Identifier les dangers et analyser les situations à risque</div></div>`;
    container.appendChild(div);
};

// ============================================
// 4️⃣ BANNIÈRE COLORÉE
// ============================================
window.addBannerBox = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'text-block banner-box';
    div.innerHTML = `${getControlButtonsHTMLSimple()}<span class="banner-box-icon">🔶</span><div class="banner-box-content"><div class="banner-box-title" contenteditable="true">PARTIE B : ANALYSE DE LA SITUATION</div><div class="banner-box-subtitle" contenteditable="true">À partir des documents, répondez aux questions suivantes</div></div>`;
    container.appendChild(div);
};

// ============================================
// 5️⃣ ENCADRÉ IMPORTANT
// ============================================
window.addImportantBox = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'text-block important-box';
    div.innerHTML = `${getControlButtonsHTMLSimple()}<select class="important-type-selector" onchange="changeImportantType(this)"><option value="warning" selected>⚠️ Attention</option><option value="info">ℹ️ Info</option><option value="success">✅ À retenir</option><option value="danger">🚨 Danger</option></select><div class="important-box-header"><span class="important-box-icon">⚠️</span><span class="important-box-label" contenteditable="true">IMPORTANT</span></div><div class="important-box-content" contenteditable="true">Écrivez ici un texte important que l'élève doit retenir.</div>`;
    container.appendChild(div);
};

window.changeImportantType = function(select) {
    const box = select.closest('.important-box');
    const icon = box.querySelector('.important-box-icon');
    box.classList.remove('info', 'success', 'danger');
    switch(select.value) {
        case 'info': box.classList.add('info'); icon.textContent = 'ℹ️'; break;
        case 'success': box.classList.add('success'); icon.textContent = '✅'; break;
        case 'danger': box.classList.add('danger'); icon.textContent = '🚨'; break;
        default: icon.textContent = '⚠️';
    }
};

// ============================================
// 6️⃣ VRAI / FAUX FLEXIBLE
// ============================================
window.addVraiFaux = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'question-block';
    
    const uniqueId = 'vf_' + Date.now();
    
    div.innerHTML = `
        ${getControlButtonsHTML()}
        <div class="q-meta-bar">
            <div class="points-wrapper">
                <input type="number" class="student-score" value="" min="0" step="0.5" placeholder="Note" oninput="updateGrid()">
                <span class="teacher-part">/</span> 
                <input type="number" class="point-input" value="3" step="0.5" oninput="updateGrid()"> 
                <span class="teacher-part">pts (</span>
                <select class="comp-selector" data-selected="C2" onchange="updateGrid()"></select>
                <span class="teacher-part">)</span>
                <span class="print-only-grade"></span>
            </div>
        </div>
        <div class="q-content-row">
            <div class="num-selector-wrapper"><select class="num-selector"></select></div>
            <div class="editable-text" contenteditable="true">Indiquer si les affirmations suivantes sont vraies ou fausses.</div>
        </div>
        <div class="exo-container">
            <div class="vf-container" data-vf-id="${uniqueId}">
                <div class="vf-options-bar teacher-controls">
                    <label>Option 1:</label>
                    <input type="text" class="vf-label-1" value="Vrai" onchange="vfUpdateLabels(this)">
                    <label>Option 2:</label>
                    <input type="text" class="vf-label-2" value="Faux" onchange="vfUpdateLabels(this)">
                    <label style="margin-left:15px;"><input type="checkbox" class="vf-show-justif" onchange="vfToggleJustif(this)"> Justification</label>
                    <button type="button" onclick="vfAddItem(this)">+ Affirmation</button>
                </div>
                <div class="vf-items">
                    <!-- Items ajoutés ici -->
                </div>
            </div>
        </div>
        <div class="answer-key-zone">
            <div class="answer-key-header">
                <span class="answer-key-label">🟠 Éléments de réponse (Corrigé — réservé au prof)</span>
            </div>
            <textarea class="answer-key-area" placeholder="✅ Réponses attendues : 1. Vrai, 2. Faux..."></textarea>
        </div>
    `;
    
    container.appendChild(div);
    if (typeof initSelects === 'function') initSelects(div, true);
    if (typeof updateGrid === 'function') updateGrid();
    
    // Ajouter 2 items par défaut
    const vfContainer = div.querySelector('.vf-container');
    vfAddItemToContainer(vfContainer, "Le port des EPI est obligatoire sur un chantier.");
    vfAddItemToContainer(vfContainer, "Un salarié peut refuser une formation sécurité.");
};

// Ajouter une affirmation
window.vfAddItem = function(btn) {
    const vfContainer = btn.closest('.vf-container');
    vfAddItemToContainer(vfContainer, "Nouvelle affirmation à compléter...");
};

function vfAddItemToContainer(vfContainer, text) {
    const itemsContainer = vfContainer.querySelector('.vf-items');
    const itemCount = itemsContainer.querySelectorAll('.vf-item').length + 1;
    const uniqueId = vfContainer.dataset.vfId;
    const itemName = uniqueId + '_' + itemCount;
    
    const label1 = vfContainer.querySelector('.vf-label-1')?.value || 'Vrai';
    const label2 = vfContainer.querySelector('.vf-label-2')?.value || 'Faux';
    const showJustif = vfContainer.querySelector('.vf-show-justif')?.checked || false;
    
    const item = document.createElement('div');
    item.className = 'vf-item';
    item.innerHTML = `
        <button type="button" class="vf-item-delete teacher-controls" onclick="vfDeleteItem(this)">✕</button>
        <div class="vf-item-number">${itemCount}</div>
        <div class="vf-item-content">
            <div class="vf-item-text" contenteditable="true">${text}</div>
            <div class="vf-item-choices">
                <label class="vf-choice" onclick="vfSelectChoice(this, 'vrai')">
                    <input type="radio" name="${itemName}" value="vrai" class="reponse-eleve">
                    <span class="vf-choice-label">${label1}</span>
                </label>
                <label class="vf-choice" onclick="vfSelectChoice(this, 'faux')">
                    <input type="radio" name="${itemName}" value="faux" class="reponse-eleve">
                    <span class="vf-choice-label">${label2}</span>
                </label>
            </div>
            <div class="vf-item-justification" style="display:${showJustif ? 'block' : 'none'};">
                <textarea class="reponse-eleve" placeholder="Justifiez votre réponse..."></textarea>
            </div>
        </div>
    `;
    
    itemsContainer.appendChild(item);
    vfRenumberItems(vfContainer);
}

// Supprimer une affirmation
window.vfDeleteItem = function(btn) {
    const item = btn.closest('.vf-item');
    const vfContainer = btn.closest('.vf-container');
    const itemsContainer = vfContainer.querySelector('.vf-items');
    
    if (itemsContainer.querySelectorAll('.vf-item').length > 1) {
        item.remove();
        vfRenumberItems(vfContainer);
    } else {
        alert("⚠️ Il faut garder au moins 1 affirmation !");
    }
};

// Renuméroter les items
function vfRenumberItems(vfContainer) {
    const items = vfContainer.querySelectorAll('.vf-item');
    const uniqueId = vfContainer.dataset.vfId;
    
    items.forEach((item, index) => {
        const num = index + 1;
        item.querySelector('.vf-item-number').textContent = num;
        const radios = item.querySelectorAll('input[type="radio"]');
        const newName = uniqueId + '_' + num;
        radios.forEach(r => r.name = newName);
    });
}

// Sélectionner un choix (visuel)
window.vfSelectChoice = function(label, value) {
    const choices = label.closest('.vf-item-choices').querySelectorAll('.vf-choice');
    choices.forEach(c => c.classList.remove('selected-true', 'selected-false', 'selected-vrai', 'selected-faux'));
    label.classList.add(value === 'vrai' ? 'selected-vrai' : 'selected-faux');
};

// Mettre à jour les labels
window.vfUpdateLabels = function(input) {
    const vfContainer = input.closest('.vf-container');
    const label1 = vfContainer.querySelector('.vf-label-1').value;
    const label2 = vfContainer.querySelector('.vf-label-2').value;
    
    vfContainer.querySelectorAll('.vf-item').forEach(item => {
        const labels = item.querySelectorAll('.vf-choice-label');
        if (labels[0]) labels[0].textContent = label1;
        if (labels[1]) labels[1].textContent = label2;
    });
};

// Activer/désactiver la justification
window.vfToggleJustif = function(checkbox) {
    const vfContainer = checkbox.closest('.vf-container');
    const show = checkbox.checked;
    
    vfContainer.querySelectorAll('.vf-item-justification').forEach(div => {
        div.style.display = show ? 'block' : 'none';
    });
};

// ============================================
// 📰 BLOC ARTICLE
// ============================================
window.addArticleBlock = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'article-block';
    div.innerHTML = `${getControlButtonsHTMLSimple()}<div class="article-header"><span class="article-source" contenteditable="true">📰 Source : Le Monde, 15 janvier 2026</span></div><div class="article-content" contenteditable="true"><p><strong>Titre de l'article</strong></p><p>Collez ou écrivez ici le contenu de votre article...</p></div>`;
    container.appendChild(div);
};

// ============================================
// 📄 DOCUMENT ENRICHI (Option D)
// ============================================
window.addDocEnrichi = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'text-block doc-enriched color-green';
    div.innerHTML = `
        ${getControlButtonsHTMLSimple()}
        <button class="doc-enriched-toggle-image teacher-controls" onclick="docEnrichiToggleImage(this)">🖼️ Masquer image</button>
        <select class="doc-enriched-color-selector teacher-controls" onchange="docEnrichiChangeColor(this)">
            <option value="green" selected>🟢 Vert</option>
            <option value="blue">🔵 Bleu</option>
            <option value="purple">🟣 Violet</option>
            <option value="red">🔴 Rouge</option>
            <option value="orange">🟠 Orange</option>
            <option value="dark">⚫ Sombre</option>
        </select>
        <div class="doc-enriched-header">
            <span class="doc-enriched-title" contenteditable="true">📄 Document 1 : Titre du document</span>
            <span class="doc-enriched-badge" contenteditable="true">Contexte</span>
        </div>
        <div class="doc-enriched-body">
            <div class="doc-enriched-text" contenteditable="true">Écrivez ici votre texte descriptif, le contexte de la situation, ou toute information importante. Vous pouvez utiliser la barre d'outils pour mettre en forme (gras, couleur, taille...).</div>
            <div class="doc-enriched-image">
                <div class="doc-enriched-image-placeholder" onclick="docEnrichiUploadImage(this)">
                    <span class="doc-enriched-image-placeholder-icon">🖼️</span>
                    <span>Ajouter image</span>
                </div>
            </div>
        </div>
    `;
    container.appendChild(div);
};

// Afficher/Masquer l'image
window.docEnrichiToggleImage = function(btn) {
    const block = btn.closest('.doc-enriched');
    const hasImage = !block.classList.contains('no-image');
    
    if (hasImage) {
        block.classList.add('no-image');
        btn.textContent = '🖼️ Afficher image';
    } else {
        block.classList.remove('no-image');
        btn.textContent = '🖼️ Masquer image';
    }
};

// Changer la couleur du bandeau
window.docEnrichiChangeColor = function(select) {
    const block = select.closest('.doc-enriched');
    // Retirer toutes les classes de couleur
    block.classList.remove('color-green', 'color-blue', 'color-purple', 'color-red', 'color-orange', 'color-dark');
    // Ajouter la nouvelle
    block.classList.add('color-' + select.value);
};

// Ajouter une image
window.docEnrichiUploadImage = function(placeholder) {
    const nom = prompt("Nom du fichier image (ex: situation.jpg) ?\n\nL'image devra être dans le dossier 'images' à côté du fichier.", "");
    if (nom && nom.trim()) {
        const imageContainer = placeholder.parentElement;
        imageContainer.innerHTML = `<img src="images/${nom.trim()}" alt="${nom.trim()}" onclick="docEnrichiUploadImage(this.parentElement)">`;
    }
};

// ============================================
// 🖼️ BLOC TEXTE + IMAGE
// ============================================
window.addTextImage = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'text-block text-image-block';
    div.innerHTML = `
        ${getControlButtonsHTMLSimple()}
        <div class="text-image-options teacher-controls">
            <select onchange="textImageChangePosition(this)">
                <option value="right" selected>Image à droite</option>
                <option value="left">Image à gauche</option>
            </select>
        </div>
        <div class="text-image-container">
            <div class="text-image-content">
                <div class="text-image-title" contenteditable="true"></div>
                <div class="text-image-text" contenteditable="true">Écrivez ici votre texte explicatif ou descriptif. L'image à côté illustrera votre propos.</div>
            </div>
            <div class="text-image-side">
                <div class="text-image-img-container" onclick="textImageUpload(this)">
                    <div class="text-image-placeholder">
                        <span class="text-image-placeholder-icon">🖼️</span>
                        <span>Cliquez pour<br>ajouter une image</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(div);
};

// Changer la position de l'image (gauche/droite)
window.textImageChangePosition = function(select) {
    const block = select.closest('.text-image-block');
    const container = block.querySelector('.text-image-container');
    const content = block.querySelector('.text-image-content');
    const side = block.querySelector('.text-image-side');
    
    if (select.value === 'left') {
        container.insertBefore(side, content);
    } else {
        container.appendChild(side);
    }
};

// Ajouter une image
window.textImageUpload = function(imgContainer) {
    const nom = prompt("Nom du fichier image (ex: illustration.jpg) ?\n\nL'image devra être dans le dossier 'images' à côté du fichier.", "");
    if (nom && nom.trim()) {
        imgContainer.innerHTML = `<img src="images/${nom.trim()}" alt="${nom.trim()}" onclick="textImageUpload(this.parentElement)">`;
    }
};

// ============================================
// 🔄 PAD 2 (SIMPLIFIÉ - Sans événement déclencheur)
// ============================================
window.addPAD2 = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `
        ${getControlButtonsHTML()}
        <div class="q-meta-bar">
            <div class="points-wrapper">
                <input type="number" class="student-score" value="" min="0" step="0.5" placeholder="Note" oninput="updateGrid()">
                <span class="teacher-part">/</span> 
                <input type="number" class="point-input" value="3" step="0.5" oninput="updateGrid()"> 
                <span class="teacher-part">pts (</span>
                <select class="comp-selector" data-selected="C2" onchange="updateGrid()"></select>
                <span class="teacher-part">)</span>
                <span class="print-only-grade"></span>
            </div>
        </div>
        <div class="q-content-row">
            <div class="num-selector-wrapper"><select class="num-selector"></select></div>
            <div class="editable-text" contenteditable="true">Compléter le schéma simplifié du Processus d'Apparition du Dommage.</div>
        </div>
        <div class="exo-container">
            <div class="pad2-wrap">
                <!-- Ligne du haut : Situation dangereuse uniquement (centrée) -->
                <div class="pad2-row-top">
                    <div class="pad2-box pad2-situation">
                        <div class="pad2-box-title">Situation dangereuse</div>
                        <textarea class="reponse-eleve" placeholder="Décrire la situation dangereuse..."></textarea>
                    </div>
                </div>
                
                <!-- Flèche vers le bas -->
                <div style="display:flex; justify-content:center; margin:8px 0;">
                    <div class="pad2-arrow">↓</div>
                </div>
                
                <!-- Ligne du milieu : Danger + Interaction + Opérateur -->
                <div class="pad2-row-middle">
                    <div class="pad2-box pad2-danger">
                        <div class="pad2-box-title">Danger</div>
                        <textarea class="reponse-eleve" placeholder="Identifier le danger..." style="width:90%;min-height:50px;"></textarea>
                    </div>
                    <div class="pad2-interaction">⚡</div>
                    <div class="pad2-box pad2-operateur">
                        <div class="pad2-box-title">Opérateur</div>
                        <textarea class="reponse-eleve" placeholder="Qui est exposé ?" style="width:90%;min-height:50px;"></textarea>
                    </div>
                </div>
                
                <!-- Flèche vers le bas -->
                <div style="display:flex; justify-content:center; margin:8px 0;">
                    <div class="pad2-arrow" style="color:#ef5350;font-size:32px;">↓</div>
                </div>
                
                <!-- Ligne du bas : Dommage potentiel -->
                <div class="pad2-row-bottom">
                    <div class="pad2-box pad2-dommage">
                        <div class="pad2-box-title">Dommage potentiel</div>
                        <textarea class="reponse-eleve" placeholder="Quelle blessure ou atteinte à la santé peut survenir ?"></textarea>
                    </div>
                </div>
            </div>
        </div>
        <div class="answer-key-zone">
            <div class="answer-key-header">
                <span class="answer-key-label">🟠 Éléments de réponse (Corrigé — réservé au prof)</span>
            </div>
            <textarea class="answer-key-area" placeholder="✅ Ce qui est attendu pour chaque champ du PAD simplifié..."></textarea>
        </div>
    `;
    container.appendChild(div);
    if (typeof initSelects === 'function') initSelects(div, true);
    if (typeof updateGrid === 'function') updateGrid();
    // Auto-resize textareas
    div.querySelectorAll('textarea').forEach(tx => {
        tx.addEventListener('input', function(){ 
            this.style.height='auto'; 
            this.style.height=this.scrollHeight+'px'; 
        });
    });
};

// ============================================
// 📊 TABLEAU FLEXIBLE
// ============================================
function getTypeSelectorHTML(selectedType) {
    return `<select class="cell-type-selector" onchange="ftChangeType(this)"><option value="prof" ${selectedType === 'prof' ? 'selected' : ''}>📝 Prof</option><option value="eleve" ${selectedType === 'eleve' ? 'selected' : ''}>✏️ Élève</option><option value="image" ${selectedType === 'image' ? 'selected' : ''}>🖼️ Image</option></select>`;
}

window.addFlexTable = function(btn) {
    const container = document.querySelector('.questions-container');
    const div = document.createElement('div');
    div.className = 'question-block';
    
    div.innerHTML = `
        ${getControlButtonsHTML()}
        <div class="q-meta-bar">
            <div class="points-wrapper">
                <input type="number" class="student-score" value="" min="0" step="0.5" placeholder="Note" oninput="updateGrid()">
                <span class="teacher-part">/</span> 
                <input type="number" class="point-input" value="2" step="0.5" oninput="updateGrid()"> 
                <span class="teacher-part">pts (</span>
                <select class="comp-selector" data-selected="C2" onchange="updateGrid()"></select>
                <span class="teacher-part">)</span>
                <span class="print-only-grade"></span>
            </div>
        </div>
        <div class="q-content-row">
            <div class="num-selector-wrapper"><select class="num-selector"></select></div>
            <div class="editable-text" contenteditable="true">Compléter le tableau ci-dessous.</div>
        </div>
        <div class="exo-container">
            <div class="flex-table-controls teacher-controls">
                <button type="button" class="flex-table-btn" onclick="ftAddColumn(this)">+ Col</button>
                <button type="button" class="flex-table-btn danger" onclick="ftRemoveColumn(this)">− Col</button>
                <button type="button" class="flex-table-btn" onclick="ftAddRow(this)">+ Ligne</button>
                <button type="button" class="flex-table-btn danger" onclick="ftRemoveRow(this)">− Ligne</button>
            </div>
            <div class="flex-table-container">
                <table class="flex-table">
                    <thead><tr>
                        <th class="cell-prof">${getTypeSelectorHTML('prof')}<div class="cell-prof-content" contenteditable="true">En-tête 1</div></th>
                        <th class="cell-prof">${getTypeSelectorHTML('prof')}<div class="cell-prof-content" contenteditable="true">En-tête 2</div></th>
                    </tr></thead>
                    <tbody><tr>
                        <td class="cell-prof">${getTypeSelectorHTML('prof')}<div class="cell-prof-content" contenteditable="true">Texte prof...</div></td>
                        <td class="cell-eleve">${getTypeSelectorHTML('eleve')}<textarea class="reponse-eleve" placeholder="Réponse élève..."></textarea></td>
                    </tr></tbody>
                </table>
            </div>
        </div>
        <div class="answer-key-zone">
            <div class="answer-key-header"><span class="answer-key-label">🟠 Éléments de réponse (Corrigé — réservé au prof)</span></div>
            <textarea class="answer-key-area" placeholder="✅ Ce qui est attendu..."></textarea>
        </div>
    `;
    
    container.appendChild(div);
    if (typeof attachBlockEvents === 'function') attachBlockEvents(div); // ← CORRECTION BUG
    if (typeof initSelects === 'function') initSelects(div, true);
    if (typeof updateGrid === 'function') updateGrid();
    ftInitTextareas(div);
};

function ftInitTextareas(scope) {
    (scope || document).querySelectorAll('.flex-table textarea').forEach(tx => {
        tx.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = this.scrollHeight + 'px'; });
    });
}

window.ftChangeType = function(select) {
    const cell = select.closest('td') || select.closest('th');
    if (!cell) return;
    const type = select.value;
    const isHeader = cell.tagName === 'TH';
    cell.classList.remove('cell-prof', 'cell-eleve', 'cell-image');
    let content = '';
    if (type === 'prof') { cell.classList.add('cell-prof'); content = `<div class="cell-prof-content" contenteditable="true">${isHeader ? 'En-tête' : 'Texte prof...'}</div>`; }
    else if (type === 'eleve') { cell.classList.add('cell-eleve'); content = `<textarea class="reponse-eleve" placeholder="Réponse élève..."></textarea>`; }
    else if (type === 'image') { cell.classList.add('cell-image'); content = `<div class="cell-image-placeholder" onclick="ftAddImage(this.parentElement)">🖼️ Cliquez</div>`; }
    cell.innerHTML = getTypeSelectorHTML(type) + content;
    if (type === 'eleve') ftInitTextareas(cell);
};

window.ftAddImage = function(cell) {
    const nom = prompt("Nom du fichier image (ex: photo1.jpg) ?", "");
    if (nom && nom.trim()) cell.innerHTML = getTypeSelectorHTML('image') + `<img src="images/${nom.trim()}" alt="${nom.trim()}" onclick="ftAddImage(this.parentElement)">`;
};

window.ftAddRow = function(btn) {
    const block = btn.closest('.question-block');
    const table = block.querySelector('table.flex-table');
    const colCount = table.querySelector('thead tr').querySelectorAll('th').length;
    const tr = document.createElement('tr');
    for (let i = 0; i < colCount; i++) { const td = document.createElement('td'); td.className = 'cell-eleve'; td.innerHTML = getTypeSelectorHTML('eleve') + `<textarea class="reponse-eleve" placeholder="Réponse élève..."></textarea>`; tr.appendChild(td); }
    table.querySelector('tbody').appendChild(tr);
    ftInitTextareas(tr);
};

window.ftRemoveRow = function(btn) {
    const tbody = btn.closest('.question-block').querySelector('table.flex-table tbody');
    const rows = tbody.querySelectorAll('tr');
    if (rows.length > 1) rows[rows.length - 1].remove();
    else alert("⚠️ Il faut garder au moins 1 ligne !");
};

window.ftAddColumn = function(btn) {
    const table = btn.closest('.question-block').querySelector('table.flex-table');
    const newTh = document.createElement('th'); newTh.className = 'cell-prof'; newTh.innerHTML = getTypeSelectorHTML('prof') + `<div class="cell-prof-content" contenteditable="true">Nouvelle col.</div>`;
    table.querySelector('thead tr').appendChild(newTh);
    table.querySelectorAll('tbody tr').forEach(row => { const td = document.createElement('td'); td.className = 'cell-eleve'; td.innerHTML = getTypeSelectorHTML('eleve') + `<textarea class="reponse-eleve" placeholder="Réponse élève..."></textarea>`; row.appendChild(td); });
    ftInitTextareas(table);
};

window.ftRemoveColumn = function(btn) {
    const table = btn.closest('.question-block').querySelector('table.flex-table');
    const headers = table.querySelector('thead tr').querySelectorAll('th');
    if (headers.length > 1) { headers[headers.length - 1].remove(); table.querySelectorAll('tbody tr').forEach(row => { const cells = row.querySelectorAll('td'); if (cells.length > 0) cells[cells.length - 1].remove(); }); }
    else alert("⚠️ Il faut garder au moins 1 colonne !");
};

// ============================================
// 📌 INJECTION DES BOUTONS
// ============================================
(function injectButtons() {
    function doInject() {
        const teacherControls = document.querySelector('.teacher-controls > div');
        if (!teacherControls) return;
        
        const separators = teacherControls.querySelectorAll('div[style*="height:1px"]');
        const lastSep = separators[separators.length - 1];
        if (!lastSep) return;
        
        const newSep = document.createElement('div');
        newSep.style = 'width:100%; height:1px; background:#bdc3c7; margin:5px 0;';
        
        const buttons = [
            { text: '+ ➖ Trait', bg: '#94a3b8', fn: 'addSeparatorLine' },
            { text: '+ 📍 Séparateur', bg: '#64748b', fn: 'addSeparatorTitled' },
            { text: '+ 📚 Thème', bg: '#1e293b', fn: 'addThemeBox' },
            { text: '+ 🔶 Bannière', bg: '#f59e0b', fn: 'addBannerBox' },
            { text: '+ ⚠️ Important', bg: '#eab308', fn: 'addImportantBox' },
            { text: '+ 📄 Doc Illustré', bg: '#27ae60', fn: 'addDocEnrichi' },
            { text: '+ 🔄 PAD 2', bg: '#475569', fn: 'addPAD2' },
            { text: '+ ✅ Vrai/Faux', bg: '#3b82f6', fn: 'addVraiFaux' },
            { text: '+ 📰 Article', bg: '#6366f1', fn: 'addArticleBlock' },
            { text: '+ 📊 Tableau', bg: '#10b981', fn: 'addFlexTable' },
        ];
        
        lastSep.parentNode.insertBefore(newSep, lastSep.nextSibling);
        
        let insertPoint = newSep.nextSibling;
        buttons.forEach(b => {
            const btn = document.createElement('button');
            btn.className = 'btn-add-q';
            btn.style = `background:${b.bg};`;
            btn.textContent = b.text;
            btn.setAttribute('type', 'button');
            btn.onclick = function() { window[b.fn](this); };
            newSep.parentNode.insertBefore(btn, insertPoint);
        });
        
        console.log("✅ Module Complet v16.8 chargé !");
    
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', doInject);
    else doInject();
})();

console.log("📦 Module PSE v16.8 - COMPLET avec Texte+Image et PAD2 !");
