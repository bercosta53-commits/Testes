import React from "react";
import { Img, useCurrentFrame } from "remotion";
import { colors } from "../theme";
import { assets } from "../data/assets";

// Arte do par + estojo. Se a foto real existir, usa a foto. Senão desenha um placeholder.
// lift: 0 = par dentro do estojo, 1 = par acima. ledOn acende o LED verde.
export const DeviceArt: React.FC<{
  lift?: number;
  ledOn?: boolean;
  width?: number;
}> = ({ lift = 0, ledOn = false, width = 760 }) => {
  const frame = useCurrentFrame();
  const glow = ledOn ? 0.55 + 0.45 * Math.sin(frame / 4) ** 2 : 0;
  const rise = lift * 120;

  if (assets.device) {
    return (
      <div style={{ position: "relative", width, height: width * 0.8 }}>
        {ledOn ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: 0,
              width: width * 0.8,
              height: 70,
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background: `radial-gradient(closest-side, rgba(61,220,132,${0.6 * glow}), rgba(61,220,132,0))`,
            }}
          />
        ) : null}
        <Img
          src={assets.device}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: `translateY(${-rise * 0.4}px)`,
          }}
        />
      </div>
    );
  }

  return (
    <svg width={width} height={width * 0.8} viewBox="0 0 760 608">
      {/* PLACEHOLDER do estojo e do par */}
      <ellipse cx={380} cy={560} rx={300} ry={26} fill="rgba(8,40,66,0.14)" />
      <rect x={110} y={340} width={540} height={210} rx={70} fill="#F1E6D6" stroke={colors.champagne} strokeWidth={6} />
      <rect x={110} y={340} width={540} height={90} rx={70} fill="#E9D9C2" stroke={colors.champagne} strokeWidth={6} />
      {/* LED */}
      <circle cx={380} cy={482} r={16} fill={ledOn ? colors.led : "#B8B2A6"} />
      {ledOn ? <circle cx={380} cy={482} r={34 * glow + 8} fill="rgba(61,220,132,0.25)" /> : null}
      {/* par de aparelhos */}
      {[0, 1].map((i) => {
        const dx = i === 0 ? -86 : 86;
        const flip = i === 0 ? 1 : -1;
        return (
          <g
            key={i}
            transform={`translate(${380 + dx} ${300 - rise}) scale(${flip} 1)`}
          >
            <path
              d="M -34 80 C -60 -30, 36 -90, 62 0 C 70 40, 36 56, 22 86 Z"
              fill={colors.champagne}
              stroke={colors.terracotta}
              strokeWidth={5}
            />
            {/* fio fino até o receptor */}
            <path
              d="M 62 0 C 110 -20, 126 30, 100 70"
              stroke={colors.terracotta}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx={100} cy={78} rx={16} ry={11} fill={colors.champagne} stroke={colors.terracotta} strokeWidth={4} />
          </g>
        );
      })}
    </svg>
  );
};
