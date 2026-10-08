import React from 'react';
import { Composition } from 'remotion';
import { HajiReels, HajiReelsProps } from './HajiReels';
import { AryeReels, AryeReelsProps } from './AryeReels';
import { TechVectorReels, TechVectorReelsProps } from './TechVectorReels';

const defaultHajiProps: HajiReelsProps = {
  hook_header: '5 TIPS PERSIAPAN HAJI DARI MUDA',
  points: [
    '1. Buka porsi haji sedini mungkin',
    '2. Latihan fisik jalan kaki tiap subuh',
    '3. Pelajari fiqih manasik praktis',
    '4. Siapkan mental sabar & ikhlas'
  ],
  cta_footer: 'Simpan & bagikan ke calon tamu Allah!'
};

const defaultAryeProps: AryeReelsProps = {
  hook_header: 'BEDAH ARSITEKTUR CLOUD GRATISAN',
  points: [
    '• Render.com & VPS: Server 24/7 tanpa ribet',
    '• Docker container fleksibel untuk AI agent',
    '• Render video otomatis dengan Remotion & React',
    '• Telegram Bot sebagai antarmuka remote'
  ],
  cta_footer: 'Follow @aryeburhanudin untuk deep dive tech lainnya!'
};

const defaultTechProps: TechVectorReelsProps = {
  hook_header: 'ARSITEKTUR RAM & CPU 3D VEKTOR',
  points: [
    'Dual Channel DDR5 Bandwidth hingga 6400 MT/s',
    'Multi-Core CPU Pipeline & L3 Cache Ultra Cepat',
    'Efisiensi Thermal & Latensi Komputasi Minimum'
  ],
  cta_footer: 'Simpan info arsitektur hardware ini!',
  brand_badge: '⚡ 3D TECH • HARDWARE VECTOR'
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Haji Dari Muda - Portrait (9:16) */}
      <Composition
        id="HajiReels"
        component={HajiReels}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultHajiProps}
      />
      {/* 2. Haji Dari Muda - Landscape (16:9) */}
      <Composition
        id="HajiReelsLandscape"
        component={HajiReels}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultHajiProps}
      />
      {/* 3. Haji Dari Muda - Square (1:1) */}
      <Composition
        id="HajiReelsSquare"
        component={HajiReels}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={defaultHajiProps}
      />

      {/* 4. Arye Burhanudin - Portrait (9:16) */}
      <Composition
        id="AryeReels"
        component={AryeReels}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultAryeProps}
      />
      {/* 5. Arye Burhanudin - Landscape (16:9) */}
      <Composition
        id="AryeReelsLandscape"
        component={AryeReels}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultAryeProps}
      />
      {/* 6. Arye Burhanudin - Square (1:1) */}
      <Composition
        id="AryeReelsSquare"
        component={AryeReels}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={defaultAryeProps}
      />

      {/* 7. Tech Vector / 3D Hardware - Portrait (9:16) */}
      <Composition
        id="TechVectorReels"
        component={TechVectorReels}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultTechProps}
      />
      {/* 8. Tech Vector / 3D Hardware - Landscape (16:9) */}
      <Composition
        id="TechVectorReelsLandscape"
        component={TechVectorReels}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultTechProps}
      />
      {/* 9. Tech Vector / 3D Hardware - Square (1:1) */}
      <Composition
        id="TechVectorReelsSquare"
        component={TechVectorReels}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={defaultTechProps}
      />
    </>
  );
};
