// Apufunktiot istunnon vaatimiseen sivulla tai server actionissa.
//
// Nämä ovat reittisuojauksen (src/proxy.ts) rinnalla toimiva toinen lukko.
// Ne ajetaan aina
// palvelimella, joten niitä ei voi ohittaa selaimesta – esimerkiksi
// kutsumalla server actionia suoraan ilman sivun avaamista.
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
 *
 * Rooli tarkistetaan tietokannasta eikä istunnosta. Syy: istunto on
 * allekirjoitettu eväste, joka säilyy selaimessa kirjautumisesta lähtien.
 * Jos käyttäjän ylläpito-oikeus poistetaan, evästeessä lukee vielä vanha
 * rooli, ja pelkkä istunnon lukeminen päästäisi hänet edelleen sisään.
 * Tämä on yksi tietokantakysely ylläpitosivun latausta kohden – pieni hinta
 * siitä, että oikeuden poisto vaikuttaa heti.
 */
export async function vaadiAdmin(): Promise<Session> {
  const istunto = await vaadiIstunto();

  const kayttaja = await prisma.user.findUnique({
    where: { id: istunto.user.id },
    select: { role: true },
  });

  if (kayttaja?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Palautetaan istunto niin, että rooli on tietokannan mukainen.
  return { ...istunto, user: { ...istunto.user, role: kayttaja.role } };
}
