// Rekisteröitymisen palvelinpuolen käsittely. Server action tarkoittaa
// funktiota, joka ajetaan aina palvelimella, vaikka se käynnistyy lomakkeen
// lähetyksestä selaimessa. Näin salasanan käsittely ei tapahdu selaimessa.
"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { kentanVirheet, rekisterointiSkeema } from "@/lib/validointi";

// bcryptin kierrosluku: mitä suurempi, sitä hitaampi salasanan arvaaminen on.
const BCRYPT_KIERROKSET = 12;

export type RekisterointiTila = {
  virheet?: Record<string, string>;
  yleinenVirhe?: string;
  onnistui?: boolean;
  email?: string;
};

export async function rekisteroi(
  _edellinenTila: RekisterointiTila,
  lomake: FormData,
): Promise<RekisterointiTila> {
  const syote = {
    email: String(lomake.get("email") ?? ""),
    password: String(lomake.get("password") ?? ""),
    passwordConfirm: String(lomake.get("passwordConfirm") ?? ""),
  };

  // Sama tarkistus kuin lomakkeella, mutta tehdään uudelleen palvelimella.
  // Selaimen tarkistukset voi ohittaa, palvelimen ei.
  const tulos = rekisterointiSkeema.safeParse(syote);

  if (!tulos.success) {
    return { virheet: kentanVirheet(tulos.error), email: syote.email };
  }

  const { email, password } = tulos.data;

  const onJoOlemassa = await prisma.user.findUnique({ where: { email } });

  if (onJoOlemassa) {
    return {
      virheet: { email: "Tällä sähköpostilla on jo tunnus." },
      email,
    };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_KIERROKSET);

  try {
    await prisma.user.create({ data: { email, passwordHash } });
  } catch {
    // Jos kaksi rekisteröitymistä osuu samaan hetkeen, tietokannan
    // uniikkisääntö estää kaksoistilin ja haku yllä ei vielä nähnyt sitä.
    return {
      virheet: { email: "Tällä sähköpostilla on jo tunnus." },
      email,
    };
  }

  return { onnistui: true, email };
}
