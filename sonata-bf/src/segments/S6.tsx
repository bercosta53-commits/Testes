import React from "react";
import { AbsoluteFill } from "remotion";
import { MediaFill } from "../components/MediaFill";
import { WhatsAppButton } from "../components/WhatsAppButton";
import { assets, placeholderNames } from "../data/assets";
import { seg } from "../data/timeline";

// VÍDEO: a apresentadora chama para o teste. Só o botão pequeno; a frase está na legenda.
export const S6: React.FC = () => (
  <AbsoluteFill>
    <MediaFill
      video={assets.s6.video}
      image={assets.s6.img}
      label={placeholderNames.s6}
      hint="Apresentadora estende o celular, 3 s"
      durationInFrames={seg.s6.dur}
      focalY={30}
      zoomTo={1.05}
    />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,40,66,0) 58%, rgba(8,40,66,0.38) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", justifyContent: "center" }}>
      <WhatsAppButton delay={30} label="Teste gratuito" size={40} />
    </div>
  </AbsoluteFill>
);
