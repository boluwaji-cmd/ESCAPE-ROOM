import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escape Room Perugia",
  description: "Trasforma Perugia in un escape room a cielo aperto. Naviga con GPS, risolvi enigmi e competi con la tua squadra.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-theme="light">
      <body className="antialiased">{children}</body>
    </html>
  );
}
