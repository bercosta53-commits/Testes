import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { MediaFill } from "../components/MediaFill";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { LegalFooter } from "../components/LegalFooter";
import { Rise, cardStyle } from "../components/ui";
import { assets, placeholderNames } from "../data/assets";
import { offer, rodapeLegal } from "../data/offer";
import { colors, fonts, safe } from "../theme";

const Logo: React.FC = () =>
  assets.logo ? (
    <Img src={assets.logo} style={{ height: 120, objectFit: "contain" }} />
  ) : (
    <div style={{ textAlign: "center", fontFamily: fonts.family, color: colors.petroleum }}>
      <div style={{ fontWeight: 800, fontSize: 72, letterSpacing: 6 }}>SONATA</div>
      <div style={{ fontWeight: 500, fontSize: 36, color: colors.slate }}>aparelhos auditivos</div>
    </div>
  );

// End card: loja desfocada, logo, botão pulsando, estoque e endereço
export const S7: React.FC = () => (
  <AbsoluteFill>
    <MediaFill
      video={assets.s7.video}
      image={assets.s7.img}
      label={placeholderNames.s7}
      hint="Foto real da loja e da equipe"
      durationInFrames={150}
      blur={assets.s7.img || assets.s7.video ? 18 : 0}
      zoomTo={1.04}
    />
    <AbsoluteFill style={{ background: "rgba(252,247,239,0.5)" }} />
    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: 300,
        height: 920,
        ...cardStyle,
        padding: "34px 30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Rise delay={0}>
        <Logo />
      </Rise>
      <Rise delay={10}>
        <div
          style={{
            fontFamily: fonts.family,
            fontWeight: 800,
            fontSize: 92,
            lineHeight: 1.05,
            color: colors.petroleum,
            textAlign: "center",
          }}
        >
          Fale com nossa equipe
        </div>
      </Rise>
      <WhatsAppButton delay={34} label="Clique no link" pulse size={60} />
      <Rise delay={52}>
        <div
          style={{
            fontFamily: fonts.family,
            fontWeight: 600,
            fontSize: 36,
            color: colors.ink,
            textAlign: "center",
          }}
        >
          {offer.estoque}
        </div>
      </Rise>
      <Rise delay={64}>
        <LegalFooter
          lines={[`Endereço: ${offer.endereco}`, rodapeLegal]}
          size={28}
        />
      </Rise>
    </div>
  </AbsoluteFill>
);
