import Link from "next/link";
import Button from "@/components/Button";
import ContactForm from "@/components/ContactForm";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";
import type { CtaValue } from "@/lib/cms/fields";
import { ArrowRightIcon, CheckIcon } from "@/lib/icons";
import { bgClass, list, str, Title, type BlockProps } from "./shared";

const tileCols: Record<number, string> = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3" };

export function HeroBlock({ data, ctx, layout }: BlockProps) {
  const primary = data.primaryCta as CtaValue;
  const secondary = data.secondaryCta as CtaValue;
  const services = data.showServiceTiles ? ctx.bundle.services : [];
  const n = services.length;

  return (
    <div className={layout.nextBg ? bgClass[layout.nextBg] : "bg-ink"}>
      <section className="grain overflow-hidden rounded-b-panel bg-ink md:rounded-b-hero-lg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--tc-accent)_8%,transparent),transparent_55%)]" />
        {Boolean(data.showWatermark) && (
          <GorillaMark watermark className="absolute left-1/2 top-24 w-[1150px] max-w-none -translate-x-[42%] text-white/[0.045]" />
        )}

        <div className="relative mx-auto max-w-site px-6 pb-20 pt-40 text-center md:pb-28 md:pt-52">
          {str(data.eyebrow) && (
            <FadeIn>
              <Eyebrow>{str(data.eyebrow)}</Eyebrow>
            </FadeIn>
          )}
          <FadeIn delay={80}>
            <h1 className="display mx-auto mt-8 text-[calc(3.6rem*var(--tc-heading-scale))] text-paper sm:text-8xl md:text-[calc(8.5rem*var(--tc-heading-scale))]">
              <Title title={str(data.title)} highlight={str(data.highlight)} newLine={Boolean(data.highlightNewLine)} />
            </h1>
          </FadeIn>
          {str(data.intro) && (
            <FadeIn delay={160}>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-paper/65 md:text-xl">{str(data.intro)}</p>
            </FadeIn>
          )}
          <FadeIn delay={240}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={ctx.href(primary?.link)} newTab={ctx.isExternal(primary?.link)} arrow>
                {primary?.label}
              </Button>
              <Button href={ctx.href(secondary?.link)} newTab={ctx.isExternal(secondary?.link)} variant="outline-light">
                {secondary?.label}
              </Button>
            </div>
          </FadeIn>

          {n > 0 && (
            <div className={`mt-20 grid gap-4 text-left sm:grid-cols-2 md:mt-28 ${tileCols[n] ?? "lg:grid-cols-4"}`}>
              {services.map((s, i) => {
                const href = ctx.serviceHref(s);
                const inner = (
                  <>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{s.tag}</span>
                    <span className="display mt-5 text-[calc(2rem*var(--tc-heading-scale))] text-paper">{s.title}</span>
                    <span className="mt-3 text-sm leading-relaxed text-paper/55">{s.short}</span>
                    {href && str(data.tileLinkLabel) && (
                      <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-paper/70 transition-colors group-hover:text-paper">
                        {str(data.tileLinkLabel)}
                        <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </>
                );
                const cls =
                  "group flex h-full flex-col rounded-tile border border-white/[0.07] bg-ink-2/80 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-white/20";
                return (
                  <FadeIn key={s.id} delay={300 + i * 70} className={i > 0 && i < n - 1 && n > 2 ? "lg:mt-10" : ""}>
                    {href ? (
                      <Link href={href} className={cls}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={cls}>{inner}</div>
                    )}
                  </FadeIn>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function PageHeroBlock({ data, layout }: BlockProps) {
  const Heading = layout.index === 0 ? "h1" : "h2";
  return (
    <section className="grain overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--tc-accent)_7%,transparent),transparent_60%)]" />
      {Boolean(data.showWatermark) && (
        <GorillaMark watermark className="absolute -right-24 bottom-0 hidden w-[680px] text-white/[0.045] md:block" />
      )}
      <div className="relative mx-auto max-w-site px-6 pb-20 pt-40 md:pb-28 md:pt-48">
        {str(data.eyebrow) && (
          <FadeIn>
            <Eyebrow>{str(data.eyebrow)}</Eyebrow>
          </FadeIn>
        )}
        <FadeIn delay={80}>
          <Heading className="display mt-7 max-w-5xl text-fluid-6xl text-paper sm:text-7xl md:text-[calc(6.5rem*var(--tc-heading-scale))]">
            <Title title={str(data.title)} highlight={str(data.highlight)} />
          </Heading>
        </FadeIn>
        {str(data.intro) && (
          <FadeIn delay={160}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-paper/65">{str(data.intro)}</p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

export function ContactHeroBlock({ data, ctx, layout }: BlockProps) {
  const Heading = layout.index === 0 ? "h1" : "h2";
  return (
    <div className={layout.nextBg ? bgClass[layout.nextBg] : "bg-ink"}>
      <section className="grain overflow-hidden rounded-b-panel bg-ink md:rounded-b-hero-lg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--tc-accent)_8%,transparent),transparent_55%)]" />
        <GorillaMark watermark className="absolute -left-40 bottom-0 hidden w-[760px] text-white/[0.035] lg:block" />

        <div className="relative mx-auto grid max-w-site gap-14 px-6 pb-20 pt-36 md:pb-24 md:pt-44 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            {str(data.eyebrow) && (
              <FadeIn>
                <Eyebrow>{str(data.eyebrow)}</Eyebrow>
              </FadeIn>
            )}
            <FadeIn delay={80}>
              <Heading className="display mt-7 text-fluid-6xl text-paper sm:text-7xl md:text-8xl">
                <Title title={str(data.title)} highlight={str(data.highlight)} />
              </Heading>
            </FadeIn>
            {str(data.intro) && (
              <FadeIn delay={160}>
                <p className="mt-7 max-w-md text-lg leading-relaxed text-paper/65">{str(data.intro)}</p>
              </FadeIn>
            )}
            {list<string>(data.bullets).length > 0 && (
              <FadeIn delay={220}>
                <ul className="mt-10 space-y-4">
                  {list<string>(data.bullets).map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-paper/85">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            )}
          </div>

          <FadeIn delay={120}>
            <div className="rounded-box bg-white p-7 shadow-card sm:p-10">
              {str(data.formTitle) && <h2 className="text-2xl font-semibold text-ink">{str(data.formTitle)}</h2>}
              {str(data.formIntro) && <p className="mt-2 text-ink/55">{str(data.formIntro)}</p>}
              <div className="mt-8">
                <ContactForm config={ctx.bundle.forms} formStyle={ctx.bundle.theme.layout.formStyle} />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
