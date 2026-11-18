// Reittien suojaus. Middleware on koodi, joka ajetaan ennen kuin pyyntö
// päätyy sivulle. Tässä se tarkistaa istunnon ja roolin, ja ohjaa käyttäjän
// pois sellaiselta sivulta, jolle hänellä ei ole asiaa.
//
// Tämä on ensimmäinen lukko, ei ainoa. Jokainen suojattu sivu tarkistaa
// oikeuden myös itse palvelimella (ks. src/lib/istunto.ts). Kaksi tarkistusta,
// koska middlewaren asetuksiin (matcher alla) jää helposti uusi sivu
// lisäämättä – silloin sivu itse estää pääsyn.
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

// Middleware ajetaan vain näillä poluilla. ":path*" tarkoittaa myös alasivut.
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
