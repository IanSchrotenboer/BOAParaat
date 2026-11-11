
// ---------- foutenanalyse en gericht leren op je fouten ----------
// Per vraag staat in store.s: [aantal keer beantwoord, aantal keer goed, laatste keer goed (1/0), tijdstip].
// Een open fout is een vraag die je de laatste keer fout had; opgelost is een vraag die je ooit fout had en
// nu goed. In een ronde 'Fouten wegwerken' komt een fout later in dezelfde ronde terug (hooguit twee keer),
// tot je hem goed hebt. De analyse toont per module, onderwerp en (PHB 1) toetsterm waar de fouten zitten.
const ooitFout=id=>{const s=store.s[id];return !!s&&s[0]>s[1]};
function foutStat(list){let att=0,wr=0,open=0,ooit=0,opg=0;
  for(const q of list){const s=store.s[q.id];if(!s)continue;att+=s[0];wr+=s[0]-s[1];if(s[2]===0)open++;if(s[0]>s[1]){ooit++;if(s[2]===1)opg++}}
  return {att,wr,open,ooit,opg,rate:att?wr/att:null,n:list.length}}
// zwakste onderwerpen: eerst de meeste open fouten, dan het hoogste foutpercentage
const zwakSort=(a,b)=>b.st.open-a.st.open||(b.st.rate||0)-(a.st.rate||0);
function zwakkePlekken(){const out=[];
  for(const m of MODS)for(const c of catsOf(m)){const l=inCat(c).filter(q=>inMod(m.id).includes(q));const st=foutStat(l);if(st.open)out.push({m,c,st})}
  return out.sort(zwakSort)}
// volgorde voor 'Fouten wegwerken': vragen uit de zwakste onderwerpen eerst, daarna de vaakst fout beantwoorde
function foutVolgorde(list){const per={};list.forEach(q=>{per[q.c]=(per[q.c]||0)+1});
  return list.slice().sort((a,b)=>per[b.c]-per[a.c]||(store.s[b.id][0]-store.s[b.id][1])-(store.s[a.id][0]-store.s[a.id][1])||store.s[a.id][3]-store.s[b.id][3])}
// tijdens een ronde: fout beantwoorde vraag komt drie vragen later terug
function foutTerug(it){if(!S||!S.herh||it.pick===0||(it.rep||0)>=2)return;
  S.items.splice(Math.min(S.items.length,S.i+4),0,{id:it.id,ord:shuffle(BYID[it.id].o.map((_,k)=>k)),pick:null,flag:false,rep:(it.rep||0)+1})}
function foutUitslag(){const ids=[...new Set(S.items.map(x=>x.id))];const weg=ids.filter(id=>lastOk(id)).length;
  const open=MODS.flatMap(m=>inMod(m.id)).filter(q=>lastWrong(q.id)).length;return {n:ids.length,weg,open}}
