# Boa Paraat – app voor Android, iPhone en pc

Dit pakket bevat Boa Paraat, de examentrainer voor boa's, als app-project en als website. Je kiest hieronder de route die bij je past.

| Wat wil je? | Route | Nodig |
|---|---|---|
| Een APK voor Android-telefoons | **A. APK via GitHub** | Gratis GitHub-account |
| De app op iPhone én Android, zonder installatiebestand | **B. Web-app op het beginscherm** | Gratis GitHub-account |
| Oefenen op de pc (Windows, Mac, Chromebook) | **D. Webversie** | Gratis GitHub-account, of eigen webruimte |
| Een echte iPhone-app (App Store of TestFlight) | **C. iOS via Xcode** | Mac, Xcode en Apple Developer-account (€ 99 per jaar) |

Een iPhone kan geen APK installeren. Voor iPhone gebruik je route B of C.

---

## A. APK voor Android bouwen via GitHub (geen software nodig)

1. Ga naar github.com en maak een nieuwe repository aan, bijvoorbeeld `boa-paraat`.
2. Klik op **uploading an existing file** en sleep de **inhoud** van deze map erin (dus `www`, `assets`, `.github`, `package.json`, enzovoort). Klik op **Commit changes**.
   - Let op: de map `.github` is in Windows en macOS soms verborgen. Zet het tonen van verborgen bestanden aan, of maak het bestand `.github/workflows/android-apk.yml` handmatig aan in GitHub.
3. Open het tabblad **Actions**. De taak **Android APK bouwen** start vanzelf en duurt ongeveer 5 minuten.
4. Klik op de afgeronde taak en download onderaan **Boa-Paraat-apk**. Daarin zit `Boa-Paraat.apk`.
5. Zet de APK op je Android-telefoon (bijvoorbeeld via e-mail of Google Drive) en open hem. Sta toe dat je browser of bestandsbeheer apps installeert ("onbekende bronnen").

De APK is een release-versie met een oplopend versienummer. Met de **vaste sleutel** (zie hieronder) installeer je een nieuwe versie gewoon over de vorige heen; je voortgang blijft bewaard. In dezelfde download zit ook `Boa-Paraat.aab`: dat bestand upload je naar de Google Play Store (ontwikkelaarsaccount nodig).

### Vaste sleutel instellen (eenmalig)

Android accepteert een update alleen als hij met dezelfde sleutel is ondertekend als de geïnstalleerde versie. Die sleutel staat niet in de repository (die is openbaar), maar als geheim in GitHub:

1. Ga in je repository naar **Settings → Secrets and variables → Actions → New repository secret**.
2. Maak deze drie geheimen aan:

   | Naam | Waarde |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | de hele inhoud van `keystore-base64.txt` |
   | `ANDROID_KEYSTORE_PASSWORD` | het wachtwoord van de sleutel |
   | `ANDROID_KEY_ALIAS` | `boaparaat` |

3. Start in **Actions** de taak **Android APK bouwen** opnieuw (**Run workflow**).

Bewaar het sleutelbestand en het wachtwoord op een veilige plek, bijvoorbeeld in een wachtwoordkluis. **Raak je ze kwijt, dan kun je de app nooit meer bijwerken**: gebruikers moeten dan de app verwijderen en een nieuwe installeren. Deel ze met niemand.

Zonder deze geheimen bouwt GitHub nog steeds een APK, maar met een tijdelijke sleutel; die kan niet over een eerdere versie heen worden geïnstalleerd.

## B. Web-app op het beginscherm (iPhone en Android)

1. Doe stap 1 en 2 van route A.
2. Ga in de repository naar **Settings → Pages** en kies bij **Source** voor **GitHub Actions**.
3. Open **Actions** en start zo nodig **Web-app publiceren** opnieuw. Na afloop staat er een link, zoals `https://jouwnaam.github.io/phb-trainer/`.
4. Open die link op de telefoon:
   - **iPhone (Safari):** tik op het deelicoon en kies **Zet op beginscherm**.
   - **Android (Chrome):** tik op het menu (⋮) en kies **App installeren** of **Toevoegen aan startscherm**.

