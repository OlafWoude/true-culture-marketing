import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  /** Only for `immediate`: wait this long (ms) before animating, to stagger a group. */
  delay?: number;
  className?: string;
  /** Animate on page load instead of on scroll. Use for content that is visible without scrolling. */
  immediate?: boolean;
  as?: "div" | "li";
};

// Entrance animations are pure CSS (see `.rise` and `.fade-in` in globals.css): nothing waits for
// JavaScript, so content paints as soon as the HTML arrives. Without browser support or with
// reduced motion, the content is simply shown.
export default function FadeIn({ children, delay = 0, className = "", immediate = false, as: Tag = "div" }: FadeInProps) {
  return (
    <Tag className={`${immediate ? "rise" : "fade-in"} ${className}`} style={immediate && delay ? { animationDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
