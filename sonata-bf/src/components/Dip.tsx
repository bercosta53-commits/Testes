import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";

// Mergulho suave no creme (corte entre momentos do mesmo tipo). Pico no frame `at`.
export const Dip: React.FC<{ at: number; half?: number }> = ({ at, half = 6 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - half, at, at + half], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: colors.cream, opacity: o, pointerEvents: "none" }} />;
};
