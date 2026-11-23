import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, fonts, grid, safe } from "../theme";
import { seloFixo } from "../data/offer";

// Selo fixo de S1 a S7, no topo da zona segura
export const Selo: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        left: safe.side,
        right: safe.side,
        top: grid.seloTop,
        height: grid.seloH,
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
          fontSize: 36,
          padding: "6px 30px",
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
