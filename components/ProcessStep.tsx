type ProcessStepProps = {
  number: string;
  title: string;
  description: string;
};

export default function ProcessStep({ number, title, description }: ProcessStepProps) {
  return (
    <div className="flex gap-6">
      <div className="font-display text-4xl text-accent/80">{number}</div>
      <div className="border-l border-ink-line pl-6">
        <h3 className="font-display text-xl text-paper">{title}</h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-paper/60">{description}</p>
      </div>
    </div>
  );
}
