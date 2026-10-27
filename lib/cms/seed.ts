// The built-in website content in the CMS format: a recruitment funnel for new field marketers.
// Used to fill an empty database and as a fallback while no database is configured. Databases filled
// with an older version are brought up to date by a content migration (see drizzle/content).
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
  vacatures: "6a1b7c00-0000-4000-8000-000000000002",
  zoWerktHet: "6a1b7c00-0000-4000-8000-000000000003",
  overOns: "6a1b7c00-0000-4000-8000-000000000004",
  solliciteren: "6a1b7c00-0000-4000-8000-000000000005",
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
// One primary action everywhere: the short application form.
const applyFast = cta("Solliciteer in 2 minuten", pageLink(P.solliciteren));
const applyNow = cta("Solliciteer direct", pageLink(P.solliciteren));

function seo(title: string, description: string): Seo {
  return { title, description, ogTitle: "", ogDescription: "", ogImage: null, canonical: "", noindex: false };
}

function section(id: string, type: Section["type"], data: Section["data"]): Section {
  return { id, type, hidden: false, data };
}

const closing = (id: string) =>
  section(id, "closingCta", {
    title: "Zin om te",
    highlight: "beginnen?",
    text: "Solliciteer in 2 minuten. Geen cv, geen sollicitatiebrief: binnen 24 uur bellen we je.",
    cta: applyFast,
    showWatermark: true,
  });

// The questions candidates ask before they dare to apply, answered honestly.
const faqItems = [
  {
    question: "Heb ik ervaring nodig?",
    answer:
      "Nee. Je krijgt een training en je team helpt je op weg. Wat je wel meeneemt: energie, een open houding en zin om te leren.",
  },
  {
    question: "Hoeveel kan ik verdienen?",
    answer:
      "Je verdient per resultaat. Hoe meer mensen je enthousiast maakt, hoe meer je verdient, en er zit geen plafond op: €300+ per dag is mogelijk. In het eerste gesprek rekenen we samen uit wat realistisch is voor jou.",
  },
  {
    question: "Wat voor werk is het precies?",
    answer:
      "Je voert gesprekken met mensen: aan de deur, op straat, in winkelcentra of op events. Je vertelt over een product, dienst of organisatie van een van onze opdrachtgevers en helpt mensen om klant te worden.",
  },
  {
    question: "Voor welke opdrachtgevers werk ik?",
    answer: "We werken voor verschillende opdrachtgevers. Welke projecten er nu lopen, hoor je in het eerste gesprek.",
  },
  {
    question: "Waar ga ik werken?",
    answer:
      "In Groningen, Friesland en Drenthe. Je werkt met je team op wisselende locaties: in woonwijken, in winkelstraten en op evenementen.",
  },
  {
    question: "Kan ik dit als bijbaan doen?",
    answer:
      "Ja, ook naast je studie of een andere baan. Geef in je sollicitatie aan hoeveel dagen per week je beschikbaar bent, dan kijken we samen wat past.",
  },
  {
    question: "Wat als mensen nee zeggen?",
    answer:
      "Dat hoort erbij, ook bij de besten. Je leert om een nee niet persoonlijk op te vatten en je team houdt je scherp en gemotiveerd. Elk gesprek maakt je beter.",
  },
  {
    question: "Heb ik een cv nodig?",
    answer: "Nee. Je naam, telefoonnummer, e-mailadres en woonplaats zijn genoeg. De rest bespreken we in het eerste gesprek.",
  },
  {
    question: "Hoe snel hoor ik iets?",
    answer: "Binnen 24 uur bellen we je op het nummer dat je hebt opgegeven.",
  },
];

const faq = (id: string, background: "white" | "light") =>
  section(id, "faq", {
    eyebrow: "Veelgestelde vragen",
    title: "Goed om te weten",
    text: `<p>Staat je vraag er niet tussen? Stel hem gerust in het eerste belletje. <a href="/solliciteren">Solliciteer direct</a>, je zit nergens aan vast.</p>`,
    background,
    items: faqItems,
  });

