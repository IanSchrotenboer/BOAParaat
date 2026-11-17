// ---------- Melding opnemen en verwerken: oefenmeldingen (indeling voor scholieren) ----------
// De leerling leest een melding (telefoon, balie of straat), legt hem vast, kiest de urgentie en naar wie hij hem
// doorzet, en schrijft wat hij de melder terugkoppelt. Daarna: urgentie en doorzetten worden nagekeken, en met het
// modelantwoord vinkt hij zelf aan welke punten in zijn registratie staan. Uitslag in store.k (zoals de casussen),
// zodat de docent hem ziet. Max. 10 punten: urgentie 2, doorzetten 2, zes punten in de registratie 1 elk; voldoende vanaf 7.
const MO_URG=[["spoed","Direct: nu hulp nodig"],["snel","Vandaag nog oppakken"],["regulier","Inplannen in het gewone werk"],["door","Niet voor handhaving: doorzetten"]];
const MO_NAAR=[["112","Politie of ambulance via 112"],["0900","Politie zonder spoed (0900-8844)"],["hh","Handhaving zelf"],["beheer","Gemeente: beheer openbare ruimte"],["vt","Veilig Thuis (0800-2000)"],["mzg","Meldpunt zorgwekkend gedrag (0800-1205)"],["144","Dierennood (144)"]];
const MELD=[
  {id:"mo-speeltuin",titel:"Overlast bij de speeltuin",kanaal:"Telefoon",dom:"1",
   tekst:[["Melder","Goedemiddag, u spreekt met Ans de Groot. Ik woon aan de Lindelaan 14, tegenover de speeltuin in het Rozenpark."],["Jij","Waar kan ik u mee helpen?"],["Melder","Al twee weken staat daar elke avond vanaf een uur of tien een groep jongeren. Een stuk of zes. Ze draaien harde muziek en laten blikjes en zakken chips achter."],["Jij","Gebeurt er verder iets, worden er mensen lastiggevallen of dingen vernield?"],["Melder","Nee, dat niet. Maar ik slaap slecht en de kinderen spelen 's ochtends tussen de rommel."],["Jij","Op welk nummer kan ik u bereiken?"],["Melder","06-12345678."]],
   urg:"regulier",naar:"hh",waarom:"Geen gevaar, wel terugkerende overlast en afval: een taak voor handhaving, in te plannen rond 22.00 uur.",
   model:"Telefonische melding van mevrouw A. de Groot (Lindelaan 14, 06-12345678). Al twee weken elke avond vanaf ongeveer 22.00 uur een groep van ongeveer zes jongeren bij de speeltuin in het Rozenpark. Harde muziek; zij laten blikjes en verpakkingen achter. Geen vernielingen of lastigvallen gemeld.",
   punten:["De plaats: speeltuin Rozenpark (tegenover Lindelaan 14)","De tijd: elke avond vanaf ongeveer 22.00 uur, al twee weken","Wat er gebeurt: harde muziek en achtergelaten afval","Wie: een groep van ongeveer zes jongeren","Dat er geen vernieling of lastigvallen is gemeld","Naam en telefoonnummer van de melder"],
   terug:"Dat handhaving de komende avonden langsgaat en dat zij hoort wat er is gebeurd. Geen belofte dat het meteen over is."},
  {id:"mo-tegel",titel:"Losse tegels bij de school",kanaal:"Balie",dom:"1",
   tekst:[["Melder","Bij de ingang van basisschool De Regenboog, aan de Schoolstraat, liggen drie stoeptegels los. Vanochtend is er een kind over gestruikeld."],["Jij","Is het kind gewond geraakt?"],["Melder","Een geschaafde knie, verder niets. Maar het is gevaarlijk, er lopen daar de hele dag kinderen."],["Jij","Mag ik uw naam en telefoonnummer?"],["Melder","Kees Bakker, 06-87654321."]],
   urg:"door",naar:"beheer",waarom:"Onderhoud van de stoep is een taak van de gemeente als wegbeheerder. Omdat er kinderen lopen, geef je aan dat het snel moet.",
   model:"Baliemelding van de heer K. Bakker (06-87654321). Drie losliggende stoeptegels bij de ingang van basisschool De Regenboog, Schoolstraat. Vanochtend is een kind gestruikeld (geschaafde knie). Veel kinderen passeren: struikelgevaar. Doorgezet naar beheer openbare ruimte met verzoek om spoedige reparatie.",
   punten:["De plaats: ingang basisschool De Regenboog, Schoolstraat","Wat: drie losliggende stoeptegels","Het voorval: een kind is gestruikeld (geschaafde knie)","Het risico: veel kinderen, struikelgevaar","Naar wie doorgezet (beheer openbare ruimte)","Naam en telefoonnummer van de melder"],
   terug:"Dat de melding is doorgezet naar de afdeling die de stoep herstelt, met het verzoek het snel te doen."},
  {id:"mo-kind",titel:"Zorgen om een buurkind",kanaal:"Telefoon",dom:"all",
   tekst:[["Melder","Ik wil eigenlijk niet dat de buren weten dat ik bel. Ik hoor bijna elke avond geschreeuw bij de buren op nummer 7 en dan huilt hun zoontje, hij is een jaar of zes."],["Jij","Hoort u nu iets, is er op dit moment gevaar?"],["Melder","Nee, nu is het stil. Het was gisteravond rond negen uur weer heel erg."],["Jij","Heeft u iets gezien, bijvoorbeeld verwondingen bij het kind?"],["Melder","Vorige week had hij een blauwe plek op zijn wang."]],
   urg:"door",naar:"vt",waarom:"Zorgen over mogelijke kindermishandeling zonder acuut gevaar: Veilig Thuis. Hoort de melder het nu gebeuren, dan bel je 112.",
   model:"Telefonische melding, melder wil anoniem blijven tegenover de buren. Bijna elke avond geschreeuw en een huilend kind (jongen, ongeveer 6 jaar) op nummer 7; laatst gisteravond rond 21.00 uur. Vorige week zag de melder een blauwe plek op de wang van het kind. Nu geen acuut gevaar. Doorgezet naar Veilig Thuis.",
   punten:["Het adres (nummer 7, naast de melder)","Wat: geschreeuw en een huilend kind, bijna elke avond","Het kind: jongen van ongeveer 6 jaar, blauwe plek op de wang","Laatste keer: gisteravond rond 21.00 uur","Dat er nu geen acuut gevaar is","Dat de melder anoniem wil blijven tegenover de buren"],
   terug:"Dat de zorgen serieus worden genomen en zijn doorgegeven aan Veilig Thuis, en dat hij bij acuut gevaar direct 112 belt."},
  {id:"mo-verward",titel:"Een man in het park",kanaal:"Straat",dom:"1",
   tekst:[["Melder","Meneer, daar op het bankje bij de vijver zit al drie dagen dezelfde man. Hij slaapt er ook."],["Jij","Wat ziet u hem doen?"],["Melder","Hij praat hardop tegen zichzelf en hij heeft geen jas aan, terwijl het koud is. Hij doet niemand iets."],["Jij","Hoe ziet hij eruit?"],["Melder","Een jaar of vijftig, grijze baard, blauwe trui, een plastic tas met spullen."]],
   urg:"door",naar:"mzg",waarom:"Zorgwekkend gedrag zonder direct gevaar: het Meldpunt zorgwekkend gedrag. Is hij een gevaar voor zichzelf of anderen, dan 112.",
   model:"Melding op straat van een voorbijganger. Bij de vijver in het park zit al drie dagen een man (ongeveer 50 jaar, grijze baard, blauwe trui, plastic tas met spullen) die er ook slaapt, hardop tegen zichzelf praat en zonder jas in de kou zit. Geen agressie of gevaar voor anderen gezien. Doorgezet naar het Meldpunt zorgwekkend gedrag.",
   punten:["De plaats: bankje bij de vijver in het park","Hoe lang: al drie dagen, ook 's nachts","Het gedrag: praat hardop tegen zichzelf, geen jas in de kou","Het signalement: ongeveer 50, grijze baard, blauwe trui, plastic tas","Dat hij niemand iets doet","Naar wie doorgezet (Meldpunt zorgwekkend gedrag)"],
   terug:"Dat de melding is doorgegeven aan het meldpunt dat hulp voor de man regelt, en dat hij 112 belt als de situatie gevaarlijk wordt."},
  {id:"mo-inbraak",titel:"Inbraak aan de overkant",kanaal:"Telefoon",dom:"1",
   tekst:[["Melder","Ze breken nu in bij de overburen! Twee mannen, ze staan bij het keukenraam met een koevoet."],["Jij","Waar is het precies?"],["Melder","Eikenlaan 23, de achterkant, aan het pad langs de sloot."],["Jij","Hoe zien ze eruit?"],["Melder","Allebei donkere kleding, één met een rode pet. Er staat een witte bestelbus op het pad."]],
   urg:"spoed",naar:"112",waarom:"Een inbraak die nu gaande is: heterdaad. De politie moet direct komen via 112.",
   model:"Telefonische melding van een inbraak die nu gaande is aan de achterkant van Eikenlaan 23, aan het pad langs de sloot. Twee mannen in donkere kleding, één met een rode pet, met een koevoet bij het keukenraam. Witte bestelbus op het pad. Direct doorgegeven via 112.",
   punten:["Dat het nu gebeurt (heterdaad)","De plaats: achterkant Eikenlaan 23, pad langs de sloot","Wat: twee mannen met een koevoet bij het keukenraam","Het signalement: donkere kleding, één met rode pet","Het voertuig: witte bestelbus op het pad","Dat 112 direct is gebeld"],
   terug:"Dat de politie onderweg is, dat hij zelf niet naar buiten gaat en dat hij blijft kijken en doorbelt als er iets verandert."},
  {id:"mo-hond",titel:"Hond in een warme auto",kanaal:"Straat",dom:"all",
   tekst:[["Melder","Op de parkeerplaats van de supermarkt staat een zwarte auto met een hond erin. De ramen zijn dicht en de hond hijgt heel erg."],["Jij","Hoe lang staat de auto er al?"],["Melder","Ik zag hem twintig minuten geleden al staan. Het is 28 graden."],["Jij","Weet u het kenteken?"],["Melder","GX-123-B, een zwarte Volkswagen Golf."]],
   urg:"spoed",naar:"144",waarom:"Een dier in nood in een hete auto is spoed: 144. De supermarkt kan de eigenaar omroepen.",
   model:"Melding op straat: op de parkeerplaats van de supermarkt staat een zwarte Volkswagen Golf (GX-123-B) met de ramen dicht en een hevig hijgende hond erin, minstens 20 minuten, bij 28 graden. Direct doorgegeven aan 144; supermarkt gevraagd de eigenaar om te roepen.",
   punten:["De plaats: parkeerplaats van de supermarkt","De auto: zwarte Volkswagen Golf, kenteken GX-123-B","De hond: hevig hijgend, ramen dicht","Hoe lang: minstens 20 minuten","De temperatuur: 28 graden","Dat 144 direct is gebeld"],
   terug:"Dat de dierenhulp is ingeschakeld en dat je de eigenaar laat omroepen."},
  {id:"mo-perron",titel:"Een achtergelaten tas op het perron",kanaal:"Straat",dom:"4",
   tekst:[["Reiziger","Op perron 3, bij het trappenhuis, staat al een kwartier een grote zwarte koffer. Er is niemand bij."],["Jij","Heeft u gezien wie hem heeft neergezet?"],["Reiziger","Een man met een grijze jas, die is de trein van 10.12 uur in gestapt zonder de koffer."],["Jij","Heeft u de koffer aangeraakt?"],["Reiziger","Nee."]],
   urg:"spoed",naar:"112",waarom:"Een onbeheerd achtergelaten bagagestuk kan gevaarlijk zijn: niet aanraken, omgeving vrijhouden en direct de politie inschakelen volgens het protocol van de vervoerder.",
   model:"Melding van een reiziger: op perron 3 bij het trappenhuis staat sinds ongeveer een kwartier een grote zwarte koffer zonder eigenaar. Een man met een grijze jas zette hem neer en stapte in de trein van 10.12 uur. Koffer niet aangeraakt. Direct gemeld via 112 en de meldkamer van de vervoerder; omgeving vrijgehouden.",
   punten:["De plaats: perron 3, bij het trappenhuis","Wat: grote zwarte koffer zonder eigenaar","Hoe lang: ongeveer een kwartier","Wie: man met grijze jas, trein van 10.12 uur","Dat de koffer niet is aangeraakt","Dat 112 en de meldkamer direct zijn ingeschakeld"],
   terug:"Dat hij afstand houdt en de aanwijzingen van het personeel opvolgt."}];
