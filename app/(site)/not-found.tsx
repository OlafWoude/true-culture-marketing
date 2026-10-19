import Button from "@/components/Button";
import GorillaMark from "@/components/GorillaMark";

export default function NotFound() {
  return (
    <section className="grain flex min-h-[80vh] items-center overflow-hidden bg-ink">
      <GorillaMark watermark className="absolute left-1/2 top-1/2 w-[900px] max-w-none -translate-x-1/2 -translate-y-1/2 text-white/[0.035]" />
      <div className="relative mx-auto max-w-3xl px-6 pt-24 text-center">
        <p className="display text-[calc(9rem*var(--tc-heading-scale))] text-accent md:text-[calc(12rem*var(--tc-heading-scale))]">404</p>
        <h1 className="display mt-2 text-5xl text-paper md:text-6xl">Deze pagina bestaat niet</h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-paper/60">
          De pagina die je zoekt is verplaatst of bestaat niet meer.
        </p>
        <div className="mt-10 flex justify-center">
          <Button href="/" arrow>
            Terug naar home
          </Button>
        </div>
      </div>
    </section>
  );
}
