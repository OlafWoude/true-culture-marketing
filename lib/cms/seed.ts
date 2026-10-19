// The original, hand-written website content expressed in the CMS format.
// Used to fill an empty database and as a fallback while no database is configured.
import { comparison, marqueeItems, services, steps } from "@/lib/content";
import { faqs } from "@/lib/faq";
import { cta, pageLink } from "./fields";
import type { Section } from "./blocks";
import type {
  CaseDoc,
  FormsConfig,
  Footer,
  Navigation,
  PageDoc,
  Seo,
  ServiceDoc,
  Settings,
  TestimonialDoc,
  Theme,
} from "./documents";

export const SEED_IDS = {
  home: "6a1b7c00-0000-4000-8000-000000000001",
  diensten: "6a1b7c00-0000-4000-8000-000000000002",
  werkwijze: "6a1b7c00-0000-4000-8000-000000000003",
  overOns: "6a1b7c00-0000-4000-8000-000000000004",
  contact: "6a1b7c00-0000-4000-8000-000000000005",
  privacy: "6a1b7c00-0000-4000-8000-000000000006",
  settings: "6a1b7c00-0000-4000-8000-000000000101",
  navigation: "6a1b7c00-0000-4000-8000-000000000102",
  footer: "6a1b7c00-0000-4000-8000-000000000103",
  forms: "6a1b7c00-0000-4000-8000-000000000104",
  theme: "6a1b7c00-0000-4000-8000-000000000105",
} as const;

const serviceIds = [
  "6a1b7c00-0000-4000-8000-000000000201",
  "6a1b7c00-0000-4000-8000-000000000202",
  "6a1b7c00-0000-4000-8000-000000000203",
  "6a1b7c00-0000-4000-8000-000000000204",
];

const P = SEED_IDS;
const toContact = cta("Plan een kennismakingsgesprek", pageLink(P.contact));

function seo(title: string, description: string): Seo {
  return { title, description, ogTitle: "", ogDescription: "", ogImage: null, canonical: "", noindex: false };
}

function section(id: string, type: Section["type"], data: Section["data"]): Section {
  return { id, type, hidden: false, data };
}

const closing = (id: string) =>
  section(id, "closingCta", {
    title: "Klaar voor een",
    highlight: "volle agenda?",
    text: "Plan een vrijblijvend kennismakingsgesprek. We bespreken jouw doelgroep, je doelen en wat wij voor jouw salesteam kunnen betekenen.",
    cta: toContact,
    showWatermark: true,
  });

const faqItems = faqs.map((f) => ({ question: f.q, answer: f.a }));

const comparisonRows = comparison.map((r) => ({ label: r.label, self: r.self, us: r.us }));

export type SeedPage = { id: string; systemKey: string | null; doc: PageDoc };

