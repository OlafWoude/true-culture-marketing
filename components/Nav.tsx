"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { WhatsAppIcon } from "@/lib/icons";
import { vacancyFromPath, withVacancy } from "@/lib/vacancy-link";
import { chatHrefFor, type ChatLinks } from "./site/FloatingActions";

export type NavLink = { label: string; href: string; external: boolean; children: { label: string; href: string; external: boolean }[] };

type NavProps = {
  logo: ReactNode;
  items: NavLink[];
  /** `form`: the button leads to the application form, so on a vacancy page it says which vacancy. */
  cta: { label: string; mobileLabel: string; href: string; external: boolean; form?: boolean } | null;
  variant: "floating" | "bar";
  homeHref?: string;
  offsetTop?: boolean;
  chat?: ChatLinks | null;
};

function SmartLink({ href, external, className, children, onClick, current }: { href: string; external: boolean; className: string; children: ReactNode; onClick?: () => void; current?: boolean }) {
  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}

// Close to the top of the page the menu always shows; further down it follows the scroll direction.
const ALWAYS_SHOWN_UNTIL = 80;
// How far (px) someone scrolls in one direction before the menu reacts, so a resting thumb changes nothing.
const HIDE_AFTER = 12;
const SHOW_AFTER = 8;

/**
 * Hides the menu while the visitor scrolls down and brings it back as soon as they scroll up, so on a
 * phone it never covers what they are reading. Only the classes for small screens use the result.
 */
function useHideOnScroll(nav: RefObject<HTMLElement | null>) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let travel = 0;
    let frame = 0;
    let settleUntil = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const focused = document.activeElement;
      // Someone moving through the menu with a keyboard must always see where they are.
      const keyboardInMenu = focused instanceof HTMLElement && nav.current?.contains(focused) && focused.matches(":focus-visible");
      if (y < ALWAYS_SHOWN_UNTIL || keyboardInMenu || performance.now() < settleUntil) {
        setHidden(false);
        lastY = y;
        travel = 0;
        return;
      }
      // iOS bounces past the end of the page; that is not the visitor scrolling back up.
      if (y > document.documentElement.scrollHeight - window.innerHeight) return;
      const step = y - lastY;
      lastY = y;
      if (step === 0) return;
      travel = Math.sign(step) === Math.sign(travel) ? travel + step : step;
      if (travel > HIDE_AFTER) setHidden(true);
      else if (travel < -SHOW_AFTER) setHidden(false);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    // Back and forward restore the old scroll position: show the menu rather than reading that jump as scrolling.
    const onHistory = () => {
      settleUntil = performance.now() + 500;
      setHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onHistory);
    window.addEventListener("pageshow", onHistory);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onHistory);
      window.removeEventListener("pageshow", onHistory);
      cancelAnimationFrame(frame);
    };
  }, [nav]);

  return [hidden, setHidden] as const;
}

