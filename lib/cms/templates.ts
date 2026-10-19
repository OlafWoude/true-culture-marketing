import type { BlockType } from "./blocks";

export const pageTemplates: { key: string; label: string; description: string; sections: BlockType[] }[] = [
  {
    key: "standaard",
    label: "Standaardpagina",
    description: "Paginakop, tekstblok en afsluitende oproep.",
    sections: ["pageHero", "richText", "closingCta"],
  },
  {
    key: "landing",
    label: "Landingspagina",
    description: "Paginakop, afbeelding met tekst, USP’s, testimonials en een oproep.",
    sections: ["pageHero", "imageText", "valuesGrid", "testimonials", "faq", "closingCta"],
  },
  {
    key: "dienst",
    label: "Dienstenpagina",
    description: "Paginakop, uitgebreide diensten, vergelijking en oproep.",
    sections: ["pageHero", "servicesDetailed", "comparison", "closingCta"],
  },
  {
    key: "contact",
    label: "Contactpagina",
    description: "Contactkop met formulier en contactgegevens.",
    sections: ["contactHero", "contactDetails"],
  },
  {
    key: "leeg",
    label: "Lege pagina",
    description: "Alleen een paginakop; voeg zelf secties toe.",
    sections: ["pageHero"],
  },
];