const MELDBY=Object.fromEntries(MELD.map(m=>[m.id,m]));
let MO=null; // {id, stap:1|2, reg, urg, naar, terug}
const moLijst=()=>MELD.filter(m=>m.dom==="all"||m.dom===dom()||(m.dom==="1"&&dom()!=="4"));
const moBest=id=>(store.k||[]).filter(r=>r.cs===id).reduce((a,r)=>Math.max(a,r.p),-1);
function moKaart(){const n=moLijst().length;const l=(store.k||[]).find(r=>MELDBY[r.cs]);
  return `<div class="exam wvcard"><div class="big" aria-hidden="true">${ICON.doc}</div><div class="stack" style="gap:10px">
    <div><h2>Meldingen verwerken</h2><p class="small">${n} oefenmeldingen${l?` · laatst: ${l.p}/${l.m}`:""}</p></div>
    <div class="row"><a class="btn hi" href="#melding">Meldingen verwerken</a></div></div></div>`}
function viewMelding(r){if(r==="melding"){MO=null;return moOverzicht()}
  const m=MELDBY[r.slice(8)];if(!m)return moOverzicht();
  if(!MO||MO.id!==m.id)MO={id:m.id,stap:1,reg:"",urg:"",naar:"",terug:""};
  return MO.stap===2?moNakijken(m):moOpdracht(m)}
