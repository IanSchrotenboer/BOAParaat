// Docentenomgeving (www/docent/) en de klascode in de app (Profiel → Klas). Supabase wordt nagebootst met dezelfde
// adressen en regels als de echte database (supabase/migrations/…_klassen_docenten.sql): een docent ziet alleen
// klassen waarvan hij de docentcode heeft gebruikt, een leerlingcode werkt niet in de docentenomgeving, codes zijn
// eenmalig en alleen de beheerder maakt klassen aan.
const path=require('path'),fs=require('fs'),http=require('http'),crypto=require('crypto'),vm=require('vm');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.stack||e).split('\n').slice(0,3).join(' | '));process.exit(1)});
const ROOT=path.resolve(__dirname,'..');
const docentHtml=fs.readFileSync(path.join(ROOT,'www/docent/index.html'),'utf8');
const appHtml=fs.readFileSync(path.join(ROOT,'uit/Boa-Paraat.html'),'utf8');
// echte vraag-id's (zelfde berekening als de app)
const ctx={};vm.createContext(ctx);
vm.runInContext([1,2,3,4,5,6,7,8,9].map(i=>fs.readFileSync(path.join(ROOT,'bron/q'+i+'.js'),'utf8')).join(';\n')+
  ';function hash(s){let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return "q"+(h>>>0).toString(36)};this.ALL=[].concat(Q1,Q2,Q3,Q4,Q5,Q6,Q7,Q8,Q9).map(r=>({id:r[5]||hash(r[1]),c:r[0],q:r[1],a:r[2][0]}))',ctx);
const ALL=ctx.ALL;const phb1=ALL.filter(q=>!/^(com|agr|prof|waa|pv|avg|wijk|cult|jgd|ai)/.test(q.c));
// ---------------- nagebootste Supabase ----------------
const NU=Date.now(),DAG=864e5;
const users={'u-doc':{id:'u-doc',email:'docent@opleiding.nl',naam:'Jan Docent'},'u-lisa':{id:'u-lisa',email:'lisa@example.com',naam:'Lisa Leerling'},'u-beh':{id:'u-beh',email:'beheer@boaparaat.nl',naam:'Ian Beheer'}};
const db={tokens:{},refresh:{},codes:{},als:'u-doc',beheerders:new Set(['u-beh']),klassen:{},klascodes:{},leden:[],pogingen:0,calls:[]};
const KID=crypto.randomUUID();db.klassen[KID]={id:KID,naam:'BOA Basis · groep A',start:'sep 2026'};
const hashC=c=>String(c).toUpperCase().replace(/[^A-Z0-9]/g,'');
db.klascodes[hashC('DOC-AAAA-BBBB')]={klas:KID,rol:'docent'};db.klascodes[hashC('KLAS-CCCC-DDDD')]={klas:KID,rol:'leerling'};db.klascodes[hashC('KLAS-EEEE-FFFF')]={klas:KID,rol:'leerling'};
// vier leerlingen met resultaten; vraag HARD hebben drie van de vier nu fout
const HARD=phb1[5].id,MID=phb1[9].id;
function s(goedTot,extra,dagen){const o={};phb1.slice(0,40).forEach((q,i)=>{o[q.id]=[2,i<goedTot?2:1,i<goedTot?1:0,NU-(dagen||2)*DAG]});Object.assign(o,extra||{});return o}
const leerlingen=[
  {id:'u-a',naam:'Sanne de Wit',email:'sanne@example.com',s:s(36,{[HARD]:[3,1,0,NU-DAG]}),h:[{d:NU-DAG,t:'PHB 1 · Oefenexamen Wet- en regelgeving',m:'phb1',k:'examen',g:41,n:50,p:1}],k:[{id:'k1',cs:'cal-markt',d:NU-3*DAG,p:27,m:31,o:'Goed'}],d:{[new Date(NU-DAG).toISOString().slice(0,10)]:30}},
  {id:'u-b',naam:'Bram Mulder',email:'bram@example.com',s:s(22,{[HARD]:[2,0,0,NU-DAG],[MID]:[1,0,0,NU-DAG]}),h:[{d:NU-2*DAG,t:'PHB 1 · Oefenexamen Wet- en regelgeving',m:'phb1',k:'examen',g:30,n:50,p:0}],k:[],d:{}},
  {id:'u-c',naam:'Noor Hendriks',email:'noor@example.com',s:s(30,{[HARD]:[1,0,0,NU-20*DAG]},20),h:[],k:[{id:'k2',cs:'g-markt',d:NU-20*DAG,p:6,m:12,o:'Onvoldoende'}],d:{}},
  {id:'u-d',naam:'Youssef Bouzid',email:'youssef@example.com',s:{},h:[],k:[],d:{}}];
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(obj==null?'':JSON.stringify(obj))}
const b64url=b=>b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function tokensVoor(id){const u=users[id];const a='at-'+crypto.randomBytes(8).toString('hex'),r='rt-'+crypto.randomBytes(8).toString('hex');db.tokens[a]=id;db.refresh[r]=id;
  return {access_token:a,refresh_token:r,expires_in:3600,user:{id,email:u.email,user_metadata:{full_name:u.naam}}}}
