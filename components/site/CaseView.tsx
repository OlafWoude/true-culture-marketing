import Link from "next/link";
import { notFound } from "next/navigation";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";
import Sections from "./Sections";
import { MediaImage, RichText } from "./shared";
import { createRenderCtx } from "@/lib/cms/render";
import type { Bundle } from "@/lib/cms/types";

export default function CaseView({ bundle, slug }: { bundle: Bundle; slug: string }) {
  const item = bundle.cases.find((c) => c.slug === slug);
  if (!item) notFound();
  const ctx = createRenderCtx(bundle);
  const cover = ctx.media(item.coverImage);
  const gallery = item.gallery.map((id) => ctx.media(id)).filter((m) => m !== null);
  const closing = bundle.pages
    .find((p) => p.systemKey === "home")
    ?.sections.filter((s) => s.type === "closingCta" && !s.hidden)
    .slice(0, 1);

  return (
    <>
      <section className="grain overflow-hidden bg-ink">
        <GorillaMark watermark className="absolute -right-24 bottom-0 hidden w-[680px] text-white/[0.045] md:block" />
        <div className="relative mx-auto max-w-site px-6 pb-16 pt-40 md:pb-20 md:pt-48">
          <FadeIn>
            <Eyebrow>{item.client || "Case"}</Eyebrow>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 className="display mt-7 max-w-5xl text-fluid-6xl text-paper sm:text-7xl md:text-8xl">{item.title}</h1>
          </FadeIn>
          {item.summary && (
            <FadeIn delay={160}>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-paper/65">{item.summary}</p>
            </FadeIn>
          )}
          {item.results.length > 0 && (
            <FadeIn delay={220}>
              <dl className="mt-12 grid gap-4 sm:grid-cols-3">
                {item.results.map((r, i) => (
                  <div key={i} className="rounded-tile border border-white/[0.08] bg-ink-2 p-6">
                    <dt className="display text-5xl text-accent">{r.value}</dt>
                    <dd className="mt-2 text-sm text-paper/65">{r.label}</dd>
                  </div>
                ))}
              </dl>
            </FadeIn>
          )}
        </div>
      </section>

      <section className="bg-mist py-section-sm">
        <div className="mx-auto max-w-site px-6">
          {cover && (
            <FadeIn>
              <div className="relative aspect-[16/9] overflow-hidden rounded-panel bg-ink">
                <MediaImage media={cover} priority sizes="(min-width: 1280px) 1152px, 100vw" />
              </div>
            </FadeIn>
          )}
          <div className={`mx-auto max-w-3xl ${cover ? "mt-16" : ""}`}>
            <RichText html={item.body} className="text-lg leading-relaxed text-ink/75 [&_h2]:text-ink [&_h3]:text-ink" />
          </div>
          {gallery.length > 0 && (
            <div className="mt-16 grid gap-4 sm:grid-cols-2">
              {gallery.map((m) => (
                <div key={m.id} className="relative aspect-[4/3] overflow-hidden rounded-card bg-ink">
                  <MediaImage media={m} sizes="(min-width: 640px) 50vw, 100vw" />
                </div>
              ))}
            </div>
          )}
          <div className="mx-auto mt-16 max-w-3xl">
            <Link href="/" className="text-sm font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4">
              ← Terug naar de homepage
            </Link>
          </div>
        </div>
      </section>

      {closing && closing.length > 0 && <Sections sections={closing} ctx={ctx} />}
    </>
  );
}

