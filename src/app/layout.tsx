import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Selección Wiki",
  description:
    "La enciclopedia libre de la Selección de Puerto Rico: resultados, historia, jugadores y más.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="antialiased">
      <body>
        <header className="border-b border-wiki-border">
          <div className="wiki-container py-3">
            <Link href="/" className="font-serif text-xl text-wiki-text hover:no-underline">
              La Selección Wiki
            </Link>
          </div>
        </header>
        <main className="wiki-container py-6">{children}</main>
        <footer className="wiki-container border-t border-wiki-border py-4 text-xs text-wiki-muted">
          El texto derivado de Wikipedia está disponible bajo la licencia Creative Commons
          Atribución-CompartirIgual 4.0.
        </footer>
      </body>
    </html>
  );
}