const klasVan=(uid,rol)=>db.leden.filter(l=>l.u===uid&&(!rol||l.rol===rol)).map(l=>l.k);
const RPC={
  mijn_klassen:(uid)=>db.leden.filter(l=>l.u===uid).map(l=>({...db.klassen[l.k],rol:l.rol,docenten:db.leden.filter(x=>x.k===l.k&&x.rol==='docent').map(x=>users[x.u].naam),leerlingen:l.rol==='docent'?leerlingen.length:null})),
  ben_ik_beheerder:(uid)=>db.beheerders.has(uid),
  klascode_inwisselen:(uid,b)=>{const h=hashC(b.code);const c=db.klascodes[h];
    if(b.verwacht&&c&&c.rol!==b.verwacht)return {ok:false,reden:'soort',rol:c.rol};
    if(!c){db.pogingen++;return {ok:false,reden:'onbekend'}}
    if(c.door&&c.door!==uid){db.pogingen++;return {ok:false,reden:'gebruikt'}}
    c.door=uid;if(!db.leden.some(l=>l.k===c.klas&&l.u===uid))db.leden.push({k:c.klas,u:uid,rol:c.rol});
    return {ok:true,rol:c.rol,klas:db.klassen[c.klas]}},
  klas_verlaten:(uid,b)=>{db.leden=db.leden.filter(l=>!(l.k===b.klas&&l.u===uid));db.verlaten=b.klas;return {ok:true}},
  docent_klas:(uid,b)=>{if(!klasVan(uid,'docent').includes(b.klas))return {__fout:403};
    return {klas:db.klassen[b.klas],leerlingen,codes:{leerling:20,gebruikt:4}}},
  beheer_klas_maken:(uid,b)=>{if(!db.beheerders.has(uid))return {__fout:403};const id=crypto.randomUUID();db.klassen[id]={id,naam:b.naam,start:b.start};
    const ll=Array.from({length:b.aantal},(_,i)=>'KLAS-T'+String(i).padStart(3,'0')+'-ABCD');return {id,naam:b.naam,docent:'DOC-NIEU-WCOD',leerlingen:ll}},
  beheer_klassen:(uid)=>db.beheerders.has(uid)?Object.values(db.klassen).map(k=>({...k,leerlingcodes:20,leerlingcodes_gebruikt:4,docenten:[],docentcode_open:true})):{__fout:403},
  beheer_codes_erbij:(uid,b)=>db.beheerders.has(uid)?{rol:b.rol,codes:b.rol==='docent'?['DOC-EXTR-AAAA']:['KLAS-X1','KLAS-X2','KLAS-X3','KLAS-X4','KLAS-X5']}:{__fout:403},
  beheer_klas_verwijderen:(uid,b)=>{if(!db.beheerders.has(uid))return {__fout:403};delete db.klassen[b.klas];return {ok:true}}};
