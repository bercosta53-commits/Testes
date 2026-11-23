import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
} from "remotion";
import { colors } from "./theme";
import { seg, voices, voiceEnd, sfx, wipes, TOTAL_FRAMES } from "./data/timeline";
import { S1 } from "./segments/S1";
import { S2 } from "./segments/S2";
import { S3A, S3B } from "./segments/S3";
import { S4 } from "./segments/S4";
import { S5 } from "./segments/S5";
import { S6 } from "./segments/S6";
import { S7 } from "./segments/S7";
import { Selo } from "./components/Selo";
import { Captions } from "./components/Captions";
import { WaveWipe } from "./components/WaveWipe";
import { SafeZoneGuide } from "./components/SafeZoneGuide";

export type SonataProps = { showSafeZones: boolean };

// Poppins embutida (sem rede)
const useFonts = () => {
  const [handle] = useState(() => delayRender("fontes Poppins"));
  useEffect(() => {
    Promise.all(
      [400, 500, 600, 700, 800].map(async (w) => {
        const f = new FontFace(
          "Poppins",
          `url(${staticFile(`fonts/poppins-latin-${w}-normal.woff2`)}) format("woff2")`,
          { weight: String(w) },
        );
        await f.load();
        document.fonts.add(f);
      }),
    )
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [handle]);
};

const part = (s: { from: number; dur: number }, node: React.ReactNode, key: string) => (
  <Sequence key={key} from={s.from} durationInFrames={s.dur} name={key}>
    {node}
  </Sequence>
);

// Trilha: sempre audível como cama (-12 dB sob a voz), abre na abertura de marca e fecha no fim.
// Antes ela ficava -21 dB o tempo todo porque a voz cobre quase o vídeo inteiro.
const MUSIC_BED = 0.3; // sob a voz
const MUSIC_UP = 0.85; // abertura e respiros
const musicVolume = (f: number) => {
  const duck = voices.reduce((m, v) => {
    const k = interpolate(f, [v.start - 8, v.start, voiceEnd(v), voiceEnd(v) + 14], [1, 0, 0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return Math.min(m, k);
  }, 1);
  const fade = interpolate(f, [0, 6, TOTAL_FRAMES - 30, TOTAL_FRAMES - 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (MUSIC_BED + (MUSIC_UP - MUSIC_BED) * duck) * fade;
};

export const SonataBF: React.FC<SonataProps> = ({ showSafeZones }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: colors.cream }}>
      {part(seg.s1, <S1 />, "S1")}
      {part(seg.s2, <S2 />, "S2")}
      {part(seg.s3a, <S3A />, "S3-beat1")}
      {part(seg.s3b, <S3B />, "S3-beat2")}
      {part(seg.s4, <S4 />, "S4")}
      {part(seg.s5, <S5 />, "S5")}
      {part(seg.s6, <S6 />, "S6")}
      {part(seg.s7, <S7 />, "S7")}

      {/* Cortes: onda do KV, centro no frame do corte */}
      {wipes.map((w) => (
        <Sequence key={w} from={Math.max(0, w - 12)} durationInFrames={24} name={`onda-${w}`}>
          <WaveWipe at={12} />
        </Sequence>
      ))}

      <Selo />
      <Captions />
      <SafeZoneGuide show={showSafeZones} />

      <Audio src={staticFile("assets/audio/trilha.mp3")} volume={musicVolume} />

      {voices.map((v) => (
        <Sequence key={v.id} from={v.start} name={`voz-${v.id}`}>
          <Audio src={staticFile(v.file)} playbackRate={v.rate} volume={1} />
        </Sequence>
      ))}

      {sfx.map((s, i) => (
        <Sequence key={i} from={s.at} durationInFrames={45} name={`sfx-${i}`}>
          <Audio src={staticFile(s.file)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
