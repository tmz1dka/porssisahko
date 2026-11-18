// Koontinäkymä (/dashboard). Vaatii kirjautumisen. Tässä vaiheessa sivu
// kertoo vain, kuka on kirjautuneena. Laitteet ja halvimmat käyttöajat
// tulevat vaiheissa 8 ja 9.
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Koontinäkymä – Pörssisähköoptimoija",
};

export default async function KoontinakymaPage() {
  // Tarkistus tehdään palvelimella. Vaiheessa 6 lisätään tämän rinnalle
  // middleware, joka ohjaa kirjautumattoman pois jo ennen sivun rakentamista.
  const istunto = await auth();

  if (!istunto?.user) {
    redirect("/login");
  }

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
