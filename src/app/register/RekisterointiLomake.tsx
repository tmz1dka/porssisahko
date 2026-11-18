// Rekisteröitymislomake. Tämä on selainkomponentti ("use client"), koska se
// seuraa lomakkeen tilaa: näyttää virheet kenttien vieressä ja estää
// lähetyspainikkeen painamisen kahdesti.
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lomakekentta } from "@/components/Lomakekentta";
import { SALASANAN_VAHIMMAISPITUUS } from "@/lib/validointi";
import { rekisteroi, type RekisterointiTila } from "./actions";

const alkutila: RekisterointiTila = {};

export function RekisterointiLomake() {
  // useActionState yhdistää lomakkeen ja palvelinfunktion: tila sisältää
  // palvelimen palauttamat virheet, ja odottaa kertoo, onko lähetys kesken.
  const [tila, lahetä, odottaa] = useActionState(rekisteroi, alkutila);

  if (tila.onnistui) {
    return (
      <div className="rounded-md border border-green-500 bg-green-50 p-4 dark:bg-green-950">
        <h2 className="font-medium">Tunnus luotu</h2>
        <p className="mt-1 text-sm">
          Tunnus osoitteelle {tila.email} on valmis. Voit nyt kirjautua sisään.
        </p>
        <Link
          href="/login"
          className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Siirry kirjautumaan
        </Link>
      </div>
    );
  }

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
        ohje={`Vähintään ${SALASANAN_VAHIMMAISPITUUS} merkkiä.`}
        virhe={tila.virheet?.password}
        automaattinenTaytto="new-password"
      />

      <Lomakekentta
        nimi="passwordConfirm"
        otsikko="Salasana uudelleen"
        tyyppi="password"
        virhe={tila.virheet?.passwordConfirm}
        automaattinenTaytto="new-password"
      />

      {tila.yleinenVirhe && (
        <p className="text-sm text-red-600 dark:text-red-400">{tila.yleinenVirhe}</p>
      )}

      <button
        type="submit"
        disabled={odottaa}
        className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {odottaa ? "Luodaan tunnusta…" : "Luo tunnus"}
      </button>

      <p className="text-sm opacity-80">
        Onko sinulla jo tunnus?{" "}
        <Link href="/login" className="underline">
          Kirjaudu sisään
        </Link>
      </p>
    </form>
  );
}
