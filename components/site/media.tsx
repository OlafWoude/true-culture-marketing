import type { ReactNode } from "react";
import Eyebrow from "@/components/Eyebrow";
import FadeIn from "@/components/FadeIn";
import GorillaMark from "@/components/GorillaMark";
import type { RenderCtx } from "@/lib/cms/render";
import { CameraIcon, PlayIcon } from "@/lib/icons";
import MobileCarousel from "./MobileCarousel";
import VideoPlayer from "./VideoPlayer";
import { asBg, bgClass, list, MediaImage, pad, str, type BlockProps } from "./shared";

export type MediaKind = "photo" | "video";

const asId = (value: unknown) => (typeof value === "string" && value ? value : null);

/** Whether a media field holds an existing photo or video (and not, say, a photo in a video field). */
export function hasMedia(ctx: RenderCtx, id: unknown, kind: "image" | "video") {
  return ctx.media(asId(id))?.kind === kind;
}

/** Stands in for a photo or video that has not been added yet, so the page already shows where it goes. */
export function MediaPlaceholder({ kind, text }: { kind: MediaKind; text?: string }) {
  const Icon = kind === "video" ? PlayIcon : CameraIcon;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-ink-2 p-6 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,color-mix(in_srgb,var(--tc-accent)_14%,transparent),transparent_60%)]"
      />
      <GorillaMark className="absolute -bottom-[6%] -right-[14%] w-[90%] text-white/[0.05]" />
      <span aria-hidden="true" className="relative flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 text-accent">
        <Icon className="h-6 w-6" />
      </span>
      <p className="relative mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{kind === "video" ? "Video volgt" : "Foto volgt"}</p>
      {text && <p className="relative mt-2 max-w-[24ch] text-sm leading-snug text-paper/75">{text}</p>}
    </div>
  );
}

type MediaSlotProps = {
  ctx: RenderCtx;
  /** What belongs here while the slot is still empty. */
  kind: MediaKind;
  image?: unknown;
  video?: unknown;
  /** A photo to show before the video plays; without one a still from the video itself is used. */
  poster?: unknown;
  /** Shown on the placeholder, e.g. "Het team na een werkdag". */
  text?: string;
  /** What the video is about, for the play button. */
  label?: string;
  aspect: string;
  /** Tailwind aspect classes instead of `aspect`, for a ratio that changes with the screen size. */
  aspectClass?: string;
  sizes: string;
  className?: string;
  preload?: boolean;
  /** False keeps the fallback even when placeholders are switched on. */
  allowPlaceholder?: boolean;
  fallback?: ReactNode;
};

/** A video if there is one, else a photo, else a placeholder (when the site shows them), else the fallback. */
export function MediaSlot({
  ctx,
  kind,
  image,
  video,
  poster,
  text = "",
  label = "",
  aspect,
  aspectClass,
  sizes,
  className = "",
  preload = false,
  allowPlaceholder = true,
  fallback = null,
}: MediaSlotProps) {
  const clip = ctx.media(asId(video));
  const photo = ctx.media(asId(image));
  const frame = (children: ReactNode) => (
    <div className={`relative overflow-hidden bg-ink ${aspectClass ?? ""} ${className}`} style={aspectClass ? undefined : { aspectRatio: aspect }}>
      {children}
    </div>
  );

  if (clip?.kind === "video") {
    const still = ctx.media(asId(poster));
    const posterInfo =
      still?.kind === "image"
        ? { url: still.url, position: `${still.focalX}% ${still.focalY}%` }
        : clip.posterUrl
          ? { url: clip.posterUrl, position: `${clip.focalX}% ${clip.focalY}%` }
          : null;
    return frame(
      <VideoPlayer
        src={clip.url}
        type={clip.mimeType}
        poster={posterInfo}
        label={label || clip.alt || text || "video"}
        duration={clip.duration}
        sizes={sizes}
        position={`${clip.focalX}% ${clip.focalY}%`}
      />,
    );
  }
  if (photo?.kind === "image") return frame(<MediaImage media={photo} sizes={sizes} preload={preload} />);
  if (ctx.showPlaceholders && allowPlaceholder) return frame(<MediaPlaceholder kind={kind} text={text} />);
  return <>{fallback}</>;
}

function SectionHeader({ data, dark }: { data: BlockProps["data"]; dark: boolean }) {
  if (!str(data.eyebrow) && !str(data.title) && !str(data.intro)) return null;
  return (
    <FadeIn>
      <div className="mx-auto max-w-3xl text-center">
        {str(data.eyebrow) && <Eyebrow tone={dark ? "dark" : "light"}>{str(data.eyebrow)}</Eyebrow>}
        {str(data.title) && <h2 className={`display mt-6 text-fluid-6xl md:text-7xl ${dark ? "text-paper" : "text-ink"}`}>{str(data.title)}</h2>}
        {str(data.intro) && <p className={`mx-auto mt-6 max-w-xl text-lg ${dark ? "text-paper/65" : "text-ink/65"}`}>{str(data.intro)}</p>}
      </div>
    </FadeIn>
  );
}

