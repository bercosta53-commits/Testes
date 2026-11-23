import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { DeviceArt } from "../components/DeviceArt";
import { FeatureCallout } from "../components/FeatureCallout";
import { Rise } from "../components/ui";
import { offer } from "../data/offer";
import { colors, fonts, safe } from "../theme";

// Arte do aparelho (foto real quando existir)
const ART = { left: 190, top: 730, width: 700 };

export const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const lift = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ledOn = frame >= 44;
  const zoom = interpolate(frame, [58, 82, 100, 122], [1, 1.25, 1.25, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <Backdrop image={null} duration={140} />
      <div
        style={{
          position: "absolute",
          left: safe.side,
          right: safe.side,
          top: 385,
          textAlign: "center",
          fontFamily: fonts.family,
        }}
      >
        <Rise delay={0}>
          <div style={{ fontWeight: 700, fontSize: 44, color: colors.terracotta, marginBottom: 6 }}>
            Aparelho {offer.modelo}
          </div>
        </Rise>
        <Rise delay={2}>
          <div style={{ fontWeight: 800, fontSize: 82, color: colors.petroleum, lineHeight: 1.05, whiteSpace: "nowrap" }}>
            Carregador incluso
          </div>
        </Rise>
        <Rise delay={14}>
          <div style={{ fontWeight: 600, fontSize: 50, color: colors.slate, marginTop: 12 }}>
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

      <FeatureCallout label="Receptor no canal" anchor={{ x: 636, y: 807 }} pill={{ x: 735, y: 690 }} delay={78} />
      <FeatureCallout label="Fio fino" anchor={{ x: 439, y: 808 }} pill={{ x: 330, y: 690 }} delay={102} />
      <FeatureCallout label="Recarregável" anchor={{ x: 540, y: 1098 }} pill={{ x: 540, y: 1290 }} delay={126} />
    </AbsoluteFill>
  );
};
