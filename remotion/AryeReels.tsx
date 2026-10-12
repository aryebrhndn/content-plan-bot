import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence
} from 'remotion';
import { PaperWrapper } from './6-DaviqinVid1/PaperWrapper';
import { HeadlineText, MarkerHighlight } from './6-DaviqinVid1/Components/Typography';
import { PaperCutout } from './6-DaviqinVid1/Components/PaperCutout';
import { DossierHeader } from './6-DaviqinVid1/Components/CollageElements';

export interface SceneData {
  tag?: string;
  headline: string;
  subtext?: string;
  highlight_word?: string;
  points?: string[];
  exhibit?: string;
  theme?: 'A_Cream' | 'B_DeepInk';
}

export interface AryeReelsProps {
  hook_header: string;
  points?: string[];
  cta_footer: string;
  brand_badge?: string;
  style_variant?: 'regular' | 'papercut';
  scenes?: SceneData[];
  duration_sec?: number;
}

/**
 * SingleScene — Komponen render per scene dinamis.
 * Mendukung Paper Cutout Daviqin (Vox style) dan Regular Cinematic Deep Dive.
 */
const SingleScene: React.FC<{
  scene: SceneData;
  index: number;
  totalScenes: number;
  isLandscape: boolean;
  isSquare: boolean;
  isPapercut: boolean;
  brand_badge?: string;
  cta_footer?: string;
}> = ({
  scene,
  index,
  totalScenes,
  isLandscape,
  isSquare,
  isPapercut,
  brand_badge,
  cta_footer
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isCream = scene.theme !== 'B_DeepInk';
  const isFirstScene = index === 0;
  const isLastScene = index === totalScenes - 1;

  // Animasi masuk kinetic spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 13, mass: 0.5, stiffness: 140 }
  });
  const translateY = interpolate(entrySpring, [0, 1], [-60, 0]);
  const scale = interpolate(entrySpring, [0, 1], [0.88, 1]);
  const opacity = interpolate(entrySpring, [0, 1], [0, 1]);

  // 12 FPS Stop-Motion Wiggle untuk papercut
  const stepFrame = Math.floor(frame / 2.5);
  const wiggleX = isPapercut ? Math.sin(stepFrame * 1.6) * 2.2 : 0;
  const wiggleY = isPapercut ? Math.cos(stepFrame * 1.2) * 1.8 : 0;
  const wiggleRot = isPapercut ? Math.sin(stepFrame * 0.8) * 0.35 : 0;

  // ══════════════════════════════════════════════════════════
  // STYLE 1: PAPERCUT (DAVIQIN VOX EDITORIAL COLLAGE)
  // ══════════════════════════════════════════════════════════
  if (isPapercut) {
    const pad = isLandscape ? '40px 60px' : isSquare ? '45px 35px' : '90px 45px';
    const headlineFontSize = isLandscape ? 44 : isSquare ? 38 : 50;
    const markerFontSize = isLandscape ? 36 : isSquare ? 32 : 44;

    return (
      <PaperWrapper
        theme={scene.theme || (index % 2 === 0 ? 'A_Cream' : 'B_DeepInk')}
        archiveTag={brand_badge || 'DOSSIER ARCHIVE // ARYE BURHANUDIN'}
        exhibitNumber={scene.exhibit || `EXHIBIT #0${index + 1}`}
      >
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: pad,
            boxSizing: 'border-box',
            transform: `translate(${wiggleX}px, ${wiggleY}px) rotate(${wiggleRot}deg)`
          }}
        >
          {/* Header Tab Dokumen Arsip */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <DossierHeader
              tag={scene.tag || brand_badge || 'DOSSIER ARCHIVE'}
              code={scene.exhibit || `REF-MQ // 0${index + 1}`}
              bgColor="#001A4D"
              textColor="#FFE600"
            />
          </div>

          {/* Headline & Marker Highlight */}
          <div
            style={{
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              width: '100%',
              textAlign: 'center',
              boxSizing: 'border-box',
              margin: isLandscape ? '15px 0' : '20px 0'
            }}
          >
            <HeadlineText
              text={scene.headline}
              delay={3}
              fontSize={headlineFontSize}
              color={isCream ? '#101622' : '#F4EBD9'}
              hasPaperBacking={isCream}
            />

            {scene.highlight_word && (
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <MarkerHighlight
                  text={scene.highlight_word}
                  delay={12}
                  fontSize={markerFontSize}
                  color="#FFE600"
                  textColor="#101622"
                />
              </div>
            )}
          </div>

          {/* Kartu Catatan / Bukti Taktil (PaperCutout dengan Lakban / Selotip) */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              margin: isLandscape ? '10px 0' : '20px 0'
            }}
          >
            <PaperCutout
              delay={10}
              rotation={index % 2 === 0 ? -1.2 : 1.4}
              hasTape={true}
              hasCornerTapes={index % 2 === 1}
              isKraft={index % 2 === 1}
              bgColor={index % 2 === 1 ? '#E2D3B8' : '#FFFFFF'}
              padding={isLandscape ? '22px 32px' : isSquare ? '20px 26px' : '28px 34px'}
              shadowStyle="hard"
              style={{
                width: isLandscape ? '85%' : isSquare ? '92%' : '96%',
                boxSizing: 'border-box'
              }}
            >
              {scene.subtext && (
                <div
                  style={{
                    fontFamily: "'Courier Prime', Georgia, monospace",
                    fontSize: isLandscape ? 24 : isSquare ? 24 : 32,
                    lineHeight: 1.38,
                    color: '#161D27',
                    fontWeight: 700,
                    marginBottom: scene.points && scene.points.length > 0 ? 14 : 0
                  }}
                >
                  {scene.subtext}
                </div>
              )}

              {scene.points &&
                scene.points.map((pt, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      marginTop: 10,
                      fontFamily: "'Trebuchet MS', 'Arial Black', sans-serif",
                      fontSize: isLandscape ? 22 : isSquare ? 22 : 28,
                      fontWeight: 800,
                      color: '#001A4D',
                      lineHeight: 1.3
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#E63946',
                        color: '#FFFFFF',
                        width: isLandscape ? 32 : 38,
                        height: isLandscape ? 32 : 38,
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isLandscape ? 18 : 22,
                        fontWeight: 900,
                        flexShrink: 0
                      }}
                    >
                      {pIdx + 1}
                    </div>
                    <span>{pt.replace(/^[-•\d.]+\s*/, '')}</span>
                  </div>
                ))}
            </PaperCutout>
          </div>

          {/* Bagian Bawah: Tombol CTA di akhir atau Status Tracker arsip */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {isLastScene ? (
              <PaperCutout
                delay={16}
                rotation={-0.8}
                bgColor="#E63946"
                hasTape={true}
                padding={isLandscape ? '16px 28px' : '22px 34px'}
                style={{ width: '95%', boxSizing: 'border-box' }}
              >
                <div
                  style={{
                    color: '#FFFFFF',
                    fontSize: isLandscape ? 24 : isSquare ? 24 : 32,
                    fontWeight: 900,
                    letterSpacing: 1,
                    textAlign: 'center'
                  }}
                >
                  {cta_footer || 'Simpan info penting ini! 📌'}
                </div>
              </PaperCutout>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  opacity: 0.85,
                  fontFamily: "'Courier Prime', monospace",
                  fontSize: isLandscape ? 16 : isSquare ? 16 : 22,
                  fontWeight: 800,
                  color: isCream ? '#504030' : '#B0C4DE',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase'
                }}
              >
                <span>
                  BAGIAN {index + 1} DARI {totalScenes} • LANJUTKAN ➔
                </span>
              </div>
            )}
          </div>
        </AbsoluteFill>
      </PaperWrapper>
    );
  }

  // ══════════════════════════════════════════════════════════
  // STYLE 2: REGULAR (CINEMATIC DEEP DIVE TECH)
  // Acuan: 2-BerhalaKaumNuh, 3-SajadahSyirik, 4-MisiKpdAli
  // ══════════════════════════════════════════════════════════
  const bgDark = '#0A0F18';
  const padDark = isLandscape ? '50px 70px' : isSquare ? '45px 35px' : '95px 50px';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgDark,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: padDark,
        boxSizing: 'border-box'
      }}
    >
      {/* Top Brand Pill */}
      <div
        style={{
          backgroundColor: '#1E293B',
          color: '#38BDF8',
          border: '1.5px solid #38BDF8',
          padding: '10px 24px',
          borderRadius: 30,
          fontSize: isLandscape ? 18 : 22,
          fontWeight: 800,
          letterSpacing: 2,
          textTransform: 'uppercase'
        }}
      >
        {brand_badge || '🎙️ ARYE BURHANUDIN • DEEP DIVE TECH'}
      </div>

      {/* Headline & Title */}
      <div
        style={{
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity,
          textAlign: 'center',
          width: '100%',
          margin: '25px 0'
        }}
      >
        <div
          style={{
            fontSize: isLandscape ? 46 : isSquare ? 42 : 56,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.25,
            letterSpacing: '-0.02em'
          }}
        >
          {scene.headline}
        </div>

        {scene.highlight_word && (
          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              borderBottom: '4px solid #38BDF8',
              color: '#38BDF8',
              fontSize: isLandscape ? 36 : 44,
              fontWeight: 900,
              padding: '4px 18px',
              marginTop: 14,
              borderRadius: 6
            }}
          >
            {scene.highlight_word}
          </div>
        )}
      </div>

      {/* Card Content & Evidence Points */}
      <div
        style={{
          backgroundColor: '#161F2E',
          border: '1px solid #334155',
          borderRadius: 20,
          padding: isLandscape ? '28px 36px' : '32px 40px',
          width: '95%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          boxSizing: 'border-box'
        }}
      >
        {scene.subtext && (
          <div
            style={{
              color: '#94A3B8',
              fontSize: isLandscape ? 24 : 30,
              lineHeight: 1.45,
              fontWeight: 500,
              marginBottom: scene.points && scene.points.length > 0 ? 18 : 0
            }}
          >
            {scene.subtext}
          </div>
        )}

        {scene.points &&
          scene.points.map((pt, pIdx) => (
            <div
              key={pIdx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginTop: 12,
                fontSize: isLandscape ? 22 : 28,
                fontWeight: 700,
                color: '#E2E8F0'
              }}
            >
              <div
                style={{
                  backgroundColor: '#38BDF8',
                  color: '#0A0F18',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                  flexShrink: 0
                }}
              >
                {pIdx + 1}
              </div>
              <span>{pt.replace(/^[-•\d.]+\s*/, '')}</span>
            </div>
          ))}
      </div>

      {/* Bottom CTA / Chapter Tracker */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {isLastScene ? (
          <div
            style={{
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              padding: isLandscape ? '18px 36px' : '22px 44px',
              borderRadius: 16,
              fontSize: isLandscape ? 24 : 32,
              fontWeight: 800,
              textAlign: 'center',
              width: '95%',
              boxShadow: '0 10px 25px rgba(2, 132, 199, 0.4)'
            }}
          >
            {cta_footer || 'Simpan info penting ini! 📌'}
          </div>
        ) : (
          <div
            style={{
              color: '#64748B',
              fontSize: isLandscape ? 16 : 22,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase'
            }}
          >
            CHAPTER {index + 1} / {totalScenes}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/**
 * AryeReels — Dynamic Multi-Scene Master Composition.
 * Mendukung kustomisasi scene, durasi adaptif (104s+), rasio 9:16/16:9/1:1,
 * dan variasi style (Papercut Daviqin Vox vs Regular Cinematic Deep Dive).
 */
export const AryeReels: React.FC<AryeReelsProps> = ({
  hook_header,
  points = [],
  cta_footer,
  brand_badge,
  style_variant = 'regular',
  scenes,
  duration_sec
}) => {
  const { width, height, durationInFrames, fps } = useVideoConfig();

  const isLandscape = width > height;
  const isSquare = width === height;
  const isPapercut = style_variant === 'papercut';

  // Bangun daftar scene dinamis jika tidak dikirim dari props
  const scenesToRender: SceneData[] = React.useMemo(() => {
    if (scenes && scenes.length > 0) {
      return scenes;
    }
    const list: SceneData[] = [];
    const pts = points && points.length > 0 ? points : [
      'Analisis mendalam berbasis data primer & fakta riil',
      'Struktur arsitektur komputasi terverifikasi',
      'Optimalisasi sistem & evaluasi berkelanjutan'
    ];

    // Scene 1: Hook Intro
    list.push({
      tag: 'INVESTIGASI // PEMBUKA',
      headline: hook_header || 'POIN PENTING & BEDAH ANALISIS',
      subtext: 'Menyelami inti permasalahan dan anomali yang jarang disadari.',
      highlight_word: (hook_header || 'PENTING').split(' ')[0],
      exhibit: 'EXHIBIT #01',
      theme: 'A_Cream',
      points: [pts[0]]
    });

    // Middle scenes: Tiap poin menjadi scene tersendiri
    const remaining = pts.slice(1);
    remaining.forEach((pt, idx) => {
      const cleanPt = pt.replace(/^[-•\d.]+\s*/, '');
      const words = cleanPt.split(' ');
      const head = words.slice(0, 5).join(' ').toUpperCase();
      const body = words.length > 5 ? words.slice(5).join(' ') : cleanPt;
      list.push({
        tag: `FAKTA #${idx + 2} // BUKTI LAPANGAN`,
        headline: head,
        subtext: body,
        highlight_word: words[0] || 'FAKTA',
        exhibit: `CASE REF #0${idx + 2}`,
        theme: idx % 2 === 0 ? 'B_DeepInk' : 'A_Cream',
        points: [cleanPt]
      });
    });

    // Final Scene: Kesimpulan & CTA
    list.push({
      tag: 'KESIMPULAN // REKOMENDASI',
      headline: 'SOLUSI & TINDAKAN KONKRET',
      subtext: cta_footer || 'Simpan info penting ini dan terapkan solusinya! 📌',
      highlight_word: 'SIMPAN',
      exhibit: 'VERIFIED #COMPLETE',
      theme: 'A_Cream',
      points: ['Simpan catatan ini untuk referensi', 'Bagikan ke rekan atau tim Anda']
    });

    return list;
  }, [scenes, hook_header, points, cta_footer]);

  const totalFrames = durationInFrames || (duration_sec ? Math.round(duration_sec * fps) : 1800);
  const numScenes = Math.max(1, scenesToRender.length);
  const sceneDuration = Math.max(1, Math.floor(totalFrames / numScenes));

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenesToRender.map((scene, idx) => {
        const fromFrame = idx * sceneDuration;
        const isLast = idx === numScenes - 1;
        const duration = isLast ? Math.max(1, totalFrames - fromFrame) : sceneDuration;

        return (
          <Sequence key={idx} from={fromFrame} durationInFrames={duration}>
            <SingleScene
              scene={scene}
              index={idx}
              totalScenes={numScenes}
              isLandscape={isLandscape}
              isSquare={isSquare}
              isPapercut={isPapercut}
              brand_badge={brand_badge}
              cta_footer={cta_footer}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
