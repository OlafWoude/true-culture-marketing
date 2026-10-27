type GorillaMarkProps = {
  className?: string;
  /** Decorative background use; hidden when the theme turns the gorilla watermark off. */
  watermark?: boolean;
};

// Rendered as a CSS mask so the brand mark can take any text color/opacity.
export default function GorillaMark({ className = "", watermark = false }: GorillaMarkProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none aspect-[1228/940] bg-current ${watermark ? "tc-watermark" : ""} ${className}`}
      style={{
        maskImage: "url(/brand/gorilla-mark.webp)",
        WebkitMaskImage: "url(/brand/gorilla-mark.webp)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
