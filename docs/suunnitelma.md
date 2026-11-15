# Pörssisähköoptimoija – suunnitteludokumentti

Tietojenkäsittelytieteen projektikurssi (5 op) · Tekijä: tmz1dka · Päivitetty 15.11.2026

Tämä dokumentti kertoo, mikä sovellus rakennetaan, kenelle ja missä järjestyksessä.
Dokumentti on kirjoitettu niin, että sen ymmärtää myös ilman ohjelmointitaustaa.
Teknisiä yksityiskohtia on vain viimeisessä osiossa.

---

## 1. Tausta ja ongelma

Suomessa sähkön voi ostaa **pörssisähkösopimuksella**. Se tarkoittaa, että sähkön hinta
ei ole kiinteä, vaan se vaihtelee jatkuvasti sen mukaan, paljonko sähköä on tarjolla ja
paljonko sitä kulutetaan. Hinta määräytyy sähköpörssissä, ja se ilmoitetaan erikseen
jokaiselle tunnille – ja uusimmassa järjestelmässä jopa jokaiselle 15 minuutin jaksolle.

Hintaero saman vuorokauden sisällä on usein iso. Tyypillisesti sähkö on kalleinta
aamulla noin kello 7–9 ja alkuillasta noin kello 17–20, koska silloin suurin osa
ihmisistä käyttää sähköä samaan aikaan. Halvinta se on yleensä yöllä ja keskellä päivää.
Ero voi olla moninkertainen: joskus sentin luokkaa kilowattitunnilta yöllä ja
kymmeniä senttejä illalla. Aika ajoin hinta on jopa **negatiivinen**, eli sähkön
käyttämisestä hyvitetään.

Tästä syntyy mahdollisuus säästää. Monet kotitalouden laitteet eivät vaadi, että ne
käynnistetään juuri nyt. Pyykinpesukone, astianpesukone, kuivausrumpu, sauna ja
sähköauton lataus voidaan käynnistää myöhemmin tai ajastaa yöksi. Jos nämä siirretään
kalleimmilta tunneilta halvimmille, sähkölasku pienenee ilman että elämäntavoista
tarvitsee tinkiä.

Ongelma on, että säästön laskeminen käsin on työlästä. Hinnat julkaistaan taulukkona,
jossa on 24 (tai 96) lukua vuorokaudessa. Jos haluaa tietää, mikä on halvin
**kahden tunnin yhtäjaksoinen** jakso pyykinpesukoneelle, pitää verrata jokaista
mahdollista aloitushetkeä erikseen ja laskea jokaisesta keskiarvo. Se on juuri sellaista
puuhaa, jonka tietokone tekee hetkessä ja ihminen ei jaksa tehdä päivittäin.

## 2. Tavoite

Rakennetaan verkkosovellus, johon käyttäjä tallentaa kertaalleen omat sähkölaitteensa:
laitteen nimen, tehon kilowatteina ja sen, kuinka kauan laite on päällä yhdellä
käyttökerralla. Sovellus hakee automaattisesti pörssisähkön tuoreet hinnat avoimesta
rajapinnasta ja kertoo jokaiselle laitteelle erikseen, **mikä on halvin hetki
käynnistää se**, paljonko käyttökerta silloin kustantaa ja paljonko se säästää
verrattuna kalleimpaan ajankohtaan sekä vuorokauden keskihintaan. Lisäksi sovellus
näyttää hinnat selkeänä kaaviona, jotta käyttäjä näkee itsekin, miltä päivä näyttää.

## 3. Kohderyhmä

**Ensisijainen käyttäjä: pörssisähkösopimuksen tehnyt kotitalous.**
Henkilö asuu omakotitalossa tai kerrostalossa, maksaa sähköstä tuntihinnan mukaan ja
tietää, että ajoittamalla voi säästää – mutta ei halua tutkia hintataulukoita joka päivä.
Hän käyttää sovellusta tyypillisesti puhelimella illalla ja miettii, milloin pyykkikone
kannattaa laittaa päälle. Hän ei ole tekniikan ammattilainen, joten sovelluksen pitää
kertoa vastaus yhdellä silmäyksellä, ei tarjota raakaa dataa.

