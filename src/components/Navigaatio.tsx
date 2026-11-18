// Sivuston yläpalkki. Tämä on palvelinkomponentti, joten se voi lukea
// istunnon suoraan: kirjautuneelle näytetään eri linkit kuin vierailijalle.
import Link from "next/link";
import { auth } from "@/lib/auth";
import { kirjauduUlos } from "@/app/login/actions";

export async function Navigaatio() {
  const istunto = await auth();
  const kirjautunut = Boolean(istunto?.user);

  // Ylläpitolinkki näytetään vain ylläpitäjälle. Tämä on käytettävyyttä,
  // ei turvaa: varsinainen esto tehdään reittisuojauksessa ja sivulla itsellään.
  const onYllapitaja = istunto?.user.role === "ADMIN";

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="font-semibold">
          Pörssisähköoptimoija
        </Link>

        <Link href="/prices" className="text-sm hover:underline">
          Hinnat
        </Link>

        {kirjautunut ? (
          <>
            <Link href="/dashboard" className="text-sm hover:underline">
              Koontinäkymä
            </Link>

            <Link href="/settings" className="text-sm hover:underline">
              Asetukset
            </Link>

            {onYllapitaja && (
              <Link href="/admin" className="text-sm hover:underline">
                Ylläpito
              </Link>
            )}

            {/* Uloskirjautuminen on lomake eikä linkki, koska se muuttaa
                tilaa. Linkkiä voisi myös kutsua vahingossa esimerkiksi
                selaimen esilataus, lomaketta ei. */}
            <form action={kirjauduUlos} className="ml-auto flex items-center gap-3">
              <span className="text-sm opacity-70">{istunto?.user.email}</span>
              <button type="submit" className="text-sm underline">
                Kirjaudu ulos
              </button>
            </form>
          </>
        ) : (
          <div className="ml-auto flex items-center gap-4">
            <Link href="/login" className="text-sm hover:underline">
              Kirjaudu
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Luo tunnus
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
