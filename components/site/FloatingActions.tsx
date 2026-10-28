"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRightIcon, WhatsAppIcon } from "@/lib/icons";
import { vacancyFromPath, withVacancy } from "@/lib/vacancy-link";

export type ChatLinks = {
  /** The chat with the standard message. */
  href: string;
  /** Chats that name the vacancy, by the vacancy's URL name. */
  byVacancy: Record<string, string>;
  label: string;
};

/** The chat link for the page that is open: on a vacancy page the message names that vacancy. */
export function chatHrefFor(chat: ChatLinks, pathname: string) {
  const vacancy = vacancyFromPath(pathname);
  return (vacancy && chat.byVacancy[vacancy]) || chat.href;
}

type FloatingActionsProps = {
  /** The fixed apply button on phones; `form`: it leads to the application form, so on a vacancy page it says which vacancy. */
  apply: { label: string; href: string; external: boolean; form: boolean } | null;
  chat: ChatLinks | null;
  /** Show the chat button in the corner (the apply bar on phones has its own). */
  floatingChat: boolean;
  /** Pages with the application form, where the form itself is the call to action. */
  formPaths: string[];
};

const applyClasses =
  "btn-text flex flex-1 items-center justify-center gap-2 rounded-btn bg-accent px-5 py-3.5 font-semibold text-on-accent transition-[background-color,scale] duration-150 active:bg-accent-hover motion-safe:active:scale-[0.98]";

/**
 * Buttons that stay in view. On phones: a round WhatsApp button, which makes way for a bar with the apply
 * button and the same WhatsApp button once the visitor scrolls past the top of the page, so there is never
 * more than one thing floating over the content. On larger screens: a labelled WhatsApp button in the corner.
 */
export default function FloatingActions({ apply, chat, floatingChat, formPaths }: FloatingActionsProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 480);
    // The on-screen keyboard would push the buttons over the field being filled in, so they step aside meanwhile.
    const isTextField = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.matches("input:not([type=radio],[type=checkbox],[type=submit],[type=button]), textarea, select");
    const onFocusIn = (e: FocusEvent) => isTextField(e.target) && setTyping(true);
    const onFocusOut = (e: FocusEvent) => isTextField(e.target) && setTyping(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // On the application page the form is the call to action (and its own WhatsApp button sits right above it).
  if (formPaths.includes(pathname) || (apply && pathname === apply.href.split("#")[0])) return null;

  const chatHref = chat ? chatHrefFor(chat, pathname) : null;
  const chatName = chat ? `${chat.label} via WhatsApp` : "";
  const vacancy = vacancyFromPath(pathname);
  const applyHref = apply && apply.form && vacancy ? withVacancy(apply.href, vacancy) : apply?.href;
  const barShown = Boolean(apply) && scrolled && !typing;
  const bubbleShown = !barShown && !typing;

  if (!applyHref && !(chatHref && floatingChat)) return null;

  return (
    <aside aria-label="Snel contact">
      {apply && applyHref && (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 md:hidden ${
            barShown ? "translate-y-0" : "translate-y-[150%]"
          }`}
          inert={!barShown}
        >
          <div className="flex items-center gap-2 rounded-panel bg-ink-2/95 p-2 shadow-nav ring-1 ring-white/10 backdrop-blur">
            {apply.external ? (
              <a href={applyHref} target="_blank" rel="noopener noreferrer" className={applyClasses}>
                {apply.label}
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            ) : (
              <Link href={applyHref} className={applyClasses}>
                {apply.label}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
            {chatHref && (
              <a
                href={chatHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={chatName}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-whatsapp text-white transition-colors duration-150 active:bg-whatsapp-hover"
              >
                <WhatsAppIcon className="h-6 w-6" />
              </a>
            )}
          </div>
        </div>
      )}

      {chatHref && floatingChat && (
        <>
          {/* Phones: lines up with the WhatsApp button in the apply bar, so it seems to stay put when the bar slides in. */}
          <a
            href={chatHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={chatName}
            inert={!bubbleShown}
            className={`fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+0.25rem)] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_-6px_rgba(0,0,0,0.55)] ring-1 ring-black/10 transition-[opacity,scale,visibility] duration-300 active:bg-whatsapp-hover md:hidden ${
              bubbleShown ? "opacity-100" : "invisible pointer-events-none scale-75 opacity-0"
            }`}
          >
            <WhatsAppIcon className="h-7 w-7" />
          </a>
          <div className="rise fixed bottom-6 right-6 z-40 hidden md:block" style={{ animationDelay: "600ms" }}>
            <a
              href={chatHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={chatName}
              className="group flex items-center gap-3 rounded-full bg-ink-2/95 py-2 pl-2 pr-5 text-sm font-semibold text-paper shadow-nav ring-1 ring-white/15 backdrop-blur transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:ring-white/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp text-white transition-colors group-hover:bg-whatsapp-hover">
                <WhatsAppIcon className="h-6 w-6" />
              </span>
              {chat?.label}
            </a>
          </div>
        </>
      )}
    </aside>
  );
}
