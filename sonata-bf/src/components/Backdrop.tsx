import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from "remotion";
import { colors } from "../theme";
import { CornerWaves } from "./ui";

// Fundo de cada trecho: a própria cena desfocada e clareada, com véu quente (KV suavizado).
// Sem imagem, vira um degradê creme com as ondas do KV.
export const Backdrop: React.FC<{
  image?: string | null;
  duration?: number;
  veil?: number;
}> = ({ image, duration = 150, veil = 0.7 }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, duration], [1.38, 1.46], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: colors.cream }}>
      {image ? (
        <Img
          src={image}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${drift})`,
            filter: "blur(36px) saturate(1.1)",
          }}
        />
      ) : (
        <AbsoluteFill
          style={{ background: `linear-gradient(180deg, ${colors.cream} 0%, #E6F3F0 100%)` }}
        />
      )}
      <AbsoluteFill style={{ background: `rgba(252,238,218,${veil})` }} />
      <CornerWaves color={colors.white} opacity={0.5} />
    </AbsoluteFill>
  );
};
