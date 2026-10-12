import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  Audio,
  staticFile,
  Sequence,
  random,
} from "remotion";
import { PaperCutout } from "./PaperCutout";

/* ═══════════════════════════════════════════════
   1. DOSSIER HEADER (Top Category / Archive Tab)
   ═══════════════════════════════════════════════ */
export const DossierHeader: React.FC<{
  tag: string;
  code?: string;
  delay?: number;
  bgColor?: string;
  textColor?: string;
}> = ({
  tag,
  code = "REF-MQ // 026",
  delay = 0,
  bgColor = "#E63946",
  textColor = "#FFFFFF",
}) => {
  return (
    <PaperCutout
      delay={delay}
      rotation={-1.5}
      bgColor={bgColor}
      padding="8px 24px"
      hasTape
      seed={`dossier-${tag}`}
      style={{
        boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
        zIndex: 15,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span
          style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: 22,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: textColor,
          }}
        >
          {tag}
        </span>
        <span
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 16,
            fontWeight: 700,
            opacity: 0.85,
            color: textColor,
            borderLeft: `1.5px solid ${textColor}`,
            paddingLeft: 12,
          }}
        >
          {code}
        </span>
      </div>
    </PaperCutout>
  );
};

/* ═══════════════════════════════════════════════
   2. POLAROID PHOTO (Mounted Evidence Image)
   ═══════════════════════════════════════════════ */
export const PolaroidPhoto: React.FC<{
  src: string;
  caption?: string;
  delay?: number;
  rotation?: number;
  width?: number;
  hasTape?: boolean;
  hasCornerTapes?: boolean;
  hasPaperclip?: boolean;
  hasPushpin?: boolean;
  playSound?: boolean;
  seed?: string;
}> = ({
  src,
  caption,
  delay = 0,
  rotation = 2,
  width = 360,
  hasTape = true,
  hasCornerTapes = false,
  hasPaperclip = false,
  hasPushpin = false,
  playSound = true,
  seed = "polaroid",
}) => {
  return (
    <PaperCutout
      delay={delay}
      rotation={rotation}
      isPhoto
      width={width}
      hasTape={hasTape}
      hasCornerTapes={hasCornerTapes}
      hasPaperclip={hasPaperclip}
      hasPushpin={hasPushpin}
      playSound={playSound}
      seed={seed}
      style={{
        zIndex: 12,
      }}
    >
      <div style={{ width: "100%", overflow: "hidden", backgroundColor: "#111" }}>
        <Img
          src={src}
          style={{
            width: "100%",
            height: width * 1.15,
            objectFit: "cover",
            filter: "contrast(1.08) saturate(0.95)",
            display: "block",
          }}
        />
      </div>
      {caption && (
        <div
          style={{
            marginTop: 14,
            fontFamily: "'Courier Prime', monospace",
            fontSize: 18,
            fontWeight: 700,
            color: "#2B2D42",
            textAlign: "center",
            letterSpacing: "0.04em",
          }}
        >
          {caption}
        </div>
      )}
    </PaperCutout>
  );
};

/* ═══════════════════════════════════════════════
   2B. PAPER CUTOUT IMAGE (Editorial Cutout Sticker)
   ═══════════════════════════════════════════════ */
