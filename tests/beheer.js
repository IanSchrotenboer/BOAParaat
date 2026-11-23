// Beheer (www/beheer/, app.boaparaat.nl/beheer) en de knop naar het beheer in de app (Profiel → Account).
// Supabase wordt nagebootst met dezelfde adressen en regels als de echte database (supabase/migrations/…_beheer_overzicht.sql):
// alleen een beheerder krijgt het overzicht; iedereen anders krijgt 'geen toegang'.
const path=require('path'),fs=require('fs'),http=require('http'),crypto=require('crypto');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.stack||e).split('\n').slice(0,3).join(' | '));process.exit(1)});
const ROOT=path.resolve(__dirname,'..');
const beheerHtml=fs.readFileSync(path.join(ROOT,'www/beheer/index.html'),'utf8');
const appHtml=fs.readFileSync(path.join(ROOT,'uit/Boa-Paraat.html'),'utf8');
const NU=Date.now(),DAG=864e5;
const users={'u-beh':{id:'u-beh',email:'beheer@boaparaat.nl',naam:'Ian Beheer'},'u-x':{id:'u-x',email:'piet@example.com',naam:'Piet Gebruiker'}};
const db={tokens:{},refresh:{},codes:{},als:'u-beh',beheerders:new Set(['u-beh']),calls:[]};
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(obj==null?'':JSON.stringify(obj))}
const b64url=b=>b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function tokensVoor(id){const u=users[id];const a='at-'+crypto.randomBytes(8).toString('hex'),r='rt-'+crypto.randomBytes(8).toString('hex');db.tokens[a]=id;db.refresh[r]=id;
  return {access_token:a,refresh_token:r,expires_in:3600,user:{id,email:u.email,user_metadata:{full_name:u.naam}}}}
const RPC={
  ben_ik_beheerder:(uid)=>db.beheerders.has(uid),
  beheer_overzicht:(uid)=>{if(!db.beheerders.has(uid))return {__fout:403};db.overzicht=(db.overzicht||0)+1;const iso=t=>new Date(t).toISOString();
    return {nu:iso(Date.now()),kpi:{gebruikers:3,nu_actief:1,actief_vandaag:2,actief_7d:2,nieuw_7d:1,klassen:1,leerlingcodes:20,leerlingcodes_gebruikt:4,docentcodes:1,docentcodes_gebruikt:1,licentiecodes:3,licentiecodes_gebruikt:0},
      activiteit:Array.from({length:30},(_,i)=>({dag:iso(Date.now()-(29-i)*DAG).slice(0,10),gebruikers:i%3,vragen:i*2})),
      modules:[{module:'rtgb',sessies:4,gebruikers:3,gem_score:71},{module:'rk',sessies:2,gebruikers:1,gem_score:null}],
      gebruikers:[{naam:'Lisa Leerling',email:'lisa@example.com',inlog:'google',rol:'scholier',domein:'1',sinds:iso(NU-9*DAG),laatst:iso(Date.now()-5*6e4),vragen:40,pct_goed:75,week:12,examens:1,bezig:{t:'Oefenexamen BOA Rechtskennis',m:'rk',k:'examen',d:Date.now()-5*6e4,g:30,n:50},klas:'BOA Basis · groep A',licentie:'',versie:'1.13.0'},
        {naam:'Piet Werkend',email:'piet@example.com',inlog:'email',rol:'werkend',domein:'4',sinds:iso(NU-30*DAG),laatst:iso(NU-3*DAG),vragen:10,pct_goed:80,week:10,examens:0,bezig:null,klas:'',licentie:'NS',versie:'1.12.0'},
        {naam:'Jan Docent',email:'docent@opleiding.nl',inlog:'google',rol:'docent',domein:'',sinds:iso(NU-2*DAG),laatst:null,vragen:0,pct_goed:null,week:0,examens:0,bezig:null,klas:'BOA Basis · groep A',licentie:'',versie:''}],
      codes:[{soort:'docent',aan:'BOA Basis · groep A',hint:'BBBB',aangemaakt:iso(NU-9*DAG),gebruikt_op:iso(NU-8*DAG),door:'Jan Docent',email:'docent@opleiding.nl'},
        {soort:'leerling',aan:'BOA Basis · groep A',hint:'DDDD',aangemaakt:iso(NU-9*DAG),gebruikt_op:null,door:'',email:''},
        {soort:'licentie',aan:'NS · Proefversie',hint:'S3GB',aangemaakt:iso(NU-12*DAG),gebruikt_op:null,door:'',email:''}],
      klassen:[{naam:'BOA Basis · groep A',start:'nov 2026',aangemaakt:iso(NU-9*DAG),leerlingcodes:20,leerlingcodes_gebruikt:4,leerlingen:4,actief_7d:2,docenten:['Jan Docent']}]}},};
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
  res.end(u.pathname.startsWith('/beheer/')?metCloud(beheerHtml):metCloud(appHtml))});
