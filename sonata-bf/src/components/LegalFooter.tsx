import React from "react";
import { colors, fonts, sizes } from "../theme";

export const LegalFooter: React.FC<{
  lines: string[];
  color?: string;
  size?: number;
  align?: "left" | "center";
}> = ({ lines, color = colors.slate, size = sizes.legal, align = "center" }) => (
  <div
    style={{
      fontFamily: fonts.family,
      fontWeight: 500,
      fontSize: size,
      lineHeight: 1.3,
      color,
      textAlign: align,
    }}
  >
    {lines.map((l) => (
      <div key={l}>{l}</div>
    ))}
  </div>
);
