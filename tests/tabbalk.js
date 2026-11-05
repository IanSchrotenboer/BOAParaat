// Proefversie met rustigere tabbalk (uit/Boa-Paraat-proef.html): variant B (Overzicht, Oefenen, Studiestof,
// Profiel) en C (plus Fouten met teller), te kiezen in Profiel; modules als knoppen bovenaan elke module.
// Daarna een controle dat de gewone app de oude tabbalk houdt.
const fs=require('fs'),path=require('path'),os=require('os');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const UIT=path.resolve(__dirname,'../uit');
const kopie=(n,src)=>{const K=path.join(os.tmpdir(),n);fs.writeFileSync(K,fs.readFileSync(path.join(UIT,src),'utf8').replace(/const CLOUD=(null|\{[^;]*\});/,'const CLOUD=null;'));return 'file://'+K};
const PROEF=kopie('boa-tabbalk-proef.html','Boa-Paraat-proef.html'),GEWOON=kopie('boa-tabbalk-gewoon.html','Boa-Paraat.html');
const PROFIEL={naam:'Sam de Vries',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}};
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(350)};
const tabs=p=>p.evaluate(()=>[...document.querySelectorAll('#tabbar a')].map(a=>({id:a.dataset.tab,l:a.textContent.trim(),h:a.getAttribute('href'),cur:a.getAttribute('aria-current')==='page',al:a.getAttribute('aria-label')})));
const cur=async p=>((await tabs(p)).find(x=>x.cur)||{}).id;
const pastAlles=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#tabbar a')].every(a=>a.scrollWidth<=a.clientWidth+1));
async function open(b,url,opts){const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},isMobile:true,hasTouch:true},opts||{}));const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(url+'#home');await p.evaluate(pr=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:pr})),PROFIEL);await p.reload();await w(400);return p}
(async()=>{
  const b=await chromium.launch();
  // ---------- B (standaard) ----------
  let p=await open(b,PROEF);
  let tb=await tabs(p);
  t(tb.map(x=>x.l).join()==='Overzicht,Oefenen,Studiestof,Profiel','B: vier tabbladen: Overzicht, Oefenen, Studiestof, Profiel');
  t(await pastAlles(p)&&await p.locator('#profBtn').isHidden(),'B: alles past; geen dubbele profielknop bovenin (Profiel staat in de tabbalk)');
  t(tb.find(x=>x.id==='oef').h==='#phb1','Oefenen opent de eerste keer PHB 1');
  await p.click('#tabbar a[data-tab="oef"]');await w(400);
  const chips=await p.evaluate(()=>[...document.querySelectorAll('#app .modrow a')].map(a=>a.textContent.trim()+(a.getAttribute('aria-current')?'*':'')));
  t(chips.join()==='PHB 1*,PHB 2,PHB 3,PHB 4,RTGB'&&await cur(p)==='oef','module: knoppen voor alle modules bovenaan, PHB 1 gemarkeerd, tab Oefenen actief');
  t(await p.locator('#app .modrow a[href="#rtgb"] .slotje').count()===1,'module op slot (betaalmuur): slotje op de knop');
  await p.click('#app .modrow a[href="#phb2"]');await w(400);
  t((await p.evaluate(()=>location.hash))==='#phb2'&&await cur(p)==='oef'&&(await tabs(p)).find(x=>x.id==='oef').h==='#phb2','knop PHB 2: naar PHB 2; Oefenen onthoudt de laatste module');
  await ga(p,'home');await ga(p,'stof');t(await cur(p)==='stof','studiestof: tab Studiestof actief');
  await ga(p,'profiel-fouten');t(await cur(p)==='profiel','B: foutenanalyse valt onder Profiel');
  await ga(p,'profiel');t(await p.locator('[data-act="balk"]').count()===2&&await p.getAttribute('[data-act="balk"][data-v="b"]','aria-pressed')==='true','Profiel: keuze tabbalk B of C, B staat aan');
  // ---------- C ----------
  await p.click('[data-act="balk"][data-v="c"]');await w(300);
  tb=await tabs(p);
  t(tb.map(x=>x.l).join()==='Overzicht,Oefenen,Fouten,Stof,Profiel'&&(await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).p.balk))==='c','C: vijf tabbladen met Fouten, keuze bewaard');
  t(!(await p.locator('#tabbar .bbdg').count())&&tb.find(x=>x.id==='fouten').al==='Fouten','C: zonder open fouten geen teller');
  // drie fouten maken in PHB 1
  await ga(p,'phb1');await p.click('#app .cat [data-act="oefen"][data-cat="sr"]');await w(300);
  for(let i=0;i<3;i++){const o=await p.evaluate(()=>[...document.querySelectorAll('.opt')].map(x=>x.dataset.o));await p.locator('.opt').nth((o.indexOf('0')+1)%4).click();await w(80);const nx=p.locator('[data-act="next"]');if(await nx.count())await nx.first().click();await w(80)}
  t(await p.locator('#tabbar').isHidden(),'tijdens het oefenen geen tabbalk');
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(300);
  await ga(p,'home');
  t((await p.textContent('#tabbar .bbdg'))==='3'&&(await tabs(p)).find(x=>x.id==='fouten').al==='Fouten, 3 open','C: teller met het aantal open fouten (ook voor de schermlezer)');
  await p.click('#tabbar a[data-tab="fouten"]');await w(400);
  t((await p.evaluate(()=>location.hash))==='#fouten'&&await cur(p)==='fouten'&&/Foutenanalyse/.test(await p.textContent('#app')),'C: tab Fouten opent de foutenanalyse');
  await ga(p,'profiel');t(await cur(p)==='profiel','C: Profiel apart');
  // schermbreedtes
  for(const [bw,bh] of [[360,780],[320,640],[280,653]]){await p.setViewportSize({width:bw,height:bh});await ga(p,'phb1');t(await pastAlles(p),bw+' breed: tabbalk en knoppen passen, geen horizontale scroll')}
  await p.setViewportSize({width:260,height:512});await ga(p,'home');
  t(await p.evaluate(()=>[...document.querySelectorAll('#tabbar a')].every(a=>parseFloat(getComputedStyle(a).fontSize)===0&&a.getAttribute('aria-label'))),'klein buitenscherm (Flip): alleen pictogrammen, met namen voor de schermlezer');
  t(!p._errs.length,'telefoon: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // ---------- pc ----------
  p=await open(b,PROEF,{viewport:{width:1280,height:800},isMobile:false,hasTouch:false});
  await ga(p,'phb1');
  t(await p.locator('#app .modrow').isHidden()&&await p.locator('#topnav a[href="#phb3"]').count()===1&&await p.locator('#profBtn').isVisible(),'pc: bovenbalk met alle modules en profielknop, geen knoppenrij');
  t(!p._errs.length,'pc: geen JS-fouten');await p.context().close();
  // ---------- gewone app ----------
  p=await open(b,GEWOON);
  t((await tabs(p)).length===7&&!(await p.locator('.modrow').count())&&!(await p.evaluate(()=>document.documentElement.hasAttribute('data-balk'))),'gewone app: de bekende tabbalk met zeven tabbladen');
  await ga(p,'profiel');t(!(await p.locator('[data-act="balk"]').count()),'gewone app: geen keuze voor de tabbalk');
  t(!p._errs.length,'gewone app: geen JS-fouten');
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
