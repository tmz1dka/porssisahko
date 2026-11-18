// Kirjautumisen asetukset. Auth.js hoitaa istunnon eli muistamisen siitä,
// kuka on kirjautuneena. Tunnistautuminen tehdään sähköpostilla ja
// salasanalla, jotka tarkistetaan omaa tietokantaa vastaan.
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { kirjautumisSkeema } from "@/lib/validointi";

export const { handlers, signIn, signOut, auth } = NextAuth({
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

  // Istunto tallennetaan selaimen evästeeseen allekirjoitettuna (JWT),
  // ei tietokantaan. Tämä on Credentials-kirjautumisen vaatima tapa.
  session: { strategy: "jwt" },

  // Oma kirjautumissivu Auth.js:n oletussivun sijaan.
  pages: { signIn: "/login" },

  callbacks: {
    // Rooli ja tunniste tallennetaan istuntoon kirjautumisen yhteydessä,
    // jottei niitä tarvitse hakea tietokannasta joka sivulatauksella.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // Tässä istunnon tiedot siirretään muotoon, jonka sovelluksen sivut
    // näkevät. Vaihe 6 käyttää roolia sivujen suojaamiseen.
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      if (token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});
