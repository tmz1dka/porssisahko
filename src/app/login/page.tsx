// Kirjautumissivu (/login). Julkinen sivu.
import type { Metadata } from "next";
import { turvallinenPaluuosoite } from "@/lib/kayttooikeudet";
import { KirjautumisLomake } from "./KirjautumisLomake";

export const metadata: Metadata = {
  title: "Kirjaudu sisään – Pörssisähköoptimoija",
};

type Props = {
  // Next.js antaa osoitteen kysymysmerkin jälkeiset parametrit tässä.
  searchParams: Promise<{ seuraava?: string }>;
};

export default async function KirjautumisPage({ searchParams }: Props) {
  const { seuraava } = await searchParams;

  // Middleware liittää osoitteeseen sen sivun, jolle käyttäjä oli menossa.
  // Osoite tarkistetaan, jotta sitä ei voi käyttää ohjaamaan toiselle
  // sivustolle. Oletuksena mennään koontinäkymään.
  const paluuosoite = turvallinenPaluuosoite(seuraava) ?? "/dashboard";

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Kirjaudu sisään</h1>
      <p className="mt-2 mb-6 text-sm opacity-80">
        Kirjautuneena näet omien laitteidesi halvimmat käyttöajat.
      </p>
      <KirjautumisLomake paluuosoite={paluuosoite} />
    </main>
  );
}