export function seedPages(): SeedPage[] {
  const home: PageDoc = {
    title: "Home",
    slug: "",
    seo: seo(
      "True Culture Marketing | B2B leadgeneratie en afspraken inplannen",
      "True Culture Marketing is een B2B sales agency. Wij verzorgen leadgeneratie en plannen kwalitatieve afspraken met beslissers in, zodat jouw salesteam zich op de deal kan richten.",
    ),
    sections: [
      section("home-hero", "hero", {
        eyebrow: "B2B sales agency",
        title: "Meer afspraken",
        highlight: "met beslissers",
        highlightNewLine: true,
        intro:
          "True Culture Marketing genereert B2B-leads en plant gekwalificeerde afspraken in. Zo richt jouw salesteam zich op waar het om draait: deals sluiten.",
        primaryCta: toContact,
        secondaryCta: cta("Bekijk onze diensten", pageLink(P.diensten)),
        showServiceTiles: true,
        tileLinkLabel: "Meer weten",
        showWatermark: true,
      }),
      section("home-marquee", "marquee", { items: marqueeItems }),
      section("home-intro", "introSplit", {
        eyebrow: "Over True Culture",
        title: "Jouw salesteam verdient betere gesprekken",
        body:
          "<p>Prospecteren, bellen, opvolgen en plannen: het voortraject slokt tijd op die je salesteam liever in klantgesprekken steekt. Daar komen wij in beeld.</p>" +
          "<p>Wij benaderen de juiste beslissers, kwalificeren de interesse en zetten de afspraak in jullie agenda. Geen losse acties, maar een doordacht proces dat voorspelbaar nieuwe kansen oplevert.</p>",
        cta: cta("Meer over ons", pageLink(P.overOns)),
        cardTitle: "Waar we voor staan",
        cardItems: [
          "Gesprekken met beslissers, niet met poortwachters",
          "Kwaliteit van een afspraak boven aantallen",
          "Transparant in aanpak, voortgang en resultaat",
          "Persoonlijke benadering, nooit massaal",
        ],
      }),
      section("home-services", "servicesOverview", {
        eyebrow: "Diensten",
        title: "Van eerste contact tot afspraak in de agenda",
        intro:
          "Zet één dienst in of laat ons het complete voortraject verzorgen. Altijd afgestemd op jouw doelgroep en doelen.",
        linkLabel: "Lees meer",
      }),
      section("home-comparison", "comparison", {
        eyebrow: "Waarom uitbesteden",
        title: "Jouw team aan tafel, wij aan de voorkant",
        intro:
          "Een salesteam is het meest waardevol in het gesprek met de klant. Door het voortraject uit te besteden, besteedt jouw team zijn tijd daar waar het het verschil maakt.",
        layout: "split",
        background: "light",
        selfLabel: "Zelf doen",
        usAccent: "True",
        usLabel: "Culture",
        rows: comparisonRows,
      }),
      section("home-steps", "steps", {
        eyebrow: "Werkwijze",
        title: "Zo pakken we het aan",
        cta: cta("Bekijk onze werkwijze", pageLink(P.werkwijze)),
        items: steps.map((s) => ({ title: s.title, description: s.description })),
      }),
      section("home-cases", "cases", {
        eyebrow: "Cases",
        title: "Word een van onze",
        highlight: "eerste cases",
        text:
          "We bouwen op dit moment aan onze eerste klantverhalen. Binnenkort lees je hier concrete resultaten. Wil jij de organisatie zijn waar we die voor neerzetten?",
        cta: toContact,
        show: "featured",
        placeholderTitle: "Binnenkort",
        placeholderText: "Case in voorbereiding",
      }),
      section("home-faq", "faq", {
        eyebrow: "Veelgestelde vragen",
        title: "Goed om te weten",
        text: `<p>Staat je vraag er niet tussen? <a href="/contact">Neem contact op</a>.</p>`,
        background: "light",
        items: faqItems,
      }),
      closing("home-closing"),
    ],
  };

  const diensten: PageDoc = {
    title: "Diensten",
    slug: "diensten",
    seo: seo(
      "Diensten",
      "B2B leadgeneratie, afspraken inplannen, outbound campagnes en sales strategie. Bekijk hoe True Culture Marketing jouw salesteam ontlast.",
    ),
    sections: [
      section("diensten-hero", "pageHero", {
        eyebrow: "Diensten",
        title: "Sales-ondersteuning",
        highlight: "die rendeert",
        intro:
          "Zet één dienst in of laat ons het complete voortraject verzorgen. Elke dienst is afgestemd op jouw doelgroep, propositie en doelen.",
        showWatermark: true,
      }),
      section("diensten-list", "servicesDetailed", { pointsTitle: "Wat je krijgt" }),
      section("diensten-comparison", "comparison", {
        eyebrow: "Waarom uitbesteden",
        title: "Zelf doen of uitbesteden?",
        intro:
          "Het voortraject vraagt tijd, discipline en een vaste aanpak. Zo verhoudt zelf doen zich tot werken met True Culture.",
        layout: "stacked",
        background: "white",
        selfLabel: "Zelf doen",
        usAccent: "True",
        usLabel: "Culture",
        rows: comparisonRows,
      }),
      closing("diensten-closing"),
    ],
  };

  const werkwijze: PageDoc = {
    title: "Werkwijze",
    slug: "werkwijze",
    seo: seo(
      "Werkwijze",
      "Van kennismaking tot optimalisatie: zo pakt True Culture Marketing leadgeneratie en het inplannen van afspraken aan.",
    ),
    sections: [
      section("werkwijze-hero", "pageHero", {
        eyebrow: "Werkwijze",
        title: "Geen verrassingen.",
        highlight: "Wel structuur.",
        intro:
          "Elke samenwerking doorloopt dezelfde vier fases. Zo weet je altijd waar je staat, wat we doen en wat je van ons kunt verwachten.",
        showWatermark: true,
      }),
      section("werkwijze-steps", "stepsDetailed", {
        resultLabel: "Resultaat",
        items: steps.map((s) => ({ title: s.title, detail: s.detail, outcome: s.outcome })),
      }),
      section("werkwijze-faq", "faq", {
        eyebrow: "Veelgestelde vragen",
        title: "Goed om te weten",
        text: "",
        background: "white",
        items: faqItems,
      }),
      closing("werkwijze-closing"),
    ],
  };

  const overOns: PageDoc = {
    title: "Over ons",
    slug: "over-ons",
    seo: seo(
      "Over ons",
      "True Culture Marketing is een B2B sales agency die gelooft dat sales voorspelbaar kan zijn. Lees waar we voor staan en hoe we werken.",
    ),
    sections: [
      section("over-hero", "pageHero", {
        eyebrow: "Over ons",
        title: "Sales is geen kunst.",
        highlight: "Het is een vak.",
        intro:
          "True Culture Marketing is opgericht vanuit één overtuiging: B2B sales kan voorspelbaar en schaalbaar zijn, mits je het voortraject serieus neemt.",
        showWatermark: true,
      }),
      section("over-story", "storySplit", {
        eyebrow: "Ons verhaal",
        title: "Gebouwd voor salesteams die willen groeien",
        body:
          "<p>Veel B2B-bedrijven hebben een sterk product en een goed salesteam, maar te weinig gesprekken met de juiste mensen. Prospecteren schiet erbij in, opvolging is wisselend en de pijplijn golft mee.</p>" +
          "<p>Daar richten wij ons op. Wij nemen het voortraject over met een vaste, doordachte aanpak, zodat jouw team doet waar het goed in is: gesprekken voeren en deals sluiten.</p>",
        image: null,
      }),
      section("over-values", "valuesGrid", {
        eyebrow: "Waar we voor staan",
        title: "Onze principes",
        items: [
          { title: "Resultaatgericht", text: "We sturen op wat telt: gesprekken met de juiste beslissers en kansen die daadwerkelijk doorstromen naar je salesteam." },
          { title: "No-nonsense", text: "Direct, eerlijk en zonder omhaal. We zeggen wat werkt en wat niet, ook als dat niet is wat je wilt horen." },
          { title: "Partnerschap", text: "We werken niet los van je team, maar als verlengstuk ervan. Jouw doelen zijn ons uitgangspunt." },
          { title: "Vakmanschap", text: "Elke benadering is persoonlijk en goed voorbereid. Wij vertegenwoordigen jouw merk en dat nemen we serieus." },
        ],
        secondaryCta: cta("Bekijk onze werkwijze", pageLink(P.werkwijze)),
        primaryCta: cta("Bekijk onze diensten", pageLink(P.diensten)),
      }),
      closing("over-closing"),
    ],
  };

  const contact: PageDoc = {
    title: "Contact",
    slug: "contact",
    seo: seo(
      "Plan een kennismakingsgesprek",
      "Plan een vrijblijvend kennismakingsgesprek met True Culture Marketing en ontdek wat wij voor jouw salesteam kunnen betekenen.",
    ),
    sections: [
      section("contact-hero", "contactHero", {
        eyebrow: "Contact",
        title: "Laten we",
        highlight: "kennismaken",
        intro:
          "Plan een vrijblijvend kennismakingsgesprek. We bespreken je doelgroep, je doelen en hoe wij jouw salesteam kunnen ontlasten.",
        bullets: [
          "Vrijblijvend en zonder verplichtingen",
          "Concreet advies over jouw situatie",
          "Direct inzicht in de mogelijkheden",
        ],
        formTitle: "Plan een kennismakingsgesprek",
        formIntro: "Vul het formulier in, dan nemen we contact met je op.",
      }),
      section("contact-steps", "numberedCards", {
        eyebrow: "Wat je kunt verwachten",
        title: "In drie stappen aan tafel",
        background: "light",
        items: [
          { title: "Je laat je gegevens achter", text: "Vertel kort wie je bent en wat je wilt bereiken." },
          { title: "We nemen contact op", text: "We plannen samen een moment dat jou uitkomt." },
          { title: "Het kennismakingsgesprek", text: "We bespreken je doelgroep, doelen en de mogelijkheden. Vrijblijvend." },
        ],
      }),
    ],
  };

  const privacyItems = [
    ["Welke gegevens verzamelen we", "Wanneer je het contactformulier invult, verwerken we de gegevens die je zelf invoert: je naam, bedrijfsnaam, e-mailadres en de inhoud van je bericht."],
    ["Waarvoor gebruiken we deze gegevens", "We gebruiken deze gegevens uitsluitend om contact met je op te nemen naar aanleiding van je aanvraag. We delen ze niet met derden, tenzij dat nodig is om aan een wettelijke verplichting te voldoen. Voor het versturen van het formulier maken we gebruik van een e-maildienst die de gegevens alleen in onze opdracht verwerkt."],
    ["Bewaartermijn", "We bewaren je gegevens niet langer dan nodig is om je aanvraag af te handelen, tenzij we wettelijk verplicht zijn ze langer te bewaren."],
    ["Jouw rechten", "Je hebt het recht om je gegevens in te zien, te laten corrigeren of te laten verwijderen. Neem hiervoor contact met ons op via het contactformulier."],
    ["Cookies", "Deze website plaatst geen tracking- of marketingcookies."],
    ["Wijzigingen", "We kunnen deze privacyverklaring aanpassen. De meest actuele versie staat altijd op deze pagina."],
  ];

  const privacy: PageDoc = {
    title: "Privacyverklaring",
    slug: "privacy",
    seo: seo("Privacyverklaring", "Lees hoe True Culture Marketing omgaat met persoonsgegevens."),
    sections: [
      section("privacy-hero", "pageHero", {
        eyebrow: "Privacy",
        title: "Privacyverklaring",
        highlight: "",
        intro:
          "True Culture Marketing gaat zorgvuldig om met je persoonsgegevens. Hieronder lees je welke gegevens we verwerken en waarom.",
        showWatermark: true,
      }),
      section("privacy-cards", "textCards", {
        items: privacyItems.map(([title, text]) => ({ title, body: `<p>${text}</p>` })),
      }),
    ],
  };

  return [
    { id: P.home, systemKey: "home", doc: home },
    { id: P.diensten, systemKey: null, doc: diensten },
    { id: P.werkwijze, systemKey: null, doc: werkwijze },
    { id: P.overOns, systemKey: null, doc: overOns },
    { id: P.contact, systemKey: null, doc: contact },
    { id: P.privacy, systemKey: null, doc: privacy },
  ];
}

