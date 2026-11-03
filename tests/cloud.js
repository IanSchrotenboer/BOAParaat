// Account en cloudopslag: inloggen met Google via Supabase, synchroniseren tussen apparaten, samenvoegen,
// offline, verlopen sessie, uitloggen en account verwijderen. Supabase wordt hier nagebootst door een kleine
// server die dezelfde adressen en regels heeft (PKCE-controle, row level security: alleen je eigen rij).
const path=require('path'),fs=require('fs'),http=require('http'),crypto=require('crypto');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.stack||e).split('\n').slice(0,3).join(' | '));process.exit(1)});
const SRC=process.env.BOA_URL?decodeURIComponent(process.env.BOA_URL.replace(/^file:\/\//,'').split('#')[0]):path.resolve(__dirname,'../uit/Boa-Paraat.html');
const html=fs.readFileSync(SRC,'utf8');
// ---------------- nagebootste Supabase ----------------
const db={users:{},rows:{},codes:{},tokens:{},refresh:{},als:{id:'u-anna',email:'anna@example.com',naam:'Anna de Boer'},calls:[]};
const b64url=b=>b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(obj==null?'':JSON.stringify(obj))}
function tokensVoor(u){const a='at-'+crypto.randomBytes(8).toString('hex'),r='rt-'+crypto.randomBytes(8).toString('hex');db.tokens[a]={u:u.id,exp:Date.now()+3600e3};db.refresh[r]=u.id;
  return {access_token:a,refresh_token:r,expires_in:3600,token_type:'bearer',user:{id:u.id,email:u.email,user_metadata:{full_name:u.naam}}}}
let SUPA='',APP='';
const supa=http.createServer((req,res)=>{let body='';req.on('data',c=>body+=c);req.on('end',()=>{
  const u=new URL(req.url,'http://x');db.calls.push(req.method+' '+u.pathname);
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'});return res.end()}
  if(db.stuk&&u.pathname!=='/auth/v1/authorize')return json(res,503,{message:'storing'});
  if(u.pathname==='/auth/v1/authorize'){ // 'Google': meteen terug naar de app met een code
    const red=u.searchParams.get('redirect_to'),ch=u.searchParams.get('code_challenge');
    if(db.weiger){res.writeHead(302,{Location:red+'?error=access_denied&error_description=Toegang+geweigerd'});return res.end()}
    if(u.searchParams.get('provider')!=='google'||u.searchParams.get('code_challenge_method')!=='s256'||!ch)return json(res,400,{error:'bad'});
    const code='c-'+crypto.randomBytes(6).toString('hex');db.codes[code]={ch,u:{...db.als}};db.users[db.als.id]={...db.als};
    res.writeHead(302,{Location:red+(red.includes('?')?'&':'?')+'code='+code});return res.end()}
  if(u.pathname==='/auth/v1/token'){const b=JSON.parse(body||'{}');
    if(u.searchParams.get('grant_type')==='pkce'){const c=db.codes[b.auth_code];delete db.codes[b.auth_code];
      if(!c||b64url(crypto.createHash('sha256').update(b.code_verifier||'').digest())!==c.ch)return json(res,400,{error:'invalid_grant',error_description:'PKCE klopt niet'});
      return json(res,200,tokensVoor(c.u))}
    if(u.searchParams.get('grant_type')==='refresh_token'){const id=db.refresh[b.refresh_token];delete db.refresh[b.refresh_token];
      if(!id||!db.users[id])return json(res,400,{error:'invalid_grant'});db.vernieuwd=(db.vernieuwd||0)+1;return json(res,200,tokensVoor(db.users[id]))}
    return json(res,400,{error:'grant'})}
  if(u.pathname==='/auth/v1/logout')return json(res,204,null);
  // REST met row level security
  const tok=(req.headers.authorization||'').replace('Bearer ','');const ses=db.tokens[tok];
  if(u.pathname.startsWith('/rest/v1/')){
    if(req.headers.apikey!=='pk-test')return json(res,401,{message:'apikey'});
    if(!ses||ses.exp<Date.now())return json(res,401,{message:'JWT expired'});
    if(u.pathname==='/rest/v1/voortgang'&&req.method==='GET'){const id=(u.searchParams.get('user_id')||'').replace('eq.','');
      return json(res,200,id===ses.u&&db.rows[id]?[{data:db.rows[id].data}]:[])}
    if(u.pathname==='/rest/v1/voortgang'&&req.method==='POST'){const b=JSON.parse(body);
      if(b.user_id!==ses.u)return json(res,403,{message:'row level security'});
      db.rows[b.user_id]={data:b.data,app_versie:b.app_versie,bijgewerkt:Date.now()};db.schrijf=(db.schrijf||0)+1;return json(res,201,null)}
  }
  if(u.pathname==='/functions/v1/verwijder-account'&&req.method==='POST'){if(!ses||ses.exp<Date.now())return json(res,401,{error:'niet ingelogd'});delete db.rows[ses.u];delete db.users[ses.u];for(const [r,id] of Object.entries(db.refresh))if(id===ses.u)delete db.refresh[r];return json(res,200,{verwijderd:true})}
  json(res,404,{message:'?'})})});
const app=http.createServer((req,res)=>{const u=new URL(req.url,'http://x');
  if(u.pathname==='/frame.html'){res.writeHead(200,{'Content-Type':'text/html'});return res.end(`<iframe src="${APP}/app.html#home" style="width:390px;height:800px"></iframe>`)}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html.replace(/const CLOUD=(null|\{[^;]*\});/,'const CLOUD='+JSON.stringify({url:SUPA,key:'pk-test'})+';'))});
