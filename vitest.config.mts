// Vitestin asetukset. Vitest ajaa yksikkötestit eli pienet tarkistukset,
// jotka varmistavat yksittäisten funktioiden toimivan oikein.
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

export default defineConfig({
  test: {
    // Testit haetaan src-kansiosta tiedostoista, joiden nimessä on .test.
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
  resolve: {
    // Sama "@/"-lyhenne kuin sovelluskoodissa, jotta testit tuovat tiedostot samalla tavalla.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
