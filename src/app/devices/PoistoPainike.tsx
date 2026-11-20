// Laitteen poistopainike vahvistuksineen. Selainkomponentti, koska
// vahvistus kysytään selaimessa ennen lomakkeen lähettämistä.
"use client";

type Props = {
  laitteenNimi: string;
};

export function PoistoPainike({ laitteenNimi }: Props) {
  return (
    <button
      type="submit"
      // Vahvistus siksi, ettei yksi vahinkoklikkaus poista laitetta.
      // Poistoa ei voi peruuttaa, mutta laitteen voi lisätä uudelleen,
      // joten kevyt vahvistus riittää – toisin kuin tilin poistossa.
      onClick={(tapahtuma) => {
        const varmaa = window.confirm(
          `Poistetaanko laite "${laitteenNimi}"? Poistoa ei voi peruuttaa.`,
        );

        if (!varmaa) {
          tapahtuma.preventDefault();
        }
      }}
      className="text-red-700 underline dark:text-red-400"
    >
      Poista
    </button>
  );
}
