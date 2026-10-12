import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  Audio,
  staticFile,
  Sequence,
  random,
  interpolate,
} from "remotion";

export interface PaperCutoutProps {
  children?: React.ReactNode;
  /** Delay in frames before this cutout drops in */
  delay?: number;
  /** Final resting rotation in degrees (-8 to +8 recommended) */
  rotation?: number;
  width?: number | string;
  height?: number | string;
  /** Paper background color */
  bgColor?: string;
  padding?: string | number;
  /** Show single top masking tape */
  hasTape?: boolean;
  /** Show dual diagonal corner tapes */
  hasCornerTapes?: boolean;
  /** Show metal paperclip clamped on corner */
  hasPaperclip?: boolean;
  /** Show red/silver pushpin pinned into paper */
  hasPushpin?: boolean;
  /** Play a clean, warm tactile thud sound on landing */
  playSound?: boolean;
  /** Polaroid photo mount (thick bottom margin, white photo border) */
  isPhoto?: boolean;
  /** Lined notebook paper styling */
  isNotebook?: boolean;
  /** Kraft paper texture */
  isKraft?: boolean;
  /** Torn paper deckle edges with visible white pulp core */
  tornEdges?: boolean;
  /** Drop shadow style: "hard" | "deep" */
  shadowStyle?: "hard" | "deep";
  /** Unique seed for deterministic randomness */
  seed?: string;
  style?: React.CSSProperties;
}

/**
 * PaperCutout — Tactile Editorial Paper Element (Vox Style)
 * 
 * Clean, tactile stop-motion physics:
 * - 12 fps stepped animation cadence
 * - Handcrafted stop-motion jitter per frame-step
 * - Clean, non-intrusive foley on hero cards only
 * - Torn paper edges with exposed white paper fibers
 */
