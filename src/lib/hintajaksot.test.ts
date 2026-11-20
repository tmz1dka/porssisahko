// Hintajaksojen käsittelyn testit. Testataan erityisesti reunatapaukset,
// jotka suunnitelmassa tunnistettiin: huomisen hinnat puuttuvat, hinta on
// negatiivinen ja hintadata on tyhjä.
import { describe, expect, it } from "vitest";
import {
  jarjestaAikajarjestykseen,
  kestoMinuutteina,
  onkoHuomiselleHintoja,
  onkoPaivaKattava,
  paivanJaksot,
  suomenKellonaika,
  suomenPaiva,
  tilastot,
  type Hintajakso,
} from "./hintajaksot";

/** Apufunktio testien lukemisen helpottamiseksi. */
function jakso(alku: string, loppu: string, sntPerKwh: number): Hintajakso {
  return { alku: new Date(alku), loppu: new Date(loppu), sntPerKwh };
}

describe("suomenPaiva", () => {
  it("antaa päivän Suomen aikaa, ei UTC-aikaa", () => {
    // UTC-aikaa tämä on vielä 19.11. klo 23, mutta Suomessa jo 20.11. klo 1.
    expect(suomenPaiva(new Date("2026-11-19T23:00:00.000Z"))).toBe("2026-11-20");
  });

  it("antaa saman päivän keskellä päivää", () => {
    expect(suomenPaiva(new Date("2026-11-20T10:00:00.000Z"))).toBe("2026-11-20");
  });
});

describe("suomenKellonaika", () => {
  it("antaa kellonajan Suomen aikaa", () => {
    expect(suomenKellonaika(new Date("2026-11-20T12:15:00.000Z"))).toBe("14.15");
  });
});

describe("kestoMinuutteina", () => {
  it("tunnistaa tunnin jakson", () => {
    const t = jakso("2026-11-20T10:00:00.000Z", "2026-11-20T11:00:00.000Z", 5);
    expect(kestoMinuutteina(t)).toBe(60);
  });

  it("tunnistaa 15 minuutin jakson", () => {
    // Rajapinta päättää jakson millisekunnin ennen seuraavaa, joten
    // pyöristys on tarpeen.
    const t = jakso("2026-11-20T10:00:00.000Z", "2026-11-20T10:14:59.999Z", 5);
    expect(kestoMinuutteina(t)).toBe(15);
  });
});

describe("jarjestaAikajarjestykseen", () => {
  it("järjestää uusin-ensin-listan vanhimmasta uusimpaan", () => {
    const uusinEnsin = [
      jakso("2026-11-20T12:00:00.000Z", "2026-11-20T13:00:00.000Z", 7),
      jakso("2026-11-20T10:00:00.000Z", "2026-11-20T11:00:00.000Z", 5),
      jakso("2026-11-20T11:00:00.000Z", "2026-11-20T12:00:00.000Z", 6),
    ];

    const tulos = jarjestaAikajarjestykseen(uusinEnsin);

    expect(tulos.map((j) => j.sntPerKwh)).toEqual([5, 6, 7]);
  });

  it("ei muuta alkuperäistä listaa", () => {
    const alkuperainen = [
      jakso("2026-11-20T12:00:00.000Z", "2026-11-20T13:00:00.000Z", 7),
      jakso("2026-11-20T10:00:00.000Z", "2026-11-20T11:00:00.000Z", 5),
    ];

    jarjestaAikajarjestykseen(alkuperainen);

    expect(alkuperainen[0].sntPerKwh).toBe(7);
  });
});

describe("paivanJaksot", () => {
  const jaksot = [
    // Suomen aikaa 19.11. klo 23
    jakso("2026-11-19T21:00:00.000Z", "2026-11-19T22:00:00.000Z", 5),
    // Suomen aikaa 20.11. klo 1
    jakso("2026-11-19T23:00:00.000Z", "2026-11-20T00:00:00.000Z", 6),
    // Suomen aikaa 20.11. klo 12
    jakso("2026-11-20T10:00:00.000Z", "2026-11-20T11:00:00.000Z", 7),
  ];

  it("rajaa jaksot Suomen vuorokauden mukaan", () => {
    const tulos = paivanJaksot(jaksot, new Date("2026-11-20T10:00:00.000Z"));
    expect(tulos.map((j) => j.sntPerKwh)).toEqual([6, 7]);
  });

  it("palauttaa tyhjän listan päivälle, jolle ei ole hintoja", () => {
    const tulos = paivanJaksot(jaksot, new Date("2026-12-24T10:00:00.000Z"));
    expect(tulos).toEqual([]);
  });
});

