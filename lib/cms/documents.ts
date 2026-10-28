import { defaultsFor, type CtaValue, type FieldDef, type LinkValue, type Values } from "./fields";
import type { Section } from "./blocks";
import {
  bodyFonts,
  buttonShapes,
  containerWidths,
  cornerStyles,
  displayFonts,
  formStyles,
  navStyles,
  sectionSpacings,
  shadowStyles,
} from "@/lib/theme-options";

const opts = (record: Record<string, { label: string }>) =>
  Object.entries(record).map(([value, { label }]) => ({ value, label }));

export const seoFields: FieldDef[] = [
  { key: "title", label: "SEO-titel", type: "text", max: 70, help: "Titel in Google en in het browsertabblad. Leeg = paginatitel." },
  { key: "description", label: "Meta description", type: "textarea", max: 200, rows: 3, help: "Korte samenvatting voor Google (ideaal 120–160 tekens)." },
  { key: "ogTitle", label: "Titel bij delen op social media", type: "text", max: 90, help: "Leeg = SEO-titel." },
  { key: "ogDescription", label: "Tekst bij delen op social media", type: "textarea", max: 200, rows: 2, help: "Leeg = meta description." },
  { key: "ogImage", label: "Afbeelding bij delen", type: "image", help: "Leeg = standaard deelafbeelding uit Instellingen." },
  { key: "canonical", label: "Canonieke URL (optioneel)", type: "text", max: 300, help: "Alleen invullen als deze inhoud elders de hoofdversie heeft." },
  { key: "noindex", label: "Verbergen voor zoekmachines", type: "boolean", help: "Deze pagina komt dan niet in Google en niet in de sitemap." },
];

export type Seo = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  canonical: string;
  noindex: boolean;
};

export type PageDoc = { title: string; slug: string; seo: Seo; sections: Section[] };

export type ServiceDoc = {
  title: string;
  anchor: string;
  jobTitle: string;
  tag: string;
  short: string;
  description: string;
  points: string[];
  requirements: string[];
  offer: string[];
  employmentType: string;
  payText: string;
  salary: { min: number; max: number; unit: string };
  locations: { city: string; region: string }[];
  image: string | null;
  video: string | null;
  videoPoster: string | null;
  videoCaption: string;
  cta: CtaValue;
  seo: Seo;
};

export type CaseDoc = {
  title: string;
  slug: string;
  client: string;
  summary: string;
  body: string;
  coverImage: string | null;
  gallery: string[];
  results: { value: string; label: string }[];
  featured: boolean;
  seo: Seo;
};

export type TestimonialDoc = {
  name: string;
  role: string;
  company: string;
  quote: string;
  photo: string | null;
  logo: string | null;
};

// A vacancy's share image is drawn automatically; a chosen picture becomes the photo in it.
const vacancySeoFields = seoFields.map((f) =>
  f.key === "ogImage" ? { ...f, help: "Komt in de automatische deelafbeelding van deze vacature. Leeg = de foto van de vacature." } : f,
);

// Values follow Google's job posting types; a comma means "either".
export const employmentTypes = [
  { value: "PART_TIME,FULL_TIME", label: "Parttime of fulltime" },
  { value: "PART_TIME", label: "Parttime of bijbaan" },
  { value: "FULL_TIME", label: "Fulltime" },
  { value: "CONTRACTOR", label: "Zelfstandig (zzp)" },
  { value: "TEMPORARY", label: "Tijdelijk" },
  { value: "OTHER", label: "Anders" },
];

