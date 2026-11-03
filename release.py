#!/usr/bin/env python3
"""Boa Paraat – release in één keer: bouwen, optimaliseren, opschonen controleren, testen, inpakken.

Gebruik (vanuit deze map):
    python3 release.py              alles
    python3 release.py --snel       zonder browsertests (alleen bouwen en statische controles)

Stappen
 1. Bouwen uit bron/ → www/index.html (web-app en Android/iOS), uit/Boa-Paraat.html (los bestand),
    uit/phb-examentrainer.html (claude.ai-versie). De uitvoer wordt compact gemaakt.
 2. Opschonen controleren: ongebruikte functies en variabelen, ongebruikte CSS-klassen en id's,
    knoppen (data-act) zonder afhandeling, dubbele CSS-regels.
 3. Werkt op alle toestellen: JavaScript-syntaxis en code die oudere iPhones/Android-webviews niet kennen.
 4. Vragenbank en studiestof controleren (tests/data.js).
 5. Browsertests (tests/*.js met Playwright/Chromium): telefoon, tablet, pc, terug-knop/gebaar, praktijkoefening, webversie.
 6. Bij gewijzigde app: versie van de offline-opslag (www/sw.js) ophogen, zodat iedereen de update krijgt.
 7. Inpakken (alleen na alle tests, dus niet met --snel): uit/Boa-Paraat-app.zip (heel project, voor GitHub) en uit/Boa-Paraat-web.zip (alleen de website).

Stopt met foutcode 1 als er iets mis is; dan wordt er niets ingepakt.
"""
import re, os, sys, json, gzip, hashlib, subprocess, tempfile, zipfile, time

ROOT = os.path.dirname(os.path.abspath(__file__))
BRON = os.path.join(ROOT, 'bron'); UIT = os.path.join(ROOT, 'uit'); WWW = os.path.join(ROOT, 'www')
SNEL = '--snel' in sys.argv
problemen, meldingen = [], []
def kop(t): print('\n== ' + t)
def fout(t): problemen.append(t); print('  FOUT  ' + t)
def let_op(t): meldingen.append(t); print('  let op ' + t)
def ok(t): print('  ok    ' + t)
def lees(*p): return open(os.path.join(*p), encoding='utf-8').read()

# ---------------------------------------------------------------- 1. bouwen
kop('1. Bouwen en compact maken')
head = lees(BRON, 'v2_head.html'); body_src = lees(BRON, 'v2_body.html')
data = '\n'.join(lees(BRON, f) for f in ['q1.js', 'q2.js', 'q3.js', 'q4.js', 'q5.js', 'q6.js', 'q7.js', 'stof.js', 'matrijs.js'])
extra = ''.join(lees(BRON, f) for f in ['wv.js', 'wv_ui.js', 'ui_extra.js', 'fouten.js', 'licentie.js'])
VERSIE = json.load(open(os.path.join(ROOT, 'package.json')))['version']
notities = os.path.join(ROOT, 'release-notities', 'v' + VERSIE + '.md')
NIEUW = []
if os.path.exists(notities):
    tekst = lees(notities)
    blok = tekst.split('## Nieuw', 1)[1].split('\n## ', 1)[0] if '## Nieuw' in tekst else ''
    for L in blok.splitlines():
        m_ = re.match(r'- \*\*(.+?):?\*\*:?\s*(.+)', L.strip())
        if m_: NIEUW.append([m_.group(1).rstrip(':'), m_.group(2)[:1].upper() + m_.group(2)[1:]])
# licentielogo's (aangeleverd door de organisatie): bron/licenties/<id>-logo.svg of .png
import base64
def logo_data(lid):
    for ext, mime in (('svg', 'image/svg+xml'), ('png', 'image/png')):
        f = os.path.join(BRON, 'licenties', lid + '-logo.' + ext)
        if os.path.exists(f): return 'data:%s;base64,%s' % (mime, base64.b64encode(open(f, 'rb').read()).decode())
    return ''
body_src = re.sub(r'/\*__LOGO_(\w+)__\*/""', lambda m: json.dumps(logo_data(m.group(1))), body_src)
body = body_src.replace('/*__DATA__*/', data).replace('/*__WV__*/', extra)
body = body.replace('/*__VERSIE__*/', 'const APP_VERSIE=%s,NIEUW=%s;' % (json.dumps(VERSIE), json.dumps(NIEUW, ensure_ascii=False)))

