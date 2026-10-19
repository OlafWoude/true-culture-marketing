import { comparison } from "@/lib/content";
import { CheckIcon } from "@/lib/icons";

export default function Comparison() {
  const last = comparison.length - 1;

  return (
    <>
      <div className="hidden md:block" role="table" aria-label="Zelf doen vergeleken met True Culture">
        <div role="row" className="grid grid-cols-[1.1fr_1fr_1.1fr] items-end">
          <div role="columnheader">
            <span className="sr-only">Onderdeel</span>
          </div>
          <div role="columnheader" className="px-6 pb-5 text-sm font-semibold text-ink/50">
            Zelf doen
          </div>
          <div
            role="columnheader"
            className="rounded-t-[1.75rem] bg-ink px-6 pb-5 pt-8 text-paper"
          >
            <span className="wordmark text-lg">
              <span className="text-accent">True</span> Culture
            </span>
          </div>
        </div>
        {comparison.map((row, i) => (
          <div key={row.label} role="row" className="grid grid-cols-[1.1fr_1fr_1.1fr]">
            <div
              role="rowheader"
              className={`flex items-center border-t border-ink/10 py-6 pr-6 font-semibold text-ink ${
                i === last ? "border-b" : ""
              }`}
            >
              {row.label}
            </div>
            <div
              role="cell"
              className={`flex items-center border-t border-ink/10 px-6 py-6 text-ink/55 ${
                i === last ? "border-b" : ""
              }`}
            >
              {row.self}
            </div>
            <div
              role="cell"
              className={`flex items-center gap-3 border-t border-white/10 bg-ink px-6 py-6 text-paper ${
                i === last ? "rounded-b-[1.75rem] pb-8" : ""
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
                <CheckIcon className="h-4 w-4" />
              </span>
              {row.us}
            </div>
          </div>
        ))}
      </div>

      <ul className="space-y-3 md:hidden">
        {comparison.map((row) => (
          <li key={row.label} className="rounded-2xl bg-white p-5 ring-1 ring-ink/10">
            <p className="font-semibold text-ink">{row.label}</p>
            <p className="mt-3 text-sm text-ink/50">
              <span className="font-medium text-ink/70">Zelf doen:</span> {row.self}
            </p>
            <p className="mt-3 flex items-start gap-2.5 rounded-xl bg-ink p-3 text-sm text-paper">
              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
                <CheckIcon className="h-3 w-3" />
              </span>
              {row.us}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
