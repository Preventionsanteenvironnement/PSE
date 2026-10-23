/* Parcours élève : une situation à la fois. Aucun envoi de résultat. */
(function(){
 'use strict';
 const C=window.COURS;if(!C||!C.cpp_clair)return;
 document.body.classList.add('cpp');
 const main=document.getElementById('contenu');
 const fil=main.querySelector('.fil');if(fil){const link=fil.querySelector('a');if(link){link.textContent='← Retour aux activités';fil.replaceChildren(link);}}
 let questions=[...main.querySelectorAll('.q')];
 if(!questions.length)questions=[...main.querySelectorAll('[data-item]')];
 if(!questions.length)return;
 let index=0;
 const nav=document.createElement('nav');nav.className='cpp-navigation';nav.setAttribute('aria-label','Passer d’une situation à l’autre');
 nav.innerHTML='<button type="button" class="cpp-prev">← Précédente</button><span class="cpp-position" role="status"></span><button type="button" class="cpp-next">Suivante →</button>';
 questions[0].before(nav);
 const more=document.createElement('details');more.className='cpp-method';more.innerHTML='<summary>Repères du processus d’apparition du dommage</summary><p><strong>Opérateur :</strong> personne exposée.<br><strong>Danger :</strong> source susceptible de causer une atteinte à la santé.<br><strong>Situation dangereuse :</strong> exposition pendant l’activité.<br><strong>Événement déclencheur :</strong> fait qui conduit au dommage.<br><strong>Dommage :</strong> lésion ou atteinte à la santé.</p>';
 nav.before(more);
 function show(focus){questions.forEach((q,i)=>q.hidden=i!==index);nav.querySelector('.cpp-position').textContent='Situation '+(index+1)+' sur '+questions.length;nav.querySelector('.cpp-prev').disabled=index===0;nav.querySelector('.cpp-next').disabled=index===questions.length-1;if(focus){const h=questions[index].querySelector('h3,.enonce')||questions[index];h.tabIndex=-1;h.focus({preventScroll:true});nav.scrollIntoView({block:'start'});}}
 nav.querySelector('.cpp-prev').addEventListener('click',()=>{if(index>0){index--;show(true);}});
 nav.querySelector('.cpp-next').addEventListener('click',()=>{if(index<questions.length-1){index++;show(true);}});
 show(false);
})();