**Toissijainen käyttäjä: sähköautoilija tai paljon sähköä kuluttava talous.**
Hänelle yksittäisen käyttökerran säästö on suurempi, koska sähköauton lataus voi olla
monta kymmentä kilowattituntia. Hän on kiinnostunut myös pidemmistä yhtäjaksoisista
jaksoista, esimerkiksi kuudesta tunnista yössä.

**Ylläpitäjä (ADMIN).**
Sovelluksen ylläpitäjä vastaa siitä, että käyttäjätilit ovat kunnossa. Hän näkee
käyttäjälistan ja voi poistaa väärinkäytetyn tai testitilin. Hän ei näe kenenkään
salasanaa eikä tarvitse pääsyä yksittäisen käyttäjän laitetietoihin.

**Ketä varten sovellusta ei tehdä:** sovellus ei ole tarkoitettu kiinteähintaisen
sopimuksen asiakkaalle, koska hänelle hinta ei vaihtele eikä ajoittamisesta ole hyötyä.
Sovellus ei myöskään ohjaa laitteita automaattisesti päälle, vaan antaa suosituksen,
jonka käyttäjä toteuttaa itse tai laitteen omalla ajastimella.

## 4. Käyttäjätarinat

Käyttäjätarina kuvaa yhden asian, jonka käyttäjä haluaa tehdä, ja sen, miksi hän sen
haluaa. Tarinat on kirjoitettu käyttäjän näkökulmasta, ei tekniikan.

**Kirjautumaton vierailija**

1. Vierailijana haluan nähdä etusivulta yhdellä silmäyksellä, mitä sovellus tekee,
   jotta ymmärrän kannattaako minun rekisteröityä.
2. Vierailijana haluan nähdä tämän päivän sähkön hinnat kaaviona ilman kirjautumista,
   jotta saan sovelluksesta hyötyä heti ensimmäisellä käynnillä.
3. Vierailijana haluan luoda tunnuksen sähköpostilla ja salasanalla, jotta omat
   laitteeni säilyvät seuraavalle kerralle.

**Kirjautunut käyttäjä (USER)**

4. Käyttäjänä haluan kirjautua sisään ja ulos, jotta tietoni eivät näy muille
   samaa konetta käyttäville.
5. Käyttäjänä haluan lisätä laitteen antamalla sen nimen, tehon kilowatteina ja
   käyttöajan tunteina, jotta sovellus voi laskea minulle juuri sen laitteen kulut.
6. Käyttäjänä haluan nähdä yhdeltä sivulta kaikille laitteilleni halvimman
   käynnistysajan, jotta voin suunnitella koko illan kerralla.
7. Käyttäjänä haluan nähdä jokaisesta laitteesta euromäärän – paljonko käyttökerta
   kustantaa halvimpaan aikaan ja paljonko säästän kalleimpaan verrattuna – jotta
   tiedän, kannattaako odottaminen vaivan.
8. Käyttäjänä haluan muokata laitteen tietoja, jotta voin korjata väärin arvioidun
   tehon ilman että poistan laitteen ja lisään sen uudestaan.
9. Käyttäjänä haluan poistaa laitteen, jota en enää omista, jotta näkymä pysyy selkeänä.
10. Käyttäjänä haluan olla varma, etteivät omat laitteeni näy kenellekään muulle
    käyttäjälle, jotta tiedot kodistani pysyvät yksityisinä.
11. Käyttäjänä haluan vaihtaa salasanani ja poistaa koko tilini tietoineen, jotta
    pysyn itse tietojeni hallitsijana.
12. Käyttäjänä haluan käyttää sovellusta puhelimella, jotta voin tarkistaa halvimman
    ajan samalla kun olen kodinhoitohuoneessa.

**Ylläpitäjä (ADMIN)**

13. Ylläpitäjänä haluan nähdä listan kaikista käyttäjistä ja heidän rooleistaan,
    jotta tiedän kenellä on pääsy sovellukseen.
14. Ylläpitäjänä haluan poistaa käyttäjätilin, jotta voin siivota testitilit ja
    väärinkäytetyt tunnukset.
15. Ylläpitäjänä haluan, että ylläpitosivulle ei pääse kukaan muu kuin ylläpitäjä,
    vaikka hän tietäisi sivun osoitteen, jotta hallinta pysyy turvassa.

## 5. Ominaisuudet ja priorisointi

Priorisointi kertoo, mitä tehdään ensin. Kurssin vaatimukset ovat aina "Pakollinen".

### Pakollinen – ilman näitä työ ei ole valmis

