// Kirjautumisen ne asetukset, jotka eivät tarvitse tietokantaa.
//
// Asetukset on jaettu kahteen tiedostoon tarkoituksella. Reittien suojaus
// (src/proxy.ts) ajetaan kevyessä ympäristössä, jossa tietokanta-ajuri ja
// salasanojen tiivistyskirjasto eivät toimi. Kun ne jätetään tästä pois,
// suojaus voi silti lukea istunnon evästeestä ja tarkistaa roolin.
// Varsinainen tunnistautuminen on tiedostossa auth.ts.
import type { NextAuthConfig } from "next-auth";

export const authAsetukset = {
  // Istunto tallennetaan selaimen evästeeseen allekirjoitettuna (JWT),
  // ei tietokantaan. Tämä on Credentials-kirjautumisen vaatima tapa ja
  // samalla syy siihen, että reittisuojaus pärjää ilman tietokantaa.
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
    // ja reittisuojaus näkevät.
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

  // Providers täytetään tiedostossa auth.ts. Tyhjä lista tässä pitää
  // reittisuojauksen riippuvuudet kevyinä.
  providers: [],
} satisfies NextAuthConfig;
