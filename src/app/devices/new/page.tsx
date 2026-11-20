// Uuden laitteen lisäyssivu (/devices/new). Vaatii kirjautumisen.
import type { Metadata } from "next";
import { vaadiIstunto } from "@/lib/istunto";
import { lisaaLaite } from "../actions";
import { LaiteLomake } from "../LaiteLomake";

export const metadata: Metadata = {
  title: "Lisää laite – Pörssisähköoptimoija",
};

export default async function UusiLaitePage() {
  await vaadiIstunto();

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Lisää laite</h1>
      <p className="mt-2 mb-6 text-sm opacity-80">
        Tiedot ovat arvioita. Voit muokata niitä myöhemmin.
      </p>

      <LaiteLomake toiminto={lisaaLaite} lahetysteksti="Tallenna laite" />
    </main>
  );
}
