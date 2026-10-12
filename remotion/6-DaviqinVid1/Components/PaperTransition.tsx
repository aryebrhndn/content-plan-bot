import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Audio,
  staticFile,
  Sequence,
} from "remotion";

export interface PaperTransitionProps {
  type?: "rip" | "slam" | "slide";
  durationInFrames?: number;
}

/**
 * PaperTransition — Collage Screen Transition (Vox Style)
 * 
 * - "rip": Paper tears open from the center with exposed fibrous white teeth (paper_rip.wav)
 * - "slam": Full-page scrapbook paper drops from above like a fresh page (paper_slam.wav)
 * - "slide": Whole sheet slides off-screen like turning a thick newspaper page (paper_rustle.wav)
 */
export const PaperTransition: React.FC<PaperTransitionProps> = ({
  type = "rip",
  durationInFrames = 22,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // If outside transition duration, render nothing
  if (frame >= durationInFrames) {
    return null;
  }

  // 12 fps stop-motion cadence for transition
  const stepFrames = Math.max(1, Math.round(fps / 12));
  const steppedFrame = Math.floor(frame / stepFrames) * stepFrames;

  if (type === "rip") {
    const progress = spring({
      frame: steppedFrame,
      fps,
      config: { damping: 14, mass: 0.4, stiffness: 180 },
    });

    const ripTopY = interpolate(progress, [0, 0.2, 1], [0, -50, -1100]);
    const ripBotY = interpolate(progress, [0, 0.2, 1], [0, 50, 1100]);
    const ripTopRot = interpolate(progress, [0, 1], [0, -6]);
    const ripBotRot = interpolate(progress, [0, 1], [0, 5]);

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 999,
          overflow: "hidden",
        }}
      >
        <Sequence>
          {/* Transition SFX: Combination of single page turn and tactile creasing */}
          <Audio src={staticFile("videomq-6/sound/page-turn-single.wav")} volume={0.32} />
          <Audio src={staticFile("videomq-6/sound/community-creasing-paper.mp3")} volume={0.2} startFrom={0} endAt={24} />
        </Sequence>
        {/* Top half tearing upwards */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: -40,
            right: -40,
            height: "55%",
            backgroundColor: "#EDE3CE",
            borderBottom: "8px solid #FAF6EB",
            boxShadow: "0 15px 35px rgba(0,0,0,0.45)",
            filter: "url(#torn-deckle)",
            transform: `translateY(${ripTopY}px) rotate(${ripTopRot}deg)`,
            transformOrigin: "left center",
          }}
        />

        {/* Bottom half tearing downwards */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: -40,
            right: -40,
            height: "55%",
            backgroundColor: "#EDE3CE",
            borderTop: "8px solid #FAF6EB",
            boxShadow: "0 -15px 35px rgba(0,0,0,0.45)",
            filter: "url(#torn-deckle)",
            transform: `translateY(${ripBotY}px) rotate(${ripBotRot}deg)`,
            transformOrigin: "right center",
          }}
        />
      </div>
    );
  }

  if (type === "slam") {
    const slam = spring({
      frame: steppedFrame,
      fps,
      config: { damping: 11, mass: 0.4, stiffness: 220 },
    });
    const slamY = interpolate(slam, [0, 1], [-1920, 0]);

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 999,
          overflow: "hidden",
        }}
      >
        <Sequence>
          {/* Transition SFX: Crisp page turn thud */}
          <Audio src={staticFile("videomq-6/sound/page-turn-single.wav")} volume={0.35} />
        </Sequence>
        <div
          style={{
            position: "absolute",
            inset: -20,
            backgroundColor: "#F2E8D4",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            transform: `translateY(${slamY}px)`,
          }}
        />
      </div>
    );
  }

  // Slide type
  const slide = spring({
    frame: steppedFrame,
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 160 },
  });
  const slideX = interpolate(slide, [0, 1], [0, -1150]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 999,
        overflow: "hidden",
      }}
    >
      <Sequence>
        {/* Transition SFX: Page turn sliding with subtle creasing */}
        <Audio src={staticFile("videomq-6/sound/page-turn-single.wav")} volume={0.3} />
        <Audio src={staticFile("videomq-6/sound/community-creasing-paper.mp3")} volume={0.16} startFrom={5} endAt={25} />
      </Sequence>
      <div
        style={{
          position: "absolute",
          inset: -20,
          backgroundColor: "#161D27",
          boxShadow: "15px 0 40px rgba(0,0,0,0.5)",
          transform: `translateX(${slideX}px)`,
        }}
      />
    </div>
  );
};
