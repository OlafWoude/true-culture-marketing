import type { ReactNode } from "react";

type ServiceCardProps = {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
};

export default function ServiceCard({ number, icon, title, description }: ServiceCardProps) {
  return (
    <div className="group relative rounded-xl border border-ink-line bg-ink-raised p-8 transition-colors duration-300 hover:border-paper/25">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm text-paper/30">{number}</span>
        <div className="text-paper/50 transition-colors duration-300 group-hover:text-accent">
          {icon}
        </div>
      </div>
      <h3 className="mt-8 font-display text-xl text-paper">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-paper/55">{description}</p>
      <span className="absolute inset-x-8 bottom-0 h-px scale-x-0 bg-accent/60 transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}