const listen=s=>new Promise(r=>s.listen(0,'127.0.0.1',()=>r(s.address().port)));
// ---------------- hulpjes ----------------
const store=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}'));
async function apparaat(b,opts){const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},isMobile:true,hasTouch:true},opts||{}));
  const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));await p.goto(APP+'/app.html#home');await w(300);return p}
async function inloggen(p){await p.click('[data-act="login"]');await p.waitForURL(/app\.html(#.*)?$/,{timeout:5000}).catch(()=>{});await w(900)}
async function kies(p,id,label){await p.click('#'+id+'-cs');await w(120);await p.locator('.cs-list li',{hasText:label}).first().click();await w(150)}
async function welkom(p){await p.fill('#obWerk','Gemeente Utrecht');await kies(p,'obRol','Scholier');await p.click('[data-act="ob-dom"][data-v="1"]');await p.click('.wgo');await w(2200);
  await p.evaluate(()=>{const b=document.querySelector('.kdlg [data-act], .kdlg button');if(b)b.click()});await w(200)}
async function oefen(p,cat,n){await p.evaluate(c=>location.hash=c,'phb1');await w(250);await p.click(`#app .cat [data-act="oefen"][data-cat="${cat}"]`);await w(300);
  for(let i=0;i<n;i++){await p.locator('.opt').first().click();await w(120);const nx=p.locator('[data-act="next"]');if(await nx.count())await nx.first().click();await w(120)}
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(200);
  await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"],[data-act="finish"]');y&&y.click()});await w(300);await p.evaluate(()=>location.hash='home');await w(250)}
const nS=s=>Object.keys((s&&s.s)||{}).length;
(async()=>{
  SUPA='http://127.0.0.1:'+await listen(supa);APP='http://127.0.0.1:'+await listen(app);
  // ---------- samenvoegen (los, zonder browser) ----------
  {const src=fs.readFileSync(path.resolve(__dirname,'../bron/cloud.js'),'utf8');
    const mergeStore=new Function(src.slice(src.indexOf('function mergeStore'),src.indexOf('function wegZet'))+';return mergeStore')();
    const B=()=>({s:{},h:[],x:[],e:{},w:[],wd:null,yt:[],d:{},p:{naam:'',dom:'1'}});
    const a={...B(),t:200,s:{q1:[1,1,1,100],q2:[2,1,0,150]},h:[{d:100,t:'Toets',m:'phb1',k:'toets'}],x:[{id:'x1'}],d:{'2026-11-01':3},p:{naam:'Anna',dom:'4',ob:1}};
    const b={...B(),t:300,s:{q2:[3,2,1,180],q3:[1,0,0,170]},h:[{d:120,t:'Examen',m:'phb1',k:'examen'}],x:[{id:'x2'}],d:{'2026-11-01':5,'2026-11-02':2},p:{naam:'Anna B',dom:'4',ob:1},weg:['x:x1']};
    const m=mergeStore(a,b);
    t(Object.keys(m.s).sort().join()==='q1,q2,q3'&&m.s.q2[0]===3,'samenvoegen: oefenresultaten van beide apparaten, per vraag de nieuwste');
    t(m.h.length===2&&m.h[0].d===120,'samenvoegen: geschiedenis van beide kanten, nieuwste eerst');
    t(m.x.map(x=>x.id).join()==='x2','samenvoegen: een verwijderd examen komt niet terug');
    t(m.d['2026-11-01']===5&&m.d['2026-11-02']===2,'samenvoegen: oefendagen samengevoegd');
    t(m.p.naam==='Anna B'&&m.t===300,'samenvoegen: profiel van de laatst gewijzigde kant');
    const r=mergeStore({...B(),t:500,r:450,p:{ob:1}},a);
    t(!Object.keys(r.s).length&&!r.h.length&&!r.x.length,'samenvoegen: na "Alles wissen" komt oude voortgang niet terug');
    t(JSON.stringify(mergeStore(m,m).s)===JSON.stringify(m.s),'samenvoegen: twee keer hetzelfde geeft hetzelfde')}
  const b=await chromium.launch();
  // ---------- 1. eerste keer: inloggen verplicht ----------
  const p1=await apparaat(b);
  t(await p1.locator('[data-act="login"]').count()===1&&await p1.locator('#tabbar').isHidden(),'eerste start: inlogscherm, geen tabbladen en geen oefenstof zonder inloggen');
  await p1.evaluate(()=>location.hash='phb1');await w(300);
  t(await p1.locator('[data-act="login"]').count()===1&&!(await p1.locator('#app .cat').count()),'ook via een directe link kom je niet langs het inlogscherm');
  await inloggen(p1);
  t(await p1.locator('#obForm').count()===1&&(await p1.inputValue('#obNaam'))==='Anna de Boer','na inloggen: welkomstscherm met de naam uit Google al ingevuld');
  t(!/code=/.test(p1.url()),'de inlogcode staat na het inloggen niet meer in de adresbalk');
  t(await p1.evaluate(()=>{const s=JSON.parse(localStorage.getItem('boa-sessie'));return s&&s.u.email==='anna@example.com'&&!localStorage.getItem('boa-pkce')}),'sessie bewaard, eenmalige inlogsleutel opgeruimd');
  await welkom(p1);
  await oefen(p1,'sr',5);await w(4800);
  t(db.rows['u-anna']&&nS(db.rows['u-anna'].data)>=5&&db.rows['u-anna'].data.p.werk==='Gemeente Utrecht','voortgang en profiel staan na een paar seconden in de cloud');
  await p1.evaluate(()=>location.hash='profiel');await w(300);
  t((await p1.textContent('#account')).includes('anna@example.com')&&/Bewaard in je account/.test(await p1.textContent('#account')),'profiel: account met e-mailadres en "bewaard in je account"');
  // ---------- 2. tweede apparaat: zelfde account ----------
  const p2=await apparaat(b,{viewport:{width:1280,height:800},isMobile:false,hasTouch:false});
  await inloggen(p2);
  t(!(await p2.locator('#obForm').count())&&(await store(p2)).p.werk==='Gemeente Utrecht'&&nS(await store(p2))>=5,'tweede apparaat: na inloggen meteen je profiel en voortgang, geen welkomstscherm');
  await oefen(p2,'ro',4);await w(4800);
  await p1.evaluate(()=>location.hash='profiel');await w(200);await p1.click('[data-act="sync"]');await w(800);
  const s1=await store(p1);
  t(nS(s1)>=9&&nS(db.rows['u-anna'].data)>=9,'apparaat 1 na bijwerken: voortgang van beide apparaten samengevoegd');
  // ---------- 3. offline oefenen ----------
  await p1.context().setOffline(true);await oefen(p1,'pol',3);await w(4800);
  await p1.evaluate(()=>location.hash='profiel');await w(300);
  t(/Offline/.test(await p1.textContent('#account')),'offline: profiel meldt dat het bewaren wacht op verbinding');
  await p1.context().setOffline(false);await w(2500);
  t(nS(db.rows['u-anna'].data)>=12,'weer online: offline geoefende vragen alsnog in de cloud');
  // ---------- 4. verwijderd examen komt niet terug, 'Alles wissen' geldt overal ----------
  await p1.evaluate(()=>location.hash='profiel-examens');await w(250);await p1.click('[data-act="ex-new"]');await w(200);
  await p1.fill('#exDatum','2027-03-01');await p1.click('#exForm button[type=submit]');await w(300);
  const xid=((await store(p1)).x[0]||{}).id;await p1.evaluate(()=>location.hash='profiel');await w(150);await p1.click('[data-act="sync"]');await w(800);
  await p2.evaluate(()=>location.hash='profiel');await w(150);await p2.click('[data-act="sync"]');await w(800);
  const had2=(await store(p2)).x.some(x=>x.id===xid);
  await p1.evaluate(()=>location.hash='profiel-examens');await w(250);
  await p1.evaluate(()=>{const b=document.querySelector('[data-act="ex-del"]');b&&b.click()});await w(150);await p1.evaluate(()=>{const b=document.querySelector('[data-act="ex-del-yes"]');b&&b.click()});await w(200);
  await p1.evaluate(()=>location.hash='profiel');await w(150);await p1.click('[data-act="sync"]');await w(800);
  await p2.click('[data-act="sync"]');await w(800);
  t(xid&&had2&&!(await store(p2)).x.some(x=>x.id===xid)&&!db.rows['u-anna'].data.x.some(x=>x.id===xid),'een op apparaat 1 verwijderd examen verdwijnt ook op apparaat 2 en komt niet terug');
  // ---------- 5. sessie verlopen ----------
  for(const v of Object.values(db.tokens))v.exp=0;const vn=db.vernieuwd||0;
  await p2.click('[data-act="sync"]');await w(900);
  t((db.vernieuwd||0)>vn&&/Bewaard in je account/.test(await p2.textContent('#account')),'verlopen toegang: wordt ongemerkt vernieuwd');
  // ---------- 6. uitloggen: niets blijft achter op het apparaat ----------
  await p2.click('[data-act="logout"]');await w(1200);
  const na=await p2.evaluate(()=>({s:localStorage.getItem('phb-trainer-v1'),ses:localStorage.getItem('boa-sessie')}));
  t(await p2.locator('[data-act="login"]').count()===1&&!na.ses&&(!na.s||!Object.keys(JSON.parse(na.s).s||{}).length),'uitloggen: terug naar inloggen, geen voortgang of sessie meer op het apparaat');
  t(nS(db.rows['u-anna'].data)>=12,'uitloggen: de voortgang staat nog veilig in de cloud');
  // ---------- 7. andere gebruiker op hetzelfde apparaat ----------
  db.als={id:'u-bas',email:'bas@example.com',naam:'Bas Smit'};
  await inloggen(p2);
  t(await p2.locator('#obForm').count()===1&&nS(await store(p2))===0&&!nS(db.rows['u-bas']&&db.rows['u-bas'].data),'andere gebruiker: begint leeg, ziet niets van Anna');
  await p2.fill('#obNaam','Bas Smit');await welkom(p2);await w(4800);
  t(db.rows['u-bas']&&!nS(db.rows['u-bas'].data)&&nS(db.rows['u-anna'].data)>=12,'gegevens van Anna en Bas blijven gescheiden');
  // ---------- 8. bestaande tester met voortgang van vóór de accounts ----------
  db.als={id:'u-cor',email:'cor@example.com',naam:'Cor Visser'};
  const p3=await apparaat(b);
  await p3.evaluate(()=>{localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{q1:[2,2,1,Date.now()],q2:[1,0,0,Date.now()],q3:[1,1,1,Date.now()]},h:[{d:Date.now(),t:'PHB 1 · Oefenexamen',m:'phb1',k:'examen',g:40,n:50,p:1}],x:[],p:{naam:'Cor Visser',dom:'4',werk:'NS',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}}))});
  await p3.reload();await w(300);
  t(await p3.locator('[data-act="login"]').count()===1,'bestaande tester: na de update eerst inloggen');
  await inloggen(p3);await w(500);
  const c=db.rows['u-cor'];
  t(!(await p3.locator('#obForm').count())&&c&&nS(c.data)===3&&c.data.h.length===1&&c.data.p.dom==='4','bestaande tester: eerdere voortgang en profiel gaan mee naar het nieuwe account');
  // ---------- 9. ingetrokken sessie ----------
  for(const k of Object.keys(db.refresh))if(db.refresh[k]==='u-cor')delete db.refresh[k];for(const v of Object.values(db.tokens))v.exp=0;
  await p3.evaluate(()=>location.hash='profiel');await w(200);await p3.click('[data-act="sync"]');await w(900);
  t(await p3.locator('[data-act="login"]').count()===1&&nS(await store(p3))===3,'sessie ingetrokken: terug naar inloggen, voortgang op het apparaat blijft tot je weer inlogt');
  await inloggen(p3);await w(500);
  t(!(await p3.locator('[data-act="login"]').count())&&nS(await store(p3))===3,'opnieuw ingelogd: alles is er nog');
  // ---------- 10. account verwijderen ----------
  await p3.evaluate(()=>location.hash='profiel');await w(250);await p3.click('[data-act="acc-del"]');await w(150);
  t(/definitief/.test(await p3.textContent('#account')),'account verwijderen vraagt eerst om bevestiging');
  await p3.click('[data-act="acc-del-yes"]');await w(900);
  t(!db.rows['u-cor']&&!db.users['u-cor']&&await p3.locator('[data-act="login"]').count()===1&&!nS(await store(p3)),'account verwijderd: in de cloud en op het apparaat, terug naar inloggen');
  // ---------- 11. inloggen geweigerd, server onbereikbaar ----------
  db.weiger=true;await inloggen(p3);
  t(/niet gelukt/.test(await p3.textContent('#app'))&&await p3.locator('[data-act="login"]').count()===1,'inloggen geweigerd bij Google: duidelijke melding, opnieuw proberen kan');
  db.weiger=false;db.stuk=true;await inloggen(p3);
  t(/Probeer het/.test(await p3.textContent('#app'))&&await p3.locator('[data-act="login"]').count()===1,'server onbereikbaar bij het inloggen: melding, de app loopt niet vast');
  // ---------- 12. opstarten zonder verbinding met de database (in de app staat de app zelf op de telefoon) ----------
  await p1.reload();await w(1500);
  t(!(await p1.locator('[data-act="login"]').count())&&nS(await store(p1))>=12,'ingelogd en database onbereikbaar bij het opstarten: de app werkt gewoon met je voortgang');
  db.stuk=false;
  // ---------- 13. ingesloten (zoals in claude.ai) en los bestand: geen inloggen mogelijk ----------
  const p4=await (await b.newContext()).newPage();await p4.goto(APP+'/frame.html');await w(800);
  const fr=p4.frames().find(f=>/app\.html/.test(f.url()));
  t(fr&&!(await fr.locator('[data-act="login"]').count())&&await fr.locator('#obForm').count()===1,'ingesloten voorbeeld: geen inlogscherm (Google kan daar niet), app werkt op het apparaat');
  t((db.calls.filter(c=>c.startsWith('POST /rest')).length)>0,'controle: er is echt naar de nagebootste database geschreven');
  const fouten=[p1,p2,p3].flatMap(p=>p._errs);
  t(!fouten.length,'geen JS-fouten'+(fouten.length?': '+[...new Set(fouten)].slice(0,3).join(' | '):''));
  await b.close();supa.close();app.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
