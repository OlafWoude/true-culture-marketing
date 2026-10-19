import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import MobileMenuToggle from "@/components/MobileMenuToggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/werkwijze", label: "Werkwijze" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-line bg-ink/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2" aria-label="True Culture Marketing — home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Hoofdmenu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-paper/80 transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href="/contact" className="px-5 py-2.5 text-xs">
            Plan een gesprek
          </Button>
        </div>

        <MobileMenuToggle />
      </div>
    </header>
  );
}
