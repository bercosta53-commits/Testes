import React from "react";
import { AbsoluteFill } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { BenefitList } from "../components/BenefitList";
import { MediaWindow } from "../components/MediaWindow";
import { Rise } from "../components/ui";
import { assets, placeholderNames } from "../data/assets";
import { colors, fonts } from "../theme";

// Beat 1: mesa de domingo, a mãe de fora da conversa. Trecho 0 a 5 s do vídeo. Tom frio.
// Janela grande: ninguém coberto, só a legenda abaixo.
export const S3A: React.FC = () => (
  <AbsoluteFill>
    <Backdrop image={assets.s3a.img} duration={148} />
    <MediaWindow
      video={assets.s3a.video}
      image={assets.s3a.img}
      label={placeholderNames.s3a}
      hint="Usar o trecho de 0 a 5 s"
      height={970}
      focalY={35}
      startFromSec={0}
      durationInFrames={148}
      zoomTo={1.09}
      tone="cold"
    />
  </AbsoluteFill>
);

// Beat 2: no sofá, a mãe ri com o neto. Trecho 4 a 9 s. Tom quente.
// Janela menor; os três benefícios entram um a um abaixo dela.
export const S3B: React.FC = () => (
  <AbsoluteFill>
    <Backdrop image={assets.s3b.img} duration={148} />
    <MediaWindow
      video={assets.s3b.video}
      image={assets.s3b.img}
      label={placeholderNames.s3b}
      hint="Usar o trecho de 4 a 9 s"
      height={650}
      focalY={30}
      startFromSec={4}
      durationInFrames={148}
      zoomTo={1.07}
      tone="warm"
    />
    <div style={{ position: "absolute", left: 0, right: 0, top: 986, display: "flex", justifyContent: "center" }}>
      <Rise delay={6}>
        <div
          style={{
            background: colors.terracotta,
            color: colors.white,
            fontFamily: fonts.family,
            fontWeight: 700,
            fontSize: 42,
            padding: "8px 32px",
            borderRadius: 999,
            border: `3px solid ${colors.white}`,
            boxShadow: "0 10px 26px rgba(8,40,66,0.25)",
          }}
        >
          Com o aparelho, ela volta
        </div>
      </Rise>
    </div>
    <div style={{ position: "absolute", left: 65, width: 950, top: 1052 }}>
      <BenefitList
        size={46}
        items={[
          { text: "Responder o neto", delay: 24 },
          { text: "Atender o telefone", delay: 60 },
          { text: "Entender a mesa inteira", delay: 96 },
        ]}
      />
    </div>
  </AbsoluteFill>
);
