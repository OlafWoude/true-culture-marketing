type GorillaBackdropProps = {
  className?: string;
  flip?: boolean;
};

/**
 * Calm, low-opacity watermark used as a background presence rather than a
 * focal graphic. Placeholder silhouette — swapped for the real brand mark
 * (public/brand/gorilla-mark.svg) once that asset is supplied. Kept soft
 * and rounded on purpose: no jagged edges, no glow bloom.
 */
export default function GorillaBackdrop({ className = "", flip = false }: GorillaBackdropProps) {
  return (
    <svg
      viewBox="0 0 500 500"
      aria-hidden="true"
      className={`pointer-events-none select-none ${flip ? "-scale-x-100" : ""} ${className}`}
    >
      <defs>
        <radialGradient id="tcGlow" cx="48%" cy="38%" r="55%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="250" cy="230" r="230" fill="url(#tcGlow)" />
      <path
        d="M210 90
           C 160 95, 120 140, 115 195
           C 112 225, 122 250, 108 275
           C 95 298, 92 330, 108 358
           C 128 392, 168 410, 208 408
           C 232 406, 252 395, 272 380
           C 300 358, 328 352, 352 330
           C 378 306, 386 268, 372 236
           C 362 212, 340 198, 332 172
           C 322 138, 290 100, 248 92
           C 236 90, 222 89, 210 90 Z"
        fill="currentColor"
        fillOpacity="0.045"
      />
    </svg>
  );
}
