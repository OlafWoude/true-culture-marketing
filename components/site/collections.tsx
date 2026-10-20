import Link from "next/link";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";
import type { CtaValue } from "@/lib/cms/fields";
import type { RenderCtx } from "@/lib/cms/render";
import type { Bundle } from "@/lib/cms/types";
import { ArrowRightIcon, CheckIcon } from "@/lib/icons";
import MobileCarousel from "./MobileCarousel";
import { asBg, bgClass, MediaImage, pad, str, Title, type BlockProps } from "./shared";

const nn = (i: number) => String(i + 1).padStart(2, "0");

export function ServicesOverviewBlock({ data, ctx, layout }: BlockProps) {
  const services = ctx.bundle.services;
  const carousel = data.mobileCarousel !== false;
  return (
    <section className={`bg-paper ${pad(layout.spaceTop)}`}>
      <div className="mx-auto max-w-site px-6">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            {str(data.eyebrow) && <Eyebrow tone="light">{str(data.eyebrow)}</Eyebrow>}
            <h2 className="display mt-6 text-fluid-6xl text-ink md:text-[calc(5.5rem*var(--tc-heading-scale))]">{str(data.title)}</h2>
            {str(data.intro) && <p className="mx-auto mt-6 max-w-xl text-lg text-ink/65">{str(data.intro)}</p>}
          </div>
        </FadeIn>
      </div>

      {services.length > 0 && (
        <div className="mx-auto mt-16 max-w-site-wide px-3 sm:px-6">
          <div className="grain overflow-hidden rounded-panel bg-ink p-4 sm:p-6 md:p-8">
            <GorillaMark watermark className="absolute -right-40 top-1/2 w-[900px] max-w-none -translate-y-1/2 text-white/[0.03]" />
            <MobileCarousel
              enabled={carousel}
              tone="dark"
              label="Diensten"
              className="relative grid gap-4 md:grid-cols-2"
              bleed="max-md:-mx-4 max-md:px-4 max-md:scroll-px-4 sm:max-md:-mx-6 sm:max-md:px-6 sm:max-md:scroll-px-6"
            >
              {services.map((s, i) => {
                const href = ctx.serviceHref(s);
                return (
                  <FadeIn key={s.id} delay={i * 70}>
                    <article className={`flex h-full flex-col rounded-card border border-white/[0.07] bg-ink-2 p-8 md:p-10 ${carousel ? "max-md:p-6" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{s.tag}</span>
                        <span className="display text-2xl text-paper/20">{nn(i)}</span>
                      </div>
                      <h3 className={`display mt-6 text-5xl text-paper ${carousel ? "max-md:mt-5 max-md:text-[calc(2rem*var(--tc-heading-scale))]" : ""}`}>{s.title}</h3>
                      <p className={`mt-4 leading-relaxed text-paper/60 ${carousel ? "max-md:text-[15px]" : ""}`}>{s.description}</p>
                      {s.points.length > 0 && (
                        <ul className="mt-6 space-y-2.5">
                          {s.points.map((p, j) => (
                            <li key={j} className="flex items-start gap-3 text-[15px] text-paper/80">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                      {href && str(data.linkLabel) && (
                        <Link href={href} className="group mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-paper">
                          {s.cta?.label || str(data.linkLabel)}
                          <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                      )}
                    </article>
                  </FadeIn>
                );
              })}
            </MobileCarousel>
          </div>
        </div>
      )}
    </section>
  );
}

export function ServicesDetailedBlock({ data, ctx }: BlockProps) {
  const services = ctx.bundle.services;
  const carousel = data.mobileCarousel !== false;
  return (
    <div className="bg-mist py-6 md:py-10">
      <MobileCarousel enabled={carousel} label="Diensten" bleed="max-md:px-3 max-md:scroll-px-3 sm:max-md:px-6 sm:max-md:scroll-px-6">
      {services.map((s, i) => {
        const even = i % 2 === 0;
        const image = ctx.media(s.image);
        const ctaHref = ctx.href(s.cta?.link);
        return (
          <section
            key={s.id}
            id={s.anchor || undefined}
            className={`mx-auto max-w-site-wide scroll-mt-28 px-3 py-3 sm:px-6 ${carousel ? "max-md:p-0" : ""}`}
          >
            <FadeIn className={carousel ? "max-md:h-full" : ""}>
              <div
                className={`grid gap-10 rounded-panel p-8 sm:p-12 md:p-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 ${
                  even ? "bg-white" : "grain overflow-hidden bg-ink"
                } ${carousel ? "max-md:h-full max-md:content-start max-md:gap-8 max-md:p-6" : ""}`}
              >
                {!even && (
                  <GorillaMark watermark className="absolute -bottom-16 -left-16 w-[520px] text-white/[0.035]" />
                )}
                <div className="relative">
                  <div className="flex items-center gap-4">
                    <span className={`display text-2xl ${even ? "text-ink/25" : "text-paper/25"}`}>{nn(i)}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{s.tag}</span>
                  </div>
                  <h2
                    className={`display mt-6 text-fluid-6xl md:text-7xl ${even ? "text-ink" : "text-paper"} ${
                      carousel ? "max-md:mt-5 max-md:text-[calc(2.25rem*var(--tc-heading-scale))]" : ""
                    }`}
                  >
                    {s.title}
                  </h2>
                  <p className={`mt-6 max-w-xl text-lg leading-relaxed ${even ? "text-ink/65" : "text-paper/65"} ${carousel ? "max-md:mt-4 max-md:text-base" : ""}`}>
                    {s.description}
                  </p>
                  {ctaHref && s.cta.label && (
                    <div className="mt-8">
                      <Button href={ctaHref} newTab={ctx.isExternal(s.cta.link)} variant={even ? "dark" : "primary"} arrow>
                        {s.cta.label}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="relative self-start">
                  {image && (
                    <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-card">
                      <MediaImage media={image} />
                    </div>
                  )}
                  {s.points.length > 0 && (
                    <div className={`rounded-card p-8 ${even ? "bg-mist" : "border border-white/[0.07] bg-ink-2"} ${carousel ? "max-md:p-5" : ""}`}>
                      {str(data.pointsTitle) && (
                        <p className={`text-sm font-semibold ${even ? "text-ink/50" : "text-paper/50"}`}>{str(data.pointsTitle)}</p>
                      )}
                      <ul className={`mt-6 space-y-5 ${carousel ? "max-md:mt-4 max-md:space-y-3" : ""}`}>
                        {s.points.map((p, j) => (
                          <li key={j} className="flex items-start gap-4">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                              <CheckIcon className="h-4 w-4" />
                            </span>
                            <span className={`text-[17px] leading-snug ${even ? "text-ink" : "text-paper"} ${carousel ? "max-md:text-[15px]" : ""}`}>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          </section>
        );
      })}
      </MobileCarousel>
    </div>
  );
}

function selectCases(bundle: Bundle, show: unknown) {
  return show === "all" ? bundle.cases : bundle.cases.filter((c) => c.featured);
}

function CaseCard({ c, ctx, offset }: { c: Bundle["cases"][number]; ctx: RenderCtx; offset: boolean }) {
  const image = ctx.media(c.coverImage);
  return (
    <Link
      href={`/cases/${c.slug}`}
      className={`group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-tile border border-white/[0.08] bg-ink-2 p-6 ${offset ? "md:mt-12" : ""}`}
    >
      {image ? (
        <>
          <MediaImage media={image} sizes="(min-width: 1024px) 25vw, 50vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        </>
      ) : (
        <GorillaMark className="absolute right-6 top-6 w-16 text-white/10" />
      )}
      <div className="relative">
        {c.client && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{c.client}</p>}
        <p className="display mt-3 text-3xl text-paper">{c.title}</p>
      </div>
    </Link>
  );
}

export function CasesBlock({ data, ctx, layout }: BlockProps) {
  const cases = selectCases(ctx.bundle, data.show);
  const ctaValue = data.cta as CtaValue;
  const first = cases.slice(0, 2);
  const rest = cases.slice(2);
  const carousel = data.mobileCarousel !== false;
  const bleed = "max-md:-mx-8 max-md:px-8 max-md:scroll-px-8";
  return (
    <section className={`bg-paper ${pad(layout.spaceTop)}`}>
      <div className="mx-auto max-w-site-wide px-3 sm:px-6">
        <FadeIn>
          <div className="grain overflow-hidden rounded-panel bg-ink px-8 py-14 sm:px-12 md:px-16 md:py-20">
            <GorillaMark watermark className="absolute -bottom-24 -right-20 w-[620px] text-white/[0.04]" />
            <div className="relative grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                {str(data.eyebrow) && <Eyebrow>{str(data.eyebrow)}</Eyebrow>}
                <h2 className="display mt-6 text-fluid-6xl text-paper md:text-7xl">
                  <Title title={str(data.title)} highlight={str(data.highlight)} />
                </h2>
                {str(data.text) && <p className="mt-6 max-w-lg text-lg leading-relaxed text-paper/60">{str(data.text)}</p>}
                {ctx.href(ctaValue?.link) && ctaValue?.label && (
                  <div className="mt-9">
                    <Button href={ctx.href(ctaValue.link)} newTab={ctx.isExternal(ctaValue.link)} arrow>
                      {ctaValue.label}
                    </Button>
                  </div>
                )}
              </div>
              <div className="min-w-0">
              <MobileCarousel enabled={carousel} tone="dark" label="Cases" bleed={bleed} className="grid gap-4 sm:grid-cols-2">
                {first.length > 0
                  ? first.map((c, i) => <CaseCard key={c.id} c={c} ctx={ctx} offset={i === 1} />)
                  : [0, 1].map((i) => (
                      <div
                        key={i}
                        className={`flex aspect-[4/5] flex-col justify-between rounded-tile border border-white/[0.08] bg-ink-2 p-6 ${i === 1 ? "md:mt-12" : ""}`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/40">Case {nn(i)}</span>
                        <div>
                          <GorillaMark className="w-16 text-white/10" />
                          <p className="display mt-5 text-3xl text-paper/80">{str(data.placeholderTitle)}</p>
                          <p className="mt-1 text-sm text-paper/40">{str(data.placeholderText)}</p>
                        </div>
                      </div>
                    ))}
              </MobileCarousel>
              </div>
            </div>
            {rest.length > 0 && (
              <div className="relative mt-12">
                <MobileCarousel enabled={carousel} tone="dark" label="Meer cases" bleed={bleed} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {rest.map((c) => (
                    <CaseCard key={c.id} c={c} ctx={ctx} offset={false} />
                  ))}
                </MobileCarousel>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function TestimonialsBlock({ data, ctx, layout }: BlockProps) {
  const items = ctx.bundle.testimonials;
  if (!items.length) return null;
  const bg = asBg(data.background, "white");
  const dark = bg === "dark";
  const carousel = data.mobileCarousel !== false;
  return (
    <section className={`${bgClass[bg]} ${dark ? "grain overflow-hidden" : ""} ${pad(layout.spaceTop)}`}>
      <div className="mx-auto max-w-site px-6">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center">
            {str(data.eyebrow) && <Eyebrow tone={dark ? "dark" : "light"}>{str(data.eyebrow)}</Eyebrow>}
            {str(data.title) && (
              <h2 className={`display mt-6 text-fluid-6xl md:text-7xl ${dark ? "text-paper" : "text-ink"}`}>{str(data.title)}</h2>
            )}
            {str(data.intro) && <p className={`mx-auto mt-6 max-w-xl text-lg ${dark ? "text-paper/65" : "text-ink/65"}`}>{str(data.intro)}</p>}
          </div>
        </FadeIn>
        <MobileCarousel enabled={carousel} tone={dark ? "dark" : "light"} label="Testimonials" className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => {
            const photo = ctx.media(t.photo);
            const logo = ctx.media(t.logo);
            return (
              <FadeIn key={t.id} delay={i * 70}>
                <figure
                  className={`flex h-full flex-col rounded-card p-8 ${dark ? "border border-white/[0.07] bg-ink-2" : bg === "light" ? "bg-white" : "bg-mist"} ${
                    carousel ? "max-md:p-6" : ""
                  }`}
                >
                  <span className="display text-6xl leading-none text-accent">“</span>
                  <blockquote className={`mt-2 flex-1 text-lg leading-relaxed ${dark ? "text-paper/85" : "text-ink/80"}`}>{t.quote}</blockquote>
                  <figcaption className="mt-8 flex items-center gap-4">
                    {photo && (
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                        <MediaImage media={photo} sizes="48px" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className={`block font-semibold ${dark ? "text-paper" : "text-ink"}`}>{t.name}</span>
                      <span className={`block text-sm ${dark ? "text-paper/55" : "text-ink/55"}`}>
                        {[t.role, t.company].filter(Boolean).join(", ")}
                      </span>
                    </span>
                    {logo && (
                      <span className="relative h-8 w-20 shrink-0">
                        <MediaImage media={logo} sizes="80px" className="!object-contain" />
                      </span>
                    )}
                  </figcaption>
                </figure>
              </FadeIn>
            );
          })}
        </MobileCarousel>
      </div>
    </section>
  );
}
