import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://trueculture.nl";
const description =
  "True Culture Marketing is een B2B sales agency. Wij verzorgen leadgeneratie en plannen kwalitatieve afspraken met beslissers in, zodat jouw salesteam zich op de deal kan richten.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "True Culture Marketing | B2B leadgeneratie en afspraken inplannen",
    template: "%s | True Culture Marketing",
  },
  description,
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "True Culture Marketing",
    url: siteUrl,
    title: "True Culture Marketing | B2B leadgeneratie en afspraken inplannen",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "True Culture Marketing",
    description,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${archivo.variable} ${inter.variable}`}>
      <body className="bg-ink font-sans text-paper antialiased">
        <a
          href="#inhoud"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-24 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-ink"
        >
          Naar inhoud
        </a>
        <Nav logo={<Logo />} />
        <main id="inhoud">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
