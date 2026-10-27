import Link from "next/link";
import { ArrowRightIcon } from "@/lib/icons";

type Variant = "primary" | "dark" | "outline-light" | "outline-dark";

type ButtonProps = {
  href: string | null;
  children: React.ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  arrow?: boolean;
  newTab?: boolean;
  className?: string;
};

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-hover",
  dark: "bg-ink text-paper hover:bg-ink-3 active:bg-ink-3",
  "outline-light": "border border-white/20 text-paper hover:border-white/60 active:border-white/60",
  "outline-dark": "border border-ink/20 text-ink hover:border-ink/60 active:border-ink/60",
};

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  href,
  children,
  variant = "primary",
  size = "lg",
  arrow = false,
  newTab = false,
  className = "",
}: ButtonProps) {
  if (!href || !children) return null;
  const classes = `group btn-text inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-[color,background-color,border-color,scale] duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-safe:active:scale-[0.97] ${variants[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      {children}
      {arrow && (
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (newTab || /^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={classes} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
