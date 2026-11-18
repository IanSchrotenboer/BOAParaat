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
function tokensVoor(u,aal){const a='at-'+crypto.randomBytes(8).toString('hex'),r='rt-'+crypto.randomBytes(8).toString('hex');db.tokens[a]={u:u.id,exp:Date.now()+3600e3,aal:aal||'aal1'};db.refresh[r]=u.id;
  return {access_token:a,refresh_token:r,expires_in:3600,token_type:'bearer',user:{id:u.id,email:u.email,user_metadata:{full_name:u.naam},factors:(db.factors&&db.factors[u.id])||[]}}}
let SUPA='',APP='';
const supa=http.createServer((req,res)=>{let body='';req.on('data',c=>body+=c);req.on('end',()=>{
  const u=new URL(req.url,'http://x');db.calls.push(req.method+' '+u.pathname);
  if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,PUT,PATCH,DELETE,OPTIONS'});return res.end()}
  if(db.stuk&&u.pathname!=='/auth/v1/authorize')return json(res,503,{message:'storing'});
  if(u.pathname==='/auth/v1/authorize'){ // 'Google': meteen terug naar de app met een code
    const red=u.searchParams.get('redirect_to'),ch=u.searchParams.get('code_challenge');
    if(db.weiger){res.writeHead(302,{Location:red+'?error=access_denied&error_description=Toegang+geweigerd'});return res.end()}
    const prov=u.searchParams.get('provider');db.prov=prov;db.prompt=u.searchParams.get('prompt');
    db.scopes=u.searchParams.get('scopes');
    if(!['google','apple','azure'].includes(prov)||u.searchParams.get('code_challenge_method')!=='s256'||!ch)return json(res,400,{error:'bad'});
    const code='c-'+crypto.randomBytes(6).toString('hex');db.codes[code]={ch,u:{...db.als}};db.users[db.als.id]={...db.als};
    res.writeHead(302,{Location:red+(red.includes('?')?'&':'?')+'code='+code});return res.end()}
  if(u.pathname==='/auth/v1/otp'&&req.method==='POST'){const b=JSON.parse(body||'{}');
    if(req.headers.apikey!=='pk-test'||!b.email)return json(res,400,{error:'bad'});
    if(db.otpTe429)return json(res,429,{error:'over_email_send_rate_limit'});
    if(db.otpSec)return json(res,429,{code:429,error_code:'over_email_send_rate_limit',msg:'For security purposes, you can only request this after 37 seconds.'});
    if(db.otpUur)return json(res,429,{code:429,error_code:'over_email_send_rate_limit',msg:'email rate limit exceeded'});
    db.otp=db.otp||{};db.otp[b.email]='482916';db.otpMails=(db.otpMails||0)+1;return json(res,200,{})}
  // wachtwoord: account maken, inloggen, vergeten (code per mail) en instellen
  if(u.pathname==='/auth/v1/signup'&&req.method==='POST'){const b=JSON.parse(body||'{}');db.pw=db.pw||{};
    if(db.signupUit)return json(res,422,{code:422,error_code:'signup_disabled',msg:'Signups not allowed for this instance'});
    if(db.pw[b.email])return json(res,422,{code:422,error_code:'user_already_exists',msg:'User already registered'});
    if(!b.password||b.password.length<8)return json(res,422,{code:422,error_code:'weak_password',msg:'Password should be at least 8 characters.'});
    db.pw[b.email]=b.password;const usr={id:'u-pw-'+b.email.length,email:b.email,naam:''};db.users[usr.id]=usr;
    if(db.bevestig){db.otp=db.otp||{};db.otp[b.email]='482916';db.otpMails=(db.otpMails||0)+1;return json(res,200,{id:usr.id,email:b.email})}
    return json(res,200,tokensVoor(usr))}
  if(u.pathname==='/auth/v1/recover'&&req.method==='POST'){const b=JSON.parse(body||'{}');db.rec=db.rec||{};db.rec[b.email]='771204';db.otpMails=(db.otpMails||0)+1;return json(res,200,{})}
  if(u.pathname==='/auth/v1/verify'&&req.method==='POST'&&JSON.parse(body||'{}').type==='recovery'){const b=JSON.parse(body);
    if(!db.rec||db.rec[b.email]!==b.token)return json(res,403,{error_code:'otp_expired',msg:'Token has expired or is invalid'});
    delete db.rec[b.email];let usr=Object.values(db.users).find(x=>x.email===b.email);if(!usr){usr={id:'u-rec',email:b.email,naam:''};db.users[usr.id]=usr}return json(res,200,tokensVoor(usr))}
  if(u.pathname==='/auth/v1/user'&&req.method==='PUT'){const t0=(req.headers.authorization||'').replace('Bearer ','');const ss=db.tokens[t0];if(!ss)return json(res,401,{error_code:'bad_jwt'});
    const b=JSON.parse(body||'{}');if(!b.password||b.password.length<8)return json(res,422,{error_code:'weak_password',msg:'weak'});
    const us=db.users[ss.u];db.pw=db.pw||{};if(db.pw[us.email]===b.password)return json(res,422,{error_code:'same_password',msg:'same'});db.pw[us.email]=b.password;return json(res,200,{id:us.id,email:us.email})}
  if(u.pathname==='/auth/v1/verify'&&req.method==='POST'){const b=JSON.parse(body||'{}');
    if(b.type!=='email'||!db.otp||db.otp[b.email]!==b.token)return json(res,403,{error:'otp_expired',error_description:'Token has expired or is invalid'});
    delete db.otp[b.email];const usr={id:'u-mail-'+b.email.length,email:b.email,naam:''};db.users[usr.id]=usr;return json(res,200,tokensVoor(usr))}
  if(u.pathname==='/auth/v1/token'){const b=JSON.parse(body||'{}');
    if(u.searchParams.get('grant_type')==='pkce'){const c=db.codes[b.auth_code];delete db.codes[b.auth_code];
      if(!c||b64url(crypto.createHash('sha256').update(b.code_verifier||'').digest())!==c.ch)return json(res,400,{error:'invalid_grant',error_description:'PKCE klopt niet'});
      return json(res,200,tokensVoor(c.u))}
    if(u.searchParams.get('grant_type')==='password'){db.pw=db.pw||{};
      if(!b.email||db.pw[b.email]!==b.password)return json(res,400,{code:400,error_code:'invalid_credentials',msg:'Invalid login credentials'});
      const usr=Object.values(db.users).find(x=>x.email===b.email);return json(res,200,tokensVoor(usr))}
    if(u.searchParams.get('grant_type')==='refresh_token'){const id=db.refresh[b.refresh_token];delete db.refresh[b.refresh_token];
      if(!id||!db.users[id])return json(res,400,{error:'invalid_grant'});db.vernieuwd=(db.vernieuwd||0)+1;return json(res,200,tokensVoor(db.users[id]))}
    return json(res,400,{error:'grant'})}
  if(u.pathname==='/auth/v1/logout'&&u.searchParams.get('scope')!=='others')return json(res,204,null);
  if(u.pathname==='/auth/v1/user'&&req.method==='GET'){const t0=(req.headers.authorization||'').replace('Bearer ','');const ss=db.tokens[t0];if(!ss)return json(res,401,{error:'bad_jwt'});const us=db.users[ss.u];return json(res,200,{id:us.id,email:us.email,user_metadata:{},factors:(db.factors&&db.factors[us.id])||[]})}
  // tweestapsverificatie (TOTP): de juiste code is altijd 135790
  if(u.pathname.startsWith('/auth/v1/factors')||(u.pathname==='/auth/v1/logout'&&u.searchParams.get('scope')==='others')){const t0=(req.headers.authorization||'').replace('Bearer ','');const ss=db.tokens[t0];if(!ss)return json(res,401,{error_code:'bad_jwt'});
    const us=db.users[ss.u];db.factors=db.factors||{};const fs=db.factors[us.id]=db.factors[us.id]||[];const deel=u.pathname.split('/').slice(4);
    if(u.pathname==='/auth/v1/logout'){db.anderenUit=(db.anderenUit||0)+1;return json(res,204,null)}
    if(!deel.length&&req.method==='POST'){const f={id:'f-'+crypto.randomBytes(4).toString('hex'),factor_type:'totp',status:'unverified',friendly_name:JSON.parse(body||'{}').friendly_name};fs.push(f);
      return json(res,200,{id:f.id,type:'totp',totp:{qr_code:'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><rect width="180" height="180" fill="#000"/></svg>',secret:'JBSWY3DPEHPK3PXP',uri:'otpauth://totp/Boa%20Paraat:x?secret=JBSWY3DPEHPK3PXP&issuer=Boa%20Paraat'}})}
    const f=fs.find(x=>x.id===deel[0]);if(!f)return json(res,404,{error_code:'mfa_factor_not_found'});
    if(deel[1]==='challenge')return json(res,200,{id:'ch-'+f.id,type:'totp'});
    if(deel[1]==='verify'){const b=JSON.parse(body||'{}');if(b.code!=='135790'||b.challenge_id!=='ch-'+f.id)return json(res,422,{error_code:'mfa_verification_failed',msg:'Invalid TOTP code entered'});f.status='verified';db.mfaVerify=(db.mfaVerify||0)+1;return json(res,200,tokensVoor(us,'aal2'))}
    if(req.method==='DELETE'){if(f.status==='verified'&&ss.aal!=='aal2')return json(res,403,{error_code:'insufficient_aal',msg:'AAL2 required'});fs.splice(fs.indexOf(f),1);return json(res,200,{id:f.id})}
    return json(res,400,{error:'?'})}
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
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(html.replace(/const CLOUD=(null|\{[^;]*\});/,'const CLOUD='+JSON.stringify(Object.assign({url:SUPA,key:'pk-test'},u.pathname==='/apple.html'?{apple:true}:u.pathname==='/mail.html'?{email:true}:u.pathname==='/ms.html'?{email:true,microsoft:true}:{}))+';'))});
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
  // ---------- 13. Android-app: inloggen via de browser van de telefoon en terug via nl.boa.phbtrainer://login ----------
  db.als={id:'u-dirk',email:'dirk@example.com',naam:'Dirk Jansen'};
  {const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    await ctx.addInitScript(()=>{window.__h={};window.Capacitor={isNativePlatform:()=>true,getPlatform:()=>'android',Plugins:{
      App:{addListener:(e,f)=>{(window.__h[e]=window.__h[e]||[]).push(f);return {remove(){}}},getLaunchUrl:()=>Promise.resolve(null),exitApp:()=>{}},
      Browser:{open:o=>{window.__open=o.url;return Promise.resolve()},close:()=>{window.__dicht=1;return Promise.resolve()}}}}});
    const pa=await ctx.newPage();pa._errs=[];pa.on('pageerror',e=>pa._errs.push(e.message));
    await pa.goto(APP+'/app.html#home');await w(300);
    t(await pa.locator('[data-act="login"]').count()===1,'app: inlogscherm');
    await pa.click('[data-act="login"]');await w(300);
    const open=await pa.evaluate(()=>window.__open||'');
    t(open.startsWith(SUPA)&&/redirect_to=nl\.boa\.phbtrainer%3A%2F%2Flogin/.test(open)&&pa.url().includes('/app.html'),'app: Google opent in de browser van de telefoon (de app zelf blijft staan), terugkeren via nl.boa.phbtrainer://login');
    // de browser volgt Supabase en Google; de telefoon opent daarna de app met de code
    const r=await fetch(open,{redirect:'manual'});const terug=r.headers.get('location')||'';
    t(terug.startsWith('nl.boa.phbtrainer://login?code='),'app: na Google gaat de telefoon terug naar de app met een eenmalige code');
    await pa.evaluate(u=>window.__h.appUrlOpen.forEach(f=>f({url:u})),terug);await w(1200);
    t(await pa.locator('#obForm').count()===1&&(await pa.inputValue('#obNaam'))==='Dirk Jansen'&&await pa.evaluate(()=>window.__dicht===1),'app: ingelogd, browser gesloten, welkomstscherm met naam uit Google');
    t(!pa._errs.length,'app: geen JS-fouten'+(pa._errs.length?': '+pa._errs.join(' | '):''));
    await ctx.close()}
  // ---------- 14. Inloggen met Apple (alleen als Apple in Supabase aanstaat) ----------
  {const pg=await apparaat(b);
    t(await pg.locator('[data-act="login-apple"]').count()===0,'Apple: zonder Apple in de instellingen alleen de knop van Google');
    await pg.context().close();
    db.als={id:'u-eva',email:'abc123@privaterelay.appleid.com',naam:''};
    const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const pa=await ctx.newPage();pa._errs=[];pa.on('pageerror',e=>pa._errs.push(e.message));
    await pa.goto(APP+'/apple.html#home');await w(300);
    t(await pa.locator('[data-act="login"]').count()===1&&await pa.locator('[data-act="login-apple"]').count()===1,'Apple: inlogscherm met Google en Apple');
    const kn=await pa.locator('[data-act="login-apple"]').boundingBox();t(kn&&kn.height>=44,'Apple: knop groot genoeg om op te tikken');
    await pa.click('[data-act="login-apple"]');await pa.waitForURL(/apple\.html(#.*)?$/,{timeout:5000}).catch(()=>{});await w(900);
    t(db.prov==='apple'&&!db.prompt,'Apple: inloggen gaat via Apple (zonder Google-accountkeuze)');
    t(await pa.locator('#obForm').count()===1&&(await pa.inputValue('#obNaam'))==='','Apple: ingelogd, welkomstscherm (Apple geeft geen naam mee, die vul je zelf in)');
    const s=await pa.evaluate(()=>JSON.parse(localStorage.getItem('boa-sessie')||'null'));
    t(s&&s.u&&s.u.id==='u-eva'&&s.u.email.endsWith('privaterelay.appleid.com'),'Apple: sessie met het doorstuuradres van Apple');
    t(!pa._errs.length,'Apple: geen JS-fouten'+(pa._errs.length?': '+pa._errs.join(' | '):''));
    await ctx.close()}
  // ---------- 15. Inloggen met een code per e-mail (voor wie geen Google-account heeft) ----------
  {const pg=await apparaat(b);
    t(await pg.locator('[data-act="login-mail"]').count()===0,'e-mail: zonder e-mail in de instellingen geen knop');
    await pg.context().close();
    const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const pm=await ctx.newPage();pm._errs=[];pm.on('pageerror',e=>pm._errs.push(e.message));
    await pm.goto(APP+'/mail.html#home');await w(300);
    t(await pm.locator('[data-act="login"]').count()===1&&await pm.locator('[data-act="login-mail"]').count()===1,'e-mail: inlogscherm met Google en e-mail');
    await pm.click('[data-act="login-mail"]');await w(200);
    t(await pm.evaluate(()=>document.activeElement&&document.activeElement.id==='mailIn')&&await pm.locator('[data-act="login"]').count()===0,'e-mail: invulveld voor je e-mailadres, met focus');
    await pm.fill('#mailIn','geen-adres');await pm.click('#mailForm button[type="submit"]');await w(200);
    t(/geldig e-mailadres/.test(await pm.textContent('.login'))&&!db.otpMails,'e-mail: ongeldig adres wordt niet verstuurd');
    db.otpTe429=true;await pm.fill('#mailIn','Eva@Voorbeeld.nl');await pm.click('#mailForm button[type="submit"]');await w(400);
    t(/Wacht een minuut/.test(await pm.textContent('.login'))&&await pm.locator('#mailIn').count()===1,'e-mail: te vaak gevraagd geeft een duidelijke melding');
    db.otpTe429=false;await pm.click('#mailForm button[type="submit"]');await w(400);
    t(db.otp&&db.otp['eva@voorbeeld.nl']&&/eva@voorbeeld\.nl/.test(await pm.textContent('.lhint'))&&await pm.evaluate(()=>document.activeElement&&document.activeElement.id==='mailCode'),'e-mail: code verstuurd naar het adres (kleine letters), invulveld voor de code met focus');
    t(await pm.locator('[data-act="mail-opnieuw"][disabled]').count()===1,'e-mail: nieuwe code pas na een minuut');
    await pm.fill('#mailCode','111111');await w(500);
    t(/klopt niet of is verlopen/.test(await pm.textContent('.login'))&&!(await pm.evaluate(()=>localStorage.getItem('boa-sessie'))),'e-mail: verkeerde code wordt geweigerd');
    await pm.fill('#mailCode','48 29 16');await w(1300);
    const s=await pm.evaluate(()=>JSON.parse(localStorage.getItem('boa-sessie')||'null'));
    t(s&&s.u&&s.u.email==='eva@voorbeeld.nl'&&await pm.locator('#obForm').count()===1,'e-mail: juiste code (ook met spaties geplakt) logt in, daarna het welkomstscherm');
    t(!pm._errs.length,'e-mail: geen JS-fouten'+(pm._errs.length?': '+pm._errs.join(' | '):''));
    await ctx.close()}
  // ---------- 15a. Microsoft (school- of werkaccount) ----------
  {const pg=await (await b.newContext()).newPage();await pg.goto(APP+'/mail.html#home');await w(300);
    t(await pg.locator('[data-act="login-ms"]').count()===0,'Microsoft: zonder Microsoft in de instellingen geen knop');await pg.context().close();
    const ctx=await b.newContext({viewport:{width:390,height:844}});const pm=await ctx.newPage();pm._errs=[];pm.on('pageerror',e=>pm._errs.push(e.message));
    await pm.goto(APP+'/ms.html#home');await w(300);
    t(await pm.locator('[data-act="login"]').count()===1&&/school- of werkaccount/.test(await pm.textContent('[data-act="login-ms"]')),'Microsoft: knop "Inloggen met Microsoft – school- of werkaccount"');
    const kn=await pm.locator('[data-act="login-ms"]').boundingBox();t(kn&&kn.height>=44,'Microsoft: knop groot genoeg om op te tikken');
    db.als={id:'u-sanne',email:'sanne@leerling.school.nl',naam:'Sanne Bakker'};
    await pm.click('[data-act="login-ms"]');await pm.waitForURL(/ms\.html(#.*)?$/,{timeout:5000}).catch(()=>{});await w(900);
    t(db.prov==='azure'&&db.scopes==='email'&&db.prompt==='select_account','Microsoft: inloggen via Microsoft (azure) met e-mail en accountkeuze');
    const s=await pm.evaluate(()=>JSON.parse(localStorage.getItem('boa-sessie')||'null'));
    t(s&&s.u&&s.u.email==='sanne@leerling.school.nl','Microsoft: ingelogd met het schoolaccount');
    t(!pm._errs.length,'Microsoft: geen JS-fouten'+(pm._errs.length?': '+pm._errs.join(' | '):''));
    await ctx.close();
    const pt=await (await b.newContext()).newPage();await pt.addInitScript(()=>{const echt=Date.now;let extra=0;window.__vooruit=ms=>{extra+=ms};Date.now=()=>echt()+extra});
    await pt.goto(APP+'/ms.html#home');await w(300);await pt.click('[data-act="login-mail"]');await w(150);await pt.fill('#mailIn','tim@school.nl');await pt.click('#mailForm button[type="submit"]');await w(400);
    await pt.evaluate(()=>window.__vooruit(31000));await w(1300);
    t(await pt.locator('#mailTraag [data-act="login-ms"]').count()===1,'trage code bij schoolmail: app biedt inloggen met het Microsoft-schoolaccount aan');
    await pt.context().close()}
  // ---------- 15c. e-mail en wachtwoord (zonder mail, voor werk- en schoolmail) ----------
  {const nieuwePagina=async()=>{const ctx=await b.newContext({viewport:{width:390,height:844}});const pm=await ctx.newPage();pm._errs=[];pm.on('pageerror',e=>pm._errs.push(e.message));await pm.goto(APP+'/mail.html#home');await w(300);return pm};
    const ses=pm=>pm.evaluate(()=>JSON.parse(localStorage.getItem('boa-sessie')||'null'));
    let pm=await nieuwePagina();await pm.click('[data-act="login-mail"]');await w(150);
    t(/Werk- of schoolmail\?/.test(await pm.textContent('#mailTip'))&&await pm.locator('[data-act="ww-start"]').count()===1,'e-mail: tip voor werk- en schoolmail met de keuze inloggen met wachtwoord');
    await pm.fill('#mailIn','kees@ns.nl');await pm.click('[data-act="ww-start"]');await w(150);
    t(await pm.inputValue('#wwMail')==='kees@ns.nl'&&await pm.evaluate(()=>document.activeElement.id)==='wwIn'&&await pm.getAttribute('#wwIn','autocomplete')==='current-password','wachtwoord: e-mailadres overgenomen, cursor in het wachtwoordveld');
    await pm.click('[data-act="ww-nieuw"]');await w(150);
    t(await pm.getAttribute('#wwIn','autocomplete')==='new-password'&&/geen mail/.test(await pm.textContent('#wwForm')),'account maken: nieuw wachtwoord, uitleg dat er geen mail komt');
    await pm.fill('#wwIn','kort');await pm.click('#wwForm button[type="submit"]');await w(200);
    t(/te zwak/.test(await pm.textContent('.login'))&&!(await ses(pm)),'account maken: zwak wachtwoord geweigerd (in de app, zonder verzoek)');
    await pm.click('[data-wwtoon="wwIn"]');t(await pm.getAttribute('#wwIn','type')==='text'&&/Verberg/.test(await pm.textContent('[data-wwtoon="wwIn"]')),'wachtwoord tonen en verbergen');
    const mails0=db.otpMails||0;
    await pm.fill('#wwIn','Boa2026paraat');await pm.click('#wwForm button[type="submit"]');await w(900);
    let sx=await ses(pm);t(sx&&sx.u.email==='kees@ns.nl'&&(db.otpMails||0)===mails0,'account maken met wachtwoord: meteen ingelogd, er is geen mail verstuurd');
    t(!pm._errs.length,'wachtwoord: geen JS-fouten'+(pm._errs.length?': '+pm._errs.join(' | '):''));await pm.context().close();
    // inloggen, fout en goed
    pm=await nieuwePagina();await pm.click('[data-act="login-mail"]');await pm.click('[data-act="ww-start"]');await w(150);
    await pm.fill('#wwMail','kees@ns.nl');await pm.fill('#wwIn','Verkeerd123');await pm.click('#wwForm button[type="submit"]');await w(400);
    t(/klopt niet/.test(await pm.textContent('.login'))&&!(await ses(pm))&&await pm.inputValue('#wwMail')==='kees@ns.nl','inloggen: verkeerd wachtwoord geeft een duidelijke melding, e-mailadres blijft staan');
    await pm.fill('#wwIn','Boa2026paraat');await pm.press('#wwIn','Enter');await w(900);
    sx=await ses(pm);t(sx&&sx.u.email==='kees@ns.nl','inloggen met e-mail en wachtwoord (Enter)');await pm.context().close();
    // bestaand account: account maken stuurt naar inloggen
    pm=await nieuwePagina();await pm.click('[data-act="login-mail"]');await pm.click('[data-act="ww-start"]');await pm.click('[data-act="ww-nieuw"]');await w(100);
    await pm.fill('#wwMail','kees@ns.nl');await pm.fill('#wwIn','Anders2026x');await pm.click('#wwForm button[type="submit"]');await w(400);
    t(/al een account/.test(await pm.textContent('.login'))&&/Inloggen/.test(await pm.textContent('#wwForm button[type="submit"]')),'account maken met een bestaand adres: melding en terug naar inloggen');
    // wachtwoord vergeten
    await pm.click('[data-act="ww-vergeten"]');await w(400);
    t(await pm.locator('#wwHerstelForm').count()===1&&db.rec&&db.rec['kees@ns.nl'],'wachtwoord vergeten: code per mail en een veld voor een nieuw wachtwoord');
    await pm.fill('#wwCode','771204');await pm.fill('#wwNieuw','Nieuw2026boa');await pm.click('#wwHerstelForm button[type="submit"]');await w(1000);
    sx=await ses(pm);t(sx&&sx.u.email==='kees@ns.nl'&&db.pw['kees@ns.nl']==='Nieuw2026boa','wachtwoord vergeten: nieuw wachtwoord opgeslagen en ingelogd');
    t(!pm._errs.length,'wachtwoord vergeten: geen JS-fouten'+(pm._errs.length?': '+pm._errs.join(' | '):''));await pm.context().close();
    // 'Confirm email' aan in Supabase: dan toch eerst de code
    db.bevestig=true;pm=await nieuwePagina();await pm.click('[data-act="login-mail"]');await pm.click('[data-act="ww-start"]');await pm.click('[data-act="ww-nieuw"]');await w(100);
    await pm.fill('#wwMail','lot@example.com');await pm.fill('#wwIn','Lot2026boa');await pm.click('#wwForm button[type="submit"]');await w(500);
    t(await pm.locator('#mailCodeForm').count()===1&&/account is gemaakt/.test(await pm.textContent('.login')),'als Supabase bevestiging eist: account gemaakt, daarna de code uit de mail');
    db.bevestig=false;await pm.context().close();
    // Profiel: wachtwoord instellen na inloggen met een code
    pm=await nieuwePagina();await pm.evaluate(()=>{localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Sem',dom:'1',werk:'ROC',rol:'scholier',ob:1,gezien:'9',mld:{gevraagd:1}}}))});await pm.reload();await w(300);
    await pm.click('[data-act="login-mail"]');await pm.fill('#mailIn','sem@school.nl');await pm.click('#mailForm button[type="submit"]');await w(400);
    await pm.fill('#mailCode','482916');await w(1200);await pm.evaluate(()=>location.hash='profiel');await w(400);
    await pm.click('[data-act="ww-zet"]');await w(150);await pm.fill('#wwZetIn','abc');await pm.click('#wwZetForm button[type="submit"]');await w(200);
    t(/te zwak/.test(await pm.textContent('#account')),'Profiel: zwak wachtwoord geweigerd');
    await pm.fill('#wwZetIn','Sem2026boa!');await pm.click('#wwZetForm button[type="submit"]');await w(600);
    t(db.pw['sem@school.nl']==='Sem2026boa!'&&await pm.locator('#wwZetForm').count()===0,'Profiel: wachtwoord instellen, daarna kun je ook zo inloggen');
    t(!pm._errs.length,'Profiel wachtwoord: geen JS-fouten'+(pm._errs.length?': '+pm._errs.join(' | '):''));await pm.context().close()}
  // ---------- 15d. tweestapsverificatie (vrijwillig) ----------
  {const ses=pm=>pm.evaluate(()=>JSON.parse(localStorage.getItem('boa-sessie')||'null'));
    const prof=async pm=>{await pm.evaluate(()=>{localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Fien',dom:'1',werk:'NS',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}}}))});await pm.reload();await w(300)};
    const metCode=async(pm,adres)=>{await pm.click('[data-act="login-mail"]');await pm.fill('#mailIn',adres);await pm.click('#mailForm button[type="submit"]');await w(400);await pm.fill('#mailCode','482916');await w(1200)};
    let ctx=await b.newContext({viewport:{width:390,height:844},permissions:['clipboard-read','clipboard-write']});let pm=await ctx.newPage();pm._errs=[];pm.on('pageerror',e=>pm._errs.push(e.message));
    await pm.goto(APP+'/mail.html#home');await prof(pm);await metCode(pm,'fien@ns.nl');await pm.evaluate(()=>location.hash='profiel');await w(800);
    t(/Tweestapsverificatie/.test(await pm.textContent('#mfa'))&&await pm.locator('[data-act="mfa-aan"]').count()===1,'Profiel: tweestapsverificatie staat uit, met een knop om aan te zetten');
    await pm.click('[data-act="mfa-aan"]');await w(600);
    t(await pm.locator('#mfa img[alt*="QR"]').count()===1&&/JBSW Y3DP EHPK 3PXP/.test(await pm.textContent('#mfa'))&&await pm.locator('#mfa a[href^="otpauth://"]').count()===1,'aanzetten: QR-code, sleutel om over te typen en een link voor de app op deze telefoon');
    await pm.click('[data-act="mfa-kopieer"]');await w(200);
    t(await pm.evaluate(()=>navigator.clipboard.readText().catch(()=>''))==='JBSWY3DPEHPK3PXP','sleutel kopiëren');
    await pm.fill('#mfaZetIn','000000');await pm.click('#mfaZetForm button[type="submit"]');await w(400);
    t(/klopt niet/.test(await pm.textContent('#mfa'))&&await pm.evaluate(()=>document.activeElement.id)==='mfaZetIn','aanzetten: verkeerde code geeft een melding');
    const uid=(await ses(pm)).u.id,oud=(await ses(pm)).a;
    await pm.fill('#mfaZetIn','135790');await pm.click('#mfaZetForm button[type="submit"]');await w(600);
    t(/staat aan/.test(await pm.textContent('#mfa'))&&db.factors[uid].some(f=>f.status==='verified')&&(await ses(pm)).a!==oud&&db.anderenUit>=1,'aanzetten met de juiste code: staat aan, nieuwe sessie, andere apparaten uitgelogd');
    t(!pm._errs.length,'tweestapsverificatie aanzetten: geen JS-fouten'+(pm._errs.length?': '+pm._errs.join(' | '):''));await ctx.close();
    // opnieuw inloggen: na de code per mail ook de code uit de app
    ctx=await b.newContext({viewport:{width:390,height:844}});pm=await ctx.newPage();pm._errs=[];pm.on('pageerror',e=>pm._errs.push(e.message));
    await pm.goto(APP+'/mail.html#home');await prof(pm);await metCode(pm,'fien@ns.nl');
    t(await pm.locator('#mfaForm').count()===1&&!(await ses(pm)),'inloggen met tweestapsverificatie: eerst de code uit de app, sessie nog niet bewaard');
    await pm.fill('#mfaIn','111111');await pm.click('#mfaForm button[type="submit"]');await w(400);
    t(/klopt niet/.test(await pm.textContent('.login'))&&!(await ses(pm)),'tweede stap: verkeerde code, niet ingelogd');
    await pm.fill('#mfaIn','135790');await pm.click('#mfaForm button[type="submit"]');await w(1000);
    const s2=await ses(pm);t(s2&&s2.u.email==='fien@ns.nl'&&db.tokens[s2.a].aal==='aal2','tweede stap goed: ingelogd met een sessie mét tweede stap');
    // uitzetten
    await pm.evaluate(()=>location.hash='profiel');await w(800);await pm.click('[data-act="mfa-uit"]');await w(150);
    t(/uitzetten\?/i.test(await pm.textContent('#mfa')),'uitzetten: eerst bevestigen');
    await pm.click('[data-act="mfa-uit-ja"]');await w(500);
    t(!db.factors[uid].length&&await pm.locator('[data-act="mfa-aan"]').count()===1,'uitgezet: inloggen is weer zonder tweede stap');
    t(!pm._errs.length,'tweestapsverificatie inloggen: geen JS-fouten'+(pm._errs.length?': '+pm._errs.join(' | '):''));await ctx.close();
    // annuleren bij de tweede stap
    db.factors[uid].push({id:'f-vast',factor_type:'totp',status:'verified'});
    ctx=await b.newContext({viewport:{width:390,height:844}});pm=await ctx.newPage();await pm.goto(APP+'/mail.html#home');await prof(pm);await metCode(pm,'fien@ns.nl');
    await pm.click('[data-act="mfa-weg"]');await w(200);
    t(await pm.locator('#mfaForm').count()===0&&await pm.locator('[data-act="login-mail"]').count()===1&&!(await ses(pm)),'tweede stap annuleren: terug naar inloggen, niet ingelogd');
    db.factors[uid]=[];await ctx.close()}
  // ---------- 15b. e-mail: trage mail, wachttijd van Supabase, link uit de mail ----------
  {const ctx=await b.newContext({viewport:{width:390,height:844}});const pm=await ctx.newPage();pm._errs=[];pm.on('pageerror',e=>pm._errs.push(e.message));
    await pm.addInitScript(()=>{const echt=Date.now;let extra=0;window.__vooruit=ms=>{extra+=ms};Date.now=()=>echt()+extra});
    await pm.goto(APP+'/mail.html#home');await w(300);await pm.click('[data-act="login-mail"]');await w(150);
    db.otpSec=true;await pm.fill('#mailIn','fien@school.nl');await pm.click('#mailForm button[type="submit"]');await w(400);
    t(/Over 37 seconden kun je een nieuwe vragen/.test(await pm.textContent('.login')),'e-mail: wachttijd van Supabase wordt in seconden getoond');
    db.otpSec=false;db.otpUur=true;await pm.click('#mailForm button[type="submit"]');await w(400);
    t(/heel veel codes verstuurd/.test(await pm.textContent('.login'))&&await pm.locator('.login [data-act="login"]').count()===1,'e-mail: grens per uur bereikt: duidelijke melding en Google als alternatief');
    db.otpUur=false;await pm.click('#mailForm button[type="submit"]');await w(400);
    t(await pm.locator('#mailTraag').isHidden(),'e-mail: meteen na versturen nog geen uitleg over trage mail');
    await pm.evaluate(()=>window.__vooruit(31000));await w(1300);
    t(await pm.locator('#mailTraag').isVisible()&&/School- en werkmail/.test(await pm.textContent('#mailTraag'))&&await pm.locator('#mailTraag [data-act="login"]').count()===1,'e-mail: na een halve minuut uitleg (spam, schoolmail) en Google als alternatief');
    t(await pm.evaluate(()=>document.activeElement&&document.activeElement.id)!=='body','e-mail: invoer blijft staan tijdens het wachten');
    await ctx.close()}
  {const ctx=await b.newContext({viewport:{width:390,height:844}});const pm=await ctx.newPage();pm._errs=[];pm.on('pageerror',e=>pm._errs.push(e.message));
    await pm.goto(APP+'/mail.html#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired');await w(600);
    t(/inloglink is al gebruikt of verlopen/.test(await pm.textContent('.login'))&&await pm.locator('#mailIn').count()===1&&!/error_code/.test(await pm.evaluate(()=>location.hash)),'link uit de mail al gebruikt (bijv. door een virusscanner): uitleg en meteen een nieuwe code vragen');
    const usr={id:'u-link',email:'link@example.com',naam:''};db.users[usr.id]=usr;const tk=tokensVoor(usr);
    await pm.goto('about:blank');await pm.goto(APP+'/mail.html#access_token='+tk.access_token+'&expires_in=3600&refresh_token='+tk.refresh_token+'&token_type=bearer&type=signup');await w(1300);
    const s2=await pm.evaluate(()=>JSON.parse(localStorage.getItem('boa-sessie')||'null'));
    t(s2&&s2.u&&s2.u.email==='link@example.com'&&!/access_token/.test(await pm.evaluate(()=>location.href)),'link uit de mail werkt ook: ingelogd, gegevens weg uit het adres');
    t(!pm._errs.length,'e-mail link: geen JS-fouten'+(pm._errs.length?': '+pm._errs.join(' | '):''));
    await ctx.close()}
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