function moOverzicht(){
  return `<div class="stack">${modChips("mo")}
    <div class="stack" style="gap:8px"><a class="small" href="#mo">← ${esc(modTitel("mo"))}</a><h1>Meldingen verwerken</h1>
    ${info("Zo werkt het",["Lees de melding","Leg hem vast zoals in het meldsysteem","Kies de urgentie en naar wie hij gaat","Vergelijk met het modelantwoord"])}</div>
    <div class="kzlist">${moLijst().map(m=>{const b=moBest(m.id);return `<a class="kzitem" href="#melding-${m.id}"><span class="eyebrow">${esc(m.kanaal)}</span><b>${esc(m.titel)}</b>${b>=0?`<span class="pill ${b>=7?"pass":"fail"}">Beste: ${b}/10</span>`:`<span class="small">Nog niet gedaan</span>`}</a>`}).join("")}</div></div>`}
function moOpdracht(m){const o=(a,v)=>a.map(([k,l])=>`<option value="${k}"${k===v?" selected":""}>${esc(l)}</option>`).join("");
  return `<div class="stack">
    <div class="stack" style="gap:8px"><a class="small" href="#melding">← Alle meldingen</a><span class="eyebrow">${esc(m.kanaal)}</span><h1>${esc(m.titel)}</h1></div>
    <div class="panel stack mogesprek" aria-label="De melding">${m.tekst.map(([w,t])=>`<p><b>${esc(w)}:</b> ${esc(t)}</p>`).join("")}</div>
    <form class="stack" id="moForm" novalidate>
      <div class="field"><label for="moReg">Registratie</label><textarea id="moReg" rows="6" placeholder="Wat, waar, wanneer, wie, en wat er is gedaan">${esc(MO.reg)}</textarea></div>
      <div class="field"><label for="moUrg">Urgentie</label><select id="moUrg"><option value="">Kies…</option>${o(MO_URG,MO.urg)}</select></div>
      <div class="field"><label for="moNaar">Wie pakt het op?</label><select id="moNaar"><option value="">Kies…</option>${o(MO_NAAR,MO.naar)}</select></div>
      <div class="field"><label for="moTerug">Wat zeg je de melder?</label><textarea id="moTerug" rows="3">${esc(MO.terug)}</textarea></div>
      ${moFout?`<p class="ferr" role="alert">${esc(moFout)}</p>`:""}
      <div class="row"><button class="btn hi" type="submit">Vergelijk met het model</button></div></form></div>`}