export type SeedPage = { id: string; systemKey: string | null; doc: PageDoc };

export function seedPages(): SeedPage[] {
  const home: PageDoc = {
    title: "Home",
    slug: "",
    seo: seo(
      "Bijbaan of fulltime als promotor in Noord-Nederland | True Culture",
      "Bijbaan of fulltime als field marketeer en promotor in Groningen, Friesland of Drenthe. Verdien €300+ per dag, zonder ervaring of cv. Solliciteer in 2 minuten.",
    ),
    sections: [
      section("home-hero", "hero", {
        eyebrow: "Vacatures in Groningen, Friesland en Drenthe",
        title: "Verdien €300+",
        highlight: "per dag",
        highlightNewLine: true,
        intro:
          "Ontdek de mogelijkheden als field marketeer in Noord-Nederland. Je gaat met je team op pad, voert gesprekken aan de deur, op straat en op events, en verdient per resultaat. Geen ervaring nodig: wij leren je de rest.",
        primaryCta: applyFast,
        secondaryCta: cta("Bekijk de vacatures", pageLink(P.vacatures)),
        trustPoints: ["Geen cv nodig", "Geen ervaring nodig", "Binnen 24 uur een belletje"],
        showServiceTiles: true,
        tileLinkLabel: "Bekijk vacature",
        mobileCarousel: true,
        showWatermark: true,
      }),
      section("home-marquee", "marquee", {
        items: ["Bijbaan of fulltime", "Deur-aan-deur", "Straatwerving", "Events", "In-store", "Groningen", "Friesland", "Drenthe", "Teamspirit", "Doorgroeien"],
      }),
      section("home-intro", "introSplit", {
        eyebrow: "Het werk",
        title: "Wat doe je als field marketeer?",
        body:
          "<p>Als field marketeer ga je in gesprek met mensen: bij hen aan de deur, op straat of op een event. Je vertelt over een product, dienst of organisatie van een van onze opdrachtgevers en je helpt mensen om klant te worden.</p>" +
          "<p>Je werkt nooit alleen. Je gaat met je team op pad, je krijgt coaching en samen vieren jullie de successen. Wat je verdient, bepaal je met je eigen inzet.</p>",
        cta: applyNow,
        cardTitle: "Wat je bij ons krijgt",
        cardItems: [
          "Verdienen per resultaat, zonder plafond",
          "Een training vanaf je eerste dag",
          "Een hecht team om je heen",
          "Kans om door te groeien naar teamleider",
        ],
      }),
      section("home-services", "servicesOverview", {
        eyebrow: "Vacatures",
        title: "Kies het werk dat bij je past",
        intro:
          "Aan de deur, op straat of op een event: overal werk je in een team en verdien je per resultaat. Heb je een voorkeur? Vertel het ons in je sollicitatie.",
        linkLabel: "Solliciteer direct",
        mobileCarousel: true,
      }),
      section("home-comparison", "comparison", {
        eyebrow: "Waarom True Culture",
        title: "Meer dan een gewone bijbaan",
        intro:
          "Bij een gewone bijbaan krijg je een vast uurloon. Bij True Culture bepaal je zelf wat je verdient, leer je skills waar je je hele leven iets aan hebt en werk je met een team dat je beter maakt.",
        layout: "split",
        background: "light",
        selfLabel: "Gewone bijbaan",
        usAccent: "True",
        usLabel: "Culture",
        rows: [
          { label: "Verdiensten", self: "Vast uurloon, hoe hard je ook werkt", us: "Verdienen per resultaat: €300+ per dag is mogelijk" },
          { label: "Ervaring", self: "Vaak ervaring of een diploma nodig", us: "Geen ervaring nodig, je krijgt een training" },
          { label: "Werkdag", self: "Elke dag dezelfde plek en hetzelfde werk", us: "Steeds andere locaties, gesprekken en mensen" },
          { label: "Sfeer", self: "Je collega's zie je alleen in de pauze", us: "Elke dag samen met je team op pad" },
          { label: "Groei", self: "Weinig kans om door te groeien", us: "Doorgroeien naar teamleider is mogelijk" },
        ],
        mobileCarousel: true,
      }),
      section("home-steps", "steps", {
        eyebrow: "Solliciteren",
        title: "Zo ga je aan de slag",
        cta: cta("Zo werkt het", pageLink(P.zoWerktHet)),
        items: [
          { title: "Solliciteer in 2 minuten", description: "Laat je naam, telefoonnummer en woonplaats achter. Een cv of motivatiebrief is niet nodig." },
          { title: "We bellen je binnen 24 uur", description: "We vertellen hoe het werk eruitziet en wat je kunt verdienen, en beantwoorden al je vragen." },
          { title: "Kennismaken", description: "We spreken af en kijken samen of het werk bij je past. Eerlijk en zonder verplichtingen." },
          { title: "Training en je eerste dag", description: "Je krijgt een training en gaat daarna samen met je team het veld in." },
        ],
        mobileCarousel: true,
      }),
      section("home-testimonials", "testimonials", {
        eyebrow: "Ervaringen",
        title: "Dit zegt ons team",
        intro: "Echte verhalen van collega's die je voorgingen.",
        background: "white",
        mobileCarousel: true,
      }),
      faq("home-faq", "light"),
      closing("home-closing"),
    ],
  };

  const vacatures: PageDoc = {
    title: "Vacatures",
    slug: "vacatures",
    seo: seo(
      "Vacatures promotor en field marketeer in Noord-Nederland",
      "Bijbaan of fulltime: deur-aan-deur, straatwerving of events in Groningen, Friesland en Drenthe. Verdien per resultaat, geen ervaring nodig.",
    ),
    sections: [
      section("vacatures-hero", "pageHero", {
        eyebrow: "Vacatures",
        title: "Kies jouw plek",
        highlight: "in het veld",
        intro:
          "Aan de deur, op straat of op events in Groningen, Friesland en Drenthe. Overal werk je in een team, leer je mensen enthousiast maken en verdien je per resultaat.",
        showWatermark: true,
      }),
      section("vacatures-list", "servicesDetailed", { pointsTitle: "Wat je doet", mobileCarousel: true }),
      section("vacatures-usps", "valuesGrid", {
        eyebrow: "Wat je krijgt",
        title: "Waarom bij ons werken?",
        items: [
          { title: "Verdienen zonder plafond", text: "Je verdient per resultaat, dus jouw inzet bepaalt wat je verdient. €300+ per dag is mogelijk." },
          { title: "Training en coaching", text: "Je begint met een training en krijgt onderweg tips van ervaren collega's. Zo word je elke week beter in gesprekken voeren." },
          { title: "Een team dat je beter maakt", text: "Je gaat samen op pad, helpt elkaar en viert samen de successen." },
          { title: "Skills voor later", text: "Overtuigen, presenteren en tegen een stootje kunnen: daar heb je je hele carrière plezier van." },
        ],
        secondaryCta: cta("Zo werkt het", pageLink(P.zoWerktHet)),
        primaryCta: applyNow,
        mobileCarousel: true,
      }),
      closing("vacatures-closing"),
    ],
  };

  const zoWerktHet: PageDoc = {
    title: "Zo werkt het",
    slug: "zo-werkt-het",
    seo: seo(
      "Zo werkt solliciteren",
      "Van sollicitatie tot eerste werkdag: zo werkt solliciteren bij True Culture Marketing. Geen cv nodig en binnen 24 uur een belletje.",
    ),
    sections: [
      section("zo-werkt-het-hero", "pageHero", {
        eyebrow: "Zo werkt het",
        title: "Van sollicitatie",
        highlight: "tot eerste werkdag",
        intro:
          "Solliciteren bij True Culture is simpel. Geen cv en geen lange formulieren: binnen 24 uur heb je ons aan de lijn.",
        showWatermark: true,
      }),
      section("zo-werkt-het-steps", "stepsDetailed", {
        resultLabel: "Voor jou",
        items: [
          {
            title: "Solliciteer in 2 minuten",
            detail:
              "Vul het korte formulier in met je naam, telefoonnummer, e-mailadres, woonplaats en beschikbaarheid. Een cv of motivatiebrief is niet nodig.",
            outcome: "Je sollicitatie is binnen, zonder gedoe",
          },
          {
            title: "We bellen je binnen 24 uur",
            detail:
              "We vertellen je hoe het werk eruitziet, hoe je verdient en welke projecten er lopen. Je kunt al je vragen stellen.",
            outcome: "Je weet precies waar je aan begint",
          },
          {
            title: "Kennismaking",
            detail: "We spreken af om kennis te maken en kijken samen of het werk en het team bij je passen.",
            outcome: "Een eerlijke keuze, voor jou en voor ons",
          },
          {
            title: "Training en je eerste dag",
            detail:
              "Je krijgt een training over gesprekken voeren en over het project waar je aan werkt. Daarna ga je met je team het veld in.",
            outcome: "Je eerste dag in het veld",
          },
        ],
        mobileCarousel: true,
      }),
      section("zo-werkt-het-day", "numberedCards", {
        eyebrow: "Een dag in het veld",
        title: "Zo ziet je werkdag eruit",
        background: "white",
        items: [
          { title: "Samen van start", text: "Je begint de dag met je team. Je hoort waar jullie naartoe gaan en wat het plan voor vandaag is." },
          { title: "In gesprek", text: "Je voert gesprekken aan de deur, op straat of op een event. Niet iedereen zegt ja, en dat is normaal." },
          { title: "Samen afsluiten", text: "Aan het eind van de dag kijk je met je team terug: wat ging goed, wat kan beter en wat heb je verdiend?" },
        ],
        mobileCarousel: true,
      }),
      faq("zo-werkt-het-faq", "light"),
      closing("zo-werkt-het-closing"),
    ],
  };

  const overOns: PageDoc = {
    title: "Over ons",
    slug: "over-ons",
    seo: seo(
      "Over ons",
      "True Culture Marketing is een face-to-face field marketingbureau in Noord-Nederland. We werven klanten voor verschillende opdrachtgevers, met een team waarin cultuur voorop staat.",
    ),
    sections: [
      section("over-hero", "pageHero", {
        eyebrow: "Over ons",
        title: "De naam zegt het al:",
        highlight: "cultuur voorop.",
        intro:
          "True Culture Marketing is een face-to-face field marketingbureau uit Noord-Nederland. We werven klanten voor verschillende opdrachtgevers, met een team dat elkaar scherp houdt en elkaars successen viert.",
        showWatermark: true,
      }),
      section("over-story", "storySplit", {
        eyebrow: "Ons verhaal",
        title: "Gebouwd op mensen",
        body:
          "<p>Field marketing draait om gesprekken. Een goed gesprek voer je alleen als je energie hebt, als je weet waar je over praat en als je je gesteund voelt door je team.</p>" +
          "<p>Daarom investeren we in onze mensen: in training, in coaching en in een sfeer waarin je jezelf kunt zijn. Wie hard werkt, verdient bij ons goed en krijgt de ruimte om door te groeien.</p>",
        image: null,
      }),
      section("over-values", "valuesGrid", {
        eyebrow: "Waar we voor staan",
        title: "Onze principes",
        items: [
          { title: "Eerlijk", text: "We zijn eerlijk tegen de mensen die we spreken en tegen elkaar. Geen mooie praatjes, wel duidelijke afspraken." },
          { title: "Samen", text: "Je staat er nooit alleen voor. We gaan samen op pad, helpen elkaar en vieren samen de successen." },
          { title: "Groei", text: "Iedereen begint ergens. Met training en coaching word je elke week beter, en wie wil, kan doorgroeien." },
          { title: "Plezier", text: "Hard werken mag leuk zijn. Een goede sfeer in het team is de basis van alles wat we doen." },
        ],
        secondaryCta: cta("Bekijk de vacatures", pageLink(P.vacatures)),
        primaryCta: applyNow,
        mobileCarousel: true,
      }),
      closing("over-closing"),
    ],
  };

  const solliciteren: PageDoc = {
    title: "Solliciteren",
    slug: "solliciteren",
    seo: seo(
      "Solliciteer in 2 minuten",
      "Solliciteer voor een bijbaan of fulltime baan als field marketeer bij True Culture Marketing. Geen cv nodig: vul je gegevens in en we bellen je binnen 24 uur.",
    ),
    sections: [
      section("solliciteren-hero", "contactHero", {
        eyebrow: "Solliciteren",
        title: "Solliciteer in",
        highlight: "2 minuten",
        intro:
          "Laat je gegevens achter en we bellen je binnen 24 uur. In dat gesprek hoor je alles over het werk en wat je kunt verdienen.",
        bullets: ["Geen cv of motivatiebrief nodig", "Geen ervaring nodig", "Binnen 24 uur een belletje"],
        whatsappLabel: "Eerst een vraag? App ons",
        formTitle: "Jouw gegevens",
        formIntro: "Het duurt maar 2 minuten en je zit nergens aan vast.",
      }),
      section("solliciteren-next", "numberedCards", {
        eyebrow: "Na je sollicitatie",
        title: "Zo gaat het verder",
        background: "light",
        items: [
          { title: "We bellen je binnen 24 uur", text: "Houd je telefoon bij de hand. We vertellen je alles over het werk en beantwoorden je vragen." },
          { title: "Kennismaking", text: "We spreken af en kijken samen of het werk bij je past." },
          { title: "Training en je eerste dag", text: "Je krijgt een training en gaat met je team het veld in." },
        ],
        mobileCarousel: true,
      }),
      faq("solliciteren-faq", "white"),
    ],
  };

  const privacyItems = [
    [
      "Welke gegevens verwerken we",
      "Als je solliciteert, verwerken we de gegevens die je zelf invult: je naam, telefoonnummer, e-mailadres, woonplaats, beschikbaarheid en eventueel je bericht. Ook slaan we op via welke campagne of website je bij ons terechtkwam, zodat we weten welke kanalen werken.",
    ],
    [
      "Waarvoor gebruiken we ze",
      "We gebruiken je gegevens alleen voor je sollicitatie: om contact met je op te nemen, een kennismaking te plannen en te kijken of het werk bij je past. We delen ze niet met onze opdrachtgevers of andere derden, tenzij de wet ons daartoe verplicht. Voor het bewaren van de gegevens en het versturen van e-mail werken we met dienstverleners die je gegevens alleen in onze opdracht verwerken.",
    ],
    [
      "Hoe lang bewaren we ze",
      "We bewaren je sollicitatie tot uiterlijk vier weken na afloop van de sollicitatieprocedure. Opgeslagen sollicitaties worden na twee maanden automatisch verwijderd. Willen we je gegevens langer bewaren voor een toekomstige vacature, dan vragen we je eerst om toestemming (maximaal een jaar). Kom je bij ons werken, dan nemen we je gegevens op in je personeelsdossier.",
    ],
    [
      "Cookies",
      "Deze website gebruikt geen tracking- of marketingcookies. Kom je via een advertentie of link binnen, dan onthoudt je browser tijdelijk (alleen zolang het tabblad open is) via welke campagne je kwam. Die informatie sturen we alleen mee als je solliciteert.",
    ],
    [
      "Jouw rechten",
      "Je hebt het recht om je gegevens in te zien, te laten corrigeren of te laten verwijderen. Neem daarvoor contact met ons op. Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.",
    ],
    ["Wijzigingen", "We kunnen deze privacyverklaring aanpassen. De meest actuele versie staat altijd op deze pagina."],
  ];

  const privacy: PageDoc = {
    title: "Privacyverklaring",
    slug: "privacy",
    seo: seo("Privacyverklaring", "Lees hoe True Culture Marketing omgaat met de gegevens van sollicitanten en bezoekers."),
    sections: [
      section("privacy-hero", "pageHero", {
        eyebrow: "Privacy",
        title: "Privacyverklaring",
        highlight: "",
        intro:
          "True Culture Marketing gaat zorgvuldig om met je persoonsgegevens. Hieronder lees je welke gegevens we verwerken als je solliciteert, waarom we dat doen en hoe lang we ze bewaren.",
        showWatermark: true,
      }),
      section("privacy-cards", "textCards", {
        items: privacyItems.map(([title, text]) => ({ title, body: `<p>${text}</p>` })),
      }),
    ],
  };

  return [
    { id: P.home, systemKey: "home", doc: home },
    { id: P.vacatures, systemKey: null, doc: vacatures },
    { id: P.zoWerktHet, systemKey: null, doc: zoWerktHet },
    { id: P.overOns, systemKey: null, doc: overOns },
    { id: P.solliciteren, systemKey: null, doc: solliciteren },
    { id: P.privacy, systemKey: null, doc: privacy },
  ];
}

