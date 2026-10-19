import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type NativeButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: undefined;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-ink hover:bg-accent-dim focus-visible:outline-accent",
  outline:
    "border border-paper/30 text-paper hover:border-accent hover:text-accent focus-visible:outline-accent",
  ghost: "text-paper hover:text-accent focus-visible:outline-accent",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function Button(props: LinkButtonProps | NativeButtonProps) {
  const variant = props.variant ?? "primary";
  const classes = `${base} ${variantClasses[variant]} ${props.className ?? ""}`;

  if (props.href) {
    return (
      <Link href={props.href} className={classes}>
        {props.children}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, variant: _variant, className: _className, href: _href, ...rest } = props;

  return (
    <button {...rest} className={classes}>
      {children}
    </button>
  );
}
