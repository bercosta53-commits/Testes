import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, useCurrentFrame, interpolate } from "remotion";
import { colors, fonts } from "../theme";

// Placeholder visível enquanto o arquivo real não chega
export const Placeholder: React.FC<{ label: string; hint?: string }> = ({
  label,
  hint,
}) => (
  <AbsoluteFill
    style={{
      background: `repeating-linear-gradient(135deg, #F3E6D3 0 36px, #EBDAC2 36px 72px)`,
      alignItems: "center",
      justifyContent: "center",
      fontFamily: fonts.family,
    }}
  >
    <div
      style={{
        background: "rgba(255,255,255,0.85)",
        border: `4px dashed ${colors.terracotta}`,
        borderRadius: 28,
        padding: "28px 40px",
        textAlign: "center",
        color: colors.ink,
        maxWidth: 860,
        transform: "translateY(-120px)",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 40, color: colors.terracotta }}>
        PLACEHOLDER
      </div>
      <div style={{ fontWeight: 600, fontSize: 40, marginTop: 6 }}>{label}</div>
      {hint ? (
        <div style={{ fontWeight: 400, fontSize: 30, marginTop: 8, color: colors.slate }}>
          {hint}
        </div>
      ) : null}
    </div>
  </AbsoluteFill>
);

type Props = {
  video?: string | null;
  image?: string | null;
  label: string;
  hint?: string;
  startFromSec?: number; // trecho do vídeo original
  durationInFrames: number; // quantos frames desse trecho usar
  zoomFrom?: number;
  zoomTo?: number;
  tone?: "cold" | "warm" | "none";
  blur?: number;
  focalY?: number;
};

// Vídeo (descarta o áudio original), senão imagem, senão placeholder.
// 720x1280 ou 1080x1920: cobre o quadro 1080x1920.
export const MediaFill: React.FC<Props> = ({
  video,
  image,
  label,
  hint,
  startFromSec = 0,
  durationInFrames,
  zoomFrom = 1,
  zoomTo = 1.06,
  tone = "none",
  blur = 0,
  focalY = 40,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
    extrapolateRight: "clamp",
  });

  const filter =
    tone === "cold"
      ? "saturate(0.82) brightness(1.02) contrast(0.98)"
      : tone === "warm"
        ? "saturate(1.18) brightness(1.03) contrast(1.02)"
        : "none";

  const fit: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `50% ${focalY}%`,
    transform: `scale(${scale})`,
    filter: `${filter}${blur ? ` blur(${blur}px)` : ""}`.trim(),
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: colors.cream }}>
      {video ? (
        <OffthreadVideo
          src={video}
          muted
          startFrom={Math.round(startFromSec * 30)}
          endAt={Math.round(startFromSec * 30) + durationInFrames}
          style={fit}
        />
      ) : image ? (
        <Img src={image} style={fit} />
      ) : (
        <Placeholder label={label} hint={hint} />
      )}
      {/* Correção de cor: frio na cena de dor, quente na volta */}
      {tone === "cold" ? (
        <AbsoluteFill style={{ background: "rgba(110,150,200,0.12)", mixBlendMode: "multiply" }} />
      ) : null}
      {tone === "warm" ? (
        <AbsoluteFill style={{ background: "rgba(255,185,90,0.14)", mixBlendMode: "soft-light" }} />
      ) : null}
    </AbsoluteFill>
  );
};
