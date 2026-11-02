import Image from 'next/image';
import { PROFILE_PHOTO } from '@/lib/site';

// Shows PROFILE_PHOTO when set, otherwise a neutral placeholder (no generated faces).
export default function Portrait({ alt, placeholder }) {
  if (PROFILE_PHOTO) {
    return (
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-muted">
        <Image src={PROFILE_PHOTO} alt={alt} fill priority sizes="(min-width: 1024px) 320px, 70vw" className="object-cover" />
      </div>
    );
  }
  return (
    <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-input bg-muted">
      <span className="font-display text-6xl font-semibold tracking-tight text-muted-foreground/50" aria-hidden="true">
        EP
      </span>
      <span className="text-sm text-muted-foreground">{placeholder}</span>
    </div>
  );
}
