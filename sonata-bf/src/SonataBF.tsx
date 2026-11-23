import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { colors, TOTAL_FRAMES } from "./theme";
import { seg, voices, voiceEnd, sfx } from "./data/timeline";
import { S1 } from "./segments/S1";
import { S2 } from "./segments/S2";
import { S3A, S3B } from "./segments/S3";
import { S4 } from "./segments/S4";
import { S5 } from "./segments/S5";
import { S6 } from "./segments/S6";
import { S7 } from "./segments/S7";
import { Selo } from "./components/Selo";
import { Captions } from "./components/Captions";
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

// Entrada suave de cada trecho: desliza 60 px e aparece em 8 frames
const Enter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <AbsoluteFill style={{ opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

const part = (
  from: number,
  dur: number,
  node: React.ReactNode,
  key: string,
  enter = true,
) => (
  <Sequence key={key} from={from} durationInFrames={dur} name={key}>
    {enter ? <Enter>{node}</Enter> : node}
  </Sequence>
);

// Ducking de 12 dB sob a voz: base 0.34, sob a voz 0.085 (-12 dB)
const MUSIC_HIGH = 0.34;
const MUSIC_LOW = MUSIC_HIGH * 0.251;
const musicVolume = (f: number) => {
  const duck = voices.reduce((m, v) => {
    const k = interpolate(f, [v.start - 8, v.start, voiceEnd(v), voiceEnd(v) + 12], [1, 0, 0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return Math.min(m, k);
  }, 1);
  const fade = interpolate(f, [0, 8, TOTAL_FRAMES - 24, TOTAL_FRAMES - 1], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (MUSIC_LOW + (MUSIC_HIGH - MUSIC_LOW) * duck) * fade;
};

export const SonataBF: React.FC<SonataProps> = ({ showSafeZones }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: colors.cream }}>
      {/* Imagem */}
      {part(seg.s1.from, seg.s1.dur, <S1 />, "S1", false)}
      {part(seg.s2.from, seg.s2.dur, <S2 />, "S2")}
      {part(seg.s3a.from, seg.s3a.dur, <S3A />, "S3-beat1")}
      {part(seg.s3b.from, seg.s3b.dur, <S3B />, "S3-beat2")}
      {part(seg.s4.from, seg.s4.dur, <S4 />, "S4")}
      {part(seg.s5.from, seg.s5.dur, <S5 />, "S5")}
      {part(seg.s6.from, seg.s6.dur, <S6 />, "S6")}
      {part(seg.s7.from, seg.s7.dur, <S7 />, "S7")}

      {/* Sobreposições fixas */}
      <Selo />
      <Captions />
      <SafeZoneGuide show={showSafeZones} />

      {/* Áudio: trilha com ducking */}
      <Audio src={staticFile("assets/audio/trilha.mp3")} volume={musicVolume} />

      {/* Voz (Juliana Moreira, ElevenLabs) */}
      {voices.map((v) => (
        <Sequence key={v.id} from={v.start} name={`voz-${v.id}`}>
          <Audio src={staticFile(v.file)} playbackRate={v.rate} volume={1} />
        </Sequence>
      ))}

      {/* Efeitos sonoros */}
      {sfx.map((s, i) => {
        const dur = s.loopFrames ?? 60;
        return (
          <Sequence key={i} from={s.at} durationInFrames={dur} name={`sfx-${i}`}>
            <Audio src={staticFile(s.file)} volume={s.vol} loop={!!s.loopFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
