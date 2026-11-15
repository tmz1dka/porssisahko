// Etusivu (/). Julkinen sivu, joka kertoo lyhyesti mihin sovellus on tarkoitettu.
// Sisältö täydentyy myöhemmissä vaiheissa, kun hintadata ja laitteet ovat valmiina.
export default function EtusivuPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Pörssisähköoptimoija
      </h1>
      <p className="mt-4 text-lg opacity-80">
        Tallenna kotitaloutesi laitteet ja näe, mihin kellonaikaan niiden
        käyttäminen on halvinta.
      </p>
      <p className="mt-8 text-sm opacity-60">
        Projekti on kehitysvaiheessa. Tämä on vaiheen 2 projektipohja.
      </p>
    </main>
  );
}
