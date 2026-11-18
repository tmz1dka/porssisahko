// Yhteys tietokantaan. Tämän tiedoston kautta koko sovellus lukee ja
// kirjoittaa tietoja, jotta yhteyksiä ei synny montaa rinnakkain.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Kehitystilassa Next.js lataa koodin uudelleen jokaisen muutoksen jälkeen.
// Ilman tätä temppua jokainen lataus loisi uuden yhteyden tietokantaan ja
// yhteydet loppuisivat kesken. Siksi valmis yhteys talletetaan globaaliin
// muuttujaan ja otetaan uudelleen käyttöön.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function luoAsiakas(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Puuttuu DATABASE_URL. Kopioi .env.example tiedostoksi .env ja täytä tietokannan osoite.",
    );
  }

  // Prisma 7 tarvitsee erillisen ajurin, joka osaa puhua PostgreSQLin kanssa.
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

function haeAsiakas(): PrismaClient {
  globalForPrisma.prisma ??= luoAsiakas();
  return globalForPrisma.prisma;
}

// Yhteys luodaan vasta ensimmäisellä käytöllä, ei heti tiedoston latauksessa.
// Syy: Next.js lataa kaikki sivujen käyttämät tiedostot myös käännöksen
// aikana, jolloin tietokantaa ei ole saatavilla eikä sitä tarvita. Jos yhteys
// luotaisiin heti, käännös vaatisi tietokannan osoitteen turhaan – ja CI
// kääntää sovelluksen tarkoituksella ilman tietokantaa.
//
// Proxy välittää jokaisen käytön eteenpäin oikealle asiakkaalle. Funktiot
// sidotaan asiakkaaseen, jotta ne toimivat myös erikseen poimittuina.
export const prisma = new Proxy({} as PrismaClient, {
  get(_kohde, ominaisuus) {
    const asiakas = haeAsiakas();
    const arvo = asiakas[ominaisuus as keyof PrismaClient];
    return typeof arvo === "function" ? arvo.bind(asiakas) : arvo;
  },
});
