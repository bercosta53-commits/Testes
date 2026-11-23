import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, fonts } from "../theme";
import { useEnter } from "./ui";

// Etiqueta com linha até um ponto do produto. Coordenadas absolutas (1080x1920).
export const FeatureCallout: React.FC<{
  label: string;
  anchor: { x: number; y: number }; // ponto no produto
  pill: { x: number; y: number }; // centro da etiqueta
  delay?: number;
  size?: number;
}> = ({ label, anchor, pill, delay = 0, size = 44 }) => {
  const frame = useCurrentFrame();
  const p = useEnter(delay);
  const draw = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x2 = anchor.x + (pill.x - anchor.x) * draw;
  const y2 = anchor.y + (pill.y - anchor.y) * draw;
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <line
          x1={anchor.x}
          y1={anchor.y}
          x2={x2}
          y2={y2}
          stroke={colors.terracotta}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <circle cx={anchor.x} cy={anchor.y} r={11 * p} fill={colors.terracotta} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: pill.x,
          top: pill.y,
          transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * p})`,
          opacity: p,
          background: colors.cream,
          color: colors.ink,
          fontFamily: fonts.family,
          fontWeight: 700,
          fontSize: size,
          padding: `${size * 0.26}px ${size * 0.7}px`,
          borderRadius: 999,
          border: `3px solid ${colors.white}`,
          boxShadow: "0 10px 28px rgba(8,40,66,0.2)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </>
  );
};
