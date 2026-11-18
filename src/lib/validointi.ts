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
