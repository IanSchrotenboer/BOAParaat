# Schrijfwijzer vragen Boa Paraat

Vragen volgen de schrijftaal van de officiële examens (ExTH). Kwaliteit en uitleg blijven in de stijl van Boa Paraat.
`tests/data.js` controleert de regels die automatisch te controleren zijn; het releasescript stopt als er een regel wordt overtreden.

## Vraagstelling (examentaal)

1. **Formeel en volledig.** Volzin, eindigt met een vraagteken. Geen spreektaal of afkortingen die niet in de wet staan
   (`officier van justitie`, niet `OvJ`; `proces-verbaal`, niet `pv`; `maximaal`, niet `max.`).
2. **Vaste vraagvormen**, zoals op het examen:
   - Begrip: *Wat verstaan we onder …?* · *Wat houdt … in?* · *Hoe noemen we …?* · *Wat betekent '…'?*
   - Regel: *Welke hoofdregel geldt …?* · *Welke voorwaarde geldt …?* · *Wanneer mag …?*
   - Toepassing: *Welk strafbaar feit pleegt hij?* · *Welk beginsel is van toepassing?* · *Welke strafuitsluitingsgrond is van toepassing?*
3. **Wetsartikel in de vraag** waar de vraag over één artikel gaat: *artikel 128 Sv*, *artikel 2 Awbi*, *artikel 5:20 Awb*.
   Altijd voluit `artikel`, nooit `art.`. Zet het artikel niet in de vraag als het antwoord daarmee wordt weggegeven.
4. **Casus in de je-vorm**: *Je bent boa en …* / *Iemand verzet zich tegen je terwijl je …*. Eerst de feiten, de vraag in de laatste zin.
5. **Ontkenning in hoofdletters**: *Welke … is GEEN …?* / *… NIET …?*

## Antwoorden (eigen kwaliteit)

1. **Vier antwoorden**, één juist, het juiste staat in de bron altijd eerst (de app schudt).
2. **Elk antwoord is aannemelijk.** Geen afleiders die je zonder kennis wegstreept (zoals "mag altijd alles"). Woorden als *altijd*, *nooit* en *elke* alleen in foute antwoorden verraden het juiste antwoord (controle: maximaal 18% van de vragen).
3. **Gelijke lengte.** Het juiste antwoord is niet vaker het langste dan de andere (controle: maximaal 35%).
4. **Volzin of begrip met een hoofdletter, eindigend met een punt**: *Vanaf 14 jaar.* · *Ambtsdwang (artikel 179 Sr).*

## Uitleg en bron

- Bij elke vraag een uitleg in gewone taal: waarom het juiste antwoord klopt.
- Bron: het wetsartikel (`art. 128 Sv`) of het document, bij elke vraag verplicht. In de uitleg en de bron mag de korte notatie `art.`.

## Voortgang

Elke vraag heeft een vaste code (het zesde veld). Herschrijf je een vraag, laat die code dan staan: zo blijft de voortgang van gebruikers bewaard.

## Vragen in examenstijl (bron/q9.js)

Het theorie-examen van ExTH bestaat uit 50 gesloten vragen. De cesuur is 70%, of 55% met correctie voor de gokkans; dat past bij drie antwoordmogelijkheden. Vragen in `bron/q9.js` volgen die stijl:

- Per toetsterm uit de toetsmatrijs Wet- en regelgeving (Domein I v1.3, Domein IV v1.1), vooral de termen op niveau T (toepassen: "bij een gegeven situatie").
- Een korte praktijksituatie met een boa, daarna één vraag. Bijvoorbeeld: "Welk artikel past het best?", "Mag de boa …?", "Is er sprake van …?"
- Drie antwoorden. Vaak klinken er twee redelijk (bijvoorbeeld de algemene en de specifieke bepaling); het juiste is het beste antwoord.
- De vaste code begint met `qx9`; de controle staat dan drie antwoorden toe.
- Koppel elke vraag in `bron/matrijs.js` aan de toetsterm, zodat het oefenexamen haar meeneemt.
