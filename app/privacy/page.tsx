import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacyverklaring van True Culture Marketing.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <FadeIn>
        <span className="text-sm font-semibold uppercase tracking-widest text-accent">
          Privacy
        </span>
        <h1 className="text-display mt-4 text-4xl text-paper">Privacyverklaring</h1>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="prose-invert mt-10 space-y-8 text-sm leading-relaxed text-paper/70">
          <p>
            True Culture Marketing respecteert de privacy van bezoekers van
            deze website en gebruikers van het contactformulier. Deze
            privacyverklaring legt uit welke gegevens wij verzamelen, waarom,
            en hoe we ermee omgaan.
          </p>

          <div>
            <h2 className="font-display text-xl text-paper">Welke gegevens verzamelen we</h2>
            <p className="mt-3">
              Wanneer je het contactformulier op deze website invult,
              verzamelen we de gegevens die je zelf invoert: naam,
              bedrijfsnaam, e-mailadres en de inhoud van je bericht. Deze
              gegevens worden uitsluitend gebruikt om contact met je op te
              nemen naar aanleiding van je aanvraag.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-paper">Hoe gebruiken we deze gegevens</h2>
            <p className="mt-3">
              De gegevens uit het contactformulier worden per e-mail naar
              True Culture Marketing verstuurd en gebruikt om je aanvraag te
              beantwoorden. We delen deze gegevens niet met derden, tenzij
              dit nodig is om aan een wettelijke verplichting te voldoen.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-paper">Bewaartermijn</h2>
            <p className="mt-3">
              We bewaren de gegevens uit het contactformulier niet langer dan
              noodzakelijk is om je aanvraag af te handelen, tenzij we
              wettelijk verplicht zijn ze langer te bewaren.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-paper">Jouw rechten</h2>
            <p className="mt-3">
              Je hebt het recht om inzage te vragen in de gegevens die we van
              je hebben, deze te laten corrigeren of te laten verwijderen.
              Neem hiervoor contact met ons op via het contactformulier.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-paper">Cookies</h2>
            <p className="mt-3">
              Deze website gebruikt geen tracking- of marketingcookies. Er
              worden geen gegevens verzameld voor advertentiedoeleinden.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-paper">Wijzigingen</h2>
            <p className="mt-3">
              We kunnen deze privacyverklaring van tijd tot tijd aanpassen.
              De meest actuele versie is altijd op deze pagina te vinden.
            </p>
          </div>

          <p className="text-paper/40">Laatst bijgewerkt: {new Date().toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </FadeIn>
    </section>
  );
}
