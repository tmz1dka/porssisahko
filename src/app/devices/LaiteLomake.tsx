// Laitteen lomake. Sama lomake sekä uudelle että muokattavalle laitteelle,
// jotta kentät ja virheilmoitukset ovat molemmissa samanlaiset.
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lomakekentta } from "@/components/Lomakekentta";
import type { Laite } from "@/lib/laitteet";
import type { LaiteTila } from "./actions";

const alkutila: LaiteTila = {};

type Props = {
  /** Palvelintoiminto, joka tallentaa laitteen. */
  toiminto: (tila: LaiteTila, lomake: FormData) => Promise<LaiteTila>;
  /** Muokattavan laitteen tiedot. Puuttuu, kun lisätään uusi laite. */
  laite?: Laite;
  lahetysteksti: string;
};

/** Näyttää luvun suomalaisittain pilkulla: 1.5 -> "1,5". */
function pilkulla(luku: number): string {
  return String(luku).replace(".", ",");
}

export function LaiteLomake({ toiminto, laite, lahetysteksti }: Props) {
  const [tila, lahetä, odottaa] = useActionState(toiminto, alkutila);

  // Kentän oletusarvo: ensin käyttäjän oma kirjoitus virheen jälkeen, sitten
  // muokattavan laitteen arvo, ja uudella laitteella tyhjä.
  const arvot = tila.arvot;

  return (
    <form action={lahetä} className="flex flex-col gap-4">
      <Lomakekentta
        nimi="name"
        otsikko="Laitteen nimi"
        tyyppi="text"
        ohje="Esimerkiksi Pyykinpesukone tai Astianpesukone."
        oletusarvo={arvot?.name ?? laite?.name}
        virhe={tila.virheet?.name}
      />

      <Lomakekentta
        nimi="powerKw"
        otsikko="Teho (kW)"
        tyyppi="text"
        syotetila="decimal"
        ohje="Löytyy laitteen tyyppikilvestä. Jos siinä lukee watteja, jaa tuhannella: 2000 W on 2 kW."
        oletusarvo={arvot?.powerKw ?? (laite ? pilkulla(laite.powerKw) : undefined)}
        virhe={tila.virheet?.powerKw}
      />

      <Lomakekentta
        nimi="durationHours"
        otsikko="Käyttökerran kesto (tuntia)"
        tyyppi="text"
        syotetila="decimal"
        ohje="Kuinka kauan yksi käyttökerta kestää. Puoli tuntia on 0,5."
        oletusarvo={
          arvot?.durationHours ??
          (laite ? pilkulla(laite.durationHours) : undefined)
        }
        virhe={tila.virheet?.durationHours}
      />

      {tila.yleinenVirhe && (
        <p
          role="alert"
          className="rounded-md border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {tila.yleinenVirhe}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={odottaa}
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {odottaa ? "Tallennetaan…" : lahetysteksti}
        </button>

        <Link href="/devices" className="text-sm underline">
          Peruuta
        </Link>
      </div>
    </form>
  );
}
