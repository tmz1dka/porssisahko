// Laitelista (/devices). Näyttää vain kirjautuneen käyttäjän omat laitteet.
import type { Metadata } from "next";
import Link from "next/link";
import { vaadiIstunto } from "@/lib/istunto";
import { haeLaitteet } from "@/lib/laitteet";
import { laskeKulutusKwh } from "@/lib/hinta";
import { poistaLaiteToiminto } from "./actions";

export const metadata: Metadata = {
  title: "Laitteet – Pörssisähköoptimoija",
};

/** Näyttää luvun suomalaisittain pilkulla: 1.5 -> "1,5". */
function pilkulla(luku: number): string {
  return String(Math.round(luku * 100) / 100).replace(".", ",");
}

export default async function LaitteetPage() {
  const istunto = await vaadiIstunto();

  // Laitteet haetaan aina kirjautuneen käyttäjän tunnisteella, joten
  // toisen käyttäjän laitteita ei voi päätyä listalle.
  const laitteet = await haeLaitteet(istunto.user.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Laitteet</h1>
        <Link
          href="/devices/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Lisää laite
        </Link>
      </div>

      <p className="mt-2 text-sm opacity-80">
        Tallenna laitteet, joiden käyttöajan haluat ajoittaa halvimpaan
        hetkeen. Sovellus laskee kullekin laitteelle edullisimman käyttöajan.
      </p>

      {laitteet.length === 0 ? (
        <p className="mt-8 rounded-md border border-gray-300 p-4 text-sm dark:border-gray-700">
          Et ole vielä tallentanut laitteita. Aloita vaikka
          pyykinpesukoneesta: katso teho laitteen tyyppikilvestä ja arvioi,
          kuinka kauan yksi pesu kestää.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {laitteet.map((laite) => (
            <li
              key={laite.id}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-md border border-gray-300 p-4 dark:border-gray-700"
            >
              <div>
                <h2 className="font-medium">{laite.name}</h2>
                <p className="text-sm opacity-70">
                  {pilkulla(laite.powerKw)} kW ·{" "}
                  {pilkulla(laite.durationHours)} h ·{" "}
                  {pilkulla(
                    laskeKulutusKwh(laite.powerKw, laite.durationHours),
                  )}{" "}
                  kWh / käyttökerta
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Link href={`/devices/${laite.id}`} className="underline">
                  Muokkaa
                </Link>

                {/* Poisto on lomake eikä linkki, koska se muuttaa tietoja.
                    Linkkiä voisi kutsua vahingossa esimerkiksi selaimen
                    esilataus. */}
                <form action={poistaLaiteToiminto}>
                  <input type="hidden" name="id" value={laite.id} />
                  <button
                    type="submit"
                    className="text-red-700 underline dark:text-red-400"
                  >
                    Poista
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
