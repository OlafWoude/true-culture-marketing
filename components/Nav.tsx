"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const links = [
  { href: "/diensten", label: "Diensten" },
  { href: "/werkwijze", label: "Werkwijze" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

export default function Nav({ logo }: { logo: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <div className="fixed inset-x-0 top-4 z-50 px-4">
      <nav
        aria-label="Hoofdmenu"
        className="mx-auto max-w-6xl rounded-2xl border border-white/[0.06] bg-ink-2/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md"
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0" aria-label="True Culture Marketing, naar home">
            {logo}
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-4 py-2 text-[15px] transition-colors ${
                      active ? "text-paper" : "text-paper/65 hover:text-paper"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="hidden rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-accent-hover sm:inline-flex"
            >
              Plan een gesprek
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobiel-menu"
              aria-label={open ? "Menu sluiten" : "Menu openen"}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] md:hidden"
            >
              <span className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-paper transition-transform duration-200 ${
                    open ? "translate-y-[5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-5 rounded bg-paper transition-transform duration-200 ${
                    open ? "-translate-y-[5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {open && (
          <div id="mobiel-menu" className="border-t border-white/[0.06] px-4 pb-5 pt-2 md:hidden">
            <ul className="flex flex-col">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    className="block border-b border-white/[0.06] py-4 text-lg text-paper/85"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              onClick={close}
              className="mt-5 flex justify-center rounded-xl bg-accent px-5 py-3.5 font-semibold text-ink"
            >
              Plan een kennismakingsgesprek
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
}
