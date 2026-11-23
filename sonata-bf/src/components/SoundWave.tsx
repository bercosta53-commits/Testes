import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

// Onda cheia de ruído que vira uma linha limpa
export const SoundWave: React.FC<{
  start: number; // frame local em que começa a limpar
  end: number; // frame local em que fica limpa
  width?: number;
  height?: number;
}> = ({ start, end, width = 820, height = 260 }) => {
  const frame = useCurrentFrame();
  const clean = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const seed = Math.floor(frame / 2);
  const N = 120;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * width;
    const base = Math.sin((i / N) * Math.PI * 4) * height * 0.28;
    const noise = rand(i * 7.3 + seed * 3.1) * height * 0.95 * (1 - clean);
    const y = height / 2 + base + noise;
    pts.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const color = clean < 0.5 ? colors.terracotta : colors.petroleum;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={pts.join(" ")}
        stroke={color}
        strokeWidth={clean > 0.9 ? 12 : 7}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