De app opent dan zonder browserbalk, met een eigen icoon, en werkt ook zonder internet.

## C. Echte iOS-app via Xcode

Nodig: een Mac met Xcode, Node.js 20 en een Apple Developer-account.

```bash
npm install
npx cap add ios
npx capacitor-assets generate --ios
npx cap open ios
```

In Xcode kies je bij **Signing & Capabilities** je team, sluit je een iPhone aan en klik je op **Run**. Voor collega's kies je **Product → Archive** en verspreid je de app via TestFlight.

## Android zelf bouwen met Android Studio (alternatief voor route A)

Nodig: Node.js 20 en Android Studio.

```bash
npm install
npx cap add android
npx capacitor-assets generate --android
npx cap open android
```

Kies in Android Studio **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.

## D. Webversie voor de pc

De webversie is dezelfde app als website. Op een scherm vanaf ongeveer 1100 pixels breed krijg je een pc-indeling:

- een bredere pagina met een zijbalk op het overzicht (voortgang, sneltoetsen en installeren);
- onderwerpen per module in twee kolommen;
- bij de studiestof een inhoudsopgave die meeloopt en laat zien waar je bent. Studiestof kun je ook afdrukken (Ctrl+P), zonder menu's en knoppen;
- sneltoetsen: **H** overzicht, **1–4** PHB 1 t/m 4, **S** studiestof, **P** profiel, **E** mijn examens, **?** alle sneltoetsen. Tijdens het oefenen: **A–D** of **1–4** kiezen, **Enter** verder, **← →** bladeren in toets en examen, **Esc** stoppen of een melding sluiten.

Publiceren kan op twee manieren:

1. **GitHub Pages (aanbevolen).** Doe route B. De link (bijvoorbeeld `https://jouwnaam.github.io/boa-paraat/`) werkt op de pc in Chrome, Edge, Firefox en Safari.
2. **Eigen webruimte.** Pak `Boa-Paraat-web.zip` uit en zet de inhoud in een map op je website (bijvoorbeeld via FTP). Er is geen server-software of database nodig. Gebruik https, anders werkt offline gebruik en installeren niet.

**Installeren op de pc:** in Chrome en Edge verschijnt op het overzicht de knop **Installeren** (of klik in de adresbalk op het installeer-icoon). Boa Paraat opent dan in een eigen venster, met een icoon in het startmenu of dock, en werkt ook zonder internet. In Safari op de Mac: **Archief → Voeg toe aan Dock**.

Voortgang staat per browser. Wie op telefoon én pc oefent, zet de voortgang over via **Profiel → Voortgang overzetten**.

## Iets aanpassen en een nieuwe versie maken

De leesbare bronbestanden staan in `bron/`; `www/index.html` wordt daaruit gebouwd. Pas dus altijd `bron/` aan en draai daarna:

```bash
python3 release.py
```

Dit script doet bij elke update hetzelfde:

1. bouwt de app en maakt hem compact (`www/index.html`, en in `uit/` het losse bestand `Boa-Paraat.html`);
2. zoekt onnodige code: ongebruikte functies, variabelen, CSS-klassen, CSS-variabelen, animaties en pictogrammen, knoppen zonder functie, dubbele functies, achtergebleven testcode (`console.log`, `debugger`, `alert`) en losse bestanden die niet in de app horen;
3. controleert of de code ook op oudere iPhones en Android-telefoons werkt;
4. controleert de vragenbank en studiestof (4 verschillende antwoorden, geen dubbele vragen, verwijzingen kloppen, het juiste antwoord is niet steeds het langste);
5. test de app in een browser op telefoon, tablet en pc, inclusief terugknop en terug-gebaar, vegen, de praktijkoefening, de toetsmatrijzen en de sneltoetsen, en draait een stresstest (`tests/stress.js`: zware gebruiker, trage telefoon, volle opslag, 8 uur open) en een chaostest (`tests/chaos.js`, zie hieronder);
6. verhoogt bij een gewijzigde app het versienummer in `www/sw.js`, zodat iedereen de update krijgt;
7. pakt `uit/Boa-Paraat-app.zip` en `uit/Boa-Paraat-web.zip` in.

