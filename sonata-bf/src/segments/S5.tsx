import React from "react";
import { Selo } from "../components/Selo";
import { AbsoluteFill, Img } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { DiscountBadge, InstallmentHero, PriceBadge, StrikePrice } from "../components/PriceBadge";
import { LegalFooter } from "../components/LegalFooter";
import { Pop, Rise, cardStyle } from "../components/ui";
import { assets } from "../data/assets";
import { offer, rodapeLegal } from "../data/offer";
import { colors, fonts, safe } from "../theme";

// Oferta, no desenho aprovado (sonata-oferta-suave-mockup): marca no topo, cartão creme,
// botão ciano embaixo, tudo sobre a família desfocada.
export const S5: React.FC = () => (
  <AbsoluteFill>
    <Backdrop image={assets.s3b.img} duration={172} veil={0.5} />

    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: 366,
        textAlign: "center",
        fontFamily: fonts.family,
      }}
    >
      <Rise delay={0}>
        {assets.logo ? (
          <Img src={assets.logo} style={{ height: 62, objectFit: "contain" }} />
        ) : (
          <div style={{ fontWeight: 800, fontSize: 64, color: colors.petroleum, letterSpacing: 6 }}>SONATA</div>
        )}
      </Rise>
      <Rise delay={4}>
        <div style={{ fontWeight: 800, fontSize: 46, color: colors.terracotta, marginTop: 2 }}>Black Friday</div>
      </Rise>
    </div>

    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: 536,
        height: 660,
        ...cardStyle,
        padding: "18px 30px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Rise delay={6}>
        <div style={{ fontFamily: fonts.family, fontWeight: 600, fontSize: 44, color: colors.slate }}>
          O par + carregador
        </div>
      </Rise>
      <StrikePrice delay={8} strikeAt={14} size={60} />
      <PriceBadge delay={32} />
      <DiscountBadge delay={58} size={42} />
      <InstallmentHero delay={90} size={124} />
      <Rise delay={112}>
        <div style={{ fontFamily: fonts.family, fontWeight: 500, fontSize: 42, color: colors.slate }}>
          Teste auditivo gratuito
        </div>
      </Rise>
    </div>

    <div style={{ position: "absolute", left: 0, right: 0, top: 1214, display: "flex", justifyContent: "center" }}>
      <Pop delay={118}>
        <div
          style={{
            background: colors.cyan,
            color: colors.ink,
            fontFamily: fonts.family,
            fontWeight: 700,
            fontSize: 54,
            padding: "18px 60px",
            borderRadius: 999,
            boxShadow: "0 14px 34px rgba(11,58,91,0.25)",
          }}
        >
          Agende seu teste gratuito ›
        </div>
      </Pop>
    </div>

    <div style={{ position: "absolute", left: safe.side, right: safe.side, top: 1328 }}>
      <Rise delay={126}>
        <LegalFooter lines={[rodapeLegal, `${offer.estoque}.`]} size={28} color={colors.ink} />
      </Rise>
    </div>
    <Selo />
  </AbsoluteFill>
);
