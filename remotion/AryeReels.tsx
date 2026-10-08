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
}

export const AryeReels: React.FC<AryeReelsProps> = ({
  hook_header,
  points = [],
  cta_footer
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animasi Header (Paper Slam Entry)
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120 }
  });
  const headerTranslateY = interpolate(headerSpring, [0, 1], [-120, 0]);
  const headerRotation = interpolate(headerSpring, [0, 1], [4, -1.8]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F4EBD9', // Kraft Newsprint Background
        fontFamily: "'Trebuchet MS', 'Impact', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '110px 60px',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Editorial Ribbon / Badge */}
      <div
        style={{
          backgroundColor: '#001A4D',
          color: '#FFE600',
          padding: '14px 36px',
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: 3,
          textTransform: 'uppercase',
          border: '4px solid #000',
          boxShadow: '6px 6px 0px #000',
          transform: 'rotate(1deg)'
        }}
      >
        🎙️ ARYE BURHANUDIN • DEEP DIVE TECH
      </div>

      {/* 1. VOX PAPER-CUTOUT HOOK HEADER */}
      <div
        style={{
          transform: `translateY(${headerTranslateY}px) rotate(${headerRotation}deg)`,
          backgroundColor: '#FFE600', // Stabilo Yellow
          color: '#001A4D',
          padding: '42px 48px',
          border: '6px solid #001A4D',
          boxShadow: '14px 14px 0px #001A4D', // Hard Brutalist Shadow
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
          fontSize: 54,
          fontWeight: 900,
          lineHeight: 1.25,
          letterSpacing: 0.5
        }}
      >
        {hook_header}
      </div>

      {/* 2. STAGGERED EDITORIAL CARDS */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
          width: '100%',
          margin: '35px 0'
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
                boxShadow: '8px 8px 0px #001A4D',
                padding: '24px 34px',
                fontSize: 38,
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
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
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

      {/* 3. VOX EDITORIAL CTA FOOTER */}
      <div
        style={{
          backgroundColor: '#E63946', // Editorial Red
          color: '#FFFFFF',
          padding: '28px 45px',
          border: '5px solid #001A4D',
          boxShadow: '10px 10px 0px #001A4D',
          textAlign: 'center',
          fontSize: 34,
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
