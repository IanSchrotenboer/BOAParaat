// ---------- PHB 2 Bejegening: casustrainer ----------
// Het ExTH-examen Bejegening is een gesprek met een acteur. Domein I: drie casussen (calamiteit, aanwijzing,
// balie dienstverlening) in 30 minuten; domein IV: twee (aanwijzing en strafbaar feit). Elke casus wordt
// gescoord met een rubric en moet minimaal voldoende zijn.
// Hier: (1) casuskaarten met timer, rolkaart voor een oefenpartner, opnemen en terugluisteren en een
// zelfbeoordeling met de criteria uit de rubric; (2) gesprekken als keuzeboom: per beurt kies je wat je zegt
// en de 'acteur' reageert. De criteria zijn in eigen woorden samengevat uit de rubrics Bejegening Domein I
// v1.5 en Domein IV v1.1 (ExTH); de casussen zijn eigen voorbeelden.

// criteria: [titel, [omschrijving per puntenniveau]] (2 of 3 niveaus)
const KZC={
  ben:["Benaderen op gepaste wijze",["Kijkt de persoon niet aan en zegt geen meneer/mevrouw en u.","Kijkt de persoon aan en zegt meneer/mevrouw en u."]],
  ben4:["Benaderen op gepaste wijze",["Kijkt de persoon niet aan, zegt geen meneer/mevrouw en u of legitimeert zich niet als daarom wordt gevraagd.","Kijkt de persoon aan, zegt meneer/mevrouw en u en legitimeert zich als daarom wordt gevraagd."]],
  aans:["Aansluiten bij emotie en behoefte",["Toont weinig interesse, zorgt voor onrust of praat te kinderlijk of te zakelijk.","Toont interesse, is rustig en toegankelijk, sluit aan bij het niveau van de persoon en speelt geen gezag uit.","Als bij 2, en vraagt zo nodig of familie moet worden ingelicht en legt uit waarom je de meldkamer belt."]],
  sit:["Situatie duidelijk en feitelijk uitleggen",["Legt de situatie niet uit, gebruikt meer dan 4 zinnen of vertelt iets wat niet klopt.","Legt in 2 tot 4 zinnen feitelijk uit wat er aan de hand is.","Als bij 2, en zegt ook wat het concreet voor de persoon betekent."]],
  lsd:["Luisteren, samenvatten en doorvragen",["Vat niet of onjuist samen, vraagt niet gericht door of komt terug met een oplossing die de persoon al heeft afgewezen.","Vat het verhaal juist samen, stelt één gerichte vervolgvraag en herhaalt geen afgewezen oplossing.","Vat juist samen, stelt meerdere gerichte vervolgvragen en legt uit waarom je die informatie nodig hebt."]],
  lsdw:["Luisteren, samenvatten en doorvragen (7 W's)",["Vat niet of onjuist samen, vraagt niet gericht door of komt terug met een oplossing die de persoon al heeft afgewezen.","Vat juist samen en stelt één gerichte vervolgvraag met de 7 W's (wie, wat, waar, wanneer, waarom, hoe, waarmee).","Vat juist samen, vraagt alle relevante W's uit en legt uit waarom je die informatie nodig hebt."]],
  ged:["Geduldig en respectvol",["Onderbreekt, zucht, verheft de stem, maakt geen oogcontact of staat met handen in de zakken of over elkaar.","Laat de persoon uitpraten, maakt regelmatig oogcontact en onderbreekt hooguit twee keer onnodig.","Als bij 2, houdt het hele gesprek meneer/mevrouw en u vol en onderbreekt hooguit één keer onnodig."]],
  emo:["Ruimte voor emotie en verhaal, daarna zakelijk",["Geeft geen ruimte voor emotie of verhaal en gaat meteen zakelijk verder.","Geeft ruimte, maar gaat zakelijk verder terwijl de emotie nog niet is gezakt.","Gaat pas zakelijk verder als de persoon zijn verhaal heeft gedaan en de emotie is gezakt."]],
  emor:["Ruimte voor emotie, met gevoelsreflectie",["Geeft geen of een onjuiste gevoelsreflectie en gaat meteen zakelijk verder.","Geeft een korte gevoelsreflectie ('Ik hoor dat u boos bent'), blijft rustig, maar gaat verder terwijl de emotie nog niet is gezakt.","Geeft een uitgebreide gevoelsreflectie ('… omdat …'), blijft rustig en gaat pas verder als de emotie is gezakt."]],
  info:["Informatie geven en vragen beantwoorden",["Geeft te weinig of onjuiste informatie en vraagt niet of er nog vragen zijn.","Geeft juiste informatie, vraagt of er nog vragen zijn en beantwoordt die feitelijk.","Geeft de informatie zo duidelijk dat de persoon niet om uitleg hoeft te vragen, en vraagt naar vragen."]],
  alt:["Alternatieven bieden als de emotie gezakt is",["Biedt onrealistische alternatieven, of al terwijl de emotie nog hoog is.","Biedt realistische alternatieven nadat de emotie is gezakt.","Als bij 2, en herhaalt daarbij wat de persoon over zijn situatie vertelde."]],
  spr:["Verstaanbaar en overtuigend spreken",["Spreekt onverstaanbaar.","Spreekt verstaanbaar en vanuit 'ik', maar monotoon.","Spreekt verstaanbaar, vanuit 'ik' en met wisselende intonatie en volume."]],
  frus:["Professioneel reageren op emotie en frustratie",["Benoemt de emotie niet, gaat erin mee, of stelt een grens terwijl dat niet nodig is.","Reageert professioneel met een korte gevoelsreflectie ('Ik zie/hoor/merk …').","Geeft een uitgebreide gevoelsreflectie ('Ik merk dat u boos bent, omdat u …') en vraagt door op de emotie."]],
  regie:["Regie houden",["De persoon bepaalt de richting van het gesprek.","Neemt de leiding, laat zich niet afleiden en komt niet terug op wat al besproken is (tenzij de persoon ernaar vraagt)."]],
  veil:["Eigen veiligheid",["Staat dichterbij dan een armlengte (en zorgt niet voor de veiligheid van de persoon als dat nodig is).","Houdt minstens een armlengte afstand en benoemt dat.","Houdt minstens een armlengte afstand, legt uit waarom en beweegt mee als de persoon dichterbij komt."]],
  mk:["Juiste informatie aan de meldkamer",["Belt niet uit zichzelf, of geeft onjuiste of onvolledige informatie waardoor de meldkamer vaak moet doorvragen.","Belt uit zichzelf en geeft de juiste informatie; de meldkamer vraagt hooguit één keer door.","Belt uit zichzelf en geeft volledige informatie; de meldkamer hoeft niets te vragen."]],
  af:["Professioneel afronden",["Herhaalt de afspraken niet, begint opnieuw over de escalatie of verontschuldigt zich voor het optreden, of laat de persoon gaan zonder te groeten.","Herhaalt de afspraken, begint niet opnieuw over de escalatie en groet de persoon.","Als bij 2, en vraagt of er nog vragen of opmerkingen zijn en beantwoordt die."]],
  afc:["Professioneel afronden",["Vraagt niet naar vragen, begint opnieuw over de escalatie of laat de persoon gaan zonder te groeten.","Begint niet opnieuw over de escalatie en groet de persoon.","Als bij 2, en vraagt of er nog vragen of opmerkingen zijn en beantwoordt die."]],
  belo:["Geen beloftes die je niet kunt nakomen",["Belooft iets wat niet kan of buiten je bevoegdheid valt, of is vaag over wat wel en niet kan.","Belooft alleen wat kan en binnen je bevoegdheid valt, en is duidelijk over wat wel en niet mogelijk is."]],
  integ:["Integer en met oog voor privacy",["Geeft onjuiste informatie, doet alsof hij het weet, of deelt gevoelige informatie of gegevens van collega's.","Geeft juiste informatie, is eerlijk over wat hij niet weet en beschermt de privacy van anderen, ook van collega's."]],
  regel:["Handelen vanuit regels en feiten",["Geeft een persoonlijke mening of handelt niet vanuit de regels.","Onderbouwt de keuzes met feiten en regels.","Als bij 2, en controleert of de boodschap is begrepen."]],
  taal:["Begrijpelijke taal",["Gebruikt vakjargon of moeilijke woorden, waardoor de boodschap onduidelijk wordt.","Gebruikt begrijpelijke woorden en legt vaktermen uit.","Als bij 2, en sluit aan bij de woorden die de persoon zelf gebruikt."]],
  feit:["Strafbaar feit melden en proces-verbaal aanzeggen",["Noemt het strafbare feit niet of verkeerd, of zegt geen proces-verbaal aan.","Noemt het juiste strafbare feit en zegt proces-verbaal aan.","Houdt de verdachte staande en zegt dat, noemt het juiste feit, zegt vanuit 'ik' duidelijk proces-verbaal aan en kan uitleggen wat staande houden is."]]
};
// soorten casussen per domein: criteria in de volgorde van de rubric, maximum en cesuur [voldoende vanaf, goed vanaf]
const KZT={
  "1-cal":{dom:"1",naam:"Calamiteit",min:10,crit:["ben","aans","lsd","ged","emor","info","spr","regie","veil","mk","afc"],max:31,ces:[22,26]},
  "1-aanw":{dom:"1",naam:"Aanwijzing",min:10,crit:["ben","sit","lsd","ged","emo","alt","spr","frus","regie","veil","af"],max:31,ces:[22,26]},
  "1-balie":{dom:"1",naam:"Balie dienstverlening",min:10,crit:["ben","lsdw","ged","emo","belo","alt","spr","frus","regie","integ","af"],max:29,ces:[22,25]},
  "4-aanw":{dom:"4",naam:"Aanwijzing",min:15,crit:["ben4","sit","lsd","ged","emo","alt","spr","frus","regie","veil","af","regel","taal"],max:37,ces:[26,32]},
  "4-feit":{dom:"4",naam:"Strafbaar feit",min:15,crit:["ben4","feit","lsd","ged","emo","spr","info","frus","regie","veil","regel","taal"],max:34,ces:[24,29]}
};
// casussen: t = soort, s = situatie (wat jij weet), d = wat je moet bereiken, r = rolkaart voor je oefenpartner, l = let op
const KZ=[
  {id:"cal-markt",t:"1-cal",titel:"Gevallen op de markt",s:"Zaterdagochtend, weekmarkt. Een oudere man (ongeveer 80) zit op de stoeprand. Hij is gestruikeld over een kabel van een kraam en heeft een bloedende wond boven zijn oog. Omstanders lopen door. Hij wil opstaan en naar huis.",d:"De man geruststellen, uitvragen wat er is gebeurd en hoe het met hem gaat, de meldkamer juist informeren en zorgen dat hij niet alleen naar huis gaat.",r:"Je bent meneer De Vries, 81 jaar. Je schaamt je en wilt geen gedoe: 'Het gaat best, ik loop wel naar huis.' Je bent wat duizelig en weet niet precies hoe laat het is. Je vrouw wacht thuis en is zelf slecht ter been. Word onrustig als de boa te zakelijk is of over je hoofd heen praat; word rustiger als hij je serieus neemt.",l:"Vraag of familie moet worden ingelicht en zeg waarom je de meldkamer belt. Geef de meldkamer plaats, wat er is gebeurd, de toestand van de man en je naam."},
  {id:"cal-kind",t:"1-cal",titel:"Kind kwijt in het winkelcentrum",s:"Een moeder komt in paniek op je af in het winkelcentrum. Haar zoontje is weg. Ze praat snel en wijst alle kanten op.",d:"De moeder kalmeren, een volledig signalement en de laatste plek uitvragen, de meldkamer direct en volledig informeren en afspraken maken.",r:"Je bent mevrouw Yilmaz. Je zoon Emre (5 jaar) was vijf minuten geleden nog bij de speelgoedwinkel. Hij draagt een rode jas, spijkerbroek en gele laarzen, en heeft kort zwart haar. Je huilt, praat door elkaar en wilt zelf gaan zoeken: 'Ik moet hem zoeken, ik heb geen tijd voor vragen!' Word rustiger als de boa uitlegt waarom hij de vragen stelt.",l:"Gebruik de W-vragen voor het signalement (wie, waar laatst gezien, wanneer, kleding). Leg uit dat je vragen stelt zodat collega's gericht kunnen zoeken."},
  {id:"cal-fiets",t:"1-cal",titel:"Fietser aangereden",s:"Op een fietspad ligt een jonge vrouw naast haar fiets. Een scooter heeft haar geraakt en is doorgereden. Ze houdt haar pols vast en is boos en geschrokken.",d:"Zorgen voor haar veiligheid (van het fietspad af), uitvragen wat er gebeurde en hoe ze eraan toe is, de meldkamer informeren met het signalement van de scooter en uitleggen wat er nu gebeurt.",r:"Je bent Sanne, 24. Je pols doet veel pijn. Je bent woedend op de scooterrijder: 'Die gast reed gewoon door! Doe er wat aan!' Je weet nog: zwarte scooter, bestuurder met witte helm en een groene jas, richting het station. Je moet over een uur op je werk zijn en wilt eigenlijk geen ambulance.",l:"Benoem waarom je de meldkamer belt. Laat de emotie eerst zakken voordat je zakelijk wordt. Herhaal aan het eind wat er gaat gebeuren."},
  {id:"aanw-fiets",t:"1-aanw",titel:"Fietsen in het voetgangersgebied",s:"Winkelstraat, 14.00 uur. Bij de ingang staat een bord: voetgangersgebied, fietsen niet toegestaan. Een man fietst met volle boodschappentassen aan zijn stuur tussen het winkelend publiek door.",d:"De man laten afstappen (aanwijzing), uitleggen waarom, zijn verhaal aanhoren en een realistisch alternatief bieden.",r:"Je bent meneer Bakker. Je moet om 14.15 uur je dochter van school halen en de tassen zijn zwaar. 'Iedereen fietst hier, waarom pak je mij?' Word boos als de boa meteen met regels komt. Accepteer de aanwijzing als de boa begrip toont en meedenkt.",l:"Leg in 2 tot 4 zinnen uit wat er aan de hand is en wat het voor hem betekent. Bied pas een alternatief (lopend naar het eind van de straat, route via de parallelstraat) als de emotie gezakt is."},
  {id:"aanw-hond",t:"1-aanw",titel:"Hond los in het park",s:"In het park geldt een aanlijngebod; het staat op borden bij de ingangen. Een vrouw laat haar grote hond loslopen bij de speeltuin. Een vader met een kind kijkt bezorgd.",d:"De vrouw vragen de hond aan te lijnen, de regel en de reden uitleggen en haar wijzen op een plek waar het wel mag.",r:"Je bent mevrouw Jansen. 'Hij doet niks, hij is juist dol op kinderen.' Je voelt je aangevallen en zegt dat de boa beter de echte problemen in de wijk kan aanpakken. Je wordt rustiger als de boa je verhaal samenvat en het losloopgebied verderop noemt.",l:"Geen discussie over of de hond lief is: blijf bij de feiten en de regel. Herhaal aan het eind de afspraak."},
  {id:"aanw-afval",t:"1-aanw",titel:"Dozen naast de container",s:"Een winkelier zet lege dozen naast een volle ondergrondse container in de straat. Dat mag niet: bijplaatsen naast een container is verboden.",d:"De winkelier vragen de dozen weg te halen, uitleggen waarom en samen een oplossing vinden.",r:"Je bent mevrouw Chen, eigenaar van de cadeauwinkel. 'De container is al drie dagen vol, wat moet ik dan?' Je bent gefrustreerd over de gemeente. Je wilt niet dat je winkel er rommelig uitziet. Word rustiger als de boa begrijpt dat de container vol is.",l:"Leg uit dat bedrijfsafval niet in de container voor huishoudens hoort en dat een volle container gemeld kan worden. Doe geen beloftes over wanneer hij geleegd wordt."},
  {id:"balie-boete",t:"1-balie",titel:"Boze burger over een parkeerboete",s:"Je staat aan de balie van het stadskantoor. Een man legt een parkeerbon (naheffingsaanslag parkeerbelasting) op de balie en eist dat je die intrekt.",d:"Luisteren, met de W-vragen uitvragen wat er gebeurde, geen beloftes doen en uitleggen hoe hij bezwaar kan maken.",r:"Je bent meneer Peters. Je stond 'maar vijf minuten' voor de apotheek omdat je moeder ziek is. De parkeerautomaat deed het niet. 'U kunt dit toch gewoon even regelen?' Als de boa iets belooft, houd je hem eraan. Word rustiger als hij uitlegt wat je wel kunt doen.",l:"Jij kunt de aanslag niet intrekken. Leg uit dat hij binnen zes weken bezwaar kan maken bij de gemeente en dat hij de foto of melding van de kapotte automaat kan meesturen."},
  {id:"balie-collega",t:"1-balie",titel:"Klacht over een collega",s:"Aan de balie staat een vrouw die gisteren een bekeuring kreeg van een van je collega's. Ze vond hem onbeschoft en wil zijn naam en waar hij woont.",d:"Haar verhaal aanhoren, de privacy van je collega beschermen en uitleggen hoe ze een klacht kan indienen.",r:"Je bent mevrouw Visser. Je bent beledigd: 'Hij lachte me uit!' Je wilt zijn volledige naam en adres 'om hem zelf aan te spreken'. Als de boa die geeft, ga je meteen weg. Word rustiger als hij uitlegt hoe je klacht wordt behandeld.",l:"Geef geen persoonsgegevens van collega's. Leg uit dat de gemeente klachten behandelt volgens de Algemene wet bestuursrecht en dat ze een reactie krijgt."},
  {id:"balie-buren",t:"1-balie",titel:"Overlast van de buren",s:"Een man meldt aan de balie voor de derde keer geluidsoverlast van zijn bovenburen. Volgens hem gebeurt er niets met zijn meldingen.",d:"Zijn verhaal samenvatten, met de W-vragen de overlast uitvragen, uitleggen wat er wel en niet kan en een realistisch vervolg afspreken.",r:"Je bent meneer El Amrani. Je slaapt al weken slecht omdat de buren 's nachts muziek draaien. 'Jullie doen nooit iets. Ik wil dat je vanavond langskomt.' Je wordt boos als de boa zegt dat 'het wordt doorgegeven' zonder uitleg. Je hebt al eens met de buren gepraat, dat hielp niet.",l:"Beloof niet dat je vanavond komt als je dat niet zeker weet. Noem alternatieven zoals buurtbemiddeling of de wijkagent pas als de emotie gezakt is, en niet opnieuw als hij die al heeft afgewezen."},
  {id:"ov-muziek",t:"4-aanw",titel:"Luide muziek in de stiltecoupé",s:"In een stiltecoupé van een intercity speelt een jongen muziek af via de luidspreker van zijn telefoon. Andere reizigers kijken geïrriteerd.",d:"De jongen vragen de muziek uit te zetten of naar een andere coupé te gaan (aanwijzing), uitleggen waarom en het gesprek professioneel afronden.",r:"Je bent Kevin, 19. Je hebt een rotdag gehad en muziek helpt je. 'Het is toch niet hard? Waarom zeg je het alleen tegen mij?' Je vraagt de boa om zijn legitimatie. Je werkt mee als hij je serieus neemt en een alternatief noemt (oortjes of een andere coupé).",l:"Laat je legitimatie zien als erom wordt gevraagd. Een aanwijzing van een boa moet worden opgevolgd (artikel 73 Wp2000); leg dat in gewone woorden uit."},
  {id:"ov-deur",t:"4-aanw",titel:"Deuren tegenhouden",s:"Op het perron houdt een vrouw de deur van de sprinter tegen omdat haar vriendin nog de trap af komt. De conducteur fluit voor vertrek.",d:"De vrouw vragen de deur los te laten (aanwijzing), de reden kort uitleggen en haar wijzen op de volgende trein.",r:"Je bent mevrouw Smit. 'Ze is er bijna, twee seconden!' Je bent gestrest omdat jullie naar een begrafenis gaan. Je wordt boos als de boa je hand van de deur wil halen. Word rustig als hij je situatie samenvat en uitlegt wanneer de volgende trein gaat.",l:"Veiligheid eerst, maar met woorden. Houd afstand. Zeg niet 'dat is uw probleem'; benoem wat het voor haar betekent en help met het alternatief."},
  {id:"ov-voeten",t:"4-aanw",titel:"Voeten op de bank",s:"Een man ligt in de trein met zijn schoenen op de bank tegenover hem. Er zit modder op de bekleding.",d:"De man vragen zijn voeten van de bank te halen, uitleggen waarom en controleren of de boodschap is begrepen.",r:"Je bent meneer Hoekstra, bouwvakker, moe na een lange dienst. 'Ik heb gewoon betaald, hoor.' Je spreekt plat en gebruikt woorden als 'joh' en 'gezeik'. Je reageert slecht op moeilijke woorden zoals 'verontreiniging' of 'vervoersvoorwaarden'.",l:"Gebruik geen vakjargon en sluit aan bij zijn woorden. Leg de regel uit: hinder en vervuiling in de trein is niet toegestaan."},
  {id:"ov-fiets",t:"4-aanw",titel:"Fiets mee in de spits",s:"Om 8.00 uur wil een student met een gewone fiets instappen in een volle intercity. In de spits mag een gewone fiets volgens de vervoersvoorwaarden niet mee; een vouwfiets wel.",d:"De student vragen niet in te stappen met de fiets, uitleggen waarom en een alternatief bieden.",r:"Je bent Lotte, 20. Je hebt over een uur een tentamen. 'Er is genoeg plek, kijk dan!' Je wordt brutaal als de boa alleen 'regels zijn regels' zegt. Je bent bereid de fiets te stallen als de boa de stalling en de volgende trein noemt.",l:"Onderbouw met de regel en de reden (veiligheid en ruimte in de spits). Herhaal wat ze zei over haar tentamen als je het alternatief noemt."},
  {id:"feit-roken",t:"4-feit",titel:"Roken op het perron",s:"Op een overdekt perron, waar borden een rookverbod aangeven, rookt een man een sigaret. Je hebt het zelf gezien.",d:"De man staande houden, het strafbare feit noemen, proces-verbaal aanzeggen, de cautie geven en zijn verklaring vragen, en het gesprek professioneel afronden.",r:"Je bent meneer Willems, 45. 'Ik sta toch bijna buiten?' Je vindt het overdreven dat je een boete krijgt. Je vraagt 'Wat is staande houden eigenlijk?' Je weigert eerst je naam te geven, maar geeft je ID-kaart als de boa uitlegt waarom.",l:"Roken waar dat verboden is, is een overtreding van artikel 52 lid 1 sub i Besluit personenvervoer 2000 (strafbaar via artikel 101 Wp2000). Geef de cautie voordat je om een verklaring vraagt."},
  {id:"feit-kaart",t:"4-feit",titel:"Reizen op andermans kaart",s:"Bij een controle toont een jonge vrouw een OV-chipkaart op naam van een man van 67 met een seniorenkorting.",d:"Het strafbare feit noemen (misbruik van een vervoerbewijs), staande houden en uitleggen wat dat betekent, proces-verbaal aanzeggen, de cautie geven en haar vragen beantwoorden.",r:"Je bent Esra, 22. Het is de kaart van je opa: 'Hij vindt het goed, hij reist toch nooit.' Je schrikt van het woord proces-verbaal en vraagt wat er nu gebeurt en of je een strafblad krijgt. Je wordt emotioneel.",l:"Reizen op andermans persoonlijke kaart is misbruik van een vervoerbewijs (artikel 71 Wp2000). Beantwoord haar vragen feitelijk en zonder te speculeren over de afloop."},
  {id:"feit-drank",t:"4-feit",titel:"Kennelijk onder invloed",s:"Op een station hangt een man tegen een kaartautomaat. Hij praat met dubbele tong, ruikt sterk naar alcohol en valt bijna om. Reizigers kunnen niet bij de automaat.",d:"Zorgen voor afstand en veiligheid, het feit noemen (kennelijk onder invloed in een station), staande houden, proces-verbaal aanzeggen en hem duidelijk en eenvoudig informeren.",r:"Je bent meneer Brouwer. Je bent dronken na een verjaardag. Je komt steeds dichterbij en legt je hand op de schouder van de boa: 'Kom op makker, doe effe normaal.' Je stelt dezelfde vraag meerdere keren.",l:"Houd een armlengte afstand en beweeg mee als hij dichterbij komt. Kennelijk onder invloed zijn in een station valt onder artikel 52 lid 1 sub d Besluit personenvervoer 2000. Houd zinnen kort."},
  {id:"feit-zwart",t:"4-feit",titel:"Fraude met een bewerkt kaartje",s:"Bij de controle laat een man een papieren kaartje zien waarop de datum duidelijk met pen is veranderd.",d:"Het strafbare feit noemen (gebruik van een bewerkt vervoerbewijs), staande houden, proces-verbaal aanzeggen, de cautie geven, zijn verklaring vragen en uitleggen wat er nu gebeurt.",r:"Je bent meneer Kaya, 35. Je ontkent eerst: 'Zo heb ik hem gekregen.' Daarna word je boos en zegt dat de boa je discrimineert. Als de boa rustig blijft en feitelijk uitlegt wat hij ziet, word je rustiger en vraag je wat de boete wordt.",l:"Gebruik van een bewerkt vervoerbewijs is een overtreding van artikel 71 Wp2000. Ga niet in discussie over discriminatie, maar benoem de emotie en blijf bij wat je hebt gezien."}
];
// gesprekken als keuzeboom: per beurt zegt de acteur iets (a), jij kiest (o: [tekst, punten 0-2, reactie acteur, uitleg, criterium])
const GESPREK=[
  {id:"g-markt",t:"1-cal",titel:"Gevallen op de markt",intro:"Een oudere man zit met een bloedende wond boven zijn oog op de stoeprand van de markt. Hij wil opstaan.",stappen:[
    {a:"Laat maar, laat maar. Het gaat best. Ik loop wel even naar huis.",o:[
      ["Goedemorgen meneer, ik ben Sam, boa van de gemeente. Ik zag dat u viel. Mag ik even bij u komen zitten? Hoe heet u?",2,"De Vries… Ja, ik struikelde over die kabel daar.","Je benadert hem rustig, stelt je voor, zegt meneer en u en sluit aan bij zijn tempo.","ben"],
      ["Blijft u zitten, u gaat nergens heen. U bloedt.",0,"(trekt zich terug) Ik mag toch zelf weten wat ik doe?","Bevelend en zakelijk: je speelt gezag uit en sluit niet aan bij zijn emotie.","aans"],
      ["Hé, gaat het? Even wachten, ik bel 112.",1,"Nee, geen 112, daar heb ik geen zin in.","Je handelt snel, maar zonder voor te stellen, zonder meneer en u en zonder uit te leggen waarom je belt.","ben"]]},
    {a:"Mijn vrouw wacht thuis. Ze kan zelf niet goed lopen. Ik moet echt naar huis.",o:[
      ["Ik hoor dat u zich zorgen maakt over uw vrouw, omdat zij thuis op u wacht en zelf niet goed ter been is. Zal ik ervoor zorgen dat zij wordt gebeld?",2,"(rustiger) Ja… graag. Ons nummer staat in mijn telefoon.","Uitgebreide gevoelsreflectie en je vraagt of familie moet worden ingelicht.","emor"],
      ["Uw vrouw redt zich wel even. Eerst die wond.",0,"(boos) Dat weet u helemaal niet!","Je gaat voorbij aan zijn zorg; de emotie stijgt.","emor"],
      ["Dat begrijp ik. Maar u kunt nu echt niet lopen.",1,"Ik kan heus wel lopen, hoor.","Een korte erkenning, maar je gaat meteen verder met je eigen punt.","emor"]]},
    {a:"Ik weet niet eens meer hoe laat het is… Ik ben wat duizelig.",o:[
      ["Dank u dat u dat zegt. U viel en nu bent u duizelig. Heeft u uw hoofd gestoten? En heeft u pijn op andere plekken? Ik vraag dit zodat de ambulance weet wat er nodig is.",2,"Ja, met mijn hoofd tegen de stoeprand. Verder alleen mijn knie.","Je vat samen, vraagt gericht door en legt uit waarom je het vraagt.","lsd"],
      ["Duizelig? Dan bel ik meteen een ambulance.",1,"Moet dat echt?","Juiste conclusie, maar je vraagt niet door en vat niet samen.","lsd"],
      ["Dat komt vast door de schrik. Even rustig ademen.",0,"Misschien…","Je stelt zelf een diagnose en mist belangrijke informatie.","lsd"]]},
    {a:"Moet dat nou, die ambulance?",o:[
      ["Ik bel nu de meldkamer, omdat u met uw hoofd bent gevallen en duizelig bent. Dan kan een arts kijken of het veilig is om naar huis te gaan. (tegen de meldkamer) Boa Sam, weekmarkt Grote Markt bij de kaaskraam: man van ongeveer 80 gevallen, hoofdwond boven het oog, aanspreekbaar maar duizelig en niet georiënteerd in tijd. Graag een ambulance.",2,"(meldkamer) Duidelijk, ambulance is onderweg. (de man knikt)","Je legt uit waarom je belt en geeft de meldkamer plaats, toedracht, toestand en je naam, zonder dat die hoeft door te vragen.","mk"],
      ["Ja, dat moet. (tegen de meldkamer) Ik heb hier een gevallen man op de markt, kunnen jullie een ambulance sturen?",1,"(meldkamer) Waar precies? Hoe oud is hij? Is hij aanspreekbaar?","De meldkamer moet meerdere keren doorvragen; je geeft geen volledige informatie.","mk"],
      ["Als u echt niet wilt, dan niet. U bent volwassen.",0,"(staat op en wankelt)","Je laat de regie los en zorgt niet voor zijn veiligheid.","regie"]]},
    {a:"(de ambulance komt eraan) Dank u wel, jongen.",o:[
      ["Graag gedaan, meneer De Vries. De ambulance is er zo; uw vrouw wordt gebeld. Heeft u nog vragen voor mij? (beantwoordt) Sterkte, meneer.",2,"Nee, dat was het. Dank u.","Je herhaalt de afspraken, vraagt naar vragen en groet.","afc"],
      ["Geen dank. Ik moet weer verder, succes.",1,"O… ja, dag.","Je groet wel, maar vraagt niet of hij nog vragen heeft.","afc"],
      ["Volgende keer beter uitkijken bij die kabels, hè?",0,"(beschaamd) Ja…","Je sluit af met een verwijt; geen professionele afronding.","afc"]]}]},
  {id:"g-hond",t:"1-aanw",titel:"Hond los in het park",intro:"In het park geldt een aanlijngebod. Een vrouw laat haar grote hond loslopen bij de speeltuin. Je loopt naar haar toe.",stappen:[
    {a:"(roept de hond) Bobby, kom! … Ja? Wat is er?",o:[
      ["Goedemiddag mevrouw. Ik ben boa van de gemeente. In dit park moeten honden aangelijnd zijn; dat staat op de borden bij de ingang. Uw hond loopt nu los bij de speeltuin. Ik vraag u hem aan te lijnen.",2,"Aanlijnen? Hij doet niks, hij is juist dol op kinderen!","Je benadert netjes en legt in een paar zinnen feitelijk uit wat er speelt en wat het voor haar betekent.","sit"],
      ["U overtreedt artikel 2:59 van de APV, het aanlijngebod. Lijnt u hem aan.",1,"Artikel wat? Waar heeft u het over?","Feitelijk juist, maar onbegrijpelijk en kortaf: je legt niet uit wat er aan de hand is.","sit"],
      ["Mevrouw, dit kan echt niet hoor. Er spelen hier kleine kinderen, die schrikken zich dood.",0,"Doe niet zo dramatisch!","Je geeft je mening in plaats van de regel en de feiten; de situatie escaleert.","sit"]]},
    {a:"Jullie moeten de echte problemen in de wijk aanpakken in plaats van mij lastig te vallen!",o:[
      ["Ik merk dat u zich aangevallen voelt, omdat u vindt dat uw hond niemand iets doet. Klopt dat?",2,"(zucht) Ja. Hij is gewoon een lieve hond.","Uitgebreide gevoelsreflectie en een vraag over de emotie.","frus"],
      ["Daar ga ik niet over in discussie, mevrouw.",0,"Typisch. Gewoon niet luisteren.","Je stelt een grens terwijl ze alleen boos is; de emotie stijgt.","frus"],
      ["Ik hoor dat u boos bent.",1,"Ja, natuurlijk ben ik boos.","Een korte gevoelsreflectie: goed, maar je vraagt niet door.","frus"]]},
    {a:"Ik kom hier elke dag, nooit iemand die er wat van zegt. Bobby moet rennen, hij is jong.",o:[
      ["U komt hier dagelijks en Bobby heeft veel beweging nodig. Weet u dat er aan de oostkant van het park een losloopgebied is? Daar mag hij vrij rennen.",2,"O… dat wist ik niet. Is dat ver?","Je vat haar verhaal samen en biedt een realistisch alternatief nu de emotie gezakt is.","alt"],
      ["Regels zijn regels, mevrouw.",0,"Belachelijk.","Geen samenvatting, geen alternatief: je sluit het gesprek af.","alt"],
      ["Dan moet u maar met hem gaan rennen.",1,"Ha, grappig.","Een alternatief, maar niet realistisch en zonder aan te sluiten bij haar verhaal.","alt"]]},
    {a:"(komt dichterbij en wijst naar je borst) En als ik het niet doe?",o:[
      ["(stapt een halve stap terug) Ik houd even een armlengte afstand, mevrouw, dat praat voor ons allebei prettiger. Als u de hond niet aanlijnt, kan ik een boete geven. Dat wil ik liever niet; aanlijnen of naar het losloopgebied is genoeg.",2,"(stapt terug) Oké, oké.","Je beweegt mee, benoemt de afstand en legt rustig het gevolg uit.","veil"],
      ["Dan krijgt u een bekeuring, zo simpel is het.",1,"Nou, dat zullen we nog wel eens zien.","Feitelijk, maar je doet niets met de afstand en de toon is scherp.","veil"],
      ["(blijft staan) Wijs niet naar mij, mevrouw!",0,"(harder) Ik wijs waar ik wil!","Je blijft te dichtbij staan en reageert op haar gedrag in plaats van op de situatie.","veil"]]},
    {a:"(lijnt de hond aan) Zo. Tevreden?",o:[
      ["Dank u wel. Dus: in dit deel van het park aangelijnd, en vrij rennen in het losloopgebied aan de oostkant. Heeft u nog vragen? (beantwoordt) Fijne middag, mevrouw.",2,"Nee hoor. Dag.","Je herhaalt de afspraak, vraagt naar vragen en groet; je begint niet opnieuw over de discussie.","af"],
      ["Dank u. Sorry hoor dat ik er iets van moest zeggen.",0,"Ja, dat mag ook wel.","Je verontschuldigt je voor je optreden; dat ondermijnt de aanwijzing.","af"],
      ["Dank u wel. Fijne dag.",1,"Dag.","Netjes gegroet, maar zonder de afspraak te herhalen.","af"]]}]},
  {id:"g-boete",t:"1-balie",titel:"Parkeerboete aan de balie",intro:"Je staat aan de balie van het stadskantoor. Een man legt een parkeerbon (naheffingsaanslag) op de balie.",stappen:[
    {a:"Dit is belachelijk. Die moet u nu intrekken.",o:[
      ["Goedemiddag meneer, ik zie dat u boos bent over deze aanslag. Vertelt u eens wat er is gebeurd?",2,"(iets rustiger) Nou, ik zal het u vertellen.","Je benadert netjes, benoemt de emotie en geeft ruimte voor zijn verhaal.","emo"],
      ["Die kan ik niet intrekken. Volgende.",0,"Wát? U luistert niet eens!","Meteen zakelijk, zonder ruimte voor zijn verhaal.","emo"],
      ["Rustig maar, meneer. Laat eens zien.",1,"Ik ben rustig!","'Rustig maar' werkt vaak averechts; je vraagt niet naar zijn verhaal.","emo"]]},
    {a:"Ik stond vijf minuten voor de apotheek, want mijn moeder is ziek. En die automaat deed het niet!",o:[
      ["U stond kort voor de apotheek voor uw moeder en de parkeerautomaat werkte niet. Welke automaat was het, op welke dag en hoe laat? Heeft u een foto of een melding gedaan? Dat vraag ik zodat u dat kunt meesturen met uw bezwaar.",2,"Bij de Kerkstraat, dinsdag rond twee uur. Ik heb een foto van het scherm.","Je vat samen, vraagt met de W-vragen door en legt uit waarom.","lsdw"],
      ["Er zijn meer automaten in die straat.",0,"Daar gaat het niet om!","Je reageert niet op zijn verhaal en gaat in discussie.","lsdw"],
      ["Oké, de automaat werkte niet. Hoe laat was dat?",1,"Rond twee uur.","Eén gerichte vraag, maar je vraagt niet alle relevante W's uit en legt niet uit waarom.","lsdw"]]},
    {a:"Dus u regelt dat die boete vervalt?",o:[
      ["Dat kan ik niet beloven, want ik beslis daar niet over. Wat u wel kunt doen: binnen zes weken bezwaar maken bij de gemeente, met uw foto van de automaat erbij. Dan wordt het opnieuw bekeken.",2,"Hm. Zes weken, zegt u. Hoe doe ik dat?","Je belooft niets wat je niet kunt waarmaken en bent duidelijk over wat wel kan.","belo"],
      ["Ja hoor, ik zorg dat het goedkomt.",0,"Mooi, dan reken ik daarop!","Een belofte die je niet kunt nakomen en buiten je bevoegdheid valt.","belo"],
      ["Misschien. Ik zal het doorgeven.",0,"Misschien? Wat bedoelt u daarmee?","Vaag: zo ontstaan verwachtingen die je niet kunt waarmaken.","belo"]]},
    {a:"Hoe doe ik dat, bezwaar maken?",o:[
      ["U stond voor uw moeder bij de apotheek en de automaat werkte niet; dat kunt u precies zo opschrijven. Het bezwaar kan via de website van de gemeente of met een brief, met het nummer van de aanslag en uw foto. Ik kan u het formulier meegeven.",2,"Fijn, dat doe ik vandaag nog.","Een realistisch alternatief waarbij je herhaalt wat hij over zijn situatie vertelde.","alt"],
      ["Dat staat op de achterkant van de bon.",1,"O. Even kijken.","Juist, maar weinig hulp en zonder aan te sluiten bij zijn situatie.","alt"],
      ["Heeft weinig zin, de meeste bezwaren worden afgewezen.",0,"Waarom zou ik het dan doen?","Je geeft je mening en onjuiste verwachtingen; niet integer.","integ"]]},
    {a:"Goed. Bedankt dan maar.",o:[
      ["Dus: u maakt binnen zes weken bezwaar met de foto erbij. Heeft u verder nog vragen? (beantwoordt) Sterkte met uw moeder, meneer. Fijne dag.",2,"Nee, dank u. Dag.","Afspraken herhaald, naar vragen gevraagd en gegroet.","af"],
      ["Dag.",1,"Dag.","Gegroet, maar zonder de afspraken te herhalen.","af"],
      ["En de volgende keer gewoon goed parkeren, hè?",0,"(loopt boos weg)","Je begint opnieuw over het conflict; geen professionele afronding.","af"]]}]},
  {id:"g-muziek",t:"4-aanw",titel:"Luide muziek in de stiltecoupé",intro:"In een stiltecoupé speelt een jongen muziek af via de luidspreker van zijn telefoon. Je loopt naar hem toe.",stappen:[
    {a:"(kijkt op) Wat moet je?",o:[
      ["Goedemiddag meneer. Ik ben boa van de NS. U zit in een stiltecoupé en uw muziek staat via de luidspreker aan; andere reizigers hebben daar last van. Ik vraag u de muziek uit te zetten of oortjes te gebruiken.",2,"(zet het iets zachter) Het is toch niet hard.","Je stelt je voor, zegt meneer en u en legt in een paar zinnen uit wat er speelt en wat je van hem vraagt.","sit"],
      ["Muziek uit. Dit is een stiltecoupé.",1,"Waarom zou ik?","Kort en feitelijk, maar zonder meneer/u en zonder uit te leggen wat het voor hem betekent.","sit"],
      ["Jongen, gebruik je verstand. Iedereen zit zich hier te ergeren.",0,"(zet het harder) Wat boeit het.","Je geeft je mening en bent denigrerend; de situatie escaleert.","regel"]]},
    {a:"En wie ben jij eigenlijk? Laat eens zien dan.",o:[
      ["Natuurlijk. (toont legitimatiebewijs) Ik ben buitengewoon opsporingsambtenaar in het openbaar vervoer.",2,"Oké… Het is toch niet hard.","Je legitimeert je als daarom wordt gevraagd.","ben4"],
      ["Dat zie je toch aan mijn uniform.",0,"Iedereen kan zo'n pak aantrekken.","Je weigert je te legitimeren; dat moet als erom wordt gevraagd.","ben4"],
      ["Doet er niet toe. Zet je muziek uit.",0,"(negeert je)","Je gaat niet in op zijn vraag en verliest het contact.","ben4"]]},
    {a:"Ik heb gewoon een rotdag gehad. Muziek helpt me. Waarom zeg je het alleen tegen mij?",o:[
      ["Ik merk dat u een zware dag heeft en dat de muziek u helpt om tot rust te komen. Wat is er gebeurd?",2,"(rustiger) Ontslagen. Gewoon zomaar.","Uitgebreide gevoelsreflectie en een vraag over de emotie; je laat hem uitpraten.","frus"],
      ["Iedereen heeft weleens een rotdag.",0,"Wat weet jij daar nou van.","Je bagatelliseert zijn emotie.","frus"],
      ["Ik zeg het tegen u omdat uw telefoon geluid maakt.",1,"Ja ja.","Feitelijk, maar je gaat voorbij aan zijn emotie.","frus"]]},
    {a:"(rustiger) Ik heb geen oortjes bij me.",o:[
      ["U heeft een rotdag en de muziek helpt u, maar oortjes heeft u niet. Twee coupés verder is een gewone coupé; daar mag u wel zacht muziek luisteren, zolang anderen er geen last van hebben. Of u zet hem hier uit. Wat kiest u?",2,"Dan ga ik wel daarheen.","Je herhaalt zijn situatie en biedt realistische keuzes nu de emotie gezakt is.","alt"],
      ["Dan zet je hem toch gewoon uit.",1,"Ja, oké.","Een alternatief, maar zonder aan te sluiten bij wat hij vertelde.","alt"],
      ["Dan had u die moeten meenemen.",0,"Dank je, heel behulpzaam.","Een verwijt in plaats van een alternatief.","alt"]]},
    {a:"(pakt zijn tas) Is het hiermee klaar?",o:[
      ["Ja. Dus: in de gewone coupé mag u zacht muziek luisteren, hier niet. Is het duidelijk waarom ik dit vroeg? Heeft u nog vragen? (beantwoordt) Sterkte vandaag, meneer.",2,"Ja, duidelijk. Bedankt.","Afspraak herhaald, gecontroleerd of de boodschap is begrepen, gevraagd naar vragen en gegroet.","regel"],
      ["Ja, sorry voor het gedoe.",0,"Mwah.","Excuses voor je optreden ondermijnen de aanwijzing.","af"],
      ["Ja. Dag.",1,"Dag.","Netjes, maar zonder afspraken te herhalen of te controleren of het begrepen is.","af"]]}]},
  {id:"g-roken",t:"4-feit",titel:"Roken op het perron",intro:"Op een overdekt perron met een rookverbod rookt een man een sigaret. Je hebt het zelf gezien en loopt naar hem toe.",stappen:[
    {a:"(rookt) Ja?",o:[
      ["Goedemiddag meneer, ik ben boa van de NS. Ik zie dat u rookt op dit perron, waar een rookverbod geldt. Dat is een strafbaar feit. Ik houd u staande en ik maak een proces-verbaal tegen u op.",2,"Ik sta toch bijna buiten? Wat is dat eigenlijk, staande houden?","Je noemt het juiste feit, houdt staande en zegt vanuit 'ik' proces-verbaal aan.","feit"],
      ["Sigaret uit, u krijgt een boete.",1,"Een boete? Waarvoor dan precies?","Je zegt een sanctie aan, maar noemt het feit niet duidelijk en houdt niet staande.","feit"],
      ["Mag ik vragen of u weet dat hier niet gerookt mag worden?",0,"Ja, en?","Geen feit, geen staande houding, geen proces-verbaal: de persoon bepaalt de richting.","regie"]]},
    {a:"Wat is dat eigenlijk, staande houden?",o:[
      ["Staande houden betekent dat u even moet blijven, zodat ik uw identiteit kan vaststellen. Die heb ik nodig om het proces-verbaal op te maken. Mag ik uw identiteitsbewijs zien?",2,"(aarzelt) Moet dat echt?","Je legt de term in gewone woorden uit en zegt waarom je de gegevens nodig hebt.","taal"],
      ["Dat is een opsporingsbevoegdheid uit artikel 52 van het Wetboek van Strafvordering.",0,"Hè?","Vakjargon zonder uitleg; de boodschap komt niet over.","taal"],
      ["Dat u niet weg mag.",1,"Hoe lang dan?","Gedeeltelijk juist, maar je legt niet uit waarom.","taal"]]},
    {a:"Ik vind het echt overdreven. Een boete voor één sigaret!",o:[
      ["Ik merk dat u het overdreven vindt, omdat u maar kort rookte en bijna buiten staat. Klopt dat? (laat hem uitpraten)",2,"Ja… Ik wist niet dat dit deel ook overdekt telt.","Uitgebreide gevoelsreflectie en ruimte voor zijn verhaal voordat je zakelijk verdergaat.","emo"],
      ["Regels zijn regels.",0,"Lekker makkelijk.","Geen ruimte voor emotie of verhaal; je gaat meteen zakelijk verder.","emo"],
      ["Dat begrijp ik, maar het is nu eenmaal zo.",1,"Hm.","Een korte erkenning, maar je gaat verder terwijl de emotie nog niet gezakt is.","emo"]]},
    {a:"(geeft ID-kaart) En nu?",o:[
      ["U bent niet verplicht om antwoord te geven op mijn vragen. Wilt u verklaren waarom u hier rookte? (luistert) Ik maak het proces-verbaal op; u krijgt binnen enkele weken een beschikking of strafbeschikking thuisgestuurd, met daarin hoe u bezwaar kunt maken.",2,"Oké. Ik wist het echt niet.","Je geeft de cautie voordat je om een verklaring vraagt en informeert hem juist over wat er nu gebeurt.","info"],
      ["Waarom rookte u hier? (schrijft op)",0,"Ik wist het niet.","Je vraagt om een verklaring zonder cautie (artikel 29 Sv).","info"],
      ["U hoort er nog van.",1,"Van wie dan?","Te weinig informatie; hij moet om uitleg vragen.","info"]]},
    {a:"Mag ik nu gaan?",o:[
      ["Ja. Het rookverbod geldt op het hele overdekte perron; rookt u voortaan buiten het station. Is dat duidelijk? Heeft u nog vragen? (beantwoordt) Goedemiddag, meneer.",2,"Duidelijk. Dag.","Je herhaalt de regel, controleert of het begrepen is, vraagt naar vragen en groet.","regel"],
      ["Ja hoor. Volgende keer beter opletten.",0,"(loopt weg)","Een verwijt aan het eind; geen professionele afronding.","regel"],
      ["Ja. Fijne dag nog.",1,"Dag.","Netjes gegroet, maar je controleert niet of de boodschap is begrepen.","regel"]]}]}
];
const KZBY=Object.fromEntries(KZ.map(c=>[c.id,c])),GBY=Object.fromEntries(GESPREK.map(g=>[g.id,g]));
const kzTypes=()=>Object.keys(KZT).filter(k=>KZT[k].dom===dom());
const kzOordeel=(t,p)=>p>=KZT[t].ces[1]?"Goed":p>=KZT[t].ces[0]?"Voldoende":"Onvoldoende";
const kzKlasse=o=>o==="Onvoldoende"?"fail":"pass";
let KZ_T=0,KZ_TI=0,kzRec=null,kzRecUrl="",kzRecFout="",kzBeoord="",G=null;
function kzStopTimer(){clearInterval(KZ_TI);KZ_TI=0}
function kzRecStop(wis){if(kzRec&&kzRec.state==="recording"){try{kzRec.stop()}catch(e){}}if(wis){if(kzRecUrl)try{URL.revokeObjectURL(kzRecUrl)}catch(e){}kzRecUrl="";kzRecFout=""}}
function kzResults(id){return (store.k||[]).filter(r=>r.cs===id)}
// ----- overzicht (#casus) -----
function viewCasusLijst(){
  const ts=kzTypes();const D4=dom()==="4";
  return `<div class="stack">${modChips("phb2")}
    <div class="stack" style="gap:8px"><a class="small" href="#phb2">← PHB 2 Bejegening</a><span class="eyebrow">Praktijk · domein ${D4?"IV":"I–III"}</span><h1>Gesprekken oefenen</h1>
    <p class="lede">Het examen Bejegening is een gesprek met een acteur: ${D4?"twee casussen (aanwijzing en strafbaar feit)":"drie casussen (calamiteit, aanwijzing en balie dienstverlening)"} in 30 minuten. Elke casus moet minimaal voldoende zijn.</p></div>
    <div class="stack" style="gap:8px"><span class="eyebrow">Mijn domein</span>${domSwitch()}</div>
    <div class="section stack"><div><h2>Kies je antwoord</h2><p class="small">Een gesprek als keuzeboom: per beurt kies je wat je zegt en zie je hoe de persoon reageert en waarom.</p></div>
      <div class="kzlist">${GESPREK.filter(g=>KZT[g.t].dom===dom()).map(g=>{const best=(store.k||[]).filter(r=>r.cs===g.id).reduce((a,r)=>Math.max(a,Math.round(100*r.p/r.m)),-1);
        return `<div class="kzitem"><div><span class="eyebrow">${esc(KZT[g.t].naam)}</span><b>${esc(g.titel)}</b><span class="small">${g.stappen.length} beurten${best>=0?` · beste score ${best}%`:""}</span></div><a class="btn hi" href="#gesprek-${g.id}">${best>=0?"Opnieuw":"Start"}</a></div>`}).join("")}</div></div>
    <div class="section stack"><div><h2>Casussen met de rubric</h2><p class="small">Oefen hardop, alleen of met een collega die de rol speelt. Daarna beoordeel je jezelf met de criteria uit de rubric van ExTH.</p></div>
      ${ts.map(t=>`<div class="stack" style="gap:8px"><h3>${esc(KZT[t].naam)} <span class="small" style="font-weight:400">· ${KZT[t].max} punten · voldoende vanaf ${KZT[t].ces[0]}</span></h3><div class="kzlist">${KZ.filter(c=>c.t===t).map(c=>{const rs=kzResults(c.id);const l=rs[0];
        return `<div class="kzitem"><div><b>${esc(c.titel)}</b><span class="small">${l?`Laatst: ${l.p}/${l.m} · <span class="pill ${kzKlasse(l.o)}">${esc(l.o)}</span>`:"Nog niet geoefend"}</span></div><a class="btn" href="#casus-${c.id}">${l?"Opnieuw":"Oefen"}</a></div>`}).join("")}</div></div>`).join("")}
    </div>
    <p class="small"><a href="#stof-${D4?"praktijk":"bejeg1"}">Studiestof: ${D4?"het gesprek bij een aanwijzing en een strafbaar feit":"de drie casussen van domein I"} →</a></p>
  </div>`;
}
// ----- casuskaart (#casus-<id>) -----
function viewCasus(id){
  const c=KZBY[id];if(!c)return viewCasusLijst();const T=KZT[c.t];
  const loopt=!!KZ_T;const recKan=!!(window.MediaRecorder&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
  const rec=kzRec&&kzRec.state==="recording";
  if(kzBeoord===id)return viewKzBeoordeel(c);
  return `<div class="stack kzkaart">
    <div class="stack" style="gap:8px"><a class="small" href="#casus">← Alle gesprekken</a><span class="eyebrow">Casus ${esc(T.naam.toLowerCase())} · domein ${T.dom==="4"?"IV":"I–III"}</span><h1>${esc(c.titel)}</h1></div>
    <div class="panel stack"><h2>De situatie</h2><p>${esc(c.s)}</p><h3>Wat moet je bereiken?</h3><p>${esc(c.d)}</p><h3>Let op</h3><p class="small">${esc(c.l)}</p></div>
    <details class="panel kzrol"><summary><b>Rolkaart voor je oefenpartner</b> <span class="small">(niet zelf lezen als je alleen oefent)</span></summary><p>${esc(c.r)}</p></details>
    <div class="panel stack"><div class="row" style="justify-content:space-between;align-items:center"><div><h2>Oefenen</h2><p class="small">Richttijd ${T.min} minuten. Voer het gesprek hardop, alsof de acteur voor je staat.</p></div>
      <div class="kztimer mono" id="kzTimer" aria-live="off">${loopt?kzKlok():T.min+":00"}</div></div>
      <div class="row">${loopt?`<button class="btn" data-act="kz-stop">Timer stoppen</button>`:`<button class="btn hi" data-act="kz-start" data-min="${T.min}">Start timer</button>`}
      ${recKan?(rec?`<button class="btn danger" data-act="kz-rec-stop">● Opname stoppen</button>`:`<button class="btn" data-act="kz-rec">Opnemen</button>`):""}</div>
      ${recKan?`<p class="small">Neem jezelf op en luister terug hoe je klinkt. De opname blijft alleen op dit apparaat en verdwijnt als je deze pagina verlaat.</p>`:`<p class="small">Opnemen kan niet in deze browser. Gebruik eventueel de spraakrecorder van je telefoon.</p>`}
      ${kzRecFout?`<p class="small err">${esc(kzRecFout)}</p>`:""}
      ${kzRecUrl?`<audio controls src="${kzRecUrl}" class="kzaudio"></audio>`:""}</div>
    <div class="row"><button class="btn hi" data-act="kz-beoordeel">Klaar: beoordeel jezelf</button></div>
  </div>`;
}
function kzKlok(){const T=KZT[(KZBY[route().slice(6)]||{}).t];const rest=Math.max(0,(T?T.min*60:600)-Math.floor((Date.now()-KZ_T)/1000));return String(Math.floor(rest/60))+":"+String(rest%60).padStart(2,"0")}
function viewKzBeoordeel(c){const T=KZT[c.t];
  return `<div class="stack kzkaart"><div class="stack" style="gap:8px"><button class="linkbtn small" data-act="kz-terug">← Terug naar de casus</button><span class="eyebrow">Zelfbeoordeling · ${esc(T.naam)}</span><h1>${esc(c.titel)}</h1>
    <p class="lede">Kies per criterium wat het best past bij hoe jouw gesprek ging. Wees eerlijk: zo zie je waar je punten laat liggen.</p></div>
    <form id="kzForm" class="stack">${T.crit.map((k,i)=>{const C=KZC[k];return `<fieldset class="kzcrit"><legend><span class="mono small">${i+1}</span> ${esc(C[0])}</legend>${C[1].map((t,p)=>`<label class="kzlvl"><input type="radio" name="kz${i}" value="${p+1}"><span><b>${p+1} ${p?"punten":"punt"}</b> ${esc(t)}</span></label>`).join("")}</fieldset>`}).join("")}
    <p class="small err" id="kzErr" hidden>Kies bij elk criterium een niveau.</p>
    <div class="row"><button class="btn hi" type="button" data-act="kz-score" data-id="${c.id}">Bereken mijn score</button></div></form></div>`}
function kzScore(id){const c=KZBY[id],T=KZT[c.t];const f=document.getElementById("kzForm");if(!f)return;
  const v=T.crit.map((k,i)=>{const r=f.querySelector(`input[name="kz${i}"]:checked`);return r?+r.value:0});
  if(v.some(x=>!x)){const e=document.getElementById("kzErr");if(e){e.hidden=false;const i=v.findIndex(x=>!x);const fs=f.querySelectorAll("fieldset")[i];if(fs)fs.scrollIntoView({block:"center"})}return}
  const p=v.reduce((a,b)=>a+b,0);const o=kzOordeel(c.t,p);
  store.k=[{id:"k"+Date.now().toString(36),cs:id,d:Date.now(),p,m:T.max,o,v}].concat(store.k||[]).slice(0,60);save();
  kzBeoord="";kzStopTimer();KZ_T=0;location.hash="casus-uitslag-"+id;
}
function viewKzUitslag(id){const c=KZBY[id];const r=kzResults(id)[0];if(!c||!r)return viewCasusLijst();const T=KZT[c.t];
  const mis=T.crit.map((k,i)=>[KZC[k],r.v&&r.v[i]||0]).filter(x=>x[1]<x[0][1].length);
  return `<div class="stack"><span class="eyebrow">Zelfbeoordeling · ${esc(T.naam)}</span>
    <div class="verdict ${kzKlasse(r.o)}"><div class="stack" style="gap:4px"><span class="eyebrow">${esc(c.titel)}</span><h2>${esc(r.o)}</h2><p>${r.p} van de ${r.m} punten. Voldoende vanaf ${T.ces[0]}, goed vanaf ${T.ces[1]}.</p></div></div>
    ${mis.length?`<div class="section stack"><h2>Hier haal je nog punten</h2><ul class="kztips">${mis.map(([C,p])=>`<li><b>${esc(C[0])}</b> <span class="small">(${p} van ${C[1].length})</span><br><span class="small">Voor het maximum: ${esc(C[1][C[1].length-1])}</span></li>`).join("")}</ul></div>`:`<p class="note">Je scoorde op elk criterium het maximum. Probeer een andere casus of laat een collega meekijken.</p>`}
    <div class="row"><a class="btn hi" href="#casus-${id}">Nog een keer</a><a class="btn" href="#casus">Andere casus</a></div></div>`}
// ----- gesprek als keuzeboom (#gesprek-<id>) -----
function viewGesprek(id){const g=GBY[id];if(!g)return viewCasusLijst();
  if(!G||G.id!==id)G={id,stap:0,k:[],klaar:false};
  const T=KZT[g.t];const max=g.stappen.length*2;
  const bubbels=[];g.stappen.forEach((s,i)=>{if(i>G.stap)return;bubbels.push(`<div class="kzb ak"><span class="small">Persoon</span>${esc(s.a)}</div>`);
    const keus=G.k[i];if(keus!=null){const o=s.o[keus];bubbels.push(`<div class="kzb jij"><span class="small">Jij</span>${esc(o[0])}</div>`,`<div class="kzfb ${o[1]===2?"ok":o[1]===1?"mid":"bad"}"><b>${o[1]===2?"Sterk":o[1]===1?"Kan beter":"Niet handig"}</b> · ${esc(KZC[o[4]][0])}<br>${esc(o[3])}</div>`,`<div class="kzb ak"><span class="small">Persoon</span>${esc(o[2])}</div>`)}});
  const s=g.stappen[G.stap];const gekozen=G.k[G.stap]!=null;
  const p=G.k.reduce((a,k,i)=>a+g.stappen[i].o[k][1],0);
  let onder="";
  if(G.klaar){const pc=Math.round(100*p/max);
    onder=`<div class="verdict ${pc>=70?"pass":"fail"}"><div class="stack" style="gap:4px"><span class="eyebrow">Gesprek afgerond</span><h2>${pc}%</h2><p>${p} van de ${max} punten. ${pc>=85?"Sterk gesprek.":pc>=70?"Goed gesprek; kijk naar de beurten met 'Kan beter'.":"Lees de uitleg bij je keuzes en probeer het nog eens."}</p></div></div>
      <div class="row"><button class="btn hi" data-act="kz-g-opnieuw" data-id="${id}">Opnieuw</button><a class="btn" href="#casus">Andere gesprekken</a></div>`}
  else if(!gekozen)onder=`<div class="stack" style="gap:8px"><span class="eyebrow">Wat zeg je?</span>${kzVolgorde(id,G.stap).map(k=>`<button class="btn kzopt" data-act="kz-kies" data-k="${k}">${esc(s.o[k][0])}</button>`).join("")}</div>`;
  else onder=`<div class="row"><button class="btn hi" data-act="kz-verder">${G.stap+1<g.stappen.length?"Volgende beurt":"Bekijk je score"}</button></div>`;
  return `<div class="stack kzgesprek"><div class="stack" style="gap:8px"><a class="small" href="#casus">← Alle gesprekken</a><span class="eyebrow">${esc(T.naam)} · beurt ${Math.min(G.stap+1,g.stappen.length)} van ${g.stappen.length}</span><h1>${esc(g.titel)}</h1><p class="lede">${esc(g.intro)}</p></div>
    <div class="kzchat" aria-live="polite">${bubbels.join("")}</div>${onder}</div>`}
// vaste maar per beurt verschillende volgorde van de antwoorden (het beste antwoord staat niet altijd bovenaan)
function kzVolgorde(id,stap){const h=parseInt(hash(id+":"+stap).slice(1),36);return [[0,1,2],[1,0,2],[2,0,1],[1,2,0],[0,2,1],[2,1,0]][h%6]}
function casusClick(act,d){
  if(act==="kz-start"){KZ_T=Date.now();kzStopTimer();KZ_TI=setInterval(()=>{const el=document.getElementById("kzTimer");if(!el||route().indexOf("casus-")!==0){kzStopTimer();KZ_T=0;return}el.textContent=kzKlok();if(el.textContent==="0:00"){kzStopTimer();el.classList.add("op");toast("De richttijd is om")}},500);render();return true}
  if(act==="kz-stop"){kzStopTimer();KZ_T=0;render();return true}
  if(act==="kz-rec"){kzRecFout="";navigator.mediaDevices.getUserMedia({audio:true}).then(st=>{const ch=[];kzRecStop(true);kzRec=new MediaRecorder(st);
      kzRec.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};kzRec.onstop=()=>{st.getTracks().forEach(t=>t.stop());if(ch.length){kzRecUrl=URL.createObjectURL(new Blob(ch,{type:kzRec.mimeType||"audio/webm"}))}kzRec=null;if(route().indexOf("casus-")===0)render()};
      kzRec.start();render()}).catch(()=>{kzRecFout="Geen toegang tot de microfoon. Geef toestemming in je browser of telefoon en probeer het opnieuw.";render()});return true}
  if(act==="kz-rec-stop"){kzRecStop(false);return true}
  if(act==="kz-beoordeel"){kzRecStop(false);kzBeoord=route().slice(6);render();scrollTo(0,0);return true}
  if(act==="kz-terug"){kzBeoord="";render();return true}
  if(act==="kz-score"){kzScore(d.id);return true}
  if(act==="kz-kies"){const g=GBY[G&&G.id];if(!g||G.k[G.stap]!=null)return true;G.k[G.stap]=+d.k;render();const fb=document.querySelectorAll(".kzfb");if(fb.length)fb[fb.length-1].scrollIntoView({block:"nearest"});return true}
  if(act==="kz-verder"){const g=GBY[G&&G.id];if(!g)return true;if(G.stap+1<g.stappen.length)G.stap++;else{G.klaar=true;const p=G.k.reduce((a,k,i)=>a+g.stappen[i].o[k][1],0);
      store.k=[{id:"k"+Date.now().toString(36),cs:g.id,d:Date.now(),p,m:g.stappen.length*2,o:p/(g.stappen.length*2)>=.7?"Voldoende":"Onvoldoende"}].concat(store.k||[]).slice(0,60);save()}
    render();const o=document.querySelector(".kzopt,.kzgesprek .verdict");if(o)o.scrollIntoView({block:"nearest"});return true}
  if(act==="kz-g-opnieuw"){G=null;render();scrollTo(0,0);return true}
  return false}
