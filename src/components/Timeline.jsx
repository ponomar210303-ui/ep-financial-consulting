export default function Timeline({ title, items }) {
  return (
    <div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <ol className="relative mt-6 space-y-7 border-l border-border pl-6">
        {items.map((item) => (
          <li key={item.org} className="relative">
            <span
              className={`absolute -left-[31px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-muted ${
                item.current ? 'bg-primary' : 'bg-slate-300'
              }`}
              aria-hidden="true"
            >
              {item.current && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 motion-reduce:hidden" />}
            </span>
            <p className="text-xs tabular-nums text-muted-foreground">{item.period}</p>
            <p className="mt-1 font-medium leading-snug">{item.role}</p>
            <p className="text-sm text-muted-foreground">{item.org}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
