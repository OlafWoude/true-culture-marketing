type EyebrowProps = {
  children: React.ReactNode;
  tone?: "dark" | "light";
};

export default function Eyebrow({ children, tone = "dark" }: EyebrowProps) {
  const styles =
    tone === "dark"
      ? "border-white/10 bg-white/[0.04] text-paper/80"
      : "border-ink/10 bg-ink/[0.03] text-ink/70";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}
