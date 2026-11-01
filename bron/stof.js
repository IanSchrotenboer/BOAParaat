// Samenvattingen Studiestof. kb = Kennisboekje Boa Basis OV (gedrukte bladzijdenummers), dia = lesdia's Boa Basis OV.
const STOF_DOCS = {
  kb: {naam:"Kennisboekje Boa Basis OV", kort:"Kennisboekje", eenheid:"blz."},
  dia: {naam:"Lesdia's Boa Basis OV", kort:"Lesdia's", eenheid:"dia"}
};
const STOF = [
{id:"staat", deel:"Algemene rechtskennis", titel:"Staatsinrichting en wetgeving", kb:"2–7", dia:"83–95", html:`
<p>Een staat heeft een grondgebied, een volk en een eigen overheid. Nederland is een <b>gedecentraliseerde eenheidsstaat</b>: de macht is verdeeld over Rijk, provincies, gemeenten en waterschappen. De regeringsvorm is een erfelijke constitutionele monarchie met een parlementair stelsel.</p>
<h4>Het Rijk</h4>
<ul>
<li><b>Staten-Generaal</b> (parlement): Tweede Kamer 150 leden, rechtstreeks gekozen; Eerste Kamer 75 leden, indirect gekozen door Provinciale Staten. Zittingsduur 4 jaar. Taken: wetgeving en controle op de regering.</li>
<li><b>Regering</b> = Koning + ministers. De Koning is onschendbaar, de ministers zijn verantwoordelijk. <b>Kabinet</b> = ministers + staatssecretarissen. De <b>ministerraad</b> bestaat alleen uit ministers.</li>
<li>Actief kiesrecht = mogen kiezen; passief kiesrecht = gekozen mogen worden.</li>
</ul>
<h4>Provincie en gemeente</h4>
<ul>
<li>Provinciale Staten maken provinciale verordeningen en kiezen de Eerste Kamer. Gedeputeerde Staten vormen het dagelijks bestuur. De <b>Commissaris van de Koning</b> (kroonbenoeming, 6 jaar) zit beide voor.</li>
<li>De gemeenteraad is het hoogste orgaan en maakt verordeningen zoals de <b>APV</b> (art. 149 Gemeentewet). Ook niet-Nederlanders kunnen meestemmen.</li>
<li>Het college van B&W is het dagelijks bestuur. De <b>burgemeester</b> (kroonbenoeming, 6 jaar) is voorzitter van raad en college en heeft het gezag over de openbare orde. Hij kan een <b>noodverordening</b> vaststellen (art. 176 Gemeentewet); de raad moet die bekrachtigen. Het niet naleven ervan is een overtreding.</li>
</ul>
<h4>Trias politica en soorten wetten</h4>
<ul>
<li>De macht is verdeeld over de wetgevende, uitvoerende en rechterlijke macht.</li>
<li><b>Wet in formele zin</b>: gemaakt door regering en Staten-Generaal samen. Alle andere algemeen verbindende voorschriften (AMvB, ministeriële regeling, provinciale en gemeentelijke verordening, keur) zijn wetten in <b>materiële zin</b>.</li>
<li>Lagere regels mogen niet in strijd zijn met hogere regels.</li>
</ul>`},
{id:"recht", deel:"Algemene rechtskennis", titel:"Recht, rechtsbronnen en het Wetboek van Strafrecht", kb:"7–8, 26", dia:"97, 200", html:`
<ul>
<li><b>Publiekrecht</b> (staatsrecht, strafrecht, bestuursrecht) regelt de verhouding overheid–burger. <b>Privaatrecht</b> regelt de verhoudingen tussen burgers onderling.</li>
<li>Vier <b>rechtsbronnen</b>: wet, gewoonte, verdrag en jurisprudentie.</li>
<li>Het Wetboek van Strafrecht heeft drie boeken: <b>1</b> algemene bepalingen, <b>2</b> misdrijven, <b>3</b> overtredingen. Door de slotbepaling (art. 91 Sr) gelden de algemene bepalingen ook voor andere wetten en verordeningen, tenzij een wet anders bepaalt.</li>
<li>Het Wetboek van Strafvordering regelt de hele strafprocedure, van eerste vermoeden tot de uitvoering van de straf. Het doel is <b>waarheidsvinding</b>.</li>
<li><b>Legaliteitsbeginsel</b> (art. 1 Sr): geen straf zonder voorafgaande wettelijke strafbepaling. Bij een wetswijziging geldt de voor de verdachte gunstigste bepaling.</li>
<li><b>Territorialiteitsbeginsel</b> (art. 2 Sr): de Nederlandse strafwet geldt voor iedereen die in Nederland (inclusief de 12-mijlszone) een strafbaar feit pleegt. Het <b>vlagbeginsel</b> breidt dat uit naar Nederlandse schepen en vliegtuigen.</li>
</ul>`},
{id:"boa", deel:"Algemene rechtskennis", titel:"Opsporingsambtenaren en de boa", kb:"9–12", dia:"53–65", html:`
<ul>
<li><b>Art. 141 Sv</b>: algemene opsporingsambtenaren (OvJ, politie, aangewezen KMar, bijzondere opsporingsdiensten). Bevoegd voor alle strafbare feiten.</li>
<li><b>Art. 142 Sv</b>: buitengewoon opsporingsambtenaren. Bevoegd voor de feiten uit hun akte en domein (I openbare ruimte, II milieu/welzijn/infra, III onderwijs, IV openbaar vervoer, V werk en inkomen, VI generieke opsporing), en alleen voor zover die met hun functie te maken hebben.</li>
<li><b>Voorwaarden</b> (Besluit boa): een titel (akte, categoriale aanwijzing of aanwijzing in wet of verordening), bekwaam, betrouwbaar, beëdigd en het noodzaakcriterium.</li>
<li>De <b>akte</b> vermeldt de strafbare feiten, het grondgebied, eventuele politiebevoegdheden (art. 7 lid 1, 3 en 4 Politiewet) en de geldigheidsdatum. Voor politiebevoegdheden is jaarlijkse toetsing (RTGB) een voorwaarde.</li>
<li><b>Instructie</b>: alleen optreden binnen je bevoegdheid, het insigne zichtbaar dragen, je desgevraagd direct legitimeren, standplaats en aktenummer in elk pv vermelden en aanwijzingen van de (direct) toezichthouder opvolgen.</li>
<li><b>Toezicht</b>: de hoofdofficier van justitie is toezichthouder; de korpschef (of politiechef in mandaat) is direct toezichthouder. De boa moet samenwerken met de politie (art. 10 Politiewet).</li>
<li>De bevoegdheid vervalt of wordt beëindigd bij onder meer het vervallen van de titel, gebrek aan bekwaamheid of betrouwbaarheid, einde van de functie of misbruik van bevoegdheden.</li>
</ul>`},
{id:"politie", deel:"Algemene rechtskennis", titel:"De politie en politiebevoegdheden", kb:"12–15", dia:"66–75", html:`
<ul>
<li>Ambtenaren van politie (art. 2 Politiewet): executief, administratief/technisch, vrijwilligers en de rijksrecherche.</li>
<li>De politieambtenaar is bevoegd in heel Nederland, maar treedt in beginsel op in zijn eigen gebied (art. 6).</li>
<li><b>Gezag</b>: burgemeester bij openbare orde en hulpverlening; officier van justitie bij strafrechtelijke handhaving. Het <b>driehoeksoverleg</b> (art. 13) brengt burgemeester, OvJ en politie samen.</li>
<li><b>Art. 7 lid 1</b>: geweld en vrijheidsbeperkende middelen, alleen als het doel dit rechtvaardigt en niet anders bereikt kan worden, zo mogelijk na een waarschuwing.</li>
<li><b>Art. 7 lid 3</b> veiligheidsfouillering: aftasten van kleding en meegevoerde zaken bij onmiddellijk dreigend gevaar. <b>Art. 7 lid 4</b> vervoersfouillering: standaard bij vervoer of insluiting.</li>
<li><b>Art. 7 lid 7</b>: alles moet redelijk en gematigd zijn. <b>Art. 7 lid 9</b>: de minister kan deze bevoegdheden aan boa's toekennen.</li>
</ul>`},
{id:"om", deel:"Algemene rechtskennis", titel:"Openbaar Ministerie, hulpofficier en rechter-commissaris", kb:"16–17, 69–71", dia:"77, 244–257", html:`
<ul>
<li>Het <b>College van procureurs-generaal</b> (3 tot 5 PG's) is het hoofd van het OM en bepaalt samen met de minister het opsporings- en vervolgingsbeleid.</li>
<li>De <b>officier van justitie</b> leidt het opsporingsonderzoek, geeft bevelen aan opsporingsambtenaren en neemt strafvorderlijke beslissingen. Voor zware bevoegdheden heeft hij de rechter-commissaris nodig.</li>
<li>De <b>hulpofficier van justitie</b> is geen lid van het OM. Meestal is het een hogere politieambtenaar die namens de OvJ optreedt.</li>
<li>De <b>rechter-commissaris</b> houdt toezicht op het vooronderzoek en beslist onder meer over bewaring en doorzoeking van een woning.</li>
<li><b>Vervolgen</b> = de rechter bij de zaak betrekken, bijvoorbeeld met een dagvaarding. Het OM kan afzien van vervolging om redenen van algemeen belang (art. 167 Sv).</li>
<li>Met een <b>strafbeschikking</b> straft de OvJ zelf bij overtredingen en misdrijven tot 6 jaar: taakstraf (max. 180 uur), geldboete, onttrekking aan het verkeer, schadevergoeding of rijontzegging (max. 6 maanden). Vrijheidsbeneming kan niet.</li>
</ul>`},
{id:"ambt", deel:"Algemene rechtskennis", titel:"Ambtseed en strafbare feiten door de ambtenaar", kb:"17–20", dia:"219–228", html:`
<ul>
<li>Eed en belofte zijn juridisch gelijk. Bij beëdiging leg je de <b>eed van zuivering</b> en de ambtseed af.</li>
<li><b>Art. 44 Sr</b>: schendt een ambtenaar een bijzondere ambtsplicht, of gebruikt hij macht, gelegenheid of middel van zijn ambt, dan kan de straf met een derde worden verhoogd (niet de geldboete).</li>
<li><b>Omkoping</b>: de burger die een ambtenaar een gift, belofte of dienst aanbiedt pleegt een commuun delict (art. 177 Sr). Aanbieden is al genoeg. De ambtenaar die aanneemt of vraagt, pleegt een ambtsmisdrijf (art. 363 Sr).</li>
<li><b>Meineed</b> (art. 207 Sr): opzettelijk een valse verklaring onder ede afleggen, ook schriftelijk in een pv.</li>
<li><b>Valsheid in geschrift</b> (art. 225 Sr): een bewijsstuk valselijk opmaken of vervalsen om het als echt te gebruiken.</li>
<li><b>Huisvredebreuk</b> (art. 138 Sr): wederrechtelijk binnendringen, of niet vertrekken na een vordering van de rechthebbende. Pleegt een ambtenaar dit buiten zijn bevoegdheid of zonder de wettelijke vormen, dan is het <b>ambtelijke huisvredebreuk</b> (art. 370 Sr).</li>
</ul>`},
{id:"privacy", deel:"Algemene rechtskennis", titel:"Persoonsgegevens: AVG, Wpg en BRP", kb:"20–24", dia:"230–234", html:`
<ul>
<li>Bij <b>strafrechtelijke handhaving</b> verwerkt een boa gegevens onder de <b>Wet politiegegevens</b> (Wpg). Bij toezicht en bestuursrechtelijke handhaving geldt de <b>AVG</b>.</li>
<li>Een <b>persoonsgegeven</b> is alle informatie over een geïdentificeerde of identificeerbare levende persoon. Bijzondere persoonsgegevens (zoals gezondheid, religie, ras) zijn extra beschermd.</li>
<li><b>Verwerken</b> omvat ook verzamelen, vastleggen, raadplegen en delen. Raadplegen mag alleen als het nodig is voor je taak, nooit uit nieuwsgierigheid. Raadplegingen worden vastgelegd.</li>
<li>Verwerkingsverantwoordelijke bij de politie is de korpschef. De <b>Autoriteit Persoonsgegevens</b> houdt toezicht op de AVG, de Wpg en de Wet BRP.</li>
<li>De BRP bevat persoonsgegevens van ingezetenen en niet-ingezetenen. Gemeenten verstrekken geen BRP-gegevens aan commerciële partijen of particulieren.</li>
<li>Voorbeeld uit het boekje: een afvalzak bestuursrechtelijk afhandelen valt onder de AVG; strafrechtelijk afhandelen onder de Wpg.</li>
</ul>`},
{id:"aangifte", deel:"Algemene rechtskennis", titel:"Aangifte, klacht en verjaring", kb:"24–25", dia:"", html:`
<ul>
<li><b>Aangifte</b>: mondeling of schriftelijk, door iedereen, bij elke bevoegde opsporingsambtenaar. Je moet een aangifte opnemen. Een aangifte kan niet worden ingetrokken. Een valse aangifte is strafbaar.</li>
<li><b>Klacht</b> = aangifte met een verzoek tot vervolging. De klager is 16 jaar of ouder en de benadeelde. De OvJ of hulpOvJ neemt de klacht in ontvangst. Intrekken kan binnen 8 dagen.</li>
<li><b>Absolute klachtdelicten</b> vragen altijd een klacht (bijvoorbeeld belediging). <b>Relatieve klachtdelicten</b> (vooral vermogensdelicten) vragen alleen een klacht als dader en slachtoffer familie zijn tot en met de tweede graad.</li>
<li><b>Verjaring</b>: overtredingen na 3 jaar; misdrijven tot 3 jaar na 6 jaar; zwaardere misdrijven na 12 of 20 jaar; misdrijven waarop 12 jaar of meer staat verjaren niet.</li>
</ul>`},
{id:"strafbaar", deel:"Algemene rechtskennis", titel:"Het strafbare feit, schuld en strafuitsluiting", kb:"27–31", dia:"200–203", html:`
<ul>
<li>Een <b>strafbaar feit</b> is een bewezen menselijke gedraging die valt binnen een wettelijke delictsomschrijving, wederrechtelijk is en aan schuld te wijten.</li>
<li>Een strafbepaling bestaat uit de <b>norm</b> (met bestanddelen), de <b>sanctie</b> en vaak een <b>kwalificatie</b> (naam), zoals bij doodslag (art. 287 Sr).</li>
<li><b>Opzet</b> = willens en wetens ('wetende dat', 'met het oogmerk'). <b>Schuld in enge zin</b> = grove onachtzaamheid ('redelijkerwijs moest vermoeden'). Bij overtredingen wordt schuld aangenomen tot het tegendeel blijkt.</li>
<li><b>Rechtvaardigingsgronden</b> (feit niet strafbaar): noodweer, noodtoestand, wettelijk voorschrift, bevoegd ambtelijk bevel.</li>
<li><b>Schulduitsluitingsgronden</b> (dader niet strafbaar): ontoerekeningsvatbaarheid, psychische overmacht, noodweerexces, onbevoegd bevel te goeder trouw, en AVAS (Melk-en-waterarrest).</li>
<li>Bij een strafuitsluitingsgrond volgt <b>ontslag van alle rechtsvervolging</b> (OVAR).</li>
<li>Hoofdstraffen: gevangenisstraf, hechtenis, taakstraf en geldboete.</li>
</ul>`},
{id:"deelneming", deel:"Algemene rechtskennis", titel:"Poging, voorbereiding, deelneming en samenloop", kb:"30–33", dia:"204–208", html:`
<ul>
<li>Alleen <b>poging tot een misdrijf</b> is strafbaar, en alleen bij een begin van uitvoering. Wie vrijwillig stopt, is niet strafbaar voor de poging. Vormen: gewone, voltooide en ondeugdelijke poging.</li>
<li><b>Voorbereiding</b> is alleen strafbaar bij misdrijven waarop 8 jaar of meer staat.</li>
<li>Als <b>dader</b> worden gestraft: pleger, medepleger (bewuste samenwerking), doen pleger (de uitvoerder is zelf niet strafbaar) en uitlokker (beide strafbaar; middelen zoals giften, beloften, bedreiging, misleiding).</li>
<li><b>Medeplichtig</b> is wie opzettelijk helpt bij of vóór een misdrijf, zonder zelf uit te voeren. Maximum min een derde. Medeplichtigheid aan een overtreding is niet strafbaar. Uitlokking: het initiatief ligt bij de uitlokker. Medeplichtigheid: het initiatief ligt bij de pleger.</li>
<li>Ook <b>rechtspersonen</b> (publiek- en privaatrechtelijk) kunnen strafbare feiten plegen.</li>
<li><b>Eendaadse samenloop</b>: één gedraging valt onder meerdere bepalingen; de zwaarste geldt. Een <b>bijzondere bepaling</b> gaat voor de algemene.</li>
</ul>`},
{id:"bevoegd", deel:"Algemene rechtskennis", titel:"Bevoegdheden, toezicht en jeugd", kb:"34–38", dia:"120–124, 173–178", html:`
<ul>
<li><b>Opsporing</b> gebeurt onder gezag van de OvJ, tegen een verdachte, met als doel strafvorderlijke beslissingen. <b>Toezicht</b> (Awb) gebeurt zonder verdenking; betrokkenen moeten meewerken.</li>
<li><b>Wetmatig</b> = volgens de wet. <b>Rechtmatig</b> = ook volgens de beginselen: subsidiariteit, proportionaliteit, fair play en geen détournement de pouvoir.</li>
<li>Een verdachte hoeft niet mee te werken, maar moet de bevoegdheden wel <b>gedogen</b>. Verzet met geweld is wederspannigheid; passief op de grond gaan liggen niet.</li>
<li>Toestemming telt alleen als die vrijwillig is gegeven door iemand die bevoegd is en weet dat hij niet hoeft mee te werken.</li>
<li><b>Herhaalde toepassing</b> mag bij nieuwe feiten of omstandigheden. <b>Voortgezette toepassing</b>: stuit je tijdens toezicht toevallig op een strafbaar feit waarvoor je bevoegd bent, dan mag je overstappen naar opsporing (Geweerarrest).</li>
<li><b>Jeugd</b>: onder 12 jaar geen vervolging, wel opsporing en ophouden (max. 6 uur). Van 12 tot 18 jaar geldt het jeugdstrafrecht. Bij <b>Halt</b> beslist de OvJ; de jongere bekent en stemt in, en de ouders worden betrokken.</li>
</ul>
<p class="lo">Let op: het Kennisboekje noemt bij Halt '3x 20 uur'. Volgens art. 77e Sr bedraagt een Halt-afdoening ten hoogste 20 uur.</p>`},
{id:"tegenambt", deel:"Algemene rechtskennis", titel:"Misdrijven tegen de ambtenaar", kb:"38–41", dia:"210–217", html:`
<ul>
<li><b>Ambtsdwang</b> (art. 179 Sr): met geweld of bedreiging een ambtenaar dwingen iets te doen of na te laten, voordat hij begonnen is.</li>
<li><b>Wederspannigheid</b> (art. 180 Sr): verzet met geweld of bedreiging tegen een ambtenaar (of zijn helpers) die rechtmatig bezig is.</li>
<li><b>Art. 184 Sr</b>: opzettelijk niet voldoen aan een bevel of vordering van een toezichthouder of opsporingsambtenaar, of zijn handeling beletten (onmogelijk maken), belemmeren (moeilijker maken) of verijdelen (laten mislukken). Max. 3 maanden of 2e categorie.</li>
<li><b>Opschudding</b> (art. 185 Sr): opschudding veroorzaken waar een ambtenaar in het openbaar werkt, en niet vertrekken na een bevel.</li>
<li><b>Belediging</b> is een absoluut klachtdelict (art. 269 Sr), behalve belediging van een ambtenaar in functie (art. 267 Sr): die is ambtshalve vervolgbaar en wordt met een derde verzwaard.</li>
<li>Bedreiging van een ambtenaar is een apart aandachtspunt in de dia's (210–212).</li>
</ul>`},
{id:"identiteit", deel:"Algemene rechtskennis", titel:"Identiteit vaststellen en staande houden", kb:"41–49", dia:"125–127", html:`
<ul>
<li><b>Staande houden</b> (art. 52 Sv): elke opsporingsambtenaar mag een verdachte kort ophouden om zijn identiteit vast te stellen. Hij mag met gepast geweld worden tegengehouden. Een getuige mag niet staande worden gehouden, maar je mag wel zijn ID vorderen.</li>
<li>Art. 27a Sv: gevraagd worden naam, voornamen, geboorteplaats en -datum, BRP-adres en verblijfadres. Zwijgen is niet strafbaar; <b>valse gegevens</b> opgeven wel (art. 435 lid 4 Sr).</li>
<li>Bij staandehouding of aanhouding moet je meedelen <b>voor welk feit</b> iemand verdachte is (art. 27c Sv).</li>
<li><b>Toonplicht</b> vanaf 14 jaar (art. 2 Wid) op vordering van politie, boa (art. 8 lid 2 Politiewet) of toezichthouder (art. 5:16a Awb), als dat nodig is voor de taak. Weigeren is strafbaar (art. 447e Sr).</li>
<li>Geldige ID-bewijzen (art. 1 Wid): paspoort, Nederlandse of EU-identiteitskaart, vreemdelingendocument, rijbewijs.</li>
<li>Identiteitsfouillering (art. 55b Sv): kleding en bagage onderzoeken om de identiteit vast te stellen. Lukt vaststelling niet, dan kan aanhouding volgen bij heterdaad of een VH-feit.</li>
<li>Een vals ID gebruiken of voorhanden hebben is strafbaar (art. 231 lid 2 Sr).</li>
</ul>`},
{id:"aanhouden", deel:"Algemene rechtskennis", titel:"Aanhouden, ophouden en verder vasthouden", kb:"50–56", dia:"128–131", html:`
<ul>
<li><b>Heterdaad</b>: ontdekking tijdens of kort na het plegen. Dan mag <b>iedereen</b> aanhouden, voor misdrijven én overtredingen. Een burger draagt de verdachte onverwijld over.</li>
<li><b>Buiten heterdaad</b> alleen bij een VH-feit (art. 67 Sv: 4 jaar of meer en genoemde feiten): op bevel van de OvJ; zo niet, dan van de hulpOvJ; kan ook dat niet worden afgewacht, dan zelfstandig.</li>
<li>De verdachte wordt zo snel mogelijk <b>voorgeleid</b> aan de (hulp)OvJ, die de aanhouding toetst.</li>
<li><b>Ophouden voor onderzoek</b>: max. 6 uur, bij een VH-feit 9 uur. De uren tussen 00:00 en 09:00 tellen niet mee. Ophouden voor identificatie: nog eens max. 6 uur bij niet-VH-feiten.</li>
<li><b>Inverzekeringstelling</b>: bij VH-feiten, 3 dagen, eenmaal te verlengen met 3 dagen door de OvJ. Daarna voorgeleiding bij de rechter-commissaris: <b>bewaring</b> max. 14 dagen, daarna gevangenhouding (max. 90 dagen totaal).</li>
<li>Na 110 dagen voorarrest moet de zaak op zitting komen (eventueel pro forma).</li>
</ul>`},
{id:"verhoor", deel:"Algemene rechtskennis", titel:"Verhoor, rechtsbijstand en de raadsman", kb:"35, 43, 57–59", dia:"98–115", html:`
<ul>
<li><b>Verdachte</b> (art. 27 Sv): iemand tegen wie uit feiten of omstandigheden een redelijk vermoeden van schuld volgt. Na vervolging: degene tegen wie de vervolging is gericht.</li>
<li>Vóór het verhoor: <b>cautie</b> (art. 29 Sv). Zonder cautie kan de verklaring niet als bewijs worden gebruikt. Vragen naar identiteit zijn geen verhoor.</li>
<li>De niet-aangehouden verdachte wordt vóór het eerste verhoor gewezen op rechtsbijstand en, indien nodig, tolk en vertaling.</li>
<li><b>Consultatiebijstand</b> (Salduz): een gesprek met een advocaat vóór het eerste verhoor. <b>Verhoorbijstand</b>: de advocaat is bij het verhoor aanwezig. Afstand doen kan alleen ondubbelzinnig, met uitleg over de gevolgen, en moet in het pv worden vastgelegd. De verdachte kan er altijd op terugkomen.</li>
<li>Een <b>minderjarige</b> aangehouden verdachte kan geen afstand doen van consultatiebijstand (art. 489 Sv). De hulpOvJ licht de ouders in.</li>
<li>De raadsman heeft <b>vrij verkeer</b> met de aangehouden verdachte en recht op kennisneming van de processtukken.</li>
</ul>`},
{id:"fouilleren", deel:"Algemene rechtskennis", titel:"Fouilleren en inbeslagnemen", kb:"60–63", dia:"133–143, 161–162", html:`
<ul>
<li>Art. 11 Gw beschermt de lichamelijke integriteit. <b>Strafvorderlijke fouillering</b> (art. 56 Sv) bij een aangehouden verdachte tegen wie ernstige bezwaren bestaan: aan de kleding (opsporingsambtenaar), aan het lichaam (bevel (hulp)OvJ) en in het lichaam (OvJ, door een arts). Zoveel mogelijk door iemand van hetzelfde geslacht.</li>
<li><b>Inbeslagneming</b> (art. 134 Sv) = een voorwerp onder je nemen of houden voor de strafvordering. Veiligstellen is ook inbeslagnemen.</li>
<li><b>Vatbaar</b> (art. 94 Sv): voorwerpen die de waarheid aan het licht brengen, wederrechtelijk voordeel aantonen, of die verbeurd verklaard of aan het verkeer onttrokken kunnen worden.</li>
<li><b>Art. 95 Sv</b>: bij staande houden of aanhouden mag je vatbare voorwerpen die de verdachte bij zich heeft in beslag nemen. Bij heterdaad of een VH-feit mag je daarvoor plaatsen betreden en zoekend rondkijken; anders bevries je de situatie.</li>
<li>Je maakt een <b>kennisgeving van inbeslagneming</b> en geeft een bewijs van ontvangst. Vrijwillige afstand gebeurt schriftelijk (art. 116 Sv). Is het belang weg, dan wordt het voorwerp teruggegeven.</li>
<li>Bezitter, houder en eigenaar zijn verschillende begrippen: een lener is houder, geen bezitter.</li>
</ul>`},
{id:"woning", deel:"Algemene rechtskennis", titel:"Plaatsen betreden en binnentreden in een woning", kb:"52–53, 64–65", dia:"117–119, 132", html:`
<ul>
<li><b>Ter aanhouding</b> (art. 55 Sv): bij heterdaad van een misdrijf mag iedereen elke plaats betreden, behalve een woning zonder toestemming en de beschermde plaatsen. Een opsporingsambtenaar mag dat bij heterdaad en buiten heterdaad.</li>
<li><b>Beschermde plaatsen</b> (art. 12 Awbi): vergaderingen van Staten-Generaal, Provinciale Staten en gemeenteraad, godsdienstige of levensbeschouwelijke bijeenkomsten en terechtzittingen. Buiten heterdaad mag je daar tijdens het gebruik niet binnen.</li>
<li><b>Doorzoeken ter aanhouding</b> (art. 55a Sv): met een (mondelinge) machtiging van de OvJ, of bij dringende noodzaak zonder, met achteraf melding.</li>
<li><b>Woning</b>: een afgesloten plaats voor het privé huiselijk leven, ook een tent of slaapschuur. Bij meerdere bewoners gaat weigering voor toestemming.</li>
<li>Zonder toestemming heb je een <b>machtiging</b> nodig: van de AG, de OvJ of de hulpOvJ (strafvorderlijk) of de burgemeester (andere doelen). Geldig op de dag van afgifte plus drie dagen. Rechters, OM-leden, burgemeesters en deurwaarders hebben geen machtiging nodig.</li>
</ul>`},
{id:"pv", deel:"Algemene rechtskennis", titel:"Proces-verbaal en bewijs", kb:"66–68", dia:"145–159, 260", html:`
<ul>
<li><b>Wettige bewijsmiddelen</b> (art. 339 Sv): eigen waarneming van de rechter, verklaringen van verdachte, getuige en deskundige, en schriftelijke bescheiden. Feiten van algemene bekendheid hoeven niet bewezen te worden.</li>
<li><b>Verbaliseringsplicht</b> (art. 152 Sv): zo snel mogelijk pv opmaken van wat je opspoorde of deed. Het OM kan daarvan afzien.</li>
<li>Art. 153 Sv: het pv wordt op ambtseed opgemaakt, persoonlijk, gedateerd en ondertekend, met <b>redenen van wetenschap</b> (hoe je het weet).</li>
<li>De verklaring van de verdachte zoveel mogelijk in zijn eigen woorden, liefst in vraag-en-antwoordvorm (art. 29a Sv). Hij mag opmerkingen maken en tekent als hij het eens is.</li>
<li>Pv's, aangiften en inbeslaggenomen voorwerpen gaan onverwijld naar de hulpOvJ of OvJ (art. 156 Sv).</li>
<li>De dia's behandelen ook de opbouw: waarnemen en ondervinden, de 7 W's, mededelingen aan de verdachte, bevoegdheden beschrijven en daderwetenschap.</li>
</ul>`},
{id:"rechtspraak", deel:"Algemene rechtskennis", titel:"De rechterlijke macht", kb:"72–74", dia:"236–245, 258–261", html:`
<ul>
<li>Vrijheidsstraffen kunnen alleen door de rechter worden opgelegd (art. 113 Gw). Gerechten: <b>11 rechtbanken</b>, <b>4 gerechtshoven</b> en de <b>Hoge Raad</b> (art. 2 Wet RO).</li>
<li>Rechters en de PG bij de Hoge Raad worden voor het leven benoemd (art. 117 Gw). Zittingen en uitspraken zijn in beginsel openbaar en vonnissen zijn gemotiveerd (art. 121 Gw).</li>
<li>Zittende magistratuur = rechters; staande magistratuur = OM.</li>
<li>Rechtbank: kantonrechter (overtredingen), politierechter (misdrijven, max. 1 jaar), kinderrechter (12–18 jaar), meervoudige kamer (3 rechters, zwaardere zaken). De uitspraak heet <b>vonnis</b>.</li>
<li>Gerechtshof: hoger beroep, raadsheren, werkgebied ressort, uitspraak <b>arrest</b>. Hoge Raad: <b>cassatie</b>, alleen rechtsvragen.</li>
<li>Absolute competentie = welk soort gerecht; relatieve competentie = welk gerecht geografisch.</li>
</ul>`},
{id:"bestuur", deel:"Algemene rechtskennis", titel:"Bestuursrecht en bestuurlijke sancties", kb:"", dia:"173–198", html:`
<ul>
<li>Strafrecht richt zich op de dader en straf. Bestuursrecht richt zich op de norm: normstelling, toezicht en sancties. Civiel recht gaat over twee gelijke partijen.</li>
<li>De <b>Awb</b> geeft algemene regels voor besluiten, bezwaar en beroep, toezicht en sancties. Bijzondere wetten (zoals de Gemeentewet en APV) vullen dat aan.</li>
<li>Begrippen: <b>besluit</b> (algemeen), <b>beschikking</b> (voor één partij), belanghebbende, overtreder en feitelijk handelen (zoals toezicht; daartegen geen bezwaar).</li>
<li><b>Herstelsancties</b>: last onder bestuursdwang en last onder dwangsom. <b>Bestraffende sanctie</b>: bestuurlijke boete. Intrekken van een vergunning kan allebei zijn.</li>
<li>Bezwaar schorst een sanctie niet; een voorlopige voorziening bij de rechter kan dat wel. Bij een bestraffende sanctie hoeft de betrokkene geen verklaring af te leggen (art. 5:10a Awb) en dat moet je vooraf meedelen.</li>
</ul>`},
{id:"ruimte", deel:"Openbare ruimte (domein I)", titel:"APV, verkeer en bijzondere wetten", kb:"", dia:"", html:`
<p>De toetsmatrijs Wet- en regelgeving Domein I (ExTH, versie 1.3) toetst naast strafrecht en bestuursrecht ook de APV en een aantal bijzondere wetten. Gemeenten kunnen van de Model-APV afwijken; de nummers hieronder zijn die van de Model-APV.</p>
<h4>Gemeente en samenwerking</h4>
<ul>
<li>De <b>gemeenteraad</b> stelt verordeningen vast, zoals de APV. De <b>burgemeester</b> handhaaft de openbare orde (art. 172 Gemeentewet), kan bij ernstige wanorde of rampen een <b>noodverordening</b> vaststellen (art. 176) en zit het bestuur van de veiligheidsregio voor als hij daartoe is benoemd.</li>
<li><b>Inzetcriterium</b> (Beleidsregels boa): de boa handelt leefbaarheidsfeiten af die direct te constateren, eenvoudig bewijsbaar en feitgecodeerd af te doen zijn. Bij geweld, veelplegers, aanzienlijke schade of een te verwachten gevaarlijke setting is de politie aan zet.</li>
<li>Ketenpartners: Openbaar Ministerie, brandweer, milieubeheerders, wegbeheerders, Nederlandse Arbeidsinspectie, NVWA (voedsel en producten) en het RIEC (aanpak ondermijning).</li>
</ul>
<h4>APV</h4>
<ul>
<li>Begrippen (art. 1:1): <b>openbare plaats</b> (staat krachtens bestemming of vast gebruik open voor publiek), <b>weg</b> (zoals in de Wegenverkeerswet, inclusief voetpaden, fietspaden en bermen), bebouwde kom, handelsreclame en openbaar water.</li>
<li>Openbare orde: samenscholing en wanordelijkheden (2:1), straatartiesten op aangewezen plaatsen (2:9), plakken en kladden zonder toestemming van de eigenaar (2:42), hinderlijk gedrag (2:47), alcohol drinken in een aangewezen gebied (2:48), drugshandel en drugsgebruik op straat (2:74 en 2:74a), geluidhinder (4:6) en wildplassen (4:8).</li>
<li>Honden: aanlijnen binnen de bebouwde kom behalve op losloopplaatsen, poep direct opruimen en een opruimmiddel bij je hebben (2:57 en 2:58); de burgemeester kan een aanlijn- of muilkorfgebod opleggen voor een gevaarlijke hond.</li>
<li>Vergunning nodig voor collecteren (5:13), een standplaats (5:18) en een snuffelmarkt (5:23). Venten kan op aangewezen plaatsen of tijden verboden zijn (5:14 en 5:15).</li>
<li>Parkeren: een defect voertuig of een kampeermiddel niet langer dan drie dagen op de weg (5:5 en 5:6); een voertuig langer dan 6 meter of hoger dan 2,40 meter niet buiten aangewezen plaatsen (5:8). Vuur stoken en afval verbranden buiten een inrichting is verboden (5:34).</li>
</ul>
<h4>Verkeer</h4>
<ul>
<li><b>Parkeren</b> is stilstaan langer dan nodig voor het onmiddellijk in- of uitstappen of laden en lossen (art. 1 RVV 1990). Parkeren binnen 5 meter van een kruispunt is verboden (art. 24). Bij een parkeerverbod (E1) mag je nog in- en uitstappen of laden en lossen, bij een verbod stil te staan (E2) niet.</li>
<li>Aanwijzingen van bevoegde personen moet je opvolgen (art. 82 RVV 1990); ze gaan voor op verkeerslichten, borden en regels.</li>
<li>Wegslepen: het overbrengen en bewaren van voertuigen gebeurt op last van een bevoegde ambtenaar; de kosten zijn voor de eigenaar of houder (art. 170 t/m 174 WVW 1994).</li>
</ul>
<h4>Bijzondere wetten</h4>
<ul>
<li><b>Alcoholwet</b>: een minderjarige mag op een publiek toegankelijke plaats geen alcohol aanwezig hebben, ook niet in een dichte fles (art. 45). Een meerderjarige mag daar geen alcohol doorgeven aan een minderjarige (wederverstrekking, art. 45a).</li>
<li><b>Winkeltijdenwet</b>: winkels zijn gesloten op zon- en feestdagen en vóór 06.00 en na 22.00 uur (art. 2), tenzij de gemeenteraad bij verordening vrijstelling of ontheffing regelt (art. 3).</li>
<li><b>Wet op de economische delicten</b>: extra bevoegdheden bij economische delicten, zoals inbeslagneming, inzage van zakelijke gegevens, toegang tot plaatsen en onderzoek van zaken en vervoermiddelen (art. 18 t/m 23), en een medewerkingsplicht (art. 24a).</li>
<li><b>Omgevingswet</b>: een lozingsactiviteit is het lozen van stoffen in oppervlaktewater; storten of in de bodem brengen van bedrijfsafval of gevaarlijke stoffen is verboden (Bal); afval van een activiteit moet rond de locatie worden opgeruimd (bruidsschat).</li>
<li><b>Visserijwet 1963</b>: wie vist, moet een geldige schriftelijke toestemming van de rechthebbende bij zich hebben, zoals de VISpas (art. 23). <b>Wet milieubeheer</b>: bedrijfsafval mag niet als huishoudelijk afval worden aangeboden; het bedrijf is strafbaar (art. 10.37).</li>
</ul>`},
{id:"wpbegrip", deel:"Openbaar vervoer (domein IV)", titel:"Wet personenvervoer 2000: begrippen en concessie", kb:"75–84", dia:"8–22", html:`
<ul>
<li><b>Openbaar vervoer</b> (art. 1 Wp2000): voor iedereen openstaand personenvervoer volgens een <b>dienstregeling</b> met auto, bus, trein, metro, tram of geleid voertuig. Besloten busvervoer is busvervoer dat geen openbaar vervoer is (bijvoorbeeld een schoolbus).</li>
<li>Een <b>bus</b> is ingericht voor meer dan acht personen, de bestuurder niet meegerekend; het gaat om de capaciteit, niet het aantal reizigers.</li>
<li>De <b>vervoerder</b> is het bedrijf dat het vervoer verricht (bijvoorbeeld NS, Arriva, RET). Een <b>concessie</b> is het alleenrecht op OV in een gebied gedurende een periode. Een <b>concessiehouder</b> is een vergunninghoudende vervoerder met concessie.</li>
<li>De wet geldt voor OV, besloten busvervoer en taxi over de weg, OV over rails en langs geleidesystemen (art. 2). Uitzonderingen in art. 2 Bp2000, zoals militair, politie-, ambulance- en trouwvervoer.</li>
<li>Verboden: busvervoer zonder communautaire vergunning (art. 7) en OV zonder concessie (art. 19). Concessievoorschriften moeten de veiligheid van reizigers en personeel waarborgen (art. 32 lid 2 sub h), onder meer door boa's in te zetten.</li>
<li>De concessiehouder moet reizigers met een geldig vervoerbewijs vervoeren (art. 30 lid 3) en zorgt bij langere verstoringen voor vervangend vervoer (art. 34).</li>
</ul>`},
{id:"ovbewijs", deel:"Openbaar vervoer (domein IV)", titel:"Het vervoerbewijs: art. 70 Wp2000 en art. 45–49 Bp2000", kb:"85–90", dia:"23–28", html:`
<ul>
<li><b>Art. 70 Wp2000</b>: verboden zonder geldig vervoerbewijs gebruik te maken van het OV en, als de vervoerder dat duidelijk maakt, van de voorzieningen (zoals het deel achter de poortjes).</li>
<li><b>Art. 47 Bp2000</b>: zorg vóór het instappen of het betreden van het afgesloten deel voor een geldig elektronisch vervoerbewijs. Het is geldig als het van de concessiehouder is, het saldo of product toereikend is en het <b>vertrekpunt is geregistreerd</b> (ingecheckt), en als het op naam staat van de houder. Een bewerkt vervoerbewijs is ongeldig.</li>
<li><b>Uitzonderingen</b> (art. 45 Bp2000): kinderen onder 4 jaar onder begeleiding zonder eigen zitplaats (niet in de trein), één begeleider van minstens 12 jaar van iemand met een gehandicaptenlegitimatie, en toezichthouders en opsporingsambtenaren tijdens hun taak.</li>
<li><b>Art. 48 Bp2000</b>: wie geen geldig vervoerbewijs toont, betaalt de ritprijs plus een vast bedrag (volgens het boekje € 50). Niet direct betaald? Dan 14 dagen, en daarna nog 14 dagen met administratiekosten (volgens het boekje € 15). Na betaling vervalt de strafvervolging voor art. 70 (grondslag: art. 102 Wp2000).</li>
<li>Bij <b>fraude</b> (bewerkt vervoerbewijs, misbruik, controle belemmeren) kan altijd pv volgen op grond van art. 71 Wp2000.</li>
<li><b>Art. 49 Bp2000</b>: wie nog een openstaande schuld heeft, krijgt geen vervoerbewijs op naam.</li>
</ul>`},
{id:"ovorde", deel:"Openbaar vervoer (domein IV)", titel:"Fraude, orde en aanwijzingen: art. 71–74 Wp2000 en art. 52–53 Bp2000", kb:"90–94", dia:"29–34", html:`
<ul>
<li><b>Art. 71</b>: verboden een bewerkt vervoerbewijs te gebruiken, een vervoerbewijs te misbruiken (zoals reizen op andermans kaart) of de controle te belemmeren of verhinderen.</li>
<li><b>Art. 72</b>: verboden zich in een voertuig of in of bij een station of halte zo te gedragen dat orde, rust, veiligheid of een goede bedrijfsgang wordt of <b>kan worden</b> verstoord. Een waarschuwing kan soms volstaan.</li>
<li><b>Art. 52 Bp2000</b> somt op wat verstoring is, onder meer: personeel of voorzieningen hinderen (a), misbruik van voorzieningen (b), iets uit het voertuig gooien (c), kennelijk dronken of onder invloed (d), vuurwerk of hinderlijk geluid (e), beroep of diensten uitoefenen (f), reclame, folders, bedelen of collecteren (g), hinderlijke dieren of voorwerpen (h), roken waar dat verboden is (i), in een gesloten station of afgesloten deel zijn (j), niet de aangewezen route nemen (k) en overige hinder of gevaar (l). <b>Sub l</b> gebruik je alleen als niets specifiekers past.</li>
<li>Toestemming van de vervoerder heft het verbod op (lid 2). Vermeld in het pv of er toestemming was.</li>
<li><b>Art. 73</b>: iedereen, ook wie niet reist, moet duidelijk kenbaar gemaakte aanwijzingen van of namens de vervoerder opvolgen. Dat zijn boa's OV, toezichthouders en borden of pictogrammen (art. 53 Bp2000). Neem de aanwijzing <b>woordelijk</b> op in het pv.</li>
<li><b>Art. 74</b> is de grondslag voor de nadere regels in het Bp2000.</li>
</ul>`},
{id:"ovstraf", deel:"Openbaar vervoer (domein IV)", titel:"Strafbepalingen in het OV: art. 101 Wp2000", kb:"95–96", dia:"35–36", html:`
<ul>
<li>Overtreding van de artikelen 70 tot en met 73 en van een ontzegging (art. 98 lid 4) is een <b>overtreding</b>: max. 2 maanden hechtenis of een geldboete van de 2e categorie.</li>
<li>Handelt een reiziger in strijd met art. 70 of 71 en voldoet hij niet aan de identificatieplicht van art. 92, dan stijgt het maximum naar 4 maanden of een boete van de 3e categorie (art. 101 lid 2).</li>
<li>Art. 118 Bp2000 noemt bepalingen die economische delicten zijn (WED).</li>
</ul>`},
{id:"ovtoezicht", deel:"Openbaar vervoer (domein IV)", titel:"Toezicht in het OV: art. 87–90 Wp2000 en de Awb", kb:"96–104", dia:"37–40, 180–186", html:`
<ul>
<li><b>Toezichthouder</b> (art. 5:11 Awb): iemand die bij of krachtens wettelijk voorschrift belast is met toezicht. Op de reizigersregels (art. 70–74) houden ook <b>door de vervoerder aangewezen personen</b> toezicht (art. 87 lid 3), zoals conducteurs. Niet elke toezichthouder is boa.</li>
<li>Vervoersbedrijven en toezichthouders worden gezien als <b>bestuursorgaan</b> (art. 1:1 Awb).</li>
<li><b>5:12</b> legitimatiebewijs bij je dragen en desgevraagd direct tonen. <b>5:13</b> bevoegdheden alleen gebruiken voor zover nodig (evenredigheid). <b>5:14</b> bevoegdheden kunnen worden beperkt; art. 90 Wp2000 sluit <b>5:18</b> (zaken onderzoeken en monsters nemen) uit.</li>
<li><b>5:15</b> elke plaats betreden behalve een woning zonder toestemming (zelf geen geweld, wel de sterke arm). <b>5:16</b> inlichtingen vorderen. <b>5:16a</b> ID vorderen. <b>5:17</b> inzage in en kopie van het vervoerbewijs; meenemen alleen kort en tegen een bewijs.</li>
<li><b>5:20</b>: iedereen moet meewerken; geheimhouders alleen voor zover hun geheimhoudingsplicht reikt. Opzettelijk weigeren is <b>art. 184 Sr</b>.</li>
</ul>`},
{id:"ovopsp", deel:"Openbaar vervoer (domein IV)", titel:"Opsporing in het OV: art. 89–98 Wp2000", kb:"105–110", dia:"41–46", html:`
<ul>
<li><b>Art. 89</b>: naast de algemene opsporingsambtenaren (141 Sv) zijn de WED-ambtenaren belast met opsporing (lid 1). Boa's OV worden aangewezen door de ministers van IenW en JenV samen (lid 2). Wat een boa precies mag opsporen, staat in zijn aanwijzing; dat kan per vervoerder verschillen.</li>
<li><b>Art. 91</b>: de Awb-bevoegdheden 5:12, 5:13, 5:15–5:17, 5:19 en 5:20 gelden ook voor opsporingsambtenaren. Zodra iemand verdachte is, gelden de waarborgen van het Sv, zoals de cautie.</li>
<li><b>Art. 92</b>: een reiziger <b>onder 14 jaar</b> die in strijd met art. 70 of 71 handelt, moet op de eerste vordering een identiteitsbewijs tonen. Heeft hij het niet bij zich, dan geldt de strafverzwaring van art. 101 lid 2. Weigert hij bewust terwijl hij het wel bij zich heeft, dan is het art. 184 Sr.</li>
<li><b>Art. 97</b>: bij onvoldoende medewerking zo nodig met de sterke arm maatregelen treffen, zoals een fiets verwijderen of bagage voor een nooduitgang weghalen.</li>
<li><b>Art. 98</b>: bij overtreding van art. 70–74 het vervoerbewijs <b>intrekken</b> en het gebruik van het OV ontzeggen (lid 1). Opsporingsambtenaren kunnen ook de toegang tot een station of halte ontzeggen (lid 2). Een ontzegging negeren is verboden (lid 4). Bij een vermoeden van overtreding van art. 72 mag je de handbagage in aanwezigheid van de reiziger controleren en verwijderen (lid 5).</li>
<li><b>Art. 51 Bp2000</b>: bij intrekking krijgt de reiziger altijd een bewijs van intrekking. Een bewerkt vervoerbewijs gaat bij het pv.</li>
</ul>`},
{id:"spoor", deel:"Openbaar vervoer (domein IV)", titel:"Spoorwegwet en Wet lokaal spoor", kb:"110–112", dia:"47–51", html:`
<ul>
<li>Spoorweg (art. 1 Spoorwegwet): een weg voor verkeer over spoorstaven of geleiderails. Art. 2 onderscheidt <b>hoofdspoorwegen</b> (aangewezen bij koninklijk besluit) en <b>bijzondere spoorwegen</b>.</li>
<li><b>Art. 3 Spoorwegwet</b>: verboden zich zo te gedragen dat gevaar op de spoorweg ontstaat of kan ontstaan, of dat het verkeer wordt of kan worden gehinderd. Vergelijkbaar met art. 5 WVW 1994.</li>
<li>Zwaardere feiten blijven misdrijven uit het Wetboek van Strafrecht: opzettelijk gevaar voor het spoorverkeer (art. 164), door schuld (art. 165) en vernieling van spoorwegwerken (art. 351).</li>
<li><b>Art. 15 Wet lokaal spoor</b> (tram en metro): verboden in te grijpen in installaties, de infrastructuur te beschadigen of te wijzigen, op of langs een afgesloten lokale spoorweg te lopen, en het beheer of verkeer te hinderen.</li>
</ul>`},
{id:"praktijk", deel:"Praktijk", titel:"Praktijkexamen: het sanctiegesprek", kb:"", dia:"263–288", html:`
<p>De rubric in de dia's beschrijft waar je op wordt beoordeeld in het sanctiegesprek met een acteur. Kort samengevat:</p>
<ul>
<li>Begroet de persoon, stel jezelf voor en vertel waarom je hem aanspreekt.</li>
<li>Spreek duidelijk en verstaanbaar, laat de ander uitspreken en houd de regie.</li>
<li>Houd minstens 1,5 meter afstand en blijf geduldig.</li>
<li>Meld vóór het staande houden nog eens het strafbare feit en houd de verdachte daarna staande.</li>
<li>Geef de <b>cautie</b> en leg uit wat die betekent. Noem de rechten met uitleg, en vertel dat afzien ervan nadelige gevolgen kan hebben.</li>
<li>Vraag duidelijk om een verklaring.</li>
<li>Leg de vervolgprocedure uit en hoe iemand bezwaar kan maken. Sluit het gesprek netjes en professioneel af.</li>
</ul>`},
{id:"ambts", deel:"Ambtsinstructie en RTGB", titel:"Geweld, geweldmiddelen en fouilleren", kb:"", dia:"", html:`
<p>De Ambtsinstructie voor de politie, de Koninklijke marechaussee en andere opsporingsambtenaren werkt artikel 7 van de Politiewet 2012 uit. Voor een boa met geweldsbevoegdheid gelden de artikelen die artikel 37 noemt; voor 'de korpschef' lees je dan de <b>direct toezichthouder</b>.</p>
<h4>Geweld</h4>
<ul>
<li><b>Geweld</b> (art. 1): elke dwangmatige kracht van meer dan geringe betekenis op personen <i>of zaken</i>. Licht begeleiden van iemand die meewerkt, is geen geweld.</li>
<li>Alleen in de <b>rechtmatige uitoefening van je functie</b>, als het doel dat rechtvaardigt en het niet anders kan (<b>subsidiariteit</b>), en <b>redelijk en gematigd</b> in verhouding tot het doel (<b>proportionaliteit</b>). Zo mogelijk eerst een <b>waarschuwing</b> (art. 7 lid 1 en 7 Politiewet 2012).</li>
<li>Een geweldmiddel alleen als je ervoor <b>bevoegd</b> bent, het voor je taak gebruikt en erin <b>geoefend</b> bent (art. 4). Een boa gebruikt alleen het door de minister <b>voorgeschreven</b> middel (art. 38), pas nadat de bevoegdheid op de akte van beëdiging staat en de bekwaamheid is aangetoond (art. 39).</li>
<li>Onder leiding van een aanwezige meerdere: geweld pas na diens <b>uitdrukkelijke last</b> (art. 5).</li>
</ul>
<h4>Pepperspray en wapenstok</h4>
<ul>
<li><b>Pepperspray</b> (art. 12a): aanhouding van iemand met een direct bruikbaar wapen die dat zal gebruiken; aanhouding van iemand die zich onttrekt; agressieve dieren; direct gevaar voor het leven of zwaar lichamelijk letsel.</li>
<li><b>Wapenstok</b> (art. 12e): dezelfde aanhoudingsgronden en gevaar voor het leven, plus iemand <b>op afstand houden</b> die je belemmert of een bevoegd bevel niet opvolgt, en het verspreiden van een bedreigende menigte.</li>
<li>Bij beide eerst <b>waarschuwen</b>, tenzij de omstandigheden dat redelijkerwijs niet toelaten (art. 12b en 12f).</li>
</ul>
<h4>Handboeien en mondafscherming</h4>
<ul>
<li>Alleen bij iemand die <b>rechtens van zijn vrijheid is beroofd</b>, niet bij een staandehouding (art. 22). Ezelsbruggetje <b>VVV</b>: <b>V</b>ervoer of verplaatsing, <b>V</b>luchtgevaar, <b>V</b>eiligheid.</li>
<li>Melden: ezelsbruggetje <b>HOS</b>: <b>H</b>andboeien meld je <b>O</b>nverwijld <b>S</b>chriftelijk bij de hulpofficier van justitie, met de reden (art. 23).</li>
<li>Mondafscherming (spuugmasker): bij vervoer of verplaatsing als dat voor de veiligheid nodig is (art. 22a), alleen als je aanwijzing dit omvat.</li>
</ul>
<h4>Veiligheids- en vervoersfouillering</h4>
<ul>
<li><b>Veiligheidsfouillering</b> (art. 7 lid 3 Politiewet 2012): bij iedereen met wie je in je taak te maken hebt, niet alleen verdachten, als uit feiten of omstandigheden <b>direct gevaar</b> blijkt voor leven of veiligheid. <b>Wel meldplicht</b>: onverwijld schriftelijk aan de hulpofficier van justitie, met de redenen (art. 21).</li>
<li><b>Vervoersfouillering</b> (art. 7 lid 4 Politiewet 2012): bij iemand die je vervoert. <b>Geen meldplicht</b>.</li>
<li>Allebei: <b>oppervlakkig aftasten</b> van de kleding en meegevoerde voorwerpen, zoveel mogelijk door iemand van <b>hetzelfde geslacht</b>; gevaarlijke voorwerpen neem je <b>in bewaring</b> (art. 20).</li>
</ul>`},
{id:"geweldmelding", deel:"Ambtsinstructie en RTGB", titel:"Geweld melden en de RTGB-toetsen", kb:"", dia:"", html:`
<h4>Melden: wat, hoe en bij wie</h4>
<p>Na geweld meld je <b>zo spoedig mogelijk</b> bij de <b>hulpofficier van justitie</b> die belast is met de registratie (art. 17). Ezelsbruggetje <b>GSM</b>: <b>G</b>eweld meld je <b>S</b>chriftelijk en <b>M</b>ondeling.</p>
<ul>
<li><b>Schriftelijk</b>, ezelsbruggetje <b>SAGG</b>: de <b>A</b>ard van het geweld, het <b>G</b>ebruikte geweldmiddel en de <b>G</b>evolgen.</li>
<li><b>Mondeling</b>, ezelsbruggetje <b>MONFOR</b>: de <b>F</b>eiten, <b>O</b>mstandigheden en de <b>R</b>eden van het geweld.</li>
<li>Gebruikte je geweld op uitdrukkelijke last van een aanwezige meerdere, dan meldt de meerdere.</li>
<li>Alleen dreigen met geweld, zoals schreeuwen, hoef je sinds 1 juli 2020 niet meer te melden.</li>
</ul>
<h4>Het meldschema</h4>
<ol class="flow">
<li><b>Melding</b> bij de hulpofficier van justitie. Geen letsel: de melding wordt vastgelegd (in de praktijk een mutatie).</li>
<li><b>Registratie</b> door de hulpofficier bij de dood, letsel van meer dan geringe betekenis, vuurwapengebruik, of als hij daartoe aanleiding ziet (art. 17 lid 3).</li>
<li>De registratie gaat naar de <b>direct toezichthouder</b> (bij de politie: de korpschef), die het geweld beoordeelt (art. 17 lid 4, art. 18a).</li>
<li><b>Kennisgeving aan de officier van justitie</b>: <b>terstond</b> bij de dood, zwaar lichamelijk letsel of vuurwapengebruik met letsel; in andere gevallen zo spoedig mogelijk als de direct toezichthouder daartoe aanleiding ziet (art. 18).</li>
</ol>
<h4>Letsel</h4>
<ul>
<li><b>Letsel van meer dan geringe betekenis</b>: letsel dat door een arts of verpleegkundige is behandeld, of medisch gezien behandeld had moeten worden.</li>
<li><b>Zwaar lichamelijk letsel</b> (art. 82 Sr): onder meer ziekte zonder uitzicht op volkomen genezing, blijvende ongeschiktheid voor het beroep, verlies van een zintuig, verminking, en storing van de verstandelijke vermogens die langer dan vier weken duurt.</li>
</ul>
<h4>Zorg na geweld</h4>
<ul>
<li>Eerst de zorg: ernstig gewonden en bewustelozen per ambulance naar het ziekenhuis; bij lichte verwondingen verwijzen naar huisarts of EHBO (art. 24, voor de politie).</li>
<li>Haal iemand zo snel mogelijk uit buikligging en let op ademhaling en aanspreekbaarheid (risico op positionele asfyxie).</li>
</ul>
<h4>De RTGB</h4>
<ul>
<li>Elk kalenderjaar de <b>toets geweldsbeheersing</b> en de <b>toets aanhoudings- en zelfverdedigingsvaardigheden</b>; met een vuurwapen elk halfjaar ook de <b>toets schietvaardigheid</b> (art. 2 RTGB).</li>
<li>Niet gehaald: na afloop van de periode mag je de bevoegdheid en het middel niet meer gebruiken; de <b>direct toezichthouder</b> neemt het geweldmiddel in.</li>
<li>De <b>werkgever</b> zorgt voor training en toetsing; jij bent zelf verantwoordelijk voor je deelname. De toetsen worden samengesteld door de Politieacademie en afgenomen door een gecertificeerde toetser.</li>
</ul>`}
];
// Vindplaatsen per wetsartikel: [regex op de bronverwijzing van de vraag, sectie, kennisboekje-blz, dia's]
const STOF_ART = [
[/Model-APV|RVV|WVW|Alcoholwet|Winkeltijdenwet|WED\b|Omgevingswet|Bal\b|bruidsschat|Visserijwet|Wm\b|Gemeentewet|Beleidsregels boa, paragraaf 6|Toetsmatrijs Domein I, toetsterm 1\.3/,"ruimte","",""],[/art\. 5:(2|8|10|10a|21|27|29|31d|40) Awb|art\. 1:1 Awb|Toetsmatrijs Domein I, toetsterm 3/,"bestuur","",""],
[/art\. 1[789]a? Ambtsinstructie|18a Ambtsinstructie|art\. 24 Ambtsinstructie|RTGB|Stb\. 2020|art\. 82 Sr|Lesstof geweldsbeheersing/,"geweldmelding","",""],[/Ambtsinstructie/,"ambts","",""],
[/art\. 70 Wp2000|art\. 70 lid/,"ovbewijs","85","23"],[/art\. 71 Wp2000/,"ovorde","90","29"],[/art\. 72 Wp2000/,"ovorde","91","30–31"],[/art\. 73 Wp2000/,"ovorde","93–94","33"],
[/art\. 87 Wp2000/,"ovtoezicht","98–99","38"],[/art\. 89 Wp2000/,"ovopsp","105","41"],[/art\. 90 Wp2000/,"ovtoezicht","101","40"],[/art\. 91 Wp2000/,"ovopsp","107","43"],
[/art\. 92/,"ovopsp","108","44"],[/art\. 97 Wp2000/,"ovopsp","109","45"],[/art\. 98/,"ovopsp","109–110","46"],[/art\. 101/,"ovstraf","95","35"],[/art\. 19 Wp2000|art\. 1 Wp2000|art\. 2 Wp2000/,"wpbegrip","75–82","8–19"],
[/art\. 45 lid 1/,"ovbewijs","87","25"],[/art\. 46[^;]*Bp2000/,"ovbewijs","87",""],[/art\. 47[^;]*Bp2000/,"ovbewijs","86","24"],[/art\. 48[^;]*Bp2000/,"ovbewijs","88–89","26"],[/art\. 51 Bp2000/,"ovopsp","106","42"],[/art\. 52 Bp2000/,"ovorde","92–93","32"],[/art\. 53 Bp2000/,"ovorde","94","34"],
[/Spoorwegwet|lokaal spoor/,"spoor","110–112","47–51"],
[/art\. 5:1[2-7]|art\. 5:20|\bAwb\b/,"ovtoezicht","100–104","182–186"],
[/art\. 27 lid|art\. 27 Sv/,"verhoor","35","98"],[/art\. 27c/,"identiteit","43","105"],[/art\. 28 Sv|art\. 28[a-c]|art\. 489|art\. 50 Sv/,"verhoor","57–59","106–113"],[/art\. 29a|art\. 29 /,"verhoor","57, 66","99–104"],
[/art\. 52 Sv|art\. 435|art\. 447e|Wid/,"identiteit","41–49","125–127"],[/art\. 53|art\. 54|art\. 67 Sv/,"aanhouden","50–51","128–130"],[/art\. 55 en|art\. 55 Sv|art\. 96 Sv|Awbi|art\. 12 Gw|art\. 97 en 110|art\. 96c/,"woning","52–53, 64–65","117–119, 132"],
[/art\. 55b/,"identiteit","47","142"],[/art\. 55c|art\. 56a|art\. 56b|art\. 57 en 58|art\. 63|art\. 487/,"aanhouden","54–56","131"],[/art\. 56/,"fouilleren","60","139–141"],
[/art\. 94|art\. 95|art\. 96a|art\. 96b|art\. 116|art\. 134/,"fouilleren","61–63","133–136, 161–162"],[/art\. 141 Sv|art\. 142 Sv|art\. 148|Besluit boa|Beleidsregels boa/,"boa","9–12","53–65"],
[/art\. 7 Politiewet|art\. 7 lid|art\. 8 Politiewet/,"politie","13–15","70–72"],[/Politiewet/,"politie","12–15","67–75"],
[/art\. 152|art\. 153|art\. 344|art\. 339/,"pv","66–67","145–159, 260"],[/art\. 167|art\. 257a|art\. 12 Sv/,"om","69–70","249–255"],[/art\. 77e|art\. 77i/,"bevoegd","37, 71","122–124"],[/art\. 359a|art\. 5:20 Awb/,"bevoegd","36–37",""],
[/art\. 44 Sr/,"ambt","17","219"],[/art\. 177|art\. 363/,"ambt","18","220–221"],[/art\. 207/,"ambt","19","222"],[/art\. 138|art\. 370/,"ambt","20","224–228"],
[/art\. 179|art\. 180|art\. 184|art\. 185/,"tegenambt","38–40","210–215"],[/art\. 26[0-9]/,"tegenambt","40–41","216–217"],
[/art\. 6[4-7] Sr|art\. 70 Sr|art\. 188|art\. 316|art\. 164 Sv|art\. 285b|art\. 300/,"aangifte","24–25",""],
[/art\. (39|40|41|42|43)( lid [0-9])? Sr/,"strafbaar","30",""],[/art\. 4[5-9]|art\. 5[1-7] Sr|art\. 52 Sr/,"deelneming","30–33","204–208"],
[/art\. [1-3]( lid [0-9])? Sr|art\. 1 Sv|art\. 9 Sr|art\. 91 Sr/,"recht","8, 26","200"],
[/AVG|Wpg/,"privacy","20–24","230–234"],[/Wet RO|art\. 11[0-9] Gw|art\. 12[01] Gw|art\. 36[89]/,"rechtspraak","72–74","236–245"],
[/Gw|Gemeentewet|Provinciewet|Kieswet/,"staat","2–7","83–95"]
];
// Standaard-sectie per categorie als de bronverwijzing niets specifieks oplevert
const STOF_CAT = {sr:"staat",ro:"rechtspraak",boa:"boa",pol:"politie",str:"recht",vd:"verhoor",bev:"bevoegd",kl:"aangifte",vrij:"aanhouden",fou:"fouilleren",bes:"fouilleren",pl:"woning",sch:"strafbaar",amb:"tegenambt",
  wp:"ovopsp",bp:"ovbewijs",ovt:"ovtoezicht",spw:"spoor",com:"praktijk",agr:"praktijk",prof:"praktijk",waa:"pv",pv:"pv",gem:"ruimte",bst:"bestuur",apv:"ruimte",wvw:"ruimte",bijz:"ruimte",jgd:"bevoegd",aig:"ambts",aim:"geweldmelding",aiw:"ambts",aif:"ambts",air:"geweldmelding",avg:"privacy"};
