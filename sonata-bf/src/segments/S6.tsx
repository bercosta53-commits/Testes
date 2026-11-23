import React from "react";
import { AbsoluteFill } from "remotion";
import { MediaFill } from "../components/MediaFill";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { Pill, Pop, Rise, cardStyle } from "../components/ui";
import { assets, placeholderNames } from "../data/assets";
import { colors, safe } from "../theme";

export const S6: React.FC = () => (
  <AbsoluteFill>
    <MediaFill
      video={assets.s6.video}
      image={assets.s6.img}
      label={placeholderNames.s6}
      hint="Apresentadora estende o celular, 3 s"
      durationInFrames={90}
      zoomTo={1.05}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(8,40,66,0) 40%, rgba(8,40,66,0.3) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: 800,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 34,
      }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        <Rise delay={2}>
          <div
            style={{
              ...cardStyle,
              padding: "26px 30px",
              textAlign: "center",
              fontWeight: 800,
              fontSize: 68,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              color: colors.petroleum,
            }}
          >
            Agende gratuitamente<br />seu teste
          </div>
        </Rise>
        <div
          style={{
            position: "absolute",
            right: -6,
            top: -34,
            transform: "rotate(4deg)",
          }}
        >
          <Pop delay={24}>
            <Pill size={42} bg={colors.cyan}>
              Teste gratuito
            </Pill>
          </Pop>
        </div>
      </div>
      <WhatsAppButton delay={32} label="Chamar no WhatsApp" size={54} />
    </div>
  </AbsoluteFill>
);
