import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
};

export default function PageHero({ eyebrow, title, intro }: PageHeroProps) {
  return (
    <section className="grain overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(254,206,0,0.07),transparent_60%)]" />
      <GorillaMark className="absolute -right-24 bottom-0 hidden w-[680px] text-white/[0.045] md:block" />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-40 md:pb-28 md:pt-48">
        <FadeIn>
          <Eyebrow>{eyebrow}</Eyebrow>
        </FadeIn>
        <FadeIn delay={80}>
          <h1 className="display mt-7 max-w-5xl text-6xl text-paper sm:text-7xl md:text-[6.5rem]">
            {title}
          </h1>
        </FadeIn>
        <FadeIn delay={160}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-paper/65">{intro}</p>
        </FadeIn>
      </div>
    </section>
  );
}
