'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

// Counts the numeric part of a value like "~40 h" or "5 800+" up from zero
// the first time it is visible; prefix/suffix text stays as is.
export default function CountUp({ value, duration = 1400 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const match = String(value).match(/^(\D*)([\d\s., ]+?)(\D*)$/);
  const target = match ? Number(match[2].replace(/[\s., ]/g, '')) : NaN;
  const sep = match && /[\s ]/.test(match[2]) ? ' ' : match && /,/.test(match[2]) ? ',' : '';
  const [n, setN] = useState(target);

  useEffect(() => {
    if (!inView || reduce || Number.isNaN(target)) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setN(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, target, duration]);

  if (!match || Number.isNaN(target)) return <span ref={ref}>{value}</span>;
  const formatted = sep ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep) : String(n);
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">{match[1]}{formatted}{match[3]}</span>
    </span>
  );
}
