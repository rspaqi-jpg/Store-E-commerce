import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./Locale";

export const metadata: Metadata = {
  title: "Minimal Store — Zeitlos. Einfach. Gut.",
  description:
    "Entdecke ausgewählte Produkte für Alltag und Zuhause. Minimalistisches Design, klare Preise und einfacher Einkauf.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
