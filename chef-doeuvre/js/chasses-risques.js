/* Chasses aux risques : observation, danger, type et dommage possible. */
(function () {
 'use strict';
 var A=window.CDO_AUDIO,D=window.CDO_DONNEES,E=window.CDO_EX,esc=E.esc;
 function texte(tag,t,cls){return '<'+tag+' class="'+(cls||'')+'" data-lire>'+A.bouton(t)+'<span>'+((cls==='cdo-consigne'||tag==='h4'&&/^(Nommer|Choisir) /.test(t))?esc(t).replace(/^(\S+)/,'<b>$1</b>'):esc(t))+'</span></'+tag+'>';}
 function bouton(a,t){return '<button type="button" class="cdo-btn-second" data-ch-action="'+a+'"><span>'+esc(t)+'</span>'+A.interne(t)+'</button>';}
 function rendre(host,b,opts){
  var e=D.seance('s1');e.chasses=e.chasses||{};
  var st=e.chasses[b.id]=e.chasses[b.id]||{valides:{},nommes:{},essais:{},enCours:null,etape:0,mode:'danger'};
  st.mode=st.mode||(st.enCours&&st.etape>0?'complet':'danger');st.nommes=st.nommes||{};Object.keys(st.valides).forEach(function(k){if(st.valides[k])st.nommes[k]=true;});
  st.journal=st.journal||[];st.essaisCycle=st.essaisCycle||{};
  function trace(action,donnees){st.journal.push(Object.assign({date:new Date().toISOString(),action:action},donnees||{}));}
  if(!st.debut){st.debut=new Date().toISOString();trace('debut',{mode:st.mode});D.enregistrer();}
  var feedback=null,grand=false;
  function save(){D.enregistrer();}
  function n(){var acquis=st.mode==='danger'?st.nommes:st.valides;return b.zones.filter(function(z){return acquis[z.id];}).length;}
  function valide(id){return st.mode==='danger'?st.nommes[id]:st.valides[id];}
  function afficher(){
   var descriptionOuverte=!!(host.querySelector('.chasse-description')&&host.querySelector('.chasse-description').open);
   var scroll=host.querySelector('.chasse-fenetre'),sx=scroll?scroll.scrollLeft:0,sy=scroll?scroll.scrollTop:0;
   var actif=document.activeElement,commande=actif&&actif.closest('[data-ch-action]'),actionAvant=commande&&commande.dataset.chAction;
   var z=b.zones.filter(function(x){return x.id===st.enCours;})[0];
   if(!z){st.enCours=null;st.etape=0;}
   var fini=n()===b.zones.length;
   host.innerHTML='<section class="cdo-ex chasse-guide" data-type="chasseGuide">'+texte('p',st.mode==='danger'?'RECHERCHE · REPÉRER ET NOMMER':'APPROFONDISSEMENT · TYPE ET DOMMAGE','chasse-phase')+texte('h3',b.titre)+texte('p',fini?'Les '+b.zones.length+' dangers ont été étudiés.':n()+' dangers étudiés sur '+b.zones.length+'.')+
    texte('p',z?'Observer la zone entourée.':'Repérer un danger sur l’illustration.','cdo-consigne')+
    '<div class="chasse-commandes">'+bouton('agrandir',grand?'Réduire l’illustration':'Agrandir l’illustration')+(feedback&&feedback.ok?'':bouton('indice','Afficher un indice'))+'</div>'+
    '<div class="chasse-fenetre'+(grand?' chasse-grand':'')+'"><div class="chasse-scene"><img src="'+esc(b.image)+'" alt="'+esc(b.alt)+'" draggable="false">'+
    b.zones.map(function(v,i){return '<button type="button" class="chasse-cible'+(v.id===st.enCours?' vise':'')+(valide(v.id)?' trouve':'')+'" data-ch-zone="'+esc(v.id)+'" style="left:'+(v.x-v.w/2)+'%;top:'+(v.y-v.h/2)+'%;width:'+v.w+'%;height:'+v.h+'%" aria-label="Zone '+(i+1)+(valide(v.id)?' étudiée':' à observer')+'">'+(valide(v.id)?'<span>✓ '+(i+1)+'</span>':'')+'</button>';}).join('')+'</div></div>'+
    '<p class="cdo-discret">Au clavier : parcourir les zones avec Tab, puis appuyer sur Entrée. Sur petit écran : agrandir l’illustration.</p>'+
    '<details class="chasse-description"'+(descriptionOuverte?' open':'')+'><summary>Parcours avec descriptions</summary>'+b.zones.map(function(v,i){return '<article>'+texte('p',v.description)+'<button type="button" class="cdo-btn-second" data-ch-zone="'+esc(v.id)+'">Étudier la situation '+(i+1)+A.interne('Étudier la situation '+(i+1))+'</button></article>';}).join('')+'</details>'+
    '<div class="chasse-tache">'+(z?question(z):fini?bilan():texte('p','Choisir un endroit qui peut causer une blessure.','cdo-consigne'))+'</div>'+
    (feedback?'<div class="chasse-retour '+feedback.classe+'" role="status" data-lire>'+A.bouton(feedback.t)+(feedback.ok?'<div><p class="chasse-reponse">'+esc(feedback.reponse)+'</p><p class="chasse-explication">'+esc(feedback.explication)+'</p></div>':'<span>'+esc(feedback.t)+'</span>')+'</div>':'')+
    (feedback&&feedback.ok?'<div class="chasse-suite">'+bouton('suite',st.mode==='danger'||st.etape===2?'Rechercher un autre danger':'Continuer')+'</div>':'')+'</section>';
   var fenetre=host.querySelector('.chasse-fenetre');if(fenetre){fenetre.scrollLeft=sx;fenetre.scrollTop=sy;}
   var cible=feedback&&feedback.ok?host.querySelector('[data-ch-action="suite"]'):actionAvant==='agrandir'?host.querySelector('[data-ch-action="agrandir"]'):z?host.querySelector('.chasse-tache h4'):null;
   if(cible){cible.tabIndex=cible.tagName==='BUTTON'?0:-1;cible.focus({preventScroll:true});}
   if(feedback)A.lireAuto(feedback.t,host.querySelector('.chasse-retour'),'reponses');
  }
  function question(z){
   var stage=z.questions[st.etape], rep=st.reponses&&st.reponses[z.id];
   return '<figure class="chasse-detail" style="aspect-ratio:'+((z.w/z.h)*(1672/941))+'"><img src="'+esc(b.image)+'" alt="Détail de la zone entourée." style="width:'+(10000/z.w)+'%;left:'+(-(z.x-z.w/2)*100/z.w)+'%;top:'+(-(z.y-z.h/2)*100/z.h)+'%"></figure>'+texte('p',['1 · Le danger','2 · Le type de danger','3 · Le dommage possible'][st.etape],'chasse-etape')+
    (st.etape?texte('p','Danger repéré : '+z.nom+'.'):'')+
    texte('h4',stage.consigne)+
    '<div class="cdo-choix">'+stage.choix.map(function(t,i){return '<button type="button" class="cdo-carte" data-ch-reponse="'+i+'"'+(feedback&&feedback.ok?' disabled':'')+'><span>'+esc(t)+'</span>'+A.interne(t)+'</button>';}).join('')+'</div>';
  }
  function bilan(){return '<div class="chasse-passerelle">'+texte('h4','Recherche terminée')+texte('p',st.mode==='danger'?'Les cinq dangers de cette scène ont été nommés.':'Les cinq dangers, leurs types et leurs dommages possibles ont été étudiés.')+'<a class="cdo-btn epreuve-acces" href="#seance/s1/3">Passer à l’épreuve · Identifier les dangers</a>'+ (st.mode==='danger'?bouton('approfondir','Approfondir : type et dommage'):'')+bouton('recommencer',st.mode==='danger'?'Recommencer la recherche':'Recommencer l’approfondissement')+'</div>'+ (st.mode==='danger'?texte('h4','Les dangers repérés')+'<div class="chasse-bilan">'+b.zones.map(function(z){return texte('p',z.nom);}).join('')+'</div>': texte('h4','À retenir')+'<div class="chasse-bilan">'+b.zones.map(function(z){return '<article>'+texte('p',z.nom+' → '+z.questions[2].choix[z.questions[2].bonne]+'.','chasse-reponse')+texte('p',z.questions[2].explication,'chasse-explication')+'</article>';}).join('')+'</div>');}
  var selectionModalite='image';
  function choisir(id){
   if(st.enCours===id&&feedback&&feedback.ok)return;
   if(valide(id)){feedback={t:'Ce danger a déjà été étudié. Rechercher un autre endroit.',classe:''};afficher();return;}
   if(st.enCours&&st.enCours!==id){feedback={t:'Terminer la réponse en cours avant de choisir un autre endroit.',classe:''};afficher();return;}
   var meme=st.enCours===id;st.enCours=id;st.etape=meme?st.etape:(st.mode==='complet'&&st.nommes[id]?1:0);trace('zone',{zone:id,modalite:selectionModalite||'image'});feedback=null;save();afficher();var t=host.querySelector('.chasse-tache');if(t)t.scrollIntoView({block:'nearest'});
  }
  host.addEventListener('cdo-ecoute',function(ev){st.ecoutes=(st.ecoutes||0)+1;trace('demande_ecoute',{zone:st.enCours,etape:st.etape,texte:ev.detail.texte});save();});
  host.addEventListener('click',function(ev){
   if(ev.target.closest('.cdo-son'))return;
   var action=ev.target.closest('[data-ch-action]');
   if(action){
    A.arreter();var a=action.dataset.chAction;
    if(a==='recommencer'){st.cycles=st.cycles||[];st.cycles.push(JSON.parse(JSON.stringify({cycle:st.cycle||1,nommes:st.nommes,valides:st.valides,reponses:st.reponses||{},fin:new Date().toISOString()})));st.reponses={};st.essaisCycle={};st.nommes={};st.valides={};st.enCours=null;st.etape=0;st.cycle=(st.cycle||1)+1;trace('nouvelle_recherche',{cycle:st.cycle});feedback=null;save();afficher();return;}
    if(a==='approfondir'){st.mode='complet';st.enCours=null;st.etape=0;feedback=null;trace('approfondissement');save();afficher();return;}
    if(a==='agrandir'){grand=!grand;afficher();return;}
    if(a==='indice'){st.indices=(st.indices||0)+1;trace('indice',{zone:st.enCours,etape:st.etape});save();var z=b.zones.filter(function(x){return x.id===st.enCours;})[0]||b.zones.filter(function(x){return !valide(x.id);})[0];feedback={t:z?z.indice:'Tous les dangers ont été étudiés.',classe:''};afficher();return;}
    if(a==='suite'&&feedback&&feedback.ok){
     if(st.etape===0)st.nommes[st.enCours]=true;
     trace('etape_validee',{zone:st.enCours,etape:st.etape});
     if(st.mode==='danger'||st.etape===2){if(st.etape===2)st.valides[st.enCours]=true;st.enCours=null;st.etape=0;}else{st.etape++;}
     feedback=null;save();afficher();
     if(n()===b.zones.length&&opts&&opts.fini)opts.fini();
     var t=host.querySelector('.chasse-tache h4');if(t){t.tabIndex=-1;t.focus({preventScroll:true});}return;
    }
   }
   var reponse=ev.target.closest('[data-ch-reponse]');
   if(reponse){
    var z=b.zones.filter(function(x){return x.id===st.enCours;})[0];if(!z||feedback&&feedback.ok)return;
    var q=z.questions[st.etape], key=z.id+':'+st.etape, bonne=+reponse.dataset.chReponse===q.bonne;
    trace('reponse',{zone:z.id,etape:st.etape,choix:+reponse.dataset.chReponse,libelle:q.choix[+reponse.dataset.chReponse],correct:bonne});st.essais[key]=(st.essais[key]||0)+1;st.essaisCycle[key]=(st.essaisCycle[key]||0)+1;st.reponses=st.reponses||{};st.reponses[z.id]=st.reponses[z.id]||{};st.reponses[z.id][st.etape]=+reponse.dataset.chReponse;
    feedback={ok:bonne,reponse:q.choix[q.bonne],explication:q.explication,classe:bonne?'ok':'ko',t:bonne?q.choix[q.bonne]+'. '+q.explication:'Réponse à revoir. '+q.aide+(st.essaisCycle[key]>=2?' Réponse attendue : '+q.choix[q.bonne]+'.':'')+' Choisir à nouveau.'};save();afficher();return;
   }
   if(feedback&&feedback.ok&&ev.target.closest('.chasse-scene,.chasse-description'))return;
   var zone=ev.target.closest('[data-ch-zone]');
   if(zone&&(ev.detail===0||!zone.closest('.chasse-scene'))){selectionModalite=zone.closest('.chasse-description')?'description':'clavier';choisir(zone.dataset.chZone);return;}
   var scene=ev.target.closest('.chasse-scene');
   if(scene){var r=scene.getBoundingClientRect(),x=(ev.clientX-r.left)*100/r.width,y=(ev.clientY-r.top)*100/r.height;
    var zones=b.zones.filter(function(z){return Math.abs(x-z.x)<=z.w/2&&Math.abs(y-z.y)<=z.h/2;}).sort(function(a,b){return a.w*a.h-b.w*b.h;});
    selectionModalite='image';if(zones.length)choisir(zones[0].id);else{st.horsZone=(st.horsZone||0)+1;trace('hors_zone',{x:Math.round(x),y:Math.round(y)});save();feedback={t:'Aucun des dangers étudiés n’est retenu à cet endroit. Observer un autre espace.',classe:''};afficher();}
   }
  });
  var reprise=b.zones.filter(function(z){return z.id===st.enCours;})[0];
  if(reprise&&st.reponses&&st.reponses[reprise.id]&&st.reponses[reprise.id][st.etape]===reprise.questions[st.etape].bonne){var q=reprise.questions[st.etape];feedback={ok:true,reponse:q.choix[q.bonne],explication:q.explication,classe:'ok',t:q.choix[q.bonne]+'. '+q.explication};}
  afficher();
 }
 E.TYPES.chasseGuide=rendre;
})();
