import { PlusIcon } from "@/lib/icons";

export type FaqItem = { question: string; answer: string };

export default function Faq({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((f, i) => (
        <details key={i} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {f.question}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink transition-transform duration-300 group-open:rotate-45">
              <PlusIcon className="h-4 w-4" />
            </span>
          </summary>
          <p className="-mt-2 max-w-3xl whitespace-pre-line pb-6 leading-relaxed text-ink/65">{f.answer}</p>
        </details>
      ))}
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped cannot break out of the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
