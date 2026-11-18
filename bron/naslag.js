// ---------- naslag: wetsartikelen, toetstermen en feitcodes ----------
// 1. Wetslinks: de bron bij een vraag ("art. 142 Sv") wordt een link naar dat artikel op wetten.overheid.nl.
//    Vaste links (jci) wijzen altijd naar de geldende tekst. Bronnen zonder wet (lesstof, rubrics) en de
//    Model-APV (verschilt per gemeente) blijven gewone tekst. Id's (BWB) gecontroleerd op wetten.overheid.nl.
// 2. Toetsterm: bij een vraag van PHB 1 staat de toetsterm uit de toetsmatrijs van ExTH (matrijs.js).
// 3. Feitcodes: naslag van feiten waar een boa mee te maken krijgt, met het bedrag van de strafbeschikking.
//    Bron: OM, Lijst van feiten (Feitenboekje) 2026, geldig vanaf 1 januari 2026. Bedragen zonder € 9
//    administratiekosten. Jaarlijks bijwerken; zie LEESMIJ.
const WET_ID={"Sv":"BWBR0001903","Sr":"BWBR0001854","Gw":"BWBR0001840","Awb":"BWBR0005537","Awbi":"BWBR0006763",
  "Gemeentewet":"BWBR0005416","Provinciewet":"BWBR0005645","Politiewet 2012":"BWBR0031788","Ambtsinstructie":"BWBR0006589",
  "Wp2000":"BWBR0011470","Bp2000":"BWBR0011982","WVW 1994":"BWBR0006622","RVV 1990":"BWBR0004825","Alcoholwet":"BWBR0002458",
  "Spoorwegwet":"BWBR0015007","Wet lokaal spoor":"BWBR0034363","WED":"BWBR0002063","Visserijwet 1963":"BWBR0002416",
  "Wpg":"BWBR0022463","Winkeltijdenwet":"BWBR0007952","Besluit boa":"BWBR0007013","Leerplichtwet 1969":"BWBR0002628",
  "Wet op de identificatieplicht":"BWBR0006297","Wid":"BWBR0006297","Wet RO":"BWBR0001830","Wm":"BWBR0003245",
  "RTGB":"BWBR0021973","Regeling toetsing geweldsbeheersing boa's":"BWBR0021973","Grondwet":"BWBR0001840","Vuurwerkbesluit":"BWBR0013360","Omgevingswet":"BWBR0037885"};
const WET_HEEL={"EVRM":"https://wetten.overheid.nl/BWBV0001000","AVG":"https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:32016R0679"};
const WET_RE=new RegExp("^art\\.\\s+(\\d+[a-z]*(?:[:.]\\d+[a-z]*)?)\\b.*?\\s("+Object.keys(WET_ID).concat(Object.keys(WET_HEEL))
  .sort((a,b)=>b.length-a.length).map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")(?:\\s*\\(.*\\))?$");
// adres van één bronverwijzing, of "" als het geen artikel uit een bekende wet is
function wetUrl(deel){const m=WET_RE.exec(deel.trim());if(!m)return "";
  return WET_HEEL[m[2]]||"https://wetten.overheid.nl/jci1.3:c:"+WET_ID[m[2]]+"&artikel="+encodeURIComponent(m[1])}
const wetA=(u,t)=>`<a class="wet" href="${esc(u)}" target="_blank" rel="noopener" data-ext title="Lees de wettekst op ${u.indexOf("eur-lex")>0?"EUR-Lex":"wetten.overheid.nl"}">${t}</a>`;
function bronHtml(r){return String(r||"").split(/;\s*/).map(d=>{const u=wetUrl(d);return u?wetA(u,esc(d)):esc(d)}).join("; ")}

// ----- toetsterm per vraag (toetsmatrijs van het eigen domein) -----
let ttCache=null;
function toetsterm(id){const d=dom()==="4"?"4":"1";
  if(!ttCache||ttCache.d!==d){const m={};for(const deel of MATRIJS[d].delen)for(const [code,naam,,ids] of deel[2])for(const i of ids)if(!m[i])m[i]=[code,naam];ttCache={d,m}}
  return ttCache.m[id]||null}

