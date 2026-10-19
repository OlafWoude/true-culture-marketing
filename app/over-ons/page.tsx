import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/Button";
import FadeIn from "@/components/FadeIn";
import GorillaBackdrop from "@/components/GorillaBackdrop";

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "Maak kennis met True Culture Marketing: een no-nonsense B2B sales agency die resultaat boven alles stelt.",
  alternates: { canonical: "/over-ons" },
};

const values = [
  {
    title: "Resultaatgericht",
    description:
      "We praten niet in vage marketingtermen. We sturen op meetbare resultaten: afspraken, leads en omzet.",
  },
  {
    title: "No-nonsense",
    description:
      "Direct, eerlijk en zonder omhaal. We zeggen wat werkt en wat niet — ook als dat niet is wat je wilt horen.",
  },
  {
    title: "Partnerschap",
    description:
      "We werken niet los van jouw team, maar als verlengstuk ervan. Jouw doelen zijn ons uitgangspunt.",
  },
];

export default function OverOnsPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-line">
        <GorillaBackdrop className="absolute -right-20 top-0 h-[520px] w-[520px] text-paper" flip />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
              Over ons
            </span>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 className="text-display mt-4 max-w-2xl text-4xl text-paper sm:text-5xl">
              Sales is geen kunst. Het is een proces.
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p className="mt-6 max-w-xl text-paper/60">
              True Culture Marketing is opgericht vanuit de overtuiging dat
              B2B sales voorspelbaar en schaalbaar kan zijn, mits het goed
              wordt aangepakt. Geen losse acties, maar een doordacht proces
              dat structureel resultaat oplevert.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-ink-line bg-ink-raised">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <FadeIn>
            <h2 className="text-display max-w-xl text-3xl text-paper sm:text-4xl">
              Waar we voor staan
            </h2>
          </FadeIn>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {values.map((value, i) => (
              <FadeIn key={value.title} delay={i * 90}>
                <div>
                  <span className="block h-px w-8 bg-accent/70" />
                  <h3 className="mt-5 font-display text-lg text-paper">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-paper/60">{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <FadeIn>
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="text-display text-3xl text-paper sm:text-4xl">Hoe we werken</h2>
                <p className="mt-6 text-paper/60">
                  We geloven niet in standaardoplossingen. Elk salesproces
                  begint met een scherpe analyse van jouw doelgroep,
                  propositie en doelen. Pas daarna bepalen we de aanpak die
                  daar echt bij past.
                </p>
                <p className="mt-4 text-paper/60">
                  Benieuwd hoe dat er in de praktijk uitziet? Bekijk onze{" "}
                  <Link href="/werkwijze" className="text-accent hover:underline">
                    werkwijze
                  </Link>
                  .
                </p>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-ink-line bg-ink-raised">
                <GorillaBackdrop className="absolute inset-0 h-full w-full text-paper" />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-ink-raised">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <FadeIn>
            <h2 className="text-display text-2xl text-paper sm:text-3xl">
              Laten we kennismaken
            </h2>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="mt-8 flex justify-center">
              <Button href="/contact">Plan een kennismakingsgesprek</Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
