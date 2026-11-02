// Endless horizontal strip of tags; pure CSS, pauses on hover and for reduced motion.
export default function Marquee({ items, label }) {
  const row = (hidden) => (
    <ul className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className="whitespace-nowrap font-display text-2xl font-medium tracking-tight text-foreground/70 sm:text-3xl">
          {item}
        </li>
      ))}
    </ul>
  );
  return (
    <div className="group relative flex overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" aria-label={label}>
      <div className="flex animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
