import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { DeviceArt } from "../components/DeviceArt";
import { SoundWave } from "../components/SoundWave";
import { BluetoothLink } from "../components/BluetoothLink";
import { Rise, cardStyle } from "../components/ui";
import { assets } from "../data/assets";
import { colors, fonts, safe } from "../theme";

const Title: React.FC<{ main: string; sub?: string }> = ({ main, sub }) => (
  <div style={{ textAlign: "center", fontFamily: fonts.family }}>
    <Rise delay={0}>
      <div style={{ fontWeight: 800, fontSize: 84, color: colors.petroleum, lineHeight: 1.05 }}>
        {main}
      </div>
    </Rise>
    {sub ? (
      <Rise delay={26}>
        <div style={{ fontWeight: 600, fontSize: 52, color: colors.terracotta, marginTop: 10 }}>
          {sub}
        </div>
      </Rise>
    ) : null}
  </div>
);

// (a) recarga: o par desce no estojo e o LED verde pulsa, sem números
const DemoRecarga: React.FC = () => {
  const frame = useCurrentFrame();
  const lift = interpolate(frame, [4, 26], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <>
      <Title main="Recarrega no estojo" />
      <div style={{ marginTop: 40 }}>
        <DeviceArt lift={lift} ledOn={frame >= 24} width={700} />
      </div>
    </>
  );
};

// (b) som: onda cheia de ruído vira linha limpa
const DemoSom: React.FC = () => (
  <>
    <Title main="Som natural" sub="Sem chiado" />
    <div style={{ marginTop: 70 }}>
      <SoundWave start={8} end={34} />
    </div>
  </>
);

// (c) conexão: celular liga ao aparelho
const DemoConexao: React.FC = () => (
  <>
    <Title main="Conecta no celular" />
    <div style={{ marginTop: 90 }}>
      <BluetoothLink connectAt={24} />
    </div>
  </>
);

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 5, 45, 50], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        opacity: a,
              }}
    >
      <div
        style={{
          position: "absolute",
          left: safe.side,
          right: safe.side,
          top: 440,
          height: 720,
          ...cardStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "44px 30px",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const S4: React.FC = () => (
  <AbsoluteFill>
    {/* fundo: sala da cena de volta, desfocada e clareada */}
    <Backdrop image={assets.s3b.img} duration={150} />
    <Sequence from={0} durationInFrames={50} layout="none">
      <Stage><DemoRecarga /></Stage>
    </Sequence>
    <Sequence from={50} durationInFrames={50} layout="none">
      <Stage><DemoSom /></Stage>
    </Sequence>
    <Sequence from={100} durationInFrames={50} layout="none">
      <Stage><DemoConexao /></Stage>
    </Sequence>
  </AbsoluteFill>
);
