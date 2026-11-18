// Koontinäkymä (/dashboard). Vaatii kirjautumisen. Tässä vaiheessa sivu
// kertoo vain, kuka on kirjautuneena. Laitteet ja halvimmat käyttöajat
// tulevat vaiheissa 8 ja 9.
import type { Metadata } from "next";
import { vaadiIstunto } from "@/lib/istunto";

export const metadata: Metadata = {
  title: "Koontinäkymä – Pörssisähköoptimoija",
};

export default async function KoontinakymaPage() {
  // Middleware on jo ohjannut kirjautumattoman pois, mutta tarkistus
  // tehdään myös tässä. Sivun oma tarkistus on se, joka varmasti pitää.
  const istunto = await vaadiIstunto();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">Koontinäkymä</h1>
      <p className="mt-2 text-sm opacity-80">
        Olet kirjautunut osoitteella {istunto.user.email}.
      </p>
      <p className="mt-6 rounded-md border border-gray-300 p-4 text-sm dark:border-gray-700">
        Laitteiden lisääminen ja halvimpien käyttöaikojen laskenta tulevat
        myöhemmissä vaiheissa.
      </p>
    </main>
  );
}
