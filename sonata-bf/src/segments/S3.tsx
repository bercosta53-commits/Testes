import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { MediaFill } from "../components/MediaFill";
import { Pop } from "../components/ui";
import { assets, placeholderNames } from "../data/assets";
import { seg } from "../data/timeline";
import { colors, fonts } from "../theme";

const scrim = (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,40,66,0) 55%, rgba(8,40,66,0.42) 100%)" }} />
);

// VÍDEO: mesa de domingo, a mãe de fora da conversa. Trecho 0 a 5 s. Tom frio. Só a legenda.
export const S3A: React.FC = () => (
  <AbsoluteFill>
    <MediaFill
      video={assets.s3a.video}
      image={assets.s3a.img}
      label={placeholderNames.s3a}
      hint="Usar o trecho de 0 a 5 s"
      startFromSec={0}
      durationInFrames={seg.s3a.dur}
      focalY={35}
      zoomTo={1.08}
      tone="cold"
    />
    {scrim}
  </AbsoluteFill>
);

// Frases pequenas, uma por vez, no lugar de uma lista
const phrases = [
  { text: "Com o aparelho, ela volta", from: 6, to: 62, accent: true },
  { text: "Responder o neto", from: 65, to: 99 },
  { text: "Atender o telefone", from: 100, to: 134 },
  { text: "Entender a mesa inteira", from: 135, to: 172 },
];

const Phrase: React.FC = () => {
  const frame = useCurrentFrame();
  const p = phrases.find((x) => frame >= x.from && frame < x.to);
  if (!p) return null;
  const out = interpolate(frame, [p.to - 4, p.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 1300,
        display: "flex",
        justifyContent: "center",
        opacity: out,
      }}
    >
      <Pop key={p.text} delay={p.from}>
        <div
          style={{
            background: p.accent ? colors.terracotta : "rgba(252,247,239,0.95)",
            color: p.accent ? colors.white : colors.ink,
            fontFamily: fonts.family,
            fontWeight: 700,
            fontSize: 44,
            padding: "10px 34px",
            borderRadius: 999,
            border: `3px solid ${colors.white}`,
            boxShadow: "0 10px 26px rgba(8,40,66,0.28)",
            whiteSpace: "nowrap",
          }}
        >
          {p.text}
        </div>
      </Pop>
    </div>
  );
};

// VÍDEO: no sofá, a mãe ri com o neto. Trecho 4 a 9 s. Tom quente. Uma frase pequena por vez.
export const S3B: React.FC = () => (
  <AbsoluteFill>
    <MediaFill
      video={assets.s3b.video}
      image={assets.s3b.img}
      label={placeholderNames.s3b}
      hint="Usar o trecho de 4 a 9 s"
      startFromSec={4}
      durationInFrames={seg.s3b.dur}
      focalY={35}
      zoomTo={1.06}
      tone="warm"
    />
    {scrim}
    <Phrase />
  </AbsoluteFill>
);
