// Sähkön hinnan muunnokset ja muotoilu. Rajapinta antaa hinnat sentteinä
// kilowattituntia kohti (snt/kWh), mutta käyttäjälle näytetään myös euromääriä.

/** Yhden sentin arvo euroina. Vakio nimettynä, jotta laskuista näkee mitä tapahtuu. */
const SENTTIA_EUROSSA = 100;

/**
 * Laskee, paljonko sähkö maksaa euroina, kun tiedetään kulutus ja yksikköhinta.
 * Esimerkki: 2 kWh hintaan 12,5 snt/kWh = 0,25 euroa.
 */
export function laskeHintaEuroina(kwh: number, sntPerKwh: number): number {
  return (kwh * sntPerKwh) / SENTTIA_EUROSSA;
}

/**
 * Laskee laitteen kuluttaman sähkömäärän kilowattitunteina.
 * Teho annetaan kilowatteina ja kesto tunteina, kuten käyttäjä ne syöttää.
 */
export function laskeKulutusKwh(tehoKw: number, kestoTuntia: number): number {
  return tehoKw * kestoTuntia;
}

/**
 * Muotoilee sentit näytettävään muotoon kahdella desimaalilla ja
 * suomalaisella desimaalipilkulla, esimerkiksi "12,50 snt/kWh".
 * Muotoilu tehdään itse eikä kieliasetusten varassa, jotta tulos on aina sama.
 */
export function muotoileSnt(sntPerKwh: number): string {
  return `${sntPerKwh.toFixed(2).replace(".", ",")} snt/kWh`;
}

/**
 * Muotoilee euromäärän muotoon "0,25 €".
 */
export function muotoileEuroa(euroa: number): string {
  return `${euroa.toFixed(2).replace(".", ",")} €`;
}