const roles: Omit<ServiceDoc, "image" | "cta">[] = [
  {
    title: "Deur-aan-deur",
    anchor: "deur-aan-deur",
    tag: "In woonwijken",
    short: "Je belt aan bij mensen thuis en vertelt over het aanbod van onze opdrachtgever. Persoonlijk en één op één.",
    description:
      "Als field marketeer deur-aan-deur ga je met je team naar een woonwijk. Je belt aan, maakt een praatje en vertelt over een product, dienst of organisatie van een van onze opdrachtgevers. Je leert snel contact maken en mensen eerlijk informeren, zodat ze zelf een goede keuze maken.",
    points: ["Gesprekken voeren bij mensen thuis", "Met je team op pad in Noord-Nederland", "Verdienen per resultaat, zonder plafond"],
  },
  {
    title: "Straatwerving",
    anchor: "straatwerving",
    tag: "Op straat",
    short: "In winkelstraten, winkelcentra en op stations spreek je voorbijgangers aan. Elke dag een andere plek.",
    description:
      "Bij straatwerving sta je op drukke plekken: in winkelstraten, in winkelcentra of op stations. Je spreekt voorbijgangers aan, maakt ze nieuwsgierig en vertelt over het aanbod van onze opdrachtgever. Je werkt met een team om je heen en elke dag ziet er weer anders uit.",
    points: ["Voorbijgangers aanspreken en enthousiast maken", "Steeds wisselende locaties", "Verdienen per resultaat, zonder plafond"],
  },
  {
    title: "Events en in-store",
    anchor: "events-en-in-store",
    tag: "Op events",
    short: "Op evenementen, beurzen en in winkels sta je met een stand en vertel je bezoekers over het aanbod.",
    description:
      "Op evenementen, beurzen en in winkels sta je met een stand van een van onze opdrachtgevers. Bezoekers komen naar je toe of jij stapt op ze af. Je geeft uitleg, beantwoordt vragen en helpt mensen om klant te worden. Ideaal als je houdt van drukte en afwisseling.",
    points: ["Bezoekers ontvangen bij een stand", "Werken op evenementen en in winkels", "Verdienen per resultaat, zonder plafond"],
  },
  {
    title: "Teamleider",
    anchor: "teamleider",
    tag: "Doorgroeien",
    short: "Haal je mooie resultaten en help je graag anderen? Dan kun je doorgroeien naar teamleider.",
    description:
      "Ben je een tijd bij ons en haal je goede resultaten? Dan kun je doorgroeien naar teamleider. Je coacht je eigen team, helpt nieuwe collega's op weg en zorgt dat iedereen gemotiveerd het veld in gaat. Zo bouw je ervaring op in leidinggeven die je de rest van je carrière meeneemt.",
    points: ["Je eigen team coachen", "Nieuwe collega's inwerken", "Ervaring opdoen in leidinggeven"],
  },
];

