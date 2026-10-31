// ---------- PHB 3 · praktijkoefening Waarneming en verslaglegging ----------
// Opzet volgens ExTH: schriftelijke briefing, tweemaal een film (max. 3,5 min) met 2 minuten pauze,
// aantekeningen toegestaan, verslag in het ExTH-sjabloon. Totaal 80 minuten. Beoordeling op 100 punten:
// 40 algemene criteria (4 x 10) en 60 specifieke waarnemingen. Geslaagd vanaf 70, met minimaal 50% op
// aanvangssituatie, gebeurtenissen en specificaties. 'Goed' vanaf 85. Elke onjuiste relevante waarneming: -10.
const WV_MIN=80, WV_PAUSE=120, WV_PASS=70, WV_GOOD=85;
const WV_PARTS=[["aanv","Aanvangssituatie",15],["gebeur","Gebeurtenissen",25],["spec","Specificaties",20]];

// ===== tekenhulpen (SVG, 960 x 540) =====
const SKIN=["#f1c9a5","#d9a57c","#a8714d","#7a4b2e"];
function person(o){
  // o: skin, hair, hairStyle(short|pony|bald|curly|cap), cap, beard, glasses, coat, coatLong, arm, pants, shoes, scarf, bag(handbag color), pack(backpack color), extra
  const sk=o.skin||SKIN[0], coat=o.coat, arm=o.arm||coat, legTop=o.coatLong?-62:-72;
  let hair="";
  if(o.hairStyle==="short")hair=`<path d="M-13 -142 Q-13 -158 0 -158 Q13 -158 13 -142 Q8 -150 0 -150 Q-8 -150 -13 -142z" fill="${o.hair}"/>`;
  if(o.hairStyle==="pony")hair=`<path d="M-14 -138 Q-15 -159 0 -159 Q15 -159 14 -138 Q10 -151 0 -151 Q-10 -151 -14 -138z" fill="${o.hair}"/><ellipse cx="15" cy="-136" rx="5" ry="11" fill="${o.hair}"/>`;
  if(o.hairStyle==="curly")hair=`<g fill="${o.hair}"><circle cx="-10" cy="-150" r="6"/><circle cx="0" cy="-155" r="7"/><circle cx="10" cy="-150" r="6"/><circle cx="-13" cy="-141" r="5"/><circle cx="13" cy="-141" r="5"/></g>`;
  if(o.hairStyle==="white")hair=`<path d="M-13 -140 Q-14 -156 0 -156 Q14 -156 13 -140 Q9 -148 0 -147 Q-9 -148 -13 -140z" fill="${o.hair}"/>`;
  const cap=o.cap?`<path d="M-14 -144 Q-14 -160 0 -160 Q14 -160 14 -144z" fill="${o.cap}"/><rect x="-16" y="-146" width="24" height="4" rx="2" fill="${o.cap}"/>`:"";
  const hood=o.hood?`<path d="M-17 -136 Q-18 -164 0 -164 Q18 -164 17 -136 L12 -134 Q12 -152 0 -152 Q-12 -152 -12 -134z" fill="${o.hood}"/>`:"";
  const beard=o.beard?`<path d="M-11 -138 Q-12 -124 0 -122 Q12 -124 11 -138 Q6 -131 0 -131 Q-6 -131 -11 -138z" fill="${o.beard}"/>`:"";
  const glasses=o.glasses?`<g fill="none" stroke="#1b1b1b" stroke-width="1.6"><circle cx="-5" cy="-142" r="3.6"/><circle cx="5" cy="-142" r="3.6"/><path d="M-1.4 -142h2.8"/></g>`:"";
  const scarf=o.scarf?`<rect x="-12" y="-128" width="24" height="7" rx="3" fill="${o.scarf}"/><rect x="4" y="-123" width="6" height="18" rx="2" fill="${o.scarf}"/>`:"";
  const pack=o.pack?`<rect x="-27" y="-136" width="54" height="56" rx="9" fill="${o.pack}"/>`:"";
  const straps=o.pack?`<path d="M-12 -127 L-11 -86 M12 -127 L11 -86" stroke="${o.pack}" stroke-width="5" stroke-linecap="round"/>`:"";
  const bag=o.bag?`<g><path d="M24 -96 q6 -14 12 0" fill="none" stroke="${o.bag}" stroke-width="2"/><rect x="22" y="-96" width="17" height="14" rx="3" fill="${o.bag}"/></g>`:"";
  const coatH=o.coatLong?-40:-66;
  return `<g class="legs"><g class="lg1"><rect x="-11" y="${legTop}" width="9" height="${-legTop-4}" fill="${o.pants}"/><ellipse cx="-7" cy="-3" rx="8" ry="4" fill="${o.shoes}"/></g><g class="lg2"><rect x="2" y="${legTop}" width="9" height="${-legTop-4}" fill="${o.pants}"/><ellipse cx="7" cy="-3" rx="8" ry="4" fill="${o.shoes}"/></g></g>
    ${pack}
    <g class="ar1"><rect x="-28" y="-122" width="8" height="46" rx="4" fill="${arm}"/><circle cx="-24" cy="-74" r="4.5" fill="${sk}"/></g>
    <g class="ar2"><rect x="20" y="-122" width="8" height="46" rx="4" fill="${arm}"/><circle cx="24" cy="-74" r="4.5" fill="${sk}"/>${o.hand||""}</g>
    <path d="M-20 -122 Q-20 -128 -12 -128 L12 -128 Q20 -128 20 -122 L${o.coatLong?22:20} ${coatH} L${o.coatLong?-22:-20} ${coatH}z" fill="${coat}"/>
    ${o.zip?`<path d="M0 -127 V${coatH}" stroke="${o.zip}" stroke-width="1.5"/>`:""}
    ${o.vest?`<path d="M-20 -122 Q-20 -128 -12 -128 L12 -128 Q20 -128 20 -122 L20 ${coatH} L-20 ${coatH}z" fill="${o.vest}"/>`:""}
    ${straps}${scarf}${bag}
    <rect x="-4" y="-132" width="8" height="6" fill="${sk}"/>
    ${hood}<circle cx="0" cy="-142" r="13" fill="${sk}"/>${hair}${cap}${beard}${glasses}
    <circle cx="-4.5" cy="-143" r="1.3" fill="#222"/><circle cx="4.5" cy="-143" r="1.3" fill="#222"/>
    ${o.extra||""}`;
}
const SMOKE=`<g data-k="smoke" style="display:none"><circle class="sm s1" cx="41" cy="-86" r="4" fill="#eef0f2"/><circle class="sm s2" cx="41" cy="-86" r="5" fill="#f4f5f6"/><circle class="sm s3" cx="41" cy="-86" r="4.5" fill="#e6e9ec"/></g>`;

