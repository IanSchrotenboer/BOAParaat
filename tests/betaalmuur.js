// Proefversie met betaalmuur (uit/Boa-Paraat-proef.html): PHB 3, PHB 4 en RTGB op slot zonder Plus,
// nagebootst abonnement (met en zonder account), opzeggen en verlopen, en eenmalige licentiecodes die aan het
// account vastzitten en meegaan naar een ander apparaat. Supabase wordt nagebootst met dezelfde regels als de
// databasefuncties (supabase/migrations/…_proef_abonnement_en_licentiecodes.sql). Daarna een controle dat
// de gewone app (zonder betaalmuur) er niets van merkt.
const path=require('path'),fs=require('fs'),http=require('http'),crypto=require('crypto'),os=require('os');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.stack||e).split('\n').slice(0,3).join(' | '));process.exit(1)});
const UIT=path.resolve(__dirname,'../uit');
const PROEF=fs.readFileSync(path.join(UIT,'Boa-Paraat-proef.html'),'utf8'),GEWOON=fs.readFileSync(path.join(UIT,'Boa-Paraat.html'),'utf8');
// ---------------- nagebootste Supabase ----------------
const norm=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const db={users:{},rows:{},codes:{},tokens:{},refresh:{},lics:{},abos:{},pogingen:{},als:null,calls:[],licCodes:{}};
const CODE1='NS-TEST-AAAA-BBBB',CODE2='NS-TEST-CCCC-DDDD';
for(const c of [CODE1,CODE2])db.licCodes[norm(c)]={lic:'ns',door:null};
const b64url=b=>b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(obj==null?'':JSON.stringify(obj))}
function tokensVoor(u){const a='at-'+crypto.randomBytes(8).toString('hex'),r='rt-'+crypto.randomBytes(8).toString('hex');db.tokens[a]={u:u.id,exp:Date.now()+3600e3};db.refresh[r]=u.id;
  return {access_token:a,refresh_token:r,expires_in:3600,token_type:'bearer',user:{id:u.id,email:u.email,user_metadata:{full_name:u.naam}}}}
