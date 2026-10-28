import Button from "@/components/Button";
import Comparison, { type ComparisonRow } from "@/components/Comparison";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import Faq, { type FaqItem } from "@/components/Faq";
import GorillaMark from "@/components/GorillaMark";
import Marquee from "@/components/Marquee";
import type { CtaValue } from "@/lib/cms/fields";
import { CheckIcon } from "@/lib/icons";
import { MediaSlot } from "./media";
import MobileCarousel from "./MobileCarousel";
import { asBg, bgClass, list, MediaImage, pad, RichText, str, Title, type BlockProps } from "./shared";

const nn = (i: number) => String(i + 1).padStart(2, "0");

function CtaButton({ cta, ctx, variant = "primary", arrow = true }: { cta: CtaValue; ctx: BlockProps["ctx"]; variant?: "primary" | "dark" | "outline-dark" | "outline-light"; arrow?: boolean }) {
  return (
    <Button href={ctx.href(cta?.link)} newTab={ctx.isExternal(cta?.link)} variant={variant} arrow={arrow}>
      {cta?.label}
    </Button>
  );
}

export function MarqueeBlock({ data }: BlockProps) {
  const bg = asBg(data.background, "light");
  return (
    <div className={bgClass[bg]}>
      <Marquee items={list<string>(data.items)} tone={bg === "dark" ? "dark" : "light"} />
    </div>
  );
}

