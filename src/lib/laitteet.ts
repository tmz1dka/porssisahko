// Laitteiden tietokantahaut ja -muutokset.
//
// Jokainen funktio ottaa käyttäjän tunnisteen ja käyttää sitä osana
// kyselyä. Näin käyttäjä voi käsitellä vain omia laitteitaan: ehto on
// kyselyssä itsessään, ei erillisenä tarkistuksena, jonka voisi unohtaa.
import { prisma } from "@/lib/prisma";
import type { LaiteSyote } from "@/lib/validointi";

/** Laitteen tiedot, jotka sivut tarvitsevat. */
export type Laite = {
  id: string;
  name: string;
  powerKw: number;
  durationHours: number;
};

const KENTAT = {
  id: true,
  name: true,
  powerKw: true,
  durationHours: true,
} as const;

/** Hakee käyttäjän laitteet aakkosjärjestyksessä. */
export async function haeLaitteet(userId: string): Promise<Laite[]> {
  return prisma.device.findMany({
    where: { userId },
    select: KENTAT,
    orderBy: { name: "asc" },
  });
}

/**
 * Hakee yhden laitteen. Palauttaa null, jos laitetta ei ole tai se kuuluu
 * toiselle käyttäjälle – kutsujan ei tarvitse erottaa näitä toisistaan,
 * eikä käyttäjälle pidäkään kertoa, onko toisen laite olemassa.
 */
export async function haeLaite(
  id: string,
  userId: string,
): Promise<Laite | null> {
  return prisma.device.findFirst({
    where: { id, userId },
    select: KENTAT,
  });
}

export async function luoLaite(
  userId: string,
  syote: LaiteSyote,
): Promise<Laite> {
  return prisma.device.create({
    data: { ...syote, userId },
    select: KENTAT,
  });
}

/**
 * Päivittää laitteen. Palauttaa false, jos laitetta ei löytynyt tältä
 * käyttäjältä.
 *
 * updateMany eikä update, koska updateMany sallii omistajan ehdon samassa
 * kyselyssä. update vaatisi pelkän tunnisteen, jolloin omistaja pitäisi
 * tarkistaa erikseen – ja se tarkistus voisi jäädä tekemättä.
 */
export async function paivitaLaite(
  id: string,
  userId: string,
  syote: LaiteSyote,
): Promise<boolean> {
  const tulos = await prisma.device.updateMany({
    where: { id, userId },
    data: syote,
  });

  return tulos.count > 0;
}

/** Poistaa laitteen. Palauttaa false, jos laitetta ei löytynyt. */
export async function poistaLaite(
  id: string,
  userId: string,
): Promise<boolean> {
  const tulos = await prisma.device.deleteMany({ where: { id, userId } });

  return tulos.count > 0;
}