function viewKz(r){
  if(r!=="casus"&&!/^casus-/.test(r)&&!/^gesprek-/.test(r))return "";
  if(r.indexOf("casus-uitslag-")===0)return viewKzUitslag(r.slice(14));
  if(r.indexOf("casus-")===0){const id=r.slice(6);if(kzBeoord!==id)kzBeoord="";return viewCasus(id)}
  if(r.indexOf("gesprek-")===0)return viewGesprek(r.slice(8));
  return viewCasusLijst()}
// kaart op de pagina van PHB 2
function kzKaart(){const n=GESPREK.filter(g=>KZT[g.t].dom===dom()).length,c=KZ.filter(x=>KZT[x.t].dom===dom()).length;const l=(store.k||[])[0];
  return `<div class="exam wvcard"><div class="big" aria-hidden="true"><svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M19 9h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-4-3h-3"/></svg></div><div class="stack" style="gap:10px">
    <div><h2>Gesprekken oefenen</h2><p class="small">Het examen is een gesprek met een acteur. Oefen ${n} gesprekken als keuzeboom en ${c} casussen met timer, opname en een zelfbeoordeling volgens de rubric van ExTH.${l?` Laatst geoefend: ${esc((KZBY[l.cs]||GBY[l.cs]||{}).titel||"")}, ${l.p}/${l.m}.`:""}</p></div>
    <div class="row"><a class="btn hi" href="#casus">Gesprekken oefenen</a></div></div></div>`}
// alleen voor tests (tests/groot.js)
try{if(localStorage.getItem("wv-debug"))window.__kz={GESPREK,KZT,KZC,kzVolgorde,kzOordeel,refFor,ALL,sessie:()=>S}}catch(e){}
