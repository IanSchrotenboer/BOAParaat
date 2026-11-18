// Proefversie met betaalmuur (uit/Boa-Paraat-proef.html): 7 dagen gratis alles, daarna op slot tot je een
// abonnement neemt (1, 3, 6 of 12 maanden, nagebootst), met en zonder account. Een licentie van de werkgever of
// een klas bij een opleider geeft toegang zonder abonnement. Licentiecodes werken één keer en gaan mee naar een
// ander apparaat. Supabase wordt nagebootst met dezelfde regels als de databasefuncties
// (supabase/migrations/…_proef_proefweek_en_abonnementen.sql). Daarna een controle dat de gewone app er niets
// van merkt.
const path=require('path'),fs=require('fs'),http=require('http'),crypto=require('crypto'),os=require('os');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.stack||e).split('\n').slice(0,3).join(' | '));process.exit(1)});
const UIT=path.resolve(__dirname,'../uit');
const PROEF=fs.readFileSync(path.join(UIT,'Boa-Paraat-proef.html'),'utf8'),GEWOON=fs.readFileSync(path.join(UIT,'Boa-Paraat.html'),'utf8');
// ---------------- nagebootste Supabase ----------------
const norm=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const db={users:{},rows:{},codes:{},tokens:{},refresh:{},lics:{},abos:{},pogingen:{},proef:{},klas:{},als:null,calls:[],licCodes:{}};
const CODE1='NS-TEST-AAAA-BBBB',CODE2='NS-TEST-CCCC-DDDD';
for(const c of [CODE1,CODE2])db.licCodes[norm(c)]={lic:'ns',door:null};
const b64url=b=>b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(obj==null?'':JSON.stringify(obj))}
function tokensVoor(u){const a='at-'+crypto.randomBytes(8).toString('hex'),r='rt-'+crypto.randomBytes(8).toString('hex');db.tokens[a]={u:u.id,exp:Date.now()+3600e3};db.refresh[r]=u.id;
  return {access_token:a,refresh_token:r,expires_in:3600,token_type:'bearer',user:{id:u.id,email:u.email,user_metadata:{full_name:u.naam}}}}
const DAG=864e5,iso=ms=>new Date(ms).toISOString(),plusMnd=(d,m)=>{const x=new Date(d);x.setMonth(x.getMonth()+m);return x};
function rechten(uid){if(!db.proef[uid])db.proef[uid]=Date.now();
  const a=db.abos[uid];
  if(a&&a.status==='actief'&&Date.parse(a.tot)<=Date.now()){let t=new Date(a.tot);while(t<=Date.now()){const m=a.volgend||a.plan;t=plusMnd(t,m);a.plan=m;a.volgend=null}a.tot=t.toISOString()}
  return {lic:db.lics[uid]||null,klas:!!db.klas[uid],proef:{start:iso(db.proef[uid]),tot:iso(db.proef[uid]+7*DAG)},abo:a?{...a}:null}}
const rpc={
  mijn_rechten:uid=>rechten(uid),
  licentie_inwisselen:(uid,b)=>{const n=(db.pogingen[uid]||0);if(n>=10)return {ok:false,reden:'te_vaak'};
    const c=db.licCodes[norm(b.code)];
    if(c&&(c.door===null||c.door===uid)){c.door=uid;db.lics[uid]=c.lic;return {ok:true,lic:c.lic}}
    db.pogingen[uid]=n+1;return {ok:false,reden:c?'gebruikt':'onbekend'}},
  licentie_loskoppelen:uid=>{delete db.lics[uid];return {ok:true}},
  proef_abonnement:(uid,b)=>{const a=db.abos[uid],m=b.maanden==null?1:b.maanden;if(![1,3,6,12].includes(m))throw new Error('plan');
    if(b.actie==='start'){if(a&&Date.parse(a.tot)>Date.now()){a.status='actief';a.volgend=m===a.plan?null:m}
      else db.abos[uid]={status:'actief',start:iso(Date.now()),tot:plusMnd(Date.now(),m).toISOString(),bron:'nagebootst',plan:m,volgend:null}}
    else if(b.actie==='hervat'&&a&&Date.parse(a.tot)>Date.now())a.status='actief';
    else if(b.actie==='opzeggen'&&a){a.status='opgezegd';a.volgend=null}
    return rechten(uid)}};
