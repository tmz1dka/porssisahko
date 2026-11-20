// Hintojen hakeminen avoimesta rajapinnasta (porssisahko.net).
//
// Tämä tiedosto on ainoa paikka, joka tietää rajapinnan osoitteen ja
// vastauksen muodon. Muu sovellus käsittelee vain Hintajakso-tyyppiä, joten
// rajapinnan vaihtaminen ei vaikuta muualle.
import { z } from "zod";
import type { Hintajakso } from "@/lib/hintajaksot";
import { jarjestaAikajarjestykseen, kestoMinuutteina } from "@/lib/hintajaksot";

// Rajapinnan osoite. v2 antaa hinnat 15 minuutin jaksoissa, v1 tunnin
// jaksoissa. Molempia tuetaan, koska sovellus ei oleta jakson pituutta.
const OSOITE_15MIN =
  process.env.PRICE_API_URL ?? "https://api.porssisahko.net/v2";
const OSOITE_TUNTI = "https://api.porssisahko.net/v1";

/**
 * Välimuistin kesto eli kuinka kauan tallennettua kopiota hinnoista
 * käytetään, ennen kuin ne haetaan uudelleen.
 *
 * 15 minuuttia: hinnat julkaistaan kertaalleen päivässä iltapäivällä, joten
 * tiheämpi haku ei tuo uutta tietoa mutta rasittaisi avointa rajapintaa
 * turhaan. Toisaalta 15 minuuttia on tarpeeksi lyhyt, että julkaisu näkyy
 * sovelluksessa pian.
 */
const VALIMUISTI_SEKUNTIA = 15 * 60;

/** Kuinka kauan rajapinnan vastausta odotetaan ennen luovuttamista. */
const AIKAKATKAISU_MS = 8000;

// Rajapinnan vastauksen muoto. Tarkistus tehdään, koska ulkopuolinen
// rajapinta voi muuttua tai palauttaa odottamatonta – silloin halutaan
// selkeä virhe eikä sekava kaatuminen keskellä sivua.
const jaksoSkeema = z.object({
  price: z.number(),
  startDate: z.string(),
  endDate: z.string(),
});

const vastausSkeema = z.object({
  prices: z.array(jaksoSkeema),
});

/**
 * Hakutulos. Virhe palautetaan arvona eikä poikkeuksena, jotta sivu voi
 * näyttää käyttäjälle ymmärrettävän viestin sen sijaan että koko sivu
 * kaatuisi ulkopuolisen rajapinnan takia.
 */
export type Hintatulos =
  | {
      ok: true;
      jaksot: Hintajakso[];
      /** 15 tai 60. Kerrotaan käyttäjälle, kuinka tarkkaa data on. */
      jaksonPituusMinuutteina: number;
    }
  | { ok: false; virhe: string };

/** Muuntaa rajapinnan rivin sovelluksen omaan muotoon. */
function muunnaJakso(rivi: z.infer<typeof jaksoSkeema>): Hintajakso {
  return {
    alku: new Date(rivi.startDate),
    loppu: new Date(rivi.endDate),
    sntPerKwh: rivi.price,
  };
}

/** Hakee ja tarkistaa yhden rajapinnan vastauksen. */
async function haeOsoitteesta(perusosoite: string): Promise<Hintajakso[]> {
  const vastaus = await fetch(`${perusosoite}/latest-prices.json`, {
    // Tallennettua kopiota käytetään tämän ajan. Next.js hoitaa
    // tallennuksen, joten kaikki sivupyynnöt jakavat saman kopion.
    next: { revalidate: VALIMUISTI_SEKUNTIA },
    signal: AbortSignal.timeout(AIKAKATKAISU_MS),
  });

  if (!vastaus.ok) {
    throw new Error(`Rajapinta vastasi koodilla ${vastaus.status}`);
  }

  const data = vastausSkeema.parse(await vastaus.json());

  // Aikajärjestys tehdään heti, koska rajapinta palauttaa uusimman ensin.
  // Kelvottomat päivämäärät suodatetaan pois: NaN-aika rikkoisi kaikki
  // myöhemmät vertailut hiljaisesti.
  const jaksot = data.prices
    .map(muunnaJakso)
    .filter(
      (jakso) =>
        Number.isFinite(jakso.alku.getTime()) &&
        Number.isFinite(jakso.loppu.getTime()) &&
        jakso.loppu.getTime() > jakso.alku.getTime(),
    );

  return jarjestaAikajarjestykseen(jaksot);
}

/**
 * Hakee pörssisähkön hinnat. Yrittää ensin 15 minuutin tarkkuutta ja
 * siirtyy tuntihintoihin, jos se ei onnistu. Näin sovellus toimii
 * silloinkin, kun tarkempi rajapinta on poissa käytöstä.
 */
export async function haeHinnat(): Promise<Hintatulos> {
  const osoitteet = [OSOITE_15MIN, OSOITE_TUNTI];
  let viimeinenVirhe = "Hintoja ei saatu haettua.";

  for (const osoite of osoitteet) {
    try {
      const jaksot = await haeOsoitteesta(osoite);

      // Liian lyhyt hintadata: jos jaksoja ei ole, sivulla ei ole mitään
      // näytettävää, ja silloin se on virhe eikä tyhjä kaavio.
      if (jaksot.length === 0) {
        viimeinenVirhe = "Rajapinta ei palauttanut yhtään hintaa.";
        continue;
      }

      return {
        ok: true,
        jaksot,
        jaksonPituusMinuutteina: kestoMinuutteina(jaksot[0]),
      };
    } catch (virhe) {
      // Syy kirjataan palvelimen lokiin, mutta käyttäjälle näytetään
      // yleinen viesti: rajapinnan virheilmoitus ei kerro hänelle mitään.
      console.error(`Hintojen haku osoitteesta ${osoite} ei onnistunut:`, virhe);
      viimeinenVirhe = "Hintoja ei saatu haettua juuri nyt.";
    }
  }

  return { ok: false, virhe: viimeinenVirhe };
}
