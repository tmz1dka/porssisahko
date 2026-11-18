// Kirjautumislomake. Selainkomponentti, koska se näyttää palvelimen
// palauttamat virheet ja estää lähetyspainikkeen painamisen kahdesti.
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lomakekentta } from "@/components/Lomakekentta";
import { kirjaudu, type KirjautumisTila } from "./actions";

const alkutila: KirjautumisTila = {};

export function KirjautumisLomake() {
  const [tila, lahetä, odottaa] = useActionState(kirjaudu, alkutila);

  return (
    <form action={lahetä} className="flex flex-col gap-4">
      <Lomakekentta
        nimi="email"
        otsikko="Sähköposti"
        tyyppi="email"
        oletusarvo={tila.email}
        virhe={tila.virheet?.email}
        automaattinenTaytto="email"
      />

      <Lomakekentta
        nimi="password"
        otsikko="Salasana"
        tyyppi="password"
        virhe={tila.virheet?.password}
        automaattinenTaytto="current-password"
      />

      {tila.yleinenVirhe && (
        <p
          role="alert"
          className="rounded-md border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {tila.yleinenVirhe}
        </p>
      )}

      <button
        type="submit"
        disabled={odottaa}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {odottaa ? "Kirjaudutaan…" : "Kirjaudu sisään"}
      </button>

      <p className="text-sm opacity-80">
        Ei vielä tunnusta?{" "}
        <Link href="/register" className="underline">
          Luo tunnus
        </Link>
      </p>
    </form>
  );
}
