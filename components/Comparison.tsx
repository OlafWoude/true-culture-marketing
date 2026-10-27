import MobileCarousel from "@/components/site/MobileCarousel";
import { CheckIcon } from "@/lib/icons";

export type ComparisonRow = { label: string; self: string; us: string };

type ComparisonProps = {
  rows: ComparisonRow[];
  selfLabel: string;
  usAccent: string;
  usLabel: string;
  carousel?: boolean;
};

export default function Comparison({ rows, selfLabel, usAccent, usLabel, carousel = false }: ComparisonProps) {
  const last = rows.length - 1;
  const usTitle = [usAccent, usLabel].filter(Boolean).join(" ");

  return (
    <>
      <div className="hidden md:block" role="table" aria-label={`${selfLabel} vergeleken met ${usTitle}`}>
        <div role="row" className="grid grid-cols-[1.1fr_1fr_1.1fr] items-end">
          <div role="columnheader">
            <span className="sr-only">Onderdeel</span>
          </div>
          <div role="columnheader" className="px-6 pb-5 text-sm font-semibold text-ink/60">
            {selfLabel}
          </div>
          <div role="columnheader" className="rounded-t-card bg-ink px-6 pb-5 pt-8 text-paper">
            <span className="wordmark text-lg">
              {usAccent && <span className="text-accent">{usAccent}</span>}
              {usAccent && usLabel ? " " : ""}
              {usLabel}
            </span>
          </div>
        </div>
        {rows.map((row, i) => (
          <div key={i} role="row" className="grid grid-cols-[1.1fr_1fr_1.1fr]">
            <div
              role="rowheader"
              className={`flex items-center border-t border-ink/10 py-6 pr-6 font-semibold text-ink ${i === last ? "border-b" : ""}`}
            >
              {row.label}
            </div>
            <div
              role="cell"
              className={`flex items-center border-t border-ink/10 px-6 py-6 text-ink/60 ${i === last ? "border-b" : ""}`}
            >
              {row.self}
            </div>
            <div
              role="cell"
              className={`flex items-center gap-3 border-t border-white/10 bg-ink px-6 py-6 text-paper ${i === last ? "rounded-b-card pb-8" : ""}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                <CheckIcon className="h-4 w-4" />
              </span>
              {row.us}
            </div>
          </div>
        ))}
      </div>

      <MobileCarousel as="ul" enabled={carousel} label="Vergelijking" className="space-y-3 md:hidden">
        {rows.map((row, i) => (
          <li key={i} className={`rounded-inner bg-white p-5 ring-1 ring-ink/10 ${carousel ? "flex flex-col" : ""}`}>
            <p className="font-semibold text-ink">{row.label}</p>
            <p className={`mt-3 text-sm text-ink/60 ${carousel ? "flex-1" : ""}`}>
              <span className="font-medium text-ink/70">{selfLabel}:</span> {row.self}
            </p>
            <p className="mt-3 flex items-start gap-2.5 rounded-control bg-ink p-3 text-sm text-paper">
              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                <CheckIcon className="h-3 w-3" />
              </span>
              {row.us}
            </p>
          </li>
        ))}
      </MobileCarousel>
    </>
  );
}
