import Image from 'next/image';

// CSS iPhone: dark bezel, side buttons and (optionally) a Dynamic Island for
// screenshots that do not already include one. `ratio` = screenshot width / height.
export default function PhoneFrame({ src, alt, ratio, island = false, className = '' }) {
  const button = 'absolute w-[1.6%] bg-[#3a3a3c]';
  return (
    <div className={`relative ${className}`}>
      <span className={`${button} -left-[1.4%] top-[16%] h-[4%] rounded-l-sm`} aria-hidden="true" />
      <span className={`${button} -left-[1.4%] top-[23%] h-[7.5%] rounded-l-sm`} aria-hidden="true" />
      <span className={`${button} -left-[1.4%] top-[32%] h-[7.5%] rounded-l-sm`} aria-hidden="true" />
      <span className={`${button} -right-[1.4%] top-[26%] h-[11%] rounded-r-sm`} aria-hidden="true" />
      <div className="rounded-[15%/7%] bg-[#1c1c1e] p-[3.5%] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/15">
        <div className="relative overflow-hidden rounded-[12%/5.6%] bg-black" style={{ aspectRatio: ratio }}>
          <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 210px, 42vw" className="object-cover object-top" />
          {island && (
            <span className="absolute left-1/2 top-[1.2%] h-[4.1%] w-[31%] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