export function seedServices(): { id: string; doc: ServiceDoc }[] {
  return services.map((s, i) => ({
    id: serviceIds[i],
    doc: {
      title: s.title,
      anchor: s.slug,
      tag: s.tag,
      short: s.short,
      description: s.description,
      points: [...s.points],
      image: null,
      cta: cta("", { kind: "none" }),
    },
  }));
}

export function seedCases(): { id: string; doc: CaseDoc }[] {
  return [];
}

export function seedTestimonials(): { id: string; doc: TestimonialDoc }[] {
  return [];
}

export function seedSettings(): Settings {
  return {
    siteName: "True Culture Marketing",
    siteUrl: "https://trueculture.nl",
    titleSuffix: "| True Culture Marketing",
    defaultDescription:
      "True Culture Marketing is een B2B sales agency. Wij verzorgen leadgeneratie en plannen kwalitatieve afspraken met beslissers in, zodat jouw salesteam zich op de deal kan richten.",
    ogImage: null,
    allowIndexing: true,
    company: { legalName: "", kvk: "", vat: "", address: "" },
    contact: { email: "", phone: "" },
    socials: [],
  };
}

export function seedNavigation(): Navigation {
  const item = (label: string, pageId: string) => ({ label, link: pageLink(pageId), visible: true, children: [] });
  return {
    items: [
      item("Diensten", P.diensten),
      item("Werkwijze", P.werkwijze),
      item("Over ons", P.overOns),
      item("Contact", P.contact),
    ],
    cta: { label: "Plan een gesprek", mobileLabel: "Plan een kennismakingsgesprek", link: pageLink(P.contact), visible: true },
  };
}

