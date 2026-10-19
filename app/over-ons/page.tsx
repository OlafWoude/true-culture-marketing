import type { Metadata } from "next";
import Button from "@/components/Button";
import ClosingCta from "@/components/ClosingCta";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "True Culture Marketing is een B2B sales agency die gelooft dat sales voorspelbaar kan zijn. Lees waar we voor staan en hoe we werken.",
  alternates: { canonical: "/over-ons" },
};

const values = [
  {
    title: "Resultaatgericht",
    text: "We sturen op wat telt: gesprekken met de juiste beslissers en kansen die daadwerkelijk doorstromen naar je salesteam.",
  },
  {
    title: "No-nonsense",
    text: "Direct, eerlijk en zonder omhaal. We zeggen wat werkt en wat niet, ook als dat niet is wat je wilt horen.",
  },
  {
    title: "Partnerschap",
    text: "We werken niet los van je team, maar als verlengstuk ervan. Jouw doelen zijn ons uitgangspunt.",
  },
  {
    title: "Vakmanschap",
    text: "Elke benadering is persoonlijk en goed voorbereid. Wij vertegenwoordigen jouw merk en dat nemen we serieus.",
  },
];

export default function OverOnsPage() {
  return (
    <>
      <PageHero
        eyebrow="Over ons"
        title={
          <>
            Sales is geen kunst. <span className="text-accent">Het is een vak.</span>
          </>
        }
        intro="True Culture Marketing is opgericht vanuit één overtuiging: B2B sales kan voorspelbaar en schaalbaar zijn, mits je het voortraject serieus neemt."
      />

      <section className="bg-mist py-28 md:py-36">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <Eyebrow tone="light">Ons verhaal</Eyebrow>
            <h2 className="display mt-6 text-6xl text-ink md:text-7xl">
              Gebouwd voor salesteams die willen groeien
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/70">
              <p>
                Veel B2B-bedrijven hebben een sterk product en een goed
                salesteam, maar te weinig gesprekken met de juiste mensen.
                Prospecteren schiet erbij in, opvolging is wisselend en de
                pijplijn golft mee.
              </p>
              <p>
                Daar richten wij ons op. Wij nemen het voortraject over met
                een vaste, doordachte aanpak, zodat jouw team doet waar het
                goed in is: gesprekken voeren en deals sluiten.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={120}>
            <div className="grain relative flex aspect-square items-center justify-center overflow-hidden rounded-[2.5rem] bg-ink">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(254,206,0,0.12),transparent_60%)]" />
              <GorillaMark className="relative w-[78%] text-accent" />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-paper py-28 md:py-36">
        <div className="mx-auto max-w-6xl px-6">
          <FadeIn>
            <div className="max-w-3xl">
              <Eyebrow tone="light">Waar we voor staan</Eyebrow>
              <h2 className="display mt-6 text-6xl text-ink md:text-7xl">Onze principes</h2>
            </div>
          </FadeIn>
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 70}>
                <div className="h-full rounded-[1.75rem] bg-mist p-8 md:p-10">
                  <span className="display text-2xl text-ink/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="display mt-4 text-4xl text-ink">{v.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-ink/65">{v.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={200}>
            <div className="mt-12 flex flex-wrap gap-3">
              <Button href="/werkwijze" variant="outline-dark" arrow>
                Bekijk onze werkwijze
              </Button>
              <Button href="/diensten" variant="dark" arrow>
                Bekijk onze diensten
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <ClosingCta />
    </>
  );
}
