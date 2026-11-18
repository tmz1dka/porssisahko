// Reittien suojaus. Tämä tiedosto on koodia, joka ajetaan ennen kuin pyyntö
// päätyy sivulle. Tässä se tarkistaa istunnon ja roolin, ja ohjaa käyttäjän
// pois sellaiselta sivulta, jolle hänellä ei ole asiaa.
//
// Next.js kutsui tätä aiemmin nimellä "middleware" ja versiosta 16 alkaen
// nimellä "proxy". Kyse on samasta asiasta, vain tiedoston nimi vaihtui.
//
// Tämä on ensimmäinen lukko, ei ainoa. Jokainen suojattu sivu tarkistaa
// oikeuden myös itse palvelimella (ks. src/lib/istunto.ts). Kaksi tarkistusta,
// koska alla olevaan polkulistaan jää helposti uusi sivu lisäämättä –
// silloin sivu itse estää pääsyn.
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authAsetukset } from "@/lib/auth.config";
import { tarkistaPaasy } from "@/lib/kayttooikeudet";

const { auth } = NextAuth(authAsetukset);

export default auth((pyynto) => {
  const polku = pyynto.nextUrl.pathname;
  const rooli = pyynto.auth?.user?.role ?? null;

  const paasy = tarkistaPaasy(polku, rooli);

  if (paasy.sallittu) {
    return NextResponse.next();
  }

  const kohde = new URL(paasy.ohjaa, pyynto.nextUrl);

  // Kirjautumattomalle muistetaan, mille sivulle hän oli menossa, jotta
  // kirjautumisen jälkeen hän päätyy sinne eikä aloita alusta.
  if (paasy.syy === "kirjautumaton") {
    kohde.searchParams.set("seuraava", polku);
  }

  return NextResponse.redirect(kohde);
});

// Tarkistus ajetaan vain näillä poluilla. ":path*" tarkoittaa myös alasivut.
// Lista pidetään tarkoituksella suppeana, jotta tarkistus ei hidasta
// julkisia sivuja eikä kuvatiedostojen hakemista.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/devices/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
