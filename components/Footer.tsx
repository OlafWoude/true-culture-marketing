import Link from "next/link";
import Logo from "@/components/Logo";

const footerNav = [
  { href: "/diensten", label: "Diensten" },
  { href: "/werkwijze", label: "Werkwijze" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-line bg-ink-raised">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm text-paper/60">
            True Culture Marketing is een B2B sales agency die bedrijven helpt
            met leadgeneratie, afspraken maken en sales op interim basis.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-10 gap-y-3" aria-label="Footer">
          {footerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-paper/70 transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-ink-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-paper/40 md:flex-row md:items-center md:justify-between">
          <p>© {year} True Culture Marketing. Alle rechten voorbehouden.</p>
          <p>KvK- en btw-gegevens volgen binnenkort.</p>
        </div>
      </div>
    </footer>
  );
}
