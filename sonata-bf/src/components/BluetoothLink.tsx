import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

// Celular liga ao aparelho com ondas que se expandem
export const BluetoothLink: React.FC<{ connectAt: number; width?: number }> = ({
  connectAt,
  width = 820,
}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [4, connectAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const on = frame >= connectAt;
  const pulse = (frame % 20) / 20;
  const phoneX = 120;
  const earX = width - 120;
  const cy = 150;
  return (
    <svg width={width} height={300} viewBox={`0 0 ${width} 300`}>
      {/* celular */}
      <rect x={phoneX - 52} y={cy - 92} width={104} height={184} rx={20} fill={colors.ink} />
      <rect x={phoneX - 42} y={cy - 78} width={84} height={150} rx={10} fill={colors.cream} />
      <circle cx={phoneX} cy={cy + 82} r={5} fill={colors.cream} />
      {/* aparelho */}
      <path
        d={`M ${earX - 40} ${cy + 50} C ${earX - 60} ${cy - 40}, ${earX + 10} ${cy - 90}, ${earX + 36} ${cy - 20} C ${earX + 40} ${cy + 20}, ${earX + 10} ${cy + 30}, ${earX} ${cy + 60} Z`}
        fill={colors.champagne}
        stroke={colors.terracotta}
        strokeWidth={4}
      />
      {/* linha de conexão */}
      <line
        x1={phoneX + 70}
        y1={cy}
        x2={phoneX + 70 + (earX - 80 - phoneX - 70) * draw}
        y2={cy}
        stroke={colors.cyan}
        strokeWidth={8}
        strokeDasharray="4 20"
        strokeLinecap="round"
      />
      {/* ondas ao conectar */}
      {on
        ? [0, 1, 2].map((i) => {
            const t = (pulse + i / 3) % 1;
            return (
              <circle
                key={i}
                cx={earX - 6}
                cy={cy}
                r={40 + t * 80}
                fill="none"
                stroke={colors.cyan}
                strokeWidth={6}
                opacity={1 - t}
              />
            );
          })
        : null}
      {on ? (
        <circle cx={phoneX} cy={cy - 8} r={18} fill={colors.led} />
      ) : null}
    </svg>
  );
};
