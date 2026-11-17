// ---------- klas: leerlingcode of docentcode van de opleiding ----------
// Een leerling vult in Profiel de code van zijn klas in (KLAS-…). Daarna ziet zijn docent op app.boaparaat.nl/docent
// zijn oefenresultaten; dat staat er vooraf duidelijk bij. Een docent kan hier ook zijn docentcode (DOC-…) invullen; de klas verschijnt dan in
// de docentenomgeving. De klassen staan in store.p.klas (ook offline bekend) en worden bij het openen van Profiel
// met de database vergeleken (supabase/migrations/…_klassen_docenten.sql). Wie in een klas zit, krijgt de indeling
// voor scholieren (indeling.js).
let klasFout="",klasBezig=false,klasWeg="",klasGeladen=false,benBeheer=false;
const klassen=()=>Array.isArray(store.p.klas)?store.p.klas:[];
const inKlas=()=>klassen().some(k=>k.rol==="leerling");
const docentUrl=()=>(SITE||"https://app.boaparaat.nl/").replace(/\/?$/,"/")+"docent/";
const beheerUrl=()=>(SITE||"https://app.boaparaat.nl/").replace(/\/?$/,"/")+"beheer/";
function klasZet(lijst){const oud=JSON.stringify(klassen());
  const nw=(lijst||[]).map(k=>({id:str(k.id,40),naam:str(k.naam,80),start:str(k.start,40),rol:k.rol==="docent"?"docent":"leerling",doc:(Array.isArray(k.docenten)?k.docenten:k.doc||[]).map(x=>str(x,60)).slice(0,5)}));
  if(nw.length)store.p.klas=nw;else delete store.p.klas;
  if(JSON.stringify(klassen())!==oud){save();indelingToepassen();return true}return false}
// bij het openen van Profiel: klopt de lijst nog (bijvoorbeeld na een klas verlaten op een ander apparaat)?
// alleen met een geldig toegangsbewijs: vernieuwen laten we aan het synchroniseren over
async function klasLaden(){const s=sesGet();if(klasGeladen||!cloudKan()||!s||s.x-Date.now()<60000||!navigator.onLine)return;klasGeladen=true;
  // beheerder? dan staat in Profiel de weg naar het beheeroverzicht (de database controleert dat daar opnieuw)
  rest("POST","rpc/ben_ik_beheerder",{}).then(b=>{if((b===true)!==benBeheer){benBeheer=b===true;if(route()==="profiel")render()}},()=>{});
  try{const j=await rest("POST","rpc/mijn_klassen",{});if(Array.isArray(j)&&klasZet(j)&&route()==="profiel")render()}catch(e){klasGeladen=false}}
