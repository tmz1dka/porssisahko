// Asetussivu (/settings). Näyttää oman tunnuksen tiedot ja tarjoaa
// tilin poiston. Vaatii kirjautumisen.
import type { Metadata } from "next";
import { vaadiIstunto } from "@/lib/istunto";
import { prisma } from "@/lib/prisma";
import { TilinPoisto } from "./TilinPoisto";

export const metadata: Metadata = {
  title: "Asetukset – Pörssisähköoptimoija",
};

// Roolin tekninen nimi näytetään käyttäjälle ymmärrettävässä muodossa.
const ROOLIN_NIMI = {
  USER: "Käyttäjä",
  ADMIN: "Ylläpitäjä",
} as const;

export default async function AsetuksetPage() {
  const istunto = await vaadiIstunto();

  // Luontipäivä haetaan tietokannasta, koska istunnossa on vain ne tiedot,
  // joita sivujen suojaus tarvitsee.
  const kayttaja = await prisma.user.findUnique({
    where: { id: istunto.user.id },
    select: { email: true, role: true, createdAt: true },
  });

  if (!kayttaja) {
    // Tunnus on poistettu, mutta selaimessa on vielä vanha istunto.
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-2xl font-bold">Asetukset</h1>
        <p className="mt-2 text-sm opacity-80">
          Tunnusta ei löytynyt. Kirjaudu uudelleen sisään.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold">Asetukset</h1>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="opacity-70">Sähköposti</dt>
        <dd>{kayttaja.email}</dd>

        <dt className="opacity-70">Rooli</dt>
        <dd>{ROOLIN_NIMI[kayttaja.role]}</dd>

        <dt className="opacity-70">Tunnus luotu</dt>
        {/* Päivämäärä muotoillaan käsin, jotta se näyttää samalta palvelimella
            ja selaimessa. Automaattinen muotoilu voi erota aikavyöhykkeen
            mukaan ja aiheuttaa virheen sivun päivityksessä. */}
        <dd>
          {`${kayttaja.createdAt.getUTCDate()}.${kayttaja.createdAt.getUTCMonth() + 1}.${kayttaja.createdAt.getUTCFullYear()}`}
        </dd>
      </dl>

      <section className="mt-10 rounded-md border border-red-300 p-4 dark:border-red-800">
        <h2 className="text-lg font-semibold">Poista tili</h2>
        <p className="mt-1 mb-4 text-sm opacity-80">
          Poisto on pysyvä. Tilin mukana poistuvat kaikki tallentamasi laitteet.
        </p>
        <TilinPoisto />
      </section>
    </main>
  );
}
