// ---------- vraag van de dag ----------
// Elke dag één meerkeuzevraag. In de Android- en iOS-app als melding: je ziet de vraag en de antwoorden A–D, en een tik
// opent de app direct bij die vraag. In de browser als kaart op het overzicht. Na je antwoord: uitleg, bron, toetsterm en
// de knop om meteen verder te oefenen op hetzelfde onderwerp.
// Antwoorden in de melding zelf kan niet goed: Android toont hooguit drie knoppen (een vraag heeft er vier) en een knop
// opent de app toch. Daarom kies je het antwoord in de app; de melding opent direct de vraag.
// Welke vraag: bij een examen binnen 30 dagen alleen uit die module. Daarbinnen de helft van de keren een open fout, anders
// een vraag die je nog niet goed had uit een onderwerp dat je voor minder dan 70% beheerst, anders iets wat je nog niet
// goed had. Achtergrondvragen van PHB 1 (niet in de toetsmatrijs van je domein) doen niet mee.
// Planning en antwoorden: store.p.mld.vp, per dag [vraag-id, volgorde van de antwoorden, gekozen antwoord of -1].
// Wat gepland is blijft staan, zodat de melding en de app dezelfde vraag in dezelfde volgorde tonen.
const VR_DAGEN=7;
function vrDag(i){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);return dayKey(d)}
const vrOk=e=>{const q=e&&BYID[e[0]];return !!q&&e[1].length===q.o.length&&[...e[1]].sort().join("")===q.o.map((_,j)=>j).join("")};
function vrPool(){const nx=nextExam();const ms=nx&&MODBY[nx.mod]&&daysTo(nx.datum)<=30?[MODBY[nx.mod]]:MODS;
  return ms.flatMap(m=>inMod(m.id)).filter(q=>q.m!=="phb1"||inMtx(q))}
