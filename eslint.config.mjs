// ESLintin asetukset. ESLint on tarkastaja, joka huomauttaa koodista
// löytyvistä virheistä ja epäyhtenäisistä tavoista jo ennen ajamista.
import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    // Nämä kansiot ja tiedostot syntyvät koneellisesti, joten niitä ei tarkasteta.
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      // Prisman luoma koodi: ei kirjoitettu käsin, joten ei myöskään tarkasteta.
      "src/generated/**",
    ],
  },
  // Next.jsin valmiit säännöt: core-web-vitals valvoo myös suorituskykyä
  // ja saavutettavuutta, typescript TypeScript-kohtaisia asioita.
  ...coreWebVitals,
  ...nextTypescript,
];

export default config;