export function IntroSplitBlock({ data, ctx, layout }: BlockProps) {
  const ctaValue = data.cta as CtaValue;
  return (
    <div className="bg-mist">
      <section className={`mx-auto max-w-site px-6 ${pad(layout.spaceTop)}`}>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <FadeIn>
            {str(data.eyebrow) && <Eyebrow tone="light">{str(data.eyebrow)}</Eyebrow>}
            <h2 className="display mt-6 text-fluid-6xl text-ink md:text-7xl">{str(data.title)}</h2>
            <RichText html={str(data.body)} className="mt-8 text-lg leading-relaxed text-ink/70" />
            {ctx.href(ctaValue?.link) && ctaValue?.label && (
              <div className="mt-9">
                <CtaButton cta={ctaValue} ctx={ctx} variant="outline-dark" />
              </div>
            )}
          </FadeIn>

          <FadeIn delay={120}>
            <div className="relative overflow-hidden rounded-box bg-ink p-8 sm:p-12">
              <GorillaMark watermark className="absolute -bottom-6 -right-6 w-[300px] text-accent/[0.12] sm:-bottom-10 sm:-right-16 sm:w-[440px]" />
              {str(data.cardTitle) && (
                <p className="relative text-sm font-semibold uppercase tracking-[0.18em] text-accent">{str(data.cardTitle)}</p>
              )}
              <ul className="relative mt-8 space-y-6">
                {list<string>(data.cardItems).map((p, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
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
  );
}

export function ComparisonBlock({ data, layout }: BlockProps) {
  const bg = asBg(data.background, "light");
  const stacked = data.layout === "stacked";
  return (
    <section className={`${bgClass[bg]} ${pad(layout.spaceTop)}`}>
      <div className="mx-auto max-w-site px-6">
        <FadeIn>
          {stacked ? (
            <div className="max-w-3xl">
              {str(data.eyebrow) && <Eyebrow tone="light">{str(data.eyebrow)}</Eyebrow>}
              <h2 className="display mt-6 text-fluid-6xl text-ink md:text-7xl">{str(data.title)}</h2>
              {str(data.intro) && <p className="mt-6 text-lg leading-relaxed text-ink/65">{str(data.intro)}</p>}
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
              <div>
                {str(data.eyebrow) && <Eyebrow tone="light">{str(data.eyebrow)}</Eyebrow>}
                <h2 className="display mt-6 text-fluid-6xl text-ink md:text-7xl">{str(data.title)}</h2>
              </div>
              {str(data.intro) && <p className="text-lg leading-relaxed text-ink/65 lg:pb-2">{str(data.intro)}</p>}
            </div>
          )}
        </FadeIn>
        <FadeIn delay={100}>
          <div className="mt-16">
            <Comparison
              rows={list<ComparisonRow>(data.rows)}
              selfLabel={str(data.selfLabel)}
              usAccent={str(data.usAccent)}
              usLabel={str(data.usLabel)}
              carousel={data.mobileCarousel !== false}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function StepsBlock({ data, ctx, layout }: BlockProps) {
  const items = list<{ title: string; description: string }>(data.items);
  const carousel = data.mobileCarousel !== false;
  return (
    <section className={`bg-paper ${pad(layout.spaceTop)}`}>
      <div className="mx-auto max-w-site px-6">
        <FadeIn>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              {str(data.eyebrow) && <Eyebrow tone="light">{str(data.eyebrow)}</Eyebrow>}
              <h2 className="display mt-6 text-fluid-6xl text-ink md:text-7xl">{str(data.title)}</h2>
            </div>
            <CtaButton cta={data.cta as CtaValue} ctx={ctx} variant="outline-dark" />
          </div>
        </FadeIn>

        <MobileCarousel as="ol" enabled={carousel} label="Stappen" className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((step, i) => (
            <FadeIn as="li" key={i} className={`flex h-full flex-col rounded-card bg-mist p-8 ${carousel ? "max-md:p-6" : ""}`}>
              <span className={`display text-7xl text-ink ${carousel ? "max-md:text-6xl" : ""}`}>{nn(i)}</span>
              <span className={`mt-6 h-1 w-10 rounded-full bg-accent ${carousel ? "max-md:mt-5" : ""}`} />
              <h3 className={`mt-6 text-xl font-semibold text-ink ${carousel ? "max-md:mt-5" : ""}`}>{step.title}</h3>
              <p className="mt-3 leading-relaxed text-ink/65">{step.description}</p>
            </FadeIn>
          ))}
        </MobileCarousel>
      </div>
    </section>
  );
}

export function StepsDetailedBlock({ data, layout }: BlockProps) {
  const items = list<{ title: string; detail: string; outcome: string }>(data.items);
  const carousel = data.mobileCarousel !== false;
  return (
    <section className={`bg-mist ${pad(layout.spaceTop, "sm")}`}>
      <div className="mx-auto max-w-site px-6">
        <MobileCarousel as="ol" enabled={carousel} label="Stappen" className="space-y-4">
          {items.map((step, i) => (
            <FadeIn
              as="li"
              key={i}
              className={`grid gap-8 rounded-box bg-white p-8 sm:p-10 md:grid-cols-[auto_1fr_0.8fr] md:items-start md:gap-14 md:p-12 ${
                carousel ? "max-md:content-start max-md:gap-5 max-md:p-6" : ""
              }`}
            >
                <span className={`display text-8xl text-ink md:text-[calc(9rem*var(--tc-heading-scale))] ${carousel ? "max-md:text-6xl" : ""}`}>{nn(i)}</span>
                <div>
                  <h2 className={`display text-5xl text-ink ${carousel ? "max-md:text-[calc(2rem*var(--tc-heading-scale))]" : ""}`}>{step.title}</h2>
                  <p className={`mt-5 text-lg leading-relaxed text-ink/65 ${carousel ? "max-md:mt-3 max-md:text-base" : ""}`}>{step.detail}</p>
                </div>
                {step.outcome && (
                  <div className={`rounded-inner bg-ink p-6 text-paper md:mt-2 ${carousel ? "max-md:p-5" : ""}`}>
                    {str(data.resultLabel) && (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{str(data.resultLabel)}</p>
                    )}
                    <p className="mt-4 flex items-start gap-3 text-[17px] leading-snug">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {step.outcome}
                    </p>
                  </div>
                )}
            </FadeIn>
          ))}
        </MobileCarousel>
      </div>
    </section>
  );
}

export function FaqBlock({ data, layout }: BlockProps) {
  const bg = asBg(data.background, "light");
  return (
    <section className={`${bgClass[bg]} ${pad(layout.spaceTop)}`}>
      <div className="mx-auto grid max-w-site gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <FadeIn>
          {str(data.eyebrow) && <Eyebrow tone="light">{str(data.eyebrow)}</Eyebrow>}
          <h2 className="display mt-6 text-fluid-6xl text-ink md:text-7xl">{str(data.title)}</h2>
          <RichText html={str(data.text)} className="mt-6 text-lg text-ink/65 [&_a]:text-ink" />
        </FadeIn>
        <FadeIn delay={100}>
          <Faq items={list<FaqItem>(data.items)} />
        </FadeIn>
      </div>
    </section>
  );
}

export function ClosingCtaBlock({ data, ctx }: BlockProps) {
  return (
    <section className="grain clip bg-ink">
      {Boolean(data.showWatermark) && (
        <GorillaMark
          watermark
          className="absolute left-1/2 top-1/2 w-[110%] max-w-none -translate-x-1/2 -translate-y-1/2 text-white/[0.05] md:w-[min(900px,100%)] md:text-white/[0.035]"
        />
      )}
      <div className="relative mx-auto max-w-site px-6 py-section-lg text-center">
        <FadeIn>
          <h2 className="display mx-auto max-w-4xl text-fluid-6xl text-paper sm:text-7xl md:text-8xl">
            <Title title={str(data.title)} highlight={str(data.highlight)} />
          </h2>
        </FadeIn>
        {str(data.text) && (
          <FadeIn delay={100}>
            <p className="mx-auto mt-7 max-w-xl text-lg text-paper/65">{str(data.text)}</p>
          </FadeIn>
        )}
        <FadeIn delay={200}>
          <div className="mt-10 flex justify-center">
            <CtaButton cta={data.cta as CtaValue} ctx={ctx} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function StorySplitBlock({ data, ctx, layout }: BlockProps) {
  const placeholderText = str(data.placeholderText);
  return (
    <section className={`bg-mist ${pad(layout.spaceTop)}`}>
      <div className="mx-auto grid max-w-site items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        <FadeIn>
          {str(data.eyebrow) && <Eyebrow tone="light">{str(data.eyebrow)}</Eyebrow>}
          <h2 className="display mt-6 text-fluid-6xl text-ink md:text-7xl">{str(data.title)}</h2>
          <RichText html={str(data.body)} className="mt-8 text-lg leading-relaxed text-ink/70" />
        </FadeIn>
        <FadeIn delay={120}>
          <MediaSlot
            ctx={ctx}
            kind="photo"
            image={data.image}
            text={placeholderText}
            aspect="1/1"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="rounded-panel"
            allowPlaceholder={Boolean(placeholderText)}
            fallback={
              <div className="grain relative flex aspect-square items-center justify-center overflow-hidden rounded-panel bg-ink">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,color-mix(in_srgb,var(--tc-accent)_12%,transparent),transparent_60%)]" />
                <GorillaMark className="relative w-[78%] text-accent" />
              </div>
            }
          />
        </FadeIn>
      </div>
    </section>
  );
}

export function ValuesGridBlock({ data, ctx, layout }: BlockProps) {
  const items = list<{ title: string; text: string }>(data.items);
  const secondary = data.secondaryCta as CtaValue;
  const primary = data.primaryCta as CtaValue;
  const hasButtons = Boolean(ctx.href(secondary?.link) || ctx.href(primary?.link));
  const carousel = data.mobileCarousel !== false;
  return (
    <section className={`bg-paper ${pad(layout.spaceTop)}`}>
      <div className="mx-auto max-w-site px-6">
        <FadeIn>
          <div className="max-w-3xl">
            {str(data.eyebrow) && <Eyebrow tone="light">{str(data.eyebrow)}</Eyebrow>}
            <h2 className="display mt-6 text-fluid-6xl text-ink md:text-7xl">{str(data.title)}</h2>
          </div>
        </FadeIn>
        <MobileCarousel enabled={carousel} label="Principes" className="mt-16 grid gap-4 sm:grid-cols-2">
          {items.map((v, i) => (
            <FadeIn key={i} delay={i * 70}>
              <div className={`h-full rounded-card bg-mist p-8 md:p-10 ${carousel ? "max-md:p-6" : ""}`}>
                <span className="display text-2xl text-ink/45">{nn(i)}</span>
                <h3 className={`display mt-4 text-4xl text-ink ${carousel ? "max-md:text-[calc(1.75rem*var(--tc-heading-scale))]" : ""}`}>{v.title}</h3>
                <p className={`mt-4 text-lg leading-relaxed text-ink/65 ${carousel ? "max-md:mt-3 max-md:text-base" : ""}`}>{v.text}</p>
              </div>
            </FadeIn>
          ))}
        </MobileCarousel>
        {hasButtons && (
          <FadeIn delay={200}>
            <div className="mt-12 flex flex-wrap gap-3">
              <CtaButton cta={secondary} ctx={ctx} variant="outline-dark" />
              <CtaButton cta={primary} ctx={ctx} variant="dark" />
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

export function NumberedCardsBlock({ data, layout }: BlockProps) {
  const bg = asBg(data.background, "light");
  const items = list<{ title: string; text: string }>(data.items);
  const carousel = data.mobileCarousel !== false;
  return (
    <div className={bgClass[bg]}>
      <section className={`mx-auto max-w-site px-6 ${pad(layout.spaceTop, "sm")}`}>
        <FadeIn>
          {str(data.eyebrow) && <Eyebrow tone="light">{str(data.eyebrow)}</Eyebrow>}
          <h2 className="display mt-6 text-fluid-6xl text-ink md:text-7xl">{str(data.title)}</h2>
        </FadeIn>
        <MobileCarousel as="ol" enabled={carousel} label="Stappen" className="mt-14 grid gap-4 md:grid-cols-3">
          {items.map((e, i) => (
            <FadeIn as="li" key={i} className={`rounded-card p-8 ${bg === "light" ? "bg-white" : "bg-mist"} ${carousel ? "max-md:p-6" : ""}`}>
              <span className="display text-6xl text-ink">{nn(i)}</span>
              <span className="mt-5 block h-1 w-10 rounded-full bg-accent" />
              <h3 className="mt-5 text-xl font-semibold text-ink">{e.title}</h3>
              <p className="mt-2 leading-relaxed text-ink/65">{e.text}</p>
            </FadeIn>
          ))}
        </MobileCarousel>
      </section>
    </div>
  );
}

export function TextCardsBlock({ data, layout }: BlockProps) {
  const items = list<{ title: string; body: string }>(data.items);
  return (
    <section className={`bg-mist ${pad(layout.spaceTop, "sm")}`}>
      <div className="mx-auto max-w-3xl space-y-4 px-6">
        {items.map((s, i) => (
          <div key={i} className="rounded-tile bg-white p-8 md:p-10">
            {s.title && <h2 className="text-xl font-semibold text-ink">{s.title}</h2>}
            <RichText html={s.body} className="mt-3 leading-relaxed text-ink/65" />
          </div>
        ))}
      </div>
    </section>
  );
}

const textOn = (bg: "white" | "light" | "dark") =>
  bg === "dark"
    ? { title: "text-paper", body: "text-paper/70", eyebrow: "dark" as const }
    : { title: "text-ink", body: "text-ink/70", eyebrow: "light" as const };

export function RichTextBlock({ data, layout }: BlockProps) {
  const bg = asBg(data.background, "white");
  const t = textOn(bg);
  return (
    <section className={`${bgClass[bg]} ${bg === "dark" ? "grain clip" : ""} ${pad(layout.spaceTop)}`}>
      <div className="mx-auto max-w-3xl px-6">
        <FadeIn>
          {str(data.eyebrow) && <Eyebrow tone={t.eyebrow}>{str(data.eyebrow)}</Eyebrow>}
          {str(data.title) && <h2 className={`display mt-6 text-5xl md:text-6xl ${t.title}`}>{str(data.title)}</h2>}
          <RichText
            html={str(data.body)}
            className={`mt-8 text-lg leading-relaxed ${t.body} ${bg === "dark" ? "[&_h2]:text-paper [&_h3]:text-paper" : "[&_h2]:text-ink [&_h3]:text-ink"}`}
          />
        </FadeIn>
      </div>
    </section>
  );
}

export function ImageTextBlock({ data, ctx, layout }: BlockProps) {
  const bg = asBg(data.background, "white");
  const t = textOn(bg);
  const left = data.imagePosition === "left";
  const ctaValue = data.cta as CtaValue;
  const aspect = str(data.mediaAspect) || "4/3";
  // Upright photos and phone videos stay narrow, so they do not tower over the text next to them.
  const upright = aspect === "9/16" || aspect === "4/5";
  return (
    <section className={`${bgClass[bg]} ${bg === "dark" ? "grain clip" : ""} ${pad(layout.spaceTop)}`}>
      <div className="mx-auto grid max-w-site items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        <FadeIn className={left ? "lg:order-2" : ""}>
          {str(data.eyebrow) && <Eyebrow tone={t.eyebrow}>{str(data.eyebrow)}</Eyebrow>}
          {str(data.title) && <h2 className={`display mt-6 text-fluid-6xl md:text-7xl ${t.title}`}>{str(data.title)}</h2>}
          <RichText html={str(data.body)} className={`mt-8 text-lg leading-relaxed ${t.body}`} />
          {ctx.href(ctaValue?.link) && ctaValue?.label && (
            <div className="mt-9">
              <CtaButton cta={ctaValue} ctx={ctx} variant={bg === "dark" ? "primary" : "dark"} />
            </div>
          )}
        </FadeIn>
        <FadeIn delay={120} className={left ? "lg:order-1" : ""}>
          <div className={upright ? "mx-auto w-full max-w-[18rem] sm:max-w-sm" : ""}>
            <MediaSlot
              ctx={ctx}
              kind={data.placeholder === "video" ? "video" : "photo"}
              image={data.image}
              video={data.video}
              poster={data.poster}
              text={str(data.placeholderText)}
              label={str(data.title)}
              aspect={aspect}
              sizes={upright ? "(min-width: 640px) 384px, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
              className="rounded-panel"
              fallback={
                <div className="grain relative flex items-center justify-center overflow-hidden rounded-panel bg-ink" style={{ aspectRatio: aspect }}>
                  <GorillaMark className="relative w-[60%] text-white/10" />
                </div>
              }
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function ImageBlock({ data, ctx, layout }: BlockProps) {
  const bg = asBg(data.background, "white");
  const image = ctx.media(data.image as string | null);
  if (!image) return null;
  const aspect = str(data.aspect) || "original";
  const wide = data.size === "wide";
  return (
    <section className={`${bgClass[bg]} ${pad(layout.spaceTop, "sm")}`}>
      <figure className={`mx-auto px-3 sm:px-6 ${wide ? "max-w-site-wide" : "max-w-site"}`}>
        <FadeIn>
          {aspect === "original" ? (
            <MediaImage media={image} fill={false} className="h-auto w-full rounded-panel" sizes="(min-width: 1280px) 1280px, 100vw" />
          ) : (
            <div className="relative overflow-hidden rounded-panel bg-ink" style={{ aspectRatio: aspect }}>
              <MediaImage media={image} sizes="(min-width: 1280px) 1280px, 100vw" />
            </div>
          )}
          {str(data.caption) && (
            <figcaption className={`mt-4 text-center text-sm ${bg === "dark" ? "text-paper/55" : "text-ink/60"}`}>
              {str(data.caption)}
            </figcaption>
          )}
        </FadeIn>
      </figure>
    </section>
  );
}

export function ContactDetailsBlock({ data, ctx, layout }: BlockProps) {
  const bg = asBg(data.background, "light");
  const t = textOn(bg);
  const { contact, company } = ctx.bundle.settings;
  const rows = [
    contact.email && { label: "E-mail", value: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { label: "Telefoon", value: contact.phone, href: `tel:${contact.phone.replace(/[^0-9+]/g, "")}` },
    company.address && { label: "Adres", value: company.address, href: null },
    company.kvk && { label: "KvK", value: company.kvk, href: null },
  ].filter(Boolean) as { label: string; value: string; href: string | null }[];
  if (!rows.length) return null;
  return (
    <section className={`${bgClass[bg]} ${pad(layout.spaceTop)}`}>
      <div className="mx-auto grid max-w-site gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        <FadeIn>
          {str(data.eyebrow) && <Eyebrow tone={t.eyebrow}>{str(data.eyebrow)}</Eyebrow>}
          {str(data.title) && <h2 className={`display mt-6 text-fluid-6xl md:text-7xl ${t.title}`}>{str(data.title)}</h2>}
          {str(data.intro) && <p className={`mt-6 text-lg leading-relaxed ${t.body}`}>{str(data.intro)}</p>}
        </FadeIn>
        <FadeIn delay={100}>
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label} className={`rounded-card p-7 ${bg === "dark" ? "bg-ink-2" : bg === "light" ? "bg-white" : "bg-mist"}`}>
                <dt className={`text-sm font-semibold ${bg === "dark" ? "text-paper/55" : "text-ink/60"}`}>{r.label}</dt>
                <dd className={`mt-2 whitespace-pre-line text-lg font-semibold ${t.title}`}>
                  {r.href ? <a href={r.href} className="underline decoration-accent decoration-2 underline-offset-4">{r.value}</a> : r.value}
                </dd>
              </div>
            ))}
          </dl>
        </FadeIn>
      </div>
    </section>
  );
}
