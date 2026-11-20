// Laitteiden lisäys, muokkaus ja poisto. Nämä ovat server actioneita eli
// funktioita, jotka ajetaan aina palvelimella, vaikka ne käynnistyvät
// lomakkeen lähetyksestä selaimessa.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { vaadiIstunto } from "@/lib/istunto";
import {
  luoLaite as luoKantaan,
  paivitaLaite as paivitaKannassa,
  poistaLaite as poistaKannasta,
} from "@/lib/laitteet";
import { kentanVirheet, laiteSkeema } from "@/lib/validointi";

export type LaiteTila = {
  virheet?: Record<string, string>;
  yleinenVirhe?: string;
};

/** Lukee ja tarkistaa lomakkeen kentät. */
function lueLomake(lomake: FormData) {
  return laiteSkeema.safeParse({
    name: lomake.get("name"),
    powerKw: lomake.get("powerKw"),
    durationHours: lomake.get("durationHours"),
  });
}

export async function lisaaLaite(
  _edellinenTila: LaiteTila,
  lomake: FormData,
): Promise<LaiteTila> {
  // Kirjautuminen tarkistetaan tässä eikä vain sivulla: server actionia voi
  // kutsua suoraan avaamatta sivua.
  const istunto = await vaadiIstunto();

  const tulos = lueLomake(lomake);

  if (!tulos.success) {
    return { virheet: kentanVirheet(tulos.error) };
  }

  await luoKantaan(istunto.user.id, tulos.data);

  // Laitelistan tallennettu kopio on nyt vanhentunut, joten se merkitään
  // päivitettäväksi. Muuten uusi laite ei näkyisi listalla heti.
  revalidatePath("/devices");

  // redirect toteutetaan poikkeuksella, joten se on vasta lopussa eikä
  // try-lohkon sisällä.
  redirect("/devices");
}

export async function muokkaaLaite(
  id: string,
  _edellinenTila: LaiteTila,
  lomake: FormData,
): Promise<LaiteTila> {
  const istunto = await vaadiIstunto();

  const tulos = lueLomake(lomake);

  if (!tulos.success) {
    return { virheet: kentanVirheet(tulos.error) };
  }

  const onnistui = await paivitaKannassa(id, istunto.user.id, tulos.data);

  if (!onnistui) {
    // Laitetta ei ole tai se kuuluu toiselle käyttäjälle. Viesti on sama
    // molemmissa tapauksissa: muuten voisi päätellä, onko jokin tunniste
    // olemassa toisen käyttäjän laitteena.
    return { yleinenVirhe: "Laitetta ei löytynyt." };
  }

  revalidatePath("/devices");
  redirect("/devices");
}

export async function poistaLaiteToiminto(lomake: FormData): Promise<void> {
  const istunto = await vaadiIstunto();

  const id = String(lomake.get("id") ?? "");

  if (id !== "") {
    await poistaKannasta(id, istunto.user.id);
  }

  revalidatePath("/devices");
  redirect("/devices");
}
