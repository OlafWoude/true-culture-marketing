import Link from "next/link";
import Button from "@/components/Button";
import ClosingCta from "@/components/ClosingCta";
import Comparison from "@/components/Comparison";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import Faq from "@/components/Faq";
import GorillaMark from "@/components/GorillaMark";
import Marquee from "@/components/Marquee";
import { marqueeItems, services, steps } from "@/lib/content";
import { ArrowRightIcon, CheckIcon } from "@/lib/icons";

const principles = [
  "Gesprekken met beslissers, niet met poortwachters",
  "Kwaliteit van een afspraak boven aantallen",
  "Transparant in aanpak, voortgang en resultaat",
  "Persoonlijke benadering, nooit massaal",
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <div className="bg-mist">
        <section className="grain overflow-hidden rounded-b-[2.5rem] bg-ink md:rounded-b-[3.5rem]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(254,206,0,0.08),transparent_55%)]" />
          <GorillaMark className="absolute left-1/2 top-24 w-[1150px] max-w-none -translate-x-[42%] text-white/[0.045]" />

          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-40 text-center md:pb-28 md:pt-52">
            <FadeIn>
              <Eyebrow>B2B sales agency</Eyebrow>
            </FadeIn>
            <FadeIn delay={80}>
              <h1 className="display mx-auto mt-8 text-[3.6rem] text-paper sm:text-8xl md:text-[8.5rem]">
                Meer afspraken
                <span className="block text-accent">met beslissers</span>
              </h1>
            </FadeIn>
            <FadeIn delay={160}>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-paper/65 md:text-xl">
                True Culture Marketing genereert B2B-leads en plant
                gekwalificeerde afspraken in. Zo richt jouw salesteam zich op
                waar het om draait: deals sluiten.
              </p>
            </FadeIn>
            <FadeIn delay={240}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button href="/contact" arrow>
                  Plan een kennismakingsgesprek
                </Button>
                <Button href="/diensten" variant="outline-light">
                  Bekijk onze diensten
                </Button>
              </div>
            </FadeIn>

            <div className="mt-20 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4 md:mt-28">
              {services.map((s, i) => (
                <FadeIn key={s.slug} delay={300 + i * 70} className={i === 1 || i === 2 ? "lg:mt-10" : ""}>
                  <Link
                    href={`/diensten#${s.slug}`}
                    className="group flex h-full flex-col rounded-3xl border border-white/[0.07] bg-ink-2/80 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-white/20"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                      {s.tag}
                    </span>
                    <span className="display mt-5 text-[2rem] text-paper">{s.title}</span>
                    <span className="mt-3 text-sm leading-relaxed text-paper/55">{s.short}</span>
                    <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-paper/70 transition-colors group-hover:text-paper">
                      Meer weten
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Marquee */}
        <Marquee items={marqueeItems} />

        {/* Intro */}
        <section className="mx-auto max-w-6xl px-6 pb-28 pt-12 md:pb-36">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <FadeIn>
              <Eyebrow tone="light">Over True Culture</Eyebrow>
              <h2 className="display mt-6 text-6xl text-ink md:text-7xl">
                Jouw salesteam verdient betere gesprekken
              </h2>
              <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/70">
                <p>
                  Prospecteren, bellen, opvolgen en plannen: het voortraject
                  slokt tijd op die je salesteam liever in klantgesprekken
                  steekt. Daar komen wij in beeld.
                </p>
                <p>
                  Wij benaderen de juiste beslissers, kwalificeren de interesse
                  en zetten de afspraak in jullie agenda. Geen losse acties,
                  maar een doordacht proces dat voorspelbaar nieuwe kansen
                  oplevert.
                </p>
              </div>
              <div className="mt-9">
                <Button href="/over-ons" variant="outline-dark" arrow>
                  Meer over ons
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={120}>
              <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 sm:p-12">
                <GorillaMark className="absolute -bottom-10 -right-16 w-[440px] text-accent/[0.12]" />
                <p className="relative text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  Waar we voor staan
                </p>
                <ul className="relative mt-8 space-y-6">
                  {principles.map((p) => (
                    <li key={p} className="flex items-start gap-4">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
                        <CheckIcon className="h-4 w-4" />
                      </span>
                      <span className="text-lg leading-snug text-paper">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>

      {/* Services */}
      <section className="bg-paper py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center">
              <Eyebrow tone="light">Diensten</Eyebrow>
              <h2 className="display mt-6 text-6xl text-ink md:text-[5.5rem]">
                Van eerste contact tot afspraak in de agenda
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-ink/65">
                Zet één dienst in of laat ons het complete voortraject
                verzorgen. Altijd afgestemd op jouw doelgroep en doelen.
              </p>
            </div>
          </FadeIn>
        </div>

        <div className="mx-auto mt-16 max-w-[1240px] px-3 sm:px-6">
          <div className="grain overflow-hidden rounded-[2.5rem] bg-ink p-4 sm:p-6 md:p-8">
            <GorillaMark className="absolute -right-40 top-1/2 w-[900px] max-w-none -translate-y-1/2 text-white/[0.03]" />
            <div className="relative grid gap-4 md:grid-cols-2">
              {services.map((s, i) => (
                <FadeIn key={s.slug} delay={i * 70}>
                  <article className="flex h-full flex-col rounded-[1.75rem] border border-white/[0.07] bg-ink-2 p-8 md:p-10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                        {s.tag}
                      </span>
                      <span className="display text-2xl text-paper/20">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="display mt-6 text-5xl text-paper">{s.title}</h3>
                    <p className="mt-4 leading-relaxed text-paper/60">{s.description}</p>
                    <ul className="mt-6 space-y-2.5">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-start gap-3 text-[15px] text-paper/80">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/diensten#${s.slug}`}
                      className="group mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-paper"
                    >
                      Lees meer
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-mist py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
              <div>
                <Eyebrow tone="light">Waarom uitbesteden</Eyebrow>
                <h2 className="display mt-6 text-6xl text-ink md:text-7xl">
                  Jouw team aan tafel, wij aan de voorkant
                </h2>
              </div>
              <p className="text-lg leading-relaxed text-ink/65 lg:pb-2">
                Een salesteam is het meest waardevol in het gesprek met de
                klant. Door het voortraject uit te besteden, besteedt jouw
                team zijn tijd daar waar het het verschil maakt.
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

      {/* Process */}
      <section className="bg-paper py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow tone="light">Werkwijze</Eyebrow>
                <h2 className="display mt-6 text-6xl text-ink md:text-7xl">
                  Zo pakken we het aan
                </h2>
              </div>
              <Button href="/werkwijze" variant="outline-dark" arrow>
                Bekijk onze werkwijze
              </Button>
            </div>
          </FadeIn>

          <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 70}>
                <li className="flex h-full flex-col rounded-[1.75rem] bg-mist p-8">
                  <span className="display text-7xl text-ink">{step.number}</span>
                  <span className="mt-6 h-1 w-10 rounded-full bg-accent" />
                  <h3 className="mt-6 text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink/60">{step.description}</p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </div>
      </section>

      {/* Cases */}
      <section className="bg-paper pb-28 md:pb-36">
        <div className="mx-auto max-w-[1240px] px-3 sm:px-6">
          <FadeIn>
            <div className="grain overflow-hidden rounded-[2.5rem] bg-ink px-8 py-14 sm:px-12 md:px-16 md:py-20">
              <GorillaMark className="absolute -bottom-24 -right-20 w-[620px] text-white/[0.04]" />
              <div className="relative grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                <div>
                  <Eyebrow>Cases</Eyebrow>
                  <h2 className="display mt-6 text-6xl text-paper md:text-7xl">
                    Word een van onze <span className="text-accent">eerste cases</span>
                  </h2>
                  <p className="mt-6 max-w-lg text-lg leading-relaxed text-paper/60">
                    We bouwen op dit moment aan onze eerste klantverhalen.
                    Binnenkort lees je hier concrete resultaten. Wil jij de
                    organisatie zijn waar we die voor neerzetten?
                  </p>
                  <div className="mt-9">
                    <Button href="/contact" arrow>
                      Plan een kennismakingsgesprek
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {["Case 01", "Case 02"].map((c, i) => (
                    <div
                      key={c}
                      className={`flex aspect-[4/5] flex-col justify-between rounded-[1.5rem] border border-white/[0.08] bg-ink-2 p-6 ${
                        i === 1 ? "sm:mt-12" : ""
                      }`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/40">
                        {c}
                      </span>
                      <div>
                        <GorillaMark className="w-16 text-white/10" />
                        <p className="display mt-5 text-3xl text-paper/80">Binnenkort</p>
                        <p className="mt-1 text-sm text-paper/40">Case in voorbereiding</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-mist py-28 md:py-36">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <FadeIn>
            <Eyebrow tone="light">Veelgestelde vragen</Eyebrow>
            <h2 className="display mt-6 text-6xl text-ink md:text-7xl">Goed om te weten</h2>
            <p className="mt-6 text-lg text-ink/65">
              Staat je vraag er niet tussen?{" "}
              <Link href="/contact" className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">
                Neem contact op
              </Link>
              .
            </p>
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
