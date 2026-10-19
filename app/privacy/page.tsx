import type { Metadata } from "next";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Lees hoe True Culture Marketing omgaat met persoonsgegevens.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "Welke gegevens verzamelen we",
    text: "Wanneer je het contactformulier invult, verwerken we de gegevens die je zelf invoert: je naam, bedrijfsnaam, e-mailadres en de inhoud van je bericht.",
  },
  {
    title: "Waarvoor gebruiken we deze gegevens",
    text: "We gebruiken deze gegevens uitsluitend om contact met je op te nemen naar aanleiding van je aanvraag. We delen ze niet met derden, tenzij dat nodig is om aan een wettelijke verplichting te voldoen. Voor het versturen van het formulier maken we gebruik van een e-maildienst die de gegevens alleen in onze opdracht verwerkt.",
  },
  {
    title: "Bewaartermijn",
    text: "We bewaren je gegevens niet langer dan nodig is om je aanvraag af te handelen, tenzij we wettelijk verplicht zijn ze langer te bewaren.",
  },
  {
    title: "Jouw rechten",
    text: "Je hebt het recht om je gegevens in te zien, te laten corrigeren of te laten verwijderen. Neem hiervoor contact met ons op via het contactformulier.",
  },
  {
    title: "Cookies",
    text: "Deze website plaatst geen tracking- of marketingcookies.",
  },
  {
    title: "Wijzigingen",
    text: "We kunnen deze privacyverklaring aanpassen. De meest actuele versie staat altijd op deze pagina.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title="Privacyverklaring"
        intro="True Culture Marketing gaat zorgvuldig om met je persoonsgegevens. Hieronder lees je welke gegevens we verwerken en waarom."
      />
      <section className="bg-mist py-24 md:py-32">
        <div className="mx-auto max-w-3xl space-y-4 px-6">
          {sections.map((s) => (
            <div key={s.title} className="rounded-[1.5rem] bg-white p-8 md:p-10">
              <h2 className="text-xl font-semibold text-ink">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-ink/65">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
