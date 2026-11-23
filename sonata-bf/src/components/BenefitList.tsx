import React from "react";
import { colors, fonts } from "../theme";
import { Rise } from "./ui";

const Check: React.FC = () => (
  <svg width={64} height={64} viewBox="0 0 64 64">
    <circle cx={32} cy={32} r={30} fill={colors.cyan} />
    <path
      d="M18 33 L28 43 L46 22"
      stroke={colors.ink}
      strokeWidth={7}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Itens que entram um a um (delays em frames locais)
export const BenefitList: React.FC<{
  items: { text: string; delay: number }[];
  size?: number;
}> = ({ items, size = 64 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
    {items.map((it) => (
      <Rise key={it.text} delay={it.delay} dy={40}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            background: "rgba(252,247,239,0.94)",
            border: `3px solid ${colors.white}`,
            borderRadius: 36,
            padding: "22px 34px",
            boxShadow: "0 14px 36px rgba(8,40,66,0.22)",
            fontFamily: fonts.family,
            fontWeight: 700,
            fontSize: size,
            color: colors.ink,
            lineHeight: 1.1,
          }}
        >
          <Check />
          <span>{it.text}</span>
        </div>
      </Rise>
    ))}
  </div>
);
