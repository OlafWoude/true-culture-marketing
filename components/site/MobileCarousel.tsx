"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

type MobileCarouselProps = {
  children: ReactNode;
  /** Layout from tablet width upwards, and on phones when the carousel is switched off. */
  className?: string;
  /** Lets the scroller run to the edges of its container on phones (must cancel the parent's padding). */
  bleed?: string;
  as?: "div" | "ol" | "ul";
  enabled?: boolean;
  tone?: "light" | "dark";
  label: string;
  /** Width of each card on phones. */
  itemWidth?: string;
};

// Below the md breakpoint the children sit side by side and snap into place; from md upwards nothing changes.
const SCROLLER =
  "max-md:relative max-md:flex max-md:snap-x max-md:snap-mandatory max-md:gap-3 max-md:space-y-0 max-md:overflow-x-auto max-md:overscroll-x-contain max-md:py-1 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden max-md:*:shrink-0 max-md:*:snap-start";

const dotTone = {
  light: { active: "bg-ink", idle: "bg-ink/20" },
  dark: { active: "bg-accent", idle: "bg-white/25" },
};

export default function MobileCarousel({
  children,
  className = "",
  bleed = "max-md:-mx-6 max-md:px-6 max-md:scroll-px-6",
  as = "div",
  enabled = true,
  tone = "light",
  label,
  itemWidth = "max-md:*:w-[min(84%,20rem)]",
}: MobileCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const count = Children.count(children);
  const on = enabled && count > 1;
  const [active, setActive] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  // Only while the row actually scrolls sideways (phones) can keyboard users focus it and use the arrow keys.
  useEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    const observer = new ResizeObserver(() => setScrollable(el.scrollWidth > el.clientWidth + 1));
    observer.observe(el);
    return () => observer.disconnect();
  }, [on]);

  useEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const items = Array.from(el.children) as HTMLElement[];
        if (!items.length) return;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
          setActive(items.length - 1);
          return;
        }
        const start = el.scrollLeft + parseFloat(getComputedStyle(el).paddingLeft);
        let best = 0;
        items.forEach((item, i) => {
          if (Math.abs(item.offsetLeft - start) < Math.abs(items[best].offsetLeft - start)) best = i;
        });
        setActive(best);
      });
    };
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      el.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, [on]);

  const goTo = (i: number) => {
    const el = ref.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (!el || !item) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: item.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: reduce ? "auto" : "smooth" });
  };

  const Tag = as as "div";
  const colors = dotTone[tone];

  return (
    <>
      <Tag
        ref={ref}
        className={on ? `${className} ${SCROLLER} ${itemWidth} ${bleed} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent` : className}
        tabIndex={scrollable ? 0 : undefined}
        role={scrollable && as === "div" ? "region" : undefined}
        aria-label={scrollable ? label : undefined}
      >
        {children}
      </Tag>
      {on && (
        <div className="mt-2.5 flex justify-center md:hidden" role="group" aria-label={`${label}: kies een kaart`}>
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Kaart ${i + 1} van ${count}`}
              aria-current={i === active ? "true" : undefined}
              // At least 24 by 44 pixels to tap, while the dots themselves stay small.
              className="flex h-11 items-center px-[9px]"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 ${i === active ? `w-6 ${colors.active}` : `w-1.5 ${colors.idle}`}`}
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
