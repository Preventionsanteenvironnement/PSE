/* comm_kit.js — moteur des parcours "Apprendre à communiquer" (mapse.fr)
   Fonctions : navigation (Précédent / Accueil / Passer), anti-blocage,
   audio (lecture à voix haute), auto-évaluation + remédiation en fin de parcours. */
(function(){
  var COMM = { init: init };
  window.COMM = COMM;

  function init(cfg){
    var STEPS = cfg.steps || [];
    var root = document.getElementById('comm-app');
    root.innerHTML =
      '<div class="comm-wrap">' +
        '<nav class="comm-nav">' +
          '<button class="navbtn" id="commPrev" type="button">← Précédent</button>' +
          '<a class="navbtn home" href="index.html">⌂ Accueil</a>' +
          '<button class="navbtn skip" id="commSkip" type="button">Passer →</button>' +
        '</nav>' +
        '<div class="comm-prog"><div class="label" id="commLabel"></div><div class="track"><i id="commBar"></i></div></div>' +
        '<div id="comm-scene"></div>' +
      '</div>';

    var scene = document.getElementById('comm-scene');
    var prevBtn = document.getElementById('commPrev');
    var skipBtn = document.getElementById('commSkip');
    var bar = document.getElementById('commBar');
    var labelEl = document.getElementById('commLabel');
    var idx = 0;

    function speak(t){ try{ if(!('speechSynthesis' in window))return; speechSynthesis.cancel(); var u=new SpeechSynthesisUtterance(String(t).replace(/<[^>]+>/g,'')); u.lang='fr-FR'; u.rate=0.95; speechSynthesis.speak(u);}catch(e){} }
    function go(i){ if(i<0||i>STEPS.length-1) return; idx=i; try{speechSynthesis.cancel();}catch(e){} render(); }
    function progress(){
      bar.style.width = Math.round(idx/(STEPS.length-1)*100)+'%';
      labelEl.textContent = 'Étape '+(idx+1)+' / '+STEPS.length;
      prevBtn.disabled = (idx===0);
      skipBtn.hidden = (idx>=STEPS.length-1);
    }
    prevBtn.onclick = function(){ go(idx-1); };
    skipBtn.onclick = function(){ go(idx+1); };

    function continueBtn(label){ var b=document.createElement('button'); b.className='comm-btn'; b.type='button'; b.textContent=label||'Continuer →'; b.onclick=function(){ go(idx+1); }; return b; }
    function sayBtn(text){ var b=document.createElement('button'); b.className='comm-say'; b.type='button'; b.textContent='🔊 Écouter'; b.onclick=function(){ speak(text); }; return b; }

    function render(){
      var s = STEPS[idx];
      progress();
      window.scrollTo({top:0,behavior:'smooth'});
      var card = document.createElement('div');

      if(s.type==='intro'){
        scene.innerHTML='';
        var hero=document.createElement('div'); hero.className='comm-hero';
        hero.innerHTML='<span class="ic">'+cfg.icon+'</span><h1>'+cfg.title+'</h1><p>'+cfg.subtitle+'</p>';
        card.className='comm-card';
        card.innerHTML='<p class="comm-txt">'+s.text+'</p>';
        var b=document.createElement('button'); b.className='comm-btn'; b.type='button'; b.textContent='Commencer'; b.onclick=function(){ go(idx+1); };
        card.appendChild(b);
        scene.appendChild(hero); scene.appendChild(card);
        return;
      }

      card.className='comm-card';
      scene.innerHTML=''; scene.appendChild(card);

      if(s.type==='notion'){
        card.appendChild(sayBtn(s.teach+' '+s.q));
        card.innerHTML+='<div class="comm-teach">'+s.teach+'</div><div class="comm-q">'+s.q+'</div><div class="comm-opts"></div><div class="comm-fb"></div>';
        var opts=card.querySelector('.comm-opts'), fb=card.querySelector('.comm-fb'), done=false;
        s.options.forEach(function(o){
          var b=document.createElement('button'); b.className='comm-opt'; b.type='button'; b.textContent=o.l;
          b.onclick=function(){
            if(done)return;
            if(o.ok){ done=true; opts.querySelectorAll('.comm-opt').forEach(function(x){x.disabled=true;}); b.classList.add('ok'); fb.innerHTML='<div class="comm-msg good">✓ '+s.good+'</div>'; fb.appendChild(continueBtn()); }
            else { b.classList.add('no'); b.disabled=true; fb.innerHTML='<div class="comm-msg bad">'+s.wrong+' <strong>Essayez encore.</strong></div>'; }
          };
          opts.appendChild(b);
        });
        return;
      }

      if(s.type==='sort'){
        var j=0;
        card.appendChild(sayBtn(s.teach));
        card.innerHTML+='<div class="comm-teach">'+s.teach+'</div><div class="comm-q">'+s.q+'</div><div class="sortarea"></div>';
        var area=card.querySelector('.sortarea');
        (function drawItem(){
          var it=s.items[j];
          area.innerHTML='<p class="comm-txt">'+it.l+'</p><div class="comm-two"><button type="button" class="comm-opt center" data-v="1">'+s.a+'</button><button type="button" class="comm-opt center" data-v="0">'+s.b+'</button></div><div class="comm-fb"></div>';
          var fb=area.querySelector('.comm-fb'), answered=false;
          area.querySelectorAll('.comm-opt').forEach(function(b){
            b.onclick=function(){
              if(answered)return; answered=true;
              var ok=((b.getAttribute('data-v')==='1')===it.good);
              area.querySelectorAll('.comm-opt').forEach(function(x){x.disabled=true;});
              b.classList.add(ok?'ok':'no');
              fb.innerHTML='<div class="comm-msg '+(ok?'good':'bad')+'">'+(ok?'✓ ':'')+it.ex+'</div>';
              var nb=document.createElement('button'); nb.className='comm-btn'; nb.type='button'; nb.textContent=(j>=s.items.length-1)?'Continuer →':'Suivant →';
              nb.onclick=function(){ if(j>=s.items.length-1){ go(idx+1); } else { j++; drawItem(); } };
              fb.appendChild(nb);
            };
          });
        })();
        return;
      }

      if(s.type==='cases'){
        var jc=0;
        card.appendChild(sayBtn(s.teach));
        card.innerHTML+='<div class="comm-teach">'+s.teach+'</div><div class="comm-q">'+s.q+'</div><div class="casearea"></div>';
        var carea=card.querySelector('.casearea');
        (function drawCase(){
          var it=s.items[jc];
          carea.innerHTML='<p class="comm-txt">'+it.text+'</p><div class="comm-opts"></div><div class="comm-fb"></div>';
          var opts=carea.querySelector('.comm-opts'), fb=carea.querySelector('.comm-fb'), done=false;
          it.options.forEach(function(o){
            var b=document.createElement('button'); b.className='comm-opt'; b.type='button'; b.textContent=o.l;
            b.onclick=function(){
              if(done)return;
              if(o.good){ done=true; opts.querySelectorAll('.comm-opt').forEach(function(x){x.disabled=true;}); b.classList.add('ok'); fb.innerHTML='<div class="comm-msg good">✓ '+o.fb+'</div>'; var nb=document.createElement('button'); nb.className='comm-btn'; nb.type='button'; nb.textContent=(jc>=s.items.length-1)?'Continuer →':'Suivant →'; nb.onclick=function(){ if(jc>=s.items.length-1){ go(idx+1);} else {jc++; drawCase();} }; fb.appendChild(nb); }
              else { b.classList.add('no'); b.disabled=true; fb.innerHTML='<div class="comm-msg bad">'+o.fb+' <strong>Essayez encore.</strong></div>'; }
            };
            opts.appendChild(b);
          });
        })();
        return;
      }

      if(s.type==='order'){
        card.appendChild(sayBtn(s.goal+'. '+s.intro));
        card.innerHTML+='<div class="comm-goal">'+s.goal+'</div><p class="comm-txt" style="font-weight:600;font-size:1rem">'+s.intro+'</p><div class="comm-opts" id="ord"></div><div class="comm-fb"></div>';
        var ord=card.querySelector('#ord'), ofb=card.querySelector('.comm-fb'), expected=1;
        s.steps.forEach(function(st){
          var b=document.createElement('button'); b.className='comm-opt'; b.type='button'; b.textContent=st.l;
          b.onclick=function(){
            if(b.disabled)return;
            if(st.pos===expected){ b.classList.add('ok'); b.disabled=true; b.textContent=expected+'. '+st.l; expected++;
              if(expected>s.steps.length){ ofb.innerHTML='<div class="comm-msg win">'+s.done+'</div>'; ofb.appendChild(continueBtn()); }
            } else { b.classList.add('shake'); setTimeout(function(){ b.classList.remove('shake'); },350); ofb.innerHTML='<div class="comm-msg bad">'+s.hint+'</div>'; }
          };
          ord.appendChild(b);
        });
        return;
      }

      if(s.type==='pick'){
        card.appendChild(sayBtn(s.teach+' '+s.q));
        card.innerHTML+='<div class="comm-teach">'+s.teach+'</div><div class="comm-q">'+s.q+'</div><div class="comm-chips"></div><div class="comm-hint"></div><div class="comm-fb"></div>';
        var chips=card.querySelector('.comm-chips'), hint=card.querySelector('.comm-hint'), pfb=card.querySelector('.comm-fb'), sel=0;
        var cont=continueBtn('Valider →'); cont.disabled=true;
        function refresh(){ hint.textContent=sel+' choisi(s) — il en faut au moins '+s.min+'.'; cont.disabled=(sel<s.min); }
        s.options.forEach(function(o){
          var c=document.createElement('button'); c.className='comm-chip'; c.type='button'; c.textContent=o;
          c.onclick=function(){ if(c.classList.toggle('on')) sel++; else sel--; refresh(); };
          chips.appendChild(c);
        });
        cont.onclick=function(){ go(idx+1); };
        pfb.innerHTML='<div class="comm-msg win">'+s.done+'</div>'; pfb.appendChild(cont);
        refresh();
        return;
      }

      if(s.type==='method'){
        card.appendChild(sayBtn(s.intro+' '+s.steps.join('. ')));
        var h='<div class="comm-q">'+s.title+'</div><p class="comm-txt" style="font-weight:600;font-size:1rem">'+s.intro+'</p><ul class="comm-steps3">';
        s.steps.forEach(function(x){ h+='<li>'+x+'</li>'; });
        h+='</ul>';
        card.innerHTML+=h;
        var mb=document.createElement('button'); mb.className='comm-btn'; mb.type='button'; mb.textContent=s.cta||'Continuer →'; mb.onclick=function(){ go(idx+1); }; card.appendChild(mb);
        return;
      }

      if(s.type==='breath'){
        card.appendChild(sayBtn(s.audio));
        card.innerHTML+='<div class="comm-q">'+s.title+'</div><p class="comm-txt" style="font-weight:600;font-size:1rem">'+s.intro+'</p><div class="comm-breathwrap"><div class="comm-breathlabel">Prêt…</div><div class="comm-breath"></div></div><div class="comm-fb"></div>';
        var circle=card.querySelector('.comm-breath'), blabel=card.querySelector('.comm-breathlabel'), bfb=card.querySelector('.comm-fb');
        var phase=0;
        (function stepB(){
          if(!document.body.contains(circle))return;
          if(phase%2===0){ blabel.textContent='Inspirez…'; circle.style.transform='scale(1.45)'; }
          else { blabel.textContent='Expirez…'; circle.style.transform='scale(0.7)'; }
          phase++; setTimeout(stepB,4200);
        })();
        bfb.innerHTML='<div class="comm-msg win">'+s.done+'</div>'; bfb.appendChild(continueBtn('J’ai respiré →'));
        return;
      }

      if(s.type==='perso'){
        card.appendChild(sayBtn(s.text));
        card.innerHTML+='<p class="comm-txt">'+s.text+'</p><div class="comm-msg note">'+s.note+'</div>';
        var pb=document.createElement('button'); pb.className='comm-btn'; pb.type='button'; pb.textContent='J’y ai réfléchi →'; pb.onclick=function(){ go(idx+1); }; card.appendChild(pb);
        return;
      }

      if(s.type==='bilan'){
        scene.innerHTML='';
        var hero2=document.createElement('div'); hero2.className='comm-hero';
        hero2.innerHTML='<span class="ic">'+(cfg.finalIc||cfg.icon)+'</span><h1>'+(cfg.finalTitle||'Parcours terminé')+'</h1><p>'+(cfg.finalSub||'')+'</p>';
        scene.appendChild(hero2);
        var c2=document.createElement('div'); c2.className='comm-card'; scene.appendChild(c2);
        var h2='<div class="comm-badge">'+(cfg.badge||'')+'</div><p class="comm-txt" style="font-size:1rem;font-weight:800;color:#155e75">Ce que vous avez appris :</p><ul class="comm-recap">';
        s.recap.forEach(function(r){ h2+='<li>'+r+'</li>'; });
        h2+='</ul>';
        c2.innerHTML=h2;
        // Auto-évaluation
        var evalWrap=document.createElement('div');
        evalWrap.innerHTML='<div class="comm-q" style="margin-top:14px">Avant de terminer, faites le point : avez-vous compris ?</div><div class="comm-eval"></div><div class="comm-fb"></div>';
        c2.appendChild(evalWrap);
        var ev=evalWrap.querySelector('.comm-eval'), efb=evalWrap.querySelector('.comm-fb');
        var levels=[
          {l:'Oui, c’est clair', cls:'good', msg:'Excellent : c’est acquis. Vous pouvez refaire le parcours quand vous voulez pour vous entraîner.'},
          {l:'À peu près', cls:'note', msg:'C’est en bonne voie. Relisez les points clés ci-dessus, puis refaites le parcours une fois pour bien les ancrer.'},
          {l:'Pas encore', cls:'note', msg:'Ce n’est pas grave : on apprend en répétant. Reprenez le parcours tranquillement, à votre rythme — vous pouvez avancer pas à pas.'}
        ];
        function finalButtons(){
          var rb=document.createElement('button'); rb.className='comm-btn'; rb.type='button'; rb.textContent='Recommencer le parcours'; rb.onclick=function(){ go(0); }; efb.appendChild(rb);
          var hb=document.createElement('a'); hb.className='comm-btn soft'; hb.href='index.html'; hb.textContent='← Retour à l’accueil'; efb.appendChild(hb);
        }
        var answered=false;
        levels.forEach(function(lv){
          var b=document.createElement('button'); b.className='comm-opt center'; b.type='button'; b.textContent=lv.l;
          b.onclick=function(){
            if(answered)return; answered=true;
            ev.querySelectorAll('.comm-opt').forEach(function(x){x.disabled=true;});
            if(lv.cls==='good') b.classList.add('ok');
            efb.innerHTML='<div class="comm-msg '+lv.cls+'">'+lv.msg+'</div>';
            finalButtons();
          };
          ev.appendChild(b);
        });
        return;
      }
    }

    render();
  }
})();