function klasSectie(){if(!cloudKan()||!sesGet())return "";setTimeout(klasLaden,0);
  const ls=klassen().filter(k=>k.rol==="leerling"),ds=klassen().filter(k=>k.rol==="docent");
  return `${benBeheer?`<div class="section stack" id="beheer"><div><h2>Beheer</h2><p class="small">Alleen voor de beheerder van Boa Paraat.</p></div>
    <div class="panel stack"><p class="small">Zie wie de app gebruikt en waar ze mee bezig zijn, en welke codes je aan opleiders en studenten hebt uitgegeven.</p>
    <div class="row"><a class="btn" href="${esc(beheerUrl())}">Open het beheer</a></div></div></div>`:""}<div class="section stack" id="klas"><div><h2>Klas</h2><p class="small">Volg je een opleiding? Vul de code van je klas in.</p></div>
    ${ls.map(k=>`<div class="panel stack"><div class="stack" style="gap:2px"><b>${esc(k.naam)}</b><span class="small">${k.start?"Gestart "+esc(k.start)+" · ":""}${k.doc.length?"Docent: "+k.doc.map(esc).join(", "):"Nog geen docent gekoppeld"}</span></div>
      <p class="small">Je docent ziet je oefenresultaten: welke vragen je goed en fout had, je oefenexamens en je casussen. Je profiel en je verslagen ziet je docent niet.</p>
      ${klasWeg===k.id?`<div class="confirm stack" style="gap:10px"><span><b>Klas verlaten?</b> Je docent ziet je resultaten dan niet meer. Je voortgang blijft bewaard.</span><div class="row"><button class="btn danger" data-act="klas-weg-ja" data-id="${esc(k.id)}">Klas verlaten</button><button class="btn ghost" data-act="klas-weg-nee">Annuleren</button></div></div>`
        :`<div class="row"><button class="btn ghost" data-act="klas-weg" data-id="${esc(k.id)}">Klas verlaten</button></div>`}</div>`).join("")}
    ${ds.length?`<div class="panel stack"><b>Je bent docent van ${ds.length===1?esc(ds[0].naam):ds.length+" klassen"}</b><p class="small">Bekijk de resultaten van je leerlingen in de docentenomgeving.</p><div class="row"><a class="btn" href="${esc(docentUrl())}">Open de docentenomgeving</a></div></div>`:""}
    <form class="panel stack" id="klasForm" autocomplete="off"><div class="field"><label for="klasCode">Code van je klas</label>
      <input id="klasCode" autocapitalize="characters" spellcheck="false" placeholder="KLAS-XXXX-XXXX"${klasFout?' aria-invalid="true" aria-describedby="klasErr"':""}></div>
      ${klasFout?`<p class="ferr" id="klasErr" role="alert">${esc(klasFout)}</p>`:""}
      <p class="small">Met een leerlingcode kan je docent je oefenresultaten zien.</p>
      <div><button class="btn" type="submit"${klasBezig?" disabled":""}>${klasBezig?"Bezig…":"Code gebruiken"}</button></div></form></div>`}
async function klasInwisselen(code){code=String(code||"").trim();
  if(!/[A-Za-z0-9]{6,}/.test(code.replace(/[^A-Za-z0-9]/g,""))){klasFout="Vul de code in die je van je opleiding hebt gekregen.";render();return}
  if(!navigator.onLine){klasFout="Je bent offline. Om een code te gebruiken heb je internet nodig.";render();return}
  klasFout="";klasBezig=true;render();
  try{const j=await rest("POST","rpc/klascode_inwisselen",{code});klasBezig=false;
    if(!j||!j.ok){klasFout=j&&j.reden==="te_vaak"?"Te veel pogingen. Probeer het over een uur opnieuw.":j&&j.reden==="gebruikt"?"Deze code is al door iemand anders gebruikt. Vraag je opleiding om een nieuwe code.":"Deze code kennen we niet. Controleer de code.";render();const i=document.getElementById("klasCode");if(i){i.value=code;i.focus()}return}
    let lijst=null;try{lijst=await rest("POST","rpc/mijn_klassen",{})}catch(e){}
    if(Array.isArray(lijst))klasZet(lijst);else klasZet(klassen().filter(k=>k.id!==j.klas.id).concat([{id:j.klas.id,naam:j.klas.naam,start:j.klas.start,rol:j.rol,docenten:[]}]));
    render();toast(j.rol==="docent"?"Je bent nu docent van "+j.klas.naam:"Je zit nu in "+j.klas.naam)}
  catch(e){klasBezig=false;klasFout=!navigator.onLine||e.status>=500?"Geen verbinding met de server. Probeer het zo opnieuw.":"De code kon niet worden gecontroleerd. Probeer het opnieuw.";render()}}
document.addEventListener("submit",e=>{if(e.target.id!=="klasForm")return;e.preventDefault();klasInwisselen((document.getElementById("klasCode")||{}).value)});
function klasAct(act,el){
  if(act==="klas-weg"){klasWeg=el.dataset.id;render();return true}
  if(act==="klas-weg-nee"){klasWeg="";render();return true}
  if(act==="klas-weg-ja"){const id=el.dataset.id;klasWeg="";
    rest("POST","rpc/klas_verlaten",{klas:id}).then(()=>{klasZet(klassen().filter(k=>k.id!==id));render();toast("Je hebt de klas verlaten")},
      ()=>{toast("Dat lukte niet. Controleer je internetverbinding en probeer het opnieuw.");render()});return true}
  return false}
indelingToepassen();
