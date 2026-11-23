import { staticFile } from "remotion";
import { presentAssets } from "./assets.generated";

// Procura assets/<pasta>/<base>.<ext> ignorando maiúsculas e a extensão.
const pick = (folder: "img" | "video" | "audio", base: string) => {
  const re = new RegExp(`^assets/${folder}/${base}\\.[a-z0-9]+$`, "i");
  const hit = presentAssets.find((p) => re.test(p));
  return hit ? staticFile(hit) : null;
};

const pickRe = (folder: "img" | "video", re: RegExp, not?: RegExp) => {
  const hit = presentAssets.find(
    (p) => p.startsWith(`assets/${folder}/`) && re.test(p) && !(not && not.test(p)),
  );
  return hit ? staticFile(hit) : null;
};

export const assets = {
  s1: { video: pick("video", "s1-apresentadora"), img: pick("img", "s1-apresentadora") },
  s6: { video: pick("video", "s6-apresentadora"), img: pick("img", "s6-apresentadora") },
  s3a: { video: pick("video", "s3a-mesa-fora"), img: pick("img", "s3a-mesa-fora") },
  s3b: { video: pick("video", "s3b-sala-sofa"), img: pick("img", "s3b-sala-sofa") },
  s7: { video: pick("video", "s7-loja"), img: pick("img", "loja") },
  // prefere logo.svg/logo.png (versão azul para cartões claros); logo-verde fica de reserva
  logo: pickRe("img", /\/logo\.(svg|png)$/i) ?? pickRe("img", /logo/i),
  // Foto real do par e do carregador (PNG com fundo transparente)
  device: pickRe(
    "img",
    /(aparelho|par|carregador|estojo|device|produto)/i,
    /(apresentadora|mesa|sofa|loja|logo)/i,
  ),
};

export const placeholderNames = {
  s1: "s1-apresentadora.mp4",
  s6: "s6-apresentadora.mp4",
  s3a: "s3a-mesa-fora.mp4",
  s3b: "s3b-sala-sofa.mp4",
  s7: "loja.jpg",
  device: "foto do par + carregador (PNG transparente)",
  logo: "logo.svg",
};
