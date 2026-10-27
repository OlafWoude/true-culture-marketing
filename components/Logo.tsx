import Image from "next/image";
import type { MediaInfo } from "@/lib/cms/types";

type LogoProps = {
  size?: "sm" | "lg";
  media?: MediaInfo | null;
  alt?: string;
  /** For the logo in the menu: visible straight away, so it should not wait for lazy loading. */
  eager?: boolean;
};

const WORDMARK = { url: "/brand/wordmark.png", width: 760, height: 295 };

export default function Logo({ size = "sm", media = null, alt = "True Culture Marketing", eager = false }: LogoProps) {
  const cls = size === "lg" ? "h-20 w-auto" : "h-10 w-auto sm:h-11";
  const image = media ?? WORDMARK;
  // The logo is drawn at a fixed height, so its width follows from the aspect ratio. Telling the browser
  // keeps phones from downloading a version many times larger than the logo on screen.
  const shownWidth = image.height > 0 ? Math.ceil((size === "lg" ? 80 : 44) * (image.width / image.height)) : 240;
  return (
    <Image
      src={image.url}
      alt={media?.alt || alt}
      width={image.width}
      height={image.height}
      sizes={`${shownWidth}px`}
      loading={eager ? "eager" : undefined}
      className={media ? `${cls} object-contain` : cls}
    />
  );
}
