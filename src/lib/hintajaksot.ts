// Hintajaksojen käsittely: järjestäminen, päivän rajaaminen ja tilastot.
// Nämä ovat puhtaita funktioita eli ne eivät hae mitään verkosta, joten
// ne voidaan testata ilman rajapintaa. Hintojen hakeminen on tiedostossa
// hintalahde.ts.

/**
 * Yksi hintajakso: ajanjakso ja sen hinta.
 *
 * Rajapinta antaa hinnat joko tunnin tai 15 minuutin jaksoissa, joten
 * jakson pituutta ei oleteta missään vakioksi vaan se lasketaan aina
 * alku- ja loppuajasta.
 */
export type Hintajakso = {
  alku: Date;
  loppu: Date;
  /** Hinta sentteinä kilowattitunnilta, sisältää arvonlisäveron. */
  sntPerKwh: number;
};

// Suomen aikavyöhyke. Hinnat koskevat Suomen aikaa, mutta palvelin voi olla
// missä tahansa, joten päivä ja kellonaika lasketaan aina tämän mukaan.
export const AIKAVYOHYKE = "Europe/Helsinki";

/**
 * Palauttaa päivämäärän Suomen aikaa muodossa "2026-11-20".
 *
 * Tätä käytetään päivän rajaamiseen. Pelkkä Date-olion lukeminen ei riitä,
 * koska se antaisi palvelimen aikavyöhykkeen mukaisen päivän – Vercelin
 * palvelin on UTC-ajassa, jolloin Suomen ilta näyttäisi kuuluvan edelliseen
 * päivään.
 */
export function suomenPaiva(hetki: Date): string {
  const muotoilija = new Intl.DateTimeFormat("sv-SE", {
    timeZone: AIKAVYOHYKE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Ruotsin muotoilu antaa valmiiksi muodon "2026-11-20".
  return muotoilija.format(hetki);
}

/** Palauttaa kellonajan Suomen aikaa muodossa "14:15". */
export function suomenKellonaika(hetki: Date): string {
  return new Intl.DateTimeFormat("fi-FI", {
    timeZone: AIKAVYOHYKE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(hetki);
}

/** Jakson pituus minuutteina. */
export function kestoMinuutteina(jakso: Hintajakso): number {
  return Math.round((jakso.loppu.getTime() - jakso.alku.getTime()) / 60_000);
}

/**
 * Järjestää jaksot vanhimmasta uusimpaan.
 *
 * Rajapinta palauttaa uusimman ensin, mutta kaavio ja halvimman ajan
 * laskenta tarvitsevat aikajärjestyksen. Alkuperäistä listaa ei muuteta.
 */
export function jarjestaAikajarjestykseen(jaksot: Hintajakso[]): Hintajakso[] {
  return [...jaksot].sort((a, b) => a.alku.getTime() - b.alku.getTime());
}

/** Palauttaa vain ne jaksot, jotka alkavat annettuna päivänä Suomen aikaa. */
export function paivanJaksot(jaksot: Hintajakso[], paiva: Date): Hintajakso[] {
  const haettu = suomenPaiva(paiva);
  return jaksot.filter((jakso) => suomenPaiva(jakso.alku) === haettu);
}

/**
 * Kuinka monta minuuttia vuorokaudesta hintoja pitää olla, jotta päivää
 * pidetään julkaistuna.
 *
 * Raja on 20 tuntia eikä 24, koska kellonsiirtopäivät ovat 23 ja 25 tuntia
 * pitkiä. Raja tarvitaan, koska rajapinta antaa aina viimeiset 48 tuntia:
 * illalla mukaan tulee muutama huomisen jakso, vaikka huomisen hintoja ei
 * ole vielä julkaistu. Ilman rajaa sovellus laskisi "huomisen halvimman
 * ajan" muutamasta ensimmäisestä minuutista ja antaisi väärän vastauksen.
 */
const PAIVAN_VAHIMMAISKATTAVUUS_MIN = 20 * 60;

/** Laskee, kuinka monta minuuttia annetut jaksot kattavat yhteensä. */
export function kattavuusMinuutteina(jaksot: Hintajakso[]): number {
  return jaksot.reduce((summa, jakso) => summa + kestoMinuutteina(jakso), 0);
}

/**
 * Kertoo, onko päivälle julkaistu hinnat koko vuorokaudelle.
 * Yksittäiset jaksot vuorokauden alusta eivät riitä.
 */
export function onkoPaivaKattava(paivanJaksot: Hintajakso[]): boolean {
  return kattavuusMinuutteina(paivanJaksot) >= PAIVAN_VAHIMMAISKATTAVUUS_MIN;
}

/**
 * Kertoo, onko huomiselle jo hinnat.
 *
 * Huomisen hinnat julkaistaan vasta iltapäivällä, joten sitä ennen
 * sovelluksen pitää kertoa käyttäjälle, ettei niitä ole vielä saatavilla.
 * Tämä on yksi suunnitelmassa tunnistetuista reunatapauksista.
 */
export function onkoHuomiselleHintoja(jaksot: Hintajakso[], nyt: Date): boolean {
  const huomenna = new Date(nyt.getTime() + 24 * 60 * 60 * 1000);
  return onkoPaivaKattava(paivanJaksot(jaksot, huomenna));
}

export type Tilastot = {
  halvin: Hintajakso;
  kallein: Hintajakso;
  keskiarvoSntPerKwh: number;
};

/**
 * Laskee halvimman ja kalleimman jakson sekä keskihinnan.
 *
 * Palauttaa null tyhjälle listalle: silloin ei ole mitään mistä laskea,
 * eikä funktio saa arvata esimerkiksi nollaa, joka näyttäisi oikealta
 * hinnalta. Negatiiviset hinnat ovat kelvollisia – pörssisähkön hinta voi
 * olla miinuksella, kun tuotantoa on enemmän kuin kulutusta.
 */
export function tilastot(jaksot: Hintajakso[]): Tilastot | null {
  if (jaksot.length === 0) {
    return null;
  }

  let halvin = jaksot[0];
  let kallein = jaksot[0];
  let summa = 0;

  for (const jakso of jaksot) {
    if (jakso.sntPerKwh < halvin.sntPerKwh) {
      halvin = jakso;
    }
    if (jakso.sntPerKwh > kallein.sntPerKwh) {
      kallein = jakso;
    }
    summa += jakso.sntPerKwh;
  }

  return {
    halvin,
    kallein,
    keskiarvoSntPerKwh: summa / jaksot.length,
  };
}
