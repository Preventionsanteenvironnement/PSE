/* Mon tableau — générateurs de grilles.
   Aucun accès au DOM ici : pur calcul, testable seul. */
(function(g){
'use strict';

const sansAccent=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const normalise=s=>sansAccent(s).toUpperCase().replace(/[^A-Z]/g,'');

/* ---------- Mots croisés ----------
   Placement par croisements successifs. Le premier mot part à l'horizontale,
   chaque mot suivant cherche une lettre commune avec la grille déjà posée. */
function motsCroises(entrees,options){
  const opt=Object.assign({essais:60},options||{});
  const mots=(entrees||[]).map(e=>({mot:normalise(e.mot),def:String(e.def||'').trim()}))
    .filter(e=>e.mot.length>1&&e.mot.length<=18);
  if(!mots.length)return null;
  let meilleur=null;
  for(let essai=0;essai<opt.essais;essai++){
    const liste=melange(mots.slice(),essai).sort((a,b)=>b.mot.length-a.mot.length);
    const g=poser(liste);
    if(g&&(!meilleur||g.places.length>meilleur.places.length||
      (g.places.length===meilleur.places.length&&aire(g)<aire(meilleur))))meilleur=g;
    if(meilleur&&meilleur.places.length===mots.length&&essai>12)break;
  }
  return meilleur?finaliser(meilleur):null;
}
function aire(g){return (g.max.x-g.min.x+1)*(g.max.y-g.min.y+1);}
function melange(a,graine){let s=graine*9301+49297;const r=()=>((s=(s*9301+49297)%233280)/233280);
  for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function poser(liste){
  const cases=new Map();               // "x,y" -> lettre
  const places=[];                     // {mot,def,x,y,dir}
  const cle=(x,y)=>x+','+y;
  function libre(x,y){return !cases.has(cle(x,y));}
  function lettre(x,y){return cases.get(cle(x,y))||null;}
  function possible(mot,x,y,dir){
    const dx=dir==='h'?1:0, dy=dir==='h'?0:1;
    let croise=0;
    // pas de mot collé bout à bout
    if(!libre(x-dx,y-dy)||!libre(x+dx*mot.length,y+dy*mot.length))return -1;
    for(let i=0;i<mot.length;i++){
      const cx=x+dx*i, cy=y+dy*i, l=lettre(cx,cy);
      if(l){ if(l!==mot[i])return -1; croise++; continue; }
      // pas de contact latéral avec un autre mot
      if(dir==='h'){ if(lettre(cx,cy-1)||lettre(cx,cy+1))return -1; }
      else { if(lettre(cx-1,cy)||lettre(cx+1,cy))return -1; }
    }
    return croise;
  }
  function ecrire(e,x,y,dir){
    const dx=dir==='h'?1:0, dy=dir==='h'?0:1;
    for(let i=0;i<e.mot.length;i++)cases.set(cle(x+dx*i,y+dy*i),e.mot[i]);
    places.push({mot:e.mot,def:e.def,x,y,dir});
  }
  ecrire(liste[0],0,0,'h');
  for(let n=1;n<liste.length;n++){
    const e=liste[n]; let best=null;
    for(const p of places){
      const dir=p.dir==='h'?'v':'h';
      for(let i=0;i<p.mot.length;i++){
        const l=p.mot[i];
        for(let j=0;j<e.mot.length;j++){
          if(e.mot[j]!==l)continue;
          const cx=p.dir==='h'?p.x+i:p.x, cy=p.dir==='h'?p.y:p.y+i;
          const x=dir==='h'?cx-j:cx, y=dir==='h'?cy:cy-j;
          const sc=possible(e.mot,x,y,dir);
          if(sc>0&&(!best||sc>best.sc))best={x,y,dir,sc};
        }
      }
    }
    if(best)ecrire(e,best.x,best.y,best.dir);
  }
  if(places.length<2)return null;
  let min={x:1e9,y:1e9},max={x:-1e9,y:-1e9};
  for(const k of cases.keys()){const[a,b]=k.split(',').map(Number);
    min.x=Math.min(min.x,a);min.y=Math.min(min.y,b);max.x=Math.max(max.x,a);max.y=Math.max(max.y,b);}
  return {cases,places,min,max};
}
function finaliser(g){
  const w=g.max.x-g.min.x+1, h=g.max.y-g.min.y+1;
  const places=g.places.map(p=>({mot:p.mot,def:p.def,x:p.x-g.min.x,y:p.y-g.min.y,dir:p.dir}))
    .sort((a,b)=>a.y-b.y||a.x-b.x);
  // numérotation des départs
  const num=new Map(); let n=0;
  for(const p of places){const k=p.x+','+p.y;if(!num.has(k))num.set(k,++n);p.num=num.get(k);}
  const grille=[];
  for(let y=0;y<h;y++){const ligne=[];for(let x=0;x<w;x++){
    const l=g.cases.get((x+g.min.x)+','+(y+g.min.y))||null;
    ligne.push(l?{l,num:num.get(x+','+y)||0}:null);}grille.push(ligne);}
  return {w,h,grille,places};
}

/* ---------- Mots mêlés ---------- */
const DIRS=[[1,0],[0,1],[1,1],[-1,1],[-1,0],[0,-1],[-1,-1],[1,-1]];
function motsMeles(mots,taille,diagonales,graine){
  const liste=(mots||[]).map(normalise).filter(m=>m.length>1);
  if(!liste.length)return null;
  const n=Math.max(taille||0,Math.max(8,...liste.map(m=>m.length))+1);
  let s=(graine||1)*7919;const r=()=>((s=(s*9301+49297)%233280)/233280);
  const dirs=diagonales?DIRS:DIRS.filter(d=>d[0]===0||d[1]===0);
  const g=Array.from({length:n},()=>Array(n).fill(null));
  const poses=[],nonPlaces=[];   /* [LOT-F 05/10/2026] mots qu'on n'a pas pu poser : rendus, pour le dire au professeur */
  for(const mot of liste){
    let ok=false;
    for(let t=0;t<400&&!ok;t++){
      const d=dirs[Math.floor(r()*dirs.length)];
      const x=Math.floor(r()*n), y=Math.floor(r()*n);
      const fx=x+d[0]*(mot.length-1), fy=y+d[1]*(mot.length-1);
      if(fx<0||fy<0||fx>=n||fy>=n)continue;
      let bon=true;
      for(let i=0;i<mot.length;i++){const c=g[y+d[1]*i][x+d[0]*i];if(c&&c!==mot[i]){bon=false;break;}}
      if(!bon)continue;
      for(let i=0;i<mot.length;i++)g[y+d[1]*i][x+d[0]*i]=mot[i];
      poses.push({mot,x,y,dx:d[0],dy:d[1]});ok=true;
    }
    if(!ok)nonPlaces.push(mot);
  }
  const A='AEIOURSTLNMPCDBFGHJKVZ';
  for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(!g[y][x])g[y][x]=A[Math.floor(r()*A.length)];
  return {n,grille:g,mots:poses,nonPlaces};
}

g.PSE_GEN={motsCroises,motsMeles,normalise};
})(typeof window!=='undefined'?window:globalThis);
if(typeof module!=='undefined')module.exports=(typeof window!=='undefined'?window:globalThis).PSE_GEN;
