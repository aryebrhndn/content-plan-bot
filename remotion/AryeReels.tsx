import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

export interface AryeReelsProps {
  hook_header: string;
  points: string[];
  cta_footer: string;
  brand_badge?: string;
  theme?: string;
}

export const AryeReels: React.FC<AryeReelsProps> = ({
  hook_header,
  points = [],
  cta_footer,
  brand_badge
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isLandscape = width > height; // 16:9 (1920x1080)
  const isSquare = width === height;  // 1:1 (1080x1080)

  // Animasi Header (Paper Slam Entry)
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 }
  });
  const headerTranslateY = interpolate(headerSpring, [0, 1], [-120, 0]);
  const headerRotation = interpolate(headerSpring, [0, 1], [4, -1.8]);

  if (isLandscape) {
    // LAYOUT LANDSCAPE (16:9) — Vox Editorial 2-Column Split
    return (
      <AbsoluteFill
        style={{
          backgroundColor: '#F4EBD9',
          fontFamily: "'Trebuchet MS', 'Impact', sans-serif",
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
          boxSizing: 'border-box',
          gap: 60
        }}
      >
        {/* Kolom Kiri: Badge + Yellow Header + Red CTA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div
            style={{
              backgroundColor: '#001A4D',
              color: '#FFE600',
              padding: '12px 28px',
              fontWeight: 900,
              fontSize: 24,
              letterSpacing: 2,
              textTransform: 'uppercase',
              border: '4px solid #000',
              boxShadow: '5px 5px 0px #000',
              transform: 'rotate(1deg)',
              width: 'fit-content'
            }}
          >
            {brand_badge || '🎙️ ARYE BURHANUDIN • DEEP DIVE TECH'}
          </div>

          <div
            style={{
              transform: `translateY(${headerTranslateY}px) rotate(${headerRotation}deg)`,
              backgroundColor: '#FFE600',
              color: '#001A4D',
              padding: '36px 40px',
              border: '6px solid #001A4D',
              boxShadow: '12px 12px 0px #001A4D',
              fontSize: 42,
              fontWeight: 900,
              lineHeight: 1.25,
              textAlign: 'left'
            }}
          >
            {hook_header}
          </div>

          <div
            style={{
              backgroundColor: '#E63946',
              color: '#FFFFFF',
              padding: '20px 32px',
              border: '4px solid #001A4D',
              boxShadow: '7px 7px 0px #001A4D',
              fontSize: 26,
              fontWeight: 900,
              width: 'fit-content',
              transform: 'rotate(-0.8deg)'
            }}
          >
            {cta_footer}
          </div>
        </div>

        {/* Kolom Kanan: Editorial Cards */}
        <div
          style={{
            flex: 1.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            justifyContent: 'center'
          }}
        >
          {points.map((pt, idx) => {
            const delay = 18 + idx * 16;
            const cardSpring = spring({
              frame: frame - delay,
              fps,
              config: { damping: 12, stiffness: 140 }
            });
            const scale = interpolate(cardSpring, [0, 1], [0.8, 1]);
            const opacity = interpolate(cardSpring, [0, 1], [0, 1]);
            const rot = idx % 2 === 0 ? 0.6 : -1;

            return (
              <div
                key={idx}
                style={{
                  transform: `scale(${scale}) rotate(${rot}deg)`,
                  opacity,
                  backgroundColor: '#FFFFFF',
                  border: '4px solid #001A4D',
                  boxShadow: '7px 7px 0px #001A4D',
                  padding: '20px 28px',
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#001A4D',
                  lineHeight: 1.35,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}
              >
                <div
                  style={{
                    backgroundColor: '#E63946',
                    color: '#FFFFFF',
                    width: 38,
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 900,
                    flexShrink: 0
                  }}
                >
                  {idx + 1}
                </div>
                <span>{pt.replace(/^[-•\d.]+\s*/, '')}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  // LAYOUT PORTRAIT (9:16) & SQUARE (1:1)
  const pad = isSquare ? '50px 40px' : '110px 60px';
  const headerFontSize = isSquare ? 42 : 54;
  const cardFontSize = isSquare ? 28 : 38;
  const ctaFontSize = isSquare ? 26 : 34;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F4EBD9',
        fontFamily: "'Trebuchet MS', 'Impact', sans-serif",
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
          backgroundColor: '#001A4D',
          color: '#FFE600',
          padding: isSquare ? '10px 26px' : '14px 36px',
          fontWeight: 900,
          fontSize: isSquare ? 24 : 30,
          letterSpacing: 3,
          textTransform: 'uppercase',
          border: '4px solid #000',
          boxShadow: '6px 6px 0px #000',
          transform: 'rotate(1deg)'
        }}
      >
        {brand_badge || '🎙️ ARYE BURHANUDIN • DEEP DIVE TECH'}
      </div>

      <div
        style={{
          transform: `translateY(${headerTranslateY}px) rotate(${headerRotation}deg)`,
          backgroundColor: '#FFE600',
          color: '#001A4D',
          padding: isSquare ? '28px 36px' : '42px 48px',
          border: '6px solid #001A4D',
          boxShadow: isSquare ? '10px 10px 0px #001A4D' : '14px 14px 0px #001A4D',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          fontSize: headerFontSize,
          fontWeight: 900,
          lineHeight: 1.25,
          letterSpacing: 0.5
        }}
      >
        {hook_header}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isSquare ? 16 : 26,
          width: '100%',
          margin: isSquare ? '15px 0' : '35px 0'
        }}
      >
        {points.map((pt, idx) => {
          const delay = 20 + idx * 18;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12, stiffness: 140 }
          });
          const scale = interpolate(cardSpring, [0, 1], [0.75, 1]);
          const opacity = interpolate(cardSpring, [0, 1], [0, 1]);
          const rot = idx % 2 === 0 ? 0.8 : -1.2;

          return (
            <div
              key={idx}
              style={{
                transform: `scale(${scale}) rotate(${rot}deg)`,
                opacity,
                backgroundColor: '#FFFFFF',
                border: '4px solid #001A4D',
                boxShadow: isSquare ? '6px 6px 0px #001A4D' : '8px 8px 0px #001A4D',
                padding: isSquare ? '18px 26px' : '24px 34px',
                fontSize: cardFontSize,
                fontWeight: 800,
                color: '#001A4D',
                lineHeight: 1.35,
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}
            >
              <div
                style={{
                  backgroundColor: '#E63946',
                  color: '#FFFFFF',
                  width: isSquare ? 34 : 44,
                  height: isSquare ? 34 : 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isSquare ? 20 : 26,
                  fontWeight: 900,
                  flexShrink: 0
                }}
              >
                {idx + 1}
              </div>
              <span>{pt.replace(/^[-•\d.]+\s*/, '')}</span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          backgroundColor: '#E63946',
          color: '#FFFFFF',
          padding: isSquare ? '20px 32px' : '28px 45px',
          border: '5px solid #001A4D',
          boxShadow: isSquare ? '7px 7px 0px #001A4D' : '10px 10px 0px #001A4D',
          textAlign: 'center',
          fontSize: ctaFontSize,
          fontWeight: 900,
          letterSpacing: 1,
          width: '95%',
          boxSizing: 'border-box',
          transform: 'rotate(-0.8deg)'
        }}
      >
        {cta_footer}
      </div>
    </AbsoluteFill>
  );
};
