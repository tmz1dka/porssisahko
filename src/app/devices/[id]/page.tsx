// Yhden laitteen muokkaussivu (/devices/[id]). Vaatii kirjautumisen, ja
// laite haetaan aina myös käyttäjän tunnisteella.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { vaadiIstunto } from "@/lib/istunto";
import { haeLaite } from "@/lib/laitteet";
import { muokkaaLaite } from "../actions";
import { LaiteLomake } from "../LaiteLomake";

export const metadata: Metadata = {
  title: "Muokkaa laitetta – Pörssisähköoptimoija",
};

type Props = {
  // Next.js antaa osoitteen muuttuvan osan tässä.
  params: Promise<{ id: string }>;
};

export default async function MuokkaaLaitettaPage({ params }: Props) {
  const istunto = await vaadiIstunto();
  const { id } = await params;

  const laite = await haeLaite(id, istunto.user.id);

  // Sama vastaus sekä olemattomalle laitteelle että toisen käyttäjän
  // laitteelle. Muuten osoitteita kokeilemalla voisi päätellä, mitkä
  // tunnisteet ovat olemassa.
  if (!laite) {
    notFound();
  }

  // bind liittää laitteen tunnisteen toimintoon, jotta se ei kulje
  // lomakkeen piilokentässä, jonka arvoa voisi muokata selaimessa.
  const toiminto = muokkaaLaite.bind(null, laite.id);

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Muokkaa laitetta</h1>
      <p className="mt-2 mb-6 text-sm opacity-80">{laite.name}</p>

      <LaiteLomake
        toiminto={toiminto}
        laite={laite}
        lahetysteksti="Tallenna muutokset"
      />
    </main>
  );
}
