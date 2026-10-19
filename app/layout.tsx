import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://trueculture.nl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "True Culture Marketing — B2B Sales Agency",
    template: "%s — True Culture Marketing",
  },
  description:
    "True Culture Marketing is een B2B sales agency die leadgeneratie, afspraken maken en sales op interim basis verzorgt voor bedrijven die willen groeien.",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "True Culture Marketing",
    title: "True Culture Marketing — B2B Sales Agency",
    description:
      "True Culture Marketing is een B2B sales agency die leadgeneratie, afspraken maken en sales op interim basis verzorgt voor bedrijven die willen groeien.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "True Culture Marketing — B2B Sales Agency",
    description:
      "True Culture Marketing is een B2B sales agency die leadgeneratie, afspraken maken en sales op interim basis verzorgt voor bedrijven die willen groeien.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${archivoBlack.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col bg-ink text-paper antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
