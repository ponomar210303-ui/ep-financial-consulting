'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { HandPalmIcon, HandshakeIcon, SealCheckIcon, LockKeyIcon, FlaskIcon } from '@phosphor-icons/react';

const ICONS = [HandPalmIcon, HandshakeIcon, SealCheckIcon, LockKeyIcon, FlaskIcon];

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
            // Entrance animation on the <li>, hover styles on the inner card:
            // framer-motion's inline transform would otherwise cancel the hover lift.
            <motion.li key={pr.title} variants={reduce ? undefined : card} className="h-full">
              <div className="group h-full rounded-xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:shadow-xl">
                <Icon weight="duotone" className="h-8 w-8 text-primary transition-colors duration-300 group-hover:text-white" aria-hidden="true" />
                <p className="mt-4 font-display text-lg font-semibold leading-snug transition-colors duration-300 group-hover:text-white">{pr.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-white/85">{pr.text}</p>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
