import {
  bodyFonts,
  buttonShapes,
  containerWidths,
  cornerStyles,
  displayFonts,
  sectionSpacings,
  type BodyFontKey,
  type DisplayFontKey,
} from "@/lib/theme-options";
import type { Theme } from "./documents";
import { seedTheme } from "./seed";

const HEX = /^#[0-9a-fA-F]{6}$/;

function pick<T extends object>(record: T, key: string, fallback: keyof T): T[keyof T] {
  return (key in record ? record[key as keyof T] : record[fallback]) as T[keyof T];
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Turns the (already validated) theme into CSS custom properties. Every value is
 * re-checked here so no stored value can ever inject arbitrary CSS.
 */
export function themeToCss(theme: Theme): string {
  const d = seedTheme();
  const color = (key: keyof Theme["colors"]) => (HEX.test(theme.colors?.[key] ?? "") ? theme.colors[key] : d.colors[key]);
  const t = theme.typography ?? d.typography;
  const s = theme.shape ?? d.shape;
  const l = theme.layout ?? d.layout;

  const display = pick(displayFonts, t.displayFont, "archivo-condensed" as DisplayFontKey);
  const body = pick(bodyFonts, t.bodyFont, "inter" as BodyFontKey);
  const allowedWeights = display.weights as readonly number[];
  const wantedWeight = Number(t.displayWeight);
  const weight = allowedWeights.includes(wantedWeight)
    ? wantedWeight
    : allowedWeights[allowedWeights.length - 1];
  const spacing = pick(sectionSpacings, l.spacing, "normal");

  const vars: Record<string, string> = {
    "--tc-ink": color("ink"),
    "--tc-ink-2": color("ink2"),
    "--tc-ink-3": color("ink3"),
    "--tc-line": color("line"),
    "--tc-paper": color("paper"),
    "--tc-mist": color("mist"),
    "--tc-accent": color("accent"),
    "--tc-accent-hover": color("accentHover"),
    "--tc-on-accent": color("onAccent"),
    "--tc-font-display": `var(${display.cssVar})`,
    "--tc-display-width": String(display.width),
    "--tc-display-weight": String(weight),
    "--tc-display-transform": t.displayUppercase === false ? "none" : "uppercase",
    "--tc-heading-scale": String(clamp(t.headingScale, 80, 115, 100) / 100),
    "--tc-heading-lh": String(clamp(t.headingLineHeight, 85, 120, 92) / 100),
    "--tc-font-body": `var(${body.cssVar})`,
    "--tc-body-scale": String(clamp(t.bodySize, 14, 19, 16) / 16),
    "--tc-lh-scale": String(clamp(t.bodyLineHeight, 130, 190, 150) / 150),
    "--tc-radius-btn": pick(buttonShapes, s.buttonShape, "pill").radius,
    "--tc-radius-scale": String(pick(cornerStyles, s.corners, "large").scale),
    "--tc-btn-transform": s.buttonUppercase ? "uppercase" : "none",
    "--tc-container": pick(containerWidths, l.container, "normal").value,
    "--tc-section-y": spacing.mobile,
    "--tc-section-y-md": spacing.desktop,
    "--tc-section-y-sm": `calc(${spacing.mobile} - 1rem)`,
    "--tc-section-y-sm-md": `calc(${spacing.desktop} - 1rem)`,
    "--tc-watermark": theme.brand?.showGorilla === false ? "0" : "1",
  };

  if (s.shadows === "none") {
    vars["--tc-shadow-nav"] = "none";
    vars["--tc-shadow-card"] = "none";
  }

  return `:root{${Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;
}

/** WCAG contrast ratio between two hex colours, used for warnings in the theme editor. */
export function contrastRatio(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, b2] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b2);
  };
  if (!HEX.test(a) || !HEX.test(b)) return 21;
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
