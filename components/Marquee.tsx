type MarqueeProps = {
  items: string[];
  tone?: "light" | "dark";
};

export default function Marquee({ items, tone = "light" }: MarqueeProps) {
  if (!items.length) return null;
  const row = [...items, ...items];
  const text = tone === "light" ? "text-ink" : "text-paper";

  return (
    <div
      className="relative overflow-hidden py-8 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]"
      aria-label={items.join(", ")}
    >
      <ul className="marquee-track flex w-max items-center" aria-hidden="true">
        {row.map((item, i) => (
          <li key={i} className={`flex items-center ${text}`}>
            <span className="display whitespace-nowrap px-8 text-3xl sm:text-4xl">{item}</span>
            <span className="h-2 w-2 rounded-full bg-accent" />
          </li>
        ))}
      </ul>
    </div>
  );
}
