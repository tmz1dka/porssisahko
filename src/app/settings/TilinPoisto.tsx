// Tilin poiston lomake. Selainkomponentti, koska se näyttää palvelimen
// virheilmoituksen ja estää painikkeen painamisen kahdesti.
"use client";

import { useActionState } from "react";
import { poistaTili, type PoistoTila } from "./actions";

const alkutila: PoistoTila = {};

export function TilinPoisto() {
  const [tila, lahetä, odottaa] = useActionState(poistaTili, alkutila);

  return (
    <form action={lahetä} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Salasana
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-gray-300 px-3 py-2 text-base outline-none focus:ring-2 focus:ring-red-400 dark:border-gray-600"
        />
      </div>

      {/* Kaksi erillistä vahvistusta: salasana todistaa, että kyse on
          tilin omistajasta, ja ruksi todistaa, että poisto on tarkoitettu. */}
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="confirm"
          required
          className="mt-1"
        />
        <span>
          Ymmärrän, että tilini ja kaikki laitteeni poistetaan pysyvästi
          eikä poistoa voi peruuttaa.
        </span>
      </label>

      {tila.virhe && (
        <p
          role="alert"
          className="rounded-md border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {tila.virhe}
        </p>
      )}

      <button
        type="submit"
        disabled={odottaa}
        className="self-start rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        {odottaa ? "Poistetaan…" : "Poista tilini pysyvästi"}
      </button>
    </form>
  );
}