describe("onkoHuomiselleHintoja", () => {
  const nyt = new Date("2026-11-20T08:00:00.000Z");

  it("on epätosi, kun hintoja on vain tälle päivälle", () => {
    const jaksot = [
      jakso("2026-11-20T10:00:00.000Z", "2026-11-20T11:00:00.000Z", 7),
    ];
    expect(onkoHuomiselleHintoja(jaksot, nyt)).toBe(false);
  });

  it("on epätosi, kun huomiselle on vain yksi jakso", () => {
    // Rajapinnan 48 tunnin ikkuna ulottuu keskiyön yli, vaikka huomisen
    // hintoja ei ole vielä julkaistu.
    const jaksot = [
      jakso("2026-11-20T10:00:00.000Z", "2026-11-20T11:00:00.000Z", 7),
      jakso("2026-11-21T10:00:00.000Z", "2026-11-21T11:00:00.000Z", 4),
    ];
    expect(onkoHuomiselleHintoja(jaksot, nyt)).toBe(false);
  });

  it("on tosi, kun huomiselle on julkaistu koko vuorokausi", () => {
    const jaksot = Array.from({ length: 24 }, (_, i) =>
      jakso(
        new Date(Date.UTC(2026, 10, 21, i)).toISOString(),
        new Date(Date.UTC(2026, 10, 21, i + 1)).toISOString(),
        4,
      ),
    );
    expect(onkoHuomiselleHintoja(jaksot, nyt)).toBe(true);
  });

  it("on epätosi tyhjälle hintadatalle", () => {
    expect(onkoHuomiselleHintoja([], nyt)).toBe(false);
  });
});

describe("tilastot", () => {
  it("laskee halvimman, kalleimman ja keskiarvon", () => {
    const jaksot = [
      jakso("2026-11-20T10:00:00.000Z", "2026-11-20T11:00:00.000Z", 10),
      jakso("2026-11-20T11:00:00.000Z", "2026-11-20T12:00:00.000Z", 2),
      jakso("2026-11-20T12:00:00.000Z", "2026-11-20T13:00:00.000Z", 6),
    ];

    const tulos = tilastot(jaksot);

    expect(tulos?.halvin.sntPerKwh).toBe(2);
    expect(tulos?.kallein.sntPerKwh).toBe(10);
    expect(tulos?.keskiarvoSntPerKwh).toBe(6);
  });

  it("käsittelee negatiivisen hinnan halvimpana", () => {
    // Pörssisähkön hinta voi olla miinuksella, kun tuotantoa on enemmän
    // kuin kulutusta. Negatiivinen hinta on oikea arvo, ei virhe.
    const jaksot = [
      jakso("2026-11-20T10:00:00.000Z", "2026-11-20T11:00:00.000Z", 3),
      jakso("2026-11-20T11:00:00.000Z", "2026-11-20T12:00:00.000Z", -1.5),
    ];

    const tulos = tilastot(jaksot);

    expect(tulos?.halvin.sntPerKwh).toBe(-1.5);
    expect(tulos?.keskiarvoSntPerKwh).toBe(0.75);
  });

  it("palauttaa null tyhjälle listalle", () => {
    expect(tilastot([])).toBeNull();
  });
});

describe("onkoPaivaKattava", () => {
  /** Luo annetun määrän peräkkäisiä tunnin jaksoja. */
  function tunnit(maara: number): Hintajakso[] {
    return Array.from({ length: maara }, (_, i) => {
      const alku = new Date(Date.UTC(2026, 10, 20, i));
      const loppu = new Date(Date.UTC(2026, 10, 20, i + 1));
      return { alku, loppu, sntPerKwh: 5 };
    });
  }

  it("on tosi täydelle vuorokaudelle", () => {
    expect(onkoPaivaKattava(tunnit(24))).toBe(true);
  });

  it("on tosi kellonsiirtopäivän 23 tunnille", () => {
    expect(onkoPaivaKattava(tunnit(23))).toBe(true);
  });

  it("on epätosi muutamalle jaksolle vuorokauden alusta", () => {
    // Tämä on se tilanne, jossa rajapinnan 48 tunnin ikkuna ulottuu
    // keskiyön yli, vaikka huomisen hintoja ei ole vielä julkaistu.
    expect(onkoPaivaKattava(tunnit(1))).toBe(false);
  });

  it("on epätosi tyhjälle päivälle", () => {
    expect(onkoPaivaKattava([])).toBe(false);
  });
});
