// Toetsmatrijzen van ExTH: oefenexamen PHB 1 volgt per domein de verdeling, oefenen per toetsterm,
// achtergrondkennis gemarkeerd, en de notities en blokken per domein (PHB 2, 3 en 4).
const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const out=[];const t=(c,m)=>out.push((c?'ok   ':'FAIL ')+m);
const w=ms=>new Promise(r=>setTimeout(r,ms));
process.on('unhandledRejection',e=>{console.log(out.join('\n'));console.log('FAIL test liep vast: '+String(e&&e.message||e).split('\n')[0]);process.exit(1)});
const MATRIJS=new Function(fs.readFileSync(path.resolve(__dirname,'../bron/matrijs.js'),'utf8')+';return MATRIJS')();
const groepVan=d=>{const m={};for(const [,,gs] of MATRIJS[d].delen)for(const [code,,n,ids] of gs)ids.forEach(id=>{(m[id]=m[id]||[]).push(code)});return m};
const store=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('phb-trainer-v1')||'{}'));
async function open(b,dm){
  const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const p=await ctx.newPage();p._errs=[];p.on('pageerror',e=>p._errs.push(e.message));
  await p.goto(BOA_URL+'#home');await p.evaluate(d=>localStorage.setItem('phb-trainer-v1',JSON.stringify({s:{},h:[],x:[],p:{naam:'Matrijs Test',dom:d,werk:'X',ob:1,gezien:'9',mld:{gevraagd:1}}})),dm);
  await p.reload();await w(200);return p;
}
const ga=async(p,h)=>{await p.evaluate(h=>location.hash=h,h);await w(300)};
async function stop(p){await p.evaluate(()=>{const s=document.getElementById('stopBtn');s&&s.click()});await w(120);await p.evaluate(()=>{const y=document.querySelector('[data-act="stop-yes"]');y&&y.click()});await w(250)}
// praktijkoefening Waarneming en verslaglegging: puntenverdeling volgens de rubric van het domein
(function(){
  const src=fs.readFileSync(path.resolve(__dirname,'../bron/wv.js'),'utf8');
  const stubs={window:{},document:{},pad2:n=>String(n).padStart(2,'0'),store:{},esc:s=>String(s),dom:()=>'1'};let api=null;
  for(let i=0;i<12&&!api;i++){try{const f=new Function(...Object.keys(stubs),src+';return {wvGet,wvScore}');const a=f(...Object.values(stubs));a.wvGet('perron',7);api=a}catch(e){const m=/(\w+) is not defined/.exec(e.message);if(!m)throw e;stubs[m[1]]=()=>''}}
  const txt='Op 1 november 2026 omstreeks 14.00 uur bevond ik mij op het perron. Ik zag een man in een zwarte jas. Ik hoorde hem roepen. Ik zag dat hij wegliep.';
  const r4=api.wvScore(api.wvGet('perron',7),txt,{}),r1=api.wvScore(api.wvGet('plein',7),txt,{});
  const p4=Object.fromEntries(Object.entries(r4.parts).map(([k,v])=>[k,v.max]));
  t(r4.algMax===35&&r4.specMax===65&&p4.aanv===10&&p4.gebeur===47&&p4.spec===8,'domein IV: verslag beoordeeld met de rubric (algemeen 35, aanvangssituatie 10, gebeurtenissen 47, specificaties 8)');
  t(['chrono','taal','rvw','fout'].every(k=>r4.alg[k]&&r4.alg[k].got!=null)&&r4.alg.kort.got===null,'domein IV: criteria chronologie, taal (max 6 fouten), zintuiglijke waarnemingen en max 2 foutieve waarnemingen; beknoptheid alleen als tip');
  t(r1.algMax===40&&r1.specMax===60,'domein I: bestaande puntenverdeling blijft (algemeen 40, waarnemingen 60)');
})();
(async()=>{
  const b=await chromium.launch();
  for(const d of ['1','4']){
    const L=d==='4'?'domein IV':'domein I';const gv=groepVan(d);
    const p=await open(b,d);
    await ga(p,'phb1');
    // paneel met de toetsmatrijs
    t(await p.locator('.mlist li').count()===0,`${L}: toetstermen worden pas opgebouwd als je de matrijs openklapt`);
    await p.click('.mtx summary');await w(150);
    const tot=await p.evaluate(()=>[...document.querySelectorAll('.mlist li')].length);
    const nGroep=MATRIJS[d].delen.reduce((a,x)=>a+x[2].length,0);
    t(tot===nGroep,`${L}: toetsmatrijs toont alle ${nGroep} toetstermen`);
    t((await p.textContent('.mtx summary')).includes(d==='4'?'Domein IV':'Domein I'),`${L}: de juiste matrijs (${MATRIJS[d].versie})`);
    // oefenexamen: per toetsterm precies het aantal uit de matrijs
    for(let ronde=1;ronde<=2;ronde++){
      await ga(p,'phb1');await p.click('[data-act="examen"]');await w(400);
      const s=await store(p);const ids=s.e[d==='4'?'phb1:ov':'phb1']||[];
      const telling={};let buiten=0;ids.forEach(id=>{const g=gv[id];if(!g)buiten++;else telling[g[0]]=(telling[g[0]]||0)+1});
      const fout=[];for(const [,,gs] of MATRIJS[d].delen)for(const [code,,n] of gs)if((telling[code]||0)!==n)fout.push(`${code}: ${telling[code]||0} i.p.v. ${n}`);
      t(ids.length===50&&new Set(ids).size===50&&!buiten&&!fout.length,`${L}, oefenexamen ${ronde}: 50 verschillende vragen, verdeeld zoals de matrijs${fout.length?' — '+fout.slice(0,4).join(', '):''}${buiten?` (${buiten} buiten de matrijs)`:''}`);
      t(await p.evaluate(()=>/^(8|9)\d:\d\d$/.test(document.getElementById('timer').textContent.trim())),`${L}, oefenexamen ${ronde}: klok van 90 minuten`);
      await stop(p);
    }
    // oefenen per toetsterm
    await ga(p,'phb1');await p.click('.mtx summary');await w(150);
    const code=await p.getAttribute('.mlist [data-act="mtx"] >> nth=3','data-g');
    await p.click(`.mlist [data-act="mtx"][data-g="${code}"]`);await w(350);
    t(await p.evaluate(()=>location.hash)==='#sessie'&&(await p.textContent('#app')).includes('Toetsterm '+code),`${L}: oefenen per toetsterm (${code}) start een ronde`);
    await stop(p);
    // domeinonderwerpen en achtergrondkennis
    await ga(p,'phb1');
    const cats=await p.evaluate(()=>[...document.querySelectorAll('#app .cat [data-act="oefen"]')].map(x=>x.dataset.cat));
    if(d==='1'){t(['gem','bst','apv','wvw','bijz'].every(c=>cats.includes(c))&&!cats.includes('wp'),'domein I: APV, bestuursrecht, verkeer en bijzondere wetten zichtbaar, OV niet')}
    else{t(['wp','bp','ovt'].every(c=>cats.includes(c))&&!cats.includes('apv'),'domein IV: OV-onderwerpen zichtbaar, APV niet')}
    t(await p.evaluate(()=>{const c=[...document.querySelectorAll('#app .cat')].find(x=>x.querySelector('[data-cat="ro"]'));return !!(c&&c.querySelector('.chip.bg'))}),`${L}: rechterlijke organisatie gemarkeerd als achtergrond (niet in de matrijs)`);
    await p.click('#app .cat [data-cat="ro"]');await w(300);
    t(await p.locator('.chip.bg').count()===1,`${L}: vraag buiten de matrijs toont "achtergrondkennis"`);
    await stop(p);
    // gemengd oefenen alleen uit de matrijs
    await ga(p,'phb1');await p.click('[data-act="mix"]');await w(300);
    t(await p.locator('.chip.bg').count()===0,`${L}: gemengd oefenen begint met een vraag uit de matrijs`);
    await stop(p);
    // PHB 2, 3 en 4 per domein
    await ga(p,'phb2');const n2=await p.textContent('#app details.info');
    t(d==='4'?/Twee casussen/.test(n2):/Drie casussen/.test(n2),`${L}: PHB 2 noemt de juiste casussen (uitklapblok Over het examen)`);
    await ga(p,'phb4');
    const blokken=await p.evaluate(()=>[...document.querySelectorAll('#app .block h3')].map(x=>x.textContent));
    const p4cats=await p.evaluate(()=>[...document.querySelectorAll('#app .cat [data-act="oefen"]')].map(x=>x.dataset.cat));
    if(d==='4')t(blokken.join('|')==='AVG en Wpg|Opmaken proces-verbaal|Communicatie met jeugdigen'&&!p4cats.includes('wijk'),'domein IV: PHB 4 toont alleen de geaccrediteerde trainingen');
    else t(blokken.length===5&&blokken.includes('Jeugd')&&blokken.includes('Wijkgericht werken'),'domein I: PHB 4 toont de vijf geaccrediteerde trainingen');
    t(!p._errs.length,`${L}: geen JS-fouten`+(p._errs.length?': '+p._errs.join(' | '):''));
    await p.context().close();
  }
  await b.close();
  console.log(out.join('\n'));const f=out.filter(l=>l.startsWith('FAIL')).length;
  console.log(`\n${out.length-f} geslaagd, ${f} mislukt`);process.exit(f?1:0);
})();
