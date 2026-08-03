import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import { AppProviders } from "@/components/providers/AppProviders";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MonPsy — Consultez un psychologue en ligne, en toute confiance",
  description: "Réservez facilement une consultation en ligne avec un psychologue certifié, depuis chez vous. Prenez soin de votre santé mentale.",
  metadataBase: new URL("http://localhost:3002"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${outfit.variable} font-outfit antialiased bg-background text-foreground custom-scrollbar overflow-x-hidden`}
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
