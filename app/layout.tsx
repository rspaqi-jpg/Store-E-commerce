import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider, LanguageSwitcher } from "./Locale";

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
      <body><LanguageProvider><div style={{display:"flex",justifyContent:"flex-end",padding:"8px max(18px,calc((100% - 1180px)/2))",background:"#fff",borderBottom:"1px solid #dce5e3"}}><LanguageSwitcher/></div>{children}</LanguageProvider></body>
    </html>
  );
}
