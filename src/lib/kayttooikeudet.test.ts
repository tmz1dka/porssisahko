// Pääsysääntöjen testit. Nämä ovat tärkeimmät testit koko käyttäjänhallinnassa:
// jos sääntö menee väärin, väärä käyttäjä pääsee väärälle sivulle.
import { describe, expect, it } from "vitest";
import {
  tarkistaPaasy,
  voikoPoistaaOmanTilin,
  turvallinenPaluuosoite,
  vaatiiAdminin,
  vaatiiKirjautumisen,
} from "./kayttooikeudet";

describe("vaatiiKirjautumisen", () => {
  it("päästää julkiset sivut läpi", () => {
    expect(vaatiiKirjautumisen("/")).toBe(false);
    expect(vaatiiKirjautumisen("/prices")).toBe(false);
    expect(vaatiiKirjautumisen("/login")).toBe(false);
  });

  it("tunnistaa suojatut sivut ja niiden alasivut", () => {
    expect(vaatiiKirjautumisen("/dashboard")).toBe(true);
    expect(vaatiiKirjautumisen("/devices")).toBe(true);
    expect(vaatiiKirjautumisen("/devices/uusi-laite")).toBe(true);
    expect(vaatiiKirjautumisen("/settings")).toBe(true);
  });

  it("ei sekoita samalla tekstillä alkavaa julkista polkua suojattuun", () => {
    expect(vaatiiKirjautumisen("/dashboardkoe")).toBe(false);
    expect(vaatiiKirjautumisen("/settings-ohje")).toBe(false);
  });
});

describe("vaatiiAdminin", () => {
  it("koskee vain ylläpitosivua", () => {
    expect(vaatiiAdminin("/admin")).toBe(true);
    expect(vaatiiAdminin("/admin/kayttajat")).toBe(true);
    expect(vaatiiAdminin("/dashboard")).toBe(false);
  });
});

describe("tarkistaPaasy", () => {
  it("päästää kirjautumattoman julkiselle sivulle", () => {
    expect(tarkistaPaasy("/prices", null)).toEqual({ sallittu: true });
  });

  it("ohjaa kirjautumattoman kirjautumissivulle", () => {
    expect(tarkistaPaasy("/dashboard", null)).toEqual({
      sallittu: false,
      syy: "kirjautumaton",
      ohjaa: "/login",
    });
  });

  it("päästää tavallisen käyttäjän omille sivuilleen", () => {
    expect(tarkistaPaasy("/dashboard", "USER")).toEqual({ sallittu: true });
    expect(tarkistaPaasy("/settings", "USER")).toEqual({ sallittu: true });
  });

  it("estää tavallisen käyttäjän ylläpitosivulta", () => {
    expect(tarkistaPaasy("/admin", "USER")).toEqual({
      sallittu: false,
      syy: "vaara-rooli",
      ohjaa: "/dashboard",
    });
  });

  it("päästää ylläpitäjän ylläpitosivulle", () => {
    expect(tarkistaPaasy("/admin", "ADMIN")).toEqual({ sallittu: true });
  });

  it("ohjaa kirjautumattoman kirjautumiseen myös ylläpitosivulta", () => {
    // Kirjautumattomalle ei kerrota, että sivu vaatii erityisen roolin.
    expect(tarkistaPaasy("/admin", null)).toEqual({
      sallittu: false,
      syy: "kirjautumaton",
      ohjaa: "/login",
    });
  });
});

describe("turvallinenPaluuosoite", () => {
  it("hyväksyy oman sivuston polun", () => {
    expect(turvallinenPaluuosoite("/devices/uusi")).toBe("/devices/uusi");
  });

  it("hylkää tyhjän arvon", () => {
    expect(turvallinenPaluuosoite(null)).toBeNull();
    expect(turvallinenPaluuosoite("")).toBeNull();
  });

  it("hylkää ulkopuolisen osoitteen", () => {
    expect(turvallinenPaluuosoite("https://huijaus.example")).toBeNull();
    expect(turvallinenPaluuosoite("//huijaus.example")).toBeNull();
    expect(turvallinenPaluuosoite("/\\huijaus.example")).toBeNull();
  });
});

describe("voikoPoistaaOmanTilin", () => {
  it("antaa tavallisen käyttäjän poistaa tilinsä", () => {
    expect(voikoPoistaaOmanTilin("USER", 1)).toBe(true);
  });

  it("estää viimeisen ylläpitäjän poistamisen", () => {
    expect(voikoPoistaaOmanTilin("ADMIN", 1)).toBe(false);
  });

  it("antaa ylläpitäjän poistaa tilinsä, kun ylläpitäjiä on useampi", () => {
    expect(voikoPoistaaOmanTilin("ADMIN", 2)).toBe(true);
  });
});
