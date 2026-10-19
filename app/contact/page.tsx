import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import FadeIn from "@/components/FadeIn";
import GorillaBackdrop from "@/components/GorillaBackdrop";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Plan een vrijblijvende kennismaking met True Culture Marketing en ontdek wat wij voor jouw salesteam kunnen betekenen.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden">
      <GorillaBackdrop className="absolute -right-32 top-0 h-[560px] w-[560px] text-accent/40" flip />
      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-24 md:grid-cols-[1fr_1.2fr] md:py-28">
        <FadeIn>
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-accent">
              Contact
            </span>
            <h1 className="text-display mt-4 text-4xl text-paper sm:text-5xl">
              Laten we kennismaken
            </h1>
            <p className="mt-6 max-w-md text-paper/60">
              Vul het formulier in en we nemen binnen 1 werkdag contact met
              je op om een geschikt moment te plannen.
            </p>

            <dl className="mt-10 space-y-4 text-sm">
              <div>
                <dt className="text-paper/40">E-mail</dt>
                <dd className="mt-1 text-paper/80">Contactgegevens volgen binnenkort</dd>
              </div>
              <div>
                <dt className="text-paper/40">Telefoon</dt>
                <dd className="mt-1 text-paper/80">Contactgegevens volgen binnenkort</dd>
              </div>
            </dl>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="rounded-2xl border border-ink-line bg-ink-raised p-8 sm:p-10">
            <ContactForm />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
