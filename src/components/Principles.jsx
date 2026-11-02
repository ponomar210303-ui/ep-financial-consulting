'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { UserCheck, Users, ListChecks, ShieldCheck, FlaskConical } from 'lucide-react';

const ICONS = [UserCheck, Users, ListChecks, ShieldCheck, FlaskConical];

const list = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const card = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Principles({ title, items }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <motion.ul
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        variants={reduce ? undefined : list}
        initial={reduce ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px' }}
      >
        {items.map((pr, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <motion.li
              key={pr.title}
              variants={reduce ? undefined : card}
              className="group rounded-xl border border-border bg-background p-5 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-4 font-medium leading-snug">{pr.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pr.text}</p>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
