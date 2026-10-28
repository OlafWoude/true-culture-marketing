import { backgroundOptions, defaultsFor, type FieldDef, type Values } from "./fields";

const eyebrow: FieldDef = { key: "eyebrow", label: "Label boven de kop", type: "text", max: 60, help: "Kort label met een geel bolletje, bijv. ‘Diensten’." };
const title: FieldDef = { key: "title", label: "Kop", type: "text", max: 160 };
const highlight: FieldDef = { key: "highlight", label: "Geel gemarkeerd deel van de kop", type: "text", max: 120, help: "Wordt direct na de kop in het geel getoond. Laat leeg als je geen geel deel wilt." };
const intro: FieldDef = { key: "intro", label: "Introductietekst", type: "textarea", max: 600 };
const watermark: FieldDef = { key: "showWatermark", label: "Gorilla als achtergrond tonen", type: "boolean" };
const background: FieldDef = { key: "background", label: "Achtergrond", type: "select", options: backgroundOptions };
const mobileCarousel: FieldDef = {
  key: "mobileCarousel",
  label: "Op mobiel naast elkaar tonen (swipen)",
  type: "boolean",
  help: "Op telefoons staan de kaarten dan naast elkaar en veeg je opzij. Op grotere schermen verandert er niets.",
};

const detailLabel: FieldDef = {
  key: "detailLabel",
  label: "Linktekst naar de pagina van de vacature",
  type: "text",
  max: 40,
  help: "Elke vacature heeft een eigen pagina met alle details. Leeg = geen link.",
};

