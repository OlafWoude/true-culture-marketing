import Link from "next/link";
import Button from "@/components/Button";
import ContactForm from "@/components/ContactForm";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";
import MobileCarousel from "./MobileCarousel";
import type { CtaValue } from "@/lib/cms/fields";
import { serviceSlug } from "@/lib/cms/render";
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from "@/lib/icons";
import { whatsappHref } from "@/lib/whatsapp";
import { bgClass, list, str, Title, type BlockProps } from "./shared";

const tileCols: Record<number, string> = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3" };

export function HeroBlock({ data, ctx, layout }: BlockProps) {
  const primary = data.primaryCta as CtaValue;
  const secondary = data.secondaryCta as CtaValue;
  const services = data.showServiceTiles ? ctx.bundle.services : [];
  const n = services.length;
  const carousel = data.mobileCarousel !== false;
  const trustPoints = list<string>(data.trustPoints).filter(Boolean);

  return (
    <div className={layout.nextBg ? bgClass[layout.nextBg] : "bg-ink"}>
      <section className="grain clip rounded-b-panel bg-ink md:rounded-b-hero-lg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--tc-accent)_8%,transparent),transparent_55%)]" />
        {Boolean(data.showWatermark) && (
          <GorillaMark
            watermark
            className="absolute right-0 top-36 w-[120%] max-w-none text-white/[0.08] md:left-1/2 md:right-auto md:top-24 md:w-[min(1150px,86vw)] md:-translate-x-[42%] md:text-white/[0.045]"
          />
        )}

        <div className="relative mx-auto max-w-site px-6 pb-20 pt-40 text-center md:pb-28 md:pt-52">
          {str(data.eyebrow) && (
            <FadeIn immediate>
              <Eyebrow>{str(data.eyebrow)}</Eyebrow>
            </FadeIn>
          )}
          <FadeIn immediate delay={80}>
            <h1 className="display mx-auto mt-8 text-[calc(3.6rem*var(--tc-heading-scale))] text-paper sm:text-8xl md:text-[calc(8.5rem*var(--tc-heading-scale))]">
              <Title title={str(data.title)} highlight={str(data.highlight)} newLine={Boolean(data.highlightNewLine)} />
            </h1>
          </FadeIn>
          {str(data.intro) && (
            <FadeIn immediate delay={160}>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-paper/65 md:text-xl">{str(data.intro)}</p>
            </FadeIn>
          )}
          <FadeIn immediate delay={240}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={ctx.href(primary?.link)} newTab={ctx.isExternal(primary?.link)} arrow>
                {primary?.label}
              </Button>
              <Button href={ctx.href(secondary?.link)} newTab={ctx.isExternal(secondary?.link)} variant="outline-light">
                {secondary?.label}
              </Button>
            </div>
          </FadeIn>
          {trustPoints.length > 0 && (
            <FadeIn immediate delay={280}>
              <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-sm text-paper/70">
                {trustPoints.map((point, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </FadeIn>
          )}

          {n > 0 && (
            <MobileCarousel
              enabled={carousel}
              tone="dark"
              label="Vacatures in het kort"
              className={`mt-20 grid gap-4 text-left sm:grid-cols-2 md:mt-28 ${tileCols[n] ?? "lg:grid-cols-4"}`}
            >
              {services.map((s, i) => {
                const href = ctx.serviceDetailHref(s);
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
                const cls = `group flex h-full flex-col rounded-tile border border-white/[0.07] bg-ink-2/80 p-7 backdrop-blur-sm transition-colors duration-300 hover:border-white/20 ${
                  carousel ? "max-md:p-6" : ""
                }`;
                return (
                  <FadeIn immediate key={s.id} delay={300 + i * 70} className={i > 0 && i < n - 1 && n > 2 ? "lg:mt-10" : ""}>
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
            </MobileCarousel>
          )}
        </div>
      </section>
    </div>
  );
}

export function PageHeroBlock({ data, layout }: BlockProps) {
  const Heading = layout.index === 0 ? "h1" : "h2";
  return (
    <section className="grain clip bg-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--tc-accent)_7%,transparent),transparent_60%)]" />
      {Boolean(data.showWatermark) && (
        <GorillaMark watermark className="absolute -right-[8%] bottom-0 w-[80%] text-white/[0.055] md:-right-24 md:w-[680px] md:text-white/[0.045]" />
      )}
      <div className="relative mx-auto max-w-site px-6 pb-20 pt-40 md:pb-28 md:pt-48">
        {str(data.eyebrow) && (
          <FadeIn immediate>
            <Eyebrow>{str(data.eyebrow)}</Eyebrow>
          </FadeIn>
        )}
        <FadeIn immediate delay={80}>
          <Heading className="display mt-7 max-w-5xl text-fluid-6xl text-paper sm:text-7xl md:text-[calc(6.5rem*var(--tc-heading-scale))]">
            <Title title={str(data.title)} highlight={str(data.highlight)} />
          </Heading>
        </FadeIn>
        {str(data.intro) && (
          <FadeIn immediate delay={160}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-paper/65">{str(data.intro)}</p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

export function ContactHeroBlock({ data, ctx, layout }: BlockProps) {
  const Heading = layout.index === 0 ? "h1" : "h2";
  const whatsapp = whatsappHref(ctx.bundle.settings.contact.whatsapp, "Hoi! Ik heb een vraag over werken bij True Culture Marketing.");
  const whatsappLabel = str(data.whatsappLabel);
  return (
    <div className={layout.nextBg ? bgClass[layout.nextBg] : "bg-ink"}>
      <section className="grain clip rounded-b-panel bg-ink md:rounded-b-hero-lg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--tc-accent)_8%,transparent),transparent_55%)]" />
        <GorillaMark
          watermark
          className="absolute -right-[10%] top-24 w-[78%] max-w-[560px] text-white/[0.05] lg:-left-40 lg:bottom-0 lg:right-auto lg:top-auto lg:w-[760px] lg:max-w-none lg:text-white/[0.035]"
        />

        <div className="relative mx-auto grid max-w-site gap-14 px-6 pb-20 pt-36 md:pb-24 md:pt-44 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            {str(data.eyebrow) && (
              <FadeIn immediate>
                <Eyebrow>{str(data.eyebrow)}</Eyebrow>
              </FadeIn>
            )}
            <FadeIn immediate delay={80}>
              <Heading className="display mt-7 text-fluid-6xl text-paper sm:text-7xl md:text-8xl">
                <Title title={str(data.title)} highlight={str(data.highlight)} />
              </Heading>
            </FadeIn>
            {str(data.intro) && (
              <FadeIn immediate delay={160}>
                <p className="mt-7 max-w-md text-lg leading-relaxed text-paper/65">{str(data.intro)}</p>
              </FadeIn>
            )}
            {list<string>(data.bullets).length > 0 && (
              <FadeIn immediate delay={220}>
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
            {whatsapp && whatsappLabel && (
              <FadeIn immediate delay={260}>
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-9 inline-flex items-center gap-2.5 rounded-btn border border-white/15 px-5 py-3 text-sm font-semibold text-paper transition-colors hover:border-white/40"
                >
                  <WhatsAppIcon className="h-5 w-5 text-accent" />
                  {whatsappLabel}
                </a>
              </FadeIn>
            )}
          </div>

          <FadeIn immediate delay={120}>
            <div className="rounded-box bg-white p-7 shadow-card sm:p-10">
              {str(data.formTitle) && <h2 className="text-2xl font-semibold text-ink">{str(data.formTitle)}</h2>}
              {str(data.formIntro) && <p className="mt-2 text-ink/60">{str(data.formIntro)}</p>}
              <div className="mt-8">
                <ContactForm
                  config={ctx.bundle.forms}
                  formStyle={ctx.bundle.theme.layout.formStyle}
                  whatsapp={whatsapp && whatsappLabel ? { href: whatsapp, label: whatsappLabel } : null}
                  vacancies={ctx.bundle.services.map((s) => ({ slug: serviceSlug(s), title: s.title }))}
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
