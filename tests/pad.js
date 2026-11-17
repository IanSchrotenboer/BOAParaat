// Leerpad (pad.js): het tabblad in het midden, het pad per module, lessen van makkelijk naar moeilijk,
// levens, sterren, de toets per deel (en doorspringen), stoppen, opslaan en samenvoegen met de cloud.
const fs=require('fs'),path=require('path'),os=require('os');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const SRC=process.env.BOA_URL?decodeURIComponent(process.env.BOA_URL.replace(/^file:\/\//,'').split('#')[0]):path.resolve(__dirname,'../uit/Boa-Paraat.html');
const K=path.join(os.tmpdir(),'boa-pad.html');fs.writeFileSync(K,fs.readFileSync(SRC,'utf8').replace(/const CLOUD=(null|\{[^;]*\});/,'const CLOUD=null;'));
const URL_='file://'+K;
const PROFIEL={naam:'Sam de Vries',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}};
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(300)};
const store=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')));
async function open(b,opts,prof,extra){const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},isMobile:true,hasTouch:true},opts||{}));const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(URL_+'#home');await p.evaluate(([pr,ex])=>{localStorage.setItem('wv-debug','1');localStorage.setItem('phb-trainer-v1',JSON.stringify(Object.assign({s:{},h:[],x:[],p:pr},ex||{})))},[prof||PROFIEL,extra]);await p.reload();await w(400);return p}
// een vraag beantwoorden: goed (juiste optie) of fout
async function antwoord(p,goed){await p.evaluate(g=>{const bs=[...document.querySelectorAll('.ples [data-pad="kies"]')];(g?bs.find(b=>b.dataset.o==='0'):bs.find(b=>b.dataset.o!=='0')).click()},goed);await p.click('[data-pad="check"]');await w(40)}
const verder=async p=>{await p.click('[data-pad="verder"]');await w(40)};
(async()=>{
  const b=await chromium.launch();
  let p=await open(b);
  // ---------- tabblad en pad ----------
  t(await p.evaluate(()=>[...document.querySelectorAll('#tabbar a')][2].dataset.tab)==='pad','tabbalk: Leerpad staat in het midden');
  await p.click('#tabbar a[data-tab="pad"]');await w(500);
  t(await p.locator('#tabbar a[data-tab="pad"][aria-current="page"]').count()===1&&/Leerpad/.test(await p.textContent('#app .padkop')),'leerpad: tabblad actief, kop met de module');
  const pad=await p.evaluate(()=>{const {padVan,padMoeite,inMod,MODBY,BYID}=__pad;const P=padVan(MODBY.phb1);return {delen:P.delen.map(d=>d.letter),n:P.delen.reduce((a,d)=>a+d.onderwerpen.reduce((x,o)=>x+o.lessen.reduce((y,l)=>y+l.qs.length,0),0),0),
    pool:inMod('phb1').length,uniek:new Set(P.delen.flatMap(d=>d.onderwerpen.flatMap(o=>o.lessen.flatMap(l=>l.qs)))).size,
    moeilijker:P.delen.every(d=>d.onderwerpen.every(o=>{const g=l=>l.qs.reduce((a,id)=>a+padMoeite(BYID[id]),0)/l.qs.length;return g(o.lessen[0])<=g(o.lessen[o.lessen.length-1])})),
    niv:P.delen[0].onderwerpen[0].lessen.map(l=>l.niv).join(),lesMax:Math.max(...P.delen.flatMap(d=>d.onderwerpen.flatMap(o=>o.lessen.map(l=>l.qs.length)))),
    eerste:P.delen[0].onderwerpen[0].c}});
  t(pad.delen.join()==='A,B,C,D,E'&&pad.eerste==='sr','pad PHB 1 volgt de stof: delen A t/m E, begint bij Staatsrecht');
  t(pad.n===pad.pool&&pad.uniek===pad.pool,`elke vraag van PHB 1 zit precies één keer in het pad (${pad.pool})`);
  t(pad.moeilijker&&pad.niv.startsWith('1')&&pad.niv.endsWith('3')&&pad.lesMax<=10,'per onderwerp van makkelijk naar moeilijk: Basis → Expert, lessen van hooguit 10 vragen');
  t(await p.locator('.pknoop.nu').count()===1&&await p.locator('.pknoop:not(.dicht)').count()===2,'begin: alleen de eerste les en de toets van deel A open, de rest op slot');
  t(await p.locator('.plees[href="#stof-staat"]').count()===1,'elk onderwerp begint met "Lees de stof" (naar de studiestof)');
  await p.locator('.pknoop.dicht').first().click();await w(200);
  t(/Maak eerst de stappen hiervoor/.test(await p.evaluate(()=>document.body.innerText)),'les op slot: melding');
  // ---------- een les helemaal goed ----------
  const s0=Object.keys((await store(p)).s).length;
  await p.click('.pknoop.nu');await w(300);
  t(await p.locator('#tabbar').isHidden()&&await p.locator('.plevens i.aan').count()===3&&await p.locator('[data-pad="check"][disabled]').count()===1,'les: geen tabbalk, 3 levens, Controleer pas na een keuze');
  const nVr=await p.evaluate(()=>__pad.pl().rij.length);
  for(let i=0;i<nVr;i++){await antwoord(p,true);if(i===0)t(await p.locator('.pfb.ok').count()===1,'goed antwoord: groene melding');await verder(p)}
  await w(300);
  let st=await store(p);
  t(/Les voltooid/.test(await p.textContent('#app h1'))&&st.pad['phb1:sr:1'][0]===3,'alles goed: les voltooid, 3 sterren bewaard');
  t(Object.keys(st.s).length===s0+nVr,'elke vraag telt mee in de gewone voortgang');
  await p.click('[data-pad="start"]');await w(300);
  t(await p.evaluate(()=>__pad.pl()&&__pad.pl().key)==='phb1:sr:2','Volgende stap: meteen de volgende les');
  // ---------- een fout: leven kwijt, vraag komt terug ----------
  await antwoord(p,false);
  t(await p.locator('.pfb.no').count()===1&&await p.locator('.plevens i.aan').count()===2&&/komt aan het eind/.test(await p.textContent('.pfb')),'fout: rode melding met het juiste antwoord, een leven minder');
  const fid=await p.evaluate(()=>{const L=__pad.pl();return L.rij[L.i].id});await verder(p);
  const n2=await p.evaluate(()=>__pad.pl().rij.length);
  for(let i=1;i<n2;i++){const r=await p.evaluate(()=>{const L=__pad.pl();return [L.rij[L.i].id,L.rij[L.i].terug]});if(r[1])t(r[0]===fid&&/Nog een keer/.test(await p.textContent('.ples')),'de foute vraag komt aan het eind terug');await antwoord(p,true);await verder(p)}
  await w(300);st=await store(p);
  t(st.pad['phb1:sr:2'][0]===2&&st.s[fid][0]===1,'één fout: 2 sterren; de herkansing telt niet dubbel in de voortgang');
  // ---------- levens op ----------
  await p.click('[data-pad="naar-pad"]');await w(400);
  t(/^#pad-phb1$/.test(await p.evaluate(()=>location.hash))&&await p.locator('.pknoop.af').count()===2,'terug op het pad: twee lessen klaar');
  await p.click('.pknoop.nu');await w(300);
  for(let i=0;i<3;i++){await antwoord(p,false);await verder(p)}await w(300);
  st=await store(p);
  t(/levens zijn op/.test(await p.textContent('#app h1'))&&!st.pad['phb1:sr:3'],'drie fouten: levens op, les niet gehaald');
  await p.click('[data-pad="start"]');await w(300);
  t(await p.evaluate(()=>{const L=__pad.pl();return L.levens===3&&L.key==='phb1:sr:3'}),'Opnieuw: les begint opnieuw met 3 levens');
  // ---------- stoppen ----------
  await antwoord(p,true);await p.click('[data-pad="stop"]');await w(200);
  t(/Stoppen\?/.test(await p.textContent('.ples .confirm')),'stoppen na een antwoord: eerst bevestigen');
  await p.click('[data-pad="stop-nee"]');await w(150);
  await ga(p,'home');
  t(await p.evaluate(()=>location.hash)==='#pad-les'&&await p.locator('.ples .confirm').count()===1,'tijdens een les naar een ander scherm: blijft in de les en vraagt of je wilt stoppen');
  const back=await p.evaluate(()=>{__pad.stopUit();return __pad.appBack()});await w(150);
  t(back==='leerpad'&&await p.locator('.ples .confirm').count()===1,'terugknop (Android) in een les: vraagt eerst of je wilt stoppen');
  await p.click('[data-pad="stop-ja"]');await w(400);
  t(await p.evaluate(()=>location.hash)==='#pad'&&!(await store(p)).pad['phb1:sr:3'],'gestopt: terug naar het pad, les niet bewaard');
  // ---------- toetsenbord ----------
  await p.click('.pknoop.nu');await w(300);
  const juist=await p.evaluate(()=>__pad.pl().rij[0].ord.indexOf(0)+1);
  await p.keyboard.press(String(juist));await w(80);await p.evaluate(()=>document.activeElement.blur());
  await p.keyboard.press('Enter');await w(120);
  t(await p.locator('.pfb.ok').count()===1,'toetsenbord: cijfer kiest, Enter controleert');
  await p.evaluate(()=>document.activeElement.blur());await p.keyboard.press('Enter');await w(120);
  t(await p.evaluate(()=>__pad.pl().i)===1,'toetsenbord: Enter gaat verder');
  await p.evaluate(()=>__pad.weg());await ga(p,'pad-phb1');
  // ---------- toets: doorspringen ----------
  await p.click('[data-k="phb1:T:A"]');await w(300);
  t(await p.evaluate(()=>__pad.pl().toets&&__pad.pl().rij.length)===10&&await p.locator('.plevens').count()===0,'toets van een deel: 10 vragen, zonder levens');
  for(let i=0;i<10;i++){await antwoord(p,i!==3);await verder(p)}await w(300);
  st=await store(p);
  t(/Toets gehaald/.test(await p.textContent('#app h1'))&&st.pad['phb1:T:A'][0]===2,'toets met 9 goed: gehaald, 2 sterren');
  t(st.pad['phb1:sr:1'][0]===3&&st.pad['phb1:pol:1'][0]===1,'toets gehaald: lessen van dat deel tellen als gedaan (eerdere sterren blijven)');
  await p.click('[data-pad="naar-pad"]');await w(400);
  t(await p.evaluate(()=>{const s=__pad.padStand(__pad.padVan(__pad.MODBY.phb1));return s.nu})==='phb1:str:1','na de toets van deel A begint deel B');
  t(await p.locator('button[data-k="phb1:T:C"].btn').count()===0&&await p.locator('.pknoop[data-k="phb1:T:C"].dicht').count()===1,'toets van deel C nog dicht zolang deel B niet af is');
  t((await store(p)).h[0].k==='padtoets','geschiedenis: toets van het leerpad staat bij je activiteit');
  // ---------- module wisselen, domein IV ----------
  await p.click('.padmods a[href="#pad-rtgb"]');await w(400);
  t(/Ambtsinstructie/.test(await p.textContent('#app h1'))&&(await store(p)).p.pm==='rtgb','andere module kiezen: pad van RTGB, onthouden');
  await ga(p,'pad');t(/Ambtsinstructie/.test(await p.textContent('#app h1')),'tabblad Leerpad opent het laatst gekozen pad');
  // ---------- herladen midden in een les ----------
  await p.click('.pknoop.nu');await w(300);await p.reload();await w(500);
  t(await p.evaluate(()=>location.hash)==='#pad'&&await p.locator('.padkop').count()===1,'herladen tijdens een les: terug naar het pad');
  t(!p._errs.length,'geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  // ---------- opslaan en cloud ----------
  const m=await p.evaluate(()=>{const {normalize,mergeStore}=__pad;const a=normalize({p:{},pad:{'phb1:sr:1':[3,5],'x':[2,1],'phb1:sr:2':[7,1],'phb1:T:A':[2,9],'rtgb:aig:1':['3',1]}});
    const A=normalize({t:10,s:{},d:{},p:{},pad:{'phb1:sr:1':[2,10],'phb1:sr:2':[1,10]}}),B=normalize({t:20,s:{},d:{},p:{},pad:{'phb1:sr:1':[3,5],'phb1:sr:3':[1,20]}});
    const M=mergeStore(A,B);return {keys:Object.keys(a.pad).sort().join(),m:M.pad}});
  t(m.keys==='phb1:T:A,phb1:sr:1','opslag: alleen geldige leerpad-gegevens worden bewaard');
  t(m.m['phb1:sr:1'][0]===3&&m.m['phb1:sr:2'][0]===1&&m.m['phb1:sr:3'][0]===1,'cloud: samenvoegen houdt per les de meeste sterren en alle lessen van beide apparaten');
  await p.context().close();
  // ---------- domein IV en klein scherm ----------
  p=await open(b,{viewport:{width:320,height:640}},Object.assign({},PROFIEL,{dom:'4'}));
  await ga(p,'pad-phb1');
  t(/Openbaar vervoer/.test(await p.textContent('.pdeel h2'))&&await p.evaluate(()=>__pad.padVan(__pad.MODBY.phb1).delen.every(d=>d.onderwerpen.every(o=>!['gem','bst','apv','wvw','bijz'].includes(o.c)))),'domein IV: pad begint met openbaar vervoer, zonder domein I-onderwerpen');
  t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'klein scherm (320 px): pad past zonder zijwaarts scrollen');
  await p.click('.pknoop.nu');await w(300);await antwoord(p,false);await w(100);
  t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1&&(()=>{const r=document.querySelector('.pverder').getBoundingClientRect();return r.bottom<=innerHeight&&r.right<=innerWidth})()),'klein scherm: melding en Verder-knop in beeld');
  t(!p._errs.length,'domein IV: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // ---------- pc ----------
  p=await open(b,{viewport:{width:1280,height:900},isMobile:false,hasTouch:false});
  t(await p.locator('#topnav a[href="#pad"]').isVisible(),'pc: Leerpad in de bovenbalk');
  await p.click('#topnav a[href="#pad"]');await w(400);
  t(await p.locator('.padmods').isVisible()&&await p.locator('#topnav a[href="#pad"][aria-current="page"]').count()===1,'pc: pad met keuze van de module, Leerpad gemarkeerd');
  t(!p._errs.length,'pc: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await b.close();
  console.log(out.join('\n'));const f=out.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0)})();
