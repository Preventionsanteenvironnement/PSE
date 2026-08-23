(function(){
  var synth = window.speechSynthesis;
  var currentButton = null;
  var autoAudioIndex = 0;
  function cleanText(root){
    var clone = root.cloneNode(true);
    if(!root.classList.contains('aide') && !root.classList.contains('comp-detail')){
      clone.querySelectorAll('details.aide, details.comp-detail').forEach(function(el){ el.remove(); });
    }
    clone.querySelectorAll('button, input, select, script, style').forEach(function(el){ el.remove(); });
    return (clone.innerText || clone.textContent || '').replace(/\s+/g,' ').trim();
  }
  function ensureAudioButton(el, label){
    var hasDirectButton = Array.from(el.children).some(function(child){ return child.classList && child.classList.contains('audio-doc'); });
    if(hasDirectButton) return;
    if(!el.id) el.id = 'audio-bloc-' + (++autoAudioIndex);
    var btn = document.createElement('button');
    btn.className = 'audio-doc audio-small';
    btn.type = 'button';
    btn.textContent = label || 'Écouter';
    btn.dataset.label = btn.textContent;
    btn.setAttribute('data-read', '#' + el.id);
    if(el.matches('details')){
      var summary = el.querySelector('summary');
      if(summary) summary.insertAdjacentElement('afterend', btn);
      else el.insertBefore(btn, el.firstChild);
    }else{
      el.insertBefore(btn, el.firstChild);
    }
  }
  document.querySelectorAll('.audio-doc').forEach(function(btn){ btn.dataset.label = btn.textContent; });
  document.querySelectorAll('.notice, .objectif, .comp-detail, .q, .aide, .remember, .method, .term').forEach(function(el){
    var label = el.matches('.q') ? 'Écouter la question' : 'Écouter';
    ensureAudioButton(el, label);
  });
  function stop(){
    if(synth) synth.cancel();
    document.querySelectorAll('.audio-doc').forEach(function(btn){ btn.classList.remove('is-playing'); btn.textContent = btn.dataset.label || 'Écouter'; });
    currentButton = null;
  }
  function speak(text, btn){
    if(!('speechSynthesis' in window)){ alert('Lecture audio non disponible sur ce navigateur.'); return; }
    if(currentButton === btn && synth.speaking){ stop(); return; }
    stop();
    currentButton = btn;
    btn.classList.add('is-playing');
    btn.textContent='Arrêter';
    var parts = [];
    var words = text.split(/\s+/);
    var chunk = '';
    words.forEach(function(w){
      if((chunk + ' ' + w).trim().length > 170){ parts.push(chunk.trim()); chunk = w; }
      else chunk = chunk ? chunk + ' ' + w : w;
    });
    if(chunk) parts.push(chunk);
    var i = 0;
    function next(){
      if(i >= parts.length){ stop(); return; }
      var u = new SpeechSynthesisUtterance(parts[i++]);
      u.lang = 'fr-FR';
      u.rate = 0.92;
      u.onend = next;
      synth.speak(u);
    }
    next();
  }
  document.querySelectorAll('.audio-doc').forEach(function(btn){
    btn.addEventListener('click', function(){
      var target = document.querySelector(btn.getAttribute('data-read'));
      if(target){ var text = cleanText(target); if(text) speak(text, btn); }
    });
  });
  window.addEventListener('beforeunload', stop);
})();
