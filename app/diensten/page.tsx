import type { Metadata } from "next";
import ClosingCta from "@/components/ClosingCta";
import Comparison from "@/components/Comparison";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";
import PageHero from "@/components/PageHero";
import { services } from "@/lib/content";
import { CheckIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Diensten",
  description:
    "B2B leadgeneratie, afspraken inplannen, outbound campagnes en sales strategie. Bekijk hoe True Culture Marketing jouw salesteam ontlast.",
  alternates: { canonical: "/diensten" },
};

export default function DienstenPage() {
  return (
    <>
      <PageHero
        eyebrow="Diensten"
        title={
          <>
            Sales-ondersteuning <span className="text-accent">die rendeert</span>
          </>
        }
        intro="Zet één dienst in of laat ons het complete voortraject verzorgen. Elke dienst is afgestemd op jouw doelgroep, propositie en doelen."
      />

      <div className="bg-mist py-6 md:py-10">
        {services.map((s, i) => (
          <section
            key={s.slug}
            id={s.slug}
            className="mx-auto max-w-[1240px] scroll-mt-28 px-3 py-3 sm:px-6"
          >
            <FadeIn>
              <div
                className={`grid gap-10 rounded-[2.5rem] p-8 sm:p-12 md:p-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 ${
                  i % 2 === 0 ? "bg-white" : "grain overflow-hidden bg-ink"
                }`}
              >
                {i % 2 === 1 && (
                  <GorillaMark className="absolute -bottom-16 -left-16 w-[520px] text-white/[0.035]" />
                )}
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <span
                      className={`display text-2xl ${i % 2 === 0 ? "text-ink/25" : "text-paper/25"}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      {s.tag}
                    </span>
                  </div>
                  <h2
                    className={`display mt-6 text-6xl md:text-7xl ${
                      i % 2 === 0 ? "text-ink" : "text-paper"
                    }`}
                  >
                    {s.title}
                  </h2>
                  <p
                    className={`mt-6 max-w-xl text-lg leading-relaxed ${
                      i % 2 === 0 ? "text-ink/65" : "text-paper/65"
                    }`}
                  >
                    {s.description}
                  </p>
                </div>

                <div
                  className={`relative self-start rounded-[1.75rem] p-8 ${
                    i % 2 === 0 ? "bg-mist" : "border border-white/[0.07] bg-ink-2"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      i % 2 === 0 ? "text-ink/50" : "text-paper/50"
                    }`}
                  >
                    Wat je krijgt
                  </p>
                  <ul className="mt-6 space-y-5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-4">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                        <span
                          className={`text-[17px] leading-snug ${
                            i % 2 === 0 ? "text-ink" : "text-paper"
                          }`}
                        >
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          </section>
        ))}
      </div>

      <section className="bg-paper py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="max-w-3xl">
              <Eyebrow tone="light">Waarom uitbesteden</Eyebrow>
              <h2 className="display mt-6 text-6xl text-ink md:text-7xl">
                Zelf doen of uitbesteden?
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-ink/65">
                Het voortraject vraagt tijd, discipline en een vaste
                aanpak. Zo verhoudt zelf doen zich tot werken met True
                Culture.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="mt-16">
              <Comparison />
            </div>
          </FadeIn>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