export const collectionDefs = {
  service: {
    label: "Vacatures",
    singular: "Vacature",
    path: "vacatures",
    titleKey: "title",
    fields: [
      { key: "title", label: "Functienaam", type: "text", max: 80 },
      { key: "anchor", label: "URL-naam", type: "text", max: 60, help: "De vacature staat op /vacatures/<url-naam>, bijv. /vacatures/deur-aan-deur. Alleen kleine letters, cijfers en streepjes. Leeg = afgeleid van de functienaam." },
      { key: "jobTitle", label: "Functietitel voor Google", type: "text", max: 80, help: "Zoals mensen de baan zoeken, bijv. ‘Promotor deur-aan-deur’. Google toont deze titel in de vacatureresultaten. Leeg = de functienaam." },
      { key: "tag", label: "Kort label (geel)", type: "text", max: 30 },
      { key: "short", label: "Korte omschrijving (tegels, overzicht en Google)", type: "textarea", max: 220, rows: 3 },
      { key: "description", label: "Uitgebreide omschrijving", type: "textarea", max: 1200, rows: 5 },
      { key: "points", label: "Wat je doet", type: "stringList", itemLabel: "Punt", max: 8 },
      { key: "requirements", label: "Wat we vragen", type: "stringList", itemLabel: "Punt", max: 8 },
      { key: "offer", label: "Wat je krijgt", type: "stringList", itemLabel: "Punt", max: 8 },
      { key: "employmentType", label: "Soort dienstverband", type: "select", options: employmentTypes, help: "Google toont dit bij de vacature." },
      { key: "payText", label: "Beloning in het kort", type: "text", max: 80, help: "Staat bij de kerngegevens op de vacaturepagina, bijv. ‘Per resultaat, zonder plafond’." },
      { key: "salary", label: "Beloning voor Google (optioneel)", type: "group", help: "Alleen invullen als dit de werkelijke beloning is, geen schatting. Laat ‘Vanaf’ op 0 staan om geen bedrag aan Google door te geven.", fields: [
        { key: "min", label: "Vanaf", type: "number", min: 0, max: 100000, step: 1, unit: "euro", control: "input" },
        { key: "max", label: "Tot (optioneel)", type: "number", min: 0, max: 100000, step: 1, unit: "euro", control: "input" },
        { key: "unit", label: "Per", type: "select", options: [
          { value: "DAY", label: "Dag" },
          { value: "HOUR", label: "Uur" },
          { value: "WEEK", label: "Week" },
          { value: "MONTH", label: "Maand" },
        ] },
      ] },
      { key: "locations", label: "Werkplaatsen", type: "repeater", itemLabel: "Plaats", titleKey: "city", max: 12, help: "Google toont de vacature bij zoekopdrachten in en rond deze plaatsen.", fields: [
        { key: "city", label: "Plaats", type: "text", max: 60 },
        { key: "region", label: "Provincie", type: "text", max: 60 },
      ] },
      { key: "image", label: "Foto", type: "image", help: "Staat op de vacaturepagina en in het vacatureoverzicht. Een echte foto van het team in actie werkt het best." },
      { key: "video", label: "Video van een collega (optioneel)", type: "video", help: "Een korte, staande video (9:16) waarin een collega vertelt hoe het werk echt is. Zet ondertitels in de video zelf." },
      { key: "videoPoster", label: "Eigen beeld vóór het afspelen (optioneel)", type: "image", help: "Leeg = een beeld uit de video zelf." },
      { key: "videoCaption", label: "Bij de video", type: "text", max: 120, help: "Bijv. ‘Sanne, deur-aan-deur in Groningen’." },
      { key: "cta", label: "Knop (optioneel)", type: "cta", help: "Bijv. ‘Solliciteer direct’ naar de sollicitatiepagina. De kaarten op de homepage gebruiken deze knop ook." },
      { key: "seo", label: "SEO en delen", type: "group", fields: vacancySeoFields },
    ] as FieldDef[],
  },
  case: {
    label: "Cases",
    singular: "Case",
    path: "cases",
    titleKey: "title",
    fields: [
      { key: "title", label: "Titel", type: "text", max: 120 },
      { key: "slug", label: "URL-naam", type: "text", max: 80, help: "De case staat op /cases/<url-naam>." },
      { key: "client", label: "Klantnaam", type: "text", max: 80 },
      { key: "summary", label: "Korte samenvatting", type: "textarea", max: 300, rows: 3 },
      { key: "body", label: "Beschrijving", type: "richtext" },
      { key: "coverImage", label: "Hoofdafbeelding", type: "image" },
      { key: "gallery", label: "Extra afbeeldingen", type: "images", max: 12 },
      { key: "results", label: "Resultaten", type: "repeater", itemLabel: "Resultaat", titleKey: "value", max: 6, fields: [
        { key: "value", label: "Waarde (bijv. 40+)", type: "text", max: 20 },
        { key: "label", label: "Omschrijving", type: "text", max: 80 },
      ] },
      { key: "featured", label: "Tonen op de homepage", type: "boolean" },
      { key: "seo", label: "SEO", type: "group", fields: seoFields },
    ] as FieldDef[],
  },
  testimonial: {
    label: "Testimonials",
    singular: "Testimonial",
    path: "testimonials",
    titleKey: "name",
    fields: [
      { key: "name", label: "Naam", type: "text", max: 80 },
      { key: "role", label: "Rol (bijv. Field marketeer)", type: "text", max: 80 },
      { key: "company", label: "Extra regel (bijv. ‘Student, Groningen’ of ‘Sinds 2025’)", type: "text", max: 80 },
      { key: "quote", label: "Citaat", type: "textarea", max: 800, rows: 5, help: "Echte woorden van een collega werken het best: wat vond je spannend, wat maakt het leuk?" },
      { key: "photo", label: "Profielfoto (optioneel)", type: "image" },
      { key: "logo", label: "Logo (optioneel)", type: "image" },
    ] as FieldDef[],
  },
} as const;

