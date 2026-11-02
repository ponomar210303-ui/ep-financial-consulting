import { FlagSK, FlagCZ, FlagFR } from './Flags';

const FLAGS = { sk: FlagSK, cz: FlagCZ, fr: FlagFR };

// Renders dictionary text where {sk}, {cz} or {fr} stand for small inline flags.
export default function FlagText({ text }) {
  return text.split(/\{(sk|cz|fr)\}/).map((part, i) => {
    if (i % 2 === 0) return part;
    const Flag = FLAGS[part];
    return (
      <Flag
        key={i}
        className="mx-0.5 inline-block h-[0.7em] w-[1.05em] -translate-y-[0.05em] rounded-[2px] align-baseline ring-1 ring-black/10"
      />
    );
  });
}