| Ominaisuus | Miksi |
|---|---|
| Rekisteröityminen, kirjautuminen ja uloskirjautuminen | Kurssin vaatimus: käyttäjänhallinta |
| Roolit USER ja ADMIN | Kurssin vaatimus |
| Suojatut sivut, joille pääsee vain kirjautuneena | Käyttäjän tiedot eivät saa näkyä muille |
| Ylläpitosivu, jolle pääsee vain ADMIN-roolilla | Kurssin vaatimus |
| Useita palvelimella reititettyjä sivuja | Kurssin vaatimus: ei yhden sivun sovellus |
| Hintojen haku avoimesta rajapinnasta | Koko sovelluksen perusta |
| Laitteiden lisääminen, muokkaus, poisto ja listaus | Sovelluksen ydinsisältö |
| Halvimman yhtäjaksoisen käyttöajan laskenta | Sovelluksen varsinainen hyöty |
| Hintojen esittäminen kaaviona sivulla `/prices` | Käyttäjä haluaa nähdä päivän muodon |
| Sovellus julkaistuna julkiseen osoitteeseen | Kurssin vaatimus |
| Yksikkötestit laskentalogiikalle | Laskenta on työn tärkein osa, se pitää todistaa oikeaksi |
| Loppuraportti | Kurssin vaatimus |

### Tärkeä – tehdään, jos aikataulu kestää

| Ominaisuus | Miksi |
|---|---|
| Hintojen välimuisti, eli tallennettu kopio hinnoista, jotta niitä ei tarvitse hakea joka kerta uudelleen | Nopeuttaa sivua ja säästää ulkopuolista rajapintaa |
| Huomisen hintojen näyttäminen, kun ne julkaistaan noin kello 14 | Illan suunnittelu onnistuu vasta huomisen hinnoilla |
| Toimiva mobiilinäkymä | Sovellusta käytetään puhelimella |
| Omat 404- ja 500-virhesivut selkokielisellä tekstillä | Virhetilanne ei saa näyttää rikkoutuneelta |
| Salasanan vaihto ja oman tilin poisto | Tietosuoja ja käyttäjän oikeudet |
| Automaattinen tarkistus jokaisesta muutoksesta (CI) | Virheet huomataan ennen julkaisua |

### Kiva lisä – vain jos aikaa jää

- Tuki 15 minuutin hintajaksoille tunnin tarkkuuden rinnalla.
- Laitteen merkitseminen suosikiksi, jotta se näkyy etusivulla ensimmäisenä.
- Yhteenveto "paljonko säästäisit viikossa, jos käyttäisit suosituksia".
- Valinta, jolla laskenta rajataan tiettyyn aikaväliin (esim. "vain klo 22–07").
- Sähköverojen ja siirtomaksun lisääminen hintaan.

### Ei tähän versioon

- Laitteiden automaattinen ohjaus päälle ja pois (vaatisi älypistorasian ja laitevalmistajan rajapinnan).
- Oman sähkönkulutuksen lukeminen sähköyhtiöltä (Datahub-rajapinta vaatii vahvan tunnistautumisen).
- Sähköpostimuistutukset halvimmasta hetkestä.
- Useamman kotitalouden jakaminen saman tilin alle.
- Muut maat kuin Suomi.

## 6. Käyttäjäpolut

Käyttäjäpolku tarkoittaa, mitä käyttäjä tekee askel askeleelta yhdessä tilanteessa.

**Polku 1: uusi käyttäjä ottaa sovelluksen käyttöön**

Maija on kuullut, että pörssisähköllä voi säästää ajoittamalla. Hän avaa sovelluksen
etusivun ja lukee lyhyen kuvauksen. Hän klikkaa "Katso hinnat" ja näkee tämän päivän
hintakaavion ilman kirjautumista – hän huomaa, että yöllä hinta on murto-osa illan
hinnasta. Tämä vakuuttaa hänet, ja hän klikkaa "Luo tunnus". Hän antaa sähköpostin ja
salasanan ja pääsee heti sisään. Sovellus kertoo, ettei hänellä ole vielä laitteita, ja
tarjoaa painiketta "Lisää ensimmäinen laite". Hän lisää pyykinpesukoneen: nimi
"Pyykinpesukone", teho 2 kilowattia, käyttöaika 2 tuntia. Hän päätyy koontinäkymään,
jossa lukee: halvin aloitus tänään kello 03, hinta noin 0,12 euroa, säästö noin
0,55 euroa verrattuna kalleimpaan ajankohtaan. Maija ajastaa koneen yöksi.