const photoCols = (n: number) =>
  n === 1 ? "max-w-sm" : n === 2 ? "max-w-3xl sm:grid-cols-2" : n === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";

export function PhotoStripBlock({ data, ctx, layout }: BlockProps) {
  const bg = asBg(data.background, "light");
  const dark = bg === "dark";
  const carousel = data.mobileCarousel !== false;
  const photos = list<{ image?: unknown; caption?: unknown }>(data.photos)
    .map((p) => ({ image: p.image, caption: str(p.caption), real: hasMedia(ctx, p.image, "image") }))
    .filter((p) => p.real || ctx.showPlaceholders);
  if (!photos.length) return null;

  return (
    <section className={`${bgClass[bg]} ${dark ? "grain clip" : ""} ${pad(layout.spaceTop)}`}>
      <div className="mx-auto max-w-site px-6">
        <SectionHeader data={data} dark={dark} />
        <MobileCarousel
          enabled={carousel}
          tone={dark ? "dark" : "light"}
          label={str(data.title) || "Foto's"}
          itemWidth="max-md:*:w-[min(72%,17rem)]"
          className={`mx-auto mt-12 grid gap-4 md:mt-16 ${photoCols(photos.length)}`}
        >
          {photos.map((p, i) => (
            <FadeIn key={i} className={i % 2 === 1 && photos.length > 2 ? "lg:mt-12" : ""}>
              <figure>
                <MediaSlot
                  ctx={ctx}
                  kind="photo"
                  image={p.image}
                  text={p.caption}
                  aspect="4/5"
                  sizes="(min-width: 1024px) 288px, (min-width: 640px) 50vw, 72vw"
                  className="rounded-tile"
                />
                {p.real && p.caption && <figcaption className={`mt-3 text-sm ${dark ? "text-paper/60" : "text-ink/60"}`}>{p.caption}</figcaption>}
              </figure>
            </FadeIn>
          ))}
        </MobileCarousel>
      </div>
    </section>
  );
}

type Story = { video?: unknown; poster?: unknown; name?: unknown; role?: unknown; quote?: unknown; transcript?: unknown };

export function VideoStoriesBlock({ data, ctx, layout }: BlockProps) {
  const bg = asBg(data.background, "dark");
  const dark = bg === "dark";
  const carousel = data.mobileCarousel !== false;
  const stories = list<Story>(data.items)
    .map((s) => ({ ...s, name: str(s.name), role: str(s.role), quote: str(s.quote), transcript: str(s.transcript), real: hasMedia(ctx, s.video, "video") }))
    .filter((s) => s.real || ctx.showPlaceholders);
  if (!stories.length) return null;
  const muted = dark ? "text-paper/60" : "text-ink/60";

  return (
    <section className={`${bgClass[bg]} ${dark ? "grain clip" : ""} ${pad(layout.spaceTop)}`}>
      {dark && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--tc-accent)_7%,transparent),transparent_60%)]" />
      )}
      <div className="relative mx-auto max-w-site px-6">
        <SectionHeader data={data} dark={dark} />
        <MobileCarousel
          enabled={carousel}
          tone={dark ? "dark" : "light"}
          label={str(data.title) || "Video's"}
          itemWidth="max-md:*:w-[min(64%,15rem)]"
          className={`mx-auto mt-12 grid gap-5 sm:grid-cols-2 md:mt-16 ${stories.length >= 3 ? "max-w-5xl lg:grid-cols-3" : "max-w-3xl"}`}
        >
          {stories.map((s, i) => {
            const who = [s.name, s.role].filter(Boolean).join(", ");
            return (
              <FadeIn key={i}>
                <figure className="flex h-full flex-col">
                  <MediaSlot
                    ctx={ctx}
                    kind="video"
                    video={s.video}
                    poster={s.poster}
                    text={s.role || s.name}
                    label={who || "een collega over het werk"}
                    aspect="9/16"
                    sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 64vw"
                    className="rounded-card"
                  />
                  {s.real && (s.quote || who) && (
                    <figcaption className="mt-5">
                      {s.quote && <p className={`text-lg leading-snug ${dark ? "text-paper/85" : "text-ink/80"}`}>“{s.quote}”</p>}
                      {s.name && <p className={`font-semibold ${s.quote ? "mt-3" : ""} ${dark ? "text-paper" : "text-ink"}`}>{s.name}</p>}
                      {s.role && <p className={`text-sm ${muted}`}>{s.role}</p>}
                    </figcaption>
                  )}
                  {s.real && s.transcript && (
                    <details className="mt-4">
                      <summary className={`cursor-pointer text-sm font-semibold underline decoration-accent decoration-2 underline-offset-4 ${dark ? "text-paper" : "text-ink"}`}>
                        Lees wat er gezegd wordt
                      </summary>
                      <p className={`mt-3 whitespace-pre-line text-sm leading-relaxed ${muted}`}>{s.transcript}</p>
                    </details>
                  )}
                </figure>
              </FadeIn>
            );
          })}
        </MobileCarousel>
      </div>
    </section>
  );
}
