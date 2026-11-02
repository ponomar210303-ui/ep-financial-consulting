'use client';
import { motion, useReducedMotion } from 'framer-motion';

// Before/after bars: the grey bar is the old effort, the blue one what is left.
export default function AutomationChart({ rows, columns }) {
  const reduce = useReducedMotion();
  return (
    <ul className="divide-y divide-border">
      {rows.map((row, i) => (
        <li key={row.process} className="grid gap-3 py-5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-8">
          <p className="text-[0.95rem] leading-snug">{row.process}</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs text-muted-foreground">{columns.before}</span>
              <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-slate-200">
                <span className="absolute inset-y-0 right-2 flex items-center text-xs tabular-nums text-slate-600">{row.before}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs font-medium text-primary">{columns.after}</span>
              <div className="relative h-7 flex-1">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-md bg-primary"
                  initial={reduce ? false : { width: 0 }}
                  whileInView={{ width: `${Math.max(row.ratio * 100, 2)}%` }}
                  viewport={{ once: true, margin: '-15% 0px' }}
                  transition={{ duration: 1.1, delay: 0.1 * i, ease: [0.65, 0, 0.35, 1] }}
                  style={reduce ? { width: `${Math.max(row.ratio * 100, 2)}%` } : undefined}
                />
                <span className="absolute inset-y-0 flex items-center pl-2 text-xs font-semibold tabular-nums text-primary" style={{ left: `${Math.max(row.ratio * 100, 2)}%` }}>
                  {row.after}
                </span>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
