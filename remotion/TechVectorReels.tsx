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
  is_clean_footage?: boolean;
}

export const TechVectorReels: React.FC<TechVectorReelsProps> = ({
  hook_header,
  points = [],
  cta_footer,
  brand_badge,
  is_clean_footage = false
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

  // Efek Animasi Sirkuit & Pulse Neon
  const pulse = Math.sin(frame / 8) * 0.05 + 1;
  const circuitPulse = (Math.sin(frame / 6) + 1) / 2;
  const glowIntensity = interpolate(Math.sin(frame / 10), [-1, 1], [15, 35]);
  const rgbHue = (frame * 4) % 360;
  const rgbColor = `hsl(${rgbHue}, 90%, 60%)`;
  const rgbColorAlt = `hsl(${(rgbHue + 60) % 360}, 90%, 60%)`;

  // Badge Default
  const displayBadge = brand_badge || '⚡ 3D TECH • HARDWARE VECTOR';

  // =========================================================================
  // RENDER PURE HARDWARE 3D/VECTOR (CPU & DUAL RAM MODULES DENGAN DATA BUS)
  // =========================================================================
  const renderPureHardwareGraphic = (scale: number = 1.0) => {
    return (
      <svg
        width={700 * scale}
        height={420 * scale}
        viewBox="0 0 700 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: `drop-shadow(0 0 ${glowIntensity}px rgba(0, 240, 255, 0.45))`
        }}
      >
        {/* Motherboard Grid Lines */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeWidth="1" />
          </pattern>
          <linearGradient id="rgbBar1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={rgbColor} />
            <stop offset="100%" stopColor={rgbColorAlt} />
          </linearGradient>
          <linearGradient id="cpuCoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#7928CA" />
            <stop offset="100%" stopColor="#00DFD8" />
          </linearGradient>
        </defs>

        <rect width="700" height="420" fill="url(#grid)" />

        {/* Bus Jalur Data dari RAM ke CPU */}
        <g stroke="#00F0FF" strokeWidth="2.5" strokeDasharray="8 6" strokeDashoffset={-frame * 3}>
          <path d="M 190 120 H 330 V 210 H 370" opacity="0.8" />
          <path d="M 190 160 H 310 V 210 H 370" opacity="0.6" />
          <path d="M 190 260 H 310 V 210 H 370" opacity="0.6" />
          <path d="M 190 300 H 330 V 210 H 370" opacity="0.8" />
        </g>

        {/* ================= RAM STICK 1 (DDR5) ================= */}
        <g transform="translate(60, 90)">
          {/* PCB */}
          <rect x="0" y="0" width="130" height="70" rx="8" fill="#0A0F1D" stroke="#00F0FF" strokeWidth="2.5" />
          {/* RGB Lightbar di atas */}
          <rect x="5" y="4" width="120" height="8" rx="4" fill="url(#rgbBar1)" filter={`drop-shadow(0 0 8px ${rgbColor})`} />
          {/* Heat Spreader Textures */}
          <rect x="10" y="18" width="110" height="34" rx="4" fill="#111B30" stroke="#00F0FF" strokeWidth="1" />
          {/* Memory Chips */}
          <rect x="18" y="24" width="20" height="22" rx="2" fill="#000000" stroke="#7928CA" strokeWidth="1" />
          <rect x="44" y="24" width="20" height="22" rx="2" fill="#000000" stroke="#7928CA" strokeWidth="1" />
          <rect x="70" y="24" width="20" height="22" rx="2" fill="#000000" stroke="#7928CA" strokeWidth="1" />
          <rect x="96" y="24" width="20" height="22" rx="2" fill="#000000" stroke="#7928CA" strokeWidth="1" />
          {/* Gold Pin Contacts */}
          <path d="M 10 60 H 120" stroke="#FFE600" strokeWidth="4" strokeDasharray="3 2" />
          <text x="65" y="38" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            DDR5 6400MHz
          </text>
        </g>

        {/* ================= RAM STICK 2 (DDR5) ================= */}
        <g transform="translate(60, 240)">
          {/* PCB */}
          <rect x="0" y="0" width="130" height="70" rx="8" fill="#0A0F1D" stroke="#00F0FF" strokeWidth="2.5" />
          {/* RGB Lightbar di atas */}
          <rect x="5" y="4" width="120" height="8" rx="4" fill="url(#rgbBar1)" filter={`drop-shadow(0 0 8px ${rgbColorAlt})`} />
          {/* Heat Spreader Textures */}
          <rect x="10" y="18" width="110" height="34" rx="4" fill="#111B30" stroke="#00F0FF" strokeWidth="1" />
          {/* Memory Chips */}
          <rect x="18" y="24" width="20" height="22" rx="2" fill="#000000" stroke="#7928CA" strokeWidth="1" />
          <rect x="44" y="24" width="20" height="22" rx="2" fill="#000000" stroke="#7928CA" strokeWidth="1" />
          <rect x="70" y="24" width="20" height="22" rx="2" fill="#000000" stroke="#7928CA" strokeWidth="1" />
          <rect x="96" y="24" width="20" height="22" rx="2" fill="#000000" stroke="#7928CA" strokeWidth="1" />
          {/* Gold Pin Contacts */}
          <path d="M 10 60 H 120" stroke="#FFE600" strokeWidth="4" strokeDasharray="3 2" />
          <text x="65" y="38" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            CHANNEL B
          </text>
        </g>

        {/* ================= CPU SOCKET & SILICON DIE ================= */}
        <g transform="translate(370, 130)">
          {/* Outer Socket Plate */}
          <rect x="0" y="0" width="160" height="160" rx="18" fill="#080D1A" stroke="#00F0FF" strokeWidth="3" />
          {/* Heatspreader Die */}
          <rect x="20" y="20" width="120" height="120" rx="12" fill="#0F172A" stroke="#7928CA" strokeWidth="2" />
          {/* Silicon Core */}
          <rect
            x="45"
            y="45"
            width="70"
            height="70"
            rx="8"
            fill="url(#cpuCoreGrad)"
            opacity={0.85 + circuitPulse * 0.15}
            filter="drop-shadow(0 0 12px rgba(0, 240, 255, 0.7))"
          />
          {/* CPU Socket Pins Indicator */}
          <circle cx="28" cy="28" r="4" fill="#FFE600" />
          <circle cx="132" cy="28" r="4" fill="#FFE600" />
          <circle cx="28" cy="132" r="4" fill="#FFE600" />
          <circle cx="132" cy="132" r="4" fill="#FFE600" />
          {/* Text Core */}
          <text x="80" y="78" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            ULTRA CPU
          </text>
          <text x="80" y="96" fill="#00F0FF" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
            L3 CACHE
          </text>
        </g>

        {/* Jalur Eksternal Bus PCIe / GPU */}
        <g stroke="#7928CA" strokeWidth="2" strokeDasharray="6 6" strokeDashoffset={frame * 2.5}>
          <path d="M 530 210 H 640 V 100" opacity="0.7" />
          <path d="M 530 210 H 640 V 320" opacity="0.7" />
        </g>
      </svg>
    );
  };

  // =========================================================================
  // JIKA MODE CLEAN FOOTAGE DIMINTA (TANPA TEKS, TANPA KARTU, TANPA CAPTION)
  // =========================================================================
  if (is_clean_footage) {
    const cameraZoom = interpolate(frame, [0, fps * 15], [1, 1.08]);
    const cameraRotate = interpolate(frame, [0, fps * 15], [0, 1.5]);

    return (
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, #0B132B 0%, #030611 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Latar Belakang Garis Sirkuit Ambient */}
        <div
          style={{
            transform: `scale(${cameraZoom}) rotate(${cameraRotate}deg)`,
            transition: 'transform 0.1s linear',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          {isLandscape ? renderPureHardwareGraphic(1.5) : renderPureHardwareGraphic(isSquare ? 1.2 : 1.1)}
        </div>
      </AbsoluteFill>
    );
  }

  // =========================================================================
  // MODE INFOGRAFIS (DENGAN KARTU TEKS EDUKASI)
  // =========================================================================
  if (isLandscape) {
    // 16:9 LANDSCAPE (YOUTUBE / DESKTOP)
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
            {renderPureHardwareGraphic(0.4)}
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
    // 1:1 SQUARE (INSTAGRAM FEED)
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
          {renderPureHardwareGraphic(0.5)}
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

  // 9:16 PORTRAIT (REELS / SHORTS / TIKTOK)
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
        {renderPureHardwareGraphic(0.6)}
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