function vrKies(excl){
  const pool=vrPool().filter(q=>!excl.has(q.id));if(!pool.length)return null;
  const bh={},zwak=c=>c in bh?bh[c]:(bh[c]=mastery(inCat(c))<.7);
  const fout=pool.filter(q=>lastWrong(q.id)),open=pool.filter(q=>!lastOk(q.id)),zw=open.filter(q=>zwak(q.c));
  const uit=fout.length&&Math.random()<.5?fout:zw.length?zw:open.length?open:pool;
  return uit[Math.floor(Math.random()*uit.length)];
}
// vragen klaarzetten voor vandaag en de komende n-1 dagen; true als er iets is veranderd
function vrPlan(n){
  const vp=store.p.mld.vp,grens=vrDag(-21);let nieuw=false;
  for(const k of Object.keys(vp))if(k<grens||!vrOk(vp[k])){delete vp[k];nieuw=true}
  const excl=new Set(Object.values(vp).map(e=>e[0]));
  for(let i=0;i<n;i++){const k=vrDag(i);if(vp[k])continue;const q=vrKies(excl);if(!q)break;
    vp[k]=[q.id,shuffle(q.o.map((_,j)=>j)).join(""),-1];excl.add(q.id);nieuw=true}
  return nieuw;
}
const vrRoute=k=>{const e=store.p.mld.vp[k];return "vraag-"+k+(e?"."+e[0]+"."+e[1]:"")};
// de vraag bij een adres: vraag-<dag>.<id>.<volgorde> (uit de melding), vraag-<dag> of alleen vraag (vandaag)
function vrUitRoute(r){
  const m=/^vraag-(\d{4}-\d{2}-\d{2})(?:\.(\w{1,40})\.([0-3]{2,4}))?$/.exec(r),vp=store.p.mld.vp;let k=vrDag(0),gewijzigd=false;
  if(m){const e=m[2]&&[m[2],m[3],-1];
    // de melding is leidend (bijv. als een ander apparaat intussen een andere vraag voor die dag plande), behalve als je al antwoordde
    if(e&&vrOk(e)&&(!vp[m[1]]||vp[m[1]][2]<0&&vp[m[1]][0]+vp[m[1]][1]!==e[0]+e[1])){vp[m[1]]=e;gewijzigd=true}
    if(vp[m[1]])k=m[1]}
  // planning nakijken (beschadigde of verouderde dagen weg) en zo nodig de vraag van vandaag klaarzetten
  if(vrPlan(1))gewijzigd=true;if(!vp[k])k=vrDag(0);
  if(gewijzigd)save();
  return vp[k]?[k,vp[k]]:null;
}
const vrKort=(s,n)=>s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,"")+"…":s;
// stand van de laatste drie weken
function vrStand(){const a=Object.values(store.p.mld.vp).filter(e=>e[2]>=0);return [a.filter(e=>e[2]===0).length,a.length]}
function viewVraag(r){
  const x=vrUitRoute(r);
  if(!x)return `<div class="stack"><h1>Vraag van de dag</h1><p class="lede">Er is nu geen vraag voor je klaargezet.</p><div class="row"><a class="btn" href="#home">Naar het overzicht</a></div></div>`;
  const [k,e]=x,q=BYID[e[0]],ord=[...e[1]].map(Number),pick=e[2],klaar=pick>=0,ok=pick===0;
  const wanneer=k===vrDag(0)?"Vandaag":new Date(k+"T12:00").toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long"});
  const opts=ord.map((oi,pos)=>{let cls="opt";if(pick===oi)cls+=" sel";if(klaar){if(oi===0)cls+=" right";else if(pick===oi)cls+=" wrong"}
    const mk=klaar&&oi===0?`<svg class="mk" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 L10 17 L19 7.5"/></svg><span class="vh">(juiste antwoord)</span>`:klaar&&pick===oi?`<svg class="mk" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7 L17 17 M17 7 L7 17"/></svg><span class="vh">(jouw antwoord)</span>`:"";
    return `<li><button class="${cls}" data-act="vr-pick" data-k="${k}" data-o="${oi}" ${klaar?"disabled":""} aria-pressed="${pick===oi}"><span class="k">${LET[pos]}</span><span class="tx">${esc(q.o[oi])}</span>${mk}</button></li>`}).join("");
  let na="";
  if(klaar){const l=inCat(q.c),[g,n]=vrStand(),th=CATS[q.c][1];
    na=`<div class="fb ${ok?"ok":"no"}" role="status"><strong>${ok?"Goed zo.":"Helaas, dit is niet goed."}</strong>${ok?"":`<p>Juist is: <b>${esc(q.o[0])}</b></p>`}<p style="margin-top:4px">${esc(q.e)}</p>${q.r?`<p class="art">${bronHtml(q.r)}</p>`:""}${refHtml(q,!ok)}</div>
    <div class="vrverder stack"><div><h2>Verder met ${esc(th.charAt(0).toLowerCase()+th.slice(1))}</h2><p class="small">Je beheerst ${l.filter(y=>lastOk(y.id)).length} van de ${l.length} vragen over dit onderwerp.${n>1?` Vragen van de dag: ${g} van de ${n} goed.`:""}</p></div>
    <div class="row"><button type="button" class="btn hi" data-act="vr-verder" data-cat="${q.c}" data-id="${q.id}">Oefen ${Math.min(ROUND,l.length)} vragen</button><a class="btn ghost" href="#home">Naar het overzicht</a></div></div>`}
  return `<div class="stack qsplit vraag"><div class="stack qa">
    <div class="stack" style="gap:6px"><h1>Vraag van de dag</h1><p class="small">${esc(wanneer)} · ${klaar?"beantwoord":"kies je antwoord"}</p></div>
    <div>${D4.has(q.c)?`<span class="chip ov">OV</span> `:""}<span class="chip">${esc(CATS[q.c][1])}</span></div>
    <p class="qtext" id="qtext">${esc(q.q)}</p></div>
    <div class="stack qb"><ul class="opts${klaar?" done":""}" aria-labelledby="qtext">${opts}</ul>${na}</div>
  </div>`;
}
// de melding voor een dag (titel, korte tekst, uitgeklapte tekst met de antwoorden, adres)
function vrMelding(k){const e=store.p.mld.vp[k],q=BYID[e[0]];
  const ant=[...e[1]].map((oi,j)=>LET[j]+". "+q.o[+oi]).join("\n");const C=window.Capacitor;
  const ios=!!(C&&C.getPlatform&&C.getPlatform()==="ios");
  return {title:"Vraag van de dag · "+CATS[q.c][1],body:ios?q.q+"\n"+ant:q.q,largeBody:q.q+"\n\n"+ant+"\n\nTik om je antwoord te kiezen.",summaryText:"Vraag van de dag",extra:{route:vrRoute(k)}}}
