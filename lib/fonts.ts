import {
  Anton,
  Archivo,
  Barlow,
  Barlow_Condensed,
  Bebas_Neue,
  DM_Sans,
  Inter,
  Manrope,
  Oswald,
  Work_Sans,
} from "next/font/google";

// Every selectable font is declared here at build time; only the defaults are preloaded,
// the others are downloaded by the browser only when the theme actually uses them.
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400", display: "swap", preload: false });
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400", display: "swap", preload: false });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], display: "swap", preload: false });
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
  preload: false,
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap", preload: false });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap", preload: false });
const workSans = Work_Sans({ variable: "--font-work-sans", subsets: ["latin"], display: "swap", preload: false });
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const fontVariables = [
  archivo,
  anton,
  bebas,
  oswald,
  barlowCondensed,
  inter,
  manrope,
  dmSans,
  workSans,
  barlow,
]
  .map((f) => f.variable)
  .join(" ");