export const PaperCutoutImage: React.FC<{
  src: string;
  delay?: number;
  rotation?: number;
  width?: number;
  height?: number;
  hasTape?: boolean;
  hasCornerTapes?: boolean;
  hasPaperclip?: boolean;
  hasPushpin?: boolean;
  playCrinkle?: boolean;
  caption?: string;
  seed?: string;
  style?: React.CSSProperties;
}> = ({
  src,
  delay = 0,
  rotation = 0,
  width = 360,
  height,
  hasTape = false,
  hasCornerTapes = false,
  hasPaperclip = false,
  hasPushpin = false,
  playCrinkle = true,
  caption,
  seed = "cutout-img",
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // True Stop-Motion Cadence (12 fps hold)
  const stepFrames = Math.max(1, Math.round(fps / 12));
  const steppedFrame = Math.floor(frame / stepFrames) * stepFrames;

  const f = Math.max(0, steppedFrame - delay);
  const rawF = Math.max(0, frame - delay);

  // Heavy paper drop spring
  const dropSpring = spring({
    frame: f,
    fps,
    config: { damping: 13, mass: 0.5, stiffness: 220 },
  });

  const translateY = interpolate(dropSpring, [0, 1], [-850, 0]);
  const scaleVal = interpolate(dropSpring, [0, 0.4, 1], [1.32, 1.05, 1]);

  // Gentle micro jitter per step
  const jitR = f > 0 ? (random(`${seed}-r-${steppedFrame}`) - 0.5) * 1.5 : 0;
  const currentRot = rotation + jitR;

  return (
    <>
      {/* ── B-ROLL FOLEY: Organic paper crinkle on entrance ── */}
      {playCrinkle && (
        <Sequence from={delay}>
          <Audio src={staticFile("videomq-6/sound/paper-crinkle.wav")} volume={0.24} />
        </Sequence>
      )}

      {rawF > 0 && (
        <div
          style={{
            position: "relative",
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            width,
            transform: `translateY(${translateY}px) scale(${scaleVal}) rotate(${currentRot}deg)`,
            transformOrigin: "center center",
            zIndex: 14,
            ...style,
          }}
        >
          {/* Main transparent cutout image with realistic editorial paper drop shadow */}
          <Img
            src={src}
            style={{
              width: "100%",
              height: height ?? "auto",
              objectFit: "contain",
              display: "block",
              filter:
                "drop-shadow(0 14px 24px rgba(0,0,0,0.38)) drop-shadow(0 3px 6px rgba(0,0,0,0.22))",
            }}
          />

          {/* Optional Caption Badge */}
          {caption && (
            <div
              style={{
                marginTop: -8,
                backgroundColor: "#FAF6EB",
                border: "2px solid #161D27",
                padding: "4px 14px",
                fontFamily: "'Courier Prime', monospace",
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                boxShadow: "2px 3px 0 rgba(0,0,0,0.3)",
                transform: `rotate(${(random(`${seed}-cap`) - 0.5) * 4}deg)`,
                zIndex: 20,
              }}
            >
              {caption}
            </div>
          )}

          {/* Scotch Tape (Top Center) */}
          {hasTape && (
            <div
              style={{
                position: "absolute",
                top: -14,
                left: "50%",
                transform: "translateX(-50%) rotate(-2deg)",
                width: 95,
                height: 30,
                background:
                  "linear-gradient(180deg, rgba(252, 248, 230, 0.88) 0%, rgba(240, 230, 205, 0.78) 100%)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.22)",
                border: "1px dashed rgba(190, 175, 145, 0.4)",
                zIndex: 25,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Corner Tapes */}
          {hasCornerTapes && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: -10,
                  transform: "rotate(-35deg)",
                  width: 80,
                  height: 28,
                  background:
                    "linear-gradient(180deg, rgba(252, 248, 230, 0.88) 0%, rgba(240, 230, 205, 0.78) 100%)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  border: "1px dashed rgba(190, 175, 145, 0.4)",
                  zIndex: 25,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -8,
                  right: -8,
                  transform: "rotate(-32deg)",
                  width: 80,
                  height: 28,
                  background:
                    "linear-gradient(180deg, rgba(252, 248, 230, 0.88) 0%, rgba(240, 230, 205, 0.78) 100%)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  border: "1px dashed rgba(190, 175, 145, 0.4)",
                  zIndex: 25,
                  pointerEvents: "none",
                }}
              />
            </>
          )}

          {/* Metal Paperclip */}
          {hasPaperclip && (
            <div
              style={{
                position: "absolute",
                top: -18,
                right: 20,
                width: 22,
                height: 50,
                border: "4px solid #A8B2C1",
                borderRadius: "12px 12px 4px 4px",
                borderBottom: "none",
                boxShadow: "2px 4px 6px rgba(0,0,0,0.3)",
                transform: `rotate(${6 + (random(`${seed}-clip`) - 0.5) * 8}deg)`,
                zIndex: 30,
              }}
            />
          )}

          {/* Red Pushpin */}
          {hasPushpin && (
            <div
              style={{
                position: "absolute",
                top: -12,
                left: "50%",
                transform: "translateX(-50%)",
                width: 22,
                height: 22,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 35%, #FF6B6B 0%, #E63946 60%, #9B111E 100%)",
                boxShadow:
                  "0 5px 10px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.6)",
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

/* ═══════════════════════════════════════════════
   3. STICKY NOTE (Handwritten / Typewriter Memo)
   ═══════════════════════════════════════════════ */
export const StickyNote: React.FC<{
  text: string;
  delay?: number;
  rotation?: number;
  width?: number;
  color?: "#FFF9A6" | "#FFC1C8" | "#D4EDDA" | "#E5D4B8";
  seed?: string;
}> = ({
  text,
  delay = 0,
  rotation = -3,
  width = 380,
  color = "#FFF9A6",
  seed = "stickynote",
}) => {
  return (
    <PaperCutout
      delay={delay}
      rotation={rotation}
      bgColor={color}
      width={width}
      padding="20px 24px"
      hasPushpin
      seed={seed}
      style={{
        boxShadow: "3px 6px 12px rgba(0,0,0,0.22)",
        zIndex: 14,
      }}
    >
      <div
        style={{
          fontFamily: "'Permanent Marker', 'Courier Prime', cursive",
          fontSize: 22,
          lineHeight: 1.35,
          color: "#161D27",
          textAlign: "left",
          width: "100%",
        }}
      >
        {text}
      </div>
    </PaperCutout>
  );
};

/* ═══════════════════════════════════════════════
   4. HAZARD STRIP (Barricade Tape Accent)
   ═══════════════════════════════════════════════ */
export const HazardStrip: React.FC<{
  text?: string;
  delay?: number;
  rotation?: number;
  width?: number;
}> = ({
  text = "PERINGATAN KERAS // JAUHI SYIRIK // BATALKAN!",
  delay = 0,
  rotation = -4,
  width = 700,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stepFrames = Math.max(1, Math.round(fps / 12));
  const steppedFrame = Math.floor(frame / stepFrames) * stepFrames;
  const f = Math.max(0, steppedFrame - delay);

  const pop = spring({
    frame: f,
    fps,
    config: { damping: 12, mass: 0.4, stiffness: 220 },
  });

  const translateY = interpolate(pop, [0, 1], [-400, 0]);

  return (
    <div
      style={{
        transform: `translateY(${translateY}px) rotate(${rotation}deg)`,
        width,
        height: 44,
        background: `repeating-linear-gradient(
          -45deg,
          #FFE600,
          #FFE600 24px,
          #161D27 24px,
          #161D27 48px
        )`,
        boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
        border: "2px solid #161D27",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 18,
      }}
    >
      <span
        style={{
          backgroundColor: "#161D27",
          color: "#FFE600",
          fontFamily: "'Impact', sans-serif",
          fontSize: 20,
          letterSpacing: "0.15em",
          padding: "4px 18px",
        }}
      >
        {text}
      </span>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   5. EVIDENCE BARCODE TAG (Archival Tag Stub)
   ═══════════════════════════════════════════════ */
export const EvidenceTag: React.FC<{
  label: string;
  sub?: string;
  delay?: number;
  rotation?: number;
}> = ({ label, sub = "VERIFIKASI DIGITAL", delay = 0, rotation = 5 }) => {
  return (
    <PaperCutout
      delay={delay}
      rotation={rotation}
      bgColor="#FAF8F2"
      padding="14px 22px"
      hasCornerTapes
      seed={`tag-${label}`}
      style={{
        border: "2px dashed #999",
        zIndex: 11,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, letterSpacing: "0.2em", color: "#666" }}>
          ★ {sub} ★
        </div>
        <div style={{ fontFamily: "'Impact', sans-serif", fontSize: 26, letterSpacing: "0.08em", color: "#161D27" }}>
          {label}
        </div>
        {/* Mock barcode */}
        <div
          style={{
            height: 22,
            width: 140,
            background:
              "repeating-linear-gradient(90deg, #111 0px, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 7px, transparent 7px, transparent 9px)",
            marginTop: 4,
          }}
        />
      </div>
    </PaperCutout>
  );
};