def compact_css(m):
    css = re.sub(r'/\*.*?\*/', '', m.group(1), flags=re.S)
    css = re.sub(r'\s*\n\s*', '', css); css = re.sub(r'\s*([{};])\s*', r'\1', css)
    css = css.replace(';}', '}')
    return '<style>' + css + '</style>'
def compact_js(m):
    regels = [L.strip() for L in m.group(1).split('\n')]
    return '<script>' + '\n'.join(s for s in regels if s and not s.startswith('//')) + '</script>'
def compact(html):
    html = re.sub(r'<style>(.*?)</style>', compact_css, html, flags=re.S)
    return re.sub(r'<script>(.*?)</script>', compact_js, html, flags=re.S)

H, Bd = compact(head), compact(body)
os.makedirs(UIT, exist_ok=True)
open(os.path.join(UIT, 'phb-examentrainer.html'), 'w', encoding='utf-8').write(H + Bd)
OMSCHRIJVING = ("Boa Paraat, de examentrainer voor boa's: oefenvragen, oefenexamens en studiestof voor PHB 1 t/m 4 "
                "(ook domein IV openbaar vervoer) en een praktijkoefening waarneming en verslaglegging. Werkt op pc, tablet en telefoon.")
meta = ('<meta name="description" content="%s">\n<meta property="og:type" content="website">\n<meta property="og:locale" content="nl_NL">\n'
        '<meta property="og:title" content="Boa Paraat – De Examentrainer">\n<meta property="og:description" content="%s">\n') % (OMSCHRIJVING, OMSCHRIJVING)
NOSCRIPT = '<noscript><p style="padding:24px;font:16px sans-serif">Boa Paraat heeft JavaScript nodig. Zet JavaScript aan in je browser.</p></noscript>\n'
full = ('<!doctype html>\n<html lang="nl">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
        '<meta name="format-detection" content="telephone=no">\n' + meta +
        '<style>:root{padding-top:env(safe-area-inset-top,0px)}</style>\n'
        + H.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '') + '</head>\n<body>\n' + NOSCRIPT + Bd + '</body>\n</html>\n')
open(os.path.join(UIT, 'Boa-Paraat.html'), 'w', encoding='utf-8').write(full)
pwa = ('<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" type="image/png" href="icons/icon-192.png">\n'
       '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n<meta name="apple-mobile-web-app-title" content="Boa Paraat">\n'
       '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n<meta property="og:image" content="icons/icon-512.png">\n')
web = full.replace('<meta name="mobile-web-app-capable" content="yes">\n', '<meta name="mobile-web-app-capable" content="yes">\n' + pwa, 1)
web = web.replace('</body>', '<script>if("serviceWorker" in navigator&&!window.Capacitor&&/^https?:$/.test(location.protocol)){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}</script>\n</body>', 1)
open(os.path.join(WWW, 'index.html'), 'w', encoding='utf-8').write(web)
bron_bytes = len((head + body).encode())
kb = lambda n: '%.0f kB' % (n / 1024)
ok('versie %s, %d punten bij Nieuw' % (VERSIE, len(NIEUW)))
ok('gebouwd: %s (bron %s, gzip %s over internet)' % (kb(len(full.encode())), kb(bron_bytes), kb(len(gzip.compress(web.encode(), 9)))))

