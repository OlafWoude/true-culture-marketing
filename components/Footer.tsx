import Link from "next/link";
import Logo from "@/components/Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/werkwijze", label: "Werkwijze" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-8 py-14 md:flex-row md:justify-between">
          <Link href="/" aria-label="True Culture Marketing, naar home">
            <Logo />
          </Link>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-paper/70 transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line py-7 text-sm text-paper/45 md:flex-row">
          <p>© {new Date().getFullYear()} True Culture Marketing</p>
          <Link href="/privacy" className="transition-colors hover:text-paper">
            Privacyverklaring
          </Link>
        </div>
      </div>
    </footer>
  );
}
