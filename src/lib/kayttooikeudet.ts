// Säännöt siitä, kuka pääsee millekin sivulle. Säännöt on kerätty tähän
// yhteen tiedostoon puhtaiksi funktioiksi, jotta ne voidaan testata ilman
// selainta ja jotta sama päätös tehdään joka paikassa samalla tavalla.
import type { Role } from "@/generated/prisma/enums";

export type Rooli = Role;

// Sivut, joille pääsee vain kirjautuneena. Lista kattaa myös alasivut:
// "/devices" tarkoittaa myös "/devices/new" ja "/devices/123".
const VAATII_KIRJAUTUMISEN = ["/dashboard", "/devices", "/settings", "/admin"];

// Sivut, joille pääsee vain ADMIN-roolilla.
const VAIN_ADMIN = ["/admin"];

/**
 * Kertoo, osuuko polku annettuun juureen. Vertailu tehdään tarkasti, jotta
 * esimerkiksi "/dashboardkoe" ei vahingossa mene "/dashboard"-säännön alle.
 */
function osuu(polku: string, juuri: string): boolean {
  return polku === juuri || polku.startsWith(`${juuri}/`);
}

export function vaatiiKirjautumisen(polku: string): boolean {
  return VAATII_KIRJAUTUMISEN.some((juuri) => osuu(polku, juuri));
}

export function vaatiiAdminin(polku: string): boolean {
  return VAIN_ADMIN.some((juuri) => osuu(polku, juuri));
}

// Pääsyn tulos. Kun pääsyä ei ole, mukana kertyy myös osoite, johon käyttäjä
// ohjataan. Kirjautumaton ohjataan kirjautumiseen, mutta väärällä roolilla
// oleva ohjataan koontinäkymään: hän on jo kirjautunut, joten kirjautumissivu
// olisi hänelle umpikuja.
export type Paasy =
  | { sallittu: true }
  | { sallittu: false; syy: "kirjautumaton"; ohjaa: "/login" }
  | { sallittu: false; syy: "vaara-rooli"; ohjaa: "/dashboard" };

/**
 * Päättää, saako annetulla roolilla avata annetun polun.
 * Rooli on null, kun käyttäjä ei ole kirjautunut.
 */
export function tarkistaPaasy(polku: string, rooli: Rooli | null): Paasy {
  if (!vaatiiKirjautumisen(polku)) {
    return { sallittu: true };
  }

  if (rooli === null) {
    return { sallittu: false, syy: "kirjautumaton", ohjaa: "/login" };
  }

  if (vaatiiAdminin(polku) && rooli !== "ADMIN") {
    return { sallittu: false, syy: "vaara-rooli", ohjaa: "/dashboard" };
  }

  return { sallittu: true };
}

/**
 * Tarkistaa osoitteen, johon käyttäjä halutaan ohjata kirjautumisen jälkeen.
 *
 * Tämä on turvatarkistus: ilman sitä kirjautumissivun osoitteeseen voisi
 * liittää ulkopuolisen sivuston osoitteen ("?seuraava=https://..."), ja
 * kirjautumisen jälkeen käyttäjä ohjautuisi sinne. Hyökkääjä voisi näin
 * tehdä oman kirjautumissivun näköisen sivun ja kalastella salasanoja.
 * Siksi hyväksytään vain oman sivuston sisäinen polku.
 */
export function turvallinenPaluuosoite(osoite: string | null | undefined): string | null {
  if (!osoite || !osoite.startsWith("/")) {
    return null;
  }

  // "//toinen.example" ja "/\toinen.example" näyttävät polulta, mutta selain
  // tulkitsee ne osoitteeksi toiselle sivustolle.
  if (osoite.startsWith("//") || osoite.startsWith("/\\")) {
    return null;
  }

  return osoite;
}

/**
 * Kertoo, saako käyttäjä poistaa oman tilinsä.
 *
 * Viimeistä ylläpitäjää ei voi poistaa: muuten sovellukseen ei jäisi
 * ketään, joka voi hallita käyttäjiä, eikä tilannetta saisi korjattua
 * sovelluksen kautta lainkaan.
 */
export function voikoPoistaaOmanTilin(
  rooli: Rooli,
  yllapitajienMaara: number,
): boolean {
  if (rooli !== "ADMIN") {
    return true;
  }

  return yllapitajienMaara > 1;
}
