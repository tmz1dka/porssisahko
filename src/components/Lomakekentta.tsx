// Yksi lomakekenttä otsikon, ohjetekstin ja virheilmoituksen kanssa.
// Omana komponenttina, jotta kirjautumis- ja rekisteröitymissivu näyttävät
// samanlaisilta eikä samaa koodia tarvitse toistaa.

type Props = {
  nimi: string;
  otsikko: string;
  tyyppi: "email" | "password" | "text";
  ohje?: string;
  virhe?: string;
  oletusarvo?: string;
  automaattinenTaytto?: string;
  /**
   * Mikä näppäimistö puhelimessa avataan. "decimal" antaa numerot ja
   * desimaalierottimen. Desimaaliluvut otetaan vastaan tekstikenttänä,
   * koska numerokenttä ei hyväksy pilkkua kaikilla selaimilla – ja
   * suomalainen käyttäjä kirjoittaa "1,5" eikä "1.5".
   */
  syotetila?: "decimal";
};

export function Lomakekentta({
  nimi,
  otsikko,
  tyyppi,
  ohje,
  virhe,
  oletusarvo,
  automaattinenTaytto,
  syotetila,
}: Props) {
  // Virheilmoitus liitetään kenttään aria-describedby-määreellä, jotta myös
  // ruudunlukija kertoo virheen oikean kentän kohdalla.
  const virheenTunnus = `${nimi}-virhe`;
  const ohjeenTunnus = `${nimi}-ohje`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={nimi} className="text-sm font-medium">
        {otsikko}
      </label>

      <input
        id={nimi}
        name={nimi}
        type={tyyppi}
        required
        defaultValue={oletusarvo}
        autoComplete={automaattinenTaytto}
        inputMode={syotetila}
        aria-invalid={virhe ? true : undefined}
        aria-describedby={
          [virhe ? virheenTunnus : null, ohje ? ohjeenTunnus : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={`rounded-md border px-3 py-2 text-base outline-none focus:ring-2 ${
          virhe
            ? "border-red-500 focus:ring-red-400"
            : "border-gray-300 focus:ring-blue-400 dark:border-gray-600"
        }`}
      />

      {ohje && !virhe && (
        <p id={ohjeenTunnus} className="text-xs opacity-70">
          {ohje}
        </p>
      )}

      {virhe && (
        <p id={virheenTunnus} className="text-xs text-red-600 dark:text-red-400">
          {virhe}
        </p>
      )}
    </div>
  );
}
