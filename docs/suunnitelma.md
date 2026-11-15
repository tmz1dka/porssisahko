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
