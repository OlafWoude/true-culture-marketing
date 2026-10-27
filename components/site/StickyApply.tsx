"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightIcon, WhatsAppIcon } from "@/lib/icons";

type StickyApplyProps = {
  label: string;
  href: string;
  external: boolean;
  whatsapp: string | null;
};

const applyClasses =
  "btn-text flex flex-1 items-center justify-center gap-2 rounded-btn bg-accent px-5 py-3.5 font-semibold text-on-accent transition-[background-color,scale] duration-150 active:bg-accent-hover motion-safe:active:scale-[0.98]";

/** A fixed apply button at the bottom of the screen on phones, shown once the visitor scrolls past the hero. */
export default function StickyApply({ label, href, external, whatsapp }: StickyApplyProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 480);
    // The on-screen keyboard would push the bar over the field being filled in, so it steps aside meanwhile.
    const isTextField = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.matches("input:not([type=radio],[type=checkbox],[type=submit],[type=button]), textarea, select");
    const onFocusIn = (e: FocusEvent) => isTextField(e.target) && setTyping(true);
    const onFocusOut = (e: FocusEvent) => isTextField(e.target) && setTyping(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // On the application page itself the form is the call to action.
  if (pathname === href.split("#")[0]) return null;
  const shown = scrolled && !typing;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${
        shown ? "translate-y-0" : "translate-y-[150%]"
      }`}
      inert={!shown}
    >
      <div className="flex items-center gap-2 rounded-panel bg-ink-2/95 p-2 shadow-nav ring-1 ring-white/10 backdrop-blur">
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={applyClasses}>
            {label}
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        ) : (
          <Link href={href} className={applyClasses}>
            {label}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Stel je vraag via WhatsApp"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-btn bg-white/10 text-paper transition-colors duration-150 active:bg-white/20"
          >
            <WhatsAppIcon className="h-6 w-6" />
          </a>
        )}
      </div>
    </div>
  );
}
