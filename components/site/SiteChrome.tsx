import Footer, { type FooterData } from "@/components/Footer";
import Logo from "@/components/Logo";
import Nav, { type NavLink } from "@/components/Nav";
import type { RenderCtx } from "@/lib/cms/render";
import { themeToCss } from "@/lib/cms/theme-css";
import { whatsappHref } from "@/lib/whatsapp";
import StickyApply from "./StickyApply";
import VisitSourceTracker from "./VisitSourceTracker";

export function ThemeStyle({ ctx }: { ctx: RenderCtx }) {
  return <style dangerouslySetInnerHTML={{ __html: themeToCss(ctx.bundle.theme) }} />;
}

function navItems(ctx: RenderCtx): NavLink[] {
  return ctx.bundle.navigation.items
    .filter((item) => item.visible)
    .map((item) => ({
      label: item.label,
      href: ctx.href(item.link),
      external: ctx.isExternal(item.link),
      children: (item.children ?? [])
        .filter((c) => c.visible)
        .map((c) => ({ label: c.label, href: ctx.href(c.link), external: ctx.isExternal(c.link) }))
        .filter((c): c is { label: string; href: string; external: boolean } => Boolean(c.href && c.label)),
    }))
    .filter((item): item is NavLink => Boolean(item.href && item.label));
}

function footerData(ctx: RenderCtx, logo: React.ReactNode, homeHref: string): FooterData {
  const { footer, settings } = ctx.bundle;
  const resolve = (links: typeof footer.links) =>
    links
      .filter((l) => l.visible)
      .map((l) => ({ label: l.label, href: ctx.href(l.link), external: ctx.isExternal(l.link) }))
      .filter((l): l is { label: string; href: string; external: boolean } => Boolean(l.href && l.label));
  const contact = footer.showContact && (settings.contact.email || settings.contact.phone) ? settings.contact : null;
  return {
    logo,
    homeHref,
    text: footer.text,
    links: resolve(footer.links),
    legalLinks: resolve(footer.legalLinks),
    contact,
    socials: footer.showSocials ? settings.socials.filter((s) => s.url) : [],
    copyright: footer.copyright.replaceAll("{jaar}", String(new Date().getFullYear())),
  };
}

export default function SiteChrome({ ctx, children, banner }: { ctx: RenderCtx; children: React.ReactNode; banner?: React.ReactNode }) {
  const logoMedia = ctx.media(ctx.bundle.theme.brand.logo);
  const home = ctx.bundle.pages.find((p) => p.systemKey === "home");
  const homeHref = home ? "/" : "/";
  const { cta } = ctx.bundle.navigation;
  const ctaHref = cta.visible ? ctx.href(cta.link) : null;
  const sticky = Boolean(ctaHref && cta.mobileSticky && (cta.mobileLabel || cta.label));
  const whatsapp = whatsappHref(ctx.bundle.settings.contact.whatsapp, "Hoi! Ik heb een vraag over werken bij True Culture Marketing.");
  const logo = <Logo media={logoMedia} alt={ctx.bundle.settings.siteName} eager />;
  const footerLogo = <Logo media={logoMedia} alt={ctx.bundle.settings.siteName} size="sm" />;

  return (
    <>
      <ThemeStyle ctx={ctx} />
      {banner}
      <a
        href="#inhoud"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-24 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Naar inhoud
      </a>
      <Nav
        logo={logo}
        items={navItems(ctx)}
        cta={
          ctaHref && cta.label
            ? { label: cta.label, mobileLabel: cta.mobileLabel, href: ctaHref, external: ctx.isExternal(cta.link), form: ctx.isFormLink(cta.link) }
            : null
        }
        variant={ctx.bundle.theme.layout.navStyle === "bar" ? "bar" : "floating"}
        homeHref={homeHref}
        offsetTop={Boolean(banner)}
      />
      <main id="inhoud">{children}</main>
      <Footer data={footerData(ctx, footerLogo, homeHref)} />
      {sticky && ctaHref && (
        <>
          {/* Keeps the end of the footer reachable above the fixed button on phones. */}
          <div className="h-24 bg-ink md:hidden" aria-hidden="true" />
          <StickyApply
            label={cta.mobileLabel || cta.label}
            href={ctaHref}
            external={ctx.isExternal(cta.link)}
            form={ctx.isFormLink(cta.link)}
            whatsapp={whatsapp}
          />
        </>
      )}
      <VisitSourceTracker />
    </>
  );
}
