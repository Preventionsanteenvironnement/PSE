/* Entraînement mobile : une question, un corrigé complet, reprise des erreurs.
   Aucun accès réseau ni enregistrement de résultat dans ce module. */
(function () {
    'use strict';
    const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function renderMatrix(q,reveal=false){if(!q.outil)return '';const rows=[4,3,2,1],g=['','Faible','Moyenne','Grave','Très grave'];return `<aside class="tool" aria-label="Outil de lecture : gravité, probabilité et priorité"><h3>Ton outil pour répondre</h3><div class="axis-key"><div><strong>Gravité = conséquences sur la santé</strong><br>1 · Faible : sans arrêt de travail<br>2 · Moyenne : avec arrêt de travail<br>3 · Grave : incapacité permanente<br>4 · Très grave : décès</div><div><strong>Probabilité = possibilité du dommage</strong><br>1 · Très improbable<br>2 · Improbable<br>3 · Probable<br>4 · Très probable</div></div><details ${q.id==='N2-3'?'open':''}><summary>Comment choisir la probabilité ?</summary><table class="flow"><thead><tr><th>Exposition</th><th>Possibilité du déclencheur</th><th>Probabilité du dommage</th></tr></thead><tbody><tr><td>Rare / courte</td><td>Faible</td><td>1 · Très improbable</td></tr><tr><td>Rare / courte</td><td>Élevée</td><td>2 · Improbable</td></tr><tr><td>Fréquente / longue</td><td>Faible</td><td>3 · Probable</td></tr><tr><td>Fréquente / longue</td><td>Élevée</td><td>4 · Très probable</td></tr></tbody></table></details><p class="axis-title">Probabilité →</p><table class="risk-matrix"><caption class="mini-note">Croise la ligne de gravité et la colonne de probabilité.</caption><thead><tr><th scope="col">Gravité ↓</th><th scope="col" aria-label="Probabilité 1 : très improbable">1</th><th scope="col" aria-label="Probabilité 2 : improbable">2</th><th scope="col" aria-label="Probabilité 3 : probable">3</th><th scope="col" aria-label="Probabilité 4 : très probable">4</th></tr></thead><tbody>${rows.map(v=>`<tr><th scope="row">${v}<br>${g[v]}</th>${[1,2,3,4].map(p=>{let urgent=v===4||(v===3&&p>=2)||(v===2&&p>=3);let h=reveal&&((q.parcours==='DUERP'||q.id==='N2-4')&&v===2&&p===4 || q.id==='N3-3'&&(v===2&&p===4||v===3&&p===2));return `<td class="${urgent?'urgent':'planned'} ${h?'reveal':''}" aria-label="Gravité ${v}, probabilité ${p} : réduction ${urgent?'prioritaire':'non prioritaire'}">${urgent?'P':'NP'}</td>`}).join('')}</tr>`).join('')}</tbody></table><div class="legend"><div class="urgent-label"><strong>P · Réduction PRIORITAIRE</strong></div><div class="planned-label"><strong>NP · Réduction NON PRIORITAIRE</strong><br>Le risque reste à réduire ; cela ne signifie pas « aucun risque ».</div></div>${reveal&&((q.parcours==='DUERP'||q.id==='N2-4'))?'<p class="guided"><strong>Lecture de la case :</strong><br>2 · Gravité moyenne + 4 · Très probable<br>→ Réduction prioritaire.</p>':''}<p class="disclaimer">Matrice du document C5 Foucher, redessinée pour téléphone. Les couleurs sont adaptées pour la lisibilité. Cet exemple n’est pas une grille réglementaire universelle ; utilise toujours celle donnée dans le sujet. Une mise en sécurité nécessaire ne doit pas attendre.</p></aside>`;}

    window.PseMobileQuiz = { render };
    function render(zone, contenu, onNextLevel) {
        const questions = contenu.questions || [];
        let queue = questions.slice(), position = 0, selection = null, locked = false;
        let wrong = [], firstCorrect = 0, retry = false;
        const niveau = contenu.niveau_progression;
        const noms = {1:'Reconnaître',2:'Appliquer',3:'Raisonner'};
        // Le conteneur est spécifique à cette activité. Les autres moteurs restent inchangés.
        zone.innerHTML = '<div class="mq"></div>';
        const root = zone.firstElementChild;
        function on(action, fn) {
            const el = root.querySelector('[data-action="' + action + '"]');
            if (el) el.addEventListener('click', fn);
        }
        function focus(selector, scroll) {
            requestAnimationFrame(() => {
                if (!root.isConnected) return;
                const el = root.querySelector(selector);
                if (el) { el.focus({preventScroll:true}); if (scroll) el.scrollIntoView({block:'start'}); }
            });
        }
        function show() {
            selection = null; locked = false;
            const q = queue[position];
            if (!q) { root.innerHTML = '<p>Aucune question disponible.</p>'; return; }
            root.innerHTML = `<div class="mq-top"><span>Niveau ${esc(niveau)} · ${esc(noms[niveau] || '')}</span><span>${retry?'À reprendre · ':''}${position+1} / ${queue.length}</span></div>
                <p class="mq-help">Une seule réponse. Choisis, puis lis l’explication.</p>
                <section class="mq-card"><h3 class="mq-title" tabindex="-1">${esc(q.titre)}</h3>
                <p class="mq-situation">${esc(q.situation)}</p>${renderMatrix(q)}<p class="mq-question">${esc(q.question)}</p>
                <div role="group" aria-label="Une seule réponse à choisir">${q.choix.map((o,i)=>`<button type="button" class="mq-choice" data-choice="${i}" aria-pressed="false"><span class="mq-letter">${'ABC'[i]}</span><span>${esc(o.texte)}</span></button>`).join('')}</div>
                <button type="button" class="mq-primary" data-action="check" disabled>Vérifier ma réponse</button><div class="mq-feedback-zone"></div></section>`;
            root.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => choose(Number(button.dataset.choice))));
            on('check', check); focus('.mq-title', true);
        }
        function choose(i) {
            if (locked) return;
            selection = i;
            root.querySelectorAll('[data-choice]').forEach(button => {
                const selected = Number(button.dataset.choice) === i;
                button.classList.toggle('mq-selected', selected);
                button.setAttribute('aria-pressed', String(selected));
            });
            root.querySelector('[data-action="check"]').disabled = false;
        }
        function check() {
            if (locked || selection === null) return;
            locked = true;
            const q = queue[position], chosen = q.choix[selection], ok = chosen.id === q.reponse;
            const answer = q.choix.find(o => o.id === q.reponse), pedagogie = q.correction_pedagogique;
            if (!retry) { if (ok) firstCorrect++; else wrong.push(q); }
            root.querySelectorAll('[data-choice]').forEach(button => {
                const o = q.choix[Number(button.dataset.choice)]; button.disabled = true;
                if (o.id === q.reponse) button.classList.add('mq-correct');
                if (Number(button.dataset.choice) === selection && !ok) button.classList.add('mq-wrong');
            });
            root.querySelector('[data-action="check"]').hidden = true;
            root.querySelector('.mq-feedback-zone').innerHTML = `<section class="mq-feedback" aria-label="Correction pédagogique">
                <h4 class="mq-status" tabindex="-1">${ok?'Bonne réponse · voici pourquoi':'On reprend ensemble'}</h4>
                <p>${esc(q.retours[chosen.id])}</p>${ok?'':`<p><strong>La réponse à retenir :</strong> ${esc(answer.texte)}</p>`}
                ${q.outil?renderMatrix(q,true):''}<h4>Pour comprendre</h4><p>${esc(pedagogie.comprendre)}</p>
                <div class="mq-example"><h4>Un autre exemple</h4><p>${esc(pedagogie.exemple)}</p></div>
                <p class="mq-memo"><strong>Le repère :</strong> ${esc(pedagogie.retenir)}</p>
                <button type="button" class="mq-primary" data-action="next">${position+1===queue.length?'Voir mon bilan':'Question suivante →'}</button></section>`;
            on('next', next); focus('.mq-status', true);
        }
        function next() { if (!locked) return; position++; if (position < queue.length) show(); else end(); }
        function restart() { queue=questions.slice();position=0;wrong=[];firstCorrect=0;retry=false;show(); }
        function end() {
            root.innerHTML = `<section class="mq-card"><h3 class="mq-title" tabindex="-1">${retry?'Tu as repris les questions difficiles.':'Tu as fait les six questions.'}</h3>
                <p>${retry?'Tu peux refaire le niveau pour vérifier tes repères.':`${firstCorrect} réponse${firstCorrect>1?'s':''} juste${firstCorrect>1?'s':''} au premier essai sur ${questions.length}. Ce repère concerne seulement cet entraînement.`}</p>
                <p><strong>À garder :</strong> ${esc(contenu.bilan_retenir || 'chaque acteur a un rôle ; plusieurs acteurs peuvent agir ensemble.')}</p>
                ${!retry && wrong.length?`<button type="button" class="mq-primary" data-action="retry">Réessayer les ${wrong.length} question${wrong.length>1?'s':''} à reprendre</button>`:''}
                ${contenu.suite_exercice && onNextLevel?'<button type="button" class="mq-secondary" data-action="next-level">Découvrir le niveau suivant</button>':''}
                <button type="button" class="mq-secondary" data-action="restart">Refaire ce niveau</button>
                <p class="mq-help">Pour choisir un autre niveau, utilise la flèche « Retour aux exercices » en haut de la page. Aucune note scolaire n’est envoyée.</p></section>`;
            on('retry', () => {queue=wrong.slice();position=0;retry=true;show();});on('next-level', () => onNextLevel(contenu.suite_exercice));on('restart',restart);focus('.mq-title',true);
        }
        show();
    }
})();
