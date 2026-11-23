import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { MediaFill } from "../components/MediaFill";
import { DiscountBadge, PriceBadge, StrikePrice } from "../components/PriceBadge";
import { Selo } from "../components/Selo";
import { Rise, cardStyle } from "../components/ui";
import { assets, placeholderNames } from "../data/assets";
import { S1_T0, seg } from "../data/timeline";
import { colors, fonts, safe } from "../theme";

const T0 = S1_T0;

// Abertura de 1 s: marca e Black Friday, antes da voz entrar
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [T0 - 8, T0 + 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logo = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 140, mass: 0.8 } });
  const bf = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  const line = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (out <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: "rgba(252,247,239,0.97)",
        opacity: out,
        alignItems: "center",
        justifyContent: "center",
        transform: `translateY(${(1 - out) * -40}px)`,
      }}
    >
      <div style={{ textAlign: "center", marginTop: -60 }}>
        <div style={{ transform: `scale(${0.7 + 0.3 * logo})`, opacity: logo }}>
          {assets.logo ? (
            <Img src={assets.logo} style={{ width: 640 }} />
          ) : (
            <div style={{ fontFamily: fonts.family, fontWeight: 800, fontSize: 120, color: colors.petroleum, letterSpacing: 8 }}>
              SONATA
            </div>
          )}
        </div>
        <div style={{ height: 8, width: 520 * line, margin: "34px auto 30px", borderRadius: 8, background: colors.cyan }} />
        <div
          style={{
            fontFamily: fonts.family,
            fontWeight: 800,
            fontSize: 150,
            letterSpacing: 2,
            lineHeight: 1,
            color: colors.terracotta,
            opacity: bf,
            transform: `translateY(${(1 - bf) * 40}px)`,
          }}
        >
          Black Friday
        </div>
      </div>
    </AbsoluteFill>
  );
};

// VÍDEO: a apresentadora em tela cheia. Sem lettering: a legenda carrega "Recarregável".
export const S1A: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={T0}>
      <MediaFill
        video={assets.s1.video}
        image={assets.s1.img}
        label={placeholderNames.s1}
        hint="Apresentadora, 5 s, lip sync"
        durationInFrames={150}
        focalY={30}
        zoomTo={1.07}
      />
    </Sequence>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,40,66,0) 58%, rgba(8,40,66,0.38) 100%)" }} />
    <Intro />
  </AbsoluteFill>
);

// CARTÃO: o preço, sozinho, no momento em que a voz o diz
export const S1B: React.FC = () => (
  <AbsoluteFill>
    <Backdrop image={assets.s1.img} duration={seg.s1b.dur} />
    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: 590,
        ...cardStyle,
        padding: "30px 30px 34px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Rise delay={0}>
        <div
          style={{
            fontFamily: fonts.family,
            fontWeight: 800,
            fontSize: 72,
            letterSpacing: 1,
            color: colors.petroleum,
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          RECARREGÁVEL
        </div>
      </Rise>
      <StrikePrice delay={4} strikeAt={12} size={56} />
      <PriceBadge delay={28} />
      <DiscountBadge delay={50} size={42} />
    </div>
    <Selo />
  </AbsoluteFill>
);
