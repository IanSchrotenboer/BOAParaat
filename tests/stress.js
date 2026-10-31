// Stresstest: veel gegevens, duizenden handelingen, trage telefoon, lang openstaan, randgevallen, twee tabbladen, laden.
// Gebruik: node tests/stress.js  (BOA_URL en BOA_SHOTS zoals de andere tests; BOA_WWW = map van de web-app voor de laadtest)
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const WWW=process.env.BOA_WWW||require('path').resolve(__dirname,'../www');
const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);const info=m=>out.push('info '+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
const F=process.env.CI?2:1; // op de (tragere) servers van GitHub ruimere tijdgrenzen
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});

// ---------- vragen-id's zoals de app ze maakt ----------
const B=f=>fs.readFileSync(path.resolve(__dirname,'../bron',f),'utf8');
const Q=new Function(['q1.js','q2.js','q3.js','q4.js','q5.js'].map(B).join('\n')+';return [].concat(Q1,Q2,Q3,Q4,Q5)')();
function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return "q"+(h>>>0).toString(36)}
const IDS=Q.map(r=>hash(r[1]));
const iso=d=>{const x=new Date();x.setDate(x.getDate()+d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const lang=(n,s)=>s.repeat(Math.ceil(n/s.length)).slice(0,n);

// ---------- een "zware" gebruiker: jaren oefenen ----------
function zwaar(){
  const now=Date.now(),s={},d={};
  IDS.forEach((id,i)=>{s[id]=[4000+i,3100+i%700,i%3?1:0,now-i*60000]});
  for(let i=0;i<120;i++)d[iso(-i)]=20+i%40;
  const h=Array.from({length:50},(_,i)=>({d:now-i*86400000,t:'PHB 1 · Oefenexamen Wet- en regelgeving',m:'phb1',k:i%2?'examen':'toets',g:30+i%20,n:50,p:i%3?1:0}));
  const x=Array.from({length:500},(_,i)=>({id:'x'+i,mod:['phb1','phb2','phb3','phb4','basis','anders'][i%6],soort:i%2?'Praktijk':'Theorie',datum:iso(i-250),tijd:'09:30',loc:lang(80,'Examencentrum Utrecht '),status:['gepland','gehaald','niet','afgemeld'][i%4],score:'34/50',note:lang(80,'Meenemen: oproep en legitimatie. ')}));
  const verslag=lang(9000,'Op 31-10-2026 omstreeks 14:05 uur zag ik een man met een blauwe jas het perron op lopen. Ik hoorde hem zeggen: "Ik ben te laat." ');
  const wr=Array.from({length:40},(_,i)=>({id:'w'+i,sc:i%2?'perron':'plein',seed:1000+i,d:now-i*3600000,txt:verslag,notes:lang(4000,'man blauwe jas 14:05 perron 3 ; '),hdr:{nr:'123456',functie:'Buitengewoon opsporingsambtenaar',org:'NS',afd:'Veiligheid',akte:'AB-123',naam:'Sam de Vries',eed:'2020'},score:{total:72}}));
  const yt=Array.from({length:200},(_,i)=>({id:'y'+i,url:'https://www.youtube.com/watch?v=dQw4w9WgXcQ',titel:'Oefenvideo '+i,start:0,end:180,punten:lang(600,'Persoon met rode jas loopt weg. ')}));
  const e={phb1:IDS.slice(0,50),'phb1:ov':IDS.slice(50,100)};
  return {s,h,x,e,w:wr,yt,d,wd:null,p:{naam:'Sam de Vries',dom:'1',werk:'NS',akte:iso(400),rol:'werkend',ob:1,thema:'systeem',gezien:'9.9.9',mld:{oefen:true,examen:true,tijd:'19:00',gevraagd:1}}};
}
const LICHT={s:{},h:[],x:[],p:{naam:'Sam',dom:'1',werk:'NS',akte:iso(400),rol:'werkend',ob:1,gezien:'9.9.9',mld:{gevraagd:1}}};

// ---------- hulpjes ----------
async function nieuw(b,seed,opts={}){
  const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},isMobile:true,hasTouch:true},opts.ctx||{}));
  const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  // tellers voor timers, animatieframes en geluid
  await p.addInitScript(()=>{const act=new Set();const si=window.setInterval,ci=window.clearInterval;
    window.setInterval=function(){const id=si.apply(this,arguments);act.add(id);return id};window.clearInterval=function(id){act.delete(id);return ci.apply(this,arguments)};
    window.__iv=()=>act.size;let raf=0;const r=window.requestAnimationFrame;window.requestAnimationFrame=function(f){raf++;return r.call(this,f)};window.__raf=()=>raf;
    let ac=0;const A=window.AudioContext;if(A)window.AudioContext=function(){ac++;return new A()};window.__ac=()=>ac;
    try{localStorage.setItem('wv-speed','400')}catch(e){}});
  if(seed!==null)await p.addInitScript(s=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('phb-trainer-v1',typeof s==='string'?s:JSON.stringify(s));sessionStorage.setItem('seeded','1')}},seed||LICHT);
  await p.goto((opts.url||BOA_URL)+'#home');await w(250);
  p._cdp=await ctx.newCDPSession(p);await p._cdp.send('Performance.enable');return p;
}
async function heap(p){await p._cdp.send('HeapProfiler.collectGarbage');const m=(await p._cdp.send('Performance.getMetrics')).metrics;const g=k=>(m.find(x=>x.name===k)||{}).value;return {mb:g('JSHeapUsedSize')/1048576,nodes:g('Nodes'),listeners:g('JSEventListeners')}}
const cpu=(p,r)=>p._cdp.send('Emulation.setCPUThrottlingRate',{rate:r});
async function routeTijd(p,r){return p.evaluate(r=>new Promise(res=>{const t0=performance.now();addEventListener('hashchange',()=>requestAnimationFrame(()=>res(performance.now()-t0)),{once:true});location.hash=r}),r)}
async function routes(p,label,lim){
  const rs=['phb1','home','profiel','profiel-examens','phb3','stof','phb2','profiel-phb3','phb4','home'];const tijden={};
  for(const r of rs){const ms=await routeTijd(p,r);tijden[r]=Math.max(tijden[r]||0,Math.round(ms))}
  const max=Math.max(...Object.values(tijden));const traag=Object.entries(tijden).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>k+' '+v+' ms').join(', ');
  t(max<=lim,`${label}: elk scherm binnen ${lim} ms (traagst: ${traag})`);return tijden;
}

