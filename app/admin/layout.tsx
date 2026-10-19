import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Beheer", template: "%s · Beheer True Culture" },
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: "/brand/favicon.png" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-zinc-100 text-zinc-900">{children}</div>;
}