let SUPA='',APP='';
const supa=http.createServer((req,res)=>{let body='';req.on('data',c=>body+=c);req.on('end',()=>{
  const u=new URL(req.url,'http://x');db.calls.push(req.method+' '+u.pathname);
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'});return res.end()}
  if(u.pathname==='/auth/v1/authorize'){const red=u.searchParams.get('redirect_to'),ch=u.searchParams.get('code_challenge');
    const code='c-'+crypto.randomBytes(6).toString('hex');db.codes[code]={ch,u:{...db.als}};db.users[db.als.id]={...db.als};
    res.writeHead(302,{Location:red+(red.includes('?')?'&':'?')+'code='+code});return res.end()}
  if(u.pathname==='/auth/v1/token'){const b=JSON.parse(body||'{}');
    if(u.searchParams.get('grant_type')==='pkce'){const c=db.codes[b.auth_code];delete db.codes[b.auth_code];
      if(!c||b64url(crypto.createHash('sha256').update(b.code_verifier||'').digest())!==c.ch)return json(res,400,{error:'invalid_grant'});return json(res,200,tokensVoor(c.u))}
    const id=db.refresh[b.refresh_token];delete db.refresh[b.refresh_token];if(!id)return json(res,400,{error:'invalid_grant'});return json(res,200,tokensVoor(db.users[id]))}
  if(u.pathname==='/auth/v1/logout')return json(res,204,null);
  const ses=db.tokens[(req.headers.authorization||'').replace('Bearer ','')];
  if(!u.pathname.startsWith('/rest/v1/'))return json(res,404,{});
  if(req.headers.apikey!=='pk-test')return json(res,401,{message:'apikey'});
  if(!ses||ses.exp<Date.now())return json(res,401,{message:'JWT expired'});
  if(u.pathname==='/rest/v1/voortgang'&&req.method==='GET'){const id=(u.searchParams.get('user_id')||'').replace('eq.','');return json(res,200,id===ses.u&&db.rows[id]?[{data:db.rows[id].data}]:[])}
  if(u.pathname==='/rest/v1/voortgang'&&req.method==='POST'){const b=JSON.parse(body);if(b.user_id!==ses.u)return json(res,403,{});db.rows[b.user_id]={data:b.data};return json(res,201,null)}
  const f=rpc[u.pathname.replace('/rest/v1/rpc/','')];
  if(f&&req.method==='POST')return json(res,200,f(ses.u,JSON.parse(body||'{}')));
  json(res,404,{})})});
const app=http.createServer((req,res)=>{const u=new URL(req.url,'http://x');
  const src=u.pathname==='/gewoon.html'?GEWOON:PROEF;const cloud=u.pathname==='/lokaal.html'?'null':JSON.stringify({url:SUPA,key:'pk-test'});
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(src.replace(/const CLOUD=(null|\{[^;]*\});/,'const CLOUD='+cloud+';'))});
const listen=s=>new Promise(r=>s.listen(0,'127.0.0.1',()=>r(s.address().port)));
// ---------------- hulpjes ----------------
const store=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}'));
const recht=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('boa-recht')||'{}'));
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(300)};
const PROFIEL={naam:'Sam de Vries',dom:'1',werk:'X',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}};
async function apparaat(b,pagina,opts){const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},isMobile:true,hasTouch:true},opts||{}));
  const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));await p.goto(APP+'/'+pagina+'#home');await w(300);return p}
