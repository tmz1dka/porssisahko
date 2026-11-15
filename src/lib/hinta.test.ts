// Yksikkötestit hinnan laskennalle ja muotoilulle.
import { describe, expect, it } from "vitest";
import {
  laskeHintaEuroina,
  laskeKulutusKwh,
  muotoileEuroa,
  muotoileSnt,
} from "@/lib/hinta";

describe("laskeKulutusKwh", () => {
  it("laskee tehon ja keston perusteella kulutuksen", () => {
    expect(laskeKulutusKwh(2, 2)).toBe(4);
  });

  it("käsittelee vajaan tunnin keston", () => {
    expect(laskeKulutusKwh(2, 0.5)).toBe(1);
  });
});

describe("laskeHintaEuroina", () => {
  it("muuntaa sentit euroiksi", () => {
    expect(laskeHintaEuroina(2, 12.5)).toBeCloseTo(0.25, 5);
  });

  it("palauttaa negatiivisen hinnan, jos sähkön hinta on negatiivinen", () => {
    expect(laskeHintaEuroina(2, -5)).toBeCloseTo(-0.1, 5);
  });
});

describe("muotoilu", () => {
  it("näyttää sentit desimaalipilkulla", () => {
    expect(muotoileSnt(12.5)).toBe("12,50 snt/kWh");
  });

  it("näyttää eurot desimaalipilkulla", () => {
    expect(muotoileEuroa(0.25)).toBe("0,25 €");
  });
});
