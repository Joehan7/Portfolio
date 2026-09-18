import { ImageResponse } from 'next/og';
import { theme } from '@/content/theme';
import { profile } from '@/content/profile';
import { copy } from '@/content/copy';
export function makeOG(title: string, outcome: string) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: theme.void,
        color: theme.bone,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: theme.ash }}
      >
        <span>{profile.name}</span>
        <span>{copy.brand}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div
          style={{
            fontSize: title.length > 35 ? 62 : 84,
            letterSpacing: '-3px',
            lineHeight: 1.03,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 27, lineHeight: 1.4, maxWidth: 930, color: theme.ash }}>
          {outcome}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid ' + theme.hairline,
          paddingTop: 24,
          fontSize: 19,
        }}
      >
        <span>{copy.seo.ogLabel}</span>
        <span style={{ color: theme.high }}>{profile.shortName}</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
