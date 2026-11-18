// Yksikkötestit syötteiden tarkistussäännöille. Nämä ovat tärkeitä, koska
// sama sääntö suojaa sekä lomaketta että palvelinta: jos sääntö pettää,
// tietokantaan voi päätyä kelvotonta tietoa.
import { describe, expect, it } from "vitest";
import {
  kentanVirheet,
  kirjautumisSkeema,
  rekisterointiSkeema,
} from "@/lib/validointi";

const kelvollinen = {
  email: "maija@example.com",
  password: "salasana123",
  passwordConfirm: "salasana123",
};

describe("rekisterointiSkeema", () => {
  it("hyväksyy kelvolliset tiedot", () => {
    const tulos = rekisterointiSkeema.safeParse(kelvollinen);
    expect(tulos.success).toBe(true);
  });

  it("muuttaa sähköpostin pieniksi kirjaimiksi", () => {
    const tulos = rekisterointiSkeema.safeParse({
      ...kelvollinen,
      email: "Maija@Example.COM",
    });
    expect(tulos.success && tulos.data.email).toBe("maija@example.com");
  });

  it("poistaa sähköpostin ympäriltä välilyönnit", () => {
    const tulos = rekisterointiSkeema.safeParse({
      ...kelvollinen,
      email: "  maija@example.com  ",
    });
    expect(tulos.success && tulos.data.email).toBe("maija@example.com");
  });

  it("hylkää virheellisen sähköpostin", () => {
    const tulos = rekisterointiSkeema.safeParse({
      ...kelvollinen,
      email: "eiOleSahkoposti",
    });
    expect(tulos.success).toBe(false);
  });

  it("hylkää liian lyhyen salasanan", () => {
    const tulos = rekisterointiSkeema.safeParse({
      ...kelvollinen,
      password: "lyhyt",
      passwordConfirm: "lyhyt",
    });
    expect(tulos.success).toBe(false);
  });

  it("hylkää yli 72 merkin salasanan, koska bcrypt ei huomioi loppua", () => {
    const pitka = "a".repeat(73);
    const tulos = rekisterointiSkeema.safeParse({
      ...kelvollinen,
      password: pitka,
      passwordConfirm: pitka,
    });
    expect(tulos.success).toBe(false);
  });

  it("hylkää tiedot, joissa salasanat eivät täsmää, ja kertoo sen oikeassa kentässä", () => {
    const tulos = rekisterointiSkeema.safeParse({
      ...kelvollinen,
      passwordConfirm: "erisalasana123",
    });
    expect(tulos.success).toBe(false);
    if (!tulos.success) {
      expect(kentanVirheet(tulos.error).passwordConfirm).toBe(
        "Salasanat eivät täsmää.",
      );
    }
  });
});

describe("kirjautumisSkeema", () => {
  it("hyväksyy sähköpostin ja salasanan", () => {
    const tulos = kirjautumisSkeema.safeParse({
      email: "maija@example.com",
      password: "mikaTahansa",
    });
    expect(tulos.success).toBe(true);
  });

  it("ei vaadi salasanan vähimmäispituutta, koska vanhat tunnukset voivat olla lyhyempiä", () => {
    const tulos = kirjautumisSkeema.safeParse({
      email: "maija@example.com",
      password: "x",
    });
    expect(tulos.success).toBe(true);
  });

  it("hylkää tyhjän salasanan", () => {
    const tulos = kirjautumisSkeema.safeParse({
      email: "maija@example.com",
      password: "",
    });
    expect(tulos.success).toBe(false);
  });
});

describe("kentanVirheet", () => {
  it("palauttaa jokaisesta kentästä vain ensimmäisen virheen", () => {
    const tulos = rekisterointiSkeema.safeParse({
      email: "eiOleSahkoposti",
      password: "ab",
      passwordConfirm: "ab",
    });
    expect(tulos.success).toBe(false);
    if (!tulos.success) {
      const virheet = kentanVirheet(tulos.error);
      expect(Object.keys(virheet).sort()).toEqual(["email", "password"]);
      expect(typeof virheet.email).toBe("string");
    }
  });
});
