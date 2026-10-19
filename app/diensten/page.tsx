import type { Metadata } from "next";
import Button from "@/components/Button";
import FadeIn from "@/components/FadeIn";
import GorillaBackdrop from "@/components/GorillaBackdrop";
import { services } from "@/lib/content";
import { TargetIcon, PhoneIcon, UsersIcon, ChartIcon } from "@/lib/icons";

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
        <GorillaBackdrop className="absolute -right-20 top-0 h-[480px] w-[480px] text-paper" flip />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
          <FadeIn>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
              Diensten
            </span>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 className="text-display mt-4 max-w-2xl text-4xl text-paper sm:text-5xl">
              Sales-ondersteuning die zich terugverdient
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p className="mt-6 max-w-xl text-paper/60">
              Elke dienst is op zichzelf in te zetten, of te combineren tot
              een volledig uitbesteed voortraject voor jouw salesteam.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-ink-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <FadeIn key={service.slug} delay={i * 60}>
                <div
                  id={service.slug}
                  className="grid gap-6 border-t border-ink-line py-12 first:border-t-0 first:pt-0 md:grid-cols-[auto_1fr] md:gap-12"
                >
                  <div className="flex items-start gap-5 md:w-56">
                    <span className="font-display text-sm text-paper/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-paper/50">
                      <Icon />
                    </span>
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
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <FadeIn>
            <h2 className="text-display text-2xl text-paper sm:text-3xl">
              Benieuwd welke dienst het beste past bij jouw situatie?
            </h2>
          </FadeIn>
          <FadeIn delay={100}>
            <div className="mt-8 flex justify-center">
              <Button href="/contact">Plan een kennismakingsgesprek</Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