let moFout="";
function moNakijken(m){const ok1=MO.urg===m.urg,ok2=MO.naar===m.naar;const lab=(a,k)=>(a.find(x=>x[0]===k)||["",""])[1];
  return `<div class="stack">
    <div class="stack" style="gap:8px"><a class="small" href="#melding">← Alle meldingen</a><span class="eyebrow">${esc(m.kanaal)} · nakijken</span><h1>${esc(m.titel)}</h1></div>
    <div class="panel stack"><h2>Urgentie en doorzetten</h2>
      <p><span class="pill ${ok1?"pass":"fail"}">${ok1?"Goed":"Fout"}</span> Urgentie: ${esc(lab(MO_URG,MO.urg))}${ok1?"":` · juist: <b>${esc(lab(MO_URG,m.urg))}</b>`}</p>
      <p><span class="pill ${ok2?"pass":"fail"}">${ok2?"Goed":"Fout"}</span> Oppakken: ${esc(lab(MO_NAAR,MO.naar))}${ok2?"":` · juist: <b>${esc(lab(MO_NAAR,m.naar))}</b>`}</p>
      <p class="small">${esc(m.waarom)}</p></div>
    <div class="twee mocmp"><div class="panel stack"><h3>Jouw registratie</h3><p class="mowit">${esc(MO.reg)}</p></div><div class="panel stack"><h3>Model</h3><p>${esc(m.model)}</p></div></div>
    <form class="panel stack" id="moPunten"><h2>Staat dit in jouw registratie?</h2>
      ${m.punten.map((p,i)=>`<label class="mopunt"><input type="checkbox" name="mp" value="${i}"> ${esc(p)}</label>`).join("")}
      <p class="small"><b>Terugkoppeling in het model:</b> ${esc(m.terug)}</p>
      <div class="row"><button class="btn hi" type="submit">Bereken mijn score</button><a class="btn ghost" href="#melding-${m.id}" data-act="mo-opnieuw">Opnieuw</a></div></form></div>`}
