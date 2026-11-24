import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubliTunis | Sublimation et confection textile à Sousse",
  description: "Partenaire textile à Sousse depuis 2018. Sublimation, coupe et confection pour les marques et les donneurs d’ordre.",
  icons: { icon: "/images/logo.webp" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body id="accueil">{children}</body></html>;
}
