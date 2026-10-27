import Image from "next/image";

// Auth pages depend on the database and the session cookie, so they must never be prerendered.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4 py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 bottom-0 aspect-[1228/940] w-[900px] bg-white/[0.035]"
        style={{
          maskImage: "url(/brand/gorilla-mark.webp)",
          WebkitMaskImage: "url(/brand/gorilla-mark.webp)",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image src="/brand/wordmark.png" alt="True Culture Marketing" width={760} height={295} className="h-14 w-auto" preload />
        </div>
        <div className="rounded-3xl bg-white p-8 shadow-2xl sm:p-10">{children}</div>
        <p className="mt-6 text-center text-xs text-white/40">Beveiligde beheeromgeving · True Culture Marketing</p>
      </div>
    </div>
  );
}
