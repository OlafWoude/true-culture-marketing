export type Service = {
  slug: string;
  tag: string;
  title: string;
  short: string;
  description: string;
  points: string[];
};

export const services: Service[] = [
  {
    slug: "leadgeneratie",
    tag: "Pijplijn",
    title: "B2B leadgeneratie",
    short: "Een gevulde pijplijn met beslissers die passen bij jouw ideale klantprofiel.",
    description:
      "We brengen jouw ideale klant scherp in kaart en benaderen de juiste beslissers met een persoonlijke, gerichte outbound-aanpak. Zo ontstaat er structureel nieuwe instroom, zonder dat jouw team zelf hoeft te prospecteren.",
    points: [
      "Ideaal klantprofiel en doelgroepselectie",
      "Persoonlijke outbound via telefoon, e-mail en LinkedIn",
      "Kwalificatie vóórdat een lead bij jou terechtkomt",
    ],
  },
  {
    slug: "afspraken-inplannen",
    tag: "Agenda",
    title: "Afspraken inplannen",
    short: "Wij zetten gekwalificeerde gesprekken direct in de agenda van jouw salesteam.",
    description:
      "Van eerste contact tot bevestigde afspraak. Wij nemen het volledige voortraject uit handen en plannen gesprekken met beslissers die echt interesse hebben. Jouw mensen hoeven alleen nog het gesprek te voeren.",
    points: [
      "Afspraken rechtstreeks in jullie agenda",
      "Heldere overdracht met context per afspraak",
      "Opvolging van no-shows en verzette afspraken",
    ],
  },
  {
    slug: "outbound-campagnes",
    tag: "Outreach",
    title: "Outbound campagnes",
    short: "Doordachte campagnes met een boodschap die bij jouw doelgroep landt.",
    description:
      "We bouwen multichannel campagnes rond één scherpe boodschap. We testen, meten en sturen bij, zodat elke volgende ronde beter presteert dan de vorige.",
    points: [
      "Boodschap en pitch afgestemd op de doelgroep",
      "Telefonie, e-mail en LinkedIn in één ritme",
      "Continu testen en bijsturen op resultaat",
    ],
  },
  {
    slug: "sales-strategie",
    tag: "Proces",
    title: "Sales strategie & proces",
    short: "Een salesproces dat herhaalbaar, meetbaar en schaalbaar is.",
    description:
      "We analyseren jouw huidige salesaanpak en bouwen samen een proces dat voorspelbaar resultaat oplevert: van doelgroep en propositie tot opvolging en rapportage.",
    points: [
      "Analyse van de huidige salesaanpak",
      "Heldere funnel van eerste contact tot deal",
      "Rapportage op de cijfers die ertoe doen",
    ],
  },
];

export const steps = [
  {
    number: "01",
    title: "Kennismaking",
    description:
      "We leren jouw bedrijf, propositie en doelen kennen en bepalen samen of we een match zijn.",
    detail:
      "In een vrijblijvend gesprek bespreken we wat je verkoopt, aan wie, en waar het nu wringt in je salesproces. Zo weten we allebei snel of een samenwerking zinvol is.",
    outcome: "Helder beeld van doelen en uitgangssituatie",
  },
  {
    number: "02",
    title: "Strategie",
    description:
      "We leggen het ideale klantprofiel, de kanalen en de boodschap vast. Helder en concreet.",
    detail:
      "We bepalen wie je ideale klant is, welke beslissers we benaderen, via welke kanalen en met welke boodschap. Ook spreken we af wanneer een lead gekwalificeerd is en hoe afspraken worden overgedragen.",
    outcome: "Vastgelegd klantprofiel, kanalen en pitch",
  },
  {
    number: "03",
    title: "Uitvoering",
    description:
      "We benaderen de juiste beslissers en plannen gekwalificeerde gesprekken in jouw agenda.",
    detail:
      "We gaan aan de slag met persoonlijke outreach via telefoon, e-mail en LinkedIn. Geïnteresseerde beslissers kwalificeren we op jouw criteria, waarna de afspraak direct in jullie agenda komt.",
    outcome: "Gekwalificeerde afspraken in de agenda",
  },
  {
    number: "04",
    title: "Optimalisatie",
    description:
      "We meten, rapporteren en sturen bij. Wat werkt bouwen we uit, wat niet werkt passen we aan.",
    detail:
      "Je krijgt doorlopend inzicht in wat we doen en wat het oplevert. Op basis van de cijfers en jouw feedback scherpen we doelgroep, boodschap en aanpak steeds verder aan.",
    outcome: "Een aanpak die elke ronde beter presteert",
  },
];

export const comparison = [
  {
    label: "Prospecteren en eerste contact",
    self: "Kost je salesteam dagelijks uren",
    us: "Volledig uit handen genomen",
  },
  {
    label: "Kwalificatie van leads",
    self: "Vaak pas tijdens het gesprek",
    us: "Vooraf, op basis van jouw criteria",
  },
  {
    label: "Afspraken in de agenda",
    self: "Wisselend en onvoorspelbaar",
    us: "Structureel en ingepland",
  },
  {
    label: "Inzicht in resultaat",
    self: "Versnipperd over mensen en tools",
    us: "Heldere rapportage per periode",
  },
  {
    label: "Focus van jouw team",
    self: "Verdeeld over alle fases",
    us: "Op het voeren van gesprekken en sluiten",
  },
];

export const marqueeItems = [
  "B2B leadgeneratie",
  "Afspraken inplannen",
  "Outbound campagnes",
  "Cold calling",
  "LinkedIn outreach",
  "E-mail outreach",
  "Sales strategie",
  "Leadkwalificatie",
];