// ----- feitcodes -----
// c: feitcode · t: omschrijving · w: grondslag (wordt een wetslink) · b: bedrag in euro (0 = OM-feit: geen boete op straat)
// d: "1" openbare ruimte, "4" openbaar vervoer · s: studiestof · k: oefencategorie · n: let op
const FEITEN=[
  {c:"F 185",t:"Binnen de bebouwde kom op een openbare plaats wildplassen (je behoefte doen buiten een plek die daarvoor bedoeld is)",w:"APV van de gemeente",b:170,d:"1",s:"ruimte",k:"apv"},
  {c:"F 121 a",t:"Als volwassene alcohol drinken op een openbare plaats waar dat volgens de APV verboden is",w:"APV van de gemeente",b:110,d:"1",s:"ruimte",k:"apv"},
  {c:"F 121 b",t:"Aangebroken flessen of blikjes met alcohol bij je hebben waar dat volgens de APV verboden is",w:"APV van de gemeente",b:110,d:"1",s:"ruimte",k:"apv"},
  {c:"F 145 a",t:"Een hond los laten lopen op een openbare plaats binnen de bebouwde kom (buiten een losloopgebied)",w:"APV van de gemeente",b:110,d:"1",s:"ruimte",k:"apv"},
  {c:"F 145 b",t:"Een hond laten komen op een kinderspeelplaats, zandbak of speelweide",w:"APV van de gemeente",b:170,d:"1",s:"ruimte",k:"apv"},
  {c:"F 145 f",t:"De poep van je hond op een openbare plaats niet meteen opruimen",w:"APV van de gemeente",b:170,d:"1",s:"ruimte",k:"apv"},
  {c:"F 055 a",t:"Deelnemen aan een samenscholing waar de APV dat verbiedt",w:"APV van de gemeente",b:0,d:"1",s:"ruimte",k:"apv"},
  {c:"H 004",t:"Huisvuil anders aanbieden dan in het aangewezen inzamelmiddel, bijvoorbeeld naast de container",w:"Afvalstoffenverordening van de gemeente",b:110,d:"1",s:"ruimte"},
  {c:"H 022",t:"Klein afval dat buiten is ontstaan, zoals een blikje of een peuk, op straat achterlaten",w:"Afvalstoffenverordening van de gemeente",b:170,d:"1",s:"ruimte"},
  {c:"H 171",t:"Vuurwerk (behalve categorie F1) afsteken buiten de toegestane tijden",w:"Vuurwerkbesluit",b:0,d:"1",s:"ruimte"},
  {c:"E 211",t:"Als jongere onder de 18 alcohol bij je hebben op een plaats die voor publiek toegankelijk is",w:"art. 45 Alcoholwet",b:110,d:"1",s:"ruimte",k:"bijz",n:"Bij jongeren kan de boa ook naar Halt verwijzen."},
  {c:"D 530",t:"In kennelijke staat van dronkenschap op de openbare weg zijn",w:"art. 453 Sr",b:110,d:"",s:"recht"},
  {c:"D 510",t:"Dronken in het openbaar het verkeer belemmeren, de orde verstoren of de veiligheid van een ander bedreigen",w:"art. 426 Sr",b:0,d:"",s:"recht"},
  {c:"D 505",t:"Straatschenderij: op de openbare weg baldadig zijn tegen personen of goederen",w:"art. 424 Sr",b:0,d:"",s:"recht"},
  {c:"D 517",t:"Een identiteitsbewijs niet ter inzage geven als een opsporingsambtenaar daarom vraagt",w:"art. 447e Sr",b:110,d:"",s:"identiteit",k:"vrij",n:"Vermeld in het proces-verbaal waarom het vorderen van het identiteitsbewijs nodig was."},
  {c:"D 537",t:"Op andermans grond komen waar de toegang zichtbaar verboden is",w:"art. 461 Sr",b:110,d:"",s:"recht",n:"Vermeld hoe de toegang zichtbaar verboden was, bijvoorbeeld met een bord."},
  {c:"E 100 a",t:"Zonder geldig vervoerbewijs met het openbaar vervoer reizen",w:"art. 70 Wp2000",b:110,d:"4",s:"ovbewijs",k:"wp",n:"Geen proces-verbaal als de reiziger gebruikmaakt van de administratieve betalingsmogelijkheid (art. 48 Bp2000)."},
  {c:"E 103",t:"Een vervoerbewijs misbruiken door het vervoerbewijs van iemand anders te gebruiken",w:"art. 71 Wp2000",b:0,d:"4",s:"ovorde",k:"wp"},
  {c:"E 120 c",t:"Het personeel hinderen of belemmeren bij zijn werk",w:"art. 72 Wp2000; art. 52 Bp2000",b:290,d:"4",s:"ovorde",k:"bp"},
  {c:"E 124 a",t:"In kennelijke staat van dronkenschap in het openbaar vervoer zijn",w:"art. 72 Wp2000; art. 52 Bp2000",b:110,d:"4",s:"ovorde",k:"bp"},
  {c:"E 125 a",t:"Roken in een voertuig of deel daarvan waar dat niet mag",w:"art. 72 Wp2000; art. 52 Bp2000",b:110,d:"4",s:"ovorde",k:"bp"},
  {c:"E 129 a",t:"Zoveel geluid maken dat anderen er last van hebben, ook met vuurwerk",w:"art. 72 Wp2000; art. 52 Bp2000",b:170,d:"4",s:"ovorde",k:"bp"},
  {c:"E 129 ff",t:"Je behoefte doen buiten een plek die daarvoor bedoeld is",w:"art. 72 Wp2000; art. 52 Bp2000",b:170,d:"4",s:"ovorde",k:"bp"},
  {c:"E 128",t:"Aanwijzingen van of namens de vervoerder voor orde, rust, veiligheid of een goede bedrijfsgang niet opvolgen",w:"art. 73 Wp2000; art. 53 Bp2000",b:110,d:"4",s:"ovorde",k:"wp",n:"Neem de aanwijzing woordelijk op in het proces-verbaal."},
  {c:"E 149",t:"Op of langs het spoor van een hoofdspoorweg komen",w:"Spoorwegwet",b:170,d:"4",s:"spoor",k:"spw"}];