const mediaAspects = [
  { value: "4/3", label: "Liggend (4:3)" },
  { value: "16/9", label: "Breed (16:9)" },
  { value: "1/1", label: "Vierkant" },
  { value: "4/5", label: "Staand (4:5)" },
  { value: "9/16", label: "Staand, zoals een telefoonvideo (9:16)" },
];

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
    description: "De grote kop bovenaan de homepage, met knoppen en optioneel de vacaturetegels.",
    category: "Kop",
    fields: [
      eyebrow,
      title,
      highlight,
      { key: "highlightNewLine", label: "Geel deel op een nieuwe regel", type: "boolean" },
      intro,
      { key: "primaryCta", label: "Hoofdknop (geel)", type: "cta" },
      { key: "secondaryCta", label: "Tweede knop", type: "cta" },
      { key: "trustPoints", label: "Korte zekerheden onder de knoppen", type: "stringList", itemLabel: "Punt", max: 4, help: "Bijv. ‘Geen cv nodig’. Haalt drempels weg vlak bij de knop." },
      { key: "showServiceTiles", label: "Vacaturetegels onder de kop tonen", type: "boolean" },
      { key: "tileLinkLabel", label: "Linktekst op de vacaturetegels", type: "text", max: 40 },
      { ...mobileCarousel, label: "Vacaturetegels op mobiel naast elkaar tonen (swipen)" },
      watermark,
    ],
    defaults: { highlightNewLine: true, showServiceTiles: true, tileLinkLabel: "Meer weten", mobileCarousel: true, showWatermark: true },
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
    label: "Vacatures (overzicht)",
    description: "Zwart paneel met alle gepubliceerde vacatures in kaarten.",
    category: "Collecties",
    fields: [
      eyebrow,
      title,
      intro,
      { key: "linkLabel", label: "Linktekst per vacature (als die zelf geen knop heeft)", type: "text", max: 40 },
      detailLabel,
      mobileCarousel,
    ],
    defaults: { linkLabel: "Lees meer", detailLabel: "Bekijk vacature", mobileCarousel: true },
  },
  servicesDetailed: {
    label: "Vacatures (uitgebreid)",
    description: "Alle gepubliceerde vacatures onder elkaar, afwisselend wit en zwart.",
    category: "Collecties",
    fields: [{ key: "pointsTitle", label: "Titel boven de opsomming", type: "text", max: 60 }, detailLabel, mobileCarousel],
    defaults: { pointsTitle: "Wat je krijgt", detailLabel: "Bekijk vacature", mobileCarousel: true },
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
      mobileCarousel,
    ],
    defaults: { layout: "split", background: "light", selfLabel: "Zelf doen", usAccent: "True", usLabel: "Culture", mobileCarousel: true },
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
      mobileCarousel,
    ],
    defaults: { mobileCarousel: true },
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
      mobileCarousel,
    ],
    defaults: { resultLabel: "Resultaat", mobileCarousel: true },
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
      mobileCarousel,
    ],
    defaults: { show: "featured", placeholderTitle: "Binnenkort", placeholderText: "Case in voorbereiding", mobileCarousel: true },
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
    description: "Tekst links en een foto rechts. Zonder foto verschijnt een plaatshouder of de gele gorilla.",
    category: "Tekst",
    fields: [
      eyebrow,
      title,
      { key: "body", label: "Tekst", type: "richtext" },
      { key: "image", label: "Foto (optioneel)", type: "image" },
      { key: "placeholderText", label: "Tekst op de plaatshouder", type: "text", max: 100, help: "Zolang er nog geen foto is, staat hier een plaatshouder met deze tekst, bijv. ‘Het team na een werkdag’. Leeg = de gele gorilla." },
    ],
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
      mobileCarousel,
    ],
    defaults: { mobileCarousel: true },
  },
  contactHero: {
    label: "Sollicitatieformulier",
    description: "Zwarte kop met het sollicitatieformulier. Formulierteksten beheer je bij Formulieren.",
    category: "Contact",
    fields: [
      eyebrow,
      title,
      highlight,
      intro,
      { key: "bullets", label: "Voordelen onder de tekst", type: "stringList", itemLabel: "Voordeel", max: 6 },
      { key: "whatsappLabel", label: "Tekst op de WhatsApp-knop", type: "text", max: 60, help: "De knop verschijnt alleen als bij Instellingen een WhatsApp-nummer staat." },
      { key: "formTitle", label: "Titel boven het formulier", type: "text", max: 80 },
      { key: "formIntro", label: "Tekst boven het formulier", type: "text", max: 200 },
    ],
    defaults: { whatsappLabel: "Eerst een vraag? App ons" },
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
      mobileCarousel,
    ],
    defaults: { background: "light", mobileCarousel: true },
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
    label: "Foto of video met tekst",
    description: "Foto of video naast kop, tekst en knop. Zonder beeld verschijnt een plaatshouder.",
    category: "Media",
    fields: [
      eyebrow,
      title,
      { key: "body", label: "Tekst", type: "richtext" },
      { key: "image", label: "Foto", type: "image" },
      { key: "video", label: "Video (optioneel, in plaats van de foto)", type: "video", help: "Liefst korter dan een minuut, met ondertitels in de video zelf: de meeste mensen kijken zonder geluid." },
      { key: "poster", label: "Eigen beeld vóór het afspelen (optioneel)", type: "image", help: "Leeg = een beeld uit de video zelf." },
      { key: "mediaAspect", label: "Verhouding van de foto of video", type: "select", options: mediaAspects },
      { key: "placeholder", label: "Plaatshouder zolang er nog geen beeld is", type: "select", options: [
        { value: "photo", label: "Foto volgt" },
        { value: "video", label: "Video volgt" },
      ] },
      { key: "placeholderText", label: "Tekst op de plaatshouder", type: "text", max: 120, help: "Bijv. ‘Een werkdag van begin tot eind’." },
      { key: "imagePosition", label: "Positie van de afbeelding", type: "select", options: [
        { value: "right", label: "Rechts" },
        { value: "left", label: "Links" },
      ] },
      { key: "cta", label: "Knop", type: "cta" },
      background,
    ],
    defaults: { background: "white", mediaAspect: "4/3", placeholder: "photo" },
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
  photoStrip: {
    label: "Fotostrip",
    description: "Een rij foto's van het werk; op mobiel swipe je erdoorheen. Lege plekken tonen een plaatshouder met de omschrijving.",
    category: "Media",
    fields: [
      eyebrow,
      title,
      intro,
      { key: "photos", label: "Foto's", type: "repeater", itemLabel: "Foto", titleKey: "caption", max: 8, fields: [
        { key: "image", label: "Foto", type: "image" },
        { key: "caption", label: "Omschrijving", type: "text", max: 100, help: "Bijv. ‘Aan de deur in een woonwijk’. Staat onder de foto, en op de plaatshouder zolang er nog geen foto is." },
      ] },
      background,
      mobileCarousel,
    ],
    defaults: { background: "light", mobileCarousel: true },
  },
  videoStories: {
    label: "Video's van collega's",
    description: "Korte, staande video's waarin collega's vertellen hoe het werk is. Lege plekken tonen een plaatshouder.",
    category: "Media",
    fields: [
      eyebrow,
      title,
      intro,
      { key: "items", label: "Video's", type: "repeater", itemLabel: "Video", titleKey: "role", max: 6, fields: [
        { key: "video", label: "Video", type: "video", help: "Staand (9:16), liefst korter dan een minuut, met ondertitels in de video zelf: de meeste mensen kijken zonder geluid." },
        { key: "poster", label: "Eigen beeld vóór het afspelen (optioneel)", type: "image", help: "Leeg = een beeld uit de video zelf." },
        { key: "name", label: "Naam", type: "text", max: 60 },
        { key: "role", label: "Functie en plaats", type: "text", max: 80, help: "Bijv. ‘Deur-aan-deur in Groningen’. Staat ook op de plaatshouder zolang er nog geen video is." },
        { key: "quote", label: "Korte quote (optioneel)", type: "textarea", max: 200, rows: 2 },
        { key: "transcript", label: "Uitgeschreven tekst (optioneel)", type: "textarea", max: 3000, rows: 5, help: "Voor wie de video niet kan afspelen of horen. Staat onder ‘Lees wat er gezegd wordt’." },
      ] },
      background,
      mobileCarousel,
    ],
    defaults: { background: "dark", mobileCarousel: true },
  },
  testimonials: {
    label: "Testimonials",
    description: "Toont gepubliceerde testimonials. Wordt automatisch verborgen als er geen zijn.",
    category: "Collecties",
    fields: [eyebrow, title, intro, { ...background, options: backgroundOptions }, mobileCarousel],
    defaults: { background: "white", mobileCarousel: true },
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
