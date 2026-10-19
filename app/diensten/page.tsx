import type { Metadata } from "next";
import Button from "@/components/Button";
import FadeIn from "@/components/FadeIn";
import GorillaBackdrop from "@/components/GorillaBackdrop";
import { services } from "@/lib/content";
import { TargetIcon, PhoneIcon, UsersIcon, ChartIcon, CheckIcon } from "@/lib/icons";

const iconMap = {
  target: TargetIcon,
  phone: PhoneIcon,
  users: UsersIcon,
  chart: ChartIcon,
};

export const metadata: Metadata = {
  title: "Diensten",
  description:
    "Leadgeneratie, afspraken maken, interim sales en sales strategie — de diensten van True Culture Marketing.",
  alternates: { canonical: "/diensten" },
};

export default function DienstenPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-line">
        <GorillaBackdrop className="absolute -right-24 top-0 h-[520px] w-[520px] text-accent/50" flip />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">
              Diensten
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-display mt-4 max-w-2xl text-4xl text-paper sm:text-5xl">
              Sales-ondersteuning die zich terugverdient
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="mt-6 max-w-xl text-paper/60">
              Elke dienst is op zichzelf in te zetten, of te combineren tot
              een volledig uitbesteed voortraject voor jouw salesteam.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-ink-line">
        <div className="mx-auto max-w-6xl space-y-16 px-6 py-24">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <FadeIn key={service.slug} delay={i * 60}>
                <div
                  id={service.slug}
                  className="grid gap-8 border-t border-ink-line pt-12 first:border-t-0 first:pt-0 md:grid-cols-[1fr_2fr]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Icon />
                  </div>
                  <div>
                    <h2 className="text-display text-2xl text-paper sm:text-3xl">{service.title}</h2>
                    <p className="mt-4 max-w-2xl text-paper/60">{service.description}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <section className="bg-ink-raised">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <FadeIn>
            <div className="flex flex-col items-start gap-4 rounded-2xl border border-ink-line bg-ink p-10 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-ink">
                  <CheckIcon />
                </span>
                <p className="text-paper/80">
                  Benieuwd welke dienst het beste past bij jouw situatie?
                </p>
              </div>
              <Button href="/contact">Plan een kennismaking</Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
