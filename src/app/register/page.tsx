// Rekisteröitymissivu (/register). Julkinen sivu.
import type { Metadata } from "next";
import { RekisterointiLomake } from "./RekisterointiLomake";

export const metadata: Metadata = {
  title: "Luo tunnus – Pörssisähköoptimoija",
};

export default function RekisterointiPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Luo tunnus</h1>
      <p className="mt-2 mb-6 text-sm opacity-80">
        Tunnuksella laitteesi säilyvät seuraavalle kerralle.
      </p>
      <RekisterointiLomake />
    </main>
  );
}
