import type { ReactNode } from "react";

type ServiceCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div className="group rounded-2xl border border-ink-line bg-ink-raised p-8 transition-colors duration-200 hover:border-accent/50">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-ink">
        {icon}
      </div>
      <h3 className="font-display text-xl text-paper">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-paper/60">{description}</p>
    </div>
  );
}
