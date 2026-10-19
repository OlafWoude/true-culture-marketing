import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fece00]";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-[#fece00] text-[#050505] hover:bg-[#ffda3d]",
  dark: "bg-[#050505] text-white hover:bg-[#1f1f1f]",
  secondary: "border border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50",
  ghost: "text-zinc-700 hover:bg-zinc-100",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};

export function btnClass(variant: BtnVariant = "secondary", extra = "") {
  return `${btnBase} ${btnVariants[variant]} ${extra}`;
}

export function AdminButton({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return <button type="button" className={btnClass(variant, className)} {...props} />;
}

export function AdminLink({ href, variant = "secondary", className = "", children }: { href: string; variant?: BtnVariant; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={btnClass(variant, className)}>
      {children}
    </Link>
  );
}

export function Card({ children, className = "", flush = false }: { children: ReactNode; className?: string; flush?: boolean }) {
  return <div className={`rounded-2xl border border-zinc-200 bg-white shadow-sm ${flush ? "overflow-hidden" : "p-6"} ${className}`}>{children}</div>;
}

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-zinc-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const statusStyles = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  draft: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  offline: "bg-amber-50 text-amber-800 ring-amber-600/20",
  changes: "bg-sky-50 text-sky-700 ring-sky-600/20",
  hidden: "bg-zinc-100 text-zinc-500 ring-zinc-400/20",
  new: "bg-[#fff6cc] text-[#7a5d00] ring-[#fece00]/40",
} as const;

const statusLabels = {
  published: "Gepubliceerd",
  draft: "Concept",
  offline: "Offline",
  changes: "Niet-gepubliceerde wijzigingen",
  hidden: "Verborgen",
  new: "Nieuw",
} as const;

export function StatusBadge({ status, label }: { status: keyof typeof statusStyles; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label ?? statusLabels[status]}
    </span>
  );
}

export function Notice({ tone = "info", title, children }: { tone?: "info" | "warning" | "error" | "success"; title?: string; children: ReactNode }) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <p className="font-semibold text-zinc-900">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600">{text}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 shadow-sm outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-[#fece00]/50 disabled:bg-zinc-50";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} pr-8 ${props.className ?? ""}`} />;
}

export function FieldLabel({ htmlFor, label, help, children, count }: { htmlFor?: string; label: string; help?: string; children: ReactNode; count?: { value: number; max: number } }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-zinc-800">
          {label}
        </label>
        {count && (
          <span className={`text-xs tabular-nums ${count.value > count.max ? "text-red-600" : "text-zinc-400"}`}>
            {count.value}/{count.max}
          </span>
        )}
      </div>
      {children}
      {help && <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{help}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-3 text-left text-sm font-medium text-zinc-800"
    >
      <span className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-[#050505]" : "bg-zinc-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5.5" : "translate-x-0.5"}`} />
      </span>
      {label}
    </button>
  );
}

export function formatDate(iso: string | Date | null | undefined) {
  if (!iso) return "–";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("nl-NL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
