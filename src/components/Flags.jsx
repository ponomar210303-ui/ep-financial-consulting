import { useId } from 'react';

// Inline SVG flags: emoji flags do not render on Windows.
export function FlagSK({ className }) {
  return (
    <svg viewBox="0 0 9 6" className={className} aria-hidden="true">
      <rect width="9" height="6" fill="#EE1C25" />
      <rect width="9" height="4" fill="#0B4EA2" />
      <rect width="9" height="2" fill="#FFFFFF" />
      <path d="M2.1 1.35h1.9v1.9c0 .75-.45 1.2-.95 1.45-.5-.25-.95-.7-.95-1.45z" fill="#EE1C25" stroke="#FFFFFF" strokeWidth=".18" />
      <path d="M2.95 1.65h.2v2.2h-.2zM2.6 2.15h.9v.2h-.9zM2.7 2.6h.7v.2h-.7z" fill="#FFFFFF" />
      <path d="M2.3 4.05c.2-.25.45-.3.75-.3s.55.05.75.3c-.25.35-.5.5-.75.62-.25-.12-.5-.27-.75-.62z" fill="#0B4EA2" />
    </svg>
  );
}

export function FlagGB({ className }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <clipPath id={`gb-s-${id}`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`gb-t-${id}`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#gb-s-${id})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#gb-t-${id})`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function FlagCZ({ className }) {
  return (
    <svg viewBox="0 0 9 6" className={className} aria-hidden="true">
      <rect width="9" height="6" fill="#D7141A" />
      <rect width="9" height="3" fill="#FFFFFF" />
      <path d="M0 0 4.5 3 0 6z" fill="#11457E" />
    </svg>
  );
}

export function FlagFR({ className }) {
  return (
    <svg viewBox="0 0 9 6" className={className} aria-hidden="true">
      <rect width="3" height="6" fill="#0055A4" />
      <rect x="3" width="3" height="6" fill="#FFFFFF" />
      <rect x="6" width="3" height="6" fill="#EF4135" />
    </svg>
  );
}
