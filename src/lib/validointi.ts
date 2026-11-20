// Käyttäjän syötteiden tarkistussäännöt. Zod kuvaa, millainen syötteen pitää
// olla, ja antaa virheilmoitukset suomeksi. Samat säännöt käytetään sekä
// lomakkeella että palvelimella, jotta selaimen ohi ei voi lähettää
// kelvotonta tietoa.
import { z } from "zod";

// Salasanan vähimmäispituus kerrotaan käyttäjälle etukäteen lomakkeella,
// ei vasta virheilmoituksena.
export const SALASANAN_VAHIMMAISPITUUS = 10;

// Sähköposti muutetaan pieniksi kirjaimiksi, jotta "Maija@..." ja "maija@..."
// eivät voi olla kaksi eri tiliä.
const sahkoposti = z
  .string()
  .trim()
  .min(1, "Sähköposti puuttuu.")
  .max(255, "Sähköposti on liian pitkä.")
  .email("Tarkista sähköpostiosoite.")
  .toLowerCase();

const salasana = z
  .string()
  .min(
    SALASANAN_VAHIMMAISPITUUS,
    `Salasanan pitää olla vähintään ${SALASANAN_VAHIMMAISPITUUS} merkkiä.`,
  )
  // bcrypt huomioi vain 72 ensimmäistä tavua, joten pidempi salasana ei
  // lisäisi turvaa mutta antaisi käyttäjälle väärän käsityksen.
  .max(72, "Salasana voi olla enintään 72 merkkiä.");

// Rekisteröityminen: sähköposti, salasana ja salasanan vahvistus.
export const rekisterointiSkeema = z
  .object({
    email: sahkoposti,
    password: salasana,
    passwordConfirm: z.string(),
  })
  // refine tarkistaa kahden kentän suhteen toisiinsa: pelkkä yksittäisen
  // kentän tarkistus ei riitä, koska vertailu vaatii molemmat arvot.
  .refine((arvot) => arvot.password === arvot.passwordConfirm, {
    message: "Salasanat eivät täsmää.",
    path: ["passwordConfirm"],
  });

// Kirjautuminen: salasanalle ei tarkisteta pituutta, koska vanhat tunnukset
// voivat olla eri sääntöjen aikaisia eikä virhe saa paljastaa mitään.
export const kirjautumisSkeema = z.object({
  email: sahkoposti,
  password: z.string().min(1, "Salasana puuttuu."),
});

export type RekisterointiSyote = z.infer<typeof rekisterointiSkeema>;
export type KirjautumisSyote = z.infer<typeof kirjautumisSkeema>;

/**
 * Muuttaa Zodin virheet muotoon { kentän nimi: virheilmoitus },
 * jota lomake voi näyttää suoraan oikean kentän vieressä.
 */
export function kentanVirheet(virhe: z.ZodError): Record<string, string> {
  const tulos: Record<string, string> = {};

  for (const ongelma of virhe.issues) {
    const kentta = String(ongelma.path[0] ?? "");
    // Näytetään kentän ensimmäinen virhe, jotta lomake ei täyty tekstistä.
    if (kentta && !tulos[kentta]) {
      tulos[kentta] = ongelma.message;
    }
  }

  return tulos;
}

// --- Laitteet ---

// Rajat ovat väljiä mutta estävät selvästi virheelliset arvot. Tarkoitus ei
// ole arvailla, mitä laitteita kotona on, vaan huomata näppäilyvirheet:
// 2000 kW:n pyykinpesukone on varmasti kirjoitusvirhe (watit kilowattien
// sijaan), eikä 0 tunnin käyttöaika tarkoita mitään.
export const LAITTEEN_NIMEN_ENIMMAISPITUUS = 60;
export const TEHON_YLARAJA_KW = 50;
export const KESTON_YLARAJA_TUNTIA = 24;

const laitteenNimi = z
  .string()
  .trim()
  .min(1, "Anna laitteelle nimi.")
  .max(
    LAITTEEN_NIMEN_ENIMMAISPITUUS,
    `Nimi voi olla enintään ${LAITTEEN_NIMEN_ENIMMAISPITUUS} merkkiä.`,
  );

/**
 * Muuttaa lomakkeen tekstin luvuksi.
 *
 * Lomake lähettää aina tekstiä, ja suomalainen käyttäjä kirjoittaa
 * desimaalit pilkulla ("1,5"). Pilkku vaihdetaan pisteeksi, jotta luku
 * tulkitaan oikein. Tyhjä teksti muutetaan arvoksi NaN, jolloin
 * tarkistus antaa siitä oman virheilmoituksensa.
 */
function luvuksi(arvo: unknown): number {
  if (typeof arvo === "number") {
    return arvo;
  }

  const teksti = String(arvo ?? "").trim().replace(",", ".");

  return teksti === "" ? Number.NaN : Number(teksti);
}

const teho = z.preprocess(
  luvuksi,
  z
    .number({ error: "Anna teho numerona, esimerkiksi 2 tai 0,5." })
    .positive("Tehon pitää olla suurempi kuin nolla.")
    .max(
      TEHON_YLARAJA_KW,
      `Teho voi olla enintään ${TEHON_YLARAJA_KW} kW. Tarkista, ettet kirjoittanut watteja.`,
    ),
);

const kesto = z.preprocess(
  luvuksi,
  z
    .number({ error: "Anna kesto numerona, esimerkiksi 2 tai 1,5." })
    .positive("Keston pitää olla suurempi kuin nolla.")
    .max(
      KESTON_YLARAJA_TUNTIA,
      `Kesto voi olla enintään ${KESTON_YLARAJA_TUNTIA} tuntia.`,
    ),
);

export const laiteSkeema = z.object({
  name: laitteenNimi,
  powerKw: teho,
  durationHours: kesto,
});

export type LaiteSyote = z.infer<typeof laiteSkeema>;
