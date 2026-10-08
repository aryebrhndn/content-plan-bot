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
}

export const HajiReels: React.FC<HajiReelsProps> = ({
  hook_header,
  points = [],
  cta_footer
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animasi Header (Spring Bounce Masuk)
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 }
  });
  const headerScale = interpolate(headerSpring, [0, 1], [0.8, 1]);
  const headerOpacity = interpolate(headerSpring, [0, 1], [0, 1]);

  // Animasi CTA (Glow & Pulse halus)
  const pulse = Math.sin(frame / 10) * 0.05 + 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0F172A',
        background: 'linear-gradient(180deg, #0A0F1D 0%, #151E33 50%, #080D1A 100%)',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '120px 60px',
        boxSizing: 'border-box'
      }}
    >
      {/* Decorative Brand Tag */}
      <div
        style={{
          color: '#F87171',
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: 'uppercase',
          marginBottom: 20
        }}
      >
        🕋 HAJI DARI MUDA • EDUKASI
      </div>

      {/* 1. KOTAK MERAH (HOOK HEADER) */}
      <div
        style={{
          transform: `scale(${headerScale})`,
          opacity: headerOpacity,
          backgroundColor: '#C8102E',
          color: '#FFFFFF',
          padding: '40px 50px',
          borderRadius: 28,
          boxShadow: '0 20px 45px rgba(200, 16, 46, 0.45)',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          fontSize: 52,
          fontWeight: 900,
          lineHeight: 1.3,
          letterSpacing: 1
        }}
      >
        {hook_header}
      </div>

      {/* 2. KOTAK PUTIH (POIN-POIN EDUKASI DENGAN STAGGERED SPRING) */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          borderRadius: 32,
          padding: '50px 50px',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          margin: '40px 0'
        }}
      >
        {points.map((pt, idx) => {
          // Delay per poin (stagger 15 frame)
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
                fontSize: 42,
                fontWeight: 700,
                color: '#1E293B',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 18
              }}
            >
              <span style={{ color: '#C8102E', fontWeight: 900 }}>•</span>
              <span>{pt.replace(/^[-•\d.]+\s*/, '')}</span>
            </div>
          );
        })}
      </div>

      {/* 3. KOTAK MERAH BAWAH (CTA FOOTER) */}
      <div
        style={{
          transform: `scale(${pulse})`,
          backgroundColor: '#C8102E',
          color: '#FFFFFF',
          padding: '28px 45px',
          borderRadius: 50,
          boxShadow: '0 15px 35px rgba(200, 16, 46, 0.4)',
          textAlign: 'center',
          fontSize: 36,
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
