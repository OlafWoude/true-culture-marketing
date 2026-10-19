import type { Metadata } from "next";
import Button from "@/components/Button";
import ProcessStep from "@/components/ProcessStep";
import FadeIn from "@/components/FadeIn";
import GorillaBackdrop from "@/components/GorillaBackdrop";
import { processSteps } from "@/lib/content";

export const metadata: Metadata = {
  title: "Werkwijze",
  description:
    "Van intake tot overdracht: de heldere, herhaalbare werkwijze van True Culture Marketing.",
  alternates: { canonical: "/werkwijze" },
};

export default function WerkwijzePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-line">
        <GorillaBackdrop className="absolute -left-24 top-0 h-[480px] w-[480px] text-paper" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
              Werkwijze
            </span>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 className="text-display mt-4 max-w-2xl text-4xl text-paper sm:text-5xl">
              Geen verrassingen. Wel structuur.
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p className="mt-6 max-w-xl text-paper/60">
              Elk traject doorloopt dezelfde vijf stappen. Zo weet je altijd
              waar je aan toe bent en wat je kunt verwachten.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-ink-line">
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="space-y-14">
            {processSteps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 70}>
                <ProcessStep {...step} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-raised">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <FadeIn>
            <h2 className="text-display text-2xl text-paper sm:text-3xl">
              Benieuwd hoe dit eruitziet voor jouw bedrijf?
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
