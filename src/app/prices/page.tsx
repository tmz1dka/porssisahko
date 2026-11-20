// Hintasivu (/prices). Julkinen sivu: pörssisähkön hinnat tänään ja
// huomenna kaaviona sekä päivän halvin, kallein ja keskihinta.
import type { Metadata } from "next";
import { HintaKaavio, type KaavioJakso } from "@/components/HintaKaavio";
import {
  onkoHuomiselleHintoja,
  onkoPaivaKattava,
  paivanJaksot,
  suomenKellonaika,
  tilastot,
  type Hintajakso,
} from "@/lib/hintajaksot";
import { haeHinnat } from "@/lib/hintalahde";
import { muotoileSnt } from "@/lib/hinta";

export const metadata: Metadata = {
  title: "Hinnat – Pörssisähköoptimoija",
};

/** Muuntaa hintajaksot kaavion tarvitsemaan muotoon. */
function kaavioksi(jaksot: Hintajakso[]): KaavioJakso[] {
  return jaksot.map((jakso) => ({
    kello: suomenKellonaika(jakso.alku),
    sntPerKwh: jakso.sntPerKwh,
  }));
}

/** Yhden päivän osio: kaavio ja päivän tilastot. */
function Paivaosio({
  otsikko,
  jaksot,
}: {
  otsikko: string;
  jaksot: Hintajakso[];
}) {
  const luvut = tilastot(jaksot);

  // Vaillinaisesta päivästä ei näytetä tilastoja lainkaan. Rajapinta antaa
  // aina viimeiset 48 tuntia, joten illalla mukaan tulee muutama huomisen
  // jakso – niistä laskettu "halvin aika" olisi harhaanjohtava.
  if (!luvut || !onkoPaivaKattava(jaksot)) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-semibold">{otsikko}</h2>
        <p className="mt-2 rounded-md border border-gray-300 p-4 text-sm dark:border-gray-700">
          Hintoja ei ole vielä saatavilla. Huomisen hinnat julkaistaan
          iltapäivällä, kun sähköpörssin kauppa on päättynyt.
        </p>
      </section>
    );
  }

  const halvinKello = suomenKellonaika(luvut.halvin.alku);

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{otsikko}</h2>

      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        <div>
          <dt className="opacity-70">Halvin</dt>
          <dd className="font-medium text-green-700 dark:text-green-400">
            {muotoileSnt(luvut.halvin.sntPerKwh)} klo {halvinKello}
          </dd>
        </div>
        <div>
          <dt className="opacity-70">Kallein</dt>
          <dd className="font-medium">
            {muotoileSnt(luvut.kallein.sntPerKwh)} klo{" "}
            {suomenKellonaika(luvut.kallein.alku)}
          </dd>
        </div>
        <div>
          <dt className="opacity-70">Keskihinta</dt>
          <dd className="font-medium">
            {muotoileSnt(luvut.keskiarvoSntPerKwh)}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <HintaKaavio jaksot={kaavioksi(jaksot)} halvinKello={halvinKello} />
      </div>
    </section>
  );
}

export default async function HinnatPage() {
  const tulos = await haeHinnat();

  if (!tulos.ok) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold">Pörssisähkön hinnat</h1>
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {tulos.virhe} Hinnat haetaan avoimesta rajapinnasta, joka voi olla
          hetkellisesti poissa käytöstä. Kokeile hetken kuluttua uudelleen.
        </p>
      </main>
    );
  }

  const nyt = new Date();
  const huomenna = new Date(nyt.getTime() + 24 * 60 * 60 * 1000);

  const tanaan = paivanJaksot(tulos.jaksot, nyt);
  const huomisen = paivanJaksot(tulos.jaksot, huomenna);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">Pörssisähkön hinnat</h1>
      <p className="mt-2 text-sm opacity-80">
        Hinnat ovat sentteinä kilowattitunnilta ja sisältävät arvonlisäveron.
        Tiedot ovat {tulos.jaksonPituusMinuutteina} minuutin jaksoissa.
      </p>

      <Paivaosio otsikko="Tänään" jaksot={tanaan} />
      <Paivaosio otsikko="Huomenna" jaksot={huomisen} />

      {!onkoHuomiselleHintoja(tulos.jaksot, nyt) && (
        <p className="mt-6 text-sm opacity-70">
          Huomisen hinnat tulevat näkyviin, kun sähköpörssi on julkaissut ne.
          Siihen asti laskelmat tehdään tämän päivän hinnoilla.
        </p>
      )}

      <p className="mt-10 text-xs opacity-60">
        Hintatiedot: porssisahko.net. Hinnat eivät sisällä sähkönsiirtoa eivätkä
        sähköyhtiön marginaalia, joten oma laskusi on tätä suurempi.
      </p>
    </main>
  );
}