let SUPA='',APP='';
const supa=http.createServer((req,res)=>{let body='';req.on('data',c=>body+=c);req.on('end',()=>{
  const u=new URL(req.url,'http://x');db.calls.push(u.pathname);
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'});return res.end()}
  if(u.pathname==='/auth/v1/authorize'){const red=u.searchParams.get('redirect_to'),ch=u.searchParams.get('code_challenge');db.redirect=red;
    const code='c-'+crypto.randomBytes(6).toString('hex');db.codes[code]={ch,u:db.als};res.writeHead(302,{Location:red+'?code='+code});return res.end()}
  if(u.pathname==='/auth/v1/token'){const b=JSON.parse(body||'{}');
    if(u.searchParams.get('grant_type')==='pkce'){const c=db.codes[b.auth_code];delete db.codes[b.auth_code];
      if(!c||b64url(crypto.createHash('sha256').update(b.code_verifier||'').digest())!==c.ch)return json(res,400,{error:'invalid_grant'});return json(res,200,tokensVoor(c.u))}
    const id=db.refresh[b.refresh_token];delete db.refresh[b.refresh_token];if(!id)return json(res,400,{error:'invalid_grant'});return json(res,200,tokensVoor(id))}
  if(u.pathname==='/auth/v1/logout'){db.uitgelogd=true;return json(res,204,null)}
  const uid=db.tokens[(req.headers.authorization||'').replace('Bearer ','')];
  if(u.pathname.startsWith('/rest/v1/')){if(req.headers.apikey!=='pk-test')return json(res,401,{message:'apikey'});if(!uid)return json(res,401,{message:'JWT expired'});
    if(u.pathname==='/rest/v1/voortgang')return json(res,req.method==='GET'?200:201,req.method==='GET'?[]:null);
    const f=RPC[u.pathname.replace('/rest/v1/rpc/','')];if(!f)return json(res,404,{message:'?'});
    const r=f(uid,JSON.parse(body||'{}'));if(r&&r.__fout)return json(res,r.__fout,{message:'geen toegang'});return json(res,200,r)}
  json(res,404,{message:'?'})})});
const metCloud=h=>h.replace(/const CLOUD=(null|\{[^;]*?\});/,'const CLOUD='+JSON.stringify({url:SUPA,key:'pk-test',email:true})+';');
const app=http.createServer((req,res)=>{const u=new URL(req.url,'http://x');res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  res.end(u.pathname.startsWith('/docent/')?metCloud(docentHtml):metCloud(appHtml))});
const listen=s=>new Promise(r=>s.listen(0,'127.0.0.1',()=>r(s.address().port)));
const sessie=id=>{const j=tokensVoor(id);return {a:j.access_token,r:j.refresh_token,x:Date.now()+3600e3,u:{id,email:users[id].email,naam:users[id].naam}}};
async function pagina(b,opts,init){const c=await b.newContext(Object.assign({viewport:{width:1280,height:900}},opts||{}));await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:APP}).catch(()=>{});
  const p=await c.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));if(init)await c.addInitScript(init);return p}
