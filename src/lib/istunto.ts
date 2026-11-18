// Apufunktiot istunnon vaatimiseen sivulla tai server actionissa.
//
// Nämä ovat reittisuojauksen (src/proxy.ts) rinnalla toimiva toinen lukko.
// Ne ajetaan aina
// palvelimella, joten niitä ei voi ohittaa selaimesta – esimerkiksi
// kutsumalla server actionia suoraan ilman sivun avaamista.
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

/**
 * Palauttaa kirjautuneen käyttäjän istunnon. Jos käyttäjä ei ole
 * kirjautunut, hän ohjataan kirjautumissivulle eikä funktio palaa.
 */
export async function vaadiIstunto(): Promise<Session> {
  const istunto = await auth();

  if (!istunto?.user) {
    redirect("/login");
  }

  return istunto;
}

/**
 * Sama kuin vaadiIstunto, mutta vaatii lisäksi ADMIN-roolin.
 * Väärällä roolilla käyttäjä ohjataan koontinäkymään: hän on kirjautunut,
 * joten kirjautumissivu olisi hänelle umpikuja.
 */
export async function vaadiAdmin(): Promise<Session> {
  const istunto = await vaadiIstunto();

  if (istunto.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return istunto;
}
