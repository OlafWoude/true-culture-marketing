import Link from "next/link";
import Button from "@/components/Button";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";
import { createRenderCtx } from "@/lib/cms/render";
import type { Bundle, BundleService } from "@/lib/cms/types";
import { breadcrumbJsonLd, employmentLabel, jobPostingJsonLd, paragraphsOf, regionsText, vacanciesPage } from "@/lib/cms/vacancy";
import { ArrowRightIcon, CheckIcon, ClockIcon, EuroIcon, MapPinIcon, WhatsAppIcon } from "@/lib/icons";
import { whatsappHref } from "@/lib/whatsapp";
import { hasMedia, MediaSlot } from "./media";
import MobileCarousel from "./MobileCarousel";
import Sections from "./Sections";
import { str } from "./shared";

function JsonLd({ data }: { data: unknown }) {
  // "<" is escaped so text from the dashboard can never close the script element.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

function ListCard({ title, items, dark = false }: { title: string; items: string[]; dark?: boolean }) {
  const filled = items.filter((i) => i.trim());
  if (!filled.length) return null;
  return (
    <FadeIn>
      <div className={`rounded-card p-7 sm:p-9 ${dark ? "grain clip bg-ink" : "bg-white"}`}>
        <h3 className={`text-xl font-semibold ${dark ? "text-paper" : "text-ink"}`}>{title}</h3>
        <ul className="mt-6 space-y-4">
          {filled.map((item, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                <CheckIcon className="h-4 w-4" />
              </span>
              <span className={`text-[17px] leading-snug ${dark ? "text-paper/90" : "text-ink/85"}`}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </FadeIn>
  );
}

/** A vacancy's own page: everything about the job, its photo and video, and the way to apply. */
export default function VacancyView({ bundle, service }: { bundle: Bundle; service: BundleService }) {
  const ctx = createRenderCtx(bundle, { vacancy: service });
  const apply = ctx.applyHref(service);
  const listPage = vacanciesPage(bundle);
  const listHref = listPage ? ctx.pagePath(listPage.id) : null;

  // The application page's WhatsApp button, so the wording stays editable in one place.
  const formHero = bundle.pages.flatMap((p) => p.sections).find((s) => s.type === "contactHero" && !s.hidden);
  const whatsappLabel = str(formHero?.data.whatsappLabel);
  const whatsapp = whatsappHref(bundle.settings.contact.whatsapp, `Hoi! Ik heb een vraag over de vacature ${service.title}.`);

  const facts = [
    { icon: MapPinIcon, label: "Werkgebied", value: regionsText(service) },
    { icon: ClockIcon, label: "Uren", value: employmentLabel(service.employmentType) },
    { icon: EuroIcon, label: "Verdienen", value: service.payText },
  ].filter((f) => f.value);

  const showPhoto = hasMedia(ctx, service.image, "image") || ctx.showPlaceholders;
  const realVideo = hasMedia(ctx, service.video, "video");
  const showVideo = realVideo || ctx.showPlaceholders;

  // The steps, questions and closing call of the homepage also serve every vacancy.
  const homeSections = bundle.pages.find((p) => p.systemKey === "home")?.sections.filter((s) => !s.hidden) ?? [];
  const firstOf = (type: string) => homeSections.filter((s) => s.type === type).slice(0, 1);
  const others = bundle.services.filter((s) => s.id !== service.id);
  const jobPosting = bundle.mode === "live" ? jobPostingJsonLd(bundle, service) : null;

  return (
    <>
      {jobPosting && <JsonLd data={jobPosting} />}
      {bundle.mode === "live" && <JsonLd data={breadcrumbJsonLd(bundle, service)} />}

      <section className="grain clip bg-ink">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--tc-accent)_8%,transparent),transparent_55%)]" />
        <GorillaMark
          watermark
          className="absolute -right-[10%] top-24 w-[80%] max-w-[560px] text-white/[0.05] lg:-left-40 lg:bottom-0 lg:right-auto lg:top-auto lg:w-[760px] lg:max-w-none lg:text-white/[0.035]"
        />
        <div
          className={`relative mx-auto grid max-w-site gap-12 px-6 pb-16 pt-36 md:pb-24 md:pt-44 ${
            showPhoto ? "lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16" : ""
          }`}
        >
          <div>
            {listHref && (
              <FadeIn immediate>
                <nav aria-label="Kruimelpad" className="text-sm text-paper/60">
                  <ol className="flex flex-wrap items-center gap-2">
                    <li>
                      <Link href={listHref} className="-my-2.5 inline-block py-2.5 underline-offset-4 transition-colors hover:text-paper hover:underline">
                        {listPage?.title || "Vacatures"}
                      </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page" className="text-paper/85">
                      {service.title}
                    </li>
                  </ol>
                </nav>
              </FadeIn>
            )}
            {service.tag && (
              <FadeIn immediate delay={40}>
                <div className="mt-8">
                  <Eyebrow>{service.tag}</Eyebrow>
                </div>
              </FadeIn>
            )}
            <FadeIn immediate delay={80}>
              <h1 className={`display mt-7 text-fluid-6xl text-paper sm:text-7xl md:text-8xl ${showPhoto ? "lg:text-7xl" : ""}`}>{service.title}</h1>
            </FadeIn>
            {service.short && (
              <FadeIn immediate delay={140}>
                <p className="mt-7 max-w-xl text-lg leading-relaxed text-paper/65">{service.short}</p>
              </FadeIn>
            )}
            {facts.length > 0 && (
              <FadeIn immediate delay={180}>
                <dl className={`mt-9 grid gap-x-6 gap-y-4 sm:grid-cols-3 ${showPhoto ? "lg:grid-cols-1" : ""}`}>
                  {facts.map((f) => (
                    <div key={f.label} className="relative min-h-9 pl-12">
                      <dt className="text-xs text-paper/55">
                        <span aria-hidden="true" className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07] text-accent">
                          <f.icon className="h-[18px] w-[18px]" />
                        </span>
                        {f.label}
                      </dt>
                      <dd className="text-[15px] font-medium leading-snug text-paper">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </FadeIn>
            )}
            <FadeIn immediate delay={220}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href={apply} newTab={ctx.isExternal(service.cta?.link)} arrow>
                  {service.cta?.label || "Solliciteer direct"}
                </Button>
                {whatsapp && whatsappLabel && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 rounded-btn border border-white/15 px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:border-white/40"
                  >
                    <WhatsAppIcon className="h-5 w-5 text-accent" />
                    {whatsappLabel}
                  </a>
                )}
              </div>
            </FadeIn>
          </div>
          {showPhoto && (
            <FadeIn immediate delay={160}>
              <MediaSlot
                ctx={ctx}
                kind="photo"
                image={service.image}
                text={`${service.title} in actie`}
                aspect="4/5"
                aspectClass="aspect-[4/3] lg:aspect-[4/5]"
                sizes="(min-width: 1024px) 520px, 100vw"
                className="rounded-panel"
                preload
              />
            </FadeIn>
          )}
        </div>
      </section>

      <section className="bg-mist py-section">
        <div className={`mx-auto grid max-w-site gap-14 px-6 ${showVideo ? "lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20" : ""}`}>
          <div className={showVideo ? "" : "mx-auto w-full max-w-3xl"}>
            {service.description && (
              <FadeIn>
                <h2 className="display text-fluid-6xl text-ink md:text-6xl">Over de functie</h2>
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink/70">
                  {paragraphsOf(service.description).map((p, i) => (
                    <p key={i} className="whitespace-pre-line">
                      {p}
                    </p>
                  ))}
                </div>
              </FadeIn>
            )}
            <div className={`grid gap-4 ${service.description ? "mt-12" : ""}`}>
              <ListCard title="Wat je doet" items={service.points} />
              <ListCard title="Wat we vragen" items={service.requirements} />
              <ListCard title="Wat je krijgt" items={service.offer} dark />
            </div>
          </div>
          {showVideo && (
            <aside aria-label="Video" className="lg:sticky lg:top-28 lg:self-start">
              <FadeIn>
                <figure className="mx-auto max-w-[20rem]">
                  <MediaSlot
                    ctx={ctx}
                    kind="video"
                    video={service.video}
                    poster={service.videoPoster}
                    text={service.videoCaption}
                    label={service.videoCaption || `een collega over ${service.title}`}
                    aspect="9/16"
                    sizes="320px"
                    className="rounded-card"
                  />
                  {realVideo && service.videoCaption && <figcaption className="mt-4 text-center text-sm text-ink/60">{service.videoCaption}</figcaption>}
                </figure>
              </FadeIn>
            </aside>
          )}
        </div>
      </section>

      <Sections sections={[...firstOf("steps"), ...firstOf("faq")]} ctx={ctx} />

      {others.length > 0 && (
        <section className="bg-paper py-section">
          <div className="mx-auto max-w-site px-6">
            <FadeIn>
              <h2 className="display text-fluid-6xl text-ink md:text-6xl">Bekijk ook</h2>
            </FadeIn>
            <MobileCarousel label="Andere vacatures" className={`mt-10 grid gap-4 ${others.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {others.map((s) => (
                <FadeIn key={s.id}>
                  <Link
                    href={ctx.serviceDetailHref(s)}
                    className="group flex h-full flex-col rounded-card border border-transparent bg-mist p-7 transition-colors duration-200 hover:border-ink/15"
                  >
                    {/* Yellow text is unreadable on light grey, so the label uses a darker shade of the accent colour. */}
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--tc-accent)_45%,black)]">{s.tag}</span>
                    <span className="display mt-4 text-[calc(2rem*var(--tc-heading-scale))] text-ink">{s.title}</span>
                    <span className="mt-3 text-[15px] leading-relaxed text-ink/65">{s.short}</span>
                    <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-ink">
                      Bekijk vacature
                      <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </MobileCarousel>
          </div>
        </section>
      )}

      <Sections sections={firstOf("closingCta")} ctx={ctx} />
    </>
  );
}
