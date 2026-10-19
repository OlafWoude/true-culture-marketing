"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/werkwijze", label: "Werkwijze" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

export default function MobileMenuToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Sluit menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-paper/20"
      >
        <span
          className={`block h-0.5 w-5 bg-paper transition-transform duration-200 ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-paper transition-opacity duration-200 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-paper transition-transform duration-200 ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-0 z-40 bg-ink"
        >
          <nav className="flex h-full flex-col items-center justify-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-display text-3xl text-paper transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
