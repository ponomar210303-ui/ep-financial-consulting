'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

// Shows a poster image; the YouTube player (youtube-nocookie) loads only after a click.
export default function ProjectVideo({ id, title, playLabel, caption, poster, posterAlt, className = '', posterClassName = 'object-center' }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <>
          <Image
            src={poster}
            alt={posterAlt}
            fill
            sizes="(min-width: 1024px) 1100px, 100vw"
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${posterClassName}`}
          />
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute bottom-3 left-3 inline-flex items-center gap-2.5 rounded-full bg-white/95 py-1.5 pl-1.5 pr-4 text-xs font-medium sm:bottom-5 sm:left-5 sm:gap-3 sm:py-2 sm:pl-2 sm:pr-5 sm:text-sm text-foreground shadow-lg backdrop-blur transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white sm:h-10 sm:w-10">
              <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
            </span>
            <span className="sr-only">{playLabel}. </span>
            {caption}
          </button>
        </>
      )}
    </div>
  );
}
