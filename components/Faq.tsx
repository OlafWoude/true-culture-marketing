import { faqs } from "@/lib/faq";
import { PlusIcon } from "@/lib/icons";

export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {faqs.map((f) => (
        <details key={f.q} className="group py-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink transition-transform duration-300 group-open:rotate-45">
              <PlusIcon className="h-4 w-4" />
            </span>
          </summary>
          <p className="mt-4 max-w-3xl leading-relaxed text-ink/65">{f.a}</p>
        </details>
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
