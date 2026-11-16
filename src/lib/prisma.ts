// Yhteys tietokantaan. Tämän tiedoston kautta koko sovellus lukee ja
// kirjoittaa tietoja, jotta yhteyksiä ei synny montaa rinnakkain.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 tarvitsee erillisen ajurin, joka osaa puhua PostgreSQLin kanssa.
// Osoite luetaan ympäristömuuttujasta, jotta salasana ei ole koodissa.
function luoAsiakas() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Puuttuu DATABASE_URL. Kopioi .env.example tiedostoksi .env ja täytä tietokannan osoite.",
    );
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// Kehitystilassa Next.js lataa koodin uudelleen jokaisen muutoksen jälkeen.
// Ilman tätä temppua jokainen lataus loisi uuden yhteyden tietokantaan ja
// yhteydet loppuisivat kesken. Siksi valmis yhteys talletetaan globaaliin
// muuttujaan ja otetaan uudelleen käyttöön. Tuotannossa tätä ei tarvita.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? luoAsiakas();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
