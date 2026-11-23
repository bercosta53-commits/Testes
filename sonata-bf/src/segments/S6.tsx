import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { MediaWindow } from "../components/MediaWindow";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { Pill, Pop, Rise } from "../components/ui";
import { assets, placeholderNames } from "../data/assets";
import { colors, fonts, safe } from "../theme";

export const S6: React.FC = () => (
  <AbsoluteFill>
    <Backdrop image={assets.s6.img} duration={90} />
    <MediaWindow
      video={assets.s6.video}
      image={assets.s6.img}
      label={placeholderNames.s6}
      hint="Apresentadora estende o celular, 3 s"
      height={760}
      focalY={18}
      durationInFrames={90}
      zoomTo={1.05}
    />
    {/* Selo no canto da janela, sobre a parede */}
    <div style={{ position: "absolute", left: 92, top: 388, transform: "rotate(-4deg)" }}>
      <Pop delay={24}>
        <Pill size={36} bg={colors.cyan}>
          Teste gratuito
        </Pill>
      </Pop>
    </div>
    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: 1138,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
      }}
    >
      <Rise delay={2}>
        <div
          style={{
            fontFamily: fonts.family,
            fontWeight: 800,
            fontSize: 62,
            color: colors.petroleum,
            whiteSpace: "nowrap",
            lineHeight: 1.1,
          }}
        >
          Agende seu teste gratuito
        </div>
      </Rise>
      <WhatsAppButton delay={30} label="Chamar no WhatsApp" size={48} />
    </div>
  </AbsoluteFill>
);
