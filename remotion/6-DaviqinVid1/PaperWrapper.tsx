import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export type ThemeType = "A_Cream" | "B_DeepInk";

export interface PaperWrapperProps {
  children: React.ReactNode;
  theme?: ThemeType;
  /** Optional scene category/header tag shown in vintage archive style */
  archiveTag?: string;
  /** Optional exhibit number, e.g. "EXHIBIT #01" */
  exhibitNumber?: string;
}

/**
 * PaperWrapper — Master Editorial Paper-Collage Backdrop (Vox Style)
 * 
 * Features:
 * - Handcrafted kraft paper / deep newsprint textured desk canvas
 * - Precision drafting / cutting mat grid with subtle crosshair marks
 * - Faded archival newsprint clippings & vintage typography watermarks
 * - Realistic unfolded paper crease lines with highlights & shadow relief
 * - Authentic circular rubber stamps ("RECORD VERIFIED", "ARCHIVE REF")
 * - Top & bottom jagged torn-paper framing deckles with exposed white paper fibers
 * - Realistic scotch/masking tape reinforcement strips on canvas edges
 * - True 12 fps stop-motion camera drift & organic rostrum table wiggle
 */
export const PaperWrapper: React.FC<PaperWrapperProps> = ({
  children,
  theme = "A_Cream",
  archiveTag = "INVESTIGATIVE ARCHIVE // SPECIAL DOSSIER",
  exhibitNumber,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── True Stop-Motion Cadence (12 fps hold) ──
  const stepFrames = Math.max(1, Math.round(fps / 12)); // ~5 frames per hold
  const steppedFrame = Math.floor(frame / stepFrames) * stepFrames;

  // Handheld rostrum camera wiggle (subtle, organic physical camera)
  const wigX = Math.sin(steppedFrame * 0.17) * 4 + Math.cos(steppedFrame * 0.08) * 2;
  const wigY = Math.cos(steppedFrame * 0.13) * 3.5 + Math.sin(steppedFrame * 0.05) * 2;
  const wigR = Math.sin(steppedFrame * 0.09) * 0.45;

  const isCream = theme === "A_Cream";

  // Palette
  const bgBase = isCream ? "#F4EBD9" : "#101622";
  const gridColor = isCream ? "rgba(130, 110, 85, 0.09)" : "rgba(180, 200, 230, 0.05)";
  const textColor = isCream ? "rgba(60, 50, 40, 0.22)" : "rgba(220, 230, 245, 0.18)";
  const stampColor = isCream ? "rgba(180, 40, 40, 0.25)" : "rgba(230, 80, 80, 0.22)";
  const blueStamp = isCream ? "rgba(29, 53, 87, 0.2)" : "rgba(70, 140, 220, 0.2)";

  // Creases
  const crease1 = 32;
  const crease2 = 68;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgBase,
        overflow: "hidden",
      }}
    >
      {/* ── GLOBAL SVG TEXTURE & TORN EDGE FILTERS ── */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          {/* Heavy Paper Grain */}
          <filter id="heavy-paper-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode={isCream ? "multiply" : "overlay"} />
          </filter>

          {/* Torn Paper Rough Edge Displacement */}
          <filter id="torn-deckle" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="turbulence" baseFrequency="0.045" numOctaves="5" seed="14" result="tornNoise" />
            <feDisplacementMap in="SourceGraphic" in2="tornNoise" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Rough Paper Edge for smaller notes */}
          <filter id="torn-edge-small" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence type="turbulence" baseFrequency="0.07" numOctaves="4" seed="33" result="roughNoise" />
            <feDisplacementMap in="SourceGraphic" in2="roughNoise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* ── CAMERA WIGGLE CONTAINER ── */}
      <AbsoluteFill
        style={{
          transform: `translate(${wigX}px, ${wigY}px) rotate(${wigR}deg)`,
          transformOrigin: "center center",
        }}
      >
        {/* ── LAYER 1: BASE TEXTURED PAPER FIBER ── */}
        <AbsoluteFill
          style={{
            backgroundImage: isCream
              ? "radial-gradient(ellipse at 50% 30%, #FDF9EE 0%, #F2E8D4 60%, #E7DBC4 100%)"
              : "radial-gradient(ellipse at 50% 40%, #151D2A 0%, #0F1622 65%, #0A0E17 100%)",
          }}
        />

        {/* ── LAYER 2: SVG GRAIN TEXTURE ── */}
        <AbsoluteFill
          style={{
            filter: "url(#heavy-paper-grain)",
            opacity: isCream ? 0.22 : 0.16,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* ── LAYER 3: DRAFTING / CUTTING MAT GRID ── */}
        <AbsoluteFill
          style={{
            backgroundImage: `
              linear-gradient(${gridColor} 1.5px, transparent 1.5px),
              linear-gradient(90deg, ${gridColor} 1.5px, transparent 1.5px),
              radial-gradient(${gridColor} 2px, transparent 2px)
            `,
            backgroundSize: "60px 60px, 60px 60px, 120px 120px",
            backgroundPosition: "0 0, 0 0, 30px 30px",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* ── LAYER 4: ARCHIVAL NEWSPRINT & EDITORIAL WATERMARKS ── */}
        <div
          style={{
            position: "absolute",
            top: 55,
            left: 50,
            right: 50,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "none",
            zIndex: 3,
            borderBottom: `1.5px dashed ${textColor}`,
            paddingBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'Courier Prime', 'Courier New', monospace",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.22em",
              color: textColor,
              textTransform: "uppercase",
            }}
          >
            {archiveTag}
          </span>
          <span
            style={{
              fontFamily: "'Courier Prime', 'Courier New', monospace",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: textColor,
            }}
          >
            {exhibitNumber || `SEC // ${String((Math.floor(frame / 60) % 99) + 1).padStart(2, "0")}`}
          </span>
        </div>

        {/* Vintage newspaper background snippet left watermark */}
        <div
          style={{
            position: "absolute",
            top: 130,
            left: 45,
            width: 280,
            opacity: isCream ? 0.12 : 0.08,
            fontFamily: "'Playfair Display', Georgia, serif",
            pointerEvents: "none",
            zIndex: 3,
            lineHeight: 1.25,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", marginBottom: 6 }}>
            The Investigative Record
          </div>
          <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 11, lineHeight: 1.35, textAlign: "justify" }}>
            SPECIAL REPORT: Documenting theological clarity, purifying principles, rectifying misconceptions. Verified archival transcript series.
          </div>
        </div>

        {/* Vintage stamp watermark bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 120,
            right: 50,
            width: 140,
            height: 140,
            borderRadius: "50%",
            border: `3px dashed ${stampColor}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-14deg)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          <span style={{ fontFamily: "'Impact', sans-serif", fontSize: 13, color: stampColor, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            OFFICIAL
          </span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: stampColor }}>
            VERIFIED
          </span>
          <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 10, color: stampColor, letterSpacing: "0.1em" }}>
            DOSSIER #2026
          </span>
        </div>

        {/* Vintage postal stamp top-right */}
        <div
          style={{
            position: "absolute",
            top: 120,
            right: 60,
            width: 110,
            height: 55,
            border: `2px solid ${blueStamp}`,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(6deg)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          <span
            style={{
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12,
              fontWeight: 700,
              color: blueStamp,
              letterSpacing: "0.15em",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            EDITORIAL<br />EXPLAINER
          </span>
        </div>

        {/* ── LAYER 5: COFFEE RING STAIN (Cream theme) ── */}
        {isCream && (
          <div
            style={{
              position: "absolute",
              top: "22%",
              right: "4%",
              width: 170,
              height: 170,
              borderRadius: "50%",
              background: "radial-gradient(circle, transparent 58%, rgba(140, 100, 50, 0.08) 64%, rgba(110, 80, 40, 0.14) 71%, transparent 75%)",
              filter: "blur(0.5px)",
              pointerEvents: "none",
              zIndex: 3,
              transform: "rotate(25deg)",
            }}
          />
        )}

        {/* ── LAYER 6: REALISTIC UNFOLDED PAPER CREASES ── */}
        <div
          style={{
            position: "absolute",
            top: `${crease1}%`,
            left: 0,
            right: 0,
            height: 3,
            background: isCream
              ? "linear-gradient(90deg, transparent 2%, rgba(150,130,100,0.35) 15%, rgba(140,120,90,0.5) 50%, rgba(150,130,100,0.35) 85%, transparent 98%)"
              : "linear-gradient(90deg, transparent 2%, rgba(40,55,75,0.4) 15%, rgba(40,55,75,0.6) 50%, rgba(40,55,75,0.4) 85%, transparent 98%)",
            boxShadow: isCream
              ? "0 2px 2px rgba(255,255,255,0.65), 0 -1px 2px rgba(90,70,50,0.18)"
              : "0 2px 2px rgba(255,255,255,0.06), 0 -1px 2px rgba(0,0,0,0.5)",
            pointerEvents: "none",
            zIndex: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: `${crease2}%`,
            left: 0,
            right: 0,
            height: 3,
            background: isCream
              ? "linear-gradient(90deg, transparent 2%, rgba(150,130,100,0.3) 15%, rgba(140,120,90,0.45) 50%, rgba(150,130,100,0.3) 85%, transparent 98%)"
              : "linear-gradient(90deg, transparent 2%, rgba(40,55,75,0.35) 15%, rgba(40,55,75,0.5) 50%, rgba(40,55,75,0.35) 85%, transparent 98%)",
            boxShadow: isCream
              ? "0 2px 2px rgba(255,255,255,0.55), 0 -1px 2px rgba(90,70,50,0.14)"
              : "0 2px 2px rgba(255,255,255,0.05), 0 -1px 2px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        {/* ── LAYER 7: VIGNETTE PERIMETER SHADOW ── */}
        <AbsoluteFill
          style={{
            background: isCream
              ? "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(100, 80, 50, 0.22) 100%)"
              : "radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0, 0, 0, 0.65) 100%)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

        {/* ── LAYER 8: TOP & BOTTOM TORN-PAPER FRAMING BORDERS (DECKLED EDGES) ── */}
        {/* Top torn strip */}
        <div
          style={{
            position: "absolute",
            top: -15,
            left: -20,
            right: -20,
            height: 48,
            backgroundColor: isCream ? "#EDE3CF" : "#1B2332",
            borderBottom: isCream ? "4px solid #FAF6EB" : "4px solid #2B3547",
            boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
            filter: "url(#torn-deckle)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
        {/* Bottom torn strip */}
        <div
          style={{
            position: "absolute",
            bottom: -15,
            left: -20,
            right: -20,
            height: 48,
            backgroundColor: isCream ? "#EDE3CF" : "#1B2332",
            borderTop: isCream ? "4px solid #FAF6EB" : "4px solid #2B3547",
            boxShadow: "0 -6px 16px rgba(0,0,0,0.18)",
            filter: "url(#torn-deckle)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />

        {/* ── CORNER MASKING TAPE ACCENTS (Holding the mat down) ── */}
        <div
          style={{
            position: "absolute",
            top: 15,
            left: 20,
            width: 100,
            height: 32,
            background: "linear-gradient(135deg, rgba(245,235,210,0.7) 0%, rgba(230,215,185,0.6) 100%)",
            transform: "rotate(-38deg)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            border: "1px dashed rgba(180,160,130,0.3)",
            pointerEvents: "none",
            zIndex: 21,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 15,
            right: 20,
            width: 100,
            height: 32,
            background: "linear-gradient(135deg, rgba(245,235,210,0.7) 0%, rgba(230,215,185,0.6) 100%)",
            transform: "rotate(38deg)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            border: "1px dashed rgba(180,160,130,0.3)",
            pointerEvents: "none",
            zIndex: 21,
          }}
        />

        {/* ── MAIN SCENE CONTENT SLOT ── */}
        <AbsoluteFill
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