export function seedFooter(): Footer {
  const link = (label: string, pageId: string) => ({ label, link: pageLink(pageId), visible: true });
  return {
    text: "",
    links: [
      link("Home", P.home),
      link("Diensten", P.diensten),
      link("Werkwijze", P.werkwijze),
      link("Over ons", P.overOns),
      link("Contact", P.contact),
    ],
    showContact: true,
    showSocials: true,
    legalLinks: [link("Privacyverklaring", P.privacy)],
    copyright: "© {jaar} True Culture Marketing",
  };
}

export function seedForms(): FormsConfig {
  return {
    recipientEmail: "",
    storeSubmissions: true,
    retentionDays: 180,
    labels: {
      name: "Naam",
      namePlaceholder: "Je volledige naam",
      company: "Bedrijfsnaam",
      companyPlaceholder: "Naam van je bedrijf",
      email: "E-mailadres",
      emailPlaceholder: "naam@bedrijf.nl",
      message: "Waar kunnen we je mee helpen?",
      messagePlaceholder: "Vertel kort over je bedrijf, je doelgroep en wat je wilt bereiken.",
      submit: "Verstuur aanvraag",
      sending: "Versturen…",
    },
    messages: {
      successTitle: "Bedankt!",
      success: "We hebben je aanvraag ontvangen en nemen zo snel mogelijk contact met je op.",
      invalid: "Controleer de gemarkeerde velden.",
      nameError: "Vul je volledige naam in.",
      companyError: "Vul je bedrijfsnaam in.",
      emailError: "Vul een geldig e-mailadres in.",
      messageError: "Vertel iets meer, minimaal 10 tekens.",
      rateLimited: "Je hebt het formulier net al een paar keer verstuurd. Probeer het over een paar minuten opnieuw.",
      failed: "Er ging iets mis bij het versturen. Probeer het later opnieuw.",
      notConfigured:
        "Het contactformulier is nog niet volledig geconfigureerd (ontbrekende e-mailinstellingen). Neem voorlopig rechtstreeks contact op.",
    },
    privacyNote: "",
  };
}

export function seedTheme(): Theme {
  return {
    colors: {
      accent: "#fece00",
      accentHover: "#ffda3d",
      onAccent: "#050505",
      ink: "#050505",
      ink2: "#0e0e0e",
      ink3: "#161616",
      line: "#232323",
      paper: "#ffffff",
      mist: "#f3f3f1",
    },
    typography: {
      displayFont: "archivo-condensed",
      displayWeight: "900",
      displayUppercase: true,
      headingScale: 100,
      headingLineHeight: 92,
      bodyFont: "inter",
      bodySize: 16,
      bodyLineHeight: 150,
    },
    shape: { buttonShape: "pill", buttonUppercase: false, corners: "large", shadows: "soft" },
    layout: { container: "normal", spacing: "normal", navStyle: "floating", formStyle: "filled" },
    brand: { logo: null, favicon: null, showGorilla: true },
  };
}
