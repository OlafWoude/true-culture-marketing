"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

export type NavLink = { label: string; href: string; external: boolean; children: { label: string; href: string; external: boolean }[] };

type NavProps = {
  logo: ReactNode;
  items: NavLink[];
  cta: { label: string; mobileLabel: string; href: string; external: boolean } | null;
  variant: "floating" | "bar";
  homeHref?: string;
  offsetTop?: boolean;
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

export default function Nav({ logo, items, cta, variant, homeHref = "/", offsetTop = false }: NavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);
  const floating = variant === "floating";

  return (
    <div className={`fixed inset-x-0 z-50 ${floating ? "px-4" : ""} ${offsetTop ? (floating ? "top-14" : "top-10") : floating ? "top-4" : "top-0"}`}>
      <nav
        aria-label="Hoofdmenu"
        className={
          floating
            ? "mx-auto max-w-site rounded-inner border border-white/[0.06] bg-ink-2/90 shadow-nav backdrop-blur-md"
            : "border-b border-white/[0.06] bg-ink-2/95 shadow-nav backdrop-blur-md"
        }
      >
        <div className={`flex items-center justify-between py-3 ${floating ? "px-4 sm:px-6" : "mx-auto max-w-site px-6"}`}>
          <Link href={homeHref} className="shrink-0" aria-label="Naar de homepage">
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
                href={cta.href}
                external={cta.external}
                className="btn-text hidden rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover sm:inline-flex"
              >
                {cta.label}
              </SmartLink>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobiel-menu"
              aria-label={open ? "Menu sluiten" : "Menu openen"}
              className="flex h-10 w-10 items-center justify-center rounded-control bg-white/[0.06] md:hidden"
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-paper transition-transform duration-200 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 w-5 rounded bg-paper transition-transform duration-200 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        {open && (
          <div id="mobiel-menu" className="border-t border-white/[0.06] px-4 pb-5 pt-2 md:hidden">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.label + item.href}>
                  <SmartLink href={item.href} external={item.external} onClick={close} className="block border-b border-white/[0.06] py-4 text-lg text-paper/85">
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
                href={cta.href}
                external={cta.external}
                onClick={close}
                className="btn-text mt-5 flex justify-center rounded-control bg-accent px-5 py-3.5 font-semibold text-on-accent"
              >
                {cta.mobileLabel || cta.label}
              </SmartLink>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