export default function Nav({ logo, items, cta, variant, homeHref = "/", offsetTop = false, chat = null }: NavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [hidden, setHidden] = useHideOnScroll(navRef);
  const close = () => setOpen(false);

  // The open menu closes with Escape (focus goes back to the menu button) or a tap anywhere outside it.
  useEffect(() => {
    if (!open) return;
    const dismiss = () => {
      setOpen(false);
      setHidden(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      dismiss();
      buttonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) dismiss();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, setHidden]);

  const vacancy = vacancyFromPath(pathname);
  const ctaHref = cta?.form && vacancy ? withVacancy(cta.href, vacancy) : cta?.href;
  const floating = variant === "floating";
  // An open menu stays put, also after closing it, until the visitor scrolls down again.
  const concealed = hidden && !open;
  const toggle = () => {
    setOpen((v) => !v);
    setHidden(false);
  };
  // Slides out quickly and comes back with a soft deceleration; with reduced motion it only fades in.
  const motion = concealed
    ? `${offsetTop ? "max-md:-translate-y-[calc(100%+5rem)]" : "max-md:-translate-y-[calc(100%+2rem)]"} max-md:opacity-0 duration-200 ease-in`
    : "duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-50 ${floating ? "px-4" : ""} ${offsetTop ? (floating ? "top-14" : "top-10") : floating ? "top-4" : "top-0"}`}
    >
      <nav
        ref={navRef}
        aria-label="Hoofdmenu"
        data-concealed={concealed || undefined}
        onFocus={(e) => {
          if (e.target.matches(":focus-visible")) setHidden(false);
        }}
        className={`pointer-events-auto transition-[translate,opacity] motion-reduce:transition-opacity ${motion} ${
          floating
            ? "mx-auto max-w-site rounded-inner border border-white/[0.06] bg-ink-2/90 shadow-nav backdrop-blur-md"
            : "border-b border-white/[0.06] bg-ink-2/95 shadow-nav backdrop-blur-md"
        }`}
      >
        <div className={`flex items-center justify-between py-3 ${floating ? "px-4 sm:px-6" : "mx-auto max-w-site px-6"}`}>
          <Link href={homeHref} className="-my-1 shrink-0 py-1" aria-label="Naar de homepage">
            {logo}
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const active = pathname === item.href;
              const linkCls = `rounded-full px-4 py-2 text-[15px] transition-colors ${active ? "text-paper" : "text-paper/65 hover:text-paper"}`;
              return (
                <li key={item.label + item.href} className="group/item relative">
                  <SmartLink href={item.href} external={item.external} className={linkCls} current={active}>
                    {item.label}
                    {item.children.length > 0 && <span aria-hidden="true" className="ml-1 text-xs">▾</span>}
                  </SmartLink>
                  {item.children.length > 0 && (
                    <ul className="invisible absolute left-0 top-full z-10 min-w-56 translate-y-1 rounded-inner border border-white/[0.08] bg-ink-2 p-2 opacity-0 shadow-nav transition-all duration-150 group-focus-within/item:visible group-focus-within/item:translate-y-0 group-focus-within/item:opacity-100 group-hover/item:visible group-hover/item:translate-y-0 group-hover/item:opacity-100">
                      {item.children.map((child) => (
                        <li key={child.label + child.href}>
                          <SmartLink
                            href={child.href}
                            external={child.external}
                            className="block rounded-control px-3 py-2 text-[15px] text-paper/75 hover:bg-white/[0.06] hover:text-paper"
                          >
                            {child.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            {cta && (
              <SmartLink
                href={ctaHref ?? cta.href}
                external={cta.external}
                className="btn-text hidden rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover sm:inline-flex"
              >
                {cta.label}
              </SmartLink>
            )}
            <button
              ref={buttonRef}
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls="mobiel-menu"
              aria-label={open ? "Menu sluiten" : "Menu openen"}
              className="relative flex h-10 w-10 items-center justify-center rounded-control bg-white/[0.06] after:absolute after:-inset-1 md:hidden"
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-paper transition-transform duration-200 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 w-5 rounded bg-paper transition-transform duration-200 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        {open && (
          <div id="mobiel-menu" className="max-h-[calc(100svh-7rem)] overflow-y-auto overscroll-contain border-t border-white/[0.06] px-4 pb-5 pt-2 md:hidden">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.label + item.href}>
                  <SmartLink href={item.href} external={item.external} onClick={close} className="block border-b border-white/[0.06] py-4 text-lg text-paper/85 active:text-paper">
                    {item.label}
                  </SmartLink>
                  {item.children.length > 0 && (
                    <ul className="border-b border-white/[0.06] py-2 pl-4">
                      {item.children.map((child) => (
                        <li key={child.label + child.href}>
                          <SmartLink href={child.href} external={child.external} onClick={close} className="block py-2 text-paper/70">
                            {child.label}
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            {cta && (
              <SmartLink
                href={ctaHref ?? cta.href}
                external={cta.external}
                onClick={close}
                className="btn-text mt-5 flex justify-center rounded-control bg-accent px-5 py-3.5 font-semibold text-on-accent active:bg-accent-hover"
              >
                {cta.mobileLabel || cta.label}
              </SmartLink>
            )}
            {chat && (
              <a
                href={chatHrefFor(chat, pathname)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="mt-3 flex items-center justify-center gap-2.5 rounded-control border border-white/15 px-5 py-3.5 font-semibold text-paper active:border-white/40"
              >
                <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
                {chat.label}
              </a>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