**Polku 2: palaava käyttäjä tarkistaa illan**

Maija avaa sovelluksen puhelimella kello 18. Hän kirjautuu sisään ja näkee
koontinäkymän, jossa kaikki hänen kolme laitettaan ovat listassa. Kullakin on oma
suosituksensa: pyykinpesukone kello 02, astianpesukone kello 03 ja sähköauton lataus
kello 01–07. Hän huomaa myös huomautuksen, että huomisen hinnat on jo julkaistu, joten
suositus kattaa myös ensi yön. Hän ei tee muuta kuin lukee ajat ja laittaa ajastimet.

**Polku 3: käyttäjä korjaa laitteen tiedot**

Maija huomaa, että kuivausrummun teho ei ollut 1 vaan 2,5 kilowattia. Hän menee
laitelistaan, valitsee kuivausrummun, muuttaa tehon ja tallentaa. Sovellus laskee
säästön heti uudelleen ja näyttää suuremman euromäärän. Jos hän kirjoittaa vahingossa
tehoksi kirjaimen tai negatiivisen luvun, sovellus ei tallenna vaan kertoo selkeästi,
mikä kentässä on vikana.

**Polku 4: käyttäjä yrittää suojatulle sivulle kirjautumatta**

Pekka on saanut Maijalta linkin suoraan koontinäkymään. Hän avaa linkin, mutta ei ole
kirjautunut. Sovellus ohjaa hänet kirjautumissivulle. Kun hän kirjautuu, hän päätyy
siihen samaan sivuun, jonne oli alun perin menossa – mutta näkee vain omat tietonsa,
ei Maijan laitteita.

**Polku 5: ylläpitäjä siivoaa testitilit**

Ylläpitäjä kirjautuu sisään ja näkee valikossa linkin "Ylläpito", jota tavallinen
käyttäjä ei näe. Sivulla on lista käyttäjistä: sähköposti, rooli ja liittymispäivä.
Hän poistaa kaksi testitiliä. Sovellus varmistaa poiston ennen suorittamista, koska
poistoa ei voi peruuttaa. Jos tavallinen käyttäjä kirjoittaa saman osoitteen
selaimeensa, hän saa ilmoituksen, ettei hänellä ole oikeutta sivulle.

## 7. Näkymät

Sovelluksessa on kymmenen sivua. Jokainen sivu on oma osoitteensa, ja sivu rakennetaan
palvelimella valmiiksi ennen lähettämistä selaimeen. Alla on jokaisesta sivusta
sanallinen kuvaus ja yksinkertainen rautalankakuva eli karkea hahmotelma siitä, miten
asiat sijoittuvat sivulla.

### Julkiset sivut

**Etusivu `/`** – kertoo yhdellä ruudulla, mitä sovellus tekee ja miksi se kannattaa.
Sivulla on otsikko, kolmen kohdan selitys ("tallenna laitteesi", "haemme hinnat",
"kertomme halvimman hetken"), nykyinen sähkön hinta nostona sekä kaksi painiketta.

```
+--------------------------------------------------+
|  Pörssisähköoptimoija          Hinnat  Kirjaudu  |
+--------------------------------------------------+
|                                                  |
|   Käynnistä laitteet silloin, kun sähkö on       |
|   halvinta.                                      |
|                                                  |
|   [ Luo tunnus ]   [ Katso hinnat ]              |
|                                                  |
|   Hinta juuri nyt:  4,21 snt/kWh                 |
|                                                  |
|   1. Tallenna laitteesi                          |
|   2. Haemme pörssihinnat automaattisesti         |
|   3. Kerromme halvimman käynnistysajan           |
+--------------------------------------------------+
```

**Hintasivu `/prices`** – näyttää tämän päivän ja, jos saatavilla, huomisen hinnat
pylväskaaviona tunti tunnilta. Halvin ja kallein tunti on korostettu. Kaavion alla on
taulukko samoista luvuista, jotta tiedot ovat luettavissa myös ilman kaaviota. Sivun
yläosassa kerrotaan, milloin hinnat on viimeksi haettu.

