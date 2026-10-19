import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";
import { CheckIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Plan een kennismakingsgesprek",
  description:
    "Plan een vrijblijvend kennismakingsgesprek met True Culture Marketing en ontdek wat wij voor jouw salesteam kunnen betekenen.",
  alternates: { canonical: "/contact" },
};

const expectations = [
  {
    title: "Je laat je gegevens achter",
    text: "Vertel kort wie je bent en wat je wilt bereiken.",
  },
  {
    title: "We nemen contact op",
    text: "We plannen samen een moment dat jou uitkomt.",
  },
  {
    title: "Het kennismakingsgesprek",
    text: "We bespreken je doelgroep, doelen en de mogelijkheden. Vrijblijvend.",
  },
];

export default function ContactPage() {
  return (
    <>
      <div className="bg-mist">
        <section className="grain overflow-hidden rounded-b-[2.5rem] bg-ink md:rounded-b-[3.5rem]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top_left,rgba(254,206,0,0.08),transparent_55%)]" />
          <GorillaMark className="absolute -left-40 bottom-0 hidden w-[760px] text-white/[0.035] lg:block" />

          <div className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-36 md:pb-24 md:pt-44 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <FadeIn>
                <Eyebrow>Contact</Eyebrow>
              </FadeIn>
              <FadeIn delay={80}>
                <h1 className="display mt-7 text-6xl text-paper sm:text-7xl md:text-8xl">
                  Laten we <span className="text-accent">kennismaken</span>
                </h1>
              </FadeIn>
              <FadeIn delay={160}>
                <p className="mt-7 max-w-md text-lg leading-relaxed text-paper/65">
                  Plan een vrijblijvend kennismakingsgesprek. We bespreken je
                  doelgroep, je doelen en hoe wij jouw salesteam kunnen
                  ontlasten.
                </p>
              </FadeIn>
              <FadeIn delay={220}>
                <ul className="mt-10 space-y-4">
                  {[
                    "Vrijblijvend en zonder verplichtingen",
                    "Concreet advies over jouw situatie",
                    "Direct inzicht in de mogelijkheden",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-paper/85">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>

            <FadeIn delay={120}>
              <div className="rounded-[2rem] bg-white p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] sm:p-10">
                <h2 className="text-2xl font-semibold text-ink">Plan een kennismakingsgesprek</h2>
                <p className="mt-2 text-ink/55">Vul het formulier in, dan nemen we contact met je op.</p>
                <div className="mt-8">
                  <ContactForm />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <FadeIn>
            <Eyebrow tone="light">Wat je kunt verwachten</Eyebrow>
            <h2 className="display mt-6 text-6xl text-ink md:text-7xl">In drie stappen aan tafel</h2>
          </FadeIn>
          <ol className="mt-14 grid gap-4 md:grid-cols-3">
            {expectations.map((e, i) => (
              <FadeIn key={e.title} delay={i * 70}>
                <li className="h-full rounded-[1.75rem] bg-white p-8">
                  <span className="display text-6xl text-ink">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-5 block h-1 w-10 rounded-full bg-accent" />
                  <h3 className="mt-5 text-xl font-semibold text-ink">{e.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink/60">{e.text}</p>
                </li>
              </FadeIn>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
