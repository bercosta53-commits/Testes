import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, useCurrentFrame } from "remotion";
import { colors, grid } from "../theme";
import { Placeholder } from "./MediaFill";
import { useEnter } from "./ui";

type Props = {
  video?: string | null;
  image?: string | null;
  label: string;
  hint?: string;
  top?: number;
  height: number;
  focalY?: number; // % vertical do recorte (object-position)
  startFromSec?: number;
  durationInFrames: number;
  zoomFrom?: number;
  zoomTo?: number;
  tone?: "cold" | "warm" | "none";
  delay?: number;
};

// Janela arredondada com a cena. O texto fica fora dela, nunca por cima das pessoas.
export const MediaWindow: React.FC<Props> = ({
  video,
  image,
  label,
  hint,
  top = grid.top,
  height,
  focalY = 30,
  startFromSec = 0,
  durationInFrames,
  zoomFrom = 1.0,
  zoomTo = 1.07,
  tone = "none",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const p = useEnter(delay, 14);
  const zoom = interpolate(frame - delay, [0, durationInFrames], [zoomFrom, zoomTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const filter =
    tone === "cold"
      ? "saturate(0.84) brightness(1.02)"
      : tone === "warm"
        ? "saturate(1.15) brightness(1.03)"
        : "none";
  const media: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `50% ${focalY}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `50% ${focalY}%`,
    filter,
  };
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - grid.w) / 2,
        top: top + (1 - p) * 30,
        width: grid.w,
        height,
        borderRadius: 44,
        overflow: "hidden",
        background: colors.cream,
        border: "5px solid rgba(255,255,255,0.95)",
        boxShadow: "0 24px 60px rgba(8,40,66,0.30)",
        opacity: p,
      }}
    >
      {video ? (
        <OffthreadVideo
          src={video}
          muted
          startFrom={Math.round(startFromSec * 30)}
          endAt={Math.round(startFromSec * 30) + durationInFrames}
          style={media}
        />
      ) : image ? (
        <Img src={image} style={media} />
      ) : (
        <div style={{ position: "absolute", inset: 0, transform: "scale(0.88)" }}>
          <Placeholder label={label} hint={hint} />
        </div>
      )}
      {tone === "cold" ? (
        <AbsoluteFill style={{ background: "rgba(110,150,200,0.12)", mixBlendMode: "multiply" }} />
      ) : null}
      {tone === "warm" ? (
        <AbsoluteFill style={{ background: "rgba(255,185,90,0.14)", mixBlendMode: "soft-light" }} />
      ) : null}
    </div>
  );
};
