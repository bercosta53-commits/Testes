import React from "react";
import { AbsoluteFill } from "remotion";
import { bands, colors, fonts, safe } from "../theme";
import { seloFixo } from "../data/offer";

// Selo fixo de S1 a S7, dentro da zona segura
export const Selo: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: bands.seloTop,
        height: bands.seloHeight,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: colors.cream,
          color: colors.ink,
          fontFamily: fonts.family,
          fontWeight: 700,
          fontSize: 40,
          padding: "8px 34px",
          borderRadius: 999,
          border: `3px solid ${colors.white}`,
          boxShadow: "0 8px 22px rgba(8,40,66,0.22)",
          whiteSpace: "nowrap",
        }}
      >
        {seloFixo}
      </div>
    </div>
  </AbsoluteFill>
);
