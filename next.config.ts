// Next.jsin asetustiedosto. Pidetään tarkoituksella pienenä:
// vain ne asetukset, joita sovellus todella tarvitsee.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript-virheet pysäyttävät käännöksen, jotta rikkinäinen
  // versio ei pääse tuotantoon. ESLint ajetaan erikseen (npm run lint).
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