export type CollectionType = keyof typeof collectionDefs;

const linkItem: FieldDef[] = [
  { key: "label", label: "Tekst", type: "text", max: 40 },
  { key: "link", label: "Link", type: "link" },
  { key: "visible", label: "Zichtbaar", type: "boolean" },
];

export const singletonDefs = {
  settings: {
    label: "Bedrijf & website",
    description: "Bedrijfsgegevens, contactgegevens en standaard SEO-instellingen.",
    fields: [
      { key: "siteName", label: "Naam van de website", type: "text", max: 80 },
      { key: "siteUrl", label: "Hoofddomein", type: "text", max: 120, help: "Vul pas in als je eigen domein aan de website is gekoppeld, bijv. https://www.jouwdomein.nl. Leeg = het adres waarop de site nu draait. Gebruikt voor de sitemap en canonieke links." },
      { key: "titleSuffix", label: "Achtervoegsel paginatitels", type: "text", max: 60, help: "Komt achter elke SEO-titel, bijv. ‘| True Culture Marketing’." },
      { key: "defaultDescription", label: "Standaard meta description", type: "textarea", max: 200, rows: 3, help: "Ideaal 120–160 tekens; Google kort langere teksten af." },
      { key: "ogImage", label: "Standaard afbeelding bij delen", type: "image", help: "Leeg = de huidige True Culture-banner." },
      { key: "allowIndexing", label: "Website tonen in zoekmachines", type: "boolean", help: "Zet alleen uit als de hele website (tijdelijk) niet gevonden mag worden." },
      { key: "showMediaPlaceholders", label: "Lege foto- en videoplekken tonen", type: "boolean", help: "Toont een nette plaatshouder op plekken waar nog een foto of video moet komen. Zet uit om die plekken te verbergen tot er echt beeld is." },
      { key: "company", label: "Bedrijfsgegevens", type: "group", fields: [
        { key: "legalName", label: "Statutaire naam", type: "text", max: 120 },
        { key: "kvk", label: "KvK-nummer", type: "text", max: 20 },
        { key: "vat", label: "Btw-nummer", type: "text", max: 30 },
        { key: "address", label: "Adres", type: "textarea", max: 300, rows: 3 },
      ] },
      { key: "contact", label: "Contactgegevens", type: "group", fields: [
        { key: "email", label: "E-mailadres", type: "text", max: 120, help: "Staat in de footer." },
        { key: "phone", label: "Telefoonnummer", type: "text", max: 30, help: "Staat in de footer." },
        { key: "whatsapp", label: "WhatsApp-nummer", type: "text", max: 30, help: "Bijv. 06 12345678 of +31 6 12345678. Leeg = geen WhatsApp-knoppen op de website." },
        { key: "whatsappMessage", label: "Bericht dat in WhatsApp al klaarstaat", type: "textarea", max: 200, rows: 2, help: "Wie op een WhatsApp-knop klikt, ziet dit bericht al in de chat staan en kan het nog aanpassen voordat hij het verstuurt." },
        { key: "whatsappVacancyMessage", label: "Bericht vanaf de pagina van een vacature", type: "textarea", max: 200, rows: 2, help: "{vacature} wordt vervangen door de naam van de vacature. Leeg = het bericht hierboven." },
        { key: "whatsappButton", label: "WhatsApp-knop rechtsonder tonen", type: "boolean", help: "Een knop die altijd in beeld blijft, behalve op de sollicitatiepagina. Op telefoons schuift hij na het scrollen in de balk met de sollicitatieknop." },
        { key: "whatsappLabel", label: "Tekst op de WhatsApp-knop", type: "text", max: 30, help: "Op de computer staat deze tekst naast het WhatsApp-icoon, en in het menu op telefoons." },
      ] },
      { key: "socials", label: "Social media", type: "repeater", itemLabel: "Profiel", titleKey: "platform", max: 8, fields: [
        { key: "platform", label: "Platform", type: "select", options: [
          { value: "LinkedIn", label: "LinkedIn" },
          { value: "Instagram", label: "Instagram" },
          { value: "Facebook", label: "Facebook" },
          { value: "YouTube", label: "YouTube" },
          { value: "TikTok", label: "TikTok" },
          { value: "X", label: "X (Twitter)" },
        ] },
        { key: "url", label: "Link naar profiel", type: "text", max: 300 },
      ] },
    ] as FieldDef[],
  },
  navigation: {
    label: "Navigatie",
    description: "Het menu bovenaan de website.",
    fields: [
      { key: "items", label: "Menu-items", type: "repeater", itemLabel: "Menu-item", titleKey: "label", max: 10, fields: [
        ...linkItem,
        { key: "children", label: "Submenu (optioneel)", type: "repeater", itemLabel: "Subitem", titleKey: "label", max: 10, fields: linkItem },
      ] },
      { key: "cta", label: "Knop rechts in het menu", type: "group", fields: [
        { key: "label", label: "Tekst", type: "text", max: 40 },
        { key: "mobileLabel", label: "Tekst in het mobiele menu", type: "text", max: 60 },
        { key: "link", label: "Link", type: "link" },
        { key: "visible", label: "Zichtbaar", type: "boolean" },
        { key: "mobileSticky", label: "Op mobiel vast onderin het scherm tonen", type: "boolean", help: "Een vaste knop onderin, zodat bezoekers op elke pagina met één tik kunnen solliciteren." },
      ] },
    ] as FieldDef[],
  },
  footer: {
    label: "Footer",
    description: "De onderkant van elke pagina.",
    fields: [
      { key: "text", label: "Korte tekst onder het logo (optioneel)", type: "textarea", max: 300, rows: 3 },
      { key: "links", label: "Links", type: "repeater", itemLabel: "Link", titleKey: "label", max: 12, fields: linkItem },
      { key: "showContact", label: "Contactgegevens tonen", type: "boolean", help: "E-mail en telefoon uit ‘Bedrijf & website’." },
      { key: "showSocials", label: "Social media tonen", type: "boolean" },
      { key: "legalLinks", label: "Links onderin (privacy, voorwaarden)", type: "repeater", itemLabel: "Link", titleKey: "label", max: 6, fields: linkItem },
      { key: "copyright", label: "Copyrighttekst", type: "text", max: 120, help: "{jaar} wordt automatisch vervangen door het huidige jaar." },
    ] as FieldDef[],
  },
  forms: {
    label: "Formulieren",
    description: "Teksten, meldingen en ontvanger van het sollicitatieformulier.",
    fields: [
      { key: "recipientEmail", label: "Ontvanger van sollicitaties (e-mail)", type: "text", max: 200, help: "Leeg = de ontvanger uit de serverinstelling CONTACT_TO_EMAIL." },
      { key: "storeSubmissions", label: "Sollicitaties ook opslaan in het dashboard", type: "boolean" },
      { key: "retentionDays", label: "Opgeslagen sollicitaties automatisch verwijderen na", type: "number", min: 30, max: 730, step: 30, unit: "dagen", help: "Volgens de Autoriteit Persoonsgegevens bewaar je sollicitatiegegevens tot 4 weken na de procedure, of 1 jaar met toestemming." },
      { key: "labels", label: "Velden", type: "group", fields: [
        { key: "name", label: "Label naam", type: "text", max: 60 },
        { key: "namePlaceholder", label: "Voorbeeldtekst naam", type: "text", max: 80 },
        { key: "phone", label: "Label telefoonnummer", type: "text", max: 60 },
        { key: "phonePlaceholder", label: "Voorbeeldtekst telefoonnummer", type: "text", max: 80 },
        { key: "email", label: "Label e-mailadres", type: "text", max: 60 },
        { key: "emailPlaceholder", label: "Voorbeeldtekst e-mailadres", type: "text", max: 80 },
        { key: "city", label: "Label woonplaats", type: "text", max: 60 },
        { key: "cityPlaceholder", label: "Voorbeeldtekst woonplaats", type: "text", max: 80 },
        { key: "availability", label: "Label beschikbaarheid", type: "text", max: 80 },
        { key: "availabilityPlaceholder", label: "Toelichting onder de vraag over beschikbaarheid", type: "text", max: 60, help: "Optioneel, bijvoorbeeld: Je kunt dit later nog aanpassen." },
        { key: "vacancy", label: "Label vacaturekeuze", type: "text", max: 80, help: "Laat leeg om de vraag te verbergen. Wie via de pagina van een vacature solliciteert, ziet die vacature al ingevuld." },
        { key: "vacancyNone", label: "Keuze ‘geen voorkeur’ bij de vacaturekeuze", type: "text", max: 60 },
        { key: "message", label: "Label bericht (optioneel veld)", type: "text", max: 80 },
        { key: "messagePlaceholder", label: "Voorbeeldtekst bericht", type: "text", max: 200 },
        { key: "submit", label: "Tekst op de knop", type: "text", max: 40 },
        { key: "sending", label: "Tekst tijdens versturen", type: "text", max: 40 },
      ] },
      { key: "availabilityOptions", label: "Keuzes bij beschikbaarheid", type: "stringList", itemLabel: "Keuze", max: 8, help: "Laat leeg om het veld te verbergen." },
      { key: "messages", label: "Meldingen", type: "group", fields: [
        { key: "successTitle", label: "Titel na versturen", type: "text", max: 60 },
        { key: "success", label: "Tekst na versturen", type: "textarea", max: 300, rows: 2 },
        { key: "invalid", label: "Melding bij fouten in velden", type: "text", max: 120 },
        { key: "nameError", label: "Fout: naam", type: "text", max: 120 },
        { key: "phoneError", label: "Fout: telefoonnummer", type: "text", max: 120 },
        { key: "emailError", label: "Fout: e-mailadres", type: "text", max: 120 },
        { key: "cityError", label: "Fout: woonplaats", type: "text", max: 120 },
        { key: "availabilityError", label: "Fout: beschikbaarheid", type: "text", max: 120 },
        { key: "rateLimited", label: "Melding bij te veel sollicitaties", type: "text", max: 200 },
        { key: "failed", label: "Melding bij een technische fout", type: "text", max: 200 },
        { key: "notConfigured", label: "Melding als versturen nog niet is ingesteld", type: "text", max: 300 },
      ] },
      { key: "privacyNote", label: "Privacytekst onder het formulier (optioneel)", type: "richtext", minimal: true },
    ] as FieldDef[],
  },
  theme: {
    label: "Huisstijl",
    description: "Kleuren, lettertypen, vormen en logo.",
    fields: [
      { key: "colors", label: "Kleuren", type: "group", fields: [
        { key: "accent", label: "Accentkleur (primair, geel)", type: "color" },
        { key: "accentHover", label: "Accentkleur bij aanwijzen", type: "color" },
        { key: "onAccent", label: "Tekst op de accentkleur", type: "color" },
        { key: "ink", label: "Donkere achtergrond (secundair)", type: "color" },
        { key: "ink2", label: "Donkere kaarten en menu", type: "color" },
        { key: "ink3", label: "Donker vlak bij aanwijzen", type: "color" },
        { key: "line", label: "Lijnen op donker", type: "color" },
        { key: "paper", label: "Wit / lichte tekst", type: "color" },
        { key: "mist", label: "Lichtgrijze achtergrond", type: "color" },
      ] },
      { key: "typography", label: "Typografie", type: "group", fields: [
        { key: "displayFont", label: "Lettertype koppen", type: "select", options: opts(displayFonts) },
        { key: "displayWeight", label: "Dikte koppen", type: "select", options: [
          { value: "900", label: "Extra vet (standaard)" },
          { value: "800", label: "Vet" },
          { value: "700", label: "Halfvet" },
        ] },
        { key: "displayUppercase", label: "Koppen in hoofdletters", type: "boolean" },
        { key: "headingScale", label: "Grootte van de koppen", type: "number", min: 80, max: 115, step: 5, unit: "%" },
        { key: "headingLineHeight", label: "Regelhoogte koppen", type: "number", min: 85, max: 120, step: 1, unit: "%" },
        { key: "bodyFont", label: "Lettertype lopende tekst", type: "select", options: opts(bodyFonts) },
        { key: "bodySize", label: "Grootte lopende tekst", type: "number", min: 14, max: 19, step: 1, unit: "px" },
        { key: "bodyLineHeight", label: "Regelhoogte lopende tekst", type: "number", min: 130, max: 190, step: 5, unit: "%" },
      ] },
      { key: "shape", label: "Vormen", type: "group", fields: [
        { key: "buttonShape", label: "Vorm van de knoppen", type: "select", options: opts(buttonShapes) },
        { key: "buttonUppercase", label: "Knoptekst in hoofdletters", type: "boolean" },
        { key: "corners", label: "Afronding van kaarten en panelen", type: "select", options: opts(cornerStyles) },
        { key: "shadows", label: "Schaduwen", type: "select", options: opts(shadowStyles) },
      ] },
      { key: "layout", label: "Indeling", type: "group", fields: [
        { key: "container", label: "Breedte van de inhoud", type: "select", options: opts(containerWidths) },
        { key: "spacing", label: "Ruimte tussen secties", type: "select", options: opts(sectionSpacings) },
        { key: "navStyle", label: "Stijl van het menu", type: "select", options: opts(navStyles) },
        { key: "formStyle", label: "Stijl van formuliervelden", type: "select", options: opts(formStyles) },
      ] },
      { key: "brand", label: "Logo en icoon", type: "group", fields: [
        { key: "logo", label: "Logo", type: "image", help: "Leeg = het huidige True Culture-logo. Gebruik bij voorkeur een PNG met transparante achtergrond." },
        { key: "favicon", label: "Favicon (icoon in het tabblad)", type: "image", help: "Leeg = de gele gorilla. Gebruik een vierkante afbeelding." },
        { key: "showGorilla", label: "Gorilla-beeldmerk als achtergrond tonen", type: "boolean" },
      ] },
    ] as FieldDef[],
  },
} as const;

