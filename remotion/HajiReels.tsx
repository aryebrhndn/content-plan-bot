import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

export interface HajiReelsProps {
  hook_header: string;
  points: string[];
  cta_footer: string;
  brand_badge?: string;
  theme?: string;
}

export const HajiReels: React.FC<HajiReelsProps> = ({
  hook_header,
  points = [],
  cta_footer,
  brand_badge
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isLandscape = width > height; // 16:9 (1920x1080)
  const isSquare = width === height;  // 1:1 (1080x1080)

  // Animasi Header (Spring Bounce Masuk)
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 }
  });
  const headerScale = interpolate(headerSpring, [0, 1], [0.85, 1]);
  const headerOpacity = interpolate(headerSpring, [0, 1], [0, 1]);

  // Animasi CTA (Glow & Pulse halus)
  const pulse = Math.sin(frame / 10) * 0.04 + 1;

  if (isLandscape) {
    // LAYOUT LANDSCAPE (16:9) — 2 Kolom Elegan
    return (
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg, #0A0F1D 0%, #151E33 50%, #080D1A 100%)',
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '70px 90px',
          boxSizing: 'border-box',
          gap: 60
        }}
      >
        {/* Kolom Kiri: Branding & Hook & CTA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div style={{ color: '#F87171', fontSize: 28, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>
            {brand_badge || '🕋 HAJI DARI MUDA • EDUKASI'}
          </div>

          <div
            style={{
              transform: `scale(${headerScale})`,
              opacity: headerOpacity,
              backgroundColor: '#C8102E',
              color: '#FFFFFF',
              padding: '36px 44px',
              borderRadius: 24,
              boxShadow: '0 20px 45px rgba(200, 16, 46, 0.45)',
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1.25,
              textAlign: 'left'
            }}
          >
            {hook_header}
          </div>

          <div
            style={{
              transform: `scale(${pulse})`,
              backgroundColor: '#C8102E',
              color: '#FFFFFF',
              padding: '22px 36px',
              borderRadius: 40,
              boxShadow: '0 15px 35px rgba(200, 16, 46, 0.4)',
              textAlign: 'center',
              fontSize: 26,
              fontWeight: 800,
              width: 'fit-content'
            }}
          >
            {cta_footer}
          </div>
        </div>

        {/* Kolom Kanan: Poin-Poin Edukasi Staggered */}
        <div
          style={{
            flex: 1.3,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            borderRadius: 28,
            padding: '45px 50px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 26
          }}
        >
          {points.map((pt, idx) => {
            const delay = 20 + idx * 14;
            const pointSpring = spring({
              frame: frame - delay,
              fps,
              config: { damping: 14, stiffness: 120 }
            });
            const translateX = interpolate(pointSpring, [0, 1], [-40, 0]);
            const opacity = interpolate(pointSpring, [0, 1], [0, 1]);

            return (
              <div
                key={idx}
                style={{
                  transform: `translateX(${translateX}px)`,
                  opacity,
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#1E293B',
                  lineHeight: 1.35,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16
                }}
              >
                <span style={{ color: '#C8102E', fontWeight: 900 }}>•</span>
                <span>{pt.replace(/^[-•\d.]+\s*/, '')}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  // LAYOUT PORTRAIT (9:16) & SQUARE (1:1)
  const pad = isSquare ? '60px 50px' : '110px 60px';
  const headerFontSize = isSquare ? 42 : 52;
  const pointFontSize = isSquare ? 32 : 42;
  const ctaFontSize = isSquare ? 28 : 36;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0A0F1D 0%, #151E33 50%, #080D1A 100%)',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: pad,
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          color: '#F87171',
          fontSize: isSquare ? 26 : 32,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: 'uppercase',
          marginBottom: 10
        }}
      >
        {brand_badge || '🕋 HAJI DARI MUDA • EDUKASI'}
      </div>

      <div
        style={{
          transform: `scale(${headerScale})`,
          opacity: headerOpacity,
          backgroundColor: '#C8102E',
          color: '#FFFFFF',
          padding: isSquare ? '30px 40px' : '40px 50px',
          borderRadius: 28,
          boxShadow: '0 20px 45px rgba(200, 16, 46, 0.45)',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          fontSize: headerFontSize,
          fontWeight: 900,
          lineHeight: 1.3,
          letterSpacing: 1
        }}
      >
        {hook_header}
      </div>

      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderRadius: 32,
          padding: isSquare ? '36px 40px' : '50px 50px',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: isSquare ? 20 : 32,
          margin: isSquare ? '20px 0' : '40px 0'
        }}
      >
        {points.map((pt, idx) => {
          const delay = 25 + idx * 16;
          const pointSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 14, stiffness: 120 }
          });
          const translateX = interpolate(pointSpring, [0, 1], [-60, 0]);
          const opacity = interpolate(pointSpring, [0, 1], [0, 1]);

          return (
            <div
              key={idx}
              style={{
                transform: `translateX(${translateX}px)`,
                opacity,
                fontSize: pointFontSize,
                fontWeight: 700,
                color: '#1E293B',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16
              }}
            >
              <span style={{ color: '#C8102E', fontWeight: 900 }}>•</span>
              <span>{pt.replace(/^[-•\d.]+\s*/, '')}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          transform: `scale(${pulse})`,
          backgroundColor: '#C8102E',
          color: '#FFFFFF',
          padding: isSquare ? '22px 35px' : '28px 45px',
          borderRadius: 50,
          boxShadow: '0 15px 35px rgba(200, 16, 46, 0.4)',
          textAlign: 'center',
          fontSize: ctaFontSize,
          fontWeight: 800,
          letterSpacing: 1,
          width: '90%',
          boxSizing: 'border-box'
        }}
      >
        {cta_footer}
      </div>
    </AbsoluteFill>
  );
};
