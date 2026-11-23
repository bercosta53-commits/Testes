import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors, fonts, grid, safe } from "../theme";
import { captions } from "../data/timeline";

// Quebra o texto destacando as palavras-chave
const Highlighted: React.FC<{ text: string; hl: string[] }> = ({ text, hl }) => {
  if (!hl.length) return <>{text}</>;
  const escaped = hl.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "g"));
  return (
    <>
      {parts.map((p, i) =>
        hl.includes(p) ? (
          <span key={i} style={{ color: colors.cyan, fontWeight: 800 }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const c = captions.find((x) => frame >= x.from && frame < x.to);
  if (!c) return null;
  const a = interpolate(frame, [c.from, c.from + 4, c.to - 4, c.to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: safe.side,
          right: safe.side,
          bottom: 1920 - grid.captionBottom,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          opacity: a,
          transform: `translateY(${(1 - a) * 12}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(8,40,66,0.9)",
            color: colors.white,
            fontFamily: fonts.family,
            fontWeight: 600,
            fontSize: 48,
            lineHeight: 1.18,
            textAlign: "center",
            padding: "14px 32px",
            borderRadius: 28,
          }}
        >
          <Highlighted text={c.text} hl={c.hl} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
