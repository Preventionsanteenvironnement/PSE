/* Entraînement mobile : une question, un corrigé complet, reprise des erreurs.
   Aucun accès réseau ni enregistrement de résultat dans ce module. */
(function () {
    'use strict';
    const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
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
                <p class="mq-situation">${esc(q.situation)}</p><p class="mq-question">${esc(q.question)}</p>
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
                <h4>Pour comprendre</h4><p>${esc(pedagogie.comprendre)}</p>
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
                <p><strong>À garder :</strong> chaque acteur a un rôle ; plusieurs acteurs peuvent agir ensemble.</p>
                ${!retry && wrong.length?`<button type="button" class="mq-primary" data-action="retry">Réessayer les ${wrong.length} question${wrong.length>1?'s':''} à reprendre</button>`:''}
                ${contenu.suite_exercice && onNextLevel?'<button type="button" class="mq-secondary" data-action="next-level">Découvrir le niveau suivant</button>':''}
                <button type="button" class="mq-secondary" data-action="restart">Refaire ce niveau</button>
                <p class="mq-help">Pour choisir un autre niveau, utilise la flèche « Retour aux exercices » en haut de la page. Aucune note scolaire n’est envoyée.</p></section>`;
            on('retry', () => {queue=wrong.slice();position=0;retry=true;show();});on('next-level', () => onNextLevel(contenu.suite_exercice));on('restart',restart);focus('.mq-title',true);
        }
        show();
    }
})();