export function seedServices(): { id: string; doc: ServiceDoc }[] {
  return roles.map((role, i) => ({
    id: serviceIds[i],
    doc: { ...role, points: [...role.points], image: null, cta: applyNow },
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
      "Verdien €300+ per dag als field marketeer in Groningen, Friesland of Drenthe. Geen ervaring of cv nodig: solliciteer in 2 minuten en we bellen je binnen 24 uur.",
    ogImage: null,
    allowIndexing: true,
    company: { legalName: "", kvk: "", vat: "", address: "" },
    contact: { email: "", phone: "", whatsapp: "" },
    socials: [],
  };
}

export function seedNavigation(): Navigation {
  const item = (label: string, pageId: string) => ({ label, link: pageLink(pageId), visible: true, children: [] });
  return {
    items: [item("Vacatures", P.vacatures), item("Zo werkt het", P.zoWerktHet), item("Over ons", P.overOns)],
    cta: {
      label: "Solliciteer direct",
      mobileLabel: "Solliciteer in 2 minuten",
      link: pageLink(P.solliciteren),
      visible: true,
      mobileSticky: true,
    },
  };
}

export function seedFooter(): Footer {
  const link = (label: string, pageId: string) => ({ label, link: pageLink(pageId), visible: true });
  return {
    text: "Face-to-face field marketing in Groningen, Friesland en Drenthe. We werven klanten voor verschillende opdrachtgevers.",
    links: [
      link("Home", P.home),
      link("Vacatures", P.vacatures),
      link("Zo werkt het", P.zoWerktHet),
      link("Over ons", P.overOns),
      link("Solliciteren", P.solliciteren),
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
    retentionDays: 60,
    labels: {
      name: "Naam",
      namePlaceholder: "Je voor- en achternaam",
      phone: "Telefoonnummer",
      phonePlaceholder: "06 12345678",
      email: "E-mailadres",
      emailPlaceholder: "naam@voorbeeld.nl",
      city: "Woonplaats",
      cityPlaceholder: "Bijv. Groningen",
      availability: "Hoeveel dagen per week wil je werken?",
      availabilityPlaceholder: "Kies wat bij je past",
      message: "Wil je nog iets kwijt? (optioneel)",
      messagePlaceholder: "Bijv. je voorkeur voor deur-aan-deur, straat of events.",
      submit: "Verstuur sollicitatie",
      sending: "Versturen…",
    },
    availabilityOptions: ["1 à 2 dagen per week", "3 à 4 dagen per week", "Fulltime", "Weet ik nog niet"],
    messages: {
      successTitle: "Gelukt!",
      success: "Je sollicitatie is binnen. Binnen 24 uur bellen we je op het nummer dat je hebt opgegeven. Houd je telefoon bij de hand!",
      invalid: "Controleer de gemarkeerde velden.",
      nameError: "Vul je naam in.",
      phoneError: "Vul een geldig telefoonnummer in, bijv. 06 12345678.",
      emailError: "Vul een geldig e-mailadres in.",
      cityError: "Vul je woonplaats in.",
      availabilityError: "Kies hoeveel dagen je wilt werken.",
      rateLimited: "Je hebt het formulier net al een paar keer verstuurd. Probeer het over een paar minuten opnieuw.",
      failed: "Er ging iets mis bij het versturen. Probeer het later opnieuw.",
      notConfigured: "Het sollicitatieformulier is nog niet volledig ingesteld. Probeer het later opnieuw.",
    },
    privacyNote: `<p>We gebruiken je gegevens alleen voor je sollicitatie. Lees onze <a href="/privacy">privacyverklaring</a>.</p>`,
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
