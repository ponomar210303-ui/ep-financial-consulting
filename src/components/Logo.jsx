export default function Logo({ size = 'text-2xl' }) {
  return (
    <span className={`${size} font-display font-bold tracking-tight`}>
      EP<span className="text-primary">.</span>
    </span>
  );
}
