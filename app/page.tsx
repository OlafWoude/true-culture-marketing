import Link from "next/link";
import Button from "@/components/Button";
import ServiceCard from "@/components/ServiceCard";
import ProcessStep from "@/components/ProcessStep";
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
        <GorillaBackdrop className="absolute -right-24 top-0 h-[640px] w-[640px] text-accent/60 md:-right-10" flip />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-28 md:py-36">
          <FadeIn>
            <span className="inline-flex w-fit items-center rounded-full border border-accent/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
              B2B Sales Agency
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 className="text-display max-w-3xl text-4xl leading-[1.05] text-paper sm:text-5xl md:text-6xl">
              Wij vullen jouw pijplijn. Jij sluit de deal.
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="max-w-xl text-lg leading-relaxed text-paper/65">
              True Culture Marketing is een no-nonsense B2B sales agency.
              Wij nemen leadgeneratie, afspraken maken en sales op interim
              basis uit handen, zodat jouw team zich kan richten op wat
              telt: verkopen.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button href="/contact">Plan een kennismaking</Button>
              <Button href="/diensten" variant="outline">
                Bekijk diensten
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-ink-line bg-ink-raised">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <FadeIn>
            <div className="max-w-2xl">
              <h2 className="text-display text-3xl text-paper sm:text-4xl">Diensten</h2>
              <p className="mt-4 text-paper/60">
                Van de eerste lead tot de getekende deal. Kies wat jouw
                salesteam nu het hardst nodig heeft.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon as keyof typeof iconMap];
              return (
                <FadeIn key={service.slug} delay={i * 80}>
                  <ServiceCard icon={<Icon />} title={service.title} description={service.short} />
                </FadeIn>
              );
            })}
          </div>

          <FadeIn delay={200}>
            <div className="mt-10">
              <Link
                href="/diensten"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
              >
                Alle diensten bekijken
                <ArrowRightIcon />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-b border-ink-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <FadeIn>
            <div className="max-w-2xl">
              <h2 className="text-display text-3xl text-paper sm:text-4xl">Werkwijze</h2>
              <p className="mt-4 text-paper/60">
                Een heldere, herhaalbare aanpak — van intake tot overdracht.
              </p>
            </div>
          </FadeIn>

          <div className="mt-12 space-y-10">
            {processSteps.slice(0, 3).map((step, i) => (
              <FadeIn key={step.number} delay={i * 80}>
                <ProcessStep {...step} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={260}>
            <div className="mt-10">
              <Link
                href="/werkwijze"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
              >
                Volledige werkwijze bekijken
                <ArrowRightIcon />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink-raised">
        <GorillaBackdrop className="absolute -left-32 bottom-0 h-[480px] w-[480px] text-accent/50" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24">
          <FadeIn>
            <h2 className="text-display max-w-2xl text-3xl text-paper sm:text-4xl">
              Klaar om jouw pijplijn te vullen?
            </h2>
          </FadeIn>
          <FadeIn delay={100}>
            <p className="max-w-xl text-paper/60">
              Plan een vrijblijvend kennismakingsgesprek en ontdek hoe True
              Culture Marketing jouw sales een boost kan geven.
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <Button href="/contact">Plan een kennismaking</Button>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