document.addEventListener("submit",e=>{
  if(e.target.id==="moForm"){e.preventDefault();const v=id=>(document.getElementById(id)||{}).value||"";
    MO.reg=v("moReg").trim().slice(0,3000);MO.urg=v("moUrg");MO.naar=v("moNaar");MO.terug=v("moTerug").trim().slice(0,1000);
    if(MO.reg.length<20||!MO.urg||!MO.naar){moFout="Schrijf de registratie en kies de urgentie en wie het oppakt.";render();return}
    moFout="";MO.stap=2;render();window.scrollTo(0,0);return}
  if(e.target.id==="moPunten"){e.preventDefault();const m=MELDBY[MO.id];const n=[...e.target.querySelectorAll('input[name="mp"]:checked')].length;
    const p=(MO.urg===m.urg?2:0)+(MO.naar===m.naar?2:0)+n;
    store.k=[{id:"k"+Date.now().toString(36),cs:m.id,d:Date.now(),p,m:10,o:p>=9?"Goed":p>=7?"Voldoende":"Onvoldoende"}].concat(store.k||[]).slice(0,60);save();
    MO=null;toast(`Score: ${p}/10 · ${p>=7?"voldoende":"nog niet voldoende"}`);location.hash="melding"}});
function moClick(act){if(act==="mo-opnieuw"){MO=null;render();return true}return false}
