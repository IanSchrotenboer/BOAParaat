// ---------- naslag: wetsartikelen en toetstermen ----------
// 1. Wetslinks: de bron bij een vraag ("art. 142 Sv") wordt een link naar dat artikel op wetten.overheid.nl.
//    Vaste links (jci) wijzen altijd naar de geldende tekst. Bronnen zonder wet (lesstof, rubrics) en de
//    Model-APV (verschilt per gemeente) blijven gewone tekst. Id's (BWB) gecontroleerd op wetten.overheid.nl.
// 2. Toetsterm: bij een vraag van PHB 1 staat de toetsterm uit de toetsmatrijs van ExTH (matrijs.js).
const WET_ID={"Sv":"BWBR0001903","Sr":"BWBR0001854","Gw":"BWBR0001840","Awb":"BWBR0005537","Awbi":"BWBR0006763",
  "Gemeentewet":"BWBR0005416","Provinciewet":"BWBR0005645","Politiewet 2012":"BWBR0031788","Ambtsinstructie":"BWBR0006589",
  "Wp2000":"BWBR0011470","Bp2000":"BWBR0011982","WVW 1994":"BWBR0006622","RVV 1990":"BWBR0004825","Alcoholwet":"BWBR0002458",
  "Spoorwegwet":"BWBR0015007","Wet lokaal spoor":"BWBR0034363","WED":"BWBR0002063","Visserijwet 1963":"BWBR0002416",
  "Wpg":"BWBR0022463","Winkeltijdenwet":"BWBR0007952","Besluit boa":"BWBR0007013","Leerplichtwet 1969":"BWBR0002628",
  "Wet op de identificatieplicht":"BWBR0006297","Wid":"BWBR0006297","Wet RO":"BWBR0001830","Wm":"BWBR0003245",
  "RTGB":"BWBR0021973","Regeling toetsing geweldsbeheersing boa's":"BWBR0021973","Grondwet":"BWBR0001840","Omgevingswet":"BWBR0037885"};
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