// kaart op het overzicht: de vraag van vandaag (vanaf het gekozen tijdstip, tot je hebt geantwoord), of eenmalig de vraag om dit aan te zetten
function vrKaart(card){const m=store.p.mld;
  if(!m.vraag){if(!m.gevraagd||m.vraagNee)return "";
    return card("vraag","Nieuw: vraag van de dag",`Elke dag één vraag over een onderwerp dat je nog niet beheerst${LNp()?", als melding op je telefoon":""}. Na je antwoord oefen je meteen verder op dat onderwerp.`,
      `<button type="button" class="btn hi sm" data-act="mld" data-k="vraag">Aanzetten</button><button type="button" class="btn ghost sm" data-act="mld-vraagnee">Niet nu</button>`)}
  const [hh,mm]=(m.vtijd||"08:00").split(":").map(Number),n=new Date();if(n.getHours()*60+n.getMinutes()<hh*60+mm)return "";
  if(vrPlan(1))save();const k=vrDag(0),e=m.vp[k];if(!e||e[2]>=0)return "";const q=BYID[e[0]];
  return card("vraag","Vraag van de dag · "+esc(CATS[q.c][1]),esc(vrKort(q.q,150)),`<a class="btn hi sm" href="#${vrRoute(k)}">Beantwoorden</a>`);
}
// proefbouw in de browser: een nagebootste melding (zoals op Android, uitgeklapt), zodat je de weg melding → vraag kunt testen
function vrDemo(){if(vrPlan(1))save();const k=vrDag(0);if(!store.p.mld.vp[k])return;const n=vrMelding(k);
  let el=document.getElementById("vrDemo");if(el)el.remove();
  el=document.createElement("button");el.type="button";el.id="vrDemo";el.className="vrdemo";
  el.innerHTML=`<span class="vrdk">Boa Paraat · nu</span><b>${esc(n.title)}</b><span class="vrdt">${esc(n.largeBody)}</span>`;
  el.addEventListener("click",()=>{el.remove();location.hash=n.extra.route});document.body.appendChild(el);
  setTimeout(()=>{if(el.isConnected)el.remove()},20000)}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;const a=b.dataset.act;
  if(a==="vr-pick"){const x=store.p.mld.vp[b.dataset.k];if(!x||x[2]>=0)return;x[2]=+b.dataset.o;record(x[0],x[2]===0);save();render();
    const f=document.querySelector("#app .fb");if(f&&f.scrollIntoView)try{f.scrollIntoView({block:"nearest"})}catch(z){}return}
  if(a==="vr-verder"){launch("oefen",{cat:b.dataset.cat},new Set([b.dataset.id]));return}
  if(a==="vr-demo"){vrDemo();return}
  if(a==="mld-vraagnee"){store.p.mld.vraagNee=1;save();render();toast("Je kunt de vraag van de dag later aanzetten onder Profiel");return}
});
document.addEventListener("keydown",e=>{
  if(route().indexOf("vraag")!==0||keysOpen||e.metaKey||e.ctrlKey||e.altKey)return;if(e.target.closest&&e.target.closest("input,textarea,select"))return;
  const k=e.key.toUpperCase();let pos=LET.indexOf(k);if(pos<0)pos=["1","2","3","4"].indexOf(k);if(pos<0)return;
  const btn=document.querySelectorAll("#app .opt")[pos];if(btn&&!btn.disabled){btn.click();e.preventDefault()}
});
