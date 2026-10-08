import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

export interface TechVectorReelsProps {
  hook_header: string;
  points: string[];
  cta_footer: string;
  brand_badge?: string;
  duration_sec?: number;
}

export const TechVectorReels: React.FC<TechVectorReelsProps> = ({
  hook_header,
  points = [],
  cta_footer,
  brand_badge
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isLandscape = width > height; // 16:9 (1920x1080)
  const isSquare = width === height;  // 1:1 (1080x1080)

  // Animasi Header (Smooth Spring Slide-Down)
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 }
  });
  const headerTranslateY = interpolate(headerSpring, [0, 1], [-80, 0]);
  const headerOpacity = interpolate(headerSpring, [0, 1], [0, 1]);

  // Efek Pulse Neon & Circuit Data Pulse
  const pulse = Math.sin(frame / 8) * 0.05 + 1;
  const circuitPulse = (Math.sin(frame / 6) + 1) / 2;
  const glowIntensity = interpolate(Math.sin(frame / 10), [-1, 1], [15, 35]);

  // Badge Default
  const displayBadge = brand_badge || '⚡ 3D TECH • HARDWARE VECTOR';

  // SVG Animasi Vektor CPU / RAM
  const renderHardwareSvg = (size: number = 180) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: `drop-shadow(0 0 ${glowIntensity}px rgba(0, 240, 255, 0.6))`,
          transform: `scale(${pulse})`
        }}
      >
        {/* Circuit Tracks */}
        <path
          d="M20 50 H60 V90 H30 M140 30 V70 H170 M40 160 H80 V130 M150 170 H120 V120"
          stroke="#00F0FF"
          strokeWidth="3"
          strokeDasharray="6 6"
          strokeOpacity={0.4 + circuitPulse * 0.5}
        />
        {/* CPU Outer Die */}
        <rect
          x="60"
          y="60"
          width="80"
          height="80"
          rx="12"
          fill="#0D1322"
          stroke="#00F0FF"
          strokeWidth="4"
        />
        {/* CPU Silicon Core (3D Vector Effect) */}
        <rect
          x="75"
          y="75"
          width="50"
          height="50"
          rx="6"
          fill="url(#coreGradient)"
          stroke="#7928CA"
          strokeWidth="2"
        />
        {/* RAM Stick Silhouette / Memory Bus */}
        <rect x="35" y="95" width="10" height="10" rx="2" fill="#00F0FF" opacity={circuitPulse} />
        <rect x="155" y="95" width="10" height="10" rx="2" fill="#7928CA" opacity={1 - circuitPulse} />
        <rect x="95" y="35" width="10" height="10" rx="2" fill="#00F0FF" opacity={1 - circuitPulse} />
        <rect x="95" y="155" width="10" height="10" rx="2" fill="#7928CA" opacity={circuitPulse} />

        {/* CPU Pin Dots */}
        <circle cx="70" cy="70" r="3" fill="#00F0FF" />
        <circle cx="130" cy="70" r="3" fill="#00F0FF" />
        <circle cx="70" cy="130" r="3" fill="#00F0FF" />
        <circle cx="130" cy="130" r="3" fill="#00F0FF" />

        {/* Core Text Label */}
        <text
          x="100"
          y="105"
          fill="#FFFFFF"
          fontSize="11"
          fontWeight="bold"
          fontFamily="monospace"
          textAnchor="middle"
        >
          CPU/RAM
        </text>

        <defs>
          <linearGradient id="coreGradient" x1="75" y1="75" x2="125" y2="125" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00F0FF" />
            <stop offset="1" stopColor="#7928CA" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  if (isLandscape) {
    // ==========================================
    // 16:9 LANDSCAPE (YOUTUBE / DESKTOP)
    // ==========================================
    return (
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 20% 30%, #111A30 0%, #060913 100%)',
          fontFamily: "'Segoe UI', Roboto, -apple-system, sans-serif",
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
          boxSizing: 'border-box',
          gap: 60,
          color: '#FFFFFF'
        }}
      >
        {/* Kolom Kiri: Header, SVG Hardware 3D Vector, CTA */}
        <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                borderRadius: 20,
                padding: '8px 20px',
                color: '#00F0FF',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 24
              }}
            >
              {displayBadge}
            </div>

            <div
              style={{
                transform: `translateY(${headerTranslateY}px)`,
                opacity: headerOpacity,
                background: 'rgba(13, 20, 38, 0.85)',
                border: '2px solid rgba(0, 240, 255, 0.5)',
                boxShadow: '0 15px 40px rgba(0, 240, 255, 0.15)',
                borderRadius: 24,
                padding: '34px 40px',
                fontSize: 42,
                fontWeight: 900,
                lineHeight: 1.25,
                color: '#FFFFFF'
              }}
            >
              {hook_header}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            {renderHardwareSvg(130)}
            <div
              style={{
                background: 'linear-gradient(90deg, #00F0FF 0%, #7928CA 100%)',
                color: '#FFFFFF',
                padding: '20px 36px',
                borderRadius: 40,
                fontSize: 24,
                fontWeight: 800,
                boxShadow: '0 10px 30px rgba(121, 40, 202, 0.4)'
              }}
            >
              {cta_footer}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Poin-poin Animasi Vektor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
          {points.map((pt, i) => {
            const itemSpring = spring({
              frame: frame - (15 + i * 10),
              fps,
              config: { damping: 14, stiffness: 120 }
            });
            const itemOpacity = interpolate(itemSpring, [0, 1], [0, 1]);
            const itemTranslateX = interpolate(itemSpring, [0, 1], [50, 0]);

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `translateX(${itemTranslateX}px)`,
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                  borderLeft: '6px solid #00F0FF',
                  borderRadius: 16,
                  padding: '22px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  fontSize: 26,
                  fontWeight: 600,
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div
                  style={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(0, 240, 255, 0.2)',
                    color: '#00F0FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 900
                  }}
                >
                  {i + 1}
                </div>
                <div>{pt}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  if (isSquare) {
    // ==========================================
    // 1:1 SQUARE (INSTAGRAM FEED)
    // ==========================================
    return (
      <AbsoluteFill
        style={{
          background: 'radial-gradient(circle at 50% 20%, #111A30 0%, #060913 100%)',
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 50px',
          boxSizing: 'border-box',
          color: '#FFFFFF'
        }}
      >
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: 20,
              padding: '8px 24px',
              color: '#00F0FF',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 2,
              marginBottom: 20
            }}
          >
            {displayBadge}
          </div>

          <div
            style={{
              transform: `translateY(${headerTranslateY}px)`,
              opacity: headerOpacity,
              background: 'rgba(13, 20, 38, 0.9)',
              border: '2px solid rgba(0, 240, 255, 0.45)',
              borderRadius: 20,
              padding: '28px 32px',
              fontSize: 36,
              fontWeight: 900,
              lineHeight: 1.3
            }}
          >
            {hook_header}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '15px 0' }}>
          {renderHardwareSvg(120)}
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {points.slice(0, 3).map((pt, i) => {
            const itemSpring = spring({
              frame: frame - (15 + i * 8),
              fps,
              config: { damping: 14, stiffness: 120 }
            });
            return (
              <div
                key={i}
                style={{
                  opacity: interpolate(itemSpring, [0, 1], [0, 1]),
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderLeft: '5px solid #00F0FF',
                  borderRadius: 14,
                  padding: '16px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  fontSize: 22,
                  fontWeight: 600
                }}
              >
                <div style={{ color: '#00F0FF', fontWeight: 900 }}>⚡</div>
                <div>{pt}</div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            background: 'linear-gradient(90deg, #00F0FF 0%, #7928CA 100%)',
            padding: '18px 36px',
            borderRadius: 30,
            fontSize: 22,
            fontWeight: 800,
            boxShadow: '0 8px 25px rgba(121, 40, 202, 0.4)',
            textAlign: 'center'
          }}
        >
          {cta_footer}
        </div>
      </AbsoluteFill>
    );
  }

  // ==========================================
  // 9:16 PORTRAIT (REELS / SHORTS / TIKTOK)
  // ==========================================
  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(circle at 50% 15%, #111A30 0%, #060913 100%)',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '120px 60px 100px 60px',
        boxSizing: 'border-box',
        color: '#FFFFFF'
      }}
    >
      {/* Bagian Atas: Badge & Header */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.5)',
            borderRadius: 24,
            padding: '12px 30px',
            color: '#00F0FF',
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: 2,
            marginBottom: 36
          }}
        >
          {displayBadge}
        </div>

        <div
          style={{
            transform: `translateY(${headerTranslateY}px)`,
            opacity: headerOpacity,
            background: 'rgba(13, 20, 38, 0.92)',
            border: '2px solid rgba(0, 240, 255, 0.5)',
            borderRadius: 28,
            padding: '42px 40px',
            fontSize: 44,
            fontWeight: 900,
            lineHeight: 1.3,
            boxShadow: '0 20px 50px rgba(0, 240, 255, 0.15)'
          }}
        >
          {hook_header}
        </div>
      </div>

      {/* Bagian Tengah: Animasi Hardware 3D Vector */}
      <div style={{ margin: '20px 0' }}>
        {renderHardwareSvg(200)}
      </div>

      {/* Bagian Bawah: Poin-Poin Staggered */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {points.map((pt, i) => {
          const itemSpring = spring({
            frame: frame - (15 + i * 10),
            fps,
            config: { damping: 14, stiffness: 120 }
          });
          const itemOpacity = interpolate(itemSpring, [0, 1], [0, 1]);
          const itemTranslateY = interpolate(itemSpring, [0, 1], [30, 0]);

          return (
            <div
              key={i}
              style={{
                opacity: itemOpacity,
                transform: `translateY(${itemTranslateY}px)`,
                background: 'rgba(15, 23, 42, 0.85)',
                borderLeft: '6px solid #00F0FF',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                borderLeftWidth: '6px',
                borderRadius: 20,
                padding: '24px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                fontSize: 26,
                fontWeight: 600,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div
                style={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(0, 240, 255, 0.2)',
                  color: '#00F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 900
                }}
              >
                {i + 1}
              </div>
              <div>{pt}</div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div
        style={{
          transform: `scale(${pulse})`,
          background: 'linear-gradient(90deg, #00F0FF 0%, #7928CA 100%)',
          color: '#FFFFFF',
          padding: '24px 44px',
          borderRadius: 44,
          fontSize: 28,
          fontWeight: 800,
          boxShadow: '0 15px 40px rgba(121, 40, 202, 0.5)',
          textAlign: 'center',
          width: '90%'
        }}
      >
        {cta_footer}
      </div>
    </AbsoluteFill>
  );
};
