import React from "react";
import { AbsoluteFill } from "remotion";
import { MediaFill } from "../components/MediaFill";
import { assets, placeholderNames } from "../data/assets";
import { colors, fonts, safe } from "../theme";
import { DiscountBadge, PriceBadge, StrikePrice } from "../components/PriceBadge";
import { Rise, cardStyle } from "../components/ui";

// Faixa do peito. Ajustar CHEST_TOP quando o vídeo real chegar (topo da cabeça fica perto da zona segura).
const CHEST_TOP = 650;

export const S1: React.FC = () => (
  <AbsoluteFill>
    <MediaFill
      video={assets.s1.video}
      image={assets.s1.img}
      label={placeholderNames.s1}
      hint="Apresentadora, 5 s, lip sync"
      durationInFrames={150}
      zoomTo={1.05}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(8,40,66,0) 35%, rgba(8,40,66,0.28) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: CHEST_TOP,
        ...cardStyle,
        padding: "22px 28px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Rise delay={0}>
        <div
          style={{
            fontFamily: fonts.family,
            fontWeight: 800,
            fontSize: 96,
            letterSpacing: 1,
            color: colors.petroleum,
            lineHeight: 1.05,
          }}
        >
          RECARREGÁVEL
        </div>
      </Rise>
      <StrikePrice delay={36} strikeAt={50} size={60} />
      <PriceBadge delay={64} />
      <DiscountBadge delay={94} size={42} />
      <Rise delay={110}>
        <div
          style={{
            fontFamily: fonts.family,
            fontWeight: 600,
            fontSize: 44,
            color: colors.slate,
            marginTop: 4,
          }}
        >
          O par + carregador
        </div>
      </Rise>
    </div>
  </AbsoluteFill>
);
