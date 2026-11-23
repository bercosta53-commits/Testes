import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

// Progresso de entrada 0..1 (spring amortecido, ~10 frames)
export const useEnter = (delay = 0, duration = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: duration,
  });
};

// Sobe e aparece
export const Rise: React.FC<{
  delay?: number;
  dy?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, dy = 28, children, style }) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * dy}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Entrada com leve estouro (para o preço novo)
export const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 160, mass: 0.7 },
  });
  return (
    <div
      style={{
        opacity: interpolate(p, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        transform: `scale(${0.85 + 0.15 * p})`,
        transformOrigin: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const cardStyle: React.CSSProperties = {
  background: "rgba(252,247,239,0.92)",
  border: "3px solid rgba(255,255,255,0.9)",
  borderRadius: 44,
  boxShadow: "0 18px 50px rgba(8,40,66,0.22)",
  fontFamily: fonts.family,
};

export const Pill: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, bg = colors.cyan, color = colors.ink, size = 44, style }) => (
  <div
    style={{
      display: "inline-block",
      background: bg,
      color,
      fontFamily: fonts.family,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.15,
      padding: `${size * 0.28}px ${size * 0.7}px`,
      borderRadius: 999,
      ...style,
    }}
  >
    {children}
  </div>
);

// Ondas curvas do KV como detalhe sutil nos cantos
export const CornerWaves: React.FC<{ color?: string; opacity?: number }> = ({
  color = colors.cyan,
  opacity = 0.35,
}) => (
  <svg
    width={1080}
    height={1920}
    viewBox="0 0 1080 1920"
    style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
  >
    {[0, 1, 2].map((i) => (
      <path
        key={`a${i}`}
        d={`M ${-20} ${300 + i * 26} C 160 ${220 + i * 26}, 260 ${380 + i * 26}, 420 ${300 + i * 26}`}
        stroke={color}
        strokeWidth={3}
        fill="none"
        opacity={opacity - i * 0.08}
      />
    ))}
    {[0, 1, 2].map((i) => (
      <path
        key={`b${i}`}
        d={`M 1100 ${1180 - i * 26} C 940 ${1260 - i * 26}, 840 ${1100 - i * 26}, 680 ${1180 - i * 26}`}
        stroke={color}
        strokeWidth={3}
        fill="none"
        opacity={opacity - i * 0.08}
      />
    ))}
  </svg>
);
