import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import {
  Scene01, Scene02, Scene03, Scene04, Scene05, Scene06, Scene07, Scene08, Scene09, Scene10,
  Scene11, Scene12, Scene13, Scene14, Scene15,
} from "./Scenes1";
import {
  Scene16, Scene17, Scene18, Scene19, Scene20, Scene21, Scene22, Scene23, Scene24, Scene25,
  Scene26, Scene27, Scene28, Scene29, Scene30, Scene31, Scene32, Scene33, Scene34, Scene35,
} from "./Scenes2";

/**
 * MainVideo — Editorial Paper-Cutout Motion Collage (Vox Style)
 *
 * 35 scenes across 6300 frames (105s @ 60fps)
 * Alternating A_Cream / B_DeepInk themes
 * Audio: daviqin-kesyirikan.mp3
 */
export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ── NARRATION AUDIO ── */}
      <Audio src={staticFile("videomq-6/sound/daviqin-kesyirikan.mp3")} />

      {/* ── 35 SCENES ── */}
      <Sequence durationInFrames={120}><Scene01 /></Sequence>
      <Sequence from={120} durationInFrames={180}><Scene02 /></Sequence>
      <Sequence from={300} durationInFrames={120}><Scene03 /></Sequence>
      <Sequence from={420} durationInFrames={180}><Scene04 /></Sequence>
      <Sequence from={600} durationInFrames={180}><Scene05 /></Sequence>

      <Sequence from={780} durationInFrames={180}><Scene06 /></Sequence>
      <Sequence from={960} durationInFrames={120}><Scene07 /></Sequence>
      <Sequence from={1080} durationInFrames={120}><Scene08 /></Sequence>
      <Sequence from={1200} durationInFrames={240}><Scene09 /></Sequence>
      <Sequence from={1440} durationInFrames={120}><Scene10 /></Sequence>

      <Sequence from={1560} durationInFrames={120}><Scene11 /></Sequence>
      <Sequence from={1680} durationInFrames={180}><Scene12 /></Sequence>
      <Sequence from={1860} durationInFrames={120}><Scene13 /></Sequence>
      <Sequence from={1980} durationInFrames={180}><Scene14 /></Sequence>
      <Sequence from={2160} durationInFrames={180}><Scene15 /></Sequence>

      <Sequence from={2340} durationInFrames={180}><Scene16 /></Sequence>
      <Sequence from={2520} durationInFrames={120}><Scene17 /></Sequence>
      <Sequence from={2640} durationInFrames={120}><Scene18 /></Sequence>
      <Sequence from={2760} durationInFrames={120}><Scene19 /></Sequence>
      <Sequence from={2880} durationInFrames={240}><Scene20 /></Sequence>

      <Sequence from={3120} durationInFrames={180}><Scene21 /></Sequence>
      <Sequence from={3300} durationInFrames={180}><Scene22 /></Sequence>
      <Sequence from={3480} durationInFrames={120}><Scene23 /></Sequence>
      <Sequence from={3600} durationInFrames={240}><Scene24 /></Sequence>
      <Sequence from={3840} durationInFrames={240}><Scene25 /></Sequence>

      <Sequence from={4080} durationInFrames={180}><Scene26 /></Sequence>
      <Sequence from={4260} durationInFrames={240}><Scene27 /></Sequence>
      <Sequence from={4500} durationInFrames={180}><Scene28 /></Sequence>
      <Sequence from={4680} durationInFrames={180}><Scene29 /></Sequence>
      <Sequence from={4860} durationInFrames={240}><Scene30 /></Sequence>

      <Sequence from={5100} durationInFrames={180}><Scene31 /></Sequence>
      <Sequence from={5280} durationInFrames={180}><Scene32 /></Sequence>
      <Sequence from={5460} durationInFrames={180}><Scene33 /></Sequence>
      <Sequence from={5640} durationInFrames={300}><Scene34 /></Sequence>
      <Sequence from={5940} durationInFrames={360}><Scene35 /></Sequence>
    </AbsoluteFill>
  );
};
