type GorillaBackdropProps = {
  className?: string;
  flip?: boolean;
};

/**
 * Decorative placeholder backdrop. Swapped for the real brand mark
 * (public/brand/gorilla-mark.svg) once that asset is supplied.
 */
export default function GorillaBackdrop({ className = "", flip = false }: GorillaBackdropProps) {
  return (
    <svg
      viewBox="0 0 600 600"
      aria-hidden="true"
      className={`pointer-events-none select-none ${flip ? "-scale-x-100" : ""} ${className}`}
    >
      <defs>
        <radialGradient id="tcGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="280" r="280" fill="url(#tcGlow)" />
      <path
        d="M120 480 L220 120 L300 220 L360 90 L460 300 L420 460 L260 520 Z"
        fill="currentColor"
        fillOpacity="0.07"
      />
      <path
        d="M160 440 L240 180 L300 260 L350 150 L430 320 L400 440 L270 480 Z"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
}
