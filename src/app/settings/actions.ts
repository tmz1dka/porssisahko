// Asetussivun palvelinpuolen toiminnot. Tällä hetkellä tilin poisto.
"use server";

import bcrypt from "bcryptjs";
import { signOut } from "@/lib/auth";
import { vaadiIstunto } from "@/lib/istunto";
import { voikoPoistaaOmanTilin } from "@/lib/kayttooikeudet";
import { prisma } from "@/lib/prisma";

export type PoistoTila = {
  virhe?: string;
};

export async function poistaTili(
  _edellinenTila: PoistoTila,
  lomake: FormData,
): Promise<PoistoTila> {
  // Oikeus tarkistetaan myös tässä. Server actionia voi kutsua suoraan
  // ilman sivun avaamista, joten reittisuojauksen tarkistus ei yksin riitä.
  const istunto = await vaadiIstunto();

  const salasana = String(lomake.get("password") ?? "");
  const vahvistettu = lomake.get("confirm") === "on";

  if (!vahvistettu) {
    return { virhe: "Vahvista poisto ruksaamalla vahvistus." };
  }

  if (salasana.length === 0) {
    return { virhe: "Syötä salasanasi." };
  }

  const kayttaja = await prisma.user.findUnique({
    where: { id: istunto.user.id },
    select: { id: true, role: true, passwordHash: true },
  });

  // Tunnus voi olla jo poistettu esimerkiksi ylläpitäjän toimesta, vaikka
  // selaimessa olisi vielä vanha istunto.
  if (!kayttaja) {
    await signOut({ redirectTo: "/" });
    return {};
  }

  // Salasana kysytään, koska tilin poistoa ei voi peruuttaa. Näin pelkkä
  // avoimeksi jäänyt selain ei riitä tilin poistamiseen.
  const salasanaTasmaa = await bcrypt.compare(salasana, kayttaja.passwordHash);

  if (!salasanaTasmaa) {
    return { virhe: "Salasana on väärin." };
  }

  // Ylläpitäjien määrä lasketaan vain silloin, kun poistaja on itse
  // ylläpitäjä. Päätössääntö on omana funktiona, jotta se on testattavissa.
  const yllapitajia =
    kayttaja.role === "ADMIN"
      ? await prisma.user.count({ where: { role: "ADMIN" } })
      : 0;

  if (!voikoPoistaaOmanTilin(kayttaja.role, yllapitajia)) {
    return {
      virhe:
        "Viimeistä ylläpitäjää ei voi poistaa. Tee ensin toisesta käyttäjästä ylläpitäjä.",
    };
  }

  // Käyttäjän laitteet poistuvat samalla, koska tietokannan säännössä on
  // onDelete: Cascade. Orpoja laitteita ei siis jää.
  await prisma.user.delete({ where: { id: kayttaja.id } });

  // Uloskirjautuminen tapahtuu uudelleenohjauksella, jonka Next.js toteuttaa
  // poikkeuksella. Siksi tämä on vasta lopussa eikä try-lohkossa.
  await signOut({ redirectTo: "/" });

  return {};
}
