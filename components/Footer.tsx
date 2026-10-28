import Link from "next/link";
import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/lib/icons";

export type FooterData = {
  logo: ReactNode;
  homeHref: string;
  text: string;
  links: { label: string; href: string; external: boolean }[];
  legalLinks: { label: string; href: string; external: boolean }[];
  contact: { email: string; phone: string; whatsapp: { href: string; label: string } | null } | null;
  socials: { platform: string; url: string }[];
  copyright: string;
};

function FooterLink({ href, external, className, children }: { href: string; external: boolean; className: string; children: ReactNode }) {
  return external ? (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function Footer({ data }: { data: FooterData }) {
  const hasExtra = Boolean(data.text || data.contact || data.socials.length);
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-site px-6">
        <div className="flex flex-col items-center gap-8 py-14 md:flex-row md:items-start md:justify-between">
          <div className={`flex flex-col items-center gap-5 md:items-start ${hasExtra ? "" : "md:self-center"}`}>
            <Link href={data.homeHref} className="-my-1 py-1" aria-label="Naar de homepage">
              {data.logo}
            </Link>
            {data.text && <p className="max-w-sm text-center text-sm leading-relaxed text-paper/55 md:text-left">{data.text}</p>}
            {data.contact && (
              <div className="flex flex-col items-center text-sm md:items-start">
                {data.contact.email && (
                  <a href={`mailto:${data.contact.email}`} className="inline-flex min-h-11 items-center text-paper/75 transition-colors hover:text-paper">
                    {data.contact.email}
                  </a>
                )}
                {data.contact.phone && (
                  <a href={`tel:${data.contact.phone.replace(/\(0\)/g, "").replace(/[^0-9+]/g, "")}`} className="inline-flex min-h-11 items-center text-paper/75 transition-colors hover:text-paper">
                    {data.contact.phone}
                  </a>
                )}
                {data.contact.whatsapp && (
                  <a
                    href={data.contact.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-paper/75 transition-colors hover:text-paper"
                  >
                    <WhatsAppIcon className="h-4 w-4 text-whatsapp" />
                    {data.contact.whatsapp.label}
                  </a>
                )}
              </div>
            )}
            {data.socials.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {data.socials.map((s) => (
                  <li key={s.platform + s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-full border border-white/15 px-3.5 py-2 text-xs font-medium text-paper/75 transition-colors hover:border-white/40 hover:text-paper"
                    >
                      {s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {data.links.length > 0 && (
            <nav aria-label="Footer" className={hasExtra ? "md:pt-3" : "md:self-center"}>
              <ul className="flex flex-wrap justify-center gap-x-8">
                {data.links.map((link) => (
                  <li key={link.label + link.href}>
                    <FooterLink href={link.href} external={link.external} className="inline-flex min-h-11 items-center text-[15px] text-paper/70 transition-colors hover:text-paper">
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        <div className="flex flex-col items-center justify-between gap-1 border-t border-line py-6 text-sm text-paper/60 md:flex-row">
          <p>{data.copyright}</p>
          {data.legalLinks.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-x-6">
              {data.legalLinks.map((link) => (
                <li key={link.label + link.href}>
                  <FooterLink href={link.href} external={link.external} className="inline-flex min-h-11 items-center transition-colors hover:text-paper">
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