async function inloggen(p){await p.click('[data-act="login"]');await p.waitForURL(/\.html(#.*)?$/,{timeout:5000}).catch(()=>{});await w(1200)}
async function kies(p,id,label){await p.click('#'+id+'-cs');await w(120);await p.locator('.cs-list li',{hasText:label}).first().click();await w(150)}
async function welkom(p){await p.fill('#obWerk','Gemeente Utrecht');await kies(p,'obRol','Scholier');if(await p.locator('[data-act="ob-dom"][data-v="1"]').count())await p.click('[data-act="ob-dom"][data-v="1"]');await p.click('.wgo');await w(2200);
  await p.evaluate(()=>{const b=document.querySelector('.kdlg [data-act], .kdlg button');if(b)b.click()});await w(200)}
// de muur: het scherm met de prijzen staat in plaats van het gevraagde scherm
const muur=p=>p.evaluate(()=>document.getElementById('app').dataset.v==='plus'&&!!document.querySelector('#app .plans')&&/voorbij/.test(document.querySelector('#app h1').textContent));
const open=async(p,h)=>{await ga(p,h||'phb3');return !(await muur(p))&&await p.locator('#app [data-act="mix"]').count()>=1};
async function codeInvullen(p,code){await ga(p,'profiel');await p.fill('#licCode',code);await p.click('#licForm button[type=submit]');await w(700)}
async function sync(p){await ga(p,'profiel');await p.click('[data-act="sync"]');await w(900)}
(async()=>{
  SUPA='http://127.0.0.1:'+await listen(supa);APP='http://127.0.0.1:'+await listen(app);
  const b=await chromium.launch();
  // ================= A. zonder account (los bestand of voorbeeld) =================
  let p=await apparaat(b,'lokaal.html');
  await p.evaluate(pr=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:pr})),PROFIEL);await p.reload();await w(400);
  t((await p.textContent('.brand .tag')).includes('proef'),'kopbalk: zichtbaar dat dit de proefversie is');
  t(/Nog 7 dagen gratis/.test(await p.textContent('#app .proefmld'))&&/€ 4,00 per maand/.test(await p.textContent('#app .proefmld')),'eerste dag: overzicht meldt nog 7 dagen gratis, daarna vanaf € 4,00 per maand');
  t(await open(p,'phb3')&&await open(p,'rtgb')&&await open(p,'phb1'),'proefweek: alle modules open (ook PHB 3 en RTGB)');
  await ga(p,'stof');t(await p.locator('#s-ambts .prose').count()===1,'proefweek: alle studiestof leesbaar');
  await ga(p,'pad');t(!(await muur(p)),'proefweek: leerpad open');
  await ga(p,'profiel');t(/nog 7 dagen/.test(await p.textContent('#abonnement'))&&/1, 3, 6 of 12 maanden/.test(await p.textContent('#abonnement')),'profiel: proefperiode met resterende dagen en de keuze in abonnementen');
  // prijslijst
  await ga(p,'plus');
  const plans=await p.evaluate(()=>[...document.querySelectorAll('.plan')].map(x=>({m:x.dataset.plan,t:x.textContent.replace(/\s+/g,' ').trim(),k:x.getAttribute('aria-checked')})));
  t(plans.length===4&&plans.map(x=>x.m).join()==='1,3,6,12','prijslijst: 1, 3, 6 en 12 maanden');
  t(/€ 5,99/.test(plans[0].t)&&/€ 15,99/.test(plans[1].t)&&/€ 5,33 per maand/.test(plans[1].t)&&/Bespaar 11%/.test(plans[1].t)&&/€ 28,99/.test(plans[2].t)&&/€ 4,83 per maand/.test(plans[2].t)&&/Bespaar 19%/.test(plans[2].t)&&/€ 47,99/.test(plans[3].t)&&/€ 4,00 per maand/.test(plans[3].t)&&/Bespaar 33%/.test(plans[3].t)&&/Voordeligst/.test(plans[3].t),'prijzen: € 5,99 · € 15,99 (€ 5,33/mnd, −11%) · € 28,99 (€ 4,83/mnd, −19%) · € 47,99 (€ 4,00/mnd, −33%)');
  t(plans[3].k==='true'&&plans.filter(x=>x.k==='true').length===1&&/nog 7 dagen/.test(await p.textContent('#app .lede'))&&await p.locator('#app a.btn[href="#home"]').count()===1,'prijslijst: jaar staat voorgeselecteerd; tijdens de proef met resterende dagen en een terugknop');
  // laatste dag
  await p.evaluate(()=>localStorage.setItem('boa-proef',String(Date.now()-6.5*864e5)));await ga(p,'stof');await ga(p,'home');
  t(/Laatste dag gratis/.test(await p.textContent('#app .proefmld'))&&await p.locator('#app .proefmld.bijna').count()===1,'laatste dag: opvallender melding op het overzicht');
  // proefweek voorbij
  await p.evaluate(()=>localStorage.setItem('boa-proef',String(Date.now()-8*864e5)));await p.reload();await w(400);
  t(await muur(p),'na 7 dagen: het overzicht maakt plaats voor de abonnementen');
  let dicht=true;for(const h of ['phb1','phb2','phb3','rtgb','stof','stof-ambts','pad','wv','fouten','casus'])dicht=dicht&&await ga(p,h).then(()=>muur(p));
  t(dicht,'na 7 dagen: modules, studiestof, leerpad, praktijkoefening en foutenlijst op slot');
  t(!(await p.locator('#app a.btn[href="#home"]').count()),'muur: geen terugknop naar een scherm dat toch op slot zit');
  await ga(p,'profiel');t(!(await muur(p))&&/voorbij/.test(await p.textContent('#abonnement'))&&await p.locator('#licForm').count()===1,'profiel blijft open: abonnement en licentie');
  t((await store(p)).p.naam==='Sam de Vries','voortgang en profiel blijven bewaard');
  // abonnement nemen: 3 maanden
  await ga(p,'plus');await p.click('.plan[data-plan="3"]');await w(150);
  t(await p.getAttribute('.plan[data-plan="3"]','aria-checked')==='true'&&await p.getAttribute('.plan[data-plan="12"]','aria-checked')==='false'&&/3 maanden/.test(await p.textContent('[data-act="plus-start"]')),'plan kiezen: 3 maanden geselecteerd, knop noemt het plan');
  await p.click('[data-act="plus-start"]');await w(300);
  const chk=await p.textContent('.pcheck');
  t(/3 maanden/.test(chk)&&/€ 15,99/.test(chk)&&/€ 5,33 per maand/.test(chk)&&/alleen op dit apparaat/.test(chk)&&await p.locator('.proefbalk').count()===1,'bevestigen: plan, prijs, prijs per maand; zonder account alleen op dit apparaat; niet echt betalen');
  await p.click('[data-act="plus-terug"]');await w(200);t(await p.locator('.plans').count()===1,'annuleren: terug naar de prijslijst');
  await p.click('[data-act="plus-start"]');await w(200);await p.click('[data-act="plus-betaal"]');await w(600);
  let r=await recht(p);
  t((await p.evaluate(()=>location.hash))==='#home'&&!(await muur(p))&&r.abo&&r.abo.plan===3&&Math.abs(Date.parse(r.abo.tot)-plusMnd(Date.now(),3))<60e3,'na betalen: app open, abonnement van 3 maanden');
  t(await open(p,'phb4')&&!(await p.locator('#app .proefmld').count()),'met abonnement: alles open, geen proefmelding meer');
  await ga(p,'profiel');t(/3 maanden/.test(await p.textContent('#abonnement'))&&/volgende betaling/.test(await p.textContent('#abonnement'))&&/€ 15,99/.test(await p.textContent('#abonnement')),'profiel: 3 maanden, € 15,99, volgende betaaldatum');
  // overstappen op een jaar: gaat in na de huidige periode
  await p.click('#abonnement a[href="#plus"]');await w(300);
  t(/Abonnement wijzigen/.test(await p.textContent('#app h1')),'ander abonnement kiezen vanuit Profiel');
  await p.click('.plan[data-plan="12"]');await w(100);await p.click('[data-act="plus-start"]');await w(200);
  t(/huidige periode afloopt/.test(await p.textContent('.pcheck'))&&/Bevestigen/.test(await p.textContent('[data-act="plus-betaal"]')),'wijzigen: nieuw plan gaat in als de huidige periode afloopt');
  await p.click('[data-act="plus-betaal"]');await w(600);r=await recht(p);
  t((await p.evaluate(()=>location.hash))==='#profiel'&&r.abo.plan===3&&r.abo.volgend===12&&/daarna 1 jaar/.test(await p.textContent('#abonnement')),'na wijzigen: nu 3 maanden, daarna 1 jaar');
  // opzeggen en terugdraaien
  await p.click('[data-act="abo-stop"]');await w(200);t(await p.locator('#abonnement .confirm').count()===1,'opzeggen vraagt eerst om bevestiging');
  await p.click('[data-act="abo-stop-ja"]');await w(300);
  t(/opgezegd/.test(await p.textContent('#abonnement'))&&await open(p,'phb1'),'opgezegd: toegang tot het einde van de periode');
  await ga(p,'profiel');await p.click('[data-act="abo-hervat"]');await w(300);t(/volgende betaling/.test(await p.textContent('#abonnement')),'opzegging terugdraaien kan');
  // verlengen op dit apparaat
  await p.evaluate(()=>{const r=JSON.parse(localStorage.getItem('boa-recht'));r.abo.tot=new Date(Date.now()-1000).toISOString();r.abo.volgend=12;localStorage.setItem('boa-recht',JSON.stringify(r))});
  t(await open(p,'phb2'),'periode voorbij en niet opgezegd: verlengt zich');r=await recht(p);
  t(r.abo.plan===12&&!r.abo.volgend&&Date.parse(r.abo.tot)>plusMnd(Date.now(),11),'verlengd met het nieuwe plan (1 jaar)');
  // verlopen na opzeggen
  await p.evaluate(()=>{const r=JSON.parse(localStorage.getItem('boa-recht'));r.abo.tot=new Date(Date.now()-1000).toISOString();r.abo.status='opgezegd';localStorage.setItem('boa-recht',JSON.stringify(r))});
  await ga(p,'home');t(await muur(p),'opgezegd en verlopen: weer op slot');
  await codeInvullen(p,CODE1);
  t(/Log in/.test(await p.textContent('#licentie'))&&!(await store(p)).p.lic,'zonder account: licentiecode kan niet (hoort bij een account)');
  t(!p._errs.length,'zonder account: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // ================= B. met account: proefweek per account, abonnementen en licenties =================
  db.als={id:'u-anna',email:'anna@example.com',naam:'Anna de Boer'};
  const a1=await apparaat(b,'app.html');await inloggen(a1);await welkom(a1);await w(400);
  t(db.calls.includes('POST /rest/v1/rpc/mijn_rechten')&&db.proef['u-anna']&&/Nog 7 dagen gratis/.test(await a1.textContent('#app .proefmld')),'na inloggen: proefweek begint op de server, nog 7 dagen');
  t(await open(a1,'rtgb'),'nieuw account: alles open');
  db.proef['u-anna']=Date.now()-8*DAG;await sync(a1);await ga(a1,'home');
  t(await muur(a1),'proefweek op de server voorbij: na bijwerken op slot');
  await codeInvullen(a1,'NS-FOUT-FOUT-FOUT');
  t(/klopt niet/.test(await a1.textContent('#licentie'))&&(await a1.inputValue('#licCode'))==='NS-FOUT-FOUT-FOUT','onbekende code: melding, de ingevulde code blijft staan');
  await codeInvullen(a1,CODE1.toLowerCase().replace(/-/g,' '));
  let s=await store(a1);
  t(db.licCodes[norm(CODE1)].door==='u-anna'&&s.p.lic==='ns'&&s.p.dom==='4'&&await a1.evaluate(()=>document.documentElement.getAttribute('data-lic'))==='ns','code (kleine letters, spaties) ingewisseld: NS-licentie aan Anna gekoppeld, NS-stijl en domein IV');
  t(await open(a1,'phb3')&&!(await a1.locator('#app .proefmld').count()),'organisatielicentie: alles open, geen abonnement nodig');
  await ga(a1,'profiel');t(/hoort bij je account/.test(await a1.textContent('#licentie'))&&/licentie van Nederlandse Spoorwegen/.test(await a1.textContent('#abonnement')),'profiel: licentie hoort bij je account; abonnement niet nodig');
  await w(4500);
  const a2=await apparaat(b,'app.html',{viewport:{width:1280,height:800},isMobile:false,hasTouch:false});
  await inloggen(a2);await w(800);s=await store(a2);
  t(s.p.lic==='ns'&&(await recht(a2)).lic==='ns'&&await open(a2,'phb4'),'ander apparaat, zelfde account: licentie automatisch mee, alles open');
  // Bas: zijn proefweek was al eerder gebruikt (bijvoorbeeld op een ander apparaat)
  db.als={id:'u-bas',email:'bas@example.com',naam:'Bas Smit'};db.proef['u-bas']=Date.now()-30*DAG;
  const b1=await apparaat(b,'app.html');await inloggen(b1);await b1.fill('#obNaam','Bas Smit');await welkom(b1);await ga(b1,'home');
  t(await muur(b1)&&db.proef['u-bas']<Date.now()-29*DAG,'proefweek één keer per account: opnieuw installeren of inloggen start hem niet opnieuw');
  await codeInvullen(b1,CODE1);
  t(/al gebruikt/.test(await b1.textContent('#licentie'))&&!(await store(b1)).p.lic&&db.licCodes[norm(CODE1)].door==='u-anna','andere gebruiker met dezelfde code: "al gebruikt", geen licentie');
  for(let i=0;i<10;i++){await b1.fill('#licCode','NS-XXXX-XXXX-'+i);await b1.click('#licForm button[type=submit]');await w(250)}
  t(/Te veel/.test(await b1.textContent('#licentie')),'na te veel onjuiste codes: even wachten');
  await ga(b1,'plus');await b1.click('.plan[data-plan="6"]');await w(100);await b1.click('[data-act="plus-start"]');await w(200);
  t(/bas@example\.com/.test(await b1.textContent('.pcheck'))&&/6 maanden/.test(await b1.textContent('.pcheck'))&&/€ 28,99/.test(await b1.textContent('.pcheck')),'met account: abonnement van 6 maanden hoort bij je account');
  await b1.click('[data-act="plus-betaal"]');await w(700);
  t(db.abos['u-bas']&&db.abos['u-bas'].status==='actief'&&db.abos['u-bas'].plan===6&&await open(b1,'phb3'),'abonnement via de server gestart (6 maanden): alles open');
  const b2=await apparaat(b,'app.html');await inloggen(b2);await w(800);
  t(await open(b2,'rtgb')&&(await recht(b2)).abo&&(await recht(b2)).abo.plan===6,'abonnement geldt ook op het tweede apparaat van Bas');
  db.abos['u-bas'].tot=iso(Date.now()-1000);db.abos['u-bas'].volgend=12;await sync(b2);
  t(db.abos['u-bas'].plan===12&&Date.parse(db.abos['u-bas'].tot)>Date.now()&&await open(b2,'phb1'),'server verlengt een lopend abonnement met het gekozen nieuwe plan');
  await ga(b2,'profiel');await b2.click('[data-act="abo-stop"]');await w(150);await b2.click('[data-act="abo-stop-ja"]');await w(500);
  t(db.abos['u-bas'].status==='opgezegd','opzeggen gaat via de server');
  db.abos['u-bas'].tot=iso(Date.now()-1000);await sync(b2);await ga(b2,'home');
  t(await muur(b2),'opgezegd abonnement verlopen: op slot');
  // Dirk zit in een klas van een opleider
  db.als={id:'u-dirk',email:'dirk@example.com',naam:'Dirk Jansen'};db.proef['u-dirk']=Date.now()-30*DAG;db.klas['u-dirk']=true;
  const d1=await apparaat(b,'app.html');await inloggen(d1);await d1.fill('#obNaam','Dirk Jansen');await welkom(d1);
  t(await open(d1,'phb2'),'lid van een klas: alles open zonder abonnement');
  await ga(d1,'profiel');t(/via je klas/.test(await d1.textContent('#abonnement')),'profiel: toegang via je klas');
  // Anna haalt de licentie weg en vult haar eigen code later weer in
  await ga(a1,'profiel');await a1.click('[data-act="lic-weg"]');await w(150);await a1.click('[data-act="lic-weg-ja"]');await w(600);
  await ga(a1,'home');t(!db.lics['u-anna']&&!(await store(a1)).p.lic&&await muur(a1),'licentie verwijderen: losgekoppeld van het account, proefweek voorbij dus op slot');
  await codeInvullen(a1,CODE1);
  t(db.lics['u-anna']==='ns'&&(await store(a1)).p.lic==='ns','eigen code opnieuw invullen werkt (alleen voor hetzelfde account)');
  delete db.lics['u-anna'];await sync(a2);await ga(a2,'home');
  t(!(await store(a2)).p.lic&&await muur(a2),'licentie op de server weg: na bijwerken ook in de app weg');
  await ga(a2,'profiel');await a2.click('[data-act="logout"]');await w(1200);
  t(!(await a2.evaluate(()=>localStorage.getItem('boa-recht'))),'uitloggen: rechten niet meer op het apparaat');
  db.als={id:'u-cor',email:'cor@example.com',naam:'Cor Visser'};
  const c1=await apparaat(b,'app.html');await inloggen(c1);
  await c1.fill('#obWerk','NS');await c1.fill('#obLic',CODE2);await c1.click('[data-act="ob-lic"]');await w(700);
  t(db.licCodes[norm(CODE2)].door==='u-cor'&&!(await c1.locator('[data-act="ob-dom"]').count())&&(await c1.inputValue('#obWerk'))==='NS','welkomstscherm: code ingewisseld, domein vast, ingevulde velden blijven staan');
  const errs=[a1,a2,b1,b2,c1,d1].flatMap(x=>x._errs);
  t(!errs.length,'met account: geen JS-fouten'+(errs.length?': '+errs.join(' | '):''));
  await b.close();
  // ================= C. gewone app: geen betaalmuur =================
  const b3=await chromium.launch();
  const ctxG=await b3.newContext({viewport:{width:390,height:844},isMobile:true});const pg=await ctxG.newPage();pg._errs=[];pg.on('pageerror',e=>pg._errs.push(e.message));
  const K=path.join(os.tmpdir(),'boa-gewoon-bm.html');fs.writeFileSync(K,GEWOON.replace(/const CLOUD=(null|\{[^;]*\});/,'const CLOUD=null;'));
  await pg.goto('file://'+K+'#home');await pg.evaluate(pr=>{localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:pr}));localStorage.setItem('boa-proef',String(Date.now()-30*864e5))},PROFIEL);await pg.reload();await w(300);
  t(!(await pg.locator('#app .proefmld').count())&&!/proef/.test(await pg.textContent('.brand .tag')),'gewone app: geen proefmelding of proeflabel');
  t(await open(pg,'phb3'),'gewone app: alles open, ook met een oude proefdatum op het apparaat');
  await ga(pg,'profiel');t(!(await pg.locator('#abonnement').count()),'gewone app: geen abonnement in het profiel');
  await ga(pg,'plus');t(await pg.locator('.plans').count()===0,'gewone app: geen prijslijst');
  t(!pg._errs.length,'gewone app: geen JS-fouten');
  await b3.close();supa.close();app.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