export type SingletonType = keyof typeof singletonDefs;

export type NavItem = { label: string; link: LinkValue; visible: boolean; children: { label: string; link: LinkValue; visible: boolean }[] };
export type Navigation = { items: NavItem[]; cta: { label: string; mobileLabel: string; link: LinkValue; visible: boolean; mobileSticky: boolean } };
export type FooterLink = { label: string; link: LinkValue; visible: boolean };
export type Footer = { text: string; links: FooterLink[]; showContact: boolean; showSocials: boolean; legalLinks: FooterLink[]; copyright: string };
export type Settings = {
  siteName: string;
  siteUrl: string;
  titleSuffix: string;
  defaultDescription: string;
  ogImage: string | null;
  allowIndexing: boolean;
  showMediaPlaceholders: boolean;
  company: { legalName: string; kvk: string; vat: string; address: string };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    whatsappMessage: string;
    whatsappVacancyMessage: string;
    whatsappButton: boolean;
    whatsappLabel: string;
  };
  socials: { platform: string; url: string }[];
};
export type FormsConfig = {
  recipientEmail: string;
  storeSubmissions: boolean;
  retentionDays: number;
  labels: Record<
    | "name" | "namePlaceholder" | "phone" | "phonePlaceholder" | "email" | "emailPlaceholder" | "city" | "cityPlaceholder"
    | "availability" | "availabilityPlaceholder" | "vacancy" | "vacancyNone" | "message" | "messagePlaceholder" | "submit" | "sending",
    string
  >;
  availabilityOptions: string[];
  messages: Record<
    | "successTitle" | "success" | "invalid" | "nameError" | "phoneError" | "emailError" | "cityError" | "availabilityError"
    | "rateLimited" | "failed" | "notConfigured",
    string
  >;
  privacyNote: string;
};
export type Theme = {
  colors: Record<"accent" | "accentHover" | "onAccent" | "ink" | "ink2" | "ink3" | "line" | "paper" | "mist", string>;
  typography: {
    displayFont: string;
    displayWeight: string;
    displayUppercase: boolean;
    headingScale: number;
    headingLineHeight: number;
    bodyFont: string;
    bodySize: number;
    bodyLineHeight: number;
  };
  shape: { buttonShape: string; buttonUppercase: boolean; corners: string; shadows: string };
  layout: { container: string; spacing: string; navStyle: string; formStyle: string };
  brand: { logo: string | null; favicon: string | null; showGorilla: boolean };
};

export const pageFields: FieldDef[] = [
  { key: "title", label: "Paginatitel", type: "text", max: 120 },
  { key: "seo", label: "SEO", type: "group", fields: seoFields },
];

export function emptySeo(): Seo {
  return defaultsFor(seoFields) as Seo;
}

export function collectionDefaults(type: CollectionType): Values {
  return defaultsFor(collectionDefs[type].fields as unknown as FieldDef[]);
}
