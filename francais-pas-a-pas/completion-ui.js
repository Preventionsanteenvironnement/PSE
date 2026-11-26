'use strict';
// Shared accessible completion fields: letters within words, words within phrases.
function inlineCompletion(w,phraseMode){
 const form=document.createElement('form'),group=document.createElement('div'),instruction=document.createElement('p');
 instruction.id='completion-instruction';instruction.textContent=phraseMode?'Compléter la phrase dans les cases.':'Compléter les lettres dans le mot.';form.append(instruction);
 group.className='inline-completion';group.setAttribute('role','group');group.setAttribute('aria-labelledby',instruction.id);
 const units=phraseMode?w.word.replace(/[.!?]+$/,'').split(' '):[...w.word.normalize('NFC')];
 const letters=units.map((c,i)=>/\p{L}/u.test(c)?i:-1).filter(i=>i>=0);
 let missing=phraseMode?[1,...(w.level===3?[units.length-1]:[])]:letters.filter((i,n)=>n%(w.level===1?4:w.level===2?3:2)===1);
 missing=[...new Set(missing)].filter(i=>i<units.length);if(!missing.length&&letters.length)missing.push(letters[letters.length-1]);
 const inputs=[];let chunk=document.createElement('span');chunk.className='word-chunk';group.append(chunk);
 units.forEach((unit,i)=>{
  if(!phraseMode&&/\s/u.test(unit)){chunk=document.createElement('span');chunk.className='word-chunk';group.append(chunk);return;}
  if(missing.includes(i)){
   const input=document.createElement('input');input.type='text';input.className=phraseMode?'missing-word':'missing-letter';input.autocomplete='off';input.spellcheck=false;input.setAttribute('autocapitalize','none');input.setAttribute('aria-label',phraseMode?'Mot manquant '+(inputs.length+1):'Lettre manquante '+(inputs.length+1));input.dataset.unit=String(i);input.enterKeyHint='next';
   if(phraseMode)group.append(input);else chunk.append(input);inputs.push(input);
   input.addEventListener('input',event=>{if(phraseMode||event.isComposing)return;const value=input.value.normalize('NFC');if([...value].length>1){distribute(value,input);return;}input.value=value;input.classList.toggle('filled',!!value);if(value)inputs[inputs.indexOf(input)+1]?.focus();});
   input.addEventListener('paste',e=>{if(phraseMode)return;const text=e.clipboardData?.getData('text');if(text){e.preventDefault();distribute(text,input);}});
   input.addEventListener('keydown',e=>{const n=inputs.indexOf(input);if(e.key==='Backspace'&&!input.value&&n>0){e.preventDefault();inputs[n-1].focus();}if(e.key==='ArrowLeft'&&n>0)inputs[n-1].focus();if(e.key==='ArrowRight'&&n+1<inputs.length)inputs[n+1].focus();});
  }else{const span=document.createElement('span');span.className='fixed-letter';span.textContent=unit;if(phraseMode)group.append(span);else chunk.append(span);}
 });
 function distribute(text,input){const chars=[...text.normalize('NFC').trim()];if(normalize(text)===normalize(w.word)){inputs.forEach(x=>{x.value=units[Number(x.dataset.unit)];x.classList.add('filled');});inputs[inputs.length-1]?.focus();return;}
 const start=inputs.indexOf(input);inputs.slice(start).forEach((x,j)=>{if(chars[j]!==undefined){x.value=chars[j];x.classList.add('filled');}});inputs[Math.min(start+chars.length,inputs.length-1)]?.focus();}
 form.append(group);return {form,answer:()=>units.map((unit,i)=>{const input=inputs.find(x=>Number(x.dataset.unit)===i);return input?input.value:unit;}).join(phraseMode?' ':''),reveal:()=>{inputs.forEach(x=>{x.value=units[Number(x.dataset.unit)];x.classList.add('filled');});},inputs};
}

function showValidation(article,nextButton,word){
 article.classList.add('step-validated');
 article.querySelectorAll('.choices button').forEach(b=>{if(normalize(b.textContent)===normalize(word)){b.classList.add('answer-validated');b.setAttribute('aria-pressed','true');const tick=document.createElement('span');tick.textContent='✓ ';tick.setAttribute('aria-hidden','true');b.prepend(tick);}});
 article.querySelectorAll('input,textarea').forEach(input=>{input.classList.add('answer-validated');input.readOnly=true;});
 const badge=document.createElement('p');badge.className='validation-badge';badge.textContent='✓ Étape validée';
 if(nextButton){article.insertBefore(badge,nextButton);nextButton.classList.add('continue-validated');}else article.append(badge);
 article.querySelectorAll('button[type="submit"]').forEach(b=>{b.textContent='✓ Validé';b.classList.add('answer-validated');});
}
