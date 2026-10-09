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
  style_variant?: 'regular' | 'papercut';
}

export const AryeReels: React.FC<AryeReelsProps> = ({
  hook_header,
  points = [],
  cta_footer,
  brand_badge,
  style_variant = 'regular'
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isLandscape = width > height; // 16:9 (1920x1080)
  const isSquare = width === height;  // 1:1 (1080x1080)
  const isPapercut = style_variant === 'papercut';

  // 12 FPS Stop-Motion Rostrum Wiggle (khas template Daviqin 6-DaviqinVid1)
  const stepFrame = Math.floor(frame / 2.5);
  const wiggleX = isPapercut ? Math.sin(stepFrame * 1.7) * 2.5 : 0;
  const wiggleY = isPapercut ? Math.cos(stepFrame * 1.3) * 2.0 : 0;
  const wiggleRot = isPapercut ? Math.sin(stepFrame * 0.9) * 0.45 : 0;

  // Animasi Header (Paper Slam Entry)
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 }
  });
  const headerTranslateY = interpolate(headerSpring, [0, 1], [-120, 0]);
  const headerRotation = interpolate(headerSpring, [0, 1], [4, -1.8]);

  // Elemen Cutting Mat Grid & Scotch Tape Daviqin
  const renderPapercutDetails = () => {
    if (!isPapercut) return null;
    return (
      <>
        {/* Cutting Mat Precision Grid */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.18
          }}
        >
          <defs>
            <pattern id="cuttingGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#001A4D" strokeWidth="1" />
              <circle cx="20" cy="20" r="1.5" fill="#001A4D" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cuttingGrid)" />
        </svg>

        {/* Vintage Rubber Stamp: EXHIBIT #01 */}
        <div
          style={{
            position: 'absolute',
            top: isLandscape ? 35 : 45,
            right: isLandscape ? 50 : 45,
            border: '4px dashed #E63946',
            color: '#E63946',
            padding: '8px 18px',
            fontSize: isLandscape ? 20 : 22,
            fontWeight: 900,
            letterSpacing: 2,
            textTransform: 'uppercase',
            transform: 'rotate(-9deg)',
            borderRadius: 6,
            opacity: 0.88,
            boxShadow: 'inset 0 0 6px rgba(230, 57, 70, 0.3)'
          }}
        >
          RECORD VERIFIED • EXHIBIT #01
        </div>
      </>
    );
  };

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
          gap: 60,
          transform: isPapercut ? `translate(${wiggleX}px, ${wiggleY}px) rotate(${wiggleRot}deg)` : undefined
        }}
      >
        {renderPapercutDetails()}
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
        boxSizing: 'border-box',
        transform: isPapercut ? `translate(${wiggleX}px, ${wiggleY}px) rotate(${wiggleRot}deg)` : undefined
      }}
    >
      {renderPapercutDetails()}
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