// ===== scenario 1: perron (domein IV, OV) =====
const PERRON_BG=`
<rect width="960" height="540" fill="#c9d1da"/>
<rect y="0" width="960" height="70" fill="#7d8894"/><rect y="62" width="960" height="10" fill="#5d6772"/>
<g fill="#6f7a86">${[90,330,570,810].map(x=>`<rect x="${x}" y="70" width="18" height="120"/>`).join("")}</g>
<rect y="190" width="960" height="145" fill="#8e969e"/>
<rect y="300" width="960" height="8" fill="#6b5a4a"/><rect y="318" width="960" height="6" fill="#6b5a4a"/>
<g stroke="#5a4c3f" stroke-width="5">${Array.from({length:25},(_,i)=>`<path d="M${i*40+10} 296 v32"/>`).join("")}</g>
<rect y="335" width="960" height="205" fill="#b9bec4"/><rect y="335" width="960" height="6" fill="#e7e9eb"/>
<rect y="350" width="960" height="5" fill="#f2c94c"/>
<g fill="#aab0b6">${Array.from({length:12},(_,i)=>`<rect x="${i*80+38}" y="360" width="2" height="180"/>`).join("")}</g>
<g><rect x="120" y="96" width="250" height="34" rx="3" fill="#1f3e78"/><text x="245" y="119" text-anchor="middle" font-size="17" font-weight="700" fill="#fff" font-family="Arial,sans-serif">Amersfoort Centraal</text></g>
<g><rect x="455" y="20" width="62" height="40" rx="4" fill="#1f3e78"/><text x="486" y="48" text-anchor="middle" font-size="24" font-weight="700" fill="#fff" font-family="Arial,sans-serif">5a</text></g>
<g><rect x="760" y="90" width="190" height="62" rx="3" fill="#13213a"/><text id="fBoard1" x="770" y="112" font-size="14" fill="#ffd34d" font-family="Arial,sans-serif" font-weight="700">14:34  Sprinter</text><text id="fBoard2" x="770" y="132" font-size="14" fill="#fff" font-family="Arial,sans-serif">Utrecht Centraal</text><text x="770" y="147" font-size="10" fill="#9fb0c8" font-family="Arial,sans-serif">spoor 5a</text></g>
<g transform="translate(640 112)"><circle r="22" fill="#fff" stroke="#3a3f45" stroke-width="4"/><path id="fHour" d="M0 0 V-11" stroke="#111" stroke-width="3" stroke-linecap="round"/><path id="fMin" d="M0 0 V-17" stroke="#111" stroke-width="2" stroke-linecap="round"/><circle r="2" fill="#c00"/></g>
<g transform="translate(578 236)"><rect x="-22" y="-26" width="44" height="52" rx="3" fill="#fff" stroke="#9aa3ab"/><circle cx="0" cy="-6" r="13" fill="none" stroke="#c0392b" stroke-width="3"/><rect x="-9" y="-8" width="16" height="4" fill="#333"/><path d="M-9 3 L9 -15" stroke="#c0392b" stroke-width="3"/><text x="0" y="20" text-anchor="middle" font-size="8" font-family="Arial,sans-serif" fill="#333">Rookvrij</text></g>
<rect x="570" y="190" width="16" height="22" fill="#6f7a86"/>
<g transform="translate(150 430)"><rect x="-55" y="-30" width="110" height="10" rx="3" fill="#6d4c33"/><rect x="-55" y="-50" width="110" height="8" rx="3" fill="#6d4c33"/><rect x="-48" y="-22" width="6" height="22" fill="#444"/><rect x="42" y="-22" width="6" height="22" fill="#444"/></g>
<g transform="translate(262 420)"><rect x="-14" y="-44" width="28" height="44" rx="4" fill="#5b6570"/><rect x="-16" y="-48" width="32" height="7" rx="3" fill="#47505a"/></g>
`;
const POLE=`<rect x="-6" y="-100" width="12" height="100" rx="3" fill="#2b5aa8"/><rect x="-11" y="-112" width="22" height="26" rx="4" fill="#1d3f78"/><rect data-k="idle" x="-7" y="-108" width="14" height="10" rx="2" fill="#9fb3cf"/><rect data-k="ok" style="display:none" x="-7" y="-108" width="14" height="10" rx="2" fill="#32d26a"/><rect x="-14" y="-4" width="28" height="4" fill="#1d3f78"/>`;
function trainSvg(){
  const doors=[140,400,660];
  return `<rect x="0" y="-140" width="900" height="132" rx="14" fill="#f2c400"/><rect x="0" y="-30" width="900" height="16" fill="#1f4aa0"/>
  <path d="M0 -126 Q0 -140 30 -140 H60 V-14 H0z" fill="#f2c400"/><rect x="6" y="-118" width="40" height="40" rx="8" fill="#1d2a3d"/>
  <rect x="8" y="-132" width="44" height="10" rx="2" fill="#111"/><text x="30" y="-124" text-anchor="middle" font-size="7" fill="#ffb02e" font-family="Arial,sans-serif">Utrecht Cs</text>
  ${[90,220,330,480,590,740,840].map(x=>`<rect x="${x}" y="-118" width="70" height="44" rx="6" fill="#1d2a3d"/>`).join("")}
  ${doors.map(x=>`<g transform="translate(${x} 0)"><rect x="0" y="-122" width="50" height="108" fill="#1f4aa0"/><g data-k="shut"><rect x="2" y="-120" width="22" height="104" fill="#e9b800"/><rect x="26" y="-120" width="22" height="104" fill="#e9b800"/><rect x="6" y="-110" width="14" height="36" rx="3" fill="#1d2a3d"/><rect x="30" y="-110" width="14" height="36" rx="3" fill="#1d2a3d"/></g><g data-k="open" style="display:none"><rect x="2" y="-120" width="46" height="104" fill="#2a3340"/></g></g>`).join("")}
  <rect x="395" y="-138" width="120" height="12" rx="2" fill="#111"/><text x="455" y="-129" text-anchor="middle" font-size="8" fill="#ffb02e" font-family="Arial,sans-serif">Sprinter Utrecht Centraal</text>
  <g fill="#222">${[40,120,780,860].map(x=>`<circle cx="${x}" cy="-6" r="9"/>`).join("")}</g>`;
}
const SUITCASE=`<rect x="-12" y="-40" width="24" height="38" rx="4" fill="#1c1c1c"/><path d="M-6 -40 V-62 H6 V-40" fill="none" stroke="#444" stroke-width="3"/><circle cx="-7" cy="-1" r="3" fill="#555"/><circle cx="7" cy="-1" r="3" fill="#555"/>`;
const off=(p,dx,dy)=>p.map(([t,x,y])=>[t,x+dx,y+dy]);
const PERRON_B=[[35,1010,470],[48,800,470],[112,800,470],[120,770,398],[128,770,398],[128.6,800,404],[136,800,404],[138,826,404],[142,826,404],[146,745,396],[149,745,350]];
const PLEIN_BG=`
<rect width="960" height="540" fill="#d7d2c8"/>
<rect x="0" y="0" width="430" height="262" fill="#b5654a"/><rect x="430" y="0" width="360" height="262" fill="#e3dccf"/><rect x="790" y="0" width="170" height="262" fill="#9a8a78"/>
<g fill="#5b6f7d">${[40,150,260].map(x=>`<rect x="${x}" y="40" width="80" height="60" rx="3"/>`).join("")}${[470,590,700].map(x=>`<rect x="${x}" y="40" width="70" height="60" rx="3"/>`).join("")}</g>
<rect x="30" y="130" width="380" height="34" fill="#f6efe0"/><text x="220" y="154" text-anchor="middle" font-size="19" font-weight="700" fill="#7a3b1f" font-family="Georgia,serif">Bakkerij Van Dijk</text>
<rect x="40" y="172" width="250" height="90" fill="#aac4d3"/><rect x="310" y="172" width="70" height="90" fill="#6b3a22"/>
<rect x="450" y="130" width="320" height="34" fill="#2f6f8f"/><text x="610" y="154" text-anchor="middle" font-size="18" font-weight="700" fill="#fff" font-family="Arial,sans-serif">Drogisterij</text>
<rect x="460" y="172" width="210" height="90" fill="#aac4d3"/><rect x="690" y="172" width="70" height="90" fill="#3a4a55"/>
<g transform="translate(875 150)"><rect x="-58" y="-16" width="116" height="32" rx="3" fill="#fff" stroke="#1f3e78" stroke-width="3"/><text y="7" text-anchor="middle" font-size="17" font-weight="700" fill="#1f3e78" font-family="Arial,sans-serif">Marktplein</text></g>
<rect y="262" width="960" height="278" fill="#cfc8bb"/>
<g stroke="#bfb7a8" stroke-width="2">${Array.from({length:8},(_,i)=>`<path d="M0 ${290+i*34} H960"/>`).join("")}${Array.from({length:16},(_,i)=>`<path d="M${i*64} 262 V540"/>`).join("")}</g>
<g transform="translate(905 330)"><rect x="-3" y="-60" width="6" height="60" fill="#666"/><rect x="-26" y="-112" width="52" height="56" rx="3" fill="#1f5fae"/><circle cx="0" cy="-99" r="5" fill="#fff"/><path d="M0 -93 v14 M-7 -86 h14 M0 -79 l-6 14 M0 -79 l6 14" stroke="#fff" stroke-width="3" stroke-linecap="round"/><rect x="-30" y="-56" width="60" height="16" fill="#fff" stroke="#333"/><text y="-44" text-anchor="middle" font-size="8" font-family="Arial,sans-serif" fill="#111">voetgangersgebied</text></g>
<g transform="translate(390 330)"><rect x="-3" y="-120" width="6" height="120" fill="#4a4f55"/><rect x="-14" y="-140" width="28" height="22" rx="4" fill="#4a4f55"/><rect x="-24" y="-96" width="48" height="40" rx="3" fill="#fff" stroke="#333"/><path d="M-14 -78 q4 -8 14 -6 l6 -6 l2 4 l-3 4 q2 6 -4 8 l0 5 m-12 -9 l-2 9 m6 -9 l0 9" fill="none" stroke="#111" stroke-width="2"/><text y="-60" text-anchor="middle" font-size="7" font-family="Arial,sans-serif" fill="#111">aan de lijn</text></g>
<g transform="translate(120 420)"><rect x="-55" y="-30" width="110" height="10" rx="3" fill="#6d4c33"/><rect x="-55" y="-50" width="110" height="8" rx="3" fill="#6d4c33"/><rect x="-48" y="-22" width="6" height="22" fill="#444"/><rect x="42" y="-22" width="6" height="22" fill="#444"/></g>
<g transform="translate(770 330)" stroke="#6d737a" stroke-width="4" fill="none">${[0,24,48,72].map(x=>`<path d="M${x} 0 v-26 q0 -12 12 -12 q12 0 12 12 v26"/>`).join("")}</g>
<g transform="translate(540 336)"><rect x="-50" y="-30" width="100" height="30" fill="#7c6a55"/><circle cx="-25" cy="-38" r="16" fill="#4f7a43"/><circle cx="5" cy="-42" r="18" fill="#5d8a4f"/><circle cx="30" cy="-36" r="14" fill="#4f7a43"/></g>
`;
const CONTAINER=`<rect x="-26" y="-96" width="52" height="96" rx="6" fill="#5f666d"/><rect x="-26" y="-96" width="52" height="16" rx="6" fill="#4b5157"/><g data-k="shut"><rect x="-16" y="-70" width="32" height="18" rx="3" fill="#2a2e33"/></g><g data-k="open" style="display:none"><rect x="-16" y="-70" width="32" height="18" rx="3" fill="#0e0f11"/><rect x="-16" y="-84" width="32" height="12" rx="2" fill="#2a2e33"/></g><text y="-30" text-anchor="middle" font-size="11" font-weight="700" fill="#e9ecef" font-family="Arial,sans-serif">REST</text>`;
const DOG=`<g class="dogb"><ellipse cx="0" cy="-22" rx="22" ry="10" fill="#8a5a2b"/><circle cx="22" cy="-32" r="9" fill="#8a5a2b"/><ellipse cx="29" cy="-29" rx="6" ry="4" fill="#7a4d24"/><circle cx="24" cy="-34" r="1.5" fill="#111"/><path d="M18 -40 l-3 -7 l7 4z" fill="#6e4520"/><path d="M-21 -24 q-10 -10 -6 -18" stroke="#8a5a2b" stroke-width="4" fill="none"/></g><g class="lg1"><rect x="-16" y="-15" width="5" height="15" fill="#7a4d24"/><rect x="12" y="-15" width="5" height="15" fill="#7a4d24"/></g><g class="lg2"><rect x="-8" y="-15" width="5" height="15" fill="#7a4d24"/><rect x="4" y="-15" width="5" height="15" fill="#7a4d24"/></g>`;
const BIKE=`<g fill="none" stroke="#111" stroke-width="3"><circle cx="-26" cy="-16" r="15"/><circle cx="28" cy="-16" r="15"/><path d="M-26 -16 L-4 -16 L14 -40 L-14 -40 Z M-4 -16 L-14 -46 M14 -40 L28 -16 M14 -40 L12 -50 h8"/></g>
  <path d="M-12 -48 L-2 -74 L8 -70 L2 -46z" fill="#16181b"/><rect x="-22" y="-82" width="16" height="24" rx="3" fill="#ef7d1a"/>
  <path d="M-6 -46 L6 -28 L10 -18 M-2 -46 L-6 -26 L-2 -18" stroke="#8b8f94" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M6 -72 L18 -56" stroke="#16181b" stroke-width="6" stroke-linecap="round"/>
  <circle cx="4" cy="-84" r="11" fill="${SKIN[2]}"/><path d="M-8 -84 Q-8 -98 4 -98 Q16 -98 16 -86 L10 -86 Q8 -92 2 -92 Q-4 -92 -4 -80z" fill="#16181b"/>
  <ellipse cx="4" cy="-2" rx="6" ry="3" fill="#f4f4f4"/>`;
