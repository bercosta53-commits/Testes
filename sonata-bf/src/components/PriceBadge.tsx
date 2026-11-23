import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, fonts, sizes } from "../theme";
import { offer } from "../data/offer";
import { Pop, Rise, useEnter } from "./ui";

// "De R$ 9.600" com o risco desenhado da esquerda para a direita, e "por" ao lado
export const StrikePrice: React.FC<{
  delay?: number; // entrada do texto
  strikeAt?: number; // frame em que o risco começa
  size?: number;
  color?: string;
}> = ({ delay = 0, strikeAt = 18, size = 64, color = colors.slate }) => {
  const frame = useCurrentFrame();
  const enter = useEnter(delay);
  const porIn = useEnter(strikeAt + 8);
  const strike = interpolate(frame, [strikeAt, strikeAt + 8], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 22,
        fontFamily: fonts.family,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
          fontWeight: 600,
          fontSize: size,
          color,
          opacity: enter,
        }}
      >
        De {offer.precoDeTxt}
        <div
          style={{
            position: "absolute",
            left: -6,
            top: "54%",
            height: Math.max(6, size * 0.1),
            width: `calc(${strike}% + 12px)`,
            background: colors.terracotta,
            borderRadius: 6,
            transform: "rotate(-3deg)",
          }}
        />
      </div>
      <span
        style={{
          fontWeight: 700,
          fontSize: size * 0.8,
          color: colors.ink,
          opacity: porIn,
        }}
      >
        por
      </span>
    </div>
  );
};

// "R$ 6.490" gigante (mínimo 200 px no valor). O "por" vem ao lado do preço antigo.
export const PriceBadge: React.FC<{
  delay?: number;
  size?: number;
}> = ({ delay = 0, size = sizes.precoPor }) => (
  <Pop delay={delay}>
    <div
      style={{
        fontFamily: fonts.family,
        color: colors.petroleum,
        lineHeight: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: size,
          letterSpacing: -4,
          whiteSpace: "nowrap",
        }}
      >
        {offer.precoPorTxt}
      </span>
    </div>
  </Pop>
);

// "ou 18x de" em cima e "R$ 400" em 180 px
export const InstallmentHero: React.FC<{ delay?: number; size?: number }> = ({
  delay = 0,
  size = sizes.parcela,
}) => (
  <Rise delay={delay}>
    <div
      style={{
        fontFamily: fonts.family,
        color: colors.petroleum,
        lineHeight: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 48, color: colors.ink }}>
        ou {offer.parcelas}x de
      </span>
      <span
        style={{
          fontWeight: 800,
          fontSize: size,
          letterSpacing: -3,
          whiteSpace: "nowrap",
        }}
      >
        R$ {offer.valorParcela}
      </span>
    </div>
  </Rise>
);

// Selo de desconto em ciano suave
export const DiscountBadge: React.FC<{ delay?: number; size?: number }> = ({
  delay = 0,
  size = 46,
}) => (
  <Pop delay={delay}>
    <div
      style={{
        display: "inline-block",
        background: colors.cyan,
        color: colors.ink,
        fontFamily: fonts.family,
        fontWeight: 700,
        fontSize: size,
        padding: `${size * 0.26}px ${size * 0.8}px`,
        borderRadius: 999,
        boxShadow: "0 8px 24px rgba(11,58,91,0.18)",
      }}
    >
      {offer.descontoTxt}
    </div>
  </Pop>
);
