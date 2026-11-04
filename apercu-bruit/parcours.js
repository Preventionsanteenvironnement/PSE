'use strict';
const pic = (id, mot) => ({ image: id + '.png', mot });
const machine = {image:'atelier.jpg', mot:'Ponceuse'}, musique = pic(38216, 'Son fort');
const oreille = pic(2871, 'Oreille'), sifflement = pic(7157, 'Sifflement');
const casque = pic(36357, 'Casque antibruit'), volume = pic(38215, 'Son faible');
const pause = pic(38213, 'Pause'), concert = pic(11584, 'Concert');
const calme = pic(5936, 'Au calme'), sommeil = pic(31276, 'Sommeil');
const montre = (titre, consigne, image) => ({titre, consigne, image});
const choix = (titre, consigne, image, cartes, bonne, retour) =>
  ({titre, consigne, image, cartes, bonne, retour});
const ordre = (titre, consigne, cartes, suite, retour) =>
  ({titre, consigne, cartes, suite, retour});
const faible = { mot: 'Faible', jauge: '▂' }, fort = { mot: 'Fort', jauge: '▂▅█' };
const court = { mot: 'Peu longtemps', jauge: '●' }, long = { mot: 'Longtemps', jauge: '● ● ●' };
const atelier = {image:'atelier.jpg', mot:'Atelier de menuiserie'};
const schema = {image:'oreille.jpg', mot:'Coupe de l’oreille : le son entre par le pavillon, atteint le tympan puis l’oreille interne.'};

const parcours = [
  choix('Pour commencer', 'Toucher l’image de Yanis.', null, [atelier], 0, 'Bien. Toucher la flèche Suivant.'),
  choix('La source', 'Toucher la machine qui fait du bruit.', atelier, [sommeil,machine],1,'La machine en marche produit du bruit.'),
  {titre:'Puzzle', consigne:'Toucher une pièce. Puis toucher sa place.', image:atelier, puzzle:true},
  choix('Même image', 'Toucher la même image.', concert,[machine,concert,volume],1,'C’est la même scène de concert.'),
  choix('La source', 'Toucher l’image avec les enceintes.', concert,[concert,oreille],0,'L’enceinte diffuse la musique.'),
  montre('Le volume','Une jauge courte montre un son faible. Une jauge haute montre un son fort.',volume),
  choix('Son faible','Toucher la petite jauge.',musique,[faible,fort],0,'Le son est faible.'),
  choix('Son fort','Toucher la grande jauge.',musique,[faible,fort],1,'Le son est fort.'),
  ordre('Deux niveaux','Placer le son faible, puis le son fort.',[fort,faible],[1,0],'Faible, puis fort.'),
  montre('Une pause','On peut faire une pause. Toucher Suivant pour reprendre.',pause),
  montre('L’oreille','Le son arrive à l’oreille. Le tympan vibre. L’oreille interne transmet un message au cerveau.',schema),
  choix('Entendre','Toucher la partie du corps qui entend.',musique,[volume,oreille],1,'L’oreille permet d’entendre.'),
  ordre('Le trajet','Placer la machine, puis l’oreille.',[oreille,machine],[1,0],'Le son de la machine arrive à l’oreille.'),
  {...montre('Après le bruit','D’abord la ponceuse fait du bruit. Plus tard, même au calme, Yanis entend un sifflement dans ses oreilles.',oreille), avant: atelier},
  choix('L’effet','Toucher l’image du sifflement entendu par Yanis.',atelier,[casque,sifflement],1,'Un sifflement peut apparaître après un bruit fort.'),
  ordre('Trois images','Placer la machine, le son fort, puis le sifflement.',[sifflement,machine,fort],[1,2,0],'Le bruit fort peut avoir un effet sur les oreilles.'),
  choix('Dormir','Choisir ce que le bruit peut gêner le soir.',musique,[sommeil,casque],0,'Le bruit peut gêner le sommeil.'),
  montre('La durée','Pour protéger ses oreilles, il faut tenir compte du volume et du temps passé dans le bruit.',pause),
  choix('Écouter moins','Toucher la durée la plus courte.',musique,[long,court],1,'Écouter moins longtemps réduit l’exposition.'),
  ordre('La durée','Placer la durée courte, puis la durée longue.',[long,court],[1,0],'Peu longtemps, puis longtemps.'),
  choix('Baisser','Toucher la jauge du son faible.',volume,[fort,faible],1,'Baisser le volume réduit le bruit.'),
  choix('Faire pause','Choisir comment écouter moins longtemps.',musique,[pause,fort],0,'Faire une pause réduit le temps d’écoute.'),
  choix('S’éloigner','Toucher l’image de l’endroit calme.',concert,[concert,calme],1,'S’éloigner des enceintes permet de faire une pause au calme.'),
  choix('Se protéger','Toucher ce qui protège les oreilles.',atelier,[volume,casque],1,'Le casque antibruit protège les oreilles.'),
  montre('Pour tous','Isoler la machine dans un local adapté réduit le bruit pour les personnes qui travaillent à côté.',atelier),
  ordre('Se protéger','Placer la machine, puis la protection des oreilles.',[casque,machine],[1,0],'Dans cet atelier, le casque antibruit protège les oreilles.'),
  montre('Une pause','On peut faire une pause avant les dernières activités.',pause),
  choix('À vérifier','Toucher l’image avec les enceintes.',concert,[oreille,concert,sommeil],1,'Le son sort de l’enceinte.'),
  choix('À vérifier','Choisir un effet du bruit sur les oreilles.',atelier,[sifflement,volume],0,'Un sifflement peut être un effet du bruit.'),
  choix('À vérifier','Toucher la jauge du volume baissé.',musique,[fort,faible],1,'La petite jauge correspond à un volume plus faible.'),
  choix('À vérifier','Toucher la protection des oreilles.',atelier,[pause,casque,volume],1,'Le casque antibruit est la protection portée près de la machine.'),
  montre('Bilan','On a vu la source du bruit, ses effets et les gestes pour protéger ses oreilles.',casque)
];

