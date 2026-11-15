// Sovelluksen uloin kehys: tämä tiedosto ympäröi kaikki sivut
// (kieliasetus, yhteiset tyylit ja selaimen välilehden otsikko).
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pörssisähköoptimoija",
  description:
    "Etsi kotitalouden laitteille halvin sähkönkäyttöaika pörssisähkön hintojen perusteella.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fi">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
