export default function Logo({ size = "text-2xl" }) {
  return (
    <span className={`${size} font-inter font-black tracking-tight`}>
      EP<span className="text-primary">.</span>
    </span>
  );
}