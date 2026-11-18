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

Projekti on kehitysvaiheessa. Tämä versio on **vaiheen 2 projektipohja**:
sovellus käynnistyy ja etusivu näkyy, mutta varsinaisia toimintoja
(kirjautuminen, hintadata, laitteet, optimointi) ei ole vielä toteutettu.
Toteutusjärjestys on kuvattu tiedostossa [docs/suunnitelma.md](docs/suunnitelma.md).

## Teknologiat

Alla on lyhyt selitys jokaisesta välineestä ja siitä, miksi se on valittu.

| Väline | Mitä se tekee |
|---|---|
| **Next.js (App Router)** | Verkkosovelluskehys. Sivut reititetään palvelimella, eli jokainen sivu on oma osoitteensa – tämä on kurssin vaatimus. |
| **TypeScript** | JavaScript, johon on lisätty tyypit. Tyypit kertovat, millaista tietoa funktio odottaa, joten osa virheistä löytyy jo ennen ohjelman ajamista. |
| **Tailwind CSS** | Tyylikirjasto, jossa ulkoasu kirjoitetaan valmiina luokkaniminä suoraan sivun rakenteeseen. |
| **PostgreSQL + Prisma** | Tietokanta ja sen käsittelykirjasto. Prisma kuvaa tietokannan rakenteen yhdessä tiedostossa ja luo siitä tyypitetyt hakufunktiot. Otetaan käyttöön vaiheessa 4. |
| **Auth.js** | Käyttäjänhallinta: rekisteröityminen, kirjautuminen ja roolit. Otetaan käyttöön vaiheessa 5. |
| **Zod** | Tarkistaa, että käyttäjän syöttämä tieto on oikeanlaista ennen tallennusta. |
| **Recharts** | Piirtää hintakaaviot. |
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
              (esimerkiksi hinnan laskenta ja muotoilu).
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

Roolit (`USER` ja `ADMIN`) ja sivujen suojaus tulevat vaiheessa 6.

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
