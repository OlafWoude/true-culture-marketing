import Button from "@/components/Button";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";

export default function ClosingCta() {
  return (
    <section className="grain overflow-hidden bg-ink">
      <GorillaMark className="absolute left-1/2 top-1/2 w-[900px] max-w-none -translate-x-1/2 -translate-y-1/2 text-white/[0.035]" />
      <div className="relative mx-auto max-w-6xl px-6 py-28 text-center md:py-40">
        <FadeIn>
          <h2 className="display mx-auto max-w-4xl text-6xl text-paper sm:text-7xl md:text-8xl">
            Klaar voor een <span className="text-accent">volle agenda?</span>
          </h2>
        </FadeIn>
        <FadeIn delay={100}>
          <p className="mx-auto mt-7 max-w-xl text-lg text-paper/65">
            Plan een vrijblijvend kennismakingsgesprek. We bespreken jouw
            doelgroep, je doelen en wat wij voor jouw salesteam kunnen
            betekenen.
          </p>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="mt-10 flex justify-center">
            <Button href="/contact" arrow>
              Plan een kennismakingsgesprek
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