### Stresstest en chaostest

`tests/chaos.js` is een 'aap' die op telefoon (licht en donker, domein I en IV) en pc honderden willekeurige dingen doet: knoppen en links aantikken (ook drie keer snel achter elkaar), vegen, typen (lange teksten, emoji, HTML), terug, herladen, het scherm draaien en de opslag beschadigen. Na elke paar stappen controleert hij dat er geen JS-fouten zijn, geen leeg scherm, geen verschoven pagina of achtergebleven overgang, geen horizontale scroll, hooguit één venster of keuzemenu, en dat de opslag leesbaar blijft. Daarna volgen gerichte belastingen: 60 keer razendsnel van tabblad wisselen, vegen tijdens een animatie, 15 oefenexamens achter elkaar per domein, gegevens uit oude versies en een lange sessie waarin het aantal elementen en het geheugen niet mogen groeien.

Elke ronde gebruikt een ander zaad (het staat bovenaan de uitvoer). Vindt de test een fout, dan noemt hij het scherm en de laatste stappen ervoor; met `CHAOS_SEED=<zaad> node tests/chaos.js` speel je dezelfde ronde opnieuw af. `CHAOS_STAPPEN` regelt het aantal stappen (standaard 350 per ronde). Een gevonden fout krijgt altijd ook een vaste test in het bestand van het onderdeel (bijvoorbeeld `tests/veeg.js`), zodat hij niet terugkomt.

### Vragen toevoegen of aanpassen

Vragen staan in `bron/q1.js` tot en met `bron/q7.js`; welke vraag bij welke toetsterm van ExTH hoort, staat in `bron/matrijs.js`. Schrijf ze volgens `bron/SCHRIJFWIJZER.md` (examentaal, vier aannemelijke antwoorden, uitleg en bron). Het releasescript controleert de regels die automatisch te controleren zijn. Laat bij een herschreven vraag het zesde veld (de vaste code) staan, dan blijft de voortgang van gebruikers bewaard.

### Een nieuwe versie uitbrengen

1. Zet het nieuwe versienummer in `package.json` (bijvoorbeeld `1.2.0`).
2. Schrijf `release-notities/v1.2.0.md`. De punten onder **## Nieuw** verschijnen na de update één keer in de app, in het venster "Nieuw in Boa Paraat".
3. Draai `python3 release.py` en zet alles in GitHub.
4. GitHub ziet het nieuwe versienummer, bouwt de APK en zet hem met de notities op de pagina **Releases**, met een vaste downloadlink. Latere updates met hetzelfde versienummer komen alleen bij **Actions**.

Gaat er iets mis, dan stopt het script, noemt het wat er mis is en pakt het niets in. `python3 release.py --snel` slaat de browsertests over.

Nodig voor de browsertests: Node.js 20 of nieuwer en Playwright (`npm install --no-save playwright` en `npx playwright install chromium`). Op GitHub draait de taak **Testen** dit automatisch bij elke upload.

## Goed om te weten

- Meldingen: onder **Profiel → Meldingen** zet je de oefenherinnering (dagelijks op een gekozen tijd, alleen als je nog niet hebt geoefend) en de examenherinnering (7, 3 en 1 dag ervoor, om 18:00) aan of uit. Meldingen buiten de app werken in de Android- en iOS-app; in de browser verschijnen ze als kaart op het overzicht.
- Weergave: onder **Profiel → Gegevens → Weergave** kies je **Systeem** (volgt licht/donker van je telefoon of computer), **Licht** of **Donker**.
- Voortgang en profiel worden per telefoon of browser bewaard. Met **Profiel → Voortgang overzetten** neem je ze mee naar een ander apparaat.
- App-naam: Boa Paraat. App-ID: `nl.boa.phbtrainer`. Dit staat in `capacitor.config.json`.
