// Kirjautumissivu (/login). Julkinen sivu.
import type { Metadata } from "next";
import { KirjautumisLomake } from "./KirjautumisLomake";

export const metadata: Metadata = {
  title: "Kirjaudu sisään – Pörssisähköoptimoija",
};

export default function KirjautumisPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Kirjaudu sisään</h1>
      <p className="mt-2 mb-6 text-sm opacity-80">
        Kirjautuneena näet omien laitteidesi halvimmat käyttöajat.
      </p>
      <KirjautumisLomake />
    </main>
  );
}
