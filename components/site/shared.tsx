import "server-only";
import Image from "next/image";
import { sanitizeRichText } from "@/lib/cms/sanitize";
import type { MediaInfo } from "@/lib/cms/types";
import type { RenderCtx } from "@/lib/cms/render";
import type { Values } from "@/lib/cms/fields";

export type Bg = "white" | "light" | "dark";
export type SpaceTop = "full" | "none" | "small";

export type BlockProps = {
  data: Values;
  ctx: RenderCtx;
  layout: { spaceTop: SpaceTop; nextBg: Bg | null; index: number };
};

export const bgClass: Record<Bg, string> = { white: "bg-paper", light: "bg-mist", dark: "bg-ink" };

export function asBg(value: unknown, fallback: Bg): Bg {
  return value === "white" || value === "light" || value === "dark" ? value : fallback;
}

export function pad(spaceTop: SpaceTop, size: "md" | "sm" = "md") {
  if (size === "sm") {
    return spaceTop === "full" ? "py-section-sm" : spaceTop === "small" ? "pt-12 pb-section-sm" : "pb-section-sm";
  }
  return spaceTop === "full" ? "py-section" : spaceTop === "small" ? "pt-12 pb-section" : "pb-section";
}

export const str = (v: unknown) => (typeof v === "string" ? v : "");
export const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export function RichText({ html, className = "" }: { html: string; className?: string }) {
  const clean = sanitizeRichText(html);
  if (!clean) return null;
  return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function Title({ title, highlight, newLine = false }: { title: string; highlight: string; newLine?: boolean }) {
  return (
    <>
      {title}
      {highlight &&
        (newLine ? (
          <span className="block text-accent">{highlight}</span>
        ) : (
          <>
            {title ? " " : ""}
            <span className="text-accent">{highlight}</span>
          </>
        ))}
    </>
  );
}

export function MediaImage({
  media,
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  fill = true,
}: {
  media: MediaInfo;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const position = `${media.focalX}% ${media.focalY}%`;
  if (!fill) {
    return (
      <Image
        src={media.url}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes={sizes}
        priority={priority}
        className={className}
        style={{ objectPosition: position }}
      />
    );
  }
  return (
    <Image
      src={media.url}
      alt={media.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
      style={{ objectPosition: position }}
    />
  );
}