const $ = id => document.getElementById(id);
const ecran = $('ecran');
const cle = 'coup-de-pouce-bruit-v1';
let memo = {};
try { memo = JSON.parse(localStorage.getItem(cle)) || {}; } catch {}
let index = Math.min(parcours.length-1,Math.max(0,Number(memo.index)||0));
let validations = memo.validations || {};
let muet = !!memo.muet;
let placees = [];
let selection = null;
const synth = window.speechSynthesis;
function sauver(){try{localStorage.setItem(cle,JSON.stringify({index,validations,muet}));}catch{}}
function stop(){synth?.cancel();}
function dire(texte){
  stop();
  if(muet || !synth || !texte) return;
  const voix = new SpeechSynthesisUtterance(texte);
  voix.lang = 'fr-FR';
  voix.rate = 0.88;
  synth.speak(voix);
}
function bouton(texte, action, classe, nom){
  const b=document.createElement('button');
  b.type='button'; b.textContent=texte;
  if(classe) b.className=classe;
  if(nom) b.setAttribute('aria-label',nom);
  b.onclick=action; return b;
}
function ecoute(texte){return bouton('🔊',()=>dire(texte),'son','Écouter : '+texte);}
function visuel(c){
  if(c.image){const img=new Image();img.src='images/'+c.image;img.alt=c.mot;return img;}
  const s=document.createElement('span');s.className='jauge';s.textContent=c.jauge;s.setAttribute('aria-hidden','true');return s;
}
function etat(ok, message){
  const zone=$('retour');
  zone.replaceChildren(document.createTextNode(ok?'✓ Validé':'↻ Réessayer'),ecoute(message));
  if(ok){validations[index]=true;sauver();}
  stop();
}
function rendu(focus=true){
  stop();
  const a=parcours[index];
  ecran.replaceChildren();
  $('retour').textContent=validations[index]?'✓ Validé':'';
  const h=document.createElement('h2');h.id='titre';h.tabIndex=-1;h.textContent=a.titre;
  const guide=document.createElement('p');
  guide.className='guide-action';
  guide.setAttribute('aria-live','polite');
  guide.textContent=a.puzzle?'☝ Choisir une pièce':a.suite?'☝ Choisir une carte':a.cartes?'☝ Toucher une image':'👁 Observer';
  if(index===0) guide.textContent='☝ Toucher l’image';
  if(a.titre==='Une pause') guide.textContent='Ⅱ Faire une pause';
  ecran.append(h);
  if(a.cartes || a.suite || a.puzzle){
    const consigne=document.createElement('p');
    consigne.className='consigne-visible';
    consigne.textContent=a.consigne;
    ecran.append(consigne);
  }
  ecran.append(guide);
  $('ecouter').setAttribute('aria-label','Écouter la consigne');
  if(a.image && !a.puzzle){
    const f=document.createElement('figure');
    if(a.avant){f.className='sequence';f.append(visuel(a.avant),document.createTextNode(' → '));}
    f.append(visuel(a.image));ecran.append(f);
  }
  if(a.puzzle && placees[0]==null) placees[0]=1;
  const cartes=a.puzzle?[2,0,1].map(n=>({mot:'Pièce '+(n+1),piece:n})):a.cartes;
  if(cartes){
    const ligne=document.createElement('div');ligne.className='cartes';
    const suite=a.puzzle?[1,2,0]:a.suite;
    function placer(slot,k){
      if(placees[slot]!=null) return;
      if(k!==suite[slot]){etat(false,'Essayer une autre place.');return;}
      placees[slot]=k; selection=null;
      const termine=suite.every((_,i)=>placees[i]!=null);
      rendu(false);
      etat(termine,termine?(a.retour||'Le puzzle est complet.'):'Pièce placée. Continuer.');
      if(!termine) $('retour').firstChild.textContent='✓ Placé';
      else ecran.querySelector('.guide-action').textContent='→ Toucher Suivant';
      ecran.querySelector('[data-piece]:not(:disabled)')?.focus({preventScroll:true});
    }
    function contenu(c){
      if(c.piece==null) return visuel(c);
      const morceau=document.createElement('span');morceau.className='piece';
      morceau.style.backgroundImage='url(images/atelier.jpg)';
      morceau.style.backgroundPosition=(c.piece*50)+'% center';
      return morceau;
    }
    cartes.forEach((c,k)=>{
      const carte=document.createElement('div');carte.className='carte';
      const b=bouton(c.mot,()=>{
        if(suite){selection=k;guide.textContent='↓ Toucher une case';ligne.querySelectorAll('[data-piece]').forEach(x=>{x.classList.toggle('actif',+x.dataset.piece===k);x.setAttribute('aria-pressed',String(+x.dataset.piece===k));});}
        else {
          const juste=k===a.bonne;
          guide.textContent=juste?'→ Toucher Suivant':'☝ Réessayer';
          etat(juste,juste?a.retour:(index===1?'Regarder l’outil jaune.':'Regarder la carte entourée.'));
          ligne.querySelector('[data-piece="'+a.bonne+'"]').classList.toggle('indice',!juste && index!==1);
          if(index===1) ecran.querySelector('figure').classList.toggle('indice-ponceuse',!juste);
        }
      },null,c.mot);
      b.prepend(contenu(c)); b.dataset.piece=k;
      if(suite){
        b.setAttribute('aria-pressed',String(selection===k)); b.classList.toggle('actif',selection===k);
        b.disabled=placees.includes(k);b.draggable=!b.disabled;
        b.ondragstart=ev=>ev.dataTransfer.setData('text/plain',String(k));
      }
      if(a.puzzle && placees.includes(k)) return;
      carte.append(b);
      if(!a.puzzle && index!==0) carte.append(ecoute(c.mot));
      ligne.append(carte);
    });
    ecran.append(ligne);
    if(suite){
      const cases=document.createElement('div');cases.className=a.puzzle?'cases plateau':'cases';
      suite.forEach((_,slot)=>{
        const k=placees[slot];
        const b=bouton(k==null?String(slot+1):'✓',()=>{if(selection!=null)placer(slot,selection);},null,'Place '+(slot+1));
        if(k!=null){b.prepend(contenu(cartes[k]));b.disabled=true;}
        else if(a.puzzle){
          const guide=contenu(cartes[suite[slot]]);
          guide.classList.add('fantome');b.prepend(guide);
        }
        b.ondragover=ev=>ev.preventDefault();
        b.ondrop=ev=>{ev.preventDefault();const v=ev.dataTransfer.getData('text/plain');if(/^\d+$/.test(v))placer(slot,Number(v));};
        cases.append(b);
      });
      if(a.puzzle) ecran.insertBefore(cases,ligne);
      else ecran.append(cases);
    }
  }
  $('position').textContent=(index+1)+' / '+parcours.length;
  $('progression').max=parcours.length;$('progression').value=index+1;
  $('avant').disabled=index===0;
  $('passer').disabled=index===parcours.length-1;
  $('suivant').textContent=index===parcours.length-1?'Recommencer':'Suivant →';
  if(focus) h.focus({preventScroll:true});
}
function aller(n){index=n;selection=null;placees=[];sauver();rendu();window.scrollTo(0,0);}
$('avant').onclick=()=>aller(index-1);
$('passer').onclick=()=>aller(index+1);
$('suivant').onclick=()=>aller((index+1)%parcours.length);
$('ecouter').onclick=()=>{
  const a=parcours[index];
  if(selection!=null && (a.puzzle || a.suite)) dire('Toucher une case pour poser la carte.');
  else dire(a.consigne);
};
$('stop').onclick=stop;
function mode(){ $('muet').textContent='Audio : '+(muet?'non':'oui');$('muet').setAttribute('aria-pressed',String(muet));}
$('muet').onclick=()=>{stop();muet=!muet;mode();sauver();};
window.addEventListener('pagehide',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
mode();rendu(false);