```
+--------------------------------------------------+
|  Sähkön hinta  [ Tänään ] [ Huomenna ]           |
|  Päivitetty 15.11.2026 klo 18:05                 |
|                                                  |
|  snt/kWh                                         |
|   12 |              ####                         |
|    8 |         ##   ####  ##                     |
|    4 |  ##  ## ##   ####  ##  ##                 |
|    0 +--------------------------------           |
|       00  03  06  09  12  15  18  21             |
|                                                  |
|  Halvin: klo 03  (1,8 snt)                       |
|  Kallein: klo 18 (12,4 snt)                      |
|  Keskihinta: 5,6 snt                             |
|                                                  |
|  Taulukko: klo | snt/kWh                         |
+--------------------------------------------------+
```

**Kirjautuminen `/login`** – sähköposti, salasana ja painike. Virheellisestä
kirjautumisesta tulee selkeä ilmoitus, joka ei kerro kummassa kentässä oli virhe
(tämä on tietoturvaratkaisu: muuten ulkopuolinen voisi päätellä, mitkä sähköpostit
ovat käytössä). Alla linkki rekisteröitymiseen.

**Rekisteröityminen `/register`** – sähköposti, salasana ja salasanan vahvistus.
Salasanan vähimmäispituus kerrotaan kentän alla etukäteen, ei vasta virheilmoituksena.

### Kirjautumisen vaativat sivut

**Koontinäkymä `/dashboard`** – sovelluksen tärkein sivu. Lista käyttäjän laitteista, ja
jokaisesta laitteesta kortti, jossa on laitteen nimi, suositeltu aloitusaika, kesto,
käyttökerran hinta, säästö kalleimpaan verrattuna ja säästö keskihintaan verrattuna.
Ylhäällä yhteenveto: yhteissäästö, jos kaikkia suosituksia noudattaa. Jos laitteita ei
ole, sivulla on ohje ja painike ensimmäisen lisäämiseen.

```
+--------------------------------------------------+
|  Koontinäkymä   Laitteet  Asetukset  Kirjaudu ulos|
+--------------------------------------------------+
|  Noudattamalla suosituksia säästät n. 1,24 €     |
|                                 [ Lisää laite ]  |
|  +--------------------+  +--------------------+  |
|  | Pyykinpesukone     |  | Astianpesukone     |  |
|  | 2 kW · 2 h         |  | 1,5 kW · 3 h       |  |
|  |                    |  |                    |  |
|  | Halvin: klo 03-05  |  | Halvin: klo 02-05  |  |
|  | Hinta:  0,12 €     |  | Hinta:  0,14 €     |  |
|  | Säästö: 0,55 €     |  | Säästö: 0,41 €     |  |
|  +--------------------+  +--------------------+  |
+--------------------------------------------------+
```

**Laitelista `/devices`** – kaikki laitteet taulukkona: nimi, teho, kesto ja painikkeet
muokkaamiseen ja poistamiseen. Poisto varmistetaan erikseen.

