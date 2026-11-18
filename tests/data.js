// Controle van de vragenbank en de studiestof (zonder browser).
// Gebruik: node tests/data.js   → print "N problemen" en stopt met code 1 bij fouten.
const fs=require('fs'),path=require('path');
const B=f=>fs.readFileSync(path.resolve(__dirname,'../bron',f),'utf8');
const body=B('v2_body.html');
const cfg=body.slice(body.indexOf('const CATS ='),body.indexOf('const MODBY'));
const src=['q1.js','q2.js','q3.js','q4.js','q5.js','q6.js','q7.js','q8.js','q9.js','stof.js','matrijs.js'].map(B).join('\n')+'\n'+cfg+
  ';return {Q:[].concat(Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9),CATS,MODS,D4,STOF,STOF_CAT,STOF_ART,MATRIJS}';
const {Q,CATS,MODS,STOF,STOF_CAT,STOF_ART,MATRIJS}=new Function(src)();
const bad=[],warn=[];
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return "q"+(h>>>0).toString(36)}
const ids=new Map(),teksten=new Map();const perCat={};
const ABS=/\b(altijd|nooit|alles|iedereen|elke|elk|geen enkele|uitsluitend|zonder meer|in alle gevallen|onbeperkt)\b/i;let absN=0;
Q.forEach((r,i)=>{
  const at=`vraag #${i} (${String(r[1]).slice(0,50)})`;
  if(!Array.isArray(r)||r.length<4){bad.push(at+': verkeerd formaat');return}
  const [c,q,o,e]=r;
  if(!CATS[c])bad.push(at+': onbekende categorie '+c);
  if(!q||!q.trim())bad.push(at+': lege vraag');
  if(!e||e.trim().length<10)bad.push(at+': uitleg ontbreekt');
  // 4 antwoorden, of 3 bij vragen in examenstijl van ExTH (bron/q9.js)
  if(!Array.isArray(o)||!(o.length===4||(o.length===3&&String(r[5]).startsWith('qx9'))))bad.push(at+': niet precies 4 antwoorden (of 3 in examenstijl)');
  else{const n=o.map(x=>String(x).trim().toLowerCase());if(n.some(x=>!x))bad.push(at+': leeg antwoord');if(new Set(n).size!==o.length)bad.push(at+': dubbel antwoord')}
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
  if(!r[4]||!String(r[4]).trim())bad.push(at+': bron ontbreekt (wetsartikel of document, zie de schrijfwijzer)');
  // afleiders: woorden als 'altijd' of 'nooit' alleen in foute antwoorden verraden het juiste antwoord
  if(Array.isArray(o)&&!ABS.test(o[0])&&o.slice(1).some(x=>ABS.test(x)))absN++;
  perCat[c]=(perCat[c]||0)+1;
});
for(const c of Object.keys(CATS)){if(!perCat[c])bad.push('categorie zonder vragen: '+c);else if(perCat[c]<10)bad.push(`categorie ${c} heeft maar ${perCat[c]} vragen (minimaal 10)`);else if(perCat[c]<12)warn.push(`categorie ${c} heeft maar ${perCat[c]} vragen`)}
if(absN/Q.length>.18)bad.push(`afleiders: bij ${absN} van de ${Q.length} vragen staat 'altijd', 'nooit' of 'elke' alleen in een fout antwoord (maximaal 18%)`);else console.log(`        afleiders met 'altijd'/'nooit' alleen in foute antwoorden: ${Math.round(100*absN/Q.length)}% van de vragen`);
for(const m of MODS)for(const b of (m.blocks||[]).concat(m.blocks4||[]))for(const c of b[2])if(!CATS[c])bad.push(`blok ${m.id}/${b[0]}: onbekende categorie ${c}`);
const sids=new Set();for(const s of STOF){if(sids.has(s.id))bad.push('studiestof dubbel id '+s.id);sids.add(s.id);if(!s.html||s.html.length<80)bad.push('studiestof te kort: '+s.id)}
for(const [c,s] of Object.entries(STOF_CAT)){if(!CATS[c])warn.push('STOF_CAT: onbekende categorie '+c);if(!sids.has(s))bad.push(`STOF_CAT ${c} → onbekend onderwerp ${s}`)}
for(const a of STOF_ART)if(!sids.has(a[1]))bad.push('STOF_ART → onbekend onderwerp '+a[1]);
// toetsmatrijzen: 50 vragen per domein, elke toetsterm heeft genoeg vragen, alle codes bestaan
const alleIds=new Set(Q.map(r=>r[5]));
for(const [d,M] of Object.entries(MATRIJS)){let tot=0;const gezien=new Set();
  for(const [,,gs] of M.delen)for(const [code,lab,n,lijst] of gs){tot+=n;
    lijst.forEach(id=>{if(!alleIds.has(id))bad.push(`matrijs ${d} ${code}: onbekende vraagcode ${id}`)});
    const echt=lijst.filter(id=>alleIds.has(id)).length;if(echt<n)bad.push(`matrijs ${d} ${code} (${lab}): ${echt} vragen, examen vraagt er ${n}`);else if(echt<2*n)warn.push(`matrijs ${d} ${code}: maar ${echt} vragen voor ${n} examenvragen`);
    if(gezien.has(code))bad.push(`matrijs ${d}: code ${code} dubbel`);gezien.add(code)}
  if(tot!==50)bad.push(`matrijs ${d}: ${tot} examenvragen in plaats van 50`)}
// lengte-hint: hoe vaak is het juiste antwoord het langste?
const pos=[0,0,0,0];Q.forEach(r=>{const s=r[2].map((x,k)=>[x.length,k]).sort((a,b)=>b[0]-a[0]||a[1]-b[1]);pos[s.findIndex(x=>x[1]===0)]++});
const longest=pos[0]/Q.length;
if(longest>0.35)bad.push(`juiste antwoord is in ${Math.round(longest*100)}% van de vragen het langste (max 35%)`);
console.log(`vragen: ${Q.length}, categorieën: ${Object.keys(perCat).length}, studiestof: ${STOF.length} onderwerpen`);
console.log(`juiste antwoord langste/2e/3e/kortste: ${pos.map(n=>Math.round(n/Q.length*100)+'%').join(' / ')}`);
warn.forEach(w=>console.log('let op '+w));bad.forEach(b=>console.log('FAIL '+b));
console.log(`\n${bad.length} problemen`);process.exit(bad.length?1:0);
