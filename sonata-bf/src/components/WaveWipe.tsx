import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Onda do KV que varre a tela da direita para a esquerda. O corte acontece no centro (frame `at`).
export const WaveWipe: React.FC<{ at: number; dur?: number }> = ({ at, dur = 20 }) => {
  const frame = useCurrentFrame();
  const t = (frame - (at - dur / 2)) / dur;
  if (t <= 0 || t >= 1) return null;
  const tx = interpolate(ease(t), [0, 1], [860, -1400]);
  const edge = (x: number) =>
    `M ${x} 0 C ${x - 100} 240, ${x + 100} 480, ${x} 720 S ${x - 100} 1200, ${x} 1440 S ${x + 100} 1800, ${x} 1920 L 1400 1920 L 1400 0 Z`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <svg
        width={1400}
        height={1920}
        viewBox="0 0 1400 1920"
        style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${tx}px)` }}
      >
        <path d={edge(220)} fill={colors.cyan} />
        <path d={edge(262)} fill={colors.white} />
        <path d={edge(304)} fill={colors.cream} />
      </svg>
    </AbsoluteFill>
  );
};
