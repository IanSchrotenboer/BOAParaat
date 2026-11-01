// Chaostest: een 'aap' die willekeurig door de hele app klikt, veegt, typt, navigeert, herlaadt en de opslag
// beschadigt, op telefoon en pc, in beide domeinen. Na elke stap worden vaste regels gecontroleerd: geen
// JS-fouten, geen achtergebleven overgangskopieën of verschuivingen, geen horizontale scroll, nooit een leeg
// scherm, opslag blijft leesbaar. Daarna gerichte belastingen van de nieuwste onderdelen (toetsmatrijs,
// tabbladen, vegen, RTGB) en een lektest (DOM-elementen en geheugen na een lange sessie).
// Het zaad (CHAOS_SEED) maakt een gevonden fout reproduceerbaar.
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);const info=m=>out.push('info '+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
const SEED=+(process.env.CHAOS_SEED||Date.now()%100000);const STAPPEN=+(process.env.CHAOS_STAPPEN||350);
let rs=SEED;const rnd=()=>{rs=(rs*1103515245+12345)%2147483648;return rs/2147483648};const kies=a=>a[Math.floor(rnd()*a.length)];
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log(`FAIL test liep vast (zaad ${SEED}): `+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const ROUTES=['home','phb1','phb2','phb3','phb4','rtgb','stof','stof-boa','stof-ambts','stof-ruimte','profiel','profiel-examens','profiel-phb3','onbekend-scherm'];
const NIET=['install','ex-ics','export','mld-test','wv-full']; // bestandsdownloads, installeren en volledig scherm overslaan
const START={s:{},h:[],x:[],p:{naam:'Chaos Aap',dom:'1',werk:'Gemeente',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}};
async function open(b,opts,d){
  const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},isMobile:true,hasTouch:true},opts));
  const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  p.on('dialog',dl=>dl.dismiss().catch(()=>{}));
  await p.goto(BOA_URL+'#home');await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',JSON.stringify(s)),{...START,p:{...START.p,dom:d}});await p.reload();await w(200);
  p._log=[];p._cdp=opts&&opts.hasTouch===false?null:await ctx.newCDPSession(p);return p;
}
async function veeg(p,x0,x1,y=420){if(!p._cdp)return;const T0=Date.now()/1000;try{
  await p._cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y}],timestamp:T0});
  for(let i=1;i<=6;i++)await p._cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+(x1-x0)*i/6,y}],timestamp:T0+i*.03});
  await p._cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[],timestamp:T0+.21})}catch(e){await p._cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]}).catch(()=>{})}}
// vaste regels; 'rust' = na de overgangen
const regels=p=>p.evaluate(()=>{const f=[];const app=document.getElementById('app');
  if(!app||(!app.firstElementChild&&!document.querySelector('#obForm')))f.push('leeg scherm');
  if(document.querySelectorAll('.swghost').length)f.push('achtergebleven overgangskopie');
  if(app&&(app.style.transform||app.style.opacity))f.push('pagina blijft verschoven ('+app.style.transform+')');
  if(document.documentElement.scrollWidth>innerWidth+2){const W=innerWidth,o=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.right>W+2&&r.width>0&&!e.closest('svg'))o.push((e.id?'#'+e.id:e.tagName.toLowerCase()+(e.getAttribute('class')?'.'+e.getAttribute('class').split(' ')[0]:''))+'→'+Math.round(r.right))});
    f.push('horizontale scroll '+(document.documentElement.scrollWidth-W)+'px bij '+W+'px breed ['+o.slice(-3).join(' ')+']')}
  if(document.querySelectorAll('.kdlg').length>1)f.push('meerdere vensters tegelijk');
  if(document.querySelectorAll('.cs-layer').length>1)f.push('meerdere keuzemenu\'s tegelijk');
  if(document.body.classList.contains('cs-lock')&&!document.querySelector('.cs-layer'))f.push('scroll vergrendeld zonder keuzemenu');
  const tm=document.getElementById('timer');if(tm&&!tm.hidden&&!/^(sessie|wv)$/.test(location.hash.slice(1)))f.push('klok zichtbaar buiten een examen');
  try{const s=JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}');if(typeof s!=='object'||!s.p)f.push('opslag zonder profiel');if(JSON.stringify(s).length>4e6)f.push('opslag groeit te hard')}catch(e){f.push('opslag onleesbaar')}
  return f});
