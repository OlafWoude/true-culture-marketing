import type { Metadata } from "next";
import ClosingCta from "@/components/ClosingCta";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import Faq from "@/components/Faq";
import PageHero from "@/components/PageHero";
import { steps } from "@/lib/content";
import { CheckIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Werkwijze",
  description:
    "Van kennismaking tot optimalisatie: zo pakt True Culture Marketing leadgeneratie en het inplannen van afspraken aan.",
  alternates: { canonical: "/werkwijze" },
};

export default function WerkwijzePage() {
  return (
    <>
      <PageHero
        eyebrow="Werkwijze"
        title={
          <>
            Geen verrassingen. <span className="text-accent">Wel structuur.</span>
          </>
        }
        intro="Elke samenwerking doorloopt dezelfde vier fases. Zo weet je altijd waar je staat, wat we doen en wat je van ons kunt verwachten."
      />

      <section className="bg-mist py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 60}>
                <li className="grid gap-8 rounded-[2rem] bg-white p-8 sm:p-10 md:grid-cols-[auto_1fr_0.8fr] md:items-start md:gap-14 md:p-12">
                  <span className="display text-8xl text-ink md:text-[9rem]">{step.number}</span>
                  <div>
                    <h2 className="display text-5xl text-ink">{step.title}</h2>
                    <p className="mt-5 text-lg leading-relaxed text-ink/65">{step.detail}</p>
                  </div>
                  <div className="rounded-2xl bg-ink p-6 text-paper md:mt-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      Resultaat
                    </p>
                    <p className="mt-4 flex items-start gap-3 text-[17px] leading-snug">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {step.outcome}
                    </p>
                  </div>
                </li>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-paper py-28 md:py-36">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <FadeIn>
            <Eyebrow tone="light">Veelgestelde vragen</Eyebrow>
            <h2 className="display mt-6 text-6xl text-ink md:text-7xl">Goed om te weten</h2>
          </FadeIn>
          <FadeIn delay={100}>
            <Faq />
          </FadeIn>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