# ---------------------------------------------------------------- 2. opschonen
kop('2. Onnodige code zoeken')
css = '\n'.join(re.findall(r'<style>(.*?)</style>', head, flags=re.S))
css_nc = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
js = '\n'.join(re.findall(r'<script>(.*?)</script>', body, flags=re.S))
js_nc = re.sub(r'^\s*//.*$', '', js, flags=re.M)
html_js = re.sub(r'<style>.*?</style>', '', head + body, flags=re.S)  # alles behalve CSS
def telt(naam, tekst): return len(re.findall(r'(?<![\w$])' + re.escape(naam) + r'(?![\w$])', tekst))
# ongebruikte functies en variabelen (alleen gedeclareerd, nergens gebruikt)
namen = set(re.findall(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(', js_nc))
namen |= set(re.findall(r'\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=', js_nc))
for kom in re.findall(r'\b(?:let|var)\s+([A-Za-z_$][\w$]*(?:\s*=\s*[^,;]+)?(?:\s*,\s*[A-Za-z_$][\w$]*(?:\s*=\s*[^,;]+)?)+)\s*;', js_nc):
    namen |= set(re.findall(r'(?:^|,)\s*([A-Za-z_$][\w$]*)', kom))
ongebruikt = sorted(n for n in namen if telt(n, js_nc) == 1)
for n in ongebruikt: fout('ongebruikt in JavaScript: ' + n)
if not ongebruikt: ok('geen ongebruikte functies of variabelen (%d namen gecontroleerd)' % len(namen))
# ongebruikte CSS-klassen en id's
klassen = set(re.findall(r'\.(-?[A-Za-z_][\w-]*)', re.sub(r'url\([^)]*\)|\d\.\d+|\{[^{}]*\}', '{}', css_nc)))
ids = set(re.findall(r'#([A-Za-z][\w-]*)(?=[^{}]*\{)', css_nc))
dood = sorted(k for k in klassen if not re.search(r'(?<![\w-])' + re.escape(k) + r'(?![\w-])', html_js))
dood_id = sorted(i for i in ids if not re.search(r'(?<![\w-])' + re.escape(i) + r'(?![\w-])', html_js))
for k in dood: fout('CSS-klasse wordt nergens gebruikt: .' + k)
for i in dood_id: fout('CSS-id wordt nergens gebruikt: #' + i)
if not dood and not dood_id: ok('alle %d CSS-klassen en %d id\'s worden gebruikt' % (len(klassen), len(ids)))
# knoppen zonder afhandeling
acts = set(re.findall(r'data-act=\\?"([\w-]+)\\?"', body))
zonder = sorted(a for a in acts if len(re.findall(r'["\']' + re.escape(a) + r'["\']', js_nc.replace('data-act="' + a + '"', ''))) == 0
                and not (a.startswith('wv-') or a.startswith('yt-')) )
zonder += sorted(a for a in acts if (a.startswith('wv-') or a.startswith('yt-')) and not re.search(r'===\s*"' + re.escape(a) + '"|"' + re.escape(a) + r'"\s*[,\]]', js_nc))
for a in zonder: fout('knop data-act="%s" heeft geen afhandeling' % a)
if not zonder: ok('alle %d soorten knoppen hebben een afhandeling' % len(acts))
# dubbele CSS-regels (zelfde selector twee keer buiten @media)
plat = re.sub(r'@(?:media|keyframes|supports)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}', '', css_nc)
sels = [s.strip() for s in re.findall(r'([^{}]+)\{[^{}]*\}', plat)]
dubbel = sorted({s for s in sels if sels.count(s) > 1})
for s in dubbel: let_op('CSS-selector staat twee keer: ' + s)
if not dubbel: ok('geen dubbele CSS-selectors')
# ongebruikte CSS-variabelen en animaties
alles = head + body
varn = sorted(set(re.findall(r'(--[\w-]+)\s*:', css_nc)))
doodv = [v for v in varn if not re.search(r'var\(\s*' + re.escape(v) + r'(?![\w-])', alles) and not re.search(re.escape(v) + r'[\'"]', html_js)]
for v in doodv: fout('CSS-variabele wordt nergens gebruikt: ' + v)
kf = re.findall(r'@keyframes\s+([\w-]+)', css_nc)
doodk = [k for k in kf if telt(k, alles) < 2]
for k in doodk: fout('animatie wordt nergens gebruikt: @keyframes ' + k)
if not doodv and not doodk: ok('alle %d CSS-variabelen en %d animaties worden gebruikt' % (len(varn), len(kf)))
# ongebruikte pictogrammen
mi = re.search(r'const ICON = \{(.*?)\n\};', body, flags=re.S)
if mi:
    rest = js_nc.replace(mi.group(1), '')
    ik = re.findall(r'^\s*([A-Za-z_]\w*)\s*:', mi.group(1), flags=re.M)
    doodi = [k for k in ik if not re.search(r'ICON\.' + k + r'\b|["\'`]' + k + r'["\'`]', rest)]
    for k in doodi: fout('pictogram wordt nergens gebruikt: ICON.' + k)
    if not doodi: ok('alle %d pictogrammen worden gebruikt' % len(ik))
# losse bestanden in de hoofdmap die niet in de app of het project horen (schermafdrukken, testbestanden)
TOEGESTAAN = {'LEESMIJ.md', 'capacitor.config.json', 'package.json', 'package-lock.json', 'release.py', '.gitignore'}
los = sorted(f_ for f_ in os.listdir(ROOT) if os.path.isfile(os.path.join(ROOT, f_)) and f_ not in TOEGESTAAN)
for f_ in los: fout('los bestand in de hoofdmap (hoort niet in het project): ' + f_)
if not los: ok('geen losse bestanden in de hoofdmap')
# achtergebleven testcode
rest_dbg = [p_ for p_ in (r'\bconsole\.(?:log|debug)\(', r'\bdebugger\b', r'\balert\(') if re.search(p_, js_nc)]
for p_ in rest_dbg: fout('testcode in de app: ' + p_.replace('\\b', '').replace('\\', ''))
if not rest_dbg: ok('geen console.log, debugger of alert achtergebleven')
# dubbele functies: twee functies met precies dezelfde inhoud
fn = {}
for naam_, lijf in re.findall(r'\bfunction\s+([\w$]+)\s*\(([^)]*\)\s*\{[^{}]{40,}\})', js_nc):
    fn.setdefault(re.sub(r'\s+', '', lijf), []).append(naam_)
dub = [v for v in fn.values() if len(v) > 1]
for v in dub: let_op('functies met dezelfde inhoud: ' + ', '.join(v))
if not dub: ok('geen functies met dubbele inhoud')

# ---------------------------------------------------------------- 3. alle toestellen
kop('3. Werkt op alle toestellen (syntaxis en oudere browsers)')
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
    f.write('\n;\n'.join(re.findall(r'<script>(.*?)</script>', web, flags=re.S))); tmp = f.name
r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True); os.unlink(tmp)
(ok('JavaScript-syntaxis klopt') if r.returncode == 0 else fout('JavaScript-syntaxis: ' + (r.stderr.strip().splitlines() or ['?'])[-1]))
COMPAT_JS = [(r'\(\?<[=!]', 'lookbehind in reguliere expressie (iOS 16.3 en ouder)'),
             (r'(?:\|\||&&|\?\?)=', 'logische toewijzing ||= &&= ??= (iOS 14.0 en ouder)'),
             (r'\bstructuredClone\(', 'structuredClone (iOS 15.3 en ouder)'),
             (r'\.findLast(?:Index)?\(', 'findLast (iOS 15.3 en ouder)'),
             (r'\bObject\.hasOwn\(', 'Object.hasOwn (iOS 15.3 en ouder)'),
             (r'\.at\(-?\d', '.at() (iOS 15.3 en ouder)')]
COMPAT_CSS = [(r'color-mix\(', 'color-mix (oudere Android-webviews)'), (r':has\(', ':has() (oudere Android-webviews)'),
              (r'@container', 'container queries'), (r'(?<![\w-])inset\s*:', 'inset: (Android-webview 86 en ouder)'),
              (r'(?:margin|padding)-inline\s*:', 'margin/padding-inline (Android-webview 86 en ouder)')]
comp = 0
for pat, wat in COMPAT_JS:
    if re.search(pat, js_nc): fout('JavaScript gebruikt ' + wat); comp += 1
for pat, wat in COMPAT_CSS:
    if re.search(pat, css_nc): fout('CSS gebruikt ' + wat); comp += 1
if not comp: ok('geen code die oudere iPhones of Android-webviews niet kennen')

# ---------------------------------------------------------------- 4 + 5. tests
def draai(naam, env=None, timeout=900):
    t0 = time.time()
    r = subprocess.run(['node', os.path.join(ROOT, 'tests', naam)], capture_output=True, text=True, cwd=ROOT, env=env, timeout=timeout)
    uit = r.stdout + r.stderr
    fails = [L[5:].strip() for L in uit.splitlines() if L.startswith('FAIL')]
    geslaagd = len([L for L in uit.splitlines() if L.startswith('ok')])
    for L in uit.splitlines():
        if L.startswith('let op'): let_op(naam + ': ' + L[7:])
    if fails or (r.returncode not in (0, 1)) or ('Error' in r.stderr and not fails):
        for f_ in fails: fout(naam + ': ' + f_)
        if not fails: fout(naam + ': ' + (r.stderr.strip().splitlines() or ['test liep vast'])[-1])
    else:
        ok('%s: %s (%.0f s)' % (naam, ('%d geslaagd' % geslaagd) if geslaagd else (uit.strip().splitlines() or [''])[-1], time.time() - t0))
    return uit
kop('4. Vragenbank en studiestof')
d = draai('data.js')
for L in d.splitlines():
    if L.startswith('vragen:') or L.startswith('juiste'): print('        ' + L)
if not SNEL:
    kop('5. Browsertests')
    env = dict(os.environ, BOA_URL='file://' + os.path.join(UIT, 'Boa-Paraat.html'), BOA_SHOTS=os.path.join(UIT, 'schermen'))
    os.makedirs(env['BOA_SHOTS'], exist_ok=True)
    env['CHAOS_SEED'] = os.environ.get('CHAOS_SEED', str(int(time.time()) % 100000)); ok('chaostest met zaad %s' % env['CHAOS_SEED'])
    for t in ['suite.js', 'back.js', 'var.js', 'pc.js', 'stijl.js', 'welkom.js', 'meldingen.js', 'veeg.js', 'rtgb.js', 'matrijs.js', 'fouten.js', 'licentie.js', 'stress.js', 'chaos.js']: draai(t, env)
else:
    let_op('browsertests overgeslagen (--snel)')

if problemen:
    print('\n%d probleem/problemen gevonden. Niet ingepakt. Los ze op en draai opnieuw.' % len(problemen)); sys.exit(1)
if SNEL:
    print('\nSnelle controle klaar. Niet ingepakt: draai zonder --snel voor een release.'); sys.exit(0)

# ---------------------------------------------------------------- 6. versie offline-opslag
kop('6. Versie')
vpad = os.path.join(BRON, 'versie.json')
versie = json.load(open(vpad)) if os.path.exists(vpad) else {}
sw = lees(WWW, 'sw.js'); m = re.search(r'boa-paraat-v(\d+)', sw); nu = int(m.group(1))
vingerafdruk = hashlib.sha256((web + lees(WWW, 'manifest.webmanifest')).encode()).hexdigest()[:16]
if versie.get('hash') != vingerafdruk:
    if versie.get('hash'):
        nu += 1; open(os.path.join(WWW, 'sw.js'), 'w', encoding='utf-8').write(sw.replace(m.group(0), 'boa-paraat-v%d' % nu))
        ok('app gewijzigd: offline-opslag naar v%d (iedereen krijgt de update)' % nu)
    else: ok('eerste release met dit script: v%d' % nu)
else: ok('app niet gewijzigd: blijft v%d' % nu)
vorige = versie.get('bytes')
versie.update(sw=nu, hash=vingerafdruk, bytes=len(full.encode()), datum=time.strftime('%Y-%m-%d %H:%M'))
json.dump(versie, open(vpad, 'w'), indent=2)
if vorige: ok('grootte t.o.v. vorige release: %+d bytes' % (len(full.encode()) - vorige))

# ---------------------------------------------------------------- 7. inpakken
kop('7. Inpakken')
SKIP = {'uit', 'node_modules', 'android', 'ios', '.git', '__pycache__'}
def zip_map(doel, bron, prefix=''):
    with zipfile.ZipFile(doel, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for d_, dirs, files in os.walk(bron):
            dirs[:] = sorted(x for x in dirs if not (x in SKIP and (d_ == bron or x in ('node_modules', '.git', '__pycache__'))))
            for f_ in sorted(files):
                p = os.path.join(d_, f_); z.write(p, os.path.join(prefix, os.path.relpath(p, bron)))
zip_map(os.path.join(UIT, 'Boa-Paraat-app.zip'), ROOT)
zip_map(os.path.join(UIT, 'Boa-Paraat-web.zip'), WWW)
ok('uit/Boa-Paraat-app.zip (%s), uit/Boa-Paraat-web.zip (%s)' % (kb(os.path.getsize(os.path.join(UIT, 'Boa-Paraat-app.zip'))), kb(os.path.getsize(os.path.join(UIT, 'Boa-Paraat-web.zip')))))
print('\nKlaar: alles getest en ingepakt%s.' % (' (%d opmerkingen)' % len(meldingen) if meldingen else ''))
