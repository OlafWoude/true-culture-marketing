"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import GorillaMark from "@/components/GorillaMark";
import { PlayIcon } from "@/lib/icons";

type VideoPlayerProps = {
  src: string;
  type: string;
  /** Shown until the video plays; without one a branded background stands in. */
  poster: { url: string; position: string } | null;
  /** What the video is about, for the play button. */
  label: string;
  duration: number | null;
  sizes: string;
  position: string;
};

const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;

/**
 * Shows a still with a play button and loads nothing of the video itself until the visitor presses play,
 * so a page with several videos stays as light as a page with photos. Only one video plays at a time.
 */
export default function VideoPlayer({ src, type, poster, label, duration, sizes, position }: VideoPlayerProps) {
  const video = useRef<HTMLVideoElement>(null);
  const still = useRef<HTMLImageElement>(null);
  const [started, setStarted] = useState(false);
  const [posterSrc, setPosterSrc] = useState<string | undefined>(undefined);

  const start = () => {
    const el = video.current;
    if (!el) return;
    // The still is already loaded, so the video shows it instead of a black frame while it buffers.
    setPosterSrc(still.current?.currentSrc || undefined);
    setStarted(true);
    // Called inside the tap itself, so phones allow playing with sound.
    el.play().catch(() => {});
    el.focus({ preventScroll: true });
  };

  return (
    <>
      <video
        ref={video}
        className="absolute inset-0 h-full w-full bg-ink object-cover"
        style={{ objectPosition: position }}
        controls={started}
        playsInline
        preload="none"
        poster={posterSrc}
        tabIndex={started ? undefined : -1}
        aria-hidden={started ? undefined : true}
        onPlay={(e) => {
          for (const other of document.querySelectorAll("video")) if (other !== e.currentTarget) other.pause();
        }}
      >
        <source src={src} type={type === "video/quicktime" ? "video/mp4" : type} />
      </video>
      {!started && (
        <button
          type="button"
          onClick={start}
          aria-label={`Speel de video af: ${label}`}
          className="group absolute inset-0 flex items-center justify-center overflow-hidden bg-ink-2 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
        >
          {poster ? (
            <Image ref={still} src={poster.url} alt="" fill sizes={sizes} className="object-cover" style={{ objectPosition: poster.position }} />
          ) : (
            <GorillaMark className="absolute -bottom-[6%] -right-[14%] w-[90%] text-white/[0.06]" />
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
          <span
            aria-hidden="true"
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform duration-200 group-hover:scale-105 motion-safe:group-active:scale-95"
          >
            <PlayIcon className="ml-1 h-7 w-7 fill-current" />
          </span>
          {duration ? (
            <span aria-hidden="true" className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold tabular-nums text-white">
              {formatDuration(duration)}
            </span>
          ) : null}
        </button>
      )}
    </>
  );
}
