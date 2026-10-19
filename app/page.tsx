import Link from "next/link";
import Button from "@/components/Button";
import ServiceCard from "@/components/ServiceCard";
import ProcessStep from "@/components/ProcessStep";
import CaseCard from "@/components/CaseCard";
import GorillaBackdrop from "@/components/GorillaBackdrop";
import FadeIn from "@/components/FadeIn";
import { services, processSteps } from "@/lib/content";
import { TargetIcon, PhoneIcon, UsersIcon, ChartIcon, ArrowRightIcon } from "@/lib/icons";

const iconMap = {
  target: TargetIcon,
  phone: PhoneIcon,
  users: UsersIcon,
  chart: ChartIcon,
};

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-line">
        <GorillaBackdrop className="absolute -right-16 top-0 h-[560px] w-[560px] text-paper md:-right-4" flip />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-7 px-6 py-28 md:py-40">
          <FadeIn>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              B2B Sales Agency
            </span>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 className="text-display max-w-3xl text-4xl leading-[1.1] text-paper sm:text-5xl md:text-[3.5rem]">
              Wij vullen jouw pijplijn.
              <br />
              Jij sluit de deal.
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p className="max-w-xl text-lg leading-relaxed text-paper/60">
              True Culture Marketing is een B2B sales agency voor bedrijven
              die serieus werk willen maken van leadgeneratie en afspraken
              inplannen. Wij nemen het voortraject uit handen, jouw team
              richt zich op de deal.
            </p>
          </FadeIn>
          <FadeIn delay={240}>
            <div className="flex flex-wrap gap-4 pt-3">
              <Button href="/contact">Plan een kennismakingsgesprek</Button>
              <Button href="/diensten" variant="outline">
                Bekijk diensten
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-ink-line bg-ink-raised">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <FadeIn>
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
                Diensten
              </span>
              <h2 className="text-display mt-4 text-3xl text-paper sm:text-4xl">
                Van eerste lead tot getekende deal
              </h2>
            </div>
          </FadeIn>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon as keyof typeof iconMap];
              return (
                <FadeIn key={service.slug} delay={i * 60}>
                  <ServiceCard
                    number={String(i + 1).padStart(2, "0")}
                    icon={<Icon />}
                    title={service.title}
                    description={service.short}
                  />
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={180}>
            <div className="mt-10">
              <Link
                href="/diensten"
                className="inline-flex items-center gap-2 text-sm font-semibold text-paper/80 transition-colors hover:text-accent"
              >
                Alle diensten bekijken
                <ArrowRightIcon />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-ink-line">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <FadeIn>
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
                Werkwijze
              </span>
              <h2 className="text-display mt-4 text-3xl text-paper sm:text-4xl">
                Een heldere, herhaalbare aanpak
              </h2>
            </div>
          </FadeIn>

          <div className="mt-14 space-y-12">
            {processSteps.slice(0, 3).map((step, i) => (
              <FadeIn key={step.number} delay={i * 60}>
                <ProcessStep {...step} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={200}>
            <div className="mt-10">
              <Link
                href="/werkwijze"
                className="inline-flex items-center gap-2 text-sm font-semibold text-paper/80 transition-colors hover:text-accent"
              >
                Volledige werkwijze bekijken
                <ArrowRightIcon />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-ink-line bg-ink-raised">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <FadeIn>
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-paper/40">
                Resultaten
              </span>
              <h2 className="text-display mt-4 text-3xl text-paper sm:text-4xl">Cases</h2>
              <p className="mt-4 text-paper/55">
                We bouwen op dit moment aan onze eerste klantcases. Binnenkort
                delen we hier concrete resultaten.
              </p>
            </div>
          </FadeIn>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {["Case 01", "Case 02", "Case 03"].map((label, i) => (
              <FadeIn key={label} delay={i * 70}>
                <CaseCard label={label} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <GorillaBackdrop className="absolute -left-24 bottom-[-10%] h-[420px] w-[420px] text-paper" />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center md:py-32">
          <FadeIn>
            <h2 className="text-display text-3xl text-paper sm:text-4xl">
              Klaar om jouw pijplijn te vullen?
            </h2>
          </FadeIn>
          <FadeIn delay={100}>
            <p className="mx-auto mt-5 max-w-xl text-paper/60">
              Plan een vrijblijvend kennismakingsgesprek. We bespreken jouw
              doelgroep, doelen en waar wij voor jou het verschil kunnen
              maken.
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="mt-9 flex justify-center">
              <Button href="/contact">Plan een kennismakingsgesprek</Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
