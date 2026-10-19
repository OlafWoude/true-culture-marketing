import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-center">
      <div>
        <p className="display text-8xl text-accent">404</p>
        <p className="mt-4 text-paper/70">Deze pagina bestaat niet.</p>
        <Link href="/" className="mt-8 inline-block font-semibold text-paper underline decoration-accent decoration-2 underline-offset-4">
          Naar de homepage
        </Link>
      </div>
    </main>
  );
}