const rechten=uid=>({lic:db.lics[uid]||null,abo:db.abos[uid]||null});
const rpc={
  mijn_rechten:uid=>rechten(uid),
  licentie_inwisselen:(uid,b)=>{const n=(db.pogingen[uid]||0);if(n>=10)return {ok:false,reden:'te_vaak'};
    const c=db.licCodes[norm(b.code)];
    if(c&&(c.door===null||c.door===uid)){c.door=uid;db.lics[uid]=c.lic;return {ok:true,lic:c.lic}}
    db.pogingen[uid]=n+1;return {ok:false,reden:c?'gebruikt':'onbekend'}},
  licentie_loskoppelen:uid=>{delete db.lics[uid];return {ok:true}},
  proef_abonnement:(uid,b)=>{const a=db.abos[uid];
    if(b.actie==='start'){if(a&&Date.parse(a.tot)>Date.now())a.status='actief';else{const tot=new Date();tot.setMonth(tot.getMonth()+1);db.abos[uid]={status:'actief',start:new Date().toISOString(),tot:tot.toISOString(),bron:'nagebootst'}}}
    else if(b.actie==='opzeggen'&&a)a.status='opgezegd';return rechten(uid)}};
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
// slotjes in de modulenavigatie (bovenbalk; in de proefversie staan de modules niet meer in de tabbalk)
const slotOp=p=>p.evaluate(()=>['phb3','phb4','rtgb'].map(id=>!!document.querySelector(`#topnav a[href="#${id}"] .slotje`)));
async function codeInvullen(p,code){await ga(p,'profiel');await p.fill('#licCode',code);await p.click('#licForm button[type=submit]');await w(700)}
(async()=>{
  SUPA='http://127.0.0.1:'+await listen(supa);APP='http://127.0.0.1:'+await listen(app);
  const b=await chromium.launch();
  // ================= A. zonder account (los bestand of voorbeeld) =================
  let p=await apparaat(b,'lokaal.html');
  await p.evaluate(pr=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:pr})),PROFIEL);await p.reload();await w(400);
  t((await slotOp(p)).every(Boolean)&&!(await p.locator('#topnav a[href="#phb1"] .slotje').count()),'modulenavigatie: slotje op PHB 3, PHB 4 en RTGB, niet op PHB 1');
  await p.evaluate(()=>location.hash='phb1');await w(300);
  t(await p.locator('#app .modrow a .slotje').count()===3&&!(await p.locator('#app .modrow a[href="#phb1"] .slotje').count()),'knoppen bovenaan een module: slotje op PHB 3, PHB 4 en RTGB');
  t(/\(Plus\)/.test(await p.getAttribute('#topnav a[href="#rtgb"]','title')),'RTGB in de navigatie meldt dat hij bij Plus hoort');
  await p.evaluate(()=>location.hash='home');await w(300);
  t((await p.textContent('.brand .tag')).includes('proef'),'kopbalk: zichtbaar dat dit de proefversie is');
  t(await p.locator('.hlist .chip.plus').count()===3,'overzicht: drie modules met het label Plus in plaats van een percentage');
  for(const id of ['phb3','phb4','rtgb']){await ga(p,id);
    t(await p.locator('.slotkaart a[href="#plus-'+id+'"]').count()===1&&!(await p.locator('#app [data-act="mix"], #app [data-act="examen"], #app [data-act="oefen"]').count()),id+': slotscherm met Bekijk Plus, geen oefenknoppen')}
  await ga(p,'phb1');await p.waitForSelector('#app [data-act="mix"]',{timeout:3000}).catch(()=>{});t(await p.locator('#app [data-act="mix"]').count()>=1&&!(await p.locator('#app .slotkaart').count()),'PHB 1 blijft gratis');
  await ga(p,'phb2');t(await p.locator('#app [data-act="mix"]').count()===1,'PHB 2 blijft gratis');
  await ga(p,'wv');t(await p.locator('.slotkaart a[href="#plus-phb3"]').count()===1,'praktijkoefening (PHB 3) op slot');
  await ga(p,'stof');
  t(await p.locator('#s-ambts .slotkaart').count()===1&&!(await p.locator('#s-ambts .prose').count())&&await p.locator('#s-staat .prose').count()===1,'studiestof: RTGB-samenvattingen op slot, de rest leesbaar');
  const rtgbKnop=p.locator('#s-ambts [data-act="oefen"]');
  if(await rtgbKnop.count()){await rtgbKnop.first().click();await w(400);t((await p.evaluate(()=>location.hash))==='#plus-rtgb','oefenknop bij een RTGB-onderwerp leidt naar Plus in plaats van een ronde')}
  // fouten wegwerken: alleen vrije modules
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('phb-trainer-v1'));s.s={};localStorage.setItem('phb-trainer-v1',JSON.stringify(s))});
  // een paar fouten in PHB 1 en PHB 3 maken: PHB 1 via de app, PHB 3 rechtstreeks in de opslag
  await ga(p,'phb1');await p.click('#app .cat [data-act="oefen"][data-cat="sr"]');await w(300);
  for(let i=0;i<3;i++){const o=await p.evaluate(()=>[...document.querySelectorAll('.opt')].map(x=>x.dataset.o));await p.locator('.opt').nth((o.indexOf('0')+1)%4).click();await w(80);const nx=p.locator('[data-act="next"]');if(await nx.count())await nx.first().click();await w(80)}
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(150);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(250);
  await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('phb-trainer-v1'));s.s['phb3-nep']=[1,0,0,Date.now()];localStorage.setItem('phb-trainer-v1',JSON.stringify(s))});
  await ga(p,'fouten');const fcats=await p.evaluate(()=>[...document.querySelectorAll('.pmod .eyebrow')].map(x=>x.textContent));
  t(fcats.length>=1&&fcats.every(x=>!/PHB 3|PHB 4|RTGB/.test(x)),'foutenanalyse: alleen modules die je kunt oefenen ('+fcats.join(', ')+')');
  // Plus nemen zonder account
  await ga(p,'plus-phb3');
  t(/€ 5,99/.test(await p.textContent('.pprijs'))&&/per maand/.test(await p.textContent('.pprijs'))&&await p.locator('.proefbalk').count()===1,'Plus-pagina: € 5,99 per maand en de melding dat er in de proef niet echt betaald wordt');
  await p.click('[data-act="plus-start"]');await w(300);
  t(await p.locator('.pdl').count()===1&&/alleen op dit apparaat/.test(await p.textContent('.pcheck')),'bevestigen: overzicht van het abonnement; zonder account alleen op dit apparaat');
  await p.click('[data-act="plus-terug"]');await w(200);t(await p.locator('[data-act="plus-start"]').count()===1,'annuleren: terug naar de Plus-pagina');
  await p.click('[data-act="plus-start"]');await w(200);await p.click('[data-act="plus-betaal"]');await w(600);
  t((await p.evaluate(()=>location.hash))==='#phb3'&&await p.locator('#app [data-act="mix"]').count()===1,'na betalen: meteen in PHB 3, alles open');
  t((await slotOp(p)).every(x=>!x)&&!(await p.locator('.hlist .chip.plus').count()),'na betalen: geen slotjes meer');
  await ga(p,'stof');t(await p.locator('#s-ambts .prose').count()===1,'na betalen: RTGB-samenvattingen leesbaar');
  await ga(p,'profiel');t(/volgende betaling/.test(await p.textContent('#abonnement')),'profiel: abonnement actief met volgende betaaldatum');
  await p.click('[data-act="abo-stop"]');await w(200);t(await p.locator('#abonnement .confirm').count()===1,'opzeggen vraagt eerst om bevestiging');
  await p.click('[data-act="abo-stop-ja"]');await w(300);
  t(/opgezegd/.test(await p.textContent('#abonnement'))&&(await slotOp(p)).every(x=>!x),'opgezegd: toegang tot het einde van de maand');
  await p.click('[data-act="abo-hervat"]');await w(300);t(/volgende betaling/.test(await p.textContent('#abonnement')),'opzegging terugdraaien kan');
  await p.evaluate(()=>{const r=JSON.parse(localStorage.getItem('boa-recht'));r.abo.tot=new Date(Date.now()-1000).toISOString();r.abo.status='opgezegd';localStorage.setItem('boa-recht',JSON.stringify(r))});
  await ga(p,'home');await ga(p,'phb4');t(await p.locator('.slotkaart').count()===1&&(await slotOp(p)).every(Boolean),'abonnement verlopen: weer op slot (voortgang blijft bewaard)');
  await codeInvullen(p,CODE1);
  t(/Log in/.test(await p.textContent('#licentie'))&&!(await store(p)).p.lic,'zonder account: licentiecode kan niet (hoort bij een account)');
  t(!p._errs.length,'zonder account: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // ================= B. met account: eenmalige codes die meegaan =================
  db.als={id:'u-anna',email:'anna@example.com',naam:'Anna de Boer'};
  const a1=await apparaat(b,'app.html');await inloggen(a1);await welkom(a1);await w(400);
  t(db.calls.includes('POST /rest/v1/rpc/mijn_rechten')&&(await slotOp(a1)).every(Boolean),'na inloggen: rechten opgehaald, zonder licentie of abonnement op slot');
  await codeInvullen(a1,'NS-FOUT-FOUT-FOUT');
  t(/klopt niet/.test(await a1.textContent('#licentie'))&&(await a1.inputValue('#licCode'))==='NS-FOUT-FOUT-FOUT','onbekende code: melding, de ingevulde code blijft staan');
  await codeInvullen(a1,CODE1.toLowerCase().replace(/-/g,' '));
  let s=await store(a1);
  t(db.licCodes[norm(CODE1)].door==='u-anna'&&s.p.lic==='ns'&&s.p.dom==='4'&&await a1.evaluate(()=>document.documentElement.getAttribute('data-lic'))==='ns','code (kleine letters, spaties) ingewisseld: NS-licentie aan Anna gekoppeld, NS-stijl en domein IV');
  t((await slotOp(a1)).every(x=>!x),'organisatielicentie: alles open, geen abonnement nodig');
  await ga(a1,'profiel');t(/hoort bij je account/.test(await a1.textContent('#licentie'))&&/licentie van Nederlandse Spoorwegen/.test(await a1.textContent('#abonnement')),'profiel: licentie hoort bij je account; abonnement niet nodig');
  await w(4500);
  // tweede apparaat van Anna: licentie gaat mee
  const a2=await apparaat(b,'app.html',{viewport:{width:1280,height:800},isMobile:false,hasTouch:false});
  await inloggen(a2);await w(800);s=await store(a2);
  t(s.p.lic==='ns'&&(await recht(a2)).lic==='ns'&&(await slotOp(a2)).every(x=>!x)&&await a2.evaluate(()=>document.documentElement.getAttribute('data-lic'))==='ns','ander apparaat, zelfde account: licentie automatisch mee, alles open');
  // Bas probeert Anna's code
  db.als={id:'u-bas',email:'bas@example.com',naam:'Bas Smit'};
  const b1=await apparaat(b,'app.html');await inloggen(b1);await b1.fill('#obNaam','Bas Smit');await welkom(b1);
  await codeInvullen(b1,CODE1);
  t(/al gebruikt/.test(await b1.textContent('#licentie'))&&!(await store(b1)).p.lic&&db.licCodes[norm(CODE1)].door==='u-anna','andere gebruiker met dezelfde code: "al gebruikt", geen licentie');
  // te vaak proberen
  for(let i=0;i<10;i++){await b1.fill('#licCode','NS-XXXX-XXXX-'+i);await b1.click('#licForm button[type=submit]');await w(250)}
  t(/Te veel/.test(await b1.textContent('#licentie')),'na te veel onjuiste codes: even wachten');
  // Bas neemt Plus (nagebootst, via de server)
  await ga(b1,'plus');await b1.click('[data-act="plus-start"]');await w(200);
  t(/bas@example\.com/.test(await b1.textContent('.pcheck')),'met account: abonnement hoort bij je account (e-mailadres zichtbaar)');
  await b1.click('[data-act="plus-betaal"]');await w(700);
  t(db.abos['u-bas']&&db.abos['u-bas'].status==='actief'&&(await slotOp(b1)).every(x=>!x),'Plus via de server gestart: alles open');
  const b2=await apparaat(b,'app.html');await inloggen(b2);await w(800);
  t((await slotOp(b2)).every(x=>!x)&&(await recht(b2)).abo&&(await recht(b2)).abo.status==='actief','abonnement geldt ook op het tweede apparaat van Bas');
  await ga(b2,'profiel');await b2.click('[data-act="abo-stop"]');await w(150);await b2.click('[data-act="abo-stop-ja"]');await w(500);
  t(db.abos['u-bas'].status==='opgezegd','opzeggen gaat via de server');
  // Anna haalt de licentie weg en vult haar eigen code later weer in
  await ga(a1,'profiel');await a1.click('[data-act="lic-weg"]');await w(150);await a1.click('[data-act="lic-weg-ja"]');await w(600);
  t(!db.lics['u-anna']&&!(await store(a1)).p.lic&&(await slotOp(a1)).every(Boolean),'licentie verwijderen: losgekoppeld van het account, weer op slot');
  await codeInvullen(a1,CODE1);
  t(db.lics['u-anna']==='ns'&&(await store(a1)).p.lic==='ns','eigen code opnieuw invullen werkt (alleen voor hetzelfde account)');
  // licentie die op de server is ingetrokken verdwijnt bij de volgende synchronisatie
  delete db.lics['u-anna'];await ga(a2,'profiel');await a2.click('[data-act="sync"]');await w(900);
  t(!(await store(a2)).p.lic&&(await slotOp(a2)).every(Boolean),'licentie op de server weg: na bijwerken ook in de app weg');
  // uitloggen ruimt de rechten op
  await a2.click('[data-act="logout"]');await w(1200);
  t(!(await a2.evaluate(()=>localStorage.getItem('boa-recht'))),'uitloggen: rechten niet meer op het apparaat');
  // code tijdens het welkomstscherm
  db.als={id:'u-cor',email:'cor@example.com',naam:'Cor Visser'};
  const c1=await apparaat(b,'app.html');await inloggen(c1);
  await c1.fill('#obWerk','NS');await c1.fill('#obLic',CODE2);await c1.click('[data-act="ob-lic"]');await w(700);
  t(db.licCodes[norm(CODE2)].door==='u-cor'&&!(await c1.locator('[data-act="ob-dom"]').count())&&(await c1.inputValue('#obWerk'))==='NS','welkomstscherm: code ingewisseld, domein vast, ingevulde velden blijven staan');
  const errs=[a1,a2,b1,b2,c1].flatMap(x=>x._errs);
  t(!errs.length,'met account: geen JS-fouten'+(errs.length?': '+errs.join(' | '):''));
  await b.close();
  // ================= C. gewone app: geen betaalmuur =================
  const b3=await chromium.launch();
  const ctxG=await b3.newContext({viewport:{width:390,height:844},isMobile:true});const pg=await ctxG.newPage();pg._errs=[];pg.on('pageerror',e=>pg._errs.push(e.message));
  const K=path.join(os.tmpdir(),'boa-gewoon-bm.html');fs.writeFileSync(K,GEWOON.replace(/const CLOUD=(null|\{[^;]*\});/,'const CLOUD=null;'));
  await pg.goto('file://'+K+'#home');await pg.evaluate(pr=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:pr})),PROFIEL);await pg.reload();await w(300);
  await ga(pg,'phb3');
  t(!(await pg.locator('.slotje').count())&&await pg.locator('#app [data-act="mix"]').count()===1&&!/proef/.test(await pg.textContent('.brand .tag')),'gewone app: geen slotjes, PHB 3 open, geen proeflabel');
  await ga(pg,'profiel');t(!(await pg.locator('#abonnement').count()),'gewone app: geen abonnement in het profiel');
  await ga(pg,'plus');t(await pg.locator('.pkaart').count()===0,'gewone app: geen Plus-pagina');
  t(!pg._errs.length,'gewone app: geen JS-fouten');
  await b3.close();supa.close();app.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