const TROLLEY=`<rect x="-12" y="-46" width="24" height="40" rx="5" fill="#c4302b"/><path d="M-9 -46 L-14 -66 h8" fill="none" stroke="#333" stroke-width="3"/><circle cx="-7" cy="-4" r="4" fill="#222"/><circle cx="7" cy="-4" r="4" fill="#222"/>`;
const PLEIN_C=[[0,1010,450],[5,1010,450],[25,620,450],[126,620,450],[126.6,650,445],[140,650,445],[143,690,462],[147,690,462],[150,672,455],[156,672,455],[160,420,450],[170,420,450],[172,420,450],[188,1010,450]];
// ===== varianten: elk examen krijgt een eigen film (seed) =====
function rng(seed){let a=(seed>>>0)||1;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const pickR=(r,arr)=>arr[Math.floor(r()*arr.length)];
const pickNot=(r,arr,ex)=>{const a=arr.filter(x=>!ex.includes(x));return pickR(r,a.length?a:arr)};
const COL={
  rood:{adj:"rode",hex:"#c0392b",re:"rood|rode"},blauw:{adj:"blauwe",hex:"#2456a6",re:"blauw|blauwe|donkerblauw|donkerblauwe|lichtblauw|lichtblauwe"},
  groen:{adj:"groene",hex:"#2f7d4f",re:"groen|groene|donkergroen|donkergroene"},geel:{adj:"gele",hex:"#e5b81a",re:"geel|gele"},
  zwart:{adj:"zwarte",hex:"#1f2023",re:"zwart|zwarte"},wit:{adj:"witte",hex:"#f1f1f1",re:"wit|witte"},grijs:{adj:"grijze",hex:"#868c93",re:"grijs|grijze|lichtgrijs|lichtgrijze|donkergrijs|donkergrijze"},
  oranje:{adj:"oranje",hex:"#ef7d1a",re:"oranje"},paars:{adj:"paarse",hex:"#6b3f8f",re:"paars|paarse"},beige:{adj:"beige",hex:"#c8a77a",re:"beige|lichtbruin|lichtbruine|zandkleurig|zandkleurige|camel|bruin|bruine"},
  bruin:{adj:"bruine",hex:"#6b4a2b",re:"bruin|bruine|donkerbruin|donkerbruine"},roze:{adj:"roze",hex:"#e58fb0",re:"roze"}
};
const HAIR={blond:{t:"blond",hex:"#e2c271",re:"blond|blonde"},bruin:{t:"bruin",hex:"#5a3a22",re:"bruin|bruine|donkerbruin|donker"},zwart:{t:"zwart",hex:"#1d1d1d",re:"zwart|zwarte|donker"},rood:{t:"rood",hex:"#b5532a",re:"rood|rode|ros|rossig"},grijs:{t:"grijs",hex:"#a9a9a9",re:"grijs|grijze"},wit:{t:"wit",hex:"#f3f3f3",re:"wit|witte"}};
const MAANDRE=["jan","feb","maart|mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
const JASW="(lange |korte |dikke |dunne )?(jas|jack|jasje|mantel|winterjas|regenjas|jas met|parka|trenchcoat|windjack)";
const cre=c=>COL[c].re;
function wvWhen(r){const base=new Date(2026,10,2).getTime();const d=new Date(base+Math.floor(r()*240)*86400000);const h=7+Math.floor(r()*13),m=Math.floor(r()*55);
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(h)}:${pad2(m)}:00`}
function hm(iso,addMin){const d=new Date(new Date(iso).getTime()+(addMin||0)*60000);return pad2(d.getHours())+":"+pad2(d.getMinutes())}
function dateKey(iso){const d=new Date(iso);const dd=d.getDate(),mm=d.getMonth();return {t:`Datum: ${d.toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"})}`,re:new RegExp(`\\b0?${dd}[-\\s/.]*(0?${mm+1}\\b|${MAANDRE[mm]})`)}}
function timeKey(iso){const a=hm(iso),b=hm(iso,1);const f=s=>s.replace(/^0/,"0?").replace(":","[:.]");return {t:`Begintijd rond ${a} uur`,re:new RegExp(`\\b(${f(a)}|${f(b)})\\b`)}}
function timeWrong(iso,dur,label){const h0=new Date(iso).getHours(),h1=new Date(new Date(iso).getTime()+(dur+60)*1000).getHours();const ok=new Set([h0,h1,h0%12,h1%12]);
  return {t:`Tijd valt buiten de film (${hm(iso)} tot ${hm(iso,Math.ceil(dur/60))})`,f:s=>[...s.matchAll(/\b(\d{1,2})[:.](\d{2})\s?(uur|u\b)/g)].some(m=>!ok.has(+m[1]))}}
function jasWrong(worn,label){const allowed=new Set(worn);if(worn.includes("beige")||worn.includes("bruin")){allowed.add("beige");allowed.add("bruin")}
  const bad=Object.keys(COL).filter(c=>!allowed.has(c)).map(c=>COL[c].adj).filter(a=>!worn.some(w=>COL[w].adj===a));
  return {t:`Jaskleur die niemand droeg (${label})`,f:s=>new RegExp(`\\b(${bad.join("|")}) (lange |korte )?(jas|jack|jasje|mantel|winterjas)\\b`).test(s)}}
const STATIONS=["Amersfoort Centraal","Utrecht Centraal","Zwolle","Leiden Centraal","Arnhem Centraal","Deventer","Haarlem","Breda","Groningen","Eindhoven Centraal","Almere Centrum","Den Bosch"];
const stRe=s=>s.split(" ")[0].toLowerCase().replace("den bosch","den bosch");

// ---------- perron ----------
const PERRON_DEF={start:"2026-11-14T14:31:00",station:"Amersfoort Centraal",spoor:"5a",dest:"Utrecht Centraal",cam:"CAM 05",
  A:{jas:"rood",pet:"zwart",broek:"spijker",schoen:"wit",pack:"grijs",skin:1},W:{hair:"blond",style:"pony",jas:"groen",sjaal:"grijs",bag:"zwart",skin:0},
  B:{hair:"kaal",jas:"beige",koffer:"zwart",skin:0},lighter:"blauw",l:[0,0,0,0],pal:0};
const BROEK={spijker:{t:"blauwe spijkerbroek",hex:"#3b5b8c",re:"(spijkerbroek|jeans|blauwe broek)"},zwart:{t:"zwarte broek",hex:"#1d1d1f",re:"zwarte? (broek|jeans|spijkerbroek|pantalon)"},jogging:{t:"grijze joggingbroek",hex:"#8a9097",re:"(joggingbroek|trainingsbroek|grijze broek)"}};
const L_W=[["Meneer, u mag hier niet roken.","niet roken"],["Meneer, roken is hier verboden.","verboden"],["Wilt u uw sigaret uitmaken? Hier mag niet gerookt worden.","(uitmaken|niet gerookt)"]];
const L_A=[["Bemoei je met je eigen zaken.","eigen zaken"],["Dat gaat jou niks aan.","gaat (jou|je|u) (niks|niets) aan"],["Ga lekker ergens anders staan.","ergens anders"]];
const L_PUSH=[["Aan de kant!","aan de kant"],["Opzij!","opzij"],["Uit de weg!","uit de weg"]];
const L_B=[["Hé, kijk uit, man!","kijk uit"],["Hé, rustig aan!","rustig aan"],["Au! Doe normaal!","doe (eens |even )?normaal"]];
const PERRON_PAL=[["#c9d1da","#8e969e","#b9bec4"],["#d3d0c9","#968f86","#c2bdb4"],["#cdd6d2","#88958f","#b6c0bb"]];
function perronParams(seed){
  if(!seed)return PERRON_DEF;const r=rng(seed);
  const station=pickR(r,STATIONS);const dest=pickNot(r,STATIONS,[station]);
  const Aj=pickR(r,["rood","blauw","geel","groen","oranje","zwart","paars","wit"]);const Wj=pickNot(r,["groen","rood","blauw","paars","beige","geel","roze","grijs"],[Aj]);const Bj=pickNot(r,["beige","grijs","zwart","blauw","bruin","groen"],[Aj,Wj]);
  return {start:wvWhen(r),station,dest,spoor:pickR(r,["2","3b","4a","5a","7","8","11","14"]),cam:"CAM "+pad2(1+Math.floor(r()*20)),
    A:{jas:Aj,pet:pickNot(r,["zwart","wit","rood","blauw","grijs","groen"],[Aj]),broek:pickR(r,Object.keys(BROEK)),schoen:pickR(r,["wit","zwart","rood"]),pack:pickNot(r,["grijs","zwart","groen","rood","blauw"],[Aj]),skin:Math.floor(r()*4)},
    W:{hair:pickR(r,["blond","bruin","zwart","rood"]),style:pickR(r,["pony","short"]),jas:Wj,sjaal:pickNot(r,["grijs","rood","wit","geel","blauw","zwart"],[Wj]),bag:pickR(r,["zwart","bruin","rood"]),skin:Math.floor(r()*4)},
    B:{hair:pickR(r,["kaal","grijs","zwart"]),jas:Bj,koffer:pickR(r,["zwart","rood","blauw","grijs"]),skin:Math.floor(r()*4)},
    lighter:pickR(r,["blauw","rood","groen","geel"]),l:[0,0,0,0].map(()=>Math.floor(r()*3)),pal:Math.floor(r()*3)};
}
function buildPerron(seed){
  const P=perronParams(seed);const pal=PERRON_PAL[P.pal];const shortDest=P.dest.split(" ")[0];
  const bg=PERRON_BG.replace('fill="#c9d1da"',`fill="${pal[0]}"`).replace('height="145" fill="#8e969e"',`height="145" fill="${pal[1]}"`).replace('height="205" fill="#b9bec4"',`height="205" fill="${pal[2]}"`)
    .replace(">Amersfoort Centraal<",">"+esc(P.station)+"<").replace(">5a</text>",">"+esc(P.spoor)+"</text>").replace(">spoor 5a<",">spoor "+esc(P.spoor)+"<").replace(">Utrecht Centraal</text>",">"+esc(P.dest)+"</text>").replace(">14:34  Sprinter<",">"+hm(P.start,3)+"  Sprinter<");
  const A=P.A,Wp=P.W,B=P.B;const lw=L_W[P.l[0]],la=L_A[P.l[1]],lp=L_PUSH[P.l[2]],lb=L_B[P.l[3]];
  const sp=P.spoor.replace(/^(\d+)([a-z]?)$/,(m,n,l)=>l?`${n}\\s?${l}`:`${n}\\b`);
  const kofferHex=COL[B.koffer].hex;
  return {
    id:"perron",seed,titel:`Perron spoor ${P.spoor} · ${P.station}`,kort:"Openbaar vervoer · station",dom:"4",dur:200,cam:P.cam,start:P.start,
    brief:SC_BRIEF.perron,bg,
    actors:{
      train:{draw:trainSvg().replace(/>Utrecht Cs</,">"+esc(shortDest)+" Cs<").replace(">Sprinter Utrecht Centraal<",">Sprinter "+esc(P.dest)+"<"),z:330,scale:1,path:[[0,1300,330],[96,1300,330],[112,300,330],[118,60,330],[155,60,330],[162,-40,330],[176,-1100,330]],st:[[0,{open:0,shut:1}],[122,{open:1,shut:0}],[152,{open:0,shut:1}]]},
      pole:{draw:POLE,path:[[0,655,425]],st:[[0,{idle:1,ok:0}],[111,{idle:0,ok:1}],[112.6,{idle:1,ok:0}]]},
      W1:{name:"vrouw",voice:"f",draw:person({skin:SKIN[Wp.skin],hair:HAIR[Wp.hair].hex,hairStyle:Wp.style==="pony"?"pony":"short",coat:COL[Wp.jas].hex,coatLong:1,pants:"#1d1d1d",shoes:"#6b4423",scarf:COL[Wp.sjaal].hex,bag:COL[Wp.bag].hex,hand:`<rect data-k="phone" x="21" y="-84" width="7" height="11" rx="1.5" fill="#222"/>`}),
        path:[[0,170,440],[55,170,440],[62,330,440],[75,330,440],[82,190,440],[100,190,440],[110,630,425],[111.8,630,425],[118,485,410],[123,485,410],[126,485,350]],st:[[0,{phone:1}],[100,{phone:0}],[126,{hide:1}]]},
      A:{name:"man",voice:"m",draw:person({skin:SKIN[A.skin],hairStyle:"",cap:COL[A.pet].hex,beard:"#2a1d14",coat:COL[A.jas].hex,pants:BROEK[A.broek].hex,shoes:COL[A.schoen].hex,pack:COL[A.pack].hex,zip:"rgba(0,0,0,.35)",
          hand:`<g data-k="cig" style="display:none"><rect x="24" y="-81" width="16" height="3.4" rx="1" fill="#fafafa"/><rect x="24" y="-81" width="5" height="3.4" fill="#e0a85a"/><circle cx="41" cy="-79.3" r="2.6" fill="#ff5a12"/></g><g data-k="flame" style="display:none"><rect x="20" y="-74" width="6" height="9" rx="1" fill="${COL[P.lighter].hex}"/><path d="M23 -75 q-3 -6 0 -10 q3 4 0 10z" fill="#ffb02e"/></g>`+SMOKE}),
        path:[[0,-60,455],[8,-60,455],[20,420,455],[121,420,455],[126.5,700,412],[128,742,398],[131,742,398],[133,745,350]],st:[[0,{}],[24,{cig:1}],[27,{flame:1}],[29,{flame:0,smoke:1}],[86,{cig:0,smoke:0}],[133,{hide:1}]]},
      B:{name:"man met koffer",voice:"m2",draw:person({skin:SKIN[B.skin],hairStyle:B.hair==="kaal"?"bald":"short",hair:B.hair==="kaal"?"":HAIR[B.hair].hex,glasses:1,coat:COL[B.jas].hex,coatLong:1,pants:"#3d4148",shoes:"#111"}),
        path:PERRON_B,st:[[0,{}],[128.6,{rot:-9}],[130,{rot:0}],[149,{hide:1}]]},
      koffer:{draw:SUITCASE.replace('fill="#1c1c1c"',`fill="${kofferHex}"`),path:[...off(PERRON_B.slice(0,6),30,0),[136,845,410],[138,845,410],[140,856,404],[142,856,404],[146,775,396],[149,775,350]],st:[[0,{}],[128.6,{rot:88}],[140,{rot:0}],[149,{hide:1}]]},
      peuk:{draw:`<rect x="-7" y="-2" width="12" height="4" rx="1" fill="#f6efe2"/><circle cx="6" cy="0" r="3.2" fill="#ff5a12"/>`,scale:1,path:[[0,440,385],[86,440,385],[87.2,452,322]],st:[[0,{hide:1}],[86,{hide:0}]]},
      aansteker:{draw:`<rect x="-8" y="-5" width="16" height="9" rx="2" fill="${COL[P.lighter].hex}"/><rect x="-8" y="-7" width="6" height="3" fill="#9aa3ab"/>`,scale:1,path:[[0,722,420]],st:[[0,{hide:1}],[129,{hide:0}]]}
    },
    speech:[[63,67.5,"W1",lw[0]],[68.5,72,"A",la[0]],[127.6,129.6,"A",lp[0]],[129.9,132.8,"B",lb[0]]],
    sounds:[[111,"beep"],[122,"door"],[152,"door"]],
    frame(t,svg){
      const d=new Date(new Date(this.start).getTime()+t*1000);const m=d.getMinutes()+d.getSeconds()/60,h=(d.getHours()%12)+m/60;
      svg.querySelector("#fMin").setAttribute("transform",`rotate(${m*6})`);svg.querySelector("#fHour").setAttribute("transform",`rotate(${h*30})`);
      const b1=svg.querySelector("#fBoard1");const txt=(t<176?hm(this.start,3):hm(this.start,15))+"  Sprinter";if(b1.textContent!==txt)b1.textContent=txt;
    },
    key:{
      aanv:[
        {p:3,...(k=>({t:k.t,m:[k.re]}))(dateKey(P.start))},
        {p:3,...(k=>({t:k.t,m:[k.re]}))(timeKey(P.start))},
        {p:3,t:`Station ${P.station}`,m:[new RegExp(stRe(P.station))]},
        {p:3,t:`Perron spoor ${P.spoor}`,m:[new RegExp(`\\b${sp}`)]},
        {p:1,t:"Bord rookvrij / rookverbod",m:[/(rookvrij|rookverbod|niet roken|verbodsbord)/,/(bord|sticker|pictogram|aangeduid|aangegeven|zag)/]},
        {p:1,t:"Incheckpaal op het perron",m:[/(incheckpaal|paal|check ?in ?paal|kaartlezer)/]},
        {p:1,t:`Vertrekbord: ${hm(P.start,3)} Sprinter naar ${P.dest}`,m:[new RegExp(`(${hm(P.start,3).replace(":","[:.]")}|sprinter|vertrekbord)`)]}
      ],
      gebeur:[
        {id:"g1",p:1,t:`Een man in een ${COL[A.jas].adj} jas loopt het perron op`,m:[/\bman\b/,/(liep|kwam|verscheen|betrad|wandelde)/]},
        {id:"g2",p:3,t:"De man steekt een sigaret op en rookt",m:[/(sigaret|peuk|rook)/,/(aanstak|stak .*aan|opstak|stak .*op|rookte|roken|aansteker|aangestoken)/]},
        {id:"g3",p:3,t:`De vrouw zegt: '${lw[0]}'`,m:[new RegExp(lw[1]+"|niet roken|roken"),/(zei|zeggen|zegt|sprak|hoorde|riep|vroeg|aangesproken|sprak .* aan)/]},
        {id:"g4",p:2,t:`De man antwoordt: '${la[0]}'`,m:[new RegExp(la[1])]},
        {id:"g5",p:3,t:"De man gooit de brandende sigaret op het spoor",m:[/(sigaret|peuk)/,/(spoor|rails|baan|sporen)/,/(gooi|gooide|wierp|schoot|liet .*vallen|smeet|flikkerde)/]},
        {id:"g6",p:2,t:"Een gele trein (Sprinter) komt binnen en stopt",m:[/trein|sprinter/,/(kwam|stopte|arriveerde|binnen|stil|aan(ge)?kwam|reed .*perron)/]},
        {id:"g7",p:1,t:"De vrouw checkt in bij de paal",m:[/(incheck|checkte|check .*in|paal|kaartlezer)/,/vrouw/]},
        {id:"g8",p:3,t:"De man loopt langs de paal zonder in te checken",m:[/(zonder (in te checken|inchecken|te checken)|niet (in)?(ge)?check|checkte (niet|hij niet)|geen .*check|liep .*(langs|voorbij) .*paal)/]},
        {id:"g9",p:3,t:"De man duwt de man met de koffer opzij",m:[/(duw|duwde|stootte|botste|opzij|aan de kant|uit de weg)/]},
        {id:"g10",p:1,t:"De koffer valt om",m:[/koffer/,/(viel|valt|om|omver|kantelde|vallen)/]},
        {id:"g11",p:1,t:`Je hoort '${lp[0]}' en '${lb[0]}'`,m:[new RegExp(`(${lp[1]}|${lb[1]})`)]},
        {id:"g12",p:1,t:"De man verliest een aansteker op het perron",m:[/aansteker/,/(viel|vallen|lag|ligt|liet|verloor|achter)/]},
        {id:"g13",p:1,t:"De trein vertrekt; de aansteker blijft liggen",m:[/trein/,/(vertrok|reed weg|reed .*weg|vertrekt|wegreed|vertrekken)/]}
      ],
      spec:[
        {p:2,t:`Man 1: ${COL[A.jas].adj} jas`,m:[new RegExp(`\\b(${cre(A.jas)}) ${JASW}`)]},
        {p:2,t:`Man 1: ${COL[A.pet].adj} pet`,m:[new RegExp(`\\b(${cre(A.pet)}) (pet|cap|honkbalpet)`)]},
        {p:1,t:"Man 1: donkere baard",m:[/baard/]},
        {p:1,t:`Man 1: ${COL[A.pack].adj} rugzak`,m:[new RegExp(`(${cre(A.pack)}) rugzak|rugzak .*(${cre(A.pack)})`)]},
        {p:1,t:`Man 1: ${BROEK[A.broek].t}`,m:[new RegExp(BROEK[A.broek].re)]},
        {p:1,t:`Man 1: ${COL[A.schoen].adj} schoenen`,m:[new RegExp(`(${cre(A.schoen)}) (schoenen|sneakers|gympen|sportschoenen|patta)`)]},
        {p:1.5,t:`Vrouw: ${COL[Wp.jas].adj} lange jas`,m:[new RegExp(`\\b(${cre(Wp.jas)}) ${JASW}`)]},
        {p:1,t:`Vrouw: ${HAIR[Wp.hair].t} haar`,m:[new RegExp(`(${HAIR[Wp.hair].re})`)]},
        {p:0.5,t:Wp.style==="pony"?"Vrouw: paardenstaart":"Vrouw: kort haar",m:[Wp.style==="pony"?/(paardenstaart|staart)/:/kort (haar|kapsel)|kortharig/]},
        {p:1,t:`Vrouw: ${COL[Wp.sjaal].adj} sjaal`,m:[new RegExp(`(${cre(Wp.sjaal)}) sjaal|sjaal .*(${cre(Wp.sjaal)})`)]},
        {p:0.5,t:`Vrouw: ${COL[Wp.bag].adj} handtas`,m:[/(handtas|tas)/]},
        {p:1,t:B.hair==="kaal"?"Man 2: kaal":`Man 2: kort ${HAIR[B.hair].t} haar`,m:[B.hair==="kaal"?/(kaal|kale|geen haar)/:new RegExp(`(${HAIR[B.hair].re}) (kort )?haar|kort (${HAIR[B.hair].re}) haar`)]},
        {p:1,t:"Man 2: bril",m:[/bril/]},
        {p:1,t:`Man 2: ${COL[B.jas].adj} lange jas`,m:[new RegExp(`(${cre(B.jas)}) ${JASW}`)]},
        {p:1,t:`Man 2: ${COL[B.koffer].adj} rolkoffer`,m:[/(rolkoffer|koffer|trolley)/]},
        {p:1,t:"Trein: geel met blauw",m:[/(gele|geel) (trein|sprinter)|trein .*geel/]},
        {p:1,t:`Trein: bestemming ${P.dest}`,m:[new RegExp(stRe(P.dest))]},
        {p:1.5,t:`Aansteker: ${COL[P.lighter].adj.replace(/e$/,"")}`,m:[new RegExp(`(${cre(P.lighter)}) aansteker|aansteker .*(${cre(P.lighter)})`)]}
      ],
      order:["g1","g2","g3","g4","g5","g6","g7","g8","g9","g10","g12","g13"],
      wrong:[
        {t:`Verkeerd spoor genoemd (het was spoor ${P.spoor})`,f:s=>[...s.matchAll(/spoor\s*(\d+)/g)].some(m=>m[1]!==P.spoor.replace(/[a-z]/g,""))},
        timeWrong(P.start,200),
        jasWrong([A.jas,Wp.jas,B.jas],[A.jas,Wp.jas,B.jas].map(c=>COL[c].adj.replace(/e$/,"")).join(", ")+" waren de jassen"),
        {t:`Pet had een andere kleur (${COL[A.pet].adj.replace(/e$/,"")})`,f:s=>new RegExp(`\\b(${Object.keys(COL).filter(c=>c!==A.pet).map(c=>COL[c].adj).join("|")}) pet\\b`).test(s)},
        {t:"Sigaret ging op het spoor, niet op het perron of de grond",f:s=>s.split(/[.!?\n]/).some(z=>/(sigaret|peuk)/.test(z)&&/(op de grond|op het perron|op de vloer|in de prullenbak|uitgetrapt)/.test(z))},
        {t:"De vrouw rookte niet",f:s=>s.split(/[.!?\n]/).some(z=>/vrouw/.test(z)&&/\b(rookte|rookt|stak .*sigaret)/.test(z)&&!/(man|niet)/.test(z))},
        {t:`Station of bestemming klopt niet (${P.station}, trein naar ${P.dest})`,f:s=>STATIONS.filter(x=>x!==P.station&&x!==P.dest).some(x=>new RegExp("\\b"+stRe(x)+"\\b").test(s))}
      ]
    }
  };
}

// ---------- plein ----------
const PLEINEN=["Marktplein","Kerkplein","Raadhuisplein","Grote Markt","Brink","Stadhuisplein","Molenplein"];
const WINKEL1=["Bakkerij Van Dijk","Bakkerij De Korenaar","Banketbakkerij Smit","Bakkerij Jansen"];
const WINKEL2=["Drogisterij","Boekhandel","Bloemenwinkel","Schoenmakerij","Opticien"];
const DOGS={bruin:{t:"bruine",hex:"#8a5a2b",dk:"#7a4d24",re:"bruin|bruine"},zwart:{t:"zwarte",hex:"#2a2a2a",dk:"#1a1a1a",re:"zwart|zwarte"},grijs:{t:"grijze",hex:"#8d8f93",dk:"#6d6f73",re:"grijs|grijze"},wit:{t:"witte",hex:"#ece8e0",dk:"#cfc9be",re:"wit|witte"},blond:{t:"blonde",hex:"#d8b56c",dk:"#c39c50",re:"blond|blonde|lichtbruin|geel|gele"}};
const HONDNAAM=["Fikkie","Max","Bobby","Luna","Rocky","Bella"];
const FRUIT={sinaasappels:{t:"sinaasappels",hex:"#f08a1c",re:"sinaasappel"},appels:{t:"appels",hex:"#c0392b",re:"appel"},citroenen:{t:"citroenen",hex:"#f2d43a",re:"citroen"},mandarijnen:{t:"mandarijnen",hex:"#f39c33",re:"mandarijn"}};
const PLEIN_DEF={start:"2026-11-21T10:12:00",plein:"Marktplein",w1:"Bakkerij Van Dijk",w2:"Drogisterij",cam:"CAM 02",
  D:{hair:"wit",pet:"groen",vest:"blauw",broek:"bruin",riem:"rood",skin:0},dog:"bruin",naam:"Fikkie",C:{hair:"grijs",jas:"paars",kar:"rood",skin:0},
  E:{hoodie:"zwart",broek:"grijs",pack:"oranje",fiets:"zwart",skin:2},zak:"zwart",fruit:"sinaasappels",l:[0,0,0,0,0,0,0],pal:0};
const L_VOL=["Hij zit weer vol.","Zit weer helemaal vol, ja.","Nou, die is ook vol."];
const L_LIJN=["Meneer, kunt u uw hond aan de lijn doen?","Wilt u uw hond aanlijnen? Dat staat op het bord.","Meneer, uw hond moet hier aan de lijn."];
const L_NIKS=[["Ach, hij doet niks, hoor.","doet (niks|niets)"],["Hij is heel lief, hoor.","lief"],["Rustig maar, hij bijt niet.","bijt niet"]];
const L_UIT=[["Kun je niet uitkijken?!","uitkijken"],["Hé, pas op!","pas op"],["Ho, kijk uit!","kijk uit"]];
const L_SORRY=[["Sorry, ik heb haast!","haast"],["Sorry, mevrouw!","sorry"],["Ik moet door, sorry!","moet door|sorry"]];
const L_ZAK=["Laat u die vuilniszak daar gewoon staan?","U mag die zak daar niet neerzetten, hoor.","Hoort die zak daar wel?"];
const L_ANTW=["Die container zit toch altijd vol.","Daar gaat de gemeente over.","Die halen ze morgen wel op."];
const PLEIN_PAL=[["#b5654a","#e3dccf","#9a8a78"],["#8c5a3c","#d9d4c7","#7d8b94"],["#a34a3c","#e8e1d0","#8a7f6f"],["#6f7e8a","#e6dccb","#a7745a"]];
function pleinParams(seed){
  if(!seed)return PLEIN_DEF;const r=rng(seed+101);
  const Dv=pickR(r,["blauw","groen","zwart","rood","grijs"]);const Cj=pickNot(r,["paars","rood","groen","blauw","beige","geel","roze"],[Dv]);
  return {start:wvWhen(r),plein:pickR(r,PLEINEN),w1:pickR(r,WINKEL1),w2:pickR(r,WINKEL2),cam:"CAM "+pad2(1+Math.floor(r()*20)),
    D:{hair:pickR(r,["wit","grijs"]),pet:pickNot(r,["groen","rood","blauw","zwart","grijs","beige"],[Dv]),vest:Dv,broek:pickR(r,["bruin","zwart","blauw","beige"]),riem:pickR(r,["rood","blauw","groen","zwart"]),skin:Math.floor(r()*4)},
    dog:pickR(r,Object.keys(DOGS)),naam:pickR(r,HONDNAAM),
    C:{hair:pickR(r,["grijs","wit","bruin","zwart","rood"]),jas:Cj,kar:pickNot(r,["rood","blauw","groen","zwart","paars"],[Cj]),skin:Math.floor(r()*4)},
    E:{hoodie:pickR(r,["zwart","grijs","blauw","groen","rood"]),broek:pickR(r,["grijs","zwart","blauw"]),pack:pickR(r,["oranje","groen","blauw","geel","roze"]),fiets:pickR(r,["zwart","blauw","rood","wit"]),skin:Math.floor(r()*4)},
    zak:pickR(r,["zwart","grijs","blauw"]),fruit:pickR(r,Object.keys(FRUIT)),l:[0,0,0,0,0,0,0].map(()=>Math.floor(r()*3)),pal:Math.floor(r()*4)};
}
function buildPlein(seed){
  const Q=pleinParams(seed);const pal=PLEIN_PAL[Q.pal];const D=Q.D,C=Q.C,E=Q.E,dog=DOGS[Q.dog],fr=FRUIT[Q.fruit];
  const bg=PLEIN_BG.replace('width="430" height="262" fill="#b5654a"',`width="430" height="262" fill="${pal[0]}"`).replace('width="360" height="262" fill="#e3dccf"',`width="360" height="262" fill="${pal[1]}"`).replace('width="170" height="262" fill="#9a8a78"',`width="170" height="262" fill="${pal[2]}"`)
    .replace(">Bakkerij Van Dijk<",">"+esc(Q.w1)+"<").replace(">Drogisterij<",">"+esc(Q.w2)+"<").replace(">Marktplein<",">"+esc(Q.plein)+"<").replace('<rect x="-58" y="-16" width="116"',`<rect x="${-Math.max(58,Q.plein.length*5.6+12)}" y="-16" width="${Math.max(116,Q.plein.length*11.2+24)}"`);
  const lniks=L_NIKS[Q.l[2]],luit=L_UIT[Q.l[3]],lsorry=L_SORRY[Q.l[4]];
  const PC=PLEIN_C;
  const dogSvg=DOG.replace(/#8a5a2b/g,dog.hex).replace(/#7a4d24/g,dog.dk).replace(/#6e4520/g,dog.dk);
  const bikeSvg=BIKE.replace('stroke="#111" stroke-width="3"',`stroke="${COL[E.fiets].hex==="#f1f1f1"?"#d9d9d9":COL[E.fiets].hex}" stroke-width="3"`).replace(/#16181b/g,COL[E.hoodie].hex).replace('fill="#ef7d1a"',`fill="${COL[E.pack].hex}"`).replace('stroke="#8b8f94"',`stroke="${COL[E.broek].hex}"`).replace(`fill="${SKIN[2]}"`,`fill="${SKIN[E.skin]}"`);
  const fruitSvg=`<circle cx="0" cy="-7" r="7.5" fill="${fr.hex}"/><circle cx="1.5" cy="-13" r="1.8" fill="#3c7a2a"/>`;
  return {
    id:"plein",seed,titel:Q.plein,kort:"Openbare ruimte · winkelgebied",dom:"1",dur:192,cam:Q.cam,start:Q.start,
    brief:SC_BRIEF.plein,bg,
    actors:{
      container:{draw:CONTAINER,path:[[0,230,415]],st:[[0,{open:0,shut:1}],[40,{open:1,shut:0}],[54,{open:0,shut:1}]]},
      zak:{draw:`<path d="M-16 0 Q-20 -24 -6 -30 L-2 -38 L4 -38 L6 -30 Q20 -24 16 0z" fill="${COL[Q.zak].hex}"/>`,path:[[0,262,452]],st:[[0,{hide:1}],[52,{hide:0}]]},
      C:{name:"vrouw",voice:"f2",draw:person({skin:SKIN[C.skin],hair:HAIR[C.hair].hex,hairStyle:"curly",coat:COL[C.jas].hex,coatLong:1,pants:"#1d1d1d",shoes:"#222"}),path:PC,st:[[0,{}],[126.6,{rot:-5}],[127.6,{rot:0}],[188,{hide:1}]]},
      kar:{draw:TROLLEY.replace('fill="#c4302b"',`fill="${COL[C.kar].hex}"`),path:[...off(PC.slice(0,4),-30,4),[126.6,690,462],[150,690,462],[156,642,459],[160,390,454],[172,390,454],[188,980,454]],st:[[0,{}],[126.6,{rot:-86}],[150,{rot:0}],[188,{hide:1}]]},
      D:{name:"man met hond",voice:"m3",draw:person({skin:SKIN[D.skin],hair:HAIR[D.hair].hex,hairStyle:"white",cap:COL[D.pet].hex,coat:"#a9adb3",vest:COL[D.vest].hex,pants:COL[D.broek].hex,shoes:"#111",
          hand:`<g data-k="bag"><path d="M18 -74 Q14 -50 26 -44 Q38 -50 32 -74 L28 -80 L22 -80z" fill="${COL[Q.zak].hex}"/></g>`,extra:`<g transform="translate(-24 -74)"><circle r="4" fill="none" stroke="${COL[D.riem].hex}" stroke-width="3"/></g>`}),
        path:[[0,-60,455],[15,-60,455],[32,288,452],[58,288,452],[66,95,470],[170,95,470],[182,-80,470]],st:[[0,{bag:1}],[52,{bag:0}],[182,{hide:1}]]},
      hond:{draw:dogSvg,face:"auto",path:[[0,-90,470],[14,-90,470],[31,330,476],[40,380,490],[48,300,500],[56,330,470],[66,205,482],[80,262,500],[92,182,495],[100,182,495],[103.5,585,470],[114.5,585,470],[120,150,494],[140,205,502],[160,165,494],[170,165,494],[182,-70,490]],st:[[0,{}],[182,{hide:1}]]},
      E:{name:"fietser",voice:"m4",draw:bikeSvg,face:"auto",path:[[0,-120,494],[121,-120,494],[125.6,560,494],[127.5,742,497],[133.2,742,497],[137,1100,497]],st:[[0,{}],[137,{hide:1}]]},
      o1:{draw:fruitSvg,scale:1,path:[[0,690,458],[126.6,690,458],[128.6,724,472],[144,724,472]],st:[[0,{hide:1}],[126.6,{hide:0}],[144.5,{hide:1}]]},
      o2:{draw:fruitSvg,scale:1,path:[[0,690,458],[126.6,690,458],[128.8,700,494],[148,700,494]],st:[[0,{hide:1}],[126.6,{hide:0}],[148.5,{hide:1}]]},
      o3:{draw:fruitSvg,scale:1,path:[[0,690,458],[126.6,690,458],[129.4,778,506]],st:[[0,{hide:1}],[126.6,{hide:0}]]}
    },
    speech:[[47.5,50.5,"D",L_VOL[Q.l[0]]],[104,106,"hond","Woef! Woef!"],[106.5,110.5,"C",L_LIJN[Q.l[1]]],[111,114,"D",lniks[0]],[115,117,"D",`${Q.naam}, kom hier!`],[127.8,130.3,"C",luit[0]],[130.6,133,"E",lsorry[0]],[160.5,164,"C",L_ZAK[Q.l[5]]],[164.5,168,"D",L_ANTW[Q.l[6]]]],
    sounds:[[104,"bark"],[126.4,"bell"]],
    frame(){},
    key:{
      aanv:[
        {p:3,...(k=>({t:k.t,m:[k.re]}))(dateKey(Q.start))},
        {p:3,...(k=>({t:k.t,m:[k.re]}))(timeKey(Q.start))},
        {p:3,t:`Locatie: ${Q.plein}`,m:[new RegExp(wvNorm(Q.plein))]},
        {p:2,t:"Bord voetgangersgebied",m:[/voetganger/]},
        {p:2,t:"Bord honden aan de lijn",m:[/(bord|aangeduid|aangegeven|pictogram|verplicht|gebod)/,/(aan de lijn|aanlijn|hond)/]},
        {p:1,t:"Ondergrondse afvalcontainer (rest)",m:[/container/]},
        {p:1,t:`Winkels: ${Q.w1} en ${Q.w2.toLowerCase()}`,m:[new RegExp(`(${wvNorm(Q.w1.split(" ")[0]).replace(/ij$/,"")}|${wvNorm(Q.w2).slice(0,6)}|bakker|winkel)`)]}
      ],
      gebeur:[
        {id:"g1",p:1,t:`Een vrouw met een ${COL[C.kar].adj} boodschappentrolley komt het plein op`,m:[/vrouw/,/(liep|kwam|wandelde|trolley|boodschappen)/]},
        {id:"g2",p:2,t:"Een man komt aanlopen met een loslopende hond",m:[/hond/,/(los|niet aangelijnd|zonder (riem|lijn)|niet aan de lijn|losliep|loslopende)/]},
        {id:"g3",p:2,t:"De man opent de klep van de container",m:[/(container|klep)/,/(open|klep|deed|trok)/]},
        {id:"g4",p:2,t:`Je hoort: '${L_VOL[Q.l[0]]}'`,m:[/\bvol\b/]},
        {id:"g5",p:4,t:"De man zet een vuilniszak naast de container",m:[/(zak|vuilniszak|afval|vuilnis)/,/(naast|bij|tegen|neer|achter|voor)/,/container/]},
        {id:"g6",p:2,t:"De hond rent naar de vrouw en blaft",m:[/(blaf|blafte|rende|rent|woef)/]},
        {id:"g7",p:2,t:`De vrouw zegt: '${L_LIJN[Q.l[1]]}'`,m:[/(aan de lijn|aanlijnen|aan te lijnen)/,/(zei|vroeg|hoorde|riep|sprak|zeggen)/]},
        {id:"g8",p:2,t:`De man antwoordt: '${lniks[0]}'`,m:[new RegExp(lniks[1])]},
        {id:"g9",p:3,t:"Een fietser rijdt door het voetgangersgebied",m:[/(fiets|fietser|fietste)/,/(reed|rijdt|fietste|kwam|over het plein|voetganger)/]},
        {id:"g10",p:3,t:`De trolley valt om en ${fr.t} rollen over straat`,m:[new RegExp(`(trolley|boodschappen|tas|kar|${fr.re}|fruit)`),/(viel|om|rolden|rolde|vallen|omver)/]},
        {id:"g11",p:1,t:`Je hoort '${luit[0]}' en '${lsorry[0]}'`,m:[new RegExp(`(${luit[1]}|${lsorry[1]})`)]},
        {id:"g12",p:1,t:"De fietser rijdt weg; man en hond lopen weg, de zak blijft staan",m:[/(reed|fietste|liep|vertrok) .*(weg|door|verder)|(weg|door|verder) ?(reed|fietste|liep)|wegreed|wegfietste|wegliep/]}
      ],
      spec:[
        {p:1.5,t:`Man: ${HAIR[D.hair].t} haar`,m:[new RegExp(`(${HAIR[D.hair].re})(e)? haar|(${HAIR[D.hair].re})harig`)]},
        {p:1.5,t:`Man: ${COL[D.pet].adj} pet`,m:[new RegExp(`(${cre(D.pet)}) (pet|cap)`)]},
        {p:1.5,t:`Man: ${COL[D.vest].adj} bodywarmer`,m:[new RegExp(`(bodywarmer|(${cre(D.vest)}) (vest|jas|jack|bodywarmer)|mouwloos)`)]},
        {p:1,t:`Man: ${COL[D.broek].adj} broek`,m:[new RegExp(`(${cre(D.broek)}) broek`)]},
        {p:1.5,t:`Hond: ${dog.t.replace(/e$/,"")}`,m:[new RegExp(`(${dog.re}) hond|hond .*(${dog.re})`)]},
        {p:1,t:`Man: ${COL[D.riem].adj} riem / hondenlijn in de hand`,m:[/(riem|lijn|lijntje)/,new RegExp(`(${cre(D.riem)}|hand|vast|droeg|hield)`)]},
        {p:1,t:`Vrouw: ${HAIR[C.hair].t} krullend haar`,m:[new RegExp(`(${HAIR[C.hair].re}) .*(haar|krul)|krullend|krullen`)]},
        {p:1.5,t:`Vrouw: ${COL[C.jas].adj} jas`,m:[new RegExp(`(${cre(C.jas)}) ${JASW}`)]},
        {p:1.5,t:`Vrouw: ${COL[C.kar].adj} boodschappentrolley`,m:[new RegExp(`(${cre(C.kar)}) (trolley|boodschappen|kar|tas|boodschappenwagen|boodschappentrolley)`)]},
        {p:1.5,t:`Fietser: ${COL[E.hoodie].adj} hoodie met capuchon op`,m:[/(hoodie|capuchon|trui met capuchon|sweater)/]},
        {p:1,t:`Fietser: ${COL[E.broek].adj} joggingbroek`,m:[new RegExp(`(jogging|trainingsbroek|(${cre(E.broek)}) broek)`)]},
        {p:1.5,t:`Fietser: ${COL[E.pack].adj} rugzak`,m:[new RegExp(`(${cre(E.pack)}) (rugzak|tas|bezorg)`)]},
        {p:1,t:`Fiets: ${COL[E.fiets].adj.replace(/e$/,"")}`,m:[new RegExp(`(${cre(E.fiets)}) fiets`)]},
        {p:1,t:`Vuilniszak: ${COL[Q.zak].adj.replace(/e$/,"")}`,m:[new RegExp(`(${cre(Q.zak)}) (vuilniszak|zak|afvalzak)`)]},
        {p:2,t:`${fr.t[0].toUpperCase()+fr.t.slice(1)} uit de trolley; één blijft liggen`,m:[new RegExp(fr.re)]}
      ],
      order:["g1","g2","g3","g4","g5","g6","g7","g8","g9","g10","g11","g12"],
      wrong:[
        timeWrong(Q.start,192),
        jasWrong([C.jas,D.vest,E.hoodie],`de vrouw droeg een ${COL[C.jas].adj} jas`),
        {t:"De fietser raakte de vrouw niet (bijna-aanrijding)",f:s=>s.split(/[.!?\n]/).some(z=>/(fiets)/.test(z)&&/(raakte|reed .* aan|aangereden|botste|schampte|ramde)/.test(z)&&!/(bijna|niet)/.test(z))},
        {t:"De hond was niet aangelijnd",f:s=>s.split(/[.!?\n]/).some(z=>/hond/.test(z)&&/(was|liep) (aangelijnd|aan de lijn)/.test(z)&&!/niet/.test(z))},
        {t:`De pet had een andere kleur (${COL[D.pet].adj.replace(/e$/,"")})`,f:s=>new RegExp(`\\b(${Object.keys(COL).filter(c=>c!==D.pet).map(c=>COL[c].adj).join("|")}) pet\\b`).test(s)}
      ]
    }
  };
}
const SC_BRIEF={
  perron:{inleiding:"Je bent buitengewoon opsporingsambtenaar in het openbaar vervoer. Je collega's in de meldkamer hebben beelden van een perroncamera veiliggesteld. Er is een klacht binnengekomen over gedrag op het perron.",
    situatie:"Je ziet beelden van een camera op het perron. Het beeld begint terwijl het rustig is. Let op de omgeving, de personen en alles wat er gebeurt en gezegd wordt.",
    opdracht:"Kijk tweemaal naar de film en maak aantekeningen. Leg daarna in het sjabloon vast wat je hebt waargenomen: chronologisch, feitelijk en in de vorm van redenen van wetenschap (ik zag, ik hoorde)."},
  plein:{inleiding:"Je bent buitengewoon opsporingsambtenaar bij een gemeente. Na klachten over afval en loslopende honden is een camera op het plein geplaatst.",
    situatie:"Je ziet de beelden van een ochtend op het plein. Het beeld begint terwijl het rustig is. Let op de omgeving, de personen, de hond en alles wat er gebeurt en gezegd wordt.",
    opdracht:"Kijk tweemaal naar de film en maak aantekeningen. Leg daarna in het sjabloon vast wat je hebt waargenomen: chronologisch, feitelijk en in de vorm van redenen van wetenschap (ik zag, ik hoorde)."},
  yt:{inleiding:"Je bekijkt echte beelden van YouTube. Stel je voor dat je als buitengewoon opsporingsambtenaar deze situatie tijdens je dienst hebt waargenomen.",
    situatie:"Let op de omgeving, de personen, voertuigen en alles wat er gebeurt en gezegd wordt.",
    opdracht:"Kijk tweemaal naar de video en maak aantekeningen. Leg daarna in het sjabloon vast wat je hebt waargenomen: chronologisch, feitelijk en in de vorm van redenen van wetenschap (ik zag, ik hoorde)."}
};
const WVBASE=[{id:"perron",titel:"Perron",kort:"Openbaar vervoer · station",dom:"4"},{id:"plein",titel:"Plein",kort:"Openbare ruimte · winkelgebied",dom:"1"}];
const wvCache={};
function wvGet(sc,seed){
  const k=sc+":"+(seed||0);if(wvCache[k])return wvCache[k];
  let s=null;
  if(sc==="perron")s=buildPerron(seed||0);else if(sc==="plein")s=buildPlein(seed||0);else if(sc==="yt")s=ytScenario(seed);
  if(s&&sc!=="yt")wvCache[k]=s;return s;
}

// ===== filmspeler =====
let wvFilm=null;
function interp(path,t){
  if(t<=path[0][0])return [path[0][1],path[0][2],0];
  for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];if(t<=b[0]){const k=b[0]===a[0]?1:(t-a[0])/(b[0]-a[0]);const dx=b[1]-a[1];return [a[1]+dx*k,a[2]+(b[2]-a[2])*k,b[0]===a[0]?0:dx/(b[0]-a[0])]}}
  const l=path[path.length-1];return [l[1],l[2],0];
}
const wvDepth=y=>0.72+(y-300)/400*1.45;
function stateAt(st,t){const o={};for(const [tt,v] of st||[]){if(tt<=t)Object.assign(o,v);else break}return o}
function wrapText(s,n){const w=s.split(" ");const out=[];let cur="";for(const x of w){if((cur+" "+x).trim().length>n&&cur){out.push(cur);cur=x}else cur=(cur+" "+x).trim()}if(cur)out.push(cur);return out}
let wvAudio=null;
function wvSound(kind){
  try{wvAudio=wvAudio||new (window.AudioContext||window.webkitAudioContext)();const a=wvAudio;const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);
    const f={beep:[1320,.12],door:[880,.5],bark:[220,.18],bell:[1760,.35]}[kind]||[600,.2];o.frequency.value=f[0];o.type=kind==="bark"?"sawtooth":"sine";
    g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(.18,a.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+f[1]);o.start();o.stop(a.currentTime+f[1]+.05);
    if(kind==="bark"){const o2=a.createOscillator(),g2=a.createGain();o2.connect(g2);g2.connect(a.destination);o2.type="sawtooth";o2.frequency.value=200;g2.gain.setValueAtTime(.0001,a.currentTime+.3);g2.gain.exponentialRampToValueAtTime(.16,a.currentTime+.32);g2.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.5);o2.start(a.currentTime+.3);o2.stop(a.currentTime+.55)}
  }catch(e){}
}
function wvSay(text,voice){
  try{if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(text.replace(/\*/g,""));u.lang="nl-NL";
    const vs=speechSynthesis.getVoices().filter(v=>/^nl/i.test(v.lang));if(vs.length)u.voice=vs[{f:0,f2:1,m:2,m2:3,m3:4,m4:5}[voice]%vs.length]||vs[0];
    u.pitch={f:1.25,f2:1.1,m:.75,m2:.95,m3:.7,m4:1}[voice]||1;u.rate=1.05;speechSynthesis.speak(u)}catch(e){}
}
function mountFilm(host,sc,onEnd){
  stopFilm();
  const ids=Object.keys(sc.actors);
  host.innerHTML=`<svg class="film" viewBox="0 0 960 540" role="img" aria-label="Camerabeelden ${esc(sc.titel)}"><style>.sm{animation:wvsm 1.8s linear infinite}.s2{animation-delay:.6s}.s3{animation-delay:1.2s}@keyframes wvsm{0%{transform:translate(0,0);opacity:.9}100%{transform:translate(8px,-34px);opacity:0}}</style>${sc.bg}<g class="fa">${ids.map(id=>`<g data-a="${id}"><g class="ab">${sc.actors[id].draw}</g></g>`).join("")}</g><g class="fsp"></g>
    <g font-family="ui-monospace,Menlo,Consolas,monospace" font-size="17" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke"><text x="16" y="30" class="fts"></text><text x="944" y="30" text-anchor="end">${esc(sc.cam)}</text><text x="944" y="526" text-anchor="end" class="frec">● REC</text></g></svg>`;
  const svg=host.querySelector("svg");const fa=svg.querySelector(".fa"),fsp=svg.querySelector(".fsp"),fts=svg.querySelector(".fts");
  const els={};ids.forEach(id=>{const g=fa.querySelector(`[data-a="${id}"]`);els[id]={g,ab:g.querySelector(".ab"),k:[...g.querySelectorAll("[data-k]")],l1:g.querySelector(".lg1"),l2:g.querySelector(".lg2"),a1:g.querySelector(".ar1"),a2:g.querySelector(".ar2"),dir:1}});
  const speed=(()=>{try{return +localStorage.getItem("wv-speed")||1}catch(e){return 1}})();
  const seek=(()=>{try{return +localStorage.getItem("wv-seek")||0}catch(e){return 0}})();
  const said=new Set(),played=new Set();const t0=performance.now();let last=-1,lastOrder="",lastSp="",lastTs="";
  const sound=W&&W.sound;
  const st={raf:0,stopped:false};
  function frame(now){
    if(st.stopped)return;
    const t=Math.min(sc.dur,seek+(now-t0)/1000*speed);
    const order=[];
    for(const id of ids){const a=sc.actors[id],e=els[id];const [x,y,vx]=interp(a.path,t);const s=stateAt(a.st,t);
      if(s.hide){e.g.style.display="none";continue}e.g.style.display="";
      const sc2=a.scale||wvDepth(y);
      if(a.face==="auto"&&Math.abs(vx)>2)e.dir=vx>0?1:-1;
      e.g.setAttribute("transform",`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(sc2*(a.face==="auto"?e.dir:1)).toFixed(3)} ${sc2.toFixed(3)})${s.rot?` rotate(${s.rot})`:""}`);
      const moving=Math.abs(vx)>4||(()=>{const [,y2]=interp(a.path,t+.05);return Math.abs(y2-y)>.15})();
      const ph=Math.sin(t*11)*(moving?1:0);
      if(e.l1){e.l1.setAttribute("transform",`translate(0 ${(-Math.max(0,ph)*4).toFixed(1)})`);e.l2.setAttribute("transform",`translate(0 ${(-Math.max(0,-ph)*4).toFixed(1)})`)}
      if(e.a1){e.a1.setAttribute("transform",`translate(0 ${(ph*2).toFixed(1)})`);e.a2.setAttribute("transform",`translate(0 ${(-ph*2).toFixed(1)})`)}
      for(const k of e.k){const v=s[k.dataset.k];if(v!==undefined)k.style.display=v?"":"none"}
      order.push([a.z||y,e.g,x,y,sc2]);
    }
    order.sort((p,q)=>p[0]-q[0]);const ok=order.map(o=>o[1].dataset.a).join();if(ok!==lastOrder){lastOrder=ok;order.forEach(o=>fa.appendChild(o[1]))}
    // spraak
    let sp="";for(const [a,b,who,text,] of sc.speech){if(t>=a&&t<b){const act=sc.actors[who];const [x,y]=interp(act.path,t);const s2=act.scale||wvDepth(y);
        const lines=wrapText(text,26);const w=Math.max(...lines.map(l=>l.length))*8.6+22,h=lines.length*19+14;const top=y-(who==="hond"?60:178)*s2-h-8;let bx=Math.max(8,Math.min(952-w,x-w/2));
        sp+=`<g><rect x="${bx}" y="${top}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="#222" stroke-width="1.5"/><path d="M${x-7} ${top+h-1} L${x} ${top+h+10} L${x+7} ${top+h-1}z" fill="#fff" stroke="#222" stroke-width="1.5"/><rect x="${x-6}" y="${top+h-3}" width="12" height="4" fill="#fff"/>${lines.map((l,i)=>`<text x="${bx+11}" y="${top+22+i*19}" font-size="15" font-family="Arial,sans-serif" fill="#111">${esc(l)}</text>`).join("")}</g>`;
        if(sound&&!said.has(a)){said.add(a);if(who!=="hond")wvSay(text,act.voice)}}}
    if(sp!==lastSp){lastSp=sp;fsp.innerHTML=sp}
    if(sound)for(const [a,k] of sc.sounds||[]){if(t>=a&&!played.has(a)){played.add(a);wvSound(k)}}
    const d=new Date(new Date(sc.start).getTime()+t*1000);
    const ts=`${pad2(d.getDate())}-${pad2(d.getMonth()+1)}-${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;if(ts!==lastTs){lastTs=ts;fts.textContent=ts}
    sc.frame&&sc.frame.call(sc,t,svg);
    const sec=Math.floor(t);if(sec!==last){last=sec;const pb=document.getElementById("wvProg");if(pb)pb.style.width=(t/sc.dur*100).toFixed(1)+"%"}
    if(t>=sc.dur){st.stopped=true;try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}wvFilm=null;try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}onEnd&&onEnd();return}
    st.raf=requestAnimationFrame(frame);
  }
  st.raf=requestAnimationFrame(frame);wvFilm=st;
}
function stopFilm(){if(wvFilm){wvFilm.stopped=true;cancelAnimationFrame(wvFilm.raf);wvFilm=null}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}

// ===== beoordeling =====
function wvNorm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’‘`´]/g,"'").replace(/[“”]/g,'"')}
const WV_OPINION=["agressief","agressieve","brutaal","brutale","onbeschoft","onbeschofte","dronken","verdacht","verdachte","volgens mij","ik denk","ik dacht","ik vond","ik vind","waarschijnlijk","vermoedelijk","blijkbaar","kennelijk","duidelijk dat","zenuwachtig","boos","boze","kwaad","asociaal","asociale","vervelend","vervelende","gelukkig","helaas","onaardig","onaardige","respectloos","respectloze","schandalig","hufter","idioot","junk","hangjongere","crimineel","zielig","geschrokken","bang","overstuur","arrogant","arrogante","onverschillig","onverschillige","expres","opzettelijk","bewust"];
const WV_TYPO={"peron":"perron","perons":"perrons","sigeret":"sigaret","sigarret":"sigaret","sigaretten peuk":"sigarettenpeuk","sigarrete":"sigaret","signalment":"signalement","vertrok ik":"","aanstekker":"aansteker","aansteeker":"aansteker","konteiner":"container","kontainer":"container","bodywarner":"bodywarmer","troley":"trolley","paarden staart":"paardenstaart","incheck paal":"incheckpaal","in check paal":"incheckpaal","verbalisant":"","als eerst":"als eerste","hun hebben":"zij hebben","hun zeiden":"zij zeiden","hun liepen":"zij liepen","me vriend":"mijn vriend","ik zie":"ik zag (verleden tijd)","ik hoor ":"ik hoorde (verleden tijd)"};
function wvSentences(n){return n.replace(/([.!?])\s+/g,"$1\n").split(/\n+/).map(x=>x.trim()).filter(Boolean)}
function wvScore(sc,txt,hdr){
  const n=wvNorm(txt);const sents=wvSentences(n);const key=sc.key;
  const hit=it=>{for(let i=0;i<sents.length;i++){if(it.m.every(r=>r.test(sents[i])))return i}return -1};
  const parts={};let spec60=0,specMax=0;
  for(const [k,label,max] of WV_PARTS){const items=((key&&key[k])||[]).map(it=>{const at=hit(it);return {...it,ok:at>-1,at}});if(!items.length){parts[k]={label,max,got:0,items,none:true};continue}
    const got=Math.min(max,items.filter(i=>i.ok).reduce((a,i)=>a+i.p,0));parts[k]={label,max,got:Math.round(got*2)/2,items};spec60+=got;specMax+=max}
  const content=specMax>0;if(content&&specMax<60)spec60=spec60*60/specMax;
  // algemeen 1: chronologie
  const ev=((key&&key.order)||parts.gebeur.items.map(i=>i.id)).map(id=>parts.gebeur.items.find(i=>i.id===id)).filter(i=>i&&i.ok);
  let conc=0,tot=0;for(let i=0;i<ev.length;i++)for(let j=i+1;j<ev.length;j++){tot++;if(ev[i].at<=ev[j].at)conc++}
  const chronoRatio=tot?conc/tot:0;const coverage=content?Math.min(1,ev.length/Math.min(6,Math.max(2,parts.gebeur.items.length))):1;const chrono=Math.round(10*chronoRatio*coverage);
  // algemeen 2: spelling, termen en redenen van wetenschap
  const rvw=(n.match(/\bik (zag|hoorde|rook|voelde|nam waar|heb gezien|heb gehoord|bemerkte|constateerde|hoor de|zag dat|zag hoe)/g)||[]).length;
  const typos=Object.keys(WV_TYPO).filter(t=>new RegExp("\\b"+t.replace(/ /g,"\\s")+"\\b").test(n));
  const lowerStart=wvSentences(String(txt||"")).filter(s=>/^[a-z]/.test(s)).length;
  let spell=(rvw>=5?6:rvw>=3?4:rvw>=1?2:0)+Math.max(0,4-typos.length-(lowerStart>2?1:0));
  // algemeen 3: beknoptheid en relevantie
  const words=(txt||"").trim().split(/\s+/).filter(Boolean).length;
  const relevant=sents.filter(s=>[...parts.aanv.items,...parts.gebeur.items,...parts.spec.items].some(it=>it.m.every(r=>r.test(s)))).length;
  const relRatio=sents.length?relevant/sents.length:0;
  let kort=words<120?2:words<220?5:words<=750?8:words<=1000?6:3;kort+=content?(relRatio>=.6?2:relRatio>=.4?1:0):(words>=150?2:0);kort=Math.min(10,kort);
  // algemeen 4: feitelijk en neutraal
  const opinions=[...new Set(WV_OPINION.filter(w=>new RegExp("\\b"+w+"\\b").test(n)))];
  const neutraal=Math.max(0,10-opinions.length*2);
  const alg={chrono:{label:"Chronologische volgorde",got:content?chrono:null,max:10,info:!content?"Niet automatisch te beoordelen zonder kernpunten bij deze video.":ev.length<2?"Te weinig gebeurtenissen herkend om de volgorde te beoordelen.":`${conc} van ${tot} paren gebeurtenissen in de juiste volgorde${coverage<1?`; ${ev.length} gebeurtenissen herkend, zo telt de volgorde niet volledig mee`:""}.`},
    spell:{label:"Spelling, beroepsmatige termen en redenen van wetenschap",got:spell,max:10,info:`${rvw}× redenen van wetenschap ('ik zag', 'ik hoorde').${typos.length?" Let op: "+typos.map(t=>`'${t}'${WV_TYPO[t]?" → "+WV_TYPO[t]:""}`).join(", ")+".":""}${lowerStart>2?" Meerdere zinnen beginnen zonder hoofdletter.":""}`},
    kort:{label:"Beknoptheid en relevantie",got:kort,max:10,info:content?`${words} woorden; ${Math.round(relRatio*100)}% van de zinnen bevat een relevante waarneming.`:`${words} woorden. Relevantie is niet gecontroleerd: deze video heeft geen kernpunten.`},
    neutraal:{label:"Feitelijk en neutraal, zonder meningen",got:neutraal,max:10,info:opinions.length?`Gevonden: ${opinions.map(w=>`'${w}'`).join(", ")}. Beschrijf wat je zag en hoorde, niet wat je ervan vindt.`:"Geen meningen of interpretaties gevonden."}};
  const algVals=Object.values(alg).filter(x=>x.got!=null);const alg40=Math.round(algVals.reduce((a,x)=>a+x.got,0)*40/(algVals.length*10));
  const wrong=((key&&key.wrong)||[]).filter(w=>{try{return w.f(n)}catch(e){return false}});
  const total=content?Math.max(0,Math.round(alg40+spec60-wrong.length*10)):null;
  const partsOk=content&&WV_PARTS.every(([k,,max])=>parts[k].none||parts[k].got>=max/2);
  const h=hdr||{};
  const tpl=[["Kandidaatnummer",!!(h.nr||"").trim()],["Functie",!!(h.functie||"").trim()],["Organisatie",!!(h.org||"").trim()],["Afdeling",!!(h.afd||"").trim()],["Nummer akte van beëdiging",!!(h.akte||"").trim()],["Naam: eerste voornaam voluit, voorletters en achternaam",/^\S{2,}\s+(\S+\s+)*\S{2,}/.test((h.naam||"").trim())&&!/^[a-z]\.?\s/i.test((h.naam||"").trim())],["Ambtseed of ambtsbelofte gekozen",!!h.eed]];
  return {content,total,pass:content?total>=WV_PASS&&partsOk:null,good:content&&total>=WV_GOOD&&partsOk,partsOk,parts,alg,alg40,spec60:Math.round(spec60*2)/2,wrong,words,tpl};
}

