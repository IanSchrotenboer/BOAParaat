// Kleine verbeterpunten uit de boa-test (v1.11.2):
// - WaVe: kleurnamen in de beoordeling zijn hele woorden (geen "rod", "witt", "grijz", "gel", "oranj", "beig")
// - welkomstscherm: tekst over waar je gegevens staan past bij wel/niet ingelogd
// - uitslag oefenexamen: "Nog even naar kijken" ingeklapt bij veel fouten; kop "Goed" breekt niet af
// - WaVe-sjabloon: invulvelden breed genoeg voor hun voorbeeldtekst
// - art. 10.2 Wm volgens de Omgevingswet (geen "buiten een inrichting" meer)
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const {chromium,devices}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const profiel={naam:'Test Boa',dom:'1',werk:'Gemeente',rol:'werkend',akte:'2029-01-01',ob:1,gezien:'9',mld:{gevraagd:1}};
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({...devices['iPhone 13']});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  // ---------- WaVe-kleurnamen ----------
  await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.setItem('wv-debug','1'));await p.reload();await p.waitForTimeout(200);
  const lab=await p.evaluate(()=>{const X=window.__wv;const L=[];
    for(let s=0;s<400;s++)for(const sc of ['perron','plein']){const g=X.wvGet(sc,s*7919+3);JSON.stringify(g,(k,v)=>{if(k==='t'&&typeof v==='string')L.push(v);return v})}
    return L});
  const slecht=lab.filter(l=>/\b(rod|witt|grijz|gel|oranj|beig)\b/.test(l));
  t(lab.length>1000,'WaVe: '+lab.length+' beoordelingsregels bekeken');
  t(!slecht.length,'WaVe: kleurnamen zijn hele woorden'+(slecht.length?': '+[...new Set(slecht)].slice(0,5).join(' | '):''));
  t(lab.some(l=>/^(Fiets|Vuilniszak|Aansteker|Hond): (rood|blauw|groen|geel|zwart|wit|grijs|oranje|paars|beige|bruin|roze|blond)$/.test(l)),'WaVe: voorbeeld "Fiets: geel" / "Hond: grijs" aanwezig');
  // ---------- welkomstscherm ----------
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('wv-debug','1')});await p.goto(BOA_URL+'#home');await p.reload();await p.waitForTimeout(300);
  const zonder=await p.textContent('#app');
  if(/Aan de slag/.test(zonder)){
    t(/alleen op dit apparaat/.test(zonder)&&!/in je account/.test(zonder),'welkom zonder account: "alleen op dit apparaat"');
    await p.evaluate(()=>localStorage.setItem('boa-sessie',JSON.stringify({a:'x',r:'y',x:Date.now()+3600e3,u:{id:'00000000-0000-0000-0000-000000000009',email:'t@example.com',naam:'T'}})));
    await p.reload();await p.waitForTimeout(300);const met=await p.textContent('#app');
    t(/Aan de slag/.test(met)?/in je account/.test(met)&&!/alleen op dit apparaat/.test(met):true,'welkom ingelogd: "bewaard in je account"');
  }else t(true,'welkomstscherm niet getoond in deze bouw (inlogscherm eerst): overgeslagen');
  // ---------- uitslag oefenexamen (alles fout) ----------
  await p.evaluate(pr=>{localStorage.clear();localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:pr}));localStorage.setItem('wv-speed','400')},profiel);
  await p.goto(BOA_URL+'#phb1');await p.reload();await p.waitForTimeout(300);
  await p.click('[data-act="examen"]');await p.waitForTimeout(150);
  for(let k=0;k<80;k++){await p.locator('[data-act="pick"]:not([data-o="0"])').first().click();const nx=p.locator('[data-act="next"]');
    if(await nx.count()&&await nx.first().isVisible()){await nx.first().click();continue}
    await p.locator('[data-act="ask-submit"]').first().click();await p.locator('[data-act="submit"]').click();break}
  await p.waitForTimeout(200);
  const rv=await p.locator('details.review').count();
  t(rv>3,'uitslag: '+rv+' fouten als inklapbare vragen');
  t(await p.locator('details.review[open]').count()===0,'uitslag: bij veel fouten standaard ingeklapt');
  const h=await p.evaluate(()=>document.documentElement.scrollHeight);
  t(h<rv*170+4000,'uitslag: pagina blijft kort ('+h+' px voor '+rv+' fouten)');
  await p.locator('details.review summary').first().click();await p.waitForTimeout(100);
  t(await p.locator('details.review[open] .corr').count()===1&&await p.locator('details.review[open] .corr').isVisible(),'uitslag: openklikken toont het juiste antwoord en de uitleg');
  const th=p.locator('.tbl th',{hasText:/^Goed$/i});
  if(await th.count()){const n=await th.first().evaluate(e=>{const r=document.createRange();r.selectNodeContents(e);return r.getClientRects().length});t(n===1,'tabel score per onderwerp: kop "Goed" op één regel')}
  else t(true,'tabel score per onderwerp: niet getoond (één onderwerp)');
  // ---------- WaVe-sjabloon ----------
  await p.evaluate(()=>location.hash='phb3');await p.waitForTimeout(150);await p.click('[data-act="dom"][data-v="1"]');await p.waitForTimeout(80);
  await p.click('.wvnext button');await p.click('[data-act="wv-film"]');await p.waitForSelector('#wvPause',{timeout:8000});
  await p.waitForTimeout(500);await p.click('[data-act="wv-film2"]');await p.waitForSelector('#wvTxt',{timeout:8000});
  const tin=await p.evaluate(()=>[...document.querySelectorAll('input.tin')].map(i=>{const c=document.createElement('canvas').getContext('2d');c.font=getComputedStyle(i).font;const cs=getComputedStyle(i);return {ph:i.placeholder,w:i.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),need:c.measureText(i.placeholder).width,vw:innerWidth,r:i.getBoundingClientRect().right,vol:i.getBoundingClientRect().width>=i.parentElement.clientWidth-40}}));
  const smal=tin.filter(x=>x.w+1<x.need&&!x.vol); // een veld dat al de hele regel vult, mag zijn lange voorbeeldtekst afkappen
  t(tin.length>=5&&!smal.length,'sjabloon: '+tin.length+' velden breed genoeg voor hun voorbeeldtekst'+(smal.length?': '+smal.map(x=>x.ph+' '+Math.round(x.w)+'<'+Math.round(x.need)).join(', '):''));
  t(tin.every(x=>x.r<=x.vw+1),'sjabloon: geen veld buiten beeld op de telefoon');
  // ---------- art. 10.2 Wm ----------
  const q=await p.evaluate(()=>{const all=(window.QS||window.Q||[]);const html=document.documentElement.outerHTML;return {oud:/verboden met afvalstoffen buiten een inrichting/.test(html),nieuw:/niet is afgegeven of ingezameld/.test(html)}});
  t(!q.oud&&q.nieuw,'art. 10.2 Wm: vraag volgens de Omgevingswet');
  t(!errs.length,'geen JS-fouten'+(errs.length?': '+errs.join(' | '):''));
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
