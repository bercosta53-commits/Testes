import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { MediaWindow } from "../components/MediaWindow";
import { PriceBadge, StrikePrice } from "../components/PriceBadge";
import { Pop, Rise } from "../components/ui";
import { assets, placeholderNames } from "../data/assets";
import { S1_T0 } from "../data/timeline";
import { colors, fonts, grid, safe } from "../theme";

const T0 = S1_T0;

// Abertura de 1 s: marca e Black Friday, antes da voz entrar
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [T0 - 8, T0 + 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logo = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 140, mass: 0.8 } });
  const bf = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  const line = interpolate(frame, [12, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (out <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: "rgba(252,247,239,0.95)",
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
        <div
          style={{
            height: 8,
            width: 520 * line,
            margin: "34px auto 30px",
            borderRadius: 8,
            background: colors.cyan,
          }}
        />
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

export const S1: React.FC = () => (
  <AbsoluteFill>
    <Backdrop image={assets.s1.img} duration={186} />

    {/* Janela: só a cabeça e os ombros da apresentadora, sem texto por cima */}
    <Sequence from={T0}>
      <MediaWindow
        video={assets.s1.video}
        image={assets.s1.img}
        label={placeholderNames.s1}
        hint="Apresentadora, 5 s, lip sync"
        height={570}
        focalY={18}
        durationInFrames={150}
        zoomTo={1.06}
      />
    </Sequence>

    {/* Selo de desconto no canto da janela, sobre a parede */}
    <div style={{ position: "absolute", left: 700, top: 382 }}>
      <Pop delay={T0 + 120} style={{ transform: "rotate(4deg)" }}>
        <div
          style={{
            background: colors.cyan,
            color: colors.ink,
            fontFamily: fonts.family,
            fontWeight: 700,
            fontSize: 34,
            lineHeight: 1.12,
            padding: "12px 24px",
            borderRadius: 28,
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(11,58,91,0.25)",
          }}
        >
          Mais de R$ 3 mil
          <br />
          de desconto
        </div>
      </Pop>
    </div>

    {/* Lettering abaixo da janela */}
    <div
      style={{
        position: "absolute",
        left: safe.side,
        width: grid.w,
        top: 952,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Rise delay={T0 + 4}>
        <div
          style={{
            fontFamily: fonts.family,
            fontWeight: 800,
            fontSize: 82,
            letterSpacing: 1,
            color: colors.petroleum,
            lineHeight: 1.05,
            whiteSpace: "nowrap",
          }}
        >
          RECARREGÁVEL
        </div>
      </Rise>
      <div style={{ marginTop: 6 }}>
        <StrikePrice delay={T0 + 30} strikeAt={T0 + 44} size={54} />
      </div>
      <PriceBadge delay={T0 + 88} />
    </div>

    <Intro />
  </AbsoluteFill>
);
