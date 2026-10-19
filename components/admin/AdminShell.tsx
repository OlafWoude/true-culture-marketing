"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/admin/auth-actions";

const groups: { title: string; items: { href: string; label: string }[] }[] = [
  { title: "", items: [{ href: "/admin", label: "Dashboard" }] },
  {
    title: "Inhoud",
    items: [
      { href: "/admin/paginas", label: "Pagina’s" },
      { href: "/admin/media", label: "Afbeeldingen" },
      { href: "/admin/diensten", label: "Diensten" },
      { href: "/admin/cases", label: "Cases" },
      { href: "/admin/testimonials", label: "Testimonials" },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/navigatie", label: "Navigatie" },
      { href: "/admin/footer", label: "Footer" },
      { href: "/admin/huisstijl", label: "Huisstijl" },
      { href: "/admin/seo", label: "SEO en redirects" },
      { href: "/admin/instellingen", label: "Instellingen" },
    ],
  },
  {
    title: "Contact",
    items: [
      { href: "/admin/aanvragen", label: "Aanvragen" },
      { href: "/admin/formulieren", label: "Formulieren" },
    ],
  },
  {
    title: "Overig",
    items: [
      { href: "/admin/prullenbak", label: "Prullenbak" },
      { href: "/admin/account", label: "Account en beheerders" },
    ],
  },
];

export default function AdminShell({ user, unread, children }: { user: { name: string; email: string }; unread: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav aria-label="Beheermenu" className="space-y-6">
      {groups.map((g) => (
        <div key={g.title || "root"}>
          {g.title && <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">{g.title}</p>}
          <ul className="space-y-0.5">
            {g.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-[14px] font-medium transition ${
                    isActive(item.href) ? "bg-[#fece00] text-[#050505]" : "text-white/75 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {item.label}
                  {item.href === "/admin/aanvragen" && unread > 0 && (
                    <span className={`rounded-full px-2 text-xs font-bold ${isActive(item.href) ? "bg-[#050505] text-white" : "bg-[#fece00] text-[#050505]"}`}>{unread}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="hidden bg-[#050505] lg:block">
        <div className="sticky top-0 flex h-screen flex-col overflow-y-auto px-4 py-6">
          <Link href="/admin" className="mb-8 block px-3">
            <Image src="/brand/wordmark.png" alt="True Culture Marketing" width={760} height={295} className="h-10 w-auto" />
          </Link>
          {nav}
          <div className="mt-auto pt-8">
            <a href="/" target="_blank" rel="noopener" className="block rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.07] hover:text-white">
              Website bekijken ↗
            </a>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 md:px-8">
            <button type="button" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold lg:hidden" onClick={() => setOpen(true)} aria-label="Menu openen">
              Menu
            </button>
            <form action="/admin/zoeken" role="search" className="flex-1">
              <label htmlFor="admin-search" className="sr-only">Zoeken</label>
              <input
                id="admin-search"
                name="q"
                type="search"
                placeholder="Zoek in pagina’s, diensten, cases…"
                className="w-full max-w-md rounded-xl border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-sm outline-none focus:border-zinc-900 focus:bg-white"
              />
            </form>
            <div className="hidden text-right text-sm sm:block">
              <p className="font-semibold leading-tight text-zinc-900">{user.name || "Beheerder"}</p>
              <p className="text-xs text-zinc-500">{user.email}</p>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50">
                Uitloggen
              </button>
            </form>
          </div>
        </header>
        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="h-full w-72 overflow-y-auto bg-[#050505] px-4 py-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between px-3">
              <Image src="/brand/wordmark.png" alt="True Culture Marketing" width={760} height={295} className="h-9 w-auto" />
              <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-white/70" aria-label="Menu sluiten">
                Sluiten
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </div>
  );
}
