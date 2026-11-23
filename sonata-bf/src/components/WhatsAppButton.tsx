import React from "react";
import { useCurrentFrame } from "remotion";
import { fonts } from "../theme";
import { Pop } from "./ui";

const Icon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2.5a9.5 9.5 0 0 0-8.1 14.4L2.7 21.3l4.500-1.200A9.500 9.500 0 1 0 12 2.500z"
      stroke="#fff"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <path
      fill="#fff"
      d="M16.600 14.700c-.2-.1-1.300-.6-1.500-.7-.2-.1-.3-.1-.5.100l-.7.900c-.1.200-.3.200-.5.100-1.300-.6-2.200-1.200-3-2.600-.2-.3.200-.3.600-1 .1-.1 0-.3 0-.4l-.7-1.600c-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.4.100-.6.300-.2.200-.8.800-.8 1.900s.8 2.200.9 2.300c.1.200 1.600 2.500 3.900 3.500 1.400.6 2 .6 2.700.5.400-.1 1.300-.5 1.500-1.100.2-.5.200-1 .1-1.100-.1-.1-.2-.2-.5-.3z"
    />
  </svg>
);

export const WhatsAppButton: React.FC<{
  delay?: number;
  label?: string;
  pulse?: boolean;
  size?: number;
}> = ({ delay = 0, label = "Chamar no WhatsApp", pulse = false, size = 56 }) => {
  const frame = useCurrentFrame();
  const k = pulse ? 1 + 0.035 * Math.sin((frame / 30) * Math.PI * 2 * 1.2) : 1;
  return (
    <Pop delay={delay}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 22,
          background: "#1FA855",
          color: "#fff",
          fontFamily: fonts.family,
          fontWeight: 700,
          fontSize: size,
          padding: `${size * 0.4}px ${size * 0.8}px`,
          borderRadius: 999,
          boxShadow: "0 16px 40px rgba(8,40,66,0.32)",
          border: "4px solid rgba(255,255,255,0.9)",
          transform: `scale(${k})`,
        }}
      >
        <Icon size={size * 1.1} />
        <span>{label}</span>
      </div>
    </Pop>
  );
};
