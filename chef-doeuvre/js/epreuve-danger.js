/* Épreuve individuelle distincte, mêmes identifiants de séance pour le suivi Atelier. */
(function(){
 'use strict';var D=CDO_DONNEES,A=CDO_AUDIO,esc=CDO_EX.esc,V='identifier-danger-v1';
 function t(tag,txt){return '<'+tag+' data-lire>'+A.bouton(txt)+'<span>'+esc(txt)+'</span></'+tag+'>';}
 function question(scene,zone,consigne,choix,bonne,explication){var s=CDO_CHASSES.find(function(s){return s.id===scene;}),z=s.zones.find(function(z){return z.id===zone;});return {type:'choix',consigne:consigne,choix:choix,bonne:bonne,points:4,image:s.image,zone:z,alt:z.description,docTitre:s.titre.replace(/^\d+ · /,''),document:z.description,explication:explication};}
 function questions(){return [
 question('entrepot','hauteur','Choisir le danger dans cette scène.',['Le carton en hauteur','Une fracture','Le salarié'],'0','Le carton peut tomber du rayonnage. La fracture est un dommage possible, le salarié est un opérateur.'),
 question('atelier','roue','Nommer le danger entouré.',['Le mécanicien','La roue à soulever','Un mal de dos'],1,'La roue à soulever est la charge manipulée. Le mal de dos est un dommage possible.'),
 question('magasin','obstacle','Choisir le danger dans le passage.',['Une entorse','La salariée','Le câble au sol'],2,'Le câble dans le passage peut faire trébucher. Une entorse est un dommage possible.'),
 question('cuisine','couteau','Nommer le danger entouré.',['Une coupure','La lame du couteau','La cuisinière'],1,'La lame du couteau peut couper. La coupure est le dommage possible ; la cuisinière est l’opératrice.'),
 question('cuisine','four','Choisir le danger dans cette scène.',['Une brûlure','Sortir un plat du four','La plaque du four chaud'],2,'La plaque chaude est le danger. Sortir le plat est une activité ; la brûlure est un dommage possible.')
 ].map(function(q){q.bonne=+q.bonne;return q;});}
 function suivi(){var e=D.seance('s1');var ch=e.chasses||{};return '<details class="danger-traces"><summary>Voir mon parcours de repérage</summary>'+t('h2','Mon parcours de repérage')+Object.keys(ch).map(function(id){var c=ch[id],n=Object.keys(c.nommes||c.valides||{}).length,essais=Object.values(c.essais||{}).reduce(function(a,b){return a+b;},0);var scene=CDO_CHASSES.find(function(s){return s.id===id;});var titre=scene?scene.titre.replace(/^\d+ · /,''):id;return t('p',titre+' : '+n+' dangers nommés ; '+essais+' réponses ; '+(c.indices||0)+' indice(s) utilisé(s) ; '+(c.ecoutes||0)+' écoute(s) demandée(s).');}).join('')+(e.versionEpreuveDanger===V&&e.evaluation?t('p','Épreuve Identifier les dangers : '+e.evaluation.note+' sur 20. '+(e.tentatives||1)+' tentative(s).'):'')+'</details>';}
 function rendre(host,s,e){
  var evalData={questions:questions()};
  host.addEventListener('cdo-ecoute',function(ev){e.journalEpreuveDanger=e.journalEpreuveDanger||[];var draft=e.epreuveDangerEnCours;e.journalEpreuveDanger.push({date:new Date().toISOString(),action:'demande_ecoute',session:draft?draft.debut:null,index:draft?draft.index:null,texte:ev.detail.texte});D.enregistrer();});
  function entree(){host.innerHTML='<section class="danger-portail"><div class="danger-sceau">ÉPREUVE INDIVIDUELLE</div>'+t('h1','Identifier les dangers')+t('p','Cinq questions illustrées. Une seule réponse par question. Note sur 20.')+t('p','La correction est présentée après les cinq questions. L’écoute reste disponible.')+
   (e.versionEpreuveDanger===V&&e.evaluation?t('p','Meilleure note : '+e.evaluation.note+' sur 20.'):'')+
   '<button type="button" class="cdo-btn" data-danger-demarrer>'+ (e.epreuveDangerEnCours?'Reprendre l’épreuve':e.versionEpreuveDanger===V&&e.evaluation?'Refaire l’épreuve':'Commencer l’épreuve')+'</button><a class="cdo-btn-second" href="#seance/s1/2">Poursuivre les exercices</a></section>'+suivi();}
  entree();
  host.onclick=function(ev){if(ev.target.closest('.cdo-son'))return;if(!ev.target.closest('[data-danger-demarrer]'))return;host.onclick=null;
   var draft=e.epreuveDangerEnCours;if(!draft||draft.version!==V){draft=e.epreuveDangerEnCours={version:V,index:0,reponses:{},debut:new Date().toISOString()};}
   e.journalEpreuveDanger=e.journalEpreuveDanger||[];e.journalEpreuveDanger.push({action:'ouverture',session:draft.debut,date:new Date().toISOString()});D.enregistrer();
   host.innerHTML='<div class="danger-sceau">ÉPREUVE INDIVIDUELLE · IDENTIFIER LES DANGERS</div><div class="danger-questions"></div>';
   CDO_EVAL.lancer(host.querySelector('.danger-questions'),JSON.parse(JSON.stringify(evalData)),function(r){
    r.versionEpreuve=V;
    if(e.versionEpreuveDanger!==V){if(e.evaluation){e.archivesEvaluations=e.archivesEvaluations||[];e.archivesEvaluations.push({evaluation:e.evaluation,premiereNote:e.premiereNote,tentatives:e.tentatives,archiveLe:new Date().toISOString()});}delete e.evaluation;delete e.premiereNote;delete e.tentatives;}
    e.versionEpreuveDanger=V;e.historiqueEpreuveDanger=e.historiqueEpreuveDanger||[];e.historiqueEpreuveDanger.push(r);delete e.epreuveDangerEnCours;D.noter(s,r);D.enregistrer();
    host.insertAdjacentHTML('beforeend','<div class="danger-sortie"><a class="cdo-btn-second" href="#seance/s1/2">Revenir aux exercices</a><a class="cdo-btn" href="#moi">Voir mon parcours</a></div>');
   },{reprise:draft,suivi:function(info){e.epreuveDangerEnCours=Object.assign({},e.epreuveDangerEnCours,info);e.journalEpreuveDanger.push({date:info.date,action:info.action,session:draft.debut,index:info.index,reponses:info.reponses});D.enregistrer();},apresAffichage:function(box,index){var q=evalData.questions[index],img=box.querySelector('.cdo-fig img');if(!img)return;var z=q.zone,crop=document.createElement('div');crop.className='danger-cadrage';crop.style.aspectRatio=(z.w/z.h)*(1672/941);img.parentNode.insertBefore(crop,img);crop.appendChild(img);img.style.cssText='position:absolute;width:'+(10000/z.w)+'%;max-width:none;left:'+(-(z.x-z.w/2)*100/z.w)+'%;top:'+(-(z.y-z.h/2)*100/z.h)+'%;height:auto';}});
  };
 }
 window.CDO_EPREUVE_DANGER={rendre:rendre,suivi:suivi,questions:questions,terminee:function(e){return !!(e&&e.versionEpreuveDanger===V&&e.evaluation);}};
})();
