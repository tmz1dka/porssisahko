// Ylläpitosivu (/admin). Vain ADMIN-roolilla. Tässä vaiheessa sivu todistaa,
// että roolin tarkistus toimii. Käyttäjälista ja käyttäjän poisto tulevat
// vaiheessa 10.
import type { Metadata } from "next";
import { vaadiAdmin } from "@/lib/istunto";

export const metadata: Metadata = {
  title: "Ylläpito – Pörssisähköoptimoija",
};

export default async function YllapitoPage() {
  // Jos tänne pääsee tavallisella tunnuksella, roolien suojaus on rikki.
  // Siksi tarkistus tehdään tässä, ei pelkästään reittisuojauksessa.
  const istunto = await vaadiAdmin();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">Ylläpito</h1>
      <p className="mt-2 text-sm opacity-80">
        Olet kirjautunut osoitteella {istunto.user.email} ja roolisi on{" "}
        {istunto.user.role}.
      </p>
      <p className="mt-6 rounded-md border border-gray-300 p-4 text-sm dark:border-gray-700">
        Käyttäjälista ja käyttäjän poisto tulevat myöhemmässä vaiheessa.
      </p>
    </main>
  );
}
