// Kirjautumisen ja uloskirjautumisen palvelinpuolen käsittely.
"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { kentanVirheet, kirjautumisSkeema } from "@/lib/validointi";

export type KirjautumisTila = {
  virheet?: Record<string, string>;
  yleinenVirhe?: string;
  email?: string;
};

export async function kirjaudu(
  _edellinenTila: KirjautumisTila,
  lomake: FormData,
): Promise<KirjautumisTila> {
  const syote = {
    email: String(lomake.get("email") ?? ""),
    password: String(lomake.get("password") ?? ""),
  };

  const tulos = kirjautumisSkeema.safeParse(syote);

  if (!tulos.success) {
    return { virheet: kentanVirheet(tulos.error), email: syote.email };
  }

  try {
    // redirectTo kertoo, mihin käyttäjä ohjataan onnistuneen kirjautumisen
    // jälkeen. Koontinäkymä on sovelluksen tärkein sivu.
    await signIn("credentials", {
      email: tulos.data.email,
      password: tulos.data.password,
      redirectTo: "/dashboard",
    });
  } catch (virhe) {
    // Onnistunut kirjautuminen tapahtuu uudelleenohjauksella, jonka Next.js
    // toteuttaa poikkeuksella. Se pitää päästää läpi, muuten ohjaus ei tapahdu.
    if (virhe instanceof AuthError) {
      // Virheilmoitus on tarkoituksella sama sekä väärästä sähköpostista että
      // väärästä salasanasta. Muuten ulkopuolinen voisi kokeilla osoitteita
      // ja päätellä vastauksista, kenellä on tunnus palvelussa.
      return {
        yleinenVirhe: "Sähköposti tai salasana on väärin.",
        email: syote.email,
      };
    }

    throw virhe;
  }

  return { email: syote.email };
}

export async function kirjauduUlos() {
  await signOut({ redirectTo: "/" });
}
