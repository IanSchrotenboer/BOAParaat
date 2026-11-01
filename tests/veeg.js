// Vegen tussen de menu's: Overzicht, PHB 1 t/m 4 en Studiestof (alleen met een vinger, alleen op die zes schermen).
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const STORE={s:{},h:[],x:[],p:{naam:'Veeg Test',dom:'1',werk:'Gemeente',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9'}};
async function open(b,opts={}){
  const ctx=await b.newContext(Object.assign({viewport:{width:390,height:844},isMobile:true,hasTouch:true},opts));
  const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',JSON.stringify(s)),STORE);await p.reload();await w(200);
  p._cdp=await ctx.newCDPSession(p);return p;
}
const hash=p=>p.evaluate(()=>location.hash.slice(1));
const tabNu=p=>p.evaluate(()=>{const a=document.querySelector('#tabbar a[aria-current="page"]');return a?a.getAttribute('href').slice(1):''});
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(350)};
// een veeg met de vinger: van (x0,y0) naar (x1,y1) in 'ms' milliseconden; 'mid' wordt halverwege aangeroepen.
// De aanrakingen krijgen vaste tijdstempels, zodat de snelheid van de veeg niet afhangt van hoe druk de testcomputer is.
async function veeg(p,x0,y0,x1,y1,ms=220,mid,vingers=1,n=10){
  const pt=(x,y)=>Array.from({length:vingers},(_,i)=>({x:x+i*40,y:y,id:i}));const T0=Date.now()/1000,st=ms/n/1000;
  await p._cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pt(x0,y0),timestamp:T0});
  for(let i=1;i<=n;i++){await w(ms/n);await p._cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:pt(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n),timestamp:T0+i*st});if(i===Math.round(n/2)&&mid)await mid()}
  await p._cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[],timestamp:T0+(n+1)*st});await w(450);
}
const links=(p,y=420)=>veeg(p,320,y,70,y);   // naar het volgende menu
const rechts=(p,y=420)=>veeg(p,70,y,320,y);  // naar het vorige menu
const rust=p=>p.evaluate(()=>{const a=document.getElementById('app');return !a.style.transform&&!a.style.opacity});
(async()=>{
  const b=await chromium.launch();
  let p=await open(b);
  // basis: de volgorde van de menu's
  await links(p);t(await hash(p)==='phb1','Overzicht → naar links vegen → PHB 1');
  t(await tabNu(p)==='phb1','tabbalk wijst PHB 1 aan na het vegen');
  t(await rust(p),'pagina staat na het vegen weer recht (geen verschuiving of vervaging achtergebleven)');
  await links(p);await links(p);await links(p);t(await hash(p)==='phb4','verder vegen: PHB 2, PHB 3, PHB 4');
  await links(p);t(await hash(p)==='rtgb','PHB 4 → RTGB');
  await links(p);t(await hash(p)==='stof','RTGB → Studiestof');
  await links(p);t(await hash(p)==='stof'&&await rust(p),'Studiestof is het laatste menu: verder vegen veert terug');
  await rechts(p);t(await hash(p)==='rtgb','naar rechts vegen: terug naar RTGB');
  await ga(p,'home');await rechts(p);t(await hash(p)==='home'&&await rust(p),'Overzicht is het eerste menu: naar rechts vegen veert terug');
  // de pagina volgt de vinger
  let x='';await veeg(p,320,420,140,420,300,async()=>{x=await p.evaluate(()=>document.getElementById('app').style.transform)});
  t(/translateX\(-\d/.test(x),'tijdens het vegen schuift de pagina mee met de vinger ('+x+')');
  await ga(p,'home');
  // het volgende tabblad schuift mee in beeld
  let g=null;await ga(p,'home');
  await veeg(p,320,420,140,420,300,async()=>{g=await p.evaluate(()=>{const e=document.querySelector('.swghost.swside');if(!e)return null;
    const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);return {txt:e.innerText,ids:e.querySelectorAll('[id]').length,dub:ids.length-new Set(ids).size,tr:e.style.transform,app:document.getElementById('app').style.transform,left:e.getBoundingClientRect().left,tb:document.getElementById('tabbar').getBoundingClientRect().width}})});
  t(g&&g.tb===390,'tijdens het vegen blijft het scherm even breed (tabbalk '+(g&&g.tb)+' px), geen uitzoomen');
  t(g&&/Wet- en regelgeving/.test(g.txt),'tijdens het vegen schuift PHB 1 mee in beeld');
  t(g&&g.ids===0&&g.dub===0,'meeschuivend tabblad heeft geen dubbele id\'s');
  t(g&&g.left>0&&g.left<390,'meeschuivend tabblad staat naast de huidige pagina en volgt de vinger (links op '+(g&&Math.round(g.left))+' px)');
  t(await hash(p)==='phb1'&&!(await p.locator('.swghost').count())&&await rust(p),'na de veeg: PHB 1 staat er, geen kopie of verschuiving achtergebleven');
  await ga(p,'home');await veeg(p,320,420,240,420,600);
  t(await hash(p)==='home'&&!(await p.locator('.swghost').count())&&await rust(p),'veeg te kort: alles veert terug, meeschuivend tabblad verdwijnt');
  // tikken op de tabbalk: gedeelde as (oud schuift weg, nieuw schuift in vanaf dezelfde kant)
  await ga(p,'phb1');await w(100);
  let k=await p.evaluate(async()=>{document.querySelector('#tabbar a[href="#phb3"]').click();await new Promise(r=>setTimeout(r,40));
    return {app:document.getElementById('app').className,uit:(document.querySelector('.swghost')||{}).className||'',tb:document.getElementById('tabbar').getBoundingClientRect().width}});
  t(k.tb===390,'tijdens de overgang blijft het scherm even breed (tabbalk '+k.tb+' px)');
  t(/swr/.test(k.app)&&/swoutl/.test(k.uit),'tik op PHB 3 vanaf PHB 1: nieuw scherm schuift in van rechts, oud schuift weg naar links');
  await w(450);t(!(await p.locator('.swghost').count())&&!/enter|swr/.test(await p.getAttribute('#app','class')||''),'na de overgang is alles opgeruimd');
  k=await p.evaluate(async()=>{document.querySelector('#tabbar a[href="#home"]').click();await new Promise(r=>setTimeout(r,40));
    return {app:document.getElementById('app').className,uit:(document.querySelector('.swghost')||{}).className||''}});
  t(/swl/.test(k.app)&&/swoutr/.test(k.uit),'tik op Overzicht: overgang de andere kant op');
  await w(450);await ga(p,'profiel');
  k=await p.evaluate(async()=>{document.querySelector('#tabbar a[href="#phb2"]').click();await new Promise(r=>setTimeout(r,40));return document.querySelectorAll('.swghost').length});
  t(k===0,'vanaf het profiel naar een tabblad: gewone rustige overgang');
  await w(450);await ga(p,'home');
  // geen wissel bij gebaren die geen menuveeg zijn
  await veeg(p,300,420,250,420,600);t(await hash(p)==='home'&&await rust(p),'korte, langzame veeg (50 px): geen wissel, pagina veert terug');
  await veeg(p,300,420,200,420,20,null,1,4);t(await hash(p)==='phb1','korte maar snelle veeg (flick, 100 px): wel naar het volgende menu');
  await ga(p,'home');
  await veeg(p,200,650,180,250);t(await hash(p)==='home','verticaal scrollen wisselt niet van menu');
  await veeg(p,300,650,180,350);t(await hash(p)==='home','schuin, vooral omhoog: geen wissel');
  await veeg(p,10,420,300,420);t(await hash(p)==='home','veeg vanaf de linkerrand blijft voor het terug-gebaar van de telefoon');
  await ga(p,'phb1');await veeg(p,384,420,100,420);t(await hash(p)==='phb1','veeg vanaf de rechterrand: geen wissel');
  await ga(p,'home');await veeg(p,320,420,70,420,220,null,2);t(await hash(p)==='home','twee vingers (zoomen): geen wissel');
  // invulvelden, horizontaal scrollende inhoud en geselecteerde tekst
  // gevonden met de chaostest (1.6.1): een tik op de tabbalk terwijl de veeg nog uitloopt, en een tweede vinger tijdens het vegen
  {const T0=Date.now()/1000;const cdp=(type,pts,i)=>p._cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts,timestamp:T0+i*.02});
    await cdp('touchStart',[{x:330,y:420}],0);for(let i=1;i<=6;i++)await cdp('touchMove',[{x:330-40*i,y:420}],i);await cdp('touchEnd',[],7);
    await w(40);await p.evaluate(()=>document.querySelector('#tabbar a[href="#phb3"]').click());await w(700);
    t(await hash(p)==='phb3'&&!(await p.locator('.swghost').count())&&await rust(p),'tik op PHB 3 terwijl een veeg nog uitloopt: PHB 3 wint, niets blijft verschoven');
    await ga(p,'home');const T1=Date.now()/1000;const c2=(type,pts,i)=>p._cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts,timestamp:T1+i*.02});
    await c2('touchStart',[{x:330,y:420,id:0}],0);for(let i=1;i<=4;i++)await c2('touchMove',[{x:330-30*i,y:420,id:0}],i);
    await c2('touchStart',[{x:210,y:420,id:0},{x:100,y:500,id:1}],5);await c2('touchEnd',[],6);await w(500);
    t(await hash(p)==='home'&&!(await p.locator('.swghost').count())&&await rust(p),'tweede vinger tijdens het vegen: pagina veert terug, niets blijft verschoven');
    
    await c2('touchStart',[{x:330,y:420}],10);for(let i=1;i<=4;i++)await c2('touchMove',[{x:330-30*i,y:420}],10+i);
    await p.evaluate(()=>location.hash='profiel');await c2('touchEnd',[],15);await w(400);
    t(await rust(p)&&!(await p.locator('.swghost').count()),'ander scherm tijdens het vegen (bijvoorbeeld de terugknop): niets blijft verschoven');
    await p.evaluate(s=>localStorage.setItem('phb-trainer-v1',JSON.stringify(s)),STORE);await p.reload();await w(250);await ga(p,'home')}
  await p.evaluate(()=>{const d=document.createElement('div');d.innerHTML='<input id="vIn" style="position:absolute;left:40px;top:380px;width:310px;height:80px"><div id="vScr" style="position:absolute;left:40px;top:520px;width:310px;height:80px;overflow-x:auto"><div style="width:900px;height:60px"></div></div>';document.getElementById('app').appendChild(d);scrollTo(0,0)});
  await veeg(p,320,420,70,420);t(await hash(p)==='home','veeg over een invulveld: geen wissel');
  await veeg(p,320,560,70,560);t(await hash(p)==='home','veeg over inhoud die zelf opzij scrolt: geen wissel');
  t(await p.evaluate(()=>document.getElementById('vScr').scrollLeft>0),'de opzij scrollende inhoud scrolt gewoon zelf');
  await p.evaluate(()=>{const h=document.querySelector('#app h1,#app h2');const r=document.createRange();r.selectNodeContents(h);getSelection().removeAllRanges();getSelection().addRange(r)});
  await links(p,300);t(await hash(p)==='home','tekst geselecteerd: geen wissel');
  await p.evaluate(()=>getSelection().removeAllRanges());
  await ga(p,'phb1');await ga(p,'home'); // opnieuw tekenen: proefvelden weg
  // open venster of keuzemenu
  await p.evaluate(()=>document.querySelector('[data-act="keys"]').click());await w(150);
  await links(p);t(await hash(p)==='home','venster open: geen wissel');
  await p.evaluate(()=>document.querySelector('[data-act="keys-close"]')&&document.querySelector('[data-act="keys-close"]').click());await w(150);
  // terugknop na vegen
  await links(p);await links(p);t(await hash(p)==='phb2','twee keer vegen: PHB 2');
  await p.goBack();await w(350);t(await hash(p)==='phb1','terugknop na vegen: naar het vorige menu (PHB 1)');
  // studiestof-onderwerp telt als Studiestof
  await ga(p,'stof');const sub=await p.evaluate(()=>{const a=document.querySelector('#app a[href^="#stof-"]');return a?a.getAttribute('href').slice(1):''});
  if(sub){await ga(p,sub);await rechts(p,300);t(await hash(p)==='rtgb','vanuit een studiestof-onderwerp naar rechts: RTGB')}
  // geen vegen in een oefensessie of op het profiel
  await ga(p,'phb1');await p.click('[data-act="oefen"]');await w(400);
  t(await hash(p)==='sessie','oefensessie gestart');
  await links(p,500);t(await hash(p)==='sessie','tijdens een oefensessie wisselt vegen niet van menu');
  await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(200);
  await p.evaluate(()=>{const b=document.querySelector('[data-act="stop-yes"],[data-act="stop"]');b&&b.click()});await w(200);
  await ga(p,'profiel');await links(p,500);t(await hash(p)==='profiel','op het profiel wisselt vegen niet van menu');
  // na alles: niets opzij gescrold, geen fouten
  await ga(p,'home');
  t(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'pagina scrolt nooit opzij');
  t(!p._errs.length,'geen JS-fouten'+(p._errs.length?': '+p._errs.join(' | '):''));
  await p.context().close();
  // minder beweging: wel wisselen, geen meeschuivende pagina
  p=await open(b,{reducedMotion:'reduce'});x='?';
  await veeg(p,320,420,70,420,220,async()=>{x=await p.evaluate(()=>document.getElementById('app').style.transform)});
  t(await hash(p)==='phb1'&&x==='','minder beweging aan: wisselt wel, maar zonder meeschuivende pagina');
  t(!(await p.locator('.swghost').count()),'minder beweging: geen meeschuivend tabblad');
  await p.evaluate(()=>document.querySelector('#tabbar a[href="#phb3"]').click());await w(40);
  t(!(await p.locator('.swghost').count())&&await p.evaluate(()=>getComputedStyle(document.getElementById('app')).animationName==='none'),'minder beweging: tikken op de tabbalk zonder animatie');
  t(!p._errs.length,'minder beweging: geen JS-fouten');
  await p.context().close();
  // pc met muis: slepen wisselt niet
  p=await open(b,{viewport:{width:1280,height:800},isMobile:false,hasTouch:false});
  await p.mouse.move(900,400);await p.mouse.down();await p.mouse.move(300,400,{steps:10});await p.mouse.up();await w(400);
  t(await hash(p)==='home','pc: slepen met de muis wisselt niet van menu');
  await p.context().close();
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
