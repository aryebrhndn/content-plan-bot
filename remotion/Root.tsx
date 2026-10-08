import React from 'react';
import { Composition } from 'remotion';
import { HajiReels, HajiReelsProps } from './HajiReels';
import { AryeReels, AryeReelsProps } from './AryeReels';

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
    '• Hugging Face Spaces: 2 vCPU & 16 GB RAM',
    '• Docker container 24/7 tanpa bayar sepeserpun',
    '• Render video otomatis dengan Remotion & React',
    '• Telegram Bot sebagai antarmuka remote'
  ],
  cta_footer: 'Follow @aryeburhanudin untuk deep dive tech lainnya!'
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HajiReels"
        component={HajiReels}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultHajiProps}
      />
      <Composition
        id="AryeReels"
        component={AryeReels}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultAryeProps}
      />
    </>
  );
};