**Uusi laite `/devices/new`** – lomake, jossa kolme kenttää: nimi, teho kilowatteina ja
kesto tunteina. Kentän vieressä on esimerkki ("esim. 2 – pyykinpesukone on tyypillisesti
1,5–2,5 kW"). Virheelliset arvot estetään sekä selaimessa että palvelimella.

**Laitteen muokkaus `/devices/[id]`** – sama lomake täytettynä laitteen nykyisillä
tiedoilla. Osoitteen `[id]` tilalla on laitteen tunniste. Palvelin tarkistaa aina, että
laite kuuluu kirjautuneelle käyttäjälle; muuten sivu ei näytä mitään.

**Asetukset `/settings`** – käyttäjän sähköposti, salasanan vaihto ja selvästi erotettu
osio "Poista tili", jossa kerrotaan, että poisto poistaa myös kaikki laitteet eikä sitä
voi peruuttaa.

### Vain ylläpitäjälle

**Ylläpito `/admin`** – taulukko kaikista käyttäjistä: sähköposti, rooli, liittymispäivä
ja laitteiden määrä. Jokaisella rivillä poistopainike, joka varmistaa poiston. Sivun
yläosassa lukumäärät: montako käyttäjää ja montako ylläpitäjää.

### Virhesivut

**404** – "Sivua ei löytynyt" ja linkki etusivulle. **500** – "Jotain meni vikaan,
yritä hetken päästä uudelleen", ilman teknisiä yksityiskohtia.

## 8. Aikataulu

Työ tehdään kahtatoista vaihetta järjestyksessä 15.–20.11.2026. Jokainen vaihe on oma
kokonaisuutensa, joka viedään versionhallintaan erillisenä haarana eli rinnakkaisena
kehityslinjana, ja yhdistetään päälinjaan vasta kun se on valmis. Näin työn
etenemisjärjestys näkyy historiasta selvästi.

| Päivä | Vaihe | Mitä tehdään | Miksi tässä järjestyksessä |
|---|---|---|---|
| su 15.11 | 1 | Tämä suunnitteludokumentti | Ensin pitää tietää mitä rakennetaan |
| su 15.11 | 2 | Projektin pohja: tyhjä mutta toimiva sovellus, tyylit ja ohjetiedosto | Pohja, jonka päälle kaikki muu tulee |
| ma 16.11 | 3 | Automaattiset tarkistukset ja ensimmäinen julkaisu verkkoon | Julkaisu kuntoon heti, ettei se jää viimeiseksi riskiksi |
| ma 16.11 | 4 | Tietokanta: taulut käyttäjille ja laitteille, ensimmäinen ylläpitäjä | Käyttäjiä ei voi tehdä ennen kuin on paikka, johon ne tallennetaan |
| ti 17.11 | 5 | Rekisteröityminen, kirjautuminen ja uloskirjautuminen | Kurssin ydinvaatimus |
| ti 17.11 | 6 | Roolit, sivujen suojaus, asetussivu ja tilin poisto | Käyttäjänhallinta valmiiksi ennen varsinaista sisältöä |
| ke 18.11 | 7 | Hintojen haku, välimuisti ja hintasivu kaavioineen | Hinnat tarvitaan ennen kuin niillä voi laskea |
| ke 18.11 | 8 | Laitteiden lisäys, muokkaus, poisto ja validointi | Laitteet tarvitaan ennen kuin niille voi laskea aikoja |
| to 19.11 | 9 | Halvimman ajan laskenta, yksikkötestit ja koontinäkymä | Työn tärkein osa, tehdään kun kaikki palaset ovat valmiina |
| to 19.11 | 10 | Ylläpitosivu: käyttäjälista ja poisto | Kurssin vaatimus, nopea toteuttaa valmiin pohjan päälle |
| pe 20.11 | 11 | Viimeistely: puhelinnäkymä, virhesivut, ohjetiedosto | Kokonaisuuden siistiminen |
| pe 20.11 | 12 | Loppuraportti | Kirjoitetaan vasta kun on mitä raportoida |

Versionhallintaan viedään noin kaksi kertaa päivässä, ei kerralla. Työ jakautuu siis
kahdentoista vaiheen ja noin kahdentoista julkaisun yli, jolloin historia näyttää
aidon kehityskaaren.

**Laskennan reunatapaukset**, jotka vaihe 9 hoitaa: huomisen hintoja ei ole vielä
julkaistu, hinta on negatiivinen, hintadataa on vähemmän kuin laitteen käyttöaika
vaatii, ja hinnat tulevat 15 minuutin jaksoissa tunnin sijaan.

## 9. Riskit ja varautuminen

| Riski | Kuinka todennäköinen | Mitä se aiheuttaisi | Miten varaudun |
|---|---|---|---|
| Hintarajapinta lakkaa toimimasta tai hidastuu | Keskinkertainen | Sovellus ei saisi hintoja eikä voisi laskea mitään | Hinnat tallennetaan välimuistiin, eli kopioksi, jota käytetään jos haku epäonnistuu. Käyttäjälle kerrotaan selkeästi, että luvut ovat viimeksi haetut. Varalle on toinen rajapinta (ENTSO-E) |
| Aikataulu venyy, koska vaihe osoittautuu luultua työläämmäksi | Suuri | Kurssin pakolliset vaatimukset jäisivät kesken | Priorisointi on tehty valmiiksi osiossa 5: "Kiva lisä" -kohdat karsitaan ensin. Pakolliset vaatimukset tehdään vaiheissa 1–10, viimeistely vasta sen jälkeen |
| Salasanat tai käyttäjätiedot vuotavat | Pieni mutta vakava | Vakava tietoturvaongelma ja kurssin hylkäys | Salasanoja ei tallenneta koskaan luettavassa muodossa, vain yksisuuntaisesti suojattuna. Salaisuudet pidetään erillisessä tiedostossa, jota ei vie versionhallintaan. Jokainen suojattu sivu tarkistetaan kahdesti: ennen sivun avaamista ja uudestaan palvelimella |
| Käyttäjä näkee toisen käyttäjän laitteet | Pieni mutta vakava | Yksityisyyden menetys | Joka kerta kun laitetta luetaan tietokannasta, haku rajataan kirjautuneen käyttäjän tunnisteeseen. Tätä ei jätetä pelkän käyttöliittymän varaan |
| Julkaisu verkkoon ei onnistu vasta lopussa | Keskinkertainen | Kurssin vaatimus "julkaistu sovellus" jäisi täyttymättä | Julkaisu tehdään heti vaiheessa 3, kun sovellus on vielä lähes tyhjä. Sen jälkeen jokainen vaihe julkaistaan automaattisesti |
| Laskenta antaa väärän tuloksen reunatapauksessa | Keskinkertainen | Sovellus neuvoisi käyttäjää väärin, eli tekisi juuri päinvastoin kuin lupaa | Laskennalle kirjoitetaan yksikkötestit eli pienet automaattiset tarkistukset, jotka syöttävät tunnettuja hintasarjoja ja vertaavat tulosta käsin laskettuun oikeaan vastaukseen. Testataan erikseen negatiiviset hinnat ja liian lyhyt hintadata |
| Tietokantapalvelu kaatuu tai ilmainen kiintiö loppuu | Pieni | Kirjautuminen ei toimisi | Käytetään palvelua, jonka ilmaistaso riittää kurssin kokoiselle työlle. Tietokannan rakenne on kuvattu tiedostoina, joten se voidaan luoda uudelleen toiseen palveluun |
| Tietokoneen tai tilin menetys kesken projektin | Pieni | Työ katoaisi | Kaikki viedään GitHubiin noin kaksi kertaa päivässä, joten enintään puolen päivän työ voi kadota |

## 10. Käytettävät välineet

Jokaisesta välineestä yksi lause: mihin sitä käytetään.

| Väline | Mihin sitä käytetään |
|---|---|
| **Next.js** | Sovelluskehys, joka rakentaa sivut valmiiksi palvelimella ja huolehtii siitä, että jokainen sivu on oma osoitteensa |
| **TypeScript** | Ohjelmointikieli, joka tarkistaa jo kirjoitusvaiheessa, että tiedot ovat oikean tyyppisiä – esimerkiksi ettei tekstiä yritetä laskea yhteen |
| **PostgreSQL (Neon)** | Tietokanta eli pysyvä paikka, jossa käyttäjät ja laitteet säilyvät; Neon on palvelu, joka tarjoaa tämän tietokannan verkossa |
| **Prisma** | Työkalu, jolla tietokannan rakenne kuvataan yhdessä tiedostossa ja jolla tietoja luetaan ja kirjoitetaan ilman tietokantakieltä |
| **Auth.js** | Valmis ratkaisu kirjautumiseen, joka hoitaa istunnon eli muistamisen siitä, kuka on kirjautuneena |
| **bcrypt** | Menetelmä, joka muuntaa salasanan muotoon, josta alkuperäistä ei voi palauttaa, jotta salasana ei ole luettavissa edes tietokannasta |
| **Tailwind CSS** | Tyylityökalu, jolla sivujen ulkoasu tehdään ja jolla näkymä saadaan toimimaan myös puhelimen kokoisella ruudulla |
| **Recharts** | Kirjasto, jolla hinnat piirretään pylväskaaviona |
| **Zod** | Tarkistustyökalu, joka varmistaa, että käyttäjän lomakkeelle syöttämät tiedot ovat kelvollisia ennen tallennusta |
| **Vitest** | Testityökalu, jolla yksikkötestit ajetaan |
| **GitHub** | Versionhallintapalvelu, jossa työn historia säilyy ja näkyy |
| **GitHub Actions** | Automaatio, joka tarkistaa jokaisen muutoksen (tyylivirheet, tyypit ja testit) ennen kuin se hyväksytään |
| **Vercel** | Julkaisupalvelu, joka vie sovelluksen julkiseen osoitteeseen automaattisesti aina kun päälinjaan tulee muutos |
| **api.porssisahko.net** | Avoin rajapinta, josta Suomen pörssisähkön hinnat haetaan; varalla ENTSO-E:n rajapinta |