const FEIT_BRON="https://www.om.nl/onderwerpen/boetebase";
let feitQ="";
const feitNorm=s=>String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g," ");
function feitKaart(f){const k=f.k&&CATS[f.k]&&inCat(f.k).length?f.k:"",s=STOFBY[f.s];
  const w=f.w.indexOf("art.")===0?bronHtml(f.w):f.w==="Vuurwerkbesluit"||f.w==="Spoorwegwet"?wetA("https://wetten.overheid.nl/"+WET_ID[f.w],esc(f.w)):esc(f.w);
  return `<li class="feit"><div class="feitkop"><span class="chip mono">${esc(f.c)}</span><span class="feitbedrag${f.b?"":" om"}">${f.b?"€ "+f.b:"OM-feit"}</span></div>
    <p>${esc(f.t)}</p><p class="small">${w}${f.b?"":" · geen boete op straat: proces-verbaal, de officier van justitie beslist"}</p>
    ${f.n?`<p class="small feitlet">${esc(f.n)}</p>`:""}
    ${s||k?`<div class="row feitlinks">${s?`<a class="btn sm ghost" href="#stof-${s.id}">Lees: ${esc(s.titel)}</a>`:""}${k?`<button class="btn sm" data-act="oefen" data-cat="${k}">Oefen: ${esc(CATS[k][1])}</button>`:""}</div>`:""}</li>`}
function feitLijst(){const ws=feitNorm(feitQ).split(" ").filter(Boolean);
  const pas=f=>ws.every(w=>feitNorm(f.c+" "+f.t+" "+f.w).includes(w)||feitNorm(f.c).replace(/ /g,"").includes(w));
  const eigen=dom()==="4"?"4":"1",groep=[["Openbare ruimte (domein I)","1"],["Openbaar vervoer (domein IV)","4"],["Wetboek van Strafrecht (alle domeinen)",""]];
  groep.sort((a,b)=>(b[1]===eigen)-(a[1]===eigen));
  const html=groep.map(([kop,d])=>{const l=FEITEN.filter(f=>f.d===d&&pas(f));return l.length?`<h2 class="deel">${kop}</h2><ul class="feiten">${l.map(feitKaart).join("")}</ul>`:""}).join("");
  return html||`<p class="small">Geen feitcode gevonden voor "${esc(feitQ)}".</p>`}
function viewFeiten(){
  return `<div class="stack feitview">
    <div class="stack" style="gap:8px"><a class="small" href="#stof">← Studiestof</a><span class="eyebrow">Naslag</span><h1>Feitcodes en boetes</h1>
    <p class="lede">Feiten waar je als boa vaak mee te maken krijgt, met het bedrag van de strafbeschikking. Om te leren, niet om op straat te gebruiken: kijk in de praktijk altijd in de actuele lijst van je organisatie.</p></div>
    <div class="zoek" role="search"><label class="vh" for="feitIn">Zoek een feitcode of feit</label><input id="feitIn" type="search" placeholder="Bijvoorbeeld hond, alcohol of E 100" value="${esc(feitQ)}" autocomplete="off" enterkeyhint="search"></div>
    <div id="feitUit" aria-live="polite">${feitLijst()}</div>
    <p class="small">Bedragen 2026 voor volwassenen, zonder € 9 administratiekosten. Bron: Openbaar Ministerie, Lijst van feiten 2026 (geldig vanaf 1 januari 2026). Een APV-feit geldt alleen als de APV van de gemeente het verbod kent. Actuele bedragen: <a href="${FEIT_BRON}" target="_blank" rel="noopener" data-ext>Boetebase van het OM</a>.</p>
  </div>`}
document.addEventListener("input",e=>{if(e.target.id!=="feitIn")return;feitQ=e.target.value;const u=document.getElementById("feitUit");if(u)u.innerHTML=feitLijst()});
const feitKaartStof=()=>`<a class="feitlink" href="#stof-feitcodes"><span><b>Feitcodes en boetes</b><span class="small">${FEITEN.length} feiten met bedrag, wetsartikel en waar je het oefent</span></span><span aria-hidden="true">→</span></a>`;
