// Prisman asetukset: mistä skeema löytyy, minne migraatiot tallennetaan,
// mistä tietokannan osoite luetaan ja millä komennolla seed ajetaan.
import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

// Osa Prisman komennoista tarvitsee yhteyden tietokantaan (migraatiot, seed),
// osa ei. Erityisesti "prisma generate" lukee pelkän skeeman, ja se ajetaan
// automaattisesti jokaisen npm installin jälkeen – myös CI:ssä, jossa
// tietokantaa ei ole. Siksi puuttuva osoite saa pysäyttää vain ne komennot,
// jotka oikeasti tarvitsevat sen.
const komento = process.argv.slice(2).join(" ");
const tarvitseeTietokannan = komento.startsWith("migrate") || komento.startsWith("db");

if (tarvitseeTietokannan && !databaseUrl) {
  throw new Error(
    [
      `Komento "prisma ${komento}" tarvitsee tietokantayhteyden, mutta ympäristömuuttuja DATABASE_URL on tyhjä.`,
      "",
      "Omalla koneella: kopioi .env.example tiedostoksi .env ja täytä tietokannan osoite.",
      "",
      "Vercelissä: Settings > Environment Variables. Muuttuja pitää valita",
      "ERIKSEEN kaikkiin kolmeen ympäristöön: Production, Preview ja Development.",
      "Pull requestin esikatselujulkaisu käyttää Previewiä, mutta main-haaraan",
      "yhdistämisestä syntyvä julkaisu käyttää Productionia – pelkkä Preview",
      "riittää siis PR:n tarkistukseen mutta ei tuotantoon.",
      "",
      "Muutos vaikuttaa vasta uudesta commitista tehtyyn julkaisuun,",
      "ei Redeploy-painikkeella.",
    ].join("\n"),
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Seed tarkoittaa tietokannan alustamista lähtötiedoilla.
    // Tässä projektissa se luo ensimmäisen ylläpitäjätilin.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
