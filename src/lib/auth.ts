// Tunnistautuminen: sähköpostin ja salasanan tarkistus tietokantaa vastaan.
// Auth.js hoitaa istunnon eli muistamisen siitä, kuka on kirjautuneena.
// Yhteiset asetukset ovat tiedostossa auth.config.ts.
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authAsetukset } from "@/lib/auth.config";
import { kirjautumisSkeema } from "@/lib/validointi";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Yhteiset asetukset (istunto, sivut, callbackit) tulevat auth.config.:sta,
  // jota myös middleware käyttää. Tässä lisätään vain tunnistautuminen,
  // joka tarvitsee tietokannan ja salasanojen vertailun.
  ...authAsetukset,
  providers: [
    Credentials({
      // Lomakkeen kentät. Auth.js antaa nämä authorize-funktiolle.
      credentials: {
        email: { label: "Sähköposti", type: "email" },
        password: { label: "Salasana", type: "password" },
      },

      // authorize palauttaa käyttäjän, jos tunnukset ovat oikeat, ja
      // null, jos eivät. null johtaa kirjautumisvirheeseen.
      async authorize(syote) {
        const tulos = kirjautumisSkeema.safeParse(syote);

        if (!tulos.success) {
          return null;
        }

        const { email, password } = tulos.data;

        const kayttaja = await prisma.user.findUnique({ where: { email } });

        // Jos sähköpostia ei löydy, verrataan salasanaa silti valetiivisteeseen.
        // Näin vastaus kestää yhtä kauan riippumatta siitä, onko tunnus
        // olemassa – muuten ulkopuolinen voisi päätellä vastausajasta,
        // mitkä sähköpostit ovat käytössä.
        const tiiviste =
          kayttaja?.passwordHash ??
          "$2a$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012";

        const salasanaTasmaa = await bcrypt.compare(password, tiiviste);

        if (!kayttaja || !salasanaTasmaa) {
          return null;
        }

        // Palautetaan vain se, mitä istunnossa tarvitaan.
        // Salasanan tiivistettä ei anneta eteenpäin koskaan.
        return { id: kayttaja.id, email: kayttaja.email, role: kayttaja.role };
      },
    }),
  ],
});