async function stap(p,touch){
  const r=rnd();const log=a=>{p._log.push(a);if(p._log.length>10)p._log.shift()};
  if(r<.42){ // klik op een willekeurige knop of link die zichtbaar is
    const els=await p.$$('#app [data-act], #app a[href^="#"], #tabbar a, #topnav a, .kdlg [data-act], .cs-list li, #profBtn, #stopBtn, .ptabs a');
    const zicht=[];for(const e of els){const ok=await e.evaluate((x,niet)=>{const r=x.getBoundingClientRect();const a=x.dataset&&x.dataset.act;return r.width>0&&r.height>0&&!x.disabled&&!(a&&niet.includes(a))},NIET).catch(()=>false);if(ok)zicht.push(e)}
    if(zicht.length){const e=kies(zicht);log('klik '+await e.evaluate(x=>(x.dataset.act||x.getAttribute('href')||x.id||x.textContent).slice(0,30)).catch(()=>'?'));await e.scrollIntoViewIfNeeded().catch(()=>{});await e.click({timeout:1500,force:rnd()<.2}).catch(()=>{})}
  }else if(r<.55){const h=kies(ROUTES);log('ga naar '+h);await p.evaluate(h=>location.hash=h,h)}
  else if(r<.67){if(touch){const x=rnd()<.5;log('veeg '+(x?'links':'rechts'));await veeg(p,x?330:60,x?60:330,200+Math.floor(rnd()*500))}else await p.keyboard.press(kies(['1','2','3','4','5','r','h','s','p','e','?','Escape'])).catch(()=>{})}
  else if(r<.75){const v=await p.$$('#app input:not([type=hidden]):not([type=file]), #app textarea');if(v.length){const e=kies(v);const typ=await e.getAttribute('type');
      const tekst=typ==='date'?kies(['2027-02-30','2026-11-08','1999-01-01','']):typ==='time'?'09:30':kies(['Jan','<img src=x onerror=alert(1)>','Ⅷ😀 '.repeat(20),'a'.repeat(400),'','Ik zag een man. Ik hoorde hem roepen.']);
      await e.fill(tekst).catch(()=>{})}}
  else if(r<.81){log('terug');await p.goBack({timeout:1500}).catch(()=>{})}
  else if(r<.85){await p.keyboard.press('Escape').catch(()=>{})}
  else if(r<.88){await p.evaluate(()=>{const b=document.querySelector('[data-act="pick"]');if(b)for(let i=0;i<6;i++)b.click()})} // dubbel en driedubbel tikken
  else if(r<.91){await p.setViewportSize(kies([{width:390,height:844},{width:844,height:390},{width:320,height:640},{width:1280,height:800}]))}
  else if(r<.94){log('herladen');await p.reload().catch(()=>{});await w(150)}
  else if(r<.96){ // opslag beschadigen en herladen
    await p.evaluate(k=>{const s=JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}');
      const kapot=[()=>{s.e={phb1:['bestaatniet',42,null],'phb1:ov':'x'}},()=>{s.s={qnietbestaand:[3,1,1,1],q1gsivft:'kapot'}},()=>{s.p.dom=7;s.p.thema='paars'},()=>{s.h=[{m:'phb9',k:'examen',g:'x'}]},()=>{s.x='geen lijst'},()=>{s.w=[{id:1,sc:'weg'}]},()=>{s.wd={sc:'perron',seed:'x',phase:'film9'}}];
      kapot[k%kapot.length]();localStorage.setItem('phb-trainer-v1',JSON.stringify(s))},Math.floor(rnd()*100));
    await p.reload().catch(()=>{});await w(200)}
  else{await w(Math.floor(rnd()*40))} // even niets
  if(!p.url().startsWith(BOA_URL.split('#')[0])){log('terug in de app');await p.goto(BOA_URL+'#home');await w(150)}
}
(async()=>{
  const b=await chromium.launch();
  info(`zaad ${SEED}, ${STAPPEN} stappen per ronde (opnieuw afspelen: CHAOS_SEED=${SEED} node tests/chaos.js)`);
  const rondes=[['telefoon, domein I',{},'1',true],['telefoon, domein IV, donker',{colorScheme:'dark'},'4',true],['pc, domein IV',{viewport:{width:1280,height:800},isMobile:false,hasTouch:false},'4',false]];
  for(const [naam,opts,d,touch] of rondes){
    const p=await open(b,opts,d);const fouten=new Map();let n=0;const t0=Date.now();
    for(let i=0;i<STAPPEN;i++){
      await stap(p,touch);n++;
      if(i%7===6||i===STAPPEN-1){await w(420);let r1=await regels(p);if(r1.length){await w(600);const r2=await regels(p);r1=r1.filter(f=>r2.some(g=>g.split(' bij ')[0].split(' (')[0]===f.split(' bij ')[0].split(' (')[0]))}for(const f of r1)if(!fouten.has(f))fouten.set(f,`stap ${i} op #${await p.evaluate(()=>location.hash.slice(1))}, na: ${p._log.slice(-6).join(' → ')}`)}
    }
    const js=[...new Set(p._errs)];
    t(!js.length,`${naam}: ${n} willekeurige acties zonder JS-fouten`+(js.length?': '+js.slice(0,3).join(' | '):''));
    t(!fouten.size,`${naam}: regels steeds in orde (geen kopieën, verschuiving, scroll of leeg scherm)`+(fouten.size?': '+[...fouten].slice(0,4).map(([f,w])=>`${f} (${w})`).join('; '):''));
    info(`${naam}: ${Math.round((Date.now()-t0)/1000)} s`);
    await p.context().close();
  }
  // ---------- gerichte belasting: tabbladen razendsnel wisselen tijdens de overgangen ----------
  {const p=await open(b,{},'1');const tabs=['phb1','rtgb','home','stof','phb3','phb2','phb4'];
    for(let i=0;i<60;i++){await p.evaluate(h=>document.querySelector(`#tabbar a[href="#${h}"]`).click(),tabs[i%tabs.length]);await w(i%5?15:120)}
    await w(500);const f=await regels(p);
    t(!f.length&&await p.evaluate(()=>location.hash)==='#'+tabs[59%tabs.length],'60 keer razendsnel van tabblad wisselen: juiste eindscherm, niets blijft hangen'+(f.length?': '+f.join(', '):''));
    // vegen tijdens een lopende overgang en tijdens een veeg
    for(let i=0;i<25;i++){await veeg(p,330,60);await w(i%3?40:200)}
    await w(700);const g=await regels(p);t(!g.length,'25 vegen kort na elkaar, ook tijdens de animatie: niets blijft hangen'+(g.length?': '+g.join(', '):''));
    t(!p._errs.length,'tabbladen en vegen onder druk: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
    await p.context().close()}
  // ---------- toetsmatrijs: 15 oefenexamens achter elkaar per domein ----------
  for(const d of ['1','4']){const p=await open(b,{},d);let ok=true,herh=0,vorige=null;
    for(let i=0;i<15;i++){await p.evaluate(()=>location.hash='phb1');await w(150);await p.click('[data-act="examen"]');await w(150);
      const ids=await p.evaluate(dd=>JSON.parse(localStorage.getItem('phb-trainer-v1')).e[dd==='4'?'phb1:ov':'phb1'],d);
      if(!ids||ids.length!==50||new Set(ids).size!==50)ok=false;if(vorige)herh+=ids.filter(x=>vorige.includes(x)).length;vorige=ids;
      await p.evaluate(()=>{document.getElementById('stopBtn').click()});await w(60);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"]');y&&y.click()});await w(150)}
    t(ok,`domein ${d==='4'?'IV':'I'}: 15 oefenexamens achter elkaar, steeds 50 verschillende vragen`);
    info(`domein ${d==='4'?'IV':'I'}: gemiddeld ${Math.round(herh/14)} vragen uit het vorige examen (onvermijdelijk bij toetstermen met weinig vragen)`);
    t(!p._errs.length,`domein ${d==='4'?'IV':'I'}: oefenexamens: geen JS-fouten`);await p.context().close()}
  // ---------- oude of beschadigde gegevens van eerdere versies ----------
  {const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(BOA_URL+'#home');
    const oud={s:{q8szqv1:[2,1,1,Date.now()],qVERWIJDERD1:[5,2,0,Date.now()],q1gsivft:[1,1,1,Date.now()]},h:[{d:Date.now(),t:'PHB 1 · Oefenexamen',m:'phb1',k:'examen',g:30,n:50,p:0},{d:Date.now(),t:'oud',m:'phb5',k:'toets',g:1,n:2,p:1}],x:[{id:'a',mod:'rtgb',status:'gepland',datum:'2026-11-05'},{id:'b',mod:'verdwenen',status:'gepland',datum:'2026-11-06'}],e:{phb1:['qVERWIJDERD1','qVERWIJDERD2'],'phb1:ov':['qVERWIJDERD3']},p:{naam:'Oude Gebruiker',dom:'4',werk:'NS',ob:1,gezien:'1.2.0'}};
    await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',JSON.stringify(s)),oud);await p.reload();await w(300);
    for(const h of ['home','phb1','profiel','profiel-examens','rtgb','stof'])await p.evaluate(h=>location.hash=h,h),await w(250);
    await p.evaluate(()=>location.hash='phb1');await w(200);await p.click('[data-act="examen"]');await w(300);
    const n=await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).e['phb1:ov'].length);
    await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('phb-trainer-v1'));s.wd={sc:'perron',seed:7,phase:'film9',t0:Date.now()};localStorage.setItem('phb-trainer-v1',JSON.stringify(s))});
    await p.goto('about:blank');await p.goto(BOA_URL+'#wv');await w(300);
    t(await p.evaluate(()=>!!document.querySelector('#app [data-act="wv-film"]')),'praktijkoefening met een onbekende fase in de opslag: begint netjes bij de briefing');
    t(!errs.length&&n===50,'gegevens uit oude versies (verwijderde vragen, onbekende modules): app werkt en examen heeft 50 vragen'+(errs.length?': '+errs.join(' | '):''));
    await ctx.close()}
  // ---------- heel smal scherm tijdens een examen en de praktijkoefening (gevonden met de chaostest, 1.6.1) ----------
  for(const mob of [false,true]){const p=await open(b,{viewport:{width:300,height:600},isMobile:mob,hasTouch:mob},'4');
    await p.evaluate(()=>location.hash='phb1');await w(200);await p.click('[data-act="examen"]');await w(300);
    const a=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    await p.evaluate(()=>{document.getElementById('stopBtn').click()});await w(100);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"]');y&&y.click()});await w(200);
    await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('phb-trainer-v1'));s.wd={sc:'perron',seed:7,phase:'verslag',t0:Date.now()};localStorage.setItem('phb-trainer-v1',JSON.stringify(s))});
    await p.goto('about:blank');await p.goto(BOA_URL+'#phb3');await w(300);await p.click('[data-act="wv-resume"]');await w(300);
    const c=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    t(a<=0&&c<=0,`${mob?'telefoon':'pc'} op 300 px breed: kop met klok en Stoppen past, ook in de praktijkoefening (${a} / ${c} px te breed)`);
    await p.context().close()}
  // ---------- lektest: lange sessie, daarna terug naar het overzicht ----------
  {const p=await open(b,{},'1');const meet=()=>p.evaluate(()=>({dom:document.getElementsByTagName('*').length,heap:performance.memory?performance.memory.usedJSHeapSize:0}));
    await p.evaluate(()=>location.hash='home');await w(300);const a=await meet();
    const tabs=['phb1','phb2','phb3','phb4','rtgb','stof','home','profiel'];
    for(let i=0;i<200;i++){await p.evaluate(h=>location.hash=h,tabs[i%tabs.length]);if(i%25===0){await p.evaluate(()=>location.hash='phb1');await w(60);await p.click('[data-act="mix"]').catch(()=>{});await w(60);await p.click('[data-act="pick"] >> nth=0').catch(()=>{});await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(40);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()})}await w(20)}
    await p.evaluate(()=>location.hash='home');await w(600);
    const cdp=await p.context().newCDPSession(p);await cdp.send('HeapProfiler.collectGarbage').catch(()=>{});await w(200);const z=await meet();
    t(z.dom<=a.dom*1.15+50,`lange sessie (200 schermwissels): aantal elementen blijft gelijk (${a.dom} → ${z.dom})`);
    t(!a.heap||z.heap<a.heap*1.6+4e6,`lange sessie: geheugen groeit niet door (${Math.round(a.heap/1e6)} → ${Math.round(z.heap/1e6)} MB)`);
    t(!p._errs.length,'lange sessie: geen JS-fouten');await p.context().close()}
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${f} problemen, ${out.filter(l=>l.startsWith('ok')).length} geslaagd`);process.exit(f?1:0);
})();
