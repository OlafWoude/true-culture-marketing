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
    label: "Campagnepagina",
    description: "Voor een advertentie of stad (bijv. ‘Bijbaan in Groningen’): kop, uitleg met beeld, voordelen, ervaringen, vragen en oproep.",
    sections: ["pageHero", "imageText", "valuesGrid", "testimonials", "faq", "closingCta"],
  },
  {
    key: "dienst",
    label: "Vacaturepagina",
    description: "Paginakop, alle vacatures, voordelen en oproep.",
    sections: ["pageHero", "servicesDetailed", "valuesGrid", "closingCta"],
  },
  {
    key: "contact",
    label: "Sollicitatiepagina",
    description: "Kop met het sollicitatieformulier, de vervolgstappen en contactgegevens.",
    sections: ["contactHero", "numberedCards", "contactDetails"],
  },
  {
    key: "leeg",
    label: "Lege pagina",
    description: "Alleen een paginakop; voeg zelf secties toe.",
    sections: ["pageHero"],
  },
];
