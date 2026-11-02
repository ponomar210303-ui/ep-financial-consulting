import { ImageResponse } from 'next/og';
import { getDictionary } from '@/i18n/dictionaries';
import { locales } from '@/i18n/config';
import { SITE_NAME } from '@/lib/site';

// Text-only share card until a real photo is chosen (no AI-generated portrait).
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = SITE_NAME;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function OpengraphImage({ params }) {
  const t = getDictionary(params.locale);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#FFFFFF',
          color: '#0F172A',
          borderTop: '16px solid #2563EB',
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700 }}>
          EP<span style={{ color: '#2563EB' }}>.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>{SITE_NAME}</div>
          <div style={{ marginTop: 20, fontSize: 38, color: '#475569', maxWidth: 950, lineHeight: 1.3 }}>
            {t.hero.headline}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#475569' }}>epfinance.sk</div>
      </div>
    ),
    size
  );
}
