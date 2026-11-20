// Pylväskaavio pörssisähkön hinnoista. Selainkomponentti, koska Recharts
// piirtää kaavion selaimessa ja tarvitsee sivun leveyden.
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type KaavioJakso = {
  /** Kellonaika Suomen aikaa, esimerkiksi "14.15". */
  kello: string;
  sntPerKwh: number;
};

type Props = {
  jaksot: KaavioJakso[];
  /** Halvimman jakson kellonaika korostetaan omalla värillä. */
  halvinKello?: string;
};

// Värit kerrotaan tässä, jotta kaavio ja selitteet pysyvät samanlaisina.
const VARI_TAVALLINEN = "#2563eb";
const VARI_HALVIN = "#16a34a";
const VARI_NEGATIIVINEN = "#7c3aed";

/** Näytetäänkö tämä kellonaika x-akselilla. */
function onNaytettavaKello(kello: string): boolean {
  const [tunti, minuutti] = kello.split(".");
  // Vain tasatunnit ja niistäkin joka neljäs: 00, 04, 08, 12, 16 ja 20.
  // Pylväitä voi olla 96 (15 minuutin jaksot), ja kapealla näytöllä
  // tiheämmät aikaleimat menisivät päällekkäin lukukelvottomiksi.
  return minuutti === "00" && Number(tunti) % 4 === 0;
}

export function HintaKaavio({ jaksot, halvinKello }: Props) {
  // Näytettävät aikaleimat lasketaan valmiiksi ja annetaan Rechartsille
  // listana. Näin kaavio näyttää samalta kaikilla näytön leveyksillä.
  const aikaleimat = jaksot
    .map((jakso) => jakso.kello)
    .filter(onNaytettavaKello);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={jaksot} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="kello"
            ticks={aikaleimat}
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            width={44}
            label={{
              value: "snt/kWh",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11 },
            }}
          />
          {/* Rechartsin tyypit sallivat tässä minkä tahansa arvon, joten
              muotoilijat varmistavat itse, että kyse on luvusta. */}
          <Tooltip
            formatter={(arvo) => [
              typeof arvo === "number"
                ? `${arvo.toFixed(2).replace(".", ",")} snt/kWh`
                : "–",
              "Hinta",
            ]}
            labelFormatter={(kello) => `Klo ${String(kello)}`}
          />
          {/* Nollaviiva näkyviin, koska hinta voi olla negatiivinen. */}
          <ReferenceLine y={0} stroke="currentColor" opacity={0.4} />
          {/* Animaatio pois: kaavio on valmis heti eikä sivu näytä hetkeä
              tyhjältä, mikä hidas yhteys korostaisi entisestään. */}
          <Bar dataKey="sntPerKwh" name="Hinta" isAnimationActive={false}>
            {jaksot.map((jakso, indeksi) => (
              <Cell
                key={`${jakso.kello}-${indeksi}`}
                fill={
                  jakso.sntPerKwh < 0
                    ? VARI_NEGATIIVINEN
                    : jakso.kello === halvinKello
                      ? VARI_HALVIN
                      : VARI_TAVALLINEN
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
