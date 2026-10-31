const BOA_URL=process.env.BOA_URL||('file://'+require('path').resolve(__dirname,'../uit/Boa-Paraat.html'));
const SHOTS=process.env.BOA_SHOTS||require('os').tmpdir();
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(BOA_URL+'#home');await p.evaluate(()=>localStorage.setItem('wv-debug','1'));await p.reload();await p.waitForTimeout(200);
const res=await p.evaluate(()=>{const X=window.__wv;const out=[];
 const adj=c=>X.COL[c].adj;
 for(const seed of [0,11,222,3333,44444,555555,6666666,77777777,123456,987654]){
  // perron
  const P=X.perronParams(seed);const d=new Date(P.start);const dstr=`${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}`;
  const txt=`Op ${dstr} omstreeks ${X.hm(P.start)} uur bekeek ik camerabeelden van het perron van spoor ${P.spoor} op station ${P.station}. Ik zag een bord met de tekst Rookvrij, een incheckpaal en een vertrekbord met de tekst ${X.hm(P.start,3)} Sprinter ${P.dest}.
Ik zag een vrouw bij het bankje. Zij droeg een lange ${adj(P.W.jas)} jas en een ${adj(P.W.sjaal)} sjaal en had ${X.HAIR[P.W.hair].t} haar ${P.W.style==="pony"?"in een paardenstaart":"en kort haar"}. Zij had een handtas.
Ik zag dat een man het perron op liep. Hij droeg een ${adj(P.A.pet)} pet, een ${adj(P.A.jas)} jas, een ${X.BROEK[P.A.broek].t}, ${adj(P.A.schoen)} schoenen en een ${adj(P.A.pack)} rugzak. Hij had een baard.
Ik zag dat deze man een sigaret opstak en rookte.
Ik zag een tweede man met een bril${P.B.hair==="kaal"?", hij was kaal":`, met ${X.HAIR[P.B.hair].t} kort haar`} en een ${adj(P.B.jas)} lange jas. Hij trok een rolkoffer.
Ik zag dat de vrouw naar de man liep. Ik hoorde haar zeggen: "${X.L_W[P.l[0]][0]}"
Ik hoorde de man zeggen: "${X.L_A[P.l[1]][0]}"
Ik zag dat de man de brandende sigaret op het spoor gooide.
Ik zag dat een gele trein het perron binnen kwam en stopte. Op de trein stond ${P.dest}.
Ik zag dat de vrouw incheckte bij de paal.
Ik zag dat de man langs de incheckpaal liep zonder in te checken.
Ik zag dat hij de man met de koffer opzij duwde. Ik hoorde hem zeggen: "${X.L_PUSH[P.l[2]][0]}" Ik zag dat de koffer omviel. Ik hoorde de man met de koffer zeggen: "${X.L_B[P.l[3]][0]}"
Ik zag dat de man een ${adj(P.lighter)} aansteker liet vallen op het perron.
Ik zag dat de trein vertrok.`;
  const s=X.wvGet("perron",seed);const r=X.wvScore(s,txt,{});
  out.push(["perron",seed,s.titel,r.total,r.alg40,r.spec60,r.wrong.map(w=>w.t).join("|"),WVmiss(r)]);
  // plein
  const Q=X.pleinParams(seed);const e=new Date(Q.start);const est=`${e.getDate()}-${e.getMonth()+1}-${e.getFullYear()}`;
  const t2=`Op ${est} omstreeks ${X.hm(Q.start)} uur bekeek ik camerabeelden van het ${Q.plein}. Ik zag een bord voetgangersgebied en een bord honden aan de lijn. Ik zag een ondergrondse container en de winkels ${Q.w1} en ${Q.w2}.
Ik zag dat een vrouw met ${X.HAIR[Q.C.hair].t} krullend haar en een ${adj(Q.C.jas)} lange jas het plein op liep. Zij trok een ${adj(Q.C.kar)} boodschappentrolley.
Ik zag dat een man met ${X.HAIR[Q.D.hair].t} haar, een ${adj(Q.D.pet)} pet, een ${adj(Q.D.vest)} bodywarmer en een ${adj(Q.D.broek)} broek het plein op kwam. Hij had een ${X.DOGS[Q.dog].t} hond bij zich die los liep. Hij hield een ${adj(Q.D.riem)} riem in zijn hand.
Ik zag dat de man de klep van de container open deed. Ik hoorde hem zeggen: "${X.L_VOL[Q.l[0]]}"
Ik zag dat de man een ${adj(Q.zak)} vuilniszak naast de container neerzette.
Ik zag dat de hond naar de vrouw rende en blafte.
Ik hoorde de vrouw zeggen: "${X.L_LIJN[Q.l[1]]}" Ik hoorde de man zeggen: "${X.L_NIKS[Q.l[2]][0]}"
Ik zag dat een fietser over het plein door het voetgangersgebied reed. Hij droeg een ${adj(Q.E.hoodie)} hoodie met de capuchon op, een ${adj(Q.E.broek)} joggingbroek en een ${adj(Q.E.pack)} rugzak. Hij reed op een ${adj(Q.E.fiets)} fiets.
Ik zag dat de trolley van de vrouw omviel en dat er ${X.FRUIT[Q.fruit].t} over straat rolden.
Ik hoorde de vrouw roepen: "${X.L_UIT[Q.l[3]][0]}" Ik hoorde de fietser zeggen: "${X.L_SORRY[Q.l[4]][0]}" Ik zag dat de fietser daarna weg reed.`;
  const s2=X.wvGet("plein",seed);const r2=X.wvScore(s2,t2,{});
  out.push(["plein",seed,s2.titel,r2.total,r2.alg40,r2.spec60,r2.wrong.map(w=>w.t).join("|"),WVmiss(r2)]);
 }
 function WVmiss(r){return ["aanv","gebeur","spec"].flatMap(k=>r.parts[k].items.filter(i=>!i.ok).map(i=>i.t)).join("; ")}
 return out});
// elk modelverslag (perron en plein, 10 varianten) moet 100 punten halen
for(const r of res)console.log((r[3]===100&&!r[6]?'ok   ':'FAIL ')+r[0]+' variant '+r[1]+': '+r[3]+' punten'+(r[6]?' (onterecht fout: '+r[6]+')':'')+(r[7]?' (gemist: '+r[7]+')':''));
if(errs.length)console.log('FAIL JS-fouten: '+errs.join(' | '));
await b.close();process.exit(res.every(r=>r[3]===100&&!r[6])&&!errs.length?0:1)})();
