import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Audio,
  staticFile,
  Sequence,
  random,
} from "remotion";

/* ═══════════════════════════════════════════════
   1. EDITORIAL HEADLINE TEXT (Playfair / Fraunces)
   ═══════════════════════════════════════════════ */
export const HeadlineText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  align?: "left" | "center" | "right";
  hasPaperBacking?: boolean;
}> = ({
  text,
  delay = 0,
  fontSize = 64,
  color = "#161D27",
  align = "center",
  hasPaperBacking = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // True Stop-Motion Cadence (12 fps)
  const stepFrames = Math.max(1, Math.round(fps / 12));
  const steppedFrame = Math.floor(frame / stepFrames) * stepFrames;
  const f = Math.max(0, steppedFrame - delay);
  const rawF = Math.max(0, frame - delay);

  const pop = spring({
    frame: f,
    fps,
    config: { damping: 13, mass: 0.45, stiffness: 210 },
  });

  const scale = interpolate(pop, [0, 0.4, 1], [0.6, 1.08, 1]);
  const translateY = interpolate(pop, [0, 1], [40, 0]);

  return (
    <>
      {rawF > 0 && (
        <div
          style={{
            fontFamily: "'Playfair Display', 'Fraunces', Georgia, serif",
            fontWeight: 900,
            fontSize,
            color,
            textAlign: align,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            transform: `translateY(${translateY}px) scale(${scale})`,
            backgroundColor: hasPaperBacking ? "#FAF8F2" : "transparent",
            padding: hasPaperBacking ? "8px 24px" : 0,
            boxShadow: hasPaperBacking ? "3px 5px 0px rgba(0,0,0,0.18)" : "none",
            border: hasPaperBacking ? "1.5px solid #222" : "none",
            display: "inline-block",
          }}
        >
          {text}
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════
   2. RANSOM NOTE TEXT (Hand-cut newspaper words)
   ═══════════════════════════════════════════════ */
export const RansomText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
}> = ({ text, delay = 0, fontSize = 52 }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px 8px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Single clean pop on entire phrase landing, NOT per word */}
      <Sequence from={delay}>
        <Audio src={staticFile("sfx/pop.wav")} volume={0.22} />
      </Sequence>

      {words.map((word, wIdx) => {
        const wordDelay = delay + wIdx * 3;
        const rawF = Math.max(0, frame - wordDelay);

        // Deterministic newspaper cutout styles
        const rot = (random(`ransom-rot-${wIdx}`) - 0.5) * 12;
        const colorScheme = wIdx % 4; // 0=White/Black, 1=Black/White, 2=Red/White, 3=Yellow/Black
        let bg = "#FDFBF7";
        let fg = "#161D27";
        let border = "2px solid #161D27";

        if (colorScheme === 1) {
          bg = "#161D27";
          fg = "#FDFBF7";
          border = "none";
        } else if (colorScheme === 2) {
          bg = "#E63946";
          fg = "#FFFFFF";
          border = "none";
        } else if (colorScheme === 3) {
          bg = "#FFE600";
          fg = "#161D27";
          border = "2px solid #161D27";
        }

        const fontChoice =
          wIdx % 3 === 0
            ? "'Impact', 'Arial Black', sans-serif"
            : wIdx % 3 === 1
            ? "'Playfair Display', serif"
            : "'Courier Prime', monospace";

        return (
          <React.Fragment key={wIdx}>
            {rawF > 0 && (
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: fontChoice,
                    fontWeight: 900,
                    fontSize: fontSize * (0.9 + random(`ransom-sz-${wIdx}`) * 0.25),
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: fg,
                    backgroundColor: bg,
                    border,
                    padding: "6px 14px 4px",
                    boxShadow: "3px 4px 0px rgba(0,0,0,0.22)",
                    transform: `rotate(${rot}deg)`,
                  }}
                >
                  {word}
                </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   3. MARKER HIGHLIGHT (Tactile Stabilo Sweep)
   ═══════════════════════════════════════════════ */
export const MarkerHighlight: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  textColor?: string;
}> = ({
  text,
  delay = 0,
  fontSize = 58,
  color = "#FFE600",
  textColor = "#161D27",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stepFrames = Math.max(1, Math.round(fps / 12));
  const steppedFrame = Math.floor(frame / stepFrames) * stepFrames;
  const f = Math.max(0, steppedFrame - delay);
  const rawF = Math.max(0, frame - delay);

  const sweep = spring({
    frame: f,
    fps,
    config: { damping: 15, mass: 0.5, stiffness: 150 },
  });

  const sweepWidth = sweep * 105;

  return (
    <div style={{ position: "relative", display: "inline-block", margin: "4px 8px" }}>
      {rawF > 0 && (
        <>
          {/* Text on top */}
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 900,
              fontStyle: "italic",
              fontSize,
              color: textColor,
              position: "relative",
              zIndex: 3,
              lineHeight: 1.25,
            }}
          >
            {text}
          </span>

          {/* Glowing Semi-Translucent Highlighter Stroke */}
          <div
            style={{
              position: "absolute",
              bottom: "6%",
              left: "-3%",
              height: "46%",
              width: `${sweepWidth}%`,
              backgroundColor: color,
              opacity: 0.75,
              mixBlendMode: "multiply",
              zIndex: 2,
              borderRadius: "3px 6px 4px 2px",
              transform: "rotate(-1.2deg)",
              boxShadow: `0 0 12px ${color}88`,
            }}
          />

          {/* Marker pen rough dry-streak texture */}
          {sweep > 0.4 && (
            <div
              style={{
                position: "absolute",
                bottom: "10%",
                left: "-2%",
                height: "36%",
                width: `${sweepWidth * 0.94}%`,
                background: `repeating-linear-gradient(90deg, transparent 0px, transparent 4px, ${color} 4px, ${color} 5px)`,
                opacity: 0.25,
                zIndex: 2,
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   4. TYPEWRITER ANNOTATION (Courier / Special Elite)
   ═══════════════════════════════════════════════ */
export const TypewriterText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  speed?: number;
}> = ({ text, delay = 0, fontSize = 32, color = "#161D27", speed = 2 }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const charsToShow = Math.min(Math.floor(f / speed), text.length);
  const visible = text.slice(0, charsToShow);
  const showCursor = f % 12 < 7;

  const totalTypingFrames = text.length * speed;
  const clickCadence = Math.max(6, speed * 3);
  const clickCount = Math.min(5, Math.floor(totalTypingFrames / clickCadence));
  const clickOffsets = Array.from({ length: clickCount }, (_, i) => delay + i * clickCadence);

  return (
    <>
      {/* Rhythmic typing SFX during typewriter b-roll */}
      {clickOffsets.map((offset, idx) => (
        <Sequence key={idx} from={offset}>
          <Audio src={staticFile("sfx/type_click.wav")} volume={0.14} />
        </Sequence>
      ))}
      {f > 0 && (
        <div
          style={{
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            fontWeight: 700,
            fontSize,
            color,
            lineHeight: 1.45,
            letterSpacing: "0.03em",
            whiteSpace: "pre-wrap",
            display: "inline-block",
          }}
        >
          {visible}
          <span style={{ opacity: showCursor && charsToShow < text.length ? 1 : 0, color: "#E63946" }}>█</span>
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════
   5. STAMP MARK (Crisp Rubber Ink Stamp)
   ═══════════════════════════════════════════════ */
export const StampMark: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  rotation?: number;
  subText?: string;
}> = ({
  text,
  delay = 0,
  size = 210,
  color = "#E63946",
  rotation = -14,
  subText = "RESMI // VERIFIED",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stepFrames = Math.max(1, Math.round(fps / 12));
  const steppedFrame = Math.floor(frame / stepFrames) * stepFrames;
  const f = Math.max(0, steppedFrame - delay);
  const rawF = Math.max(0, frame - delay);

  const slam = spring({
    frame: f,
    fps,
    config: { damping: 9, mass: 0.35, stiffness: 280 },
  });

  const scale = interpolate(slam, [0, 0.4, 1], [2.8, 1.15, 1]);

  return (
    <>
      {/* Clean, satisfying studio stamp */}
      <Sequence from={delay}>
        <Audio src={staticFile("sfx/stamp.wav")} volume={0.34} />
      </Sequence>

      {rawF > 0 && (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: `6px double ${color}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: `rotate(${rotation}deg) scale(${scale})`,
            opacity: 0.9,
            padding: 18,
            boxShadow: `inset 0 0 8px ${color}33`,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          <span
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: size * 0.08,
              color,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            ★ {subText} ★
          </span>
          <span
            style={{
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              fontWeight: 900,
              fontSize: size * 0.22,
              color,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              lineHeight: 1.1,
              margin: "6px 0",
            }}
          >
            {text}
          </span>
          <div style={{ width: "65%", height: 2, backgroundColor: color }} />
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════
   6. REDACTION MARK (Black Marker / Sensor Tape)
   ═══════════════════════════════════════════════ */
export const RedactionText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
}> = ({ text, delay = 0, fontSize = 48 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stepFrames = Math.max(1, Math.round(fps / 12));
  const steppedFrame = Math.floor(frame / stepFrames) * stepFrames;
  const f = Math.max(0, steppedFrame - delay);
  const rawF = Math.max(0, frame - delay);

  const strike = spring({
    frame: f,
    fps,
    config: { damping: 16, mass: 0.4, stiffness: 220 },
  });

  const widthPct = strike * 106;

  return (
    <div style={{ position: "relative", display: "inline-block", margin: "4px 6px" }}>
      <Sequence from={delay}>
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.16} />
      </Sequence>
      {rawF > 0 && (
        <>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize,
              color: "#777",
              opacity: 0.6,
            }}
          >
            {text}
          </span>
          <div
            style={{
              position: "absolute",
              top: "38%",
              left: "-3%",
              height: "28%",
              width: `${widthPct}%`,
              backgroundColor: "#161D27",
              transform: "rotate(-1.5deg)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              zIndex: 3,
            }}
          />
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   7. HAND-DRAWN ANNOTATION ARROW (Felt Pen)
   ═══════════════════════════════════════════════ */
export const AnnotationArrow: React.FC<{
  direction?: "down" | "right" | "left" | "curvedRight";
  delay?: number;
  color?: string;
  size?: number;
}> = ({ direction = "down", delay = 0, color = "#E63946", size = 90 }) => {
  const frame = useCurrentFrame();
  const rawF = Math.max(0, frame - delay);

  const rotMap = { down: 0, right: -90, left: 90, curvedRight: -45 };

  return (
    <>
      {rawF > 0 && (
        <div
          style={{
            transform: `rotate(${rotMap[direction]}deg)`,
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg viewBox="0 0 60 80" width={size * 0.65} height={size * 0.85}>
            <path
              d="M 30 5 Q 26 28 32 45 Q 34 54 30 60 L 16 46 M 30 60 L 44 46"
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </>
  );
};

/* ═══════════════════════════════════════════════
   8. HAND-DRAWN MARKER CIRCLE (Looping Ring)
   ═══════════════════════════════════════════════ */
export const MarkerCircle: React.FC<{
  children: React.ReactNode;
  delay?: number;
  color?: string;
}> = ({ children, delay = 0, color = "#E63946" }) => {
  const frame = useCurrentFrame();
  const rawF = Math.max(0, frame - delay);

  return (
    <div style={{ position: "relative", display: "inline-block", padding: "6px 12px" }}>
      {children}
      {rawF > 0 && (
        <svg
          style={{
            position: "absolute",
            inset: -8,
            width: "calc(100% + 16px)",
            height: "calc(100% + 16px)",
            pointerEvents: "none",
            zIndex: 4,
          }}
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
        >
          <path
            d="M 8 30 C 10 10, 85 8, 92 30 C 95 48, 12 55, 6 34 C 4 20, 40 12, 75 14"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
        </svg>
      )}
    </div>
  );
};
