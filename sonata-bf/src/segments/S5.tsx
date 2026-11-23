import React from "react";
import { AbsoluteFill } from "remotion";
import { MediaFill } from "../components/MediaFill";
import {
  DiscountBadge,
  InstallmentHero,
  PriceBadge,
  StrikePrice,
} from "../components/PriceBadge";
import { LegalFooter } from "../components/LegalFooter";
import { CornerWaves, Pill, Rise, cardStyle } from "../components/ui";
import { assets } from "../data/assets";
import { offer, rodapeLegal } from "../data/offer";
import { colors, fonts, safe } from "../theme";

export const S5: React.FC = () => (
  <AbsoluteFill>
    {/* cartão de oferta sobre a família desfocada e clareada, com véu quente */}
    <MediaFill
      image={assets.s3b.img}
      video={null}
      label="s3b-sala-sofa (fundo desfocado)"
      durationInFrames={180}
      blur={26}
      tone="warm"
    />
    <AbsoluteFill style={{ background: "rgba(252,236,214,0.55)" }} />
    <CornerWaves color={colors.white} opacity={0.5} />
    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: 280,
        height: 968,
        ...cardStyle,
        padding: "20px 30px 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Rise delay={0}>
        <div
          style={{
            fontFamily: fonts.family,
            fontWeight: 700,
            fontSize: 44,
            color: colors.terracotta,
          }}
        >
          O par + carregador
        </div>
      </Rise>
      <StrikePrice delay={4} strikeAt={12} size={64} />
      <PriceBadge delay={30} />
      <DiscountBadge delay={56} size={46} />
      <InstallmentHero delay={86} />
      <Rise delay={110}>
        <Pill size={46}>Teste auditivo gratuito</Pill>
      </Rise>
      <Rise delay={122}>
        <LegalFooter
          lines={[rodapeLegal, `${offer.estoque}.`]}
          size={28}
        />
      </Rise>
    </div>
  </AbsoluteFill>
);
