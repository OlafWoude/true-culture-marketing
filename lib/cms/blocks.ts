import { backgroundOptions, defaultsFor, type FieldDef, type Values } from "./fields";

const eyebrow: FieldDef = { key: "eyebrow", label: "Label boven de kop", type: "text", max: 60, help: "Kort label met een geel bolletje, bijv. ‘Diensten’." };
const title: FieldDef = { key: "title", label: "Kop", type: "text", max: 160 };
const highlight: FieldDef = { key: "highlight", label: "Geel gemarkeerd deel van de kop", type: "text", max: 120, help: "Wordt direct na de kop in het geel getoond. Laat leeg als je geen geel deel wilt." };
const intro: FieldDef = { key: "intro", label: "Introductietekst", type: "textarea", max: 600 };
const watermark: FieldDef = { key: "showWatermark", label: "Gorilla als achtergrond tonen", type: "boolean" };
const background: FieldDef = { key: "background", label: "Achtergrond", type: "select", options: backgroundOptions };

export type BlockCategory = "Kop" | "Tekst" | "Media" | "Inhoud" | "Collecties" | "Oproep" | "Contact";

export type BlockDef = {
  label: string;
  description: string;
  category: BlockCategory;
  fields: FieldDef[];
  defaults?: Values;
};

export const blockDefs = {
  hero: {
    label: "Grote openingskop",
    description: "De grote kop bovenaan de homepage, met knoppen en optioneel de dienstentegels.",
    category: "Kop",
    fields: [
      eyebrow,
      title,
      highlight,
      { key: "highlightNewLine", label: "Geel deel op een nieuwe regel", type: "boolean" },
      intro,
      { key: "primaryCta", label: "Hoofdknop (geel)", type: "cta" },
      { key: "secondaryCta", label: "Tweede knop", type: "cta" },
      { key: "showServiceTiles", label: "Dienstentegels onder de kop tonen", type: "boolean" },
      { key: "tileLinkLabel", label: "Linktekst op de dienstentegels", type: "text", max: 40 },
      watermark,
    ],
    defaults: { highlightNewLine: true, showServiceTiles: true, tileLinkLabel: "Meer weten", showWatermark: true },
  },
  pageHero: {
    label: "Paginakop",
    description: "Zwarte kop bovenaan een pagina met label, titel en introductie.",
    category: "Kop",
    fields: [eyebrow, title, highlight, intro, watermark],
    defaults: { showWatermark: true },
  },
  marquee: {
    label: "Lopende band",
    description: "Een rustig bewegende band met korte trefwoorden.",
    category: "Inhoud",
    fields: [{ key: "items", label: "Trefwoorden", type: "stringList", itemLabel: "Trefwoord", max: 20 }],
  },
  introSplit: {
    label: "Tekst met kaart",
    description: "Kop en tekst links, zwarte kaart met opsomming rechts.",
    category: "Tekst",
    fields: [
      eyebrow,
      title,
      { key: "body", label: "Tekst", type: "richtext" },
      { key: "cta", label: "Knop", type: "cta" },
      { key: "cardTitle", label: "Titel van de kaart", type: "text", max: 80 },
      { key: "cardItems", label: "Punten in de kaart", type: "stringList", itemLabel: "Punt", max: 8 },
    ],
  },
  servicesOverview: {
    label: "Diensten (overzicht)",
    description: "Zwart paneel met alle gepubliceerde diensten in kaarten.",
    category: "Collecties",
    fields: [eyebrow, title, intro, { key: "linkLabel", label: "Linktekst per dienst", type: "text", max: 40 }],
    defaults: { linkLabel: "Lees meer" },
  },
  servicesDetailed: {
    label: "Diensten (uitgebreid)",
    description: "Alle gepubliceerde diensten onder elkaar, afwisselend wit en zwart.",
    category: "Collecties",
    fields: [{ key: "pointsTitle", label: "Titel boven de opsomming", type: "text", max: 60 }],
    defaults: { pointsTitle: "Wat je krijgt" },
  },
  comparison: {
    label: "Vergelijking",
    description: "Tabel die twee aanpakken naast elkaar zet.",
    category: "Inhoud",
    fields: [
      eyebrow,
      title,
      intro,
      { key: "layout", label: "Indeling van de kop", type: "select", options: [
        { value: "split", label: "Kop links, tekst rechts" },
        { value: "stacked", label: "Kop en tekst onder elkaar" },
      ] },
      { ...background, options: backgroundOptions.filter((o) => o.value !== "dark") },
      { key: "selfLabel", label: "Kolomtitel links", type: "text", max: 40 },
      { key: "usAccent", label: "Kolomtitel rechts – geel deel", type: "text", max: 30 },
      { key: "usLabel", label: "Kolomtitel rechts – wit deel", type: "text", max: 30 },
      { key: "rows", label: "Rijen", type: "repeater", itemLabel: "Rij", titleKey: "label", max: 10, fields: [
        { key: "label", label: "Onderdeel", type: "text", max: 80 },
        { key: "self", label: "Linkerkolom", type: "text", max: 120 },
        { key: "us", label: "Rechterkolom (met vinkje)", type: "text", max: 120 },
      ] },
    ],
    defaults: { layout: "split", background: "light", selfLabel: "Zelf doen", usAccent: "True", usLabel: "Culture" },
  },
  steps: {
    label: "Stappen (overzicht)",
    description: "Genummerde stappen in kaarten naast elkaar.",
    category: "Inhoud",
    fields: [
      eyebrow,
      title,
      { key: "cta", label: "Knop naast de kop", type: "cta" },
      { key: "items", label: "Stappen", type: "repeater", itemLabel: "Stap", titleKey: "title", max: 8, fields: [
        { key: "title", label: "Titel", type: "text", max: 60 },
        { key: "description", label: "Omschrijving", type: "textarea", max: 400 },
      ] },
    ],
  },
  stepsDetailed: {
    label: "Stappen (uitgebreid)",
    description: "Grote genummerde stappen onder elkaar, met een resultaat per stap.",
    category: "Inhoud",
    fields: [
      { key: "resultLabel", label: "Label boven het resultaat", type: "text", max: 40 },
      { key: "items", label: "Stappen", type: "repeater", itemLabel: "Stap", titleKey: "title", max: 10, fields: [
        { key: "title", label: "Titel", type: "text", max: 60 },
        { key: "detail", label: "Uitleg", type: "textarea", max: 800 },
        { key: "outcome", label: "Resultaat", type: "text", max: 120 },
      ] },
    ],
    defaults: { resultLabel: "Resultaat" },
  },
  cases: {
    label: "Cases",
    description: "Toont gepubliceerde cases. Zonder cases verschijnen nette ‘binnenkort’-kaarten.",
    category: "Collecties",
    fields: [
      eyebrow,
      title,
      highlight,
      { key: "text", label: "Tekst", type: "textarea", max: 600 },
      { key: "cta", label: "Knop", type: "cta" },
      { key: "show", label: "Welke cases tonen", type: "select", options: [
        { value: "featured", label: "Alleen cases die op de homepage mogen" },
        { value: "all", label: "Alle gepubliceerde cases" },
      ] },
      { key: "placeholderTitle", label: "Tekst op lege kaarten", type: "text", max: 40 },
      { key: "placeholderText", label: "Ondertitel op lege kaarten", type: "text", max: 60 },
    ],
    defaults: { show: "featured", placeholderTitle: "Binnenkort", placeholderText: "Case in voorbereiding" },
  },
  faq: {
    label: "Veelgestelde vragen",
    description: "Uitklapbare vragen en antwoorden (ook zichtbaar voor Google).",
    category: "Inhoud",
    fields: [
      eyebrow,
      title,
      { key: "text", label: "Tekst onder de kop", type: "richtext", minimal: true },
      { ...background, options: backgroundOptions.filter((o) => o.value !== "dark") },
      { key: "items", label: "Vragen", type: "repeater", itemLabel: "Vraag", titleKey: "question", max: 20, fields: [
        { key: "question", label: "Vraag", type: "text", max: 200 },
        { key: "answer", label: "Antwoord", type: "textarea", max: 1500 },
      ] },
    ],
    defaults: { background: "light" },
  },
  closingCta: {
    label: "Afsluitende oproep",
    description: "Zwarte sectie met grote kop en één duidelijke knop.",
    category: "Oproep",
    fields: [title, highlight, { key: "text", label: "Tekst", type: "textarea", max: 400 }, { key: "cta", label: "Knop", type: "cta" }, watermark],
    defaults: { showWatermark: true },
  },
  storySplit: {
    label: "Verhaal met beeld",
    description: "Tekst links en een afbeelding rechts. Zonder afbeelding verschijnt de gele gorilla.",
    category: "Tekst",
    fields: [eyebrow, title, { key: "body", label: "Tekst", type: "richtext" }, { key: "image", label: "Afbeelding (optioneel)", type: "image" }],
  },
  valuesGrid: {
    label: "USP’s / principes",
    description: "Genummerde kaarten in twee kolommen, met knoppen eronder.",
    category: "Inhoud",
    fields: [
      eyebrow,
      title,
      { key: "items", label: "Kaarten", type: "repeater", itemLabel: "Kaart", titleKey: "title", max: 12, fields: [
        { key: "title", label: "Titel", type: "text", max: 60 },
        { key: "text", label: "Tekst", type: "textarea", max: 400 },
      ] },
      { key: "secondaryCta", label: "Eerste knop (omlijnd)", type: "cta" },
      { key: "primaryCta", label: "Tweede knop (zwart)", type: "cta" },
    ],
  },
  contactHero: {
    label: "Contact met formulier",
    description: "Zwarte kop met het contactformulier. Formulierteksten beheer je bij Formulieren.",
    category: "Contact",
    fields: [
      eyebrow,
      title,
      highlight,
      intro,
      { key: "bullets", label: "Voordelen onder de tekst", type: "stringList", itemLabel: "Voordeel", max: 6 },
      { key: "formTitle", label: "Titel boven het formulier", type: "text", max: 80 },
      { key: "formIntro", label: "Tekst boven het formulier", type: "text", max: 200 },
    ],
  },
  numberedCards: {
    label: "Genummerde kaarten",
    description: "Kop met genummerde kaarten in drie kolommen.",
    category: "Inhoud",
    fields: [
      eyebrow,
      title,
      { ...background, options: backgroundOptions.filter((o) => o.value !== "dark") },
      { key: "items", label: "Kaarten", type: "repeater", itemLabel: "Kaart", titleKey: "title", max: 9, fields: [
        { key: "title", label: "Titel", type: "text", max: 80 },
        { key: "text", label: "Tekst", type: "textarea", max: 400 },
      ] },
    ],
    defaults: { background: "light" },
  },
  textCards: {
    label: "Tekstkaarten",
    description: "Witte kaarten met een tussenkop en tekst, zoals op de privacypagina.",
    category: "Tekst",
    fields: [
      { key: "items", label: "Kaarten", type: "repeater", itemLabel: "Kaart", titleKey: "title", max: 30, fields: [
        { key: "title", label: "Tussenkop", type: "text", max: 120 },
        { key: "body", label: "Tekst", type: "richtext" },
      ] },
    ],
  },
  richText: {
    label: "Tekstblok",
    description: "Vrije tekst met tussenkoppen, vetgedrukte tekst en links.",
    category: "Tekst",
    fields: [eyebrow, title, { key: "body", label: "Tekst", type: "richtext" }, background],
    defaults: { background: "white" },
  },
  imageText: {
    label: "Afbeelding met tekst",
    description: "Afbeelding naast kop, tekst en knop.",
    category: "Media",
    fields: [
      eyebrow,
      title,
      { key: "body", label: "Tekst", type: "richtext" },
      { key: "image", label: "Afbeelding", type: "image" },
      { key: "imagePosition", label: "Positie van de afbeelding", type: "select", options: [
        { value: "right", label: "Rechts" },
        { value: "left", label: "Links" },
      ] },
      { key: "cta", label: "Knop", type: "cta" },
      background,
    ],
    defaults: { background: "white" },
  },
  image: {
    label: "Afbeelding",
    description: "Een losse afbeelding met optioneel bijschrift.",
    category: "Media",
    fields: [
      { key: "image", label: "Afbeelding", type: "image" },
      { key: "caption", label: "Bijschrift", type: "text", max: 200 },
      { key: "aspect", label: "Verhouding", type: "select", options: [
        { value: "original", label: "Origineel" },
        { value: "16/9", label: "Breed (16:9)" },
        { value: "4/3", label: "Standaard (4:3)" },
        { value: "1/1", label: "Vierkant" },
        { value: "21/9", label: "Panorama (21:9)" },
      ] },
      { key: "size", label: "Breedte", type: "select", options: [
        { value: "contained", label: "Binnen de inhoudsbreedte" },
        { value: "wide", label: "Breed" },
      ] },
      background,
    ],
    defaults: { background: "white" },
  },
  testimonials: {
    label: "Testimonials",
    description: "Toont gepubliceerde testimonials. Wordt automatisch verborgen als er geen zijn.",
    category: "Collecties",
    fields: [eyebrow, title, intro, { ...background, options: backgroundOptions }],
    defaults: { background: "white" },
  },
  contactDetails: {
    label: "Contactgegevens",
    description: "Toont e-mail, telefoon en adres uit Instellingen.",
    category: "Contact",
    fields: [eyebrow, title, intro, background],
    defaults: { background: "light" },
  },
} satisfies Record<string, BlockDef>;

export type BlockType = keyof typeof blockDefs;

export type Section = {
  id: string;
  type: BlockType;
  hidden: boolean;
  data: Values;
};

export function isBlockType(value: unknown): value is BlockType {
  return typeof value === "string" && value in blockDefs;
}

export function blockDefaults(type: BlockType): Values {
  const def: BlockDef = blockDefs[type];
  return { ...defaultsFor(def.fields), ...(def.defaults ?? {}) };
}
