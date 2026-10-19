type ProcessStepProps = {
  number: string;
  title: string;
  description: string;
};

export default function ProcessStep({ number, title, description }: ProcessStepProps) {
  return (
    <div className="flex gap-6 sm:gap-10">
      <div className="font-display text-3xl text-paper/25 sm:text-4xl">{number}</div>
      <div className="relative border-l border-ink-line pl-6 sm:pl-10">
        <span className="absolute -left-px top-1 h-8 w-px bg-accent/70" />
        <h3 className="font-display text-xl text-paper">{title}</h3>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/55">{description}</p>
      </div>
    </div>
  );
}