const listen=s=>new Promise(r=>s.listen(0,'127.0.0.1',()=>r(s.address().port)));
const sessie=id=>{const j=tokensVoor(id);return {a:j.access_token,r:j.refresh_token,x:Date.now()+3600e3,u:{id,email:users[id].email,naam:users[id].naam}}};
async function pagina(b,opts,init){const c=await b.newContext(Object.assign({viewport:{width:1280,height:900}},opts||{}));
  const p=await c.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));if(init)await c.addInitScript(init);return p}
const tekst=p=>p.evaluate(()=>document.body.innerText);
(async()=>{
  SUPA='http://127.0.0.1:'+await listen(supa);APP='http://127.0.0.1:'+await listen(app);
  const b=await chromium.launch();
  // ---------- 1. inloggen ----------
  let p=await pagina(b);await p.goto(APP+'/beheer/');await w(300);
  t(/Beheer van Boa Paraat/.test(await tekst(p))&&await p.locator('[data-act="google"]').count()===1&&await p.locator('[data-act="mail"]').count()===1,'niet ingelogd: inlogscherm met Google en e-mail');
  t(!db.calls.some(c=>c.includes('beheer_overzicht')),'niet ingelogd: geen gegevens opgevraagd');
  db.als='u-x';await p.click('[data-act="google"]');await p.waitForURL(/\/beheer\/$/,{timeout:5000}).catch(()=>{});await w(700);
  t(db.redirect===APP+'/beheer/','inloggen: Google stuurt terug naar het beheer');
  t(/Alleen voor de beheerder/.test(await tekst(p))&&!db.calls.some(c=>c.includes('beheer_overzicht')),'geen beheerder: duidelijke melding, geen overzicht opgevraagd');
  await p.click('[data-act="uitloggen"]');await w(300);
  t(await p.locator('[data-act="google"]').count()===1&&!(await p.evaluate(()=>localStorage.getItem('boa-sessie'))),'uitloggen: terug naar inloggen, sessie weg');
  // ---------- 2. beheerder ----------
  db.als='u-beh';await p.click('[data-act="google"]');await p.waitForURL(/\/beheer\/$/,{timeout:5000}).catch(()=>{});await w(800);
  t(/Overzicht/.test(await p.textContent('main h1')),'beheerder: na inloggen het overzicht');
  t(await p.locator('#ovTiles .tile').count()===4&&/Nu bezig/.test(await p.textContent('#ovTiles')),'overzicht: kerncijfers met wie er nu bezig is');
  t(/Opleiders[\s\S]*1\/1[\s\S]*Studenten[\s\S]*4\/20[\s\S]*Organisaties[\s\S]*0\/3/.test(await p.textContent('#ovLic')),'overzicht: uitgegeven codes voor opleiders, studenten en organisaties');
  t(/Ambtsinstructie \(RTGB\)/.test(await p.textContent('#ovMods'))&&await p.locator('.dagen span').count()===30,'overzicht: modules en activiteit per dag');
  t(await p.locator('#ovRijen tbody tr').count()===3&&/Oefenexamen BOA Rechtskennis/.test(await p.textContent('#ovRijen'))&&/min geleden/.test(await p.textContent('#ovRijen')),'overzicht: gebruikers met waar ze mee bezig zijn');
  await p.fill('#ovZoek','piet');await w(150);
  t(await p.locator('#ovRijen tbody tr').count()===1&&await p.evaluate(()=>document.activeElement.id)==='ovZoek','overzicht: zoeken, cursor blijft in het zoekveld');
  await p.fill('#ovZoek','');await p.selectOption('#ovRol','scholier');await w(150);
  t(await p.locator('#ovRijen tbody tr').count()===1&&/Lisa/.test(await p.textContent('#ovRijen')),'overzicht: filter op rol');
  await p.click('[data-ovtab="codes"]');await w(150);
  t(await p.locator('#ovRijen tbody tr').count()===3&&/…S3GB/.test(await p.textContent('#ovRijen')),'overzicht: codes, alleen de laatste vier tekens');
  await p.selectOption('#ovVoor','licentie');await w(150);
  t(await p.locator('#ovRijen tbody tr').count()===1,'overzicht: codes filteren op organisatie');
  await p.selectOption('#ovVoor','');await p.selectOption('#ovStatus','gebruikt');await w(150);
  t(await p.locator('#ovRijen tbody tr').count()===1&&/Jan Docent/.test(await p.textContent('#ovRijen')),'overzicht: codes filteren op gebruikt');
  await p.click('[data-ovtab="klassen"]');await w(150);
  t(/BOA Basis · groep A/.test(await p.textContent('#ovTab')),'overzicht: klassen');
  const voor=db.overzicht;await p.click('[data-act="ov-vernieuw"]');await w(300);
  t(db.overzicht===voor+1&&await p.locator('[data-ovtab="klassen"][aria-selected="true"]').count()===1,'overzicht: vernieuwen haalt opnieuw op en blijft op hetzelfde tabblad');
  await p.setViewportSize({width:390,height:844});await w(200);
  t(await p.evaluate(()=>document.documentElement.scrollWidth<=390),'telefoon: geen horizontaal scrollen van de pagina');
  t(!p._errs.length,'beheer: geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // ---------- 3. verlopen sessie ----------
  const oud=sessie('u-beh');oud.x=Date.now()-1000;
  p=await pagina(b,{},`localStorage.setItem('boa-sessie',${JSON.stringify(JSON.stringify(oud))})`);await p.goto(APP+'/beheer/');await w(800);
  t(/Overzicht/.test(await p.textContent('main h1')),'verlopen toegangsbewijs: wordt vernieuwd, overzicht laadt');
  await p.context().close();
  // ---------- 4. de app: knop naar het beheer ----------
  const store={p:{naam:'Ian',dom:'1',ob:1,thema:'systeem',mld:{oefen:false,examen:false,tijd:'19:00'}},s:{},h:[],x:[],e:{},w:[],yt:[],k:[],d:{},t:Date.now()};
  const init=id=>`if(!sessionStorage.getItem('init')){sessionStorage.setItem('init','1');localStorage.setItem('boa-sessie',${JSON.stringify(JSON.stringify(sessie(id)))});localStorage.setItem('phb-trainer-v1',${JSON.stringify(JSON.stringify(store))})}`;
  const pa=await pagina(b,{viewport:{width:390,height:844},isMobile:true,hasTouch:true},init('u-beh'));
  await pa.goto(APP+'/app.html#profiel-account');await w(1000);
  t(await pa.locator('#beheer a[href$="/beheer/"]').count()===1,'app: beheerder ziet bij Account een knop naar het beheer');
  t(!pa._errs.length,'app beheerder: geen JS-fouten'+(pa._errs.length?': '+pa._errs.join(' | '):''));await pa.context().close();
  const px=await pagina(b,{viewport:{width:390,height:844},isMobile:true,hasTouch:true},init('u-x'));
  await px.goto(APP+'/app.html#profiel-account');await w(1000);
  t(await px.locator('#account').count()===1&&await px.locator('#beheer').count()===0,'app: geen beheerder, dan ook geen knop naar het beheer');
  t(!px._errs.length,'app: geen JS-fouten'+(px._errs.length?': '+px._errs.join(' | '):''));await px.context().close();
  await b.close();supa.close();app.close();
  console.log(out.join('\n'));const f=out.filter(x=>x.startsWith('FAIL')).length;console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0)})();
