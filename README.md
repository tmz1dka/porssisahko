# Pörssisähköoptimoija

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

## Ympäristömuuttujat

Ympäristömuuttujat ovat asetuksia, jotka ovat salaisia (esimerkiksi
tietokannan salasana) eivätkä siksi kuulu versionhallintaan. Repossa on
vain malli [.env.example](.env.example), josta oma `.env` kopioidaan.
Oikeaa `.env`-tiedostoa ei koskaan viedä repoon.

## Tekijä

tmz1dka
