import React from "react";
import { AbsoluteFill } from "remotion";
import { safe } from "../theme";

// Ligável na prévia: prop showSafeZones na composição
export const SafeZoneGuide: React.FC<{ show: boolean }> = ({ show }) =>
  show ? (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: safe.side,
          right: safe.side,
          top: safe.top,
          bottom: safe.bottom,
          border: "4px dashed #FF2D55",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: safe.top,
          background: "rgba(255,45,85,0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: safe.bottom,
          background: "rgba(255,45,85,0.18)",
        }}
      />
    </AbsoluteFill>
  ) : null;
