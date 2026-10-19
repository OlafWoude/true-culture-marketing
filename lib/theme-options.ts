// Shared between the admin UI and the server: the curated, safe choices for the theme editor.

export const displayFonts = {
  "archivo-condensed": { label: "Archivo Condensed (standaard)", cssVar: "--font-archivo", width: 62, weights: [700, 800, 900] },
  "archivo-wide": { label: "Archivo Extended", cssVar: "--font-archivo", width: 125, weights: [700, 800, 900] },
  anton: { label: "Anton", cssVar: "--font-anton", width: 100, weights: [400] },
  "bebas-neue": { label: "Bebas Neue", cssVar: "--font-bebas", width: 100, weights: [400] },
  oswald: { label: "Oswald", cssVar: "--font-oswald", width: 100, weights: [500, 600, 700] },
  "barlow-condensed": { label: "Barlow Condensed", cssVar: "--font-barlow-condensed", width: 100, weights: [600, 700, 800, 900] },
} as const;

export const bodyFonts = {
  inter: { label: "Inter (standaard)", cssVar: "--font-inter" },
  manrope: { label: "Manrope", cssVar: "--font-manrope" },
  "dm-sans": { label: "DM Sans", cssVar: "--font-dm-sans" },
  "work-sans": { label: "Work Sans", cssVar: "--font-work-sans" },
  barlow: { label: "Barlow", cssVar: "--font-barlow" },
} as const;

export type DisplayFontKey = keyof typeof displayFonts;
export type BodyFontKey = keyof typeof bodyFonts;

export const buttonShapes = {
  pill: { label: "Pil (volledig rond)", radius: "9999px" },
  rounded: { label: "Afgerond", radius: "0.75rem" },
  square: { label: "Recht", radius: "0.125rem" },
} as const;

export const cornerStyles = {
  large: { label: "Groot (standaard)", scale: 1 },
  medium: { label: "Gemiddeld", scale: 0.6 },
  small: { label: "Klein", scale: 0.3 },
  none: { label: "Geen", scale: 0 },
} as const;

export const containerWidths = {
  narrow: { label: "Smal (1024 px)", value: "64rem" },
  normal: { label: "Normaal (1152 px, standaard)", value: "72rem" },
  wide: { label: "Breed (1280 px)", value: "80rem" },
} as const;

export const sectionSpacings = {
  compact: { label: "Compact", mobile: "4.5rem", desktop: "6rem" },
  normal: { label: "Normaal (standaard)", mobile: "7rem", desktop: "9rem" },
  spacious: { label: "Ruim", mobile: "8rem", desktop: "11rem" },
} as const;

export const shadowStyles = {
  soft: { label: "Zacht (standaard)" },
  none: { label: "Geen schaduw" },
} as const;

export const navStyles = {
  floating: { label: "Zwevende balk (standaard)" },
  bar: { label: "Volle breedte" },
} as const;

export const formStyles = {
  filled: { label: "Gevuld (standaard)" },
  outlined: { label: "Omlijnd" },
} as const;
