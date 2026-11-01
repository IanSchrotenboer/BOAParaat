// Controle van de vragenbank en de studiestof (zonder browser).
// Gebruik: node tests/data.js   → print "N problemen" en stopt met code 1 bij fouten.
const fs=require('fs'),path=require('path');
const B=f=>fs.readFileSync(path.resolve(__dirname,'../bron',f),'utf8');
const body=B('v2_body.html');
const cfg=body.slice(body.indexOf('const CATS ='),body.indexOf('const MODBY'));
const src=['q1.js','q2.js','q3.js','q4.js','q5.js','q6.js','stof.js'].map(B).join('\n')+'\n'+cfg+
  ';return {Q:[].concat(Q1,Q2,Q3,Q4,Q5,Q6),CATS,MODS,D4,STOF,STOF_CAT,STOF_ART}';
const {Q,CATS,MODS,STOF,STOF_CAT,STOF_ART}=new Function(src)();
const bad=[],warn=[];
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return "q"+(h>>>0).toString(36)}
const ids=new Map(),teksten=new Map();const perCat={};
Q.forEach((r,i)=>{
  const at=`vraag #${i} (${String(r[1]).slice(0,50)})`;
  if(!Array.isArray(r)||r.length<4){bad.push(at+': verkeerd formaat');return}
  const [c,q,o,e]=r;
  if(!CATS[c])bad.push(at+': onbekende categorie '+c);
  if(!q||!q.trim())bad.push(at+': lege vraag');
  if(!e||e.trim().length<10)bad.push(at+': uitleg ontbreekt');
  if(!Array.isArray(o)||o.length!==4)bad.push(at+': niet precies 4 antwoorden');
  else{const n=o.map(x=>String(x).trim().toLowerCase());if(n.some(x=>!x))bad.push(at+': leeg antwoord');if(new Set(n).size!==4)bad.push(at+': dubbel antwoord')}
  if(!r[5])bad.push(at+': vaste vraagcode (6e veld) ontbreekt; voortgang zou verloren gaan bij herschrijven');
  const h=r[5]||hash(q);if(ids.has(h))bad.push(at+': zelfde vraagcode als #'+ids.get(h));ids.set(h,i);
  if(teksten.has(q))bad.push(at+': zelfde vraagtekst als #'+teksten.get(q));teksten.set(q,i);
  // schrijfwijzer (bron/SCHRIJFWIJZER.md)
  if(!/\?$/.test(q.trim()))bad.push(at+': vraag eindigt niet met een vraagteken');
  if(/\b(art|max|bijv)\.\s|\bOvJ\b|\bpv\b/.test(q))bad.push(at+': afkorting in de vraag (schrijf voluit)');
  if(Array.isArray(o))o.forEach((x,k)=>{x=String(x);
    if(!/[.?!]['"’”]?$/.test(x))bad.push(at+`: antwoord ${k+1} eindigt niet met een punt`);
    if(/^[a-zà-ÿ]/.test(x))bad.push(at+`: antwoord ${k+1} begint niet met een hoofdletter`);
    if(/\b(art|max|bijv)\.\s|\bOvJ\b|\bpv\b/.test(x))bad.push(at+`: afkorting in antwoord ${k+1} (schrijf voluit)`)});
  if(/\b(OvJ|hulpOvJ|RC|pv|OM|CdK|PG|WID)\b|\bpv's/.test(String(e)+' '+String(r[4]||'')))bad.push(at+': afkorting in de uitleg of bron (schrijf voluit)');
  perCat[c]=(perCat[c]||0)+1;
});
for(const c of Object.keys(CATS)){if(!perCat[c])bad.push('categorie zonder vragen: '+c);else if(perCat[c]<10)warn.push(`categorie ${c} heeft maar ${perCat[c]} vragen`)}
for(const m of MODS)for(const b of m.blocks||[])for(const c of b[2])if(!CATS[c])bad.push(`blok ${m.id}/${b[0]}: onbekende categorie ${c}`);
const sids=new Set();for(const s of STOF){if(sids.has(s.id))bad.push('studiestof dubbel id '+s.id);sids.add(s.id);if(!s.html||s.html.length<80)bad.push('studiestof te kort: '+s.id)}
for(const [c,s] of Object.entries(STOF_CAT)){if(!CATS[c])warn.push('STOF_CAT: onbekende categorie '+c);if(!sids.has(s))bad.push(`STOF_CAT ${c} → onbekend onderwerp ${s}`)}
for(const a of STOF_ART)if(!sids.has(a[1]))bad.push('STOF_ART → onbekend onderwerp '+a[1]);
// lengte-hint: hoe vaak is het juiste antwoord het langste?
const pos=[0,0,0,0];Q.forEach(r=>{const s=r[2].map((x,k)=>[x.length,k]).sort((a,b)=>b[0]-a[0]||a[1]-b[1]);pos[s.findIndex(x=>x[1]===0)]++});
const longest=pos[0]/Q.length;
if(longest>0.35)bad.push(`juiste antwoord is in ${Math.round(longest*100)}% van de vragen het langste (max 35%)`);
console.log(`vragen: ${Q.length}, categorieën: ${Object.keys(perCat).length}, studiestof: ${STOF.length} onderwerpen`);
console.log(`juiste antwoord langste/2e/3e/kortste: ${pos.map(n=>Math.round(n/Q.length*100)+'%').join(' / ')}`);
warn.forEach(w=>console.log('let op '+w));bad.forEach(b=>console.log('FAIL '+b));
console.log(`\n${bad.length} problemen`);process.exit(bad.length?1:0);
