import Link from "next/link";
import { ArrowRightIcon } from "@/lib/icons";

type Variant = "primary" | "dark" | "outline-light" | "outline-dark";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  arrow?: boolean;
  className?: string;
};

const variants: Record<Variant, string> = {
  primary: "bg-accent text-ink hover:bg-accent-hover",
  dark: "bg-ink text-paper hover:bg-ink-3",
  "outline-light": "border border-white/20 text-paper hover:border-white/60",
  "outline-dark": "border border-ink/20 text-ink hover:border-ink/60",
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
  className = "",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
      {arrow && (
        <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}
