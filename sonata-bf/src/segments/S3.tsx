import React from "react";
import { AbsoluteFill } from "remotion";
import { MediaFill } from "../components/MediaFill";
import { BenefitList } from "../components/BenefitList";
import { Rise } from "../components/ui";
import { assets, placeholderNames } from "../data/assets";
import { colors, fonts, safe } from "../theme";

// Beat 1: mesa de domingo, a mãe de fora da conversa. Trecho 0 a 5 s do vídeo. Tom frio.
export const S3A: React.FC = () => (
  <AbsoluteFill>
    <MediaFill
      video={assets.s3a.video}
      image={assets.s3a.img}
      label={placeholderNames.s3a}
      hint="Usar o trecho de 0 a 5 s"
      startFromSec={0}
      durationInFrames={150}
      zoomFrom={1}
      zoomTo={1.08}
      tone="cold"
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(8,40,66,0) 55%, rgba(8,40,66,0.4) 100%)",
      }}
    />
  </AbsoluteFill>
);

// Beat 2: no sofá, a mãe ri com o neto. Trecho 4 a 9 s do vídeo. Tom quente.
export const S3B: React.FC = () => (
  <AbsoluteFill>
    <MediaFill
      video={assets.s3b.video}
      image={assets.s3b.img}
      label={placeholderNames.s3b}
      hint="Usar o trecho de 4 a 9 s"
      startFromSec={4}
      durationInFrames={150}
      zoomFrom={1}
      zoomTo={1.06}
      tone="warm"
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(8,40,66,0) 40%, rgba(8,40,66,0.38) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: 690,
      }}
    >
      <Rise delay={8}>
        <div
          style={{
            display: "inline-block",
            background: colors.terracotta,
            color: colors.white,
            fontFamily: fonts.family,
            fontWeight: 700,
            fontSize: 46,
            padding: "10px 34px",
            borderRadius: 999,
            marginBottom: 22,
          }}
        >
          Com o aparelho, ela volta
        </div>
      </Rise>
      <BenefitList
        size={60}
        items={[
          { text: "Responder o neto", delay: 24 },
          { text: "Atender o telefone", delay: 58 },
          { text: "Entender a mesa inteira", delay: 92 },
        ]}
      />
    </div>
  </AbsoluteFill>
);
