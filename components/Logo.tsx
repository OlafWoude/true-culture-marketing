import Image from "next/image";
import type { MediaInfo } from "@/lib/cms/types";

type LogoProps = {
  size?: "sm" | "lg";
  media?: MediaInfo | null;
  alt?: string;
};

export default function Logo({ size = "sm", media = null, alt = "True Culture Marketing" }: LogoProps) {
  const cls = size === "lg" ? "h-20 w-auto" : "h-10 w-auto sm:h-11";
  if (media) {
    return (
      <Image
        src={media.url}
        alt={media.alt || alt}
        width={media.width}
        height={media.height}
        priority={size === "sm"}
        sizes="200px"
        className={`${cls} object-contain`}
      />
    );
  }
  return (
    <Image
      src="/brand/wordmark.png"
      alt={alt}
      width={760}
      height={295}
      priority={size === "sm"}
      className={cls}
    />
  );
}
