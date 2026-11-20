# Pörssisähköoptimoija

[![CI](https://github.com/tmz1dka/porssisahko/actions/workflows/ci.yml/badge.svg)](https://github.com/tmz1dka/porssisahko/actions/workflows/ci.yml)

**Sovellus verkossa: <https://porssisahko-pink.vercel.app>**

Sovellus, joka kertoo kotitalouden laitteille halvimman sähkönkäyttöajan.

Suomessa pörssisähkön hinta vaihtelee tunnin (tai 15 minuutin) tarkkuudella.
Käyttäjä tallentaa sovellukseen laitteensa – esimerkiksi pyykinpesukoneen,
jonka teho on 2 kW ja pesu kestää 2 tuntia – ja sovellus etsii seuraavien
vuorokausien hinnoista sen ajankohdan, jolloin laitteen käyttö on halvinta.
Samalla näytetään arvioitu hinta ja säästö kalleimpaan ajankohtaan verrattuna.

Työ on tehty tietojenkäsittelytieteen projektikurssille (5 op).

## Tila

Projekti on kehitysvaiheessa. Valmiina ovat käyttäjänhallinta
(rekisteröityminen, kirjautuminen, roolit ja tilin poisto) sekä
pörssisähkön hintojen haku ja hintasivu sekä laitteiden tallennus.

Vielä puuttuvat halvimman käyttöajan laskenta ja ylläpitäjän
käyttäjälista. Toteutusjärjestys on kuvattu tiedostossa
[docs/suunnitelma.md](docs/suunnitelma.md).

## Teknologiat

Alla on lyhyt selitys jokaisesta välineestä ja siitä, miksi se on valittu.

| Väline | Mitä se tekee |
|---|---|
| **Next.js (App Router)** | Verkkosovelluskehys. Sivut reititetään palvelimella, eli jokainen sivu on oma osoitteensa – tämä on kurssin vaatimus. |
| **TypeScript** | JavaScript, johon on lisätty tyypit. Tyypit kertovat, millaista tietoa funktio odottaa, joten osa virheistä löytyy jo ennen ohjelman ajamista. |
| **Tailwind CSS** | Tyylikirjasto, jossa ulkoasu kirjoitetaan valmiina luokkaniminä suoraan sivun rakenteeseen. |
| **PostgreSQL + Prisma** | Tietokanta ja sen käsittelykirjasto. Prisma kuvaa tietokannan rakenteen yhdessä tiedostossa ja luo siitä tyypitetyt hakufunktiot. Otetaan käyttöön vaiheessa 4. |
| **Auth.js** | Käyttäjänhallinta: rekisteröityminen, kirjautuminen ja roolit. |
| **Zod** | Tarkistaa, että käyttäjän syöttämä tieto on oikeanlaista ennen tallennusta. |
| **Recharts** | Piirtää hintakaaviot selaimessa. |
| **Vitest** | Ajaa yksikkötestit eli pienet tarkistukset, jotka varmistavat yksittäisten funktioiden toimivan oikein. |
| **ESLint** | Tarkastaja, joka huomauttaa koodista löytyvistä virheistä ja epäyhtenäisistä tavoista. |
| **GitHub Actions + Vercel** | Automaattiset tarkistukset jokaiselle muutokselle ja sovelluksen julkaisu verkkoon. Otetaan käyttöön vaiheessa 3. |

## Käynnistys omalla koneella

Tarvitset [Node.js](https://nodejs.org/) version 20 tai uudemman.

```bash
# 1. Hae projekti ja siirry sen kansioon
git clone https://github.com/tmz1dka/porssisahko.git
cd porssisahko

# 2. Asenna riippuvuudet (ulkopuoliset kirjastot, joita sovellus käyttää)
npm install

# 3. Luo omat asetukset mallin pohjalta ja täytä arvot
cp .env.example .env

# 4. Käynnistä kehityspalvelin
npm run dev
```

Sovellus avautuu osoitteessa <http://localhost:3000>.

Huomaa, että vaiheessa 2 sovellus ei vielä tarvitse tietokantaa, joten
tyhjä `.env` riittää. Tietokanta otetaan käyttöön vaiheessa 4.

## Komennot

| Komento | Mitä se tekee |
|---|---|
| `npm run dev` | Käynnistää kehityspalvelimen. Muutokset näkyvät selaimessa heti. |
| `npm run build` | Kääntää sovelluksen julkaisukuntoon ja tarkistaa samalla tyypit. |
| `npm start` | Käynnistää käännetyn version (vaatii `npm run build` ensin). |
| `npm run lint` | Tarkastaa koodin ESLintillä. |
| `npm run typecheck` | Tarkistaa TypeScript-tyypit ilman kääntämistä. |
| `npm test` | Ajaa yksikkötestit. |
| `npm run db:migrate` | Luo tietokantaan muutokset, jotka skeemaan on tehty. |
| `npm run db:seed` | Luo ensimmäisen ylläpitäjätilin. Turvallista ajaa uudelleen. |
| `npm run db:studio` | Avaa selaimeen näkymän, josta tietokannan sisällön näkee. |

## Kansiorakenne

```
src/
  app/        Sivut ja sovelluksen kehys. Kansiorakenne määrää osoitteet:
              app/page.tsx on etusivu "/".
  lib/        Oma logiikka, joka ei ole sidottu yhteen sivuun
              (esimerkiksi hinnan laskenta, pääsysäännöt ja muotoilu).
  proxy.ts    Reittien suojaus: ajetaan ennen sivua ja ohjaa pois
              sellaiselta sivulta, jolle käyttäjällä ei ole oikeutta.
docs/
  suunnitelma.md   Suunnitteludokumentti: mitä rakennetaan ja miksi.
```

## Käyttäjänhallinta

Käyttäjä luo tunnuksen sähköpostilla ja salasanalla sivulla `/register` ja
kirjautuu sisään sivulla `/login`. Kirjautuminen hoidetaan Auth.js-kirjastolla.

**Istunto** eli muistaminen siitä, kuka on kirjautuneena, tallennetaan
selaimen evästeeseen allekirjoitettuna. Allekirjoitus tehdään
`AUTH_SECRET`-avaimella, joten evästettä ei voi muokata itse ja esiintyä
toisena käyttäjänä. Istuntoa ei tallenneta tietokantaan, koska
sähköposti–salasana-kirjautuminen ei sitä vaadi.

**Salasanat** tarkistetaan vertaamalla annettua salasanaa tietokannassa
olevaan bcrypt-tiivisteeseen. Salasanaa ei käsitellä selaimessa eikä
tallenneta lokiin.

Kolme tietoista tietoturvaratkaisua:

1. **Virheilmoitus on sama** väärästä sähköpostista ja väärästä salasanasta
   ("Sähköposti tai salasana on väärin"). Muuten ulkopuolinen voisi kokeilla
   osoitteita ja päätellä vastauksista, kenellä on tunnus palvelussa.
2. **Vastaus kestää yhtä kauan** silloinkin, kun sähköpostia ei ole olemassa:
   salasanaa verrataan valetiivisteeseen. Muuten vastausajasta voisi päätellä
   saman asian kuin kohdassa 1.
3. **Syötteet tarkistetaan palvelimella**, ei pelkästään lomakkeella.
   Selaimen tarkistukset voi ohittaa, palvelimen ei. Samat säännöt ovat
   tiedostossa [src/lib/validointi.ts](src/lib/validointi.ts), ja niille on
   yksikkötestit.

Uloskirjautuminen on painike lomakkeessa, ei linkki, koska se muuttaa tilaa.
Linkkiä voisi kutsua vahingossa esimerkiksi selaimen esilataus.

### Roolit ja sivujen suojaus

Jokaisella käyttäjällä on rooli: `USER` tai `ADMIN`. Uusi tunnus saa aina
roolin `USER`; ylläpitäjä luodaan erikseen tietokannan alustuksessa
(`npm run db:seed`).

| Osoite | Kenelle |
|---|---|
| `/`, `/prices`, `/login`, `/register` | Kaikille |
| `/dashboard`, `/devices`, `/settings` | Kirjautuneille |
| `/admin` | Vain roolille `ADMIN` |

Suojaus tehdään **kahdessa kohdassa, ei yhdessä**:

1. [src/proxy.ts](src/proxy.ts) tarkistaa oikeuden ennen kuin sivua aletaan
   edes rakentaa. Kirjautumaton ohjataan kirjautumissivulle, väärällä roolilla
   oleva koontinäkymään. Hänet on jo tunnistettu, joten kirjautumissivu olisi
   hänelle umpikuja.
2. Sivu itse tarkistaa oikeuden uudelleen palvelimella
   ([src/lib/istunto.ts](src/lib/istunto.ts)).

Kaksi tarkistusta siksi, että kohdan 1 polkulistaan jää helposti uusi sivu
lisäämättä. Silloin sivu itse estää pääsyn. Lisäksi server actionia eli
palvelimella ajettavaa toimintoa voi kutsua suoraan avaamatta sivua, joten
pelkkä sivun suojaus ei riittäisi.

Säännöt siitä, kuka pääsee minne, ovat puhtaina funktioina tiedostossa
[src/lib/kayttooikeudet.ts](src/lib/kayttooikeudet.ts), ja niille on
yksikkötestit. Näin sääntö voidaan tarkistaa ilman selainta.

Kaksi tietoisesti tehtyä ratkaisua lisää:

- **Ylläpitäjän rooli tarkistetaan tietokannasta**, ei istunnosta. Istunto on
  eväste, joka säilyy selaimessa kirjautumisesta lähtien, joten siinä voi
  lukea vanha rooli. Jos ylläpito-oikeus poistetaan, pelkkä istunnon
  lukeminen päästäisi käyttäjän edelleen sisään. Tämä on yksi
  tietokantakysely ylläpitosivun latausta kohden.
- **Kirjautumisen jälkeinen paluuosoite tarkistetaan.** Suojatulta sivulta
  ohjattu käyttäjä palaa kirjautumisen jälkeen sinne, minne oli menossa.
  Osoite kulkee parametrissa, joten hyväksytään vain oman sivuston sisäinen
  polku. Muuten osoitteeseen voisi liittää ulkopuolisen sivuston ja
  kirjautunut käyttäjä ohjautuisi sinne.

### Tilin poisto

Käyttäjä voi poistaa tilinsä sivulla `/settings`. Poisto vaatii kaksi
vahvistusta: nykyisen salasanan ja erillisen ruksin. Salasana siksi, että
poistoa ei voi peruuttaa eikä avoimeksi jäänyt selain riitä tilin
poistamiseen. Tilin mukana poistuvat käyttäjän laitteet, koska tietokannan
säännössä on `onDelete: Cascade` – orpoja rivejä ei jää.

Viimeistä ylläpitäjää ei voi poistaa. Muuten sovellukseen ei jäisi ketään,
joka voi hallita käyttäjiä, eikä tilannetta saisi korjattua sovelluksen
kautta lainkaan.

## Hintadata

Hinnat haetaan avoimesta rajapinnasta [porssisahko.net](https://porssisahko.net/api),
joka julkaisee Suomen pörssisähkön hinnat. Hinnat ovat sentteinä
kilowattitunnilta ja sisältävät arvonlisäveron. Ne eivät sisällä
sähkönsiirtoa eivätkä sähköyhtiön marginaalia, joten oma lasku on suurempi –
tämä kerrotaan myös hintasivulla, jottei luku johda käyttäjää harhaan.

Rajapinnasta on kaksi versiota: `v2` antaa hinnat **15 minuutin** jaksoissa ja
`v1` **tunnin** jaksoissa. Sovellus hakee ensin tarkemman ja siirtyy
tuntihintoihin, jos se ei vastaa. Jakson pituutta ei oleteta missään
vakioksi, vaan se lasketaan aina alku- ja loppuajasta.

**Välimuisti** eli tallennettu kopio hinnoista: haettu vastaus säilytetään
15 minuuttia, eikä sitä haeta uudelleen ennen sen vanhenemista. Hinnat
julkaistaan kerran päivässä iltapäivällä, joten tiheämpi haku ei toisi uutta
tietoa mutta kuormittaisi avointa rajapintaa turhaan.

Koko hintojen haku on tiedostossa [src/lib/hintalahde.ts](src/lib/hintalahde.ts).
Se on ainoa paikka, joka tuntee rajapinnan osoitteen ja vastauksen muodon:
muu sovellus käsittelee vain omaa `Hintajakso`-tyyppiä. Siksi rajapinnan
vaihtaminen esimerkiksi ENTSO-E:hen ei vaikuttaisi muualle.

Rajapinnan vastaus tarkistetaan Zodilla. Ulkopuolinen palvelu voi muuttua tai
palauttaa odottamatonta, ja silloin halutaan selkeä virheilmoitus eikä sekava
kaatuminen keskellä sivua. Virhe palautetaan arvona eikä poikkeuksena, joten
hintasivu näyttää ymmärrettävän viestin eikä kaadu.

### Huomioidut reunatapaukset

| Tilanne | Miten se käsitellään |
|---|---|
| Huomisen hintoja ei ole vielä julkaistu | Sivu kertoo sen selvästi ja käyttää tämän päivän hintoja |
| Päivälle on vain muutama jakso | Päivää ei pidetä julkaistuna, eikä siitä näytetä tilastoja |
| Hinta on negatiivinen | Käsitellään oikeana arvona; kaaviossa oma väri ja nollaviiva |
| Rajapinta ei vastaa | Hintasivu näyttää virheilmoituksen, muu sovellus toimii |
| Kelvoton päivämäärä vastauksessa | Jakso suodatetaan pois ennen laskentaa |

Toiseksi viimeinen on tärkeä: rajapinta palauttaa aina viimeiset 48 tuntia,
joten illalla mukaan tulee muutama seuraavan vuorokauden jakso, vaikka
huomisen hintoja ei ole vielä julkaistu. Ilman tarkistusta sovellus laskisi
"huomisen halvimman ajan" vuorokauden ensimmäisistä minuuteista ja antaisi
väärän vastauksen. Siksi päivä katsotaan julkaistuksi vasta, kun hintoja on
vähintään 20 tunnin ajalle. Raja on 20 eikä 24 tuntia, koska
kellonsiirtopäivät ovat 23 ja 25 tuntia pitkiä.

Kaikki aikalaskenta tehdään **Suomen aikavyöhykkeellä**, ei palvelimen
aikavyöhykkeellä. Vercelin palvelin on UTC-ajassa, jolloin Suomen ilta
näyttäisi kuuluvan edelliseen vuorokauteen. Säännöt ovat puhtaina
funktioina tiedostossa [src/lib/hintajaksot.ts](src/lib/hintajaksot.ts),
ja niille on yksikkötestit.

## Laitteet

Kirjautunut käyttäjä tallentaa laitteensa sivulla `/devices`: nimi, teho
kilowatteina ja yhden käyttökerran kesto tunteina. Näistä lasketaan
kulutus yhtä käyttökertaa kohden, esimerkiksi 2 kW × 2 h = 4 kWh.
Vaiheessa 9 sama tieto yhdistetään hintoihin, jolloin laitteelle voidaan
kertoa halvin käyttöaika.

### Vain omat laitteet

Tämä on sovelluksen tärkein tietosuojasääntö: kukaan ei näe toisen
laitteita eikä voi muokata niitä.

Sääntö on toteutettu niin, että **käyttäjän tunniste on osa jokaista
kyselyä** eikä erillisenä tarkistuksena:

```ts
// Poisto onnistuu vain, jos laite kuuluu tälle käyttäjälle.
prisma.device.deleteMany({ where: { id, userId } });
```

Muokkauksessa ja poistossa käytetään `updateMany`- ja `deleteMany`-kyselyitä
eikä `update`- ja `delete`-kyselyitä. Syy on se, että jälkimmäiset
hyväksyvät vain tunnisteen, jolloin omistaja pitäisi tarkistaa erikseen –
ja se tarkistus voisi jäätä tekemättä. Kun ehto on kyselyssä itsessään,
sitä ei voi unohtaa. Kyselyt palauttavat muutettujen rivien määrän, josta
nähdään, löytyikö laite.

Yhden laitteen sivu `/devices/[id]` vastaa **404** sekä olemattomalle
laitteelle että toisen käyttäjän laitteelle. Vastaus on tarkoituksella
sama: muuten osoitteita kokeilemalla voisi päätellä, mitkä tunnisteet ovat
olemassa.

Muokkaussivulla laitteen tunniste ei kulje lomakkeen piilokentässä, vaan se
liitetään palvelintoimintoon `bind`-kutsulla. Piilokentän arvoa voi muokata
selaimessa, `bind`-arvoa ei.

Koko tietokantakäsittely on tiedostossa
[src/lib/laitteet.ts](src/lib/laitteet.ts).

### Syötteiden tarkistus

Laitteen tiedot tarkistetaan samalla Zod-säännöllä kuin kirjautumistiedot,
tiedostossa [src/lib/validointi.ts](src/lib/validointi.ts), ja säännölle on
yksikkötestit.

| Sääntö | Miksi |
|---|---|
| Nimi 1–60 merkkiä | Tyhjä nimi ei kerro mitään, pitkä rikkoo listan |
| Teho yli 0 ja enintään 50 kW | 2000 on näppäilyvirhe: watit kilowattien sijaan |
| Kesto yli 0 ja enintään 24 tuntia | Nollan tunnin käyttökerta ei tarkoita mitään |

Desimaalit otetaan vastaan **pilkulla**: suomalainen käyttäjä kirjoittaa
"1,5" eikä "1.5". Kentät ovat tekstikenttiä eivätkä numerokenttiä, koska
numerokenttä ei hyväksy pilkkua kaikilla selaimilla.

Jos tarkistus hylkää syötteen, **kentät säilyttävät käyttäjän kirjoittamat
arvot**. Muuten yhdestä näppäilyvirheestä seuraisi, että koko lomake pitää
täyttää uudelleen.

Laitteen poisto kysyy vahvistuksen. Vahvistus on kevyempi kuin tilin
poistossa, koska laitteen voi lisätä uudelleen.

## Tietokanta

Tiedot säilyvät PostgreSQL-tietokannassa, joka on Neon-palvelussa. Tietokannan
rakenne on kuvattu yhdessä tiedostossa, [prisma/schema.prisma](prisma/schema.prisma),
ja siitä luodaan sekä oikeat tietokantataulut että koodin käyttämät tyypitetyt
hakufunktiot.

Tauluja on kaksi:

- **User** – käyttäjä: sähköposti (uniikki, toimii käyttäjätunnuksena),
  salasanan tiiviste, rooli (`USER` tai `ADMIN`) ja luontiaika.
- **Device** – yksi kotitalouden laite: nimi, teho kilowatteina, käyttökerran
  kesto tunteina ja viittaus omistajaan.

Yhdellä käyttäjällä voi olla monta laitetta, ja jokainen laite kuuluu
täsmälleen yhdelle käyttäjälle. Kun käyttäjä poistaa tilinsä, tietokanta
poistaa samalla hänen laitteensa, jottei tietoja jää ilman omistajaa.

**Salasanoja ei tallenneta koskaan luettavassa muodossa.** Kentän nimi on
`passwordHash`, ja siihen tallennetaan bcrypt-tiiviste: salasanasta laskettu
merkkijono, josta alkuperäistä salasanaa ei voi palauttaa. Kirjautuessa
annettu salasana lasketaan samalla tavalla ja tuloksia verrataan.

### Käyttöönotto omalla koneella

```bash
# 1. Luo tietokanta osoitteessa neon.tech ja kopioi yhteysosoite .env-tiedostoon
cp .env.example .env

# 2. Luo taulut tietokantaan
npm run db:migrate

# 3. Luo ensimmäinen ylläpitäjätili (.env-tiedoston ADMIN-arvoilla)
npm run db:seed
```

Migraatio tarkoittaa yhtä muutosaskelta tietokannan rakenteeseen. Jokainen
muutos tallentuu omaksi tiedostokseen kansioon `prisma/migrations`, joten
tietokannan rakenne voidaan luoda tyhjästä uudelleen missä tahansa
ympäristössä samassa järjestyksessä.

Tuotannossa migraatiot ajetaan automaattisesti julkaisun yhteydessä
(`vercel-build`-komento), joten tuotannon tietokanta on aina ajan tasalla.

Tämä tarkoittaa, että julkaisu tarvitsee tietokannan osoitteen. Vercelissä
ympäristömuuttujat valitaan erikseen jokaiseen ympäristöön: **Production**
(main-haaran julkaisu), **Preview** (pull requestin esikatselu) ja
**Development**. Pelkkä Preview riittää pull requestin tarkistukseen mutta
ei tuotantoon.

## Automaattiset tarkistukset (CI)

CI tarkoittaa automaattista tarkastusta: GitHub ajaa jokaiselle muutokselle
samat komennot kuin kehittäjä omalla koneellaan, joten rikkinäinen koodi ei
pääse `main`-haaraan huomaamatta. Työnkulku on tiedostossa
[.github/workflows/ci.yml](.github/workflows/ci.yml) ja se ajetaan jokaisesta
pull requestista sekä jokaisesta `main`-haaran muutoksesta.

Vaiheet ajetaan tässä järjestyksessä:

1. `npm ci` – asentaa riippuvuudet täsmälleen `package-lock.json`in mukaan,
   jotta ajo on toistettava
2. `npm run lint`
3. `npm run build` – ajetaan ennen tyyppitarkistusta, koska Next.js luo
   käännöksen yhteydessä reittien tyyppitiedostot
4. `npm run typecheck`
5. `npm test`

Jos jokin vaihe epäonnistuu, pull requestiin tulee punainen merkki.

**CI kääntää sovelluksen ilman tietokantaa.** Se on tarkoituksellista:
käännöksen ei kuuluisi tarvita tietokantayhteyttä, koska yksikään sivu ei
hae tietoja käännöksen aikana. Siksi tietokantayhteys luodaan vasta
ensimmäisellä käytöllä (katso [src/lib/prisma.ts](src/lib/prisma.ts)).
Jos yhteys luotaisiin heti tiedoston latauksessa, käännös kaatuisi
ympäristössä, jossa tietokantaa ei ole.

## Julkaisu

Sovellus julkaistaan [Vercelissä](https://vercel.com), joka on Next.jsin
kehittäjän oma julkaisupalvelu. Vercel seuraa GitHub-repoa: jokainen
`main`-haaran muutos julkaistaan automaattisesti tuotantoon, ja jokaisesta
pull requestista syntyy oma esikatseluosoite.

Julkaisun käyttöönotto tehdään kertaluonteisesti:

1. Kirjaudu Verceliin GitHub-tunnuksella ja valitse **Add New → Project**
2. Valitse tämä repo. Vercel tunnistaa Next.jsin itse, joten
   käännösasetuksia ei tarvitse muuttaa
3. Lisää ympäristömuuttujat kohdassa **Settings → Environment Variables**
   tiedoston [.env.example](.env.example) mukaisesti
4. Paina **Deploy**

Sovellus on julkaistu osoitteeseen <https://porssisahko-pink.vercel.app>.

## Ympäristömuuttujat

Ympäristömuuttujat ovat asetuksia, jotka ovat salaisia (esimerkiksi
tietokannan salasana) eivätkä siksi kuulu versionhallintaan. Repossa on
vain malli [.env.example](.env.example), josta oma `.env` kopioidaan.
Oikeaa `.env`-tiedostoa ei koskaan viedä repoon.

## Tekijä

tmz1dka
