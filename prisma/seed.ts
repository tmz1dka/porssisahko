// Seed eli tietokannan alustus lähtötiedoilla. Tämä skripti luo ensimmäisen
// ylläpitäjätilin, koska tyhjässä tietokannassa ei ole ketään, joka voisi
// päästä ylläpitosivulle. Skripti on turvallista ajaa monta kertaa:
// jos tili on jo olemassa, sitä ei luoda uudelleen eikä salasanaa ylikirjoiteta.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Puuttuu DATABASE_URL. Kopioi .env.example tiedostoksi .env ja täytä tietokannan osoite.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

// bcryptin "kierrosluku" kertoo, kuinka raskasta salasanan laskeminen on.
// Mitä suurempi luku, sitä hitaampi arvaaminen on hyökkääjälle. 12 on
// yleinen suositus: riittävän hidas hyökkääjälle, riittävän nopea käyttäjälle.
const BCRYPT_KIERROKSET = 12;

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const salasana = process.env.ADMIN_PASSWORD;

  // Salasanaa ei kirjoiteta koodiin, vaan se luetaan .env-tiedostosta,
  // jota ei viedä versionhallintaan.
  if (!email || !salasana) {
    throw new Error(
      "Puuttuu ADMIN_EMAIL tai ADMIN_PASSWORD. Lisää ne .env-tiedostoon (katso .env.example).",
    );
  }

  if (salasana.length < 10) {
    throw new Error("ADMIN_PASSWORD on liian lyhyt: vähintään 10 merkkiä.");
  }

  const olemassa = await prisma.user.findUnique({ where: { email } });

  if (olemassa) {
    console.log(`Ylläpitäjä ${email} on jo olemassa – ei muutoksia.`);
    return;
  }

  const passwordHash = await bcrypt.hash(salasana, BCRYPT_KIERROKSET);

  await prisma.user.create({
    data: { email, passwordHash, role: "ADMIN" },
  });

  console.log(`Luotiin ylläpitäjä: ${email}`);
}

main()
  .catch((virhe) => {
    console.error("Seed epäonnistui:", virhe);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
