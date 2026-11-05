// Tabbalk op telefoon en tablet: Overzicht · Oefenen · Studiestof · Profiel. Oefenen opent de laatst gebruikte
// module; bovenaan elke module staan alle modules als knoppen. Op de pc de bovenbalk met alle modules.
const fs=require('fs'),path=require('path'),os=require('os');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const SRC=process.env.BOA_URL?decodeURIComponent(process.env.BOA_URL.replace(/^file:\/\//,'').split('#')[0]):path.resolve(__dirname,'../uit/Boa-Paraat.html');
const K=path.join(os.tmpdir(),'boa-tabbalk.html');fs.writeFileSync(K,fs.readFileSync(SRC,'utf8').replace(/const CLOUD=(null|\{[^;]*\});/,'const CLOUD=null;'));
const URL_='file://'+K;
const PROFIEL={naam:'Sam de Vries',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}};
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(350)};
const tabs=p=>p.evaluate(()=>[...document.querySelectorAll('#tabbar a')].map(a=>({id:a.dataset.tab,l:a.textContent.trim(),h:a.getAttribute('href'),cur:a.getAttribute('aria-current')==='page',al:a.getAttribute('aria-label')})));
const cur=async p=>((await tabs(p)).find(x=>x.cur)||{}).id;
const pastAlles=p=>p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&[...document.querySelectorAll('#tabbar a')].every(a=>a.scrollWidth<=a.clientWidth+1));
async function open(b,opts){const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},isMobile:true,hasTouch:true},opts||{}));const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(URL_+'#home');await p.evaluate(pr=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:pr})),PROFIEL);await p.reload();await w(400);return p}
(async()=>{
  const b=await chromium.launch();
  let p=await open(b);
  let tb=await tabs(p);
  t(tb.map(x=>x.l).join()==='Overzicht,Oefenen,Studiestof,Profiel'&&await cur(p)==='home','vier tabbladen: Overzicht, Oefenen, Studiestof, Profiel');
  t(await pastAlles(p)&&await p.locator('#profBtn').isHidden(),'alles past; geen dubbele profielknop bovenin (Profiel staat in de tabbalk)');
  t(tb.find(x=>x.id==='oef').h==='#phb1'&&tb.find(x=>x.id==='oef').al==='Oefenen: PHB 1','Oefenen opent de eerste keer PHB 1 (schermlezer noemt de module)');
  await p.click('#tabbar a[data-tab="oef"]');await w(400);
  const chips=await p.evaluate(()=>[...document.querySelectorAll('#app .modrow a')].map(a=>a.textContent.trim()+(a.getAttribute('aria-current')?'*':'')));
  t(chips.join()==='PHB 1*,PHB 2,PHB 3,PHB 4,RTGB'&&await cur(p)==='oef','module: knoppen voor alle modules bovenaan, PHB 1 gemarkeerd, tabblad Oefenen actief');
  await p.click('#app .modrow a[href="#rtgb"]');await w(400);
  t((await p.evaluate(()=>location.hash))==='#rtgb'&&await cur(p)==='oef'&&await p.evaluate(()=>{const a=document.querySelector('#app .modrow a[aria-current="page"]'),r=a.getBoundingClientRect();return a.textContent==='RTGB'&&r.right<=innerWidth+1&&r.left>=0}),'knop RTGB: naar RTGB, en die knop schuift in beeld');
  await ga(p,'home');tb=await tabs(p);t(tb.find(x=>x.id==='oef').h==='#rtgb','Oefenen onthoudt de laatst gebruikte module');
  await ga(p,'stof-boa');t(await cur(p)==='stof','studiestof: tabblad Studiestof actief');
  await ga(p,'fouten');t(await cur(p)==='profiel','foutenanalyse: tabblad Profiel actief');
  await ga(p,'profiel-examens');t(await cur(p)==='profiel','mijn examens: tabblad Profiel actief');
  await ga(p,'wv');t(await cur(p)==='oef','praktijkoefening: tabblad Oefenen actief');
  await ga(p,'phb1');await p.click('#app .cat [data-act="oefen"]');await w(400);
  t(await p.locator('#tabbar').isHidden(),'tijdens het oefenen geen tabbalk');
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(300);
  // midden: app-naam en modulerij
  const midden=()=>p.evaluate(()=>{const br=document.querySelector('.brand').getBoundingClientRect();const row=document.querySelector('#app .modrow');const as=row?[...row.querySelectorAll('a')].map(a=>a.getBoundingClientRect()):[];
    return {brand:Math.abs((br.left+br.right)/2-innerWidth/2),scroll:row?row.scrollWidth>row.clientWidth:null,l:as.length?as[0].left:0,r:as.length?innerWidth-as[as.length-1].right:0}});
  await ga(p,'home');let m=await midden();t(m.brand<=2,'kopbalk: app-naam in het midden');
  await ga(p,'stof');m=await midden();t(m.brand<=2,'kopbalk: ook op andere schermen in het midden');
  await ga(p,'phb1');await p.click('#app .cat [data-act="oefen"]');await w(400);
  t(await p.evaluate(()=>{const s=document.getElementById('stopBtn').getBoundingClientRect(),b=document.querySelector('.brand').getBoundingClientRect();return s.width>0&&b.left<40&&s.right>innerWidth-40}),'tijdens het oefenen: naam links en Stoppen rechts (zoals voorheen)');
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(300);
  // schermbreedtes
  for(const [bw,bh] of [[412,900],[390,844],[360,780],[320,640],[280,653]]){await p.setViewportSize({width:bw,height:bh});await ga(p,'phb4');const mm=await midden();
    t(await pastAlles(p)&&(bw<300||(!mm.scroll&&Math.abs(mm.l-mm.r)<=2&&mm.brand<=2)),bw+' breed: alles past'+(bw<300?' (modulerij schuift)':', naam en PHB 1 t/m RTGB netjes in het midden'))}
  await p.setViewportSize({width:260,height:512});await ga(p,'home');
  t(await p.evaluate(()=>[...document.querySelectorAll('#tabbar a')].every(a=>parseFloat(getComputedStyle(a).fontSize)===0&&a.getAttribute('aria-label'))),'klein buitenscherm (Flip): alleen pictogrammen, met namen voor de schermlezer');
  t(!p._errs.length,'telefoon: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // tablet staand: zelfde tabbalk, knoppen bovenaan
  p=await open(b,{viewport:{width:820,height:1180}});await ga(p,'phb2');
  t((await tabs(p)).length===4&&await p.locator('#app .modrow').isVisible()&&await pastAlles(p),'tablet: dezelfde tabbalk en de modules als knoppen');
  await p.context().close();
  // pc
  p=await open(b,{viewport:{width:1280,height:800},isMobile:false,hasTouch:false});await ga(p,'phb1');
  t(await p.locator('#app .modrow').isHidden()&&await p.locator('#topnav a[href="#phb3"]').isVisible()&&await p.locator('#profBtn').isVisible(),'pc: bovenbalk met alle modules en profielknop, geen knoppenrij');
  t(!p._errs.length,'pc: geen JS-fouten');
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
