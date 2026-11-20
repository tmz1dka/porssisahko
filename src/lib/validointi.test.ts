// Yksikkötestit syötteiden tarkistussäännöille. Nämä ovat tärkeitä, koska
// sama sääntö suojaa sekä lomaketta että palvelinta: jos sääntö pettää,
// tietokantaan voi päätyä kelvotonta tietoa.
import { describe, expect, it } from "vitest";
import {
  kentanVirheet,
  kirjautumisSkeema,
  laiteSkeema,
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

describe("laiteSkeema", () => {
  const kelvollinen = {
    name: "Pyykinpesukone",
    powerKw: "2",
    durationHours: "2",
  };

  it("hyväksyy kelvollisen laitteen", () => {
    const tulos = laiteSkeema.safeParse(kelvollinen);

    expect(tulos.success).toBe(true);
    expect(tulos.success && tulos.data.powerKw).toBe(2);
  });

  it("hyväksyy desimaalin pilkulla", () => {
    // Suomalainen käyttäjä kirjoittaa "1,5", ei "1.5".
    const tulos = laiteSkeema.safeParse({
      ...kelvollinen,
      powerKw: "1,5",
      durationHours: "0,75",
    });

    expect(tulos.success && tulos.data.powerKw).toBe(1.5);
    expect(tulos.success && tulos.data.durationHours).toBe(0.75);
  });

  it("poistaa nimen ympäriltä turhat välilyönnit", () => {
    const tulos = laiteSkeema.safeParse({ ...kelvollinen, name: "  Uuni  " });
    expect(tulos.success && tulos.data.name).toBe("Uuni");
  });

  it("vaatii nimen", () => {
    const tulos = laiteSkeema.safeParse({ ...kelvollinen, name: "   " });
    expect(tulos.success).toBe(false);
  });

  it("hylkää nollatehon ja negatiivisen tehon", () => {
    expect(laiteSkeema.safeParse({ ...kelvollinen, powerKw: "0" }).success).toBe(
      false,
    );
    expect(
      laiteSkeema.safeParse({ ...kelvollinen, powerKw: "-2" }).success,
    ).toBe(false);
  });

  it("hylkää tehon, joka on ilmeisesti watteina", () => {
    // 2000 tarkoittaa käyttäjän mielessä watteja, ei kilowatteja.
    const tulos = laiteSkeema.safeParse({ ...kelvollinen, powerKw: "2000" });
    expect(tulos.success).toBe(false);
  });

  it("hylkää tyhjän kentän", () => {
    const tulos = laiteSkeema.safeParse({ ...kelvollinen, durationHours: "" });
    expect(tulos.success).toBe(false);
  });

  it("hylkää tekstin numerokentässä", () => {
    const tulos = laiteSkeema.safeParse({ ...kelvollinen, powerKw: "paljon" });
    expect(tulos.success).toBe(false);
  });

  it("hylkää yli vuorokauden keston", () => {
    const tulos = laiteSkeema.safeParse({
      ...kelvollinen,
      durationHours: "25",
    });
    expect(tulos.success).toBe(false);
  });
});
