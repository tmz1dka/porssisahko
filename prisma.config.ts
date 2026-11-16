// Prisman asetukset: mistä skeema löytyy, minne migraatiot tallennetaan,
// mistä tietokannan osoite luetaan ja millä komennolla seed ajetaan.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Seed tarkoittaa tietokannan alustamista lähtötiedoilla.
    // Tässä projektissa se luo ensimmäisen ylläpitäjätilin.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