export const PaperCutout: React.FC<PaperCutoutProps> = ({
  children,
  delay = 0,
  rotation = 0,
  width = "auto",
  height = "auto",
  bgColor = "#FFFFFF",
  padding = "24px 32px",
  hasTape = false,
  hasCornerTapes = false,
  hasPaperclip = false,
  hasPushpin = false,
  playSound = false,
  isPhoto = false,
  isNotebook = false,
  isKraft = false,
  tornEdges = true,
  shadowStyle = "hard",
  seed = "cutout",
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // True Stop-Motion Cadence (12 fps hold)
  const stepFrames = Math.max(1, Math.round(fps / 12));
  const steppedFrame = Math.floor(frame / stepFrames) * stepFrames;

  const f = Math.max(0, steppedFrame - delay);
  const rawF = Math.max(0, frame - delay);

  // ── Heavy Paper Drop Spring ──
  const dropSpring = spring({
    frame: f,
    fps,
    config: { damping: 13, mass: 0.5, stiffness: 220 },
  });

  // Entry transform calculations
  const translateY = interpolate(dropSpring, [0, 1], [-950, 0]);
  const scaleVal = interpolate(dropSpring, [0, 0.4, 1], [1.35, 1.05, 1]);

  // Rotation overshoot then settle
  const initialTilt = rotation >= 0 ? -22 : 22;
  const currentRot = interpolate(dropSpring, [0, 0.7, 1], [initialTilt, rotation * 1.3, rotation]);

  // Subtle stop-motion jitter per hold step once landed
  const jitterStep = Math.floor(frame / stepFrames);
  const jitX = dropSpring >= 0.95 ? (random(`${seed}-jx-${jitterStep}`) - 0.5) * 3 : 0;
  const jitY = dropSpring >= 0.95 ? (random(`${seed}-jy-${jitterStep}`) - 0.5) * 3 : 0;
  const jitR = dropSpring >= 0.95 ? (random(`${seed}-jr-${jitterStep}`) - 0.5) * 1.0 : 0;

  // Background and texture selection
  let finalBg = bgColor;
  if (isKraft) finalBg = "#E5D4B8";
  if (isPhoto) finalBg = "#FAF9F5";
  if (isNotebook) finalBg = "#FBFBF7";

  // Shadows: multi-layered paper elevation
  const shadow =
    shadowStyle === "hard"
      ? "4px 8px 0px rgba(0,0,0,0.22), 8px 16px 2px rgba(0,0,0,0.12)"
      : "0px 10px 30px rgba(0,0,0,0.35), 0px 2px 6px rgba(0,0,0,0.2)";

  // Tape & pin appearance timing
  const tapeDelay = delay + 5;
  const pinDelay = delay + 7;

  return (
    <>
      {/* ── AUDIO FOLEY: Crinkle sound for photos/brolls, warm thud for cards ── */}
      {playSound && (
        <Sequence from={delay}>
          {isPhoto ? (
            <Audio src={staticFile("videomq-6/sound/paper-crinkle.wav")} volume={0.25} />
          ) : (
            <Audio src={staticFile("sfx/thud.wav")} volume={0.25} />
          )}
        </Sequence>
      )}

      {rawF > 0 && (
        <div
          style={{
            position: "relative",
            width,
            height,
            transform: `translate(${translateY + jitX}px, ${jitY}px) scale(${scaleVal}) rotate(${currentRot + jitR}deg)`,
            transformOrigin: "center center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            ...style,
          }}
        >
          {/* ── LAYER A: TORN PAPER BACKGROUND WITH JAGGED DECKLE ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: finalBg,
              filter: tornEdges ? "url(#torn-deckle)" : "none",
              boxShadow: shadow,
              border: isPhoto ? "1px solid #ECE7DE" : "2px solid rgba(255,255,255,0.75)",
              pointerEvents: "none",
            }}
          >
            {/* Lined Notebook Pattern if requested */}
            {isNotebook && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "repeating-linear-gradient(transparent, transparent 31px, rgba(70, 130, 200, 0.25) 31px, rgba(70, 130, 200, 0.25) 32px)",
                  backgroundPosition: "0 10px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 48,
                    width: 2,
                    backgroundColor: "rgba(230, 57, 70, 0.4)",
                  }}
                />
              </div>
            )}

            {/* Paper Fiber Texture Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.01) 3px, rgba(0,0,0,0.01) 4px)",
                backgroundSize: "6px 6px, 12px 12px",
              }}
            />
          </div>

          {/* ── LAYER B: CRISP FOREGROUND CONTENT (UNFILTERED FOR SHARP TYPE) ── */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              width: "100%",
              padding: isPhoto ? "16px 16px 56px 16px" : padding,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {children}
          </div>

          {/* ── TOP CENTER MASKING TAPE ── */}
          {hasTape && frame >= tapeDelay && (
            <div
              style={{
                position: "absolute",
                top: -18,
                left: "50%",
                transform: `translateX(-50%) rotate(${(random(`${seed}-tapeR`) - 0.5) * 6}deg)`,
                width: 120,
                height: 36,
                background: "linear-gradient(180deg, rgba(252, 248, 230, 0.85) 0%, rgba(240, 230, 205, 0.75) 100%)",
                border: "1px dashed rgba(190, 175, 145, 0.45)",
                boxShadow: "0 2px 5px rgba(0,0,0,0.18)",
                zIndex: 25,
                pointerEvents: "none",
              }}
            />
          )}

          {/* ── DUAL CORNER MASKING TAPES ── */}
          {hasCornerTapes && frame >= tapeDelay && (
            <>
              {/* Top Left Tape */}
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: -12,
                  transform: "rotate(-36deg)",
                  width: 85,
                  height: 32,
                  background: "linear-gradient(180deg, rgba(252, 248, 230, 0.85) 0%, rgba(240, 230, 205, 0.75) 100%)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  border: "1px dashed rgba(190, 175, 145, 0.4)",
                  zIndex: 25,
                  pointerEvents: "none",
                }}
              />
              {/* Bottom Right Tape */}
              <div
                style={{
                  position: "absolute",
                  bottom: -12,
                  right: -12,
                  transform: "rotate(-34deg)",
                  width: 85,
                  height: 32,
                  background: "linear-gradient(180deg, rgba(252, 248, 230, 0.85) 0%, rgba(240, 230, 205, 0.75) 100%)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  border: "1px dashed rgba(190, 175, 145, 0.4)",
                  zIndex: 25,
                  pointerEvents: "none",
                }}
              />
            </>
          )}

          {/* ── METAL PAPERCLIP ── */}
          {hasPaperclip && frame >= tapeDelay && (
            <div
              style={{
                position: "absolute",
                top: -24,
                right: 28,
                width: 26,
                height: 58,
                border: "4px solid #A8B2C1",
                borderRadius: "14px 14px 4px 4px",
                borderBottom: "none",
                boxShadow: "2px 4px 6px rgba(0,0,0,0.3)",
                transform: `rotate(${8 + (random(`${seed}-clip`) - 0.5) * 8}deg)`,
                zIndex: 30,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 3,
                  width: 12,
                  height: 34,
                  border: "4px solid #C4CBD6",
                  borderRadius: "0 0 8px 8px",
                  borderTop: "none",
                }}
              />
            </div>
          )}

          {/* ── RED PUSHPIN ── */}
          {hasPushpin && frame >= pinDelay && (
            <div
              style={{
                position: "absolute",
                top: -14,
                left: "50%",
                transform: "translateX(-50%)",
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #FF6B6B 0%, #E63946 60%, #9B111E 100%)",
                boxShadow: "0 6px 12px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.6)",
                border: "1px solid rgba(0,0,0,0.2)",
                zIndex: 30,
              }}
            />
          )}
        </div>
      )}
    </>
  );
};
