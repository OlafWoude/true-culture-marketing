type GorillaMarkProps = {
  className?: string;
};

// Rendered as a CSS mask so the brand mark can take any text color/opacity.
export default function GorillaMark({ className = "" }: GorillaMarkProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none aspect-[1228/940] bg-current ${className}`}
      style={{
        maskImage: "url(/brand/gorilla-mark.png)",
        WebkitMaskImage: "url(/brand/gorilla-mark.png)",
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
