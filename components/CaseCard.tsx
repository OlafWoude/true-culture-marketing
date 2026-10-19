type CaseCardProps = {
  label: string;
};

export default function CaseCard({ label }: CaseCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-dashed border-ink-line p-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-paper/35">
          {label}
        </span>
        <p className="mt-6 text-sm leading-relaxed text-paper/40">
          Case uitgelicht binnenkort.
        </p>
      </div>
      <span className="mt-8 text-xs text-paper/25">Binnenkort beschikbaar</span>
    </div>
  );
}