const stofVan=c=>STOF_CAT[c]&&STOFBY[STOF_CAT[c]]?STOF_CAT[c]:null;
function foutBalk(rate){const r=rate||0;return `<div class="meter" role="img" aria-label="${pct(r)} van je antwoorden fout"><i style="width:${pct(r)};background:${r>.4?"var(--bad)":r>.2?"var(--hivis)":"var(--ok)"}"></i></div>`}
function foutInhoud(){
  const pool=MODS.flatMap(m=>inMod(m.id));const st=foutStat(pool);
  if(!st.att)return `<div class="panel stack"><b>Nog geen antwoorden</b><p class="small">Zodra je vragen hebt beantwoord, zie je hier waar je fouten zitten.</p><div class="row"><a class="btn hi" href="#home">Begin met oefenen</a></div></div>`;
  const herh=pool.filter(q=>ooitFout(q.id)&&lastOk(q.id)).length;
  const stats=`<div class="stats"><div class="stat"><div class="v">${st.open}</div><div class="l">open fouten</div></div><div class="stat"><div class="v">${st.opg}</div><div class="l">fouten opgelost</div></div><div class="stat"><div class="v">${pct(st.rate)}</div><div class="l">van je antwoorden fout</div></div><div class="stat"><div class="v">${pool.filter(q=>seen(q.id)).length}<span class="small"> / ${pool.length}</span></div><div class="l">vragen geoefend</div></div></div>`;
  const cta=st.open?`<div class="panel stack fcta"><div><h2>Fouten wegwerken</h2><p class="small">Je krijgt eerst de onderwerpen met de meeste fouten. Heb je een vraag weer fout, dan komt hij later in dezelfde ronde terug, tot je hem goed hebt.</p></div>
      <div class="row"><button class="btn hi" data-act="fouten" data-mod="">Start (${Math.min(st.open,20)} ${st.open===1?"fout":"fouten"})</button>${herh?`<button class="btn" data-act="herhaal">Opgeloste fouten herhalen (${Math.min(herh,20)})</button>`:""}</div></div>`
    :`<div class="panel stack fcta"><div><h2>Geen open fouten</h2><p class="small">Alles wat je ooit fout had, heb je de laatste keer goed beantwoord.${herh?" Herhaal die vragen af en toe, dan blijft het hangen.":""}</p></div>${herh?`<div class="row"><button class="btn hi" data-act="herhaal">Opgeloste fouten herhalen (${Math.min(herh,20)})</button></div>`:""}</div>`;
  const zw=zwakkePlekken().slice(0,3);
  const zwak=zw.length?`<div class="section stack"><div><h2>Je zwakke plekken</h2><p class="small">De onderwerpen met de meeste open fouten. Lees eerst de samenvatting en oefen dan de fouten.</p></div><ol class="zwak">${zw.map(({m,c,st:s})=>{const sv=stofVan(c);
      return `<li class="panel"><div class="stack" style="gap:4px;min-width:0"><span class="eyebrow">${esc(m.code)}</span><b>${esc(CATS[c][1])}</b><span class="small">${s.open} open ${s.open===1?"fout":"fouten"} · ${pct(s.rate)} van je antwoorden fout</span>${foutBalk(s.rate)}</div>
        <div class="row"><button class="btn hi sm" data-act="fouten" data-mod="${m.id}" data-cat="${c}">Oefen deze fouten</button>${sv?`<a class="btn sm" href="#stof-${sv}">Lees de stof</a>`:""}</div></li>`}).join("")}</ol></div>`:"";
  const mods=MODS.map(m=>{const l=inMod(m.id);const ms=foutStat(l);if(!ms.att)return "";
    const rows=catsOf(m).map(c=>{const s=foutStat(inCat(c).filter(q=>l.includes(q)));if(!s.att)return "";
      return `<tr><td>${esc(CATS[c][1])}</td><td style="width:30%">${foutBalk(s.rate)}</td><td class="n">${s.open?`<b>${s.open}</b>`:"0"}</td><td class="n">${s.open?`<button class="btn sm" data-act="fouten" data-mod="${m.id}" data-cat="${c}" aria-label="Oefen ${s.open} ${s.open===1?"fout":"fouten"} bij ${esc(CATS[c][1])}">Oefen</button>`:`<span class="small">${s.ooit?"opgelost":"–"}</span>`}</td></tr>`}).join("");
    let mtx="";if(m.id==="phb1"){const gs=mtxGroups().map(g=>({g,s:foutStat(mtxQs(g))})).filter(x=>x.s.open).sort((a,b)=>b.s.open-a.s.open||(b.s.rate||0)-(a.s.rate||0));
      if(gs.length)mtx=`<h3 class="small fsub">Per toetsterm van het examen</h3><ul class="mlist">${gs.map(({g,s})=>`<li><span class="mcode mono">${esc(g[0])}</span><span class="mt">${esc(g[1])}<span class="small">${s.open} open ${s.open===1?"fout":"fouten"} · ${g[2]} ${g[2]===1?"vraag":"vragen"} op het examen</span></span><button class="btn sm" data-act="mtx" data-g="${esc(g[0])}">Oefen</button></li>`).join("")}</ul>`}
    return `<details class="pmod"${ms.open?" open":""}><summary><div class="stack" style="gap:4px;min-width:0"><span class="eyebrow">${m.code}</span><h3>${esc(m.name)}</h3><span class="small">${ms.open} open ${ms.open===1?"fout":"fouten"} · ${pct(ms.rate)} van je antwoorden fout · ${ms.opg} opgelost</span></div></summary>
      <div class="body"><div class="tblwrap"><table class="tbl ftbl"><thead><tr><th>Onderwerp</th><th>Fout</th><th style="text-align:right">Open</th><th><span class="sr">Oefenen</span></th></tr></thead><tbody>${rows}</tbody></table></div>${mtx}
      ${ms.open?`<div class="row"><button class="btn hi" data-act="fouten" data-mod="${m.id}">Alle fouten ${esc(m.code)} (${ms.open})</button></div>`:""}</div></details>`}).join("");
  return `${stats}${cta}${zwak}<div class="section stack"><div><h2>Per module</h2><p class="small">Fout = het deel van al je antwoorden in dat onderwerp dat fout was. Open = vragen die je de laatste keer fout had.</p></div>${mods}</div>`}
// compacte kaart op het overzicht en in het profiel: open fouten, zwakste onderwerp, direct verder werken
function foutKaart(waar){
  const st=foutStat(MODS.flatMap(m=>inMod(m.id)));if(!st.open)return "";
  const zw=zwakkePlekken()[0];
  return `<section class="fkaart panel" aria-labelledby="fkT-${waar}"><div class="fkkop"><span class="fkn mono" aria-hidden="true">${st.open}</span><div class="stack" style="gap:2px;min-width:0"><h2 id="fkT-${waar}">${st.open===1?"1 open fout":st.open+" open fouten"}</h2>${zw?`<span class="small">Meeste fouten: ${esc(CATS[zw.c][1])} (${esc(zw.m.code)}, ${zw.st.open})</span>`:""}</div></div>
    <div class="row"><button class="btn hi" data-act="fouten" data-mod="">Fouten wegwerken</button><a class="btn" href="#profiel-fouten">${waar==="profiel"?"Bekijk de analyse":"Foutenanalyse"}</a></div></section>`}
