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
