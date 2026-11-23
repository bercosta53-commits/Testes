import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DeviceArt } from "../components/DeviceArt";
import { FeatureCallout } from "../components/FeatureCallout";
import { CornerWaves, Rise } from "../components/ui";
import { colors, fonts, safe } from "../theme";
import { offer } from "../data/offer";

// Posição da arte do aparelho (placeholder ou foto real)
const ART = { left: 160, top: 700, width: 760 };

export const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const lift = interpolate(frame, [8, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ledOn = frame >= 44;
  // zoom no receptor e no fio, depois volta
  const zoom = interpolate(frame, [58, 82, 100, 122], [1, 1.25, 1.25, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.cream} 0%, #F1E2CF 100%)`,
      }}
    >
      <CornerWaves />
      <div
        style={{
          position: "absolute",
          left: safe.side,
          right: safe.side,
          top: 300,
          textAlign: "center",
          fontFamily: fonts.family,
        }}
      >
        <Rise delay={0}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 44,
              color: colors.terracotta,
              marginBottom: 6,
            }}
          >
            Aparelho {offer.modelo}
          </div>
        </Rise>
        <Rise delay={2}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 80,
              whiteSpace: "nowrap",
              color: colors.petroleum,
              lineHeight: 1.05,
            }}
          >
            Carregador incluso
          </div>
        </Rise>
        <Rise delay={14}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 52,
              color: colors.slate,
              marginTop: 14,
            }}
          >
            É só encaixar e recarregar
          </div>
        </Rise>
      </div>

      <div
        style={{
          position: "absolute",
          left: ART.left,
          top: ART.top,
          transform: `scale(${zoom})`,
          transformOrigin: "50% 0%",
        }}
      >
        <DeviceArt lift={lift} ledOn={ledOn} width={ART.width} />
      </div>

      <FeatureCallout label="Receptor no canal" anchor={{ x: 644, y: 784 }} pill={{ x: 720, y: 640 }} delay={78} />
      <FeatureCallout label="Fio fino" anchor={{ x: 436, y: 788 }} pill={{ x: 340, y: 640 }} delay={102} />
      <FeatureCallout label="Recarregável" anchor={{ x: 540, y: 1100 }} pill={{ x: 540, y: 1185 }} delay={126} />
    </AbsoluteFill>
  );
};