const tekst=p=>p.evaluate(()=>document.body.innerText);
(async()=>{
  SUPA='http://127.0.0.1:'+await listen(supa);APP='http://127.0.0.1:'+await listen(app);
  const b=await chromium.launch();
  // ---------- 1. inloggen in de docentenomgeving ----------
  let p=await pagina(b);await p.goto(APP+'/docent/');await w(300);
  t(await p.locator('[data-act="google"]').count()===1&&await p.locator('[data-act="mail"]').count()===1&&/Bekijk de voortgang van je klassen/.test(await tekst(p)),'inloggen: scherm met Google en e-mail');
  await p.click('[data-act="google"]');await p.waitForURL(/\/docent\/(#.*)?$/,{timeout:5000}).catch(()=>{});await w(700);
  t(db.redirect===APP+'/docent/','inloggen: Google stuurt terug naar de docentenomgeving');
  t(/Je hebt nog geen klassen/.test(await tekst(p))&&await p.locator('#docCode').count()===1,'zonder klassen: welkom en een veld voor de docentcode');
  t(await p.evaluate(()=>!location.search),'na inloggen staat de code niet meer in de adresbalk');
  t(await p.locator('a[href="#beheer"]').count()===0,'geen beheerder: geen beheer');
  // ---------- 2. klas toevoegen ----------
  await p.fill('#docCode','KLAS-CCCC-DDDD');await p.click('#addForm button');await w(400);
  t(/Dit is een leerlingcode/.test(await tekst(p))&&!db.klascodes[hashC('KLAS-CCCC-DDDD')].door,'leerlingcode in de docentenomgeving: duidelijke melding, code blijft ongebruikt');
  await p.fill('#docCode','DOC-ZZZZ-ZZZZ');await p.click('#addForm button');await w(400);
  t(/kennen we niet/.test(await tekst(p)),'onbekende docentcode: melding');
  await p.fill('#docCode','doc aaaa bbbb');await p.click('#addForm button');await w(900);
  t(await p.locator('.klasknop',{hasText:'BOA Basis · groep A'}).count()===1&&/BOA Basis · groep A/.test(await p.textContent('main h1')),'docentcode: klas toegevoegd en geopend');
  t(await p.locator('tbody tr').count()===4,'klas: 4 leerlingen in de tabel');
  const tiles=await p.locator('.tile .v').allTextContents();
  t(tiles[0]==='4'&&tiles[1]==='2'&&tiles[3]==='1/2','klas: 4 leerlingen, 2 deze week actief, 1 van 2 examens voldoende ('+tiles.join(', ')+')');
  t(/4 van 20 leerlingcodes gebruikt/.test(await tekst(p)),'klas: gebruik van de leerlingcodes');
  // ---------- 3. sorteren en zoeken ----------
  await p.click('[data-sort="goed"]');await w(150);
  const eerste=await p.locator('tbody tr:first-child .naam').textContent();
  t(eerste==='Sanne de Wit','sorteren op % goed: beste leerling bovenaan ('+eerste+')');
  t(await p.locator('tbody tr',{hasText:'Youssef'}).locator('.pill',{hasText:'Nog niet begonnen'}).count()===1,'leerling zonder resultaten: Nog niet begonnen');
  t(await p.locator('tbody tr',{hasText:'Noor'}).locator('.pill.warn').count()===1,'leerling die lang niet oefende: waarschuwing');
  t(await p.locator('tbody tr',{hasText:'Bram'}).locator('.pill.bad',{hasText:'Examen onvoldoende'}).count()===1,'examen onvoldoende: rode melding');
  await p.fill('#zoek','bram');await w(200);
  t(await p.locator('tbody tr').count()===1&&await p.evaluate(()=>document.activeElement.id==='zoek'),'zoeken: alleen Bram, focus blijft in het zoekveld');
  await p.fill('#zoek','');await w(150);
  // ---------- 4. meest fout ----------
  await p.click('[data-tab="fout"]');await w(250);
  const hardQ=ALL.find(q=>q.id===HARD).q;const sc=await p.locator('.vraag').first().locator('.score').textContent();
  t(/100%/.test(sc)&&/3 van 3 fout/.test(sc)&&(await p.locator('.vraag .vt').allTextContents()).includes(hardQ)&&await p.locator('.vraag').count()===10,'meest fout: top 10, bovenaan 3 van 3 fout, de lastige vraag staat erin');
  await p.locator('.vraag summary').first().click();await w(150);
  t(/Juist:/.test(await p.locator('.vraag').first().textContent())&&/Bram Mulder/.test(await p.locator('.vraag').first().textContent()),'meest fout: juiste antwoord en bij wie hij nog fout is');
  t(await p.locator('.barrow').count()>0,'meest fout: onderwerpen met de meeste fouten');
  await p.selectOption('#modFilter','rtgb');await w(200);
  t(/Nog te weinig gemaakte vragen in deze module/.test(await tekst(p)),'meest fout: filter op module 5 (geen gegevens) geeft een duidelijke melding');
  await p.selectOption('#modFilter','');await w(150);
  await p.click('[data-kopieer="klas"]');await w(300);
  const klip=await p.evaluate(()=>navigator.clipboard.readText()).catch(()=>'');
  t(/Lesopdracht voor BOA Basis/.test(klip)&&klip.includes(hardQ),'kopieer als lesopdracht: top 10 van de klas als tekst');
  // ---------- 5. leerling ----------
  await p.click('[data-tab="leerlingen"]');await w(150);await p.locator('tbody tr',{hasText:'Bram'}).click();await w(400);
  t(/Bram Mulder/.test(await p.textContent('main h1'))&&/bram@example.com/.test(await tekst(p)),'leerling: naam en e-mailadres');
  const foutN=await p.locator('.groep .vraag').count();
  t(foutN===20,'leerling: alle vragen die nu nog fout zijn ('+foutN+')');
  t(/Oefenexamen Wet- en regelgeving/.test(await tekst(p))&&await p.locator('.examrow .pill.bad').count()===1,'leerling: oefenexamen met uitslag');
  t(await p.locator('.modrow').count()===6&&/BOA Rechtskennis/.test(await tekst(p))&&/Melding opnemen en verwerken/.test(await tekst(p)),'leerling: voortgang per vak van de opleiding (6 vakken)');
  await p.click('[data-kopieer="leerling"]');await w(300);
  const klip2=await p.evaluate(()=>navigator.clipboard.readText()).catch(()=>'');
  t(/Lesopdracht voor Bram Mulder/.test(klip2)&&(klip2.match(/\n\d+\. /g)||[]).length===20,'kopieer als lesopdracht: de 20 foute vragen van Bram');
  const hashL=await p.evaluate(()=>location.hash);
  await p.reload();await w(900);
  t(/Bram Mulder/.test(await p.textContent('main h1')),'herladen op een leerling: dezelfde leerling blijft open ('+hashL.slice(0,20)+'…)');
  await p.click('.terug');await w(300);
  t(/BOA Basis · groep A/.test(await p.textContent('main h1')),'terug naar de klas');
  await p.click('[data-act="vernieuw"]');await w(400);
  t(db.calls.filter(c=>c==='/rest/v1/rpc/docent_klas').length>=3,'vernieuwen haalt de klas opnieuw op');
  t(!p._errs.length,'docent: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  // ---------- 6. telefoon ----------
  const ses=await p.evaluate(()=>localStorage.getItem('boa-sessie'));
  const pt=await pagina(b,{viewport:{width:390,height:844},isMobile:true,hasTouch:true},`localStorage.setItem('boa-sessie',${JSON.stringify(ses)})`);
  await pt.goto(APP+'/docent/#klas-'+KID);await w(900);
  t(await pt.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'telefoon: geen horizontaal scrollen (de tabel scrolt zelf)');
  t(await pt.locator('tbody tr').count()===4,'telefoon: klas zichtbaar met dezelfde sessie');
  const kl=await pt.locator('.btn,.tabs button').evaluateAll(els=>els.filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect().height).filter(h=>h<36).length);
  t(kl===0,'telefoon: knoppen groot genoeg om op te tikken');
  await pt.context().close();
  // ---------- 7. uitloggen ----------
  await p.click('[data-act="uitloggen"]');await w(300);
  t(await p.locator('[data-act="google"]').count()===1&&!(await p.evaluate(()=>localStorage.getItem('boa-sessie'))),'uitloggen: terug naar inloggen, sessie weg');
  await p.context().close();
  // ---------- 8. beheer ----------
  const pb=await pagina(b,{},`localStorage.setItem('boa-sessie',${JSON.stringify(JSON.stringify(sessie('u-beh')))})`);
  await pb.goto(APP+'/docent/');await w(700);
  t(await pb.locator('a[href="#beheer"]').count()===1,'beheerder: link naar beheer');
  await pb.click('a[href="#beheer"]');await w(500);
  t(/Alle klassen/.test(await tekst(pb))&&await pb.locator('#beheerLijst .kaart').count()===1,'beheer: lijst met klassen');
  await pb.fill('#kNaam','');await pb.click('#klasForm button[type="submit"]');await w(200);
  t(/Geef de klas een naam/.test(await tekst(pb)),'beheer: naam verplicht');
  await pb.fill('#kNaam','BOA Basis · groep B');await pb.fill('#kStart','jan 2027');await pb.fill('#kAantal','12');await pb.click('#klasForm button[type="submit"]');await w(500);
  t(await pb.locator('.codes code').count()===13&&await pb.locator('.codes code.doc').count()===1&&/Bewaar deze codes nu/.test(await tekst(pb)),'beheer: klas aangemaakt, 12 leerlingcodes en 1 docentcode getoond');
  await pb.click('[data-kopieer="codes"]');await w(300);
  const klip3=await pb.evaluate(()=>navigator.clipboard.readText()).catch(()=>'');
  t(/Docentcode: DOC-NIEU-WCOD/.test(klip3)&&(klip3.match(/KLAS-/g)||[]).length===12,'beheer: alle codes kopiëren');
  await pb.locator('[data-act="codes-erbij"][data-rol="docent"]').first().click();await w(400);
  t(await pb.locator('.codes code.doc',{hasText:'DOC-EXTR-AAAA'}).count()===1,'beheer: nieuwe docentcode voor een bestaande klas');
  await pb.locator('[data-act="klas-weg"]').last().click();await w(300);
  t(await pb.locator('.confirm').count()===1,'beheer: verwijderen vraagt eerst om bevestiging');
  await pb.click('[data-act="klas-weg-nee"]');await w(300);
  t(!pb._errs.length,'beheer: geen JS-fouten'+(pb._errs.length?': '+pb._errs.join(' | '):''));
  await pb.context().close();
  // ---------- 9. de app: klascode in Profiel ----------
  const store={p:{naam:'Lisa',dom:'1',ob:1,rol:'werkend',thema:'systeem',mld:{oefen:false,examen:false,tijd:'19:00'}},s:{},h:[],x:[],e:{},w:[],yt:[],k:[],d:{},t:Date.now()};
  const pa=await pagina(b,{viewport:{width:390,height:844},isMobile:true,hasTouch:true},`if(!sessionStorage.getItem('init')){sessionStorage.setItem('init','1');localStorage.setItem('boa-sessie',${JSON.stringify(JSON.stringify(sessie('u-lisa')))});localStorage.setItem('phb-trainer-v1',${JSON.stringify(JSON.stringify(store))})}`);
  db.als='u-lisa';
  await pa.goto(APP+'/app.html#profiel');await w(900);
  t(await pa.locator('#klas').count()===1&&await pa.locator('#klasCode').count()===1,'app: Profiel heeft het onderdeel Klas');
  t(/docent je oefenresultaten zien/.test(await pa.textContent('#klas')),'app: vooraf staat erbij dat de docent je resultaten ziet');
  await pa.fill('#klasCode','KLAS-0000-0000');await pa.click('#klasForm button');await w(500);
  t(/kennen we niet/.test(await pa.textContent('#klas')),'app: onbekende code geeft een melding');
  await pa.fill('#klasCode','KLAS-CCCC-DDDD');await pa.click('#klasForm button');await w(800);
  t(/BOA Basis · groep A/.test(await pa.textContent('#klas'))&&/Docent: Jan Docent/.test(await pa.textContent('#klas')),'app: in de klas, met de naam van de docent');
  const st1=await pa.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).p.klas);
  t(Array.isArray(st1)&&st1[0].rol==='leerling','app: klas bewaard in de voortgang (ook offline bekend)');
  await pa.evaluate(()=>location.hash='home');await w(400);
  const thuis=await pa.evaluate(()=>document.getElementById('app').innerText);
  t(/BOA Rechtskennis/.test(thuis)&&/Melding opnemen en verwerken/.test(thuis)&&!/PHB 1\b/.test(thuis),'app: in een klas de vakken van de opleiding in plaats van PHB 1 t/m 4');
  await pa.reload();await w(800);
  t(/BOA Rechtskennis/.test(await pa.evaluate(()=>document.getElementById('app').innerText)),'app: na herladen nog steeds de vakken van de opleiding');
  await pa.evaluate(()=>location.hash='profiel');await w(400);
  await pa.click('[data-act="klas-weg"]');await w(200);
  t(/Klas verlaten\?/.test(await pa.textContent('#klas')),'app: klas verlaten vraagt om bevestiging');
  await pa.click('[data-act="klas-weg-ja"]');await w(600);
  t(db.verlaten===KID&&!(await pa.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')).p.klas)),'app: klas verlaten');
  await pa.evaluate(()=>location.hash='home');await w(400);
  t(/PHB 1/.test(await pa.evaluate(()=>document.getElementById('app').innerText)),'app: na verlaten weer PHB 1');
  // docentcode in de app
  db.klascodes[hashC('DOC-AAAA-BBBB')].door=null;
  await pa.evaluate(()=>location.hash='profiel');await w(400);await pa.fill('#klasCode','DOC-AAAA-BBBB');await pa.click('#klasForm button');await w(800);
  t(await pa.locator('#klas a[href$="/docent/"]').count()===1,'app: met een docentcode een knop naar de docentenomgeving');
  t(!pa._errs.length,'app: geen JS-fouten'+(pa._errs.length?': '+pa._errs.join(' | '):''));
  await b.close();supa.close();app.close();
  console.log(out.join('\n'));const f=out.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0)})();