(async()=>{
  const b=await chromium.launch();const T0=Date.now();
  // lokale webserver met de web-app (zoals GitHub Pages)
  const srv=http.createServer((req,res)=>{let f=path.join(WWW,decodeURIComponent(req.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';
    fs.readFile(f,(e,data)=>{if(e){res.writeHead(404);return res.end()}const ext=path.extname(f);const gz=/gzip/.test(req.headers['accept-encoding']||'')&&ext!=='.png';
      // zoals GitHub Pages: gecomprimeerd versturen
      res.writeHead(200,Object.assign({'Content-Type':{'.html':'text/html','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'}[ext]||'application/octet-stream'},gz?{'Content-Encoding':'gzip'}:{}));res.end(gz?require('zlib').gzipSync(data):data)})}).listen(0);
  const port=srv.address().port;const url=`http://localhost:${port}/`;
  // ===== 1. veel gegevens =====
  const Z=zwaar();const json=JSON.stringify(Z);
  info(`zware gebruiker: ${(json.length/1024).toFixed(0)} kB opslag (328 vragen x ~4000 keer, 500 examens, 40 verslagen, 200 video's, 120 dagen)`);
  t(json.length<4.5*1024*1024,'opslag zware gebruiker past ruim binnen de 5 MB van de browser');
  let p=await nieuw(b,Z);
  t(await p.locator('.homegrid').count()===1,'zware gebruiker: app start');
  await routes(p,'zware gebruiker, gewone telefoon',150*F);
  await cpu(p,6);await routes(p,'zware gebruiker, trage telefoon (CPU 6x trager)',600*F);await cpu(p,1);
  t(await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=0,'zware gebruiker: geen horizontale scroll');
  t(!p._errs.length,'zware gebruiker: geen JS-fouten'+(p._errs.length?': '+p._errs.slice(0,3).join(' | '):''));
  await p.context().close();

  // ===== 2. duizenden antwoorden achter elkaar =====
  p=await nieuw(b,LICHT);
  await p.evaluate(()=>location.hash='phb1');await w(150);await p.click('[data-act="oefen"][data-cat="sr"]');await w(150);
  const h0=await heap(p);
  const ronde=await p.evaluate(async()=>{const t0=performance.now();let n=0,rondes=0;const q=s=>document.querySelector(s);
    while(n<3000){const pick=q('[data-act="pick"]');if(pick){pick.click();n++;const nx=q('[data-act="next"]')||q('[data-act="finish"]');nx.click()}
      else{const a=q('[data-act="again"]')||q('[data-act="redo-same"]');if(!a)return {fout:'geen knop',n};a.click();rondes++}
      if(n%200===0)await new Promise(r=>setTimeout(r,0))}
    return {n,rondes,ms:performance.now()-t0}});
  await w(300);const h1=await heap(p);
  t(!ronde.fout&&ronde.n===3000,`3000 vragen beantwoord in ${ronde.rondes} rondes (${(ronde.ms/ronde.n).toFixed(1)} ms per vraag)`);
  t(h1.mb-h0.mb<8,`geheugen stabiel na 3000 vragen (${h0.mb.toFixed(1)} → ${h1.mb.toFixed(1)} MB)`);
  t(h1.listeners-h0.listeners<=10,`aantal event-listeners stabiel (${h0.listeners} → ${h1.listeners})`);
  t(h1.nodes<5000,`DOM blijft klein (${h1.nodes} elementen)`);
  t(await p.evaluate(()=>window.__iv())<=1,`geen achterblijvende timers (${await p.evaluate(()=>window.__iv())} actief)`);
  const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')));
  t(Object.keys(st.d).length<=120&&Object.values(st.s).reduce((a,x)=>a+x[0],0)===3000,'alle 3000 antwoorden opgeslagen; dagenlog begrensd');

  // ===== 3. schermwissels =====
  const h2=await heap(p);
  const nav=await p.evaluate(async()=>{const rs=['home','phb1','phb2','phb3','phb4','stof','profiel','profiel-examens','stof-boa','profiel-phb3'];const t0=performance.now();
    for(let i=0;i<2000;i++){await new Promise(res=>{addEventListener('hashchange',()=>res(),{once:true});location.hash=rs[i%rs.length]})}return performance.now()-t0});
  await w(300);const h3=await heap(p);
  t(h3.mb-h2.mb<8&&h3.listeners-h2.listeners<=10,`2000 schermwissels: geheugen ${h2.mb.toFixed(1)} → ${h3.mb.toFixed(1)} MB, listeners ${h2.listeners} → ${h3.listeners} (${(nav/2000).toFixed(1)} ms per wissel)`);
  t(!p._errs.length,'antwoorden en schermwissels: geen JS-fouten'+(p._errs.length?': '+p._errs.slice(0,3).join(' | '):''));

  // ===== 4. 25 oefenexamens achter elkaar =====
  const ex=await p.evaluate(async()=>{const q=s=>document.querySelector(s);let klaar=0;
    for(let e=0;e<25;e++){await new Promise(res=>{addEventListener('hashchange',()=>res(),{once:true});location.hash=location.hash==='#phb1'?'home':'phb1'});
      if(location.hash!=='#phb1')await new Promise(res=>{addEventListener('hashchange',()=>res(),{once:true});location.hash='phb1'});
      q('[data-act="examen"]').click();await new Promise(r=>setTimeout(r,0));
      for(let i=0;i<50;i++){const o=document.querySelectorAll('[data-act="pick"]')[i%4];o.click();const nx=q('[data-act="next"]');if(nx)nx.click()}
      q('[data-act="ask-submit"]').click();q('[data-act="submit"]').click();if(q('.verdict'))klaar++}
    return klaar});
  t(ex===25,`25 oefenexamens van 50 vragen gemaakt en nagekeken (${ex})`);
  t(await p.evaluate(()=>window.__iv())<=1,'examentimers netjes gestopt');
  const st2=await p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')));
  t(st2.h.length<=50,`examenhistorie begrensd (${st2.h.length} van max 50)`);
  t(!p._errs.length,'examens: geen JS-fouten'+(p._errs.length?': '+p._errs.slice(0,3).join(' | '):''));
  await p.context().close();

  // ===== 5. lang openstaan (nagebootste klok) =====
  let ctx=await b.newContext({viewport:{width:390,height:844}});p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.clock.install();await p.addInitScript(s=>localStorage.setItem('phb-trainer-v1',JSON.stringify(s)),LICHT);
  await p.goto(BOA_URL+'#home');await p.clock.runFor(2000);
  await p.evaluate(()=>location.hash='phb1');await p.clock.runFor(500);await p.click('[data-act="examen"]');await p.clock.runFor(500);
  await p.locator('[data-act="pick"]').first().click();
  await p.clock.runFor(91*60*1000);
  t(await p.locator('.verdict').count()===1&&/tijd was om/.test(await p.locator('.verdict').innerText()),'examen van 90 minuten levert na afloop van de tijd vanzelf in');
  await p.evaluate(()=>location.hash='home');await p.clock.runFor(1000);
  await p.clock.runFor(8*3600*1000);
  t(await p.locator('.homegrid').count()===1&&!p._errs.length,'8 uur open laten staan: app werkt nog, geen fouten'+(p._errs.length?': '+p._errs.slice(0,2).join(' | '):''));
  await ctx.close();

  // ===== 6. praktijkoefening 15 keer starten en stoppen =====
  p=await nieuw(b,LICHT);
  const wv=await p.evaluate(async()=>{const q=s=>document.querySelector(s);const go=h=>new Promise(res=>{if(location.hash==='#'+h)return res();addEventListener('hashchange',()=>res(),{once:true});location.hash=h});
    for(let i=0;i<15;i++){await go('phb3');const s=q('[data-act="wv-next"],[data-act="wv-new"]');if(!s)return 'geen startknop';s.click();await new Promise(r=>setTimeout(r,50));
      const f=q('[data-act="wv-film"]');if(f){f.click();await new Promise(r=>setTimeout(r,120))}
      document.getElementById('stopBtn').click();await new Promise(r=>setTimeout(r,20));const nb=q('[data-act="wv-stop-yes"]');if(nb)nb.click();await new Promise(r=>setTimeout(r,20))}
    await go('home');return 'ok'});
  const raf1=await p.evaluate(()=>window.__raf());await w(1000);const raf2=await p.evaluate(()=>window.__raf());
  t(wv==='ok','praktijkoefening 15 keer gestart en gestopt'+(wv!=='ok'?': '+wv:''));
  t(raf2-raf1<5,`film stopt echt: geen animatie meer op de achtergrond (${raf2-raf1} frames/s)`);
  t(await p.evaluate(()=>window.__ac())<=1,`hooguit één geluidskanaal (${await p.evaluate(()=>window.__ac())})`);
  t(await p.evaluate(()=>window.__iv())===0,`geen timers meer actief op het overzicht (${await p.evaluate(()=>window.__iv())})`);
  t(!p._errs.length,'praktijkoefening: geen JS-fouten'+(p._errs.length?': '+p._errs.slice(0,3).join(' | '):''));
  await p.context().close();

  // ===== 7. opslag vol =====
  p=await nieuw(b,LICHT);
  await p.evaluate(()=>{const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='phb-trainer-v1'){const e=new Error('vol');e.name='QuotaExceededError';throw e}return o.call(this,k,v)}});
  await p.evaluate(()=>location.hash='phb1');await w(150);await p.click('[data-act="oefen"][data-cat="sr"]');await w(150);
  await p.locator('[data-act="pick"]').first().click();await w(200);
  t(!p._errs.length,'opslag vol: app blijft werken');
  t(/opslag/i.test(await p.locator('#toast').innerText().catch(()=>'')),'opslag vol: je krijgt een waarschuwing dat er niet bewaard kan worden');
  await p.context().close();

  // ===== 8. beschadigde gegevens =====
  const rommel=['{kapot','null','[]','"tekst"','{"s":[],"h":{},"x":"nee","p":null}','{"s":{"q1":"x","qzz":[1]},"x":[null,1,{"datum":"gisteren"}],"w":[{}],"yt":[null],"d":{"x":"y"},"p":{"naam":123,"mld":"aan","rol":5,"akte":"morgen"}}',JSON.stringify({p:{naam:'A',ob:1,thema:'paars'},wd:{sc:'bestaatniet',phase:'film1'}})];
  for(const [i,r] of rommel.entries()){p=await nieuw(b,r);
    for(const route of ['home','profiel','profiel-examens','phb3','phb1'])await p.evaluate(r=>location.hash=r,route).then(()=>w(60));
    t(!p._errs.length&&await p.locator('#app').innerText().then(x=>x.length>20),`beschadigde opslag ${i+1}: app start en werkt`+(p._errs.length?': '+p._errs.slice(0,2).join(' | '):''));await p.context().close()}

  // ===== 9. kwaadaardige en extreem lange invoer =====
  const XSS='<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>';
  const kwaad={s:{},h:[{d:Date.now(),t:XSS,m:'phb1',k:'examen',g:1,n:50,p:0}],x:[{id:XSS,mod:XSS,soort:XSS,datum:iso(3),tijd:XSS,loc:XSS,status:'gepland',score:XSS,note:XSS}],
    w:[{id:'w1',sc:'perron',seed:1,d:Date.now(),txt:XSS,notes:XSS,hdr:{nr:XSS,functie:XSS,org:XSS,afd:XSS,akte:XSS,naam:XSS,eed:XSS}}],yt:[{id:'y1',url:'javascript:window.__xss=3',titel:XSS,punten:XSS}],
    p:{naam:XSS+lang(20000,'Heel lange naam '),werk:XSS+lang(5000,'Werkgever '),akte:iso(-3),rol:'werkend',dom:'1',ob:1,gezien:'9.9.9',mld:{gevraagd:1,examen:true}}};
  p=await nieuw(b,kwaad);
  for(const r of ['home','profiel','profiel-examens','phb3','profiel-phb3','verslag-w1'])await p.evaluate(r=>location.hash=r,r).then(()=>w(120));
  await p.evaluate(()=>location.hash='profiel');await w(120);await p.click('[data-act="export"]').catch(()=>{});await w(100);
  t(await p.evaluate(()=>window.__xss===undefined),'geen code uitgevoerd vanuit ingevoerde tekst (XSS)');
  await p.evaluate(()=>location.hash='profiel');await w(150);
  t(await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=0,'extreem lange naam: geen horizontale scroll');
  t(!p._errs.length,'kwaadaardige invoer: geen JS-fouten'+(p._errs.length?': '+p._errs.slice(0,2).join(' | '):''));
  // importcode: rommel en enorm
  await p.click('[data-act="import"]');await w(80);
  for(const code of ['PHB1:kapot','PHB1:'+Buffer.from('{"p":null}').toString('base64'),'iets anders','PHB1:'+'A'.repeat(3000000)]){
    await p.fill('#impCode',code);await p.click('[data-act="import-go"]');await w(120);if(!(await p.locator('#impCode').count())){await p.click('[data-act="import"]');await w(80)}}
  t(!p._errs.length,'rommel in "voortgang overzetten": geen crash'+(p._errs.length?': '+p._errs.slice(0,2).join(' | '):''));
  await p.context().close();

  // ===== 10. twee tabbladen tegelijk (pc, via de website) =====
  ctx=await b.newContext({viewport:{width:1280,height:800}});
  await ctx.addInitScript(s=>{if(!localStorage.getItem('phb-trainer-v1'))localStorage.setItem('phb-trainer-v1',JSON.stringify(s))},LICHT);
  const A=await ctx.newPage(),Bp=await ctx.newPage();await A.goto(url+'#phb1');await Bp.goto(url+'#phb1');await w(250);
  await A.click('[data-act="oefen"][data-cat="sr"]');await Bp.click('[data-act="oefen"][data-cat="ro"]');await w(100);
  for(let i=0;i<5;i++){for(const P of [A,Bp]){await P.locator('[data-act="pick"]').first().click();await w(30);const n=P.locator('[data-act="next"]');if(await n.count())await n.click();await w(30)}}
  await w(300);
  const st3=await A.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')));
  const tot=Object.values(st3.s).reduce((a,x)=>a+x[0],0);
  t(tot===10,`twee tabbladen tegelijk: alle 10 antwoorden bewaard (${tot} van 10)`);
  await ctx.close();

  // ===== 11. laden over een trage verbinding en offline (web-app) =====

  ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  const cdp=await ctx.newCDPSession(p);await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:400,downloadThroughput:500*1024/8,uploadThroughput:500*1024/8});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.addInitScript(s=>{if(!localStorage.getItem('phb-trainer-v1'))localStorage.setItem('phb-trainer-v1',JSON.stringify(s))},LICHT);
  let t0=Date.now();await p.goto(url+'#home',{waitUntil:'domcontentloaded'});await p.waitForSelector('.homegrid');const laad1=Date.now()-t0;
  info(`eerste keer laden over trage 3G (400 ms vertraging, 0,5 Mbit/s) op trage telefoon: ${(laad1/1000).toFixed(1)} s`);
  t(laad1<6000*F,`eerste keer laden over trage 3G binnen 6 s (${(laad1/1000).toFixed(1)} s)`);
  await p.waitForFunction(()=>navigator.serviceWorker&&navigator.serviceWorker.controller,null,{timeout:15000}).catch(()=>{});
  await w(1500);
  t0=Date.now();await p.reload({waitUntil:'domcontentloaded'});await p.waitForSelector('.homegrid');const laad2=Date.now()-t0;
  t(laad2<2500*F,`tweede keer laden (uit de offline-opslag): ${(laad2/1000).toFixed(1)} s`);
  await cdp.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:-1,uploadThroughput:-1});
  await p.reload({waitUntil:'domcontentloaded'}).catch(()=>{});const offl=await p.waitForSelector('.homegrid',{timeout:8000}).then(()=>true).catch(()=>false);
  t(offl,'zonder internet: app opent uit de offline-opslag');
  t(!p._errs.length,'laden: geen JS-fouten'+(p._errs.length?': '+p._errs.slice(0,2).join(' | '):''));
  await ctx.close();srv.close();

  await b.close();
  info(`duur stresstest: ${Math.round((Date.now()-T0)/1000)} s`);
  console.log(out.join('\n'));const n=out.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${n} problemen, ${out.filter(x=>x.startsWith('ok')).length} geslaagd`);process.exit(n?1:0);
})();
